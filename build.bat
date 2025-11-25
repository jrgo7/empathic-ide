cd app
uv run pyinstaller --onefile --add-data templates:templates --add-data static:static main.py