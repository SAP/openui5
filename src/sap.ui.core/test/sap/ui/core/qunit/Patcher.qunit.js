sap.ui.define([
	"sap/ui/Device",
	"sap/ui/core/Patcher",
	"sap/base/security/encodeXML",
	"sap/base/security/encodeCSS"
], function(Device, Patcher, encodeXML, encodeCSS, createAndAppendDiv) {

	"use strict";
	/*global QUnit,sinon*/

	// IE11 does not include the child nodes when they are removed by setting the textContent=""
	var bLegacyObserver = Device.browser.msie;

	QUnit.module("Patcher", {
		before: function() {
			this.oContainer = document.getElementById("qunit-fixture");
			this.oObserver = new MutationObserver(function() {});

			this.html = function (sHtml) {
				this.oContainer.innerHTML = sHtml;
				return this;
			};

			this.patch = function(fnPatch, fnMutation) {
				this.oObserver.observe(this.oContainer, {
					characterData: true,
					attributes: true,
					childList: true,
					subtree: true
				});

				var oElement = this.oContainer.firstChild;
				Patcher.setRootNode(oElement);
				fnPatch(oElement);
				Patcher.reset();

				var aMutations = this.oObserver.takeRecords();
				this.oObserver.disconnect();

				fnMutation(aMutations, this.oContainer.firstChild);
			};
		}
	});

	QUnit.test("No DOM patching needed - Normal tag", function(assert) {

		this.html("<div></div>").patch(function() {
			Patcher.openStart("div").openEnd().close("div");
		}, function(aMutations) {
			assert.equal(aMutations.length, 0, "Normal tag - empty");
		});

		this.html("<div id='x'></div>").patch(function() {
			Patcher.openStart("div").attr("id", "x").openEnd().close("div");
		}, function(aMutations) {
			assert.equal(aMutations.length, 0, "Normal tag - key");
		});

		this.html("<div tabindex='0'></div>").patch(function() {
			Patcher.openStart("div").attr("tabindex", 0).openEnd().close("div");
		}, function(aMutations) {
			assert.equal(aMutations.length, 0, "Normal tag - attribute");
		});

		this.html("<div tabindex='0' role='application'></div>").patch(function() {
			Patcher.openStart("div").attr("tabindex", 0).attr("role", "application").openEnd().close("div");
		}, function(aMutations) {
			assert.equal(aMutations.length, 0, "Normal tag - attributes");
		});

		this.html("<div title='" + encodeXML("~!@#$%^&*()_+{}:<>?\'\"") + "'></div>").patch(function() {
			Patcher.openStart("div").attr("title", "~!@#$%^&*()_+{}:<>?\'\"").openEnd().close("div");
		}, function(aMutations) {
			assert.equal(aMutations.length, 0, "Normal tag - attribute escaped");
		});

		this.html("<div class='x'></div>").patch(function() {
			Patcher.openStart("div").class("x").openEnd().close("div");
		}, function(aMutations) {
			assert.equal(aMutations.length, 0, "Normal tag - class");
		});

		this.html("<div class='x y z'></div>").patch(function() {
			Patcher.openStart("div").class("x").class("y").class("z").openEnd().close("div");
		}, function(aMutations) {
			assert.equal(aMutations.length, 0, "Normal tag - classes");
		});

		this.html("<div style='width: 10px;'></div>").patch(function() {
			Patcher.openStart("div").style("width", "10px").openEnd().close("div");
		}, function(aMutations) {
			assert.equal(aMutations.length, 0, "Normal tag - style");
		});

		this.html("<div style='width: 10px; background: pink;'></div>").patch(function() {
			Patcher.openStart("div").style("width", "10px").style("background", "pink").openEnd().close("div");
		}, function(aMutations) {
			assert.equal(aMutations.length, 0, "Normal tag - styles");
		});

		this.html("<div>Text</div>").patch(function() {
			Patcher.openStart("div").openEnd().text("Text").close("div");
		}, function(aMutations) {
			assert.equal(aMutations.length, 0, "Normal tag - text node");
		});

		this.html(" <div>Te xt</div>\t\n").patch(function() {
			Patcher.text(" ").openStart("div").openEnd().text("Te xt").close("div").text("\t\n");
		}, function(aMutations) {
			assert.equal(aMutations.length, 0, "Normal tag - whitespace - text node");
		});

		this.html("<div tabindex='0'>Text</div>").patch(function() {
			Patcher.openStart("div").attr("tabindex", 0).openEnd().text("Text").close("div");
		}, function(aMutations) {
			assert.equal(aMutations.length, 0, "Normal tag - attribute - text node");
		});

		this.html("<div id='x' tabindex='0' title='t'></div>").patch(function() {
			Patcher.openStart("div").attr("title", "t").attr("id", "x").attr("tabindex", 0).openEnd().close("div");
		}, function(aMutations, oElement) {
			assert.equal(aMutations.length, 0, "Normal tag - attribute order changes");
		});

		this.html(
			"<div id='d' title='t'>" +
				"<div class='x'></div><div class='x'></div>" +
				"<div style='width: 10px;'><div style='width: 10px;'></div></div>" +
				"0<span>1<img id='s'>2</span>3 4" +
				"<b>b<i>bi<u>biu</u></i></b>" +
				"<h1>" + encodeXML("<h1> & <hr>") + "</h1><hr>" +
			"</div>"
		).patch(function() {
			Patcher.
			openStart("div", "d").attr("title", "t").openEnd().
				openStart("div").class("x").openEnd().close("div").openStart("div").class("x").openEnd().close("div").
				openStart("div").style("width", "10px").openEnd().openStart("div").style("width", "10px").openEnd().close("div").close("div").
				text(0).openStart("span").openEnd().text(1).voidStart("img", "s").voidEnd().text(2).close("span").text("3 4").
				openStart("b").openEnd().text("b").openStart("i").openEnd().text("bi").openStart("u").openEnd().text("biu").close("u").close("i").close("b").
				openStart("h1").openEnd().text("<h1> & <hr>").close("h1").voidStart("hr").voidEnd().
			close("div");
		}, function(aMutations) {
			assert.equal(aMutations.length, 0, "Normal tag - nested");
		});

	});

	QUnit.test("No DOM patching needed - Void tag", function(assert) {

		this.html("<img>").patch(function() {
			Patcher.voidStart("img").voidEnd();
		}, function(aMutations) {
			assert.equal(aMutations.length, 0, "Void tag - empty");
		});

		this.html("<img id='x'>").patch(function() {
			Patcher.voidStart("img").attr("id", "x").voidEnd();
		}, function(aMutations) {
			assert.equal(aMutations.length, 0, "Void tag - key");
		});

		this.html("<img tabindex='0'>").patch(function() {
			Patcher.voidStart("img").attr("tabindex", 0).voidEnd();
		}, function(aMutations) {
			assert.equal(aMutations.length, 0, "Void tag - attribute");
		});

		this.html("<img tabindex='0' role='application'>").patch(function() {
			Patcher.voidStart("img").attr("tabindex", 0).attr("role", "application").voidEnd();
		}, function(aMutations) {
			assert.equal(aMutations.length, 0, "Void tag - attributes");
		});

		this.html("<img title='" + encodeXML("~!@#$%^&*()_+{}:<>?\'\"") + "'>").patch(function() {
			Patcher.voidStart("img").attr("title", "~!@#$%^&*()_+{}:<>?\'\"").voidEnd();
		}, function(aMutations) {
			assert.equal(aMutations.length, 0, "Void tag - attribute escaped");
		});

		this.html("<img class='x'>").patch(function() {
			Patcher.voidStart("img").class("x").voidEnd();
		}, function(aMutations) {
			assert.equal(aMutations.length, 0, "Void tag - class");
		});

		this.html("<img class='x y z'>").patch(function() {
			Patcher.voidStart("img").class("x").class("y").class("z").voidEnd();
		}, function(aMutations) {
			assert.equal(aMutations.length, 0, "Void tag - classes");
		});

		this.html("<img style='width: 10px;'>").patch(function() {
			Patcher.voidStart("img").style("width", "10px").voidEnd();
		}, function(aMutations) {
			assert.equal(aMutations.length, 0, "Void tag - style");
		});

		this.html("<img style='width: 10px; height: 20px;'>").patch(function() {
			Patcher.voidStart("img").style("width", "10px").style("height", "20px").voidEnd();
		}, function(aMutations) {
			assert.equal(aMutations.length, 0, "Void tag - styles");
		});

	});

	QUnit.test("No DOM patching needed - SVG", function(assert) {

		this.html(
			"<svg id='x' viewBox='-5 -5 10 10' xmlns='http://www.w3.org/2000/svg'>" + // case-sensitive attribute
				"<linearGradient gradientTransform='rotate(90)'>" +                   // case-sensitive tag name
					"<stop offset='5%' stop-color='gold'/>" +                         // attribute with hyphen
					"<stop offset='95%' stop-color='red'></stop>" +                   // explicit close tag
				"</linearGradient>" +                                                 // case-sensitive tag name
				"<rect x='0' y='0' width='100%' style='height: 100%;'/>" +            // self-closing tag
			"</svg>"
		).patch(function() {
			Patcher.
			openStart("svg", "x").attr("viewBox", "-5 -5 10 10").attr("xmlns", "http://www.w3.org/2000/svg").openEnd().
				openStart("linearGradient").attr("gradientTransform", "rotate(90)").openEnd().
					openStart("stop").attr("offset", '5%').attr("stop-color", "gold").openEnd().close("stop").
					openStart("stop").attr("offset", '95%').attr("stop-color", "red").openEnd().close("stop").
				close("linearGradient").
				openStart("rect").attr("x", 0).attr("y", 0).attr("width", "100%").style("height", "100%").openEnd().close("rect").
			close("svg");
		}, function(aMutations) {
			assert.equal(aMutations.length, 0, "SVG - nested");
		});

	});

	QUnit.test("Attribute/property/text changes", function(assert) {

		this.html("<div id='x'></div>").patch(function() {
			Patcher.openStart("div").attr("id", "y").openEnd().close("div");
		}, function(aMutations, oElement) {
			assert.equal(aMutations.length, 1, "Only one change");
			assert.equal(oElement.id, "y", "id attribute is changed");
		});

		this.html("<div id='x'></div>").patch(function() {
			Patcher.openStart("div").openEnd().close("div");
		}, function(aMutations, oElement) {
			assert.equal(aMutations.length, 1, "Only one change");
			assert.equal(oElement.getAttribute("id"), null, "id is removed");
		});

		this.html("<div>X</div>").patch(function() {
			Patcher.openStart("div").openEnd().text("Y").close("div");
		}, function(aMutations, oElement) {
			assert.equal(aMutations.length, 1, "Only one change");
			assert.equal(aMutations[0].target.nodeValue, "Y", "text node patched");
		});

		this.html("<div>X</div>").patch(function() {
			Patcher.openStart("div").openEnd().close("div");
		}, function(aMutations, oElement) {
			assert.equal(aMutations.length, 1, "Only one change");
			assert.equal(oElement.textContent, "", "no text left");
		});

		this.html("<div class='x'></div>").patch(function() {
			Patcher.openStart("div").class("y").openEnd().close("div");
		}, function(aMutations, oElement) {
			assert.equal(aMutations.length, 1, "Only one change");
			assert.equal(oElement.className, "y", "class attribute is changed");
		});

		this.html("<div class='x'></div>").patch(function() {
			Patcher.openStart("div").openEnd().close("div");
		}, function(aMutations, oElement) {
			assert.equal(aMutations.length, 1, "Only one change");
			assert.notOk(oElement.getAttribute("class"), "class attribute is removed");
		});

		this.html("<div class='x y'></div>").patch(function() {
			Patcher.openStart("div").class("y").class("x").openEnd().close("div");
		}, function(aMutations, oElement) {
			assert.equal(aMutations.length, 1, "Only one change");
			assert.equal(oElement.className, "y x", "class attribute is changed, order is ignored");
		});

		this.html("<div style='width: calc(100% - 3rem);'></div>").patch(function() {
			Patcher.openStart("div").style("width", "calc(100% - 2rem)").openEnd().close("div");
		}, function(aMutations, oElement) {
			assert.equal(aMutations.length, 1, "Only one change");
			assert.equal(oElement.getAttribute("style"), "width: calc(100% - 2rem);", "style is changed");
		});

		this.html("<div style='width: 10px;'></div>").patch(function() {
			Patcher.openStart("div").openEnd().close("div");
		}, function(aMutations, oElement) {
			assert.equal(aMutations.length, 1, "Only one change");
			assert.equal(oElement.getAttribute("style"), null, "style attribute is removed");
		});

		this.html("<div style='width: 10px;'></div>").patch(function() {
			Patcher.openStart("div").style("width", "").openEnd().close("div");
		}, function(aMutations, oElement) {
			assert.equal(aMutations.length, 1, "Only one change");
			assert.equal(oElement.getAttribute("style"), null, "style attribute is removed since it had no value");
		});

		this.html("<div></div>").patch(function() {
			Patcher.openStart("div").style("background-image", "url(\"" + encodeCSS("~!@#$%^&()_+{}'.jpg") + "\")").openEnd().close("div");
		}, function(aMutations, oElement) {
			assert.equal(aMutations.length, 1, "Only one change - style attribute");

			// safari is returning the full path e.g. "url("http://localhost:8080/testsuite/~!@#$%^&()_+{}'.jpg")"
			assert.equal(oElement.style.backgroundImage.replace(/http.*\//, ""), "url(\"~!@#$%^&()_+{}'.jpg\")", "style attribute is set via cssText");
		});

		this.html("<div id='x' tabindex='0' title='t'></div>").patch(function() {
			Patcher.openStart("div", "y").attr("tabindex", 1).attr("title", "i").openEnd().close("div");
		}, function(aMutations, oElement) {
			assert.equal(aMutations.length, 3, "3 changes");
			assert.equal(oElement.id, "y", "id key is changed");
			assert.equal(oElement.tabIndex, 1, "tabindex is changed");
			assert.equal(oElement.title, "i", "title is changed");
		});

		this.html("<input value='1'>").patch(function(oElement) {
			Patcher.voidStart("input").voidEnd();
		}, function(aMutations, oElement) {
			assert.equal(aMutations.length, 1, "Only one change");
			assert.equal(oElement.value, "", "value property is changed");
		});

		this.html("<input value='1'>").patch(function(oElement) {
			oElement.value = 10;
			Patcher.voidStart("input").attr("value", 0).voidEnd();
		}, function(aMutations, oElement) {
			assert.equal(aMutations.length, 1, "Only one change");
			assert.equal(oElement.getAttribute("value"), "0", "value attribute is changed");
			assert.equal(oElement.value, "0", "value property is changed as well");
		});

		this.html("<input type='radio' checked='checked'>").patch(function(oElement) {
			oElement.checked = false;
			Patcher.voidStart("input").attr("type", "radio").attr("checked", "checked").voidEnd();
		}, function(aMutations, oElement) {
			assert.equal(aMutations.length, 0, "No change");
			assert.equal(oElement.checked, true, "but checked property is updated");
		});

		this.html("<input type='radio' checked=''>").patch(function(oElement) {
			Patcher.voidStart("input").attr("type", "radio").voidEnd();
		}, function(aMutations, oElement) {
			assert.equal(aMutations.length, 1, "Boolean checked attribute is removed");
			assert.equal(oElement.checked, false, "checked property is up-to-date");
		});

		this.html(
			"<select>" +
				"<option></option>" +
				"<option selected='selected'></option>" +
			"</select>"
		).patch(function(oElement) {
			oElement.lastChild.selected = false;
			Patcher.openStart("select").openEnd().
				openStart("option").openEnd().close("option").
				openStart("option").attr("selected", "selected").openEnd().close("option").
			close("select");
		}, function(aMutations, oElement) {
			assert.equal(aMutations.length, 0, "No change");
			assert.equal(oElement.lastChild.selected, true, "but selected property is updated");
		});

	});

	QUnit.test("NodeName changes", function(assert) {

		this.html("<div></div>").patch(function() {
			Patcher.openStart("span").openEnd().close("span");
		}, function(aMutations, oElement) {
			assert.equal(aMutations.length, 2, "Two changes");
			assert.equal(oElement.tagName, "SPAN", "span is rendered");
			assert.equal(aMutations[0].removedNodes[0].tagName, "DIV", "div is removed");
			assert.equal(aMutations[1].addedNodes[0].tagName, "SPAN", "span is added");
		});

		this.html("<div></div>").patch(function() {
			Patcher.voidStart("input").voidEnd();
		}, function(aMutations, oElement) {
			assert.equal(aMutations.length, 2, "Two changes");
			assert.equal(oElement.tagName, "INPUT", "span is rendered");
			assert.equal(aMutations[0].removedNodes[0].tagName, "DIV", "div is removed");
			assert.equal(aMutations[1].addedNodes[0].tagName, "INPUT", "input is added");
		});

		this.html("<input>").patch(function() {
			Patcher.openStart("svg").attr("viewBox", "-5 -5 10 10").openEnd().close("svg");
		}, function(aMutations, oElement) {
			assert.equal(aMutations.length, 2, "Two changes");
			assert.equal(oElement.tagName, "svg", "svg is rendered");
			assert.equal(oElement.getAttribute("viewBox"), "-5 -5 10 10", "svg NS attribute is set");
			assert.equal(aMutations[0].removedNodes[0].tagName, "INPUT", "input is removed");
			assert.equal(aMutations[1].addedNodes[0].tagName, "svg", "svg is added");
		});

		this.html("<span>Text</span>").patch(function() {
			Patcher.openStart("span").openEnd().
				openStart("div").openEnd().close("div").
			close("span");
		}, function(aMutations, oElement) {
			assert.equal(aMutations.length, bLegacyObserver ? 3 : 2, "Two changes");
			assert.equal(oElement.firstChild.tagName, "DIV", "div is rendered");
			assert.equal(aMutations[0].addedNodes[0].tagName, "DIV", "div is added");
			assert.equal(aMutations[1].removedNodes[0].nodeName, "#text", "text is removed");
		});

		this.html("<span>Text<img></span>").patch(function() {
			Patcher.openStart("span").openEnd().
				voidStart("img").voidEnd().text("Text").
			close("span");
		}, function(aMutations, oElement) {
			assert.equal(aMutations.length, 2, "Two changes");
			assert.equal(oElement.firstChild.tagName, "IMG", "img is first child");
			assert.equal(oElement.lastChild.nodeValue, "Text", "text is not changed and last child");
			assert.equal(aMutations[0].addedNodes[0].tagName, "IMG", "new img is added");
			assert.equal(aMutations[1].removedNodes[0].tagName, "IMG", "old img is removed");
		});

	});


	QUnit.test("Patching - Keys", function(assert) {

		this.html("<div id='x'></div>").patch(function() {
			Patcher.openStart("div", "x").openEnd().close("div");
		}, function(aMutations) {
			assert.equal(aMutations.length, 0, "No patching is needed");
		});

		this.html("<div id='x'></div>").patch(function() {
			Patcher.openStart("div", "y").openEnd().close("div");
		}, function(aMutations, oElement) {
			assert.equal(aMutations.length, 1, "Only one change");
			assert.equal(oElement.id, "y", "id key is changed, this is only allowed for the root node");
		});

		this.html("<div id='x'></div>").patch(function() {
			Patcher.openStart("span", "x").openEnd().close("span");
		}, function(aMutations, oElement) {
			assert.equal(aMutations.length, 2, "Two changes: tagName is changed while keys are equal");
			assert.equal(oElement.id, "x", "id is not changed");
			assert.equal(oElement.tagName, "SPAN", "span is rendered");
			assert.equal(aMutations[0].removedNodes[0].tagName, "DIV", "div is removed");
			assert.equal(aMutations[1].addedNodes[0].tagName, "SPAN", "span is added");
		});

		this.html("<ul><li id='x'></li></ul>").patch(function() {
			Patcher.openStart("ul").openEnd().openStart("li", "y").openEnd().close("li").close("ul");
		}, function(aMutations, oElement) {
			assert.equal(aMutations.length, 2, "Two changes: no reuse of old element with key");
			assert.equal(oElement.firstChild.id, "y", "id is updated");
			assert.equal(aMutations[0].addedNodes[0], oElement.firstChild, "new keyed element is created");
			assert.equal(aMutations[1].removedNodes[0].id, "x", "old keyed element is removed");
		});

		this.html("<ul><li></li></ul>").patch(function() {
			Patcher.openStart("ul").openEnd().openStart("li", "y").openEnd().close("li").close("ul");
		}, function(aMutations, oElement) {
			assert.equal(aMutations.length, 1, "One change: reuse of old element because has no id");
			assert.equal(oElement.firstChild.id, "y", "id is updated");
		});

		this.html(
			"<ul>" +
				"<li id='x'></li>" +
			"</ul>"
		).patch(function() {
			Patcher.openStart("ul").openEnd().
				openStart("li", "y").openEnd().close("li").
				openStart("li", "x").openEnd().close("li").
			close("ul");
		}, function(aMutations, oElement) {
			assert.equal(aMutations.length, 1, "One change: old keyed element is reused");
			assert.equal(oElement.firstChild.id, "y", "id is updated");
			assert.equal(aMutations[0].addedNodes[0], oElement.firstChild, "new keyed element is created");
			assert.equal(oElement.lastChild.id, "x", "old keyed element is in the right position");
		});

		this.html(
			"<ul>" +
				"<li id='x'>X</li>" +
				"<li id='y'>Y</li>" +
			"</ul>"
		).patch(function() {
			Patcher.openStart("ul").openEnd().
				openStart("li", "x").openEnd().text("X").close("li").
			close("ul");
		}, function(aMutations, oElement) {
			assert.equal(aMutations.length, 1, "One changes: Only last node is removed");
			assert.equal(oElement.firstChild.id, "x", "first item is not changed ");
			assert.equal(oElement.childElementCount, 1, "There is only one child");
		});

		this.html(
			"<ul>" +
				"<li id='x'>X</li>" +
				"<li id='y'>Y</li>" +
			"</ul>"
		).patch(function() {
			Patcher.openStart("ul").openEnd().
				openStart("li", "y").openEnd().text("Y").close("li").
				openStart("li", "x").openEnd().text("X").close("li").
			close("ul");
		}, function(aMutations, oElement) {
			assert.equal(aMutations.length, 2, "Two changes: Only nodes are moved");
			assert.equal(oElement.firstChild.id, "y", "first item is patched correctly ");
			assert.equal(oElement.lastChild.id, "x", "last item is patched correctly");
			assert.equal(aMutations[0].type, "childList", "Only childList is changed");
			assert.equal(aMutations[1].type, "childList", "Only childList is changed");
		});

		this.html(
			"<ul>" +
				"<li id='x'>X</li>" +
				"<li id='y'>Y</li>" +
			"</ul>"
		).patch(function() {
			Patcher.openStart("ul").openEnd().
				openStart("li", "x").openEnd().text("X").close("li").
				openStart("li", "z").openEnd().text("Z").close("li").
				openStart("li", "y").openEnd().text("Y").close("li").
			close("ul");
		}, function(aMutations, oElement) {
			assert.equal(aMutations.length, 1, "One change: Only new node is added");
			assert.equal(oElement.children[0].id, "x", "first item is patched correctly");
			assert.equal(oElement.children[1].id, "z", "second item is patched correctly");
			assert.equal(oElement.children[2].id, "y", "third item is patched correctly");
			assert.equal(aMutations[0].addedNodes[0], oElement.children[1], "Only 2nd item is added");
		});

		this.html("<ul><li id='x'></li></ul>").patch(function() {
			var stub = sinon.stub(Patcher, "matchElement").callsFake(function(sId, sTagName, oElement) {
				return oElement;
			});

			Patcher.openStart("ul").openEnd().openStart("li", "y").openEnd().close("li").close("ul");

			stub.restore();
		}, function(aMutations, oElement) {
			assert.equal(aMutations.length, 1, "One changes: reuse of old element with matched node even though node thas another id");
			assert.equal(oElement.firstChild.id, "y", "id is updated");
			assert.equal(oElement.childElementCount, 1, "has only one child");
		});

		this.html(
			"<ul>" +
				"<li id='x'></li>" +
				"<li id='prefix-y'></li>" +
			"</ul>"
		).patch(function() {
			var stub = sinon.stub(Patcher, "matchElement").callsFake(function(sId, sTagName, oElement) {
				return document.getElementById("prefix-" + sId);
			});

			Patcher.openStart("ul").openEnd().
				openStart("li", "y").openEnd().close("li").
			close("ul");

			stub.restore();
		}, function(aMutations, oElement) {
			assert.equal(oElement.firstChild.id, "y", "id is updated");
			assert.equal(oElement.childElementCount, 1, "has only one child");
		});

		this.html("<ul></ul>").patch(function() {
			var stub = sinon.stub(Patcher, "createElement").callsFake(function(sId, sTagName, oParent) {
				return oParent.lastChild ? oParent.lastChild.cloneNode(true) : null;
			});

			Patcher.openStart("ul").openEnd().
				openStart("li", "a").attr("title", "a").openEnd().text("a").close("li").
				openStart("li", "b").attr("title", "b").openEnd().text("b").close("li").
				openStart("li", "c").attr("data-title", "c").class("c").style("color", "red").openEnd().
					openStart("div").openEnd().text("c").close("div").
				close("li").
				openStart("span").openEnd().text("d").close("span").
				openStart("li").openEnd().close("li").
			close("ul");

			stub.restore();
		}, function(aMutations, oElement) {
			assert.equal(aMutations.length, 5, "Five changes: all children are inserted");
			assert.equal(oElement.childElementCount, 5, "has five children");
			assert.equal(oElement.textContent, "abcd", "children are rendered correctly");
			assert.equal(oElement.children[0].id, "a", "node a has the correct id");
			assert.equal(oElement.children[0].title, "a", "node a has the correct title");
			assert.equal(oElement.children[1].id, "b", "node b has the correct id");
			assert.equal(oElement.children[1].title, "b", "node b has the correct title");
			assert.equal(oElement.children[2].id, "c", "node c has the correct id");
			assert.equal(oElement.children[2].getAttribute("data-title"), "c", "node c has the correct data-attribute");
			assert.ok(oElement.children[2].classList.contains("c"), "node c has the correct class");
			assert.equal(oElement.children[2].style.color, "red", "node c has the correct style");
			assert.equal(oElement.children[2].firstChild.nodeName, "DIV", "node c has the correct child");
			assert.equal(oElement.children[3].nodeName, "SPAN", "node d has the span tag");
			assert.equal(oElement.children[4].outerHTML, "<li></li>", "last children has no attributes");
		});

	});


	QUnit.test("Patching Nested", function(assert) {

		this.html(
			"<ul>" +
				"<li id='x'>1</li>" +
				"<li id='y'>2</li>" +
			"</ul>"
		).patch(function() {
			Patcher.openStart("ul").openEnd().close("ul");
		}, function(aMutations, oElement) {
			if (bLegacyObserver) {
				assert.equal(aMutations.length, 2, "Two changes for legacy observers");
				assert.equal(aMutations[0].removedNodes[0].id, "x", "Node X is removed");
				assert.equal(aMutations[1].removedNodes[0].id, "y", "Node Y is removed");
			} else {
				assert.equal(aMutations.length, 1, "Only one change: all children are removed with one delete operation");
				assert.equal(aMutations[0].removedNodes.length, 2, "Two children are removed");
			}
			assert.equal(oElement.childElementCount, 0, "Has no child anymore");
		});

		this.html(
			"<ul>" +
				"<li></li>" +
				"<li id='x'><input><b>Test</b></li>" +
			"</ul>"
		).patch(function() {
			Patcher.openStart("ul").openEnd().openStart("li").openEnd().close("li").close("ul");
		}, function(aMutations, oElement) {
			assert.equal(aMutations.length, 1, "Only one change: last item is removed with one delete operation");
			assert.equal(oElement.childElementCount, 1, "Has only one child");
			assert.equal(document.getElementById("x"), null, "Last child is removed");
		});

		this.html("<ul></ul>").patch(function() {
			Patcher.openStart("ul").openEnd().
				openStart("li").attr("title", "x").openEnd().
					openStart("b").openEnd().text(1).close("b").
				close("li").
				openStart("li").attr("title", "y").openEnd().
					openStart("u").openEnd().text(2).close("u").
				close("li").
			close("ul");
		}, function(aMutations, oElement) {
			assert.equal(aMutations.length, 2, "Two changes: every sub node is appended to the DOM");
			assert.equal(aMutations[0].addedNodes.length + aMutations[1].addedNodes.length, 2, "Two children are added");
		});

	});


	QUnit.test("Patching unsafeHtml", function(assert) {

		this.html("<div>Here can be any content from outside</div>").patch(function() {
			Patcher.openStart("div").openEnd().
				unsafeHtml("Plain text actually not supported with unsafeHtml").
			close("div");
		}, function(aMutations, oElement) {
			assert.equal(aMutations.length, 2, "Two changes for plain text");
			assert.equal(oElement.textContent, "Plain text actually not supported with unsafeHtml");
		});

		this.html("<ul></ul>").patch(function() {
			Patcher.openStart("ul").openEnd().
				unsafeHtml("<li id='x'><input><b>Test</b></li>").
				unsafeHtml("<li id='y'><input><b>Test</b></li>").
			close("ul");
		}, function(aMutations, oElement) {
			assert.equal(aMutations.length, 2, "Two changes");
			assert.equal(aMutations[0].addedNodes.length + aMutations[1].addedNodes.length, 2, "Two children are added");
		});

		this.html("<div></div>").patch(function() {
			Patcher.unsafeHtml("<img>");
		}, function(aMutations, oElement) {
			// IE11 and Edge do not include the child nodes when they are removed by setting the innerHTML.
			var bLegacyInnerHtmlObserver = bLegacyObserver || Device.browser.edge;
			assert.equal(aMutations.length, bLegacyInnerHtmlObserver ? 2 : 1, "outerHTML is replaced");
			assert.equal(aMutations[0].removedNodes[0].tagName, "DIV", "div element is removed");
			assert.equal(aMutations[bLegacyInnerHtmlObserver ? 1 : 0].addedNodes[0].tagName, "IMG", "img element is added");
			assert.equal(oElement.tagName, "IMG", "There is only an img element");
		});

		this.html("<div id='x'></div>").patch(function() {
			Patcher.unsafeHtml("", "x");
		}, function(aMutations, oElement) {
			assert.equal(aMutations.length, 1, "One change: outerHTML is replaced");
			assert.equal(aMutations[0].removedNodes[0].tagName, "DIV", "div element is removed");
			assert.equal(oElement, null, "Element does not exists");
		});

		this.html(
			"<ul>" +
				"<li id='x'>X</li>" +
				"<li id='y'><b id='t'>text</b></li>" +
				"<li id='z'>Z</li>" +
			"</ul>"
		).patch(function() {
			Patcher.openStart("ul").openEnd().
				unsafeHtml("<li id='a'>A</li>").
				openStart("li", "y").openEnd().unsafeHtml("text").close("li").
				unsafeHtml("<li id='b'>B</li>").
			close("ul");
		}, function(aMutations, oElement) {
			assert.equal(aMutations.length, 8, "Eight changes");
			assert.equal(aMutations[0].addedNodes[0].id, "a", "Node A is added");
			assert.equal(aMutations[1].removedNodes[0].id, "y", "Node Y is remove from 3rd position");
			assert.equal(aMutations[2].addedNodes[0].id, "y", "and inserted to 2nd position");
			assert.equal(aMutations[3].addedNodes[0].nodeValue, "text", "Text is added");
			assert.equal(aMutations[4].removedNodes[0].id, "t", "Node T is removed");
			assert.equal(aMutations[5].addedNodes[0].id, "b", "Node B is added");
			assert.equal(aMutations[6].removedNodes[0].id, "z", "Node Z is removed");
			assert.equal(aMutations[7].removedNodes[0].id, "x", "Node X is removed");
			assert.equal(oElement.firstChild.id, "a", "Node A is the first child");
			assert.equal(oElement.lastChild.id, "b", "Node B is the last child");
		});

		this.html(
			"<ul>" +
				"<li id='a'>X</li>" +
				"<li id='b'>Y</li>" +
				"<li id='c'>Z</li>" +
				"<li id='q'>Q</li>" +
			"</ul>"
		).patch(function() {
			Patcher.openStart("ul").openEnd().
				unsafeHtml("<li id='a'>A</li>", "a").
				unsafeHtml("<li id='b'>B</li>", "b").
				unsafeHtml("<li id='c'>C</li>", "c").
			close("ul");
		}, function(aMutations, oElement) {
			assert.equal(aMutations.length, 7, "Seven changes");
			assert.equal(aMutations[0].addedNodes[0].id, "a", "Node A is first added");
			assert.equal(aMutations[1].removedNodes[0].id, "a", "then old Node A is removed");
			assert.equal(aMutations[2].addedNodes[0].id, "b", "Node B is first added");
			assert.equal(aMutations[3].removedNodes[0].id, "b", "then old Node B is removed");
			assert.equal(aMutations[4].addedNodes[0].id, "c", "Node C is first added");
			assert.equal(aMutations[5].removedNodes[0].id, "c", "then old Node C is removed");
			assert.equal(aMutations[6].removedNodes[0].id, "q", "Cleanup process is removed Node Q");
			assert.equal(oElement.firstChild.id, "a", "Node a is the first child");
			assert.equal(oElement.firstChild.textContent, "A", "Node a is the first child");
			assert.equal(oElement.lastChild.id, "c", "Node C is the last child");
			assert.equal(oElement.lastChild.textContent, "C", "Node C is the last child");
		});

		this.html("<ul><li>1</li><li>2</li><li>3</li><li>4</li></ul>").patch(function() {
			Patcher.openStart("ul").openEnd().
				unsafeHtml("<li id='x'>5</li>").
			close("ul");
		}, function(aMutations, oElement) {
			assert.equal(aMutations.length, 5, "Five changes");
			assert.equal(aMutations[0].addedNodes[0].id, "x", "First Node X is added");
			assert.equal(aMutations[1].removedNodes[0].textContent, "4", "Node 4 is removed");
			assert.equal(aMutations[2].removedNodes[0].textContent, "3", "Node 3 is removed");
			assert.equal(aMutations[3].removedNodes[0].textContent, "2", "Node 2 is removed");
			assert.equal(aMutations[4].removedNodes[0].textContent, "1", "Node 1 is removed");

			assert.equal(oElement.textContent, "5", "Text is applied");
		});

	});

	QUnit.test("Patching context", function(assert) {
		this.html("<div id='x'></div>").patch(function() {
			var span = document.createElement("span");

			Patcher.openStart("div", "x").openEnd();
				Patcher.setRootNode(span);
				Patcher.openStart("span").openEnd().text("inner").close("span");

				assert.equal(Patcher.getCurrentNode().textContent, "inner", "Inner is patched");
				Patcher.reset();
			Patcher.text("outer").close("div");
		}, function(aMutations, oElement) {
			assert.equal(aMutations.length, 1, "Two changes");
			assert.equal(oElement.textContent, "outer", "Outer is patched");
		});
	});


	QUnit.test("Patching - SVG Partial", function(assert) {

		this.html(
			"<svg viewBox='0 0 220 100' xmlns='http://www.w3.org/2000/svg'>" +
				"<rect width='100' height='100' />" +
			"</svg>"
		).patch(function() {
			Patcher.
			openStart("svg").attr("viewBox", "0 0 220 100").attr("xmlns", "http://www.w3.org/2000/svg").openEnd().
				openStart("rect").attr("width", "100").attr("height", "100").openEnd().close("rect").
				openStart("rect").attr("x", 120).attr("width", "100").attr("height", "100").openEnd().close("rect").
			close("svg");
		}, function(aMutations, oSVG) {
			assert.equal(aMutations.length, 1, "Single change - new rect element is added");
			assert.equal(oSVG.lastChild.namespaceURI, oSVG.namespaceURI, "Namespace is set on the new rect element");
		});

		this.html(
			"<svg viewBox='0 0 220 100' xmlns='http://www.w3.org/2000/svg'>" +
				"<rect width='100' height='100' />" +
			"</svg>"
		).patch(function() {
			Patcher.
			openStart("svg").attr("viewBox", "0 0 220 100").attr("xmlns", "http://www.w3.org/2000/svg").openEnd().
				openStart("rect").attr("width", "100").attr("height", "100").openEnd().close("rect").
				openStart("foreignObject").attr("x", "20").attr("y", "20").openEnd().
					openStart("p").openEnd().text("Text").close("p").
				close("foreignObject").
			close("svg");
		}, function(aMutations, oSVG) {
			assert.equal(aMutations.length, 1, "Single change - new foreignObject element is added");
			assert.equal(oSVG.textContent, "Text", "Text is set for the SVG with foreignObject");
			assert.equal(oSVG.lastChild.namespaceURI, oSVG.namespaceURI, "Namespace is set on the new foreignObject element");
			assert.equal(oSVG.lastChild.firstChild.namespaceURI, oSVG.parentNode.namespaceURI, "Namespace of the p tag is valid");
		});

	});

});
