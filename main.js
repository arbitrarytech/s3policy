var crypto = require('crypto');
var mime = require('mime');
function s3instance(accessKey, secretKey) {

    if (!accessKey || !secretKey) {
        console.log('Bad instantiation of s3policy! Go stand in the corner.\nDo the following:\nvar s3 = require(\'s3policy\')\nvar myBucket = new s3(\'ABCDEFG123456\', \'HFSFGA9S8H997786AS8545ASF90SDF0UA\')');
    }

    this.accessKey = accessKey;
    this.secretKey = secretKey;

    this.readPolicy = function(key, bucket, duration, download, cb) {
        var dateObj = new Date;
        var expiration = new Date(dateObj.getTime() + duration * 1000);
        expiration = Math.round(expiration.getTime() / 1000);

        var policy = 'GET\n\n\n' + expiration + '\n';
        policy += '/' + bucket + '/' + key;
        if (download) {
            policy += '?response-content-disposition=attachment;filename=' + encodeURIComponent(download);
        }

        var signature = crypto.createHmac("sha1", this.secretKey).update(policy);

        var url = 'https://s3.amazonaws.com/';
        url += bucket + '/';
        url += key;
        url += '?AWSAccessKeyId=' + this.accessKey;
        url += '&Expires=' + expiration;
        url += '&Signature=' + encodeURIComponent(signature.digest("base64"));
        if (download) {
            url += '&response-content-disposition=attachment;filename=' + encodeURIComponent(download);
        }
        if (cb) {
            cb(null, url);
        } else {
            return url;
        }
    };

    this.writePolicy = function(key, bucket, duration, filesize, acl, cb) {
        var dateObj = new Date;
        var dateExp = new Date(dateObj.getTime() + duration * 1000);
        var policy = {
            "expiration":dateExp.getUTCFullYear() + "-" + dateExp.getUTCMonth() + 1 + "-" + dateExp.getUTCDate() + "T" + dateExp.getUTCHours() + ":" + dateExp.getUTCMinutes() + ":" + dateExp.getUTCSeconds() + "Z",
            "conditions":[
                { "bucket":bucket },
                ["starts-with","$key","uploads/"],
                { "acl":acl },
                ["content-length-range", 0, filesize * 1000000],
                ["starts-with","$Content-Type",""]
            ]
        };

        var policyString = JSON.stringify(policy);
        var policyBase64 = new Buffer(policyString).toString('base64');
        var signature = crypto.createHmac("sha1", this.secretKey).update(policyBase64);
        var accessKey = this.accessKey;
        var s3Credentials = {
            s3PolicyBase64:policyBase64,
            s3Signature:signature.digest("base64"),
            s3Key:accessKey,
            acl:acl,
            mine:mime.lookup(key)
        };
        if (cb) {
            cb(s3Credentials);
        } else {
            return s3Credentials;
        }
    };

}

module.exports = s3instance;
