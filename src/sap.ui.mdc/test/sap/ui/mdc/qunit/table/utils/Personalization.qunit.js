/* global QUnit, sinon */
sap.ui.define([
	"../QUnitUtils",
	"../../../delegates/TableDelegate",
	"../../util/createAppEnvironment",
	"sap/ui/mdc/table/utils/Personalization",
	"sap/ui/mdc/Table",
	"sap/ui/mdc/enums/TableP13nMode",
	"sap/ui/mdc/enums/ProcessingStrategy",
	// Pre-populates the require cache so 'sap.ui.fl' can synchronously register the Table change handlers; otherwise the
	// async registration races with 'Engine#createChanges' and changes are silently dropped, making the tests unstable.
	"sap/ui/mdc/flexibility/Table.flexibility",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/base/util/Deferred"
], function(
	TableQUnitUtils,
	TableDelegate,
	createAppEnvironment,
	PersonalizationUtils,
	Table,
	TableP13nMode,
	ProcessingStrategy,
	TableFlexHandler,
	nextUIUpdate,
	Deferred
) {
	"use strict";

	const sTableView =
	`<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:m="sap.m" xmlns="sap.ui.mdc" xmlns:mdc="sap.ui.mdc" xmlns:mdcTable="sap.ui.mdc.table">
		<Table id="myTable"
			p13nMode="Column,Sort,Filter,Group,Aggregate"
			propertyKeys="inactive,colA,colB"
			delegate='${JSON.stringify({
				name: "test-resources/sap/ui/mdc/delegates/TableDelegate",
				payload: {
					collectionPath: "/testPath",
					propertyInfo: [{
						key: "inactive",
						label: "Inactive",
						dataType: "String",
						isActive: false
					}, {
						key: "colA",
						label: "Column A",
						path: "a",
						dataType: "String",
						groupable: true
					}, {
						key: "colB",
						label: "Column B",
						path: "b",
						dataType: "String",
						groupable: true
					}]
				}
			})}'>
			<mdc:type>
				<mdcTable:GridTableType enableColumnFreeze="true"/>
			</mdc:type>
		</Table>
	</mvc:View>`;

	const sTableAggregationModeView =
	`<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:m="sap.m" xmlns="sap.ui.mdc" xmlns:mdcTable="sap.ui.mdc.table">
		<Table id="myTable"
			p13nMode="Column,Sort,Filter,Group,Aggregate"
			delegate='${JSON.stringify({
				name: "test-resources/sap/ui/mdc/delegates/TableDelegate",
				payload: {
					collectionPath: "/testPath",
					propertyInfo: [{
						key: "colA",
						label: "Column A",
						path: "a",
						dataType: "String"
					}, {
						key: "colB",
						label: "Column B",
						path: "b",
						dataType: "String"
					}]
				}
			})}'>
			<columns>
				<mdcTable:Column id="myTable-columnA" header="Column A" propertyKey="colA">
					<m:Text />
				</mdcTable:Column>
			</columns>
		</Table>
	</mvc:View>`;

	QUnit.module("Methods to create changes", {
		before: async function() {
			const mCreatedApp = await createAppEnvironment(sTableView, "Table");

			this.oUiComponentContainer = mCreatedApp.container;
			this.oTable = mCreatedApp.view.byId("myTable");
			this.oEngine = this.oTable.getEngine();

			sinon.stub(TableDelegate, "getSupportedFeatures").callsFake(function() {
				const mSupportedFeatures = TableDelegate.getSupportedFeatures.wrappedMethod.apply(this, arguments);
				mSupportedFeatures.p13nModes = Object.values(TableP13nMode);
				return mSupportedFeatures;
			});

			await this.oTable.initialized();
		},
		beforeEach: async function() {
			this.spy(this.oEngine, "createChanges");
			this.oUiComponentContainer.placeAt("qunit-fixture");
			await nextUIUpdate();
		},
		afterEach: function() {
			this.oEngine.createChanges.restore();
			return this.oEngine.reset(this.oTable);
		},
		after: function() {
			TableDelegate.getSupportedFeatures.restore();
			this.oUiComponentContainer.destroy();
		}
	});

	QUnit.test("createClearGroupsChange", async function(assert) {
		this.oTable.setGroupConditions({
			groupLevels: [
				{key: "colA"},
				{key: "colB"}
			]
		});

		PersonalizationUtils.createClearGroupsChange(this.oTable);
		assert.equal(this.oEngine.createChanges.callCount, 1, "Engine#createChanges call");
		sinon.assert.calledWithExactly(this.oEngine.createChanges, {
			control: this.oTable,
			key: "Group",
			state: [],
			applyAbsolute: ProcessingStrategy.FullReplace
		});

		await this.oEngine.waitForChanges(this.oTable);
		assert.deepEqual(this.oTable.getGroupConditions(), {
			groupLevels: []
		}, "Group conditions");
	});

	QUnit.test("createFixedColumnCountChange", async function(assert) {
		PersonalizationUtils.createFixedColumnCountChange(this.oTable, {fixedColumnCount: 2});
		assert.equal(this.oEngine.createChanges.callCount, 1, "Engine#createChanges call");
		sinon.assert.calledWithExactly(this.oEngine.createChanges, {
			control: this.oTable,
			key: "ColumnFreeze",
			state: [{
				key: "GridTable",
				/**
				 * @deprecated As of version 1.124.0
				 */
				name: "GridTable",
				fixedColumnCount: 2
			}],
			applyAbsolute: true
		});

		await this.oEngine.waitForChanges(this.oTable);
		assert.deepEqual(this.oTable.getCurrentState().xConfig, {
			"aggregations": {
				"type": {
					"GridTable": {
						"fixedColumnCount": 2
					}
				}
			}
		}, "Current state is correct");
	});

	QUnit.test("createColumnReorderChange", function(assert) {
		const oColumnB = this.oTable.getColumns()[1];

		PersonalizationUtils.createColumnReorderChange(this.oTable, {column: oColumnB, index: 0});

		assert.equal(this.oEngine.createChanges.callCount, 1, "Engine#createChanges call");
		sinon.assert.calledWithExactly(this.oEngine.createChanges, {
			control: this.oTable,
			key: "Column",
			state: [{
				key: "colB",
				/**
				 * @deprecated As of version 1.124.0
				 */
				name: "colB",
				position: 1
			}]
		});
	});

	QUnit.test("createColumnReorderChange - aggregation mode", async function(assert) {
		const mCreatedApp = await createAppEnvironment(sTableAggregationModeView, "TableAggregationMode");
		const oContainer = mCreatedApp.container;
		const oTable = mCreatedApp.view.byId("myTable");
		const oColumnA = oTable.getColumns()[0];

		await oTable.initialized();

		PersonalizationUtils.createColumnReorderChange(oTable, {column: oColumnA, index: 1});

		assert.equal(this.oEngine.createChanges.callCount, 1, "Engine#createChanges call");
		sinon.assert.calledWithExactly(this.oEngine.createChanges, {
			control: oTable,
			key: "Column",
			state: [{
				key: "colA",
				/**
				 * @deprecated As of version 1.124.0
				 */
				name: "colA",
				position: 1
			}]
		});

		oContainer.destroy();
	});

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

			const mCreatedApp = await createAppEnvironment(sTableAggregationModeView, "Table");
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
					{key: "colB"}
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
					{key: "colB"}
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

	QUnit.test("openSettingsDialog", async function(assert) {
		const oTable = this.oTable;
		const oInbuiltFilterVisibleFieldsSpy = sinon.spy(this.oTable.getInbuiltFilter(), "setVisibleFields");

		PersonalizationUtils.openSettingsDialog(oTable);
		assert.ok(oInbuiltFilterVisibleFieldsSpy.calledWith(null), "setVisibleFields is called with null");
		await TableQUnitUtils.waitForP13nPopup(oTable);
		await TableQUnitUtils.closeP13nPopup(oTable);
		PersonalizationUtils.openSettingsDialog(oTable, oTable.getColumns()[0]);
		assert.ok(oInbuiltFilterVisibleFieldsSpy.calledWith(["colA"]),
			"setVisibleFields is called with an array of the column's filterable properties");
		await TableQUnitUtils.waitForP13nPopup(oTable);
		await TableQUnitUtils.closeP13nPopup(oTable);
		oInbuiltFilterVisibleFieldsSpy.restore();
	});

	QUnit.test("openSettingsDialog: delegate validateP13nState=false keeps the dialog open on OK", async function(assert) {
		const oTable = this.oTable;
		const oDelegate = oTable.getControlDelegate();
		let pValidation;
		const oStub = sinon.stub(oDelegate, "validateP13nState").callsFake(function() {
			pValidation = Promise.resolve(false);
			return pValidation;
		});

		PersonalizationUtils.openSettingsDialog(oTable);
		const oPopup = await TableQUnitUtils.waitForP13nPopup(oTable);

		oPopup._oPopup.getButtons()[0].firePress();
		await oTable.awaitControlDelegate();
		await pValidation;
		await Promise.resolve();

		assert.strictEqual(oStub.firstCall.args[0], oTable, "Hook called with the table");
		assert.ok(oStub.firstCall.args[1], "Hook called with the pending state");
		assert.ok(oPopup._bIsOpen, "Dialog stays open when validation fails");

		oStub.restore();
		await TableQUnitUtils.closeP13nPopup(oTable);
	});

	QUnit.test("openSettingsDialog: delegate validateP13nState rejection closes the dialog on OK", async function(assert) {
		const oTable = this.oTable;
		const oStub = sinon.stub(oTable.getControlDelegate(), "validateP13nState").rejects(new Error("failed"));

		PersonalizationUtils.openSettingsDialog(oTable);
		const oPopup = await TableQUnitUtils.waitForP13nPopup(oTable);

		const pClosed = new Promise((resolve) => {
			oPopup._oPopup.attachEventOnce("afterClose", resolve);
		});
		oPopup._oPopup.getButtons()[0].firePress();
		await pClosed;

		assert.notOk(oPopup._bIsOpen, "Dialog closes despite rejection");

		oStub.restore();
	});

	QUnit.module("Reset changes", {
		before: function() {
			sinon.stub(TableDelegate, "getSupportedFeatures").callsFake(function() {
				const mSupportedFeatures = TableDelegate.getSupportedFeatures.wrappedMethod.apply(this, arguments);
				mSupportedFeatures.p13nModes = ["Column", "Sort", "Filter", "Group", "Aggregate"];
				return mSupportedFeatures;
			});
		},
		beforeEach: async function() {
			const mCreatedApp = await createAppEnvironment(sTableAggregationModeView, "Table");
			this.oUiComponentContainer = mCreatedApp.container;
			this.oTable = mCreatedApp.view.byId('myTable');
			this.oResetSpy = sinon.spy(this.oTable.getEngine(), "reset");
			this.oUiComponentContainer.placeAt("qunit-fixture");
			await this.oTable.initialized();
			await nextUIUpdate();
		},
		afterEach: function() {
			this.oResetSpy.restore();
			this.oUiComponentContainer.destroy();
		},
		after: function() {
			TableDelegate.getSupportedFeatures.restore();
		}
	});

	QUnit.test("Settings dialog with all p13n options enabled", async function(assert) {
		PersonalizationUtils.openSettingsDialog(this.oTable);
		(await TableQUnitUtils.waitForP13nPopup(this.oTable)).getReset()();
		await TableQUnitUtils.closeP13nPopup(this.oTable);

		sinon.assert.alwaysCalledWithExactly(this.oResetSpy, this.oTable);

	});

	QUnit.test("Settings dialog with only p13n option 'Sort' enabled", async function(assert) {
		this.oTable.setP13nMode(["Sort"]);
		this.oTable.setEnableColumnResize(false);
		PersonalizationUtils.openSettingsDialog(this.oTable);
		(await TableQUnitUtils.waitForP13nPopup(this.oTable)).getReset()();
		await TableQUnitUtils.closeP13nPopup(this.oTable);

		sinon.assert.alwaysCalledWithExactly(this.oResetSpy, this.oTable);
	});

	QUnit.test("Filter dialog", async function(assert) {
		PersonalizationUtils.openFilterDialog(this.oTable);
		(await TableQUnitUtils.waitForP13nPopup(this.oTable)).getReset()();
		await TableQUnitUtils.closeP13nPopup(this.oTable);

		sinon.assert.alwaysCalledWithExactly(this.oResetSpy, this.oTable, ["Filter"]);
	});
});