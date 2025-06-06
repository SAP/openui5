/*global QUnit, sinon */

sap.ui.define([
	"sap/ui/integration/util/DataProviderFactory",
	"sap/ui/integration/util/ServiceDataProvider",
	"sap/ui/integration/util/DataProvider",
	"sap/ui/integration/util/RequestDataProvider",
	"sap/ui/integration/widgets/Card",
	"sap/ui/integration/Host",
	"sap/ui/integration/Extension",
	"sap/ui/integration/library",
	"sap/ui/core/Supportability"
], function (
	DataProviderFactory,
	ServiceDataProvider,
	DataProvider,
	RequestDataProvider,
	Card,
	Host,
	Extension,
	integrationLibrary,
	Supportability
) {
	"use strict";

	// Regression test
	function testSetConfiguration(DataProviderClass) {
		var oDataProvider = new DataProviderClass();

		QUnit.test("setConfiguration - regression test for " + oDataProvider.getMetadata().getName(), function (assert) {
			// Arrange
			const oConfiguration = {
				"key": "value"
			};

			// Act
			oDataProvider.setConfiguration(oConfiguration);

			// Assert
			assert.deepEqual(oDataProvider.getConfiguration(), oConfiguration, "Getters and setters should work as expected.");

			// Cleanup
			oDataProvider.destroy();
			oDataProvider = null;
		});
	}

	QUnit.module("DataProviderFactory", {
		beforeEach: function () {
			this.oCard = new Card();
			this.oDataProviderFactory = new DataProviderFactory({
				card: this.oCard
			});
			this.spy(DataProvider.prototype, "setConfiguration");
		},
		afterEach: function () {
			this.oDataProviderFactory.destroy();
			this.oDataProviderFactory = null;
			this.oCard.destroy();
		}
	});

	QUnit.test("create with null or undefined", function (assert) {
		assert.notOk(this.oDataProviderFactory.create(null), "Should have NOT created a DataProvider instance.");
		assert.notOk(this.oDataProviderFactory.create(), "Should have NOT created a DataProvider instance.");
		assert.notOk(DataProvider.prototype.setConfiguration.calledOnce, "Should have NOT called setConfiguration.");
	});

	QUnit.test("create with unknown configuration", function (assert) {
		// Arrange
		const oConfiguration = {
			destination: {
				url: "/some/relative/url"
			}
		};

		// Act
		const oDataProvider = this.oDataProviderFactory.create(oConfiguration);

		// Assert
		assert.notOk(oDataProvider, "Should have NOT created a DataProvider instance.");
		assert.notOk(DataProvider.prototype.setConfiguration.calledOnce, "Should have NOT called setConfiguration.");
	});

	QUnit.test("create with request configuration", function (assert) {
		// Arrange
		const oConfiguration = {
			request: {
				url: "/some/relative/url"
			}
		};

		// Act
		const oDataProvider = this.oDataProviderFactory.create(oConfiguration);

		// Assert
		assert.ok(oDataProvider, "Should have created a DataProvider instance.");
		assert.ok(oDataProvider.isA("sap.ui.integration.util.RequestDataProvider"), "Should have created a DataProvider instance of type RequestDataProvider.");
		assert.ok(DataProvider.prototype.setConfiguration.calledOnce, "Should have called setConfiguration.");
		assert.ok(DataProvider.prototype.setConfiguration.getCall(0).calledWith(oConfiguration), "Should have called setConfiguration with correct arguments.");
	});

	QUnit.test("create with service configuration", function (assert) {
		// Arrange
		const oConfiguration = {
			service: {
				name: "UserRecent"
			}
		};
		var oServiceManager = {};
		sinon.stub(ServiceDataProvider.prototype, "createServiceInstances");

		// Act
		const oDataProvider = this.oDataProviderFactory.create(oConfiguration, oServiceManager);

		// Assert
		assert.ok(oDataProvider, "Should have created a DataProvider instance.");
		assert.ok(oDataProvider.isA("sap.ui.integration.util.ServiceDataProvider"), "Should have created a DataProvider instance of type ServiceDataProvider.");
		assert.ok(DataProvider.prototype.setConfiguration.calledOnce, "Should have called setConfiguration.");
		assert.ok(DataProvider.prototype.setConfiguration.getCall(0).calledWith(oConfiguration), "Should have called setConfiguration with correct arguments.");
		assert.ok(ServiceDataProvider.prototype.createServiceInstances.calledOnce, "Should have called createServiceInstances.");
		assert.ok(ServiceDataProvider.prototype.createServiceInstances.getCall(0).calledWith(oServiceManager), "Should have called createServiceInstances with ServiceManager reference.");

		// Cleanup
		ServiceDataProvider.prototype.createServiceInstances.restore();
	});

	QUnit.test("create with static JSON configuration", function (assert) {
		// Arrange
		const oConfiguration = {
			json: {
				"key": "value"
			},
			updateInterval: 1
		};

		// Act
		const oDataProvider = this.oDataProviderFactory.create(oConfiguration);

		// Assert
		assert.ok(DataProvider.prototype.setConfiguration.calledOnce, "Should have called setConfiguration.");
		assert.ok(DataProvider.prototype.setConfiguration.getCall(0).calledWith(oConfiguration), "Should have called setConfiguration with correct arguments.");
		assert.ok(oDataProvider, "Should have created a DataProvider instance.");
		assert.ok(oDataProvider.isA("sap.ui.integration.util.DataProvider"), "Should have created a DataProvider instance.");
	});

	QUnit.test("destroy", function (assert) {
		// Arrange
		const oConfiguration = {
			json: {
				key: "value"
			}
		};

		const oDataProvider = this.oDataProviderFactory.create(oConfiguration),
			oDestroySpy = sinon.spy(oDataProvider, "destroy");

		// Act
		this.oDataProviderFactory.destroy();

		// Assert
		assert.ok(oDestroySpy.calledOnce, "Should destroy all created instances when destroying the factory.");
	});

	QUnit.test("Binding parts that depend on user input (form model), which are not suitable for configurationJson", function (assert) {
		// Arrange
		const oConfiguration = {
			request: {
				parameters: {
					reason: "{form>/reason/value}"
				}
			}
		};
		this.oCard.getModel("form").setProperty("/reason", {
			value: "{\"reason\": \"{form>/some/binding/syntax/input}\"}"
		});

		assert.throws(
			function () {
				this.oDataProviderFactory.create(oConfiguration).getResolvedConfiguration();
			}.bind(this),
			"Exception is thrown when configurationJson is bound to illegal input"
		);
	});

	QUnit.test("Configuration shouldn't be modified", function (assert) {
		// Arrange
		const oConfiguration = {
			request: {
				parameters: {
					reason: "{form>/reason/value}"
				}
			},
			mockData: {
				json: {}
			}
		};
		const oOriginalConfiguration = JSON.parse(JSON.stringify(oConfiguration));
		this.oCard.setPreviewMode(integrationLibrary.CardPreviewMode.MockData);

		// Act
		this.oDataProviderFactory.create(oConfiguration);

		// Assert
		assert.deepEqual(oConfiguration, oOriginalConfiguration, "Configuration given to #create method were modified");
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

	testSetConfiguration(DataProvider);

	QUnit.test("updateInterval", function (assert) {
		var done = assert.async();

		// Arrange
		const oConfiguration = {
			json: {
				"key": "value"
			},
			updateInterval: 1
		};

		this.oDataProvider.setConfiguration(oConfiguration);
		var fnSpy = this.spy(this.oDataProvider, "onDataRequestComplete");

		// Act
		this.oDataProvider.triggerDataUpdate();

		setTimeout(function () {
			assert.ok(fnSpy.callCount > 1, "onDataRequestComplete is called more than once");
			done();
		}, 2000);
	});

	QUnit.test("Pending update with updateInterval with simultaneous refresh", function (assert) {
		var done = assert.async();

		// Arrange
		const oConfiguration = {
			updateInterval: 1
		};

		this.oDataProvider.setConfiguration(oConfiguration);
		var fnSpy = sinon.spy(this.oDataProvider, "triggerDataUpdate");

		// Act
		this.oDataProvider.triggerDataUpdate();
		this.oDataProvider.triggerDataUpdate();
		this.oDataProvider.triggerDataUpdate();

		setTimeout(function () {
			assert.strictEqual(fnSpy.callCount, 4, "triggerDataUpdate should be called just 1 more time");
			done();
		}, 2000);
	});

	QUnit.test("triggerDataUpdate - with JSON", function (assert) {

		// Arrange
		var done = assert.async();
		const oConfiguration = {
			json: {
				"key": "value"
			}
		};
		var fnErrorSpy = sinon.spy();
		this.oDataProvider.setConfiguration(oConfiguration);
		this.oDataProvider.attachError(fnErrorSpy);
		this.oDataProvider.attachDataChanged(function (oEvent) {

			// Assert
			var oData = oEvent.getParameter("data");
			assert.ok(fnErrorSpy.notCalled, "Should NOT call error event handler.");
			assert.deepEqual(oConfiguration.json, oData, "Should have correct data.");

			done();
		});

		// Act
		this.oDataProvider.triggerDataUpdate();
	});

	QUnit.test("triggerDataUpdate - missing JSON", function (assert) {

		// Arrange
		var done = assert.async();
		const oConfiguration = {};
		var fnDataChangedSpy = sinon.spy();
		this.oDataProvider.setConfiguration(oConfiguration);
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

	QUnit.test("Event: dataChanged", function (assert) {
		// Arrange
		assert.expect(1);
		const done = assert.async();
		let currentData = 0;
		this.stub(this.oDataProvider, "getData").callsFake(() => {
			return Promise.resolve(currentData++);
		});

		this.oDataProvider.attachDataChanged((e) => {
			assert.strictEqual(e.getParameter("data"), 2, "Should receive data from the last request only.");
			done();
		});

		// Act
		this.oDataProvider.setConfiguration({
			request: {
				url: "/data/provider/test/url",
				parameters: {
					key: 1
				}
			}
		});
		this.oDataProvider.triggerDataUpdate();

		this.oDataProvider.setConfiguration({
			request: {
				url: "/data/provider/test/url",
				key: 2
			}
		});
		this.oDataProvider.triggerDataUpdate();

		this.oDataProvider.setConfiguration({
			request: {
				url: "/data/provider/test/url",
				key: 3
			}
		});
		this.oDataProvider.triggerDataUpdate();
	});

	QUnit.module("RequestDataProvider", {
		beforeEach: function () {
			this.oRequestStub = sinon.stub(RequestDataProvider.prototype, "_request");
			this.oDataProvider = new RequestDataProvider();
		},
		afterEach: function () {
			this.oDataProvider.destroy();
			this.oDataProvider = null;
			this.oRequestStub.restore();
		}
	});

	testSetConfiguration(RequestDataProvider);

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

	testSetConfiguration(ServiceDataProvider);

	QUnit.test("triggerDataUpdate - data request successful", function (assert) {

		// Arrange
		var done = assert.async();
		const oConfiguration = {
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
		this.oDataProvider.setConfiguration(oConfiguration);
		this.oDataProvider.createServiceInstances(this.oServiceManagerMock);

		// Act
		this.oDataProvider.triggerDataUpdate();
	});

	QUnit.test("triggerDataUpdate - data request failed", function (assert) {

		// Arrange
		var done = assert.async();
		const oConfiguration = {
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
		this.oDataProvider.setConfiguration(oConfiguration);
		this.oDataProvider.createServiceInstances(this.oServiceManagerMock);

		// Act
		this.oDataProvider.triggerDataUpdate();
	});

	QUnit.test("triggerDataUpdate - No service instance", function (assert) {

		// Arrange
		var done = assert.async();
		const oConfiguration = {
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
		this.oDataProvider.setConfiguration(oConfiguration);

		// Act
		this.oDataProvider.triggerDataUpdate();
	});

	QUnit.test("No service instance", function (assert) {

		// Arrange
		var done = assert.async();
		const oConfiguration = {
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
		this.oDataProvider.setConfiguration(oConfiguration);
		this.oDataProvider.createServiceInstances(this.oServiceManagerMock);

		// Act
		this.oDataProvider.triggerDataUpdate();
	});

	QUnit.test("Service triggers data changed", function (assert) {

		// Arrange
		var done = assert.async();
		const oConfiguration = {
			service: {
				name: "UserRecent"
			}
		};
		var fnErrorSpy = sinon.spy();
		var fnDataChangedSpy = sinon.spy();

		this.oDataProvider.attachError(fnErrorSpy);
		this.oDataProvider.attachDataChanged(fnDataChangedSpy);
		this.oDataProvider.setConfiguration(oConfiguration);
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

	QUnit.test("createServiceInstances after setConfiguration", function (assert) {

		// Arrange
		var done = assert.async();
		const oConfiguration = {
			service: {
				name: "UserRecent"
			}
		};
		var fnErrorSpy = sinon.spy();
		var fnDataChangedSpy = sinon.spy();

		this.oDataProvider.attachError(fnErrorSpy);
		this.oDataProvider.attachDataChanged(fnDataChangedSpy);
		this.oDataProvider.createServiceInstances(this.oServiceManagerMock);
		this.oDataProvider.setConfiguration(oConfiguration);

		// Act
		this.oDataProvider.triggerDataUpdate().then(function () {

			// Assert
			assert.ok(fnErrorSpy.calledOnce, "Should have an error message.");
			assert.ok(fnDataChangedSpy.notCalled, "Should NOT call data changed handler.");

			done();
		});
	});

	QUnit.module("Usage without a card or editor", {
		beforeEach: function () {
			this.oDataProviderFactory = new DataProviderFactory();

			this.oServer = sinon.createFakeServer({
				autoRespond: true
			});

			this.oServer.respondImmediately = true;
		},
		afterEach: function () {
			this.oDataProviderFactory.destroy();
			this.oServer.restore();
		}
	});

	QUnit.test("Sends a request", function (assert) {
		var done = assert.async(),
			oDataProvider = this.oDataProviderFactory.create({
				request: {
					url: "/test/url"
				}
			});

		this.oServer.respondWith("GET", "/test/url", function (oXhr) {
			assert.ok(true, "Request is sent");
			oXhr.respond(200, {}, "");
			done();
		});

		oDataProvider.triggerDataUpdate();
	});

	QUnit.test("Query param sap-statistics=true is passed to each request if enabled", function (assert) {
		var done = assert.async(),
			oDataProvider = this.oDataProviderFactory.create({
				request: {
					url: "/test/url"
				}
			}),
			oHost = new Host(),
			fnStubStatisticsEnabled = sinon.stub(Supportability, "isStatisticsEnabled").callsFake(function () {
				return true;
			});

		assert.expect(1);

		oDataProvider.setHost(oHost);

		this.oServer.respondWith("GET", "/test/url?sap-statistics=true", function (oXhr) {
			assert.ok(true, "Query parameter sap-statistics=true is included in request");

			oXhr.respond(200, {}, "");

			// restore statistics enabled value
			fnStubStatisticsEnabled.restore();
			done();
		});

		oDataProvider.triggerDataUpdate();
	});

	QUnit.test("Query param sap-statistics=true is not passed if not enabled", function (assert) {
		var done = assert.async(),
			oDataProvider = this.oDataProviderFactory.create({
				request: {
					url: "/test/url"
				}
			}),
			oHost = new Host();

		assert.expect(1);

		oDataProvider.setHost(oHost);

		this.oServer.respondWith("GET", "/test/url", function (oXhr) {
			assert.ok(true, "Query parameter sap-statistics=true is included in request");

			oXhr.respond(200, {}, "");

			done();
		});

		oDataProvider.triggerDataUpdate();
	});

	QUnit.module("Override fetch", {
		beforeEach: function () {
			this.oDataProviderFactory = new DataProviderFactory();

			this.oServer = sinon.createFakeServer({
				autoRespond: true
			});

			this.oServer.respondImmediately = true;
		},
		afterEach: function () {
			this.oDataProviderFactory.destroy();
			this.oServer.restore();
		}
	});

	QUnit.test("Extension can override fetch", function (assert) {
		var done = assert.async(),
			sExpectedResource = "/test/url",
			oExpectedRequestConfiguration = {
				url: sExpectedResource,
				headers: {
					"test": "test"
				}
			},
			oDataProvider = this.oDataProviderFactory.create({
				request: oExpectedRequestConfiguration
			}),
			oExtension = new Extension(),
			oCard = new Card();

		assert.expect(6);

		oDataProvider.setCard(oCard);
		oExtension._setCard(oCard);
		oCard.setAggregation("_extension", oExtension);

		oExtension.fetch = function (sResource, mOptions, oRequestConfiguration) {
			assert.strictEqual(sResource, sExpectedResource, "The resource is as expected.");
			assert.strictEqual(mOptions.method, "GET", "The request options method is as expected.");
			assert.strictEqual(mOptions.headers.get("test"), "test", "The request options headers are as expected.");
			assert.deepEqual(oRequestConfiguration, oExpectedRequestConfiguration, "The request configuration is a copy of the expected configuration.");

			sResource += "?test=test";
			mOptions.headers.set("test", "test2");

			return Extension.prototype.fetch.call(this, sResource, mOptions, oRequestConfiguration);
		};

		this.oServer.respondWith("GET", "/test/url?test=test", function (oXhr) {
			assert.ok(true, "Request url is modified");

			var oHeaders = new Headers(oXhr.requestHeaders);
			assert.strictEqual(oHeaders.get("test"), "test2", "Request headers are modified");

			oXhr.respond(200, {}, "");
			done();
		});

		oDataProvider.triggerDataUpdate();
	});

	QUnit.test("Host can override fetch", function (assert) {
		var done = assert.async(),
			sExpectedResource = "/test/url",
			oExpectedConfiguration = {
				url: sExpectedResource,
				headers: {
					"test": "test"
				}
			},
			oDataProvider = this.oDataProviderFactory.create({
				request: oExpectedConfiguration
			}),
			oHost = new Host(),
			oExpectedCard = new Card();

		assert.expect(7);

		oDataProvider.setHost(oHost);
		oDataProvider.setCard(oExpectedCard);

		oHost.fetch = function (sResource, mOptions, oRequestConfiguration, oCard) {
			assert.strictEqual(sResource, sExpectedResource, "The resource is as expected.");
			assert.strictEqual(mOptions.method, "GET", "The request options method is as expected.");
			assert.strictEqual(mOptions.headers.get("test"), "test", "The request options headers are as expected.");
			assert.deepEqual(oRequestConfiguration, oExpectedConfiguration, "The request configuration is a copy of the expected configuration.");
			assert.strictEqual(oCard, oExpectedCard, "The card is as expected.");

			sResource += "?test=test";
			mOptions.headers.set("test", "test2");

			return Host.prototype.fetch.call(this, sResource, mOptions, oRequestConfiguration, oCard);
		};

		this.oServer.respondWith("GET", "/test/url?test=test", function (oXhr) {
			assert.ok(true, "Request url is modified");

			var oHeaders = new Headers(oXhr.requestHeaders);
			assert.strictEqual(oHeaders.get("test"), "test2", "Request headers are modified");

			oXhr.respond(200, {}, "");
			done();
		});

		oDataProvider.triggerDataUpdate();
	});

	QUnit.test("Both extension and host can override fetch", function (assert) {
		var done = assert.async(),
			oDataProvider = this.oDataProviderFactory.create({
				request: {
					url: "/test/url",
					headers: {
						"test": "test"
					}
				}
			}),
			oHost = new Host(),
			oExtension = new Extension(),
			oCard = new Card(),
			fnHostSpy,
			fnExtensionSpy;

		assert.expect(10);

		oExtension._setCard(oCard);
		oCard.setAggregation("_extension", oExtension);
		oCard.setHost(oHost);
		oDataProvider.setCard(oCard);
		oDataProvider.setHost(oHost);

		oExtension.fetch = function (sResource, mOptions, oRequestConfiguration) {
			assert.strictEqual(mOptions.headers.get("test"), "test", "The initial request headers are as expected.");

			mOptions.headers.set("test-extension", "test-extension");

			return Extension.prototype.fetch.call(this, sResource, mOptions, oRequestConfiguration);
		};

		oHost.fetch = function (sResource, mOptions, oRequestConfiguration) {
			assert.strictEqual(mOptions.headers.get("test"), "test", "The initial request headers are as expected.");
			assert.strictEqual(mOptions.headers.get("test-extension"), "test-extension", "The request headers are modified by extension.");

			mOptions.headers.set("test-host", "test-host");

			return Host.prototype.fetch.call(this, sResource, mOptions, oRequestConfiguration, oCard);
		};

		fnHostSpy = this.spy(oHost, "fetch");
		fnExtensionSpy = this.spy(oExtension, "fetch");

		this.oServer.respondWith("GET", "/test/url", function (oXhr) {
			assert.ok(true, "Request is sent");

			var oHeaders = new Headers(oXhr.requestHeaders);
			assert.strictEqual(oHeaders.get("test"), "test", "The initial request headers are as expected.");
			assert.strictEqual(oHeaders.get("test-extension"), "test-extension", "The request headers are modified by extension.");
			assert.strictEqual(oHeaders.get("test-host"), "test-host", "The request headers are modified by host.");

			assert.ok(fnExtensionSpy.calledOnce, "Extension.fetch was called once.");
			assert.ok(fnHostSpy.calledOnce, "Host.fetch was called once.");
			assert.ok(fnExtensionSpy.calledBefore(fnHostSpy), "Extension.fetch was called before Host.fetch.");

			oXhr.respond(200, {}, "");
			done();
		});

		oDataProvider.triggerDataUpdate();
	});
});