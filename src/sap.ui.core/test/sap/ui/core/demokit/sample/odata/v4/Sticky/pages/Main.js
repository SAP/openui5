/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/sample/common/Helper",
	"sap/ui/test/Opa5",
	"sap/ui/test/actions/EnterText",
	"sap/ui/test/actions/Press"
], function (Helper, Opa5, EnterText, Press) {
	"use strict";
	var sViewName = "sap.ui.core.sample.odata.v4.Sticky.Main";

	function pressButton(oOpa5, sId) {
		Helper.pressButton(oOpa5, sViewName, sId);
	}

	Opa5.createPageObjects({
		onTheMainPage : {
			actions : {
				changeContent : function (sValue) {
					this.waitFor({
						actions : new EnterText({clearTextFirst : true, text : sValue}),
						controlType : "sap.m.Input",
						id : "Content::details",
						success : function (oInput) {
							Opa5.assert.strictEqual(oInput.getValue(), sValue, "Content set to "
								+ oInput.getValue());
							// invoke PATCH by leaving field via simple tab on other control
							this.waitFor({
								actions : new Press(),
								id : "Id::details",
								success : function (oControl) {
									Opa5.assert.ok(true, "Selected control: " + oControl.getId());
								},
								viewName : sViewName
							});
						},
						viewName : sViewName
					});
				},
				selectStickyType : function (iRow) {
					this.waitFor({
						actions : new Press(),
						controlType : "sap.m.Text",
						id : /Content/,
						matchers : function (oControl) {
							return oControl.getBindingContext().getIndex() === iRow;
						},
						success : function (oControl) {
							Opa5.assert.ok(true, "Selected Sticky Type: " + oControl[0].getText());
						},
						viewName : sViewName
					});
				},
				pressDiscard : function () {
					pressButton(this, "discard");
				},
				pressPrepare : function () {
					pressButton(this, "prepare");
				},
				pressSave : function () {
					pressButton(this, "save");
				}
			},
			assertions : {
				checkContent : function (sValue) {
					Helper.checkInputValue(this, sViewName, "Content::details", sValue);
				}
			}
		}
	});
});
