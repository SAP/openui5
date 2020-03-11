/*global QUnit*/

sap.ui.define([
	"sap/ui/rta/toolbar/Adaptation",
	"sap/ui/Device",
	"sap/ui/core/Fragment",
	"sap/ui/thirdparty/sinon-4"
],
function(
	Adaptation,
	Device,
	Fragment,
	sinon
) {
	'use strict';

	var sandbox = sinon.sandbox.create();

	QUnit.module('Different Screen Sizes', {
		beforeEach: function() {
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
				textResources: sap.ui.getCore().getLibraryResourceBundle("sap.ui.rta"),
				versioningVisible: true
			});
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
				textResources: sap.ui.getCore().getLibraryResourceBundle("sap.ui.rta"),
				draftEnabled: true
			});
			this.oGetCurrentRangeStub.returns({name: Adaptation.modes.TABLET});
			this.oToolbar.animation = false;
			return this.oToolbar.show()
				.then(function() {
					assert.notOk(this.oToolbar.getControl("versionLabel").getVisible(), "the version label is hidden");
					assert.equal(this.oToolbar.sMode, Adaptation.modes.TABLET, "the mode was correctly set");
				}.bind(this));
		});

		QUnit.test("when the toolbar gets initially shown in mobile mode (< 900px)", function(assert) {
			this.oToolbar = new Adaptation({
				textResources: sap.ui.getCore().getLibraryResourceBundle("sap.ui.rta")
			});
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
				textResources: sap.ui.getCore().getLibraryResourceBundle("sap.ui.rta"),
				draftEnabled: true,
				versioningVisible: true
			});
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

		QUnit.test("setVersioningVisible", function(assert) {
			this.oToolbar.setVersioningVisible(false);
			assert.notOk(this.oToolbar.getControl("versionLabel").getVisible(), "the version label is hidden");
			assert.notOk(this.oToolbar.getControl("activateDraft").getVisible(), "the draft activate button is hidden");
			assert.notOk(this.oToolbar.getControl("discardDraft").getVisible(), "the draft discard button is hidden");

			this.oToolbar.setVersioningVisible(true);
			assert.ok(this.oToolbar.getControl("versionLabel").getVisible(), "the version label is visible");
			assert.ok(this.oToolbar.getControl("activateDraft").getVisible(), "the draft activate button is visible");
			assert.ok(this.oToolbar.getControl("discardDraft").getVisible(), "the draft discard button is visible");

			this.oToolbar.setVersioningVisible(false);
			assert.notOk(this.oToolbar.getControl("versionLabel").getVisible(), "the version label is hidden");
			assert.notOk(this.oToolbar.getControl("activateDraft").getVisible(), "the draft activate button is hidden");
			assert.notOk(this.oToolbar.getControl("discardDraft").getVisible(), "the draft discard button is hidden");
		});

		QUnit.test("setDraftEnabled", function(assert) {
			assert.notOk(this.oToolbar.getControl("activateDraft").getEnabled(), "the draft activate button is disabled");
			assert.notOk(this.oToolbar.getControl("discardDraft").getEnabled(), "the draft discard button is disabled");

			this.oToolbar.setDraftEnabled(false);
			assert.notOk(this.oToolbar.getControl("activateDraft").getEnabled(), "the draft activate button is enabled");
			assert.notOk(this.oToolbar.getControl("discardDraft").getEnabled(), "the draft discard button is enabled");

			this.oToolbar.setDraftEnabled(true);
			assert.ok(this.oToolbar.getControl("activateDraft").getEnabled(), "the draft activate button is disabled");
			assert.ok(this.oToolbar.getControl("discardDraft").getEnabled(), "the draft discard button is disabled");
		});

		QUnit.test("setversionLabelText", function(assert) {
			this.oToolbar.setVersioningVisible(true);
			var sDraftTitle = "draft title";
			var sDraftTitleNew = "new draft titel";

			assert.equal(this.oToolbar.getControl("versionLabel").getText(), "", "the draft title is empty");
			assert.equal(this.oToolbar.getControl("versionLabel").getTooltip(), null, "the draft tooltip is empty");

			this.oToolbar.setVersionLabel(sDraftTitle);
			assert.equal(this.oToolbar.getControl("versionLabel").getText(), sDraftTitle, "the draft title is equal");
			assert.equal(this.oToolbar.getControl("versionLabel").getTooltip(), sDraftTitle, "the draft tooltip is equal");

			this.oToolbar.setVersionLabel(sDraftTitleNew);
			assert.equal(this.oToolbar.getControl("versionLabel").getText(), sDraftTitleNew, "the new draft title is equal");
			assert.equal(this.oToolbar.getControl("versionLabel").getTooltip(), sDraftTitleNew, "the draft tooltip is equal");

			this.oToolbar.setDraftEnabled(false);
			assert.ok(this.oToolbar.getControl("versionLabel").getVisible(), "the version label is visible");

			this.oToolbar.setVersioningVisible(false);
			assert.notOk(this.oToolbar.getControl("versionLabel").getVisible(), "the version label is hidden");
		});

		QUnit.test("setVersionLabelAccentColor", function(assert) {
			this.oToolbar.setVersioningVisible(true);
			var sVersionAccent = "sapUiRtaVersionAccent1";

			this.oToolbar.setVersionLabelAccentColor();
			assert.equal(this.oToolbar.getControl("versionLabel").hasStyleClass(sVersionAccent), false, "the label color is not accent as default");

			this.oToolbar.setVersionLabelAccentColor(true);
			assert.equal(this.oToolbar.getControl("versionLabel").hasStyleClass(sVersionAccent), true, "the label color is accent");

			this.oToolbar.setVersionLabelAccentColor(false);
			assert.equal(this.oToolbar.getControl("versionLabel").hasStyleClass(sVersionAccent), false, "the label color is not accent");
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

	QUnit.done(function () {
		jQuery("#qunit-fixture").hide();
	});
});
