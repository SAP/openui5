/* global QUnit, sinon */
sap.ui.define([
	"test-resources/sap/ui/mdc/qunit/util/createAppEnvironment",
	"sap/ui/mdc/flexibility/ColumnFlex",
	"sap/ui/mdc/flexibility/FilterItemFlex",
	"sap/ui/fl/write/api/ChangesWriteAPI",
	"sap/ui/core/util/reflection/JsControlTreeModifier",
	"sap/ui/core/util/reflection/XmlTreeModifier",
	"sap/ui/mdc/TableDelegate",
	"sap/ui/mdc/FilterBarDelegate",
	"sap/ui/mdc/p13n/StateUtil",
	"sap/ui/fl/changeHandler/Base",
	"sap/ui/rta/enablement/elementActionTest",
	"sap/ui/mdc/table/Column",
	"sap/ui/mdc/FilterField"
], function (
	createAppEnvironment,
	ColumnFlex,
	FilterItemFlex,
	ChangesWriteAPI,
	JsControlTreeModifier,
	XMLTreeModifier,
	TableDelegate,
	FilterBarDelegate,
	StateUtil,
	FLChangeHandlerBase,
	elementActionTest,
	Column,
	FilterField
) {
	"use strict";

	/*
	 * PropertyInfo layout used in the XML views:
	 *   staticProp1        - static property (no isActive field)
	 *   staticProp2        - static property
	 *   dynamicActive      - dynamic property, isActive: true  → materialized in aggregation
	 *   dynamicInactive    - dynamic property, isActive: false → in propertyKeys but not in aggregation
	 *   newProp            - static property, not in initial propertyKeys
	 *   dynamicNotInShadow - dynamic property, isActive: false, not in initial propertyKeys
	 *
	 * Initial propertyKeys:
	 *   ["dynamicInactive", "staticProp1", "staticProp2", "dynamicActive"]
	 *   (4 entries — dynamicInactive is tracked but has no item because isActive: false)
	 *
	 * Initial aggregation after sync:
	 *   staticProp1, staticProp2, dynamicActive  (3 items — only active/static)
	 *
	 * No aggregation items are defined in the XML view — items are managed reactively.
	 */

	const sSelectorId = "myDynPropView--myControl";

	function addChange(sChangeType, sPropertyKey, iIndex) {
		return {
			changeType: sChangeType,
			selector: { id: sSelectorId },
			content: { key: sPropertyKey, index: iIndex }
		};
	}

	function removeChange(sChangeType, sPropertyKey) {
		return {
			changeType: sChangeType,
			selector: { id: sSelectorId },
			content: { key: sPropertyKey }
		};
	}

	function moveChange(sChangeType, sPropertyKey, iIndex) {
		return {
			changeType: sChangeType,
			selector: { id: sSelectorId },
			content: { key: sPropertyKey, index: iIndex }
		};
	}

	TableDelegate.fetchProperties = function () {
		return Promise.resolve([
			{ key: "staticProp1", label: "Static 1", dataType: "String" },
			{ key: "staticProp2", label: "Static 2", dataType: "String" },
			{ key: "dynamicActive", label: "Dynamic Active", dataType: "String", isActive: true, groupable: true },
			{ key: "dynamicInactive", label: "Dynamic Inactive", dataType: "String", isActive: false, groupable: true },
			{ key: "newProp", label: "New Prop", dataType: "String" },
			{ key: "dynamicNotInShadow", label: "Dynamic Not In Shadow", dataType: "String", isActive: false }
		]);
	};

	TableDelegate.addItem = function (oControl, sPropertyKey) {
		return Promise.resolve(new Column({
			id: oControl.getId() + "--" + sPropertyKey,
			propertyKey: sPropertyKey,
			header: sPropertyKey
		}));
	};

	TableDelegate.getSupportedFeatures = function () {
		return { p13nModes: ["Column", "Sort", "Filter", "Group", "Aggregate"] };
	};

	FilterBarDelegate.fetchProperties = function () {
		return Promise.resolve([
			{ key: "staticProp1", label: "Static 1", dataType: "String" },
			{ key: "staticProp2", label: "Static 2", dataType: "String" },
			{ key: "dynamicActive", label: "Dynamic Active", dataType: "String", isActive: true },
			{ key: "dynamicInactive", label: "Dynamic Inactive", dataType: "String", isActive: false },
			{ key: "newProp", label: "New Prop", dataType: "String" },
			{ key: "dynamicNotInShadow", label: "Dynamic Not In Shadow", dataType: "String", isActive: false }
		]);
	};

	FilterBarDelegate.addItem = function (oControl, sPropertyKey) {
		return Promise.resolve(new FilterField({
			id: oControl.getId() + "--" + sPropertyKey,
			propertyKey: sPropertyKey,
			label: sPropertyKey
		}));
	};

	const aTestConfigurations = [{
		name: "Table",
		view: `
			<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:mdc="sap.ui.mdc" xmlns:mdcTable="sap.ui.mdc.table">
				<mdc:Table id="myControl"
					delegate="\{name: 'sap/ui/mdc/TableDelegate', payload: \{\}\}"
					p13nMode="Column,Filter,Sort,Group,Aggregate"
					propertyInfo='[
					\\{"key":"staticProp1","label":"Static 1","dataType":"String"\\},
					\\{"key":"staticProp2","label":"Static 2","dataType":"String"\\},
					\\{"key":"dynamicActive","label":"Dynamic Active","dataType":"String","isActive":true,"groupable":true\\},
					\\{"key":"dynamicInactive","label":"Dynamic Inactive","dataType":"String","isActive":false,"groupable":true\\},
					\\{"key":"dynamicNotInShadow","label":"Dynamic Not In Shadow","dataType":"String","isActive":false\\}
					]'
					propertyKeys="dynamicInactive,staticProp1,staticProp2,dynamicActive">
				</mdc:Table>
			</mvc:View>`,
		flex: ColumnFlex,
		addItemChangeType: "addColumn",
		removeItemChangeType: "removeColumn",
		moveItemChangeType: "moveColumn",
		getItems: (oControl) => oControl.getColumns(),
		aggregationName: "columns",
		initialized: (oControl) => oControl._fullyInitialized()
	}, {
		name: "FilterBar",
		view: `
			<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:mdc="sap.ui.mdc">
				<mdc:FilterBar id="myControl"
					delegate="\{name: 'sap/ui/mdc/FilterBarDelegate', payload: \{\}\}"
					p13nMode="Item,Value"
					propertyInfo='[
					\\{"key":"staticProp1","label":"Static 1","dataType":"String"\\},
					\\{"key":"staticProp2","label":"Static 2","dataType":"String"\\},
					\\{"key":"dynamicActive","label":"Dynamic Active","dataType":"String","isActive":true\\},
					\\{"key":"dynamicInactive","label":"Dynamic Inactive","dataType":"String","isActive":false\\},
					\\{"key":"dynamicNotInShadow","label":"Dynamic Not In Shadow","dataType":"String","isActive":false\\}
					]'
					propertyKeys="dynamicInactive,staticProp1,staticProp2,dynamicActive">
				</mdc:FilterBar>
			</mvc:View>`,
		flex: FilterItemFlex,
		addItemChangeType: "addFilter",
		removeItemChangeType: "removeFilter",
		moveItemChangeType: "moveFilter",
		getItems: (oControl) => oControl.getFilterItems(),
		aggregationName: "filterItems",
		initialized: (oControl) => oControl.initialized()
	}];

	function defineTestModules(oConfig) {

		function getItemKeys(oControl) {
			return oConfig.getItems(oControl).map(function (oItem) {
				return oItem.getPropertyKey();
			});
		}

		const oAddInactiveChange = addChange(oConfig.addItemChangeType, "dynamicInactive", 0);

		QUnit.module(oConfig.name + " - JS runtime path", {
			beforeEach: async function () {
				this.oMarkSpy = sinon.spy(FLChangeHandlerBase, "markAsNotApplicable");
				const mCreatedApp = await createAppEnvironment(oConfig.view, "DynProp");
				this.oView = mCreatedApp.view;
				this.oUiComponent = mCreatedApp.comp;
				this.oUiComponentContainer = mCreatedApp.container;
				this.oUiComponentContainer.placeAt("qunit-fixture");
				this.oControl = this.oView.byId("myControl");
				await oConfig.initialized(this.oControl);
				this.aInitialItemKeys = getItemKeys(this.oControl);
				this.oSyncStub = sinon.stub(this.oControl, "syncItemsFromPropertyKeys").resolves();
			},
			afterEach: function (assert) {
				assert.deepEqual(getItemKeys(this.oControl), this.aInitialItemKeys, "Aggregation unchanged by flex change handler");
				this.oSyncStub.restore();
				this.oMarkSpy.restore();
				this.oUiComponentContainer.destroy();
			}
		});

		QUnit.test("Initial state - propertyKeys includes inactive, aggregation excludes inactive", function (assert) {
			assert.deepEqual(
				this.oControl.getPropertyKeys(),
				["dynamicInactive", "staticProp1", "staticProp2", "dynamicActive"],
				"propertyKeys contains all 4 entries"
			);
			assert.strictEqual(oConfig.getItems(this.oControl).length, 3, "Only 3 items are materialized");
			assert.deepEqual(getItemKeys(this.oControl), ["staticProp1", "staticProp2", "dynamicActive"], "Materialized items are correct");
		});

		QUnit.test("Apply add for inactive property already in propertyKeys", async function (assert) {
			const oChangeHandler = oConfig.flex[oConfig.addItemChangeType].changeHandler;

			const oChange = await ChangesWriteAPI.create({
				changeSpecificData: oAddInactiveChange,
				selector: this.oControl
			});
			await oChangeHandler.applyChange(oChange, this.oControl, {
				modifier: JsControlTreeModifier,
				appComponent: this.oUiComponent,
				view: this.oView
			}).catch(function (oError) {
				assert.equal(oError.message, "The specified change is already existing - change appliance ignored", "applyChange rejected with not-applicable message");
			});
			assert.deepEqual(
				this.oControl.getPropertyKeys(),
				["dynamicInactive", "staticProp1", "staticProp2", "dynamicActive"],
				"propertyKeys unchanged - no duplicate added"
			);
			assert.strictEqual(this.oMarkSpy.callCount, 1, "markAsNotApplicable was called");
		});

		QUnit.test("Apply add for active property at propertyKeys index 0", async function (assert) {
			this.oControl.setPropertyKeys(["dynamicInactive", "staticProp1", "dynamicActive"]);

			const oChangeHandler = oConfig.flex[oConfig.addItemChangeType].changeHandler;

			const oChange = await ChangesWriteAPI.create({
				changeSpecificData: addChange(oConfig.addItemChangeType, "staticProp2", 0),
				selector: this.oControl
			});
			await oChangeHandler.applyChange(oChange, this.oControl, {
				modifier: JsControlTreeModifier,
				appComponent: this.oUiComponent,
				view: this.oView
			});
			assert.deepEqual(
				this.oControl.getPropertyKeys(),
				["staticProp2", "dynamicInactive", "staticProp1", "dynamicActive"],
				"staticProp2 added at propertyKeys index 0"
			);
			assert.strictEqual(this.oMarkSpy.callCount, 0, "markAsNotApplicable was not called");
		});

		QUnit.test("Apply add for active property at last propertyKeys index", async function (assert) {
			this.oControl.setPropertyKeys(["dynamicInactive", "staticProp1", "dynamicActive"]);

			const oChangeHandler = oConfig.flex[oConfig.addItemChangeType].changeHandler;

			const oChange = await ChangesWriteAPI.create({
				changeSpecificData: addChange(oConfig.addItemChangeType, "staticProp2", 3),
				selector: this.oControl
			});
			await oChangeHandler.applyChange(oChange, this.oControl, {
				modifier: JsControlTreeModifier,
				appComponent: this.oUiComponent,
				view: this.oView
			});
			assert.deepEqual(
				this.oControl.getPropertyKeys(),
				["dynamicInactive", "staticProp1", "dynamicActive", "staticProp2"],
				"staticProp2 added at end of propertyKeys"
			);
			assert.strictEqual(this.oMarkSpy.callCount, 0, "markAsNotApplicable was not called");
		});

		QUnit.test("Apply remove for inactive property not in propertyKeys", async function (assert) {
			this.oControl.setPropertyKeys(["staticProp1", "staticProp2", "dynamicActive"]);

			const oChangeHandler = oConfig.flex[oConfig.removeItemChangeType].changeHandler;

			const oChange = await ChangesWriteAPI.create({
				changeSpecificData: removeChange(oConfig.removeItemChangeType, "dynamicInactive"),
				selector: this.oControl
			});
			await oChangeHandler.applyChange(oChange, this.oControl, {
				modifier: JsControlTreeModifier,
				appComponent: this.oUiComponent,
				view: this.oView
			}).catch(function (oError) {
				assert.equal(oError.message, "The specified change is already existing - change appliance ignored", "applyChange rejected with not-applicable message");
			});
			assert.deepEqual(
				this.oControl.getPropertyKeys(),
				["staticProp1", "staticProp2", "dynamicActive"],
				"propertyKeys unchanged - dynamicInactive was not present"
			);
			assert.strictEqual(this.oMarkSpy.callCount, 1, "markAsNotApplicable was called");
		});

		QUnit.test("Apply move for inactive property not in propertyKeys", async function (assert) {
			this.oControl.setPropertyKeys(["staticProp1", "staticProp2", "dynamicActive"]);

			const oChangeHandler = oConfig.flex[oConfig.moveItemChangeType].changeHandler;

			const oChange = await ChangesWriteAPI.create({
				changeSpecificData: moveChange(oConfig.moveItemChangeType, "dynamicInactive", 2),
				selector: this.oControl
			});
			await oChangeHandler.applyChange(oChange, this.oControl, {
				modifier: JsControlTreeModifier,
				appComponent: this.oUiComponent,
				view: this.oView
			}).catch(function (oError) {
				assert.equal(oError.message, "The specified change is already existing - change appliance ignored", "applyChange rejected with not-applicable message");
			});
			assert.deepEqual(
				this.oControl.getPropertyKeys(),
				["staticProp1", "staticProp2", "dynamicActive"],
				"propertyKeys unchanged - dynamicInactive was not present"
			);
			assert.strictEqual(this.oMarkSpy.callCount, 1, "markAsNotApplicable was called");
		});

		QUnit.test("Apply move for active property to propertyKeys index 0", async function (assert) {
			const oChangeHandler = oConfig.flex[oConfig.moveItemChangeType].changeHandler;

			const oChange = await ChangesWriteAPI.create({
				changeSpecificData: moveChange(oConfig.moveItemChangeType, "staticProp2", 0),
				selector: this.oControl
			});
			await oChangeHandler.applyChange(oChange, this.oControl, {
				modifier: JsControlTreeModifier,
				appComponent: this.oUiComponent,
				view: this.oView
			});
			assert.deepEqual(
				this.oControl.getPropertyKeys(),
				["staticProp2", "dynamicInactive", "staticProp1", "dynamicActive"],
				"staticProp2 moved to propertyKeys index 0"
			);
			assert.strictEqual(this.oMarkSpy.callCount, 0, "markAsNotApplicable was not called");
		});

		QUnit.test("Apply move for active property to propertyKeys index 1 - after inactive", async function (assert) {
			const oChangeHandler = oConfig.flex[oConfig.moveItemChangeType].changeHandler;

			const oChange = await ChangesWriteAPI.create({
				changeSpecificData: moveChange(oConfig.moveItemChangeType, "dynamicActive", 1),
				selector: this.oControl
			});
			await oChangeHandler.applyChange(oChange, this.oControl, {
				modifier: JsControlTreeModifier,
				appComponent: this.oUiComponent,
				view: this.oView
			});
			assert.deepEqual(
				this.oControl.getPropertyKeys(),
				["dynamicInactive", "dynamicActive", "staticProp1", "staticProp2"],
				"dynamicActive moved to propertyKeys index 1"
			);
			assert.strictEqual(this.oMarkSpy.callCount, 0, "markAsNotApplicable was not called");
		});

		QUnit.test("Apply move for active property to last propertyKeys index", async function (assert) {
			const oChangeHandler = oConfig.flex[oConfig.moveItemChangeType].changeHandler;

			const oChange = await ChangesWriteAPI.create({
				changeSpecificData: moveChange(oConfig.moveItemChangeType, "staticProp1", 3),
				selector: this.oControl
			});
			await oChangeHandler.applyChange(oChange, this.oControl, {
				modifier: JsControlTreeModifier,
				appComponent: this.oUiComponent,
				view: this.oView
			});
			assert.deepEqual(
				this.oControl.getPropertyKeys(),
				["dynamicInactive", "staticProp2", "dynamicActive", "staticProp1"],
				"staticProp1 moved to propertyKeys index 3"
			);
			assert.strictEqual(this.oMarkSpy.callCount, 0, "markAsNotApplicable was not called");
		});

		QUnit.test("Apply add then move - cumulative index translations", async function (assert) {
			this.oControl.setPropertyKeys(["dynamicInactive", "staticProp1", "dynamicActive"]);

			const oAddHandler = oConfig.flex[oConfig.addItemChangeType].changeHandler;
			const oMoveHandler = oConfig.flex[oConfig.moveItemChangeType].changeHandler;

			const oAddChange = await ChangesWriteAPI.create({
				changeSpecificData: addChange(oConfig.addItemChangeType, "staticProp2", 3),
				selector: this.oControl
			});
			await oAddHandler.applyChange(oAddChange, this.oControl, {
				modifier: JsControlTreeModifier,
				appComponent: this.oUiComponent,
				view: this.oView
			});

			const oMoveChange = await ChangesWriteAPI.create({
				changeSpecificData: moveChange(oConfig.moveItemChangeType, "staticProp2", 1),
				selector: this.oControl
			});
			await oMoveHandler.applyChange(oMoveChange, this.oControl, {
				modifier: JsControlTreeModifier,
				appComponent: this.oUiComponent,
				view: this.oView
			});

			assert.deepEqual(
				this.oControl.getPropertyKeys(),
				["dynamicInactive", "staticProp2", "staticProp1", "dynamicActive"],
				"After add + move: staticProp2 at propertyKeys index 1"
			);
			assert.strictEqual(this.oMarkSpy.callCount, 0, "markAsNotApplicable was not called");
		});

		QUnit.test("Apply + revert add for inactive property", async function (assert) {
			this.oControl.setPropertyKeys(["staticProp1", "staticProp2", "dynamicActive"]);

			const oChangeHandler = oConfig.flex[oConfig.addItemChangeType].changeHandler;

			const oChange = await ChangesWriteAPI.create({
				changeSpecificData: oAddInactiveChange,
				selector: this.oControl
			});
			await oChangeHandler.applyChange(oChange, this.oControl, {
				modifier: JsControlTreeModifier,
				appComponent: this.oUiComponent,
				view: this.oView
			});
			assert.deepEqual(
				this.oControl.getPropertyKeys(),
				["dynamicInactive", "staticProp1", "staticProp2", "dynamicActive"],
				"After apply: dynamicInactive in propertyKeys"
			);

			await oChangeHandler.revertChange(oChange, this.oControl, {
				modifier: JsControlTreeModifier,
				appComponent: this.oUiComponent,
				view: this.oView
			});
			assert.deepEqual(
				this.oControl.getPropertyKeys(),
				["staticProp1", "staticProp2", "dynamicActive"],
				"After revert: dynamicInactive removed from propertyKeys"
			);
			assert.strictEqual(this.oMarkSpy.callCount, 0, "markAsNotApplicable was not called");
		});

		QUnit.test("Apply + revert add for active property", async function (assert) {
			this.oControl.setPropertyKeys(["dynamicInactive", "staticProp1", "dynamicActive"]);

			const oChangeHandler = oConfig.flex[oConfig.addItemChangeType].changeHandler;

			const oChange = await ChangesWriteAPI.create({
				changeSpecificData: addChange(oConfig.addItemChangeType, "staticProp2", 2),
				selector: this.oControl
			});
			await oChangeHandler.applyChange(oChange, this.oControl, {
				modifier: JsControlTreeModifier,
				appComponent: this.oUiComponent,
				view: this.oView
			});
			assert.deepEqual(
				this.oControl.getPropertyKeys(),
				["dynamicInactive", "staticProp1", "staticProp2", "dynamicActive"],
				"After apply: staticProp2 in propertyKeys at index 2"
			);

			await oChangeHandler.revertChange(oChange, this.oControl, {
				modifier: JsControlTreeModifier,
				appComponent: this.oUiComponent,
				view: this.oView
			});
			assert.deepEqual(
				this.oControl.getPropertyKeys(),
				["dynamicInactive", "staticProp1", "dynamicActive"],
				"After revert: staticProp2 removed from propertyKeys"
			);
			assert.strictEqual(this.oMarkSpy.callCount, 0, "markAsNotApplicable was not called");
		});

		QUnit.test("Apply + revert remove for inactive property", async function (assert) {
			const oChangeHandler = oConfig.flex[oConfig.removeItemChangeType].changeHandler;

			const oChange = await ChangesWriteAPI.create({
				changeSpecificData: removeChange(oConfig.removeItemChangeType, "dynamicInactive"),
				selector: this.oControl
			});
			await oChangeHandler.applyChange(oChange, this.oControl, {
				modifier: JsControlTreeModifier,
				appComponent: this.oUiComponent,
				view: this.oView
			});
			assert.deepEqual(
				this.oControl.getPropertyKeys(),
				["staticProp1", "staticProp2", "dynamicActive"],
				"After apply: dynamicInactive removed from propertyKeys"
			);

			await oChangeHandler.revertChange(oChange, this.oControl, {
				modifier: JsControlTreeModifier,
				appComponent: this.oUiComponent,
				view: this.oView
			});
			assert.deepEqual(
				this.oControl.getPropertyKeys(),
				["dynamicInactive", "staticProp1", "staticProp2", "dynamicActive"],
				"After revert: dynamicInactive restored to propertyKeys (at index 0)"
			);
			assert.strictEqual(this.oMarkSpy.callCount, 0, "markAsNotApplicable was not called");
		});

		QUnit.test("Apply + revert remove for active property", async function (assert) {
			const oChangeHandler = oConfig.flex[oConfig.removeItemChangeType].changeHandler;

			const oChange = await ChangesWriteAPI.create({
				changeSpecificData: removeChange(oConfig.removeItemChangeType, "staticProp2"),
				selector: this.oControl
			});
			await oChangeHandler.applyChange(oChange, this.oControl, {
				modifier: JsControlTreeModifier,
				appComponent: this.oUiComponent,
				view: this.oView
			});
			assert.deepEqual(
				this.oControl.getPropertyKeys(),
				["dynamicInactive", "staticProp1", "dynamicActive"],
				"After apply: staticProp2 removed from propertyKeys"
			);

			await oChangeHandler.revertChange(oChange, this.oControl, {
				modifier: JsControlTreeModifier,
				appComponent: this.oUiComponent,
				view: this.oView
			});
			assert.deepEqual(
				this.oControl.getPropertyKeys(),
				["dynamicInactive", "staticProp1", "staticProp2", "dynamicActive"],
				"After revert: staticProp2 restored to propertyKeys"
			);
			assert.strictEqual(this.oMarkSpy.callCount, 0, "markAsNotApplicable was not called");
		});

		QUnit.test("Apply + revert remove for active property - revert restores propertyKeys index", async function (assert) {
			const oChangeHandler = oConfig.flex[oConfig.removeItemChangeType].changeHandler;

			const oChange = await ChangesWriteAPI.create({
				changeSpecificData: removeChange(oConfig.removeItemChangeType, "staticProp1"),
				selector: this.oControl
			});
			await oChangeHandler.applyChange(oChange, this.oControl, {
				modifier: JsControlTreeModifier,
				appComponent: this.oUiComponent,
				view: this.oView
			});
			assert.deepEqual(
				this.oControl.getPropertyKeys(),
				["dynamicInactive", "staticProp2", "dynamicActive"],
				"After apply: staticProp1 removed from propertyKeys"
			);

			await oChangeHandler.revertChange(oChange, this.oControl, {
				modifier: JsControlTreeModifier,
				appComponent: this.oUiComponent,
				view: this.oView
			});
			assert.deepEqual(
				this.oControl.getPropertyKeys(),
				["dynamicInactive", "staticProp1", "staticProp2", "dynamicActive"],
				"After revert: staticProp1 restored to propertyKeys at original position"
			);
			assert.strictEqual(this.oMarkSpy.callCount, 0, "markAsNotApplicable was not called");
		});

		QUnit.test("Apply + revert move for inactive property", async function (assert) {
			const oChangeHandler = oConfig.flex[oConfig.moveItemChangeType].changeHandler;

			const oChange = await ChangesWriteAPI.create({
				changeSpecificData: moveChange(oConfig.moveItemChangeType, "dynamicInactive", 2),
				selector: this.oControl
			});
			await oChangeHandler.applyChange(oChange, this.oControl, {
				modifier: JsControlTreeModifier,
				appComponent: this.oUiComponent,
				view: this.oView
			});
			assert.deepEqual(
				this.oControl.getPropertyKeys(),
				["staticProp1", "staticProp2", "dynamicInactive", "dynamicActive"],
				"After apply: dynamicInactive moved to propertyKeys index 2"
			);

			await oChangeHandler.revertChange(oChange, this.oControl, {
				modifier: JsControlTreeModifier,
				appComponent: this.oUiComponent,
				view: this.oView
			});
			assert.deepEqual(
				this.oControl.getPropertyKeys(),
				["dynamicInactive", "staticProp1", "staticProp2", "dynamicActive"],
				"After revert: dynamicInactive at propertyKeys index 0 (matches original position)"
			);
			assert.strictEqual(this.oMarkSpy.callCount, 0, "markAsNotApplicable was not called");
		});

		QUnit.test("Apply + revert remove for inactive property at non-zero propertyKeys index (verifies revert index)", async function (assert) {
			this.oControl.setPropertyKeys(["staticProp1", "staticProp2", "dynamicInactive", "dynamicActive"]);

			const oChangeHandler = oConfig.flex[oConfig.removeItemChangeType].changeHandler;

			const oChange = await ChangesWriteAPI.create({
				changeSpecificData: removeChange(oConfig.removeItemChangeType, "dynamicInactive"),
				selector: this.oControl
			});
			await oChangeHandler.applyChange(oChange, this.oControl, {
				modifier: JsControlTreeModifier,
				appComponent: this.oUiComponent,
				view: this.oView
			});
			assert.deepEqual(
				this.oControl.getPropertyKeys(),
				["staticProp1", "staticProp2", "dynamicActive"],
				"After apply: dynamicInactive removed from propertyKeys"
			);

			assert.strictEqual(oChange.getRevertData().index, 2,
				"Revert data captured propertyKeys index 2 (the position before removal)");

			await oChangeHandler.revertChange(oChange, this.oControl, {
				modifier: JsControlTreeModifier,
				appComponent: this.oUiComponent,
				view: this.oView
			});
			assert.deepEqual(
				this.oControl.getPropertyKeys(),
				["staticProp1", "staticProp2", "dynamicInactive", "dynamicActive"],
				"After revert: dynamicInactive restored to propertyKeys index 2 (not 0)"
			);
			assert.strictEqual(this.oMarkSpy.callCount, 0, "markAsNotApplicable was not called");
		});

		QUnit.test("Apply + revert move for inactive property at non-zero propertyKeys index (verifies revert index)", async function (assert) {
			this.oControl.setPropertyKeys(["staticProp1", "staticProp2", "dynamicInactive", "dynamicActive"]);

			const oChangeHandler = oConfig.flex[oConfig.moveItemChangeType].changeHandler;

			const oChange = await ChangesWriteAPI.create({
				changeSpecificData: moveChange(oConfig.moveItemChangeType, "dynamicInactive", 0),
				selector: this.oControl
			});
			await oChangeHandler.applyChange(oChange, this.oControl, {
				modifier: JsControlTreeModifier,
				appComponent: this.oUiComponent,
				view: this.oView
			});
			assert.deepEqual(
				this.oControl.getPropertyKeys(),
				["dynamicInactive", "staticProp1", "staticProp2", "dynamicActive"],
				"After apply: dynamicInactive moved to propertyKeys index 0"
			);

			assert.strictEqual(oChange.getRevertData().index, 2,
				"Revert data captured old propertyKeys index 2 (the position before move)");

			await oChangeHandler.revertChange(oChange, this.oControl, {
				modifier: JsControlTreeModifier,
				appComponent: this.oUiComponent,
				view: this.oView
			});
			assert.deepEqual(
				this.oControl.getPropertyKeys(),
				["staticProp1", "staticProp2", "dynamicInactive", "dynamicActive"],
				"After revert: dynamicInactive back at propertyKeys index 2"
			);
			assert.strictEqual(this.oMarkSpy.callCount, 0, "markAsNotApplicable was not called");
		});

		QUnit.test("Apply + revert move for active property to middle propertyKeys index", async function (assert) {
			const oChangeHandler = oConfig.flex[oConfig.moveItemChangeType].changeHandler;

			const oChange = await ChangesWriteAPI.create({
				changeSpecificData: moveChange(oConfig.moveItemChangeType, "staticProp1", 2),
				selector: this.oControl
			});
			await oChangeHandler.applyChange(oChange, this.oControl, {
				modifier: JsControlTreeModifier,
				appComponent: this.oUiComponent,
				view: this.oView
			});
			assert.deepEqual(
				this.oControl.getPropertyKeys(),
				["dynamicInactive", "staticProp2", "staticProp1", "dynamicActive"],
				"After apply: staticProp1 moved to propertyKeys index 2"
			);

			await oChangeHandler.revertChange(oChange, this.oControl, {
				modifier: JsControlTreeModifier,
				appComponent: this.oUiComponent,
				view: this.oView
			});
			assert.deepEqual(
				this.oControl.getPropertyKeys(),
				["dynamicInactive", "staticProp1", "staticProp2", "dynamicActive"],
				"After revert: propertyKeys order restored"
			);
			assert.strictEqual(this.oMarkSpy.callCount, 0, "markAsNotApplicable was not called");
		});

		QUnit.test("Apply + revert move for active property to last propertyKeys index", async function (assert) {
			const oChangeHandler = oConfig.flex[oConfig.moveItemChangeType].changeHandler;

			const oChange = await ChangesWriteAPI.create({
				changeSpecificData: moveChange(oConfig.moveItemChangeType, "staticProp2", 3),
				selector: this.oControl
			});
			await oChangeHandler.applyChange(oChange, this.oControl, {
				modifier: JsControlTreeModifier,
				appComponent: this.oUiComponent,
				view: this.oView
			});
			assert.deepEqual(
				this.oControl.getPropertyKeys(),
				["dynamicInactive", "staticProp1", "dynamicActive", "staticProp2"],
				"After apply: staticProp2 at propertyKeys index 3"
			);

			await oChangeHandler.revertChange(oChange, this.oControl, {
				modifier: JsControlTreeModifier,
				appComponent: this.oUiComponent,
				view: this.oView
			});
			assert.deepEqual(
				this.oControl.getPropertyKeys(),
				["dynamicInactive", "staticProp1", "staticProp2", "dynamicActive"],
				"After revert: propertyKeys order restored"
			);
			assert.strictEqual(this.oMarkSpy.callCount, 0, "markAsNotApplicable was not called");
		});

		QUnit.module(oConfig.name + " - XML preprocessing path", {
			beforeEach: async function () {
				this.oMarkSpy = sinon.spy(FLChangeHandlerBase, "markAsNotApplicable");
				const mCreatedApp = await createAppEnvironment(oConfig.view, "DynProp");
				this.oView = mCreatedApp.view;
				this.oUiComponent = mCreatedApp.comp;
				this.oUiComponentContainer = mCreatedApp.container;
				this.oControl = this.oView.byId("myControl");
				this.oXMLControl = this.oView._xContent.children[0];
				this.oXMLView = this.oView._xContent;
				this.iInitialChildElementCount = this.oXMLControl.childElementCount;
			},
			afterEach: function (assert) {
				assert.strictEqual(this.oXMLControl.childElementCount, this.iInitialChildElementCount,
					"No aggregation child elements added to XML node");
				this.oMarkSpy.restore();
				this.oUiComponentContainer.destroy();
			}
		});

		QUnit.test("Apply add for inactive property already in propertyKeys", async function (assert) {
			const oChangeHandler = oConfig.flex[oConfig.addItemChangeType].changeHandler;

			const oChange = await ChangesWriteAPI.create({
				changeSpecificData: oAddInactiveChange,
				selector: this.oControl
			});
			await oChangeHandler.applyChange(oChange, this.oXMLControl, {
				modifier: XMLTreeModifier,
				appComponent: this.oUiComponent,
				view: this.oView
			}).catch(function (oError) {
				assert.equal(oError.message, "The specified change is already existing - change appliance ignored", "applyChange rejected with not-applicable message");
			});

			const aPropertyKeys = await XMLTreeModifier.getProperty(this.oXMLControl, "propertyKeys");
			assert.deepEqual(
				aPropertyKeys,
				["dynamicInactive", "staticProp1", "staticProp2", "dynamicActive"],
				"propertyKeys unchanged - no duplicate added"
			);
			assert.strictEqual(this.oMarkSpy.callCount, 1, "markAsNotApplicable was called");
		});

		QUnit.test("Apply add for active property at propertyKeys index 0", async function (assert) {
			const oChangeHandler = oConfig.flex[oConfig.addItemChangeType].changeHandler;

			this.oXMLControl.setAttribute("propertyKeys", "dynamicInactive,staticProp1,dynamicActive");

			const oChange = await ChangesWriteAPI.create({
				changeSpecificData: addChange(oConfig.addItemChangeType, "staticProp2", 0),
				selector: this.oControl
			});
			await oChangeHandler.applyChange(oChange, this.oXMLControl, {
				modifier: XMLTreeModifier,
				appComponent: this.oUiComponent,
				view: this.oXMLView
			});

			const aPropertyKeys = await XMLTreeModifier.getProperty(this.oXMLControl, "propertyKeys");
			assert.deepEqual(
				aPropertyKeys,
				["staticProp2", "dynamicInactive", "staticProp1", "dynamicActive"],
				"staticProp2 added at propertyKeys index 0"
			);
			assert.strictEqual(this.oMarkSpy.callCount, 0, "markAsNotApplicable was not called");
		});

		QUnit.test("Apply add for active property at last propertyKeys index", async function (assert) {
			const oChangeHandler = oConfig.flex[oConfig.addItemChangeType].changeHandler;

			this.oXMLControl.setAttribute("propertyKeys", "dynamicInactive,staticProp1,dynamicActive");

			const oChange = await ChangesWriteAPI.create({
				changeSpecificData: addChange(oConfig.addItemChangeType, "staticProp2", 3),
				selector: this.oControl
			});
			await oChangeHandler.applyChange(oChange, this.oXMLControl, {
				modifier: XMLTreeModifier,
				appComponent: this.oUiComponent,
				view: this.oXMLView
			});

			const aPropertyKeys = await XMLTreeModifier.getProperty(this.oXMLControl, "propertyKeys");
			assert.deepEqual(
				aPropertyKeys,
				["dynamicInactive", "staticProp1", "dynamicActive", "staticProp2"],
				"staticProp2 added at end of propertyKeys"
			);
			assert.strictEqual(this.oMarkSpy.callCount, 0, "markAsNotApplicable was not called");
		});

		QUnit.test("Apply remove for inactive property not in propertyKeys", async function (assert) {
			this.oXMLControl.setAttribute("propertyKeys", "staticProp1,staticProp2,dynamicActive");

			const oChangeHandler = oConfig.flex[oConfig.removeItemChangeType].changeHandler;

			const oChange = await ChangesWriteAPI.create({
				changeSpecificData: removeChange(oConfig.removeItemChangeType, "dynamicInactive"),
				selector: this.oControl
			});
			await oChangeHandler.applyChange(oChange, this.oXMLControl, {
				modifier: XMLTreeModifier,
				appComponent: this.oUiComponent,
				view: this.oView
			}).catch(function (oError) {
				assert.equal(oError.message, "The specified change is already existing - change appliance ignored", "applyChange rejected with not-applicable message");
			});

			const aPropertyKeys = await XMLTreeModifier.getProperty(this.oXMLControl, "propertyKeys");
			assert.deepEqual(
				aPropertyKeys,
				["staticProp1", "staticProp2", "dynamicActive"],
				"propertyKeys unchanged - dynamicInactive was not present"
			);
			assert.strictEqual(this.oMarkSpy.callCount, 1, "markAsNotApplicable was called");
		});

		QUnit.test("Apply move for inactive property not in propertyKeys", async function (assert) {
			this.oXMLControl.setAttribute("propertyKeys", "staticProp1,staticProp2,dynamicActive");

			const oChangeHandler = oConfig.flex[oConfig.moveItemChangeType].changeHandler;

			const oChange = await ChangesWriteAPI.create({
				changeSpecificData: moveChange(oConfig.moveItemChangeType, "dynamicInactive", 2),
				selector: this.oControl
			});
			await oChangeHandler.applyChange(oChange, this.oXMLControl, {
				modifier: XMLTreeModifier,
				appComponent: this.oUiComponent,
				view: this.oView
			}).catch(function (oError) {
				assert.equal(oError.message, "The specified change is already existing - change appliance ignored", "applyChange rejected with not-applicable message");
			});

			const aPropertyKeys = await XMLTreeModifier.getProperty(this.oXMLControl, "propertyKeys");
			assert.deepEqual(
				aPropertyKeys,
				["staticProp1", "staticProp2", "dynamicActive"],
				"propertyKeys unchanged - dynamicInactive was not present"
			);
			assert.strictEqual(this.oMarkSpy.callCount, 1, "markAsNotApplicable was called");
		});

		QUnit.test("Apply move for active property to propertyKeys index 0", async function (assert) {
			const oChangeHandler = oConfig.flex[oConfig.moveItemChangeType].changeHandler;

			const oChange = await ChangesWriteAPI.create({
				changeSpecificData: moveChange(oConfig.moveItemChangeType, "staticProp2", 0),
				selector: this.oControl
			});
			await oChangeHandler.applyChange(oChange, this.oXMLControl, {
				modifier: XMLTreeModifier,
				appComponent: this.oUiComponent,
				view: this.oView
			});

			const aPropertyKeys = await XMLTreeModifier.getProperty(this.oXMLControl, "propertyKeys");
			assert.deepEqual(
				aPropertyKeys,
				["staticProp2", "dynamicInactive", "staticProp1", "dynamicActive"],
				"staticProp2 moved to propertyKeys index 0"
			);
			assert.strictEqual(this.oMarkSpy.callCount, 0, "markAsNotApplicable was not called");
		});

		QUnit.test("Apply move for active property to propertyKeys index 1 - after inactive", async function (assert) {
			const oChangeHandler = oConfig.flex[oConfig.moveItemChangeType].changeHandler;

			const oChange = await ChangesWriteAPI.create({
				changeSpecificData: moveChange(oConfig.moveItemChangeType, "dynamicActive", 1),
				selector: this.oControl
			});
			await oChangeHandler.applyChange(oChange, this.oXMLControl, {
				modifier: XMLTreeModifier,
				appComponent: this.oUiComponent,
				view: this.oView
			});

			const aPropertyKeys = await XMLTreeModifier.getProperty(this.oXMLControl, "propertyKeys");
			assert.deepEqual(
				aPropertyKeys,
				["dynamicInactive", "dynamicActive", "staticProp1", "staticProp2"],
				"dynamicActive moved to propertyKeys index 1"
			);
			assert.strictEqual(this.oMarkSpy.callCount, 0, "markAsNotApplicable was not called");
		});

		QUnit.test("Apply move for active property to last propertyKeys index", async function (assert) {
			const oChangeHandler = oConfig.flex[oConfig.moveItemChangeType].changeHandler;

			const oChange = await ChangesWriteAPI.create({
				changeSpecificData: moveChange(oConfig.moveItemChangeType, "staticProp1", 3),
				selector: this.oControl
			});
			await oChangeHandler.applyChange(oChange, this.oXMLControl, {
				modifier: XMLTreeModifier,
				appComponent: this.oUiComponent,
				view: this.oView
			});

			const aPropertyKeys = await XMLTreeModifier.getProperty(this.oXMLControl, "propertyKeys");
			assert.deepEqual(
				aPropertyKeys,
				["dynamicInactive", "staticProp2", "dynamicActive", "staticProp1"],
				"staticProp1 moved to propertyKeys index 3"
			);
			assert.strictEqual(this.oMarkSpy.callCount, 0, "markAsNotApplicable was not called");
		});

		QUnit.test("Apply add then move - cumulative index translations", async function (assert) {
			this.oXMLControl.setAttribute("propertyKeys", "dynamicInactive,staticProp1,dynamicActive");

			const oAddHandler = oConfig.flex[oConfig.addItemChangeType].changeHandler;
			const oMoveHandler = oConfig.flex[oConfig.moveItemChangeType].changeHandler;

			const oAddChange = await ChangesWriteAPI.create({
				changeSpecificData: addChange(oConfig.addItemChangeType, "staticProp2", 3),
				selector: this.oControl
			});
			await oAddHandler.applyChange(oAddChange, this.oXMLControl, {
				modifier: XMLTreeModifier,
				appComponent: this.oUiComponent,
				view: this.oXMLView
			});

			const oMoveChange = await ChangesWriteAPI.create({
				changeSpecificData: moveChange(oConfig.moveItemChangeType, "staticProp2", 1),
				selector: this.oControl
			});
			await oMoveHandler.applyChange(oMoveChange, this.oXMLControl, {
				modifier: XMLTreeModifier,
				appComponent: this.oUiComponent,
				view: this.oXMLView
			});

			const aPropertyKeys = await XMLTreeModifier.getProperty(this.oXMLControl, "propertyKeys");
			assert.deepEqual(
				aPropertyKeys,
				["dynamicInactive", "staticProp2", "staticProp1", "dynamicActive"],
				"After add + move: staticProp2 at propertyKeys index 1"
			);
			assert.strictEqual(this.oMarkSpy.callCount, 0, "markAsNotApplicable was not called");
		});

		QUnit.test("Apply + revert add for inactive property", async function (assert) {
			const oChangeHandler = oConfig.flex[oConfig.addItemChangeType].changeHandler;

			this.oXMLControl.setAttribute("propertyKeys", "staticProp1,staticProp2,dynamicActive");

			const oChange = await ChangesWriteAPI.create({
				changeSpecificData: oAddInactiveChange,
				selector: this.oControl
			});
			await oChangeHandler.applyChange(oChange, this.oXMLControl, {
				modifier: XMLTreeModifier,
				appComponent: this.oUiComponent,
				view: this.oView
			});

			let aPropertyKeys = await XMLTreeModifier.getProperty(this.oXMLControl, "propertyKeys");
			assert.deepEqual(
				aPropertyKeys,
				["dynamicInactive", "staticProp1", "staticProp2", "dynamicActive"],
				"After apply: dynamicInactive in propertyKeys"
			);

			await oChangeHandler.revertChange(oChange, this.oXMLControl, {
				modifier: XMLTreeModifier,
				appComponent: this.oUiComponent,
				view: this.oView
			});

			aPropertyKeys = await XMLTreeModifier.getProperty(this.oXMLControl, "propertyKeys");
			assert.deepEqual(
				aPropertyKeys,
				["staticProp1", "staticProp2", "dynamicActive"],
				"After revert: dynamicInactive removed from propertyKeys"
			);
			assert.strictEqual(this.oMarkSpy.callCount, 0, "markAsNotApplicable was not called");
		});

		QUnit.test("Apply + revert add for active property", async function (assert) {
			const oChangeHandler = oConfig.flex[oConfig.addItemChangeType].changeHandler;

			this.oXMLControl.setAttribute("propertyKeys", "dynamicInactive,staticProp1,dynamicActive");

			const oChange = await ChangesWriteAPI.create({
				changeSpecificData: addChange(oConfig.addItemChangeType, "staticProp2", 2),
				selector: this.oControl
			});
			await oChangeHandler.applyChange(oChange, this.oXMLControl, {
				modifier: XMLTreeModifier,
				appComponent: this.oUiComponent,
				view: this.oXMLView
			});

			let aPropertyKeys = await XMLTreeModifier.getProperty(this.oXMLControl, "propertyKeys");
			assert.deepEqual(
				aPropertyKeys,
				["dynamicInactive", "staticProp1", "staticProp2", "dynamicActive"],
				"After apply: staticProp2 in propertyKeys at index 2"
			);

			await oChangeHandler.revertChange(oChange, this.oXMLControl, {
				modifier: XMLTreeModifier,
				appComponent: this.oUiComponent,
				view: this.oXMLView
			});

			aPropertyKeys = await XMLTreeModifier.getProperty(this.oXMLControl, "propertyKeys");
			assert.deepEqual(
				aPropertyKeys,
				["dynamicInactive", "staticProp1", "dynamicActive"],
				"After revert: staticProp2 removed from propertyKeys"
			);
			assert.strictEqual(this.oMarkSpy.callCount, 0, "markAsNotApplicable was not called");
		});

		QUnit.test("Apply + revert remove for inactive property", async function (assert) {
			const oChangeHandler = oConfig.flex[oConfig.removeItemChangeType].changeHandler;

			const oChange = await ChangesWriteAPI.create({
				changeSpecificData: removeChange(oConfig.removeItemChangeType, "dynamicInactive"),
				selector: this.oControl
			});
			await oChangeHandler.applyChange(oChange, this.oXMLControl, {
				modifier: XMLTreeModifier,
				appComponent: this.oUiComponent,
				view: this.oView
			});

			let aPropertyKeys = await XMLTreeModifier.getProperty(this.oXMLControl, "propertyKeys");
			assert.deepEqual(
				aPropertyKeys,
				["staticProp1", "staticProp2", "dynamicActive"],
				"After apply: dynamicInactive removed from propertyKeys"
			);

			await oChangeHandler.revertChange(oChange, this.oXMLControl, {
				modifier: XMLTreeModifier,
				appComponent: this.oUiComponent,
				view: this.oView
			});

			aPropertyKeys = await XMLTreeModifier.getProperty(this.oXMLControl, "propertyKeys");
			assert.deepEqual(
				aPropertyKeys,
				["dynamicInactive", "staticProp1", "staticProp2", "dynamicActive"],
				"After revert: dynamicInactive restored to propertyKeys"
			);
			assert.strictEqual(this.oMarkSpy.callCount, 0, "markAsNotApplicable was not called");
		});

		QUnit.test("Apply + revert remove for active property", async function (assert) {
			const oChangeHandler = oConfig.flex[oConfig.removeItemChangeType].changeHandler;

			const oChange = await ChangesWriteAPI.create({
				changeSpecificData: removeChange(oConfig.removeItemChangeType, "staticProp2"),
				selector: this.oControl
			});
			await oChangeHandler.applyChange(oChange, this.oXMLControl, {
				modifier: XMLTreeModifier,
				appComponent: this.oUiComponent,
				view: this.oView
			});

			let aPropertyKeys = await XMLTreeModifier.getProperty(this.oXMLControl, "propertyKeys");
			assert.deepEqual(
				aPropertyKeys,
				["dynamicInactive", "staticProp1", "dynamicActive"],
				"After apply: staticProp2 removed from propertyKeys"
			);

			await oChangeHandler.revertChange(oChange, this.oXMLControl, {
				modifier: XMLTreeModifier,
				appComponent: this.oUiComponent,
				view: this.oXMLView
			});

			aPropertyKeys = await XMLTreeModifier.getProperty(this.oXMLControl, "propertyKeys");
			assert.deepEqual(
				aPropertyKeys,
				["dynamicInactive", "staticProp1", "staticProp2", "dynamicActive"],
				"After revert: staticProp2 restored to propertyKeys"
			);
			assert.strictEqual(this.oMarkSpy.callCount, 0, "markAsNotApplicable was not called");
		});

		QUnit.test("Apply + revert remove for active property - revert restores propertyKeys index", async function (assert) {
			const oChangeHandler = oConfig.flex[oConfig.removeItemChangeType].changeHandler;

			const oChange = await ChangesWriteAPI.create({
				changeSpecificData: removeChange(oConfig.removeItemChangeType, "staticProp1"),
				selector: this.oControl
			});
			await oChangeHandler.applyChange(oChange, this.oXMLControl, {
				modifier: XMLTreeModifier,
				appComponent: this.oUiComponent,
				view: this.oXMLView
			});

			let aPropertyKeys = await XMLTreeModifier.getProperty(this.oXMLControl, "propertyKeys");
			assert.deepEqual(
				aPropertyKeys,
				["dynamicInactive", "staticProp2", "dynamicActive"],
				"After apply: staticProp1 removed from propertyKeys"
			);

			await oChangeHandler.revertChange(oChange, this.oXMLControl, {
				modifier: XMLTreeModifier,
				appComponent: this.oUiComponent,
				view: this.oXMLView
			});

			aPropertyKeys = await XMLTreeModifier.getProperty(this.oXMLControl, "propertyKeys");
			assert.deepEqual(
				aPropertyKeys,
				["dynamicInactive", "staticProp1", "staticProp2", "dynamicActive"],
				"After revert: staticProp1 restored to propertyKeys at original position"
			);
			assert.strictEqual(this.oMarkSpy.callCount, 0, "markAsNotApplicable was not called");
		});

		QUnit.test("Apply + revert move for inactive property", async function (assert) {
			const oChangeHandler = oConfig.flex[oConfig.moveItemChangeType].changeHandler;

			const oChange = await ChangesWriteAPI.create({
				changeSpecificData: moveChange(oConfig.moveItemChangeType, "dynamicInactive", 2),
				selector: this.oControl
			});
			await oChangeHandler.applyChange(oChange, this.oXMLControl, {
				modifier: XMLTreeModifier,
				appComponent: this.oUiComponent,
				view: this.oView
			});

			let aPropertyKeys = await XMLTreeModifier.getProperty(this.oXMLControl, "propertyKeys");
			assert.deepEqual(
				aPropertyKeys,
				["staticProp1", "staticProp2", "dynamicInactive", "dynamicActive"],
				"After apply: dynamicInactive moved to propertyKeys index 2"
			);

			await oChangeHandler.revertChange(oChange, this.oXMLControl, {
				modifier: XMLTreeModifier,
				appComponent: this.oUiComponent,
				view: this.oView
			});

			aPropertyKeys = await XMLTreeModifier.getProperty(this.oXMLControl, "propertyKeys");
			assert.deepEqual(
				aPropertyKeys,
				["dynamicInactive", "staticProp1", "staticProp2", "dynamicActive"],
				"After revert: dynamicInactive at propertyKeys index 0 (matches original position)"
			);
			assert.strictEqual(this.oMarkSpy.callCount, 0, "markAsNotApplicable was not called");
		});

		QUnit.test("Apply + revert move for active property", async function (assert) {
			const oChangeHandler = oConfig.flex[oConfig.moveItemChangeType].changeHandler;

			const oChange = await ChangesWriteAPI.create({
				changeSpecificData: moveChange(oConfig.moveItemChangeType, "staticProp1", 2),
				selector: this.oControl
			});
			await oChangeHandler.applyChange(oChange, this.oXMLControl, {
				modifier: XMLTreeModifier,
				appComponent: this.oUiComponent,
				view: this.oView
			});

			let aPropertyKeys = await XMLTreeModifier.getProperty(this.oXMLControl, "propertyKeys");
			assert.deepEqual(
				aPropertyKeys,
				["dynamicInactive", "staticProp2", "staticProp1", "dynamicActive"],
				"After apply: staticProp1 moved to propertyKeys index 2"
			);

			await oChangeHandler.revertChange(oChange, this.oXMLControl, {
				modifier: XMLTreeModifier,
				appComponent: this.oUiComponent,
				view: this.oView
			});

			aPropertyKeys = await XMLTreeModifier.getProperty(this.oXMLControl, "propertyKeys");
			assert.deepEqual(
				aPropertyKeys,
				["dynamicInactive", "staticProp1", "staticProp2", "dynamicActive"],
				"After revert: propertyKeys order restored"
			);
			assert.strictEqual(this.oMarkSpy.callCount, 0, "markAsNotApplicable was not called");
		});

		QUnit.test("Apply + revert move for active property to last propertyKeys index", async function (assert) {
			const oChangeHandler = oConfig.flex[oConfig.moveItemChangeType].changeHandler;

			const oChange = await ChangesWriteAPI.create({
				changeSpecificData: moveChange(oConfig.moveItemChangeType, "staticProp2", 3),
				selector: this.oControl
			});
			await oChangeHandler.applyChange(oChange, this.oXMLControl, {
				modifier: XMLTreeModifier,
				appComponent: this.oUiComponent,
				view: this.oView
			});

			let aPropertyKeys = await XMLTreeModifier.getProperty(this.oXMLControl, "propertyKeys");
			assert.deepEqual(
				aPropertyKeys,
				["dynamicInactive", "staticProp1", "dynamicActive", "staticProp2"],
				"After apply: staticProp2 at propertyKeys index 3"
			);

			await oChangeHandler.revertChange(oChange, this.oXMLControl, {
				modifier: XMLTreeModifier,
				appComponent: this.oUiComponent,
				view: this.oView
			});

			aPropertyKeys = await XMLTreeModifier.getProperty(this.oXMLControl, "propertyKeys");
			assert.deepEqual(
				aPropertyKeys,
				["dynamicInactive", "staticProp1", "staticProp2", "dynamicActive"],
				"After revert: propertyKeys order restored"
			);
			assert.strictEqual(this.oMarkSpy.callCount, 0, "markAsNotApplicable was not called");
		});

		QUnit.test("Apply + revert remove for inactive property at non-zero propertyKeys index (verifies revert index)", async function (assert) {
			this.oXMLControl.setAttribute("propertyKeys", "staticProp1,staticProp2,dynamicInactive,dynamicActive");

			const oChangeHandler = oConfig.flex[oConfig.removeItemChangeType].changeHandler;

			const oChange = await ChangesWriteAPI.create({
				changeSpecificData: removeChange(oConfig.removeItemChangeType, "dynamicInactive"),
				selector: this.oControl
			});
			await oChangeHandler.applyChange(oChange, this.oXMLControl, {
				modifier: XMLTreeModifier,
				appComponent: this.oUiComponent,
				view: this.oView
			});

			let aPropertyKeys = await XMLTreeModifier.getProperty(this.oXMLControl, "propertyKeys");
			assert.deepEqual(
				aPropertyKeys,
				["staticProp1", "staticProp2", "dynamicActive"],
				"After apply: dynamicInactive removed from propertyKeys"
			);

			assert.strictEqual(oChange.getRevertData().index, 2,
				"Revert data captured propertyKeys index 2 (the position before removal)");

			await oChangeHandler.revertChange(oChange, this.oXMLControl, {
				modifier: XMLTreeModifier,
				appComponent: this.oUiComponent,
				view: this.oView
			});

			aPropertyKeys = await XMLTreeModifier.getProperty(this.oXMLControl, "propertyKeys");
			assert.deepEqual(
				aPropertyKeys,
				["staticProp1", "staticProp2", "dynamicInactive", "dynamicActive"],
				"After revert: dynamicInactive restored to propertyKeys index 2 (not 0)"
			);
			assert.strictEqual(this.oMarkSpy.callCount, 0, "markAsNotApplicable was not called");
		});

		QUnit.test("Apply + revert move for inactive property at non-zero propertyKeys index (verifies revert index)", async function (assert) {
			this.oXMLControl.setAttribute("propertyKeys", "staticProp1,staticProp2,dynamicInactive,dynamicActive");

			const oChangeHandler = oConfig.flex[oConfig.moveItemChangeType].changeHandler;

			const oChange = await ChangesWriteAPI.create({
				changeSpecificData: moveChange(oConfig.moveItemChangeType, "dynamicInactive", 0),
				selector: this.oControl
			});
			await oChangeHandler.applyChange(oChange, this.oXMLControl, {
				modifier: XMLTreeModifier,
				appComponent: this.oUiComponent,
				view: this.oView
			});

			let aPropertyKeys = await XMLTreeModifier.getProperty(this.oXMLControl, "propertyKeys");
			assert.deepEqual(
				aPropertyKeys,
				["dynamicInactive", "staticProp1", "staticProp2", "dynamicActive"],
				"After apply: dynamicInactive moved to propertyKeys index 0"
			);

			assert.strictEqual(oChange.getRevertData().index, 2,
				"Revert data captured old propertyKeys index 2 (the position before move)");

			await oChangeHandler.revertChange(oChange, this.oXMLControl, {
				modifier: XMLTreeModifier,
				appComponent: this.oUiComponent,
				view: this.oView
			});

			aPropertyKeys = await XMLTreeModifier.getProperty(this.oXMLControl, "propertyKeys");
			assert.deepEqual(
				aPropertyKeys,
				["staticProp1", "staticProp2", "dynamicInactive", "dynamicActive"],
				"After revert: dynamicInactive back at propertyKeys index 2"
			);
			assert.strictEqual(this.oMarkSpy.callCount, 0, "markAsNotApplicable was not called");
		});

		QUnit.module(oConfig.name + " - StateUtil pipeline", {
			beforeEach: async function () {
				const mCreatedApp = await createAppEnvironment(oConfig.view, "DynProp");
				this.oView = mCreatedApp.view;
				this.oUiComponent = mCreatedApp.comp;
				this.oUiComponentContainer = mCreatedApp.container;
				this.oUiComponentContainer.placeAt("qunit-fixture");
				this.oControl = this.oView.byId("myControl");
				await oConfig.initialized(this.oControl);
			},
			afterEach: function () {
				this.oUiComponentContainer.destroy();
			}
		});

		QUnit.test("retrieveExternalState - 'items' contains inactive keys", async function(assert) {
			const oState = await StateUtil.retrieveExternalState(this.oControl);

			assert.deepEqual(
				oState.items.map((oItem) => oItem.key),
				["dynamicInactive", "staticProp1", "staticProp2", "dynamicActive"],
				"items reflects propertyKeys order including inactive key"
			);
		});

		QUnit.test("retrieveExternalState - 'filter' contains inactive key", async function(assert) {
			await StateUtil.applyExternalState(this.oControl, {
				filter: { dynamicInactive: [{ operator: "EQ", values: ["test"] }] }
			});

			const oState = await StateUtil.retrieveExternalState(this.oControl);

			assert.ok(Object.hasOwn(oState.filter, "dynamicInactive"),
				"filter state contains the inactive key");
			assert.deepEqual(oState.filter.dynamicInactive, [{ operator: "EQ", values: ["test"] }],
				"filter condition for inactive key is preserved");
		});

		if (oConfig.name === "Table") {
			QUnit.test("retrieveExternalState - 'sorters' contains inactive key", async function(assert) {
				await StateUtil.applyExternalState(this.oControl, {
					sorters: [{ key: "dynamicInactive", descending: false }]
				});

				const oState = await StateUtil.retrieveExternalState(this.oControl);

				assert.ok(oState.sorters.some(function(oSorter) { return oSorter.key === "dynamicInactive"; }),
					"sorters state contains the inactive key");
			});

			QUnit.test("retrieveExternalState - 'groupLevels' contains inactive key", async function(assert) {
				await StateUtil.applyExternalState(this.oControl, {
					groupLevels: [{ key: "dynamicInactive" }]
				});

				const oState = await StateUtil.retrieveExternalState(this.oControl);

				assert.ok(oState.groupLevels.some(function(oGroup) { return oGroup.key === "dynamicInactive"; }),
					"groupLevels state contains the inactive key");
			});

			QUnit.test("retrieveExternalState - 'aggregations' contains inactive key", async function(assert) {
				await StateUtil.applyExternalState(this.oControl, {
					aggregations: { dynamicInactive: {} }
				});

				const oState = await StateUtil.retrieveExternalState(this.oControl);

				assert.ok(Object.hasOwn(oState.aggregations, "dynamicInactive"),
					"aggregations state contains the inactive key");
			});
		}

		QUnit.test("Applying the same state produces no changes", async function(assert) {
			const oState = await StateUtil.retrieveExternalState(this.oControl);
			const aChanges = await StateUtil.applyExternalState(this.oControl, oState);

			await this.oControl.awaitPendingModification();
			assert.strictEqual(aChanges.length, 0, "no changes when applying retrieved state");
			assert.deepEqual(
				this.oControl.getPropertyKeys(),
				["dynamicInactive", "staticProp1", "staticProp2", "dynamicActive"],
				"propertyKeys unchanged"
			);
		});

		QUnit.test("Hide and show inactive property", async function(assert) {
			const aChanges = await StateUtil.applyExternalState(this.oControl, {
				items: [{key: "dynamicInactive", visible: false}]
			});
			await this.oControl.awaitPendingModification();

			assert.ok(aChanges.some(function(oChange) {return oChange.getChangeType() === oConfig.removeItemChangeType;}), "remove change created");
			assert.deepEqual(
				this.oControl.getPropertyKeys(),
				["staticProp1", "staticProp2", "dynamicActive"],
				"dynamicInactive removed from propertyKeys"
			);
			assert.deepEqual(
				oConfig.getItems(this.oControl).map(function(oItem) {return oItem.getPropertyKey();}),
				["staticProp1", "staticProp2", "dynamicActive"],
				"Aggregation unchanged (dynamicInactive was not materialized)"
			);

			const aReAddChanges = await StateUtil.applyExternalState(this.oControl, {
				items: [{key: "dynamicInactive", position: 0}]
			});
			await this.oControl.awaitPendingModification();

			assert.ok(aReAddChanges.some(function(oChange) {return oChange.getChangeType() === oConfig.addItemChangeType;}),
				"Add change created for re-add");
			assert.deepEqual(
				this.oControl.getPropertyKeys(),
				["dynamicInactive", "staticProp1", "staticProp2", "dynamicActive"],
				"dynamicInactive re-added to propertyKeys at index 0"
			);
			assert.deepEqual(
				oConfig.getItems(this.oControl).map(function(oItem) {return oItem.getPropertyKey();}),
				["staticProp1", "staticProp2", "dynamicActive"],
				"Aggregation still unchanged (dynamicInactive remains inactive)"
			);
		});

		QUnit.test("Deactivate active dynamic property (isActive: false)", async function (assert) {
			const aChanges = await StateUtil.applyExternalState(this.oControl, {
				supplementaryConfig: {
					propertyInfo: {
						dynamicActive: { isActive: false }
					}
				}
			});
			await this.oControl.awaitPendingModification();
			assert.ok(aChanges.length >= 1, "At least 1 change created");
			assert.strictEqual(aChanges[0].getChangeType(), "setPropertyAttribute", "Change type");

			const oRetrievedState = await StateUtil.retrieveExternalState(this.oControl);
			assert.strictEqual(oRetrievedState.supplementaryConfig.propertyInfo.dynamicActive.isActive, false,
				"Retrieved state shows isActive: false for dynamicActive"
			);

			assert.deepEqual(
				this.oControl.getPropertyKeys(),
				["dynamicInactive", "staticProp1", "staticProp2", "dynamicActive"],
				"propertyKeys unchanged - deactivation does not affect propertyKeys"
			);

			assert.deepEqual(
				oConfig.getItems(this.oControl).map((oItem) => oItem.getPropertyKey()),
				["staticProp1", "staticProp2"],
				"Item removed from aggregation for deactivated property"
			);
		});

		QUnit.test("Activate inactive dynamic property (isActive: true)", async function (assert) {
			const aChanges = await StateUtil.applyExternalState(this.oControl, {
				supplementaryConfig: {
					propertyInfo: {
						dynamicInactive: { isActive: true }
					}
				}
			});
			await this.oControl.awaitPendingModification();
			assert.ok(aChanges.length >= 1, "At least 1 change created");

			const oRetrievedState = await StateUtil.retrieveExternalState(this.oControl);
			assert.strictEqual(oRetrievedState.supplementaryConfig.propertyInfo.dynamicInactive.isActive, true,
				"Retrieved state shows isActive: true for dynamicInactive"
			);

			assert.deepEqual(
				this.oControl.getPropertyKeys(),
				["dynamicInactive", "staticProp1", "staticProp2", "dynamicActive"],
				"propertyKeys unchanged - dynamicInactive was already in propertyKeys"
			);

			assert.strictEqual(oConfig.getItems(this.oControl).length, 4, "Item materialized for activated property");
			assert.deepEqual(
				oConfig.getItems(this.oControl).map((oItem) => oItem.getPropertyKey()),
				["dynamicInactive", "staticProp1", "staticProp2", "dynamicActive"],
				"New item is for dynamicInactive at the beginning"
			);
		});

		QUnit.test("Set isActive: true for already-active property", async function (assert) {
			const aChanges = await StateUtil.applyExternalState(this.oControl, {
				supplementaryConfig: {
					propertyInfo: {
						dynamicActive: { isActive: true }
					}
				}
			});
			assert.strictEqual(aChanges.length, 1, "1 change created");

			const oRetrievedState = await StateUtil.retrieveExternalState(this.oControl);
			assert.strictEqual(oRetrievedState.supplementaryConfig.propertyInfo.dynamicActive.isActive, true,
				"Retrieved state shows isActive: true for dynamicActive"
			);

			assert.deepEqual(this.oControl.getPropertyKeys(),
				["dynamicInactive", "staticProp1", "staticProp2", "dynamicActive"],
				"propertyKeys unchanged"
			);
			assert.deepEqual(
				oConfig.getItems(this.oControl).map((oItem) => oItem.getPropertyKey()),
				["staticProp1", "staticProp2", "dynamicActive"],
				"Items unchanged"
			);

			// Applying the same state again must not create another change
			const aChanges2 = await StateUtil.applyExternalState(this.oControl, {
				supplementaryConfig: {
					propertyInfo: {
						dynamicActive: { isActive: true }
					}
				}
			});
			assert.strictEqual(aChanges2.length, 0, "0 changes created when applying the same isActive: true again");
		});

		QUnit.test("Set isActive: false for already-inactive property", async function (assert) {
			const aChanges = await StateUtil.applyExternalState(this.oControl, {
				supplementaryConfig: {
					propertyInfo: {
						dynamicInactive: { isActive: false }
					}
				}
			});
			assert.strictEqual(aChanges.length, 1, "1 change created");

			const oRetrievedState = await StateUtil.retrieveExternalState(this.oControl);
			assert.strictEqual(oRetrievedState.supplementaryConfig.propertyInfo.dynamicInactive.isActive, false,
				"Retrieved state shows isActive: false for dynamicInactive"
			);

			assert.deepEqual(
				this.oControl.getPropertyKeys(),
				["dynamicInactive", "staticProp1", "staticProp2", "dynamicActive"],
				"propertyKeys unchanged"
			);
			assert.deepEqual(
				oConfig.getItems(this.oControl).map((oItem) => oItem.getPropertyKey()),
				["staticProp1", "staticProp2", "dynamicActive"],
				"Items unchanged"
			);

			// Applying the same state again must not create another change
			const aChanges2 = await StateUtil.applyExternalState(this.oControl, {
				supplementaryConfig: {
					propertyInfo: {
						dynamicInactive: { isActive: false }
					}
				}
			});
			assert.strictEqual(aChanges2.length, 0, "0 changes created when applying the same isActive: false again");
		});

		QUnit.test("Activate property not in propertyKeys", async function (assert) {
			await StateUtil.applyExternalState(this.oControl, {
				supplementaryConfig: {
					propertyInfo: {
						dynamicNotInShadow: { isActive: true }
					}
				}
			});

			assert.deepEqual(
				this.oControl.getPropertyKeys(),
				["dynamicInactive", "staticProp1", "staticProp2", "dynamicActive"],
				"propertyKeys unchanged"
			);

			assert.deepEqual(
				oConfig.getItems(this.oControl).map((oItem) => oItem.getPropertyKey()),
				["staticProp1", "staticProp2", "dynamicActive"],
				"Items unchanged"
			);
		});

		QUnit.test("Deactivate property not in propertyKeys", async function (assert) {
			await StateUtil.applyExternalState(this.oControl, {
				supplementaryConfig: {
					propertyInfo: {
						dynamicNotInShadow: { isActive: false }
					}
				}
			});

			assert.deepEqual(
				this.oControl.getPropertyKeys(),
				["dynamicInactive", "staticProp1", "staticProp2", "dynamicActive"],
				"propertyKeys unchanged"
			);

			assert.deepEqual(
				oConfig.getItems(this.oControl).map((oItem) => oItem.getPropertyKey()),
				["staticProp1", "staticProp2", "dynamicActive"],
				"Items unchanged"
			);
		});

		QUnit.test("Deactivate then reactivate", async function (assert) {
			await StateUtil.applyExternalState(this.oControl, {
				supplementaryConfig: {
					propertyInfo: {
						dynamicActive: { isActive: false }
					}
				}
			});
			await this.oControl.awaitPendingModification();

			const oRetrievedStateAfterDeactivation = await StateUtil.retrieveExternalState(this.oControl);
			assert.strictEqual(oRetrievedStateAfterDeactivation.supplementaryConfig.propertyInfo.dynamicActive.isActive, false,
				"After deactivation: isActive is false"
			);

			assert.deepEqual(
				this.oControl.getPropertyKeys(),
				["dynamicInactive", "staticProp1", "staticProp2", "dynamicActive"],
				"After deactivation: propertyKeys unchanged"
			);
			assert.deepEqual(
				oConfig.getItems(this.oControl).map((oItem) => oItem.getPropertyKey()),
				["staticProp1", "staticProp2"],
				"After deactivation: dynamicActive item removed (dynamicInactive was already inactive)"
			);

			await StateUtil.applyExternalState(this.oControl, {
				supplementaryConfig: {
					propertyInfo: {
						dynamicActive: { isActive: true }
					}
				}
			});
			await this.oControl.awaitPendingModification();

			const oRetrievedStateAfterReactivation = await StateUtil.retrieveExternalState(this.oControl);
			assert.strictEqual(oRetrievedStateAfterReactivation.supplementaryConfig.propertyInfo.dynamicActive.isActive, true,
				"After reactivation: isActive is true"
			);

			assert.deepEqual(
				this.oControl.getPropertyKeys(),
				["dynamicInactive", "staticProp1", "staticProp2", "dynamicActive"],
				"After reactivation: propertyKeys unchanged"
			);
			assert.deepEqual(
				oConfig.getItems(this.oControl).map((oItem) => oItem.getPropertyKey()),
				["staticProp1", "staticProp2", "dynamicActive"],
				"After reactivation: dynamicActive item restored (dynamicInactive still inactive)"
			);
		});

		QUnit.test("Deactivate and hide active property in one call", async function (assert) {
			const aChanges = await StateUtil.applyExternalState(this.oControl, {
				supplementaryConfig: {
					propertyInfo: {
						dynamicActive: { isActive: false }
					}
				},
				items: [{ key: "dynamicActive", visible: false }]
			});
			await this.oControl.awaitPendingModification();

			assert.ok(aChanges.some(function (oChange) { return oChange.getChangeType() === "setPropertyAttribute"; }),
				"setPropertyAttribute change created for deactivation"
			);
			assert.ok(aChanges.some(function (oChange) { return oChange.getChangeType() === oConfig.removeItemChangeType; }),
				oConfig.removeItemChangeType + " change created for hide"
			);

			assert.deepEqual(
				this.oControl.getPropertyKeys(),
				["dynamicInactive", "staticProp1", "staticProp2"],
				"dynamicActive removed from propertyKeys"
			);
			assert.deepEqual(
				oConfig.getItems(this.oControl).map(function (oItem) { return oItem.getPropertyKey(); }),
				["staticProp1", "staticProp2"],
				"dynamicActive item removed from aggregation"
			);

			const oRetrievedState = await StateUtil.retrieveExternalState(this.oControl);
			assert.strictEqual(oRetrievedState.supplementaryConfig.propertyInfo.dynamicActive.isActive, false,
				"Retrieved state shows isActive: false for dynamicActive"
			);
		});

		QUnit.test("Activate and show inactive property in one call", async function (assert) {
			const aChanges = await StateUtil.applyExternalState(this.oControl, {
				supplementaryConfig: {
					propertyInfo: {
						dynamicInactive: { isActive: true }
					}
				},
				items: [{ key: "dynamicInactive", position: 0 }]
			});
			await this.oControl.awaitPendingModification();

			assert.ok(aChanges.some(function (oChange) { return oChange.getChangeType() === "setPropertyAttribute"; }),
				"setPropertyAttribute change created for activation"
			);

			assert.deepEqual(
				this.oControl.getPropertyKeys(),
				["dynamicInactive", "staticProp1", "staticProp2", "dynamicActive"],
				"dynamicInactive remains in propertyKeys at position 0"
			);
			assert.deepEqual(
				oConfig.getItems(this.oControl).map(function (oItem) { return oItem.getPropertyKey(); }),
				["dynamicInactive", "staticProp1", "staticProp2", "dynamicActive"],
				"dynamicInactive item now appears in aggregation"
			);

			const oRetrievedState = await StateUtil.retrieveExternalState(this.oControl);
			assert.strictEqual(oRetrievedState.supplementaryConfig.propertyInfo.dynamicInactive.isActive, true,
				"Retrieved state shows isActive: true for dynamicInactive"
			);
		});

		QUnit.test("Activate and hide inactive property in one call", async function (assert) {
			const aChanges = await StateUtil.applyExternalState(this.oControl, {
				supplementaryConfig: {
					propertyInfo: {
						dynamicInactive: { isActive: true }
					}
				},
				items: [{ key: "dynamicInactive", visible: false }]
			});
			await this.oControl.awaitPendingModification();

			assert.ok(aChanges.some(function (oChange) { return oChange.getChangeType() === "setPropertyAttribute"; }),
				"setPropertyAttribute change created for activation"
			);
			assert.ok(aChanges.some(function (oChange) { return oChange.getChangeType() === oConfig.removeItemChangeType; }),
				oConfig.removeItemChangeType + " change created for hide"
			);

			assert.deepEqual(
				this.oControl.getPropertyKeys(),
				["staticProp1", "staticProp2", "dynamicActive"],
				"dynamicInactive removed from propertyKeys"
			);
			assert.deepEqual(
				oConfig.getItems(this.oControl).map(function (oItem) { return oItem.getPropertyKey(); }),
				["staticProp1", "staticProp2", "dynamicActive"],
				"dynamicInactive item not materialized (hidden)"
			);

			const oRetrievedState = await StateUtil.retrieveExternalState(this.oControl);
			assert.strictEqual(oRetrievedState.supplementaryConfig.propertyInfo.dynamicInactive.isActive, true,
				"Retrieved state shows isActive: true for dynamicInactive"
			);
		});

		QUnit.test("Add item at beginning", async function(assert) {
			const aChanges = await StateUtil.applyExternalState(this.oControl, {
				items: [{ key: "newProp", position: 0 }]
			});

			await this.oControl.awaitPendingModification();
			assert.ok(aChanges.some(function(oChange) {return oChange.getChangeType() === oConfig.addItemChangeType;}), "add change created");

			const oAddChange = aChanges.find(function (oChange) { return oChange.getChangeType() === oConfig.addItemChangeType; });
			assert.strictEqual(oAddChange.getContent().index, 0, "Flex change carries the propertyKeys-space position");

			assert.deepEqual(
				this.oControl.getPropertyKeys(),
				["newProp", "dynamicInactive", "staticProp1", "staticProp2", "dynamicActive"],
				"newProp inserted at index 0"
			);

			assert.deepEqual(
				oConfig.getItems(this.oControl).map(function (oItem) { return oItem.getPropertyKey(); }),
				["newProp", "staticProp1", "staticProp2", "dynamicActive"],
				"newProp is the first active item"
			);
		});

		QUnit.test("Move item to end", async function(assert) {
			const aChanges = await StateUtil.applyExternalState(this.oControl, {
				items: [{key: "staticProp1", position: 3}]
			});

			await this.oControl.awaitPendingModification();
			assert.ok(aChanges.some(function(oChange) {return oChange.getChangeType() === oConfig.moveItemChangeType;}), "move change created");

			const oMoveChange = aChanges.find(function (oChange) { return oChange.getChangeType() === oConfig.moveItemChangeType; });
			assert.strictEqual(oMoveChange.getContent().index, 3, "Flex change carries the propertyKeys-space position");

			assert.deepEqual(
				this.oControl.getPropertyKeys(),
				["dynamicInactive", "staticProp2", "dynamicActive", "staticProp1"],
				"staticProp1 moved to index 3"
			);

			assert.deepEqual(
				oConfig.getItems(this.oControl).map(function (oItem) { return oItem.getPropertyKey(); }),
				["staticProp2", "dynamicActive", "staticProp1"],
				"staticProp1 is the last active item"
			);
		});

		QUnit.test("Remove and re-add item", async function(assert) {
			const aRemoveChanges = await StateUtil.applyExternalState(this.oControl, {
				items: [{ key: "staticProp1", visible: false }]
			});

			await this.oControl.awaitPendingModification();
			assert.ok(aRemoveChanges.some(function(oChange) {return oChange.getChangeType() === oConfig.removeItemChangeType;}), "remove change created");

			assert.deepEqual(
				this.oControl.getPropertyKeys(),
				["dynamicInactive", "staticProp2", "dynamicActive"],
				"staticProp1 removed from propertyKeys"
			);

			assert.deepEqual(
				oConfig.getItems(this.oControl).map(function (oItem) { return oItem.getPropertyKey(); }),
				["staticProp2", "dynamicActive"],
				"staticProp1 removed from items"
			);

			const aAddChanges = await StateUtil.applyExternalState(this.oControl, {
				items: [{key: "staticProp1", position: 1}]
			});
			await this.oControl.awaitPendingModification();
			assert.ok(aAddChanges.some(function(oChange) {return oChange.getChangeType() === oConfig.addItemChangeType;}), "add change created for re-add");

			const oReAddChange = aAddChanges.find(function (oChange) { return oChange.getChangeType() === oConfig.addItemChangeType; });
			assert.strictEqual(oReAddChange.getContent().index, 1, "Flex change carries the propertyKeys-space position");

			assert.deepEqual(
				this.oControl.getPropertyKeys(),
				["dynamicInactive", "staticProp1", "staticProp2", "dynamicActive"],
				"staticProp1 re-added at index 1"
			);

			assert.deepEqual(
				oConfig.getItems(this.oControl).map(function (oItem) { return oItem.getPropertyKey(); }),
				["staticProp1", "staticProp2", "dynamicActive"],
				"staticProp1 is the first active item after re-add"
			);
		});

		QUnit.test("Apply filter for inactive property", async function (assert) {
			// Without finalized PropertyInfo
			let aChanges = await StateUtil.applyExternalState(this.oControl, {
				filter: {
					dynamicInactive: [{ operator: "EQ", values: ["test"] }]
				}
			});

			assert.ok(aChanges.some(function (oChange) { return oChange.getChangeType() === "addCondition"; }), "addCondition change created");
			assert.deepEqual(this.oControl.getFilterConditions(), { dynamicInactive: [{ operator: "EQ", values: ["test"] }] }, "Filter condition");

			// Undo and repeat with finalized PropertyInfo
			await StateUtil.applyExternalState(this.oControl, {
				filter: {
					dynamicInactive: [{ operator: "EQ", values: ["test"], filtered: false }]
				}
			});
			await this.oControl.finalizePropertyHelper();

			aChanges = await StateUtil.applyExternalState(this.oControl, {
				filter: {
					dynamicInactive: [{ operator: "EQ", values: ["test"] }]
				}
			});

			assert.ok(aChanges.some(function (oChange) { return oChange.getChangeType() === "addCondition"; }), "addCondition change created (PropertyInfo finalized)");
			assert.deepEqual(this.oControl.getFilterConditions(), { dynamicInactive: [{ operator: "EQ", values: ["test"] }] }, "Filter condition (PropertyInfo finalized)");
		});

		QUnit.test("Activate property and apply filter in one call", async function (assert) {
			// Without finalized PropertyInfo
			let aChanges = await StateUtil.applyExternalState(this.oControl, {
				supplementaryConfig: {
					propertyInfo: {
						dynamicInactive: { isActive: true }
					}
				},
				filter: {
					dynamicInactive: [{ operator: "EQ", values: ["test"] }]
				}
			});

			assert.ok(aChanges.some(function (oChange) { return oChange.getChangeType() === "addCondition"; }), "addCondition change created");
			assert.deepEqual(this.oControl.getFilterConditions(), { dynamicInactive: [{ operator: "EQ", values: ["test"] }] }, "Filter condition");

			// Undo and repeat with finalized PropertyInfo
			await StateUtil.applyExternalState(this.oControl, {
				supplementaryConfig: {
					propertyInfo: {
						dynamicInactive: { isActive: false }
					}
				},
				filter: {
					dynamicInactive: [{ operator: "EQ", values: ["test"], filtered: false }]
				}
			});
			await this.oControl.finalizePropertyHelper();

			aChanges = await StateUtil.applyExternalState(this.oControl, {
				supplementaryConfig: {
					propertyInfo: {
						dynamicInactive: { isActive: true }
					}
				},
				filter: {
					dynamicInactive: [{ operator: "EQ", values: ["test"] }]
				}
			});

			assert.ok(aChanges.some(function (oChange) { return oChange.getChangeType() === "addCondition"; }), "addCondition change created (PropertyInfo finalized)");
			assert.deepEqual(this.oControl.getFilterConditions(), { dynamicInactive: [{ operator: "EQ", values: ["test"] }] }, "Filter condition (PropertyInfo finalized)");
		});

		QUnit.test("Add item and activate property in one call", async function (assert) {
			// Without finalized PropertyInfo
			let aChanges = await StateUtil.applyExternalState(this.oControl, {
				supplementaryConfig: {
					propertyInfo: {
						dynamicNotInShadow: { isActive: true }
					}
				},
				items: [{ key: "dynamicNotInShadow", position: 0 }]
			});
			await this.oControl.awaitPendingModification();

			assert.ok(aChanges.some(function (oChange) { return oChange.getChangeType() === oConfig.addItemChangeType; }),
				oConfig.addItemChangeType + " change created"
			);

			const oAddChange = aChanges.find(function (oChange) { return oChange.getChangeType() === oConfig.addItemChangeType; });
			assert.strictEqual(oAddChange.getContent().index, 0, "Flex change carries the propertyKeys-space position");

			assert.deepEqual(
				this.oControl.getPropertyKeys(),
				["dynamicNotInShadow", "dynamicInactive", "staticProp1", "staticProp2", "dynamicActive"],
				"dynamicNotInShadow added at index 0"
			);
			assert.deepEqual(
				oConfig.getItems(this.oControl).map(function (oItem) { return oItem.getPropertyKey(); }),
				["dynamicNotInShadow", "staticProp1", "staticProp2", "dynamicActive"],
				"dynamicNotInShadow is the first active item"
			);

			// Undo and repeat with finalized PropertyInfo
			await StateUtil.applyExternalState(this.oControl, {
				supplementaryConfig: {
					propertyInfo: {
						dynamicNotInShadow: { isActive: false }
					}
				},
				items: [{ key: "dynamicNotInShadow", visible: false }]
			});
			await this.oControl.awaitPendingModification();
			await this.oControl.finalizePropertyHelper();

			aChanges = await StateUtil.applyExternalState(this.oControl, {
				supplementaryConfig: {
					propertyInfo: {
						dynamicNotInShadow: { isActive: true }
					}
				},
				items: [{ key: "dynamicNotInShadow", position: 0 }]
			});
			await this.oControl.awaitPendingModification();

			assert.ok(aChanges.some(function (oChange) { return oChange.getChangeType() === oConfig.addItemChangeType; }),
				oConfig.addItemChangeType + " change created (PropertyInfo finalized)"
			);

			const oAddChangeFinalized = aChanges.find(function (oChange) { return oChange.getChangeType() === oConfig.addItemChangeType; });
			assert.strictEqual(oAddChangeFinalized.getContent().index, 0,
				"Flex change carries the propertyKeys-space position (PropertyInfo finalized)");

			assert.deepEqual(
				this.oControl.getPropertyKeys(),
				["dynamicNotInShadow", "dynamicInactive", "staticProp1", "staticProp2", "dynamicActive"],
				"dynamicNotInShadow added at index 0 (PropertyInfo finalized)"
			);
			assert.deepEqual(
				oConfig.getItems(this.oControl).map(function (oItem) { return oItem.getPropertyKey(); }),
				["dynamicNotInShadow", "staticProp1", "staticProp2", "dynamicActive"],
				"dynamicNotInShadow is the first active item (PropertyInfo finalized)"
			);
		});

		if (oConfig.name === "Table") {
			QUnit.test("Apply sorter for inactive property", async function (assert) {
				const aChanges = await StateUtil.applyExternalState(this.oControl, {
					sorters: [{ key: "dynamicInactive", descending: false }]
				});

				assert.ok(aChanges.some(function (oChange) { return oChange.getChangeType() === "addSort"; }), "addSort change created");
				assert.deepEqual(this.oControl.getSortConditions().sorters, [{
					key: "dynamicInactive",
					/**
					 * @deprecated As of version 1.124.0
					 */
					name: "dynamicInactive", descending: false
				}],
					"Sort condition");
			});

			QUnit.test("Apply groupLevel for inactive property", async function (assert) {
				const aChanges = await StateUtil.applyExternalState(this.oControl, {
					groupLevels: [{ key: "dynamicInactive" }]
				});

				assert.ok(aChanges.some(function (oChange) { return oChange.getChangeType() === "addGroup"; }), "addGroup change created");
				assert.deepEqual(this.oControl.getGroupConditions().groupLevels, [{
					key: "dynamicInactive",
					/**
						* @deprecated As of version 1.124.0
						*/
					name: "dynamicInactive"
				}],
					"Group condition");
			});

			QUnit.test("Apply aggregate for inactive property", async function (assert) {
				const aChanges = await StateUtil.applyExternalState(this.oControl, {
					aggregations: { dynamicInactive: {} }
				});

				assert.ok(aChanges.some(function (oChange) { return oChange.getChangeType() === "addAggregate"; }), "addAggregate change created");
				assert.deepEqual(this.oControl.getAggregateConditions(), { dynamicInactive: {} }, "Aggregate condition");
			});

			QUnit.test("Activate property and apply sorter in one call", async function (assert) {
				// Without finalized PropertyInfo
				let aChanges = await StateUtil.applyExternalState(this.oControl, {
					supplementaryConfig: {
						propertyInfo: {
							dynamicInactive: { isActive: true }
						}
					},
					sorters: [{ key: "dynamicInactive", descending: true }]
				});

				assert.ok(aChanges.some(function (oChange) { return oChange.getChangeType() === "setPropertyAttribute"; }), "setPropertyAttribute change created");
				assert.ok(aChanges.some(function (oChange) { return oChange.getChangeType() === "addSort"; }), "addSort change created");
				assert.deepEqual(this.oControl.getSortConditions().sorters, [{
					key: "dynamicInactive",
					/**
						* @deprecated As of version 1.124.0
						*/
					name: "dynamicInactive", descending: true
				}],
					"Sort condition");

				// Undo and repeat with finalized PropertyInfo
				await StateUtil.applyExternalState(this.oControl, {
					supplementaryConfig: {
						propertyInfo: {
							dynamicInactive: { isActive: false }
						}
					},
					sorters: [{ key: "dynamicInactive", sorted: false }]
				});
				await this.oControl.finalizePropertyHelper();

				aChanges = await StateUtil.applyExternalState(this.oControl, {
					supplementaryConfig: {
						propertyInfo: {
							dynamicInactive: { isActive: true }
						}
					},
					sorters: [{ key: "dynamicInactive", descending: true }]
				});

				assert.ok(aChanges.some(function (oChange) { return oChange.getChangeType() === "setPropertyAttribute"; }), "setPropertyAttribute change created (PropertyInfo finalized)");
				assert.ok(aChanges.some(function (oChange) { return oChange.getChangeType() === "addSort"; }), "addSort change created (PropertyInfo finalized)");
				assert.deepEqual(this.oControl.getSortConditions().sorters, [{
					key: "dynamicInactive",
					/**
					 * @deprecated As of version 1.124.0
					 */
					name: "dynamicInactive",
					descending: true
				}],
					"Sort condition (PropertyInfo finalized)");
			});

			QUnit.test("Activate property and apply groupLevel in one call", async function (assert) {
				// Without finalized PropertyInfo
				let aChanges = await StateUtil.applyExternalState(this.oControl, {
					supplementaryConfig: {
						propertyInfo: {
							dynamicInactive: { isActive: true }
						}
					},
					groupLevels: [{ key: "dynamicInactive" }]
				});

				assert.ok(aChanges.some(function (oChange) { return oChange.getChangeType() === "setPropertyAttribute"; }), "setPropertyAttribute change created");
				assert.ok(aChanges.some(function (oChange) { return oChange.getChangeType() === "addGroup"; }), "addGroup change created");
				assert.deepEqual(this.oControl.getGroupConditions().groupLevels, [{
					key: "dynamicInactive",
					/**
					 * @deprecated As of version 1.124.0
					 */
					name: "dynamicInactive"
				}],
					"Group condition set for activated property");

				// Undo and repeat with finalized PropertyInfo
				await StateUtil.applyExternalState(this.oControl, {
					supplementaryConfig: {
						propertyInfo: {
							dynamicInactive: { isActive: false }
						}
					},
					groupLevels: [{ key: "dynamicInactive", grouped: false }]
				});
				await this.oControl.finalizePropertyHelper();

				aChanges = await StateUtil.applyExternalState(this.oControl, {
					supplementaryConfig: {
						propertyInfo: {
							dynamicInactive: { isActive: true }
						}
					},
					groupLevels: [{ key: "dynamicInactive" }]
				});

				assert.ok(aChanges.some(function (oChange) { return oChange.getChangeType() === "setPropertyAttribute"; }), "setPropertyAttribute change created (PropertyInfo finalized)");
				assert.ok(aChanges.some(function (oChange) { return oChange.getChangeType() === "addGroup"; }), "addGroup change created (PropertyInfo finalized)");
				assert.deepEqual(this.oControl.getGroupConditions().groupLevels, [{
					key: "dynamicInactive",
					/**
					 * @deprecated As of version 1.124.0
					 */
					name: "dynamicInactive"
				}],
					"Group condition set for activated property (PropertyInfo finalized)");
			});

			QUnit.test("Activate property and apply aggregate in one call", async function (assert) {
				// Without finalized PropertyInfo
				let aChanges = await StateUtil.applyExternalState(this.oControl, {
					supplementaryConfig: {
						propertyInfo: {
							dynamicInactive: { isActive: true }
						}
					},
					aggregations: { dynamicInactive: {} }
				});

				assert.ok(aChanges.some(function (oChange) { return oChange.getChangeType() === "setPropertyAttribute"; }), "setPropertyAttribute change created");
				assert.ok(aChanges.some(function (oChange) { return oChange.getChangeType() === "addAggregate"; }), "addAggregate change created");
				assert.deepEqual(this.oControl.getAggregateConditions(), { dynamicInactive: {} }, "Aggregate condition set for activated property");

				// Undo and repeat with finalized PropertyInfo
				await StateUtil.applyExternalState(this.oControl, {
					supplementaryConfig: {
						propertyInfo: {
							dynamicInactive: { isActive: false }
						}
					},
					aggregations: { dynamicInactive: { aggregated: false } }
				});
				await this.oControl.finalizePropertyHelper();

				aChanges = await StateUtil.applyExternalState(this.oControl, {
					supplementaryConfig: {
						propertyInfo: {
							dynamicInactive: { isActive: true }
						}
					},
					aggregations: { dynamicInactive: {} }
				});

				assert.ok(aChanges.some(function (oChange) { return oChange.getChangeType() === "setPropertyAttribute"; }), "setPropertyAttribute change created (PropertyInfo finalized)");
				assert.ok(aChanges.some(function (oChange) { return oChange.getChangeType() === "addAggregate"; }), "addAggregate change created (PropertyInfo finalized)");
				assert.deepEqual(this.oControl.getAggregateConditions(), { dynamicInactive: {} }, "Aggregate condition set for activated property (PropertyInfo finalized)");
			});
		}

		function fnConfirmInitialState(oUiComponent, oViewAfterAction, assert) {
			const oControl = oViewAfterAction.byId("myControl");
			assert.deepEqual(
				oControl.getPropertyKeys(),
				["dynamicInactive", "staticProp1", "staticProp2", "dynamicActive"],
				"propertyKeys: initial 4 entries"
			);
			assert.deepEqual(
				oConfig.getItems(oControl).map(function (oItem) { return oItem.getPropertyKey(); }),
				["staticProp1", "staticProp2", "dynamicActive"],
				"Aggregation: initial 3 items"
			);
		}

		elementActionTest(oConfig.name + " end-to-end: Add at propertyKeys index 1, redo preserves position", {
			xmlView: oConfig.view,
			jsOnly: true,
			action: {
				name: "settings",
				controlId: "myControl",
				parameter: function () {
					return {
						changeType: oConfig.addItemChangeType,
						content: { key: "newProp", index: 1 }
					};
				}
			},
			changesAfterCondensing: 1,
			afterAction: function (oUiComponent, oViewAfterAction, assert) {
				const oControl = oViewAfterAction.byId("myControl");
				assert.deepEqual(
					oControl.getPropertyKeys(),
					["dynamicInactive", "newProp", "staticProp1", "staticProp2", "dynamicActive"],
					"After add: newProp at propertyKeys index 1"
				);
				assert.deepEqual(
					oConfig.getItems(oControl).map(function (oItem) { return oItem.getPropertyKey(); }),
					["newProp", "staticProp1", "staticProp2", "dynamicActive"],
					"After add: newProp at aggregation index 0"
				);
			},
			afterUndo: fnConfirmInitialState,
			afterRedo: function (oUiComponent, oViewAfterAction, assert) {
				const oControl = oViewAfterAction.byId("myControl");
				assert.deepEqual(
					oControl.getPropertyKeys(),
					["dynamicInactive", "newProp", "staticProp1", "staticProp2", "dynamicActive"],
					"After redo (post-condenser): newProp still at propertyKeys index 1"
				);
				assert.deepEqual(
					oConfig.getItems(oControl).map(function (oItem) { return oItem.getPropertyKey(); }),
					["newProp", "staticProp1", "staticProp2", "dynamicActive"],
					"After redo (post-condenser): newProp at aggregation index 0"
				);
			}
		});

		elementActionTest(oConfig.name + " condensing: Single move preserves propertyKeys index on redo", {
			xmlView: oConfig.view,
			jsOnly: true,
			action: {
				name: "settings",
				controlId: "myControl",
				parameter: function () {
					return {
						changeType: oConfig.moveItemChangeType,
						content: { key: "staticProp1", index: 3 }
					};
				}
			},
			changesAfterCondensing: 1,
			afterAction: function (oUiComponent, oViewAfterAction, assert) {
				const oControl = oViewAfterAction.byId("myControl");
				assert.deepEqual(
					oControl.getPropertyKeys(),
					["dynamicInactive", "staticProp2", "dynamicActive", "staticProp1"],
					"After move: staticProp1 at propertyKeys index 3"
				);
				assert.deepEqual(
					oConfig.getItems(oControl).map(function (oItem) { return oItem.getPropertyKey(); }),
					["staticProp2", "dynamicActive", "staticProp1"],
					"After move: staticProp1 at aggregation index 2"
				);
			},
			afterUndo: fnConfirmInitialState,
			afterRedo: function (oUiComponent, oViewAfterAction, assert) {
				const oControl = oViewAfterAction.byId("myControl");
				assert.deepEqual(
					oControl.getPropertyKeys(),
					["dynamicInactive", "staticProp2", "dynamicActive", "staticProp1"],
					"After redo (post-condenser): staticProp1 still at propertyKeys index 3"
				);
				assert.deepEqual(
					oConfig.getItems(oControl).map(function (oItem) { return oItem.getPropertyKey(); }),
					["staticProp2", "dynamicActive", "staticProp1"],
					"After redo (post-condenser): staticProp1 at aggregation index 2"
				);
			}
		});

		elementActionTest(oConfig.name + " condensing: Add + remove condensed to 0", {
			xmlView: oConfig.view,
			jsOnly: true,
			action: {
				name: "settings",
				controlId: "myControl",
				parameter: function () {
					return {
						changeType: oConfig.removeItemChangeType,
						content: { key: "newProp" }
					};
				}
			},
			previousActions: [{
				name: "settings",
				controlId: "myControl",
				parameter: function () {
					return {
						changeType: oConfig.addItemChangeType,
						content: { key: "newProp", index: 1 }
					};
				}
			}],
			changesAfterCondensing: 0,
			afterAction: fnConfirmInitialState,
			afterUndo: function (oUiComponent, oViewAfterAction, assert) {
				const oControl = oViewAfterAction.byId("myControl");
				assert.deepEqual(
					oControl.getPropertyKeys(),
					["dynamicInactive", "staticProp1", "staticProp2", "dynamicActive"],
					"After undo: initial state (add was also undone)"
				);
			},
			afterRedo: fnConfirmInitialState
		});
	}

	aTestConfigurations.forEach((oConfig) => {
		defineTestModules(oConfig);
	});
});
