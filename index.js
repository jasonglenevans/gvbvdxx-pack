const fs = require("fs");
const path = require("path");
const chalk = require("chalk");
const http = require("http");
var packageFunction = (p) => {
	return require("./packager/").packager(fs.readFileSync(path.join("./",p),{encoding:"UTF-8"}),p);
};
var {convertStringToFile} = require("./packager/");
let filepathlist = [];
let dirpathlist = [];
//get all files in directories
function ThroughDirectory(directory) {
    fs.readdirSync(directory).forEach(File => {
        const absolute = path.join(directory, File);
        if (fs.statSync(absolute).isDirectory()) {
			dirpathlist.push(absolute);
            return ThroughDirectory(absolute);
        } else {
            return filepathlist.push(absolute);
		}
    });
}
var expo = {
	compile: function (files,logging) {
		var compiled = [];
		var prevfiles = files;
		var retu = {
			compiled:null,
			onfilechanged:function () {
				
			},
			recompile:function () {
				this.compiled = expo.compile(prevfiles,true).compiled;
			},
			files:files
		};
		for (var i in files) {
			if (!(logging)) {
				console.log(chalk.bgBlue(chalk.white(`Compiling: ${path.join("./",files[i])}`)));
			}
			try{
				compiled.push({
					data:packageFunction(files[i]),
					name:files[i],
					dirname:convertStringToFile(path.join("./",files[i])),
					realdir:convertStringToFile(path.join("./",files[i])),
					realdirNoReplacer:path.join("./",files[i])
				});
				if (false) {
					var filename = files[i]
					var lastFileContents = fs.readFileSync(path.join("./src/",filename),{encoding:"UTF-8"})
					setInterval(() => {
						if (!(lastFileContents == fs.readFileSync(path.join("./src/",filename),{encoding:"UTF-8"}))) {
							lastFileContents = fs.readFileSync(path.join("./src/",filename),{encoding:"UTF-8"})
						}
					},20);
				}
				if (!(logging)) {
					console.log(chalk.bgBlue(chalk.white(`Compiled: ${path.join("./",files[i])}`)));
				}
			}catch(e){
				if (!(logging)) {
					console.log(chalk.bgBlue(chalk.white(`Failed To Compile: ${path.join("./",files[i])}`)));
				}
			}
		}
		retu.compiled = compiled;
		return retu;
	},
	build: function (compiledobject,template) {
		fs.rm("./dist/", {recursive: true},function () {
			var compiled = compiledobject.compiled;
			var fileTemplate = {};
			var keys = Object.keys(compiled);
			for (var i in keys) {
				fileTemplate[compiled[keys[i]].realdir] = compiled[keys[i]];
			}
			compiledobject.onfilechanged = function () {
				fileTemplate = {};
				var keys = Object.keys(compiled);
				for (var i in keys) {
					fileTemplate[compiled[keys[i]].realdir] = compiled[keys[i]];
				}
			};
			console.log(chalk.bgBlue(chalk.white(`Building...`)));
			try{
				fs.mkdirSync("./dist/");
			}catch(e){}
			if (template) {
				var staticHTML = (template);
			} else {
				var staticHTML = (`<!DOCTYPE HTML>\n<html>\n\n<head>\n\n<title></title>\n\n</head>\n\n<body>\n\n\n\n<script src="main.js?n=1"></script>\n</body>\n\n</html>`)
			}
			console.log(chalk.bgBlue(chalk.white(`Building: ${"index.html"}`)));
			try{
				fs.writeFileSync("./dist/index.html",staticHTML,{encoding:"UTF-8"});
			}catch(e){}
			console.log(chalk.bgBlue(chalk.white(`Building: ${"gvbvdxxpack_files.json"}`)));
			fs.writeFileSync(`./dist/${"gvbvdxxpack_files.json"}`,JSON.stringify({
				fileTemplate:fileTemplate,
				files:compiled
			}),{encoding:"UTF-8"});
			console.log(chalk.bgBlue(chalk.white(`Building: ${"main.js"}`)));
			try{
				fs.writeFileSync("./dist/main.js",require("./packager/").main.join("\n"),{encoding:"UTF-8"});
			}catch(e){}
			for (var i in compiled) {
				console.log(chalk.bgBlue(chalk.white(`Building: ${compiled[i].name}`)));
				try{
					fs.writeFileSync(path.join("./dist/",compiled[i].name),compiled[i].data,{encoding:"UTF-8"});
				}catch(e){}
			}
			try{
				filepathlist = [];
				dirpathlist = [];
				ThroughDirectory("./static/");
				try{
					fs.mkdirSync("./dist/static/");
				}catch(e){}
				for (var i in dirpathlist) {
					console.log(chalk.bgBlue(chalk.white(`Creating Static Directory: ${dirpathlist[i]}`)));
					try{
						fs.mkdirSync(path.join("./dist/",dirpathlist[i]));
					}catch(e){}
				}
				for (var i in filepathlist) {
					console.log(chalk.bgBlue(chalk.white(`Writing Static File: ${filepathlist[i]}`)));
					try{
						fs.writeFileSync(path.join("./dist/",filepathlist[i]),fs.readFileSync(filepathlist[i]));
					} catch(e){
						console.log(chalk.bgBlue(chalk.white(`Fail Writing Static File: ${filepathlist[i]}, ${e}`)));
					}
				}
			}catch(e){}
		});
	},
	devServer: function (compiledobject,template,port) {
		var compiled = compiledobject.compiled;
		var fileTemplate = {};
		var keys = Object.keys(compiled);
		for (var i in keys) {
			fileTemplate[compiled[keys[i]].realdir] = compiled[keys[i]];
		}
		var httpServer = http.createServer(function (req,res) {
			if (req.url == "/" || req.url == "") {
				if (template) {
					res.end(template);
				} else {
					res.end(`<!DOCTYPE HTML>\n<html>\n\n<head>\n\n<title></title>\n\n</head>\n\n<body>\n\n\n\n<script src="main.js?n=1"></script>\n</body>\n\n</html>`)
				}
				return;
			}
			if (req.url == "/main.js?n=1" || req.url == "/main.js/?n=1") {
				res.end(require("./packager/").main.join("\n"));
				return;
			}	
			if (req.url == "/gvbvdxxpack_files.json?n=1" || req.url == "/gvbvdxxpack_files.json/?n=1") {
				res.end(JSON.stringify({
					fileTemplate:fileTemplate,
					files:compiled
				}));
				return;
			}
			var fsURL = path.join("./",decodeURIComponent(req.url).split("?")[0].split("#")[0]);
			var fsData = null;
			try{
				fsData = fs.readFileSync(fsURL);
			}catch(e){}
			if (fsData) {
				res.end(fsData);
				return;
			}
			var fileurl = convertStringToFile(path.join("./src/",decodeURIComponent(req.url)));
			if (fileTemplate[fileurl]) {
				res.end(fileTemplate[fileurl].data);
				return;
			}
			if (req.method == "GET") {
				res.writeHead(404,{});
			} else {
				res.writeHead(403,{});
			}
			res.end("CANNOT "+req.method+" "+req.url);
			return;
		});
		httpServer.listen(port);
		console.log(chalk.bgBlue(chalk.white(`Server Listening On Port ${port}`)));
		return httpServer;
	}
};
module.exports = expo;