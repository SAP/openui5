sap.ui.define([
	'sap/ui/core/UIComponent'
], function(UIComponent) {
	"use strict";

	return UIComponent.extend("sap.ui.table.sample.DnD.Component", {
		metadata : {
			rootView : "sap.ui.table.sample.DnD.View",
			dependencies : {
				libs : [
					"sap.ui.table",
					"sap.m"
				]
			},

			config : {
				sample : {
					stretch : true,
					files : [
						"View.view.xml",
						"Controller.controller.js"
					]
				}
			}
		}
	});

});
