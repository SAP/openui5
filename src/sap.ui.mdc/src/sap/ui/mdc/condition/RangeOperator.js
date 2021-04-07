/*!
 * ${copyright}
*/
sap.ui.define([
		'sap/ui/mdc/condition/Operator',
		'sap/ui/model/Filter',
		'sap/ui/mdc/util/DateUtil',
		'sap/base/Log'
	],

	function(
		Operator,
		Filter,
		DateUtil,
		Log
	) {
		"use strict";

		/**
		 * @class
		 * Creates a <code>sap.ui.mdc.condition.RangeOperator</code> object.
		 * This is used in the {@link sap.ui.mdc.FilterField FilterField} control to define which filter operators are supported.
		 *
		 * If a function or property is initial, the default implementation is used.
		 *
		 * @extends sap.ui.mdc.condition.Operator
		 * @param {object} oConfiguration Included all parameters of {@link sap.ui.mdc.condition.Operator Operator} and adds some special ones
		 * @param {string} [oConfiguration.label] additional array of labels for the values of the operator. Will be shown as placeholder text or label on the value fields.
		 * @param {function} [oConfiguration.calcRange] function to calculate the date range of the operation. the function returns an array of UniversalDates.
		 * @param {function} [oConfiguration.formatRange] function to format the date range.
		 * @constructor
		 * @author SAP SE
		 * @version ${version}
		 * @private
		 * @ui5-restricted sap.fe
		 * @MDC_PUBLIC_CANDIDATE
		 * @alias sap.ui.mdc.condition.RangeOperator
		 * @since 1.74.0
		 * @author SAP SE
		 */
		var RangeOperator = Operator.extend("sap.ui.mdc.condition.RangeOperator", /** @lends sap.ui.mdc.condition.RangeOperator.prototype */ {
			constructor: function(oConfiguration) {
				oConfiguration.filterOperator = "RANGE"; // No default operator for the filter exist
				oConfiguration.tokenParse = oConfiguration.tokenParse || "^#tokenText#$";
				oConfiguration.tokenFormat = oConfiguration.tokenFormat || "#tokenText#";

				Operator.apply(this, arguments);

				// if the rangeOperator uses paramTypes, add the same number of valueDefaults
				if (this.paramTypes) {
					this.paramTypes.forEach(function(oType) {
						if (!this.valueDefaults) {
							this.valueDefaults = [];
						}
						this.valueDefaults.push(1); // add a defualt value 1 for a RangeOperator value
					}.bind(this));
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
						return oDataType.formatValue(aRange[0], "string") + " - " + oDataType.formatValue(aRange[1], "string");
					};
				}

			}
		});

		RangeOperator.prototype.getModelFilter = function(oCondition, sFieldPath, oType) {
			var aRange = this._getRange(oCondition.values, oType);
			return new Filter({ path: sFieldPath, operator: "BT", value1: aRange[0], value2: aRange[1] });
		};

		RangeOperator.prototype._getRange = function(aValues, oType) {
			var aRange;
			if (aValues) {
				if (aValues.length === 2) {
					aRange = this.calcRange(aValues[0], aValues[1]);
				} else {
					aRange = this.calcRange(aValues[0]);
				}
			} else {
				aRange = this.calcRange();
			}

			for (var i = 0; i < 2; i++) {
				//the calcRange result must be converted from local time to UTC and into the correct type format.
				if (oType.isA("sap.ui.model.odata.type.Date") || oType.isA("sap.ui.model.type.Date") || oType.isA("sap.ui.model.type.DateTime")) {
					//TODO only for a Date type we have to convert the values into UTC - because it's type specific we should move this into a delegate
					aRange[i].oDate = DateUtil.localToUtc(aRange[i].oDate);
				}
				aRange[i] = DateUtil.universalDateToType(aRange[i], oType);
			}

			return aRange;
		};

		/**
		 * Creates the static text of the operator
		 *
 		 * @param {sap.ui.model.Type} oType data type of the used {@link sap.ui.mdc.FilterField FilterField}
		 * @return {string} static text
		 *
		 * @private
		 * @ui5-restricted sap.ui.mdc.field.DefineConditionPanel
		 */
		RangeOperator.prototype.getStaticText = function(oType) {
			var aRange = this._getRange(null, oType);
			return this.formatRange(aRange, oType);
		};

		return RangeOperator;

}, /* bExport= */ true);
