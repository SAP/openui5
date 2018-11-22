/*!
 * ${copyright}
 */
sap.ui.require([
	"sap/ui/core/sample/common/Helper",
	"sap/ui/test/Opa5",
	"sap/ui/test/actions/EnterText",
	"sap/ui/test/actions/Press",
	"sap/ui/test/matchers/Properties"
], function (Helper, Opa5, EnterText, Press, Properties) {
	"use strict";
	var sViewName = "sap.ui.core.sample.odata.v4.Sticky.Main";

	function pressButton(oOpa5, sId) {
		return Helper.pressButton(oOpa5, sViewName, sId);
	}

	Opa5.createPageObjects({
		onTheMainPage : {
			actions : {
				changeContent : function (sValue) {
					return this.waitFor({
						actions : new EnterText({ clearTextFirst : true, text : sValue }),
						controlType : "sap.m.Input",
						id : "Content::details",
						success : function (oInput) {
							Opa5.assert.strictEqual(oInput.getValue(), sValue, "Content set to "
								+ oInput.getValue());
							// trigger PATCH by leaving field via simple tab on other control
							return this.waitFor({
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
					return this.waitFor({
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
					return pressButton(this, "discard");
				},
				pressPrepare : function () {
					return pressButton(this, "prepare");
				},
				pressSave : function () {
					return pressButton(this, "save");
				}
			},
			assertions : {
				checkContent : function (sValue) {
					return this.waitFor({
						controlType : "sap.m.Input",
						id : "Content::details",
						matchers : new Properties({value : sValue}),
						success : function (oInput) {
							Opa5.assert.strictEqual(oInput.getValue(), sValue,
								"Content as expected: " + oInput.getValue());
						},
						viewName : sViewName
					});
				}
			}
		}
	});
});