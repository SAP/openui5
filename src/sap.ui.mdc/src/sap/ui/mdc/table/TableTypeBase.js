/*!
 * ${copyright}
 */

sap.ui.define([
	"../library",
	"sap/ui/core/Element",
	"sap/ui/core/dnd/DragDropInfo"
], function(
	library,
	Element,
	DragDropInfo
) {
	"use strict";

	var P13nMode = library.TableP13nMode;

	/**
	 * Constructor for a new <code>TableTypeBase</code>.
	 *
	 * @param {string} [sId] Optional ID for the new object; generated automatically if no non-empty ID is given
	 * @param {object} [mSettings] Initial settings for the new object
	 * @class The table type info base class for the metadata-driven table. Base class with no implementation.
	 * @extends sap.ui.core.Element
	 * @author SAP SE
	 * @private
	 * @ui5-restricted sap.fe
	 * @MDC_PUBLIC_CANDIDATE
	 * @abstract
	 * @experimental
	 * @since 1.65
	 * @alias sap.ui.mdc.table.TableTypeBase
	 */
	var TableTypeBase = Element.extend("sap.ui.mdc.table.TableTypeBase", {
		metadata: {
			library: "sap.ui.mdc",
			properties: {}
		}
	});

	TableTypeBase.prototype.getSupportedP13nModes = function() {
		return Object.keys(P13nMode);
	};

	TableTypeBase.prototype.callHook = function(sHookName, oObject, mPropertyBag) {
		var sFunctionName = "_on" + sHookName;

		if (!oObject || !(oObject[sFunctionName] instanceof Function)) {
			throw new Error(this + ": Hook '" + sHookName + "' does not exist on " + oObject);
		}

		oObject[sFunctionName].call(oObject, mPropertyBag);
	};

	TableTypeBase.prototype.getTable = function() {
		var oTable = this.getParent();
		return oTable && oTable.isA("sap.ui.mdc.Table") ? oTable : null;
	};

	TableTypeBase.prototype.getInnerTable = function() {
		var oTable = this.getTable();
		return oTable ? oTable._oTable : null;
	};

	TableTypeBase.prototype.setProperty = function(sProperty, vValue) {
		Element.prototype.setProperty.apply(this, arguments);
		this.updateTableByProperty(sProperty, vValue);
		return this;
	};

	TableTypeBase.prototype.updateTable = function() {
		// TODO: With getAllProperties it iterates over all properties, also core properties.
		//  It would be better to configure the inner table correctly on table creation (#createTable) instead of configuring it (directly) afterwards
		for (var sProperty in this.getMetadata().getAllProperties()) {
			this.updateTableByProperty(sProperty, this.getProperty(sProperty));
		}
	};

	TableTypeBase.prototype.getTableSettings = function() {
		var oTable = this.getTable();

		if (!oTable) {
			return {};
		}

		var oDragDropInfo = new DragDropInfo({
			sourceAggregation: "columns",
			targetAggregation: "columns",
			dropPosition: "Between",
			enabled: oTable.getActiveP13nModes().includes(P13nMode.Column),
			drop: [this._onColumnMove, this]
		});
		oDragDropInfo.bIgnoreMetadataCheck = true;

		return {
			dragDropConfig: [oDragDropInfo],
			busyIndicatorDelay: oTable.getBusyIndicatorDelay(),
			paste: [this._onPaste, this]
		};
	};

	TableTypeBase.prototype.getThreshold = function() {
		var oTable = this.getTable();
		var iThreshold = oTable ? oTable.getThreshold() : -1;
		return iThreshold > -1 ? iThreshold : undefined;
	};

	TableTypeBase.prototype.getRowSettingsConfig = function() {
		var oTable = this.getTable();
		var oRowSettings = oTable ? oTable.getRowSettings() : null;
		return oRowSettings ? oRowSettings.getAllSettings() : null;
	};

	TableTypeBase.prototype.getRowActionsConfig = function() {
		var oTable = this.getTable();
		var oRowSettings = oTable ? oTable.getRowSettings() : null;
		return oRowSettings ? oRowSettings.getAllActions() : null;
	};

	TableTypeBase.prototype._onColumnMove = function(oEvent) {
		var oTable = this.getTable();
		var oInnerTable = this.getInnerTable();
		var oDraggedColumn = oEvent.getParameter("draggedControl");
		var oDroppedColumn = oEvent.getParameter("droppedControl");

		if (oDraggedColumn === oDroppedColumn) {
			return;
		}

		var sDropPosition = oEvent.getParameter("dropPosition");
		var iDraggedIndex = oInnerTable.indexOfColumn(oDraggedColumn);
		var iDroppedIndex = oInnerTable.indexOfColumn(oDroppedColumn);
		var iNewIndex = iDroppedIndex + (sDropPosition == "Before" ? 0 : 1) + (iDraggedIndex < iDroppedIndex ? -1 : 0);

		this.callHook("ColumnMove", oTable, {
			column: oTable.getColumns()[iDraggedIndex],
			newIndex: iNewIndex
		});
	};

	TableTypeBase.prototype._onPaste = function(oEvent) {
		this.callHook("Paste", this.getTable(), {
			data: oEvent.getParameter("data")
		});
	};

	// To be implemented in the subclass
	TableTypeBase.prototype.loadModules = function() {return Promise.reject();};
	TableTypeBase.prototype.updateTableByProperty = function(sProperty, vValue) {};
	TableTypeBase.prototype.removeToolbar = function() {};
	TableTypeBase.prototype.scrollToIndex = function(iIndex) {return Promise.reject();};
	TableTypeBase.prototype.updateRowSettings = function() {};
	TableTypeBase.prototype.createTable = function(sId) {};
	TableTypeBase.prototype.getRowBinding = function() {};
	TableTypeBase.prototype.bindRows = function(oBindingInfo) {};
	TableTypeBase.prototype.isTableBound = function() {};
	TableTypeBase.prototype.createRowTemplate = function(sId) {};
	TableTypeBase.prototype.updateSelectionSettings = function() {};
	TableTypeBase.prototype.insertFilterInfoBar = function(oFilterInfoBar, sAriaLabelId) {};
	TableTypeBase.prototype.enableColumnResize = function() {};
	TableTypeBase.prototype.disableColumnResize = function() {};
	TableTypeBase.prototype.createColumnResizeMenuItem = function() {};
	TableTypeBase.prototype.updateRowActions = function() {};
	TableTypeBase.prototype.updateSortIndicator = function(oColumn, sSortOrder) {};
	TableTypeBase.prototype.getSelectedContexts = function() {};
	TableTypeBase.prototype.clearSelection = function() {};

	return TableTypeBase;
});
