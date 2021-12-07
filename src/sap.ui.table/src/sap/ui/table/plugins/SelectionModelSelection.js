/*
 * ${copyright}
 */
sap.ui.define([
	'sap/ui/model/SelectionModel',
	'./SelectionPlugin',
	"../utils/TableUtils",
	'../library'
], function(
	SelectionModel,
	SelectionPlugin,
	TableUtils,
	library
) {
	"use strict";

	var SelectionMode = library.SelectionMode;

	/**
	 * Constructs an instance of sap.ui.table.plugins.SelectionModelSelection
	 *
	 * @class Implements the selection methods for a Table
	 * @extends sap.ui.table.plugins.SelectionPlugin
	 * @version ${version}
	 * @constructor
	 * @private
	 * @alias sap.ui.table.plugins.SelectionModelSelection
	 */
	var SelectionModelSelection = SelectionPlugin.extend("sap.ui.table.plugins.SelectionModelSelection", {
		metadata: {
			library: "sap.ui.table",
			events: {
				/**
				 * This event is fired when the selection is changed.
				 */
				selectionChange: {
					parameters: {
						/**
						 * Array of indices whose selection has been changed (either selected or deselected)
						 */
						indices: {type: "int[]"},

						/**
						 * Indicates whether the Select All function is used to select rows.
						 */
						selectAll: {type: "boolean"}
					}
				}
			}
		}
	});

	/**
	 * @inheritDoc
	 */
	SelectionModelSelection.prototype.init = function() {
		SelectionPlugin.prototype.init.apply(this, arguments);
		this.oSelectionModel = new SelectionModel(this._getSelectionMode);
	};

	/**
	 * @inheritDoc
	 */
	SelectionModelSelection.prototype.exit = function() {
		SelectionPlugin.prototype.exit.apply(this, arguments);

		if (this.oSelectionModel) {
			this.oSelectionModel.destroy();
			this.oSelectionModel = null;
		}
	};

	/**
	 * @inheritDoc
	 */
	SelectionModelSelection.prototype.onActivate = function(oTable) {
		SelectionPlugin.prototype.onActivate.apply(this, arguments);
		this.oSelectionModel.attachSelectionChanged(onSelectionChange, this);
		TableUtils.Hook.register(oTable, TableUtils.Hook.Keys.Table.TotalRowCountChanged, onTotalRowCountChanged, this);
		this._iTotalRowCount = oTable._getTotalRowCount();
	};

	/**
	 * @inheritDoc
	 */
	SelectionModelSelection.prototype.onDeactivate = function(oTable) {
		SelectionPlugin.prototype.onDeactivate.apply(this, arguments);
		this.oSelectionModel.detachSelectionChanged(onSelectionChange, this);
		this.oSelectionModel.clearSelection();
		detachFromBinding(this, this.getTableBinding());
		TableUtils.Hook.deregister(oTable, TableUtils.Hook.Keys.Table.TotalRowCountChanged, onTotalRowCountChanged, this);
	};

	/**
	 * @inheritDoc
	 */
	SelectionModelSelection.prototype.getRenderConfig = function() {
		return {
			headerSelector: {
				type: "toggle",
				visible: TableUtils.hasSelectAll(this.getTable())
			}
		};
	};

	/**
	 * This hook is called by the table when the header selector is pressed.
	 *
	 * @private
	 */
	SelectionModelSelection.prototype.onHeaderSelectorPress = function() {
		if (this.getRenderConfig().headerSelector.visible) {
			this.getTable()._toggleSelectAll();
		}
	};

	/**
	 * This hook is called by the table when the "select all" keyboard shortcut is pressed.
	 *
	 * @param {string} sType Type of the keyboard shortcut.
	 * @private
	 */
	SelectionModelSelection.prototype.onKeyboardShortcut = function(sType) {
		if (sType === "toggle") {
			this.getTable()._toggleSelectAll();
		} else if (sType === "clear") {
			this.clearSelection();
		}
	};

	/**
	 * @override
	 * @inheritDoc
	 */
	SelectionModelSelection.prototype.addSelectionInterval = function(iIndexFrom, iIndexTo) {
		if (!this.oSelectionModel || this._getSelectionMode() === SelectionMode.None) {
			return;
		}
		this.oSelectionModel.addSelectionInterval(iIndexFrom, iIndexTo);
	};

	/**
	 * @override
	 * @inheritDoc
	 */
	SelectionModelSelection.prototype.clearSelection = function() {
		if (this.oSelectionModel) {
			this.oSelectionModel.clearSelection();
		}
	};

	/**
	 * @override
	 * @inheritDoc
	 */
	SelectionModelSelection.prototype.getSelectedIndex = function() {
		if (this.oSelectionModel) {
			return this.oSelectionModel.getLeadSelectedIndex();
		}
		return -1;
	};

	/**
	 * @override
	 * @inheritDoc
	 */
	SelectionModelSelection.prototype.getSelectedIndices = function() {
		if (this.oSelectionModel) {
			return this.oSelectionModel.getSelectedIndices();
		}
		return [];
	};

	/**
	 * @override
	 * @inheritDoc
	 */
	SelectionModelSelection.prototype.getSelectableCount = function() {
		var oBinding = this.getTableBinding();
		return oBinding ? oBinding.getLength() : 0;
	};

	/**
	 * @override
	 * @inheritDoc
	 */
	SelectionModelSelection.prototype.getSelectedCount = function() {
		return this.getSelectedIndices().length;
	};

	/**
	 * @override
	 * @inheritDoc
	 */
	SelectionModelSelection.prototype.isIndexSelectable = function(iIndex) {
		return iIndex >= 0 && iIndex <= this._getHighestSelectableIndex();
	};

	/**
	 * @override
	 * @inheritDoc
	 */
	SelectionModelSelection.prototype.isIndexSelected = function(iIndex) {
		return this.getSelectedIndices().indexOf(iIndex) !== -1;
	};

	/**
	 * @override
	 * @inheritDoc
	 */
	SelectionModelSelection.prototype.removeSelectionInterval = function(iIndexFrom, iIndexTo) {
		if (this.oSelectionModel) {
			this.oSelectionModel.removeSelectionInterval(iIndexFrom, iIndexTo);
		}
	};

	/**
	 * @override
	 * @inheritDoc
	 */
	SelectionModelSelection.prototype.selectAll = function() {
		if (!this.oSelectionModel || this._getSelectionMode() === SelectionMode.None) {
			return;
		}
		this.oSelectionModel.selectAll(this._getHighestSelectableIndex());
	};

	/**
	 * @override
	 * @inheritDoc
	 */
	SelectionModelSelection.prototype.setSelectedIndex = function(iIndex) {
		if (this._getSelectionMode() === SelectionMode.None) {
			return;
		}
		if (iIndex === -1) {
			// Index -1 means to clear the selection. The selection model doesn't know that -1 means no selection.
			this.clearSelection();
		} else {
			this.setSelectionInterval(iIndex, iIndex);
		}
	};

	/**
	 * @override
	 * @inheritDoc
	 */
	SelectionModelSelection.prototype.setSelectionInterval = function(iIndexFrom, iIndexTo) {
		if (!this.oSelectionModel || this._getSelectionMode() === SelectionMode.None) {
			return;
		}
		this.oSelectionModel.setSelectionInterval(iIndexFrom, iIndexTo);
	};

	/**
	 * Sets the selection mode. The current selection is lost.
	 *
	 * @param {string} sSelectionMode The new selection mode.
	 * @returns {this} Reference to <code>this</code> in order to allow method chaining
	 * @public
	 */
	SelectionModelSelection.prototype.setSelectionMode = function(sSelectionMode) {
		var sOldSelectionMode = this._getSelectionMode();

		SelectionPlugin.prototype._setSelectionMode.apply(this, arguments);

		if (this._getSelectionMode() !== sOldSelectionMode) {
			this.clearSelection();
		}

		if (this.oSelectionModel) {
			var iSelectionMode = (sSelectionMode === SelectionMode.MultiToggle ? SelectionModel.MULTI_SELECTION : SelectionModel.SINGLE_SELECTION);
			this.oSelectionModel.setSelectionMode(iSelectionMode);
		}

		return this;
	};

	/**
	 * Returns the highest index that can be selected. Returns -1 if there is nothing to select.
	 *
	 * @returns {int} The highest index that can be selected.
	 * @private
	 */
	SelectionModelSelection.prototype._getHighestSelectableIndex = function() {
		var oBinding = this.getTableBinding();
		return oBinding ? oBinding.getLength() - 1 : -1;
	};

	/**
	 * @inheritDoc
	 */
	SelectionModelSelection.prototype.onTableRowsBound = function(oBinding) {
		SelectionPlugin.prototype.onTableRowsBound.apply(this, arguments);
		attachToBinding(this, oBinding);
	};

	/**
	 * @inheritDoc
	 */
	SelectionModelSelection.prototype.onTableUnbindRows = function() {
		SelectionPlugin.prototype.onTableUnbindRows.apply(this, arguments);
		this._suspend();
		this.clearSelection();
		this._resume();
	};

	function onSelectionChange(oEvent) {
		var aRowIndices = oEvent.getParameter("rowIndices");
		var bSelectAll = oEvent.getParameter("selectAll");

		this.fireSelectionChange({
			rowIndices: aRowIndices,
			selectAll: bSelectAll
		});
	}

	function attachToBinding(oPlugin, oBinding) {
		if (oBinding) {
			oBinding.attachChange(onBindingChange, oPlugin);
		}
	}

	function detachFromBinding(oPlugin, oBinding) {
		if (oBinding) {
			oBinding.detachChange(onBindingChange, oPlugin);
		}
	}

	function onBindingChange(oEvent) {
		var sReason = typeof (oEvent) === "object" ? oEvent.getParameter("reason") : oEvent;

		if (sReason === "sort" || sReason === "filter") {
			this.clearSelection();
		}
	}

	function onTotalRowCountChanged() {
		var iTotalRowCount = this.getTable()._getTotalRowCount();

		// If rows are added or removed, the index-based selection of the SelectionModel is invalid and needs to be cleared.
		// Changes from 0 are ignored for compatibility, so it is possible to select something before the initial rows update is done.
		if (this._iTotalRowCount > 0 && this._iTotalRowCount !== iTotalRowCount) {
			this.clearSelection();
		}

		this._iTotalRowCount = iTotalRowCount;
	}

	return SelectionModelSelection;
});