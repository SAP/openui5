/* global QUnit, sinon */

sap.ui.define([
	"sap/ui/integration/util/ServiceManager",
	"sap/ui/integration/services/Service",
	"sap/ui/core/service/ServiceFactory",
	"sap/ui/core/service/ServiceFactoryRegistry"
], function (ServiceManager, Service, ServiceFactory, ServiceFactoryRegistry) {
	"use strict";

	QUnit.module("ServiceManager Constructor");

	QUnit.test("Instantiating ServiceManager", function (assert) {

		// Arrange
		var mServiceReferences = {
			"Navigation2": {
				"factoryName": "test.service.SampleServiceFactory"
			}
		};
		var oContext = {
			id: "someid"
		};
		var fnStub = sinon.stub(ServiceManager.prototype, "_initAllServices");

		// Act & Assert
		/* eslint-disable no-new */
		assert.throws(function () {
			new ServiceManager(mServiceReferences);
		}, "Throws a missing service context exception");

		assert.throws(function () {
			new ServiceManager();
		}, "Throws a missing service references exception");

		assert.throws(function () {
			new ServiceManager(null, oContext);
		}, "Throws a missing service references exception");
		/* eslint-enable no-new */

		var oServiceManager = new ServiceManager(mServiceReferences, oContext);
		assert.ok(oServiceManager, "Should have created a new ServiceManager instance.");
		assert.equal(oServiceManager._mServiceFactoryReferences, mServiceReferences, "Should have saved the service factory references.");
		assert.equal(oServiceManager._oServiceContext, oContext, "Should have saved service context reference.");
		assert.deepEqual(oServiceManager._mServices, {}, "Should have created a new services map.");

		// Cleanup
		fnStub.restore();
	});

	QUnit.module("ServiceManager", {
		beforeEach: function () {
			var that = this;
			this.oServiceInstance = new Service();
			this.fnStub = sinon.stub(ServiceManager, "_getService").callsFake(function (oContext, sName, mServiceFactoryReferences) {
				if (sName === "FailingDataService") {
					return Promise.reject("Error.");
				} else {
					return Promise.resolve(that.oServiceInstance);
				}
			});
			this.mServiceReferences = {
				"Navigation": {
					"factoryName": "test.service.SampleServiceFactory"
				},
				"FailingDataService": {
					"factoryName": "test.service.FailingDataServiceFactory"
				}
			};
			this.oContext = {
				id: "someid"
			};
		},
		afterEach: function () {
			this.fnStub.restore();
			this.oServiceInstance = null;
			this.mServiceReferences = null;
			this.oContext = null;
		}
	});

	QUnit.test("Service initialization", function (assert) {

		// Arrange
		var done = assert.async();

		// Act
		var oServiceManager = new ServiceManager(this.mServiceReferences, this.oContext);

		// Assert
		assert.ok(oServiceManager._mServices["Navigation"].promise, "Should create a promise for the service creation.");
		assert.ok(oServiceManager._mServices["FailingDataService"].promise, "Should create a promise for the service creation.");

		var aServicePromises = [
			oServiceManager._mServices["Navigation"].promise,
			oServiceManager._mServices["FailingDataService"].promise
		];
		Promise.all(aServicePromises).then(function () {

			// Assert
			assert.ok(oServiceManager._mServices["Navigation"].instance, "Should have a ready instance of a service.");
			assert.notOk(oServiceManager._mServices["FailingDataService"].instance, "Should NOT have a ready instance when _getService fails.");

			// Cleanup
			oServiceManager.destroy();
			done();
		});
	});

	QUnit.test("getService with existing service", function (assert) {

		// Arrange
		var done = assert.async();
		var oServiceManager = new ServiceManager(this.mServiceReferences, this.oContext);

		// Act
		oServiceManager.getService("Navigation").then(function (oServiceInstance) {

			// Assert
			assert.ok(oServiceInstance, "Should return a service instance.");
			assert.ok(oServiceInstance instanceof Service, "Should return an instance of type Service.");

			// Cleanup
			oServiceManager.destroy();
			done();
		});
	});

	QUnit.test("getService with failing service instantiation", function (assert) {

		// Arrange
		var done = assert.async();
		var oServiceManager = new ServiceManager(this.mServiceReferences, this.oContext);

		// Act
		oServiceManager.getService("FailingDataService").catch(function (sError) {

			// Assert
			assert.ok(sError, "Should return an error message.");
			assert.ok(typeof sError === "string", "Should return a string.");

			// Cleanup
			oServiceManager.destroy();
			done();
		});
	});

	QUnit.test("getService with non-existing service", function (assert) {

		// Arrange
		var done = assert.async();
		var oServiceManager = new ServiceManager(this.mServiceReferences, this.oContext);

		// Act
		oServiceManager.getService("NonExistingService").catch(function (sError) {

			// Assert
			assert.ok(sError, "Should return an error message.");
			assert.ok(typeof sError === "string", "Should return a string.");

			// Cleanup
			oServiceManager.destroy();
			done();
		});
	});

	QUnit.module("ServiceManager._getService");

	QUnit.test("With missing service references", function (assert) {

		// Arrange
		var oContext = {};
		var done = assert.async();

		// Act
		ServiceManager._getService(oContext, "Navigation").catch(function () {

			// Assert
			assert.ok(true, "Should return an error when no service references are passed.");
			done();
		});
	});

	QUnit.test("With missing service name", function (assert) {

		// Arrange
		var oContext = {};
		var mServiceReferences = {
			"Navigation": {
				"factoryName": "test.service.SampleServiceFactory"
			}
		};
		var done = assert.async();

		// Act
		ServiceManager._getService(oContext, "NonExistentService", mServiceReferences).catch(function () {

			// Assert
			assert.ok(true, "Should return an error when no service references are passed.");
			done();
		});
	});

	QUnit.module("Service integration", {
		beforeEach: function () {
			this.mServiceReferences = {
				"SampleService": {
					"factoryName": "test.service.SampleServiceFactory"
				}
			};
			this.oContext = {
				oMetadata: {
					getName: function () {
						return "TestService";
					}
				},
				id: "someid",
				getMetadata: function () {
					return this.oMetadata;
				}
			};
			this.SampleServiceFactory = ServiceFactory.extend("test.service.SampleServiceFactory", {
				createInstance: function (oServiceContext) {
					return new Promise(function (resolve) {
						resolve(new Service(oServiceContext));
					});
				}
			});
			this.oSampleServiceFactory = new this.SampleServiceFactory();
			ServiceFactoryRegistry.register("test.service.SampleServiceFactory", this.oSampleServiceFactory);
		},
		afterEach: function () {
			ServiceFactoryRegistry.unregister("test.service.SampleServiceFactory");
			this.oSampleServiceFactory.destroy();
			this.oSampleServiceFactory = null;
			this.SampleServiceFactory = null;
			this.mServiceReferences = null;
			this.oContext = null;
		}
	});

	QUnit.test("sap.ui.integration.services.Service creation", function (assert) {

		// Arrange
		var done = assert.async();
		var oServiceManager = new ServiceManager(this.mServiceReferences, this.oContext);

		// Act
		oServiceManager.getService("SampleService").then(function (oServiceInstance) {

			// Assert
			assert.ok(oServiceInstance, "Should return a service instance.");
			assert.ok(oServiceInstance instanceof Service, "Should return an instance of type Service.");

			// Cleanup
			oServiceManager.destroy();
			done();
		});
	});

	QUnit.test("sap.ui.integration.services.Service with destroyed service context", function (assert) {

		// Arrange
		this.oContext.bIsDestroyed = true;
		var done = assert.async();
		var oServiceManager = new ServiceManager(this.mServiceReferences, this.oContext);

		// Act

		oServiceManager.getService("SampleService").catch(function () {

			// Assert
			assert.ok(true, "getService should fail when the control is being destroyed.");

			// Cleanup
			oServiceManager.destroy();
			done();
		});
	});
});