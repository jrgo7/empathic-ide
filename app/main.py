"""
This is used as the starting point for pyinstaller.
Still recommend running the run script instead if developing
"""
from app import create_app

app = create_app()
app.run()