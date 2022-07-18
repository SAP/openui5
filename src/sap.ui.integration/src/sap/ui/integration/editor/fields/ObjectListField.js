/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/integration/editor/fields/ObjectField",
	"sap/ui/model/json/JSONModel",
	"sap/ui/table/Table",
	"sap/m/CheckBox",
	"sap/base/util/deepEqual",
	"sap/base/util/deepClone",
	"sap/ui/integration/util/Utils"
], function (
	ObjectField,
	JSONModel,
	Table,
	CheckBox,
	deepEqual,
	deepClone,
	Utils
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
		that._positionCount = 1;
		that._newObjectTemplate = {
			"_dt": {
				"_selected": true,
				"_uuid": ""
			}
		};
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
			var oConfig = that.getConfiguration();
			// select all the results come from config.value
			if (!oConfig.values){
				var oValue = [];
				if (Array.isArray(oConfig.value)) {
					oValue = deepClone(oConfig.value, 500);
					oValue.forEach(function (oItem) {
						oItem._dt = oItem._dt || {};
						oItem._dt._selected = true;
						oItem._dt._uuid = oItem._dt._uuid || Utils.generateUuidV4();
						oItem._dt._position = that._positionCount;
						that._positionCount++;
					});
					//oConfig.value = deepClone(oValue, 500);
				}
				that.setModel(new JSONModel({
					value: oValue,
					_allSelected: true
				}));
				that.bindObject({
					path: "/value"
				});
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
					// not show _dt property which generated and used by editor
					if (!oProperties[n] && n !== "_dt") {
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

	ObjectListField.prototype.buildSelectionColumnLables = function() {
		var that = this;
		var oConfig = that.getConfiguration();
		var oResourceBundle = that.getResourceBundle();
		return new CheckBox({
			selected: "{/_allSelected}",
			visible: typeof oConfig.values !== "undefined",
			tooltip: {
				path: '/_allSelected',
				formatter: function(bAllSelected) {
					if (!bAllSelected) {
						return oResourceBundle.getText("EDITOR_FIELD_OBJECT_LIST_TABLE_COLUMN_SELECTION_TOOLTIP_ADDALL");
					} else {
						return oResourceBundle.getText("EDITOR_FIELD_OBJECT_LIST_TABLE_COLUMN_SELECTION_TOOLTIP_REMOVEALL");
					}
				}
			},
			select: that.onSelectionColumnClick.bind(that)
		});
	};

	ObjectListField.prototype.addNewObject = function (oEvent) {
		var that = this;
		var oControl = oEvent.getSource();
		that._newObjectTemplate._dt._uuid = Utils.generateUuidV4();
		that.openObjectDetailsPopover(that._newObjectTemplate, oControl, "add");
	};

	ObjectListField.prototype.onSelectionColumnClick = function(oEvent) {
		var that = this;
		var bIsSelected = oEvent.getParameter("selected");
		var oTable = that.getAggregation("_field");
		var oRowContexts = oTable.getBinding("rows").getContexts();
		oRowContexts.forEach(function (oRowContext) {
			var oItem = oRowContext.getObject();
			oItem._dt = oItem._dt || {};
			oItem._dt._selected = bIsSelected;
		});

		var oModel = oTable.getModel();
		var sPath = oTable.getBinding("rows").getPath();
		var oData = oModel.getProperty(sPath);
		var aValues;
		oData.forEach(function (oObject) {
			if (oObject._dt && oObject._dt._selected) {
				var oClonedObject = deepClone(oObject, 500);
				aValues = aValues || [];
				aValues.push(oClonedObject);
			}
		});
		oModel.checkUpdate(true);
		that.setValue(aValues);
	};

	ObjectListField.prototype.updateSelectionColumn = function() {
		var that = this;
		var oTable = that.getAggregation("_field");
		var oRowContexts = oTable.getBinding("rows").getContexts();
		var bAllSelected = true;
		if (oRowContexts.length === 0) {
			bAllSelected = false;
		} else {
			for (var i = 0; i < oRowContexts.length; i++) {
				var oObject = oRowContexts[i].getObject();
				if (!oObject._dt || oObject._dt._selected !== true) {
					bAllSelected = false;
					break;
				}
			}
		}
		oTable.getModel().setProperty("/_allSelected", bAllSelected);
	};

	ObjectListField.prototype.onAdd = function(oEvent) {
		var that = this;
		var oControl = that.getAggregation("_field");
		var oNewObject = that._oObjectDetailsPopover.getModel().getProperty("/value");
		oNewObject._dt._position = that._positionCount;
		var sPath = oControl.getBinding("rows").getPath();
		var oModel = oControl.getModel();
		var oData = oModel.getProperty(sPath);
		oData.push(oNewObject);
		oModel.setProperty("/_hasTableAllSelected", false);
		oModel.setProperty("/_hasTableSelected", false);
		oModel.checkUpdate();
		that.refreshValue();
		that._oObjectDetailsPopover.close();
		that._positionCount++;
	};

	ObjectListField.prototype.refreshValue = function () {
		var that = this;
		var oTable = that.getAggregation("_field");
		var oModel = oTable.getModel();
		var sPath = oTable.getBinding("rows").getPath();
		var oData = oModel.getProperty(sPath);
		var vValue = [];
		oData.forEach(function (oItem) {
			if (oItem._dt._selected) {
				var oClonedObject = deepClone(oItem);
				vValue.push(oClonedObject);
			}
		});
		that.setValue(vValue);
	};

	ObjectListField.prototype.onSelectionChange = function (oEvent) {
		var that = this;
		var bSelected = oEvent.getParameter("selected");
		var vValue = this._getCurrentProperty("value");
		var oTable = that.getAggregation("_field");
		var oModel = oTable.getModel();
		if (bSelected || vValue.length > 1) {
			that.refreshValue();
			that.updateSelectionColumn();
		} else {
			oModel.setProperty("/_allSelected", false);
			that.setValue(undefined);
		}
	};

	ObjectListField.prototype.mergeValueWithRequestResult = function (tResult) {
		var that = this;
		var oConfig = that.getConfiguration();
		var oTable = that.getAggregation("_field");
		var oModel = oTable.getModel();
		if (Array.isArray(oConfig.value) && oConfig.value.length > 0) {
			var aValues = deepClone(oConfig.value, 500),
				sPath = oTable.getBinding("rows").getPath();
			if (Array.isArray(tResult) && tResult.length > 0) {
				that._positionCount = oConfig.value.length + 1;
				var aUUIDs = [];
				// move the uuids into backup array
				aValues.forEach(function (oItem) {
					var sUuid;
					if (!oItem._dt) {
						sUuid = Utils.generateUuidV4();
					} else {
						sUuid = oItem._dt._uuid || Utils.generateUuidV4();
						delete oItem._dt._uuid;
						delete oItem._dt._position;
					}
					aUUIDs.push(sUuid);
				});
				var aNotSelectedObjects = [];
				// filter out the unselected request results, and add uuid for them
				for (var i = 0; i < tResult.length; i++) {
					var oRequestObject = tResult[i];
					var bIsSelected = false;
					for (var j = 0; j < aValues.length; j++) {
						if (deepEqual(oRequestObject, aValues[j])) {
							bIsSelected = true;
							break;
						}
					}
					if (!bIsSelected) {
						oRequestObject._dt._uuid = Utils.generateUuidV4();
						oRequestObject._dt._position = that._positionCount;
						that._positionCount++;
						aNotSelectedObjects.push(oRequestObject);
					}
				}
				// add uuid and position for each result in value, and mark them as selected
				for (var k = 0; k < aValues.length; k++) {
					var oValueItem = aValues[k];
					oValueItem._dt = oValueItem._dt || {};
					oValueItem._dt._selected = true;
					oValueItem._dt._uuid = aUUIDs[k];
					oValueItem._dt._position = k + 1;
				}
				if (aNotSelectedObjects.length > 0) {
					oModel.setProperty("/_allSelected", false);
					aValues = aValues.concat(aNotSelectedObjects);
				} else {
					oModel.setProperty("/_allSelected", true);
				}
			} else {
				// add uuid and position for each result in value, and mark them as selected
				aValues.forEach(function (oItem) {
					oItem._dt = oItem._dt || {};
					oItem._dt._selected = true;
					oItem._dt._uuid = oItem._dt._uuid || Utils.generateUuidV4();
					oItem._dt._position = that._positionCount;
					that._positionCount++;
				});
				oModel.setProperty("/_allSelected", true);
			}
			oModel.setProperty(sPath, aValues);
		} else {
			// add uuid and position for each request result
			if (Array.isArray(tResult) && tResult.length > 0) {
				tResult.forEach(function(oResult) {
					oResult._dt._uuid = Utils.generateUuidV4();
					oResult._dt._position = that._positionCount;
					that._positionCount++;
				});
			}
			oModel.setProperty("/_allSelected", false);
		}
		oModel.checkUpdate();
		that.updateTable();
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
			that.setValue(oValue);
		} else {
			oValueModel = oTextArea.getModel();
			oValueModel.setProperty("/value", oValue);
		}
		oTextArea.setValueState("None");
		oTextArea.setValueStateText("");
	};

	ObjectListField.prototype.cleanDT = function(oValue) {
		if (oValue) {
			oValue.forEach(function(oItem) {
				if (oItem && oItem._dt && oItem._dt._selected) {
					delete oItem._dt._selected;
				}
				if (oItem && oItem._dt && deepEqual(oItem._dt, {})) {
					delete oItem._dt;
				}
			});
		}
	};

	return ObjectListField;
});