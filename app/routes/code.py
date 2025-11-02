from flask import Blueprint, request, session
import dotenv
from pathlib import Path
import json

from app.lib.gemini import EmpathicChatbotClient

bp = Blueprint("code", __name__, url_prefix="/code")


@bp.post("/api-key")
def set_api_key():
    """
    Set the GEMINI_API_KEY environment variable.
    """
    data = json.loads(request.data.decode())
    GEMINI_API_KEY = data["gemini_api_key"]
    env_path = Path(".env")
    with open(env_path, "w") as fp:
        fp.write(f"{GEMINI_API_KEY = }")
    return {"reply": "OK"}


@bp.get("/api-key")
def get_api_key():
    """
    Get the GEMINI_API_KEY environment variable.
    """
    dotenv.load_dotenv(Path(".env"))
    config = {**dotenv.dotenv_values()}
    try:
        return {"reply": config["GEMINI_API_KEY"]}
    except KeyError:
        return {"reply": ""}


@bp.post("/send")
def send():
    """
    Send a message to the chatbot, and return its response.
    """
    data = json.loads(request.data.decode())
    message = data["message"]
    code = data["code"]

    try:
        assert message != ""
        assert code != ""
    except AssertionError:
        return {
            "error": "It seems either your message or code is empty. Please fill it in so I know what you want to discuss!"
        }, 403

    try:
        client = EmpathicChatbotClient()
    except AssertionError:
        return {
            "error": "It seems you did not set the Gemini API key. Please do so by clicking on the API Key button."
        }, 403

    if "message_history" not in session.keys():
        session["message_history"] = []
    session["message_history"].append({"author": "user", "content": message})
    message = EmpathicChatbotClient.Request(
        message_history=session["message_history"], code=code
    )

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
