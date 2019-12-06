/*global QUnit*/

sap.ui.define([
	"sap/base/Log",
	"sap/m/Label",
	"sap/m/Text",
	"sap/ui/core/util/reflection/JsControlTreeModifier",
	"sap/ui/core/util/reflection/XmlTreeModifier",
	"sap/ui/core/Control",
	"sap/ui/fl/apply/_internal/changes/Applier",
	"sap/ui/fl/apply/_internal/changes/FlexCustomData",
	"sap/ui/fl/apply/_internal/changes/Utils",
	"sap/ui/fl/apply/_internal/flexState/changes/DependencyHandler",
	"sap/ui/fl/changeHandler/Base",
	"sap/ui/fl/Change",
	"sap/ui/fl/FlexController",
	"sap/ui/fl/Utils",
	"sap/ui/core/UIComponent",
	"sap/ui/thirdparty/jquery",
	"sap/ui/thirdparty/sinon-4"
],
function(
	Log,
	Label,
	Text,
	JsControlTreeModifier,
	XmlTreeModifier,
	Control,
	Applier,
	FlexCustomData,
	ChangeUtils,
	DependencyHandler,
	ChangeHandlerBase,
	Change,
	FlexController,
	Utils,
	UIComponent,
	jQuery,
	sinon
) {
	"use strict";

	var sandbox = sinon.sandbox.create();

	function getInitialChangesMap(mPropertyBag) {
		mPropertyBag = mPropertyBag || {};
		return {
			mChanges: mPropertyBag.mChanges || {},
			mDependencies: mPropertyBag.mDependencies || {},
			mDependentChangesOnMe: mPropertyBag.mDependentChangesOnMe || {},
			mControlsWithDependencies: mPropertyBag.mControlsWithDependencies || {},
			aChanges: mPropertyBag.aChanges || []
		};
	}

	function getLabelChangeContent(sFileName, sSelectorId) {
		return {
			fileType: "change",
			layer: "USER",
			fileName: sFileName || "a",
			namespace: "b",
			packageName: "c",
			changeType: "labelChange",
			creation: "",
			reference: "",
			selector: {
				id: sSelectorId || "abc123",
				idIsLocal: !sSelectorId
			},
			content: {
				something: "createNewVariant"
			}
		};
	}

	QUnit.module("applyAllChangesForControl", {
		beforeEach: function() {
			this.oSelectorComponent = new UIComponent("mockComponent");
			this.oSelectorComponent.runAsOwner(function() {
				this.oControl = new Control("someId");
			}.bind(this));
			this.oFlexController = new FlexController("testScenarioComponent", "1.2.3");
			this.oApplyChangeOnControlStub = sandbox.stub(Applier, "applyChangeOnControl").callsFake(function() {
				return new Utils.FakePromise({success: true});
			});
			this.oAppComponent = {id: "appComponent"};
			sandbox.stub(Utils, "getAppComponentForControl").callThrough().withArgs(this.oControl).returns(this.oAppComponent);
		},
		afterEach: function() {
			this.oControl.destroy();
			this.oSelectorComponent.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("applyAllChangesForControl does not call anything if there is no change for the control", function(assert) {
			var oSomeOtherChange = {};

			var fnGetChangesMap = function() {
				return getInitialChangesMap({
					mChanges: {
						someOtherId: [oSomeOtherChange]
					}
				});
			};

			return Applier.applyAllChangesForControl(fnGetChangesMap, this.oAppComponent, this.oFlexController, this.oControl)

			.then(function() {
				assert.equal(this.oApplyChangeOnControlStub.callCount, 0, "no change was processed");
			}.bind(this));
		});

		QUnit.test("updates the dependencies if the change was already processed but not applied", function(assert) {
			var oChange0 = new Change(getLabelChangeContent("a"));
			oChange0.markFinished();
			var oChange1 = new Change(getLabelChangeContent("a"));
			oChange1.markFinished();

			var fnGetChangesMap = function() {
				return getInitialChangesMap({
					mChanges: {
						someId: [oChange0, oChange1]
					}
				});
			};
			var oCopyDependenciesFromInitialChangesMap = sandbox.spy(this.oFlexController._oChangePersistence, "copyDependenciesFromInitialChangesMap");

			return Applier.applyAllChangesForControl(fnGetChangesMap, this.oAppComponent, this.oFlexController, this.oControl)

			.then(function() {
				assert.equal(this.oApplyChangeOnControlStub.callCount, 2, "all four changes for the control were applied");
				assert.equal(this.oApplyChangeOnControlStub.getCall(0).args[0], oChange0, "the first change was applied first");
				assert.equal(this.oApplyChangeOnControlStub.getCall(1).args[0], oChange1, "the second change was applied second");
				assert.equal(oCopyDependenciesFromInitialChangesMap.callCount, 2, "and update dependencies was called twice");
			}.bind(this));
		});

		QUnit.test("updates change status if change was already applied (viewCache)", function(assert) {
			var oChange0 = new Change(getLabelChangeContent("a"));
			var oChange1 = new Change(getLabelChangeContent("a"));
			var fnGetChangesMap = function() {
				return getInitialChangesMap({
					mChanges: {
						someId: [oChange0, oChange1]
					}
				});
			};
			var oCopyDependenciesFromInitialChangesMap = sandbox.spy(this.oFlexController._oChangePersistence, "copyDependenciesFromInitialChangesMap");
			sandbox.stub(FlexCustomData, "hasChangeApplyFinishedCustomData").returns(true);
			var oMarkFinishedSpy0 = sandbox.spy(oChange0, "markFinished");
			var oMarkFinishedSpy1 = sandbox.spy(oChange1, "markFinished");

			return Applier.applyAllChangesForControl(fnGetChangesMap, this.oAppComponent, this.oFlexController, this.oControl)

			.then(function() {
				assert.equal(this.oApplyChangeOnControlStub.callCount, 2, "all four changes for the control were applied");
				assert.equal(this.oApplyChangeOnControlStub.getCall(0).args[0], oChange0, "the first change was applied first");
				assert.equal(this.oApplyChangeOnControlStub.getCall(1).args[0], oChange1, "the second change was applied second");
				assert.equal(oCopyDependenciesFromInitialChangesMap.callCount, 0, "and update dependencies was not called");
				assert.equal(oMarkFinishedSpy0.callCount, 1, "the status of the change got updated");
				assert.equal(oMarkFinishedSpy1.callCount, 1, "the status of the change got updated");
				assert.ok(oChange0.isApplyProcessFinished(), "the status is APPLY_FINISHED");
				assert.ok(oChange1.isApplyProcessFinished(), "the status is APPLY_FINISHED");
			}.bind(this));
		});

		QUnit.test("when applyAllChangesForControl is called with app component and a control belonging to an embedded component", function(assert) {
			var oChangeContent = getLabelChangeContent("a");
			var oChange0 = new Change(oChangeContent);
			var oChange1 = new Change(oChangeContent);
			var oChange2 = new Change(oChangeContent);
			var oChange3 = new Change(oChangeContent);
			var oSomeOtherChange = new Change(oChangeContent);

			var fnGetChangesMap = function() {
				return getInitialChangesMap({
					mChanges: {
						someId: [oChange0, oChange1, oChange2, oChange3],
						someOtherId: [oSomeOtherChange]
					}
				});
			};

			return Applier.applyAllChangesForControl(fnGetChangesMap, this.oAppComponent, this.oFlexController, this.oControl)

			.then(function() {
				assert.equal(this.oApplyChangeOnControlStub.callCount, 4, "all four changes for the control were processed");
				assert.equal(this.oApplyChangeOnControlStub.getCall(0).args[0], oChange0, "the first change was processed first");
				assert.equal(this.oApplyChangeOnControlStub.getCall(1).args[0], oChange1, "the second change was processed second");
				assert.equal(this.oApplyChangeOnControlStub.getCall(2).args[0], oChange2, "the third change was processed third");
				assert.equal(this.oApplyChangeOnControlStub.getCall(3).args[0], oChange3, "the fourth change was processed fourth");
				assert.ok(this.oApplyChangeOnControlStub.alwaysCalledWith(sinon.match.any, this.oControl, {
					modifier: sinon.match.any,
					appComponent: this.oAppComponent,
					view:sinon.match.any
				}), "then Applier.applyChangeOnControl was always called with the component responsible for the change selector");
			}.bind(this));
		});

		QUnit.test("applyAllChangesForControl dependency test 1", function(assert) {
			var oControlForm1 = new Control("form1-1");
			var oControlGroup1 = new Control("group1-1");
			var oChange0 = new Change(getLabelChangeContent("fileNameChange0"));
			var oChange1 = new Change(getLabelChangeContent("fileNameChange1"));
			var oChange2 = new Change(getLabelChangeContent("fileNameChange2"));

			var mChanges = {
				"form1-1": [oChange2, oChange1],
				"group1-1": [oChange0]
			};

			var mDependencies = {
				fileNameChange2: {
					changeObject: oChange2,
					dependencies: ["fileNameChange0", "fileNameChange1"]
				}
			};

			var mDependentChangesOnMe = {
				fileNameChange0: ["fileNameChange2"],
				fileNameChange1: ["fileNameChange2"]
			};

			var fnGetChangesMap = function() {
				return getInitialChangesMap({
					mChanges: mChanges,
					mDependencies: mDependencies,
					mDependentChangesOnMe: mDependentChangesOnMe
				});
			};

			return Applier.applyAllChangesForControl(fnGetChangesMap, this.oAppComponent, this.oFlexController, oControlGroup1)
			.then(Applier.applyAllChangesForControl.bind(Applier, fnGetChangesMap, this.oAppComponent, this.oFlexController, oControlForm1))
			.then(function() {
				assert.equal(this.oApplyChangeOnControlStub.callCount, 3, "all three changes for the control were processed");
				assert.equal(this.oApplyChangeOnControlStub.getCall(0).args[0], oChange0, "the first change was processed first");
				assert.equal(this.oApplyChangeOnControlStub.getCall(1).args[0], oChange1, "the second change was processed second");
				assert.equal(this.oApplyChangeOnControlStub.getCall(2).args[0], oChange2, "the third change was processed third");
			}.bind(this));
		});

		QUnit.test("applyAllChangesForControl dependency test 2", function(assert) {
			var oControlForm1 = new Control("form2-1");
			var oControlGroup1 = new Control("group2-1");
			var oChange1 = new Change(getLabelChangeContent("fileNameChange1"));
			var oChange2 = new Change(getLabelChangeContent("fileNameChange2"));
			var oChange3 = new Change(getLabelChangeContent("fileNameChange3"));

			var mChanges = {
				"form2-1": [oChange2, oChange1],
				"group2-1": [oChange3]
			};

			var mDependencies = {
				fileNameChange2: {
					changeObject: oChange2,
					dependencies: ["fileNameChange1"]
				}
			};

			var mDependentChangesOnMe = {
				fileNameChange1: ["fileNameChange2"]
			};

			var fnGetChangesMap = function() {
				return getInitialChangesMap({
					mChanges: mChanges,
					mDependencies: mDependencies,
					mDependentChangesOnMe: mDependentChangesOnMe
				});
			};

			return Applier.applyAllChangesForControl(fnGetChangesMap, this.oAppComponent, this.oFlexController, oControlGroup1)
			.then(Applier.applyAllChangesForControl.bind(Applier, fnGetChangesMap, this.oAppComponent, this.oFlexController, oControlForm1))

			.then(function() {
				assert.equal(this.oApplyChangeOnControlStub.callCount, 3, "all three changes for the control were processed");
				assert.equal(this.oApplyChangeOnControlStub.getCall(0).args[0], oChange3, "the third change was processed first");
				assert.equal(this.oApplyChangeOnControlStub.getCall(1).args[0], oChange1, "the first change was processed second");
				assert.equal(this.oApplyChangeOnControlStub.getCall(2).args[0], oChange2, "the second change was processed third");

				oControlForm1.destroy();
				oControlGroup1.destroy();
			}.bind(this));
		});

		function fnDependencyTest3Setup() {
			var oChange1 = new Change(getLabelChangeContent("fileNameChange1", "id1"));
			var oChange2 = new Change(getLabelChangeContent("fileNameChange2", "id2"));
			var oChange3 = new Change(getLabelChangeContent("fileNameChange3", "id3"));
			var oChange4 = new Change(getLabelChangeContent("fileNameChange4", "id4"));
			var oChange5 = new Change(getLabelChangeContent("fileNameChange5", "id5"));

			var mChanges = {
				mainform: [oChange1, oChange2, oChange4],
				ReversalReasonName: [oChange3],
				CompanyCode: [oChange5]
			};

			var mDependencies = {
				fileNameChange2: {
					changeObject: oChange2,
					dependencies: ["fileNameChange1"]
				},
				fileNameChange4: {
					changeObject: oChange4,
					dependencies: ["fileNameChange2"] //TODO: also dependency on first change?
				},
				fileNameChange5: {
					changeObject: oChange5,
					dependencies: ["fileNameChange4"]
				}
			};

			var mDependentChangesOnMe = {
				fileNameChange1: ["fileNameChange2"],
				fileNameChange2: ["fileNameChange4"],
				fileNameChange4: ["fileNameChange5"]
			};

			return getInitialChangesMap({
				mChanges: mChanges,
				mDependencies: mDependencies,
				mDependentChangesOnMe: mDependentChangesOnMe,
				aChanges: [oChange1, oChange2, oChange3, oChange4, oChange5]
			});
		}

		QUnit.test("when applyAllChangesForControl is called for three re-created controls with dependent changes processed successfully and unsuccessfully", function(assert) {
			var oAppliedControl = new Control("appliedControl"); // processed and applied on control
			var oProcessedControl = new Control("processedControl"); // processed and not applied on control
			var oNotProcessedControl = new Control("notProcessedControl"); // not processed and not applied on control
			var oAppliedChange = new Change(getLabelChangeContent("appliedChange", "appliedControl"));
			var oProcessedChange = new Change(getLabelChangeContent("processedChange", "processedControl"));
			var oNotProcessedChange = new Change(getLabelChangeContent("notProcessedChange", "notProcessedControl"));

			// mock previously processed changes, by marking them as finished
			oAppliedChange.markFinished();
			oProcessedChange.markFinished();
			oNotProcessedChange.markFinished();

			this.oFlexController._oChangePersistence._mChangesInitial = getInitialChangesMap({
				aChanges: [oAppliedChange, oProcessedChange, oNotProcessedChange],
				mChanges: {
					appliedControl: [oAppliedChange],
					processedControl: [oProcessedChange],
					notProcessedControl: [oNotProcessedChange]
				},
				mDependencies: {
					processedChange: {
						changeObject: oProcessedChange,
						dependencies: ["appliedChange"]
					},
					notProcessedChange: {
						changeObject: oNotProcessedChange,
						dependencies: ["appliedChange", "processedChange"]
					}
				},
				mDependentChangesOnMe: {
					appliedChange: ["processedChange", "notProcessedChange"]
				}
			});

			this.oFlexController._oChangePersistence._mChanges = getInitialChangesMap({
				aChanges: [oAppliedChange, oProcessedChange, oNotProcessedChange],
				mChanges: {
					appliedControl: [oAppliedChange],
					processedControl: [oProcessedChange],
					notProcessedControl: [oNotProcessedChange]
				},
				mDependencies: {},
				mDependentChangesOnMe: {}
			});

			var fnGetChangesMap = function() {
				return this.oFlexController._oChangePersistence._mChanges;
			};

			return Applier.applyAllChangesForControl(fnGetChangesMap.bind(this), {}, this.oFlexController, oAppliedControl).then(function() {
				// mock oAppliedChange applied on oAppliedControl successfully
				sandbox.stub(FlexCustomData, "hasChangeApplyFinishedCustomData")
					.callThrough()
					.withArgs(oAppliedControl, oAppliedChange, sinon.match.any)
					.returns(true);
			})
			.then(Applier.applyAllChangesForControl.bind(Applier, fnGetChangesMap.bind(this), {}, this.oFlexController, oProcessedControl))
			.then(Applier.applyAllChangesForControl.bind(Applier, fnGetChangesMap.bind(this), {}, this.oFlexController, oNotProcessedControl))
			.then(function() {
				assert.equal(this.oApplyChangeOnControlStub.callCount, 2, "then two changes were processed");
				assert.equal(this.oApplyChangeOnControlStub.getCall(0).args[0].getId(), "appliedChange", "then first change was processed");
				assert.equal(this.oApplyChangeOnControlStub.getCall(1).args[0].getId(), "processedChange", "then second change was processed");
				oAppliedControl.destroy();
				oProcessedControl.destroy();
				oNotProcessedControl.destroy();
			}.bind(this));
		});

		QUnit.test("applyAllChangesForControl dependency test 3", function(assert) {
			var oControlForm1 = new Control("mainform");
			var oControlField1 = new Control("ReversalReasonName");
			var oControlField2 = new Control("CompanyCode");

			var oDependencySetup = fnDependencyTest3Setup();
			var fnGetChangesMap = function() {
				return oDependencySetup;
			};

			this.oFlexController._oChangePersistence._mChangesInitial = jQuery.extend(true, {}, oDependencySetup);
			this.oFlexController._oChangePersistence._mChanges = oDependencySetup;
			sandbox.stub(FlexCustomData, "hasChangeApplyFinishedCustomData").returns(false);

			return Applier.applyAllChangesForControl(fnGetChangesMap, this.oAppComponent, this.oFlexController, oControlField2)
			.then(Applier.applyAllChangesForControl.bind(Applier, fnGetChangesMap, this.oAppComponent, this.oFlexController, oControlField1))
			.then(Applier.applyAllChangesForControl.bind(Applier, fnGetChangesMap, this.oAppComponent, this.oFlexController, oControlForm1))

			.then(function() {
				// as applyChangeOnControl function is stubbed we set the change status manually
				Object.keys(oDependencySetup.mChanges).forEach(function(sKey) {
					oDependencySetup.mChanges[sKey].forEach(function(oChange) {
						oChange.markFinished();
					});
				});

				assert.equal(this.oApplyChangeOnControlStub.callCount, 5, "all five changes for the control were processed");
				assert.equal(this.oApplyChangeOnControlStub.getCall(0).args[0].getId(), "fileNameChange3", "the third change was processed first");
				assert.equal(this.oApplyChangeOnControlStub.getCall(1).args[0].getId(), "fileNameChange1", "the first change was processed second");
				assert.equal(this.oApplyChangeOnControlStub.getCall(2).args[0].getId(), "fileNameChange2", "the second change was processed third");
				assert.equal(this.oApplyChangeOnControlStub.getCall(3).args[0].getId(), "fileNameChange4", "the fourth change was processed fourth");
				assert.equal(this.oApplyChangeOnControlStub.getCall(4).args[0].getId(), "fileNameChange5", "the fifth change was processed fifth");

				oControlForm1.destroy();
				oControlField1.destroy();
				oControlField2.destroy();

				oControlForm1 = new Control("mainform");
				oControlField1 = new Control("ReversalReasonName");
				oControlField2 = new Control("CompanyCode");
			}.bind(this))

			.then(Applier.applyAllChangesForControl.bind(Applier, fnGetChangesMap, this.oAppComponent, this.oFlexController, oControlField2))
			.then(Applier.applyAllChangesForControl.bind(Applier, fnGetChangesMap, this.oAppComponent, this.oFlexController, oControlField1))
			.then(Applier.applyAllChangesForControl.bind(Applier, fnGetChangesMap, this.oAppComponent, this.oFlexController, oControlForm1))

			.then(function() {
				assert.equal(this.oApplyChangeOnControlStub.callCount, 10, "all five changes for the control were processed again");
				assert.equal(this.oApplyChangeOnControlStub.getCall(5).args[0].getId(), "fileNameChange3", "the third change was processed first again");
				assert.equal(this.oApplyChangeOnControlStub.getCall(6).args[0].getId(), "fileNameChange1", "the first change was processed second again");
				assert.equal(this.oApplyChangeOnControlStub.getCall(7).args[0].getId(), "fileNameChange2", "the second change was processed third again");
				assert.equal(this.oApplyChangeOnControlStub.getCall(8).args[0].getId(), "fileNameChange4", "the fourth change was processed fourth again");
				assert.equal(this.oApplyChangeOnControlStub.getCall(9).args[0].getId(), "fileNameChange5", "the fifth change was processed fifth again");

				// cleanup
				oControlForm1.destroy();
				oControlField1.destroy();
				oControlField2.destroy();
				this.oFlexController._oChangePersistence._mChangesInitial = getInitialChangesMap();
				this.oFlexController._oChangePersistence._mChanges = getInitialChangesMap();
			}.bind(this));
		});

		QUnit.test("applyAllChangesForControl dependency test 3 - mixed changehandler (sync, async, sync, async, sync)", function(assert) {
			var oControlForm1 = new Control("mainform");
			var oControlField1 = new Control("ReversalReasonName");
			var oControlField2 = new Control("CompanyCode");

			var oDependencySetup = fnDependencyTest3Setup();
			var fnGetChangesMap = function() {
				return oDependencySetup;
			};

			this.oApplyChangeOnControlStub.restore();
			this.oApplyChangeOnControlStub = sandbox.stub(Applier, "applyChangeOnControl")
			.onCall(0).returns(Promise.resolve({success: true}))
			.onCall(1).returns(new Utils.FakePromise({success: true}))
			.onCall(2).returns(Promise.resolve({success: true}))
			.onCall(3).returns(new Utils.FakePromise({success: true}))
			.onCall(4).returns(Promise.resolve({success: true}));

			return Applier.applyAllChangesForControl(fnGetChangesMap, this.oAppComponent, this.oFlexController, oControlField2)
			.then(Applier.applyAllChangesForControl.bind(Applier, fnGetChangesMap, this.oAppComponent, this.oFlexController, oControlField1))
			.then(Applier.applyAllChangesForControl.bind(Applier, fnGetChangesMap, this.oAppComponent, this.oFlexController, oControlForm1))

			.then(function() {
				assert.equal(this.oApplyChangeOnControlStub.callCount, 5, "all five changes for the control were processed");
				assert.equal(this.oApplyChangeOnControlStub.getCall(0).args[0], oDependencySetup.mChanges.ReversalReasonName[0], "the third change was processed first");
				assert.equal(this.oApplyChangeOnControlStub.getCall(1).args[0], oDependencySetup.mChanges.mainform[0], "the first change was processed second");
				assert.equal(this.oApplyChangeOnControlStub.getCall(2).args[0], oDependencySetup.mChanges.mainform[1], "the second change was processed third");
				assert.equal(this.oApplyChangeOnControlStub.getCall(3).args[0], oDependencySetup.mChanges.mainform[2], "the fourth change was processed fourth");
				assert.equal(this.oApplyChangeOnControlStub.getCall(4).args[0], oDependencySetup.mChanges.CompanyCode[0], "the fifth change was processed fifth");

				oControlForm1.destroy();
				oControlField1.destroy();
				oControlField2.destroy();
			}.bind(this));
		});

		QUnit.test("applyAllChangesForControl dependency test 3 - mixed changehandler (async, sync, async, sync, async)", function(assert) {
			var oControlForm1 = new Control("mainform");
			var oControlField1 = new Control("ReversalReasonName");
			var oControlField2 = new Control("CompanyCode");

			var oDependencySetup = fnDependencyTest3Setup();
			var fnGetChangesMap = function() {
				return oDependencySetup;
			};

			this.oApplyChangeOnControlStub.restore();
			this.oApplyChangeOnControlStub = sandbox.stub(Applier, "applyChangeOnControl")
				.onCall(0).returns(Promise.resolve({success: true}))
				.onCall(1).returns(new Utils.FakePromise({success: true}))
				.onCall(2).returns(Promise.resolve({success: true}))
				.onCall(3).returns(new Utils.FakePromise({success: true}))
				.onCall(4).returns(Promise.resolve({success: true}));

			return Applier.applyAllChangesForControl(fnGetChangesMap, this.oAppComponent, this.oFlexController, oControlField2)
			.then(Applier.applyAllChangesForControl.bind(Applier, fnGetChangesMap, this.oAppComponent, this.oFlexController, oControlField1))
			.then(Applier.applyAllChangesForControl.bind(Applier, fnGetChangesMap, this.oAppComponent, this.oFlexController, oControlForm1))
			.then(function() {
				assert.equal(this.oApplyChangeOnControlStub.callCount, 5, "all five changes for the control were processed");
				assert.equal(this.oApplyChangeOnControlStub.getCall(0).args[0], oDependencySetup.mChanges.ReversalReasonName[0], "the third change was processed first");
				assert.equal(this.oApplyChangeOnControlStub.getCall(1).args[0], oDependencySetup.mChanges.mainform[0], "the first change was processed second");
				assert.equal(this.oApplyChangeOnControlStub.getCall(2).args[0], oDependencySetup.mChanges.mainform[1], "the second change was processed third");
				assert.equal(this.oApplyChangeOnControlStub.getCall(3).args[0], oDependencySetup.mChanges.mainform[2], "the fourth change was processed fourth");
				assert.equal(this.oApplyChangeOnControlStub.getCall(4).args[0], oDependencySetup.mChanges.CompanyCode[0], "the fifth change was processed fifth");

				oControlForm1.destroy();
				oControlField1.destroy();
				oControlField2.destroy();
			}.bind(this));
		});

		QUnit.test("applyAllChangesForControl dependency test 4", function(assert) {
			var oControlForm1 = new Control("form4");

			var oChange1 = new Change(getLabelChangeContent("fileNameChange1"));
			var oChange2 = new Change(getLabelChangeContent("fileNameChange2"));

			var mChanges = {
				form4: [oChange1, oChange2]
			};

			var mDependencies = {
				fileNameChange2: {
					changeObject: oChange2,
					dependencies: ["fileNameChange1"]
				}
			};

			var mDependentChangesOnMe = {
				fileNameChange1: ["fileNameChange2"]
			};

			var fnGetChangesMap = function() {
				return getInitialChangesMap({
					mChanges: mChanges,
					mDependencies: mDependencies,
					mDependentChangesOnMe: mDependentChangesOnMe
				});
			};

			return Applier.applyAllChangesForControl(fnGetChangesMap, this.oAppComponent, this.oFlexController, oControlForm1)

			.then(function() {
				assert.equal(this.oApplyChangeOnControlStub.callCount, 2, "all two changes for the control were processed");
				assert.equal(this.oApplyChangeOnControlStub.getCall(0).args[0], oChange1, "the first change was processed first");
				assert.equal(this.oApplyChangeOnControlStub.getCall(1).args[0], oChange2, "the second change was processed second");

				oControlForm1.destroy();
			}.bind(this));
		});

		QUnit.test("applyAllChangesForControl dependency test 5 (with controlsDependencies)", function(assert) {
			var oControlForm1 = new Control("form6-1");
			var oControlGroup1 = new Control("group6-1");

			var oChange0 = new Change(getLabelChangeContent("fileNameChange0"));
			var oChange1 = new Change(getLabelChangeContent("fileNameChange1"));
			var oChange2 = new Change(getLabelChangeContent("fileNameChange2"));

			var mChanges = {
				"form6-1": [oChange2, oChange1],
				"group6-1": [oChange0]
			};

			var mDependencies = {
				fileNameChange2: {
					changeObject: oChange2,
					dependencies: ["fileNameChange0", "fileNameChange1"],
					controlsDependencies: ["missingControl2"]
				},
				fileNameChange1: {
					changeObject: oChange1,
					dependencies: [],
					controlsDependencies: ["missingControl1"]
				}
			};

			var mDependentChangesOnMe = {
				fileNameChange0: ["fileNameChange2"],
				fileNameChange1: ["fileNameChange2"]
			};

			var fnGetChangesMap = function() {
				return getInitialChangesMap({
					mChanges: mChanges,
					mDependencies: mDependencies,
					mDependentChangesOnMe: mDependentChangesOnMe
				});
			};

			return Promise.resolve()

			.then(Applier.applyAllChangesForControl.bind(Applier, fnGetChangesMap, this.oAppComponent, this.oFlexController, oControlGroup1))
			.then(Applier.applyAllChangesForControl.bind(Applier, fnGetChangesMap, this.oAppComponent, this.oFlexController, oControlForm1))

			.then(function() {
				assert.equal(this.oApplyChangeOnControlStub.callCount, 1, "only one change was processed");

				var mChangesMap = fnGetChangesMap();
				var oMissingControl1 = new Control("missingControl1");
				DependencyHandler.processDependentQueue(mChangesMap);
				assert.equal(this.oApplyChangeOnControlStub.callCount, 2, "now two changes were processed");

				var oMissingControl2 = new Control("missingControl2");
				DependencyHandler.processDependentQueue(mChangesMap);
				assert.equal(this.oApplyChangeOnControlStub.callCount, 3, "now all changes are processed");

				oMissingControl1.destroy();
				oMissingControl2.destroy();
			}.bind(this));
		});

		QUnit.test("applyAllChangesForControl dependency test 6 - with broken changes", function(assert) {
			var oControlGroup1 = new Control("group7-1");

			var oChange0 = new Change(getLabelChangeContent("fileNameChange0"));
			var oChange1 = new Change(getLabelChangeContent("fileNameChange1"));
			var oChange2 = new Change(getLabelChangeContent("fileNameChange2"));

			var mChanges = {
				"group7-1": [oChange0, oChange1, oChange2]
			};

			var mDependencies = {
				fileNameChange1: {
					changeObject: oChange1,
					dependencies: ["fileNameChange0"]
				},
				fileNameChange2: {
					changeObject: oChange2,
					dependencies: ["fileNameChange1"]
				}
			};

			var mDependentChangesOnMe = {
				fileNameChange0: ["fileNameChange1"],
				fileNameChange1: ["fileNameChange2"]
			};

			var fnGetChangesMap = function() {
				return getInitialChangesMap({
					mChanges: mChanges,
					mDependencies: mDependencies,
					mDependentChangesOnMe: mDependentChangesOnMe
				});
			};

			sandbox.restore();
			this.oApplyChangeOnControlStub = sandbox.stub(Applier, "applyChangeOnControl")
				.onFirstCall().callsFake(function() {
					return new Utils.FakePromise({success: false, error: new Error("testError")});
				})
				.onSecondCall().callsFake(function() {
					return new Utils.FakePromise({success: false, error: new Error("testError")});
				})
				.callsFake(function() {
					return new Utils.FakePromise({success: true});
				});

			return Applier.applyAllChangesForControl(fnGetChangesMap, this.oAppComponent, this.oFlexController, oControlGroup1)

			.then(function() {
				assert.equal(this.oApplyChangeOnControlStub.callCount, 3, "three changes were processed");
				assert.equal(this.oApplyChangeOnControlStub.getCall(0).args[0], oChange0, "the first change was processed first");
				assert.equal(this.oApplyChangeOnControlStub.getCall(1).args[0], oChange1, "the second change was processed second");
				assert.equal(this.oApplyChangeOnControlStub.getCall(2).args[0], oChange2, "the third change was processed third");
			}.bind(this));
		});

		QUnit.test("applyAllChangesForControl dependency test - with dependent controls without changes that get rendered later", function(assert) {
			var oProcessDependentQueueSpy = sandbox.spy(DependencyHandler, "processDependentQueue");
			this.oRandomControl = new Control("randomId");
			var oChange0 = new Change(getLabelChangeContent("fileNameChange0"));

			var mChanges = {
				someId: [oChange0]
			};

			var mDependencies = {
				fileNameChange0: {
					changeObject: oChange0,
					dependencies: [],
					controlsDependencies: ["anotherId"]
				}
			};

			var fnGetChangesMap = function() {
				return getInitialChangesMap({
					mChanges: mChanges,
					mDependencies: mDependencies,
					mDependentChangesOnMe: {},
					mControlsWithDependencies: {
						anotherId: true
					}
				});
			};

			return Applier.applyAllChangesForControl(fnGetChangesMap, this.oAppComponent, this.oFlexController, this.oControl)
			.then(function() {
				assert.equal(this.oApplyChangeOnControlStub.callCount, 0, "the change was not applied yet");
				assert.equal(oProcessDependentQueueSpy.callCount, 1, "the dependent changes queue was updated");

				this.oLaterRenderedControl = new Control("anotherId");
				return Applier.applyAllChangesForControl(fnGetChangesMap, this.oAppComponent, this.oFlexController, this.oLaterRenderedControl);
			}.bind(this))
			.then(function() {
				assert.equal(oProcessDependentQueueSpy.callCount, 3, "the dependent changes queue was updated again");
				assert.equal(this.oApplyChangeOnControlStub.callCount, 1, "the change was applied");

				return Applier.applyAllChangesForControl(fnGetChangesMap, this.oAppComponent, this.oFlexController, this.oRandomControl);
			}.bind(this))
			.then(function() {
				assert.equal(oProcessDependentQueueSpy.callCount, 3, "the dependent changes queue was not updated again");

				this.oLaterRenderedControl.destroy();
				this.oRandomControl.destroy();
			}.bind(this));
		});
	});

	QUnit.module("[JS] applyChangeOnControl", {
		beforeEach: function() {
			var sLabelId = "label";
			var oLabelChangeContent = getLabelChangeContent("a", sLabelId);
			this.oControl = new Label(sLabelId);
			this.oChange = new Change(oLabelChangeContent);

			this.oErrorStub = sandbox.stub(Log, "error");
			this.oAddAppliedCustomDataSpy = sandbox.spy(FlexCustomData, "addAppliedCustomData");
			this.oChangeHandlerApplyChangeStub = sandbox.stub();
			sandbox.stub(ChangeUtils, "getChangeHandler").resolves({
				applyChange: this.oChangeHandlerApplyChangeStub,
				revertChange: function() {},
				completeChangeContent: function() {}
			});
			this.mPropertyBag = {
				modifier: JsControlTreeModifier,
				appComponent: {}
			};
		},
		afterEach: function() {
			this.oControl.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("returns true promise value when change is already applied", function(assert) {
			this.oChange.markFinished();

			return Applier.applyChangeOnControl(this.oChange, this.oControl, this.mPropertyBag).then(function(oReturn) {
				assert.ok(oReturn.success, "the promise returns a true value");
			});
		});

		QUnit.test("returns a resolving promise when no change handler can be found", function(assert) {
			var oError = Error("no change handler");
			ChangeUtils.getChangeHandler.restore();
			sandbox.stub(ChangeUtils, "getChangeHandler").rejects(oError);

			return Applier.applyChangeOnControl(this.oChange, this.oControl, this.mPropertyBag).then(function(oReturn) {
				assert.equal(oReturn.success, false, "the promise returns false as result");
				assert.ok(oReturn.error, oError, "the error object was passed");
			});
		});

		QUnit.test("does not call the changeHandler if the change is currently being applied and succeeds", function(assert) {
			var fnDelayedPromise = new Promise(function(fnResolve) {
				setTimeout(function() {
					fnResolve();
				}, 0);
			});
			this.oChangeHandlerApplyChangeStub.returns(fnDelayedPromise);

			var oFirstPromise = Applier.applyChangeOnControl(this.oChange, this.oControl, this.mPropertyBag);
			var oSecondPromise = Applier.applyChangeOnControl(this.oChange, this.oControl, this.mPropertyBag);
			return Promise.all([oFirstPromise, oSecondPromise]).then(function(aReturn) {
				assert.equal(aReturn[0].success, true, "the first promise returns success=true");
				assert.equal(aReturn[1].success, true, "the second promise returns success=true");
				assert.equal(this.oChangeHandlerApplyChangeStub.callCount, 1, "the change handler was only called once");
			}.bind(this));
		});

		QUnit.test("does not call the changeHandler if the change is currently being applied and fails", function(assert) {
			var fnDelayedPromise = new Promise(function(fnResolve, fnReject) {
				setTimeout(function() {
					fnReject(new Error("foo"));
				}, 0);
			});
			this.oChangeHandlerApplyChangeStub.returns(fnDelayedPromise);

			var oFirstPromise = Applier.applyChangeOnControl(this.oChange, this.oControl, this.mPropertyBag);
			var oSecondPromise = Applier.applyChangeOnControl(this.oChange, this.oControl, this.mPropertyBag);
			return Promise.all([oFirstPromise, oSecondPromise]).then(function(aReturn) {
				assert.equal(this.oErrorStub.callCount, 1, "an Error was logged");
				assert.ok(this.oErrorStub.lastCall.args[0].indexOf("could not be applied. Merge error detected while processing the JS control tree.") > -1, "the error message is correct");
				assert.equal(aReturn[0].success, false, "the promise returns success=false");
				assert.equal(aReturn[1].success, false, "the promise returns success=false");
				assert.ok(aReturn[0].error, "the first promise has an error object");
				assert.equal(aReturn[0].error.message, "foo", "the error object is correct");
				assert.ok(aReturn[1].error, "the second promise has an error object");
				assert.equal(aReturn[1].error.message, "foo", "the error object is correct");
				assert.equal(this.oChangeHandlerApplyChangeStub.callCount, 1, "the change handler was only called once");
			}.bind(this));
		});

		QUnit.test("when the control is refreshed with the same id as the previous control during change application", function(assert) {
			this.oChangeHandlerApplyChangeStub.callsFake(function() {
				var sId = this.oControl.getId();
				this.oControl.destroy();
				this.oControl = new Text(sId);
				return this.oControl;
			}.bind(this));

			return Applier.applyChangeOnControl(this.oChange, this.oControl, this.mPropertyBag).then(function() {
				assert.ok(FlexCustomData.hasChangeApplyFinishedCustomData(this.oControl, this.oChange, JsControlTreeModifier), "the change is applied");
				assert.ok(this.oControl instanceof Text, "then the refreshed control was initialized in changeHandler.applyChange()");
			}.bind(this));
		});

		QUnit.test("adds custom data on the first async change applied on a control", function(assert) {
			this.oChangeHandlerApplyChangeStub.callsFake(function() {
				this.oChange.setRevertData({foo: "bar"});
				return Promise.resolve();
			}.bind(this));

			return Applier.applyChangeOnControl(this.oChange, this.oControl, this.mPropertyBag).then(function() {
				assert.equal(this.oChangeHandlerApplyChangeStub.callCount, 1, "the change was applied");
				assert.equal(this.oAddAppliedCustomDataSpy.callCount, 1, "the customData was written");
			}.bind(this));
		});

		QUnit.test("does not add appliedChanges custom data if an exception was raised in change handler", function(assert) {
			this.oChangeHandlerApplyChangeStub.rejects(new Error("myError"));
			var oMarkFinishedSpy = sandbox.spy(this.oChange, "markFinished");

			return Applier.applyChangeOnControl(this.oChange, this.oControl, this.mPropertyBag).then(function(oResult) {
				assert.equal(this.oErrorStub.callCount, 1, "an Error was logged");
				assert.ok(this.oErrorStub.lastCall.args[0].indexOf("could not be applied. Merge error detected while processing the JS control tree.") > -1, "the error message is correct");
				assert.notOk(oResult.success, "success in the return object is set to false");
				assert.equal(oResult.error.message, "myError");
				assert.ok(this.oChangeHandlerApplyChangeStub.calledOnce, "apply change functionality was called");
				assert.equal(this.oAddAppliedCustomDataSpy.callCount, 0, "the customData was not added");
				assert.equal(oMarkFinishedSpy.callCount, 1, "the change was marked as finished");
			}.bind(this));
		});

		QUnit.test("when change handler throws a not-Applicable exception", function(assert) {
			var oAddFailedCustomDataStub = sandbox.stub(FlexCustomData, "addFailedCustomData");
			var sNotApplicableMessage1 = "myNotApplicableMessage1";
			this.oChangeHandlerApplyChangeStub.onFirstCall().callsFake(function() {
				return ChangeHandlerBase.markAsNotApplicable(sNotApplicableMessage1, true /* asyncronous return */);
			});

			return Applier.applyChangeOnControl(this.oChange, this.oControl, this.mPropertyBag).then(function(oResult) {
				assert.equal(oAddFailedCustomDataStub.callCount, 1, "failed custom data was added");
				assert.notOk(oResult.success, "success in the return object is set to false");
				assert.equal(oResult.error.message, sNotApplicableMessage1);
				assert.ok(this.oChangeHandlerApplyChangeStub.calledOnce, "apply change functionality was called");
			}.bind(this));
		});
	});

	QUnit.module("[XML] applyChangeOnControl", {
		beforeEach: function() {
			var sLabelId = "labelId";
			this.oChange = new Change(getLabelChangeContent("fileName", sLabelId));

			this.oAddAppliedCustomDataStub = sandbox.stub(FlexCustomData, "addAppliedCustomData");
			this.oAddFailedCustomDataStub = sandbox.stub(FlexCustomData, "addFailedCustomData");
			this.oChangeHandlerApplyChangeStub = sandbox.stub();
			sandbox.stub(ChangeUtils, "getChangeHandler").resolves({
				applyChange: this.oChangeHandlerApplyChangeStub,
				revertChange: function() {},
				completeChangeContent: function() {}
			});
			this.oXmlString =
				'<mvc:View id="testComponent---myView" xmlns:mvc="sap.ui.core.mvc" xmlns="sap.m">' +
					'<Label id="' + sLabelId + '" />' +
				'</mvc:View>';
			var oDOMParser = new DOMParser();
			var oView = oDOMParser.parseFromString(this.oXmlString, "application/xml").documentElement;
			this.oControl = oView.childNodes[0];
			this.mPropertyBag = {
				modifier: XmlTreeModifier,
				view: oView
			};
		},
		afterEach: function() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("does nothing if 'jsOnly' is set on the change", function(assert) {
			this.oChange.getDefinition().jsOnly = true;
			var oSetInitialStub = sandbox.stub(this.oChange, "setInitialApplyState");

			return Applier.applyChangeOnControl(this.oChange, this.oControl, this.mPropertyBag).then(function(vReturn) {
				assert.equal(vReturn.error.message, "Change cannot be applied in XML. Retrying in JS.", "the function returns success: false and an error as parameter");
				assert.notOk(vReturn.success, "the function returns success: false and an error as parameter");
				assert.equal(oSetInitialStub.callCount, 1, "the setInitialApplyState function was called");
				assert.equal(this.oChangeHandlerApplyChangeStub.callCount, 0, "the changeHandler was not called");
				assert.equal(this.oAddAppliedCustomDataStub.callCount, 0, "the custom data was not added");
			}.bind(this));
		});

		QUnit.test("adds custom data on the first change applied on a control", function(assert) {
			this.oChangeHandlerApplyChangeStub.callsFake(function() {
				this.oChange.setRevertData({foo: "bar"});
			}.bind(this));

			return Applier.applyChangeOnControl(this.oChange, this.oControl, this.mPropertyBag).then(function() {
				assert.ok(this.oChangeHandlerApplyChangeStub.calledOnce, "the change was applied");
				assert.equal(this.oAddAppliedCustomDataStub.callCount, 1, "custom data was added");
				assert.ok(this.oAddAppliedCustomDataStub.lastCall.args[3], "the last parameter is true ('bSaveRevertData')");
			}.bind(this));
		});

		QUnit.test("adds failedCustomData if the applying of the change fails", function(assert) {
			this.oChangeHandlerApplyChangeStub.throws();
			var oSetInitialStub = sandbox.stub(this.oChange, "setInitialApplyState");

			return Applier.applyChangeOnControl(this.oChange, this.oControl, this.mPropertyBag).then(function() {
				assert.ok(this.oChangeHandlerApplyChangeStub.calledOnce, "apply change functionality was called");
				assert.equal(oSetInitialStub.callCount, 1, "the setInitialApplyState function was called");
				assert.equal(this.oAddFailedCustomDataStub.callCount, 1, "custom data was added");
			}.bind(this));
		});

		QUnit.test("does not call the change handler if the change was already applied", function(assert) {
			this.oChange.markFinished();

			return Applier.applyChangeOnControl(this.oChange, this.oControl, this.mPropertyBag).then(function() {
				assert.equal(this.oChangeHandlerApplyChangeStub.callCount, 0, "the change handler was not called again");
			}.bind(this));
		});

		QUnit.test("with asynchronous changeHandler stub for a label", function(assert) {
			this.oChange.setRevertData({foo: "bar"});

			this.oChangeHandlerApplyChangeStub.resolves(true);
			return Applier.applyChangeOnControl(this.oChange, this.oControl, this.mPropertyBag).then(function() {
				assert.ok(this.oChangeHandlerApplyChangeStub.calledOnce, "the change was applied");
				assert.equal(this.oAddAppliedCustomDataStub.callCount, 1, "custom data was added");
			}.bind(this));
		});
	});

	QUnit.module("[XML] applyAllChangesForXMLView", {
		beforeEach: function() {
			this.oControl = new Control("existingId");
			this.oChange = new Change(getLabelChangeContent("fileName", "labelId"));
			var oDOMParser = new DOMParser();
			var oXmlString =
				'<mvc:View id="testComponent---myView" xmlns:mvc="sap.ui.core.mvc" xmlns="sap.m">' +
					'<Label id="labelId" />' +
				'</mvc:View>';
			var oView = oDOMParser.parseFromString(oXmlString, "application/xml").documentElement;
			this.oXmlLabel = oView.childNodes[0];
			this.oApplyChangeOnControlStub = sandbox.stub(Applier, "applyChangeOnControl");
			this.oWarningStub = sandbox.stub(Log, "warning");
			this.mPropertyBag = {
				modifier: XmlTreeModifier,
				view: oView
			};
		},
		afterEach: function() {
			sandbox.restore();
			this.oControl.destroy();
		}
	}, function() {
		QUnit.test("when change can be applied", function(assert) {
			this.oApplyChangeOnControlStub.resolves({success: true});

			return Applier.applyAllChangesForXMLView(this.mPropertyBag, [this.oChange]).then(function(oResult) {
				assert.equal(this.oApplyChangeOnControlStub.callCount, 1, "the change handler was called");
				assert.deepEqual(oResult, this.mPropertyBag.view, "the view was returned");
			}.bind(this));
		});

		QUnit.test("logs an error if no changes were passed", function(assert) {
			var oErrorStub = sandbox.stub(Log, "error");

			Applier.applyAllChangesForXMLView(this.mPropertyBag, "thisIsNoArray").then(function() {
				assert.equal(oErrorStub.callCount, 1, "a error was logged");
			});
		});

		QUnit.test("logs an error if dependent selectors are missing", function(assert) {
			var oDependentSelectorSelector = {
				id: "dependent-selector-id",
				idIsLocal: false
			};
			sandbox.stub(this.oChange, "getDependentControlSelectorList").returns([oDependentSelectorSelector]);

			Applier.applyAllChangesForXMLView(this.mPropertyBag, [this.oChange]).then(function() {
				assert.equal(this.oWarningStub.callCount, 1, "an ApplyChangeError was logged");
				assert.ok(this.oWarningStub.lastCall.args[0].indexOf("A dependent selector control of the flexibility change is not available.") > -1, "an ApplyChangeError was logged");
			}.bind(this));
		});

		QUnit.test("logs error when the change has no selector", function(assert) {
			var oChange = new Change({
				selector: {}
			});

			return Applier.applyAllChangesForXMLView(this.mPropertyBag, [oChange]).then(function() {
				assert.equal(this.oWarningStub.callCount, 1, "one error was logged");
				assert.ok(this.oWarningStub.lastCall.args[0].indexOf("No selector in change found or no selector ID.") > -1, "an ApplyChangeError was logged");
			}.bind(this));
		});

		QUnit.test("logs error when the control is not available", function(assert) {
			var oChange = new Change({
				selector: {
					id: "abc",
					local: false
				}
			});

			return Applier.applyAllChangesForXMLView(this.mPropertyBag, [oChange]).then(function() {
				assert.equal(this.oWarningStub.callCount, 1, "one error was logged");
				assert.ok(this.oWarningStub.lastCall.args[0].indexOf("A flexibility change tries to change a nonexistent control.") > -1, "an ApplyChangeError was logged");
			}.bind(this));
		});

		QUnit.test("continues the processing if an error occurs before change applying", function(assert) {
			var oChange1 = new Change({
				selector: {}
			});
			this.oApplyChangeOnControlStub.resolves({success: true});

			return Applier.applyAllChangesForXMLView(this.mPropertyBag, [oChange1, this.oChange]).then(function() {
				assert.equal(this.oApplyChangeOnControlStub.callCount, 1, "one change was processed");
				assert.equal(this.oWarningStub.callCount, 1, "one error was logged");
			}.bind(this));
		});

		QUnit.test("continues the processing if an error occurs during change applying", function(assert) {
			var oChange2 = new Change(getLabelChangeContent("fileName", "labelId"));
			this.oApplyChangeOnControlStub.resolves({success: false});

			return Applier.applyAllChangesForXMLView(this.mPropertyBag, [this.oChange, oChange2]).then(function() {
				assert.equal(this.oApplyChangeOnControlStub.callCount, 2, "all changes were processed");
				assert.equal(this.oWarningStub.callCount, 2, "the issues were logged");
			}.bind(this));
		});

		QUnit.test("updates change status if change was already applied (viewCache)", function(assert) {
			this.oApplyChangeOnControlStub.resolves({success: true});
			sandbox.stub(FlexCustomData, "hasChangeApplyFinishedCustomData").returns(true);
			var oMarkFinishedSpy = sandbox.spy(this.oChange, "markFinished");

			return Applier.applyAllChangesForXMLView(this.mPropertyBag, [this.oChange]).then(function() {
				assert.equal(this.oApplyChangeOnControlStub.callCount, 0, "no change was processed");
				assert.equal(this.oWarningStub.callCount, 0, "no issues were logged");
				assert.equal(oMarkFinishedSpy.callCount, 1, "the change was set to finished");
			}.bind(this));
		});

		QUnit.test("resets change status if change is not applied anymore", function(assert) {
			this.oApplyChangeOnControlStub.resolves({success: true});
			sandbox.stub(FlexCustomData, "hasChangeApplyFinishedCustomData").returns(false);
			this.oChange.markFinished();
			var oSetInitialStateStub = sandbox.stub(this.oChange, "setInitialApplyState");
			var oCheckDependencyStub = sandbox.stub(ChangeUtils, "checkIfDependencyIsStillValid");

			return Applier.applyAllChangesForXMLView(this.mPropertyBag, [this.oChange]).then(function() {
				assert.equal(this.oApplyChangeOnControlStub.callCount, 0, "no change was processed");
				assert.equal(this.oWarningStub.callCount, 0, "no issues were logged");
				assert.equal(oSetInitialStateStub.callCount, 1, "the change was set to finished");
				assert.equal(oCheckDependencyStub.callCount, 0, "dependencies are not checked because it's XML processing");
			}.bind(this));
		});

		QUnit.test("processes the changes in the correct order", function(assert) {
			var oChange1 = new Change(getLabelChangeContent("a"));
			var oChange2 = new Change(getLabelChangeContent("a2"));
			var oChange3 = new Change(getLabelChangeContent("a3"));

			sandbox.stub(XmlTreeModifier, "bySelector").withArgs(sinon.match.defined).returns(this.oXmlLabel);
			sandbox.stub(XmlTreeModifier, "getControlType").returns("aType");
			this.oApplyChangeOnControlStub.resolves({success: true});

			return Applier.applyAllChangesForXMLView(this.mPropertyBag, [oChange1, oChange2, oChange3]).then(function() {
				assert.equal(this.oApplyChangeOnControlStub.callCount, 3, "the change handler was called 3 times");
				assert.equal(this.oApplyChangeOnControlStub.firstCall.args[0].getId(), "a", "the first change was aplied first");
				assert.equal(this.oApplyChangeOnControlStub.secondCall.args[0].getId(), "a2", "the second change was applied second");
				assert.equal(this.oApplyChangeOnControlStub.thirdCall.args[0].getId(), "a3", "the third change was applied third");
			}.bind(this));
		});
	});

	QUnit.done(function() {
		jQuery("#qunit-fixture").hide();
	});
});
