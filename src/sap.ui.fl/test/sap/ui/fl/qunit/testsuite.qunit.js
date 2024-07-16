sap.ui.define([
	"sap/base/util/merge",
	"sap/base/Log"
], function(
	merge,
	Log
) {
	"use strict";

	var mConfig = {
		name: "sap.ui.fl",
		defaults: {
			group: "Default",
			qunit: {
				version: 2
			},
			sinon: false,
			ui5: {
				language: "en",
				libs: ["sap.ui.fl", "sap.ui.core", "sap.m"],
				"xx-waitForTheme": true
			},
			coverage: {
				only: ["sap/ui/fl"],
				branchTracking: true
			},
			page: "test-resources/sap/ui/fl/qunit/testsandbox.qunit.html?test={name}",
			autostart: true
		},
		tests: {
			"initial/_internal/changeHandlers/ChangeHandlerRegistration": {
				group: "Initial Internal",
				coverage: {
					only: ["sap/ui/fl/initial/_internal/changeHandlers/ChangeHandlerRegistration"]
				}
			},

			"initial/_internal/changeHandlers/ChangeHandlerStorage": {
				group: "Initial Internal",
				coverage: {
					only: [
						"sap/ui/fl/initial/_internal/changeHandlers/ChangeHandlerStorage"
					]
				},
				ui5: {
					resourceroots: {
						"sap/ui/fl/test/registry": "test-resources/sap/ui/fl/qunit/testResources"
					}
				}
			},

			"initial/_internal/connectors/StaticFileConnector": {
				group: "Initial Internal",
				coverage: {
					only: [
						"sap/ui/fl/initial/_internal/connectors/StaticFileConnector"
					]
				},
				ui5: {
					flexibilityServices: '[{"connector": "StaticFileConnector", "layers": []}]'
				}
			},

			"initial/_internal/connectors/LrepConnector": {
				group: "Initial Internal",
				coverage: {
					only: [
						"sap/ui/fl/initial/_internal/connectors/LrepConnector",
						"sap/ui/fl/initial/_internal/connectors/Utils"
					]
				}
			},

			"initial/_internal/connectors/NeoLrepConnector": {
				group: "Initial Internal",
				coverage: {
					only: ["sap/ui/fl/initial/_internal/connectors/NeoLrepConnector"]
				}
			},

			"initial/_internal/connectors/PersonalizationConnector": {
				group: "Initial Internal",
				coverage: {
					only: ["sap/ui/fl/initial/_internal/connectors/PersonalizationConnector"]
				}
			},

			"initial/_internal/connectors/KeyUserConnector": {
				group: "Initial Internal",
				coverage: {
					only: ["sap/ui/fl/initial/_internal/connectors/KeyUserConnector"]
				}
			},

			"initial/_internal/connectors/Utils": {
				group: "Initial Internal",
				coverage: {
					only: ["sap/ui/fl/initial/_internal/connectors/Utils"]
				}
			},

			"initial/_internal/Storage": {
				group: "Initial Internal",
				ui5: {
					resourceroots: {
						"my.connectors": "./test-resources/sap/ui/fl/qunit/testConnectors/",
						"test.app": "./test-resources/sap/ui/fl/qunit/testResources/"
					},
					flexibilityServices: '[{"connector": "JsObjectConnector", "layers": ["ALL"]},'
						+ '{"connector": "LrepConnector", "layers": ["ALL"], "url": "someURL"}]'
				},
				coverage: {
					only: ["sap/ui/fl/initial/_internal/Storage"]
				}
			},

			"initial/_internal/StorageFeaturesMerger": {
				group: "Initial Internal",
				coverage: {
					only: ["sap/ui/fl/initial/_internal/StorageFeaturesMerger"]
				}
			},

			"initial/_internal/FlexConfiguration": {
				group: "Initial Internal",
				coverage: {
					only: ["sap/ui/fl/initial/_internal/FlexConfiguration"]
				}
			},

			"initial/_internal/StorageUtils": {
				group: "Initial Internal",
				coverage: {
					only: ["sap/ui/fl/initial/_internal/StorageUtils"]
				}
			},

			"initial/_internal/storageResultDisassemble": {
				group: "Initial Internal",
				coverage: {
					only: ["sap/ui/fl/initial/_internal/storageResultDisassemble"]
				}
			},

			"apply/api/FlexRuntimeInfoAPI": {
				group: "Apply API",
				coverage: {
					only: ["sap/ui/fl/apply/api/FlexRuntimeInfoAPI"]
				}
			},

			"apply/api/ControlVariantApplyAPI": {
				group: "Apply API",
				coverage: {
					only: ["sap/ui/fl/apply/api/ControlVariantApplyAPI"]
				}
			},

			"apply/api/DelegateMediatorAPI": {
				group: "Apply API",
				coverage: {
					only: [
						"sap/ui/fl/apply/api/DelegateMediatorAPI",
						"sap/ui/fl/apply/_internal/DelegateMediator"
					]
				}
			},

			"apply/api/SmartVariantManagementApplyAPI": {
				group: "Apply API",
				coverage: {
					only: ["sap/ui/fl/apply/api/SmartVariantManagementApplyAPI"]
				}
			},

			"apply/api/UI2PersonalizationApplyAPI": {
				group: "Apply API",
				coverage: {
					only: ["sap/ui/fl/apply/api/UI2PersonalizationApplyAPI"]
				}
			},

			"apply/api/ExtensionPointRegistryAPI": {
				group: "Apply API",
				coverage: {
					only: ["sap/ui/fl/apply/api/ExtensionPointRegistryAPI"]
				}
			},

			"apply/_internal/extensionPoint/Registry": {
				group: "Apply Internal",
				coverage: {
					only: ["sap/ui/fl/apply/_internal/extensionPoint/Registry"]
				},
				ui5: {
					resourceroots: {
						testComponent: "test-resources/sap/ui/fl/qunit/testComponent",
						"sap/ui/fl/qunit/extensionPoint": "test-resources/sap/ui/fl/qunit/apply/_internal/extensionPoint"
					}
				}
			},

			"apply/_internal/changes/Applier": {
				group: "Apply Internal",
				coverage: {
					only: ["sap/ui/fl/apply/_internal/changes/Applier"]
				}
			},

			"apply/_internal/changes/FlexCustomData": {
				group: "Apply Internal",
				coverage: {
					only: ["sap/ui/fl/apply/_internal/changes/FlexCustomData"]
				}
			},

			"apply/_internal/changes/Utils": {
				group: "Apply Internal",
				coverage: {
					only: ["sap/ui/fl/apply/_internal/changes/Utils"]
				}
			},

			"apply/_internal/changes/Reverter": {
				group: "Apply Internal",
				coverage: {
					only: ["sap/ui/fl/apply/_internal/changes/Reverter"]
				}
			},

			"apply/_internal/changes/descriptor/ui5/AddLibrary": {
				group: "Apply Internal - Descriptor Change Merger",
				coverage: {
					only: ["sap/ui/fl/apply/_internal/changes/descriptor/ui5/AddLibrary"]
				}
			},

			"apply/_internal/changes/descriptor/ui5/AddNewModel": {
				group: "Apply Internal - Descriptor Change Merger",
				coverage: {
					only: ["sap/ui/fl/apply/_internal/changes/descriptor/ui5/AddNewModel"]
				}
			},

			"apply/_internal/changes/descriptor/app/AddAnnotationsToOData": {
				group: "Apply Internal - Descriptor Change Merger",
				coverage: {
					only: ["sap/ui/fl/apply/_internal/changes/descriptor/app/AddAnnotationsToOData"]
				}
			},

			"apply/_internal/changes/descriptor/app/RemoveAllInboundsExceptOne": {
				group: "Apply Internal - Descriptor Change Merger",
				coverage: {
					only: ["sap/ui/fl/apply/_internal/changes/descriptor/app/RemoveAllInboundsExceptOne"]
				}
			},

			"apply/_internal/changes/descriptor/app/ChangeInbound": {
				group: "Apply Internal - Descriptor Change Merger",
				coverage: {
					only: [
						"sap/ui/fl/apply/_internal/changes/descriptor/app/ChangeInbound",
						"sap/ui/fl/util/DescriptorChangeCheck",
						"sap/ui/fl/util/changePropertyValueByPath"
					]
				}
			},

			"apply/_internal/changes/descriptor/app/AddNewInbound": {
				group: "Apply Internal - Descriptor Change Merger",
				coverage: {
					only: ["sap/ui/fl/apply/_internal/changes/descriptor/app/AddNewInbound", "sap/ui/fl/util/DescriptorChangeCheck"]
				}
			},

			"apply/_internal/changes/descriptor/ui5/SetMinUI5Version": {
				group: "Apply Internal - Descriptor Change Merger",
				coverage: {
					only: ["sap/ui/fl/apply/_internal/changes/descriptor/ui5/SetMinUI5Version"]
				}
			},

			"apply/_internal/changes/descriptor/ui5/AddNewModelEnhanceWith": {
				group: "Apply Internal - Descriptor Change Merger",
				coverage: {
					only: ["sap/ui/fl/apply/_internal/changes/descriptor/ui5/AddNewModelEnhanceWith"]
				}
			},

			"apply/_internal/changes/descriptor/ui5/AddComponentUsages": {
				group: "Apply Internal - Descriptor Change Merger",
				coverage: {
					only: ["sap/ui/fl/apply/_internal/changes/descriptor/ui5/AddComponentUsages"]
				}
			},

			"apply/_internal/changes/descriptor/app/ChangeDataSource": {
				group: "Apply Internal - Descriptor Change Merger",
				coverage: {
					only: [
						"sap/ui/fl/apply/_internal/changes/descriptor/app/ChangeDataSource",
						"sap/ui/fl/util/DescriptorChangeCheck",
						"sap/ui/fl/util/changePropertyValueByPath"
					]
				}
			},

			"apply/_internal/changes/descriptor/app/SetAch": {
				group: "Apply Internal - Descriptor Change Merger",
				coverage: {
					only: ["sap/ui/fl/apply/_internal/changes/descriptor/app/SetAch"]
				}
			},

			"apply/_internal/changes/descriptor/app/SetTitle": {
				group: "Apply Internal - Descriptor Change Merger",
				coverage: {
					only: ["sap/ui/fl/apply/_internal/changes/descriptor/app/SetTitle"]
				}
			},

			"apply/_internal/changes/descriptor/fiori/SetRegistrationIds": {
				group: "Apply Internal - Descriptor Change Merger",
				coverage: {
					only: ["sap/ui/fl/apply/_internal/changes/descriptor/fiori/SetRegistrationIds"]
				}
			},

			"apply/_internal/changes/descriptor/ui5/SetFlexExtensionPointEnabled": {
				group: "Apply Internal - Descriptor Change Merger",
				coverage: {
					only: ["sap/ui/fl/apply/_internal/changes/descriptor/ui5/SetFlexExtensionPointEnabled"]
				}
			},

			"apply/_internal/changes/descriptor/fiori/SetAbstract": {
				group: "Apply Internal - Descriptor Change Merger",
				coverage: {
					only: ["sap/ui/fl/apply/_internal/changes/descriptor/fiori/SetAbstract"]
				}
			},

			"apply/_internal/changes/descriptor/fiori/SetCloudDevAdaptationStatus": {
				group: "Apply Internal - Descriptor Change Merger",
				coverage: {
					only: ["sap/ui/fl/apply/_internal/changes/descriptor/fiori/SetCloudDevAdaptationStatus"]
				}
			},

			"apply/_internal/changes/descriptor/Preprocessor": {
				group: "Apply Internal - Descriptor Change Merger",
				coverage: {
					only: ["sap/ui/fl/apply/_internal/changes/descriptor/Preprocessor"]
				}
			},

			"apply/_internal/changes/descriptor/Applier": {
				group: "Apply Internal - Descriptor Change Merger",
				coverage: {
					only: ["sap/ui/fl/apply/_internal/changes/descriptor/Applier"]
				}
			},

			"apply/_internal/changes/descriptor/ApplyStrategyFactory": {
				group: "Apply Internal - Descriptor Change Merger",
				coverage: {
					only: ["sap/ui/fl/apply/_internal/changes/descriptor/ApplyStrategyFactory"]
				}
			},

			"apply/_internal/changes/descriptor/ApplyUtil": {
				group: "Apply Internal - Descriptor Change Merger",
				coverage: {
					only: ["sap/ui/fl/apply/_internal/changes/descriptor/ApplyUtil"]
				}
			},

			"util/DescriptorChangeCheck": {
				group: "Util - DescriptorChangeCheck",
				coverage: {
					only: ["sap/ui/fl/util/DescriptorChangeCheck"]
				}
			},

			"apply/_internal/connectors/ObjectStorageUtils": {
				group: "Apply Internal",
				coverage: {
					only: ["sap/ui/fl/apply/_internal/connectors/ObjectStorageUtils"]
				}
			},

			"apply/_internal/controlVariants/URLHandler": {
				group: "Apply Internal",
				coverage: {
					only: ["sap/ui/fl/apply/_internal/controlVariants/URLHandler"]
				}
			},

			"apply/_internal/controlVariants/Utils": {
				group: "Apply Internal",
				coverage: {
					only: ["sap/ui/fl/apply/_internal/controlVariants/Utils"]
				}
			},

			"apply/_internal/flexObjects/AppDescriptorChange": {
				group: "Apply Internal",
				coverage: {
					only: ["sap/ui/fl/apply/_internal/flexObjects/AppDescriptorChange"]
				}
			},

			"apply/_internal/flexObjects/CompVariant": {
				group: "Apply Internal",
				coverage: {
					only: ["sap/ui/fl/apply/_internal/flexObjects/CompVariant"]
				},
				ui5: {
					resourceroots: {
						"sap/ui/fl/qunit": "test-resources/sap/ui/fl/qunit/"
					}
				}
			},

			"apply/_internal/flexObjects/ControllerExtensionChange": {
				group: "Apply Internal",
				coverage: {
					only: ["sap/ui/fl/apply/_internal/flexObjects/ControllerExtensionChange"]
				}
			},

			"apply/_internal/flexObjects/FlexObject": {
				group: "Apply Internal",
				coverage: {
					only: ["sap/ui/fl/apply/_internal/flexObjects/FlexObject.js"]
				}
			},

			"apply/_internal/flexObjects/FlexObjectFactory": {
				group: "Apply Internal",
				coverage: {
					only: ["sap/ui/fl/apply/_internal/flexObjects/FlexObjectFactory"]
				}
			},

			"apply/_internal/flexObjects/FlVariant": {
				group: "Apply Internal",
				coverage: {
					only: ["sap/ui/fl/apply/_internal/flexObjects/FlVariant"]
				}
			},

			"apply/_internal/flexObjects/getVariantAuthor": {
				group: "Apply Internal",
				coverage: {
					only: ["sap/ui/fl/apply/_internal/flexObjects/getVariantAuthor"]
				}
			},

			"apply/_internal/flexObjects/UIChange": {
				group: "Apply Internal",
				coverage: {
					only: ["sap/ui/fl/apply/_internal/flexObjects/UIChange"]
				}
			},

			"apply/_internal/flexObjects/Variant": {
				group: "Apply Internal",
				coverage: {
					only: ["sap/ui/fl/apply/_internal/flexObjects/Variant"]
				},
				ui5: {
					resourceroots: {
						"sap/ui/fl/qunit": "test-resources/sap/ui/fl/qunit/"
					}
				}
			},

			"apply/_internal/flexState/changes/DependencyHandler": {
				group: "Apply Internal",
				coverage: {
					only: ["sap/ui/fl/apply/_internal/flexState/changes/DependencyHandler"]
				}
			},

			"apply/_internal/flexState/changes/ExtensionPointState": {
				group: "Apply Internal",
				coverage: {
					only: ["sap/ui/fl/apply/_internal/flexState/changes/ExtensionPointState"]
				}
			},

			"apply/_internal/flexState/changes/UIChangesState": {
				group: "Apply Internal",
				coverage: {
					only: ["sap/ui/fl/apply/_internal/flexState/changes/UIChangesState"]
				}
			},

			"apply/_internal/flexState/controlVariants/VariantManagementState": {
				group: "Apply Internal",
				coverage: {
					only: [
						"sap/ui/fl/apply/_internal/flexState/controlVariants/VariantManagementState",
						"sap/ui/fl/apply/_internal/flexState/InitialPrepareFunctions"
					]
				},
				ui5: {
					resourceroots: {
						"rta/qunit": "test-resources/sap/ui/rta/qunit/"
					}
				}
			},

			"apply/_internal/flexState/controlVariants/Switcher": {
				group: "Apply Internal",
				coverage: {
					only: ["sap/ui/fl/apply/_internal/flexState/controlVariants/Switcher"]
				}
			},

			"apply/_internal/flexState/UI2Personalization/UI2PersonalizationState": {
				group: "Apply Internal",
				coverage: {
					only: ["sap/ui/fl/apply/_internal/flexState/UI2Personalization/UI2PersonalizationState"]
				}
			},

			"apply/_internal/flexState/FlexObjectState": {
				group: "Apply Internal",
				coverage: {
					only: ["sap/ui/fl/apply/_internal/flexState/FlexObjectState"]
				},
				ui5: {
					flexibilityServices: '[{"connector": "SessionStorageConnector"}]'
				}
			},

			"apply/_internal/flexState/FlexState": {
				group: "Apply Internal",
				coverage: {
					only: ["sap/ui/fl/apply/_internal/flexState/FlexState"]
				}
			},

			"apply/_internal/flexState/DataSelector": {
				group: "Apply Internal",
				coverage: {
					only: ["sap/ui/fl/apply/_internal/flexState/DataSelector"]
				}
			},

			"apply/_internal/flexState/Loader": {
				group: "Apply Internal",
				coverage: {
					only: ["sap/ui/fl/apply/_internal/flexState/Loader"]
				}
			},

			"apply/_internal/flexState/ManifestUtils": {
				group: "Apply Internal",
				coverage: {
					only: ["sap/ui/fl/apply/_internal/flexState/ManifestUtils"]
				}
			},

			"apply/_internal/flexState/compVariants/prepareCompVariantsMap": {
				group: "Apply Internal",
				coverage: {
					only: ["sap/ui/fl/apply/_internal/flexState/compVariants/prepareCompVariantsMap"]
				}
			},

			"apply/_internal/flexState/compVariants/Utils": {
				group: "Apply Internal",
				coverage: {
					only: ["sap/ui/fl/apply/_internal/flexState/compVariants/Utils"]
				}
			},

			"apply/_internal/preprocessors/ControllerExtension": {
				group: "Apply Internal",
				coverage: {
					only: ["sap/ui/fl/apply/_internal/preprocessors/ControllerExtension"]
				},
				ui5: {
					resourceroots: {
						"sap.ui.fl.ControllerExtension.testResources": "test-resources/sap/ui/fl/qunit/testResources"
					}
				}
			},

			"apply/_internal/preprocessors/ComponentLifecycleHooks": {
				group: "Apply Internal",
				coverage: {
					only: ["sap/ui/fl/apply/_internal/preprocessors/ComponentLifecycleHooks"]
				},
				ui5: {
					resourceroots: {
						"rta/qunit": "test-resources/sap/ui/rta/qunit/"
					}
				}
			},

			"apply/_internal/preprocessors/RegistrationDelegator": {
				group: "Apply Internal",
				coverage: {
					only: ["sap/ui/fl/apply/_internal/preprocessors/RegistrationDelegator"]
				},
				ui5: {
					libs: [] // The fl library is being loaded inside the test
				}
			},

			"apply/_internal/preprocessors/XmlPreprocessor": {
				group: "Apply Internal",
				coverage: {
					only: ["sap/ui/fl/apply/_internal/preprocessors/XmlPreprocessor"]
				}
			},

			"apply/_internal/extensionPoint/Processor": {
				group: "Apply Internal",
				coverage: {
					only: ["sap/ui/fl/apply/_internal/extensionPoint/Processor"]
				},
				ui5: {
					resourceroots: {
						"sap/ui/fl/qunit/extensionPoint": "test-resources/sap/ui/fl/qunit/apply/_internal/extensionPoint"
					},
					"xx-suppressDeactivationOfControllerCode": true,
					"xx-designMode": true
				}
			},

			"write/api/AppVariantWriteAPI": {
				group: "Write API",
				coverage: {
					only: ["sap/ui/fl/write/api/AppVariantWriteAPI"]
				}
			},

			"write/api/ChangesWriteAPI": {
				group: "Write API",
				coverage: {
					only: ["sap/ui/fl/write/api/ChangesWriteAPI"]
				}
			},

			"write/api/ContextBasedAdaptationsAPI": {
				group: "Write API",
				coverage: {
					only: ["sap/ui/fl/write/api/ContextBasedAdaptationsAPI"]
				}
			},

			"write/api/ContextSharingAPI": {
				group: "Write API",
				coverage: {
					only: ["sap/ui/fl/write/api/ContextSharingAPI"]
				}
			},

			"write/api/ControlPersonalizationWriteAPI": {
				group: "Write API",
				coverage: {
					only: ["sap/ui/fl/write/api/ControlPersonalizationWriteAPI"]
				},
				ui5: {
					flexibilityServices: '[{"connector": "SessionStorageConnector"}]'
				}
			},

			"write/api/FeaturesAPI": {
				group: "Write API",
				coverage: {
					only: ["sap/ui/fl/write/api/FeaturesAPI"]
				}
			},

			"write/api/FieldExtensibility": {
				group: "Write API",
				coverage: {
					only: ["sap/ui/fl/write/api/FieldExtensibility"]
				}
			},

			"write/api/PersistenceWriteAPI": {
				group: "Write API",
				coverage: {
					only: ["sap/ui/fl/write/api/PersistenceWriteAPI"]
				}
			},

			"write/api/ReloadInfoAPI": {
				group: "Write API",
				coverage: {
					only: ["sap/ui/fl/write/api/ReloadInfoAPI"]
				}
			},

			"write/api/TranslationAPI": {
				group: "Write API",
				coverage: {
					only: ["sap/ui/fl/write/api/TranslationAPI"]
				}
			},

			"write/api/SmartBusinessWriteAPI": {
				group: "Write API",
				coverage: {
					only: ["sap/ui/fl/write/api/SmartBusinessWriteAPI"]
				}
			},

			"write/api/SACIntegrationUpdateVariant": {
				group: "Write API",
				coverage: {
					only: ["sap/ui/fl/write/api/SACIntegrationUpdateVariant"]
				},
				ui5: {
					flexibilityServices: '[{"connector": "JsObjectConnector"}]'
				}
			},

			"write/api/SmartVariantManagementWriteAPI": {
				group: "Write API",
				coverage: {
					only: ["sap/ui/fl/write/api/SmartVariantManagementWriteAPI"]
				}
			},

			"write/api/UI2PersonalizationWriteAPI": {
				group: "Write API",
				coverage: {
					only: ["sap/ui/fl/write/api/UI2PersonalizationWriteAPI"]
				}
			},

			"write/api/VersionsAPI": {
				group: "Write API",
				coverage: {
					only: ["sap/ui/fl/write/api/VersionsAPI"]
				}
			},

			"write/api/LocalResetAPI": {
				group: "Write API",
				coverage: {
					only: ["sap/ui/fl/write/api/LocalResetAPI"]
				}
			},

			"write/_internal/Storage": {
				group: "Write Internal",
				coverage: {
					only: ["sap/ui/fl/write/_internal/Storage"]
				},
				ui5: {
					resourceroots: {
						"my.connectors": "./test-resources/sap/ui/fl/qunit/testConnectors/"
					}
				}
			},

			"write/_internal/Versions": {
				group: "Write Internal",
				coverage: {
					only: ["sap/ui/fl/write/_internal/Versions"]
				}
			},

			"write/_internal/flexState/FlexObjectState": {
				group: "Write Internal",
				coverage: {
					only: ["sap/ui/fl/write/_internal/flexState/FlexObjectState"]
				},
				ui5: {
					flexibilityServices: '[{"connector": "SessionStorageConnector"}]'
				}
			},

			"write/_internal/flexState/compVariants/CompVariantState": {
				group: "Write Internal",
				coverage: {
					only: ["sap/ui/fl/write/_internal/flexState/compVariants/CompVariantState"]
				}
			},

			"write/_internal/flexState/UI2PersonalizationState/UI2PersonalizationState": {
				group: "Write Internal",
				coverage: {
					only: ["sap/ui/fl/write/_internal/flexState/UI2PersonalizationState/UI2PersonalizationState"]
				}
			},

			"write/_internal/connectors/ObjectPathConnector": {
				group: "Write Internal",
				coverage: {
					only: [
						"sap/ui/fl/write/_internal/connectors/ObjectPathConnector"
					]
				}
			},

			"write/_internal/connectors/BtpServiceConnector": {
				group: "Write Internal",
				coverage: {
					only: [
						"sap/ui/fl/write/_internal/connectors/BtpServiceConnector"
					]
				}
			},

			"write/_internal/connectors/Utils": {
				group: "Write Internal",
				coverage: {
					only: ["sap/ui/fl/write/_internal/connectors/Utils"]
				}
			},

			"write/_internal/connectors/PersonalizationConnector": {
				group: "Write Internal",
				coverage: {
					only: ["sap/ui/fl/write/_internal/connectors/PersonalizationConnector"]
				}
			},

			"write/_internal/connectors/JsObjectConnector": {
				group: "Write Internal",
				coverage: {
					only: [
						"sap/ui/fl/write/_internal/connectors/JsObjectConnector"
					]
				},
				ui5: {
					flexibilityServices: '[{"connector": "JsObjectConnector", "layers": []}]'
				}
			},

			"write/_internal/connectors/LrepConnector": {
				group: "Write Internal",
				coverage: {
					only: [
						"sap/ui/fl/write/_internal/connectors/LrepConnector",
						"sap/ui/fl/write/_internal/connectors/Utils",
						"sap/ui/fl/initial/_internal/connectors/Utils"
					]
				}
			},

			"write/_internal/connectors/KeyUserConnector": {
				group: "Write Internal",
				coverage: {
					only: ["sap/ui/fl/write/_internal/connectors/KeyUserConnector"]
				}
			},

			"write/_internal/connectors/NeoLrepConnector": {
				group: "Write Internal",
				coverage: {
					only: ["sap/ui/fl/write/_internal/connectors/NeoLrepConnector"]
				}
			},

			"write/_internal/delegates/ODataV4ReadDelegate": {
				group: "Write Internal",
				coverage: {
					only: ["sap/ui/fl/write/_internal/delegates/ODataV4ReadDelegate"]
				}
			},

			"write/_internal/delegates/ODataV2ReadDelegate": {
				group: "Write Internal",
				coverage: {
					only: ["sap/ui/fl/write/_internal/delegates/ODataV2ReadDelegate"]
				},
				ui5: {
					resourceroots: {
						"sap.ui.fl.test.delegate": "test-resources/sap/ui/fl/qunit/write/_internal/delegates/testdata"
					},
					language: "en"
				}
			},

			"write/_internal/extensionPoint/Processor": {
				group: "Write Internal",
				coverage: {
					only: ["sap/ui/fl/write/_internal/extensionPoint/Processor"]
				},
				ui5: {
					resourceroots: {
						"sap/ui/fl/qunit/extensionPoint": "test-resources/sap/ui/fl/qunit/apply/_internal/extensionPoint"
					},
					"xx-suppressDeactivationOfControllerCode": true,
					"xx-designMode": true
				}
			},

			"write/_internal/fieldExtensibility/ABAPExtensibilityVariantFactory": {
				group: "Write Internal",
				coverage: {
					only: ["sap/ui/fl/write/_internal/fieldExtensibility/ABAPExtensibilityVariantFactory"]
				}
			},

			"write/_internal/fieldExtensibility/SingleTenantABAPExtensibilityVariant": {
				group: "Write Internal",
				coverage: {
					only: ["sap/ui/fl/write/_internal/fieldExtensibility/SingleTenantABAPExtensibilityVariant"]
				}
			},

			"write/_internal/fieldExtensibility/MultiTenantABAPExtensibilityVariant": {
				group: "Write Internal",
				coverage: {
					only: ["sap/ui/fl/write/_internal/fieldExtensibility/MultiTenantABAPExtensibilityVariant"]
				}
			},

			"write/_internal/fieldExtensibility/UriParser": {
				group: "Write Internal",
				coverage: {
					only: ["sap/ui/fl/write/_internal/fieldExtensibility/UriParser"]
				}
			},

			"write/_internal/fieldExtensibility/Utils": {
				group: "Write Internal",
				coverage: {
					only: ["sap/ui/fl/write/_internal/fieldExtensibility/Utils"]
				}
			},

			"write/_internal/fieldExtensibility/ServiceValidation": {
				group: "Write Internal",
				coverage: {
					only: ["sap/ui/fl/write/_internal/fieldExtensibility/ServiceValidation"]
				}
			},

			"write/_internal/fieldExtensibility/cap/dialog/CustomFieldCAPDialog": {
				group: "Write Internal",
				coverage: {
					only: ["sap/ui/fl/write/_internal/fieldExtensibility/cap/dialog/CustomFieldCAPDialog"]
				}
			},

			"write/_internal/appVariant/AppVariantFactory": {
				group: "Internal app variant related APIs",
				coverage: {
					only: [
						"sap/ui/fl/write/_internal/appVariant/AppVariantFactory",
						"sap/ui/fl/write/_internal/appVariant/AppVariant"
					]
				}
			},

			"write/_internal/appVariant/AppVariantInlineChangeFactory": {
				group: "Internal app variant inline change related APIs",
				coverage: {
					only: [
						"sap/ui/fl/write/_internal/appVariant/AppVariantInlineChangeFactory",
						"sap/ui/fl/apply/_internal/appVariant/DescriptorChangeTypes",
						"sap/ui/fl/write/_internal/appVariant/AppVariantInlineChange"
					]
				}
			},

			"write/api/connectors/FileListBaseConnector": {
				group: "Write API conntectors",
				coverage: {
					only: ["sap/ui/fl/write/api/connectors/FileListBaseConnector"]
				}
			},

			"descriptorRelated/Utils": {
				group: "Descriptor related Utils",
				coverage: {
					only: ["sap/ui/fl/descriptorRelated/Utils"]
				}
			},

			// Team 42 tests:
			ChangePersistence: {
				coverage: {
					only: ["sap/ui/fl/ChangePersistence"]
				},
				ui5: {
					resourceroots: {
						"sap/ui/fl/qunit/integration": "test-resources/sap/ui/fl/qunit/integration"
					}
				}
			},

			ChangePersistenceFactory: {
				coverage: {
					only: ["sap/ui/fl/ChangePersistenceFactory"]
				}
			},

			FlexController: {
				coverage: {
					only: ["sap/ui/fl/FlexController"]
				},
				ui5: {
					resourceroots: {
						testComponent: "test-resources/sap/ui/fl/qunit/testComponent"
					}
				}
			},

			FlexControllerFactory: {
				coverage: {
					only: ["sap/ui/fl/FlexControllerFactory"]
				}
			},

			"util/ManagedObjectModel": {
				coverage: {
					only: ["sap/ui/fl/util/ManagedObjectModel"]
				}
			},

			"util/IFrame": {
				group: "IFrame control",
				coverage: {
					only: ["sap/ui/fl/util/IFrame"]
				}
			},

			"util/resolveBinding": {
				coverage: {
					only: ["sap/ui/fl/util/resolveBinding"]
				}
			},

			// ChangeHandler tests:
			"changeHandler/AddIFrame": {
				group: "ChangeHandler",
				coverage: {
					only: ["sap/ui/fl/changeHandler/AddIFrame"]
				},
				ui5: {
					resourceroots: {
						testComponentAsync: "test-resources/sap/ui/fl/qunit/testComponentAsync"
					}
				}
			},

			"changeHandler/AddXML": {
				group: "ChangeHandler",
				coverage: {
					only: ["sap/ui/fl/changeHandler/AddXML"]
				},
				ui5: {
					resourceroots: {
						testComponentAsync: "test-resources/sap/ui/fl/qunit/testComponentAsync"
					}
				}
			},

			"changeHandler/AddXMLAtExtensionPoint": {
				group: "ChangeHandler",
				coverage: {
					only: ["sap/ui/fl/changeHandler/AddXMLAtExtensionPoint"]
				},
				ui5: {
					resourceroots: {
						testComponentAsync: "test-resources/sap/ui/fl/qunit/testComponentAsync"
					}
				}
			},

			"changeHandler/BaseAddViaDelegate": {
				group: "ChangeHandler",
				coverage: {
					only: ["sap/ui/fl/changeHandler/BaseAddViaDelegate"]
				},
				ui5: {
					resourceroots: {
						testComponentAsync: "test-resources/sap/ui/fl/qunit/testComponentAsync"
					}
				}
			},

			"changeHandler/BaseAddXml": {
				group: "ChangeHandler",
				coverage: {
					only: ["sap/ui/fl/changeHandler/BaseAddXml"]
				},
				ui5: {
					resourceroots: {
						testComponentAsync: "test-resources/sap/ui/fl/qunit/testComponentAsync"
					}
				}
			},

			"changeHandler/Base": {
				group: "ChangeHandler",
				coverage: {
					only: ["sap/ui/fl/changeHandler/Base"]
				}
			},

			"changeHandler/BaseRename": {
				group: "ChangeHandler",
				coverage: {
					only: ["sap/ui/fl/changeHandler/BaseRename"]
				},
				ui5: {
					resourceroots: {
						testComponentAsync: "test-resources/sap/ui/fl/qunit/testComponentAsync"
					}
				}
			},

			"changeHandler/HideControl": {
				group: "ChangeHandler",
				coverage: {
					only: ["sap/ui/fl/changeHandler/HideControl"]
				}
			},

			"changeHandler/MoveControls": {
				group: "ChangeHandler",
				coverage: {
					only: ["sap/ui/fl/changeHandler/MoveControls"]
				},
				ui5: {
					resourceroots: {
						testComponentAsync: "test-resources/sap/ui/fl/qunit/testComponentAsync"
					}
				}
			},

			"changeHandler/MoveElements": {
				group: "ChangeHandler",
				coverage: {
					only: ["sap/ui/fl/changeHandler/MoveElements"]
				},
				ui5: {
					resourceroots: {
						testComponentAsync: "test-resources/sap/ui/fl/qunit/testComponentAsync"
					}
				}
			},

			"changeHandler/PropertyBindingChange": {
				group: "ChangeHandler",
				coverage: {
					only: ["sap/ui/fl/changeHandler/PropertyBindingChange"]
				},
				ui5: {
					"xx-bindingSyntax": "complex",
					"xx-designMode": "true"
				}
			},

			"changeHandler/PropertyChange": {
				group: "ChangeHandler",
				coverage: {
					only: ["sap/ui/fl/changeHandler/PropertyChange"]
				}
			},

			"changeHandler/StashControl": {
				group: "ChangeHandler",
				coverage: {
					only: ["sap/ui/fl/changeHandler/StashControl"]
				}
			},

			"changeHandler/UnhideControl": {
				group: "ChangeHandler",
				coverage: {
					only: ["sap/ui/fl/changeHandler/UnhideControl"]
				}
			},

			"changeHandler/UnstashControl": {
				group: "ChangeHandler",
				coverage: {
					only: ["sap/ui/fl/changeHandler/UnstashControl"]
				}
			},

			"changeHandler/UpdateIFrame": {
				group: "ChangeHandler",
				coverage: {
					only: ["sap/ui/fl/changeHandler/UpdateIFrame"]
				},
				ui5: {
					resourceroots: {
						testComponentAsync: "test-resources/sap/ui/fl/qunit/testComponentAsync"
					}
				}
			},

			"designtime/util/IFrame.designtime": {
				group: "Designtime",
				coverage: {
					only: ["sap/ui/fl/designtime/util/IFrame.designtime"]
				}
			},

			// Variant tests:
			"variants/VariantManagement": {
				group: "Variants",
				coverage: {
					only: ["sap/ui/fl/variants/VariantManagement"]
				}
			},

			"variants/VariantModel": {
				group: "Variants",
				ui5: {
					resourceroots: {
						"fl.test": "test-resources/sap/ui/fl/qunit/testResources/"
					},
					flexibilityServices: '[{"connector": "SessionStorageConnector"}]'
				},
				coverage: {
					only: ["sap/ui/fl/variants/VariantModel"]
				}
			},

			"variants/context/ContextVisibility.controller": {
				group: "Variants",
				coverage: {
					only: ["sap/ui/fl/variants/context/controller/"]
				}
			},

			"variants/context/ContextVisibilityIntegration": {
				group: "Variants",
				coverage: {
					only: ["sap/ui/fl/variants/context/"]
				}
			},

			"variants/context/ContextVisibilityComponent": {
				group: "Variants",
				coverage: {
					only: ["sap/ui/fl/variants/context/"]
				}
			},

			// CLOUD IOI tests:
			library: {
				coverage: {
					only: ["sap/ui/fl/library"]
				},
				ui5: {
					libs: [] // The fl library is being loaded inside the test
				}
			},

			libraryInTrial1: {
				coverage: {
					only: ["sap/ui/fl/library"]
				},
				ui5: {
					libs: [] // The fl library is being loaded inside the test
				}
			},

			libraryInTrial2: {
				coverage: {
					only: ["sap/ui/fl/library"]
				},
				ui5: {
					libs: [] // The fl library is being loaded inside the test
				}
			},

			libraryInTrial3: {
				coverage: {
					only: ["sap/ui/fl/library"]
				},
				ui5: {
					libs: [] // The fl library is being loaded inside the test
				}
			},

			Utils: {
				coverage: {
					only: ["sap/ui/fl/Utils"]
				}
			},

			LayerUtils: {
				coverage: {
					only: ["sap/ui/fl/LayerUtils"]
				}
			},

			// Rules
			"rules/StableId": {
				group: "Rules",
				ui5: {
					resourceroots: {
						"sap.ui.support.TestHelper": "test-resources/sap/ui/support/TestHelper"
					}
				}
			},

			// Support
			"support/apps/contentbrowser/controller/ContentDetails.controller": {
				group: "Support",
				coverage: {
					only: ["sap/ui/fl/support"]
				}
			},

			"support/apps/contentbrowser/controller/ContentDetailsEdit.controller": {
				group: "Support",
				coverage: {
					only: ["sap/ui/fl/support"]
				}
			},

			"support/apps/contentbrowser/controller/LayerContentMaster.controller": {
				group: "Support",
				coverage: {
					only: ["sap/ui/fl/support"]
				}
			},

			"support/apps/contentbrowser/controller/Layers.controller": {
				group: "Support",
				coverage: {
					only: ["sap/ui/fl/support"]
				}
			},

			"support/apps/contentbrowser/lrepConnector/LRepConnector": {
				group: "Support",
				coverage: {
					only: ["sap/ui/fl/support"]
				}
			},

			"support/apps/contentbrowser/utils/DataUtils": {
				group: "Support",
				coverage: {
					only: ["sap/ui/fl/support"]
				}
			},

			"support/apps/contentbrowser/utils/ErrorUtils": {
				group: "Support",
				coverage: {
					only: ["sap/ui/fl/support"]
				}
			},

			// transport
			"write/_internal/transport/TransportDialog": {
				group: "Transport",
				coverage: {
					only: ["sap/ui/fl/write/_internal/transport/TransportDialog"]
				}
			},

			"write/_internal/transport/TransportSelection": {
				group: "Transport",
				coverage: {
					only: ["sap/ui/fl/write/_internal/transport/TransportSelection"]
				}
			},

			"write/_internal/transport/Transports": {
				group: "Transport",
				coverage: {
					only: ["sap/ui/fl/write/_internal/transport/Transports"]
				}
			},

			"designtime/Library": {
				group: "DesignTime"
			},

			"integration/async/ComponentWithView": {
				group: "Integration/async",
				ui5: {
					resourceroots: {
						"sap.ui.fl.qunit.integration.async": "test-resources/sap/ui/fl/qunit/integration/async"
					}
				}
			},

			"integration/FlexInReuseComponents": {
				group: "Integration",
				ui5: {
					resourceroots: {
						"sap.ui.fl.qunit.integration": "test-resources/sap/ui/fl/qunit/integration"
					}
				}
			},

			"registry/Settings": {
				group: "Registry",
				coverage: {
					only: ["sap/ui/fl/registry/Settings"]
				}
			},

			// OVP key user test scenarios
			"apply/_internal/changes/descriptor/ovp/ChangeCard": {
				group: "Apply Internal - OVP Change card",
				coverage: {
					only: ["sap/ui/fl/apply/_internal/changes/descriptor/ovp/ChangeCard"]
				}
			},

			"apply/_internal/changes/descriptor/ovp/AddNewCard": {
				group: "Apply Internal - OVP Add new card",
				coverage: {
					only: ["sap/ui/fl/apply/_internal/changes/descriptor/ovp/AddNewCard"]
				}
			},

			"apply/_internal/changes/descriptor/ovp/DeleteCard": {
				group: "Apply Internal - OVP Delete card",
				coverage: {
					only: ["sap/ui/fl/apply/_internal/changes/descriptor/ovp/DeleteCard"]
				}
			},

			"Generic Testsuite": {
				page: "test-resources/sap/ui/fl/qunit/testsuite.generic.qunit.html"
			}
		}
	};

	var bCompAvailable = false;
	var bMdcAvailable = false;
	var oXhr = new XMLHttpRequest();
	oXhr.onreadystatechange = function() {
		if (this.readyState === 4) {
			switch (this.status) {
				case 200:
				case 304:
					var aLibraries = JSON.parse(this.responseText).libraries;
					bCompAvailable = aLibraries.some(function(mLibrary) {
						return mLibrary.name === "sap.ui.comp";
					});
					bMdcAvailable = aLibraries.some(function(mLibrary) {
						return mLibrary.name === "sap.ui.mdc";
					});
					break;
				default:
					Log.info("Sorry, can't find file with library versions ¯\\_(ツ)_/¯");
			}
		}
	};

	oXhr.open("GET", sap.ui.require.toUrl("sap-ui-version.json"), false);
	oXhr.send();

	if (bCompAvailable && bMdcAvailable) {
		mConfig = merge({}, mConfig, {
			tests: {
				"write/_internal/condenser/Condenser": {
					group: "Write Internal",
					coverage: {
						only: ["sap/ui/fl/write/_internal/condenser/"]
					},
					ui5: {
						resourceroots: {
							"rta/qunit": "test-resources/sap/ui/rta/qunit/",
							"sap.ui.rta.qunitrta": "test-resources/sap/ui/rta/internal/testdata/qunit_rta/",
							"sap.ui.rta.test": "test-resources/sap/ui/rta/internal/testdata/rta/",
							"sap.ui.mdc.app": "test-resources/sap/ui/mdc/sample/table",
							"sap.ui.fl.testResources": "test-resources/sap/ui/fl/qunit/testResources",
							delegates: "test-resources/sap/ui/mdc/delegates/"
						},
						libs: ["sap.ui.mdc"],
						flexibilityServices: '[{"connector": "SessionStorageConnector"}]'
					},
					qunit: {
						reorder: false
					}
				},
				"write/_internal/fieldExtensibility/ABAPAccess": {
					group: "Write Internal",
					coverage: {
						only: ["sap/ui/fl/write/_internal/fieldExtensibility/ABAPAccess"]
					},
					ui5: {
						resourceroots: {
							"sap.ui.rta.test.additionalElements": "test-resources/sap/ui/rta/internal/testdata/additionalElements/"
						}
					}
				}
			}
		});
	} else {
		Log.info("sap.ui.comp not available",
			"enabling tests are skipped, ensure sap.ui.comp from sapui5.runtime is loaded to execute them");
	}

	return mConfig;
});
