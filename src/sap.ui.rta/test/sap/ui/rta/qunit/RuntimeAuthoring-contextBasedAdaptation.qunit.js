/* global QUnit */

sap.ui.define([
	"qunit/RtaQunitUtils",
	"sap/m/MessageBox",
	"sap/ui/core/Control",
	"sap/ui/fl/apply/_internal/flexState/FlexState",
	"sap/ui/fl/write/api/ContextBasedAdaptationsAPI",
	"sap/ui/fl/registry/Settings",
	"sap/ui/fl/write/api/Version",
	"sap/ui/fl/write/api/VersionsAPI",
	"sap/ui/fl/write/_internal/Versions",
	"sap/ui/fl/Utils",
	"sap/ui/rta/command/Stack",
	"sap/ui/rta/util/ReloadManager",
	"sap/ui/rta/RuntimeAuthoring",
	"sap/ui/rta/Utils",
	"sap/ui/thirdparty/sinon-4"
], function(
	RtaQunitUtils,
	MessageBox,
	Control,
	FlexState,
	ContextBasedAdaptationsAPI,
	Settings,
	Version,
	VersionsAPI,
	Versions,
	FlexUtils,
	Stack,
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
					getUser: function() {},
					getCurrentApplication: function() {}
				});
			}
		});
	}

	QUnit.module("Given that RuntimeAuthoring gets a switch adaptation event from the toolbar in the FLP", {
		beforeEach: function() {
			ContextBasedAdaptationsAPI.clearInstances();
			var oDefaultAdaptation = {
				id: "DEFAULT",
				title: "",
				type: "DEFAULT"
			};
			var aAdaptations = [
				{
					title: "Sales",
					rank: 1,
					id: "id_1234"
				},
				{
					title: "Manager",
					rank: 2,
					id: "id_5678"
				},
				oDefaultAdaptation
			];
			var oAdaptationsModel = ContextBasedAdaptationsAPI.createModel(aAdaptations);

			Versions.clearInstances();
			this.oRestartFlpStub = sandbox.stub();
			givenAnFLP(this.oRestartFlpStub, {});
			this.oRta = new RuntimeAuthoring({
				rootControl: oComp
			});
			sandbox.stub(this.oRta, "canSave").returns(false);
			this.oEnableRestartStub = sandbox.stub(RuntimeAuthoring, "enableRestart");
			this.oLoadVersionSpy = sandbox.spy(VersionsAPI, "loadVersionForApplication");
			this.oLoadAdaptationsStub = sandbox.stub(ContextBasedAdaptationsAPI, "load");
			this.oFlexStateStub = sandbox.stub(FlexState, "clearAndInitialize").resolves();
			sandbox.stub(ContextBasedAdaptationsAPI, "getAdaptationsModel").returns(oAdaptationsModel);
			return this.oRta.start().then(function() {
				this.oRta._oContextBasedAdaptationsModel = oAdaptationsModel;
			}.bind(this));
		},
		afterEach: function() {
			this.oRta.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when save is disabled", function(assert) {
			var oReloadStub = sandbox.stub(ReloadManager, "triggerReload").resolves();
			this.oRta._oVersionsModel.setProperty("/displayedVersion", 1);

			this.oRta.getToolbar().fireSwitchAdaptation({
				adaptationId: "id_5678"
			});

			assert.equal(this.oEnableRestartStub.callCount, 1, "then a restart is enabled");
			assert.equal(this.oFlexStateStub.callCount, 1, "a clear and initalize of FlexState is called");
			assert.equal(this.oLoadVersionSpy.callCount, 1, "a reload for versions is triggered");
			var oLoadVersionArguments = this.oLoadVersionSpy.getCall(0).args[0];
			assert.equal(oLoadVersionArguments.control, oComp, "with the control");
			assert.equal(oLoadVersionArguments.version, "1", ", the version number");
			assert.equal(oLoadVersionArguments.adaptationId, "id_5678", ", the adaptation id number");
			assert.equal(oLoadVersionArguments.layer, this.oRta.getLayer(), "and the layer");
			assert.equal(oReloadStub.callCount, 1, "a navigation was triggered");
			assert.equal(this.oRta._oContextBasedAdaptationsModel.getProperty("/displayedAdaptation/id"), "id_5678", "then the displayed adaptation has changed");
		});

		QUnit.test("when save is enabled but all changes from stack have been removed", function(assert) {
			var oRemoveAllCommandsStub = sandbox.stub(Stack.prototype, "removeAllCommands");
			var oReloadStub = sandbox.stub(ReloadManager, "triggerReload").resolves();
			this.oRta._oVersionsModel.setProperty("/displayedVersion", 1);

			this.oRta.getToolbar().fireSwitchAdaptation({
				adaptationId: "id_5678",
				trigger: "SaveAs"
			});

			assert.equal(this.oEnableRestartStub.callCount, 1, "then a restart is enabled");
			assert.equal(oRemoveAllCommandsStub.callCount, 1, "then all commands are removed from stack");
			assert.equal(this.oFlexStateStub.callCount, 1, "a clear and initalize of FlexState is called");
			assert.equal(this.oLoadVersionSpy.callCount, 1, "a reload for versions is triggered");
			var oLoadVersionArguments = this.oLoadVersionSpy.getCall(0).args[0];
			assert.equal(oLoadVersionArguments.control, oComp, "with the control");
			assert.equal(oLoadVersionArguments.version, "1", ", the version number");
			assert.equal(oLoadVersionArguments.adaptationId, "id_5678", ", the adaptation id number");
			assert.equal(oLoadVersionArguments.layer, this.oRta.getLayer(), "and the layer");
			assert.equal(oReloadStub.callCount, 1, "a navigation was triggered");
			assert.equal(this.oRta._oContextBasedAdaptationsModel.getProperty("/displayedAdaptation/id"), "id_5678", "then the displayed adaptation has changed");
		});
	});

	QUnit.module("Given that RuntimeAuthoring gets a switch adaptation event from the toolbar in the FLP, save is enabled and a dialog fires an event", {
		beforeEach: function() {
			givenAnFLP(sandbox.stub(), {});
			this.oRta = new RuntimeAuthoring({
				rootControl: oComp
			});
			sandbox.stub(this.oRta, "canSave").returns(true);
			this.oSerializeStub = sandbox.stub(this.oRta, "_serializeToLrep").resolves();
			this.oEnableRestartStub = sandbox.stub(RuntimeAuthoring, "enableRestart");
			this.oLoadVersionStub = sandbox.stub(VersionsAPI, "loadVersionForApplication");
			this.nVersionParameter = 1;
			this.sAdaptationId = "id_1234";
			return this.oRta.start();
		},
		afterEach: function() {
			this.oRta.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when changes should be saved to prevent data loss", function(assert) {
			var fnDone = assert.async();
			var oRemoveAllCommandsStub = sandbox.stub(Stack.prototype, "removeAllCommands");
			sandbox.stub(Utils, "showMessageBox").resolves(MessageBox.Action.YES);
			this.oRta._oVersionsModel.setProperty("/displayedVersion", this.nVersionParameter);

			this.oLoadVersionStub.callsFake(function(mPropertyBag) {
				assert.equal(oRemoveAllCommandsStub.callCount, 0, "then no commands are removed from stack");
				assert.equal(mPropertyBag.version, this.nVersionParameter, "the version parameter was passed correctly");
				assert.equal(mPropertyBag.adaptationId, this.sAdaptationId, "the adaptationId parameter was passed correctly");
				assert.equal(this.oSerializeStub.callCount, 1, "the changes were saved");
				assert.strictEqual(
					this.oSerializeStub.args[0].length,
					0,
					"then '_serializeToLrep' was called without 'bCondenseAnyLayer' parameter"
				);
				fnDone();
			}.bind(this));

			this.oRta.getToolbar().fireSwitchAdaptation({
				adaptationId: this.sAdaptationId
			});
		});

		QUnit.test("when changes should not be saved", function(assert) {
			var fnDone = assert.async();
			var oRemoveAllCommandsStub = sandbox.stub(Stack.prototype, "removeAllCommands");
			sandbox.stub(Utils, "showMessageBox").resolves(MessageBox.Action.NO);
			this.oRta._oVersionsModel.setProperty("/displayedVersion", this.nVersionParameter);

			this.oLoadVersionStub.callsFake(function(mPropertyBag) {
				assert.equal(oRemoveAllCommandsStub.callCount, 1, "then all commands are removed from stack");
				assert.equal(mPropertyBag.version, this.nVersionParameter, "the version parameter was passed correct");
				assert.equal(mPropertyBag.adaptationId, this.sAdaptationId, "the adaptationId parameter was passed correctly");
				assert.equal(this.oSerializeStub.callCount, 0, "the changes were not saved");
				fnDone();
			}.bind(this));

			this.oRta.getToolbar().fireSwitchAdaptation({
				adaptationId: this.sAdaptationId
			});
		});

		QUnit.test("when cancel was called", function(assert) {
			var fnDone = assert.async();
			var oRemoveAllCommandsStub = sandbox.stub(Stack.prototype, "removeAllCommands");
			sandbox.stub(Utils, "showMessageBox").resolves(MessageBox.Action.CANCEL);

			this.oRta.getToolbar().fireSwitchAdaptation({
				adaptationId: this.sAdaptationId
			});
			setTimeout(function() {
				assert.equal(oRemoveAllCommandsStub.callCount, 0, "then no commands are removed from stack");
				assert.equal(this.oSerializeStub.callCount, 0, "the changes were not saved");
				assert.equal(this.oLoadVersionStub.callCount, 0, "the version switch was not triggered");
				fnDone();
			}.bind(this));
		});
	});

	QUnit.done(function() {
		oComp.destroy();
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
