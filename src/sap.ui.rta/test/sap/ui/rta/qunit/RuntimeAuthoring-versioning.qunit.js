/* global QUnit */

sap.ui.define([
	"qunit/RtaQunitUtils",
	"sap/m/MessageBox",
	"sap/m/MessageToast",
	"sap/ui/fl/initial/api/Version",
	"sap/ui/fl/write/_internal/Versions",
	"sap/ui/fl/write/api/PersistenceWriteAPI",
	"sap/ui/fl/write/api/ReloadInfoAPI",
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
	Version,
	Versions,
	PersistenceWriteAPI,
	ReloadInfoAPI,
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
			getServiceAsync() {
				return Promise.resolve({
					navigate() {},
					getHash() {
						return "Action-somestring";
					},
					parseShellHash() {
						var mHash = {
							semanticObject: "Action",
							action: "somestring"
						};

						if (mShellParams) {
							mHash.params = mShellParams;
						}
						return mHash;
					},
					unregisterNavigationFilter() {},
					registerNavigationFilter() {},
					reloadCurrentApp: fnFLPReloadStub,
					getUser() {},
					getCurrentApplication() {}
				});
			}
		});
	}

	QUnit.module("Given that RuntimeAuthoring gets a switch version event from the toolbar in the FLP", {
		beforeEach() {
			Versions.clearInstances();
			this.oRestartFlpStub = sandbox.stub();
			givenAnFLP(this.oRestartFlpStub, {});
			this.oRta = new RuntimeAuthoring({
				rootControl: oComp
			});
			this.oEnableRestartStub = sandbox.stub(RuntimeAuthoring, "enableRestart");
			this.oLoadVersionStubFinished = false;
			this.oLoadVersionStub = sandbox.stub(VersionsAPI, "loadVersionForApplication").callsFake(function() {
				return new Promise(function(resolve) {
					setTimeout(function() {
						this.oLoadVersionStubFinished = true;
						resolve();
					}.bind(this), 0);
				}.bind(this));
			}.bind(this));
			return this.oRta.start();
		},
		afterEach() {
			this.oRta.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when save is enabled", function(assert) {
			sandbox.stub(this.oRta, "canSave").returns(true);
			var oShowMessageBoxStub = sandbox.stub(Utils, "showMessageBox").resolves(MessageBox.Action.CANCEL);

			this.oRta.getToolbar().fireSwitchVersion({
				version: "1"
			});

			assert.strictEqual(oShowMessageBoxStub.callCount, 1, "a MessageBox was opened");
			assert.strictEqual(this.oEnableRestartStub.callCount, 0, "then no restart is enabled");
		});

		QUnit.test("when the displayed version and the in the event are the same", function(assert) {
			this.oRta._oVersionsModel.setProperty("/displayedVersion", "1");
			this.oRta.getToolbar().fireSwitchVersion({
				version: "1"
			});

			assert.strictEqual(this.oEnableRestartStub.callCount, 0, "then no restart is enabled");
		});

		QUnit.test("when no version is in the url and the app", function(assert) {
			var oReloadStub = sandbox.stub(ReloadManager, "triggerReload").callsFake(function() {
				assert.ok(this.oLoadVersionStubFinished, "then calls are properly chained");
				return Promise.resolve();
			}.bind(this));

			return new Promise(function(resolve) {
				this.oRta.getToolbar().fireSwitchVersion({
					version: "1",
					callback: resolve
				});
			}.bind(this)).then(function() {
				assert.strictEqual(this.oEnableRestartStub.callCount, 1, "then a restart is enabled");
				assert.strictEqual(this.oLoadVersionStub.callCount, 1, "a reload for versions as triggered");
				var oLoadVersionArguments = this.oLoadVersionStub.getCall(0).args[0];
				assert.strictEqual(oLoadVersionArguments.control, oComp, "with the control");
				assert.strictEqual(oLoadVersionArguments.version, "1", ", the version number");
				assert.strictEqual(oLoadVersionArguments.layer, this.oRta.getLayer(), "and the layer");
				assert.strictEqual(oReloadStub.callCount, 1, "a navigation was triggered");
			}.bind(this));
		});

		QUnit.test("when a version is in the url and the same version should be loaded again (i.e. loaded the app with " +
			"the 'Original App' version, create a draft and switch to 'Original Version' again)", function(assert) {
			var mParsedUrlHash = {
				params: {}
			};
			this.oRta._oVersionsModel.setProperty("/displayedVersion", Version.Number.Draft);
			mParsedUrlHash.params["sap-ui-fl-version"] = [Version.Number.Original.toString()];
			sandbox.stub(FlexUtils, "getParsedURLHash").returns(mParsedUrlHash);

			return new Promise(function(resolve) {
				this.oRta.getToolbar().fireSwitchVersion({
					version: Version.Number.Original,
					callback: resolve
				});
			}.bind(this)).then(function() {
				assert.strictEqual(this.oEnableRestartStub.callCount, 1, "then a restart is mentioned");
				assert.strictEqual(this.oLoadVersionStub.callCount, 1, "a reload for versions as triggered");
				var oLoadVersionArguments = this.oLoadVersionStub.getCall(0).args[0];
				assert.strictEqual(oLoadVersionArguments.control, oComp, "with the control");
				assert.strictEqual(oLoadVersionArguments.version, Version.Number.Original, ", the version number");
				assert.strictEqual(oLoadVersionArguments.layer, this.oRta.getLayer(), "and the layer");
				assert.strictEqual(this.oRestartFlpStub.callCount, 1, "a app restart was triggered");
			}.bind(this));
		});
	});

	QUnit.module("Given that RuntimeAuthoring gets a switch version event from the toolbar, save is enabled and a dialog fires an event", {
		beforeEach() {
			givenAnFLP(sandbox.stub(), {});
			this.oRta = new RuntimeAuthoring({
				rootControl: oComp
			});
			sandbox.stub(this.oRta, "canSave").returns(true);
			this.oSerializeStub = sandbox.stub(this.oRta, "_serializeToLrep").resolves();
			this.oEnableRestartStub = sandbox.stub(RuntimeAuthoring, "enableRestart");
			this.oLoadVersionStub = sandbox.stub(VersionsAPI, "loadVersionForApplication").resolves();
			this.nVersionParameter = 1;
			return this.oRta.start();
		},
		afterEach() {
			this.oRta.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when save was called", function(assert) {
			var fnDone = assert.async();
			sandbox.stub(Utils, "showMessageBox").resolves(MessageBox.Action.YES);

			this.oLoadVersionStub.callsFake(function(mPropertyBag) {
				assert.strictEqual(mPropertyBag.version, this.nVersionParameter, "the version parameter was passed correct");
				assert.strictEqual(this.oSerializeStub.callCount, 1, "the changes were saved");
				assert.strictEqual(
					this.oSerializeStub.args[0].length,
					0,
					"then '_serializeToLrep' was called without 'bCondenseAnyLayer' parameter"
				);
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
				assert.strictEqual(mPropertyBag.version, this.nVersionParameter, "the version parameter was passed correct");
				assert.strictEqual(this.oSerializeStub.callCount, 0, "the changes were not saved");
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
				assert.strictEqual(this.oSerializeStub.callCount, 0, "the changes were not saved");
				assert.strictEqual(this.oLoadVersionStub.callCount, 0, "the version switch was not triggered");
				fnDone();
			}.bind(this));
		});
	});

	QUnit.module("Given that RuntimeAuthoring is started with a draft", {
		beforeEach() {
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
		afterEach() {
			this.oRta.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when onActivate is called on draft", function(assert) {
			var fnDone = assert.async();
			var sVersionTitle = "aVersionTitle";

			sandbox.stub(VersionsAPI, "isDraftAvailable").returns(true);
			var oShowMessageToastStub = sandbox.stub(MessageToast, "show");

			assert.notOk(this.oRta.getPlugins().toolHooks.getVersionWasActivated(), "then the version activated flag is set to false");
			sandbox.stub(this.oRta.getCommandStack(), "removeAllCommands").callsFake(function() {
				assert.strictEqual(this.oSaveStub.callCount, 1, "the commands were saved");
				assert.strictEqual(this.oActivateStub.callCount, 1, "then the activate() method is called once");
				assert.ok(this.oRta.getPlugins().toolHooks.getVersionWasActivated(), "then the version activated flag is set to true");
				var oActivationCallPropertyBag = this.oActivateStub.getCall(0).args[0];
				assert.strictEqual(oActivationCallPropertyBag.control, this.oRta.getRootControlInstance(), "with the correct control");
				assert.strictEqual(oActivationCallPropertyBag.layer, this.oRta.getLayer(), "and layer");
				assert.strictEqual(oActivationCallPropertyBag.title, sVersionTitle, "and version title");
				assert.strictEqual(this.oRta.bInitialResetEnabled, true, "and the initialRestEnabled is true");
				assert.strictEqual(
					this.oRta.getToolbar().getModel("controls").getProperty("/restore/enabled"),
					true,
					"RestoreEnabled is correctly set in Model"
				);
				assert.strictEqual(oShowMessageToastStub.callCount, 1, "and a message is shown");
				fnDone();
			}.bind(this));

			assert.ok(this.oRta.getToolbar().getControl("versionButton").getVisible(), "the versionButton is visible on the toolbar");
			this.oRta.getToolbar().fireActivate({
				versionTitle: sVersionTitle
			});
		});

		QUnit.test("when onActivate is called on draft and commands requiring hard reload were executed (e.g. app descriptor commands)", function(assert) {
			const fnDone = assert.async();
			const sVersionTitle = "aVersionTitle";

			sandbox.stub(VersionsAPI, "isDraftAvailable").returns(true);
			sandbox.stub(this.oRta._oSerializer, "needsReload").resolves(true);

			sandbox.stub(this.oRta.getCommandStack(), "removeAllCommands").callsFake(function() {
				assert.strictEqual(this.oRta._bSavedChangesNeedReload, true, "then the needs reload flag is set to true");
				assert.strictEqual(
					this.oSaveStub.lastCall.args[0].version,
					this.oRta._oVersionsModel.getProperty("/displayedVersion"),
					"then saveCommands is called with the right version"
				);
				fnDone();
			}.bind(this));

			this.oRta.getToolbar().fireActivate({
				versionTitle: sVersionTitle
			});
		});

		QUnit.test("when save is called on Draft without leaving RTA", function(assert) {
			const fnDone = assert.async();
			const oMessageToastShowStub = sandbox.stub(MessageToast, "show");
			const sExpectedMessageToastMessage = this.oRta._getTextResources().getText("MSG_SAVE_DRAFT_SUCCESS");

			function fnChecks() {
				assert.ok(oMessageToastShowStub.calledWith(sExpectedMessageToastMessage),
					"appropriate message toast save confirmation is triggered");
				assert.strictEqual(
					this.oSaveStub.args[0][0].version,
					Version.Number.Draft,
					"then saveCommands is called with draft version"
				);
				fnDone();
			}

			return this.oRta.getToolbar().fireSave({
				callback: fnChecks.bind(this)
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
				assert.strictEqual(oShowMessageBoxStub.callCount, 1, "then the message box was shown and click on OK");
				assert.strictEqual(this.oSaveStub.callCount, 1, "serializeAndSave is called once");
				assert.strictEqual(this.oActivateStub.callCount, 1, "activate() method is called once");
				assert.strictEqual(
					this.oSaveStub.calledBefore(this.oActivateStub),
					true,
					"serialize was called before activating the verison"
				);
				assert.ok(this.oSaveStub.getCall(0).args[0].version, "serialize was called with the version");
				var oActivationCallPropertyBag = this.oActivateStub.getCall(0).args[0];
				assert.strictEqual(oActivationCallPropertyBag.control, this.oRta.getRootControlInstance(), "with the correct control");
				assert.strictEqual(oActivationCallPropertyBag.layer, this.oRta.getLayer(), "and layer");
				assert.strictEqual(oActivationCallPropertyBag.title, sVersionTitle, "and version title");
				assert.strictEqual(this.oRta.bInitialResetEnabled, true, "and the initialRestEnabled is true");
				assert.strictEqual(
					this.oRta.getToolbar().getModel("controls").getProperty("/restore/enabled"),
					true, "RestoreEnabled is correctly set in Model"
				);
				assert.strictEqual(oShowMessageToastStub.callCount, 1, "and a message is shown");
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
				assert.strictEqual(sIconType, "error", "the error message box is used");
				assert.strictEqual(mPropertyBag.error.name, "myFancyError", "and a message box shows the error to the user");
				assert.strictEqual(sMessage, "MSG_DRAFT_ACTIVATION_FAILED", "the message is MSG_DRAFT_ACTIVATION_FAILED");
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
				assert.strictEqual(oShowMessageBoxStub.callCount, 1, "then the message box was shown");
				assert.strictEqual(oShowMessageBoxStub.lastCall.args[1], "MSG_DRAFT_DISCARD_DIALOG", "then the message is correct");
				assert.strictEqual(oDiscardDraftStub.callCount, 1, "then the discardDraft() method is called once");
				assert.strictEqual(oRemoveAllCommandsStub.callCount, 1, "and all commands were removed");
				var oDiscardCallPropertyBag = oDiscardDraftStub.getCall(0).args[0];
				assert.strictEqual(oDiscardCallPropertyBag.control, this.oRta.getRootControlInstance(), "with the correct control");
				assert.strictEqual(oDiscardCallPropertyBag.layer, this.oRta.getLayer(), "and layer");
				assert.strictEqual(oReloadStub.callCount, 1, "a restart was triggered");
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

		QUnit.test("when an exit event is fired from the toolbar", function(assert) {
			const done = assert.async();
			sandbox.stub(PersistenceWriteAPI, "hasDirtyChanges").returns(true);
			sandbox.stub(this.oRta, "canSave").returns(true);
			sandbox.stub(ReloadManager, "handleReloadOnExit");
			sandbox.stub(ReloadManager, "removeDontShowWhatsNewAfterReload");
			sandbox.stub(ReloadInfoAPI, "removeInfoSessionStorage");
			const oMessageBoxStub = sandbox.stub(Utils, "showMessageBox").resolves();
			const oSerializeStub = sandbox.stub(this.oRta, "_serializeToLrep").resolves();
			sandbox.stub(ReloadManager, "checkReloadOnExit");

			this.oRta.attachEventOnce("stop", function() {
				assert.ok(true, "then the RTA stop event is fired");
				assert.strictEqual(oSerializeStub.callCount, 1, "then the changes were saved");
				assert.strictEqual(oMessageBoxStub.callCount, 1, "then a message box was shown");
				assert.strictEqual(oMessageBoxStub.lastCall.args[1], "MSG_UNSAVED_DRAFT_CHANGES_ON_CLOSE", "then the message is correct");
				done();
			});

			this.oRta.getToolbar().fireExit();
		});
	});

	QUnit.module("Given onStackModified, when the stack was modified", {
		async beforeEach() {
			this.oRta = new RuntimeAuthoring({
				rootControl: oComp
			});
			await this.oRta.start();
		},
		afterEach() {
			VersionsAPI.clearInstances();
			this.oRta.destroy();
			sandbox.restore();
		}
	}, function() {
		[{
			testName: "and a new draft is created, an old draft exists and the user has not yet confirmed the discarding of the old draft",
			input: {
				versionDisplayed: Version.Number.Original,
				backendDraft: true,
				canUndo: true
			},
			expectation: {
				dialogCreated: true,
				discardDraft: false
			}
		}, {
			testName: "and a new draft is created, an old draft exists and clicks on OK",
			input: {
				versionDisplayed: Version.Number.Original,
				backendDraft: true,
				canUndo: true,
				discardConfirmed: true
			},
			expectation: {
				dialogCreated: true,
				discardDraft: true
			}
		}, {
			testName: "in the current draft",
			input: {
				versionDisplayed: Version.Number.Draft,
				backendDraft: true,
				canUndo: true
			},
			expectation: {
				dialogCreated: false,
				discardDraft: false
			}
		}, {
			testName: "when the stack was modified but nothing can be undone",
			input: {
				versionDisplayed: Version.Number.Original,
				backendDraft: true,
				canUndo: false
			},
			expectation: {
				dialogCreated: false,
				discardDraft: false
			}
		}, {
			testName: "and a new draft is created, an old draft does not exist",
			input: {
				versionDisplayed: Version.Number.Original,
				backendDraft: false,
				canUndo: true
			},
			expectation: {
				dialogCreated: false,
				discardDraft: false
			}
		}].forEach(function(mSetup) {
			QUnit.test(mSetup.testName, function(assert) {
				var fnDone = assert.async();
				var oUserAction = mSetup.input.discardConfirmed ? MessageBox.Action.OK : MessageBox.Action.CANCEL;
				var oShowMessageBoxStub = sandbox.stub(Utils, "showMessageBox").resolves(oUserAction);
				this.oRta._oVersionsModel.setProperty("/versioningEnabled", true);
				this.oRta._oVersionsModel.setProperty("/displayedVersion", mSetup.input.versionDisplayed);
				this.oRta._oVersionsModel.setProperty("/backendDraft", mSetup.input.backendDraft);
				sandbox.stub(this.oRta.getCommandStack(), "canUndo").returns(mSetup.input.canUndo);
				var oVersionAPIDiscardDraftStub = sandbox.stub(VersionsAPI, "discardDraft").resolves();

				function doAssertions() {
					assert.strictEqual(oShowMessageBoxStub.callCount,
						mSetup.expectation.dialogCreated ? 1 : 0, "the message box display was handled correct"
					);
					assert.equal(oVersionAPIDiscardDraftStub.callCount, mSetup.expectation.discardDraft ? 1 : 0, "discard draft was handled correct");
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
