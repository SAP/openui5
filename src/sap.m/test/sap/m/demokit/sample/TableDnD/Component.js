sap.ui.define([
	'sap/ui/core/UIComponent'
], function(UIComponent) {
	"use strict";

	return UIComponent.extend("sap.m.sample.TableDnD.Component", {
		metadata : {
			rootView : "sap.m.sample.TableDnD.View",
			dependencies : {
				libs : [
					"sap.m"
				]
			},
			config : {
				sample : {
					stretch : true,
					files : [
						"View.view.xml",
						"Controller.controller.js",
						"AvailableProducts.view.xml",
						"AvailableProducts.controller.js",
						"SelectedProducts.view.xml",
						"SelectedProducts.controller.js",
						"Utils.js"
					]
				}
			}
		}
	});

});
