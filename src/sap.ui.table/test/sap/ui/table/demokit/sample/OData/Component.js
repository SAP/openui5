sap.ui.define([
	'sap/ui/core/UIComponent'
], function(UIComponent) {
	"use strict";

	return UIComponent.extend("sap.ui.table.sample.OData.Component", {
		metadata : {
			rootView : "sap.ui.table.sample.OData.View",
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
						"../TableExampleUtils.js",
						"metadata.xml",
						"ProductSet.json"
					]
				}
			}
		}
	});

});
