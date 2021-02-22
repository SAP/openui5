/* global QUnit */

sap.ui.define([
	"sap/ui/base/Event",
	"sap/m/MessageBox",
	"sap/ui/fl/Utils",
	"sap/ui/rta/Utils",
	"sap/ui/rta/RuntimeAuthoring",
	"qunit/RtaQunitUtils",
	"sap/ui/fl/write/api/PersistenceWriteAPI",
	"sap/ui/fl/write/api/VersionsAPI",
	"sap/ui/fl/write/api/FeaturesAPI",
	"sap/ui/fl/write/api/ReloadInfoAPI",
	"sap/ui/thirdparty/sinon-4"
], function (
	Event,
	MessageBox,
	FlexUtils,
	Utils,
	RuntimeAuthoring,
	RtaQunitUtils,
	PersistenceWriteAPI,
	VersionsAPI,
	FeaturesAPI,
	ReloadInfoAPI,
	sinon
) {
	"use strict";

	var sandbox = sinon.sandbox.create();
	var oCompCont;
	var oComp;

	QUnit.config.fixture = null;

	var oComponentPromise = RtaQunitUtils.renderTestAppAtAsync("qunit-fixture")
		.then(function(oCompContainer) {
			oCompCont = oCompContainer;
			oComp = oCompCont.getComponentInstance();
		});

	function givenAnFLP(fnFLPToExternalStub, fnFLPReloadStub, mShellParams) {
		sandbox.stub(FlexUtils, "getUshellContainer").returns({
			getService: function () {
				return {
					toExternal: fnFLPToExternalStub,
					getHash: function () {
						return "Action-somestring";
					},
					parseShellHash: function () {
						var mHash = {
							semanticObject: "Action",
							action: "somestring"
						};

						if (mShellParams) {
							mHash.params = mShellParams;
						}
						return mHash;
					},
					unregisterNavigationFilter: function () {
					},
					registerNavigationFilter: function () {
					},
					reloadCurrentApp: fnFLPReloadStub
				};
			},
			getLogonSystem: function () {
				return {
					isTrial: function () {
						return false;
					}
				};
			}
		});
	}

	function whenUserConfirmsMessage(sExpectedMessageKey, assert) {
		return sandbox.stub(Utils, "showMessageBox").callsFake(
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
		before: function () {
			return oComponentPromise;
		},
		beforeEach: function () {
			this.oRootControl = oCompCont.getComponentInstance().getAggregation("rootControl");
			this.oRta = new RuntimeAuthoring({
				rootControl: this.oRootControl,
				showToolbars: false
			});
		},
		afterEach: function () {
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
		before: function () {
			return oComponentPromise;
		},
		beforeEach: function () {
			givenAnFLP(function () {
				return true;
			}, undefined, {});
			this.oRootControl = oCompCont.getComponentInstance().getAggregation("rootControl");
			this.oRta = new RuntimeAuthoring({
				rootControl: this.oRootControl,
				showToolbars: false
			});
			this.oReloadInfo = {
				layer: this.oRta.getLayer(),
				selector: this.oRta.getRootControlInstance(),
				ignoreMaxLayerParameter: false,
				includeCtrlVariants: true,
				parsedHash: {params: {}}
			};

			sandbox.stub(FlexUtils, "getParsedURLHash").returns(this.oReloadInfo.parsedHash);
		},
		afterEach: function () {
			this.oRta.destroy();
			sandbox.restore();
		}
	}, function () {
		QUnit.test("and versioning is available and a draft is available,", function (assert) {
			var oHasMaxLayerParameterSpy = sandbox.spy(ReloadInfoAPI, "hasMaxLayerParameterWithValue");
			var oHasVersionParameterSpy = sandbox.spy(FlexUtils, "getParameter");
			var oHasHigherLayerChangesSpy = sandbox.spy(PersistenceWriteAPI, "hasHigherLayerChanges");
			var oGetReloadMessageOnStart = sandbox.stub(this.oRta, "_getReloadMessageOnStart").returns("MSG_DRAFT_EXISTS");
			var oIsVersioningEnabledStub = sandbox.stub(FeaturesAPI, "isVersioningEnabled").returns(Promise.resolve(true));
			this.oReloadInfo.hasHigherLayerChanges = false;
			this.oReloadInfo.isDraftAvailable = true;
			var oIsDraftAvailableStub = sandbox.stub(VersionsAPI, "isDraftAvailable").returns(true);
			var oGetReloadReasonsSpy = sandbox.spy(ReloadInfoAPI, "getReloadReasonsForStart");
			whenUserConfirmsMessage.call(this, "MSG_DRAFT_EXISTS", assert);

			return this.oRta._determineReload().then(function () {
				assert.equal(oIsVersioningEnabledStub.callCount, 1, "then isVersioningEnabled is called once");
				assert.equal(oIsDraftAvailableStub.callCount, 1, "then isDraftAvailable is called once");

				assert.equal(oHasMaxLayerParameterSpy.callCount, 1, "then hasMaxLayerParameterWithValue is called once");
				assert.ok(oHasVersionParameterSpy.calledWith(sap.ui.fl.Versions.UrlParameter), "the version parameter was checked");
				assert.equal(oHasHigherLayerChangesSpy.callCount, 1, "then hasHigherLayerChanges is called once");
				assert.deepEqual(oHasHigherLayerChangesSpy.lastCall.args[0], {
					selector: this.oReloadInfo.selector,
					reference: "sap.ui.rta.qunitrta.Component",
					ignoreMaxLayerParameter: this.oReloadInfo.ignoreMaxLayerParameter,
					includeCtrlVariants: this.oReloadInfo.includeCtrlVariants,
					upToLayer: "CUSTOMER",
					includeDirtyChanges: true
				}, "then hasHigherLayerChanges is called with the correct parameters");

				assert.equal(oGetReloadMessageOnStart.callCount, 1, "then _getReloadMessageOnStart is called once");
				assert.deepEqual(oGetReloadMessageOnStart.lastCall.args[0].hasHigherLayerChanges, this.oReloadInfo.hasHigherLayerChanges, "then _getReloadMessageOnStart is called with the correct reload reason");
				assert.deepEqual(oGetReloadMessageOnStart.lastCall.args[0].isDraftAvailable, this.oReloadInfo.isDraftAvailable, "then _getReloadMessageOnStart is called with the correct reload reason");
				assert.equal(oGetReloadReasonsSpy.callCount, 1, "then getReloadReasonsForStart is called once");
			}.bind(this));
		});

		QUnit.test("and versioning is not available,", function (assert) {
			var oIsDraftAvailableStub = sandbox.stub(VersionsAPI, "isDraftAvailable");

			var oHasMaxLayerParameterSpy = sandbox.spy(ReloadInfoAPI, "hasMaxLayerParameterWithValue");
			var oHasVersionParameterSpy = sandbox.spy(FlexUtils, "getParameter");
			var oGetReloadMessageOnStart = sandbox.stub(this.oRta, "_getReloadMessageOnStart").returns();
			this.oRta._bVersioningEnabled = false;
			this.oReloadInfo.hasHigherLayerChanges = false;
			this.oReloadInfo.isDraftAvailable = false;
			var oGetReloadReasonsStub = sandbox.stub(ReloadInfoAPI, "getReloadReasonsForStart").returns(Promise.resolve(this.oReloadInfo));

			return this.oRta._determineReload().then(function () {
				assert.equal(oIsDraftAvailableStub.callCount, 0, "then isDraftAvailable is not called");
				assert.equal(oHasMaxLayerParameterSpy.callCount, 0, "then hasMaxLayerParameterWithValue is not called");
				assert.ok(oHasVersionParameterSpy.neverCalledWith(sap.ui.fl.Versions.UrlParameter), "the version parameter was not checked");
				assert.equal(oGetReloadMessageOnStart.callCount, 0, "then _getReloadMessageOnStart is not called");
				assert.equal(oGetReloadReasonsStub.callCount, 1, "then getReloadReasonsForStart is called once");
			});
		});
	});
	QUnit.module("Given that a CrossAppNavigation is needed because of a draft", {
		before: function () {
			return oComponentPromise;
		},
		beforeEach: function () {
			sandbox.stub(FlexUtils, "getUshellContainer").returns({
				getService: function () {
					return {
						toExternal: function () {
							return true;
						},
						parseShellHash: function () {
							return {params: {}};
						}
					};
				}
			});
			this.oRootControl = oCompCont.getComponentInstance().getAggregation("rootControl");
			this.oRta = new RuntimeAuthoring({
				rootControl: this.oRootControl,
				showToolbars: false
			});
			this.mParsedHash = {
				params: {
					"sap-ui-fl-version": [sap.ui.fl.Versions.Draft.toString()]
				}
			};
			this.oReloadInfo = {
				hasHigherLayerChanges: false,
				isDraftAvailable: true,
				layer: this.oRta.getLayer(),
				selector: this.oRta.getRootControlInstance(),
				ignoreMaxLayerParameter: false,
				includeCtrlVariants: true,
				parsedHash: this.mParsedHash
			};
		},
		afterEach: function () {
			this.oRta.destroy();
			sandbox.restore();
		}
	}, function () {
		QUnit.test("and versioning is not available,", function (assert) {
			var oGetReloadMessageOnStart = sandbox.stub(this.oRta, "_getReloadMessageOnStart").returns(Promise.resolve());
			this.oRta._bVersioningEnabled = false;
			this.oReloadInfo.hasHigherLayerChanges = false;
			this.oReloadInfo.isDraftAvailable = false;
			var oGetReloadReasonsStub = sandbox.stub(ReloadInfoAPI, "getReloadReasonsForStart").returns(Promise.resolve(this.oReloadInfo));

			return this.oRta._determineReload().then(function () {
				assert.equal(oGetReloadMessageOnStart.callCount, 0, "then _getReloadMessageOnStart is not called");
				assert.equal(oGetReloadReasonsStub.callCount, 1, "then getReloadReasons is called once");
			});
		});
	});

	QUnit.module("Given that RuntimeAuthoring wants to determine if a reload is needed on start", {
		before: function () {
			return oComponentPromise;
		},
		beforeEach: function () {
			givenAnFLP(function () {
				return true;
			}, undefined, {});
			this.oRootControl = oCompCont.getComponentInstance().getAggregation("rootControl");
			this.oRta = new RuntimeAuthoring({
				rootControl: this.oRootControl,
				showToolbars: false
			});
			this.mParsedHash = {params: {}};

			this.oReloadInfo = {
				hasHigherLayerChanges: false,
				isDraftAvailable: true,
				layer: this.oRta.getLayer(),
				selector: this.oRta.getRootControlInstance(),
				ignoreMaxLayerParameter: false,
				includeCtrlVariants: true,
				parsedHash: this.mParsedHash
			};
		},
		afterEach: function () {
			this.oRta.destroy();
			sandbox.restore();
		}
	}, function () {
		QUnit.test("and a draft is available", function (assert) {
			sandbox.stub(FlexUtils, "getParsedURLHash").returns(this.mParsedHash);
			sandbox.stub(this.oRta, "_buildNavigationArguments").returns({});
			sandbox.stub(FeaturesAPI, "isVersioningEnabled").returns(Promise.resolve(true));

			var oHasMaxLayerParameterSpy = sandbox.spy(ReloadInfoAPI, "hasMaxLayerParameterWithValue");
			var oHasVersionParameterSpy = sandbox.spy(FlexUtils, "getParameter");
			var oHasHigherLayerChangesSpy = sandbox.spy(PersistenceWriteAPI, "hasHigherLayerChanges");
			var oGetReloadMessageOnStart = sandbox.stub(this.oRta, "_getReloadMessageOnStart").returns("MSG_DRAFT_EXISTS");
			var oHandleParameterOnStartStub = sandbox.stub(ReloadInfoAPI, "handleParametersOnStart").returns(this.mParsedHash);
			var oIsDraftAvailableStub = sandbox.stub(VersionsAPI, "isDraftAvailable").returns(true);
			whenUserConfirmsMessage.call(this, "MSG_DRAFT_EXISTS", assert);

			return this.oRta._determineReload().then(function () {
				assert.equal(oIsDraftAvailableStub.callCount, 1, "then isDraftAvailable is called once");

				assert.equal(oHasMaxLayerParameterSpy.callCount, 1, "then hasMaxLayerParameterWithValue is called once");
				assert.ok(oHasVersionParameterSpy.calledWith(sap.ui.fl.Versions.UrlParameter), "the version parameter was checked");
				assert.equal(oHasHigherLayerChangesSpy.callCount, 1, "then hasHigherLayerChanges is called once");
				assert.deepEqual(oHasHigherLayerChangesSpy.lastCall.args[0], {
					selector: this.oReloadInfo.selector,
					reference: "sap.ui.rta.qunitrta.Component",
					ignoreMaxLayerParameter: this.oReloadInfo.ignoreMaxLayerParameter,
					includeCtrlVariants: this.oReloadInfo.includeCtrlVariants,
					upToLayer: "CUSTOMER",
					includeDirtyChanges: true
				}, "then hasHigherLayerChanges is called with the correct parameters");

				assert.equal(oGetReloadMessageOnStart.callCount, 1, "then _getReloadMessageOnStart is called once");
				assert.equal(oHandleParameterOnStartStub.callCount, 1, "then handleParametersOnStart is called once");
			}.bind(this));
		});

		QUnit.test("and a reload is needed on start because of draft changes", function (assert) {
			var oLoadDraftForApplication = sandbox.stub(VersionsAPI, "loadDraftForApplication").returns(Promise.resolve());
			var oLoadVersionForApplication = sandbox.stub(VersionsAPI, "loadVersionForApplication").returns(Promise.resolve());

			whenUserConfirmsMessage.call(this, "MSG_DRAFT_EXISTS", assert);

			var oReloadInfo = {
				isDraftAvailable: true,
				hasHigherLayerChanges: false
			};
			return this.oRta._triggerReloadOnStart(oReloadInfo).then(function () {
				assert.equal(oLoadDraftForApplication.callCount, 1, "then loadDraftForApplication is called once");
				assert.equal(oLoadVersionForApplication.callCount, 0, "then loadVersionForApplication is not called");
			});
		});

		QUnit.test("and a reload is needed on start because of personalization changes", function (assert) {
			var oLoadDraftForApplication = sandbox.stub(VersionsAPI, "loadDraftForApplication").returns(Promise.resolve());
			var oLoadVersionForApplication = sandbox.stub(VersionsAPI, "loadVersionForApplication").returns(Promise.resolve());

			whenUserConfirmsMessage.call(this, "MSG_HIGHER_LAYER_CHANGES_EXIST", assert);

			var oReloadInfo = {
				isDraftAvailable: false,
				hasHigherLayerChanges: true
			};
			return this.oRta._triggerReloadOnStart(oReloadInfo).then(function () {
				assert.equal(oLoadDraftForApplication.callCount, 0, "then loadDraftForApplication is called once");
				assert.equal(oLoadVersionForApplication.callCount, 1, "then loadVersionForApplication is not called");
			});
		});
	});

	QUnit.module("Given that RuntimeAuthoring in the CUSTOMER layer was started within an FLP and wants to determine if a reload is needed on exit", {
		before: function () {
			return oComponentPromise;
		},
		beforeEach: function () {
			givenAnFLP(function () {
				return true;
			}, undefined, {});
			this.oRootControl = oCompCont.getComponentInstance().getAggregation("rootControl");
			this.oRta = new RuntimeAuthoring({
				rootControl: this.oRootControl,
				showToolbars: false
			});
			return this.oRta.start();
		},
		afterEach: function () {
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
			whenUserConfirmsMessage.call(this, "MSG_RELOAD_WITH_PERSONALIZATION_AND_VIEWS", assert);
			return this.oRta._handleReloadOnExit()
				.then(function (oReloadInfo) {
					assert.equal(oReloadInfo.reloadMethod, "CROSS_APP_NAVIGATION", "then a cross app is triggered");
				});
		});

		QUnit.test("a higher layer changes exist with dirty draft changes", function (assert) {
			sandbox.stub(ReloadInfoAPI, "hasMaxLayerParameterWithValue").returns(true);
			this.oRta._oVersionsModel.setProperty("/draftAvailable", true);
			this.oRta._oVersionsModel.setProperty("/dirtyChanges", true);
			whenUserConfirmsMessage.call(this, "MSG_RELOAD_WITH_VIEWS_PERSONALIZATION_AND_WITHOUT_DRAFT", assert);
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
			var oShowMessageBoxStub = whenUserConfirmsMessage.call(this, "MSG_RELOAD_WITHOUT_DRAFT", assert);

			return this.oRta._handleReloadOnExit()
				.then(function (oReloadInfo) {
					assert.equal(oShowMessageBoxStub.calledOnce, true, "A Popup was shown");
					assert.equal(oReloadInfo.reloadMethod, "CROSS_APP_NAVIGATION", "then a cross app is triggered");
					assert.equal(oReloadInfo.isDraftAvailable, true, "Reload reason for isDraftAvailable is true");
				});
		});

		QUnit.test("and changes need a reload", function (assert) {
			this.oRta._bReloadNeeded = true;
			whenUserConfirmsMessage.call(this, "MSG_RELOAD_NEEDED", assert);
			return this.oRta._handleReloadOnExit()
				.then(function (oReloadInfo) {
					assert.equal(oReloadInfo.reloadMethod, "HARD_RELOAD", "then a hard reload is triggered");
				});
		});
	});

	QUnit.module("Given that RuntimeAuthoring gets a switch version event from the toolbar in the FLP", {
		before: function () {
			return oComponentPromise;
		},
		beforeEach: function () {
			this.oRestartFlpStub = sandbox.stub();
			givenAnFLP(function () {
				return true;
			}, this.oRestartFlpStub, {});
			this.oRootControl = oCompCont.getComponentInstance().getAggregation("rootControl");
			this.oRta = new RuntimeAuthoring({
				rootControl: this.oRootControl
			});
			this.oEnableRestartStub = sandbox.stub(RuntimeAuthoring, "enableRestart");
			return this.oRta.start();
		},
		afterEach: function () {
			this.oRta.destroy();
			sandbox.restore();
		}
	}, function () {
		QUnit.test("when something can be undone", function (assert) {
			var oEvent = new Event("someEventId", undefined, {
				version: 1
			});

			sandbox.stub(this.oRta, "canUndo").returns(true);
			var oShowMessageBoxStub = sandbox.stub(Utils, "showMessageBox").resolves(MessageBox.Action.CANCEL);

			return this.oRta._onSwitchVersion(oEvent)
			.then(function () {
				assert.equal(oShowMessageBoxStub.callCount, 1, "a MessageBox was opened");
				assert.equal(this.oEnableRestartStub.callCount, 0, "then no restart is mentioned");
			}.bind(this));
		});

		QUnit.test("when the displayed version and the in the event are the same", function (assert) {
			var oEvent = new Event("someEventId", undefined, {
				version: 1
			});

			this.oRta._oVersionsModel.setProperty("/displayedVersion", 1);

			this.oRta._onSwitchVersion(oEvent);

			assert.equal(this.oEnableRestartStub.callCount, 0, "then no restart is mentioned");
		});

		QUnit.test("when no version is in the url and the app", function (assert) {
			var oEvent = new Event("someEventId", undefined, {
				version: 1
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

		QUnit.test("when a version is in the url and the same version should be loaded again (i.e. loaded the app with " +
			"the 'Original App' version, create a draft and switch to 'Original Version' again)", function (assert) {
			var oEvent = new Event("someEventId", undefined, {
				version: sap.ui.fl.Versions.Original
			});

			var oLoadVersionStub = sandbox.stub(VersionsAPI, "loadVersionForApplication");
			var mParsedUrlHash = {
				params: {}
			};
			this.oRta._oVersionsModel.setProperty("/displayedVersion", sap.ui.fl.Versions.Draft);
			mParsedUrlHash.params[sap.ui.fl.Versions.UrlParameter] = [sap.ui.fl.Versions.Original.toString()];
			sandbox.stub(FlexUtils, "getParsedURLHash").returns(mParsedUrlHash);

			this.oRta._onSwitchVersion(oEvent);

			assert.equal(this.oEnableRestartStub.callCount, 1, "then a restart is mentioned");
			assert.equal(oLoadVersionStub.callCount, 1, "a reload for versions as triggered");
			var oLoadVersionArguments = oLoadVersionStub.getCall(0).args[0];
			assert.equal(oLoadVersionArguments.selector, this.oRootControl, "with the selector");
			assert.equal(oLoadVersionArguments.version, sap.ui.fl.Versions.Original, ", the version number");
			assert.equal(oLoadVersionArguments.layer, this.oRta.getLayer(), "and the layer");
			assert.equal(this.oRestartFlpStub.callCount, 1, "a app restart was triggered");
		});
	});

	QUnit.module("Given that RuntimeAuthoring gets a switch version event from the toolbar in the FLP, something can be undone and a dialog fires an event", {
		before: function () {
			return oComponentPromise;
		},
		beforeEach: function () {
			givenAnFLP(function () {
				return true;
			}, undefined, {});
			this.oRootControl = oCompCont.getComponentInstance().getAggregation("rootControl");
			this.oRta = new RuntimeAuthoring({
				rootControl: this.oRootControl
			});
			sandbox.stub(this.oRta, "canUndo").returns(true);
			this.oSerializeStub = sandbox.stub(this.oRta, "_serializeToLrep").resolves();
			this.oSwitchVersionStub = sandbox.stub(this.oRta, "_switchVersion");
			this.oEnableRestartStub = sandbox.stub(RuntimeAuthoring, "enableRestart");
			this.nVersionParameter = 1;
			return this.oRta.start();
		},
		afterEach: function () {
			this.oRta.destroy();
			sandbox.restore();
		}
	}, function () {
		QUnit.test("when save was called", function (assert) {
			sandbox.stub(Utils, "showMessageBox").resolves(MessageBox.Action.YES);

			var oEvent = new Event("someEventId", undefined, {
				version: this.nVersionParameter
			});
			return this.oRta._onSwitchVersion(oEvent)
			.then(function () {
				assert.equal(this.oSerializeStub.callCount, 1, "the changes were saved");
				assert.equal(this.oSwitchVersionStub.callCount, 1, "the version switch was triggered");
				var aSwitchVersionArguments = this.oSwitchVersionStub.getCall(0).args;
				assert.equal(aSwitchVersionArguments[0], this.nVersionParameter, "the version parameter was passed correct");
			}.bind(this));
		});

		QUnit.test("when changes should not be saved", function (assert) {
			sandbox.stub(Utils, "showMessageBox").resolves(MessageBox.Action.NO);

			var oEvent = new Event("someEventId", undefined, {
				version: this.nVersionParameter
			});
			return this.oRta._onSwitchVersion(oEvent)
			.then(function () {
				assert.equal(this.oSerializeStub.callCount, 0, "the changes were not saved");
				assert.equal(this.oSwitchVersionStub.callCount, 1, "the version switch was triggered");
				var aSwitchVersionArguments = this.oSwitchVersionStub.getCall(0).args;
				assert.equal(aSwitchVersionArguments[0], this.nVersionParameter, "the version parameter was passed correct");
			}.bind(this));
		});

		QUnit.test("when cancel was called", function (assert) {
			sandbox.stub(Utils, "showMessageBox").resolves(MessageBox.Action.CANCEL);

			var oEvent = new Event("someEventId", undefined, {
				version: this.nVersionParameter
			});
			return this.oRta._onSwitchVersion(oEvent)
			.then(function () {
				assert.equal(this.oSerializeStub.callCount, 0, "the changes were not saved");
				assert.equal(this.oSwitchVersionStub.callCount, 0, "the version switch was not triggered");
			}.bind(this));
		});
	});

	QUnit.module("Given that RuntimeAuthoring is started", {
		before: function () {
			return oComponentPromise;
		},
		beforeEach: function() {
			this.oRootControl = oCompCont.getComponentInstance().getAggregation("rootControl");
			this.oRta = new RuntimeAuthoring({
				rootControl: this.oRootControl
			});

			sandbox.stub(this.oRta, "_setVersionsModel").callsFake(function (oModel) {
				oModel.setProperty("/versions", [{
					version: sap.ui.fl.Versions.Draft,
					type: "draft"
				}]);
				oModel.setProperty("/backendDraft", true);
				oModel.setProperty("/versioningEnabled", true);
				this.oRta._oVersionsModel = oModel;
				return Promise.resolve();
			}.bind(this));

			this.oRestartFlpStub = sandbox.stub();
			givenAnFLP(function() {return true;}, this.oRestartFlpStub);
		},
		afterEach: function() {
			this.oRta.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when _onActivate is called on draft", function (assert) {
			var oActivateStub;
			var oShowMessageToastStub;
			var oRta = this.oRta;
			var sVersionTitle = "aVersionTitle";
			var oEvent = {
				getParameter: function () {
					return sVersionTitle;
				}
			};

			sandbox.stub(this.oRta, "_isDraftAvailable").returns(true);

			return oRta.start().then(function () {
				oActivateStub = sandbox.stub(VersionsAPI, "activate").resolves(true);
				oShowMessageToastStub = sandbox.stub(oRta, "_showMessageToast");
			})
				.then(oRta._onActivate.bind(oRta, oEvent))
				.then(function () {
					assert.equal(oActivateStub.callCount, 1, "then the activate() method is called once");
					var oActivationCallPropertyBag = oActivateStub.getCall(0).args[0];
					assert.equal(oActivationCallPropertyBag.selector, this.oRta.getRootControlInstance(), "with the correct selector");
					assert.equal(oActivationCallPropertyBag.layer, this.oRta.getLayer(), "and layer");
					assert.equal(oActivationCallPropertyBag.title, sVersionTitle, "and version title");
					assert.equal(oRta.bInitialResetEnabled, true, "and the initialRestEnabled is true");
					assert.equal(oRta.getToolbar().getModel("controls").getProperty("/restoreEnabled"), true, "RestoreEnabled is correctly set in Model");
					assert.equal(oShowMessageToastStub.callCount, 1, "and a message is shown");
				}.bind(this));
		});

		QUnit.test("when _onActivate is called on an older version with backend draft", function (assert) {
			var oActivateStub;
			var oShowMessageToastStub;
			var oRta = this.oRta;
			var sVersionTitle = "aVersionTitle";
			var oEvent = {
				getParameter: function () {
					return sVersionTitle;
				}
			};

			sandbox.stub(this.oRta, "_isOldVersionDisplayed").returns(true);
			sandbox.stub(this.oRta, "_isDraftAvailable").returns(true);
			var oShowMessageBoxStub = sandbox.stub(Utils, "showMessageBox").resolves("MessageBox.Action.CANCEL");

			return oRta.start().then(function () {
				oActivateStub = sandbox.stub(VersionsAPI, "activate").resolves(true);
				oShowMessageToastStub = sandbox.stub(oRta, "_showMessageToast");
			})
				.then(oRta._onActivate.bind(oRta, oEvent))
				.then(function () {
					assert.equal(oShowMessageBoxStub.callCount, 1, "then the message box was shown and click on CANCEL");
					assert.equal(oShowMessageBoxStub.lastCall.args[1], "MSG_DRAFT_DISCARD_ON_REACTIVATE_DIALOG", "the message text is correct");
					assert.equal(oActivateStub.callCount, 0, "activate() method was not called");

					oShowMessageBoxStub.reset();
					oShowMessageBoxStub.resolves(MessageBox.Action.OK);
					return this.oRta._onActivate(oEvent);
				}.bind(this))
				.then(function () {
					assert.equal(oShowMessageBoxStub.callCount, 1, "then the message box was shown and click on OK");
					assert.equal(oActivateStub.callCount, 1, "activate() method is called once");
					var oActivationCallPropertyBag = oActivateStub.getCall(0).args[0];
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
				params: {
					"sap-ui-fl-version": [sap.ui.fl.Versions.Draft]
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
					assert.equal(oRemoveAllCommandsStub.callCount, 1, "and all commands were removed");
					assert.equal(oRemoveVersionParameterStub.callCount, 1, "then _removeVersionParameterForFLP was called");
					assert.equal(oRemoveVersionParameterStub.getCall(0).args[0], mParsedHash, "then _removeVersionParameterForFLP was called with the correct parameters");
					var oDiscardCallPropertyBag = oDiscardDraftStub.getCall(0).args[0];
					assert.equal(oDiscardCallPropertyBag.selector, this.oRta.getRootControlInstance(), "with the correct selector");
					assert.equal(oDiscardCallPropertyBag.layer, this.oRta.getLayer(), "and layer");
					assert.equal(oStopStub.callCount, 1, "then stop was called");
					assert.equal(this.oRestartFlpStub.callCount, 1, "a restart was triggered");
				}.bind(this));
		});
	});

	QUnit.module("Given that RuntimeAuthoring gets a switch version event from the toolbar in standalone", {
		before: function () {
			return oComponentPromise;
		},
		beforeEach: function() {
			this.oRootControl = oCompCont.getComponentInstance().getAggregation("rootControl");
			this.oRta = new RuntimeAuthoring({
				rootControl: this.oRootControl,
				showToolbars: false
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
			var oTriggerHardReloadSpy = sandbox.spy(this.oRta, "_triggerHardReload");

			this.oRta._onSwitchVersion(oEvent);

			assert.equal(this.oEnableRestartStub.callCount, 1, "then a restart is mentioned");
			assert.equal(oTriggerHardReloadSpy.callCount, 1, "_triggerHardReload was called");
			assert.equal(oHandleUrlParametersSpy.callCount, 1, "handleUrlParameters was called");
			assert.equal(oSetUriParameterStub.callCount, 1, "the uri was changed and will lead to a reload");
		});

		QUnit.test("when version parameter is in the url no hard reload is triggered", function (assert) {
			var oEvent = new Event("someEventId", undefined, {
				version: 1
			});

			sandbox.stub(ReloadInfoAPI, "hasVersionParameterWithValue").returns(true);
			var oTriggerHardReloadSpy = sandbox.spy(this.oRta, "_triggerHardReload");
			var oReloadPageSpy = sandbox.stub(this.oRta, "_reloadPage").resolves();

			this.oRta._onSwitchVersion(oEvent);

			assert.equal(this.oEnableRestartStub.callCount, 1, "then a restart is mentioned");
			assert.equal(oReloadPageSpy.callCount, 1, "_reloadPage was called");
			assert.equal(oTriggerHardReloadSpy.callCount, 0, "and _triggerHardReload was not called");
		});
	});

	QUnit.module("Given _onStackModified", {
		before: function () {
			return oComponentPromise;
		},
		beforeEach: function() {
			this.oRootControl = oCompCont.getComponentInstance().getAggregation("rootControl");
			this.oRta = new RuntimeAuthoring({
				rootControl: this.oRootControl,
				showToolbars: true
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
				versionDisplayed: sap.ui.fl.Versions.Original,
				backendDraft: true,
				canUndo: true,
				userConfirmedDiscard: false
			},
			expectation: {
				dialogCreated: true
			}
		}, {
			testName: "when the stack was modified and a new draft is created, an old draft exists and the user has already confirmed the discarding of the old draft",
			input: {
				versionDisplayed: sap.ui.fl.Versions.Original,
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
				versionDisplayed: sap.ui.fl.Versions.Draft,
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
				versionDisplayed: sap.ui.fl.Versions.Original,
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
				versionDisplayed: sap.ui.fl.Versions.Original,
				backendDraft: false,
				canUndo: true,
				userConfirmedDiscard: false
			},
			expectation: {
				dialogCreated: false
			}
		}].forEach(function (mSetup) {
			QUnit.test(mSetup.testName, function(assert) {
				var oUserAction = mSetup.input.userConfirmedDiscard ? MessageBox.Action.OK : MessageBox.Action.CANCEL;
				var oShowMessageBoxStub = sandbox.stub(Utils, "showMessageBox").resolves(oUserAction);
				this.oRta._oVersionsModel.setProperty("/versioningEnabled", true);
				this.oRta._oVersionsModel.setProperty("/displayedVersion", mSetup.input.versionDisplayed);
				this.oRta._oVersionsModel.setProperty("/backendDraft", mSetup.input.backendDraft);
				this.oRta._bUserDiscardedDraft = mSetup.input.userConfirmedDiscard ? true : undefined;
				sandbox.stub(this.oRta.getCommandStack(), "canUndo").returns(mSetup.input.canUndo);

				return this.oRta._onStackModified()
				.then(function () {
					assert.equal(oShowMessageBoxStub.callCount, mSetup.expectation.dialogCreated ? 1 : 0, "the message box display was handled correct");
				});
			});
		});
	});


	QUnit.module("Given a draft discarding warning dialog is openend", {
		before: function () {
			return oComponentPromise;
		},
		beforeEach: function() {
			this.oRootControl = oCompCont.getComponentInstance().getAggregation("rootControl");
			this.oRta = new RuntimeAuthoring({
				rootControl: this.oRootControl,
				showToolbars: true
			});

			this.oUndoStub = sandbox.stub(this.oRta, "undo");

			return this.oRta.start()
				.then(function () {
					this.oRta._oVersionsModel.setProperty("/versioningEnabled", true);
					this.oRta._oVersionsModel.setProperty("/displayedVersion", sap.ui.fl.Versions.Original);
					this.oRta._oVersionsModel.setProperty("/backendDraft", true);
					sandbox.stub(this.oRta.getCommandStack(), "canUndo").returns(true);
				}.bind(this));
		},
		afterEach: function() {
			delete this.oRta._bUserDiscardedDraft;
			this.oRta.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when the user modifies the stack while the displayed version is the Original App", function(assert) {
			whenUserConfirmsMessage.call(this, "MSG_DRAFT_DISCARD_AND_CREATE_NEW_DIALOG", assert);
			return this.oRta._onStackModified();
		});

		QUnit.test("when the user confirms the discarding", function(assert) {
			sandbox.stub(Utils, "showMessageBox").resolves(MessageBox.Action.OK);
			var oModifyStackStub = sandbox.stub(this.oRta, "_modifyStack");
			return this.oRta._onStackModified()
			.then(function() {
				assert.equal(this.oRta._bUserDiscardedDraft, true, "the flag that the user confirmed the discarding is set");
				assert.equal(oModifyStackStub.callCount, 1, "the modify stack function was called");
				assert.equal(this.oUndoStub.callCount, 0, "the undo was NOT called");
			}.bind(this));
		});

		QUnit.test("when the user cancels the discarding", function(assert) {
			sandbox.stub(Utils, "showMessageBox").resolves(MessageBox.Action.CANCEL);
			var oModifyStackStub = sandbox.stub(this.oRta, "_modifyStack");
			return this.oRta._onStackModified()
			.then(function () {
				assert.equal(this.oRta._bUserDiscardedDraft, undefined, "the flag that the user confirmed the discarding is NOT set");
				assert.equal(oModifyStackStub.callCount, 0, "the modify stack function was NOT called");
				assert.equal(this.oUndoStub.callCount, 1, "the undo was called");
			}.bind(this));
		});
	});

	QUnit.done(function() {
		oComp.destroy();
		jQuery("#qunit-fixture").hide();
	});
});
