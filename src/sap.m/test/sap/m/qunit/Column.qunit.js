/*global QUnit, jQuery */
sap.ui.define([
	"sap/m/Table",
	"sap/ui/Device",
	"sap/m/Column",
	"sap/m/library",
	"sap/m/Page",
	"sap/m/ColumnListItem",
	"sap/m/Text",
	"sap/m/Label"
], function(Table, Device, Column, library, Page, ColumnListItem, Text, Label) {
	"use strict";



	QUnit.module("popin");

	QUnit.test("ShouldSetDemandPopin", function(assert) {
		var fnTestCase = function(initialValue, valueToSet,bShouldInvalidate, expectedValidateToBeCalled){
			//SUT
			var result,
				originalInvalidate,
				invalidateWasCalled = false,
				sut = new Column();

			if (bShouldInvalidate){
				sut.setMinScreenWidth("9001px");
			}

			originalInvalidate = sut.invalidate;
			sut.invalidate = function(){
				originalInvalidate.call(sut);
				invalidateWasCalled = true;
			};

			//Act
			sut.setProperty("demandPopin", initialValue);
			result = sut.setDemandPopin(valueToSet);

			//Assert
			assert.strictEqual(sut.getDemandPopin(), valueToSet,"demandPopin was set");
			assert.strictEqual(sut,result, "should be chainable");
			if (expectedValidateToBeCalled){
				assert.equal(bShouldInvalidate, invalidateWasCalled,"invalidate was called");
			}

			//Cleanup
			sut.destroy();
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

	QUnit.test("ShouldKnowThatItIsAPopin", function(assert) {
		var fnTestCase = function(demandsPopin, hasMedia, hasMatchingMedia, expectedResult){
			//SUT
			var result,
				sut = new Column();

			if (hasMedia) {
				sut._media = { matches: hasMatchingMedia };
			}

			sut.setProperty("demandPopin", demandsPopin);

			//Act
			result = sut.isPopin();

			//Assert
			assert.equal(result, expectedResult);

			//Cleanup
			sut.destroy();
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

	QUnit.test("ShouldKnowIfItIsHidden", function(assert) {
		var fnTestCase = function( expectedResult, hasMedia, hasMatchingMedia, hasScreen, minWidth){
			//SUT
			var result,
				sut = new Column();

			if (hasMedia) {
				sut._media = { matches: hasMatchingMedia };
			}

			if (hasScreen){
				sut._screen = true;
			}

			sut._minWidth = minWidth;

			//Act
			result = sut.isHidden();

			//Assert
			assert.strictEqual(result, expectedResult);

			//Cleanup
			sut.destroy();
		};

		//if it has media it should return if media matches
		fnTestCase(false, true, true);
		fnTestCase(true, true, false);

		//no media now it depends on screen and width

		//no screen - false
		fnTestCase(false, false, undefined, false, true);

		//noMinWidth - false
		fnTestCase(false, false, undefined, true, 0);

		//minWidth is smaller than windows inner width - false
		fnTestCase(false, false, undefined, true, -1);

		//minWidth is bigger than windows inner width - true
		fnTestCase(true, false, undefined, true, 10000);

	});

	QUnit.test("ShouldValidateMinWidth", function(assert) {
		var fnTestCase = function(width){
			//SUT
			var sut = new Column();

			//Act
			sut._validateMinWidth(width);

			//Assert
			assert.ok(true,"valid minScreenWidth : " + width);

			//Cleanup
			sut.destroy();
		};

		//invalid testcases
		assert.throws(function(){ fnTestCase(1);},/expected string for property "minScreenWidth" of /,"raised error because it expects a string");
		assert.throws(function(){ fnTestCase("random string");},/or sap.m.ScreenSize enumeration for property/,"raised error because it expects a valid screenSize");
		assert.throws(function(){ fnTestCase("eightpx");},/or sap.m.ScreenSize enumeration for property/,"raised error because it expects a valid screenSize");
		assert.throws(function(){ fnTestCase("5pxa");},/or sap.m.ScreenSize enumeration for property/,"raised error because it expects a valid screenSize");
		assert.throws(function(){ fnTestCase("-5px");},/or sap.m.ScreenSize enumeration for property/,"raised error because it expects a valid screenSize");
		assert.throws(function(){ fnTestCase("5%");},/or sap.m.ScreenSize enumeration for property/,"raised error because it expects a valid screenSize");

		//valid ones
		fnTestCase("8px");
		fnTestCase("100000em");
		fnTestCase("0rem");

		for ( var screenSize in library.ScreenSize) {
			fnTestCase(screenSize);
		}
	});

	QUnit.test("ShouldKnowIfWidthIsPredefined", function(assert) {
		//SUT
		var sut = new Column({minScreenWidth : "240px"});


		//Act
		assert.strictEqual(sut._screen,"phone");
		sut._isWidthPredefined("600px");

		//Assert
		assert.strictEqual(sut._screen,"tablet");
		assert.strictEqual(sut._minWidth,"600px");

		//Cleanup
		sut.destroy();
	});

	QUnit.module("media");

	QUnit.test("ShouldAddMedia", function(assert) {

		var fnTestCase = function(width,matches) {
			//SUT
			var sut = new Column({minScreenWidth: width});

			//Act
			sut._addMedia();

			//Assert
			assert.ok(sut._media);
			assert.strictEqual(sut._media.matches, matches);

			//Cleanup
			sut.destroy();
		};

		fnTestCase("300000px",false);
		fnTestCase("100px",true);
	});

	QUnit.test("ShouldClearMedia", function(assert) {
		//SUT
		var sut = new Column({minScreenWidth: "100px"});


		//Act
		sut._addMedia();
		assert.ok(sut._media);
		sut._clearMedia();

		//Assert
		assert.ok(!sut._media);

		//Cleanup
		sut.destroy();
	});

	QUnit.module("events");

	QUnit.test("Media handler should not be attached if the table is not rendered yet", function (assert) {
		var mediaAttachSpy = this.spy(Device.media, "attachHandler"),
				sut = new Column({
					minScreenWidth : "phone"
				}),
				parent = new Table({
					columns : sut
				});

		assert.ok(!mediaAttachSpy.called, "Media handler not attached initially");

		parent.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		assert.ok(mediaAttachSpy.called, "Media handler attached when table is rendered");

		parent.destroy();
	});

	QUnit.test("Media handler should be attached when adding a column to a rendered table", function (assert) {
		var mediaAttachSpy = this.spy(Device.media, "attachHandler"),
				sut = new Column({
					minScreenWidth : "phone"
				}),
				parent = new Table({});

		parent.placeAt("qunit-fixture");
		parent.addColumn(sut);
		sap.ui.getCore().applyChanges();

		assert.ok(mediaAttachSpy.called, "Media handler called immediately");

		parent.destroy();
	});

	QUnit.test("ShouldNotifyOnResize", function(assert) {

		//System under Test + Arrange
		var tableResizeSpy = this.spy(Table.prototype, "onColumnResize"),
			sut = new Column({
				minScreenWidth : "phone"
			}),
			parent = new Table({
				columns : sut
			});

		// The table needs to be rendered for the column media object to be initialized
		parent.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		sut._notifyResize({from: 240}); // this is the default value for minScreenWidth="phone"
		this.clock.tick(1);

		assert.ok(!tableResizeSpy.called, "Table resize not called, if media is the same");

		sut._notifyResize({from: 0});
		this.clock.tick(1);

		assert.ok(tableResizeSpy.called, "Table resize called, if media is different");

		parent.destroy();
	});

	QUnit.test("Should not notify when contextual width is set to a parent container, but this width is in the same range as the device width (when initially rendered without contextual width)", function (assert) {

		//Setup is a sap.m.Page holding a Table. Setting contextual width on the page affects the table
		var tableResizeSpy = this.spy(Table.prototype, "onColumnResize"),
				sut = new Column({
					minScreenWidth : "tablet"
				}),
				parent = new Table({
					columns : sut
				}),
				page = new Page({
					content: [parent]
				});

		// The table is rendered without contextual width, the Device.media API is used
		page.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();
		this.clock.tick(1);
		assert.ok(!tableResizeSpy.called, "Initially no resize is needed, table normally rendered as for desktop");

		// Set contextual width to a parent (as for tablet or above) and wait 1 tick for onColumnResize
		page._applyContextualSettings({contextualWidth: 600});
		this.clock.tick(1);
		assert.equal(tableResizeSpy.callCount, 0, "After applying contextual width to a parent container, but this width is in the same range, onColumnResize is not called");

		page.destroy();
	});

	QUnit.test("Should notify when contextual width is set to a parent container, and this width is in a different range compared to device width (when initially rendered without contextual width)", function (assert) {

		//Setup is a sap.m.Page holding a Table. Setting contextual width on the page affects the table
		var tableResizeSpy = this.spy(Table.prototype, "onColumnResize"),
				sut = new Column({
					minScreenWidth : "tablet"
				}),
				parent = new Table({
					columns : sut
				}),
				page = new Page({
					content: [parent]
				});

		// The table is rendered without contextual width, the Device.media API is used
		page.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();
		this.clock.tick(1);

		assert.ok(!tableResizeSpy.called, "Initially no resize is needed, table normally rendered as for desktop");

		// Set contextual width to a parent (as for phone) and wait 1 tick for onColumnResize
		page._applyContextualSettings({contextualWidth: 100});
		this.clock.tick(1);
		assert.equal(tableResizeSpy.callCount, 1, "After applying contextual width to a parent container, and this width is in a different range, onColumnResize is called");

		// Now set contextual width that doesn't go beyond a breakpoint
		page._applyContextualSettings({contextualWidth: 101});
		this.clock.tick(1);
		// callCount is still 1
		assert.equal(tableResizeSpy.callCount, 1, "After applying contextual width to a parent container, but this width isn't in a different range, onColumnResize is not called");

		// Now set contextual width that goes beyond a breakpoint (tablet starts at 600)
		page._applyContextualSettings({contextualWidth: 600});
		this.clock.tick(1);
		assert.equal(tableResizeSpy.callCount, 2, "After applying contextual width to a parent container, and this width is in a different range, onColumnResize is called");

		page.destroy();
	});

	QUnit.test("Should notify when contextual width changes beyond a breakpoint (when already rendered with contextual width)", function (assert) {

		//Setup is a sap.m.Page holding a Table. Setting contextual width on the page affects the table
		var tableResizeSpy = this.spy(Table.prototype, "onColumnResize"),
				sut = new Column({
					minScreenWidth : "tablet"
				}),
				parent = new Table({
					columns : [sut, new Column()]
				}),
				page = new Page({}); // we want the page to be empty so we can insert the table later


		page.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();
		page._applyContextualSettings({contextualWidth: 100});

		// Place the table in a container that already has contextual settings
		page.addContent(parent);
		this.clock.tick(1);

		assert.ok(!tableResizeSpy.called, "Initially no resize is needed - the table is rendered as for phone");

		// Now change the contextual width significantly (tablet starts at 600) and wait 1 tick for onColumnResize
		page._applyContextualSettings({contextualWidth: 600});
		this.clock.tick(1);

		assert.equal(tableResizeSpy.callCount, 1, "After applying contextual width to a parent container, and this width is in a different range, onColumnResize is called");

		page.destroy();
	});

	QUnit.test("Should notify when contextual width is removed from a parent, and this width was in a different range compared to device width", function (assert) {

		//Setup is a sap.m.Page holding a Table. Setting contextual width on the page affects the table
		var tableResizeSpy = this.spy(Table.prototype, "onColumnResize"),
				sut = new Column({
					minScreenWidth : "tablet"
				}),
				parent = new Table({
					columns : [sut, new Column()]
				}),
				page = new Page({}); // we want the page to be empty so we can insert the table later


		page.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();
		page._applyContextualSettings({contextualWidth: 100});

		// Place the table in a container that already has contextual settings
		page.addContent(parent);
		this.clock.tick(1);
		assert.ok(!tableResizeSpy.called, "Initially no resize is needed - the table is rendered as for phone");

		// Now remove contextual settings - the table will be rerendered as for desktop
		page._applyContextualSettings({});
		this.clock.tick(1);
		assert.equal(tableResizeSpy.callCount, 1, "After removing contextual with from a parent container, and this width was in another range compared to the device size range, onColumnResize is called");

		page.destroy();
	});

	QUnit.test("Should not notify when contextual width is removed from a parent, but this width wasn't in a different range compared to device width", function (assert) {

		//Setup is a sap.m.Page holding a Table. Setting contextual width on the page affects the table
		var tableResizeSpy = this.spy(Table.prototype, "onColumnResize"),
				sut = new Column({
					minScreenWidth : "tablet"
				}),
				parent = new Table({
					columns : sut
				}),
				page = new Page({}); // we want the page to be empty so we can insert the table later


		page.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();
		page._applyContextualSettings({contextualWidth: 1000});

		// Place the table in a container that already has contextual settings
		page.addContent(parent);
		this.clock.tick(1);
		assert.ok(!tableResizeSpy.called, "Initially no resize is needed - the table is rendered as for tablet since contextual width is 1000 already");

		// Now remove contextual settings - the table will not be rerendered as it is already showing the column
		page._applyContextualSettings({});
		this.clock.tick(1);
		assert.equal(tableResizeSpy.callCount, 0, "After removing contextual width from a parent container, but this width was in the same range compared to the device width, onColumnResize is not called");

		page.destroy();
	});


	QUnit.module("display and style");

	QUnit.test("ShouldSetDisplay", function(assert) {
		//System under Test + Arrange
		var sut = new Column({
				demandPopin : true,
				minScreenWidth : "1px"
			}),
			parent = new Table({
				columns : sut,
				items: new ColumnListItem({
					cells: new Text({
						text: "cell"
					})
				})
			});

		//Act
		parent.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		//Act
		sut.setDisplay(jQuery("table")[0], false);

		//Assert
		assert.strictEqual(parent.$().find("td").eq(1).css("display"), "none");
		assert.strictEqual(parent.$().find("th").eq(1).css("display"), "none");

		//Cleanup
		parent.destroy();
	});

	QUnit.test("ShouldGetTheStyleClass", function(assert) {
		//Arrange
		var result,
			className = "awesomeStyle",
			media = "phone",
			//System under Test
			sut = new Column({
				styleClass : className,
				minScreenWidth : media
			});

		//Act
		result = sut.getStyleClass(true);

		//Assert
		assert.ok(result.indexOf(className) !== -1, "style class was present in: " + result);
		assert.ok(result.indexOf(media) !== -1, "media class was present in: " + result);
	});

	QUnit.test("Should convert units correctly", function(assert) {

		var fnTestCase = function(width, px, screen) {
			//SUT
			var sut = new Column({minScreenWidth: width});

			//Assert
			assert.strictEqual(sut._minWidth, px);
			assert.strictEqual(sut._screen, screen);

			//Cleanup
			sut.destroy();
		};

		fnTestCase("64rem", "1024px", "desktop");
		fnTestCase("64em", "1024px", "desktop");
		fnTestCase("desktop", "1024px", "desktop");
		fnTestCase("Desktop", "1024px", "desktop");

		fnTestCase("63rem", 63 * 16 + "px", "");
		fnTestCase("63em", 63 * 16 + "px", "");

		fnTestCase("63px", "63px", "");

	});

	QUnit.test("Sorted property and sort icon", function(assert) {
		var sut = new Column({
			hAlign: "Center",
			header: new Label({
				text: "Column"
			})
		}),
		parent = new Table({
			columns : sut,
			items: new ColumnListItem({
				cells: new Text({
					text: "cell"
				})
			})
		});

		parent.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		assert.equal(sut.getSortIndicator(), "None", "Default value for sorted is None");

		// sort ascending
		sut.setSortIndicator("Ascending");
		assert.equal(sut.getSortIndicator(), "Ascending", "Column is sorted");
		var oSutDomRef = sut.getDomRef();
		assert.equal(oSutDomRef.getAttribute("aria-sort"), "ascending", "Column is sorted in ascending order");

		// sort descending
		sut.setSortIndicator("Descending");
		assert.equal(sut.getSortIndicator(), "Descending", "Column is sorted");
		assert.equal(oSutDomRef.getAttribute("aria-sort"), "descending", "Column is sorted in descending order");

		// sorting removed
		sut.setSortIndicator("None");
		assert.equal(sut.getSortIndicator(), "None", "Sorting removed");
		assert.equal(oSutDomRef.getAttribute("aria-sort"), "none", "Sorting removed");

		parent.destroy();
	});
});