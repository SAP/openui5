/*global QUnit, sinon */
/*eslint no-undef:1, no-unused-vars:1, strict: 1 */
sap.ui.define([
	"sap/ui/core/Item",
	"sap/m/WheelSlider",
	"sap/ui/events/KeyCodes",
	"jquery.sap.global"
], function(
	Item,
	WheelSlider,
	KeyCodes,
	jQuery) {
		QUnit.module("Type to select", {
			beforeEach: function() {
				this.oSlider = new WheelSlider({
					items: [
						new Item({ key: "k1", text: "1" }),
						new Item({ key: "k2", text: "2" }),
						new Item({ key: "k3", text: "3" }),
						new Item({ key: "k11", text: "11" }),
						new Item({ key: "k113", text: "113" })
					]
				});
				this.oSelectedKeySpy = sinon.spy(this.oSlider, "setSelectedKey");
				this.iNowTimeStamp = 50501234;
			},
			afterEach: function() {
				this.oSelectedKeySpy.restore();
				this.oSlider.destroy();
				this.oSlider = null;
			}
		});

		QUnit.test("_fnHandleTypeValues immediately sets the selected key when a unique value is matched", function(assert) {
			// act
			this.oSlider._fnHandleTypeValues(this.iNowTimeStamp, KeyCodes.DIGIT_2);

			// assert
			assert.ok(this.oSelectedKeySpy.calledOnce, "setSelectedKey is called once");
			assert.ok(this.oSelectedKeySpy.calledWith("k2"), "setSelectedKey is called with the right item key");
		});

		QUnit.test("_fnHandleTypeValues stacks calls that do not have exact match within a second", function(assert) {
			// act
			this.oSlider._fnHandleTypeValues(this.iNowTimeStamp, KeyCodes.DIGIT_1);
			this.oSlider._fnHandleTypeValues(this.iNowTimeStamp + 500, KeyCodes.DIGIT_1);

			// assert
			assert.equal(this.oSelectedKeySpy.callCount, 0, "setSelectedKey is not called yet, because there are 2 matched texts");

			// wait
			this.clock.tick(1000);

			// assert
			assert.ok(this.oSelectedKeySpy.calledOnce, "setSelectedKey is called only once after 1 second when there are multiple matched texts");
			assert.ok(this.oSelectedKeySpy.calledWith("k11"), "setSelectedKey is called with the right item key");
		});

		QUnit.test("_fnHandleTypeValues does not change selection when there is no matched item text", function(assert) {
			// act
			this.oSlider._fnHandleTypeValues(this.iNowTimeStamp, KeyCodes.DIGIT_5);

			// assert
			assert.equal(this.oSelectedKeySpy.callCount, 0, "setSelectedKey is not called after typing non-existent item text");

			// wait
			this.clock.tick(1000);

			// assert
			assert.equal(this.oSelectedKeySpy.callCount, 0, "setSelectedKey is still not called after waiting 1 second");
		});

		QUnit.module("API", {
			beforeEach: function() {
				this.oSlider = new WheelSlider({
					items: [
						new Item({ key: "k4", text: "4" }),
						new Item({ key: "k5", text: "5" }),
						new Item({ key: "k6", text: "6" })
					]
				});

				this.oSlider.placeAt("qunit-fixture");
				sap.ui.getCore().applyChanges();
			},
			afterEach: function() {
				this.oSlider.destroy();
				this.oSlider = null;
			}
		});

		QUnit.test("collapse slider before animation is completed is ok", function(assert) {
			// arrange
			var oSpyScrollerSnapped = this.spy(this.oSlider, "_scrollerSnapped"),
				iCurrentIndex = this.oSlider._iSelectedItemIndex;

			// act - offsets the value by one. animation is stared.
			this.oSlider._offsetAnimateValue(1);
			try {
				this.oSlider.setIsExpanded(false);
			} catch (e) {
				assert.ok(false, "then no exception should be thrown");
			}

			// assert
			assert.equal(oSpyScrollerSnapped.callCount, 1, "_scrollerSnapped should be called");
			assert.ok(oSpyScrollerSnapped.calledWith(iCurrentIndex + 1), "snapped to the next value");
		});

		QUnit.test("slider when another animation is queued", function(assert) {
			// arrange
			var oSpyScrollerSnapped = this.spy(this.oSlider, "_scrollerSnapped"),
				currentIndex = this.oSlider._iSelectedItemIndex;

			// act - moves (offsets) the value by one (vertically).
			// animation is stared. then another is started.
			this.oSlider._offsetAnimateValue(1);
			this.oSlider._offsetAnimateValue(1);

			// assert - snapping is called for the first animation,
			// before the second animation finishes
			assert.equal(oSpyScrollerSnapped.callCount, 1, "_scrollerSnapped should be called");
			assert.ok(oSpyScrollerSnapped.calledWith(currentIndex + 1), "snapped to the next value");
		});

		QUnit.module("Lifecycle and rendering", {
			beforeEach: function() {
				this.oSlider = new WheelSlider({
					items: [
						new Item({ key: "k4", text: "4" }),
						new Item({ key: "k5", text: "5" }),
						new Item({ key: "k6", text: "6" })
					]
				});
			},
			afterEach: function() {
				this.oSlider.destroy();
				this.oSlider = null;
			}
		});

		QUnit.test("event attach/detach", function(assert) {
			// arrange
			var oAttachEventsSpy = this.spy(this.oSlider, "_attachEvents"),
				oDetachEventsSpy = this.spy(this.oSlider, "_detachEvents");

			// act
			this.oSlider.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();

			// assert - after first rendering
			assert.ok(oAttachEventsSpy.calledOnce, "_attachEvents is called");
			assert.ok(oDetachEventsSpy.notCalled, "_detachEvents not yet called");

			// act
			this.oSlider.invalidate();
			sap.ui.getCore().applyChanges();

			// assert - after second rendering
			assert.equal(oAttachEventsSpy.callCount, 2, "_attachEvents is called 2 times");
			assert.equal(oDetachEventsSpy.callCount, 1, "_detachEvents is called once");
		});

		QUnit.test("margins are updated on expand/collapse", function(assert) {
			var oSpyUpdateConstrainedMargins = this.spy(this.oSlider, "_updateConstrainedMargins");

			// act
			this.oSlider.setIsExpanded(true);

			// assert
			assert.ok(oSpyUpdateConstrainedMargins.notCalled, "margins are not updated before a domref exists");

			this.oSlider.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();

			// assert
			assert.ok(oSpyUpdateConstrainedMargins.calledOnce, "margins are updated after rendering");

			// act
			this.oSlider.setIsExpanded(true);

			// assert
			assert.ok(oSpyUpdateConstrainedMargins.calledTwice, "margins are updated on expand");

			// act
			this.oSlider.setIsExpanded(false);

			// assert
			assert.equal(oSpyUpdateConstrainedMargins.callCount, 3, "margins are updated on collapse");
		});

		QUnit.test("setIsCyclic", function(assert) {
			this.oSlider.placeAt("qunit-fixture");

			// act
			this.oSlider.setIsCyclic(true);
			sap.ui.getCore().applyChanges();

			// assert
			assert.ok(!this.oSlider.$().hasClass("sapMWSShort"), "slider styled correctly");

			// act
			this.oSlider.setIsCyclic(false);
			sap.ui.getCore().applyChanges();

			// assert
			assert.ok(this.oSlider.$().hasClass("sapMWSShort"), "slider styled correctly");
		});

		QUnit.module("Interaction", {
			_createMouseWheelEvent: function(iWheelSteps) {
				var oEvent = {};
				oEvent.originalEvent = {};
				oEvent.originalEvent.wheelDelta = iWheelSteps * 120;
				oEvent.originalEvent.detail = iWheelSteps * -3;
				oEvent.preventDefault = function() { };
				oEvent.stopPropagation = function() { };

				return oEvent;
			},
			_createItemMouseUp: function(iItemIndex) {
				var aItemDomRefs = document.querySelectorAll("#" + this.oSlider.getId() + " " + "li");

				return new jQuery.Event("mouseup", {
					srcElement: aItemDomRefs[iItemIndex]
				});
			},
			beforeEach: function() {
				this.oSlider = new WheelSlider({
					items: [
						new Item({ key: "k1", text: "1" }),
						new Item({ key: "k2", text: "2" }),
						new Item({ key: "k3", text: "3" })
					]
				});
			},
			afterEach: function() {
				this.oSlider.destroy();
				this.oSlider = null;
			}
		});

		QUnit.test("_handleTap expands the slider", function(assert) {
			// arrange
			this.oSlider.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();

			// act
			this.oSlider._handleTap(null);

			// assert
			assert.ok(this.oSlider.getIsExpanded(), "slider is expanded");
		});

		QUnit.test("_handleTap moves to the tapped value", function(assert) {
			// arrange
			this.oSlider.setIsExpanded(true);
			this.oSlider.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();

			// act - tap the 3rd value
			this.oSlider._handleTap(this._createItemMouseUp(2));

			// assert
			assert.equal(this.oSlider.getSelectedKey(), "k3", "slider selection is ok");
		});

		QUnit.test("_doDrag method updates the top position", function(assert) {
			// arrange
			this.oSlider.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();

			// act
			this.oSlider._startDrag(200);
			this.oSlider._bIsDrag = true;

			var oJQueryScrollTopSpy = this.spy(jQuery.fn, "scrollTop");
			this.oSlider._doDrag(240, 1435829481235);
			this.oSlider._doDrag(293, 1435829481277);

			// assert
			assert.equal(oJQueryScrollTopSpy.callCount, 2, "slider's top position has been updated once for every _doDrag");
		});

		QUnit.test("_endDrag method initiates an animation on the slider's content", function(assert) {
			// arrange
			this.oSlider.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();

			var oAnimateScrollSpy = this.spy(this.oSlider, "_animateScroll");

			// act - about 40ms offset each drag
			this.oSlider._startDrag(200);
			this.oSlider._doDrag(240, 1435829481235);
			this.oSlider._doDrag(293, 1435829481277);
			this.oSlider._doDrag(340, 1435829481323);
			this.oSlider._doDrag(382, 1435829481364);
			this.oSlider._endDrag(439, 1435829481402);

			// assert
			assert.equal(oAnimateScrollSpy.callCount, 1, "animation was started");
			assert.equal(Math.abs(oAnimateScrollSpy.args[0][0]), 1, "animation was started with reasonable speed");
		});

		QUnit.test("arrow up offsets the slider", function(assert) {
			var oOffsetAnimateValueSpy;

			// arrange
			this.oSlider.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();

			oOffsetAnimateValueSpy = this.spy(this.oSlider, "_offsetAnimateValue");

			// act
			this.oSlider.getAggregation("_arrowUp").firePress();

			// assert
			assert.equal(oOffsetAnimateValueSpy.callCount, 1, "_offsetAnimateValue is called");
			assert.ok(oOffsetAnimateValueSpy.calledWith(-1), "_offsetAnimateValue is called with the right arguments");
		});

		QUnit.test("arrow down offsets the slider", function(assert) {
			var oOffsetAnimateValueSpy;

			// arrange
			this.oSlider.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();

			oOffsetAnimateValueSpy = this.spy(this.oSlider, "_offsetAnimateValue");

			// act
			this.oSlider.getAggregation("_arrowDown").firePress();

			// assert
			assert.equal(oOffsetAnimateValueSpy.callCount, 1, "_offsetAnimateValue is called");
			assert.ok(oOffsetAnimateValueSpy.calledWith(1), "_offsetAnimateValue is called with the right arguments");
		});

		QUnit.test("up offsets the slider", function(assert) {
			var oOffsetAnimateValueSpy;

			// arrange
			this.oSlider.setIsExpanded(true);
			this.oSlider.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();

			oOffsetAnimateValueSpy = this.spy(this.oSlider, "_offsetAnimateValue");

			// act
			this.oSlider.onsapup();

			// assert
			assert.equal(oOffsetAnimateValueSpy.callCount, 1, "_offsetAnimateValue is called");
			assert.ok(oOffsetAnimateValueSpy.calledWith(-1), "_offsetAnimateValue is called with the right arguments");
		});

		QUnit.test("down offsets the slider", function(assert) {
			var oOffsetAnimateValueSpy;

			// arrange
			this.oSlider.setIsExpanded(true);
			this.oSlider.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();

			oOffsetAnimateValueSpy = this.spy(this.oSlider, "_offsetAnimateValue");

			// act
			this.oSlider.onsapdown();

			// assert
			assert.equal(oOffsetAnimateValueSpy.callCount, 1, "_offsetAnimateValue is called");
			assert.ok(oOffsetAnimateValueSpy.calledWith(1), "_offsetAnimateValue is called with the right arguments");
		});

		QUnit.test("pageup selects the first value", function(assert) {
			// arrange
			this.oSlider.setIsExpanded(true);
			this.oSlider.setSelectedKey("k2");
			this.oSlider.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();

			// act
			this.oSlider.onsappageup();

			// assert
			assert.equal(this.oSlider.getSelectedKey(), "k1", "the selection is right");
		});

		QUnit.test("pagedown selects the last value", function(assert) {
			// arrange
			this.oSlider.setIsExpanded(true);
			this.oSlider.setSelectedKey("k2");
			this.oSlider.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();

			// act
			this.oSlider.onsappagedown();

			// assert
			assert.equal(this.oSlider.getSelectedKey(), "k3", "the selection is right");
		});

		QUnit.test("mousewheel event", function(assert) {
			var oHandleWheelScrollSpy;

			// arrange
			this.oSlider.setIsExpanded(true);
			this.oSlider.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();

			oHandleWheelScrollSpy = this.spy(this.oSlider, "_handleWheelScroll");

			// act
			this.oSlider._onMouseWheel(this._createMouseWheelEvent(-1));

			// assert
			assert.equal(oHandleWheelScrollSpy.callCount, 1, "_handleWheelScroll is called");
			assert.ok(oHandleWheelScrollSpy.calledWith(false, -1), "_handleWheelScroll is called with the right args");
		});

		QUnit.test("focusout collapses the slider", function(assert) {
			// arrange
			this.oSlider.setIsExpanded(true);
			this.oSlider.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();

			// act
			this.oSlider.onfocusout({});

			// assert
			assert.equal(this.oSlider.getIsExpanded(), false, "slider is not expanded");
		});
	});