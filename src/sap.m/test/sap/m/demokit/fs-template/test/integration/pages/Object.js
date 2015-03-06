sap.ui.require([
		'sap/ui/test/Opa5',
		'sap/ui/test/matchers/PropertyStrictEquals',
		'sap/ui/demo/fstemplate/test/integration/pages/Common'
	],
	function(Opa5, PropertyStrictEquals, Common) {
		"use strict";

		var sViewName = "Object";

		Opa5.createPageObjects({
			onTheObjectPage: {
				baseClass: Common,
				actions: {
					iPressTheBackButton : function () {
						return this.waitFor({
							id : "objectPage",
							viewName : sViewName,
							success: function (oPage) {
								oPage.$("navButton").trigger("tap");
							},
							errorMessage : "Did not find the nav button on object page"
						});
					}
				},
				assertions: {

					iShouldSeeTheObject : function (iObjectNumber) {
						var sTitleName = "Object " + iObjectNumber;
						return this.waitFor({
							controlType : "sap.m.ObjectHeader",
							viewName : sViewName,
							matchers : [ new PropertyStrictEquals({name : "title", value : sTitleName }) ],
							success : function (aControls) {
								strictEqual(aControls.length, 1, "found only one Objectheader with the object name");
								ok(true, "was on the " + sTitleName + " page");
							},
							errorMessage : "We are not on the " + sTitleName + " page"
						});
					}
				}
			}
		});
	});
