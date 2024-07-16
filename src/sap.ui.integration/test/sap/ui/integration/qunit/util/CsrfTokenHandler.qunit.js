/* global QUnit, sinon */

sap.ui.define([
	"sap/ui/integration/util/DataProviderFactory",
	"sap/ui/integration/widgets/Card"
], function(
	DataProviderFactory,
	Card
) {
	"use strict";

	QUnit.module("CSRF Tokens - get token", {
		beforeEach: function () {
			this.oServer = sinon.createFakeServer({
				autoRespond: true,
				respondImmediately: true
			});
		},
		afterEach: function () {
			this.oServer.restore();
			this._oDataProviderFactory._oCsrfTokenHandler._mTokens.forEach((oToken) => oToken.markExpired());
			this._oDataProviderFactory.destroy();
		},
		createDataProvider: function (oDataConfig, oFactoryConfig) {
			this._oDataProviderFactory = new DataProviderFactory(oFactoryConfig);

			return this._oDataProviderFactory.create(oDataConfig);
		}
	});

	QUnit.test("Get token by HEAD request", function (assert) {
		const done = assert.async(2);
		const oCsrfTokensConfig = {
			"token1": {
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
		};
		const oDataProviderConfig = {
			"request": {
				"url": "/fakeService/Products",
				"method": "GET",
				"headers": {
					"X-CSRF-Token": "{csrfTokens>/token1/value}"
				}
			},
			"path": "/results"
		};
		assert.expect(3);

		// respond upon request for a token
		this.oServer.respondWith("HEAD", "/fakeService/getToken", function (oXhr) {
			var sCsrfHeader = new Headers(oXhr.requestHeaders).get("X-CSRF-Token");

			assert.strictEqual(oXhr.method, oCsrfTokensConfig.token1.data.request.method, "Correct method was used");
			assert.strictEqual(sCsrfHeader, "Fetch", "Request to obtain a token was executed");

			oXhr.respond(200, {
				"Content-Type": "application/json",
				"X-CSRF-Token": "FAKETOKEN"
			}, "{}");

			done();
		});

		// respond to the actual data request
		this.oServer.respondWith("/fakeService/Products", function (oXhr) {
			assert.strictEqual(new Headers(oXhr.requestHeaders).get("X-CSRF-Token"), "FAKETOKEN", "The data request headers contain the provided token");

			oXhr.respond(200, {
				"Content-Type": "application/json"
			}, JSON.stringify({"results": []}));

			done();
		});

		// Act - make a request which uses a CSRF placeholder
		this.createDataProvider(oDataProviderConfig, { csrfTokensConfig: oCsrfTokensConfig }).triggerDataUpdate();
	});

	QUnit.test("[Deprecated Syntax] Get token by HEAD request", function (assert) {
		const done = assert.async(2);
		const oCsrfTokensConfig = {
			"token1": {
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
		};
		const oDataProviderConfig = {
			"request": {
				"url": "/fakeService/Products",
				"method": "GET",
				"headers": {
					"X-CSRF-Token": "{{csrfTokens.token1}}"
				}
			},
			"path": "/results"
		};

		assert.expect(3);

		// respond upon request for a token
		this.oServer.respondWith("HEAD", "/fakeService/getToken", function (oXhr) {
			var sCsrfHeader = new Headers(oXhr.requestHeaders).get("X-CSRF-Token");

			assert.strictEqual(oXhr.method, oCsrfTokensConfig.token1.data.request.method, "Correct method was used");
			assert.strictEqual(sCsrfHeader, "Fetch", "Request to obtain a token was executed");

			oXhr.respond(200, {
				"Content-Type": "application/json",
				"X-CSRF-Token": "FAKETOKEN"
			}, "{}");

			done();
		});

		// respond to the actual data request
		this.oServer.respondWith("/fakeService/Products", function (oXhr) {
			assert.strictEqual(new Headers(oXhr.requestHeaders).get("X-CSRF-Token"), "FAKETOKEN", "The data request headers contain the provided token");

			oXhr.respond(200, {
				"Content-Type": "application/json"
			}, JSON.stringify({"results": []}));

			done();
		});

		// Act - make a request which uses a CSRF placeholder
		this.createDataProvider(oDataProviderConfig, { csrfTokensConfig: oCsrfTokensConfig }).triggerDataUpdate();
	});

	QUnit.test("Get token by POST request", function (assert) {
		const done = assert.async(2);
		const oCsrfTokensConfig = {
			"token1": {
				"data": {
					"request": {
						"url": "/fakeService/getToken",
						"method": "POST"
					},
					"path": "/results/0/Value"
				}
			}
		};
		const oDataProviderConfig = {
			"request": {
				"url": "/fakeService/Products",
				"method": "GET",
				"headers": {
					"X-CSRF-Token": "{csrfTokens>/token1/value}"
				}
			},
			"path": "/results"
		};

		// respond upon request for a token
		this.oServer.respondWith("POST", "/fakeService/getToken", function (oXhr) {
			assert.strictEqual(oXhr.method, oCsrfTokensConfig.token1.data.request.method, "Correct method was used");

			oXhr.respond(200, {
				"Content-Type": "application/json"
			}, JSON.stringify({"results": [{"Value": "TokenValue"}]}));

			done();
		});

		// respond to the actual data request
		this.oServer.respondWith("/fakeService/Products", function (oXhr) {
			assert.strictEqual(new Headers(oXhr.requestHeaders).get("X-CSRF-Token"), "TokenValue", "The data request headers contain the provided token");

			oXhr.respond(200, {
				"Content-Type": "application/json"
			}, JSON.stringify({"results": []}));

			done();
		});

		// Act - make a request which uses a CSRF placeholder
		this.createDataProvider(oDataProviderConfig, { csrfTokensConfig: oCsrfTokensConfig }).triggerDataUpdate();
	});

	QUnit.test("[Deprecated Syntax] Get token by POST request", function (assert) {
		const done = assert.async(2);
		const oCsrfTokensConfig = {
			"token1": {
				"data": {
					"request": {
						"url": "/fakeService/getToken",
						"method": "POST"
					},
					"path": "/results/0/Value"
				}
			}
		};
		const oDataProviderConfig = {
			"request": {
				"url": "/fakeService/Products",
				"method": "GET",
				"headers": {
					"X-CSRF-Token": "{{csrfTokens.token1}}"
				}
			},
			"path": "/results"
		};

		// respond upon request for a token
		this.oServer.respondWith("POST", "/fakeService/getToken", function (oXhr) {
			assert.strictEqual(oXhr.method, oCsrfTokensConfig.token1.data.request.method, "Correct method was used");

			oXhr.respond(200, {
				"Content-Type": "application/json"
			}, JSON.stringify({"results": [{"Value": "TokenValue"}]}));

			done();
		});

		// respond to the actual data request
		this.oServer.respondWith("/fakeService/Products", function (oXhr) {
			assert.strictEqual(new Headers(oXhr.requestHeaders).get("X-CSRF-Token"), "TokenValue", "The data request headers contain the provided token");

			oXhr.respond(200, {
				"Content-Type": "application/json"
			}, JSON.stringify({"results": []}));

			done();
		});

		// Act - make a request which uses a CSRF placeholder
		this.createDataProvider(oDataProviderConfig, { csrfTokensConfig: oCsrfTokensConfig }).triggerDataUpdate();
	});

	QUnit.module("CSRF Tokens - reusability", {
		beforeEach: function () {
			this.oServer = sinon.createFakeServer({
				autoRespond: true,
				respondImmediately: true
			});
		},
		afterEach: function () {
			this.oServer.restore();
			this._oDataProviderFactory._oCsrfTokenHandler._mTokens.forEach((oToken) => oToken.markExpired());
			this._oDataProviderFactory.destroy();
		},
		createDataProvider: function (oDataConfig, oFactoryConfig) {
			this._oDataProviderFactory = new DataProviderFactory(oFactoryConfig);

			return this._oDataProviderFactory.create(oDataConfig);
		}
	});

	QUnit.test("Token is reused", function (assert) {
		const done = assert.async(3);
		const oCsrfTokensConfig = {
			"token1": {
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
		};
		const oDataProviderConfig = {
			"request": {
				"url": "/fakeService/Products",
				"method": "GET",
				"headers": {
					"X-CSRF-Token": "{csrfTokens>/token1/value}"
				}
			},
			"path": "/results"
		};

		assert.expect(2);
		let iGetTokenCnt = 0;

		// respond upon request for a token
		this.oServer.respondWith("HEAD", "/fakeService/getToken", function (oXhr) {
			iGetTokenCnt++;

			if (iGetTokenCnt > 1) {
				assert.ok(false, "Request for the same token must NOT be triggered more than once");
			}

			oXhr.respond(200, {
				"Content-Type": "application/json",
				"X-CSRF-Token": "FAKETOKEN"
			}, "{}");

			done();
		});

		// respond to the actual data request
		this.oServer.respondWith("/fakeService/Products", function (oXhr) {
			assert.strictEqual(new Headers(oXhr.requestHeaders).get("X-CSRF-Token"), "FAKETOKEN", "The data request headers contain the provided token");

			oXhr.respond(200, {
				"Content-Type": "application/json"
			}, JSON.stringify({"results": []}));

			done();
		});

		const oDataProvider = this.createDataProvider(oDataProviderConfig, { csrfTokensConfig: oCsrfTokensConfig });

		// Act - make a request which uses a CSRF placeholder twice
		oDataProvider.triggerDataUpdate();
		oDataProvider.triggerDataUpdate();
	});

	QUnit.test("[Deprecated Syntax] Token is reused", function (assert) {
		const done = assert.async(3);
		const oCsrfTokensConfig = {
			"token1": {
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
		};
		const oDataProviderConfig = {
			"request": {
				"url": "/fakeService/Products",
				"method": "GET",
				"headers": {
					"X-CSRF-Token": "{{csrfTokens.token1}}"
				}
			},
			"path": "/results"
		};

		assert.expect(2);
		let iGetTokenCnt = 0;

		// respond upon request for a token
		this.oServer.respondWith("HEAD", "/fakeService/getToken", function (oXhr) {
			iGetTokenCnt++;

			if (iGetTokenCnt > 1) {
				assert.ok(false, "Request for the same token must NOT be triggered more than once");
			}

			oXhr.respond(200, {
				"Content-Type": "application/json",
				"X-CSRF-Token": "FAKETOKEN"
			}, "{}");

			done();
		});

		// respond to the actual data request
		this.oServer.respondWith("/fakeService/Products", function (oXhr) {
			assert.strictEqual(new Headers(oXhr.requestHeaders).get("X-CSRF-Token"), "FAKETOKEN", "The data request headers contain the provided token");

			oXhr.respond(200, {
				"Content-Type": "application/json"
			}, JSON.stringify({"results": []}));

			done();
		});

		const oDataProvider = this.createDataProvider(oDataProviderConfig, { csrfTokensConfig: oCsrfTokensConfig });

		// Act - make a request which uses a CSRF placeholder twice
		oDataProvider.triggerDataUpdate();
		oDataProvider.triggerDataUpdate();
	});

	QUnit.test("Expired token is re-fetched", function (assert) {
		const done = assert.async(5);
		const oCsrfTokensConfig = {
			"token1": {
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
		};
		const oDataProviderConfig = {
			"request": {
				"url": "/fakeService/Products",
				"method": "GET",
				"headers": {
					"X-CSRF-Token": "{csrfTokens>/token1/value}"
				}
			},
			"path": "/results"
		};

		assert.expect(3);

		// respond upon request for a token
		this.oServer.respondWith("HEAD", "/fakeService/getToken", function (oXhr) {
			oXhr.respond(200, {
				"Content-Type": "application/json",
				"X-CSRF-Token": "FAKETOKEN"
			}, "{}");

			done();
		});

		// respond to the actual data request
		this.oServer.respondWith("/fakeService/Products", function (oXhr) {
			assert.strictEqual(new Headers(oXhr.requestHeaders).get("X-CSRF-Token"), "FAKETOKEN", "The data request headers contain the provided token");

			const headers = {
				"Content-Type": "application/json"
			};
			let respondStatus = 200;

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

		const oDataProvider = this.createDataProvider(oDataProviderConfig, { csrfTokensConfig: oCsrfTokensConfig });

		// Act - make a request which uses a CSRF placeholder twice
		oDataProvider.triggerDataUpdate();
		oDataProvider.triggerDataUpdate();
	});

	QUnit.test("[Deprecated Syntax] Expired token is retriggered", function (assert) {
		const done = assert.async(5);
		const oCsrfTokensConfig = {
			"token1": {
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
		};
		const oDataProviderConfig = {
			"request": {
				"url": "/fakeService/Products",
				"method": "GET",
				"headers": {
					"X-CSRF-Token": "{{csrfTokens.token1}}"
				}
			},
			"path": "/results"
		};

		assert.expect(3);

		// respond upon request for a token
		this.oServer.respondWith("HEAD", "/fakeService/getToken", function (oXhr) {
			oXhr.respond(200, {
				"Content-Type": "application/json",
				"X-CSRF-Token": "FAKETOKEN"
			}, "{}");

			done();
		});

		// respond to the actual data request
		this.oServer.respondWith("/fakeService/Products", function (oXhr) {
			assert.strictEqual(new Headers(oXhr.requestHeaders).get("X-CSRF-Token"), "FAKETOKEN", "The data request headers contain the provided token");

			const headers = {
				"Content-Type": "application/json"
			};
			let respondStatus = 200;

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

		const oDataProvider = this.createDataProvider(oDataProviderConfig, { csrfTokensConfig: oCsrfTokensConfig });

		// Act - make a request which uses a CSRF placeholder twice
		oDataProvider.triggerDataUpdate();
		oDataProvider.triggerDataUpdate();
	});

	QUnit.test("Expired token re-fetch is not retried more than once", function (assert) {
		const done = assert.async(4);
		const oCsrfTokensConfig = {
			"token1": {
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
		};
		const oDataProviderConfig = {
			"request": {
				"url": "/fakeService/Products",
				"method": "GET",
				"headers": {
					"X-CSRF-Token": "{csrfTokens>/token1/value}"
				}
			},
			"path": "/results"
		};

		assert.expect(2);

		// respond upon request for a token
		this.oServer.respondWith("HEAD", "/fakeService/getToken", function (oXhr) {
			oXhr.respond(200, {
				"Content-Type": "application/json",
				"X-CSRF-Token": "EXPIREDTOKEN"
			}, "{}");

			done();
		});

		// respond to the actual data request
		this.oServer.respondWith("/fakeService/Products", function (oXhr) {
			assert.strictEqual(new Headers(oXhr.requestHeaders).get("X-CSRF-Token"), "EXPIREDTOKEN", "The data request headers contain the provided token");

			const headers = {
				"Content-Type": "application/json",
				"X-CSRF-Token": "required"
			};
			const respondStatus = 403;

			oXhr.respond(respondStatus, headers, JSON.stringify({"results": []}));

			done();
		});

		const oDataProvider = this.createDataProvider(oDataProviderConfig, { csrfTokensConfig: oCsrfTokensConfig });

		// Act
		oDataProvider.triggerDataUpdate();
	});

	QUnit.test("Token as parameter", function (assert) {
		const done = assert.async(2);
		const oCsrfTokensConfig = {
			"token1": {
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
		};
		const oDataProviderConfig = {
			"request": {
				"url": "/fakeService/Products",
				"method": "POST",
				"parameters": {
					"X-CSRF-Token": "{csrfTokens>/token1/value}"
				}
			},
			"path": "/results"
		};

		// respond upon request for a token
		this.oServer.respondWith("HEAD", "/fakeService/getToken", function (oXhr) {
			oXhr.respond(200, {
				"Content-Type": "application/json",
				"X-CSRF-Token": "FAKETOKEN"
			}, "{}");

			done();
		});

		// respond to the actual data request
		this.oServer.respondWith("POST", "/fakeService/Products", function (oXhr) {
			assert.strictEqual(oXhr.requestBody.get("X-CSRF-Token"), "FAKETOKEN", "The data request body contains the provided token");

			oXhr.respond(200, {
				"Content-Type": "application/json"
			}, JSON.stringify({"results": []}));

			done();
		});

		// Act
		this.createDataProvider(oDataProviderConfig, { csrfTokensConfig: oCsrfTokensConfig }).triggerDataUpdate();
	});

	QUnit.test("[Deprecated Syntax] Token as parameter", function (assert) {
		const done = assert.async(2);
		const oCsrfTokensConfig = {
			"token1": {
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
		};
		const oDataProviderConfig = {
			"request": {
				"url": "/fakeService/Products",
				"method": "POST",
				"parameters": {
					"X-CSRF-Token": "{{csrfTokens.token1}}"
				}
			},
			"path": "/results"
		};

		// respond upon request for a token
		this.oServer.respondWith("HEAD", "/fakeService/getToken", function (oXhr) {
			oXhr.respond(200, {
				"Content-Type": "application/json",
				"X-CSRF-Token": "FAKETOKEN"
			}, "{}");

			done();
		});

		// respond to the actual data request
		this.oServer.respondWith("POST", "/fakeService/Products", function (oXhr) {
			assert.strictEqual(oXhr.requestBody.get("X-CSRF-Token"), "FAKETOKEN", "The data request body contains the provided token");

			oXhr.respond(200, {
				"Content-Type": "application/json"
			}, JSON.stringify({"results": []}));

			done();
		});

		// Act
		this.createDataProvider(oDataProviderConfig, { csrfTokensConfig: oCsrfTokensConfig }).triggerDataUpdate();
	});

	QUnit.test("[Deprecated Syntax] Parameters structure preservation", function (assert) {
		const done = assert.async(2);
		const oCsrfTokensConfig = {
			"token1": {
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
		};
		const oDataProviderConfig = {
			"request": {
				"url": "/fakeService/Products",
				"method": "POST",
				"parameters": {
					"X-CSRF-Token": "{{csrfTokens.token1}}",
					"arrayParams": ["a", { b: "B" }, ["C"]]
				},
				"headers": {
					"Content-Type": "application/json"
				}
			},
			"path": "/results"
		};

		// respond upon request for a token
		this.oServer.respondWith("HEAD", "/fakeService/getToken", function (oXhr) {
			oXhr.respond(200, {
				"X-CSRF-Token": "FAKETOKEN"
			}, "{}");

			done();
		});

		// respond to the actual data request
		this.oServer.respondWith("POST", "/fakeService/Products", function (oXhr) {
			assert.deepEqual(JSON.parse(oXhr.requestBody).arrayParams, ["a", { b: "B" }, ["C"]], "Array should be preserved");

			oXhr.respond(200, {
				"Content-Type": "application/json"
			}, JSON.stringify({"results": []}));

			done();
		});

		// Act
		this.createDataProvider(oDataProviderConfig, { csrfTokensConfig: oCsrfTokensConfig }).triggerDataUpdate();
	});

	QUnit.test("When token has expired it should first check for newer version before re-fetch", function (assert) {
		const done = assert.async();
		const oCsrfTokensConfig = {
			"token1": {
				"data": {
					"request": {
						"url": "/fakeService/getToken",
						"method": "HEAD",
						"headers": {
							"X-CSRF-Token": "Fetch"
						}
					}
				}
			},
			"token2": {
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
		};
		const oDataProviderConfig = {
			"request": {
				"url": "/fakeService/Products",
				"method": "GET",
				"headers": {
					"X-CSRF-Token": "{csrfTokens>/token1/value}"
				}
			},
			"path": "/results"
		};
		const oDataProvider = this.createDataProvider(oDataProviderConfig, { csrfTokensConfig: oCsrfTokensConfig });

		let iCurrentActiveToken = 0;

		// respond upon request for a token
		this.oServer.respondWith("HEAD", "/fakeService/getToken", function (oXhr) {
			iCurrentActiveToken++;
			oXhr.respond(200, {
				"X-CSRF-Token": `FAKETOKEN${iCurrentActiveToken}`
			}, "{}");
		});

		// respond to the actual data request
		this.oServer.respondWith("GET", "/fakeService/Products", function (oXhr) {
			const token = new Headers(oXhr.requestHeaders).get("X-CSRF-Token");

			if (token === "FAKETOKEN1") {
				oDataProvider._oCsrfTokenHandler._mTokens.get("token2").markExpired();
				oDataProvider._oCsrfTokenHandler._mTokens.get("token2").load();

				oXhr.respond(403, {
					"X-CSRF-Token": "required"
				});

				return;
			}

			assert.strictEqual(token, "FAKETOKEN2", "token1 should reuse value that is fetched by token2");

			oXhr.respond(200, {
				"Content-Type": "application/json"
			}, JSON.stringify({"results": []}));

			done();
		});

		// Act
		oDataProvider.triggerDataUpdate();
	});

	QUnit.module("CSRF Tokens in Card", {
		beforeEach: function () {
			this.oServer = sinon.createFakeServer({
				autoRespond: true,
				respondImmediately: true
			});

			this.oServer.respondWith("HEAD", "/fakeService/getToken", function (oXhr) {
				oXhr.respond(200, {
					"Content-Type": "application/json",
					"X-CSRF-Token": "TokenValue"
				}, "{}");
			});

			this.oCard = new Card();
		},
		afterEach: function () {
			this.oServer.restore();
			this.oCard.getDataProviderFactory()._oCsrfTokenHandler._mTokens.forEach((oToken) => oToken.markExpired());
			this.oCard.destroy();
		}
	});

	QUnit.test("Token in card with translations", function (assert) {
		const done = assert.async();
		const oManifest = {
			"sap.app": {
				"id": "test.card.csrf.card3",
				"i18n": "i18n/i18n.properties"
			},
			"sap.card": {
				"type": "List",
				"configuration": {
					"csrfTokens": {
						"token1": {
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
							"X-CSRF-Token": "{csrfTokens>/token1/value}"
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

		this.oCard.setManifest(oManifest)
			.setBaseUrl("test-resources/sap/ui/integration/qunit/cardbundle/bundle/");

		assert.expect(1);

		// respond to the actual data request
		this.oServer.respondWith("/fakeService/Products", function (oXhr) {
			assert.strictEqual(new Headers(oXhr.requestHeaders).get("X-CSRF-Token"), "TokenValue", "The data request headers contain the provided token");

			oXhr.respond(200, {
				"Content-Type": "application/json"
			}, JSON.stringify({"results": []}));

			done();
		});

		this.oCard.startManifestProcessing();
	});

	QUnit.test("[Deprecated Syntax] Token in card with translations", function (assert) {
		const done = assert.async();
		const oManifest = {
			"sap.app": {
				"id": "test.card.csrf.card3",
				"i18n": "i18n/i18n.properties"
			},
			"sap.card": {
				"type": "List",
				"configuration": {
					"csrfTokens": {
						"token1": {
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

		this.oCard.setManifest(oManifest)
			.setBaseUrl("test-resources/sap/ui/integration/qunit/cardbundle/bundle/");

		assert.expect(1);

		// respond to the actual data request
		this.oServer.respondWith("/fakeService/Products", function (oXhr) {
			assert.strictEqual(new Headers(oXhr.requestHeaders).get("X-CSRF-Token"), "TokenValue", "The data request headers contain the provided token");

			oXhr.respond(200, {
				"Content-Type": "application/json"
			}, JSON.stringify({"results": []}));

			done();
		});

		this.oCard.startManifestProcessing();
	});

	QUnit.test("Token works with destinations", function (assert) {
		const done = assert.async();
		const oManifest = {
			"sap.app": {
				"id": "test.card.csrf.card4"
			},
			"sap.card": {
				"type": "List",
				"configuration": {
					"destinations": {
						"fakeServiceDestination": {
							"name": "FakeServiceDestination",
							"defaultUrl": "/fakeService"
						}
					},
					"csrfTokens": {
						"token1": {
							"data": {
								"request": {
									"url": "{{destinations.fakeServiceDestination}}/getToken",
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
						"url": "{{destinations.fakeServiceDestination}}/Products",
						"method": "POST",
						"headers": {
							"X-CSRF-Token": "{csrfTokens>/token1/value}"
						}
					},
					"path": "/results"
				},
				"header": {
					"title": "Some title"
				},
				"content": {
					"item": {
						"title": "{Name}"
					}
				}
			}
		};

		this.oCard.setManifest(oManifest)
			.setBaseUrl("test-resources/sap/ui/integration/qunit/cardbundle/bundle/");

		assert.expect(1);

		// respond to the actual data request
		this.oServer.respondWith("POST", "/fakeService/Products", function (oXhr) {
			assert.strictEqual(new Headers(oXhr.requestHeaders).get("X-CSRF-Token"), "TokenValue", "The data request header contains the provided token");

			oXhr.respond(200, {
				"Content-Type": "application/json"
			}, JSON.stringify({"results": []}));

			done();
		});

		this.oCard.startManifestProcessing();
	});

	QUnit.test("[Deprecated Syntax] Token works with destinations", function (assert) {
		const done = assert.async();
		const oManifest = {
			"sap.app": {
				"id": "test.card.csrf.card4"
			},
			"sap.card": {
				"type": "List",
				"configuration": {
					"destinations": {
						"fakeServiceDestination": {
							"name": "FakeServiceDestination",
							"defaultUrl": "/fakeService"
						}
					},
					"csrfTokens": {
						"token1": {
							"data": {
								"request": {
									"url": "{{destinations.fakeServiceDestination}}/getToken",
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
						"url": "{{destinations.fakeServiceDestination}}/Products",
						"method": "POST",
						"headers": {
							"X-CSRF-Token": "{{csrfTokens.token1}}"
						}
					},
					"path": "/results"
				},
				"header": {
					"title": "Some title"
				},
				"content": {
					"item": {
						"title": "{Name}"
					}
				}
			}
		};

		this.oCard.setManifest(oManifest)
			.setBaseUrl("test-resources/sap/ui/integration/qunit/cardbundle/bundle/");

		assert.expect(1);

		// respond to the actual data request
		this.oServer.respondWith("POST", "/fakeService/Products", function (oXhr) {
			assert.strictEqual(new Headers(oXhr.requestHeaders).get("X-CSRF-Token"), "TokenValue", "The data request header contains the provided token");

			oXhr.respond(200, {
				"Content-Type": "application/json"
			}, JSON.stringify({"results": []}));

			done();
		});

		this.oCard.startManifestProcessing();
	});

	QUnit.test("Token in Card.request() call", function (assert) {
		const done = assert.async(2);
		const oManifest = {
			"sap.app": {
				"id": "test.card.csrf.card5"
			},
			"sap.card": {
				"type": "List",
				"configuration": {
					"csrfTokens": {
						"token1": {
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
				"header": {
					"title": "Some title"
				},
				"content": {
					"item": {
						"title": "{Name}"
					}
				}
			}
		};

		this.oCard.setManifest(oManifest)
			.setBaseUrl("test-resources/sap/ui/integration/qunit/cardbundle/bundle/");

		assert.expect(2);

		this.oCard.attachEvent("_ready", () => {
			// act
			this.oCard.request({
				url: "/fakeService/Products",
				method: "POST",
				headers: {
					"X-CSRF-Token": "{csrfTokens>/token1/value}"
				}
			}).then((oRes) => {
				assert.deepEqual(oRes, {"results": []}, "getData resolves with correct value");

				done();
			});
		});

		// respond to the actual data request
		this.oServer.respondWith("POST", "/fakeService/Products", function (oXhr) {
			assert.strictEqual(new Headers(oXhr.requestHeaders).get("X-CSRF-Token"), "TokenValue", "The data request header contains the provided token");

			oXhr.respond(200, {
				"Content-Type": "application/json"
			}, JSON.stringify({"results": []}));

			done();
		});

		this.oCard.startManifestProcessing();
	});

	QUnit.test("[Deprecated Syntax] Token in Card.request() call", function (assert) {
		const done = assert.async(2);
		const oManifest = {
			"sap.app": {
				"id": "test.card.csrf.card5"
			},
			"sap.card": {
				"type": "List",
				"configuration": {
					"csrfTokens": {
						"token1": {
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
				"header": {
					"title": "Some title"
				},
				"content": {
					"item": {
						"title": "{Name}"
					}
				}
			}
		};

		this.oCard.setManifest(oManifest)
			.setBaseUrl("test-resources/sap/ui/integration/qunit/cardbundle/bundle/");

		assert.expect(2);

		this.oCard.attachEvent("_ready", () => {
			// act
			this.oCard.request({
				url: "/fakeService/Products",
				method: "POST",
				headers: {
					"X-CSRF-Token": "{csrfTokens>/token1/value}"
				}
			}).then((oRes) => {
				assert.deepEqual(oRes, {"results": []}, "getData resolves with correct value");

				done();
			});
		});

		// respond to the actual data request
		this.oServer.respondWith("POST", "/fakeService/Products", function (oXhr) {
			assert.strictEqual(new Headers(oXhr.requestHeaders).get("X-CSRF-Token"), "TokenValue", "The data request header contains the provided token");

			oXhr.respond(200, {
				"Content-Type": "application/json"
			}, JSON.stringify({"results": []}));

			done();
		});

		this.oCard.startManifestProcessing();
	});
});