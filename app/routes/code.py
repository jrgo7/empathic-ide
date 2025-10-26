from flask import Blueprint, request
import json

bp = Blueprint("code", __name__, url_prefix="/code")

@bp.post("/send")
def send():
    """
    Send a message to the chatbot, and return its response.
    """
    data = json.loads(request.get_data().decode())
    return {"message": "Not implemented"}


@bp.post("/compile")
def compile():
    """
    Compile code and save it.
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
