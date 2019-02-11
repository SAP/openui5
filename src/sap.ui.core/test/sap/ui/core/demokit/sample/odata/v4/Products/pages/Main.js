/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/test/actions/EnterText",
	"sap/ui/test/actions/Press"
], function (Opa5, EnterText, Press) {
	"use strict";
	var sViewName = "sap.ui.core.sample.odata.v4.Products.Main";

	/*
	 * Changes the value of the input control which matches the given <code>rId</code> and is in the
	 * given row <code>iRow</code> of a table to the given value; changes the first row if none is
	 * given. After that, sets the focus to a different field to trigger a PATCH for the update.
	 */
	function changeValue(oOpa, rId, sValue, iRow) {
		return oOpa.waitFor({
			actions : new EnterText({clearTextFirst : true, text : sValue}),
			controlType : "sap.m.Input",
			id : rId,
			matchers : function (oControl) {
				return oControl.getBindingContext().getIndex() === (iRow || 0);
			},
			success : function (aControls) {
				var oInput = aControls[0];

				Opa5.assert.strictEqual(oInput.getValue(), sValue, "Content set to "
					+ oInput.getValue());

				// trigger PATCH: leave field by focussing different control via press
				return oOpa.waitFor({
					actions : new Press(),
					matchers : function (oControl) {
						return oControl.getBindingContext().getIndex() === (iRow || 0);
					},
					id : /ProductID/,
					success : function (aControls) {
						Opa5.assert.ok(true, "Selected Product: "
							+ aControls[0].getText());
					},
					viewName : sViewName
				});
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
					return changeValue(this, /WeightMeasure/, sValue, iRow);
				},
				changePrice : function (sValue, iRow) {
					return changeValue(this, /Price/, sValue, iRow);
				}
			},
			assertions : {
				checkMeasure : function (sValue, iRow) {
					return checkValue(this, /WeightMeasure/, sValue, iRow);
				},
				checkMeasureValueState : function (sState, iRow) {
					return checkValueState(this, /WeightMeasure/, sState, iRow);
				},
				checkPrice : function (sValue, iRow) {
					return checkValue(this, /Price/, sValue, iRow);
				},
				checkPriceValueState : function (sState, iRow) {
					return checkValueState(this, /Price/, sState, iRow);
				}
			}
		}
	});
});