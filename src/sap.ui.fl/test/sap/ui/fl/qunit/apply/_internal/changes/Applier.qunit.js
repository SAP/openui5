/* global QUnit */

sap.ui.define([
	"sap/base/util/merge",
	"sap/base/Log",
	"sap/m/HBox",
	"sap/m/Label",
	"sap/m/Text",
	"sap/m/Toolbar",
	"sap/ui/core/util/reflection/JsControlTreeModifier",
	"sap/ui/core/util/reflection/XmlTreeModifier",
	"sap/ui/core/Control",
	"sap/ui/core/UIComponent",
	"sap/ui/fl/apply/_internal/changes/Applier",
	"sap/ui/fl/apply/_internal/changes/FlexCustomData",
	"sap/ui/fl/apply/_internal/changes/Utils",
	"sap/ui/fl/apply/_internal/flexState/changes/DependencyHandler",
	"sap/ui/fl/apply/_internal/flexState/FlexObjectState",
	"sap/ui/fl/apply/_internal/flexState/FlexState",
	"sap/ui/fl/apply/_internal/flexState/ManifestUtils",
	"sap/ui/fl/apply/_internal/flexObjects/FlexObjectFactory",
	"sap/ui/fl/changeHandler/Base",
	"sap/ui/fl/Layer",
	"sap/ui/fl/Utils",
	"sap/ui/thirdparty/sinon-4",
	"test-resources/sap/ui/fl/qunit/FlQUnitUtils"
], function(
	merge,
	Log,
	HBox,
	Label,
	Text,
	Toolbar,
	JsControlTreeModifier,
	XmlTreeModifier,
	Control,
	UIComponent,
	Applier,
	FlexCustomData,
	ChangeUtils,
	DependencyHandler,
	FlexObjectState,
	FlexState,
	ManifestUtils,
	FlexObjectFactory,
	ChangeHandlerBase,
	Layer,
	FlUtils,
	sinon,
	FlQUnitUtils
) {
	"use strict";

	const sandbox = sinon.createSandbox();
	const sControlId = "controlId";
	const oAppComponent = {
		getId: () => "AppComponent"
	};

	function getInitialDependencyMap(mPropertyBag) {
		return merge(DependencyHandler.createEmptyDependencyMap(), mPropertyBag);
	}

	function getLabelChangeContent(sFileName, sSelectorId) {
		return {
			fileType: "change",
			layer: Layer.USER,
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
		async beforeEach() {
			this.oSelectorComponent = new UIComponent("mockComponent");
			this.oSelectorComponent.runAsOwner(function() {
				this.oControl = new Control("someId");
				this.oAnotherControl = new Control("someOtherId");
			}.bind(this));
			this.oApplyChangeOnControlStub = sandbox.stub(Applier, "applyChangeOnControl").callsFake(function() {
				return Promise.resolve({success: true});
			});
			this.oAppComponent = new UIComponent("appComponent");
			sandbox.stub(FlUtils, "getAppComponentForControl").callThrough().withArgs(this.oControl).returns(this.oAppComponent);
			await FlQUnitUtils.initializeFlexStateWithData(sandbox, "testScenarioComponent");
		},
		afterEach() {
			this.oControl.destroy();
			this.oAnotherControl.destroy();
			this.oSelectorComponent.destroy();
			this.oAppComponent.destroy();
			FlexState.clearState("testScenarioComponent");
			sandbox.restore();
		}
	}, function() {
		QUnit.test("applyAllChangesForControl does not call anything if there is no change for the control", function(assert) {
			const oSomeOtherChange = {};

			sandbox.stub(FlexObjectState, "getLiveDependencyMap").returns(getInitialDependencyMap({
				mChanges: {
					someOtherId: [oSomeOtherChange]
				}
			}));

			return Applier.applyAllChangesForControl(this.oAppComponent, "DummyFlexReference", this.oControl)

			.then(function() {
				assert.strictEqual(this.oApplyChangeOnControlStub.callCount, 0, "no change was processed");
			}.bind(this));
		});

		QUnit.test("updates the dependencies if the change was already processed but not applied", function(assert) {
			const oChange0 = FlexObjectFactory.createFromFileContent(getLabelChangeContent("a"));
			oChange0.markFinished();
			const oChange1 = FlexObjectFactory.createFromFileContent(getLabelChangeContent("a"));
			oChange1.markFinished();

			sandbox.stub(FlexObjectState, "getLiveDependencyMap").returns(getInitialDependencyMap({
				mChanges: {
					someId: [oChange0, oChange1]
				}
			}));

			const copyDependenciesFromCompleteDependencyMap = sandbox.spy(FlexObjectState, "copyDependenciesFromCompleteDependencyMap");

			let fnResolve;
			Applier.addPreConditionForInitialChangeApplying(new Promise(function(resolve) {
				fnResolve = resolve;
			}));

			const oReturnPromise = Applier.applyAllChangesForControl(this.oAppComponent, "DummyFlexReference", this.oControl);

			assert.strictEqual(this.oApplyChangeOnControlStub.callCount, 0, "no change for the control was applied yet");
			fnResolve();
			return oReturnPromise.then(function() {
				assert.strictEqual(copyDependenciesFromCompleteDependencyMap.callCount, 2, "and update dependencies was called twice");
				assert.strictEqual(this.oApplyChangeOnControlStub.callCount, 2, "all two changes for the control were applied");
				assert.strictEqual(this.oApplyChangeOnControlStub.getCall(0).args[0], oChange0, "the first change was applied first");
				assert.strictEqual(this.oApplyChangeOnControlStub.getCall(1).args[0], oChange1, "the second change was applied second");
			}.bind(this));
		});

		QUnit.test("synchronously add the changes to the queue", function(assert) {
			this.oApplyChangeOnControlStub.restore();
			this.oApplyChangeOnControlStub = sandbox.stub(Applier, "applyChangeOnControl").resolves({success: true});
			const oChange0 = FlexObjectFactory.createFromFileContent(getLabelChangeContent("a"));
			const oSetQueuedForApplySpy = sandbox.spy(oChange0, "setQueuedForApply");
			sandbox.stub(FlexObjectState, "getLiveDependencyMap").returns(getInitialDependencyMap({
				mChanges: {
					someId: [oChange0]
				}
			}));

			const oPromise = Applier.applyAllChangesForControl(this.oAppComponent, "DummyFlexReference", this.oControl);
			return oPromise.then(function() {
				assert.ok(oSetQueuedForApplySpy.calledOnce, "the change was queued for apply");
				assert.strictEqual(this.oApplyChangeOnControlStub.callCount, 1, "the change was applied");
			}.bind(this));
		});

		QUnit.test("does not add to queue and apply the changes to the queue if _ignoreOnce is set", function(assert) {
			this.oApplyChangeOnControlStub.restore();
			this.oApplyChangeOnControlStub = sandbox.stub(Applier, "applyChangeOnControl").resolves({success: true});
			const oChange0 = FlexObjectFactory.createFromFileContent(getLabelChangeContent("a"));
			oChange0._ignoreOnce = true;
			sandbox.stub(FlexObjectState, "getLiveDependencyMap").returns(getInitialDependencyMap({
				mChanges: {
					someId: [oChange0]
				}
			}));

			const oPromise = Applier.applyAllChangesForControl(this.oAppComponent, "DummyFlexReference", this.oControl);
			assert.notOk(oChange0.isQueuedForApply(), "the change is not queued for apply");
			return oPromise.then(function() {
				assert.strictEqual(this.oApplyChangeOnControlStub.callCount, 0, "the change was not applied");
			}.bind(this));
		});

		QUnit.test("updates change status if change was already applied (viewCache)", function(assert) {
			const oRevertData = {foo: "bar"};
			const oChange0 = FlexObjectFactory.createFromFileContent(getLabelChangeContent("a"));
			const oChange1 = FlexObjectFactory.createFromFileContent(getLabelChangeContent("a"));
			sandbox.stub(FlexObjectState, "getLiveDependencyMap").returns(getInitialDependencyMap({
				mChanges: {
					someId: [oChange0, oChange1]
				}
			}));

			const copyDependenciesFromCompleteDependencyMap = sandbox.spy(FlexObjectState, "copyDependenciesFromCompleteDependencyMap");
			sandbox.stub(FlexCustomData, "getAppliedCustomDataValue").returns(true);
			sandbox.stub(FlexCustomData, "hasChangeApplyFinishedCustomData").returns(true);
			sandbox.stub(FlexCustomData, "getParsedRevertDataFromCustomData").returns(oRevertData);
			const oMarkFinishedSpy0 = sandbox.spy(oChange0, "markFinished");
			const oMarkFinishedSpy1 = sandbox.spy(oChange1, "markFinished");

			return Applier.applyAllChangesForControl(this.oAppComponent, "DummyFlexReference", this.oControl)

			.then(function() {
				assert.strictEqual(this.oApplyChangeOnControlStub.callCount, 0, "the changes were not applied again");
				assert.strictEqual(copyDependenciesFromCompleteDependencyMap.callCount, 0, "and update dependencies was not called");
				assert.strictEqual(oMarkFinishedSpy0.callCount, 1, "the status of the change got updated");
				assert.strictEqual(oMarkFinishedSpy1.callCount, 1, "the status of the change got updated");
				assert.ok(oChange0.isSuccessfullyApplied(), "the status is APPLY_SUCCESSFUL");
				assert.ok(oChange1.isSuccessfullyApplied(), "the status is APPLY_SUCCESSFUL");
				assert.deepEqual(oChange0.getRevertData(), oRevertData, "the revert data is saved in the change");
				assert.deepEqual(oChange1.getRevertData(), oRevertData, "the revert data is saved in the change");
			}.bind(this));
		});

		QUnit.test("updates change status if change was already applied (viewCache) and control template is affected", function(assert) {
			const oRevertData = {foo: "bar"};
			const oChange0 = FlexObjectFactory.createFromFileContent(getLabelChangeContent("a"));
			const oChange1 = FlexObjectFactory.createFromFileContent(getLabelChangeContent("a"));
			sandbox.stub(FlexObjectState, "getLiveDependencyMap").returns(getInitialDependencyMap({
				mChanges: {
					someId: [oChange0, oChange1]
				}
			}));
			const copyDependenciesFromCompleteDependencyMap = sandbox.spy(FlexObjectState, "copyDependenciesFromCompleteDependencyMap");
			sandbox.stub(FlexCustomData, "getAppliedCustomDataValue")
			.withArgs(this.oAnotherControl)
			.returns(true);
			sandbox.stub(FlexCustomData, "hasChangeApplyFinishedCustomData")
			.withArgs(this.oAnotherControl)
			.returns(true);
			sandbox.stub(FlexCustomData, "getParsedRevertDataFromCustomData")
			.withArgs(this.oAnotherControl)
			.returns(oRevertData);
			sandbox.stub(ChangeUtils, "getControlIfTemplateAffected").returns({
				bTemplateAffected: true,
				control: this.oAnotherControl,
				originalControl: this.oControl,
				controlType: "myControlType"
			});
			const oMarkFinishedSpy0 = sandbox.spy(oChange0, "markFinished");
			const oMarkFinishedSpy1 = sandbox.spy(oChange1, "markFinished");

			return Applier.applyAllChangesForControl(this.oAppComponent, "DummyFlexReference", this.oControl)

			.then(function() {
				assert.strictEqual(this.oApplyChangeOnControlStub.callCount, 0, "the changes were not applied again");
				assert.strictEqual(copyDependenciesFromCompleteDependencyMap.callCount, 0, "and update dependencies was not called");
				assert.strictEqual(oMarkFinishedSpy0.callCount, 1, "the status of the change got updated");
				assert.strictEqual(oMarkFinishedSpy1.callCount, 1, "the status of the change got updated");
				assert.ok(oChange0.isSuccessfullyApplied(), "the status is APPLY_SUCCESSFUL");
				assert.ok(oChange1.isSuccessfullyApplied(), "the status is APPLY_SUCCESSFUL");
				assert.deepEqual(oChange0.getRevertData(), oRevertData, "the revert data is saved in the change");
				assert.deepEqual(oChange1.getRevertData(), oRevertData, "the revert data is saved in the change");
			}.bind(this));
		});

		QUnit.test("does not crash if control is in template and not available", function(assert) {
			const oGetControlStub = sandbox.stub(ChangeUtils, "getControlIfTemplateAffected").returns({
				bTemplateAffected: true,
				control: undefined,
				originalControl: this.oControl
			});
			const oHasCustomDataSpy = sandbox.spy(FlexCustomData, "hasChangeApplyFinishedCustomData");
			const oGetCustomDataSpy = sandbox.spy(FlexCustomData, "getAppliedCustomDataValue");
			sandbox.stub(FlexObjectState, "getLiveDependencyMap").returns(getInitialDependencyMap({
				mChanges: {
					someId: [FlexObjectFactory.createFromFileContent(getLabelChangeContent("a"))]
				}
			}));
			return Applier.applyAllChangesForControl(this.oAppComponent, "DummyFlexReference", this.oControl)

			.then(function() {
				assert.strictEqual(oGetControlStub.callCount, 1, "the control is evaluated");
				assert.strictEqual(oHasCustomDataSpy.callCount, 0, "the custom data are not fetched");
				assert.strictEqual(oGetCustomDataSpy.callCount, 0, "the custom data are not fetched");
			});
		});

		QUnit.test("updates change status if change is not applicable (viewCache)", function(assert) {
			const oChange = FlexObjectFactory.createFromFileContent(getLabelChangeContent("a"));
			sandbox.stub(FlexObjectState, "getLiveDependencyMap").returns(getInitialDependencyMap({
				mChanges: {
					someId: [oChange]
				}
			}));
			const oSetRevertDataSpy = sandbox.spy(oChange, "setRevertData");

			return FlexCustomData.addFailedCustomData(
				this.oControl,
				oChange,
				{
					modifier: JsControlTreeModifier,
					appComponent: this.oAppComponent
				},
				FlexCustomData.notApplicableChangesCustomDataKey
			)
			.then(function() {
				return Applier.applyAllChangesForControl(this.oAppComponent, "DummyFlexReference", this.oControl)
				.then(function() {
					assert.ok(oChange.hasApplyProcessFailed(), "the status is APPLY_FAILED");
					assert.ok(oSetRevertDataSpy.notCalled, "then no revert data is set on the unapplied change");
				});
			}.bind(this));
		});

		QUnit.test("when applyAllChangesForControl is called with app component and a control belonging to an embedded component", function(assert) {
			const oChangeContent = getLabelChangeContent("a");
			const oChange0 = FlexObjectFactory.createFromFileContent(oChangeContent);
			const oChange1 = FlexObjectFactory.createFromFileContent(oChangeContent);
			const oChange2 = FlexObjectFactory.createFromFileContent(oChangeContent);
			const oChange3 = FlexObjectFactory.createFromFileContent(oChangeContent);
			const oSomeOtherChange = FlexObjectFactory.createFromFileContent(oChangeContent);

			sandbox.stub(FlexObjectState, "getLiveDependencyMap").returns(getInitialDependencyMap({
				mChanges: {
					someId: [oChange0, oChange1, oChange2, oChange3],
					someOtherId: [oSomeOtherChange]
				}
			}));

			return Applier.applyAllChangesForControl(this.oAppComponent, "DummyFlexReference", this.oControl)

			.then(function() {
				assert.strictEqual(this.oApplyChangeOnControlStub.callCount, 4, "all four changes for the control were processed");
				assert.strictEqual(this.oApplyChangeOnControlStub.getCall(0).args[0], oChange0, "the first change was processed first");
				assert.strictEqual(this.oApplyChangeOnControlStub.getCall(1).args[0], oChange1, "the second change was processed second");
				assert.strictEqual(this.oApplyChangeOnControlStub.getCall(2).args[0], oChange2, "the third change was processed third");
				assert.strictEqual(this.oApplyChangeOnControlStub.getCall(3).args[0], oChange3, "the fourth change was processed fourth");
				assert.ok(this.oApplyChangeOnControlStub.alwaysCalledWith(sinon.match.any, this.oControl, {
					modifier: sinon.match.any,
					appComponent: this.oAppComponent,
					view: sinon.match.any
				}), "then Applier.applyChangeOnControl was always called with the component responsible for the change selector");
			}.bind(this));
		});

		QUnit.test("applyAllChangesForControl dependency test 1", function(assert) {
			const oControlForm1 = new Control("form1-1");
			const oControlGroup1 = new Control("group1-1");
			const oChange0 = FlexObjectFactory.createFromFileContent(getLabelChangeContent("fileNameChange0"));
			const oChange1 = FlexObjectFactory.createFromFileContent(getLabelChangeContent("fileNameChange1"));
			const oChange2 = FlexObjectFactory.createFromFileContent(getLabelChangeContent("fileNameChange2"));

			sandbox.stub(FlexObjectState, "getLiveDependencyMap").returns(getInitialDependencyMap({
				mChanges: {
					"form1-1": [oChange2, oChange1],
					"group1-1": [oChange0]
				},
				mDependencies: {
					fileNameChange2: {
						changeObject: oChange2,
						dependencies: ["fileNameChange0", "fileNameChange1"]
					}
				},
				mDependentChangesOnMe: {
					fileNameChange0: ["fileNameChange2"],
					fileNameChange1: ["fileNameChange2"]
				}
			}));

			return Applier.applyAllChangesForControl(this.oAppComponent, "DummyFlexReference", oControlGroup1)
			.then(Applier.applyAllChangesForControl.bind(Applier, this.oAppComponent, "DummyFlexReference", oControlForm1))
			.then(function() {
				assert.strictEqual(this.oApplyChangeOnControlStub.callCount, 3, "all three changes for the control were processed");
				assert.strictEqual(this.oApplyChangeOnControlStub.getCall(0).args[0], oChange0, "the first change was processed first");
				assert.strictEqual(this.oApplyChangeOnControlStub.getCall(1).args[0], oChange1, "the second change was processed second");
				assert.strictEqual(this.oApplyChangeOnControlStub.getCall(2).args[0], oChange2, "the third change was processed third");
			}.bind(this));
		});

		QUnit.test("applyAllChangesForControl dependency test 2", function(assert) {
			const oControlForm1 = new Control("form2-1");
			const oControlGroup1 = new Control("group2-1");
			const oChange1 = FlexObjectFactory.createFromFileContent(getLabelChangeContent("fileNameChange1"));
			const oChange2 = FlexObjectFactory.createFromFileContent(getLabelChangeContent("fileNameChange2"));
			const oChange3 = FlexObjectFactory.createFromFileContent(getLabelChangeContent("fileNameChange3"));

			sandbox.stub(FlexObjectState, "getLiveDependencyMap").returns(getInitialDependencyMap({
				mChanges: {
					"form2-1": [oChange2, oChange1],
					"group2-1": [oChange3]
				},
				mDependencies: {
					fileNameChange2: {
						changeObject: oChange2,
						dependencies: ["fileNameChange1"]
					}
				},
				mDependentChangesOnMe: {
					fileNameChange1: ["fileNameChange2"]
				}
			}));

			return Applier.applyAllChangesForControl(this.oAppComponent, "DummyFlexReference", oControlGroup1)
			.then(Applier.applyAllChangesForControl.bind(Applier, this.oAppComponent, "DummyFlexReference", oControlForm1))

			.then(function() {
				assert.strictEqual(this.oApplyChangeOnControlStub.callCount, 3, "all three changes for the control were processed");
				assert.strictEqual(this.oApplyChangeOnControlStub.getCall(0).args[0], oChange3, "the third change was processed first");
				assert.strictEqual(this.oApplyChangeOnControlStub.getCall(1).args[0], oChange1, "the first change was processed second");
				assert.strictEqual(this.oApplyChangeOnControlStub.getCall(2).args[0], oChange2, "the second change was processed third");

				oControlForm1.destroy();
				oControlGroup1.destroy();
			}.bind(this));
		});

		function fnDependencyTest3Setup() {
			const oChange1 = FlexObjectFactory.createFromFileContent(getLabelChangeContent("fileNameChange1", "id1"));
			const oChange2 = FlexObjectFactory.createFromFileContent(getLabelChangeContent("fileNameChange2", "id2"));
			const oChange3 = FlexObjectFactory.createFromFileContent(getLabelChangeContent("fileNameChange3", "id3"));
			const oChange4 = FlexObjectFactory.createFromFileContent(getLabelChangeContent("fileNameChange4", "id4"));
			const oChange5 = FlexObjectFactory.createFromFileContent(getLabelChangeContent("fileNameChange5", "id5"));

			return getInitialDependencyMap({
				mChanges: {
					mainform: [oChange1, oChange2, oChange4],
					ReversalReasonName: [oChange3],
					CompanyCode: [oChange5]
				},
				mDependencies: {
					fileNameChange2: {
						changeObject: oChange2,
						dependencies: ["fileNameChange1"],
						controlsDependencies: []
					},
					fileNameChange4: {
						changeObject: oChange4,
						dependencies: ["fileNameChange2"],
						controlsDependencies: []
					},
					fileNameChange5: {
						changeObject: oChange5,
						dependencies: ["fileNameChange4"],
						controlsDependencies: []
					}
				},
				mDependentChangesOnMe: {
					fileNameChange1: ["fileNameChange2"],
					fileNameChange2: ["fileNameChange4"],
					fileNameChange4: ["fileNameChange5"]
				}
			});
		}

		QUnit.test("when applyAllChangesForControl is called for three re-created controls with dependent changes processed successfully and unsuccessfully", function(assert) {
			const oAppliedControl = new Control("appliedControl"); // processed and applied on control
			const oProcessedControl = new Control("processedControl"); // processed and not applied on control
			const oNotProcessedControl = new Control("notProcessedControl"); // not processed and not applied on control
			const oAppliedChange = FlexObjectFactory.createFromFileContent(getLabelChangeContent("appliedChange", "appliedControl"));
			const oProcessedChange = FlexObjectFactory.createFromFileContent(getLabelChangeContent("processedChange", "processedControl"));
			const oNotProcessedChange = FlexObjectFactory.createFromFileContent(
				getLabelChangeContent("notProcessedChange", "notProcessedControl")
			);

			// mock previously processed changes, by marking them as finished
			oAppliedChange.markFinished();
			oProcessedChange.markFinished();
			oNotProcessedChange.markFinished();

			sandbox.stub(FlexObjectState, "getCompleteDependencyMap").returns(getInitialDependencyMap({
				aChanges: [oAppliedChange, oProcessedChange, oNotProcessedChange],
				mChanges: {
					appliedControl: [oAppliedChange],
					processedControl: [oProcessedChange],
					notProcessedControl: [oNotProcessedChange]
				},
				mDependencies: {
					processedChange: {
						changeObject: oProcessedChange,
						dependencies: ["appliedChange"],
						controlsDependencies: []
					},
					notProcessedChange: {
						changeObject: oNotProcessedChange,
						dependencies: ["appliedChange", "processedChange"],
						controlsDependencies: []
					}
				},
				mDependentChangesOnMe: {
					appliedChange: ["processedChange", "notProcessedChange"]
				}
			}));

			sandbox.stub(FlexObjectState, "getLiveDependencyMap").returns(getInitialDependencyMap({
				aChanges: [oAppliedChange, oProcessedChange, oNotProcessedChange],
				mChanges: {
					appliedControl: [oAppliedChange],
					processedControl: [oProcessedChange],
					notProcessedControl: [oNotProcessedChange]
				},
				mDependencies: {},
				mDependentChangesOnMe: {}
			}));

			return Applier.applyAllChangesForControl({}, "DummyFlexReference", oAppliedControl)
			.then(function() {
				// mock oAppliedChange applied on oAppliedControl successfully
				sandbox.stub(FlexCustomData, "hasChangeApplyFinishedCustomData")
				.callThrough()
				.withArgs(oAppliedControl, oAppliedChange)
				.returns(true);
			})
			.then(Applier.applyAllChangesForControl.bind(Applier, {}, "DummyFlexReference", oProcessedControl))
			.then(Applier.applyAllChangesForControl.bind(Applier, {}, "DummyFlexReference", oNotProcessedControl))
			.then(function() {
				assert.strictEqual(this.oApplyChangeOnControlStub.callCount, 2, "then two changes were processed");
				assert.strictEqual(this.oApplyChangeOnControlStub.getCall(0).args[0].getId(), "appliedChange", "then first change was processed");
				assert.strictEqual(
					this.oApplyChangeOnControlStub.getCall(1).args[0].getId(),
					"processedChange",
					"then second change was processed"
				);
				oAppliedControl.destroy();
				oProcessedControl.destroy();
				oNotProcessedControl.destroy();
			}.bind(this));
		});

		QUnit.test("applyAllChangesForControl dependency test 3", function(assert) {
			let oControlForm1 = new Control("mainform");
			let oControlField1 = new Control("ReversalReasonName");
			let oControlField2 = new Control("CompanyCode");

			const oDependencySetup = fnDependencyTest3Setup();
			sandbox.stub(FlexObjectState, "getLiveDependencyMap").returns(oDependencySetup);
			sandbox.stub(FlexObjectState, "getCompleteDependencyMap").returns(merge({}, oDependencySetup));

			sandbox.stub(FlexCustomData, "hasChangeApplyFinishedCustomData").returns(false);

			return Applier.applyAllChangesForControl(this.oAppComponent, "FlexDummyReference", oControlField2)
			.then(Applier.applyAllChangesForControl.bind(Applier, this.oAppComponent, "FlexDummyReference", oControlField1))
			.then(Applier.applyAllChangesForControl.bind(Applier, this.oAppComponent, "FlexDummyReference", oControlForm1))

			.then(function() {
				// as applyChangeOnControl function is stubbed we set the change status manually
				Object.keys(oDependencySetup.mChanges).forEach(function(sKey) {
					oDependencySetup.mChanges[sKey].forEach(function(oChange) {
						oChange.markFinished();
					});
				});

				assert.strictEqual(this.oApplyChangeOnControlStub.callCount, 5, "all five changes for the control were processed");
				assert.strictEqual(
					this.oApplyChangeOnControlStub.getCall(0).args[0].getId(),
					"fileNameChange3",
					"the third change was processed first"
				);
				assert.strictEqual(
					this.oApplyChangeOnControlStub.getCall(1).args[0].getId(),
					"fileNameChange1",
					"the first change was processed second"
				);
				assert.strictEqual(
					this.oApplyChangeOnControlStub.getCall(2).args[0].getId(),
					"fileNameChange2",
					"the second change was processed third"
				);
				assert.strictEqual(
					this.oApplyChangeOnControlStub.getCall(3).args[0].getId(),
					"fileNameChange4",
					"the fourth change was processed fourth"
				);
				assert.strictEqual(
					this.oApplyChangeOnControlStub.getCall(4).args[0].getId(),
					"fileNameChange5",
					"the fifth change was processed fifth"
				);

				oControlForm1.destroy();
				oControlField1.destroy();
				oControlField2.destroy();

				oControlForm1 = new Control("mainform");
				oControlField1 = new Control("ReversalReasonName");
				oControlField2 = new Control("CompanyCode");
			}.bind(this))

			.then(Applier.applyAllChangesForControl.bind(Applier, this.oAppComponent, "DummyFlexReference", oControlField2))
			.then(Applier.applyAllChangesForControl.bind(Applier, this.oAppComponent, "DummyFlexReference", oControlField1))
			.then(Applier.applyAllChangesForControl.bind(Applier, this.oAppComponent, "DummyFlexReference", oControlForm1))

			.then(function() {
				assert.strictEqual(this.oApplyChangeOnControlStub.callCount, 10, "all five changes for the control were processed again");
				assert.strictEqual(
					this.oApplyChangeOnControlStub.getCall(5).args[0].getId(),
					"fileNameChange3",
					"the third change was processed first again"
				);
				assert.strictEqual(
					this.oApplyChangeOnControlStub.getCall(6).args[0].getId(),
					"fileNameChange1",
					"the first change was processed second again"
				);
				assert.strictEqual(
					this.oApplyChangeOnControlStub.getCall(7).args[0].getId(),
					"fileNameChange2",
					"the second change was processed third again"
				);
				assert.strictEqual(
					this.oApplyChangeOnControlStub.getCall(8).args[0].getId(),
					"fileNameChange4",
					"the fourth change was processed fourth again"
				);
				assert.strictEqual(
					this.oApplyChangeOnControlStub.getCall(9).args[0].getId(),
					"fileNameChange5",
					"the fifth change was processed fifth again"
				);

				// cleanup
				oControlForm1.destroy();
				oControlField1.destroy();
				oControlField2.destroy();
			}.bind(this));
		});

		QUnit.test("applyAllChangesForControl dependency test 4", function(assert) {
			const oControlForm1 = new Control("form4");

			const oChange1 = FlexObjectFactory.createFromFileContent(getLabelChangeContent("fileNameChange1"));
			const oChange2 = FlexObjectFactory.createFromFileContent(getLabelChangeContent("fileNameChange2"));

			const mChanges = {
				form4: [oChange1, oChange2]
			};

			const mDependencies = {
				fileNameChange2: {
					changeObject: oChange2,
					dependencies: ["fileNameChange1"]
				}
			};

			const mDependentChangesOnMe = {
				fileNameChange1: ["fileNameChange2"]
			};

			sandbox.stub(FlexObjectState, "getLiveDependencyMap").returns(getInitialDependencyMap({
				mChanges,
				mDependencies,
				mDependentChangesOnMe
			}));

			return Applier.applyAllChangesForControl(this.oAppComponent, "DummyFlexReference", oControlForm1)

			.then(function() {
				assert.strictEqual(this.oApplyChangeOnControlStub.callCount, 2, "all two changes for the control were processed");
				assert.strictEqual(this.oApplyChangeOnControlStub.getCall(0).args[0], oChange1, "the first change was processed first");
				assert.strictEqual(this.oApplyChangeOnControlStub.getCall(1).args[0], oChange2, "the second change was processed second");

				oControlForm1.destroy();
			}.bind(this));
		});

		QUnit.test("applyAllChangesForControl dependency test 5 (with controlsDependencies)", function(assert) {
			const oControlForm1 = new Control("form6-1");
			const oControlGroup1 = new Control("group6-1");

			const oChange0 = FlexObjectFactory.createFromFileContent(getLabelChangeContent("fileNameChange0"));
			const oChange1 = FlexObjectFactory.createFromFileContent(getLabelChangeContent("fileNameChange1"));
			const oChange2 = FlexObjectFactory.createFromFileContent(getLabelChangeContent("fileNameChange2"));

			const mDependencyMap = getInitialDependencyMap({
				mChanges: {
					"form6-1": [oChange2, oChange1],
					"group6-1": [oChange0]
				},
				mDependencies: {
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
				},
				mDependentChangesOnMe: {
					fileNameChange0: ["fileNameChange2"],
					fileNameChange1: ["fileNameChange2"]
				},
				mControlsWithDependencies: {
					missingControl1: ["fileNameChange1"],
					missingControl2: ["fileNameChange2"]
				}
			});

			sandbox.stub(FlexObjectState, "getLiveDependencyMap").returns(mDependencyMap);

			return Promise.resolve()
			.then(Applier.applyAllChangesForControl.bind(Applier, this.oAppComponent, "DummyFlexReference", oControlGroup1))
			.then(Applier.applyAllChangesForControl.bind(Applier, this.oAppComponent, "DummyFlexReference", oControlForm1))

			.then(function() {
				assert.strictEqual(this.oApplyChangeOnControlStub.callCount, 1, "only one change was processed");

				this.oMissingControl1 = new Control("missingControl1");
				return Applier.applyAllChangesForControl(this.oAppComponent, "DummyFlexReference", this.oMissingControl1);
			}.bind(this))
			.then(function() {
				assert.strictEqual(this.oApplyChangeOnControlStub.callCount, 2, "now two changes were processed");

				this.oMissingControl2 = new Control("missingControl2");
				return Applier.applyAllChangesForControl(this.oAppComponent, "DummyFlexReference", this.oMissingControl2);
			}.bind(this))
			.then(function() {
				assert.strictEqual(this.oApplyChangeOnControlStub.callCount, 3, "now all changes are processed");

				this.oMissingControl1.destroy();
				this.oMissingControl2.destroy();
			}.bind(this));
		});

		QUnit.test("applyAllChangesForControl dependency test - with dependent controls without changes that get rendered later", function(assert) {
			const oProcessDependentQueueSpy = sandbox.spy(DependencyHandler, "processDependentQueue");
			const oRandomControl = new Control("randomId");
			const oChange0 = FlexObjectFactory.createFromFileContent(getLabelChangeContent("fileNameChange0"));

			const mDependencyMap = getInitialDependencyMap({
				mChanges: {
					someId: [oChange0]
				},
				mDependencies: {
					fileNameChange0: {
						changeObject: oChange0,
						dependencies: [],
						controlsDependencies: ["anotherId"]
					}
				},
				mControlsWithDependencies: {
					anotherId: ["fileNameChange0"]
				}
			});

			sandbox.stub(FlexObjectState, "getLiveDependencyMap").returns(mDependencyMap);

			return Applier.applyAllChangesForControl(this.oAppComponent, "DummyFlexReference", this.oControl)
			.then(function() {
				assert.strictEqual(this.oApplyChangeOnControlStub.callCount, 0, "the change was not applied yet");
				assert.strictEqual(oProcessDependentQueueSpy.callCount, 1, "the dependent changes queue was updated");

				this.oLaterRenderedControl = new Control("anotherId");
				return Applier.applyAllChangesForControl(this.oAppComponent, "DummyFlexReference", this.oLaterRenderedControl);
			}.bind(this))
			.then(function() {
				assert.strictEqual(oProcessDependentQueueSpy.callCount, 3, "the dependent changes queue was updated again");
				assert.strictEqual(this.oApplyChangeOnControlStub.callCount, 1, "the change was applied");

				return Applier.applyAllChangesForControl(this.oAppComponent, "DummyFlexReference", oRandomControl);
			}.bind(this))
			.then(function() {
				// assert.strictEqual(oProcessDependentQueueSpy.callCount, 3, "the dependent changes queue was not updated again");

				this.oLaterRenderedControl.destroy();
				oRandomControl.destroy();
			}.bind(this));
		});

		QUnit.test("applyAllChangesForControl with to be adjusted template changes - 1", function(assert) {
			const oOriginalTemplateControl = new Control("originalTemplate");
			const oActualTemplateControl = new Control("actualTemplate");
			const oChange0 = FlexObjectFactory.createFromFileContent(getLabelChangeContent("a"));
			const oChange0Content = oChange0.getContent();
			oChange0Content.boundAggregation = "boundAggregationName";
			oChange0.setContent(oChange0Content);
			const oGetBindingInfoStub = sandbox.stub(this.oControl, "getBindingInfo").returns({
				template: oActualTemplateControl
			});
			oChange0.originalSelectorToBeAdjusted = {
				id: oOriginalTemplateControl.getId(),
				idIsLocal: false
			};

			sandbox.stub(FlexObjectState, "getLiveDependencyMap").returns(getInitialDependencyMap({
				mChanges: {
					someId: [oChange0]
				}
			}));

			return Applier.applyAllChangesForControl(this.oAppComponent, "DummyFlexReference", this.oControl).then(function() {
				const oOriginalSelector = oChange0.getDependentControl(
					"originalSelector",
					{modifier: JsControlTreeModifier, appComponent: this.oAppComponent}
				);
				assert.strictEqual(oOriginalSelector.getId(), "actualTemplate", "the originalSelector was set to the correct template");
				assert.ok(oGetBindingInfoStub.calledWith("boundAggregationName"), "the template from the correct aggregation was used");

				[oActualTemplateControl, oOriginalTemplateControl].forEach(function(oControl) {
					oControl.destroy();
				});
			}.bind(this));
		});

		QUnit.test("applyAllChangesForControl with to be adjusted template changes - 2", function(assert) {
			const oOriginalControlInTemplate = new Control("originalTemplate");
			const oOrigInnerToolbar = new Toolbar("origInnerToolbar", {
				content: [new Control(), oOriginalControlInTemplate, new Control()]
			});
			const oOriginalTemplate = new HBox("origOuterHBox", {
				items: [new Control(), new Control(), oOrigInnerToolbar, new Control()]
			});

			const oActualControlInTemplate = new Control("actualTemplate");
			const oActualInnerToolbar = new Toolbar("actualInnerToolbar", {
				content: [new Control(), oActualControlInTemplate, new Control()]
			});
			const oActualTemplate = new HBox("actualOuterHBox", {
				items: [new Control(), new Control(), oActualInnerToolbar, new Control()]
			});

			const oChange0 = FlexObjectFactory.createFromFileContent(getLabelChangeContent("a"));
			const oChange0Content = oChange0.getContent();
			oChange0Content.boundAggregation = "boundAggregationName";
			oChange0.setContent(oChange0Content);
			const oGetBindingInfoStub = sandbox.stub(this.oControl, "getBindingInfo").returns({
				template: oActualTemplate
			});
			oChange0.originalSelectorToBeAdjusted = {
				id: oOriginalControlInTemplate.getId(),
				idIsLocal: false
			};
			sandbox.stub(FlexObjectState, "getLiveDependencyMap").returns(getInitialDependencyMap({
				mChanges: {
					someId: [oChange0]
				}
			}));

			return Applier.applyAllChangesForControl(this.oAppComponent, "DummyFlexReference", this.oControl).then(function() {
				const oOriginalSelector = oChange0.getDependentControl(
					"originalSelector",
					{modifier: JsControlTreeModifier, appComponent: this.oAppComponent}
				);
				assert.strictEqual(oOriginalSelector.getId(), "actualTemplate", "the originalSelector was set to the correct template");
				assert.ok(oGetBindingInfoStub.calledWith("boundAggregationName"), "the template from the correct aggregation was used");

				[oOriginalTemplate, oActualTemplate].forEach(function(oControl) {
					oControl.destroy();
				});
			}.bind(this));
		});
	});

	QUnit.module("applyMultipleChanges", {
		beforeEach() {
			this.oControl = new Label(sControlId);
			this.oAddChangeStub = sandbox.stub(DependencyHandler, "addRuntimeChangeToMap");
			this.oChangeHandlerApplyChangeStub = sandbox.stub();
			sandbox.stub(ChangeUtils, "getChangeHandler").resolves({
				applyChange: this.oChangeHandlerApplyChangeStub,
				revertChange() {},
				completeChangeContent() {}
			});
		},
		afterEach() {
			sandbox.restore();
			this.oControl.destroy();
		}
	}, function() {
		QUnit.test("when all changes can be applied", async function(assert) {
			const oChange0 = FlexObjectFactory.createFromFileContent(getLabelChangeContent("a", sControlId));
			const oChange1 = FlexObjectFactory.createFromFileContent(getLabelChangeContent("b", sControlId));
			const oChange2 = FlexObjectFactory.createFromFileContent(getLabelChangeContent("c", sControlId));
			await Applier.applyMultipleChanges([oChange0, oChange1, oChange2], {
				appComponent: oAppComponent,
				reference: "DummyFlexReference"
			});
			assert.strictEqual(this.oChangeHandlerApplyChangeStub.callCount, 3, "all changes were applied");
			assert.strictEqual(this.oAddChangeStub.callCount, 3, "all changes were added to the runtime map");
		});

		QUnit.test("when a change status and custom data are not in sync", async function(assert) {
			const oChange0 = FlexObjectFactory.createFromFileContent(getLabelChangeContent("a", sControlId));
			const oChange1 = FlexObjectFactory.createFromFileContent(getLabelChangeContent("b", sControlId));
			const oChange2 = FlexObjectFactory.createFromFileContent(getLabelChangeContent("c", sControlId));
			// only change status says applied, but not actually applied on the control -> status gets reset and the change gets applied
			oChange0.markFinished();

			// change already applied on control, but status is wrong -> status gets set to applied and the change will be skipped
			sandbox.stub(FlexCustomData, "hasChangeApplyFinishedCustomData")
			.onCall(1).returns(true)
			.returns(false);
			sandbox.stub(FlexCustomData, "getAppliedCustomDataValue")
			.onCall(1).returns(true)
			.returns(false);

			await Applier.applyMultipleChanges([oChange0, oChange1, oChange2], {
				appComponent: oAppComponent,
				reference: "DummyFlexReference"
			});
			assert.strictEqual(this.oChangeHandlerApplyChangeStub.callCount, 2, "all applicable changes were applied");
			assert.strictEqual(this.oAddChangeStub.callCount, 3, "all changes were added to the runtime map");
			assert.strictEqual(oChange0.isApplyProcessFinished(), true, "the first change is marked as finished");
			assert.strictEqual(oChange1.isApplyProcessFinished(), true, "the first change is marked as finished");
			assert.strictEqual(oChange2.isApplyProcessFinished(), true, "the first change is marked as finished");
		});

		QUnit.test("when one change can't be applied", async function(assert) {
			ChangeUtils.getChangeHandler.restore();
			sandbox.stub(ChangeUtils, "getChangeHandler")
			.onFirstCall().resolves({
				applyChange: () => Promise.reject(),
				revertChange() {},
				completeChangeContent() {}
			})
			.resolves({
				applyChange: this.oChangeHandlerApplyChangeStub,
				revertChange() {},
				completeChangeContent() {}
			});
			const oChange0 = FlexObjectFactory.createFromFileContent(getLabelChangeContent("a", sControlId));
			const oChange1 = FlexObjectFactory.createFromFileContent(getLabelChangeContent("b", sControlId));
			const oChange2 = FlexObjectFactory.createFromFileContent(getLabelChangeContent("c", sControlId));
			await Applier.applyMultipleChanges([oChange0, oChange1, oChange2], {
				appComponent: oAppComponent,
				reference: "DummyFlexReference"
			});
			assert.strictEqual(this.oChangeHandlerApplyChangeStub.callCount, 2, "two changes were applied");
			assert.strictEqual(this.oAddChangeStub.callCount, 2, "two changes were added to the runtime map");
		});

		QUnit.test("when one control is not available", async function(assert) {
			const oAddDepStub = sandbox.stub(DependencyHandler, "addChangeAndUpdateDependencies");
			const oChange0 = FlexObjectFactory.createFromFileContent(getLabelChangeContent("a", sControlId));
			const oChange1 = FlexObjectFactory.createFromFileContent(getLabelChangeContent("b", "notExistingId"));
			const oChange2 = FlexObjectFactory.createFromFileContent(getLabelChangeContent("c", sControlId));
			await Applier.applyMultipleChanges([oChange0, oChange1, oChange2], {
				appComponent: oAppComponent,
				reference: "DummyFlexReference"
			});
			assert.strictEqual(this.oChangeHandlerApplyChangeStub.callCount, 2, "two changes were applied");
			assert.strictEqual(this.oAddChangeStub.callCount, 2, "two changes were added to the runtime map");
			assert.strictEqual(oAddDepStub.callCount, 1, "one change was added for later application");
		});
	});

	QUnit.module("[JS] applyChangeOnControl", {
		beforeEach() {
			const sLabelId = "label";
			const oLabelChangeContent = getLabelChangeContent("a", sLabelId);
			this.oControl = new Label(sLabelId);
			this.oChange = FlexObjectFactory.createFromFileContent(oLabelChangeContent);

			this.oErrorStub = sandbox.stub(Log, "error");
			this.oAddAppliedCustomDataSpy = sandbox.spy(FlexCustomData, "addAppliedCustomData");
			this.oChangeHandlerApplyChangeStub = sandbox.stub();
			sandbox.stub(ChangeUtils, "getChangeHandler").resolves({
				applyChange: this.oChangeHandlerApplyChangeStub,
				revertChange() {},
				completeChangeContent() {}
			});
			this.mPropertyBag = {
				modifier: JsControlTreeModifier,
				appComponent: oAppComponent
			};
		},
		afterEach() {
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
			const oError = Error("no change handler");
			ChangeUtils.getChangeHandler.restore();
			sandbox.stub(ChangeUtils, "getChangeHandler").rejects(oError);

			return Applier.applyChangeOnControl(this.oChange, this.oControl, this.mPropertyBag).then(function(oReturn) {
				assert.strictEqual(oReturn.success, false, "the promise returns false as result");
				assert.ok(oReturn.error, oError, "the error object was passed");
			});
		});

		QUnit.test("does not call the changeHandler if the change is currently being applied and succeeds", async function(assert) {
			let fnResolveFromOutside;
			const oChangeHandlerCalledPromise = new Promise(function(fnResolve) {
				fnResolveFromOutside = fnResolve;
			});
			const fnDelayedPromise = new Promise(function(fnResolve) {
				fnResolveFromOutside();
				setTimeout(function() {
					fnResolve();
				}, 0);
			});
			this.oChangeHandlerApplyChangeStub.returns(fnDelayedPromise);

			const oFirstPromise = Applier.applyChangeOnControl(this.oChange, this.oControl, this.mPropertyBag);
			await oChangeHandlerCalledPromise;
			const oSecondPromise = Applier.applyChangeOnControl(this.oChange, this.oControl, this.mPropertyBag);
			return Promise.all([oFirstPromise, oSecondPromise]).then(function(aReturn) {
				assert.strictEqual(aReturn[0].success, true, "the first promise returns success=true");
				assert.strictEqual(aReturn[1].success, true, "the second promise returns success=true");
				assert.strictEqual(this.oChangeHandlerApplyChangeStub.callCount, 1, "the change handler was only called once");
			}.bind(this));
		});

		QUnit.test("does not call the changeHandler if the change is currently being applied and fails", async function(assert) {
			let fnResolveFromOutside;
			const oChangeHandlerCalledPromise = new Promise(function(fnResolve) {
				fnResolveFromOutside = fnResolve;
			});
			const fnDelayedPromise = new Promise(function(fnResolve, fnReject) {
				fnResolveFromOutside();
				setTimeout(function() {
					fnReject(new Error("foo"));
				}, 0);
			});
			this.oChangeHandlerApplyChangeStub.returns(fnDelayedPromise);

			const oFirstPromise = Applier.applyChangeOnControl(this.oChange, this.oControl, this.mPropertyBag);
			await oChangeHandlerCalledPromise;
			const oSecondPromise = Applier.applyChangeOnControl(this.oChange, this.oControl, this.mPropertyBag);
			return Promise.all([oFirstPromise, oSecondPromise]).then(function(aReturn) {
				assert.strictEqual(this.oErrorStub.callCount, 1, "an Error was logged");
				const sExpectedErrorMessage = "could not be applied. Merge error detected while processing the JS control tree.";
				assert.ok(
					this.oErrorStub.lastCall.args[0].indexOf(sExpectedErrorMessage) > -1,
					"the error message is correct"
				);
				assert.strictEqual(aReturn[0].success, false, "the promise returns success=false");
				assert.strictEqual(aReturn[1].success, false, "the promise returns success=false");
				assert.ok(aReturn[0].error, "the first promise has an error object");
				assert.strictEqual(aReturn[0].error.message, "foo", "the error object is correct");
				assert.ok(aReturn[1].error, "the second promise has an error object");
				assert.strictEqual(aReturn[1].error.message, "foo", "the error object is correct");
				assert.strictEqual(this.oChangeHandlerApplyChangeStub.callCount, 1, "the change handler was only called once");
			}.bind(this));
		});

		QUnit.test("when the control is refreshed with the same id as the previous control during change application", function(assert) {
			this.oChangeHandlerApplyChangeStub.callsFake(function() {
				const sId = this.oControl.getId();
				this.oControl.destroy();
				this.oControl = new Text(sId);
				return this.oControl;
			}.bind(this));

			return Applier.applyChangeOnControl(this.oChange, this.oControl, this.mPropertyBag).then(function() {
				assert.ok(
					FlexCustomData.hasChangeApplyFinishedCustomData(this.oControl, this.oChange, JsControlTreeModifier),
					"the change is applied"
				);
				assert.ok(this.oControl instanceof Text, "then the refreshed control was initialized in changeHandler.applyChange()");
			}.bind(this));
		});

		QUnit.test("adds custom data on the first async change applied on a control", function(assert) {
			this.oChangeHandlerApplyChangeStub.callsFake(function() {
				this.oChange.setRevertData({foo: "bar"});
				return Promise.resolve();
			}.bind(this));

			return Applier.applyChangeOnControl(this.oChange, this.oControl, this.mPropertyBag).then(function() {
				assert.strictEqual(this.oChangeHandlerApplyChangeStub.callCount, 1, "the change was applied");
				assert.strictEqual(this.oAddAppliedCustomDataSpy.callCount, 1, "the customData was written");
			}.bind(this));
		});

		QUnit.test("does not add appliedChanges custom data if an exception was raised in change handler", function(assert) {
			this.oChangeHandlerApplyChangeStub.rejects(new Error("myError"));
			const oMarkFinishedSpy = sandbox.spy(this.oChange, "markFinished");

			return Applier.applyChangeOnControl(this.oChange, this.oControl, this.mPropertyBag).then(function(oResult) {
				assert.strictEqual(this.oErrorStub.callCount, 1, "an Error was logged");
				const sExpectedErrorMessage = "could not be applied. Merge error detected while processing the JS control tree.";
				assert.ok(
					this.oErrorStub.lastCall.args[0].indexOf(sExpectedErrorMessage) > -1,
					"the error message is correct"
				);
				assert.notOk(oResult.success, "success in the return object is set to false");
				assert.strictEqual(oResult.error.message, "myError");
				assert.ok(this.oChangeHandlerApplyChangeStub.calledOnce, "apply change functionality was called");
				assert.strictEqual(this.oAddAppliedCustomDataSpy.callCount, 0, "the customData was not added");
				assert.strictEqual(oMarkFinishedSpy.callCount, 1, "the change was marked as finished");
			}.bind(this));
		});

		QUnit.test("when change handler throws a not-Applicable exception", function(assert) {
			const oAddFailedCustomDataStub = sandbox.stub(FlexCustomData, "addFailedCustomData").resolves();
			const sNotApplicableMessage1 = "myNotApplicableMessage1";
			this.oChangeHandlerApplyChangeStub.onFirstCall().callsFake(function() {
				return ChangeHandlerBase.markAsNotApplicable(sNotApplicableMessage1, true /* asyncronous return */);
			});

			return Applier.applyChangeOnControl(this.oChange, this.oControl, this.mPropertyBag).then(function(oResult) {
				assert.strictEqual(oAddFailedCustomDataStub.callCount, 1, "failed custom data was added");
				assert.notOk(oResult.success, "success in the return object is set to false");
				assert.strictEqual(oResult.error.message, sNotApplicableMessage1);
				assert.ok(this.oChangeHandlerApplyChangeStub.calledOnce, "apply change functionality was called");
			}.bind(this));
		});

		QUnit.test("applyAllChangesForControl with control recreation and open processing", function(assert) {
			sandbox.stub(ManifestUtils, "getFlexReferenceForControl").returns("testScenarioComponent");
			sandbox.stub(FlexObjectState, "getLiveDependencyMap").returns(getInitialDependencyMap({
				mChanges: {
					label: [this.oChange]
				},
				mDependencies: {},
				mDependentChangesOnMe: {}
			}));
			this.oControl._bApplierTest = "foo";
			return Applier.applyAllChangesForControl(this.oAppComponent, "testScenarioComponent", this.oControl)
			.then(function() {
				Applier.applyAllChangesForControl(this.oAppComponent, "testScenarioComponent", this.oControl);
				this.oControl.destroy();
				const oNewControl = new Label("label");
				oNewControl._bApplierTest = "bar";
				return Applier.applyAllChangesForControl(this.oAppComponent, "testScenarioComponent", oNewControl);
			}.bind(this))
			.then(function() {
				assert.strictEqual(this.oChangeHandlerApplyChangeStub.getCall(0).args[1]._bApplierTest, "foo", "first call: old control");
				assert.strictEqual(this.oChangeHandlerApplyChangeStub.getCall(1).args[1]._bApplierTest, "bar", "second call: new control");
			}.bind(this));
		});
	});

	QUnit.module("[XML] applyChangeOnControl", {
		beforeEach() {
			const sLabelId = "labelId";
			this.oChange = FlexObjectFactory.createFromFileContent(getLabelChangeContent("fileName", sLabelId));

			this.oAddAppliedCustomDataStub = sandbox.stub(FlexCustomData, "addAppliedCustomData").resolves();
			this.oAddFailedCustomDataStub = sandbox.stub(FlexCustomData, "addFailedCustomData").resolves();
			this.oChangeHandlerApplyChangeStub = sandbox.stub();
			sandbox.stub(ChangeUtils, "getChangeHandler").resolves({
				applyChange: this.oChangeHandlerApplyChangeStub,
				revertChange() {},
				completeChangeContent() {}
			});
			this.oXmlString =
				`<mvc:View id="testComponent---myView" xmlns:mvc="sap.ui.core.mvc" xmlns="sap.m">` +
					`<Label id="${sLabelId}" />` +
				`</mvc:View>`;
			const oDOMParser = new DOMParser();
			const oView = oDOMParser.parseFromString(this.oXmlString, "application/xml").documentElement;
			[this.oControl] = oView.childNodes;
			this.mPropertyBag = {
				modifier: XmlTreeModifier,
				view: oView
			};
		},
		afterEach() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("does nothing if 'jsOnly' is set on the change", function(assert) {
			this.oChange.setJsOnly(true);
			const oSetInitialStub = sandbox.stub(this.oChange, "setInitialApplyState");

			return Applier.applyChangeOnControl(this.oChange, this.oControl, this.mPropertyBag).then(function(vReturn) {
				assert.strictEqual(vReturn.error.message, "Change cannot be applied in XML. Retrying in JS.",
					"the function returns success: false and an error as parameter");
				assert.notOk(vReturn.success, "the function returns success: false and an error as parameter");
				assert.strictEqual(oSetInitialStub.callCount, 1, "the setInitialApplyState function was called");
				assert.strictEqual(this.oChangeHandlerApplyChangeStub.callCount, 0, "the changeHandler was not called");
				assert.strictEqual(this.oAddAppliedCustomDataStub.callCount, 0, "the custom data was not added");
			}.bind(this));
		});

		QUnit.test("adds custom data on the first change applied on a control", function(assert) {
			this.oChangeHandlerApplyChangeStub.callsFake(function() {
				this.oChange.setRevertData({foo: "bar"});
			}.bind(this));

			return Applier.applyChangeOnControl(this.oChange, this.oControl, this.mPropertyBag).then(function() {
				assert.ok(this.oChangeHandlerApplyChangeStub.calledOnce, "the change was applied");
				assert.strictEqual(this.oAddAppliedCustomDataStub.callCount, 1, "custom data was added");
				assert.ok(this.oAddAppliedCustomDataStub.lastCall.args[3], "the last parameter is true ('bSaveRevertData')");
			}.bind(this));
		});

		QUnit.test("adds failedCustomData if the applying of the change fails", function(assert) {
			this.oChangeHandlerApplyChangeStub.throws();
			const oSetInitialStub = sandbox.stub(this.oChange, "setInitialApplyState");

			return Applier.applyChangeOnControl(this.oChange, this.oControl, this.mPropertyBag).then(function() {
				assert.ok(this.oChangeHandlerApplyChangeStub.calledOnce, "apply change functionality was called");
				assert.strictEqual(oSetInitialStub.callCount, 1, "the setInitialApplyState function was called");
				assert.strictEqual(this.oAddFailedCustomDataStub.callCount, 1, "custom data was added");
			}.bind(this));
		});

		QUnit.test("does not call the change handler if the change was already applied", function(assert) {
			this.oChange.markFinished();

			return Applier.applyChangeOnControl(this.oChange, this.oControl, this.mPropertyBag).then(function() {
				assert.strictEqual(this.oChangeHandlerApplyChangeStub.callCount, 0, "the change handler was not called again");
			}.bind(this));
		});

		QUnit.test("with asynchronous changeHandler stub for a label", function(assert) {
			this.oChange.setRevertData({foo: "bar"});

			this.oChangeHandlerApplyChangeStub.resolves(true);
			return Applier.applyChangeOnControl(this.oChange, this.oControl, this.mPropertyBag).then(function() {
				assert.ok(this.oChangeHandlerApplyChangeStub.calledOnce, "the change was applied");
				assert.strictEqual(this.oAddAppliedCustomDataStub.callCount, 1, "custom data was added");
			}.bind(this));
		});
	});

	QUnit.module("[XML] applyAllChangesForXMLView", {
		beforeEach() {
			this.oControl = new Control("existingId");
			this.oChange = FlexObjectFactory.createFromFileContent(getLabelChangeContent("fileName", "labelId"));
			this.oExtensionPointChange = FlexObjectFactory.createFromFileContent({
				fileType: "change",
				layer: Layer.CUSTOMER,
				fileName: "aName",
				namespace: "a",
				packageName: "b",
				changeType: "addXMLAtExtensionPoint",
				creation: "",
				reference: "",
				selector: {
					name: "MyExtensionPoint",
					viewSelector: {
						id: "testComponent---myView",
						idIsLocal: true
					}
				},
				content: {
					something: "fragmentpath"
				}
			});
			const oDOMParser = new DOMParser();
			const oXmlString =
				'<mvc:View id="testComponent---myView" xmlns:mvc="sap.ui.core.mvc" xmlns:core="sap.ui.core" xmlns="sap.m">' +
					'<Label id="labelId" />' +
					'<HBox id="hbox">' +
						'<core:ExtensionPoint name="MyExtensionPoint" />' +
					"</HBox>" +
				"</mvc:View>";
			const oView = oDOMParser.parseFromString(oXmlString, "application/xml").documentElement;
			[this.oXmlLabel] = oView.childNodes;
			this.oApplyChangeOnControlStub = sandbox.stub(Applier, "applyChangeOnControl");
			this.oWarningStub = sandbox.stub(Log, "warning");
			this.mPropertyBag = {
				modifier: XmlTreeModifier,
				view: oView
			};
			sandbox.stub(ChangeUtils, "getChangeHandler").resolves({
				applyChange() {},
				revertChange() {},
				completeChangeContent() {}
			});
		},
		afterEach() {
			sandbox.restore();
			this.oControl.destroy();
		}
	}, function() {
		QUnit.test("when change can be applied", function(assert) {
			this.oApplyChangeOnControlStub.resolves({success: true});

			return Applier.applyAllChangesForXMLView(this.mPropertyBag, [this.oChange]).then(function(oResult) {
				assert.strictEqual(this.oApplyChangeOnControlStub.callCount, 1, "the change handler was called");
				assert.deepEqual(oResult, this.mPropertyBag.view, "the view was returned");
			}.bind(this));
		});

		QUnit.test("the same view gets created twice", function(assert) {
			this.oApplyChangeOnControlStub.resolves({success: true});
			const oSetQueueSpy = sandbox.spy(this.oChange, "setQueuedForApply");
			const oMarkFinishedSpy = sandbox.spy(this.oChange, "markFinished");
			return Applier.applyAllChangesForXMLView(this.mPropertyBag, [this.oChange]).then(function() {
				assert.strictEqual(oSetQueueSpy.callCount, 1, "the change was queued");

				this.oChange.markFinished();
				sandbox.stub(FlexCustomData, "hasChangeApplyFinishedCustomData").returns(true);

				return Applier.applyAllChangesForXMLView(this.mPropertyBag, [this.oChange]);
			}.bind(this)).then(function() {
				assert.strictEqual(oMarkFinishedSpy.callCount, 2, "the change was marked as finished again");
			});
		});

		QUnit.test("the same view gets created twice with unapplicable changes", function(assert) {
			const oSetRevertDataSpy = sandbox.spy(this.oChange, "setRevertData");
			sandbox.stub(FlexCustomData, "hasChangeApplyFinishedCustomData").returns(true);

			return FlexCustomData.addFailedCustomData(
				this.oControl,
				this.oChange,
				{
					modifier: JsControlTreeModifier,
					appComponent: this.oAppComponent
				},
				FlexCustomData.failedChangesCustomDataKeyXml
			)
			.then(function() {
				return Applier.applyAllChangesForXMLView(this.mPropertyBag, [this.oChange])
				.then(function() {
					assert.ok(oSetRevertDataSpy.notCalled, "then no revert data is set on the unapplied change");
					assert.ok(this.oChange.hasApplyProcessFailed(), "then the status is APPLY_FAILED");
				}.bind(this));
			}.bind(this));
		});

		QUnit.test("when change for an extension point can be applied", function(assert) {
			this.oApplyChangeOnControlStub.resolves({success: true});

			return Applier.applyAllChangesForXMLView(this.mPropertyBag, [this.oExtensionPointChange]).then(function(oResult) {
				assert.strictEqual(this.oApplyChangeOnControlStub.callCount, 1, "the change handler was called");
				assert.deepEqual(oResult, this.mPropertyBag.view, "the view was returned");
			}.bind(this));
		});

		QUnit.test("logs an error if no changes were passed", function(assert) {
			const oErrorStub = sandbox.stub(Log, "error");

			return Applier.applyAllChangesForXMLView(this.mPropertyBag, "thisIsNoArray").then(function() {
				assert.strictEqual(oErrorStub.callCount, 1, "a error was logged");
			});
		});

		QUnit.test("logs an error if dependent selectors are missing", function(assert) {
			const oDependentSelectorSelector = {
				id: "dependent-selector-id",
				idIsLocal: false
			};
			sandbox.stub(this.oChange, "getDependentControlSelectorList").returns([oDependentSelectorSelector]);

			return Applier.applyAllChangesForXMLView(this.mPropertyBag, [this.oChange]).then(function() {
				assert.strictEqual(this.oWarningStub.callCount, 1, "an ApplyChangeError was logged");
				const sExpectedErrorMessage = "A dependent selector control of the flexibility change is not available.";
				assert.ok(this.oWarningStub.lastCall.args[0].indexOf(sExpectedErrorMessage) > -1, "an ApplyChangeError was logged");
			}.bind(this));
		});

		QUnit.test("logs error when the change has no selector", function(assert) {
			const oChange = FlexObjectFactory.createFromFileContent({
				selector: {}
			});

			return Applier.applyAllChangesForXMLView(this.mPropertyBag, [oChange]).then(function() {
				assert.strictEqual(this.oWarningStub.callCount, 1, "one error was logged");
				const sExpectedErrorMessage = "No selector in change found or no selector ID.";
				assert.ok(this.oWarningStub.lastCall.args[0].indexOf(sExpectedErrorMessage) > -1, "an ApplyChangeError was logged");
			}.bind(this));
		});

		QUnit.test("logs error when the control is not available", function(assert) {
			const oChange = FlexObjectFactory.createFromFileContent({
				selector: {
					id: "abc",
					local: false
				}
			});

			return Applier.applyAllChangesForXMLView(this.mPropertyBag, [oChange]).then(function() {
				assert.strictEqual(this.oWarningStub.callCount, 1, "one error was logged");
				const sExpectedErrorMessage = "A flexibility change tries to change a nonexistent control.";
				assert.ok(this.oWarningStub.lastCall.args[0].indexOf(sExpectedErrorMessage) > -1, "an ApplyChangeError was logged");
			}.bind(this));
		});

		QUnit.test("continues the processing if an error occurs before change applying", function(assert) {
			const oChange1 = FlexObjectFactory.createFromFileContent({
				selector: {}
			});
			this.oApplyChangeOnControlStub.resolves({success: true});

			return Applier.applyAllChangesForXMLView(this.mPropertyBag, [oChange1, this.oChange]).then(function() {
				assert.strictEqual(this.oApplyChangeOnControlStub.callCount, 1, "one change was processed");
				assert.strictEqual(this.oWarningStub.callCount, 1, "one error was logged");
			}.bind(this));
		});

		QUnit.test("continues the processing if an error occurs during change applying", function(assert) {
			const oChange2 = FlexObjectFactory.createFromFileContent(getLabelChangeContent("fileName", "hbox"));
			this.oApplyChangeOnControlStub.resolves({success: false});

			return Applier.applyAllChangesForXMLView(this.mPropertyBag, [this.oChange, oChange2]).then(function() {
				assert.strictEqual(this.oApplyChangeOnControlStub.callCount, 2, "all changes were processed");
				assert.strictEqual(this.oWarningStub.callCount, 2, "the issues were logged");
			}.bind(this));
		});

		QUnit.test("updates change status if change was already applied (viewCache)", function(assert) {
			this.oApplyChangeOnControlStub.resolves({success: true});
			sandbox.stub(FlexCustomData, "hasChangeApplyFinishedCustomData").returns(true);
			sandbox.stub(FlexCustomData, "getParsedRevertDataFromCustomData").returns({});
			const oMarkFinishedSpy = sandbox.spy(this.oChange, "markFinished");

			return Applier.applyAllChangesForXMLView(this.mPropertyBag, [this.oChange]).then(function() {
				assert.strictEqual(this.oApplyChangeOnControlStub.callCount, 0, "no change was processed");
				assert.strictEqual(this.oWarningStub.callCount, 0, "no issues were logged");
				assert.strictEqual(oMarkFinishedSpy.callCount, 1, "the change was set to finished");
			}.bind(this));
		});

		QUnit.test("resets change status if change is not applied anymore", function(assert) {
			this.oApplyChangeOnControlStub.resolves({success: true});
			sandbox.stub(FlexCustomData, "hasChangeApplyFinishedCustomData").returns(false);
			this.oChange.markFinished();
			const oSetInitialStateStub = sandbox.stub(this.oChange, "setInitialApplyState");
			const oCheckDependencyStub = sandbox.stub(ChangeUtils, "checkIfDependencyIsStillValid");

			return Applier.applyAllChangesForXMLView(this.mPropertyBag, [this.oChange]).then(function() {
				assert.strictEqual(this.oApplyChangeOnControlStub.callCount, 0, "no change was processed");
				assert.strictEqual(this.oWarningStub.callCount, 0, "no issues were logged");
				assert.strictEqual(oSetInitialStateStub.callCount, 1, "the change was set to finished");
				assert.strictEqual(oCheckDependencyStub.callCount, 0, "dependencies are not checked because it's XML processing");
			}.bind(this));
		});

		QUnit.test("processes the changes in the correct order", function(assert) {
			const oChange1 = FlexObjectFactory.createFromFileContent(getLabelChangeContent("a"));
			const oChange2 = FlexObjectFactory.createFromFileContent(getLabelChangeContent("a2"));
			const oChange3 = FlexObjectFactory.createFromFileContent(getLabelChangeContent("a3"));

			sandbox.stub(XmlTreeModifier, "bySelectorTypeIndependent").withArgs(sinon.match.defined).resolves(this.oXmlLabel);
			sandbox.stub(XmlTreeModifier, "getControlType").returns("aType");
			this.oApplyChangeOnControlStub.resolves({success: true});

			return Applier.applyAllChangesForXMLView(this.mPropertyBag, [oChange1, oChange2, oChange3]).then(function() {
				assert.strictEqual(this.oApplyChangeOnControlStub.callCount, 3, "the change handler was called 3 times");
				assert.strictEqual(this.oApplyChangeOnControlStub.firstCall.args[0].getId(), "a", "the first change was applied first");
				assert.strictEqual(this.oApplyChangeOnControlStub.secondCall.args[0].getId(), "a2", "the second change was applied second");
				assert.strictEqual(this.oApplyChangeOnControlStub.thirdCall.args[0].getId(), "a3", "the third change was applied third");
			}.bind(this));
		});

		QUnit.test("stops processing a selector if a change failed", function(assert) {
			const oChange1 = FlexObjectFactory.createFromFileContent(getLabelChangeContent("a", "labelId"));
			const oChange2 = FlexObjectFactory.createFromFileContent(getLabelChangeContent("a2", "labelId"));
			const oChange3 = FlexObjectFactory.createFromFileContent(getLabelChangeContent("a3", "labelId"));
			const oChange11 = FlexObjectFactory.createFromFileContent(getLabelChangeContent("a", "labelId"));
			const oChange22 = FlexObjectFactory.createFromFileContent(getLabelChangeContent("a2", "labelId"));
			const oChange33 = FlexObjectFactory.createFromFileContent(getLabelChangeContent("a3", "labelId"));

			this.oApplyChangeOnControlStub
			.onCall(0).resolves({success: true})
			.onCall(1).rejects("error")
			.onCall(2).resolves({success: true});

			return Applier.applyAllChangesForXMLView(this.mPropertyBag, [oChange1, oChange2, oChange3]).then(function() {
				assert.notOk(this.mPropertyBag.failedSelectors, "the failedSelectors were removed from the propertyBag");
				assert.strictEqual(this.oApplyChangeOnControlStub.callCount, 2, "the change handler was called 2 times");
				assert.strictEqual(this.oApplyChangeOnControlStub.firstCall.args[0].getId(), "a", "the first change was applied first");
				assert.strictEqual(this.oApplyChangeOnControlStub.secondCall.args[0].getId(), "a2", "the second change was applied second");

				assert.strictEqual(this.oWarningStub.callCount, 2, "two warnings were logged");

				this.oApplyChangeOnControlStub.reset();
				this.oApplyChangeOnControlStub.resolves({success: true});

				return Applier.applyAllChangesForXMLView(this.mPropertyBag, [oChange11, oChange22, oChange33]);
			}.bind(this))
			.then(function() {
				assert.strictEqual(this.oApplyChangeOnControlStub.callCount, 3, "the change handler was called 3 more times");
			}.bind(this));
		});

		QUnit.test("stops processing a selector if a change with a dependent selector failed", function(assert) {
			const oChangeDef = getLabelChangeContent("a", "hbox");
			oChangeDef.dependentSelector = {
				myAlias: {
					id: "labelId",
					idIsLocal: false
				}
			};
			const oChange1 = FlexObjectFactory.createFromFileContent(oChangeDef);
			const oChange2 = FlexObjectFactory.createFromFileContent(getLabelChangeContent("a2", "labelId"));
			const oChange3 = FlexObjectFactory.createFromFileContent(getLabelChangeContent("a3", "labelId"));

			this.oApplyChangeOnControlStub
			.onCall(0).rejects("error")
			.onCall(1).resolves({success: true})
			.onCall(2).resolves({success: true});

			return Applier.applyAllChangesForXMLView(this.mPropertyBag, [oChange1, oChange2, oChange3]).then(function() {
				assert.notOk(this.mPropertyBag.failedSelectors, "the failedSelectors were removed from the propertyBag");
				assert.strictEqual(this.oApplyChangeOnControlStub.callCount, 1, "the change handler was called once");
				assert.strictEqual(this.oApplyChangeOnControlStub.firstCall.args[0].getId(), "a", "the first change was applied first");

				assert.strictEqual(this.oWarningStub.callCount, 3, "three warnings were logged");
			}.bind(this));
		});
	});

	QUnit.module("onAfterXMLChangeProcessing hook", {
		beforeEach() {
			this.oChange1 = FlexObjectFactory.createFromFileContent(getLabelChangeContent("c1", "label1"));
			// Same control, same handler
			this.oChange2 = FlexObjectFactory.createFromFileContent(getLabelChangeContent("c2", "label1"));
			// Same control, different handler
			this.oChange3 = FlexObjectFactory.createFromFileContent(Object.assign(
				getLabelChangeContent("c2", "label1"),
				{
					changeType: "someOtherChangeType"
				}
			));
			// Different control, same handler
			this.oChange4 = FlexObjectFactory.createFromFileContent(getLabelChangeContent("c4", "label2"));

			const oXmlString =
				'<mvc:View id="testComponent---myView" xmlns:mvc="sap.ui.core.mvc" xmlns="sap.m">' +
					'<Label id="label1" />' +
					'<Label id="label2" />' +
				"</mvc:View>";
			const oView = new DOMParser().parseFromString(oXmlString, "application/xml").documentElement;
			this.oApplyChangeOnControlStub = sandbox.stub(Applier, "applyChangeOnControl").resolves({success: true});
			this.mPropertyBag = {
				modifier: XmlTreeModifier,
				view: oView
			};
			this.oOnAfterXMLChangeProcessingStub = sandbox.stub();
			this.oOnAfterXMLChangeProcessingStub2 = sandbox.stub();
			const oChangeHandler = {
				applyChange() {},
				revertChange() {},
				completeChangeContent() {},
				onAfterXMLChangeProcessing: this.oOnAfterXMLChangeProcessingStub
			};
			const oChangeHandler2 = {
				applyChange() {},
				revertChange() {},
				completeChangeContent() {},
				onAfterXMLChangeProcessing: this.oOnAfterXMLChangeProcessingStub2
			};
			sandbox.stub(ChangeUtils, "getChangeHandler").callsFake(function(oChange) {
				return Promise.resolve(
					oChange.getChangeType() === "labelChange"
						? oChangeHandler
						: oChangeHandler2
				);
			});
		},
		afterEach() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when a change is applied", function(assert) {
			return Applier.applyAllChangesForXMLView(this.mPropertyBag, [this.oChange1])
			.then(function() {
				assert.ok(
					this.oOnAfterXMLChangeProcessingStub.calledOnce,
					"then the hook is called"
				);
				assert.strictEqual(
					this.oOnAfterXMLChangeProcessingStub.firstCall.args[0].id,
					"label1",
					"then the affected HTMLElement is passed to the hook"
				);
			}.bind(this));
		});

		QUnit.test("when multiple changes with the same handler are applied", function(assert) {
			return Applier.applyAllChangesForXMLView(this.mPropertyBag, [this.oChange1, this.oChange2])
			.then(function() {
				assert.strictEqual(
					this.oOnAfterXMLChangeProcessingStub.callCount,
					1,
					"then the hook is only called once"
				);
				assert.ok(
					this.oApplyChangeOnControlStub.secondCall.calledBefore(
						this.oOnAfterXMLChangeProcessingStub.firstCall
					),
					"then the hook is called after both changes are applied"
				);
			}.bind(this));
		});

		QUnit.test("when multiple changes with different handlers are applied", function(assert) {
			return Applier.applyAllChangesForXMLView(this.mPropertyBag, [this.oChange1, this.oChange3])
			.then(function() {
				assert.ok(
					this.oOnAfterXMLChangeProcessingStub.calledOnce,
					"then the hook is called for the first handler"
				);
				assert.ok(
					this.oOnAfterXMLChangeProcessingStub2.calledOnce,
					"then the hook is called for the second handler"
				);
				assert.ok(
					this.oApplyChangeOnControlStub.secondCall.calledBefore(
						this.oOnAfterXMLChangeProcessingStub.firstCall
					),
					"then the hook is called after all changes are applied"
				);
			}.bind(this));
		});

		QUnit.test("when changes with the same handler are applied on multiple controls", function(assert) {
			return Applier.applyAllChangesForXMLView(this.mPropertyBag, [this.oChange1, this.oChange4])
			.then(function() {
				assert.strictEqual(
					this.oOnAfterXMLChangeProcessingStub.callCount,
					2,
					"then the hook is called for both controls"
				);
				assert.strictEqual(
					this.oOnAfterXMLChangeProcessingStub.firstCall.args[0].id,
					"label1",
					"then the first affected HTMLElement is passed to the hook"
				);
				assert.strictEqual(
					this.oOnAfterXMLChangeProcessingStub.secondCall.args[0].id,
					"label2",
					"then the second affected HTMLElement is passed to the hook"
				);
			}.bind(this));
		});

		QUnit.test("when a change handler throws an error", function(assert) {
			this.oOnAfterXMLChangeProcessingStub.throws("Some error");
			const oLogSpy = sandbox.spy(Log, "error");
			return Applier.applyAllChangesForXMLView(this.mPropertyBag, [this.oChange1])
			.then(function() {
				assert.ok(
					oLogSpy.calledOnce,
					"then the error is displayed"
				);
			})
			.catch(function() {
				assert.ok(false, "then the apply process must not fail");
			});
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
