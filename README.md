s3policy
========

S3 Upload/Download Policy Generator for Node.js

This is a simple node.js module for easliy creating signed URLs for downloading resources directly from Amazon S3 as well as creating the necessary data for doing file uploads directly to S3. The great thing about using these methods is that file download/uploaded happen between the client and S3, your applications servers don't have to burdened with the traffic. This is all done while still keeping it highly secure.

This module is available via npm by running ````npm install s3policy````

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
var url = myS3Account.writePolicy('myfile', 'mybucket', 60, 10);
````

* Website: http://www.arbitrarytech.com
