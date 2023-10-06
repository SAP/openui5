/*global QUnit, sinon */
sap.ui.define([
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/core/library",
	"sap/m/library",
	"sap/m/Label",
	"sap/m/Input",
	"sap/m/Link",
	"sap/m/OverflowToolbarLayoutData",
	"sap/m/ToolbarSpacer",
	"sap/m/OverflowToolbar",
	"sap/m/Select",
	"sap/ui/core/Item",
	"sap/ui/core/Core"
], function(
	createAndAppendDiv,
	coreLibrary,
	mobileLibrary,
	Label,
	Input,
	Link,
	OverflowToolbarLayoutData,
	ToolbarSpacer,
	OverflowToolbar,
	Select,
	Item,
	oCore
) {
	"use strict";

	// shortcut for sap.ui.core.VerticalAlign
	var VerticalAlign = coreLibrary.VerticalAlign;

	// shortcut for sap.m.LabelDesign
	var LabelDesign = mobileLibrary.LabelDesign;

	// shortcut for sap.ui.core.TextDirection
	var TextDirection = coreLibrary.TextDirection;

	// shortcut for sap.ui.core.TextAlign
	var TextAlign = coreLibrary.TextAlign;

	createAndAppendDiv("uiArea1");
	createAndAppendDiv("uiArea2");
	createAndAppendDiv("uiArea3");
	createAndAppendDiv("uiArea4");



	var sText = "Hello",
		sWidth = "111px",
		oTextAlignEnd = TextAlign.End,
		oTextAlignCenter = TextAlign.Center,
		oTextDirectionDefault = TextDirection.LTR,
		oTextDirectionRTL = TextDirection.RTL,
		oStandardDesign = LabelDesign.Standard,
		oBoldDesign = LabelDesign.Bold;

	var oLabel1 = new Label("l1");
	oLabel1.setText(sText);
	oLabel1.setWidth(sWidth);
	oLabel1.setTextAlign(oTextAlignEnd);
	oLabel1.setTextDirection(oTextDirectionRTL);
	oLabel1.setDesign(oStandardDesign);
	oLabel1.placeAt("uiArea1");

	var oLabel2 = new Label("l2", {
		text : sText,
		width : sWidth,
		textAlign : oTextAlignCenter,
		textDirection : oTextDirectionRTL,
		design : oBoldDesign
	});
	oLabel2.placeAt("uiArea2");

	var oLabel3 = new Label("l3", {
		text : sText,
		width : sWidth,
		visible: false
	});
	oLabel3.placeAt("uiArea3");

	var oLabel4 = new Label("l4", {
		text : sText,
		width : sWidth,
		labelFor : "I1"
	}).placeAt("uiArea4");

	var oInput = new Input("I1", {
		required: true,
		width : sWidth
	}).placeAt("uiArea4");

	var l1, l2;

	QUnit.module("Basic", {
		beforeEach : function(assert) {
			l1 = oCore.byId("l1");
			l2 = oCore.byId("l2");

			l1.setDesign(oStandardDesign);
			l1.setTextDirection(oTextDirectionDefault);

			l2.setWidth(sWidth);

			oCore.applyChanges();

			assert.ok(l1, "l1 should not be null");
			assert.ok(l2, "l2 should not be null");
			assert.ok(!document.getElementById("l3"), "l3 should not be rendered");
		},
		afterEach : function() {
			l1 = null;
			l2 = null;
		}
	});

	// test property accessor methods

	QUnit.test("VerticalAlignOk", function(assert) {
		assert.strictEqual(l1.getVAlign(), "Inherit", "l1.getVAlign() returns result: " + l1.getVAlign());
		assert.strictEqual(l2.getVAlign(), "Inherit", "l2.getVAlign() returns result: " + l2.getVAlign());
	});

	QUnit.test("TextOk", function(assert) {
		assert.strictEqual(l1.getText(), sText, "l1.getText() returns result: " + l1.getText());
		assert.strictEqual(l2.getText(), sText, "l2.getText() returns result: " + l2.getText());
	});

	QUnit.test("WidthOk", function(assert) {
		assert.strictEqual(l1.getWidth(), sWidth, "l1.getWidth() returns result: " + l1.getWidth());
		assert.strictEqual(l2.getWidth(), sWidth, "l2.getWidth() returns result: " + l2.getWidth());
	});

	QUnit.test("TextAlignOk", function(assert) {
		assert.strictEqual(l1.getTextAlign(), oTextAlignEnd, "l1.getTextAlign() returns result: " + l1.getTextAlign());
		assert.strictEqual(l2.getTextAlign(), oTextAlignCenter, "l2.getTextAlign() returns result: " + l2.getTextAlign());
	});

	QUnit.test("TextDirectionOk", function(assert) {
		assert.strictEqual(l1.getTextDirection(), oTextDirectionDefault, "l1.getTextDirection() returns result: " + l1.getTextDirection());
		assert.strictEqual(l2.getTextDirection(), oTextDirectionRTL, "l2.getTextDirection() returns result: " + l2.getTextDirection());
		assert.strictEqual(l2.$().find("bdi").attr("dir"), "rtl", "l2 has correct attribute 'dir' for RTL mode");
	});

	QUnit.test("DesignOk", function(assert) {
		assert.strictEqual(l1.getDesign(), oStandardDesign, "l1.getDesign() returns result: " + l1.getDesign());
		assert.strictEqual(l2.getDesign(), oBoldDesign, "l2.getDesign() returns result: " + l2.getDesign());
	});

	QUnit.test("Should set vertical alignment", function(assert) {
		assert.strictEqual(l1.getVAlign(), "Inherit", "should have vertical-align: inherit set as default");

		l1.setVAlign(VerticalAlign.Top);

		assert.ok(l1.$().attr("vertical-align", "top"), "should have vertical-align set on the DOM element");

		l1.setVAlign(VerticalAlign.Inherit);
	});

	QUnit.test("When width is not set max-width should apply to control", function(assert) {
		var sut = new Label({text : "text"}).placeAt("qunit-fixture");
		oCore.applyChanges();
		assert.ok(sut.$().hasClass("sapMLabelMaxWidth"), "Label has max width restriction for the trunctation.");

		sut.setWidth("100%");
		oCore.applyChanges();
		assert.ok(!sut.$().hasClass("sapMLabelMaxWidth"), "Label has width and does not have max width restriction.");
	});

	QUnit.test("Label wrapping", function(assert) {

		assert.strictEqual(l1.getWrapping(), false, "Has to be set to false.");
		assert.strictEqual(l2.getWrapping(), false, "Has to be set to false.");

		assert.strictEqual(l1.$().hasClass("sapMLabelWrapped"), false, "Doesn't have a class set.");
		assert.strictEqual(l2.$().hasClass("sapMLabelWrapped"), false, "Doesn't have a class set.");

		l1.setWrapping(true);
		l2.setWrapping(true);
		oCore.applyChanges();

		assert.strictEqual(l1.getWrapping(), true, "Has to be set to true.");
		assert.strictEqual(l2.getWrapping(), true, "Has to be set to true.");

		assert.strictEqual(l1.$().hasClass("sapMLabelWrapped"), true, "Has the appropriate class set.");
		assert.strictEqual(l2.$().hasClass("sapMLabelWrapped"), true, "Has the appropriate class set.");

		//reset values
		l1.setWrapping(false);
		l2.setWrapping(false);
		oCore.applyChanges();

		assert.strictEqual(l1.getWrapping(), false, "Has to be set to false.");
		assert.strictEqual(l2.getWrapping(), false, "Has to be set to false.");

		assert.strictEqual(l1.$().hasClass("sapMLabelWrapped"), false, "Doesn't have a class set.");
		assert.strictEqual(l2.$().hasClass("sapMLabelWrapped"), false, "Doesn't have a class set.");

		l2.setWrapping(true);
		oCore.applyChanges();

		assert.strictEqual(l2.getWrapping(), true, "Has to be set to true.");

		assert.strictEqual(l2.$().hasClass("sapMLabelWrapped"), true, "Has the appropriate class set.");

		//reset value
		l2.setWrapping(false);
		oCore.applyChanges();
	});

	QUnit.test("ShowColon", function(assert) {
		assert.notOk(l1.$().hasClass("sapMLabelShowColon"), "sapMLabelShowColon class is not set");

		l1.setShowColon(true);
		oCore.applyChanges();

		assert.ok(l1.$().hasClass("sapMLabelShowColon"), "sapMLabelShowColon class is set");

		//reset value
		l1.setShowColon(false);
		oCore.applyChanges();
	});

	QUnit.test("Label wrappingType (Hyphenation)", function(assert) {
		var done = assert.async();
		l1.setText("pneumonoultramicroscopicsilicovolcanoconiosis");
		var iHeight = l1.$().outerHeight();
		l1.setWidth("200px");
		l1.setWrapping(true);
		l1.setWrappingType(mobileLibrary.WrappingType.Hyphenated);
		oCore.applyChanges();

		var fnIsHyphenated = function () {
			if (l1.$().outerHeight() >= 2 * iHeight) {
				assert.ok(true, "Tested label is hyphenated.");
				done();
				return true;
			}
			return false;
		};

		setTimeout(function() {
			if (!fnIsHyphenated()) {
				// try again after a while if not yet hyphenatated
				setTimeout(function() {
					if ( !fnIsHyphenated() ) {
						assert.ok(false);
						done();
					}
				}, 1000);
			}
		}, 500);
	});

	QUnit.module("tooltip");

	QUnit.test("Should render a tooltip", function(assert) {
		// System under Test + Act
		var oLabel = new Label({
			tooltip : "foo"
		});
		oLabel.placeAt("qunit-fixture");
		oCore.applyChanges();

		// Assert
		assert.strictEqual(oLabel.$().attr("title"), "foo", "Tooltip got rendered");

		// Cleanup
		oLabel.destroy();
	});

	//I build this one in because if you bind the tooltip of a label to a json model which is connected to an input,
	//blur should not be triggered on every keystroke
	QUnit.test("DOM must be patched when tooltip is changed", function(assert) {
		// Arrange
		var oRerenderingSpy = this.spy();

		// System under Test
		var oLabel = new Label({
			tooltip : "foo"
		});
		oLabel.placeAt("qunit-fixture");
		oCore.applyChanges();
		var oDomRef = oLabel.getDomRef();

		oLabel.addEventDelegate({
			onBeforeRendering : oRerenderingSpy
		});

		// Act
		oLabel.setTooltip("bar");
		oCore.applyChanges();

		// Assert
		assert.strictEqual(oRerenderingSpy.callCount, 1, "Label is rerendered");
		assert.strictEqual(oLabel.getDomRef(), oDomRef, "...but DOM reference is not changed");
		assert.strictEqual(oLabel.$().attr("title"), "bar", "Tooltip got updated");

		// Cleanup
		oLabel.destroy();
	});

	QUnit.test("Should be able to set the text to 0", function(assert) {
		// System under Test
		var oLabel = new Label({
			text : ""
		});

		// Act
		oLabel.setText(0);
		var sText = oLabel.getText();

		// Assert
		assert.strictEqual(sText, "0", "Did set the text");

		// Cleanup
		oLabel.destroy();
	});

	QUnit.test("Label should be shrinkable", function(assert) {
		var oLabel = new Label();
		assert.ok(oLabel.getMetadata().isInstanceOf("sap.ui.core.IShrinkable"), "Label control implements IShrinkable interface");
		oLabel.destroy();
	});

	QUnit.test("Label should get required from labeled control", function(assert) {

		assert.ok(oLabel4.$().hasClass("sapMLabelRequired"), "Label is required");
		oInput.setRequired(false);
		oCore.applyChanges();
		assert.ok(!oLabel4.$().hasClass("sapMLabelRequired"), "Label is not required");
		oInput.setRequired(true);
		oCore.applyChanges();
		assert.ok(oLabel4.$().hasClass("sapMLabelRequired"), "Label is required");
		oLabel4.setLabelFor();
		oCore.applyChanges();
		assert.ok(!oLabel4.$().hasClass("sapMLabelRequired"), "Label is not required");
		oLabel4.setLabelFor("I1");
		oCore.applyChanges();
		assert.ok(oLabel4.$().hasClass("sapMLabelRequired"), "Label is required");

	});

	QUnit.module("Accessibility", {
		beforeEach: function() {
			this.label = new Label({text: "Label"});
			this.label.placeAt("qunit-fixture");
			oCore.applyChanges();

			this.oLabel = new Label('label2', {
				text: 'Selected: 1'
			}).placeAt('qunit-fixture');
			oCore.applyChanges();
		},
		afterEach: function() {
			this.oLabel.destroy();
			this.oLabel = null;
			this.label.destroy();
			this.label = null;
		}
	});

	QUnit.test("getAccessibilityInfo", function(assert) {
		assert.ok(!!this.label.getAccessibilityInfo, "Label has a getAccessibilityInfo function");
		var oInfo = this.label.getAccessibilityInfo();
		assert.ok(!!oInfo, "getAccessibilityInfo returns a info object");
		assert.strictEqual(oInfo.role, undefined, "AriaRole");
		assert.strictEqual(oInfo.type, undefined, "Type");
		assert.strictEqual(oInfo.description, "Label", "Description");
		assert.strictEqual(oInfo.focusable, undefined, "Focusable");
		assert.strictEqual(oInfo.enabled, undefined, "Enabled");
		assert.strictEqual(oInfo.editable, undefined, "Editable");
		assert.strictEqual(oInfo.required, false, "Required");
	});

	QUnit.test("getAccessibilityInfo with required=true", function(assert) {
		this.label.setRequired(true);

		var oInfo = this.label.getAccessibilityInfo();
		assert.strictEqual(oInfo.description, "Label", "Description");
		assert.ok(oInfo.required, "Required");

		this.label.setRequired(false);
	});

	QUnit.test("Label rendering when no labelFor association is set", function (assert) {
		assert.strictEqual(this.label.getDomRef() instanceof HTMLSpanElement, true, "Should be rendered as a span element");
		assert.ok(!this.label.$().find(".sapMLabelColonAndRequired").attr("aria-hidden"), "aria-hdden not set on : and *");
	});

	QUnit.test("Label rendering when labelFor association is set", function (assert) {
		var oInput = new Input().placeAt("qunit-fixture");
		oCore.applyChanges();
		this.label.setLabelFor(oInput);
		oCore.applyChanges();

		assert.strictEqual(this.label.getDomRef() instanceof HTMLLabelElement, true, "Should be rendered as a label element");
		assert.strictEqual(this.label.$().find(".sapMLabelColonAndRequired").attr("aria-hidden"), "true", "aria-hdden correctly set on : and *");

		oInput.destroy();
	});

	QUnit.test("Label rendering when labelFor association is set to non-labelable control", function (assert) {
		var oLink = new Link({text: "text"}).placeAt("qunit-fixture");

		oCore.applyChanges();

		this.label.setLabelFor(oLink);

		assert.strictEqual(this.label.getDomRef() instanceof HTMLSpanElement, true,
				"Should be rendered as a span element when the labelFor points to a non-labelable control");
		assert.ok(!this.label.$().find(".sapMLabelColonAndRequired").attr("aria-hidden"), "aria-hdden not set on : and *");

		oLink.destroy();
	});

	QUnit.test("Label in column header", function (assert) {
		assert.ok(!this.label.$().find(".sapMLabelColonAndRequired").attr("aria-hidden"), "aria-hdden not set on : and *");
		this.label.setIsInColumnHeaderContext(true);
		this.label.invalidate();
		oCore.applyChanges();
		assert.ok(this.label._isInColumnHeaderContext, "Label is marked as column header label");
		assert.strictEqual(this.label.$().find(".sapMLabelColonAndRequired").attr("aria-hidden"), "true", "aria-hdden correctly set on : and *");
		this.label.setIsInColumnHeaderContext(false);
		this.label.invalidate();
		oCore.applyChanges();
		assert.ok(!this.label._isInColumnHeaderContext, "Label is not marked as column header label");
		assert.ok(!this.label.$().find(".sapMLabelColonAndRequired").attr("aria-hidden"), "aria-hdden not set on : and *");
	});

	QUnit.module("DisplayOnly mode", {
		beforeEach: function() {
			this.label = new Label({text: "Sample Label"});
			this.label.placeAt("qunit-fixture");
			oCore.applyChanges();
		},
		afterEach: function() {
			this.label.destroy();
			this.label = null;
		}
	});

	QUnit.test("Initial value", function (assert) {
		assert.strictEqual(this.label.getDisplayOnly(), false, "The property displayOnly should be false by default.");
	});

	QUnit.test("Setting the displayOnly property", function (assert) {
		var afterRenderingSpy = sinon.spy(this.label, "onAfterRendering");

		var domRef = this.label.getDomRef();
		var result = this.label.setDisplayOnly(true);
		oCore.applyChanges();

		assert.strictEqual(this.label.getDisplayOnly(), true, "The property displayOnly should be set tot true");
		assert.strictEqual(result, this.label, "Setter should return this for chaining");
		assert.strictEqual(this.label.$().hasClass("sapMLabelDisplayOnly"), true, "The right class should be applied");
		assert.strictEqual(afterRenderingSpy.callCount, 1, "The change should cause rerendering");
		assert.strictEqual(this.label.getDomRef(), domRef, "...but DOM reference is not changed");

		this.label.onAfterRendering.restore();
	});

	QUnit.module("Label in Overflow Toolbar", {
		beforeEach: function () {
			this.clock = sinon.useFakeTimers();
		},

		afterEach: function () {
			this.clock.restore();
		}
	});

	QUnit.test("Grouped labels are identified", function (assert) {
		var oSingleLabel = new Label({ text: "Single label"}),
			oGroupedLabel = new Label({
			text: "Label For Control",
				layoutData: new OverflowToolbarLayoutData({group: 1}),
				labelFor: "labelledControlId"
			}),
			oLabelledControl = new Input("labelledControlId", {layoutData: new OverflowToolbarLayoutData({group: 1})}),

			aToolbarContent = [
				new ToolbarSpacer(),
				oSingleLabel,
				oGroupedLabel,
				oLabelledControl
			],
			oOverflowTB = new OverflowToolbar({width: 'auto', content: aToolbarContent});

		oOverflowTB.placeAt("qunit-fixture");
		oCore.applyChanges();

		oOverflowTB.setWidth('10px'); // set small width that causes all content to move to the overflow
		this.clock.tick(1000);

		assert.strictEqual(oGroupedLabel.hasStyleClass("sapMLabelMediumMarginTop"), true, "grouped label is correctly marked in the overflow");
		assert.strictEqual(oSingleLabel.hasStyleClass("sapMLabelMediumMarginTop"), false, "non-grouped label is correctly marked in the overflow");

		// remove the labelled control
		oOverflowTB.removeContent(oLabelledControl);
		this.clock.tick(1000);

		assert.strictEqual(oGroupedLabel.hasStyleClass("sapMLabelMediumMarginTop"), false, "grouped label is correctly marked in the overflow");

		oOverflowTB.destroy();
		oLabelledControl.destroy();
	});

	QUnit.module("LabelFor with non-labelable controls", {
		beforeEach: function () {
			this.select = new Select('select1', {
				items: [
					new Item({text: 'item 1'}),
					new Item({text: 'item 2'}),
					new Item({text: 'item 3'})
				]
			}).placeAt('qunit-fixture');

			this.label = new Label('label1', {
				text: 'Hello World'
			}).placeAt('qunit-fixture');

			oCore.applyChanges();
		},

		afterEach: function () {
			this.select.destroy();
			this.label.destroy();
		}
	});

	QUnit.test("aria-labelledby is correctly set", function (assert) {
		var ariaLabelledby = this.select._getHiddenSelect().attr('aria-labelledby') || "";

		assert.equal(ariaLabelledby.indexOf(this.label.getId()), -1, "aria-labelledby doesn't contain label id");

		this.label.setLabelFor(this.select);

		oCore.applyChanges();

		ariaLabelledby = this.select._getHiddenSelect().attr('aria-labelledby') || "";

		assert.equal(ariaLabelledby.indexOf(this.label.getId()) > -1, true, "aria-labelledby contains label id");
	});
});