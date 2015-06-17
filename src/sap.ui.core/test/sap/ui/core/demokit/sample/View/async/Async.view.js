sap.ui.jsview("sap.ui.core.sample.View.async.Async", {

	getControllerName: function() {
		return "sap.ui.core.sample.View.async.Sample";
	},

	createContent: function() {

		var oObjectHeader = new sap.m.ObjectHeader({
			title: "Deluxe Screw",
			statuses: [new sap.m.ObjectStatus({
				text: "In Stock",
				state: sap.ui.core.ValueState.Success
			})],
			attributes: [
				new sap.m.ObjectAttribute({
					text: "Weight: 10 gr"
				}),
				new sap.m.ObjectAttribute({
					text: "Size: 1,4 x 1,8 x 0,8 inch"
				}),
				new sap.m.ObjectAttribute({
					text: "Material: Vibranium"
				}),
				new sap.m.ObjectAttribute({
					text: "Description: A really nice javascript screw."
				})
			],
			iconDensityAware: false
		});
		oObjectHeader.bindProperty("icon", "img>/products/screw");

		return oObjectHeader;
	}
});
