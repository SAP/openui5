/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/integration/editor/fields/ObjectField",
	"sap/ui/model/json/JSONModel",
	"sap/ui/table/Table",
	"sap/m/CheckBox",
	"sap/base/util/deepEqual",
	"sap/base/util/deepClone"
], function (
	ObjectField,
	JSONModel,
	Table,
	CheckBox,
	deepEqual,
	deepClone
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
		that._newObjectTemplate = {
			dt: {
				_selected: true
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
			// select all the rows if values from config.value
			var oConfig = that.getConfiguration();
			if (!oConfig.values){
				var oValue = deepClone(oConfig.value, 500) || [];
				oValue.forEach(function (oItem) {
					oItem.dt = oItem.dt || {};
					oItem.dt._selected = true;
				});
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

	ObjectListField.prototype.onSelectionColumnClick = function(oEvent) {
		var that = this;
		var bIsSelected = oEvent.getParameter("selected");
		var oTable = that.getAggregation("_field");
		var oRowContexts = oTable.getBinding("rows").getContexts();
		oRowContexts.forEach(function (oRowContext) {
			var oItem = oRowContext.getObject();
			oItem.dt = oItem.dt || {};
			oItem.dt._selected = bIsSelected;
		});

		var oModel = oTable.getModel();
		var sPath = oTable.getBinding("rows").getPath();
		var oData = oModel.getProperty(sPath);
		var aValues;
		oData.forEach(function (oObject) {
			if (oObject.dt && oObject.dt._selected) {
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
				if (!oObject.dt || oObject.dt._selected !== true) {
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
		var sPath = oControl.getBinding("rows").getPath();
		var oModel = oControl.getModel();
		var oData = oModel.getProperty(sPath);
		oData.push(oNewObject);
		oModel.setProperty("/_hasTableAllSelected", false);
		oModel.setProperty("/_hasTableSelected", false);
		oModel.checkUpdate();
		that.refreshValue();
		that._oObjectDetailsPopover.close();
	};

	ObjectListField.prototype.refreshValue = function () {
		var that = this;
		var oTable = that.getAggregation("_field");
		var oModel = oTable.getModel();
		var sPath = oTable.getBinding("rows").getPath();
		var oData = oModel.getProperty(sPath);
		var vValue = [];
		oData.forEach(function (oItem) {
			if (oItem.dt._selected) {
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
		if (oConfig.value && Array.isArray(oConfig.value) && oConfig.value.length > 0) {
			var aValues = deepClone(oConfig.value, 500),
				sPath = oTable.getBinding("rows").getPath();
			aValues.forEach(function (oItem) {
				oItem.dt = oItem.dt || {};
				oItem.dt._selected = true;
			});
			if (Array.isArray(tResult) && tResult.length > 0) {
				var aNotSelectedObjects = [];
				for (var i = 0; i < tResult.length; i++) {
					var oRequestObject = tResult[i];
					var bIsSelected = false;
					for (var j = 0; j < oConfig.value.length; j++) {
						if (deepEqual(oRequestObject, oConfig.value[j])) {
							bIsSelected = true;
							break;
						}
					}
					if (!bIsSelected) {
						aNotSelectedObjects.push(oRequestObject);
					}
				}
				if (aNotSelectedObjects.length > 0) {
					oModel.setProperty("/_allSelected", false);
					aValues = aValues.concat(aNotSelectedObjects);
				} else {
					oModel.setProperty("/_allSelected", true);
				}
			} else {
				oModel.setProperty("/_allSelected", true);
			}
			oModel.setProperty(sPath, aValues);
		} else {
			oModel.setProperty("/_allSelected", false);
		}
		oModel.checkUpdate();
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
				if (oItem && oItem.dt && oItem.dt._selected) {
					delete oItem.dt._selected;
				}
				if (oItem && oItem.dt && deepEqual(oItem.dt, {})) {
					delete oItem.dt;
				}
			});
		}
	};

	return ObjectListField;
});