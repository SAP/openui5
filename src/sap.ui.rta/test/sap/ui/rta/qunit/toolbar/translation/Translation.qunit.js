/*global QUnit*/

sap.ui.define([
	"sap/ui/rta/toolbar/Adaptation",
	"sap/ui/rta/toolbar/translation/Translation",
	"sap/ui/Device",
	"sap/ui/core/Fragment",
	"sap/ui/core/Control",
	"sap/ui/core/format/DateFormat",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/MessageType",
	"sap/ui/core/Core",
	"sap/ui/thirdparty/sinon-4"
],
function(
	Adaptation,
	Translation,
	Device,
	Fragment,
	Control,
	DateFormatter,
	JSONModel,
	MessageType,
	Core,
	sinon
) {
	"use strict";

	var sandbox = sinon.sandbox.create();

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
			return Translation.showTranslationPopover(oEvent, this.oToolbar)
			.then(Translation.openDownloadTranslationDialog())
			.then(function () {
				assert.equal(oFragmentLoadSpy.callCount, 2, "both fragments were loaded");
				// checking for the dialog instance wrapped into a promise
				return oFragmentLoadSpy.getCall(1).returnValue;
			})
			.then(function (oDialog) {
				assert.equal(oDialog.getTitle(), sExpectedTitle, "and the title is as expected");
				assert.equal(oDialog.getModel("translation").oData.sourceLanguage, "", "sourceLanguage value is empty");
				assert.equal(oDialog.getModel("translation").oData.downloadChangedTexts, false, "downloadChangedTexts value is false");

				var oChangedTranslationModel = new JSONModel({
					sourceLanguage: "test",
					downloadChangedTexts: true
				});
				oDialog.setModel(oChangedTranslationModel);
			})
			.then(Translation.openDownloadTranslationDialog.bind(Translation))
			.then(function (oDialog) {
				assert.equal(oFragmentLoadSpy.callCount, 2, "the fragment was not loaded again");
				assert.equal(oDialog.getModel("translation").oData.sourceLanguage, "", "sourceLanguage value is reset");
				assert.equal(oDialog.getModel("translation").oData.downloadChangedTexts, false, "downloadChangedTexts value is reset");
			});
		});
	});
	QUnit.done(function () {
		jQuery("#qunit-fixture").hide();
	});
});
