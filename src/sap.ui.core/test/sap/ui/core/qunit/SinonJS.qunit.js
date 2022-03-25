/*global QUnit, sinon */
sap.ui.define([
	"sap/m/Button",
	"sap/ui/thirdparty/jquery"
], function(Button, jQuery) {
	"use strict";

	QUnit.module("Spies");

	QUnit.test("Basic", function(assert) {
		assert.expect(2);

		var callback = sinon.spy();
		var oButton = new Button();
		oButton.attachPress(callback);
		assert.ok(!callback.called, "Callback Spy not called yet");

		oButton.firePress();

		assert.ok(callback.called, "Callback Spy called");

		oButton.destroy();
	});


	QUnit.test("Existing methods", function(assert) {
		assert.expect(2);
		var callback = function() {};

		var spy = sinon.spy(callback);

		var oButton = new Button();
		oButton.attachPress(spy);
		assert.ok(!spy.called, "Callback Spy not called yet");

		oButton.firePress();

		assert.ok(spy.calledOnce, "Callback Spy called");

		oButton.destroy();
	});


	QUnit.test("Replace existing methods of objects", function(assert) {
		assert.expect(2);
		var obj = {
			doSomething: function(msg) {}
		};

		sinon.spy(obj, "doSomething");

		obj.doSomething("My message");

		assert.ok(obj.doSomething.calledOnce, "Spy called");

		assert.ok(obj.doSomething.calledWith("My message"), "Spy called with right value");

		// Restore the function
		obj.doSomething.restore();

	});


	QUnit.module("Stubs");

	QUnit.test("Basic", function(assert) {
		assert.expect(1);
		sinon.stub(jQuery, "ajax").yieldsTo("success", [1, 2, 3]);

		jQuery.ajax({
			success: function(data) {
				assert.deepEqual(data, [1, 2, 3], "Right data set");
			}
		});

		jQuery.ajax.restore();
	});


	QUnit.module("Mocks");

	QUnit.test("Basic", function(assert) {
		assert.expect(2);
		var myAPI = {
			method: function() {}
		};

		var mock = sinon.mock(myAPI);
		mock.expects("method").once().throws();

		try {
			myAPI.method();
		} catch (exc) {
			assert.ok(mock.verify(), "Mock function called and all expectations are fullfilled");
		}

		mock.restore();
	});

	QUnit.module("Faked Timers");

	QUnit.test("Basic", function(assert) {
		assert.expect(1);
		var oClock = sinon.useFakeTimers();
		setTimeout(function() {
			assert.ok(true, "Called without need of async test");
		}, 800);
		oClock.tick(800);
		oClock.restore();
	});


	QUnit.module("Faked XHR", {
		beforeEach: function() {
			this.xhr = sinon.useFakeXMLHttpRequest();
			var requests = this.requests = [];

			this.xhr.onCreate = function(xhr) {
				requests.push(xhr);
			};
		},

		afterEach: function() {
			this.xhr.restore();
		}
	});

	QUnit.test("Basic", function(assert) {
		assert.expect(2);
		var callback = sinon.spy();

		jQuery.ajax("test", {
			success: callback
		});

		assert.equal(1, this.requests.length, "Right number of requests");

		this.requests[0].respond(200, {
				"Content-Type": "application/json"
			},
			'[{ "foo": "bar", "bar" : "foo" }]');
		assert.ok(callback.calledWith([{
			"foo": "bar",
			"bar": "foo"
		}]), "Data is called right");
	});
});