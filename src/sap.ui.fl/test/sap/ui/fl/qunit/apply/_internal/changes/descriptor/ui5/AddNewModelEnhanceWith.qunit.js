/* global QUnit */

sap.ui.define([
	"sap/ui/fl/apply/_internal/changes/descriptor/ui5/AddNewModelEnhanceWith",
	"sap/ui/fl/apply/_internal/flexObjects/AppDescriptorChange",
	"sap/ui/thirdparty/sinon-4"
], function(
	AddNewModelEnhanceWith,
	AppDescriptorChange,
	sinon
) {
	"use strict";

	const sandbox = sinon.createSandbox();

	QUnit.module("applyChange", {
		beforeEach() {
			this.oChangeRelPath = new AppDescriptorChange({
				content: {
					modelId: "random"
				},
				texts: {
					i18n: "resources/i18n/i18n.properties"
				}
			});

			this.oChangeRel2Path = new AppDescriptorChange({
				content: {
					modelId: "random"
				},
				texts: {
					i18n: "resources/../i18n/i18n.properties"
				}
			});

			this.oChangeAbsPath = new AppDescriptorChange({
				content: {
					modelId: "test"
				},
				texts: {
					i18n: "/resources/i18n/i18n.properties"
				}
			});
		},
		afterEach() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when calling '_applyChange' with already given setting.enhanceWith array with texts properties", function(assert) {
			const oManifest = {
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
										bundleName: "some.bundle.name",
										bundleUrlRelativeTo: "manifest"
									}
								]
							}
						}
					}
				}
			};
			let oNewManifest = AddNewModelEnhanceWith.applyChange(oManifest, this.oChangeRelPath);
			assert.equal(oNewManifest["sap.ui5"].models.random.settings.enhanceWith.length, 2, "settings/enhanceWith is updated correctly.");
			assert.equal(oNewManifest["sap.ui5"].models.random.settings.enhanceWith[1].bundleName, "consumer.base.app.resources.i18n.i18n", "settings/enhanceWith is updated correctly.");

			oNewManifest = AddNewModelEnhanceWith.applyChange(oNewManifest, this.oChangeRel2Path);
			assert.equal(oNewManifest["sap.ui5"].models.random.settings.enhanceWith.length, 3, "settings/enhanceWith is updated correctly.");
			assert.equal(oNewManifest["sap.ui5"].models.random.settings.enhanceWith[2].bundleName, "consumer.base.app.i18n.i18n", "settings/enhanceWith is updated correctly.");
		});

		QUnit.test("when calling '_applyChange' with already given setting.enhanceWith array with bundleUrl in change content", function(assert) {
			const oManifest = {
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
										bundleName: "some.bundle.name",
										bundleUrlRelativeTo: "manifest"
									}
								]
							}
						}
					}
				}
			};
			const oNewManifest = AddNewModelEnhanceWith.applyChange(oManifest, new AppDescriptorChange({
				content: {
					modelId: "random",
					bundleUrl: "i18n/i18n.properties"
				}
			}));
			assert.equal(oNewManifest["sap.ui5"].models.random.settings.enhanceWith.length, 2, "settings/enhanceWith is updated correctly.");
			assert.equal(oNewManifest["sap.ui5"].models.random.settings.enhanceWith[1].bundleUrl, undefined, "settings/enhanceWith is updated correctly.");
			assert.equal(oNewManifest["sap.ui5"].models.random.settings.enhanceWith[1].bundleName, "consumer.base.app.i18n.i18n", "settings/enhanceWith is updated correctly.");
		});

		QUnit.test("when calling '_applyChange' with a bundleName and bundleUrl", function(assert) {
			const oManifest = {
				"sap.app": {
					id: "consumer.base.app"
				},
				"sap.ui5": {
					models: {
						i18n: {
							type: "sap.ui.model.resource.ResourceModel",
							uri: "some/random/url"
						}
					}
				}
			};
			const oAppDescriptorChange = {
				content: {
					modelId: "i18n",
					bundleName: "com.sample.sap.base.i18n.properties",
					bundleUrl: "reuse/appvar1/i18n/i18n.terminologies.soccer.properties"
				}
			};

			assert.throws(function() {
				AddNewModelEnhanceWith.applyChange(oManifest, new AppDescriptorChange(oAppDescriptorChange));
			}, Error("A schema violation has been identified. Either bundleName or bundleUrl property must be used."),
			"throws the correct error message");
		});

		QUnit.test("when calling '_applyChange' with a wrong model type", function(assert) {
			const oManifest = {
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
			const oNewManifest = AddNewModelEnhanceWith.applyChange(oManifest, this.oChangeRelPath);
			assert.notOk(oNewManifest["sap.ui5"].models.i18n.settings, "settings.enhanceWith is not updated.");
		});

		QUnit.test("when calling '_applyChange' with a wrong model name", function(assert) {
			const oManifest = {
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
			const oNewManifest = AddNewModelEnhanceWith.applyChange(oManifest, this.oChangeRelPath);
			assert.notOk(oNewManifest["sap.ui5"].models.test.settings, "settings/enhanceWith is not updated.");
		});

		QUnit.test("when calling '_applyChange' with invalid absolute path", function(assert) {
			const oManifest = {
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

		QUnit.test("when calling '_applyChange' without settings.enhanceWith property", function(assert) {
			const oManifest = {
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
			let oNewManifest = AddNewModelEnhanceWith.applyChange(oManifest, this.oChangeRelPath);
			assert.equal(oNewManifest["sap.ui5"].models.random.settings.enhanceWith.length, 1, "enhanceWith is updated correctly");
			assert.equal(oNewManifest["sap.ui5"].models.random.settings.enhanceWith[0].bundleName, "consumer.base.app.resources.i18n.i18n", "enhanceWith.bundleName is updated correctly");

			oNewManifest = AddNewModelEnhanceWith.applyChange(oNewManifest, this.oChangeRel2Path);
			assert.equal(oNewManifest["sap.ui5"].models.random.settings.enhanceWith.length, 2, "enhanceWith is updated correctly");
			assert.equal(oNewManifest["sap.ui5"].models.random.settings.enhanceWith[1].bundleName, "consumer.base.app.i18n.i18n", "enhanceWith.bundleName is updated correctly");
		});

		QUnit.test("when calling '_applyChange' with two terminologies objects containing bundleName or bundleUrl", function(assert) {
			const oManifest = {
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
										bundleName: "some.bundle.name",
										bundleUrlRelativeTo: "manifest"
									}
								]
							}
						}
					}
				}
			};
			const oExpectedTerminolgy = {
				sports: {
					bundleName: "consumer.base.app.reuse.appvar1.i18n.i18n.terminologies.soccer",
					bundleUrlRelativeTo: "manifest",
					supportedLocales: ["en", "de"]
				},
				travel: {
					bundleName: "consumer.base.app.reuse.appvar1.i18n.i18n.terminologies.travel",
					supportedLocales: ["en", "de"]
				}
			};
			const oNewManifest = AddNewModelEnhanceWith.applyChange(oManifest, new AppDescriptorChange({
				content: {
					modelId: "random",
					bundleName: "com.sample.sap.base.i18n.properties",
					terminologies: {
						sports: {
							bundleUrl: "reuse/appvar1/i18n/i18n.terminologies.soccer.properties",
							bundleUrlRelativeTo: "manifest",
							supportedLocales: ["en", "de"]
						},
						travel: {
							bundleName: "consumer.base.app.reuse.appvar1.i18n.i18n.terminologies.travel",
							supportedLocales: ["en", "de"]
						}
					}
				}
			}));
			assert.equal(oNewManifest["sap.ui5"].models.random.settings.enhanceWith.length, 2, "enhanceWith is updated correctly");
			assert.deepEqual(oNewManifest["sap.ui5"].models.random.settings.enhanceWith[1].terminologies, oExpectedTerminolgy, "terminolgies is updated correctly");
		});

		QUnit.test("when calling '_applyChange' with terminologies containing bundleName and bundleUrl", function(assert) {
			const oManifest = {
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
										bundleName: "some.bundle.name",
										bundleUrlRelativeTo: "manifest"
									}
								]
							}
						}
					}
				}
			};
			const oAppDescriptorChange = {
				content: {
					modelId: "random",
					bundleName: "com.sample.sap.base.i18n.properties",
					terminologies: {
						sports: {
							bundleUrl: "reuse/appvar1/i18n/i18n.terminologies.soccer.properties",
							bundleName: "com.sap.base.app.id.i18n.i18n",
							bundleUrlRelativeTo: "manifest",
							supportedLocales: ["en", "de"]
						},
						travel: {
							bundleUrl: "reuse/appvar1/i18n/i18n.terminologies.vehicles.properties",
							bundleName: "com.sap.base.app.id.i18n.i18n",
							bundleUrlRelativeTo: "manifest",
							supportedLocales: ["en", "de"]
						}
					}
				}
			};

			assert.throws(function() {
				AddNewModelEnhanceWith.applyChange(oManifest, new AppDescriptorChange(oAppDescriptorChange));
			}, Error("A schema violation has been identified. Either bundleName or bundleUrl property must be used."),
			"throws the correct error message");
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
