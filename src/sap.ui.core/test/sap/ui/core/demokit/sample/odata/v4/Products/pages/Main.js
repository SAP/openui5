/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/sample/common/Helper",
	"sap/ui/test/Opa5",
	"sap/ui/test/actions/EnterText",
	"sap/ui/test/actions/Press",
	"sap/ui/test/matchers/Interactable"
], function (Helper, Opa5, EnterText, Press, Interactable) {
	"use strict";
	var sViewName = "sap.ui.core.sample.odata.v4.Products.Main";

	/*
	 * Changes the value of the input control which matches the given <code>rId</code> and is in the
	 * given row <code>iRow</code> of a table to the given value; changes the first row if none is
	 * given. After that, sets the focus to a different field to trigger a PATCH for the update.
	 */
	function changeValue(oOpa, rId, sValue, iRow) {
		return oOpa.waitFor({
			actions : new EnterText({text : sValue}),
			controlType : "sap.m.Input",
			id : rId,
			matchers : function (oControl) {
				return oControl.getBindingContext().getIndex() === (iRow || 0);
			},
			success : function (aControls) {
				var oInput = aControls[0];

				Opa5.assert.strictEqual(oInput.getValue(), sValue, "Content set to "
					+ oInput.getValue());
			},
			viewName : sViewName
		});
	}

	/*
	 * Checks whether the input control which matches the given <code>rId</code> and is in the
	 * given row <code>iRow</code> of a table has the given value state <code>sState</code>; checks
	 * the first row if none is given.
	 */
	function checkValueState(oOpa, rId, sState, iRow) {
		return oOpa.waitFor({
			controlType : "sap.m.Input",
			id : rId,
			matchers : function (oControl) {
				return oControl.getBindingContext().getIndex() === (iRow || 0);
			},
			success : function (aControls) {
				var oInput = aControls[0];

				Opa5.assert.strictEqual(oInput.getValueState(), sState,
					rId + " has valueState:" + sState);
			},
			viewName : sViewName
		});
	}

	/*
	 * Checks whether the input control which matches the given <code>rId</code> and is in the
	 * given row <code>iRow</code> of a table has the given value <code>sValue</code>; checks
	 * the first row if none is given.
	 */
	function checkValue(oOpa, rId, sValue, iRow) {
		return oOpa.waitFor({
			controlType : "sap.m.Input",
			id : rId,
			matchers : function (oControl) {
				return oControl.getBindingContext().getIndex() === (iRow || 0);
			},
			success : function (aControls) {
				var oInput = aControls[0];

				Opa5.assert.strictEqual(oInput.getValue(), sValue,
					rId + " as expected: " + oInput.getValue());
			},
			viewName : sViewName
		});
	}

	Opa5.createPageObjects({
		onTheMainPage : {
			actions : {
				changeMeasure : function (sValue, iRow) {
					return changeValue(this, /WeightMeasure-__clone/, sValue, iRow);
				},
				changePrice : function (sValue, iRow) {
					return changeValue(this, /Price-__clone/, sValue, iRow);
				},
				changeProductID : function (sValue, iRow) {
					return changeValue(this, /ProductID-__clone/, sValue, iRow);
				},
				changeNewEntryPrice : function (sValue) {
					return changeValue(this, /Price::newEntry/, sValue);
				},
				changeNewEntryProductID : function (sValue) {
					return changeValue(this, /ProductID::newEntry/, sValue);
				},
				changeNewEntryProductName : function (sValue) {
					return changeValue(this, /Name::newEntry/, sValue);
				},
				changeNewEntryWeightMeasure : function (sValue) {
					return changeValue(this, /WeightMeasure::newEntry/, sValue);
				},
				pressAddButton : function () {
					return Helper.pressButton(this, sViewName, "addButton");
				},
				pressClearRowButton : function () {
					return Helper.pressButton(this, sViewName, "clearRowButton");
				}
			},
			assertions : {
				checkButtonDisabled : function (sButtonId) {
					return Helper.checkButtonDisabled(this, sViewName, sButtonId);
				},
				checkButtonEnabled : function (sButtonId) {
					return Helper.checkButtonEnabled(this, sViewName, sButtonId);
				},
				checkMeasure : function (sValue, iRow) {
					return checkValue(this, /WeightMeasure-__clone/, sValue, iRow);
				},
				checkMeasureNewEntry : function (sValue){
					return checkValue(this, /WeightMeasure::newEntry/, sValue);
				},
				checkMeasureValueState : function (sState, iRow) {
					return checkValueState(this, /WeightMeasure-__clone/, sState, iRow);
				},
				checkName : function (sValue){
					return checkValue(this, /Name-__clone/, sValue);
				},
				checkNameNewEntry : function (sValue){
					return checkValue(this, /Name::newEntry/, sValue);
				},
				checkPrice : function (sValue, iRow) {
					return checkValue(this, /Price-__clone/, sValue, iRow);
				},
				checkPriceNewEntry : function (sValue){
					return checkValue(this, /Price::newEntry/, sValue);
				},
				checkPriceValueState : function (sState, iRow) {
					return checkValueState(this, /Price-__clone/, sState, iRow);
				},
				checkProductID : function (sValue, iRow) {
					return checkValue(this, /ProductID-__clone/, sValue, iRow);
				},
				checkProductIDIsEditable : function (bEditable) {
					return this.waitFor({
						controlType : "sap.m.Input",
						id : /ProductID-__clone/,
						matchers : function (oControl) {
							return oControl.getBindingContext().getIndex() === 0;
						},
						success : function (aControls) {
							var oInput = aControls[0];

							Opa5.assert.strictEqual(oInput.getEditable(), bEditable,
								"ProductID editable(" + bEditable + ") as expected");
						},
						viewName : sViewName
					});
				},
				checkProductIDNewEntry : function (sValue){
					return checkValue(this, /ProductID::newEntry/, sValue);
				},
				checkProductIDValueState : function (sState, iRow) {
					return checkValueState(this, /ProductID-__clone/, sState, iRow);
				},
				checkProductIDValueStateNewEntry : function (sState) {
					return checkValueState(this, /ProductID::newEntry/, sState);
				}
			}
		}
	});
});