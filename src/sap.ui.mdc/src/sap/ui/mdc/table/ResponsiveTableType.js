/*!
 * ${copyright}
 */

sap.ui.define([
	"./TableTypeBase",
	"./utils/Personalization",
	"sap/m/Button",
	"sap/m/plugins/ColumnResizer",
	"sap/m/SegmentedButton",
	"sap/m/SegmentedButtonItem",
	"sap/ui/Device",
	"sap/ui/core/Element",
	"sap/ui/core/Lib",
	"sap/ui/mdc/enums/TableGrowingMode",
	"sap/ui/mdc/enums/TableRowActionType"
], (
	TableTypeBase,
	PersonalizationUtils,
	Button,
	ColumnResizer,
	SegmentedButton,
	SegmentedButtonItem,
	Device,
	Element,
	Library,
	GrowingMode,
	RowActionType
) => {
	"use strict";

	let InnerTable, InnerColumn, InnerRow;

	/**
	 * Constructor for a new <code>ResponsiveTableType</code>.
	 *
	 * @param {string} [sId] Optional ID for the new object; generated automatically if no non-empty ID is given
	 * @param {object} [mSettings] Initial settings for the new object
	 * @class The table type info class for the metadata-driven table.
	 * @extends sap.ui.mdc.table.TableTypeBase
	 * @author SAP SE
	 * @public
	 * @since 1.65
	 * @alias sap.ui.mdc.table.ResponsiveTableType
	 */
	const ResponsiveTableType = TableTypeBase.extend("sap.ui.mdc.table.ResponsiveTableType", {
		metadata: {
			library: "sap.ui.mdc",
			properties: {
				/**
				 * Specifies the growing mode.
				 */
				growingMode: {
					type: "sap.ui.mdc.enums.TableGrowingMode",
					group: "Behavior",
					defaultValue: GrowingMode.Basic
				},
				/**
				 * Specifies whether the Show / Hide Details button is shown.
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
					group: "Behavior",
					defaultValue: false
				},
				/**
				 * Defines which columns are hidden instead of moved into the pop-in area depending on their importance.
				 * See {@link sap.ui.mdc.table.ResponsiveColumnSettings#getImportance} for more details.
				 *
				 * <b>Note:</b> To hide columns based on their importance, it's mandatory to set <code>showDetailsButton</code> to
				 * <code>true</code>.<br>
				 * If no importance is given, a device-dependent default configuration is used.<br>
				 * If this property is changed after the table has been initialized, the new changes take effect only when the Show / Hide Details
				 * button is pressed a second time.
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

	ResponsiveTableType.prototype.setParent = function() {
		TableTypeBase.prototype.setParent.apply(this, arguments);
		this._oShowDetailsButton?.destroy();
		delete this._oShowDetailsButton;
		return this;
	};

	ResponsiveTableType.prototype.updateTableByProperty = function(sProperty, vValue) {
		const oResponsiveTable = this.getInnerTable();

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

	ResponsiveTableType.prototype._updateShowDetailsButton = function(oResponsiveTable, bValue) {
		// avoid execution of the if and else if block if bValue has not changed
		if (bValue && !this._oShowDetailsButton) {
			oResponsiveTable.getHeaderToolbar().insertEnd(this._getShowDetailsButton(), 0);
			oResponsiveTable.attachEvent("popinChanged", this._onPopinChanged, this);
			oResponsiveTable.setHiddenInPopin(this._getImportanceToHide());
		} else if (!bValue && this._oShowDetailsButton) {
			oResponsiveTable.detachEvent("popinChanged", this._onPopinChanged, this);
			oResponsiveTable.getHeaderToolbar().removeEnd(this._oShowDetailsButton);
			oResponsiveTable.setHiddenInPopin([]);
			this._oShowDetailsButton.destroy();
			delete this._oShowDetailsButton;
		}
	};

	ResponsiveTableType.prototype.loadModules = function() {
		if (!InnerTable) {
			return new Promise((resolve, reject) => {
				sap.ui.require([
					"sap/m/Table", "sap/m/Column", "sap/m/ColumnListItem"
				], (ResponsiveTable, ResponsiveColumn, ColumnListItem) => {
					InnerTable = ResponsiveTable;
					InnerColumn = ResponsiveColumn;
					InnerRow = ColumnListItem;
					resolve();
				}, () => {
					reject("Failed to load some modules");
				});
			});
		} else {
			return Promise.resolve();
		}
	};

	ResponsiveTableType.prototype.createTable = function(sId) {
		const oTable = this.getTable();

		if (!oTable || !InnerTable) {
			return null;
		}

		return new InnerTable(sId, this.getTableSettings());
	};

	ResponsiveTableType.prototype.getTableSettings = function() {
		const oTable = this.getTable();

		const mSettings = {
			autoPopinMode: true,
			contextualWidth: "Auto",
			growing: true,
			sticky: ["ColumnHeaders", "HeaderToolbar", "InfoToolbar"],
			growingThreshold: {
				path: "$sap.ui.mdc.Table>/threshold",
				formatter: function(iThreshold) {
					return iThreshold > -1 ? iThreshold : undefined;
				}
			},
			noData: oTable._getNoDataText(),
			headerToolbar: oTable._oToolbar,
			ariaLabelledBy: [oTable._oTitle]
		};

		if (oTable.hasListeners("rowPress")) {
			mSettings.itemPress = [this._onItemPress, this];
		}

		return  Object.assign({}, TableTypeBase.prototype.getTableSettings.apply(this, arguments), mSettings);
	};

	ResponsiveTableType.prototype._onItemPress = function(oEvent) {
		this.callHook("RowPress", this.getTable(), {
			bindingContext: oEvent.getParameter("listItem").getBindingContext(this.getInnerTable().getBindingInfo("items").model)
		});
		this._onRowActionPress(oEvent);
	};

	ResponsiveTableType.createColumn = function(sId, mSettings) {
		return new InnerColumn(sId, mSettings);
	};

	ResponsiveTableType.prototype.createRowTemplate = function(sId) {
		return new InnerRow(sId, this.getRowSettingsConfig());
	};

	ResponsiveTableType.prototype.prepareRowPress = function() {
		if (this._attachItemPress()) {
			this.updateRowActions();
		}
	};

	ResponsiveTableType.prototype.cleanupRowPress = function() {
		if (this._detachItemPress()) {
			this.updateRowActions();
		}
	};

	ResponsiveTableType.prototype.updateRowSettings = function() {
		const oTable = this.getTable();

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
		const oTable = this.getTable();
		const oRowActionsInfo = this.getRowActionsConfig();
		const sType = oTable.hasListeners("rowPress") ? "Active" : "Inactive";

		oTable._oRowTemplate.unbindProperty("type");

		if (!oTable.getRowSettings()) {
			oTable._oRowTemplate.setType(sType);
			return;
		}

		if (sType === "Inactive") {
			// Cleans up itemPress event, if it was attached previously
			this._detachItemPress();
		}

		let vRowType, bVisibleBound, fnVisibleFormatter;
		// If templateInfo is given, the rowActions are bound
		if ("templateInfo" in oRowActionsInfo) {
			const oTemplateInfo = oRowActionsInfo.templateInfo;

			fnVisibleFormatter = oTemplateInfo.visible.formatter;
			// If visible property is of type object, we know for certain the property is bound (see RowSettings.getAllActions)
			bVisibleBound = typeof oTemplateInfo.visible == "object";
			vRowType = oTemplateInfo.visible;
		} else if (oRowActionsInfo && oRowActionsInfo.items) {
			if (oRowActionsInfo.items.length == 0) {
				oTable._oRowTemplate.setType(sType);
				return;
			}

			// Check if rowActions are of type Navigation. ResponsiveTable currently only supports RowActionItem<Navigation>
			const _oRowActionItem = oRowActionsInfo.items.find((oRowAction) => {
				return oRowAction.getType() == "Navigation";
			});
			if (!_oRowActionItem && oRowActionsInfo.items.length > 0) {
				throw new Error("No row action of type 'Navigation' found. ResponsiveTableType only accepts row actions of type 'Navigation'.");
			}

			// Associate RowActionItem<Navigation> to template for reference
			oTable._oRowTemplate.data("rowAction", _oRowActionItem);

			// Check if visible property is bound
			bVisibleBound = _oRowActionItem.isBound("visible");
			// Based on whether visible property is bound, either get binding info or the actual property
			vRowType = bVisibleBound ? Object.assign({}, _oRowActionItem.getBindingInfo("visible")) : _oRowActionItem.getVisible();
			fnVisibleFormatter = vRowType.formatter;
		}

		if (bVisibleBound) {
			vRowType.formatter = (sValue) => {
				const vVisible = fnVisibleFormatter ? fnVisibleFormatter(sValue) : sValue;
				const vRowType =  vVisible === true ? RowActionType.Navigation : sType;
				if (vRowType === RowActionType.Navigation) {
					this._attachItemPress();
				}
				return vRowType;
			};
			oTable._oRowTemplate.bindProperty("type", vRowType);
		} else {
			vRowType = vRowType ? RowActionType.Navigation : sType;
			oTable._oRowTemplate.setProperty("type", vRowType);
			if (vRowType === RowActionType.Navigation) {
				this._attachItemPress();
			}
		}
	};

	ResponsiveTableType.prototype.enableColumnResize = function() {
		const oTable = this.getTable();
		const oResponsiveTable = this.getInnerTable();

		if (!oTable || !oResponsiveTable) {
			return;
		}

		let oColumnResizer = ColumnResizer.findOn(oResponsiveTable);

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
		const oTable = this.getTable();
		const oResponsiveTable = this.getInnerTable();

		if (!oTable || !oResponsiveTable) {
			return;
		}

		const oColumnResizer = ColumnResizer.findOn(oResponsiveTable);

		if (oColumnResizer) {
			oColumnResizer.setEnabled(false);
			oColumnResizer.detachColumnResize(this._onColumnResize, this);
		}
	};

	ResponsiveTableType.prototype._onColumnResize = function(oEvent) {
		const oTable = this.getTable();
		const oResponsiveTable = this.getInnerTable();
		const oResponsiveTableColumn = oEvent.getParameter("column");
		const sWidth = oEvent.getParameter("width");
		const iIndex = oResponsiveTable.indexOfColumn(oResponsiveTableColumn);
		const oColumn = oTable.getColumns()[iIndex];

		this.callHook("ColumnResize", oTable, {
			column: oColumn,
			width: sWidth
		});
	};

	ResponsiveTableType.prototype.createColumnResizeMenuItem = function(oColumn, oColumnMenu) {
		const oColumnResizer = ColumnResizer.findOn(this.getInnerTable());

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
	 * Tries to attach the itemPress event to the inner table. If a listener is already attached, this function does nothing.
	 *
	 * @returns whether event was attached or not
	 * @private
	 */
	ResponsiveTableType.prototype._attachItemPress = function() {
		const oResponsiveTable = this.getInnerTable();
		if (oResponsiveTable && !oResponsiveTable.hasListeners("itemPress")) {
			oResponsiveTable.attachEvent("itemPress", this._onItemPress, this);
			return true;
		}
		return false;
	};

	/**
	 * Tries to detach the itemPress listener on the inner table. If there is no listener, this function does nothing.
	 *
	 * @returns whether event was detached or not
	 * @private
	 */
	ResponsiveTableType.prototype._detachItemPress = function() {
		const oTable = this.getTable();
		const oResponsiveTable = this.getInnerTable();
		if (!oTable.hasListeners("rowPress") && oResponsiveTable) {
			oResponsiveTable.detachEvent("itemPress", this._onItemPress, this);
			return true;
		}
		return false;
	};

	/**
	 * Toggles the visibility of the Show Details button.<br>
	 * If <code>bValue</code> is set to <code>true</code>, it sets the <code>hiddenInPopin</code> property on the inner <code>ResponsiveTable</code> to
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

		const oResponsiveTable = this.getInnerTable();
		this.bHideDetails = bValue;

		if (this.bHideDetails) {
			oResponsiveTable.setHiddenInPopin(this._getImportanceToHide());
			this._oShowDetailsButton.setSelectedKey("hideDetails");
		} else {
			oResponsiveTable.setHiddenInPopin();
			this._oShowDetailsButton.setSelectedKey("showDetails");
		}
	};

	ResponsiveTableType.prototype._getShowDetailsButton = function() {
		if (!this._oShowDetailsButton) {
			const oRb = Library.getResourceBundleFor("sap.ui.mdc");
			const sId = this.getTable().getId();
			this.bHideDetails = true;
			this._oShowDetailsButton = new SegmentedButton(sId + "-showHideDetails", {
				visible: false,
				selectedKey: "hideDetails",
				items: [
					new SegmentedButtonItem({
						id: sId + "-showDetails",
						icon: "sap-icon://detail-more",
						key: "showDetails",
						tooltip: oRb.getText("table.SHOWDETAILS_TEXT"),
						press: [
							function() {
								this._toggleShowDetails(false);
							}, this
						]
					}), new SegmentedButtonItem({
						id: sId + "-hideDetails",
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

	ResponsiveTableType.prototype.getContextMenuParameters = function(oEvent) {
		const oListItem = oEvent.getParameter("listItem");
		const oInnerColumn = oEvent.getParameter("column");
		const oMDCColumn = oInnerColumn ? Element.getElementById(oInnerColumn.getId().replace(/\-innerColumn$/, "")) : undefined;

		return {
			bindingContext: oListItem.getBindingContext(this.getInnerTable().getBindingInfo("items").model),
			column: oMDCColumn
		};
	};

	/**
	 * Helper function to get the importance of the columns to be hidden based on <code>Table</code> configuration.
	 *
	 * @returns {sap.ui.core.Priority[]} Array of column priorities
	 * @private
	 */
	ResponsiveTableType.prototype._getImportanceToHide = function() {
		const aDetailsButtonSetting = this.getDetailsButtonSetting() || [];

		if (aDetailsButtonSetting.length > 0) {
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
		const bHasPopin = oEvent.getParameter("hasPopin");
		const aHiddenInPopin = oEvent.getParameter("hiddenInPopin");
		const aVisibleItemsLength = oEvent.getSource().getVisibleItems().length;

		if (aVisibleItemsLength && (aHiddenInPopin.length || (bHasPopin && !this.bHideDetails))) {
			this._oShowDetailsButton.setVisible(true);
		} else {
			this._oShowDetailsButton.setVisible(false);
		}
	};

	ResponsiveTableType.prototype._onRowActionPress = function(oEvent) {
		const oTable = this.getTable();
		const oInnerRow = oEvent.getParameter("listItem");

		if (oInnerRow.getType() !== "Navigation") {
			return;
		}

		const oRowSettings = oTable.getRowSettings();
		const oRowActionsInfo = oRowSettings.getAllActions();

		if (oRowSettings.isBound("rowActions")) {
			const sActionModel = oRowActionsInfo.items.model;
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
			bindingContext: oInnerRow.getBindingContext(this.getInnerTable().getBindingInfo("items").model)
		});
	};

	ResponsiveTableType.prototype.removeToolbar = function() {
		const oResponsiveTable = this.getInnerTable();

		if (oResponsiveTable) {
			oResponsiveTable.setHeaderToolbar();
		}
	};

	ResponsiveTableType.prototype.scrollToIndex = function(iIndex) {
		const oResponsiveTable = this.getInnerTable();

		if (oResponsiveTable) {
			return oResponsiveTable.scrollToIndex(iIndex);
		} else {
			return Promise.reject();
		}
	};

	ResponsiveTableType.prototype.getRowBinding = function() {
		const oResponsiveTable = this.getInnerTable();
		return oResponsiveTable ? oResponsiveTable.getBinding("items") : undefined;
	};

	ResponsiveTableType.prototype.bindRows = function(oBindingInfo) {
		const oResponsiveTable = this.getInnerTable();

		if (oResponsiveTable) {
			oResponsiveTable.bindItems(oBindingInfo);
		}
	};

	ResponsiveTableType.prototype.isTableBound = function() {
		const oResponsiveTable = this.getInnerTable();

		if (oResponsiveTable) {
			return oResponsiveTable.isBound("items");
		} else {
			return false;
		}
	};

	ResponsiveTableType.prototype.insertFilterInfoBar = function(oFilterInfoBar, sAriaLabelId) {
		const oResponsiveTable = this.getInnerTable();

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

	/**
	 * Called when column is inserted
	 * @param {object} oColumn - the mdc column instance.
	 *
	 * @private
	 */
	ResponsiveTableType.prototype._onColumnInsert = function(oColumn) {
		const oTable = this.getTable();
		const oResponsiveTable = this.getInnerTable();

		if (PersonalizationUtils.isUserPersonalizationActive(oTable) &&
			oResponsiveTable.getHiddenInPopin()?.includes(oColumn.getInnerColumn().getImportance()) &&
			(oTable.getColumns().pop() === oColumn)) {
			this._toggleShowDetails(false);
		}
	};

	ResponsiveTableType.prototype.exit = function() {
		TableTypeBase.prototype.exit.apply(this, arguments);
		this._oShowDetailsButton?.destroy();
		delete this._oShowDetailsButton;
	};

	return ResponsiveTableType;
});