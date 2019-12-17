/* global QUnit */

sap.ui.define([
	"sap/ui/fl/apply/_internal/flexState/controlVariants/VariantManagementState",
	"sap/ui/fl/apply/_internal/flexState/prepareVariantsMap",
	"sap/ui/fl/apply/_internal/controlVariants/Utils",
	"sap/base/util/LoaderExtensions",
	"sap/base/util/values",
	"sap/base/util/merge",
	"sap/ui/fl/Change",
	"sap/ui/fl/Variant",
	"sap/ui/core/Component",
	"sap/ui/thirdparty/sinon-4"
], function (
	VariantManagementState,
	prepareVariantsMap,
	VariantUtil,
	LoaderExtensions,
	values,
	merge,
	Change,
	Variant,
	Component,
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
				this.oComponentDataStub = sandbox.stub();
				this.mPropertyBag = {
					storageResponse: this.oBackendResponse,
					componentId: this.sComponentId
				};
				this.oVariantsMap = {};

				sandbox.stub(Component, "get")
					.callThrough()
					.withArgs(this.sComponentId)
					.returns({getComponentData: this.oComponentDataStub});
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
		QUnit.test("when 'fillVariantModel' and then 'loadInitialChanges' are called with parameters containing no technical parameters", function(assert) {
			merge(this.oVariantsMap, prepareVariantsMap(this.mPropertyBag));

			var oData = VariantManagementState.fillVariantModel({reference: this.sReference});

			assert.deepEqual(oData, this.oVariantModelData, "then correct variant model data is returned");

			var aResultantInitialChanges = VariantManagementState.loadInitialChanges({reference: this.sReference});
			var aExpectedInitialChanges = [];
			Object.keys(oData).forEach(function(sVMReference) {
				aExpectedInitialChanges = aExpectedInitialChanges.concat(
					_getInitialChangesForVariant(oData[sVMReference].currentVariant || oData[sVMReference].defaultVariant, this.oVariantsMap)
				);
			}.bind(this));
			assert.deepEqual(aResultantInitialChanges, aExpectedInitialChanges, "then correct initial changes were returned");
		});

		QUnit.test("when 'fillVariantModel' and then 'loadInitialChanges' are called with parameters containing technical parameters for multiple variant management references", function(assert) {
			var oTechnicalParameters = {};
			oTechnicalParameters[VariantUtil.VARIANT_TECHNICAL_PARAMETER] = ["vmReference1", "variant11"];
			this.oComponentDataStub.returns({technicalParameters: oTechnicalParameters});

			merge(this.oVariantsMap, prepareVariantsMap(this.mPropertyBag));

			var oData = VariantManagementState.fillVariantModel({reference: this.sReference});
			this.oVariantModelData["vmReference1"].currentVariant = "vmReference1";
			this.oVariantModelData["vmReference2"].currentVariant = "variant11";

			assert.deepEqual(oData, this.oVariantModelData, "then correct variant model data is returned");

			var aResultantInitialChanges = VariantManagementState.loadInitialChanges({reference: this.sReference});
			var aExpectedInitialChanges = [];
			Object.keys(oData).forEach(function(sVMReference) {
				aExpectedInitialChanges = aExpectedInitialChanges.concat(
					_getInitialChangesForVariant(oData[sVMReference].currentVariant || oData[sVMReference].defaultVariant, this.oVariantsMap)
				);
			}.bind(this));
			assert.deepEqual(aResultantInitialChanges, aExpectedInitialChanges, "then correct initial changes were returned");
		});

		QUnit.test("when 'fillVariantModel' and then 'loadInitialChanges' are called with parameters containing technical parameters for a single variant management reference", function(assert) {
			var oTechnicalParameters = {};
			oTechnicalParameters[VariantUtil.VARIANT_TECHNICAL_PARAMETER] = ["vmReference1"];
			this.oComponentDataStub.returns({technicalParameters: oTechnicalParameters});

			merge(this.oVariantsMap, prepareVariantsMap(this.mPropertyBag));

			var oData = VariantManagementState.fillVariantModel({reference: this.sReference});
			this.oVariantModelData["vmReference1"].currentVariant = "vmReference1";

			assert.deepEqual(oData, this.oVariantModelData, "then correct variant model data is returned");

			var aResultantInitialChanges = VariantManagementState.loadInitialChanges({reference: this.sReference});
			var aExpectedInitialChanges = [];
			Object.keys(oData).forEach(function(sVMReference) {
				aExpectedInitialChanges = aExpectedInitialChanges.concat(
					_getInitialChangesForVariant(oData[sVMReference].currentVariant || oData[sVMReference].defaultVariant, this.oVariantsMap)
				);
			}.bind(this));
			assert.deepEqual(aResultantInitialChanges, aExpectedInitialChanges, "then correct initial changes were returned");
		});

		QUnit.test("when 'fillVariantModel' and then 'loadInitialChanges' are called with parameters containing multiple technical parameters for a single variant management reference", function(assert) {
			var oTechnicalParameters = {};
			oTechnicalParameters[VariantUtil.VARIANT_TECHNICAL_PARAMETER] = ["vmReference2", "variant11"];
			this.oComponentDataStub.returns({technicalParameters: oTechnicalParameters});

			merge(this.oVariantsMap, prepareVariantsMap(this.mPropertyBag));

			var oData = VariantManagementState.fillVariantModel({reference: this.sReference});
			this.oVariantModelData["vmReference2"].currentVariant = "variant11";

			assert.deepEqual(oData, this.oVariantModelData, "then correct variant model data is returned");

			var aResultantInitialChanges = VariantManagementState.loadInitialChanges({reference: this.sReference});
			var aExpectedInitialChanges = [];
			Object.keys(oData).forEach(function(sVMReference) {
				aExpectedInitialChanges = aExpectedInitialChanges.concat(
					_getInitialChangesForVariant(oData[sVMReference].currentVariant || oData[sVMReference].defaultVariant, this.oVariantsMap)
				);
			}.bind(this));
			assert.deepEqual(aResultantInitialChanges, aExpectedInitialChanges, "then correct initial changes were returned");
		});

		QUnit.test("when 'fillVariantModel' and then 'loadInitialChanges' are called with parameters containing valid and invalid technical parameters", function(assert) {
			var oTechnicalParameters = {};
			oTechnicalParameters[VariantUtil.VARIANT_TECHNICAL_PARAMETER] = ["nonExistenceVariantManagement", "vmReference1"];
			this.oComponentDataStub.returns({technicalParameters: oTechnicalParameters});

			merge(this.oVariantsMap, prepareVariantsMap(this.mPropertyBag));

			var oData = VariantManagementState.fillVariantModel({reference: this.sReference});
			this.oVariantModelData["vmReference1"].currentVariant = "vmReference1";

			assert.deepEqual(oData, this.oVariantModelData, "then correct variant model data is returned");

			var aResultantInitialChanges = VariantManagementState.loadInitialChanges({reference: this.sReference});
			var aExpectedInitialChanges = [];
			Object.keys(oData).forEach(function(sVMReference) {
				aExpectedInitialChanges = aExpectedInitialChanges.concat(
					_getInitialChangesForVariant(oData[sVMReference].currentVariant || oData[sVMReference].defaultVariant, this.oVariantsMap)
				);
			}.bind(this));
			assert.deepEqual(aResultantInitialChanges, aExpectedInitialChanges, "then correct initial changes were returned");
		});

		QUnit.test("when 'fillVariantModel' and then 'loadInitialChanges' are called with parameters containing technical parameters for an invalid variant management reference", function(assert) {
			var oTechnicalParameters = {};
			oTechnicalParameters[VariantUtil.VARIANT_TECHNICAL_PARAMETER] = ["variant2"];
			this.oComponentDataStub.returns({technicalParameters: oTechnicalParameters});

			merge(this.oVariantsMap, prepareVariantsMap(this.mPropertyBag));

			var oData = VariantManagementState.fillVariantModel({reference: this.sReference});

			assert.deepEqual(oData, this.oVariantModelData, "then correct variant model data is returned");

			var aResultantInitialChanges = VariantManagementState.loadInitialChanges({reference: this.sReference});
			var aExpectedInitialChanges = [];
			Object.keys(oData).forEach(function(sVMReference) {
				aExpectedInitialChanges = aExpectedInitialChanges.concat(
					_getInitialChangesForVariant(oData[sVMReference].currentVariant || oData[sVMReference].defaultVariant, this.oVariantsMap)
				);
			}.bind(this));
			assert.deepEqual(aResultantInitialChanges, aExpectedInitialChanges, "then correct initial changes were returned");
		});

		QUnit.test("when 'fillVariantModel' and then 'loadInitialChanges' are called with parameters containing an invisible default variant", function(assert) {
			merge(this.oVariantsMap, prepareVariantsMap(this.mPropertyBag));

			var oData = VariantManagementState.fillVariantModel({reference: this.sReference});

			assert.deepEqual(oData, this.oVariantModelData, "then correct variant model data is returned");

			var aResultantInitialChanges = VariantManagementState.loadInitialChanges({reference: this.sReference});
			var aExpectedInitialChanges = [];
			Object.keys(oData).forEach(function(sVMReference) {
				aExpectedInitialChanges = aExpectedInitialChanges.concat(
					_getInitialChangesForVariant(oData[sVMReference].currentVariant || oData[sVMReference].defaultVariant, this.oVariantsMap)
				);
			}.bind(this));
			assert.deepEqual(aResultantInitialChanges, aExpectedInitialChanges, "then correct initial changes were returned");
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

		QUnit.test("when 'getVariantChanges' is called  with changeInstance parameter not set", function(assert) {
			merge(this.oVariantsMap, prepareVariantsMap(this.mPropertyBag));

			var aExpectedDefaultVariantChanges = this.oVariantsMap["vmReference2"].variants[1].controlChanges;
			var aExpectedNonDefaultVariantChanges = this.oVariantsMap["vmReference1"].variants[2].controlChanges;
			var aDefaultVariantChanges = VariantManagementState.getVariantChanges({vmReference: "vmReference2", reference: this.sReference});
			var aNonDefaultVariantChanges = VariantManagementState.getVariantChanges({vmReference: "vmReference1", vReference: "variant2", reference: this.sReference});

			assert.deepEqual(aExpectedNonDefaultVariantChanges, aNonDefaultVariantChanges, "then the correct control changes were returned for a non default variant");
			assert.deepEqual(aExpectedDefaultVariantChanges, aDefaultVariantChanges, "then the correct control changes were returned for a default variant");
		});

		QUnit.test("when 'getVariantChanges' is called with changeInstance parameter set", function(assert) {
			merge(this.oVariantsMap, prepareVariantsMap(this.mPropertyBag));

			function checkChangeInstance(oChange) {
				return oChange instanceof Change;
			}

			var bDefaultVariantChangeInstances = VariantManagementState.getVariantChanges({vmReference: "vmReference2", reference: this.sReference, changeInstance: true}).every(checkChangeInstance);
			var bNonDefaultVariantChangeInstances = VariantManagementState.getVariantChanges({vmReference: "vmReference1", vReference: "variant2", reference: this.sReference, changeInstance: true}).every(checkChangeInstance);

			assert.ok(bDefaultVariantChangeInstances, "then all returned control changes were change instances for a non default variant");
			assert.ok(bNonDefaultVariantChangeInstances, "then all returned control changes were change instances for a default variant");
		});

		QUnit.test("when 'setCurrentVariant'  is called", function(assert) {
			merge(this.oVariantsMap, prepareVariantsMap(this.mPropertyBag));
			assert.notOk(this.oVariantsMap["vmReference1"].currentVariant, "then previously the current variant is not set");
			VariantManagementState.setCurrentVariant({vmReference: "vmReference1", newVReference: "variant2", reference: this.sReference});
			assert.strictEqual(this.oVariantsMap["vmReference1"].currentVariant, "variant2", "then current variant is set correctly");
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
									layer: "VENDOR"
								}, {
									fileName: "controlChange2",
									layer: "VENDOR"
								}, {
									fileName: "controlChange3",
									layer: "CUSTOMER"
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

			var aChanges = VariantManagementState.getVariantChanges({vmReference: this.sVMReference, vReference: "variant0", reference: this.sReference});
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

			var aChanges = VariantManagementState.getVariantChanges({vmReference: this.sVMReference, vReference: "variant0", reference: this.sReference});
			assert.equal(aChanges.length, 2, "then the number of changes in the variant is correct");
			assert.notEqual(aChanges[0].getId(), oChangeToBeRemoved1.getId(), "then the removed change does not exist");
			assert.notEqual(aChanges[1].getId(), oChangeToBeRemoved1.getId(), "then the removed change does not exist");
		});

		QUnit.test("when 'addVariantToVariantManagement' is called with a new variant and no variant reference", function(assert) {
			var oChangeContent0 = {fileName:"change0"};
			var oChangeContent1 = {fileName:"change1"};

			var oFakeVariantData1 = {
				content : {
					content: {
						title: "AA"
					},
					fileName: "newVariant1"
				},
				controlChanges : [oChangeContent0]
			};

			var oFakeVariantData2 = {
				content : {
					content: {
						title: "ZZ"
					},
					fileName: "newVariant2"
				},
				controlChanges : [oChangeContent1]
			};

			var iIndex1 = VariantManagementState.addVariantToVariantManagement({variantData: oFakeVariantData1, vmReference: this.sVMReference, reference: this.sReference});
			var iIndex2 = VariantManagementState.addVariantToVariantManagement({variantData: oFakeVariantData2, vmReference: this.sVMReference, reference: this.sReference});

			var aVariants = this.oVariantsMap[this.sVMReference].variants;

			assert.equal(aVariants[iIndex1].content.fileName, oFakeVariantData1.content.fileName, "then the first variant was added to the correct index");
			assert.equal(aVariants[iIndex2].content.fileName, oFakeVariantData2.content.fileName, "then the second variant was added to the correct index");
		});

		QUnit.test("when 'addVariantToVariantManagement' is called on CUSTOMER layer and a variant reference from a VENDOR layer variant, with 2 VENDOR and one CUSTOMER change", function(assert) {
			var oChangeContent0 = new Change({fileName:"change0"});
			VariantManagementState.getVariantChanges({vReference: "variant0", vmReference: this.sVMReference, reference: this.sReference, changeInstance: true});

			var oFakeVariantData = {
				content : {
					fileName: "newVariant1",
					variantReference: "variant0",
					layer: "CUSTOMER",
					content: {
						title: "AA"
					}
				},
				controlChanges : [oChangeContent0]
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
			var oChangeContent0 = new Change({fileName:"change0"});
			VariantManagementState.getVariantChanges({vReference: "variant0", vmReference: "vmReference1", reference: this.sReference, changeInstance: true});

			var oFakeVariantData = {
				content : {
					fileName: "newVariant1",
					variantReference: "variant0",
					layer: "USER",
					content: {
						title: "AA"
					}
				},
				controlChanges : [oChangeContent0]
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

	QUnit.done(function () {
		jQuery("#qunit-fixture").hide();
	});
});