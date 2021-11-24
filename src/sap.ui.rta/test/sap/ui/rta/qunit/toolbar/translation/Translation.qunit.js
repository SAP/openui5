/*global QUnit*/

sap.ui.define([
	"sap/ui/rta/toolbar/Adaptation",
	"sap/ui/core/Fragment",
	"sap/ui/model/json/JSONModel",
	"sap/ui/thirdparty/sinon-4"
], function(
	Adaptation,
	Fragment,
	JSONModel,
	sinon
) {
	"use strict";

	var sandbox = sinon.createSandbox();

	QUnit.module("Download Translation Dialog", {
		before: function () {
			this.oToolbar = new Adaptation({
				textResources: sap.ui.getCore().getLibraryResourceBundle("sap.ui.rta")
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

			return this.oToolbar._pFragmentLoaded;
		},
		after: function() {
			this.oToolbar.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("Given a dialog is created, when the download changed texts button is pressed and afterwards pressed a second time", function(assert) {
			var oTranslation;
			var oFragmentLoadSpy = sandbox.spy(Fragment, "load");
			var oTranslateButton = this.oToolbar.getControl("translate");
			var oEvent = {
				getSource: function () {
					return oTranslateButton;
				}
			};
			sandbox.stub(oTranslateButton, "addDependent");
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
				assert.equal(oFragmentLoadSpy.callCount, 2, "both fragments were loaded");
				assert.equal(oDialog.getTitle(), sExpectedTitle, "and the title is as expected");
				assert.equal(oDialog.getModel("translation").getProperty("/sourceLanguage"), "", "sourceLanguage value is empty");
				assert.equal(oDialog.getModel("translation").getProperty("/downloadChangedTexts"), false, "downloadChangedTexts value is false");

				oDialog.getModel("translation").setProperty("/downloadChangedTexts", true);
				oDialog.getModel("translation").setProperty("/sourceLanguage", "test");
			})
			.then(function() {
				return oTranslation.openDownloadTranslationDialog(oTranslation);
			})
			.then(function (oDialog) {
				assert.equal(oFragmentLoadSpy.callCount, 2, "the fragment was not loaded again");
				assert.equal(oDialog.getModel("translation").getProperty("/sourceLanguage"), "", "sourceLanguage value is reset");
				assert.equal(oDialog.getModel("translation").getProperty("/downloadChangedTexts"), false, "downloadChangedTexts value is reset");
			});
		});
	});

	QUnit.done(function () {
		jQuery("#qunit-fixture").hide();
	});
});
