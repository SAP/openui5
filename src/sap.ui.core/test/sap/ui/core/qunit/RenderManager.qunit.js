
/* global QUnit */
sap.ui.define([
	"sap/base/future",
	"sap/ui/core/Control",
	"sap/ui/core/RenderManager",
	"sap/ui/core/HTML",
	"sap/ui/core/IconPool",
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/test/utils/nextUIUpdate",
	"sap/base/Log"
], function(
	future,
	Control,
	RenderManager,
	HTML,
	IconPool,
	createAndAppendDiv,
	nextUIUpdate,
	Log
) {
	"use strict";

	// prepare DOM
	createAndAppendDiv(["area1", "area2", "area3", "area4", "area5", "area6", "area7", "area8"], createAndAppendDiv("testArea"));
	createAndAppendDiv("area9");


	function getEnumerableKeys(obj) {
		const keys = [];
		for (const name in obj) {
			keys.push(name);
		}
		return keys;
	}

	QUnit.module("Core API");

	QUnit.test("Core.createRenderManager", function(assert) {
		assert.notStrictEqual(new RenderManager().getInterface(), new RenderManager().getInterface(), "Core.createRenderManager should always return a new RenderManager instance");
	});

	QUnit.module("Interfaces");

	var aCommonMethods = ["renderControl", "cleanupControlWithoutRendering"];

	var aDomRendererMethods = ["openStart", "openEnd", "close", "voidStart", "voidEnd", "text", "attr", "class", "style",
		"accessibilityState", "icon", "unsafeHtml"];

	const aInterfaceMethods = [
		...aCommonMethods,
		...aDomRendererMethods
	];

	var aNonRendererFunctions = ["render", "flush", "renderAndFlush", "destroy"];

	QUnit.test("Full Interface", function(assert) {
		var rm = new RenderManager().getInterface();
		var aAllFunctions = aInterfaceMethods.concat(aNonRendererFunctions);

		assert.deepEqual(
			getEnumerableKeys(rm).sort(),
			aAllFunctions.sort(),
			"RenderManager interface should contain exactly the expected methods"
		);
	});

	QUnit.test("Interface provided to Renderer with apiVersion 2", function(assert) {
		const aDomInterfaceMethods = [...aCommonMethods, ...aDomRendererMethods];
		const TestControlV2 = Control.extend("TestControlV2", {
			renderer: {
				apiVersion: 2,
				render(oRM, oControl) {
					oRM.openStart("div", oControl).openEnd().close("div");
					assert.deepEqual(
						getEnumerableKeys(oRM).sort(),
						aDomInterfaceMethods.sort(),
						"Interface given to control renderer should contain exactly the expected methods");
				}
			}
		});

		const rm = new RenderManager().getInterface();
		const oControl = new TestControlV2();
		rm.renderControl(oControl);

		// cleanup
		rm.destroy();
		oControl.destroy();
	});

	QUnit.test("Interface provided to Renderer with apiVersion 4", function(assert) {
		const aDomInterfaceMethods = [...aCommonMethods, ...aDomRendererMethods];
		const TestControlV4 = Control.extend("TestControlV4", {
			renderer: {
				apiVersion: 4,
				render(oRM, oControl) {
					oRM.openStart("div", oControl).openEnd().close("div");
					assert.deepEqual(
						getEnumerableKeys(oRM).sort(),
						aDomInterfaceMethods.sort(),
						"Interface given to control renderer should contain exactly the expected methods");
				}
			}
		});

		const rm = new RenderManager().getInterface();
		const oControl = new TestControlV4();
		rm.renderControl(oControl);

		// cleanup
		rm.destroy();
		oControl.destroy();
	});

	QUnit.module("Writer API: Semantic Syntax (DOM) Assertions (future=true)", {
		before: function() {
			future.active = true;
		},
		beforeEach: function() {
			this.oRM = new RenderManager().getInterface();
		},
		afterEach: function() {
			this.oRM.destroy();
		},
		after: function() {
			future.active = false;
		}
	});

	QUnit.test("RenderManager.openStart - empty tag", function (assert) {
		try {
			this.oRM.openStart();
		} catch (error) {
			assert.ok(error, "Error thrown as expected");
			assert.ok(error.message.includes("The tag name provided 'undefined' is not valid; it must contain alphanumeric characters, hyphens or underscores"), "Error message is as expected");
		}
	});

	QUnit.test("RenderManager.openStart - invalid tag", function (assert) {
		try {
			this.oRM.openStart("1");
		} catch (error) {
			assert.ok(error, "Error thrown as expected");
			assert.ok(error.message.includes("The tag name provided '1' is not valid; it must contain alphanumeric characters, hyphens or underscores"), "Error message is as expected");
		}
	});

	QUnit.test("RenderManager.openStart - nested", function (assert) {
		try {
			this.oRM.openStart("div").openStart("div");
		} catch (error) {
			assert.ok(error, "Error thrown as expected");
			assert.ok(error.message.includes("There is an open tag; 'div' tag has not yet ended with 'openEnd'"), "Error message is as expected");
		}
	});

	QUnit.test("RenderManager.openStart - invalid tag upper case", function (assert) {
		try {
			this.oRM.openStart("H1");
		} catch (error) {
			assert.ok(error, "Error thrown as expected");
			assert.ok(error.message.includes("The tag name provided 'H1' is not valid; it must contain alphanumeric characters, hyphens or underscores"), "Error message is as expected");
		}
	});

	QUnit.test("RenderManager.openStart - voidStart", function (assert) {
		try {
			this.oRM.openStart("div").voidStart("img");
		} catch (error) {
			assert.ok(error, "Error thrown as expected");
			assert.ok(error.message.includes("There is an open tag; 'div' tag has not yet ended with 'openEnd'"), "Error message is as expected");
		}
	});

	QUnit.test("RenderManager.voidStart - empty tag", function (assert) {
		try {
			this.oRM.voidStart();
		} catch (error) {
			assert.ok(error, "Error thrown as expected");
			assert.ok(error.message.includes("The tag name provided 'undefined' is not valid; it must contain alphanumeric characters, hyphens or underscores"), "Error message is as expected");
		}
	});

	QUnit.test("RenderManager.voidStart - invalid tag", function (assert) {
		try {
			this.oRM.voidStart("?");
		} catch (error) {
			assert.ok(error, "Error thrown as expected");
			assert.ok(error.message.includes("The tag name provided '?' is not valid; it must contain alphanumeric characters, hyphens or underscores"), "Error message is as expected");
		}
	});

	QUnit.test("RenderManager.voidStart - nested", function (assert) {
		try {
			this.oRM.voidStart("img").voidStart("input");
		} catch (error) {
			assert.ok(error, "Error thrown as expected");
			assert.ok(error.message.includes("There is an open tag; 'img' tag has not yet ended with 'voidEnd'"), "Error message is as expected");
		}
	});

	QUnit.test("RenderManager.voidStart - invalid tag upper case", function (assert) {
		try {
			this.oRM.voidStart("INPUT");
		} catch (error) {
			assert.ok(error, "Error thrown as expected");
			assert.ok(error.message.includes("The tag name provided 'INPUT' is not valid; it must contain alphanumeric characters, hyphens or underscores"), "Error message is as expected");
		}
	});

	QUnit.test("RenderManager.voidStart - openStart", function (assert) {
		try {
			this.oRM.voidStart("img").openStart("div");
		} catch (error) {
			assert.ok(error, "Error thrown as expected");
			assert.ok(error.message.includes("There is an open tag; 'img' tag has not yet ended with 'voidEnd'"), "Error message is as expected");
		}
	});

	QUnit.test("RenderManager.openEnd - without openStart", function (assert) {
		try {
			this.oRM.openEnd();
		} catch (error) {
			assert.ok(error, "Error thrown as expected");
			assert.ok(error.message.includes("There is no open tag; 'openEnd' must not be called without an open tag"), "Error message is as expected");
		}
	});

	QUnit.test("RenderManager.openEnd - voidStart", function (assert) {
		try {
			this.oRM.voidStart("div").openEnd();
		} catch (error) {
			assert.ok(error, "Error thrown as expected");
			assert.ok(error.message.includes("There is an open tag; 'div' tag has not yet ended with 'voidEnd'"), "Error message is as expected");
		}
	});

	QUnit.test("RenderManager.openEnd - valid", function (assert) {
		this.oRM.openStart("div").openEnd();
		assert.ok(true, "No error should be thrown");

	});

	QUnit.test("RenderManager.voidEnd - without voidStart", function (assert) {
		try {
			this.oRM.voidEnd();
		} catch (error) {
			assert.ok(error, "Error thrown as expected");
			assert.ok(error.message.includes("There is no open tag; 'voidEnd' must not be called without an open tag"), "Error message is as expected");
		}
	});

	QUnit.test("RenderManager.voidEnd - openStart", function (assert) {
		try {
			this.oRM.openStart("div").voidEnd();
		} catch (error) {
			assert.ok(error, "Error thrown as expected");
			assert.ok(error.message.includes("There is an open tag; 'div' tag has not yet ended with 'openEnd'"), "Error message is as expected");
		}
	});

	QUnit.test("RenderManager.voidEnd - valid", function (assert) {
		this.oRM.voidStart("br").voidEnd();
		assert.ok(true, "No error should be thrown");
	});

	QUnit.test("RenderManager.close - no tag name", function (assert) {
		try {
			this.oRM.openStart("div").openEnd().close();
		} catch (error) {
			assert.ok(error, "Error thrown as expected");
			assert.ok(error.message.includes("The tag name provided 'undefined' is not valid; it must contain alphanumeric characters, hyphens or underscores"), "Error message is as expected");
		}
	});

	QUnit.test("RenderManager.close - open tag", function (assert) {
		try {
			this.oRM.openStart("div").close("div");
		} catch (error) {
			assert.ok(error, "Error thrown as expected");
			assert.ok(error.message.includes("There is an open tag; 'div' tag has not yet ended with 'openEnd'"), "Error message is as expected");
		}
	});

	QUnit.test("RenderManager.close - open void tag", function (assert) {
		try {
			this.oRM.voidStart("img").close("img");
		} catch (error) {
			assert.ok(error, "Error thrown as expected");
			assert.ok(error.message.includes("There is an open tag; 'img' tag has not yet ended with 'voidEnd'"), "Error message is as expected");
		}
	});

	QUnit.test("RenderManager.unsafeHTML", function (assert) {
		try {
			this.oRM.voidStart("img").unsafeHtml(" tabindex='0'");
		} catch (error) {
			assert.ok(error, "Error thrown as expected");
			assert.ok(error.message.includes("There is an open tag; 'img' tag has not yet ended with 'voidEnd'"), "Error message is as expected");
		}
	});

	QUnit.test("RenderManager.text", function (assert) {
		try {
			this.oRM.openStart("div").text("text");
		} catch (error) {
			assert.ok(error, "Error thrown as expected");
			assert.ok(error.message.includes("There is an open tag; 'div' tag has not yet ended with 'openEnd'"), "Error message is as expected");
		}
	});

	QUnit.test("RenderManager.class('a b')", function (assert) {
		try {
			this.oRM.openStart("div").class("class1 class2");
		} catch (error) {
			assert.ok(error, "Error thrown as expected");
			assert.ok(error.message.includes("Method 'class' must be called with exactly one class name"), "Error message is as expected");
		}
	});

	QUnit.test("RenderManager.class('a', 'b')", function (assert) {
		try {
			this.oRM.openStart("div").class("class1", "class2");
		} catch (error) {
			assert.ok(error, "Error thrown as expected");
			assert.ok(error.message.includes("Method 'class' must be called with exactly one class name"), "Error message is as expected");
		}
	});

	QUnit.test("RenderManager.attr('class', ...)", function (assert) {
		this.oRM.openStart("div").attr("class");
		assert.ok(true, "No error should be thrown. Writing class attribute alone should be fine");
	});

	QUnit.test("RenderManager.class(...).attr('class', ...)", function (assert) {
		try {
			this.oRM.openStart("div").class("class1").attr("class", "class2");
		} catch (error) {
			assert.ok(error, "Error thrown as expected");
			assert.ok(error.message.includes("Attributes 'class' and 'style' must not be written when the methods with the same name have been called for the same element already"), "Error message is as expected");
		}
	});

	QUnit.test("RenderManager.attr('class', ...).class(...)", function (assert) {
		try {
			this.oRM.openStart("div").attr("class", "class2").class("class1");
		} catch (error) {
			assert.ok(error, "Error thrown as expected");
			assert.ok(error.message.includes("Method class() must not be called after the 'class' attribute has been written for the same element"), "Error message is as expected");
		}
	});

	QUnit.test("RenderManager.class(...).openEnd().openStart().attr('class',...)", function (assert) {
		this.oRM.openStart("div").class("class1").openEnd().openStart("div").attr("class", "class2");
		assert.ok(true, "No error should be thrown. Writing class attribute in new tag should pass assertion");
	});

	QUnit.test("RenderManager.attr('class',...).openEnd().openStart().class(...)", function (assert) {
		this.oRM.openStart("div").attr("class", "class1").openEnd().openStart("div").class("class2");
		assert.ok(true, "No error should be thrown. Adding a class in new tag should pass assertion");
	});

	QUnit.test("RenderManager.class(...).openEnd().voidStart().attr('class',...)", function (assert) {
		this.oRM.openStart("div").class("class1").openEnd().voidStart("div").attr("class", "class2");
		assert.ok(true, "No error should be thrown. Writing class attribute in new void tag should pass assertion");
	});

	QUnit.test("RenderManager.attr('class',...).openEnd().voidStart().class(...)", function (assert) {
		this.oRM.openStart("div").attr("class", "class1").openEnd().voidStart("div").class("class2");
		assert.ok(true, "No error should be thrown. Adding a class in new void tag should pass assertion");
	});

	QUnit.test("RenderManager.style (no style prop name)", function (assert) {
		try {
			this.oRM.openStart("div").style("", "100px");
		} catch (error) {
			assert.ok(error, "Error thrown as expected");
			assert.ok(error.message.includes("Method 'style' must be called with a non-empty string name"), "Error message is as expected");
		}
	});

	QUnit.test("RenderManager.attr('style')", function (assert) {
		this.oRM.openStart("div").attr("style", "width: 100%");
		assert.ok(true, "No error should be thrown. Writing style attribute alone should be fine");
	});

	QUnit.test("RenderManager.style(...).attr('style',...)", function (assert) {
		try {
			this.oRM.openStart("div").style("width", "100%").attr("style", "height: 100%");
		} catch (error) {
			assert.ok(error, "Error thrown as expected");
			assert.ok(error.message.includes("Attributes 'class' and 'style' must not be written when the methods with the same name have been called for the same element already"), "Error message is as expected");
		}
	});

	QUnit.test("RenderManager.attr('style',...).style(...)", function (assert) {
		try {
			this.oRM.openStart("div").attr("style", "height: 100%").style("width", "100%");
		} catch (error) {
			assert.ok(error, "Error thrown as expected");
			assert.ok(error.message.includes("Method style() must not be called after the 'style' attribute has been written for the same element"), "Error message is as expected");
		}
	});

	QUnit.test("RenderManager.style(...).openEnd().openStart().attr('style',...)", function (assert) {
		this.oRM.openStart("div").style("width", "100%").openEnd().openStart("div").attr("style", "height: 100%");
		assert.ok(true, "No error should be thrown. Writing style attribute in new tag should pass assertion");
	});

	QUnit.test("RenderManager.attr('style',...).openEnd().openStart().style(...)", function (assert) {
		this.oRM.openStart("div").attr("style", "height: 100%").openEnd().openStart("div").style("width", "100%");
		assert.ok(true, "No error should be thrown. Setting style property in new tag should pass assertion");
	});

	QUnit.test("RenderManager.style(...).openEnd().voidStart().attr('style',...)", function (assert) {
		this.oRM.openStart("div").style("width", "100%").openEnd().voidStart("input").attr("style", "height: 100%");
		assert.ok(true, "No error should be thrown. Writing style attribute in new void tag should pass assertion");
	});

	QUnit.test("RenderManager.attr('style',...).openEnd().voidStart().style(...)", function (assert) {
		this.oRM.openStart("div").attr("style", "height: 100%").openEnd().voidStart("input").style("width", "100%");
		assert.ok(true, "No error should be thrown. Setting style property in new void tag should pass assertion");
	});

	QUnit.test("Valid syntax No API assertion", function (assert) {
		this.oRM.
		openStart("div").attr("id", "x").style("width", "100%").class("x").openEnd().
			voidStart("img").attr("id", "y").style("width", "100px").class("y").class().class(false).class(null).voidEnd().
			openStart("so-me_Tag1").attr("some-3Attri_bute", "x").class(undefined).class("").openEnd().close("so-me_Tag1").
			voidStart("so-me_Void5Tag").voidEnd().
		close("div");

		// nested
		this.oRM.openStart("div");
			var oRM = new RenderManager().getInterface();
			oRM.voidStart("img").voidEnd();
			oRM.destroy();
		this.oRM.openEnd();

		assert.ok(true, "No error should be thrown");
	});

	// Custom control for testing namespace() method with MathML
	const MathMLControl = Control.extend("MathMLControl", {
		renderer: {
			apiVersion: 2,
			render: function(oRM, oControl) {
				oRM.openStart("div", oControl);
				oRM.openEnd();

				// Render HTML heading
				oRM.openStart("h3").openEnd();
				oRM.text("Matrix");
				oRM.close("h3");

				oRM.openStart("math").openEnd();

				// Matrix row container
				oRM.openStart("mrow").openEnd();

				// Opening bracket
				oRM.openStart("mo").openEnd();
				oRM.text("[");
				oRM.close("mo");

				// Matrix table
				oRM.openStart("mtable").openEnd();

				// First row
				oRM.openStart("mtr").openEnd();
				oRM.openStart("mtd").openEnd();
				oRM.openStart("mn").openEnd();
				oRM.text("1");
				oRM.close("mn");
				oRM.close("mtd");
				oRM.openStart("mtd").openEnd();
				oRM.openStart("mn").openEnd();
				oRM.text("2");
				oRM.close("mn");
				oRM.close("mtd");
				oRM.close("mtr");

				// Second row
				oRM.openStart("mtr").openEnd();
				oRM.openStart("mtd").openEnd();
				oRM.openStart("mn").openEnd();
				oRM.text("3");
				oRM.close("mn");
				oRM.close("mtd");
				oRM.openStart("mtd").openEnd();
				oRM.openStart("mn").openEnd();
				oRM.text("4");
				oRM.close("mn");
				oRM.close("mtd");
				oRM.close("mtr");

				oRM.close("mtable");

				// Closing bracket
				oRM.openStart("mo").openEnd();
				oRM.text("]");
				oRM.close("mo");

				oRM.close("mrow");
				oRM.close("math");

				oRM.openStart("div").attr("class", "footer").openEnd();
				oRM.text("Additional HTML content after MathML");
				oRM.close("div");

				oRM.close("div");
			}
		}
	});

	// Custom control for testing SVG namespace
	const SVGControl = Control.extend("SVGControl", {
		renderer: {
			apiVersion: 2,
			render: function(oRM, oControl) {
				oRM.openStart("div", oControl).openEnd();

				// Render HTML heading
				oRM.openStart("h3").openEnd();
				oRM.text("SVG Example");
				oRM.close("h3");

				oRM.openStart("svg").attr("width", "200").attr("height", "200").openEnd();

				oRM.openStart("circle").attr("cx", "100").attr("cy", "100").attr("r", "50").openEnd();
				oRM.close("circle");

				oRM.openStart("rect").attr("x", "10").attr("y", "10").attr("width", "50").attr("height", "50").openEnd();
				oRM.close("rect");

				oRM.close("svg");

				oRM.close("div");
			}
		}
	});

	QUnit.module("Namespace handling for foreign elements", {
		beforeEach: function() {
			this.container = document.createElement("div");
			document.body.appendChild(this.container);
		},
		afterEach: function() {
			document.body.removeChild(this.container);
		}
	});

	QUnit.test("Namespace handling - MathML control rendering", async function(assert) {
		const oControl = new MathMLControl();
		oControl.placeAt(this.container);
		await nextUIUpdate();

		// Verify the MathML element was created with correct namespace
		const oMath = oControl.getDomRef().querySelector("math");
		assert.ok(oMath, "MathML element created");
		assert.equal(oMath.namespaceURI, "http://www.w3.org/1998/Math/MathML", "MathML element has correct namespace");

		// Verify MathML children have correct namespace
		const oMrow = oMath.querySelector("mrow");
		assert.ok(oMrow, "MathML mrow element created");
		assert.equal(oMrow.namespaceURI, "http://www.w3.org/1998/Math/MathML", "MathML mrow inherits correct namespace");

		const oMtable = oMath.querySelector("mtable");
		assert.ok(oMtable, "MathML mtable element created");
		assert.equal(oMtable.namespaceURI, "http://www.w3.org/1998/Math/MathML", "MathML mtable inherits correct namespace");

		const oMo = oMath.querySelector("mo");
		assert.ok(oMo, "MathML mo element created");
		assert.equal(oMo.namespaceURI, "http://www.w3.org/1998/Math/MathML", "MathML mo inherits correct namespace");

		// Verify HTML elements within MathML control
		const oH3 = oControl.getDomRef().querySelector("h3");
		assert.ok(oH3, "HTML h3 element created");
		assert.equal(oH3.namespaceURI, "http://www.w3.org/1999/xhtml", "HTML element has HTML namespace");

		// Verify footer div is created after namespace reset with namespace(null)
		const oFooterDiv = oControl.getDomRef().querySelector("div.footer");
		assert.ok(oFooterDiv, "Footer div created after namespace reset");
		assert.equal(oFooterDiv.namespaceURI, "http://www.w3.org/1999/xhtml", "Footer div has HTML namespace");
		assert.equal(oFooterDiv.textContent, "Additional HTML content after MathML", "Footer div has correct text content");

		oControl.destroy();
	});

	QUnit.test("RenderManager.namespace - SVG control rendering", async function(assert) {
		const oControl = new SVGControl();
		oControl.placeAt(this.container);
		await nextUIUpdate();

		// Verify SVG element was created with correct namespace
		const oSvg = oControl.getDomRef().querySelector("svg");
		assert.ok(oSvg, "SVG element created");
		assert.equal(oSvg.namespaceURI, "http://www.w3.org/2000/svg", "SVG element has correct namespace");

		// Verify SVG child elements inherit namespace
		const oCircle = oSvg.querySelector("circle");
		assert.ok(oCircle, "SVG circle element created");
		assert.equal(oCircle.namespaceURI, "http://www.w3.org/2000/svg", "SVG circle inherits correct namespace");

		const oRect = oSvg.querySelector("rect");
		assert.ok(oRect, "SVG rect element created");
		assert.equal(oRect.namespaceURI, "http://www.w3.org/2000/svg", "SVG rect inherits correct namespace");

		// Verify HTML elements outside SVG
		const oH3 = oControl.getDomRef().querySelector("h3");
		assert.ok(oH3, "HTML h3 element created");
		assert.equal(oH3.namespaceURI, "http://www.w3.org/1999/xhtml", "HTML element has HTML namespace");

		oControl.destroy();
	});

	QUnit.module("RenderManager.prototype.icon");

	QUnit.test("RenderManager.prototype.icon with Icon URL", function(assert) {
		var rm = new RenderManager().getInterface();
		var oIconInfo = IconPool.getIconInfo("wrench");
		rm.icon(oIconInfo.uri, ["classA", "classB"], {
			id: "icon1",
			propertyA: "valueA",
			propertyB: "valueB"
		});
		rm.flush(document.getElementById("area6"));
		rm.destroy();

		var icon1 = document.getElementById("icon1");
		assert.ok(icon1, "icon should be rendered");
		assert.equal(icon1.tagName.toLowerCase(), "span", "Icon URI should be rendered as a span");
		assert.equal(icon1.style["fontFamily"].replace(/"|'/g, ""), oIconInfo.fontFamily, "Icon's font family is rendered");
		assert.equal(icon1.getAttribute("data-sap-ui-icon-content"), oIconInfo.content, "Icon content is rendered as attribute");
		assert.ok(icon1.classList.contains("classA"), "icon has classA as a CSS class");
		assert.ok(icon1.classList.contains("classB"), "icon has classB as a CSS class");
		assert.ok(icon1.classList.contains("sapUiIcon"), "icon has sapUiIcon as a CSS class");
		assert.ok(icon1.classList.contains("sapUiIconMirrorInRTL"), "icon has sapUiIconMirrorInRTL as a CSS class");
		assert.equal(icon1.getAttribute("propertyA"), "valueA", "Attribute should be set");
		assert.equal(icon1.getAttribute("propertyB"), "valueB", "Attribute should be set");
		assert.equal(icon1.getAttribute("aria-hidden"), "true", "Attribute 'aria-hidden' should be set");
		assert.notEqual(icon1.getAttribute("aria-label"), undefined, "Attribute aria-label should be set");

		document.getElementById("area6").innerHTML = "";

		rm = new RenderManager().getInterface();
		oIconInfo = IconPool.getIconInfo("calendar");
		rm.icon(oIconInfo.uri, ["classA", "classB"], {
			id: "icon1",
			propertyA: "valueA",
			propertyB: "valueB"
		});
		rm.flush(document.getElementById("area6"));
		rm.destroy();

		icon1 = document.getElementById("icon1");
		assert.ok(icon1, "icon should be rendered");
		assert.equal(icon1.tagName.toLowerCase(), "span", "Icon URI should be rendered as a span");
		assert.equal(icon1.style["fontFamily"].replace(/"|'/g, ""), oIconInfo.fontFamily, "Icon's font family is rendered");
		assert.equal(icon1.getAttribute("data-sap-ui-icon-content"), oIconInfo.content, "Icon content is rendered as attribute");
		assert.ok(icon1.classList.contains("classA"), "icon has classA as a CSS class");
		assert.ok(icon1.classList.contains("classB"), "icon has classB as a CSS class");
		assert.ok(icon1.classList.contains("sapUiIcon"), "icon has sapUiIcon as a CSS class");
		assert.ok(!icon1.classList.contains("sapUiIconMirrorInRTL"), "icon has sapUiIconMirrorInRTL as a CSS class");
		assert.equal(icon1.getAttribute("propertyA"), "valueA", "Attribute should be set");
		assert.equal(icon1.getAttribute("propertyB"), "valueB", "Attribute should be set");
		assert.notEqual(icon1.getAttribute("aria-label"), undefined, "Attribute aria-label should be set");

		document.getElementById("area6").innerHTML = "";
	});

	QUnit.test("RenderManager.prototype.icon with Icon URL. aria-label and aria-labelledby are set to null", function(assert) {
		var rm = new RenderManager().getInterface();
		var oIconInfo = IconPool.getIconInfo("wrench");
		rm.icon(oIconInfo.uri, [], {
			id: "icon1",
			"aria-label": null,
			"aria-labelledby": null,
			"role": "button"
		});
		rm.flush(document.getElementById("area6"));
		rm.destroy();

		var icon1 = document.getElementById("icon1"),
			invisibleText = document.getElementById("icon1-label");

		assert.ok(icon1, "icon should be rendered");
		assert.equal(icon1.getAttribute("aria-label"), undefined, "Attribute aria-label should not be set");
		assert.equal(icon1.getAttribute("aria-labelledby"), undefined, "Attribute aria-labelledby should not be set");
		assert.notOk(icon1.hasAttribute("aria-hidden"), "'aria-hidden' should not be set when role isn't 'presentation'");
		assert.notOk(invisibleText, "No invisible text is rendered");

		document.getElementById("area6").innerHTML = "";
	});

	QUnit.test("RenderManager.prototype.icon with Icon URL and aria-labelledby", function(assert) {
		var rm = new RenderManager().getInterface();
		var oIconInfo = IconPool.getIconInfo("wrench");
		rm.icon(oIconInfo.uri, [], {
			id: "icon1",
			"aria-labelledby": "foo",
			alt: "abc"
		});
		rm.flush(document.getElementById("area6"));
		rm.destroy();

		var icon1 = document.getElementById("icon1"),
			invisibleText = document.getElementById("icon1-label"),
			sText = invisibleText.textContent;
		assert.ok(icon1, "icon should be rendered");

		assert.equal(icon1.getAttribute("aria-label"), undefined, "Attribute aria-label should not be set");
		assert.equal(icon1.getAttribute("aria-labelledby"), "foo icon1-label", "Attribute aria-labelledby should contain both the given id and the id of the invisible text");
		assert.equal(sText, "abc", "The content of invisible text should be set");

		document.getElementById("area6").innerHTML = "";
	});

	QUnit.test("RenderManager.prototype.icon with font-family which has space inside", function(assert) {
		var fnOrigGetIconInfo = IconPool.getIconInfo,
			sFontFamily = "21st fontfamily which has space inside";

		this.stub(IconPool, "getIconInfo").callsFake(function (sIconName) {
			var oRes = fnOrigGetIconInfo(sIconName);
			oRes.fontFamily = sFontFamily;
			return oRes;
		});

		var rm = new RenderManager().getInterface();
		var oIconInfo = IconPool.getIconInfo("wrench");
		rm.icon(oIconInfo.uri, [], {
			id: "icon1"
		});
		rm.flush(document.getElementById("area6"));
		rm.destroy();

		var icon1 = document.getElementById("icon1");

		assert.ok(icon1, "icon should be rendered");
		assert.equal(icon1.tagName.toLowerCase(), "span", "Icon URI should be rendered as a span");
		assert.equal(icon1.style["fontFamily"], "\"" + sFontFamily + "\"", "Icon's font family is rendered");
		assert.equal(icon1.getAttribute("data-sap-ui-icon-content"), oIconInfo.content, "Icon content is rendered as attribute");
		assert.ok(icon1.classList.contains("sapUiIcon"), "icon has sapUiIcon as a CSS class");
		assert.ok(icon1.classList.contains("sapUiIconMirrorInRTL"), "icon has sapUiIconMirrorInRTL as a CSS class");
		assert.notEqual(icon1.getAttribute("aria-label"), undefined, "Attribute aria-label should be set");

		document.getElementById("area6").innerHTML = "";
	});

	QUnit.test("RenderManager.prototype.icon with Image URL", function(assert) {
		var rm = new RenderManager().getInterface(),
			sImgURL = sap.ui.require.toUrl("sap/ui/core/themes/base/img/Busy.gif");

		rm.icon(sImgURL, ["classA", "classB"], {
			id: "img1",
			propertyA: "valueA",
			propertyB: "valueB"
		});
		rm.flush(document.getElementById("area7"));
		rm.destroy();

		var img1 = document.getElementById("img1");
		assert.ok(img1, "icon should be rendered");
		assert.equal(img1.tagName.toLowerCase(), "img", "Image URI should be rendered as a img");
		assert.ok(img1.classList.contains("classA"), "img has classA as a CSS class");
		assert.ok(img1.classList.contains("classB"), "img has classB as a CSS class");
		assert.equal(img1.getAttribute("propertyA"), "valueA", "Attribute should be set");
		assert.equal(img1.getAttribute("propertyB"), "valueB", "Attribute should be set");
		assert.equal(img1.getAttribute("role"), "presentation", "Default attribute should be set");
		assert.equal(img1.getAttribute("alt"), "", "Default attribute should be set");

		document.getElementById("area7").innerHTML = "";

		rm = new RenderManager().getInterface();
		rm.icon(sImgURL, ["classA", "classB"], {
			id: "img1",
			role: "",
			alt: "test alt message"
		});
		rm.flush(document.getElementById("area7"));
		rm.destroy();

		img1 = document.getElementById("img1");
		assert.ok(img1, "icon should be rendered");
		assert.equal(img1.tagName.toLowerCase(), "img", "Image URI should be rendered as a img");
		assert.ok(img1.classList.contains("classA"), "img has classA as a CSS class");
		assert.ok(img1.classList.contains("classB"), "img has classB as a CSS class");
		assert.equal(img1.getAttribute("role"), "", "Attribute should be changed");
		assert.equal(img1.getAttribute("alt"), "test alt message", "Attribute should be changed");

		document.getElementById("area7").innerHTML = "";
	});

	QUnit.test("RenderManager.prototype.icon with style attribute triggers future.warningThrows", function(assert) {
		var rm = new RenderManager().getInterface();
		var oIconInfo = IconPool.getIconInfo("wrench");

		assert.throws(function() {
			rm.icon(oIconInfo.uri, ["classA"], {
				id: "icon-style-warning",
				style: "width: 16px; height: 16px;"
			});
		}, function(oError) {
			return oError.message.includes("mStyles");
		}, "should throw an error mentioning mStyles parameter");
		rm.destroy();
	});

	QUnit.test("RenderManager.prototype.icon with class attribute triggers future.warningThrows", function(assert) {
		var rm = new RenderManager().getInterface();
		var oIconInfo = IconPool.getIconInfo("wrench");

		assert.throws(function() {
			rm.icon(oIconInfo.uri, ["classA"], {
				id: "icon-class-warning",
				"class": "extraClass"
			});
		}, function(oError) {
			return oError.message.includes("aClasses");
		}, "should throw an error mentioning aClasses parameter");
		rm.destroy();
	});

	QUnit.test("RenderManager.prototype.icon with mStyles parameter (4th param)", function(assert) {
		var rm = new RenderManager().getInterface();
		var oIconInfo = IconPool.getIconInfo("wrench");
		rm.icon(oIconInfo.uri, ["classA"], {
			id: "icon-mstyles"
		}, {
			width: "20px",
			height: "20px",
			"line-height": "20px"
		});
		rm.flush(document.getElementById("area6"));
		rm.destroy();

		var icon1 = document.getElementById("icon-mstyles");
		assert.ok(icon1, "icon should be rendered");
		assert.equal(icon1.style.width, "20px", "width from mStyles is applied");
		assert.equal(icon1.style.height, "20px", "height from mStyles is applied");
		assert.equal(icon1.style.lineHeight, "20px", "line-height from mStyles is applied");
		assert.ok(icon1.style.fontFamily, "font-family set internally by icon() is preserved");

		document.getElementById("area6").innerHTML = "";
	});

	QUnit.module("Edge cases");

	QUnit.test("RenderManager should not break for controls with invalid renderer", async function(assert) {
		assert.ok(Log, "Log module should be available");

		// define a control without an invalid renderer
		var my = {};
		my.InvalidRendererControl = Control.extend("my.InvalidRendererControl", {
			renderer: {}
		});

		// create a new instance of the control
		var oControl = new my.InvalidRendererControl();
		var oMetadata = oControl.getMetadata();
		var oRenderer = oControl.getRenderer();

		// check for an invalid renderer (preconditions)
		assert.ok(!!oRenderer, "A renderer object should be provided");
		assert.ok(!oRenderer.render, "Invalid renderer should not provide a render function");

		// spy the Log.error function
		var oSpy = this.spy(Log, "error");

		// rendering should not lead to an error
		oControl.placeAt("area8");
		await nextUIUpdate();
		oControl.destroy();

		// check the error message
		assert.equal("The renderer for class " + oMetadata.getName() + " is not defined or does not define a render function! Rendering of " + oControl.getId() + " will be skipped!", oSpy.getCall(0).args[0], "Error should be reported in the console!");
	});


	QUnit.module("Events", {
		beforeEach: function() {
			this.oElement = document.createElement("div");
			this.oSpy = this.spy();
			this.oContext = {};
		},
		afterEach: function() {
			RenderManager.detachPreserveContent(this.oSpy);
		}
	});

	QUnit.test("preserveContent", function(assert) {
		RenderManager.attachPreserveContent(this.oSpy);
		RenderManager.preserveContent(this.oElement);
		assert.ok(this.oSpy.calledOnce);
		assert.ok(this.oSpy.calledWith({
			domNode: this.oElement
		}));
		assert.ok(this.oSpy.calledOn(RenderManager));
		this.oSpy.resetHistory();

		RenderManager.detachPreserveContent(this.oSpy);
		RenderManager.preserveContent(this.oElement);
		assert.ok(this.oSpy.notCalled);
	});

	QUnit.test("preserveContent with context", function(assert) {
		RenderManager.attachPreserveContent(this.oSpy, this.oContext);
		RenderManager.preserveContent(this.oElement);
		assert.ok(this.oSpy.calledOnce);
		assert.ok(this.oSpy.calledWith({
			domNode: this.oElement
		}));
		assert.ok(this.oSpy.calledOn(this.oContext));
	});

	QUnit.test("preserveContent duplicate listener", function(assert) {
		RenderManager.attachPreserveContent(this.oSpy);
		RenderManager.preserveContent(this.oElement);
		assert.ok(this.oSpy.calledOnce);
		this.oSpy.resetHistory();

		RenderManager.attachPreserveContent(this.oSpy, this.oContext);
		RenderManager.preserveContent(this.oElement);
		assert.ok(this.oSpy.calledOnce);
		assert.ok(this.oSpy.calledOn(this.oContext));
	});

	var TestControlSemanticRendering = Control.extend("TestControlSemanticRendering", {
		renderer: {
			apiVersion: 2,
			render: function(rm, oControl) {
				rm.openStart("div", oControl);
				rm.openEnd();
				rm.text("[" + oControl.getId() + "]");
				rm.close("div");
			}
		},
		onBeforeRendering: function() {
			if (this.doBeforeRendering) {
				this.doBeforeRendering();
			}
		},
		onAfterRendering: function() {
			if (this.doAfterRendering) {
				this.doAfterRendering();
			}
		}
	});

	QUnit.module("Invisible - Semantic Rendering");

	QUnit.test("Render visible control", async function(assert) {
		var oControl = new TestControlSemanticRendering("testVisible");
		oControl.placeAt("testArea");
		await nextUIUpdate();

		var oDomRef = document.getElementById("testVisible"),
			oInvisbleRef = document.getElementById("sap-ui-invisible-testVisible");
		assert.ok(oDomRef, "DOM reference exists");
		assert.ok(oDomRef instanceof HTMLElement, "DOM reference is an HTML element");

		assert.ok(!oInvisbleRef, "Invisible DOM reference doesn't exist");

		oControl.destroy();
		await nextUIUpdate();
	});

	QUnit.test("Render invisible control", async function(assert) {
		var oControl = new TestControlSemanticRendering("testVisible", {visible: false});
		oControl.placeAt("testArea");
		await nextUIUpdate();

		var oDomRef = document.getElementById("testVisible"),
			oInvisbleRef = document.getElementById("sap-ui-invisible-testVisible");
		assert.ok(!oDomRef, "DOM reference does not exist");

		assert.ok(oInvisbleRef, "Invisible DOM reference exists");
		assert.ok(oInvisbleRef instanceof HTMLElement, "Invisible DOM reference is an HTML element");

		oControl.destroy();
		await nextUIUpdate();
	});

	QUnit.test("Render control made visible in onBeforeRendering", async function(assert) {
		var oControl = new TestControlSemanticRendering("testVisible", {visible: false});
		oControl.doBeforeRendering = function() {
			this.setVisible(true);
		};
		oControl.placeAt("testArea");
		await nextUIUpdate();

		var oDomRef = document.getElementById("testVisible"),
			oInvisbleRef = document.getElementById("sap-ui-invisible-testVisible");
		assert.ok(oDomRef, "DOM reference exists");
		assert.ok(oDomRef instanceof HTMLElement, "DOM reference is an HTML element");

		assert.ok(!oInvisbleRef, "Invisible DOM reference doesn't exist");

		oControl.destroy();
		await nextUIUpdate();
	});

	QUnit.test("Render control made invisible in onBeforeRendering", async function(assert) {
		var oControl = new TestControlSemanticRendering("testVisible", {visible: true});
		oControl.doBeforeRendering = function() {
			this.setVisible(false);
		};
		oControl.placeAt("testArea");
		await nextUIUpdate();

		var oDomRef = document.getElementById("testVisible"),
			oInvisbleRef = document.getElementById("sap-ui-invisible-testVisible");
		assert.ok(!oDomRef, "DOM reference does not exist");

		assert.ok(oInvisbleRef, "Invisible DOM reference exists");
		assert.ok(oInvisbleRef instanceof HTMLElement, "Invisible DOM reference is an HTML element");

		oControl.destroy();
		await nextUIUpdate();
	});

	/**
	 * Sample container which renders exactly one of its children and calls
	 * cleanupControlWithoutRendering for all others.
	 *
	 * Method 'setTheLuckyOneAndRender' synchronously renders the content aggregation.
	 * This mimics the behavior of controls that try to optimize rendering.
	 */
	var TestContainer = Control.extend("TestContainer", {
		metadata: {
			properties: {
				theLuckyOne: "int"
			},
			aggregations: {
				"content": {}
			},
			defaultAggregation: "content"
		},
		renderer: {
			apiVersion: 2,
			render: function(oRm, oControl) {
				oRm.openStart("div", oControl);
				oRm.openEnd();
				oRm.openStart("div", oControl.getId() + "-content");
				oRm.openEnd();
				this.renderContent(oRm, oControl);
				oRm.close("div");
				oRm.close("div");
			},
			renderContent: function(oRm, oControl) {
				var theLuckyOne = oControl.getTheLuckyOne();
				Log.info("begin");
				oControl.getContent().forEach(function(oChild, idx) {
					if ( idx === theLuckyOne ) {
						Log.info("rendering ", idx);
						oRm.renderControl(oChild);
					} else {
						Log.info("cleaning up ", idx);
						oRm.cleanupControlWithoutRendering(oChild);
					}
				});
				Log.info("done");
			}
		},
		setTheLuckyOneAndRender: function(value) {
			this.setProperty("theLuckyOne", value, true);
			var oRM = new RenderManager().getInterface();
			this.getMetadata().getRenderer().renderContent(oRM, this);
			oRM.flush(this.getDomRef("content"));
			oRM.destroy();
		}
	});

	QUnit.module("cleanupControlWithoutRendering and DOM preservation", {
		beforeEach: function() {
			this.oView1 = new HTML({ content: "<span>view1</span>" });
			this.oView2 = new HTML({ content: "<span>view2</span>" });
			this.oContainer = new TestContainer({
				theLuckyOne: 0,
				content: [ this.oView1, this.oView2 ]
			});
		},
		afterEach: function() {
			this.oView1 = null;
			this.oView2 = null;
			this.oContainer = null;
		},

		executeTest: async function (assert, fnApplyLuckyOne) {
			var oView1 = this.oView1;
			var oView2 = this.oView2;
			var oContainer = this.oContainer;
			// initially show view 1. view 2 has not been rendered yet
			oContainer.placeAt("area9");
			await nextUIUpdate();
			assert.ok(oView1.getDomRef(), "view1 should have DOM");
			assert.ok(oView1.bOutput, "view1 should be marked with bOutput");
			assert.notOk(RenderManager.isPreservedContent(oView1.getDomRef()), "DOM of view1 should not be in preserve area");
			assert.notOk(oView2.getDomRef(), "view2 should not have DOM");
			assert.notOk(oView2.bOutput, "view2 should not be marked with bOutput");

			// show view 2. view 1 will be moved to preserve area
			await fnApplyLuckyOne(1);
			assert.ok(oView1.getDomRef(), "view1 still should have DOM");
			assert.ok(RenderManager.isPreservedContent(oView1.getDomRef()), "DOM of view1 should be in preserve area");
			assert.ok(oView1.bOutput, "view1 should be marked with bOutput");
			assert.ok(oView2.getDomRef(), "view2 also should have DOM");
			assert.ok(oView2.bOutput, "view2 should be marked with bOutput");
			assert.notOk(RenderManager.isPreservedContent(oView2.getDomRef()), "DOM of view2 should not be in preserve area");

			// show view 1 again (includes restore from preserve area
			await fnApplyLuckyOne(0);
			assert.ok(oView1.getDomRef(), "view1 still should have DOM");
			assert.ok(oView1.bOutput, "view1 should be marked with bOutput");
			assert.notOk(RenderManager.isPreservedContent(oView1.getDomRef()), "DOM of view1 should not be in preserve area");
			assert.ok(oView2.getDomRef(), "view2 still should have DOM");
			assert.ok(oView2.bOutput, "view2 should be marked with bOutput");
			assert.ok(RenderManager.isPreservedContent(oView2.getDomRef()), "DOM of view2 should be in preserve area");

			// show view 3 (which does not exists). view 1 & 2 are moved to the preserve area
			await fnApplyLuckyOne(2);
			assert.ok(oView1.getDomRef(), "view1 still should have DOM");
			assert.ok(oView1.bOutput, "view1 should be marked with bOutput");
			assert.ok(RenderManager.isPreservedContent(oView1.getDomRef()), "DOM of view1 should be in preserve area");
			assert.ok(oView2.getDomRef(), "view2 still should have DOM");
			assert.ok(oView2.bOutput, "view2 should be marked with bOutput");
			assert.ok(RenderManager.isPreservedContent(oView2.getDomRef()), "DOM of view2 should be in preserve area");

			// destroy, DOM should disappear (bOutput is no longer relevant)
			oContainer.destroy();
			assert.notOk(oView1.getDomRef(), "view1 no longer should have DOM");
			assert.notOk(oView2.getDomRef(), "view2 no longer should have DOM");
		}
	});

	QUnit.test("default rendering (patcher)", async function(assert) {
		TestContainer.getMetadata().getRenderer().apiVersion = 2;
		await this.executeTest(assert, async function(value) {
			// use normal invalidation
			this.oContainer.setTheLuckyOne(value);
			// and force re-rendering
			await nextUIUpdate();
		}.bind(this));
	});

	QUnit.test("custom rendering (patcher)", async function(assert) {
		TestContainer.getMetadata().getRenderer().apiVersion = 2;
		await this.executeTest(assert, function(value) {
			// use custom rendering (leaves the preservation to the flush call)
			this.oContainer.setTheLuckyOneAndRender(value);
		}.bind(this));
	});

	QUnit.test("preservation of not-rendered, indirect descendants (grand children etc.)", async function(assert) {
		TestContainer.getMetadata().getRenderer().apiVersion = 2;
		var oHtml1 = new HTML({content: "<div></div>"}),
			oHtml2 = new HTML({content: "<div></div>"}),
			oContainer = new TestContainer({
			theLuckyOne: 0,
			content: [
				oHtml1,
				new TestContainer({
					theLuckyOne: 0,
					content: [ oHtml2 ]
				})
			]
		});

		// act 1: initial rendering
		oContainer.placeAt("area9");
		await nextUIUpdate();

		// assert 1: HTML1 rendered, HTML2 not yet rendered
		assert.ok(oHtml1.getDomRef() && !RenderManager.isPreservedContent(oHtml1.getDomRef()),
			"HTML1 has DOM and is not preserved");
		assert.notOk(oHtml2.getDomRef(),
			"HTML2 has not been rendered yet");

		// act 2: switch rendered control
		oContainer.setTheLuckyOne(1);
		await nextUIUpdate();
		oHtml2.$().append("<span></span>");
		oHtml2.$().append("<span></span>");
		oHtml2.$().append("<span></span>");
		oHtml2.$().append("<span></span>");

		// assert 2: HTML1 not visible, but preserved, HTML2 rendered
		assert.ok(oHtml1.getDomRef() && RenderManager.isPreservedContent(oHtml1.getDomRef()),
			"HTML1 has DOM but has been preserved");
		assert.ok(oHtml2.getDomRef() && !RenderManager.isPreservedContent(oHtml2.getDomRef()),
			"HTML2 has DOM and is not preserved");
		assert.equal(oHtml2.$().children().length, 4,
			"HTML2 should have the expected children");

		// act 3: switch again
		oContainer.setTheLuckyOne(0);
		await nextUIUpdate();

		// assert 3: HTML1 rendered, HTML2 not rendered, but preserved
		assert.ok(oHtml1.getDomRef() && !RenderManager.isPreservedContent(oHtml1.getDomRef()),
			"HTML1 has DOM and is not preserved");
		assert.ok(oHtml2.getDomRef() && RenderManager.isPreservedContent(oHtml2.getDomRef()),
			"HTML2 has DOM, but has been preserved");
		assert.equal(oHtml2.$().children().length, 4,
			"Modifications to HTML2 still should be present");

		// act 4: switch again
		oContainer.setTheLuckyOne(1);
		await nextUIUpdate();

		// assert 3: HTML1 not rendered but preserved, HTML2 rendered incl. dynamic modifications
		assert.ok(oHtml1.getDomRef() && RenderManager.isPreservedContent(oHtml1.getDomRef()),
			"HTML1 has DOM and is preserved");
		assert.ok(oHtml2.getDomRef() && !RenderManager.isPreservedContent(oHtml2.getDomRef()),
			"HTML2 has DOM, and is not preserved");
		assert.equal(oHtml2.$().children().length, 4,
			"Modifications to HTML2 still are present");
	});

	QUnit.module("Manual RenderManager with SVG/MathML namespace", {
		before: function() {
			this.oContainer = document.getElementById("qunit-fixture");
		}
	});

	QUnit.test("Manual RenderManager - SVG shapes with automatic namespace", function(assert) {
		const oRm = new RenderManager().getInterface();
		const aDomInterfaceMethods = [...aCommonMethods, ...aDomRendererMethods];

		const oSvgContainer = document.createElementNS("http://www.w3.org/2000/svg", "svg");
		oSvgContainer.setAttribute("viewBox", "0 0 100 100");
		this.oContainer.appendChild(oSvgContainer);

		oRm.renderAndFlush(function(rm) {
			assert.deepEqual(
				getEnumerableKeys(rm).sort(),
				aDomInterfaceMethods.sort(),
				"Interface given to the callback of renderAndFlush should contain exactly the expected methods");
			rm.openStart("circle")
				.attr("cx", "50")
				.attr("cy", "50")
				.attr("r", "40")
			.openEnd()
			.close("circle")
			.openStart("rect")
				.attr("x", "10")
				.attr("y", "10")
				.attr("width", "20")
				.attr("height", "20")
			.openEnd()
			.close("rect");
		}, oSvgContainer);

		// Verify children inherit the SVG namespace
		const oCircle = oSvgContainer.querySelector("circle");
		assert.ok(oCircle, "Circle element exists");
		assert.equal(oCircle.namespaceURI, "http://www.w3.org/2000/svg", "Circle inherits SVG namespace");

		const oRect = oSvgContainer.querySelector("rect");
		assert.ok(oRect, "Rect element exists");
		assert.equal(oRect.namespaceURI, "http://www.w3.org/2000/svg", "Rect inherits SVG namespace");

		oSvgContainer.remove();
		oRm.destroy();
	});

	QUnit.test("Manual RenderManager - MathML with automatic namespace", function(assert) {
		const oRm = new RenderManager().getInterface();

		const oMathContainer = document.createElementNS("http://www.w3.org/1998/Math/MathML", "math");
		this.oContainer.appendChild(oMathContainer);

		oRm.renderAndFlush(function(rm) {
			rm.openStart("mrow")
				.openEnd()
				.openStart("mi")
				.openEnd()
					.text("x")
				.close("mi")
				.openStart("mo")
				.openEnd()
					.text("+")
				.close("mo")
				.openStart("mn")
				.openEnd()
					.text("2")
				.close("mn")
				.close("mrow");
		}, oMathContainer);

		const oMrow = oMathContainer.querySelector("mrow");
		assert.ok(oMrow, "MRow element exists");
		assert.equal(oMrow.namespaceURI, "http://www.w3.org/1998/Math/MathML", "MRow inherits MathML namespace");

		const oMi = oMathContainer.querySelector("mi");
		assert.ok(oMi, "Mi element exists");
		assert.equal(oMi.namespaceURI, "http://www.w3.org/1998/Math/MathML", "Mi inherits MathML namespace");

		oMathContainer.remove();
		oRm.destroy();
	});
});
