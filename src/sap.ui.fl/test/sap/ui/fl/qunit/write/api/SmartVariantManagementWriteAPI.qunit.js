/* global QUnit */

sap.ui.define([
	"sap/base/util/LoaderExtensions",
	"sap/ui/core/Control",
	"sap/ui/core/UIComponent",
	"sap/ui/fl/apply/_internal/flexObjects/States",
	"sap/ui/fl/apply/_internal/flexState/FlexState",
	"sap/ui/fl/apply/_internal/flexState/ManifestUtils",
	"sap/ui/fl/apply/api/SmartVariantManagementApplyAPI",
	"sap/ui/fl/initial/_internal/connectors/LrepConnector",
	"sap/ui/fl/initial/_internal/Storage",
	"sap/ui/fl/initial/_internal/StorageUtils",
	"sap/ui/fl/registry/Settings",
	"sap/ui/fl/write/_internal/flexState/compVariants/CompVariantState",
	"sap/ui/fl/write/api/ContextBasedAdaptationsAPI",
	"sap/ui/fl/write/api/SmartVariantManagementWriteAPI",
	"sap/ui/fl/Layer",
	"sap/ui/fl/Utils",
	"sap/ui/model/json/JSONModel",
	"sap/ui/thirdparty/sinon-4"
], function(
	LoaderExtensions,
	Control,
	UIComponent,
	States,
	FlexState,
	ManifestUtils,
	SmartVariantManagementApplyAPI,
	LrepConnector,
	InitialStorage,
	StorageUtils,
	Settings,
	CompVariantState,
	ContextBasedAdaptationsAPI,
	SmartVariantManagementWriteAPI,
	Layer,
	Utils,
	JSONModel,
	sinon
) {
	"use strict";

	var sandbox = sinon.createSandbox();

	var oControl;
	var sReference = "odata.app";

	QUnit.module("SmartVariantManagementWriteAPI", {
		afterEach() {
			sandbox.restore();
			if (oControl) {
				oControl.destroy();
			}
			FlexState.clearState(sReference);
			delete Settings._instance;
			delete Settings._oLoadSettingsPromise;
		}
	}, function() {
		[{
			details: "addVariant without layer",
			apiFunctionName: "addVariant",
			compVariantStateFunctionName: "addVariant",
			expectedSpecificData: {}
		}, {
			details: "addVariant with layer",
			apiFunctionName: "addVariant",
			compVariantStateFunctionName: "addVariant",
			additionPropertyBag: {
				layer: Layer.CUSTOMER
			},
			expectedSpecificData: {
				adaptationId: "id12345_123"
			}
		}, {
			details: "save without layer",
			apiFunctionName: "save",
			compVariantStateFunctionName: "persist"
		}, {
			details: "setDefaultVariantId without layer",
			apiFunctionName: "setDefaultVariantId",
			compVariantStateFunctionName: "setDefault"
		}].forEach(function(testData) {
			QUnit.test(`When ${testData.details} is called`, function(assert) {
				// mock control
				const sPersistencyKey = "thePersistencyKey";
				const oSVMControl = {
					getPersonalizableControlPersistencyKey() {
						return sPersistencyKey;
					}
				};
				let oControl = oSVMControl;
				if (testData.bIsNoSVM) {
					oControl = {
						getVariantManagement() {
							return oSVMControl;
						}
					};
				}
				let mPropertyBag = {
					control: oControl,
					changeSpecificData: {},
					command: "myCommand"
				};

				mPropertyBag = { ...mPropertyBag, ...testData.additionPropertyBag };

				sandbox.stub(ContextBasedAdaptationsAPI, "hasAdaptationsModel").returns(true);
				sandbox.stub(ContextBasedAdaptationsAPI, "getAdaptationsModel").returns(new JSONModel(
					{
						displayedAdaptation: {
							id: "id12345_123"
						}
					}
				));

				const oMockResponse = testData.mockedResponse || {};
				const oCompVariantStateStub = sandbox.stub(CompVariantState, testData.compVariantStateFunctionName).returns(oMockResponse);
				const oGetFlexReferenceForControlStub = sandbox.stub(ManifestUtils, "getFlexReferenceForControl").returns(sReference);

				const oResponse = SmartVariantManagementWriteAPI[testData.apiFunctionName](mPropertyBag);
				assert.equal(oGetFlexReferenceForControlStub.getCall(0).args[0], mPropertyBag.control, "then the reference was requested for the passed control,");
				assert.equal(oResponse, testData.expectedResponse || oMockResponse, "the response was passed to the caller,");
				assert.equal(oCompVariantStateStub.callCount, 1, "the CompVariantState function was called once,");
				const oCompVariantStateFunctionArguments = oCompVariantStateStub.getCall(0).args[0];
				assert.equal(oCompVariantStateFunctionArguments, mPropertyBag, "the propertyBag was passed,");
				assert.equal(oCompVariantStateFunctionArguments.reference, sReference, "the reference was added,");
				assert.equal(oCompVariantStateFunctionArguments.persistencyKey, sPersistencyKey, "and the reference was added");
				if (testData.expectedSpecificData) {
					assert.deepEqual(oCompVariantStateFunctionArguments.changeSpecificData, testData.expectedSpecificData, "and the specific data was set");
				}
			});
		});

		var sPersistencyKey = "someKey";

		QUnit.test("when removeVariant is called", function(assert) {
			var mPropertyBag = {};
			var oGetFlexReferenceForControlStub = sandbox.stub(ManifestUtils, "getFlexReferenceForControl").returns(sReference);
			var oCompVariantStateRemoveVariantStub = sandbox.stub(CompVariantState, "removeVariant").resolves();

			return SmartVariantManagementWriteAPI.removeVariant(mPropertyBag).then(function() {
				assert.equal(oGetFlexReferenceForControlStub.getCall(0).args[0], mPropertyBag.control, "then the reference was requested for the passed control,");
				assert.equal(oCompVariantStateRemoveVariantStub.callCount, 1, "then the CompVariantState.removeVariant was called");
				assert.equal(oCompVariantStateRemoveVariantStub.getCall(0).args[0], mPropertyBag, "and the propertyBag was passed");
			});
		});

		[{
			details: "and favorite is set, but the variant does not belong to sap.ui.fl",
			updateVariantPropertyBag: {
				layer: Layer.CUSTOMER,
				id: "oData_variant_1",
				favorite: true
			},
			expected: {
				layer: Layer.CUSTOMER,
				favorite: true,
				executeOnSelection: true,
				contexts: {},
				definition: {
					executeOnSelection: true
				},
				changeContent: {
					favorite: true
				}
			}
		}, {
			details: "a executeOnSelection is set, but the variant does not belong to sap.ui.fl",
			updateVariantPropertyBag: {
				layer: Layer.CUSTOMER,
				id: "oData_variant_1",
				executeOnSelection: false
			},
			expected: {
				layer: Layer.CUSTOMER,
				favorite: false,
				executeOnSelection: false,
				contexts: {},
				definition: {
					executeOnSelection: true
				},
				changeContent: {
					executeOnSelection: false
				}
			}
		}, {
			details: "contexts are set, but the variant does not belong to sap.ui.fl",
			updateVariantPropertyBag: {
				layer: Layer.CUSTOMER,
				id: "oData_variant_1",
				contexts: {
					ROLE: ["SOME_ROLE", "AND_ANOTHER_ROLE"]
				}
			},
			expected: {
				layer: Layer.CUSTOMER,
				favorite: false,
				executeOnSelection: true,
				contexts: {
					ROLE: ["SOME_ROLE", "AND_ANOTHER_ROLE"]
				},
				definition: {
					executeOnSelection: true
				},
				changeContent: {
					contexts: {
						ROLE: ["SOME_ROLE", "AND_ANOTHER_ROLE"]
					}
				}
			}
		}, {
			details: "and favorite is set, but the variant does not belong to the same layer",
			updateVariantPropertyBag: {
				layer: Layer.CUSTOMER,
				id: "flex_variant_1",
				favorite: false
			},
			expected: {
				layer: Layer.CUSTOMER,
				favorite: false,
				executeOnSelection: false,
				contexts: {},
				definition: {
					favorite: true
				},
				changeContent: {
					favorite: false
				}
			}
		}, {
			details: "a executeOnSelection is set, but the variant does not belong to the same layer",
			updateVariantPropertyBag: {
				layer: Layer.CUSTOMER,
				id: "flex_variant_1",
				executeOnSelection: true
			},
			expected: {
				layer: Layer.CUSTOMER,
				favorite: true,
				executeOnSelection: true,
				contexts: {},
				definition: {
					favorite: true
				},
				changeContent: {
					executeOnSelection: true
				}
			}
		}, {
			details: "contexts are set, but the variant does not belong to to the same layer",
			updateVariantPropertyBag: {
				layer: Layer.CUSTOMER,
				id: "flex_variant_1",
				contexts: {
					ROLE: ["SOME_ROLE", "AND_ANOTHER_ROLE"]
				}
			},
			expected: {
				layer: Layer.CUSTOMER,
				favorite: true,
				executeOnSelection: false,
				contexts: {
					ROLE: ["SOME_ROLE", "AND_ANOTHER_ROLE"]
				},
				definition: {
					favorite: true
				},
				changeContent: {
					contexts: {
						ROLE: ["SOME_ROLE", "AND_ANOTHER_ROLE"]
					}
				}
			}
		}, {
			details: "and favorite is set user dependent, but the variant does not belong to the same layer",
			updateVariantPropertyBag: {
				isUserDependent: true,
				id: "flex_variant_1",
				favorite: false
			},
			expected: {
				layer: Layer.USER,
				favorite: false,
				executeOnSelection: false,
				contexts: {},
				definition: {
					favorite: true
				},
				changeContent: {
					favorite: false
				}
			}
		}, {
			details: "a executeOnSelection is set user dependent, but the variant does not belong to the same layer",
			updateVariantPropertyBag: {
				isUserDependent: true,
				id: "flex_variant_1",
				executeOnSelection: true
			},
			expected: {
				layer: Layer.USER,
				favorite: true,
				executeOnSelection: true,
				contexts: {},
				definition: {
					favorite: true
				},
				changeContent: {
					executeOnSelection: true
				}
			}
		}, {
			details: "the variantName is set user dependent, but the variant does not belong to to the same layer",
			updateVariantPropertyBag: {
				isUserDependent: true,
				id: "flex_variant_1",
				name: "a new name"
			},
			expected: {
				layer: Layer.USER,
				favorite: true,
				executeOnSelection: false,
				name: "a new name",
				contexts: {},
				definition: {
					favorite: true
				},
				changeContent: {},
				changeTextsVariantName: "a new name"
			}
		}, {
			details: "contexts are set user dependent, but the variant does not belong to to the same layer",
			updateVariantPropertyBag: {
				isUserDependent: true,
				id: "flex_variant_1",
				contexts: {
					ROLE: ["SOME_ROLE", "AND_ANOTHER_ROLE"]
				}
			},
			expected: {
				layer: Layer.USER,
				favorite: true,
				executeOnSelection: false,
				contexts: {
					ROLE: ["SOME_ROLE", "AND_ANOTHER_ROLE"]
				},
				definition: {
					favorite: true
				},
				changeContent: {
					contexts: {
						ROLE: ["SOME_ROLE", "AND_ANOTHER_ROLE"]
					}
				}
			}
		}].forEach(function(testData) {
			QUnit.test(`When updateVariant is called, ${testData.details}`, function(assert) {
				sandbox.stub(ManifestUtils, "getFlexReferenceForControl").returns(sReference);
				const oAppComponent = new UIComponent();
				oControl = new Control("controlId1");
				oControl.getPersistencyKey = function() {
					return sPersistencyKey;
				};

				const aVariants = [{
					id: "oData_variant_1",
					executeOnSelection: true,
					name: "A variant",
					content: {}
				}, {
					id: "oData_variant_2",
					name: "A Variant",
					content: {}
				}];
				sandbox.stub(Utils, "getAppComponentForControl").returns(oAppComponent);
				sandbox.stub(InitialStorage, "loadFlexData").resolves({
					...StorageUtils.getEmptyFlexDataResponse(),
					changes: [],
					comp: {
						compVariants: [],
						variants: [{
							fileName: "flex_variant_1",
							name: "F Variant",
							layer: Layer.VENDOR,
							content: {},
							favorite: true,
							selector: {
								persistencyKey: sPersistencyKey
							},
							texts: {
								variantName: {
									value: "A variant"
								}
							}
						}],
						changes: [],
						standardVariants: [],
						defaultVariants: []
					}
				});

				return SmartVariantManagementApplyAPI.loadVariants({
					control: oControl,
					standardVariant: {
						name: "sStandardVariantTitle"
					},
					variants: aVariants
				}).then(function() {
					testData.updateVariantPropertyBag.control = oControl;
					return SmartVariantManagementWriteAPI.updateVariant(testData.updateVariantPropertyBag);
				}).then(function(oVariant) {
					assert.equal(oVariant.getChanges().length, 1, "one change was added");
					const oChange = oVariant.getChanges()[0];
					assert.equal(oChange.getLayer(), testData.expected.layer, "the layer is set correct");
					assert.equal(oChange.getChangeType(), "updateVariant", "changeType ist updateVariant");
					assert.deepEqual(oChange.getContent(), testData.expected.changeContent, "change content ist updateVariant");
					assert.equal(oVariant.getFavorite(), testData.expected.favorite, "the favorite flag flag is set correct");
					assert.equal(oVariant.getExecuteOnSelection(), testData.expected.executeOnSelection, "the executeOnSelection flag is set correct");
					assert.deepEqual(oVariant.getContexts(), testData.expected.contexts, "the contexts section is set correct");
					// also test the name in case it is part of the update
					if (testData.updateVariantPropertyBag.name) {
						assert.equal(oVariant.getName(), testData.expected.name, "the name is set correct");
						assert.deepEqual(oChange.getText("variantName"), testData.expected.changeTextsVariantName, "the change has the name set correct in the texts section");
					}
				});
			});
		});

		[{
			details: "and favorite is set, but the variant does not belong to sap.ui.fl",
			updateVariantPropertyBag: {
				layer: Layer.CUSTOMER,
				id: "oData_variant_1",
				favorite: true
			},
			expected: {
				layer: Layer.CUSTOMER,
				favorite: true,
				executeOnSelection: true,
				contexts: {},
				definition: {
					executeOnSelection: true
				},
				changeContent: {
					favorite: true
				},
				changeAdaptationId: "id12345_123",
				variantAdaptationId: "id12345_123"
			}
		}, {
			details: "a executeOnSelection is set, but the variant does not belong to sap.ui.fl",
			updateVariantPropertyBag: {
				layer: Layer.CUSTOMER,
				id: "oData_variant_1",
				executeOnSelection: false
			},
			expected: {
				layer: Layer.CUSTOMER,
				favorite: false,
				executeOnSelection: false,
				contexts: {},
				definition: {
					executeOnSelection: true
				},
				changeContent: {
					executeOnSelection: false
				},
				changeAdaptationId: "id12345_123",
				variantAdaptationId: "id12345_123"
			}
		}, {
			details: "contexts are set, but the variant does not belong to sap.ui.fl",
			updateVariantPropertyBag: {
				layer: Layer.CUSTOMER,
				id: "oData_variant_1",
				contexts: {
					ROLE: ["SOME_ROLE", "AND_ANOTHER_ROLE"]
				}
			},
			expected: {
				layer: Layer.CUSTOMER,
				favorite: false,
				executeOnSelection: true,
				contexts: {
					ROLE: ["SOME_ROLE", "AND_ANOTHER_ROLE"]
				},
				definition: {
					executeOnSelection: true
				},
				changeContent: {
					contexts: {
						ROLE: ["SOME_ROLE", "AND_ANOTHER_ROLE"]
					}
				},
				changeAdaptationId: "id12345_123",
				variantAdaptationId: "id12345_123"
			}
		}, {
			details: "and favorite is set, but the variant does not belong to the same layer",
			updateVariantPropertyBag: {
				layer: Layer.CUSTOMER,
				id: "flex_variant_1",
				favorite: false
			},
			expected: {
				layer: Layer.CUSTOMER,
				favorite: false,
				executeOnSelection: false,
				contexts: {},
				definition: {
					favorite: true
				},
				changeContent: {
					favorite: false
				},
				changeAdaptationId: "id12345_123",
				variantAdaptationId: undefined
			}
		}, {
			details: "a executeOnSelection is set, but the variant does not belong to the same layer",
			updateVariantPropertyBag: {
				layer: Layer.CUSTOMER,
				id: "flex_variant_1",
				executeOnSelection: true
			},
			expected: {
				layer: Layer.CUSTOMER,
				favorite: true,
				executeOnSelection: true,
				contexts: {},
				definition: {
					favorite: true
				},
				changeContent: {
					executeOnSelection: true
				},
				changeAdaptationId: "id12345_123",
				variantAdaptationId: undefined
			}
		}, {
			details: "contexts are set, but the variant does not belong to to the same layer",
			updateVariantPropertyBag: {
				layer: Layer.CUSTOMER,
				id: "flex_variant_1",
				contexts: {
					ROLE: ["SOME_ROLE", "AND_ANOTHER_ROLE"]
				}
			},
			expected: {
				layer: Layer.CUSTOMER,
				favorite: true,
				executeOnSelection: false,
				contexts: {
					ROLE: ["SOME_ROLE", "AND_ANOTHER_ROLE"]
				},
				definition: {
					favorite: true
				},
				changeContent: {
					contexts: {
						ROLE: ["SOME_ROLE", "AND_ANOTHER_ROLE"]
					}
				},
				changeAdaptationId: "id12345_123",
				variantAdaptationId: undefined
			}
		}, {
			details: "and favorite is set user dependent, but the variant does not belong to the same layer",
			updateVariantPropertyBag: {
				isUserDependent: true,
				id: "flex_variant_1",
				favorite: false
			},
			expected: {
				layer: Layer.USER,
				favorite: false,
				executeOnSelection: false,
				contexts: {},
				definition: {
					favorite: true
				},
				changeContent: {
					favorite: false
				},
				changeAdaptationId: undefined,
				variantAdaptationId: undefined
			}
		}, {
			details: "a executeOnSelection is set user dependent, but the variant does not belong to the same layer",
			updateVariantPropertyBag: {
				isUserDependent: true,
				id: "flex_variant_1",
				executeOnSelection: true
			},
			expected: {
				layer: Layer.USER,
				favorite: true,
				executeOnSelection: true,
				contexts: {},
				definition: {
					favorite: true
				},
				changeContent: {
					executeOnSelection: true
				},
				changeAdaptationId: undefined,
				variantAdaptationId: undefined
			}
		}, {
			details: "the variantName is set user dependent, but the variant does not belong to to the same layer",
			updateVariantPropertyBag: {
				isUserDependent: true,
				id: "flex_variant_1",
				name: "a new name"
			},
			expected: {
				layer: Layer.USER,
				favorite: true,
				executeOnSelection: false,
				name: "a new name",
				contexts: {},
				definition: {
					favorite: true
				},
				changeContent: {},
				changeTextsVariantName: "a new name",
				changeAdaptationId: undefined,
				variantAdaptationId: undefined
			}
		}, {// no real use case for user layer setContext change
			details: "contexts are set user dependent, but the variant does not belong to to the same layer",
			updateVariantPropertyBag: {
				isUserDependent: true,
				id: "flex_variant_1",
				contexts: {
					ROLE: ["SOME_ROLE", "AND_ANOTHER_ROLE"]
				}
			},
			expected: {
				layer: Layer.USER,
				favorite: true,
				executeOnSelection: false,
				contexts: {
					ROLE: ["SOME_ROLE", "AND_ANOTHER_ROLE"]
				},
				definition: {
					favorite: true
				},
				changeContent: {
					contexts: {
						ROLE: ["SOME_ROLE", "AND_ANOTHER_ROLE"]
					}
				},
				changeAdaptationId: undefined,
				variantAdaptationId: undefined
			}
		}].forEach(function(testData) {
			QUnit.test(`When updateVariant is called with adaptationId, ${testData.details}`, function(assert) {
				sandbox.stub(ManifestUtils, "getFlexReferenceForControl").returns(sReference);
				const oAppComponent = new UIComponent();
				oControl = new Control("controlId1");
				oControl.getPersistencyKey = function() {
					return sPersistencyKey;
				};

				const aVariants = [{
					adaptationId: "id12345_123",
					id: "oData_variant_1",
					executeOnSelection: true,
					name: "A variant",
					content: {}
				}, {
					adaptationId: "id12345_123",
					id: "oData_variant_2",
					name: "A Variant",
					content: {}
				}];
				sandbox.stub(Utils, "getAppComponentForControl").returns(oAppComponent);
				sandbox.stub(InitialStorage, "loadFlexData").resolves({
					...StorageUtils.getEmptyFlexDataResponse(),
					changes: [],
					comp: {
						compVariants: [],
						variants: [{
							fileName: "flex_variant_1",
							name: "F Variant",
							layer: Layer.VENDOR,
							content: {},
							favorite: true,
							selector: {
								persistencyKey: sPersistencyKey
							},
							texts: {
								variantName: {
									value: "A variant"
								}
							}
						}],
						changes: [],
						standardVariants: [],
						defaultVariants: []
					}
				});

				sandbox.stub(ContextBasedAdaptationsAPI, "hasAdaptationsModel").returns(true);
				sandbox.stub(ContextBasedAdaptationsAPI, "getAdaptationsModel").returns(new JSONModel(
					{
						displayedAdaptation: {
							id: "id12345_123"
						}
					}
				));

				return SmartVariantManagementApplyAPI.loadVariants({
					control: oControl,
					standardVariant: {
						name: "sStandardVariantTitle"
					},
					variants: aVariants
				})
				.then(function() {
					testData.updateVariantPropertyBag.control = oControl;
					return SmartVariantManagementWriteAPI.updateVariant(testData.updateVariantPropertyBag);
				})
				.then(function(oVariant) {
					assert.equal(oVariant.getChanges().length, 1, "one change was added");
					const oChange = oVariant.getChanges()[0];
					assert.equal(oChange.getLayer(), testData.expected.layer, "the layer is set correct");
					assert.equal(oChange.getChangeType(), "updateVariant", "changeType ist updateVariant");
					assert.deepEqual(oChange.getContent(), testData.expected.changeContent, "change content ist updateVariant");
					assert.equal(oChange.getAdaptationId(), testData.expected.changeAdaptationId, "the change adaptation id is set correct");
					assert.equal(oVariant.getFavorite(), testData.expected.favorite, "the favorite flag flag is set correct");
					assert.equal(oVariant.getExecuteOnSelection(), testData.expected.executeOnSelection, "the executeOnSelection flag is set correct");
					assert.deepEqual(oVariant.getContexts(), testData.expected.contexts, "the contexts section is set correct");
					assert.equal(oVariant.getAdaptationId(), testData.expected.variantAdaptationId, "the variant adaptation id is set correctly");
					// also test the name in case it is part of the update
					if (testData.updateVariantPropertyBag.name) {
						assert.equal(oVariant.getName(), testData.expected.name, "the name is set correct");
						assert.deepEqual(oChange.getText("variantName"), testData.expected.changeTextsVariantName, "the change has the name set correct in the texts section");
					}
				});
			});
		});

		[{
			testDetails: "on a variant with an empty package name",
			packageName: "",
			expectedChange: false
		}, {
			testDetails: "on a variant with an '$TMP' package name",
			packageName: "$TMP",
			expectedChange: false
		}, {
			testDetails: "on a variant with a package name",
			packageName: "PACKAGE_A",
			expectedChange: true
		}].forEach(function(oTestData) {
			QUnit.test(`When updateVariant is called ${oTestData.testDetails}`, function(assert) {
				sandbox.stub(ManifestUtils, "getFlexReferenceForControl").returns(sReference);
				const oAppComponent = new UIComponent();
				oControl = new Control("controlId1");
				oControl.getPersistencyKey = function() {
					return sPersistencyKey;
				};

				sandbox.stub(Utils, "getAppComponentForControl").returns(oAppComponent);
				sandbox.stub(InitialStorage, "loadFlexData").resolves({
					...StorageUtils.getEmptyFlexDataResponse(),
					changes: [],
					comp: {
						compVariants: [],
						variants: [{
							fileName: "flex_variant_1",
							name: "F Variant",
							layer: Layer.VENDOR,
							packageName: oTestData.packageName,
							content: {},
							favorite: true,
							selector: {
								persistencyKey: sPersistencyKey
							},
							texts: {
								variantName: {
									value: "A variant"
								}
							}
						}],
						changes: [],
						standardVariants: [],
						defaultVariants: []
					}
				});
				sandbox.stub(Settings, "getInstanceOrUndef").returns({
					isVersioningEnabled() {
						return false;
					},
					getUserId() {}
				});
				return SmartVariantManagementApplyAPI.loadVariants({
					control: oControl,
					standardVariant: {},
					variants: []
				}).then(function() {
					return SmartVariantManagementWriteAPI.updateVariant({
						control: oControl,
						layer: Layer.VENDOR,
						id: "flex_variant_1",
						name: "a new name",
						packageName: "PACKAGE_A",
						transportId: "transport1"
					});
				}).then(function(oVariant) {
					if (oTestData.expectedChange) {
						assert.equal(oVariant.getChanges().length, 1, "one change was added");
						assert.equal(oVariant.getChanges()[0].getFlexObjectMetadata().packageName, "PACKAGE_A", "the packageName was set correct");
						assert.equal(oVariant.getState(), States.LifecycleState.PERSISTED, "the change is not flagged as updated");
					} else {
						assert.equal(oVariant.getChanges().length, 0, "no change was added");
						assert.equal(oVariant.getState(), States.LifecycleState.UPDATED, "the change is not flagged as updated");
					}
				});
			});
		});

		[{
			details: "a new name for a variant",
			propertyBag: {
				id: "test_variant",
				name: "a new name"
			},
			mockedVariant: {
				fileName: "test_variant",
				layer: Layer.CUSTOMER,
				selector: {
					persistencyKey: sPersistencyKey
				},
				content: {},
				texts: {
					variantName: {
						value: ""
					}
				}
			},
			expected: {
				name: "a new name",
				content: {},
				favorite: false,
				executeOnSelection: false,
				action: CompVariantState.updateActionType.UPDATE_METADATA
			}
		}, {
			details: "a new content",
			propertyBag: {
				id: "test_variant",
				content: {
					someProperty: "someValue"
				}
			},
			mockedVariant: {
				fileName: "test_variant",
				layer: Layer.CUSTOMER,
				selector: {
					persistencyKey: sPersistencyKey
				},
				content: {
					someOld: "content"
				},
				texts: {
					variantName: {
						value: ""
					}
				}
			},
			expected: {
				name: "",
				content: {
					someProperty: "someValue"
				},
				executeOnSelection: false,
				favorite: false,
				action: CompVariantState.updateActionType.UPDATE
			}
		}, {
			details: "save variant content",
			propertyBag: {
				id: "test_variant"
			},
			mockedVariant: {
				fileName: "test_variant",
				layer: Layer.CUSTOMER,
				selector: {
					persistencyKey: sPersistencyKey
				},
				content: {
					someOld: "content"
				},
				texts: {
					variantName: {
						value: ""
					}
				}
			},
			expected: {
				name: "",
				content: {
					someOld: "content"
				},
				executeOnSelection: false,
				favorite: false,
				action: CompVariantState.updateActionType.SAVE
			}
		}, {
			details: "a new executeOnSelection flag",
			propertyBag: {
				id: "test_variant",
				executeOnSelection: true
			},
			mockedVariant: {
				fileName: "test_variant",
				layer: Layer.CUSTOMER,
				selector: {
					persistencyKey: sPersistencyKey
				},
				content: {
					someOld: "content"
				},
				texts: {
					variantName: {
						value: ""
					}
				}
			},
			expected: {
				name: "",
				content: {
					someOld: "content"
				},
				executeOnSelection: true,
				favorite: false,
				action: CompVariantState.updateActionType.UPDATE_METADATA
			}
		}, {
			details: "a new favorite flag",
			propertyBag: {
				id: "test_variant",
				favorite: true
			},
			mockedVariant: {
				fileName: "test_variant",
				layer: Layer.CUSTOMER,
				selector: {
					persistencyKey: sPersistencyKey
				},
				content: {
					someOld: "content"
				},
				texts: {
					variantName: {
						value: ""
					}
				}
			},
			expected: {
				name: "",
				content: {
					someOld: "content"
				},
				executeOnSelection: false,
				favorite: true,
				action: CompVariantState.updateActionType.UPDATE_METADATA
			}
		}, {
			details: "a new executeOnSelection flag overwriting an old one",
			propertyBag: {
				id: "test_variant",
				executeOnSelection: true
			},
			mockedVariant: {
				fileName: "test_variant",
				layer: Layer.CUSTOMER,
				selector: {
					persistencyKey: sPersistencyKey
				},
				content: {
					someOld: "content"
				},
				texts: {
					variantName: {
						value: ""
					}
				}
			},
			expected: {
				name: "",
				content: {
					someOld: "content"
				},
				executeOnSelection: true,
				favorite: false,
				action: CompVariantState.updateActionType.UPDATE_METADATA
			}
		}, {
			details: "a new favorite flag overwriting an old one",
			propertyBag: {
				id: "test_variant",
				favorite: true
			},
			mockedVariant: {
				fileName: "test_variant",
				layer: Layer.CUSTOMER,
				selector: {
					persistencyKey: sPersistencyKey
				},
				content: {
					someOld: "content"
				},
				texts: {
					variantName: {
						value: ""
					}
				}
			},
			expected: {
				name: "",
				content: {
					someOld: "content"
				},
				executeOnSelection: false,
				favorite: true,
				action: CompVariantState.updateActionType.UPDATE_METADATA
			}
		}, {
			details: "a new content and existing flags for executeOnSelection and favorite",
			propertyBag: {
				id: "test_variant",
				content: {
					someProperty: "someValue"
				}
			},
			mockedVariant: {
				fileName: "test_variant",
				layer: Layer.CUSTOMER,
				selector: {
					persistencyKey: sPersistencyKey
				},
				content: {
					executeOnSelection: true
				},
				favorite: false,
				texts: {
					variantName: {
						value: ""
					}
				}
			},
			expected: {
				name: "",
				content: {
					someProperty: "someValue"
				},
				executeOnSelection: true,
				favorite: false,
				action: undefined
			}
		}].forEach(function(testData) {
			QUnit.test(`When updateVariant is called with ${testData.details}`, function(assert) {
				testData.propertyBag.reference = sReference;
				testData.propertyBag.persistencyKey = sPersistencyKey;
				oControl = new Control("controlId1");
				oControl.getPersistencyKey = function() {
					return sPersistencyKey;
				};
				testData.propertyBag.control = oControl;
				sandbox.stub(InitialStorage, "loadFlexData").resolves({
					...StorageUtils.getEmptyFlexDataResponse(),
					changes: [],
					comp: {
						variants: [testData.mockedVariant],
						changes: [],
						standardVariants: [],
						defaultVariants: []
					},
					settings: {}
				});

				return FlexState.initialize({
					reference: sReference,
					componentId: "__component0",
					manifest: {},
					componentData: {}
				}).then(Settings.getInstance)
				.then(function() {
					switch (testData.details) {
						case "a new name for a variant":
						case "a new executeOnSelection flag":
						case "a new favorite flag":
						case "a new executeOnSelection flag overwriting an old one":
						case "a new favorite flag overwriting an old one":
							SmartVariantManagementWriteAPI.updateVariantMetadata(testData.propertyBag);
							break;
						case "a new content":
							SmartVariantManagementWriteAPI.updateVariantContent(testData.propertyBag);
							break;
						case "save variant content":
							SmartVariantManagementWriteAPI.saveVariantContent(testData.propertyBag);
							break;
						case "a new content and existing flags for executeOnSelection and favorite":
							SmartVariantManagementWriteAPI.updateVariant(testData.propertyBag);
							break;
						default:
					}

					const oVariant = FlexState.getCompVariantsMap(sReference)[testData.propertyBag.persistencyKey].byId[testData.propertyBag.id];

					assert.equal(oVariant.getText("variantName"), testData.expected.name, "the name is correct");
					assert.deepEqual(oVariant.getContent(), testData.expected.content, "the content is correct");
					assert.equal(oVariant.getFavorite(), testData.expected.favorite, "the favorite flag is correct");
					assert.equal(oVariant.getExecuteOnSelection(), testData.expected.executeOnSelection, "the executeOnSelection flag is correct");
					assert.equal(oVariant.getRevertData()[0].getContent().previousAction, testData.expected.action, "the action type is correct");
				});
			});
		});

		QUnit.test("When isVariantSharingEnabled() is called it calls the Settings instance and returns true", function(assert) {
			var oSetting = {
				isKeyUser: true,
				isAtoAvailable: true,
				isVariantSharingEnabled: true
			};

			sandbox.stub(InitialStorage, "loadFeatures").resolves(oSetting);

			var isVariantSharingEnabledSpy = sandbox.spy(SmartVariantManagementWriteAPI, "isVariantSharingEnabled");
			return SmartVariantManagementWriteAPI.isVariantSharingEnabled().then(function(bFlag) {
				assert.equal(bFlag, true, "the true flag is returned");
				assert.equal(isVariantSharingEnabledSpy.callCount, 1, "called once");
			});
		});

		QUnit.test("When isVariantSharingEnabled() is called it calls the Settings instance and returns false", function(assert) {
			var oSetting = {
				isKeyUser: false,
				isAtoAvailable: true,
				isVariantSharingEnabled: false
			};

			sandbox.stub(InitialStorage, "loadFeatures").resolves(oSetting);

			var isVariantSharingEnabledSpy = sandbox.spy(SmartVariantManagementWriteAPI, "isVariantSharingEnabled");
			return SmartVariantManagementWriteAPI.isVariantSharingEnabled().then(function(bFlag) {
				assert.equal(bFlag, false, "the false flag is returned");
				assert.equal(isVariantSharingEnabledSpy.callCount, 1, "called once");
			});
		});

		QUnit.test("When isVariantPersonalizationEnabled() is called it calls the Settings instance and returns true", function(assert) {
			var oSetting = {
				isVariantPersonalizationEnabled: true
			};

			sandbox.stub(InitialStorage, "loadFeatures").resolves(oSetting);

			var isVariantPersonalizationEnabledSpy = sandbox.spy(SmartVariantManagementWriteAPI, "isVariantPersonalizationEnabled");
			return SmartVariantManagementWriteAPI.isVariantPersonalizationEnabled().then(function(bFlag) {
				assert.equal(bFlag, true, "the true flag is returned");
				assert.equal(isVariantPersonalizationEnabledSpy.callCount, 1, "called once");
			});
		});

		QUnit.test("When isVariantPersonalizationEnabled() is called it calls the Settings instance and returns false", function(assert) {
			var oSetting = {
				isVariantPersonalizationEnabled: false
			};

			sandbox.stub(InitialStorage, "loadFeatures").resolves(oSetting);

			var isVariantPersonalizationEnabledSpy = sandbox.spy(SmartVariantManagementWriteAPI, "isVariantPersonalizationEnabled");
			return SmartVariantManagementWriteAPI.isVariantPersonalizationEnabled().then(function(bFlag) {
				assert.equal(bFlag, false, "the false flag is returned");
				assert.equal(isVariantPersonalizationEnabledSpy.callCount, 1, "called once");
			});
		});
	});

	QUnit.module("loadVariants with legacy content", {
		beforeEach() {
			this.oAppComponent = new UIComponent("AppComponent21");
			sandbox.stub(Utils, "getAppComponentForControl").returns(this.oAppComponent);
			FlexState.clearState();
		},
		afterEach() {
			sandbox.restore();
			this.oControl && this.oControl.destroy();
		}
	}, function() {
		QUnit.test("When loadVariants() is called and multiple variants are present for the persistencyKey of the passed control", function(assert) {
			this.oControl = new Control();
			var sPersistencyKey = "variantManagement1";
			this.oControl.getPersonalizableControlPersistencyKey = function() {
				return sPersistencyKey;
			};

			var mFlexData = {
				...StorageUtils.getEmptyFlexDataResponse(),
				...(LoaderExtensions.loadResource({
					dataType: "json",
					url: sap.ui.require.toUrl(
						"test-resources/sap/ui/fl/qunit/apply/api/SmartVariantManagementAPI.loadVariantsTestSetup-flexData.json"
					)
				}))
			};

			sandbox.stub(LrepConnector, "loadFlexData").resolves(mFlexData);
			var oVariant;

			return SmartVariantManagementApplyAPI.loadVariants({
				control: this.oControl,
				standardVariant: {}
			})
			.then(function(oResponse) {
				[oVariant] = oResponse.variants; // user variant with 2 legacy changes (addFavorite & removeFavorite)
			})
			.then(function() {
				SmartVariantManagementWriteAPI.updateVariant({
					isUserDependent: true,
					id: oVariant.getId(),
					control: this.oControl,
					favorite: true
				});
			}.bind(this))
			.then(function() {
				var aVariantChanges = oVariant.getChanges();
				assert.equal(aVariantChanges.length, 3, "a new change was created");
				assert.equal(aVariantChanges[2].getChangeType(), "updateVariant", "a new update was written");
			});
		});
	});

	QUnit.module("revert", {
		beforeEach() {
			if (oControl) {
				oControl.destroy();
			}
		},
		afterEach() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("Given a variant was removed", function(assert) {
			const sPersistencyKey = "persistency.key";
			oControl = new Control("controlId1");
			oControl.getPersistencyKey = function() {
				return sPersistencyKey;
			};
			sandbox.stub(InitialStorage, "loadFlexData").resolves({
				...StorageUtils.getEmptyFlexDataResponse(),
				changes: [],
				comp: {
					variants: [{
						fileName: "test_variant",
						selector: {
							persistencyKey: sPersistencyKey
						},
						content: {
							executeOnSelection: true,
							favorite: false
						},
						texts: {
							variantName: {
								value: ""
							}
						}
					}],
					changes: [],
					standardVariants: [],
					defaultVariants: []
				}
			});

			return FlexState.initialize({
				reference: sReference,
				componentId: "__component0",
				manifest: {},
				componentData: {}
			})
			.then(function() {
				return SmartVariantManagementWriteAPI.removeVariant({
					reference: sReference,
					persistencyKey: sPersistencyKey,
					id: "test_variant",
					control: oControl
				});
			})
			.then(function(oRemovedVariant) {
				assert.equal(oRemovedVariant.getState(), States.LifecycleState.DELETED, "the variant is flagged for deletion");
				let aRevertData = oRemovedVariant.getRevertData();
				assert.equal(aRevertData.length, 1, "revertData was stored");
				const oLastRevertData = aRevertData[0];
				assert.equal(oLastRevertData.getType(), CompVariantState.operationType.StateUpdate, "it is stored that the state was updated ...");
				assert.deepEqual(oLastRevertData.getContent(), {previousState: States.LifecycleState.PERSISTED}, "... to PERSISTED");

				SmartVariantManagementWriteAPI.revert({
					reference: sReference,
					persistencyKey: sPersistencyKey,
					id: "test_variant",
					control: oControl
				});

				aRevertData = oRemovedVariant.getRevertData();
				assert.equal(aRevertData.length, 0, "after a revert... the revert data is no longer available");
				assert.equal(oRemovedVariant.getState(), States.LifecycleState.PERSISTED, "and the change is flagged as new");
			});
		});

		QUnit.test("Given a variant with adaptation id was removed", function(assert) {
			const sPersistencyKey = "persistency.key";
			oControl = new Control("controlId2");
			oControl.getPersistencyKey = function() {
				return sPersistencyKey;
			};
			sandbox.stub(InitialStorage, "loadFlexData").resolves({
				...StorageUtils.getEmptyFlexDataResponse(),
				changes: [],
				comp: {
					variants: [{
						adaptationId: "id12345_123",
						fileName: "test_variant",
						selector: {
							persistencyKey: sPersistencyKey
						},
						content: {
							executeOnSelection: true,
							favorite: false
						},
						texts: {
							variantName: {
								value: ""
							}
						}
					}],
					changes: [],
					standardVariants: [],
					defaultVariants: []
				}
			});

			sandbox.stub(ContextBasedAdaptationsAPI, "hasAdaptationsModel").returns(true);
			sandbox.stub(ContextBasedAdaptationsAPI, "getAdaptationsModel").returns(new JSONModel(
				{
					displayedAdaptation: {
						id: "id12345_123"
					}
				}
			));

			return FlexState.update({
				reference: sReference,
				componentId: "__component0",
				manifest: {},
				componentData: {}
			}).then(function() {
				return SmartVariantManagementWriteAPI.removeVariant({
					layer: Layer.CUSTOMER,
					reference: sReference,
					persistencyKey: sPersistencyKey,
					id: "test_variant",
					control: oControl
				});
			}).then(function(oRemovedVariant) {
				assert.equal(oRemovedVariant.getState(), States.LifecycleState.DELETED, "the variant is flagged for deletion");
				let aRevertData = oRemovedVariant.getRevertData();
				assert.equal(aRevertData.length, 1, "revertData was stored");
				const oLastRevertData = aRevertData[0];
				assert.equal(oLastRevertData.getType(), CompVariantState.operationType.StateUpdate, "it is stored that the state was updated ...");
				assert.deepEqual(oLastRevertData.getContent(), {previousState: States.LifecycleState.PERSISTED}, "... to PERSISTED");

				SmartVariantManagementWriteAPI.revert({
					reference: sReference,
					persistencyKey: sPersistencyKey,
					id: "test_variant",
					control: oControl
				});

				aRevertData = oRemovedVariant.getRevertData();
				assert.equal(aRevertData.length, 0, "after a revert... the revert data is no longer available");
				assert.equal(oRemovedVariant.getState(), States.LifecycleState.PERSISTED, "and the change is flagged as new");
			});
		});
	});

	QUnit.module("discardVariantContent", {
		beforeEach() {
			if (oControl) {
				oControl.destroy();
			}
		},
		afterEach() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("discardVariantContent function calls CompVariantState.discardVariantContent", function(assert) {
			var sPersistencyKey = "persistency.key";
			oControl = new Control("controlId1");
			oControl.getPersistencyKey = function() {
				return sPersistencyKey;
			};
			var oCompVariantStateDiscardVariantStub = sandbox.stub(CompVariantState, "discardVariantContent");
			SmartVariantManagementWriteAPI.discardVariantContent({
				reference: sReference,
				persistencyKey: sPersistencyKey,
				id: "test_variant",
				control: oControl
			});
			assert.equal(oCompVariantStateDiscardVariantStub.calledOnce, true, "function was called");
			assert.equal(oCompVariantStateDiscardVariantStub.getCall(0).args[0].action, CompVariantState.updateActionType.DISCARD, "with correct action type");
		});
	});

	QUnit.module("_getTransportSelection", {
		afterEach() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("Given TransportSelection was requested and a PUBLIC layer is available", function(assert) {
			// Stub to check for the actual call of the TransportSelection function (no direct stubbing due to the .apply usage)
			var oUtilsStub = sandbox.stub(Utils, "getLrepUrl");

			return new Promise(function(resolve) {
				var oTransportSelection = SmartVariantManagementWriteAPI._getTransportSelection();
				oTransportSelection.selectTransport({}, resolve);
			}).then(function() {
				assert.equal(oUtilsStub.callCount, 0, "the TransportSelection.selectTransport was not called");
			});
		});

		QUnit.test("Given TransportSelection was requested and a PUBLIC layer is available", function(assert) {
			// Stub to check for the actual call of the TransportSelection function (no direct stubbing due to the .call usage)
			// returns empty to not trigger further functionality within the selectTransport
			var oUtilsStub = sandbox.stub(Utils, "getLrepUrl").returns("");
			sandbox.stub(URLSearchParams.prototype, "get").returns(Layer.VENDOR);

			return new Promise(function(resolve) {
				var oTransportSelection = SmartVariantManagementWriteAPI._getTransportSelection();
				oTransportSelection.selectTransport({}, resolve);
			}).then(function() {
				assert.equal(oUtilsStub.callCount, 1, "the TransportSelection.selectTransport was called");
			});
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});