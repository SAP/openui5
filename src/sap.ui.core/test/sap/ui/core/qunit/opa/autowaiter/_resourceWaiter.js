/*global QUnit */
sap.ui.define([
	"sap/ui/test/_LogCollector",
	"sap/ui/test/_OpaLogger",
	"sap/ui/test/autowaiter/_resourceWaiter",
	"sap/m/Image",
	"sap/m/Text",
	"sap/m/Panel",
	"sap/ui/layout/BlockLayout",
	"sap/ui/layout/BlockLayoutRow",
	"sap/ui/layout/BlockLayoutCell",
	"sap/ui/qunit/utils/nextUIUpdate"
], function (_LogCollector, _OpaLogger, _resourceWaiter, Image, Text, Panel, BlockLayout, BlockLayoutRow, BlockLayoutCell, nextUIUpdate) {
	"use strict";

	var oLogCollector = _LogCollector.getInstance();

	QUnit.module("ResourceWaiter", {
		beforeEach: function () {
			this.defaultLogLevel = _OpaLogger.getLevel();
			_OpaLogger.setLevel("trace");
			var sBase = "test-resources/sap/ui/core/images/";
			this.sExistingImageSrc = sBase + "Mobile.png";
			this.sNestedImageSrc = sBase + "PC.png";
			this.sReplacerImageSrc = sBase + "Notebook.png";
			this.sNotFoundSrc = sBase + "noSuchImage.jpg";
		},
		afterEach: function () {
			_OpaLogger.setLevel(this.defaultLogLevel);
			oLogCollector.getAndClearLog(); // cleanup
		}
	});

	function assertPendingStartedAndFinished(sSrc, bPass, assert) {
		var bHasPending = _resourceWaiter.hasPending();
		var sLogs = oLogCollector.getAndClearLog();
		assert.ok(!bHasPending, "Shoud not have pending images");
		assert.ok(sLogs.match("Image with src '.*" + sSrc + "' is pending") ||
			sLogs.match("Image with src '.*" + sSrc + "' is updated and pending again"),
			"Should have start pending log for image with src " + sSrc);
		assert.ok(sLogs.match("Image with src '.*" + sSrc + (bPass ? "' loaded successfully" : "' failed to load")),
			"Should have stop pending log for image with src " + sSrc);
	}

	QUnit.test("Should wait for image to load", async function (assert) {
		var fnDone = assert.async();
		var bCompleted = false;
		this.oImageExistingSrc = new Image({
			src: this.sExistingImageSrc,
			load: fnOnComplete.bind(this)
		});
		this.oImageExistingSrc.placeAt("qunit-fixture");
		await nextUIUpdate();

		function fnOnComplete() {
			// guard agains duplicate call to load callback
			if (bCompleted) {
				return;
			}
			bCompleted = true;
			// wait for other load handlers, give some time for the observer to fire the changed event
			setTimeout(async function () {
				// assert image was pending and then completed retrospectively from logs
				assertPendingStartedAndFinished(this.sExistingImageSrc,true,assert);

				// cleanup
				this.oImageExistingSrc.destroy();
				await nextUIUpdate();
				fnDone();
			}.bind(this), 50);
		}
	});

	QUnit.test("Should wait for image to load - nested image", async function (assert) {
		var fnDone = assert.async();
		var bCompleted = false;
		this.oNestedImage = new Image("nestedImage", {
			src: this.sNestedImageSrc,
			load: fnOnComplete.bind(this)
		});
		this.oText = new Text("headline", {
			text: "Headline"
		});
		this.oPanel = new Panel({
			content: [new BlockLayout({
				content: [new BlockLayoutRow({
					content: [new BlockLayoutCell({
						content: [
							this.oNestedImage,
							this.oText
						]
					})]
				})]
			})]
		});
		this.oPanel.placeAt("qunit-fixture");
		await nextUIUpdate();

		function fnOnComplete() {
			// guard agains duplicate call to load callback
			if (bCompleted) {
				return;
			}
			bCompleted = true;
			// wait for other load handlers, give some time for the observer to fire the changed event
			setTimeout(async function () {
				// assert image was pending and then completed retrospectively from logs
				assertPendingStartedAndFinished(this.sNestedImageSrc,true,assert);

				// cleanup
				this.oPanel.destroy();
				await nextUIUpdate();
				fnDone();
			}.bind(this), 50);
		}
	});

	QUnit.test("Should wait for image to complete with error", async function (assert) {
		var bFailed = false;
		var fnDone = assert.async();
		this.oImageWrongSrc = new Image({
			src: this.sNotFoundSrc,
			error: fnOnError.bind(this)
		});
		this.oImageWrongSrc.placeAt("qunit-fixture");
		await nextUIUpdate();

		function fnOnError() {
			// guard agains duplicate call to error callback
			if (bFailed) {
				return;
			}
			bFailed = true;
			// wait for other load handlers, give some time for the observer to fire the changed event
			setTimeout(async function () {
				// assert image was pending and then completed retrospectively from logs
				assertPendingStartedAndFinished(this.sNotFoundSrc,false,assert);

				// cleanup
				this.oImageWrongSrc.destroy();
				await nextUIUpdate();
				fnDone();
			}.bind(this), 50);
		}
	});

	QUnit.test("Should wait for image to load when src is changed", async function (assert) {
		var fnDone = assert.async();
		var bCompleted = false;
		var bFailed = false;
		this.oImageWrongSrc = new Image({
			src: this.sNotFoundSrc,
			error: fnOnError.bind(this),
			load: fnOnComplete.bind(this)
		});
		this.oImageWrongSrc.placeAt("qunit-fixture");
		await nextUIUpdate();

		function fnOnError() {
			// guard agains duplicate call to error callback
			if (bFailed) {
				return;
			}
			bFailed = true;
			// wait for other load handlers
			setTimeout(async function () {
				// wait for other load handlers, give some time for the observer to fire the changed event
				assertPendingStartedAndFinished(this.sNotFoundSrc,false,assert);

				// update image - from sNotFoundSrc to sReplacerImageSrc
				this.oImageWrongSrc.setSrc(this.sReplacerImageSrc);
				await nextUIUpdate();
			}.bind(this), 50);
		}

		function fnOnComplete() {
			// guard agains duplicate call to load callback
			if (bCompleted) {
				return;
			}
			bCompleted = true;
			// wait for other load handlers, give some time for the observer to fire the changed event
			setTimeout(async function () {
				// assert image was pending and then completed retrospectively from logs
				assertPendingStartedAndFinished(this.sReplacerImageSrc,true,assert);

				// cleanup
				this.oImageWrongSrc.destroy();
				await nextUIUpdate();
				fnDone();
			}.bind(this), 50);
		}
	});
});
