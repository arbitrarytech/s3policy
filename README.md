s3policy
========

S3 Upload/Download Policy Generator for Node.js

This is a simple node.js module for easliy creating signed URLs for downloading resources directly from Amazon S3 as well as creating the necessary data for doing file uploads directly to S3. The great thing about using these methods is that file download/uploaded happen between the client and S3, your applications servers don't have to burdened with the traffic. This is all done while still keeping it highly secure.

This module is available via npm by running ````npm install s3policy-acl````

In order to use this module, you will first need to have an AWS account and an IAM user with the necessary access to the read/write the files you want to create links for.

Here is a sample to create a signed URL to download the file 'myfile' from the bucket 'mybucket' that will be good for the next 60 seconds.
````javascript
var s3 = require('s3policy');
var myS3Account = new s3('MYACCESSKEY', 'MYSECRETKEY');
var url = myS3Account.readPolicy('myfile', 'mybucket', 60);
````

If you want to force the browser to initiate a file download add filename to the 4th parameter
````javascript
var url = myS3Account.readPolicy('myfile', 'mybucket', 60, 'file.txt');
````

Allowing the client browser to upload to S3 is a bit more complicated. Check out http://aws.amazon.com/articles/1434 for more information. s3policy helps out by creating the necessary signed variables that the client will need to upload. Here is a sample to return an object with the signed variables to allow a 10MB upload to 'myfile' in the 'mybucket' bucket, you would normally have the client do an AJAX request to get this info when it commences an upload.
````javascript
var s3 = require('s3policy');
var myS3Account = new s3('MYACCESSKEY', 'MYSECRETKEY');
var policy = myS3Account.writePolicy('myfile', 'mybucket', 60, 10, 'public-read', callback);
````

HTML form
````html
<form id="myForm" action="https://[bucket-name].s3.amazonaws.com/" method="post" enctype="multipart/form-data">
    <input type="hidden" id="key" name="key" value="uploads/${filename}">
    <input type="hidden" id="acl" name="acl" value="YOUR_ACL_OPTION">
    <input type="hidden" id="AWSAccessKeyId" name="AWSAccessKeyId" value="YOUR_AWS_ACCESS_KEY"> 
    <input type="hidden" id="policy" name="policy" value="YOUR_POLICY_DOCUMENT_BASE64_ENCODED">
    <input type="hidden" id="signature" name="signature" value="YOUR_CALCULATED_SIGNATURE">
    <input type="hidden" name="Content-Type" value="MIME_TYPE">
    <input name="file" id="file" type="file"> 
<input id="btn_submit" class="btn btn-warning" type="submit" value="Upload File to S3"> 
</form>
````

Client-side scripts
````javascript
function handleRes(res,req,err) {
        $("#AWSAccessKeyId").val(res.s3Key);
        $("#policy").val(res.s3PolicyBase64);
        $("#signature").val(res.s3Signature);
        $("#acl").val(res.acl);
        $("#mime").val(res.mime);
        $("#myForm").submit();
}
$( document ).ready(function() {
        $( "#btn_submit" ).bind( "click", requestCredentials );
        console.log( "ready!" );
});


var requestCredentials = function(event) { 
    event.preventDefault(); // intercept and override the submit button 
    var _file;

    _file = $("#file").val().replace(/.+[\\\/]/, "");

    $.ajax({ // example of a simple ajax request
        url: "http://localhost:4000/" + _file,
        success: handleRes,
        error: function(res, status, error) {
            console.log(error)
        }
    });
}
````
* Website: http://www.arbitrarytech.com
* Reference: http://blog.tcs.de/post-file-to-s3-using-node
