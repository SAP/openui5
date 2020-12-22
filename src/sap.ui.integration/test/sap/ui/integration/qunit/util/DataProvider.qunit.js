/*global QUnit, sinon */

sap.ui.define([
	"sap/ui/core/Core",
	"sap/ui/integration/util/DataProviderFactory",
	"sap/ui/integration/util/ServiceDataProvider",
	"sap/ui/integration/util/DataProvider",
	"sap/ui/integration/util/RequestDataProvider",
	"sap/ui/integration/widgets/Card"
], function (
	Core,
	DataProviderFactory,
	ServiceDataProvider,
	DataProvider,
	RequestDataProvider,
	Card
) {
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
			this.oCard = new Card();
			this.oDataProviderFactory = new DataProviderFactory(null, null, this.oCard);
			sinon.stub(DataProvider.prototype, "setSettings");
		},
		afterEach: function () {
			DataProvider.prototype.setSettings.restore();
			this.oDataProviderFactory.destroy();
			this.oDataProviderFactory = null;
			this.oCard.destroy();
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
		assert.ok(oDataProvider.isA("sap.ui.integration.util.RequestDataProvider"), "Should have created a DataProvider instance of type RequestDataProvider.");
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
		assert.ok(oDataProvider.isA("sap.ui.integration.util.ServiceDataProvider"), "Should have created a DataProvider instance of type ServiceDataProvider.");
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

		// Act
		var oDataProvider = this.oDataProviderFactory.create(oDataSettings);

		// Assert
		assert.ok(DataProvider.prototype.setSettings.calledOnce, "Should have called setSettings.");
		assert.ok(DataProvider.prototype.setSettings.getCall(0).calledWith(oDataSettings), "Should have called setSettings with correct arguments.");
		assert.ok(oDataProvider, "Should have created a DataProvider instance.");
		assert.ok(oDataProvider.isA("sap.ui.integration.util.DataProvider"), "Should have created a DataProvider instance.");
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

	QUnit.test("updateInterval", function (assert) {

		var done = assert.async();

		// Arrange
		var oSettings = {
			json: {
				"key": "value"
			},
			updateInterval: 1
		};

		this.oDataProvider.setSettings(oSettings);
		var fnSpy = sinon.spy(this.oDataProvider, "onDataRequestComplete");

		// Act
		this.oDataProvider.triggerDataUpdate();

		setTimeout(function () {
			assert.ok(fnSpy.callCount > 1, "onDataRequestComplete is called more than once");
			done();
		}, 2000);

		// Cleanup
		fnSpy.reset();
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

	QUnit.module("RequestDataProvider - Content encoding", {
		beforeEach: function () {
			this.oDataProvider = new RequestDataProvider();
			this.oServer = sinon.createFakeServer({
				autoRespond: true
			});
		},
		afterEach: function () {
			this.oServer.restore();
		}
	});

	QUnit.test("Content-Type: application/json", function (assert) {
		// Arrange
		var done = assert.async();
		this.oDataProvider.setSettings({
			request: {
				url: "/data/provider/test/url",
				method: "POST",
				headers: {
					"Content-Type": "application/json"
				},
				parameters: {
					someKey: "someValue",
					someKey2: "someValue2"
				}
			}
		});

		this.oServer.respondWith("POST", "/data/provider/test/url", function (oXhr) {
			// Assert
			try {
				JSON.parse(oXhr.requestBody);
				assert.ok(true, "Request body is correctly encoded as JSON");
			} catch (e) {
				assert.ok(false, "Request body is NOT correctly encoded as JSON");
			}

			done();
		});

		// Act
		this.oDataProvider.triggerDataUpdate();
	});

	QUnit.test("Content-Type: application/x-www-form-urlencoded (default)", function (assert) {
		// Arrange
		var done = assert.async();
		this.oDataProvider.setSettings({
			request: {
				url: "/data/provider/test/url",
				method: "POST",
				parameters: {
					someKey: "someValue",
					someKey2: "someValue2"
				}
			}
		});

		this.oServer.respondWith("POST", "/data/provider/test/url", function (oXhr) {
			// Assert
			assert.strictEqual(oXhr.requestBody, "someKey=someValue&someKey2=someValue2");

			done();
		});

		// Act
		this.oDataProvider.triggerDataUpdate();
	});

	QUnit.module("RequestDataProvider - Resolve Relative Url", {
		beforeEach: function () {
			this.oCard = new Card({
				baseUrl: "test-resources/sap/ui/integration/qunit/manifests/"
			});
		},
		afterEach: function () {
			this.oCard.destroy();
		}
	});

	QUnit.test("Resolve relative url", function (assert) {
		var done = assert.async();

		// Arrange
		this.oCard.attachEventOnce("_ready", function () {

			Core.applyChanges();

			assert.strictEqual(this.oCard.getCardContent().getInnerList().getItems().length, 8, "the data is resolved correctly");

			done();

		}.bind(this));

		this.oCard.setManifest({
			"sap.app": {
				"type": "card",
				"id": "test.dataProvider.card1"
			},
			"sap.card": {
				"type": "List",
				"header": {
					"title": "List Card"
				},
				"content": {
					"data": {
						"request": {
							"url": "./relativeData.json"
						}
					},
					"item": {
						"title": {
							"value": "{Name}"
						}
					}
				}
			}
		});

		this.oCard.placeAt("qunit-fixture");
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