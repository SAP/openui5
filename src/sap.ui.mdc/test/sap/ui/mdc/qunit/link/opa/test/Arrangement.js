/*
 * ! ${copyright}
 */

sap.ui.define([
	"sap/ui/test/Opa5", "sap/ui/fl/FakeLrepConnectorLocalStorage"
], function(Opa5, FakeLrepConnectorLocalStorage) {
	"use strict";

	return Opa5.extend("sap.ui.mdc.qunit.link.opa.test.Arrangement", {
		closeAllNavigationPopovers: function() {
			return this.waitFor({
				controlType: "sap.m.Popover",
				success: function(aPopovers) {
					aPopovers.forEach(function(oPopover) {
						oPopover.close();
					});
					return this.waitFor({
						check: function() {
							return !Opa5.getPlugin().getMatchingControls({
								controlType: "sap.m.Popover",
								visible: true,
								interactable: true
							}).length;
						}
					});
				}
			});
		},

		iEnableTheLocalLRep: function() {
			// Init LRep for VariantManagement (we have to fake the connection to LRep in order to be independent from backend)
			FakeLrepConnectorLocalStorage.enableFakeConnector();
			FakeLrepConnectorLocalStorage.forTesting.synchronous.clearAll();
			// // Save vendor flex changes
			// FakeLrepConnectorLocalStorage.forTesting.synchronous.store("id_1539786688520_126_createItem", {
			// 	changeType: "createItem",
			// 	conditions: {},
			// 	content: {
			// 		id: "appUnderTest---appUnderTest_SemanticObjectName-action_02"
			// 	},
			// 	context: "",
			// 	creation: "2018-10-17T14:31:28.559Z",
			// 	dependentSelector: {},
			// 	fileName: "id_1539786688520_126_createItem",
			// 	fileType: "change",
			// 	jsOnly: false,
			// 	layer: "USER",
			// 	moduleName: "",
			// 	namespace: "apps/appUnderTest/changes/",
			// 	oDataInformation: {},
			// 	originalLanguage: "EN",
			// 	packageName: "$TMP",
			// 	projectId: "appUnderTest",
			// 	reference: "appUnderTest.Component",
			// 	selector: {
			// 		id: "idInfoPanel",
			// 		idIsLocal: true
			// 	},
			// 	support: {
			// 		compositeCommand: "",
			// 		generator: "Change.createInitialFileContent",
			// 		service: "",
			// 		user: "",
			// 		sapui5Version: "1.59.0-SNAPSHOT"
			// 	},
			// 	texts: {},
			// 	validAppVersions: {
			// 		creation: "1.0.0",
			// 		from: "1.0.0"
			// 	}
			// });
			// FakeLrepConnectorLocalStorage.forTesting.synchronous.store("id_1539786688556_128_revealItem", {
			// 	changeType: "revealItem",
			// 	conditions: {},
			// 	content: {},
			// 	context: "",
			// 	creation: "2018-10-17T14:31:28.559Z",
			// 	dependentSelector: {},
			// 	fileName: "id_1539786688556_128_revealItem",
			// 	fileType: "change",
			// 	jsOnly: false,
			// 	layer: "USER",
			// 	moduleName: "",
			// 	namespace: "apps/appUnderTest/changes/",
			// 	oDataInformation: {},
			// 	originalLanguage: "EN",
			// 	packageName: "$TMP",
			// 	projectId: "appUnderTest",
			// 	reference: "appUnderTest.Component",
			// 	selector: {
			// 		id: "appUnderTest_SemanticObjectName-action_02",
			// 		idIsLocal: true
			// 	},
			// 	support: {
			// 		compositeCommand: "",
			// 		generator: "Change.createInitialFileContent",
			// 		service: "",
			// 		user: "",
			// 		sapui5Version: "1.59.0-SNAPSHOT"
			// 	},
			// 	texts: {},
			// 	validAppVersions: {
			// 		creation: "1.0.0",
			// 		from: "1.0.0"
			// 	}
			// });
			// FakeLrepConnectorLocalStorage.forTesting.synchronous.store("id_1539787603700_135_createItem", {
			// 	changeType: "createItem",
			// 	conditions: {},
			// 	content: {
			// 		id: "appUnderTest---appUnderTest_SemanticObjectProductId-action_02"
			// 	},
			// 	context: "",
			// 	creation: "2018-10-17T14:46:43.732Z",
			// 	dependentSelector: {},
			// 	fileName: "id_1539787603700_135_createItem",
			// 	fileType: "change",
			// 	jsOnly: false,
			// 	layer: "USER",
			// 	moduleName: "",
			// 	namespace: "apps/appUnderTest/changes/",
			// 	oDataInformation: {},
			// 	originalLanguage: "EN",
			// 	packageName: "$TMP",
			// 	projectId: "appUnderTest",
			// 	reference: "appUnderTest.Component",
			// 	selector: {
			// 		id: "idInfoPanel",
			// 		idIsLocal: true
			// 	},
			// 	support: {
			// 		compositeCommand: "",
			// 		generator: "Change.createInitialFileContent",
			// 		service: "",
			// 		user: "",
			// 		sapui5Version: "1.59.0-SNAPSHOT"
			// 	},
			// 	texts: {},
			// 	validAppVersions: {
			// 		creation: "1.0.0",
			// 		from: "1.0.0"
			// 	}
			// });
			// FakeLrepConnectorLocalStorage.forTesting.synchronous.store("id_1539787603730_137_revealItem", {
			// 	changeType: "revealItem",
			// 	conditions: {},
			// 	content: {},
			// 	context: "",
			// 	creation: "2018-10-17T14:46:43.732Z",
			// 	dependentSelector: {},
			// 	fileName: "id_1539787603730_137_revealItem",
			// 	fileType: "change",
			// 	jsOnly: false,
			// 	layer: "USER",
			// 	moduleName: "",
			// 	namespace: "apps/appUnderTest/changes/",
			// 	oDataInformation: {},
			// 	originalLanguage: "EN",
			// 	packageName: "$TMP",
			// 	projectId: "appUnderTest",
			// 	reference: "appUnderTest.Component",
			// 	selector: {
			// 		id: "appUnderTest_SemanticObjectProductId-action_02",
			// 		idIsLocal: true
			// 	},
			// 	support: {
			// 		compositeCommand: "",
			// 		generator: "Change.createInitialFileContent",
			// 		service: "",
			// 		user: "",
			// 		sapui5Version: "1.59.0-SNAPSHOT"
			// 	},
			// 	texts: {},
			// 	validAppVersions: {
			// 		creation: "1.0.0",
			// 		from: "1.0.0"
			// 	}
			// });
			// FakeLrepConnectorLocalStorage.forTesting.synchronous.store("id_1539787806268_146_createItem", {
			// 	changeType: "createItem",
			// 	conditions: {},
			// 	content: {
			// 		id: "appUnderTest---appUnderTest_SemanticObjectProductId-action_03"
			// 	},
			// 	context: "",
			// 	creation: "2018-10-17T14:50:06.296Z",
			// 	dependentSelector: {},
			// 	fileName: "id_1539787806268_146_createItem",
			// 	fileType: "change",
			// 	jsOnly: false,
			// 	layer: "USER",
			// 	moduleName: "",
			// 	namespace: "apps/appUnderTest/changes/",
			// 	oDataInformation: {},
			// 	originalLanguage: "EN",
			// 	packageName: "$TMP",
			// 	projectId: "appUnderTest",
			// 	reference: "appUnderTest.Component",
			// 	selector: {
			// 		id: "idInfoPanel",
			// 		idIsLocal: true
			// 	},
			// 	support: {
			// 		compositeCommand: "",
			// 		generator: "Change.createInitialFileContent",
			// 		service: "",
			// 		user: "",
			// 		sapui5Version: "1.59.0-SNAPSHOT"
			// 	},
			// 	texts: {},
			// 	validAppVersions: {
			// 		creation: "1.0.0",
			// 		from: "1.0.0"
			// 	}
			// });
			// FakeLrepConnectorLocalStorage.forTesting.synchronous.store("id_1539787806295_148_revealItem", {
			// 	changeType: "revealItem",
			// 	conditions: {},
			// 	content: {},
			// 	context: "",
			// 	creation: "2018-10-17T14:50:06.296Z",
			// 	dependentSelector: {},
			// 	fileName: "id_1539787806295_148_revealItem",
			// 	fileType: "change",
			// 	jsOnly: false,
			// 	layer: "USER",
			// 	moduleName: "",
			// 	namespace: "apps/appUnderTest/changes/",
			// 	oDataInformation: {},
			// 	originalLanguage: "EN",
			// 	packageName: "$TMP",
			// 	projectId: "appUnderTest",
			// 	reference: "appUnderTest.Component",
			// 	selector: {
			// 		id: "appUnderTest_SemanticObjectProductId-action_03",
			// 		idIsLocal: true
			// 	},
			// 	support: {
			// 		compositeCommand: "",
			// 		generator: "Change.createInitialFileContent",
			// 		service: "",
			// 		user: "",
			// 		sapui5Version: "1.59.0-SNAPSHOT"
			// 	},
			// 	texts: {},
			// 	validAppVersions: {
			// 		creation: "1.0.0",
			// 		from: "1.0.0"
			// 	}
			// });
			// FakeLrepConnectorLocalStorage.forTesting.synchronous.store("id_1539787306073_160_createItem", {
			// 	changeType: "createItem",
			// 	conditions: {},
			// 	content: {
			// 		id: "appUnderTest---appUnderTest_SemanticObjectCategory-action_02"
			// 	},
			// 	context: "",
			// 	creation: "2018-10-17T14:41:46.096Z",
			// 	dependentSelector: {},
			// 	fileName: "id_1539787306073_160_createItem",
			// 	fileType: "change",
			// 	jsOnly: false,
			// 	layer: "USER",
			// 	moduleName: "",
			// 	namespace: "apps/appUnderTest/changes/",
			// 	oDataInformation: {},
			// 	originalLanguage: "EN",
			// 	packageName: "$TMP",
			// 	projectId: "appUnderTest",
			// 	reference: "appUnderTest.Component",
			// 	selector: {
			// 		id: "idInfoPanel",
			// 		idIsLocal: true
			// 	},
			// 	support: {
			// 		compositeCommand: "",
			// 		generator: "Change.createInitialFileContent",
			// 		service: "",
			// 		user: "",
			// 		sapui5Version: "1.59.0-SNAPSHOT"
			// 	},
			// 	texts: {},
			// 	validAppVersions: {
			// 		creation: "1.0.0",
			// 		from: "1.0.0"
			// 	}
			// });
			// FakeLrepConnectorLocalStorage.forTesting.synchronous.store("id_1539787306095_162_revealItem", {
			// 	changeType: "revealItem",
			// 	conditions: {},
			// 	content: {},
			// 	context: "",
			// 	creation: "2018-10-17T14:41:46.097Z",
			// 	dependentSelector: {},
			// 	fileName: "id_1539787306095_162_revealItem",
			// 	fileType: "change",
			// 	jsOnly: false,
			// 	layer: "USER",
			// 	moduleName: "",
			// 	namespace: "apps/appUnderTest/changes/",
			// 	oDataInformation: {},
			// 	originalLanguage: "EN",
			// 	packageName: "$TMP",
			// 	projectId: "appUnderTest",
			// 	reference: "appUnderTest.Component",
			// 	selector: {
			// 		id: "appUnderTest_SemanticObjectCategory-action_02",
			// 		idIsLocal: true
			// 	},
			// 	support: {
			// 		compositeCommand: "",
			// 		generator: "Change.createInitialFileContent",
			// 		service: "",
			// 		user: "",
			// 		sapui5Version: "1.59.0-SNAPSHOT"
			// 	},
			// 	texts: {},
			// 	validAppVersions: {
			// 		creation: "1.0.0",
			// 		from: "1.0.0"
			// 	}
			// });
		},

		iClearTheLocalStorageFromRtaRestart: function() {
			window.localStorage.removeItem("sap.ui.rta.restart.CUSTOMER");
			window.localStorage.removeItem("sap.ui.rta.restart.USER");
		}
	});

}, true);
