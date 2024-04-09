/*global QUnit */
sap.ui.define([
	"sap/ui/core/ComponentContainer",
	"sap/ui/core/Control",
	"sap/ui/core/Element",
	"sap/ui/core/HTML",
	"sap/ui/core/RenderManager",
	"sap/ui/core/UIAreaRegistry",
	"sap/ui/core/UIComponent",
	"sap/ui/layout/VerticalLayout",
	"sap/ui/testlib/TestButton",
	"sap/ui/thirdparty/jquery",
	"sap/ui/qunit/utils/nextUIUpdate"
], function(ComponentContainer, Control, Element, HTML, RenderManager, UIAreaRegistry, UIComponent, VerticalLayout, TestButton, jQuery, nextUIUpdate) {
	"use strict";

	var normalize = (function() {

		var RX_HEX_COLOR = /#[0-9a-fA-F]+/;
		var CSS_COLORS = {
			maroon : 'rgb(128,0,0)',
			red : 'rgb(255,0,0)',
			orange : 'rgb(255,165,0)',
			yellow : 'rgb(255,255,0)',
			olive : 'rgb(128,128,0)',
			purple : 'rgb(128,0,128)',
			fuchsia : 'rgb(255,0,255)',
			white : 'rgb(255,255,255)',
			lime : 'rgb(0,255,0)',
			green : 'rgb(0,128,0)',
			navy : 'rgb(0,0,128)',
			blue : 'rgb(0,0,255)',
			aqua : 'rgb(0,255,255)',
			teal : 'rgb(0,128,128)',
			black : 'rgb(0,0,0)',
			silver : 'rgb(192,192,192)',
			gray : 'rgb(128,128,128)',
			transparent : 'rgba(0,0,0,0)'
		};

		return function(sColor) {

			if (CSS_COLORS[sColor]) {
				return CSS_COLORS[sColor];
			}

			if (sColor.match(RX_HEX_COLOR)) {
				return "rgb(" + parseInt(sColor.substring(1, 3), 16)
						+ "," + parseInt(sColor.substring(3, 5), 16)
						+ "," + parseInt(sColor.substring(5, 7), 16)
						+ ")";
			}

			return sColor.replace(/ /g, "");
		};

	}());

	var DOM_FIXTURE = {
		"uiAreaA": "",
		"uiAreaB":
			'<div id="html4" class="fragment3" style="width:42px;height:42px;background-color:rgb(255,0,0)"></div>',
		"uiAreaC":
			'<div id="html5" class="fragment4" style="width:77px;height:77px;background-color:rgb(255,255,0)">',
		"uiAreaD":
			'<div data-sap-ui-preserve="html7" style="width:256px;height:64px;background-color:rgb(0,0,255)"></div>' +
			'<div data-sap-ui-preserve="html7" style="width:256px;height:64px;background-color:rgb(255,255,255)"></div>' +
			'<div data-sap-ui-preserve="html7" style="width:256px;height:64px;background-color:rgb(255,0,0)"></div>',
		"uiAreaE": "",
		"uiAreaF": ""
	};
	Object.keys(DOM_FIXTURE).forEach(function(sId) {
		var uiArea = document.createElement("div");
		uiArea.id = sId;
		uiArea.innerHTML = DOM_FIXTURE[sId];
		document.body.appendChild(uiArea);
	});

	var FRAGMENT_1 = {
		content : "<div class='fragment1' style='width:64px;height:64px;background-color:rgb(255,0,0);'></div>",
		selector : "div.fragment1",
		check : function(assert, $content) {
			assert.equal($content.length, 1, "content must have length 1");
			assert.equal($content.css("width"), "64px", "fragment width");
			assert.equal($content.css("height"), "64px", "fragment height");
			assert.equal(normalize($content.css("background-color")), "rgb(255,0,0)", "fragment bg color");
			return $content.length === 1
					&& $content.css("width") === "64px"
					&& $content.css("height") === "64px"
					&& normalize($content.css("background-color")) === "rgb(255,0,0)";
		}
	};

	var FRAGMENT_2 = {
		content : "<div class='fragment2' style='width:64px;height:64px;background-color:rgb(0,0,255);'></div>",
		selector : "div.fragment2",
		check : function(assert, $content) {
			assert.equal($content.length, 1, "content must have length 1");
			assert.equal($content.css("width"), "64px", "fragment width");
			assert.equal($content.css("height"), "64px", "fragment height");
			assert.equal(normalize($content.css("background-color")), "rgb(0,0,255)", "fragment bg color");
			return $content.length === 1
					&& $content.css("width") === "64px"
					&& $content.css("height") === "64px"
					&& normalize($content.css("background-color")) === "rgb(0,0,255)";
		}
	};

	var FRAGMENT_3 = {
		selector : "div.fragment3",
		check : function(assert, $content) {
			return $content.length === 1
					&& $content.css("width") === "42px"
					&& $content.css("height") === "42px"
					&& normalize($content.css("background-color")) === "rgb(255,0,0)";
		}
	};

	var FRAGMENT_4 = {
		selector : "div.fragment4",
		check : function(assert, $content) {
			return $content.length === 1
					&& $content.css("width") === "77px"
					&& $content.css("height") === "77px"
					&& normalize($content.css("background-color")) === "rgb(255,255,0)";
		}
	};

	function okFragment(assert, oFragment, sUIArea, sComment) {
		var $content = jQuery(oFragment.selector, document.getElementById(sUIArea));
		assert.ok($content.length > 0, "expected HTML fragment exists");
		assert.ok(oFragment.check(assert, $content), sComment);
	}

	var TestContainer = Control.extend("my.TestContainer", {
		metadata: {
			aggregations: {
				content : {type : "sap.ui.core.Control", multiple : true, singularName : "content"}
			}
		},
		renderer: {
			apiVersion: 2,
			render: function(oRm, oControl) {
				oRm.openStart("div", oControl).openEnd();
				oRm.openStart("div", oControl.getId() + "-content").openEnd();
				oControl.getContent().forEach(oRm.renderControl, oRm);
				oRm.close("div");
				oRm.close("div");
			}
		}
	});

	// =================================================================
	// TESTS
	// =================================================================

	QUnit.module("content property, preferDOM=false");

	QUnit.test("single root, root control", async function(assert) {
		new HTML("html1", {
			content : FRAGMENT_1.content,
			preferDOM : false
		}).placeAt("uiAreaA");

		await nextUIUpdate();

		okFragment(assert, FRAGMENT_1, "uiAreaA", "UIArea contains expected HTML fragment");
	});

	QUnit.test("single root, nested control", async function(assert) {
		new VerticalLayout({
			content: [
				new HTML("html2", {
					content : FRAGMENT_2.content,
					preferDOM : false
				})
			]
		}).placeAt("uiAreaA");

		await nextUIUpdate();

		okFragment(assert, FRAGMENT_2, "uiAreaA", "UIArea contains expected HTML fragment");
	});

	QUnit.test("invalidate UIArea", async function(assert) {
		var oldDomRef = Element.getElementById("html2").getDomRef();
		Element.getElementById("html2").getUIArea().invalidate();

		await nextUIUpdate();

		okFragment(assert, FRAGMENT_2, "uiAreaA", "UIArea contains expected HTML fragment");
		assert.notEqual(Element.getElementById("html2").getDomRef(), oldDomRef, "node has changed");
	});

	QUnit.test("invalidate parent control", async function(assert) {
		var oldDomRef = Element.getElementById("html2").getDomRef();
		Element.getElementById("html2").getParent().invalidate();

		await nextUIUpdate();

		okFragment(assert, FRAGMENT_2, "uiAreaA", "UIArea contains expected HTML fragment");
		assert.notEqual(Element.getElementById("html2").getDomRef(), oldDomRef, "node has changed");
	});

	QUnit.test("invalidate HTML control", async function(assert) {
		Element.getElementById("html2").invalidate();

		await nextUIUpdate();

		okFragment(assert, FRAGMENT_2, "uiAreaA", "UIArea contains expected HTML fragment");
	});

	QUnit.test("setting content", async function(assert) {
		Element.getElementById("html2").setContent("");
		await nextUIUpdate();

		assert.equal(jQuery("#html2").length, 0, "html2 DOM must be empty");

		Element.getElementById("html2").setContent(FRAGMENT_1.content);
		await nextUIUpdate();

		assert.equal(jQuery("#html2").length, 1, "content must have length 1");
		assert.equal(jQuery("#html2").css("width"), "64px", "fragment width");
		assert.equal(jQuery("#html2").css("height"), "64px", "fragment height");
		assert.equal(normalize(jQuery("#html2").css("background-color")), "rgb(255,0,0)", "fragment bg color");

		Element.getElementById("html2").setContent("someLeadingText" + FRAGMENT_2.content + "someTrailingText");
		await nextUIUpdate();

		okFragment(assert, FRAGMENT_2, "uiAreaA", "html2 DOM must be equal to FRAGMENT_2");
		assert.ok(jQuery("#uiAreaA")[0].innerHTML.indexOf("someLeadingText") < 0, "rendered HTML does not contain leading text");
		assert.ok(jQuery("#uiAreaA")[0].innerHTML.indexOf("someTrailingText") < 0, "rendered HTML does not contain trailing text");

		Element.getElementById("html2").setContent(FRAGMENT_1.content);
		await nextUIUpdate();

		assert.equal(jQuery("#html2").length, 1, "content must have length 1");
		assert.equal(jQuery("#html2").css("width"), "64px", "fragment width");
		assert.equal(jQuery("#html2").css("height"), "64px", "fragment height");
		assert.equal(normalize(jQuery("#html2").css("background-color")), "rgb(255,0,0)", "fragment bg color");

		Element.getElementById("html2").setContent("somePureText");
		await nextUIUpdate();

		assert.equal(jQuery("#html2").length, 0, "html2 DOM must be empty");

		Element.getElementById("html2").setContent(FRAGMENT_2.content);
		await nextUIUpdate();

		okFragment(assert, FRAGMENT_2, "uiAreaA", "html2 DOM must be equal to FRAGMENT_2");
	});


	QUnit.test("destroy", function(assert) {
		assert.equal(jQuery("#html1").length, 1, "html1 DOM should exist");
		assert.equal(jQuery("#html2").length, 1, "html2 DOM should exist");
		Element.getElementById("html1").destroy();
		Element.getElementById("html2").destroy();
		assert.equal(jQuery("#html1").length, 0, "html2 DOM should have been deleted");
		assert.equal(jQuery("#html2").length, 0, "html2 DOM should have been deleted");
	});



	QUnit.module("sap.ui.core.HTML, preferDOM=true");

	QUnit.test("content property + preferDOM, initial rendering", async function(assert) {
		//Cleanup UIArea because placeAt only adds new control to UIArea
		UIAreaRegistry.get("uiAreaA").removeAllContent();
		new VerticalLayout({
			content: [
				new HTML("html3", {
					content : FRAGMENT_1.content
				})
			]
		}).placeAt("uiAreaA");
		await nextUIUpdate();

		okFragment(assert, FRAGMENT_1, "uiAreaA", "UIArea contains expected HTML fragment");
	});

	QUnit.test("content property + preferDOM, rerendering", async function(assert) {
		var oldDomRef = Element.getElementById("html3").getDomRef();

		Element.getElementById("html3").invalidate();
		await nextUIUpdate();

		okFragment(assert, FRAGMENT_1, "uiAreaA", "UIArea contains expected HTML fragment");
		assert.equal(Element.getElementById("html3").getDomRef(), oldDomRef, "node after rendering is the same as before");
	});

	QUnit.test("setting content", async function(assert) {
		Element.getElementById("html3").setContent("");
		await nextUIUpdate();

		assert.equal(jQuery("#html3").length, 0, "html3 DOM must be empty");

		Element.getElementById("html3").setContent(FRAGMENT_1.content);
		await nextUIUpdate();

		assert.equal(jQuery("#html3").length, 1, "content must have length 1");
		assert.equal(jQuery("#html3").css("width"), "64px", "fragment width");
		assert.equal(jQuery("#html3").css("height"), "64px", "fragment height");
		assert.equal(normalize(jQuery("#html3").css("background-color")), "rgb(255,0,0)", "fragment bg color");

		Element.getElementById("html3").setContent("someLeadingText" + FRAGMENT_2.content + "someTrailingText");
		await nextUIUpdate();

		okFragment(assert, FRAGMENT_2, "uiAreaA", "html3 DOM must be equal to FRAGMENT_2");
		assert.ok(jQuery("#uiAreaA")[0].innerHTML.indexOf("someLeadingText") < 0, "rendered HTML does not contain leading text");
		assert.ok(jQuery("#uiAreaA")[0].innerHTML.indexOf("someTrailingText") < 0, "rendered HTML does not contain trailing text");

		Element.getElementById("html3").setContent(FRAGMENT_1.content);
		await nextUIUpdate();

		assert.equal(jQuery("#html3").length, 1, "content must have length 1");
		assert.equal(jQuery("#html3").css("width"), "64px", "fragment width");
		assert.equal(jQuery("#html3").css("height"), "64px", "fragment height");
		assert.equal(normalize(jQuery("#html3").css("background-color")), "rgb(255,0,0)", "fragment bg color");

		Element.getElementById("html3").setContent("somePureText");
		await nextUIUpdate();

		assert.equal(jQuery("#html3").length, 0, "html3 DOM must be empty");

		Element.getElementById("html3").setContent(FRAGMENT_2.content);
		await nextUIUpdate();

		okFragment(assert, FRAGMENT_2, "uiAreaA", "html3 DOM must be equal to FRAGMENT_2");
	});

	QUnit.test("remove & rerender", async function(assert) {
		var oHtml3 = Element.getElementById("html3");
		var oHtml3Dom = oHtml3.getDomRef();
		var oParent = oHtml3.getParent();
		oParent.removeContent(0);
		await nextUIUpdate();

		assert.ok(RenderManager.isPreservedContent(jQuery("#html3")[0]), "html3 DOM must have been moved to preserve area");

		oParent.insertContent(oHtml3);
		await nextUIUpdate();

		assert.ok(oHtml3Dom === oHtml3.getDomRef(), "html3 has the same DOM before rendering");
	});

	QUnit.test("component & move & rerender", async function(assert) {
		var oGrandChild = new HTML({
			content: "<br>"
		});
		var oChild1 = new TestContainer({
			content: oGrandChild
		});
		var oChild2 = new TestContainer();
		var oParent = new TestContainer({
			content : [oChild1, oChild2]
		});

		var TestComponent = UIComponent.extend("my.UIComponent", {
			metadata: {
				manifest: {
					"sap.app": {
						"id": "",
						"type": "application"
					}
				}
			},
			createContent: function() {
				return oParent;
			}
		});
		var oUIComponent = new TestComponent();
		var oUiComponentContainer = new ComponentContainer({
			component: oUIComponent,
			async: false
		});
		oUiComponentContainer.placeAt("uiAreaF");
		await nextUIUpdate();

		var oGrandChildDom = oGrandChild.getDomRef();
		oUiComponentContainer.invalidate();
		await nextUIUpdate();
		assert.ok(oGrandChildDom === oGrandChild.getDomRef(), "oGrandChild DOM reference has not changed after ComponentContainer rerender");

		oChild2.addContent(oChild1.removeContent(0));
		await nextUIUpdate();
		assert.ok(oGrandChildDom === oGrandChild.getDomRef(), "oGrandChild DOM reference has not changed after moving from child1 to child2");

		oChild1.addContent(oChild2.removeContent(0));
		await nextUIUpdate();
		assert.ok(oGrandChildDom === oGrandChild.getDomRef(), "oGrandChild DOM reference has not changed after moving from child2 to child1");

		oParent.setVisible(false);
		await nextUIUpdate();
		oParent.setVisible(true);
		await nextUIUpdate();
		assert.ok(oGrandChildDom === oGrandChild.getDomRef(), "oGrandChild DOM reference has not changed after parent visibility is changed");

		oParent.destroy();
	});

	QUnit.test("survive removal", async function(assert) {
		// check preconditions
		assert.ok(Element.getElementById("html3").getUIArea(), "html3 must be part of UIArea");
		assert.equal(jQuery("#html3").length, 1, "html3 DOM should exist");
		var oldDomRef = jQuery("#html3")[0];

		// remove from control tree and rerender
		UIAreaRegistry.get("uiAreaA").removeAllContent();
		await nextUIUpdate();

		// check that DOM still exists
		assert.ok(!Element.getElementById("html3").getUIArea(), "html3 must no longer be part of UIArea");
		assert.equal(jQuery("#html3").length, 1, "html3 DOM must still exist");
		assert.equal(jQuery("#html3")[0], oldDomRef, "html3 DOM must be the same as before the removal");
		assert.ok(RenderManager.isPreservedContent(jQuery("#html3")[0]), "html3 DOM must have been moved to preserve area");
		assert.equal(jQuery("#sap-ui-dummy-html3").length, 0, "no dummy must exist");

		// add it again to an UIArea and rerender
		Element.getElementById("html3").placeAt("uiAreaB");
		await nextUIUpdate();

		assert.ok(Element.getElementById("html3").getUIArea(), "html3 must be part of UIArea");
		assert.equal(Element.getElementById("html3").getUIArea().getId(), "uiAreaB", "html3 must be part of UIArea uiAreaB");
		assert.equal(jQuery("#html3").length, 1, "html3 DOM must exist");
		assert.equal(jQuery("#html3")[0], oldDomRef, "html3 DOM still must be the same as before the removal");
		assert.ok(!RenderManager.isPreservedContent(jQuery("#html3")[0]), "html3 DOM must no longer be part of preserve area");
		assert.equal(jQuery("#sap-ui-dummy-html3").length, 0, "no dummy must exist");

	});

	QUnit.test("destroy", function(assert) {
		assert.equal(jQuery("#html3").length, 1, "html3 DOM should exist");
		Element.getElementById("html3").destroy();
		assert.equal(jQuery("#html3").length, 0, "html3 DOM should have been deleted");
		assert.equal(jQuery("#sap-ui-dummy-html3").length, 0, "no dummy must exist");
	});



	QUnit.module("sap.ui.core.HTML, predefinedContent");

	QUnit.test("predefined content, single root, root control", async function(assert) {
		var oPredefinedContent = jQuery("#html4")[0];
		new HTML("html4").placeAt("uiAreaB");

		await nextUIUpdate();

		okFragment(assert, FRAGMENT_3, "uiAreaB", "UIArea contains expected HTML fragment");
		assert.equal(oPredefinedContent, jQuery("#html4")[0], "predefined content has been preserved");
	});

	QUnit.test("predefined content, invalidate UIArea", async function(assert) {
		Element.getElementById("html4").getUIArea().invalidate();

		await nextUIUpdate();

		okFragment(assert, FRAGMENT_3, "uiAreaB", "UIArea contains expected HTML fragment");
	});

	QUnit.test("predefined content, invalidate HTMLControl", async function(assert) {
		Element.getElementById("html4").invalidate();

		await nextUIUpdate();

		okFragment(assert, FRAGMENT_3, "uiAreaB", "UIArea contains expected HTML fragment");
	});

	/**
	 * @deprecated As of 1.70
	 */
	QUnit.test("predefined content, rerender HTMLControl", async function(assert) {
		Element.getElementById("html4").invalidate();
		await nextUIUpdate();
		// rerender is not async -> check immediately
		okFragment(assert, FRAGMENT_3, "uiAreaB", "UIArea contains expected HTML fragment");
	});

	QUnit.test("predefined content, single root, nested controls", async function(assert) {
		new VerticalLayout({
			content: [ new HTML("html5") ]
		}).placeAt("uiAreaC");

		await nextUIUpdate();

		okFragment(assert, FRAGMENT_4, "uiAreaC", "UIArea contains expected HTML fragment");
	});

	// multiple roots test
	QUnit.test("content property, multiple roots", async function(assert) {
		// Cleanup UIArea because placeAt only adds new control to UIArea
		UIAreaRegistry.get("uiAreaA").removeAllContent();
		new HTML("html6", {
			content : "<div style='width:200px;height:64px;background-color:rgb(0, 0, 0);'></div><div style='width:200px;height:64px;background-color:rgb(255, 0, 0);'></div><div style='width:200px;height:64px;background-color:rgb(255, 255, 0);'></div>"
		}).placeAt("uiAreaA");

		await nextUIUpdate();

		var uiAreaA = jQuery("#uiAreaA")[0];
		assert.equal(jQuery("div", uiAreaA).length, 3, "3 divs have been rendered in the UIArea");
		assert.ok(jQuery("div", uiAreaA).css("width") == "200px", "div has been rendered");
		assert.ok(jQuery("div", uiAreaA).css("height") == "64px", "div has been rendered");
		assert.ok(normalize(jQuery("div", uiAreaA).css("background-color")) == "rgb(0,0,0)", "div has been rendered");
	});

	QUnit.test("predefined content, multiple roots, nested controls, initial rendering", async function(assert) {

		var layout = new VerticalLayout("layout7");
		var html = new HTML("html7");
		layout.addContent(html);
		layout.placeAt("uiAreaD");

		await nextUIUpdate();

		var $LayoutChildren = jQuery("#uiAreaD .sapUiVltCell > div");
		assert.strictEqual($LayoutChildren.length, 3, "div has been rendered");
		assert.strictEqual($LayoutChildren.css("width"), "256px", "div has been rendered");
		assert.strictEqual($LayoutChildren.css("height"), "64px", "div has been rendered");
		assert.strictEqual(normalize($LayoutChildren.css("background-color")), "rgb(0,0,255)", "div has been rendered");
	});

	QUnit.test("predefined content, multiple roots, nested controls, rerendering", async function(assert) {
		var layout = Element.getElementById("layout7");
		var oldLayoutDomRef = layout.getDomRef();
		assert.ok(oldLayoutDomRef != undefined, "layout has a domref");

		// note: this results in a HTML.rerender(), not UIArea.rerender()!
		layout.invalidate();
		await nextUIUpdate();

		var $LayoutChildren = jQuery("#uiAreaD .sapUiVltCell > div");
		//assert.ok(oldLayoutDomRef != layout.getDomRef(), "layout has been rerendered");
		assert.ok($LayoutChildren.length == 3, "div has been rendered");
		assert.ok($LayoutChildren.css("width") == "256px", "div has been rendered");
		assert.ok($LayoutChildren.css("height") == "64px", "div has been rendered");
		assert.ok(normalize($LayoutChildren.css("background-color")) == "rgb(0,0,255)", "div has been rendered");
	});

	QUnit.test("order of controls in UIArea", async function(assert) {
		var html = new HTML({content: FRAGMENT_1.content});
		html.placeAt("uiAreaE");
		var button = new TestButton({text: "Button"});
		button.placeAt("uiAreaE");
		await nextUIUpdate();

		var $currentDom = jQuery("#uiAreaE").children();
		assert.equal($currentDom.length, 2, "both controls have been rendered");
		assert.equal($currentDom[0].tagName, "DIV");
		assert.equal($currentDom[1].tagName, "BUTTON");

		html.invalidate();
		await nextUIUpdate();

		$currentDom = jQuery("#uiAreaE").children();
		assert.equal($currentDom.length, 2, "both controls have been rendered");
		assert.equal($currentDom[0].tagName, "DIV");
		assert.equal($currentDom[1].tagName, "BUTTON");
	});

	QUnit.test("sanitization", function(assert) {
		var offensiveContent = "<div><script>alert('hello')<\/script></div>",
			sanitizedContent = "<div></div>",
			html;

		html = new HTML({});
		html.setSanitizeContent(true);
		html.setContent(offensiveContent);
		assert.equal(html.getContent(), sanitizedContent, "HTML sanitized using setters");

		html = new HTML({});
		html.setContent(offensiveContent);
		html.setSanitizeContent(true);
		assert.equal(html.getContent(), sanitizedContent, "HTML sanitized using setters, wrong order");

		html = new HTML({
			sanitizeContent: true,
			content: offensiveContent
		});
		assert.equal(html.getContent(), sanitizedContent, "HTML sanitized using constructor");

		html = new HTML({
			content: offensiveContent,
			sanitizeContent: true
		});
		assert.equal(html.getContent(), sanitizedContent, "HTML sanitized using constructor, wrong order");
	});

	QUnit.module("Fixes in caja-html-sanitizer");

	QUnit.test("Tags wrapped in iframe tag", function(assert) {
		const sOffensiveContent = `<select><iframe><select><img src=x onerror=alert(1)></select></iframe></select>`;
		const oHTML = new HTML({
			sanitizeContent: true,
			content: sOffensiveContent
		});

		assert.notOk(oHTML.getContent().includes("onerror"), "The error handler should be removed");
		oHTML.destroy();
	});

});
