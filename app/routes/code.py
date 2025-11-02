from flask import Blueprint, request, session
import json

from app.lib.gemini import EmpathicChatbotClient

bp = Blueprint("code", __name__, url_prefix="/code")

@bp.post("/send")
def send():
    """
    Send a message to the chatbot, and return its response.
    """
    data = json.loads(request.data.decode())
    message = data['message']
    code = data['code']
    assert message is not None
    assert code is not None

    if 'message_history' not in session.keys():
        session['message_history'] = []
    session['message_history'].append({"author": "user", "content": message})
    message = EmpathicChatbotClient.Request(
        message_history=session['message_history'],
        code=code
    )
    client = EmpathicChatbotClient()
    response = client.respond(message)
    return {"reply": response}


@bp.post("/compile")
def compile():
    """
    Compile code.
    """
    data = json.loads(request.get_data().decode())
    return {"message": "Not implemented"}


@bp.post("/run")
def run():
    """
    Compile code then run it.
    """
    data = json.loads(request.get_data().decode())
    return {"message": "Not implemented"}
