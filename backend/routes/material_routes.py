from flask import Blueprint, request, jsonify, send_from_directory
import os, uuid
from models.material_model import create_material, get_all_materials, delete_material, update_material
from models.notification_model import create_notification
from utils.auth import token_required

material_bp = Blueprint('materials', __name__)

@material_bp.route('/<material_id>', methods=['PUT'])
@token_required
def edit_material(current_user, material_id):
    if current_user['role'] != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403
    data = request.get_json()
    res = update_material(material_id, data)
    if res:
        return jsonify(res), 200
    return jsonify({'error': 'Material not found'}), 404

# ── Upload folder ─────────────────────────────────────────────
UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), '..', 'uploads', 'materials')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

ALLOWED_EXTENSIONS = {'pdf', 'ppt', 'pptx', 'doc', 'docx', 'mp4', 'mkv', 'jpg', 'jpeg', 'png', 'txt', 'zip'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def guess_type(filename):
    ext = filename.rsplit('.', 1)[-1].lower()
    if ext == 'pdf':               return 'PDF'
    if ext in ('ppt', 'pptx'):    return 'PPT'
    if ext in ('mp4', 'mkv'):     return 'Video'
    if ext in ('doc', 'docx'):    return 'Notes'
    return 'Other'

# ── Routes ────────────────────────────────────────────────────

@material_bp.route('/', methods=['GET'])
def list_materials():
    semester = request.args.get('semester')
    mat_type = request.args.get('type')
    exclude = request.args.get('exclude')
    page = request.args.get('page', 1, type=int)
    limit = request.args.get('limit', 10, type=int)
    return jsonify(get_all_materials(page, limit, semester, mat_type, exclude))

@material_bp.route('/pending', methods=['GET'])
@token_required
def list_pending(current_user):
    if current_user['role'] != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403
    page = request.args.get('page', 1, type=int)
    limit = request.args.get('limit', 10, type=int)
    return jsonify(get_all_materials(page, limit, status='pending'))

@material_bp.route('/<material_id>/status', methods=['PUT'])
@token_required
def update_status(current_user, material_id):
    if current_user['role'] != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403
    data = request.get_json()
    new_status = data.get('status')
    if new_status not in ['approved', 'rejected']:
        return jsonify({'error': 'Invalid status'}), 400
    
    updated = update_material(material_id, {'status': new_status})
    if updated:
        # If approved, notify the semester
        if new_status == 'approved':
             create_notification(
                type='material',
                title='Contribution Approved!',
                message=f"A new {updated.get('type')} '{updated.get('title')}' contributed by a student is now available.",
                semester=updated.get('semester', 'All'),
                link='/materials'
            )
        return jsonify(updated), 200
    return jsonify({'error': 'Material not found'}), 404

@material_bp.route('/', methods=['POST'])
@token_required
def add_material(current_user):
    # Only admins can use the standard POST to auto-approve
    if current_user['role'] != 'admin':
        return jsonify({'error': 'Unauthorized. Use /student-upload for contributions.'}), 403
        file    = request.files['file']
        title   = request.form.get('title', '').strip()
        subject = request.form.get('subject', '').strip()
        semester = request.form.get('semester', '').strip()
        mat_type = request.form.get('type', '').strip()

        if not file or file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        if not allowed_file(file.filename):
            return jsonify({'error': 'File type not allowed'}), 400
        if not title:
            title = file.filename  # fall back to filename as title

        # Build a safe unique filename
        ext       = file.filename.rsplit('.', 1)[-1].lower()
        safe_name = f"{uuid.uuid4().hex}.{ext}"
        save_path = os.path.join(UPLOAD_FOLDER, safe_name)
        file.save(save_path)

        material = create_material({
            'title':    title,
            'subject':  subject,
            'semester': semester,
            'type':     mat_type or guess_type(file.filename),
            'file_url': f'/api/materials/file/{safe_name}',
            'original_filename': file.filename,
            'status': 'approved',
            'contributor_name': 'Admin',
            'contributor_email': current_user['email']
        })
        
        # Trigger Notification
        create_notification(
            type='material',
            title='New Material Available!',
            message=f"New {material.get('type')}: '{material.get('title')}' is ready for {material.get('semester')}. Click to view.",
            semester=semester,
            link='/materials'
        )

        return jsonify(material), 201

    material_data['status'] = 'approved'
    material_data['contributor_email'] = current_user['email']
    new_material = create_material(material_data)
    
    # Trigger Notification
    create_notification(
        type='material',
        title='New Material Available!',
        message=f"New {material_data.get('type')}: '{material_data.get('title')}' has been uploaded. Click to view.",
        semester=material_data.get('semester', 'All'),
        link='/materials'
    )
    
    return jsonify(new_material), 201

@material_bp.route('/student-upload', methods=['POST'])
@token_required
def student_upload(current_user):
    """Specific endpoint for students to contribute materials (sets status to pending)."""
    if not request.files or 'file' not in request.files:
        return jsonify({'error': 'No file selected'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    if not allowed_file(file.filename):
        return jsonify({'error': 'File type not allowed'}), 400

    title = request.form.get('title', file.filename).strip()
    subject = request.form.get('subject', '').strip()
    semester = request.form.get('semester', '').strip()
    mat_type = request.form.get('type', '').strip()

    ext = file.filename.rsplit('.', 1)[-1].lower()
    safe_name = f"{uuid.uuid4().hex}.{ext}"
    save_path = os.path.join(UPLOAD_FOLDER, safe_name)
    file.save(save_path)

    material = create_material({
        'title': title,
        'subject': subject,
        'semester': semester,
        'type': mat_type or guess_type(file.filename),
        'file_url': f'/api/materials/file/{safe_name}',
        'original_filename': file.filename,
        'status': 'pending',
        'contributor_name': current_user.get('name', 'Student'),
        'contributor_email': current_user['email']
    })

    return jsonify(material), 201


@material_bp.route('/file/<filename>', methods=['GET'])
def serve_file(filename):
    """Serve uploaded material files."""
    return send_from_directory(UPLOAD_FOLDER, filename)


@material_bp.route('/<material_id>', methods=['DELETE'])
@token_required
def remove_material(current_user, material_id):
    if current_user['role'] != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403
    if delete_material(material_id):
        return jsonify({'message': 'Deleted'}), 200
    return jsonify({'error': 'Material not found'}), 404
