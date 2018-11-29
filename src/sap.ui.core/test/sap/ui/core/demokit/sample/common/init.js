/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/core/Component"
], function (Component) {
	"use strict";
	/* eslint-disable no-alert */

	sap.ui.getCore().attachInit(function () {
		var sComponentName = jQuery.sap.getUriParameters().get("component");

		if (!sComponentName) {
			alert("Missing URL parameter 'component', e.g. '?component=ViewTemplate.scenario'");
		} else {
			sap.ui.loader.config({paths:{"sap/ui/core/sample": "test-resources/sap/ui/core/demokit/sample"}});

			Component.create({
				name : "sap.ui.core.sample." + sComponentName,
				settings : {id : sComponentName}
			}).then(function (oComponent) {
				new sap.ui.core.ComponentContainer({component : oComponent}).placeAt('content');
			}, function (e) {
				alert("Error while instantiating sap.ui.core.sample." + sComponentName + ":" + e);
			});
		}
	});
});