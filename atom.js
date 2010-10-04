(function () {
  var xml = require("./node-xml/lib/node-xml");
  var XMLP = xml.XMLP

var AtomFeed = function(id, title, subtitle, published, updated, author, links) {
    return {
        id: id,
        title: title,
        subtitle: subtitle,
        published: published,
        updated: updated,
        author: author,
        links: links
    };
}

var AtomAuthor = function(name, email) {
    return {
        name: name,
        email: email
    }
}

var AtomLink = function(href, rel, type) {
    return {
        href: href,
        rel: rel,
        type: type
    }
}

var next = function(xmlp) {
    var n = xmlp.next();
    console.log("n=" + n);
    return n;
}

/**
 * Returns the current text positioning the reader at the end of an element.
 *
 * Reading will fail if the current element contains anything but text.
 */
var getText = function(xmlp) {
    console.log("getText");
    var element = xmlp.getName()
    var n = next(xmlp);
    var content = ""

    while(n != XMLP._ELM_E) {
        switch(n) {
            case XMLP._TEXT:
                content += xmlp.getContent().substring(xmlp.getContentBegin(), xmlp.getContentEnd());
                break;
            default:
                throw new Error("Invalid content inside element '" + element + "', expected text only. Got " + n + ".");
        }

        n = next(xmlp);
    }
    console.log("getText=" + content);
    return content
}

var skipToStartOfDocument = function(xmlp) {
    console.log("skipToStartOfDocument")
    var n = next(xmlp)
    while(n != XMLP._ELM_B) {
        switch(n) {
            case XMLP._PI:
                break;
            case XMLP._TEXT:
                var text = xmlp.getContent().substring(xmlp.getContentBegin(), xmlp.getContentEnd());
                if(text.trim().length == 0) {
                    break;
                }
                console.log("text = " + text);
                throw new Error("Only whitespace text is allowed. Line " + xmlp.getLineNumber() + ", column " + xmlp.getColumnNumber() + ".");
            default:
                throw new Error("Unexpected XMLP element: " + n);
        }
        n = next(xmlp)
    }

    return n;
}

var skipWhiteTextToNextElement = function(xmlp) {
    console.log("skipWhiteTextToNextElement");
    var n = next(xmlp);
    while(n != XMLP._ELM_B && n != XMLP._ELM_EMP) {
        switch(n) {
            case XMLP._TEXT:
                var text = xmlp.getContent().substring(xmlp.getContentBegin(), xmlp.getContentEnd());
                if(text.trim().length == 0) {
                    break;
                }
                console.log("text = " + text);
                throw new Error("Only whitespace text is allowed. Line " + xmlp.getLineNumber() + ", column " + xmlp.getColumnNumber() + ".");
            default:
                throw new Error("Unexpected XMLP element: " + n);
        }
        n = next(xmlp);
    }
    console.log("skipWhiteTextToNextElement: next is " + xmlp.getName());
    return n;
}

var parseDate = function(s) {
    // TODO: Create a date object
    return s;
}

var xmlpToAtomLink = function(xmlp) {
    var href, rel, type;
    // TODO: Parse attributes
    return new AtomLink(href, rel, type);
}

var xmlpToAtomAuthor = function(xmlp) {
    consumeElement(xmlp);
    return new AtomAuthor();
}

var xmlpToAtomEntry = function(xmlp) {
    console.log("xmlpToAtomEntry");
    var id, title, subtitle, published, updated, author;
    var links = new Array();
    var n = skipWhiteTextToNextElement(xmlp)
    while(n == XMLP._ELM_B || n == XMLP._ELM_EMP) {
        var name = xmlp.getName();
        console.log("name = " + name);
        switch(name) {
            case "id": id = getText(xmlp); break;
            case "title": title = getText(xmlp); break;
            case "link": links.push(xmlpToAtomLink(xmlp)); break;
            case "published": published = parseDate(getText(xmlp)); break;
            case "updated": updated = parseDate(getText(xmlp)); break;
            case "author": author = xmlpToAtomAuthor(xmlp); break;
            case "entry": entries = xmlpToAtomEntry(xmlp); break;
            default:
                throw new Error("Unknown element: " + name);
        }
        n = skipWhiteTextToNextElement(xmlp)
    }
    return new AtomEntry(id, title, subtitle, published, updated, author, links)
}

var xmlpToAtomDocument = function(xmlp) {
    console.log("xmlpToAtomDocument");
    var id, title, subtitle, published, updated, author;
    var links = new Array();
    skipToStartOfDocument(xmlp)
    if(xmlp.getName() != "feed") {
        throw new Error("Invalid root tag: expected 'feed', found '" + xmlp.getName() + "'")
    }
    var n = skipWhiteTextToNextElement(xmlp)
    while(n == XMLP._ELM_B || n == XMLP._ELM_EMP) {
        var name = xmlp.getName();
        console.log("name = " + name);
        switch(name) {
            case "id": id = getText(xmlp); break;
            case "title": title = getText(xmlp); break;
            case "link": links.push(xmlpToAtomLink(xmlp)); break;
            case "published": published = parseDate(getText(xmlp)); break;
            case "updated": updated = parseDate(getText(xmlp)); break;
            case "entry": entries = xmlpToAtomEntry(xmlp); break;
            default:
                throw new Error("Unknown element: " + name);
        }
        n = skipWhiteTextToNextElement(xmlp)
    }
    return new AtomFeed(id, title, subtitle, published, updated, author, links)
}

exports.xmlpToAtomDocument = xmlpToAtomDocument

})()
