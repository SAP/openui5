/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/core/Core", "./TableTypeBase", "../library", "sap/m/Button", "sap/ui/Device", "sap/m/plugins/ColumnResizer", "sap/m/SegmentedButton", "sap/m/SegmentedButtonItem"
], function(Core, TableTypeBase, library, Button, Device, ColumnResizer, SegmentedButton, SegmentedButtonItem) {
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
	 * MDC_PUBLIC_CANDIDATE
	 * @since 1.65
	 * @alias sap.ui.mdc.table.ResponsiveTableType
	 * @ui5-metamodel This element also will be described in the UI5 (legacy) designtime metamodel
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
				 * If no priority is given, the default configuration of {@link sap.ui.mdc.table.ResponsiveTableType#getShowDetailsButton} is used.<br>
				 * If this property is changed after the <code>Table</code> has been initialized, the new changes take effect only when the Show /
				 * Hide Details button is pressed a second time.
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
					type : "sap.m.PopinLayout",
					group : "Appearance",
					defaultValue : "Block"
				}
			}
		}
	});

	ResponsiveTableType.prototype.setDetailsButtonSetting = function(aPriorities) {
		this.setProperty("detailsButtonSetting", aPriorities, true);
		return this;
	};

	ResponsiveTableType.prototype.updateRelevantTableProperty = function(oTable, sProperty, vValue) {
		if (oTable && oTable.isA("sap.m.Table")) {
			if (sProperty === "growingMode") {
				oTable.setGrowingScrollToLoad(vValue === GrowingMode.Scroll);
				oTable.setGrowing(vValue !== GrowingMode.None);
			} else if (sProperty === "showDetailsButton") {
				this.updateShowDetailsButton(oTable, vValue);
			} else if (sProperty === "popinLayout") {
				oTable.setPopinLayout(vValue);
			}
		}
	};

	ResponsiveTableType.updateDefault = function(oTable) {
		if (oTable) {
			oTable.setGrowing(true);
			oTable.setGrowingScrollToLoad(false);
		}
	};

	ResponsiveTableType.prototype.updateShowDetailsButton = function(oTable, bValue) {
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

	/* Below APIs are used during table creation */

	ResponsiveTableType.loadTableModules = function() {
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

	ResponsiveTableType.createTable = function(sId, mSettings) {
		return new InnerTable(sId, mSettings);
	};

	ResponsiveTableType.createColumn = function(sId, mSettings) {
		return new InnerColumn(sId, mSettings);
	};

	ResponsiveTableType.createTemplate = function(sId, mSettings) {
		return new InnerRow(sId, mSettings);
	};

	ResponsiveTableType.updateSelection = function(oTable) {
		oTable._oTable.setMode(TableTypeBase.getSelectionMode(oTable));
	};

	ResponsiveTableType.updateMultiSelectMode = function(oTable) {
		oTable._oTable.setMultiSelectMode(oTable.getMultiSelectMode());
	};

	ResponsiveTableType.updateRowSettings = function(oTable, oRowSettings, fnRowActionPress) {
		// Remove all bindings, as applySettings doesn't do it
		var oRowTemplate = oTable._oTemplate;
		oRowTemplate.unbindProperty("navigated");
		oRowTemplate.unbindProperty("highlight");
		oRowTemplate.unbindProperty("highlightText");

		this.updateRowActions(oTable, oRowSettings, fnRowActionPress);
		var oSettings = oRowSettings.getAllSettings();
		oRowTemplate.applySettings(oSettings);
	};

	ResponsiveTableType.updateRowActions = function (oTable, oRowSettings) {
		oTable._oTemplate.unbindProperty("type");

		var sType = oTable.hasListeners("rowPress") ? "Active" : "Inactive";

		if (!oRowSettings) {
			oTable._oTemplate.setType(sType);
			return;
		}

		var vRowType, bVisibleBound, fnVisibleFormatter, oRowActionsInfo = oRowSettings.getAllActions();
		// If templateInfo is given, the rowActions are bound
		if ("templateInfo" in oRowActionsInfo) {
			var oTemplateInfo = oRowActionsInfo.templateInfo;

			fnVisibleFormatter = oTemplateInfo.visible.formatter;
			// If visible property is of type object, we know for certain the property is bound (see RowSettings.getAllActions)
			bVisibleBound = typeof oTemplateInfo.visible == "object";
			vRowType = oTemplateInfo.visible;
		} else if (oRowActionsInfo && oRowActionsInfo.items){
			var _oRowActionItem;
			if (oRowActionsInfo.items.length == 0) {
				oTable._oTemplate.setType(sType);
				return;
			}

			// Check if rowActions are of type Navigation. ResponsiveTable currently only supports RowActionItem<Navigation>
			_oRowActionItem = oRowActionsInfo.items.find(function (oRowAction) {
				return oRowAction.getType() == "Navigation";
			});
			if (!_oRowActionItem && oRowActionsInfo.items.length > 0) {
				throw new Error("No RowAction of type 'Navigation' found. sap.m.Table only accepts RowAction of type 'Navigation'.");
			}

			// Associate RowActionItem<Navigation> to template for reference
			oTable._oTemplate.data("rowAction", _oRowActionItem);

			// Check if visible property is bound
			bVisibleBound = _oRowActionItem.isBound("visible");
			// Based on whether visible property is bound, either get binding info or the actual property
			vRowType = bVisibleBound ? _oRowActionItem.getBindingInfo("visible") : _oRowActionItem.getVisible();
			fnVisibleFormatter = vRowType.formatter;
		}

		// If a custom formatter exists, apply it before converting it to row type, otherwise just convert
		if (fnVisibleFormatter) {
			vRowType.formatter = function (sValue) {
				var bVisible = fnVisibleFormatter(sValue);
				return bVisible ? RowAction.Navigation : sType;
			};
		} else {
			vRowType = vRowType ? RowAction.Navigation : sType;
		}

		// Depending on whether the property is bound, either bind or set
		if (bVisibleBound) {
			oTable._oTemplate.bindProperty("type", vRowType);
		} else {
			oTable._oTemplate.setProperty("type", vRowType);
		}
	};

	ResponsiveTableType.disableColumnResizer = function(oTable, oInnerTable) {
		var oColumnResize = ColumnResizer.getPlugin(oInnerTable);
		if (oColumnResize) {
			oColumnResize.setEnabled(false);
			oColumnResize.detachColumnResize(oTable._onColumnResize, oTable);
		}
	};

	ResponsiveTableType.enableColumnResizer = function(oTable, oInnerTable) {
		oInnerTable.setFixedLayout("Strict");
		var oColumnResize = ColumnResizer.getPlugin(oInnerTable);

		if (!oColumnResize) {
			var oColumnResizer = new ColumnResizer();
			oInnerTable.addDependent(oColumnResizer);
			oColumnResizer.attachColumnResize(oTable._onColumnResize, oTable);
		} else {
			oColumnResize.setEnabled(true);
			oColumnResize.detachColumnResize(oTable._onColumnResize, oTable);
			oColumnResize.attachColumnResize(oTable._onColumnResize, oTable);
		}
	};

	ResponsiveTableType.startColumnResize = function(oInnerTable, oColumn, oColumnMenu) {
		var oColumnResizer = ColumnResizer.getPlugin(oInnerTable);

		if (!oColumnResizer) {
			return;
		}

		if (oColumnMenu && oColumnMenu.isA("sap.m.table.columnmenu.Menu")) {
			return oColumnResizer.getColumnResizeQuickAction(oColumn, oColumnMenu);
		} else {
			return oColumnResizer.getColumnResizeButton(oColumn);
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

		var oTable = this.getRelevantTable();
		this.bHideDetails = bValue;

		if (this.bHideDetails) {
			oTable.setHiddenInPopin(this._getImportanceToHide());
		} else {
			oTable.setHiddenInPopin([]);
		}
	};

	ResponsiveTableType.prototype._getShowDetailsButton = function() {
		if (!this._oShowDetailsButton) {
			var oRb = Core.getLibraryResourceBundle("sap.ui.mdc");
			this.bHideDetails = true;
			var oTable = this.getRelevantTable();
			this._oShowDetailsButton = new SegmentedButton(oTable.getId() + "-showHideDetails", {
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

	ResponsiveTableType._onRowActionPress = function (oEvent) {
		var oInnerRow = oEvent.getParameter("listItem");
		var oContext = oInnerRow.getBindingContext();

		if (oInnerRow.getType() !== "Navigation") {
			return;
		}

		var oRowSettings = this.getRowSettings();
		var oRowActionsInfo = oRowSettings.getAllActions();

		if (this.getRowSettings().isBound("rowActions")) {
			var sActionModel = oRowActionsInfo.items.model;
			if (!this._oRowActionItem) {
				this._oRowActionItem = oRowActionsInfo.items.template.clone();
			}

			// Set model for row settings, as it is not propagated
			this._oRowActionItem.setModel(this.getModel(sActionModel), sActionModel);
			this.getRowSettings().addDependent(this._oRowActionItem);
		} else {
			this._oRowActionItem = oInnerRow.data("rowAction");
		}

		// Binding Context cannot be determined for ResponsiveTable, which is why we always assume to have a RowActionItem<Navigation> no matter what
		this._oRowActionItem.setType("Navigation");

		this._oRowActionItem.firePress({
			bindingContext: oContext
		});
	};

	return ResponsiveTableType;
});
