/*!
 * ${copyright}
 */

// Provides a filter for list bindings
sap.ui.define(['sap/ui/base/Exception'],
	function(Exception) {
	"use strict";


	/**
	 * Creates a new ValidateException.
	 *
	 * @class Instances of this exception are thrown when a validation error
	 * occurs while checking the defined constraints for a type.
	 *
	 * @param {string} message Message explaining how the validation failed
	 * @param {string[]} [violatedConstraints] Names of the constraints that will be violated;
	 *   names should be the same as documented for the type constructor
	 * @alias sap.ui.model.ValidateException
	 * @public
	 */
	var ValidateException = function(message, violatedConstraints) {
		this.name = "ValidateException";
		this.message = message;
		this.violatedConstraints = violatedConstraints;
	};
	ValidateException.prototype = Object.create(Exception.prototype);


	return ValidateException;

}, /* bExport= */ true);
