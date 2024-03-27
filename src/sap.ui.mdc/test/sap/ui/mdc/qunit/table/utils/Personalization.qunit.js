/* global QUnit, sinon */
sap.ui.define([
	"../QUnitUtils",
	"../../../delegates/TableDelegate",
	"../../util/createAppEnvironment",
	"sap/ui/mdc/table/utils/Personalization",
	"sap/ui/mdc/Table",
	"sap/ui/mdc/p13n/StateUtil",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/base/util/Deferred"
], function(
	TableQUnitUtils,
	TableDelegate,
	createAppEnvironment,
	PersonalizationUtils,
	Table,
	StateUtil,
	nextUIUpdate,
	Deferred
) {
	"use strict";

	const sTableView =
	`<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:m="sap.m" xmlns="sap.ui.mdc" xmlns:mdcTable="sap.ui.mdc.table">
		<Table id="myTable"
			p13nMode="Column,Sort,Filter,Group,Aggregate"
			delegate='{
				name: "test-resources/sap/ui/mdc/delegates/TableDelegate",
				payload: {collectionPath: "/testPath"}
			}'>
			<columns>
				<mdcTable:Column id="myTable-columnA" header="Column A" propertyKey="colA">
					<m:Text />
				</mdcTable:Column>
			</columns>
		</Table>
	</mvc:View>`;

	TableQUnitUtils.stubPropertyInfos(Table.prototype, [{
		name: "colA",
		label: "Column A",
		path: "a",
		dataType: "String"
	}, {
		name: "colB",
		label: "Column B",
		path: "b",
		dataType: "String"
	}]);

	QUnit.module("User personalization detection", {
		before: async function() {
			sinon.stub(TableDelegate, "addItem").callsFake(function(oTable, sProperty) {
				oTable._oAddItemDeferred = new Deferred();

				return TableDelegate.addItem.wrappedMethod.apply(this, arguments).then(function(oColumn) {
					const fnResolve = oTable._oAddItemDeferred.resolve;
					oTable._oAddItemDeferred.resolve = function() {
						fnResolve(oColumn);
					};
					return oTable._oAddItemDeferred.promise;
				});
			});

			const mCreatedApp = await createAppEnvironment(sTableView, "Table");
			this.oUiComponentContainer = mCreatedApp.container;
			this.oTable = mCreatedApp.view.byId('myTable');
			await this.oTable.initialized();
		},
		beforeEach: async function() {
			this.oUiComponentContainer.placeAt("qunit-fixture");
			await nextUIUpdate();
		},
		afterEach: function() {
			return this.oTable.getEngine().reset(this.oTable).catch(function() {
				// swallow the error that is thrown when resetting wihout p13n panel being open
			});
		},
		after: function() {
			TableDelegate.addItem.restore();
			this.oUiComponentContainer.destroy();
		}
	});

	QUnit.test("isUserPersonalizationActive", function(assert) {
		assert.notOk(PersonalizationUtils.isUserPersonalizationActive(this.oTable), "Not active");
	});

	QUnit.test("isUserPersonalizationActive - Personalization dialog without change", function(assert) {
		const oTable = this.oTable;

		PersonalizationUtils.openSettingsDialog(oTable);

		return TableQUnitUtils.waitForP13nPopup(oTable).then(function() {
			assert.ok(PersonalizationUtils.isUserPersonalizationActive(oTable), "Active if dialog is open");
			return TableQUnitUtils.closeP13nPopup(oTable);
		}).then(function() {
			assert.ok(PersonalizationUtils.isUserPersonalizationActive(oTable), "No longer active after dialog is closed");
		});
	});

	QUnit.test("isUserPersonalizationActive - Personalization dialog with change", function(assert) {
		const oTable = this.oTable;

		PersonalizationUtils.openSettingsDialog(oTable);

		return TableQUnitUtils.waitForP13nPopup(oTable).then(function() {
			assert.ok(PersonalizationUtils.isUserPersonalizationActive(oTable), "Active if dialog is open");
			oTable.getEngine().createChanges({
				control: oTable,
				key: "Column",
				state: [
					{name: "colB"}
				]
			});
			return TableQUnitUtils.closeP13nPopup(oTable);
		}).then(function() {
			assert.ok(PersonalizationUtils.isUserPersonalizationActive(oTable), "Still active after dialog is closed and change is being applied");
			oTable._oAddItemDeferred.resolve();
			return oTable.getEngine().waitForChanges(oTable);
		}).then(function() {
			assert.notOk(PersonalizationUtils.isUserPersonalizationActive(oTable), "No longer active after changes were applied");
		});
	});

	QUnit.test("isUserPersonalizationActive - Column menu without change", function(assert) {
		const oTable = this.oTable;

		return TableQUnitUtils.openColumnMenu(oTable, 0).then(function() {
			assert.ok(PersonalizationUtils.isUserPersonalizationActive(oTable), "Active if menu is open");
			return TableQUnitUtils.closeColumnMenu(oTable);
		}).then(function() {
			assert.ok(PersonalizationUtils.isUserPersonalizationActive(oTable), "No longer active after dialog is closed");
		});
	});

	QUnit.test("isUserPersonalizationActive - Column menu with change", function(assert) {
		const oTable = this.oTable;

		return TableQUnitUtils.openColumnMenu(oTable, 0).then(function() {
			assert.ok(PersonalizationUtils.isUserPersonalizationActive(oTable), "Active if dialog is open");
			oTable.getEngine().createChanges({
				control: oTable,
				key: "Column",
				state: [
					{name: "colB"}
				]
			});
			return TableQUnitUtils.closeColumnMenu(oTable);
		}).then(function() {
			assert.ok(PersonalizationUtils.isUserPersonalizationActive(oTable), "Still active after dialog is closed and change is being applied");
			oTable._oAddItemDeferred.resolve();
			return oTable.getEngine().waitForChanges(oTable);
		}).then(function() {
			assert.notOk(PersonalizationUtils.isUserPersonalizationActive(oTable), "No longer active after changes were applied");
		});
	});

	QUnit.module("Reset changes", {
		before: async function() {
			sinon.stub(TableDelegate, "getSupportedFeatures").callsFake(function() {
				const mSupportedFeatures = TableDelegate.getSupportedFeatures.wrappedMethod.apply(this, arguments);
				mSupportedFeatures.p13nModes = ["Column", "Sort", "Filter", "Group", "Aggregate"];
				return mSupportedFeatures;
			});

			const mCreatedApp = await createAppEnvironment(sTableView, "Table");
			this.oUiComponentContainer = mCreatedApp.container;
			this.oTable = mCreatedApp.view.byId('myTable');
			await this.oTable.initialized();
		},
		beforeEach: async function() {
			await StateUtil.applyExternalState(this.oTable, {
				items: [
					{name: "colB"}
				],
				filter: {
					colA: [{
						operator: "EQ",
						values: ["something"]
					}]
				},
				sorters: [{
					name: "colA",
					descending: false
				}],
				groupLevels: [{
					name: "colA"
				}],
				aggregations: {
					colA: {}
				},
				supplementaryConfig: {
					aggregations: {
						columns: {
							colA: {
								width: "87px"
							}
						}
					}
				}
			});

			this.oUiComponentContainer.placeAt("qunit-fixture");
			await nextUIUpdate();
		},
		afterEach: function() {
			return this.oTable.getEngine().reset(this.oTable).catch(function() {
				// swallow the error that is thrown when resetting wihout p13n panel being open
			});
		},
		after: function() {
			TableDelegate.getSupportedFeatures.restore();
			this.oUiComponentContainer.destroy();
		}
	});

	QUnit.test("Settings dialog with all p13n options enabled", async function(assert) {
		PersonalizationUtils.openSettingsDialog(this.oTable);
		(await TableQUnitUtils.waitForP13nPopup(this.oTable)).getReset()();
		await TableQUnitUtils.closeP13nPopup(this.oTable);
		await this.oTable.getEngine().waitForChanges(this.oTable);

		assert.deepEqual(this.oTable.getCurrentState(), {
			filter: {
				colA: []
			},
			items: [
				{name: "colA"}
			],
			sorters: [],
			groupLevels: [],
			aggregations: {},
			xConfig: {
			  aggregations: {}
			}
		}, "Full reset");
	});

	QUnit.test("Settings dialog with only p13n option 'Sort' enabled", async function(assert) {
		const aOriginalP13nModes = this.oTable.getP13nMode();

		this.oTable.setP13nMode(["Sort"]);
		this.oTable.setEnableColumnResize(false);
		PersonalizationUtils.openSettingsDialog(this.oTable);
		(await TableQUnitUtils.waitForP13nPopup(this.oTable)).getReset()();
		await TableQUnitUtils.closeP13nPopup(this.oTable);
		await this.oTable.getEngine().waitForChanges(this.oTable);

		this.oTable.setP13nMode(aOriginalP13nModes);
		this.oTable.setEnableColumnResize(true);
		assert.deepEqual(this.oTable.getCurrentState(), {
			filter: {
				colA: [{
					operator: "EQ",
					values: ["something"]
				}]
			},
			items: [
				{name: "colA"},
				{name: "colB"}
			],
			sorters: [],
			groupLevels: [
				{name: "colA"}
			],
			aggregations: {
				colA: {}
			},
			xConfig: {
				aggregations: {
					columns: {
						colA: {
							width: "87px"
						}
					}
				}
			}
		}, "Reset sorters");
	});

	QUnit.test("Filter dialog", async function(assert) {
		PersonalizationUtils.openFilterDialog(this.oTable);
		(await TableQUnitUtils.waitForP13nPopup(this.oTable)).getReset()();
		await TableQUnitUtils.closeP13nPopup(this.oTable);
		await this.oTable.getEngine().waitForChanges(this.oTable);

		assert.deepEqual(this.oTable.getCurrentState(), {
			filter: {
				colA: []
			},
			items: [
				{name: "colA"},
				{name: "colB"}
			],
			sorters: [{
				descending: false,
				name: "colA"
			}],
			groupLevels: [
				{name: "colA"}
			],
			aggregations: {
				colA: {}
			},
			xConfig: {
				aggregations: {
					columns: {
						colA: {
							width: "87px"
						}
					}
				}
			}
		}, "Reset filter");
	});
});