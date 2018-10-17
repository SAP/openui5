/*global QUnit, sinon */

sap.ui.define([
	"sap/f/GridList",
	"sap/ui/core/Core"
],
function (
	GridList,
	Core
) {
	"use strict";

	var DOM_RENDER_LOCATION = "qunit-fixture";

	QUnit.module("Init");

	QUnit.test("Initialization", function (assert) {

		// Arrange
		sinon.spy(GridList.prototype, "_addGridLayoutDelegate");

		// Act
		var oGrid = new GridList();

		// Assert
		assert.ok(oGrid.isA("sap.ui.layout.cssgrid.IGridConfigurable"), "Grid should be of type sap.ui.layout.GridList.IGridConfigurable");
		assert.ok(oGrid._oGridObserver && oGrid._oGridObserver.isObserved(oGrid, { aggregations: ["items"] }), "Grid items aggregation should be observed");

		assert.equal(oGrid.getItems().length, 0, "Grid should have no items");
		assert.notOk(oGrid.getCustomLayout(), "customLayout should be unset");

		assert.ok(GridList.prototype._addGridLayoutDelegate.calledOnce, "GridLayoutDelegate should be initialized");
		assert.ok(oGrid.oGridLayoutDelegate, "GridLayoutDelegate initialized");

		// Cleanup
		GridList.prototype._addGridLayoutDelegate.restore();
	});

	QUnit.test("IGridConfigurable Interface implementation", function (assert) {

		// Arrange
		var bGetGridDomRefs = GridList.prototype.getGridDomRefs && (typeof GridList.prototype.getGridDomRefs === "function"),
			bGetGridLayoutConfiguration = GridList.prototype.getGridLayoutConfiguration && (typeof GridList.prototype.getGridLayoutConfiguration === "function");

		// Assert
		assert.ok(bGetGridDomRefs, "getGridDomRefs should be implemented");
		assert.ok(bGetGridLayoutConfiguration, "getGridLayoutConfiguration should be implemented");
	});

	QUnit.test("IGridConfigurable Interface implementation - getGridDomRefs", function (assert) {

		// Arrange
		var oGrid = new GridList();

		sinon.stub(GridList.prototype, "getDomRef", function () {
			return { test: "test" };
		});

		// Act
		var aGridDomRefs = oGrid.getGridDomRefs();

		// Assert
		assert.ok(Array.isArray(aGridDomRefs), "getGridDomRefs should return an array");
		assert.equal(aGridDomRefs.length, 1, "Should have only one dom ref");
		assert.equal(aGridDomRefs[0].test, "test", "Should have the correct dom ref");

		// Cleanup
		GridList.prototype.getDomRef.restore();
	});

	QUnit.test("IGridConfigurable Interface implementation - getGridLayoutConfiguration default", function (assert) {

		// Arrange
		var oGrid = new GridList();

		oGrid.placeAt(DOM_RENDER_LOCATION);
		Core.applyChanges();

		// Act
		var oLayout = oGrid.getGridLayoutConfiguration();

		// Assert
		assert.notOk(oLayout, "Should not have a default GridLayoutBase aggregation set");
		assert.ok(oGrid.getItemsContainerDomRef().classList.contains("sapFGridListDefault"), "Should have grid layout set with class 'sapFGridListDefault'");
	});

	QUnit.module("Destroy");

	QUnit.test("Delegate", function (assert) {

		// Arrange
		sinon.spy(GridList.prototype, "_removeGridLayoutDelegate");

		var oGrid = new GridList();

		// Act
		oGrid.destroy();

		// Assert
		assert.ok(GridList.prototype._removeGridLayoutDelegate.calledOnce, "Should call _removeGridLayoutDelegate on exit");
		assert.ok(oGrid.oGridLayoutDelegate === null, "Should destroy GridLayoutDelegate on exit");

		// Cleanup
		GridList.prototype._removeGridLayoutDelegate.restore();
	});

	QUnit.test("Observer", function (assert) {

		// Arrange
		var oGrid = new GridList();

		// Act
		oGrid.destroy();

		// Assert
		assert.ok(oGrid._oGridObserver === null, "Should destroy observer on exit");
	});

	QUnit.module("_onGridChange", {
		beforeEach: function () {
			this.oGrid = new GridList();
			this.oSpyAddDelegate = sinon.spy();
			this.oSpyRemoveDelegate = sinon.spy();
		},
		afterEach: function () {
			this.oSpyAddDelegate = null;
			this.oSpyRemoveDelegate = null;
			this.oGrid.destroy();
		}
	});

	QUnit.test("Item inserted", function (assert) {

		// Arrange
		var that = this;

		var oMockChanges = {
			name: "items",
			mutation: "insert",
			child: {
				addEventDelegate: that.oSpyAddDelegate,
				removeEventDelegate: that.oSpyRemoveDelegate
			}
		};

		// Act
		this.oGrid._onGridChange(oMockChanges);

		// Assert
		assert.ok(this.oSpyAddDelegate.calledOnce, "Should add a delegate for an inserted item");
		assert.ok(this.oSpyRemoveDelegate.notCalled, "Should NOT remove a delegate for an inserted item");
	});

	QUnit.test("Item removed", function (assert) {

		// Arrange
		var that = this;

		var oMockChanges = {
			name: "items",
			mutation: "remove",
			child: {
				addEventDelegate: that.oSpyAddDelegate,
				removeEventDelegate: that.oSpyRemoveDelegate
			}
		};

		// Act
		this.oGrid._onGridChange(oMockChanges);

		// Assert
		assert.ok(this.oSpyAddDelegate.notCalled, "Should NOT add a delegate for a removed item");
		assert.ok(this.oSpyRemoveDelegate.calledOnce, "Should remove a delegate for a removed item");
	});

	QUnit.test("Ignore aggregations other than 'items'", function (assert) {

		// Arrange
		var oMockChanges = {
			name: "header",
			mutation: "insert"
		};

		// Act
		this.oGrid._onGridChange(oMockChanges);

		// Assert
		assert.ok(this.oSpyAddDelegate.notCalled, "Should ignore an inserted header aggregation");
		assert.ok(this.oSpyRemoveDelegate.notCalled, "Should ignore a removed header aggregation");
	});

	QUnit.test("Ignore invalid change object", function (assert) {

		// Arrange
		var oMockChanges = {
			name: "items",
			mutation: "insert"
		};

		// Act
		this.oGrid._onGridChange(oMockChanges);

		// Assert
		assert.ok(this.oSpyAddDelegate.notCalled, "Should ignore invalid change object");
		assert.ok(this.oSpyRemoveDelegate.notCalled, "Should ignore invalid change object");
	});

	QUnit.module("Clone", {
		beforeEach: function () {
			this.oGrid = new GridList();
			this.oGrid.placeAt(DOM_RENDER_LOCATION);
			Core.applyChanges();
		},
		afterEach: function () {
			this.oGrid.destroy();
		}
	});

	QUnit.test("Full cloning", function (assert) {

		// Act
		var oClone = this.oGrid.clone();
		oClone.placeAt(DOM_RENDER_LOCATION);
		Core.applyChanges();

		// Assert
		assert.ok(oClone, "Should have successfully cloned the Grid");
	});

});