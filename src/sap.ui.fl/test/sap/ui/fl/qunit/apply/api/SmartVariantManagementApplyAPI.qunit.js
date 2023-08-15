/* global QUnit */

sap.ui.define([
	"sap/base/util/UriParameters",
	"sap/ui/fl/Utils",
	"sap/ui/fl/LayerUtils",
	"sap/ui/fl/apply/api/SmartVariantManagementApplyAPI",
	"sap/ui/core/UIComponent",
	"sap/ui/core/Control",
	"sap/ui/fl/apply/_internal/flexState/FlexState",
	"sap/ui/fl/initial/_internal/connectors/LrepConnector",
	"sap/base/util/LoaderExtensions",
	"sap/ui/thirdparty/sinon-4"
], function(
	UriParameters,
	Utils,
	LayerUtils,
	SmartVariantManagementApplyAPI,
	UIComponent,
	Control,
	FlexState,
	LrepConnector,
	LoaderExtensions,
	sinon
) {
	"use strict";

	var sandbox = sinon.createSandbox();

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
		QUnit.test("When loadVariants() is called and multiple variants are present for the persistencyKey of the passed control", function(assert) {
			this.oControl = new Control("controlId1");
			var sPersistencyKey = "variantManagement1";
			this.oControl.getPersonalizableControlPersistencyKey = function() {
				return sPersistencyKey;
			};

			var mFlexData = LoaderExtensions.loadResource({
				dataType: "json",
				url: sap.ui.require.toUrl(
					"test-resources/sap/ui/fl/qunit/apply/api/SmartVariantManagementAPI.loadVariantsTestSetup-flexData.json"
				)
			});

			sandbox.stub(LrepConnector, "loadFlexData").resolves(mFlexData);

			var aVariants = [{
				id: "variant_3",
				name: "C Variant",
				content: {}
			}, {
				id: "variant_4",
				executeOnSelection: true,
				name: "B Variant",
				content: {}
			}, {
				id: "variant_5",
				name: "A Variant",
				content: {}
			}];

			var sStandardVariantTitle = "this is a localized standard variant title";
			var oExternalDataStored = {
				variants: aVariants,
				standardVariant: {
					name: sStandardVariantTitle
				},
				controlId: "controlId1"
			};
			return SmartVariantManagementApplyAPI.loadVariants({
				control: this.oControl,
				standardVariant: {
					name: sStandardVariantTitle
				},
				variants: aVariants
			})
			.then(function(oResponse) {
				assert.deepEqual(
					FlexState.getInitialNonFlCompVariantData("sap.ui.core"),
					{variantManagement1: oExternalDataStored},
					"external data is stored correctly"
				);
				var oStandardVariant = oResponse.standardVariant;
				assert.strictEqual(oStandardVariant.getVariantId(), "*standard*", "the first is the standard variant passed");
				assert.strictEqual(oStandardVariant.getText("variantName"), sStandardVariantTitle, "with the passed title");
				assert.strictEqual(
					oStandardVariant.getExecuteOnSelection(),
					true,
					"and is executed on selection by a standardVariant change"
				);
				assert.strictEqual(oStandardVariant.getFavorite(), true, "which is by default a favorite");
				assert.strictEqual(oStandardVariant.getChanges().length, 1, "one change was applied on the standard variant");
				assert.strictEqual(oStandardVariant.getChanges()[0].getId(), "id_1607667712160_48_standardVariant", "with the correct id");

				assert.strictEqual(oResponse.defaultVariantId, "variant_1", "the correct variant is returned as default");

				assert.strictEqual(oStandardVariant.getVariantId(), "*standard*", "the first is the standard variant passed");
				assert.strictEqual(oStandardVariant.getText("variantName"), sStandardVariantTitle, "with the passed title");
				assert.strictEqual(
					oStandardVariant.getExecuteOnSelection(),
					true,
					"and is executed on selection by a standardVariant change"
				);
				assert.strictEqual(oStandardVariant.getFavorite(), true, "which is by default a favorite");
				assert.strictEqual(oStandardVariant.getChanges().length, 1, "one change was applied on the standard variant");
				assert.strictEqual(oStandardVariant.getChanges()[0].getId(), "id_1607667712160_48_standardVariant", "with the correct id");

				var aVariants = oResponse.variants;
				assert.strictEqual(aVariants.length, 6, "then six entities are returned");
				assert.strictEqual(aVariants[0].getVariantId(), "variant_3", "variant_3 is found");
				assert.strictEqual(aVariants[0].getFavorite(), true, "which was changed to be a favorite");
				assert.strictEqual(aVariants[0].getExecuteOnSelection(), false, "and is not executed on selection by default");
				assert.strictEqual(aVariants[0].getName(), "C Variant", "and the oData variant has the correct title");
				assert.strictEqual(aVariants[1].getVariantId(), "variant_4", "variant_4 is found");
				assert.strictEqual(aVariants[1].getFavorite(), false, "which is NOT a favorite");
				assert.strictEqual(
					aVariants[1].getExecuteOnSelection(),
					true,
					"and is executed on selection, because it is flagged within the object"
				);
				assert.strictEqual(aVariants[1].getName(), "B Variant", "and the oData variant has the correct title");
				assert.strictEqual(aVariants[2].getVariantId(), "variant_5", "variant_5 is found");
				assert.strictEqual(aVariants[2].getFavorite(), false, "which is NOT a favorite");
				assert.strictEqual(aVariants[2].getExecuteOnSelection(), false, "and is not executed on selection by default");
				assert.strictEqual(aVariants[2].getName(), "A Variant", "and the oData variant has the correct title");
				assert.strictEqual(aVariants[3].getVariantId(), "variant_1", "variant_1 is found");
				assert.strictEqual(
					aVariants[3].getFavorite(),
					false,
					"which is NOT a favorite, because it was added as a favorite and afterwards removed"
				);
				assert.strictEqual(aVariants[3].getExecuteOnSelection(), false, "and is not executed on selection by default");
				assert.strictEqual(aVariants[3].getName(), "B Variant", "and the variant has the correct title");
				assert.strictEqual(aVariants[4].getVariantId(), "variant_2", "variant_2 is found");
				assert.strictEqual(
					aVariants[4].getFavorite(),
					true,
					"which is a favorite, because it is flagged as one within the content"
				);
				assert.strictEqual(
					aVariants[4].getExecuteOnSelection(),
					true,
					"and is executed on selection, because it is flagged within the content"
				);
				assert.strictEqual(aVariants[4].getName(), "B Variant2", "and the variant has the correct title");
				assert.strictEqual(
					aVariants[5].getFavorite(),
					false,
					"which is a favorite, because it is flagged as one within the content"
				);
				assert.strictEqual(
					aVariants[5].getExecuteOnSelection(),
					false,
					"and is executed on selection, because it is flagged within the content"
				);
				assert.strictEqual(aVariants[5].getName(), "a new name", "and the variant has the correct title");
				assert.deepEqual(aVariants[5].getContexts(), {
					ROLE: ["SOME_ROLE"]
				}, "the variant has roles because of the update");
				assert.deepEqual(aVariants[5].getContent(), {
					some: "property",
					another: "value"
				}, "and the variants content was updated");
			});
		});

		QUnit.test("When loadVariants() is called and multiple variants, of which multiple are a overruling the standard variant, are present for the persistencyKey of the passed control", function(assert) {
			this.oControl = new Control("controlId1");
			var sPersistencyKey = "variantManagement1";
			this.oControl.getPersonalizableControlPersistencyKey = function() {
				return sPersistencyKey;
			};

			var mFlexData = LoaderExtensions.loadResource({
				dataType: "json",
				url: sap.ui.require.toUrl(
					"test-resources/sap/ui/fl/qunit/apply/api/" +
					"SmartVariantManagementAPI.loadVariantsTestSetup-flexData-withStandardVariant.json"
				)
			});

			sandbox.stub(LrepConnector, "loadFlexData").resolves(mFlexData);

			var aVariants = [{
				id: "variant_3",
				name: "C variant" // explicitly no content to test the optional content parameter
			}, {
				id: "variant_4",
				executeOnSelection: true,
				name: "A variant",
				content: {}
			}, {
				id: "variant_5",
				name: "A Variant",
				content: {}
			}];

			var sStandardVariantTitle = "this is a localized standard variant title";

			return SmartVariantManagementApplyAPI.loadVariants({
				control: this.oControl,
				standardVariant: {
					name: sStandardVariantTitle
				},
				variants: aVariants
			})
			.then(function(oResponse) {
				var oStandardVariant = oResponse.standardVariant;
				assert.strictEqual(oStandardVariant.getVariantId(), "variant_standard2", "the first is the overwritten standard variant");
				assert.strictEqual(
					oStandardVariant.getText("variantName"),
					"This another of my very own standard variant text",
					"with the title from the variant file"
				);
				assert.strictEqual(oStandardVariant.getExecuteOnSelection(), true, "and not is executed on selection due to a change");
				assert.strictEqual(oStandardVariant.getFavorite(), true, "and it is a favorite");

				assert.strictEqual(oResponse.defaultVariantId, "", "no default variant is returned (as none was set)");

				var aVariants = oResponse.variants;
				assert.strictEqual(aVariants.length, 5, "then five entities are returned");
				assert.strictEqual(aVariants[0].getVariantId(), "variant_3", "the six is the variant provided from the loadFlexData");
				assert.strictEqual(aVariants[0].getFavorite(), true, "which was changed to be a favorite");
				assert.strictEqual(aVariants[0].getExecuteOnSelection(), false, "and is not executed on selection by default");
				assert.strictEqual(aVariants[1].getVariantId(), "variant_4", "the third is the variant provided from the loadFlexData");
				assert.strictEqual(aVariants[1].getFavorite(), false, "which is NOT a favorite");
				assert.strictEqual(
					aVariants[1].getExecuteOnSelection(),
					true,
					"and is executed on selection, because it is flagged within the object"
				);
				assert.strictEqual(aVariants[2].getVariantId(), "variant_5", "the second is the variant provided from the loadFlexData");
				assert.strictEqual(aVariants[2].getFavorite(), false, "which is NOT a favorite");
				assert.strictEqual(aVariants[2].getExecuteOnSelection(), false, "and is not executed on selection by default");
				assert.strictEqual(aVariants[3].getVariantId(), "variant_1", "the fourth is the variant provided from the loadFlexData");
				assert.strictEqual(
					aVariants[3].getFavorite(),
					false,
					"which is NOT a favorite, because it was added as a favorite and afterwards removed"
				);
				assert.strictEqual(aVariants[3].getExecuteOnSelection(), false, "and is not executed on selection by default");
				assert.strictEqual(aVariants[4].getVariantId(), "variant_2", "the fifth is the variant provided from the loadFlexData");
				assert.strictEqual(
					aVariants[4].getFavorite(),
					true,
					"which is a favorite, because it is flagged as one within the content"
				);
				assert.strictEqual(
					aVariants[4].getExecuteOnSelection(),
					true,
					"and is executed on selection, because it is flagged within the content"
				);
			});
		});

		QUnit.test("When isVendorLayer() is called it calls the corresponding Utils function", function(assert) {
			sandbox.stub(LayerUtils, "isVendorLayer").withArgs().returns(false);
			var bVendorLayer = SmartVariantManagementApplyAPI.isVendorLayer();

			assert.strictEqual(bVendorLayer, false);
		});

		QUnit.test("When isVariantDownport() is called it calls the corresponding Utils function", function(assert) {
			sandbox.stub(LayerUtils, "getCurrentLayer").withArgs().returns("VENDOR");
			sandbox.stub(UriParameters.prototype, "get").withArgs("hotfix").returns("true");
			var bVendorLayer = SmartVariantManagementApplyAPI.isVariantDownport();

			assert.strictEqual(bVendorLayer, true);
		});
	});

	/**
	 * @deprecated Since version 1.86
	 */
	QUnit.module("SmartVariantManagementApplyAPI.getDefaultVariantId", {
		beforeEach: function() {
			this.oAppComponent = new UIComponent("AppComponent21");
			this.oControl = new Control("controlId1");
			sandbox.stub(Utils, "getAppComponentForControl").returns(this.oAppComponent);
		},
		afterEach: function() {
			FlexState.clearState("sap.ui.core");
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
		}].forEach(function(oTestData) {
			QUnit.test(oTestData.testName, function(assert) {
				this.oControl.getPersonalizableControlPersistencyKey = function() {
					return "variant1";
				};
				sandbox.stub(LrepConnector, "loadFlexData").resolves({
					changes: oTestData.changes
				});

				// clear state created in the beforeEach
				FlexState.clearState("sap.ui.core");
				// simulate FlexState initialization
				return SmartVariantManagementApplyAPI.loadVariants({control: this.oControl, standardVariant: {}})
				.then(function() {
					var sDefaultVariantName = SmartVariantManagementApplyAPI.getDefaultVariantId({control: this.oControl});
					assert.strictEqual(sDefaultVariantName, oTestData.expected);
				}.bind(this));
			});
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});