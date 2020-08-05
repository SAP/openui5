/*eslint no-undef:1, no-unused-vars:1, strict: 1 */
/*global QUnit, sinon */
/*eslint no-undef:1, no-unused-vars:1, strict: 1 */


sap.ui.define([
	"sap/m/Bar",
	"sap/ui/thirdparty/flexie",
	"sap/m/Button",
	"sap/m/Label",
	"sap/m/Image",
	"jquery.sap.global",
	"sap/m/BarRenderer",
	"sap/ui/Device",
	"sap/ui/core/ResizeHandler",
	"sap/ui/core/InvisibleText"
], function(
	Bar,
	flexie,
	Button,
	Label,
	Image,
	jQuery,
	BarRenderer,
	Device,
	ResizeHandler,
	InvisibleText
) {
	QUnit.module("rendering");

	function renderingTest (fnAssertions) {

		//Arrange systems under test
		var bar = new Bar("myBar", {
			contentLeft: [ new Button('CancelBtn', {text: "Cancel"})],
			contentMiddle: [ new Label("myLabel", {text: "my Bar"})],
			contentRight: [ new Button('EditBtn', {text: "Edit"})]
		}).placeAt("qunit-fixture");

		var bar1 = new Bar("myBar1", {
			contentLeft: [ new Image("myIcon", {src: "../images/SAPUI5.jpg"})],
			contentMiddle: [ new Label("myLabel1", {text: "my Bar 1"})],
			contentRight: [ new Button('EditBtn1', {text: "Edit"})]
		}).placeAt("qunit-fixture");

		var bar2 = new Bar("myBar2", {
			enableFlexBox: true,
			contentLeft: [ new Image({src: "../images/SAPUI5.jpg"})],
			contentMiddle: [ new Label({text: "my Bar 1"})],
			contentRight: [ new Button({text: "Edit"})]
		}).placeAt("qunit-fixture");

		//Act
		sap.ui.getCore().applyChanges();

		//Assert
		fnAssertions();

		//cleanup
		bar.destroy();
		bar1.destroy();
		bar2.destroy();
	}

	QUnit.test("Should render the bars", function(assert) {

		renderingTest.call(this, function() {

			assert.ok(jQuery.sap.domById("myBar"), "Bar should be rendered");
			assert.ok(jQuery.sap.domById("myBar1"), "Bar1 should be rendered");

		});

	});

	// This is more like visual test, but will leave it as it is for now.
	QUnit.test("Should position the bars", function(assert) {

		renderingTest.call(this, function() {

			assert.equal(jQuery.sap.byId("myBar1").position().top, (jQuery.sap.byId("myBar").position().top + jQuery.sap.byId("myBar").outerHeight()),
					"Bar1 should be located below Bar");

		});

	});

	QUnit.test("content Element position", function(assert) {

		renderingTest.call(this, function() {

			assert.ok(jQuery.sap.byId("CancelBtn").parent().hasClass("sapMBarLeft"), "header button should have class sapMBarLeft");
			assert.ok(jQuery.sap.byId("myIcon").parent().hasClass("sapMBarLeft"), "header icon should have class sapMBarLeft");
			assert.ok(jQuery.sap.byId("myLabel").parent().hasClass("sapMBarPH"), "label should have class sapMBarPH");
			assert.ok(jQuery.sap.byId("myLabel1").parent().hasClass("sapMBarPH"), "label should have class sapMBarPH");
			assert.ok(jQuery.sap.byId("EditBtn").parent().hasClass("sapMBarRight"), "header button should have class sapMBarRight");
			assert.ok(jQuery.sap.byId("EditBtn1").parent().hasClass("sapMBarRight"), "header button should have class sapMBarRight");

		});

	});

	QUnit.test("Should set the design class to the containers", function(assert) {
		// Arrange
		var sBarBaseContext = "sapMIBar-CTX";

		// System under Test
		var oBar = new Bar().placeAt("qunit-fixture");

		// Act
		sap.ui.getCore().applyChanges();

		var sExpectedClass = BarRenderer.getContext(oBar);

		// Assert
		assert.ok(oBar.$().hasClass(sExpectedClass), "the left button parent had the class " + sExpectedClass);
		assert.ok(oBar.$().hasClass(sBarBaseContext), "the left button parent had the class " + sBarBaseContext);

		//Cleanup
		oBar.destroy();
	});

	QUnit.test("Should get the correct contexts", function(assert) {
		// System under Test
		var oBar = new Bar().placeAt("qunit-fixture");

		// Act
		sap.ui.getCore().applyChanges();

		var oExpectedContexts = oBar.getContext(oBar);

		// Assert
		assert.equal(Object.keys(oExpectedContexts).length, 4, "There are four contexts");
		assert.ok(oExpectedContexts["header"], "returned contexts has 'header' context");
		assert.ok(oExpectedContexts["subheader"], "returned contexts has 'subheader' context");
		assert.ok(oExpectedContexts["footer"], "returned contexts has 'footer' context");
		assert.ok(oExpectedContexts["dialogFooter"], "returned contexts has 'dialogFooter' context");

		//Cleanup
		oBar.destroy();
	});

	QUnit.test("tag property", function(assert) {

		renderingTest.call(this, function() {

			assert.ok(jQuery.sap.byId("myBar").is("div"), "bar should be rendered as div");
			assert.ok(jQuery.sap.byId("myBar1").is("div"), "bar1 should be rendered as div");

			var bar = sap.ui.getCore().byId("myBar");
			bar.setHTMLTag('Header');
			bar.rerender();
			assert.ok(jQuery.sap.byId("myBar").is("header"), "bar should be rendered as header");

			var bar1 = sap.ui.getCore().byId("myBar1");
			bar1.setHTMLTag('Footer');
			bar1.rerender();
			assert.ok(jQuery.sap.byId("myBar1").is("footer"), "bar1 should be rendered as footer");

			var bar2 = sap.ui.getCore().byId("myBar2");
			bar2.setHTMLTag('H1');
			bar2.rerender();
			assert.ok(jQuery.sap.byId("myBar2").is("H1"), "bar2 should be rendered as H1");
			assert.equal(bar2.getHTMLTag(), "H1", "Even when sap.m.Bar has HTML tag set with value different than header and footer, " +
				"the getHTMLTag should behave in one and the same way- should return the tag value itself");
		});

	});

	QUnit.test("should add and remove the flexBox", function(assert) {

		renderingTest.call(this, function() {

			var bar2 = sap.ui.getCore().byId("myBar2");
			assert.ok(jQuery.sap.byId("myBar2-BarPH").hasClass("sapMFlexBox"), "header placeholder should be a FlexBox with class sapMFlexBox");
			assert.ok(jQuery.sap.byId("myBar2-BarPH").hasClass("sapMHBox"), "header placeholder should be a HBox with class sapMHBox");
			bar2.setEnableFlexBox(false);

			sap.ui.getCore().applyChanges();

			assert.ok(!jQuery.sap.byId("myBar2-BarPH").hasClass("sapMFlexBox"), "header placeholder should not be a FlexBox with class sapMFlexBox");
			assert.ok(!jQuery.sap.byId("myBar2-BarPH").hasClass("sapMHBox"), "header placeholder should not be a HBox with class sapMHBox");

		});
	});

	QUnit.test("Should set the translucent class if on a touch device", function(assert) {
		var //System under Test
			sut = new Bar({
				translucent : true
			});

		//Arrange
		this.stub(Device.support, "touch", true);

		//Act
		sut.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		//Assert
		assert.strictEqual(sut.$().filter(".sapMBarTranslucent").length,1,"translucent class got set");

		//Cleanup
		sut.destroy();
	});

	QUnit.test("Should not register resize handlers if the bar is invisible", function(assert) {
		var //System under Test
				oBar = new Bar({
					visible : true,
					contentLeft : new Button()
				});

		//Arrange + Act
		oBar.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();
		var fnSpy = this.spy(ResizeHandler, "register");

		//Act
		oBar.setVisible(false);
		sap.ui.getCore().applyChanges();

		//Assert
		assert.strictEqual(fnSpy.callCount, 0,"the resize listeners did not get registered");

		//Cleanup
		oBar.destroy();
	});

	var iMargin = 4;
	var iStartEndPadding = 4;

	QUnit.test("Each first child should not have margins and each none first should have", function(assert) {
		// Arrange
		var oFirstButton = new Button("first"),
			oMiddleButton = new Button("middle"),
			oLastButton = new Button("last");

		// System under Test + Act
		var oBar = new Bar({
			contentLeft : [oFirstButton],
			contentRight : [
				oMiddleButton,
				oLastButton
			]
		});

		// Act + assert
		oBar.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		// Assert
		function assertButton (oButton, oMargins) {
			if (sap.ui.getCore().getConfiguration().getRTL()) {
				assert.strictEqual(oButton.$().css("margin-left"), oMargins.right + "px", oButton + " did have the correct right margin");
				assert.strictEqual(oButton.$().css("margin-right"),  oMargins.left + "px", oButton + " did have the correct left margin");
			} else {
				assert.strictEqual(oButton.$().css("margin-left"), oMargins.left + "px", oButton + " did have the correct left margin");
				assert.strictEqual(oButton.$().css("margin-right"),  oMargins.right + "px", oButton + " did have the correct right margin");
			}
		}

		assertButton(oFirstButton, {
			left: 0,
			right : 0
		});

		assertButton(oMiddleButton, {
			left: 0,
			right : 0
		});

		assertButton(oLastButton, {
			left: iMargin,
			right : 0
		});

		if (sap.ui.getCore().getConfiguration().getRTL()) {
			assert.strictEqual(oBar.$("BarLeft").css("padding-right"), iStartEndPadding + "px", "Left bar does have a padding");
		} else {
			assert.strictEqual(oBar.$("BarLeft").css("padding-left"), iStartEndPadding + "px", "Left bar does have a padding");
		}

		// Cleanup
		oBar.destroy();
	});

	function getBarContentStyles(sut) {
		var oBarStyles = getJqueryObjectsForBar(sut);

		return {
			left: oBarStyles.$left.attr("style") ? oBarStyles.$left.attr("style").replace(/[;|\s]/g, "") : "",
			right: oBarStyles.$right.attr("style") ? oBarStyles.$right.attr("style").replace(/[;|\s]/g, "") : "",
			mid: oBarStyles.$mid.attr("style") ? oBarStyles.$mid.attr("style").replace(/[;|\s]/g, "") : ""
		};
	}
	function createSUTSingleAggregation(sAggregationName) {
		var oSut;
		switch (sAggregationName) {
			case "contentLeft":
				oSut = new Bar({contentLeft: [ new Button()]});
				break;
			case "contentMiddle":
				oSut = new Bar({contentMiddle: [ new Button()]});
				break;
			case "contentRight":
				oSut = new Bar({contentRight: [ new Button()]});
				break;
			default: "Invalid aggregation " + sAggregationName;
		}
		return oSut;
	}
	QUnit.test("Single left aggregation is set with width 100%", function(assert) {
		//Sut
		var sut = createSUTSingleAggregation("contentLeft"),
				oBarWidths;

		//Assert
		function check (sMsgPrefix) {
			oBarWidths = getBarContentStyles(sut);
			assert.equal("width:100%", oBarWidths.left, sMsgPrefix + " Left Content width must be set to 100%");
			assert.notEqual("width:100%", oBarWidths.mid, sMsgPrefix + " Middle Content width must not be set to 100%");
			assert.notEqual("width:100%", oBarWidths.right, sMsgPrefix + " Right Content width must not be set to 100%");
		}

		//Arrange
		var oStub = sinon.stub(sut, "onAfterRendering", function() {
		   //Assert
		   check("just before onAfterRendering:");
		   Bar.prototype.onAfterRendering.apply(sut, arguments);
		});
		sut.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		//Assert
		check("after onAfterRendering");

		//Cleanup
		oStub.restore();
		sut.destroy();
	});

	QUnit.test("Single middle aggregation is set with width 100%", function(assert) {
		//Sut
		var sut = createSUTSingleAggregation("contentMiddle"),
				oBarWidths;

		//Assert
		function check (sMsgPrefix) {
			oBarWidths = getBarContentStyles(sut);
			assert.notEqual("width:100%", oBarWidths.left, sMsgPrefix + " Left Content width must not be set to 100%");
			assert.equal("width:100%",oBarWidths.mid, sMsgPrefix + " Middle Content width must be set to 100%");
			assert.notEqual("width:100%", oBarWidths.right, sMsgPrefix + " Right Content width must not be set to 100%");
		}

		//Arrange
		var oStub = sinon.stub(sut, "onAfterRendering", function() {
			//Assert
			check("just before onAfterRendering:");
			Bar.prototype.onAfterRendering.apply(sut, arguments);
		});
		sut.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		//Assert
		check("after onAfterRendering");

		//Cleanup
		oStub.restore();
		sut.destroy();
	});

	QUnit.test("Single right aggregation is set with width 100%", function(assert) {
		//Sut
		var sut = createSUTSingleAggregation("contentRight"),
				oBarWidths;

		//Assert
		function check (sMsgPrefix) {
			oBarWidths = getBarContentStyles(sut);
			assert.notEqual("width:100%", oBarWidths.left, sMsgPrefix + " Left Content width must not be set to 100%");
			assert.notEqual("width:100%", oBarWidths.mid, sMsgPrefix + " Middle Content width must not be set to 100%");
			assert.equal("width:100%", oBarWidths.right, sMsgPrefix + " Right Content width must be set to 100%");
		}

		//Arrange
		var oStub = sinon.stub(sut, "onAfterRendering", function() {
			//Assert
			check("just before onAfterRendering:");
			Bar.prototype.onAfterRendering.apply(sut, arguments);
		});
		sut.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		//Assert
		check("after onAfterRendering");

		//Cleanup
		oStub.restore();
		sut.destroy();
	});

	QUnit.test("ariaLabbeledBy", function(assert) {

	//Arrange
	var oBar = new Bar(),
	oInvisibleText = new InvisibleText({text: "invisible text"});

	oBar.addAriaLabelledBy(oInvisibleText.toStatic());

	//Assert
	assert.equal(oBar.getAriaLabelledBy(), oInvisibleText.getId(), "Bar has attribute aria-labelledby to the internal label");

	//Cleanup
	oInvisibleText.destroy();
	oBar.destroy();
});

	//Firefox has flexbox therefore positioning is different
	if (Device.browser.firefox) {
		return;
	}

	QUnit.module("positioning");

	function getJqueryObjectsForBar (oBar) {
		var sBarId = oBar.getId();

		return {
			$left : jQuery("#" + sBarId + "-BarLeft"),
			$mid : jQuery("#" + sBarId + "-BarPH"),
			$right : jQuery("#" + sBarId + "-BarRight")
		};
	}

	function elementHasNoWidth(assert, $element, sElementName) {
		var style = $element.attr("style");

		if (style) {

			assert.strictEqual(style.indexOf("width"), -1, sElementName + " has no inline width set style was " + style);

		} else {

			assert.ok(true, sElementName + " has no inline style");

		}
	}

	function elementHasNoLeftOrRight(assert, $element, sElementName) {
		var stlye = $element.attr("style");

		if (stlye) {

			assert.strictEqual(stlye.indexOf("right"), -1, sElementName + " has no inline right set style was " + stlye);
			assert.strictEqual(stlye.indexOf("left"), -1, sElementName + " has no inline left set style was " + stlye);

		} else {

			assert.ok(true, sElementName + " has no inline style");

		}
	}

	function createAndPlaceSUT(iLeftBarouterWidth, iRightBarouterWidth, iMidBarouterWidth) {
		var leftButton, rightButton, midButton;

		if (iLeftBarouterWidth !== undefined) {
			leftButton = new Button({
				width : iLeftBarouterWidth + "px"
			});
		}

		if (iRightBarouterWidth !== undefined) {
			rightButton = new Button({
				width : iRightBarouterWidth + "px"
			});
		}

		if (iMidBarouterWidth !== undefined) {
			midButton = new Button({
				width : iMidBarouterWidth + "px"
			});
		}

		//System under Test
		var sut = new Bar({
			contentLeft : leftButton,
			contentMiddle : midButton,
			contentRight : rightButton
		});

		jQuery("#qunit-fixture").width("500px");
		sut.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		return sut;
	}

	function testAlsoForRTL(sName, fnTest) {
		QUnit.test(sName, function (assert) {
			var config = sap.ui.getCore().getConfiguration();

			//turn on rtl for this test
			this.stub(config, "getRTL", function() {
				return false;
			});

			fnTest.call(this, assert);
		});

		QUnit.test(sName + " RTL", function (assert) {
			var config = sap.ui.getCore().getConfiguration();

			//turn on rtl for this test
			this.stub(config, "getRTL", function() {
				return true;
			});

			fnTest.call(this, assert);
		});
	}

	testAlsoForRTL("Should position the mid content centered, left content left and right content right, if nothing overlaps", function(assert) {
		//Arrange + System under Test + Act
		//left | right | mid
		var sut = createAndPlaceSUT(100, 100, 100);

		//Assert
		var oBarInternals = getJqueryObjectsForBar(sut);

		assert.strictEqual(oBarInternals.$left.outerWidth(), 100 + iStartEndPadding, "left outerWidth is correct");
		elementHasNoWidth(assert, oBarInternals.$left, "left Bar");
		elementHasNoLeftOrRight(assert, oBarInternals.$left, "left Bar");

		assert.strictEqual(oBarInternals.$mid.outerWidth(), 100 + iStartEndPadding * 2, "mid outerWidth is correct");
		elementHasNoWidth(assert, oBarInternals.$mid, "mid Bar");
		elementHasNoLeftOrRight(assert, oBarInternals.$left, "mid Bar");

		assert.strictEqual(oBarInternals.$right.outerWidth(), 100 + iStartEndPadding, "right outerWidth is correct");
		elementHasNoWidth(assert, oBarInternals.$right, "right Bar");
		elementHasNoLeftOrRight(assert, oBarInternals.$right, "right Bar");

		//Cleanup
		sut.destroy();
		jQuery("#qunit-fixture").width("");
	});

	testAlsoForRTL("Should hide the mid content, and shorten leftContent if right content overlaps the leftContent", function(assert) {
		//Arrange + System under Test + Act
		//left | right | mid
		var sut = createAndPlaceSUT(100, 450, 100);

		//Assert
		var oBarInternals = getJqueryObjectsForBar(sut);

		assert.strictEqual(oBarInternals.$left.outerWidth(), 50 - iStartEndPadding, "left outerWidth is correct");
		elementHasNoLeftOrRight(assert, oBarInternals.$left, "left Bar");

		assert.strictEqual(oBarInternals.$mid.outerWidth(), 0 + iStartEndPadding * 2, "mid outerWidth is correct");
		elementHasNoLeftOrRight(assert, oBarInternals.$mid, "mid Bar");

		assert.strictEqual(oBarInternals.$right.outerWidth(), 450 + iStartEndPadding, "right outerWidth is correct");
		elementHasNoLeftOrRight(assert, oBarInternals.$right, "right Bar");

		//Cleanup
		sut.destroy();
		jQuery("#qunit-fixture").width("");
	});

	testAlsoForRTL("Should hide the mid content, and shorten leftContent if left content overlaps the RightContent", function(assert) {
		//Arrange + System under Test + Act
		//left | right | mid
		var sut = createAndPlaceSUT(450, 100, 100);

		//Assert
		var oBarInternals = getJqueryObjectsForBar(sut);

		assert.strictEqual(oBarInternals.$left.outerWidth(), 400 - iStartEndPadding, "left outerWidth is correct");
		elementHasNoLeftOrRight(assert, oBarInternals.$left, "left Bar");

		assert.strictEqual(oBarInternals.$mid.outerWidth(), 0 + iStartEndPadding * 2, "mid outerWidth is correct");
		elementHasNoLeftOrRight(assert, oBarInternals.$mid, "mid Bar");

		assert.strictEqual(oBarInternals.$right.outerWidth(), 100 + iStartEndPadding, "right outerWidth is correct");
		elementHasNoLeftOrRight(assert, oBarInternals.$right, "right Bar");

		//Cleanup
		sut.destroy();
		jQuery("#qunit-fixture").width("");
	});

	testAlsoForRTL("Should push the Middle content to the space between left and right if the left content overlaps the centered mid content", function(assert) {
		//Arrange + System under Test + Act
		//left | right | mid
		var sut = createAndPlaceSUT(225, 100, 100);

		//Assert
		var oBarInternals = getJqueryObjectsForBar(sut);

		assert.strictEqual(oBarInternals.$left.outerWidth(), 225 + iStartEndPadding, "left outerWidth is correct");

		assert.strictEqual(oBarInternals.$mid.outerWidth(), 175 -  iStartEndPadding * 2, "mid outerWidth is correct");

		assert.strictEqual(oBarInternals.$right.outerWidth(), 100 + iStartEndPadding, "right outerWidth is correct");

		//Cleanup
		sut.destroy();
		jQuery("#qunit-fixture").width("");
	});

	QUnit.test("Should push the mid to the center of the remaining space, if the right content overlaps it", function(assert) {
		var config = sap.ui.getCore().getConfiguration();

		//turn on rtl for this test
		this.stub(config, "getRTL", function() {
			return false;
		});

		//Arrange + System under Test + Act
		//left | right | mid
		var sut = createAndPlaceSUT(undefined, 225, 100);

		//Act
		jQuery("#qunit-fixture").width("500px");
		sut.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		//Assert
		var oBarInternals = getJqueryObjectsForBar(sut);

		assert.strictEqual(oBarInternals.$left.outerWidth(), 0 + iStartEndPadding, "left outerWidth is correct");

		assert.strictEqual(oBarInternals.$mid.outerWidth(), 500 - 225 -  iStartEndPadding * 2, "mid outerWidth is the remaining space");
		assert.strictEqual(oBarInternals.$mid.css("left"), 0 +  iStartEndPadding + "px", "mid was positioned at the left edge");

		assert.strictEqual(oBarInternals.$right.outerWidth(), 225 + iStartEndPadding, "right outerWidth is correct");

		//Cleanup
		sut.destroy();
		jQuery("#qunit-fixture").width("");
	});

	QUnit.test("Should push the mid to the center of the remaining space, if the right content overlaps it RTL", function(assert) {
		var config = sap.ui.getCore().getConfiguration();

		//turn on rtl for this test
		this.stub(config, "getRTL", function() {
			return true;
		});

		//Arrange + System under Test + Act
		//left | right | mid
		var sut = createAndPlaceSUT(undefined, 225, 100);

		//Act
		jQuery("#qunit-fixture").width("500px");
		sut.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		//Assert
		var oBarInternals = getJqueryObjectsForBar(sut);

		assert.strictEqual(oBarInternals.$left.outerWidth(), 0 + iStartEndPadding, "left outerWidth is correct");

		assert.strictEqual(oBarInternals.$mid.outerWidth(), 500 - 225 -  iStartEndPadding * 2, "mid outerWidth is the remaining space");
		assert.strictEqual(oBarInternals.$mid.css("left"), 225 + iStartEndPadding + "px", "mid was positioned at the right edge");

		assert.strictEqual(oBarInternals.$right.outerWidth(), 225 + iStartEndPadding, "right outerWidth is correct");

		//Cleanup
		sut.destroy();
		jQuery("#qunit-fixture").width("");
	});

	testAlsoForRTL("Should hide left and mid content, if the right content is bigger than the bar", function(assert) {
		//Arrange + System under Test + Act
		//left | right | mid
		var sut = createAndPlaceSUT(100, 600, 100);

		//Assert
		var oBarInternals = getJqueryObjectsForBar(sut);

		assert.strictEqual(oBarInternals.$left.outerWidth(), 0 + iStartEndPadding, "left outerWidth is correct");

		assert.strictEqual(oBarInternals.$mid.outerWidth(), 0 + iStartEndPadding * 2, "mid outerWidth is correct");

		assert.strictEqual(oBarInternals.$right.outerWidth(), 500, "right outerWidth is correct");

		//Cleanup
		sut.destroy();
		jQuery("#qunit-fixture").width("");
	});

	testAlsoForRTL("Should hide mid content, if the left content is bigger than the bar", function(assert) {
		//Arrange + System under Test + Act
		//left | right | mid
		var sut = createAndPlaceSUT(600, undefined, 100);

		//Act
		jQuery("#qunit-fixture").width("500px");
		sut.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		//Assert
		var oBarInternals = getJqueryObjectsForBar(sut);

		assert.strictEqual(oBarInternals.$left.outerWidth(), 500 - iStartEndPadding, "left width is correct");

		assert.strictEqual(oBarInternals.$mid.outerWidth(), 0 + iStartEndPadding * 2, "mid outerWidth is correct");

		assert.strictEqual(oBarInternals.$right.outerWidth(), 0 + iStartEndPadding, "right outerWidth is correct");

		//Cleanup
		sut.destroy();
		jQuery("#qunit-fixture").width("");
	});

	testAlsoForRTL("Should make the mid content smaller, if there is a left and right content", function(assert) {
		//Arrange + System under Test + Act
		//left | right | mid
		var sut = createAndPlaceSUT(100, 100, 500);

		//Act
		jQuery("#qunit-fixture").width("500px");
		sut.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		//Assert
		var oBarInternals = getJqueryObjectsForBar(sut);

		assert.strictEqual(oBarInternals.$left.outerWidth(), 100 + iStartEndPadding, "left outerWidth is correct");

		assert.strictEqual(oBarInternals.$mid.outerWidth(), 300 -  iStartEndPadding * 2, "mid outerWidth is correct");

		assert.strictEqual(oBarInternals.$right.outerWidth(), 100 + iStartEndPadding, "right outerWidth is correct");

		//Cleanup
		sut.destroy();
		jQuery("#qunit-fixture").width("");
	});

	testAlsoForRTL("Should push the mid content, right content that overlaps", function(assert) {
		//Arrange + System under Test + Act
		//left | right | mid
		var sut = createAndPlaceSUT(undefined, 225, 100);

		//Act
		jQuery("#qunit-fixture").width("500px");
		sut.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		//Assert
		var oBarInternals = getJqueryObjectsForBar(sut);

		assert.strictEqual(oBarInternals.$left.outerWidth(), 0 + iStartEndPadding, "left outerWidth is correct");

		assert.strictEqual(oBarInternals.$mid.outerWidth(), 500 - 225 - iStartEndPadding * 2, "mid outerWidth was taking the remaining space");

		assert.strictEqual(oBarInternals.$right.outerWidth(), 225 + iStartEndPadding, "right outerWidth is correct");

		//Cleanup
		sut.destroy();
		jQuery("#qunit-fixture").width("");
	});

	testAlsoForRTL("Should give the right content the whole space if its the only content", function(assert) {
		//Arrange + System under Test + Act
		//left | right | mid
		var sut = createAndPlaceSUT(undefined, 100, undefined);

		//Act
		jQuery("#qunit-fixture").width("500px");
		sut.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		//Assert
		var oBarInternals = getJqueryObjectsForBar(sut);

		assert.strictEqual(oBarInternals.$left.outerWidth(), 0 + iStartEndPadding, "left outerWidth is correct");
		elementHasNoLeftOrRight(assert, oBarInternals.$left, "left Bar");


		assert.strictEqual(oBarInternals.$mid.outerWidth(), 0 + iStartEndPadding * 2, "mid outerWidth was taking the remaining space");
		elementHasNoLeftOrRight(assert, oBarInternals.$mid, "mid Bar");


		assert.strictEqual(oBarInternals.$right.outerWidth(), 500, "right outerWidth is correct");
		elementHasNoLeftOrRight(assert, oBarInternals.$right, "right Bar");


		//Cleanup
		sut.destroy();
		jQuery("#qunit-fixture").width("");
	});

	QUnit.test("leftContent should not overlap the rightContent", function(assert) {
		//Arrange + System under Test + Act
		//left | right | mid
		var sut = createAndPlaceSUT(300, 450, 0);

		//Act
		jQuery("#qunit-fixture").width("750px");
		sut.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		//Assert
		var oBarInternals = getJqueryObjectsForBar(sut);

		if (sap.ui.getCore().getConfiguration().getRTL()) {
			assert.strictEqual(oBarInternals.$right.outerWidth(), oBarInternals.$left.position().left, "left content starts where right content ends");
		} else {
			assert.strictEqual(oBarInternals.$left.outerWidth(), oBarInternals.$right.position().left, "right content starts where left content ends");
		}

		//Cleanup
		sut.destroy();
		jQuery("#qunit-fixture").width("");
	});


	QUnit.module("resizing");

	QUnit.test("Should attach to the resize handlers", function(assert) {
		//Arrange + System under Test + Act
		//left | right | mid
		var sut = createAndPlaceSUT(225, 225, 100);

		var oHandleResizeSpy = this.spy(Bar.prototype, "_handleResize");

		//Act
		jQuery("#qunit-fixture").width("500px");
		sut.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		assert.strictEqual(oHandleResizeSpy.callCount, 1, "resize was called once");

		//Assert
		var oBarInternals = getJqueryObjectsForBar(sut);

		assert.strictEqual(oBarInternals.$left.outerWidth(), 225 + iStartEndPadding, "left outerWidth is correct");
		elementHasNoLeftOrRight(assert, oBarInternals.$left, "left Bar");

		assert.strictEqual(oBarInternals.$mid.outerWidth(), 50 - iStartEndPadding * 2, "mid outerWidth was taking the remaining space");
		assert.strictEqual(oBarInternals.$mid.css("left"), 225 + iStartEndPadding + "px", "mid was positioned at the left edge");

		assert.strictEqual(oBarInternals.$right.outerWidth(), 225 + iStartEndPadding, "right outerWidth is correct");
		elementHasNoLeftOrRight(assert, oBarInternals.$right, "right Bar");

		jQuery("#qunit-fixture").width("600px");

		this.clock.tick(200);

		oBarInternals = getJqueryObjectsForBar(sut);

		assert.strictEqual(oBarInternals.$left.outerWidth(), 225 + iStartEndPadding, "left outerWidth is correct");
		elementHasNoLeftOrRight(assert, oBarInternals.$left, "left Bar");

		assert.strictEqual(oBarInternals.$mid.outerWidth(), 100 + iStartEndPadding * 2, "mid outerWidth was taking the remaining space");
		elementHasNoLeftOrRight(assert, oBarInternals.$left, "mid Bar");

		assert.strictEqual(oBarInternals.$right.outerWidth(), 225 + iStartEndPadding, "right outerWidth is correct");
		elementHasNoLeftOrRight(assert, oBarInternals.$right, "right Bar");

		assert.strictEqual(oHandleResizeSpy.callCount, 2, "resize was called twice");

		//Cleanup
		sut.destroy();
		jQuery("#qunit-fixture").width("");
	});

	QUnit.test("Should not attach resizeHandlers if the bar has no content", function(assert) {
		//Arrange + System under Test + Act
		//left | right | mid
		var sut = new Bar();

		var oHandleResizeSpy = this.spy(Bar.prototype, "_handleResize");

		jQuery("#qunit-fixture").width("500px");
		sut.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		assert.strictEqual(oHandleResizeSpy.callCount, 1, "resize was called once");

		//Act
		jQuery("#qunit-fixture").width("600px");
		//trigger the resize handler
		this.clock.tick(200);

		//Assert
		assert.strictEqual(oHandleResizeSpy.callCount, 1, "resize not called twice");

		sut.addContentLeft(new Button());
		sap.ui.getCore().applyChanges();

		assert.strictEqual(oHandleResizeSpy.callCount, 2, "resize was called twice");

		jQuery("#qunit-fixture").width("500px");
		this.clock.tick(200);
		assert.strictEqual(oHandleResizeSpy.callCount, 3, "resize was called three times");

		//Cleanup
		sut.destroy();
		jQuery("#qunit-fixture").width("");
	});

	QUnit.test("Should attach and detach resize listeners to the content", function(assert) {

		var oHandleResizeSpy = this.spy(Bar.prototype, "_handleResize");

		//Arrange + System under Test + Act
		//left | right | mid
		var sut = createAndPlaceSUT(100, 100, 100);

		assert.strictEqual(oHandleResizeSpy.callCount, 1, "resize was called");


		var oBarInternals = getJqueryObjectsForBar(sut);

		//left
		oBarInternals.$left.width(105);
		this.clock.tick(200);

		assert.strictEqual(oHandleResizeSpy.callCount, 2, "resize was called");

		//right
		oBarInternals.$right.width(105);
		this.clock.tick(200);

		assert.strictEqual(oHandleResizeSpy.callCount, 3, "resize was called");

		//mid
		oBarInternals.$mid.width(105);
		this.clock.tick(200);

		assert.strictEqual(oHandleResizeSpy.callCount, 4, "resize was called");

		//detach
		sut._removeAllListeners();

		oBarInternals.$left.width(100);
		oBarInternals.$right.width(100);
		oBarInternals.$mid.width(100);

		assert.strictEqual(oHandleResizeSpy.callCount, 4, "resize was not called");

		//Cleanup
		sut.destroy();
		jQuery("#qunit-fixture").width("");
	});

	QUnit.module("Accessibility",{
		beforeEach: function() {
			this.Bar = new Bar({
				contentMiddle: [ new Label("myLabel", {text: "my Bar"})]
			});
			this.Bar.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
		},
		afterEach: function() {
			this.Bar.destroy();
			this.Bar = null;

		}
	});

	QUnit.test("Accessibility role should be set correctly", function(assert) {
		assert.strictEqual(this.Bar.$().attr("role"), "toolbar", "Default role is set correctly");
	});

	QUnit.test("aria-level should not be set", function(assert) {
		assert.strictEqual(this.Bar.$().attr("aria-level"), undefined, "aria-level is not set");
	});
});
