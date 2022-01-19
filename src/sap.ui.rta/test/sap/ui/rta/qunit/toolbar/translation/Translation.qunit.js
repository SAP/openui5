/*global QUnit*/

sap.ui.define([
	"sap/ui/rta/toolbar/Adaptation",
	"sap/ui/core/Fragment",
	"sap/ui/model/json/JSONModel",
	"sap/ui/thirdparty/sinon-4",
	"sap/ui/core/Core",
	"sap/ui/fl/write/api/TranslationAPI"
], function(
	Adaptation,
	Fragment,
	JSONModel,
	sinon,
	oCore,
	TranslationAPI
) {
	"use strict";

	var sandbox = sinon.createSandbox();

	QUnit.module("Download & Upload - Translation Dialogs", {
		before: function () {
			this.oToolbar = new Adaptation({
				textResources: oCore.getLibraryResourceBundle("sap.ui.rta")
			});
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
			this.oFragmentLoadSpy = sandbox.spy(Fragment, "load");
			return this.oToolbar._pFragmentLoaded;
		},
		afterEach: function() {
			sandbox.restore();
			this.oFragmentLoadSpy = {};
		}
	}, function() {
		QUnit.test("Given a dialog is created, when the download changed texts button is pressed and afterwards pressed a second time", function(assert) {
			var oTranslation;
			var oTranslateButton = this.oToolbar.getControl("translate");

			var oEvent = {
				getSource: function () {
					return oTranslateButton;
				}
			};
			sandbox.stub(oTranslateButton, "addDependent");
			sandbox.stub(TranslationAPI, "getSourceLanguages").resolves({sourceLanguages: ["en-EN"]});
			// force a rendering of the button for the Popover.openBy function
			oTranslateButton.placeAt("qunit-fixture");
			var sExpectedTitle = this.oToolbar.getTextResources().getText("TIT_DOWNLOAD_CHANGED_TEXTS");

			return this.oToolbar.showTranslationPopover(oEvent)
			.then(function() {
				oTranslation = this.oToolbar.getExtension("translation");
				assert.ok(oTranslation, "the translation module is added to the toolbar");
				return oTranslation.openDownloadTranslationDialog();
			}.bind(this))
			.then(function (oDialog) {
				assert.equal(oDialog.isOpen(), true, "Dialog is open");
				assert.equal(oDialog.getButtons().length, 2, "Dialog has 2 buttons");
				assert.equal(this.oFragmentLoadSpy.callCount, 2, "both fragments were loaded");
				assert.equal(oDialog.getTitle(), sExpectedTitle, "and the title is as expected");
				assert.equal(oDialog.getModel("translation").getProperty("/sourceLanguage"), "en-EN", "sourceLanguage value is empty");
				assert.equal(oDialog.getModel("translation").getProperty("/downloadChangedTexts"), false, "downloadChangedTexts value is false");

				oDialog.getModel("translation").setProperty("/downloadChangedTexts", true);
				oDialog.getModel("translation").setProperty("/sourceLanguage", "test");
			}.bind(this))
			.then(function() {
				return oTranslation.openDownloadTranslationDialog(oTranslation);
			})
			.then(function (oDialog) {
				assert.equal(this.oFragmentLoadSpy.callCount, 2, "the fragment was not loaded again");
				assert.equal(oDialog.getModel("translation").getProperty("/sourceLanguage"), "en-EN", "sourceLanguage value is reset");
				assert.equal(oDialog.getModel("translation").getProperty("/downloadChangedTexts"), false, "downloadChangedTexts value is reset");
				oDialog.close();
			}.bind(this));
		});

		QUnit.test("Given a dialog is created, when the upload button is pressed and afterwards pressed a second time", function(assert) {
			var oTranslation;
			var oTranslateButton = this.oToolbar.getControl("translate");
			var oEvent = {
				getSource: function () {
					return oTranslateButton;
				}
			};
			sandbox.stub(oTranslateButton, "addDependent");
			// force a rendering of the button for the Popover.openBy function
			oTranslateButton.placeAt("qunit-fixture");
			var sExpectedTitle = this.oToolbar.getTextResources().getText("TIT_UPLOAD_CHANGED_TEXTS");

			return this.oToolbar.showTranslationPopover(oEvent)

			.then(function() {
				oTranslation = this.oToolbar.getExtension("translation");
				assert.ok(oTranslation, "the translation module is added to the toolbar");
				return oTranslation.openUploadTranslationDialog();
			}.bind(this))
			.then(function (oDialog) {
				assert.equal(oDialog.isOpen(), true, "Dialog is open");
				assert.equal(oDialog.getButtons().length, 2, "Dialog has 2 buttons");
				assert.equal(this.oFragmentLoadSpy.callCount, 2, "upload fragment was loaded");
				assert.equal(oDialog.getTitle(), sExpectedTitle, "and the title is as expected");
			}.bind(this))
			.then(function() {
				return oTranslation.openUploadTranslationDialog(oTranslation);
			})
			.then(function (oDialog) {
				assert.equal(this.oFragmentLoadSpy.callCount, 2, "the upload fragment was not loaded again");
				oDialog.close();
			}.bind(this));
		});
	});

	QUnit.done(function () {
		jQuery("#qunit-fixture").hide();
	});
});
