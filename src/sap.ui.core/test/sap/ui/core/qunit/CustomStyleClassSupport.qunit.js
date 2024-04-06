/*global QUnit, sinon */
// load Parameters API to test ThemeScopingChanged event
sap.ui.define([
	"sap/ui/core/Control",
	"sap/ui/core/Theming",
	"sap/ui/core/theming/Parameters",
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/qunit/utils/nextUIUpdate"
], async function(Control, Theming, Parameters, createAndAppendDiv, nextUIUpdate) {
	"use strict";

	var oMyControl, aCurrentDOMClasses, aCurrentAPIClasses;
	createAndAppendDiv("content");

	// initiate parameter loading to enable event
	// this should normally happen in the control which listens to the event
	// also wait for the result so that the scope check in CustomStyleClassSupport can work
	await new Promise((resolve) => {
		Theming.attachApplied(() => {
			const value = Parameters.get({
				name : "sapUiTstTextColor", // a parameter which is defined by sap.ui.testlib only
				callback: resolve
			});
			if ( value !== undefined ) {
				resolve();
			}
		});
	});

	// define control
	var MyControlClass = Control.extend("my.lib.MyControl", {
		metadata: {},

		constructor: function(sId, assert) {
			Control.call(this, sId);
			this._assert = assert;
		},

		renderer: {
			apiVersion: 2,
			render: function(rm, ctrl) {
				ctrl._assert.ok(true, "Renderer was called");
				rm.openStart("span", ctrl).attr("tabindex", "0").openEnd();
					rm.text("test");
				rm.close("span");
			}
		}
	});

	QUnit.module("CustomStyleClassSupport", {
		onThemeScopingChanged: function() {
			var oDomRef = oMyControl.getDomRef();
			aCurrentDOMClasses = oDomRef ? Array.prototype.slice.call(oDomRef.classList) : [];
			aCurrentAPIClasses = oMyControl.aCustomStyleClasses;
		},
		beforeEach: function(assert) {

			Theming.attachThemeScopingChanged(this.onThemeScopingChanged);

			this.fireThemeScopingChangedSpy = sinon.spy(Theming, "fireThemeScopingChanged");

			oMyControl = new MyControlClass("myControl", assert);

			oMyControl.placeAt("content");
			return nextUIUpdate();
		},
		afterEach: function() {

			Theming.detachThemeScopingChanged(this.onThemeScopingChanged);

			this.fireThemeScopingChangedSpy.restore();
			this.fireThemeScopingChangedSpy = null;

			oMyControl.destroy();
		}
	});

	QUnit.test("call hasStyleClass before add any class", function(assert) {
		var sMyClass = "abc";

		assert.expect(4); // control shouldn't rerender itself

		assert.equal(oMyControl.hasStyleClass(sMyClass), false, "control should not have the class");
		assert.equal(oMyControl.$().hasClass(sMyClass), false, "class should not be in HTML");

		// ThemeScopingChanged Event should not be fired
		sinon.assert.notCalled(this.fireThemeScopingChangedSpy);
	});

	QUnit.test("call hasStyleClass with whitespace", function(assert) {
		assert.equal(oMyControl.hasStyleClass(" "), false, "white space should be ignored");

		// ThemeScopingChanged Event should not be fired
		sinon.assert.notCalled(this.fireThemeScopingChangedSpy);
	});

	QUnit.test("call addStyleClass with whitespaces and check with hasStyleClass", function(assert) {
		oMyControl.addStyleClass("\r \n \t \f  ");

		assert.equal(oMyControl.$()[0].className, "", "class in HTML shouldn't be changed");
		assert.equal(oMyControl.hasStyleClass(" "), false, "White space(s) class name should be ignored");
		assert.equal(oMyControl.hasStyleClass("\r"), false, "White space(s) class name should be ignored");
		assert.equal(oMyControl.hasStyleClass("\n"), false, "White space(s) class name should be ignored");
		assert.equal(oMyControl.hasStyleClass("\t"), false, "White space(s) class name should be ignored");
		assert.equal(oMyControl.hasStyleClass("\f"), false, "White space(s) class name should be ignored");
		assert.equal(oMyControl.hasStyleClass("\r \n \t \f  "), false, "White space(s) class name should be ignored");

		// ThemeScopingChanged Event should not be fired
		sinon.assert.notCalled(this.fireThemeScopingChangedSpy);
	});

	QUnit.test("add a single class", function(assert) {
		var sMyClass = "abc";

		assert.expect(5); // this also verifies there is no rerendering

		oMyControl.addStyleClass(sMyClass);

		assert.equal(oMyControl.hasStyleClass(sMyClass), true, "control should now have the class");
		assert.equal(oMyControl.hasStyleClass(" "), false, "white space class should be ignored");
		assert.equal(oMyControl.$().hasClass(sMyClass), true, "class should now be in HTML");

		// ThemeScopingChanged Event should not be fired
		sinon.assert.notCalled(this.fireThemeScopingChangedSpy);
	});

	QUnit.test("remove an added class", function(assert) {
		var sMyClass = "abc";

		oMyControl.addStyleClass(sMyClass);

		assert.expect(4); // this also verifies there is no rerendering

		oMyControl.removeStyleClass(sMyClass);

		// remove white space class shouldn't have any effect
		oMyControl.removeStyleClass(" ");

		assert.equal(oMyControl.hasStyleClass(sMyClass), false, "control should not have the class");
		assert.equal(oMyControl.$().hasClass(sMyClass), false, "class should not be in HTML");

		oMyControl.removeStyleClass(sMyClass); // should not cause an error or rendering

		// ThemeScopingChanged Event should not be fired
		sinon.assert.notCalled(this.fireThemeScopingChangedSpy);
	});

	QUnit.test("toggle style class without bAdd", function(assert) {
		var sMyClass = "abc";

		assert.expect(6); // this also verifies there is no rerendering

		oMyControl.toggleStyleClass(sMyClass);

		assert.equal(oMyControl.hasStyleClass(sMyClass), true, "control should now have the class");
		assert.equal(oMyControl.$().hasClass(sMyClass), true, "class should now be in HTML");

		oMyControl.toggleStyleClass(sMyClass);

		assert.equal(oMyControl.hasStyleClass(sMyClass), false, "control should not have the class");
		assert.equal(oMyControl.$().hasClass(sMyClass), false, "class should not be in HTML");

		// ThemeScopingChanged Event should not be fired
		sinon.assert.notCalled(this.fireThemeScopingChangedSpy);
	});

	QUnit.test("toggle style class with bAdd", function(assert) {
		var sMyClass = "abc";

		assert.expect(6); // this also verifies there is no rerendering

		oMyControl.toggleStyleClass(sMyClass, true);

		assert.equal(oMyControl.hasStyleClass(sMyClass), true, "control should now have the class");
		assert.equal(oMyControl.$().hasClass(sMyClass), true, "class should now be in HTML");

		oMyControl.toggleStyleClass(sMyClass, false);

		assert.equal(oMyControl.hasStyleClass(sMyClass), false, "control should not have the class");
		assert.equal(oMyControl.$().hasClass(sMyClass), false, "class should not be in HTML");

		// ThemeScopingChanged Event should not be fired
		sinon.assert.notCalled(this.fireThemeScopingChangedSpy);
	});

	QUnit.test("call addStyleClass twice with the same class", function(assert) {
		var sMyClass = "abc";

		assert.expect(5); // this also verifies there is no rerendering

		oMyControl.addStyleClass(sMyClass);
		oMyControl.addStyleClass(sMyClass);

		assert.equal(oMyControl.$()[0].className, "abc", "class should be in HTML only once");

		oMyControl.removeStyleClass(sMyClass);

		assert.equal(oMyControl.hasStyleClass(sMyClass), false, "control should not have the class");
		assert.equal(oMyControl.$().hasClass(sMyClass), false, "class should not be in HTML");

		// ThemeScopingChanged Event should not be fired
		sinon.assert.notCalled(this.fireThemeScopingChangedSpy);
	});

	QUnit.test("add two classes within one addStyleClass call and then remove them together in one removeStyleClass call", function(assert) {
		var sMyClass = "abc",
			sMyClass1 = "bcd",
			sCombinedClass = sMyClass + " " + sMyClass1;

		oMyControl.addStyleClass(sCombinedClass);
		oMyControl.removeStyleClass(""); // call with empty string shouldn't have any effect

		assert.equal(oMyControl.hasStyleClass(sCombinedClass), true, "control should now have the combined class " + sCombinedClass);
		assert.equal(oMyControl.$().hasClass(sCombinedClass), true, "class should now be in HTML");

		assert.equal(oMyControl.hasStyleClass(sMyClass), true, "control should now have the class " + sMyClass);
		assert.equal(oMyControl.$().hasClass(sMyClass), true, "class should now be in HTML");

		assert.equal(oMyControl.hasStyleClass(sMyClass1), true, "control should now have the class " + sMyClass);
		assert.equal(oMyControl.$().hasClass(sMyClass1), true, "class should now be in HTML");


		oMyControl.removeStyleClass(sCombinedClass + " unknownClass"); // remove unknown class shouldn't have any effect

		assert.equal(oMyControl.hasStyleClass(sCombinedClass), false, "control should not have the combined class " + sCombinedClass);
		assert.equal(oMyControl.$().hasClass(sCombinedClass), false, "class should not be in HTML");

		assert.equal(oMyControl.hasStyleClass(sMyClass), false, "control should not have the class " + sMyClass);
		assert.equal(oMyControl.$().hasClass(sMyClass), false, "class should not be in HTML");

		assert.equal(oMyControl.hasStyleClass(sMyClass1), false, "control should not have the class " + sMyClass1);
		assert.equal(oMyControl.$().hasClass(sMyClass1), false, "class should not be in HTML");

		// ThemeScopingChanged Event should not be fired
		sinon.assert.notCalled(this.fireThemeScopingChangedSpy);
	});

	QUnit.test("add two classes within one addStyleClass call and then remove them one by one", function(assert) {
		var sMyClass = "abc",
			sMyClass1 = "bcd",
			sCombinedClass = sMyClass + " " + sMyClass1;

		oMyControl.addStyleClass(sCombinedClass);
		oMyControl.removeStyleClass(""); // call with empty string shouldn't have any effect

		assert.equal(oMyControl.hasStyleClass(sCombinedClass), true, "control should now have the combined class " + sCombinedClass);
		assert.equal(oMyControl.$().hasClass(sCombinedClass), true, "class should now be in HTML");

		assert.equal(oMyControl.hasStyleClass(sMyClass), true, "control should now have the class " + sMyClass);
		assert.equal(oMyControl.$().hasClass(sMyClass), true, "class should now be in HTML");

		assert.equal(oMyControl.hasStyleClass(sMyClass1), true, "control should now have the class " + sMyClass);
		assert.equal(oMyControl.$().hasClass(sMyClass1), true, "class should now be in HTML");


		oMyControl.removeStyleClass(sMyClass1 + " unknownClass"); // remove unknown class shouldn't have any effect

		assert.equal(oMyControl.hasStyleClass(sCombinedClass), false, "control should not have the combined class " + sCombinedClass);
		assert.equal(oMyControl.$().hasClass(sCombinedClass), false, "class should not be in HTML");

		assert.equal(oMyControl.hasStyleClass(sMyClass), true, "control should still have the class " + sMyClass);
		assert.equal(oMyControl.$().hasClass(sMyClass), true, "class should still be in HTML");

		assert.equal(oMyControl.hasStyleClass(sMyClass1), false, "control should not have the class " + sMyClass1);
		assert.equal(oMyControl.$().hasClass(sMyClass1), false, "class should not be in HTML");


		oMyControl.removeStyleClass(sMyClass + " unknownClass"); // remove unknown class shouldn't have any effect

		assert.equal(oMyControl.hasStyleClass(sCombinedClass), false, "control should not have the combined class " + sCombinedClass);
		assert.equal(oMyControl.$().hasClass(sCombinedClass), false, "class should not be in HTML");

		assert.equal(oMyControl.hasStyleClass(sMyClass), false, "control should not have the class " + sMyClass);
		assert.equal(oMyControl.$().hasClass(sMyClass), false, "class should not be in HTML");

		assert.equal(oMyControl.hasStyleClass(sMyClass1), false, "control should not have the class " + sMyClass1);
		assert.equal(oMyControl.$().hasClass(sMyClass1), false, "class should not be in HTML");

		// ThemeScopingChanged Event should not be fired
		sinon.assert.notCalled(this.fireThemeScopingChangedSpy);
	});

	QUnit.test("Cloned Control should still have the added classes", function(assert) {
		var sMyClass = "abc",
			sMyClass1 = "bcd",
			sCombinedClass = sMyClass + " " + sMyClass1,
			oClonedControl;

		oMyControl.addStyleClass(sCombinedClass);
		oClonedControl = oMyControl.clone();

		assert.equal(oClonedControl.hasStyleClass(sMyClass), true, "the cloned control has the style class 'abc'");
		assert.equal(oClonedControl.hasStyleClass(sMyClass1), true, "the cloned control has the style class 'bcd'");
		assert.equal(oClonedControl.hasStyleClass(sCombinedClass), true, "the cloned control has the style class 'bcd'");

		oClonedControl.destroy();

		// ThemeScopingChanged Event should not be fired
		sinon.assert.notCalled(this.fireThemeScopingChangedSpy);
	});

	QUnit.test("Cloned Control and the original control should handle the style class separately", function(assert) {
		var sMyClass = "abc",
			sMyClass1 = "bcd",
			oClonedControl = oMyControl.clone();

		oMyControl.addStyleClass(sMyClass);
		oClonedControl.addStyleClass(sMyClass1);

		assert.equal(oMyControl.hasStyleClass(sMyClass1), false, "the original control shouldn't have the class which is added on the cloned one");
		assert.equal(oClonedControl.hasStyleClass(sMyClass), false, "the cloned control shouldn't have the class which is added on the original one");

		oClonedControl.destroy();

		// ThemeScopingChanged Event should not be fired
		sinon.assert.notCalled(this.fireThemeScopingChangedSpy);
	});

	QUnit.test("add and remove a scope class", function(assert) {
		var sMyClass = "sapTestScope";

		assert.expect(8); // this also verifies there is no rerendering

		oMyControl.addStyleClass(sMyClass);

		assert.deepEqual(aCurrentDOMClasses, [sMyClass], "Class should have been applied to DOM before event has been fired");
		assert.deepEqual(aCurrentAPIClasses, [sMyClass], "Class should have been applied to internal object before event has been fired");

		oMyControl.removeStyleClass(sMyClass);

		assert.deepEqual(aCurrentDOMClasses, [], "Class should have been removed from DOM before event has been fired");
		assert.deepEqual(aCurrentAPIClasses, [], "Class should have been removed from internal object before event has been fired");

		oMyControl.removeStyleClass(sMyClass); // should not cause an error or rendering

		// ThemeScopingChanged Event should be be fired twice (added + removed)
		sinon.assert.callCount(this.fireThemeScopingChangedSpy, 2);
		sinon.assert.calledWith(this.fireThemeScopingChangedSpy, {
			element: oMyControl,
			scopes: ["sapTestScope"],
			added: true
		});
		sinon.assert.calledWith(this.fireThemeScopingChangedSpy, {
			element: oMyControl,
			scopes: ["sapTestScope"],
			added: false
		});
	});

	QUnit.test("add and remove multiple scope and non-scope classes", function(assert) {

		assert.expect(18); // this also verifies there is no rerendering

		// add all-in-one
		oMyControl.addStyleClass("sapTestScope abc sapTestScopePlus def");

		assert.deepEqual(aCurrentDOMClasses, ["sapTestScope", "abc", "sapTestScopePlus", "def"], "Classes should have been applied to DOM before event has been fired");
		assert.deepEqual(aCurrentAPIClasses, ["sapTestScope", "abc", "sapTestScopePlus", "def"], "Classes should have been applied to internal object before event has been fired");

		// ThemeScopingChanged Event should be fired once
		sinon.assert.callCount(this.fireThemeScopingChangedSpy, 1);
		sinon.assert.calledWith(this.fireThemeScopingChangedSpy, {
			element: oMyControl,
			scopes: ["sapTestScope", "sapTestScopePlus"],
			added: true
		});

		// remove abc
		oMyControl.removeStyleClass("abc");

		// ThemeScopingChanged Event should be still fired once
		sinon.assert.callCount(this.fireThemeScopingChangedSpy, 1);

		// remove sapTestScopePlus
		oMyControl.removeStyleClass("sapTestScopePlus");

		assert.deepEqual(aCurrentDOMClasses, ["sapTestScope", "def"], "Class should have been removed from DOM before event has been fired");
		assert.deepEqual(aCurrentAPIClasses, ["sapTestScope", "def"], "Class should have been removed from internal object before event has been fired");

		// ThemeScopingChanged Event should now be fired twice
		sinon.assert.callCount(this.fireThemeScopingChangedSpy, 2);
		sinon.assert.calledWith(this.fireThemeScopingChangedSpy, {
			element: oMyControl,
			scopes: ["sapTestScopePlus"],
			added: false
		});

		// add both scopes again
		oMyControl.addStyleClass("sapTestScope sapTestScopePlus");

		assert.deepEqual(aCurrentDOMClasses, ["sapTestScope", "def", "sapTestScopePlus"], "Class should have been applied to DOM before event has been fired");
		assert.deepEqual(aCurrentAPIClasses, ["sapTestScope", "def", "sapTestScopePlus"], "Class should have been applied to internal object before event has been fired");

		// ThemeScopingChanged Event should be be fired 3 times
		sinon.assert.callCount(this.fireThemeScopingChangedSpy, 3);
		sinon.assert.calledWith(this.fireThemeScopingChangedSpy, {
			element: oMyControl,
			scopes: ["sapTestScopePlus"],
			added: true
		});

		// remove both scopes again
		oMyControl.removeStyleClass("sapTestScopePlus sapTestScope");

		assert.deepEqual(aCurrentDOMClasses, ["def"], "Classes should have been removed from DOM before event has been fired");
		assert.deepEqual(aCurrentAPIClasses, ["def"], "Classes should have been removed from internal object before event has been fired");

		// ThemeScopingChanged Event should be be fired 3 times
		sinon.assert.callCount(this.fireThemeScopingChangedSpy, 4);
		sinon.assert.calledWith(this.fireThemeScopingChangedSpy, {
			element: oMyControl,
			scopes: ["sapTestScopePlus", "sapTestScope"],
			added: false
		});

	});

});
