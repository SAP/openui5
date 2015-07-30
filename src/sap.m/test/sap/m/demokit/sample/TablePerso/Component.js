sap.ui.define(['sap/ui/core/UIComponent'],
	function(UIComponent) {
	"use strict";

	var Component = UIComponent.extend("sap.m.sample.TablePerso.Component", {

		metadata : {
			rootView : "sap.m.sample.TablePerso.Table",
			dependencies : {
				libs : [
					"sap.m",
					"sap.ui.layout"
				]
			},
			config : {
				sample : {
					files : [
						"Table.view.xml",
						"Table.controller.js",
						"DemoPersoService.js",
						"Formatter.js"
					]
				}
			}
		}
	});

	return Component;

});
