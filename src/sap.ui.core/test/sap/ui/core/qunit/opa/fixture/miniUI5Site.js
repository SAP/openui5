(function () {
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

	sap.ui.controller("myController", {
	});

	var oView = sap.ui.view({
		viewContent: VIEW_DEFINITION,
		type: sap.ui.core.mvc.ViewType.XML
	});

	oView.setViewName("myView");
	oView.placeAt("content");
}());
