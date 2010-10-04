var sys = require('sys');
var xml = require("./node-xml/lib/node-xml");
var fs = require('fs');
var atom = require('./atom');

var s = fs.readFileSync("trygvis.atom");

var xmlp = new xml.XMLP(s);

var feed = atom.xmlpToAtomDocument(xmlp);

console.log("title=" + feed.title);
