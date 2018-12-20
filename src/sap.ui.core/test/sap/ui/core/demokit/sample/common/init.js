/*!
 * ${copyright}
 */

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"jquery.sap.script", // jQuery.sap.getUriParameters()
		"sap/ui/core/Component",
		"sap/ui/core/ComponentContainer"
	], function (jQuery, Component, ComponentContainer) {
		/* eslint-disable no-alert */

		var sComponentName = jQuery.sap.getUriParameters().get("component");

		if (!sComponentName) {
			alert("Missing URL parameter 'component', e.g. '?component=ViewTemplate.scenario'");
		} else {
			Component.create({
				name : "sap.ui.core.sample." + sComponentName,
				settings : {id : sComponentName}
			}).then(function (oComponent) {
				new ComponentContainer({component : oComponent}).placeAt('content');
			}, function (e) {
				alert("Error while instantiating sap.ui.core.sample." + sComponentName + ":" + e);
			});
		}
	});
});