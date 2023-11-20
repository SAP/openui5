/*!
 * ${copyright}
 */

sap.ui.define([
	'sap/m/semantic/SemanticControl',
	'sap/m/Button',
	'sap/m/semantic/SemanticOverflowToolbarButton',
	"sap/ui/thirdparty/jquery"
], function(SemanticControl, Button, SemanticOverflowToolbarButton, jQuery) {
	"use strict";

	/**
	 * Constructor for a new SemanticButton.
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * A semantic button is either a {@link sap.m.Button} or {@link sap.m.semantic.SemanticOverflowToolbarButton} ,
	 * eligible for aggregation content of a {@link sap.m.semantic.SemanticPage}.
	 *
	 * @extends sap.m.semantic.SemanticControl
	 * @abstract
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.30.0
	 * @alias sap.m.semantic.SemanticButton
	 */

	var SemanticButton = SemanticControl.extend("sap.m.semantic.SemanticButton", /** @lends sap.m.semantic.SemanticButton.prototype */ {
		metadata : {
			library : "sap.m",
			"abstract" : true,
			properties : {

				/**
				 * See {@link sap.m.Button#enabled}
				 */
				enabled : {
					type : "boolean",
					group : "Behavior",
					defaultValue : true
				}
			},
			events : {
				/**
				* See {@link sap.m.Button#event:press}
				*/
				press : {}
			}
		}
	});

	SemanticButton.prototype._getControl = function() {
		var oControl,
			oClass,
			oNewInstance,
			oConfig = this._getConfiguration();

		if (!oConfig) {
			return null;
		}

		oControl = this.getAggregation('_control');

		if (!oControl) {
			oClass = this._getClass(oConfig);
			oNewInstance = this._createInstance(oClass);
			oNewInstance.applySettings(oConfig.getSettings());

			if (typeof oConfig.getEventDelegates === "function") {
				oNewInstance.addEventDelegate(oConfig.getEventDelegates(oNewInstance));
			}

			this.setAggregation('_control', oNewInstance, true); // don't invalidate - this is only called before/during rendering, where invalidation would lead to double rendering,  or when invalidation anyway happens

			oControl = this.getAggregation('_control');
		}

		return oControl;
	};

	SemanticButton.prototype._getClass = function(oConfig) {
		return oConfig && oConfig.constraints === "IconOnly" ? SemanticOverflowToolbarButton : Button;
	};

	SemanticButton.prototype._createInstance = function(oClass) {
		return new oClass({
			id: this.getId() + "-button",
			press: jQuery.proxy(this.firePress, this)
		});
	};

	return SemanticButton;
});