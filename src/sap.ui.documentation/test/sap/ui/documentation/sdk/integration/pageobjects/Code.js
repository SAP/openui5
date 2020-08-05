/*global sinon*/

sap.ui.define([
	'sap/ui/test/Opa5',
	'sap/ui/test/matchers/PropertyStrictEquals'
], function (Opa5, PropertyStrictEquals) {
	"use strict";

	Opa5.createPageObjects({
		onTheCodePage: {
			viewName: "Code",
			actions: {
				iPressOnShowCode : function () {
					return this.waitFor({
						controlType: "sap.m.Button",
						matchers : new PropertyStrictEquals({
							name: "icon",
							value: "sap-icon://syntax"
						}),
						success : function (aButtons) {
							aButtons[0].$().trigger("tap");
						},
						errorMessage: "Did not find the show code button"
					});
				}
			},

			assertions: {
				iCheckThatTheDownloadButtonWorks : function () {

					return this.waitFor({
						viewName: "Code",
						controlType: "sap.m.Button",
						matchers : new PropertyStrictEquals({
							name: "icon",
							value: "sap-icon://download"
						}),
						success : function (aButtons) {
							var oControllerPrototype = Opa5.getWindow().sap.ui.documentation.sdk.controller.Code.prototype,
								oOpenFileStub = sinon.stub(oControllerPrototype, "_openGeneratedFile", jQuery.noop),
								oAssert =  Opa5.assert,
								fnDone = oAssert.async();

							aButtons[0].$().trigger("tap");

							setTimeout(function() {
								oAssert.strictEqual(oOpenFileStub.callCount, 1, "did open the generated file");
								oOpenFileStub.restore();
								fnDone();
							}, 500);

						},
						errorMessage: "Did not find the download Button"
					});

				}
			}
		}
	});

});
