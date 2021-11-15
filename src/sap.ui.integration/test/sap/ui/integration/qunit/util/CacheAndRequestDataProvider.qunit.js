/*global QUnit, sinon */

sap.ui.define([
	"sap/ui/core/Core",
	"sap/ui/integration/util/DataProviderFactory",
	"sap/ui/integration/util/CacheAndRequestDataProvider",
	"sap/ui/integration/Host",
	"sap/ui/integration/widgets/Card"
], function (
	Core,
	DataProviderFactory,
	CacheAndRequestDataProvider,
	Host,
	Card
) {
	"use strict";

	var DOM_RENDER_LOCATION = "qunit-fixture";

	var SECONDS_IN_YEAR = 31536000;

	function fakeRespond(oXhr) {
		oXhr.respond(
			200,
			{
				"Content-Type": "application/json",
				"Date": (new Date()).toUTCString()
			},
			"{}"
		);
	}

	function parseHeaderList(sValue) {
		var aParts,
			oResult = {};

		if (!sValue) {
			return null;
		}

		aParts = sValue.split(/\, */g);

		aParts.forEach(function (part) {
			var pair = part.split("=");
			oResult[pair[0]] = pair[1] || true;
		});

		return oResult;
	}

	QUnit.module("Caching data provider", {
		beforeEach: function () {
			this.oHost = new Host();
			this.oHost.useExperimentalCaching();

			this.oCard = new Card({ host: this.oHost });
			this.oDataProviderFactory = new DataProviderFactory({
				card: this.oCard
			});

			this.oServer = sinon.createFakeServer({
				autoRespond: true
			});

			this.oServer.respondImmediately = true;
		},
		afterEach: function () {
			this.oDataProviderFactory.destroy();
			this.oCard.destroy();
			this.oHost.destroy();
			this.oServer.restore();
		}
	});

	QUnit.test("Create cache data provider", function (assert) {
		var oCacheDataProvider = this.oDataProviderFactory.create({
				request: {
					url: "/test/url"
				}
			});

		assert.ok(oCacheDataProvider, "A data provider was created.");
		assert.ok(oCacheDataProvider instanceof CacheAndRequestDataProvider, "The correct CacheAndRequestDataProvider was created.");
	});

	QUnit.test("Default headers", function (assert) {
		var done = assert.async(),
			oCacheDataProvider = this.oDataProviderFactory.create({
				request: {
					url: "/test/url"
				}
			});

		this.oServer.respondWith("GET", "/test/url", function (oXhr) {
			var mHeaders = oXhr.requestHeaders,
				mCacheHeader = parseHeaderList(mHeaders["Cache-Control"]);

			assert.strictEqual(mHeaders["x-sap-card"], "true", "Header x-sap-card=true is sent");
			assert.ok(mCacheHeader, "Cache-Control header is there");
			assert.strictEqual(mCacheHeader["max-age"], "0", "Cache-Control: max-age is set to 0.");
			assert.ok(mCacheHeader["x-stale-while-revalidate"], "Cache-Control: x-stale-while-revalidate is present.");

			fakeRespond(oXhr);
			done();
		});

		oCacheDataProvider.triggerDataUpdate();
	});

	QUnit.test("Disabled cache", function (assert) {
		var done = assert.async(),
			oCacheDataProvider = this.oDataProviderFactory.create({
				request: {
					url: "/test/url",
					cache: {
						enabled: false
					}
				}
			});

		this.oServer.respondWith("GET", "/test/url", function (oXhr) {
			var mCacheHeader = parseHeaderList(oXhr.requestHeaders["Cache-Control"]);

			assert.ok(mCacheHeader, "Cache-Control header is there");
			assert.ok(mCacheHeader["no-store"], "Cache-Control: no-store is present.");

			fakeRespond(oXhr);
			done();
		});

		oCacheDataProvider.triggerDataUpdate();
	});

	QUnit.test("Disabled stale while revalidate", function (assert) {
		var done = assert.async(),
			oCacheDataProvider = this.oDataProviderFactory.create({
				request: {
					url: "/test/url",
					cache: {
						staleWhileRevalidate: false
					}
				}
			});

		this.oServer.respondWith("GET", "/test/url", function (oXhr) {
			var mCacheHeader = parseHeaderList(oXhr.requestHeaders["Cache-Control"]);

			assert.ok(mCacheHeader, "Cache-Control header is there");
			assert.strictEqual(mCacheHeader["max-age"], "0", "Cache-Control: max-age is set to 0.");
			assert.notOk(mCacheHeader["x-stale-while-revalidate"], "Cache-Control: x-stale-while-revalidate is not present.");

			fakeRespond(oXhr);
			done();
		});

		oCacheDataProvider.triggerDataUpdate();
	});

	QUnit.test("Set max-age", function (assert) {
		var done = assert.async(),
			oCacheDataProvider = this.oDataProviderFactory.create({
				request: {
					url: "/test/url",
					cache: {
						maxAge: 3600
					}
				}
			});

		this.oServer.respondWith("GET", "/test/url", function (oXhr) {
			var mCacheHeader = parseHeaderList(oXhr.requestHeaders["Cache-Control"]);

			assert.ok(mCacheHeader, "Cache-Control header is there");
			assert.strictEqual(mCacheHeader["max-age"], "3600", "Cache-Control: max-age is set to 3600.");
			assert.ok(mCacheHeader["x-stale-while-revalidate"], "Cache-Control: x-stale-while-revalidate is present.");

			fakeRespond(oXhr);
			done();
		});

		oCacheDataProvider.triggerDataUpdate();
	});

	QUnit.test("POST request", function (assert) {
		var done = assert.async(),
			oCacheDataProvider = this.oDataProviderFactory.create({
				request: {
					url: "/test/url",
					method: "POST",
					parameters: {
						id: 4
					}
				}
			});

		this.oServer.respondWith("POST", "/test/url", function (oXhr) {
			var mCacheHeader = parseHeaderList(oXhr.requestHeaders["Cache-Control"]);

			assert.ok(mCacheHeader, "Cache-Control header is there");
			assert.strictEqual(mCacheHeader["max-age"], "0", "Cache-Control: max-age is set to 0.");
			assert.ok(mCacheHeader["x-stale-while-revalidate"], "Cache-Control: x-stale-while-revalidate is present.");

			fakeRespond(oXhr);
			done();
		});

		oCacheDataProvider.triggerDataUpdate();
	});

	QUnit.test("No host", function (assert) {
		var done = assert.async(),
			oCacheDataProvider;

		this.oCard.setHost(null);

		oCacheDataProvider = this.oDataProviderFactory.create({
				request: {
					url: "/test/url"
				}
			});

		this.oServer.respondWith("GET", "/test/url", function (oXhr) {
			var mCacheHeader = parseHeaderList(oXhr.requestHeaders["Cache-Control"]);

			assert.notOk(mCacheHeader, "Cache-Control header is not present");

			fakeRespond(oXhr);
			done();
		});

		oCacheDataProvider.triggerDataUpdate();
	});

	QUnit.test("Update interval", function (assert) {
		var done = assert.async(),
			oCacheDataProvider = this.oDataProviderFactory.create({
				request: {
					url: "/test/url"
				},
				updateInterval: 1
			}),
			iRequests = 0;

		assert.expect(6);

		this.oServer.respondWith("GET", "/test/url", function (oXhr) {
			var mCacheHeader = parseHeaderList(oXhr.requestHeaders["Cache-Control"]);

			iRequests++;

			assert.ok(mCacheHeader, "Cache-Control header is there");
			assert.strictEqual(mCacheHeader["max-age"], "0", "Cache-Control: max-age is set to 0.");

			if (iRequests === 1) {
				assert.ok(mCacheHeader["x-stale-while-revalidate"], "Cache-Control: x-stale-while-revalidate is present on initial call.");
			} else {
				assert.notOk(mCacheHeader["x-stale-while-revalidate"], "Cache-Control: x-stale-while-revalidate is not present on first refresh after update interval.");
			}

			fakeRespond(oXhr);

			if (iRequests === 2) {
				done();
			}
		});

		oCacheDataProvider.triggerDataUpdate().then(function () {
			this.clock.tick(1500); // wait for the update interval
		}.bind(this));
	});

	QUnit.test("Refresh data if signal for data update is received", function (assert) {
		var done = assert.async(),
			oCacheDataProvider = this.oDataProviderFactory.create({
				request: {
					url: "/test/url"
				}
			}),
			iRequests = 0,
			oHost = this.oHost;

		assert.expect(2);

		this.oServer.respondWith("GET", "/test/url", function (oXhr) {
			var mCacheHeader = parseHeaderList(oXhr.requestHeaders["Cache-Control"]);

			iRequests++;

			fakeRespond(oXhr);

			if (iRequests === 1) {
				oHost.fireMessage({
					data: {
						type: "ui-integration-card-update",
						url: oCacheDataProvider._sCurrentRequestFullUrl
					}
				});
			}

			if (iRequests === 2) {
				// this should be a cache only request sent after the update signal
				assert.ok(mCacheHeader, "Cache header is received after a cache only request.");
				assert.equal(mCacheHeader["max-age"], SECONDS_IN_YEAR, "Cache-Control: max-age is equal to 1 year for a cache only request.");
				done();
			}
		});

		oCacheDataProvider.triggerDataUpdate().then(function () {
			this.clock.tick(500); // wait for the second data update after the signal
		}.bind(this));
	});

	QUnit.module("Card specific features", {
		beforeEach: function () {
			this.oHost = new Host();
			this.oHost.useExperimentalCaching();

			this.oCard = new Card({ host: this.oHost });
		},
		afterEach: function () {
			this.oCard.destroy();
			this.oHost.destroy();
		}
	});

	QUnit.test("Show timestamp in header", function (assert) {
		var done = assert.async(),
			oCard = this.oCard;

		this.clock.restore(); // data complete is not fired with fake timers

		oCard.attachEvent("_ready", function () {
			var oCardHeader = oCard.getCardHeader();

			assert.ok(oCardHeader.getDataTimestamp(), "Card header has a data timestamp.");
			done();
		});

		oCard.setBaseUrl("test-resources/sap/ui/integration/qunit/manifests/");
		oCard.setManifest({
			"sap.app": {
				"id": "test.cache.sample1"
			},
			"sap.card": {
				data: {
					request: {
						url: "./items.json"
					}
				},
				header: {
					title: "Some title"
				}
			}
		});

		oCard.placeAt(DOM_RENDER_LOCATION);
		Core.applyChanges();
	});

	QUnit.module("Usage without a card or editor", {
		beforeEach: function () {
			this.oHost = new Host();
			this.oHost.useExperimentalCaching();

			this.oDataProviderFactory = new DataProviderFactory({
				host: this.oHost
			});

			this.oServer = sinon.createFakeServer({
				autoRespond: true
			});

			this.oServer.respondImmediately = true;
		},
		afterEach: function () {
			this.oDataProviderFactory.destroy();
			this.oHost.destroy();
			this.oServer.restore();
		}
	});

	QUnit.test("Sends a request with default caching headers", function (assert) {
		var done = assert.async(),
			oCacheDataProvider = this.oDataProviderFactory.create({
				request: {
					url: "/test/url"
				}
			});

		this.oServer.respondWith("GET", "/test/url", function (oXhr) {
			var mHeaders = oXhr.requestHeaders,
				mCacheHeader = parseHeaderList(mHeaders["Cache-Control"]);

			assert.strictEqual(mHeaders["x-sap-card"], "true", "Header x-sap-card=true is sent");
			assert.ok(mCacheHeader, "Cache-Control header is there");
			assert.strictEqual(mCacheHeader["max-age"], "0", "Cache-Control: max-age is set to 0.");
			assert.ok(mCacheHeader["x-stale-while-revalidate"], "Cache-Control: x-stale-while-revalidate is present.");

			fakeRespond(oXhr);
			done();
		});

		oCacheDataProvider.triggerDataUpdate();
	});
});