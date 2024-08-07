/*!
 * ${copyright}
 */

// reflects changes from code editor to the card in the example page
(function() {
	"use strict";

	let Component;
	let Core;

	sap.ui.require(["sap/ui/core/Core", "sap/ui/core/Component"], (_Core, _Component) => {
		Core = _Core;
		Component = _Component;
	});

	// Listens for message with the src of the live-edited sample to be applied
	window.addEventListener("message", function(oEvent) {
		// We must verify that the origin of the sender of the message matches our
		// expectations. In this case, we're only planning on accepting messages
		// from our own origin, so we can simply compare the origin of the message event
		// to the location of this document. If we get a message from an
		// unexpected host, ignore the message entirely.

		if (oEvent.origin !== (window.location.protocol + "//" + window.location.host)) {
			return;
		}

		const oData = oEvent.data;

		if (!oData || !oData.manifest) {
			return;
		}

		Core?.ready(() => {
			const oComponent = Component.getComponentById("container-design");

			if (oComponent) {
				const oView = oComponent.getRootControl(),
					oCard1 = oView.byId("listCardId1");
				oCard1.setManifest(JSON.parse(oData.manifest));
			}
		});
	});
})();