/*global QUnit, sinon */

sap.ui.define([
	"sap/ui/integration/cards/DataProviderFactory",
	"sap/ui/integration/cards/ServiceDataProvider",
	"sap/ui/integration/cards/DataProvider",
	"sap/ui/integration/cards/RequestDataProvider"
],
function (DataProviderFactory, ServiceDataProvider, DataProvider, RequestDataProvider) {
	"use strict";

	// Regression test
	function testSetSettings(DataProviderClass) {
		var oDataProvider = new DataProviderClass();

		QUnit.test("setSettings - regression test for " + oDataProvider.getMetadata().getName(), function (assert) {

			// Arrange
			var oSettings = {
				"key": "value"
			};

			// Act
			oDataProvider.setSettings(oSettings);

			// Assert
			assert.deepEqual(oDataProvider.getSettings(), oSettings, "Getters and setters should work as expected.");

			// Cleanup
			oDataProvider.destroy();
			oDataProvider = null;
		});
	}

	QUnit.module("DataProviderFactory", {
		beforeEach: function () {
			this.oDataProviderFactory = new DataProviderFactory();
			sinon.stub(DataProvider.prototype, "setSettings");
		},
		afterEach: function () {
			DataProvider.prototype.setSettings.restore();
			this.oDataProviderFactory.destroy();
			this.oDataProviderFactory = null;
		}
	});

	QUnit.test("create with null or undefined", function (assert) {
		assert.notOk(this.oDataProviderFactory.create(null), "Should have NOT created a DataProvider instance.");
		assert.notOk(this.oDataProviderFactory.create(), "Should have NOT created a DataProvider instance.");
		assert.notOk(DataProvider.prototype.setSettings.calledOnce, "Should have NOT called setSettings.");
	});

	QUnit.test("create with unknown settings", function (assert) {
		// Arrange
		var oDataSettings = {
			destination: {
				url: "/some/relative/url"
			}
		};

		// Act
		var oDataProvider = this.oDataProviderFactory.create(oDataSettings);

		// Assert
		assert.notOk(oDataProvider, "Should have NOT created a DataProvider instance.");
		assert.notOk(DataProvider.prototype.setSettings.calledOnce, "Should have NOT called setSettings.");
	});

	QUnit.test("create with request settings", function (assert) {
		// Arrange
		var oDataSettings = {
			request: {
				url: "/some/relative/url"
			}
		};

		// Act
		var oDataProvider = this.oDataProviderFactory.create(oDataSettings);

		// Assert
		assert.ok(oDataProvider, "Should have created a DataProvider instance.");
		assert.ok(oDataProvider.isA("sap.ui.integration.cards.RequestDataProvider"), "Should have created a DataProvider instance of type RequestDataProvider.");
		assert.ok(DataProvider.prototype.setSettings.calledOnce, "Should have called setSettings.");
		assert.ok(DataProvider.prototype.setSettings.getCall(0).calledWith(oDataSettings), "Should have called setSettings with correct arguments.");
	});

	QUnit.test("create with service settings", function (assert) {
		// Arrange
		var oDataSettings = {
			service: {
				name: "UserRecent"
			}
		};
		var oServiceManager = {};
		sinon.stub(ServiceDataProvider.prototype, "createServiceInstances");

		// Act
		var oDataProvider = this.oDataProviderFactory.create(oDataSettings, oServiceManager);

		// Assert
		assert.ok(oDataProvider, "Should have created a DataProvider instance.");
		assert.ok(oDataProvider.isA("sap.ui.integration.cards.ServiceDataProvider"), "Should have created a DataProvider instance of type ServiceDataProvider.");
		assert.ok(DataProvider.prototype.setSettings.calledOnce, "Should have called setSettings.");
		assert.ok(DataProvider.prototype.setSettings.getCall(0).calledWith(oDataSettings), "Should have called setSettings with correct arguments.");
		assert.ok(ServiceDataProvider.prototype.createServiceInstances.calledOnce, "Should have called createServiceInstances.");
		assert.ok(ServiceDataProvider.prototype.createServiceInstances.getCall(0).calledWith(oServiceManager), "Should have called createServiceInstances with ServiceManager reference.");

		// Cleanup
		ServiceDataProvider.prototype.createServiceInstances.restore();
	});

	QUnit.test("create with static JSON settings", function (assert) {
		// Arrange
		var oDataSettings = {
			json: {
				"key": "value"
			},
			updateInterval: 1
		};
		var fnSpy = sinon.spy(DataProvider.prototype, "setUpdateInterval");

		// Act
		var oDataProvider = this.oDataProviderFactory.create(oDataSettings);

		// Assert
		assert.ok(DataProvider.prototype.setSettings.calledOnce, "Should have called setSettings.");
		assert.ok(DataProvider.prototype.setSettings.getCall(0).calledWith(oDataSettings), "Should have called setSettings with correct arguments.");
		assert.ok(DataProvider.prototype.setUpdateInterval.calledOnce, "Should have called setUpdateInterval.");
		assert.ok(oDataProvider, "Should have created a DataProvider instance.");
		assert.ok(oDataProvider.isA("sap.ui.integration.cards.DataProvider"), "Should have created a DataProvider instance.");

		// Cleanup
		fnSpy.restore();
	});

	QUnit.test("destroy", function (assert) {
		// Arrange
		var oSettings = {
			json: {
				key: "value"
			}
		};

		var oDataProvider = this.oDataProviderFactory.create(oSettings),
			oDestroySpy = sinon.spy(oDataProvider, "destroy");

		// Act
		this.oDataProviderFactory.destroy();

		// Assert
		assert.ok(oDestroySpy.calledOnce, "Should destroy all created instances when destroying the factory.");
	});

	QUnit.module("DataProvider", {
		beforeEach: function () {
			this.oDataProvider = new DataProvider();
		},
		afterEach: function () {
			this.oDataProvider.destroy();
			this.oDataProvider = null;
		}
	});

	testSetSettings(DataProvider);

	QUnit.test("Refreshing interval", function (assert) {

		// Arrange
		this.clock = sinon.useFakeTimers(0);
		var oSettings = {
			json: {
				"key": "value"
			}
		};
		var iInterval = 1;
		var iTickInterval = iInterval * 1000;
		this.oDataProvider.setSettings(oSettings);
		var fnStub = sinon.stub(DataProvider.prototype, "triggerDataUpdate");

		// Act
		this.oDataProvider.setUpdateInterval(iInterval);

		// Assert
		this.clock.tick(iTickInterval);
		assert.ok(fnStub.calledOnce, "Should call triggerDataUpdate");

		this.clock.tick(iTickInterval);
		assert.ok(fnStub.calledTwice, "Should call triggerDataUpdate");

		this.clock.tick(iTickInterval);
		assert.ok(fnStub.calledThrice, "Should call triggerDataUpdate");

		// Cleanup
		fnStub.restore();
		this.clock.restore();
	});

	QUnit.test("Incorrect refreshing interval", function (assert) {

		// Arrange
		var oSettings = {
			json: {
				"key": "value"
			}
		};
		var iInterval = "Incorrect interval";
		this.oDataProvider.setSettings(oSettings);

		// Act
		this.oDataProvider.setUpdateInterval(iInterval);

		// Assert
		assert.notOk(this.oDataProvider._iIntervalId, "Should have NOT set an interval.");
	});

	QUnit.test("triggerDataUpdate - with JSON", function (assert) {

		// Arrange
		var done = assert.async();
		var oSettings = {
			json: {
				"key": "value"
			}
		};
		var fnErrorSpy = sinon.spy();
		this.oDataProvider.setSettings(oSettings);
		this.oDataProvider.attachError(fnErrorSpy);
		this.oDataProvider.attachDataChanged(function (oEvent) {

			// Assert
			var oData = oEvent.getParameter("data");
			assert.ok(fnErrorSpy.notCalled, "Should NOT call error event handler.");
			assert.deepEqual(oSettings.json, oData, "Should have correct data.");

			done();
		});

		// Act
		this.oDataProvider.triggerDataUpdate();
	});

	QUnit.test("triggerDataUpdate - missing JSON", function (assert) {

		// Arrange
		var done = assert.async();
		var oSettings = {};
		var fnDataChangedSpy = sinon.spy();
		this.oDataProvider.setSettings(oSettings);
		this.oDataProvider.attachError(function (oEvent) {

			// Assert
			var sMessage = oEvent.getParameter("message");
			assert.ok(sMessage, "Should have an error message.");
			assert.ok(fnDataChangedSpy.notCalled, "Should NOT call data changed event handler.");

			done();
		});
		this.oDataProvider.attachDataChanged(fnDataChangedSpy);

		// Act
		this.oDataProvider.triggerDataUpdate();
	});

	QUnit.module("RequestDataProvider", {
		beforeEach: function () {
			this.oDataProvider = new RequestDataProvider();
			this.deferred = new jQuery.Deferred();
			sinon.stub(jQuery, "ajax").callsFake(function () {
				return this.deferred.promise();
			}.bind(this));
		},
		afterEach: function () {
			this.oDataProvider.destroy();
			this.oDataProvider = null;
			jQuery.ajax.restore();
		}
	});

	testSetSettings(RequestDataProvider);

	QUnit.test("method _isValidRequest", function (assert) {
		assert.notOk(this.oDataProvider._isValidRequest({}), "Should have an invalid request.");
		assert.notOk(this.oDataProvider._isValidRequest({ url: 5 }), "Should have an invalid request.");
		assert.notOk(this.oDataProvider._isValidRequest(), "Should have an invalid request.");

		var oInvalidRequest = {
			url: "some/relative/url",
			mode: "no-cors",
			method: "SOME INVALID METHOD"
		};
		assert.notOk(this.oDataProvider._isValidRequest(oInvalidRequest), "Should have an invalid request.");

		var oValidRequest = {
			url: "some/relative/url",
			mode: "no-cors",
			method: "GET"
		};
		assert.ok(this.oDataProvider._isValidRequest(oValidRequest), "Should have a valid request.");
	});

	QUnit.test("triggerDataUpdate - request successful", function (assert) {

		// Arrange
		var done = assert.async();
		var oSettings = {
			request: {
				"url": "some/relative/url"
			}
		};
		var fnErrorSpy = sinon.spy();
		this.oDataProvider.setSettings(oSettings);
		this.oDataProvider.attachError(fnErrorSpy);
		this.oDataProvider.attachDataChanged(function (oEvent) {

			// Assert
			var oData = oEvent.getParameter("data");
			assert.ok(fnErrorSpy.notCalled, "Should NOT call error event handler.");
			assert.ok(oData.mockData, "Should have the new data.");

			done();
		});

		// Act
		this.oDataProvider.triggerDataUpdate();
		this.deferred.resolve({
			mockData: [1, 2, 3]
		});
	});

	QUnit.test("triggerDataUpdate - missing request", function (assert) {

		// Arrange
		var done = assert.async();
		var oSettings = {};
		var fnDataChangedSpy = sinon.spy();
		this.oDataProvider.setSettings(oSettings);
		this.oDataProvider.attachError(function (oEvent) {

			// Assert
			var sMessage = oEvent.getParameter("message");
			assert.ok(sMessage, "Should have an error message.");
			assert.ok(fnDataChangedSpy.notCalled, "Should NOT call data changed event handler.");

			done();
		});
		this.oDataProvider.attachDataChanged(fnDataChangedSpy);

		// Act
		this.oDataProvider.triggerDataUpdate();
	});

	QUnit.test("triggerDataUpdate - invalid request", function (assert) {

		// Arrange
		var done = assert.async();
		var oSettings = {
			request: 5
		};
		var fnDataChangedSpy = sinon.spy();
		this.oDataProvider.setSettings(oSettings);
		this.oDataProvider.attachError(function (oEvent) {

			// Assert
			var sMessage = oEvent.getParameter("message");
			assert.ok(sMessage, "Should have an error message.");
			assert.ok(fnDataChangedSpy.notCalled, "Should NOT call data changed event handler.");

			done();
		});
		this.oDataProvider.attachDataChanged(fnDataChangedSpy);

		// Act
		this.oDataProvider.triggerDataUpdate();
	});

	QUnit.test("triggerDataUpdate - request fails", function (assert) {

		// Arrange
		var done = assert.async();
		var oSettings = {
			request: {
				"url": "some/relative/url"
			}
		};
		var fnDataChangedSpy = sinon.spy();
		this.oDataProvider.setSettings(oSettings);
		this.oDataProvider.attachError(function (oEvent) {

			// Assert
			var sMessage = oEvent.getParameter("message");
			assert.ok(sMessage, "Should have an error message.");
			assert.ok(fnDataChangedSpy.notCalled, "Should NOT call data changed event handler.");

			done();
		});
		this.oDataProvider.attachDataChanged(fnDataChangedSpy);

		// Act
		this.oDataProvider.triggerDataUpdate();
		this.deferred.reject(null, null, "Some error message.");
	});

	QUnit.module("ServiceDataProvider", {
		beforeEach: function () {
			var that = this;
			this.oDataProvider = new ServiceDataProvider();
			this.oData = {
				data: {
					"key": "value"
				}
			};

			// Mocks a sap.ui.integration.util.ServiceManager.
			this.oServiceManagerMock = {
				_getServiceShouldFail: false,
				getService: function () {
					if (this._getServiceShouldFail) {
						return Promise.reject("Some error message.");
					} else {
						return Promise.resolve(that.oServiceInstanceMock);
					}
				}
			};

			// Mocks an instance of a service implementing sap.ui.integration.services.Data interface.
			this.oServiceInstanceMock = {
				_getDataShouldFail: false,
				update: function () {
					this._fnCbk(that.oData);
				},
				attachDataChanged: function (fnCbk) {
					this._fnCbk = fnCbk;
				},
				getData: function () {
					if (this._getDataShouldFail) {
						return Promise.reject("Some error message.");
					} else {
						return Promise.resolve(that.oData);
					}
				}
			};
		},
		afterEach: function () {
			this.oDataProvider.destroy();
			this.oDataProvider = null;
			this.oData = null;
			this.oServiceManagerMock = null;
			this.oServiceInstanceMock = null;
		}
	});

	testSetSettings(ServiceDataProvider);

	QUnit.test("triggerDataUpdate - data request successful", function (assert) {

		// Arrange
		var done = assert.async();
		var oDataSettings = {
			service: "UserRecent"
		};
		var fnErrorSpy = sinon.spy();

		this.oDataProvider.attachError(fnErrorSpy);
		this.oDataProvider.attachDataChanged(function (oEvent) {

			// Assert
			assert.ok(fnErrorSpy.notCalled, "Should NOT call the error handler.");
			assert.deepEqual(oEvent.getParameter("data"), this.oData, "Should have correct data.");

			done();
		}.bind(this));
		this.oDataProvider.setSettings(oDataSettings);
		this.oDataProvider.createServiceInstances(this.oServiceManagerMock);

		// Act
		this.oDataProvider.triggerDataUpdate();
	});

	QUnit.test("triggerDataUpdate - data request failed", function (assert) {

		// Arrange
		var done = assert.async();
		var oDataSettings = {
			service: "UserRecent"
		};
		var fnDataChangedSpy = sinon.spy();
		this.oServiceInstanceMock._getDataShouldFail = true;

		this.oDataProvider.attachDataChanged(fnDataChangedSpy);
		this.oDataProvider.attachError(function (oEvent) {

			// Assert
			assert.ok(fnDataChangedSpy.notCalled, "Should NOT call data changed handler.");
			assert.ok(oEvent.getParameter("message"), "Should have an error message.");

			done();
		});
		this.oDataProvider.setSettings(oDataSettings);
		this.oDataProvider.createServiceInstances(this.oServiceManagerMock);

		// Act
		this.oDataProvider.triggerDataUpdate();
	});

	QUnit.test("triggerDataUpdate - No service instance", function (assert) {

		// Arrange
		var done = assert.async();
		var oDataSettings = {
			service: "UserRecent"
		};
		var fnDataChangedSpy = sinon.spy();
		this.oServiceInstanceMock._getDataShouldFail = true;

		this.oDataProvider.attachDataChanged(fnDataChangedSpy);
		this.oDataProvider.attachError(function (oEvent) {

			// Assert
			assert.ok(fnDataChangedSpy.notCalled, "Should NOT call data changed handler.");
			assert.ok(oEvent.getParameter("message"), "Should have an error message.");

			done();
		});
		this.oDataProvider.setSettings(oDataSettings);

		// Act
		this.oDataProvider.triggerDataUpdate();
	});

	QUnit.test("No service instance", function (assert) {

		// Arrange
		var done = assert.async();
		var oDataSettings = {
			service: "UserRecent"
		};
		var fnDataChangedSpy = sinon.spy();
		this.oServiceManagerMock._getServiceShouldFail = true;

		this.oDataProvider.attachDataChanged(fnDataChangedSpy);
		this.oDataProvider.attachError(function (oEvent) {

			// Assert
			assert.ok(fnDataChangedSpy.notCalled, "Should NOT call data changed handler.");
			assert.ok(oEvent.getParameter("message"), "Should have an error message.");

			done();
		});
		this.oDataProvider.setSettings(oDataSettings);
		this.oDataProvider.createServiceInstances(this.oServiceManagerMock);

		// Act
		this.oDataProvider.triggerDataUpdate();
	});

	QUnit.test("Service triggers data changed", function (assert) {

		// Arrange
		var done = assert.async();
		var oDataSettings = {
			service: {
				name: "UserRecent"
			}
		};
		var fnErrorSpy = sinon.spy();
		var fnDataChangedSpy = sinon.spy();

		this.oDataProvider.attachError(fnErrorSpy);
		this.oDataProvider.attachDataChanged(fnDataChangedSpy);
		this.oDataProvider.setSettings(oDataSettings);
		this.oDataProvider.createServiceInstances(this.oServiceManagerMock);

		this.oDataProvider._oDataServicePromise.then(function () {

			// Act
			this.oServiceInstanceMock.update();
			this.oServiceInstanceMock.update();
			this.oServiceInstanceMock.update();

			// Assert
			assert.ok(fnErrorSpy.notCalled, "Should NOT call the error handler.");
			assert.equal(fnDataChangedSpy.callCount, 3, "Should call data changed handler three times.");

			done();
		}.bind(this));
	});

	QUnit.test("createServiceInstances after setSettings", function (assert) {

		// Arrange
		var done = assert.async();
		var oDataSettings = {
			service: {
				name: "UserRecent"
			}
		};
		var fnErrorSpy = sinon.spy();
		var fnDataChangedSpy = sinon.spy();

		this.oDataProvider.attachError(fnErrorSpy);
		this.oDataProvider.attachDataChanged(fnDataChangedSpy);
		this.oDataProvider.createServiceInstances(this.oServiceManagerMock);
		this.oDataProvider.setSettings(oDataSettings);

		// Act
		this.oDataProvider.triggerDataUpdate().then(function () {

			// Assert
			assert.ok(fnErrorSpy.calledOnce, "Should have an error message.");
			assert.ok(fnDataChangedSpy.notCalled, "Should NOT call data changed handler.");

			done();
		});
	});
});