/*global QUnit*/

(function () {
	'use strict';

	jQuery.sap.require('sap.ui.qunit.qunit-css');
	jQuery.sap.require('sap.ui.thirdparty.qunit');
	jQuery.sap.require('sap.ui.qunit.qunit-junit');
	jQuery.sap.require('sap.ui.qunit.qunit-coverage');
	jQuery.sap.require('sap.ui.thirdparty.sinon');
	jQuery.sap.require('sap.ui.thirdparty.sinon-qunit');

	sap.ui.require(
		['sap/ui/test/Opa5', 'sap/ui/test/opaQunit', 'sap/ui/test/actions/Press'],
		function (Opa5, opaTest, Press) {

			QUnit.module('Support Assistant Booting');

			opaTest('Support Assistant OPA extension should start in UIComponent container', function (Given, When, Then) {

				Given.iStartMyUIComponent({
					componentConfig: {
						name: 'appUnderTest',
						url: '../integration/applicationUnderTest/'
					}
				});

				When.waitFor({
					viewName: 'Main',
					success: function () {
						var bLoaded = sap.ui.getCore().getLoadedLibraries()["sap.ui.support"];

						Opa5.assert.ok(bLoaded, 'Support Assistant library loaded');
					}
				});

				Then.iTeardownMyApp();
			});

		});
})();