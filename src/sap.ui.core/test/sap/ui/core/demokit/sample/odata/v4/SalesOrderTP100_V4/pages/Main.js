/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/sample/common/Helper",
	"sap/ui/test/Opa5",
	"sap/ui/test/actions/Press",
	"sap/ui/test/matchers/Interactable"
], function (Helper, Opa5, Press, Interactable) {
	"use strict";
	var sViewName = "sap.ui.core.sample.odata.v4.SalesOrderTP100_V4.Main";

	Opa5.createPageObjects({
		onTheMainPage : {
			actions : {
				pressMoreButton : function (sButtonId) {
					return this.waitFor({
						actions : new Press(),
						controlType : "sap.m.CustomListItem",
						id : sButtonId,
						matchers : new Interactable(),
						success : function () {
							Opa5.assert.ok(true, "pressMoreButton(" + sButtonId + ")");
						},
						viewName : sViewName
					});
				},
				pressV4Button : function () {
					return Helper.pressButton(this, sViewName, "toggleV4Button");
				},
				selectSalesOrder : function (iRow) {
					return this.waitFor({
						controlType : "sap.m.Table",
						id : "SalesOrders",
						success : function (oTable) {
							var oControl = oTable.getItems()[iRow].getCells()[0];
							new Press().executeOn(oControl);
							Opa5.assert.ok(true, "selectSalesOrder(" + iRow + ")");
						},
						viewName : sViewName
					});
				}
			}
		}
	});
});