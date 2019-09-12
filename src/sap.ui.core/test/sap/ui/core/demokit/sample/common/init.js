/*!
 * ${copyright}
 */

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"sap/base/util/UriParameters",
		"sap/ui/core/Component",
		"sap/ui/core/ComponentContainer"
	], function (UriParameters, Component, ComponentContainer) {
		/* eslint-disable no-alert */

		var sComponentName = UriParameters.fromQuery(window.location.search).get("component");

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