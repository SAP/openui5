/*global QUnit, sinon */

sap.ui.define([
	"sap/ui/integration/util/DataProviderFactory",
	"sap/ui/integration/util/RequestDataProvider",
	"sap/ui/integration/widgets/Card",
	"sap/base/Log",
	"qunit/testResources/nextCardReadyEvent"
], (
	DataProviderFactory,
	RequestDataProvider,
	Card,
	Log,
	nextCardReadyEvent
) => {
	"use strict";

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

	QUnit.test("method _isValidRequest", function (assert) {
		assert.notOk(this.oDataProvider._isValidRequest({}), "Should have an invalid request.");
		assert.notOk(this.oDataProvider._isValidRequest({ url: 5 }), "Should have an invalid request.");
		assert.notOk(this.oDataProvider._isValidRequest(), "Should have an invalid request.");

		var oInvalidRequest = {
			url: "some/relative/url",
			options: {
				mode: "no-cors",
				method: "SOME INVALID METHOD"
			}
		};
		assert.notOk(this.oDataProvider._isValidRequest(oInvalidRequest), "Should have an invalid request.");

		var oValidRequest = {
			url: "some/relative/url",
			options: {
				mode: "no-cors",
				method: "GET"
			}
		};
		assert.ok(this.oDataProvider._isValidRequest(oValidRequest), "Should have a valid request.");
	});

	QUnit.test("triggerDataUpdate - request successful", function (assert) {

		// Arrange
		var done = assert.async();
		const oConfiguration = {
			request: {
				"url": "some/relative/url"
			}
		};
		var fnErrorSpy = sinon.spy();
		this.oDataProvider.setConfiguration(oConfiguration);
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
		this.oRequestStub.callsFake(function () {
			return Promise.resolve([
				{
					mockData: [1, 2, 3]
				},
				null
			]);
		});
	});

	QUnit.test("triggerDataUpdate - missing request", function (assert) {

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

	QUnit.test("triggerDataUpdate - invalid request", function (assert) {

		// Arrange
		var done = assert.async();
		const oConfiguration = {
			request: 5
		};
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

	QUnit.test("triggerDataUpdate - request fails", function (assert) {

		// Arrange
		var done = assert.async();
		const oConfiguration = {
			request: {
				"url": "some/relative/url"
			}
		};
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

		this.oRequestStub.callsFake(function () {
			return Promise.reject([
				"Some error message.",
				null
			]);
		});
	});

	QUnit.module("RequestDataProvider - Configuration", {
		beforeEach: function () {
			this.oDataProviderFactory = new DataProviderFactory();
			this.oServer = sinon.createFakeServer({
				autoRespond: true,
				autoRespondAfter: 100
			});
		},
		afterEach: function () {
			this.oDataProviderFactory.destroy();
			this.oServer.restore();
		}
	});

	QUnit.test("Test 'method' setting", function (assert) {
		// Arrange
		var done = assert.async(),
			aMethods = ["GET", "POST", "HEAD", "PUT", "PATCH", "DELETE", "OPTIONS"],
			sExpectedMethod,
			iIndex = 0,
			fnTest;

		assert.expect(aMethods.length);

		this.oServer.respondWith(function (oXhr) {
			// Assert
			assert.strictEqual(oXhr.method, sExpectedMethod, "Request is done with method " + sExpectedMethod);

			oXhr.respond(200, { "Content-Type": "application/json" }, "{}");
		});

		fnTest = function () {
			sExpectedMethod = aMethods[iIndex];

			var oDataProvider = this.oDataProviderFactory.create({
				request: {
					url: "/data/provider/test/url",
					method: sExpectedMethod
				}
			});

			// Act
			oDataProvider.getData().then(function () {
				if (iIndex === aMethods.length - 1) {
					done();
					return;
				}

				iIndex++;
				fnTest();
			});
		}.bind(this);

		fnTest();
	});

	QUnit.module("RequestDataProvider - retry after", {
		beforeEach: function () {
			this.oDataProvider = new RequestDataProvider();
			this.oServer = sinon.createFakeServer({
				autoRespond: true
			});
		},
		afterEach: function () {
			this.oDataProvider.destroy();
			this.oServer.restore();
		}
	});

	QUnit.test("Retry after - with configuration", function (assert) {
		// Arrange
		var done = assert.async(),
			bFirstTry = true;

		assert.expect(2);

		this.oDataProvider.setConfiguration({
			request: {
				url: "/data/provider/test/url",
				retryAfter: 1
			}
		});

		this.oServer.respondWith("GET", "/data/provider/test/url", function (oXhr) {
			if (bFirstTry) {
				oXhr.respond(503, {}, "");

				// Assert - first try
				assert.ok(true, "Request is done once and fails.");
				bFirstTry = false;
				return;
			}

			// Assert - second try
			assert.ok(true, "Request is retried.");
			oXhr.respond(200, {}, "");
			done();
		});

		// Act
		this.oDataProvider.triggerDataUpdate();
	});

	QUnit.test("Retry after - with header", function (assert) {
		// Arrange
		var done = assert.async(),
			bFirstTry = true;

		assert.expect(2);

		this.oDataProvider.setConfiguration({
			request: {
				url: "/data/provider/test/url"
			}
		});

		this.oServer.respondWith("GET", "/data/provider/test/url", function (oXhr) {
			if (bFirstTry) {
				oXhr.respond(503, {"Retry-After": 1}, "");

				// Assert - first try
				assert.ok(true, "Request is done once and fails.");
				bFirstTry = false;
				return;
			}

			// Assert - second try
			assert.ok(true, "Request is retried.");
			oXhr.respond(200, {}, "");
			done();
		});

		// Act
		this.oDataProvider.triggerDataUpdate();
	});

	QUnit.test("Retry after - no time setting", function (assert) {
		// Arrange
		var done = assert.async(),
			oDataProvider = this.oDataProvider,
			oLogSpy = sinon.spy(Log, "warning"),
			iCounter = 0;

		assert.expect(2);

		oDataProvider.setConfiguration({
			request: {
				url: "/data/provider/test/url"
			}
		});

		this.oServer.respondWith("GET", "/data/provider/test/url", function (oXhr) {
			iCounter++;
			oXhr.respond(503, {}, "");
		});

		oDataProvider.attachError(function () {
			assert.strictEqual(iCounter, 1, "Request fails without retries.");
			assert.ok(oLogSpy.calledOnce, "A warning is logged.");

			oLogSpy.restore();

			done();
		});

		// Act
		oDataProvider.triggerDataUpdate();
	});

	QUnit.test("Retry after - wrong time setting", function (assert) {
		// Arrange
		var done = assert.async(),
			oDataProvider = this.oDataProvider,
			oLogSpy = sinon.spy(Log, "error"),
			iCounter = 0;

		assert.expect(2);

		oDataProvider.setConfiguration({
			request: {
				url: "/data/provider/test/url",
				retryAfter: "2050-01-01"
			}
		});

		this.oServer.respondWith("GET", "/data/provider/test/url", function (oXhr) {
			iCounter++;
			oXhr.respond(503, {}, "");
		});

		oDataProvider.attachError(function () {
			assert.strictEqual(iCounter, 1, "Request fails without retries.");
			assert.ok(oLogSpy.calledOnce, "An error is logged.");

			oLogSpy.restore();

			done();
		});

		// Act
		oDataProvider.triggerDataUpdate();
	});

	// @todo
	// QUnit.test("Test 'timeout' setting", function (assert) {
	// 	// Arrange
	// 	var done = assert.async();

	// 	this.oServer.respondWith(function (oXhr) {
	// 		oXhr.respond(200, {"Content-Type": "application/json"}, "{}");
	// 	});

	// 	var oDataProvider = this.oDataProviderFactory.create({
	// 		request: {
	// 			url: "/data/provider/test/url",
	// 			timeout: 200
	// 		}
	// 	});

	// 	// Act
	// 	oDataProvider.getData().then(function () {
	// 		assert.ok(true, "request is successful");

	// 		oDataProvider = this.oDataProviderFactory.create({
	// 			request: {
	// 				url: "/data/provider/test/url",
	// 				timeout: 50
	// 			}
	// 		});

	// 		// Act
	// 		oDataProvider.getData().then(function () {
	// 		}, function () {
	// 			assert.ok(true, "request is not successful");
	// 			done();
	// 		});
	// 	}.bind(this));
	// });

	QUnit.module("RequestDataProvider - Sending parameters in requests without body", {
		beforeEach: function () {
			this.oDataProvider = new RequestDataProvider();
			this.oServer = sinon.createFakeServer({
				autoRespond: true
			});
		},
		afterEach: function () {
			this.oDataProvider.destroy();
			this.oServer.restore();
		}
	});

	QUnit.test("JSON parameters without 'Content-Type' specified", function (assert) {
		// Arrange
		var done = assert.async();
		this.oDataProvider.setConfiguration({
			request: {
				url: "/data/provider/test/url",
				method: "GET",
				parameters: {
					someKey: "someValue",
					someKey2: "someValue2"
				}
			}
		});

		this.oServer.respondWith("GET", /\/data\/provider\/test\/url/, function (oXhr) {
			// Assert
			assert.strictEqual(oXhr.url, "/data/provider/test/url?someKey=someValue&someKey2=someValue2", "Request url is correctly constructed");

			done();
		});

		// Act
		this.oDataProvider.triggerDataUpdate();
	});

	QUnit.test("JSON parameters with 'Content-Type: application/json'", function (assert) {
		// Arrange
		var done = assert.async();
		this.oDataProvider.setConfiguration({
			request: {
				url: "/data/provider/test/url",
				method: "GET",
				headers: {
					"Content-Type": "application/json"
				},
				parameters: {
					someKey: "someValue",
					someKey2: "someValue2"
				}
			}
		});

		this.oServer.respondWith("GET", /\/data\/provider\/test\/url/, function (oXhr) {
			// Assert
			assert.strictEqual(oXhr.url, "/data/provider/test/url?someKey=someValue&someKey2=someValue2", "Request url is correctly constructed");

			done();
		});

		// Act
		this.oDataProvider.triggerDataUpdate();
	});

	QUnit.test("String parameter without 'Content-Type'", function (assert) {
		// Arrange
		const done = assert.async();
		this.oDataProvider.setConfiguration({
			request: {
				url: "/data/provider/test/url",
				method: "GET",
				parameters: "My plain text"
			}
		});

		this.oServer.respondWith("GET", /\/data\/provider\/test\/url/, function (oXhr) {
			// Assert
			assert.strictEqual(oXhr.url, "/data/provider/test/url", "Request url is correctly constructed");

			done();
		});

		// Act
		this.oDataProvider.triggerDataUpdate();
	});

	QUnit.module("RequestDataProvider - Sending parameters in requests with body", {
		beforeEach: function () {
			this.oDataProvider = new RequestDataProvider();
			this.oServer = sinon.createFakeServer({
				autoRespond: true
			});
		},
		afterEach: function () {
			this.oDataProvider.destroy();
			this.oServer.restore();
		}
	});

	QUnit.test("JSON parameters without 'Content-Type' (default)", function (assert) {
		// Arrange
		var done = assert.async();
		this.oDataProvider.setConfiguration({
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
			assert.strictEqual(oXhr.requestBody.toString(), "someKey=someValue&someKey2=someValue2", "Request body is correctly encoded");

			done();
		});

		// Act
		this.oDataProvider.triggerDataUpdate();
	});

	QUnit.test("JSON parameters with 'Content-Type: application/json'", function (assert) {
		// Arrange
		var done = assert.async();
		this.oDataProvider.setConfiguration({
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
			assert.deepEqual(
				JSON.parse(oXhr.requestBody),
				{
					someKey: "someValue",
					someKey2: "someValue2"
				},
				"Request body is correctly encoded"
			);

			done();
		});

		// Act
		this.oDataProvider.triggerDataUpdate();
	});

	QUnit.test("String parameter with 'Content-Type: text/plain'", function (assert) {
		// Arrange
		const done = assert.async();
		this.oDataProvider.setConfiguration({
			request: {
				url: "/data/provider/test/url",
				method: "POST",
				headers: {
					"Content-Type": "text/plain"
				},
				parameters: "My plain text"
			}
		});

		this.oServer.respondWith("POST", "/data/provider/test/url", function (oXhr) {
			// Assert
			assert.strictEqual(oXhr.requestBody, "My plain text", "Request body is correctly encoded");

			done();
		});

		// Act
		this.oDataProvider.triggerDataUpdate();
	});

	QUnit.test("String parameter with 'Content-Type: text/plain; charset'", function (assert) {
		// Arrange
		const done = assert.async();
		this.oDataProvider.setConfiguration({
			request: {
				url: "/data/provider/test/url",
				method: "POST",
				headers: {
					"Content-Type": "text/plain; charset=UTF-8"
				},
				parameters: "My plain text"
			}
		});

		this.oServer.respondWith("POST", "/data/provider/test/url", function (oXhr) {
			// Assert
			assert.strictEqual(oXhr.requestBody, "My plain text", "Request body is correctly encoded");

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

	QUnit.test("Resolve relative url", async function (assert) {
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

		await nextCardReadyEvent(this.oCard);

		assert.strictEqual(this.oCard.getCardContent().getInnerList().getItems().length, 8, "the data is resolved correctly");
	});

	QUnit.module("RequestDataProvider - Invalid Responses", {
		beforeEach: function () {
			this.oServer = sinon.createFakeServer({
				autoRespond: true
			});
			this.oServer.respondImmediately = true;
		},

		afterEach: function () {
			this.oServer.restore();
		}
	});

	QUnit.test("Error is thrown when the response body is invalid JSON (empty string)", function (assert) {
		const done = assert.async();
		const oDataProviderFactory = new DataProviderFactory({});
		const oDataProvider = oDataProviderFactory.create({
			request: {
				url: "/fakeService/Products",
				headers: {
					"Content-Type": "application/json"
				}
			}
		});

		this.oServer.respondWith("/fakeService/Products", function (oXhr) {
			oXhr.respond(200, {
				"content-type": "application/json"
			}, "");

		});
		oDataProvider.attachError(function () {
			// Assert
			assert.ok(true, "Should throw an error if the response is invalid JSON.");

			// Clean up
			oDataProviderFactory.destroy();

			done();
		});

		// Act
		oDataProvider.triggerDataUpdate();
	});
});