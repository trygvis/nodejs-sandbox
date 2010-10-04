(function () {
var xml = require("./node-xml/lib/node-xml");
var XMLP = xml.XMLP

var AtomFeed = function(id, title, subtitle, published, updated, author, links, entries) {
    return {
        id: id,
        title: title,
        subtitle: subtitle,
        published: published,
        updated: updated,
        author: author,
        links: links,
        entries: entries
    };
}

var AtomAuthor = function(name, email, uri) {
    return {
        name: name,
        email: email,
        uri: uri
    }
}

var AtomLink = function(href, rel, type) {
    return {
        href: href,
        rel: rel,
        type: type
    }
}

var AtomEntry = function(id, title, published, updated, links, content) {
    return {
        id: id,
        title: title,
        published: published,
        updated: updated,
        links: links,
        content: content
    }
}

///////////////////////////////////////////////////////////////////////////////
// XMLP Extras

var next = function(xmlp) {
    var n = xmlp.next();
    //console.log("n=" + n);
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
            case XMLP._ENTITY:
                console.log("getText(): WARNING: got an entity in the text, not sure what to do with it.");
                break;
            default:
                throw new Error("Invalid content inside element '" + element + "', expected text only. Got " + n + ".");
        }

        n = next(xmlp);
    }
    console.log("getText=" + content);
    return content
}

var skipToStartOfFeed = function(xmlp) {
    console.log("skipToStartOfFeed")
    var n = next(xmlp);
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

var formatLineColumn = function(xmlp) {
    return "line " + xmlp.getLineNumber() + ", column " + xmlp.getColumnNumber();
}

/**
 * Call next() and return event if it is START_TAG or END_TAG
 * otherwise throw an exception. It will skip whitespace TEXT before
 * actual tag if any.
 */
/*
var nextTag = function(xmlp) {
    console.log("nextTag");
    var n = next(xmlp);
    
    if(n == XMLP._TEXT) {
        var text = xmlp.getContent().substring(xmlp.getContentBegin(), xmlp.getContentEnd());
        if(text.trim().length == 0) {
            console.log("nextTag: Skipping " + text.length + " blank characters.");
            n = next(xmlp);
        }
    }

    if(n != XMLP._ELM_B && n != XMLP._ELM_EMP && n != XMLP._ELM_E) {
        throw new Error("Expected start or end tag at " + formatLineColumn(xmlp) + ".");

        // XMLP tries to optimize which breaks down..
        if(n == XMLP._ELM_EMP) {
            return XMLP._ELM_B;
        }
    }
    console.log("nextTag: n=" + n);
    return n;
}
*/

var nextTag = function(xmlp) {
    console.log("nextTag: current=" + xmlp.getName());
    var n = next(xmlp);
    if(n == XMLP._ELM_E) {
        console.log("nextTag: was empty");
        return n;
    }
    while(n != XMLP._ELM_B && n != XMLP._ELM_EMP) {
        switch(n) {
            case XMLP._TEXT:
                var text = xmlp.getContent().substring(xmlp.getContentBegin(), xmlp.getContentEnd());
                if(text.trim().length == 0) {
                    break;
                }
                console.log("text = " + text);
                throw new Error("Only whitespace text is allowed. " + formatLineColumn(xmlp) + ".");
            case XMLP._ELM_E:
                return n;
            default:
                throw new Error("Unexpected XMLP element: " + n + " at " + formatLineColumn(xmlp) + ".");
        }
        n = next(xmlp);
    }
    if(n == XMLP._ELM_EMP) {
        n = XMLP._ELM_B;
    }
    console.log("nextTag: next=" + xmlp.getName() + ", n=" + n);
    return n;
}

/**
 * Consume an element and all elements it is containing.
 */
var consumeElement = function(xmlp) {
    console.log("consumeElement: Consuming " + xmlp.getName());
    var i = 1;
    var n = next(xmlp);
    while(i > 0) {
        switch(n) {
            case XMLP._ELM_B:
                console.log("consumeElement: i=" + i + ", begin=" + xmlp.getName());
                i++;
                break;
            case XMLP._ELM_E:
                console.log("consumeElement: i=" + i + ", end=" + xmlp.getName());
                i--;
                break;
        }
        n = next(xmlp);
    }
    console.log("consumeElement: n=" + n);
    return n;
}

/**
 * Annoyingly XMLP has several codes that indicate failure.
 */
var hasMore = function(n) {
    switch(n) {
        case XMLP._ELM_B:
        case XMLP._ELM_E:
        case XMLP._ELM_EMP:
        case XMLP._ATT:
        case XMLP._TEXT:
        case XMLP._ENTITY:
        case XMLP._PI:
        case XMLP._CDATA:
        case XMLP._COMMENT:
        case XMLP._DTD:
            return true;
        default:
            return false;
    }
}

///////////////////////////////////////////////////////////////////////////////
// Atom Feed Parser

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
    console.log("xmlpToAtomAuthor");
    var name, email, uri;
    while(nextTag(xmlp) == XMLP._ELM_B) {
        var name = xmlp.getName();
        console.log("xmlpToAtomAuthor: name = " + name);
        switch(name) {
            case "name": name = getText(xmlp); break;
            case "email": email = getText(xmlp); break;
            case "uri": uri = getText(xmlp); break;
            default:
                throw new Error("Unknown element: " + name);
                consumeElement(xmlp);
        }
    }
    return new AtomAuthor(name, email, uri);
}

var xmlpToAtomEntry = function(xmlp) {
    console.log("xmlpToAtomEntry");
    var id, title, published, updated, author;
    var links = new Array();
    while(nextTag(xmlp) == XMLP._ELM_B) {
        var name = xmlp.getName();
        console.log("xmlpToAtomEntry: name = " + name);
        switch(name) {
            case "id": id = getText(xmlp); break;
            case "title": title = getText(xmlp); break;
            case "link": links.push(xmlpToAtomLink(xmlp)); break;
            case "published": published = parseDate(getText(xmlp)); break;
            case "updated": updated = parseDate(getText(xmlp)); break;
            case "author": author = xmlpToAtomAuthor(xmlp); break;
            case "content": content = getText(xmlp); break; // TODO: Handle multiple content elements
            case "media:thumbnail": /* TODO: consume element */ break;
            default:
                throw new Error("Unknown element: " + name);
                consumeElement(xmlp);
        }
    }

    return new AtomEntry(id, title, published, updated, author, links)
}

var xmlpToAtomFeed = function(xmlp) {
    console.log("xmlpToAtomFeed");
    var id, title, subtitle, published, updated, author;
    var links = new Array();
    var entries = new Array();
    skipToStartOfFeed(xmlp)
    if(xmlp.getName() != "feed") {
        throw new Error("Invalid root tag: expected 'feed', found '" + xmlp.getName() + "'")
    }
    var n = nextTag(xmlp)
    while(hasMore(n)) {
        if(n == XMLP._ELM_B || n == XMLP._ELM_EMP) {
            var name = xmlp.getName();
            console.log("xmlpToAtomFeed: name = " + name);
            switch(name) {
                case "id": id = getText(xmlp); break;
                case "title": title = getText(xmlp); break;
                case "link": links.push(xmlpToAtomLink(xmlp)); break;
                case "published": published = parseDate(getText(xmlp)); break;
                case "updated": updated = parseDate(getText(xmlp)); break;
                case "entry": entries.push(xmlpToAtomEntry(xmlp)); break;
                default:
                    throw new Error("Unknown element: " + name);
            }
        }
        n = next(xmlp);
    }
    return new AtomFeed(id, title, subtitle, published, updated, author, links, entries)
}

exports.xmlpToAtomFeed = xmlpToAtomFeed;
exports.consumeElement = consumeElement;
exports.nextTag = nextTag;

})()
