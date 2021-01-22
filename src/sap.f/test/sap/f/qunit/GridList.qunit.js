/*global QUnit, sinon */

sap.ui.define([
	"sap/ui/Device",
	"sap/f/GridList",
	"sap/f/library",
	"sap/ui/layout/cssgrid/GridBoxLayout",
	"sap/m/CustomListItem",
	"sap/f/GridListItem",
	"sap/m/VBox",
	"sap/m/Text",
	"sap/m/Button",
	"sap/m/GroupHeaderListItem",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Sorter",
	"sap/ui/core/Core",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/events/KeyCodes"
],
function (
	Device,
	GridList,
	fLibrary,
	GridBoxLayout,
	CustomListItem,
	GridListItem,
	VBox,
	Text,
	Button,
	GroupHeaderListItem,
	JSONModel,
	Sorter,
	Core,
	qutils,
	KeyCodes
) {
	"use strict";

	var DOM_RENDER_LOCATION = "qunit-fixture";

	var NavigationDirection = fLibrary.NavigationDirection;

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
		oGrid.destroy();
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
		oGrid.destroy();
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

		oGrid.destroy();
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
				addDelegate: that.oSpyAddDelegate,
				removeEventDelegate: that.oSpyRemoveDelegate,
				isA: function () {
					return false;
				}
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
				addDelegate: that.oSpyAddDelegate,
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

		oClone.destroy();
	});

	QUnit.module("Grouping and Growing", {
		beforeEach: function () {
			this.oGrid = new GridList({
				growing: true,
				growingThreshold: 4,
				customLayout: new GridBoxLayout({
					boxWidth: "200px"
				}),
				items: {
					path: "/Objects",
					sorter: new Sorter("Category", false, true),
					groupHeaderFactory: function (oGroup) {
						return new GroupHeaderListItem({
							title: oGroup.key
						});
					},
					template: new CustomListItem({
						content: new VBox({
							items: new Text({
								text: "{Name}"
							})
						})
					})
				}
			});

			var oData = {
				Objects: [
					{ Name: "1", Category: "A" },
					{ Name: "2 ashfash ashfash ashfash ashfash ashfashasg asga sga sg ashfash ashfash", Category: "B" },
					{ Name: "3", Category: "A" },
					{ Name: "4", Category: "B" },
					{ Name: "5 ashfash ashfash ashfash ashfash ashfashasg asga sga sg ashfash ashfash ashfash ashfash ashfash ashfash ashfashasg asga sga sg ashfash ashfash", Category: "B" },
					{ Name: "6", Category: "B" },
					{ Name: "7", Category: "A" },
					{ Name: "8", Category: "A" },
					{ Name: "9", Category: "A" },
					{ Name: "10", Category: "A" },
					{ Name: "11", Category: "B" },
					{ Name: "12 ashfash ashfash ashfash ashfash ashfashasg asga sga sg ashfash ashfashashfash ashfash ashfash ashfash ashfashasg asga sga sg ashfash ashfash ashfash ashfash ashfash ashfash ashfashasg asga sga sg ashfash ashfashashfash ashfash ashfash ashfash ashfashasg asga sga sg ashfash ashfash ashfash ashfash ashfash ashfash ashfashasg asga sga sg ashfash ashfashashfash ashfash ashfash ashfash ashfashasg asga sga sg ashfash ashfash ashfash ashfash ashfash ashfash ashfashasg asga sga sg ashfash ashfashashfash ashfash ashfash ashfash ashfashasg asga sga sg ashfash ashfash", Category: "B" },
					{ Name: "13", Category: "B" },
					{ Name: "14", Category: "B" },
					{ Name: "25", Category: "B" }
				]
			};
			var oModel = new JSONModel();
			oModel.setData(oData);

			this.oGrid.setModel(oModel);

			this.oGrid.placeAt(DOM_RENDER_LOCATION);
			Core.applyChanges();
		},
		afterEach: function () {
			this.oGrid.destroy();
		}
	});

	QUnit.test("Equalize items height manually when grouping is on", function (assert) {

		// Arrange
		var oListTrigger = this.oGrid._oGrowingDelegate._getTrigger();

		// Assert
		checkHeights(this.oGrid, assert);

		// Act
		oListTrigger.ontap(new jQuery.Event());
		this.clock.tick(500);

		// Assert
		checkHeights(this.oGrid, assert);

		// Act
		oListTrigger.ontap(new jQuery.Event());
		this.clock.tick(500);

		// Assert
		checkHeights(this.oGrid, assert);
	});

	QUnit.test("Add/Remove sorters", function (assert) {
		var oGroupHeaderDomRef;

		assert.ok(this.oGrid.$().find("ul").hasClass("sapFGridListGroup"), "sapFGridListGroup is set");

		if (!Device.browser.msie) {
			oGroupHeaderDomRef = this.oGrid.$().find(".sapMGHLI")[0];
			assert.ok(window.getComputedStyle(oGroupHeaderDomRef).gridColumnEnd.indexOf("-1") > -1, "grid column is correctly set");
		}

		// remove the sorters
		this.oGrid.getBinding("items").sort([]);
		this.oGrid.invalidate();
		Core.applyChanges();

		// add sorter
		this.oGrid.getBinding("items").sort([new Sorter("Category", false, true)]);
		Core.applyChanges();

		assert.ok(this.oGrid.$().find("ul").hasClass("sapFGridListGroup"), "sapFGridListGroup is set");

		if (!Device.browser.msie) {
			oGroupHeaderDomRef = this.oGrid.$().find(".sapMGHLI")[0];
			assert.ok(window.getComputedStyle(oGroupHeaderDomRef).gridColumnEnd.indexOf("-1") > -1, "grid column is correctly  set");
		}
	});

	QUnit.test("Focus position is reset after pressing on 'More' button", function (assert) {
		// Arrange
		var oListTrigger = this.oGrid._oGrowingDelegate._getTrigger();

		// Act
		oListTrigger.ontap(new jQuery.Event());
		this.clock.tick(500);

		// Assert
		assert.strictEqual(this.oGrid._oItemNavigation._mCurrentPosition, null, "Position is reset after growing");
	});

	function checkHeights (oGrid, assert) {
		var bEqualHeights = true;
		var iHeight = oGrid.getItems()[1].$().outerHeight(); // Take the first non-group header item.
		oGrid.getItems().forEach(function (oItem) {
			if (!oItem.isGroupHeader() && oItem.$().outerHeight() !== iHeight) {
				bEqualHeights = false;
			}
		});
		assert.ok(bEqualHeights, "All items should have equal heights");
	}

	QUnit.module("Rendering", {
		beforeEach: function () {
			this.oGridList = new GridList({
				customLayout: new GridBoxLayout({
					boxWidth: "200px"
				}),
				items: [
					new GridListItem({}),
					new GridListItem({}),
					new GridListItem({})
				]
			});

			this.oGridList.placeAt(DOM_RENDER_LOCATION);
			Core.applyChanges();
		},
		afterEach: function () {
			this.oGridList.destroy();
		}
	});

	QUnit.test("Busy element inside the GridList", function (assert) {

		// Arrange
		var oItem = this.oGridList.getItems()[0];
		oItem.setBusyIndicatorDelay(0);
		Core.applyChanges();
		var oItemPositionBeforeBusy = oItem.$().position(),
			oItemPositionAfterBusy;

		// Act
		oItem.setBusy(true);

		// Arrange
		oItemPositionAfterBusy = oItem.$().position();

		// Assert
		assert.strictEqual(oItemPositionBeforeBusy.top, oItemPositionAfterBusy.top, "The element should NOT be moved vertically after it gets busy");
		assert.strictEqual(oItemPositionBeforeBusy.left, oItemPositionAfterBusy.left, "The element should NOT be moved horizontally after it gets busy");
	});

	QUnit.module("Keyboard handling", {
		beforeEach: function () {
			this.oGridList = new GridList({
				customLayout: new GridBoxLayout({
					boxesPerRowConfig: "XL2 L2 M2 S2"
				}),
				items: [
					new GridListItem({
						content: [
							new Text({ text: "This is the content"}),
							new Button({ text: "Button" })
						]
					}),
					new GridListItem({
						content: [
							new Text({ text: "This is the content"})
						]
					}),
					new GridListItem({
						content: [
							new Text({ text: "This is the content"})
						]
					}),
					new GridListItem({
						content: [
							new Text({ text: "This is the content"})
						]
					})
				]
			});

			this.oGridList.placeAt(DOM_RENDER_LOCATION);
			Core.applyChanges();
		},
		afterEach: function () {
			this.oGridList.destroy();
		}
	});

	QUnit.test("Right/Down Arrow navigating trough grid list", function (assert) {

		// Arrange
		var oItem1 = this.oGridList.getItems()[0],
			oItem2 = this.oGridList.getItems()[1],
			oItem4 = this.oGridList.getItems()[3];
		this.oGridList.$().trigger("focusin");

		// Act
		qutils.triggerKeydown(oItem1.$(), KeyCodes.ARROW_RIGHT, false, false, false);

		// Assert
		assert.strictEqual(document.activeElement, oItem2.getFocusDomRef(), "Focus moved from first to second");

		// Act
		qutils.triggerKeydown(oItem2.$(), KeyCodes.ARROW_DOWN, false, false, false);

		// Assert
		assert.strictEqual(document.activeElement, oItem4.getFocusDomRef(), "Focus moved from second to fourth item");
	});

	QUnit.test("Left/Up Arrow navigating trough grid list", function (assert) {

		// Arrange
		var oItem1 = this.oGridList.getItems()[0],
			oItem3 = this.oGridList.getItems()[2],
			oItem4 = this.oGridList.getItems()[3];
		this.oGridList.$().trigger("focusin");

		// Act
		qutils.triggerKeydown(oItem4.$(), KeyCodes.ARROW_LEFT, false, false, false);

		// Assert
		assert.strictEqual(document.activeElement, oItem3.getFocusDomRef(), "Focus moved from fourth to third item");

		// Act
		qutils.triggerKeydown(oItem3.$(), KeyCodes.ARROW_UP, false, false, false);

		// Assert
		assert.strictEqual(document.activeElement, oItem1.getFocusDomRef(), "Focus moved from third to first item");
	});

	QUnit.test("Left/Right Arrow when the focus is inside an item", function (assert) {

		// Arrange
		var oButton = this.oGridList.getItems()[0].getContent()[1];

		oButton.focus();
		Core.applyChanges();

		// Act
		qutils.triggerKeydown(oButton.$(), KeyCodes.ARROW_LEFT, false, false, false);

		// Assert
		assert.strictEqual(document.activeElement, oButton.getFocusDomRef(), "Focus should remains on the button");

		// Act
		qutils.triggerKeydown(oButton.$(), KeyCodes.ARROW_RIGHT, false, false, false);

		// Assert
		assert.strictEqual(document.activeElement, oButton.getFocusDomRef(), "Focus should remains on the button");
	});

	QUnit.module("Keyboard handling with grouping", {
		beforeEach: function () {
			this.oGrid = new GridList({
				customLayout: new GridBoxLayout({
					boxesPerRowConfig: "XL2 L2 M2 S2"
				}),
				items: {
					path: "/Objects",
					sorter: new Sorter("Category", false, true),
					template: new CustomListItem({
						content: new VBox({
							items: new Text({
								text: "{Name}"
							})
						})
					})
				}
			});

			var oData = {
				Objects: [
					{ Name: "1", Category: "A" },
					{ Name: "2", Category: "A" },
					{ Name: "3", Category: "B" },
					{ Name: "4", Category: "B" }
				]
			};
			this.oGrid.setModel(new JSONModel(oData));
			this.oGrid.placeAt(DOM_RENDER_LOCATION);
			Core.applyChanges();
		},
		afterEach: function () {
			this.oGrid.destroy();
		}
	});

	QUnit.test("Down Arrow when focus goes through group header", function (assert) {
		// Arrange
		var oItemName2 = this.oGrid.getItems()[2],
			oGroupHeader = this.oGrid.getItems()[3],
			oItemName4 = this.oGrid.getItems()[5];
		this.oGrid.$().trigger("focusin");

		// Act
		qutils.triggerKeydown(oItemName2.$(), KeyCodes.ARROW_DOWN, false, false, false);

		// Assert
		assert.strictEqual(document.activeElement, oGroupHeader.getFocusDomRef(), "Focus moved from second item to group header (column is preserved)");

		// Act
		qutils.triggerKeydown(oGroupHeader.$(), KeyCodes.ARROW_DOWN, false, false, false);

		// Assert
		assert.strictEqual(document.activeElement, oItemName4.getFocusDomRef(), "Focus moved from group header to fourth item (column is preserved)");
	});

	QUnit.test("Up Arrow when focus goes through group header", function (assert) {
		// Arrange
		var oItemName2 = this.oGrid.getItems()[2],
			oGroupHeader = this.oGrid.getItems()[3],
			oItemName4 = this.oGrid.getItems()[5];
		this.oGrid.$().trigger("focusin");

		// Act
		qutils.triggerKeydown(oItemName4.$(), KeyCodes.ARROW_UP, false, false, false);

		// Assert
		assert.strictEqual(document.activeElement, oGroupHeader.getFocusDomRef(), "Focus moved from fourth item to group header (column is preserved)");

		// Act
		qutils.triggerKeydown(oGroupHeader.$(), KeyCodes.ARROW_UP, false, false, false);

		// Assert
		assert.strictEqual(document.activeElement, oItemName2.getFocusDomRef(), "Focus moved from group header to second item (column is preserved)");
	});


	QUnit.module("Events");

	QUnit.test("'borderReached' event is fired at all directions", function (assert) {
		// Arrange
		var oGridList = new GridList();

		[
			NavigationDirection.Down,
			NavigationDirection.Left,
			NavigationDirection.Right,
			NavigationDirection.Up
		].forEach(function (sDir) {
			var oSpy = sinon.spy();
			oGridList.attachBorderReached(oSpy);

			// Act
			oGridList.onItemNavigationBorderReached({
				direction: sDir
			});

			// Assert
			assert.strictEqual(oSpy.callCount, 1, "'borderReached' event is fired");
		});

		// Clean up
		oGridList.destroy();
	});

	QUnit.test("'borderReached' event when Arrow Down is pressed and growing is enabled", function (assert) {
		// Arrange
		var oGridList = new GridList({
			growing: true,
			growingThreshold: 4,
			items: {
				path: "/",
				template: new GridListItem({
					content: [
						new Text({ text: "This is the content"})
					]
				})
			}
		});

		oGridList.setModel(new JSONModel([
			"item1", "item2", "item3", "item4",
			"item5", "item6", "item7", "item8"
		]));

		var oSpy = sinon.spy();
		oGridList.attachBorderReached(oSpy);
		oGridList.placeAt(DOM_RENDER_LOCATION);
		Core.applyChanges();

		// Act
		oGridList.onItemNavigationBorderReached({
			direction: NavigationDirection.Down
		});

		// Assert
		assert.ok(oSpy.notCalled, "'borderReached' event is not fired when there is 'More' button");

		// Clean up
		oGridList.destroy();
	});

	QUnit.module("Navigation matrix", {
		beforeEach: function () {
			this.oGridList = new GridList();
			this.oGridList.placeAt(DOM_RENDER_LOCATION);
			Core.applyChanges();
		},
		afterEach: function () {
			this.oGridList.destroy();
		}
	});

	QUnit.test("Matrix creation", function (assert) {
		// Arrange
		sinon.stub(Core, "isThemeApplied").returns(false);

		// Assert
		assert.strictEqual(this.oGridList.getNavigationMatrix(), null, "'null' is returned when theme is not yet loaded");

		// Clean up
		Core.isThemeApplied.restore();
	});
});
