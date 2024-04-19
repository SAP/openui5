/* eslint-disable max-nested-callbacks */
/* global QUnit */

sap.ui.define([
	"sap/ui/fl/apply/_internal/changes/descriptor/ui5/SetMinUI5Version",
	"sap/ui/fl/apply/_internal/flexObjects/AppDescriptorChange"
], function(
	SetMinUI5Version,
	AppDescriptorChange
) {
	"use strict";

	function applyChange(oldValue, newValue) {
		var oManifest = { "sap.ui5": { dependencies: { minUI5Version: oldValue } } };
		var oNewManifest = SetMinUI5Version.applyChange(oManifest, new AppDescriptorChange({
			content: {
				minUI5Version: newValue
			}
		}));
		return oNewManifest["sap.ui5"].dependencies.minUI5Version;
	}

	QUnit.module("when calling '_applyChange' with invalid change/base app", {
	}, function() {
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

		QUnit.test("minUI5Version array in change content contains a major version more than once", function(assert) {
			assert.throws(function() {
				var oManifest = { "sap.ui5": { dependencies: { minUI5Version: "1.75.2" } } };
				SetMinUI5Version.applyChange(oManifest, new AppDescriptorChange({
					content: {
						minUI5Version: ["1.120.0", "1.128.0", "2.0.0"]
					}
				}));
			}, Error("Each major version can only be provided once in minUI5Version of change content"),
			"throws error that no minUI5Version in change content provided");
			assert.throws(function() {
				var oManifest = { "sap.ui5": { dependencies: { minUI5Version: "1.75.2" } } };
				SetMinUI5Version.applyChange(oManifest, new AppDescriptorChange({
					content: {
						minUI5Version: ["1.120.0", "2.0.0", "2.1.0"]
					}
				}));
			}, Error("Each major version can only be provided once in minUI5Version of change content"),
			"throws error that no minUI5Version in change content provided");
			assert.throws(function() {
				var oManifest = { "sap.ui5": { dependencies: { minUI5Version: "1.75.2" } } };
				SetMinUI5Version.applyChange(oManifest, new AppDescriptorChange({
					content: {
						minUI5Version: ["1.120.0", "2.0.0", "1.120.0"]
					}
				}));
			}, Error("Each major version can only be provided once in minUI5Version of change content"),
			"throws error that no minUI5Version in change content provided");
			assert.throws(function() {
				var oManifest = { "sap.ui5": { dependencies: { minUI5Version: "1.75.2" } } };
				SetMinUI5Version.applyChange(oManifest, new AppDescriptorChange({
					content: {
						minUI5Version: ["2.0.0", "1.120.0", "2.0.0"]
					}
				}));
			}, Error("Each major version can only be provided once in minUI5Version of change content"),
			"throws error that no minUI5Version in change content provided");
		});

		QUnit.test("minUI5Version missing in base manifest", function(assert) {
			assert.throws(function() {
				applyChange(undefined, "2.0.0");
			}, Error("sap.ui5/dependencies/minUI5Version missing in base manifest"),
			"throws error that sap.ui5/dependencies/minUI5Version missing in base manifest");
		});
	});

	QUnit.module("when calling '_applyChange' for base app minUI5Version string with minUI5Version string in change containing ", {
	}, function() {
		QUnit.test("library upgrade", function(assert) {
			assert.equal(applyChange("1.72.0", "1.75.3"), "1.75.3", "minUI5Version is updated correctly.");
			assert.equal(applyChange("1.72.0", "1.120.0"), "1.120.0", "minUI5Version is updated correctly.");
			assert.equal(applyChange("1.120.0", "1.133.0"), "1.133.0", "minUI5Version is updated correctly.");
			assert.equal(applyChange("2.2.0", "2.12.0"), "2.12.0", "minUI5Version is updated correctly.");
		});

		QUnit.test("library downgrade", function(assert) {
			assert.equal(applyChange("1.77", "1.75"), "1.77", "minUI5Version is kept correctly.");
			assert.equal(applyChange("1.120", "1.75"), "1.120", "minUI5Version is kept correctly.");
			assert.equal(applyChange("1.120.0", "1.103.0"), "1.120.0", "minUI5Version is kept correctly.");
			assert.equal(applyChange("2.2.0", "2.1.0"), "2.2.0", "minUI5Version is kept correctly.");
		});

		QUnit.test("one library upgrade/downgrade from/to major version", function(assert) {
			assert.throws(function() {
				applyChange("1.120.0", "2.0.0");
			}, Error("Upgrade/Downgrade for different major version not possible"),
			"throws error that major version upgrade is not possible");
			assert.throws(function() {
				applyChange("2.0.0", "1.120.0");
			}, Error("Upgrade/Downgrade for different major version not possible"),
			"throws error that major version downgrade is not possible");
		});
	});

	QUnit.module("when calling '_applyChange' for base app minUI5Version array with minUI5Version string in change containing ", {
	}, function() {
		QUnit.test("one library upgrade/downgrade from/to major version and a base manifest having minUI5Version as array with different major version", function(assert) {
			assert.throws(function() {
				applyChange(["1.120.0"], "2.0.0");
			}, Error("Upgrade/Downgrade for different major version not possible"),
			"throws error that major version upgrade is not possible");
			assert.throws(function() {
				applyChange(["2.0.0"], "1.120.0");
			}, Error("Upgrade/Downgrade for different major version not possible"),
			"throws error that major version downgrade is not possible");
		});

		QUnit.test("one library upgrade and a base manifest having minUI5Version as array with two major versions", function(assert) {
			assert.equal(applyChange(["1.120.0", "2.2.0"], "1.126.0"), "1.126.0", "minUI5Version is updated correctly.");
			assert.equal(applyChange(["1.120.0", "2.2.0"], "2.2.0"), "2.2.0", "minUI5Version is updated correctly.");
		});

		QUnit.test("one library upgrade and a base manifest having minUI5Version as array with same major version", function(assert) {
			assert.equal(applyChange(["1.120.0"], "1.133.0"), "1.133.0", "minUI5Version is updated correctly.");
			assert.equal(applyChange(["2.2.0"], "2.12.0"), "2.12.0", "minUI5Version is updated correctly.");
		});

		QUnit.test("one library downgrade and a base manifest having minUI5Version as array with two major versions", function(assert) {
			assert.equal(applyChange(["1.120.0", "2.0.0"], "1.106.0"), "1.120.0", "minUI5Version is updated correctly.");
			assert.equal(applyChange(["1.120.0", "2.2.0"], "2.0.0"), "2.2.0", "minUI5Version is updated correctly.");
		});

		QUnit.test("one library downgrade and a base manifest having minUI5Version as array with same major version", function(assert) {
			assert.equal(applyChange(["1.120.0"], "1.106.0"), "1.120.0", "minUI5Version is updated correctly.");
			assert.equal(applyChange(["2.2.0"], "2.0.0"), "2.2.0", "minUI5Version is updated correctly.");
		});
	});

	QUnit.module("when calling '_applyChange' for base app minUI5Version string with minUI5Version array in change containing ", {
	}, function() {
		QUnit.test("one library downgrade and another major version added", function(assert) {
			assert.equal(applyChange("1.120.0", ["1.106.0", "2.0.0"]), "1.120.0", "minUI5Version is updated correctly.");
			assert.equal(applyChange("1.120.0", ["1.126.0", "2.0.0"]), "1.126.0", "minUI5Version is updated correctly.");
			assert.equal(applyChange("2.11.22", ["1.120.0", "2.0.0"]), "2.11.22", "minUI5Version is updated correctly.");
		});

		QUnit.test("one library upgrade and another major version added", function(assert) {
			assert.equal(applyChange("2.2.0", ["1.120.0", "2.34.56"]), "2.34.56", "minUI5Version is updated correctly.");
			assert.equal(applyChange("2.2.0", ["1.106.0", "2.34.56"]), "2.34.56", "minUI5Version is updated correctly.");
		});

		QUnit.test("one library downgrade/upgrade to another major version and a base manifest having minUI5Version as string with different major version", function(assert) {
			assert.throws(function() {
				applyChange("2.11.22", ["1.120.0"]);
			}, Error("Upgrade/Downgrade for different major version not possible"),
			"throws error that major version downgrade is not possible");
			assert.throws(function() {
				applyChange("1.121.22", ["2.0.0"]);
			}, Error("Upgrade/Downgrade for different major version not possible"),
			"throws error that major version downgrade is not possible");
		});

		QUnit.test("one library upgrade and a base manifest having minUI5Version as string with same major version", function(assert) {
			assert.equal(applyChange("1.111.22", ["1.130.0"]), "1.130.0", "minUI5Version is updated correctly.");
			assert.equal(applyChange("2.11.22", ["2.30.0"]), "2.30.0", "minUI5Version is updated correctly.");
		});
	});

	QUnit.module("when calling '_applyChange' for base app minUI5Version array with minUI5Version array in change containing ", {
	}, function() {
		QUnit.test("one library downgrade/upgrade to another major version and a base manifest having minUI5Version as array with different major version", function(assert) {
			assert.throws(function() {
				applyChange(["2.11.22"], ["1.120.0"]);
			}, Error("Upgrade/Downgrade for different major version not possible"),
			"throws error that major version downgrade is not possible");
			assert.throws(function() {
				applyChange("[1.121.22]", ["2.0.0"]);
			}, Error("Upgrade/Downgrade for different major version not possible"),
			"throws error that major version downgrade is not possible");
		});

		QUnit.test("one library version downgrade and another library version upgrade having minUI5Version as array with both major versions", function(assert) {
			assert.deepEqual(applyChange(["1.120.0", "2.22.0"], ["1.106.0", "2.0.0"]), ["1.120.0", "2.22.0"],
				"minUI5Version is updated correctly.");
			assert.deepEqual(applyChange(["1.120.0", "2.2.0"], ["1.126.10", "2.1.90"]), ["1.126.10", "2.2.0"],
				"minUI5Version is updated correctly.");
		});

		QUnit.test("one library upgrade and other major version dropped", function(assert) {
			assert.equal(applyChange(["1.120.0", "2.2.0"], ["1.126.0"]), "1.126.0", "minUI5Version is updated correctly.");
			assert.equal(applyChange(["1.120.0", "2.2.0"], ["2.4.5"]), "2.4.5", "minUI5Version is updated correctly.");
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});