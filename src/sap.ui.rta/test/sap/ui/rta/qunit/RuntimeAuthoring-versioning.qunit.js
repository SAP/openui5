/* global QUnit */

sap.ui.define([
	"qunit/RtaQunitUtils",
	"sap/m/MessageBox",
	"sap/m/MessageToast",
	"sap/ui/fl/write/api/PersistenceWriteAPI",
	"sap/ui/fl/write/api/Version",
	"sap/ui/fl/write/api/VersionsAPI",
	"sap/ui/fl/Utils",
	"sap/ui/rta/util/ReloadManager",
	"sap/ui/rta/RuntimeAuthoring",
	"sap/ui/rta/Utils",
	"sap/ui/thirdparty/sinon-4"
], function(
	RtaQunitUtils,
	MessageBox,
	MessageToast,
	PersistenceWriteAPI,
	Version,
	VersionsAPI,
	FlexUtils,
	ReloadManager,
	RuntimeAuthoring,
	Utils,
	sinon
) {
	"use strict";

	var sandbox = sinon.createSandbox();
	var oComp = RtaQunitUtils.createAndStubAppComponent(sinon);

	function givenAnFLP(fnFLPReloadStub, mShellParams) {
		sandbox.stub(FlexUtils, "getUshellContainer").returns({
			getServiceAsync: function() {
				return Promise.resolve({
					toExternal: function() {},
					getHash: function() {
						return "Action-somestring";
					},
					parseShellHash: function() {
						var mHash = {
							semanticObject: "Action",
							action: "somestring"
						};

						if (mShellParams) {
							mHash.params = mShellParams;
						}
						return mHash;
					},
					unregisterNavigationFilter: function() {},
					registerNavigationFilter: function() {},
					reloadCurrentApp: fnFLPReloadStub,
					getUser: function() {}
				});
			}
		});
	}

	QUnit.module("Given that RuntimeAuthoring gets a switch version event from the toolbar in the FLP", {
		beforeEach: function() {
			this.oRestartFlpStub = sandbox.stub();
			givenAnFLP(this.oRestartFlpStub, {});
			this.oRta = new RuntimeAuthoring({
				rootControl: oComp
			});
			this.oEnableRestartStub = sandbox.stub(RuntimeAuthoring, "enableRestart");
			this.oLoadVersionStub = sandbox.stub(VersionsAPI, "loadVersionForApplication");
			return this.oRta.start();
		},
		afterEach: function() {
			this.oRta.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when something can be undone", function(assert) {
			sandbox.stub(this.oRta, "canUndo").returns(true);
			var oShowMessageBoxStub = sandbox.stub(Utils, "showMessageBox").resolves(MessageBox.Action.CANCEL);

			this.oRta.getToolbar().fireSwitchVersion({
				version: "1"
			});

			assert.equal(oShowMessageBoxStub.callCount, 1, "a MessageBox was opened");
			assert.equal(this.oEnableRestartStub.callCount, 0, "then no restart is enabled");
		});

		QUnit.test("when the displayed version and the in the event are the same", function(assert) {
			this.oRta._oVersionsModel.setProperty("/displayedVersion", "1");
			this.oRta.getToolbar().fireSwitchVersion({
				version: "1"
			});

			assert.equal(this.oEnableRestartStub.callCount, 0, "then no restart is enabled");
		});

		QUnit.test("when no version is in the url and the app", function(assert) {
			var oReloadStub = sandbox.stub(ReloadManager, "triggerReload").resolves();

			this.oRta.getToolbar().fireSwitchVersion({
				version: "1"
			});
			assert.equal(this.oEnableRestartStub.callCount, 1, "then a restart is enabled");
			assert.equal(this.oLoadVersionStub.callCount, 1, "a reload for versions as triggered");
			var oLoadVersionArguments = this.oLoadVersionStub.getCall(0).args[0];
			assert.equal(oLoadVersionArguments.control, oComp, "with the control");
			assert.equal(oLoadVersionArguments.version, "1", ", the version number");
			assert.equal(oLoadVersionArguments.layer, this.oRta.getLayer(), "and the layer");
			assert.equal(oReloadStub.callCount, 1, "a navigation was triggered");
		});

		QUnit.test("when a version is in the url and the same version should be loaded again (i.e. loaded the app with " +
			"the 'Original App' version, create a draft and switch to 'Original Version' again)", function(assert) {
			var mParsedUrlHash = {
				params: {}
			};
			this.oRta._oVersionsModel.setProperty("/displayedVersion", Version.Number.Draft);
			mParsedUrlHash.params["sap-ui-fl-version"] = [Version.Number.Original.toString()];
			sandbox.stub(FlexUtils, "getParsedURLHash").returns(mParsedUrlHash);


			this.oRta.getToolbar().fireSwitchVersion({
				version: Version.Number.Original
			});
			assert.equal(this.oEnableRestartStub.callCount, 1, "then a restart is mentioned");
			assert.equal(this.oLoadVersionStub.callCount, 1, "a reload for versions as triggered");
			var oLoadVersionArguments = this.oLoadVersionStub.getCall(0).args[0];
			assert.equal(oLoadVersionArguments.control, oComp, "with the control");
			assert.equal(oLoadVersionArguments.version, Version.Number.Original, ", the version number");
			assert.equal(oLoadVersionArguments.layer, this.oRta.getLayer(), "and the layer");
			assert.equal(this.oRestartFlpStub.callCount, 1, "a app restart was triggered");
		});
	});

	QUnit.module("Given that RuntimeAuthoring gets a switch version event from the toolbar in the FLP, something can be undone and a dialog fires an event", {
		beforeEach: function() {
			givenAnFLP(sandbox.stub(), {});
			this.oRta = new RuntimeAuthoring({
				rootControl: oComp
			});
			sandbox.stub(this.oRta, "canUndo").returns(true);
			this.oSerializeStub = sandbox.stub(this.oRta, "_serializeToLrep").resolves();
			this.oEnableRestartStub = sandbox.stub(RuntimeAuthoring, "enableRestart");
			this.oLoadVersionStub = sandbox.stub(VersionsAPI, "loadVersionForApplication");
			this.nVersionParameter = 1;
			return this.oRta.start();
		},
		afterEach: function() {
			this.oRta.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when save was called", function(assert) {
			var fnDone = assert.async();
			sandbox.stub(Utils, "showMessageBox").resolves(MessageBox.Action.YES);

			this.oLoadVersionStub.callsFake(function(mPropertyBag) {
				assert.equal(mPropertyBag.version, this.nVersionParameter, "the version parameter was passed correct");
				assert.equal(this.oSerializeStub.callCount, 1, "the changes were saved");
				fnDone();
			}.bind(this));
			this.oRta.getToolbar().fireSwitchVersion({
				version: this.nVersionParameter
			});
		});

		QUnit.test("when changes should not be saved", function(assert) {
			var fnDone = assert.async();
			sandbox.stub(Utils, "showMessageBox").resolves(MessageBox.Action.NO);

			this.oLoadVersionStub.callsFake(function(mPropertyBag) {
				assert.equal(mPropertyBag.version, this.nVersionParameter, "the version parameter was passed correct");
				assert.equal(this.oSerializeStub.callCount, 0, "the changes were not saved");
				fnDone();
			}.bind(this));

			this.oRta.getToolbar().fireSwitchVersion({
				version: this.nVersionParameter
			});
		});

		QUnit.test("when cancel was called", function(assert) {
			var fnDone = assert.async();
			sandbox.stub(Utils, "showMessageBox").resolves(MessageBox.Action.CANCEL);

			this.oRta.getToolbar().fireSwitchVersion({
				version: this.nVersionParameter
			});
			setTimeout(function() {
				assert.equal(this.oSerializeStub.callCount, 0, "the changes were not saved");
				assert.equal(this.oLoadVersionStub.callCount, 0, "the version switch was not triggered");
				fnDone();
			}.bind(this));
		});
	});

	QUnit.module("Given that RuntimeAuthoring is started with a draft", {
		beforeEach: function() {
			givenAnFLP();
			this.oRta = new RuntimeAuthoring({
				rootControl: oComp
			});

			this.oActivateStub = sandbox.stub(VersionsAPI, "activate").resolves(true);
			return this.oRta.start().then(function() {
				this.oRta._oVersionsModel.setProperty("/versions", [{
					version: Version.Number.Draft,
					type: Version.Type.Draft
				}]);
				this.oRta._oVersionsModel.setProperty("/backendDraft", true);
				this.oRta._oVersionsModel.setProperty("/versioningEnabled", true);
				this.oSaveStub = sandbox.stub(this.oRta._oSerializer, "saveCommands").resolves();
			}.bind(this));
		},
		afterEach: function() {
			this.oRta.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when onActivate is called on draft", function(assert) {
			var fnDone = assert.async();
			var sVersionTitle = "aVersionTitle";

			sandbox.stub(VersionsAPI, "isDraftAvailable").returns(true);
			var oShowMessageToastStub = sandbox.stub(MessageToast, "show");

			sandbox.stub(this.oRta.getCommandStack(), "removeAllCommands").callsFake(function() {
				assert.strictEqual(this.oSaveStub.callCount, 1, "the commands were saved");
				assert.equal(this.oActivateStub.callCount, 1, "then the activate() method is called once");
				var oActivationCallPropertyBag = this.oActivateStub.getCall(0).args[0];
				assert.equal(oActivationCallPropertyBag.control, this.oRta.getRootControlInstance(), "with the correct control");
				assert.equal(oActivationCallPropertyBag.layer, this.oRta.getLayer(), "and layer");
				assert.equal(oActivationCallPropertyBag.title, sVersionTitle, "and version title");
				assert.equal(this.oRta.bInitialResetEnabled, true, "and the initialRestEnabled is true");
				assert.equal(this.oRta.getToolbar().getModel("controls").getProperty("/restoreEnabled"), true, "RestoreEnabled is correctly set in Model");
				assert.equal(oShowMessageToastStub.callCount, 1, "and a message is shown");
				fnDone();
			}.bind(this));

			this.oRta.getToolbar().fireActivate({
				versionTitle: sVersionTitle
			});
		});

		QUnit.test("when onActivate is called on an older version with backend draft", function(assert) {
			var fnDone = assert.async();
			var sVersionTitle = "aVersionTitle";

			sandbox.stub(VersionsAPI, "isOldVersionDisplayed").returns(true);
			sandbox.stub(VersionsAPI, "isDraftAvailable").returns(true);
			sandbox.stub(PersistenceWriteAPI, "save").resolves();
			var oShowMessageBoxStub = sandbox.stub(Utils, "showMessageBox").resolves(MessageBox.Action.OK);
			var oShowMessageToastStub = sandbox.stub(MessageToast, "show");

			sandbox.stub(this.oRta.getCommandStack(), "removeAllCommands").callsFake(function() {
				assert.equal(oShowMessageBoxStub.callCount, 1, "then the message box was shown and click on OK");
				assert.equal(this.oSaveStub.callCount, 1, "serializeAndSave is called once");
				assert.equal(this.oActivateStub.callCount, 1, "activate() method is called once");
				assert.equal(this.oSaveStub.calledBefore(this.oActivateStub), true, "serialize was called before activating the verison");
				assert.ok(this.oSaveStub.getCall(0).args[0].version, "serialize was called with the version");
				var oActivationCallPropertyBag = this.oActivateStub.getCall(0).args[0];
				assert.equal(oActivationCallPropertyBag.control, this.oRta.getRootControlInstance(), "with the correct control");
				assert.equal(oActivationCallPropertyBag.layer, this.oRta.getLayer(), "and layer");
				assert.equal(oActivationCallPropertyBag.title, sVersionTitle, "and version title");
				assert.equal(this.oRta.bInitialResetEnabled, true, "and the initialRestEnabled is true");
				assert.equal(this.oRta.getToolbar().getModel("controls").getProperty("/restoreEnabled"), true, "RestoreEnabled is correctly set in Model");
				assert.equal(oShowMessageToastStub.callCount, 1, "and a message is shown");
				fnDone();
			}.bind(this));

			this.oRta.getToolbar().fireActivate({
				versionTitle: sVersionTitle
			});
		});

		QUnit.test("when the draft activation fails", function(assert) {
			var done = assert.async();
			this.oActivateStub.reset();
			this.oActivateStub.rejects("myFancyError");
			sandbox.stub(Utils, "showMessageBox").callsFake(function(sIconType, sMessage, mPropertyBag) {
				assert.equal(sIconType, "error", "the error message box is used");
				assert.equal(mPropertyBag.error, "myFancyError", "and a message box shows the error to the user");
				assert.equal(sMessage, "MSG_DRAFT_ACTIVATION_FAILED", "the message is MSG_DRAFT_ACTIVATION_FAILED");
				done();
			});

			this.oRta.getToolbar().fireEvent("activate", {
				versionTitle: "VersionTitle"
			});
		});

		QUnit.test("when onDiscardDraft is called", function(assert) {
			var fnDone = assert.async();
			var oDiscardDraftStub = sandbox.stub(VersionsAPI, "discardDraft").resolves();
			var oRemoveAllCommandsStub = sandbox.stub(this.oRta.getCommandStack(), "removeAllCommands");
			var oShowMessageBoxStub = sandbox.stub(Utils, "showMessageBox").resolves(MessageBox.Action.OK);
			var oReloadStub = sandbox.stub(ReloadManager, "triggerReload").resolves();
			var mParsedHash = {
				params: {
					"sap-ui-fl-version": [Version.Number.Draft]
				}
			};
			sandbox.stub(VersionsAPI, "isDraftAvailable").returns(true);
			sandbox.stub(FlexUtils, "getParsedURLHash").returns(mParsedHash);
			sandbox.stub(this.oRta, "stop").callsFake(function() {
				assert.equal(oShowMessageBoxStub.callCount, 1, "then the message box was shown");
				assert.equal(oShowMessageBoxStub.lastCall.args[1], "MSG_DRAFT_DISCARD_DIALOG", "then the message is correct");
				assert.equal(oDiscardDraftStub.callCount, 1, "then the discardDraft() method is called once");
				assert.equal(oRemoveAllCommandsStub.callCount, 1, "and all commands were removed");
				var oDiscardCallPropertyBag = oDiscardDraftStub.getCall(0).args[0];
				assert.equal(oDiscardCallPropertyBag.control, this.oRta.getRootControlInstance(), "with the correct control");
				assert.equal(oDiscardCallPropertyBag.layer, this.oRta.getLayer(), "and layer");
				assert.equal(oReloadStub.callCount, 1, "a restart was triggered");
				fnDone();
			}.bind(this));

			this.oRta.getToolbar().fireEvent("discardDraft", {
				versionTitle: "VersionTitle"
			});
		});

		QUnit.test("When publishVersion function is called and publicVersion returns Promise.resolve() ", function(assert) {
			var fnDone = assert.async();
			var oPublishStub = sandbox.stub(VersionsAPI, "publish").resolves();
			var oMessageToastStub = sandbox.stub(MessageToast, "show").callsFake(function() {
				assert.strictEqual(oPublishStub.callCount, 1, "then the publish API was called");
				assert.strictEqual(oMessageToastStub.callCount, 1, "then the messageToast was shown");
				fnDone();
			});
			this.oRta.getToolbar().fireEvent("publishVersion");
		});

		QUnit.test("When publishVersion function is called and publicVersion returns Cancel or Error", function(assert) {
			var fnDone = assert.async();
			sandbox.stub(VersionsAPI, "publish").resolves("Cancel");
			var oMessageToastStub = sandbox.stub(MessageToast, "show");
			this.oRta.getToolbar().fireEvent("publishVersion");
			setTimeout(function() {
				assert.strictEqual(oMessageToastStub.callCount, 0, "then no messageToast was shown");
				fnDone();
			});
		});
	});

	QUnit.module("Given onStackModified", {
		beforeEach: function() {
			this.oRta = new RuntimeAuthoring({
				rootControl: oComp
			});
			return this.oRta.start();
		},
		afterEach: function() {
			if (this.oRta._oDraftDiscardWarningPromise) {
				this.oRta._oDraftDiscardWarningPromise = undefined;
				this.oRta._oDraftDiscardWarningDialog.destroy();
			}
			this.oRta.destroy();
			sandbox.restore();
		}
	}, function() {
		[{
			testName: "when the stack was modified and a new draft is created, an old draft exists and the user has not yet confirmed the discarding of the old draft",
			input: {
				versionDisplayed: Version.Number.Original,
				backendDraft: true,
				canUndo: true,
				userConfirmedDiscard: false
			},
			expectation: {
				dialogCreated: true
			}
		}, {
			testName: "when the stack was modified and a new draft is created, an old draft exists and the user has not yet confirmed the discarding of the old draft and clicks on OK",
			input: {
				versionDisplayed: Version.Number.Original,
				backendDraft: true,
				canUndo: true,
				userConfirmedDiscard: false,
				discardConfirmed: true
			},
			expectation: {
				dialogCreated: true
			}
		}, {
			testName: "when the stack was modified and a new draft is created, an old draft exists and the user has already confirmed the discarding of the old draft",
			input: {
				versionDisplayed: Version.Number.Original,
				backendDraft: true,
				canUndo: true,
				userConfirmedDiscard: true
			},
			expectation: {
				dialogCreated: false
			}
		}, {
			testName: "when the stack was modified in the current draft",
			input: {
				versionDisplayed: Version.Number.Draft,
				backendDraft: true,
				canUndo: true,
				userConfirmedDiscard: false
			},
			expectation: {
				dialogCreated: false
			}
		}, {
			testName: "when the stack was modified but nothing can be undone",
			input: {
				versionDisplayed: Version.Number.Original,
				backendDraft: true,
				canUndo: false,
				userConfirmedDiscard: false
			},
			expectation: {
				dialogCreated: false
			}
		}, {
			testName: "when the stack was modified and a new draft is created, an old draft does not exist",
			input: {
				versionDisplayed: Version.Number.Original,
				backendDraft: false,
				canUndo: true,
				userConfirmedDiscard: false
			},
			expectation: {
				dialogCreated: false
			}
		}].forEach(function(mSetup) {
			QUnit.test(mSetup.testName, function(assert) {
				var fnDone = assert.async();
				var oUserAction = mSetup.input.discardConfirmed || mSetup.input.userConfirmedDiscard ? MessageBox.Action.OK : MessageBox.Action.CANCEL;
				var oShowMessageBoxStub = sandbox.stub(Utils, "showMessageBox").resolves(oUserAction);
				this.oRta._oVersionsModel.setProperty("/versioningEnabled", true);
				this.oRta._oVersionsModel.setProperty("/displayedVersion", mSetup.input.versionDisplayed);
				this.oRta._oVersionsModel.setProperty("/backendDraft", mSetup.input.backendDraft);
				this.oRta._bUserDiscardedDraft = mSetup.input.userConfirmedDiscard ? true : undefined;
				sandbox.stub(this.oRta.getCommandStack(), "canUndo").returns(mSetup.input.canUndo);

				function doAssertions() {
					assert.equal(oShowMessageBoxStub.callCount, mSetup.expectation.dialogCreated ? 1 : 0, "the message box display was handled correct");
					fnDone();
				}

				if (mSetup.expectation.dialogCreated && mSetup.input.discardConfirmed || !mSetup.expectation.dialogCreated) {
					this.oRta.attachEventOnce("undoRedoStackModified", doAssertions);
				} else {
					sandbox.stub(this.oRta, "undo").callsFake(doAssertions);
				}

				this.oRta.getCommandStack().fireEvent("modified");
			});
		});
	});

	QUnit.done(function() {
		oComp.destroy();
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
