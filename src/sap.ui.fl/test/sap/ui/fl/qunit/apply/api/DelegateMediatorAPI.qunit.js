/* global QUnit */

sap.ui.define([
	"sap/base/Log",
	"sap/ui/fl/apply/_internal/DelegateMediator",
	"sap/ui/fl/apply/api/DelegateMediatorAPI",
	"sap/ui/core/util/reflection/JsControlTreeModifier",
	"sap/ui/core/util/reflection/XmlTreeModifier",
	"sap/ui/core/CustomData",
	"sap/ui/model/json/JSONModel",
	"sap/m/Panel",
	"sap/m/Button",
	"sap/ui/rta/enablement/TestDelegate",
	"sap/ui/thirdparty/sinon-4",
	"test-resources/sap/ui/fl/qunit/FlQUnitUtils"
], function(
	Log,
	DelegateMediator,
	DelegateMediatorAPI,
	JsControlTreeModifier,
	XmlTreeModifier,
	CustomData,
	JSONModel,
	Panel,
	Button,
	TestDelegate,
	sinon,
	FlQUnitUtils
) {
	"use strict";

	const sandbox = sinon.createSandbox();

	const mRequiredLibraries = {
		"sap.some.lib": {
			minVersion: "1.81",
			lazy: false
		}
	};

	QUnit.module("Given 'registerReadDelegate' function is called", {
		beforeEach() {
			this.mPropertyBag = {
				modelType: "test_modelType",
				delegate: "test_delegate"
			};
		},
		afterEach() {
			DelegateMediator.clear();
		}
	});

	QUnit.test("When it is called with invalid 'delegate' property", function(assert) {
		delete this.mPropertyBag.delegate;
		assert.throws(
			function() {
				DelegateMediatorAPI.registerReadDelegate(this.mPropertyBag);
			}.bind(this),
			/'modelType' and 'delegate' properties are required for registration!/,
			"then an exception is thrown"
		);
	});

	QUnit.test("When it is called with invalid 'modelType' property", function(assert) {
		delete this.mPropertyBag.modelType;
		assert.throws(
			function() {
				DelegateMediatorAPI.registerReadDelegate(this.mPropertyBag);
			}.bind(this),
			/'modelType' and 'delegate' properties are required for registration!/,
			"then an exception is thrown"
		);
	});

	QUnit.test("When it is called with valid property bag multiple times", function(assert) {
		DelegateMediatorAPI.registerReadDelegate(this.mPropertyBag);
		this.mPropertyBag.delegate = "test_delegate2";
		assert.throws(
			function() {
				DelegateMediatorAPI.registerReadDelegate(this.mPropertyBag);
			}.bind(this),
			/is already defined!/,
			"then an exception is thrown"
		);
	});

	QUnit.module("Given 'registerWriteDelegate' function is called", {
		beforeEach() {
			this.mPropertyBag = {
				controlType: "test_controlType",
				delegate: "test_delegate"
			};
		},
		afterEach() {
			DelegateMediator.clear();
		}
	});

	QUnit.test("When it is called with invalid delegate property", function(assert) {
		delete this.mPropertyBag.delegate;
		assert.throws(
			function() {
				DelegateMediatorAPI.registerWriteDelegate(this.mPropertyBag);
			}.bind(this),
			/'controlType' and 'delegate' properties are required for registration!/,
			"then an exception is thrown"
		);
	});

	QUnit.test("When it is called with invalid controlType property", function(assert) {
		delete this.mPropertyBag.controlType;
		assert.throws(
			function() {
				DelegateMediatorAPI.registerWriteDelegate(this.mPropertyBag);
			}.bind(this),
			/'controlType' and 'delegate' properties are required for registration!/,
			"then an exception is thrown"
		);
	});

	// ensure a modelspecific read delegate exists for a model not used anywhere else
	const SomeModel = JSONModel.extend("sap.ui.fl.qunit.test.Model");

	function createPropertyBag(oControl, oModifier, sModelType) {
		return {
			control: oControl,
			modifier: oModifier,
			modelType: sModelType
		};
	}

	QUnit.module("Given 'getReadDelegateForControl' function is called", {
		beforeEach() {
			this.mPropertyBag = {
				modelType: SomeModel.getMetadata().getName(),
				delegate: "sap/ui/rta/enablement/TestDelegate"
			};
			this.oPanel = new Panel("test_panel");
		},
		afterEach() {
			DelegateMediator.clear();
			this.oPanel.destroy();
			sandbox.restore();
		}
	});

	QUnit.test("When it is called with control without model specified", async function(assert) {
		DelegateMediatorAPI.registerReadDelegate(this.mPropertyBag);
		sandbox.stub(this.oPanel, "getModel").returns(undefined);
		const mReadDelegateInfo = await DelegateMediatorAPI.getReadDelegateForControl(
			createPropertyBag(this.oPanel, JsControlTreeModifier, undefined)
		);
		assert.notOk(mReadDelegateInfo, "then an 'undefined' is returned");
	});

	QUnit.test("When it is called without delegate specified", async function(assert) {
		const mReadDelegateInfo = await DelegateMediatorAPI.getReadDelegateForControl(
			createPropertyBag(this.oPanel, JsControlTreeModifier, this.mPropertyBag.modelType)
		);
		assert.notOk(mReadDelegateInfo, "then an 'undefined' is returned");
	});

	QUnit.test("When delegate could not be loaded", async function(assert) {
		DelegateMediatorAPI.registerReadDelegate(this.mPropertyBag);
		sandbox.stub(sap.ui, "require")
		.withArgs(["sap/ui/rta/enablement/TestDelegate"])
		.callsFake(function(...aArgs) {
			aArgs[2](new Error(""));
		});
		const oLogSpy = sandbox.spy(Log, "error");
		const mReadDelegateInfo = await DelegateMediatorAPI.getReadDelegateForControl(
			createPropertyBag(this.oPanel, JsControlTreeModifier, this.mPropertyBag.modelType)
		);
		assert.notOk(mReadDelegateInfo, "then delegate info as return value is not available");
		assert.ok(
			oLogSpy.getCall(0).args[0].includes("Failed to load the delegate for the control"),
			"then an error message is logged into console"
		);
		sandbox.restore();
	});

	QUnit.module("Given 'getWriteDelegateForControl' function is called", {
		beforeEach() {
			this.oPanel = new Panel("test_panel");
		},
		afterEach() {
			DelegateMediator.clear();
			this.oPanel.destroy();
			sandbox.restore();
		}
	});

	QUnit.test("When it is called with just control specific delegate specified (xml case)", function(assert) {
		const mPayload = { someProperty: "some_payload" };
		DelegateMediatorAPI.registerWriteDelegate({
			controlType: "sap.ui.rta.someControlType",
			delegate: "sap/ui/rta/enablement/TestDelegate",
			payload: mPayload
		});
		const vDomNode = document.getElementById("qunit-fixture");
		sandbox.stub(XmlTreeModifier, "getControlMetadata").resolves(
			{ getName: () => "sap.ui.rta.someControlType" }
		);
		return DelegateMediatorAPI.getWriteDelegateForControl(createPropertyBag(vDomNode, XmlTreeModifier))
		.then(function(mDelegateInfo) {
			const mTestDelegate = { ...TestDelegate };
			delete mTestDelegate.getPropertyInfo;
			assert.deepEqual(
				mDelegateInfo.instance,
				mTestDelegate,
				"then the specific delegate info is returned"
			);
			assert.deepEqual(
				mDelegateInfo.payload,
				mPayload,
				"then the specific delegate info contains the registered payload"
			);
			assert.notOk(
				mDelegateInfo.modelType,
				"then modelType 'undefined' is returned"
			);
		});
	});

	QUnit.test("When it is called with valid property bag multiple times with different control types (js case)", async function(assert) {
		DelegateMediatorAPI.registerWriteDelegate({
			controlType: "sap.m.Panel",
			delegate: "sap/ui/rta/enablement/ControlSpecificDelegate"
		});
		const oWriteTestDelegate = {
			createLayout() {
				return Promise.resolve();
			}
		};
		FlQUnitUtils.stubSapUiRequire(sandbox, [
			{
				name: ["sap/ui/rta/enablement/ControlSpecificDelegate"],
				stub: oWriteTestDelegate
			}
		]);
		const mFirstDelegateInfo = await DelegateMediatorAPI.getWriteDelegateForControl(
			createPropertyBag(this.oPanel, JsControlTreeModifier)
		);
		assert.strictEqual(
			mFirstDelegateInfo.controlType,
			"sap.m.Panel",
			"then the first delegate is registered successfull with the given controlType"
		);
		DelegateMediatorAPI.registerWriteDelegate({
			controlType: "test_controlType",
			delegate: "sap/ui/rta/enablement/ControlSpecificDelegate"
		});
		sandbox.stub(this.oPanel.getMetadata(), "getName").returns("test_controlType");
		const mSecondDelegateInfo = await DelegateMediatorAPI.getWriteDelegateForControl(
			createPropertyBag(this.oPanel, JsControlTreeModifier)
		);
		assert.strictEqual(
			mSecondDelegateInfo.controlType,
			"test_controlType",
			"then the second delegate is registered successfull with the given controlType"
		);
	});

	QUnit.test("When it is called with valid property bag multiple times (js case)", async function(assert) {
		DelegateMediatorAPI.registerWriteDelegate({
			controlType: "sap.m.Panel",
			delegate: "test_delegate1"
		});
		DelegateMediatorAPI.registerWriteDelegate({
			controlType: "sap.m.Panel",
			delegate: "test_delegate2"
		});
		const oWriteTestDelegate = {
			createLayout() {
				return Promise.resolve();
			}
		};
		FlQUnitUtils.stubSapUiRequire(sandbox, [
			{
				name: ["test_delegate1"],
				stub: oWriteTestDelegate
			},
			{
				name: ["test_delegate2"],
				stub: oWriteTestDelegate
			}
		]);
		const mWriteDelegateInfo = await DelegateMediatorAPI.getWriteDelegateForControl(
			createPropertyBag(this.oPanel, JsControlTreeModifier)
		);
		assert.deepEqual(
			mWriteDelegateInfo.name,
			"test_delegate2",
			"then the name of the last registered write delegate is returned"
		);
	});

	QUnit.module("Given 'getReadDelegateForControl' and 'getWriteDelegateForControl' functions are called", {
		beforeEach() {
			this.mPropertyBag = {
				modelType: SomeModel.getMetadata().getName(),
				delegate: "sap/ui/rta/enablement/TestDelegate",
				requiredLibraries: mRequiredLibraries
			};
			this.oPanel = new Panel("test_panel");
			this.oDelegateCustomData = {
				key: "sap-ui-custom-settings",
				value: {
					"sap.ui.fl": {
						delegate: '{"name": "sap/ui/rta/enablement/InstanceSpecificDelegate", "payload": {"someProperty": "some_payload"}}'
					}
				}
			};
		},
		afterEach() {
			DelegateMediator.clear();
			this.oPanel.destroy();
			sandbox.restore();
		}
	});

	QUnit.test("When it is called with both model specific read delegate and control specific write delegate defined (js case)", async function(assert) {
		const mPayload = { someProperty: "some_payload" };
		DelegateMediatorAPI.registerReadDelegate(this.mPropertyBag);
		DelegateMediatorAPI.registerWriteDelegate({
			controlType: "sap.m.Panel",
			delegate: "sap/ui/rta/enablement/ControlSpecificDelegate",
			payload: mPayload
		});
		const oWriteTestDelegate = {
			createLayout() {
				return Promise.resolve(new Button("myBrandNewButton"));
			}
		};
		FlQUnitUtils.stubSapUiRequire(sandbox, [
			{
				name: ["sap/ui/rta/enablement/ControlSpecificDelegate"],
				stub: oWriteTestDelegate
			}
		]);
		this.oPanel.setModel(new SomeModel());
		const mReadDelegateInfo = await DelegateMediatorAPI.getReadDelegateForControl(
			createPropertyBag(this.oPanel, JsControlTreeModifier, undefined)
		);
		assert.deepEqual(
			mReadDelegateInfo.name,
			"sap/ui/rta/enablement/TestDelegate",
			"then the name of read delegate is returned"
		);
		assert.strictEqual(
			mReadDelegateInfo.instance.getPropertyInfo,
			TestDelegate.getPropertyInfo,
			"then the read delegate is returned"
		);
		assert.strictEqual(
			mReadDelegateInfo.modelType,
			SomeModel.getMetadata().getName(),
			"then the specific delegate info contains the modelType"
		);
		const mWriteDelegateInfo = await DelegateMediatorAPI.getWriteDelegateForControl(
			createPropertyBag(this.oPanel, JsControlTreeModifier)
		);
		assert.deepEqual(
			mWriteDelegateInfo.name,
			"sap/ui/rta/enablement/ControlSpecificDelegate",
			"then the name of the write delegate is returned"
		);
		assert.deepEqual(
			mWriteDelegateInfo.instance.createLayout,
			oWriteTestDelegate.createLayout,
			"then the write part of the control specific delegate is returned"
		);
		const oTestButton = await mWriteDelegateInfo.instance.createLayout();
		assert.deepEqual(
			oTestButton?.getId(),
			"myBrandNewButton",
			"then the specific delegate info contains the method from control specific delegate"
		);
		assert.deepEqual(
			mWriteDelegateInfo.controlType,
			"sap.m.Panel",
			"then the specific delegate info contains the registered payload"
		);
		assert.deepEqual(
			mWriteDelegateInfo.payload,
			mPayload,
			"then the specific delegate info contains the registered payload"
		);
		oTestButton.destroy();
	});

	QUnit.test("When it is called with all delegate types defined: the model specific read, control specific write "
	+ "and instance specific read and write delegate defined (js case)", async function(assert) {
		DelegateMediatorAPI.registerReadDelegate(this.mPropertyBag);
		const mPayload = { someOtherProperty: "some_other_payload" };
		DelegateMediatorAPI.registerWriteDelegate({
			controlType: "sap.m.Panel",
			delegate: "sap/ui/rta/enablement/ControlSpecificDelegate",
			delegateType: "writeonly",
			payload: mPayload
		});
		this.oPanel.addCustomData(new CustomData(this.oDelegateCustomData));
		const oWriteTestDelegate = {
			createLayout() {
				return Promise.resolve(new Button("myControlSpecificButton"));
			}
		};
		const oInstanceSpecificTestDelegate = {
			getPropertyInfo() {
				return Promise.resolve([{
					name: "testProperty",
					bindingPath: "fakepath"
				}]);
			},
			createLayout() {
				return Promise.resolve(new Button("myInstanceSpecificButton"));
			}
		};
		FlQUnitUtils.stubSapUiRequire(sandbox, [
			{
				name: ["sap/ui/rta/enablement/InstanceSpecificDelegate"],
				stub: oInstanceSpecificTestDelegate
			},
			{
				name: ["sap/ui/rta/enablement/ControlSpecificDelegate"],
				stub: oWriteTestDelegate
			}
		]);
		this.oPanel.setModel(new SomeModel());
		const mReadDelegateInfo = await DelegateMediatorAPI.getReadDelegateForControl(
			createPropertyBag(this.oPanel, JsControlTreeModifier, undefined)
		);
		assert.deepEqual(
			mReadDelegateInfo.instance.getPropertyInfo,
			oInstanceSpecificTestDelegate.getPropertyInfo,
			"then the read part from instance specific delegate is returned"
		);
		const mPropertyInfo = await mReadDelegateInfo.instance.getPropertyInfo();
		assert.strictEqual(
			mPropertyInfo[0].name,
			"testProperty",
			"then method from instance specific read delegate is executable"
		);
		assert.deepEqual(
			mReadDelegateInfo.name,
			"sap/ui/rta/enablement/InstanceSpecificDelegate",
			"then the instance specific read delegate info is returned"
		);
		assert.strictEqual(
			mReadDelegateInfo.modelType,
			undefined,
			"then the instance specific read delegate info does not contain any modelType"
		);

		const mWriteDelegateInfo = await DelegateMediatorAPI.getWriteDelegateForControl(
			createPropertyBag(this.oPanel, JsControlTreeModifier, undefined)
		);
		assert.deepEqual(
			mWriteDelegateInfo.instance.createLayout,
			oInstanceSpecificTestDelegate.createLayout,
			"then the write part from instance specific delegate is returned"
		);
		assert.deepEqual(
			mWriteDelegateInfo.name,
			"sap/ui/rta/enablement/InstanceSpecificDelegate",
			"then the instance specific write delegate info is returned"
		);
		assert.deepEqual(
			mWriteDelegateInfo.payload,
			{someProperty: "some_payload"},
			"then the instance specific write delegate info contains the registered payload"
		);
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});