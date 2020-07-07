/*global QUnit*/

sap.ui.define([
	"sap/ui/rta/toolbar/Adaptation",
	"sap/ui/Device",
	"sap/ui/core/Fragment",
	"sap/ui/model/json/JSONModel",
	"sap/ui/thirdparty/sinon-4"
],
function(
	Adaptation,
	Device,
	Fragment,
	JSONModel,
	sinon
) {
	'use strict';

	var sandbox = sinon.sandbox.create();

	QUnit.module('Different Screen Sizes', {
		beforeEach: function() {
			this.oVersionsModel = new JSONModel({
				versioningEnabled: false,
				versions: [],
				draftAvailable: false
			});
			this.oGetCurrentRangeStub = sandbox.stub(Device.media, "getCurrentRange");
		},
		afterEach: function() {
			this.oToolbar.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when the toolbar gets initially shown in desktop mode (>= 900px) and then rerendered in the other 2 modes", function(assert) {
			this.oToolbar = new Adaptation({
				textResources: sap.ui.getCore().getLibraryResourceBundle("sap.ui.rta")
			});
			this.oToolbar.setModel(this.oVersionsModel, "versions");
			this.oGetCurrentRangeStub.returns({name: Adaptation.modes.DESKTOP});
			this.oToolbar.animation = false;
			return this.oToolbar.show()
			.then(function() {
				assert.equal(this.oToolbar.sMode, Adaptation.modes.DESKTOP, "the mode was correctly set");
				assert.notOk(this.oToolbar.getControl('exit').getIcon(), "the exit button has no icon");
				assert.ok(this.oToolbar.getControl('exit').getText(), "the exit button has text");
				assert.equal(this.oToolbar.getControl('restore').getLayoutData().getPriority(), "High", "the layout data priority is correct");
				assert.notOk(this.oToolbar.getControl("versionLabel").getVisible(), "the version label is hidden");

				this.oToolbar._onSizeChanged({name: Adaptation.modes.TABLET});
				assert.equal(this.oToolbar.sMode, Adaptation.modes.TABLET, "the mode was correctly set");
				assert.notOk(this.oToolbar.getControl("versionLabel").getVisible(), "the version label is hidden");

				this.oToolbar._onSizeChanged({name: Adaptation.modes.MOBILE});
				assert.equal(this.oToolbar.sMode, Adaptation.modes.MOBILE, "the mode was correctly set");
				assert.notOk(this.oToolbar.getControl("versionLabel").getVisible(), "the version label is hidden");

				this.oToolbar._onSizeChanged({name: Adaptation.modes.DESKTOP});
				assert.notOk(this.oToolbar.getControl("versionLabel").getVisible(), "the version label is hidden");
			}.bind(this));
		});

		QUnit.test("when a draft is visible and the toolbar gets initially shown in desktop mode (>= 1200px) and then rerendered in the other 2 modes and back", function(assert) {
			this.oToolbar = new Adaptation({
				textResources: sap.ui.getCore().getLibraryResourceBundle("sap.ui.rta")
			});
			this.oToolbar.setModel(this.oVersionsModel, "versions");
			this.oVersionsModel.setProperty("/versioningEnabled", true);
			this.oGetCurrentRangeStub.returns({name: Adaptation.modes.DESKTOP});
			this.oToolbar.animation = false;

			return this.oToolbar.show()
				.then(function() {
					assert.ok(this.oToolbar.getControl("versionLabel").getVisible(), "the version label is visible");

					this.oToolbar._onSizeChanged({name: Adaptation.modes.TABLET});
					assert.ok(this.oToolbar.getControl("versionLabel").getVisible(), "the version label is visible");

					this.oToolbar._onSizeChanged({name: Adaptation.modes.MOBILE});
					assert.ok(this.oToolbar.getControl("versionLabel").getVisible(), "the version label is visible");

					this.oToolbar._onSizeChanged({name: Adaptation.modes.DESKTOP});
					assert.ok(this.oToolbar.getControl("versionLabel").getVisible(), "the version label is visible");
				}.bind(this));
		});

		QUnit.test("when the toolbar gets initially shown in tablet mode (between 900px and 1200px)", function(assert) {
			this.oToolbar = new Adaptation({
				textResources: sap.ui.getCore().getLibraryResourceBundle("sap.ui.rta")
			});
			this.oToolbar.setModel(this.oVersionsModel, "versions");
			this.oGetCurrentRangeStub.returns({name: Adaptation.modes.TABLET});
			this.oToolbar.animation = false;
			return this.oToolbar.show()
				.then(function() {
					assert.notOk(this.oToolbar.getControl("versionLabel").getVisible(), "the version label is hidden");
					assert.equal(this.oToolbar.sMode, Adaptation.modes.TABLET, "the mode was correctly set");
					assert.notOk(this.oToolbar.getControl('exit').getIcon(), "the exit button has no icon");
					assert.ok(this.oToolbar.getControl('exit').getText(), "the exit button has text");
				}.bind(this));
		});

		QUnit.test("when the draft is set to visible and toolbar gets initially shown in tablet mode (between 900px and 1200px)", function(assert) {
			this.oToolbar = new Adaptation({
				textResources: sap.ui.getCore().getLibraryResourceBundle("sap.ui.rta")
			});
			this.oToolbar.setModel(this.oVersionsModel, "versions");
			this.oVersionsModel.setProperty("/versioningEnabled", true);
			this.oVersionsModel.setProperty("/draftAvailable", true);
			this.oGetCurrentRangeStub.returns({name: Adaptation.modes.TABLET});
			this.oToolbar.animation = false;
			return this.oToolbar.show()
				.then(function() {
					assert.ok(this.oToolbar.getControl("versionLabel").getVisible(), "the version label is shown");
					assert.equal(this.oToolbar.sMode, Adaptation.modes.TABLET, "the mode was correctly set");
				}.bind(this));
		});

		QUnit.test("when the toolbar gets initially shown in mobile mode (< 900px)", function(assert) {
			this.oToolbar = new Adaptation({
				textResources: sap.ui.getCore().getLibraryResourceBundle("sap.ui.rta")
			});
			this.oToolbar.setModel(this.oVersionsModel, "versions");
			this.oGetCurrentRangeStub.returns({name: Adaptation.modes.MOBILE});
			this.oToolbar.animation = false;
			return this.oToolbar.show()
				.then(function() {
					assert.notOk(this.oToolbar.getControl("versionLabel").getVisible(), "the version label is hidden");
					assert.equal(this.oToolbar.sMode, Adaptation.modes.MOBILE, "the mode was correctly set");
					assert.ok(this.oToolbar.getControl('exit').getIcon(), "the exit button has an icon");
					assert.notOk(this.oToolbar.getControl('exit').getText(), "the exit button has no text");
				}.bind(this));
		});

		QUnit.test("when the draft is set to visible and the toolbar gets initially shown in mobile mode (< 900px)", function(assert) {
			this.oToolbar = new Adaptation({
				textResources: sap.ui.getCore().getLibraryResourceBundle("sap.ui.rta")
			});
			this.oToolbar.setModel(this.oVersionsModel, "versions");
			this.oVersionsModel.setProperty("/versioningEnabled", true);
			this.oVersionsModel.setProperty("/draftAvailable", true);
			this.oGetCurrentRangeStub.returns({name: Adaptation.modes.MOBILE});
			this.oToolbar.animation = false;
			return this.oToolbar.show()
				.then(function() {
					assert.ok(this.oToolbar.getControl("versionLabel").getVisible(), "the version label is visible");
					assert.equal(this.oToolbar.sMode, Adaptation.modes.MOBILE, "the mode was correctly set");
					assert.ok(this.oToolbar.getControl('exit').getIcon(), "the exit button has an icon");
					assert.notOk(this.oToolbar.getControl('exit').getText(), "the exit button has no text");
				}.bind(this));
		});
	});

	QUnit.module('Custom setters', {
		before: function() {
			this.oToolbar = new Adaptation({
				textResources: sap.ui.getCore().getLibraryResourceBundle("sap.ui.rta")
			});
			this.oToolbar.setModel(this.oVersionsModel, "versions");
			this.oToolbar.sMode = Adaptation.modes.DESKTOP;
		},
		after: function() {
			this.oToolbar.destroy();
		}
	}, function() {
		QUnit.test("setUndoRedoEnabled", function(assert) {
			assert.notOk(this.oToolbar.getControl("redo").getEnabled(), "the undo button is disabled");
			assert.notOk(this.oToolbar.getControl("redo").getEnabled(), "the undo button is disabled");

			this.oToolbar.setUndoRedoEnabled(true, true);
			assert.ok(this.oToolbar.getControl("redo").getEnabled(), "the undo button is enabled");
			assert.ok(this.oToolbar.getControl("redo").getEnabled(), "the undo button is enabled");

			this.oToolbar.setUndoRedoEnabled(false, false);
			assert.notOk(this.oToolbar.getControl("redo").getEnabled(), "the undo button is disabled");
			assert.notOk(this.oToolbar.getControl("redo").getEnabled(), "the undo button is disabled");
		});

		QUnit.test("setPublishEnabled", function(assert) {
			assert.notOk(this.oToolbar.getControl("publish").getEnabled(), "the undo button is disabled");

			this.oToolbar.setPublishEnabled(true);
			assert.ok(this.oToolbar.getControl("publish").getEnabled(), "the undo button is enabled");

			this.oToolbar.setPublishEnabled(false);
			assert.notOk(this.oToolbar.getControl("publish").getEnabled(), "the undo button is disabled");
		});

		QUnit.test("setRestoreEnabled", function(assert) {
			assert.notOk(this.oToolbar.getControl("restore").getEnabled(), "the undo button is disabled");

			this.oToolbar.setRestoreEnabled(true);
			assert.ok(this.oToolbar.getControl("restore").getEnabled(), "the undo button is enabled");

			this.oToolbar.setRestoreEnabled(false);
			assert.notOk(this.oToolbar.getControl("restore").getEnabled(), "the undo button is disabled");
		});
	});


	QUnit.module("Versions Model binding & formatter for the versions text", {
		before: function () {
			this.oVersionsModel = new JSONModel({
				versioningEnabled: false,
				versions: [],
				draftAvailable: false
			});
			this.oTextResources = sap.ui.getCore().getLibraryResourceBundle("sap.ui.rta");
			this.oToolbar = new Adaptation({
				textResources: this.oTextResources
			});
			this.oToolbar.setModel(this.oVersionsModel, "versions");
			this.sVersionAccent = "sapUiRtaVersionAccent1";
			this.oVersionLabel = this.oToolbar.getControl("versionLabel");
		},
		after: function() {
			this.oToolbar.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("Given a version without any title is the first version in the list", function(assert) {
			var aVersions = [{
				versionNumber: 1
			}];
			var sText = this.oToolbar.formatVersionLabelText(false, aVersions);
			var sExpectedText = this.oTextResources.getText("LBL_VERSION_1");
			assert.equal(sText, sExpectedText, "then the label text matches 'Version 1'");
			assert.equal(this.oVersionLabel.hasStyleClass(this.sVersionAccent), false, "and the label color is not accent");
		});

		QUnit.test("Given a version with a title is the first version in the list", function(assert) {
			var sTitle = "Version Title";
			var aVersions = [{
				versionNumber: 1,
				title: sTitle
			}];
			var sText = this.oToolbar.formatVersionLabelText(false, aVersions);
			this.oVersionsModel.updateBindings();

			assert.equal(sText, sTitle, "then the label text matches the version title");
			assert.equal(this.oVersionLabel.hasStyleClass(this.sVersionAccent), false, "and the label color is not accent");
		});

		QUnit.test("Given a draft version is the first version in the list", function(assert) {
			var aVersions = [{
				versionNumber: 0
			}, {
				versionNumber: 1,
				title: "Version Title"
			}];
			var sText = this.oToolbar.formatVersionLabelText(true, aVersions);

			var sExpectedText = this.oTextResources.getText("LBL_DRAFT");
			assert.equal(sText, sExpectedText, "then the label text matches 'Draft'");
			assert.equal(this.oVersionLabel.hasStyleClass(this.sVersionAccent), true, "and the label color is accent");
		});

		QUnit.test("Given no version is present", function(assert) {
			var sText = this.oToolbar.formatVersionLabelText(false, []);
			this.oVersionsModel.updateBindings();
			var sExpectedText = this.oTextResources.getText("LBL_ORIGNINAL_APP");
			assert.equal(sText, sExpectedText, "then the label text matches 'Original App'");
			assert.equal(this.oVersionLabel.hasStyleClass(this.sVersionAccent), false, "and the label color is not accent");
		});
	});

	QUnit.module("Activate Version Dialog", {
		before: function () {
			this.oToolbar = new Adaptation({
				textResources: sap.ui.getCore().getLibraryResourceBundle("sap.ui.rta")
			});
		},
		after: function() {
			this.oToolbar.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("Given no dialog is created, when the activate version button is pressed and afterwards pressed a second time", function(assert) {
			var oFragmentLoadSpy = sandbox.spy(Fragment, "load");
			var oSetInputSpy;
			var oConfirmButtonEnabledSpy;
			return this.oToolbar._openVersionTitleDialog()
				.then(function () {
					assert.equal(oFragmentLoadSpy.callCount, 1, "the fragment was loaded");
					// checking for the dialog instance wrapped into a promise

					var oVersionTitleInput = this.oToolbar.getControl("versionTitleInput");
					oSetInputSpy = sandbox.spy(oVersionTitleInput, "setValue");
					var oConfirmButton = this.oToolbar.getControl("confirmVersionTitleButton");
					oConfirmButtonEnabledSpy = sandbox.spy(oConfirmButton, "setEnabled");

					return oFragmentLoadSpy.getCall(0).returnValue;
				}.bind(this))
				.then(function (oDialog) {
					assert.equal(this.oToolbar._oDialog, oDialog, "and the dialog was assigned");
				}.bind(this))
				.then(this.oToolbar._openVersionTitleDialog.bind(this.oToolbar))
				.then(function () {
					assert.equal(oFragmentLoadSpy.callCount, 1, "the fragment not loaded again");
					assert.equal(oSetInputSpy.callCount, 1, "and Input Value was set");
					assert.equal(oSetInputSpy.getCall(0).args[0], "", "to an empty string");
					assert.equal(oConfirmButtonEnabledSpy.callCount, 1, "and the confirm button was set");
					assert.equal(oSetInputSpy.getCall(0).args[0], false, "to be disabled");
				});
		});
	});

	function testAppVariantButtons (assert, oToolbar, mAssumptions) {
		var oSaveAsButton = oToolbar.getControl("saveAs");
		var oAppVariantOverview = oToolbar.getControl("appVariantOverview");
		var oManageApps = oToolbar.getControl("manageApps");
		assert.equal(oSaveAsButton.getVisible(), mAssumptions.saveAs.visible, "the 'saveAs' button visibility is correct");
		if (mAssumptions.saveAs.enabled !== undefined) {
			assert.equal(oSaveAsButton.getEnabled(), mAssumptions.saveAs.enabled, "the 'saveAs' button enablement is correct");
		}
		assert.equal(oAppVariantOverview.getVisible(), mAssumptions.appVariantOverview.visible, "the 'appVariantOverview' button visibility is correct");
		if (mAssumptions.appVariantOverview.enabled !== undefined) {
			assert.equal(oAppVariantOverview.getEnabled(), mAssumptions.appVariantOverview.enabled, "the 'appVariantOverview' button enablement is correct");
		}
		assert.equal(oManageApps.getVisible(), mAssumptions.manageApps.visible, "the 'manageApps' button visibility is correct");
		if (mAssumptions.manageApps.enabled !== undefined) {
			assert.equal(oManageApps.getEnabled(), mAssumptions.manageApps.enabled, "the 'manageApps' button enablement is correct");
		}
	}

	QUnit.module("Setting AppVariant properties", {
		beforeEach: function () {
			this.oToolbar = new Adaptation({
				textResources: sap.ui.getCore().getLibraryResourceBundle("sap.ui.rta")
			});
		},
		afterEach: function() {
			this.oToolbar.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("Given a toolbar is created and app variants parameter are switched back and forth", function(assert) {
			/* variantsVisible:            false
			 * variantsEnabled:            false
			 * extendedManageAppVariants:  false  */
			testAppVariantButtons(assert, this.oToolbar, {
				saveAs : {
					visible : false
				},
				appVariantOverview : {
					visible : false
				},
				manageApps : {
					visible : false
				}
			});

			this.oToolbar.setAppVariantsVisible(true);
			/* variantsVisible:            true
			 * variantsEnabled:            false
			 * extendedManageAppVariants:  false  */
			testAppVariantButtons(assert, this.oToolbar, {
				saveAs : {
					visible : true,
					enabled : false
				},
				appVariantOverview : {
					visible : false
				},
				manageApps : {
					visible : true,
					enabled : false
				}
			});

			this.oToolbar.setAppVariantsEnabled(true);
			/* variantsVisible:            true
			 * variantsEnabled:            true
			 * extendedManageAppVariants:  false  */
			testAppVariantButtons(assert, this.oToolbar, {
				saveAs : {
					visible : true,
					enabled : true
				},
				appVariantOverview : {
					visible : false
				},
				manageApps : {
					visible : true,
					enabled : true
				}
			});

			this.oToolbar.setExtendedManageAppVariants(true);
			/* variantsVisible:            true
			 * variantsEnabled:            true
			 * extendedManageAppVariants:  true  */
			testAppVariantButtons(assert, this.oToolbar, {
				saveAs : {
					visible : true,
					enabled : true
				},
				appVariantOverview : {
					visible : true,
					enabled : true
				},
				manageApps : {
					visible : false
				}
			});
		});


		QUnit.test("Given a toolbar is created and app variants are not visible while other app variant properties are switched back and forth", function(assert) {
			// This situation will not happen within the current implementation of RuntimeAuthoring,
			// but a proper handling of the buttons should be ensured.

			this.oToolbar.setAppVariantsEnabled(true);
			this.oToolbar.setExtendedManageAppVariants(true);
			/* variantsVisible:            false
			 * variantsEnabled:            true
			 * extendedManageAppVariants:  true  */
			testAppVariantButtons(assert, this.oToolbar, {
				saveAs: {
					visible: false
				},
				appVariantOverview: {
					visible: false
				},
				manageApps: {
					visible: false
				}
			});

			this.oToolbar.setExtendedManageAppVariants(false);
			/* variantsVisible:            false
			 * variantsEnabled:            true
			 * extendedManageAppVariants:  false  */
			testAppVariantButtons(assert, this.oToolbar, {
				saveAs: {
					visible: false
				},
				appVariantOverview: {
					visible: false
				},
				manageApps: {
					visible: false
				}
			});

			this.oToolbar.setAppVariantsEnabled(false);
			/* variantsVisible:            false
			 * variantsEnabled:            false
			 * extendedManageAppVariants:  true  */
			this.oToolbar.setExtendedManageAppVariants(true);
			testAppVariantButtons(assert, this.oToolbar, {
				saveAs: {
					visible: false
				},
				appVariantOverview: {
					visible: false
				},
				manageApps: {
					visible: false
				}
			});
		});
	});

	// TODO: add test for the label formatter and other model bindings

	QUnit.done(function () {
		jQuery("#qunit-fixture").hide();
	});
});
