/*!
 * ${copyright}
 */
sap.ui.require([
	"sap/ui/test/Opa5",
	"sap/ui/test/actions/Press",
	"sap/ui/test/matchers/Interactable"
],
function (Opa5, Press, Interactable) {
	"use strict";
	var sViewName = "sap.ui.core.sample.odata.v4.SalesOrderTP100_V2.Main";

	Opa5.extendConfig({autoWait : true});

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
					return this.waitFor({
						actions : new Press(),
						controlType : "sap.m.Button",
						matchers : new Interactable(),
						id : "toggleV4Button",
						success : function () {
							Opa5.assert.ok(true, "pressV4Button");
						},
						viewName : sViewName
					});
				},
				selectSalesOrder : function (iRow) {
					return this.waitFor({
						controlType : "sap.m.Table",
						id : "SalesOrders",
						success : function (oTable) {
							var oControl = oTable.getItems()[iRow].getCells()[0];
							oControl.$().tap();
							Opa5.assert.ok(true, "selectSalesOrder(" + iRow + ")");
						},
						viewName : sViewName
					});
				}
			}
		}
	});
});