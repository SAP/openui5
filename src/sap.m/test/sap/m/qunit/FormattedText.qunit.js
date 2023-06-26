/*global QUnit */
/*eslint no-undef:1, no-unused-vars:1, strict: 1 */
sap.ui.define([
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/core/util/MockServer",
	"sap/m/FormattedText"
], function(QUnitUtils, createAndAppendDiv, MockServer, FormattedText) {
	document.body.insertBefore(createAndAppendDiv("content"), document.body.firstChild);


	//
	// Test for the sap.m.FormattedText control.
	//



	var sFT = "FormattedText";
	var oFT = new FormattedText(sFT).placeAt("content");

	function setText(sHtml) {
		oFT.setHtmlText(sHtml);
		sap.ui.getCore().applyChanges();
	}

	QUnit.module("Test the basic functions");

	QUnit.test("parameters", function(assert) {
		oFT.setWidth("100%").setHeight("auto");
		setText("formatted text example");
		assert.strictEqual(oFT.getDomRef().style.width, "100%", "Width of the control is correct");
		assert.strictEqual(oFT.getDomRef().style.height, "auto", "Height of the control is correct");
		oFT.setWidth("").setHeight("");
		sap.ui.getCore().applyChanges();
		assert.ok(!oFT.getDomRef().style.width, "The width css is cleared");
		assert.ok(!oFT.getDomRef().style.height, "The height css is cleared");
	});

	QUnit.test("tags", function(assert) {
		setText("<h1>" + sFT + "</h1>");
		assert.strictEqual(oFT.$().find("h1").text(), sFT, "The text of the h1 element is correct");
		setText("<h3>" + sFT + "</h3>");
		assert.strictEqual(oFT.$().find("h3").text(), sFT, "The text of the h3 element is correct");
		setText("<div>" + sFT + "</div>");
		assert.ok(!oFT.$().find("div").length, "The div element is not rendered");
		setText("<a href=\"//www.sap.com\">" + sFT + "</a>");
		assert.strictEqual(oFT.$().find("a").text(), sFT, "The text of the a element is correct");
		setText("<ul><li>1</li><li>2</li><li>3</li></ul>");
		assert.strictEqual(oFT.$().find("ul").length, 1, "One ul element is rendered");
		assert.strictEqual(oFT.$().find("li").length, 3, "There are 3 li elements");
	});

	QUnit.test("attributes", function(assert) {
		var $a;
		setText('<a id="AAA" class="aaa" style="color:red;" href="' +  sFT + '" target="_top">"' + sFT + '</a>');
		$a = oFT.$().find("a");
		assert.ok(!$a.attr("id"), "id is not rendered");
		assert.strictEqual($a.attr("href"), sFT, "a::href is rendered");
		assert.strictEqual($a[0].style.color, "red", "a::style is rendered");
		assert.strictEqual($a.attr("target"), "_top", "a::target attribute _top");
		setText('<a href="' +  sFT + '"' + sFT + '</a>');
		$a = oFT.$().find("a");
		assert.strictEqual($a.attr("target"), "_blank", "default a::target attribute is _blank");
		setText('<span id="AAA" class="aaa" style="color:red;" href="' +  sFT + '" target="_top">"' + sFT + '</span>');
		$a = oFT.$().find("span");
		assert.ok(!$a.attr("id"), "id is not rendered");
		assert.ok(!$a.attr("href"), "span::href is not rendered");
		assert.strictEqual($a.attr("class"), "aaa", "a::class is rendered");
		assert.strictEqual($a[0].style.color, "red", "a::style is rendered");
		assert.ok(!$a.attr("target"), "span::target is not rendered");
		setText('<span style="overflow-wrap: break-word;">' + sFT + '</span>');
		$span = oFT.$().find("span");
		assert.strictEqual($span[0].getAttribute("style"), "overflow-wrap: break-word; position: static !important;", "styles are properly semicolon separated");
		setText('<span style="overflow-wrap: break-word; color: red;">' + sFT + '</span>');
		$span = oFT.$().find("span");
		assert.strictEqual($span[0].getAttribute("style"), "overflow-wrap: break-word; color: red; position: static !important;", "styles are properly semicolon separated");
		setText('<span style="padding-inline-start: 15px; margin-block-start: 0px">' + sFT + '</span>');
		$span = oFT.$().find("span");
		assert.strictEqual($span[0].getAttribute("style"), "padding-inline-start: 15px; margin-block-start: 0px; position: static !important;", "styles are properly semicolon separated");
		setText('<a style="color:red;position:absolute;">"' + sFT + '</a>');
		assert.strictEqual($a[0].style.position, "static", "inline style for position is set to 'static'");
		setText('<a style="position:fixed;">"' + sFT + '</a>');
		assert.strictEqual($a[0].style.position, "static", "inline style for position is set to 'static'");
	});

	QUnit.test("css classes", function(assert) {
		var $a;
		setText("<h1>" + sFT + "</h1>");
		$a = oFT.$().find("h1");
		assert.strictEqual($a.attr("class"), "sapMTitle sapMTitleStyleH1", "h1::class is rendered correctly");

		setText("<h6 class='abc'>" + sFT + "</h6>");
		$a = oFT.$().find("h6");
		assert.strictEqual($a.attr("class"), "sapMTitle sapMTitleStyleH6 abc", "h6::class is rendered correctly");

		setText('<a id="AAA" class="abc" style="color:red;" href="' +  sFT + '" target="_top">"' + sFT + '</a>');
		$a = oFT.$().find("a");
		assert.strictEqual($a.attr("class"), "sapMLnk abc", "a::class is rendered correctly");

		setText('<a class="abc sapThemeText-asColor" style="color:red;" href="' +  sFT + '" target="_top">"' + sFT + '</a>');
		$a = oFT.$().find("a");
		assert.strictEqual($a.attr("class"), "sapMLnk abc sapThemeText-asColor", "a::class is rendered correctly");
	});

	QUnit.module("_setUseLimitedRenderingRules restricted method", {
		beforeEach: function () {
			this.oFT = new FormattedText();
		},
		afterEach: function () {
			this.oFT.destroy();
		}
	});

	QUnit.test("Method exist", function (oAssert) {
		// Assert
		oAssert.ok(this.oFT._setUseLimitedRenderingRules,
			"The control should have this SAP-restricted method - the sap.m.MessageStrip rely's on this method");
	});

	QUnit.test("Only limited subset of HTML elements should be rendered", function (oAssert) {
		// Arrange
		var sHTMLString = [
			// If you change the order of elements here you should also change the order of the assertions below
			"a", "abbr", "blockquote", "br", "cite",
			"code", "em", "h1", "h2", "h3", "h4", "h5",
			"h6", "p", "pre", "strong", "span", "u",
			"dl", "dt", "dl", "ul", "ol", "li"
		].map(function (sValue) {
			return "<" + sValue + "></" + sValue + ">";
		}).join(""),
		$Result;

		// Act
		this.oFT._setUseLimitedRenderingRules(true);
		this.oFT.setHtmlText(sHTMLString).placeAt("content");
		sap.ui.getCore().applyChanges();

		// Arrange - get all html elements rendered and evaluate them as jQuery object
		$Result = jQuery(this.oFT.$().html());

		// Assert
		oAssert.strictEqual($Result.length, 4, "Only 4 HTML elements are rendered and evaluated");
		oAssert.strictEqual($Result[0].localName, "a", "The element name should be 'a'");
		oAssert.strictEqual($Result[1].localName, "em", "The element name should be 'em'");
		oAssert.strictEqual($Result[2].localName, "strong", "The element name should be 'strong'");
		oAssert.strictEqual($Result[3].localName, "u", "The element name should be 'u'");
	});

	QUnit.test("_setUseLimitedRenderingRules should effect only instance", function (oAssert) {

		// Arrange - create a second instance of the control
		var oSecondFT = new FormattedText();

		// Act - set the limited rendering rules to true on the original control
		this.oFT._setUseLimitedRenderingRules(true);

		// Assert
		oAssert.notStrictEqual(this.oFT._renderingRules, oSecondFT._renderingRules,
				"Control instances have different rendering rules");

	});

	QUnit.module("Clean up");
	QUnit.test("cleanup", function(assert){
		oFT.destroy();
		this.clock.tick(1000);
		assert.ok(!oFT.getDomRef(), "The control is removed");
	});


	QUnit.module("Others");

	QUnit.test("proper CSS classes for overflow are added when width is set", function (assert) {
		// Arrange
		var oFT = new FormattedText({
			width: "200px"
		});

		oFT.placeAt("content");
		sap.ui.getCore().applyChanges();

		// Assert
		assert.ok(oFT.getDomRef().classList.contains("sapMFTOverflowWidth"), "sapMFTOverflowWidth is set");

		// Cleanup
		oFT.destroy();
	});

	QUnit.test("proper CSS classes for overflow are added when height is set", function (assert) {
		// Arrange
		var oFT = new FormattedText({
			height: "200px"
		});

		oFT.placeAt("content");
		sap.ui.getCore().applyChanges();

		// Assert
		assert.ok(oFT.getDomRef().classList.contains("sapMFTOverflowHeight"), "sapMFTOverflowHeight is set");

		// Cleanup
		oFT.destroy();
	});
});
