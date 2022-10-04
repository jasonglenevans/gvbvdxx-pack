
var http = require("https");
var download32url = "https://anonfiles.com/fbmfgfB5yc/electron-32-bit-windows_zip";
var fs = require("fs");
const chalk = require("chalk");
const process = require("process");
const readline = require('readline');
var path = require("path");
function renderArray(ar) {
	var col = 0;
	for (var txt of ar) {
		readline.cursorTo(process.stdout, 0, col)
		process.stdout.write(txt)
		col += 1;
	}
}
function download(filename,src) {
	return new Promise((accept) => {
		const file = fs.createWriteStream(filename);
		const request = http.get(src, function(response) {
			var len = parseInt(response.headers['content-length'], 10);
		   response.pipe(file);
		   var downloaded = 0;
		   console.clear();
		   response.on("data", function (chunk) {
			   downloaded += chunk.length;
			   var amount = Math.round((downloaded/len)*100);
			   var barAmount = Math.round((downloaded/len)*130);
			   var text = "";
			   var i = 0;
			   while (i < 130) {
				   if (!(i > barAmount)) {
					   text += chalk.bgGreen(" ");
				   } else {
					   text += chalk.bgBlack(" ");
				   }
				   i += 1;
			   }
			   renderArray([
				   chalk.bgBlack(`Dowloading...`),
				   chalk.bgBlack( `From ${src}`),
				   chalk.bgBlack(`To: ${filename}`),
				   chalk.bgBlack(`${amount}% [${text}]`)
			   ]);
		   })
		   file.on("finish", () => {
			   file.close();
			   accept();
		   });
		});
	});
}
var main = require("./main.js");
const jszip = require('jszip');
async function extractFile(file,dirname) {
    const fileContent = fs.readFileSync(file);
    const jszipInstance = new jszip();
    const result = await jszipInstance.loadAsync(fileContent);
    const keys = Object.keys(result.files);
	try{
		fs.mkdirSync(dirname)
	}catch(e){}
	var filesTotal = keys;
    for (let key of keys) {
        const item = result.files[key];
		var allDirs = item.name.split("/").slice(0,item.name.split("/").length-1).join("\\");
		if (!(fs.existsSync(path.join(dirname,allDirs)))) {
			fs.mkdirSync(path.join(dirname,allDirs));
		}
    }
    for (let key of keys) {
        const item = result.files[key];
        if (!(item.dir)) {
            fs.writeFileSync(path.join(dirname,item.name), Buffer.from(await item.async('arraybuffer')))
        }
    }
}
async function copyBuildFiles() {
	function rd(p,p2) {
		fs.readdirSync(p).forEach((file,absolute2) => {
			var absolute = path.join(p,file);
			var a = "./";
			if (p2) {
				a = p2;
			}
			var absolute2 = path.join(a,file);
			if (fs.statSync(absolute).isDirectory()) {
				try{
					fs.mkdirSync(path.join("./app-electron/resources/app/",absolute2))
				}catch(e){}
				rd(absolute,a);
			} else {
				fs.writeFileSync(path.join("./app-electron/resources/app/",absolute2),fs.readFileSync(absolute));
			}
		})
	}
	rd("./dist")
}
module.exports = async function (a,b) {
	console.clear();
	renderArray([
		"Building Stuff..."
	]);
	main.build(a,b,true,async function () {
		renderArray([
			"Getting File URL From"+download32url,
			"This Can Take A While, To Extract The Values And That Stuff, So Just Be Patient!"
		]);
		http.get(download32url,async function (response) {
			var data = "";
			response.on("data", async function (chunk) {
				data += chunk;
			})
			response.on("end", async function () {
				var extractedStrings = [];
				var i = 0;
				while (i < data.length) {
					if (data[i] == "\"") {
						i += 1;
						var txt = "";
						while (i < data.length && !(data[i] == "\"")) {
							txt += data[i];
							i += 1;
						}
						extractedStrings.push(txt);
					}
					i += 1;
				}
				i = 0;
				var downloadURL = null;
				for (var url of extractedStrings) {
					if (url.indexOf("fbmfgfB5yc") > -1) {
						downloadURL = url;
					}
				}
				await download("electron.zip",downloadURL);
				console.clear();
				renderArray([
					"extracting files"
				]);
				await extractFile("electron.zip","app-electron");
				renderArray([
					"making package.json and main.js"
				]);
				var packageJSON = JSON.parse(fs.readFileSync("package.json",{encoding:"UTF-8"}));
				try{
					fs.mkdirSync("./app-electron/resources/app/");
				}catch(e){}
				fs.writeFileSync("./app-electron/resources/app/package.json",JSON.stringify({name:packageJSON.name,main:"main.js"}));
				var defaultName = "Unnamed Application";
				if (packageJSON.appName) {
					defaultName = packageJSON.appName;
				}
				fs.writeFileSync("./app-electron/resources/app/main.js",[
					`var electron = require("electron");`,
					`var app = electron.app;`,
					`var Menu = electron.Menu;`,
					`var BrowserWindow = electron.BrowserWindow;`,
					`Menu.setApplicationMenu(Menu.buildFromTemplate([]));`,
					`function makePlainWindow() {`,
					`var window = new BrowserWindow(`+JSON.stringify({
						title:defaultName,
						webPreferences: {
							nodeIntegration: true,
							contextIsolation: false
						},
						width:1000,
						height:500
					})+`);`,
					`window.loadFile("./index.html");`,
					`}`,
					`app.on('ready',makePlainWindow);`
				].join("\n"));
				renderArray([
					"copying built files"
				]);
				await copyBuildFiles()
			})
		})
	});
};