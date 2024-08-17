/*!
 * ${copyright}
 */
sap.ui.define([
		'sap/ui/mdc/condition/Operator',
		'sap/ui/mdc/util/DateUtil',
		'sap/ui/mdc/enums/OperatorValueType',
		'sap/ui/model/Filter',
		'sap/ui/model/FilterOperator',
		'sap/base/Log'
	], (
	Operator,
	DateUtil,
	OperatorValueType,
	Filter,
	FilterOperator,
	Log
) => {
	"use strict";

	/**
	 * @class
	 * Creates a <code>sap.ui.mdc.condition.RangeOperator</code> object.
	 * This is used in the {@link sap.ui.mdc.FilterField FilterField} control to define which filter operators are supported.
	 *
	 * <b>Note:</b> Use this class only for filter field of type date or time related data types.
	 *
	 * If a function or property is initial, the default implementation is used.
	 *
	 * @extends sap.ui.mdc.condition.Operator
	 * @param {object} oConfiguration Includes all parameters of {@link sap.ui.mdc.condition.Operator Operator} and adds some special ones
	 * @param {string[]} [oConfiguration.label] Additional array of labels for the values of the operator. Will be shown as placeholder text or label of the value fields.
	 * @param {function} oConfiguration.calcRange Function to calculate the date range of the operation. The function returns an array of <code>UniversalDates</code>. In case of a single <code>filterOperator</code> the array can return a single value.
	 * @param {function} [oConfiguration.formatRange] Function to format the date range.
	 * @param {int[]|function} [oConfiguration.defaultValues] Array of values for the defaults of <code>RangeOperators</code> parameter. This can be a function, which returns the array of values. If not used the default for the values is 1.
	 * @constructor
	 * @author SAP SE
	 * @version ${version}
	 * @public
	 * @alias sap.ui.mdc.condition.RangeOperator
	 * @since 1.74.0
	 * @author SAP SE
	 */
	const RangeOperator = Operator.extend("sap.ui.mdc.condition.RangeOperator", /** @lends sap.ui.mdc.condition.RangeOperator.prototype */ {
		constructor: function(oConfiguration) {
			oConfiguration.filterOperator = oConfiguration.filterOperator || FilterOperator.BT;
			if (oConfiguration.valueTypes && oConfiguration.valueTypes.length > 0) {
				if (oConfiguration.valueTypes[0] === OperatorValueType.Static) { // as static operators cannot hold any value only the text is interesting
					if (oConfiguration.longText && oConfiguration.longText !== oConfiguration.tokenText && oConfiguration.tokenText) {
						oConfiguration.tokenTest = oConfiguration.tokenTest || "^" + oConfiguration.longText + "$|^#tokenText#$"; // as static text don't need to be entered allow longText too
					} else if (oConfiguration.longText && !oConfiguration.tokenText) {
						oConfiguration.tokenTest = oConfiguration.tokenTest || "^" + oConfiguration.longText + "$"; // as static text don't need to be entered allow longText too
					} else {
						oConfiguration.tokenTest = oConfiguration.tokenTest || "^#tokenText#$";
					}
					oConfiguration.tokenParse = oConfiguration.tokenParse || "^(.+)?$"; // as no value can be entered, everything is valid (validity tested with tokenTest)
				} else {
					oConfiguration.tokenTest = oConfiguration.tokenTest || "^#tokenText#$";
					oConfiguration.tokenParse = oConfiguration.tokenParse || "^#tokenText#$|^(.+)?$"; // if text not entered take everything as just argument might be entered
				}
			} else {
				oConfiguration.tokenParse = oConfiguration.tokenParse || "^#tokenText#$";
			}
			oConfiguration.tokenFormat = oConfiguration.tokenFormat || (!!oConfiguration.tokenText && "#tokenText#");

			Operator.apply(this, arguments);

			// if the rangeOperator uses paramTypes, add the same number of valueDefaults
			if (this.paramTypes) {
				if (oConfiguration.defaultValues !== undefined) {
					if (Array.isArray(oConfiguration.defaultValues)) {
						this.valueDefaults = oConfiguration.defaultValues;
					} else {
						this.valueDefaults = oConfiguration.defaultValues();
					}
				} else {
					this.paramTypes.forEach((oType) => {
						if (!this.valueDefaults) {
							this.valueDefaults = [];
						}
						this.valueDefaults.push(1); // add a default value 1 for a RangeOperator value
					});
				}
			}

			if (oConfiguration.label !== undefined) {
				// label: array of strings of labels will be used as placeholder text inside the value fields on the defineConditionPanel.
				this.aLabels = oConfiguration.label;
			}

			if (oConfiguration.calcRange) {
				this.calcRange = oConfiguration.calcRange;
			}

			if (oConfiguration.formatRange) {
				this.formatRange = oConfiguration.formatRange;
			} else if (this.calcRange) {
				this.formatRange = function(aRange, oDataType) {
					return oDataType.formatValue(aRange[0], "string") + (aRange[1] ? " - " + oDataType.formatValue(aRange[1], "string") : "");
				};
			}

		}
	});

	RangeOperator.prototype.getModelFilter = function(oCondition, sFieldPath, oType, bCaseSensitive, sBaseType) {
		const aRange = this._getRange(oCondition.values, oType, sBaseType);
		return new Filter({ path: sFieldPath, operator: this.filterOperator, value1: aRange[0], value2: aRange[1] });
	};

	RangeOperator.prototype._getRange = function(aValues, oType, sBaseType) {
		let aRange; // contains UniversalDates in local time
		if (aValues) {
			if (aValues.length === 2) {
				aRange = this.calcRange(aValues[0], aValues[1]);
			} else {
				aRange = this.calcRange(aValues[0]);
			}
		} else {
			aRange = this.calcRange();
		}

		for (let i = 0; i < aRange.length; i++) {
			//the calcRange result must be converted from local time into the correct type format.
			aRange[i] = DateUtil.dateToType(aRange[i].getJSDate(), oType, sBaseType);
		}

		return aRange; // containes type presentation of dates in local time
	};

	/**
	 * Creates the static text of the operator
	 *
	 * @param {sap.ui.model.Type} oType data type of the used {@link sap.ui.mdc.FilterField FilterField}
	 * @return {string} static text
	 *
	 * @private
	 * @ui5-restricted sap.ui.mdc.valuehelp.base.DefineConditionPanel
	 */
	RangeOperator.prototype.getStaticText = function(oType) {
		const aRange = this._getRange(null, oType);
		return this.formatRange(aRange, oType);
	};

	RangeOperator.prototype.format = function(oCondition, oType, sDisplay, bHideOperator, aCompositeTypes, oAdditionalType, aAdditionalCompositeTypes, sCustomFormat) { // sDisplay, oAdditionalType and aAdditionalCompositeTypes needed in EQ formatter

		const sTokenText = sCustomFormat || this.tokenFormat;

		if (this.valueTypes.length === 1 && this.valueTypes[0] === OperatorValueType.Static && sTokenText.indexOf("{0}") >= 0) {
			// for static Operators what should display a real value use static text
			const sReplace = this.getStaticText(oType);
			return sTokenText.replace(new RegExp("\\{" + 0 + "\\}", "g"), sReplace);
		}

		return Operator.prototype.format.apply(this, arguments);

	};
	return RangeOperator;

});