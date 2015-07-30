sap.ui.define(['sap/ui/core/UIComponent'],
	function(UIComponent) {
	"use strict";

	var Component = UIComponent.extend("sap.m.sample.TableLayout.Component", {

		metadata : {
			rootView : "sap.m.sample.TableLayout.Table",
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
						"Dialog.fragment.xml"
					]
				}
			}
		}
	});

	return Component;

});
