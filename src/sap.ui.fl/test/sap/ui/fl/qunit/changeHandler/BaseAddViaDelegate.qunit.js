/* global QUnit */

sap.ui.define([
	"sap/m/Button",
	"sap/ui/core/util/reflection/JsControlTreeModifier",
	"sap/ui/core/Component",
	"sap/ui/fl/apply/_internal/flexObjects/UIChange",
	"sap/ui/fl/apply/api/DelegateMediatorAPI",
	"sap/ui/fl/changeHandler/BaseAddViaDelegate",
	"sap/ui/fl/Utils",
	"sap/ui/layout/form/Form",
	"sap/ui/thirdparty/sinon-4"
], function(
	Button,
	JsControlTreeModifier,
	Component,
	UIChange,
	DelegateMediatorAPI,
	BaseAddViaDelegate,
	Utils,
	Form,
	sinon
) {
	"use strict";

	function createChangeHandler(bSkipCreateLayout, fnAddProperty) {
		return BaseAddViaDelegate.createAddViaDelegateChangeHandler({
			addProperty: fnAddProperty || function() {},
			aggregationName: "formElements",
			parentAlias: "parentFormContainer",
			fieldSuffix: "-field",
			skipCreateLayout: bSkipCreateLayout
		});
	}

	var sandbox = sinon.createSandbox();

	function fnBefore() {
		return Component.create({
			name: "testComponentAsync",
			id: "testComponentAsync"
		}).then(function(oComponent) {
			this.oComponent = oComponent;
			this.mPropertyBag = {modifier: JsControlTreeModifier, appComponent: oComponent};
			this.mSpecificChangeInfo = {
				newControlId: "someControlId",
				bindingPath: "some/binding/path",
				parentId: "testForm",
				index: 0
			};
		}.bind(this));
	}

	function fnBeforeEach() {
		sandbox.stub(Utils, "getAppComponentForControl").returns(this.oComponent);
		this.oGetWriteDelegateForControlStub = sandbox.stub(DelegateMediatorAPI, "getWriteDelegateForControl")
		.callsFake(function() {
			return Promise.resolve({instance: this.oDelegate});
		}.bind(this));

		this.oForm = new Form({
			id: "testForm",
			"sap.ui.fl.delegate": {
				name: "path/to/some/delegate"
			}
		});

		this.oChange = new UIChange({
			selector: JsControlTreeModifier.getSelector(this.oForm, this.oComponent)
		});
	}

	function fnAfterEach() {
		this.oForm.destroy();
		delete this.oDelegate;
		delete this.oChange;
		sandbox.restore();
	}

	function fnAfter() {
		this.oComponent.destroy();
	}

	QUnit.module("sap.ui.fl.changeHandler.BaseAddViaDelegate - Condensing", {
		before() {
			return fnBefore.apply(this);
		},
		beforeEach() {
			return fnBeforeEach.apply(this);
		},
		afterEach() {
			return fnAfterEach.apply(this);
		},
		after() {
			return fnAfter.apply(this);
		}
	});

	QUnit.test("when a change handler skips layout creation", function(assert) {
		var oChangeHandler = createChangeHandler(true);
		this.oDelegate = {
			createLayout() {}
		};
		oChangeHandler.completeChangeContent(this.oChange, this.mSpecificChangeInfo, this.mPropertyBag);

		return oChangeHandler.getCondenserInfo(this.oChange, this.mPropertyBag).then(function(oCondenserInfo) {
			assert.notEqual(
				oCondenserInfo,
				undefined,
				"then condensing is enabled"
			);
		});
	});

	QUnit.test("when a delegate doesn't create a custom layout", function(assert) {
		var oChangeHandler = createChangeHandler(false);
		this.oDelegate = {};
		oChangeHandler.completeChangeContent(this.oChange, this.mSpecificChangeInfo, this.mPropertyBag);

		return oChangeHandler.getCondenserInfo(this.oChange, this.mPropertyBag).then(function(oCondenserInfo) {
			assert.notEqual(
				oCondenserInfo,
				undefined,
				"then condensing is enabled"
			);
		});
	});

	QUnit.test("when a delegate creates a custom layout", function(assert) {
		var oChangeHandler = createChangeHandler(false);
		this.oDelegate = {
			createLayout() {}
		};
		oChangeHandler.completeChangeContent(this.oChange, this.mSpecificChangeInfo, this.mPropertyBag);

		return oChangeHandler.getCondenserInfo(this.oChange, this.mPropertyBag).then(function(oCondenserInfo) {
			assert.strictEqual(
				oCondenserInfo,
				undefined,
				"then condensing is disabled"
			);
		});
	});

	QUnit.module("sap.ui.fl.changeHandler.BaseAddViaDelegate - ApplyChange", {
		before() {
			return fnBefore.apply(this);
		},
		beforeEach() {
			return fnBeforeEach.apply(this);
		},
		afterEach() {
			return fnAfterEach.apply(this);
		},
		after() {
			return fnAfter.apply(this);
		}
	});

	QUnit.test("when a change handler tries to add a control that already available", async function(assert) {
		const oAddPropertyStub = sandbox.stub();
		const oGetRevertDataStub = sandbox.stub(this.oChange, "getRevertData").returns({});
		const oChangeHandler = createChangeHandler(false, oAddPropertyStub);
		this.oDelegate = {
			createLayout() {
				this.oNewButton = new Button("someControlId", {text: "someText"});
				return {
					control: this.oNewButton
				};
			}
		};
		const oExistingButton = new Button("someControlId", {text: "someText"});
		oChangeHandler.completeChangeContent(this.oChange, this.mSpecificChangeInfo, this.mPropertyBag);
		try {
			await oChangeHandler.applyChange(this.oChange, this.oForm, this.mPropertyBag);
		} catch (oError) {
			assert.strictEqual(
				oError.message,
				`Control to be created already exists:${oExistingButton.getId()}`,
				"then the error is thrown"
			);
			assert.ok(
				this.oGetWriteDelegateForControlStub.notCalled,
				"then the getWriteDelegateForControl method is not called"
			);
			assert.ok(
				oGetRevertDataStub.notCalled,
				"then the getRevertData method is not called"
			);
			assert.ok(
				oAddPropertyStub.notCalled,
				"then the addProperty method is not called"
			);
			this.oNewButton?.destroy();
			oExistingButton.destroy();
		}
	});

	QUnit.test("when a change handler tries to add a control but the write delegate is not available", async function(assert) {
		const oAddPropertyStub = sandbox.stub();
		const oChangeHandler = createChangeHandler(false, oAddPropertyStub);
		this.oGetWriteDelegateForControlStub.restore();
		this.oGetWriteDelegateForControlStub = sandbox.stub(DelegateMediatorAPI, "getWriteDelegateForControl")
		.callsFake(function() {
			return Promise.resolve(undefined);
		});
		oChangeHandler.completeChangeContent(this.oChange, this.mSpecificChangeInfo, this.mPropertyBag);
		try {
			await oChangeHandler.applyChange(this.oChange, this.oForm, this.mPropertyBag);
		} catch (oError) {
			assert.strictEqual(
				oError.message,
				"No delegate found for control testForm",
				"then the error is thrown"
			);
			assert.ok(
				this.oGetWriteDelegateForControlStub.calledOnce,
				"then the getWriteDelegateForControl method is called once"
			);
			assert.ok(
				oAddPropertyStub.notCalled,
				"then the addProperty method is not called"
			);
		}
	});

	QUnit.test("when a change handler applies change sucessfully", async function(assert) {
		const oChangeHandler = createChangeHandler(false, function(mAddPropertySettings) {
			assert.strictEqual(
				mAddPropertySettings.control.getId(),
				"testForm",
				"then the parent control is passed correctly"
			);
			assert.strictEqual(
				mAddPropertySettings.innerControls.control.getId(),
				"someControlId",
				"then the control is created correctly"
			);
			assert.strictEqual(
				mAddPropertySettings.change,
				this.oChange,
				"then the change is passed correctly"
			);
			assert.strictEqual(
				mAddPropertySettings.appComponent,
				this.oComponent,
				"then the app component is passed correctly"
			);
			assert.deepEqual(
				mAddPropertySettings.modifier,
				JsControlTreeModifier,
				"then the modifier is passed correctly"
			);
			assert.strictEqual(
				mAddPropertySettings.change.getRevertData().newFieldSelector.id,
				"someControlId",
				"then the field selector is passed correctly"
			);
		}.bind(this));
		this.oDelegate = {
			createLayout: () => {
				return {
					control: {
						getId: () => "someControlId"
					}
				};
			}
		};
		oChangeHandler.completeChangeContent(this.oChange, this.mSpecificChangeInfo, this.mPropertyBag);
		await oChangeHandler.applyChange(this.oChange, this.oForm, this.mPropertyBag);
		assert.ok(
			this.oGetWriteDelegateForControlStub.calledOnce,
			"then the getWriteDelegateForControl method is called once"
		);
	});

	// with valueHelp available

	QUnit.test("when a change handler applies change sucessfully with valueHelp", async function(assert) {
		const oAddPropertyStub = sandbox.stub();
		const oChangeHandler = createChangeHandler(false, oAddPropertyStub);
		this.oDelegate = {
			createLayout: () => {
				return {
					control: {
						getId: () => "someControlId"
					},
					valueHelp: {
						getId: () => "valueHelpId"
					}
				};
			}
		};
		oChangeHandler.completeChangeContent(this.oChange, this.mSpecificChangeInfo, this.mPropertyBag);
		await oChangeHandler.applyChange(this.oChange, this.oForm, this.mPropertyBag);
		assert.ok(
			this.oGetWriteDelegateForControlStub.calledOnce,
			"then the getWriteDelegateForControl method is called once"
		);
		assert.ok(
			oAddPropertyStub.called,
			"then the addProperty method is called"
		);
		const oRevertData = this.oChange.getRevertData();
		assert.strictEqual(
			oRevertData.newFieldSelector.id,
			"someControlId",
			"then the field selector is passed correctly"
		);
		assert.strictEqual(
			oRevertData.valueHelpSelector.id,
			"valueHelpId",
			"then the field selector is passed correctly"
		);
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});