/*!
 * ${copyright}
 */

// Provides class sap.ui.model.FormatException
sap.ui.define(['sap/ui/base/Exception'],
	function(Exception) {
	"use strict";

	/**
	 * Creates a new FormatException.
	 *
	 * @param {string} message
	 *   A message explaining why the formatting of a value failed
	 *
	 * @alias sap.ui.model.FormatException
	 * @class
	 * @classdesc
	 *   Instances of this exception are thrown when converting a model value to its representation
	 *   on the UI fails.
	 *
	 * @public
	 * @see sap.ui.model.SimpleType#formatValue
	 */
	var FormatException = function (message) {
		this.name = "FormatException";
		this.message = message;
	};

	FormatException.prototype = Object.create(Exception.prototype);

	return FormatException;
}, /* bExport= */ true);