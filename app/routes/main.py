from flask import Blueprint, render_template, session

bp = Blueprint("main", __name__)

@bp.get("/")
def home() -> str:
    return render_template("base.html")

@bp.post("/clearchat")
def clear_chat() -> str:
    session["message_history"] = []
    return "OK"
