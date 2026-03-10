import requests
from rasa_sdk import Action, Tracker
from rasa_sdk.executor import CollectingDispatcher
from rasa_sdk.events import SlotSet
import re
import os

BACKEND_URL = os.environ.get('BACKEND_URL', 'http://127.0.0.1:5000').rstrip('/')

class ActionGetEvents(Action):
    def name(self) -> str:
        return "action_get_events"

    def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: dict):
        print("DEBUG: ActionGetEvents triggered")
        try:
            res = requests.get(f"{BACKEND_URL}/api/events", timeout=10)
            data = res.json()
            events = data.get('items', [])
            
            if not events:
                dispatcher.utter_message(text="There are no upcoming events at the moment.")
                return []

            message = "Here are the upcoming campus events:\n"
            for event in events:
                message += f"• {event.get('title', 'Untitled')} ({event.get('date', '')})\n"
            
            message += "\nYou can find more details on the Events page!"
            dispatcher.utter_message(text=message)
        except Exception as e:
            dispatcher.utter_message(text="I'm having trouble fetching events right now.")
        return []

class ActionGetMaterials(Action):
    def name(self) -> str:
        return "action_get_materials"

    def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: dict):
        subject = None
        semester = None
        entities = tracker.latest_message.get('entities', [])
        for e in entities:
            if e['entity'] == 'subject': subject = e['value']
            if e['entity'] == 'semester': semester = e['value']
        
        if not subject: subject = tracker.get_slot("subject")
        if not semester: semester = tracker.get_slot("semester")
        
        # Fall back to metadata context
        if not semester:
            semester = tracker.latest_message.get('metadata', {}).get('semester')

        normalized_sem = None
        if semester:
            sem_val = str(semester).upper()
            match = re.search(r'(VIII|VII|VI|V|IV|III|II|I)', sem_val)
            if match:
                normalized_sem = match.group(1)
            else:
                num_match = re.search(r'([1-8])', sem_val)
                if num_match:
                    mapping = {"1":"I", "2":"II", "3":"III", "4":"IV", "5":"V", "6":"VI", "7":"VII", "8":"VIII"}
                    normalized_sem = mapping.get(num_match.group(1))

        try:
            url = f"{BACKEND_URL}/api/materials/"
            params = {'exclude': 'Question Paper'}
            if normalized_sem: params['semester'] = normalized_sem
            
            res = requests.get(url, params=params, timeout=10)
            data = res.json()
            materials = data.get('items', [])
            
            if not materials:
                dispatcher.utter_message(text=f"No study materials found{f' for Semester {normalized_sem}' if normalized_sem else ''}.")
                return [SlotSet("subject", None), SlotSet("semester", None)]

            filtered = materials
            if subject:
                s_lower = subject.lower()
                filtered = [m for m in materials if s_lower in m.get('subject', '').lower() or s_lower in m.get('title', '').lower()]

            if not filtered:
                dispatcher.utter_message(text=f"I couldn't find materials for {subject}. Check the Materials page for more!")
            else:
                message = f"Here are the materials{f' for {subject}' if subject else ''}{f' (Semester {normalized_sem})' if normalized_sem else ''}:\n"
                for mat in filtered[:5]:
                    link = f"{BACKEND_URL}{mat.get('fileUrl', '')}"
                    message += f"• {mat.get('title', 'Untitled')} 🔗 [View]({link})\n"
                dispatcher.utter_message(text=message)
        except:
            dispatcher.utter_message(text="I'm having trouble getting the materials list.")
        return [SlotSet("subject", None), SlotSet("semester", None)]

class ActionGetQuestionPapers(Action):
    def name(self) -> str:
        return "action_get_question_papers"

    def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: dict):
        subject = None
        semester = None
        entities = tracker.latest_message.get('entities', [])
        for e in entities:
            if e['entity'] == 'subject': subject = e['value']
            if e['entity'] == 'semester': semester = e['value']
        
        if not subject: subject = tracker.get_slot("subject")
        if not semester: semester = tracker.get_slot("semester")
        
        # Fall back to metadata context
        if not semester:
            semester = tracker.latest_message.get('metadata', {}).get('semester')

        # Refine subject: avoid extracting common words like 'paper' as subject
        if subject and subject.lower() in ['paper', 'papers', 'question', 'question paper']:
            subject = None

        normalized_sem = None
        if semester:
            sem_val = str(semester).upper()
            match = re.search(r'(VIII|VII|VI|V|IV|III|II|I)', sem_val)
            if match:
                normalized_sem = match.group(1)
            else:
                num_match = re.search(r'([1-8])', sem_val)
                if num_match:
                    mapping = {"1":"I", "2":"II", "3":"III", "4":"IV", "5":"V", "6":"VI", "7":"VII", "8":"VIII"}
                    normalized_sem = mapping.get(num_match.group(1))

        try:
            url = f"{BACKEND_URL}/api/question-papers/"
            params = {}
            if normalized_sem: params['semester'] = normalized_sem
            
            res = requests.get(url, params=params, timeout=10)
            data = res.json()
            papers = data.get('items', [])
            
            if not papers:
                dispatcher.utter_message(text=f"No question papers found{f' for Semester {normalized_sem}' if normalized_sem else ''}.")
                return [SlotSet("subject", None), SlotSet("semester", None)]

            filtered = papers
            if subject:
                s_lower = subject.lower()
                filtered = [p for p in papers if s_lower in p.get('subject', '').lower() or s_lower in p.get('title', '').lower()]

            if not filtered:
                dispatcher.utter_message(text=f"I couldn't find question papers for {subject}. Check the Question Papers page!")
            else:
                message = f"Found these question papers{f' for {subject}' if subject else ''}{f' (Semester {normalized_sem})' if normalized_sem else ''}:\n"
                for p in filtered[:5]:
                    link = f"{BACKEND_URL}{p.get('fileUrl', '')}"
                    message += f"• {p.get('title', 'Untitled')} [{p.get('subject', '')}] 🔗 [View Paper]({link})\n"
                dispatcher.utter_message(text=message)
        except:
            dispatcher.utter_message(text="I'm having trouble getting the question papers.")
        return [SlotSet("subject", None), SlotSet("semester", None)]

class ActionGetAnnouncements(Action):
    def name(self) -> str:
        return "action_get_announcements"

    def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: dict):
        query = tracker.latest_message.get('text', '').lower()
        try:
            res = requests.get(f"{BACKEND_URL}/api/announcements/", timeout=10)
            announcements = res.json().get('items', [])
            
            # Sort by entry date (descending)
            announcements.sort(key=lambda x: x.get('date', ''), reverse=True)

            # Scoring matching
            stop_words = {"when", "is", "the", "of", "for", "in", "to", "on", "a", "at", "what", "show", "tell", "any", "date"}
            query_words = [w.strip("?!.,") for w in query.split() if w not in stop_words and len(w) > 2]

            scored = []
            for ann in announcements:
                title = ann.get('title', '').lower()
                content = ann.get('content', '').lower()
                score = 0
                for word in query_words:
                    if word in title: score += 5
                    if word in content: score += 2
                if score > 0:
                    scored.append({'item': ann, 'score': score})

            scored.sort(key=lambda x: x['score'], reverse=True)

            # Detect if it's a general request for announcements
            general_words = {"recent", "latest", "all", "announcements", "notices", "updates", "what", "are", "show"}
            is_general = any(word in query for word in ["recent", "latest", "all", "what are", "show me"]) or len(query_words) <= 1

            if scored and not is_general:
                # Show top match with details for specific queries
                top = scored[0]['item']
                msg = f"📢 {top.get('title')}\n\n{top.get('content')}"
                if top.get('date'): msg += f"\n\n📅 Date: {top.get('date')}"
                dispatcher.utter_message(text=msg)
            else:
                # Show a list for general queries or as fallback
                message = "Here are the latest campus announcements:\n"
                # Sort by date if available, or just latest in items
                display_items = announcements[:3]
                for ann in display_items:
                    message += f"• {ann.get('title')}\n"
                
                dispatcher.utter_message(text=message + "\nYou can check the Announcements page for full details!")
        except Exception as e:
            print(f"DEBUG: Error in ActionGetAnnouncements: {e}")
            dispatcher.utter_message(text="Trouble fetching announcements.")
        return []

class ActionGetPlacements(Action):
    def name(self) -> str:
        return "action_get_placements"

    def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: dict):
        query = tracker.latest_message.get('text', '').lower()
        try:
            res = requests.get(f"{BACKEND_URL}/api/placements/", timeout=10)
            items = res.json().get('items', [])
            
            if not items:
                dispatcher.utter_message(text="No active recruitment drives.")
                return []

            # Scoring matching
            stop_words = {"show", "tell", "any", "me", "about", "link", "apply"}
            query_words = [w.strip("?!.,") for w in query.split() if w not in stop_words and len(w) > 2]

            scored = []
            for it in items:
                company = it.get('company', '').lower()
                role = it.get('role', '').lower()
                score = 0
                for word in query_words:
                    if word in company: score += 10
                    if word in role: score += 5
                if score > 0:
                    scored.append({'item': it, 'score': score})

            scored.sort(key=lambda x: x['score'], reverse=True)

            if scored:
                top = scored[0]['item']
                msg = f"{top.get('company')}\nRole: {top.get('role')}\nPackage: {top.get('package')}\n"
                if top.get('deadline'): msg += f"Apply by: {top.get('deadline')}\n"
                link = top.get('jobLink') or top.get('job_link')
                if link: msg += f"🔗 [Apply Now]({link})"
                dispatcher.utter_message(text=msg)
            else:
                message = "Here are the latest placement drives:\n"
                for it in items[:3]:
                    message += f"• {it.get('company')} - {it.get('role')}\n"
                dispatcher.utter_message(text=message + "\nCheck the Placements page for more!")
        except Exception as e:
            print(f"DEBUG: Error in ActionGetPlacements: {e}")
            dispatcher.utter_message(text="Trouble fetching placements.")
        return []

class ActionFallback(Action):
    def name(self) -> str:
        return "action_fallback_to_llm"
    def run(self, dispatcher, tracker, domain):
        dispatcher.utter_message(text="Let me find that out for you...")
        return []
