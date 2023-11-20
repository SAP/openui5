
/* global QUnit, sinon */
sap.ui.define([
	"sap/base/Log",
	"sap/ui/core/Control",
	"sap/ui/core/Element",
	"sap/ui/core/HTML",
	"sap/ui/core/UIArea",
	"sap/ui/core/UIAreaRegistry",
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/ui/testlib/TestButton",
	"sap/ui/test/actions/Press",
	"sap/ui/thirdparty/jquery"
], function(Log, Control, Element, HTML, UIArea, UIAreaRegistry, createAndAppendDiv, nextUIUpdate, TestButton, Press, jQuery) {
	"use strict";

	createAndAppendDiv("uiArea1");

	var innerSpan = document.createElement("span");
	innerSpan.textContent = "Before";
	createAndAppendDiv("uiArea2");
	jQuery("#uiArea2")[0].appendChild(innerSpan);

	QUnit.module("Rendering", {
		before: function () {
			this.oText1 = new TestButton("text1", {
				text: "Text 1"
			});
			this.oText2 = new TestButton("text2", {
				text: "Text 2"
			});
			this.oHtml3 = new HTML("html3", {
				content: "<div></div>"
			});
		},
		after: function () {
			this.oText1.destroy();
			this.oText2.destroy();
			this.oHtml3.destroy();
		}
	});


	/**
	 * Adds two controls to an empty UIArea and renders it.
	 * After rendering, the two controls should be visible in the UIArea
	 * their order should match the order in which they have been added
	 */
	QUnit.test("basic rendering", async function(assert) {
		this.oText1.placeAt("uiArea1");
		this.oText2.placeAt("uiArea1");
		await nextUIUpdate();
		assert.equal(jQuery("#uiArea1 > button").length, 2, "two spans have been rendered");
		assert.equal(jQuery(jQuery("#uiArea1 > button").get(0)).text(), "Text 1", "first span shows first text");
		assert.equal(jQuery(jQuery("#uiArea1 > button").get(1)).text(), "Text 2", "second span shows second text");
	});

	/**
	 * Removes the controls from the UIArea
	 * UIArea must be empty after the rendering
	 */
	QUnit.test("removeAllContent", async function(assert) {
		UIAreaRegistry.get("uiArea1").removeAllContent();
		await nextUIUpdate();
		assert.equal(jQuery("#uiArea1").children().length, 0, "no more content");
		assert.ok(Element.getElementById("text1"), "remove must not destroy child 1");
		assert.ok(Element.getElementById("text2"), "remove must not destroy child 2");
	});

	/**
	 * Test where an UIArea already has some DOM content
	 * Rendering after addiition or removal of controls must not destroy
	 * the content nor modify its order
	 */
	QUnit.test("initial DOM content", async function(assert) {
		var $originalDom = jQuery("#uiArea2").children();
		assert.equal($originalDom.length, 1, "precondition: one span exists already in UIArea");
		assert.equal(jQuery($originalDom.get(0)).text(), "Before", "precondition: span contains correct text");

		this.oText1.placeAt("uiArea2");
		this.oText2.placeAt("uiArea2");
		await nextUIUpdate();
		var $currentDom = jQuery("#uiArea2").children();
		assert.equal($currentDom.length, 3, "two more spans have been rendered");
		assert.equal($currentDom.get(0), $originalDom.get(0), "initial DOM must still exist");
		assert.equal(jQuery($currentDom.get(0)).text(), "Before", "initial DOM must still exist");
		assert.equal(jQuery($currentDom.get(1)).text(), "Text 1", "first span shows first text");
		assert.equal(jQuery($currentDom.get(2)).text(), "Text 2", "second span shows second text");

		UIAreaRegistry.get("uiArea2").removeAllContent();
		await nextUIUpdate();
		$currentDom = jQuery("#uiArea2").children();
		assert.equal($currentDom.length, 1, "initial DOM still exists in UIArea");
		assert.equal(jQuery($currentDom.get(0)).text(), "Before", "initial span still contains correct text");
	});

	/**
	 * When additional pure DOM content is added to an UIArea,
	 * that content must not be modified by the UIArea rerendering
	 */
	QUnit.test("additional DOM content", async function(assert) {
		// check preconditions
		var $originalDom = jQuery("#uiArea2").children();
		assert.equal($originalDom.length, 1, "precondition: one span exists already in UIArea");
		assert.equal(jQuery($originalDom.get(0)).text(), "Before", "precondition: span contains correct text");
		assert.ok(Element.getElementById("text1"), "precondition: control 1 still exists");
		assert.ok(!Element.getElementById("text1").getParent(), "precondition: control 1 not bound");
		assert.ok(Element.getElementById("text2"), "precondition: control 2 still exists");
		assert.ok(!Element.getElementById("text2").getParent(), "precondition: control 2 not bound");

		// do some interleaved modifications: Control / DOM / Control / DOM
		this.oText1.placeAt("uiArea2");
		await nextUIUpdate();
		jQuery("#uiArea2").append("<span>In Between</span>");
		this.oText2.placeAt("uiArea2");
		await nextUIUpdate();
		jQuery("#uiArea2").append("<span>After</span>");

		// check results. Note: controls are rendered in one, contiguous block
		var $currentDom = jQuery("#uiArea2").children();
		assert.equal($currentDom.length, 5, "3 spans by dom manip, 2 rendered");
		assert.equal($currentDom.get(0), $originalDom.get(0), "initial DOM must still exist");
		assert.equal(jQuery($currentDom.get(0)).text(), "Before", "initial DOM must still exist");
		assert.equal(jQuery($currentDom.get(1)).text(), "In Between", "3rd span shows dynamically added text");
		assert.equal(jQuery($currentDom.get(2)).text(), "Text 1", "next span shows first control text");
		assert.equal(jQuery($currentDom.get(3)).text(), "Text 2", "4th span shows second control text");
		assert.equal(jQuery($currentDom.get(4)).text(), "After", "last span shows dynamically added end");

		// now remove controls, check that the remainigs are as expected
		UIAreaRegistry.get("uiArea2").removeAllContent();
		await nextUIUpdate();
		$currentDom = jQuery("#uiArea2").children();
		assert.equal($currentDom.length, 3, "initial DOM still exists in UIArea");
		assert.equal(jQuery($currentDom.get(0)).text(), "Before", "initial span still contains correct text");
		assert.equal(jQuery($currentDom.get(1)).text(), "In Between", "second span shows second text");
		assert.equal(jQuery($currentDom.get(2)).text(), "After", "first span shows first text");
	});

	/**
	 * When the UIArea contains a control that preserves its DOM,
	 * then rerendering of the UIArea must not delete such preserved DOM
	 */
	QUnit.test("preserved DOM content", async function(assert) {
		assert.ok(Element.getElementById("text1"), "precondition: control 1 still exists");
		assert.ok(!Element.getElementById("text1").getParent(), "precondition: control 1 not bound");
		assert.ok(Element.getElementById("text2"), "precondition: control 2 still exists");
		assert.ok(!Element.getElementById("text2").getParent(), "precondition: control 2 not bound");
		var $originalDom = jQuery("#uiArea1").children();
		assert.equal($originalDom.length, 0, "precondition: UIArea1 is empty");

		// ---- aspect 1: add controls and render ----
		this.oText1.placeAt("uiArea1");
		this.oText2.placeAt("uiArea1");
		this.oHtml3.placeAt("uiArea1");
		await nextUIUpdate();

		// check that the rendering had the expected result
		var $currentDom = jQuery("#uiArea1").children();
		assert.equal($currentDom.length, 3, "3 items rendered");
		assert.equal(jQuery($currentDom.get(0)).text(), "Text 1", "first control rendered");
		assert.equal(jQuery($currentDom.get(1)).text(), "Text 2", "second control rendered");
		assert.equal(jQuery($currentDom.get(2))[0].tagName, "DIV", "3rd control rendered");

		// ---- aspect 2: modify the DOM of the HTML control ----
		jQuery("#html3").css("background-color", "blue");
		jQuery("#html3").css("width", "128px");
		assert.equal(jQuery($currentDom.get(2)).css('width'), "128px", "width changed");

		// rerender the whole UIArea
		this.oText1.getUIArea().invalidate();
		await nextUIUpdate();

		// check that the modified DOM is still there
		assert.equal(jQuery($currentDom.get(0)).text(), "Text 1", "first control rendered");
		assert.equal(jQuery($currentDom.get(1)).text(), "Text 2", "second control rendered");
		assert.equal(jQuery($currentDom.get(2))[0].tagName, "DIV", "3rd control rendered");
		assert.equal(jQuery($currentDom.get(2)).css('width'), "128px", "width changed");
		// TODO check for same DOM object

		// ---- aspect 3: remove all content must not delete the preserved dOM ----

		// remove content and rerender
		UIAreaRegistry.get("uiArea1").removeAllContent();
		await nextUIUpdate();

		// check that UIArea is empoty, but preserved content still exists
		$currentDom = jQuery("#uiArea1").children();
		assert.equal($currentDom.length, 0, "no more DOM in the UIArea");
		var $preserved = jQuery("#html3");
		assert.equal($preserved.length, 1, "preserved html still exists");
		assert.equal($preserved[0].parentNode.id, "sap-ui-preserve", "preserved DOM is in preserve area");

	});



	QUnit.module("Event Handling", {
		beforeEach: function() {
			this.oButton = new TestButton().placeAt("uiArea1");
			this.spy(Log, "debug");
			this.fakeEvent = function fakeEvent(type) {
				return new jQuery.Event(new jQuery.Event(type), { target: this.oButton.getDomRef() });
			};
			this.hasBeenLogged = function hasBeenLogged(oEvent, oElement) {
				return Log.debug.calledWith(
					sinon.match(/Event fired:/).and(sinon.match(oEvent.type).and(sinon.match(oElement.toString()))));
				};
			return nextUIUpdate();
		},
		afterEach: function() {
			this.oButton.destroy();
		}
	});

	QUnit.test("Logging (default config, normal event)", function(assert) {
		// Prepare
		var oEvent = this.fakeEvent("click");

		// Act
		this.oButton.getUIArea()._handleEvent(oEvent);

		// assert
		assert.ok(this.hasBeenLogged(oEvent, this.oButton), "Event ''click'' should have been logged");
	});

	QUnit.test("Logging (default config, verbose event)", function(assert) {
		// Prepare
		var oEvent = this.fakeEvent("mouseover");

		// Act
		this.oButton.getUIArea()._handleEvent(oEvent);

		// assert
		assert.notOk(this.hasBeenLogged(oEvent, this.oButton), "Event 'mouseover' should not have been logged");
	});

	QUnit.test("Logging (custom config, normal event)", function(assert) {
		// Prepare
		var oEvent = this.fakeEvent("click");

		// Act
		var oResultingConfig = UIArea.configureEventLogging({click: 1});
		this.oButton.getUIArea()._handleEvent(oEvent);

		// assert
		assert.equal(oResultingConfig.click, true);
		assert.equal(oResultingConfig.mouseover, true);
		assert.notOk(this.hasBeenLogged(oEvent, this.oButton), "Event 'click' should not have been logged");

		// cleanup
		UIArea.configureEventLogging({click: 0});
	});

	QUnit.test("Logging (custom config, verbose event)", function(assert) {
		// Prepare
		var oEvent = this.fakeEvent("mouseover");

		// Act
		var oResultingConfig = UIArea.configureEventLogging({mouseover: 0});
		this.oButton.getUIArea()._handleEvent(oEvent);

		// assert
		assert.equal(oResultingConfig.click, false);
		assert.equal(oResultingConfig.mouseover, false);
		assert.ok(this.hasBeenLogged(oEvent, this.oButton), "Event 'mouseover' should have been logged");

		// cleanup
		UIArea.configureEventLogging({mouseover: 1});
	});

	QUnit.test("Control Events should be blocked depending on UIArea lock", function(assert) {
		let bPressed = false;
		const oPress = new Press();
		const fnPress = () => {
			bPressed = true;
		};

		this.oButton.getUIArea().lock();
		this.oButton.attachPress(fnPress);

		assert.ok(!bPressed, "Button must not have fired 'press' yet");
		oPress.executeOn(this.oButton);
		assert.ok(!bPressed, "Button still must not have fired 'press'");

		this.oButton.getUIArea().unlock();

		assert.ok(!bPressed, "Button still must not have fired 'press'");
		oPress.executeOn(this.oButton);
		assert.ok(bPressed, "Button should have fired 'press'");

		this.oButton.detachPress(fnPress);
	});


	QUnit.module("Dependents", {
		beforeEach: function() {
			new Control().placeAt("uiArea1").destroy();
			var oControl = new Control();
			UIAreaRegistry.get("uiArea1").addDependent(oControl);
			this.uiArea = oControl.getUIArea();
			this.uiArea.addDependent(new Control());
			this.spy(this.uiArea, "invalidate");
		},
		afterEach: function(assert) {
			assert.notOk(this.uiArea.invalidate.called, "...then the UIArea should not invalidate");
		}
	});

	QUnit.test("When an item is added...", function(assert) {
		this.uiArea.addDependent(new Control());
	});

	QUnit.test("When an item is inserted...", function(assert) {
		this.uiArea.insertDependent(new Control(), 0);
	});

	QUnit.test("When an item is removed...", function(assert) {
		this.uiArea.removeDependent(0);
	});

	QUnit.test("When all items are removed...", function(assert) {
		this.uiArea.removeAllDependents();
	});

	QUnit.test("When all items are destroyed...", function(assert) {
		this.uiArea.destroyDependents();
	});

	QUnit.test("When an item is added twice...", function(assert) {
		this.uiArea.addDependent(this.uiArea.getDependents()[0]);
	});

	QUnit.test("When an item is inserted twice...", function(assert) {
		this.uiArea.insertDependent(0, this.uiArea.getDependents()[1]);
	});

	QUnit.test("When an item is destroyed...", function(assert) {
		this.uiArea.getDependents()[0].destroy();
	});

	QUnit.test("When an item is moved to another parent...", function(assert) {
		var oOther = new Control();
		oOther.addDependent(this.uiArea.getDependents()[0]);
	});


	var TestControl = Control.extend("test.TestControl", {
		metadata: {
			properties: {
				header: {type: "string"}
			},
			aggregations: {
				items: {type: "test.TestControl", multiple: true}
			}
		},
		renderer: {
			apiVersion: 2,
			render: function (oRM, oControl) {
				oRM.openStart("div", oControl).openEnd();
				oRM.openStart("h1").openEnd().text(oControl.getHeader()).close("h1");
				oControl.getItems().forEach(oRM.renderControl, oRM);
				oRM.close("div");
			}
		}
	});

	QUnit.module("supressInvalidateFor", {
		before: function() {
			this.oRenderingSpy = sinon.spy(Control.prototype, "onBeforeRendering");
		},
		beforeEach: async function () {
			this.oGrandChild1 = new TestControl({ header: "GrandChild1" });
			this.oGrandChild2 = new TestControl({ header: "GrandChild2" });
			this.oChild1 = new TestControl({ header: "Child1", items: this.oGrandChild1 });
			this.oChild2 = new TestControl({ header: "Child2", items: this.oGrandChild2 });
			this.oParent = new TestControl({
				header: "Parent",
				items: [this.oChild1, this.oChild2]
			});
			this.oParent.placeAt("uiArea1");
			await nextUIUpdate();

			this.oRenderingSpy.reset();
			this.oUiArea = this.oParent.getUIArea();
		},
		afterEach: function () {
			this.oParent.destroy();
		},
		after: function() {
			this.oRenderingSpy.restore();
		}
	});

	QUnit.test("Invalid calls", function(assert) {
		[false, true, 5, "test", {}, jQuery, new Element(), this.oUiArea].forEach(function(vCallParam) {
			assert.throws(function() {
				this.oUiArea.suppressInvalidationFor(vCallParam);
			}, "TypeError is thrown for the parameter: " + vCallParam);
			assert.throws(function() {
				this.oUiArea.resumeInvalidationFor(vCallParam);
			}, "TypeError is thrown for the parameter: " + vCallParam);
		});
		assert.throws(function() {
			this.oUiArea.resumeInvalidationFor(this.oParent);
		}, "Error is thrown since the invalidation has not yet been suppressed");
	});

	QUnit.test("Return value of suppressInvalidationFor", function(assert) {
		assert.strictEqual(this.oUiArea.suppressInvalidationFor(this.oParent), true, "Invalidation is correctly suppressed");
		assert.strictEqual(this.oUiArea.suppressInvalidationFor(this.oParent), false, "Invalidation was already suppressed");
	});

	QUnit.test("Invalidate all children", async function(assert) {
		this.oUiArea.suppressInvalidationFor(this.oParent);
		this.oUiArea.suppressInvalidationFor(this.oParent);
		this.oParent.findElements(true, function(oElement) {
			oElement.invalidate();
		});
		this.oParent.invalidate();
		await nextUIUpdate();
		assert.equal(this.oRenderingSpy.callCount, 0);

		this.oUiArea.resumeInvalidationFor(this.oParent);
		await nextUIUpdate();
		assert.equal(this.oRenderingSpy.callCount, 5);
	});

	QUnit.test("Invalidate a single leaf control", async function(assert) {
		this.oUiArea.suppressInvalidationFor(this.oParent);
		this.oGrandChild1.invalidate();
		await nextUIUpdate();
		assert.equal(this.oRenderingSpy.callCount, 0);

		this.oUiArea.resumeInvalidationFor(this.oParent);
		await nextUIUpdate();
		assert.equal(this.oRenderingSpy.callCount, 1);
	});

	QUnit.test("Suppress invalidation for different roots", async function(assert) {
		var oCloneParent = this.oParent.clone();
		oCloneParent.placeAt("uiArea1");
		await nextUIUpdate();
		this.oRenderingSpy.reset();

		this.oUiArea.suppressInvalidationFor(this.oParent);
		this.oUiArea.suppressInvalidationFor(oCloneParent);

		this.oChild1.invalidate();
		await nextUIUpdate();
		assert.equal(this.oRenderingSpy.callCount, 0);

		oCloneParent.getItems()[0].invalidate();
		await nextUIUpdate();
		assert.equal(this.oRenderingSpy.callCount, 0);

		this.oUiArea.resumeInvalidationFor(this.oParent);
		await nextUIUpdate();
		assert.equal(this.oRenderingSpy.callCount, 2);
		this.oRenderingSpy.reset();

		this.oUiArea.resumeInvalidationFor(oCloneParent);
		await nextUIUpdate();
		assert.equal(this.oRenderingSpy.callCount, 2);
		oCloneParent.destroy("uiArea1");
	});

	QUnit.test("parent rendering", async function(assert) {
		this.oUiArea.suppressInvalidationFor(this.oChild1);
		this.oGrandChild1.invalidate();
		await nextUIUpdate();
		assert.equal(this.oRenderingSpy.callCount, 0);

		this.oParent.invalidate();
		await nextUIUpdate();
		this.oRenderingSpy.reset();
		this.oUiArea.resumeInvalidationFor(this.oChild1);
		await nextUIUpdate();
		assert.equal(this.oRenderingSpy.callCount, 0);
	});

	QUnit.test("bookkeeping cleanup", async function(assert) {
		this.oUiArea.suppressInvalidationFor(this.oParent);
		this.oParent.invalidate();
		this.oGrandChild1.invalidate();
		this.oUiArea.suppressInvalidationFor(this.oChild1);
		this.oGrandChild1.invalidate();
		this.oUiArea.suppressInvalidationFor(this.oGrandChild1);
		this.oGrandChild1.invalidate();
		await nextUIUpdate();
		assert.equal(this.oRenderingSpy.callCount, 0);

		this.oUiArea.resumeInvalidationFor(this.oParent);
		await nextUIUpdate();
		assert.ok(this.oRenderingSpy.called);
		this.oRenderingSpy.reset();

		this.oUiArea.resumeInvalidationFor(this.oChild1);
		await nextUIUpdate();
		assert.equal(this.oRenderingSpy.callCount, 0);

		this.oUiArea.resumeInvalidationFor(this.oGrandChild1);
		await nextUIUpdate();
		assert.equal(this.oRenderingSpy.callCount, 0);
	});

	QUnit.test("nested suppressed controls - the child resumes invalidation before the parent", async function(assert) {
		this.oDeepestChild1 = new TestControl({ header: "DeepestChild1" });
		this.oGrandChild1.addItem(this.oDeepestChild1);
		await nextUIUpdate();
		this.oRenderingSpy.reset();

		this.oUiArea.suppressInvalidationFor(this.oParent);
		this.oUiArea.suppressInvalidationFor(this.oGrandChild1);
		this.oDeepestChild1.invalidate();
		this.oChild1.invalidate();
		await nextUIUpdate();
		assert.equal(this.oRenderingSpy.callCount, 0);

		this.oUiArea.resumeInvalidationFor(this.oGrandChild1);
		await nextUIUpdate();
		assert.equal(this.oRenderingSpy.callCount, 0);

		this.oUiArea.resumeInvalidationFor(this.oParent);
		await nextUIUpdate();
		assert.equal(this.oRenderingSpy.callCount, 3);
	});

	QUnit.test("nested suppressed controls - the parent resumes invalidation before the child", async function(assert) {
		this.oDeepestChild1 = new TestControl({ header: "DeepestChild1" });
		this.oGrandChild1.addItem(this.oDeepestChild1);
		await nextUIUpdate();
		this.oRenderingSpy.reset();

		this.oUiArea.suppressInvalidationFor(this.oParent);
		this.oUiArea.suppressInvalidationFor(this.oGrandChild1);
		this.oDeepestChild1.invalidate();
		this.oChild1.invalidate();
		await nextUIUpdate();
		assert.equal(this.oRenderingSpy.callCount, 0);

		this.oUiArea.resumeInvalidationFor(this.oParent);
		await nextUIUpdate();
		assert.equal(this.oRenderingSpy.callCount, 3);
		this.oRenderingSpy.reset();

		this.oUiArea.resumeInvalidationFor(this.oGrandChild1);
		await nextUIUpdate();
		assert.equal(this.oRenderingSpy.callCount, 0);
	});
});
