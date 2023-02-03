/*global QUnit */
sap.ui.define([
	"sap/ui/core/Element",
	"sap/ui/thirdparty/jquery"
], function(Element, jQuery) {
	"use strict";

	var testObject = { id: "testObject" };

	QUnit.module("Delegates", {
		beforeEach: function(assert) {
			var that = this;
			this.resetCounters();
			function testFunction() {
				assert.ok(true, "this test only checks whether the function is executed");
				that.counter++;
				that.lastThisId = this.id ? this.id : this.getId(); // the simple ID for the delegate and testObject, but the real element ID when the Element is the this context
			}
			this.element = new Element();
			this.del1 = {
				id: "del1",
				onSomeEvent: testFunction
			};
			this.del2 = {
				id: "del2",
				onSomeEvent: testFunction
			};
		},
		afterEach: function() {
			this.element.destroy();
		},
		resetCounters: function() {
			this.counter = 0;
			this.lastThisId = undefined;
		}
	});

	QUnit.test("Adding Delegates", function(assert) {
		var element = this.element;

		assert.equal(element.aBeforeDelegates.length, 0, "Element should have no before delegates");
		assert.equal(element.aDelegates.length, 0, "Element should have no after delegates");

		element.addDelegate(this.del1);

		assert.equal(element.aBeforeDelegates.length, 0, "Element should have no before delegates");
		assert.equal(element.aDelegates.length, 1, "Element should have one after delegate");

		element.addDelegate(this.del2, true);

		assert.equal(element.aBeforeDelegates.length, 1, "Element should have one before delegate");
		assert.equal(element.aDelegates.length, 1, "Element should have one after delegate");
	});

	QUnit.test("Triggering Delegates", function(assert) {
		assert.expect(4);
		var element = this.element;
		element.addDelegate(this.del1);
		element.addDelegate(this.del2, true);

		// Act
		var oEvent = jQuery.Event("SomeEvent");
		element._handleEvent(oEvent);

		assert.equal(this.counter, 2, "event handler method should be called twice");
		assert.equal(this.lastThisId, "del1"); // del2 should be called earlier, the this context should be the delegate itself
	});

	QUnit.test("Rendering Delegates", function(assert) {
		var element = this.element;

		assert.notOk(element.hasRenderingDelegate(), "Initiall there is no rendering delegate");

		element.addDelegate(this.del1);
		assert.notOk(element.hasRenderingDelegate(), "del1 does not contain any rendering delegate");

		element.removeDelegate(this.del1);
		this.del1.onAfterRendering = Function.prototype;
		element.addDelegate(this.del1);
		assert.ok(element.hasRenderingDelegate(), "the element has onAfterRendering event delegate");

		element.removeDelegate(this.del1);
		this.del1.onBeforeRendering = Function.prototype;
		delete this.del1.onAfterRendering;
		element.addDelegate(this.del1);
		assert.ok(element.hasRenderingDelegate(), "the element has onBeforeRendering event delegate");

		element.removeDelegate(this.del1);
		this.del1.canSkipRendering = true;
		element.addDelegate(this.del1);
		assert.notOk(element.hasRenderingDelegate(), "the rendering delegate has canSkipRendering flag");

		element.removeDelegate(this.del1);
		delete this.del1.canSkipRendering;
		element.addDelegate(this.del1);
		assert.ok(element.hasRenderingDelegate(), "the canSkipRendering flag has been removed and the rendering has onBeforeRendering event delegate");
	});

	QUnit.test("Removing Delegates", function(assert) {
		var element = this.element;
		element.addDelegate(this.del1);
		element.addDelegate(this.del2, true);

		// Act
		element.removeDelegate(this.del1);

		assert.equal(element.aBeforeDelegates.length, 1, "Element should have one before delegate");
		assert.equal(element.aDelegates.length, 0, "Element should have no after delegate");

		var oEvent = jQuery.Event("SomeEvent");
		element._handleEvent(oEvent);

		assert.equal(this.counter, 1, "event handler method should be called once");

		element.removeDelegate(this.del2);

		assert.equal(element.aBeforeDelegates.length, 0, "Element should have no before delegate");
		assert.equal(element.aDelegates.length, 0, "Element should have no after delegate");
	});

	QUnit.test("Other 'this' context", function(assert) {
		var element = this.element;
		element.addDelegate(this.del1, testObject);

		var oEvent = jQuery.Event("SomeEvent");
		element._handleEvent(oEvent);

		assert.equal(this.lastThisId, "testObject", "the test object should have been the this context");
	});

	QUnit.test("Cloning", function(assert) {
		var element = this.element;
		element.addDelegate(this.del1, testObject);
		element.addDelegate(this.del2, false, true);

		var clone = element.clone();

		var oEvent = jQuery.Event("SomeEvent");
		clone._handleEvent(oEvent);

		assert.equal(this.counter, 1, "only one handler should be cloned and executed");
		assert.equal(this.lastThisId, "del2", "the second delegate is the one which should be executed");

		assert.equal(clone.aBeforeDelegates.length, 0, "Clone should have no before delegates");
		assert.equal(clone.aDelegates.length, 1, "Clone should have one after delegate");
	});

	QUnit.test("Cloned 'this' context", function(assert) {
		var element = this.element;
		var originalId = element.getId();

		element.addDelegate(this.del2, false, element, true); // this delegate has the element itself as context

		var oEvent = jQuery.Event("SomeEvent");
		element._handleEvent(oEvent);

		assert.equal(this.counter, 1, "one handler should be cloned and executed");
		assert.equal(this.lastThisId, originalId, "the original element should be the this context");

		var clone = element.clone();
		var cloneId = clone.getId();
		this.lastThisId = undefined;
		this.counter = 0;

		oEvent = jQuery.Event("SomeEvent");
		clone._handleEvent(oEvent);

		assert.equal(this.counter, 1, "one handler should be cloned and executed");
		assert.equal(this.lastThisId, cloneId, "the clone should be the this context");
	});

	QUnit.test("addEventDelegate method", function(assert) {
		var element = this.element;

		element.addEventDelegate(this.del1, testObject);

		assert.equal(element.aBeforeDelegates.length, 0, "Element should have no before delegates");
		assert.equal(element.aDelegates.length, 1, "Element should have one after delegate");

		var oEvent = jQuery.Event("SomeEvent");
		element._handleEvent(oEvent);

		assert.equal(this.counter, 1, "the handler should be executed");
		assert.equal(this.lastThisId, "testObject", "the this context should be set correctly");

		var clone = element.clone();
		this.lastThisId = undefined;
		this.counter = 0;

		oEvent = jQuery.Event("SomeEvent");
		clone._handleEvent(oEvent);

		assert.equal(this.counter, 1, "the handler should be cloned and executed");
		assert.equal(this.lastThisId, "testObject", "the this context should be set correctly");

		assert.equal(clone.aBeforeDelegates.length, 0, "Clone should have no before delegates");
		assert.equal(clone.aDelegates.length, 1, "Clone should have one after delegate");
	});

	QUnit.test("removeEventDelegate method", function(assert) {
		var element = this.element;
		element.addEventDelegate(this.del1, testObject);

		// Act
		element.removeEventDelegate(this.del1);

		assert.equal(element.aBeforeDelegates.length, 0, "Element should have no before delegates");
		assert.equal(element.aDelegates.length, 0, "Element should have no after delegate");

		var oEvent = jQuery.Event("SomeEvent");
		element._handleEvent(oEvent);

		assert.equal(this.counter, 0, "the handler should not be executed");
	});

	QUnit.test("removeDelegate from within delegate", function(assert) {
		// BUG: Removing the delegate while it is called modifies the array of delegates,
		//	  the second delegate is not called
		//	  Fixed in 1.20.7
		// CSS: 0120061532 0001150709 2014

		var oDelegate1 = {
			onAfterRendering:function() {
				assert.ok(true, "Invoke onAfterRendering on delegate #1");
				element.removeEventDelegate(oDelegate1);
			}
		};

		var oDelegate2 = {
			onAfterRendering:function() {
				assert.ok(true, "Invoke onAfterRendering on delegate #2");
				element.removeEventDelegate(oDelegate2);

				assert.equal(element.aBeforeDelegates.length, 0, "Element should have no before delegates");
				assert.equal(element.aDelegates.length, 0, "Element should have no after delegates");
			}
		};

		var element = this.element;
		element.addEventDelegate(oDelegate1);
		element.addEventDelegate(oDelegate2);

		assert.equal(element.aBeforeDelegates.length, 0, "Element should have no before delegates");
		assert.equal(element.aDelegates.length, 2, "Element should have two after delegates");

		var oEvent = jQuery.Event("AfterRendering");
		element._handleEvent(oEvent);
	});

});
