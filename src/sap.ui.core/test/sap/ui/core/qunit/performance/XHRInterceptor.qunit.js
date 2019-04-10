/*global sinon, QUnit */
sap.ui.define(['sap/ui/performance/XHRInterceptor'], function(XHRInterceptor) {
	"use strict";

	QUnit.module("XHRInterceptor", {
		beforeEach: function() {
			this.xhr = new XMLHttpRequest();
		},
		afterEach: function() {
			this.xhr.abort();
			XHRInterceptor.isRegistered();
		}
	});

	QUnit.test("module", function(assert) {
		assert.ok(XHRInterceptor, "module loaded");
		assert.ok(XHRInterceptor.register, "register method available");
		assert.ok(XHRInterceptor.unregister, "unregister method available");
		assert.ok(XHRInterceptor.isRegistered, "isRegistered method available");
	});

	QUnit.test("register a function", function(assert) {
		var oSpy = sinon.spy();
		var args = ["GET", "foo"];

		XHRInterceptor.register("test", "open", oSpy);

		this.xhr.open(args[0], args[1], true);

		assert.ok(oSpy.calledOnce, "function is called once");
		assert.equal(oSpy.args[0][0], args[0], "called with 'GET' as first argument");
		assert.equal(oSpy.args[0][1], args[1], "called with 'open' as second argument");
		assert.equal(oSpy.args[0][2], true, "called with true as third argument");

		XHRInterceptor.unregister("test", "open");
	});

	QUnit.test("overwrite a registration", function(assert) {
		var oSpy1 = sinon.spy();
		var oSpy2 = sinon.spy();
		var args = ["GET", "foo"];

		XHRInterceptor.register("test", "open", oSpy1);
		XHRInterceptor.register("test", "open", oSpy2);

		this.xhr.open(args[0], args[1], true);

		assert.ok(oSpy2.calledOnce, "Last registered function is called");
		assert.ok(oSpy1.notCalled, "Overwritten function is not called");

		XHRInterceptor.unregister("test", "open");
	});

	QUnit.test("register many functions", function(assert) {
		var aSpies = [sinon.spy(), sinon.spy(), sinon.spy()];
		var args = ["GET", "foo"];

		aSpies.forEach(function(oSpy, i) {
			XHRInterceptor.register("test" + i, "open", oSpy);
		});

		this.xhr.open(args[0], args[1], true);

		assert.expect(14);
		aSpies.forEach(function(oSpy, i) {
			assert.ok(oSpy.calledOnce, "function no " + i + " function is called once");
			assert.equal(oSpy.args[0][0], args[0], "function no " + i + " called with 'GET' as first argument");
			assert.equal(oSpy.args[0][1], args[1], "function no " + i + " called with 'open' as second argument");
			assert.equal(oSpy.args[0][2], true, "function no " + i + " called with true as third argument");
		});
		assert.ok(aSpies[0].calledBefore(aSpies[1]), "order remains stable");
		assert.ok(aSpies[1].calledBefore(aSpies[2]), "order remains stable");

		aSpies.forEach(function(oSpy, i) {
			XHRInterceptor.unregister("test" + i, "open");
		});
	});

	QUnit.test("unregister a registered function", function(assert) {
		var oSpy = sinon.spy();
		var args = ["GET", "foo"];

		XHRInterceptor.register("test", "open", oSpy);
		assert.ok(XHRInterceptor.unregister("test", "open"), "Unregisterd successfully");

		this.xhr.open(args[0], args[1], true);

		assert.ok(oSpy.notCalled, "unregistered function is not called");
	});

	QUnit.test("unregister an unknown function", function(assert) {
		assert.ok(XHRInterceptor.unregister("test", "open"), "Unregistered function not present anymore");

	});

	QUnit.test("unregister one of many functions", function(assert) {
		var aSpies = [sinon.spy(), sinon.spy(), sinon.spy()];
		var args = ["GET", "foo"];

		aSpies.forEach(function(oSpy, i) {
			XHRInterceptor.register("test" + i, "open", oSpy);
		});
		XHRInterceptor.unregister("test1", "open");

		this.xhr.open(args[0], args[1], true);

		assert.ok(aSpies[0].calledOnce, "first function is called");
		assert.ok(aSpies[1].notCalled, "unregistered function is not called");
		assert.ok(aSpies[2].calledOnce, "third function is called");
		assert.ok(aSpies[0].calledBefore(aSpies[2]), "order remains stable");

		XHRInterceptor.unregister("test0", "open");
		XHRInterceptor.unregister("test2", "open");
	});

	QUnit.test("isRegistered", function(assert) {
		assert.notOk(XHRInterceptor.isRegistered("test", "open"), "function is unknown");
		XHRInterceptor.register("test", "open", function() {});
		assert.ok(XHRInterceptor.isRegistered("test", "open"), "function is registered");

		XHRInterceptor.unregister("test", "open");
	});

});