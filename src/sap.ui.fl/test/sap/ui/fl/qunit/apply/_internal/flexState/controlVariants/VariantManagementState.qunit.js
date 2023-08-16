/* global QUnit */

sap.ui.define([
	"rta/qunit/RtaQunitUtils",
	"sap/base/util/isEmptyObject",
	"sap/base/util/merge",
	"sap/ui/core/util/reflection/JsControlTreeModifier",
	"sap/ui/fl/apply/_internal/controlVariants/Utils",
	"sap/ui/fl/apply/_internal/flexObjects/FlexObjectFactory",
	"sap/ui/fl/apply/_internal/flexObjects/States",
	"sap/ui/fl/apply/_internal/flexState/controlVariants/VariantManagementState",
	"sap/ui/fl/apply/_internal/flexState/FlexState",
	"sap/ui/fl/apply/_internal/flexState/InitialPrepareFunctions",
	"sap/ui/fl/apply/_internal/flexState/Loader",
	"sap/ui/fl/Layer",
	"sap/ui/thirdparty/sinon-4"
], function(
	RtaQunitUtils,
	isEmptyObject,
	merge,
	JsControlTreeModifier,
	VariantUtil,
	FlexObjectFactory,
	States,
	VariantManagementState,
	FlexState,
	InitialPrepareFunctions,
	Loader,
	Layer,
	sinon
) {
	"use strict";
	var sandbox = sinon.createSandbox();

	var sReference = "flexReference";
	var sComponentId = "componentId";
	var sVariantManagementReference = "vmReference";
	var sStandardVariantReference = "vmReference";
	var oComponent = RtaQunitUtils.createAndStubAppComponent(sandbox, sComponentId);

	function createVariant(mVariantProperties) {
		return FlexObjectFactory.createFlVariant({
			variantName: mVariantProperties.title || "Test variant",
			id: mVariantProperties.fileName || "testVariant",
			reference: mVariantProperties.reference || sReference,
			layer: mVariantProperties.layer || Layer.CUSTOMER,
			user: mVariantProperties.author || "SAP",
			variantReference: mVariantProperties.variantReference,
			variantManagementReference: mVariantProperties.variantManagementReference || sVariantManagementReference,
			favorite: mVariantProperties.favorite,
			visible: mVariantProperties.visible,
			executeOnSelection: mVariantProperties.executeOnSelect,
			contexts: mVariantProperties.contexts
		});
	}

	function initializeFlexStateWithStandardVariant() {
		return FlexState.initialize({
			componentId: sComponentId,
			reference: sReference
		}).then(function() {
			var oStandardVariant = createVariant({
				fileName: sStandardVariantReference
			});
			VariantManagementState.addRuntimeSteadyObject(
				sReference,
				sComponentId,
				oStandardVariant
			);
			return oStandardVariant;
		});
	}

	function stubFlexObjectsSelector(aFlexObjects) {
		var oFlexObjectsSelector = FlexState.getFlexObjectsDataSelector();
		var oGetFlexObjectsStub = sandbox.stub(oFlexObjectsSelector, "get");
		oGetFlexObjectsStub.callsFake(function(...aArgs) {
			return aFlexObjects.concat(oGetFlexObjectsStub.wrappedMethod.apply(this, aArgs));
		});
		oFlexObjectsSelector.checkUpdate();
	}

	function cleanup() {
		FlexState.clearState();
		FlexState.clearRuntimeSteadyObjects(sReference, sComponentId);
		// TODO: Check if this is an issue in prod
		VariantManagementState.getVariantManagementMap().clearCachedResult();
		VariantManagementState.resetCurrentVariantReferences();
		sandbox.restore();
	}

	QUnit.module("VariantsMapSelector", {
		beforeEach() {
			return initializeFlexStateWithStandardVariant().then(function(oStandardVariant) {
				this.oStandardVariant = oStandardVariant;
			}.bind(this));
		},
		afterEach() {
			cleanup();
		}
	}, function() {
		QUnit.test("when there are existing flex objects (including a CompVariant)", function(assert) {
			var oUIChange = FlexObjectFactory.createUIChange({
				id: "someUIChange",
				layer: Layer.CUSTOMER,
				variantReference: sStandardVariantReference
			});
			var oCompVariant = FlexObjectFactory.createCompVariant({
				id: "someCompVariant",
				layer: Layer.CUSTOMER
			});
			stubFlexObjectsSelector([oUIChange, oCompVariant]);

			assert.deepEqual(
				VariantManagementState.getVariantManagementMap().get({ reference: sReference }),
				{
					vmReference: {
						currentVariant: "vmReference",
						defaultVariant: "vmReference",
						modified: true,
						variantManagementChanges: [],
						variants: [
							{
								author: "SAP",
								contexts: {},
								controlChanges: [oUIChange],
								executeOnSelect: false,
								favorite: true,
								instance: this.oStandardVariant,
								isStandardVariant: true,
								key: "vmReference",
								layer: "CUSTOMER",
								title: "Test variant",
								variantChanges: [],
								visible: true
							}
						]
					}
				},
				"then the variants map is properly built"
			);
		});

		QUnit.test("when there are variant changes", function(assert) {
			var aVariantChanges = [
				FlexObjectFactory.createUIChange({
					id: "setTitleChange",
					layer: Layer.CUSTOMER,
					changeType: "setTitle",
					fileType: "ctrl_variant_change",
					selector: {
						id: sStandardVariantReference
					},
					texts: {
						title: { value: "Renamed variant" }
					}
				}),
				FlexObjectFactory.createUIChange({
					id: "setFavoriteChange",
					layer: Layer.CUSTOMER,
					changeType: "setFavorite",
					fileType: "ctrl_variant_change",
					selector: {
						id: sStandardVariantReference
					},
					content: {
						favorite: false
					}
				}),
				FlexObjectFactory.createUIChange({
					id: "setExecuteOnSelectChange",
					layer: Layer.CUSTOMER,
					changeType: "setExecuteOnSelect",
					fileType: "ctrl_variant_change",
					selector: {
						id: sStandardVariantReference
					},
					content: {
						executeOnSelect: true
					}
				}),
				FlexObjectFactory.createUIChange({
					id: "setContextsChange",
					layer: Layer.CUSTOMER,
					changeType: "setContexts",
					fileType: "ctrl_variant_change",
					selector: {
						id: sStandardVariantReference
					},
					content: {
						contexts: { role: ["ADMIN"], country: ["DE"] }
					}
				})
			];
			stubFlexObjectsSelector(aVariantChanges);

			assert.deepEqual(
				VariantManagementState.getVariantManagementMap().get({ reference: sReference }),
				{
					vmReference: {
						currentVariant: "vmReference",
						defaultVariant: "vmReference",
						modified: false,
						variantManagementChanges: [],
						variants: [
							{
								author: "SAP",
								contexts: { role: ["ADMIN"], country: ["DE"] },
								controlChanges: [],
								executeOnSelect: true,
								favorite: false,
								instance: this.oStandardVariant,
								isStandardVariant: true,
								key: "vmReference",
								layer: "CUSTOMER",
								title: "Renamed variant",
								variantChanges: aVariantChanges,
								visible: true
							}
						]
					}
				},
				"then the variant changes are applied on the variant map"
			);
			assert.strictEqual(
				VariantManagementState.getVariantDependentFlexObjects({reference: sReference}).length, 4,
				"all changes are returned"
			);
		});

		QUnit.test("when there are variant management changes", function(assert) {
			var oVariantManagementChange = FlexObjectFactory.createUIChange({
				id: "setDefaultVariantChange",
				layer: Layer.CUSTOMER,
				changeType: "setDefault",
				fileType: "ctrl_variant_management_change",
				selector: {
					id: sVariantManagementReference
				},
				content: {
					defaultVariant: "customVariant"
				}
			});
			stubFlexObjectsSelector([
				createVariant({
					variantReference: sVariantManagementReference,
					fileName: "customVariant"
				}),
				oVariantManagementChange
			]);

			var oVMData = VariantManagementState.getVariantManagementMap().get({ reference: sReference })[sVariantManagementReference];
			assert.strictEqual(
				oVMData.currentVariant,
				"customVariant",
				"then the change is applied and the current variant is changed"
			);
			assert.strictEqual(
				oVMData.defaultVariant,
				"customVariant",
				"then the change is applied and the default variant is changed"
			);
			assert.strictEqual(
				oVMData.variantManagementChanges[0],
				oVariantManagementChange,
				"then the change is returned as part of the variant management map"
			);
			assert.strictEqual(
				VariantManagementState.getVariantDependentFlexObjects({reference: sReference}).length, 2,
				"all changes are returned"
			);
		});

		QUnit.test("when there is an invalid variant change", function(assert) {
			stubFlexObjectsSelector([
				FlexObjectFactory.createUIChange({
					id: "changeWithSomeInvalidChangeType",
					layer: Layer.CUSTOMER,
					changeType: "someInvalidChangeType",
					fileType: "ctrl_variant_change",
					selector: {
						id: sStandardVariantReference
					}
				})
			]);
			assert.throws(
				function() {
					VariantManagementState.getVariantManagementMap().get({ reference: sReference });
				},
				"then an error is thrown by the selector execute function"
			);
		});

		QUnit.test("when there are no flex objects", function(assert) {
			var oFlexObjectsSelector = FlexState.getFlexObjectsDataSelector();
			sandbox.stub(oFlexObjectsSelector, "get").returns([]);
			oFlexObjectsSelector.checkUpdate();
			assert.ok(
				isEmptyObject(VariantManagementState.getVariantManagementMap().get({ reference: sReference })),
				"then an empty map is returned"
			);
		});

		QUnit.test("when multiple variants are returned", function(assert) {
			stubFlexObjectsSelector([
				createVariant({
					variantReference: sVariantManagementReference,
					fileName: "XYZ"
				}),
				FlexObjectFactory.createUIChange({
					id: "setTitleChange",
					layer: Layer.CUSTOMER,
					changeType: "setTitle",
					fileType: "ctrl_variant_change",
					selector: {
						id: "XYZ"
					},
					texts: {
						title: { value: "XYZ" }
					}
				}),
				createVariant({
					variantReference: sVariantManagementReference,
					fileName: "abc"
				}),
				FlexObjectFactory.createUIChange({
					id: "setTitleChange",
					layer: Layer.CUSTOMER,
					changeType: "setTitle",
					fileType: "ctrl_variant_change",
					selector: {
						id: "abc"
					},
					texts: {
						title: { value: "abc" }
					}
				}),
				createVariant({
					variantReference: sVariantManagementReference,
					fileName: "DEF"
				}),
				FlexObjectFactory.createUIChange({
					id: "setTitleChange",
					layer: Layer.CUSTOMER,
					changeType: "setTitle",
					fileType: "ctrl_variant_change",
					selector: {
						id: "DEF"
					},
					texts: {
						title: { value: "DEF" }
					}
				})
			]);

			var aVariants = VariantManagementState.getVariantManagementMap()
			.get({ reference: sReference })[sVariantManagementReference].variants;
			assert.strictEqual(
				aVariants[0].key,
				sVariantManagementReference,
				"then the standard variant is returned first"
			);
			assert.deepEqual(
				aVariants.map(function(mVariantData) {
					return mVariantData.key;
				}),
				[sVariantManagementReference, "abc", "DEF", "XYZ"],
				"then all other variants are sorted alphabetically"
			);
		});

		QUnit.test("when the variant management only contains changes that are persisted or saved to the variant", function(assert) {
			var oPersistedUIChange = FlexObjectFactory.createUIChange({
				id: "someUIChange",
				layer: Layer.CUSTOMER,
				variantReference: sStandardVariantReference
			});
			oPersistedUIChange.setState(States.LifecycleState.PERSISTED);

			var oChangeSavedToVariant = FlexObjectFactory.createUIChange({
				id: "someOtherUIChange",
				layer: Layer.CUSTOMER,
				variantReference: sStandardVariantReference
			});
			oChangeSavedToVariant.setSavedToVariant(true);

			stubFlexObjectsSelector([oPersistedUIChange, oChangeSavedToVariant]);
			var oVariantsMap = VariantManagementState.getVariantManagementMap().get({ reference: sReference });
			assert.notOk(
				oVariantsMap[sVariantManagementReference].modified,
				"then it is not marked as modified"
			);
		});

		QUnit.test("when there are multiple variants with lower layer changes in the referenced variant", function(assert) {
			var oUIChange = FlexObjectFactory.createUIChange({
				id: "someUIChange",
				layer: Layer.CUSTOMER,
				variantReference: sStandardVariantReference
			});
			var oIndependentUIChange = FlexObjectFactory.createUIChange({
				id: "someOtherUIChange",
				layer: Layer.CUSTOMER
			});
			var oUIChange2 = FlexObjectFactory.createUIChange({
				id: "someOtherOtherUIChange",
				layer: Layer.USER,
				variantReference: sStandardVariantReference
			});
			var oVariant = createVariant({
				variantReference: sVariantManagementReference,
				fileName: "XYZ",
				layer: Layer.USER
			});
			stubFlexObjectsSelector([oIndependentUIChange, oUIChange, oUIChange2, oVariant]);
			var aVariants = VariantManagementState.getVariantManagementMap()
			.get({ reference: sReference })[sVariantManagementReference].variants;
			assert.strictEqual(aVariants[0].controlChanges.length, 2, "there is one control change on standard");
			assert.strictEqual(aVariants[1].controlChanges.length, 1, "the referenced control change is also in the depending variant");
		});
	});

	function toFileContent(aFlexObjects) {
		return aFlexObjects.map(function(oFlexObject) {
			return oFlexObject.convertToFileContent();
		});
	}

	QUnit.module("Fake standard variant", {
		afterEach() {
			cleanup();
		}
	}, function() {
		[{
			flexObjects: {
				variants: [
					createVariant({
						variantReference: sVariantManagementReference,
						fileName: "customVariant"
					})
				]
			},
			testName: "a custom variant",
			expectedVMReferences: [sVariantManagementReference],
			expectedVariantsCount: 2
		},
		{
			flexObjects: {
				variants: [
					createVariant({
						variantReference: "someDeletedVariant",
						fileName: "customVariant",
						layer: Layer.USER
					})
				],
				variantDependentControlChanges: [
					FlexObjectFactory.createUIChange({
						id: "someUIChange",
						layer: Layer.CUSTOMER,
						variantReference: sVariantManagementReference
					})
				]
			},
			testName: "a custom variant based on a deleted variant",
			expectedVMReferences: [sVariantManagementReference],
			expectedVariantsCount: 2,
			customAssertions: [
				function(assert) {
					var oVariantsMap = VariantManagementState.getVariantManagementMap().get({ reference: sReference });
					assert.strictEqual(
						oVariantsMap[sVariantManagementReference].variants[1].instance.getVariantReference(),
						sVariantManagementReference,
						"then the variant reference of the custom variant is changed to the standard variant"
					);
					assert.strictEqual(
						oVariantsMap[sVariantManagementReference].variants[0].controlChanges.length,
						1,
						"then lower layer changes from the standard variant are referenced"
					);
				}
			]
		},
		{
			flexObjects: {
				variants: [
					createVariant({
						variantReference: sVariantManagementReference,
						fileName: "customVariant"
					}),
					createVariant({
						variantManagementReference: "secondVariant",
						fileName: "customVariant2"
					})
				]
			},
			testName: "multiple custom variants for different vm controls",
			expectedVMReferences: [sVariantManagementReference, "secondVariant"],
			expectedVariantsCount: 2
		},
		{
			flexObjects: {
				variantDependentControlChanges: [
					FlexObjectFactory.createUIChange({
						variantReference: sVariantManagementReference,
						id: "someUIChange"
					})
				]
			},
			testName: "a UI change on the standard variant (legacy)",
			expectedVMReferences: [sVariantManagementReference],
			expectedVariantsCount: 1
		},
		{
			flexObjects: {
				variantDependentControlChanges: [
					FlexObjectFactory.createUIChange({
						variantReference: "id_1000000000000_123_flVariant",
						id: "someUIChange"
					})
				]
			},
			testName: "a UI change on a deleted non-standard variant (legacy)",
			expectedVMReferences: [],
			expectedVariantsCount: 0
		},
		{
			flexObjects: {
				variantDependentControlChanges: [
					FlexObjectFactory.createUIChange({
						variantReference: sVariantManagementReference,
						id: "someUIChange",
						isChangeOnStandardVariant: true
					})
				]
			},
			testName: "a UI change on the standard variant",
			expectedVMReferences: [sVariantManagementReference],
			expectedVariantsCount: 1
		},
		{
			flexObjects: {
				variantDependentControlChanges: [
					FlexObjectFactory.createUIChange({
						variantReference: sVariantManagementReference,
						id: "someUIChange",
						isChangeOnStandardVariant: false
					})
				]
			},
			testName: "a UI change on a deleted non-standard variant",
			expectedVMReferences: [],
			expectedVariantsCount: 0
		},
		{
			flexObjects: {
				variantChanges: [
					FlexObjectFactory.createUIChange({
						variantReference: sVariantManagementReference,
						id: "someVariantChange",
						fileType: "ctrl_variant_change",
						changeType: "setTitle",
						selector: { id: sStandardVariantReference}
					})
				]
			},
			testName: "a variant change (e.g. setTitle)",
			expectedVMReferences: [],
			expectedVariantsCount: 0
		}].forEach(function(oTestInput) {
			var sName = `when the storageResponse contains ${oTestInput.testName}`;
			QUnit.test(sName, function(assert) {
				var oInitialPrepareSpy = sandbox.spy(InitialPrepareFunctions, "variants");

				var oLoaderStub = sandbox.stub(Loader, "loadFlexData");
				function fakeLoadFlexData(...aArgs) {
					return oLoaderStub.wrappedMethod.apply(this, aArgs)
					// eslint-disable-next-line max-nested-callbacks
					.then(function(oOriginalResponse) {
						var oResponseAddition = { changes: {} };
						// eslint-disable-next-line max-nested-callbacks
						Object.keys(oTestInput.flexObjects).forEach(function(sResponseKey) {
							oResponseAddition.changes[sResponseKey] = toFileContent(oTestInput.flexObjects[sResponseKey]);
						});
						return merge(
							oOriginalResponse,
							oResponseAddition
						);
					});
				}
				oLoaderStub.callsFake(fakeLoadFlexData);

				return FlexState.initialize({
					componentId: sComponentId,
					reference: sReference
				})
				// eslint-disable-next-line max-nested-callbacks
				.then(function() {
					var oVariantsMap = VariantManagementState.getVariantManagementMap().get({ reference: sReference });
					assert.ok(oInitialPrepareSpy.calledOnce, "then the initial prepare function is called");
					var aVMRs = oTestInput.expectedVMReferences || [sVariantManagementReference];
					assert.strictEqual(
						Object.keys(oVariantsMap).length,
						aVMRs.length,
						"then the proper amount of variant management instances is created"
					);
					// eslint-disable-next-line max-nested-callbacks
					aVMRs.forEach(function(sVMR) {
						assert.strictEqual(
							oVariantsMap[sVMR].variants[0].key,
							sVMR,
							"then the standard variant is automatically added based on the existing variant"
						);
						assert.strictEqual(
							oVariantsMap[sVMR].variants.length,
							oTestInput.expectedVariantsCount,
							"then the correct amount of variants is created"
						);
					});
					// eslint-disable-next-line max-nested-callbacks
					(oTestInput.customAssertions || []).forEach(function(fnAssertion) {
						fnAssertion(assert);
					});
				});
			});
		});

		QUnit.test("when a fake standard variant is added", function(assert) {
			return FlexState.initialize({
				componentId: sComponentId,
				reference: sReference
			})
			.then(function() {
				var oVariant = createVariant({
					fileName: sVariantManagementReference
				});
				VariantManagementState.addRuntimeSteadyObject(sReference, sComponentId, oVariant);

				var oVariantManagementState = VariantManagementState.getVariantManagementMap().get({ reference: sReference });

				assert.strictEqual(
					oVariantManagementState[sVariantManagementReference].variants.length,
					1,
					"then the standard variant is added to the vm state"
				);
				assert.strictEqual(
					oVariantManagementState[sVariantManagementReference].defaultVariant,
					sVariantManagementReference,
					"then the standard variant is is set as default"
				);
			});
		});

		QUnit.test("when the fake standard variant is reset", function(assert) {
			return FlexState.initialize({
				componentId: sComponentId,
				reference: sReference
			})
			.then(function() {
				var oVariant = createVariant({
					fileName: sVariantManagementReference
				});
				VariantManagementState.addRuntimeSteadyObject(sReference, sComponentId, oVariant);

				var oVariantManagementState = VariantManagementState.getVariantManagementMap().get({ reference: sReference });

				assert.strictEqual(
					oVariantManagementState[sVariantManagementReference].variants.length,
					1,
					"then the standard variant is initially added to the vm state"
				);

				VariantManagementState.clearRuntimeSteadyObjects(sReference, sComponentId);
				assert.strictEqual(
					VariantManagementState.getVariantManagementMap().get({ reference: sReference })[sVariantManagementReference],
					undefined,
					"then the standard variant gets cleared"
				);
			});
		});

		QUnit.test("when there are changes referencing a deleted variant", function(assert) {
			var sDeletedVariant = "deletedVariantRef";
			var oUIChange = FlexObjectFactory.createUIChange({
				id: "someUIChange",
				layer: Layer.CUSTOMER,
				variantReference: sDeletedVariant
			});
			var oSetTitleChange = FlexObjectFactory.createUIChange({
				variantReference: sVariantManagementReference,
				id: "someVariantChange",
				fileType: "ctrl_variant_change",
				changeType: "setTitle",
				selector: { id: sDeletedVariant}
			});
			var oSetDefaultChange = FlexObjectFactory.createUIChange({
				id: "setDefaultVariantChange",
				layer: Layer.CUSTOMER,
				changeType: "setDefault",
				fileType: "ctrl_variant_management_change",
				selector: {
					id: sVariantManagementReference
				},
				content: {
					defaultVariant: "anotherCustomVariant"
				}
			});
			stubFlexObjectsSelector([oUIChange, oSetTitleChange, oSetDefaultChange]);
			return FlexState.initialize({
				componentId: sComponentId,
				reference: sReference
			})
			.then(function() {
				var oVariantMap = VariantManagementState.getVariantManagementMap().get({ reference: sReference });
				assert.deepEqual(oVariantMap, {}, "no variant entry was created");
			});
		});
	});

	QUnit.module("Initial current variant handling", {
		beforeEach() {
			return initializeFlexStateWithStandardVariant().then(function(oStandardVariant) {
				this.oStandardVariant = oStandardVariant;
			}.bind(this));
		},
		afterEach() {
			cleanup();
		}
	}, function() {
		QUnit.test("when retrieving the initial current variant", function(assert) {
			var oVariantManagementState = VariantManagementState.getVariantManagementMap().get({ reference: sReference });
			assert.strictEqual(
				oVariantManagementState[sVariantManagementReference].currentVariant,
				sVariantManagementReference,
				"then the standard variant is selected as the current variant"
			);
		});

		QUnit.test("when the initial current variant was set via technical parameters", function(assert) {
			var oComponentData = {technicalParameters: {}};
			oComponentData.technicalParameters[VariantUtil.VARIANT_TECHNICAL_PARAMETER] = ["customVariant"];
			sandbox.stub(FlexState, "getComponentData").returns(oComponentData);
			stubFlexObjectsSelector([
				createVariant({
					variantReference: sVariantManagementReference,
					fileName: "customVariant"
				})
			]);

			assert.strictEqual(
				VariantManagementState.getVariantManagementMap().get({ reference: sReference })[sVariantManagementReference].currentVariant,
				"customVariant",
				"then the current variant is set"
			);
		});

		QUnit.test("when the technical parameters contain entries for multiple references", function(assert) {
			var oComponentData = {technicalParameters: {}};
			oComponentData.technicalParameters[VariantUtil.VARIANT_TECHNICAL_PARAMETER] = ["customVariant", "customVariantForSecondVM"];
			sandbox.stub(FlexState, "getComponentData").returns(oComponentData);
			stubFlexObjectsSelector([
				createVariant({
					variantReference: sVariantManagementReference,
					fileName: "customVariant"
				}),
				createVariant({
					variantReference: "secondVM",
					variantManagementReference: "secondVM",
					fileName: "customVariantForSecondVM"
				})
			]);
			VariantManagementState.addRuntimeSteadyObject(
				sReference,
				sComponentId,
				createVariant({
					fileName: "secondVM",
					variantManagementReference: "secondVM"
				})
			);

			var oVMMap = VariantManagementState.getVariantManagementMap().get({ reference: sReference });
			assert.strictEqual(
				oVMMap[sVariantManagementReference].currentVariant,
				"customVariant",
				"then the current variant is set"
			);
			assert.strictEqual(
				oVMMap.secondVM.currentVariant,
				"customVariantForSecondVM",
				"then the current variant is set for the second vm"
			);
		});

		QUnit.test("when the initial current variant was set via technical parameters but is invalid", function(assert) {
			var oComponentData = {technicalParameters: {}};
			oComponentData.technicalParameters[VariantUtil.VARIANT_TECHNICAL_PARAMETER] = ["someInvalidVariant"];
			sandbox.stub(FlexState, "getComponentData").returns(oComponentData);

			assert.strictEqual(
				VariantManagementState.getVariantManagementMap().get({ reference: sReference })[sVariantManagementReference].currentVariant,
				sVariantManagementReference,
				"then the default falls back to the standard variant"
			);
		});

		QUnit.test("when the initial current variant was set via technical parameters but is hidden", function(assert) {
			var oComponentData = {technicalParameters: {}};
			oComponentData.technicalParameters[VariantUtil.VARIANT_TECHNICAL_PARAMETER] = ["customVariant"];
			sandbox.stub(FlexState, "getComponentData").returns(oComponentData);

			stubFlexObjectsSelector([
				createVariant({
					variantReference: sVariantManagementReference,
					fileName: "customVariant"
				}),
				FlexObjectFactory.createUIChange({
					id: "setVisibleChange",
					layer: Layer.CUSTOMER,
					changeType: "setVisible",
					fileType: "ctrl_variant_change",
					selector: {
						id: "customVariant"
					},
					content: {
						visible: false
					}
				})
			]);

			assert.strictEqual(
				VariantManagementState.getVariantManagementMap().get({ reference: sReference })[sVariantManagementReference].currentVariant,
				sVariantManagementReference,
				"then the default falls back to the standard variant"
			);
		});

		QUnit.test("when the initial current variant was set via technical parameters and setDefault changes exist", function(assert) {
			var oComponentData = {technicalParameters: {}};
			oComponentData.technicalParameters[VariantUtil.VARIANT_TECHNICAL_PARAMETER] = ["customVariant"];
			sandbox.stub(FlexState, "getComponentData").returns(oComponentData);

			stubFlexObjectsSelector([
				createVariant({
					variantReference: sVariantManagementReference,
					fileName: "customVariant"
				}),
				createVariant({
					variantReference: sVariantManagementReference,
					fileName: "anotherCustomVariant"
				}),
				FlexObjectFactory.createUIChange({
					id: "setDefaultVariantChange",
					layer: Layer.CUSTOMER,
					changeType: "setDefault",
					fileType: "ctrl_variant_management_change",
					selector: {
						id: sVariantManagementReference
					},
					content: {
						defaultVariant: "anotherCustomVariant"
					}
				})
			]);

			assert.strictEqual(
				VariantManagementState.getVariantManagementMap().get({ reference: sReference })[sVariantManagementReference].currentVariant,
				"customVariant",
				"then the technical parameter wins over the setDefault change"
			);
		});

		QUnit.test("when the variant that was set as default was removed", function(assert) {
			stubFlexObjectsSelector([
				// Default variant was set via perso change but is no longer available, e.g. because of version switch
				FlexObjectFactory.createUIChange({
					id: "setDefaultVariantChange",
					layer: Layer.USER,
					changeType: "setDefault",
					fileType: "ctrl_variant_management_change",
					selector: {
						id: sVariantManagementReference
					},
					content: {
						defaultVariant: "customVariant"
					}
				})
			]);

			assert.strictEqual(
				VariantManagementState.getVariantManagementMap().get({ reference: sReference })[sVariantManagementReference].currentVariant,
				sVariantManagementReference,
				"then the current variant falls back to the standard variant"
			);

			assert.strictEqual(
				VariantManagementState.getVariantManagementMap().get({ reference: sReference })[sVariantManagementReference].defaultVariant,
				sVariantManagementReference,
				"then the default variant falls back to the standard variant"
			);
		});
	});

	QUnit.module("Variant-related selectors", {
		beforeEach() {
			return initializeFlexStateWithStandardVariant();
		},
		afterEach() {
			cleanup();
		}
	}, function() {
		QUnit.test("when accessing a variant", function(assert) {
			var sCustomVariantKey = "customVariant";
			var oVariant = createVariant({
				variantReference: sVariantManagementReference,
				fileName: sCustomVariantKey
			});
			stubFlexObjectsSelector([
				oVariant
			]);
			var oVariantData = VariantManagementState.getVariant({
				reference: sReference,
				vmReference: sVariantManagementReference,
				vReference: sCustomVariantKey
			});
			assert.strictEqual(
				oVariantData.key,
				sCustomVariantKey,
				"then the proper variant is returned by the selector"
			);
			assert.strictEqual(
				oVariantData.instance,
				oVariant,
				"then the returned variant data contains the expected variant instance"
			);
		});

		QUnit.test("when accessing a variant without providing a variant key", function(assert) {
			stubFlexObjectsSelector([
				createVariant({
					variantReference: sVariantManagementReference,
					fileName: "customVariant"
				})
			]);
			var oVariantData = VariantManagementState.getVariant({
				reference: sReference,
				vmReference: sVariantManagementReference
			});
			assert.strictEqual(
				oVariantData.key,
				sVariantManagementReference,
				"then the standard variant is returned by the selector"
			);
		});

		QUnit.test("when retrieving the control changes for a variant", function(assert) {
			var oPersistedUIChange = FlexObjectFactory.createUIChange({
				id: "somePersistedUIChange",
				layer: Layer.CUSTOMER,
				variantReference: "customVariant"
			});
			oPersistedUIChange.setState(States.LifecycleState.PERSISTED);
			var oDirtyUIChange = FlexObjectFactory.createUIChange({
				id: "someDirtyUIChange",
				layer: Layer.CUSTOMER,
				variantReference: "customVariant"
			});
			stubFlexObjectsSelector([
				createVariant({
					variantReference: sVariantManagementReference,
					fileName: "customVariant"
				}),
				oPersistedUIChange,
				oDirtyUIChange,
				FlexObjectFactory.createUIChange({
					id: "someNonVariantRelatedUIChange",
					layer: Layer.CUSTOMER
				}),
				FlexObjectFactory.createUIChange({
					id: "someCompChange",
					layer: Layer.CUSTOMER,
					selector: {
						persistencyKey: "foo"
					}
				})
			]);

			assert.strictEqual(
				VariantManagementState.getControlChangesForVariant({
					reference: sReference,
					vmReference: sVariantManagementReference,
					vReference: "customVariant"
				}).length,
				2,
				"then all changes are returned"
			);
			var aControlChanges = VariantManagementState.getControlChangesForVariant({
				reference: sReference,
				vmReference: sVariantManagementReference,
				vReference: "customVariant",
				includeDirtyChanges: false
			});
			assert.strictEqual(
				aControlChanges.length,
				1,
				"then dirty changes can be filtered via a parameter"
			);
			assert.strictEqual(
				aControlChanges[0].getId(),
				"somePersistedUIChange",
				"then the persisted UI change is still returned"
			);
			assert.strictEqual(
				VariantManagementState.getVariantDependentFlexObjects({reference: sReference}).length, 3,
				"all three changes are returned"
			);
		});

		QUnit.test("when retrieving the variant changes for a variant", function(assert) {
			var oCtrlVariantChange = FlexObjectFactory.createUIChange({
				id: "someCtrlVariantChange",
				layer: Layer.CUSTOMER,
				changeType: "setTitle",
				fileType: "ctrl_variant_change",
				selector: {
					id: "customVariant"
				}
			});
			stubFlexObjectsSelector([
				createVariant({
					variantReference: sVariantManagementReference,
					fileName: "customVariant"
				}),
				oCtrlVariantChange
			]);

			assert.strictEqual(
				VariantManagementState.getVariantChangesForVariant({
					reference: sReference,
					vmReference: sVariantManagementReference,
					vReference: "customVariant"
				})[0].getId(),
				"someCtrlVariantChange",
				"then the change is returned"
			);
		});

		QUnit.test("when setting and retrieving the current variant", function(assert) {
			assert.strictEqual(
				VariantManagementState.getCurrentVariantReference({
					reference: sReference,
					vmReference: sVariantManagementReference
				}),
				sStandardVariantReference,
				"then the standard variant is returned by default"
			);

			stubFlexObjectsSelector([
				createVariant({
					variantReference: sVariantManagementReference,
					fileName: "customVariant"
				})
			]);
			VariantManagementState.setCurrentVariant({
				reference: sReference,
				vmReference: sVariantManagementReference,
				newVReference: "customVariant"
			});

			assert.strictEqual(
				VariantManagementState.getCurrentVariantReference({
					reference: sReference,
					vmReference: sVariantManagementReference
				}),
				"customVariant",
				"then the current variant can be set and the new variant is returned"
			);
		});

		QUnit.test("when setting the current variant to an invalid value", function(assert) {
			VariantManagementState.setCurrentVariant({
				reference: sReference,
				vmReference: sVariantManagementReference,
				newVReference: "someNonExistingVariant"
			});

			assert.strictEqual(
				VariantManagementState.getCurrentVariantReference({
					reference: sReference,
					vmReference: sVariantManagementReference
				}),
				sStandardVariantReference,
				"then the standard variant is returned as the current variant"
			);
		});

		QUnit.test("when retrieving a list of variant management references", function(assert) {
			VariantManagementState.addRuntimeSteadyObject(
				sReference,
				sComponentId,
				createVariant({
					fileName: "someOtherVM",
					variantManagementReference: "someOtherVM"
				})
			);
			assert.deepEqual(
				VariantManagementState.getVariantManagementReferences(sReference),
				[sVariantManagementReference, "someOtherVM"],
				"then all references are returned"
			);
		});
	});

	QUnit.module("Initial changes handling", {
		beforeEach() {
			return initializeFlexStateWithStandardVariant()
			.then(function() {
				VariantManagementState.addRuntimeSteadyObject(
					sReference,
					sComponentId,
					createVariant({
						fileName: "someOtherVM",
						variantManagementReference: "someOtherVM"
					})
				);
				var aUIChanges = [
					FlexObjectFactory.createUIChange({
						id: "change1",
						layer: Layer.CUSTOMER,
						variantReference: sVariantManagementReference,
						selector: {
							id: "someId"
						}
					}),
					FlexObjectFactory.createUIChange({
						id: "change2",
						layer: Layer.CUSTOMER,
						variantReference: sVariantManagementReference,
						selector: {
							id: "someOtherId"
						}
					}),
					FlexObjectFactory.createUIChange({
						id: "change3",
						layer: Layer.CUSTOMER,
						variantReference: "someOtherVM",
						selector: {
							id: "someThirdId"
						}
					})
				];
				aUIChanges.forEach(function(oUIChange) {
					oUIChange.setState(States.LifecycleState.PERSISTED);
				});
				stubFlexObjectsSelector(aUIChanges);
			});
		},
		afterEach() {
			cleanup();
		}
	}, function() {
		QUnit.test("when getting the initial changes with a vm reference", function(assert) {
			assert.strictEqual(
				VariantManagementState.getInitialChanges({
					reference: sReference,
					vmReference: sVariantManagementReference
				}).length,
				2,
				"then only UI changes for the selected vm are returned"
			);
		});

		QUnit.test("when getting the initial changes without a vm reference", function(assert) {
			assert.strictEqual(
				VariantManagementState.getInitialChanges({
					reference: sReference
				}).length,
				3,
				"then all UI changes are returned"
			);
		});

		QUnit.test("when getting the initial changes with an invalid vm reference", function(assert) {
			assert.strictEqual(
				VariantManagementState.getInitialChanges({
					reference: sReference,
					vmReference: "someInvalidVMReference"
				}).length,
				0,
				"then no UI changes are returned"
			);
		});

		QUnit.test("when calling waitForInitialVariantChanges", function(assert) {
			var oFlexControllerStub = {
				waitForChangesToBeApplied: sandbox.stub().resolves("foo")
			};
			sandbox.stub(JsControlTreeModifier, "bySelector").callsFake(function(oSelector) {
				return oSelector.id;
			});

			return VariantManagementState.waitForInitialVariantChanges({
				vmReference: sVariantManagementReference,
				reference: sReference,
				appComponent: {},
				flexController: oFlexControllerStub
			})
			.then(function(vReturn) {
				assert.strictEqual(
					vReturn,
					"foo",
					"then the function returns the return value of waitForChanges"
				);
				assert.ok(
					oFlexControllerStub.waitForChangesToBeApplied.calledOnce,
					"waitForChanges was called"
				);
				var aArguments = oFlexControllerStub.waitForChangesToBeApplied.lastCall.args[0];
				assert.ok(
					aArguments.some(
						function(oArgument) {
							return oArgument.selector === "someId";
						}),
					"then the first selector was passed"
				);
				assert.ok(
					aArguments.some(
						function(oArgument) {
							return oArgument.selector === "someOtherId";
						}),
					"then the second selector was passed"
				);
			});
		});

		QUnit.test("when calling waitForInitialVariantChanges with unavailable controls", function(assert) {
			var oFlexControllerStub = {
				waitForChangesToBeApplied: sandbox.stub().resolves("foo")
			};
			sandbox.stub(JsControlTreeModifier, "bySelector").returns();

			return VariantManagementState.waitForInitialVariantChanges({
				vmReference: sVariantManagementReference,
				reference: sReference,
				appComponent: {},
				flexController: oFlexControllerStub
			})
			.then(function() {
				assert.ok(oFlexControllerStub.waitForChangesToBeApplied.notCalled, "then waitForChanges was not called");
			});
		});
	});

	QUnit.done(function() {
		oComponent.destroy();
		document.getElementById("qunit-fixture").style.display = "none";
	});
});