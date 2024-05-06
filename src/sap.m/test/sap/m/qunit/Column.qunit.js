/*global QUnit */
sap.ui.define([
	"sap/m/Button",
	"sap/m/Column",
	"sap/m/ColumnListItem",
	"sap/m/Label",
	"sap/m/library",
	"sap/m/Page",
	"sap/m/Table",
	"sap/m/Text",
	"sap/m/table/columnmenu/Menu",
	"sap/m/table/columnmenu/QuickAction",
	"sap/m/table/columnmenu/Item",
	"sap/ui/Device",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/ui/thirdparty/jquery"
], function(Button, Column, ColumnListItem, Label, library, Page, Table, Text, ColumnMenu, QuickAction, Item, Device, nextUIUpdate, jQuery) {
	"use strict";

	async function timeout(iDuration) {
		await new Promise((fnResolve) => {
			window.setTimeout(fnResolve, iDuration);
		});
	}

	QUnit.module("popin");

	QUnit.test("Should set demandPopin", function(assert) {
		const fnTestCase = function(initialValue, valueToSet, bShouldInvalidate, expectedValidateToBeCalled) {
			let invalidateWasCalled = false;
			const oColumn = new Column();

			if (bShouldInvalidate) {
				oColumn.setMinScreenWidth("9001px");
			}

			const originalInvalidate = oColumn.invalidate;
			oColumn.invalidate = function() {
				originalInvalidate.call(oColumn);
				invalidateWasCalled = true;
			};

			oColumn.setProperty("demandPopin", initialValue);
			const result = oColumn.setDemandPopin(valueToSet);

			assert.strictEqual(oColumn.getDemandPopin(), valueToSet,"demandPopin was set");
			assert.strictEqual(oColumn,result, "should be chainable");
			if (expectedValidateToBeCalled) {
				assert.equal(bShouldInvalidate, invalidateWasCalled,"invalidate was called");
			}

			oColumn.destroy();
		};

		//Same Value - no invalidate should not be called
		fnTestCase(true, true, true, false);
		fnTestCase(true, true, false, false);
		fnTestCase(false, false, true, false);
		fnTestCase(false, false, false, false);

		//Different Values invalidate should be called
		fnTestCase(true, false, true, true);
		fnTestCase(false, true, true, true);

		//Different Value but invalidate should not be called
		fnTestCase(true, false, false, false);
		fnTestCase(false, true, false, false);
	});

	QUnit.test("Should know that it is a popin", function(assert) {
		const fnTestCase = function(demandsPopin, hasMedia, hasMatchingMedia, expectedResult) {
			const oColumn = new Column();

			if (hasMedia) {
				oColumn._media = { matches: hasMatchingMedia };
			}

			oColumn.setProperty("demandPopin", demandsPopin);
			assert.equal(oColumn.isPopin(), expectedResult);

			oColumn.destroy();
		};

		//Demands no Popin - should always be false
		fnTestCase(false, true, true, false);
		fnTestCase(false, false, true, false);
		fnTestCase(false, true, false, false);
		fnTestCase(false, false, false, false);

		//has no media - should always be false
		fnTestCase(true, false, true, false);
		fnTestCase(true, false, false, false);

		//has no matching media is a popin but it has media - true
		fnTestCase(true, true, false, true);

		//has everything - false
		fnTestCase(true, true, true, false);
	});

	QUnit.module("size and visibility");

	QUnit.test("Should know if it is hidden", function(assert) {
		const fnTestCase = function(expectedResult, hasMedia, hasMatchingMedia, minWidth) {
			const oColumn = new Column();

			if (hasMedia) {
				oColumn._media = { matches: hasMatchingMedia };
			}

			oColumn._minWidth = minWidth;
			assert.strictEqual(oColumn.isHidden(), expectedResult);

			oColumn.destroy();
		};

		//if it has media it should return if media matches
		fnTestCase(false, true, true);
		fnTestCase(true, true, false);

		//no media now it depends on screen and width

		//no screen - false
		fnTestCase(false, false, undefined, true);

		//noMinWidth - false
		fnTestCase(false, false, undefined, 0);
	});

	QUnit.test("Should validate minWidth", function(assert) {
		const fnTestCase = function(width) {
			const oColumn = new Column();

			oColumn._validateMinWidth(width);
			assert.ok(true, "valid minScreenWidth : " + width);

			oColumn.destroy();
		};

		//invalid testcases
		assert.throws(function() { fnTestCase(1); }, /expected string for property "minScreenWidth" of /, "raised error because it expects a string");
		assert.throws(function() { fnTestCase("random string"); }, /or sap.m.ScreenSize enumeration for property/, "raised error because it expects a valid screenSize");
		assert.throws(function() { fnTestCase("eightpx"); }, /or sap.m.ScreenSize enumeration for property/, "raised error because it expects a valid screenSize");
		assert.throws(function() { fnTestCase("5pxa"); }, /or sap.m.ScreenSize enumeration for property/, "raised error because it expects a valid screenSize");
		assert.throws(function() { fnTestCase("-5px"); }, /or sap.m.ScreenSize enumeration for property/, "raised error because it expects a valid screenSize");
		assert.throws(function() { fnTestCase("5%"); }, /or sap.m.ScreenSize enumeration for property/, "raised error because it expects a valid screenSize");

		//valid ones
		fnTestCase("8px");
		fnTestCase("100000em");
		fnTestCase("0rem");

		for (const screenSize in library.ScreenSize) {
			fnTestCase(screenSize);
		}
	});

	QUnit.test("Should know if width is predefined", function(assert) {
		const oColumn = new Column({minScreenWidth : "tablet"});

		assert.strictEqual(oColumn._minWidth, "600px");

		oColumn.destroy();
	});

	QUnit.test("Visible property should not make the column visible when hidden by minScreenWidth", async function(assert) {
		const oTable = new Table({
				contextualWidth: "Desktop",
				columns: [
					new Column()
				]
			}),
			oColumn = new Column({
				minScreenWidth: "Tablet"
			});

		oTable.addColumn(oColumn);
		oTable.placeAt("qunit-fixture");
		await nextUIUpdate();

		assert.ok(oColumn.getVisible(), "Column is visible");
		assert.ok(oColumn.getDomRef(), "Column is rendered");

		oTable.setContextualWidth("Phone");
		await timeout();

		assert.notOk(oColumn.getDomRef(), "Column is not rendered due to minScreenWidth");
		assert.notOk(oTable.hasPopin(), "Table has no popin");

		oColumn.setVisible(false);
		await timeout();

		assert.notOk(oColumn.getDomRef(), "Column is not rendered due to visible=false");

		oColumn.setVisible(true);
		await timeout();

		assert.ok(oColumn.isHidden(), "Column is hidden");
		assert.notOk(oTable.hasPopin(), "Table has no popin");
		assert.notOk(oColumn.getDomRef(), "Column is still not rendered due to minScreenWidth");

		oTable.setContextualWidth("Desktop");
		await timeout();

		assert.notOk(oColumn.isHidden(), "Column is not hidden any more");
		assert.ok(oColumn.getDomRef(), "Column is rendered");

		oTable.destroy();
	});

	QUnit.module("media");

	QUnit.test("Should add media", function(assert) {

		const fnTestCase = function(width,matches) {
			const oColumn = new Column({minScreenWidth: width});

			oColumn._addMedia();

			assert.ok(oColumn._media);
			assert.strictEqual(oColumn._media.matches, matches);

			oColumn.destroy();
		};

		fnTestCase("300000px",false);
		fnTestCase("100px",true);
	});

	QUnit.test("Should clear media", function(assert) {
		const oColumn = new Column({minScreenWidth: "100px"});

		oColumn._addMedia();
		assert.ok(oColumn._media);

		oColumn._clearMedia();
		assert.ok(!oColumn._media);

		oColumn.destroy();
	});

	QUnit.module("events");

	QUnit.test("Media handler should not be attached if the table is not rendered yet", async function (assert) {
		const mediaAttachSpy = this.spy(Device.media, "attachHandler"),
				oColumn = new Column({
					minScreenWidth : "phone"
				}),
				parent = new Table({
					columns : oColumn
				});

		assert.ok(!mediaAttachSpy.called, "Media handler not attached initially");

		parent.placeAt("qunit-fixture");
		await nextUIUpdate();

		assert.ok(mediaAttachSpy.called, "Media handler attached when table is rendered");

		parent.destroy();
	});

	QUnit.test("Media handler should be attached when adding a column to a rendered table", async function (assert) {
		const mediaAttachSpy = this.spy(Device.media, "attachHandler"),
				oColumn = new Column({
					minScreenWidth : "phone"
				}),
				parent = new Table({});

		parent.placeAt("qunit-fixture");
		parent.addColumn(oColumn);
		await nextUIUpdate();

		assert.ok(mediaAttachSpy.called, "Media handler called immediately");

		assert.equal(oColumn.getInitialOrder(), 0, "initial order is correct after rendering");
		parent.removeColumn(oColumn);
		assert.equal(oColumn.getInitialOrder(), -1, "initial order is not cashed and correct after removal");

		parent.destroy();
	});

	QUnit.test("Should notify on resize", async function(assert) {

		//System under Test + Arrange
		const tableResizeSpy = this.spy(Table.prototype, "onColumnResize"),
			oColumn = new Column({
				minScreenWidth : "phone"
			}),
			parent = new Table({
				columns : [new Column(), oColumn]
			});

		// The table needs to be rendered for the column media object to be initialized
		parent.placeAt("qunit-fixture");
		await nextUIUpdate();

		oColumn._notifyResize({from: 240}); // this is the default value for minScreenWidth="phone"
		await timeout();

		assert.ok(!tableResizeSpy.called, "Table resize not called, if media is the same");

		oColumn._notifyResize({from: 0});
		await timeout();

		assert.equal(tableResizeSpy.callCount, 1, "Table resize called, if media is different");

		oColumn.setVisible(false);
		oColumn._notifyResize({from: 100});
		await timeout();
		assert.equal(tableResizeSpy.callCount, 1, "Table resize not called, since column is invisible");

		oColumn.setVisible(true);
		await nextUIUpdate();
		assert.ok(oColumn.getDomRef(), "Visible column is rendered");

		parent.destroy();
	});

	QUnit.test("Should not notify when contextual width is set to a parent container, but this width is in the same range as the device width (when initially rendered without contextual width)", async function (assert) {

		//Setup is a sap.m.Page holding a Table. Setting contextual width on the page affects the table
		const tableResizeSpy = this.spy(Table.prototype, "onColumnResize"),
				oColumn = new Column({
					minScreenWidth : "tablet"
				}),
				parent = new Table({
					columns : oColumn
				}),
				page = new Page({
					content: [parent]
				});

		// The table is rendered without contextual width, the Device.media API is used
		page.placeAt("qunit-fixture");
		await nextUIUpdate();
		await timeout();
		assert.ok(!tableResizeSpy.called, "Initially no resize is needed, table normally rendered as for desktop");

		// Set contextual width to a parent (as for tablet or above) and wait 1 tick for onColumnResize
		page._applyContextualSettings({contextualWidth: 600});
		await timeout();
		assert.equal(tableResizeSpy.callCount, 0, "After applying contextual width to a parent container, but this width is in the same range, onColumnResize is not called");

		page.destroy();
	});

	QUnit.test("Should notify when contextual width is set to a parent container, and this width is in a different range compared to device width (when initially rendered without contextual width)", async function (assert) {

		//Setup is a sap.m.Page holding a Table. Setting contextual width on the page affects the table
		const tableResizeSpy = this.spy(Table.prototype, "onColumnResize"),
				oColumn = new Column({
					minScreenWidth : "tablet"
				}),
				parent = new Table({
					columns : [new Column(), oColumn]
				}),
				page = new Page({
					content: [parent]
				});

		// The table is rendered without contextual width, the Device.media API is used
		page.placeAt("qunit-fixture");
		await nextUIUpdate();
		await timeout();

		assert.ok(!tableResizeSpy.called, "Initially no resize is needed, table normally rendered as for desktop");

		// Set contextual width to a parent (as for phone) and wait 1 tick for onColumnResize
		page._applyContextualSettings({contextualWidth: 100});
		await timeout();
		assert.equal(tableResizeSpy.callCount, 1, "After applying contextual width to a parent container, and this width is in a different range, onColumnResize is called");

		// Now set contextual width that doesn't go beyond a breakpoint
		page._applyContextualSettings({contextualWidth: 101});
		await timeout();
		// callCount is still 1
		assert.equal(tableResizeSpy.callCount, 1, "After applying contextual width to a parent container, but this width isn't in a different range, onColumnResize is not called");

		// Now set contextual width that goes beyond a breakpoint (tablet starts at 600)
		page._applyContextualSettings({contextualWidth: 600});
		await timeout();
		assert.equal(tableResizeSpy.callCount, 2, "After applying contextual width to a parent container, and this width is in a different range, onColumnResize is called");

		page.destroy();
	});

	QUnit.test("Should notify when contextual width changes beyond a breakpoint (when already rendered with contextual width)", async function (assert) {

		//Setup is a sap.m.Page holding a Table. Setting contextual width on the page affects the table
		const tableResizeSpy = this.spy(Table.prototype, "onColumnResize"),
				oColumn = new Column({
					minScreenWidth : "tablet"
				}),
				parent = new Table({
					columns : [oColumn, new Column()]
				}),
				page = new Page({}); // we want the page to be empty so we can insert the table later


		page.placeAt("qunit-fixture");
		await nextUIUpdate();
		page._applyContextualSettings({contextualWidth: 100});

		// Place the table in a container that already has contextual settings
		page.addContent(parent);
		await timeout();

		assert.ok(!tableResizeSpy.called, "Initially no resize is needed - the table is rendered as for phone");

		// Now change the contextual width significantly (tablet starts at 600) and wait 1 tick for onColumnResize
		page._applyContextualSettings({contextualWidth: 600});
		await timeout();

		assert.equal(tableResizeSpy.callCount, 1, "After applying contextual width to a parent container, and this width is in a different range, onColumnResize is called");

		page.destroy();
	});

	QUnit.test("Should notify when contextual width is removed from a parent, and this width was in a different range compared to device width", async function (assert) {

		//Setup is a sap.m.Page holding a Table. Setting contextual width on the page affects the table
		const tableResizeSpy = this.spy(Table.prototype, "onColumnResize"),
				oColumn = new Column({
					minScreenWidth : "tablet"
				}),
				parent = new Table({
					columns : [oColumn, new Column()]
				}),
				page = new Page({}); // we want the page to be empty so we can insert the table later


		page.placeAt("qunit-fixture");
		await nextUIUpdate();
		page._applyContextualSettings({contextualWidth: 100});

		// Place the table in a container that already has contextual settings
		page.addContent(parent);
		await timeout();
		assert.ok(!tableResizeSpy.called, "Initially no resize is needed - the table is rendered as for phone");

		// Now remove contextual settings - the table will be rerendered as for desktop
		page._applyContextualSettings({});
		await timeout();
		assert.equal(tableResizeSpy.callCount, 1, "After removing contextual with from a parent container, and this width was in another range compared to the device size range, onColumnResize is called");

		page.destroy();
	});

	QUnit.test("Should not notify when contextual width is removed from a parent, but this width wasn't in a different range compared to device width", async function (assert) {

		//Setup is a sap.m.Page holding a Table. Setting contextual width on the page affects the table
		const tableResizeSpy = this.spy(Table.prototype, "onColumnResize"),
				oColumn = new Column({
					minScreenWidth : "tablet"
				}),
				parent = new Table({
					columns : oColumn
				}),
				page = new Page({}); // we want the page to be empty so we can insert the table later


		page.placeAt("qunit-fixture");
		await nextUIUpdate();
		page._applyContextualSettings({contextualWidth: 1000});

		// Place the table in a container that already has contextual settings
		page.addContent(parent);
		await timeout();
		assert.ok(!tableResizeSpy.called, "Initially no resize is needed - the table is rendered as for tablet since contextual width is 1000 already");

		// Now remove contextual settings - the table will not be rerendered as it is already showing the column
		page._applyContextualSettings({});
		await timeout();
		assert.equal(tableResizeSpy.callCount, 0, "After removing contextual width from a parent container, but this width was in the same range compared to the device width, onColumnResize is not called");

		page.destroy();
	});


	QUnit.module("display and style");

	QUnit.test("Should convert units correctly", function(assert) {

		const fnTestCase = function(width, px) {
			const oColumn = new Column({minScreenWidth: width});

			assert.strictEqual(oColumn._minWidth, px);

			oColumn.destroy();
		};

		fnTestCase("64rem", "1024px");
		fnTestCase("64em", "1024px");
		fnTestCase("desktop", "1024px");
		fnTestCase("Desktop", "1024px");
		fnTestCase("63px", "63px");
	});

	QUnit.test("Sorted property and sort icon", async function(assert) {
		const oColumn = new Column({
			hAlign: "Center",
			header: new Label({
				text: "Column"
			})
		}),
		parent = new Table({
			columns : oColumn,
			items: new ColumnListItem({
				cells: new Text({
					text: "cell"
				})
			})
		});

		parent.placeAt("qunit-fixture");
		await nextUIUpdate();

		assert.equal(oColumn.getSortIndicator(), "None", "Default value for sorted is None");

		// sort ascending
		oColumn.setSortIndicator("Ascending");
		assert.equal(oColumn.getSortIndicator(), "Ascending", "Column is sorted");
		const oSutDomRef = oColumn.getDomRef();
		assert.equal(oSutDomRef.getAttribute("aria-sort"), "ascending", "Column is sorted in ascending order");

		// sort descending
		oColumn.setSortIndicator("Descending");
		assert.equal(oColumn.getSortIndicator(), "Descending", "Column is sorted");
		assert.equal(oSutDomRef.getAttribute("aria-sort"), "descending", "Column is sorted in descending order");

		// sorting removed
		oColumn.setSortIndicator("None");
		assert.equal(oColumn.getSortIndicator(), "None", "Sorting removed");
		assert.equal(oSutDomRef.getAttribute("aria-sort"), "none", "Sorting removed");

		parent.destroy();
	});

	QUnit.module("Column Menu Header", {
		beforeEach: async function () {
			this.oMenu = new ColumnMenu({
				quickActions: [new QuickAction({label: "Quick Action A", content: new Button({text: "Execute"})})],
				items: [new Item({label: "Item A", icon: "sap-icon://sort", content: new Button({text: "Execute"})})]
			});
			this.oColumn = new Column({
				hAlign: "Center",
				header: new Label({text: "Column"})
			});
			this.parent = new Table({
				columns : this.oColumn,
				items: new ColumnListItem({
					cells: new Text({text: "cell"})
				})
			});
			this.oColumn.setHeaderMenu(this.oMenu);

			this.parent.placeAt("qunit-fixture");
			await nextUIUpdate();
		},
		afterEach: function () {
			this.oMenu.destroy();
			this.oColumn.destroy();
			this.parent.destroy();
		}
	});

	QUnit.test("ARIA haspopup attribute set correctly column with menu", function (assert) {
		assert.equal(this.oColumn.getFocusDomRef().getAttribute("aria-haspopup"), "dialog", "aria-haspopup value is dialog");
	});

	QUnit.test("Open menu", async function (assert) {
		const oOpenSpy = this.spy(this.oMenu, "openBy");
		const oColumnPressSpy = this.spy(this.oColumn.getTable(), "fireEvent");
		const oFakeEvent = new jQuery.Event("contextmenu");

		this.oColumn.$().trigger("tap");
		await nextUIUpdate();

		assert.equal(oOpenSpy.callCount, 1, "openBy called exactly once when the tap event is triggered");
		assert.ok(oOpenSpy.calledWith(this.oColumn), "openBy called with correct column");
		assert.notOk(oColumnPressSpy.calledWithExactly("columnPress"), "The columnPress event is not fired");

		this.oColumn.$().trigger(oFakeEvent);
		await nextUIUpdate();

		assert.equal(oOpenSpy.callCount, 2, "openBy called exactly once when the contextmenu event is triggered");
		assert.ok(oOpenSpy.calledWith(this.oColumn), "openBy called with correct column");
		assert.notOk(oColumnPressSpy.calledWithExactly("columnPress"), "The columnPress event is not fired");
		assert.ok(oFakeEvent.isDefaultPrevented(), "Default action is prevented for event");
	});
});