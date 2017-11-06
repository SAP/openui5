sap.ui.define(['sap/ui/core/UIComponent'],
	function(UIComponent) {
	"use strict";

	var Component = UIComponent.extend("sap.m.sample.TableMergeCells.Component", {

		metadata : {
			rootView : {
				"viewName": "sap.m.sample.TableMergeCells.Table",
				"type": "XML",
				"async": true
			},
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
						"Formatter.js"
					]
				}
			}
		}
	});

	return Component;

});
