/*!
 * ${copyright}
 */

// Provides a filter for list bindings
sap.ui.define(['jquery.sap.global', 'sap/ui/base/Exception'],
	function(jQuery, Exception) {
	"use strict";


	/**
	 * ParseException class
	 *
	 * This exception is thrown, when a parse error occurs while converting a
	 * string value to a specific property type in the model.
	 * @name sap.ui.model.ParseException
	 */
	var ParseException = function(message) {
		this.name = "ParseException";
		this.message = message;
	};
	ParseException.prototype = jQuery.sap.newObject(Exception.prototype);

	return ParseException;

}, /* bExport= */ true);
