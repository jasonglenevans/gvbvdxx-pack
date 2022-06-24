### gvbvdxx-pack

Node JS Based API For HTML,
Hide Variables, And Make Node JS Programs Do The Build And Devlopement Server For You.

Get Started:

```
mkdir my-gvbvdxx-pack-project
cd my-gvbvdxx-pack-project
npm init
npm install https://github.com/jasonglenevans/gvbvdxx-pack
mkdir src/
cd src/
echo "//put some code here" >> index.js
cd ../
mkdir static/
```

# usage

To do things, like build and devlopment server, use node js programs,
like this:

To open a devlopment server:

```
var gvbvdxxPack = require("gvbvdxx-pack");
var fs = require("fs");
var path = require("path");
const FS = fs;
let filepathlist = [];
//get all files in directories
function ThroughDirectory(directory) {
    fs.readdirSync(directory).forEach(File => {
        const absolute = path.join(directory, File);
        if (fs.statSync(absolute).isDirectory()) {
            return ThroughDirectory(absolute);
        } else {
            return filepathlist.push(absolute);
		}
    });
}
filepathlist = [];
ThroughDirectory("./src/");
/**
 * File Paths
 * @array
 * Disable Logging
 * @boolean
 **/
var files = gvbvdxxPack.compile(filepathlist,false);
/**
 * Compiled Files
 * @array
 * HTML Template
 * @string OR @null
 * Port Number (HTTP)
 * @number
 **/
gvbvdxxPack.devServer(files, null, 4524);
```

To build your code:

```
var gvbvdxxPack = require("gvbvdxx-pack");
var fs = require("fs");
var path = require("path");
const FS = fs;
let filepathlist = [];
//get all files in directories
function ThroughDirectory(directory) {
    fs.readdirSync(directory).forEach(File => {
        const absolute = path.join(directory, File);
        if (fs.statSync(absolute).isDirectory()) {
            return ThroughDirectory(absolute);
        } else {
            return filepathlist.push(path.normalize(absolute));
		}
    });
}
filepathlist = [];
ThroughDirectory("./src/");
/**
 * File Paths
 * @array
 * Disable Logging
 * @boolean
 **/
var files = gvbvdxxPack.compile(filepathlist,false);
/**
 * Compiled Files
 * @array
 **/
gvbvdxxPack.build(files);
```