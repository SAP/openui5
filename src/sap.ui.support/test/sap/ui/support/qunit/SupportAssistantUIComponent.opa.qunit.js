/*global QUnit*/

sap.ui.define([
	"sap/ui/qunit/qunit-css",
	"sap/ui/thirdparty/qunit",
	"sap/ui/qunit/qunit-junit",
	"sap/ui/thirdparty/sinon",
	"sap/ui/thirdparty/sinon-qunit"
], function(qunitCss, qunit, qunitJunit, sinon, sinonQunit) {
	'use strict';

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
});