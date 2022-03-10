/* global QUnit */
// These are some globals generated due to fl (signals, hasher) and m (hyphenation) libs.

sap.ui.define([
	"sap/ui/core/Core",
	"sap/ui/mdc/Table",
	"sap/ui/mdc/table/ResponsiveTableType"
], function(
	Core,
	Table,
	ResponsiveTableType
) {
	"use strict";

	QUnit.module("popinLayout");

	QUnit.test("default popinLayout - ResponsiveTable type (before table creation)", function(assert) {
		var oTable = new Table({
			type: new ResponsiveTableType({
				popinLayout: "Block"
			})
		});

		return oTable.initialized().then(function() {
			assert.equal(oTable._oTable.getPopinLayout(), "Block", "popinLayout set to Block or default type on the inner table");
			oTable.destroy();
		});
	});

	QUnit.test("non-default popinLayout - ResponsiveTable type (before table creation)", function(assert) {
		var oTable = new Table({
			type: new ResponsiveTableType({
				popinLayout: "GridSmall"
			})
		});

		return oTable.initialized().then(function() {
			assert.equal(oTable._oTable.getPopinLayout(), "GridSmall", "popinLayout set to GridSmall type on the inner table");
			oTable.destroy();
		});
	});

	QUnit.test("popinLayout - ResponsiveTable type (after table creation)", function(assert) {
		var oTable = new Table({
			type: new ResponsiveTableType({
			})
		});

		return oTable.initialized().then(function() {
			assert.equal(oTable._oTable.getPopinLayout(), "Block", "popinLayout set to Block type on the inner table");
			var oType = oTable.getType();
			oType.setPopinLayout("GridSmall");
			assert.equal(oTable._oTable.getPopinLayout(), "GridSmall", "popinLayout is set to GridSmall type on the inner table");
			oTable.destroy();
		});
	});
});