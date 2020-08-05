/*global QUnit, sinon */
/*eslint no-undef:1, no-unused-vars:1, strict: 1 */
sap.ui.define([
	"sap/ui/Device",
	"sap/ui/core/Item",
	"sap/m/WheelSlider",
	"sap/m/WheelSliderContainer"
], function(
	Device,
	Item,
	WheelSlider,
	WheelSliderContainer
) {
		QUnit.module("Misc");

		QUnit.test("init", function(assert) {
			// arrange
			var oResizeHandlerSpy = this.spy(Device.resize, "attachHandler"),
				oWSC;

			// act
			oWSC = new WheelSliderContainer();

			// assert
			assert.ok(oResizeHandlerSpy.calledOnce, "there was a registration for resize events");

			// clean
			oWSC.destroy();
		});

		QUnit.test("_onOrientationChange is called on device resize event", function(assert) {
			// arrange
			var oOrientationChangedSpy = this.spy(WheelSliderContainer.prototype, "_onOrientationChanged"),
				oWSC;

			// act
			oWSC = new WheelSliderContainer();
			Device.resize._update();

			// assert
			assert.ok(oOrientationChangedSpy.calledOnce, "orientation changed was handled");

			// clean
			oWSC.destroy();
		});

		QUnit.test("_onOrientationChange updates the layout of the expanded sliders", function(assert) {
			// arrange
			var oWSC = new WheelSliderContainer({
					sliders: [
						new WheelSlider(),
						new WheelSlider({ isExpanded: true })
					]
				}),
				oSliderUpdateFrameLayoutSpy = this.spy(WheelSlider.prototype, "_updateSelectionFrameLayout");

			// act
			oWSC._onOrientationChanged();

			// assert
			assert.ok(oSliderUpdateFrameLayoutSpy.calledOnce, "one slider's layout is updated");
			assert.equal(oSliderUpdateFrameLayoutSpy.thisValues[0], oWSC.getSliders()[1], "the right slider's layout is updated");

			// clean
			oWSC.destroy();
		});

		QUnit.module("Public API", {
			beforeEach: function() {
				this.oWSC = new WheelSliderContainer();

				this.oWSC.placeAt("qunit-fixture");
			},
			afterEach: function() {
				this.oWSC.destroy();
				this.oWSC = null;
			}
		});

		QUnit.test("Call to setLabelText sets the label", function(assert) {
			var sLabelText = "text",
				oSetPropertySpy = this.spy(this.oWSC, "setProperty");

			this.oWSC.setLabelText(sLabelText);
			sap.ui.getCore().applyChanges();

			assert.equal(oSetPropertySpy.calledWithExactly("labelText", sLabelText), true, "setProperty is called with right arguments");
		});

		QUnit.test("Call to setWidth sets the width", function(assert) {
			var sWidth = "500px",
				oSetPropertySpy = this.spy(this.oWSC, "setProperty");

			this.oWSC.setWidth(sWidth);
			sap.ui.getCore().applyChanges();

			assert.equal(oSetPropertySpy.calledWithExactly("width", sWidth), true, "setProperty is called with right arguments");
			assert.equal(this.oWSC.$().outerWidth() + "px", sWidth, "width is properly set");
		});

		QUnit.test("Call to setHeight sets the height", function(assert) {
			var sHeight = "500px",
				oSetPropertySpy = this.spy(this.oWSC, "setProperty");

			this.oWSC.setHeight(sHeight);
			sap.ui.getCore().applyChanges();

			assert.equal(oSetPropertySpy.calledWithExactly("height", sHeight), true, "setProperty is called with right arguments");
			assert.equal(this.oWSC.$().outerHeight() + "px", sHeight, "height is properly set");
		});

		QUnit.module("Internal API", {
			beforeEach: function() {
				this.oWSC = new WheelSliderContainer({
					sliders: [
						new WheelSlider(),
						new WheelSlider(),
						new WheelSlider()
					]
				});
			},
			afterEach: function() {
				this.oWSC.destroy();
				this.oWSC = null;
			}
		});

		QUnit.test("_getCurrentSlider returns null if no slider is expanded", function(assert) {
			// assert
			assert.equal(this.oWSC._getCurrentSlider(), null, "no slider is selected");
		});

		QUnit.test("_getCurrentSlider returns the expanded slider", function(assert) {
			// arrange
			var oSlider = this.oWSC.getSliders()[1];

			// act
			oSlider.setIsExpanded(true);

			// assert
			assert.equal(this.oWSC._getCurrentSlider(), oSlider, "the expanded slider is current");
		});

		QUnit.test("_getFirstSlider returns the first slider", function(assert) {
			// assert
			assert.equal(this.oWSC._getFirstSlider(), this.oWSC.getSliders()[0], "_getFirstSlider returns the first slider");
		});

		QUnit.test("_getLastSlider returns the last slider", function(assert) {
			// assert
			assert.equal(this.oWSC._getLastSlider(), this.oWSC.getSliders()[2], "_getLastSlider returns the last slider");
		});

		QUnit.test("_onSliderExpanded", function(assert) {
			// arrange
			var oSliderSetIsExpandedSpy,
				oFirstSlider = this.oWSC.getSliders()[0],
				oSecondSlider = this.oWSC.getSliders()[1];

			oSecondSlider.setIsExpanded(true);
			oSliderSetIsExpandedSpy = this.spy(WheelSlider.prototype, "setIsExpanded");

			// act - click on the first slider
			this.oWSC._onSliderExpanded(new jQuery.Event({ source: oFirstSlider }));

			// assert - collapses the second slider
			assert.equal(oSliderSetIsExpandedSpy.callCount, 1, "setIsExpanded is called for the other expanded slider");
			assert.equal(oSliderSetIsExpandedSpy.thisValues[0], oSecondSlider, "setIsExpanded is called for the right slider");
			assert.ok(oSliderSetIsExpandedSpy.calledWithExactly(false), "setIsExpanded(false) is called for the expanded slider");
		});

		QUnit.module("Keyboard", {
			beforeEach: function() {
				this.oWSC = new WheelSliderContainer({
					sliders: [
						new WheelSlider({ items: new Item({ key: "1", text: "1" })}),
						new WheelSlider({ items: new Item({ key: "2", text: "2" }) }),
						new WheelSlider({ items: new Item({ key: "3", text: "3" }) })
					]
				});

				this.oWSC.placeAt("qunit-fixture");
				sap.ui.getCore().applyChanges();
			},
			afterEach: function() {
				this.oWSC.destroy();
				this.oWSC = null;
			}
		});

		QUnit.test("onsaphome", function(assert) {
			// arrange
			var oSliderFocusSpy,
				oFirstSlider = this.oWSC.getSliders()[0],
				oSecondSlider = this.oWSC.getSliders()[1];

			oSecondSlider.setIsExpanded(true);
			oSecondSlider.focus();

			sap.ui.getCore().applyChanges();

			oSliderFocusSpy = this.spy(WheelSlider.prototype, "focus");

			// act
			this.oWSC.onsaphome();

			// assert - collapses the second slider
			assert.ok("ok");
			assert.equal(oSliderFocusSpy.callCount, 1, "focus is called");
			assert.equal(oSliderFocusSpy.thisValues[0], oFirstSlider, "focus is called on the first slider");
		});

		QUnit.test("onsapend", function(assert) {
			// arrange
			var oSliderFocusSpy,
				oLastSlider = this.oWSC.getSliders()[2],
				oSecondSlider = this.oWSC.getSliders()[1];

			oSecondSlider.setIsExpanded(true);
			oSecondSlider.focus();

			sap.ui.getCore().applyChanges();

			oSliderFocusSpy = this.spy(WheelSlider.prototype, "focus");

			// act
			this.oWSC.onsapend();

			// assert - collapses the second slider
			assert.ok("ok");
			assert.equal(oSliderFocusSpy.callCount, 1, "focus is called");
			assert.equal(oSliderFocusSpy.thisValues[0], oLastSlider, "focus is called on the first slider");
		});

		QUnit.test("onsapleft", function(assert) {
			// arrange
			var oSliderFocusSpy,
				oFirstSlider = this.oWSC.getSliders()[0],
				oSecondSlider = this.oWSC.getSliders()[1];

			oSecondSlider.setIsExpanded(true);
			oSecondSlider.focus();

			sap.ui.getCore().applyChanges();

			oSliderFocusSpy = this.spy(WheelSlider.prototype, "focus");

			// act
			this.oWSC.onsapleft();

			// assert - collapses the second slider
			assert.ok("ok");
			assert.equal(oSliderFocusSpy.callCount, 1, "focus is called");
			assert.equal(oSliderFocusSpy.thisValues[0], oFirstSlider, "focus is called on the first slider");
		});

		QUnit.test("onsapright", function(assert) {
			// arrange
			var oSliderFocusSpy,
				oLastSlider = this.oWSC.getSliders()[2],
				oSecondSlider = this.oWSC.getSliders()[1];

			oSecondSlider.setIsExpanded(true);
			oSecondSlider.focus();

			sap.ui.getCore().applyChanges();

			oSliderFocusSpy = this.spy(WheelSlider.prototype, "focus");

			// act
			this.oWSC.onsapright();

			// assert - collapses the second slider
			assert.ok("ok");
			assert.equal(oSliderFocusSpy.callCount, 1, "focus is called");
			assert.equal(oSliderFocusSpy.thisValues[0], oLastSlider, "focus is called on the first slider");
		});
	});