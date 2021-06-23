sap.ui.define([
	"sap/ui/core/mvc/View",
	"sap/m/ObjectHeader",
	"sap/m/ObjectStatus",
	"sap/m/ObjectAttribute",
	"sap/ui/core/library"
], function(View, ObjectHeader, ObjectStatus, ObjectAttribute, coreLibrary) {
	"use strict";

	var ValueState = coreLibrary.ValueState;

	return View.extend("sap.ui.core.sample.View.async.AsyncView", {

		getControllerName: function() {
			return "sap.ui.core.sample.View.async.Sample";
		},

		getAutoPrefixId: function() {
			return true;
		},

		createContent: function() {
			return new ObjectHeader("ob", {
				title: "Deluxe Screw",
				statuses: [new ObjectStatus("os",{
					text: "In Stock",
					state: ValueState.Success
				})],
				icon: "{img>/products/screw}",
				attributes: [
					new ObjectAttribute("c1", {
						text: "Weight: 10 gr"
					}),
					new ObjectAttribute("c2", {
						text: "Size: 1,4 x 1,8 x 0,8 inch"
					}),
					new ObjectAttribute("c3",{
						text: "Material: Vibranium"
					}),
					new ObjectAttribute("c4", {
						text: "Description: A really nice typed screw."
					})
				],
				iconDensityAware: false
			});
		}
	});

});