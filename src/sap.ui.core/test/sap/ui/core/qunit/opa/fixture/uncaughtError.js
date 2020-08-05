sap.ui.define([
	"sap/ui/core/library",
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/mvc/View"
], function (library, Controller, View) {
	"use strict";

	var VIEW_DEFINITION =
		'<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns="sap.m" controllerName="myController" displayBlock="true">' +
		'	<App id="myApp">' +
		'		<Page id="page1" title="Hello">' +
		'			<Button id="myButton" press="onPress"/>' +
		'		</Page>' +
		'	</App>' +
		'</mvc:View>';

	Controller.extend("myController", {
		onPress: function () {
			throw Error("TestUncaughtError");
		}
	});

	View.create({
		definition: VIEW_DEFINITION,
		type: library.mvc.ViewType.XML
	}).then(function(oView) {
		oView.setViewName("myView");
		oView.placeAt("content");
	});

});
