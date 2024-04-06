/*global QUnit */
sap.ui.define([
	"sap/ui/Device",
	"sap/base/Log",
	"sap/ui/core/cache/CacheManager"
], function(Device, Log, CacheManager) {
	"use strict";

	var aSupportedEnv = [];

	aSupportedEnv.push({
		system: Device.system.SYSTEMTYPE.DESKTOP,
		browserName: Device.browser.BROWSER.CHROME,
		browserVersion: 49
	});
	aSupportedEnv.push({
		system: Device.system.SYSTEMTYPE.DESKTOP,
		browserName: Device.browser.BROWSER.SAFARI,
		browserVersion: 13
	});
	aSupportedEnv.push({
		system: Device.system.SYSTEMTYPE.TABLET,
		browserName: Device.browser.BROWSER.SAFARI,
		browserVersion: 13
	});
	aSupportedEnv.push({
		system: Device.system.SYSTEMTYPE.PHONE,
		browserName: Device.browser.BROWSER.SAFARI,
		browserVersion: 13
	});
	aSupportedEnv.push({
		system: Device.system.SYSTEMTYPE.TABLET,
		os: Device.os.OS.ANDROID,
		browserName: Device.browser.BROWSER.CHROME,
		browserVersion:80
	});
	aSupportedEnv.push({
		system: Device.system.SYSTEMTYPE.PHONE,
		os: Device.os.OS.ANDROID,
		browserName: Device.browser.BROWSER.CHROME,
		browserVersion: 80
	});
	var bSupportedEnv = aSupportedEnv.some(function(oSuppportedEnv) {
		var bSupportedSystem = Device.system[oSuppportedEnv.system],
			bSupportedOSName = oSuppportedEnv.os ? oSuppportedEnv.os === Device.os.name : true,
			bSupportedBrowserName = oSuppportedEnv.browserName === Device.browser.name,
			bSupportedBrowserVersion = Device.browser.version >= oSuppportedEnv.browserVersion;

		return bSupportedSystem && bSupportedOSName && bSupportedBrowserName && bSupportedBrowserVersion && window.indexedDB;
	});

	if (!bSupportedEnv) {
		QUnit.test("All tests are skipped, as the CacheManager is not supported on the underlying environment (see assert)", function(assert) {
			assert.ok(true, "Environment: system [" + JSON.stringify(Device.system) + "],  browser: " +
				JSON.stringify(Device.browser) + ", window.indexedDB: " + window.indexedDB);
		});
	} else {
		QUnit.module("Instantiation", {
			beforeEach: function() {
				this.oBrowserBackup = Object.assign({}, Device.browser);
				this.oSystemBackup = Object.assign({}, Device.system);

			},
			afterEach: function() {
				if (CacheManager._instance) {
					CacheManager._instance._db.close();
					CacheManager._instance = null;
					CacheManager._bSupportedEnvironment = null;
				}
				Device.browser = this.oBrowserBackup;
				Device.system = this.oSystemBackup;
			}
		});

		QUnit.test('basic creation', function(assert) {
			CacheManager._instance = null;
			return CacheManager._getInstance()
				.then(function(cmImpl) {
					assert.ok(cmImpl, 'Should return a cache implementation');
					CacheManager._instance.myOwn = "created";
					return CacheManager._getInstance().then(function(cm) {
						assert.ok(cm.myOwn, "Calling getInstance for the second time returns the previous instance");
					});
				});
		});

		QUnit.test("Certain implementation is selected based on browser support", function(assert) {
			var that = this,
				aNonSupportedEnv = [];

			function doesEnvMatch(oEnv, oSupportedEnv) {
				return (
					oSupportedEnv.system === oEnv.system
					&& (oSupportedEnv.os ? oSupportedEnv.os === oEnv.os : true)
					&& oSupportedEnv.browserName === oEnv.browserName
					&& oEnv.browserVersion >= oSupportedEnv.browserVersion
				);
			}

			// Iterate over all environments and collect those which does not match the supported ones (aSupportedEnv)
			for (var syst in Device.system.SYSTEMTYPE) {
				for (var browser in Device.browser.BROWSER) {
					for (var os in Device.os.OS) {
						var oEnv = {
							system: Device.system.SYSTEMTYPE[syst],
							os: Device.os.OS[os],
							browserName: Device.browser.BROWSER[browser],
							browserVersion: Device.browser.version
						};

						if (!aSupportedEnv.some(doesEnvMatch.bind(null, oEnv)) ) {
							aNonSupportedEnv.push(oEnv);
						}
					}
				}
			}

			// Creates an instance of CacheManager and check if the internal implementation is of expected type
			function createInstance(env, sExpectedImplementation) {
				if (CacheManager._instance) {
					CacheManager._instance._db.close();
					CacheManager._instance = undefined;
				}
				CacheManager._bSupportedEnvironment = null;

				// Act
				return CacheManager._getInstance().then(function(cmImpl) {
					// Assert
					assert.equal(cmImpl.name, sExpectedImplementation, "For environment [" + JSON.stringify(env) +
						"] implementation [" + sExpectedImplementation + "] is required");
				});
			}
			// Real cache manager implementation should be used.
			return Promise.all(aSupportedEnv.map(function(oEnv) {
				// Arrange
				that.stub(Device.system, oEnv.system).value(true);
				if (oEnv.os) {
					 that.stub(Device.os, "name").value(oEnv.os);
					}
				that.stub(Device.browser, "name").value(oEnv.browserName);
				that.stub(Device.browser, "version").value(oEnv.browserVersion);

				// Act && Assert
				return createInstance(oEnv, "LRUPersistentCache");
			})).then(function() {
				// NOP cache manager implementation should be used.
				return Promise.all(aNonSupportedEnv.map(function(oEnv) {
					// Arrange
					for (var systemType in Device.system.SYSTEMTYPE) {
						if (Device.system.SYSTEMTYPE[systemType] === oEnv.system) {
							that.stub(Device.system, oEnv.system).value(true);
						} else {
							that.stub(Device.system, Device.system.SYSTEMTYPE[systemType]).value(false);
						}
					}
					if (oEnv.os) {
						that.stub(Device.os, "name").value(oEnv.os);
					}
					that.stub(Device.browser, "name").value(oEnv.browserName);
					that.stub(Device.browser, "version").value(oEnv.browserVersion);

					// Act && Assert
					return createInstance(oEnv, "CacheManagerNOP");
				}));
			});
		});


		//Testing mainly _callInstanceMethod method
		QUnit.module("Proxy: each API call is being forwarded to the real implementation", {
			beforeEach: function(assert) {

				/**
				 * Executes given method with given arguments and verifies the execution had happened.
				 * @param {string} sMethod the method
				 * @param {string[]} args the arguments to call the method with
				 * @param {string} resolveValue value that the Promise resolves with
				 * @returns {*}
				 */
				this.executeMethodSuccessfully = function(sMethod, args, resolveValue) {
					var that = this;
					that.instanceMock = that.mock(CacheManager._instance);
					that.instanceMock.expects(sMethod).once().withExactArgs(args).returns(Promise.resolve(resolveValue));

					return CacheManager[sMethod](args).then(function(value) {
						that.instanceMock.verify();
						assert.equal(value, resolveValue, "Promise must be resolved with the given value");
					}, function(error) {
						assert.ok(false, "Calling CacheManager." + sMethod + " should have resolved, but it rejects with error [" + error + "]");
					});
				};

				/**
				 * Executes given method with given arguments and verifies the execution had happened.
				 * @param {string} sMethod CacheManager method to call
				 * @param {any[]} args Arguments to call the method with
				 * @param {any} rejectValue value to reject the Promise with
				 * @returns {Promise}
				 */
				this.executeMethodWithError = function(sMethod, args, rejectValue) {
					var that = this;

					that.instanceMock = that.mock(CacheManager._instance);
					that.instanceMock.expects(sMethod).withExactArgs(args).returns(Promise.reject(rejectValue));

					return CacheManager[sMethod](args).then(function(value) {
						assert.ok(false, "Calling CacheManager." + sMethod + " should have rejected, but it succeeds with value [" + value + "]");
					}, function(value) {
						that.instanceMock.verify();
						assert.equal(value, rejectValue, "Promise must be rejected with the given value");
					});
				};

				if (CacheManager._instance == null) {
					return CacheManager._getInstance();
				}

			},
			afterEach: function() {}
		});

		QUnit.test("#get", function(assert) {
			return this.executeMethodSuccessfully("get", ["promised_sallary"], "1000E").then(function() {
				return this.executeMethodWithError("get", ["actual_sallary"], "Error: access denied");
			}.bind(this));
		});

		QUnit.test("#has", function(assert) {
			return this.executeMethodSuccessfully("has", ["promised_sallary"], true).then(function() {
				return this.executeMethodWithError("has", ["actual_sallary"], "Error: access denied");
			}.bind(this));
		});

		QUnit.test("#set", function(assert) {
			return this.executeMethodSuccessfully("set", ["promised_sallary", {
				"amount": "1000E"
			}]).then(function() {
				return this.executeMethodWithError("set", ["promised_sallary", {
					"amount": "1000E"
				}], "Error: access denied");
			}.bind(this));
		});

		QUnit.test("#del", function(assert) {
			return this.executeMethodSuccessfully("del", ["promised_sallary"]).then(function() {
				this.executeMethodWithError("del", ["promised_sallary"], "Error: access denied");
			}.bind(this));
		});

		QUnit.test("#reset", function(assert) {
			return this.executeMethodSuccessfully("reset", []).then(function() {
				return this.executeMethodWithError("reset", ["promised_sallary"], "Error: access denied");
			}.bind(this));
		});

		QUnit.test("#delWithFilters", function(assert) {
			return this.executeMethodSuccessfully("delWithFilters", [{ prefix: "key1", olderThan: new Date() }]).then(function() {
				return this.executeMethodWithError("delWithFilters", [{ prefix: "key1", olderThan: new Date() }], "Error: access denied");
			}.bind(this));
		});

		QUnit.module("Switching on/off", {
			afterEach: function() {
				return deleteDatabaseEntries();
			}
		});

		QUnit.test("Switching", function(assert) {
			return CacheManager._switchOn().then(function() {
				return CacheManager.set("testKey", "testValue");
			}).then(function() {
				return CacheManager._switchOff();
			}).then(function() {
				assert.ok(!CacheManager._instance, "After shutdown, no _instance should exist.");
				return CacheManager.get("testKey");
			}).then(function(value) {
				assert.ok(CacheManager._instance, "After shutdown, on the first get the CM will reinit itself");
				assert.equal(typeof value, "undefined", "The implementation has been switched with dummy one, so no response is expected");
			}).then(function() {
				return CacheManager._switchOn();
			}).then(function() {
				return CacheManager.get("testKey");
			}).then(function(value) {
				assert.ok(CacheManager._instance, "After shutdown, the first #get will reinit the instance");
				assert.equal(value, "testValue", "The implementation has been switched with real one, so a certain #get response is expected");
			});
		});

	}

	function deleteDatabaseEntries() {
		if (CacheManager) {
			return Promise.resolve(function() {
				Log.debug(new Date() + ". Deleting all entries");
			}).then(function() {
				return CacheManager.reset();
			}).then(function() {
				Log.debug(new Date() + ". Entries deleted ");
			});
		}
	}
});