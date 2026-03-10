from flask import Blueprint, request, jsonify, send_from_directory
import os, uuid
from models.question_paper_model import create_question_paper, get_all_question_papers, delete_question_paper, update_question_paper
from utils.auth import token_required

question_paper_bp = Blueprint('question_papers', __name__)

# ── Upload folder ─────────────────────────────────────────────
# We'll use the same uploads directory structure but can organize it if needed
UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), '..', 'uploads', 'question_papers')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

ALLOWED_EXTENSIONS = {'pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# ── Routes ────────────────────────────────────────────────────

@question_paper_bp.route('/', methods=['GET'])
def list_question_papers():
    semester = request.args.get('semester')
    page = request.args.get('page', 1, type=int)
    limit = request.args.get('limit', 10, type=int)
    return jsonify(get_all_question_papers(page, limit, semester))

@question_paper_bp.route('/', methods=['POST'])
@token_required
def add_question_paper(current_user):
    """Handle multipart/form-data file upload."""
    if request.files and 'file' in request.files:
        file = request.files['file']
        title = request.form.get('title', '').strip()
        subject = request.form.get('subject', '').strip()
        semester = request.form.get('semester', '').strip()

        if not file or file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        if not allowed_file(file.filename):
            return jsonify({'error': 'File type not allowed'}), 400
        if not title:
            title = file.filename

        # Build a safe unique filename
        ext = file.filename.rsplit('.', 1)[-1].lower()
        safe_name = f"{uuid.uuid4().hex}.{ext}"
        save_path = os.path.join(UPLOAD_FOLDER, safe_name)
        file.save(save_path)

        qp = create_question_paper({
            'title': title,
            'subject': subject,
            'semester': semester,
            'file_url': f'/api/question-papers/file/{safe_name}',
            'original_filename': file.filename,
        })
        return jsonify(qp), 201

    return jsonify({'error': 'No file provided'}), 400

@question_paper_bp.route('/file/<filename>', methods=['GET'])
def serve_file(filename):
    """Serve uploaded question paper files."""
    return send_from_directory(UPLOAD_FOLDER, filename)

@question_paper_bp.route('/<qp_id>', methods=['DELETE'])
@token_required
def remove_question_paper(current_user, qp_id):
    if current_user['role'] != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403
    if delete_question_paper(qp_id):
        return jsonify({'message': 'Deleted'}), 200
    return jsonify({'error': 'Question paper not found'}), 404

@question_paper_bp.route('/<qp_id>', methods=['PUT'])
@token_required
def edit_question_paper(current_user, qp_id):
    if current_user['role'] != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403
    data = request.get_json()
    res = update_question_paper(qp_id, data)
    if res:
        return jsonify(res), 200
    return jsonify({'error': 'Question paper not found'}), 404
