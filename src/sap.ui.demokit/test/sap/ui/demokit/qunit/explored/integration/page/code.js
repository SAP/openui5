sap.ui.define([
		'sap/ui/test/Opa5',
		'test/page/Common',
		'test/page/matchers',
		'sap/ui/test/matchers/PropertyStrictEquals'
	],
	function(Opa5, Common, matchers, PropertyStrictEquals) {
		"use strict";

		Opa5.createPageObjects({

			onTheCodePage : {
				baseClass: Common,
				actions : {
				},
				assertions: {
					iCheckThatTheDownloadButtonWorks : function () {

						return this.waitFor({
							viewName: "code",
							controlType: "sap.m.Button",
							matchers : new PropertyStrictEquals({
								name: "icon",
								value: "sap-icon://download"
							}),
							success : function (aButtons) {
								var oControllerPrototype = Opa5.getWindow().sap.ui.demokit.explored.view.code.prototype,
									oOpenFileStub = sinon.stub(oControllerPrototype, "_openGeneratedFile", jQuery.noop);

								aButtons[0].$().trigger("tap");

								strictEqual(oOpenFileStub.callCount, 1, "did open the generated file");
								oOpenFileStub.restore();
							},
							errorMessage: "Did not find the download Button"
						});

					}
				}
			}

		});

	});
