sap.ui.define([
	"sap/ui/core/Core",
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/mvc/View",
	"sap/ui/core/mvc/ViewType"
], async function (Core, Controller, View, ViewType) {
	"use strict";

	await Core.ready();

	var VIEW_DEFINITION =
		'<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns="sap.m" controllerName="myController" displayBlock="true">' +
		'	<App id="myApp">' +
		'		<Page id="page1" title="Hello">' +
		'			<Button id="myButton" press="onPress"/>' +
		'		</Page>' +
		'	</App>' +
		'</mvc:View>';

        sap.ui.define("myController.controller", function () {
            return Controller.extend("myController", {
                onPress: function () {
                    throw Error("TestUncaughtError");
                }
            });
        });

        Controller.create({ name: "myController" })
            .then(function () {
                return View.create({
                    definition: VIEW_DEFINITION,
                    type: ViewType.XML
                });
            })
            .then(function (oView) {
                oView.setViewName("myView");
                oView.placeAt("content");
            });

});
