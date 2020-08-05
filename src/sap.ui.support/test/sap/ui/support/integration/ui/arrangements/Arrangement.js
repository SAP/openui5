sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/support/integration/ui/data/CommunicationMock",
	"sap/ui/test/matchers/PropertyStrictEquals",
	"sap/ui/support/mock/StorageSynchronizer"
], function (Opa5, Communication, PropertyStrictEquals, StorageSynchronizer) {
	"use strict";

	var sOverlayMockPath = sap.ui.require.toUrl("sap/ui/support/mock/overlayMock.html?sap-ui-animation=false");

	return Opa5.extend("sap.ui.support.integration.ui.arrangements.Arrangement", {

		iStartMyApp: function () {
			Communication.init(Opa5.getWindow);
			this.iStartMyAppInAFrame({
				source: sOverlayMockPath,
				autoWait: true
			});

			return this.waitFor({
				controlType: "sap.m.Text",
				matchers: new PropertyStrictEquals({
					name: "text",
					value: "Support Assistant"
				}),
				success: function () {
					Opa5.assert.ok(true, "Support assistant UI is visible");
				}
			});
		},

		iDeletePersistedData: function () {
			StorageSynchronizer.deletePersistedData();
			Opa5.assert.ok(true, "Persistence cookie and local storage data are deleted");

			return this;
		}
	});
});