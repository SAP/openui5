/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/integration/editor/fields/ObjectField",
	"sap/ui/core/Core",
	"sap/ui/model/json/JSONModel",
	"sap/ui/table/Table",
	"sap/base/util/deepEqual",
	"sap/base/util/deepClone",
	"sap/base/util/includes"
], function (
	ObjectField,
	Core,
	JSONModel,
	Table,
	deepEqual,
	deepClone,
	includes
) {
	"use strict";

	/**
	 * @class Object List Field with object list value, such as [{"key": "key1"}, {"key": "key2"}]
	 * @extends sap.ui.integration.editor.fields.ObjectField
	 * @alias sap.ui.integration.editor.fields.ObjectListField
	 * @author SAP SE
	 * @since 1.100.0
	 * @version ${version}
	 * @private
	 * @experimental since 1.100.0
	 * @ui5-restricted
	 */
	var ObjectListField = ObjectField.extend("sap.ui.integration.editor.fields.ObjectListField", {
		metadata: {
			library: "sap.ui.integration"
		},
		renderer: ObjectField.getMetadata().getRenderer()
	});

	ObjectListField.prototype.initVisualization = function (oConfig) {
		var that = this;
		that._newObjectTemplate = {};
		that._bIsEnableSelectAllInTable = true;
		var oVisualization = oConfig.visualization;
		if (!oVisualization) {
			if (oConfig.value && !oConfig.properties && (!oConfig.values || (oConfig.values && !oConfig.values.metadata))) {
				that.parseValueProperties();
			}
			if (oConfig.values || oConfig.properties) {
				oVisualization = that.createTableVisualization(oConfig);
			} else {
				oVisualization = that.createTextAreaVisualization(oConfig);
			}
			oConfig.withLabel = true;
		}
		this._visualization = oVisualization;
		this.attachAfterInit(this._afterInit);
	};

	ObjectListField.prototype._afterInit = function () {
		var that = this;
		var oControl = that.getAggregation("_field");
		if (oControl instanceof Table) {
			oControl.addStyleClass("sapUiIntegrationEditorItemObjectListFieldTable");
			// select all the rows if values from config.value
			var oConfig = that.getConfiguration();
			if (!oConfig.values){
				var oValue = deepClone(oConfig.value, 500) || [];
				oControl.setModel(new JSONModel({
					value: oValue
				}));
				oControl.selectAll();
			}
		}
	};

	ObjectListField.prototype.parseValueProperties = function() {
		var that = this;
		var oConfig = that.getConfiguration();
		if (Array.isArray(oConfig.value) && oConfig.value.length > 0 && !oConfig.properties) {
			var oProperties = {};
			oConfig.value.forEach(function(oObject) {
				for (var n in oObject) {
					if (!oProperties[n]) {
						var sType = typeof oObject[n];
						var oProperty = sType === "string" ? {} : {"type": sType};
						oProperties[n] = oProperty;
					}
				}
			});
			if (!deepEqual(oProperties, {})) {
				oConfig.properties = oProperties;
				oConfig._propertiesParsedFromValue = true;
			}
		}
	};

	ObjectListField.prototype.onSelectionChange = function (oEvent) {
		var that = this;
		var oControl = oEvent.getSource();
		var bUserInteraction = oEvent.getParameter("userInteraction") || false;
		// only update data models if is user interaction
		if (bUserInteraction) {
			var aSelectedIndices = oControl.getSelectedIndices();

			var oRowContexts = oControl.getBinding("rows").getContexts();
			var oValue;
			if (aSelectedIndices.length > 0) {
				oValue = [];
				aSelectedIndices.forEach(function(iSelectedIndice) {
					var oObject = oRowContexts[iSelectedIndice].getObject();
					oValue.push(deepClone(oObject, 500));
				});
			}

			// merge the selections with the ones which not been seen since filtering
			if (oControl._aPathsOfFilteredOut && oControl._aPathsOfFilteredOut.length > 0) {
				oValue = oValue || [];
				var oModel = oControl.getModel();
				oControl._aPathsOfFilteredOut.forEach(function(sPathOfFilteredOut) {
					var oObject = oModel.getProperty(sPathOfFilteredOut);
					oValue.push(deepClone(oObject, 500));
				});
			}
			that._setCurrentProperty("value", oValue);
		}
	};

	ObjectListField.prototype.mergeValueWithRequestResult = function (tResult) {
		var that = this;
		var oConfig = that.getConfiguration();
		var oTable = that.getAggregation("_field");
		if (oConfig.value && Array.isArray(oConfig.value) && oConfig.value.length > 0) {
			var oValue,
				oModel = oTable.getModel(),
				sPath = oTable.getBinding("rows").getPath();
			if (Array.isArray(tResult) && tResult.length > 0) {
				var aNotSelectedObjects = [];
				for (var i = 0; i < tResult.length; i++) {
					var oRequestObject = tResult[i];
					var bIsSelected = false;
					for (var j = 0; j < oConfig.value.length; j++) {
						if (deepEqual(oConfig.value[j], oRequestObject)) {
							bIsSelected = true;
							break;
						}
					}
					if (!bIsSelected) {
						aNotSelectedObjects.push(oRequestObject);
					}
				}
				tResult = deepClone(oConfig.value.concat(aNotSelectedObjects), 500);
				oModel.setProperty(sPath, tResult);
				oTable.addSelectionInterval(0, oConfig.value.length - 1);
			} else {
				oValue = deepClone(oConfig.value, 500);
				tResult = oValue;
				oModel.setProperty(sPath, tResult);
				oTable.selectAll();
			}
		}
		return tResult;
	};

	ObjectListField.prototype.onChangeOfTextArea = function (oEvent) {
		var that = this;
		var oResourceBundle = that.getResourceBundle();
		var oTextArea = oEvent.getSource();
		var sValue = oTextArea.getValue();
		if (!sValue || sValue === "") {
			that.saveValue(undefined, oTextArea);
		} else {
			try {
				var oValue = JSON.parse(sValue);
				if (!(oValue instanceof Array)) {
					oTextArea.setValueState("Error");
					oTextArea.setValueStateText(oResourceBundle.getText("EDITOR_VAL_NOT_AN_ARRAY_OF_JSONOBJECTS"));
					return;
				}
				that.saveValue(oValue, oTextArea);
			} catch (e) {
				oTextArea.setValueState("Error");
				oTextArea.setValueStateText(oResourceBundle.getText("EDITOR_VAL_NOT_A_JSONOBJECT"));
			}
		}
	};

	ObjectListField.prototype.saveValue = function (oValue, oTextArea, bIsInDetailsPopover) {
		var that = this;
		var oValueModel;
		if (!bIsInDetailsPopover) {
			that._setCurrentProperty("value", oValue);
		} else {
			oValueModel = oTextArea.getModel();
			oValueModel.setProperty("/value", oValue);
		}
		oTextArea.setValueState("None");
		oTextArea.setValueStateText("");
	};

	ObjectListField.prototype.checkHasValue = function() {
		var that = this;
		var oValue = that._getCurrentProperty("value");
		if (Array.isArray(oValue) && oValue.length > 0) {
			return true;
		}
		return false;
	};

	// restore the selections since the selections are lost, BCP: 2280048930, JIRA: CPOUIFTEAMB-252
	ObjectListField.prototype.applyBeforeValueAndSelections = function(sMode, oParameter) {
		var that = this;
		var oControl = that.getAggregation("_field");
		var aSelectedIndices = oParameter.selectedIndices;
		var iRowNumber = oParameter.rowNumber;
		var sBasePath = oControl.getBinding("rows").getPath();
		var aRowContexts = oControl.getBinding("rows").getContexts();
		var iNewRowNumber = aRowContexts.length;
		var iRowIndex = oParameter.rowIndex;
		var oModel = oControl.getModel();
		var oNewValue = [];
		var aSelectedIndicesCloned;
		switch (sMode) {
			case "add":
				// update the selections
				aSelectedIndices.forEach(function(iSelectedIndex) {
					oControl.addSelectionInterval(iSelectedIndex, iSelectedIndex);
				});
				break;
			case "update":
				// update the selections when row number changed which means the update may cause it filter out
				var bIsUpdateSelectedRow = false;
				if (iRowNumber !== iNewRowNumber) {
					aSelectedIndicesCloned = deepClone(aSelectedIndices);
					aSelectedIndices = [];
					aSelectedIndicesCloned.forEach(function(iSelectedIndex) {
						if (iSelectedIndex < iRowIndex) {
							aSelectedIndices.push(iSelectedIndex);
						} else if (iSelectedIndex > iRowIndex) {
							aSelectedIndices.push(iSelectedIndex - 1);
						} else if (iSelectedIndex === iRowIndex) {
							bIsUpdateSelectedRow = true;
							oControl._aPathsOfFilteredOut.push(oParameter.path);
						}
					});

				} else if (includes(aSelectedIndices, iRowIndex)) {
					bIsUpdateSelectedRow = true;
				}
				if (bIsUpdateSelectedRow) {
					//update objects in field value if it is selected
					aSelectedIndices.forEach(function(iIndex) {
						var sSelectedIndicePath = aRowContexts[iIndex].getPath();
						var oObject = oModel.getProperty(sSelectedIndicePath);
						oNewValue.push(deepClone(oObject, 500));
					});
					if (oControl._aPathsOfFilteredOut && oControl._aPathsOfFilteredOut.length > 0) {
						oControl._aPathsOfFilteredOut.forEach(function(sPathOfFilteredOut) {
							var oObject = oModel.getProperty(sPathOfFilteredOut);
							oNewValue.push(deepClone(oObject, 500));
						});
					}
					that._setCurrentProperty("value", oNewValue);
				}
				// reselect the selections
				aSelectedIndices.forEach(function(iSelectedIndex) {
					oControl.addSelectionInterval(iSelectedIndex, iSelectedIndex);
				});
				break;
			case "delete":
				var bIsDeleteSelectedRow = false;
				if (includes(aSelectedIndices, iRowIndex)) {
					bIsDeleteSelectedRow = true;
				}
				aSelectedIndicesCloned = deepClone(aSelectedIndices);
				aSelectedIndices = [];
				aSelectedIndicesCloned.forEach(function(iSelectedIndex) {
					if (iSelectedIndex < iRowIndex) {
						aSelectedIndices.push(iSelectedIndex);
					} else if (iSelectedIndex > iRowIndex) {
						aSelectedIndices.push(iSelectedIndex - 1);
					}
				});
				aSelectedIndices.forEach(function(iSelectedIndex) {
					oControl.addSelectionInterval(iSelectedIndex, iSelectedIndex);
				});
				// update the Paths in oTable._aPathsOfFilteredOut
				if (oControl._aPathsOfFilteredOut && oControl._aPathsOfFilteredOut.length > 0) {
					oControl._aPathsOfFilteredOut = oControl._aPathsOfFilteredOut.map(function (sPathOfFilteredOut) {
						var iRealIndexOfFilteredOut = sPathOfFilteredOut.substring(sPathOfFilteredOut.lastIndexOf("/") + 1);
						if (iRealIndexOfFilteredOut > oParameter.realIndex) {
							iRealIndexOfFilteredOut--;
							return sBasePath + "/" + iRealIndexOfFilteredOut;
						} else {
							return sPathOfFilteredOut;
						}
					});
				}

				if (bIsDeleteSelectedRow) {
					aSelectedIndices.forEach(function(iIndex) {
						var sSelectedIndicePath = aRowContexts[iIndex].getPath();
						var oObject = oModel.getProperty(sSelectedIndicePath);
						oNewValue.push(deepClone(oObject, 500));
					});
					if (oControl._aPathsOfFilteredOut && oControl._aPathsOfFilteredOut.length > 0) {
						oControl._aPathsOfFilteredOut.forEach(function(sPathOfFilteredOut) {
							var oObject = oModel.getProperty(sPathOfFilteredOut);
							oNewValue.push(deepClone(oObject, 500));
						});
					}
					if (oNewValue.length === 0) {
						oNewValue = undefined;
					}
					that._setCurrentProperty("value", oNewValue);
				}
				break;
			case "filter":
				var oColumn = oParameter.column;
				var aPathsOfSelectedObjects = oControl._aPathsOfFilteredOut || [];
				if (aSelectedIndices.length > 0) {
					aSelectedIndices.forEach(function(iSelectedIndice) {
						var sPath = aRowContexts[iSelectedIndice].getPath();
						aPathsOfSelectedObjects.push(sPath);
					});
					oControl._aPathsOfFilteredOut = aPathsOfSelectedObjects;
				}
				if (oColumn._applySelection !== false && oControl._aPathsOfFilteredOut && oControl._aPathsOfFilteredOut.length > 0) {
					oControl.attachEventOnce("rowsUpdated", function() {
						if (oControl._aPathsOfFilteredOut && oControl._aPathsOfFilteredOut.length > 0) {
							// select the exist selected rows
							var aFilteredRowContexts = oControl.getBinding("rows").getContexts() || [];
							for (var i = 0; i < aFilteredRowContexts.length; i++) {
								if (oControl._aPathsOfFilteredOut.length === 0) {
									break;
								}
								var sPath = aFilteredRowContexts[i].getPath();
								for (var j = 0; j < oControl._aPathsOfFilteredOut.length; j++) {
									if (oControl._aPathsOfFilteredOut[j] === sPath) {
										oControl.addSelectionInterval(i, i);
										oControl._aPathsOfFilteredOut.splice(j, 1);
										break;
									}
								}
							}
						}
					});
				}
				delete oColumn._applySelection;
				break;
			default:
		}
	};

	return ObjectListField;
});