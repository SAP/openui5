/* global QUnit */

sap.ui.define([
	"sap/ui/fl/ChangePersistence",
	"sap/ui/fl/ChangePersistenceFactory",
	"sap/ui/fl/Layer",
	"sap/ui/fl/Utils",
	"sap/ui/fl/LayerUtils",
	"sap/ui/fl/apply/api/SmartVariantManagementApplyAPI",
	"sap/ui/fl/write/_internal/Storage",
	"sap/ui/core/UIComponent",
	"sap/ui/core/Control",
	"sap/ui/fl/registry/Settings",
	"sap/ui/fl/apply/_internal/flexState/FlexState",
	"sap/ui/fl/initial/_internal/connectors/LrepConnector",
	"sap/base/util/LoaderExtensions",
	"sap/ui/thirdparty/sinon-4"
], function(
	ChangePersistence,
	ChangePersistenceFactory,
	Layer,
	Utils,
	LayerUtils,
	SmartVariantManagementApplyAPI,
	Storage,
	UIComponent,
	Control,
	Settings,
	FlexState,
	LrepConnector,
	LoaderExtensions,
	sinon
) {
	"use strict";

	var sandbox = sinon.sandbox.create();

	QUnit.module("SmartVariantManagementApplyAPI", {
		beforeEach: function() {
			this.oAppComponent = new UIComponent("AppComponent21");
			sandbox.stub(Utils, "getAppComponentForControl").returns(this.oAppComponent);
		},
		afterEach: function() {
			FlexState.clearState();
			if (this.oControl) {
				this.oControl.destroy();
			}
			this.oAppComponent.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("When loadVariants() is called and multiple variants are present for the persistencyKey of the passed control", function (assert) {
			this.oControl = new Control("controlId1");
			var sPersistencyKey = "variantManagement1";
			this.oControl.getPersistencyKey = function () {
				return sPersistencyKey;
			};

			var mFlexData = LoaderExtensions.loadResource({
				dataType: "json",
				url: sap.ui.require.toUrl("test-resources/sap/ui/fl/qunit/apply/api/SmartVariantManagementAPI.loadVariantsTestSetup-flexData.json")
			});

			sandbox.stub(LrepConnector, "loadFlexData").resolves(mFlexData);

			var aVariants = [{
				id: "variant_3",
				name: "C variant"
			}, {
				id: "variant_4",
				executeOnSelection: true,
				name: "B variant"
			}, {
				id: "variant_5",
				name: "A Variant"
			}];

			var sStandardVariantTitle = "this is a localized standard variant title";

			return SmartVariantManagementApplyAPI.loadVariants({
				control: this.oControl,
				standardVariant: {
					name: sStandardVariantTitle
				},
				variants: aVariants
			})
			.then(function (oResponse) {
				var oStandardVariant = oResponse.standardVariant;
				assert.equal(oStandardVariant.getId(), "*standard*", "the first is the standard variant passed");
				assert.equal(oStandardVariant.getText("variantName"), sStandardVariantTitle, "with the passed title");
				assert.equal(oStandardVariant.getExecuteOnSelection(), true, "and is executed on selection by a standardVariant change");
				assert.equal(oStandardVariant.getFavorite(), true, "which is by default a favorite");

				var aVariants = oResponse.variants;
				assert.equal(aVariants.length, 5, "then five entities are returned");
				assert.equal(aVariants[0].getId(), "variant_3", "the six is the variant provided from the loadFlexData");
				assert.equal(aVariants[0].getFavorite(), true, "which was changed to be a favorite");
				assert.equal(aVariants[0].getExecuteOnSelection(), false, "and is not executed on selection by default");
				assert.equal(aVariants[1].getId(), "variant_4", "the third is the variant provided from the loadFlexData");
				assert.equal(aVariants[1].getFavorite(), false, "which is NOT a favorite");
				assert.equal(aVariants[1].getExecuteOnSelection(), true, "and is executed on selection, because it is flagged within the object");
				assert.equal(aVariants[2].getId(), "variant_5", "the second is the variant provided from the loadFlexData");
				assert.equal(aVariants[2].getFavorite(), false, "which is NOT a favorite");
				assert.equal(aVariants[2].getExecuteOnSelection(), false, "and is not executed on selection by default");
				assert.equal(aVariants[3].getId(), "variant_1", "the fourth is the variant provided from the loadFlexData");
				assert.equal(aVariants[3].getFavorite(), false, "which is NOT a favorite, because it was added as a favorite and afterwards removed");
				assert.equal(aVariants[3].getExecuteOnSelection(), false, "and is not executed on selection by default");
				assert.equal(aVariants[4].getId(), "variant_2", "the fifth is the variant provided from the loadFlexData");
				assert.equal(aVariants[4].getFavorite(), true, "which is a favorite, because it is flagged as one within the content");
				assert.equal(aVariants[4].getExecuteOnSelection(), true, "and is executed on selection, because it is flagged within the content");
			});
		});

		QUnit.test("When loadVariants() is called and multiple variants, of which multiple are a overruling the standard variant, are present for the persistencyKey of the passed control", function (assert) {
			this.oControl = new Control("controlId1");
			var sPersistencyKey = "variantManagement1";
			this.oControl.getPersistencyKey = function () {
				return sPersistencyKey;
			};

			var mFlexData = LoaderExtensions.loadResource({
				dataType: "json",
				url: sap.ui.require.toUrl("test-resources/sap/ui/fl/qunit/apply/api/SmartVariantManagementAPI.loadVariantsTestSetup-flexData-withStandardVariant.json")
			});

			sandbox.stub(LrepConnector, "loadFlexData").resolves(mFlexData);

			var aVariants = [{
				id: "variant_3",
				name: "C variant"
			}, {
				id: "variant_4",
				executeOnSelection: true,
				name: "A variant"
			}, {
				id: "variant_5",
				name: "A Variant"
			}];

			var sStandardVariantTitle = "this is a localized standard variant title";

			return SmartVariantManagementApplyAPI.loadVariants({
				control: this.oControl,
				standardVariant: {
					name: sStandardVariantTitle
				},
				variants: aVariants
			})
				.then(function (oResponse) {
					var oStandardVariant = oResponse.standardVariant;
					assert.equal(oStandardVariant.getId(), "variant_standard2", "the first is the overwritten standard variant");
					assert.equal(oStandardVariant.getText("variantName"), "This another of my very own standard variant text", "with the title from the variant file");
					assert.equal(oStandardVariant.getExecuteOnSelection(), true, "and not is executed on selection due to a change");
					assert.equal(oStandardVariant.getFavorite(), true, "and it is a favorite");

					var aVariants = oResponse.variants;
					assert.equal(aVariants.length, 5, "then five entities are returned");
					assert.equal(aVariants[0].getId(), "variant_3", "the six is the variant provided from the loadFlexData");
					assert.equal(aVariants[0].getFavorite(), true, "which was changed to be a favorite");
					assert.equal(aVariants[0].getExecuteOnSelection(), false, "and is not executed on selection by default");
					assert.equal(aVariants[1].getId(), "variant_4", "the third is the variant provided from the loadFlexData");
					assert.equal(aVariants[1].getFavorite(), false, "which is NOT a favorite");
					assert.equal(aVariants[1].getExecuteOnSelection(), true, "and is executed on selection, because it is flagged within the object");
					assert.equal(aVariants[2].getId(), "variant_5", "the second is the variant provided from the loadFlexData");
					assert.equal(aVariants[2].getFavorite(), false, "which is NOT a favorite");
					assert.equal(aVariants[2].getExecuteOnSelection(), false, "and is not executed on selection by default");
					assert.equal(aVariants[3].getId(), "variant_1", "the fourth is the variant provided from the loadFlexData");
					assert.equal(aVariants[3].getFavorite(), false, "which is NOT a favorite, because it was added as a favorite and afterwards removed");
					assert.equal(aVariants[3].getExecuteOnSelection(), false, "and is not executed on selection by default");
					assert.equal(aVariants[4].getId(), "variant_2", "the fifth is the variant provided from the loadFlexData");
					assert.equal(aVariants[4].getFavorite(), true, "which is a favorite, because it is flagged as one within the content");
					assert.equal(aVariants[4].getExecuteOnSelection(), true, "and is executed on selection, because it is flagged within the content");
				});
		});

		QUnit.test("When isApplicationVariant() is called", function (assert) {
			this.oControl = new Control("controlId1");

			//Utils.isApplicationVariant returns true
			var oStubUtilsIsApplicationVariant = sandbox.stub(Utils, "isApplicationVariant").withArgs(this.oControl).returns(true);
			assert.equal(SmartVariantManagementApplyAPI.isApplicationVariant({control: this.oControl}), true);

			//Utils.isApplicationVariant returns false, Utils.getComponentForControl return null
			oStubUtilsIsApplicationVariant.withArgs(this.oControl).returns(false);
			var oStubUtilsGetComponentForControl = sandbox.stub(Utils, "getComponentForControl").withArgs(this.oControl).returns(null);
			assert.equal(SmartVariantManagementApplyAPI.isApplicationVariant({control: this.oControl}), false);

			//Utils.isApplicationVariant returns false, Utils.getComponentForControl return empty object
			oStubUtilsGetComponentForControl.withArgs(this.oControl).returns({});
			assert.equal(SmartVariantManagementApplyAPI.isApplicationVariant({control: this.oControl}), false);

			//Utils.isApplicationVariant returns false, Utils.getComponentForControl return component but not appComponent
			oStubUtilsGetComponentForControl.withArgs(this.oControl).returns({
				getAppComponent: function () {
					return null;
				}
			});
			assert.equal(SmartVariantManagementApplyAPI.isApplicationVariant({control: this.oControl}), false);

			//Utils.isApplicationVariant returns false, Utils.getComponentForControl return component and appComponent
			oStubUtilsGetComponentForControl.withArgs(this.oControl).returns({
				getAppComponent: function () {
					return {};
				}
			});
			assert.equal(SmartVariantManagementApplyAPI.isApplicationVariant({control: this.oControl}), true);
		});

		QUnit.test("When isVendorLayer() is called it calls the corresponding Utils function", function (assert) {
			sandbox.stub(LayerUtils, "isVendorLayer").withArgs().returns(false);
			var bVendorLayer = SmartVariantManagementApplyAPI.isVendorLayer();

			assert.equal(bVendorLayer, false);
		});

		QUnit.test("When isVariantDownport() is called it calls the corresponding Utils function", function (assert) {
			sandbox.stub(LayerUtils, "getCurrentLayer").withArgs().returns('VENDOR');
			sandbox.stub(Utils, "isHotfixMode").withArgs().returns(true);
			var bVendorLayer = SmartVariantManagementApplyAPI.isVariantDownport();

			assert.equal(bVendorLayer, true);
		});
	});

	QUnit.module("SmartVariantManagementApplyAPI.getDefaultVariantId", {
		beforeEach: function() {
			this.oAppComponent = new UIComponent("AppComponent21");
			this.oControl = new Control("controlId1");
			sandbox.stub(Utils, "getAppComponentForControl").returns(this.oAppComponent);
		},
		afterEach: function() {
			FlexState.clearState("sap.ui.core.Component");
			this.oControl.destroy();
			this.oAppComponent.destroy();
			sandbox.restore();
		}
	}, function() {
		[{
			testName: "When getDefaultVariantId() is called and NO defaultVariant change for the persistencyKey is present",
			changes: [],
			expected: ""
		}, {
			testName: "When getDefaultVariantId() is called and the last defaultVariant change for the persistencyKey sets it to false",
			changes: [{
				fileName: "defaultVariant1",
				fileType: "change",
				changeType: "defaultVariant",
				selector: {
					persistencyKey: "variant1"
				},
				content: {
					defaultVariantName: "anotherVariant"
				}
			}, {
				fileName: "defaultVariant2",
				fileType: "change",
				changeType: "defaultVariant",
				selector: {
					persistencyKey: "variant1"
				},
				content: {
					defaultVariantName: "theDefaultVariant"
				}
			}],
			expected: "theDefaultVariant"
		}, {
			testName: "When getDefaultVariantId() is called and the last defaultVariant change for the persistencyKey sets to true",
			changes: [{
				fileName: "defaultVariant1",
				fileType: "change",
				changeType: "defaultVariant",
				selector: {
					persistencyKey: "variant1"
				},
				content: {
					defaultVariantName: "theDefaultVariant"
				}
			}, {
				fileName: "defaultVariant2",
				fileType: "change",
				changeType: "defaultVariant",
				selector: {
					persistencyKey: "anotherKey"
				},
				content: {
					defaultVariantName: "someVariant"
				}
			}],
			expected: "theDefaultVariant"
		}].forEach(function (oTestData) {
			QUnit.test(oTestData.testName, function (assert) {
				this.oControl.getPersistencyKey = function () {
					return "variant1";
				};
				sandbox.stub(LrepConnector, "loadFlexData").resolves({
					changes: oTestData.changes
				});

				// clear state created in the beforeEach
				FlexState.clearState("sap.ui.core.Component");
				// simulate FlexState initialization
				return SmartVariantManagementApplyAPI.loadVariants({control: this.oControl, standardVariant: {}})
					.then(function () {
						var sDefaultVariantName = SmartVariantManagementApplyAPI.getDefaultVariantId({control: this.oControl});
						assert.equal(sDefaultVariantName, oTestData.expected);
					}.bind(this));
			});
		});
	});

	QUnit.module("SmartVariantManagementApplyAPI.getExecuteOnSelect", {
		beforeEach: function() {
			this.oAppComponent = new UIComponent("AppComponent21");
			this.oControl = new Control("controlId1");
			sandbox.stub(Utils, "getAppComponentForControl").returns(this.oAppComponent);
			// simulate FlexState initialization
			return SmartVariantManagementApplyAPI.loadVariants({control: this.oControl, standardVariant: {}});
		},
		afterEach: function() {
			FlexState.clearState("sap.ui.core.Component");
			this.oControl.destroy();
			this.oAppComponent.destroy();
			sandbox.restore();
		}
	}, function() {
		[{
			testName: "When getExecuteOnSelect is called and NO standardVariant change for the persistencyKey is present",
			changes: [],
			expected: null
		}, {
			testName: "When getExecuteOnSelect is called and the last standardVariant change for the persistencyKey sets it to false",
			changes: [{
				fileName: "standardVariant1",
				fileType: "change",
				changeType: "standardVariant",
				selector: {
					persistencyKey: "variant1"
				},
				content: {
					executeOnSelect: true
				}
			}, {
				fileName: "standardVariant2",
				fileType: "change",
				changeType: "standardVariant",
				selector: {
					persistencyKey: "variant1"
				},
				content: {
					executeOnSelect: false
				}
			}],
			expected: false
		}, {
			testName: "When getExecuteOnSelect is called and the last standardVariant change for the persistencyKey sets it to true",
			changes: [{
				fileName: "standardVariant1",
				fileType: "change",
				changeType: "standardVariant",
				selector: {
					persistencyKey: "variant1"
				},
				content: {
					executeOnSelect: true
				}
			}, {
				fileName: "standardVariant2",
				fileType: "change",
				changeType: "standardVariant",
				selector: {
					persistencyKey: "anotherKey"
				},
				content: {
					executeOnSelect: false
				}
			}],
			expected: true
		}].forEach(function(oTestData) {
			QUnit.test(oTestData.testName, function (assert) {
				var sPersistencyKey = "variant1";
				this.oControl.getPersistencyKey = function () {
					return sPersistencyKey;
				};
				sandbox.stub(LrepConnector, "loadFlexData").resolves({
					changes: oTestData.changes
				});

				FlexState.clearState("sap.ui.core.Component");

				// simulate FlexState initialization
				return SmartVariantManagementApplyAPI.loadVariants({control: this.oControl, standardVariant: {}})
					.then(function () {
						var bExecuteOnSelect = SmartVariantManagementApplyAPI.getExecuteOnSelect({control: this.oControl});
						assert.equal(bExecuteOnSelect, oTestData.expected);
					}.bind(this));
			});
		});
	});

	QUnit.module("SmartVariantManagementApplyAPI._getChangeMap", {
		beforeEach: function() {
			this.oAppComponent = new UIComponent("AppComponent21");
			this.oControl = new Control("controlId1");
			sandbox.stub(Utils, "getAppComponentForControl").returns(this.oAppComponent);
		},
		afterEach: function() {
			FlexState.clearState("sap.ui.core.Component");
			this.oControl.destroy();
			this.oAppComponent.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("collects the changes for a smartVariantManagement", function (assert) {
			var sPersistencyKey = "smartVariantManagement1";

			this.oControl.getPersistencyKey = function () {
				return sPersistencyKey;
			};

			var oChange1 = {
				fileName: "defaultVariant1",
				fileType: "change",
				changeType: "defaultVariant",
				selector: {
					persistencyKey: sPersistencyKey
				},
				content: {
					defaultVariantName: "anotherVariant"
				}
			};

			var oChange2 = {
				fileName: "defaultVariant2",
				fileType: "change",
				changeType: "defaultVariant",
				selector: {
					persistencyKey: sPersistencyKey
				},
				content: {
					defaultVariantName: "theDefaultVariant"
				}
			};

			var oChange3 = {
				fileName: "addFavorite1",
				fileType: "change",
				changeType: "addFavorite",
				selector: {
					persistencyKey: sPersistencyKey
				},
				content: {}
			};

			sandbox.stub(LrepConnector, "loadFlexData").resolves({
				changes: [
					oChange1,
					oChange2,
					{
						fileName: "addFavorite2",
						fileType: "change",
						changeType: "addFavorite",
						selector: {
							persistencyKey: "variantManagement2"
						},
						content: {}
					}, {
						fileName: sPersistencyKey,
						fileType: "variant",
						selector: {
							persistencyKey: sPersistencyKey
						},
						content: {}
					},
					oChange3,
					{
						fileName: "variant2",
						fileType: "variant",
						selector: {
							persistencyKey: "variantManagement2"
						},
						content: {}
					}
				]
			});

			this.oControl.getPersistencyKey = function () {
				return sPersistencyKey;
			};

			// clear state created in the beforeEach
			FlexState.clearState("sap.ui.core.Component");
			// simulate FlexState initialization
			return FlexState.initialize({
				reference: "sap.ui.core.Component",
				componentData: {},
				manifest: {},
				componentId: "sap.ui.core"
			})
			.then(SmartVariantManagementApplyAPI._getChangeMap.bind(undefined, this.oControl))
			.then(function (mChanges) {
				assert.equal(Object.keys(mChanges).length, 3, "3 changes are returned");
				assert.ok(mChanges[oChange1.fileName], "the first change of the variantManagement is included");
				assert.ok(mChanges[oChange2.fileName], "the second change of the variantManagement is included");
				assert.ok(mChanges[oChange3.fileName], "the third change of the variantManagement is included");
			});
		});
	});

	QUnit.done(function () {
		jQuery('#qunit-fixture').hide();
	});
});