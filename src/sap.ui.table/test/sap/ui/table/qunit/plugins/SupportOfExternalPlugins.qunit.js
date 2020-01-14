/*global QUnit */

sap.ui.define([
	"sap/ui/table/Table",
	"sap/m/plugins/DataStateIndicator"
], function(Table, DataStateIndicator) {
	"use strict";

	QUnit.module("sap.m.DataStateIndicator");

	QUnit.test("Support", function(assert) {
		var bTableSupportsDataStateIndicator;

		try {
			/* eslint-disable no-new */
			new Table({
				dependents: new DataStateIndicator()
			});
			/* eslint-enable no-new */

			bTableSupportsDataStateIndicator = true;
		} catch (e) {
			bTableSupportsDataStateIndicator = false;
		}

		assert.ok(bTableSupportsDataStateIndicator, "Table supports sap.m.DataStateIndicator");
	});
});