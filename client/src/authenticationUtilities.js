function getCodeFromURL() {
    const url = window.location.href;
    const code = url.match(/code=([^&]*)/)[1];
    console.log('code', code)
    return code;

}

function getToken() {
    return new Promise((resolve, reject) => {
        const code = getCodeFromURL();
        const xhr = new XMLHttpRequest();
        console.log('promise')
        console.log('redirect_uri:', process.env.REACT_APP_OIDC_CLIENT_REDIRECT_URL)
        var redirect_uri = process.env.REACT_APP_OIDC_CLIENT_REDIRECT_URL;
        xhr.open("GET", `${redirect_uri}/auth?code=${code}`, true);
   
        xhr.send();
        xhr.onreadystatechange = function () {
        
            if (xhr.status == 200 && xhr.readyState == 4) {
            var resp = xhr.responseText;           
                resolve(resp);
            }
            // handle rejection
            if (xhr.status == 400 && xhr.readyState == 4) { 
                reject(xhr.status);
            }
    
        };
    });
}

export default getToken;