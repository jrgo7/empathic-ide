from flask import Blueprint, render_template

bp = Blueprint("main", __name__)

@bp.get("/")
def home() -> str:
    return render_template("base.html")
