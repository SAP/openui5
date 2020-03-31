/*global QUnit*/

sap.ui.define([
	"sap/ui/fl/apply/_internal/changes/descriptor/ApplyUtil",
	"sap/ui/thirdparty/jquery",
	"sap/ui/thirdparty/sinon-4"
],
function (
	ApplyUtil,
	jQuery,
	sinon
) {
	"use strict";

	var sandbox = sinon.sandbox.create();

	QUnit.module("ApplyUtil", {
		afterEach: function () {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when calling 'formatBundleName' with absolute bundleUrl", function (assert) {
			assert.throws(function() {
				ApplyUtil.formatBundleName("test.app.id", "/absolute/path");
			}, Error("Absolute paths are not supported"),
			"throws error");
		});

		QUnit.test("when calling 'formatBundleName' with relative bundleUrl", function (assert) {
			assert.equal(ApplyUtil.formatBundleName("test.app.id", "relative/path/test"), "test.app.id.relative.path.test", "bundleName is correct");
			assert.equal(ApplyUtil.formatBundleName("test.app.id", "relative/../path/test"), "test.app.id.path.test", "bundleName is correct");
			assert.equal(ApplyUtil.formatBundleName("test.app.id", "i18n/i18n.properties"), "test.app.id.i18n.i18n", "bundleName is correct");
		});

		QUnit.test("when calling 'formatBundleName' with bundleName bundleUrl", function (assert) {
			assert.equal(ApplyUtil.formatBundleName("test.app.id", "relative.path.test"), "test.app.id.relative.path.test", "bundleName is correct");
			assert.equal(ApplyUtil.formatBundleName("test.app.id", "i18n.i18n.properties"), "test.app.id.i18n.i18n", "bundleName is correct");
			assert.equal(ApplyUtil.formatBundleName("test.app.id", ".i18n.i18n.properties"), "test.app.id.i18n.i18n", "bundleName is correct");
		});
	});

	QUnit.done(function() {
		jQuery("#qunit-fixture").hide();
	});
});
