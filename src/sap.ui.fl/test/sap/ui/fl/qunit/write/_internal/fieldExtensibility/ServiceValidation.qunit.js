/*global QUnit*/

sap.ui.define([
	"sap/ui/fl/Utils",
	"sap/ui/fl/write/_internal/fieldExtensibility/ServiceValidation",
	"sap/ui/thirdparty/sinon-4"
], function(
	Utils,
	ServiceValidation,
	sinon
) {
	"use strict";

	var sandbox = sinon.createSandbox();

	QUnit.module("ServiceValidation", {
		mUShellContainer: {
			mSystemInfo: {
				getName: function() {
					return "ABC";
				},
				getClient: function() {
					return "123";
				}
			},
			getLogonSystem: function() {
				return this.mSystemInfo;
			}
		},
		beforeEach: function () {
			sandbox.stub(Utils, "getUshellContainer").returns(this.mUShellContainer);
		},
		afterEach: function() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("Test set service invalid", function(assert) {
			var mService = {
				serviceName: "abc",
				serviceVersion: "0001"
			};

			ServiceValidation.setServiceValid(mService);
			assert.notOk(ServiceValidation.isServiceOutdated(mService));

			ServiceValidation.setServiceInvalid(mService);
			assert.ok(ServiceValidation.isServiceOutdated(mService));
			ServiceValidation.setServiceValid(mService);
			assert.notOk(ServiceValidation.isServiceOutdated(mService));
		});

		QUnit.test("Test expiration date", function(assert) {
			var mService = {
				serviceName: "abc",
				serviceVersion: "0001"
			};
			var _getCurrentTime = sandbox.stub(Date, "now");

			// Mock current time to 5
			_getCurrentTime.returns(5);

			// Clear storage
			ServiceValidation.setServiceValid(mService);
			assert.notOk(ServiceValidation.isServiceOutdated(mService));

			// Check expiration date 5 + 1 week
			ServiceValidation.setServiceInvalid(mService);
			assert.ok(ServiceValidation.isServiceOutdated(mService));

			_getCurrentTime.returns(5 + (1 * 7 * 24 * 60 * 60 * 1000) - 1);
			assert.ok(ServiceValidation.isServiceOutdated(mService));

			_getCurrentTime.returns(5 + (1 * 7 * 24 * 60 * 60 * 1000));
			assert.notOk(ServiceValidation.isServiceOutdated(mService));

			// Make sure the service has been deleted from the local storage
			if (window.localStorage) {
				var sServiceKey = this.mUShellContainer.mSystemInfo.getName() + this.mUShellContainer.mSystemInfo.getClient() + mService.serviceName + mService.serviceVersion;
				assert.notOk(window.localStorage.getItem(sServiceKey));
			}
		});

		QUnit.test("Test reinvalidate", function(assert) {
			var mService = {
				serviceName: "abc",
				serviceVersion: "0001"
			};
			var _getCurrentTime = sandbox.stub(Date, "now");

			// Clear storage
			ServiceValidation.setServiceValid(mService);
			assert.notOk(ServiceValidation.isServiceOutdated(mService));

			// Mock current time to 5 and invalidate
			_getCurrentTime.returns(5);
			ServiceValidation.setServiceInvalid(mService);

			// Two weeks have been passed
			_getCurrentTime.returns(5 + (2 * 7 * 24 * 60 * 60 * 1000));

			// The service must be valid, but the entry is still there.
			// Let`s invalidate the service again
			ServiceValidation.setServiceInvalid(mService);

			// Service have to be stale
			assert.ok(ServiceValidation.isServiceOutdated(mService));
			assert.ok(ServiceValidation.isServiceOutdated(mService));
			ServiceValidation.setServiceValid(mService);
			assert.notOk(ServiceValidation.isServiceOutdated(mService));
		});

		QUnit.test("Test logon system info not available", function(assert) {
			// The service is always valid
			var mService = {
				serviceName: "abc",
				serviceVersion: "0001"
			};
			sandbox.restore();
			ServiceValidation.setServiceValid(mService);
			assert.notOk(ServiceValidation.isServiceOutdated(mService));
			ServiceValidation.setServiceInvalid(mService);
			assert.notOk(ServiceValidation.isServiceOutdated(mService));
		});

		QUnit.test("Test uniqueness", function(assert) {
			var mService = {
				serviceName: "abc",
				serviceVersion: "0001"
			};

			var mServiceModifiedName = {
				serviceName: "abcd",
				serviceVersion: "0001"
			};

			var mServiceModifiedVersion = {
				serviceName: "abc",
				serviceVersion: "0002"
			};
			var _getCurrentTime = sandbox.stub(Date, "now");

			// Clear storage
			ServiceValidation.setServiceValid(mService);
			ServiceValidation.setServiceValid(mServiceModifiedName);
			ServiceValidation.setServiceValid(mServiceModifiedVersion);
			assert.notOk(ServiceValidation.isServiceOutdated(mService));
			assert.notOk(ServiceValidation.isServiceOutdated(mServiceModifiedName));
			assert.notOk(ServiceValidation.isServiceOutdated(mServiceModifiedVersion));

			// Mock current time to 5 and invalidate
			_getCurrentTime.returns(5);
			ServiceValidation.setServiceInvalid(mService);

			assert.ok(ServiceValidation.isServiceOutdated(mService));
			assert.notOk(ServiceValidation.isServiceOutdated(mServiceModifiedName));
			assert.notOk(ServiceValidation.isServiceOutdated(mServiceModifiedVersion));
		});

		QUnit.test("Validate local storage is used", function(assert) {
			var mService;
			var storageItem;

			// Run test only if local storage is available
			if (window.localStorage) {
				window.localStorage.setItem("state.key_-sap.ui.fl.fieldExt.Access", "\"{ }\"");

				mService = {
					serviceName: "abc",
					serviceVersion: "0001"
				};

				ServiceValidation.setServiceValid(mService);
				assert.notOk(ServiceValidation.isServiceOutdated(mService));
				ServiceValidation.setServiceInvalid(mService);
				assert.ok(ServiceValidation.isServiceOutdated(mService));

				storageItem = window.localStorage.getItem("state.key_-sap.ui.fl.fieldExt.Access");
				assert.ok(storageItem !== "\"{ }\"");
			}
			assert.ok(true);
		});

		QUnit.test("Test no local storage", function(assert) {
			// If no local storage is available => This class does nothing => A service is never outdated
			var mService = {
				serviceName: "abc",
				serviceVersion: "0001"
			};

			// We simulate a very old browser
			sandbox.stub(ServiceValidation, "getLocalStorage").callsFake(function() {
				return null;
			});

			// Execute tests
			ServiceValidation.setServiceValid(mService);
			assert.notOk(ServiceValidation.isServiceOutdated(mService));

			ServiceValidation.setServiceInvalid(mService);
			assert.notOk(ServiceValidation.isServiceOutdated(mService));

			ServiceValidation.setServiceValid(mService);
			assert.notOk(ServiceValidation.isServiceOutdated(mService));
		});

		QUnit.test("Test set service invalid with relative uri", function(assert) {
			var mService = "/sap/opu/odata/SAP/someService";
			var serviceAsObject = {
				serviceName: "someService",
				serviceVersion: "0001"
			};

			ServiceValidation.setServiceValid(mService);
			assert.notOk(ServiceValidation.isServiceOutdated(mService));

			ServiceValidation.setServiceInvalid(mService);
			assert.ok(ServiceValidation.isServiceOutdated(mService));
			ServiceValidation.setServiceValid(mService);
			assert.notOk(ServiceValidation.isServiceOutdated(mService));

			// Different parameters
			ServiceValidation.setServiceInvalid(mService);
			assert.ok(ServiceValidation.isServiceOutdated(mService));
			assert.ok(ServiceValidation.isServiceOutdated(serviceAsObject));
			ServiceValidation.setServiceValid(serviceAsObject);
			assert.notOk(ServiceValidation.isServiceOutdated(mService));
			assert.notOk(ServiceValidation.isServiceOutdated(serviceAsObject));
		});

		QUnit.test("Test set service invalid with relative and version uri", function(assert) {
			var mService = "/sap/opu/odata/SAP/someService;v=0002";
			var serviceAsObject = {
				serviceName: "someService",
				serviceVersion: "0002"
			};

			ServiceValidation.setServiceValid(mService);
			assert.notOk(ServiceValidation.isServiceOutdated(mService));

			ServiceValidation.setServiceInvalid(mService);
			assert.ok(ServiceValidation.isServiceOutdated(mService));
			ServiceValidation.setServiceValid(mService);
			assert.notOk(ServiceValidation.isServiceOutdated(mService));

			// Different parameters
			ServiceValidation.setServiceInvalid(mService);
			assert.ok(ServiceValidation.isServiceOutdated(mService));
			assert.ok(ServiceValidation.isServiceOutdated(serviceAsObject));
			ServiceValidation.setServiceValid(serviceAsObject);
			assert.notOk(ServiceValidation.isServiceOutdated(mService));
			assert.notOk(ServiceValidation.isServiceOutdated(serviceAsObject));
		});
	});

	QUnit.done(function () {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});