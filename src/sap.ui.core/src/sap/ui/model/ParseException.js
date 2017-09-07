/*!
 * ${copyright}
 */

// Provides a filter for list bindings
sap.ui.define(['sap/ui/base/Exception'],
	function(Exception) {
	"use strict";


	/**
	 * Create a new ParseException.
	 *
	 * @class Instances of this exception are thrown when an error occurs while
	 * converting a string value to a specific property type in the model.
	 *
	 * @param {string} message Message explaining how the validation failed
	 * @alias sap.ui.model.ParseException
	 * @public
	 */
	var ParseException = function(message) {
		this.name = "ParseException";
		this.message = message;
	};
	ParseException.prototype = Object.create(Exception.prototype);

	return ParseException;

}, /* bExport= */ true);
