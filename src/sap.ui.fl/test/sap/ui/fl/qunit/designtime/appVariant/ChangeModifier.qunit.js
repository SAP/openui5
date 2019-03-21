/*global QUnit*/
var iOriginalMaxDepth = QUnit.dump.maxDepth;
QUnit.dump.maxDepth = 10;

sap.ui.define([
		"sap/ui/thirdparty/sinon-4",
		"sap/ui/fl/designtime/appVariant/ChangeModifier"
	],
	function (sinon, ChangeModifier) {
		"use strict";

		var sandbox = sinon.sandbox.create();

		QUnit.module("file filtering", {
			afterEach: function () {
				sandbox.restore();
			}
		}, function() {
			QUnit.test("does modify change files in the '/changes/' folder", function (assert) {
				var sFirstChangeContent = "{selector: {id: \"firstControl\"}}";
				var sSecondChangeContent = "{selector: {id: \"secondControl\"}}";

				var aFiles = [{
					fileName: "/changes/id_1550588173383_10_changeLabel.change",
					content: sFirstChangeContent
				},{
					fileName: "/changes/subfolder/ id_1550588173383_10_changeLabel.change",
					content: "{}"
				},{
					fileName: "/changes/id_1550588173383_11_changeLabel.change",
					content: sSecondChangeContent
				},{
					fileName: "/descriptorChanges/id_1550588173383_11_setTitle.change",
					content: "{}"
				}];

				var modifyChangeFileStub = sandbox.stub(ChangeModifier, "_modifyChangeFile");

				ChangeModifier.modify("", "", true, aFiles);

				assert.equal(modifyChangeFileStub.callCount, 2, "two files were modified");
				assert.equal(modifyChangeFileStub.getCall(0).args[0], sFirstChangeContent);
				assert.equal(modifyChangeFileStub.getCall(1).args[0], sSecondChangeContent);
			});

			QUnit.test("does modify change files in the '/changes/' folder of the type '.change'", function (assert) {
				var sFirstChangeContent = "{selector: {id: \"firstControl\"}}";
				var sSecondChangeContent = "{selector: {id: \"secondControl\"}}";

				var aFiles = [{
					fileName: "/changes/coding/myCode.js",
					content: "{}"
				},{
					fileName: "/changes/id_1550588173383_10_changeLabel.change",
					content: sFirstChangeContent
				},{
					fileName: "/changes/id_1550588173383_11_changeLabel.change",
					content: sSecondChangeContent
				},{
					fileName: "/changes/fragments/my.fragment.xml",
					content: "<>"
				}];

				var modifyChangeFileStub = sandbox.stub(ChangeModifier, "_modifyChangeFile");

				ChangeModifier.modify("", "", true, aFiles);

				assert.equal(modifyChangeFileStub.callCount, 2, "two files were modified");
				assert.equal(modifyChangeFileStub.getCall(0).args[0], sFirstChangeContent);
				assert.equal(modifyChangeFileStub.getCall(1).args[0], sSecondChangeContent);
			});
		});

		QUnit.module("file modification", {
			beforeEach: function () {
				this.oChange = {
					"fileName": "id_1550588173383_10_changeLabel",
					"fileType": "change",
					"changeType": "changeLabel",
					"moduleName": "",
					"reference": "sap.test.Component",
					"packageName": "SOME_PACKAGE",
					"content":{},
					"selector": {
						"id": "view--label",
						"idIsLocal": true
					},
					"layer": "VENDOR",
					"texts":{},
					"namespace": "apps/sap.test/changes/",
					"projectId": "sap.test",
					"creation": "2100-01-01T00:00:00.000000Z",
					"originalLanguage": "EN",
					"conditions":{},
					"context": "",
					"support":{
						"generator": "Change.createInitialFileContent",
						"service": "",
						"user": "SOMEONE",
						"sapui5Version": "1.214.5",
						"sourceChangeFileName": "",
						"compositeCommand": ""
					},
					"oDataInformation":{},
					"dependentSelector":{},
					"validAppVersions":{
						"creation": "2.3.4",
						"from": "2.3.4",
						"to": "2.3.4"
					},
					"jsOnly": false,
					"variantReference": ""
				};
			},
			afterEach: function () {
				sandbox.restore();
			}
		}, function() {
			QUnit.test("does modify a single change correctly", function (assert) {
				var sNewReference = "newReference";
				var sNewVersion = "new.version";
				var sChangeFileContent = JSON.stringify(this.oChange);

				var sModifiedChangeFileContent = ChangeModifier._modifyChangeFile(sChangeFileContent, sNewReference, sNewVersion, true);

				var oModifiedChange = JSON.parse(sModifiedChangeFileContent);

				assert.equal(oModifiedChange.reference, sNewReference, "the reference is set correctly");
				assert.equal(oModifiedChange.validAppVersions.from, sNewVersion, "the from version is set correctly");
				assert.equal(oModifiedChange.validAppVersions.to, sNewVersion, "the to version is set correctly");
				assert.equal(oModifiedChange.validAppVersions.creation, sNewVersion, "the creation version is set correctly");
				assert.equal(oModifiedChange.support.generator, "appVariant.UiChangeModifier", "the generator is set correctly");
				assert.equal(oModifiedChange.support.user, "", "the user was removed");
				assert.equal(oModifiedChange.projectId, sNewReference, "the project ID is set correctly");
				assert.equal(oModifiedChange.packageName, "", "the package name was removed");
				assert.equal(oModifiedChange.namespace, "apps/sap.test/appVariants/" + sNewReference + "/changes/", "the namespace is set correctly");
			});

			QUnit.test("does set the 'validAppVersion.to' parameter in case of a version dependent app variant", function (assert) {
				var sNewReference = "newReference";
				var sNewVersion = "new.version";
				var sChangeFileContent = JSON.stringify(this.oChange);

				var sModifiedChangeFileContent = ChangeModifier._modifyChangeFile(sChangeFileContent, sNewReference, sNewVersion, sap.ui.fl.Scenario.VersionedAppVariant);

				var oModifiedChange = JSON.parse(sModifiedChangeFileContent);
				assert.equal(oModifiedChange.validAppVersions.to, sNewVersion, "the to version is set correctly");
			});

			QUnit.test("does NOT set the 'validAppVersion.to' parameter in case of a NON version dependent app variant", function (assert) {
				var sNewReference = "newReference";
				var sNewVersion = "new.version";
				var sChangeFileContent = JSON.stringify(this.oChange);

				var sModifiedChangeFileContent = ChangeModifier._modifyChangeFile(sChangeFileContent, sNewReference, sNewVersion, sap.ui.fl.Scenario.AppVariant);

				var oModifiedChange = JSON.parse(sModifiedChangeFileContent);
				assert.equal(oModifiedChange.validAppVersions.to, undefined, "the to version is NOT set");
			});
		});

		QUnit.done(function() {
			jQuery("#qunit-fixture").hide();
			QUnit.dump.maxDepth = iOriginalMaxDepth;
		});
	});