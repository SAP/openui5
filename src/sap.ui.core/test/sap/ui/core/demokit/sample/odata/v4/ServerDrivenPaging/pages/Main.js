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
				pressMoreButton : function () {
					return this.waitFor({
						controlType : "sap.m.CustomListItem",
						id : /businessPartnerList-trigger/,
						matchers : new Interactable(),
						success : function (aControls) {
							new Press().executeOn(aControls[0]);
							Opa5.assert.ok(true, "'More' Button pressed");
						}
					});
				}
			},
			assertions : {
				checkItemIndex : function (sValue, iRow) {
					return this.waitFor({
						controlType : "sap.m.Text",
						id : /index-__clone/,
						matchers : function (oControl) {
							return oControl.getBindingContext().getIndex() === iRow;
						},
						success : function (aControls) {
							Opa5.assert.strictEqual(aControls[0].getText(), sValue,
								"Item index for row " + iRow + ": " + sValue);
						},
						viewName : sViewName
					});
				},
				checkTableSize : function (iSize) {
					return this.waitFor({
						controlType : "sap.m.Table",
						id : "businessPartnerList",
						success : function (oTable) {
							Opa5.assert.strictEqual(oTable.getItems().length, iSize,
								"Table length: " + iSize);
						},
						viewName : sViewName
					});
				},
				checkTableTitle : function (sTitle) {
					return this.waitFor({
						controlType : "sap.m.Title",
						id : /businessPartnerListTitle/,
						success : function (aControls) {
							Opa5.assert.strictEqual(aControls[0].getText(), sTitle,
								"Table title: " + sTitle);
						}
					});
				}
			}
		}
	});
});