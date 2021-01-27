/*global QUnit */
sap.ui.define([
	"sap/ui/test/_LogCollector",
	"sap/ui/test/_OpaLogger",
	"sap/ui/test/autowaiter/_resourceWaiter",
	"sap/m/Image"
], function (_LogCollector, _OpaLogger, _resourceWaiter, Image) {
	"use strict";

	// before running this test in IE11, clear cached images

	var oLogCollector = _LogCollector.getInstance();

	QUnit.module("ResourceWaiter", {
		beforeEach: function () {
			this.defaultLogLevel = _OpaLogger.getLevel();
			_OpaLogger.setLevel("trace");
			var sBase = "test-resources/sap/ui/core/images/";
			this.sExistingImageSrc = sBase + "Mobile.png";
			this.sReplacerImageSrc = sBase + "Notebook.png";
			this.sNotFoundSrc = sBase + "noSuchImage.jpg";
		},
		afterEach: function () {
			_OpaLogger.setLevel(this.defaultLogLevel);
			oLogCollector.getAndClearLog(); // cleanup
		}
	});

	function assertImagePending(sSrc, assert) {
		var bHasPending = _resourceWaiter.hasPending();
		var sLogs = oLogCollector.getAndClearLog();
		if (bHasPending) {
			assert.ok(true, "Has pending resources");
			// image could be cached or loaded in previous steps
			assert.ok(sLogs.match("Pending resource: .*" + sSrc) ||
				sLogs.match("Image with src '.*" + sSrc + "' is updated and pending again"),
				"Image with src " + sSrc + " is pending");
		} else {
			// when CPU is very slow, hasPending may be called before load handler
			assert.ok(true, "Has no pending resources");
			assert.ok(sLogs.match("Image with src '.*" + sSrc + "' completed") ||
				sLogs.match("Image with src '.*" + sSrc + "' loaded successfully"),
				"Image already loaded");
		}
	}

	// workaround for image loading (async) - there can multiple images created for 1 test, but we only check one at a time
	function assertNoRelevantPending(sRelevantSrc, bPass, assert) {
		_resourceWaiter.hasPending();
		var sLogs = oLogCollector.getAndClearLog();
		var aRelevantPending = sLogs.match("Pending resource: .*" + sRelevantSrc);
		assert.ok(!aRelevantPending, "Should have no pending resources with src " + sRelevantSrc);
		assert.ok(sLogs.match("Image with src '.*" + sRelevantSrc + (bPass ? "' loaded successfully" : "' failed to load")),
			"Image with src " + sRelevantSrc + " is not pending");
	}

	QUnit.test("Should wait for image to load", function (assert) {
		var fnDone = assert.async();
		this.oImageExistingSrc = new Image({
			src: this.sExistingImageSrc
		});
		this.oImageExistingSrc.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		// wait for the rendering to start
		setTimeout(function () {
			assertImagePending(this.sExistingImageSrc, assert);

			this.oImageExistingSrc.attachLoad(fnOnComplete(true).bind(this));
		}.bind(this), 0);

		function fnOnComplete(bPass) {
			return function () {
				// wait for other load handlers
				setTimeout(function () {
					assertNoRelevantPending(this.sExistingImageSrc, bPass, assert);

					// cleanup
					this.oImageExistingSrc.destroy();
					sap.ui.getCore().applyChanges();
					fnDone();
				}.bind(this), 0);
			};
		}
	});

	QUnit.test("Should wait for image to complete with error", function (assert) {
		var fnDone = assert.async();
		this.oImageWrongSrc = new Image({
			src: this.sNotFoundSrc
		});
		this.oImageWrongSrc.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		// wait for the rendering to start
		setTimeout(function () {
			assertImagePending(this.sNotFoundSrc, assert);

			this.oImageWrongSrc.attachError(function () {
				// wait for other load handlers
				setTimeout(function () {
					assertNoRelevantPending(this.sNotFoundSrc, false, assert);

					// cleanup
					this.oImageWrongSrc.destroy();
					sap.ui.getCore().applyChanges();
					fnDone();
				}.bind(this), 0);
			}.bind(this));
		}.bind(this), 0);
	});

	QUnit.test("Should wait for image to load when src is changed", function (assert) {
		var fnDone = assert.async();
		this.oImageWrongSrc = new Image({
			src: this.sNotFoundSrc
		});
		this.oImageWrongSrc.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		var bSrcChanged = false;

		this.oImageWrongSrc.attachError(function () {
			if (!bSrcChanged) {
				bSrcChanged = true;
				setTimeout(function () {
					assertNoRelevantPending(this.sNotFoundSrc, false, assert);

					// update image - from sNotFoundSrc to sReplacerImageSrc
					this.oImageWrongSrc.setSrc(this.sReplacerImageSrc);
					sap.ui.getCore().applyChanges();

					// wait for the rendering to start
					setTimeout(function () {
						assertImagePending(this.sReplacerImageSrc, assert);

						this.oImageWrongSrc.attachLoad(fnOnComplete(true).bind(this));
					}.bind(this), 0);
				}.bind(this), 0);
			}
		}.bind(this));

		function fnOnComplete(bPass) {
			return function () {
				// wait for load handlers
				setTimeout(function () {
					assertNoRelevantPending(this.sReplacerImageSrc, bPass, assert);

					// cleanup
					this.oImageWrongSrc.destroy();
					sap.ui.getCore().applyChanges();
					fnDone();
				}.bind(this), 0);
			};
		}
	});
});
