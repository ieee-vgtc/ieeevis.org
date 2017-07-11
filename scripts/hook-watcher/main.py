from flask import Flask, request
import json
app = Flask(__name__)

@app.route('/', methods=['POST'])
def handle():
    content = json.reads(request.form["payload"])
    if content["head"] == "refs/heads/master":
        print "something was pushed to master!"
    return "OK."

if __name__ == '__main__':
    app.run(port=1234)
