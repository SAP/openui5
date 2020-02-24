sap.ui.define(function () {
	"use strict";

	return {
		name: "sap.ui.fl",
		defaults: {
			group: "Default",
			qunit: {
				version: 2
			},
			sinon: false,
			ui5: {
				language: "en",
				libs: ["sap.ui.fl"],
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
			"apply/api/FlexRuntimeInfoAPI": {
				group: "Apply API",
				coverage: {
					only: ["sap/ui/fl/apply/api/FlexRuntimeInfoAPI", "sap/ui/fl/ControlPersonalizationAPI"]
				}
			},
			"apply/api/ControlVariantApplyAPI": {
				group: "Apply API",
				coverage: {
					only: ["sap/ui/fl/apply/api/ControlVariantApplyAPI", "sap/ui/fl/ControlPersonalizationAPI"]
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
				group: "Apply Internal",
				coverage: {
					only: ["sap/ui/fl/apply/_internal/changes/descriptor/ui5/AddLibrary"]
				}
			},
			"apply/_internal/changes/descriptor/Preprocessor": {
				group: "Apply Internal",
				coverage: {
					only: ["sap/ui/fl/apply/_internal/changes/descriptor/Preprocessor"]
				}
			},
			"apply/_internal/changes/descriptor/Applier": {
				group: "Apply Internal",
				coverage: {
					only: ["sap/ui/fl/apply/_internal/changes/descriptor/Applier"]
				}
			},
			"apply/_internal/connectors/ObjectStorageConnector": {
				group: "Apply Internal",
				coverage: {
					only: [
						"sap/ui/fl/apply/_internal/connectors/ObjectStorageConnector",
						"sap/ui/fl/apply/_internal/connectors/LocalStorageConnector",
						"sap/ui/fl/apply/_internal/connectors/SessionStorageConnector"
					]
				},
				ui5: {
					flexibilityServices: '[{"connector": "ObjectStorageConnector", "layers": []}]'
				}
			},
			"apply/_internal/connectors/ObjectStorageUtils": {
				group: "Apply Internal",
				coverage: {
					only: ["sap/ui/fl/apply/_internal/connectors/ObjectStorageUtils"]
				}
			},
			"apply/_internal/connectors/JsObjectConnector": {
				group: "Apply Internal",
				coverage: {
					only: [
						"sap/ui/fl/apply/_internal/connectors/JsObjectConnector"
					]
				},
				ui5: {
					flexibilityServices: '[{"connector": "JsObjectConnector", "layers": []}]'
				}
			},
			"apply/_internal/connectors/StaticFileConnector": {
				group: "Apply Internal",
				coverage: {
					only: [
						"sap/ui/fl/apply/_internal/connectors/StaticFileConnector"
					]
				},
				ui5: {
					flexibilityServices: '[{"connector": "StaticFileConnector", "layers": []}]'
				}
			},
			"apply/_internal/connectors/LrepConnector": {
				group: "Apply Internal",
				coverage: {
					only: [
						"sap/ui/fl/apply/_internal/connectors/LrepConnector",
						"sap/ui/fl/apply/_internal/connectors/Utils"
					]
				}
			},
			"apply/_internal/connectors/PersonalizationConnector": {
				group: 'Apply Internal',
				coverage: {
					only: ["sap/ui/fl/apply/_internal/connectors/PersonalizationConnector"]
				}
			},
			"apply/_internal/connectors/KeyUserConnector": {
				group: "Apply Internal",
				coverage: {
					only: ["sap/ui/fl/apply/_internal/connectors/KeyUserConnector"]
				}
			},
			"apply/_internal/connectors/ObjectPathConnector": {
				group: "Apply Internal",
				coverage: {
					only: [
						"sap/ui/fl/apply/_internal/connectors/ObjectPathConnector"
					]
				}
			},
			"apply/_internal/controlVariants/URLHandler": {
				group: "Apply Internal",
				coverage: {
					only: ["sap/ui/fl/apply/_internal/controlVariants/URLHandler"]
				}
			},
			"apply/_internal/flexState/changes/DependencyHandler": {
				group: "Apply Internal",
				coverage: {
					only: ["sap/ui/fl/apply/_internal/flexState/changes/DependencyHandler"]
				}
			},
			"apply/_internal/flexState/controlVariants/VariantManagementState": {
				group: "Apply Internal",
				coverage: {
					only: ["sap/ui/fl/apply/_internal/flexState/controlVariants/VariantManagementState"]
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
			"apply/_internal/flexState/FlexState": {
				group: "Apply Internal",
				coverage: {
					only: ["sap/ui/fl/apply/_internal/flexState/FlexState"]
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
			"apply/_internal/flexState/prepareAppDescriptorMap": {
				group: "Apply Internal",
				coverage: {
					only: ["sap/ui/fl/apply/_internal/flexState/prepareAppDescriptorMap"]
				}
			},
			"apply/_internal/flexState/prepareChangesMap": {
				group: "Apply Internal",
				coverage: {
					only: ["sap/ui/fl/apply/_internal/flexState/prepareChangesMap"]
				}
			},
			"apply/_internal/flexState/prepareVariantsMap": {
				group: "Apply Internal",
				coverage: {
					only: ["sap/ui/fl/apply/_internal/flexState/prepareVariantsMap"]
				}
			},
			"apply/_internal/ChangesController": {
				group: "Apply Internal",
				coverage: {
					only: ["sap/ui/fl/apply/_internal/ChangesController"]
				}
			},
			"apply/_internal/Storage": {
				group: "Apply Internal",
				ui5: {
					resourceroots: {
						"test.app": "./test-resources/sap/ui/fl/qunit/testResources/"
					},
					flexibilityServices: '[{"connector": "JsObjectConnector", "layers": ["ALL"]},{"connector": "LrepConnector", "layers": ["ALL"], "url": "someURL"}]'
				},
				coverage: {
					only: ["sap/ui/fl/apply/_internal/Storage"]
				}
			},
			"apply/_internal/StorageUtils": {
				group: "Apply Internal",
				coverage: {
					only: ["sap/ui/fl/apply/_internal/StorageUtils"]
				}
			},
			"apply/_internal/storageResultDisassemble": {
				group: "Apply Internal",
				coverage: {
					only: ["sap/ui/fl/apply/_internal/storageResultDisassemble"]
				}
			},
			"write/api/ChangesWriteAPI": {
				group: "Write API",
				coverage: {
					only: ["sap/ui/fl/write/api/ChangesWriteAPI", "sap/ui/fl/apply/_internal/ChangesController"]
				}
			},
			"write/api/ControlPersonalizationWriteAPI": {
				group: "Write API",
				coverage: {
					only: ["sap/ui/fl/write/api/ControlPersonalizationWriteAPI", "sap/ui/fl/ControlPersonalizationAPI"]
				}
			},
			"write/api/PersistenceWriteAPI": {
				group: "Write API",
				coverage: {
					only: ["sap/ui/fl/write/api/PersistenceWriteAPI", "sap/ui/fl/apply/_internal/ChangesController"]
				}
			},
			"write/api/AppVariantWriteAPI": {
				group: "Write API",
				coverage: {
					only: ["sap/ui/fl/write/api/AppVariantWriteAPI", "sap/ui/fl/apply/_internal/ChangesController"]
				}
			},
			"write/api/SmartBusinessWriteAPI": {
				group: "Write API",
				coverage: {
					only: ["sap/ui/fl/write/api/SmartBusinessWriteAPI"]
				}
			},
			"write/api/FeaturesAPI": {
				group: "Write API",
				coverage: {
					only: ["sap/ui/fl/write/api/FeaturesAPI"]
				}
			},
			"write/api/VersionsAPI": {
				group: "Write API",
				coverage: {
					only: ["sap/ui/fl/write/api/VersionsAPI"]
				}
			},
			"write/api/UI2PersonalizationWriteAPI": {
				group: "Write API",
				coverage: {
					only: ["sap/ui/fl/write/api/UI2PersonalizationWriteAPI"]
				}
			},
			"write/api/SmartVariantManagementWriteAPI": {
				group: "Write API",
				coverage: {
					only: ["sap/ui/fl/write/api/SmartVariantManagementWriteAPI"]
				}
			},
			"write/_internal/Storage": {
				group: "Write Internal",
				coverage: {
					only: ["sap/ui/fl/write/_internal/Storage"]
				}
			},
			"write/_internal/CompatibilityConnector": {
				group: "Write Internal",
				coverage: {
					only: ["sap/ui/fl/write/_internal/CompatibilityConnector"]
				},
				ui5: {
					resourceroots: {
						"test.app": "./test-resources/sap/ui/fl/qunit/testResources/"
					},
					flexibilityServices: '[{"connector": "JsObjectConnector", "layers": ["ALL"]}]'
				}
			},
			"write/_internal/Versions": {
				group: "Write Internal",
				coverage: {
					only: ["sap/ui/fl/write/_internal/Versions"]
				}
			},
			"write/_internal/connectors/ObjectPathConnector": {
				group: "Write Internal",
				coverage: {
					only: [
						"sap/ui/fl/write/_internal/connectors/ObjectPathConnector"
					]
				},
				ui5: {
					flexibilityServices: '[{"connector": "ObjectStorageConnector", "layers": []}]'
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
			"write/_internal/StorageFeaturesMerger": {
				group: "Write Internal",
				coverage: {
					only: ["sap/ui/fl/write/_internal/StorageFeaturesMerger"]
				}
			},
			"write/_internal/connectors/ObjectStorageConnector": {
				group: "Write Internal",
				coverage: {
					only: [
						"sap/ui/fl/write/_internal/connectors/ObjectStorageConnector",
						"sap/ui/fl/write/_internal/connectors/LocalStorageConnector",
						"sap/ui/fl/write/_internal/connectors/SessionStorageConnector"
					]
				},
				ui5: {
					flexibilityServices: '[{"connector": "ObjectStorageConnector", "layers": []}]'
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
						"sap/ui/fl/apply/_internal/connectors/Utils"
					]
				}
			},
			"write/_internal/connectors/KeyUserConnector": {
				group: "Write Internal",
				coverage: {
					only: ["sap/ui/fl/write/_internal/connectors/KeyUserConnector"]
				}
			},
			"write/_internal/StorageWithCustomBrokenConnector": {
				group: "Write Internal",
				ui5: {
					resourceroots: {
						"my.lib": "./test-resources/sap/ui/fl/qunit/write/_internal/",
						"test.app": "./test-resources/sap/ui/fl/qunit/testResources/"
					},
					"xx-componentPreload": "off",
					flexibilityServices: '[{"applyConnector": "my/lib/apply/BrokenConnector",' +
						'"writeConnector": "my/lib/write/BrokenConnector",' +
						'"custom": true,' +
						'"layers": []}]'
				},
				coverage: {
					only: ["sap/ui/fl/apply/_internal/Storage"]
				}
			},
			// Team Gravity tests
			"descriptorRelated/api/Api": {
				group: "Descriptor related APIs",
				coverage: {
					only: [
						"sap/ui/fl/descriptorRelated/api/DescriptorInlineChangeFactory",
						"sap/ui/fl/descriptorRelated/api/DescriptorVariantFactory",
						"sap/ui/fl/descriptorRelated/api/DescriptorChangeFactory"
					]
				}
			},
			"descriptorRelated/internal/Utils": {
				group: "Descriptor related Utils",
				coverage: {
					only: ["sap/ui/fl/descriptorRelated/internal/Utils"]
				}
			},

			// Team 42 tests:
			Change: {
				coverage: {
					only: ["sap/ui/fl/Change"]
				}
			},
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
			Condenser: {
				coverage: {
					only: ["sap/ui/fl/Condenser"]
				},
				ui5: {
					resourceroots: {
						"rta/qunit": "test-resources/sap/ui/rta/qunit/",
						"sap.ui.rta.qunitrta": "test-resources/sap/ui/rta/internal/testdata/qunit_rta/",
						"sap.ui.rta.test": "test-resources/sap/ui/rta/internal/testdata/rta/"
					}
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
			Variant: {
				coverage: {
					only: ["sap/ui/fl/Variant"]
				},
				ui5: {
					resourceroots: {
						"sap.ui.fl.qunit": "test-resources/sap/ui/fl/qunit/"
					}
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

			// ChangeHandler tests:
			"changeHandler/AddIFrame": {
				group: "ChangeHandler",
				coverage: {
					only: ["sap/ui/fl/changeHandler/AddIFrame"]
				},
				ui5: {
					resourceroots: {
						testComponent: "test-resources/sap/ui/fl/qunit/testComponent"
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
						testComponent: "test-resources/sap/ui/fl/qunit/testComponent"
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
						testComponent: "test-resources/sap/ui/fl/qunit/testComponent"
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
						testComponent: "test-resources/sap/ui/fl/qunit/testComponent"
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
						testComponent: "test-resources/sap/ui/fl/qunit/testComponent"
					}
				}
			},
			"changeHandler/ChangeHandlerMediator": {
				group: "ChangeHandler",
				coverage: {
					only: ["sap/ui/fl/changeHandler/ChangeHandlerMediator"]
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
						testComponent: "test-resources/sap/ui/fl/qunit/testComponent"
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
						testComponent: "test-resources/sap/ui/fl/qunit/testComponent"
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
						testComponent: "test-resources/sap/ui/fl/qunit/testComponent"
					}
				}
			},

			// Variant tests:
			"variants/VariantController": {
				group: "Variants",
				coverage: {
					only: ["sap/ui/fl/variants/VariantController"]
				}
			},
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
						"sap.ui.test": "test-resources/sap/ui/fl/qunit/testResources/"
					}
				},
				coverage: {
					only: ["sap/ui/fl/variants/VariantModel"]
				}
			},
			StandardVariant: {
				group: "Variants",
				coverage: {
					only: ["sap/ui/fl/StandardVariant"]
				}
			},
			DefaultVariant: {
				group: "Variants",
				coverage: {
					only: ["sap/ui/fl/DefaultVariant"]
				}
			},

			// CLOUD IOI tests:
			Cache: {
				coverage: {
					only: ["sap/ui/fl/Cache"]
				}
			},
			EventHistory: {
				coverage: {
					only: ["sap/ui/fl/EventHistory"]
				}
			},
			library: {
				coverage: {
					only: ["sap/ui/fl/library"]
				},
				ui5: {
					libs: null // The fl library is being loaded inside the test
				}
			},
			libraryInTrial1: {
				coverage: {
					only: ["sap/ui/fl/library"]
				},
				ui5: {
					libs: null // The fl library is being loaded inside the test
				}
			},
			libraryInTrial2: {
				coverage: {
					only: ["sap/ui/fl/library"]
				},
				ui5: {
					libs: null // The fl library is being loaded inside the test
				}
			},
			libraryInTrial3: {
				coverage: {
					only: ["sap/ui/fl/library"]
				},
				ui5: {
					libs: null // The fl library is being loaded inside the test
				}
			},
			FakeLrepConnector: {
				coverage: {
					only: ["sap/ui/fl/FakeLrepConnector"]
				}
			},
			LrepConnector: {
				coverage: {
					only: ["sap/ui/fl/LrepConnector"]
				}
			},
			PreprocessorImpl: {
				coverage: {
					only: ["sap/ui/fl/PreprocessorImpl"]
				},
				ui5: {
					resourceroots: {
						"sap.ui.fl.PreprocessorImpl.testResources": "test-resources/sap/ui/fl/qunit/testResources"
					}
				}
			},
			RegistrationDelegator: {
				coverage: {
					only: ["sap/ui/fl/RegistrationDelegator"]
				},
				ui5: {
					libs: null // The fl library is being loaded inside the test
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
			XmlPreprocessorImpl: {
				coverage: {
					only: ["sap/ui/fl/XmlPreprocessorImpl"]
				}
			},

			// codeExt
			"codeExt/CodeExtManager": {
				group: "codeExt",
				coverage: {
					only: ["sap/ui/fl/codeExt/CodeExtManager"]
				}
			},

			// Rules
			"rules/StableId": {
				group: "rules",
				ui5: {
					resourceroots: {
						"sap.ui.support.TestHelper": "test-resources/sap/ui/support/TestHelper"
					}
				}
			},
			// Support
			"support/apps/contentbrowser/controller/ContentDetails.controller": {
				group: "support",
				coverage: {
					only: ["sap/ui/fl/support"]
				}
			},
			"support/apps/contentbrowser/controller/ContentDetailsEdit.controller": {
				group: "support",
				coverage: {
					only: ["sap/ui/fl/support"]
				}
			},
			"support/apps/contentbrowser/controller/LayerContentMaster.controller": {
				group: "support",
				coverage: {
					only: ["sap/ui/fl/support"]
				}
			},
			"support/apps/contentbrowser/controller/Layers.controller": {
				group: "support",
				coverage: {
					only: ["sap/ui/fl/support"]
				}
			},
			"support/apps/contentbrowser/lrepConnector/LRepConnector": {
				group: "support",
				coverage: {
					only: ["sap/ui/fl/support"]
				}
			},
			"support/apps/contentbrowser/utils/DataUtils": {
				group: "support",
				coverage: {
					only: ["sap/ui/fl/support"]
				}
			},
			"support/apps/contentbrowser/utils/ErrorUtils": {
				group: "support",
				coverage: {
					only: ["sap/ui/fl/support"]
				}
			},
			"support/apps/uiFlexibilityDiagnostics/controller/Root.controller": {
				group: "support",
				coverage: {
					only: ["sap/ui/fl/support"]
				}
			},
			"support/apps/uiFlexibilityDiagnostics/helper/Extractor": {
				group: "support",
				coverage: {
					only: ["sap/ui/fl/support"]
				}
			},
			"support/Flexibility": {
				group: "support",
				coverage: {
					only: ["sap/ui/fl/support"]
				}
			},

			// transport
			"write/_internal/transport/TransportDialog": {
				group: "transport",
				coverage: {
					only: ["sap/ui/fl/write/_internal/transport/TransportDialog"]
				}
			},
			"write/_internal/transport/TransportSelection": {
				group: "transport",
				coverage: {
					only: ["sap/ui/fl/write/_internal/transport/TransportSelection"]
				}
			},
			"write/_internal/transport/Transports": {
				group: "transport",
				coverage: {
					only: ["sap/ui/fl/write/_internal/transport/Transports"]
				}
			},
			"designtime/Library": {
				group: "designTime"
			},
			"fieldExt/Access": {
				group: "fieldExt",
				coverage: {
					only: ["sap/ui/fl/fieldExt/Access"]
				}
			},
			"designtime/appVariant/ChangeModifier": {
				group: "designTime"
			},
			"designtime/appVariant/ModuleModifier": {
				group: "designTime"
			},
			"designtime/appVariant/ModifierUtils": {
				group: "designTime"
			},
			"designtime/appVariant/AppVariantUtils": {
				group: "designTime"
			},
			"designtime/appVariant/AppVariantModifier": {
				group: "designTime"
			},
			"integration/async/ComponentWithView": {
				group: "integration/async",
				ui5: {
					resourceroots: {
						"sap.ui.fl.qunit.integration.async": "test-resources/sap/ui/fl/qunit/integration/async"
					}
				}
			},
			"integration/FlexInReuseComponents": {
				group: "integration",
				ui5: {
					resourceroots: {
						"sap.ui.fl.qunit.integration": "test-resources/sap/ui/fl/qunit/integration"
					}
				}
			},
			"registry/ChangeHandlerRegistration": {
				group: "registry",
				coverage: {
					only: ["sap/ui/fl/registry/ChangeHandlerRegistration"]
				}
			},
			"registry/ChangeRegistry": {
				group: "registry",
				coverage: {
					only: ["sap/ui/fl/registry/ChangeRegistry"]
				},
				ui5: {
					resourceroots: {
						"sap/ui/fl/test/registry": "test-resources/sap/ui/fl/qunit/registry"
					}
				}
			},
			"registry/ChangeRegistryItem": {
				group: "registry",
				coverage: {
					only: ["sap/ui/fl/registry/ChangeRegistryItem"]
				}
			},
			"registry/ChangeTypeMetadata": {
				group: "registry",
				coverage: {
					only: ["sap/ui/fl/registry/ChangeTypeMetadata"]
				}
			},
			"registry/Settings": {
				group: "registry",
				coverage: {
					only: ["sap/ui/fl/registry/Settings"]
				}
			},
			"registry/SimpleChanges": {
				group: "registry",
				coverage: {
					only: ["sap/ui/fl/registry/SimpleChanges"]
				}
			}
		}
	};
});
