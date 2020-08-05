/*!
 * ${copyright}
 */
sap.ui.define(['sap/ui/Device'], function(Device) {
	"use strict";

	/**
	 * Provides functionality for parsing XML formatted strings and serializing XML documents.
	 *
	 * @namespace
	 * @since 1.58
	 * @alias module:sap/ui/util/XMLHelper
	 * @public
	 */
	var Helper = {};

	/**
	 * Parses the specified XML formatted string text using native parsing
	 * function of the browser and returns a valid XML document. If an error
	 * occurred during parsing a parse error xobject is returned as property (parseError) of the
	 * returned XML document object. The parse error object has the following error
	 * information parameters: errorCode, url, reason, srcText, line, linepos, filepos
	 *
	 * @param {string} sXMLText the XML data as string
	 * @returns {object} the parsed XML document with a parseError property as described in
	 *          getParseError. An error occurred if the errorCode property of the parseError is != 0.
	 * @public
	 * @static
	 */
	Helper.parse = function (sXMLText) {
		var oXMLDocument;
		var oParseError;
		var DomHelper = new DOMParser();

		try {
			oXMLDocument = DomHelper.parseFromString(sXMLText, "text/xml");
		} catch (e) {
			oParseError = Helper.getParseError();
			oParseError.reason = e.message;
			oXMLDocument = {};
			oXMLDocument.parseError = oParseError;
			return oXMLDocument;
		}

		oParseError = Helper.getParseError(oXMLDocument);
		if (oParseError) {
			if (!oXMLDocument.parseError) {
				oXMLDocument.parseError = oParseError;
			}
		}

		return oXMLDocument;
	};

	/**
	 * Extracts parse error information from the specified document (if any).
	 *
	 * If an error was found the returned object has the following error
	 * information parameters: errorCode, url, reason, srcText, line, linepos,
	 * filepos
	 *
	 * @param {string} oDocument the parsed XML document
	 * @returns {object} oParseError if errors were found, or an object with an errorCode of 0 only
	 * @public
	 * @static
	 */
	Helper.getParseError = function(oDocument) {
		var oParseError = {
			errorCode : -1,
			url : "",
			reason : "unknown error",
			srcText : "",
			line : -1,
			linepos : -1,
			filepos : -1
		};

		// IE
		if (Device.browser.msie && oDocument && oDocument.parseError
			&& oDocument.parseError.errorCode != 0) {
			return oDocument.parseError;
		}

		// Firefox or Edge
		if ((Device.browser.firefox || Device.browser.edge) && oDocument && oDocument.documentElement
			&& oDocument.documentElement.tagName == "parsererror") {

			var sErrorText = oDocument.documentElement.firstChild.nodeValue,
				rParserError = /XML Parsing Error: (.*)\nLocation: (.*)\nLine Number (\d+), Column (\d+):(.*)/;

			if (rParserError.test(sErrorText)) {
				oParseError.reason = RegExp.$1;
				oParseError.url = RegExp.$2;
				oParseError.line = parseInt(RegExp.$3);
				oParseError.linepos = parseInt(RegExp.$4);
				oParseError.srcText = RegExp.$5;

			}
			return oParseError;
		}

		// Safari or Chrome
		if (Device.browser.webkit && oDocument && oDocument.documentElement
			&& oDocument.getElementsByTagName("parsererror").length > 0) {

			var sErrorText = Helper.serialize(oDocument),
				rParserError = /(error|warning) on line (\d+) at column (\d+): ([^<]*)\n/;

			if (rParserError.test(sErrorText)) {
				oParseError.reason = RegExp.$4;
				oParseError.url = "";
				oParseError.line = parseInt(RegExp.$2);
				oParseError.linepos = parseInt(RegExp.$3);
				oParseError.srcText = "";
				oParseError.type = RegExp.$1;

			}
			return oParseError;
		}

		if (!oDocument || !oDocument.documentElement) {
			return oParseError;
		}

		return	{
			errorCode : 0
		};
	};

	/**
	 * Serializes the specified XML document into a string representation.
	 *
	 * @param {string} oXMLDocument the XML document object to be serialized as string
	 * @returns {object} the serialized XML string
	 * @public
	 * @static
	 */
	Helper.serialize = function(oXMLDocument) {
		var oSerializer = new XMLSerializer();
		return oSerializer.serializeToString(oXMLDocument);
	};

	return Helper;
});