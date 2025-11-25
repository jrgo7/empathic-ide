from flask import Flask
import os
import sys

def create_app() -> Flask:
    if getattr(sys, 'frozen', False):
        template_folder = os.path.join(sys._MEIPASS, 'templates')
        static_folder = os.path.join(sys._MEIPASS, 'static')
        app = Flask(__name__, template_folder=template_folder, static_folder=static_folder)
    else:
        app = Flask(__name__)
    app.secret_key = "We have to set this to something so we can use sessions"
    from .routes import main, code

    app.register_blueprint(main.bp)
    app.register_blueprint(code.bp)

    return app
