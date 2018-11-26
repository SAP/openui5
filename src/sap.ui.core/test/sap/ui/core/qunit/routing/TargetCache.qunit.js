/*global QUnit, sinon */
sap.ui.define([
	"sap/base/Log",
	"sap/ui/core/Component",
	"sap/ui/core/routing/TargetCache"
], function (Log, Component, TargetCache) {
	"use strict";

	QUnit.module("Get and Set Component with TargetCache", {
		beforeEach: function (assert) {
			var that = this;
			this.oComponent = {
				destroy: function () {

				},
				isA: function(sClass) {
					return sClass === "sap.ui.core.UIComponent";
				},
				getId: function() {
					return "testid";
				}
			};
			this.oCreateStub = sinon.stub(Component, "create").callsFake(function () {
				return Promise.resolve(that.oComponent);
			});
			this.oCache = new TargetCache({
				async: true
			});
		},
		afterEach: function (assert) {
			this.oCreateStub.restore();
			this.oCache.destroy();
		}
	});

	QUnit.test("Get component with sync should cause an error", function (assert) {
		var oCache = new TargetCache({
			async: false
		});

		var oLogErrorSpy = sinon.spy(Log, "error");

		var oPromise = oCache.get({}, "Component");
		return oPromise.catch(function (err) {
			assert.ok(err.message.indexOf("synchronous") !== -1, "The promise should be rejected with correct error message");
			assert.equal(oLogErrorSpy.callCount, 1, "error logged once");
			assert.ok(oLogErrorSpy.getCall(0).args[0].indexOf("synchronous") !== -1, "error logged with the correct message");
			oLogErrorSpy.restore();
		});
	});

	QUnit.test("Get component without a name property should cause an error", function (assert) {
		var oLogErrorSpy = sinon.spy(Log, "error");

		var oPromise = this.oCache.get({}, "Component");
		return oPromise.catch(function (err) {
			assert.ok(err.message.indexOf("has to be defined") !== -1, "The promise should be rejected with correct error message");
			assert.equal(oLogErrorSpy.callCount, 1, "error logged once");
			assert.ok(oLogErrorSpy.getCall(0).args[0].indexOf("has to be defined") !== -1, "error logged with the correct message");
			oLogErrorSpy.restore();
		});
	});

	QUnit.test("Get component with empty cache should create a component without id set", function (assert) {
		var oOptions = {
			name: "foo.bar",
			manifest: true
		}, that = this;

		var oPromise = this.oCache.get(oOptions, "Component");
		assert.equal(this.oCreateStub.callCount, 1, "Component.create is called once");

		assert.propEqual(this.oCreateStub.getCall(0).args[0], oOptions, "The options is passed to the Component.create");

		return oPromise.then(function (oComponent) {
			assert.strictEqual(oComponent, that.oComponent, "The correct component instance is passed to promise resolve");
			assert.strictEqual(that.oCache._oCache.component[oOptions.name][undefined], oComponent, "The component instance is saved under the undefined key");
		});
	});

	QUnit.test("Get component with empty cache should create a component with id set", function (assert) {
		var oOptions = {
			name: "foo.bar",
			id: "testid",
			manifest: true
		}, that = this;

		var oPromise = this.oCache.get(oOptions, "Component");
		assert.equal(this.oCreateStub.callCount, 1, "Component.create is called once");

		assert.propEqual(this.oCreateStub.getCall(0).args[0], oOptions, "The options is passed to the Component.create");

		return oPromise.then(function (oComponent) {
			assert.strictEqual(oComponent, that.oComponent, "The correct component instance is passed to promise resolve");
			assert.strictEqual(that.oCache._oCache.component[oOptions.name][undefined], undefined, "The component instance isn't saved under the undefined key");
			assert.strictEqual(that.oCache._oCache.component[oOptions.name][oOptions.id], oComponent, "The component instance is saved under the undefined key");
		});
	});

	QUnit.test("Get component with filled cache should not create the component again", function (assert) {
		var oOptions = {
			name: "foo.bar",
			id: "testid",
			option: {
				a: "b",
				c: "d"
			}
		}, that = this;

		// fill the cache
		var oPromise = this.oCache.get(oOptions, "Component");
		assert.equal(this.oCreateStub.callCount, 1, "Component.create is called once");

		var oNewPromise = this.oCache.get(oOptions, "Component");
		assert.equal(this.oCreateStub.callCount, 1, "Component.create is still called once and not called again");
		assert.strictEqual(oNewPromise, oPromise, "The same promise should be returned before it resolves");

		return oPromise.then(function (oComponent) {
			var oAnotherPromise = that.oCache.get(oOptions, "Component");
			assert.notEqual(oAnotherPromise, oPromise, "New promise should be created after the original one resolves");
			return oAnotherPromise.then(function (oAnotherComponent) {
				assert.strictEqual(oAnotherComponent, oComponent, "Different promise should resolve with the same component instance");
			});
		});
	});

	QUnit.test("Set component without a name should cause an error", function (assert) {
		var oLogErrorSpy = sinon.spy(Log, "error");
		try {
			this.oCache.set(undefined, "Component", this.oComponent);
		} catch (err) {
			assert.ok(err.message.indexOf("has to be defined") !== -1, "The promise should be rejected with correct error message");
			assert.equal(oLogErrorSpy.callCount, 1, "error logged once");
			assert.ok(oLogErrorSpy.getCall(0).args[0].indexOf("has to be defined") !== -1, "error logged with the correct message");
		} finally {
			oLogErrorSpy.restore();
		}
	});

	QUnit.test("Set component to TargetCache and get that component", function (assert) {
		var oOptions = {
			name: "foo.bar",
			option: {
				a: "b",
				c: "d"
			}
		}, that = this;

		this.oCache.set(oOptions.name, "Component", this.oComponent);

		var oPromise = this.oCache.get(oOptions, "Component");
		assert.equal(this.oCreateStub.callCount, 0, "Component.create isn't called once");

		return oPromise.then(function (oComponent) {
			assert.strictEqual(oComponent, that.oComponent, "Promise should resolve with the component which is set by calling setObject");
		});
	});

	QUnit.test("Created event", function (assert) {
		var oFireEventSpy = sinon.spy(this.oCache, "fireCreated");

		var oOptions = {
			name: "foo.bar",
			id: "testid",
			option: {
				a: "b",
				c: "d"
			}
		};

		// fill the cache
		this.oCache.get(oOptions, "Component");
		assert.equal(oFireEventSpy.callCount, 0, "Created event not fired yet");

		var oNewPromise = this.oCache.get(oOptions, "Component");
		assert.equal(oFireEventSpy.callCount, 0, "Created event not fired yet");

		return oNewPromise.then(function (oComponent) {
			assert.equal(oFireEventSpy.callCount, 1, "Created event is fired");
			var oParameter = oFireEventSpy.getCall(0).args[0];
			assert.strictEqual(oParameter.object, oComponent, "Parameter 'object' is set correctly");
			assert.equal(oParameter.type, "Component", "Parameter 'type' is set correctly");
			assert.strictEqual(oParameter.options, oOptions, "Parameter 'options' is set correctly");
		});
	});

	QUnit.module("destroy", {
		beforeEach: function () {
			var that = this,
				oDestroySpy = sinon.spy();

			this.oCache = new TargetCache({
				async: true
			});

			this.oDestroySpy = oDestroySpy;

			this.oComponent = {
				destroy: oDestroySpy,
				isA: function(sClass) {
					return sClass === "sap.ui.core.UIComponent";
				},
				getId: function() {
					return "testid";
				}
			};

			this.oCreateStub = sinon.stub(Component, "create").callsFake(function () {
				return Promise.resolve(that.oComponent);
			});
		},
		afterEach: function () {
			this.oCreateStub.restore();
			this.oCache.destroy();
		}
	});

	QUnit.test("Destroy TargetCache should destroy all managed objects", function (assert) {
		this.oCache.set("foo.bar", "Component", this.oComponent);

		this.oCache.destroy();

		assert.equal(this.oDestroySpy.callCount, 1, "The managed component is also destroyed");
	});

	QUnit.test("Destroy TargetCache should wait for the loading promise to resolve before destroys the managed object", function (assert) {
		var oPromise = this.oCache.get({
				name: "foo.bar"
			}, "Component");

		this.oCache.destroy();

		assert.equal(this.oDestroySpy.callCount, 0, "The destroy method of the component isn't called yet");

		return oPromise.then(function () {
			assert.equal(this.oDestroySpy.callCount, 1, "The destroy method of the component is called");
		}.bind(this));
	});
});
