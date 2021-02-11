/* global QUnit */

sap.ui.define([
	"sap/ui/fl/apply/_internal/flexState/controlVariants/VariantManagementState",
	"sap/ui/fl/apply/_internal/flexState/controlVariants/prepareVariantsMap",
	"sap/ui/fl/apply/_internal/controlVariants/Utils",
	"sap/base/util/LoaderExtensions",
	"sap/base/util/values",
	"sap/base/util/merge",
	"sap/base/util/includes",
	"sap/ui/core/util/reflection/JsControlTreeModifier",
	"sap/ui/fl/Change",
	"sap/ui/fl/Layer",
	"sap/ui/fl/Variant",
	"sap/ui/fl/apply/_internal/flexState/FlexState",
	"sap/ui/fl/initial/_internal/StorageUtils",
	"sap/base/Log",
	"sap/ui/thirdparty/sinon-4"
], function(
	VariantManagementState,
	prepareVariantsMap,
	VariantUtil,
	LoaderExtensions,
	values,
	merge,
	includes,
	JsControlTreeModifier,
	Change,
	Layer,
	Variant,
	FlexState,
	StorageUtils,
	Log,
	sinon
) {
	"use strict";
	var sandbox = sinon.sandbox.create();
	QUnit.dump.maxDepth = 20;

	function _getInitialChangesForVariant (sVReference, mVariantsMap) {
		return values(mVariantsMap).reduce(function(aChanges, oVMData) {
			oVMData.variants.some(function(oVariant) {
				if (oVariant.content.fileName === sVReference) {
					aChanges = aChanges.concat(oVariant.controlChanges);
					return true;
				}
			});
			return aChanges;
		}, []);
	}

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
					}
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
					_getInitialChangesForVariant(oData[sVMReference].currentVariant || oData[sVMReference].defaultVariant, this.oVariantsMap)
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
					_getInitialChangesForVariant(oData[sVMReference].currentVariant || oData[sVMReference].defaultVariant, this.oVariantsMap)
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
					_getInitialChangesForVariant(oData[sVMReference].currentVariant || oData[sVMReference].defaultVariant, this.oVariantsMap)
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
					_getInitialChangesForVariant(oData[sVMReference].currentVariant || oData[sVMReference].defaultVariant, this.oVariantsMap)
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
					_getInitialChangesForVariant(oData[sVMReference].currentVariant || oData[sVMReference].defaultVariant, this.oVariantsMap)
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
					_getInitialChangesForVariant(oData[sVMReference].currentVariant || oData[sVMReference].defaultVariant, this.oVariantsMap)
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
					_getInitialChangesForVariant(oData[sVMReference].currentVariant || oData[sVMReference].defaultVariant, this.oVariantsMap)
				);
			}.bind(this));
			assert.deepEqual(aResultantInitialChanges, aExpectedInitialChanges, "then correct initial changes were returned");
		});

		QUnit.test("when 'getInitialChanges' is called with a vmReference", function(assert) {
			merge(this.oVariantsMap, prepareVariantsMap(this.mPropertyBag));
			var oGetVariantChangesStub = sandbox.stub(VariantManagementState, "getControlChangesForVariant").returns(["foo"]);

			assert.deepEqual(VariantManagementState.getInitialChanges({
				vmReference: "vmReference1",
				reference: this.sReference,
				changeInstance: true
			}), ["foo"], "the function returns what 'getControlChangesForVariant' returns for that variant");
			assert.equal(oGetVariantChangesStub.callCount, 1, "getControlChangesForVariant was called once");
			var mExpectedParameters = {
				vmReference: "vmReference1",
				reference: this.sReference,
				vReference: "variant0",
				changeInstance: true
			};
			assert.deepEqual(oGetVariantChangesStub.lastCall.args[0], mExpectedParameters, "the correct variant was asked for changes");

			this.oVariantsMap.vmReference1.currentVariant = "variant2";
			mExpectedParameters = {
				vmReference: "vmReference1",
				reference: this.sReference,
				vReference: "variant2",
				changeInstance: false
			};
			VariantManagementState.getInitialChanges({
				vmReference: "vmReference1",
				reference: this.sReference,
				changeInstance: false
			});
			assert.equal(oGetVariantChangesStub.callCount, 2, "getControlChangesForVariant was called once again");
			assert.deepEqual(oGetVariantChangesStub.lastCall.args[0], mExpectedParameters, "the correct variant was asked for changes");
		});

		QUnit.test("when 'setVariantData' is called with a changed title and previous index", function(assert) {
			merge(this.oVariantsMap, prepareVariantsMap(this.mPropertyBag));

			var mAdditionalData = {
				title: "ZZZ"
			};

			var aVariants = this.oVariantsMap["vmReference1"].variants;
			assert.equal(aVariants[1].content.fileName, "variant0", "then before renaming the title variant present at index 1");
			var iSortedIndex = VariantManagementState.setVariantData({variantData: mAdditionalData, vmReference: "vmReference1", previousIndex: 1, reference: this.sReference});
			assert.equal(iSortedIndex, 2, "then the correct sorted index was returned");
			assert.equal(aVariants[2].content.fileName, "variant0", "then the renamed variant was placed at the correct index");
		});

		QUnit.test("when 'setVariantData' is called with a changed title and previous index for standard variant", function(assert) {
			merge(this.oVariantsMap, prepareVariantsMap(this.mPropertyBag));

			var mAdditionalData = {
				title: "ZZZ"
			};

			var aVariants = this.oVariantsMap["vmReference1"].variants;
			assert.equal(aVariants[0].content.fileName, "vmReference1", "then before renaming the title variant present at index 0");
			var iSortedIndex = VariantManagementState.setVariantData({variantData: mAdditionalData, vmReference: "vmReference1", previousIndex: 0, reference: this.sReference});
			assert.equal(iSortedIndex, 0, "then the correct sorted index was returned");
			assert.equal(aVariants[0].content.fileName, "vmReference1", "then the renamed variant was placed at the correct index\"");
		});

		QUnit.test("when 'getVariant' is called", function(assert) {
			merge(this.oVariantsMap, prepareVariantsMap(this.mPropertyBag));
			var oExpectedVariant = this.oVariantsMap["vmReference1"].variants[0];
			var oVariant = VariantManagementState.getVariant({vmReference: "vmReference1", vReference: oExpectedVariant.content.fileName, reference: this.sReference});
			assert.deepEqual(oExpectedVariant, oVariant, "then the correct variant object is returned");
		});

		QUnit.test("when 'getControlChangesForVariant' is called with changeInstance parameter not set", function(assert) {
			merge(this.oVariantsMap, prepareVariantsMap(this.mPropertyBag));

			var aExpectedDefaultVariantChanges = this.oVariantsMap["vmReference2"].variants[1].controlChanges;
			var aExpectedNonDefaultVariantChanges = this.oVariantsMap["vmReference1"].variants[2].controlChanges;
			var aDefaultVariantChanges = VariantManagementState.getControlChangesForVariant({vmReference: "vmReference2", reference: this.sReference});
			var aNonDefaultVariantChanges = VariantManagementState.getControlChangesForVariant({vmReference: "vmReference1", vReference: "variant2", reference: this.sReference});

			assert.deepEqual(aExpectedNonDefaultVariantChanges, aNonDefaultVariantChanges, "then the correct control changes were returned for a non default variant");
			assert.deepEqual(aExpectedDefaultVariantChanges, aDefaultVariantChanges, "then the correct control changes were returned for a default variant");
		});

		QUnit.test("when 'getControlChangesForVariant' is called with changeInstance parameter set", function(assert) {
			merge(this.oVariantsMap, prepareVariantsMap(this.mPropertyBag));

			function checkChangeInstance(oChange) {
				return oChange instanceof Change;
			}

			var bDefaultVariantChangeInstances = VariantManagementState.getControlChangesForVariant({vmReference: "vmReference2", reference: this.sReference, changeInstance: true}).every(checkChangeInstance);
			var bNonDefaultVariantChangeInstances = VariantManagementState.getControlChangesForVariant({vmReference: "vmReference1", vReference: "variant2", reference: this.sReference, changeInstance: true}).every(checkChangeInstance);

			assert.ok(bDefaultVariantChangeInstances, "then all returned control changes were change instances for a non default variant");
			assert.ok(bNonDefaultVariantChangeInstances, "then all returned control changes were change instances for a default variant");
		});

		QUnit.test("when 'getVariantChangesForVariant' is called", function(assert) {
			merge(this.oVariantsMap, prepareVariantsMap(this.mPropertyBag));

			var oVariantChanges1 = VariantManagementState.getVariantChangesForVariant({vmReference: "vmReference1", reference: this.sReference});
			var oVariantChanges2 = VariantManagementState.getVariantChangesForVariant({vmReference: "vmReference1", vReference: "variant2", reference: this.sReference});
			var oVariantChanges3 = VariantManagementState.getVariantChangesForVariant({vmReference: "vmReference1", vReference: "notExisting", reference: this.sReference});

			assert.equal(Object.keys(oVariantChanges1).length, 3, "three kinds of variant changes are returned");
			assert.equal(Object.keys(oVariantChanges2).length, 2, "two kinds of variant changes are returned");
			assert.deepEqual(oVariantChanges3, {}, "an empty object is returned");
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
			assert.equal(aVMReferences.length, 4, "there are 4 references");
			assert.ok(includes(aVMReferences, "vmReference1"));
			assert.ok(includes(aVMReferences, "vmReference2"));
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
				assert.ok(aArguments.indexOf("RTADemoAppMD---detail--GroupElementDatesShippingStatus") > -1, "the first selector was passed");
				assert.ok(aArguments.indexOf("RTADemoAppMD---detail--GroupElementDatesShippingStatus1") > -1, "the second selector was passed");
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
			.then(function(vReturn) {
				assert.equal(vReturn, "foo", "the function returns the return value of waitForChanges");
				assert.equal(oFlexControllerStub.waitForChangesToBeApplied.callCount, 1, "waitForChanges was called once");
				assert.deepEqual(oFlexControllerStub.waitForChangesToBeApplied.lastCall.args[0], [], "no controls were passed");
			});
		});
	});

	QUnit.module("Given changes / variants are required to be added / removed from variant management state", {
		beforeEach: function() {
			this.oVariantsMap = {
				vmReference1: {
					variants: [
						{
							content: {
								fileName: "vmReference1",
								content: {
									title: "Standard"
								}
							},
							variantChanges: {},
							controlChanges: []
						},
						{
							content: {
								fileName: "variant0",
								content: {
									title: "Existing"
								}
							},
							variantChanges: {
								setTitle: [
									{
										id: "testTitleChange"
									}
								]
							},
							controlChanges: [
								{
									fileName: "controlChange1",
									layer: Layer.VENDOR
								}, {
									fileName: "controlChange2",
									layer: Layer.VENDOR
								}, {
									fileName: "controlChange3",
									layer: Layer.CUSTOMER
								}
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
			assert.equal(oTargetVariant.content.fileName, mArguments.changeContent.selector.id, "then it is the target variant");
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
			assert.equal(oTargetVariant.content.fileName, mArguments.changeContent.selector.id, "then it is the target variant");
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
				content: {
					content: {
						title: "AA"
					},
					fileName: "newVariant1"
				},
				controlChanges: [oChangeContent0]
			};

			var oFakeVariantData2 = {
				content: {
					content: {
						title: "ZZ"
					},
					fileName: "newVariant2"
				},
				controlChanges: [oChangeContent1]
			};

			var iIndex1 = VariantManagementState.addVariantToVariantManagement({variantData: oFakeVariantData1, vmReference: this.sVMReference, reference: this.sReference});
			var iIndex2 = VariantManagementState.addVariantToVariantManagement({variantData: oFakeVariantData2, vmReference: this.sVMReference, reference: this.sReference});

			var aVariants = this.oVariantsMap[this.sVMReference].variants;

			assert.equal(aVariants[iIndex1].content.fileName, oFakeVariantData1.content.fileName, "then the first variant was added to the correct index");
			assert.equal(aVariants[iIndex2].content.fileName, oFakeVariantData2.content.fileName, "then the second variant was added to the correct index");
		});

		QUnit.test("when 'addVariantToVariantManagement' is called on CUSTOMER layer and a variant reference from a VENDOR layer variant, with 2 VENDOR and one CUSTOMER change", function(assert) {
			var oChangeContent0 = new Change({fileName: "change0"});
			VariantManagementState.getControlChangesForVariant({vReference: "variant0", vmReference: this.sVMReference, reference: this.sReference, changeInstance: true});

			var oFakeVariantData = {
				content: {
					fileName: "newVariant1",
					variantReference: "variant0",
					layer: Layer.CUSTOMER,
					content: {
						title: "AA"
					}
				},
				controlChanges: [oChangeContent0]
			};

			var iIndex = VariantManagementState.addVariantToVariantManagement({variantData: oFakeVariantData, vmReference: this.sVMReference, reference: this.sReference});
			var aVariants = this.oVariantsMap[this.sVMReference].variants;

			assert.equal(aVariants[iIndex].content.fileName, oFakeVariantData.content.fileName, "then the variant was added to the correct index");

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
			VariantManagementState.getControlChangesForVariant({vReference: "variant0", vmReference: "vmReference1", reference: this.sReference, changeInstance: true});

			var oFakeVariantData = {
				content: {
					fileName: "newVariant1",
					variantReference: "variant0",
					layer: Layer.USER,
					content: {
						title: "AA"
					}
				},
				controlChanges: [oChangeContent0]
			};

			var iIndex = VariantManagementState.addVariantToVariantManagement({variantData: oFakeVariantData, vmReference: "vmReference1", reference: this.sReference});
			var aVariants = this.oVariantsMap["vmReference1"].variants;

			assert.equal(aVariants[iIndex].content.fileName, oFakeVariantData.content.fileName, "then the variant was added to the correct index");

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
			var oVariantToBeRemoved = new Variant(oVariantDataToBeRemoved);

			VariantManagementState.removeVariantFromVariantManagement({variant: oVariantToBeRemoved, vmReference: "vmReference1", reference: this.sReference});

			var aVariants = this.oVariantsMap["vmReference1"].variants;
			var bPresent = aVariants.some(function(oVariant) {
				return oVariant.content.fileName === oVariantDataToBeRemoved.content.fileName;
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
			var oVariantDependentControlChange = {
				getPendingAction: function() {return "NEW";},
				getDefinition: function() {
					return {fileType: "change"};
				}
			};
			VariantManagementState.updateVariantsState({
				reference: this.sReference,
				changeToBeAddedOrDeleted: oVariantDependentControlChange,
				content: {}
			});
			assert.deepEqual(this.oResponse.variantDependentControlChanges[0], oVariantDependentControlChange.getDefinition(), "then the variants related change was added to flex state response");

			var oVariant = {
				getPendingAction: function() {return "NEW";},
				getDefinition: function() {
					return {fileType: "ctrl_variant"};
				}
			};
			VariantManagementState.updateVariantsState({
				reference: this.sReference,
				changeToBeAddedOrDeleted: oVariant,
				content: {}
			});
			assert.deepEqual(this.oResponse.variants[0], oVariant.getDefinition(), "then the variants related change was added to flex state response");

			var oVariantManagementChange = {
				getPendingAction: function() {return "NEW";},
				getDefinition: function() {
					return {fileType: "ctrl_variant_management_change"};
				}
			};
			VariantManagementState.updateVariantsState({
				reference: this.sReference,
				changeToBeAddedOrDeleted: oVariantManagementChange,
				content: {}
			});
			assert.deepEqual(this.oResponse.variantManagementChanges[0], oVariantManagementChange.getDefinition(), "then the variants related change was added to flex state response");

			var oVariantChange = {
				getPendingAction: function() {return "NEW";},
				getDefinition: function() {
					return {fileType: "ctrl_variant_change"};
				}
			};
			VariantManagementState.updateVariantsState({
				reference: this.sReference,
				changeToBeAddedOrDeleted: oVariantChange,
				content: {}
			});
			assert.deepEqual(this.oResponse.variantChanges[0], oVariantChange.getDefinition(), "then the variants related change was added to flex state response");
		});

		QUnit.test("when 'updateVariantsState' is called to delete variant related changes", function(assert) {
			var oVariantDependentControlChange = {
				getPendingAction: function() {return "DELETE";},
				getDefinition: function() {
					return {
						fileType: "change",
						fileName: "variantDependentControlChange"
					};
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
				getPendingAction: function() {return "DELETE";},
				getDefinition: function() {
					return {
						fileType: "ctrl_variant",
						fileName: "variant"
					};
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
				getPendingAction: function() {return "DELETE";},
				getDefinition: function() {
					return {
						fileType: "ctrl_variant_management_change",
						fileName: "variantManagementChange"
					};
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
				getPendingAction: function() {return "DELETE";},
				getDefinition: function() {
					return {
						fileType: "ctrl_variant_change",
						fileName: "variantChange"
					};
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
		jQuery("#qunit-fixture").hide();
	});
});