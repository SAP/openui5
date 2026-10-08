/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/Log",
	"sap/base/util/merge",
	"sap/base/util/ObjectPath",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/odata/v4/ODataModel",
	"sap/ui/integration/util/Utils",
	"./Constants"
], function (
	Log,
	merge,
	ObjectPath,
	JSONModel,
	ODataModel,
	Utils,
	Constants
) {
	"use strict";

	/**
	 * Data loading helper for the Editor control.
	 * Contains methods for requesting field values, extension data,
	 * value-list models, and OData metadata models.
	 *
	 * @namespace
	 * @alias sap.ui.integration.editor.EditorDataLoading
	 * @static
	 * @private
	 */
	var EditorDataLoading = {};

	/**
	 * Requests data for a field using the editor's DataProviderFactory,
	 * filters it according to page-admin values, and updates the field's model.
	 *
	 * @param {sap.ui.integration.editor.Editor} oEditor
	 * @param {object} oConfig field configuration
	 * @param {sap.ui.integration.editor.fields.BaseField} oField
	 * @returns {Promise}
	 */
	EditorDataLoading._requestData = function (oEditor, oConfig, oField) {
		var oDataProvider = oEditor._oDataProviderFactory.create(oConfig.values.data);
		oDataProvider.bindObject({
			path: "items>/form/items"
		});
		oDataProvider.bindObject({
			path: "currentSettings>" + oConfig._settingspath
		});
		oDataProvider.bindObject({
			path: "context>/"
		});
		return oDataProvider._waitDependencies().then(function () {
			return oDataProvider.getData();
		}).then(function (oData) {
			if (oConfig._cancel) {
				oConfig._values = [];
				oEditor._oSettingsModel.setProperty(oConfig._settingspath + "/_loading", false);
				return;
			}
			// filter data for page admin
			var oPath = oConfig.values.data.path,
			    aPath,
			    tResult = [];
			if (oPath && oPath !== "/") {
				if (oPath.startsWith("/")) {
					oPath = oPath.substring(1);
				}
				if (oPath.endsWith("/")) {
					oPath = oPath.substring(0, oPath.length - 1);
				}
				aPath = oPath.split("/");
				tResult = ObjectPath.get(aPath, oData);
			} else {
				tResult = oData;
			}
			if (oConfig.type === "object" || oConfig.type === "object[]") {
				tResult.forEach(function (oResult) {
					oResult._dt = {
						_editable: false
					};
				});
			}
			if (oEditor.getMode() === Constants.EDITOR_MODE.CONTENT && oConfig.pageAdminValues && oConfig.pageAdminValues.length > 0) {
				var paValues = oConfig.pageAdminValues,
				    selValues = oConfig.value,
					selValueItems = oConfig.valueItems || [],
				    results = [],
					selResults = [],
					selItemsResults = [];
				oEditor.prepareFieldsInKey(oConfig);
				if (paValues.length > 0) {
					for (var i = 0; i < paValues.length; i++) {
						for (var j = 0; j < tResult.length; j++) {
							var keyValue = oEditor.getKeyFromItem(tResult[j]);
							if (paValues[i] === keyValue) {
								results.push(tResult[j]);
							}
						}
						if (Array.isArray(selValues)) {
							for (var k = 0; k < selValues.length; k++) {
								if (paValues[i] === selValues[k]) {
									selResults.push(selValues[k]);
								}
							}
							for (var l = 0; l < selValueItems.length; l++) {
								var kValue = oEditor.getKeyFromItem(selValueItems[l]);
								if (paValues[i] === kValue) {
									selItemsResults.push(selValueItems[l]);
								}
							}
						}
					}
					if (selResults.length > 0) {
						oConfig.value = [];
						oConfig.value = selResults;
					}
					if (selItemsResults.length > 0) {
						oConfig.valueItems = [];
						oConfig.valueItems = selItemsResults;
					}
				}
				if (oConfig.values.data.path && oConfig.values.data.path !== "/") {
					delete oData[aPath];
					ObjectPath.set(aPath, results, oData);
				} else {
					oData = [];
					oData = results;
				}
			}
			//add group property "Selected" to each record for MultiComboBox in StringListField
			//user configration of the field since its value maybe changed
			var oFieldConfig = oField.getConfiguration();
			if (oConfig.type === "string[]") {
				var sPath = oConfig.values.data.path;
				if (sPath && sPath !== "/") {
					if (sPath.startsWith("/")) {
						sPath = sPath.substring(1);
					}
					if (sPath.endsWith("/")) {
						sPath = sPath.substring(0, sPath.length - 1);
					}
					var aPath = sPath.split("/");
					var oResult = ObjectPath.get(aPath, oData);
					if (Array.isArray(oResult)) {
						for (var n in oResult) {
							var sKey = oField.getKeyFromItem(oResult[n]);
							if (Array.isArray(oFieldConfig.value) && oFieldConfig.value.length > 0 && oFieldConfig.value.includes(sKey)) {
								oResult[n].Selected = oEditor._oResourceBundle.getText("EDITOR_ITEM_SELECTED");
							} else {
								oResult[n].Selected = oEditor._oResourceBundle.getText("EDITOR_ITEM_UNSELECTED");
							}
						}
						ObjectPath.set(aPath, oResult, oData);
					}
				} else if (Array.isArray(oData)) {
					for (var n in oData) {
						var sKey = oField.getKeyFromItem(oData[n]);
						if (Array.isArray(oFieldConfig.value) && oFieldConfig.value.length > 0 && oFieldConfig.value.includes(sKey)) {
							oData[n].Selected = oEditor._oResourceBundle.getText("EDITOR_ITEM_SELECTED");
						} else {
							oData[n].Selected = oEditor._oResourceBundle.getText("EDITOR_ITEM_UNSELECTED");
						}
					}
				}
			}
			oConfig._values = oData;
			var oValueModel = oField.getModel();
			oValueModel.setData(oData);
			oValueModel.checkUpdate(true);
			oValueModel.firePropertyChange();
			if (oConfig.type === "object" || oConfig.type === "object[]") {
				oField.mergeValueWithRequestResult(tResult);
			}
			oEditor._oSettingsModel.setProperty(oConfig._settingspath + "/_loading", false);
			oField._hideValueState(true, true);
		}).catch(function (oError) {
			var oErrorPromise = new Promise(function (resolve) {
				var sError = oEditor._oResourceBundle.getText("EDITOR_BAD_REQUEST");
				if (Array.isArray(oError) && oError.length > 0) {
					sError = oError[0];
					var oResponse = oError[1];
					if (oResponse) {
						var oErrorInResponse;
						oResponse.text().then(function (sResponseText) {
							if (Utils.isJson(sResponseText)) {
								oErrorInResponse = JSON.parse(sResponseText).error;
							} else {
								sError = sResponseText;
							}

							if (oErrorInResponse) {
								sError = (oErrorInResponse.code || oErrorInResponse.errorCode || oResponse.status) + ": " + oErrorInResponse.message;
							}

							resolve(sError);
						});
						return;
					} else {
						resolve(sError);
						return;
					}
				} else if (typeof (oError) === "string") {
					sError = oError;
					resolve(sError);
					return;
				} else {
					resolve(sError);
					return;
				}
			});

			return oErrorPromise.then(function (sError) {
				var oValueModel = oField.getModel();
				oValueModel.firePropertyChange();
				if (oConfig.type === "object" || oConfig.type === "object[]") {
					oField.mergeValueWithRequestResult();
				}
				oEditor._oSettingsModel.setProperty(oConfig._settingspath + "/_loading", false);
				oField._showValueState("error", sError, true);
			});
		});
	};

	/**
	 * Requests data from the editor's extension and sets it on the extension's model.
	 *
	 * @param {sap.ui.integration.editor.Editor} oEditor
	 * @returns {Promise}
	 */
	EditorDataLoading.requestExtensionData = function (oEditor) {
		var oExtension = oEditor.getAggregation("_extension");
		if (!oExtension) {
			Log.info("sap.ui.integration.editor.Editor: extension is not defined or created, do not load data of it.");
			return new Promise(function (resolve, reject) {
				resolve();
			});
		}
		var bHasExtensionData = false;
		var oExtensionConfig = {};
		var oExtensionProperty = oEditor._oManifest.get(oEditor.getConfigurationPath() + "/data/extension");
		var sPath;
		if (oExtensionProperty) {
			bHasExtensionData = true;
			sPath = oEditor._oManifest.get(oEditor.getConfigurationPath() + "/data/path");
			oExtensionConfig = {
				"extension": oExtensionProperty
			};
			if (sPath) {
				oExtensionConfig.path = sPath;
			}
		} else {
			oExtensionProperty = oEditor._oManifest.get("/" + oEditor.getSection() + "/data/extension");
			if (oExtensionProperty) {
				bHasExtensionData = true;
				sPath = oEditor._oManifest.get("/" + oEditor.getSection() + "/data/path");
				oExtensionConfig = {
					"extension": oExtensionProperty
				};
				if (sPath) {
					oExtensionConfig.path = sPath;
				}
			}
		}
		if (!bHasExtensionData) {
			Log.info("sap.ui.integration.editor.Editor: extension data is not defined in manifest, do not load data of it.");
			return new Promise(function (resolve, reject) {
				resolve();
			});
		}
		var oDataProvider = oEditor._oDataProviderFactory.create(oExtensionConfig);
		return oDataProvider._waitDependencies().then(function () {
			return oDataProvider.getData();
		}).then(function (oData) {
			var oValueModel = oExtension.getModel();
			if (!oValueModel) {
				oValueModel = new JSONModel(oData || {});
				oExtension.setModel(oValueModel, undefined);
			} else {
				oValueModel.setData(oData);
			}
			oValueModel.checkUpdate(true);
		}).catch(function (oError) {
			var sError = oEditor._oResourceBundle.getText("EDITOR_BAD_REQUEST");
			if (Array.isArray(oError) && oError.length > 0) {
				sError = oError[0];
				var oResponse = oError[1];
				if (oResponse) {
					var oErrorInResponse;
					oResponse.text().then(function (sResponseText) {
						if (Utils.isJson(sResponseText)) {
							oErrorInResponse = JSON.parse(sResponseText).error;
						} else {
							sError = sResponseText;
						}

						if (oErrorInResponse) {
							sError = (oErrorInResponse.code || oErrorInResponse.errorCode || oResponse.status) + ": " + oErrorInResponse.message;
						}

						Log.error("sap.ui.integration.editor.Editor: request extension data failed, " + sError);
					});
				}
			} else if (typeof (oError) === "string") {
				sError = oError;
				Log.error("sap.requestDataui.integration.editor.Editor: request extension data failed, " + sError);
			}
		});
	};

	/**
	 * Creates (or reuses) an unnamed value model for a field if a values.data or
	 * values (extension) section exists in the field configuration.
	 *
	 * @param {sap.ui.integration.editor.Editor} oEditor
	 * @param {object} oConfig field configuration
	 * @param {sap.ui.integration.editor.fields.BaseField} oField
	 * @param {number} [nTimeout] optional delay in ms before issuing the data request
	 * @returns {Promise|undefined}
	 */
	EditorDataLoading.addValueListModel = function (oEditor, oConfig, oField, nTimeout) {
		if (oConfig.values) {
			var oValueModel;
			if (oConfig.values.data) {
				//we use the binding context to connect the given path from oConfig.values.data.path
				//with that the result of the data request can be have also other structures.
				oField.bindObject({
					path: oConfig.values.data.path || "/"
				});
				if (oEditor._oDataProviderFactory) {
					oValueModel = oField.getModel();
					if (!oValueModel) {
						oValueModel = new JSONModel({});
						oField.setModel(oValueModel, undefined);
					}
					oEditor._oSettingsModel.setProperty(oConfig._settingspath + "/_loading", true);
					if (!nTimeout) {
						return EditorDataLoading._requestData(oEditor, oConfig, oField);
					} else {
						setTimeout(function() {
							EditorDataLoading._requestData(oEditor, oConfig, oField);
						}, nTimeout);
					}
				}
			} else if (oEditor.getAggregation("_extension")) {
				oValueModel = oEditor.getAggregation("_extension").getModel();
				//filter data for page admin
				if (oValueModel && oEditor.getMode() === Constants.EDITOR_MODE.CONTENT && oConfig.pageAdminValues && oConfig.pageAdminValues.length > 0) {
					oEditor.prepareFieldsInKey(oConfig);
					var ePath = oConfig.values.path;
					if (ePath.length > 1) {
						ePath = ePath.substring(1);
					}
					var oValueData = ObjectPath.get([ePath], oValueModel.getData()),
					    paValues = oConfig.pageAdminValues,
						results = [];
					for (var m = 0; m < paValues.length; m++) {
						for (var j = 0; j < oValueData.length; j++) {
							var keyValue = oEditor.getKeyFromItem(oValueData[j]);
							if (paValues[m] === keyValue) {
								results.push(oValueData[j]);
							}
						}
					}
					delete oValueData[ePath];
					ObjectPath.set(ePath, results, oValueData);
					oValueModel.setData(oValueData);
				}
				//we use the binding context to connect the given path from oConfig.values.path
				//with that the result of the data request can be have also other structures.
				oField.bindObject({
					path: oConfig.values.path || "/"
				});
				//in the designtime the item bindings will not use a named model, therefore we add a unnamed model for the field
				//to carry the values.
				oField.setModel(oValueModel, undefined);
				return Promise.resolve(null);
			}
		}
	};

	/**
	 * Creates an OData metadata model for a field if a values.metadata section
	 * exists in the field configuration.
	 *
	 * @param {sap.ui.integration.editor.Editor} oEditor
	 * @param {object} oConfig field configuration
	 * @param {sap.ui.integration.editor.fields.BaseField} oField
	 */
	EditorDataLoading.addMetadataModel = function (oEditor, oConfig, oField) {
		if (oConfig.values && oConfig.values.metadata) {
			var oRequestDefaultParameters = merge({}, oConfig.values.metadata.request);

			var oRequest = {
				url: oRequestDefaultParameters.serviceUrl
			};
			var pRequestChain = Promise.resolve(oRequest);
			if (oEditor._oDestinations) {
				pRequestChain = oEditor._oDestinations.process(oRequest);
			}
			pRequestChain.then(function(oData) {
				if (!oData.url.endsWith("/")) {
					oData.url = oData.url + "/";
				}
				oRequestDefaultParameters.serviceUrl = oData.url;
				var oMetaDataModel = new ODataModel(oRequestDefaultParameters);
				oMetaDataModel.oMetaModel.fetchData().then(function(oMetaData) {
					oField.setModel(new JSONModel(oMetaData), "meta");
				});
			});
		}
	};

	return EditorDataLoading;

});
