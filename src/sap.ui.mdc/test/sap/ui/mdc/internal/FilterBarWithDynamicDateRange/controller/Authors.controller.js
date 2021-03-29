sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/date/UniversalDate",
	"sap/ui/core/date/UniversalDateUtils",
	"sap/ui/mdc/condition/RangeOperator",
	"sap/ui/mdc/condition/FilterOperatorUtil",
	"sap/ui/mdc/p13n/StateUtil",
	"sap/ui/mdc/condition/FilterConverter"
], function (Controller, UniversalDate, UniversalDateUtils, RangeOperator, FilterOperatorUtil, StateUtil, FilterConverter) {
	"use strict";

	return Controller.extend("sap.ui.v4demo.controller.Authors", {

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
			// var oDataTypes = {};
			var oView = this.getView();
			// var oForm = oView.byId("Form1");
			// var oCM = oForm.getModel("cm");
			// var oConditions = oCM.getAllConditions();
			// var aFormContent = oForm.getContent();

			// for (var i = 0; i < aFormContent.length; i++) {
			// 	var oField = aFormContent[i];
			// 	if (oField.isA("sap.ui.mdc.field.FieldBase")) {
			// 		oDataTypes[oField.getFieldPath()] = { type: oField._oContentFactory.getDataType() };
			// 	}
			// }

			var oFilterBar = oEvent.oSource;
			// var oConditions = oFilterBar.getConditions(); //???? how to access the current values
			var oCM = oFilterBar._getConditionModel();
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

				if (bHasDECondition) {
					// add a new RangeOperator
					this.createFiscalPeriodRangeOperator("DE");
				} else {
					//???? how can we check if the new FISCALPDE was used and remove it?
					if (usesOperator( mConditions.dateOfDeath, "FISCALPDE")) {
						// oFilterBar.setSuspendSelection(true);
						// oFilterBar.setIgnoreQueuing(true);
						StateUtil.applyExternalState(oFilterBar, { filter: { "dateOfDeath" : []}}).then(
							function() {
								//oFilterBar.setSuspendSelection(false);
								this.destroyFiscalPeriodRangeOperator("DE");
							}.bind(this)
						);
					} else {
						this.destroyFiscalPeriodRangeOperator("DE");
					}
				}
				if (bHasUSCondition) {
					// add a new RangeOperator
					this.createFiscalPeriodRangeOperator("US");
				} else {
					//???? how can we check if the new FISCALPDE was used and remove it?
					if (usesOperator( mConditions.dateOfDeath, "FISCALPUS")) {
						// oFilterBar.setSuspendSelection(true);
						// oFilterBar.setIgnoreQueuing(true);
						StateUtil.applyExternalState(oFilterBar, { filter: { "dateOfDeath" : []}}).then(
							function() {
								//oFilterBar.setSuspendSelection(false);
								this.destroyFiscalPeriodRangeOperator("US");
							}.bind(this)
						);
					} else {
						this.destroyFiscalPeriodRangeOperator("US");
					}				}
			} else {
				// Remove new RangeOperator
				this.destroyFiscalPeriodRangeOperator("DE");
				this.destroyFiscalPeriodRangeOperator("US");
			}
		},

		destroyFiscalPeriodRangeOperator: function(sLang) {
			if (this._mRangeOperators[sLang]) {
				FilterOperatorUtil.removeOperator(this._mRangeOperators[sLang]);
				// FilterOperatorUtil.removeOperatorForType("Date", this._mRangeOperators[sLang]);

				//or remove from the Filterfield
				var oFF = this.getView().byId("ff1");
				oFF.removeOperator(this._mRangeOperators[sLang]);

				//TODO What happens with conditions which we created with this RangeOperator?
				//Convert the RangeOPerator From To into a between ...
				var oFilterBar = this.getView().byId("authorsFilterBar");
				var mConditions = oFilterBar.getConditions();
				if (mConditions.dateOfDeath) {

					var aDateOfDeath = mConditions.dateOfDeath;
					//???? Or in case the RangeOperator was used, we convert it into a BT operator
					aDateOfDeath.forEach(function(oCnd) {
						if (oCnd.operator === this._mRangeOperators[sLang].name) {
							// oCnd.operator = "BT";
							// oCnd.values = [new Date(), new Date()];
						}
					}.bind(this));
				}

				delete this._mRangeOperators[sLang];
			}
		},

		createFiscalPeriodRangeOperator: function(sLang) {
			if (!this._mRangeOperators[sLang]) {
				this._mRangeOperators[sLang] =  new RangeOperator({
					name: "FISCALP" + sLang,
					tokenParse: "^#tokenText#$",
					tokenFormat: "#tokenText#",
					longText: "Fiscalperiod " + sLang,
					tokenText: "Fiscalperiod-" + sLang + " ({0})",
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

				FilterOperatorUtil.addOperator(this._mRangeOperators[sLang]);

				// either set the new Range for the Type Date
				// FilterOperatorUtil.addOperatorForType("Date", this._mRangeOperators[sLang]);

				//or on the Filterfield
				var oFF = this.getView().byId("ff1");
				oFF.addOperator(this._mRangeOperators[sLang]);
			}

		}



	});
});
