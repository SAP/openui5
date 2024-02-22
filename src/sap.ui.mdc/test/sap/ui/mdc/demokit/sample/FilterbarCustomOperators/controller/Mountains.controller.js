sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/Filter",
	"sap/ui/mdc/condition/FilterOperatorUtil",
	"sap/ui/mdc/condition/Operator",
	"sap/ui/mdc/enums/FieldDisplay",
	"sap/ui/mdc/enums/OperatorValueType",
	"sap/ui/model/json/JSONModel",
	"sap/ui/mdc/condition/FilterConverter",
	"sap/ui/mdc/condition/RangeOperator",
	'sap/ui/core/date/UniversalDate',
	'sap/ui/core/date/UniversalDateUtils',
	'sap/m/Slider',
	'sap/m/DatePicker',
	'sap/ui/model/FilterOperator',
	'sap/ui/mdc/enums/BaseType',
	"../model/formatter",
	// In order to have a correctly working custom operator, we need to import and load all relevant data types.
	"sap/ui/model/type/String",
	"sap/ui/model/type/Integer",
	"sap/ui/model/type/Boolean",
	"sap/ui/model/type/Float",
	"sap/ui/model/odata/type/Date"
], function(
	Controller,
	Filter,
	FilterOperatorUtil,
	Operator,
	FieldDisplay,
	OperatorValueType,
	JSONModel,
	FilterConverter,
	RangeOperator,
	UniversalDate,
	UniversalDateUtils,
	DatePicker,
	Slider,
	ModelOperator,
	BaseType,
	formatter
) {
	"use strict";

	return Controller.extend("mdc.sample.controller.Mountains", {
		formatter: formatter,
		onInit: function() {
			this.addCustomOperator();
			const oModel = new JSONModel({
				conditionsText: "",
				modelFilterText: "",
				editorHeight: 400
			});
			this.getView().setModel(oModel);
			this.initConditionsText();
		},
		handleFiltersChanged: function(oEvent) {
			const oFilterbar = oEvent.getSource();
			const oConditions = oFilterbar.getConditions();
			this.updateConditionsText(oConditions, oFilterbar);
		},
		initConditionsText: function() {
			const oFilterbar = this.getView().byId("mountainsFilterbar");
			const oConditions = oFilterbar.getConditions();
			this.updateConditionsText(oConditions, oFilterbar);
		},
		updateConditionsText: function(oConditions, oFilterbar) {
			const oModel = this.getView().getModel();
			if (!oModel) {
				return;
			}

			const oConditionTypes = FilterConverter.createConditionTypesMapFromFilterBar(oConditions, oFilterbar);
			const oModelFilter = FilterConverter.createFilters(oConditions, oConditionTypes);

			const sConditions = JSON.stringify(oConditions, "\t", 4);
			const sModelFilter = this.stringifyModelFilter(oModelFilter);
			oModel.setProperty("/conditionsText", sConditions);
			oModel.setProperty("/modelFilterText", sModelFilter);
		},
		stringifyModelFilter: function(oModelFilter) {
			if (!oModelFilter) {
				return "{}";
			}
			const oCleanObject = JSON.parse(JSON.stringify(oModelFilter));
			delete oCleanObject._bMultiFilter;
			if ("aFilters" in oCleanObject){
				oCleanObject.aFilters.forEach((oFilter) => {
					delete oFilter._bMultiFilter;
					if ("aFilters" in oFilter) {
						oFilter.aFilters.forEach((oFilter) => {
							delete oFilter._bMultiFilter;
						});
					}
				});
			}

			return JSON.stringify(oCleanObject, "\t", 4);
		},
		addCustomOperator: function() {
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
				// createControl: function(oType, sPath, iIndex, sId)  { // only needed for MultiValue
				// 	const oSlider = new Slider(sId, { // render always a DatePicker, also for DateTime
				// 		value: {path: sPath, type: oType, mode: 'TwoWay'},
				// 		width: "100%"
				// 	});

				// 	return oSlider;
				// },
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
			// FilterOperatorUtil.addOperatorForType(BaseType.Numeric, oMyNextDays);
		}
	});
});
