sap.ui.define([
	"sap/ui/core/library",
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/mvc/View"
], function (library, Controller, View) {
	"use strict";

	var VIEW_DEFINITION =
		'<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns="sap.m" controllerName="myController" displayBlock="true">' +
			'<App id="myApp">' +
				'<Page id="page1" title="Hello">' +
					'<Button id="myButton"/>' +
				'</Page>' +
				'<Page id="page2" title="Hello">' +
					'<Button id="myButton2"/>' +
				'</Page>' +
			'</App>' +
			'<Button id="buttonOutsideOfTheApp"></Button>' +
		'</mvc:View>';

	sap.ui.define("myController.controller", function() {
		return Controller.extend("myController", {});
	});

	Controller.create({ name: "myController" })
		.then(function () {
			return View.create({
				definition: VIEW_DEFINITION,
				type: library.mvc.ViewType.XML
			});
		})
		.then(function (oView) {
			oView.setViewName("myView");
			oView.placeAt("content");
		});

});
