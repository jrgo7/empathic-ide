from flask import Flask


def create_app() -> Flask:
    app = Flask(__name__)

    from .routes import main, code

    app.register_blueprint(main.bp)
    app.register_blueprint(code.bp)

    return app
