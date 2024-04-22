/*global QUnit, sinon*/
sap.ui.define([
	"sap/base/future",
	"sap/base/Log",
	"sap/ui/core/Element",
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/thirdparty/jquery"
], function(future, Log, Element, createAndAppendDiv, jQuery) {
	"use strict";

	QUnit.module("Element.closestTo()");

	QUnit.test("Should throw TypeError when none of DOM Element, string is given", function(assert) {
		assert.throws(function() {
			Element.closestTo({});
		}, new TypeError("Element.closestTo accepts either a DOM element or a CSS selector string as parameter, but not '[object Object]'"));
	});

	QUnit.test("Should return undefined when undefined/null is given as param", function(assert) {
		assert.strictEqual(Element.closestTo(undefined), undefined);
		assert.strictEqual(Element.closestTo(null), undefined);

		assert.strictEqual(Element.closestTo(".abc"), undefined);
	});

	QUnit.test("Should return undefined when no element can be found by using the given selector", function(assert) {
		var sId = "el1";
		var oContainer = createAndAppendDiv(sId);
		oContainer.innerHTML = "<span class='myClass'></span> \
								<span class='myClass'></span>";

		var oUI5Element = Element.closestTo(".myClass");
		assert.strictEqual(oUI5Element, undefined);

		oContainer.remove();
	});

	QUnit.test("Should return the element itself when the given DOM ref matches the selector", function(assert) {
		var sId = "el1";
		var oContainer = createAndAppendDiv(sId);
		oContainer.setAttribute("data-sap-ui", sId);

		var oUI5Element = new Element(sId);
		var oUI5ElementFound = Element.closestTo(oContainer);
		assert.strictEqual(oUI5ElementFound, oUI5Element);

		oContainer.remove();
		oUI5Element.destroy();
	});

	QUnit.test("Should traverse up starting from the given DOM/selector till a parent with the selector is found", function(assert) {
		var sId = "el1";
		var oContainer = createAndAppendDiv(sId);
		oContainer.setAttribute("data-sap-ui", sId);
		oContainer.innerHTML = "<div id='el2' data-sap-ui-related='el2'> \
									<span id='startPoint'></span> \
								</div>";

		var oUI5Element = new Element(sId);
		var oUI5ElementFound = Element.closestTo(document.getElementById("startPoint"));
		assert.strictEqual(oUI5ElementFound, oUI5Element);

		oUI5ElementFound = Element.closestTo("#startPoint");
		assert.strictEqual(oUI5ElementFound, oUI5Element);

		oContainer.remove();
		oUI5Element.destroy();
	});

	QUnit.test("Should traverse up starting from the given DOM/selector (SVG) till a parent with the selector is found", function(assert) {
		var sId = "el1";
		var oContainer = createAndAppendDiv(sId);
		oContainer.setAttribute("data-sap-ui", sId);
		oContainer.innerHTML = "<div id='el2' data-sap-ui-related='el2'> \
									<svg id='startPoint' xmlns='http://www.w3.org/2000/svg' class='h-6 w-6' fill='none' viewBox='0 0 24 24' stroke='currentColor'> \
										<path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M13.828 10.172 a4 4 0 00-5.656 0 l-4 4' /> \
									</svg> \
								</div>";

		var oUI5Element = new Element(sId);
		var oUI5ElementFound = Element.closestTo(document.getElementById("startPoint"));
		assert.strictEqual(oUI5ElementFound, oUI5Element);

		oUI5ElementFound = Element.closestTo("#startPoint");
		assert.strictEqual(oUI5ElementFound, oUI5Element);

		oContainer.remove();
		oUI5Element.destroy();
	});

	QUnit.test("Should use the first match to traverse up to find the wrapping control (multiple DOM elements match the given selector)", function(assert) {
		var oContainer = createAndAppendDiv("el1");
		oContainer.setAttribute("data-sap-ui", "el1");
		oContainer.innerHTML = "<div id='el1-1' data-sap-ui='el1-1'> \
									<span class='myClass'></span> \
								</div> \
								<div id='el1-2' data-sap-ui='el1-2'> \
									<span class='myClass'></span> \
								</div> \
								<span class='myClass'></span> \
								<div id='el1-3' data-sap-ui='el1-3'> \
									<span class='myClass'></span> \
								</div>";

		var oUI5Element = new Element("el1-1");
		var oUI5ElementFound = Element.closestTo(".myClass");
		assert.strictEqual(oUI5ElementFound, oUI5Element);

		oContainer.remove();
		oUI5Element.destroy();
	});

	QUnit.test("Should return the element by using the 'data-sap-ui-related' when the 'bIncludeRelated' is used", function(assert) {
		var sId = "el1";
		var oContainer = createAndAppendDiv(sId);
		oContainer.setAttribute("data-sap-ui", sId);
		oContainer.innerHTML = "<div data-sap-ui-related='el2'> \
									<span id='startPoint'></span> \
								</div>";

		var oUI5Element = new Element("el2");
		var oUI5ElementFound = Element.closestTo(document.getElementById("startPoint"), true);
		assert.strictEqual(oUI5ElementFound, oUI5Element);

		oContainer.remove();
		oUI5Element.destroy();
	});

	/**
	 * @deprecated As of version 1.120
	 */
	QUnit.test("Should support jQuery object given as parameter (future=false)", function(assert) {
		future.active = false;
		var oErrorLogSpy = this.spy(Log, "error");
		var sId = "el1";
		var oContainer = createAndAppendDiv(sId);
		oContainer.setAttribute("data-sap-ui", sId);
		oContainer.innerHTML = "<div id='el2' data-sap-ui-related='el2'> \
									<span id='startPoint'></span> \
								</div>";

		var oUI5Element = new Element(sId);

		var oUI5ElementFound = Element.closestTo(jQuery("#startPoint"));
		assert.strictEqual(oUI5ElementFound, oUI5Element);

		sinon.assert.calledWithExactly(oErrorLogSpy, "[FUTURE FATAL] Do not call Element.closestTo() with jQuery object as parameter. The function should be called with either a DOM Element or a CSS selector.");

		oContainer.remove();
		oUI5Element.destroy();
		future.active = undefined;
	});

	QUnit.test("Should support jQuery object given as parameter (future=true)", function(assert) {
		future.active = true;
		var sId = "el1";
		var oContainer = createAndAppendDiv(sId);
		oContainer.setAttribute("data-sap-ui", sId);
		oContainer.innerHTML = "<div id='el2' data-sap-ui-related='el2'> \
									<span id='startPoint'></span> \
								</div>";

		assert.throws(() => {
			Element.closestTo(jQuery("#startPoint"));
		}, new Error("Do not call Element.closestTo() with jQuery object as parameter. The function should be called with either a DOM Element or a CSS selector."), "Error thrown because jQuery object is provided as argument.");

		oContainer.remove();
		future.active = undefined;
	});
});
