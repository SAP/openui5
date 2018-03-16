/*!
 * ${copyright}
 */

// Provides xml parsing and error checking functionality.
sap.ui.define([
	'jquery.sap.global',
	'sap/ui/xml/XMLParser',
	'sap/ui/xml/serializeXML'
], function(jQuery, XMLParser, serializeXML) {
	"use strict";

	/**
	 * Parses the specified XML formatted string text using native parsing
	 * function of the browser and returns a valid XML document. If an error
	 * occurred during parsing a parse error object is returned as property (parseError) of the
	 * returned XML document object. The parse error object has the following error
	 * information parameters: errorCode, url, reason, srcText, line, linepos, filepos
	 *
	 * @param {string}
	 *            sXMLText the XML data as string
	 * @return {object} the parsed XML document with a parseError property as described in
	 *         getParseError. An error occurred if the errorCode property of the parseError is != 0.
	 * @public
	 * @function
	 */
	jQuery.sap.parseXML = XMLParser.parse;

	/**
	 * Serializes the specified XML document into a string representation.
	 *
	 * @param {string}
	 *            oXMLDocument the XML document object to be serialized as string
	 * @return {object} the serialized XML string
	 * @public
	 */
	jQuery.sap.serializeXML = function(oXMLDocument) {
		var sXMLString = "";
		if (window.ActiveXObject) {
			sXMLString = oXMLDocument.xml;
			if (sXMLString) {
				return sXMLString;
			}
		}
		if (window.XMLSerializer) {
			return serializeXML(oXMLDocument);
		}
		return sXMLString;
	};

	jQuery.sap.isEqualNode = function(oNode1, oNode2) {
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
			return true; //ELEMENT_NODE
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

	/**
	 * Extracts parse error information from the specified document (if any). If
	 * an error was found the returned object has the following error
	 * information parameters: errorCode, url, reason, srcText, line, linepos,
	 * filepos
	 *
	 * @return oParseError if errors were found, or an object with an errorCode of 0 only
	 * @private
	 * @function
	 */
	jQuery.sap.getParseError = XMLParser.getParseError;

	return jQuery;

});
