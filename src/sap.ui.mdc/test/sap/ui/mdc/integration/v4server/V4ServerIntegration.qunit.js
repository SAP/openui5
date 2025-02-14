/* global QUnit */
QUnit.config.autostart = false;

sap.ui.define([
	"test-resources/sap/ui/mdc/integration/opaTestWithV4Server",
	"v4server/integration/TestJourney"
], async function (
	opaTestWithV4Server,
	fnTestJourney
) {
	"use strict";
	fnTestJourney(await opaTestWithV4Server);
	QUnit.start();
});
