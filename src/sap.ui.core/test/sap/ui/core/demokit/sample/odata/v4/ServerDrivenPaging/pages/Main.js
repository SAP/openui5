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
	var sViewName = "sap.ui.core.sample.odata.v4.ServerDrivenPaging.Main";

	Opa5.createPageObjects({
		onTheMainPage : {
			actions : {
				pageDownOnGridTable : function () {
					return this.waitFor({
						controlType : "sap.ui.table.Table",
						id : "businessPartnerTable",
						success : function (oTable) {
							oTable.setFirstVisibleRow(oTable.getFirstVisibleRow() + 21);
							Opa5.assert.ok(true, "Page down on grid table");
						},
						viewName : sViewName
					});
				},
				pressMoreButton : function () {
					return this.waitFor({
						controlType : "sap.m.CustomListItem",
						id : "businessPartnerList-trigger",
						success : function (oMoreButton) {
							new Press().executeOn(oMoreButton);
							Opa5.assert.ok(true, "'More' Button pressed");
						},
						viewName : sViewName
					});
				},
				switchToGridTable : function () {
					return this.waitFor({
						controlType : "sap.m.IconTabFilter",
						id : "table",
						success : function (oTab) {
							new Press().executeOn(oTab);
							Opa5.assert.ok(true, "Switched to table.Table");
						},
						viewName : sViewName
					});
				}
			},
			assertions : {
				checkGridTableTitle : function (sTitle) {
					return this.waitFor({
						controlType : "sap.ui.table.Table",
						id : "businessPartnerTable",
						success : function (oTable) {
							Opa5.assert.strictEqual(oTable.getTitle().getText(), sTitle,
								"Grid table title: " + sTitle);
						},
						viewName : sViewName
					});
				},
				checkLastVisibleItemIndex : function (sValue) {
					return this.waitFor({
						controlType : "sap.m.Table",
						id : "businessPartnerList",
						success : function (oTable) {
							var oItem = oTable.getItems()[oTable.getItems().length - 1];

							Opa5.assert.strictEqual(oItem.getCells()[0].getText(), sValue,
								"Last table item index: " + sValue);
						},
						viewName : sViewName
					});
				},
				checkLastVisibleRowIndex : function (sValue) {
					return this.waitFor({
						controlType : "sap.ui.table.Table",
						id : "businessPartnerTable",
						success : function (oTable) {
							var oRow = oTable.getRows()[20];

							Opa5.assert.strictEqual(oRow.getCells()[0].getText(), sValue,
								"Last table row index: " + sValue);
						},
						viewName : sViewName
					});
				},
				checkTableLength : function (iLength) {
					return this.waitFor({
						controlType : "sap.m.Table",
						id : "businessPartnerList",
						success : function (oTable) {
							Opa5.assert.strictEqual(oTable.getItems().length, iLength,
								"Table length: " + iLength);
						},
						viewName : sViewName
					});
				},
				checkTableTitle : function (sTitle) {
					return this.waitFor({
						controlType : "sap.m.Title",
						id : "businessPartnerListTitle",
						success : function (oTitle) {
							Opa5.assert.strictEqual(oTitle.getText(), sTitle,
								"Table title: " + sTitle);
						},
						viewName : sViewName
					});
				}
			}
		}
	});
});