/*!
 * ${copyright}
 */

// Provides class sap.ui.model.ParseException
sap.ui.define(['sap/ui/base/Exception'],
	function (Exception) {
	"use strict";

	/**
	 * Creates a new ParseException.
	 *
	 * @param {string} message
	 *   A message explaining why the parsing of a value failed; this message is language dependent
	 *   as it may be displayed on the UI
	 *
	 * @alias sap.ui.model.ParseException
	 * @class
	 * @classdesc
	 *   Instances of this exception are thrown when converting a string value to its model
	 *   representation fails.
	 *
	 * @public
	 * @see sap.ui.model.SimpleType#formatValue
	 */
	var ParseException = function (message) {
		this.name = "ParseException";
		this.message = message;
	};

	ParseException.prototype = Object.create(Exception.prototype);

	return ParseException;
}, /* bExport= */ true);