/* global QUnit */

sap.ui.define([
	"sap/ui/fl/apply/_internal/flexObjects/FlexObjectFactory",
	"sap/ui/fl/changeHandler/Base",
	"sap/ui/core/util/reflection/JsControlTreeModifier",
	"sap/ui/thirdparty/sinon-4"
], function(
	FlexObjectFactory,
	Base,
	JsControlTreeModifier,
	sinon
) {
	"use strict";

	var sandbox = sinon.createSandbox();

	/**
	 * @deprecated As of version 1.107
	 */
	QUnit.module("sap.ui.fl.changeHandler.Base", {
		beforeEach() {
			this.oBaseHandler = Base;
		},
		afterEach() {
		}
	}, function() {
		QUnit.test("setTextInChange", function(assert) {
			var oChange = {
				selector: {
					id: "QUnit.testkey"
				}
			};
			this.oBaseHandler.setTextInChange(oChange, "fieldLabel", "new field label", "XFLD");
			assert.ok(oChange.texts.fieldLabel);
			assert.equal(oChange.texts.fieldLabel.value, "new field label");
			assert.equal(oChange.texts.fieldLabel.type, "XFLD");
		});
	});

	QUnit.module("sap.ui.fl.changeHandler.Base.instantiateFragment on JSControlTreeModifier", {
		before() {
			// predefine some modules
			var mPreloadedModules = {};
			this.sFragmentMultiplePath = "sap/somePath/toSomewhereFragmentMultiple";
			mPreloadedModules[this.sFragmentMultiplePath] = '<core:FragmentDefinition xmlns="sap.m" xmlns:core="sap.ui.core">' +
				'<Button xmlns="sap.m" id="button1" text="Hello World"></Button>' +
				'<Button xmlns="sap.m" id="button2" text="Hello World"></Button>' +
				'<Button xmlns="sap.m" id="button3" text="Hello World"></Button>' +
				"</core:FragmentDefinition>";
			this.sFragmentInvalidPath = "sap/somePath/toSomewhereFragmentInvalid";
			mPreloadedModules[this.sFragmentInvalidPath] = "invalidFragment";
			this.sNonExistingPath = "sap/somePath/toSomewhereNonExisting";
			sap.ui.require.preload(mPreloadedModules);
		},
		beforeEach() {
			this.oChangeJson = {
				projectId: "projectId"
			};

			this.mPropertyBag = {
				modifier: JsControlTreeModifier,
				view: {
					getController() {
					},
					getId() {
					}
				}
			};
		},
		afterEach() {
		}
	}, function() {
		QUnit.test("When applying the change on a js control tree without a fragment", function(assert) {
			var oChange = FlexObjectFactory.createFromFileContent(this.oChangeJson);
			return Base.instantiateFragment(oChange, this.mPropertyBag)
			.catch(function(vError) {
				assert.ok(vError instanceof Error, "then apply change throws an error");
			});
		});

		QUnit.test("When applying the change on a js control tree with an invalid fragment", function(assert) {
			this.oChangeJson.moduleName = this.sFragmentInvalidPath;
			var oChange = FlexObjectFactory.createFromFileContent(this.oChangeJson);
			return Base.instantiateFragment(oChange, this.mPropertyBag)
			.catch(function(vError) {
				assert.ok(vError instanceof Error, "then apply change throws an error");
			});
		});

		QUnit.test("When applying the change with a not found module", function(assert) {
			this.oChangeJson.moduleName = this.sNonExistingPath;
			var oChange = FlexObjectFactory.createFromFileContent(this.oChangeJson);
			return Base.instantiateFragment(oChange, this.mPropertyBag)
			.catch(function(vError) {
				assert.ok(vError.message.indexOf("resource sap/somePath/toSomewhereNonExisting could not be loaded from") > -1,
					"then apply change throws an error");
			});
		});

		QUnit.test("When applying the change on a js control tree with multiple root elements", function(assert) {
			this.oChangeJson.moduleName = this.sFragmentMultiplePath;
			var oChange = FlexObjectFactory.createFromFileContent(this.oChangeJson);
			return Base.instantiateFragment(oChange, this.mPropertyBag)
			.then(function(aItems) {
				assert.equal(aItems.length, 3, "after the change there are 4 items in the hbox");
				assert.equal(aItems[0].getId(), "projectId.button1", "then the first button in the fragment has the correct index and ID");
				assert.equal(aItems[1].getId(), "projectId.button2", "then the second button in the fragment has the correct index and ID");
				assert.equal(aItems[2].getId(), "projectId.button3", "then the third button in the fragment has the correct index and ID");
				aItems.forEach(function(oItem) { oItem.destroy(); });
			});
		});

		QUnit.test("When applying the change on a js control tree with multiple root elements and extension point with fragmentId", function(assert) {
			this.oChangeJson.moduleName = this.sFragmentMultiplePath;
			var oChange = FlexObjectFactory.createFromFileContent(this.oChangeJson);
			oChange.setExtensionPointInfo({ fragmentId: "EPFRAGMENTID" });
			return Base.instantiateFragment(oChange, this.mPropertyBag)
			.then(function(aItems) {
				assert.equal(aItems.length, 3, "after the change there are 4 items in the hbox");
				assert.equal(aItems[0].getId(), "projectId.EPFRAGMENTID.button1", "then the first button in the fragment has the correct index and ID");
				assert.equal(aItems[1].getId(), "projectId.EPFRAGMENTID.button2", "then the second button in the fragment has the correct index and ID");
				assert.equal(aItems[2].getId(), "projectId.EPFRAGMENTID.button3", "then the third button in the fragment has the correct index and ID");
				aItems.forEach(function(oItem) { oItem.destroy(); });
			});
		});
	});

	QUnit.module("sap.ui.fl.changeHandler.Base.instantiateFragment namespace check", {
		before() {
			// predefine some modules
			var mPreloadedModules = {};
			this.sFragmentMultiplePath = "sap/somePath/toSomewhereFragment";
			mPreloadedModules[this.sFragmentMultiplePath] = '<core:FragmentDefinition xmlns="sap.m" xmlns:core="sap.ui.core"></core:FragmentDefinition>';
			sap.ui.require.preload(mPreloadedModules);
		},
		beforeEach() {
			this.oInstantiateFragmentStub = sandbox.stub().resolves();
			this.mPropertyBag = {
				modifier: { instantiateFragment: this.oInstantiateFragmentStub },
				view: "<view></view>",
				viewId: "componentId--viewId"
			};
		},
		afterEach() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("When applying the change on a xml control tree with viewId and without prefix", function(assert) {
			var oChange = FlexObjectFactory.createFromFileContent({
				moduleName: this.sFragmentMultiplePath,
				projectId: undefined
			});
			this.mPropertyBag.viewId = undefined;
			return Base.instantiateFragment(oChange, this.mPropertyBag)
			.then(function() {
				assert.strictEqual(this.oInstantiateFragmentStub.firstCall.args[1], "", "then the namespace is prepared properly");
			}.bind(this));
		});

		QUnit.test("When applying the change on a xml control tree with viewId and without projectId & fragmentId available as prefix", function(assert) {
			var oChange = FlexObjectFactory.createFromFileContent({
				moduleName: this.sFragmentMultiplePath,
				projectId: undefined
			});
			return Base.instantiateFragment(oChange, this.mPropertyBag)
			.then(function() {
				assert.strictEqual(this.oInstantiateFragmentStub.firstCall.args[1], "componentId--viewId--", "then the namespace is prepared properly");
			}.bind(this));
		});

		QUnit.test("When applying the change on a xml control tree with viewId & fragmentId and without projectId available as prefix", function(assert) {
			var oChange = FlexObjectFactory.createFromFileContent({
				moduleName: this.sFragmentMultiplePath,
				projectId: undefined
			});
			oChange.setExtensionPointInfo({ fragmentId: "fragmentId" });
			return Base.instantiateFragment(oChange, this.mPropertyBag)
			.then(function() {
				assert.strictEqual(this.oInstantiateFragmentStub.firstCall.args[1], "componentId--viewId--fragmentId", "then the namespace is prepared properly");
			}.bind(this));
		});

		QUnit.test("When applying the change on a xml control tree with viewId is available as prefix", function(assert) {
			var oChange = FlexObjectFactory.createFromFileContent({
				moduleName: this.sFragmentMultiplePath,
				projectId: "projectId"
			});
			return Base.instantiateFragment(oChange, this.mPropertyBag)
			.then(function() {
				assert.strictEqual(this.oInstantiateFragmentStub.firstCall.args[1], "componentId--viewId--projectId", "then the namespace is prepared properly");
			}.bind(this));
		});

		QUnit.test("When applying the change on a xml control tree with viewId and fragmentId are available as prefixes", function(assert) {
			var oChange = FlexObjectFactory.createFromFileContent({
				moduleName: this.sFragmentMultiplePath,
				projectId: "projectId"
			});
			oChange.setExtensionPointInfo({ fragmentId: "fragmentId" });
			return Base.instantiateFragment(oChange, this.mPropertyBag)
			.then(function() {
				assert.strictEqual(this.oInstantiateFragmentStub.firstCall.args[1], "componentId--viewId--projectId.fragmentId", "then the namespace is prepared properly");
			}.bind(this));
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
