/* global QUnit */

sap.ui.define([
	"sap/m/Text",
	"sap/ui/core/util/reflection/JsControlTreeModifier",
	"sap/ui/core/Control",
	"sap/ui/core/UIComponent",
	"sap/ui/fl/apply/_internal/changes/descriptor/ApplyStrategyFactory",
	"sap/ui/fl/apply/_internal/changes/FlexCustomData",
	"sap/ui/fl/apply/_internal/changes/Utils",
	"sap/ui/fl/apply/_internal/flexObjects/AnnotationChange",
	"sap/ui/fl/apply/_internal/flexObjects/FlexObjectFactory",
	"sap/ui/fl/apply/_internal/flexObjects/UIChange",
	"sap/ui/fl/initial/_internal/changeHandlers/ChangeHandlerRegistration",
	"sap/ui/fl/initial/_internal/changeHandlers/ChangeHandlerStorage",
	"sap/ui/fl/Utils",
	"sap/ui/thirdparty/sinon-4"
], function(
	Text,
	JsControlTreeModifier,
	Control,
	UIComponent,
	ApplyStrategyFactory,
	FlexCustomData,
	ChangeUtils,
	AnnotationChange,
	FlexObjectFactory,
	UIChange,
	ChangeHandlerRegistration,
	ChangeHandlerStorage,
	FlUtils,
	sinon
) {
	"use strict";

	var sandbox = sinon.createSandbox();

	QUnit.module("getControlIfTemplateAffected", {
		beforeEach() {
			this.oControl = new Control("controlId");
			this.oText = new Text("textId");
		},
		afterEach() {
			this.oControl.destroy();
			this.oText.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when calling 'getControlIfTemplateAffected' with a change containing the parameter boundAggregation", function(assert) {
			var oChange = new UIChange({
				content: {
					boundAggregation: true
				},
				dependentSelectors: {
					originalSelector: "original"
				}
			});
			var mPropertyBag = {
				modifier: JsControlTreeModifier
			};
			sandbox.stub(JsControlTreeModifier, "bySelector").returns(this.oText);

			var mExpectedResult = {
				originalControl: this.oControl,
				control: this.oText,
				controlType: "sap.m.Text",
				bTemplateAffected: true
			};
			var mControl = ChangeUtils.getControlIfTemplateAffected(oChange, this.oControl, mPropertyBag);

			assert.deepEqual(mControl.originalControl, mExpectedResult.originalControl, "the parameter 'originalControl' is correct.");
			assert.deepEqual(mControl.control, mExpectedResult.control, "the parameter 'control' is correct.");
			assert.deepEqual(mControl.controlType, mExpectedResult.controlType, "the parameter 'controlType' is correct.");
			assert.deepEqual(mControl.bTemplateAffected, mExpectedResult.bTemplateAffected, "the parameter 'bTemplateAffected' is correct.");
		});

		QUnit.test("when calling 'getControlIfTemplateAffected' with a change without containing the parameter boundAggregation", function(assert) {
			var oChange = new UIChange({
				content: {}
			});
			var mPropertyBag = {
				modifier: JsControlTreeModifier
			};

			var mExpectedResult = {
				originalControl: this.oControl,
				control: this.oControl,
				controlType: "sap.ui.core.Control",
				bTemplateAffected: false
			};
			var mControl = ChangeUtils.getControlIfTemplateAffected(oChange, this.oControl, mPropertyBag);

			assert.deepEqual(mControl.originalControl, mExpectedResult.originalControl, "the parameter 'originalControl' is correct.");
			assert.deepEqual(mControl.control, mExpectedResult.control, "the parameter 'control' is correct.");
			assert.deepEqual(mControl.controlType, mExpectedResult.controlType, "the parameter 'controlType' is correct.");
			assert.deepEqual(mControl.bTemplateAffected, mExpectedResult.bTemplateAffected, "the parameter 'bTemplateAffected' is correct.");
		});

		QUnit.test("when calling 'getControlIfTemplateAffected' without a control and a change without containing the parameter boundAggregation", function(assert) {
			var oChange = new UIChange({
				content: {}
			});
			var mPropertyBag = {
				modifier: JsControlTreeModifier
			};

			var mExpectedResult = {
				originalControl: undefined,
				control: undefined,
				controlType: undefined,
				bTemplateAffected: false
			};
			var mControl = ChangeUtils.getControlIfTemplateAffected(oChange, undefined, mPropertyBag);

			assert.deepEqual(mControl.originalControl, mExpectedResult.originalControl, "the parameter 'originalControl' is correct.");
			assert.deepEqual(mControl.control, mExpectedResult.control, "the parameter 'control' is correct.");
			assert.deepEqual(mControl.controlType, mExpectedResult.controlType, "the parameter 'controlType' is correct.");
			assert.deepEqual(mControl.bTemplateAffected, mExpectedResult.bTemplateAffected, "the parameter 'bTemplateAffected' is correct.");
		});
	});

	QUnit.module("getChangeHandler", {
		beforeEach() {
			this.oChange = new UIChange({
				flexObjectMetadata: {
					changeType: "type"
				},
				layer: "layer"
			});
			this.oControl = new Control("control");
			sandbox.stub(ApplyStrategyFactory, "getRuntimeStrategy").resolves({
				registry: () => {
					return Promise.resolve({
						myAppDescriptorChangeType: () => "myAppDescriptorChangeHandler"
					});
				}
			});
			sandbox.stub(ChangeHandlerStorage, "getAnnotationChangeHandler")
			.withArgs({changeType: "myAnnotationChangeType"})
			.resolves("myAnnotationChangeHandler");
		},
		afterEach() {
			sandbox.restore();
			this.oControl.destroy();
		}
	}, function() {
		QUnit.test("when UI change handler is not loaded yet and we have to wait for registration", async function(assert) {
			const oWaitStub = sandbox.stub(ChangeHandlerRegistration, "waitForChangeHandlerRegistration")
			.withArgs("library")
			.resolves();
			const oGetChangeHandlerStub = sandbox.stub(ChangeHandlerStorage, "getChangeHandler").resolves("changeHandler");
			const oChangeHandler = await ChangeUtils.getChangeHandler({
				flexObject: this.oChange,
				control: this.oControl,
				controlType: "sap.ui.core.Control",
				modifier: {
					getLibraryName() {return Promise.resolve("library");}
				}
			});
			assert.strictEqual(oWaitStub.callCount, 1, "the waitForChangeHandlerRegistration function was called");
			assert.strictEqual(oChangeHandler, "changeHandler", "the returned change handler is correct");
			assert.strictEqual(oGetChangeHandlerStub.callCount, 1, "the getChangeHandler function was called");
			assert.strictEqual(oGetChangeHandlerStub.firstCall.args[0], "type", "the passed property 'sChangeType' is correct");
			assert.strictEqual(oGetChangeHandlerStub.firstCall.args[1], "sap.ui.core.Control", "the property 'sControlType' is correct");
			assert.strictEqual(oGetChangeHandlerStub.firstCall.args[4], "layer", "the passed property 'sLayer' is correct");
		});

		QUnit.test("app descriptor change - called with flex object", async function(assert) {
			const oAppDescriptorChange = FlexObjectFactory.createFromFileContent(({
				appDescriptorChange: true,
				changeType: "myAppDescriptorChangeType",
				fileName: "appDescriptorChange",
				fileType: "change"
			}));
			const oChangeHandler = await ChangeUtils.getChangeHandler({
				flexObject: oAppDescriptorChange
			});
			assert.strictEqual(oChangeHandler, "myAppDescriptorChangeHandler", "the returned change handler is correct");
		});

		QUnit.test("app descriptor change - called with parameters", async function(assert) {
			const oChangeHandler = await ChangeUtils.getChangeHandler({
				changeType: "myAppDescriptorChangeType",
				appDescriptorChange: true
			});
			assert.strictEqual(oChangeHandler, "myAppDescriptorChangeHandler", "the returned change handler is correct");
		});

		QUnit.test("annotation change - called with flex object", async function(assert) {
			const oAnnotationChange = FlexObjectFactory.createFromFileContent(({
				fileType: "annotation_change",
				fileName: "annotationChange1",
				changeType: "myAnnotationChangeType"
			}));

			const oChangeHandler = await ChangeUtils.getChangeHandler({
				flexObject: oAnnotationChange
			});
			assert.strictEqual(oChangeHandler, "myAnnotationChangeHandler", "the returned change handler is correct");
		});

		QUnit.test("annotation change - called with parameters", async function(assert) {
			const oChangeHandler = await ChangeUtils.getChangeHandler({
				changeType: "myAnnotationChangeType",
				annotationChange: true
			});
			assert.strictEqual(oChangeHandler, "myAnnotationChangeHandler", "the returned change handler is correct");
		});
	});

	QUnit.module("checkIfDependencyIsStillValid", {
		beforeEach() {
			this.oChange = new UIChange({});
			this.oGetChangesFromMapStub = sandbox.stub(FlUtils, "getChangeFromChangesMap").returns(this.oChange);
			this.oModifier = {
				bySelector() { return "foo"; }
			};
		},
		afterEach() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("with already applied change", function(assert) {
			sandbox.stub(FlexCustomData, "hasChangeApplyFinishedCustomData").returns(true);
			assert.equal(ChangeUtils.checkIfDependencyIsStillValid({}, this.oModifier, {}, ""), false, "the dependency is not valid anymore");
		});

		QUnit.test("with change currently being applied", function(assert) {
			sandbox.stub(FlexCustomData, "hasChangeApplyFinishedCustomData").returns(false);
			this.oChange.startApplying();
			assert.equal(ChangeUtils.checkIfDependencyIsStillValid({}, this.oModifier, {}, ""), false, "the dependency is not valid anymore");
		});

		QUnit.test("with change neither being applied not already applied", function(assert) {
			sandbox.stub(FlexCustomData, "hasChangeApplyFinishedCustomData").returns(false);
			assert.equal(ChangeUtils.checkIfDependencyIsStillValid({}, this.oModifier, {}, ""), true, "the dependency is still valid");
		});

		QUnit.test("with change deleted from the changes map (e.g. after condensing)", function(assert) {
			this.oGetChangesFromMapStub.returns(undefined);
			assert.equal(ChangeUtils.checkIfDependencyIsStillValid({}, this.oModifier, {}, ""), false, "the dependency is not valid anymore");
		});

		QUnit.test("with an unavailable control", function(assert) {
			sandbox.stub(this.oModifier, "bySelector").returns(undefined);
			assert.equal(ChangeUtils.checkIfDependencyIsStillValid({}, this.oModifier, {}, ""), true, "the dependency is still valid");
		});
	});

	QUnit.module("isChangeInView", {
		beforeEach() {
			this.oAppComponent = new UIComponent("app");
		},
		afterEach() {
			this.oAppComponent.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("with normal UI Changes", function(assert) {
			var mPropertyBag = {
				modifier: JsControlTreeModifier,
				appComponent: this.oAppComponent,
				viewId: "app---view1"
			};
			var oChange1 = new UIChange({
				selector: {
					id: "view1--controlId",
					idIsLocal: true
				}
			});
			var oChange2 = new UIChange({
				selector: {
					id: "app---view1--controlId",
					idIsLocal: false
				}
			});
			var oChange3 = new UIChange({
				selector: {
					id: "app---view1--controlId",
					idIsLocal: true
				}
			});
			var oChange4 = new UIChange({
				selector: {
					id: "view1--view2--controlId",
					idIsLocal: true
				}
			});
			var oChange5 = new UIChange({
				selector: {
					id: "view2--controlId",
					idIsLocal: true
				}
			});
			assert.strictEqual(ChangeUtils.isChangeInView(mPropertyBag, oChange1), true, "the change belongs to the view");
			assert.strictEqual(ChangeUtils.isChangeInView(mPropertyBag, oChange2), true, "the change belongs to the view");
			assert.strictEqual(ChangeUtils.isChangeInView(mPropertyBag, oChange3), false, "the changes does not belong to the view");
			assert.strictEqual(ChangeUtils.isChangeInView(mPropertyBag, oChange4), true, "the change belongs to the view");
			assert.strictEqual(ChangeUtils.isChangeInView(mPropertyBag, oChange5), false, "");

			mPropertyBag.viewId = "app---view2";
			assert.strictEqual(ChangeUtils.isChangeInView(mPropertyBag, oChange1), false, "the changes does not belong to the view");
			assert.strictEqual(ChangeUtils.isChangeInView(mPropertyBag, oChange2), false, "the changes does not belong to the view");
			assert.strictEqual(ChangeUtils.isChangeInView(mPropertyBag, oChange3), false, "the changes does not belong to the view");
			assert.strictEqual(ChangeUtils.isChangeInView(mPropertyBag, oChange4), false, "the changes does not belong to the view");
			assert.strictEqual(ChangeUtils.isChangeInView(mPropertyBag, oChange5), true, "the change belongs to the view");
		});

		QUnit.test("without proper selector", function(assert) {
			var oChange1 = new UIChange({});
			assert.strictEqual(ChangeUtils.isChangeInView({}, oChange1), false, "the changes does not belong to the view");

			oChange1.setSelector({});
			assert.strictEqual(ChangeUtils.isChangeInView({}, oChange1), false, "the changes does not belong to the view");
		});

		QUnit.test("with changes having a viewSelector", function(assert) {
			var mPropertyBag = {
				modifier: JsControlTreeModifier,
				appComponent: this.oAppComponent,
				viewId: "app---view1"
			};
			var oChange1 = new UIChange({
				selector: {
					viewSelector: {
						id: "view1",
						idIsLocal: true
					}
				}
			});
			var oChange2 = new UIChange({
				selector: {
					viewSelector: {
						id: "app---view1",
						idIsLocal: false
					}
				}
			});
			var oChange3 = new UIChange({
				selector: {
					viewSelector: {
						id: "view2",
						idIsLocal: true
					}
				}
			});
			assert.strictEqual(ChangeUtils.isChangeInView(mPropertyBag, oChange1), true, "the change belongs to the view");
			assert.strictEqual(ChangeUtils.isChangeInView(mPropertyBag, oChange2), true, "the change belongs to the view");
			assert.strictEqual(ChangeUtils.isChangeInView(mPropertyBag, oChange3), false, "the changes does not belong to the view");
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
