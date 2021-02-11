/*global QUnit*/

sap.ui.define([
	"sap/ui/rta/toolbar/Adaptation",
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

	QUnit.module("Different Screen Sizes", {
		beforeEach: function() {
			this.oVersionsModel = new JSONModel({
				versioningEnabled: false,
				versions: [],
				draftAvailable: false
			});
			this.oToolbarControlsModel = new JSONModel({
				undoEnabled: false,
				redoEnabled: false,
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
			this.oGetCurrentRangeStub = sandbox.stub(Device.media, "getCurrentRange");

			this.oToolbar = new Adaptation({
				textResources: sap.ui.getCore().getLibraryResourceBundle("sap.ui.rta")
			});

			return this.oToolbar._pFragmentLoaded;
		},
		afterEach: function() {
			this.oToolbar.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when the toolbar gets initially shown in desktop mode (>= 900px) and then rerendered in the other 2 modes", function(assert) {
			this.oToolbar.setModel(this.oVersionsModel, "versions");
			this.oToolbar.setModel(this.oToolbarControlsModel, "controls");
			this.oGetCurrentRangeStub.returns({name: Adaptation.modes.DESKTOP});
			this.oToolbar.animation = false;
			return this.oToolbar.show().then(function() {
				assert.equal(this.oToolbar.sMode, Adaptation.modes.DESKTOP, "the mode was correctly set");
				assert.notOk(this.oToolbar.getControl("exit").getIcon(), "the exit button has no icon");
				assert.ok(this.oToolbar.getControl("exit").getText(), "the exit button has text");
				assert.equal(this.oToolbar.getControl("restore").getLayoutData().getPriority(), "High", "the layout data priority is correct");
				assert.notOk(this.oToolbar.getControl("versionButton").getVisible(), "the version button is hidden");

				return this.oToolbar._onSizeChanged({name: Adaptation.modes.TABLET});
			}.bind(this))
			.then(function() {
				assert.equal(this.oToolbar.sMode, Adaptation.modes.TABLET, "the mode was correctly set");
				assert.notOk(this.oToolbar.getControl("versionButton").getVisible(), "the version button is hidden");

				return this.oToolbar._onSizeChanged({name: Adaptation.modes.MOBILE});
			}.bind(this))
			.then(function() {
				assert.equal(this.oToolbar.sMode, Adaptation.modes.MOBILE, "the mode was correctly set");
				assert.notOk(this.oToolbar.getControl("versionButton").getVisible(), "the version button is hidden");

				return this.oToolbar._onSizeChanged({name: Adaptation.modes.DESKTOP});
			}.bind(this))
			.then(function() {
				assert.notOk(this.oToolbar.getControl("versionButton").getVisible(), "the version button is hidden");
			}.bind(this));
		});

		QUnit.test("when a draft is visible and the toolbar gets initially shown in desktop mode (>= 1200px) and then rerendered in the other 2 modes and back", function(assert) {
			this.oToolbar.setModel(this.oVersionsModel, "versions");
			this.oToolbar.setModel(this.oToolbarControlsModel, "controls");
			this.oVersionsModel.setProperty("/versioningEnabled", true);
			this.oGetCurrentRangeStub.returns({name: Adaptation.modes.DESKTOP});
			this.oToolbar.animation = false;

			return this.oToolbar.show().then(function() {
				assert.ok(this.oToolbar.getControl("versionButton").getVisible(), "the version button is visible");
				return this.oToolbar._onSizeChanged({name: Adaptation.modes.TABLET});
			}.bind(this))
			.then(function() {
				assert.ok(this.oToolbar.getControl("versionButton").getVisible(), "the version button is visible");
				return this.oToolbar._onSizeChanged({name: Adaptation.modes.MOBILE});
			}.bind(this))
			.then(function() {
				assert.ok(this.oToolbar.getControl("versionButton").getVisible(), "the version button is visible");
				return this.oToolbar._onSizeChanged({name: Adaptation.modes.DESKTOP});
			}.bind(this))
			.then(function() {
				assert.ok(this.oToolbar.getControl("versionButton").getVisible(), "the version button is visible");
			}.bind(this));
		});

		QUnit.test("when the toolbar gets initially shown in tablet mode (between 900px and 1200px)", function(assert) {
			this.oToolbar.setModel(this.oVersionsModel, "versions");
			this.oToolbar.setModel(this.oToolbarControlsModel, "controls");
			this.oGetCurrentRangeStub.returns({name: Adaptation.modes.TABLET});
			this.oToolbar.animation = false;
			return this.oToolbar.show()
				.then(function() {
					assert.notOk(this.oToolbar.getControl("versionButton").getVisible(), "the version button is hidden");
					assert.equal(this.oToolbar.sMode, Adaptation.modes.TABLET, "the mode was correctly set");
					assert.notOk(this.oToolbar.getControl("exit").getIcon(), "the exit button has no icon");
					assert.ok(this.oToolbar.getControl("exit").getText(), "the exit button has text");
				}.bind(this));
		});

		QUnit.test("when the draft is set to visible and toolbar gets initially shown in tablet mode (between 900px and 1200px)", function(assert) {
			this.oToolbar.setModel(this.oVersionsModel, "versions");
			this.oToolbar.setModel(this.oToolbarControlsModel, "controls");
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
			this.oToolbar.setModel(this.oVersionsModel, "versions");
			this.oToolbar.setModel(this.oToolbarControlsModel, "controls");
			this.oGetCurrentRangeStub.returns({name: Adaptation.modes.MOBILE});
			this.oToolbar.animation = false;
			return this.oToolbar.show()
				.then(function() {
					assert.notOk(this.oToolbar.getControl("versionButton").getVisible(), "the version button is hidden");
					assert.equal(this.oToolbar.sMode, Adaptation.modes.MOBILE, "the mode was correctly set");
					assert.ok(this.oToolbar.getControl("exit").getIcon(), "the exit button has an icon");
					assert.notOk(this.oToolbar.getControl("exit").getText(), "the exit button has no text");
				}.bind(this));
		});

		QUnit.test("when the draft is set to visible and the toolbar gets initially shown in mobile mode (< 900px)", function(assert) {
			this.oToolbar.setModel(this.oVersionsModel, "versions");
			this.oToolbar.setModel(this.oToolbarControlsModel, "controls");
			this.oVersionsModel.setProperty("/versioningEnabled", true);
			this.oVersionsModel.setProperty("/draftAvailable", true);
			this.oGetCurrentRangeStub.returns({name: Adaptation.modes.MOBILE});
			this.oToolbar.animation = false;
			return this.oToolbar.show()
				.then(function() {
					assert.ok(this.oToolbar.getControl("versionButton").getVisible(), "the version button is visible");
					assert.equal(this.oToolbar.sMode, Adaptation.modes.MOBILE, "the mode was correctly set");
					assert.ok(this.oToolbar.getControl("exit").getIcon(), "the exit button has an icon");
					assert.notOk(this.oToolbar.getControl("exit").getText(), "the exit button has no text");
				}.bind(this));
		});
	});

	QUnit.module("Versions Model binding & formatter for the restore button", {
		before: function () {
			this.oToolbarControlsModel = new JSONModel({
				undoEnabled: false,
				redoEnabled: false,
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
			this.oTextResources = sap.ui.getCore().getLibraryResourceBundle("sap.ui.rta");
		},
		after: function() {
			this.oToolbar.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("Given switching versions is possible", function (assert) {
			this.oVersionsModel = new JSONModel({
				versioningEnabled: true
			});

			this.oToolbar = new Adaptation({
				textResources: this.oTextResources
			});

			return this.oToolbar._pFragmentLoaded
				.then(function() {
					this.oToolbar.setModel(this.oVersionsModel, "versions");
					this.oToolbar.setModel(this.oToolbarControlsModel, "controls");
					this.sDraftVersionAccent = "sapUiRtaDraftVersionAccent";
					this.sActiveVersionAccent = "sapUiRtaActiveVersionAccent";
					this.oVersionButton = this.oToolbar.getControl("versionButton");
				}.bind(this))
				.then(function () {
					assert.equal(this.oToolbar.getControl("restore").getVisible(), false, "then the restore button is hidden");
				}.bind(this));
		});

		QUnit.test("Given switching versions is not possible", function (assert) {
			this.oVersionsModel = new JSONModel({
				versioningEnabled: false
			});

			this.oToolbar = new Adaptation({
				textResources: this.oTextResources
			});

			return this.oToolbar._pFragmentLoaded
				.then(function() {
					this.oToolbar.setModel(this.oVersionsModel, "versions");
					this.oToolbar.setModel(this.oToolbarControlsModel, "controls");
					this.sDraftVersionAccent = "sapUiRtaDraftVersionAccent";
					this.sActiveVersionAccent = "sapUiRtaActiveVersionAccent";
					this.oVersionButton = this.oToolbar.getControl("versionButton");
				}.bind(this))
				.then(function () {
					assert.equal(this.oToolbar.getControl("restore").getVisible(), true, "then the restore button is shown");
				}.bind(this));
		});
	});

	QUnit.module("Discard Draft visibility", {
		before: function () {
			this.oVersionsModel = new JSONModel({
				versioningEnabled: true,
				versions: [],
				draftAvailable: false,
				displayedVersion: sap.ui.fl.Versions.Draft
			});
			this.oToolbarControlsModel = new JSONModel({
				undoEnabled: false,
				redoEnabled: false,
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
			this.oTextResources = sap.ui.getCore().getLibraryResourceBundle("sap.ui.rta");
			this.oToolbar = new Adaptation({
				textResources: this.oTextResources
			});

			return this.oToolbar._pFragmentLoaded.then(function() {
				this.oToolbar.setModel(this.oVersionsModel, "versions");
				this.oToolbar.setModel(this.oToolbarControlsModel, "controls");
				this.sDraftVersionAccent = "sapUiRtaDraftVersionAccent";
				this.sActiveVersionAccent = "sapUiRtaActiveVersionAccent";
				this.oVersionButton = this.oToolbar.getControl("versionButton");
				this.oDiscardDraftButton = this.oToolbar.getControl("discardDraft");
			}.bind(this));
		},
		after: function() {
			this.oToolbar.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("Given only a draft is present in the back end", function (assert) {
			var aVersions = [{
				version: 0,
				type: "draft"
			}];
			var sText = this.oToolbar.formatVersionButtonText(aVersions, sap.ui.fl.Versions.Draft);
			var sExpectedText = this.oTextResources.getText("TIT_DRAFT");
			assert.ok(this.oDiscardDraftButton.getVisible(), "the discard button is visible");
			assert.equal(sText, sExpectedText, "then the button text matches 'Draft'");
			assert.equal(this.oVersionButton.hasStyleClass(this.sDraftVersionAccent), true, "and the button color is not a draft accent");
			assert.equal(this.oVersionButton.hasStyleClass(this.sActiveVersionAccent), false, "and the button color is an active version accent");
		});

		QUnit.test("Given a draft version is the draft version in the list", function(assert) {
			var aVersions = [{
				version: sap.ui.fl.Versions.Draft,
				type: "draft"
			}, {
				version: 1,
				title: "Version Title",
				type: "active"
			}];
			var sText = this.oToolbar.formatVersionButtonText(aVersions, sap.ui.fl.Versions.Draft);

			var sExpectedText = this.oTextResources.getText("TIT_DRAFT");
			assert.equal(sText, sExpectedText, "then the button text matches 'Draft'");
			assert.ok(this.oDiscardDraftButton.getVisible(), "the discard button is visible");
			assert.equal(this.oVersionButton.hasStyleClass(this.sDraftVersionAccent), true, "and the button color is a draft accent");
			assert.equal(this.oVersionButton.hasStyleClass(this.sActiveVersionAccent), false, "and the button color is not an active version accent");
		});
	});

	QUnit.module("Versions Model binding & formatter for the versions text", {
		before: function () {
			this.oVersionsModel = new JSONModel({
				versioningEnabled: true,
				versions: [],
				draftAvailable: false,
				displayedVersion: sap.ui.fl.Versions.Original
			});
			this.oToolbarControlsModel = new JSONModel({
				undoEnabled: false,
				redoEnabled: false,
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
			this.oTextResources = sap.ui.getCore().getLibraryResourceBundle("sap.ui.rta");
			this.oToolbar = new Adaptation({
				textResources: this.oTextResources
			});

			return this.oToolbar._pFragmentLoaded.then(function() {
				this.oToolbar.setModel(this.oVersionsModel, "versions");
				this.oToolbar.setModel(this.oToolbarControlsModel, "controls");
				this.sDraftVersionAccent = "sapUiRtaDraftVersionAccent";
				this.sActiveVersionAccent = "sapUiRtaActiveVersionAccent";
				this.oVersionButton = this.oToolbar.getControl("versionButton");
				this.oDiscardDraftButton = this.oToolbar.getControl("discardDraft");
			}.bind(this));
		},
		after: function() {
			this.oToolbar.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("Given a version without any title is the first and active version in the list", function(assert) {
			var aVersions = [{
				version: 1,
				type: "active"
			}];
			var sText = this.oToolbar.formatVersionButtonText(aVersions, 1);
			var sExpectedText = this.oTextResources.getText("TIT_VERSION_1");
			assert.equal(sText, sExpectedText, "then the button text matches 'Version 1'");
			assert.equal(this.oVersionButton.hasStyleClass(this.sDraftVersionAccent), false, "and the button color is not a draft accent");
			assert.equal(this.oVersionButton.hasStyleClass(this.sActiveVersionAccent), true, "and the button color is not an active version accent");
		});

		QUnit.test("Given a version with a title is the first and active version in the list", function(assert) {
			var sTitle = "Version Title";
			var aVersions = [{
				version: 1,
				title: sTitle,
				type: "active"
			}];
			var sText = this.oToolbar.formatVersionButtonText(aVersions, 1);
			this.oVersionsModel.updateBindings();

			assert.equal(sText, sTitle, "then the button text matches the version title");
			assert.equal(this.oVersionButton.hasStyleClass(this.sDraftVersionAccent), false, "and the button color is not a draft accent");
			assert.equal(this.oVersionButton.hasStyleClass(this.sActiveVersionAccent), true, "and the button color is an active version accent");
		});

		QUnit.test("Given a draft version is the draft version in the list", function(assert) {
			var aVersions = [{
				version: sap.ui.fl.Versions.Draft,
				type: "draft"
			}, {
				version: 1,
				title: "Version Title",
				type: "active"
			}];
			var sText = this.oToolbar.formatVersionButtonText(aVersions, sap.ui.fl.Versions.Draft);

			var sExpectedText = this.oTextResources.getText("TIT_DRAFT");
			assert.equal(sText, sExpectedText, "then the button text matches 'Draft'");
			assert.notOk(this.oDiscardDraftButton.getVisible(), "the discard button is hidden");
			assert.equal(this.oVersionButton.hasStyleClass(this.sDraftVersionAccent), true, "and the button color is a draft accent");
			assert.equal(this.oVersionButton.hasStyleClass(this.sActiveVersionAccent), false, "and the button color is not an active version accent");
		});

		QUnit.test("Given a draft in the list", function(assert) {
			var aVersions = [{
				version: sap.ui.fl.Versions.Draft,
				type: "draft"
			}];
			var sText = this.oToolbar.formatVersionButtonText(aVersions, sap.ui.fl.Versions.Draft);

			var sExpectedText = this.oTextResources.getText("TIT_DRAFT");
			assert.equal(sText, sExpectedText, "then the button text matches 'Draft'");
			assert.equal(this.oVersionButton.hasStyleClass(this.sDraftVersionAccent), true, "and the button color is a draft accent");
			assert.equal(this.oVersionButton.hasStyleClass(this.sActiveVersionAccent), false, "and the button color is not an active version accent");
		});

		QUnit.test("Given two versions and a draft and the displayed version is the second one", function(assert) {
			var sVersionTitle2 = "Version Title 2";
			var aVersions = [{
				version: sap.ui.fl.Versions.Draft,
				type: "draft"
			}, {
				version: 2,
				title: sVersionTitle2,
				type: "active"
			}, {
				version: 1,
				title: "Version Title 1",
				type: "inactive"
			}];
			var sText = this.oToolbar.formatVersionButtonText(aVersions, 2);

			assert.equal(sText, sVersionTitle2, "then the button text matches 'Draft'");
			assert.notOk(this.oDiscardDraftButton.getVisible(), "the discard button is hidden");
			assert.equal(this.oVersionButton.hasStyleClass(this.sDraftVersionAccent), false, "and the button color is not a draft accent");
			assert.equal(this.oVersionButton.hasStyleClass(this.sActiveVersionAccent), true, "and the button color an active version accent");
		});

		QUnit.test("Given two versions and a draft and the displayed version is the first one", function(assert) {
			var sVersionTitle1 = "Version Title 1";
			var aVersions = [{
				version: sap.ui.fl.Versions.Draft,
				type: "draft"
			}, {
				version: 2,
				title: "Version Title 2",
				type: "active"
			}, {
				version: 1,
				title: sVersionTitle1,
				type: "inactive"
			}];
			var sText = this.oToolbar.formatVersionButtonText(aVersions, 1);

			assert.equal(sText, sVersionTitle1, "then the button text matches 'Draft'");
			assert.notOk(this.oDiscardDraftButton.getVisible(), "the discard button is hidden");
			assert.equal(this.oVersionButton.hasStyleClass(this.sDraftVersionAccent), false, "and the button color is not a draft accent");
			assert.equal(this.oVersionButton.hasStyleClass(this.sActiveVersionAccent), false, "and the button color is not an active version accent");
		});

		QUnit.test("Given no version is present", function(assert) {
			var sText = this.oToolbar.formatVersionButtonText([], sap.ui.fl.Versions.Original);
			this.oVersionsModel.updateBindings();
			var sExpectedText = this.oTextResources.getText("TIT_ORIGINAL_APP");
			assert.equal(sText, sExpectedText, "then the button text matches 'Original App'");
			assert.notOk(this.oDiscardDraftButton.getVisible(), "the discard button is hidden");
			assert.equal(this.oVersionButton.hasStyleClass(this.sDraftVersionAccent), false, "and the button color is not a draft accent");
			assert.equal(this.oVersionButton.hasStyleClass(this.sActiveVersionAccent), true, "and the button color is an active version accent");
		});
	});

	QUnit.module("Activate Version Dialog", {
		before: function () {
			this.oToolbar = new Adaptation({
				textResources: sap.ui.getCore().getLibraryResourceBundle("sap.ui.rta")
			});
			this.oToolbarControlsModel = new JSONModel({
				undoEnabled: false,
				redoEnabled: false,
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
		QUnit.test("Given no dialog is created, when the activate version button is pressed with a draft and afterwards pressed a second time", function(assert) {
			var oFragmentLoadSpy = sandbox.spy(Fragment, "load");
			var oSetInputSpy;
			var oConfirmButtonEnabledSpy;
			var sExpectedTitle = this.oToolbar.getTextResources().getText("TIT_VERSION_TITLE_DIALOG");
			return this.oToolbar._openVersionTitleDialog(sap.ui.fl.Versions.Draft)
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
					assert.equal(oDialog.getTitle(), sExpectedTitle, "and the title is 'Activate New Version'");
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

		QUnit.test("Given display version is original, when the activate version button is pressed", function(assert) {
			var sExpectedTitle = this.oToolbar.getTextResources().getText("TIT_REACTIVATE_VERSION_TITLE_DIALOG");
			return this.oToolbar._openVersionTitleDialog(sap.ui.fl.Versions.Original)
				.then(function () {
					assert.equal(this.oToolbar._oDialog.getTitle(), sExpectedTitle, "the title is 'Reactivate Version'");
				}.bind(this));
		});
	});

	QUnit.module("Versions Button", {
		before: function () {
			this.oToolbar = new Adaptation({
				textResources: sap.ui.getCore().getLibraryResourceBundle("sap.ui.rta")
			});
			this.oToolbarControlsModel = new JSONModel({
				undoEnabled: false,
				redoEnabled: false,
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

	function createControlWithStubbedBindingContextFireSwitchAndAssert(assert, oToolbar, nVersion) {
		var done = assert.async();

		oToolbar.attachSwitchVersion(function (oEvent) {
			if (nVersion !== undefined) {
				assert.equal(oEvent.getParameter("version"), nVersion, "the event was fired with the bound version number");
			} else {
				assert.equal(oEvent.getParameter("version"), sap.ui.fl.Versions.Original, "the event was fired with the original app number");
			}
			done();
		});

		var oEvent = {
			getSource: function () {
				return {
					getBindingContext: function () {
						if (!Number.isInteger(nVersion)) {
							return;
						}

						return {
							getProperty: function () {
								return nVersion;
							}
						};
					}
				};
			}
		};

		oToolbar.versionSelected(oEvent);
	}

	QUnit.module("Version selection", {
		beforeEach: function () {
			this.oToolbar = new Adaptation({
				textResources: sap.ui.getCore().getLibraryResourceBundle("sap.ui.rta")
			});
			this.oToolbarControlsModel = new JSONModel({
				undoEnabled: false,
				redoEnabled: false,
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
		afterEach: function() {
			this.oToolbar.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("Given a version entry of the original version was selected", function(assert) {
			createControlWithStubbedBindingContextFireSwitchAndAssert(assert, this.oToolbar);
		});

		QUnit.test("Given a version entry of the draft was selected", function(assert) {
			createControlWithStubbedBindingContextFireSwitchAndAssert(assert, this.oToolbar, sap.ui.fl.Versions.Draft);
		});

		QUnit.test("Given a version entry of an created version was selected", function(assert) {
			createControlWithStubbedBindingContextFireSwitchAndAssert(assert, this.oToolbar, 5);
		});
	});

	QUnit.module("Formatters", {
		beforeEach: function () {
			this.oMessageBundle = sap.ui.getCore().getLibraryResourceBundle("sap.ui.rta");
			this.oToolbarControlsModel = new JSONModel({
				undoEnabled: false,
				redoEnabled: false,
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
			this.oToolbar = new Adaptation({
				textResources: this.oMessageBundle
			});
			this.oToolbar.setModel(this.oToolbarControlsModel, "controls");

			return this.oToolbar._pFragmentLoaded;
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

		QUnit.test("Given the timestamp of a version should be formatted", function (assert) {
			// the format function is mocked, because the formatter is dependent on the locale of the test executioner
			var sFormattedTimeStamp = "Sep 20, 2020, 12:43 PM";
			sandbox.stub(DateFormatter, "getInstance").returns({
				format: sandbox.stub().returns(sFormattedTimeStamp)
			});
			var sTimeStamp = this.oToolbar.formatVersionTimeStamp(new Date("2020-09-20 12:43:15.17"));

			assert.equal(sTimeStamp, sFormattedTimeStamp, "then timestamp was formatted");
		});

		QUnit.test("Given no timestamp is given (i.e. 'Draft' or 'Original App'", function (assert) {
			// the format function is mocked, because the formatter is dependent on the locale of the test executioner
			var oFormatStub = sandbox.stub();
			sandbox.stub(DateFormatter, "getInstance").returns({
				format: oFormatStub
			});
			this.oToolbar.formatVersionTimeStamp();

			assert.equal(oFormatStub.callCount, 0, "then format was not called");
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
				{type: "active"}
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
				{type: "active"}
			];
			var sHighlightText = this.oToolbar.formatOriginalAppHighlightText(aVersions);
			assert.equal(sHighlightText, this.oMessageBundle.getText("LBL_INACTIVE"), "then the highlight is returned correct");
		});
	});

	QUnit.module("Setting AppVariant properties", {
		beforeEach: function () {
			this.oToolbar = new Adaptation({
				textResources: sap.ui.getCore().getLibraryResourceBundle("sap.ui.rta")
			});
			this.oControlsModel = new JSONModel({
				undoEnabled: false,
				redoEnabled: false,
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
			this.oToolbar.setModel(this.oControlsModel, "controls");
			return this.oToolbar._pFragmentLoaded;
		},
		afterEach: function() {
			this.oToolbar.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("Given a toolbar is created and app variants parameter in the model are switched back and forth", function(assert) {
			this.oControlsModel.setProperty("/saveAsVisible", false);
			this.oControlsModel.setProperty("/appVariantsOverviewVisible", false);
			this.oControlsModel.setProperty("/manageAppsVisible", false);
			this.oToolbar.animation = false;
			return this.oToolbar.show()
				.then(function() {
					assert.notOk(this.oToolbar.getControl("saveAs").getVisible(), "saveAs is not visible");
					assert.notOk(this.oToolbar.getControl("appVariantOverview").getVisible(), "appVariantOverview is not visible");
					assert.notOk(this.oToolbar.getControl("manageApps").getVisible(), "manageApps is not visible");
					this.oControlsModel.setProperty("/saveAsVisible", true);
					this.oControlsModel.setProperty("/saveAsEnabled", false);
					this.oControlsModel.setProperty("/appVariantsOverviewVisible", false);
					this.oControlsModel.setProperty("/manageAppsVisible", true);
					this.oControlsModel.setProperty("/manageAppsEnabled", false);
					assert.ok(this.oToolbar.getControl("saveAs").getVisible(), "saveAs is visible");
					assert.notOk(this.oToolbar.getControl("saveAs").getEnabled(), "saveAs is not enabled");
					assert.notOk(this.oToolbar.getControl("appVariantOverview").getVisible(), "AppVariantOverview is not visible");
					assert.ok(this.oToolbar.getControl("manageApps").getVisible(), "manageApps is visible");
					assert.notOk(this.oToolbar.getControl("manageApps").getEnabled(), "manageApps is not enabled");
					this.oControlsModel.setProperty("/saveAsVisible", true);
					this.oControlsModel.setProperty("/saveAsEnabled", true);
					this.oControlsModel.setProperty("/appVariantsOverviewVisible", false);
					this.oControlsModel.setProperty("/manageAppsVisible", true);
					this.oControlsModel.setProperty("/manageAppsEnabled", true);
					assert.ok(this.oToolbar.getControl("saveAs").getVisible(), "saveAs is visible");
					assert.ok(this.oToolbar.getControl("saveAs").getEnabled(), "saveAs is enabled");
					assert.notOk(this.oToolbar.getControl("appVariantOverview").getVisible(), "AppVariantOverview is not visible");
					assert.ok(this.oToolbar.getControl("manageApps").getVisible(), "manageApps is visible");
					assert.ok(this.oToolbar.getControl("manageApps").getEnabled(), "manageApps is enabled");
					this.oControlsModel.setProperty("/saveAsVisible", true);
					this.oControlsModel.setProperty("/saveAsEnabled", true);
					this.oControlsModel.setProperty("/appVariantsOverviewVisible", true);
					this.oControlsModel.setProperty("/appVariantsOverviewEnabled", true);
					this.oControlsModel.setProperty("/manageAppsVisible", false);
					this.oControlsModel.setProperty("/manageAppsEnabled", false);
					assert.ok(this.oToolbar.getControl("saveAs").getVisible(), "saveAs is visible");
					assert.ok(this.oToolbar.getControl("saveAs").getEnabled(), "saveAs is enabled");
					assert.ok(this.oToolbar.getControl("appVariantOverview").getVisible(), "AppVariantOverview is visible");
					assert.ok(this.oToolbar.getControl("appVariantOverview").getVisible(), "AppVariantOverview is enabled");
					assert.notOk(this.oToolbar.getControl("manageApps").getVisible(), "manageApps is not visible");
					assert.notOk(this.oToolbar.getControl("manageApps").getEnabled(), "manageApps is not enabled");
				}.bind(this));
		});
	});

	QUnit.done(function () {
		jQuery("#qunit-fixture").hide();
	});
});
