var fs = require("fs");
var contents = fs.readFileSync("./packager/main.js", {
    encoding: "UTF-8"
});
var extracted = contents.split("\n");
var comments = fs.readFileSync("./packager/comments.js", {
    encoding: "UTF-8"
});
var extractedcomments = comments.split("\n");
function makeText(text) {
    return "\"" + text.replaceAll("\\", "\\\\").replaceAll("\"", "\\\"").replaceAll("\n", "\\n").replaceAll("\t", " ").replaceAll("\r", "\\r") + "\"";
}
var contents = [
"module.exports = ["];
var strings = [];
for (var i in extractedcomments) {
    if (extractedcomments[i]) {
        var txt = makeText(extractedcomments[i]) + ",";
    } else {
        var txt = makeText(extractedcomments[i]) + "";
    }
    strings.push(txt);
    //console.log(`Added Line ${txt}`)
}
for (var i in extracted) {
    if (extracted[i]) {
        var txt = makeText(extracted[i]) + ",";
    } else {
        var txt = makeText(extracted[i]) + "";
    }
    strings.push(txt);
    //console.log(`Added Line ${txt}`);
}
for (var i in strings) {
    contents.push(strings[i]);
}
contents.push("];");
fs.writeFileSync("packager/mainarray.js",
[
"/**",
" * AUTO MADE BY GENARATE MAIN SCRIPT",
" * DO NOT EDIT! USE GENARATE MAIN SCRIPT TO UPDATE.",
" * THIS CODE HAS BEEN COMPRESSED TO KEEP THINGS FAST.",
" **/"
].join("\n")+"\n"+contents.join(""), {
    encoding: "UTF-8"
});
