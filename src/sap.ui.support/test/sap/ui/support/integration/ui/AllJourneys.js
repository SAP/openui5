/*global QUnit*/
sap.ui.require([
	"sap/ui/test/Opa5",
	"sap/ui/support/integration/ui/arrangements/Arrangement",
	"sap/ui/support/integration/ui/data/CommunicationMock",
	"sap/ui/test/opaQunit",
	"sap/ui/support/integration/ui/pages/Main",
	"sap/ui/support/integration/ui/pages/Issues",
	"sap/ui/support/integration/ui/pages/Rules",
	"sap/ui/support/integration/ui/pages/Presets",
	"sap/ui/support/integration/ui/pages/TemporaryRule"
], function (Opa5, Arrangement, Communication) {
	"use strict";

	Opa5.extendConfig({
		arrangements: new Arrangement(),
		autoWait: true,
		assertions: new Opa5({
			iTeardownSupportAssistantFrame: function () {
				this.iTeardownMyAppFrame().done(function () {
					Communication.destroy();
				});
			}
		})
	});

	sap.ui.require([
		"sap/ui/support/integration/ui/journeys/BootingJourney",
		"sap/ui/support/integration/ui/journeys/SelectionJourney",
		"sap/ui/support/integration/ui/journeys/LocalStoragePersistencyJourney",
		"sap/ui/support/integration/ui/journeys/FilteringAndSortingJourney",
		"sap/ui/support/integration/ui/journeys/PresetsDialogJourney",
		"sap/ui/support/integration/ui/journeys/PresetsExportJourney",
		"sap/ui/support/integration/ui/journeys/PresetsPersistenceJourney"
	], function () {
		QUnit.start();
	});
});