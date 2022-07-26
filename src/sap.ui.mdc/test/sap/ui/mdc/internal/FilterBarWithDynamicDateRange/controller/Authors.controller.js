
sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/date/UniversalDate",
	"sap/ui/core/date/UniversalDateUtils",
	"sap/ui/mdc/condition/RangeOperator",
	"sap/ui/mdc/condition/FilterOperatorUtil",
	"sap/ui/mdc/p13n/StateUtil",
	"sap/ui/mdc/condition/FilterConverter",
	"sap/ui/base/ManagedObjectObserver",
	"sap/m/DynamicDateOption",
	"sap/m/DynamicDateFormat",
	"sap/base/strings/formatMessage",
	"delegates/odata/v4/FieldBaseDelegate",
	"sap/m/DynamicDateUtil",
	"sap/m/DynamicDateValueHelpUIType",
	"sap/m/Slider"
], function (Controller, UniversalDate, UniversalDateUtils, RangeOperator, FilterOperatorUtil, StateUtil, FilterConverter,
	ManagedObjectObserver,
	DynamicDateOption,
	DynamicDateFormat,
	formatMessage, dummyDelegate, DynamicDateUtil, DynamicDateValueHelpUIType,
	Slider) {
	"use strict";

	return Controller.extend("sap.ui.v4demo.controller.Authors", {

		onInit : function(oEvent) {
			var oFF = this.getView().byId("ff1");
			oFF.setOperators(FilterOperatorUtil.getOperatorsForType("Date"));
			["NE", "NOTBT", "NOTLE", "NOTLT", "NOTGE", "NOTGT"].forEach(function(sOp) { oFF.removeOperator(sOp); });

			// ["LT", "GT"].forEach(function(sOp) { oFF.removeOperator(sOp); });


			oFF = this.getView().byId("ff3");
			oFF.setOperators(FilterOperatorUtil.getOperatorsForType("Date"));
			["NE", "NOTBT", "NOTLE", "NOTLT", "NOTGE", "NOTGT"].forEach(function(sOp) { oFF.removeOperator(sOp); });

			// ["LT", "GT"].forEach(function(sOp) { oFF.removeOperator(sOp); });

		},

		onFiltersChanged: function(oEvent) {
			var oText = this.getView().byId("statusTextExpanded");
			if (oText) {
				oText.setText(oEvent.getParameters().filtersTextExpanded);
			}

			oText = this.getView().byId("statusTextCollapsed");
			if (oText) {
				oText.setText(oEvent.getParameters().filtersText);
			}

			this._handleCustomOperators(oEvent);

			this.handleConditionModelChange(oEvent);
		},

		handleConditionModelChange: function(oEvent) {
			var oView = this.getView();

			var oFilterBar = oEvent.oSource;
			var oCM = oFilterBar._getConditionModel();
			if (!oCM) {
				return;
			}
			var oConditions = oCM.getAllConditions();

			var oTextArea = oView.byId("Cond");
			var sVariant = oCM.serialize();
			oTextArea.setValue(sVariant);

			var oDataTypes = FilterConverter.createConditionTypesMapFromFilterBar(oConditions, oFilterBar);
			var oFilter = FilterConverter.createFilters(oConditions, oDataTypes);
			oTextArea = oView.byId("Filter");
			oTextArea.setValue(FilterConverter.prettyPrintFilters(oFilter));
		},


		_handleCustomOperators: function(oEvent) {
			//???? is FiltersChanged the right way to listen on changes? This event will be called multiple times when a variant is applied.
			var oFilterBar = oEvent.oSource;
			var mConditions = oFilterBar.getConditions(); //???? how to access the current values
			if (!this._mRangeOperators) {
				this._mRangeOperators = {};
			}


			if (mConditions.countryOfOrigin_code) {
				var bHasDECondition = false;
				var bHasUSCondition = false;

				//???? How to access and find Conditions in the ConditionModel/mConditions map? Is the API public, well documented?
				var aCountryOfOrigin = mConditions.countryOfOrigin_code;
				aCountryOfOrigin.forEach(function(oCnd) {
					bHasDECondition = bHasDECondition  || oCnd.values[0] === "DE";
					bHasUSCondition = bHasUSCondition  || oCnd.values[0] === "US";
				});

				var usesOperator = function(aConditions, sOperator) {
					if (aConditions && aConditions.length == 1) {
						return aConditions[0].operator === sOperator;
					}
					return false;
				};

				var aFieldIds = ["ff1", "ff3"];

				if (bHasDECondition) {
					// add a new RangeOperator
					this.createFiscalPeriodRangeOperator("DE", aFieldIds);
				} else
					//???? how can we check if the new FISCALPDE was used and remove it?
					if (usesOperator( mConditions.dateOfDeath, "FISCALPDE")) {
						StateUtil.applyExternalState(oFilterBar, { filter: { "dateOfDeath" : []}}).then(
							function() {
								this.destroyFiscalPeriodRangeOperator("DE", aFieldIds);
							}.bind(this)
						);
					} else {
						this.destroyFiscalPeriodRangeOperator("DE", aFieldIds);
					}

				if (bHasUSCondition) {
					// add a new RangeOperator
					this.createFiscalPeriodRangeOperator("US", aFieldIds);
				} else
					//???? how can we check if the new FISCALPDE was used and remove it?
					if (usesOperator( mConditions.dateOfDeath, "FISCALPUS")) {
						StateUtil.applyExternalState(oFilterBar, { filter: { "dateOfDeath" : []}}).then(
							function() {
								this.destroyFiscalPeriodRangeOperator("US", aFieldIds);
							}.bind(this)
						);
					} else {
						this.destroyFiscalPeriodRangeOperator("US", aFieldIds);
					}

			} else {
				// Remove new RangeOperator
				this.destroyFiscalPeriodRangeOperator("DE", aFieldIds);
				this.destroyFiscalPeriodRangeOperator("US", aFieldIds);
			}
		},

		destroyFiscalPeriodRangeOperator: function(sLang, aFieldIds) {
			if (this._mRangeOperators[sLang]) {
				FilterOperatorUtil.removeOperator(this._mRangeOperators[sLang]);

				// FilterOperatorUtil.removeOperatorForType("Date", this._mRangeOperators[sLang]);
				//or remove from the Filterfield
				aFieldIds.forEach(function(sId) {
					var oFF = this.getView().byId(sId);
					oFF.removeOperator(this._mRangeOperators[sLang]);
				}.bind(this));

				//TODO What happens with conditions which we created with this RangeOperator?
				//Convert the RangeOPerator From To into a between ...
				// var oFilterBar = this.getView().byId("authorsFilterBar");
				// var mConditions = oFilterBar.getConditions();
				// if (mConditions.dateOfDeath) {

				// 	var aDateOfDeath = mConditions.dateOfDeath;
				// 	//???? Or in case the RangeOperator was used, we convert it into a BT operator
				// 	aDateOfDeath.forEach(function(oCnd) {
				// 		if (oCnd.operator === this._mRangeOperators[sLang].name) {
				// 			// oCnd.operator = "BT";
				// 			// oCnd.values = [new Date(), new Date()];
				// 		}
				// 	}.bind(this));
				// }

				delete this._mRangeOperators[sLang];
			}
		},

		createFiscalPeriodRangeOperator: function(sLang, aFieldIds) {
			if (!this._mRangeOperators[sLang]) {
				this._mRangeOperators[sLang] =  new RangeOperator({
					name: "FISCALP" + sLang,
					group: { id: 0, text: "Fiscal Ranges" }, // this can be used to add the Operator into an existing Group with id 1...6 or when you specify the text you get a new Group.
					tokenParse: "^#tokenText#$",
					tokenFormat: "#tokenText#",
					longText: "Fiscalperiod " + sLang,
					tokenText: "Fiscalperiod-" + sLang + ": {0}",
					// valueTypes: [sap.ui.mdc.condition.Operator.ValueType.Static],
					// paramTypes: [],
					valueTypes: [{name: "sap.ui.model.type.Integer", formatOptions: {emptyString: null}, constraints: { minimum: 1, maximum: 4}}],
					paramTypes: ["(\\d+)"],
					visible : function() {
						//TODO The RangeOperation should only be avialable when another filterfield is filled
						return false;
					},
					calcRange: function(iValue) {
						var startDate = new UniversalDate();
						iValue = iValue || 1;
						//TODO The RangeOperation should return another range depending on the value of another filterField.
						if (this.value === "DE") {
							startDate.setMonth((iValue - 1) * 3 - 1);
							return UniversalDateUtils.getRange(3, "MONTH", startDate, true);
						} else {
							startDate.setMonth((iValue - 1) * 3 - 1);
							return UniversalDateUtils.getRange(3, "MONTH", startDate, true);
						}
					}
				});

				//TODO add a propery with the current language on the Range, will be used in this example inside the calcRange to calculate different time spans...
				this._mRangeOperators[sLang].value = sLang;

				if (sLang === "DE") {
					// use cistom control
					this._mRangeOperators[sLang].createControl = function(oType, sPath, iIndex, sId, aClass)  {
						var oSlider = new Slider(sId, {
							value: { path: sPath, type: oType, mode: 'TwoWay' },
							width: "100%",
							min: 1,
							max: 4,
							enableTickmarks: true
						});
						return oSlider;
					};
				}

				FilterOperatorUtil.addOperator(this._mRangeOperators[sLang]);

				// either set the new Range for the Type Date
				// FilterOperatorUtil.addOperatorForType("Date", this._mRangeOperators[sLang]);

				//or on the Filterfield
				aFieldIds.forEach(function(sId) {
					var oFF = this.getView().byId(sId);
					oFF.addOperator(this._mRangeOperators[sLang]);
				}.bind(this));

			}

		},

		handleDDRChange: function(oEvent) {
			var DDR = oEvent.getSource();

			if (!oEvent.getParameter("valid")) {
				DDR.setValueState("Error");
				DDR.setValueStateText("Not valid");
			} else {
				DDR.setValueState("None");
				DDR.setValueStateText(null);
			}
		}

	});
});
