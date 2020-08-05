sap.ui.define([
	"sap/m/ObjectHeader",
	"sap/m/ObjectStatus",
	"sap/m/ObjectAttribute",
	"sap/ui/core/library"
], function(ObjectHeader, ObjectStatus, ObjectAttribute, coreLibrary) {
	"use strict";

	var ValueState = coreLibrary.ValueState;

	sap.ui.jsview("sap.ui.core.sample.View.async.Async", {

		getControllerName: function() {
			return "sap.ui.core.sample.View.async.Sample";
		},

		createContent: function() {

			var oObjectHeader = new ObjectHeader({
				title: "Deluxe Screw",
				statuses: [new ObjectStatus({
					text: "In Stock",
					state: ValueState.Success
				})],
				attributes: [
					new ObjectAttribute({
						text: "Weight: 10 gr"
					}),
					new ObjectAttribute({
						text: "Size: 1,4 x 1,8 x 0,8 inch"
					}),
					new ObjectAttribute({
						text: "Material: Vibranium"
					}),
					new ObjectAttribute({
						text: "Description: A really nice javascript screw."
					})
				],
				iconDensityAware: false
			});
			oObjectHeader.bindProperty("icon", "img>/products/screw");

			return oObjectHeader;
		}
	});

});