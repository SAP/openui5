/* global QUnit */

sap.ui.define([
	"sap/base/util/LoaderExtensions",
	"sap/base/util/values",
	"sap/base/util/merge",
	"sap/base/util/includes",
	"sap/base/Log",
	"sap/ui/core/util/reflection/JsControlTreeModifier",
	"sap/ui/fl/Change",
	"sap/ui/fl/Layer",
	"sap/ui/fl/Utils",
	"sap/ui/fl/apply/_internal/controlVariants/Utils",
	"sap/ui/fl/apply/_internal/flexObjects/FlexObjectFactory",
	"sap/ui/fl/apply/_internal/flexState/controlVariants/VariantManagementState",
	"sap/ui/fl/apply/_internal/flexState/controlVariants/prepareVariantsMap",
	"sap/ui/fl/apply/_internal/flexState/FlexState",
	"sap/ui/fl/initial/_internal/StorageUtils",
	"sap/ui/thirdparty/sinon-4"
], function(
	LoaderExtensions,
	values,
	merge,
	includes,
	Log,
	JsControlTreeModifier,
	Change,
	Layer,
	Utils,
	VariantUtil,
	FlexObjectFactory,
	VariantManagementState,
	prepareVariantsMap,
	FlexState,
	StorageUtils,
	sinon
) {
	"use strict";
	var sandbox = sinon.createSandbox();
	QUnit.dump.maxDepth = 20;

	function getInitialChangesForVariant (sVReference, mVariantsMap) {
		return values(mVariantsMap).reduce(function(aChanges, oVMData) {
			oVMData.variants.some(function(oVariant) {
				if (oVariant.instance.getId() === sVReference) {
					aChanges = aChanges.concat(oVariant.controlChanges);
					return true;
				}
			});
			return aChanges;
		}, []);
	}

	function createVariant(mVariantProperties) {
		return FlexObjectFactory.createFlVariant({
			variantName: mVariantProperties.title,
			id: mVariantProperties.fileName,
			reference: mVariantProperties.reference || "myReference",
			layer: mVariantProperties.layer,
			user: mVariantProperties.author,
			variantReference: mVariantProperties.variantReference,
			variantManagementReference: mVariantProperties.variantManagementReference,
			favorite: mVariantProperties.favorite,
			visible: mVariantProperties.visible,
			executeOnSelection: mVariantProperties.executeOnSelect,
			contexts: mVariantProperties.contexts
		});
	}

	QUnit.module("Given a VariantManagementState", {
		afterEach: function() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when fake Standard Variants are used", function(assert) {
			var oSetStub = sandbox.stub(FlexState, "setFakeStandardVariant");
			var oResetStub = sandbox.stub(FlexState, "resetFakedStandardVariants");

			var oVariant = {foo: "bar"};
			var sReference = "flexReference";
			var sComponentId = "componentId";
			VariantManagementState.addFakeStandardVariant(sReference, sComponentId, oVariant);
			assert.strictEqual(oSetStub.callCount, 1, "the FlexState was called once");
			assert.strictEqual(oSetStub.lastCall.args[0], sReference, "the reference was passed");
			assert.strictEqual(oSetStub.lastCall.args[1], sComponentId, "the component ID was passed");
			assert.strictEqual(oSetStub.lastCall.args[2], oVariant, "the Variant was passed");

			VariantManagementState.clearFakedStandardVariants(sReference, sComponentId);
			assert.strictEqual(oResetStub.callCount, 1, "the FlexState was called once");
			assert.strictEqual(oResetStub.lastCall.args[0], sReference, "the reference was passed");
			assert.strictEqual(oResetStub.lastCall.args[1], sComponentId, "the component ID was passed");
		});

		QUnit.test("when getContent is called", function(assert) {
			var oClearStub = sandbox.stub(FlexState, "getVariantsState");

			var sReference = "flexReference";
			VariantManagementState.getContent(sReference);
			assert.strictEqual(oClearStub.callCount, 1, "the FlexState was called once");
			assert.strictEqual(oClearStub.lastCall.args[0], sReference, "the reference was passed");
		});
	});

	QUnit.module("Given a backend response from storage", {
		beforeEach: function() {
			return Promise.all([
				LoaderExtensions.loadResource({
					dataType: "json",
					url: sap.ui.require.toUrl("test-resources/sap/ui/fl/qunit/testResources/TestVariantsConnectorResponse.json"),
					async: true
				}),
				LoaderExtensions.loadResource({
					dataType: "json",
					url: sap.ui.require.toUrl("test-resources/sap/ui/fl/qunit/testResources/TestFakeVariantsModelData.json"),
					async: true
				})
			]).then(function(aValues) {
				this.oBackendResponse = {};
				this.oBackendResponse.changes = aValues[0];

				this.oVariantModelData = aValues[1];

				this.sReference = "componentReference";
				this.sComponentId = "componentId";
				this.mPropertyBag = {
					unfilteredStorageResponse: {changes: {}},
					storageResponse: this.oBackendResponse,
					componentId: this.sComponentId,
					componentData: {
						technicalParameters: {}
					},
					reference: this.sReference
				};
				this.oVariantsMap = {};
				sandbox.stub(VariantManagementState, "getContent")
					.callThrough()
					.withArgs(this.sReference)
					.returns(this.oVariantsMap);
			}.bind(this));
		},
		afterEach: function() {
			sandbox.restore();
		}
	}, function () {
		QUnit.test("when 'fillVariantModel' and then 'getInitialChanges' are called with parameters containing no technical parameters", function(assert) {
			merge(this.oVariantsMap, prepareVariantsMap(this.mPropertyBag));

			var oData = VariantManagementState.fillVariantModel({reference: this.sReference});

			assert.deepEqual(oData, this.oVariantModelData, "then correct variant model data is returned");

			var aResultantInitialChanges = VariantManagementState.getInitialChanges({reference: this.sReference});
			var aExpectedInitialChanges = [];
			Object.keys(oData).forEach(function(sVMReference) {
				aExpectedInitialChanges = aExpectedInitialChanges.concat(
					getInitialChangesForVariant(oData[sVMReference].currentVariant || oData[sVMReference].defaultVariant, this.oVariantsMap)
				);
			}.bind(this));
			assert.deepEqual(aResultantInitialChanges, aExpectedInitialChanges, "then correct initial changes were returned");
		});

		QUnit.test("when 'fillVariantModel' and then 'getInitialChanges' are called with parameters containing technical parameters for multiple variant management references", function(assert) {
			this.mPropertyBag.componentData.technicalParameters[VariantUtil.VARIANT_TECHNICAL_PARAMETER] = ["vmReference1", "variant11"];

			merge(this.oVariantsMap, prepareVariantsMap(this.mPropertyBag));

			var oData = VariantManagementState.fillVariantModel({reference: this.sReference});
			this.oVariantModelData["vmReference1"].currentVariant = "vmReference1";
			this.oVariantModelData["vmReference2"].currentVariant = "variant11";

			assert.deepEqual(oData, this.oVariantModelData, "then correct variant model data is returned");

			var aResultantInitialChanges = VariantManagementState.getInitialChanges({reference: this.sReference});
			var aExpectedInitialChanges = [];
			Object.keys(oData).forEach(function(sVMReference) {
				aExpectedInitialChanges = aExpectedInitialChanges.concat(
					getInitialChangesForVariant(oData[sVMReference].currentVariant || oData[sVMReference].defaultVariant, this.oVariantsMap)
				);
			}.bind(this));
			assert.deepEqual(aResultantInitialChanges, aExpectedInitialChanges, "then correct initial changes were returned");
		});

		QUnit.test("when 'fillVariantModel' and then 'getInitialChanges' are called with parameters containing technical parameters for a single variant management reference", function(assert) {
			this.mPropertyBag.componentData.technicalParameters[VariantUtil.VARIANT_TECHNICAL_PARAMETER] = ["vmReference1"];

			merge(this.oVariantsMap, prepareVariantsMap(this.mPropertyBag));

			var oData = VariantManagementState.fillVariantModel({reference: this.sReference});
			this.oVariantModelData["vmReference1"].currentVariant = "vmReference1";

			assert.deepEqual(oData, this.oVariantModelData, "then correct variant model data is returned");

			var aResultantInitialChanges = VariantManagementState.getInitialChanges({reference: this.sReference});
			var aExpectedInitialChanges = [];
			Object.keys(oData).forEach(function(sVMReference) {
				aExpectedInitialChanges = aExpectedInitialChanges.concat(
					getInitialChangesForVariant(oData[sVMReference].currentVariant || oData[sVMReference].defaultVariant, this.oVariantsMap)
				);
			}.bind(this));
			assert.deepEqual(aResultantInitialChanges, aExpectedInitialChanges, "then correct initial changes were returned");
		});

		QUnit.test("when 'fillVariantModel' and then 'getInitialChanges' are called with parameters containing multiple technical parameters for a single variant management reference", function(assert) {
			this.mPropertyBag.componentData.technicalParameters[VariantUtil.VARIANT_TECHNICAL_PARAMETER] = ["vmReference2", "variant11"];

			merge(this.oVariantsMap, prepareVariantsMap(this.mPropertyBag));

			var oData = VariantManagementState.fillVariantModel({reference: this.sReference});
			this.oVariantModelData["vmReference2"].currentVariant = "variant11";

			assert.deepEqual(oData, this.oVariantModelData, "then correct variant model data is returned");

			var aResultantInitialChanges = VariantManagementState.getInitialChanges({reference: this.sReference});
			var aExpectedInitialChanges = [];
			Object.keys(oData).forEach(function(sVMReference) {
				aExpectedInitialChanges = aExpectedInitialChanges.concat(
					getInitialChangesForVariant(oData[sVMReference].currentVariant || oData[sVMReference].defaultVariant, this.oVariantsMap)
				);
			}.bind(this));
			assert.deepEqual(aResultantInitialChanges, aExpectedInitialChanges, "then correct initial changes were returned");
		});

		QUnit.test("when 'fillVariantModel' and then 'getInitialChanges' are called with parameters containing valid and invalid technical parameters", function(assert) {
			this.mPropertyBag.componentData.technicalParameters[VariantUtil.VARIANT_TECHNICAL_PARAMETER] = ["nonExistenceVariantManagement", "vmReference1"];

			merge(this.oVariantsMap, prepareVariantsMap(this.mPropertyBag));

			var oData = VariantManagementState.fillVariantModel({reference: this.sReference});
			this.oVariantModelData["vmReference1"].currentVariant = "vmReference1";

			assert.deepEqual(oData, this.oVariantModelData, "then correct variant model data is returned");

			var aResultantInitialChanges = VariantManagementState.getInitialChanges({reference: this.sReference});
			var aExpectedInitialChanges = [];
			Object.keys(oData).forEach(function(sVMReference) {
				aExpectedInitialChanges = aExpectedInitialChanges.concat(
					getInitialChangesForVariant(oData[sVMReference].currentVariant || oData[sVMReference].defaultVariant, this.oVariantsMap)
				);
			}.bind(this));
			assert.deepEqual(aResultantInitialChanges, aExpectedInitialChanges, "then correct initial changes were returned");
		});

		QUnit.test("when 'fillVariantModel' and then 'getInitialChanges' are called with parameters containing technical parameters for an invalid variant management reference", function(assert) {
			this.mPropertyBag.componentData.technicalParameters[VariantUtil.VARIANT_TECHNICAL_PARAMETER] = ["variant2"];

			merge(this.oVariantsMap, prepareVariantsMap(this.mPropertyBag));

			var oData = VariantManagementState.fillVariantModel({reference: this.sReference});

			assert.deepEqual(oData, this.oVariantModelData, "then correct variant model data is returned");

			var aResultantInitialChanges = VariantManagementState.getInitialChanges({reference: this.sReference});
			var aExpectedInitialChanges = [];
			Object.keys(oData).forEach(function(sVMReference) {
				aExpectedInitialChanges = aExpectedInitialChanges.concat(
					getInitialChangesForVariant(oData[sVMReference].currentVariant || oData[sVMReference].defaultVariant, this.oVariantsMap)
				);
			}.bind(this));
			assert.deepEqual(aResultantInitialChanges, aExpectedInitialChanges, "then correct initial changes were returned");
		});

		QUnit.test("when 'fillVariantModel' and then 'getInitialChanges' are called with parameters containing an invisible default variant", function(assert) {
			merge(this.oVariantsMap, prepareVariantsMap(this.mPropertyBag));

			var oData = VariantManagementState.fillVariantModel({reference: this.sReference});

			assert.deepEqual(oData, this.oVariantModelData, "then correct variant model data is returned");

			var aResultantInitialChanges = VariantManagementState.getInitialChanges({reference: this.sReference});
			var aExpectedInitialChanges = [];
			Object.keys(oData).forEach(function(sVMReference) {
				aExpectedInitialChanges = aExpectedInitialChanges.concat(
					getInitialChangesForVariant(oData[sVMReference].currentVariant || oData[sVMReference].defaultVariant, this.oVariantsMap)
				);
			}.bind(this));
			assert.deepEqual(aResultantInitialChanges, aExpectedInitialChanges, "then correct initial changes were returned");
		});

		QUnit.test("when 'getInitialChanges' is called with a vmReference", function(assert) {
			merge(this.oVariantsMap, prepareVariantsMap(this.mPropertyBag));
			var oGetVariantChangesStub = sandbox.stub(VariantManagementState, "getControlChangesForVariant").returns(["foo"]);

			assert.deepEqual(VariantManagementState.getInitialChanges({
				vmReference: "vmReference1",
				reference: this.sReference
			}), ["foo"], "the function returns what 'getControlChangesForVariant' returns for that variant");
			assert.equal(oGetVariantChangesStub.callCount, 1, "getControlChangesForVariant was called once");
			var mExpectedParameters = {
				vmReference: "vmReference1",
				reference: this.sReference,
				vReference: "variant0",
				includeDirtyChanges: false
			};
			assert.deepEqual(oGetVariantChangesStub.lastCall.args[0], mExpectedParameters, "the correct variant was asked for changes");

			this.oVariantsMap.vmReference1.currentVariant = "variant2";
			mExpectedParameters = {
				vmReference: "vmReference1",
				reference: this.sReference,
				vReference: "variant2",
				includeDirtyChanges: false
			};
			VariantManagementState.getInitialChanges({
				vmReference: "vmReference1",
				reference: this.sReference
			});
			assert.equal(oGetVariantChangesStub.callCount, 2, "getControlChangesForVariant was called once again");
			assert.deepEqual(oGetVariantChangesStub.lastCall.args[0], mExpectedParameters, "the correct variant was asked for changes");
		});

		QUnit.test("when 'setVariantData' is called with a changed title and previous index", function(assert) {
			merge(this.oVariantsMap, prepareVariantsMap(this.mPropertyBag));


			var aVariants = this.oVariantsMap["vmReference1"].variants;
			aVariants[1].instance.setName("ZZZ");
			assert.equal(aVariants[1].instance.getId(), "variant0", "then before renaming the title variant present at index 1");
			var iSortedIndex = VariantManagementState.setVariantData({vmReference: "vmReference1", previousIndex: 1, reference: this.sReference});
			assert.equal(iSortedIndex, 2, "then the correct sorted index was returned");
			assert.equal(aVariants[2].instance.getId(), "variant0", "then the renamed variant was placed at the correct index");
		});

		QUnit.test("when 'setVariantData' is called with a changed title and previous index for standard variant", function(assert) {
			merge(this.oVariantsMap, prepareVariantsMap(this.mPropertyBag));

			var aVariants = this.oVariantsMap["vmReference1"].variants;
			aVariants[1].instance.setName("ZZZ");
			assert.equal(aVariants[0].instance.getId(), "vmReference1", "then before renaming the title variant present at index 0");
			var iSortedIndex = VariantManagementState.setVariantData({vmReference: "vmReference1", previousIndex: 0, reference: this.sReference});
			assert.equal(iSortedIndex, 0, "then the correct sorted index was returned");
			assert.equal(aVariants[0].instance.getId(), "vmReference1", "then the renamed variant was placed at the correct index\"");
		});

		QUnit.test("when 'getVariant' is called", function(assert) {
			merge(this.oVariantsMap, prepareVariantsMap(this.mPropertyBag));
			var oExpectedVariant = this.oVariantsMap["vmReference1"].variants[0];
			var oVariant = VariantManagementState.getVariant({vmReference: "vmReference1", vReference: oExpectedVariant.instance.getId(), reference: this.sReference});
			assert.deepEqual(oExpectedVariant, oVariant, "then the correct variant object is returned");
		});

		QUnit.test("when 'getControlChangesForVariant' is called with includeDirtyChanges parameter", function(assert) {
			merge(this.oVariantsMap, prepareVariantsMap(this.mPropertyBag));
			var oDirtyChange = new Change({
				fileName: "dirtyChange",
				layer: Layer.CUSTOMER
			});
			VariantManagementState.addChangeToVariant({
				change: oDirtyChange,
				vmReference: "vmReference1",
				vReference: "variant0",
				reference: this.sReference
			});

			function includesDirtyChange(aChanges) {
				return !!aChanges.find(function(oChange) {
					return oChange.getFileName() === "dirtyChange";
				});
			}

			var aAllChanges = VariantManagementState.getControlChangesForVariant({
				vmReference: "vmReference1",
				reference: this.sReference
			});
			assert.ok(
				includesDirtyChange(aAllChanges),
				"then by default the dirty change is returned"
			);
			var aPersistedChanges = VariantManagementState.getControlChangesForVariant({
				vmReference: "vmReference1",
				reference: this.sReference,
				includeDirtyChanges: false
			});
			assert.notOk(
				includesDirtyChange(aPersistedChanges),
				"then if the parameter is set, the dirty change is excluded"
			);
		});

		QUnit.test("when 'getVariantChangesForVariant' is called", function(assert) {
			merge(this.oVariantsMap, prepareVariantsMap(this.mPropertyBag));

			var oVariantChanges1 = VariantManagementState.getVariantChangesForVariant({vmReference: "vmReference1", reference: this.sReference});
			var oVariantChanges2 = VariantManagementState.getVariantChangesForVariant({vmReference: "vmReference1", vReference: "variant2", reference: this.sReference});
			var oVariantChanges3 = VariantManagementState.getVariantChangesForVariant({vmReference: "vmReference1", vReference: "notExisting", reference: this.sReference});

			assert.equal(Object.keys(oVariantChanges1).length, 3, "three kinds of variant changes are returned for the default variant (variant0)");
			assert.equal(Object.keys(oVariantChanges2).length, 3, "three kinds of variant changes are returned for variant2");
			assert.deepEqual(oVariantChanges3, {}, "an empty object is returned for variant3");
		});

		QUnit.test("when 'setCurrentVariant'  is called", function(assert) {
			merge(this.oVariantsMap, prepareVariantsMap(this.mPropertyBag));
			assert.notOk(this.oVariantsMap["vmReference1"].currentVariant, "then previously the current variant is not set");
			VariantManagementState.setCurrentVariant({vmReference: "vmReference1", newVReference: "variant2", reference: this.sReference});
			assert.strictEqual(this.oVariantsMap["vmReference1"].currentVariant, "variant2", "then current variant is set correctly");
		});

		QUnit.test("when 'getVariantManagementReferences'  is called", function(assert) {
			merge(this.oVariantsMap, prepareVariantsMap(this.mPropertyBag));
			var aVMReferences = VariantManagementState.getVariantManagementReferences(this.sReference);
			assert.equal(aVMReferences.length, 6, "there are 6 references");
			assert.ok(includes(aVMReferences, "vmReference1"));
			assert.ok(includes(aVMReferences, "vmReference2"));
			assert.ok(includes(aVMReferences, "vmReference3"));
			assert.ok(includes(aVMReferences, "vmReference4"));
			assert.ok(includes(aVMReferences, "nonExistingVariant1"));
			assert.ok(includes(aVMReferences, "nonExistingVariant2"));
		});

		QUnit.test("when 'getCurrentVariantReference' is called", function(assert) {
			merge(this.oVariantsMap, prepareVariantsMap(this.mPropertyBag));
			var sCurrentVariantReference = VariantManagementState.getCurrentVariantReference({
				reference: this.sReference,
				vmReference: "vmReference1"
			});
			assert.equal(sCurrentVariantReference, "variant0", "the default is the current variant reference");

			this.oVariantsMap.vmReference1.currentVariant = "variant2";
			sCurrentVariantReference = VariantManagementState.getCurrentVariantReference({
				reference: this.sReference,
				vmReference: "vmReference1"
			});
			assert.equal(sCurrentVariantReference, "variant2", "the default is the current variant reference");
		});

		QUnit.test("when waitForInitialVariantChanges is called", function(assert) {
			merge(this.oVariantsMap, prepareVariantsMap(this.mPropertyBag));
			var oFlexControllerStub = {
				waitForChangesToBeApplied: sandbox.stub().resolves("foo")
			};
			sandbox.stub(JsControlTreeModifier, "bySelector").callsFake(function(oSelector) {
				return oSelector.id;
			});
			return VariantManagementState.waitForInitialVariantChanges({
				vmReference: "vmReference1",
				reference: this.sReference,
				appComponent: {},
				flexController: oFlexControllerStub
			})
			.then(function(vReturn) {
				assert.equal(vReturn, "foo", "the function returns the return value of waitForChanges");
				assert.equal(oFlexControllerStub.waitForChangesToBeApplied.callCount, 1, "waitForChanges was called once");
				var aArguments = oFlexControllerStub.waitForChangesToBeApplied.lastCall.args[0];
				assert.ok(Utils.indexOfObject(aArguments, {selector: "RTADemoAppMD---detail--GroupElementDatesShippingStatus" }) > -1, "the first selector was passed");
				assert.ok(Utils.indexOfObject(aArguments, {selector: "RTADemoAppMD---detail--GroupElementDatesShippingStatus1" }) > -1, "the second selector was passed");
			});
		});

		QUnit.test("when waitForInitialVariantChanges is called with unavailable controls", function(assert) {
			merge(this.oVariantsMap, prepareVariantsMap(this.mPropertyBag));
			var oFlexControllerStub = {
				waitForChangesToBeApplied: sandbox.stub().resolves("foo")
			};
			sandbox.stub(JsControlTreeModifier, "bySelector");
			return VariantManagementState.waitForInitialVariantChanges({
				vmReference: "vmReference1",
				reference: this.sReference,
				appComponent: {},
				flexController: oFlexControllerStub
			})
			.then(function() {
				assert.ok(true, "the function resolves");
				assert.equal(oFlexControllerStub.waitForChangesToBeApplied.callCount, 0, "waitForChanges was not called");
			});
		});
	});

	QUnit.module("Given changes / variants are required to be added / removed from variant management state", {
		beforeEach: function() {
			this.oVariantsMap = {
				vmReference1: {
					variants: [
						{
							instance: createVariant({
								fileName: "vmReference1",
								title: "Standard"
							}),
							variantChanges: {},
							controlChanges: []
						},
						{
							instance: createVariant({
								fileName: "variant0",
								title: "existing"
							}),
							variantChanges: {
								setTitle: [
									{
										id: "testTitleChange"
									}
								]
							},
							controlChanges: [
								new Change({
									fileName: "controlChange1",
									layer: Layer.VENDOR
								}),
								new Change({
									fileName: "controlChange2",
									layer: Layer.VENDOR
								}),
								new Change({
									fileName: "controlChange3",
									layer: Layer.CUSTOMER
								})
							]
						}
					],
					variantManagementChanges: {
						setDefault: [
							{
								id: "testDefaultChange"
							}
						]
					}
				}
			};
			this.sReference = "componentReference";
			this.sVMReference = "vmReference1";
			sandbox.stub(VariantManagementState, "getContent")
				.callThrough()
				.withArgs(this.sReference)
				.returns(this.oVariantsMap);
		},
		afterEach: function() {
			sandbox.restore();
		}
	}, function () {
		QUnit.test("when 'updateChangesForVariantManagementInMap' is called to add a variant change", function(assert) {
			var mArguments = {
				add: true,
				changeContent: {
					fileName: "new_setTitle",
					fileType: "ctrl_variant_change",
					changeType: "setTitle",
					selector: {id: "variant0"}
				},
				vmReference: this.sVMReference,
				reference: this.sReference
			};
			VariantManagementState.updateChangesForVariantManagementInMap(mArguments);
			var oTargetVariant = this.oVariantsMap[this.sVMReference].variants[1];
			var oLastVariantChange = oTargetVariant.variantChanges[mArguments.changeContent.changeType].pop();
			assert.equal(oTargetVariant.instance.getId(), mArguments.changeContent.selector.id, "then it is the target variant");
			assert.equal(oLastVariantChange.fileName, mArguments.changeContent.fileName, "then the new variant change was added to the map");
		});

		QUnit.test("when 'updateChangesForVariantManagementInMap' is called to remove a variant change", function(assert) {
			var mArguments = {
				add: false,
				changeContent: {
					fileName: "new_setTitle",
					fileType: "ctrl_variant_change",
					changeType: "setTitle",
					selector: {id: "variant0"}
				},
				vmReference: this.sVMReference,
				reference: this.sReference
			};
			this.oVariantsMap["vmReference1"].variants[1].variantChanges.setTitle.push(mArguments.changeContent);

			VariantManagementState.updateChangesForVariantManagementInMap(mArguments);
			var oTargetVariant = this.oVariantsMap[this.sVMReference].variants[1];
			var iLength = oTargetVariant.variantChanges[mArguments.changeContent.changeType].length;
			assert.equal(oTargetVariant.instance.getId(), mArguments.changeContent.selector.id, "then it is the target variant");
			assert.equal(iLength, 1, "then the variant changes have the correct length");
			assert.notEqual(oTargetVariant.variantChanges[mArguments.changeContent.changeType][0].fileName, mArguments.changeContent.fileName, "then the variant change was removed from the map");
		});

		QUnit.test("when 'updateChangesForVariantManagementInMap' is called to add a variant management change", function(assert) {
			var mArguments = {
				changeContent: {
					fileName: "new_setDefault",
					fileType: "ctrl_variant_management_change",
					changeType: "setDefault",
					selector: {id: "vmReference1"}
				},
				add: true,
				vmReference: this.sVMReference,
				reference: this.sReference
			};

			VariantManagementState.updateChangesForVariantManagementInMap(mArguments);
			var oLastVariantManagementChange = this.oVariantsMap[this.sVMReference].variantManagementChanges[mArguments.changeContent.changeType].pop();
			assert.ok(oLastVariantManagementChange.fileName, mArguments.changeContent.fileName, "then the variant management change was added");
		});

		QUnit.test("when 'updateChangesForVariantManagementInMap' is called to remove a variant management change", function(assert) {
			var mArguments = {
				changeContent: {
					fileName: "new_setDefault",
					fileType: "ctrl_variant_management_change",
					changeType: "setDefault",
					selector: {id: this.sVMReference}
				},
				add: false,
				vmReference: this.sVMReference,
				reference: this.sReference
			};
			this.oVariantsMap["vmReference1"].variantManagementChanges[mArguments.changeContent.changeType].push(mArguments.changeContent);

			VariantManagementState.updateChangesForVariantManagementInMap(mArguments);
			var iLength = this.oVariantsMap[this.sVMReference].variantManagementChanges[mArguments.changeContent.changeType].length;
			assert.equal(iLength, 1, "then the variant management changes have the correct length");
			assert.notEqual(this.oVariantsMap[this.sVMReference].variantManagementChanges[mArguments.changeContent.changeType][0].fileName, mArguments.changeContent.fileName, "then the variant management change was removed from the map");
		});

		QUnit.test("when calling 'addChangeToVariant' is called", function(assert) {
			var oChangeToBeAdded1 = new Change({fileName: "newChange"});
			var oChangeToBeAdded2 = new Change({fileName: "controlChange1"});
			var bSuccess1 = VariantManagementState.addChangeToVariant({change: oChangeToBeAdded1, vmReference: this.sVMReference, vReference: "variant0", reference: this.sReference});
			var bSuccess2 = VariantManagementState.addChangeToVariant({change: oChangeToBeAdded2, vmReference: this.sVMReference, vReference: "variant0", reference: this.sReference});

			assert.ok(bSuccess1, "then adding a change was successful");
			assert.notOk(bSuccess2, "then adding an already existing change was unsuccessful");

			var aChanges = VariantManagementState.getControlChangesForVariant({vmReference: this.sVMReference, vReference: "variant0", reference: this.sReference});
			assert.equal(aChanges.length, 4, "then the number of changes in the variant is correct");
			assert.equal(aChanges[3], oChangeToBeAdded1, "then the newly added change is at the end of the array");
		});

		QUnit.test("when 'removeChangeFromVariant' is called", function(assert) {
			var oChangeToBeRemoved1 = new Change({fileName: "controlChange1"});
			var oChangeToBeRemoved2 = new Change({fileName: "nonExistentChange"});
			var bSuccess1 = VariantManagementState.removeChangeFromVariant({change: oChangeToBeRemoved1, vmReference: this.sVMReference, vReference: "variant0", reference: this.sReference});
			var bSuccess2 = VariantManagementState.removeChangeFromVariant({change: oChangeToBeRemoved2, vmReference: this.sVMReference, vReference: "variant0", reference: this.sReference});

			assert.ok(bSuccess1, "then removing an existing change was successful");
			assert.notOk(bSuccess2, "then removing a non existent change was unsuccessful");

			var aChanges = VariantManagementState.getControlChangesForVariant({vmReference: this.sVMReference, vReference: "variant0", reference: this.sReference});
			assert.equal(aChanges.length, 2, "then the number of changes in the variant is correct");
			assert.notEqual(aChanges[0].getId(), oChangeToBeRemoved1.getId(), "then the removed change does not exist");
			assert.notEqual(aChanges[1].getId(), oChangeToBeRemoved1.getId(), "then the removed change does not exist");
		});

		QUnit.test("when 'addVariantToVariantManagement' is called with a new variant and no variant reference", function(assert) {
			var oChangeContent0 = {fileName: "change0"};
			var oChangeContent1 = {fileName: "change1"};

			var oFakeVariantData1 = {
				instance: createVariant({
					title: "AA",
					fileName: "newVariant1"
				}),
				controlChanges: [oChangeContent0]
			};

			var oFakeVariantData2 = {
				instance: createVariant({
					title: "ZZ",
					fileName: "newVariant2"
				}),
				controlChanges: [oChangeContent1]
			};

			var iIndex1 = VariantManagementState.addVariantToVariantManagement({variantData: oFakeVariantData1, vmReference: this.sVMReference, reference: this.sReference});
			var iIndex2 = VariantManagementState.addVariantToVariantManagement({variantData: oFakeVariantData2, vmReference: this.sVMReference, reference: this.sReference});

			var aVariants = this.oVariantsMap[this.sVMReference].variants;

			assert.equal(aVariants[iIndex1].instance.getId(), oFakeVariantData1.instance.getId(), "then the first variant was added to the correct index");
			assert.equal(aVariants[iIndex2].instance.getId(), oFakeVariantData2.instance.getId(), "then the second variant was added to the correct index");
		});

		QUnit.test("when 'addVariantToVariantManagement' is called on CUSTOMER layer and a variant reference from a VENDOR layer variant, with 2 VENDOR and one CUSTOMER change", function(assert) {
			var oChangeContent0 = new Change({fileName: "change0"});
			VariantManagementState.getControlChangesForVariant({vReference: "variant0", vmReference: this.sVMReference, reference: this.sReference});

			var oFakeVariantData = {
				instance: createVariant({
					fileName: "newVariant1",
					variantReference: "variant0",
					layer: Layer.CUSTOMER,
					title: "AA"
				}),
				controlChanges: [oChangeContent0]
			};

			var iIndex = VariantManagementState.addVariantToVariantManagement({variantData: oFakeVariantData, vmReference: this.sVMReference, reference: this.sReference});
			var aVariants = this.oVariantsMap[this.sVMReference].variants;

			assert.equal(aVariants[iIndex].instance.getId(), oFakeVariantData.instance.getId(), "then the variant was added to the correct index");

			var aChangeFileNames = aVariants[iIndex].controlChanges.map(function (oChange) {
				return oChange.getId();
			});
			assert.equal(aVariants[iIndex].controlChanges.length, 3, "then one own change and 2 referenced changes exists");
			assert.equal(aChangeFileNames[0], aVariants[2].controlChanges[0].getDefinition().fileName, "then referenced change exists at the starting of the array");
			assert.equal(aChangeFileNames[1], aVariants[2].controlChanges[1].getDefinition().fileName, "then referenced change exists at the starting of the array");
			assert.equal(aChangeFileNames[2], oChangeContent0.getId(), "then variant's own change exists and is placed at the end of the the array");
		});

		QUnit.test("when 'addVariantToVariantManagement' is called on USER layer and a variant reference from a VENDOR layer variant with 2 VENDOR and one CUSTOMER change", function(assert) {
			var oChangeContent0 = new Change({fileName: "change0"});
			VariantManagementState.getControlChangesForVariant({vReference: "variant0", vmReference: "vmReference1", reference: this.sReference});

			var oFakeVariantData = {
				instance: createVariant({
					fileName: "newVariant1",
					variantReference: "variant0",
					layer: Layer.USER,
					title: "AA"
				}),
				controlChanges: [oChangeContent0]
			};

			var iIndex = VariantManagementState.addVariantToVariantManagement({variantData: oFakeVariantData, vmReference: "vmReference1", reference: this.sReference});
			var aVariants = this.oVariantsMap["vmReference1"].variants;

			assert.equal(aVariants[iIndex].instance.getId(), oFakeVariantData.instance.getId(), "then the variant was added to the correct index");

			var aChangeFileNames = aVariants[iIndex].controlChanges.map(function (oChange) {
				return oChange.getId();
			});
			assert.equal(aVariants[iIndex].controlChanges.length, 4, "then one own change and 2 referenced changes exists");
			assert.equal(aChangeFileNames[0], aVariants[2].controlChanges[0].getDefinition().fileName, "then referenced change exists at the starting of the array");
			assert.equal(aChangeFileNames[1], aVariants[2].controlChanges[1].getDefinition().fileName, "then referenced change exists at the starting of the array");
			assert.equal(aChangeFileNames[2], aVariants[2].controlChanges[2].getDefinition().fileName, "then referenced change exists at the starting of the array");
			assert.equal(aChangeFileNames[3], oChangeContent0.getId(), "then variant's own change exists and is placed at the end of the the array");
		});

		QUnit.test("when 'removeVariantFromVariantManagement' is called with a variant", function(assert) {
			var oVariantDataToBeRemoved = this.oVariantsMap["vmReference1"].variants[1];
			var oVariantToBeRemoved = oVariantDataToBeRemoved.instance;

			VariantManagementState.removeVariantFromVariantManagement({variant: oVariantToBeRemoved, vmReference: "vmReference1", reference: this.sReference});

			var aVariants = this.oVariantsMap["vmReference1"].variants;
			var bPresent = aVariants.some(function(oVariant) {
				return oVariant.instance.getId() === oVariantDataToBeRemoved.instance.getId();
			});
			assert.notOk(bPresent, "then the variant was removed");
		});
	});

	QUnit.module("Given variant related changes are added / deleted from Flex State", {
		beforeEach: function() {
			this.oResponse = StorageUtils.getEmptyFlexDataResponse();
			this.sReference = "reference";
			sandbox.stub(FlexState, "getFlexObjectsFromStorageResponse").returns(this.oResponse);
			sandbox.stub(VariantManagementState, "getContent")
				.callThrough()
				.withArgs(this.sReference)
				.returns({someKey: "variantMap"});
		},
		afterEach: function() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when 'updateVariantsState' is called without an existing variants state", function(assert) {
			VariantManagementState.getContent.reset();
			sandbox.stub(Log, "error");
			VariantManagementState.updateVariantsState({
				reference: this.sReference
			});
			assert.equal(Log.error.callCount, 1, "then an error was logged");
		});

		QUnit.test("when 'updateVariantsState' is called to add variant related changes", function(assert) {
			var oStub1 = sandbox.stub();
			var oStub2 = sandbox.stub();
			VariantManagementState.addUpdateStateListener(this.sReference, oStub1);
			VariantManagementState.addUpdateStateListener("reference2", oStub2);
			VariantManagementState.removeUpdateStateListener("reference2", oStub2);

			var oVariantDependentControlChange = {
				getState: function() {return Change.states.NEW;},
				getDefinition: function() {
					return {fileType: "change"};
				},
				convertToFileContent: function() {
					return this.getDefinition();
				}
			};
			VariantManagementState.updateVariantsState({
				reference: this.sReference,
				changeToBeAddedOrDeleted: oVariantDependentControlChange,
				content: {}
			});
			assert.deepEqual(this.oResponse.variantDependentControlChanges[0], oVariantDependentControlChange.getDefinition(), "then the variants related change was added to flex state response");
			assert.strictEqual(oStub1.callCount, 1, "the listener was called");
			assert.strictEqual(oStub2.callCount, 0, "the added and removed listener was not called");

			var oVariant = {
				getState: function() {return Change.states.NEW;},
				getDefinition: function() {
					return {fileType: "ctrl_variant"};
				},
				convertToFileContent: function() {
					return this.getDefinition();
				}
			};
			VariantManagementState.updateVariantsState({
				reference: this.sReference,
				changeToBeAddedOrDeleted: oVariant,
				content: {}
			});
			assert.deepEqual(this.oResponse.variants[0], oVariant.getDefinition(), "then the variants related change was added to flex state response");
			assert.strictEqual(oStub1.callCount, 2, "the listener was called");
			assert.strictEqual(oStub2.callCount, 0, "the added and removed listener was not called");

			var oVariantManagementChange = {
				getState: function() {return Change.states.NEW;},
				getDefinition: function() {
					return {fileType: "ctrl_variant_management_change"};
				},
				convertToFileContent: function() {
					return this.getDefinition();
				}
			};
			VariantManagementState.updateVariantsState({
				reference: this.sReference,
				changeToBeAddedOrDeleted: oVariantManagementChange,
				content: {}
			});
			assert.deepEqual(this.oResponse.variantManagementChanges[0], oVariantManagementChange.getDefinition(), "then the variants related change was added to flex state response");
			assert.strictEqual(oStub1.callCount, 3, "the listener was called");
			assert.strictEqual(oStub2.callCount, 0, "the added and removed listener was not called");

			var oVariantChange = {
				getState: function() {return Change.states.NEW;},
				getDefinition: function() {
					return {fileType: "ctrl_variant_change"};
				},
				convertToFileContent: function() {
					return this.getDefinition();
				}
			};
			VariantManagementState.updateVariantsState({
				reference: this.sReference,
				changeToBeAddedOrDeleted: oVariantChange,
				content: {}
			});
			assert.deepEqual(this.oResponse.variantChanges[0], oVariantChange.getDefinition(), "then the variants related change was added to flex state response");
			assert.strictEqual(oStub1.callCount, 4, "the listener was called");
			assert.strictEqual(oStub2.callCount, 0, "the added and removed listener was not called");

			VariantManagementState.removeUpdateStateListener(this.sReference);
			var oVariantDependentControlChange1 = {
				getState: function() {return Change.states.NEW;},
				getDefinition: function() {
					return {fileType: "change"};
				},
				convertToFileContent: function() {
					return this.getDefinition();
				}
			};
			VariantManagementState.updateVariantsState({
				reference: this.sReference,
				changeToBeAddedOrDeleted: oVariantDependentControlChange1,
				content: {}
			});
			assert.deepEqual(this.oResponse.variantDependentControlChanges[0], oVariantDependentControlChange.getDefinition(), "then the variants related change was added to flex state response");
			assert.strictEqual(oStub1.callCount, 4, "the listener was not called again");
			assert.strictEqual(oStub2.callCount, 0, "the added and removed listener was not called");
		});

		QUnit.test("when 'updateVariantsState' is called to delete variant related changes", function(assert) {
			var oVariantDependentControlChange = {
				getState: function() {return Change.states.DELETE;},
				getDefinition: function() {
					return {
						fileType: "change",
						fileName: "variantDependentControlChange"
					};
				},
				convertToFileContent: function() {
					return this.getDefinition();
				}
			};
			this.oResponse.variantDependentControlChanges.push(oVariantDependentControlChange.getDefinition());
			VariantManagementState.updateVariantsState({
				reference: this.sReference,
				changeToBeAddedOrDeleted: oVariantDependentControlChange,
				content: {}
			});
			assert.equal(this.oResponse.variantDependentControlChanges.length, 0, "then the variants related change was deleted from the flex state response");

			var oVariant = {
				getState: function() {return Change.states.DELETE;},
				getDefinition: function() {
					return {
						fileType: "ctrl_variant",
						fileName: "variant"
					};
				},
				convertToFileContent: function() {
					return this.getDefinition();
				}
			};
			this.oResponse.variants.push(oVariant.getDefinition());
			VariantManagementState.updateVariantsState({
				reference: this.sReference,
				changeToBeAddedOrDeleted: oVariant,
				content: {}
			});
			assert.equal(this.oResponse.variants.length, 0, "then the variants related change was deleted from the flex state response");

			var oVariantManagementChange = {
				getState: function() {return Change.states.DELETE;},
				getDefinition: function() {
					return {
						fileType: "ctrl_variant_management_change",
						fileName: "variantManagementChange"
					};
				},
				convertToFileContent: function() {
					return this.getDefinition();
				}
			};
			this.oResponse.variantManagementChanges.push(oVariantManagementChange.getDefinition());
			VariantManagementState.updateVariantsState({
				reference: this.sReference,
				changeToBeAddedOrDeleted: oVariantManagementChange,
				content: {}
			});
			assert.equal(this.oResponse.variantManagementChanges.length, 0, "then the variants related change was deleted from the flex state response");

			var oVariantChange = {
				getState: function() {return Change.states.DELETE;},
				getDefinition: function() {
					return {
						fileType: "ctrl_variant_change",
						fileName: "variantChange"
					};
				},
				convertToFileContent: function() {
					return this.getDefinition();
				}
			};
			this.oResponse.variantChanges.push(oVariantChange.getDefinition());
			VariantManagementState.updateVariantsState({
				reference: this.sReference,
				changeToBeAddedOrDeleted: oVariantChange,
				content: {}
			});
			assert.equal(this.oResponse.variantChanges.length, 0, "then the variants related change was deleted from the flex state response");
		});
	});

	QUnit.done(function () {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});