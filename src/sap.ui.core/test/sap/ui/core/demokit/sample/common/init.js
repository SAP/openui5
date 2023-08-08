/*!
 * ${copyright}
 */
sap.ui.require(["sap/ui/core/Core"], function (Core) {
	"use strict";

	Core.ready().then(function () {
		var sComponent = new URLSearchParams(window.location.search).get("component"),
			aRequire = ["sap/ui/core/Component", "sap/ui/core/ComponentContainer"];

		if (!sComponent) {
			/* eslint-disable no-alert */
			alert("Missing URL parameter 'component', e.g. '?component=ViewTemplate.scenario'");
			return;
		}
		document.title = sComponent;

		// Early require SandboxModel, because OData demo apps use model preload=true
		if (sComponent.includes("odata.v4")) {
			aRequire.push("sap/ui/core/sample/"
				+ sComponent.replaceAll(".", "/")
				+ "/SandboxModel");
		}

		sap.ui.require(aRequire, function (Component, ComponentContainer) {
			Component.create({
				name : "sap.ui.core.sample." + sComponent,
				settings : {id : sComponent}
			}).then(function (oComponent) {
				new ComponentContainer({component : oComponent}).placeAt("content");
			}, function (e) {
				alert("Error while instantiating sap.ui.core.sample." + sComponent + ":" + e);
			});
		});
	});
});
