/*!
 * ${copyright}
 */

// Provides class sap.ui.model.ValidateException
sap.ui.define(['sap/ui/base/Exception'],
	function (Exception) {
	"use strict";

	/**
	 * Creates a new ValidateException.
	 *
	 * @param {string} message
	 *   A message explaining why the validation failed; this message is language dependent as it
	 *   may be displayed on the UI
	 * @param {string[]} [violatedConstraints]
	 *   Names of the constraints that are violated; the names should be the same as documented in
	 *   the type's constructor
	 *
	 * @alias sap.ui.model.ValidateException
	 * @class
	 * @classdesc
	 *   Instances of this exception are thrown when constraints of a type are violated.
	 *
	 * @public
	 * @see sap.ui.model.SimpleType#validateValue
	 */
	var ValidateException = function (message, violatedConstraints) {
		this.name = "ValidateException";
		this.message = message;
		this.violatedConstraints = violatedConstraints;
	};

	ValidateException.prototype = Object.create(Exception.prototype);

	return ValidateException;
}, /* bExport= */ true);