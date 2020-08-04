/*global QUnit*/

sap.ui.define([
	"sap/ui/rta/toolbar/Adaptation",
	"sap/ui/Device",
	"sap/ui/core/Fragment",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/MessageType",
	"sap/ui/core/Core",
	"sap/ui/thirdparty/sinon-4"
],
function(
	Adaptation,
	Device,
	Fragment,
	JSONModel,
	MessageType,
	Core,
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
				assert.notOk(this.oToolbar.getControl("versionButton").getVisible(), "the version button is hidden");

				this.oToolbar._onSizeChanged({name: Adaptation.modes.TABLET});
				assert.equal(this.oToolbar.sMode, Adaptation.modes.TABLET, "the mode was correctly set");
				assert.notOk(this.oToolbar.getControl("versionButton").getVisible(), "the version button is hidden");

				this.oToolbar._onSizeChanged({name: Adaptation.modes.MOBILE});
				assert.equal(this.oToolbar.sMode, Adaptation.modes.MOBILE, "the mode was correctly set");
				assert.notOk(this.oToolbar.getControl("versionButton").getVisible(), "the version button is hidden");

				this.oToolbar._onSizeChanged({name: Adaptation.modes.DESKTOP});
				assert.notOk(this.oToolbar.getControl("versionButton").getVisible(), "the version button is hidden");
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
					assert.ok(this.oToolbar.getControl("versionButton").getVisible(), "the version button is visible");

					this.oToolbar._onSizeChanged({name: Adaptation.modes.TABLET});
					assert.ok(this.oToolbar.getControl("versionButton").getVisible(), "the version button is visible");

					this.oToolbar._onSizeChanged({name: Adaptation.modes.MOBILE});
					assert.ok(this.oToolbar.getControl("versionButton").getVisible(), "the version button is visible");

					this.oToolbar._onSizeChanged({name: Adaptation.modes.DESKTOP});
					assert.ok(this.oToolbar.getControl("versionButton").getVisible(), "the version button is visible");
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
					assert.notOk(this.oToolbar.getControl("versionButton").getVisible(), "the version button is hidden");
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
					assert.ok(this.oToolbar.getControl("versionButton").getVisible(), "the version button is shown");
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
					assert.notOk(this.oToolbar.getControl("versionButton").getVisible(), "the version button is hidden");
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
					assert.ok(this.oToolbar.getControl("versionButton").getVisible(), "the version button is visible");
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
			this.sDraftVersionAccent = "sapUiRtaDraftVersionAccent";
			this.sActiveVersionAccent = "sapUiRtaActiveVersionAccent";
			this.oVersionButton = this.oToolbar.getControl("versionButton");
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
			var sText = this.oToolbar.formatVersionButtonText(false, aVersions);
			var sExpectedText = this.oTextResources.getText("TIT_VERSION_1");
			assert.equal(sText, sExpectedText, "then the button text matches 'Version 1'");
			assert.equal(this.oVersionButton.hasStyleClass(this.sDraftVersionAccent), false, "and the button color is not a draft accent");
			assert.equal(this.oVersionButton.hasStyleClass(this.sActiveVersionAccent), true, "and the button color is not a active version accent");
		});

		QUnit.test("Given a version with a title is the first version in the list", function(assert) {
			var sTitle = "Version Title";
			var aVersions = [{
				versionNumber: 1,
				title: sTitle
			}];
			var sText = this.oToolbar.formatVersionButtonText(false, aVersions);
			this.oVersionsModel.updateBindings();

			assert.equal(sText, sTitle, "then the button text matches the version title");
			assert.equal(this.oVersionButton.hasStyleClass(this.sDraftVersionAccent), false, "and the button color is not a draft accent");
			assert.equal(this.oVersionButton.hasStyleClass(this.sActiveVersionAccent), true, "and the button color is not a active version accent");
		});

		QUnit.test("Given a draft version is the first version in the list", function(assert) {
			var aVersions = [{
				versionNumber: 0,
				type: "draft"
			}, {
				versionNumber: 1,
				title: "Version Title"
			}];
			var sText = this.oToolbar.formatVersionButtonText(true, aVersions);

			var sExpectedText = this.oTextResources.getText("TIT_DRAFT");
			assert.equal(sText, sExpectedText, "then the button text matches 'Draft'");
			assert.equal(this.oVersionButton.hasStyleClass(this.sDraftVersionAccent), true, "and the button color is a draft accent");
			assert.equal(this.oVersionButton.hasStyleClass(this.sActiveVersionAccent), false, "and the button color is not a active version accent");
		});

		QUnit.test("Given no version is present", function(assert) {
			var sText = this.oToolbar.formatVersionButtonText(false, []);
			this.oVersionsModel.updateBindings();
			var sExpectedText = this.oTextResources.getText("TIT_ORIGINAL_APP");
			assert.equal(sText, sExpectedText, "then the button text matches 'Original App'");
			assert.equal(this.oVersionButton.hasStyleClass(this.sDraftVersionAccent), false, "and the button color is not a draft accent");
			assert.equal(this.oVersionButton.hasStyleClass(this.sActiveVersionAccent), true, "and the button color is not a active version accent");
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

	QUnit.module("Versions Button", {
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
		QUnit.test("Given no dialog is created, when the version button is pressed and afterwards pressed a second time", function(assert) {
			var done = assert.async();
			var oFragmentLoadSpy = sandbox.spy(Fragment, "load");
			var oVersionButton = this.oToolbar.getControl("versionButton");

			// force a rendering of the button for the Popover.openBy function
			oVersionButton.placeAt("qunit-fixture");
			Core.applyChanges();

			var oAddDependentSpy = sandbox.spy(oVersionButton, "addDependent");
			var oVersionsDialog;
			var oEvent = {
				getSource: function () {
					return oVersionButton;
				}
			};
			return this.oToolbar.showVersionHistory(oEvent)
				.then(function () {
					assert.equal(oFragmentLoadSpy.callCount, 1, "the fragment was loaded");
					// checking for the dialog instance wrapped into a promise
					return oFragmentLoadSpy.getCall(0).returnValue;
				})
				.then(this.oToolbar.oVersionDialogPromise)
				.then(function (oVersionDialogResolveValue) {
					oVersionsDialog = oVersionDialogResolveValue;
					assert.ok(oVersionsDialog, "and the dialog promise was assigned");
					assert.equal(oVersionsDialog.isOpen(), true, "and the dialog was opened");
					assert.equal(oAddDependentSpy.callCount, 1, "and the dialog is set as a dependent for the button");
					oVersionsDialog.attachAfterClose(function () {
						assert.equal(oFragmentLoadSpy.callCount, 1, "the fragment is not loaded again");
						done();
					});
				})
				.then(this.oToolbar.showVersionHistory.bind(this.oToolbar, oEvent));
		});
	});

	QUnit.module("Formatters", {
		beforeEach: function () {
			this.oMessageBundle = sap.ui.getCore().getLibraryResourceBundle("sap.ui.rta");
			this.oToolbar = new Adaptation({
				textResources: this.oMessageBundle
			});
		},
		afterEach: function() {
			this.oToolbar.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("Given no version is provided and the version table visibility should be determined", function (assert) {
			var aVersions = [];
			var bVisible = this.oToolbar.formatVersionTableVisibility(aVersions);
			assert.equal(bVisible, false, "then the visibility is false");
		});

		QUnit.test("Given a version is provided and the version table visibility should be determined", function (assert) {
			var aVersions = [{}];
			var bVisible = this.oToolbar.formatVersionTableVisibility(aVersions);
			assert.equal(bVisible, false, "then the visibility is false");
		});

		QUnit.test("Given the draft title should be formatted", function (assert) {
			var sTitle = this.oToolbar.formatVersionTitle(undefined, "draft");
			assert.equal(sTitle, this.oMessageBundle.getText("TIT_DRAFT"), "then title is 'Draft'");
		});

		QUnit.test("Given the 'Version 1' title should be formatted", function (assert) {
			var sTitle = this.oToolbar.formatVersionTitle("", "active");
			assert.equal(sTitle, this.oMessageBundle.getText("TIT_VERSION_1"), "then title is 'Version one'");
		});

		QUnit.test("Given the a version with a title should be formatted", function (assert) {
			var sVersionTitle = "title";
			var sTitle = this.oToolbar.formatVersionTitle(sVersionTitle, "active");
			assert.equal(sTitle, sVersionTitle, "then title is the passed title");
		});

		QUnit.test("Given the a version highlight of the draft should be formatted", function (assert) {
			var sHighlight = this.oToolbar.formatHighlight("draft");
			assert.equal(sHighlight, MessageType.Warning, "then the highlight is returned correct");
		});

		QUnit.test("Given the a version highlight of an active version should be formatted", function (assert) {
			var sHighlight = this.oToolbar.formatHighlight("active");
			assert.equal(sHighlight, MessageType.Success, "then the highlight is returned correct");
		});

		QUnit.test("Given the a version highlight of an inactive version should be formatted", function (assert) {
			var sHighlight = this.oToolbar.formatHighlight("inactive");
			assert.equal(sHighlight, MessageType.None, "then the highlight is returned correct");
		});

		QUnit.test("Given the a version highlight text of the draft should be formatted", function (assert) {
			var sHighlightText = this.oToolbar.formatHighlightText("draft");
			assert.equal(sHighlightText, this.oMessageBundle.getText("TIT_DRAFT"), "then the highlight is returned correct");
		});

		QUnit.test("Given the a version highlight text of an active version should be formatted", function (assert) {
			var sHighlightText = this.oToolbar.formatHighlightText("active");
			assert.equal(sHighlightText, this.oMessageBundle.getText("LBL_ACTIVE"), "then the highlight is returned correct");
		});

		QUnit.test("Given the a version highlight text of an inactive version should be formatted", function (assert) {
			var sHighlightText = this.oToolbar.formatHighlightText("inactive");
			assert.equal(sHighlightText, this.oMessageBundle.getText("LBL_INACTIVE"), "then the highlight is returned correct");
		});

		QUnit.test("Given the a version highlight of the 'original app' should be formatted while no other version exists", function (assert) {
			var aVersions = [];
			var sHighlight = this.oToolbar.formatOriginalAppHighlight(aVersions);
			assert.equal(sHighlight, MessageType.Success, "then the highlight is returned correct");
		});

		QUnit.test("Given the a version highlight of the 'original app' should be formatted while only a draft version exists", function (assert) {
			var aVersions = [{type: "draft"}];
			var sHighlight = this.oToolbar.formatOriginalAppHighlight(aVersions);
			assert.equal(sHighlight, MessageType.Success, "then the highlight is returned correct");
		});

		QUnit.test("Given the a version highlight of the 'original app' should be formatted while an active and a draft version exists", function (assert) {
			var aVersions = [
				{type: "draft"},
				{type:"active"}
			];
			var sHighlight = this.oToolbar.formatOriginalAppHighlight(aVersions);
			assert.equal(sHighlight, MessageType.None, "then the highlight is returned correct");
		});

		QUnit.test("Given the a version highlight text of the 'original app' should be formatted and no version exist", function (assert) {
			var aVersions = [];
			var sHighlightText = this.oToolbar.formatOriginalAppHighlightText(aVersions);
			assert.equal(sHighlightText, this.oMessageBundle.getText("LBL_ACTIVE"), "then the highlight is returned correct");
		});

		QUnit.test("Given the a version highlight text of the 'original app' should be formatted and a draft version exists", function (assert) {
			var aVersions = [{type: "draft"}];
			var sHighlightText = this.oToolbar.formatOriginalAppHighlightText(aVersions);
			assert.equal(sHighlightText, this.oMessageBundle.getText("LBL_ACTIVE"), "then the highlight is returned correct");
		});

		QUnit.test("Given the a version highlight text of the 'original app' should be formatted and a active and a draft version exists", function (assert) {
			var aVersions = [
				{type: "draft"},
				{type:"active"}
			];
			var sHighlightText = this.oToolbar.formatOriginalAppHighlightText(aVersions);
			assert.equal(sHighlightText, this.oMessageBundle.getText("LBL_INACTIVE"), "then the highlight is returned correct");
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

	QUnit.done(function () {
		jQuery("#qunit-fixture").hide();
	});
});
