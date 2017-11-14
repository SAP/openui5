sap.ui.define(['sap/ui/core/UIComponent'],
	function(UIComponent) {
	"use strict";

	var Component = UIComponent.extend("sap.m.sample.TableTest.Component", {

		metadata : {
			dependencies : {
				libs : [
					"sap.m"
				]
			},
			config : {
				sample : {
					iframe : "OpaTableTest.html",
					stretch : true,
					files : [
						"OpaTableTest.html",
						"applicationUnderTest/index.html",
						"applicationUnderTest/Component.js",
						"applicationUnderTest/products.json",
						"applicationUnderTest/view/Table.view.xml",
						"applicationUnderTest/view/Table.controller.js",
						"applicationUnderTest/view/Formatter.js"
					]
				}
			}
		}

	});

	return Component;

});
