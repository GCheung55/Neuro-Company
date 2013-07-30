var fs = require('fs')
,   wrup = require('wrapup')
,   root = __dirname + '/';

// Write the neuro.js file

var src = wrup().require('Neuro', './').up(function(err, js){
    fs.writeFile(root + 'neuro-company.js', js);
});

var compressed = wrup().require('Neuro', './').options({
    compress: true
}).up(function(err, js){
    fs.writeFile(root + 'neuro-company-min.js', js);
});

console.log('Neuro-Company created.');
