sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/support/integration/ui/arrangements/Arrangement",
	"sap/ui/support/integration/ui/data/CommunicationMock",
	"sap/ui/support/mock/StorageSynchronizer",
	"sap/ui/test/opaQunit",
	"sap/ui/support/integration/ui/pages/Main",
	"sap/ui/support/integration/ui/pages/Issues",
	"sap/ui/support/integration/ui/pages/Rules",
	"sap/ui/support/integration/ui/pages/Presets",
	"sap/ui/support/integration/ui/pages/TemporaryRule"
], function (Opa5, Arrangement, CommunicationMock, StorageSynchronizer) {
	"use strict";

	StorageSynchronizer.initialize();

	Opa5.extendConfig({
		arrangements: new Arrangement(),
		autoWait: true,
		assertions: new Opa5({
			iTeardownSupportAssistantFrame: function () {
				return this.waitFor({
					check: function () {
						StorageSynchronizer.preserve(Opa5.getWindow());

						return this.iTeardownMyAppFrame().done(function () {
							CommunicationMock.destroy();
						});
					}
				});
			}
		})
	});
});