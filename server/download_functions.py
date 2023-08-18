import os
import requests
import zipfile

def download_file(url, file_path):
    response = requests.get(url)
    if response.ok:
        with open(file_path, "wb") as f:
            f.write(response.content)
        return True
    else:
        print(f"Failed to download {file_path}")
        return False

def unzip_file(file_path, destination_path):
    with zipfile.ZipFile(file_path, 'r') as zip_ref:
        zip_ref.extractall(destination_path)


def download_brain_files(bucket_name, brain):
    brain_files_url = f"https://data-proxy.ebrains.eu/api/v1/buckets/{bucket_name}?prefix=.nesysWorkflowFiles/ilastikOutputs/{brain}/"
    response = requests.get(brain_files_url)
    if response.ok:
        brain_files = response.json()['objects']
        for file in brain_files:
            file_name = file['name']
            if file_name.endswith('.dzip'):
                path_removed = os.path.basename(file_name)
                file_url = f"https://data-proxy.ebrains.eu/api/v1/buckets/{bucket_name}/{file_name}?redirect=false"
                redirected_reponse = requests.get(file_url)
                if redirected_reponse.ok:
                    redirected_url = redirected_reponse.json()['url']

                file_path = f"permanent_storage/{bucket_name}/{brain}/segmentations/{path_removed}"
                download_file(redirected_url, file_path)


def download_brain(bucket_name, brain):
    brain_dir = f"permanent_storage/{bucket_name}/{brain}"
    if not os.path.exists(brain_dir):
        os.makedirs(brain_dir)
    segmentation_dir = f"permanent_storage/{bucket_name}/{brain}/segmentations"
    if not os.path.exists(segmentation_dir):
        os.makedirs(segmentation_dir)
    target_url = "https://data-proxy.ebrains.eu/api/v1/buckets/{}/.nesysWorkflowFiles/alignmentJsons/{}.waln?redirect=false"
    brain_url = target_url.format(bucket_name, brain)
    response = requests.get(brain_url)
    if response.ok:
        print('response ok', response.json())
        redirected_url = response.json()['url']
        redirected_response = requests.get(redirected_url)
        if redirected_response.ok:
            file_path = f"permanent_storage/{bucket_name}/{brain}/{brain}.waln"
            download_file(redirected_url, file_path)
            download_brain_files(bucket_name, brain)
        else:
            print(f"Failed to download {brain}.json")
    else:
        print(f"Failed to download {brain}.json")
    target_url = "https://data-proxy.ebrains.eu/api/v1/buckets/{}/.nesysWorkflowFiles/alignmentJsons/{}.zip?redirect=false"
    brain_url = target_url.format(bucket_name, brain)
    response = requests.get(brain_url)
    if response.ok:
        print('response ok', response.json())
        redirected_url = response.json()['url']
        redirected_response = requests.get(redirected_url)
        if redirected_response.ok:
            file_path = f"permanent_storage/{bucket_name}/{brain}/{brain}.zip"
            download_file(redirected_url, file_path)
            unzip_file(file_path, f"permanent_storage/{bucket_name}/{brain}/flat_files/")


def download_brains(bucket_name, brains):
    for brain in brains:
        download_brain(bucket_name, brain)


