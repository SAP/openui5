/* global QUnit, sinon */

sap.ui.define([
	"sap/ui/integration/Host",
	"sap/ui/integration/util/DataProviderFactory",
	"sap/ui/integration/util/CsrfTokenHandler",
	"sap/ui/integration/widgets/Card"
], function (
	Host,
	DataProviderFactory,
	CsrfTokenHandler,
	Card
) {
	"use strict";

	var oManifest_CsrfToken = {
		"_version": "1.36.0",
		"sap.app": {
			"id": "test.card.csrf.card1"
		},
		"sap.card": {
			"type": "List",
			"configuration": {
				"csrfTokens": {
					"token1": {
						"name": "Token1",
						"data": {
							"request": {
								"url": "/fakeService/getToken",
								"method": "HEAD",
								"headers": {
									"X-CSRF-Token": "Fetch"
								}
							}
						}
					}
				}
			},
			"data": {
				"request": {
					"url": "/fakeService/Products",
					"method": "GET",
					"headers": {
						"X-CSRF-Token": "{{csrfTokens.token1}}"
					}
				},
				"path": "/results"
			},
			"header": {
				"title": "Products"
			},
			"content": {
				"item": {
					"title": "{Name}"
				},
				"maxItems": 5
			}
		}
	};

	var oManifest_CsrfTokenAsParameter = {
		"_version": "1.36.0",
		"sap.app": {
			"id": "test.card.csrf.card1"
		},
		"sap.card": {
			"type": "List",
			"configuration": {
				"csrfTokens": {
					"token1": {
						"name": "Token1",
						"data": {
							"request": {
								"url": "/fakeService/getToken",
								"method": "HEAD",
								"headers": {
									"X-CSRF-Token": "Fetch"
								}
							}
						}
					}
				}
			},
			"data": {
				"request": {
					"url": "/fakeService/Products",
					"method": "POST",
					"some": {
						"a": "b"
					},
					"parameters": {
						"X-CSRF-Token": "{{csrfTokens.token1}}"
					}
				},
				"path": "/results"
			},
			"header": {
				"title": "Products"
			},
			"content": {
				"item": {
					"title": "{Name}"
				},
				"maxItems": 5
			}
		}
	};

	var oManifest_CsrfTokenWithPath = {
		"_version": "1.36.0",
		"sap.app": {
			"id": "test.card.csrf.card2"
		},
		"sap.card": {
			"type": "List",
			"configuration": {
				"csrfTokens": {
					"token1": {
						"data": {
							"request": {
								"url": "/fakeService/getToken",
								"method": "POST"
							},
							"path": "/results/0/Value"
						}
					}
				}
			},
			"data": {
				"request": {
					"url": "/fakeService/Products",
					"method": "GET",
					"headers": {
						"X-CSRF-Token": "{{csrfTokens.token1}}"
					}
				},
				"path": "/results"
			},
			"header": {
				"title": "Products"
			},
			"content": {
				"item": {
					"title": "{Name}"
				},
				"maxItems": 5
			}
		}
	};

	var oManifest_CsrfTokenAndTranslations = {
		"sap.app": {
			"id": "test.card.csrf.card3",
			"i18n": "i18n/i18n.properties"
		},
		"sap.card": {
			"type": "List",
			"configuration": {
				"csrfTokens": {
					"token1": {
						"name": "Token1",
						"data": {
							"request": {
								"url": "/fakeService/getToken",
								"method": "HEAD",
								"headers": {
									"X-CSRF-Token": "Fetch"
								}
							}
						}
					}
				}
			},
			"data": {
				"request": {
					"url": "/fakeService/Products",
					"method": "GET",
					"headers": {
						"X-CSRF-Token": "{{csrfTokens.token1}}"
					}
				},
				"path": "/results"
			},
			"header": {
				"title": "{{appTitle}}"
			},
			"content": {
				"item": {
					"title": "{Name}"
				}
			}
		}
	};

	QUnit.module("CSRF Token requests", {
		beforeEach: function () {
			this.oServer = sinon.createFakeServer({
				autoRespond: true
			});
			this.oServer.respondImmediately = true;
		},

		afterEach: function () {
			CsrfTokenHandler._mTokens.clear();
			this.oServer.restore();
		}
	});

	QUnit.test("Token request is fetched from the headers before the request for the actual data", function (assert) {
		var done = assert.async(2),
			oCsrfConfig = oManifest_CsrfToken["sap.card"]["configuration"]["csrfTokens"],
			oDataConfig = oManifest_CsrfToken["sap.card"]["data"],
			oDataProviderFactory = new DataProviderFactory({
				csrfTokensConfig: oCsrfConfig
			});

		// make a request which uses a CSRF placeholder
		var oDataProvider = oDataProviderFactory.create(oDataConfig);
		// respond upon request for a token
		this.oServer.respondWith("HEAD", "/fakeService/getToken", function (oXhr) {
			var sCsrfHeader = oXhr.requestHeaders["X-CSRF-Token"];

			assert.strictEqual(oXhr.method, oCsrfConfig.token1.data.request.method, "Correct method was used");
			assert.strictEqual(sCsrfHeader, "Fetch", "Request to obtain a token was executed");

			oXhr.respond(200, {
				"Content-Type": "application/json",
				"X-CSRF-Token": "FAKETOKEN"
			});

			done();
		});

		// respond to the actual data request
		this.oServer.respondWith("/fakeService/Products", function (oXhr) {
			assert.strictEqual(oXhr.requestHeaders["X-CSRF-Token"], "FAKETOKEN", "The data request headers contain the provided token");

			oXhr.respond(200, {
				"Content-Type": "application/json"
			}, JSON.stringify({"results": []}));

			done();
		});

		oDataProvider.triggerDataUpdate();
	});

	QUnit.test("Token request is fetched from the path before the request for the actual data", function (assert) {
		var done = assert.async(2),
			oCsrfConfig = oManifest_CsrfTokenWithPath["sap.card"]["configuration"]["csrfTokens"],
			oDataConfig = oManifest_CsrfTokenWithPath["sap.card"]["data"],
			oDataProviderFactory = new DataProviderFactory({
				csrfTokensConfig: oCsrfConfig
			});

		// make a request which uses a CSRF placeholder
		var oDataProvider = oDataProviderFactory.create(oDataConfig);
		// respond upon request for a token
		this.oServer.respondWith("POST", "/fakeService/getToken", function (oXhr) {
			assert.strictEqual(oXhr.method, oCsrfConfig.token1.data.request.method, "Correct method was used");

			oXhr.respond(200, {
				"Content-Type": "application/json"
			}, JSON.stringify({"results": [{"Value": "TokenValue"}]}));

			done();
		});

		// respond to the actual data request
		this.oServer.respondWith("/fakeService/Products", function (oXhr) {
			assert.strictEqual(oXhr.requestHeaders["X-CSRF-Token"], "TokenValue", "The data request headers contain the provided token");

			oXhr.respond(200, {
				"Content-Type": "application/json"
			}, JSON.stringify({"results": []}));

			done();
		});

		oDataProvider.triggerDataUpdate();
	});

	QUnit.test("Token request is resolverd by the Host before the request for the actual data", function (assert) {
		var done = assert.async(),
			oCsrfConfig = oManifest_CsrfToken["sap.card"]["configuration"]["csrfTokens"],
			oDataConfig = oManifest_CsrfToken["sap.card"]["data"],
			oHostResolveToken = new Host(),
			oDataProviderFactory = new DataProviderFactory({
				host: oHostResolveToken,
				csrfTokensConfig: oCsrfConfig
			});

		oHostResolveToken.getCsrfToken = function (sName) {
			return Promise.resolve("HostTokenValue");
		};

		// make a request which uses a CSRF placeholder
		var oDataProvider = oDataProviderFactory.create(oDataConfig);


		// respond to the actual data request
		this.oServer.respondWith("/fakeService/Products", function (oXhr) {
			assert.strictEqual(oXhr.requestHeaders["X-CSRF-Token"], "HostTokenValue", "The data request headers contain the provided token");

			oXhr.respond(200, {
				"Content-Type": "application/json"
			}, JSON.stringify({"results": []}));

			done();
		});

		oDataProvider.triggerDataUpdate();
	});

	QUnit.test("Resolved token is reused", function (assert) {
		var done = assert.async(3),
			oCsrfConfig = oManifest_CsrfToken["sap.card"]["configuration"]["csrfTokens"],
			oDataConfig = oManifest_CsrfToken["sap.card"]["data"],
			oDataProviderFactory = new DataProviderFactory({
				csrfTokensConfig: oCsrfConfig
			});

		// make a request which uses a CSRF placeholder
		var oDataProvider = oDataProviderFactory.create(oDataConfig);
		// respond upon request for a token
		this.oServer.respondWith("HEAD", "/fakeService/getToken", function (oXhr) {
			var sCsrfHeader = oXhr.requestHeaders["X-CSRF-Token"];

			assert.strictEqual(oXhr.method, oCsrfConfig.token1.data.request.method, "Correct method was used");
			assert.strictEqual(sCsrfHeader, "Fetch", "Request to obtain a token was executed");

			oXhr.respond(200, {
				"Content-Type": "application/json",
				"X-CSRF-Token": "FAKETOKEN"
			});

			done();
		});

		// respond to the actual data request
		this.oServer.respondWith("/fakeService/Products", function (oXhr) {
			assert.strictEqual(oXhr.requestHeaders["X-CSRF-Token"], "FAKETOKEN", "The data request headers contain the provided token");

			oXhr.respond(200, {
				"Content-Type": "application/json"
			}, JSON.stringify({"results": []}));

			done();
		});

		oDataProvider.triggerDataUpdate();
		oDataProvider.triggerDataUpdate();
	});

	QUnit.test("Expired token is retriggered", function (assert) {
		var done = assert.async(5),
			oCsrfConfig = oManifest_CsrfToken["sap.card"]["configuration"]["csrfTokens"],
			oDataConfig = oManifest_CsrfToken["sap.card"]["data"],
			oDataProviderFactory = new DataProviderFactory({
				csrfTokensConfig: oCsrfConfig
			});

		// make a request which uses a CSRF placeholder
		var oDataProvider = oDataProviderFactory.create(oDataConfig);

		// respond upon request for a token
		this.oServer.respondWith("HEAD", "/fakeService/getToken", function (oXhr) {
			var sCsrfHeader = oXhr.requestHeaders["X-CSRF-Token"];

			assert.strictEqual(oXhr.method, oCsrfConfig.token1.data.request.method, "Correct method was used");
			assert.strictEqual(sCsrfHeader, "Fetch", "Request to obtain a token was executed");

			oXhr.respond(200, {
				"Content-Type": "application/json",
				"X-CSRF-Token": "FAKETOKEN"
			});

			done();
		});

		// respond to the actual data request
		this.oServer.respondWith("/fakeService/Products", function (oXhr) {
			assert.strictEqual(oXhr.requestHeaders["X-CSRF-Token"], "FAKETOKEN", "The data request headers contain the provided token");

			var headers = {
					"Content-Type": "application/json"
				},
				respondStatus = 200;

			if (!this.firstTime) {
				this.firstTime = true;
			} else {
				this.firstTime = false;
				respondStatus = 403;
				headers["X-CSRF-Token"] = "required";
			}

			oXhr.respond(respondStatus, headers, JSON.stringify({"results": []}));

			done();
		}.bind(this));

		oDataProvider.triggerDataUpdate();
		oDataProvider.triggerDataUpdate();
	});

	QUnit.test("Token as parameter is fetched before the request for the actual data", function (assert) {
		var done = assert.async(2),
			oCsrfConfig = oManifest_CsrfTokenAsParameter["sap.card"]["configuration"]["csrfTokens"],
			oDataConfig = oManifest_CsrfTokenAsParameter["sap.card"]["data"],
			oDataProviderFactory = new DataProviderFactory({
				csrfTokensConfig: oCsrfConfig
			});

		// make a request which uses a CSRF placeholder
		var oDataProvider = oDataProviderFactory.create(oDataConfig);
		// respond upon request for a token
		this.oServer.respondWith("HEAD", "/fakeService/getToken", function (oXhr) {
			var sCsrfHeader = oXhr.requestHeaders["X-CSRF-Token"];

			assert.strictEqual(oXhr.method, oCsrfConfig.token1.data.request.method, "Correct method was used");
			assert.strictEqual(sCsrfHeader, "Fetch", "Request to obtain a token was executed");

			oXhr.respond(200, {
				"Content-Type": "application/json",
				"X-CSRF-Token": "FAKETOKEN"
			});

			done();
		});

		// respond to the actual data request
		this.oServer.respondWith("POST", "/fakeService/Products", function (oXhr) {
			assert.strictEqual(oXhr.requestBody, "X-CSRF-Token=FAKETOKEN", "The data request body contains the provided token");

			oXhr.respond(200, {
				"Content-Type": "application/json"
			}, JSON.stringify({"results": []}));

			done();
		});

		oDataProvider.triggerDataUpdate();
	});

	QUnit.test("CSRF Token works in card with translations", function (assert) {
		var done = assert.async(),
			oHostResolveToken = new Host(),
			oCard = new Card({
				host: oHostResolveToken,
				manifest: oManifest_CsrfTokenAndTranslations,
				baseUrl: "test-resources/sap/ui/integration/qunit/cardbundle/bundle/"
			});

		assert.expect(1);

		oHostResolveToken.getCsrfToken = function (sName) {
			return Promise.resolve("HostTokenValue");
		};

		// respond to the actual data request
		this.oServer.respondWith("/fakeService/Products", function (oXhr) {
			assert.strictEqual(oXhr.requestHeaders["X-CSRF-Token"], "HostTokenValue", "The data request headers contain the provided token");

			oXhr.respond(200, {
				"Content-Type": "application/json"
			}, JSON.stringify({"results": []}));

			done();
		});

		oCard.startManifestProcessing();
	});
});