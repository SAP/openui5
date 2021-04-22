/*
 * ! ${copyright}
 */

sap.ui.define([
	"sap/ui/core/Core", "./TableTypeBase", "../library", "sap/m/Button", "sap/ui/Device", "sap/m/plugins/ColumnResizer"
], function(Core, TableTypeBase, library, Button, Device, ColumnResizer) {
	"use strict";

	var InnerTable, InnerColumn, InnerRow;
	var GrowingMode = library.GrowingMode;
	var RowAction = library.RowAction;

	/**
	 * Constructor for a new ResponsiveTableType.
	 *
	 * @param {string} [sId] ID for the new object, generated automatically if no ID is given
	 * @param {object} [mSettings] initial settings for the new object
	 * @class The table type info base class for the metadata driven table.
	 *        <h3><b>Note:</b></h3>
	 *        The control is experimental and the API/behaviour is not finalised and hence this should not be used for productive usage.
	 * @extends sap.ui.mdc.table.TableTypeBase
	 * @author SAP SE
	 * @constructor The API/behaviour is not finalised and hence this control should not be used for productive usage.
	 * @private
	 * @experimental
	 * @since 1.65
	 * @alias sap.ui.mdc.table.ResponsiveTableType
	 * @ui5-metamodel This element also will be described in the UI5 (legacy) designtime metamodel
	 */

	var ResponsiveTableType = TableTypeBase.extend("sap.ui.mdc.table.ResponsiveTableType", {
		metadata: {
			library: "sap.ui.mdc",
			properties: {
				/**
				 * See sap.ui.mdc.GrowingMode<br>
				 * Defaults to Basic --> meaning only growing is enabled on ResponsiveTable
				 */
				growingMode: {
					type: "sap.ui.mdc.GrowingMode",
					defaultValue: GrowingMode.Basic
				},
				/**
				 * Controls the visibility of the Show / Hide Details button for the <code>ResponsiveTable</code> scenario.
				 *
				 * If the available screen space gets too narrow, the columns configured with <code>High</code> and <code>Medium</code>
				 * importance move to the pop-in area while the columns with <code>Low</code> importance are hidden.
				 * On mobile phones, the columns with <code>Medium</code> importance are also hidden.
				 * As soon as the first column is hidden, this button appears in the table toolbar and gives the user
				 * the possibility to toggle the visibility of the hidden columns in the pop-in area.
				 *
				 * @since 1.79
				 */
				showDetailsButton: {
					type: "boolean",
					group: "Misc",
					defaultValue: false
				},
				/**
				 * Defines which columns should be hidden instead of moved into the pop-in area
				 * depending on their importance.
				 * See {@link sap.m.Column#getImportance} and {@link sap.m.Table#getHiddenInPopin} for more details.
				 *
				 * <b>Note:</b> To hide columns based on their importance, it's mandatory to set <code>showDetailsButton="true"</code>.
				 * If no priority is given, the default configuration of {@link sap.ui.mdc.table.ResponsiveTableType#getShowDetailsButton} is used.
				 * If this property is changed after the <code>MDCTable</code> has been initialized, the new changes take effect only when the
				 * Show / Hide Details button is pressed a second time.
				 *
				 * @since 1.86
				 */
				detailsButtonSetting: {
					type: "sap.ui.core.Priority[]",
					group: "Behavior"
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
			this._renderShowDetailsButton();
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

	ResponsiveTableType.updateNavigation = function(oTable) {
		oTable._oTemplate.setType(RowAction.Navigation);
	};

	ResponsiveTableType.updateRowAction = function(oTable, bNavigation) {
		var sType = oTable.hasListeners("rowPress") ? "Active" : "Inactive";
		oTable._oTemplate.setType(sType);
		if (bNavigation) {
			this.updateNavigation(oTable);
		}
	};

	ResponsiveTableType.updateRowSettings = function(oRowTemplate, oRowSettings) {
		// Remove all bindings, as applySettings doesn't do it
		oRowTemplate.unbindProperty("navigated");
		oRowTemplate.unbindProperty("highlight");
		oRowTemplate.unbindProperty("highlightText");

		oRowTemplate.applySettings(oRowSettings.getAllSettings());
	};

	ResponsiveTableType.disableColumnResizer = function(oInnerTable) {
		var oColumnResize = ColumnResizer.getPlugin(oInnerTable);
		if (oColumnResize) {
			oColumnResize.setEnabled(false);
		}
	};

	ResponsiveTableType.enableColumnResizer = function(oInnerTable) {
		oInnerTable.setFixedLayout("Strict");
		var oColumnResize = ColumnResizer.getPlugin(oInnerTable);

		if (!oColumnResize) {
			oInnerTable.addDependent(new ColumnResizer());
		} else {
			oColumnResize.setEnabled(true);
		}
	};

	ResponsiveTableType.startColumnResize = function(oInnerTable, oColumn) {
		ColumnResizer.getPlugin(oInnerTable).startResizing(oColumn.getDomRef());
	};

	/**
	 * Renders the look and feel of the Show / Hide Details button
	 *
	 * @private
	 */
	ResponsiveTableType.prototype._renderShowDetailsButton = function() {
		var oRb = Core.getLibraryResourceBundle("sap.ui.mdc"), sText;

		sText = this.bHideDetails ? oRb.getText("table.SHOWDETAILS_TEXT") : oRb.getText("table.HIDEDETAILS_TEXT");
		this._oShowDetailsButton.setTooltip(sText);
		this._oShowDetailsButton.setText(sText);
	};

	/**
	 * Set property 'hiddenInPopin' on the inner ResponsiveTable to hide columns based on MDCTable configuration
	 * of 'showDetailsButton' and 'detailsButtonSetting' if {@param bValue} is set to {true}.
	 * Otherwise an empty array is set to show all columns.
	 *
	 * @param {boolean} bValue - indicator to hide details or not
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
		this._renderShowDetailsButton();
	};

	ResponsiveTableType.prototype._getShowDetailsButton = function() {
		if (!this._oShowDetailsButton) {
			this.bHideDetails = true;
			this._oShowDetailsButton = new Button(this.getId() + "-showHideDetails", {
				visible: false,
				press: [function() {
					this._toggleShowDetails(!this.bHideDetails);
				}, this]
			});
		}
		return this._oShowDetailsButton;
	};

	/**
	 * Helper function to get the importance of the columns that should be hidden based on
	 * MDCTable configuration.
	 *
	 * @returns {array} sap.ui.core.Priority[]
	 * @private
	 */
	ResponsiveTableType.prototype._getImportanceToHide = function() {
		var aDetailsButtonSetting = this.getDetailsButtonSetting() || [];
		var aImportanceToHide = [];

		if (aDetailsButtonSetting.length) {
			aImportanceToHide = aDetailsButtonSetting;
		} else {
			aImportanceToHide = Device.system.phone ? ["Low", "Medium"] : ["Low"];
		}

		return aImportanceToHide;
	};

	/**
	 * Event handler when the table pop-in has changed.
	 *
	 * @param {sap.ui.base.Event} oEvent - fired event object
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

	return ResponsiveTableType;
});
