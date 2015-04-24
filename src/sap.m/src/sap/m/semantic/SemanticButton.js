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
				 * Type of a button (e.g. Default, Accept, Reject, Back, etc.)
				 */
				buttonType : {
					type : "sap.m.ButtonType",
					group : "Appearance",
					defaultValue : sap.m.ButtonType.Default
				},

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

		if ((sPropertyName === "type") || this._getControl()) { // either (1) the type of the semantic wrapper control is being given
														// or (2) the property has to be forwarded to the inner control, so that control has to be given
			if (sPropertyName === "buttonType") {
				this._getControl().setProperty("type", oValue, bSuppressInvalidate);
				return this;
			}
			SemanticControl.prototype.setProperty.call(this, sPropertyName, oValue, bSuppressInvalidate);
		}

		this._aSettings || (this._aSettings = {});
		this._aSettings[sPropertyName] = oValue; // cache properties to apply upon deferred creation of inner control

		return this;
	};

	SemanticButton.prototype.getProperty = function(key) {

		if ((key === "type")  || this._getControl()) {
			if (key === "buttonType") {
				return this._getControl().getProperty("type");
			}
			return SemanticControl.prototype.getProperty.call(this, key);
		}

		return (this._aSettings)  ? this._aSettings[key] : null;
	};

	/**
	 * @Overwrites
	 */
	SemanticButton.prototype._getControl = function() {

		var oControl = this.getAggregation('_control');
		if ((!oControl || this._bTypeChanged)) {

			this._bTypeChanged = false;

			var oClass = this._getConfiguration()
					&& this._getConfiguration().constraints === "IconOnly" ? OverflowToolbarButton : Button;
			var bReinstantiate = oControl && (oControl.getMetadata().getName() !== oClass.getMetadata().getName());
			var oOldParent, sOldParentAggregationName;

			if (bReinstantiate) {
				oOldParent = oControl.getParent();
				sOldParentAggregationName = oControl.sParentAggregationName;
				oOldParent.removeAggregation(sOldParentAggregationName, oControl);
				this.setAggregation('_control', null);
				oControl.destroy();
			}
			if (!oControl || bReinstantiate) {

				var oNewInstance = new oClass({
					id: this.getId() + "-button",
					press: jQuery.proxy(this.firePress, this)
				});

				this.setAggregation('_control', oNewInstance, true); //TODO: check bSuppressInvalidate needed?

				oControl = this.getAggregation('_control');

				if (this._aSettings) {
					delete this._aSettings["type"];
					SemanticControl.prototype.applySettings.call(this, this._aSettings);
				}
			}
		}

		return oControl;
	};


	return SemanticButton;
}, /* bExport= */ true);
