/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/integration/editor/fields/BaseField",
	"sap/m/Text",
	"sap/m/TextArea",
	"sap/m/Title",
	"sap/m/Input",
	"sap/m/Popover",
	"sap/m/OverflowToolbar",
	"sap/m/ToolbarSpacer",
	"sap/m/Button",
	"sap/ui/core/Core",
	"sap/ui/model/json/JSONModel",
	"sap/ui/table/Table",
	"sap/ui/table/Column",
	"sap/m/Label",
	"sap/m/HBox",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/base/util/deepEqual",
	"sap/ui/core/Icon",
	"sap/m/Switch",
	"sap/m/CheckBox",
	"sap/base/util/deepClone",
	"sap/m/Link",
	"sap/ui/layout/form/SimpleForm",
	"sap/base/util/merge"
], function (
	BaseField,
	Text,
	TextArea,
	Title,
	Input,
	Popover,
	OverflowToolbar,
	ToolbarSpacer,
	Button,
	Core,
	JSONModel,
	Table,
	Column,
	Label,
	HBox,
	Filter,
	FilterOperator,
	deepEqual,
	Icon,
	Switch,
	CheckBox,
	deepClone,
	Link,
	SimpleForm,
	merge
) {
	"use strict";
	var REGEXP_TRANSLATABLE = /\{\{(?!parameters.)(?!destinations.)([^\}\}]+)\}\}/g;

	/**
	 * @class Object Field with object value such as {"key": "key1"}
	 * @extends sap.ui.integration.editor.fields.BaseField
	 * @alias sap.ui.integration.editor.fields.ObjectField
	 * @author SAP SE
	 * @since 1.100.0
	 * @version ${version}
	 * @private
	 * @experimental since 1.100.0
	 * @ui5-restricted
	 * @constructor
	 */
	var ObjectField = BaseField.extend("sap.ui.integration.editor.fields.ObjectField", {
		metadata: {
			library: "sap.ui.integration"
		},
		renderer: BaseField.getMetadata().getRenderer()
	});

	ObjectField.prototype.initVisualization = function (oConfig) {
		var that = this;
		that._newObjectTemplate = {};
		var oVisualization = oConfig.visualization;
		if (!oVisualization) {
			if (oConfig.value && !oConfig.properties && (!oConfig.values || (oConfig.values && !oConfig.values.metadata))) {
				that.parseValueProperties();
			}
			if (oConfig.values) {
				oVisualization = that.createTableVisualization(oConfig);
			} else if (oConfig.properties) {
				oVisualization = that.createSimpleFormVisualization(oConfig);
			} else {
				oVisualization = that.createTextAreaVisualization(oConfig);
			}
			oConfig.withLabel = true;
		}
		this._visualization = oVisualization;
		this.attachAfterInit(this._afterInit);
	};

	ObjectField.prototype._afterInit = function () {
		var that = this;
		var oControl = this.getAggregation("_field");
		if (oControl instanceof SimpleForm) {
			oControl.addStyleClass("sapUiIntegrationEditorItemObjectFieldForm");
			var oValue = deepClone(that.getConfiguration().value, 500) || {};
			oControl.setModel(new JSONModel({
				value: oValue,
				editMode: "Properties"  // "Properties", "Json"
			}));
		} else if (oControl instanceof Table) {
			oControl.addStyleClass("sapUiIntegrationEditorItemObjectFieldTable");
		}
	};

	ObjectField.prototype.parseValueProperties = function() {
		var that = this;
		var oConfig = that.getConfiguration();
		if (typeof oConfig.value === "object" && !deepEqual(oConfig.value, {}) && !Array.isArray(oConfig.value) && !oConfig.properties) {
			var oProperties = {};
			for (var n in oConfig.value) {
				var sType = typeof oConfig.value[n];
				var oProperty = sType === "string" ? {} : {"type": sType};
				oProperties[n] = oProperty;
			}
			if (!deepEqual(oProperties, {})) {
				oConfig.properties = oProperties;
				oConfig._propertiesParsedFromValue = true;
			}
		}
	};

	ObjectField.prototype.createTableVisualization = function(oConfig) {
		var that = this;
		var oTableToolbar = that.createTableToolbar(oConfig);
		var columns = [];
		var sPath = oConfig.values ? oConfig.values.data.path || "/" : "/value";
		if (oConfig.values && oConfig.values.metadata) {
			columns = {
				path: 'meta>/' + oConfig.values.metadata.namespace + '.' + oConfig.values.metadata.entityTypeName,
				filters: new Filter({
					path: "$kind",
					operator: FilterOperator.EQ,
					value1: "Property"
				}),
				factory: that.columnFactory.bind(that)
			};
		} else {
			columns = that.buildTableColumns();
		}
		var oVisualization = {
			type: Table,
			settings: {
				rows: "{" + sPath + "}",
				selectionMode: "MultiToggle",
				enableSelectAll: that._bIsEnableSelectAllInTable === true,
				visibleRowCount: 5,
				busy: "{currentSettings>_loading}",
				columns: columns,
				rowSelectionChange: that.onSelectionChange.bind(that),
				toolbar: oTableToolbar,
				filter: that.onFilter.bind(that)
			}
		};
		return oVisualization;
	};

	ObjectField.prototype.createSimpleFormVisualization = function(oConfig) {
		var that = this;
		var oResourceBundle = that.getResourceBundle();
		var fnChange = function() {
			var oModel = this.getAggregation("_field").getModel();
			oModel.checkUpdate(true);
			var oValue = oModel.getProperty("/value");
			oValue = deepClone(oValue, 500);
			this._setCurrentProperty("value", oValue);
		}.bind(that);
		var aObjectPropertyFormContents = that.createFormContents(fnChange, "/value/");
		var oEditModeButton = new Button({
			icon: {
				path: '/editMode',
				formatter: function(oEditMode) {
					if (oEditMode === "Properties") {
						return "sap-icon://syntax";
					} else {
						return "sap-icon://form";
					}
				}
			},
			tooltip: {
				path: '/editMode',
				formatter: function(oEditMode) {
					if (oEditMode === "Properties") {
						return oResourceBundle.getText("EDITOR_FIELD_OBJECT_FORM_EDITMODE_JSON");
					} else {
						return oResourceBundle.getText("EDITOR_FIELD_OBJECT_FORM_EDITMODE_PROPERTIES");
					}
				}
			},
			press: function() {
				var oModel = that.getAggregation("_field").getModel();
				var sEditMode = oModel.getProperty("/editMode");
				if (sEditMode === "Properties") {//"Properties", "Json" {
					oModel.setProperty("/editMode", "Json");
				} else {
					oModel.setProperty("/editMode", "Properties");
				}
			}
		});
		var oDeleteButon = new Button({
			icon: "sap-icon://delete",
			tooltip: oResourceBundle.getText("EDITOR_FIELD_OBJECT_DELETE"),
			visible: oConfig.enabled,
			enabled: {
				path: 'currentSettings>value',
				formatter: function(vValue) {
					if (!vValue || vValue === "") {
						return false;
					}
					return true;
				}
			},
			press: function (oEvent) {
				that._setCurrentProperty("value", undefined);
				var oModel = that.getAggregation("_field").getModel();
				oModel.setProperty("/value", {});
				oModel.checkUpdate(true);
			}
		});
		var oVisualization = {
			type: SimpleForm,
			settings: {
				layout: "ResponsiveGridLayout",
				visible: oConfig.visible,
				labelSpanXL: 2,
				labelSpanL: 2,
				labelSpanM: 2,
				//labelSpanS: "{= ${/editMode} === 'Properties' ? 2 : 12}",
				labelSpanS: 12,
				emptySpanXL: 1,
				emptySpanL: 1,
				emptySpanM: 1,
				emptySpanS: 0,
				columnsXL: 1,
				columnsL: 1,
				columnsM: 1,
				toolbar: new OverflowToolbar({
					content: [
						new ToolbarSpacer(),
						oEditModeButton,
						oDeleteButon
					]
				}).addStyleClass("sapMTB"),
				content: aObjectPropertyFormContents
			}
		};
		return oVisualization;
	};

	ObjectField.prototype.createTextAreaVisualization = function(oConfig) {
		var that = this;
		var oVisualization = {
			type: TextArea,
			settings: {
				value: {
					path: 'currentSettings>value',
					formatter: function(vValue) {
						if (!vValue || vValue === "") {
							return undefined;
						}
						vValue = JSON.stringify(vValue, null, "\t");
						if (typeof vValue === "object" && !vValue.length) {
							vValue = vValue.replace(/\"\$\$([a-zA-Z]*)\$\$\"/g, function (s) {
								return s.substring(3, s.length - 3);
							});
						}
						return vValue;
					}
				},
				editable: "{config/editable}",
				width: "100%",
				enabled: "{config/enabled}",
				placeholder: "{config/placeholder}",
				visible: oConfig.visible,
				change: this.onChangeOfTextArea.bind(that),
				rows: 7
			}
		};
		return oVisualization;
	};

	ObjectField.prototype.buildTableColumns = function() {
		var that = this;
		var oConfig = that.getConfiguration();
		var aColumns = [];
		var oCardResourceBundle = that.getModel("i18n").getResourceBundle();
		for (var n in oConfig.properties) {
			var oProperty = oConfig.properties[n];
			var sDefaultLabel = oProperty.label || n;
			var sDefaultValue = "{" + n + "}";
			if (oProperty.defaultValue) {
				that._newObjectTemplate[n] = oProperty.defaultValue;
			}
			var oColumnSettings = {
				"width": "7rem",
				"label": sDefaultLabel
			};
			if (oProperty.column) {
				oColumnSettings = merge(oColumnSettings, oProperty.column);
			}
			// change translate syntax {{KEY}} to {i18n>KEY}
			if (oColumnSettings.label.match(REGEXP_TRANSLATABLE)) {
				oColumnSettings.label = "{i18n>" + oColumnSettings.label.substring(2, oColumnSettings.label.length - 1);
			}
			oColumnSettings.tooltip = oColumnSettings.label;

			var sCellType = oProperty.cell && oProperty.cell.type ? oProperty.cell.type : oProperty.type || "Text";
			var oCellTemplate;
			var oCellSettings;
			var oCell = deepClone(oProperty.cell) || {};
			delete oCell.type;
			switch (sCellType) {
				case "int":
				case "number":
					oCellSettings = {
						text: sDefaultValue,
						wrapping: false
					};
					oCellSettings = merge(oCellSettings, oCell);
					oCellTemplate = new Text(oCellSettings);
					break;
				case "string":
				case "Text":
					oCellSettings = {
						text: sDefaultValue,
						wrapping: false
					};
					oCellSettings = merge(oCellSettings, oCell);
					var oText = oCellSettings.text;
					if (typeof oText === "string") {
						if (oText.match(REGEXP_TRANSLATABLE)) {
							// check the text property, if it match syntax {{KEY}}, translate it
							oCellSettings.text = oCardResourceBundle.getText(oText.substring(2, oText.length - 2));
						} else if (oText.startsWith("{i18n>") && oText.endsWith('}')) {
							// check the text property, if it match syntax {i18n>KEY}, translate it
							oCellSettings.text = oCardResourceBundle.getText(oText.substring(6, oText.length - 1));
						} else if (oText.startsWith('{') && oText.endsWith('}')) {
							oCellSettings.text = {
								path: oText.substring(1, oText.length - 1),
								formatter: function(oValue) {
									if (!oValue) {
										return undefined;
									} else if (oValue.match(REGEXP_TRANSLATABLE)) {
										// check the text property, if it match syntax {{KEY}}, translate it
										return oCardResourceBundle.getText(oValue.substring(2, oValue.length - 2));
									} else if (oValue.startsWith("{i18n>") && oValue.endsWith('}')) {
										// check the text property, if it match syntax {i18n>KEY}, translate it
										return oCardResourceBundle.getText(oValue.substring(6, oValue.length - 1));
									}
									return oValue;
								}
							};
						}
					}
					oCellSettings.tooltip = oCell.tooltip || oCellSettings.text;
					oCellTemplate = new Text(oCellSettings);
					break;
				case "Icon":
					oCellSettings = {
						src: sDefaultValue
					};
					oCellSettings = merge(oCellSettings, oCell);
					oCellTemplate = new Icon(oCellSettings);
					break;
				case "boolean":
					oCellSettings = {
						selected: sDefaultValue,
						enabled: false
					};
					oCellSettings = merge(oCellSettings, oCell);
					oCellTemplate = new CheckBox(oCellSettings);
					break;
				case "Switch":
					oCellSettings = {
						state: sDefaultValue,
						enabled: false
					};
					oCellSettings = merge(oCellSettings, oCell);
					oCellTemplate = new Switch(oCellSettings);
					break;
				case "Link":
					oCellSettings = {
						text: sDefaultValue,
						target: "_blank",
						href: sDefaultValue
					};
					oCellSettings = merge(oCellSettings, oCell);
					oCellTemplate = new Link(oCellSettings);
					break;
				default:
					oCellTemplate = new Text({
						text: sDefaultValue,
						wrapping: false
					});
					break;
			}
			oColumnSettings.template = oCellTemplate;
			var oColumn = new Column(oColumnSettings);
			aColumns.push(oColumn);
		}
		var oActionColumn = that.createActionColumn();
		aColumns.push(oActionColumn);
		return aColumns;
	};

	ObjectField.prototype.checkHasFilter = function(oConfig) {
		var bHasFilterDefined = true;
		if (oConfig._propertiesParsedFromValue === true) {
			bHasFilterDefined = false;
		} else {
			var sPropertiesString = JSON.stringify(oConfig.properties, null, "\t");
			bHasFilterDefined = sPropertiesString.indexOf("filterProperty") > -1 ? true : false;
		}
		return bHasFilterDefined;
	};

	ObjectField.prototype.createTableToolbar = function(oConfig) {
		var that = this;
		var oResourceBundle = that.getResourceBundle();
		// check if has filterProperty defined in each column of config.properties
		var bHasFilterDefined = that.checkHasFilter(oConfig);
		var bAddButtonVisible = oConfig.enabled !== false;
		var sAddButtonTooltip = oConfig.addButtonText || oResourceBundle.getText("EDITOR_FIELD_OBJECT_TABLE_BUTTON_ADD_TOOLTIP");
		if (bAddButtonVisible && oConfig.values) {
			bAddButtonVisible = oConfig.values.allowAdd === true;
		}
		return new OverflowToolbar({
			content: [
				new ToolbarSpacer(),
				new Button({
					icon: "sap-icon://add",
					visible: bAddButtonVisible,
					tooltip: sAddButtonTooltip,
					press: that.createNewObject.bind(that)
				}),
				new Button({
					icon: "sap-icon://clear-filter",
					visible: bHasFilterDefined,
					tooltip: oResourceBundle.getText("EDITOR_FIELD_OBJECT_TABLE_BUTTON_CLEAR_ALL_FILTERS_TOOLTIP"),
					press: that.clearAllFilters.bind(that)
				})
			]
		});
	};

	ObjectField.prototype.onDelete = function(oEvent) {
		var that = this;
		var oControl = oEvent.getSource();
		var oRow = oControl.getParent().getParent();
		var oTable = oRow.getParent();
		var iRowIndex = oRow.getIndex();

		// get the real index via path since the rows may be filtered
		var oRowContexts = oTable.getBinding("rows").getContexts();
		var sDeletedObjectPath = oRowContexts[iRowIndex].getPath();
		var iRealIndex = sDeletedObjectPath.substring(sDeletedObjectPath.lastIndexOf("/") + 1);

		var oParameter;
		var bHasBeforeValue = that.checkHasValue();
		oParameter = {
			selectedIndex: oTable.getSelectedIndex(),
			selectedIndices: oTable.getSelectedIndices(),
			rowIndex: iRowIndex,
			realIndex: iRealIndex
		};

		// delete object in value model
		var oModel = oTable.getModel();
		var sPath = oTable.getBinding("rows").getPath();
		var oData = oModel.getProperty(sPath);
		oData.splice(iRealIndex, 1);
		oModel.checkUpdate(true);

		// restore the selections since the selections are lost, BCP: 2280048930, JIRA: CPOUIFTEAMB-252
		if (bHasBeforeValue) {
			that.applyBeforeValueAndSelections("delete", oParameter);
		}
	};

	ObjectField.prototype.onEditOrViewDetail = function(oEvent) {
		var that = this;
		var oControl = oEvent.getSource();
		var oItem = oControl.getBindingContext().getObject();
		that.openObjectDetailsPopover(oItem, oControl, oItem._editable !== false ? "update" : "view");
	};

	ObjectField.prototype.onFilter = function(oEvent) {
		var that = this;
		var oControl = oEvent.getSource();
		// restore the selections since the selections are lost, BCP: 2280048930, JIRA: CPOUIFTEAMB-252
		if (that.checkHasValue()) {
			var oParameter = {
				selectedIndex: oControl.getSelectedIndex(),
				selectedIndices: oControl.getSelectedIndices(),
				column: oEvent.getParameter("column")
			};
			that.applyBeforeValueAndSelections("filter", oParameter);
		}
	};

	ObjectField.prototype.createActionColumn = function() {
		var that = this;
		var oConfig = that.getConfiguration();
		var oResourceBundle = that.getResourceBundle();
		return new Column({
			width: "5rem",
			hAlign: "Center",
			label: new Label({
				text: "Actions",
				tooltip: "Actions"
			}),
			template: new HBox({
				items: [
					new Button({
						type: "Transparent",
						icon: {
							path: '_editable',
							formatter: function(bEditable) {
								if (bEditable === false) {
									return "sap-icon://display";
								} else {
									return "sap-icon://edit";
								}
							}
						},
						tooltip: {
							path: '_editable',
							formatter: function(bEditable) {
								if (bEditable === false) {
									return oResourceBundle.getText("EDITOR_FIELD_OBJECT_TABLE_BUTTON_DISPLAY_TOOLTIP");
								} else {
									return oResourceBundle.getText("EDITOR_FIELD_OBJECT_TABLE_BUTTON_EDIT_TOOLTIP");
								}
							}
						},
						press: that.onEditOrViewDetail.bind(that)
					}),
					new Button({
						type: "Transparent",
						icon: "sap-icon://delete",
						visible: oConfig.editable === false ? false : "{= ${_editable} !== false}",
						tooltip: oResourceBundle.getText("EDITOR_FIELD_OBJECT_DELETE"),
						press: that.onDelete.bind(that)
					})
				]
			})
		});
	};

	ObjectField.prototype.columnFactory = function(sId, oContext) {
		var that = this;
		var sPath = oContext.getPath();
		var sName = sPath.substring(oContext.getPath().lastIndexOf("/") + 1);
		var sType = oContext.getProperty("$Type");
		if (sType === "Actions") {
			return that.createActionColumn();
		}
		var iLen = oContext.getProperty("$MaxLength");
		var sColumnWidth = "7rem";

		iLen = iLen ? parseInt(iLen) : 10;
		iLen = iLen < 7 ? 7 : iLen;

		if (iLen > 50) {
			sColumnWidth = "15rem";
		} else if (iLen > 9) {
			sColumnWidth = "10rem";
		}

		return new Column(sId, {
			visible: true,
			filterProperty: sType && sType.indexOf("String") >= 0 ? sName : null,
			width: sColumnWidth,
			label: new Label({text: sName}),
			hAlign: sType && sType.indexOf("Decimal") >= 0 ? "End" : "Begin",
			template: new Text({text: {path: sName}, wrapping: false})
		});
	};

	ObjectField.prototype.onSelectionChange = function (oEvent) {
		var that = this;
		var oControl = oEvent.getSource();
		var bUserInteraction = oEvent.getParameter("userInteraction") || false;
		// only update data models if is user interaction
		if (bUserInteraction) {
			var oObject,
				oContext;
			var iSelectedIndex = oControl.getSelectedIndex();
			var aSelectedIndices = oControl.getSelectedIndices();
			if (aSelectedIndices.length >= 1) {
				oControl.setSelectedIndex(iSelectedIndex);
				oContext = oControl.getContextByIndex(iSelectedIndex);
				oObject = oContext.getObject();
				oControl._sPathOfFilteredOut = null;
			} else if (oControl._sPathOfFilteredOut) {
				oObject = oControl.getModel().getProperty(oControl._sPathOfFilteredOut);
			}
			that._setCurrentProperty("value", oObject);
		}
	};

	ObjectField.prototype.createNewObject = function (oEvent) {
		var that = this;
		var oControl = oEvent.getSource();
		that.openObjectDetailsPopover(that._newObjectTemplate, oControl, "add");
	};

	ObjectField.prototype.mergeValueWithRequestResult = function (tResult) {
		var that = this;
		var oConfig = that.getConfiguration();
		var oTable = that.getAggregation("_field");
		if (oConfig.value && (typeof oConfig.value === "object") && !deepEqual(oConfig.value, {})) {
			var oValue;
			if (Array.isArray(tResult) && tResult.length > 0) {
				if (oConfig.value._editable === false) {
					var iSelectedIndex = -1;
					for (var i = 0; i < tResult.length; i++) {
						oValue = tResult[i];
						if (deepEqual(oValue, oConfig.value)) {
							iSelectedIndex = i;
							break;
						}
					}
					oTable.setSelectedIndex(iSelectedIndex);
				} else {
					tResult.unshift(oConfig.value);
					oTable.getModel().checkUpdate();
					oTable.setSelectedIndex(0);
				}
			} else {
				oValue = deepClone(oConfig.value, 500);
				tResult = [oValue];
				oTable.getModel().checkUpdate();
				oTable.setSelectedIndex(0);
			}
		}
		return tResult;
	};

	ObjectField.prototype.onChangeOfTextArea = function (oEvent) {
		var that = this;
		var oResourceBundle = that.getResourceBundle();
		var oTextArea = oEvent.getSource();
		var sValue = oTextArea.getValue();
		if (!sValue || sValue === "") {
			that.saveValue(undefined, oTextArea);
		} else {
			try {
				var oValue = JSON.parse(sValue);
				if (oValue instanceof Array) {
					oTextArea.setValueState("Error");
					oTextArea.setValueStateText(oResourceBundle.getText("EDITOR_VAL_NOT_A_SINGLE_JSONOBJECT"));
					return;
				}
				that.saveValue(oValue, oTextArea);
			} catch (e) {
				oTextArea.setValueState("Error");
				oTextArea.setValueStateText(oResourceBundle.getText("EDITOR_VAL_NOT_A_JSONOBJECT"));
			}
		}
	};

	ObjectField.prototype.onChangeOfTextAreaInPopover = function (oEvent) {
		var that = this;
		var oResourceBundle = that.getResourceBundle();
		var oTextArea = oEvent.getSource();
		var sValue = oTextArea.getValue();
		if (!sValue || sValue === "") {
			that.saveValue(undefined, oTextArea, true);
		} else {
			try {
				var oValue = JSON.parse(sValue);
				if (oValue instanceof Array) {
					oTextArea.setValueState("Error");
					oTextArea.setValueStateText(oResourceBundle.getText("EDITOR_VAL_NOT_A_SINGLE_JSONOBJECT"));
					return;
				}
				that.saveValue(oValue, oTextArea, true);
			} catch (e) {
				oTextArea.setValueState("Error");
				oTextArea.setValueStateText(oResourceBundle.getText("EDITOR_VAL_NOT_A_JSONOBJECT"));
			}
		}
	};

	ObjectField.prototype.createFormContents = function (fnChange, sPathPrefix, bIsInPopover) {
		var that = this;
		var oConfig = that.getConfiguration();
		var aContentList = that.createPropertyContents(fnChange, sPathPrefix);
		aContentList.push(new Label({
			visible: false
		}).addStyleClass("sapFormLabel"));
		aContentList.push(new TextArea({
			value: {
				path: sPathPrefix,
				formatter: function(vValue) {
					if (!vValue || vValue === "") {
						return undefined;
					}
					if (deepEqual(vValue, {}) && !bIsInPopover && !that._getCurrentProperty("value")) {
						return undefined;
					}
					vValue = JSON.stringify(vValue, null, "\t");
					if (typeof vValue === "object" && !vValue.length) {
						vValue = vValue.replace(/\"\$\$([a-zA-Z]*)\$\$\"/g, function (s) {
							return s.substring(3, s.length - 3);
						});
					}
					return vValue;
				}
			},
			editable: oConfig.editable === false ? false : "{= ${" + sPathPrefix + "_editable} !== false}",
			width: "100%",
			placeholder: "{config/placeholder}",
			visible: "{= ${/editMode} === 'Json'}",
			change: bIsInPopover === true ? this.onChangeOfTextAreaInPopover.bind(that) : this.onChangeOfTextArea.bind(that),
			rows: bIsInPopover === true ? 15 : 7
		}));
		return aContentList;
	};

	ObjectField.prototype.createPropertyContents = function (fnChange, sPathPrefix) {
		var that = this;
		var oConfig = that.getConfiguration();
		var aPropertyContentList = [];
		if (!sPathPrefix) {
			sPathPrefix = "currentSettings>value/";
		}
		var oProperties = {};
		if (oConfig.values && oConfig.values.metadata) {
			var oMetaModel = that.getModel("meta");
			var sPath = "/" + oConfig.values.metadata.namespace + '.' + oConfig.values.metadata.entityTypeName;
			var oEntityType = oMetaModel.getProperty(sPath);

			for (var m in oEntityType) {
				var oEntityProperty = oEntityType[m];
				var sType = oEntityProperty['$Type'];
				if (oEntityProperty['$kind'] === "Property" && sType) {
					if (sType.indexOf("Int") >= 0) {
						oProperties[m] = {
							type: "int"
						};
					} else if (sType.indexOf("Boolean") >= 0) {
						oProperties[m] = {
							type: "boolean"
						};
					} else if (sType.indexOf("Decimal") >= 0) {
						oProperties[m] = {
							type: "number"
						};
					} else if (sType !== "Actions") {
						oProperties[m] = {
							type: "string"
						};
					}
				}
			}
		}
		if (deepEqual(oProperties, {})) {
			oProperties = oConfig.properties;
		}
		for (var n in oProperties) {
			var oProperty = oProperties[n];
			var sLabelText = oProperty.label || n;
			// change translate syntax {{KEY}} to {i18n>KEY}
			if (sLabelText.match(REGEXP_TRANSLATABLE)) {
				var sLabelKey = sLabelText.substring(2, sLabelText.length - 2);
				sLabelText = "{i18n>" + sLabelKey + "}";
			}
			var oLable = new Label({
				text: sLabelText,
				visible: "{= ${/editMode} === 'Properties'}",
				required: oProperty.required || false
				//wrapping: false
			});
			aPropertyContentList.push(oLable);
			var oValueControl;
			switch (oProperty.type) {
				case "boolean":
					if (oProperty.cell && oProperty.cell.type === "Switch") {
						var oSettings = {
							state: "{" + sPathPrefix + n + "}",
							visible: "{= ${/editMode} === 'Properties'}",
							enabled: oConfig.editable === false ? false : "{= ${" + sPathPrefix + "_editable} !== false}",
							change: fnChange
						};
						if (oProperty.cell.customTextOn) {
							oSettings.customTextOn = oProperty.cell.customTextOn;
						}
						if (oProperty.cell.customTextOff) {
							oSettings.customTextOff = oProperty.cell.customTextOff;
						}
						oValueControl = new Switch(oSettings);
					} else {
						oValueControl = new CheckBox({
							selected: "{" + sPathPrefix + n + "}",
							visible: "{= ${/editMode} === 'Properties'}",
							enabled: oConfig.editable === false ? false : "{= ${" + sPathPrefix + "_editable} !== false}",
							select: fnChange
						});
					}
					break;
				case "int":
				case "integer":
					oValueControl = new Input({
						value: {
							path: sPathPrefix + n,
							type: "sap.ui.model.type.Integer",
							formatOptions: oProperty.formatter
						},
						visible: "{= ${/editMode} === 'Properties'}",
						editable: oConfig.editable === false ? false : "{= ${" + sPathPrefix + "_editable} !== false}",
						type: "Number",
						change: fnChange
					});
					break;
				case "number":
					oValueControl = new Input({
						value: {
							path: sPathPrefix + n,
							type: "sap.ui.model.type.Float",
							formatOptions: oProperty.formatter
						},
						visible: "{= ${/editMode} === 'Properties'}",
						editable: oConfig.editable === false ? false : "{= ${" + sPathPrefix + "_editable} !== false}",
						type: "Number",
						change: fnChange
					});
					break;
				case "object":
					oValueControl = new TextArea({
						value: {
							path: sPathPrefix + n,
							formatter: function(vValue) {
								if (!vValue || vValue === "") {
									return undefined;
								}
								vValue = JSON.stringify(vValue, null, "\t");
								if (typeof vValue === "object" && !vValue.length) {
									vValue = vValue.replace(/\"\$\$([a-zA-Z]*)\$\$\"/g, function (s) {
										return s.substring(3, s.length - 3);
									});
								}
								return vValue;
							}
						},
						visible: "{= ${/editMode} === 'Properties'}",
						editable: oConfig.editable === false ? false : "{= ${" + sPathPrefix + "_editable} !== false}",
						change: fnChange,
						rows: 3
					});
					break;
				default:
					oValueControl = new Input({
						value: "{" + sPathPrefix + n + "}",
						visible: "{= ${/editMode} === 'Properties'}",
						editable: oConfig.editable === false ? false : "{= ${" + sPathPrefix + "_editable} !== false}",
						change: fnChange
					});
			}
			aPropertyContentList.push(oValueControl);
		}
		return aPropertyContentList;
	};

	ObjectField.prototype.saveValue = function (oValue, oTextArea, bIsInDetailsPopover) {
		var that = this;
		var oValueModel;
		if (!bIsInDetailsPopover) {
			that._setCurrentProperty("value", oValue);
			oValueModel = that.getAggregation("_field").getModel();
			if (oValueModel) {
				oValue = deepClone(oValue, 500);
				oValueModel.setProperty("/value", oValue || {});
			}
			oTextArea.setValueState("None");
			oTextArea.setValueStateText("");
			if (that.getConfiguration()._propertiesParsedFromValue) {
				that.refreshSimpleForm();
			}
		} else {
			oValueModel = oTextArea.getModel();
			oValueModel.setProperty("/value", oValue);
			oTextArea.setValueState("None");
			oTextArea.setValueStateText("");
		}
	};

	ObjectField.prototype.refreshSimpleForm = function() {
		var that = this;
		var oConfig = that.getConfiguration();
		var oControl = that.getAggregation("_field");
		var aContents = oControl.removeAllContent().slice(-2);
		delete oConfig.properties;
		that.parseValueProperties();
		var fnChange = function() {
			var oModel = oControl.getModel();
			oModel.checkUpdate(true);
			var oValue = oModel.getProperty("/value");
			oValue = deepClone(oValue, 500);
			that._setCurrentProperty("value", oValue);
		};
		var aPropertyContents = that.createPropertyContents(fnChange, "/value/");
		aPropertyContents = aPropertyContents.concat(aContents);
		aPropertyContents.forEach(function(oContent) {
			oControl.addContent(oContent);
		});
	};

	ObjectField.prototype.openObjectDetailsPopover = function (oItem, oControl, sMode) {
		var that = this;
		var oField = that.getAggregation("_field");
		var oResourceBundle = that.getResourceBundle();
		var oItemCloned = deepClone(oItem, 500);
		var oModel;
		if (!that._oObjectDetailsPopover) {
			var oAddButton = new Button({
				text: oResourceBundle.getText("EDITOR_FIELD_OBJECT_DETAILS_POPOVER_BUTTON_ADD"),
				visible: sMode === "add",
				enabled: {
					path: '/value',
					formatter: function(vValue) {
						if (!vValue || vValue === "" || deepEqual(vValue, {})) {
							return false;
						}
						return true;
					}
				},
				press: that.onCreate.bind(that)
			});
			var oUpdateButton = new Button({
				text: oResourceBundle.getText("EDITOR_FIELD_OBJECT_DETAILS_POPOVER_BUTTON_UPDATE"),
				visible: sMode === "update",
				enabled: {
					path: '/value',
					formatter: function(vValue) {
						if (!vValue || vValue === "" || deepEqual(vValue, {})) {
							return false;
						}
						return true;
					}
				},
				press: that.onUpdate.bind(that)
			});
			var oCancelButton = new Button({
				text: oResourceBundle.getText("EDITOR_FIELD_OBJECT_DETAILS_POPOVER_BUTTON_CANCEL"),
				visible: sMode !== "view",
				press: function () {
					that._oObjectDetailsPopover.close();
				}
			});
			var oCloseButton = new Button({
				text: oResourceBundle.getText("EDITOR_FIELD_OBJECT_DETAILS_POPOVER_BUTTON_CLOSE"),
				visible: sMode === "view",
				press: function () {
					that._oObjectDetailsPopover.close();
				}
			});
			oModel = new JSONModel({
				"value": oItemCloned,
				"editMode": "Properties"
			});
			var aObjectPropertyFormContents;
			var fnChangeWithDataSave = function(oEvent) {
				var oModel = that._oObjectDetailsPopover.getModel();
				oModel.checkUpdate(true);
				var oNewObject = oModel.getProperty("/value");
				if (oNewObject && oNewObject !== "" && typeof oNewObject === "object" && !deepEqual(oNewObject, {})) {
					oAddButton.setEnabled(true);
				} else {
					oAddButton.setEnabled(false);
				}
			};
			var fnChange = function() {};
			if (oItem._editable !== false) {
				aObjectPropertyFormContents = that.createFormContents(fnChangeWithDataSave, "/value/", true);
			} else {
				aObjectPropertyFormContents = that.createFormContents(fnChange, "/value/", true);
			}
			var oEditModeButton = new Button({
				icon: {
					path: '/editMode',
					formatter: function(oEditMode) {
						if (oEditMode === "Properties") {
							return "sap-icon://syntax";
						} else {
							return "sap-icon://form";
						}
					}
				},
				tooltip: {
					path: '/editMode',
					formatter: function(oEditMode) {
						if (oEditMode === "Properties") {
							return oResourceBundle.getText("EDITOR_FIELD_OBJECT_FORM_EDITMODE_JSON");
						} else {
							return oResourceBundle.getText("EDITOR_FIELD_OBJECT_FORM_EDITMODE_PROPERTIES");
						}
					}
				},
				press: function(oEvent) {
					var oControl = oEvent.getSource();
					var oModel = oControl.getModel();
					var sEditMode = oModel.getProperty("/editMode");
					if (sEditMode === "Properties") {//"Properties", "Json" {
						oModel.setProperty("/editMode", "Json");
					} else {
						oModel.setProperty("/editMode", "Properties");
					}
				}
			});
			var oForm = new SimpleForm({
				layout: "ResponsiveGridLayout",
				labelSpanXL: 4,
				labelSpanL: 4,
				labelSpanM: 4,
				//labelSpanS: "{= ${/editMode} === 'Properties' ? 4 : 12}",
				labelSpanS: 12,
				emptySpanXL: 1,
				emptySpanL: 1,
				emptySpanM: 1,
				emptySpanS: 0,
				columnsXL: 1,
				columnsL: 1,
				columnsM: 1,
				content: aObjectPropertyFormContents
			});
			var sPlacement = oField._previewPostion === "right" ? "Right" : "Left";
			that._oObjectDetailsPopover = new Popover({
				placement: sPlacement,
				contentWidth: "300px",
				contentHeight: "345px",
				content: oForm,
				customHeader: new OverflowToolbar({
					content: [
						new Title({
							text: oResourceBundle.getText("EDITOR_FIELD_OBJECT_DETAILS_POPOVER_TITLE")
						}),
						new ToolbarSpacer(),
						oEditModeButton
					]
				}),
				footer: new OverflowToolbar({
					content: [
						new ToolbarSpacer(),
						oAddButton,
						oUpdateButton,
						oCancelButton,
						oCloseButton
					]
				})
			}).addStyleClass("sapUiIntegrationEditorItemObjectFieldDetailsPopover");
			that._oObjectDetailsPopover.setModel(oModel);
			that._oObjectDetailsPopover.setModel(that.getModel("i18n"), "i18n");
			that._oObjectDetailsPopover._oAddButton = oAddButton;
			that._oObjectDetailsPopover._oUpdateButton = oUpdateButton;
			that._oObjectDetailsPopover._oCancelButton = oCancelButton;
			that._oObjectDetailsPopover._oCloseButton = oCloseButton;
			that._oObjectDetailsPopover._openBy = oControl;
		} else {
			oModel = that._oObjectDetailsPopover.getModel();
			oModel.setProperty("/value", oItemCloned);
			if (sMode === "add") {
				that._oObjectDetailsPopover._oAddButton.setVisible(true);
				that._oObjectDetailsPopover._oUpdateButton.setVisible(false);
				that._oObjectDetailsPopover._oCancelButton.setVisible(true);
				that._oObjectDetailsPopover._oCloseButton.setVisible(false);
			} else if (sMode === "update") {
				that._oObjectDetailsPopover._oAddButton.setVisible(false);
				that._oObjectDetailsPopover._oUpdateButton.setVisible(true);
				that._oObjectDetailsPopover._oCancelButton.setVisible(true);
				that._oObjectDetailsPopover._oCloseButton.setVisible(false);
			} else {
				that._oObjectDetailsPopover._oAddButton.setVisible(false);
				that._oObjectDetailsPopover._oUpdateButton.setVisible(false);
				that._oObjectDetailsPopover._oCancelButton.setVisible(false);
				that._oObjectDetailsPopover._oCloseButton.setVisible(true);
			}
			that._oObjectDetailsPopover._openBy = oControl;
		}
		that._oObjectDetailsPopover.openBy(oControl);
	};

	ObjectField.prototype.onCreate = function(oEvent) {
		var that = this;
		var oControl = that.getAggregation("_field");
		var oParameter;
		var bHasBeforeValue = that.checkHasValue();
		if (bHasBeforeValue) {
			oParameter = {
				selectedIndex: oControl.getSelectedIndex(),
				selectedIndices: oControl.getSelectedIndices()
			};
		}
		var oNewObject = that._oObjectDetailsPopover.getModel().getProperty("/value");
		var sPath = oControl.getBinding("rows").getPath();
		var oData = oControl.getModel().getProperty(sPath);
		oData.push(oNewObject);
		oControl.getModel().checkUpdate();
		that._oObjectDetailsPopover.close();

		// restore the selections since the selections are lost, BCP: 2280048930, JIRA: CPOUIFTEAMB-252
		if (bHasBeforeValue) {
			that.applyBeforeValueAndSelections("add", oParameter);
		}
	};

	ObjectField.prototype.onUpdate = function (oEvent) {
		var that = this;
		var oControl = that.getAggregation("_field");
		var oObject = that._oObjectDetailsPopover.getModel().getProperty("/value");
		var oModel = oControl.getModel();
		var oRow = that._oObjectDetailsPopover._openBy.getParent().getParent();
		var iRowIndex = oRow.getIndex();

		// get the real index via path since the rows may be filtered
		var oRowContexts = oControl.getBinding("rows").getContexts();
		var sPath = oRowContexts[iRowIndex].getPath();

		var oParameter;
		var bHasBeforeValue = that.checkHasValue();
		if (bHasBeforeValue) {
			var aRowContexts = oControl.getBinding("rows").getContexts();
			oParameter = {
				updatedObject: oObject,
				rowIndex: iRowIndex,
				path: sPath,
				selectedIndex: oControl.getSelectedIndex(),
				selectedIndices: oControl.getSelectedIndices(),
				rowNumber: aRowContexts ? aRowContexts.length : 0
			};
		}

		// update the object in control value model
		oModel.setProperty(sPath, deepClone(oObject, 500));
		oModel.checkUpdate();

		that._oObjectDetailsPopover.close();

		// restore the selections since the selections are lost, BCP: 2280048930, JIRA: CPOUIFTEAMB-252
		if (bHasBeforeValue) {
			that.applyBeforeValueAndSelections("update", oParameter);
		}
	};

	ObjectField.prototype.clearAllFilters = function(oEvent) {
		var that = this;
		var oTable = that.getAggregation("_field");

		var aColumns = oTable.getColumns();
		for (var i = 0; i < aColumns.length; i++) {
			var oColumn = aColumns[i];
			if ( i < aColumns.length - 1) {
				oColumn._applySelection = false;
			}
			oTable.filter(oColumn, undefined);
		}
	};

	ObjectField.prototype.checkHasValue = function() {
		var that = this;
		var oValue = that._getCurrentProperty("value");
		if (typeof oValue === "object" && !deepEqual(oValue, {})) {
			return true;
		}
		return false;
	};

	// restore the selections since the selections are lost, BCP: 2280048930, JIRA: CPOUIFTEAMB-252
	ObjectField.prototype.applyBeforeValueAndSelections = function(sMode, oParameter) {
		var that = this;
		var oControl = that.getAggregation("_field");
		var iSelectedIndex = oParameter.selectedIndex;
		var iRowNumber = oParameter.rowNumber;
		var aRowContexts = oControl.getBinding("rows").getContexts();
		var iNewRowNumber = aRowContexts.length;
		var iRowIndex = oParameter.rowIndex;
		var sPath = oControl.getBinding("rows").getPath();
		var iRealIndexOfFilteredOut;
		switch (sMode) {
			case "add":
				if (iSelectedIndex > -1) {
					oControl.setSelectedIndex(iSelectedIndex);
					oControl._sPathOfFilteredOut = null;
				}
				break;
			case "update":
				//update object in field value if it is selected
				if (iRowIndex === iSelectedIndex) {
					that._setCurrentProperty("value", oParameter.updatedObject);
					// update the selections when row number changed which means the update may cause it filter out
					if (iRowNumber !== iNewRowNumber) {
						oControl._sPathOfFilteredOut = oParameter.path;
					}
				} else if (iRowNumber !== iNewRowNumber) {
					// update the selections when row number changed which means the update may cause it filter out
					if (iSelectedIndex > iRowIndex) {
						iSelectedIndex--;
					}
					oControl.setSelectedIndex(iSelectedIndex);
				}
				break;
			case "delete":
				if (iSelectedIndex === iRowIndex) {
					that._setCurrentProperty("value", undefined);
				} else if (iSelectedIndex > iRowIndex) {
					oControl.setSelectedIndex(iSelectedIndex - 1);
				} else {
					oControl.setSelectedIndex(iSelectedIndex);
				}
				// update the Paths in oControl._sPathOfFilteredOut
				if (oControl._sPathOfFilteredOut) {
					iRealIndexOfFilteredOut = oControl._sPathOfFilteredOut.substring(oControl._sPathOfFilteredOut.lastIndexOf("/") + 1);
					if (iRealIndexOfFilteredOut > oParameter.realIndex) {
						iRealIndexOfFilteredOut--;
						oControl._sPathOfFilteredOut = sPath + "/" + iRealIndexOfFilteredOut;
					}
				}
				break;
			case "filter":
				var oColumn = oParameter.column;
				if (iSelectedIndex > -1) {
					oControl._sPathOfFilteredOut = aRowContexts && aRowContexts[iSelectedIndex].getPath();
				}
				if (oColumn._applySelection !== false && oControl._sPathOfFilteredOut) {
					oControl.attachEventOnce("rowsUpdated", function() {
						var aFilteredRowContexts = oControl.getBinding("rows").getContexts() || [];
						var sNewIndex = -1;
						if (aFilteredRowContexts.length > 0 && oControl._sPathOfFilteredOut) {
							for (var i = 0; i < aFilteredRowContexts.length; i++) {
								var oContext = aFilteredRowContexts[i];
								if (oContext.getPath() === oControl._sPathOfFilteredOut) {
									sNewIndex = i;
									oControl._sPathOfFilteredOut = undefined;
									break;
								}
							}
						}
						if (sNewIndex > -1) {
							oControl.setSelectedIndex(sNewIndex);
						}
					});
				}
				delete oColumn._applySelection;
				break;
			default:
		}
	};

	return ObjectField;
});