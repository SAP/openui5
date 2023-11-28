/* global QUnit */

sap.ui.define([
	"../../RtaQunitUtils",
	"sap/m/Popover",
	"sap/ui/core/Control",
	"sap/ui/core/Fragment",
	"sap/ui/core/Lib",
	"sap/ui/core/library",
	"sap/ui/fl/initial/api/Version",
	"sap/ui/fl/Layer",
	"sap/ui/model/json/JSONModel",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/ui/rta/toolbar/Adaptation",
	"sap/ui/rta/Utils",
	"sap/ui/thirdparty/sinon-4"
], function(
	RtaQunitUtils,
	Popover,
	Control,
	Fragment,
	Lib,
	coreLibrary,
	Version,
	Layer,
	JSONModel,
	nextUIUpdate,
	Adaptation,
	Utils,
	sinon
) {
	"use strict";

	var sandbox = sinon.createSandbox();
	var {MessageType} = coreLibrary;
	var DRAFT_ACCENT_COLOR = "sapUiRtaDraftVersionAccent";
	var ACTIVE_ACCENT_COLOR = "sapUiRtaActiveVersionAccent";
	var VERSION_TITLE = "Title_with_special_chars &<>\"'";
	var VERSION_TITLE_ENCODED = "Title_with_special_chars&#x20;&amp;&lt;&gt;&quot;&#x27;";

	async function initializeToolbar() {
		var aVersions = [{
			version: Version.Number.Draft,
			type: Version.Type.Draft,
			isPublished: false
		}, {
			version: "1",
			title: VERSION_TITLE,
			type: Version.Type.Active,
			isPublished: true,
			importedAt: "2022-05-09 15:00:00.000"
		}, {
			version: "2",
			type: Version.Type.Inactive,
			isPublished: false,
			activatedAt: "2022-05-10 16:00:00.000Z"
		}];
		var oVersionsModel = new JSONModel({
			versioningEnabled: true,
			versions: aVersions,
			draftAvailable: true,
			displayedVersion: Version.Number.Draft,
			publishVersionVisible: false
		});
		var oToolbarControlsModel = RtaQunitUtils.createToolbarControlsModel();

		var oToolbar = new Adaptation({
			textResources: Lib.getResourceBundleFor("sap.ui.rta"),
			rtaInformation: {
				flexSettings: {
					layer: Layer.CUSTOMER
				},
				rootControl: new Control()
			}
		});
		oToolbar.setModel(oVersionsModel, "versions");
		oToolbar.setModel(oToolbarControlsModel, "controls");

		oToolbar.animation = false;
		oToolbar.placeAt("qunit-fixture");
		await nextUIUpdate();
		return oToolbar;
	}

	QUnit.module("VersionHistory", {
		async beforeEach() {
			this.oToolbar = await initializeToolbar();
			this.oEvent = {
				getSource: function() {
					return this.oToolbar.getControl("versionButton");
				}.bind(this)
			};
			await this.oToolbar.onFragmentLoaded();
			return this.oToolbar.show();
		},
		afterEach() {
			this.oToolbar.destroy();
			sandbox.restore();
		}
	}, function() {
		[0, 1, 2].forEach(function(iVersionIndex) {
			var sName = "when the VersionHistory is opened and a version is selected: ";
			sName += iVersionIndex ? "Draft" : `active Version${iVersionIndex}`;
			QUnit.test(sName, function(assert) {
				var done = assert.async();

				// eslint-disable-next-line max-nested-callbacks
				this.oToolbar.attachEventOnce("switchVersion", function(oEvent) {
					assert.strictEqual(oEvent.getParameter("version"), `${iVersionIndex || Version.Number.Draft}`, "the event was fired with the correct parameter");
					done();
				});
				this.oToolbar.showVersionHistory(this.oEvent).then(function() {
					var oVersionList = this.oToolbar.getControl("versionHistoryDialog--versionList");
					assert.strictEqual(oVersionList.getVisible(), true, "the list is visible");

					oVersionList.getItems()[iVersionIndex].firePress();
				}.bind(this));
			});
		});

		QUnit.test("clicking the button 3 times", function(assert) {
			var done = assert.async();
			var oFragmentLoadSpy = sandbox.spy(Fragment, "load");
			var oPopoverOpenSpy = sandbox.spy(Popover.prototype, "openBy");
			var oPopoverCloseSpy = sandbox.spy(Popover.prototype, "close");
			this.oToolbar.showVersionHistory(this.oEvent).then(function() {
				assert.strictEqual(oPopoverOpenSpy.callCount, 1, "the Popover is open");
				var oPopover = this.oToolbar.getControl("versionHistoryDialog--popover");

				oPopover.attachEventOnce("afterClose", function() {
					assert.strictEqual(oPopoverOpenSpy.callCount, 1, "the Popover is closed");
					assert.strictEqual(oPopoverCloseSpy.callCount, 1, "the Popover is closed");

					oPopover.attachEventOnce("afterOpen", function() {
						assert.strictEqual(oPopoverOpenSpy.callCount, 2, "the Popover is opened");
						assert.strictEqual(oPopoverCloseSpy.callCount, 1, "the Popover is opened");
						assert.strictEqual(oFragmentLoadSpy.callCount, 1, "the fragment was only loaded once");
						done();
					});
					this.oToolbar.showVersionHistory(this.oEvent);
				}.bind(this));

				this.oToolbar.showVersionHistory(this.oEvent);
			}.bind(this));
		});

		QUnit.test("Formatting", function(assert) {
			return this.oToolbar.showVersionHistory(this.oEvent).then(function() {
				var oTextResources = this.oToolbar.getTextResources();
				var oVersionList = this.oToolbar.getControl("versionHistoryDialog--versionList");
				var oOriginalAppList = this.oToolbar.getControl("versionHistoryDialog--originalVersionList");

				assert.strictEqual(oVersionList.getItems()[0].getText(), oTextResources.getText("TIT_DRAFT"), "the draft text is shown");
				assert.strictEqual(oVersionList.getItems()[1].getText(), VERSION_TITLE_ENCODED, "the version name is shown");
				assert.strictEqual(oVersionList.getItems()[2].getText(), oTextResources.getText("TIT_VERSION_1"), "the fallback version name is shown");
				assert.strictEqual(oVersionList.getItems()[0].getHighlight(), MessageType.Warning, "the correct highlighting is shown");
				assert.strictEqual(oVersionList.getItems()[1].getHighlight(), MessageType.Success, "the correct highlighting is shown");
				assert.strictEqual(oVersionList.getItems()[2].getHighlight(), MessageType.None, "the correct highlighting is shown");
				assert.strictEqual(oVersionList.getItems()[0].getHighlightText(), oTextResources.getText("TIT_DRAFT"), "the draft highlight text is shown");
				assert.strictEqual(oVersionList.getItems()[1].getHighlightText(), oTextResources.getText("LBL_ACTIVE"), "the active version highlight text is shown");
				assert.strictEqual(oVersionList.getItems()[2].getHighlightText(), oTextResources.getText("LBL_INACTIVE"), "the inactive version highlight text is shown");
				var oDate1 = new Date(oVersionList.getItems()[1].getTimestamp());
				var oDate2 = new Date(oVersionList.getItems()[2].getTimestamp());
				assert.equal(oDate1.getUTCHours(), "15", "the timestamp is the same UTC hours");
				assert.notEqual(oDate1.getHours(), oDate1.getUTCHours(), "the display timestamp is different than the UTC");
				assert.equal(oDate2.getUTCHours(), "16", "the timestamp is the same UTC hours");
				assert.notEqual(oDate2.getHours(), oDate2.getUTCHours(), "the display timestamp is different than the UTC");

				assert.strictEqual(oOriginalAppList.getItems()[0].getHighlight(), MessageType.None, "the correct highlighting is shown");
				assert.strictEqual(oOriginalAppList.getItems()[0].getHighlightText(), oTextResources.getText("LBL_INACTIVE"), "the inactive version highlight text is shown");

				this.oToolbar.getModel("versions").setProperty("/displayedVersion", Version.Number.Original);
				this.oToolbar.getModel("versions").setProperty("/versions", []);
				assert.strictEqual(oOriginalAppList.getItems()[0].getHighlight(), MessageType.Success, "the correct highlighting is shown");
				assert.strictEqual(oOriginalAppList.getItems()[0].getHighlightText(), oTextResources.getText("LBL_ACTIVE"), "the active version highlight text is shown");
				assert.strictEqual(oVersionList.getVisible(), false, "the version list is not visible anymore");
			}.bind(this));
		});

		QUnit.test("with publish available", function(assert) {
			this.oToolbar.getModel("versions").setProperty("/publishVersionVisible", true);
			return this.oToolbar.showVersionHistory(this.oEvent).then(function() {
				var oList = this.oToolbar.getControl("versionHistoryDialog--versionList");
				assert.ok(oList.getBindingInfo("items").groupHeaderFactory, "a grouping is in place");
				assert.strictEqual(oList.getBinding("items").aSorters.length, 1, "a sorter is in place");
				assert.strictEqual(oList.getItems().length, 5, "there are 5 entries (two group titles, 3 versions)");
			}.bind(this));
		});
	});

	QUnit.module("ActivateVersionDialog", {
		async beforeEach() {
			this.oToolbar = await initializeToolbar();
			await this.oToolbar.onFragmentLoaded();
			return this.oToolbar.show();
		},
		afterEach() {
			this.oToolbar.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when the activate version button is pressed with a draft and afterwards pressed a second time", function(assert) {
			sandbox.stub(Utils, "getRtaStyleClassName").returns("myRtaCustomStyle");
			var oFragmentLoadSpy = sandbox.spy(Fragment, "load");
			var oSetInputSpy;
			var oConfirmButtonEnabledSpy;
			var sExpectedTitle = this.oToolbar.getTextResources().getText("TIT_VERSION_TITLE_DIALOG");
			return this.oToolbar._openVersionTitleDialog(Version.Number.Draft).then(function() {
				var oDialog = this.oToolbar.getControl("activateVersionDialog--dialog");
				assert.equal(oFragmentLoadSpy.callCount, 1, "the fragment was loaded");
				assert.strictEqual(oDialog.hasStyleClass("myRtaCustomStyle"), true, "the rta style class is set");
				// checking for the dialog instance wrapped into a promise

				var oVersionTitleInput = this.oToolbar.getControl("activateVersionDialog--versionTitleInput");
				oSetInputSpy = sandbox.spy(oVersionTitleInput, "setValue");
				var oConfirmButton = this.oToolbar.getControl("activateVersionDialog--confirmVersionTitleButton");
				oConfirmButtonEnabledSpy = sandbox.spy(oConfirmButton, "setEnabled");
				assert.equal(oDialog.getTitle(), sExpectedTitle, "and the title is 'Activate New Version'");
			}.bind(this))
			.then(this.oToolbar._openVersionTitleDialog.bind(this.oToolbar))
			.then(function() {
				assert.equal(oFragmentLoadSpy.callCount, 1, "the fragment not loaded again");
				assert.equal(oSetInputSpy.callCount, 1, "and Input Value was set");
				assert.equal(oSetInputSpy.getCall(0).args[0], "", "to an empty string");
				assert.equal(oConfirmButtonEnabledSpy.callCount, 1, "and the confirm button was set");
				assert.equal(oSetInputSpy.getCall(0).args[0], false, "to be disabled");
			});
		});

		QUnit.test("when the activate dialog is confirmed for a Draft", function(assert) {
			var done = assert.async();
			this.oToolbar._openVersionTitleDialog(Version.Number.Draft).then(function() {
				var oDialog = this.oToolbar.getControl("activateVersionDialog--dialog");
				var oCloseSpy = sandbox.spy(oDialog, "close");
				var oConfirmButton = this.oToolbar.getControl("activateVersionDialog--confirmVersionTitleButton");
				var oVersionTitleInput = this.oToolbar.getControl("activateVersionDialog--versionTitleInput");
				var oFireActivateSpy = sandbox.spy(this.oToolbar, "fireEvent");

				// no version title is set
				assert.strictEqual(oConfirmButton.getEnabled(), false, "initially the confirm button is disabled");
				oConfirmButton.firePress();
				assert.strictEqual(oCloseSpy.callCount, 0, "the dialog is not closed");
				assert.strictEqual(oFireActivateSpy.callCount, 0, "no events were fired");

				// set version title
				oVersionTitleInput.setValue("myVersionName");
				oVersionTitleInput.fireLiveChange({value: "myVersionName"});
				assert.strictEqual(oConfirmButton.getEnabled(), true, "the confirm button is enabled");

				this.oToolbar.attachEventOnce("activate", function(oEvent) {
					assert.strictEqual(oEvent.getParameter("versionTitle"), "myVersionName", "the version title is part of the event");
					done();
				});
				oConfirmButton.firePress();
				assert.strictEqual(oCloseSpy.callCount, 1, "the dialog is closed");
				assert.strictEqual(oFireActivateSpy.callCount, 1, "the events were fired");
			}.bind(this));
		});

		QUnit.test("when the activate dialog is opened for an inactive version and cancel is pressed", function(assert) {
			return this.oToolbar._openVersionTitleDialog("2").then(function() {
				var oDialog = this.oToolbar.getControl("activateVersionDialog--dialog");
				var oCloseSpy = sandbox.spy(oDialog, "close");
				assert.strictEqual(
					oDialog.getTitle(),
					this.oToolbar.getTextResources().getText("TIT_REACTIVATE_VERSION_TITLE_DIALOG"),
					"the title is correct"
				);
				var oFireActivateSpy = sandbox.spy(this.oToolbar, "fireEvent");
				oDialog.getEndButton().firePress();
				assert.strictEqual(oFireActivateSpy.callCount, 0, "no events were fired");
				assert.strictEqual(oCloseSpy.callCount, 1, "the dialog is closed");
			}.bind(this));
		});
	});

	function checkFormatting(assert, mProperties) {
		var oVersionButton = this.oToolbar.getControl("versionButton");
		assert.strictEqual(oVersionButton.getText(), mProperties.versionText, "the text is set");
		assert.strictEqual(oVersionButton.getTooltip(), mProperties.versionText, "the tooltip is set");
		assert.strictEqual(oVersionButton.hasStyleClass(ACTIVE_ACCENT_COLOR), mProperties.bActiveStyleClass, "the active style class is not set");
		assert.strictEqual(oVersionButton.hasStyleClass(DRAFT_ACCENT_COLOR), mProperties.bDraft, "the draft style class is set");
		var oDiscardButton = this.oToolbar.getControl("discardDraft");
		assert.strictEqual(oDiscardButton.getVisible(), mProperties.bDraft, "the discard button is visible");

		var oPublishButton = this.oToolbar.getControl("publishVersion");
		assert.strictEqual(oPublishButton.getVisible(), !mProperties.bDraft && mProperties.bPublish, "the publish button is visible");
	}

	QUnit.module("Formatting of direct Toolbar content", {
		async beforeEach() {
			this.oToolbar = await initializeToolbar();
			this.oTextResources = this.oToolbar.getTextResources();
			await this.oToolbar.onFragmentLoaded();
			return this.oToolbar.show();
		},
		afterEach() {
			this.oToolbar.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("for a draft", function(assert) {
			checkFormatting.call(this, assert, {
				versionText: this.oTextResources.getText("TIT_DRAFT"),
				bActiveStyleClass: false,
				bDraft: true,
				bPublish: false
			});
		});

		QUnit.test("for an active version with a title", function(assert) {
			this.oToolbar.getModel("versions").setProperty("/displayedVersion", "1");
			checkFormatting.call(this, assert, {
				versionText: VERSION_TITLE,
				bActiveStyleClass: true,
				bDraft: false,
				bPublish: false
			});
		});

		QUnit.test("for an inactive version without a title", function(assert) {
			this.oToolbar.getModel("versions").setProperty("/displayedVersion", "2");
			checkFormatting.call(this, assert, {
				versionText: this.oTextResources.getText("TIT_VERSION_1"),
				bActiveStyleClass: false,
				bDraft: false,
				bPublish: false
			});
		});

		QUnit.test("for no versions", function(assert) {
			this.oToolbar.getModel("versions").setProperty("/displayedVersion", Version.Number.Original);
			this.oToolbar.getModel("versions").setProperty("/versions", []);
			checkFormatting.call(this, assert, {
				versionText: this.oTextResources.getText("TIT_ORIGINAL_APP"),
				bActiveStyleClass: true,
				bDraft: false,
				bPublish: false
			});
		});

		QUnit.test("for original with only draft available", function(assert) {
			this.oToolbar.getModel("versions").setProperty("/displayedVersion", Version.Number.Original);
			this.oToolbar.getModel("versions").setProperty("/versions", [{
				version: Version.Number.Draft,
				type: Version.Type.Draft,
				isPublished: false
			}]);
			checkFormatting.call(this, assert, {
				versionText: this.oTextResources.getText("TIT_ORIGINAL_APP"),
				bActiveStyleClass: true,
				bDraft: false,
				bPublish: false
			});
		});

		QUnit.test("for original", function(assert) {
			this.oToolbar.getModel("versions").setProperty("/displayedVersion", Version.Number.Original);
			checkFormatting.call(this, assert, {
				versionText: this.oTextResources.getText("TIT_ORIGINAL_APP"),
				bActiveStyleClass: false,
				bDraft: false,
				bPublish: false
			});
		});

		QUnit.test("for activated version with publish", function(assert) {
			this.oToolbar.getModel("versions").setProperty("/displayedVersion", "2");
			this.oToolbar.getModel("versions").setProperty("/publishVersionVisible", true);
			checkFormatting.call(this, assert, {
				versionText: this.oTextResources.getText("TIT_VERSION_1"),
				bActiveStyleClass: false,
				bDraft: false,
				bPublish: true
			});
		});

		QUnit.test("for draft with publish", function(assert) {
			this.oToolbar.getModel("versions").setProperty("/publishVersionVisible", true);
			checkFormatting.call(this, assert, {
				versionText: this.oTextResources.getText("TIT_DRAFT"),
				bActiveStyleClass: false,
				bDraft: true,
				bPublish: true
			});
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
