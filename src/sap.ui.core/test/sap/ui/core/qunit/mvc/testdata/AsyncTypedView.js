sap.ui.define([
	"sap/m/Image",
	"sap/m/Input",
	"sap/m/Label",
	"sap/m/Link",
	"sap/ui/core/mvc/View",
	"sap/ui/layout/library",
	"sap/ui/layout/form/SimpleForm"
], function (Image, Input, Label, Link, View, layoutlibrary, SimpleForm) {
	"use strict";

	var SimpleFormLayout = layoutlibrary.form.SimpleFormLayout;

	return View.extend("testdata.mvc.AsyncTypedView", {

		getControllerName: function () {
			return "testdata.mvc.Async"; // the Controller lives in testdata.mvc.Async.controller.js
		},

		createContent: function (oController) {
			return new Promise(function(res, rej) {
				var oImg = new Image({
					width: '115px',
					height: '110px',
					src: './testdata/images/screw.jpg'
				});
				var oForm = new SimpleForm({
					id: this.createId("Layout"),
					layout: SimpleFormLayout.ColumnLayout,
					content: [
						new Label({
							text: "Product"
						}),
						new Input({
							id: this.createId("Product"),
							value: "Deluxe Screw"
						}),
						new Label({
							text: "Material"
						}),
						new Input({
							id: this.createId("Material"),
							value: "Titanium"
						}),
						new Label({
							id: this.createId("More1"),
							text: "Diameter:"
						}),
						new Input({
							id: this.createId("TFMore1"),
							value: "1/4 inch"
						}),
						new Label({
							id: this.createId("More2"),
							text: "Length:"
						}),
						new Input({
							id: this.createId("TFMore2"),
							value: "2 inch"
						}),
						new Label({
							id: this.createId("More3"),
							text: "Package Quantity:"
						}),
						new Input({
							id: this.createId("TFMore3"),
							value: "500"
						}),
						new Link({
							id: this.createId("showMore"),
							text: "show details...",
							press: oController.showMore
						}),
						new Link({
							id: this.createId("hideMore"),
							text: "hide details...",
							press: oController.hideMore
						})
					]
				});

				res([oImg, oForm]);
			}.bind(this));
		}
	});

});