var main = require("./mainarray.js");
var mod = {
	packager:function (contents,name) {
		var code = contents.split("\n");
		var genaratedCode = [];
		genaratedCode.push(`/**`);
		genaratedCode.push(`* Genarated By: Gvbvdxx-Pack`);
		genaratedCode.push(`* DO NOT EDIT`);
		genaratedCode.push(`*/`);
		genaratedCode.push(`(function (argument1) {`);
		genaratedCode.push(`    var module = {exports:null};`);
		for (var i in code) {
			genaratedCode.push(`    ${code[i].replaceAll("\t","    ")}`);
		}
		genaratedCode.push(`    return module.exports;`);
		genaratedCode.push(`})();`);
		return genaratedCode.join("\n");
	},
	main:main,
	convertStringToFile: (string) => {
		return string.replaceAll("/","_").replaceAll("\\","_");
	},
	safeText: (text) => {
		return "\""+text.replaceAll("\\","\\\\").replaceAll("\"","\\\"").replaceAll("\n","\\n").replaceAll("\t","\\t").replaceAll("\r","\\r")+"\""
	}
}
module.exports = mod;