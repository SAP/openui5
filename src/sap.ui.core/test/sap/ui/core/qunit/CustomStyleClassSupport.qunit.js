/*global QUnit, sinon */
// load Parameters API to test ThemeScopingChanged event
sap.ui.define([
	"sap/ui/core/Control",
	"sap/ui/core/theming/Parameters",
	"sap/ui/qunit/utils/createAndAppendDiv"
], function(Control, Parameters, createAndAppendDiv) {
	"use strict";

	createAndAppendDiv("content");

	// trigger parameter loading to enable event
	// this should normally happen in the control which listens to the event
	Parameters.get();

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
			var oDomRef = this.myControl.getDomRef();
			this.aCurrentDOMClasses = oDomRef ? Array.prototype.slice.call(oDomRef.classList) : [];
			this.aCurrentAPIClasses = this.myControl.aCustomStyleClasses;
		},
		beforeEach: function(assert) {

			sap.ui.getCore().attachThemeScopingChanged(this.onThemeScopingChanged, this);

			this.fireThemeScopingChangedSpy = sinon.spy(sap.ui.getCore(), "fireThemeScopingChanged");

			this.myControl = new MyControlClass("myControl", assert);

			this.myControl.placeAt("content");
			sap.ui.getCore().applyChanges();
		},
		afterEach: function() {

			sap.ui.getCore().detachThemeScopingChanged(this.onThemeScopingChanged, this);

			this.fireThemeScopingChangedSpy.restore();
			this.fireThemeScopingChangedSpy = null;

			this.myControl.destroy();
		}
	});

	QUnit.test("call hasStyleClass before add any class", function(assert) {
		var sMyClass = "abc";

		assert.expect(4); // control shouldn't rerender itself

		assert.equal(this.myControl.hasStyleClass(sMyClass), false, "control should not have the class");
		assert.equal(this.myControl.$().hasClass(sMyClass), false, "class should not be in HTML");

		// ThemeScopingChanged Event should not be fired
		sinon.assert.notCalled(this.fireThemeScopingChangedSpy);
	});

	QUnit.test("call hasStyleClass with whitespace", function(assert) {
		assert.equal(this.myControl.hasStyleClass(" "), false, "white space should be ignored");

		// ThemeScopingChanged Event should not be fired
		sinon.assert.notCalled(this.fireThemeScopingChangedSpy);
	});

	QUnit.test("call addStyleClass with whitespaces and check with hasStyleClass", function(assert) {
		this.myControl.addStyleClass("\r \n \t \f  ");

		assert.equal(this.myControl.$()[0].className, "", "class in HTML shouldn't be changed");
		assert.equal(this.myControl.hasStyleClass(" "), false, "White space(s) class name should be ignored");
		assert.equal(this.myControl.hasStyleClass("\r"), false, "White space(s) class name should be ignored");
		assert.equal(this.myControl.hasStyleClass("\n"), false, "White space(s) class name should be ignored");
		assert.equal(this.myControl.hasStyleClass("\t"), false, "White space(s) class name should be ignored");
		assert.equal(this.myControl.hasStyleClass("\f"), false, "White space(s) class name should be ignored");
		assert.equal(this.myControl.hasStyleClass("\r \n \t \f  "), false, "White space(s) class name should be ignored");

		// ThemeScopingChanged Event should not be fired
		sinon.assert.notCalled(this.fireThemeScopingChangedSpy);
	});

	QUnit.test("add a single class", function(assert) {
		var sMyClass = "abc";

		assert.expect(5); // this also verifies there is no rerendering

		this.myControl.addStyleClass(sMyClass);

		assert.equal(this.myControl.hasStyleClass(sMyClass), true, "control should now have the class");
		assert.equal(this.myControl.hasStyleClass(" "), false, "white space class should be ignored");
		assert.equal(this.myControl.$().hasClass(sMyClass), true, "class should now be in HTML");

		// ThemeScopingChanged Event should not be fired
		sinon.assert.notCalled(this.fireThemeScopingChangedSpy);
	});

	QUnit.test("remove an added class", function(assert) {
		var sMyClass = "abc";

		this.myControl.addStyleClass(sMyClass);

		assert.expect(4); // this also verifies there is no rerendering

		this.myControl.removeStyleClass(sMyClass);

		// remove white space class shouldn't have any effect
		this.myControl.removeStyleClass(" ");

		assert.equal(this.myControl.hasStyleClass(sMyClass), false, "control should not have the class");
		assert.equal(this.myControl.$().hasClass(sMyClass), false, "class should not be in HTML");

		this.myControl.removeStyleClass(sMyClass); // should not cause an error or rendering

		// ThemeScopingChanged Event should not be fired
		sinon.assert.notCalled(this.fireThemeScopingChangedSpy);
	});

	QUnit.test("toggle style class without bAdd", function(assert) {
		var sMyClass = "abc";

		assert.expect(6); // this also verifies there is no rerendering

		this.myControl.toggleStyleClass(sMyClass);

		assert.equal(this.myControl.hasStyleClass(sMyClass), true, "control should now have the class");
		assert.equal(this.myControl.$().hasClass(sMyClass), true, "class should now be in HTML");

		this.myControl.toggleStyleClass(sMyClass);

		assert.equal(this.myControl.hasStyleClass(sMyClass), false, "control should not have the class");
		assert.equal(this.myControl.$().hasClass(sMyClass), false, "class should not be in HTML");

		// ThemeScopingChanged Event should not be fired
		sinon.assert.notCalled(this.fireThemeScopingChangedSpy);
	});

	QUnit.test("toggle style class with bAdd", function(assert) {
		var sMyClass = "abc";

		assert.expect(6); // this also verifies there is no rerendering

		this.myControl.toggleStyleClass(sMyClass, true);

		assert.equal(this.myControl.hasStyleClass(sMyClass), true, "control should now have the class");
		assert.equal(this.myControl.$().hasClass(sMyClass), true, "class should now be in HTML");

		this.myControl.toggleStyleClass(sMyClass, false);

		assert.equal(this.myControl.hasStyleClass(sMyClass), false, "control should not have the class");
		assert.equal(this.myControl.$().hasClass(sMyClass), false, "class should not be in HTML");

		// ThemeScopingChanged Event should not be fired
		sinon.assert.notCalled(this.fireThemeScopingChangedSpy);
	});

	QUnit.test("call addStyleClass twice with the same class", function(assert) {
		var sMyClass = "abc";

		assert.expect(5); // this also verifies there is no rerendering

		this.myControl.addStyleClass(sMyClass);
		this.myControl.addStyleClass(sMyClass);

		assert.equal(this.myControl.$()[0].className, "abc", "class should be in HTML only once");

		this.myControl.removeStyleClass(sMyClass);

		assert.equal(this.myControl.hasStyleClass(sMyClass), false, "control should not have the class");
		assert.equal(this.myControl.$().hasClass(sMyClass), false, "class should not be in HTML");

		// ThemeScopingChanged Event should not be fired
		sinon.assert.notCalled(this.fireThemeScopingChangedSpy);
	});

	QUnit.test("add two classes within one addStyleClass call and then remove them together in one removeStyleClass call", function(assert) {
		var sMyClass = "abc",
			sMyClass1 = "bcd",
			sCombinedClass = sMyClass + " " + sMyClass1;

		this.myControl.addStyleClass(sCombinedClass);
		this.myControl.removeStyleClass(""); // call with empty string shouldn't have any effect

		assert.equal(this.myControl.hasStyleClass(sCombinedClass), true, "control should now have the combined class " + sCombinedClass);
		assert.equal(this.myControl.$().hasClass(sCombinedClass), true, "class should now be in HTML");

		assert.equal(this.myControl.hasStyleClass(sMyClass), true, "control should now have the class " + sMyClass);
		assert.equal(this.myControl.$().hasClass(sMyClass), true, "class should now be in HTML");

		assert.equal(this.myControl.hasStyleClass(sMyClass1), true, "control should now have the class " + sMyClass);
		assert.equal(this.myControl.$().hasClass(sMyClass1), true, "class should now be in HTML");


		this.myControl.removeStyleClass(sCombinedClass + " unknownClass"); // remove unknown class shouldn't have any effect

		assert.equal(this.myControl.hasStyleClass(sCombinedClass), false, "control should not have the combined class " + sCombinedClass);
		assert.equal(this.myControl.$().hasClass(sCombinedClass), false, "class should not be in HTML");

		assert.equal(this.myControl.hasStyleClass(sMyClass), false, "control should not have the class " + sMyClass);
		assert.equal(this.myControl.$().hasClass(sMyClass), false, "class should not be in HTML");

		assert.equal(this.myControl.hasStyleClass(sMyClass1), false, "control should not have the class " + sMyClass1);
		assert.equal(this.myControl.$().hasClass(sMyClass1), false, "class should not be in HTML");

		// ThemeScopingChanged Event should not be fired
		sinon.assert.notCalled(this.fireThemeScopingChangedSpy);
	});

	QUnit.test("add two classes within one addStyleClass call and then remove them one by one", function(assert) {
		var sMyClass = "abc",
			sMyClass1 = "bcd",
			sCombinedClass = sMyClass + " " + sMyClass1;

		this.myControl.addStyleClass(sCombinedClass);
		this.myControl.removeStyleClass(""); // call with empty string shouldn't have any effect

		assert.equal(this.myControl.hasStyleClass(sCombinedClass), true, "control should now have the combined class " + sCombinedClass);
		assert.equal(this.myControl.$().hasClass(sCombinedClass), true, "class should now be in HTML");

		assert.equal(this.myControl.hasStyleClass(sMyClass), true, "control should now have the class " + sMyClass);
		assert.equal(this.myControl.$().hasClass(sMyClass), true, "class should now be in HTML");

		assert.equal(this.myControl.hasStyleClass(sMyClass1), true, "control should now have the class " + sMyClass);
		assert.equal(this.myControl.$().hasClass(sMyClass1), true, "class should now be in HTML");


		this.myControl.removeStyleClass(sMyClass1 + " unknownClass"); // remove unknown class shouldn't have any effect

		assert.equal(this.myControl.hasStyleClass(sCombinedClass), false, "control should not have the combined class " + sCombinedClass);
		assert.equal(this.myControl.$().hasClass(sCombinedClass), false, "class should not be in HTML");

		assert.equal(this.myControl.hasStyleClass(sMyClass), true, "control should still have the class " + sMyClass);
		assert.equal(this.myControl.$().hasClass(sMyClass), true, "class should still be in HTML");

		assert.equal(this.myControl.hasStyleClass(sMyClass1), false, "control should not have the class " + sMyClass1);
		assert.equal(this.myControl.$().hasClass(sMyClass1), false, "class should not be in HTML");


		this.myControl.removeStyleClass(sMyClass + " unknownClass"); // remove unknown class shouldn't have any effect

		assert.equal(this.myControl.hasStyleClass(sCombinedClass), false, "control should not have the combined class " + sCombinedClass);
		assert.equal(this.myControl.$().hasClass(sCombinedClass), false, "class should not be in HTML");

		assert.equal(this.myControl.hasStyleClass(sMyClass), false, "control should not have the class " + sMyClass);
		assert.equal(this.myControl.$().hasClass(sMyClass), false, "class should not be in HTML");

		assert.equal(this.myControl.hasStyleClass(sMyClass1), false, "control should not have the class " + sMyClass1);
		assert.equal(this.myControl.$().hasClass(sMyClass1), false, "class should not be in HTML");

		// ThemeScopingChanged Event should not be fired
		sinon.assert.notCalled(this.fireThemeScopingChangedSpy);
	});

	QUnit.test("Cloned Control should still have the added classes", function(assert) {
		var sMyClass = "abc",
			sMyClass1 = "bcd",
			sCombinedClass = sMyClass + " " + sMyClass1,
			oClonedControl;

		this.myControl.addStyleClass(sCombinedClass);
		oClonedControl = this.myControl.clone();

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
			oClonedControl = this.myControl.clone();

		this.myControl.addStyleClass(sMyClass);
		oClonedControl.addStyleClass(sMyClass1);

		assert.equal(this.myControl.hasStyleClass(sMyClass1), false, "the original control shouldn't have the class which is added on the cloned one");
		assert.equal(oClonedControl.hasStyleClass(sMyClass), false, "the cloned control shouldn't have the class which is added on the original one");

		oClonedControl.destroy();

		// ThemeScopingChanged Event should not be fired
		sinon.assert.notCalled(this.fireThemeScopingChangedSpy);
	});

	QUnit.test("add and remove a scope class", function(assert) {
		var sMyClass = "sapTestScope";

		assert.expect(8); // this also verifies there is no rerendering

		this.myControl.addStyleClass(sMyClass);

		assert.deepEqual(this.aCurrentDOMClasses, [sMyClass], "Class should have been applied to DOM before event has been fired");
		assert.deepEqual(this.aCurrentAPIClasses, [sMyClass], "Class should have been applied to internal object before event has been fired");

		this.myControl.removeStyleClass(sMyClass);

		assert.deepEqual(this.aCurrentDOMClasses, [], "Class should have been removed from DOM before event has been fired");
		assert.deepEqual(this.aCurrentAPIClasses, [], "Class should have been removed from internal object before event has been fired");

		this.myControl.removeStyleClass(sMyClass); // should not cause an error or rendering

		// ThemeScopingChanged Event should be be fired twice (added + removed)
		sinon.assert.callCount(this.fireThemeScopingChangedSpy, 2);
		sinon.assert.calledWith(this.fireThemeScopingChangedSpy, {
			element: this.myControl,
			scopes: ["sapTestScope"],
			added: true
		});
		sinon.assert.calledWith(this.fireThemeScopingChangedSpy, {
			element: this.myControl,
			scopes: ["sapTestScope"],
			added: false
		});
	});

	QUnit.test("add and remove multiple scope and non-scope classes", function(assert) {

		assert.expect(18); // this also verifies there is no rerendering

		// add all-in-one
		this.myControl.addStyleClass("sapTestScope abc sapTestScopePlus def");

		assert.deepEqual(this.aCurrentDOMClasses, ["sapTestScope", "abc", "sapTestScopePlus", "def"], "Classes should have been applied to DOM before event has been fired");
		assert.deepEqual(this.aCurrentAPIClasses, ["sapTestScope", "abc", "sapTestScopePlus", "def"], "Classes should have been applied to internal object before event has been fired");

		// ThemeScopingChanged Event should be fired once
		sinon.assert.callCount(this.fireThemeScopingChangedSpy, 1);
		sinon.assert.calledWith(this.fireThemeScopingChangedSpy, {
			element: this.myControl,
			scopes: ["sapTestScope", "sapTestScopePlus"],
			added: true
		});

		// remove abc
		this.myControl.removeStyleClass("abc");

		// ThemeScopingChanged Event should be still fired once
		sinon.assert.callCount(this.fireThemeScopingChangedSpy, 1);

		// remove sapTestScopePlus
		this.myControl.removeStyleClass("sapTestScopePlus");

		assert.deepEqual(this.aCurrentDOMClasses, ["sapTestScope", "def"], "Class should have been removed from DOM before event has been fired");
		assert.deepEqual(this.aCurrentAPIClasses, ["sapTestScope", "def"], "Class should have been removed from internal object before event has been fired");

		// ThemeScopingChanged Event should now be fired twice
		sinon.assert.callCount(this.fireThemeScopingChangedSpy, 2);
		sinon.assert.calledWith(this.fireThemeScopingChangedSpy, {
			element: this.myControl,
			scopes: ["sapTestScopePlus"],
			added: false
		});

		// add both scopes again
		this.myControl.addStyleClass("sapTestScope sapTestScopePlus");

		assert.deepEqual(this.aCurrentDOMClasses, ["sapTestScope", "def", "sapTestScopePlus"], "Class should have been applied to DOM before event has been fired");
		assert.deepEqual(this.aCurrentAPIClasses, ["sapTestScope", "def", "sapTestScopePlus"], "Class should have been applied to internal object before event has been fired");

		// ThemeScopingChanged Event should be be fired 3 times
		sinon.assert.callCount(this.fireThemeScopingChangedSpy, 3);
		sinon.assert.calledWith(this.fireThemeScopingChangedSpy, {
			element: this.myControl,
			scopes: ["sapTestScopePlus"],
			added: true
		});

		// remove both scopes again
		this.myControl.removeStyleClass("sapTestScopePlus sapTestScope");

		assert.deepEqual(this.aCurrentDOMClasses, ["def"], "Classes should have been removed from DOM before event has been fired");
		assert.deepEqual(this.aCurrentAPIClasses, ["def"], "Classes should have been removed from internal object before event has been fired");

		// ThemeScopingChanged Event should be be fired 3 times
		sinon.assert.callCount(this.fireThemeScopingChangedSpy, 4);
		sinon.assert.calledWith(this.fireThemeScopingChangedSpy, {
			element: this.myControl,
			scopes: ["sapTestScopePlus", "sapTestScope"],
			added: false
		});

	});

});
