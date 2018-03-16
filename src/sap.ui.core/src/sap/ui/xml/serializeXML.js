/*!
 * ${copyright}
 */
/*
 * IMPORTANT: This is a private module, its API must not be used and is subject to change.
 * Code other than the OpenUI5 libraries must not introduce dependencies to this module.
 */
sap.ui.define([], function() {
	"use strict";

	/**
	 * Serializes the specified XML document into a string representation.
	 *
	 * @function
	 * @exports sap/ui/xml/serializeXML
	 * @param {string} oXMLDocument the XML document object to be serialized as string
	 * @returns {object} the serialized XML string
	 * @private
	 */
	var fnSerializeXML = function(oXMLDocument) {
		var oSerializer = new XMLSerializer();
		return oSerializer.serializeToString(oXMLDocument);
	};


	return fnSerializeXML;
});