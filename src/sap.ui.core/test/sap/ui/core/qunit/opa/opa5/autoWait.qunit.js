/*global QUnit, sinon */
sap.ui.define([
	"sap/ui/thirdparty/jquery",
	"sap/ui/test/Opa5",
	"sap/ui/test/opaQunit",
	"sap/ui/test/_OpaUriParameterParser",
	"sap/ui/test/autowaiter/_autoWaiter",
	"sap/ui/test/autowaiter/_timeoutWaiter",
	"sap/ui/test/autowaiter/WaiterBase",
	"fixture/waiters"
], function ($, Opa5, opaTest, _OpaUriParameterParser, _autoWaiter, _timeoutWaiter, WaiterBase) {
	"use strict";

	QUnit.test("Should not execute the test in debug mode", function (assert) {
		assert.ok(!window["sap-ui-debug"], "Starting the OPA tests in debug mode is not supported since it changes timeouts");
	});

	QUnit.module("OPA5 - AutoWait Config", {
		beforeEach: function () {
			this.fnHasToWait = sinon.spy(_autoWaiter, "hasToWait");
			this.fnTimeoutWait = sinon.spy(_timeoutWaiter, "hasPending");
		},
		afterEach: function () {
			Opa5.resetConfig();
			this.fnHasToWait.restore();
			this.fnTimeoutWait.restore();
		}
	});

	opaTest("Should validate config", function (oOpa) {
		Opa5.assert.throws(function () {
			Opa5.extendConfig({
				autoWait: {
					timeoutWaiter: {
						key: "value"
					}
				}
			});
		}, /not defined in the API/);
		Opa5.assert.throws(function () {
			Opa5.extendConfig({
				autoWait: {
					timeoutWaiter: {
						enabled: "string value"
					}
				}
			});
		}, /needs to be a boolean value/);
	});

	opaTest("Should enable and disable waiters - extendConfig", function (oOpa) {
		var fnHasToWait = this.fnHasToWait;
		var fnTimeoutWait = this.fnTimeoutWait;
		var checkDisabled = function (cb) {
			oOpa.waitFor({
				check: function () {
					return setTimeout(function () {}, 1000);
				},
				success: function () {
					Opa5.assert.ok(fnHasToWait.called, "Should call autoWait");
					Opa5.assert.ok(fnTimeoutWait.called, "Should not call disabled waiter");
					fnHasToWait.reset();
					fnTimeoutWait.reset();
					if (cb) {
						cb();
					}
				}
			});
		};
		var checkEnabledWaitFor = function (config) {
			oOpa.waitFor({
				autoWait: {
					timeoutWaiter: config
				},
				check: function () {
					return setTimeout(function () {},  1000);
				},
				success: function () {
					Opa5.assert.ok(fnHasToWait.called, "Should call autoWait");
					Opa5.assert.ok(fnTimeoutWait.notCalled, "Should call re-enabled waiter");
					fnHasToWait.reset();
					fnTimeoutWait.reset();
				}
			});
		};

		Opa5.extendConfig({
			autoWait: {
				timeoutWaiter: {
					enabled: true
				}
			}
		});
		checkDisabled();
		checkEnabledWaitFor({
			enabled: false
		});
		checkDisabled(function () {
			Opa5.extendConfig({
				autoWait: {
					timeoutWaiter: {
						enabled: false
					}
				}
			});
		});
		checkEnabledWaitFor();
	});

	opaTest("Should change autoWait timeout delay - extendConfig", function (oOpa) {
		Opa5.extendConfig({
			autoWait: {
				timeoutWaiter: {
					maxDelay: 400
				}
			}
		});
		oOpa.waitFor({
			check: function () {
				return setTimeout(function () {},  401);
			},
			success: function () {
				Opa5.assert.ok(this.fnHasToWait.called, "Should call autoWait");
				this.fnHasToWait.reset();
			}.bind(this)
		});

		Opa5.extendConfig({
			autoWait: true
		});
		oOpa.waitFor({
			check: function () {
				return setTimeout(function () {},  1001);
			},
			success: function () {
				// default maxDelay 1000 is used again
				Opa5.assert.ok(this.fnHasToWait.called, "Should call autoWait");
				this.fnHasToWait.restore();
			}.bind(this)
		});
	});

	opaTest("Should change autoWait timeout delay - waitFor params", function (oOpa) {
		oOpa.waitFor({
			autoWait: {
				timeoutWaiter: {
					maxDelay: 1001
				}
			},
			success: function () {
				setTimeout(function () {}, 1002);
				return oOpa.waitFor({
					success: function () {
						Opa5.assert.ok(this.fnHasToWait.called, "Should call autoWait");
						// maxDelay is 1001 for this waitFor only
						this.fnHasToWait.reset();
					}.bind(this)
				});
			}.bind(this)
		});

		oOpa.waitFor({
			success: function () {
				setTimeout(function () {}, 1002);
				return oOpa.waitFor({
					success: function () {
						Opa5.assert.ok(this.fnHasToWait.notCalled, "Should not call autoWait");
						// default maxDelay 1000 is used again
						this.fnHasToWait.reset();
					}.bind(this)
				});
			}.bind(this)
		});
	});

	opaTest("Should load new waiter - module name", function (oOpa) {
		var assert = Opa5.assert;
		var fnDone = assert.async();
		var initWaitersCount = _autoWaiter.getWaiters().length;

		return _autoWaiter.registerWaiter("moduleNameWaiter", "fixture.ModuleWaiter").then(function (oNewWaiter) {
			var newWaiters = _autoWaiter.getWaiters();
			assert.strictEqual(newWaiters.length, initWaitersCount + 1);
			assert.strictEqual(newWaiters[newWaiters.length - 1].waiter, oNewWaiter, "New waiter is loaded");
			newWaiters[newWaiters.length - 1].waiter.hasPending = sinon.stub().returns(false);

			Opa5.extendConfig({
				autoWait: true
			});

			oOpa.waitFor({
				success: function () {
					assert.ok(this.fnHasToWait.called, "Should call autoWait");
					assert.ok(newWaiters[newWaiters.length - 1].waiter.hasPending.calledOnce, "Should call new waiter");
					fnDone();
				}.bind(this)
			});
			// queue was already emptied once by opaTest, but the queue was empty at that point
			// -> empty queue explicitly when queue is updated
			oOpa.emptyQueue();
		}.bind(this)).catch(function (oError) {
			assert.ok(false, "Error while loading ModuleWaiter by module name: " + oError);
			fnDone();
		});
	});

	opaTest("Should add new waiter - object", function (oOpa) {
		var assert = Opa5.assert;
		var fnDone = assert.async();
		var hasPending = sinon.stub().returns(false);
		var isEnabled = sinon.stub().returns(true);
		var NewWaiter = WaiterBase.extend("NewWaiterObject", {
			hasPending: hasPending,
			isEnabled: isEnabled
		});
		var initWaitersCount = _autoWaiter.getWaiters().length;
		return _autoWaiter.registerWaiter("newWaiter", new NewWaiter()).then(function (oNewWaiter) {
			var newWaiters = _autoWaiter.getWaiters();
			assert.strictEqual(newWaiters.length, initWaitersCount + 1);
			assert.strictEqual(newWaiters[newWaiters.length - 1].waiter, oNewWaiter, "New waiter is loaded");

			Opa5.extendConfig({
				autoWait: true
			});
			oOpa.waitFor({
				check: function () {
					return setTimeout(function () {},  1000);
				},
				success: function () {
					assert.ok(this.fnHasToWait.called, "Should call autoWait");
					assert.ok(hasPending.called, "Should call new waiter");
					assert.ok(isEnabled.called, "Should call new waiter");
					this.fnHasToWait.reset();
					hasPending.reset();
					isEnabled.reset();
					fnDone();
				}.bind(this)
			});
			// queue was already emptied once by opaTest, but the queue was empty at that point
			// -> empty queue explicitly when queue is updated
			oOpa.emptyQueue();
		}.bind(this)).catch(function (oError) {
			assert.ok(false, "Error while loading newWaiter by instance: " + oError);
			fnDone();
		});
	});

	opaTest("Should override existing waiter", function (oOpa) {
		var assert = Opa5.assert;
		var fnDone = assert.async();
		var initWaitersCount = _autoWaiter.getWaiters().length;
		var hasPending1 = sinon.stub().returns(false);
		var hasPending2 = sinon.stub().returns(false);
		var NewWaiter1 = WaiterBase.extend("waiter1", {
			hasPending: hasPending1
		});
		var NewWaiter2 = WaiterBase.extend("waiter2", {
			hasPending: hasPending2
		});
		return _autoWaiter.registerWaiter("existingWaiter", new NewWaiter1()).then(function () {
			assert.strictEqual(initWaitersCount + 1, _autoWaiter.getWaiters().length);
			return _autoWaiter.registerWaiter("existingWaiter", new NewWaiter2()).then(function (oNewWaiter) {
				var newWaiters = _autoWaiter.getWaiters();
				assert.strictEqual(initWaitersCount + 1, newWaiters.length);
				assert.strictEqual(newWaiters[newWaiters.length - 1].waiter, oNewWaiter, "New waiter is loaded");

				oOpa.waitFor({
					autoWait: true,
					check: function () {
						return setTimeout(function () {},  1000);
					},
					success: function () {
						assert.ok(this.fnHasToWait.called, "Should call autoWait");
						assert.ok(hasPending2.called, "Should call new waiter");
						assert.ok(hasPending1.notCalled, "Should not call overridden waiter");
						fnDone();
					}.bind(this)
				});
				// queue was already emptied once by opaTest, but the queue was empty at that point
				// -> empty queue explicitly when queue is updated
				oOpa.emptyQueue();
			}.bind(this)).catch(function (oError) {
				assert.ok(false, "Error while loading newWaiter (2) by instance: " + oError);
				fnDone();
			});
		}.bind(this)).catch(function (oError) {
			assert.ok(false, "Error while loading newWaiter (1) by instance: " + oError);
			fnDone();
		});
	});
});
