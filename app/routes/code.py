from flask import Blueprint, request, session
import dotenv
from pathlib import Path
import json

from app.lib.gemini import EmpathicChatbotClient
from app.lib.crunner import CRunner

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
    user_message = data["message"]
    code = data["code"]
    try:
        assert user_message != ""
        assert code != ""
    except AssertionError:
        return {
            "error": "It seems either your message or code is empty. Please fill both in so I know what you want to discuss!"
        }, 403
    try:
        client = EmpathicChatbotClient()
    except AssertionError:
        return {
            "error": "It seems you did not set the Gemini API key. Please do so by clicking on the API Key button."
        }, 403
    if "message_history" not in session.keys():
        session["message_history"] = []
    
    session["message_history"].append({"author": "user", "content": user_message})
    
    ai_instruction = (
        f"First, read the user's latest message to understand their emotional state: '{user_message}'. "
        "If they express frustration or confusion, your acknowledgement should reflect that before you analyze the code. "
        "Then, analyze the user's code and their message together to provide an empathic response."
    )
    message = EmpathicChatbotClient.Request(
        message_history=session["message_history"],
        code=code,
        instruction=ai_instruction,
    )
    response = client.respond(message)
    
    ai_response_text = f"{response}"

    session["message_history"].append({"author": "assistant", "content": ai_response_text})
    session.modified = True
    
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
    code = data["code"]
    args = data["args"]
    try:
        assert code != ""
    except AssertionError:
        return {
            "error": "It seems your code is empty. Please fill it in so a program can run!"
        }, 403
        
    try:
        client = EmpathicChatbotClient()
    except AssertionError:
        return {
            "error": "It seems you did not set the Gemini API key. Please do so by clicking on the API Key button."
        }, 403
    
    crunner = CRunner()
    crunner.execute_all(code, args)
    
    ai_message = (
        "The user's code ran successfully or failed to compile. As an empathic tutor, please explain this error to the student in simple, encouraging terms. If it ran successfully, acknowledge their success. "
        "Otherwise, acknowledge their effort and guide them to the solution. Avoid technical jargon. "
        f"Here are the args added to the compilation:{args}\n"
        f"Here is the compilation result or error:\n{crunner.output}"
    )
    
    if "message_history" not in session.keys():
        session["message_history"] = []
    
    session["message_history"].append({"author": "user", "content": ai_message})
    
    message = EmpathicChatbotClient.Request(
        message_history=session["message_history"], code=code
    )
    response = client.respond(message)
    
    ai_response_text = f"{response.response}"
    
    session["message_history"].append({"author": "assistant", "content": ai_response_text})
    session.modified = True  
    
    return {"reply": response, "output": crunner.output}