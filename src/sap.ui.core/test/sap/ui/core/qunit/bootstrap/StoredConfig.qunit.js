/*global QUnit, sinon */
sap.ui.define(['sap/ui/bootstrap/StoredConfig'], function(StoredConfig) {
	"use strict";

	/*eslint-disable no-console, no-native-reassign, no-undef*/
	QUnit.module("sap.ui.bootstrap.StoredConfig", {
		beforeEach: function() {
			// to check the behavior of this test in the absence of localStorage, uncomment the following line
			// delete window.localStorage;
			this.bLocalStorage = (function() {
				try {
					localStorage.setItem("foo", "foo");
					localStorage.removeItem("foo");
					return true;
				} catch (e) {
					return false;
				}
			}());
			this.alert = window.alert;
			window.alert = sinon.spy();
			sinon.stub(console, 'warn');
		},
		afterEach: function() {
			StoredConfig.debug(false);
			window.alert = this.alert;
			console.warn.restore();
		}
	});
	/*eslint-enable no-native-reassign, no-undef*/

	QUnit.test("StoredConfig.debug", function(assert) {
		assert.expect(7);
		assert.strictEqual(StoredConfig.debug(true), this.bLocalStorage ? "true" : undefined, "activation - boolean");
		assert.strictEqual(StoredConfig.debug("foo"), this.bLocalStorage ? "foo" : undefined, "activation - string");
		assert.strictEqual(StoredConfig.debug("foo"), this.bLocalStorage ? "foo" : undefined, "activation - 1");
		assert.strictEqual(StoredConfig.debug(false), this.bLocalStorage ? null : undefined, "deactivation - boolean");
		assert.strictEqual(StoredConfig.debug(null), this.bLocalStorage ? null : undefined, "deactivation - null");
		assert.strictEqual(StoredConfig.debug(0), this.bLocalStorage ? null : undefined, "deactivation - 0");

		if (this.bLocalStorage) {
			assert.equal(window.alert.callCount, 5, "alerts");
		} else {
			assert.equal(console.warn.callCount, 6, "console warnings");
		}
	});

	QUnit.test("StoredConfig.setReboot", function(assert) {
		assert.expect(4);
		assert.strictEqual(StoredConfig.setReboot("foo"), this.bLocalStorage ? "foo" : undefined, "activation - string");
		assert.strictEqual(StoredConfig.setReboot(""), this.bLocalStorage ? null : undefined, "deactivation - string");
		assert.strictEqual(StoredConfig.setReboot(), this.bLocalStorage ? null : undefined, "deactivation - undefined");

		if (this.bLocalStorage) {
			assert.equal(window.alert.callCount, 1, "alerts");
		} else {
			assert.equal(console.warn.callCount, 3, "console warnings");
		}
	});

	QUnit.test("StoredConfig.statistics", function(assert) {
		assert.expect(4);
		assert.strictEqual(StoredConfig.statistics(true), this.bLocalStorage ? true : undefined, "activation - boolean");
		assert.strictEqual(StoredConfig.statistics(false), this.bLocalStorage ? false : undefined, "deactivation - boolean");
		assert.strictEqual(StoredConfig.statistics(), this.bLocalStorage ? false : undefined, "deactivation - undefined");
		if (this.bLocalStorage) {
			assert.equal(window.alert.callCount, 2, "alerts");
		} else {
			assert.equal(console.warn.callCount, 3, "console warnings");
		}
	});

	/*eslint-enable no-console*/
});