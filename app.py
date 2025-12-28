from flask import Flask
import os
from config import SECRET_KEY
from models import init_db
from routes import register_routes

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

app = Flask(
    __name__,
    template_folder=os.path.join(BASE_DIR, "templates"),
    static_folder=os.path.join(BASE_DIR, "static")
)

app.secret_key = SECRET_KEY

init_db()
register_routes(app)

if __name__ == "__main__":
    app.run(debug=True)
