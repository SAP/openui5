sap.ui.define([
	"sap/ui/core/Control",
	"sap/ui/core/Patcher",
	"sap/ui/core/Renderer",
	"sap/ui/core/RenderManager",
	"sap/ui/core/InvisibleText",
	"sap/ui/qunit/utils/createAndAppendDiv"
], function(Control, Patcher, Renderer, RenderManager, InvisibleText, createAndAppendDiv) {

	"use strict";
	/*global QUnit,sinon*/

	createAndAppendDiv("uiArea1");
	createAndAppendDiv("uiArea2");

	var StringControl = Control.extend("test.StringControl", {
		metadata: {
			properties: {
				header: { type: "string", defaultValue: "StringControl" },
				width: { type: "sap.ui.core.CSSSize", defaultValue: "100%" },
				icon: { type: "sap.ui.core.URI", defaultValue: "" },
				renderNothing: { type: "boolean", defaultValue: false },
				doSomething: { type: "function" }
			},
			aggregations: {
				items: { type: "sap.ui.core.Control", multiple: true }
			},
			associations: {
				ariaLabelledBy: { type: "sap.ui.core.Control", multiple: true, singularName: "ariaLabelledBy" }
			}
		},
		renderer: function(rm, oControl) {
			if (oControl.getRenderNothing()) {
				return;
			}

			rm.write("<div");
			rm.writeControlData(oControl);
			rm.writeAccessibilityState(oControl);
			rm.writeAttributeEscaped("title", oControl.getTooltip_AsString() || "StringControl");
			rm.writeAttribute("aria-describedby", InvisibleText.getStaticId("sap.ui.core", "ARIA_DESCRIBEDBY")); /* during rerendering this will create new RM not to invalidate static UIArea */
			rm.writeAttribute("tabindex", 0);
			rm.addStyle("width", oControl.getWidth());
			rm.addStyle("background", "red");
			rm.addClass("StringControl");
			rm.writeClasses();
			rm.writeStyles();

			if (oControl.getDoSomething()) {
				oControl.getDoSomething()();
			}

			rm.write(">");
			rm.write("<header>");
			if (oControl.getIcon()) {
				rm.writeIcon(oControl.getIcon());
			}
			rm.writeEscaped(oControl.getHeader(), true);
			rm.write("</header>");
			rm.write("<hr>");
			oControl.getItems().forEach(function(oChild) {
				rm.renderControl(oChild);
			});
			rm.write("</div>");
		}
	});

	var PatchingControl = Control.extend("test.PatchingControl", {
		metadata: {
			properties: {
				header: { type: "string", defaultValue: "PatchingControl" },
				width: { type: "sap.ui.core.CSSSize", defaultValue: "100%" },
				icon: { type: "sap.ui.core.URI", defaultValue: "" },
				renderNothing: { type: "boolean", defaultValue: false },
				doSomething: { type: "function" }
			},
			aggregations: {
				items: { type: "sap.ui.core.Control", multiple: true }
			},
			associations: {
				ariaLabelledBy: { type: "sap.ui.core.Control", multiple: true, singularName: "ariaLabelledBy" }
			}
		},
		renderer: {
			apiVersion: 2,
			render: function(rm, oControl) {
				if (oControl.getRenderNothing()) {
					return;
				}

				rm.openStart("div", oControl);
				rm.accessibilityState(oControl);
				rm.attr("title", oControl.getTooltip_AsString() || "PatchingControl");
				rm.attr("aria-describedby", InvisibleText.getStaticId("sap.ui.core", "ARIA_DESCRIBEDBY"));
				rm.attr("tabindex", 0);
				rm.style("width", oControl.getWidth());
				rm.style("background", "green");
				rm.class("PatchingControl");

				if (oControl.getDoSomething()) {
					oControl.getDoSomething()();
				}

				rm.openEnd();
				rm.openStart("header").openEnd();
				if (oControl.getIcon()) {
					rm.icon(oControl.getIcon());
				}
				rm.text(oControl.getHeader(), true);
				rm.close("header");
				rm.voidStart("hr").voidEnd();
				oControl.getItems().forEach(function(oChild) {
					rm.renderControl(oChild);
				});
				rm.close("div");
			}
		}
	});

	QUnit.test("String rendering output and events", function(assert) {
		var oStringControl = new StringControl();
		var onBeforeRenderingSpy = sinon.spy();
		var onAfterRenderingSpy = sinon.spy();

		oStringControl.setHeader("New Header");
		oStringControl.addStyleClass("styleclass");
		oStringControl.setIcon("sap-icon://favorite");
		oStringControl.data("key", "value", true);
		oStringControl.addAriaLabelledBy("aria");
		oStringControl.addEventDelegate({
			onBeforeRendering: onBeforeRenderingSpy,
			onAfterRendering: onAfterRenderingSpy
		});

		oStringControl.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		assert.equal(onAfterRenderingSpy.callCount, 1, "onAfterRendering is called");
		assert.equal(onBeforeRenderingSpy.callCount, 1, "onBeforeRendering is called");

		var oDomRef = oStringControl.getDomRef();
		assert.equal(oDomRef.tagName, "DIV", "root tag name is correct");
		assert.equal(oDomRef.title, "StringControl", "Tooltip is set");
		assert.equal(oDomRef.getAttribute("aria-labelledby"), "aria", "aria-labelledby is set");
		assert.ok(oDomRef.getAttribute("aria-describedby"), "aria-describedby is set");
		assert.ok(oDomRef.classList.contains("StringControl"), "class is added");
		assert.ok(oDomRef.classList.contains("styleclass"), "custom style class is added");
		assert.equal(oDomRef.getAttribute("data-key"), "value", "data is written to dom");
		assert.equal(oDomRef.tabIndex, 0, "tabindex attribute is set");
		assert.equal(oDomRef.style.width, "100%", "width property is set");
		assert.equal(oDomRef.style.backgroundColor, "red", "background-color is set correctly");
		assert.equal(oDomRef.firstChild.tagName, "HEADER", "header is rendered");
		assert.ok(oDomRef.firstChild.firstChild.classList.contains("sapUiIcon"), "icon is rendered");
		assert.equal(oDomRef.textContent, "New Header", "header is written to the dom");
		assert.equal(oDomRef.lastChild.tagName, "HR", "void hr tag is rendered");

		oStringControl.rerender();
		assert.equal(onAfterRenderingSpy.callCount, 2, "onAfterRendering is called again");
		assert.equal(onBeforeRenderingSpy.callCount, 2, "onBeforeRendering is called again");

		oStringControl.destroy();
	});

	QUnit.test("New rendering output and events", function(assert) {
		var oPatchingControl = new PatchingControl();
		var onBeforeRenderingSpy = sinon.spy();
		var onAfterRenderingSpy = sinon.spy();

		oPatchingControl.setHeader("New Header");
		oPatchingControl.addStyleClass("styleclass");
		oPatchingControl.setIcon("sap-icon://favorite");
		oPatchingControl.data("key", "value", true);
		oPatchingControl.addAriaLabelledBy("aria");
		oPatchingControl.addEventDelegate({
			onBeforeRendering: onBeforeRenderingSpy,
			onAfterRendering: onAfterRenderingSpy
		});

		oPatchingControl.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		assert.equal(onAfterRenderingSpy.callCount, 1, "onAfterRendering is called");
		assert.equal(onBeforeRenderingSpy.callCount, 1, "onBeforeRendering is called");

		var oDomRef = oPatchingControl.getDomRef();
		assert.equal(oDomRef.tagName, "DIV", "root tag name is correct");
		assert.equal(oDomRef.title, "PatchingControl", "Tooltip is set");
		assert.equal(oDomRef.getAttribute("aria-labelledby"), "aria", "aria-labelledby is set");
		assert.ok(oDomRef.getAttribute("aria-describedby"), "aria-describedby is set");
		assert.ok(oDomRef.classList.contains("PatchingControl"), "class is added");
		assert.ok(oDomRef.classList.contains("styleclass"), "custom style class is added");
		assert.equal(oDomRef.getAttribute("data-key"), "value", "data is written to dom");
		assert.equal(oDomRef.tabIndex, 0, "tabindex attribute is set");
		assert.equal(oDomRef.style.width, "100%", "width property is set");
		assert.equal(oDomRef.style.backgroundColor, "green", "background-color is set correctly");
		assert.equal(oDomRef.firstChild.tagName, "HEADER", "header is rendered");
		assert.ok(oDomRef.firstChild.firstChild.classList.contains("sapUiIcon"), "icon is rendered");
		assert.equal(oDomRef.textContent, "New Header", "header is written to the dom");
		assert.equal(oDomRef.lastChild.tagName, "HR", "void hr tag is rendered");

		oPatchingControl.rerender();
		assert.equal(onAfterRenderingSpy.callCount, 2, "onAfterRendering is called again");
		assert.equal(onBeforeRenderingSpy.callCount, 2, "onBeforeRendering is called again");

		oPatchingControl.destroy();
	});

	QUnit.test("Rerendering mutations", function(assert) {
		var oRemovedChild = null;
		var fnCreateRenderManager = function() {
			var oRM = sap.ui.getCore().createRenderManager();
			oRM.openStart("div").openEnd().close("div");
			oRM.destroy();
		};
		var oPatchingControl = new PatchingControl({
			doSomething: fnCreateRenderManager
		});
		oPatchingControl.data("KEY", "VALUE");

		oPatchingControl.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		var aMutations;
		var oDomRef = oPatchingControl.getDomRef();
		var oObserver = new MutationObserver(function() {});

		oObserver.observe(oDomRef, {
			characterDataOldValue: true,
			attributeOldValue: true,
			characterData: true,
			attributes: true,
			childList: true,
			subtree: true
		});

		oPatchingControl.rerender();
		aMutations = oObserver.takeRecords();
		assert.equal(aMutations.length, 0, "Rerendering needs no mutation");

		oPatchingControl.setHeader("H/").rerender();
		aMutations = oObserver.takeRecords();
		assert.equal(oDomRef.textContent, "H/", "Header is changed");
		assert.equal(aMutations.length, 1, "Only header is changed");

		oPatchingControl.setTooltip("T").rerender();
		aMutations = oObserver.takeRecords();
		assert.equal(oDomRef.title, "T", "Title is changed");
		assert.equal(aMutations.length, 1, "Only title is changed");

		oPatchingControl.setWidth("100px").rerender();
		aMutations = oObserver.takeRecords();
		assert.equal(oDomRef.style.width, "100px", "Width is changed");
		assert.equal(aMutations.length, 1, "Only width is changed");

		oPatchingControl.addStyleClass("A").rerender();
		aMutations = oObserver.takeRecords();
		assert.ok(oDomRef.classList.contains("A"), "Class A is added");
		assert.equal(aMutations.length, 1, "Only class is changed");

		oPatchingControl.addStyleClass("Z").rerender();
		aMutations = oObserver.takeRecords();
		assert.ok(oDomRef.classList.contains("A"), "Class Z is added");
		assert.equal(aMutations.length, 1, "Only class is changed");

		oPatchingControl.data("key", "value", true).rerender();
		aMutations = oObserver.takeRecords();
		assert.equal(oDomRef.getAttribute("data-key"), "value", "Data attribute is set");
		assert.equal(aMutations.length, 1, "Only data-key attribute is set");

		oPatchingControl.addItem(new PatchingControl({header: "A", doSomething: fnCreateRenderManager})).rerender();
		aMutations = oObserver.takeRecords();
		assert.equal(oDomRef.lastChild.textContent, "A", "Child A is added");
		assert.equal(aMutations.length, 1, "Only child A is added");

		oPatchingControl.addItem(new PatchingControl({header: "B"})).rerender();
		aMutations = oObserver.takeRecords();
		assert.equal(oDomRef.lastChild.textContent, "B", "Child B is added");
		assert.equal(aMutations.length, 1, "Only child B is added");

		oPatchingControl.addItem(new PatchingControl({header: "C"})).rerender();
		aMutations = oObserver.takeRecords();
		assert.equal(oDomRef.lastChild.textContent, "C", "Child C is added");
		assert.equal(aMutations.length, 1, "Only child C is added");

		assert.equal(oDomRef.textContent, "H/ABC", "Rendering is valid after PatchingControls are added");

		oPatchingControl.getItems()[1].setVisible(false).rerender();
		aMutations = oObserver.takeRecords();
		assert.equal(oDomRef.textContent, "H/AC", "Child B is not visible");
		assert.equal(aMutations.length, 2, "Child B DOM is replaced with the invisible placeholder");

		oPatchingControl.rerender();
		aMutations = oObserver.takeRecords();
		assert.equal(aMutations.length, 0, "No DOM update");

		oPatchingControl.getItems()[1].setVisible(true).rerender();
		aMutations = oObserver.takeRecords();
		assert.equal(oDomRef.textContent, "H/ABC", "Child B is visible again");
		assert.equal(aMutations.length, 1, "Invisible placeholder is replaced with Child B");
		assert.ok(aMutations[0].removedNodes[0].id.endsWith(aMutations[0].addedNodes[0].id), "Invisible placeholder is replaced via old rendering");

		oRemovedChild = oPatchingControl.removeItem(0);
		oPatchingControl.rerender();
		aMutations = oObserver.takeRecords();
		assert.equal(oDomRef.textContent, "H/BC", "Child A is removed");
		assert.equal(aMutations.length, 5, "Remove B from 2nd, Insert B to 1st / Remove C from 3nd, Insert C to 1st / Remove A");

		oPatchingControl.insertItem(oRemovedChild, 0).rerender();
		aMutations = oObserver.takeRecords();
		assert.equal(oDomRef.textContent, "H/ABC", "Child A is inserted to the 1st position");
		assert.equal(aMutations.length, 1, "Only Child A is inserted");

		oRemovedChild = oPatchingControl.removeItem(1);
		oPatchingControl.rerender();
		aMutations = oObserver.takeRecords();
		assert.equal(oDomRef.textContent, "H/AC", "Child B is removed");
		assert.equal(aMutations.length, 3, "A is not changed / Remove C from 3nd, Insert C to 1st / Remove B");

		oPatchingControl.insertItem(oRemovedChild, 1).rerender();
		aMutations = oObserver.takeRecords();
		assert.equal(oDomRef.textContent, "H/ABC", "Child B is inserted to the 2nd position");
		assert.equal(aMutations.length, 1, "Only Child B is inserted");

		oRemovedChild = oPatchingControl.removeItem(2);
		oPatchingControl.rerender();
		aMutations = oObserver.takeRecords();
		assert.equal(oDomRef.textContent, "H/AB", "Child C is removed");
		assert.equal(aMutations.length, 1, "A is not changed / B is not changed / Remove C");

		oPatchingControl.insertItem(oRemovedChild, 2).rerender();
		aMutations = oObserver.takeRecords();
		assert.equal(oDomRef.textContent, "H/ABC", "Child C is inserted to the 3nd position");
		assert.equal(aMutations.length, 1, "Only Child C is inserted");

		oPatchingControl.rerender();
		aMutations = oObserver.takeRecords();
		assert.equal(aMutations.length, 0, "No DOM update");

		oPatchingControl.addItem(new StringControl({header: "X", doSomething: fnCreateRenderManager})).rerender();
		aMutations = oObserver.takeRecords();
		assert.equal(oDomRef.lastChild.textContent, "X", "Child X is added via String Rendering");
		assert.equal(aMutations.length, 1, "Only child X is added");

		assert.equal(oDomRef.textContent, "H/ABCX", "Rendering is valid after StringControl is added");

		oPatchingControl.rerender();
		aMutations = oObserver.takeRecords();
		assert.equal(aMutations.length, 2, "StringControl is replaced(removed from DOM and added again)");

		oPatchingControl.setWidth("200px").rerender();
		aMutations = oObserver.takeRecords();
		assert.equal(oDomRef.style.width, "200px", "Width is changed");
		assert.equal(aMutations.length, 3, "Only width of Patching control is changed and StringControl is replaced");

		oRemovedChild = oPatchingControl.removeItem(3);
		oPatchingControl.insertItem(oRemovedChild, 2).rerender();
		aMutations = oObserver.takeRecords();
		assert.equal(oDomRef.textContent, "H/ABXC", "Child X inserted to right position");
		assert.equal(aMutations.length, 2, "StringControl is added to 3rd position and old one is removed");

		oPatchingControl.insertItem(new StringControl({header: "Y"}), 0).rerender();
		aMutations = oObserver.takeRecords();
		assert.equal(oDomRef.textContent, "H/YABXC", "Child Y inserted to first position");
		assert.equal(aMutations.length, 3, "StringControl Y is added to first position, StringControl X is replaced");

		oPatchingControl.removeAllItems();
		oPatchingControl.rerender();
		aMutations = oObserver.takeRecords();
		assert.equal(aMutations.length, 5, "All children are removed");
		assert.equal(oDomRef.textContent, "H/", "Parent is alone");

		oObserver.disconnect();
		oPatchingControl.destroy();
	});

	QUnit.test("UIArea Rendering", function(assert) {
		var oPatchingControl = new PatchingControl();
		oPatchingControl.placeAt("uiArea1");
		sap.ui.getCore().applyChanges();

		oPatchingControl.setHeader("New Header");
		oPatchingControl.placeAt("uiArea2");
		sap.ui.getCore().applyChanges();

		var oDomRef = oPatchingControl.getDomRef();
		assert.equal(oDomRef.textContent, "New Header", "Header is updated");
		assert.equal(oDomRef.parentNode.id, "uiArea2", "Control is moved to uiArea2");
		assert.equal(document.getElementById("uiArea1").childElementCount, 0, "uiAreaa has no more child");

		oPatchingControl.destroy();
	});

	QUnit.test("No Rendering Output", function(assert) {
		var onBeforeRenderingSpy = sinon.spy();
		var onAfterRenderingSpy = sinon.spy();
		var oRootControl = new PatchingControl({
			header: "R/",
			items: [
				new StringControl({
					header: "S",
					renderNothing: true
				}).addEventDelegate({
					onBeforeRendering: onBeforeRenderingSpy,
					onAfterRendering: onAfterRenderingSpy
				}),
				new PatchingControl({
					header: "P",
					renderNothing: true
				}).addEventDelegate({
					onBeforeRendering: onBeforeRenderingSpy,
					onAfterRendering: onAfterRenderingSpy
				})
			]
		});
		oRootControl.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();
		var oDomRef = oRootControl.getDomRef();

		assert.equal(onAfterRenderingSpy.callCount, 0, "onAfterRendering is not called");
		assert.equal(onBeforeRenderingSpy.callCount, 2, "onBeforeRendering is called");
		assert.equal(oDomRef.textContent, "R/", "Children have no output");

		oRootControl.rerender();
		assert.equal(onAfterRenderingSpy.callCount, 0, "onAfterRendering is not called");
		assert.equal(onBeforeRenderingSpy.callCount, 4, "onBeforeRendering is called");
		assert.equal(oDomRef.textContent, "R/", "Children have still no output");

		oRootControl.getItems()[0].setRenderNothing(false);
		sap.ui.getCore().applyChanges();
		assert.equal(onAfterRenderingSpy.callCount, 1, "onAfterRendering is called");
		assert.equal(onBeforeRenderingSpy.callCount, 6, "onBeforeRendering is called");
		assert.equal(oDomRef.textContent, "R/S", "StringControl child has output");

		oRootControl.getItems()[0].setRenderNothing(true);
		sap.ui.getCore().applyChanges();
		assert.equal(onAfterRenderingSpy.callCount, 1, "onAfterRendering is not called");
		assert.equal(onBeforeRenderingSpy.callCount, 7, "onBeforeRendering is called");
		assert.equal(oDomRef.textContent, "R/", "StringControl has no output anymore");

		oRootControl.getItems()[1].setRenderNothing(false);
		sap.ui.getCore().applyChanges();
		assert.equal(onAfterRenderingSpy.callCount, 2, "onAfterRendering is called");
		assert.equal(onBeforeRenderingSpy.callCount, 9, "onBeforeRendering is called");
		assert.equal(oDomRef.textContent, "R/P", "PatchingControl child has output");

		oRootControl.getItems()[1].setRenderNothing(true);
		sap.ui.getCore().applyChanges();
		assert.equal(onAfterRenderingSpy.callCount, 2, "onAfterRendering is not called");
		assert.equal(onBeforeRenderingSpy.callCount, 10, "onBeforeRendering is called");
		assert.equal(oDomRef.textContent, "R/", "PatchingControl child has no output anymore");

		oRootControl.destroy();
	});

	QUnit.test("Invisible Rendering", function(assert) {
		var onBeforeRenderingSpy = sinon.spy();
		var onAfterRenderingSpy = sinon.spy();
		var oRootControl = new PatchingControl({
			header: "R/",
			items: [
				new StringControl({
					header: "S",
					visible: false
				}).addEventDelegate({
					onBeforeRendering: onBeforeRenderingSpy,
					onAfterRendering: onAfterRenderingSpy
				}).addStyleClass("S"),
				new PatchingControl({
					header: "P",
					visible: false
				}).addEventDelegate({
					onBeforeRendering: onBeforeRenderingSpy,
					onAfterRendering: onAfterRenderingSpy
				}).addStyleClass("P")
			]
		});

		function getInvisibleDomRef(iIndex) {
			return document.getElementById(RenderManager.createInvisiblePlaceholderId(oRootControl.getItems()[0]));
		}

		oRootControl.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();
		var oDomRef = oRootControl.getDomRef();

		assert.equal(onAfterRenderingSpy.callCount, 0, "onAfterRendering is not called");
		assert.equal(onBeforeRenderingSpy.callCount, 2, "onBeforeRendering is called");
		assert.equal(oDomRef.textContent, "R/", "Children have no output");
		assert.ok(getInvisibleDomRef(0), "Invisible placeholder is rendered for the 1st child");
		assert.ok(getInvisibleDomRef(0).classList.contains("sapUiHiddenPlaceholder"), "Invisible placeholder of the 1st child contains sapUiHiddenPlaceholder class");
		assert.notOk(getInvisibleDomRef(0).classList.contains("S"), "Custom style class is not exist for the 1st childs invisible placeholder");
		assert.ok(getInvisibleDomRef(1), "Invisible placeholder is rendered for the 2nd child");
		assert.ok(getInvisibleDomRef(1).classList.contains("sapUiHiddenPlaceholder"), "Invisible placeholder of the 2nd child contains sapUiHiddenPlaceholder class");
		assert.notOk(getInvisibleDomRef(1).classList.contains("P"), "Custom style class is not exist for the 2nd childs invisible placeholder");

		oRootControl.rerender();
		assert.equal(onAfterRenderingSpy.callCount, 0, "onAfterRendering is not called during rerender");
		assert.equal(onBeforeRenderingSpy.callCount, 4, "onBeforeRendering is called during rerender");
		assert.equal(oDomRef.textContent, "R/", "Children have still no output");
		assert.ok(getInvisibleDomRef(0), "Invisible placeholder is rendered for the 1st child");
		assert.ok(getInvisibleDomRef(0).classList.contains("sapUiHiddenPlaceholder"), "Invisible placeholder of the 1st child contains sapUiHiddenPlaceholder class");
		assert.notOk(getInvisibleDomRef(0).classList.contains("S"), "Custom style class is not exist for the 1st childs invisible placeholder");
		assert.ok(getInvisibleDomRef(1), "Invisible placeholder is still exists for the 2nd child");
		assert.ok(getInvisibleDomRef(1).classList.contains("sapUiHiddenPlaceholder"), "Invisible placeholder of the 2nd child contains sapUiHiddenPlaceholder class");
		assert.notOk(getInvisibleDomRef(1).classList.contains("P"), "Custom style class is not exist for the 2nd childs invisible placeholder");

		oRootControl.getItems()[0].setVisible(true);
		sap.ui.getCore().applyChanges();
		assert.equal(onAfterRenderingSpy.callCount, 1, "onAfterRendering is called for string rendering, visible=true");
		assert.equal(onBeforeRenderingSpy.callCount, 5, "onBeforeRendering is called for string rendering, visible=true");
		assert.equal(oDomRef.textContent, "R/S", "StringControl child has output");

		oRootControl.getItems()[0].setVisible(false);
		sap.ui.getCore().applyChanges();
		assert.equal(onAfterRenderingSpy.callCount, 1, "onAfterRendering is not called for string rendering, visible=false");
		assert.equal(onBeforeRenderingSpy.callCount, 6, "onBeforeRendering is called for string rendering, visible=false");
		assert.equal(oDomRef.textContent, "R/", "StringControl has no output anymore");

		oRootControl.getItems()[1].setVisible(true);
		sap.ui.getCore().applyChanges();
		assert.equal(onAfterRenderingSpy.callCount, 2, "onAfterRendering is called  for patching control, visible=true");
		assert.equal(onBeforeRenderingSpy.callCount, 7, "onBeforeRendering is called for patching control, visible=true");
		assert.equal(oDomRef.textContent, "R/P", "PatchingControl child has output");

		oRootControl.getItems()[1].setVisible(false);
		sap.ui.getCore().applyChanges();
		assert.equal(onAfterRenderingSpy.callCount, 2, "onAfterRendering is not called for patching control, visible=false");
		assert.equal(onBeforeRenderingSpy.callCount, 8, "onBeforeRendering is called for patching control, visible=false");
		assert.equal(oDomRef.textContent, "R/", "PatchingControl child has no output anymore");

		oRootControl.destroy();
	});

	QUnit.test("Nested Mixture Rendering", function(assert) {
		var oRootControl = new PatchingControl({
			header: "R/",
			items: [
				new StringControl({
					header: "1S/",
					items: [
						new PatchingControl({
							header: "1.1P/"
						}),
						new StringControl({
							header: "1.2S/"
						})
					]
				}),
				new PatchingControl({
					header: "2P/",
					items: [
						new StringControl({
							header: "2.1S/"
						}),
						new PatchingControl({
							header: "2.2P/"
						})
					]
				})
			]
		});
		oRootControl.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		var oDomRef = oRootControl.getDomRef();
		var oObserver = new MutationObserver(function() {});

		oObserver.observe(oDomRef, {
			characterDataOldValue: true,
			attributeOldValue: true,
			characterData: true,
			attributes: true,
			childList: true,
			subtree: true
		});

		var oDomRef = oRootControl.getDomRef();
		assert.equal(oDomRef.textContent, "R/1S/1.1P/1.2S/2P/2.1S/2.2P/", "Content is correct after initial rendering");

		oRootControl.rerender();
		var aMutations = oObserver.takeRecords();
		assert.equal(aMutations.length, 4, "Only 1S/ and 2.1S/ String controls need to be replaced");
		assert.equal(aMutations[0].addedNodes[0].textContent, "1S/1.1P/1.2S/", "New 1S/ String control is inserted with its children");
		assert.equal(aMutations[1].removedNodes[0].textContent, "1S/1.1P/1.2S/", "Old 1S/ String control is removed with its childre");
		assert.equal(aMutations[2].addedNodes[0].textContent, "2.1S/", "New 2.1S/ String control is inserted");
		assert.equal(aMutations[3].removedNodes[0].textContent, "2.1S/", "Old 2.1S/ String control is removed");
		assert.equal(oDomRef.textContent, "R/1S/1.1P/1.2S/2P/2.1S/2.2P/", "Content is still correct after re-rendering");

		oObserver.disconnect();
		oRootControl.destroy();
	});

	QUnit.test("Preserved Area and Patching", function(assert) {
		var oPatchingControl = new PatchingControl();
		oPatchingControl.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		oPatchingControl.getDomRef().setAttribute("data-sap-ui-preserve", oPatchingControl.getId());
		RenderManager.preserveContent(oPatchingControl.getDomRef(), true);
		oPatchingControl.setHeader("New Header");
		sap.ui.getCore().applyChanges();

		assert.equal(oPatchingControl.getDomRef().textContent, "PatchingControl", "PatchingControl control in the preserved area is not patched");

		oPatchingControl.destroy();
	});

	QUnit.test("apiVersion of Renderers - Old Renderer.extend syntax", function(assert) {
		var StringControlRenderer = StringControl.getMetadata().getRenderer();
		var PatchingControlRenderer = PatchingControl.getMetadata().getRenderer();

		assert.equal(RenderManager.getApiVersion(StringControlRenderer), 1, "apiVersion does not exists on the Renderer");
		assert.equal(RenderManager.getApiVersion(PatchingControlRenderer), 2, "apiVersion is own property of the Renderer");

		var StringControlRenderer1 = Renderer.extend(StringControlRenderer);
		assert.equal(RenderManager.getApiVersion(StringControlRenderer1), 1, "apiVersion does not exists on the base");

		var StringControlRenderer2 = Renderer.extend(StringControlRenderer);
		StringControlRenderer2.apiVersion = 2;
		assert.equal(RenderManager.getApiVersion(StringControlRenderer2), 2, "apiVersion is own property of the subclass");

		var PatchingControlRenderer1 = Renderer.extend(PatchingControlRenderer);
		assert.equal(RenderManager.getApiVersion(PatchingControlRenderer1), 1, "apiVersion is not inherited from the base class");
	});

	QUnit.test("apiVersion of Renderers - New Renderer.extend syntax", function(assert) {
		var StringControlRenderer = Renderer.extend("my.StringControlRenderer", {
			render: function(rm, oControl) {
				rm.write("<div></div>");
			}
		});
		var PatchingControlRenderer = Renderer.extend("my.PatchingControlRenderer", {
			apiVersion: 2,
			render: function(rm, oControl) {
				rm.openStart("div").openEnd().close("div");
			}
		});

		assert.equal(RenderManager.getApiVersion(StringControlRenderer), 1, "apiVersion does not exists on the Renderer");
		assert.equal(RenderManager.getApiVersion(PatchingControlRenderer), 2, "apiVersion is own property of the Renderer");

		var StringControlRenderer1 = StringControlRenderer.extend("my.StringControlRenderer1");
		assert.equal(RenderManager.getApiVersion(StringControlRenderer1), 1, "apiVersion does not exists on the base");

		var StringControlRenderer2 = StringControlRenderer.extend("my.StringControlRenderer2", {
			apiVersion: 2
		});
		assert.equal(RenderManager.getApiVersion(StringControlRenderer2), 2, "apiVersion is own property of the subclass");

		var PatchingControlRenderer1 = PatchingControlRenderer.extend("my.PatchingControlRenderer1");
		assert.equal(RenderManager.getApiVersion(PatchingControlRenderer1), 1, "apiVersion is not inherited from the base class");
	});

	QUnit.test("apiVersion of Renderers - ElementMetadata inheritance", function(assert) {
		var NewStringControl = StringControl.extend("my.NewStringControl", {
			renderer: {}
		});
		var NewPatchingControl = PatchingControl.extend("my.NewPatchingControl", {
			renderer: {}
		});
		var NewestPatchingControl = PatchingControl.extend("my.NewPatchingControl", {
			renderer: {
				doSomething: function() {}
			}
		});

		var NewStringControlRenderer = NewStringControl.getMetadata().getRenderer();
		var NewPatchingControlRenderer = NewPatchingControl.getMetadata().getRenderer();
		var NewestPatchingControlRenderer = NewestPatchingControl.getMetadata().getRenderer();

		assert.equal(RenderManager.getApiVersion(NewStringControlRenderer), 1, "apiVersion does not exists on the Renderer, so default value is returned");
		assert.equal(RenderManager.getApiVersion(NewPatchingControlRenderer), 1, "apiVersion is not inherited from the base class");
		assert.equal(RenderManager.getApiVersion(NewestPatchingControlRenderer), 1, "apiVersion is not inherited from the base class");
	});

	QUnit.test("Focus Handler for Patching Controls", function(assert) {
		var oChild1 = new PatchingControl({
			header: "1P"
		});
		var oChild2 = new PatchingControl({
			header: "2P"
		});
		var oRootControl = new PatchingControl({
			header: "R/",
			items: [
				oChild1, oChild2
			]
		});
		oRootControl.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		var oChild1GetFocusInfoSpy = sinon.spy(oChild1, "getFocusInfo");
		var oChild1ApplyFocusInfoSpy = sinon.spy(oChild1, "applyFocusInfo");
		var oChild2GetFocusInfoSpy = sinon.spy(oChild2, "getFocusInfo");
		var oChild2ApplyFocusInfoSpy = sinon.spy(oChild2, "applyFocusInfo");

		oChild1.focus();
		oChild1.rerender();
		assert.ok(oChild1GetFocusInfoSpy.called, "Child1.getFocusInfo is called");
		assert.ok(oChild1ApplyFocusInfoSpy.called, "Child1.applyFocusInfo is called");
		assert.equal(document.activeElement, oChild1.getFocusDomRef(), "Child1 has still focus after rendering");

		oChild2.rerender();
		assert.notOk(oChild2GetFocusInfoSpy.called, "Child2.getFocusInfo is not called");
		assert.notOk(oChild2ApplyFocusInfoSpy.called, "Child2.applyFocusInfo is not called");
		assert.equal(document.activeElement, oChild1.getFocusDomRef(), "Child1 has still focus after Child2 rendering");

		oChild2.focus();
		oRootControl.rerender();
		assert.ok(oChild2GetFocusInfoSpy.called, "Child2.getFocusInfo is called");
		assert.ok(oChild2ApplyFocusInfoSpy.called, "Child2.applyFocusInfo is called");
		assert.equal(document.activeElement, oChild2.getFocusDomRef(), "Child2 has still focus after parent rendering");

		oChild1GetFocusInfoSpy.restore();
		oChild1ApplyFocusInfoSpy.restore();
		oChild2GetFocusInfoSpy.restore();
		oChild2ApplyFocusInfoSpy.restore();
		oRootControl.destroy();
	});

});
