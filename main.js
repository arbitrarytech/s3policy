crypto = require('crypto');

function s3instance(accessKey, secretKey) {

    if (!accessKey || !secretKey) {
        console.log('Bad instantiation of s3policy! Go stand in the corner.\nDo the following:\nvar s3 = require(\'s3policy\')\nvar myBucket = new s3(\'ABCDEFG123456\', \'HFSFGA9S8H997786AS8545ASF90SDF0UA\')')
    }

    this.accessKey = accessKey;
    this.secretKey = secretKey;

    this.readPolicy = function(key, bucket, duration, download, regionDomain) {
        var dateObj = new Date;
        var expiration = new Date(dateObj.getTime() + duration * 1000);
        expiration = Math.round(expiration.getTime() / 1000);
	regionDomain = regionDomain || 's3';

        
        var policy = 'GET\n\n\n' + expiration + '\n';
        policy += '/' + bucket + '/' + key;
        if (download) {
            if(download[0] !== '"' || download[download.length-1] !== '"') {
                download = '"' + download + '"';
            }
            policy += '?response-content-disposition=attachment;filename=' + download;
        }

        var signature = crypto.createHmac("sha1", this.secretKey).update(policy);

        var url = 'https://'+regionDomain+'.amazonaws.com/';
        url += bucket + '/';
        url += key;
        url += '?AWSAccessKeyId=' + this.accessKey;
        url += '&Expires=' + expiration;
        url += '&Signature=' + encodeURIComponent(signature.digest("base64"));
        if (download) {
            url += '&response-content-disposition=attachment;filename=' + encodeURIComponent(download);
        }
        return url;
    };

    this.writePolicy = function(key, bucket, duration, filesize, useEncryption) {
        var dateObj = new Date;
        var dateExp = new Date(dateObj.getTime() + duration * 1000);
        var policy = {
            "expiration":dateExp.getUTCFullYear() + "-" + dateExp.getUTCMonth() + 1 + "-" + dateExp.getUTCDate() + "T" + dateExp.getUTCHours() + ":" + dateExp.getUTCMinutes() + ":" + dateExp.getUTCSeconds() + "Z",
            "conditions":[
                { "bucket":bucket },
                ["eq", "$key", key],
                { "acl":"private" },
                ["content-length-range", 0, filesize * 1000000],
                ["starts-with", "$Content-Type", ""]
            ]
        };

        if(useEncryption) { 
            policy.conditions.push({ 'x-amz-server-side-encryption': 'AES256' }); 
        }

        var policyString = JSON.stringify(policy);
        var policyBase64 = new Buffer(policyString).toString('base64');
        var signature = crypto.createHmac("sha1", this.secretKey).update(policyBase64);
        var accessKey = this.accessKey;
        s3Credentials = {
            s3PolicyBase64:policyBase64,
            s3Signature:signature.digest("base64"),
            s3Key:accessKey
        };

        return s3Credentials;
    };

}

module.exports = s3instance;
