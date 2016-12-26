from flask import Flask
import flask_login

app = Flask(__name__)
app.secret_key = 'Martine50=' 


login_manager = flask_login.LoginManager()

login_manager.init_app(app)



