/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/test/actions/EnterText",
	"sap/ui/test/actions/Press",
	"sap/ui/test/TestUtils"
], function (Opa5, EnterText, Press, TestUtils) {
	"use strict";
	var sCurrentRequestBody,
		sViewName = "sap.ui.core.sample.odata.v4.FieldGroups.FieldGroups";

	Opa5.createPageObjects({
		onTheMainPage : {
			actions : {
				enterValue : function (sId, sValue) {
					this.waitFor({
						actions : new EnterText({text : sValue, keepFocus : true}),
						controlType : "sap.m.Input",
						id : sId,
						viewName : sViewName
					});
				},
				observeRequests : function () {
					this.waitFor({
						success : function () {
							TestUtils.onRequest(function (sRequestBody) {
								sCurrentRequestBody = sRequestBody;
								TestUtils.onRequest(null); // remove listener
							});
						},
						viewName : sViewName
					});
				},
				selectField : function (sId) {
					this.waitFor({
						actions : new Press(),
						controlType : "sap.m.Input",
						id : sId,
						viewName : sViewName
					});
				}
			},
			assertions : {
				checkField : function (sId, sExpectedValue) {
					this.waitFor({
						controlType : "sap.m.Input",
						id : sId,
						success : function (oInput) {
							Opa5.assert.strictEqual(oInput.getValue(), sExpectedValue,
								sId + "=" + sExpectedValue);
						},
						viewName : sViewName
					});
				},
				expectRequest : function (aExpectedMessages) {
					var bSkipTest = false;

					this.waitFor({
						check : function () {
							// check not possible when document lost focus
							bSkipTest = !document.hasFocus();

							return sCurrentRequestBody !== undefined || bSkipTest;
						},
						success : function () {
							if (bSkipTest) {
								Opa5.assert.ok(true, "Document lost focus or test runs in Firefox,"
									+ " check skipped");
							} else {
								aExpectedMessages.forEach(function (sExpectedMessage) {
									Opa5.assert.ok(sCurrentRequestBody.includes(sExpectedMessage),
										sExpectedMessage);
								});
								sCurrentRequestBody = undefined;
							}
						}
					});
				}
			}
		}
	});
});
