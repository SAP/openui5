/* global QUnit */

sap.ui.define([
	"sap/base/Log",
	"sap/ui/fl/apply/_internal/DelegateMediator",
	"sap/ui/fl/apply/_internal/DelegateMediatorNew",
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
	DelegateMediatorNew,
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

	QUnit.module("Given 'registerDefaultDelegate' function is called", {
		beforeEach() {
			this.mPropertyBag = {
				modelType: "test_modelType",
				delegate: "test_delegate",
				delegateType: "complete"
			};
		},
		afterEach() {
			DelegateMediator.clear();
		}
	}, function() {
		QUnit.test("When it is called with invalid delegate property", function(assert) {
			delete this.mPropertyBag.delegate;
			assert.throws(function() {
				DelegateMediatorAPI.registerDefaultDelegate(this.mPropertyBag);
			}.bind(this), /'modelType' and 'delegate' properties are required for registration!/, "then an exception is thrown");
		});

		QUnit.test("When it is called with invalid modelType property", function(assert) {
			delete this.mPropertyBag.modelType;
			assert.throws(function() {
				DelegateMediatorAPI.registerDefaultDelegate(this.mPropertyBag);
			}.bind(this), /'modelType' and 'delegate' properties are required for registration!/, "then an exception is thrown");
		});

		QUnit.test("When it is called with valid property bag", function(assert) {
			DelegateMediatorAPI.registerDefaultDelegate(this.mPropertyBag);
			assert.ok(
				DelegateMediator.isDelegateRegistered(this.mPropertyBag.modelType),
				"then the delegate is registered successfull with the given modelType"
			);
		});

		QUnit.test("When it is called with valid property bag including optional requiredLibraries property", function(assert) {
			this.mPropertyBag.requiredLibraries = mRequiredLibraries;
			DelegateMediatorAPI.registerDefaultDelegate(this.mPropertyBag);
			assert.ok(
				DelegateMediator.isDelegateRegistered(this.mPropertyBag.modelType),
				"then the delegate is registered successfull with the given modelType"
			);
		});

		QUnit.test("When it is called with valid property bag multiple times with harmonized delegate types", function(assert) {
			this.mPropertyBag.requiredLibraries = mRequiredLibraries;
			this.mPropertyBag.delegateType = "readonly";
			DelegateMediatorAPI.registerDefaultDelegate(this.mPropertyBag);
			this.mPropertyBag.delegateType = "writeonly";
			DelegateMediatorAPI.registerDefaultDelegate(this.mPropertyBag);
			assert.ok(
				DelegateMediator.isDelegateRegistered(this.mPropertyBag.modelType),
				"then the delegate is registered successfull with the given modelType"
			);
		});

		[["readonly", "readonly"], ["writeonly", "complete"], ["complete", "writeonly"]].forEach(function(sDelegateType) {
			QUnit.test(`When try to register the same modelType with with already existing '${sDelegateType[0]}' delegate`, function(assert) {
				[this.mPropertyBag.delegateType] = sDelegateType;
				DelegateMediatorAPI.registerDefaultDelegate(this.mPropertyBag);
				assert.throws(function() {
					[, this.mPropertyBag.delegateType] = sDelegateType;
					DelegateMediatorAPI.registerDefaultDelegate(this.mPropertyBag);
				}.bind(this), /is already defined!/, "then an exception is thrown");
			});
		});
	});

	QUnit.module("Given 'registerReadDelegate' function is called", {
		beforeEach() {
			this.mPropertyBag = {
				modelType: "test_modelType",
				delegate: "test_delegate"
			};
		},
		afterEach() {
			DelegateMediatorNew.clear();
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
			DelegateMediatorNew.clear();
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

	// ensure a default delegate exists for a model not used anywhere else
	const SomeModel = JSONModel.extend("sap.ui.fl.qunit.test.Model");

	function createPropertyBag(oControl, oModifier, sModelType, bSupportsDefault) {
		return {
			control: oControl,
			modifier: oModifier,
			modelType: sModelType,
			supportsDefault: bSupportsDefault
		};
	}

	QUnit.module("Given 'getDelegateForControl' function is called", {
		beforeEach() {
			this.mPropertyBag = {
				modelType: SomeModel.getMetadata().getName(),
				delegate: "sap/ui/rta/enablement/TestDelegate",
				requiredLibraries: mRequiredLibraries,
				delegateType: "complete"
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
			DelegateMediatorNew.clear();
			this.oPanel.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("When it is called with undefined control property", function(assert) {
			return DelegateMediatorAPI.getDelegateForControl(createPropertyBag(undefined, JsControlTreeModifier))
			.catch(function(vError) {
				assert.strictEqual(vError.message, "The control parameter is missing", "then an exception is thrown");
			});
		});

		QUnit.test("When it is called with invalid control property", function(assert) {
			return DelegateMediatorAPI.getDelegateForControl(createPropertyBag({ id: "test_object" }, JsControlTreeModifier))
			.catch(function(vError) {
				assert.strictEqual(vError.message, "The input control should be a managed object", "then an exception is thrown");
			});
		});

		QUnit.test("When it is called with undefined modifier property", function(assert) {
			return DelegateMediatorAPI.getDelegateForControl(createPropertyBag(this.oPanel, undefined))
			.catch(function(vError) {
				assert.strictEqual(vError.message, "The modifier parameter is missing", "then an exception is thrown");
			});
		});

		QUnit.test("When it is called without delegate specified", function(assert) {
			return DelegateMediatorAPI.getDelegateForControl(createPropertyBag(this.oPanel, JsControlTreeModifier))
			.then(function(vReturnValue) {
				assert.notOk(vReturnValue, "then an 'undefined' is returned");
			});
		});

		QUnit.test("When it is called without delegate specified (XML Case)", function(assert) {
			const vDomNode = document.getElementById("qunit-fixture");
			sandbox.stub(XmlTreeModifier, "getControlMetadata").resolves(
				{ getName: () => "sap.ui.rta.someControlType" }
			);
			return DelegateMediatorAPI.getDelegateForControl(createPropertyBag(vDomNode, XmlTreeModifier))
			.then(function(vReturnValue) {
				assert.notOk(vReturnValue, "then an 'undefined' is returned");
			});
		});

		QUnit.test("When it is called with delegate specified as default delegate (XML Case)", function(assert) {
			const vDomNode = document.getElementById("qunit-fixture");
			sandbox.stub(XmlTreeModifier, "getControlMetadata").resolves(
				{ getName: () => "sap.ui.rta.someControlType" }
			);
			DelegateMediatorAPI.registerDefaultDelegate(this.mPropertyBag);
			const mPropertyBag = createPropertyBag(vDomNode, XmlTreeModifier, this.mPropertyBag.modelType, true);
			return DelegateMediatorAPI.getDelegateForControl(mPropertyBag)
			.then(function(mDelegateInfo) {
				assert.deepEqual(mDelegateInfo.instance, TestDelegate, "then the default delegate info is returned");
				assert.deepEqual(mDelegateInfo.names, [this.mPropertyBag.delegate], "then the default delegate info is returned");
				assert.deepEqual(mDelegateInfo.payload, {}, "then the default delegate info contains an empty payload");
				assert.strictEqual(
					mDelegateInfo.modelType,
					this.mPropertyBag.modelType,
					"then the default delegate info contains the modelType"
				);
				assert.strictEqual(
					mDelegateInfo.delegateType,
					DelegateMediatorAPI.types.COMPLETE,
					"then the default delegate contains the delegateType"
				);
				assert.deepEqual(
					mDelegateInfo.requiredLibraries,
					this.mPropertyBag.requiredLibraries,
					"then the default delegate info contains the passed required libraries"
				);
			}.bind(this));
		});

		QUnit.test("When it is called with delegate specified as default delegate (JS Case)", function(assert) {
			this.oPanel.setModel(new SomeModel());
			DelegateMediatorAPI.registerDefaultDelegate(this.mPropertyBag);
			return DelegateMediatorAPI.getDelegateForControl(createPropertyBag(this.oPanel, JsControlTreeModifier, undefined, true))
			.then(function(mDelegateInfo) {
				assert.deepEqual(mDelegateInfo.instance, TestDelegate, "then the default delegate info is returned");
				assert.deepEqual(mDelegateInfo.names, [this.mPropertyBag.delegate], "then the default delegate info is returned");
				assert.deepEqual(mDelegateInfo.payload, {}, "then the default delegate info contains an empty payload");
				assert.strictEqual(
					mDelegateInfo.modelType,
					SomeModel.getMetadata().getName(),
					"then the default delegate info contains the modelType"
				);
				assert.strictEqual(
					mDelegateInfo.delegateType,
					DelegateMediatorAPI.types.COMPLETE,
					"then the default delegate contains the delegateType"
				);
				assert.deepEqual(
					mDelegateInfo.requiredLibraries,
					this.mPropertyBag.requiredLibraries,
					"then the default delegate info contains the passed required libraries"
				);
			}.bind(this));
		});

		QUnit.test("When it is called with delegate specified as default delegate (JS Case) without required libraries registered", function(assert) {
			this.oPanel.setModel(new SomeModel());
			delete this.mPropertyBag.requiredLibraries;
			DelegateMediatorAPI.registerDefaultDelegate(this.mPropertyBag);
			return DelegateMediatorAPI.getDelegateForControl(createPropertyBag(this.oPanel, JsControlTreeModifier, undefined, true))
			.then(function(mDelegateInfo) {
				assert.deepEqual(mDelegateInfo.instance, TestDelegate, "then the default delegate info is returned");
				assert.deepEqual(mDelegateInfo.names, [this.mPropertyBag.delegate], "then the default delegate info is returned");
				assert.deepEqual(mDelegateInfo.payload, {}, "then the default delegate info contains an empty payload");
				assert.strictEqual(
					mDelegateInfo.modelType,
					SomeModel.getMetadata().getName(),
					"then the default delegate info contains the modelType"
				);
				assert.notOk(
					mDelegateInfo.requiredLibraries,
					"then the default delegate does not contain any required libraries defined as default"
				);
			}.bind(this));
		});

		QUnit.test("When default delegate is available, but default delegate should be ignored (XML Case)", function(assert) {
			const vDomNode = document.getElementById("qunit-fixture");
			sandbox.stub(XmlTreeModifier, "getControlMetadata").resolves(
				{ getName: () => "sap.ui.rta.someControlType" }
			);
			DelegateMediatorAPI.registerDefaultDelegate(this.mPropertyBag);
			return DelegateMediatorAPI.getDelegateForControl(createPropertyBag(vDomNode, XmlTreeModifier, this.mPropertyBag.modelType))
			.then(function(mDelegateInfo) {
				assert.notOk(mDelegateInfo, "then an 'undefined' is returned");
			});
		});

		QUnit.test("When default delegate is available, but default delegate should be ignored (JS Case)", function(assert) {
			this.oPanel.setModel(new SomeModel());
			DelegateMediatorAPI.registerDefaultDelegate(this.mPropertyBag);
			return DelegateMediatorAPI.getDelegateForControl(createPropertyBag(this.oPanel, JsControlTreeModifier))
			.then(function(mDelegateInfo) {
				assert.notOk(mDelegateInfo, "then an 'undefined' is returned");
			});
		});

		QUnit.test("When multiple default delegates are available, without instancespecific delegate definition", function(assert) {
			this.oPanel.setModel(new SomeModel());
			DelegateMediatorAPI.registerDefaultDelegate({
				modelType: SomeModel.getMetadata().getName(),
				delegate: "sap/ui/rta/enablement/TestDelegate1",
				requiredLibraries: mRequiredLibraries,
				delegateType: "readonly"
			});
			DelegateMediatorAPI.registerDefaultDelegate({
				modelType: SomeModel.getMetadata().getName(),
				delegate: "sap/ui/rta/enablement/TestDelegate2",
				requiredLibraries: {
					"sap.some.other.lib": {
						minVersion: "1.81",
						lazy: false
					}
				},
				delegateType: "writeonly"
			});
			const oFakeReadOnlyDelegate = {
				getPropertyInfo() {
					return Promise.resolve([{
						name: "testProperty",
						bindingPath: "fakepath"
					}]);
				}
			};
			const oFakeWriteOnlyDelegate = {
				createLabel() {
					return Promise.resolve(new Button("myBrandNewButton"));
				}
			};
			FlQUnitUtils.stubSapUiRequire(sandbox, [
				{
					name: ["sap/ui/rta/enablement/TestDelegate1"],
					stub: oFakeReadOnlyDelegate
				},
				{
					name: ["sap/ui/rta/enablement/TestDelegate2"],
					stub: oFakeWriteOnlyDelegate
				}
			]);

			return DelegateMediatorAPI.getDelegateForControl(createPropertyBag(this.oPanel, JsControlTreeModifier, undefined, true))
			.then(function(mDelegateInfo) {
				assert.ok(mDelegateInfo, "then delegate info is returned");
				assert.deepEqual(
					mDelegateInfo.names,
					["sap/ui/rta/enablement/TestDelegate2", "sap/ui/rta/enablement/TestDelegate1"],
					"then names are returned as expected"
				);
				assert.deepEqual(
					Object.keys(mDelegateInfo.requiredLibraries),
					["sap.some.other.lib", "sap.some.lib"],
					"then instance contains the method from write delegate"
				);
				assert.deepEqual(mDelegateInfo.payload, {}, "then the default delegate info contains an empty payload");
				assert.strictEqual(
					mDelegateInfo.modelType,
					SomeModel.getMetadata().getName(),
					"then the default delegate info contains the modelType"
				);
				assert.strictEqual(
					mDelegateInfo.delegateType,
					DelegateMediatorAPI.types.READONLY,
					"then the default delegate contains the delegateType"
				);
				assert.ok(mDelegateInfo.instance.getPropertyInfo, "then instance contains the method from read delegate");
				assert.ok(mDelegateInfo.instance.createLabel, "then instance contains the method from write delegate");
				return mDelegateInfo.instance.getPropertyInfo()
				.then(function(mPropertyInfo) {
					assert.strictEqual(mPropertyInfo[0].name, "testProperty", "then method from read delegate is executable");
					return mDelegateInfo.instance.createLabel();
				})
				.then(function(oElement) {
					assert.strictEqual(oElement.getId(), "myBrandNewButton", "then method from write delegate is executable");
					oElement.destroy();
				});
			});
		});

		QUnit.test("When read-only default delegate and instancespecific delegate definition on control is available", function(assert) {
			this.oPanel.addCustomData(new CustomData(this.oDelegateCustomData));
			this.oPanel.setModel(new SomeModel());
			DelegateMediatorAPI.registerDefaultDelegate({
				modelType: SomeModel.getMetadata().getName(),
				delegate: "sap/ui/rta/enablement/readonly/TestDelegate",
				requiredLibraries: mRequiredLibraries,
				delegateType: "readonly"
			});
			const oFakeReadOnlyDelegate = {
				getPropertyInfo() {
					return Promise.resolve([{
						name: "testProperty",
						bindingPath: "fakepath"
					}]);
				}
			};
			const oFakeWriteOnlyDelegate = {
				createLabel() {
					return Promise.resolve(new Button("buttonFromInstancespecificDelegate"));
				}
			};
			FlQUnitUtils.stubSapUiRequire(sandbox, [
				{
					name: "sap/ui/rta/enablement/readonly/TestDelegate",
					stub: oFakeReadOnlyDelegate
				},
				{
					name: "sap/ui/rta/enablement/InstanceSpecificDelegate",
					stub: oFakeWriteOnlyDelegate
				}
			]);

			return DelegateMediatorAPI.getDelegateForControl(createPropertyBag(this.oPanel, JsControlTreeModifier, undefined, true))
			.then(function(mDelegateInfo) {
				assert.ok(mDelegateInfo, "then delegate info is returned");
				assert.deepEqual(
					mDelegateInfo.names,
					["sap/ui/rta/enablement/InstanceSpecificDelegate", "sap/ui/rta/enablement/readonly/TestDelegate"],
					"then names are returned as expected"
				);
				assert.deepEqual(
					Object.keys(mDelegateInfo.requiredLibraries),
					["sap.some.lib"],
					"then instance contains the method from write delegate"
				);
				assert.deepEqual(
					mDelegateInfo.payload,
					{someProperty: "some_payload"},
					"then the default delegate info contains the registered payload"
				);
				assert.strictEqual(
					mDelegateInfo.modelType,
					SomeModel.getMetadata().getName(),
					"then the default delegate info contains the modelType"
				);
				assert.strictEqual(
					mDelegateInfo.delegateType,
					DelegateMediatorAPI.types.READONLY,
					"then the default delegate contains the delegateType"
				);
				assert.ok(mDelegateInfo.instance.getPropertyInfo, "then instance contains the method from read delegate");
				assert.ok(mDelegateInfo.instance.createLabel, "then instance contains the method from write delegate");
				return mDelegateInfo.instance.getPropertyInfo()
				.then(function(mPropertyInfo) {
					assert.strictEqual(mPropertyInfo[0].name, "testProperty", "then method from read delegate is executable");
					return mDelegateInfo.instance.createLabel();
				})
				.then(function(oElement) {
					assert.strictEqual(
						oElement.getId(),
						"buttonFromInstancespecificDelegate",
						"then method from write delegate is executable"
					);
				});
			});
		});

		QUnit.test("When no default delegate is available, but default delegate is asked (XML Case)", function(assert) {
			const vDomNode = document.getElementById("qunit-fixture");
			sandbox.stub(XmlTreeModifier, "getControlMetadata").resolves(
				{ getName: () => "sap.ui.rta.someControlType" }
			);
			return DelegateMediatorAPI.getDelegateForControl(createPropertyBag(vDomNode, XmlTreeModifier, "some.not.existing.model", true))
			.then(function(mDelegateInfo) {
				assert.notOk(mDelegateInfo, "then an 'undefined' is returned");
			});
		});

		QUnit.test("When no default delegate is available, but default delegate is asked (JS Case)", function(assert) {
			this.oPanel.setModel(new SomeModel());
			const mPropertyBag = createPropertyBag(this.oPanel, JsControlTreeModifier, "some.not.existing.model", true);
			return DelegateMediatorAPI.getDelegateForControl(mPropertyBag)
			.then(function(mDelegateInfo) {
				assert.notOk(mDelegateInfo, "then an 'undefined' is returned");
			});
		});

		QUnit.test("When it is called with delegate specified into the control custom data and without default delegate registration", function(assert) {
			this.oPanel.addCustomData(new CustomData(this.oDelegateCustomData));
			const oInstanceSpecificTestDelegate = {
				createLayout() {
					return Promise.resolve(new Button("myInstanceSpecificButton"));
				}
			};
			FlQUnitUtils.stubSapUiRequire(sandbox, [
				{
					name: ["sap/ui/rta/enablement/InstanceSpecificDelegate"],
					stub: oInstanceSpecificTestDelegate
				}
			]);
			return DelegateMediatorAPI.getDelegateForControl(createPropertyBag(this.oPanel, JsControlTreeModifier))
			.then(function(mDelegateInfo) {
				assert.deepEqual(
					mDelegateInfo.instance,
					oInstanceSpecificTestDelegate,
					"then the specific delegate info is returned"
				);
				assert.deepEqual(
					mDelegateInfo.payload,
					{someProperty: "some_payload"},
					"then the default delegate info contains the registered payload"
				);
				assert.notOk(
					mDelegateInfo.modelType,
					"then modelType 'undefined' is returned"
				);
			});
		});

		QUnit.test("When it is called with delegate specified into the control custom data and default delegate registration is available", function(assert) {
			this.oPanel.addCustomData(new CustomData(this.oDelegateCustomData));
			const oInstanceSpecificTestDelegate = {
				createLayout() {
					return Promise.resolve(new Button("myInstanceSpecificButton"));
				}
			};
			FlQUnitUtils.stubSapUiRequire(sandbox, [
				{
					name: ["sap/ui/rta/enablement/InstanceSpecificDelegate"],
					stub: oInstanceSpecificTestDelegate
				}
			]);
			this.oPanel.setModel(new SomeModel());
			DelegateMediatorAPI.registerDefaultDelegate({
				modelType: SomeModel.getMetadata().getName(),
				delegate: "notExistingDelegate/WouldBreakIfDefaultDelegateGetLoaded",
				delegateType: "complete"
			});
			return DelegateMediatorAPI.getDelegateForControl(createPropertyBag(this.oPanel, JsControlTreeModifier))
			.then(function(mDelegateInfo) {
				assert.deepEqual(
					mDelegateInfo.instance,
					oInstanceSpecificTestDelegate,
					"then the specific delegate info is returned"
				);
				assert.deepEqual(
					mDelegateInfo.payload,
					{someProperty: "some_payload"},
					"then the default delegate info contains the registered payload"
				);
				assert.notOk(
					mDelegateInfo.modelType,
					"then modelType 'undefined' is returned"
				);
			});
		});
	});

	QUnit.module("Given 'getReadDelegateForControl' function is called", {
		beforeEach() {
			this.mPropertyBag = {
				modelType: SomeModel.getMetadata().getName(),
				delegate: "sap/ui/rta/enablement/TestDelegate"
			};
			this.oPanel = new Panel("test_panel");
		},
		afterEach() {
			DelegateMediatorNew.clear();
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
			DelegateMediatorNew.clear();
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
			const mTestDelegate = Object.assign({}, TestDelegate);
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

	QUnit.module("Given 'getReadDelegateForControl' and 'getWriteDelegateForControl' function is called", {
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
			DelegateMediatorNew.clear();
			this.oPanel.destroy();
			sandbox.restore();
		}
	});

	QUnit.test("When it is called with both default read delegate and control specific write delegate defined (js case)", async function(assert) {
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

	QUnit.test("When it is called with all delegate types defined: the default read, control specific write and instance specific read and write delegate defined (js case)", async function(assert) {
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

	QUnit.module("Given 'getKnownDefaultDelegateLibraries' function is called", function() {
		QUnit.test("When it is called", function(assert) {
			const aExpectedResult = ["sap.ui.comp"];
			const aExistingKnownDefaultDelegateLibs = DelegateMediatorAPI.getKnownDefaultDelegateLibraries();
			assert.deepEqual(
				aExistingKnownDefaultDelegateLibs,
				aExpectedResult,
				"then the known libs for default delegate locations are returned"
			);
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});