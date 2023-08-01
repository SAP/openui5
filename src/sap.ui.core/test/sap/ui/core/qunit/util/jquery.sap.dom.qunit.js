/* global QUnit */
sap.ui.define([
	"sap/base/util/LoaderExtensions",
	"jquery.sap.dom",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/ui/qunit/QUnitUtils" // implicit dependency, implements jQuery#_sapTest_dataEvents
], function (LoaderExtensions, jQuery, nextUIUpdate /*, qutils */) {
	"use strict";

	return LoaderExtensions.loadResource("static/jquery.sap.dom.html", {
		dataType: "html",
		async: true
	}).then(function (sHTML) {
		document.body.innerHTML += sHTML;
	}).then(function() {

		QUnit.test("domById", function (assert) {
			assert.ok(jQuery.sap.domById('control1'), "jQuery.sap.domById('control1') may not be null");
			assert.equal(jQuery.sap.domById('contro10'), null, "jQuery.sap.domById('control10') should be null");
		});

		QUnit.test("byId - escaping", function (assert) {

			var id = ".A:B::C..D";
			var element = document.createElement("div");
			element.setAttribute("id", id);
			document.body.appendChild(element);

			var $element = jQuery.sap.byId(id);
			assert.ok($element instanceof jQuery, "Is jQuery object");
			assert.equal($element.get(0), element, "Element found");
			assert.equal($element.attr("id"), id, "Element id found");

			document.body.removeChild(element);

		});

		QUnit.test("byId - context", function (assert) {

			var id = ".A:B::C..D";
			var element = document.createElement("div");
			element.setAttribute("id", id);

			var parentElement = document.createElement("div");
			parentElement.appendChild(element);
			document.body.appendChild(parentElement);

			var wrongParentElement = document.createElement("div");
			document.body.appendChild(wrongParentElement);

			var $element1 = jQuery.sap.byId(id, parentElement);
			assert.ok($element1 instanceof jQuery, "Is jQuery object");
			assert.equal($element1.get(0), element, "Element found");
			assert.equal($element1.attr("id"), id, "Element id found");

			var $element2 = jQuery.sap.byId(id, wrongParentElement);
			assert.ok($element2 instanceof jQuery, "Is jQuery object");
			assert.equal($element2.get(0), null, "No element found");

			document.body.removeChild(parentElement);
			document.body.removeChild(wrongParentElement);

		});

		QUnit.test("byId - no input", function (assert) {

			var $element1 = jQuery.sap.byId();
			assert.ok($element1 instanceof jQuery, "Is jQuery object");
			assert.equal($element1.get(0), null, "No element found");

			var $element2 = jQuery.sap.byId("");
			assert.ok($element2 instanceof jQuery, "Is jQuery object");
			assert.equal($element2.get(0), null, "No element found");

			var $element3 = jQuery.sap.byId(null);
			assert.ok($element3 instanceof jQuery, "Is jQuery object");
			assert.equal($element3.get(0), null, "No element found");

		});

		QUnit.test("byId - invalid input (special characters)", function (assert) {

			// The following chars are special characters but won't be escaped
			// (see comment in jQuery.sap.byId)

			assert.throws(function () {
				jQuery.sap.byId("[foo]");
			},
				/Syntax error, unrecognized expression/,
				"Should thrown an syntax error");

			assert.throws(function () {
				jQuery.sap.byId("a!b(c)");
			},
				/Syntax error, unrecognized expression/,
				"Should thrown an syntax error");

		});

		QUnit.test("focus", function (assert) {
			assert.expect(1);
			var invisibleDiv = jQuery.sap.domById("invisibleDiv");
			jQuery.sap.focus(invisibleDiv);

			assert.ok(true, "jQuery.sap.focus() may not have caused an error for invisible elements"); // would never be reached in case of error
		});

		QUnit.test("it should convert px values to rem", function (assert) {
			assert.strictEqual(jQuery.sap.pxToRem("0px"), 0);
			assert.strictEqual(jQuery.sap.pxToRem("0"), 0);
			assert.strictEqual(jQuery.sap.pxToRem(0), 0);
			assert.strictEqual(jQuery.sap.pxToRem("16px"), 1);
			assert.strictEqual(jQuery.sap.pxToRem("32"), 2);
			assert.strictEqual(jQuery.sap.pxToRem(64), 4);
		});

		QUnit.test("it should convert rem values to px", function (assert) {
			assert.strictEqual(jQuery.sap.remToPx("0rem"), 0);
			assert.strictEqual(jQuery.sap.remToPx("0"), 0);
			assert.strictEqual(jQuery.sap.remToPx(0), 0);
			assert.strictEqual(jQuery.sap.remToPx("1rem"), 16);
			assert.strictEqual(jQuery.sap.remToPx("2"), 32);
			assert.strictEqual(jQuery.sap.remToPx(4), 64);
		});

		QUnit.test("SetGetCursorPos", function (assert) {
			jQuery('#textinput').cursorPos(4);
			assert.equal(jQuery('#textinput').cursorPos(), 4, "wrong cursor position after setting and getting");
		});

		QUnit.test("SelectText", function (assert) {
			jQuery('#testsel').selectText(2, 5);
			var start = jQuery('#testsel').get(0).selectionStart;
			var end = jQuery('#testsel').get(0).selectionEnd;
			assert.equal(start, 2);
			assert.equal(end, 5);

			jQuery('#testsel').selectText(-2, 50);
			var start = jQuery('#testsel').get(0).selectionStart;
			var end = jQuery('#testsel').get(0).selectionEnd;
			assert.equal(start, 0);
			assert.equal(end, jQuery('#testsel').get(0).value.length);

			jQuery('#testsel').selectText(2, null);
			var start = jQuery('#testsel').get(0).selectionStart;
			var end = jQuery('#testsel').get(0).selectionEnd;
			assert.equal(start, 0);
			assert.equal(end, 0);
		});

		QUnit.test("selectText()/getSelectedText(): The input element's type 'number' does not support selection", function (assert) {

			// arrange
			var $DomRef = jQuery("<input>", {
				type: "number",
				value: 1000000
			});

			jQuery(document.body).append($DomRef);

			// act
			var oReturnValue = $DomRef.selectText(0, 6);
			$DomRef.getSelectedText();

			// assertions
			assert.strictEqual(oReturnValue, $DomRef, "No exception is thrown");

			// cleanup
			$DomRef.remove();
		});

		QUnit.test("selectText() should return this to allow method chaining", function (assert) {

			// arrange
			var $Empty = jQuery();

			// act
			var $This = $Empty.selectText(0, 6);

			// assert
			assert.strictEqual($This, $Empty);
		});

		QUnit.test("getSelectedText() should return an empty string when the jQuery collection is empty", function (assert) {

			// assert
			assert.strictEqual(jQuery().getSelectedText(), "");
		});

		function fnGetSelectedTextCase(mSettings) {

			QUnit.test("getSelectedText()", function (assert) {

				// arrange
				var $DomRef = mSettings.input;

				jQuery(document.body).append($DomRef);
				$DomRef.selectText(mSettings.selectionStart, mSettings.selectionEnd);

				// assertions
				assert.strictEqual($DomRef.getSelectedText(), mSettings.output);

				// cleanup
				$DomRef.remove();
			});
		}

		fnGetSelectedTextCase({
			input: jQuery("<input>", {
				value: "Hello World!"
			}),
			output: "World",
			selectionStart: 6,
			selectionEnd: 11
		});

		fnGetSelectedTextCase({
			input: jQuery("<input>", {
				type: "url",
				value: "www.sap.com"
			}),
			output: "www",
			selectionStart: 0,
			selectionEnd: 3
		});

		fnGetSelectedTextCase({
			input: jQuery("<input>", {
				type: "search",
				value: "Hello World!"
			}),
			output: "World",
			selectionStart: 6,
			selectionEnd: 11
		});

		fnGetSelectedTextCase({
			input: jQuery("<input>", {
				type: "tel",
				value: "7818523054"
			}),
			output: "852",
			selectionStart: 3,
			selectionEnd: 6
		});

		fnGetSelectedTextCase({
			input: jQuery("<input>", {
				type: "password",
				value: "Hello World!"
			}),
			output: "World",
			selectionStart: 6,
			selectionEnd: 11
		});

		QUnit.test("OuterHTML", function (assert) {
			function getExpected(bReversAttributeOrder) {
				function att(n, v) {
					return " " + n + "=\"" + v + "\"";
				}

				var sRes = "<DIV";
				sRes += bReversAttributeOrder ? att("ID", "CONTROL3") : att("TABINDEX", "0");
				sRes += bReversAttributeOrder ? att("TABINDEX", "0") : att("ID", "CONTROL3");
				sRes += ">CONTROL 3</DIV>";
				return sRes;
			}

			var sOuterHTML = jQuery("#control3").outerHTML().toUpperCase(); //Uppercase needed for cross browser consistency (Firefox returns lowercase tags)
			assert.ok(sOuterHTML === getExpected(false) || sOuterHTML === getExpected(true), "outerHTML is wrong, Current: '" + sOuterHTML + "'");
		});

		QUnit.test("ContainsOrEquals", function (assert) {
			var oDomRef3 = jQuery.sap.domById('control3');
			var oDomRef1 = jQuery.sap.domById('control1');
			assert.ok(jQuery.sap.containsOrEquals(oDomRef1, oDomRef3), "jQuery.sap.containsOrEquals(oDomRef1,oDomRef3) control3 is contained in control1");
			assert.ok(jQuery.sap.containsOrEquals(document.body, oDomRef1), "jQuery.sap.containsOrEquals(document.body,oDomRef1) control1 is contained in body");
			assert.ok(jQuery.sap.containsOrEquals(oDomRef3, oDomRef3), "jQuery.sap.containsOrEquals(oDomRef3,oDomRef3) control3 is contained in control3");
			assert.ok(jQuery.sap.containsOrEquals(document.body, document.body), "jQuery.sap.containsOrEquals(document.body,document.body) body is contained in body");
			// text nodes are no longer supported!  ok(jQuery.sap.containsOrEquals(oDomRef3,oDomRef3.firstChild),"jQuery.sap.containsOrEquals(control3,control3.firstChild) control3s text node is contained in control3");
			assert.ok(!jQuery.sap.containsOrEquals(oDomRef3, document.body), "jQuery.sap.containsOrEquals(control3,document.body) body is not contained in control3");
			assert.ok(!jQuery.sap.containsOrEquals(oDomRef3, oDomRef1), "jQuery.sap.containsOrEquals(control3,control1) control1 is not contianed in control3");
		});

		QUnit.test("Rect", function (assert) {
			var oRect = jQuery('#PositionedSpan').rect();
			assert.equal(oRect.left, 10, "jQuery('#PositionedSpan').rect() left is 10");
			assert.equal(oRect.top, 10, "jQuery('#PositionedSpan').rect() top is 10");
			assert.equal(oRect.width, 200, "jQuery('#PositionedSpan').rect() width is 200");
			assert.equal(oRect.height, 100, "jQuery('#PositionedSpan').rect() height is 100");
		});

		QUnit.test("HasTabIndex", function (assert) {
			assert.ok(!jQuery("#control2").hasTabIndex(), "control2 does actually not have a tabindex");
			assert.ok(jQuery("#control3").hasTabIndex(), "control3 does actually have a tabindex");
		});

		QUnit.module("focusable dom refs");

		QUnit.test("firstFocusableDomRef, simple container", function (assert) {
			var oFocusableItem = jQuery('#control1').firstFocusableDomRef();
			var oDomRef = jQuery.sap.domById('control3');
			assert.ok(oFocusableItem, "jQuery(oDomRef).firstFocusableDomRef() not found");
			assert.equal(oFocusableItem, oDomRef, "jQuery(oDomRef).firstFocusableDomRef() is not control3");
		});

		QUnit.test("lastFocusableDomRef, simple container", function (assert) {
			var oFocusableItem = jQuery('#control1').lastFocusableDomRef();
			var oDomRef = jQuery.sap.domById('control6');
			assert.ok(oFocusableItem, "jQuery(oDomRef).firstFocusableDomRef() not found");
			assert.equal(oDomRef, oFocusableItem, "jQuery(oDomRef).firstFocusableDomRef() is not control6");
		});

		QUnit.test("firstFocusableDomRef, complex container", function (assert) {
			var oFocusableItem = jQuery('#container1').firstFocusableDomRef();
			assert.ok(oFocusableItem, "a focusable item should be found in container1");
			assert.equal(oFocusableItem, jQuery.sap.domById('container1-item2-button'), "it should be the button in item2");
		});

		QUnit.test("lastFocusableDomRef, complex container", function (assert) {
			var oFocusableItem = jQuery('#container1').lastFocusableDomRef();
			assert.ok(oFocusableItem, "a focusable item should be found in container1");
			assert.equal(oFocusableItem, jQuery.sap.domById('container1-item2-button'), "it should be the button in item2");
		});

		QUnit.test("firstFocusableDomRef, hidden ancestor", function (assert) {
			var oFocusableItem = jQuery('#container2').firstFocusableDomRef();
			assert.ok(!oFocusableItem, "no focusable item should be found in the hidden container2");
		});

		QUnit.test("lastFocusableDomRef, simple container", function (assert) {
			var oFocusableItem = jQuery('#container2').lastFocusableDomRef();
			assert.ok(!oFocusableItem, "no focusable item should be found in the hidden container2");
		});

		QUnit.module("Others");

		QUnit.test("ParentByAttribute", function (assert) {
			var oDomRef = jQuery.sap.domById('control2');
			var oParentWithAttribute = jQuery(oDomRef).parentByAttribute("data-sap-ui-test");
			assert.notEqual(oParentWithAttribute, null, "jQuery(oDomRef).parentByAttribute('data-sap-ui-test') is null)");

			assert.equal(oParentWithAttribute.getAttribute('data-sap-ui-test'), "true", "jQuery(oDomRef).parentByAttribute('data-sap-ui-test').getAttribute('data-sap-ui-test') should be 'true'");

			var oParentWithAttributeFalse = jQuery(oDomRef).parentByAttribute("data-sap-ui-test", "false");
			assert.ok(!oParentWithAttributeFalse, "jQuery(oDomRef).parentByAttribute('data-sap-ui-test', 'false') should be undefined");

			var oParentWithAttributeTrue = jQuery(oDomRef).parentByAttribute("data-sap-ui-test", "true");
			assert.ok(oParentWithAttributeTrue, "jQuery(oDomRef).parentByAttribute('data-sap-ui-test', 'true') should be not null");
		});

		QUnit.test("OwnerWindow", function (assert) {
			assert.expect(0);
			// tests not easily possible, as there is no defined, stable environment with different windows
		});

		QUnit.test("Focus", function (assert) { // actually tests jQuery itself
			var oDomRef = jQuery.sap.domById('control3');
			jQuery(oDomRef).trigger("focus");
			assert.equal(document.activeElement, oDomRef, "jQuery().trigger(\"focus\") failed");
		});

		QUnit.test("ScrollbarSize", function (assert) {
			var size = jQuery.sap.scrollbarSize(true);
			assert.ok(size, "No size for scroll bar returned");
			assert.ok(typeof size.width === "number", "No width for scroll bar returned");
			assert.ok(typeof size.height === "number", "No height for scroll bar returned");

			var size = jQuery.sap.scrollbarSize(null, true);
			assert.ok(size, "No size for scroll bar returned");
			assert.ok(typeof size.width === "number", "No width for scroll bar returned");
			assert.ok(typeof size.height === "number", "No height for scroll bar returned");

			var size = jQuery.sap.scrollbarSize("someclass", true);
			assert.ok(size, "No size for scroll bar returned");
			assert.ok(typeof size.width === "number", "No width for scroll bar returned");
			assert.ok(typeof size.height === "number", "No height for scroll bar returned");

			var size = jQuery.sap.scrollbarSize("someclass");
			assert.ok(size, "No size for scroll bar returned");
			assert.ok(typeof size.width === "number", "No width for scroll bar returned");
			assert.ok(typeof size.height === "number", "No height for scroll bar returned");
		});

		QUnit.test("disableSelection", function (assert) {

			// arrange
			var oDomRef = document.createElement("div");
			oDomRef.innerHTML = "text";
			document.body.appendChild(oDomRef);

			// act
			jQuery(oDomRef).disableSelection();

			// arrange
			var sEvent = "onselectstart" in document.createElement("div") ? "selectstart" : "mousedown";
			var oSelectstarListener = jQuery._data(oDomRef, "events")[sEvent];

			// assertions
			assert.strictEqual(oSelectstarListener.length, 1);

			// cleanup
			document.body.removeChild(oDomRef);
		});

		QUnit.test("enableSelection", function (assert) {

			// arrange
			var oDomRef = document.createElement("div");
			oDomRef.innerHTML = "text";
			document.body.appendChild(oDomRef);

			// act
			jQuery(oDomRef).disableSelection();
			jQuery(oDomRef).enableSelection();

			// assertions
			assert.strictEqual(jQuery._data(oDomRef, "events"), undefined);

			// cleanup
			document.body.removeChild(oDomRef);
		});

		QUnit.test("jQuery aria extensions", function (assert) {
			var $El = jQuery("<div>Aria Test</div>");
			jQuery(document.body).append($El);

			$El.addAriaLabelledBy("test1");
			assert.strictEqual($El.attr("aria-labelledby"), "test1", "aria-labelledby attribute is added to the DOM");
			$El.addAriaDescribedBy("test1");
			assert.strictEqual($El.attr("aria-describedby"), "test1", "aria-describedby attribute is added to the DOM");

			$El.addAriaLabelledBy("test1");
			assert.strictEqual($El.attr("aria-labelledby"), "test1", "already existing aria-labelledby is ignored");
			$El.addAriaDescribedBy("test1");
			assert.strictEqual($El.attr("aria-describedby"), "test1", "already existing aria-describedby is ignored");

			$El.addAriaLabelledBy("test");
			assert.strictEqual($El.attr("aria-labelledby"), "test1 test", "new aria-labelledby attribute is added with space concating");
			$El.addAriaDescribedBy("test");
			assert.strictEqual($El.attr("aria-describedby"), "test1 test", "new aria-describedby attribute is added with space concating");

			$El.removeAriaLabelledBy("t");
			assert.strictEqual($El.attr("aria-labelledby"), "test1 test", "non-existing aria-labelledby is ignored");
			$El.removeAriaDescribedBy("t");
			assert.strictEqual($El.attr("aria-describedby"), "test1 test", "non-existing aria-describedby is ignored");

			$El.removeAriaLabelledBy("test1");
			assert.strictEqual($El.attr("aria-labelledby"), "test", "existing aria-labelledby is removed from DOM");
			$El.removeAriaDescribedBy("test1");
			assert.strictEqual($El.attr("aria-describedby"), "test", "existing aria-describedby is removed from DOM");

			$El.removeAriaLabelledBy("test");
			assert.strictEqual($El.attr("aria-labelledby"), undefined, "last existing aria-labelledby is removed the attribute");
			$El.removeAriaDescribedBy("test");
			assert.strictEqual($El.attr("aria-describedby"), undefined, "last existing aria-describedby is removed the attribute");

			$El.removeAriaLabelledBy("test");
			assert.strictEqual($El.attr("aria-labelledby"), undefined, "non-existing aria-labelledby is ignored");
			$El.removeAriaDescribedBy("test");
			assert.strictEqual($El.attr("aria-describedby"), undefined, "non-existing aria-describedby is ignored");

			$El.remove();
		});

		QUnit.module("Selector", {
			beforeEach: function () {
				this.$Image = jQuery('' +
					'<img id="image" data-sap-ui="image" src="jquery/SAPLogo.gif" class="sapUiImg" usemap="#Map1" alt="Alternative image text for Image2" tabindex="0" style="width:300px;height:200px;">'
				);
				this.$ImageMap = jQuery('' +
					'<map tabindex="-1" id="imgMap1" data-sap-ui="imgMap1" name="Map1">' +
					'<area id="area11" data-sap-ui="area11" style="display: inline;" aria-describedby="imgMap1-Descr" shape="rect" coords="1,1,100,100" href="#" alt="Text on Alt1" tabindex="-1">' +
					'<area id="area12" data-sap-ui="area12" style="display: inline;" aria-describedby="imgMap1-Descr" shape="rect" coords="101,1,200,100" href="#" alt="Text on Alt2" tabindex="-1">' +
					'<area id="area13" data-sap-ui="area13" style="display: inline;" aria-describedby="imgMap1-Descr" shape="rect" coords="201,1,300,100" href="#" alt="Text on Alt3" tabindex="-1">' +
					'<area id="area14" data-sap-ui="area14" style="display: inline;" aria-describedby="imgMap1-Descr" shape="rect" coords="1,101,100,200" href="#" alt="Text on Alt4" tabindex="0">' +
					'<area id="area15" data-sap-ui="area15" style="display: inline;" aria-describedby="imgMap1-Descr" shape="rect" coords="101,101,200,200" href="#" alt="Text on Alt5" tabindex="-1"></map>' +
					'</map>'
				);

				// let the reference have parent to replace
				jQuery(document.body).append(this.$Image);
				jQuery(document.body).append(this.$ImageMap);

				return nextUIUpdate();
			},

			afterEach: function () {
				this.$Image.remove();
				this.$ImageMap.remove();
			}
		});

		QUnit.test("Using Quotes for selector ':sapFocusable' on ImageMap", function (assert) {
			var $Area11 = jQuery("#area11");
			// this caused an issue while introducing jQuery 2.2.2 in the ImageMap
			// visual test page
			var bFocusable = $Area11.is(":sapFocusable");

			assert.ok(bFocusable, "Map is :sapFocusable");
		});

		QUnit.module("rtl vertical scrolling", {
			beforeEach: function () {
				this.container = document.createElement("div");
				this.$container = jQuery(this.container);
				this.container.style = "direction:rtl;overflow-x:scroll;overflow-y:hidden;width:100px;height:20px";
				this.element = document.createElement("div");
				this.element.style = "width:200px;height:10px;background:linear-gradient(to right,red,yellow);";
				this.container.appendChild(this.element);
				document.body.appendChild(this.container);
			},
			afterEach: function () {
				document.body.removeChild(this.container);
			}
		});

		QUnit.test("scrollLeftRTL - get", function (assert) {
			var iScrollLeft = this.$container.scrollLeftRTL();
			assert.strictEqual(iScrollLeft, 100, "initial scroll position is set to 100");
		});

		QUnit.test("scrollLeftRTL - set", function (assert) {
			this.$container.scrollLeftRTL(100);
			assert.strictEqual(this.$container.scrollLeftRTL(), 100, "scroll left for 100px");

			this.$container.scrollLeftRTL(0);
			assert.strictEqual(this.$container.scrollLeftRTL(), 0, "scroll back for 100px");

			this.$container.scrollLeftRTL(101);
			assert.strictEqual(this.$container.scrollLeftRTL(), 100, "scroll left exceeding width");
		});

		QUnit.test("scrollRightRTL", function (assert) {
			var iScrollRight = jQuery.fn.scrollRightRTL.call(this.$container);
			assert.strictEqual(iScrollRight, 0, "initial scroll position is set to 0");
		});

		// validate the denormalization against the actual scrolling results, as they are browser dependent
		QUnit.test("denormalizeScrollLeftRTL", function (assert) {
			var iScrollLeft = jQuery.sap.denormalizeScrollLeftRTL(0, this.container);
			this.$container.scrollLeftRTL(0);
			assert.strictEqual(iScrollLeft, this.container.scrollLeft, "call with 0 - " + this.container.scrollLeft);

			iScrollLeft = jQuery.sap.denormalizeScrollLeftRTL(100, this.container);
			this.$container.scrollLeftRTL(100);
			assert.strictEqual(iScrollLeft, this.container.scrollLeft, "call with 100 - " + this.container.scrollLeft);

			// the following test is browser dependent
			// iScrollLeft = jQuery.sap.denormalizeScrollLeftRTL(101, this.container);
			// this.$container.scrollLeftRTL(101);
			// assert.strictEqual(iScrollLeft, this.container.scrollLeft, "call with 101 exceeding width - " + this.container.scrollLeft);

			iScrollLeft = jQuery.sap.denormalizeScrollLeftRTL(100);
			assert.strictEqual(iScrollLeft, undefined, "call without domref - undefined");
		});

		QUnit.test("denormalizeScrollBeginRTL", function (assert) {
			// the following 3 tests are browser dependent
			// var iScrollBegin = jQuery.sap.denormalizeScrollBeginRTL(0, this.container);
			// assert.strictEqual(iScrollBegin, 100, "call with 0 - 100");

			// iScrollBegin = jQuery.sap.denormalizeScrollBeginRTL(100, this.container);
			// assert.strictEqual(iScrollBegin, 0, "call with 100 - 0");

			// iScrollBegin = jQuery.sap.denormalizeScrollBeginRTL(101, this.container);
			// assert.strictEqual(iScrollBegin, -1, "call with 101 (exceeding width) - -1");

			var iScrollBegin = jQuery.sap.denormalizeScrollBeginRTL(100);
			assert.strictEqual(iScrollBegin, undefined, "call without domref - undefined");
		});

	});

});
