
/* global QUnit */
sap.ui.define([
	"sap/ui/core/Control",
	"sap/ui/core/RenderManager",
	"sap/ui/core/HTML",
	"sap/ui/core/IconPool",
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/test/utils/nextUIUpdate",
	"sap/base/Log"
], function(
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


	QUnit.module("Core API");

	QUnit.test("Core.createRenderManager", function(assert) {
		assert.notStrictEqual(new RenderManager().getInterface(), new RenderManager().getInterface(), "Core.createRenderManager should always return a new RenderManager instance");
	});

	var aCommonMethods = ["renderControl", "cleanupControlWithoutRendering"];

	var aStringRendererMethods = ["write", "writeEscaped", "writeAcceleratorKey", "writeControlData", "writeElementData",
		"writeAttribute", "writeAttributeEscaped", "addClass", "writeClasses", "addStyle", "writeStyles",
		"writeAccessibilityState", "writeIcon", "translate", "getConfiguration", "getHTML"];

	var aDomRendererMethods = ["openStart", "openEnd", "close", "voidStart", "voidEnd", "text", "attr", "class", "style",
		"accessibilityState", "icon", "unsafeHtml"];

	aCommonMethods.concat(aStringRendererMethods, aDomRendererMethods);

	QUnit.module("Writer API: Semantic Syntax (DOM) Assertions", {
		beforeEach: function() {
			this.oRM = new RenderManager().getInterface();
			this.oAssertionSpy = this.spy(console, "assert");
		},
		afterEach: function() {
			this.oRM.destroy();
		}
	});

	QUnit.test("RenderManager.openStart - empty tag", function (assert) {
		this.oRM.openStart();
		assert.equal(this.oAssertionSpy.callCount, 1);
	});

	QUnit.test("RenderManager.openStart - invalid tag", function (assert) {
		this.oRM.openStart("1");
		assert.equal(this.oAssertionSpy.callCount, 1);
	});

	QUnit.test("RenderManager.openStart - nested", function (assert) {
		this.oRM.openStart("div").openStart("div");
		assert.equal(this.oAssertionSpy.callCount, 1);
	});

	QUnit.test("RenderManager.openStart - invalid tag upper case", function (assert) {
		this.oRM.openStart("H1");
		assert.equal(this.oAssertionSpy.callCount, 1);
	});

	QUnit.test("RenderManager.openStart - voidStart", function (assert) {
		this.oRM.openStart("div").voidStart("img");
		assert.equal(this.oAssertionSpy.callCount, 1);
	});

	QUnit.test("RenderManager.voidStart - empty tag", function (assert) {
		this.oRM.voidStart();
		assert.equal(this.oAssertionSpy.callCount, 1);
	});

	QUnit.test("RenderManager.voidStart - invalid tag", function (assert) {
		this.oRM.voidStart("?");
		assert.equal(this.oAssertionSpy.callCount, 1);
	});

	QUnit.test("RenderManager.voidStart - nested", function (assert) {
		this.oRM.voidStart("img").voidStart("input");
		assert.equal(this.oAssertionSpy.callCount, 1);
	});

	QUnit.test("RenderManager.voidStart - invalid tag upper case", function (assert) {
		this.oRM.voidStart("INPUT");
		assert.equal(this.oAssertionSpy.callCount, 1);
	});

	QUnit.test("RenderManager.voidStart - openStart", function (assert) {
		this.oRM.voidStart("img").openStart("div");
		assert.equal(this.oAssertionSpy.callCount, 1);
	});

	QUnit.test("RenderManager.openEnd - without openStart", function (assert) {
		this.oRM.openEnd();
		assert.equal(this.oAssertionSpy.callCount, 1);
	});

	QUnit.test("RenderManager.openEnd - voidStart", function (assert) {
		this.oRM.voidStart("div").openEnd();
		assert.equal(this.oAssertionSpy.callCount, 1);
	});

	QUnit.test("RenderManager.openEnd - valid", function (assert) {
		this.oRM.openStart("div").openEnd();
		assert.equal(this.oAssertionSpy.callCount, 0);
	});

	QUnit.test("RenderManager.voidEnd - without voidStart", function (assert) {
		this.oRM.voidEnd();
		assert.equal(this.oAssertionSpy.callCount, 1);
	});

	QUnit.test("RenderManager.voidEnd - openStart", function (assert) {
		this.oRM.openStart("div").voidEnd();
		assert.equal(this.oAssertionSpy.callCount, 1);
	});

	QUnit.test("RenderManager.voidEnd - valid", function (assert) {
		this.oRM.voidStart("br").voidEnd();
		assert.equal(this.oAssertionSpy.callCount, 0);
	});

	QUnit.test("RenderManager.close - no tag name", function (assert) {
		this.oRM.openStart("div").openEnd().close();
		assert.equal(this.oAssertionSpy.callCount, 1);
	});

	QUnit.test("RenderManager.close - open tag", function (assert) {
		this.oRM.openStart("div").close("div");
		assert.equal(this.oAssertionSpy.callCount, 1);
	});

	QUnit.test("RenderManager.close - open void tag", function (assert) {
		this.oRM.voidStart("img").close("img");
		assert.equal(this.oAssertionSpy.callCount, 1);
	});

	QUnit.test("RenderManager.unsafeHTML", function (assert) {
		this.oRM.voidStart("img").unsafeHtml(" tabindex='0'");
		assert.equal(this.oAssertionSpy.callCount, 1);
	});

	QUnit.test("RenderManager.text", function (assert) {
		this.oRM.openStart("div").text("text");
		assert.equal(this.oAssertionSpy.callCount, 1);
	});

	QUnit.test("RenderManager.class('a b')", function (assert) {
		this.oRM.openStart("div").class("class1 class2");
		assert.equal(this.oAssertionSpy.callCount, 1, "writing multiple classes should fail assertion");
	});

	QUnit.test("RenderManager.class('a', 'b')", function (assert) {
		this.oRM.openStart("div").class("class1", "class2");
		assert.equal(this.oAssertionSpy.callCount, 1, "writing multiple classes with one call should fail assertion");
	});

	QUnit.test("RenderManager.attr('class', ...)", function (assert) {
		this.oRM.openStart("div").attr("class");
		assert.equal(this.oAssertionSpy.callCount, 0, "writing class attribute alone should be fine");
	});

	QUnit.test("RenderManager.class(...).attr('class', ...)", function (assert) {
		this.oRM.openStart("div").class("class1").attr("class", "class2");
		assert.equal(this.oAssertionSpy.callCount, 1, "writing class attribute after calling class() should fail assertion");
	});

	QUnit.test("RenderManager.attr('class', ...).class(...)", function (assert) {
		this.oRM.openStart("div").attr("class", "class2").class("class1");
		assert.equal(this.oAssertionSpy.callCount, 1, "calling class() after writing class attribute should fail assertion");
	});

	QUnit.test("RenderManager.class(...).openEnd().openStart().attr('class',...)", function (assert) {
		this.oRM.openStart("div").class("class1").openEnd().openStart("div").attr("class", "class2");
		assert.equal(this.oAssertionSpy.callCount, 0, "writing class attribute in new tag should pass assertion");
	});

	QUnit.test("RenderManager.attr('class',...).openEnd().openStart().class(...)", function (assert) {
		this.oRM.openStart("div").attr("class", "class1").openEnd().openStart("div").class("class2");
		assert.equal(this.oAssertionSpy.callCount, 0, "adding a class in new tag should pass assertion");
	});

	QUnit.test("RenderManager.class(...).openEnd().voidStart().attr('class',...)", function (assert) {
		this.oRM.openStart("div").class("class1").openEnd().voidStart("div").attr("class", "class2");
		assert.equal(this.oAssertionSpy.callCount, 0, "writing class attribute in new void tag should pass assertion");
	});

	QUnit.test("RenderManager.attr('class',...).openEnd().voidStart().class(...)", function (assert) {
		this.oRM.openStart("div").attr("class", "class1").openEnd().voidStart("div").class("class2");
		assert.equal(this.oAssertionSpy.callCount, 0, "adding a class in new void tag should pass assertion");
	});

	QUnit.test("RenderManager.style (no style prop name)", function (assert) {
		this.oRM.openStart("div").style("", "100px");
		assert.equal(this.oAssertionSpy.callCount, 1);
	});

	QUnit.test("RenderManager.attr('style')", function (assert) {
		this.oRM.openStart("div").attr("style", "width: 100%");
		assert.equal(this.oAssertionSpy.callCount, 0, "writing style attribute alone should be fine");
	});

	QUnit.test("RenderManager.style(...).attr('style',...)", function (assert) {
		this.oRM.openStart("div").style("width", "100%").attr("style", "height: 100%");
		assert.equal(this.oAssertionSpy.callCount, 1, "writing style attribute after style prop should fail assertion");
	});

	QUnit.test("RenderManager.attr('style',...).style(...)", function (assert) {
		this.oRM.openStart("div").attr("style", "height: 100%").style("width", "100%");
		assert.equal(this.oAssertionSpy.callCount, 1, "setting style property after style attribute should fail assertion");
	});

	QUnit.test("RenderManager.style(...).openEnd().openStart().attr('style',...)", function (assert) {
		this.oRM.openStart("div").style("width", "100%").openEnd().openStart("div").attr("style", "height: 100%");
		assert.equal(this.oAssertionSpy.callCount, 0, "writing style attribute in new tag should pass assertion");
	});

	QUnit.test("RenderManager.attr('style',...).openEnd().openStart().style(...)", function (assert) {
		this.oRM.openStart("div").attr("style", "height: 100%").openEnd().openStart("div").style("width", "100%");
		assert.equal(this.oAssertionSpy.callCount, 0, "setting style property in new tag should pass assertion");
	});

	QUnit.test("RenderManager.style(...).openEnd().voidStart().attr('style',...)", function (assert) {
		this.oRM.openStart("div").style("width", "100%").openEnd().voidStart("input").attr("style", "height: 100%");
		assert.equal(this.oAssertionSpy.callCount, 0, "writing style attribute in new void tag should pass assertion");
	});

	QUnit.test("RenderManager.attr('style',...).openEnd().voidStart().style(...)", function (assert) {
		this.oRM.openStart("div").attr("style", "height: 100%").openEnd().voidStart("input").style("width", "100%");
		assert.equal(this.oAssertionSpy.callCount, 0, "setting style property in new void tag should pass assertion");
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

		assert.equal(this.oAssertionSpy.callCount, 0);
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
			sFontFamily = "fontfamily which has space inside";

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

	QUnit.module("Edge cases");

	QUnit.test("RenderManager should not break for controls with invalid renderer", async function(assert) {

		var Log = sap.ui.require("sap/base/Log");
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
});
