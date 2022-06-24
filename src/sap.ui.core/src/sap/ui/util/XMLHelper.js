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
	 * Parses the specified XML string into an XML document, using the native parsing functionality of the
	 * browser. If an error occurs during parsing, a {@link module:sap/base/util/XMLHelper.XMLParseErrorInfo
	 * parse error info object} is attached as the <code>parseError</code> property of the returned document.
	 *
	 * @param {string} sXMLText An XML string
	 * @returns {XMLDocument} the parsed XML document with a <code>parseError</code> property as described in
	 *          {@link #getParseError}. An error occurred if the <code>errorCode</code> property of the
	 *          <code>parseError</code> is not 0.
	 * @public
	 * @static
	 */
	Helper.parse = function (sXMLText) {
		var oXMLDocument;
		var oParseError;
		var DomHelper = new DOMParser();

		oXMLDocument = DomHelper.parseFromString(sXMLText, "application/xml");

		oParseError = Helper.getParseError(oXMLDocument);
		if (oParseError) {
			if (!oXMLDocument.parseError) {
				oXMLDocument.parseError = oParseError;
			}
		}

		return oXMLDocument;
	};

	/**
	 * Error information as provided by the <code>DOMParser</code>.
	 *
	 * Note that the set of properties with meaningful content differs between browsers.
	 *
	 * @typedef {object} module:sap/base/util/XMLHelper.XMLParseErrorInfo
	 * @property {int} [errorCode=-1]
	 * @property {sap.ui.core.URI} [url=""]
	 * @property {string} [reason="unknown error"]
	 * @property {string} [srcText=""]
	 * @property {int} [line=-1]
	 * @property {int} [linepos=-1]
	 * @property {int} [filepos=-1]
	 * @property {"error"|"warning"} [type="error"]
	 * @public
	 */

	/**
	 * Extracts parse error information from the specified document (if any).
	 *
	 * If an error was found, the returned object contains a browser-specific subset of
	 * the properties described in {@link module:sap/base/util/XMLHelper.XMLParseErrorInfo XMLParseErrorInfo}.
	 * Otherwise, it just contains an <code>errorCode</code> property with value 0.
	 *
	 * @param {XMLDocument} oDocument
	 *    The parsed XML document
	 * @returns {module:sap/base/util/XMLHelper.XMLParseErrorInfo}
	 *    A browser-specific error info object if errors were found, or an object with an <code>errorCode<code> of 0 only
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
			filepos : -1,
			type : "error"
		};

		// Firefox
		if (Device.browser.firefox && oDocument && oDocument.documentElement
			&& oDocument.documentElement.tagName == "parsererror") {

			var sErrorText = oDocument.documentElement.firstChild.nodeValue,
				rParserError = /XML Parsing Error: (.*)\nLocation: (.*)\nLine Number (\d+), Column (\d+):(.*)/,
				oMatch = rParserError.exec(sErrorText);

			if (oMatch) {
				oParseError.reason = oMatch[1];
				oParseError.url = oMatch[2];
				oParseError.line = parseInt(oMatch[3]);
				oParseError.linepos = parseInt(oMatch[4]);
				oParseError.srcText = oMatch[5];
				oParseError.type = "error";

			}
			return oParseError;
		}

		// Safari or Chrome
		if (Device.browser.webkit && oDocument && oDocument.documentElement
			&& oDocument.getElementsByTagName("parsererror").length > 0) {

			var sErrorText = Helper.serialize(oDocument),
				rParserError = /(error|warning) on line (\d+) at column (\d+): ([^<]*)\n/,
				oMatch = rParserError.exec(sErrorText);

			if (oMatch) {
				oParseError.reason = oMatch[4];
				oParseError.url = "";
				oParseError.line = parseInt(oMatch[2]);
				oParseError.linepos = parseInt(oMatch[3]);
				oParseError.srcText = "";
				oParseError.type = oMatch[1];

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
	 * Serializes the specified DOM tree into a string representation.
	 *
	 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/XMLSerializer/serializeToString}
	 * @param {Node|Attr} oXMLDocument the XML document object to be serialized as string
	 * @returns {string} the serialized XML string
	 * @public
	 * @static
	 */
	Helper.serialize = function(oXMLDocument) {
		var oSerializer = new XMLSerializer();
		return oSerializer.serializeToString(oXMLDocument);
	};

	return Helper;
});
