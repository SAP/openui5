/* global QUnit */

sap.ui.define([
	"sap/ui/fl/Utils",
	"sap/ui/fl/apply/api/SmartVariantManagementApplyAPI",
	"sap/ui/core/UIComponent",
	"sap/ui/core/Control",
	"sap/ui/fl/apply/_internal/flexObjects/States",
	"sap/ui/fl/apply/_internal/flexState/compVariants/CompVariantManagementState",
	"sap/ui/fl/apply/_internal/flexState/FlexState",
	"sap/ui/fl/initial/_internal/connectors/LrepConnector",
	"sap/base/util/LoaderExtensions",
	"sap/ui/thirdparty/sinon-4"
], function(
	Utils,
	SmartVariantManagementApplyAPI,
	UIComponent,
	Control,
	States,
	CompVariantManagementState,
	FlexState,
	LrepConnector,
	LoaderExtensions,
	sinon
) {
	"use strict";

	var sandbox = sinon.createSandbox();
	const sStandardVariantTitle = "this is a localized standard variant title";

	QUnit.module("SmartVariantManagementApplyAPI", {
		beforeEach() {
			this.oAppComponent = new UIComponent("AppComponent21");
			sandbox.stub(Utils, "getAppComponentForControl").returns(this.oAppComponent);
		},
		afterEach() {
			FlexState.clearState();
			FlexState.clearRuntimeSteadyObjects("sap.ui.core", "AppComponent21");
			if (this.oControl) {
				this.oControl.destroy();
			}
			this.oAppComponent.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("When loadVariants() is called and multiple variants are present for the persistencyKey of the passed control", async function(assert) {
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

			const sReference = "sap.ui.demoapps.rta.fiorielements";
			var aVariants = [{
				id: "#variant_3",
				name: "C Variant",
				content: {},
				reference: sReference,
				fileType: "variant"
			}, {
				id: "#variant_4",
				executeOnSelection: true,
				name: "B Variant",
				content: {},
				reference: sReference,
				fileType: "variant"
			}, {
				id: "#variant_5",
				name: "A Variant",
				content: {},
				reference: sReference,
				fileType: "variant"
			}];

			var oStandardVariant = {
				name: sStandardVariantTitle,
				reference: sReference,
				fileType: "variant"
			};
			await FlexState.initialize({reference: sReference, componentId: "AppComponent21"});
			const oResponse = await SmartVariantManagementApplyAPI.loadVariants({
				control: this.oControl,
				standardVariant: oStandardVariant,
				variants: aVariants
			});

			var oReturnedStandardVariant = oResponse.standardVariant;
			assert.strictEqual(oReturnedStandardVariant.getVariantId(), "*standard*", "the first is the standard variant passed");
			assert.strictEqual(oReturnedStandardVariant.getText("variantName"), sStandardVariantTitle, "with the passed title");
			assert.strictEqual(
				oReturnedStandardVariant.getExecuteOnSelection(),
				true,
				"and is executed on selection by a standardVariant change"
			);
			assert.strictEqual(oReturnedStandardVariant.getFavorite(), true, "which is by default a favorite");
			const aStandardVariantChanges = CompVariantManagementState.getVariantChanges(oReturnedStandardVariant);
			assert.strictEqual(aStandardVariantChanges.length, 1, "one change was applied on the standard variant");
			assert.strictEqual(aStandardVariantChanges[0].getId(), "id_1607667712160_48_standardVariant", "with the correct id");
			assert.strictEqual(
				oReturnedStandardVariant.getState(),
				States.LifecycleState.PERSISTED,
				"the state of the standard variant is set to persisted"
			);

			assert.strictEqual(oResponse.defaultVariantId, "variant_2", "the correct variant is returned as default");

			assert.strictEqual(oReturnedStandardVariant.getVariantId(), "*standard*", "the first is the standard variant passed");
			assert.strictEqual(oReturnedStandardVariant.getText("variantName"), sStandardVariantTitle, "with the passed title");
			assert.strictEqual(
				oReturnedStandardVariant.getExecuteOnSelection(),
				true,
				"and is executed on selection by a standardVariant change"
			);

			var aReturnedVariants = oResponse.variants;
			assert.strictEqual(aReturnedVariants.length, 6, "then six entities are returned");

			// variant 1
			assert.strictEqual(aReturnedVariants[0].getVariantId(), "variant_1", "variant_1 is found");
			assert.strictEqual(
				aReturnedVariants[0].getFavorite(),
				false,
				"which is NOT a favorite, because it was added as a favorite and afterwards removed"
			);
			assert.strictEqual(aReturnedVariants[0].getExecuteOnSelection(), false, "and is not executed on selection by default");
			assert.strictEqual(aReturnedVariants[0].getName(), "B Variant", "and the variant has the correct title");

			// variant 2
			assert.strictEqual(aReturnedVariants[1].getVariantId(), "variant_2", "variant_2 is found");
			assert.strictEqual(
				aReturnedVariants[1].getFavorite(),
				true,
				"which is a favorite, because it is flagged as one within the content"
			);
			assert.strictEqual(
				aReturnedVariants[1].getExecuteOnSelection(),
				true,
				"and is executed on selection, because it is flagged within the content"
			);
			assert.strictEqual(aReturnedVariants[1].getName(), "B Variant2", "and the variant has the correct title");

			// variant 3
			assert.strictEqual(
				aReturnedVariants[2].getFavorite(),
				false,
				"which is a favorite, because it is flagged as one within the content"
			);
			assert.strictEqual(
				aReturnedVariants[2].getExecuteOnSelection(),
				false,
				"and is executed on selection, because it is flagged within the content"
			);
			assert.strictEqual(aReturnedVariants[2].getName(), "a new name", "and the variant has the correct title");
			assert.deepEqual(aReturnedVariants[2].getContexts(), {
				ROLE: ["SOME_ROLE"]
			}, "the variant has roles because of the update");
			assert.deepEqual(aReturnedVariants[2].getContent(), {
				some: "property",
				another: "value"
			}, "and the variants content was updated");

			// variant 4
			assert.strictEqual(aReturnedVariants[3].getVariantId(), "_HASHTAG_variant_3", "#variant_3 is found");
			assert.strictEqual(aReturnedVariants[3].getFavorite(), true, "which was changed to be a favorite");
			assert.strictEqual(aReturnedVariants[3].getExecuteOnSelection(), false, "and is not executed on selection by default");
			assert.strictEqual(aReturnedVariants[3].getName(), "C Variant", "and the oData variant has the correct title");

			// variant 5
			assert.strictEqual(aReturnedVariants[4].getVariantId(), "_HASHTAG_variant_4", "#variant_4 is found");
			assert.strictEqual(aReturnedVariants[4].getFavorite(), false, "which is NOT a favorite");
			assert.strictEqual(
				aReturnedVariants[4].getExecuteOnSelection(),
				true,
				"and is executed on selection, because it is flagged within the object"
			);
			assert.strictEqual(aReturnedVariants[4].getName(), "B Variant", "and the oData variant has the correct title");

			// variant 6
			assert.strictEqual(aReturnedVariants[5].getVariantId(), "_HASHTAG_variant_5", "#variant_5 is found");
			assert.strictEqual(aReturnedVariants[5].getFavorite(), false, "which is NOT a favorite");
			assert.strictEqual(aReturnedVariants[5].getExecuteOnSelection(), false, "and is not executed on selection by default");
			assert.strictEqual(aReturnedVariants[5].getName(), "A Variant", "and the oData variant has the correct title");

			assert.ok(
				aReturnedVariants.every((oVariant) => oVariant.getState() === States.LifecycleState.PERSISTED),
				"the state of other variants is set to persisted"
			);
		});

		QUnit.test("When loadVariants() is called and multiple variants, of which multiple are a overruling the standard variant, are present for the persistencyKey of the passed control", async function(assert) {
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

			let aVariants = [{
				id: "#variant_3",
				name: "C variant" // explicitly no content to test the optional content parameter
			}, {
				id: "#variant_4",
				executeOnSelection: true,
				name: "A variant",
				content: {}
			}, {
				id: "#variant_5",
				name: "A Variant",
				content: {}
			}];

			await FlexState.initialize({reference: "sap.ui.core", componentId: "AppComponent21"});
			const oResponse = await SmartVariantManagementApplyAPI.loadVariants({
				control: this.oControl,
				standardVariant: oStandardVariant,
				variants: aVariants
			});

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

			aVariants = oResponse.variants;
			assert.strictEqual(aVariants.length, 5, "then five entities are returned");
			assert.strictEqual(aVariants[0].getVariantId(), "variant_1", "the first is the variant provided from the API");
			assert.strictEqual(aVariants[0].getFavorite(), false, "which was changed two times to be not a favorite");
			assert.strictEqual(aVariants[0].getExecuteOnSelection(), false, "and is not executed on selection by default");
			assert.strictEqual(aVariants[1].getVariantId(), "variant_2", "the second is the variant provided from the API");
			assert.strictEqual(aVariants[1].getFavorite(), true, "which is a favorite");
			assert.strictEqual(
				aVariants[1].getExecuteOnSelection(),
				true,
				"and is executed on selection, because it is flagged within the object"
			);
			assert.strictEqual(aVariants[2].getVariantId(), "_HASHTAG_variant_3", "the third is the variant provided from the API");
			assert.strictEqual(aVariants[2].getFavorite(), true, "which is changed to be a favorite");
			assert.strictEqual(aVariants[2].getExecuteOnSelection(), false, "and is not executed on selection by default");
			assert.strictEqual(aVariants[3].getVariantId(), "_HASHTAG_variant_4", "the fourth is the variant provided from the API");
			assert.strictEqual(
				aVariants[3].getFavorite(),
				false,
				"which is NOT a favorite, because it was added as a favorite and afterwards removed"
			);
			assert.strictEqual(aVariants[3].getExecuteOnSelection(), true, "and is not executed on selection by default");
			assert.strictEqual(aVariants[4].getVariantId(), "_HASHTAG_variant_5", "the fifth is the variant provided from the API");
			assert.strictEqual(
				aVariants[4].getFavorite(),
				false,
				"which is a favorite, because it is flagged as one within the content"
			);
			assert.strictEqual(
				aVariants[4].getExecuteOnSelection(),
				false,
				"and is executed on selection, because it is flagged within the content"
			);
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});