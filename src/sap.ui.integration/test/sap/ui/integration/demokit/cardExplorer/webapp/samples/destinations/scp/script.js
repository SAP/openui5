/*!
 * ${copyright}
 */

// reflects changes from code editor to the card in the example page
sap.ui.define([
	"sap/ui/thirdparty/jquery",
	"sap/ui/core/ComponentContainer",
	"sap/ui/core/Core"
], function(jQuery, ComponentContainer, Core) {
	"use strict";

	var rDestinations = /^\/destinations\/northwind\/V3\/Northwind\/Northwind\.svc\/(.*)/;
	var fnOldAjax = jQuery.ajax;

	jQuery.ajax = function () {
		if (arguments[0].url.match(rDestinations)) {
			arguments[0].url = arguments[0].url.replace(rDestinations, "https://services.odata.org/V3/Northwind/Northwind.svc/$1");
		}

		return fnOldAjax.apply(this, arguments);
	};

	/**
	 * Listens for message with the src of the live-edited sample to be applied
	 */
	window.addEventListener("message", function(oEvent) {
		// We must verify that the origin of the sender of the message matches our
		// expectations. In this case, we're only planning on accepting messages
		// from our own origin, so we can simply compare the origin of the message event
		// to the location of this document. If we get a message from an
		// unexpected host, ignore the message entirely.

		if (oEvent.origin !== (window.location.protocol + "//" + window.location.host)) {
			return;
		}

		var oData = oEvent.data;

		if (!oData || !oData.manifest) {
			return;
		}

		Core.ready(function () {
			var oComponent = Core.getComponent("container-scp");

			if (oComponent) {
				var oView = oComponent.getRootControl(),
				oCard1 = oView.byId("card1");
				oCard1.setManifest(JSON.parse(oData.manifest));
			}
		});
	});

	// instantiate the component
	new ComponentContainer({
		name: "sap.ui.integration.sample.scp",
		manifest: true,
		settings : {
			id : "container-scp"
		},
		async: true
	}).placeAt("content");
});
