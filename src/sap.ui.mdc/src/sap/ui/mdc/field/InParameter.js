/*
 * ! ${copyright}
 */

sap.ui.define([
	'sap/ui/core/Element'
	], function(
		Element
	) {
	"use strict";

	/**
	 * Constructor for a new <code>InParameter</code>.
	 *
	 * The <code>FieldValueHelp</code> element supports in parameters. The binding to the data is defined in this element.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 * @class Base type for <code>InParameter</code> control.
	 * @extends sap.ui.core.Element
	 * @version ${version}
	 * @constructor
	 * @abstract
	 * @private
	 * @since 1.66.0
	 * @alias sap.ui.mdc.field.InParameter
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var InParameter = Element.extend("sap.ui.mdc.field.InParameter", /** @lends sap.ui.mdc.field.InParameter.prototype */
	{
		metadata: {
			library: "sap.ui.mdc",
			properties: {
				/**
				 * The value of the in parameter.
				 *
				 * Here the data of the model can be bound. In the <code>FilterField</code> case this is the <code>ConditionModel</code>.
				 *
				 * <b>Note:</b> Here we recommend one-way-binding.
				 */
				value: {
					type: "any",
					byValue: true
				},
				/**
				 * Name of the field in the <code>ListBinding</code> used in the value help.
				 *
				 * This is needed to define the filter for the corresponding field in the help.
				 */
				helpPath: {
					type: "string"
				}
			},
			defaultProperty: "value"
		}
	});

	InParameter.prototype.init = function() {

		this.attachEvent("modelContextChange", _handleModelContextChange, this);

	};

	// define empty to add it to inherited elements, maybe later it might be filled and other elements must not changed.
	InParameter.prototype.exit = function() {

	};

	// use raw (unformatted) values for in-parameters
	InParameter.prototype.bindProperty = function(sName, oBindingInfo) {

		if (sName === "value" && !oBindingInfo.formatter) { // not if a formatter is used, as this needs to be executed
			oBindingInfo.targetType = "raw";
		}

		Element.prototype.bindProperty.apply(this, arguments);

	};

	/**
	 * Returns the path of the <code>InParameter</code> element.
	 *
	 * If the <code>value</code> property is bound to a model, the binding path is used.
	 * If no binding path is found, the value of the <code>helpPath</code> property is used.
	 *
	 * @returns {string} Path
	 *
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	InParameter.prototype.getFieldPath = function() {

		var oBinding = this.getBinding("value");
		var sPath = oBinding && oBinding.getPath();

		if (sPath) {
			if (sPath.startsWith("/conditions/")) {
				sPath = sPath.slice(12);
			} else if (sPath.startsWith("/")) {
				sPath = sPath.slice(1);
			}
		}

		if (!sPath) {
			sPath = this.getHelpPath();
		}

		return sPath;

	};

	function _handleModelContextChange(oEvent) {

		var oBinding = this.getBinding("value");
		this._bBound = false;
		this._bConditionModel = false;

		if (oBinding) {
			this._bBound = true;
			var oModel = oBinding.getModel();
			if (oModel && oModel.isA("sap.ui.mdc.condition.ConditionModel")) {
				this._bConditionModel = true;
			}
		}

	}

	/**
	 * Returns an indicator if conditions are used as values.
	 *
	 * If the <code>value</code> property is bound to a <code>ConditionModel</code> model it must handle conditions.
	 * Only in this case multiple values are supported. Otherwise the value is just updated.
	 *
	 * @returns {boolean} <code>true</code> if conditions are used
	 *
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	InParameter.prototype.getUseConditions = function() {

		var bUseCondition = false;

		if (this._bConditionModel) {
			bUseCondition = true;
		} else if (!this._bBound) {
			// if not bound, check if condition array is set to value
			var vValue = this.getValue();
			if (Array.isArray(vValue) && (vValue.length === 0 || vValue[0].hasOwnProperty("operator"))) {
				bUseCondition = true;
			}
		}

		return bUseCondition;

	};

	return InParameter;

});
