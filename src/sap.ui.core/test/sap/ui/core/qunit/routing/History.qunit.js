/*global QUnit, sinon*/
sap.ui.define([
	"sap/ui/core/routing/HashChanger",
	"sap/ui/core/routing/History",
	"sap/ui/Device",
	"sap/base/Log"
], function (HashChanger, History, Device, Log) {
	"use strict";

	HashChanger.getInstance().init();

	QUnit.module("history.state enhancement", {
		beforeEach: function(assert) {
			var that = this;
			this.oExtendedHashChanger = HashChanger.getInstance();
			// The fireEvent method needs to be stubbed instead of the fireHashChanged because the original
			// fireHashChanged is already registered as an event handler to hasher at HashChanger.init and
			// the stub of it here can't affect the hasher event handler anymore
			this.oFireHashChangeStub = sinon.stub(this.oExtendedHashChanger, "fireEvent").callsFake(function(sEventName, oParameter) {
				if (sEventName === "hashChanged") {
					if (that.fnBeforeFireHashChange) {
						that.fnBeforeFireHashChange();
					}
				}
				HashChanger.prototype.fireEvent.apply(this, arguments);
			});

			this.setup = function() {
				this.checkDirection = function(fnAction, fnAssertion) {
					return new Promise(function(resolve, reject) {
						var handler = function(oEvent) {
							// Assert
							fnAssertion(oEvent.getParameter("newHash"));
							// Only need the event once
							this.oExtendedHashChanger.detachEvent("hashChanged", handler);
							resolve();
						}.bind(this);

						// Setup the assertion
						this.oExtendedHashChanger.attachEvent("hashChanged", handler);

						// Trigger the history usage
						fnAction();
					}.bind(this));
				}.bind(this);

				// System under test
				this.oExtendedHashChanger.init();
				this.oHistory = History.getInstance();

				// Arrange - setup a history
				this.oExtendedHashChanger.setHash("foo");
				assert.strictEqual(this.oHistory.getDirection(), "NewEntry");

				this.oExtendedHashChanger.setHash("bar");
				assert.strictEqual(this.oHistory.getDirection(), "NewEntry");

				this.oExtendedHashChanger.setHash("foo");
				assert.strictEqual(this.oHistory.getDirection(), "NewEntry");

				return this.checkDirection(function() {
					window.history.go(-1);
				}, function(sHash) {
					if (sHash === "bar") {
						assert.strictEqual(this.oHistory.getDirection(), "Backwards");
					}
				}.bind(this));
			}.bind(this);

		},
		afterEach: function() {
			this.oExtendedHashChanger.setHash("");
			this.oFireHashChangeStub.restore();
		}
	});

	QUnit.test("Method getHistoryStateOffset", function(assert) {
		var that = this;
		var pSetup = this.setup();

		if (Device.browser.msie) {
			return pSetup.then(function() {
				assert.strictEqual(that.oHistory.getHistoryStateOffset(), undefined, "The functionality isn't available in IE");
			});
		} else {
			return pSetup.then(function() {
				assert.strictEqual(that.oHistory.getHistoryStateOffset(), 0, "History state offest is 0 after hashChange is processed");
			}).then(function() {
				that.fnBeforeFireHashChange = function() {
					assert.strictEqual(that.oHistory.getHistoryStateOffset(), undefined, "History state offset is undefined after new hash");
				};

				return that.checkDirection(function() {
					// set new hash to add a new entry to the browser history, getHistoryStateOffset returns:
					//  * undefined before hashChange event is processed
					//  * 0 after hashChange event is processed
					that.oExtendedHashChanger.setHash("foobar");
				}, function(sHash) {
					assert.strictEqual(that.oHistory.getHistoryStateOffset(), 0, "History state offest is 0 after hashChange is processed");
					delete that.fnBeforeFireHashChange;
				});
			}).then(function() {
				that.fnBeforeFireHashChange = function() {
					assert.strictEqual(that.oHistory.getHistoryStateOffset(), -2, "History state offset is -2 after window.history.go(-2)");
				};

				return that.checkDirection(function() {
					// call window.history.go with negative number to go back in browser history, getHistoryStateOffset returns:
					//  * The exact same negative number given to window.history.go before hashChange event is processed
					//  * 0 after hashChange event is processed
					window.history.go(-2);
				}, function(sHash) {
					assert.strictEqual(that.oHistory.getHistoryStateOffset(), 0, "History state offest is 0 after hashChange is processed");
					delete that.fnBeforeFireHashChange;
				});
			}).then(function() {
				that.fnBeforeFireHashChange = function() {
					assert.strictEqual(that.oHistory.getHistoryStateOffset(), 2, "History state offset is 2 after window.history.go(2)");
				};

				return that.checkDirection(function() {
					// call window.history.go with positive number to go forward in browser history, getHistoryStateOffset returns:
					//  * The exact same positive number given to window.history.go before hashChange event is processed
					//  * 0 after hashChange event is processed
					window.history.go(2);
				}, function(sHash) {
					assert.strictEqual(that.oHistory.getHistoryStateOffset(), 0, "History state offest is 0 after hashChange is processed");
					delete that.fnBeforeFireHashChange;
				});
			}).then(function() {
				that.fnBeforeFireHashChange = function() {
					var iOffset = that.oHistory.getHistoryStateOffset();
					assert.ok(iOffset === undefined || iOffset === 0, "History state offset is undefined or 0 after hash is replaced");
				};

				return that.checkDirection(function() {
					// replace the current hash in browser, getHistoryStateOffset returns:
					//  * undefined or 0 before hashChange event is processed (safari keeps the push state from last hash
					//  change, therefore 0 is returned)
					//  * 0 after hashChange event is processed
					that.oExtendedHashChanger.replaceHash("replacedHash");
				}, function(sHash) {
					assert.strictEqual(that.oHistory.getHistoryStateOffset(), 0, "History state offest is 0 after hashChange is processed");
					delete that.fnBeforeFireHashChange;
				});
			});
		}
	});

	QUnit.test("Consume fullHash parameter of hashChange event", function(assert) {
		assert.expect(5);
		return this.setup().then(function() {
			return this.checkDirection(function() {
				window.history.go(1);
			}, function(sHash) {
				if (sHash === "foo") {
					assert.strictEqual(this.oHistory.getDirection(), Device.browser.msie ? "Unknown" : "Forwards");
				}
			}.bind(this));
		}.bind(this));
	});

	QUnit.test("Log a warning if window.history.state is already in use", function (assert) {
		var oSpy = sinon.spy(Log, "debug");

		this.fnBeforeFireHashChange = function() {
			window.history.replaceState("invalid_state", window.document.title);
		};

		assert.expect(6);
		return this.setup().then(function() {
			return this.checkDirection(function() {
				window.history.go(1);
			}, function(sHash) {
				if (sHash === "foo") {
					assert.strictEqual(this.oHistory.getDirection(), "Unknown");
				}
			}.bind(this));
		}.bind(this)).then(function() {
			if (Device.browser.msie) {
				assert.equal(oSpy.callCount, 0, "there's no log written for IE");
			} else {
				assert.ok(oSpy.alwaysCalledWith("Unable to determine HistoryDirection as history.state is already set: invalid_state", "sap.ui.core.routing.History"), "The debug log is done correctly");
			}
			oSpy.restore();
		});
	});

	QUnit.test("The new direction method should return undefined if hashChanged event is fired without browser hash change", function(assert) {
		assert.expect(Device.browser.msie ? 6 : 7);
		var oSpy, that = this;
		return this.setup().then(function() {
			return that.checkDirection(function() {
				oSpy = sinon.spy(that.oHistory, "_getDirectionWithState");
				that.oExtendedHashChanger.fireHashChanged("");
			}, function(sHash) {
				if (sHash === "") {
					if (Device.browser.msie) {
						assert.equal(oSpy.callCount, 0, "function is not called in IE");
					} else {
						assert.equal(oSpy.callCount, 1, "function is called once");
					}
					if (!Device.browser.msie) {
						assert.equal(oSpy.getCall(0).returnValue, undefined, "the function should return undefined");
					}
					assert.strictEqual(that.oHistory.getDirection(), "Unknown", "the direction should be Unknown");
					oSpy.restore();
				}
			});
		});
	});

	QUnit.test("Direction determination after a hash is replaced", function(assert) {
		assert.expect(7);
		var that = this;
		return this.setup().then(function() {
			return that.checkDirection(function() {
				that.oExtendedHashChanger.replaceHash("replaced");
			}, function(sHash) {
				if (sHash === "replaced") {
					assert.strictEqual(that.oHistory.getDirection(), "Unknown", "The direction should be Unknown after the hash is replaced");
				}
			});
		}).then(function() {
			that.oExtendedHashChanger.setHash("afterReplaced");
			assert.strictEqual(that.oHistory.getDirection(), "NewEntry", "The direction is new entry");
		}).then(function() {
			return that.checkDirection(function() {
				window.history.back();
			}, function(sHash) {
				assert.strictEqual(that.oHistory.getDirection(), "Backwards", "The direction should be Backwards");
			});
		});
	});

	QUnit.module("history management", {
		beforeEach : function() {
			HashChanger.getInstance().replaceHash(""); //since the initial hash will be parsed, we want it to be empty on every test
		}
	});

	// singleton test only runs standalone
	QUnit.test("Should use the hashChanger in the singleton", function(assert) {
		//System under Test
		var oHashChanger = HashChanger.getInstance();
		var sut = History.getInstance(),
			oHashChanged = this.spy(sut, "_hashChangedByApp"),
			lengthBefore = sut.aHistory.length;

		//Act
		oHashChanger.setHash("foo");
		oHashChanger.replaceHash("bar");

		//Assert
		assert.strictEqual(sut, History.getInstance(), "Should be a singleton");

		assert.strictEqual(oHashChanged.callCount, 2, "Should be called twice");

		assert.ok(oHashChanged.firstCall.calledWithExactly("foo", false), "Should register to setHash");
		assert.ok(oHashChanged.secondCall.calledWithExactly("bar", true), "Should register to replaceHash");

		assert.strictEqual(sut.aHistory.length, lengthBefore + 1, "should have 1 entry in the history");
		assert.strictEqual(sut.aHistory[lengthBefore], "bar");

	});

	// The functionality of the sap.ui.core.routing.History heavily depends on the events of the HashChanger.
	// The HashChanger allows to replace the default instance with a custom implementation to intercept the logic -
	// this is currently done by the unified shell in order to handle cross-application navigation.
	// Factoring out the unit tests into this module allows to execute the same test suite in the shell context
	sap.ui.require(["sap/ui/core/qunit/routing/HistoryQunit"], function() {
		QUnit.start();
	});

});
