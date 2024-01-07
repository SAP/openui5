/*global QUnit, sinon */
sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/test/Opa",
	"sap/ui/thirdparty/URI",
	"sap/ui/thirdparty/jquery",
	"sap/ui/test/_OpaUriParameterParser",
	"../utils/sinon"
], function (Opa5, Opa, URI, jQuery, _OpaUriParameterParser, sinonUtils) {
	"use strict";

	QUnit.test("Should not execute the test in debug mode", function (assert) {
		assert.ok(!window["sap-ui-debug"], "Starting the OPA tests in debug mode is not supported since it changes timeouts");
	});

	var EMPTY_SITE_URL = "test-resources/sap/ui/core/qunit/opa/fixture/emptySite.html";
	var EMPTY_SITE_DEFERRED_URL = "test-resources/sap/ui/core/qunit/opa/fixture/emptySiteDeferredUi5Load.html";

	QUnit.module("IFrame utils");

	var mUtils = {
		getPlugin: function (window) {
			return new (window.sap.ui.require("sap/ui/test/OpaPlugin"))("sap.ui.test.Opa5");
		},
		getJQuery: function (window) {
			return window.jQuery;
		},
		getWindow: function (window) {
			return window;
		},
		getUtils: function (window) {
			return window.sap.ui.require("sap/ui/qunit/QUnitUtils");
		},
		getHashChanger: function (window) {
			return window.sap.ui.require("sap/ui/core/routing/HashChanger").getInstance();
		}
	};

	Object.keys(mUtils).forEach(function (sGetter) {
		QUnit.test("Should " + sGetter + " in an IFrame", function (assert) {
			var done = assert.async(),
				oOpa5 = new Opa5();

			assert.deepEqual(Opa5[sGetter](), mUtils[sGetter](window), "Initially the outer context utils are returned");

			oOpa5.iStartMyAppInAFrame(EMPTY_SITE_URL);
			oOpa5.waitFor({
				success: function () {
					var oFrame = document.getElementById("OpaFrame");
					assert.ok(Opa5[sGetter](), "IFrame utils are returned when IFrame is started");
					assert.deepEqual(Opa5[sGetter](), mUtils[sGetter](oFrame.contentWindow), "IFrame utils are returned after IFrame is started");
				}
			});
			oOpa5.iTeardownMyAppFrame();
			oOpa5.waitFor({
				success: function () {
					assert.deepEqual(Opa5[sGetter](), mUtils[sGetter](window), "After teardown the outer context utils are returned again");
				}
			});

			Opa5.emptyQueue().done(done);
		});
	});

	QUnit.module("IFrame");

	QUnit.test("Should find an IFrame in the dom instead of creating it", function(assert) {
		// System under Test
		var oOpa5 = new Opa5(),
			done = assert.async();
		jQuery("body").append('<iframe id="OpaFrame" src="' + EMPTY_SITE_URL + '"></iframe>');
		var oFrame = document.getElementById("OpaFrame");

		// Act
		oOpa5.iStartMyAppInAFrame().done(function() {

			// Act + Assert
			assert.ok(oFrame === document.getElementById("OpaFrame"), "did not re-create the frame");

		});

		oOpa5.iTeardownMyAppFrame().done(function () {

			assert.ok(!jQuery("#OpaFrame").length, "did remove the frame");
			done();

		});

		oOpa5.emptyQueue();
	});

	// TODO: check why the following tests do not work
	// Answer from tobias: our bootstrap does not work if the UI5 script tag is included in an async way when serving with grunt.
	// The page we test includes UI5 after some time so its not a test issue.
	if (window["sap-ui-bootstrap-tests"]) {

		QUnit.test("Should be able to defer the loading of ui5 and replace the hashchanger", function(assert) {
			// System under Test
			var oOpa5 = new Opa5(),
				done = assert.async();

			// Act
			oOpa5.iStartMyAppInAFrame(EMPTY_SITE_DEFERRED_URL).done(function() {
				var oWindow = Opa5.getWindow();

				// Act
				var IFrameHashChanger = oWindow.sap.ui.require("sap/ui/core/routing/HashChanger");
				var oNewHashChanger = new IFrameHashChanger();
				var fnSetHash = oNewHashChanger.setHash;
				IFrameHashChanger.replaceHashChanger(oNewHashChanger);

				// Assert
				assert.notStrictEqual(oNewHashChanger.setHash, fnSetHash, "did modify the hashchanger");

			});

			oOpa5.iTeardownMyAppFrame().done(done);

			oOpa5.emptyQueue();
		});

		QUnit.test("Should Create and destroy an IFrame", function(assert) {
			// System under Test
			var oOpa5 = new Opa5(),
				done = assert.async(),
				oWindowOpaPlugin = Opa5.getPlugin();

			// Act
			oOpa5.iStartMyAppInAFrame(EMPTY_SITE_URL).done(function() {
				// Act + Assert
				assert.strictEqual(jQuery("#OpaFrame").length, 1, "did create the frame");
				assert.ok(Opa5.getWindow(), "initalized the window of the frame");
				assert.ok(oWindowOpaPlugin !== Opa5.getPlugin(), "initalized the plugin");
				assert.ok(Opa5.getJQuery(), "initalized jQuery");
				assert.ok(Opa5.getUtils(), "initalized the utils");
				assert.ok(Opa5.getHashChanger(), "initalized the hashChanger");

			});

			oOpa5.iTeardownMyAppFrame().done(function () {

				assert.ok(!jQuery("#OpaFrame").length, "did remove the frame");
				assert.strictEqual(Opa5.getWindow(), null, "purged the window of the frame");
				assert.strictEqual(Opa5.getPlugin(), oWindowOpaPlugin, "purged the plugin");
				assert.strictEqual(Opa5.getJQuery(), null, "purged jQuery");
				assert.strictEqual(Opa5.getUtils(), null, "purged the utils");
				assert.strictEqual(Opa5.getHashChanger(), null, "purged the hashChanger");

				done();

			});

			oOpa5.emptyQueue();
		});
	}

	QUnit.module("IFrame - size");

	QUnit.test("Should use default iFrame size and scale", function (assert) {
		var done = assert.async();
		var oOpa5 = new Opa5();

		oOpa5.iStartMyAppInAFrame(EMPTY_SITE_URL).done(function() {
			assert.ok(jQuery("#OpaFrame").hasClass("default-scale-both"), "Applied default size and scale");
			assert.strictEqual(jQuery("#OpaFrame").css("width"), "1280px", "Should have default frame width");
			assert.strictEqual(jQuery("#OpaFrame").css("height"), "1024px", "Should have default frame height");
		});

		oOpa5.iTeardownMyAppFrame();
		oOpa5.emptyQueue().done(done);
	});

	QUnit.test("Should apply user's iFrame width and height", function (assert) {
		var done = assert.async();
		var oOpa5 = new Opa5();

		oOpa5.iStartMyAppInAFrame({source: EMPTY_SITE_URL, width: 700, height: 400}).done(function() {
			assert.strictEqual(jQuery("#OpaFrame").attr("class"), "opaFrame", "Should not scale frame");
			assert.strictEqual(jQuery("#OpaFrame").css("width"), "700px", "Should have desired frame width");
			assert.strictEqual(jQuery("#OpaFrame").css("height"), "400px", "Should have desired frame height");
		});

		oOpa5.iTeardownMyAppFrame();

		oOpa5.iStartMyAppInAFrame({source: EMPTY_SITE_URL, width: 700}).done(function() {
			assert.strictEqual(jQuery("#OpaFrame").attr("class"), "opaFrame default-scale-y", "Should scale only frame height");
			assert.strictEqual(jQuery("#OpaFrame").css("width"), "700px", "Should have desired frame width");
			assert.strictEqual(jQuery("#OpaFrame").css("height"), "1024px", "Should have default frame height");
		});

		oOpa5.iTeardownMyAppFrame();
		oOpa5.emptyQueue().done(done);
	});

	QUnit.test("Should apply iFrame width and height from OPA config", function (assert) {
		var done = assert.async();
		var oOpa5 = new Opa5();
		Opa5.extendConfig({frameWidth: 700, frameHeight: 400});

		oOpa5.iStartMyAppInAFrame({source: EMPTY_SITE_URL, height: 500}).done(function() {
			assert.strictEqual(jQuery("#OpaFrame").attr("class"), "opaFrame", "Should not scale frame");
			assert.strictEqual(jQuery("#OpaFrame").css("width"), "700px", "Should have desired frame width");
			assert.strictEqual(jQuery("#OpaFrame").css("height"), "500px", "Should have desired frame height");
		});

		oOpa5.iTeardownMyAppFrame();
		oOpa5.emptyQueue().done(done);
	});

	QUnit.test("Should apply iFrame width and height from URI params", function (assert) {
		var fnDone = assert.async();
		var fnOrig = URI.prototype.search;
		var oStub = sinonUtils.createStub(URI.prototype, "search", function (query) {
			if (query === true) {
				return {
					opaFrameWidth: "600",
					opaFrameHeight: "400"
				};
			}
			return fnOrig.apply(this, arguments); // should use callThrough with sinon > 3.0
		});
		Opa._uriParams = _OpaUriParameterParser._getOpaParams();
		Opa.extendConfig({});
		var oOpa5 = new Opa5();

		oOpa5.iStartMyAppInAFrame({source: EMPTY_SITE_URL}).done(function() {
			assert.strictEqual(jQuery("#OpaFrame").attr("class"), "opaFrame", "Should not scale frame");
			assert.strictEqual(jQuery("#OpaFrame").css("width"), "600px", "Should have desired frame width");
			assert.strictEqual(jQuery("#OpaFrame").css("height"), "400px", "Should have desired frame height");
		});

		oOpa5.iTeardownMyAppFrame();
		oOpa5.emptyQueue().done(function () {
			oStub.restore();
			fnDone();
		});
	});

	QUnit.module("IFrame navigation", {
		beforeEach: function () {
			this.oOpa5 = new Opa5();
			this.oOpa5.iStartMyAppInAFrame(EMPTY_SITE_URL);

			this.oOpa5.waitFor({
				success: function () {
					this.oHashChanger = Opa5.getHashChanger();
					this.oHashChanger.init();
				}.bind(this)
			});
		}
	});

	QUnit.test("Should be able to set and replace hashes in an IFrame", function(assert) {

		this.oOpa5.waitFor({
			success: function () {
				// Act + Assert
				assert.strictEqual(this.oHashChanger.getHash(), "", "the initial hash is empty");

				this.oHashChanger.setHash("buz");
				assert.strictEqual(this.oHashChanger.getHash(), "buz", "recorded one hash set");

				this.oHashChanger.replaceHash("baz");
				this.oHashChanger.replaceHash("foo");
				assert.strictEqual(this.oHashChanger.getHash(), "foo", "recorded two replacements");

				this.oHashChanger.setHash("bar");
				assert.strictEqual(this.oHashChanger.getHash(), "bar", "recorded a setting after replacements");
			}.bind(this)
		});

		this.oOpa5.iTeardownMyAppFrame();

		return new Promise(function (fnResolve) {
			Opa5.emptyQueue().done(fnResolve);
		});

	});

	QUnit.test("Should be able to go back in an IFrame", function(assert) {
		// Arrange
		var bAssertionDone = false;

		// Act
		this.oOpa5.waitFor({
			success: function () {
				// Act + Assert
				this.oHashChanger.setHash("bar");

				this.oHashChanger.attachEventOnce("hashChanged", function () {
					assert.strictEqual(this.oHashChanger.getHash(), "", "went back in the history");
					bAssertionDone = true;
				}, this);

				Opa5.getWindow().history.back();
			}.bind(this)
		});

		this.oOpa5.waitFor({
			check: function () {
				return bAssertionDone;
			}
		});

		this.oOpa5.iTeardownMyAppFrame();

		return new Promise(function (fnResolve) {
			Opa5.emptyQueue().done(fnResolve);
		});

	});

	QUnit.test("Should be able to go newHash back sameNewHash in an IFrame", function(assert) {
		// Arrange
		var fnChangedSpy = sinon.spy(),
			bAssertionDone = false;

		// Act
		this.oOpa5.waitFor({
			success: function () {
				this.oHashChanger.setHash("foo");
				this.oHashChanger.setHash("baz");

				this.oHashChanger.attachEventOnce("hashChanged", function () {
					assert.strictEqual(this.oHashChanger.getHash(), "foo", "went back in the history");

					// test for a bug - baz back forward to baz didn't fire the changed event of hasher
					// this is problematic since the old hash cannot be determined, so it will not work for app to app navigation in the ushell
					Opa5.getWindow().hasher.changed.addOnce(fnChangedSpy);
					this.oHashChanger.setHash("baz");

					assert.strictEqual(fnChangedSpy.callCount, 1, "Dispatched the changed signal of hasher");
					assert.strictEqual(fnChangedSpy.getCall(0).args[0], "baz", "the new hash is baz");
					assert.strictEqual(fnChangedSpy.getCall(0).args[1], "foo", "the old hash is foo");
					bAssertionDone = true;
				}, this);

				Opa5.getWindow().history.go(-1);
			}.bind(this)
		});

		this.oOpa5.waitFor({
			check: function () {
				return bAssertionDone;
			}
		});

		this.oOpa5.iTeardownMyAppFrame();

		return new Promise(function (fnResolve) {
			Opa5.emptyQueue().done(fnResolve);
		});

	});

	QUnit.test("Should Navigate forwards in an IFrame", function(assert) {
		// Act
		this.oOpa5.waitFor({
			success: function () {
				// Act + Assert
				this.oHashChanger.setHash("buz");
				this.oHashChanger.setHash("foo");
				this.oHashChanger.replaceHash("baz");
				assert.strictEqual(this.oHashChanger.getHash(), "baz", "replaced to baz");
				Opa5.getWindow().history.go(-1);
				Opa5.getWindow().history.go(1);
				assert.strictEqual(this.oHashChanger.getHash(), "baz", "go(-1) and go(1) resulted in the same entry");

				this.oHashChanger.setHash("bar");
				Opa5.getWindow().history.back();
				Opa5.getWindow().history.forward();
				assert.strictEqual(this.oHashChanger.getHash(), "bar", "back and forward resulted in the same entry");
			}.bind(this)
		});
		this.oOpa5.iTeardownMyAppFrame();

		return new Promise(function (fnResolve) {
			Opa5.emptyQueue().done(fnResolve);
		});
	});

	QUnit.module("IFrame navigation - with window.location", {
		beforeEach: function () {
			this.oOpa5 = new Opa5();
			this.oOpa5.iStartMyAppInAFrame(EMPTY_SITE_URL);

			this.oOpa5.waitFor({
				success: function () {
					this.oHashChanger = Opa5.getHashChanger();
					this.oHashChanger.init();
				}.bind(this)
			});
		}
	});

	function windowLocationTest (fnTestBody, assert) {
		var fnOpaDone = assert.async(),
			bHashChangeDone = false;

		// Act
		this.oOpa5.waitFor({
			success: function () {
				fnTestBody.call(this, function () {
					bHashChangeDone = true;
				});
			}.bind(this)
		});

		this.oOpa5.waitFor({
			check: function () {
				return bHashChangeDone;
			}
		});

		this.oOpa5.iTeardownMyAppFrame();

		Opa5.emptyQueue().done(fnOpaDone);
	}

	QUnit.test("Should react to hashChanges with no initial hash", function(assert) {
		windowLocationTest.call(this, function (fnHashChanged) {
			// Act + Assert
			this.oHashChanger.attachEventOnce("hashChanged", function () {
				setTimeout(function () {
					assert.strictEqual(this.oHashChanger.getHash(), "bar", "window.location.hash changed the hash");
					fnHashChanged();
				}.bind(this),100);
			}.bind(this));

			// trigger a hashchange without notifying hasher
			Opa5.getWindow().location.hash = "bar";
		}, assert);
	});

	QUnit.test("Should react to hashChanges with a set hash call", function(assert) {
		windowLocationTest.call(this, function (fnHashChanged) {
			// Act + Assert
			this.oHashChanger.setHash("foo");

			this.oHashChanger.attachEventOnce("hashChanged", function () {
				setTimeout(function () {
					assert.strictEqual(this.oHashChanger.getHash(), "bar", "window.location.hash changed the hash");
					fnHashChanged();
				}.bind(this),100);
			}.bind(this));

			// trigger a hashchange without notifying hasher
			Opa5.getWindow().location.hash = "bar";
		}, assert);
	});

	QUnit.test("Should react to hashChanges with a replace hash call", function(assert) {
		windowLocationTest.call(this, function (fnHashChanged) {
			// Act + Assert
			this.oHashChanger.replaceHash("foo");

			this.oHashChanger.attachEventOnce("hashChanged", function () {
				setTimeout(function () {
					assert.strictEqual(this.oHashChanger.getHash(), "bar", "window.location.hash changed the hash");
					fnHashChanged();
				}.bind(this),100);
			}.bind(this));

			// trigger a hashchange without notifying hasher
			Opa5.getWindow().location.hash = "bar";
		}, assert);
	});

	QUnit.test("Should react to hashChanges by window.location.hash = ''", function(assert) {
		windowLocationTest.call(this, function (fnHashChanged) {
			// Act + Assert
			this.oHashChanger.setHash("foo");
			this.oHashChanger.replaceHash("baz");

			this.oHashChanger.attachEventOnce("hashChanged", function () {
				setTimeout(function () {
					assert.strictEqual(this.oHashChanger.getHash(), "bar", "window.location.hash changed the hash");
					fnHashChanged();
				}.bind(this),100);
			}.bind(this));

			// trigger a hashchange without notifying hasher
			Opa5.getWindow().location.hash = "bar";
		}, assert);
	});

	QUnit.test("Should react to hashChanges by window.location.hash = '' combined with back and forward", function(assert) {
		windowLocationTest.call(this, function (fnHashChanged) {
			// Act + Assert
			this.oHashChanger.setHash("foo");
			this.oHashChanger.replaceHash("baz");
			this.oHashChanger.setHash("biz");
			Opa5.getWindow().history.go(-1);
			Opa5.getWindow().history.go(1);

			this.oHashChanger.attachEventOnce("hashChanged", function () {
				setTimeout(function () {
					assert.strictEqual(this.oHashChanger.getHash(), "bar", "window.location.hash changed the hash");
					Opa5.getWindow().history.go(-1);
					assert.strictEqual(this.oHashChanger.getHash(), "biz", "window.location.hash changed the hash");
					fnHashChanged();
				}.bind(this),100);
			}.bind(this));

			// trigger a hashchange without notifying hasher
			Opa5.getWindow().location.hash = "bar";
		}, assert);
	});

});
