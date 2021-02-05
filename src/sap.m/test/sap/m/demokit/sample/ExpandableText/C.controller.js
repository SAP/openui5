sap.ui.define([
	'sap/ui/core/mvc/Controller',
	'sap/ui/model/json/JSONModel'
], function(Controller, JSONModel) {
	"use strict";
	return Controller.extend("sap.m.sample.ExpandableText.C", {

		onInit: function () {
			// create some dummy JSON data
			var oData = {
				products: [
					{
						name: "Product 1",
						attribute1: "The full text is displayed in place. Lorem ipsum dolor sit amet, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum.Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Lorem ipsum dolor sit amet, consetetur sadipscing elitr",
						attribute2: "Attribute related to label",
						status: "Some status",
						overflowMode: sap.m.ExpandableTextOverflowMode.InPlace
					},
					{
						name: "Product 2",
						attribute1: "The full text is displayed in a popover. Lorem ipsum dolor sit amet, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum.Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Lorem ipsum dolor sit amet, consetetur sadipscing elitr",
						attribute2: "Attribute related to label",
						status: "Some status",
						overflowMode: sap.m.ExpandableTextOverflowMode.Popover
					},
					{
						name: "Product 3",
						attribute1: "The full text is displayed in place. Lorem ipsum dolor sit amet, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum.Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Lorem ipsum dolor sit amet, consetetur sadipscing elitr",
						attribute2: "Attribute related to label",
						status: "Some status",
						overflowMode: sap.m.ExpandableTextOverflowMode.InPlace
					},
					{
						name: "Product 4",
						attribute1: "The full text is displayed in a popover. Lorem ipsum dolor sit amet, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum.Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Lorem ipsum dolor sit amet, consetetur sadipscing elitr",
						attribute2: "Attribute related to label",
						status: "Some status",
						overflowMode: sap.m.ExpandableTextOverflowMode.Popover
					}
				]
			};

			// create a Model with this data
			var oModel = new JSONModel(oData);
			this.getView().setModel(oModel);
		}
	});
});
