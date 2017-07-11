from flask import Flask, request
app = Flask(__name__)

@app.route('/', methods=['POST'])
def handle():
    content = request.get_json(silent=True)
    print content
    return "OK"

if __name__ == '__main__':
    app.run(port=1234)
