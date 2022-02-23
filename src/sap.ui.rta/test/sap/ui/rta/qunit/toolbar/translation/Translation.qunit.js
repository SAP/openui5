/*global QUnit*/

sap.ui.define([
	"sap/m/MessageBox",
	"sap/ui/core/Core",
	"sap/ui/core/Control",
	"sap/ui/core/Fragment",
	"sap/ui/core/util/File",
	"sap/ui/fl/Layer",
	"sap/ui/fl/write/api/TranslationAPI",
	"sap/ui/model/json/JSONModel",
	"sap/ui/rta/toolbar/Adaptation",
	"sap/ui/rta/toolbar/translation/Translation",
	"sap/ui/thirdparty/sinon-4"
], function(
	MessageBox,
	Core,
	Control,
	Fragment,
	FileUtil,
	Layer,
	TranslationAPI,
	JSONModel,
	Adaptation,
	Translation,
	sinon
) {
	"use strict";

	var sandbox = sinon.createSandbox();

	function getDownloadDialogControl(oToolbar, sId) {
		return sap.ui.getCore().byId(oToolbar.getId() + "_download_translation_fragment--" + sId);
	}

	function getUploadDialogControl(oToolbar, sId) {
		return sap.ui.getCore().byId(oToolbar.getId() + "_upload_translation_fragment--" + sId);
	}

	QUnit.module("Given within the Translation", {
		beforeEach: function () {
			this.oToolbar = new Adaptation({
				textResources: Core.getLibraryResourceBundle("sap.ui.rta"),
				rtaInformation: {
					flexSettings: {
						layer: Layer.CUSTOMER
					},
					rootControl: new Control()
				}
			});

			this.oTranslation = new Translation({toolbar: this.oToolbar});

			this.oToolbarControlsModel = new JSONModel({
				undoEnabled: false,
				redoEnabled: false,
				translationEnabled: true,
				translationAvailable: true,
				publishVisible: false,
				publishEnabled: false,
				restoreEnabled: false,
				appVariantsOverviewVisible: false,
				appVariantsOverviewEnabled: false,
				saveAsVisible: false,
				saveAsEnabled: false,
				manageAppsVisible: false,
				manageAppsEnabled: false,
				modeSwitcher: "adaptation"
			});
			this.oToolbar.setModel(this.oToolbarControlsModel, "controls");

			sandbox.stub(TranslationAPI, "getSourceLanguages").resolves(["en-EN"]);

			return this.oToolbar._pFragmentLoaded;
		},
		afterEach: function() {
			this.oToolbar.destroy();
			sandbox.restore();
		}
	}, function () {
		QUnit.module("a download dialog", {}, function () {
			QUnit.module("is created", {
				beforeEach: function () {
					sandbox.stub(TranslationAPI, "hasTranslationRelevantDirtyChanges").returns(false);
					this.oFragmentLoadSpy = sandbox.spy(Fragment, "load");
					return this.oToolbar._pFragmentLoaded;
				},
				afterEach: function () {
					this.oToolbar.destroy();
					sandbox.restore();
				}
			}, function () {
				QUnit.test("and no dirty changes exist then the dialog is created and opened", function (assert) {
					return this.oTranslation.openDownloadTranslationDialog().then(function (oDialog) {
						assert.equal(this.oFragmentLoadSpy.callCount, 1, "the fragment was loaded");
						assert.equal(oDialog.isOpen(), true, "the dialog is opened");
					}.bind(this));
				});

				QUnit.test("and opened a second time", function (assert) {
					return this.oTranslation.openDownloadTranslationDialog().then(function (oDialog) {
						// simulate user selection
						oDialog.getModel("translation").setProperty("/targetLanguage", "de");
						oDialog.close();
					}).then(this.oTranslation.openDownloadTranslationDialog.bind(this.oTranslation))
						.then(function (oDialog) {
							assert.equal(this.oFragmentLoadSpy.callCount, 1, "the fragment was loaded not again");
							assert.equal(oDialog.isOpen(), true, "the dialog is opened");
							assert.deepEqual(oDialog.getModel("translation").getProperty("/targetLanguage"), "", "the data was reset");
						}.bind(this));
				});
			});

			QUnit.module("is opened", {}, function () {
				QUnit.test("when a target language is selected and download pressed", function (assert) {
					// finish after the press event handling
					var done = assert.async();
					sandbox.stub(TranslationAPI, "hasTranslationRelevantDirtyChanges").returns(false);

					return this.oTranslation.openDownloadTranslationDialog().then(function (oDialog) {
						var oStubbedXml = "<xml></xml>";

						var oSaveChangesStub = sandbox.stub(this.oToolbar, "fireSave");
						var oGetTextsStub = sandbox.stub(TranslationAPI, "getTexts").resolves(oStubbedXml);
						var oSaveFileStub = sandbox.stub(FileUtil, "save");

						sandbox.stub(oDialog, "close").callsFake(function () {
							assert.equal(oSaveChangesStub.callCount, 0, "no changes were saved");
							assert.equal(oGetTextsStub.callCount, 1, "the texts were collected");
							var oGetTextsArgs = oGetTextsStub.getCall(0).args[0];
							assert.equal(oGetTextsArgs.layer, Layer.CUSTOMER, "the layer is set correct");
							assert.equal(oGetTextsArgs.sourceLanguage, "en-EN", "the source language is set correct");
							assert.equal(oGetTextsArgs.targetLanguage, "de-DE", "the target language is set correct");
							assert.equal(oSaveFileStub.callCount, 1, "a file was saved");
							var aSaveFileArgs = oSaveFileStub.getCall(0).args;
							assert.equal(aSaveFileArgs[0], oStubbedXml, "the file is passed correct");
							assert.equal(aSaveFileArgs[1], "en-EN_de-DE_TranslationXLIFF", "the file name is set correct");
							assert.equal(aSaveFileArgs[2], "xml", "the file type is set correct");
							assert.equal(aSaveFileArgs[3], "application/xml", "a content type is set correct");
							done();
						});
						// simulate user input
						oDialog.getModel("translation").setProperty("/targetLanguage", "de-DE");
						var oDownloadButton = getDownloadDialogControl(this.oToolbar, "downloadTranslation");
						oDownloadButton.firePress();
					}.bind(this));
				});
				QUnit.test("when a target language is not selected and download pressed", function (assert) {
					// finish after the error message
					var done = assert.async();
					sandbox.stub(TranslationAPI, "hasTranslationRelevantDirtyChanges").returns(false);
					assert.expect(0);
					return this.oTranslation.openDownloadTranslationDialog().then(function () {
						sandbox.stub(MessageBox, "error").callsFake(done);
						var oDownloadButton = getDownloadDialogControl(this.oToolbar, "downloadTranslation");
						oDownloadButton.firePress();
					}.bind(this));
				});
				QUnit.test("and a translatable dirty change is present", function (assert) {
					// finish after the press event handling
					var done = assert.async();
					sandbox.stub(TranslationAPI, "hasTranslationRelevantDirtyChanges").returns(true);// finish after the error message

					return this.oTranslation.openDownloadTranslationDialog().then(function (oDialog) {
						var oMessageStrip = getDownloadDialogControl(this.oToolbar, "dirtyChangesExistsMessage");
						assert.equal(oMessageStrip.getVisible(), true, "then a message is shown");

						var oStubbedXml = "<xml></xml>";
						var oGetTextsStub = sandbox.stub(TranslationAPI, "getTexts").resolves(oStubbedXml);
						var oSaveChangesStub = sandbox.stub(this.oToolbar, "fireSave").callsFake(function (mParameters) {
							mParameters.callback();
						});
						var oSaveFileStub = sandbox.stub(FileUtil, "save");

						sandbox.stub(oDialog, "close").callsFake(function () {
							assert.equal(oSaveChangesStub.callCount, 1, "the changes were saved");
							assert.ok(oSaveChangesStub.calledBefore(oSaveFileStub), "the files were saved before the texts were requested");
							assert.equal(oGetTextsStub.callCount, 1, "the texts were collected");
							var oGetTextsArgs = oGetTextsStub.getCall(0).args[0];
							assert.equal(oGetTextsArgs.layer, Layer.CUSTOMER, "the layer is set correct");
							assert.equal(oGetTextsArgs.sourceLanguage, "en-EN", "the source language is set correct");
							assert.equal(oGetTextsArgs.targetLanguage, "de-DE", "the target language is set correct");
							assert.equal(oSaveFileStub.callCount, 1, "a file was saved");
							var aSaveFileArgs = oSaveFileStub.getCall(0).args;
							assert.equal(aSaveFileArgs[0], oStubbedXml, "the file is passed correct");
							assert.equal(aSaveFileArgs[1], "en-EN_de-DE_TranslationXLIFF", "the file name is set correct");
							assert.equal(aSaveFileArgs[2], "xml", "the file type is set correct");
							assert.equal(aSaveFileArgs[3], "application/xml", "a content type is set correct");
							done();
						});

						// simulate user input
						oDialog.getModel("translation").setProperty("/targetLanguage", "de-DE");
						var oDownloadButton = getDownloadDialogControl(this.oToolbar, "downloadTranslation");
						oDownloadButton.firePress();
					}.bind(this));
				});

				QUnit.test("and a translatable dirty change is present when the cancel button is pressed", function (assert) {
					// finish after the press event handling
					var done = assert.async();
					sandbox.stub(TranslationAPI, "hasTranslationRelevantDirtyChanges").returns(true);// finish after the error message

					return this.oTranslation.openDownloadTranslationDialog().then(function (oDialog) {
						var oMessageStrip = getDownloadDialogControl(this.oToolbar, "dirtyChangesExistsMessage");
						assert.equal(oMessageStrip.getVisible(), true, "then a message is shown");

						var oGetTextsStub = sandbox.stub(TranslationAPI, "getTexts");
						var oSaveChangesStub = sandbox.stub(this.oToolbar, "fireSave");
						var oSaveFileStub = sandbox.stub(FileUtil, "save");

						sandbox.stub(oDialog, "close").callsFake(function () {
							assert.equal(oSaveChangesStub.callCount, 0, "no changes were saved");
							assert.equal(oGetTextsStub.callCount, 0, "no texts were collected");
							assert.equal(oSaveFileStub.callCount, 0, "no file was saved");
							done();
						});

						// simulate user input
						oDialog.getModel("translation").setProperty("/targetLanguage", "de-DE");
						var oCancelDownloadButton = getDownloadDialogControl(this.oToolbar, "cancelDownloadTranslation");
						oCancelDownloadButton.firePress();
					}.bind(this));
				});

				QUnit.test("Given a dialog is open when a file is selected, download is pressed and an error occurs", function (assert) {
					// finish after the press event handling
					var done = assert.async();
					assert.expect(0);
					sandbox.stub(TranslationAPI, "hasTranslationRelevantDirtyChanges").returns(false);

					return this.oTranslation.openDownloadTranslationDialog().then(function (oDialog) {
						var oStubbedXml = "<xml></xml>";

						sandbox.stub(this.oToolbar, "fireSave");
						sandbox.stub(TranslationAPI, "getTexts").resolves(oStubbedXml);
						sandbox.stub(FileUtil, "save").throws(new Error("all broken"));

						sandbox.stub(MessageBox, "error").callsFake(done);

						// simulate user input
						oDialog.getModel("translation").setProperty("/targetLanguage", "de-DE");
						var oDownloadButton = getDownloadDialogControl(this.oToolbar, "downloadTranslation");
						oDownloadButton.firePress();
					}.bind(this));
				});
			});
		});

		QUnit.module("a upload dialog", {}, function () {
			QUnit.module("is created", {
				beforeEach: function () {
					this.oFragmentLoadSpy = sandbox.spy(Fragment, "load");
				}
			}, function () {
				QUnit.test("for the first time", function (assert) {
					return this.oTranslation.openUploadTranslationDialog().then(function (oDialog) {
						assert.equal(this.oFragmentLoadSpy.callCount, 1, "the fragment was loaded");
						assert.equal(oDialog.isOpen(), true, "the dialog is opened");
						assert.equal(getUploadDialogControl(this.oToolbar, "uploadTranslation").getEnabled(), false, "the upload button is disabled");
					}.bind(this));
				});

				QUnit.test("and opened a second time", function (assert) {
					return this.oTranslation.openUploadTranslationDialog().then(function (oDialog) {
						return oDialog.close();
					}).then(this.oTranslation.openUploadTranslationDialog.bind(this.oTranslation))
						.then(function (oDialog) {
							assert.equal(this.oFragmentLoadSpy.callCount, 1, "the fragment was loaded only once");
							assert.equal(oDialog.isOpen(), true, "the dialog is opened");
						}.bind(this));
				});
			});

			QUnit.module("is opened", {}, function () {
				QUnit.test("when a file is selected and upload is pressed", function (assert) {
					// finish after the press event handling
					var done = assert.async();

					return this.oTranslation.openUploadTranslationDialog().then(function (oDialog) {
						var oModel = oDialog.getModel("translation");

						// simulate user file selection
						var oFileBlob = new Blob([JSON.stringify('<xml />', null, 2)], {type: 'application/xml'});
						oModel.setProperty("/filePath", "C:\\myFolder\\en-EN_de-DE_TranslationXLIFF.xml");
						oModel.setProperty("/file", oFileBlob);
						var oUploadButton = getUploadDialogControl(this.oToolbar, "uploadTranslation");
						assert.equal(oUploadButton.getEnabled(), true, "the upload button is enabled");

						var oPostTranslationTextsStub = sandbox.stub(TranslationAPI, "uploadTranslationTexts").resolves();
						sandbox.stub(oDialog, "close").callsFake(function () {
							assert.equal(oPostTranslationTextsStub.callCount, 1, "the file was uploaded");
							done();
						});

						oUploadButton.firePress();
					}.bind(this));
				});

				QUnit.test("when the cancel button is pressed", function (assert) {
					// finish after the press event handling
					var done = assert.async();

					return this.oTranslation.openUploadTranslationDialog().then(function (oDialog) {
						var oModel = oDialog.getModel("translation");

						// simulate user file selection
						var oFileBlob = new Blob([JSON.stringify('<xml />', null, 2)], {type: 'application/xml'});
						oModel.setProperty("/filePath", "C:\\myFolder\\en-EN_de-DE_TranslationXLIFF.xml");
						oModel.setProperty("/file", oFileBlob);

						var oPostTranslationTextsStub = sandbox.stub(TranslationAPI, "uploadTranslationTexts").resolves();
						sandbox.stub(oDialog, "close").callsFake(function () {
							assert.equal(oPostTranslationTextsStub.callCount, 0, "no file was uploaded");
							done();
						});

						var oCancelUploadButton = getUploadDialogControl(this.oToolbar, "cancelTranslationUpload");
						oCancelUploadButton.firePress();
					}.bind(this));
				});

				QUnit.test("with a selected file when the file entry is removed", function (assert) {
					return this.oTranslation.openUploadTranslationDialog().then(function (oDialog) {
						var oModel = oDialog.getModel("translation");

						// simulate user file selection
						var oFileBlob = new Blob([JSON.stringify('<xml />', null, 2)], {type: 'application/xml'});
						oModel.setProperty("/filePath", "C:\\myFolder\\en-EN_de-DE_TranslationXLIFF.xml");
						oModel.setProperty("/file", oFileBlob);

						var oUploadButton = getUploadDialogControl(this.oToolbar, "uploadTranslation");
						assert.equal(oUploadButton.getEnabled(), true, "the upload button is enabled");

						oModel.setProperty("/filePath", "");
						oModel.setProperty("/file", undefined);

						assert.equal(oUploadButton.getEnabled(), false, "the upload button is disabled");
					}.bind(this));
				});

				QUnit.test("when a file is selected, upload pressed and an error occurs", function (assert) {
					// finish after the press event handling
					var done = assert.async();
					assert.expect(0);

					return this.oTranslation.openUploadTranslationDialog().then(function (oDialog) {
						var oModel = oDialog.getModel("translation");

						// simulate user file selection
						var oFileBlob = new Blob([JSON.stringify('<xml />', null, 2)], {type: 'application/xml'});
						oModel.setProperty("/filePath", "C:\\myFolder\\en-EN_de-DE_TranslationXLIFF.xml");
						oModel.setProperty("/file", oFileBlob);

						sandbox.stub(MessageBox, "error").callsFake(done);
						sandbox.stub(TranslationAPI, "uploadTranslationTexts").callsFake(function () {
							return Promise.reject("all broken");
						});

						var oUploadButton = getUploadDialogControl(this.oToolbar, "uploadTranslation");
						oUploadButton.firePress();
					}.bind(this));
				});
			});
		});
	});

	QUnit.done(function () {
		jQuery("#qunit-fixture").hide();
	});
});
