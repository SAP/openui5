/* global QUnit */
// These are some globals generated due to fl (signals, hasher) and m (hyphenation) libs.

sap.ui.define([
	"sap/ui/core/Core",
	"sap/m/Text",
	"sap/ui/core/Icon",
	"./QUnitUtils",
	"sap/ui/mdc/Table",
	"sap/ui/mdc/table/Column",
	"sap/ui/model/json/JSONModel",
	"sap/ui/mdc/table/ResponsiveTableType",
	"sap/ui/mdc/table/ResponsiveColumnSettings"
], function (
	Core,
	Text,
	Icon,
	TableQUnitUtils,
	Table,
	Column,
	JSONModel,
	ResponsiveTableType,
	ResponsiveColumnSettings
) {
	"use strict";

	const sDelegatePath = "test-resources/sap/ui/mdc/delegates/TableDelegate";

	QUnit.module("popinLayout");

	QUnit.test("default popinLayout - ResponsiveTable type (before table creation)", function (assert) {
		const oTable = new Table({
			type: new ResponsiveTableType({
				popinLayout: "Block"
			})
		});

		return oTable.initialized().then(function () {
			assert.equal(oTable._oTable.getPopinLayout(), "Block", "popinLayout set to Block or default type on the inner table");
			oTable.destroy();
		});
	});

	QUnit.test("non-default popinLayout - ResponsiveTable type (before table creation)", function (assert) {
		const oTable = new Table({
			type: new ResponsiveTableType({
				popinLayout: "GridSmall"
			})
		});

		return oTable.initialized().then(function () {
			assert.equal(oTable._oTable.getPopinLayout(), "GridSmall", "popinLayout set to GridSmall type on the inner table");
			oTable.destroy();
		});
	});

	QUnit.test("popinLayout - ResponsiveTable type (after table creation)", function (assert) {
		const oTable = new Table({
			type: new ResponsiveTableType({
			})
		});

		return oTable.initialized().then(function () {
			assert.equal(oTable._oTable.getPopinLayout(), "Block", "popinLayout set to Block type on the inner table");
			const oType = oTable.getType();
			oType.setPopinLayout("GridSmall");
			assert.equal(oTable._oTable.getPopinLayout(), "GridSmall", "popinLayout is set to GridSmall type on the inner table");
			oTable.destroy();
		});
	});

	QUnit.module("extendedSettings");

	QUnit.test("Merge cell", function (assert) {
		const oModel = new JSONModel();
		oModel.setData({
			testPath: [{
				text1: "AA",
				icon: "sap-icon://message-success",
				text2: "11"
			}, {
				text1: "AA",
				icon: "sap-icon://message-success",
				text2: "22"
			}, {
				text1: "BB",
				icon: "sap-icon://message-error",
				text2: "33"
			}, {
				text1: "BB",
				icon: "sap-icon://message-error",
				text2: "44"
			}]
		});

		const oTable = new Table({
			type: "ResponsiveTable",
			delegate: {
				name: sDelegatePath,
				payload: {
					collectionPath: "/testPath"
				}
			}
		});

		oTable.addColumn(new Column({
			header: "Test 1",
			extendedSettings: [
				new ResponsiveColumnSettings({
					mergeFunction: "getText"
				})
			],
			template: new Text({
				text: "{text1}"
			})
		}));

		oTable.addColumn(new Column({
			header: "Test 2",
			extendedSettings: [
				new ResponsiveColumnSettings({
					mergeFunction: "getSrc"
				})
			],
			template: new Icon({
				src: "{icon}"
			})
		}));

		oTable.addColumn(new Column({
			header: "Test 3",
			template: new Text({
				text: "{text2}"
			})
		}));

		oTable.setModel(oModel);
		oTable.placeAt("qunit-fixture");
		Core.applyChanges();

		return TableQUnitUtils.waitForBindingInfo(oTable).then(function () {
			const aColumns = oTable._oTable.getColumns();

			assert.ok(aColumns[0].getMergeDuplicates(), "First column property mergeDuplicates = true");
			assert.strictEqual(aColumns[0].getMergeFunctionName(), "getText", "First column property mergeFunctionName = getText");

			assert.ok(aColumns[1].getMergeDuplicates(), "Second column property mergeDuplicates = true");
			assert.strictEqual(aColumns[1].getMergeFunctionName(), "getSrc", "Second column property mergeFunctionName = getSrc");

			assert.notOk(aColumns[2].getMergeDuplicates(), "Third column property mergeDuplicates = false");
			assert.strictEqual(aColumns[0].getMergeFunctionName(), "getText", "Third column property mergeFunctionName = getText as it's the default value");
		});
	});
});