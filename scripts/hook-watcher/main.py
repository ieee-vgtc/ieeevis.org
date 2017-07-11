from flask import Flask, request
import json
import subprocess
app = Flask(__name__)

@app.route('/', methods=['POST'])
def handle():
    content = json.loads(request.form["payload"])
    if content["ref"] == "refs/heads/master":
        print "something was pushed to master!"
        subprocess.call("./build-staging")
    elif content["ref"] == "refs/heads/production":
        print "something was pushed to production!"
        subprocess.call("./build-production")
    return "OK."

if __name__ == '__main__':
    app.run(port=1234)
