/*
 * ! ${copyright}
 */

sap.ui.define([
	"sap/ui/core/Core", "./TableTypeBase", "../library", "sap/m/Button", "sap/ui/Device"
], function(Core, TableTypeBase, library, Button, Device) {
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
				}
			}
		}
	});

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
			oTable.setHiddenInPopin(Device.system.phone ? ["Low", "Medium"] : ["Low"]);
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
	 * Set property 'hiddenInPopin' to ['Low'] on the ResponsiveTable
	 * if {@param bValue} is set to {true} to hide columns with 'Low' importance property.
	 * Otherwise an empty array is set to show all columns.
	 *
	 * @param {boolean} bValue - indicator to hide details of not
	 * @private
	 */
	ResponsiveTableType.prototype._toggleShowDetails = function(bValue) {
		if (!this._oShowDetailsButton || (bValue === this.bHideDetails)) {
			return;
		}

		var oTable = this.getRelevantTable();
		this.bHideDetails = bValue;
		this.bHideDetails ? oTable.setHiddenInPopin(["Low"]) : oTable.setHiddenInPopin([]);
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
	 * Event handler when the table pop-in has changed.
	 *
	 * @param {sap.ui.base.Event} oEvent - fired event object
	 * @private
	 */
	ResponsiveTableType.prototype._onPopinChanged = function(oEvent) {
		var bHasPopin = oEvent.getParameter("hasPopin");
		var aHiddenInPopin = oEvent.getParameter("hiddenInPopin");

		if (aHiddenInPopin.length || (bHasPopin && !this.bHideDetails)) {
			this._oShowDetailsButton.setVisible(true);
		} else {
			this._oShowDetailsButton.setVisible(false);
		}
	};

	return ResponsiveTableType;
});
