/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/core/Element",
	"sap/ui/core/dnd/DragDropInfo",
	"sap/ui/model/base/ManagedObjectModel",
	"sap/ui/mdc/enums/TableP13nMode",
	"sap/m/table/Util",
	"./utils/Personalization"
], (
	Element,
	DragDropInfo,
	ManagedObjectModel,
	TableP13nMode,
	MTableUtil,
	PersonalizationUtils
) => {
	"use strict";

	/**
	 * Constructor for a new <code>TableTypeBase</code>.
	 *
	 * @param {string} [sId] Optional ID for the new object; generated automatically if no non-empty ID is given
	 * @param {object} [mSettings] Initial settings for the new object
	 * @class The table type info base class for the metadata-driven table. Base class with no implementation.<br>
	 * @extends sap.ui.core.Element
	 * @author SAP SE
	 * @public
	 * @abstract
	 * @since 1.65
	 * @alias sap.ui.mdc.table.TableTypeBase
	 */
	const TableTypeBase = Element.extend("sap.ui.mdc.table.TableTypeBase", {
		metadata: {
			library: "sap.ui.mdc",
			"abstract": true,
			properties: {}
		}
	});

	TableTypeBase.prototype.init = function() {
		Element.prototype.init.apply(this, arguments);
		this._oManagedObjectModel = new ManagedObjectModel(this);

		// Map to cache cloned RowActionItems: Key = original RowActionItem, Value = clone
		this._mRowActionItemClones = new Map();
	};

	TableTypeBase.prototype.exit = function() {
		this._oManagedObjectModel.destroy();
		delete this._oManagedObjectModel;

		this._cleanupRowActionClones();
		delete this._mRowActionItemClones;
		Element.prototype.exit.apply(this, arguments);
	};

	TableTypeBase.prototype.setParent = function() {
		Element.prototype.setParent.apply(this, arguments);
		this.getTable()?.setModel(this._oManagedObjectModel, "$sap.ui.mdc.Table#type");
	};

	TableTypeBase.prototype.callHook = function(sHookName, oObject, mPropertyBag) {
		const sFunctionName = "_on" + sHookName;

		if (!oObject || !(oObject[sFunctionName] instanceof Function)) {
			throw new Error(this + ": Hook '" + sHookName + "' does not exist on " + oObject);
		}

		oObject[sFunctionName].call(oObject, mPropertyBag);
	};

	TableTypeBase.prototype.getTable = function() {
		const oTable = this.getParent();
		return oTable && oTable.isA("sap.ui.mdc.Table") ? oTable : null;
	};

	TableTypeBase.prototype.getInnerTable = function() {
		const oTable = this.getTable();
		return oTable ? oTable._oTable : null;
	};

	/**
	 * @inheritDoc
	 */
	TableTypeBase.prototype.setProperty = function(sProperty, vValue) {
		Element.prototype.setProperty.apply(this, arguments);
		this.updateTableByProperty(sProperty, vValue);
		return this;
	};

	TableTypeBase.prototype.updateTable = function() {
		// TODO: With getAllProperties it iterates over all properties, also core properties.
		//  It would be better to configure the inner table correctly on table creation (#createTable) instead of configuring it (directly) afterwards
		for (const sProperty in this.getMetadata().getAllProperties()) {
			this.updateTableByProperty(sProperty, this.getProperty(sProperty));
		}
	};

	TableTypeBase.prototype.getTableSettings = function() {
		const oTable = this.getTable();
		const oDragDropInfo = new DragDropInfo({
			sourceAggregation: "columns",
			targetAggregation: "columns",
			dropPosition: "Between",
			keyboardHandling: true,
			enabled: oTable.getActiveP13nModes().includes(TableP13nMode.Column),
			drop: [this._onColumnMove, this]
		});
		oDragDropInfo.bIgnoreMetadataCheck = true;

		return {
			id: oTable.getId() + "-innerTable",
			dragDropConfig: [oDragDropInfo],
			busyIndicatorDelay: "{$sap.ui.mdc.Table>/busyIndicatorDelay}",
			paste: [this._onPaste, this]
		};
	};

	TableTypeBase.prototype.getColumnSettings = function(oColumn) {
		const oTable = this.getTable();

		return {
			id: oColumn.getId() + "-innerColumn",
			width: {
				parts: [
					{path: "$sap.ui.mdc.table.Column>/width"},
					{path: "$sap.ui.mdc.table.Column>/@custom/calculatedWidth"},
					{path: "$sap.ui.mdc.table.Column>/@custom/p13nWidth"}
				],
				formatter: function(sWidth, sCalculatedWidth, sP13nWidth) {
					return sP13nWidth || sCalculatedWidth || sWidth;
				}
			},
			tooltip: {
				parts: [
					{path: "$sap.ui.mdc.table.Column>/tooltip"},
					{path: "$sap.ui.mdc.table.Column>/header"},
					{path: "$sap.ui.mdc.table.Column>/headerVisible"},
					{path: "$sap.ui.mdc.Table>/useColumnLabelsAsTooltips"}
				],
				formatter: function(sTooltip, sHeader, bHeaderVisible, bUseColumnLabelsAsTooltips) {
					if (sTooltip || !bUseColumnLabelsAsTooltips) {
						return sTooltip;
					}
					return bHeaderVisible ? sHeader : "";
				}
			},
			hAlign: "{$sap.ui.mdc.table.Column>/hAlign}",
			headerMenu: oTable.getId() + "-columnHeaderMenu"
		};
	};

	TableTypeBase.prototype.getRowSettingsConfig = function() {
		const oTable = this.getTable();
		const oRowSettings = oTable ? oTable.getRowSettings() : null;
		return oRowSettings ? oRowSettings.getAllSettings() : null;
	};

	TableTypeBase.prototype._onColumnMove = function(oEvent) {
		const oTable = this.getTable();
		const oInnerTable = this.getInnerTable();
		const oDraggedColumn = oEvent.getParameter("draggedControl");
		const oDroppedColumn = oEvent.getParameter("droppedControl");

		if (oDraggedColumn === oDroppedColumn) {
			return;
		}

		const sDropPosition = oEvent.getParameter("dropPosition");
		const iDraggedIndex = oInnerTable.indexOfColumn(oDraggedColumn);
		const iDroppedIndex = oInnerTable.indexOfColumn(oDroppedColumn);
		const iNewIndex = iDroppedIndex + (sDropPosition === "Before" ? 0 : 1) + (iDraggedIndex < iDroppedIndex ? -1 : 0);

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

	/**
	 * Returns a cached clone of the given RowActionItem, creating one if it doesn't exist yet.
	 *
	 * @param {sap.ui.mdc.table.RowActionItem} oRowActionItem The original RowActionItem to clone
	 * @returns {sap.ui.mdc.table.RowActionItem} The cached clone
	 * @private
	 */
	TableTypeBase.prototype.getRowActionClone = function(oRowActionItem) {
		if (!this._mRowActionItemClones.has(oRowActionItem)) {
			this._mRowActionItemClones.set(oRowActionItem, oRowActionItem.clone());
		}
		return this._mRowActionItemClones.get(oRowActionItem);
	};

	/**
	 * Cleans up all cached RowActionItem clones.
	 *
	 * This method:
	 * 1. Iterates through all cached clones in the Map
	 * 2. Removes each clone from its parent (if still attached)
	 * 3. Destroys each clone to prevent memory leaks
	 * 4. Clears and deletes the Map
	 *
	 * Should be called when:
	 * - The table type is destroyed (exit)
	 * - The row actions configuration changes (updateRowActions)
	 *
	 * @private
	 */
	TableTypeBase.prototype._cleanupRowActionClones = function() {
		if (this._mRowActionItemClones) {
			this._mRowActionItemClones.forEach((oClone) => {
				oClone.destroy();
			});
			this._mRowActionItemClones.clear();
		}
	};

	/**
	 * Called when a column is inserted. Adds the inner column to the inner table.
	 *
	 * @param {sap.ui.mdc.table.Column} oColumn The MDC column instance
	 * @param {int} [iIndex] The insertion index. If <code>undefined</code>, the column is added at the end.
	 * @private
	 */
	TableTypeBase.prototype.insertColumn = function(oColumn, iIndex) {
		const oInnerColumn = oColumn.getInnerColumn();

		if (iIndex === undefined) {
			this.getInnerTable().addColumn(oInnerColumn);
		} else {
			this.getInnerTable().insertColumn(oInnerColumn, iIndex);
		}
	};

	/**
	 * Called when a column is removed. Removes the inner column from the inner table.
	 *
	 * @param {sap.ui.mdc.table.Column} oColumn The column instance
	 * @private
	 */
	TableTypeBase.prototype.removeColumn = function(oColumn) {
		const oInnerColumn = oColumn?.getInnerColumn();

		if (oInnerColumn) {
			this.getInnerTable()?.removeColumn(oInnerColumn);
		}
	};

	/**
	 * Creates an <code>IllustratedMessage</code> for the case where the table has no visible columns.
	 *
	 * @returns {sap.m.IllustratedMessage} The no-columns illustrated message
	 * @private
	 */
	TableTypeBase.prototype.createNoColumnsMessage = function() {
		return MTableUtil.getNoColumnsIllustratedMessage(() => {
			PersonalizationUtils.openSettingsDialog(this.getTable());
		});
	};

	TableTypeBase.prototype.loadModules = function() { return Promise.reject(this + " does not implement #loadModules"); };
	TableTypeBase.prototype.updateTableByProperty = function(sProperty, vValue) {};
	TableTypeBase.prototype.removeToolbar = function() {};
	/** @param {sap.ui.core.Control} oFooter The footer control @private */
	TableTypeBase.prototype.setFooter = function(oFooter) {};
	/** @param {sap.ui.core.IContextMenu} oContextMenu The context menu @private */
	TableTypeBase.prototype.setContextMenu = function(oContextMenu) {};
	/** @param {sap.m.IllustratedMessage|string} vNoData The no-data content @private */
	TableTypeBase.prototype.setNoData = function(vNoData) {};
	TableTypeBase.prototype.scrollToIndex = function(iIndex) { return Promise.reject(); };
	TableTypeBase.prototype.updateRowSettings = function() {};
	TableTypeBase.prototype.prepareRowPress = function() {};
	TableTypeBase.prototype.cleanupRowPress = function() {};
	TableTypeBase.prototype.createTable = function() { };
	TableTypeBase.prototype.createColumn = function(oColumn) { };
	TableTypeBase.prototype.getRowBinding = function() {};
	TableTypeBase.prototype.bindRows = function(oBindingInfo) {};
	TableTypeBase.prototype.isTableBound = function() {};
	TableTypeBase.prototype.createRowTemplate = function(sId) { };
	/**
	 * Inserts the given filter info bar into the inner table.
	 *
	 * @param {sap.ui.mdc.util.InfoBar} oFilterInfoBar
	 */
	TableTypeBase.prototype.insertFilterInfoBar = function(oFilterInfoBar) { };
	TableTypeBase.prototype.enableColumnResize = function() {};
	TableTypeBase.prototype.disableColumnResize = function() {};
	TableTypeBase.prototype.createColumnResizeMenuItem = function() {};
	TableTypeBase.prototype.createColumnResizeInputMenuItem = function() {};
	TableTypeBase.prototype.updateRowActions = function() {};
	TableTypeBase.prototype.updateSortIndicator = function(oColumn, sSortOrder) {};
	TableTypeBase.prototype.getTableStyleClasses = function() { return []; };
	TableTypeBase.prototype.onModifications = function(aAffectedControllers) {};
	TableTypeBase.prototype.showXConfigState = function() { return false; };

	return TableTypeBase;
});