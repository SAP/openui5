/* global QUnit */

sap.ui.define([
	"sap/ui/fl/apply/_internal/changes/descriptor/ui5/SetMinUI5Version",
	"sap/ui/fl/apply/_internal/flexObjects/AppDescriptorChange",
	"sap/ui/thirdparty/sinon-4"
], function(
	SetMinUI5Version,
	AppDescriptorChange,
	sinon
) {
	"use strict";

	var sandbox = sinon.createSandbox();

	function applyChange(oldValue, newValue) {
		var oManifest = { "sap.ui5": { dependencies: { minUI5Version: oldValue } } };
		var oNewManifest = SetMinUI5Version.applyChange(oManifest, new AppDescriptorChange({
			content: {
				minUI5Version: newValue
			}
		}));
		return oNewManifest["sap.ui5"].dependencies.minUI5Version;
	}

	QUnit.module("when calling '_applyChange' with a change containing ", {
		afterEach() {
			sandbox.restore();
		}
	}, function() {
		// change and content validations

		QUnit.test("minUI5Version missing in change content", function(assert) {
			assert.throws(function() {
				var oManifest = { "sap.ui5": { dependencies: { minUI5Version: "1.75.2" } } };
				SetMinUI5Version.applyChange(oManifest, new AppDescriptorChange({
					content: {
						property: "1.120.0"
					}
				}));
			}, Error("No minUI5Version in change content provided"),
			"throws error that no minUI5Version in change content provided");
		});

		QUnit.test("minUI5Version missing in base manifest", function(assert) {
			assert.throws(function() {
				applyChange(undefined, "2.0.0");
			}, Error("sap.ui5/dependencies/minUI5Version missing in base manifest"),
			"throws error that sap.ui5/dependencies/minUI5Version missing in base manifest");
		});

		// base app has minUI5Version as string

		QUnit.test("library upgrade", function(assert) {
			assert.equal(applyChange("1.72.0", "1.75.3"), "1.75.3", "minUI5Version is updated correctly.");
			assert.equal(applyChange("1.72.0", "1.120.0"), "1.120.0", "minUI5Version is updated correctly.");
		});

		QUnit.test("library downgrade", function(assert) {
			assert.equal(applyChange("1.77", "1.75"), "1.77", "minUI5Version is kept correctly.");
			assert.equal(applyChange("1.120", "1.75"), "1.120", "minUI5Version is kept correctly.");
		});

		QUnit.test("library v1 upgrade with v2", function(assert) {
			assert.throws(function() {
				applyChange("1.120.0", "2.0.0");
			}, Error("Upgrade/Downgrade for different major version not possible"),
			"throws error that major version upgrade is not possible");
		});

		QUnit.test("library v2 downgrade to v1", function(assert) {
			assert.throws(function() {
				applyChange("2.0.0", "1.120.0");
			}, Error("Upgrade/Downgrade for different major version not possible"),
			"throws error that major version downgrade is not possible");
		});

		QUnit.test("library v1 upgrade", function(assert) {
			assert.equal(applyChange("1.120.0", "1.133.0"), "1.133.0", "minUI5Version is updated correctly.");
		});

		QUnit.test("library v2 upgrade", function(assert) {
			assert.equal(applyChange("2.2.0", "2.12.0"), "2.12.0", "minUI5Version is updated correctly.");
		});

		QUnit.test("library v1 downgrade", function(assert) {
			assert.equal(applyChange("1.120.0", "1.103.0"), "1.120.0", "minUI5Version is kept correctly.");
		});

		QUnit.test("library v2 downgrade", function(assert) {
			assert.equal(applyChange("2.2.0", "2.1.0"), "2.2.0", "minUI5Version is kept correctly.");
		});

		// base app has minUI5Version as array

		QUnit.test("library v1 upgrade with v2 and a base manifest having minUI5Version as array with one v1", function(assert) {
			assert.throws(function() {
				applyChange(["1.120.0"], "2.0.0");
			}, Error("Upgrade/Downgrade for different major version not possible"),
			"throws error that major version upgrade is not possible");
		});

		QUnit.test("library v2 downgrade to v1 and a base manifest having minUI5Version as array with one v2", function(assert) {
			assert.throws(function() {
				applyChange(["2.0.0"], "1.120.0");
			}, Error("Upgrade/Downgrade for different major version not possible"),
			"throws error that major version downgrade is not possible");
		});

		QUnit.test("library v1 upgrade and a base manifest having minUI5Version as array", function(assert) {
			assert.equal(applyChange(["1.120.0", "2.2.0"], "1.126.0"), "1.126.0", "minUI5Version is updated correctly.");
		});

		QUnit.test("library v2 upgrade and a base manifest having minUI5Version as array", function(assert) {
			assert.equal(applyChange(["1.120.0", "2.2.0"], "2.2.0"), "2.2.0", "minUI5Version is updated correctly.");
		});

		QUnit.test("library v1 upgrade and a base manifest having minUI5Version as array with one v1", function(assert) {
			assert.equal(applyChange(["1.120.0"], "1.133.0"), "1.133.0", "minUI5Version is updated correctly.");
		});

		QUnit.test("library v2 upgrade and a base manifest having minUI5Version as array with one v2", function(assert) {
			assert.equal(applyChange(["2.2.0"], "2.12.0"), "2.12.0", "minUI5Version is updated correctly.");
		});

		QUnit.test("library v1 downgrade and a base manifest having minUI5Version as array", function(assert) {
			assert.equal(applyChange(["1.120.0", "2.0.0"], "1.106.0"), "1.120.0", "minUI5Version is kept correctly.");
		});

		QUnit.test("library v2 downgrade and a base manifest having minUI5Version as array", function(assert) {
			assert.equal(applyChange(["1.120.0", "2.2.0"], "2.0.0"), "2.2.0", "minUI5Version is kept correctly.");
		});

		QUnit.test("library v1 downgrade and a base manifest having minUI5Version as array with one v1", function(assert) {
			assert.equal(applyChange(["1.120.0"], "1.106.0"), "1.120.0", "minUI5Version is kept correctly.");
		});

		QUnit.test("library v2 downgrade and a base manifest having minUI5Version as array with one v2", function(assert) {
			assert.equal(applyChange(["2.2.0"], "2.0.0"), "2.2.0", "minUI5Version is kept correctly.");
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});