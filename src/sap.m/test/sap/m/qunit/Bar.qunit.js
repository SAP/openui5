/*global QUnit */


sap.ui.define([
	"sap/base/i18n/Localization",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/m/Bar",
	"sap/m/Button",
	"sap/m/Label",
	"sap/m/Image",
	"sap/m/Title",
	"sap/m/BarRenderer",
	"sap/m/library",
	"sap/ui/Device",
	"sap/ui/core/Element",
	"sap/ui/core/ResizeHandler",
	"sap/ui/core/InvisibleText",
	"sap/ui/thirdparty/jquery"
], function(
	Localization,
	nextUIUpdate,
	Bar,
	Button,
	Label,
	Image,
	Title,
	BarRenderer,
	mobileLibrary,
	Device,
	Element,
	ResizeHandler,
	InvisibleText,
	jQuery
) {
	"use strict";

	var TitleAlignment = mobileLibrary.TitleAlignment;

	QUnit.module("rendering");

	async function renderingTest (fnAssertions, clock) {

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
			contentLeft: [ new Image({src: "../images/SAPUI5.jpg"})],
			contentMiddle: [ new Label({text: "my Bar 1"})],
			contentRight: [ new Button({text: "Edit"})]
		}).placeAt("qunit-fixture");

		//Act
		await nextUIUpdate(clock);

		//Assert
		fnAssertions();

		//cleanup
		bar.destroy();
		bar1.destroy();
		bar2.destroy();
		await nextUIUpdate(clock);
	}

	QUnit.test("Should render the bars", async function(assert) {

		await renderingTest.call(this, function() {

			assert.ok(document.getElementById("myBar"), "Bar should be rendered");
			assert.ok(document.getElementById("myBar1"), "Bar1 should be rendered");

		},this.clock);

	});

	// This is more like visual test, but will leave it as it is for now.
	QUnit.test("Should position the bars", async function(assert) {

		await renderingTest.call(this, function() {

			assert.equal(Math.round(jQuery("#myBar1").position().top), Math.round(jQuery("#myBar").position().top + jQuery("#myBar").outerHeight()),
					"Bar1 should be located below Bar");

		}, this.clock);

	});

	QUnit.test("content Element position", async function(assert) {

		await renderingTest.call(this, function() {

			assert.ok(jQuery("#CancelBtn").parent().hasClass("sapMBarLeft"), "header button should have class sapMBarLeft");
			assert.ok(jQuery("#myIcon").parent().hasClass("sapMBarLeft"), "header icon should have class sapMBarLeft");
			assert.ok(jQuery("#myLabel").parent().hasClass("sapMBarPH"), "label should have class sapMBarPH");
			assert.ok(jQuery("#myLabel1").parent().hasClass("sapMBarPH"), "label should have class sapMBarPH");
			assert.ok(jQuery("#EditBtn").parent().hasClass("sapMBarRight"), "header button should have class sapMBarRight");
			assert.ok(jQuery("#EditBtn1").parent().hasClass("sapMBarRight"), "header button should have class sapMBarRight");

		}, this.clock);

	});

	QUnit.test("Should set the design class to the containers", async function(assert) {
		// Arrange
		var sBarBaseContext = "sapMIBar-CTX";

		// System under Test
		var oBar = new Bar().placeAt("qunit-fixture");

		// Act
		await nextUIUpdate(this.clock);

		var sExpectedClass = BarRenderer.getContext(oBar);

		// Assert
		assert.ok(oBar.$().hasClass(sExpectedClass), "the left button parent had the class " + sExpectedClass);
		assert.ok(oBar.$().hasClass(sBarBaseContext), "the left button parent had the class " + sBarBaseContext);

		//Cleanup
		oBar.destroy();
		await nextUIUpdate(this.clock);
	});

	QUnit.test("Should get the correct contexts", async function(assert) {
		// System under Test
		var oBar = new Bar().placeAt("qunit-fixture");

		// Act
		await nextUIUpdate(this.clock);

		var oExpectedContexts = oBar.getContext(oBar);

		// Assert
		assert.equal(Object.keys(oExpectedContexts).length, 4, "There are four contexts");
		assert.ok(oExpectedContexts["header"], "returned contexts has 'header' context");
		assert.ok(oExpectedContexts["subheader"], "returned contexts has 'subheader' context");
		assert.ok(oExpectedContexts["footer"], "returned contexts has 'footer' context");
		assert.ok(oExpectedContexts["dialogFooter"], "returned contexts has 'dialogFooter' context");

		//Cleanup
		oBar.destroy();
		await nextUIUpdate(this.clock);
	});

	QUnit.test("tag property", async function(assert) {

		await renderingTest.call(this, async function() {

			assert.ok(jQuery("#myBar").is("div"), "bar should be rendered as div");
			assert.ok(jQuery("#myBar1").is("div"), "bar1 should be rendered as div");

			var bar = Element.getElementById("myBar");
			bar.setHTMLTag('Header');
			bar.invalidate();
			await nextUIUpdate(this.clock);
			assert.ok(jQuery("#myBar").is("header"), "bar should be rendered as header");

			var bar1 = Element.getElementById("myBar1");
			bar1.setHTMLTag('Footer');
			bar1.invalidate();
			await nextUIUpdate(this.clock);
			assert.ok(jQuery("#myBar1").is("footer"), "bar1 should be rendered as footer");

			var bar2 = Element.getElementById("myBar2");
			bar2.setHTMLTag('H1');
			bar2.invalidate();
			await nextUIUpdate(this.clock);
			assert.ok(jQuery("#myBar2").is("H1"), "bar2 should be rendered as H1");
			assert.equal(bar2.getHTMLTag(), "H1", "Even when sap.m.Bar has HTML tag set with value different than header and footer, " +
				"the getHTMLTag should behave in one and the same way- should return the tag value itself");
		}, this.clock);

	});

	QUnit.test("Should not register resize handlers if the bar is invisible", async function(assert) {
		var //System under Test
				oBar = new Bar({
					visible : true,
					contentLeft : new Button()
				});

		//Arrange + Act
		oBar.placeAt("qunit-fixture");
		await nextUIUpdate(this.clock);
		var fnSpy = this.spy(ResizeHandler, "register");

		//Act
		oBar.setVisible(false);
		await nextUIUpdate(this.clock);

		//Assert
		assert.strictEqual(fnSpy.callCount, 0,"the resize listeners did not get registered");

		//Cleanup
		oBar.destroy();
		await nextUIUpdate(this.clock);
	});

	var iMargin = 4;
	var iStartEndPadding = 4;

	QUnit.test("Each first child should not have margins and each none first should have", async function(assert) {
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
		await nextUIUpdate(this.clock);

		// Assert
		function assertButton (oButton, oMargins) {
			if (Localization.getRTL()) {
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
			right : 4
		});

		assertButton(oLastButton, {
			left: iMargin,
			right : 0
		});

		if (Localization.getRTL()) {
			assert.strictEqual(oBar.$("BarLeft").css("padding-right"), iStartEndPadding + 12 + "px", "Left bar does have a padding");
		} else {
			assert.strictEqual(oBar.$("BarLeft").css("padding-left"), iStartEndPadding + 12 + "px", "Left bar does have a padding");
		}

		// Cleanup
		oBar.destroy();
		await nextUIUpdate(this.clock);
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
	QUnit.test("Single left aggregation is set with width 100%", async function(assert) {
		//Sut
		var sut = createSUTSingleAggregation("contentLeft"),
				oBarWidths;

		//Assert
		function check (sMsgPrefix) {
			oBarWidths = getBarContentStyles(sut);
			assert.notEqual(oBarWidths.left.indexOf("width:100%"), -1, sMsgPrefix + " Left Content width must be set to 100%");
			assert.equal(oBarWidths.mid.indexOf("width:100%"), -1 ,sMsgPrefix + " Middle Content width must not be set to 100%");
			assert.equal(oBarWidths.right.indexOf("width:100%"), -1, sMsgPrefix + " Right Content width must not be set to 100%");
		}

		//Arrange
		this.stub(sut, "onAfterRendering").callsFake(function() {
		   //Assert
		   check("just before onAfterRendering:");
		   Bar.prototype.onAfterRendering.apply(sut, arguments);
		});
		sut.placeAt("qunit-fixture");
		await nextUIUpdate(this.clock);

		//Assert
		check("after onAfterRendering");

		//Cleanup
		sut.destroy();
		await nextUIUpdate(this.clock);
	});

	QUnit.test("Single middle aggregation is set with width 100%", async function(assert) {
		//Sut
		var sut = createSUTSingleAggregation("contentMiddle"),
				oBarWidths;

		//Assert
		function check (sMsgPrefix) {
			oBarWidths = getBarContentStyles(sut);
			assert.equal(oBarWidths.left.indexOf("width:100%"), -1, sMsgPrefix + " Left Content width must not be set to 100%");
			assert.equal(oBarWidths.right.indexOf("width:100%"), -1, sMsgPrefix + " Right Content width must not be set to 100%");
			assert.notEqual(oBarWidths.mid.indexOf("width:100%"), -1, sMsgPrefix + " Middle Content width must be set to 100%");
		}

		//Arrange
		this.stub(sut, "onAfterRendering").callsFake(function() {
			//Assert
			check("just before onAfterRendering:");
			Bar.prototype.onAfterRendering.apply(sut, arguments);
		});
		sut.placeAt("qunit-fixture");
		await nextUIUpdate(this.clock);

		//Assert
		check("after onAfterRendering");

		//Cleanup
		sut.destroy();
		await nextUIUpdate(this.clock);
	});

	QUnit.test("Single right aggregation is set with width 100%", async function(assert) {
		//Sut
		var sut = createSUTSingleAggregation("contentRight"),
				oBarWidths;

		//Assert
		function check (sMsgPrefix) {
			oBarWidths = getBarContentStyles(sut);
			assert.equal(oBarWidths.left.indexOf("width:100%"), -1, sMsgPrefix + " Left Content width must not be set to 100%");
			assert.equal(oBarWidths.mid.indexOf("width:100%"), -1, sMsgPrefix + " Middle Content width must not be set to 100%");
			assert.notEqual(oBarWidths.right.indexOf("width:100%"), -1, sMsgPrefix + " Right Content width must be set to 100%");
		}

		//Arrange
		this.stub(sut, "onAfterRendering").callsFake(function() {
			//Assert
			check("just before onAfterRendering:");
			Bar.prototype.onAfterRendering.apply(sut, arguments);
		});
		sut.placeAt("qunit-fixture");
		await nextUIUpdate(this.clock);

		//Assert
		check("after onAfterRendering");

		//Cleanup
		sut.destroy();
		await nextUIUpdate(this.clock);
	});

	QUnit.test("ariaLabbeledBy", async function(assert) {

	//Arrange
	var oBar = new Bar(),
	oInvisibleText = new InvisibleText({text: "invisible text"});

	oBar.addAriaLabelledBy(oInvisibleText.toStatic());

	//Assert
	assert.equal(oBar.getAriaLabelledBy(), oInvisibleText.getId(), "Bar has attribute aria-labelledby to the internal label");

	//Cleanup
	oInvisibleText.destroy();
	oBar.destroy();
	await nextUIUpdate(this.clock);
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

	async function createAndPlaceSUT(iLeftBarouterWidth, iRightBarouterWidth, iMidBarouterWidth, clock) {
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
		await nextUIUpdate(clock);

		return sut;
	}

	function testAlsoForRTL(sName, fnTest) {
		QUnit.test(sName, async function (assert) {
			//turn on rtl for this test
			this.stub(Localization, "getRTL").callsFake(function() {
				return false;
			});

			await fnTest.call(this, assert, Localization.getRTL());
		});

		QUnit.test(sName + " RTL", async function (assert) {
			//turn on rtl for this test
			this.stub(Localization, "getRTL").callsFake(function() {
				return true;
			});

			await fnTest.call(this, assert, Localization.getRTL());
		});
	}

	testAlsoForRTL("Should position the mid content centered, left content left and right content right, if nothing overlaps", async function(assert, bRtl) {
		//Arrange + System under Test + Act
		//left | right | mid
		var sut = await createAndPlaceSUT(100, 100, 100, this.clock);
		//Assert
		var oBarInternals = getJqueryObjectsForBar(sut);
		var iExtraPadding = 16;

		assert.strictEqual(oBarInternals.$left.outerWidth(), 100 + iStartEndPadding + iExtraPadding, "left outerWidth is correct");
		elementHasNoWidth(assert, oBarInternals.$left, "left Bar");
		elementHasNoLeftOrRight(assert, oBarInternals.$left, "left Bar");

		assert.strictEqual(oBarInternals.$mid.outerWidth(), 100 + iStartEndPadding * 2, "mid outerWidth is correct");
		elementHasNoWidth(assert, oBarInternals.$mid, "mid Bar");
		elementHasNoLeftOrRight(assert, oBarInternals.$left, "mid Bar");

		assert.strictEqual(oBarInternals.$right.outerWidth(), 100 + iStartEndPadding + iExtraPadding, "right outerWidth is correct");
		elementHasNoWidth(assert, oBarInternals.$right, "right Bar");
		elementHasNoLeftOrRight(assert, oBarInternals.$right, "right Bar");

		//Cleanup
		sut.destroy();
		await nextUIUpdate(this.clock);
		jQuery("#qunit-fixture").width("");
	});

	testAlsoForRTL("Should hide the mid content, and shorten leftContent if right content overlaps the leftContent", async function(assert) {
		//Arrange + System under Test + Act
		//left | right | mid
		var sut = await createAndPlaceSUT(100, 450, 100, this.clock);
		var iExtraPadding = 16;

		//Assert
		var oBarInternals = getJqueryObjectsForBar(sut);

		assert.strictEqual(oBarInternals.$left.outerWidth(), 50 - iStartEndPadding - iExtraPadding, "left outerWidth is correct");
		elementHasNoLeftOrRight(assert, oBarInternals.$left, "left Bar");

		assert.strictEqual(oBarInternals.$mid.outerWidth(), 0 + iStartEndPadding * 2, "mid outerWidth is correct");
		elementHasNoLeftOrRight(assert, oBarInternals.$mid, "mid Bar");

		assert.strictEqual(oBarInternals.$right.outerWidth(), 450 + iStartEndPadding + iExtraPadding, "right outerWidth is correct");
		elementHasNoLeftOrRight(assert, oBarInternals.$right, "right Bar");

		//Cleanup
		sut.destroy();
		await nextUIUpdate(this.clock);
		jQuery("#qunit-fixture").width("");
	});

	testAlsoForRTL("Should hide the mid content, and shorten leftContent if left content overlaps the RightContent", async function(assert) {
		//Arrange + System under Test + Act
		//left | right | mid
		var sut = await createAndPlaceSUT(450, 100, 100, this.clock);
		var iExtraPadding = 16;
		//Assert
		var oBarInternals = getJqueryObjectsForBar(sut);

		assert.strictEqual(oBarInternals.$left.outerWidth(), 400 - iStartEndPadding - iExtraPadding, "left outerWidth is correct");
		elementHasNoLeftOrRight(assert, oBarInternals.$left, "left Bar");

		assert.strictEqual(oBarInternals.$mid.outerWidth(), 0 + iStartEndPadding * 2, "mid outerWidth is correct");
		elementHasNoLeftOrRight(assert, oBarInternals.$mid, "mid Bar");

		assert.strictEqual(oBarInternals.$right.outerWidth(), 100 + iStartEndPadding + iExtraPadding, "right outerWidth is correct");
		elementHasNoLeftOrRight(assert, oBarInternals.$right, "right Bar");

		//Cleanup
		sut.destroy();
		await nextUIUpdate(this.clock);
		jQuery("#qunit-fixture").width("");
	});

	testAlsoForRTL("Should push the Middle content to the space between left and right if the left content overlaps the centered mid content", async function(assert) {
		//Arrange + System under Test + Act
		//left | right | mid
		var sut = await createAndPlaceSUT(225, 100, 100, this.clock);
		var iExtraPadding = 16;

		//Assert
		var oBarInternals = getJqueryObjectsForBar(sut);

		assert.strictEqual(oBarInternals.$left.outerWidth(), 225 + iStartEndPadding + iExtraPadding, "left outerWidth is correct");

		assert.strictEqual(oBarInternals.$mid.outerWidth(), (175 - iExtraPadding * 2) - iStartEndPadding * 2, "mid outerWidth is correct");

		assert.strictEqual(oBarInternals.$right.outerWidth(), 100 + iStartEndPadding + iExtraPadding, "right outerWidth is correct");

		//Cleanup
		sut.destroy();
		await nextUIUpdate(this.clock);
		jQuery("#qunit-fixture").width("");
	});

	testAlsoForRTL("Should hide left and mid content, if the right content is bigger than the bar", async function(assert) {
		//Arrange + System under Test + Act
		//left | right | mid
		var sut = await createAndPlaceSUT(100, 600, 100, this.clock);
		var iExtraPadding = 16;

		//Assert
		var oBarInternals = getJqueryObjectsForBar(sut);

		assert.strictEqual(oBarInternals.$left.outerWidth(), iExtraPadding + iStartEndPadding, "left outerWidth is correct");

		assert.strictEqual(oBarInternals.$mid.outerWidth(), 0 + iStartEndPadding * 2, "mid outerWidth is correct");

		assert.strictEqual(oBarInternals.$right.outerWidth(), 500, "right outerWidth is correct");

		//Cleanup
		sut.destroy();
		await nextUIUpdate(this.clock);
		jQuery("#qunit-fixture").width("");
	});

	testAlsoForRTL("Should hide mid content, if the left content is bigger than the bar", async function(assert) {
		//Arrange + System under Test + Act
		//left | right | mid
		var sut = await createAndPlaceSUT(600, undefined, 100, this.clock);

		//Act
		jQuery("#qunit-fixture").width("500px");
		sut.placeAt("qunit-fixture");
		await nextUIUpdate(this.clock);

		//Assert
		var oBarInternals = getJqueryObjectsForBar(sut);

		assert.strictEqual(oBarInternals.$left.outerWidth(), 500, "left width is correct");

		assert.strictEqual(oBarInternals.$mid.outerWidth(), 0 + iStartEndPadding * 2, "mid outerWidth is correct");

		assert.strictEqual(oBarInternals.$right.outerWidth(), 0, "right outerWidth is correct");

		//Cleanup
		sut.destroy();
		await nextUIUpdate(this.clock);
		jQuery("#qunit-fixture").width("");
	});

	QUnit.test("Should push the mid content, right content that overlaps", async function(assert) {
		//Arrange + System under Test + Act
		//left | right | mid
		var sut = await createAndPlaceSUT(undefined, 225, 100, this.clock);
		var iExtraPadding = 16;

		//Act
		jQuery("#qunit-fixture").width("500px");
		sut.placeAt("qunit-fixture");
		await nextUIUpdate(this.clock);

		//Assert
		var oBarInternals = getJqueryObjectsForBar(sut);

		assert.strictEqual(oBarInternals.$left.outerWidth(), 0, "left outerWidth is correct");

		assert.strictEqual(oBarInternals.$mid.outerWidth(), 500 - 225 - iExtraPadding - iStartEndPadding, "mid outerWidth was taking the remaining space");

		assert.strictEqual(oBarInternals.$right.outerWidth(), 225 + iExtraPadding + iStartEndPadding, "right outerWidth is correct");

		//Cleanup
		sut.destroy();
		await nextUIUpdate(this.clock);
		jQuery("#qunit-fixture").width("");
	});

	testAlsoForRTL("Should give the right content the whole space if its the only content", async function(assert) {
		//Arrange + System under Test + Act
		//left | right | mid
		var sut = await createAndPlaceSUT(undefined, 100, undefined, this.clock);

		//Act
		jQuery("#qunit-fixture").width("500px");
		sut.placeAt("qunit-fixture");
		await nextUIUpdate(this.clock);

		//Assert
		var oBarInternals = getJqueryObjectsForBar(sut);

		assert.strictEqual(oBarInternals.$left.outerWidth(), 0, "left outerWidth is correct");
		elementHasNoLeftOrRight(assert, oBarInternals.$left, "left Bar");


		assert.strictEqual(oBarInternals.$mid.outerWidth(), 0 + iStartEndPadding * 2, "mid outerWidth was taking the remaining space");
		elementHasNoLeftOrRight(assert, oBarInternals.$mid, "mid Bar");


		assert.strictEqual(oBarInternals.$right.outerWidth(), 500, "right outerWidth is correct");
		elementHasNoLeftOrRight(assert, oBarInternals.$right, "right Bar");


		//Cleanup
		sut.destroy();
		await nextUIUpdate(this.clock);
		jQuery("#qunit-fixture").width("");
	});

	QUnit.test("leftContent should not overlap the rightContent", async function(assert) {
		//Arrange + System under Test + Act
		//left | right | mid
		var sut = await createAndPlaceSUT(300, 450, 0, this.clock);

		//Act
		jQuery("#qunit-fixture").width("750px");
		sut.placeAt("qunit-fixture");
		await nextUIUpdate(this.clock);

		//Assert
		var oBarInternals = getJqueryObjectsForBar(sut);

		if (Localization.getRTL()) {
			assert.strictEqual(oBarInternals.$right.outerWidth(), Math.round(oBarInternals.$left.position().left), "left content starts where right content ends");
		} else {
			assert.strictEqual(oBarInternals.$left.outerWidth(), Math.round(oBarInternals.$right.position().left), "right content starts where left content ends");
		}

		//Cleanup
		sut.destroy();
		await nextUIUpdate(this.clock);
		jQuery("#qunit-fixture").width("");
	});


	QUnit.module("resizing");

	QUnit.test("Should attach to the resize handlers", async function(assert) {
		//Arrange + System under Test + Act
		//left | right | mid
		var sut = await createAndPlaceSUT(225, 225, 100, this.clock);
		var iExtraPadding = 16;

		var oHandleResizeSpy = this.spy(Bar.prototype, "_handleResize");

		//Act
		jQuery("#qunit-fixture").width("500px");
		sut.placeAt("qunit-fixture");
		await nextUIUpdate(this.clock);

		assert.strictEqual(oHandleResizeSpy.callCount, 1, "resize was called once");

		//Assert
		var oBarInternals = getJqueryObjectsForBar(sut);

		assert.strictEqual(oBarInternals.$left.outerWidth(), 225 + iExtraPadding + iStartEndPadding, "left outerWidth is correct");
		elementHasNoLeftOrRight(assert, oBarInternals.$left, "left Bar");

		assert.strictEqual(oBarInternals.$mid.outerWidth(), 50 - (iExtraPadding * 2) - iStartEndPadding * 2, "mid outerWidth was taking the remaining space");
		assert.strictEqual(oBarInternals.$mid.css("left"), 225 + iExtraPadding + iStartEndPadding + "px", "mid was positioned at the left edge");

		assert.strictEqual(oBarInternals.$right.outerWidth(), 225 + iExtraPadding + iStartEndPadding, "right outerWidth is correct");
		elementHasNoLeftOrRight(assert, oBarInternals.$right, "right Bar");

		jQuery("#qunit-fixture").width("600px");

		this.clock.tick(200);

		oBarInternals = getJqueryObjectsForBar(sut);

		assert.strictEqual(oBarInternals.$left.outerWidth(), 225 + iExtraPadding + iStartEndPadding, "left outerWidth is correct");
		elementHasNoLeftOrRight(assert, oBarInternals.$left, "left Bar");

		assert.strictEqual(oBarInternals.$mid.outerWidth(), 100 + iStartEndPadding * 2, "mid outerWidth was taking the remaining space");
		elementHasNoLeftOrRight(assert, oBarInternals.$left, "mid Bar");

		assert.strictEqual(oBarInternals.$right.outerWidth(), 225 + iExtraPadding + iStartEndPadding, "right outerWidth is correct");
		elementHasNoLeftOrRight(assert, oBarInternals.$right, "right Bar");

		assert.strictEqual(oHandleResizeSpy.callCount, 3, "resize was called thrice");

		//Cleanup
		sut.destroy();
		await nextUIUpdate(this.clock);
		jQuery("#qunit-fixture").width("");
	});

	QUnit.test("Should not attach resizeHandlers if the bar has no content", async function(assert) {
		//Arrange + System under Test + Act
		//left | right | mid
		var sut = new Bar();

		var oHandleResizeSpy = this.spy(Bar.prototype, "_handleResize");

		jQuery("#qunit-fixture").width("500px");
		sut.placeAt("qunit-fixture");
		await nextUIUpdate(this.clock);

		assert.strictEqual(oHandleResizeSpy.callCount, 1, "resize was called once");

		//Act
		jQuery("#qunit-fixture").width("600px");
		//trigger the resize handler
		this.clock.tick(200);

		//Assert
		assert.strictEqual(oHandleResizeSpy.callCount, 1, "resize not called twice");

		sut.addContentLeft(new Button());
		await nextUIUpdate(this.clock);

		assert.strictEqual(oHandleResizeSpy.callCount, 2, "resize was called twice");

		jQuery("#qunit-fixture").width("500px");
		this.clock.tick(200);
		assert.strictEqual(oHandleResizeSpy.callCount, 3, "resize was called three times");

		//Cleanup
		sut.destroy();
		await nextUIUpdate(this.clock);
		jQuery("#qunit-fixture").width("");
	});

	QUnit.test("Should attach and detach resize listeners to the content", async function(assert) {

		var oHandleResizeSpy = this.spy(Bar.prototype, "_handleResize");

		//Arrange + System under Test + Act
		//left | right | mid
		var sut = await createAndPlaceSUT(100, 100, 100, this.clock);

		assert.strictEqual(oHandleResizeSpy.callCount, 1, "resize was called");


		var oBarInternals = getJqueryObjectsForBar(sut);

		//left
		oBarInternals.$left.width(105);
		this.clock.tick(200);

		assert.strictEqual(oHandleResizeSpy.callCount, 2, "resize was called");

		//right
		oBarInternals.$right.width(105);
		this.clock.tick(200);

		assert.strictEqual(oHandleResizeSpy.callCount, 4, "resize was called");

		//mid
		oBarInternals.$mid.width(105);
		this.clock.tick(200);

		assert.strictEqual(oHandleResizeSpy.callCount, 5, "resize was called");

		//detach
		sut._removeAllListeners();

		oBarInternals.$left.width(100);
		oBarInternals.$right.width(100);
		oBarInternals.$mid.width(100);

		assert.strictEqual(oHandleResizeSpy.callCount, 5, "resize was not called");

		//Cleanup
		sut.destroy();
		await nextUIUpdate(this.clock);
		jQuery("#qunit-fixture").width("");
	});

	QUnit.module("Accessibility",{
		beforeEach: async function() {
			this.Bar = new Bar({
				contentMiddle: [ new Label("myLabel", {text: "my Bar"})]
			});
			this.Bar.placeAt("qunit-fixture");
			this.InterctiveControlsBar = new Bar({
				contentMiddle: [ new Button("myButton", {text: "my Button"})],
				contentLeft: [ new Button("myButton2", {text: "my Button2"})]
			});
			this.InterctiveControlsBar.placeAt("qunit-fixture");
			await nextUIUpdate(this.clock);
		},
		afterEach: async function() {
			this.Bar.destroy();
			this.Bar = null;
			this.InterctiveControlsBar.destroy();
			this.InterctiveControlsBar = null;
			await nextUIUpdate(this.clock);
		}
	});

	QUnit.test("Accessibility role should be set correctly", function(assert) {
		assert.strictEqual(this.Bar.$().attr("role"), undefined, "Default role shouldn't be set if there are no interactive controls in the Bar content");
		assert.strictEqual(this.InterctiveControlsBar.$().attr("role"), "toolbar", "Default role is set correctly for Bar with 2 or more interactive controls");
	});

	QUnit.test("aria-level should not be set", function(assert) {
		assert.strictEqual(this.Bar.$().attr("aria-level"), undefined, "aria-level is not set");
		assert.strictEqual(this.InterctiveControlsBar.$().attr("aria-level"), undefined, "aria-level is not set");
	});

	QUnit.module("Title Alignment");

	QUnit.test("setTitleAlignment test", async function (assert) {

		var oBar = new Bar({
				contentMiddle: new Title({
					text: "Header"
				})
			}),
			sAlignmentClass = "sapMBarTitleAlign",
			sInitialAlignment,
			sAlignment;

		oBar.placeAt("qunit-fixture");
		await nextUIUpdate(this.clock);
		sInitialAlignment = oBar.getTitleAlignment();

		// initial titleAlignment test (when titleAlignment is None)
		assert.ok(oBar.hasStyleClass(sAlignmentClass + sInitialAlignment),
					"The default titleAlignment is '" + sInitialAlignment + "', so there is class '" + sAlignmentClass + sInitialAlignment + "' applied to the Bar");

		// check if all types of alignment lead to apply the proper CSS class
		for (sAlignment in TitleAlignment) {
			oBar.setTitleAlignment(sAlignment);
			await nextUIUpdate(this.clock);
			assert.ok(oBar.hasStyleClass(sAlignmentClass + sAlignment),
						"titleAlignment is set to '" + sAlignment + "', there is class '" + sAlignmentClass + sAlignment + "' applied to the Bar");
		}

		// cleanup
		oBar.destroy();
		await nextUIUpdate(this.clock);
	});
});
