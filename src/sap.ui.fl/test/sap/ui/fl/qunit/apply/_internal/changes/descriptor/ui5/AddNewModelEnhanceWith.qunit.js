/*global QUnit*/

sap.ui.define([
	"sap/ui/fl/apply/_internal/changes/descriptor/ui5/AddNewModelEnhanceWith",
	"sap/ui/fl/Change",
	"sap/ui/thirdparty/jquery",
	"sap/ui/thirdparty/sinon-4"
],
function (
	AddNewModelEnhanceWith,
	Change,
	jQuery,
	sinon
) {
	"use strict";

	var sandbox = sinon.sandbox.create();

	QUnit.module("applyChange", {
		beforeEach: function () {
			this.oChangeRelPath = new Change({
				content: {
					modelId: "random"
				},
				texts: {
					i18n: "resources/i18n/i18n.properties"
				}
			});

			this.oChangeRel2Path = new Change({
				content: {
					modelId: "random"
				},
				texts: {
					i18n: "resources/../i18n/i18n.properties"
				}
			});

			this.oChangeAbsPath = new Change({
				content: {
					modelId: "random"
				},
				texts: {
					i18n: "/resources/i18n/i18n.properties"
				}
			});
		},
		afterEach: function () {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when calling '_applyChange' with already given setting.enhanceWith array", function (assert) {
			var oManifest = {
				"sap.app": {
					id: "consumer.base.app"
				},
				"sap.ui5": {
					models: {
						random: {
							type: "sap.ui.model.resource.ResourceModel",
							uri: "i18n/i18n.properties",
							settings: {
								enhanceWith: [
									{
										bundleName: "some.bunlde.name",
										bundleUrlRelativeTo: "manifest"
									}
								]
							}
						}
					}
				}
			};
			var oNewManifest = AddNewModelEnhanceWith.applyChange(oManifest, this.oChangeRelPath);
			assert.equal(oNewManifest["sap.ui5"].models.random.settings.enhanceWith.length, 2, "settings/enhanceWith is updated correctly.");
			assert.equal(oNewManifest["sap.ui5"].models.random.settings.enhanceWith[1].bundleName, "consumer.base.app.resources.i18n.i18n", "settings/enhanceWith is updated correctly.");

			oNewManifest = AddNewModelEnhanceWith.applyChange(oNewManifest, this.oChangeRel2Path);
			assert.equal(oNewManifest["sap.ui5"].models.random.settings.enhanceWith.length, 3, "settings/enhanceWith is updated correctly.");
			assert.equal(oNewManifest["sap.ui5"].models.random.settings.enhanceWith[2].bundleName, "consumer.base.app.i18n.i18n", "settings/enhanceWith is updated correctly.");
		});

		QUnit.test("when calling '_applyChange' with a wrong model type", function (assert) {
			var oManifest = {
				"sap.app": {
					id: "consumer.base.app"
				},
				"sap.ui5": {
					models: {
						i18n: {
							type: "sap.ui.model.odata.ODataModel",
							uri: "some/random/url"
						}
					}
				}
			};
			var oNewManifest = AddNewModelEnhanceWith.applyChange(oManifest, this.oChangeRelPath);
			assert.notOk(oNewManifest["sap.ui5"].models.i18n.settings, "settings.enhanceWith is not updated.");
		});

		QUnit.test("when calling '_applyChange' with a wrong model name", function (assert) {
			var oManifest = {
				"sap.app": {
					id: "consumer.base.app"
				},
				"sap.ui5": {
					models: {
						test: {
							type: "sap.ui.model.odata.ODataModel",
							uri: "some/random/url"
						}
					}
				}
			};
			var oNewManifest = AddNewModelEnhanceWith.applyChange(oManifest, this.oChangeRelPath);
			assert.notOk(oNewManifest["sap.ui5"].models.test.settings, "settings/enhanceWith is not updated.");
		});

		QUnit.test("when calling '_applyChange' with invalid absolute path", function (assert) {
			var oManifest = {
				"sap.app": {
					id: "consumer.base.app"
				},
				"sap.ui5": {
					models: {
						test: {
							type: "sap.ui.model.resource.ResourceModel",
							uri: "some/random/url"
						}
					}
				}
			};

			assert.throws(function() {
				AddNewModelEnhanceWith.applyChange(oManifest, this.oChangeAbsPath);
			}, Error("Absolute paths are not supported"),
			"throws error");
		});

		QUnit.test("when calling '_applyChange' without settings.enhanceWith property", function (assert) {
			var oManifest = {
				"sap.app": {
					id: "consumer.base.app"
				},
				"sap.ui5": {
					models: {
						random: {
							type: "sap.ui.model.resource.ResourceModel",
							uri: "some/random/url"
						}
					}
				}
			};
			var oNewManifest = AddNewModelEnhanceWith.applyChange(oManifest, this.oChangeRelPath);
			assert.equal(oNewManifest["sap.ui5"].models.random.settings.enhanceWith.length, 1, "enhanceWith is updated correctly");
			assert.equal(oNewManifest["sap.ui5"].models.random.settings.enhanceWith[0].bundleName, "consumer.base.app.resources.i18n.i18n", "enhanceWith.bundleName is updated correctly");

			oNewManifest = AddNewModelEnhanceWith.applyChange(oNewManifest, this.oChangeRel2Path);
			assert.equal(oNewManifest["sap.ui5"].models.random.settings.enhanceWith.length, 2, "enhanceWith is updated correctly");
			assert.equal(oNewManifest["sap.ui5"].models.random.settings.enhanceWith[1].bundleName, "consumer.base.app.i18n.i18n", "enhanceWith.bundleName is updated correctly");
		});
	});

	QUnit.done(function() {
		jQuery("#qunit-fixture").hide();
	});
});
