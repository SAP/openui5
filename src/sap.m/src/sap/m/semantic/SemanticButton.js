/*!
 * ${copyright}
 */

sap.ui.define(['sap/m/semantic/SemanticControl', 'sap/m/Button', 'sap/m/OverflowToolbarButton'], function(SemanticControl, Button, OverflowToolbarButton) {
	"use strict";

	/**
	 * Constructor for a new SemanticButton.
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * A semantic button is either a {@link sap.m.Button} or {@link sap.m.OverflowButton} ,
	 * eligible for aggregation content of a {@link sap.m.semantic.SemanticPage}. Depending on its type,
	 * the semantic button is initialized with specific properties (text, icon etc.).
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
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */

	var SemanticButton = SemanticControl.extend("sap.m.semantic.SemanticButton", /** @lends sap.m.semantic.SemanticButton.prototype */ {
		metadata : {

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
				* See {@link sap.m.Button#press}
				*/
				press : {}
			}
		}
	});

	/**
	 * Forwards all properties to the inner control,
	 * except in the case where the property is 'type',
	 * since 'type' belongs to the semantic wrapper control itself
	 * @ param {string} sPropertyName - the name of the property to set
	 * @ param {any} oValue - value to set the property to
	 * @ param {boolean} [bSuppressInvalidate] if true, the managed object is not marked as changed
	 * @ return this
	 * @ public
	 */
	SemanticButton.prototype.setProperty = function(sPropertyName, oValue, bSuppressInvalidate) {

		if (!this.getMetadata().getProperties()[sPropertyName]
				&& !SemanticButton.getMetadata().getProperties()[sPropertyName]
					&& !SemanticControl.getMetadata().getProperties()[sPropertyName]) {

			jQuery.sap.log.error("unknown property: " + sPropertyName, this);
			return this;
		}

		SemanticControl.prototype.setProperty.call(this, sPropertyName, oValue, bSuppressInvalidate);

		return this;
	};

	SemanticButton.prototype.getProperty = function(key) {
		return SemanticControl.prototype.getProperty.call(this, key);
	};

	/**
	 * @Overwrites
	 */
	SemanticButton.prototype._getControl = function() {

		var oControl = this.getAggregation('_control');
		if (!oControl) {

			var oClass = this._getConfiguration()
				&& this._getConfiguration().constraints === "IconOnly" ? OverflowToolbarButton : Button;

			var oNewInstance = this._createInstance(oClass);

			oNewInstance.applySettings(this._getConfiguration().getSettings());

			this.setAggregation('_control', oNewInstance, true); //TODO: check bSuppressInvalidate needed?

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
}, /* bExport= */ true);
