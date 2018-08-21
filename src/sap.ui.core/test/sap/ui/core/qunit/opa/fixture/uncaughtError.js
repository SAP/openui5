(function () {
	"use strict";

	var VIEW_DEFINITION =
		'<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns="sap.m" controllerName="myController" displayBlock="true">' +
		'	<App id="myApp">' +
		'		<Page id="page1" title="Hello">' +
		'			<Button id="myButton" press="onPress"/>' +
		'		</Page>' +
		'	</App>' +
		'</mvc:View>';

	sap.ui.controller("myController", {
		onPress: function () {
			throw Error("TestUncaughtError");
		}
	});

	var oView = sap.ui.view({
		viewContent: VIEW_DEFINITION,
		type: sap.ui.core.mvc.ViewType.XML
	});

	oView.setViewName("myView");
	oView.placeAt("content");
}());
