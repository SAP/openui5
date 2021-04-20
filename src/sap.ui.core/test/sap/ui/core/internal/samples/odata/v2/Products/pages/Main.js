/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/test/actions/EnterText"
], function (Opa5, EnterText) {
	"use strict";
	var rPriceClone = /Price-__clone/,
		sViewName = "sap.ui.core.internal.samples.odata.v2.Products.Main",
		rWeightMeasureClone = /WeightMeasure-__clone/;

	/*
	 * Returns the row index of the given control within the table.
	 */
	function getIndex(oControl) {
		var oColumnListItem = oControl.getParent(),
			oTable = oColumnListItem.getParent();

		return oTable.getItems().indexOf(oColumnListItem);
	}

	/*
	 * Changes the value of the input control which matches the given <code>rId</code> and is in the
	 * given row <code>iRow</code> of a table to the given value; changes the first row if none is
	 * given. After that, sets the focus to a different field to trigger a PATCH for the update.
	 */
	function changeValue(oOpa, rId, sValue, iRow) {
		oOpa.waitFor({
			actions : new EnterText({text : sValue}),
			controlType : "sap.m.Input",
			id : rId,
			matchers : function (oControl) {
				return getIndex(oControl) === (iRow || 0);
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
		oOpa.waitFor({
			controlType : "sap.m.Input",
			id : rId,
			matchers : function (oControl) {
				return getIndex(oControl) === (iRow || 0);
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
		oOpa.waitFor({
			controlType : "sap.m.Input",
			id : rId,
			matchers : function (oControl) {
				return getIndex(oControl) === (iRow || 0);
			},
			success : function (aControls) {
				var oInput = aControls[0];

				Opa5.assert.strictEqual(oInput.getValue(), sValue,
					rId + " as expected: " + oInput.getValue());
			},
			viewName : sViewName
		});
	}

	Opa5.extendConfig({
		appParams : {'sap-ui-support' : 'false'},
		autoWait : true,
		extensions : [],
		timeout : undefined
	});

	Opa5.createPageObjects({
		onTheMainPage : {
			actions : {
				changeMeasure : function (sValue, iRow) {
					changeValue(this, rWeightMeasureClone, sValue, iRow);
				},
				changePrice : function (sValue, iRow) {
					changeValue(this, rPriceClone, sValue, iRow);
				}
			},
			assertions : {
				checkMeasure : function (sValue, iRow) {
					checkValue(this, rWeightMeasureClone, sValue, iRow);
				},
				checkMeasureValueState : function (sState, iRow) {
					checkValueState(this, rWeightMeasureClone, sState, iRow);
				},
				checkPrice : function (sValue, iRow) {
					checkValue(this, rPriceClone, sValue, iRow);
				},
				checkPriceValueState : function (sState, iRow) {
					checkValueState(this, rPriceClone, sState, iRow);
				}
			}
		}
	});
});