/*!
 * ${copyright}
 */

sap.ui.define([
	"./TableTypeBase",
	"../library",
	"sap/m/Button",
	"sap/m/plugins/ColumnResizer",
	"sap/m/SegmentedButton",
	"sap/m/SegmentedButtonItem",
	"sap/ui/Device",
	"sap/ui/core/Core"
], function(
	TableTypeBase,
	library,
	Button,
	ColumnResizer,
	SegmentedButton,
	SegmentedButtonItem,
	Device,
	Core
) {
	"use strict";

	var InnerTable, InnerColumn, InnerRow;
	var GrowingMode = library.GrowingMode;
	var RowAction = library.RowAction;
	/**
	 * Constructor for a new <code>ResponsiveTableType</code>.
	 *
	 * @param {string} [sId] Optional ID for the new object; generated automatically if no non-empty ID is given
	 * @param {object} [mSettings] Initial settings for the new object
	 * @class The table type info class for the metadata-driven table.
	 * @extends sap.ui.mdc.table.TableTypeBase
	 * @author SAP SE
	 * @private
	 * @experimental
	 * @ui5-restricted sap.fe
	 * @MDC_PUBLIC_CANDIDATE
	 * @since 1.65
	 * @alias sap.ui.mdc.table.ResponsiveTableType
	 */

	var ResponsiveTableType = TableTypeBase.extend("sap.ui.mdc.table.ResponsiveTableType", {
		metadata: {
			library: "sap.ui.mdc",
			properties: {
				/**
				 * Specifies the growing mode.
				 */
				growingMode: {
					type: "sap.ui.mdc.GrowingMode",
					defaultValue: GrowingMode.Basic
				},
				/**
				 * Specifies whether the Show / Hide Details button for the <code>ResponsiveTable</code> scenario is shown.
				 *
				 * If the available screen space gets too narrow, the columns configured with <code>High</code> and <code>Medium</code> importance
				 * move to the pop-in area, while the columns with <code>Low</code> importance are hidden.<br>
				 * On mobile phones, the columns with <code>Medium</code> importance are also hidden.<br>
				 * As soon as the first column is hidden, this button appears in the table toolbar and gives the user the possibility to toggle the
				 * visibility of the hidden columns in the pop-in area.
				 *
				 * @since 1.79
				 */
				showDetailsButton: {
					type: "boolean",
					group: "Misc",
					defaultValue: false
				},
				/**
				 * Defines which columns are hidden instead of moved into the pop-in area depending on their importance.
				 * See {@link sap.m.Column#getImportance} and {@link sap.m.Table#getHiddenInPopin} for more details.
				 *
				 * <b>Note:</b> To hide columns based on their importance, it's mandatory to set <code>showDetailsButton="true"</code>.<br>
				 * If no priority is given, the default configuration of {@link sap.ui.mdc.table.ResponsiveTableType#getShowDetailsButton} is
				 * used.<br> If this property is changed after the <code>Table</code> has been initialized, the new changes take effect only when the
				 * Show / Hide Details button is pressed a second time.
				 *
				 * @since 1.86
				 */
				detailsButtonSetting: {
					type: "sap.ui.core.Priority[]",
					group: "Behavior"
				},
				/**
				 * Defines the layout in which the table pop-in rows are rendered.
				 *
				 * @since 1.96
				 */
				popinLayout: {
					type: "sap.m.PopinLayout",
					group: "Appearance",
					defaultValue: "Block"
				}
			}
		}
	});

	ResponsiveTableType.prototype.setDetailsButtonSetting = function(aPriorities) {
		return this.setProperty("detailsButtonSetting", aPriorities, true);
	};

	ResponsiveTableType.prototype.updateTableByProperty = function(sProperty, vValue) {
		var oResponsiveTable = this.getInnerTable();

		if (!oResponsiveTable) {
			return;
		}

		if (sProperty === "growingMode") {
			oResponsiveTable.setGrowingScrollToLoad(vValue === GrowingMode.Scroll);
			oResponsiveTable.setGrowing(vValue !== GrowingMode.None);
		} else if (sProperty === "showDetailsButton") {
			this._updateShowDetailsButton(oResponsiveTable, vValue);
		} else if (sProperty === "popinLayout") {
			oResponsiveTable.setPopinLayout(vValue);
		}
	};

	ResponsiveTableType.prototype._updateShowDetailsButton = function(oTable, bValue) {
		// avoid execution of the if and else if block if bValue has not changed
		if (bValue && !this._oShowDetailsButton) {
			oTable.getHeaderToolbar().insertEnd(this._getShowDetailsButton(), 0);
			oTable.attachEvent("popinChanged", this._onPopinChanged, this);
			oTable.setHiddenInPopin(this._getImportanceToHide());
		} else if (!bValue && this._oShowDetailsButton) {
			oTable.detachEvent("popinChanged", this._onPopinChanged, this);
			oTable.getHeaderToolbar().removeEnd(this._oShowDetailsButton);
			oTable.setHiddenInPopin([]);
			this._oShowDetailsButton.destroy();
			delete this._oShowDetailsButton;
		}
	};

	ResponsiveTableType.prototype.loadModules = function() {
		if (!InnerTable) {
			return new Promise(function(resolve, reject) {
				sap.ui.require([
					"sap/m/Table", "sap/m/Column", "sap/m/ColumnListItem"
				], function(ResponsiveTable, ResponsiveColumn, ColumnListItem) {
					InnerTable = ResponsiveTable;
					InnerColumn = ResponsiveColumn;
					InnerRow = ColumnListItem;
					resolve();
				}, function() {
					reject("Failed to load some modules");
				});
			});
		} else {
			return Promise.resolve();
		}
	};

	ResponsiveTableType.prototype.createTable = function(sId) {
		var oTable = this.getTable();

		if (!oTable || !InnerTable) {
			return null;
		}

		var oResponsiveTable = new InnerTable(sId, this.getTableSettings());

		oResponsiveTable.bActiveHeaders = true;
		oResponsiveTable.attachEvent("columnPress", this._onColumnPress, this);

		return oResponsiveTable;
	};

	ResponsiveTableType.prototype.getTableSettings = function() {
		var oTable = this.getTable();

		return Object.assign({}, TableTypeBase.prototype.getTableSettings.apply(this, arguments), {
			autoPopinMode: true,
			contextualWidth: "Auto",
			growing: true,
			sticky: ["ColumnHeaders", "HeaderToolbar", "InfoToolbar"],
			itemPress: [this._onItemPress, this],
			selectionChange: [this._onSelectionChange, this],
			growingThreshold: this.getThreshold(),
			noData: oTable._getNoDataText(),
			headerToolbar: oTable._oToolbar,
			ariaLabelledBy: [oTable._oTitle],
			mode: this._getSelectionMode(),
			multiSelectMode: this._getMultiSelectMode()
		});
	};

	ResponsiveTableType.prototype._onItemPress = function(oEvent) {
		this.callHook("RowPress", this.getTable(), {
			bindingContext: oEvent.getParameter("listItem").getBindingContext()
		});
		this._onRowActionPress(oEvent);
	};

	ResponsiveTableType.prototype._onSelectionChange = function(oEvent) {
		var oTable = this.getTable();
		var bSelectAll = oEvent.getParameter("selectAll");

		if (bSelectAll) {
			var oBinding = this.getRowBinding();

			if (!oBinding) {
				return;
			}
		}

		this.callHook("SelectionChange", oTable, {
			bindingContext: oEvent.getParameter("listItem").getBindingContext(),
			selected: oEvent.getParameter("selected"),
			selectAll: bSelectAll
		});
	};

	ResponsiveTableType.prototype._onColumnPress = function(oEvent) {
		var oTable = this.getTable();
		var oResponsiveTable = this.getInnerTable();

		this.callHook("ColumnPress", oTable, {
			column: oTable.getColumns()[oResponsiveTable.indexOfColumn(oEvent.getParameter("column"))]
		});
	};

	ResponsiveTableType.createColumn = function(sId, mSettings) {
		return new InnerColumn(sId, mSettings);
	};

	ResponsiveTableType.prototype.createRowTemplate = function(sId) {
		return new InnerRow(sId, this.getRowSettingsConfig());
	};

	ResponsiveTableType.prototype._getSelectionMode = function() {
		var oTable = this.getTable();
		var sSelectionMode = oTable ? oTable.getSelectionMode() : undefined;
		var mSelectionModeMap = {
			Single: "SingleSelectLeft",
			SingleMaster: "SingleSelectMaster",
			Multi: "MultiSelect",
			None: "None",
			undefined: "None"
		};

		return mSelectionModeMap[sSelectionMode];
	};

	ResponsiveTableType.prototype._getMultiSelectMode = function() {
		var oTable = this.getTable();
		var sMultiSelectMode = oTable ? oTable.getMultiSelectMode() : undefined;
		var mMultiSelectModeMap = {
			Default: "SelectAll",
			ClearAll: "ClearAll"
		};
		return mMultiSelectModeMap[sMultiSelectMode];
	};

	ResponsiveTableType.prototype.updateSelectionSettings = function() {
		var oTable = this.getTable();
		var oResponsiveTable = this.getInnerTable();

		if (!oTable || !oResponsiveTable) {
			return;
		}

		oResponsiveTable.setMode(this._getSelectionMode());
		oResponsiveTable.setMultiSelectMode(this._getMultiSelectMode());
	};

	ResponsiveTableType.prototype.updateRowSettings = function() {
		var oTable = this.getTable();

		if (!oTable || !oTable._oRowTemplate) {
			return;
		}

		// Remove all bindings, as applySettings doesn't do it
		oTable._oRowTemplate.unbindProperty("navigated");
		oTable._oRowTemplate.unbindProperty("highlight");
		oTable._oRowTemplate.unbindProperty("highlightText");

		oTable._oRowTemplate.applySettings(this.getRowSettingsConfig());
		this.updateRowActions();
	};

	ResponsiveTableType.prototype.updateRowActions = function() {
		var oTable = this.getTable();
		var oRowActionsInfo = this.getRowActionsConfig();
		var sType = oTable.hasListeners("rowPress") ? "Active" : "Inactive";

		oTable._oRowTemplate.unbindProperty("type");

		if (!oTable.getRowSettings()) {
			oTable._oRowTemplate.setType(sType);
			return;
		}

		var vRowType, bVisibleBound, fnVisibleFormatter;
		// If templateInfo is given, the rowActions are bound
		if ("templateInfo" in oRowActionsInfo) {
			var oTemplateInfo = oRowActionsInfo.templateInfo;

			fnVisibleFormatter = oTemplateInfo.visible.formatter;
			// If visible property is of type object, we know for certain the property is bound (see RowSettings.getAllActions)
			bVisibleBound = typeof oTemplateInfo.visible == "object";
			vRowType = oTemplateInfo.visible;
		} else if (oRowActionsInfo && oRowActionsInfo.items) {
			var _oRowActionItem;
			if (oRowActionsInfo.items.length == 0) {
				oTable._oRowTemplate.setType(sType);
				return;
			}

			// Check if rowActions are of type Navigation. ResponsiveTable currently only supports RowActionItem<Navigation>
			_oRowActionItem = oRowActionsInfo.items.find(function(oRowAction) {
				return oRowAction.getType() == "Navigation";
			});
			if (!_oRowActionItem && oRowActionsInfo.items.length > 0) {
				throw new Error("No RowAction of type 'Navigation' found. sap.m.Table only accepts RowAction of type 'Navigation'.");
			}

			// Associate RowActionItem<Navigation> to template for reference
			oTable._oRowTemplate.data("rowAction", _oRowActionItem);

			// Check if visible property is bound
			bVisibleBound = _oRowActionItem.isBound("visible");
			// Based on whether visible property is bound, either get binding info or the actual property
			vRowType = bVisibleBound ? _oRowActionItem.getBindingInfo("visible") : _oRowActionItem.getVisible();
			fnVisibleFormatter = vRowType.formatter;
		}

		// If a custom formatter exists, apply it before converting it to row type, otherwise just convert
		if (fnVisibleFormatter) {
			vRowType.formatter = function(sValue) {
				var bVisible = fnVisibleFormatter(sValue);
				return bVisible ? RowAction.Navigation : sType;
			};
		} else {
			vRowType = vRowType ? RowAction.Navigation : sType;
		}

		// Depending on whether the property is bound, either bind or set
		if (bVisibleBound) {
			oTable._oRowTemplate.bindProperty("type", vRowType);
		} else {
			oTable._oRowTemplate.setProperty("type", vRowType);
		}
	};

	ResponsiveTableType.prototype.enableColumnResize = function() {
		var oTable = this.getTable();
		var oResponsiveTable = this.getInnerTable();

		if (!oTable || !oResponsiveTable) {
			return;
		}

		var oColumnResizer = ColumnResizer.getPlugin(oResponsiveTable);

		oResponsiveTable.setFixedLayout("Strict");

		if (!oColumnResizer) {
			oColumnResizer = new ColumnResizer();
			oResponsiveTable.addDependent(oColumnResizer);
			oColumnResizer.attachColumnResize(this._onColumnResize, this);
		} else {
			oColumnResizer.setEnabled(true);
			oColumnResizer.detachColumnResize(this._onColumnResize, this);
			oColumnResizer.attachColumnResize(this._onColumnResize, this);
		}
	};

	ResponsiveTableType.prototype.disableColumnResize = function() {
		var oTable = this.getTable();
		var oResponsiveTable = this.getInnerTable();

		if (!oTable || !oResponsiveTable) {
			return;
		}

		var oColumnResizer = ColumnResizer.getPlugin(oResponsiveTable);

		if (oColumnResizer) {
			oColumnResizer.setEnabled(false);
			oColumnResizer.detachColumnResize(this._onColumnResize, this);
		}
	};

	ResponsiveTableType.prototype._onColumnResize = function(oEvent) {
		var oTable = this.getTable();
		var oResponsiveTable = this.getInnerTable();
		var oResponsiveTableColumn = oEvent.getParameter("column");
		var sWidth = oEvent.getParameter("width");
		var iIndex = oResponsiveTable.indexOfColumn(oResponsiveTableColumn);
		var oColumn = oTable.getColumns()[iIndex];

		this.callHook("ColumnResize", oTable, {
			column: oColumn,
			width: sWidth
		});
	};

	ResponsiveTableType.prototype.createColumnResizeMenuItem = function(oColumn, oColumnMenu) {
		var oColumnResizer = ColumnResizer.getPlugin(this.getInnerTable());

		if (!oColumnResizer) {
			return;
		}

		if (oColumnMenu.isA("sap.m.table.columnmenu.Menu")) {
			return oColumnResizer.getColumnResizeQuickAction(oColumn.getInnerColumn(), oColumnMenu);
		} else {
			return oColumnResizer.getColumnResizeButton(oColumn.getInnerColumn());
		}
	};

	/**
	 * Toggles the visibility of the Show Details button.<br>
	 * If {@param bValue} is set to <code>true</code>, it sets the <code>hiddenInPopin</code> property on the inner <code>ResponsiveTable</code> to
	 * hide columns based on the <code>Table</code> configuration (<code>showDetailsButton</code> and <code>detailsButtonSetting</code> properties).
	 * Otherwise an empty array is set to show all columns.
	 *
	 * @param {boolean} bValue - Whether to hide details and display the Show Details button
	 * @private
	 */
	ResponsiveTableType.prototype._toggleShowDetails = function(bValue) {
		if (!this._oShowDetailsButton || (bValue === this.bHideDetails)) {
			return;
		}

		var oResponsiveTable = this.getInnerTable();
		this.bHideDetails = bValue;

		if (this.bHideDetails) {
			oResponsiveTable.setHiddenInPopin(this._getImportanceToHide());
		} else {
			oResponsiveTable.setHiddenInPopin([]);
		}
	};

	ResponsiveTableType.prototype._getShowDetailsButton = function() {
		if (!this._oShowDetailsButton) {
			var oRb = Core.getLibraryResourceBundle("sap.ui.mdc");
			this.bHideDetails = true;
			this._oShowDetailsButton = new SegmentedButton(this.getTable().getId() + "-showHideDetails", {
				visible: false,
				selectedKey: "hideDetails",
				items: [
					new SegmentedButtonItem({
						icon: "sap-icon://detail-more",
						key: "showDetails",
						tooltip: oRb.getText("table.SHOWDETAILS_TEXT"),
						press: [
							function() {
								this._toggleShowDetails(false);
							}, this
						]
					}),
					new SegmentedButtonItem({
						icon: "sap-icon://detail-less",
						key: "hideDetails",
						tooltip: oRb.getText("table.HIDEDETAILS_TEXT"),
						press: [
							function() {
								this._toggleShowDetails(true);
							}, this
						]
					})
				]
			});
		}
		return this._oShowDetailsButton;
	};

	/**
	 * Helper function to get the importance of the columns to be hidden based on <code>Table</code> configuration.
	 *
	 * @returns {array} sap.ui.core.Priority[] Array of column priorities
	 * @private
	 */
	ResponsiveTableType.prototype._getImportanceToHide = function() {
		var aDetailsButtonSetting = this.getDetailsButtonSetting() || [];

		if (aDetailsButtonSetting.length) {
			return aDetailsButtonSetting;
		} else {
			return Device.system.phone ? ["Low", "Medium"] : ["Low"];
		}
	};

	/**
	 * Event handler called when the table pop-in has changed.
	 *
	 * @param {sap.ui.base.Event} oEvent - Event object
	 * @private
	 */
	ResponsiveTableType.prototype._onPopinChanged = function(oEvent) {
		var bHasPopin = oEvent.getParameter("hasPopin");
		var aHiddenInPopin = oEvent.getParameter("hiddenInPopin");
		var aVisibleItemsLength = oEvent.getSource().getVisibleItems().length;

		if (aVisibleItemsLength && (aHiddenInPopin.length || (bHasPopin && !this.bHideDetails))) {
			this._oShowDetailsButton.setVisible(true);
		} else {
			this._oShowDetailsButton.setVisible(false);
		}
	};

	ResponsiveTableType.prototype._onRowActionPress = function(oEvent) {
		var oTable = this.getTable();
		var oInnerRow = oEvent.getParameter("listItem");

		if (oInnerRow.getType() !== "Navigation") {
			return;
		}

		var oRowSettings = oTable.getRowSettings();
		var oRowActionsInfo = oRowSettings.getAllActions();

		if (oRowSettings.isBound("rowActions")) {
			var sActionModel = oRowActionsInfo.items.model;
			if (!this._oRowActionItem) {
				this._oRowActionItem = oRowActionsInfo.items.template.clone();
			}

			// Set model for row settings, as it is not propagated
			this._oRowActionItem.setModel(oTable.getModel(sActionModel), sActionModel);
			oRowSettings.addDependent(this._oRowActionItem);
		} else {
			this._oRowActionItem = oInnerRow.data("rowAction");
		}

		// Binding Context cannot be determined for ResponsiveTable, which is why we always assume to have a RowActionItem<Navigation> no matter what
		this._oRowActionItem.setType("Navigation");
		this.callHook("Press", this._oRowActionItem, {
			bindingContext: oInnerRow.getBindingContext()
		});
	};

	ResponsiveTableType.prototype.removeToolbar = function() {
		var oResponsiveTable = this.getInnerTable();

		if (oResponsiveTable) {
			oResponsiveTable.setHeaderToolbar();
		}
	};

	ResponsiveTableType.prototype.scrollToIndex = function(iIndex) {
		var oResponsiveTable = this.getInnerTable();

		if (oResponsiveTable) {
			return oResponsiveTable.scrollToIndex(iIndex);
		} else {
			return Promise.reject();
		}
	};

	ResponsiveTableType.prototype.getRowBinding = function() {
		var oResponsiveTable = this.getInnerTable();
		return oResponsiveTable ? oResponsiveTable.getBinding("items") : undefined;
	};

	ResponsiveTableType.prototype.bindRows = function(oBindingInfo) {
		var oResponsiveTable = this.getInnerTable();

		if (oResponsiveTable) {
			oResponsiveTable.bindItems(oBindingInfo);
		}
	};

	ResponsiveTableType.prototype.isTableBound = function() {
		var oResponsiveTable = this.getInnerTable();

		if (oResponsiveTable) {
			return oResponsiveTable.isBound("items");
		} else {
			return false;
		}
	};

	ResponsiveTableType.prototype.insertFilterInfoBar = function(oFilterInfoBar, sAriaLabelId) {
		var oResponsiveTable = this.getInnerTable();

		if (oResponsiveTable) {
			oResponsiveTable.setInfoToolbar(oFilterInfoBar);

			if (!oResponsiveTable.getAriaLabelledBy().includes(sAriaLabelId)) {
				oResponsiveTable.addAriaLabelledBy(sAriaLabelId);
			}
		}
	};

	ResponsiveTableType.prototype.updateSortIndicator = function(oColumn, sSortOrder) {
		oColumn.getInnerColumn().setSortIndicator(sSortOrder);
	};

	ResponsiveTableType.prototype.getSelectedContexts = function() {
		var oResponsiveTable = this.getInnerTable();

		if (!oResponsiveTable) {
			return [];
		}

		return oResponsiveTable.getSelectedContexts();
	};

	ResponsiveTableType.prototype.clearSelection = function() {
		var oResponsiveTable = this.getInnerTable();

		if (oResponsiveTable) {
			oResponsiveTable.removeSelections(true);
		}
	};

	return ResponsiveTableType;
});
