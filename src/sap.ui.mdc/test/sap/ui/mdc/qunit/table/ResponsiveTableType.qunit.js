/* global QUnit, sinon */
// These are some globals generated due to fl (signals, hasher) and m (hyphenation) libs.

sap.ui.define([
	"./QUnitUtils",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/ui/mdc/Table",
	"sap/ui/mdc/table/Column",
	"sap/ui/mdc/table/ResponsiveTableType",
	"sap/ui/mdc/table/ResponsiveColumnSettings",
	"sap/ui/mdc/table/RowSettings",
	"sap/ui/mdc/table/RowActionItem",
	"sap/ui/mdc/enums/TableRowActionType",
	"sap/m/Text",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/Icon"
], function(
	TableQUnitUtils,
	nextUIUpdate,
	Table,
	Column,
	ResponsiveTableType,
	ResponsiveColumnSettings,
	RowSettings,
	RowActionItem,
	RowActionType,
	Text,
	JSONModel,
	Icon
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

	QUnit.skip("ShowDetails button lifecycle", async function(assert) { // unstbale
		const oModel = new JSONModel();
			oModel.setData({
				testPath: [
					{test: "Test1"}, {test: "Test2"}, {test: "Test3"}, {test: "Test4"}, {test: "Test5"}
				]
			});

		const oTable = new Table({
				delegate: {
					name: sDelegatePath,
					payload: {
						collectionPath: "/testPath"
					}
				},
				type: new ResponsiveTableType({
					showDetailsButton: true
				}),
				columns: [
					new Column({
						header: "Column A",
						hAlign: "Begin",
						template: new Text({
							text: "{test}"
						}),
						extendedSettings: new ResponsiveColumnSettings({
							importance: "High"
						})
					}),
					new Column({
						header: "Column B",
						hAlign: "Begin",
						template: new Text({
							text: "{test}"
						}),
						extendedSettings: new ResponsiveColumnSettings({
							importance: "High"
						})
					}),
					new Column({
						header: "Column C",
						hAlign: "Begin",
						template: new Text({
							text: "{test}"
						}),
						extendedSettings: new ResponsiveColumnSettings({
							importance: "Medium"
						})
					}),
					new Column({
						header: "Column D",
						hAlign: "Begin",
						template: new Text({
							text: "{test}"
						}),
						extendedSettings: new ResponsiveColumnSettings({
							importance: "Low"
						})
					}),
					new Column({
						header: "Column E",
						hAlign: "Begin",
						template: new Text({
							text: "{test}"
						}),
						extendedSettings: new ResponsiveColumnSettings({
							importance: "Low"
						})
					}),
					new Column({
						header: "Column F",
						hAlign: "Begin",
						template: new Text({
							text: "{test}"
						}),
						extendedSettings: new ResponsiveColumnSettings({
							importance: "High"
						})
					})
				]
			});

		oTable.setModel(oModel);
		oTable.placeAt("qunit-fixture");
		let oType = oTable.getType();
		const fSetParent = sinon.spy(oType, "setParent");
		await nextUIUpdate();

		await TableQUnitUtils.waitForBinding(oTable);
		oTable._oTable.setContextualWidth("600px");
		await nextUIUpdate();
		assert.ok(oType._oShowDetailsButton.getVisible(), "button is visible since table has popins");
		let oShowDetailsButton = oType._oShowDetailsButton;

		oTable.setType(new ResponsiveTableType({showDetailsButton: true}));
		assert.equal(fSetParent.callCount, 1);
		assert.strictEqual(oShowDetailsButton.bIsDestroyed, true);
		assert.notOk(oType._oShowDetailsButton, "showdetail button is destroyed");
		fSetParent.restore();

		await nextUIUpdate();
		await TableQUnitUtils.waitForBinding(oTable);
		oType = oTable.getType();
		oTable._oTable.setContextualWidth("600px");
		await nextUIUpdate();

		assert.ok(oType._oShowDetailsButton.getVisible(), "button is visible since table has popins");
		oShowDetailsButton = oType._oShowDetailsButton;
		oType.destroy();
		assert.strictEqual(oShowDetailsButton.bIsDestroyed, true);
		assert.notOk(oType._oShowDetailsButton, "showdetail button is destroyed");

		oTable.setType(new ResponsiveTableType({showDetailsButton: true}));
		oShowDetailsButton = oType._oShowDetailsButton;
		await nextUIUpdate();
		oType = oTable.getType();

		await TableQUnitUtils.waitForBinding(oTable);
		oType = oTable.getType();
		oTable._oTable.setContextualWidth("600px");
		await nextUIUpdate();
		assert.ok(oType._oShowDetailsButton.getVisible(), "button is visible since table has popins");
		oShowDetailsButton = oType._oShowDetailsButton;
		oTable.destroyType();
		assert.strictEqual(oShowDetailsButton.bIsDestroyed, true);
		assert.notOk(oType._oShowDetailsButton, "showdetail button is destroyed");
	});

	QUnit.module("extendedSettings");

	QUnit.test("Merge cell", async function (assert) {
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
		await nextUIUpdate();

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

	QUnit.module("Row settings", {
		afterEach: function() {
			this.destroyTable();
		},
		createTable: async function(mSettings) {
			this.destroyTable();
			this.oTable = new Table({
				type: new ResponsiveTableType(),
				delegate: {
					name: sDelegatePath,
					payload: {
						collectionPath: "namedModel>/testPath"
					}
				},
				columns: new Column({
					id: "foo0",
					header: "Test0",
					template: new Text({
						text: "template0"
					})
				}),
				models: {
					namedModel: new JSONModel({
						testPath: [{
							type: "Navigation"
						}, {
							type: "Navigation", visible: true
						}, {
							type: "Navigation", visible: "true"
						}]
					})
				},
				...mSettings
			});
			this.oTable.placeAt("qunit-fixture");
			await TableQUnitUtils.waitForBinding(this.oTable);
		},
		destroyTable: function() {
			this.oTable?.destroy();
		}
	});

	QUnit.test("Row actions with default settings", function(assert) {
		return this.createTable({
			rowSettings: new RowSettings({
				rowActions: [
					new RowActionItem()
				]
			})
		}).then(() => {
			assert.ok(false, "Promise should not resolve");
		}).catch((oError) => {
			assert.equal(oError.message,
				"No row action of type 'Navigation' found. ResponsiveTableType only accepts row actions of type 'Navigation'.",
				"Error message");
		});
	});

	QUnit.test("Row actions with static settings", async function (assert) {
		await this.createTable({
			rowSettings: new RowSettings({
				rowActions: [
					new RowActionItem(),
					new RowActionItem({
						type: RowActionType.Navigation,
						text: "My custom action",
						icon: "sap-icon://accept",
						visible: false
					})
				]
			})
		});

		const oInnerTableItemsTemplate = this.oTable._oTable.getBindingInfo("items").template;

		assert.strictEqual(oInnerTableItemsTemplate.getType(), "Inactive", "Item invisible: Inner table items template 'type' value");
		assert.notOk(oInnerTableItemsTemplate.isBound("type"), "Item invisible: Inner table items template 'type' not bound");

		this.oTable.getRowSettings().getRowActions()[1].setVisible(true);
		this.oTable.setRowSettings(this.oTable.getRowSettings());
		assert.strictEqual(oInnerTableItemsTemplate.getType(), "Navigation", "Item visible: Inner table items template 'type' value");
		assert.notOk(oInnerTableItemsTemplate.isBound("type"), "Item visible: Inner table items template 'type' not bound");

		assert.throws(() => {
			this.oTable.getRowSettings().getRowActions()[1].setType();
			this.oTable.setRowSettings(this.oTable.getRowSettings());
		}, new Error("No row action of type 'Navigation' found. ResponsiveTableType only accepts row actions of type 'Navigation'."),
			"Error thrown when setting wrong type");
	});

	QUnit.test("Row actions with bound settings", async function (assert) {
		await this.createTable({
			rowSettings: new RowSettings({
				rowActions: [
					new RowActionItem({
						type: "Navigation",
						text: "{namedModel>text}",
						icon: "{namedModel>icon}",
						visible: "{namedModel>visible}"
					})
				]
			})
		});

		const oInnerTableItemsTemplate = this.oTable._oTable.getBindingInfo("items").template;

		assert.deepEqual({
			model: oInnerTableItemsTemplate.getBindingInfo("type").parts[0].model,
			path: oInnerTableItemsTemplate.getBindingInfo("type").parts[0].path
		}, {
			model: "namedModel",
			path: "visible"
		}, "'type' property binding");

		// The formatter needs to be tested in the context of the items aggregation.
		const aItems = this.oTable._oTable.getItems();
		assert.strictEqual(aItems[0].getType(), "Inactive", "Item 1 type");
		assert.strictEqual(aItems[1].getType(), "Navigation", "Item 2 type");
		assert.strictEqual(aItems[2].getType(), "Inactive", "Item 3 type");
	});

	QUnit.test("Row actions with bound settings and custom formatters", async function (assert) {
		await this.createTable({
			rowSettings: new RowSettings({
				rowActions: [
					new RowActionItem({
						type: "Navigation",
						text: "{namedModel>text}",
						icon: "{namedModel>icon}",
						visible: {
							path: "namedModel>visible",
							formatter: function(sValue) {
								return sValue === "true" ? true : sValue;
							}
						}
					})
				]
			})
		});

		const oInnerTableItemsTemplate = this.oTable._oTable.getBindingInfo("items").template;

		assert.deepEqual({
			model: oInnerTableItemsTemplate.getBindingInfo("type").parts[0].model,
			path: oInnerTableItemsTemplate.getBindingInfo("type").parts[0].path
		}, {
			model: "namedModel",
			path: "visible"
		}, "'type' property binding");

		// The formatter needs to be tested in the context of the items aggregation.
		const aItems = this.oTable._oTable.getItems();
		assert.strictEqual(aItems[0].getType(), "Inactive", "Item 1 type");
		assert.strictEqual(aItems[1].getType(), "Navigation", "Item 2 type");
		assert.strictEqual(aItems[2].getType(), "Navigation", "Item 3 type");
	});

	QUnit.test("Bound row actions", async function (assert) {
		await this.createTable({
			rowSettings: new RowSettings({
				rowActions: {
					path: "namedModel>/testPath",
					template: new RowActionItem({
						type: "{namedModel>type}",
						text: "{namedModel>text}",
						icon: "{namedModel>icon}",
						visible: "{namedModel>visible}"
					})
				}
			})
		});

		const oInnerTableItemsTemplate = this.oTable._oTable.getBindingInfo("items").template;

		assert.deepEqual({
			model: oInnerTableItemsTemplate.getBindingInfo("type").parts[0].model,
			path: oInnerTableItemsTemplate.getBindingInfo("type").parts[0].path
		}, {
			model: "namedModel",
			path: "visible"
		}, "'type' property binding");

		// The formatter needs to be tested in the context of the items aggregation.
		const aItems = this.oTable._oTable.getItems();
		assert.strictEqual(aItems[0].getType(), "Inactive", "Item 1 type");
		assert.strictEqual(aItems[1].getType(), "Navigation", "Item 2 type");
		assert.strictEqual(aItems[2].getType(), "Inactive", "Item 3 type");
	});

	QUnit.test("press' event", async function(assert) {
		await this.createTable({
			rowSettings: new RowSettings({
				rowActions: [
					new RowActionItem({
						id: "myRowActionitem",
						type: RowActionType.Navigation
					})
				]
			})
		});

		await new Promise((resolve) => {
			this.oTable._oTable.attachEventOnce("updateFinished", resolve);
		});

		this.oTable._oTable.getItems()[1].$().trigger("tap");
		let oEvent = await new Promise((resolve) => {
			this.oTable.getRowSettings().getRowActions()[0].attachEventOnce("press", resolve);
		});
		assert.deepEqual(oEvent.getParameters(), {
			id: "myRowActionitem",
			bindingContext: this.oTable._oTable.getItems()[1].getBindingContext("namedModel")
		}, "'press' event handler called with the correct parameters");

		this.oTable._oTable.getItems()[2].$().trigger("tap");
		oEvent = await new Promise((resolve) => {
			this.oTable.getRowSettings().getRowActions()[0].attachEventOnce("press", resolve);
		});
		assert.deepEqual(oEvent.getParameters(), {
			id: "myRowActionitem",
			bindingContext: this.oTable._oTable.getItems()[2].getBindingContext("namedModel")
		}, "'press' event handler called with the correct parameters");
	});

	QUnit.module("Events", {
		afterEach: function() {
			this.destroyTable();
		},
		createTable: async function(mSettings) {
			this.destroyTable();
			this.oTable = new Table({
				type: new ResponsiveTableType(),
				delegate: {
					name: sDelegatePath,
					payload: {
						collectionPath: "namedModel>/testPath"
					}
				},
				columns: new Column({
					id: "foo0",
					header: "Test0",
					template: new Text({
						text: "template0"
					})
				}),
				models: {
					namedModel: new JSONModel({
						testPath: new Array(3).fill({})
					})
				},
				...mSettings
			});
			this.oTable.placeAt("qunit-fixture");
			await TableQUnitUtils.waitForBinding(this.oTable);
			await new Promise((resolve) => {
				this.oTable._oTable.attachEventOnce("updateFinished", resolve);
			});
		},
		destroyTable: function() {
			this.oTable?.destroy();
		}
	});

	QUnit.test("Table 'rowPress' event listener attached on init", async function(assert) {
		const oRowPress = sinon.spy();

		await this.createTable({
			rowPress: (oEvent) => {
				oRowPress(oEvent.getParameters());
			}
		});

		this.oTable._oTable.getItems()[1].$().trigger("tap");
		await new Promise((resolve) => {
			this.oTable.attachEventOnce("rowPress", resolve);
		});

		assert.ok(oRowPress.calledOnceWithExactly({
			id: this.oTable.getId(),
			bindingContext: this.oTable._oTable.getItems()[1].getBindingContext("namedModel")
		}), "'rowPress' event handler called with the correct parameters");
	});

	QUnit.skip("Table 'rowPress' event listener attached after init", async function(assert) {
		const oRowPress = sinon.spy();

		await this.createTable();
		await new Promise((resolve) => {
			this.oTable.attachEventOnce("rowPress", (oEvent) => {
				oRowPress(oEvent.getParameters());
				resolve();
			});
			this.oTable._oTable.getItems()[1].$().trigger("tap");
		});

		assert.ok(oRowPress.calledOnceWithExactly({
			id: this.oTable.getId(),
			bindingContext: this.oTable._oTable.getItems()[1].getBindingContext("namedModel")
		}), "'rowPress' event handler called with the correct parameters");
	});
});