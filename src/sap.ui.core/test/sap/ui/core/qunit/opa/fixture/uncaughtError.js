sap.ui.define([
	"sap/ui/core/Core",
	"sap/ui/core/library",
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/mvc/View"
], async function (Core, library, Controller, View) {
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
                    type: library.mvc.ViewType.XML
                });
            })
            .then(function (oView) {
                oView.setViewName("myView");
                oView.placeAt("content");
            });

});
