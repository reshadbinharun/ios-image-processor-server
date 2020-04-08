var express = require('express');
var router = express.Router();
var multiparty = require('multiparty');
var moment = require('moment');
var spawn = require("child_process").spawn;
var path = require('path')

const image_process_module_path = "../image_processing_modules/sample.py"

function executePy(req, res) { 
    
    const timeNow = moment().format('MMMM Do YYYY, h:mm:ss a');
    var process = spawn('python',
        [
            "-u",
            path.resolve(image_process_module_path), 
            req.params.message, 
            timeNow
        ]); 
    process.stdout.on('data', (data) => { 
        res.send(data.toString()); 
    }) 
} 

router.post('/sendTimestamp', function(req, res, next) {
    const timestamp = req.body.timeStamp;
    res.send(`Received timestamp as ${timestamp}`);
});

router.post('/sendImage', async(req, res) => {
    // parse a file upload
    const form = new multiparty.Form();
    let fileName = ''
    const timeNow = moment().format('MMMM Do YYYY, h:mm:ss a');
    /*
        After your request body is parsed with multipart/form encoding
        You can access to the files and the fields in that form
        You may upload it to another image service
    */
    form.parse(req, function (err, fields, files) {
      /*
        The property that matter inside files object it's path
        With that, you can write it in your server file system (fs) 
        or data base or cloud service
      */
      console.log('files received', files);
      console.log('fields received', fields);
      fileName = files.file[0].originalFilename;
      res.json({message:`Received image by name: ${fileName} at ${timeNow}`});
    });
});

router.get('/triggerPy/:message', (req, res, next) => {
    try {
        executePy(req, res);
    } catch (e) {
        console.error("Failed to start python script: ", e);
        next(e);
    }
})

module.exports = router; 