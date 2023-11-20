sap.ui.define([
	"sap/ui/test/Opa5",
	"./Base",
	"sap/ui/test/actions/Press",
	"sap/ui/test/matchers/PropertyStrictEquals"
], function (Opa5, Base, Press, PropertyStrictEquals) {
	"use strict";

	var sViewName = "Detail";

	Opa5.createPageObjects({
		onTheDetailPage: {
			baseClass: Base,
			actions: {

				iPressLink: function (sComponentPrefix, sLinkText) {
					return this.waitFor({
						controlType: "sap.m.Link",
						viewName:  sViewName,
						viewNamespace: "sap.ui.core.sample.RoutingNestedComponent.reuse." + sComponentPrefix + ".view.",
						matchers: new PropertyStrictEquals({
							name: "text",
							value: sLinkText
						}),
						actions: new Press(),
						success: function () {
							Opa5.assert.ok(true, "The link with text '" + sLinkText + "' was pressed.");
						}
					});
				}
			}

		}

	});

});