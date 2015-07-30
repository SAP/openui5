sap.ui.require([
		"sap/ui/test/Opa5",
		'test/page/Common',
		'sap/ui/test/matchers/PropertyStrictEquals'
	],
	function(Opa5, Common, PropertyStrictEquals) {
		"use strict";

		Opa5.createPageObjects({

			baseClass: Common,
			onTheSamplePage : {
				actions : {
					iPressOnShowCode : function () {
						return this.waitFor({
							viewName: "sample",
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
				}
			}

		});

	});
