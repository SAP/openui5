/*global QUnit*/
var iOriginalMaxDepth = QUnit.dump.maxDepth;
QUnit.dump.maxDepth = 10;

sap.ui.define([
	"sap/ui/fl/designtime/appVariant/AppVariantModifier"
],
	function (AppVariantModifier) {
		"use strict";

		var oDescriptorChangeContent1 = {
			changeType: "appdescr_app_addNewInbound",
			creation: "2016-05-29T13:45:26.9169550Z",
			content: {
				inbound: "newInboundId"
			}
		};

		var wizardChangeContent1 = {
			changeType: "appdescr_app_setTitle",
			creation: "2017-05-29T13:45:26.9169550Z",
			namespace: "apps/descriptor.test.appvar/changes/",
			content: {},
			support: {},
			texts: {
				"descriptor.test.appvar_sap.app.title": {
					type: "XTIT",
					maxLength: 20,
					comment: "example",
					value: "new value 01"
				}
			}
		};

		var oNewAppVariantManifest;
		var oNewAppVariantManifestCopy;

		QUnit.module("AppVariantModifier", {
			beforeEach: function () {
				oNewAppVariantManifest = {
					reference: "descriptor.test",
					id: "descriptor.test.appvar",
					content: [
						oDescriptorChangeContent1,
						wizardChangeContent1
					],
					namespace: "apps/descriptor.test/changes/descriptor.test.appvar/",
					fileName: "manifest",
					fileType: "appdescr_variant",
					layer: "VENDOR"
				};
				oNewAppVariantManifestCopy = oNewAppVariantManifest;

			}
		}, function () {
			var oDescriptorChangeContent0 = {
				changeType: "appdescr_app_removeAllInboundsExceptOne",
				creation: "2016-04-29T13:45:26.9169550Z",
				content: {
					inboundId: "exceptInboundId"
				}
			};
			var oDescriptorChangeContent2 = {
				changeType: "appdescr_app_changeInbound",
				creation: "2016-06-29T13:45:26.9169550Z",
				content: {
					inboundId: "newInboundId",
					entityPropertyChange: {
						"dataSource": "../../data"
					}
				}
			};
			var wizardChangeContent0 = {
				changeType: "appdescr_app_setTitle",
				creation: "2017-04-29T13:45:26.9169550Z",
				namespace: "apps/descriptor.test.appvar/changes/",
				content: {},
				support: {},
				texts: {
					"descriptor.test.appvar_sap.app.title": {
						type: "XTIT",
						maxLength: 20,
						comment: "example",
						value: "new value 00"
					}
				}
			};
			var wizardChangeContent2 = {
				changeType: "appdescr_app_setTitle",
				creation: "2017-06-29T13:45:26.9169550Z",
				namespace: "apps/descriptor.test.appvar/changes/",
				content: {},
				support: {},
				texts: {
					"descriptor.test.appvar_sap.app.title": {
						type: "XTIT",
						maxLength: 20,
						comment: "example",
						value: "new value 02"
					}
				}
			};
			var oFlexChangeContent = {
				fileName: "descriptormocha1uiflex",
				fileType: "change",
				namespace: "apps/descriptor.test.appvar/changes/",
				layer: "VENDOR",
				changeType: "addField",
				reference: "descriptor.test.appvar.Component",
				support: {}
			};
			var oOldAppVariantManifest =
			{
				"reference": "sap.app.test1",
				"id": "demo.sap.app.test1.appvariant1",
				"isAppVariantRoot": true,
				"content": [
					oDescriptorChangeContent0,
					wizardChangeContent0
				],
				"namespace": "apps/sap.app.test1/changes/demo.sap.app.test1.appvariant1/",
				"fileName": "manifest",
				"fileType": "appdescr_variant",
				"layer": "VENDOR"
			};

			QUnit.test("does ignore flex changes", function (assert) {
				var aFiles = [
					{
						fileName: "/changes/id_123_addField.change",
						content: JSON.stringify(oFlexChangeContent)
					}
				];

				var oExpectedNewAppVariantManifest = oNewAppVariantManifestCopy;

				var aFilteredFiles = AppVariantModifier.modify(oNewAppVariantManifestCopy, aFiles);
				assert.deepEqual(oNewAppVariantManifestCopy, oExpectedNewAppVariantManifest, "change content should be the same");
				assert.equal(aFilteredFiles.length, 2);
				assert.equal(aFilteredFiles[0].fileName, "/changes/id_123_addField.change", "app variant should be the same");
				assert.equal(aFilteredFiles[1].fileName, "/manifest.appdescr_variant",  "app variant should be the same");

			});

			QUnit.test("does convert descriptor changes into inline changes and place them before new app variant changes", function (assert) {
				var aFiles = [
					{
						fileName: "/changes/id_123_addField.change",
						content: JSON.stringify(oFlexChangeContent)
					}, {
						fileName: "/descriptorChanges/descriptor.test.appvar_changeInbound.change",
						content: JSON.stringify(oDescriptorChangeContent2)
					}
				];

				var oExpectedNewAppVariantManifest = Object.assign({}, oNewAppVariantManifestCopy, {
					content: [
						oDescriptorChangeContent2,
						oDescriptorChangeContent1,
						wizardChangeContent1
					]
				});

				var aFilteredFiles = AppVariantModifier.modify(oNewAppVariantManifestCopy, aFiles);
				assert.deepEqual(oNewAppVariantManifestCopy, oExpectedNewAppVariantManifest, "change content should be the same");
				assert.equal(aFilteredFiles.length, 2);
				assert.equal(aFilteredFiles[0].fileName, "/changes/id_123_addField.change", "app variant should be the same");
				assert.equal(aFilteredFiles[1].fileName, "/manifest.appdescr_variant",  "app variant should be the same");
			});

			QUnit.test("does convert descriptor changes into inline changes and sort them according to their timestamp", function (assert) {

				var aFiles = [
					{
						fileName: "/changes/id_123_addField.change",
						content: JSON.stringify(oFlexChangeContent)
					}, {
						fileName: "/descriptorChanges/descriptor.test.appvar_changeInbound.change",
						content: JSON.stringify(oDescriptorChangeContent1)
					}, {
						fileName: "/descriptorChanges/descriptor.test.appvar_changeInbound.change",
						content: JSON.stringify(oDescriptorChangeContent2)
					}, {
						fileName: "/descriptorChanges/descriptor.test.appvar_changeInbound.change",
						content: JSON.stringify(oDescriptorChangeContent0)
					}
				];

				var oExpectedNewAppVariantManifest = Object.assign({}, oNewAppVariantManifestCopy, {
					content: [
						// sorted aFiles content by creation
						oDescriptorChangeContent0,
						oDescriptorChangeContent1,
						oDescriptorChangeContent2,
						// new app variant content
						oDescriptorChangeContent1,
						wizardChangeContent1
					]
				});

				var aFilteredFiles = AppVariantModifier.modify(oNewAppVariantManifestCopy, aFiles);
				assert.deepEqual(oNewAppVariantManifestCopy, oExpectedNewAppVariantManifest, "change content should be the same");
				assert.equal(aFilteredFiles.length, 2);
				assert.equal(aFilteredFiles[0].fileName, "/changes/id_123_addField.change", "app variant should be the same");
				assert.equal(aFilteredFiles[1].fileName, "/manifest.appdescr_variant",  "app variant should be the same");
			});

			QUnit.test("does place inline changes of old app variant before all other changes", function (assert) {
				// reset to original value, Qunit test effects output
				oNewAppVariantManifest.content = [oDescriptorChangeContent1, wizardChangeContent1];
				var aFiles = [
					{
						fileName: "/changes/id_123_addField.change",
						content: JSON.stringify(oFlexChangeContent)
					}, {
						fileName: "/descriptorChanges/descriptor.test.appvar_changeInbound.change",
						content: JSON.stringify(oDescriptorChangeContent2)
					}, {
						fileName: "/manifest.appdescr_variant",
						content: JSON.stringify(oOldAppVariantManifest)
					}, {
						fileName: "/anotherFolder/descriptorChanges/descriptor.test.appvar_changeInbound.change",
						content: JSON.stringify(oDescriptorChangeContent2)
					}
				];

				var oExpectedNewAppVariantManifest = Object.assign({}, oNewAppVariantManifestCopy, {
					content: [
						oDescriptorChangeContent0,
						oDescriptorChangeContent2,
						oDescriptorChangeContent1,
						wizardChangeContent1
					]
				});

				var aFilteredFiles = AppVariantModifier.modify(oNewAppVariantManifestCopy, aFiles);
				assert.deepEqual(oNewAppVariantManifestCopy, oExpectedNewAppVariantManifest, "change content should be the same");
				assert.equal(aFilteredFiles.length, 3);
				assert.equal(aFilteredFiles[0].fileName, "/changes/id_123_addField.change", "app variant should be the same");
				assert.equal(aFilteredFiles[1].fileName, "/anotherFolder/descriptorChanges/descriptor.test.appvar_changeInbound.change",  "app variant should be the same");
				assert.equal(aFilteredFiles[2].fileName, "/manifest.appdescr_variant",  "app variant should be the same");

			});

			QUnit.test("does condense condensable changes", function (assert) {
				var aFiles = [
					{
						fileName: "/descriptorChanges/descriptor.test.appvar_addTitle.change",
						content: JSON.stringify(wizardChangeContent2)
					}, {
						fileName: "/descriptorChanges/descriptor.test.appvar_addTitle.change",
						content: JSON.stringify(wizardChangeContent0)
					}
				];

				var oExpectedNewAppVariantManifest = Object.assign({}, oNewAppVariantManifest, {
					content: [
						oDescriptorChangeContent1,
						// only last addTitle should be kept, others are condensed
						wizardChangeContent1
					]
				});

				var aFilteredFiles = AppVariantModifier.modify(oNewAppVariantManifestCopy, aFiles);
				assert.deepEqual(oNewAppVariantManifestCopy, oExpectedNewAppVariantManifest, "change content should be the same");
				assert.equal(aFilteredFiles.length, 1);
				assert.equal(aFilteredFiles[0].fileName, "/manifest.appdescr_variant",  "app variant should be the same");

			});

			QUnit.test("does keep uncondensable changes", function (assert) {
				var aFiles = [
					{
						fileName: "/descriptorChanges/descriptor.test.appvar_changeInbound.change",
						content: JSON.stringify(oDescriptorChangeContent2)
					}, {
						fileName: "/descriptorChanges/descriptor.test.appvar_changeInbound.change",
						content: JSON.stringify(oDescriptorChangeContent0)
					}
				];

				var oExpectedNewAppVariantManifest = Object.assign({}, oNewAppVariantManifest, {
					content: [
						oDescriptorChangeContent0,
						oDescriptorChangeContent2,
						oDescriptorChangeContent1,
						wizardChangeContent1
					]
				});

				var aFilteredFiles = AppVariantModifier.modify(oNewAppVariantManifestCopy, aFiles);
				assert.deepEqual(oNewAppVariantManifestCopy, oExpectedNewAppVariantManifest, "change content should be the same");
				assert.equal(aFilteredFiles.length, 1);
				assert.equal(aFilteredFiles[0].fileName, "/manifest.appdescr_variant",  "app variant should be the same");

			});

			QUnit.test("does copy and condense all changes ", function (assert) {
				var aFiles = [
					{
						fileName: "/changes/id_123_addField.change",
						content: JSON.stringify(oFlexChangeContent)
					},
					{
						fileName: "/descriptorChanges/descriptor.test.appvar_addTitle.change",
						content: JSON.stringify(wizardChangeContent2)
					},
					{
						fileName: "/descriptorChanges/descriptor.test.appvar_changeInbound.change",
						content: JSON.stringify(oDescriptorChangeContent2)
					},
					{
						fileName: "/manifest.appdescr_variant",
						content: JSON.stringify(oOldAppVariantManifest)
					},
					{
						fileName: "/descriptorChanges/descriptor.test.appvar_changeInbound.change",
						content: JSON.stringify(oDescriptorChangeContent2)
					}
				];

				var oExpectedNewAppVariantManifest = Object.assign({}, oNewAppVariantManifest, {
					content: [
						oDescriptorChangeContent0,
						oDescriptorChangeContent2,
						oDescriptorChangeContent2,
						oDescriptorChangeContent1,
						wizardChangeContent1
					]
				});

				var aFilteredFiles = AppVariantModifier.modify(oNewAppVariantManifestCopy, aFiles);
				assert.deepEqual(oNewAppVariantManifestCopy, oExpectedNewAppVariantManifest, "change content should be the same");
				assert.equal(aFilteredFiles.length, 2);
				assert.equal(aFilteredFiles[0].fileName, "/changes/id_123_addField.change", "app variant should be the same");
				assert.equal(aFilteredFiles[1].fileName, "/manifest.appdescr_variant",  "app variant should be the same");
			});
		});


		QUnit.done(function () {
			jQuery("#qunit-fixture").hide();
			QUnit.dump.maxDepth = iOriginalMaxDepth;
		});
	});