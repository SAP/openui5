(function() {
	"use strict";

	sap.ui.jsview("testdata.mvc_legacyAPIs.Async", { // this View file is called Async.view.js

		getControllerName: function() {
			return "testdata.mvc_legacyAPIs.Async"; // the Controller lives in testdata.mvc_legacyAPIs.Async.controller.js
		},

		createContent: function(oController) {
			var oImg = new sap.m.Image({
				width: '115px',
				height: '110px',
				src: './testdata/images/screw.jpg'
			});
			var oForm = new sap.ui.layout.form.SimpleForm({
				id: this.createId("Layout"),
				content: [
					new sap.m.Label({
						text: "Product"
					}),
					new sap.m.Input({
						id: this.createId("Product"),
						value: "Deluxe Screw"
					}),
					new sap.m.Label({
						text: "Material"
					}),
					new sap.m.Input({
						id: this.createId("Material"),
						value: "Titanium"
					}),
					new sap.m.Label({
						id: this.createId("More1"),
						text: "Diameter:"
					}),
					new sap.m.Input({
						id: this.createId("TFMore1"),
						value: "1/4 inch"
					}),
					new sap.m.Label({
						id: this.createId("More2"),
						text: "Length:"
					}),
					new sap.m.Input({
						id: this.createId("TFMore2"),
						value: "2 inch"
					}),
					new sap.m.Label({
						id: this.createId("More3"),
						text: "Package Quantity:"
					}),
					new sap.m.Input({
						id: this.createId("TFMore3"),
						value: "500"
					}),
					new sap.m.Link({
						id: this.createId("showMore"),
						text: "show details...",
						press: oController.showMore
					}),
					new sap.m.Link({
						id: this.createId("hideMore"),
						text: "hide details...",
						press: oController.hideMore
					})
				]
			});

			return [oImg, oForm];
		}

	});

}());