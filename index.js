var axios = require('axios');

const DEFAULT_BASE_URL = 'http://pahud-s3-apig-demo.s3-website.cn-north-1.amazonaws.com.cn'

exports.handler = async (event, context) => {
    //console.log(JSON.stringify(event, null, 1));
    /* Get request */
    const request = event.requestContext;
    const headers = event.headers;
    const user_agent = headers['User-Agent'];
    let uri         = event.path;
    console.log("User-Agent=%s", user_agent);
    console.log("uri=%s", uri);

    async function resp200(uri) {
        console.log('start resp func')
        const baseURL = process.env.BASEURL || DEFAULT_BASE_URL
        let resp = await getBinaryFromURL(baseURL+uri)
        return {
            statusCode: 200,
            body: resp,
            headers: {
                'content-type': 'application/octet-stream'
            },
            isBase64Encoded: true,
        }
    }

    function resp200plain() {
        return {
            statusCode: 200,
            body: JSON.stringify({'status': 'unknown user-agent'}),
        }
    }

    function resp403(uri) {
        return {
            statusCode: 403,
            body: JSON.stringify({'status': 'Forbidden'}),
        }
    }

    if (ifUAcontainsAndroid(user_agent)) {
        uri = '/download/android.bin';
        console.log("found an Android device");
        return resp200(uri)
    } else if (ifUAcontainsiPhone(user_agent)) {
        uri = '/download/iphone.bin';
        console.log("found an iPhone device");
        return resp200(uri)
    } else if (ifUAcontainsiPad(user_agent)) {
        uri = '/download/ipad.bin';
        console.log("found an iPad device");
        return resp200(uri)
    } else if (ifUAcontainsBot(uri)) {
        console.log("found a Bot. Returning 403");
        return resp403()
    } else {
        console.log("unknown user-agent");
        console.log(JSON.stringify(request, null, 1));
        return resp200plain()
    }
};


function ifUAcontainsAndroid(user_agent){
    if (user_agent.indexOf("Android") != -1) {
        return true;
        }
    return false;    
}

function ifUAcontainsiPhone(user_agent){
    if (user_agent.indexOf("iPhone") != -1) {
        return true;
        }
    return false;    
}

function ifUAcontainsiPad(user_agent){
    if (user_agent.indexOf("iPad") != -1) {
        return true;
        }
    return false;    
}

function ifUAcontainsBot(user_agent){
    if (user_agent.indexOf("Bot") != -1) {
        return true;
        }
    return false;    
}


async function getBinaryFromURL(url){
    console.log('fetching '+url);
    var body;
    let image = await axios.get(url, {responseType: 'arraybuffer'});
    let returnedB64 = Buffer.from(image.data).toString('base64');
    return returnedB64;
}
