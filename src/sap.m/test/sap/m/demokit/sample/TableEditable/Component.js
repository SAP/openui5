sap.ui.define(['sap/ui/core/UIComponent'],
	function(UIComponent) {
	"use strict";

	var Component = UIComponent.extend("sap.m.sample.TableEditable.Component", {

		metadata : {
			rootView : "sap.m.sample.TableEditable.Table",
			dependencies : {
				libs : [
					"sap.m"
				]
			},
			config : {
				sample : {
					stretch : true,
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
