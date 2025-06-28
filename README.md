# Local deploy

1. `$ python3.8 -m venv venv`
2. `$ pip install -r requirements.txt`
3. `$ gunicorn -b localhost:8002 --reload blog.app`
4. starting from frontend/static/index.js:75 change "/api/" => "http:\/\/localhost:8002/"
5. start fileserver `$ python -m http.server 9000 -d frontend/`
6. run chromium in insecure mode to disable CORS `$ chromium --disable-web-security --disable-gpu --user-data-dir=~/chromeTemp` 
7. open http://localhost:9000/
8. enjoy ^_^
