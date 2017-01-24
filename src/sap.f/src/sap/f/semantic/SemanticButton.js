/*!
 * ${copyright}
 */

sap.ui.define([
	"./SemanticControl",
	"./SemanticConfiguration",
	"sap/m/Button",
	"sap/m/OverflowToolbarButton"
], function(SemanticControl, SemanticConfiguration, Button, OverflowToolbarButton) {
	"use strict";

	/**
	* Constructor for a new <code>SemanticButton</code>.
	*
	* @param {string} [sId] ID for the new control, generated automatically if no ID is given
	* @param {object} [mSettings] Initial settings for the new control
	*
	* @class
	* A <code>SemanticButton</code> is either a {@link sap.m.Button} or {@link sap.m.OverflowToolbarButton} ,
	* eligible for aggregation content of a {@link sap.f.semantic.SemanticPage}.
	*
	* @extends <code>sap.f.semantic.SemanticControl</code>
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
				 * Determines if the <code>SemanticButton</code> is enabled or disabled (default is true).
				 */
				enabled : {type : "boolean", group : "Behavior", defaultValue : true}
			},
			events : {
				/**
				* Event is fired when the user clicks on the <code>SemanticButton</code>.
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
}, /* bExport= */ false);
