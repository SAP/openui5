(function () {
	"use strict";

	var VIEW_DEFINITION =
		'<mvc:View xmlns:core="sap.ui.core" xmlns:mvc="sap.ui.core.mvc" xmlns="sap.m" controllerName="myController" displayBlock="true">' +
			'<App id="myApp">' +
				'<Page id="page1" title="Hello">' +
				'</Page>' +
			'</App>' +
		'</mvc:View>';

	/* eslint-disable no-console */
	var fnLog = console.debug || console.log;
	/* eslint-enable no-console */

	sap.ui.controller("myController", {
		onInit: function () {
			setTimeout(function () {
				fnLog("onInit timeout executed after 600ms");
			}, 600);
		},
		onAfterRendering: function () {
			setTimeout(function () {
				fnLog("onAfterRendering timeout executed after 900ms");
			}, 900);
		}
	});

	var oView = sap.ui.view({
		viewContent: VIEW_DEFINITION,
		type:sap.ui.core.mvc.ViewType.XML
	});

	oView.setViewName("myView");
	oView.placeAt("content");
}());