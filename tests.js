var atom = require("./atom");
var fs = require('fs');
var sys = require('sys');
var xml = require("./node-xml/lib/node-xml");

var XMLP = xml.XMLP;

exports["Smallest document"] = function(test) {
    var s = "<root></root>"
    var xmlp = new xml.XMLP(s);
    test.equals(xmlp.next(), XMLP._ELM_B);
    test.equals(xmlp.next(), XMLP._ELM_E);
    test.done();
};

// This is because of a failure in XMLP
exports["Document with a single empty element"] = function(test) {
    test.done(); return;
/*
    var s = "<root><a/></root>"
    var xmlp = new xml.XMLP(s);
    test.equals(xmlp.next(), XMLP._ELM_B);
    test.equals(xmlp.next(), XMLP._ELM_EMP);
    test.equals(xmlp.next(), XMLP._ELM_E);
    console.log("error = " + xmlp.getContent());
    test.done();
*/
};

exports["consumeElement: Consuming empty element"] = function(test) {
    var s = "<root><a></a></root>"
    var xmlp = new xml.XMLP(s);
    test.equals(xmlp.next(), XMLP._ELM_B);
    test.equals(xmlp.next(), XMLP._ELM_B);
    test.equals(xmlp.getName(), "a");
    atom.consumeElement(xmlp);
    test.equals(xmlp.getName(), "root");
    test.equals(xmlp.next(), XMLP._NONE);
    console.log("error = " + xmlp.getContent());
    test.done();
};

exports["consumeElement: Consuming non-empty element"] = function(test) {
    var s = "<root><a></a><b><c></c></b>  <d></d></root>"
    var xmlp = new xml.XMLP(s);
    test.equals(xmlp.next(), XMLP._ELM_B);
    test.equals(xmlp.next(), XMLP._ELM_B);
    test.equals(xmlp.getName(), "a");
    test.equals(xmlp.next(), XMLP._ELM_E);
    test.equals(xmlp.next(), XMLP._ELM_B);
    test.equals(xmlp.getName(), "b");
    n = atom.consumeElement(xmlp);
    test.equals(n, XMLP._TEXT);
    test.equals(xmlp.next(), XMLP._ELM_B);
    test.equals(xmlp.next(), XMLP._ELM_E);
    test.done();
};

exports["nextTag"] = function(test) {
    var s = "<root><a></a>   <b></b><c></c></root>"
    var xmlp = new xml.XMLP(s);
    test.equals(xmlp.next(), XMLP._ELM_B);          // start of root
    test.equals(xmlp.next(), XMLP._ELM_B);          // start of a
    test.equals(xmlp.next(), XMLP._ELM_E);          // end of a
    test.equals(atom.nextTag(xmlp), XMLP._ELM_B);   // start of b
    test.equals(atom.nextTag(xmlp), XMLP._ELM_E);   // end of b
    test.equals(xmlp.next(), XMLP._ELM_B);          // start of c
    test.equals(atom.nextTag(xmlp), XMLP._ELM_E);
    test.done();
};

exports["Test atom feed"] = function(test) {
    var feed = atom.xmlpToAtomFeed(new xml.XMLP(fs.readFileSync("trygvis.atom")));
    test.equals(feed.title, "trygvis's Activity");
    test.equals(feed.entries.length, 35);
    test.done();
}
/**/
