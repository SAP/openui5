/* global QUnit */

sap.ui.define([
	"sap/ui/base/Event",
	"sap/m/MessageBox",
	"sap/ui/fl/registry/Settings",
	"sap/ui/fl/Layer",
	"sap/base/Log",
	"sap/ui/fl/Utils",
	"sap/ui/rta/Utils",
	"sap/ui/rta/RuntimeAuthoring",
	"qunit/RtaQunitUtils",
	"sap/ui/fl/write/api/PersistenceWriteAPI",
	"sap/ui/fl/write/api/VersionsAPI",
	"sap/ui/fl/write/api/FeaturesAPI",
	"sap/ui/fl/write/api/ReloadInfoAPI",
	"sap/ui/model/json/JSONModel",
	"sap/ui/thirdparty/sinon-4"
], function (
	Event,
	MessageBox,
	Settings,
	Layer,
	Log,
	FlexUtils,
	Utils,
	RuntimeAuthoring,
	RtaQunitUtils,
	PersistenceWriteAPI,
	VersionsAPI,
	FeaturesAPI,
	ReloadInfoAPI,
	JSONModel,
	sinon
) {
	"use strict";

	var sandbox = sinon.sandbox.create();
	var oCompCont = RtaQunitUtils.renderTestAppAt("qunit-fixture");
	var oComp = oCompCont.getComponentInstance();

	function givenAnFLP(fnFLPToExternalStub, mShellParams) {
		sandbox.stub(FlexUtils, "getUshellContainer").returns({
			getService : function () {
				return {
					toExternal : fnFLPToExternalStub,
					getHash : function () {
						return "Action-somestring";
					},
					parseShellHash : function () {
						var mHash = {
							semanticObject : "Action",
							action : "somestring"
						};

						if (mShellParams) {
							mHash.params = mShellParams;
						}
						return mHash;
					},
					unregisterNavigationFilter : function () {
					},
					registerNavigationFilter : function () {
					}
				};
			},
			getLogonSystem : function () {
				return {
					isTrial : function () {
						return false;
					}
				};
			}
		});
	}

	function whenUserConfirmsMessage(sExpectedMessageKey, assert) {
		sandbox.stub(Utils, "showMessageBox").callsFake(
			function (oMessageType, sMessageKey) {
				assert.equal(sMessageKey, sExpectedMessageKey, "then expected message is shown");
				return Promise.resolve();
			}
		);
	}

	function _mockStateCallIsDraftAvailableAndCheckResult(assert, oRta, bIsVersioningEnabled, bIsDraftAvailable, bCanUndo, bExpectedResult) {
		oRta._bVersioningEnabled = bIsVersioningEnabled;
		sandbox.stub(VersionsAPI, "isDraftAvailable").returns(bIsDraftAvailable);
		sandbox.stub(oRta, "canUndo").returns(bCanUndo);
		assert.equal(oRta._isDraftAvailable(), bExpectedResult);
	}

	QUnit.module("Given that RuntimeAuthoring wants to determine if a draft is available", {
		beforeEach : function () {
			this.oRootControl = oCompCont.getComponentInstance().getAggregation("rootControl");
			this.oRta = new RuntimeAuthoring({
				rootControl : this.oRootControl,
				showToolbars : false
			});
		},
		afterEach : function () {
			this.oRta.destroy();
			sandbox.restore();
		}
	}, function () {
		QUnit.test("and versioning is not available", function (assert) {
			return _mockStateCallIsDraftAvailableAndCheckResult(assert, this.oRta, false, false, false, false);
		});
		QUnit.test("and versioning is available but no draft and no undo is available", function (assert) {
			return _mockStateCallIsDraftAvailableAndCheckResult(assert, this.oRta, true, false, false, false);
		});
		QUnit.test("and versioning and a draft is available", function (assert) {
			return _mockStateCallIsDraftAvailableAndCheckResult(assert, this.oRta, true, true, false, true);
		});
		QUnit.test("and versioning and a undo is available", function (assert) {
			return _mockStateCallIsDraftAvailableAndCheckResult(assert, this.oRta, true, false, true, false);
		});
		QUnit.test("and versioning, a draft and undo is available", function (assert) {
			return _mockStateCallIsDraftAvailableAndCheckResult(assert, this.oRta, true, true, true, true);
		});
	});

	QUnit.module("Given that RuntimeAuthoring wants to determine if a reload is needed", {
		beforeEach : function () {
			givenAnFLP(function () {
				return true;
			}, {});
			this.oRootControl = oCompCont.getComponentInstance().getAggregation("rootControl");
			this.oRta = new RuntimeAuthoring({
				rootControl : this.oRootControl,
				showToolbars : false
			});
			this.oReloadInfo = {
				layer : this.oRta.getLayer(),
				selector : this.oRta.getRootControlInstance(),
				ignoreMaxLayerParameter : false,
				parsedHash : {params : {}}
			};

			sandbox.stub(FlexUtils, "getParsedURLHash").returns(this.oReloadInfo.parsedHash);
		},
		afterEach : function () {
			this.oRta.destroy();
			sandbox.restore();
		}
	}, function () {
		QUnit.test("and versioning is available and a draft is available,", function (assert) {
			var oHasMaxLayerParameterSpy = sandbox.spy(ReloadInfoAPI, "hasMaxLayerParameterWithValue");
			var oHasVersionParameterSpy = sandbox.spy(ReloadInfoAPI, "hasVersionParameterWithValue");

			var oHasHigherLayerChangesSpy = sandbox.spy(PersistenceWriteAPI, "hasHigherLayerChanges");
			var oGetReloadMessageOnStart = sandbox.stub(this.oRta, "_getReloadMessageOnStart").returns("MSG_DRAFT_EXISTS");
			var oIsVersioningEnabledStub = sandbox.stub(FeaturesAPI, "isVersioningEnabled").returns(Promise.resolve(true));
			this.oReloadInfo.hasHigherLayerChanges = false;
			this.oReloadInfo.hasDraftChanges = true;
			var oIsDraftAvailableStub = sandbox.stub(VersionsAPI, "isDraftAvailable").returns(true);
			var oGetReloadReasonsSpy = sandbox.spy(ReloadInfoAPI, "getReloadReasonsForStart");
			whenUserConfirmsMessage.call(this, "MSG_DRAFT_EXISTS", assert);

			return this.oRta._determineReload().then(function () {
				assert.equal(oIsVersioningEnabledStub.callCount, 1, "then isVersioningEnabled is called once");
				assert.equal(oIsDraftAvailableStub.callCount, 1, "then isDraftAvailable is called once");

				assert.equal(oHasMaxLayerParameterSpy.callCount, 1, "then hasMaxLayerParameterWithValue is called once");
				assert.equal(oHasVersionParameterSpy.callCount, 1, "then hasVersionParameterWithValue is called once");
				assert.equal(oHasHigherLayerChangesSpy.callCount, 1, "then hasHigherLayerChanges is called once");
				assert.deepEqual(oHasHigherLayerChangesSpy.lastCall.args[0], {
					selector : this.oReloadInfo.selector,
					reference: "sap.ui.rta.qunitrta.Component",
					ignoreMaxLayerParameter : this.oReloadInfo.ignoreMaxLayerParameter,
					upToLayer: "CUSTOMER"
				}, "then hasHigherLayerChanges is called with the correct parameters");

				assert.equal(oGetReloadMessageOnStart.callCount, 1, "then _getReloadMessageOnStart is called once");
				assert.deepEqual(oGetReloadMessageOnStart.lastCall.args[0].hasHigherLayerChanges, this.oReloadInfo.hasHigherLayerChanges, "then _getReloadMessageOnStart is called with the correct reload reason");
				assert.deepEqual(oGetReloadMessageOnStart.lastCall.args[0].hasDraftChanges, this.oReloadInfo.hasDraftChanges, "then _getReloadMessageOnStart is called with the correct reload reason");
				assert.equal(oGetReloadReasonsSpy.callCount, 1, "then getReloadReasonsForStart is called once");
			}.bind(this));
		});

		QUnit.test("and versioning is not available,", function (assert) {
			var oIsDraftAvailableStub = sandbox.stub(VersionsAPI, "isDraftAvailable");

			var oHasMaxLayerParameterSpy = sandbox.spy(ReloadInfoAPI, "hasMaxLayerParameterWithValue");
			var oHasVersionParameterSpy = sandbox.spy(ReloadInfoAPI, "hasVersionParameterWithValue");
			var oGetReloadMessageOnStart = sandbox.stub(this.oRta, "_getReloadMessageOnStart").returns();
			this.oRta._bVersioningEnabled = false;
			this.oReloadInfo.hasHigherLayerChanges = false;
			this.oReloadInfo.hasDraftChanges = false;
			var oGetReloadReasonsStub = sandbox.stub(ReloadInfoAPI, "getReloadReasonsForStart").returns(Promise.resolve(this.oReloadInfo));

			return this.oRta._determineReload().then(function () {
				assert.equal(oIsDraftAvailableStub.callCount, 0, "then isDraftAvailable is not called");
				assert.equal(oHasMaxLayerParameterSpy.callCount, 0, "then hasMaxLayerParameterWithValue is not called");
				assert.equal(oHasVersionParameterSpy.callCount, 0, "then hasVersionParameterWithValue is not called");
				assert.equal(oGetReloadMessageOnStart.callCount, 0, "then _getReloadMessageOnStart is not called");
				assert.equal(oGetReloadReasonsStub.callCount, 1, "then getReloadReasonsForStart is called once");
			});
		});
	});
	QUnit.module("Given that a CrossAppNavigation is needed because of a draft", {
		beforeEach : function () {
			sandbox.stub(FlexUtils, "getUshellContainer").returns({
				getService : function () {
					return {
						toExternal : function () {
							return true;
						},
						parseShellHash : function () {
							return {params : {}};
						}
					};
				}
			});
			this.oRootControl = oCompCont.getComponentInstance().getAggregation("rootControl");
			this.oRta = new RuntimeAuthoring({
				rootControl : this.oRootControl,
				showToolbars : false
			});
			this.mParsedHash = {
				params : {
					"sap-ui-fl-version" : [sap.ui.fl.Versions.Draft.toString()]
				}
			};
			this.oReloadInfo = {
				hasHigherLayerChanges : false,
				hasDraftChanges : true,
				layer : this.oRta.getLayer(),
				selector : this.oRta.getRootControlInstance(),
				ignoreMaxLayerParameter : false,
				parsedHash : this.mParsedHash
			};
		},
		afterEach : function () {
			this.oRta.destroy();
			sandbox.restore();
		}
	}, function () {
		QUnit.test("and versioning is not available,", function (assert) {
			var oGetReloadMessageOnStart = sandbox.stub(this.oRta, "_getReloadMessageOnStart").returns(Promise.resolve());
			this.oRta._bVersioningEnabled = false;
			this.oReloadInfo.hasHigherLayerChanges = false;
			this.oReloadInfo.hasDraftChanges = false;
			var oGetReloadReasonsStub = sandbox.stub(ReloadInfoAPI, "getReloadReasonsForStart").returns(Promise.resolve(this.oReloadInfo));

			return this.oRta._determineReload().then(function () {
				assert.equal(oGetReloadMessageOnStart.callCount, 0, "then _getReloadMessageOnStart is not called");
				assert.equal(oGetReloadReasonsStub.callCount, 1, "then getReloadReasons is called once");
			});
		});
	});

	QUnit.module("Given that RuntimeAuthoring wants to determine if a reload is needed on start", {
		beforeEach : function () {
			givenAnFLP(function () {
				return true;
			}, {});
			this.oRootControl = oCompCont.getComponentInstance().getAggregation("rootControl");
			this.oRta = new RuntimeAuthoring({
				rootControl : this.oRootControl,
				showToolbars : false
			});
			this.mParsedHash = {params : {}};

			this.oReloadInfo = {
				hasHigherLayerChanges : false,
				hasDraftChanges : true,
				layer : this.oRta.getLayer(),
				selector : this.oRta.getRootControlInstance(),
				ignoreMaxLayerParameter : false,
				parsedHash : this.mParsedHash
			};
		},
		afterEach : function () {
			this.oRta.destroy();
			sandbox.restore();
		}
	}, function () {
		QUnit.test("and a draft is available", function (assert) {
			sandbox.stub(FlexUtils, "getParsedURLHash").returns(this.mParsedHash);
			sandbox.stub(this.oRta, "_buildNavigationArguments").returns({});
			sandbox.stub(FeaturesAPI, "isVersioningEnabled").returns(Promise.resolve(true));

			var oHasMaxLayerParameterSpy = sandbox.spy(ReloadInfoAPI, "hasMaxLayerParameterWithValue");
			var oHasVersionParameterSpy = sandbox.spy(ReloadInfoAPI, "hasVersionParameterWithValue");
			var oHasHigherLayerChangesSpy = sandbox.spy(PersistenceWriteAPI, "hasHigherLayerChanges");
			var oGetReloadMessageOnStart = sandbox.stub(this.oRta, "_getReloadMessageOnStart").returns("MSG_DRAFT_EXISTS");
			var oHandleParameterOnStartStub = sandbox.stub(ReloadInfoAPI, "handleParametersOnStart").returns(this.mParsedHash);
			var oIsDraftAvailableStub = sandbox.stub(VersionsAPI, "isDraftAvailable").returns(true);
			whenUserConfirmsMessage.call(this, "MSG_DRAFT_EXISTS", assert);

			return this.oRta._determineReload().then(function () {
				assert.equal(oIsDraftAvailableStub.callCount, 1, "then isDraftAvailable is called once");

				assert.equal(oHasMaxLayerParameterSpy.callCount, 1, "then hasMaxLayerParameterWithValue is called twice");
				assert.equal(oHasVersionParameterSpy.callCount, 1, "then hasVersionParameterWithValue is called twice");
				assert.equal(oHasHigherLayerChangesSpy.callCount, 1, "then hasHigherLayerChanges is called once");
				assert.deepEqual(oHasHigherLayerChangesSpy.lastCall.args[0], {
					selector : this.oReloadInfo.selector,
					reference: "sap.ui.rta.qunitrta.Component",
					ignoreMaxLayerParameter : this.oReloadInfo.ignoreMaxLayerParameter,
					upToLayer: "CUSTOMER"
				}, "then hasHigherLayerChanges is called with the correct parameters");

				assert.equal(oGetReloadMessageOnStart.callCount, 1, "then _getReloadMessageOnStart is called once");
				assert.equal(oHandleParameterOnStartStub.callCount, 1, "then handleParametersOnStart is called once");
			}.bind(this));
		});
	});

	QUnit.module("Given that RuntimeAuthoring in the CUSTOMER layer was started within an FLP and wants to determine if a reload is needed on exit", {
		beforeEach : function () {
			givenAnFLP(function () {
				return true;
			}, {});
			this.oRootControl = oCompCont.getComponentInstance().getAggregation("rootControl");
			this.oRta = new RuntimeAuthoring({
				rootControl : this.oRootControl,
				showToolbars : false
			});
			return this.oRta.start();
		},
		afterEach : function () {
			this.oRta.destroy();
			sandbox.restore();
		}
	}, function () {
		QUnit.test("and nothing has changed", function (assert) {
			var oShowMessageBoxStub = sandbox.stub(Utils, "showMessageBox");
			return this.oRta._handleReloadOnExit()
				.then(function (oReloadInfo) {
					assert.equal(oReloadInfo.reloadMethod, "NO_RELOAD", "then no reload is triggered");
					assert.equal(oShowMessageBoxStub.callCount, 0, "and no message was shown");
				});
		});

		QUnit.test("a higher layer changes exist but no dirty draft changes", function (assert) {
			sandbox.stub(ReloadInfoAPI, "hasMaxLayerParameterWithValue").returns(true);
			whenUserConfirmsMessage.call(this, "MSG_RELOAD_WITH_PERSONALIZATION", assert);
			return this.oRta._handleReloadOnExit()
				.then(function (oReloadInfo) {
					assert.equal(oReloadInfo.reloadMethod, "CROSS_APP_NAVIGATION", "then a cross app is triggered");
				});
		});

		QUnit.test("a higher layer changes exist with dirty draft changes", function (assert) {
			sandbox.stub(ReloadInfoAPI, "hasMaxLayerParameterWithValue").returns(true);
			this.oRta._oVersionsModel.setProperty("/draftAvailable", true);
			this.oRta._oVersionsModel.setProperty("/dirtyChanges", true);
			whenUserConfirmsMessage.call(this, "MSG_RELOAD_WITH_PERSONALIZATION_AND_WITHOUT_DRAFT", assert);
			return this.oRta._handleReloadOnExit()
				.then(function (oReloadInfo) {
					assert.equal(oReloadInfo.reloadMethod, "CROSS_APP_NAVIGATION", "then a cross app is triggered");
				});
		});

		QUnit.test("and the initial draft got activated", function (assert) {
			sandbox.stub(ReloadInfoAPI, "initialDraftGotActivated").returns(true);
			whenUserConfirmsMessage.call(this, "MSG_RELOAD_ACTIVATED_DRAFT", assert);
			return this.oRta._handleReloadOnExit()
				.then(function (oReloadInfo) {
					assert.equal(oReloadInfo.reloadMethod, "CROSS_APP_NAVIGATION", "then a cross app is triggered");
				});
		});

		QUnit.test("and draft changes exist", function (assert) {
			this.oRta._oVersionsModel.setProperty("/draftAvailable", true);
			this.oRta._oVersionsModel.setProperty("/dirtyChanges", true);
			whenUserConfirmsMessage.call(this, "MSG_RELOAD_WITHOUT_DRAFT", assert);
			return this.oRta._handleReloadOnExit()
				.then(function (oReloadInfo) {
					assert.equal(oReloadInfo.reloadMethod, "CROSS_APP_NAVIGATION", "then a cross app is triggered");
				});
		});

		QUnit.test("and changes need a reload", function (assert) {
			this.oRta._bReloadNeeded = true;
			whenUserConfirmsMessage.call(this, "MSG_RELOAD_NEEDED", assert);
			return this.oRta._handleReloadOnExit()
				.then(function (oReloadInfo) {
					assert.equal(oReloadInfo.reloadMethod, "HARD_RELOAD", "then a cross app is triggered");
				});
		});
	});

	QUnit.module("Given that RuntimeAuthoring gets a switch version event from the toolbar in the FLP", {
		beforeEach : function () {
			givenAnFLP(function () {
				return true;
			}, {});
			this.oRootControl = oCompCont.getComponentInstance().getAggregation("rootControl");
			this.oRta = new RuntimeAuthoring({
				rootControl : this.oRootControl,
				showToolbars : false
			});
			this.oEnableRestartStub = sandbox.stub(RuntimeAuthoring, "enableRestart");
			return this.oRta.start();
		},
		afterEach : function () {
			this.oRta.destroy();
			sandbox.restore();
		}
	}, function () {
		QUnit.test("when something can be undone", function (assert) {
			var oEvent = new Event("someEventId", undefined, {
				version : 1
			});

			sandbox.stub(this.oRta, "canUndo").returns(true);

			this.oRta._onSwitchVersion(oEvent);

			assert.equal(this.oEnableRestartStub.callCount, 0, "then no restart is mentioned");
		});

		QUnit.test("when the version parameter in the url and the in the event are the same", function (assert) {
			var oEvent = new Event("someEventId", undefined, {
				version : 1
			});

			sandbox.stub(FlexUtils, "getParameter").returns("1");

			this.oRta._onSwitchVersion(oEvent);

			assert.equal(this.oEnableRestartStub.callCount, 0, "then no restart is mentioned");
		});

		QUnit.test("when no version is in the url and the app", function (assert) {
			var oEvent = new Event("someEventId", undefined, {
				version : 1
			});

			var oCrossAppNavigationStub = sandbox.stub(this.oRta, "_triggerCrossAppNavigation").resolves();
			var oLoadVersionStub = sandbox.stub(VersionsAPI, "loadVersionForApplication");

			this.oRta._onSwitchVersion(oEvent);

			assert.equal(this.oEnableRestartStub.callCount, 1, "then a restart is mentioned");
			assert.equal(oLoadVersionStub.callCount, 1, "a reload for versions as triggered");
			var oLoadVersionArguments = oLoadVersionStub.getCall(0).args[0];
			assert.equal(oLoadVersionArguments.selector, this.oRootControl, "with the selector");
			assert.equal(oLoadVersionArguments.version, 1, ", the version number");
			assert.equal(oLoadVersionArguments.layer, this.oRta.getLayer(), "and the layer");
			assert.equal(oCrossAppNavigationStub.callCount, 1, "a cross app navigation was triggered");
		});
	});


	QUnit.module("Given that RuntimeAuthoring is started", {
		beforeEach : function() {
			this.oRootControl = oCompCont.getComponentInstance().getAggregation("rootControl");
			this.oRta = new RuntimeAuthoring({
				rootControl : this.oRootControl
			});

			sandbox.stub(this.oRta, "_setVersionsModel").callsFake(function (oModel) {
				oModel.setProperty("/versions", [{
					version : sap.ui.fl.Versions.Draft,
					type : "draft"
				}]);
				oModel.setProperty("/backendDraft", true);
				oModel.setProperty("/versioningEnabled", true);
				this.oRta._oVersionsModel = oModel;
				return Promise.resolve();
			}.bind(this));

			givenAnFLP(function() {return true;});
		},
		afterEach : function() {
			this.oRta.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when _onActivateDraft is called ", function (assert) {
			var oActivateDraftStub;
			var oShowMessageToastStub;
			var oRta = this.oRta;
			var sVersionTitle = "aVersionTitle";
			var oEvent = {
				getParameter : function () {
					return sVersionTitle;
				}
			};

			return oRta.start().then(function () {
				oActivateDraftStub = sandbox.stub(VersionsAPI, "activateDraft").resolves(true);
				oShowMessageToastStub = sandbox.stub(oRta, "_showMessageToast");
			})
				.then(oRta._onActivateDraft.bind(oRta, oEvent))
				.then(function () {
					assert.equal(oActivateDraftStub.callCount, 1, "then the activateDraft() method is called once");
					var oActivationCallPropertyBag = oActivateDraftStub.getCall(0).args[0];
					assert.equal(oActivationCallPropertyBag.selector, this.oRta.getRootControlInstance(), "with the correct selector");
					assert.equal(oActivationCallPropertyBag.layer, this.oRta.getLayer(), "and layer");
					assert.equal(oActivationCallPropertyBag.title, sVersionTitle, "and version title");
					assert.equal(oRta.bInitialResetEnabled, true, "and the initialRestEnabled is true");
					assert.equal(oRta.getToolbar().getModel("controls").getProperty("/restoreEnabled"), true, "RestoreEnabled is correctly set in Model");
					assert.equal(oShowMessageToastStub.callCount, 1, "and a message is shown");
				}.bind(this));
		});

		QUnit.test("when _onDiscardDraft is called", function (assert) {
			var oDiscardDraftStub = sandbox.stub(VersionsAPI, "discardDraft").resolves();
			var oHandleDiscardDraftStub = sandbox.spy(this.oRta, "_handleDiscard");
			var oRemoveVersionParameterStub = sandbox.spy(this.oRta, "_removeVersionParameterForFLP");
			var oRemoveAllCommandsStub = sandbox.stub(this.oRta.getCommandStack(), "removeAllCommands");
			var oShowMessageBoxStub = sandbox.stub(Utils, "showMessageBox").resolves("MessageBox.Action.CANCEL");
			var oStopStub = sandbox.stub(this.oRta, "stop");
			var mParsedHash = {
				params : {
					"sap-ui-fl-version" : [sap.ui.fl.Versions.Draft]
				}
			};
			sandbox.stub(this.oRta, "_isDraftAvailable").returns(true);
			sandbox.stub(FlexUtils, "getParsedURLHash").returns(mParsedHash);
			return this.oRta.start()
				.then(this.oRta._onDiscardDraft.bind(this.oRta, false))
				.then(function () {
					assert.equal(oShowMessageBoxStub.callCount, 1, "then the message box was shown");
					assert.equal(oHandleDiscardDraftStub.callCount, 0, "then _handleDiscard was not called");
					assert.equal(oDiscardDraftStub.callCount, 0, "then VersionsAPI was not called");
					assert.equal(oRemoveVersionParameterStub.callCount, 0, "then _removeVersionParameterForFLP was not called");

					oShowMessageBoxStub.reset();
					oShowMessageBoxStub.resolves(MessageBox.Action.OK);
					return this.oRta._onDiscardDraft(false);
				}.bind(this))
				.then(function () {
					assert.equal(oShowMessageBoxStub.callCount, 1, "then the message box was shown");
					assert.equal(oShowMessageBoxStub.lastCall.args[1], "MSG_DRAFT_DISCARD_DIALOG", "then the message is correct");
					assert.equal(oDiscardDraftStub.callCount, 1, "then the discardDraft() method is called once");
					assert.equal(oHandleDiscardDraftStub.callCount, 1, "then _handleDiscard was called");
					assert.equal(oRemoveVersionParameterStub.callCount, 1, "then _removeVersionParameterForFLP was called");
					assert.equal(oRemoveVersionParameterStub.getCall(0).args[0], mParsedHash, "then _removeVersionParameterForFLP was called with the correct parameters");
					var oDiscardCallPropertyBag = oDiscardDraftStub.getCall(0).args[0];
					assert.equal(oDiscardCallPropertyBag.selector, this.oRta.getRootControlInstance(), "with the correct selector");
					assert.equal(oDiscardCallPropertyBag.layer, this.oRta.getLayer(), "and layer");
					assert.equal(oRemoveAllCommandsStub.callCount, 1, "and all commands were removed");
					assert.equal(oStopStub.callCount, 1, "then stop was called");
				}.bind(this));
		});
	});

	QUnit.module("Given that RuntimeAuthoring gets a switch version event from the toolbar in standalone", {
		beforeEach: function() {
			this.oRootControl = oCompCont.getComponentInstance().getAggregation("rootControl");
			this.oRta = new RuntimeAuthoring({
				rootControl : this.oRootControl,
				showToolbars : false
			});
			this.oEnableRestartStub = sandbox.stub(RuntimeAuthoring, "enableRestart");
			return this.oRta.start();
		},
		afterEach: function() {
			this.oRta.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when no version is in the url and the app", function (assert) {
			var oEvent = new Event("someEventId", undefined, {
				version: 1
			});

			var oSetUriParameterStub = sandbox.stub(this.oRta, "_setUriParameter").resolves();
			var oHandleUrlParametersSpy = sandbox.spy(FlexUtils, "handleUrlParameters");

			this.oRta._onSwitchVersion(oEvent);

			assert.equal(this.oEnableRestartStub.callCount, 1, "then a restart is mentioned");
			assert.equal(oHandleUrlParametersSpy.callCount, 1, "handleUrlParameters was called");
			assert.equal(oSetUriParameterStub.callCount, 1, "the uri was changed and will lead to a reload");
		});
	});

	QUnit.done(function() {
		oComp.destroy();
		jQuery("#qunit-fixture").hide();
	});
});
