/* global QUnit */

sap.ui.define([
	"sap/ui/fl/apply/_internal/DelegateMediator",
	"sap/ui/fl/apply/api/DelegateMediatorAPI",
	"sap/ui/core/util/reflection/JsControlTreeModifier",
	"sap/ui/core/util/reflection/XmlTreeModifier",
	"sap/ui/core/CustomData",
	"sap/ui/model/json/JSONModel",
	"sap/m/Panel",
	"sap/m/Button",
	"sap/ui/rta/enablement/TestDelegate",
	"sap/ui/thirdparty/sinon-4"
], function(
	DelegateMediator,
	DelegateMediatorAPI,
	JsControlTreeModifier,
	XmlTreeModifier,
	CustomData,
	JSONModel,
	Panel,
	Button,
	TestDelegate,
	sinon
) {
	"use strict";

	var sandbox = sinon.sandbox.create();

	var mRequiredLibraries = {
		"sap.some.lib": {
			minVersion: "1.81",
			lazy: false
		}
	};

	QUnit.module("Given 'registerDefaultDelegate' function is called", {
		beforeEach: function () {
			this.mPropertyBag = {
				modelType: "test_modelType",
				delegate: "test_delegate",
				delegateType: "complete"
			};
		},
		afterEach: function() {
			DelegateMediator.clear();
		}
	}, function() {
		QUnit.test("When it is called with invalid delegate property", function (assert) {
			delete this.mPropertyBag.delegate;
			assert.throws(function () {
				DelegateMediatorAPI.registerDefaultDelegate(this.mPropertyBag);
			}.bind(this), /'modelType' and 'delegate' properties are required for registration!/, "then an exception is thrown");
		});

		QUnit.test("When it is called with invalid modelType property", function (assert) {
			delete this.mPropertyBag.modelType;
			assert.throws(function () {
				DelegateMediatorAPI.registerDefaultDelegate(this.mPropertyBag);
			}.bind(this), /'modelType' and 'delegate' properties are required for registration!/, "then an exception is thrown");
		});

		QUnit.test("When it is called with valid property bag", function (assert) {
			DelegateMediatorAPI.registerDefaultDelegate(this.mPropertyBag);
			assert.ok(DelegateMediator.isDelegateRegistered(this.mPropertyBag.modelType), "then the delegate is registered successfull with the given modelType");
		});

		QUnit.test("When it is called with valid property bag including optional requiredLibraries property", function (assert) {
			this.mPropertyBag.requiredLibraries = mRequiredLibraries;
			DelegateMediatorAPI.registerDefaultDelegate(this.mPropertyBag);
			assert.ok(DelegateMediator.isDelegateRegistered(this.mPropertyBag.modelType), "then the delegate is registered successfull with the given modelType");
		});

		QUnit.test("When it is called with valid property bag multiple times with harmonized delegate types", function (assert) {
			this.mPropertyBag.requiredLibraries = mRequiredLibraries;
			this.mPropertyBag.delegateType = "readonly";
			DelegateMediatorAPI.registerDefaultDelegate(this.mPropertyBag);
			this.mPropertyBag.delegateType = "writeonly";
			DelegateMediatorAPI.registerDefaultDelegate(this.mPropertyBag);
			assert.ok(DelegateMediator.isDelegateRegistered(this.mPropertyBag.modelType), "then the delegate is registered successfull with the given modelType");
		});

		[["readonly", "readonly"], ["writeonly", "complete"], ["complete", "writeonly"]].forEach(function (sDelegateType) {
			QUnit.test("When try to register the same modelType with with already existing '" + sDelegateType[0] + "' delegate", function (assert) {
				this.mPropertyBag.delegateType = sDelegateType[0];
				DelegateMediatorAPI.registerDefaultDelegate(this.mPropertyBag);
				assert.throws(function () {
					this.mPropertyBag.delegateType = sDelegateType[1];
					DelegateMediatorAPI.registerDefaultDelegate(this.mPropertyBag);
				}.bind(this), /is already defined!/, "then an exception is thrown");
			});
		}.bind(this));
	});
	//ensure a default delegate exists for a model not used anywhere else
	var SomeModel = JSONModel.extend("sap.ui.fl.qunit.test.Model");

	QUnit.module("Given 'getDelegateForControl' function is called", {
		beforeEach: function () {
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
						delegate: '{"name": "sap/ui/rta/enablement/TestDelegate"}'
					}
				}
			};
		},
		afterEach: function() {
			DelegateMediator.clear();
			this.oPanel.destroy();
			sandbox.restore();
		}
	}, function() {
		function createPropertyBag(oControl, oModifier, sModelType, bSupportsDefault) {
			return {
				control: oControl,
				modifier: oModifier,
				modelType: sModelType,
				supportsDefault: bSupportsDefault
			};
		}

		QUnit.test("When it is called with undefined control property", function (assert) {
			return DelegateMediatorAPI.getDelegateForControl(createPropertyBag(undefined, JsControlTreeModifier))
				.catch(function (vError) {
					assert.strictEqual(vError.message, "The control parameter is missing", "then an exception is thrown");
				});
		});

		QUnit.test("When it is called with invalid control property", function (assert) {
			return DelegateMediatorAPI.getDelegateForControl(createPropertyBag({ id: "test_object" }, JsControlTreeModifier))
				.catch(function (vError) {
					assert.strictEqual(vError.message, "The input control should be a managed object", "then an exception is thrown");
				});
		});

		QUnit.test("When it is called with undefined modifier property", function (assert) {
			return DelegateMediatorAPI.getDelegateForControl(createPropertyBag(this.oPanel, undefined))
				.catch(function (vError) {
					assert.strictEqual(vError.message, "The modifier parameter is missing", "then an exception is thrown");
				});
		});

		QUnit.test("When it is called without delegate specified", function (assert) {
			return DelegateMediatorAPI.getDelegateForControl(createPropertyBag(this.oPanel, JsControlTreeModifier))
				.then(function (vReturnValue) {
					assert.notOk(vReturnValue, "then an 'undefined' is returned");
				});
		});

		QUnit.test("When it is called without delegate specified (XML Case)", function (assert) {
			var vDomNode = jQuery("#qunit-fixture").get(0);
			return DelegateMediatorAPI.getDelegateForControl(createPropertyBag(vDomNode, XmlTreeModifier))
				.then(function (vReturnValue) {
					assert.notOk(vReturnValue, "then an 'undefined' is returned");
				});
		});

		QUnit.test("When it is called with delegate specified as default delegate (XML Case)", function (assert) {
			var vDomNode = jQuery("#qunit-fixture").get(0);
			DelegateMediatorAPI.registerDefaultDelegate(this.mPropertyBag);
			return DelegateMediatorAPI.getDelegateForControl(createPropertyBag(vDomNode, XmlTreeModifier, this.mPropertyBag.modelType, true))
				.then(function (mDelegateInfo) {
					assert.deepEqual(mDelegateInfo.instance, TestDelegate, "then the default delegate info is returned");
					assert.deepEqual(mDelegateInfo.names, [this.mPropertyBag.delegate], "then the default delegate info is returned");
					assert.deepEqual(mDelegateInfo.payload, {}, "then the default delegate info contains an empty payload");
					assert.strictEqual(mDelegateInfo.modelType, this.mPropertyBag.modelType, "then the default delegate info contains the modelType");
					assert.deepEqual(mDelegateInfo.requiredLibraries, this.mPropertyBag.requiredLibraries, "then the default delegate info contains the passed required libraries");
				}.bind(this));
		});

		QUnit.test("When it is called with delegate specified as default delegate (JS Case)", function (assert) {
			this.oPanel.setModel(new SomeModel());
			DelegateMediatorAPI.registerDefaultDelegate(this.mPropertyBag);
			return DelegateMediatorAPI.getDelegateForControl(createPropertyBag(this.oPanel, JsControlTreeModifier, undefined, true))
				.then(function (mDelegateInfo) {
					assert.deepEqual(mDelegateInfo.instance, TestDelegate, "then the default delegate info is returned");
					assert.deepEqual(mDelegateInfo.names, [this.mPropertyBag.delegate], "then the default delegate info is returned");
					assert.deepEqual(mDelegateInfo.payload, {}, "then the default delegate info contains an empty payload");
					assert.strictEqual(mDelegateInfo.modelType, SomeModel.getMetadata().getName(), "then the default delegate info contains the modelType");
					assert.deepEqual(mDelegateInfo.requiredLibraries, this.mPropertyBag.requiredLibraries, "then the default delegate info contains the passed required libraries");
				}.bind(this));
		});

		QUnit.test("When it is called with delegate specified as default delegate (JS Case) without required libraries registered", function (assert) {
			this.oPanel.setModel(new SomeModel());
			delete this.mPropertyBag.requiredLibraries;
			DelegateMediatorAPI.registerDefaultDelegate(this.mPropertyBag);
			return DelegateMediatorAPI.getDelegateForControl(createPropertyBag(this.oPanel, JsControlTreeModifier, undefined, true))
				.then(function (mDelegateInfo) {
					assert.deepEqual(mDelegateInfo.instance, TestDelegate, "then the default delegate info is returned");
					assert.deepEqual(mDelegateInfo.names, [this.mPropertyBag.delegate], "then the default delegate info is returned");
					assert.deepEqual(mDelegateInfo.payload, {}, "then the default delegate info contains an empty payload");
					assert.strictEqual(mDelegateInfo.modelType, SomeModel.getMetadata().getName(), "then the default delegate info contains the modelType");
					assert.notOk(mDelegateInfo.requiredLibraries, "then the default delegate does not contain any required libraries defined as default");
				}.bind(this));
		});

		QUnit.test("When default delegate is available, but default delegate should be ignored (XML Case)", function (assert) {
			var vDomNode = jQuery("#qunit-fixture").get(0);
			DelegateMediatorAPI.registerDefaultDelegate(this.mPropertyBag);
			return DelegateMediatorAPI.getDelegateForControl(createPropertyBag(vDomNode, XmlTreeModifier, this.mPropertyBag.modelType))
				.then(function (mDelegateInfo) {
					assert.notOk(mDelegateInfo, "then an 'undefined' is returned");
				});
		});

		QUnit.test("When default delegate is available, but default delegate should be ignored (JS Case)", function (assert) {
			this.oPanel.setModel(new SomeModel());
			DelegateMediatorAPI.registerDefaultDelegate(this.mPropertyBag);
			return DelegateMediatorAPI.getDelegateForControl(createPropertyBag(this.oPanel, JsControlTreeModifier))
				.then(function (mDelegateInfo) {
					assert.notOk(mDelegateInfo, "then an 'undefined' is returned");
				});
		});

		QUnit.test("When multiple default delegates are available, without instancespecific delegate definition", function (assert) {
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
			var oFakeReadOnlyDelegate = {
				getPropertyInfo: function() {
					return Promise.resolve([{
						name: "testProperty",
						bindingPath: "fakepath"
					}]);
				}
			};
			var oFakeWriteOnlyDelegate = {
				createLabel: function() {
					return Promise.resolve(new Button("myBrandNewButton"));
				}
			};
			sandbox.stub(sap.ui, "require")
				.withArgs(["sap/ui/rta/enablement/TestDelegate1"]).callsFake(function (sModuleName, fnCallback) {
					fnCallback(oFakeReadOnlyDelegate);
				})
				.withArgs(["sap/ui/rta/enablement/TestDelegate2"]).callsFake(function (sModuleName, fnCallback) {
					fnCallback(oFakeWriteOnlyDelegate);
				})
				.callThrough();

			return DelegateMediatorAPI.getDelegateForControl(createPropertyBag(this.oPanel, JsControlTreeModifier, undefined, true))
				.then(function (mDelegateInfo) {
					assert.ok(mDelegateInfo, "then delegate info is returned");
					assert.deepEqual(mDelegateInfo.names, ["sap/ui/rta/enablement/TestDelegate2", "sap/ui/rta/enablement/TestDelegate1"], "then names are returned as expected");
					assert.deepEqual(Object.keys(mDelegateInfo.requiredLibraries), ["sap.some.other.lib", "sap.some.lib"], "then instance contains the method from write delegate");
					assert.deepEqual(mDelegateInfo.payload, {}, "then the default delegate info contains an empty payload");
					assert.strictEqual(mDelegateInfo.modelType, SomeModel.getMetadata().getName(), "then the default delegate info contains the modelType");
					assert.ok(mDelegateInfo.instance.getPropertyInfo, "then instance contains the method from read delegate");
					assert.ok(mDelegateInfo.instance.createLabel, "then instance contains the method from write delegate");
					return mDelegateInfo.instance.getPropertyInfo()
						.then(function (mPropertyInfo) {
							assert.strictEqual(mPropertyInfo[0].name, "testProperty", "then method from read delegate is executable");
							return mDelegateInfo.instance.createLabel();
						})
						.then(function (oElement) {
							assert.strictEqual(oElement.getId(), "myBrandNewButton", "then method from write delegate is executable");
						});
				});
		});

		QUnit.test("When read-only default delegate and instancespecific delegate definition on control is available", function (assert) {
			this.oPanel.addCustomData(new CustomData(this.oDelegateCustomData));
			this.oPanel.setModel(new SomeModel());
			DelegateMediatorAPI.registerDefaultDelegate({
				modelType: SomeModel.getMetadata().getName(),
				delegate: "sap/ui/rta/enablement/readonly/TestDelegate",
				requiredLibraries: mRequiredLibraries,
				delegateType: "readonly"
			});
			var oFakeReadOnlyDelegate = {
				getPropertyInfo: function() {
					return Promise.resolve([{
						name: "testProperty",
						bindingPath: "fakepath"
					}]);
				}
			};
			var oFakeWriteOnlyDelegate = {
				createLabel: function() {
					return Promise.resolve(new Button("buttonFromInstancespecificDelegate"));
				}
			};
			sandbox.stub(sap.ui, "require")
				.withArgs(["sap/ui/rta/enablement/readonly/TestDelegate"]).callsFake(function (sModuleName, fnCallback) {
					fnCallback(oFakeReadOnlyDelegate);
				})
				.withArgs(["sap/ui/rta/enablement/TestDelegate"]).callsFake(function (sModuleName, fnCallback) {
					fnCallback(oFakeWriteOnlyDelegate);
				})
				.callThrough();

			return DelegateMediatorAPI.getDelegateForControl(createPropertyBag(this.oPanel, JsControlTreeModifier, undefined, true))
				.then(function (mDelegateInfo) {
					assert.ok(mDelegateInfo, "then delegate info is returned");
					assert.deepEqual(mDelegateInfo.names, ["sap/ui/rta/enablement/TestDelegate", "sap/ui/rta/enablement/readonly/TestDelegate"], "then names are returned as expected");
					assert.deepEqual(Object.keys(mDelegateInfo.requiredLibraries), ["sap.some.lib"], "then instance contains the method from write delegate");
					assert.deepEqual(mDelegateInfo.payload, {}, "then the default delegate info contains an empty payload");
					assert.strictEqual(mDelegateInfo.modelType, SomeModel.getMetadata().getName(), "then the default delegate info contains the modelType");
					assert.ok(mDelegateInfo.instance.getPropertyInfo, "then instance contains the method from read delegate");
					assert.ok(mDelegateInfo.instance.createLabel, "then instance contains the method from write delegate");
					return mDelegateInfo.instance.getPropertyInfo()
						.then(function (mPropertyInfo) {
							assert.strictEqual(mPropertyInfo[0].name, "testProperty", "then method from read delegate is executable");
							return mDelegateInfo.instance.createLabel();
						})
						.then(function (oElement) {
							assert.strictEqual(oElement.getId(), "buttonFromInstancespecificDelegate", "then method from write delegate is executable");
						});
				});
		});

		QUnit.test("When no default delegate is available, but default delegate is asked (XML Case)", function (assert) {
			var vDomNode = jQuery("#qunit-fixture").get(0);
			return DelegateMediatorAPI.getDelegateForControl(createPropertyBag(vDomNode, XmlTreeModifier, "some.not.existing.model", true))
				.then(function (mDelegateInfo) {
					assert.notOk(mDelegateInfo, "then an 'undefined' is returned");
				});
		});

		QUnit.test("When no default delegate is available, but default delegate is asked (JS Case)", function (assert) {
			this.oPanel.setModel(new SomeModel());
			return DelegateMediatorAPI.getDelegateForControl(createPropertyBag(this.oPanel, JsControlTreeModifier, "some.not.existing.model", true))
				.then(function (mDelegateInfo) {
					assert.notOk(mDelegateInfo, "then an 'undefined' is returned");
				});
		});

		QUnit.test("When it is called with delegate specified into the control custom data and without default delegate registration", function (assert) {
			this.oPanel.addCustomData(new CustomData(this.oDelegateCustomData));
			return DelegateMediatorAPI.getDelegateForControl(createPropertyBag(this.oPanel, JsControlTreeModifier))
				.then(function (mDelegateInfo) {
					assert.deepEqual(mDelegateInfo.instance, TestDelegate, "then the specific delegate info is returned");
					assert.deepEqual(mDelegateInfo.payload, {}, "then the specific delegate info contains an empty payload");
					assert.notOk(mDelegateInfo.modelType, "then modelType 'undefined' is returned");
				});
		});

		QUnit.test("When it is called with delegate specified into the control custom data and default delegate registration is available", function (assert) {
			this.oPanel.addCustomData(new CustomData(this.oDelegateCustomData));
			this.oPanel.setModel(new SomeModel());
			DelegateMediatorAPI.registerDefaultDelegate({
				modelType: SomeModel.getMetadata().getName(),
				delegate: "notExistingDelegate/WouldBreakIfDefaultDelegateGetLoaded",
				delegateType: "complete"
			});
			return DelegateMediatorAPI.getDelegateForControl(createPropertyBag(this.oPanel, JsControlTreeModifier))
				.then(function (mDelegateInfo) {
					assert.deepEqual(mDelegateInfo.instance, TestDelegate, "then the specific delegate info is returned");
					assert.deepEqual(mDelegateInfo.payload, {}, "then the specific delegate info contains an empty payload");
					assert.notOk(mDelegateInfo.modelType, "then modelType 'undefined' is returned");
				});
		});
	});


	QUnit.module("Given 'getKnownDefaultDelegateLibraries' function is called", function() {
		QUnit.test("When it is called", function (assert) {
			var aExpectedResult = ["sap.ui.comp"];
			var aExistingKnownDefaultDelegateLibs = DelegateMediatorAPI.getKnownDefaultDelegateLibraries();
			assert.deepEqual(aExistingKnownDefaultDelegateLibs, aExpectedResult, "then the known libs for default delegate locations are returned");
		});
	});

	QUnit.done(function () {
		jQuery("#qunit-fixture").hide();
	});
});
