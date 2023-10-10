/* global QUnit */

sap.ui.define([
	"qunit/RtaQunitUtils",
	"sap/m/MessageBox",
	"sap/ui/fl/apply/_internal/flexState/FlexState",
	"sap/ui/fl/write/api/ContextBasedAdaptationsAPI",
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
	FlexState,
	ContextBasedAdaptationsAPI,
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
			getServiceAsync() {
				return Promise.resolve({
					toExternal() {},
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

	QUnit.module("Given that RuntimeAuthoring gets a switch adaptation event from the toolbar in the FLP", {
		beforeEach() {
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
			var oAdaptationsModel = ContextBasedAdaptationsAPI.createModel(aAdaptations, aAdaptations[0], true);

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
			sandbox.stub(ContextBasedAdaptationsAPI, "getAdaptationsModel").returns(oAdaptationsModel);
			return this.oRta.start().then(function() {
				this.oRta._oContextBasedAdaptationsModel = oAdaptationsModel;
			}.bind(this));
		},
		afterEach() {
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
			return new Promise(function(resolve) {
				setTimeout(resolve, 0);
			})
			.then(function() {
				assert.equal(this.oEnableRestartStub.callCount, 1, "then a restart is enabled");
				assert.equal(this.oLoadVersionSpy.callCount, 1, "a reload for versions is triggered");
				var oLoadVersionArguments = this.oLoadVersionSpy.getCall(0).args[0];
				assert.equal(oLoadVersionArguments.control, oComp, "with the control");
				assert.equal(oLoadVersionArguments.version, "1", ", the version number");
				assert.equal(oLoadVersionArguments.adaptationId, "id_5678", ", the adaptation id number");
				assert.equal(oLoadVersionArguments.layer, this.oRta.getLayer(), "and the layer");
				assert.equal(oReloadStub.callCount, 1, "a navigation was triggered");
				assert.equal(this.oRta._oContextBasedAdaptationsModel.getProperty("/displayedAdaptation/id"), "id_5678", "then the displayed adaptation has changed");
			}.bind(this));
		});

		QUnit.test("when save is enabled but all changes from stack have been removed", function(assert) {
			var oRemoveAllCommandsStub = sandbox.stub(Stack.prototype, "removeAllCommands");
			var oReloadStub = sandbox.stub(ReloadManager, "triggerReload").resolves();
			this.oRta._oVersionsModel.setProperty("/displayedVersion", 1);

			this.oRta.getToolbar().fireSwitchAdaptation({
				adaptationId: "id_5678",
				trigger: "SaveAs"
			});
			return new Promise(function(resolve) {
				setTimeout(resolve, 0);
			})
			.then(function() {
				assert.equal(this.oEnableRestartStub.callCount, 1, "then a restart is enabled");
				assert.equal(oRemoveAllCommandsStub.callCount, 1, "then all commands are removed from stack");
				assert.equal(this.oLoadVersionSpy.callCount, 1, "a reload for versions is triggered");
				var oLoadVersionArguments = this.oLoadVersionSpy.getCall(0).args[0];
				assert.equal(oLoadVersionArguments.control, oComp, "with the control");
				assert.equal(oLoadVersionArguments.version, "1", ", the version number");
				assert.equal(oLoadVersionArguments.adaptationId, "id_5678", ", the adaptation id number");
				assert.equal(oLoadVersionArguments.layer, this.oRta.getLayer(), "and the layer");
				assert.equal(oReloadStub.callCount, 1, "a navigation was triggered");
				assert.equal(this.oRta._oContextBasedAdaptationsModel.getProperty("/displayedAdaptation/id"), "id_5678", "then the displayed adaptation has changed");
			}.bind(this));
		});
	});

	QUnit.module("Given that RuntimeAuthoring gets a switch adaptation event from the toolbar in the FLP, save is enabled and a dialog fires an event", {
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
			this.sAdaptationId = "id_1234";
			return this.oRta.start();
		},
		afterEach() {
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

	QUnit.module("Given that RuntimeAuthoring gets a delete adaptation event from the toolbar in the FLP", {
		beforeEach() {
			ContextBasedAdaptationsAPI.clearInstances();
			givenAnFLP(sandbox.stub(), {});
			this.oRta = new RuntimeAuthoring({
				rootControl: oComp
			});

			ContextBasedAdaptationsAPI.clearInstances();
			var oDefaultAdaptation = {
				id: "DEFAULT",
				title: "",
				type: "DEFAULT"
			};
			this.aAdaptations = [
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
			var oAdaptationsModel = ContextBasedAdaptationsAPI.createModel(this.aAdaptations, this.aAdaptations[0], true);

			this.oRemoveAllCommandsSpy = sandbox.spy(this.oRta.getCommandStack(), "removeAllCommands");
			this.oEnableRestartStub = sandbox.stub(RuntimeAuthoring, "enableRestart");
			this.oLoadVersionStub = sandbox.stub(VersionsAPI, "loadVersionForApplication").resolves();
			this.oRemoveStub = sandbox.stub(ContextBasedAdaptationsAPI, "remove").resolves();
			this.nVersionParameter = 1;
			this.sAdaptationId = "id_5678";
			return this.oRta.start().then(function() {
				this.oRta._oContextBasedAdaptationsModel = oAdaptationsModel;
			}.bind(this));
		},
		afterEach() {
			this.oRta.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when save is enabled and dirty changes should be deleted with adaptation", function(assert) {
			var fnDone = assert.async();
			sandbox.stub(this.oRta, "canSave").returns(true);
			sandbox.stub(Utils, "showMessageBox").resolves(MessageBox.Action.OK);
			this.oRta._oVersionsModel.setProperty("/displayedVersion", this.nVersionParameter);

			this.oLoadVersionStub.callsFake(function(mPropertyBag) {
				assert.equal(mPropertyBag.version, this.nVersionParameter, "the version parameter was passed correct");
				assert.equal(mPropertyBag.adaptationId, this.sAdaptationId, "the adaptationId parameter was passed correctly");
				assert.equal(this.oRemoveStub.callCount, 1, "delete adaptation request was send");
				assert.equal(this.oRemoveAllCommandsSpy.callCount, 1, "the command stack was cleared");
				var oExptectedAdaptations = [
					{
						title: "Manager",
						rank: 1,
						id: "id_5678"
					}
				];
				assert.deepEqual(this.oRta._oContextBasedAdaptationsModel.getProperty("/adaptations"), oExptectedAdaptations, "only 1 adaptation left");
				fnDone();
			}.bind(this));

			assert.equal(this.oRta._oContextBasedAdaptationsModel.getProperty("/allAdaptations"), this.aAdaptations, "no adaptation was deleted yet");
			this.oRta.getToolbar().fireDeleteAdaptation();
		});

		QUnit.test("when save is enabled and delete is canceled", function(assert) {
			var fnDone = assert.async();
			sandbox.stub(this.oRta, "canSave").returns(true);
			sandbox.stub(Utils, "showMessageBox").resolves(MessageBox.Action.CANCEL);
			this.oRta._oVersionsModel.setProperty("/displayedVersion", this.nVersionParameter);
			this.oRta._oContextBasedAdaptationsModel.setProperty("/displayedAdaptation", {id: this.sAdaptationId});

			this.oRta.getToolbar().fireDeleteAdaptation();

			setTimeout(function() {
				assert.equal(this.oRemoveStub.callCount, 0, "delete adaptation request was send");
				assert.equal(this.oRemoveAllCommandsSpy.callCount, 0, "the command stack was not cleared");
				assert.deepEqual(this.oRta._oContextBasedAdaptationsModel.getProperty("/allAdaptations"), this.aAdaptations, "no adaptation was deleted");
				fnDone();
			}.bind(this));
		});

		QUnit.test("when save is disabled and adaptation should be deleted", function(assert) {
			var fnDone = assert.async();
			sandbox.stub(this.oRta, "canSave").returns(false);
			sandbox.stub(Utils, "showMessageBox").resolves(MessageBox.Action.OK);
			this.oRta._oVersionsModel.setProperty("/displayedVersion", this.nVersionParameter);

			this.oLoadVersionStub.callsFake(function(mPropertyBag) {
				assert.equal(mPropertyBag.version, this.nVersionParameter, "the version parameter was passed correct");
				assert.equal(mPropertyBag.adaptationId, this.sAdaptationId, "the adaptationId parameter was passed correctly");
				assert.equal(this.oRemoveStub.callCount, 1, "delete adaptation request was send");
				assert.equal(this.oRemoveAllCommandsSpy.callCount, 0, "the command stack was not cleared");
				var oExptectedAdaptations = [
					{
						title: "Manager",
						rank: 1,
						id: "id_5678"
					}
				];
				assert.deepEqual(this.oRta._oContextBasedAdaptationsModel.getProperty("/adaptations"), oExptectedAdaptations, "only 1 adaptation left");
				fnDone();
			}.bind(this));

			assert.equal(this.oRta._oContextBasedAdaptationsModel.getProperty("/allAdaptations"), this.aAdaptations, "no adaptation was deleted yet");
			this.oRta.getToolbar().fireDeleteAdaptation();
		});

		QUnit.test("when save is disabled and delete is canceled", function(assert) {
			var fnDone = assert.async();
			sandbox.stub(this.oRta, "canSave").returns(false);
			sandbox.stub(Utils, "showMessageBox").resolves(MessageBox.Action.CANCEL);
			this.oRta._oVersionsModel.setProperty("/displayedVersion", this.nVersionParameter);
			this.oRta._oContextBasedAdaptationsModel.setProperty("/displayedAdaptation", {id: this.sAdaptationId});

			this.oRta.getToolbar().fireDeleteAdaptation();

			setTimeout(function() {
				assert.equal(this.oRemoveStub.callCount, 0, "delete adaptation request was send");
				assert.equal(this.oRemoveAllCommandsSpy.callCount, 0, "the command stack not cleared");
				assert.deepEqual(this.oRta._oContextBasedAdaptationsModel.getProperty("/allAdaptations"), this.aAdaptations, "no adaptation was deleted");
				fnDone();
			}.bind(this));
		});
	});

	QUnit.done(function() {
		oComp.destroy();
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
