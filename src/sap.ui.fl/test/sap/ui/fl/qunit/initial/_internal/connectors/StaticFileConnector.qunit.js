/* global QUnit */

sap.ui.define([
	"sap/ui/thirdparty/sinon-4",
	"sap/ui/fl/initial/_internal/connectors/StaticFileConnector",
	"sap/base/Log",
	"sap/base/util/LoaderExtensions",
	"sap/ui/core/Core"
], function(
	sinon,
	StaticFileConnector,
	Log,
	LoaderExtensions,
	oCore
) {
	"use strict";

	var sandbox = sinon.createSandbox();

	QUnit.module("Storage handles flexibility-bundle.json and changes-bundle.json", {
		afterEach() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("given no static flexibility-bundle.json and changes-bundle.json placed for 'reference' resource roots, when loading flex data", function(assert) {
			return StaticFileConnector.loadFlexData({reference: "reference"}).then(function(oResult) {
				assert.deepEqual(oResult, undefined, "no data was returned");
			});
		});

		QUnit.test("given a broken bundle.json for 'test.app' resource roots, when loading flex data", function(assert) {
			sap.ui.require.preload({
				"test/app/broken/changes/changes-bundle.json": "[{:true}]"
			});

			var oLogSpy = sandbox.spy(Log, "error");
			var oLogWarning = sandbox.spy(Log, "warning");

			return StaticFileConnector.loadFlexData({reference: "test.app.broken", componentName: "test.app.broken"}).then(function(oResult) {
				assert.deepEqual(oResult, undefined, "no data was returned");
				if (oLogSpy.callCount !== 1) {
					assert.equal(oLogWarning.callCount, 1, "an error or warning was logged");
				}
			});
		});

		QUnit.test("given a flexibility-bundle.json for 'test.app' resource roots, when loading flex data with an 'componentName'", function(assert) {
			sap.ui.require.preload({
				"test/app/changes/flexibility-bundle.json": '{"changes":[{"dummy":true}],"compVariants":[]}'
			});

			return StaticFileConnector.loadFlexData({reference: "some.other.id", componentName: "test.app"}).then(function(oResult) {
				assert.equal(oResult.changes.length, 1, "one change was loaded");
				var oChange = oResult.changes[0];
				assert.equal(oChange.dummy, true, "the change dummy data is correctly loaded");
			});
		});

		QUnit.test("given a flexibility-bundle.json for 'test.app' resource roots, when loading flex data without an 'componentName'", function(assert) {
			sap.ui.require.preload({
				"test/app/changes/flexibility-bundle.json": '[changes:{"dummy":true},"compVariants":[]]'
			});

			return StaticFileConnector.loadFlexData({reference: "test.app"}).then(function(oResult) {
				assert.equal(oResult.changes.length, 1, "one change was loaded");
				var oChange = oResult.changes[0];
				assert.equal(oChange.dummy, true, "the change dummy data is correctly loaded");
			});
		});

		QUnit.test("given a changes-bundle.json for 'test.app' resource roots, when loading flex data with an 'componentName'", function(assert) {
			sap.ui.require.preload({
				"test/app/changes/changes-bundle.json": '[{"dummy":true},"compVariants":[]]'
			});

			return StaticFileConnector.loadFlexData({reference: "some.other.id", componentName: "test.app"}).then(function(oResult) {
				assert.equal(oResult.changes.length, 1, "one change was loaded");
				var oChange = oResult.changes[0];
				assert.equal(oChange.dummy, true, "the change dummy data is correctly loaded");
			});
		});

		QUnit.test("given only a static changes-bundle.json with dummy data placed for 'test.app' resource roots, when loading flex data", function(assert) {
			sap.ui.require.preload({
				"test/app/changes/changes-bundle.json": '[{"dummy":true},"compVariants":[]]'
			});
			return StaticFileConnector.loadFlexData({reference: "test.app", componentName: "test.app"}).then(function(oResult) {
				assert.equal(oResult.changes.length, 1, "one change was loaded");
				var oChange = oResult.changes[0];
				assert.equal(oChange.dummy, true, "the change dummy data is correctly loaded");
			});
		});

		QUnit.test("given debug is enabled", function(assert) {
			sandbox.stub(oCore.getConfiguration(), "getDebug").returns(true);
			var loadResourceStub = sandbox.stub(LoaderExtensions, "loadResource");

			return StaticFileConnector.loadFlexData({reference: "test.app.not.preloaded", componentName: "test.app.not.preloaded"}).then(function() {
				assert.equal(loadResourceStub.callCount, 2, "two resources were requested");
				assert.ok(loadResourceStub.calledWith("test/app/not/preloaded/changes/flexibility-bundle.json"), "the flexibility-bundle was requested");
				assert.ok(loadResourceStub.calledWith("test/app/not/preloaded/changes/changes-bundle.json"), "the changes-bundle was requested");
			});
		});

		QUnit.test("given componentPreload is 'off'", function(assert) {
			sandbox.stub(oCore.getConfiguration(), "getComponentPreload").returns("off");
			var loadResourceStub = sandbox.stub(LoaderExtensions, "loadResource");

			return StaticFileConnector.loadFlexData({reference: "test.app.not.preloaded", componentName: "test.app.not.preloaded"}).then(function() {
				assert.equal(loadResourceStub.callCount, 2, "two resources were requested");
				assert.ok(loadResourceStub.calledWith("test/app/not/preloaded/changes/flexibility-bundle.json"), "the flexibility-bundle was requested");
				assert.ok(loadResourceStub.calledWith("test/app/not/preloaded/changes/changes-bundle.json"), "the changes-bundle was requested");
			});
		});

		QUnit.test("given only a static flexibility-bundle.json with dummy data placed for 'test.app2' resource roots, when loading flex data", function(assert) {
			// simulate a component-preload
			sap.ui.require.preload({
				"test/app2/changes/flexibility-bundle.json": "{" +
					'"changes": [{"dummy1":true}],' +
					'"compVariants": [{"dummy2":true}],' +
					'"variantChanges": [{"dummy3":true}],' +
					'"variantDependentControlChanges": [{"dummy4":true}],' +
					'"variantManagementChanges": [{"dummy5":true}],' +
					'"variants": [{"dummy6":true}]' +
					"}"
			});

			return StaticFileConnector.loadFlexData({reference: "test.app2", componentName: "test.app2"}).then(function(oResult) {
				assert.equal(oResult.changes.length, 2, "one entries are in the changes property");
				assert.equal(oResult.changes[0].dummy1, true, "the change dummy data is correctly loaded");
				assert.equal(oResult.changes[1].dummy2, true, "the compVariant dummy data is correctly loaded and merged into the changes");
				assert.equal(oResult.compVariants, undefined, "the compVariants section was removed");
				assert.equal(oResult.variantChanges[0].dummy3, true, "the variantChange dummy data is correctly loaded");
				assert.equal(oResult.variantDependentControlChanges[0].dummy4, true, "the variantDependentControlChange dummy data is correctly loaded");
				assert.equal(oResult.variantManagementChanges[0].dummy5, true, "the variantManagementChange dummy data is correctly loaded");
				assert.equal(oResult.variants[0].dummy6, true, "the variant dummy data is correctly loaded");
			});
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
