from flask import Flask, jsonify, redirect, request, abort
from PyNutil import PyNutil
import os
import requests
from flask_cors import CORS
from dotenv import load_dotenv
from download_functions import download_brains
from flask_socketio import SocketIO
from datetime import datetime


app = Flask(__name__, static_folder="../client/build", static_url_path="/")
CORS(app)


socketio = SocketIO(app, cors_allowed_origins="*")
app.config["pynutil"] = None
if os.getenv("FLASK_ENV") == "development":
    load_dotenv()

# console log all of the env variables
for key, value in os.environ.items():
    print(f"{key}: {value}")

# In the future we will load all the Atlases here and store them in the app context
# with app.app_context():
#     app.config['pynutil'] = PyNutil.PyNutil(

#     )


@socketio.on("connect")
def handle_connect():
    print("Client connected")
    socketio.emit("message", "Hello, server!")


@socketio.on("message")
def handle_message(data):
    print("Received message:", data)
    socketio.emit("message", data)


def get_token(code):
    target_url = "https://iam.ebrains.eu/auth/realms/hbp/protocol/openid-connect/token"
    redirect_uri = os.getenv("REACT_APP_OIDC_CLIENT_REDIRECT_URL")
    print(f"redirect_uri: {redirect_uri}")
    params = {
        "grant_type": "authorization_code",
        "client_id": os.getenv("REACT_APP_WORKBENCH_OIDC_CLIENT_ID"),
        "code": code,
        "client_secret": os.getenv("REACT_APP_WORKBENCH_OIDC_CLIENT_SECRET"),
        "redirect_uri": f"{redirect_uri}",
    }
    headers = {"Content-Type": "application/x-www-form-urlencoded"}
    response = requests.post(target_url, data=params, headers=headers, timeout=5)
    print(f"response: {response.content}")
    if response.ok:
        token = response.json()["access_token"]
        return token
    else:
        return None


@app.route("/auth", methods=["GET"])
def auth():
    code = request.args.get("code")
    print(f"code: {code}")
    token = get_token(code)
    if token is not None:
        return jsonify(token)
    else:
        abort(400, "Failed to obtain token")


@app.route("/")
def index():
    if os.getenv("FLASK_ENV") == "development":
        query_params = request.query_string.decode("utf-8")
        redirect_url = f"http://localhost:3000?{query_params}"
        return redirect(redirect_url)
    else:
        return app.send_static_file("index.html")


@app.route("/list_bucket_content", methods=["POST"])
def list_bucket_content():
    bucket_name = request.args.get("clb-collab-id")
    path = request.args.get("file_path")
    url = f"https://data-proxy.ebrains.eu/api/v1/buckets/{bucket_name}?prefix={path}&delimiter=%2F&limit=50"
    response = requests.get(url)
    if response.ok:
        return jsonify(response.json())
    else:
        return response


@app.route("/download_file", methods=["GET"])
def download_file():
    # get all the files that are present in permanent_storage
    bucket_name = request.args.get("clb-collab-id")
    title = request.args.get("title")
    method = request.args.get("method")
    atlas = request.args.get("atlas")
    path = "permanent_storage/" + bucket_name + "/" + title + "/" + method + "/" + atlas
    print(f"path: {path}")
    # store folder as zip
    if os.path.isdir(path):
        print("is dir")
        os.system(f"zip -rj {title}_{method}_{atlas}.zip {path}")
    # download file
    with open(f"{title}_{method}_{atlas}.zip", "rb") as f:
        data = f.read()
    return data


@app.route("/process_brains", methods=["GET"])
def process_brains():
    bucket_name = request.args.get("clb-collab-id")
    brains = request.args.get("brains")
    brains = brains.split(",")
    point_per_object = request.args.get("pointPerObject") == 'true'
    point_per_pixel = request.args.get("pointPerPixel") == 'true'
    min_object_size = request.args.get("minObjectSize")
    target_atlas = request.args.get("targetAtlas")
    # get the token from the auth header
    token = eval(request.headers.get("Authorization"))
    token = f"Bearer {token}"
    print(f"token: {token}")
    print(f"target_atlas: {target_atlas}")
    print(f"point_per_object: {point_per_object}")
    print(f"point_per_pixel: {point_per_pixel}")

    download_brains(bucket_name, brains)
    pnt = PyNutil.PyNutil(
        volume_path=target_atlas,
        segmentation_folder="",
        alignment_json="",
        colour="auto",
    )
    
    if point_per_object and not point_per_pixel:
        method = "per_object"
    elif point_per_pixel and not point_per_object:
        method = "per_pixel"
    elif point_per_object and point_per_pixel:
        method = "all"
    print(f"brains: {brains}")
    total = len(brains) * 4
    current = 0
    for index, brain in enumerate(brains):
        pnt.segmentation_folder = f"permanent_storage/{bucket_name}/{brain}/"
        pnt.alignment_json = f"permanent_storage/{bucket_name}/{brain}/{brain}.waln"
        pnt.colour = None
        pnt.get_coordinates(object_cutoff=int(min_object_size), method=method)
        current += 1
        out_value = current / total * 100
        socketio.emit("message", out_value)
        pnt.quantify_coordinates()
        if point_per_object:
            savepath = f"permanent_storage/{bucket_name}/{brain}/{min_object_size}px/{target_atlas}/"
            if not os.path.exists(savepath):
                os.makedirs(savepath)
            pnt.save_analysis(savepath)
            target_folder = f".nesysWorkflowFiles/pointClouds/{brain}/min_obj_{min_object_size}px/{target_atlas}/objects_meshview.json"
            file_path = f"{savepath}/whole_series_meshview/objects_meshview.json"
            upload_file_to_bucket(bucket_name, file_path, target_folder, token)
            target_folder = f".nesysWorkflowFiles/Quantification/{brain}/min_obj_{min_object_size}px/{target_atlas}/counts.csv"
            file_path = f"{savepath}/whole_series_report/counts.csv"
            upload_file_to_bucket(bucket_name, file_path, target_folder, token)

        current += 1
        out_value = current / total * 100
        socketio.emit("message", out_value)

        if point_per_pixel:
            savepath = (
                f"permanent_storage/{bucket_name}/{brain}/point_per_pix/{target_atlas}/"
            )
            if not os.path.exists(savepath):
                os.makedirs(savepath)
            pnt.save_analysis(savepath)
            target_folder = f".nesysWorkflowFiles/pointClouds/{brain}/per_pixel/{target_atlas}/pixels_meshview.json"
            file_path = f"{savepath}/whole_series_meshview/pixels_meshview.json"
            upload_file_to_bucket(bucket_name, file_path, target_folder, token)
            target_folder = f".nesysWorkflowFiles/Quantification/{brain}/point_per_pix/{target_atlas}/counts.csv"
            file_path = f"{savepath}/whole_series_report/counts.csv"
            upload_file_to_bucket(bucket_name, file_path, target_folder, token)
        current += 1
        out_value = current / total * 100
        socketio.emit("message", out_value)
        delete_path = f"permanent_storage/{bucket_name}/{brain}/segmentations"
        os.system(f"rm -rf {delete_path}")
        current += 1
        socketio.emit("message", current / total)
    socketio.emit("message", f"Finished")

    return "ok"


def get_upload_link(bucket_name, save_path, token):
    request_url = (
        f"https://data-proxy.ebrains.eu/api/v1/buckets/{bucket_name}/{save_path}"
    )
    headers = {
        "Authorization": token,
        "Content-Type": "application/json",
        "x-amz-date": datetime.utcnow().strftime("%a, %d %b %Y %H:%M:%S GMT"),
    }
    print(f"request_url: {request_url}" f"headers: {headers}")
    response = requests.put(request_url, headers=headers)
    try:
        response.raise_for_status()
    except requests.exceptions.HTTPError as e:
        print(e)
        return None
    return response


def upload_file_to_bucket(bucket_name, file_path, save_path, token):
    url = get_upload_link(bucket_name, save_path, token)
    if url is None:
        return None
    print(url.json())
    url = url.json()["url"]
    headers = {"x-amz-date": datetime.utcnow().strftime("%a, %d %b %Y %H:%M:%S GMT")}

    print("the request url is: ", url)
    with open(file_path, "rb") as f:
        response = requests.put(url, headers=headers, data=f)
    print(response.content)
    return response


# download ilastik files and waln
@app.route("/test_route/<username>")
def test_route(username):
    return f"Hello {username}"


if __name__ == "__main__":
    if os.getenv("FLASK_ENV") == "development":
        # set port to 8080
        app.run(debug=True, ssl_context="adhoc", port=8080)
    else:
        app.run(debug=False, host="0.0.0.0", port=8080)
