/*global QUnit*/

sap.ui.define([
	"sap/ui/Device",
	"sap/ui/test/Opa5",
	"sap/ui/test/opaQunit",
	"./pages/NavigationList",
	"./pages/ExploreSamples"
], function (Device, Opa5, opaTest) {
	"use strict";

	QUnit.module("Editors");

	opaTest("Should be able to open Administrator Editor", function (Given, When, Then) {
		Given.iStartMyApp({ hash: "explore/list"});

		When.onTheExploreSamplesPage.iPressOpenAdministratorEditor();

		Then.onTheExploreSamplesPage.iShouldSeeAdministratorEditorDialog();

		When.onTheExploreSamplesPage.iPressEscape();
	});

	opaTest("Should be able to edit design-time configuration and see changes in Administrator Editor", function (Given, When, Then) {
		if (Device.browser.msie) {
			Then.waitFor({
				success: function () {
					Opa5.assert.ok(true, "Editor is not supported in IE11");
				}
			});
		} else {
			var CONFIGURATION = 'sap.ui.define(["sap/ui/integration/Designtime"], function (Designtime) {'
					+ '"use strict";'
					+ 'return function () {'
					+ '	return new Designtime({'
					+ '		"form": {'
					+ '			"items": {'
					+ '				"groupheader1": {'
					+ '					"label": "General Settings",'
					+ '					"type": "group"'
					+ '				},'
					+ '				"title": {'
					+ '					"manifestpath": "/sap.card/header/title",'
					+ '					"type": "string",'
					+ '					"label": "Card Title"'
					+ '				}'
					+ '			}'
					+ '		},'
					+ '		"preview": {'
					+ '			"modes": "AbstractLive"'
					+ '		}'
					+ '	});'
					+ '	};'
					+ '});';

			When.onTheExploreSamplesPage.iSelectFile("dt/Configuration.js")
				.and.iEnterValueInTextEditor(CONFIGURATION)
				.and.iPressOpenAdministratorEditor();

			Then.onTheExploreSamplesPage.iShouldSeeGeneralSettingsInAdministratorDialog();

			When.onTheExploreSamplesPage.iPressEscape();
		}

		Then.onTheExploreSamplesPage.iTeardownMyApp();
	});

});
