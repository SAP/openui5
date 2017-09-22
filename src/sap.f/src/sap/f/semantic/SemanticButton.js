/*!
 * ${copyright}
 */

sap.ui.define([
	"./SemanticControl",
	"sap/m/Button",
	"sap/m/OverflowToolbarButton"
], function(SemanticControl, Button, OverflowToolbarButton) {
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
	* @extends sap.f.semantic.SemanticControl
	* @abstract
	*
	* @author SAP SE
	* @version ${version}
	*
	* @constructor
	* @public
	* @since 1.46.0
	* @alias sap.f.semantic.SemanticButton
	* @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	*/
	var SemanticButton = SemanticControl.extend("sap.f.semantic.SemanticButton", /** @lends sap.f.semantic.SemanticButton.prototype */ {
		metadata : {
			library : "sap.f",
			"abstract" : true,
			properties : {
				/**
				 * Determines whether the <code>SemanticButton</code> is enabled.
				 */
				enabled : {type : "boolean", group : "Behavior", defaultValue : true}
			},
			events : {
				/**
				* Fired when the user selects the <code>SemanticButton</code>.
				*/
				press : {}
			}
		}
	});

	/**
	 * @override
	 */
	SemanticButton.prototype._getControl = function() {
		var oControl = this.getAggregation('_control'),
			oConfig = this._getConfiguration(),
			oClass, oNewInstance;

		if (!oConfig) {
			return null;
		}

		if (!oControl) {
			oClass = oConfig && oConfig.constraints === "IconOnly" ? OverflowToolbarButton : Button;
			oNewInstance = this._createInstance(oClass);
			oNewInstance.applySettings(oConfig.getSettings());

			if (typeof oConfig.getEventDelegates === "function") {
				oNewInstance.addEventDelegate(oConfig.getEventDelegates(oNewInstance));
			}

			this.setAggregation('_control', oNewInstance, true);
			oControl = this.getAggregation('_control');
		}

		return oControl;
	};

	SemanticButton.prototype._createInstance = function(oClass) {
		return new oClass({
			id: this.getId() + "-button",
			press: jQuery.proxy(this.firePress, this)
		});
	};

	return SemanticButton;
});
