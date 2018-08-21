/*global QUnit*/

jQuery.sap.require('sap.ui.qunit.qunit-css');
jQuery.sap.require('sap.ui.thirdparty.qunit');
jQuery.sap.require('sap.ui.qunit.qunit-junit');
jQuery.sap.require('sap.ui.qunit.qunit-coverage');
jQuery.sap.require('sap.ui.thirdparty.sinon');
jQuery.sap.require('sap.ui.thirdparty.sinon-qunit');

QUnit.config.autostart = false;

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
		autowait: true,
		assertions: new sap.ui.test.Opa5({
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
		"sap/ui/support/integration/ui/journeys/PresetsJourney",
		"sap/ui/support/integration/ui/journeys/TemporaryRulesJourney"
	], function () {
		QUnit.start();
	});
});