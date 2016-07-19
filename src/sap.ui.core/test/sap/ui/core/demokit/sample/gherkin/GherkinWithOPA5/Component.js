sap.ui.define(["sap/ui/core/UIComponent"], function(UIComponent) {
	"use strict";

	var Component = UIComponent.extend("sap.ui.core.sample.gherkin.GherkinWithOPA5.Component", {

		metadata : {
			dependencies : {
				libs : [
				]
			},
			config : {
				sample : {
					iframe : "GherkinTestRunner.html",
					stretch : true,
					files : [
						"GherkinTestRunner.html",
						"Requirements1.feature",
						"Requirements2.feature",
						"Steps.js",
						"Website.html",
						"WebsiteCode.js"
					]
				}
			}
		}

	});

	return Component;

});
