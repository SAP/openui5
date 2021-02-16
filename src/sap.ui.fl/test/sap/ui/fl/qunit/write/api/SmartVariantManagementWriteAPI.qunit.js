/* global QUnit */

sap.ui.define([
	"sap/ui/fl/write/api/SmartVariantManagementWriteAPI",
	"sap/ui/fl/write/_internal/flexState/compVariants/CompVariantState",
	"sap/ui/fl/apply/_internal/flexState/FlexState",
	"sap/ui/fl/initial/_internal/Storage",
	"sap/ui/fl/write/_internal/Storage",
	"sap/ui/fl/registry/Settings",
	"sap/ui/fl/apply/_internal/flexObjects/CompVariant",
	"sap/ui/fl/Change",
	"sap/ui/fl/apply/_internal/flexState/ManifestUtils",
	"sap/ui/thirdparty/sinon-4"
], function(
	SmartVariantManagementWriteAPI,
	CompVariantState,
	FlexState,
	InitialStorage,
	WriteStorage,
	Settings,
	CompVariant,
	Change,
	ManifestUtils,
	sinon
) {
	"use strict";

	var sandbox = sinon.sandbox.create();

	QUnit.module("SmartVariantManagementWriteAPI", {
		afterEach: function() {
			delete Settings._instance;
			delete Settings._oLoadSettingsPromise;
			sandbox.restore();
		}
	}, function() {
		[{
			apiFunctionName: "add",
			compVariantStateFunctionName: "add",
			mockedResponse: {
				getId: function () {
					return "id_123";
				}
			},
			expectedResponse: "id_123"
		}, {
			apiFunctionName: "addVariant",
			compVariantStateFunctionName: "add",
			expectedSpecificData: {
				isVariant: true
			}
		}, {
			apiFunctionName: "save",
			compVariantStateFunctionName: "persist"
		}, {
			apiFunctionName: "setDefaultVariantId",
			compVariantStateFunctionName: "setDefault"
		}, {
			apiFunctionName: "setExecuteOnSelection",
			compVariantStateFunctionName: "setExecuteOnSelection"
		}].forEach(function(testData) {
			QUnit.test("When " + testData.apiFunctionName + " is called", function (assert) {
				// mock control
				var sPersistencyKey = "thePersistencyKey";
				var mPropertyBag = {
					control: {
						getPersistencyKey: function () {
							return sPersistencyKey;
						}
					},
					changeSpecificData: {},
					command: "myCommand"
				};

				var oMockResponse = testData.mockedResponse || {};
				var oCompVariantStateStub = sandbox.stub(CompVariantState, testData.compVariantStateFunctionName).returns(oMockResponse);
				var sReference = "the.app.id";
				var oGetFlexReferenceForControlStub = sandbox.stub(ManifestUtils, "getFlexReferenceForControl").returns(sReference);

				var oResponse = SmartVariantManagementWriteAPI[testData.apiFunctionName](mPropertyBag);
				assert.equal(oGetFlexReferenceForControlStub.getCall(0).args[0], mPropertyBag.control, "then the reference was requested for the passed control,");
				assert.equal(oResponse, testData.expectedResponse || oMockResponse, "the response was passed to the caller,");
				assert.equal(oCompVariantStateStub.callCount, 1, "the CompVariantState function was called once,");
				var oCompVariantStateFunctionArguments = oCompVariantStateStub.getCall(0).args[0];
				assert.equal(oCompVariantStateFunctionArguments, mPropertyBag, "the propertyBag was passed,");
				assert.equal(oCompVariantStateFunctionArguments.reference, sReference, "the reference was added,");
				assert.equal(oCompVariantStateFunctionArguments.persistencyKey, sPersistencyKey, "and the reference was added");
				if (testData.expectedSpecificData) {
					assert.deepEqual(oCompVariantStateFunctionArguments.changeSpecificData, testData.expectedSpecificData, "and the specific data was set");
				}
			});
		});

		QUnit.test("when removeVariant is called", function (assert) {
			var mPropertyBag = {};
			var sReference = "the.app.id";
			var oGetFlexReferenceForControlStub = sandbox.stub(ManifestUtils, "getFlexReferenceForControl").returns(sReference);
			var oCompVariantStateRemoveVariantStub = sandbox.stub(CompVariantState, "removeVariant").resolves();

			return SmartVariantManagementWriteAPI.removeVariant(mPropertyBag).then(function () {
				assert.equal(oGetFlexReferenceForControlStub.getCall(0).args[0], mPropertyBag.control, "then the reference was requested for the passed control,");
				assert.equal(oCompVariantStateRemoveVariantStub.callCount, 1, "then the CompVariantState.removeVariant was called");
				assert.equal(oCompVariantStateRemoveVariantStub.getCall(0).args[0], mPropertyBag, "and the propertyBag was passed");
			});
		});

		QUnit.test("When updateVariant is called, but the variant does not belong to sap.ui.fl", function (assert) {
			sandbox.stub(InitialStorage, "loadFlexData").resolves({
				changes: [],
				comp: {
					variants: [],
					changes: [],
					standardVariants: [],
					defaultVariants: []
				}
			});

			return FlexState.clearAndInitialize({
				reference: "an.app",
				componentId: "__component0",
				manifest: {},
				componentData: {}
			}).then(function () {
				assert.throws(SmartVariantManagementWriteAPI.updateVariant.bind(undefined, {
					favorite: true,
					reference: "an.app"
				}),
				/Variant to be modified is not persisted via sap.ui.fl./,
				"then it throws an error");
			});
		});

		var sPersistencyKey = "someKey";

		[{
			details: "a new name for a variant",
			propertyBag: {
				id: "test_variant",
				name: "a new name"
			},
			mockedVariant: {
				fileName: "test_variant",
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
				executeOnSelection: false
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
				favorite: false
			}
		}, {
			details: "a new executeOnSelection flag",
			propertyBag: {
				id: "test_variant",
				executeOnSelect: true
			},
			mockedVariant: {
				fileName: "test_variant",
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
					someOld: "content",
					executeOnSelection: true
				},
				executeOnSelection: true,
				favorite: false
			}
		}, {
			details: "a new favorite flag",
			propertyBag: {
				id: "test_variant",
				favorite: true
			},
			mockedVariant: {
				fileName: "test_variant",
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
					someOld: "content",
					favorite: true
				},
				executeOnSelection: false,
				favorite: true
			}
		}, {
			details: "a new executeOnSelect flag overwriting an old one",
			propertyBag: {
				id: "test_variant",
				executeOnSelect: true
			},
			mockedVariant: {
				fileName: "test_variant",
				selector: {
					persistencyKey: sPersistencyKey
				},
				content: {
					someOld: "content",
					executeOnSelection: false
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
					someOld: "content",
					executeOnSelection: true
				},
				executeOnSelection: true,
				favorite: false
			}
		}, {
			details: "a new favorite flag overwriting an old one",
			propertyBag: {
				id: "test_variant",
				favorite: true
			},
			mockedVariant: {
				fileName: "test_variant",
				selector: {
					persistencyKey: sPersistencyKey
				},
				content: {
					someOld: "content",
					favorite: false
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
					someOld: "content",
					favorite: true
				},
				executeOnSelection: false,
				favorite: true
			}
		}, {
			details: "a new content and existing flags for executeOnSelect and favorite",
			propertyBag: {
				id: "test_variant",
				content: {
					someProperty: "someValue"
				}
			},
			mockedVariant: {
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
			},
			expected: {
				name: "",
				content: {
					someProperty: "someValue",
					executeOnSelection: true,
					favorite: false
				},
				executeOnSelection: true,
				favorite: false
			}
		}].forEach(function (testData) {
			QUnit.test("When updateVariant is called with " + testData.details, function (assert) {
				var sReference = "an.app";
				testData.propertyBag.reference = sReference;
				testData.propertyBag.persistencyKey = sPersistencyKey;
				sandbox.stub(InitialStorage, "loadFlexData").resolves({
					changes: [],
					comp: {
						variants: [testData.mockedVariant],
						changes: [],
						standardVariants: [],
						defaultVariants: []
					}
				});

				return FlexState.clearAndInitialize({
					reference: sReference,
					componentId: "__component0",
					manifest: {},
					componentData: {}
				}).then(function () {
					SmartVariantManagementWriteAPI.updateVariant(testData.propertyBag);

					var oVariant = FlexState.getCompEntitiesByIdMap(sReference)[testData.propertyBag.id];

					assert.equal(oVariant.getText("variantName"), testData.expected.name, "the name is correct");
					assert.deepEqual(oVariant.getContent(), testData.expected.content, "the content is correct");
					assert.equal(oVariant.getFavorite(), testData.expected.favorite, "the favorite flag is correct");
					assert.equal(oVariant.getExecuteOnSelection(), testData.expected.executeOnSelection, "the executeOnSelection flag is correct");
					assert.equal(oVariant.getState(), Change.states.DIRTY, "the variant is marked for an update");
				});
			});
		});

		QUnit.test("When isVariantSharingEnabled() is called it calls the Settings instance and returns true", function (assert) {
			var oSetting = {
				isKeyUser: true,
				isAtoAvailable: true,
				isVariantSharingEnabled: true
			};

			sandbox.stub(WriteStorage, "loadFeatures").resolves(oSetting);

			var isVariantSharingEnabledSpy = sandbox.spy(SmartVariantManagementWriteAPI, "isVariantSharingEnabled");
			return SmartVariantManagementWriteAPI.isVariantSharingEnabled().then(function (bFlag) {
				assert.equal(bFlag, true, "the true flag is returned");
				assert.equal(isVariantSharingEnabledSpy.callCount, 1, "called once");
			});
		});

		QUnit.test("When isVariantSharingEnabled() is called it calls the Settings instance and returns false", function (assert) {
			var oSetting = {
				isKeyUser: false,
				isAtoAvailable: true,
				isVariantSharingEnabled: false
			};

			sandbox.stub(WriteStorage, "loadFeatures").resolves(oSetting);

			var isVariantSharingEnabledSpy = sandbox.spy(SmartVariantManagementWriteAPI, "isVariantSharingEnabled");
			return SmartVariantManagementWriteAPI.isVariantSharingEnabled().then(function (bFlag) {
				assert.equal(bFlag, false, "the false flag is returned");
				assert.equal(isVariantSharingEnabledSpy.callCount, 1, "called once");
			});
		});

		QUnit.test("When isVariantPersonalizationEnabled() is called it calls the Settings instance and returns true", function (assert) {
			var oSetting = {
				isVariantPersonalizationEnabled: true
			};

			sandbox.stub(WriteStorage, "loadFeatures").resolves(oSetting);

			var isVariantPersonalizationEnabledSpy = sandbox.spy(SmartVariantManagementWriteAPI, "isVariantPersonalizationEnabled");
			return SmartVariantManagementWriteAPI.isVariantPersonalizationEnabled().then(function (bFlag) {
				assert.equal(bFlag, true, "the true flag is returned");
				assert.equal(isVariantPersonalizationEnabledSpy.callCount, 1, "called once");
			});
		});

		QUnit.test("When isVariantPersonalizationEnabled() is called it calls the Settings instance and returns false", function (assert) {
			var oSetting = {
				isVariantPersonalizationEnabled: false
			};

			sandbox.stub(WriteStorage, "loadFeatures").resolves(oSetting);

			var isVariantPersonalizationEnabledSpy = sandbox.spy(SmartVariantManagementWriteAPI, "isVariantPersonalizationEnabled");
			return SmartVariantManagementWriteAPI.isVariantPersonalizationEnabled().then(function (bFlag) {
				assert.equal(bFlag, false, "the false flag is returned");
				assert.equal(isVariantPersonalizationEnabledSpy.callCount, 1, "called once");
			});
		});
	});

	QUnit.module("revert", {
		before: function() {
		},
		afterEach: function() {
		},
		after: function () {
		}
	}, function() {
		QUnit.test("Given a variant was removed", function(assert) {
			var sReference = "an.app";
			var sPersistencyKey = "persistency.key";
			sandbox.stub(InitialStorage, "loadFlexData").resolves({
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

			return FlexState.clearAndInitialize({
				reference: sReference,
				componentId: "__component0",
				manifest: {},
				componentData: {}
			}).then(function () {
				return SmartVariantManagementWriteAPI.removeVariant({
					reference: sReference,
					persistencyKey: sPersistencyKey,
					id: "test_variant"
				});
			}).then(function (oRemovedVariant) {
				assert.equal(oRemovedVariant.getState(), Change.states.DELETED, "the variant is flagged for deletion");
				var aRevertData = oRemovedVariant.getRevertInfo();
				assert.equal(aRevertData.length, 1, "revertData was stored");
				var oLastRevertData = aRevertData[0];
				assert.equal(oLastRevertData.getType(), CompVariantState.operationType.StateUpdate, "it is stored that the state was updated ...");
				assert.deepEqual(oLastRevertData.getContent(), {previousState: Change.states.PERSISTED}, "... to PERSISTED");

				SmartVariantManagementWriteAPI.revert({
					reference: sReference,
					persistencyKey: sPersistencyKey,
					id: "test_variant"
				});

				aRevertData = oRemovedVariant.getRevertInfo();
				assert.equal(aRevertData.length, 0, "after a revert... the revert data is no longer available");
				assert.equal(oRemovedVariant.getState(), Change.states.PERSISTED, "and the change is flagged as new");
			});
		});
	});

	QUnit.done(function () {
		jQuery('#qunit-fixture').hide();
	});
});