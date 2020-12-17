/*global QUnit*/

sap.ui.define([
	"sap/ui/fl/apply/_internal/changes/descriptor/ui5/AddComponentUsages",
	"sap/ui/fl/Change",
	"sap/ui/thirdparty/jquery",
	"sap/ui/thirdparty/sinon-4"
],
function (
	AddComponentUsages,
	Change,
	jQuery,
	sinon
) {
	"use strict";

	var sandbox = sinon.sandbox.create();

	QUnit.module("applyChange", {
		beforeEach: function () {
			this.oChange = new Change({
				changeType: "appdescr_ui5_addComponentUsages",
				content: {
					componentUsages: {
						"new.usage": {
							name: "my.used",
							lazy: false,
							settings: {},
							componentData: {}
						},
						"new.usage.2": {
							name: "my.used.2",
							lazy: false,
							settings: {},
							componentData: {}
						}
					}
				}
			});
		},
		afterEach: function () {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when calling '_applyChange' with a change containing two component usages", function (assert) {
			var oManifest = {
				"sap.ui5": {
					dependencies: {
						minUI5Version: "1.86.0",
						libs: {
							"sap.me": {
								minVersion: "1.40.0",
								lazy: true
							}
						}
					},
					componentUsages: {
						existingUsage: {
							name: "my.used.existing",
							lazy: false,
							settings: {},
							componentData: {}
						}
					}
				}
			};
			var oNewManifest = AddComponentUsages.applyChange(oManifest, this.oChange);

			assert.strictEqual(oNewManifest["sap.ui5"]["componentUsages"]["existingUsage"]["name"], "my.used.existing", "the existing component usage is still there.");
			assert.strictEqual(oNewManifest["sap.ui5"]["componentUsages"]["new.usage"], this.oChange.getContent()["componentUsages"]["new.usage"], "the first component usage is added");
			assert.strictEqual(oNewManifest["sap.ui5"]["componentUsages"]["new.usage.2"], this.oChange.getContent()["componentUsages"]["new.usage.2"], "the second component usage is added");
		});

		QUnit.test("when calling '_applyChange' with a change containing same component usage", function (assert) {
			var oManifest = {
				"sap.ui5": {
					dependencies: {
						minUI5Version: "1.86.0",
						libs: {
							"sap.me": {
								minVersion: "1.40.0",
								lazy: true
							}
						}
					},
					componentUsages: {
						"new.usage": {
							name: "my.used",
							lazy: false,
							settings: {},
							componentData: {}
						}
					}
				}
			};
			assert.throws(function() {
				AddComponentUsages.applyChange(oManifest, this.oChange);
			}, Error("Component usage 'new.usage' already exists"),
			"throws error");
		});

		QUnit.test("when calling '_applyChange' with a change containing one component usage and no manifest component usages", function (assert) {
			var oManifest = {
				"sap.ui5": {
					dependencies: {
						minUI5Version: "1.86.0"
					}
				}
			};
			var oNewManifest = AddComponentUsages.applyChange(oManifest, this.oChange);

			assert.strictEqual(oNewManifest["sap.ui5"]["componentUsages"]["new.usage"], this.oChange.getContent()["componentUsages"]["new.usage"], "the first component usage is added");
			assert.strictEqual(oNewManifest["sap.ui5"]["componentUsages"]["new.usage.2"], this.oChange.getContent()["componentUsages"]["new.usage.2"], "the second component usage is added");
		});
	});

	QUnit.done(function() {
		jQuery("#qunit-fixture").hide();
	});
});
