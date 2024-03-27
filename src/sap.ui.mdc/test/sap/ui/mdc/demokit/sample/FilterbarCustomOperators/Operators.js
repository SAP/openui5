sap.ui.define([
	"sap/ui/mdc/condition/FilterOperatorUtil",
	"sap/ui/mdc/condition/Operator",
	"sap/ui/mdc/condition/RangeOperator",
	"sap/ui/model/Filter",
	'sap/ui/core/date/UniversalDateUtils',
	'sap/ui/mdc/enums/BaseType',
	'sap/ui/mdc/enums/OperatorValueType',
	"sap/ui/mdc/enums/FieldDisplay"
], function (FilterOperatorUtil, Operator, RangeOperator, Filter, UniversalDateUtils, BaseType, OperatorValueType, FieldDisplay) {
	"use strict";

	const oSimpleRange = new Operator({
		name: "SRANGE",
		tokenParse: "^(.*)\\s*\\+-\\s*(.*)$", // e.g. "1+1" "1-1"
		tokenTest: "^([0-9]*)\\s*\\+-\\s*([0-9]*)$", // e.g. "1+1" "1-1"
		tokenFormat: "{0} ± {1}",
		tokenText: "Simple Range",
		longText: "Simple Range",
		valueTypes: [OperatorValueType.Self, OperatorValueType.Self],
		getModelFilter: function(oCondition, sFieldPath) {
			const iLower = Math.max(oCondition.values[0] - oCondition.values[1], 0);
			const iUpper = oCondition.values[0] + oCondition.values[1];
			const oFilterBetween = new Filter({ path: sFieldPath, operator: "BT", value1: iLower, value2: iUpper });
			return new Filter({ filters: [oFilterBetween], and: false });
		}
	});

	const oNotSimpleRange = new Operator({
		name: "NOTSRANGE",
		tokenTest: "^!\\s*(.*)\\s*\\+-\\s*(.*)$", // e.g. "!1+1" "!1-1"
		tokenParse: "^!\\s*([0-9]*)\\s*\\+-\\s*([0-9]*)$", // e.g. "!1+1" "!1-1"
		tokenFormat: "!({0} ± {1})",
		tokenText: "Exclude Simple Range",
		longText: "Exclude Simple Range",
		exclude: true,
		valueTypes: [OperatorValueType.Self, OperatorValueType.Self],
		parse: function(sText, oType, sDisplayFormat, bDefaultOperator, aCompositeTypes, oAdditionalType, aAdditionalCompositeTypes) {
			sDisplayFormat = sDisplayFormat || FieldDisplay.DescriptionValue;
			let aResult = Operator.prototype.parse.apply(this, [sText,
				oType,
				sDisplayFormat,
				bDefaultOperator,
				aCompositeTypes,
				oAdditionalType,
				aAdditionalCompositeTypes
			]);

			if (bDefaultOperator && (!aResult || aResult[0] === null || aResult[0] === undefined) && sDisplayFormat !== FieldDisplay.Value) {
				// in default case and no key determined (simple-EQ case)-> use text as key (parse again to use type)
				sDisplayFormat = FieldDisplay.Value;
				aResult = Operator.prototype.parse.apply(this, [sText,
					oType,
					sDisplayFormat,
					bDefaultOperator,
					aCompositeTypes,
					oAdditionalType,
					aAdditionalCompositeTypes
				]);
			}
			if (aResult.length !== 2) {
				return null;
			}
			return aResult;
		},
		format: function(oCondition, oType, sDisplayFormat, bHideOperator, aCompositeTypes, oAdditionalType, aAdditionalCompositeTypes) {
			return `NOT (${oCondition.values[0]} ± ${oCondition.values[1]})`;
		},
		getModelFilter: function(oCondition, sFieldPath) {
			const iLower = Math.max(oCondition.values[0] - oCondition.values[1], 0);
			const iUpper = oCondition.values[0] + oCondition.values[1];
			const oFilterBetween = new Filter({ path: sFieldPath, operator: "NB", value1: iLower, value2: iUpper });
			return new Filter({ filters: [oFilterBetween], and: false });
		}
	});

	const oMyNextDays = new RangeOperator({
		name: "MYNEXTDAYS",
		valueTypes: [{name: "sap.ui.model.type.Integer", formatOptions: {emptyString: null}, constraints: { minimum: 0 }}],
		paramTypes: ["(\\d+)"],
		tokenParse: "^n(\\d+)$", // e.g. n2
		tokenTest: "^n(\\d+)$", // e.g. n2
		additionalInfo: "",
		longText: "Next X days",
		tokenText: "Next {0} days",
		calcRange: function(iDuration) {
			return UniversalDateUtils.ranges.nextDays(iDuration);
		}
	});

	FilterOperatorUtil.addOperator(oSimpleRange);
	FilterOperatorUtil.addOperatorForType(BaseType.Numeric, oSimpleRange);
	FilterOperatorUtil.addOperator(oNotSimpleRange);
	FilterOperatorUtil.addOperatorForType(BaseType.Numeric, oNotSimpleRange);
	FilterOperatorUtil.addOperator(oMyNextDays);
	FilterOperatorUtil.addOperatorForType(BaseType.Date, oMyNextDays);
});