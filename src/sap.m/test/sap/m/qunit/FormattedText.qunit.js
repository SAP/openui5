/*global QUnit */
sap.ui.define([
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/m/FormattedText",
	"sap/m/Link",
	"sap/base/Log",
	"sap/ui/core/Core",
	"sap/ui/thirdparty/jquery"
], function(createAndAppendDiv, FormattedText, Link, Log, oCore, jQuery) {
	"use strict";

	document.body.insertBefore(createAndAppendDiv("content"), document.body.firstChild);


	//
	// Test for the sap.m.FormattedText control.
	//



	var sFT = "FormattedText";
	var oFT = new FormattedText(sFT).placeAt("content");

	function setText(sHtml) {
		oFT.setHtmlText(sHtml);
		oCore.applyChanges();
	}

	QUnit.module("Test the basic functions");

	QUnit.test("parameters", function(assert) {
		oFT.setWidth("100%").setHeight("auto");
		setText("formatted text example");
		assert.strictEqual(oFT.getDomRef().style.width, "100%", "Width of the control is correct");
		assert.strictEqual(oFT.getDomRef().style.height, "auto", "Height of the control is correct");
		oFT.setWidth("").setHeight("");
		oCore.applyChanges();
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
		setText("<span><bdi>123 456</bdi></span>");
		assert.strictEqual(oFT.$().find("bdi").length, 1, "There is 1 bdi element");
	});

	QUnit.test("attributes", function(assert) {
		var $a, $span;
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
		setText("<span dir=\'rtl\'><bdi>123 456</bdi></span>");
		$span = oFT.$().find("span");
		assert.strictEqual($span.attr("dir"), "rtl", "span::dir is rendered");
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

	QUnit.test("textDirection and textAlign properties", function(assert) {
		var oFormattedText = new FormattedText({
				textDirection: "RTL",
				textAlign: "Center"
			}).placeAt("content"),
			$FormattedText;

		oCore.applyChanges();

		$FormattedText = oFormattedText.$();

		assert.strictEqual($FormattedText.attr("dir"), "rtl", "a::class is rendered correctly");
		assert.strictEqual($FormattedText[0].style["text-align"], "center", "a::class is rendered correctly");
	});

	QUnit.test("getAccessibilityInfo method", function(assert) {
		// prepare
		var oFormattedText = new FormattedText({
			htmlText: 'The <strong>best</strong> %%0 at <em>%%1</em>',
			controls: [
				new Link({
					text: "run",
					href: "https://www.sap.com",
					subtle: true
				}),
				new Link({
					text: "SAP",
					href: "https://www.sap.com",
					emphasized: true
				})
			]
		}).placeAt("qunit-fixture");

		oCore.applyChanges();

		// act
		// assert
		assert.strictEqual(
			oFormattedText.getAccessibilityInfo().description,
			"The best Link run Subtle at Link SAP Emphasized",
			"Proper accessibility info is returned"
		);

		// cleanup
		oFormattedText.destroy();
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
		oCore.applyChanges();

		// Arrange - get all html elements rendered and evaluate them as jQuery object
		$Result = jQuery(this.oFT.$().html());

		// Assert
		oAssert.strictEqual($Result.length, 5, "Only 5 HTML elements are rendered and evaluated");
		oAssert.strictEqual($Result[0].localName, "a", "The element name should be 'a'");
		oAssert.strictEqual($Result[1].localName, "br", "The element name should be 'br'");
		oAssert.strictEqual($Result[2].localName, "em", "The element name should be 'em'");
		oAssert.strictEqual($Result[3].localName, "strong", "The element name should be 'strong'");
		oAssert.strictEqual($Result[4].localName, "u", "The element name should be 'u'");
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


	QUnit.module("Placeholders", {
		beforeEach: function () {
			this.aLinks = [
				new Link({ text: "Dir.bg", href: "https://dir.bg", target: "_blank" }),
				new Link({ text: "Dnes.bg", href: "https://dnes.bg", target: "_blank" }),
				new Link({ text: "News.bg", href: "https://news.bg", target: "_blank" })
			];

			this.oFT = new FormattedText({
				htmlText: '',
				controls: this.aLinks
			});
		},
		afterEach: function () {
			this.oFT.destroy();
			this.oFT = null;
			jQuery("BODY").remove('#link-output');
		},
		getLinkOutput: function(iIndex) {
			var aLinks = this.oFT.getControls(),
				sResult = '';

			if (aLinks && aLinks[iIndex]) {
				jQuery("BODY").append('<div id="link-output"></div>');
				aLinks[iIndex].placeAt("link-output");
				oCore.applyChanges();
				sResult = jQuery("#link-output").html();
				jQuery("#link-output").html("");
				this.oFT.insertAggregation("controls", this.aLinks[iIndex], iIndex);
			}
			return sResult;
		},
		getControlOutput: function() {
			var sOutput = '';
			this.oFT.placeAt("qunit-fixture");
			oCore.applyChanges();
			sOutput = jQuery("#qunit-fixture > div").html();
			return sOutput;
		}
	});

	QUnit.test("Successful placeholder replacement with one existing link", function (assert) {
		// Prepare
		this.oFT.placeAt("qunit-fixture");
		oCore.applyChanges();
		var aLinkRefs = this.oFT.getControls().map(function(oLink) {
			return oLink.getDomRef();
		});

		// Act
		this.oFT.setHtmlText("My favorite sites are: <ul><li>%%1</li></ul>");
		oCore.applyChanges();

		// Assert
		assert.strictEqual(aLinkRefs[0].style.display, "none", "The first link isn't displayed");
		assert.strictEqual(aLinkRefs[0].parentElement.id, this.oFT.getId(), "The first link is rendered directly under the root element");
		assert.notOk(aLinkRefs[1].style.display, "The second link is displayed");
		assert.strictEqual(aLinkRefs[1].parentElement.tagName, "LI", "The second link DOM ref is replaced with the placeholder");
	});

	QUnit.test("Successful placeholder replacement with all existing link", function (assert) {
		var sText = "My favorite site is %%1. I like it! But %%2 and %%0 are nice too!",
			sLink0 = this.getLinkOutput(0),
			sLink1 = this.getLinkOutput(1),
			sLink2 = this.getLinkOutput(2),
			sControl;

		this.oFT.setHtmlText(sText);
		sControl = this.getControlOutput();
		sControl = sControl.replaceAll(" style=\"position: static !important;\"", ""); // remove CSS position sanitizing

		sText = sText.replace("%%0", sLink0);
		sText = sText.replace("%%1", sLink1);
		sText = sText.replace("%%2", sLink2);

		// assert outputs (real ans expected)
		assert.equal(sControl, sText, "The resulting output is as expected!");

	});

	QUnit.test("Placeholder replacement with 2 existing link and one missing", function (assert) {
		var sText = "My favorite site is %%1. I like it! But %%2 and %%3 are nice too!",
			sLink0 = this.getLinkOutput(0),
			sLink1 = this.getLinkOutput(1),
			sLink2 = this.getLinkOutput(2),
			sLink3 = this.getLinkOutput(3),
			sControl;

		this.oFT.setHtmlText(sText);
		sControl = this.getControlOutput();

		sText = sText.replace("%%0", sLink0);
		sText = sText.replace("%%1", sLink1);
		sText = sText.replace("%%2", sLink2);
		sText = sText.replace("%%3", sLink3);

		// assert outputs (real ans expected)
		assert.notEqual(sControl, sText, "The resulting outputs is as expected!");
	});

	QUnit.test("Placeholder replacement with 3 existing links and one of them tried to replace twice", function (assert) {
		var sText = "My favorite site is %%1. I like it! But %%2 and %%0 are nice too! Maybe I should select %%0?",
			sLink0 = this.getLinkOutput(0),
			sLink1 = this.getLinkOutput(1),
			sLink2 = this.getLinkOutput(2),
			sControl;

		this.oFT.setHtmlText(sText);
		sControl = this.getControlOutput();

		sText = sText.replace(new RegExp("%%0", "g"), sLink0);
		sText = sText.replace("%%1", sLink1);
		sText = sText.replace("%%2", sLink2);

		// assert outputs (real ans expected)
		assert.notEqual(sControl, sText, "The resulting outputs is as expected!");
	});

	QUnit.test("The placeholder is properly replaced from inside of a 'li' element", function(assert) {
		// Prepare
		var oFT = new FormattedText({
				htmlText: "<ul><li>%%0</li></ul>",
				controls: [
					new Link()
				]
			}),
			oLinkNode, oListItemNode;

		oFT.placeAt("qunit-fixture");
		oCore.applyChanges();
		oLinkNode = oFT.getDomRef().querySelector("a");
		oListItemNode = oFT.getDomRef().querySelector("li");

		// Act
		// Assert
		assert.strictEqual(oLinkNode.parentElement.id, oListItemNode.id, "The anchor tag is properly nested");

		// Clean
		oFT.destroy();
	});

	QUnit.module("Others");

	QUnit.test("proper CSS classes for overflow are added when width is set", function (assert) {
		// Arrange
		var oFT = new FormattedText({
			width: "200px"
		});

		oFT.placeAt("content");
		oCore.applyChanges();

		// Assert
		assert.ok(oFT.getDomRef().classList.contains("sapMFTOverflowWidth"), "sapMFTOverflowWidth is set");

		// Cleanup
		oFT.destroy();
	});

	QUnit.test("Link title isn't sanitized", function (assert) {
		// Arrange
		var sString = 'Should have a <a href="#" target="_blank" title="Opens in new tab">tooltip</a>.',
			oFT = new FormattedText({
				htmlText: sString
			});

		oFT.placeAt("content");
		oCore.applyChanges();

		// Assert
		assert.ok(oFT.getDomRef().children[0].title, "Title is present");

		// Cleanup
		oFT.destroy();
	});

	QUnit.test("proper CSS classes for overflow are added when height is set", function (assert) {
		// Arrange
		var oFT = new FormattedText({
			height: "200px"
		});

		oFT.placeAt("content");
		oCore.applyChanges();

		// Assert
		assert.ok(oFT.getDomRef().classList.contains("sapMFTOverflowHeight"), "sapMFTOverflowHeight is set");

		// Cleanup
		oFT.destroy();
	});

	QUnit.test("Focus is applied on the first available anchor tag", function (assert) {
		// Arrange
		var oFT = new FormattedText({
			htmlText: '<a href="https://www.sap.com/">CustomLink</a>'
		});

		oFT.placeAt("qunit-fixture");
		oCore.applyChanges();

		// Act
		oFT.focus();

		// Assert
		assert.strictEqual(document.activeElement.textContent, "CustomLink", "Focus is properly applied");

		// Cleanup
		oFT.destroy();
	});

	QUnit.test("URL navigation can be cancelled", function (assert) {
		// Arrange
		var oFT = new FormattedText({
			htmlText: '<a href="https://www.sap.com/">link</a>'
		}),
		rootElement = document.getElementById("qunit-fixture"),
		fnPreventNavigation = function(oEvent) {
			oEvent.preventDefault();
		},
		oSpy = this.spy(window, "open");

		rootElement.addEventListener("click", fnPreventNavigation, true);
		oFT.placeAt("qunit-fixture");
		oCore.applyChanges();

		// Act
		oFT.getDomRef().querySelector("a").dispatchEvent(new MouseEvent("click", {
			view: window,
			bubbles: true,
			cancelable: true
		}));

		// Assert
		assert.ok(!oSpy.called, "No navigation");

		// Cleanup
		oFT.destroy();
		rootElement.removeEventListener("click", fnPreventNavigation, true);
	});
});
