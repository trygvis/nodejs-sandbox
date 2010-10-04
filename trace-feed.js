var sys = require('sys');
var xml = require("./node-xml/lib/node-xml");
var fs = require('fs');

var XMLP = xml.XMLP;
var s = fs.readFileSync("trygvis.atom");
var xmlp = new xml.XMLP(s);

var n = xmlp.next();
while(n != XMLP._NONE) {
    switch(n) {
        case XMLP._ELM_B:
            console.log(n + ": Begin: " + xmlp.getName());
            break;
        case XMLP._ELM_E:
            console.log(n + ": End:   " + xmlp.getName());
            break;
        case XMLP._ELM_EMP:
            console.log(n + ": Empty: " + xmlp.getName());
            break;
        case XMLP._TEXT:
            var text = xmlp.getContent().substring(xmlp.getContentBegin(), xmlp.getContentEnd());
            console.log(n + ": Text:  " + text);
            break;
        case XMLP._PI:
            console.log(n + ": PI");
            break;
        default:
            console.log("Unknown event: " + n);
    }
    n = xmlp.next();
}
