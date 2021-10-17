import jQuery from "jquery.sap.global";
import XMLHelper from "sap/ui/util/XMLHelper";
jQuery.sap.parseXML = XMLHelper.parse;
jQuery.sap.serializeXML = function (oXMLDocument) {
    var sXMLString = "";
    if (window.ActiveXObject) {
        sXMLString = oXMLDocument.xml;
        if (sXMLString) {
            return sXMLString;
        }
    }
    if (window.XMLSerializer) {
        return XMLHelper.serialize(oXMLDocument);
    }
    return sXMLString;
};
jQuery.sap.isEqualNode = function (oNode1, oNode2) {
    if (oNode1 === oNode2) {
        return true;
    }
    if (!oNode1 || !oNode2) {
        return false;
    }
    if (oNode1.isEqualNode) {
        return oNode1.isEqualNode(oNode2);
    }
    if (oNode1.nodeType != oNode2.nodeType) {
        return false;
    }
    if (oNode1.nodeValue != oNode2.nodeValue) {
        return false;
    }
    if (oNode1.baseName != oNode2.baseName) {
        return false;
    }
    if (oNode1.nodeName != oNode2.nodeName) {
        return false;
    }
    if (oNode1.nameSpaceURI != oNode2.nameSpaceURI) {
        return false;
    }
    if (oNode1.prefix != oNode2.prefix) {
        return false;
    }
    if (oNode1.nodeType != 1) {
        return true;
    }
    if (oNode1.attributes.length != oNode2.attributes.length) {
        return false;
    }
    for (var i = 0; i < oNode1.attributes.length; i++) {
        if (!jQuery.sap.isEqualNode(oNode1.attributes[i], oNode2.attributes[i])) {
            return false;
        }
    }
    if (oNode1.childNodes.length != oNode2.childNodes.length) {
        return false;
    }
    for (var i = 0; i < oNode1.childNodes.length; i++) {
        if (!jQuery.sap.isEqualNode(oNode1.childNodes[i], oNode2.childNodes[i])) {
            return false;
        }
    }
    return true;
};
jQuery.sap.getParseError = XMLHelper.getParseError;