from flask import Flask


def create_app() -> Flask:
    app = Flask(__name__)
    app.secret_key = "We have to set this to something so we can use sessions"
    from .routes import main, code

    app.register_blueprint(main.bp)
    app.register_blueprint(code.bp)

    return app
