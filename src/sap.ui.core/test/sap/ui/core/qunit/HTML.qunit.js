/*global QUnit */
sap.ui.define([
	"sap/ui/core/HTML",
	"sap/ui/core/Core",
	"sap/ui/core/Control",
	"sap/ui/core/RenderManager",
	"sap/ui/commons/layout/MatrixLayout",
	"sap/ui/testlib/TestButton",
	"sap/ui/thirdparty/jquery"
], function(HTML, oCore, Control, RenderManager, MatrixLayout, TestButton, jQuery) {
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
		check : function(assert, $) {
			assert.equal($.length, 1, "content must have length 1");
			assert.equal($.css("width"), "64px", "fragment width");
			assert.equal($.css("height"), "64px", "fragment height");
			assert.equal(normalize($.css("background-color")), "rgb(255,0,0)", "fragment bg color");
			return $.length === 1
					&& $.css("width") === "64px"
					&& $.css("height") === "64px"
					&& normalize($.css("background-color")) === "rgb(255,0,0)";
		}
	};

	var FRAGMENT_2 = {
		content : "<div class='fragment2' style='width:64px;height:64px;background-color:rgb(0,0,255);'></div>",
		selector : "div.fragment2",
		check : function(assert, $) {
			assert.equal($.length, 1, "content must have length 1");
			assert.equal($.css("width"), "64px", "fragment width");
			assert.equal($.css("height"), "64px", "fragment height");
			assert.equal(normalize($.css("background-color")), "rgb(0,0,255)", "fragment bg color");
			return $.length === 1
					&& $.css("width") === "64px"
					&& $.css("height") === "64px"
					&& normalize($.css("background-color")) === "rgb(0,0,255)";
		}
	};

	var FRAGMENT_3 = {
		selector : "div.fragment3",
		check : function(assert, $) {
			return $.length === 1
					&& $.css("width") === "42px"
					&& $.css("height") === "42px"
					&& normalize($.css("background-color")) === "rgb(255,0,0)";
		}
	};

	var FRAGMENT_4 = {
		selector : "div.fragment4",
		check : function(assert, $) {
			return $.length === 1
					&& $.css("width") === "77px"
					&& $.css("height") === "77px"
					&& normalize($.css("background-color")) === "rgb(255,255,0)";
		}
	};

	function okFragment(assert, oFragment, sUIArea, sComment) {
		var $ = jQuery(oFragment.selector, jQuery("#" + sUIArea)[0]);
		assert.ok($.length > 0, "expected fragment exists");
		assert.ok(oFragment.check(assert, $), sComment);
	}

	function afterRerendering(fnTest) {
		return new Promise(function(resolve) {
			setTimeout(function() {
				fnTest();
				resolve();
			}, 200);
		});
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

	QUnit.test("single root, root control", function(assert) {
		new HTML("html1", {
			content : FRAGMENT_1.content,
			preferDOM : false
		}).placeAt("uiAreaA");

		return afterRerendering(function() {
			okFragment(assert, FRAGMENT_1, "uiAreaA", "UIArea contains expected HTML fragment");
		});
	});

	QUnit.test("single root, nested control", function(assert) {
		new MatrixLayout().createRow(
				new HTML("html2", {
					content : FRAGMENT_2.content,
					preferDOM : false
				})).placeAt("uiAreaA");

		return afterRerendering(function() {
			okFragment(assert, FRAGMENT_2, "uiAreaA", "UIArea contains expected HTML fragment");
		});
	});

	QUnit.test("invalidate UIArea", function(assert) {
		var oldDomRef = oCore.byId("html2").getDomRef();
		oCore.byId("html2").getUIArea().invalidate();

		return afterRerendering(function() {
			okFragment(assert, FRAGMENT_2, "uiAreaA", "UIArea contains expected HTML fragment");
			assert.notEqual(oCore.byId("html2").getDomRef(), oldDomRef, "node has changed");
		});
	});

	QUnit.test("invalidate parent control", function(assert) {
		var oldDomRef = oCore.byId("html2").getDomRef();
		oCore.byId("html2").getParent().invalidate();

		return afterRerendering(function() {
			okFragment(assert, FRAGMENT_2, "uiAreaA", "UIArea contains expected HTML fragment");
			assert.notEqual(oCore.byId("html2").getDomRef(), oldDomRef, "node has changed");
		});
	});

	QUnit.test("invalidate HTML control", function(assert) {
		oCore.byId("html2").invalidate();

		return afterRerendering(function() {
			okFragment(assert, FRAGMENT_2, "uiAreaA", "UIArea contains expected HTML fragment");
		});
	});

	QUnit.test("setting content", function(assert) {
		oCore.byId("html2").setContent("");
		oCore.applyChanges();
		assert.equal(jQuery("#html2").length, 0, "html2 DOM must be empty");

		oCore.byId("html2").setContent(FRAGMENT_1.content);
		oCore.applyChanges();

		assert.equal(jQuery("#html2").length, 1, "content must have length 1");
		assert.equal(jQuery("#html2").css("width"), "64px", "fragment width");
		assert.equal(jQuery("#html2").css("height"), "64px", "fragment height");
		assert.equal(normalize(jQuery("#html2").css("background-color")), "rgb(255,0,0)", "fragment bg color");

		oCore.byId("html2").setContent("someLeadingText" + FRAGMENT_2.content + "someTrailingText");
		oCore.applyChanges();
		okFragment(assert, FRAGMENT_2, "uiAreaA", "html2 DOM must be equal to FRAGMENT_2");
		assert.ok(jQuery("#uiAreaA")[0].innerHTML.indexOf("someLeadingText") < 0, "rendered HTML does not contain leading text");
		assert.ok(jQuery("#uiAreaA")[0].innerHTML.indexOf("someTrailingText") < 0, "rendered HTML does not contain trailing text");

		oCore.byId("html2").setContent(FRAGMENT_1.content);
		oCore.applyChanges();
		assert.equal(jQuery("#html2").length, 1, "content must have length 1");
		assert.equal(jQuery("#html2").css("width"), "64px", "fragment width");
		assert.equal(jQuery("#html2").css("height"), "64px", "fragment height");
		assert.equal(normalize(jQuery("#html2").css("background-color")), "rgb(255,0,0)", "fragment bg color");

		oCore.byId("html2").setContent("somePureText");
		oCore.applyChanges();
		assert.equal(jQuery("#html2").length, 0, "html2 DOM must be empty");

		oCore.byId("html2").setContent(FRAGMENT_2.content);
		oCore.applyChanges();
		okFragment(assert, FRAGMENT_2, "uiAreaA", "html2 DOM must be equal to FRAGMENT_2");
	});


	QUnit.test("destroy", function(assert) {
		assert.equal(jQuery("#html1").length, 1, "html1 DOM should exist");
		assert.equal(jQuery("#html2").length, 1, "html2 DOM should exist");
		oCore.byId("html1").destroy();
		oCore.byId("html2").destroy();
		assert.equal(jQuery("#html1").length, 0, "html2 DOM should have been deleted");
		assert.equal(jQuery("#html2").length, 0, "html2 DOM should have been deleted");
	});



	QUnit.module("sap.ui.core.HTML, preferDOM=true");

	QUnit.test("content property + preferDOM, initial rendering", function(assert) {
		//Cleanup UIArea because placeAt only adds new control to UIArea
		oCore.getUIArea("uiAreaA").removeAllContent();
		new MatrixLayout().createRow(
				new HTML("html3", {
					content : FRAGMENT_1.content
				})).placeAt("uiAreaA");

		return afterRerendering(function() {
			okFragment(assert, FRAGMENT_1, "uiAreaA", "UIArea contains expected HTML fragment");
		});
	});

	QUnit.test("content property + preferDOM, rerendering", function(assert) {
		var oldDomRef = oCore.byId("html3").getDomRef();

		oCore.byId("html3").invalidate();

		return afterRerendering(function() {
			okFragment(assert, FRAGMENT_1, "uiAreaA", "UIArea contains expected HTML fragment");
			assert.equal(oCore.byId("html3").getDomRef(), oldDomRef, "node after rendering is the same as before");
		});
	});

	QUnit.test("setting content", function(assert) {
		oCore.byId("html3").setContent("");
		oCore.applyChanges();
		assert.equal(jQuery("#html3").length, 0, "html3 DOM must be empty");

		oCore.byId("html3").setContent(FRAGMENT_1.content);
		oCore.applyChanges();
		assert.equal(jQuery("#html3").length, 1, "content must have length 1");
		assert.equal(jQuery("#html3").css("width"), "64px", "fragment width");
		assert.equal(jQuery("#html3").css("height"), "64px", "fragment height");
		assert.equal(normalize(jQuery("#html3").css("background-color")), "rgb(255,0,0)", "fragment bg color");

		oCore.byId("html3").setContent("someLeadingText" + FRAGMENT_2.content + "someTrailingText");
		oCore.applyChanges();
		okFragment(assert, FRAGMENT_2, "uiAreaA", "html3 DOM must be equal to FRAGMENT_2");
		assert.ok(jQuery("#uiAreaA")[0].innerHTML.indexOf("someLeadingText") < 0, "rendered HTML does not contain leading text");
		assert.ok(jQuery("#uiAreaA")[0].innerHTML.indexOf("someTrailingText") < 0, "rendered HTML does not contain trailing text");

		oCore.byId("html3").setContent(FRAGMENT_1.content);
		oCore.applyChanges();
		assert.equal(jQuery("#html3").length, 1, "content must have length 1");
		assert.equal(jQuery("#html3").css("width"), "64px", "fragment width");
		assert.equal(jQuery("#html3").css("height"), "64px", "fragment height");
		assert.equal(normalize(jQuery("#html3").css("background-color")), "rgb(255,0,0)", "fragment bg color");

		oCore.byId("html3").setContent("somePureText");
		oCore.applyChanges();
		assert.equal(jQuery("#html3").length, 0, "html3 DOM must be empty");

		oCore.byId("html3").setContent(FRAGMENT_2.content);
		oCore.applyChanges();
		okFragment(assert, FRAGMENT_2, "uiAreaA", "html3 DOM must be equal to FRAGMENT_2");
	});

	QUnit.test("remove & rerender", function(assert) {
		var oHtml3 = oCore.byId("html3");
		var oHtml3Dom = oHtml3.getDomRef();
		var oParent = oHtml3.getParent();
		oParent.removeContent(0);
		oCore.applyChanges();

		assert.ok(RenderManager.isPreservedContent(jQuery("#html3")[0]), "html3 DOM must have been moved to preserve area");

		oParent.insertContent(oHtml3);
		oCore.applyChanges();

		assert.ok(oHtml3Dom === oHtml3.getDomRef(), "html3 has the same DOM before rendering");
	});

	QUnit.test("move & rerender", function(assert) {
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
		oParent.placeAt("uiAreaF");
		oCore.applyChanges();

		var oGrandChildDom = oGrandChild.getDomRef();
		oChild2.addContent(oChild1.removeContent(0));
		oParent.rerender();
		assert.ok(oGrandChildDom === oGrandChild.getDomRef(), "oGrandChild DOM reference has not changed after moving from child1 to child2");

		oChild1.addContent(oChild2.removeContent(0));
		oParent.rerender();
		assert.ok(oGrandChildDom === oGrandChild.getDomRef(), "oGrandChild DOM reference has not changed after moving from child2 to child1");

		oParent.setVisible(false);
		oCore.applyChanges();
		oParent.setVisible(true);
		oCore.applyChanges();
		assert.ok(oGrandChildDom === oGrandChild.getDomRef(), "oGrandChild DOM reference has not changed after parent visibility is changed");

		oParent.destroy();
	});

	QUnit.test("survive removal", function(assert) {
		// check preconditions
		assert.ok(oCore.byId("html3").getUIArea(), "html3 must be part of UIArea");
		assert.equal(jQuery("#html3").length, 1, "html3 DOM should exist");
		var oldDomRef = jQuery("#html3")[0];

		// remove from control tree and rerender
		oCore.getUIArea("uiAreaA").removeAllContent();
		oCore.applyChanges();

		// check that DOM still exists
		assert.ok(!oCore.byId("html3").getUIArea(), "html3 must no longer be part of UIArea");
		assert.equal(jQuery("#html3").length, 1, "html3 DOM must still exist");
		assert.equal(jQuery("#html3")[0], oldDomRef, "html3 DOM must be the same as before the removal");
		assert.ok(sap.ui.core.RenderManager.isPreservedContent(jQuery("#html3")[0]), "html3 DOM must have been moved to preserve area");
		assert.equal(jQuery("#sap-ui-dummy-html3").length, 0, "no dummy must exist");

		// add it again to an UIArea and rerender
		oCore.byId("html3").placeAt("uiAreaB");
		oCore.applyChanges();
		assert.ok(oCore.byId("html3").getUIArea(), "html3 must be part of UIArea");
		assert.equal(oCore.byId("html3").getUIArea().getId(), "uiAreaB", "html3 must be part of UIArea uiAreaB");
		assert.equal(jQuery("#html3").length, 1, "html3 DOM must exist");
		assert.equal(jQuery("#html3")[0], oldDomRef, "html3 DOM still must be the same as before the removal");
		assert.ok(!sap.ui.core.RenderManager.isPreservedContent(jQuery("#html3")[0]), "html3 DOM must no longer be part of preserve area");
		assert.equal(jQuery("#sap-ui-dummy-html3").length, 0, "no dummy must exist");

	});

	QUnit.test("destroy", function(assert) {
		assert.equal(jQuery("#html3").length, 1, "html3 DOM should exist");
		oCore.byId("html3").destroy();
		assert.equal(jQuery("#html3").length, 0, "html3 DOM should have been deleted");
		assert.equal(jQuery("#sap-ui-dummy-html3").length, 0, "no dummy must exist");
	});



	QUnit.module("sap.ui.core.HTML, predefinedContent");

	QUnit.test("predefined content, single root, root control", function(assert) {
		var oPredefinedContent = jQuery("#html4")[0];
		new HTML("html4").placeAt("uiAreaB");

		return afterRerendering(function() {
			okFragment(assert, FRAGMENT_3, "uiAreaB", "UIArea contains expected HTML fragment");
			assert.equal(oPredefinedContent, jQuery("#html4")[0], "predefined content has been preserved");
		});
	});

	QUnit.test("predefined content, invalidate UIArea", function(assert) {
		oCore.byId("html4").getUIArea().invalidate();

		return afterRerendering(function() {
			okFragment(assert, FRAGMENT_3, "uiAreaB", "UIArea contains expected HTML fragment");
		});
	});

	QUnit.test("predefined content, invalidate HTMLControl", function(assert) {
		oCore.byId("html4").invalidate();

		return afterRerendering(function() {
			okFragment(assert, FRAGMENT_3, "uiAreaB", "UIArea contains expected HTML fragment");
		});
	});

	QUnit.test("predefined content, rerender HTMLControl", function(assert) {
		oCore.byId("html4").rerender();
		// rerender is not async -> check immediately
		okFragment(assert, FRAGMENT_3, "uiAreaB", "UIArea contains expected HTML fragment");
	});

	QUnit.test("predefined content, single root, nested controls", function(assert) {
		new MatrixLayout().createRow(new HTML("html5")).placeAt("uiAreaC");

		return afterRerendering(function() {
			okFragment(assert, FRAGMENT_4, "uiAreaC",
					"UIArea contains expected HTML fragment");
		});
	});

	// multiple roots test
	QUnit.test("content property, multiple roots", function(assert) {
		// Cleanup UIArea because placeAt only adds new control to UIArea
		oCore.getUIArea("uiAreaA").removeAllContent();
		new HTML("html6", {
			content : "<div style='width:200px;height:64px;background-color:rgb(0, 0, 0);'></div><div style='width:200px;height:64px;background-color:rgb(255, 0, 0);'></div><div style='width:200px;height:64px;background-color:rgb(255, 255, 0);'></div>"
		}).placeAt("uiAreaA");

		return afterRerendering(function() {
			var uiAreaA = jQuery("#uiAreaA")[0];
			assert.equal(jQuery("div", uiAreaA).length, 3, "3 divs have been rendered in the UIArea");
			assert.ok(jQuery("div", uiAreaA).css("width") == "200px", "div has been rendered");
			assert.ok(jQuery("div", uiAreaA).css("height") == "64px", "div has been rendered");
			assert.ok(normalize(jQuery("div", uiAreaA).css("background-color")) == "rgb(0,0,0)", "div has been rendered");
		});
	});

	QUnit.test("predefined content, multiple roots, nested controls, initial rendering", function(assert) {

		var layout = new MatrixLayout("layout7");
		var html = new HTML("html7");
		layout.createRow(html);
		layout.placeAt("uiAreaD");

		return afterRerendering(function() {
			var uiAreaD = jQuery("#uiAreaD")[0];
			assert.ok(jQuery("div", uiAreaD).length == 3, "div has been rendered");
			assert.ok(jQuery("div", uiAreaD).css("width") == "256px", "div has been rendered");
			assert.ok(jQuery("div", uiAreaD).css("height") == "64px", "div has been rendered");
			assert.ok(normalize(jQuery("div", uiAreaD).css("background-color")) == "rgb(0,0,255)", "div has been rendered");
		});
	});

	QUnit.test("predefined content, multiple roots, nested controls, rerendering", function(assert) {
		var layout = oCore.byId("layout7");
		var oldLayoutDomRef = layout.getDomRef();
		assert.ok(oldLayoutDomRef != undefined, "layout has a domref");

		// note: this results in a HTML.rerender(), not UIArea.rerender()!
		layout.invalidate();

		return afterRerendering(function() {
			var uiAreaD = jQuery("#uiAreaD")[0];
			//assert.ok(oldLayoutDomRef != layout.getDomRef(), "layout has been rerendered");
			assert.ok(jQuery("div", uiAreaD).length == 3, "div has been rendered");
			assert.ok(jQuery("div", uiAreaD).css("width") == "256px", "div has been rendered");
			assert.ok(jQuery("div", uiAreaD).css("height") == "64px", "div has been rendered");
			assert.ok(normalize(jQuery("div", uiAreaD).css("background-color")) == "rgb(0,0,255)", "div has been rendered");
		});

	});

	QUnit.test("order of controls in UIArea", function(assert) {
		var html = new HTML({content: FRAGMENT_1.content});
		html.placeAt("uiAreaE");
		var button = new TestButton({text: "Button"});
		button.placeAt("uiAreaE");
		oCore.applyChanges();

		var $currentDom = jQuery("#uiAreaE").children();
		assert.equal($currentDom.length, 2, "both controls have been rendered");
		assert.equal($currentDom[0].tagName, "DIV");
		assert.equal($currentDom[1].tagName, "BUTTON");

		html.invalidate();
		oCore.applyChanges();

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

});
