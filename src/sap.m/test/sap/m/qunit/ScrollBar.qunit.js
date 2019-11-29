/*global QUnit */
sap.ui.define([
	"sap/m/ScrollBar"
], function(ScrollBar) {
	"use strict";

	var oCore = sap.ui.getCore(),
		TESTS_DOM_CONTAINER = "qunit-fixture";

	QUnit.module("Initialise");

	QUnit.test("scroll position initialisation", function(assert) {
		// Arrange
		var oSB = new ScrollBar({contentSize: "2000px", scrollPosition: 100});
		oSB.placeAt(TESTS_DOM_CONTAINER);
		oCore.applyChanges();

		// Assert
		assert.strictEqual(oSB.getScrollPosition(), 100,
				"scroll position is correctly set when initialising the control");

		// Clean up
		oSB.destroy();
	});


	QUnit.module("API", {
		beforeEach: function () {
			this.oSB = new ScrollBar();
			this.oSB.placeAt(TESTS_DOM_CONTAINER);
			oCore.applyChanges();
		},
		afterEach: function () {
			this.oSB.destroy();
			this.oSB = null;
		}
	});

	QUnit.test("setScrollPosition", function(assert) {
		// Act
		this.oSB.setScrollPosition(5.1234);

		// Assert
		assert.strictEqual(this.oSB.getScrollPosition(), 5,
				"scroll position is correctly set and rounded to 5");
	});

	QUnit.test("setContentSize", function(assert) {
		// Act
		this.oSB.setContentSize("250px");

		// Assert
		assert.strictEqual(this.oSB.getContentSize(), "250px", "size of scrollbar is 250px");
	});

	QUnit.test("Negative Scroll Position", function(assert) {
		// Act
		this.oSB.setScrollPosition(-1);

		// Assert
		assert.strictEqual(this.oSB.getScrollPosition(), 0,
				"scroll position is correctly set to 0");
	});

	QUnit.test("Scroll Position bigger than contentSize", function(assert) {
		assert.expect(1);
		// Arrange
		var oSB = this.oSB,
			done = assert.async(),
			iContentSize = 1600,
			iScrollPosition = 4000,
			iDomContainerHeight = jQuery("#" + TESTS_DOM_CONTAINER).height();

		// Act
		oSB.setContentSize(iContentSize + "px");
		oSB.setScrollPosition(iScrollPosition);

		setTimeout(function() {
			// Assert
			assert.strictEqual(oSB.getScrollPosition(), iContentSize - iDomContainerHeight,
					"scroll position is correctly set to the lowest possible");
			done();
		}, 100);
	});

	QUnit.test("Change scroll position after contentSize change", function(assert) {
		assert.expect(1);
		// Arrange
		var oSB = this.oSB,
			done = assert.async(),
			iHeight = oSB.getDomRef().offsetHeight,
			iInitContentSize = iHeight + 5,
			iNewContentSize = iHeight + 100,
			iNewScrollPosition = iHeight + 100;

		// Act
		oSB.setContentSize(iInitContentSize + "px");
		setTimeout(function() {
			oSB.setContentSize(iNewContentSize + "px");
			oSB.setScrollPosition(iNewScrollPosition);
			oSB.attachEventOnce("scroll", function(oEvent) {
				// Assert
				assert.strictEqual(oEvent.getParameter("pos"), iNewScrollPosition - iHeight,
					"scroll position is correctly set to the lowest possible");
				done();
			});
		}, 100);

	});

	QUnit.module("Event handler", {
		beforeEach: function () {
			this.oSB = new ScrollBar();
			this.oSB.placeAt(TESTS_DOM_CONTAINER);
			oCore.applyChanges();
		},
		afterEach: function () {
			this.oSB.destroy();
			this.oSB = null;
		}
	});

	QUnit.test("Scroll position after re-rendering", function(assert) {
		assert.expect(2);
		// Arrange
		var oSB = this.oSB;

		// Act
		oSB.setScrollPosition(5.1234);

		// Assert
		assert.strictEqual(oSB.getScrollPosition(), 5,
				"scroll position before re-rendering should be 5");

		// Act
		oSB.rerender();

		// Assert
		assert.strictEqual(oSB.getScrollPosition(), 5,
				"scroll position after re-rendering should also be 5");
	});


	QUnit.test("_$ScrollRef is assigned correctly after rendering", function(assert) {
		// Arrange
		assert.expect(8);
		var oSB = this.oSB;

		// Assert
		assertScrollRef();

		// Act
		oSB.rerender();

		// Assert
		assertScrollRef();

		function assertScrollRef() {
			var oScrollRefAttachedEvents = jQuery._data(oSB._$ScrollRef[0], "events");
			assert.strictEqual(oSB._$ScrollRef.is(oSB.$("sb")), true,
					"_$ScrollRef is the correct jQuery ref");
			assert.strictEqual(oSB._$ScrollRef.length, 1,
					"_$ScrollRef contains only one element");
			assert.strictEqual(oScrollRefAttachedEvents.scroll.length, 1,
					"_$ScrollRef has only one attached scroll event");
			assert.strictEqual(oScrollRefAttachedEvents.scroll[0].type,
					"scroll", "attached event to _$ScrollRef is of type scroll");
		}
	});

	QUnit.test("onThemeChanged", function(assert) {
		// Arrange
		var oInvalidateSpy = this.spy(this.oSB, "invalidate");

		// Act
		this.oSB.onThemeChanged();

		// Assert
		assert.strictEqual(oInvalidateSpy.callCount, 1, "Theme change causes invalidation");
	});
});
