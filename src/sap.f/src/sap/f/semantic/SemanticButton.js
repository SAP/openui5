/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/m/semantic/SemanticButton",
	"sap/f/semantic/SemanticConfiguration"
], function(MSemanticButton, SemanticConfiguration) {
	"use strict";

	/**
	* Constructor for a new <code>SemanticButton</code>.
	*
	* @param {string} [sId] ID for the new control, generated automatically if no ID is given
	* @param {object} [mSettings] Initial settings for the new control
	*
	* @class
	* A base class for the available semantic actions, such as {@link sap.f.semantic.AddAction AddAction},
	* {@link sap.f.semantic.CloseAction CloseAction}, etc.
	*
	* @extends sap.m.semantic.SemanticButton
	* @abstract
	*
	* @author SAP SE
	* @version ${version}
	*
	* @constructor
	* @public
	* @since 1.46.0
	* @alias sap.f.semantic.SemanticButton
	*/
	var SemanticButton = MSemanticButton.extend("sap.f.semantic.SemanticButton", /** @lends sap.f.semantic.SemanticButton.prototype */ {
		metadata : {
			library : "sap.f",
			"abstract" : true
		}
	});

	/**
	 * @override
	 */
	SemanticButton.prototype._getConfiguration = function () {
		return SemanticConfiguration.getConfiguration(this.getMetadata().getName());
	};

	return SemanticButton;
});
