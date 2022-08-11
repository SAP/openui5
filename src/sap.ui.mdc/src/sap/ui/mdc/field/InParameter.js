/*!
 * ${copyright}
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
	 * The {@link sap.ui.mdc.field.FieldValueHelp FieldValueHelp} element supports in parameters. The binding to the data is defined in this element.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 * @class The <code>InParameter</code> element is used in the {@link sap.ui.mdc.field.FieldValueHelp FieldValueHelp} element.
	 * @extends sap.ui.core.Element
	 * @version ${version}
	 * @constructor
	 * @abstract
	 * @private
	 * @ui5-restricted sap.fe
	 * @MDC_PUBLIC_CANDIDATE
	 * @since 1.66.0
	 * @alias sap.ui.mdc.field.InParameter
	 */
	var InParameter = Element.extend("sap.ui.mdc.field.InParameter", /** @lends sap.ui.mdc.field.InParameter.prototype */
	{
		metadata: {
			library: "sap.ui.mdc",
			properties: {
				/**
				 * The value of the in parameter.
				 *
				 * Here the data of the model can be bound.
				 * In the {@link sap.ui.mdc.FilterField FilterField} case this is the {@link sap.ui.mdc.condition.ConditionModel ConditionModel}.
				 *
				 * <b>Note:</b> Here we recommend one-way-binding.
				 */
				value: {
					type: "any",
					byValue: true,
					defaultValue: null // otherwise null will be converted to undefined what could lead to issues with comparing values
				},
				/**
				 * Name of the field in the <code>ListBinding</code> used in the value help.
				 *
				 * This is needed to define the filter for the corresponding field in the help.
				 */
				helpPath: {
					type: "string"
				},
				/**
				 * If set, an initial value of <code>InParameter</code> starts a filtering for the <code>empty</code> operator.
				 *
				 * <b>Note:</b> This property must not be used for {@link sap.ui.mdc.FilterField FilterField} and if bound to {@link sap.ui.mdc.condition.ConditionModel ConditionModel}.
				 * In this case, a filtering for the empty operator must be defined by the assigned conditions.
				 *
				 * <b>Note:</b> This property must only be set if the data type used supports a filtering for the empty operator.
				 *
				 * <b>Note:</b> Do not set this property if an empty string is a valid key for the <code>InParameter</code> used.
				 *
				 * @since 1.86.0
				 */
				initialValueFilterEmpty: {
					type: "boolean",
					defaultValue: false
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
	 * @private
	 * @ui5-restricted sap.ui.mdc.field.FieldValueHelp
	 */
	InParameter.prototype.getFieldPath = function() {

		var oBinding = this.getBinding("value");
		var sPath;

		if (oBinding) {
			sPath = oBinding.getPath();
		} else {
			var oBindingInfo = this.getBindingInfo("value");
			if (oBindingInfo) {
				if (oBindingInfo.path) {
					sPath = oBindingInfo.path;
				} else if (oBindingInfo.parts && oBindingInfo.parts.length === 1) {
					sPath = oBindingInfo.parts[0].path;
				}
			}
		}

		if (sPath && sPath.startsWith("/")) {
				sPath = sPath.slice(1);
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
	 * If the <code>value</code> property is bound to a {@link sap.ui.mdc.condition.ConditionModel ConditionModel} model it must handle conditions.
	 * Only in this case multiple values are supported. Otherwise the value is just updated.
	 *
	 * @returns {boolean} <code>true</code> if conditions are used
	 *
	 * @private
	 * @ui5-restricted sap.ui.mdc.field.FieldValueHelp
	 */
	InParameter.prototype.getUseConditions = function() {

		var bUseCondition = false;

		if (this._bConditionModel) {
			bUseCondition = true;
		} else if (!this._bBound) {
			var oBindingInfo = this.getBindingInfo("value");
			if (oBindingInfo) {
				// binding just not resolved
				var sPath;
				if (oBindingInfo.path) {
					sPath = oBindingInfo.path;
				} else if (oBindingInfo.parts && oBindingInfo.parts.length === 1) {
					sPath = oBindingInfo.parts[0].path;
				}
				if (sPath.startsWith("/conditions/")) {
					bUseCondition = true;
				}
			} else {
				// if not bound, check if condition array is set to value
				var vValue = this.getValue();
				if (Array.isArray(vValue) && (vValue.length === 0 || vValue[0].hasOwnProperty("operator"))) {
					bUseCondition = true;
				}
			}
		}

		return bUseCondition;

	};

	/**
	 * Returns the used data type.
	 *
	 * @returns {sap.ui.model.Type} data type
	 *
	 * @private
	 * @ui5-restricted sap.ui.mdc.field.FieldValueHelp
	 * @since 1.86.0
	 */
	InParameter.prototype.getDataType = function() {

		var oType;

		// TODO: how to provide type if ConditionModel is used?
		if (!this.getUseConditions()) {
			var oBinding = this.getBinding("value");
			if (oBinding) {
				oType = oBinding.getType();
			}
		}

		return oType;

	};

	return InParameter;

});
