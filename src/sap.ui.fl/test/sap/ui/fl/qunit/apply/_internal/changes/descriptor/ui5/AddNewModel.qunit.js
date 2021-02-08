/*global QUnit*/

sap.ui.define([
	"sap/ui/fl/apply/_internal/changes/descriptor/ui5/AddNewModel",
	"sap/ui/fl/Change",
	"sap/ui/thirdparty/jquery"
],
function (
	AddNewModel,
	Change,
	jQuery
) {
	"use strict";

	QUnit.module("applyChange", {
	}, function() {
		var ADDED_MODEL = "the sap.ui5 model {0} was added correctly.";
		var ALREADY_EXISTING_MODEL = "the already existing sap.ui5 model {0} was not overridden or changed.";
		var ADDED_DATASOURCE = "the sap.app dataSource {0} was added correctly.";
		var ALREADY_EXISTING_DATASOURCE = "the already existing sap.app dataSource {0} was not overridden or changed.";

		QUnit.test("when calling '_applyChange' with adding a new model => SUCCESS", function (assert) {
			var oManifest = {
				"sap.app": {
					dataSources: {
						equipmentanno: {
							uri: "/sap/bc/bsp/sap/BSCBN_ANF_EAM/BSCBN_EQUIPMENT_SRV.anno.XML",
							type: "ODataAnnotation",
							settings: {
								localUri: "model/annotations.xml"
							}
						}
					}
				},
				"sap.ui5": {
					models: {
						i18n: {
							type: "sap.ui.model.resource.ResourceModel",
							uri: "i18n/i18n.properties"
						}
					}
				}
			};

			var oChange = new Change({
				changeType: "appdescr_ui5_addNewModel",
				content: {
					dataSource: {
						"customer.fancy_dataSource": {
							uri: "/sap/opu/odata/snce/PO_S_SRV;v=2/",
							type: "OData",
							settings: {
								odataVersion: "2.0",
								annotations: ["customer.fancy_annotation"]
							}
						},
						"customer.fancy_annotation": {
							uri: "/sap/bc/bsp/sap/BSCBN_ANF_EAM/BSCBN_EQUIPMENT_SRV.anno.XML",
							type: "ODataAnnotation",
							settings: {}
						}
					},
					model: {
						"customer.fancy_model": {
							dataSource: "customer.fancy_dataSource",
							settings: {}
						}
					}
				}
			});

			var oNewManifest = AddNewModel.applyChange(oManifest, oChange);

			assert.strictEqual(oNewManifest["sap.ui5"]["models"].hasOwnProperty("customer.fancy_model"), true, ADDED_MODEL.replace("{0}", "object customer.fancy_model"));
			assert.strictEqual(JSON.stringify(oNewManifest["sap.ui5"]["models"]["customer.fancy_model"]["settings"]), "{}", ADDED_MODEL.replace("{0}", "settings"));
			assert.strictEqual(oNewManifest["sap.ui5"]["models"]["i18n"]["type"], "sap.ui.model.resource.ResourceModel", ALREADY_EXISTING_MODEL.replace("{0}", "type"));
			assert.strictEqual(oNewManifest["sap.ui5"]["models"]["i18n"]["uri"], "i18n/i18n.properties", ALREADY_EXISTING_MODEL.replace("{0}", "uri"));

			assert.strictEqual(oNewManifest["sap.app"]["dataSources"].hasOwnProperty("customer.fancy_dataSource"), true, ADDED_DATASOURCE.replace("{0}", "customer.fancy_dataSource object"));
			assert.strictEqual(oNewManifest["sap.app"]["dataSources"]["customer.fancy_dataSource"]["uri"], "/sap/opu/odata/snce/PO_S_SRV;v=2/", ADDED_DATASOURCE.replace("{0}", "uri"));
			assert.strictEqual(oNewManifest["sap.app"]["dataSources"]["customer.fancy_dataSource"]["type"], "OData", ADDED_DATASOURCE.replace("{0}", "type"));

			assert.strictEqual(oNewManifest["sap.app"]["dataSources"].hasOwnProperty("customer.fancy_annotation"), true, ADDED_DATASOURCE.replace("{0}", "customer.fancy_annotation object"));
			assert.strictEqual(oNewManifest["sap.app"]["dataSources"]["customer.fancy_dataSource"]["uri"], "/sap/opu/odata/snce/PO_S_SRV;v=2/", ADDED_DATASOURCE.replace("{0}", "uri"));
			assert.strictEqual(oNewManifest["sap.app"]["dataSources"]["customer.fancy_dataSource"]["type"], "OData", ADDED_DATASOURCE.replace("{0}", "type"));

			assert.strictEqual(oNewManifest["sap.app"]["dataSources"].hasOwnProperty("equipmentanno"), true, ALREADY_EXISTING_DATASOURCE.replace("{0}", "equipmentanno"));
			assert.strictEqual(oNewManifest["sap.app"]["dataSources"]["equipmentanno"]["uri"], "/sap/bc/bsp/sap/BSCBN_ANF_EAM/BSCBN_EQUIPMENT_SRV.anno.XML", ALREADY_EXISTING_DATASOURCE.replace("{0}", "uri"));
			assert.strictEqual(oNewManifest["sap.app"]["dataSources"]["equipmentanno"]["type"], "ODataAnnotation", ALREADY_EXISTING_DATASOURCE.replace("{0}", "type"));
			assert.strictEqual(oNewManifest["sap.app"]["dataSources"]["equipmentanno"].hasOwnProperty("settings"), true, ALREADY_EXISTING_DATASOURCE.replace("{0}", "settings object"));
			assert.strictEqual(oNewManifest["sap.app"]["dataSources"]["equipmentanno"]["settings"]["localUri"], "model/annotations.xml", ALREADY_EXISTING_DATASOURCE.replace("{0}", "settings localUri"));
		});

		QUnit.test("when calling '_applyChange' with adding an already existing model => ERROR", function (assert) {
			var oManifest = {
				"sap.app": {
					dataSources: {
						equipmentanno: {
							uri: "/sap/odata",
							type: "OData"
						}
					}
				},
				"sap.ui5": {
					models: {
						i18n: {
							type: "sap.ui.model.resource.ResourceModel",
							uri: "i18n/i18n.properties"
						}
					}
				}
			};

			var oChange = new Change({
				changeType: "appdescr_ui5_addNewModel",
				content: {
					model: {
						i18n: {
							type: "sap.ui.model.resource.ResourceModel",
							uri: "i18n/i18n.properties"
						}
					}
				}
			});

			assert.throws(function() {
				AddNewModel.applyChange(oManifest, oChange);
			}, Error("The model 'i18n' already exists"),
			"throws error that model i18n already exists");
		});

		QUnit.test("when calling '_applyChange' with adding an already existing dataSource => ERROR", function (assert) {
			var oManifest = {
				"sap.app": {
					dataSources: {
						equipmentanno: {
							uri: "/sap/odata",
							type: "OData"
						}
					}
				},
				"sap.ui5": {
					models: {
						i18n: {
							type: "sap.ui.model.resource.ResourceModel",
							uri: "i18n/i18n.properties"
						}
					}
				}
			};

			var oChange = new Change({
				changeType: "appdescr_ui5_addNewModel",
				content: {
					dataSource: {
						equipmentanno: {
							uri: "/sap/odata",
							type: "OData"
						}
					},
					model: {
						myModel: {
							dataSource: "equipmentanno",
							uri: "my/model"
						}
					}
				}
			});

			assert.throws(function() {
				AddNewModel.applyChange(oManifest, oChange);
			}, Error("The dataSource 'equipmentanno' already exists"),
			"throws error that dataSource equipmentanno already exists");
		});

		QUnit.test("when calling '_applyChange' by adding a new model which refers to a not existing dataSource in the change or manifest => ERROR", function (assert) {
			var oManifest = {
				"sap.app": {
					dataSources: {
						equipmentanno: {
							uri: "/sap/test.json",
							type: "JSON"
						},
						otherDataSource: {
							uri: "/sap/odata",
							type: "OData"
						}
					}
				},
				"sap.ui5": {
					models: {
						i18n: {
							type: "sap.ui.model.resource.ResourceModel",
							uri: "i18n/i18n.properties"
						}
					}
				}
			};

			var oChange = new Change({
				changeType: "appdescr_ui5_addNewModel",
				content: {
					model: {
						equipment: {
							preload: true,
							dataSource: "notExistingDataSource",
							settings: {}
						}
					}
				}
			});

			assert.throws(function() {
				AddNewModel.applyChange(oManifest, oChange);
			}, Error("The defined dataSource 'notExistingDataSource' in the model does not exists as dataSource or must be allowed type of OData|INA|XML|JSON|FHIR|http|WebSocket"),
			"throws error that some dataSource which is defined in a model does not exists in the manifest or in the change or is not type of OData|INA|XML|JSON|FHIR|http|WebSocket");
		});

		QUnit.test("when calling '_applyChange' with adding a new model which refers to an existing dataSource with no type is defined (default 'OData') => SUCCESS", function (assert) {
			var oManifest = {
				"sap.app": {
					dataSources: {
						equipmentanno: {
							uri: "/sap/bc/bsp/sap/BSCBN_ANF_EAM/BSCBN_EQUIPMENT_SRV.anno.XML",
							settings: {
								localUri: "model/oData.xml"
							}
						}
					}
				},
				"sap.ui5": {
					models: {
						i18n: {
							type: "sap.ui.model.resource.ResourceModel",
							uri: "i18n/i18n.properties"
						}
					}
				}
			};

			var oChange = new Change({
				changeType: "appdescr_ui5_addNewModel",
				content: {
					model: {
						equipment: {
							preload: true,
							dataSource: "equipmentanno"
						}
					}
				}
			});

			var oNewManifest = AddNewModel.applyChange(oManifest, oChange);

			assert.strictEqual(oNewManifest["sap.app"]["dataSources"].hasOwnProperty("equipmentanno"), true, ALREADY_EXISTING_DATASOURCE.replace("{0}", "equipmentanno"));
			assert.strictEqual(oNewManifest["sap.app"]["dataSources"]["equipmentanno"]["uri"], "/sap/bc/bsp/sap/BSCBN_ANF_EAM/BSCBN_EQUIPMENT_SRV.anno.XML", ALREADY_EXISTING_DATASOURCE.replace("{0}", "uri"));
			assert.strictEqual(oNewManifest["sap.app"]["dataSources"]["equipmentanno"]["type"], undefined, "there is no type defined but default is 'OData'");
			assert.strictEqual(oNewManifest["sap.app"]["dataSources"]["equipmentanno"].hasOwnProperty("settings"), true, ALREADY_EXISTING_DATASOURCE.replace("{0}", "settings object"));
			assert.strictEqual(oNewManifest["sap.app"]["dataSources"]["equipmentanno"]["settings"]["localUri"], "model/oData.xml", ALREADY_EXISTING_DATASOURCE.replace("{0}", "settings localUri"));

			assert.strictEqual(oNewManifest["sap.ui5"]["models"].hasOwnProperty("i18n"), true, ALREADY_EXISTING_MODEL.replace("{0}", "i18n"));
			assert.strictEqual(oNewManifest["sap.ui5"]["models"]["i18n"]["type"], "sap.ui.model.resource.ResourceModel", ALREADY_EXISTING_MODEL.replace("{0}", "type"));
			assert.strictEqual(oNewManifest["sap.ui5"]["models"]["i18n"]["uri"], "i18n/i18n.properties", ALREADY_EXISTING_MODEL.replace("{0}", "uri"));

			assert.strictEqual(oNewManifest["sap.ui5"]["models"].hasOwnProperty("equipment"), true, ADDED_MODEL.replace("{0}", "equipment"));
			assert.strictEqual(oNewManifest["sap.ui5"]["models"]["equipment"]["preload"], true, ADDED_MODEL.replace("{0}", "preload"));
			assert.strictEqual(oNewManifest["sap.ui5"]["models"]["equipment"]["dataSource"], "equipmentanno", "the sap.ui5 model dataSource reference was checked in sap.app.dataSource and was added correctly.");
		});

		QUnit.test("when calling '_applyChange' check that either 'type' or 'dataSource' is defined in a property in sap.ui5.models => ERROR", function (assert) {
			var oManifest = {
				"sap.app": {
					dataSources: {
						equipmentanno: {
							uri: "/sap/bc/bsp/sap/BSCBN_ANF_EAM/BSCBN_EQUIPMENT_SRV.anno.XML",
							type: "ODataAnnotation",
							settings: {
								localUri: "model/annotations.xml"
							}
						}
					}
				},
				"sap.ui5": {
					models: {
						i18n: {
							type: "sap.ui.model.resource.ResourceModel",
							uri: "i18n/i18n.properties"
						}
					}
				}
			};

			var oChange = new Change({
				changeType: "appdescr_ui5_addNewModel",
				content: {
					model: {
						equipment: {
							preload: true,
							settings: {}
						}
					}
				}
			});

			assert.throws(function() {
				AddNewModel.applyChange(oManifest, oChange);
			}, Error("There is no 'dataSource' or 'type' in the change model defined. Please define either 'type' or 'dataSource' in property 'equipment'"),
			"throws error that either 'dataSource' or 'type' must be defined in the change model property");
		});

		QUnit.test("when calling '_applyChange' with adding a new model and dataSource in a manifest without having models and dataSources => SUCCESS", function (assert) {
			var oManifest = {
				"sap.app": {
				},
				"sap.ui5": {
				}
			};

			var oChange = new Change({
				changeType: "appdescr_ui5_addNewModel",
				content: {
					dataSource: {
						"customer.fancy_dataSource": {
							uri: "/sap/opu/odata/snce/PO_S_SRV;v=2/",
							type: "OData",
							settings: {
								odataVersion: "2.0",
								annotations: ["customer.fancy_annotation"]
							}
						},
						"customer.fancy_annotation": {
							uri: "/sap/bc/bsp/sap/BSCBN_ANF_EAM/BSCBN_EQUIPMENT_SRV.anno.XML",
							type: "ODataAnnotation",
							settings: {}
						}
					},
					model: {
						"customer.fancy_model": {
							dataSource: "customer.fancy_dataSource",
							settings: {}
						}
					}
				}
			});

			var oNewManifest = AddNewModel.applyChange(oManifest, oChange);

			assert.strictEqual(oNewManifest["sap.ui5"]["models"].hasOwnProperty("customer.fancy_model"), true, ADDED_MODEL.replace("{0}", "customer.fancy_model"));
			assert.strictEqual(JSON.stringify(oNewManifest["sap.ui5"]["models"]["customer.fancy_model"]["settings"]), "{}", ADDED_MODEL.replace("{0}", "settings"));

			assert.strictEqual(oNewManifest["sap.app"]["dataSources"].hasOwnProperty("customer.fancy_dataSource"), true, ADDED_DATASOURCE.replace("{0}", "customer.fancy_dataSource object"));
			assert.strictEqual(oNewManifest["sap.app"]["dataSources"]["customer.fancy_dataSource"]["uri"], "/sap/opu/odata/snce/PO_S_SRV;v=2/", ADDED_DATASOURCE.replace("{0}", "uri"));
			assert.strictEqual(oNewManifest["sap.app"]["dataSources"]["customer.fancy_dataSource"]["type"], "OData", ADDED_DATASOURCE.replace("{0}", "type"));

			assert.strictEqual(oNewManifest["sap.app"]["dataSources"].hasOwnProperty("customer.fancy_annotation"), true, ADDED_DATASOURCE.replace("{0}", "customer.fancy_annotation object"));
			assert.strictEqual(oNewManifest["sap.app"]["dataSources"]["customer.fancy_dataSource"]["uri"], "/sap/opu/odata/snce/PO_S_SRV;v=2/", ADDED_DATASOURCE.replace("{0}", "uri"));
			assert.strictEqual(oNewManifest["sap.app"]["dataSources"]["customer.fancy_dataSource"]["type"], "OData", ADDED_DATASOURCE.replace("{0}", "type"));
		});

		QUnit.test("when calling '_applyChange' with adding a new model and dataSource in a manifest with dataSource type INA => SUCCESS", function (assert) {
			var oManifest = {
				"sap.app": {
				},
				"sap.ui5": {
				}
			};

			var oChange = new Change({
				changeType: "appdescr_ui5_addNewModel",
				content: {
					dataSource: {
						inaDataSource: {
							uri: "/dataSource/ina",
							type: "INA"
						}
					},
					model: {
						equipment: {
							preload: true,
							dataSource: "inaDataSource",
							settings: {}
						}
					}
				}
			});

			var oNewManifest = AddNewModel.applyChange(oManifest, oChange);

			assert.strictEqual(oNewManifest["sap.ui5"]["models"].hasOwnProperty("equipment"), true, ADDED_MODEL.replace("{0}", "object equipment"));
			assert.strictEqual(oNewManifest["sap.ui5"]["models"]["equipment"]["preload"], true, ADDED_MODEL.replace("{0}", "preload"));
			assert.strictEqual(oNewManifest["sap.ui5"]["models"]["equipment"]["dataSource"], "inaDataSource", ADDED_MODEL.replace("{0}", "dataSource"));
			assert.strictEqual(JSON.stringify(oNewManifest["sap.ui5"]["models"]["equipment"]["settings"]), "{}", ADDED_MODEL.replace("{0}", "settings"));

			assert.strictEqual(oNewManifest["sap.app"]["dataSources"].hasOwnProperty("inaDataSource"), true, ADDED_DATASOURCE.replace("{0}", "inaDataSource"));
			assert.strictEqual(oNewManifest["sap.app"]["dataSources"]["inaDataSource"]["uri"], "/dataSource/ina", ADDED_DATASOURCE.replace("{0}", "uri"));
			assert.strictEqual(oNewManifest["sap.app"]["dataSources"]["inaDataSource"]["type"], "INA", ADDED_DATASOURCE.replace("{0}", "type"));
		});

		QUnit.test("when calling '_applyChange' with adding a new model and dataSource in a manifest with dataSource type XML => SUCCESS", function (assert) {
			var oManifest = {
				"sap.app": {
				},
				"sap.ui5": {
				}
			};

			var oChange = new Change({
				changeType: "appdescr_ui5_addNewModel",
				content: {
					dataSource: {
						xmlDataSource: {
							uri: "/dataSource/xml",
							type: "XML"
						}
					},
					model: {
						equipment: {
							preload: true,
							dataSource: "xmlDataSource",
							settings: {}
						}
					}
				}
			});

			var oNewManifest = AddNewModel.applyChange(oManifest, oChange);

			assert.strictEqual(oNewManifest["sap.ui5"]["models"].hasOwnProperty("equipment"), true, ADDED_MODEL.replace("{0}", "object equipment"));
			assert.strictEqual(oNewManifest["sap.ui5"]["models"]["equipment"]["preload"], true, ADDED_MODEL.replace("{0}", "preload"));
			assert.strictEqual(oNewManifest["sap.ui5"]["models"]["equipment"]["dataSource"], "xmlDataSource", ADDED_MODEL.replace("{0}", "dataSource"));
			assert.strictEqual(JSON.stringify(oNewManifest["sap.ui5"]["models"]["equipment"]["settings"]), "{}", ADDED_MODEL.replace("{0}", "settings"));

			assert.strictEqual(oNewManifest["sap.app"]["dataSources"].hasOwnProperty("xmlDataSource"), true, ADDED_DATASOURCE.replace("{0}", "xmlDataSource"));
			assert.strictEqual(oNewManifest["sap.app"]["dataSources"]["xmlDataSource"]["uri"], "/dataSource/xml", ADDED_DATASOURCE.replace("{0}", "uri"));
			assert.strictEqual(oNewManifest["sap.app"]["dataSources"]["xmlDataSource"]["type"], "XML", ADDED_DATASOURCE.replace("{0}", "type"));
		});

		QUnit.test("when calling '_applyChange' with adding a new model and dataSource in a manifest with dataSource type JSON => SUCCESS", function (assert) {
			var oManifest = {
				"sap.app": {
				},
				"sap.ui5": {
				}
			};

			var oChange = new Change({
				changeType: "appdescr_ui5_addNewModel",
				content: {
					dataSource: {
						jsonDataSource: {
							uri: "/dataSource/json",
							type: "JSON"
						}
					},
					model: {
						equipment: {
							preload: true,
							dataSource: "jsonDataSource",
							settings: {}
						}
					}
				}
			});

			var oNewManifest = AddNewModel.applyChange(oManifest, oChange);

			assert.strictEqual(oNewManifest["sap.ui5"]["models"].hasOwnProperty("equipment"), true, ADDED_MODEL.replace("{0}", "object equipment"));
			assert.strictEqual(oNewManifest["sap.ui5"]["models"]["equipment"]["preload"], true, ADDED_MODEL.replace("{0}", "preload"));
			assert.strictEqual(oNewManifest["sap.ui5"]["models"]["equipment"]["dataSource"], "jsonDataSource", ADDED_MODEL.replace("{0}", "dataSource"));
			assert.strictEqual(JSON.stringify(oNewManifest["sap.ui5"]["models"]["equipment"]["settings"]), "{}", ADDED_MODEL.replace("{0}", "settings"));

			assert.strictEqual(oNewManifest["sap.app"]["dataSources"].hasOwnProperty("jsonDataSource"), true, ADDED_DATASOURCE.replace("{0}", "jsonDataSource"));
			assert.strictEqual(oNewManifest["sap.app"]["dataSources"]["jsonDataSource"]["uri"], "/dataSource/json", ADDED_DATASOURCE.replace("{0}", "uri"));
			assert.strictEqual(oNewManifest["sap.app"]["dataSources"]["jsonDataSource"]["type"], "JSON", ADDED_DATASOURCE.replace("{0}", "type"));
		});

		QUnit.test("when calling '_applyChange' with adding a new model and dataSource in a manifest with dataSource type FHIR => SUCCESS", function (assert) {
			var oManifest = {
				"sap.app": {
				},
				"sap.ui5": {
				}
			};

			var oChange = new Change({
				changeType: "appdescr_ui5_addNewModel",
				content: {
					dataSource: {
						fhirDataSource: {
							uri: "/dataSource/fhir",
							type: "FHIR"
						}
					},
					model: {
						equipment: {
							preload: true,
							dataSource: "fhirDataSource",
							settings: {}
						}
					}
				}
			});

			var oNewManifest = AddNewModel.applyChange(oManifest, oChange);

			assert.strictEqual(oNewManifest["sap.ui5"]["models"].hasOwnProperty("equipment"), true, ADDED_MODEL.replace("{0}", "object equipment"));
			assert.strictEqual(oNewManifest["sap.ui5"]["models"]["equipment"]["preload"], true, ADDED_MODEL.replace("{0}", "preload"));
			assert.strictEqual(oNewManifest["sap.ui5"]["models"]["equipment"]["dataSource"], "fhirDataSource", ADDED_MODEL.replace("{0}", "dataSource"));
			assert.strictEqual(JSON.stringify(oNewManifest["sap.ui5"]["models"]["equipment"]["settings"]), "{}", ADDED_MODEL.replace("{0}", "settings"));

			assert.strictEqual(oNewManifest["sap.app"]["dataSources"].hasOwnProperty("fhirDataSource"), true, ADDED_DATASOURCE.replace("{0}", "fhirDataSource"));
			assert.strictEqual(oNewManifest["sap.app"]["dataSources"]["fhirDataSource"]["uri"], "/dataSource/fhir", ADDED_DATASOURCE.replace("{0}", "uri"));
			assert.strictEqual(oNewManifest["sap.app"]["dataSources"]["fhirDataSource"]["type"], "FHIR", ADDED_DATASOURCE.replace("{0}", "type"));
		});

		QUnit.test("when calling '_applyChange' with adding a new model and dataSource in a manifest with not supported dataSource => ERROR", function (assert) {
			var oManifest = {
				"sap.app": {
				},
				"sap.ui5": {
				}
			};

			var oChange = new Change({
				changeType: "appdescr_ui5_addNewModel",
				content: {
					dataSource: {
						notSupportedDataSource: {
							uri: "/dataSource/notSupported",
							type: "NOTSUPPORTED"
						},
						supportedODataDataSource: {
							uri: "/dataSource/supportedODataDataSource",
							type: "OData"
						}
					},
					model: {
						equipment: {
							preload: true,
							dataSource: "notSupportedDataSource",
							settings: {}
						}
					}
				}
			});

			assert.throws(function() {
				AddNewModel.applyChange(oManifest, oChange);
			}, Error("The defined dataSource 'notSupportedDataSource' in the model does not exists as dataSource or must be allowed type of OData|INA|XML|JSON|FHIR|http|WebSocket"),
			"throws error that the dataSource which is defined in the model has to have a supported type 'OData|INA|XML|JSON|FHIR|http|WebSocket' or no type (default OData)");
		});

		QUnit.test("when calling '_applyChange' checks that there is a dataSource with type 'ODataAnnotation' definded which has no dataSources with type 'OData' for that => ERROR", function (assert) {
			var oManifest = {
				"sap.app": {
					dataSources: {
						equipmentanno: {
							uri: "/sap/bc/bsp/sap/BSCBN_ANF_EAM/BSCBN_EQUIPMENT_SRV.anno.XML",
							type: "ODataAnnotation",
							settings: {
								localUri: "model/annotations.xml"
							}
						}
					}
				},
				"sap.ui5": {
					models: {
						i18n: {
							type: "sap.ui.model.resource.ResourceModel",
							uri: "i18n/i18n.properties"
						}
					}
				}
			};

			var oChange = new Change({
				changeType: "appdescr_ui5_addNewModel",
				content: {
					dataSource: {
						equipmentAnnotation: {
							uri: "/sap/bc/bsp/sap/BSCBN_ANF_EAM/BSCBN_EQUIPMENT_SRV.anno.XML",
							type: "ODataAnnotation",
							settings: {
								localUri: "model/annotations.xml"
							}
						}
					},
					model: {
						localModel: {
							type: "some.local.model",
							uri: "local/local.properties"
						}
					}
				}
			});

			assert.throws(function() {
				AddNewModel.applyChange(oManifest, oChange);
			}, Error("There is no dataSource with type 'OData' defined which includes the annotation 'equipmentAnnotation'"),
			"throws error that there is a dataSource with type 'ODataAnnotation' definded which has no dataSources with type 'OData' for that");
		});

		QUnit.test("when calling '_applyChange' with adding a new model and 3 dataSources which has dataSource type 'ODataAnnotation' and one dataSource with type 'OData' => SUCCESS", function (assert) {
			var oManifest = {
				"sap.app": {
				},
				"sap.ui5": {
				}
			};

			var oChange = new Change({
				changeType: "appdescr_ui5_addNewModel",
				content: {
					dataSource: {
						"customer.fancy_annotation1": {
							uri: "/sap/bc/bsp/sap/BSCBN_ANF_EAM/BSCBN_EQUIPMENT_SRV.anno1.XML",
							type: "ODataAnnotation",
							settings: {}
						},
						"customer.fancy_annotation2": {
							uri: "/sap/bc/bsp/sap/BSCBN_ANF_EAM/BSCBN_EQUIPMENT_SRV.anno2.XML",
							type: "ODataAnnotation",
							settings: {}
						},
						"customer.fancy_annotation3": {
							uri: "/sap/bc/bsp/sap/BSCBN_ANF_EAM/BSCBN_EQUIPMENT_SRV.anno3.XML",
							type: "ODataAnnotation",
							settings: {}
						},
						equipmentDataSource: {
							uri: "/dataSource/odata",
							type: "OData",
							settings: {
								annotations: ["customer.fancy_annotation1", "customer.fancy_annotation2", "customer.fancy_annotation3"]
							}
						}
					},
					model: {
						equipment: {
							preload: true,
							dataSource: "equipmentDataSource",
							settings: {}
						}
					}
				}
			});

			var oNewManifest = AddNewModel.applyChange(oManifest, oChange);

			assert.strictEqual(oNewManifest["sap.ui5"]["models"].hasOwnProperty("equipment"), true, ADDED_MODEL.replace("{0}", "object equipment"));
			assert.strictEqual(oNewManifest["sap.ui5"]["models"]["equipment"]["preload"], true, ADDED_MODEL.replace("{0}", "preload"));
			assert.strictEqual(JSON.stringify(oNewManifest["sap.ui5"]["models"]["equipment"]["settings"]), "{}", ADDED_MODEL.replace("{0}", "settings"));

			assert.strictEqual(oNewManifest["sap.app"]["dataSources"].hasOwnProperty("customer.fancy_annotation1"), true, ADDED_DATASOURCE.replace("{0}", "customer.fancy_annotation1 object"));
			assert.strictEqual(oNewManifest["sap.app"]["dataSources"]["customer.fancy_annotation1"]["uri"], "/sap/bc/bsp/sap/BSCBN_ANF_EAM/BSCBN_EQUIPMENT_SRV.anno1.XML", ADDED_DATASOURCE.replace("{0}", "uri"));
			assert.strictEqual(oNewManifest["sap.app"]["dataSources"]["customer.fancy_annotation1"]["type"], "ODataAnnotation", ADDED_DATASOURCE.replace("{0}", "type"));
			assert.strictEqual(JSON.stringify(oNewManifest["sap.app"]["dataSources"]["customer.fancy_annotation1"]["settings"]), "{}", ADDED_DATASOURCE.replace("{0}", "settings"));

			assert.strictEqual(oNewManifest["sap.app"]["dataSources"].hasOwnProperty("customer.fancy_annotation2"), true, ADDED_DATASOURCE.replace("{0}", "customer.fancy_annotation2 object"));
			assert.strictEqual(oNewManifest["sap.app"]["dataSources"]["customer.fancy_annotation2"]["uri"], "/sap/bc/bsp/sap/BSCBN_ANF_EAM/BSCBN_EQUIPMENT_SRV.anno2.XML", ADDED_DATASOURCE.replace("{0}", "uri"));
			assert.strictEqual(oNewManifest["sap.app"]["dataSources"]["customer.fancy_annotation2"]["type"], "ODataAnnotation", ADDED_DATASOURCE.replace("{0}", "type"));
			assert.strictEqual(JSON.stringify(oNewManifest["sap.app"]["dataSources"]["customer.fancy_annotation2"]["settings"]), "{}", ADDED_DATASOURCE.replace("{0}", "settings"));

			assert.strictEqual(oNewManifest["sap.app"]["dataSources"].hasOwnProperty("customer.fancy_annotation3"), true, ADDED_DATASOURCE.replace("{0}", "customer.fancy_annotation3 object"));
			assert.strictEqual(oNewManifest["sap.app"]["dataSources"]["customer.fancy_annotation3"]["uri"], "/sap/bc/bsp/sap/BSCBN_ANF_EAM/BSCBN_EQUIPMENT_SRV.anno3.XML", ADDED_DATASOURCE.replace("{0}", "uri"));
			assert.strictEqual(oNewManifest["sap.app"]["dataSources"]["customer.fancy_annotation3"]["type"], "ODataAnnotation", ADDED_DATASOURCE.replace("{0}", "type"));
			assert.strictEqual(JSON.stringify(oNewManifest["sap.app"]["dataSources"]["customer.fancy_annotation3"]["settings"]), "{}", ADDED_DATASOURCE.replace("{0}", "settings"));

			assert.strictEqual(oNewManifest["sap.app"]["dataSources"].hasOwnProperty("equipmentDataSource"), true, ADDED_DATASOURCE.replace("{0}", "equipmentDataSource"));
			assert.strictEqual(oNewManifest["sap.app"]["dataSources"]["equipmentDataSource"]["uri"], "/dataSource/odata", ADDED_DATASOURCE.replace("{0}", "uri"));
			assert.strictEqual(oNewManifest["sap.app"]["dataSources"]["equipmentDataSource"]["type"], "OData", ADDED_DATASOURCE.replace("{0}", "type"));
			assert.strictEqual(oNewManifest["sap.app"]["dataSources"]["equipmentDataSource"].hasOwnProperty("settings"), true, ADDED_DATASOURCE.replace("{0}", "settings"));
			assert.strictEqual(oNewManifest["sap.app"]["dataSources"]["equipmentDataSource"]["settings"]["annotations"][0], "customer.fancy_annotation1", ADDED_DATASOURCE.replace("{0}", "annotations customer.fancy_annotation1"));
			assert.strictEqual(oNewManifest["sap.app"]["dataSources"]["equipmentDataSource"]["settings"]["annotations"][1], "customer.fancy_annotation2", ADDED_DATASOURCE.replace("{0}", "annotations customer.fancy_annotation2"));
			assert.strictEqual(oNewManifest["sap.app"]["dataSources"]["equipmentDataSource"]["settings"]["annotations"][2], "customer.fancy_annotation3", ADDED_DATASOURCE.replace("{0}", "annotations customer.fancy_annotation3"));
			assert.strictEqual(oNewManifest["sap.app"]["dataSources"]["equipmentDataSource"]["settings"]["annotations"][3], undefined, "There are not more then 3 sap.app dataSource annotations.");
		});

		QUnit.test("when calling '_applyChange' with adding a new model and 3 dataSources which has dataSource type 'ODataAnnotation' and one dataSource with type 'OData' but not including one of the typed 'ODataAnnotation' dataSources => ERROR", function (assert) {
			var oManifest = {
				"sap.app": {
				},
				"sap.ui5": {
				}
			};

			var oChange = new Change({
				changeType: "appdescr_ui5_addNewModel",
				content: {
					dataSource: {
						"customer.fancy_annotation1": {
							uri: "/sap/bc/bsp/sap/BSCBN_ANF_EAM/BSCBN_EQUIPMENT_SRV.anno1.XML",
							type: "ODataAnnotation",
							settings: {}
						},
						"customer.fancy_annotation2": {
							uri: "/sap/bc/bsp/sap/BSCBN_ANF_EAM/BSCBN_EQUIPMENT_SRV.anno2.XML",
							type: "ODataAnnotation",
							settings: {}
						},
						"customer.fancy_annotation3": {
							uri: "/sap/bc/bsp/sap/BSCBN_ANF_EAM/BSCBN_EQUIPMENT_SRV.anno3.XML",
							type: "ODataAnnotation",
							settings: {}
						},
						equipmentDataSource: {
							uri: "/dataSource/odata",
							type: "OData",
							settings: {
								annotations: ["customer.fancy_annotation1", "customer.fancy_annotation3"]
							}
						}
					},
					model: {
						equipment: {
							preload: true,
							dataSource: "equipmentDataSource",
							settings: {}
						}
					}
				}
			});

			assert.throws(function() {
				AddNewModel.applyChange(oManifest, oChange);
			}, Error("There is no dataSource with type 'OData' defined which includes the annotation 'customer.fancy_annotation2'"),
			"throws error that when a dataSource is defined with the type 'ODataAnnotation', then there must be an additional dataSource that has the type 'OData' including the typed 'ODataAnnotation' in annotations array.");
		});

		QUnit.test("when calling '_applyChange' with adding only a new dataSource => ERROR", function (assert) {
			var oManifest = {
				"sap.app": {
				},
				"sap.ui5": {
				}
			};

			var oChange = new Change({
				changeType: "appdescr_ui5_addNewModel",
				content: {
					dataSource: {
						notSupportedDataSource: {
							uri: "/dataSource/notSupported",
							type: "NOTSUPPORTED"
						}
					}
				}
			});

			assert.throws(function() {
				AddNewModel.applyChange(oManifest, oChange);
			}, Error("No model defined"),
			"throws error that for a dataSource in change there must be also a model in change");
		});

		QUnit.test("when calling '_applyChange' with adding unsed dataSource => ERROR", function (assert) {
			var oManifest = {
				"sap.app": {
				},
				"sap.ui5": {
				}
			};

			var oChange = new Change({
				changeType: "appdescr_ui5_addNewModel",
				content: {
					dataSource: {
						notUsedDataSource: {
							uri: "/not/used/dataSource",
							type: "OData"
						}
					},
					model: {
						i18n: {
							type: "sap.ui.model.resource.ResourceModel",
							uri: "i18n/i18n.properties"
						}
					}
				}
			});

			assert.throws(function() {
				AddNewModel.applyChange(oManifest, oChange);
			}, Error("The dataSource in the change 'notUsedDataSource' is not used by any model in the change. A dataSource in the change must be used by model in the change"),
			"throws error that the dataSource in change is not used from any model in the change");
		});

		QUnit.test("when calling '_applyChange' by adding a new model which refers to an existing dataSource in the manifest (without type check) => SUCCESS", function (assert) {
			var oManifest = {
				"sap.app": {
					dataSources: {
						anyTypeDataSource: {
							uri: "/any/type/dataSource",
							type: "ANYTYPE"
						}
					}
				},
				"sap.ui5": {
				}
			};

			var oChange = new Change({
				changeType: "appdescr_ui5_addNewModel",
				content: {
					model: {
						equipment: {
							preload: true,
							dataSource: "anyTypeDataSource",
							settings: {}
						}
					}
				}
			});

			var oNewManifest = AddNewModel.applyChange(oManifest, oChange);

			assert.strictEqual(oNewManifest["sap.ui5"]["models"].hasOwnProperty("equipment"), true, ADDED_MODEL.replace("{0}", "object equipment"));
			assert.strictEqual(oNewManifest["sap.ui5"]["models"]["equipment"]["preload"], true, ADDED_MODEL.replace("{0}", "preload"));
			assert.strictEqual(oNewManifest["sap.ui5"]["models"]["equipment"]["dataSource"], "anyTypeDataSource", ADDED_MODEL.replace("{0}", "dataSource"));
			assert.strictEqual(JSON.stringify(oNewManifest["sap.ui5"]["models"]["equipment"]["settings"]), "{}", ADDED_MODEL.replace("{0}", "settings"));

			assert.strictEqual(oNewManifest["sap.app"]["dataSources"].hasOwnProperty("anyTypeDataSource"), true, ALREADY_EXISTING_DATASOURCE.replace("{0}", "anyTypeDataSource"));
			assert.strictEqual(oNewManifest["sap.app"]["dataSources"]["anyTypeDataSource"]["uri"], "/any/type/dataSource", ALREADY_EXISTING_DATASOURCE.replace("{0}", "dataSource"));
			assert.strictEqual(oNewManifest["sap.app"]["dataSources"]["anyTypeDataSource"]["type"], "ANYTYPE", ALREADY_EXISTING_DATASOURCE.replace("{0}", "type"));
		});

		QUnit.test("when calling '_applyChange' by adding a new model which refers to an existing dataSource in the manifest which is type of 'ODataAnnotation' => ERROR", function (assert) {
			var oManifest = {
				"sap.app": {
					dataSources: {
						annoDataSource: {
							uri: "/anno/dataSource",
							type: "ODataAnnotation"
						}
					}
				},
				"sap.ui5": {
				}
			};

			var oChange = new Change({
				changeType: "appdescr_ui5_addNewModel",
				content: {
					model: {
						equipment: {
							preload: true,
							dataSource: "annoDataSource",
							settings: {}
						}
					}
				}
			});

			assert.throws(function() {
				AddNewModel.applyChange(oManifest, oChange);
			}, Error("The already existing dataSource 'annoDataSource' in the manifest is type of 'ODataAnnotation'. A model must not reference to a dataSource which is of type 'ODataAnnotation'"),
			"throws error that the model in the change is referencing to a dataSource which is type of 'ODataAnnotation' and this is not allowed'");
		});

		QUnit.test("when calling '_applyChange' by adding '2' new models => ERROR", function (assert) {
			var oManifest = {
				"sap.app": {
					dataSources: {
						fhirDataSource: {
							uri: "/fhir/dataSource",
							type: "FHIR"
						},
						oDataDataSource: {
							uri: "/odata/dataSource",
							type: "OData"
						}
					}
				},
				"sap.ui5": {
				}
			};

			var oChange = new Change({
				changeType: "appdescr_ui5_addNewModel",
				content: {
					model: {
						equipment1: {
							preload: true,
							dataSource: "fhirDataSource",
							settings: {}
						},
						equipment2: {
							preload: true,
							dataSource: "oDataDataSource",
							settings: {}
						}
					}
				}
			});

			assert.throws(function() {
				AddNewModel.applyChange(oManifest, oChange);
			}, Error("There are currently '2' models in the change. Currently it is only allowed to add '1' model"),
			"throws error that currently only '1' model can be added");
		});

		QUnit.test("when calling '_applyChange' with adding a new model and dataSource in a manifest with dataSource type http => SUCCESS", function (assert) {
			var oManifest = {
				"sap.app": {
				},
				"sap.ui5": {
				}
			};

			var oChange = new Change({
				changeType: "appdescr_ui5_addNewModel",
				content: {
					dataSource: {
						httpDataSource: {
							uri: "/dataSource/http",
							type: "http"
						}
					},
					model: {
						equipment: {
							preload: true,
							dataSource: "httpDataSource",
							settings: {}
						}
					}
				}
			});

			var oNewManifest = AddNewModel.applyChange(oManifest, oChange);

			assert.strictEqual(oNewManifest["sap.ui5"]["models"].hasOwnProperty("equipment"), true, ADDED_MODEL.replace("{0}", "object equipment"));
			assert.strictEqual(oNewManifest["sap.ui5"]["models"]["equipment"]["preload"], true, ADDED_MODEL.replace("{0}", "preload"));
			assert.strictEqual(oNewManifest["sap.ui5"]["models"]["equipment"]["dataSource"], "httpDataSource", ADDED_MODEL.replace("{0}", "dataSource"));
			assert.strictEqual(JSON.stringify(oNewManifest["sap.ui5"]["models"]["equipment"]["settings"]), "{}", ADDED_MODEL.replace("{0}", "settings"));

			assert.strictEqual(oNewManifest["sap.app"]["dataSources"].hasOwnProperty("httpDataSource"), true, ADDED_DATASOURCE.replace("{0}", "httpDataSource"));
			assert.strictEqual(oNewManifest["sap.app"]["dataSources"]["httpDataSource"]["uri"], "/dataSource/http", ADDED_DATASOURCE.replace("{0}", "uri"));
			assert.strictEqual(oNewManifest["sap.app"]["dataSources"]["httpDataSource"]["type"], "http", ADDED_DATASOURCE.replace("{0}", "type"));
		});

		QUnit.test("when calling '_applyChange' with adding a new model and dataSource in a manifest with dataSource type WebSocket => SUCCESS", function (assert) {
			var oManifest = {
				"sap.app": {
				},
				"sap.ui5": {
				}
			};

			var oChange = new Change({
				changeType: "appdescr_ui5_addNewModel",
				content: {
					dataSource: {
						webSocketDataSource: {
							uri: "/dataSource/webSocket",
							type: "WebSocket"
						}
					},
					model: {
						equipment: {
							preload: true,
							dataSource: "webSocketDataSource",
							settings: {}
						}
					}
				}
			});

			var oNewManifest = AddNewModel.applyChange(oManifest, oChange);

			assert.strictEqual(oNewManifest["sap.ui5"]["models"].hasOwnProperty("equipment"), true, ADDED_MODEL.replace("{0}", "object equipment"));
			assert.strictEqual(oNewManifest["sap.ui5"]["models"]["equipment"]["preload"], true, ADDED_MODEL.replace("{0}", "preload"));
			assert.strictEqual(oNewManifest["sap.ui5"]["models"]["equipment"]["dataSource"], "webSocketDataSource", ADDED_MODEL.replace("{0}", "dataSource"));
			assert.strictEqual(JSON.stringify(oNewManifest["sap.ui5"]["models"]["equipment"]["settings"]), "{}", ADDED_MODEL.replace("{0}", "settings"));

			assert.strictEqual(oNewManifest["sap.app"]["dataSources"].hasOwnProperty("webSocketDataSource"), true, ADDED_DATASOURCE.replace("{0}", "webSocketDataSource"));
			assert.strictEqual(oNewManifest["sap.app"]["dataSources"]["webSocketDataSource"]["uri"], "/dataSource/webSocket", ADDED_DATASOURCE.replace("{0}", "uri"));
			assert.strictEqual(oNewManifest["sap.app"]["dataSources"]["webSocketDataSource"]["type"], "WebSocket", ADDED_DATASOURCE.replace("{0}", "type"));
		});
	});

	QUnit.done(function() {
		jQuery("#qunit-fixture").hide();
	});
});
