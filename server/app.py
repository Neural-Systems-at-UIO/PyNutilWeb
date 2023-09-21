from flask import Flask, jsonify, render_template, redirect, request, abort,url_for
from PyNutil import PyNutil
import os, requests
from flask_cors import CORS
from dotenv import load_dotenv
from download_functions import download_brains
from waitress import serve

from datetime import datetime
app = Flask(__name__, static_folder="../client/build", static_url_path="/")
CORS(app)


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
        print
        redirect_url = f"http://localhost:3000?{query_params}"
        return redirect(redirect_url)
    else:
        return app.send_static_file("index.html")


@app.route("/list_bucket_content", methods=["POST"])
def list_bucket_content():
    bucket_name = request.args.get("clb-collab-id")
    path = request.args.get("path")
    url = f"https://data-proxy.ebrains.eu/api/v1/buckets/{bucket_name}?prefix={path}&delimiter=%2F&limit=50"
    response = requests.get(url)
    if response.ok:
        return jsonify(response.json())
    else:
        return response



@app.route("/process_brains", methods=["GET"])
def process_brains():
    bucket_name = request.args.get("clb-collab-id")
    brains = request.args.get("brains")
    brains = brains.split(",")
    point_per_object = request.args.get("pointPerObject")
    point_per_pixel = request.args.get("pointPerPixel")
    min_object_size = request.args.get("minObjectSize")
    # get the token from the auth header
    token = eval(request.headers.get("Authorization"))
    token = f"Bearer {token}"
    print(f"token: {token}")

    download_brains(bucket_name, brains)
    pnt = PyNutil.PyNutil(
        volume_path="allen2017",
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

    for brain in brains:
        pnt.segmentation_folder = f"permanent_storage/{bucket_name}/{brain}/"
        pnt.alignment_json = f"permanent_storage/{bucket_name}/{brain}/{brain}.waln"
        pnt.colour = None
        pnt.get_coordinates(object_cutoff=int(min_object_size), method=method)
        pnt.quantify_coordinates()
        pnt.save_analysis(f"permanent_storage/{bucket_name}/{brain}")
        target_folder = f".nesysWorkflowFiles/pointClouds/{brain}/objects_meshview.json"
        file_path =f"permanent_storage/{bucket_name}/{brain}/whole_series_meshview/objects_meshview.json"

        upload_file_to_bucket(bucket_name, file_path, target_folder, token)
        target_folder = f".nesysWorkflowFiles/Quantification/{brain}/counts.csv"
        file_path = f"permanent_storage/{bucket_name}/{brain}/whole_series_report/counts.csv"
        upload_file_to_bucket(bucket_name,  file_path, target_folder,token)


        target_folder = f".nesysWorkflowFiles/alignmentJsons/{brain}.json"

        file_path = f"permanent_storage/{bucket_name}/{brain}/{brain}.json"
        upload_file_to_bucket(bucket_name,  file_path, target_folder,token)

        
    # upload results to bucket

    print(f"point_per_object: {point_per_object}")
    print(f"point_per_pixel: {point_per_pixel}")
    print(f"min_object_size: {min_object_size}")
    print(f"brains: {brains}")
    print(f"bucket_name: {bucket_name}")
    return "ok"

def get_upload_link(bucket_name, save_path, token):
    request_url = f"https://data-proxy.ebrains.eu/api/v1/buckets/{bucket_name}/{save_path}"
    headers = {"Authorization": token, "Content-Type": "application/json", 'x-amz-date': datetime.utcnow().strftime('%a, %d %b %Y %H:%M:%S GMT')}
    print(f"request_url: {request_url}"
          f"headers: {headers}")
    response = requests.put(request_url, headers=headers)
    response.raise_for_status()
    return response

def upload_file_to_bucket(bucket_name, file_path, save_path, token):
    url = get_upload_link(bucket_name, save_path, token)
    print(url.json())
    url = url.json()["url"]
    headers = {
                'x-amz-date': datetime.utcnow().strftime('%a, %d %b %Y %H:%M:%S GMT')
}
    
    print('the request url is: ', url)
    with open(file_path, "rb") as f:
        response = requests.put(url, headers=headers, data=f)
    print(response.content)
    return response




# download ilastik files and waln
@app.route("/test_route/<username>")
def test_route(username):
    return f"Hello {username}"
import ssl

print("FLASK_ENV: ", os.getenv("FLASK_ENV"))
# if __name__ == "__main__":
#     app.run(debug=True)
if __name__ == "__main__":
    if os.getenv("FLASK_ENV") == "development":
        # set port to 8080
        app.run(debug=True,ssl_context='adhoc',  port=8080)
    else:
        serve(app, host="0.0.0.0", port=8080)
