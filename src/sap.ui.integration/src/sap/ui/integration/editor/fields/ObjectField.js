/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/integration/editor/fields/BaseField",
	"sap/m/Text",
	"sap/m/TextArea",
	"sap/m/Input",
	"sap/m/NavContainer",
	"sap/m/Page",
	"sap/m/Popover",
	"sap/m/OverflowToolbar",
	"sap/m/ToolbarSpacer",
	"sap/m/Button",
	"sap/ui/model/json/JSONModel",
	"sap/ui/table/Table",
	"sap/ui/table/Column",
	"sap/m/Label",
	"sap/m/VBox",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/base/util/deepEqual",
	"sap/ui/core/Icon",
	"sap/m/Switch",
	"sap/m/CheckBox",
	"sap/m/MessageBox",
	"sap/m/MessageToast",
	"sap/base/util/deepClone",
	"sap/m/Link",
	"sap/ui/layout/form/SimpleForm",
	"sap/base/util/merge",
	"sap/m/List",
	"sap/m/CustomListItem",
	"sap/ui/model/Sorter",
	"sap/ui/core/CustomData",
	"sap/ui/integration/editor/EditorResourceBundles",
	"sap/base/util/includes",
	"sap/ui/integration/util/Utils"
], function (
	BaseField,
	Text,
	TextArea,
	Input,
	NavContainer,
	Page,
	Popover,
	OverflowToolbar,
	ToolbarSpacer,
	Button,
	JSONModel,
	Table,
	Column,
	Label,
	VBox,
	Filter,
	FilterOperator,
	deepEqual,
	Icon,
	Switch,
	CheckBox,
	MessageBox,
	MessageToast,
	deepClone,
	Link,
	SimpleForm,
	merge,
	List,
	CustomListItem,
	Sorter,
	CustomData,
	EditorResourceBundles,
	includes,
	Utils
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
			library: "sap.ui.integration",
			events: {
				/**
				 * Fired when table is updated.
				 * @experimental since 1.105
				 * Disclaimer: this event is in a beta state - incompatible API changes may be done before its official public release. Use at your own discretion.
				 */
				tableUpdated: {}
			}
		},
		renderer: BaseField.getMetadata().getRenderer()
	});

	ObjectField.prototype.initVisualization = function (oConfig) {
		var that = this;
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
				// not show _dt property which generated and used by editor
				if (n !== "_dt") {
					var sType = typeof oConfig.value[n];
					var oProperty = sType === "string" ? {} : {"type": sType};
					oProperties[n] = oProperty;
				}
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
				visibleRowCount: 5,
				busy: "{currentSettings>_loading}",
				busyIndicatorDelay: 200,
				columns: columns,
				selectionBehavior: "RowOnly",
				rowSelectionChange: that.onTableSelectionChange.bind(that),
				toolbar: oTableToolbar,
				filter: that.onFilter.bind(that)
			}
		};
		if (oConfig.type === "object") {
			oVisualization.settings.rows = "{" + sPath + "}";
		} else {
			// for object list parameter, allow sort
			oVisualization.settings.rows = "{path: '" + sPath + "', sorter: {path: '_dt/_position', descending: false}}";
		}
		return oVisualization;
	};

	ObjectField.prototype.createSimpleFormVisualization = function(oConfig) {
		var that = this;
		var oResourceBundle = that.getResourceBundle();
		var fnChange = function() {
			var oModel = this.getAggregation("_field").getModel();
			oModel.checkUpdate(true);
			var oValue = oModel.getProperty("/value");
			// generate uuid if not exists
			if (!oValue._dt) {
				oValue._dt = {
					_uuid: Utils.generateUuidV4()
				};
			} else if (!oValue._dt._uuid) {
				oValue._dt._uuid = Utils.generateUuidV4();
			}
			oValue = deepClone(oValue, 500);
			this.setValue(oValue);
		}.bind(that);
		var aObjectPropertyFormContents = that.createFormContents(fnChange, "/value/", false, that.openTranslationPopup);
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
				that.setValue(undefined);
				var oModel = that.getAggregation("_field").getModel();
				// delete the translation texts when deleting the object
				var oObject = oModel.getProperty("/value");
				if (oObject && oObject._dt && oObject._dt._uuid) {
					that.deleteTranslationValueInTexts(undefined, oObject._dt._uuid);
				}
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

	ObjectField.prototype.buildSelectionColumnLables = function() {
		var that = this;
		var oConfig = that.getConfiguration();
		var oResourceBundle = that.getResourceBundle();
		return new Button({
			icon: "sap-icon://clear-all",
			type: "Transparent",
			enabled: typeof oConfig.values === "undefined" ? false : "{/_hasSelected}",
			tooltip: oResourceBundle.getText("EDITOR_FIELD_OBJECT_TABLE_COLUMN_SELECTION_TOOLTIP_REMOVE"),
			press: that.onUnSelectAll.bind(that)
		});
	};

	ObjectField.prototype.buildTableColumns = function() {
		var that = this;
		var oConfig = that.getConfiguration();
		var aColumns = [];
		var aKeys = Object.keys(oConfig.properties);
		if (aKeys.length > 0) {
			var oResourceBundle = that.getResourceBundle();
			var oSelectionColumnLabels = that.buildSelectionColumnLables();
			var oSelectionColumn = new Column({
				width: "3.2rem",
				hAlign: "Center",
				// hide selection column for object list field with properties defined only
				visible: typeof oConfig.values === "undefined" ? false : true,
				multiLabels: [
					oSelectionColumnLabels
				],
				template: new CheckBox({
					selected: "{_dt/_selected}",
					enabled: typeof oConfig.values === "undefined" ? false : true,
					tooltip: {
						path: '_dt/_selected',
						formatter: function(bSelected) {
							if (bSelected) {
								if (oConfig.type === "object") {
									return oResourceBundle.getText("EDITOR_FIELD_OBJECT_TABLE_COLUMN_SELECTION_CELL_TOOLTIP_UNSELECT");
								} else {
									return oResourceBundle.getText("EDITOR_FIELD_OBJECT_LIST_TABLE_COLUMN_SELECTION_CELL_TOOLTIP_REMOVE");
								}
							} else if (oConfig.type === "object") {
								return oResourceBundle.getText("EDITOR_FIELD_OBJECT_TABLE_COLUMN_SELECTION_CELL_TOOLTIP_SELECT");
							} else {
								return oResourceBundle.getText("EDITOR_FIELD_OBJECT_LIST_TABLE_COLUMN_SELECTION_CELL_TOOLTIP_ADD");
							}
						}
					},
					select: that.onSelectionChange.bind(that)
				})
			});
			aColumns.push(oSelectionColumn);
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
						var oTextSettingsModel = new JSONModel({
							translatable: oProperty.translatable || false,
							property: n
						});
						if (typeof oText === "string") {
							var sTranslationKey = that.getTranslationKey(oText);
							if (sTranslationKey) {
								oCellSettings.text = oResourceBundle.getText(sTranslationKey);
							} else if (oText.startsWith('{') && oText.endsWith('}')) {
								oCellSettings.text = {
									path: oText.substring(1, oText.length - 1),
									formatter: function(oValue) {
										var oBindingContext = this.getBindingContext(),
											oTranslationValue,
											oSettings = this.getModel("settings").getData(),
											sTranslationKeyInCellValue = that.getTranslationKey(oValue);
										if (oSettings.translatable || sTranslationKeyInCellValue) {
											if (oBindingContext && oBindingContext.getObject() && oBindingContext.getObject()._dt) {
												oTranslationValue = that.getTranslationValueInTexts(oResourceBundle.sLocale.replaceAll('_', '-'), oBindingContext.getObject()._dt._uuid, oSettings.property);
												if (oTranslationValue) {
													return oTranslationValue;
												}
											}
											if (sTranslationKeyInCellValue) {
												oValue = oResourceBundle.getText(sTranslationKeyInCellValue);
												return oValue;
											}
										}
										return oValue;
									}
								};
							}
						}
						oCellSettings.tooltip = oCell.tooltip || oCellSettings.text;
						oCellTemplate = new Text(oCellSettings);
						oCellTemplate.setModel(oTextSettingsModel,"settings");
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
		}
		return aColumns;
	};

	ObjectField.prototype.checkHasFilterDefined = function(oConfig) {
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
		var bHasFilterDefined = that.checkHasFilterDefined(oConfig);
		var bAddButtonVisible = oConfig.enabled !== false;
		var sAddButtonTooltip = oConfig.addButtonText || oResourceBundle.getText("EDITOR_FIELD_OBJECT_TABLE_BUTTON_ADD_TOOLTIP");
		if (bAddButtonVisible && oConfig.values) {
			bAddButtonVisible = oConfig.values.allowAdd === true;
		}
		var oContents = [
			new ToolbarSpacer(),
			new Button({
				icon: "sap-icon://add",
				visible: bAddButtonVisible,
				tooltip: sAddButtonTooltip,
				press: that.addNewObject.bind(that)
			}),
			new Button({
				icon: "sap-icon://edit",
				tooltip: oResourceBundle.getText("EDITOR_FIELD_OBJECT_TABLE_BUTTON_EDIT_TOOLTIP"),
				enabled: "{= !!${/_hasTableSelected}}",
				press: that.onEditOrViewDetail.bind(that)
			}),
			new Button({
				icon: "sap-icon://delete",
				tooltip: oResourceBundle.getText("EDITOR_FIELD_OBJECT_DELETE"),
				enabled: "{= !!${/_canDelete}}",
				press: that.onDelete.bind(that)
			}),
			new Button({
				icon: "sap-icon://clear-filter",
				visible: bHasFilterDefined,
				enabled: "{= !!${/_hasFilter}}",
				tooltip: oResourceBundle.getText("EDITOR_FIELD_OBJECT_TABLE_BUTTON_CLEAR_ALL_FILTERS_TOOLTIP"),
				press: that.clearAllFilters.bind(that)
			}),
			new Button({
				icon: "sap-icon://multiselect-all",
				visible: false,
				enabled: "{= !${/_hasTableAllSelected}}",
				tooltip: oResourceBundle.getText("EDITOR_FIELD_OBJECT_TABLE_BUTTON_SELECT_ALL_SELETIONS_TOOLTIP"),
				press: that.selectAllTableSelections.bind(that)
			}),
			new Button({
				icon: "sap-icon://multiselect-none",
				visible: false,
				enabled: "{= !!${/_hasTableSelected}}",
				tooltip: oResourceBundle.getText("EDITOR_FIELD_OBJECT_TABLE_BUTTON_CLEAR_ALL_SELETIONS_TOOLTIP"),
				press: that.clearAllTableSelections.bind(that)
			})
		];
		if (oConfig.type === "object[]") {
			oContents = oContents.concat([
				new Button({
					icon: "sap-icon://navigation-up-arrow",
					enabled: "{= !!${/_hasOnlyOneRowSelected}}",
					tooltip: oResourceBundle.getText("EDITOR_FIELD_OBJECT_TABLE_BUTTON_MOVE_UP_TOOLTIP"),
					press: that.moveRowUp.bind(that)
				}),
				new Button({
					icon: "sap-icon://navigation-down-arrow",
					enabled: "{= !!${/_hasOnlyOneRowSelected}}",
					tooltip: oResourceBundle.getText("EDITOR_FIELD_OBJECT_TABLE_BUTTON_MOVE_DOWN_TOOLTIP"),
					press: that.moveRowDown.bind(that)
				})
			]);
		}
		return new OverflowToolbar({
			content: oContents
		});
	};

	ObjectField.prototype.onUnSelectAll = function(oEvent) {
		var that = this;
		var oTable = that.getAggregation("_field");
		var sPath = oTable.getBindingContext().getPath();
		var oModel = oTable.getModel();
		var oData = oModel.getProperty(sPath);
		oData.forEach(function (oItem) {
			oItem._dt = oItem._dt || {};
			oItem._dt._selected = false;
		});
		oModel.setProperty("/_hasSelected", false);
		oModel.checkUpdate(true);
		that.setValue(undefined);
	};

	ObjectField.prototype.onEditOrViewDetail = function(oEvent) {
		var that = this;
		var oTable = that.getAggregation("_field");

		var iSelectIndex = oTable.getSelectedIndex();
		var oRowContexts = oTable.getBinding("rows").getContexts();
		var oItem = oRowContexts[iSelectIndex].getObject();
		var iFirstIndex = oTable.getFirstVisibleRow();
		var oRow = oTable.getRows()[iSelectIndex - iFirstIndex];
		var oCell1 = oRow.getCells()[0];
		that.openObjectDetailsPopover(oItem, oCell1, !oItem._dt || oItem._dt._editable !== false ? "update" : "view");
	};

	ObjectField.prototype.onFilter = function(oEvent) {
		var that = this;
		var oTable = that.getAggregation("_field");
		oTable.detachEvent("rowsUpdated", that.updateTable, that);
		oTable.attachEventOnce("rowsUpdated", that.updateTable, that);
	};

	ObjectField.prototype.updateTable = function(oEvent) {
		var that = this;
		that.updateSelectionColumn();
		that.updateToolbar();
		that.fireTableUpdated();
	};

	ObjectField.prototype.updateSelectionColumn = function() {
		var that = this;
		var oTable = that.getAggregation("_field");
		var oRowContexts = oTable.getBinding("rows").getContexts();
		var bHasSelected = false;
		for (var i = 0; i < oRowContexts.length; i++) {
			var oObject = oRowContexts[i].getObject();
			if (oObject._dt && oObject._dt._selected) {
				bHasSelected = true;
				break;
			}
		}
		oTable.getModel().setProperty("/_hasSelected", bHasSelected);
	};

	ObjectField.prototype.updateToolbar = function() {
		var that = this;
		var oTable = that.getAggregation("_field");
		var aColumns = oTable.getColumns();
		var bHasFilter = false;
		for (var i = 0; i < aColumns.length; i++) {
			var oMenu = aColumns[i].getMenu();
			var oMenuItems = oMenu.getItems();
			if (oMenuItems.length > 0) {
				var oFilter = oMenuItems[0];
				var sValue = oFilter.getValue();
				if (sValue && sValue !== "") {
					bHasFilter = true;
					break;
				}
			}
		}
		oTable.getModel().setProperty("/_hasFilter", bHasFilter);
	};

	ObjectField.prototype.columnFactory = function(sId, oContext) {
		var sPath = oContext.getPath();
		var sName = sPath.substring(oContext.getPath().lastIndexOf("/") + 1);
		var sType = oContext.getProperty("$Type");
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

	ObjectField.prototype.onTableSelectionChange = function (oEvent) {
		var that = this;
		var oTable = that.getAggregation("_field");
		var oModel = oTable.getModel();
		var aSelectedIndices = oTable.getSelectedIndices();
		if (aSelectedIndices.length > 0) {
			oModel.setProperty("/_hasTableSelected", true);
			if (aSelectedIndices.length === 1) {
				oModel.setProperty("/_hasOnlyOneRowSelected", true);
			} else {
				oModel.setProperty("/_hasOnlyOneRowSelected", false);
			}
		} else {
			oModel.setProperty("/_hasTableSelected", false);
			oModel.setProperty("/_hasOnlyOneRowSelected", false);
			oModel.setProperty("/_canDelete", false);
			return;
		}
		if (aSelectedIndices.length === oTable.getBinding("rows").getContexts().length) {
			oModel.setProperty("/_hasTableAllSelected", true);
		} else {
			oModel.setProperty("/_hasTableAllSelected", false);
		}
		var aSelectedPaths = [];
		var aRowContexts = oTable.getBinding("rows").getContexts();
		aSelectedIndices.forEach(function (iSelectIndex) {
			var oObject = aRowContexts[iSelectIndex].getObject();
			if (oObject._dt && oObject._dt._editable !== false) {
				var sPath = aRowContexts[iSelectIndex].getPath();
				aSelectedPaths.push(sPath);
			}
		});
		if (aSelectedPaths.length === 0) {
			oModel.setProperty("/_canDelete", false);
		} else {
			oModel.setProperty("/_canDelete", true);
		}
	};

	ObjectField.prototype.selectAllTableSelections = function (oEvent) {
		var that = this;
		var oTable = that.getAggregation("_field");
		oTable.selectAll();
		oTable.getModel().setProperty("/_hasTableAllSelected", true);
	};

	ObjectField.prototype.clearAllTableSelections = function (oEvent) {
		var that = this;
		var oTable = that.getAggregation("_field");
		var oModel = oTable.getModel();
		oTable.clearSelection();
		oModel.setProperty("/_hasTableSelected", false);
		oModel.setProperty("/_hasOnlyOneRowSelected", false);
		oModel.setProperty("/_canDelete", false);
		oModel.setProperty("/_hasTableAllSelected", false);
	};

	ObjectField.prototype.moveRowUp = function (oEvent) {
		this.moveSelectedRow("Up");
	};

	ObjectField.prototype.moveRowDown = function (oEvent) {
		this.moveSelectedRow("Down");
	};

	ObjectField.prototype.moveSelectedRow = function (sDirection) {
		var that = this;
		var oTable = that.getAggregation("_field");
		var oModel = oTable.getModel();
		var iSelectedRowIndex = oTable.getSelectedIndex();
		var oSelectedRowContext = oTable.getContextByIndex(iSelectedRowIndex);

		var iSiblingRowIndex = iSelectedRowIndex + (sDirection === "Up" ? -1 : 1);
		var oSiblingRowContext = oTable.getContextByIndex(iSiblingRowIndex);
		if (!oSiblingRowContext) {
			return;
		}

		// swap the selected and the siblings rank
		var iSiblingRowRank = oSiblingRowContext.getProperty("_dt/_position");
		var iSelectedRowRank = oSelectedRowContext.getProperty("_dt/_position");
		oModel.setProperty("_dt/_position", iSiblingRowRank, oSelectedRowContext);
		oModel.setProperty("_dt/_position", iSelectedRowRank, oSiblingRowContext);
		oModel.refresh(true);

		// after move select the sibling
		oTable.setSelectedIndex(iSiblingRowIndex);

		// save change
		that.refreshValue();
	};

	ObjectField.prototype.onSelectionChange = function (oEvent) {
		var that = this;
		var oControl = oEvent.getSource();
		var bSelected = oEvent.getParameter("selected");
		var oTable = that.getAggregation("_field");
		var sPath = oTable.getBindingContext().getPath();
		var oModel = oTable.getModel();
		if (bSelected) {
			var oData = oModel.getProperty(sPath);
			oData.forEach(function (oItem) {
				oItem._dt = oItem._dt || {};
				oItem._dt._selected = false;
			});
			var oObject = oControl.getBindingContext().getObject();
			oObject._dt._selected = true;
			var oClonedObject = deepClone(oObject);
			oModel.setProperty("/_hasSelected", true);
			that.setValue(oClonedObject);
		} else {
			oModel.setProperty("/_hasSelected", false);
			that.setValue(undefined);
		}
	};

	ObjectField.prototype.addNewObject = function (oEvent) {
		var that = this;
		var oControl = oEvent.getSource();
		that._newObjectTemplate._dt._uuid = Utils.generateUuidV4();
		that.openObjectDetailsPopover(that._newObjectTemplate, oControl, "add");
	};

	ObjectField.prototype.mergeValueWithRequestResult = function (tResult) {
		var that = this;
		var oConfig = that.getConfiguration();
		var oTable = that.getAggregation("_field");
		var oModel = oTable.getModel();
		if (oConfig.value && (typeof oConfig.value === "object") && !deepEqual(oConfig.value, {})) {
			var oValue = deepClone(oConfig.value, 500),
				sPath = oTable.getBinding("rows").getPath();
			if (Array.isArray(tResult) && tResult.length > 0) {
				if (oValue._dt && oValue._dt._editable === false) {
					var sUUID = oValue._dt._uuid || Utils.generateUuidV4();
					delete oValue._dt._uuid;
					tResult.forEach(function(oResult) {
						// find the selected request result, change the uuid by the one of the value
						if (deepEqual(oResult, oValue)) {
							oResult._dt._selected = true;
							oResult._dt._uuid = sUUID;
						} else {
							oResult._dt._uuid = Utils.generateUuidV4();
						}
					});
				} else {
					// add uuid for each request result
					tResult.forEach(function(oResult) {
						oResult._dt._uuid = Utils.generateUuidV4();
					});
					oValue._dt = oValue._dt || {};
					oValue._dt._selected = true;
					// add uuid for the value if not exist
					oValue._dt._uuid = oValue._dt._uuid || Utils.generateUuidV4();
					tResult.unshift(oValue);
				}
			} else {
				oValue._dt = oValue._dt || {};
				oValue._dt._selected = true;
				// add uuid for the value if not exist
				oValue._dt._uuid = oValue._dt._uuid || Utils.generateUuidV4();
				tResult = [oValue];
			}
			oModel.setProperty("/_hasSelected", true);
			oModel.setProperty(sPath, tResult);
		} else {
			// add uuid for each request result
			if (Array.isArray(tResult) && tResult.length > 0) {
				tResult.forEach(function(oResult) {
					oResult._dt._uuid = Utils.generateUuidV4();
				});
			}
			oModel.setProperty("/_hasSelected", false);
		}
		oModel.checkUpdate();
		that.updateTable();
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

	ObjectField.prototype.createFormContents = function (fnChange, sPathPrefix, bIsInPopover, fnNavToTranslation) {
		var that = this;
		var oConfig = that.getConfiguration();
		var aContentList = that.createPropertyContents(fnChange, sPathPrefix, fnNavToTranslation);
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
			editable: oConfig.editable === false ? false : "{= ${" + sPathPrefix + "_dt/_editable} !== false}",
			width: "100%",
			placeholder: "{config/placeholder}",
			visible: "{= ${/editMode} === 'Json'}",
			change: bIsInPopover === true ? this.onChangeOfTextAreaInPopover.bind(that) : this.onChangeOfTextArea.bind(that),
			rows: bIsInPopover === true ? 11 : 7
		}));
		return aContentList;
	};

	ObjectField.prototype.createPropertyContents = function (fnChange, sPathPrefix, fnNavToTranslation) {
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
					} else {
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
			var oPropertySettings = deepClone(oProperty, 500);
			delete oPropertySettings.type;
			delete oPropertySettings.label;
			delete oPropertySettings.translatable;
			delete oPropertySettings.defaultValue;
			delete oPropertySettings.formatter;
			delete oPropertySettings.column;
			delete oPropertySettings.cell;
			var oSettings;
			switch (oProperty.type) {
				case "boolean":
					if (oProperty.cell && oProperty.cell.type === "Switch") {
						oSettings = {
							state: "{" + sPathPrefix + n + "}",
							visible: "{= ${/editMode} === 'Properties'}",
							enabled: oConfig.editable === false ? false : "{= ${" + sPathPrefix + "_dt/_editable} !== false}",
							change: fnChange
						};
						if (oProperty.cell.customTextOn) {
							oSettings.customTextOn = oProperty.cell.customTextOn;
						}
						if (oProperty.cell.customTextOff) {
							oSettings.customTextOff = oProperty.cell.customTextOff;
						}
						oSettings = merge(oSettings, oPropertySettings);
						oValueControl = new Switch(oSettings);
					} else {
						oSettings = {
							selected: "{" + sPathPrefix + n + "}",
							visible: "{= ${/editMode} === 'Properties'}",
							enabled: oConfig.editable === false ? false : "{= ${" + sPathPrefix + "_dt/_editable} !== false}",
							select: fnChange
						};
						oSettings = merge(oSettings, oPropertySettings);
						oValueControl = new CheckBox(oSettings);
					}
					break;
				case "int":
				case "integer":
					oSettings = {
						value: {
							path: sPathPrefix + n,
							type: "sap.ui.model.type.Integer",
							formatOptions: oProperty.formatter
						},
						visible: "{= ${/editMode} === 'Properties'}",
						editable: oConfig.editable === false ? false : "{= ${" + sPathPrefix + "_dt/_editable} !== false}",
						type: "Number",
						change: fnChange
					};
					oSettings = merge(oSettings, oPropertySettings);
					oValueControl = new Input(oSettings);
					break;
				case "number":
					oSettings = {
						value: {
							path: sPathPrefix + n,
							type: "sap.ui.model.type.Float",
							formatOptions: oProperty.formatter
						},
						visible: "{= ${/editMode} === 'Properties'}",
						editable: oConfig.editable === false ? false : "{= ${" + sPathPrefix + "_dt/_editable} !== false}",
						type: "Number",
						change: fnChange
					};
					oSettings = merge(oSettings, oPropertySettings);
					oValueControl = new Input(oSettings);
					break;
				case "object":
					oSettings = {
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
						editable: oConfig.editable === false ? false : "{= ${" + sPathPrefix + "_dt/_editable} !== false}",
						change: fnChange,
						rows: 3
					};
					oSettings = merge(oSettings, oPropertySettings);
					oValueControl = new TextArea(oSettings);
					break;
				default:
					var oTextSettingsModel = new JSONModel({
						translatable: oProperty.translatable || false,
						uuidPath: sPathPrefix + "_dt/_uuid",
						property: n
					});
					oSettings = {
						value: "{" + sPathPrefix + n + "}",
						visible: "{= ${/editMode} === 'Properties'}",
						editable: oConfig.editable === false ? false : "{= ${" + sPathPrefix + "_dt/_editable} !== false}",
						change: function(oEvent) {
							var oControl = oEvent.getSource();
							var sValue = oEvent.getParameter("value");
							// change the translation format {{KEY}} to {i18n>KEY} since manifest will translate it, but we don't want
							// more info in JIRA DIGITALWORKPLACE-3974
							if (sValue && sValue.match(REGEXP_TRANSLATABLE)) {
								var sKey = sValue.substring(2, sValue.length - 2);
								sValue = "{i18n>" + sKey + "}";
								oControl.setValue(sValue);
								oControl.fireChange();
							} else if (fnChange) {
								fnChange(oEvent);
							}
						}
					};
					oSettings = merge(oSettings, oPropertySettings);
					// show the translation help icon of the input
					if (fnNavToTranslation) {
						oSettings.valueHelpIconSrc = "sap-icon://translate";
						oSettings.valueHelpRequest = fnNavToTranslation.bind(that, n);
						if (oProperty.translatable) {
							oSettings.showValueHelp = true;
						} else {
							oSettings.showValueHelp = {
								path: sPathPrefix + n,
								formatter: function(oValue) {
									var oSettings = this.getModel("settings").getData();
									var sUUID = this.getModel().getProperty(oSettings.uuidPath);
									var sConfigName = "translatable";
									if (that.getTranslationKey(oValue)) {
										if (!this.getShowValueHelp() && that.getObjectPropertyConfigValueInDesigntime(sUUID, oSettings.property, sConfigName) === false) {
											that.setObjectPropertyConfigValueInDesigntime(sUUID, oSettings.property, sConfigName, true);
										}
										return true;
									}
									if (this.getShowValueHelp()) {
										// clean the translation values and updated language since the translation feature is off
										that.deleteTranslationValueInTexts(undefined, sUUID, oSettings.property);
										that.setObjectPropertyConfigValueInDesigntime(sUUID, oSettings.property, sConfigName, false);
										that._oUpdatedTranslations = {};
									}
									return false;
								}
							};
						}
					}
					oValueControl = new Input(oSettings);
					oValueControl.setModel(oTextSettingsModel,"settings");
			}
			aPropertyContentList.push(oValueControl);
		}
		return aPropertyContentList;
	};

	ObjectField.prototype.saveValue = function (oValue, oTextArea, bIsInDetailsPopover) {
		var that = this;
		var oValueModel;
		if (!bIsInDetailsPopover) {
			that.setValue(oValue);
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
			that.setValue(oValue);
		};
		var aPropertyContents = that.createPropertyContents(fnChange, "/value/");
		aPropertyContents = aPropertyContents.concat(aContents);
		aPropertyContents.forEach(function(oContent) {
			oControl.addContent(oContent);
		});
	};

	// get origin values in i18n files
	ObjectField.prototype.getOriginTranslatedValues = function(sKey) {
		var aOriginTranslatedValues = [];
		var aEditorResourceBundles = EditorResourceBundles.getInstance();
		for (var p in aEditorResourceBundles) {
			var oResourceBundleTemp = aEditorResourceBundles[p];
			var sTranslatedValue = "";
			var sOriginValue = "";
			if (sKey && oResourceBundleTemp) {
				var sText = oResourceBundleTemp.resourceBundle && oResourceBundleTemp.resourceBundle.getText(sKey);
				sTranslatedValue = sText;
				sOriginValue = sText;
			} else {
				// if no translation key which means item defined as string value directly.
				// set the sTranslatedValue and sOriginValue for each language with item manifest value or default value.
				sTranslatedValue = "";
				sOriginValue = "";
			}
			var oLanguage = {
				"key": p,
				"desription": oResourceBundleTemp.language,
				"value": sTranslatedValue,
				"originValue": sOriginValue,
				"editable": true
			};
			aOriginTranslatedValues.push(oLanguage);
		}
		return aOriginTranslatedValues;
	};

	// build origin translation values if translation type is "property"
	ObjectField.prototype.buildPropertyTranslationValues = function(sKey) {
		var aOriginTranslatedValues = [];
		var aEditorResourceBundles = EditorResourceBundles.getInstance();
		for (var p in aEditorResourceBundles) {
			aOriginTranslatedValues.push({
				"key": p,
				"desription": aEditorResourceBundles[p].language,
				"value": sKey,
				"originValue": sKey,
				"editable": true
			});
		}
		return aOriginTranslatedValues;
	};

	ObjectField.prototype.openObjectDetailsPopover = function (oItem, oControl, sMode) {
		var that = this;
		var oResourceBundle = that.getResourceBundle();
		var oItemCloned = deepClone(oItem, 500);
		var oModel;
		var sPlacement = "Right";
		if (sMode === "add") {
			sPlacement = this.getPopoverPlacement(oControl);
		}
		if (!that._oObjectDetailsPopover) {
			var oAddButton = new Button({
				text: oResourceBundle.getText("EDITOR_FIELD_OBJECT_DETAILS_POPOVER_BUTTON_ADD"),
				visible: sMode === "add",
				enabled: {
					path: '/value',
					formatter: function(vValue) {
						if (typeof vValue !== "object" || deepEqual(vValue, {})) {
							return false;
						} else {
							var oValue = deepClone(vValue);
							delete oValue._dt;
							if (deepEqual(oValue, {})) {
								return false;
							}
						}
						return true;
					}
				},
				press: that.onAdd.bind(that)
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
					if (sMode === "add") {
						// clean the translations for the cancelled new object
						var oNewObject = that._oObjectDetailsPopover.getModel().getProperty("/value");
						that.deleteTranslationValueInTexts(undefined, oNewObject._dt._uuid);
					}
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
			var aObjectPropertyFormContents;
			that._oNavContainer = new NavContainer();
			that._oObjectDetailsPage = new Page({
				title: oResourceBundle.getText("EDITOR_FIELD_OBJECT_DETAILS_POPOVER_TITLE"),
				headerContent: oEditModeButton,
				footer: new OverflowToolbar({
					content: [
						new ToolbarSpacer(),
						oAddButton,
						oUpdateButton,
						oCancelButton,
						oCloseButton
					]
				})
			});
			var fnNavBack = function (oEvent) {
				that._oNavContainer.back();
				that._oObjectDetailsPage.focus();
			};
			var oList = that.buildTranslationsList();
			var oTranslationsFooter = that.buildTranslationsFooter(oList, false);
			that._oTranslationListPage = new Page({
				title: oResourceBundle.getText("EDITOR_FIELD_OBJECT_TRANSLATION_LIST_TITLE", "{languages>/property}"),
				showNavButton: true,
				navButtonPress: fnNavBack,
				content: oList,
				footer: oTranslationsFooter
			});
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
			if (oItem._dt && oItem._dt._editable === false) {
				aObjectPropertyFormContents = that.createFormContents(fnChange, "/value/", true, that.navToTranslationPage);
			} else {
				aObjectPropertyFormContents = that.createFormContents(fnChangeWithDataSave, "/value/", true, that.navToTranslationPage);
			}
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
			that._oObjectDetailsPage.addContent(oForm);
			that._oNavContainer.addPage(that._oObjectDetailsPage);
			/*
			_oTranslationListPage.addContent();
			*/
			that._oNavContainer.addPage(that._oTranslationListPage);
			that._oObjectDetailsPopover = new Popover({
				placement: sPlacement,
				showHeader: false,
				contentWidth: "300px",
				contentHeight: "345px",
				modal: true,
				content: that._oNavContainer
			}).addStyleClass("sapUiIntegrationEditorItemObjectFieldDetailsPopover");
			oModel = new JSONModel({
				"value": oItemCloned,
				"editMode": "Properties"
			});
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
			oModel.checkUpdate(true);
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
			that._oObjectDetailsPopover.setPlacement(sPlacement);
			// nav back to main page
			that._oNavContainer.back();
		}
		that._oObjectDetailsPopover.openBy(oControl);
	};

	// build the translation data of the translation list
	ObjectField.prototype.buildTranslationsData = function (sKey, sType, sUUID, sProperty) {
		var that = this;
		var oResourceBundle = that.getResourceBundle();
		that._oOriginTranslatedValues = that._oOriginTranslatedValues || {};
		that._oUpdatedTranslations = that._oUpdatedTranslations || {};
		var sPropertyKey = sUUID + "_" + sProperty;
		var sTranslationKey = sKey;
		// get or build the initial translation data
		if (sType === "key") {
			if (!that._oOriginTranslatedValues[sKey]) {
				that._oOriginTranslatedValues[sKey] = that.getOriginTranslatedValues(sKey);
			}
		} else if (sType === "property") {
			sTranslationKey = sPropertyKey;
			that._oOriginTranslatedValues[sTranslationKey] = that.buildPropertyTranslationValues(sKey);
		}
		var aTempTranslatedLanguages = [];
		// merge with the current translation texts
		that._oOriginTranslatedValues[sTranslationKey].forEach(function (originTranslatedValue) {
			var oTempTranslatedValue = deepClone(originTranslatedValue, 500);
			oTempTranslatedValue.status = oResourceBundle.getText("EDITOR_FIELD_TRANSLATION_LIST_POPOVER_LISTITEM_GROUP_NOTUPDATED");
			var sTranslateText = that.getTranslationValueInTexts(oTempTranslatedValue.key, sUUID, sProperty);
			if (sTranslateText) {
				oTempTranslatedValue.value = sTranslateText;
				if (includes(that._oUpdatedTranslations[sTranslationKey], oTempTranslatedValue.key)) {
					oTempTranslatedValue.value = that.getTranslationValueInTexts(oTempTranslatedValue.key, sUUID, sProperty);
					oTempTranslatedValue.status = oResourceBundle.getText("EDITOR_FIELD_TRANSLATION_LIST_POPOVER_LISTITEM_GROUP_UPDATED");
				} else {
					oTempTranslatedValue.originValue = oTempTranslatedValue.value;
				}
			}
			if (oTempTranslatedValue.key === oResourceBundle.sLocale.replaceAll('_', '-')) {
				oTempTranslatedValue.desription += " (" + oResourceBundle.getText("EDITOR_FIELD_TRANSLATION_LIST_POPOVER_CURRENTLANGUAGE") + ")";
				aTempTranslatedLanguages.unshift(oTempTranslatedValue);
			} else {
				aTempTranslatedLanguages.push(oTempTranslatedValue);
			}
		});
		var oTranslatedValues = {
			"isUpdated": false,
			"key": sKey,
			"translationKey": sTranslationKey,
			"translationType": sType,
			"uuid": sUUID,
			"property": sProperty,
			"translatedLanguages": aTempTranslatedLanguages
		};
		return oTranslatedValues;
	};

	ObjectField.prototype.getTranslationKey = function (sValue) {
		var sKey;
		if (sValue && sValue.match(REGEXP_TRANSLATABLE)) {
			sKey = sValue.substring(2, sValue.length - 2);
		} else if (sValue && sValue.startsWith("{i18n>") && sValue.endsWith('}')) {
			sKey = sValue.substring(6, sValue.length - 1);
		}
		return sKey;
	};

	ObjectField.prototype.buildTranslationsModel = function (oTranslatedValues) {
		var that = this;
		var oResourceBundle = that.getResourceBundle();
		var oTranslatonsModel = new JSONModel(oTranslatedValues);
		oTranslatonsModel.attachPropertyChange(function(oEvent) {
			//update the status of each translation for grouping
			//update the isUpdated property
			var oData = oTranslatonsModel.getData();
			var sUpdatedStr = oResourceBundle.getText("EDITOR_FIELD_TRANSLATION_LIST_POPOVER_LISTITEM_GROUP_UPDATED");
			var sNotUpdatedStr = oResourceBundle.getText("EDITOR_FIELD_TRANSLATION_LIST_POPOVER_LISTITEM_GROUP_NOTUPDATED");
			var bIsUpdated = false;
			oData.translatedLanguages.forEach(function(oLanguage) {
				if (oLanguage.value !== oLanguage.originValue) {
					oLanguage.status = sUpdatedStr;
					bIsUpdated = true;
				} else {
					oLanguage.status = sNotUpdatedStr;
				}
			});
			oData.isUpdated = bIsUpdated;
			oTranslatonsModel.setData(oData);
			oTranslatonsModel.checkUpdate(true);
		});
		return oTranslatonsModel;
	};

	ObjectField.prototype.buildTranslationsList = function () {
		return new List({
			items: {
				path: "languages>/translatedLanguages",
				template: new CustomListItem({
					content: [
						new VBox({
							items: [
								new Text({
									text: "{languages>desription}"
								}),
								new Input({
									value: "{languages>value}",
									editable: "{languages>editable}"
								})
							]
						})
					],
					customData: [
						new CustomData({
							key: "{languages>key}",
							value: "{languages>desription}"
						})
					]
				}),
				sorter: [new Sorter({
					path: 'status',
					descending: true,
					group: true
				})]
			}
		});
	};

	ObjectField.prototype.buildTranslationsFooter = function (oList, bIsInTranslationPopover) {
		var that = this;
		var oResourceBundle = that.getResourceBundle();
		var sCurrentLanugae = oResourceBundle.sLocale.replaceAll('_', '-');
		var oSaveTranslationButton = new Button({
			type: "Emphasized",
			text: oResourceBundle.getText("EDITOR_FIELD_TRANSLATION_LIST_POPOVER_BUTTON_SAVE"),
			enabled: "{languages>/isUpdated}",
			press: function () {
				var oTranslationModel = oList.getModel("languages");
				var oData = oTranslationModel.getData();
				//get changes in the popup
				var aUpdatedLanguages = [];
				var sKey = oData.key;
				var sTranslationKey = oData.translationKey;
				var sType = oData.translationType;
				var sUUID = oData.uuid;
				var sProperty = oData.property;
				oData.translatedLanguages.forEach(function(oLanguage) {
					if (oLanguage.value !== oLanguage.originValue) {
						that.setTranslationValueInTexts(oLanguage.key, sUUID, sProperty, oLanguage.value);
						aUpdatedLanguages.push(oLanguage.key);
					}
				});
				var bUpdateDependentFieldsAndPreview = false;
				if (aUpdatedLanguages.length > 0) {
					that._oUpdatedTranslations = that._oUpdatedTranslations || {};
					that._oUpdatedTranslations[sTranslationKey] = aUpdatedLanguages;
					if (includes(aUpdatedLanguages, sCurrentLanugae)) {
						bUpdateDependentFieldsAndPreview = true;
					}
				}
				// refresh the translation list
				oData = that.buildTranslationsData(sKey, sType, sUUID, sProperty);
				oTranslationModel.setData(oData);
				oTranslationModel.checkUpdate(true);
				// update table
				if (that.getModel()) {
					that.getModel().checkUpdate(true);
				}
				// update preview and dependent fields
				if (bUpdateDependentFieldsAndPreview && that._oValueBinding) {
					that._oValueBinding.fireEvent("change");
				}
			}
		});
		var oResetTranslationButton = new Button({
			text: oResourceBundle.getText("EDITOR_FIELD_OBJECT_DETAILS_POPOVER_BUTTON_RESET"),
			enabled: "{languages>/isUpdated}",
			press: function(oEvent) {
				var oTranslationModel = oList.getModel("languages");
				var oData = oTranslationModel.getData();
				// set value to origin value
				oData.translatedLanguages.forEach(function (translatedValue) {
					translatedValue.value = translatedValue.originValue;
					translatedValue.status = oResourceBundle.getText("EDITOR_FIELD_TRANSLATION_LIST_POPOVER_LISTITEM_GROUP_NOTUPDATED");
				});
				oData.isUpdated = false;
				oTranslationModel.setData(oData);
				oTranslationModel.checkUpdate(true);
			}
		});
		var oCancelButton = new Button({
			text: oResourceBundle.getText("EDITOR_FIELD_TRANSLATION_LIST_POPOVER_BUTTON_CANCEL"),
			visible: bIsInTranslationPopover,
			press: function () {
				that._oTranslationPopover.close();
			}
		});
		return new OverflowToolbar({
			content: [
				new ToolbarSpacer(),
				oSaveTranslationButton,
				oResetTranslationButton,
				oCancelButton
			]
		});
	};

	ObjectField.prototype.openTranslationPopup = function (sProperty, oEvent) {
		var that = this;
		var oControl = oEvent.getSource();
		var oResourceBundle = that.getResourceBundle();
		var oNewObject = oControl.getModel().getProperty("/value");
		if (!oNewObject._dt) {
			oNewObject._dt = {
				_uuid: Utils.generateUuidV4()
			};
		} else if (!oNewObject._dt._uuid) {
			oNewObject._dt._uuid = Utils.generateUuidV4();
		}
		var sValue = oControl.getValue();
		//get translation key of the value
		var sKey = that.getTranslationKey(sValue);
		var sType = "property";
		if (sKey && sKey !== "") {
			sType = "key";
		} else {
			sKey = sValue;
		}
		var oTranslatedValues = that.buildTranslationsData(sKey, sType, oNewObject._dt._uuid, sProperty);
		var oTranslatonsModel;
		var sPlacement = this.getPopoverPlacement(oControl._oValueHelpIcon);
		if (!that._oTranslationPopover) {
			var oList = that.buildTranslationsList();
			var oTranslationsFooter = that.buildTranslationsFooter(oList, true);
			that._oTranslationPopover = new Popover({
				placement: sPlacement,
				contentWidth: "300px",
				contentHeight: "345px",
				title: oResourceBundle.getText("EDITOR_FIELD_OBJECT_TRANSLATION_LIST_TITLE", "{languages>/property}"),
				content: oList,
				footer: oTranslationsFooter
			}).addStyleClass("sapUiIntegrationFieldTranslation");
			oTranslatonsModel = that.buildTranslationsModel(oTranslatedValues);
			that._oTranslationPopover.setModel(oTranslatonsModel, "languages");
		} else {
			that._oTranslationPopover.setPlacement(sPlacement);
			oTranslatonsModel = that._oTranslationPopover.getModel("languages");
			oTranslatonsModel.setData(oTranslatedValues);
			oTranslatonsModel.checkUpdate(true);
		}
		that._oTranslationPopover.openBy(oControl._oValueHelpIcon);
	};

	ObjectField.prototype.navToTranslationPage = function (sProperty, oEvent) {
		var that = this;
		var oNewObject = that._oObjectDetailsPopover.getModel().getProperty("/value");
		var sValue = oNewObject[sProperty];
		//get translation key of the value
		var sKey = that.getTranslationKey(sValue);
		var sType = "property";
		if (sKey && sKey !== "") {
			sType = "key";
		} else {
			sKey = sValue;
		}
		var oTranslatedValues = that.buildTranslationsData(sKey, sType, oNewObject._dt._uuid, sProperty);
		var oTranslatonsModel = that._oTranslationListPage.getModel("languages");
		if (!oTranslatonsModel) {
			oTranslatonsModel = that.buildTranslationsModel(oTranslatedValues);
			that._oTranslationListPage.setModel(oTranslatonsModel, "languages");
		} else {
			oTranslatonsModel.setData(oTranslatedValues);
		}
		that._oNavContainer.to(that._oTranslationListPage);
		that._oTranslationListPage.focus();
	};

	ObjectField.prototype.onAdd = function(oEvent) {
		var that = this;
		var oControl = that.getAggregation("_field");
		var oModel = oControl.getModel();
		var oNewObject = that._oObjectDetailsPopover.getModel().getProperty("/value");
		var sPath = oControl.getBinding("rows").getPath();
		var oData = oModel.getProperty(sPath);
		oData.forEach(function (oItem) {
			if (oItem._dt._selected) {
				oItem._dt._selected = false;
			}
		});
		oData.push(oNewObject);
		oModel.setProperty("/_hasSelected", true);
		oModel.setProperty("/_hasTableAllSelected", false);
		oModel.setProperty("/_hasTableSelected", false);
		oModel.setProperty("/_hasOnlyOneRowSelected", false);
		oModel.checkUpdate();
		that.refreshValue();
		that.updateTable();
		that._oObjectDetailsPopover.close();
	};

	ObjectField.prototype.onUpdate = function (oEvent) {
		var that = this;
		var oTable = that.getAggregation("_field");
		var oObject = that._oObjectDetailsPopover.getModel().getProperty("/value");
		var oModel = oTable.getModel();
		var oRow = that._oObjectDetailsPopover._openBy.getParent();
		var iRowIndex = oRow.getIndex();

		// get the real index via path since the rows may be filtered
		var aRowContexts = oTable.getBinding("rows").getContexts();
		var sPath = aRowContexts[iRowIndex].getPath();
		// update the object in control value model
		oModel.setProperty(sPath, deepClone(oObject, 500));
		oModel.checkUpdate();

		//update object in field value if it is selected
		if (oObject._dt && oObject._dt._selected) {
			that.refreshValue();
		}
		that.updateTable();

		that._oObjectDetailsPopover.close();
	};

	ObjectField.prototype.onDelete = function(oEvent) {
		var that = this;
		var oTable = that.getAggregation("_field");
		var oResourceBundle = that.getResourceBundle();
		var aSelectedIndices = oTable.getSelectedIndices();
		var aSelectedIndexs = [];
		var aRowContexts = oTable.getBinding("rows").getContexts();
		aSelectedIndices.forEach(function (iSelectIndex) {
			var oObject = aRowContexts[iSelectIndex].getObject();
			if (oObject._dt && oObject._dt._editable !== false) {
				var sPath = aRowContexts[iSelectIndex].getPath();
				var iRealIndex = sPath.substring(sPath.lastIndexOf("/") + 1);
				aSelectedIndexs.push(iRealIndex);
			}
		});
		if (aSelectedIndexs.length === 0) {
			MessageBox.error(oResourceBundle.getText("EDITOR_FIELD_OBJECT_DELETE_ERROR_MSG"));
			return;
		}
		MessageBox.confirm(oResourceBundle.getText("EDITOR_FIELD_OBJECT_DELETE_CONFIRM_MSG"), {
			title: oResourceBundle.getText("EDITOR_FIELD_OBJECT_DELETE_CONFIRM_TITLE"),
			onClose: function(sAction) {
				if (sAction === MessageBox.Action.OK) {
					var sPath = oTable.getBindingContext().getPath();
					var oModel = oTable.getModel();
					var oData = oModel.getProperty(sPath);
					var oNewData = [];
					for (var i = 0; i < oData.length; i++) {
						if (includes(aSelectedIndexs, i + "")) {
							that.deleteTranslationValueInTexts(undefined, oData[i]._dt._uuid);
						} else {
							oNewData.push(oData[i]);
						}
					}
					oModel.setProperty(sPath, oNewData);
					oModel.checkUpdate(true);
					that.refreshValue();
					that.updateTable();
				} else {
					MessageToast.show(oResourceBundle.getText("EDITOR_FIELD_OBJECT_DELETE_CONFIRM_CANCLE"));
				}
			}
		});
	};

	ObjectField.prototype.refreshValue = function () {
		var that = this;
		var oTable = that.getAggregation("_field");
		var oModel = oTable.getModel();
		var sPath = oTable.getBinding("rows").getPath();
		var oData = oModel.getProperty(sPath);
		var oValue;
		for (var i = 0; i < oData.length; i++) {
			var oItem = oData[i];
			if (oItem._dt._selected) {
				oValue = deepClone(oItem);
				break;
			}
		}
		that.setValue(oValue);
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

	ObjectField.prototype.setValue = function(oValue) {
		var that = this;
		that.cleanDT(oValue);
		that._setCurrentProperty("value", oValue);
	};

	ObjectField.prototype.cleanDT = function(oValue) {
		if (oValue && oValue._dt && oValue._dt._selected) {
			delete oValue._dt._selected;
		}
		if (oValue && oValue._dt && deepEqual(oValue._dt, {})) {
			delete oValue._dt;
		}
	};

	// get the translation text
	ObjectField.prototype.getTranslationValueInTexts = function (sLanguage, sUUID, sProperty) {
		var that = this;
		var oConfig = that.getConfiguration();
		var sTranslationPath = "/texts/" + sLanguage;
		var oProperty = this._settingsModel.getProperty(sTranslationPath) || {};
		var oValue = oProperty[oConfig.manifestpath];
		var sValue;
		if (oValue && oValue[sUUID]) {
			sValue = oValue[sUUID][sProperty];
		}
		return sValue;
	};

	// set the config value of the property in designtime
	ObjectField.prototype.setObjectPropertyConfigValueInDesigntime = function (sUUID, sProperty, sConfigName, vConfigValue) {
		var that = this;
		var oConfig = that.getConfiguration();
		var sDesigntimePath = "/:designtime";
		var oData = this._settingsModel.getData();
		if (!oData) {
			return;
		}
		var oDesigntime;
		if (!oData.hasOwnProperty(":designtime")) {
			oDesigntime = {};
		} else {
			oDesigntime = deepClone(oData[":designtime"], 500);
		}
		if (!oDesigntime.hasOwnProperty(oConfig.manifestpath)) {
			oDesigntime[oConfig.manifestpath] = {};
		}
		if (!oDesigntime[oConfig.manifestpath].hasOwnProperty(sUUID)) {
			oDesigntime[oConfig.manifestpath][sUUID] = {};
		}
		if (!oDesigntime[oConfig.manifestpath][sUUID].hasOwnProperty(sProperty)) {
			oDesigntime[oConfig.manifestpath][sUUID][sProperty] = {};
		}
		oDesigntime[oConfig.manifestpath][sUUID][sProperty][sConfigName] = vConfigValue;
		this._settingsModel.setProperty(sDesigntimePath, oDesigntime);
	};

	// get the config value of the property in designtime
	ObjectField.prototype.getObjectPropertyConfigValueInDesigntime = function (sUUID, sProperty, sConfigName) {
		var that = this;
		var vConfigValue;
		var oConfig = that.getConfiguration();
		var oData = this._settingsModel.getData();
		if (oData && oData[":designtime"]
			&& oData[":designtime"][oConfig.manifestpath]
			&& oData[":designtime"][oConfig.manifestpath][sUUID]
			&& oData[":designtime"][oConfig.manifestpath][sUUID][sProperty]
			&& oData[":designtime"][oConfig.manifestpath][sUUID][sProperty].hasOwnProperty(sConfigName)) {
			vConfigValue = oData[":designtime"][oConfig.manifestpath][sUUID][sProperty][sConfigName];
		}
		return vConfigValue;
	};

	// set the translation text
	ObjectField.prototype.setTranslationValueInTexts = function (sLanguage, sUUID, sProperty, sValue) {
		var that = this;
		var oConfig = that.getConfiguration();
		var sTranslationPath = "/texts";
		var oData = this._settingsModel.getData();
		if (!oData) {
			return;
		}
		var oTexts;
		if (!oData.hasOwnProperty("texts")) {
			oTexts = {};
		} else {
			oTexts = deepClone(oData.texts, 500);
		}
		if (!oTexts.hasOwnProperty(sLanguage)) {
			oTexts[sLanguage] = {};
		}
		if (!oTexts[sLanguage].hasOwnProperty(oConfig.manifestpath)) {
			oTexts[sLanguage][oConfig.manifestpath] = {};
		}
		if (!oTexts[sLanguage][oConfig.manifestpath].hasOwnProperty(sUUID)) {
			oTexts[sLanguage][oConfig.manifestpath][sUUID] = {};
		}
		oTexts[sLanguage][oConfig.manifestpath][sUUID][sProperty] = sValue;
		this._settingsModel.setProperty(sTranslationPath, oTexts);
	};

	// delete the translation text
	ObjectField.prototype.deleteTranslationValueInTexts = function (sLanguage, sUUID, sProperty) {
		var that = this;
		var oData = that._settingsModel.getData();
		if (!oData || !oData.texts || !sUUID) {
			return;
		}
		var oConfig = that.getConfiguration();
		var sTranslationPath = "/texts";
		var oTexts = deepClone(oData.texts, 500);
		if (sLanguage) {
			if (oTexts[sLanguage]
				&& oTexts[sLanguage][oConfig.manifestpath]
				&& oTexts[sLanguage][oConfig.manifestpath][sUUID]) {
				if (sProperty) {
					if (oTexts[sLanguage][oConfig.manifestpath][sUUID].hasOwnProperty(sProperty)) {
						delete oTexts[sLanguage][oConfig.manifestpath][sUUID][sProperty];
						if (deepEqual(oTexts[sLanguage][oConfig.manifestpath][sUUID], {})) {
							delete oTexts[sLanguage][oConfig.manifestpath][sUUID];
						}
						this._settingsModel.setProperty(sTranslationPath, oTexts);
					}
				} else {
					delete oTexts[sLanguage][oConfig.manifestpath][sUUID];
					if (deepEqual(oTexts[sLanguage][oConfig.manifestpath], {})) {
						delete oTexts[sLanguage][oConfig.manifestpath];
						if (deepEqual(oTexts[sLanguage], {})) {
							delete oTexts[sLanguage];
						}
					}
					this._settingsModel.setProperty(sTranslationPath, oTexts);
				}
			}
		} else {
			for (var n in oTexts) {
				that.deleteTranslationValueInTexts(n, sUUID, sProperty);
			}
		}
	};

	return ObjectField;
});