sap.ui.define([
	'sap/ui/core/UIComponent'
], function(UIComponent) {
	"use strict";

	return UIComponent.extend("sap.ui.table.sample.Aggregations.Component", {
		metadata : {
			rootView : "sap.ui.table.sample.Aggregations.View",
			dependencies : {
				libs : [
					"sap.ui.table",
					"sap.ui.unified",
					"sap.m"
				]
			},

			config : {
				sample : {
					stretch : true,
					files : [
						"View.view.xml",
						"Controller.controller.js",
						"../TableExampleUtils.js"
					]
				}
			}
		}
	});

});
