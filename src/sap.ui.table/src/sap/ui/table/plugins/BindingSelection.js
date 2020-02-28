/*
 * ${copyright}
 */
sap.ui.define([
	'./SelectionPlugin',
	"../utils/TableUtils",
	'../library'
], function(
	SelectionPlugin,
	TableUtils,
	library
) {

	"use strict";

	var SelectionMode = library.SelectionMode;

	/**
	 * Constructs an instance of sap.ui.table.plugins.BindingSelection
	 *
	 * @class Implements the selection methods for TreeTable and AnalyticalTable
	 * @extends sap.ui.table.plugins.SelectionPlugin
	 * @version ${version}
	 * @constructor
	 * @private
	 * @alias sap.ui.table.plugins.BindingSelection
	 */
	var BindingSelection = SelectionPlugin.extend("sap.ui.table.plugins.BindingSelection", {
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
	BindingSelection.prototype.onDeactivate = function(oTable) {
		SelectionPlugin.prototype.onDeactivate.apply(this, arguments);
		detachFromBinding(this, this.getTableBinding());
	};

	/**
	 * @inheritDoc
	 */
	BindingSelection.prototype.getRenderConfig = function() {
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
	BindingSelection.prototype.onHeaderSelectorPress = function() {
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
	BindingSelection.prototype.onKeyboardShortcut = function(sType) {
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
	BindingSelection.prototype.addSelectionInterval = function(iIndexFrom, iIndexTo) {
		if (this._getSelectionMode() === SelectionMode.None) {
			return;
		}

		var oBinding = this.getTableBinding();

		if (oBinding && oBinding.addSelectionInterval) {
			if (this._getSelectionMode() === SelectionMode.Single) {
				iIndexFrom = iIndexTo;
				oBinding.setSelectionInterval(iIndexFrom, iIndexTo);
			}
			oBinding.addSelectionInterval(iIndexFrom, iIndexTo);
		}
	};

	/**
	 * @override
	 * @inheritDoc
	 */
	BindingSelection.prototype.clearSelection = function() {
		var oBinding = this.getTableBinding();

		if (oBinding && oBinding.clearSelection) {
			oBinding.clearSelection();
		}
	};

	/**
	 * @override
	 * @inheritDoc
	 */
	BindingSelection.prototype.getSelectedIndex = function() {
		var oBinding = this.getTableBinding();

		if (oBinding && oBinding.findNode) {
			return oBinding.getSelectedIndex();
		} else {
			return -1;
		}
	};

	/**
	 * @override
	 * @inheritDoc
	 */
	BindingSelection.prototype.getSelectedIndices = function() {
		var oBinding = this.getTableBinding();

		if (oBinding && oBinding.findNode && oBinding.getSelectedIndices) {
			return oBinding.getSelectedIndices();
		} else {
			return [];
		}
	};

	/**
	 * @override
	 * @inheritDoc
	 */
	BindingSelection.prototype.getSelectableCount = function() {
		var oBinding = this.getTableBinding();

		if (!oBinding) {
			return 0;
		} else if (oBinding.getGrandTotalContextInfo) { // AnalyticalBinding
			var oRootNode = oBinding.getGrandTotalContextInfo();
			return oRootNode ? oRootNode.totalNumberOfLeafs : 0;
		} else {
			return oBinding.getLength();
		}
	};

	/**
	 * @override
	 * @inheritDoc
	 */
	BindingSelection.prototype.getSelectedCount = function() {
		var oBinding = this.getTableBinding();

		if (oBinding && oBinding.getSelectedNodesCount) {
			return oBinding.getSelectedNodesCount();
		} else {
			return 0;
		}
	};

	/**
	 * @override
	 * @inheritDoc
	 */
	BindingSelection.prototype.isIndexSelectable = function(iIndex) {
		var oBinding = this.getTableBinding();
		if (oBinding) {
			return oBinding.isIndexSelectable(iIndex);
		} else {
			// if there is no binding the selection can't be handled, therefore the row is not selectable
			return false;
		}
	};

	/**
	 * @override
	 * @inheritDoc
	 */
	BindingSelection.prototype.isIndexSelected = function(iIndex) {
		var oBinding = this.getTableBinding();

		if (oBinding && oBinding.isIndexSelected) {
			return oBinding.isIndexSelected(iIndex);
		} else {
			return false;
		}
	};

	/**
	 * @override
	 * @inheritDoc
	 */
	BindingSelection.prototype.removeSelectionInterval = function(iIndexFrom, iIndexTo) {
		var oBinding = this.getTableBinding();

		if (oBinding && oBinding.findNode && oBinding.removeSelectionInterval) {
			oBinding.removeSelectionInterval(iIndexFrom, iIndexTo);
		}
	};

	/**
	 * @override
	 * @inheritDoc
	 */
	BindingSelection.prototype.selectAll = function() {
		if (this._getSelectionMode() === SelectionMode.None) {
			return;
		}

		var oBinding = this.getTableBinding();

		if (oBinding && oBinding.selectAll) {
			oBinding.selectAll();
		}
	};

	/**
	 * @override
	 * @inheritDoc
	 */
	BindingSelection.prototype.setSelectedIndex = function(iIndex) {
		if (this._getSelectionMode() === SelectionMode.None) {
			return;
		}

		if (iIndex === -1) {
			// Index -1 means to clear the selection. The binding doesn't know that -1 means no selection.
			this.clearSelection();
		} else {
			var oBinding = this.getTableBinding();

			if (oBinding && oBinding.setSelectedIndex) {
				oBinding.setSelectedIndex(iIndex);
			}
		}
	};

	/**
	 * @override
	 * @inheritDoc
	 */
	BindingSelection.prototype.setSelectionInterval = function(iIndexFrom, iIndexTo) {
		if (this._getSelectionMode() === SelectionMode.None) {
			return;
		}

		var oBinding = this.getTableBinding();

		if (oBinding && oBinding.setSelectionInterval) {
			if (this._getSelectionMode() === SelectionMode.Single) {
				iIndexFrom = iIndexTo;
			}
			oBinding.setSelectionInterval(iIndexFrom, iIndexTo);
		}
	};

	/**
	 * Sets the selection mode. The current selection is lost
	 *
	 * @param {string} sSelectionMode The new selection mode.
	 * @returns {sap.ui.table.plugins.BindingSelection} Reference to <code>this</code> in order to allow method chaining
	 * @public
	 */
	BindingSelection.prototype.setSelectionMode = function(sSelectionMode) {
		var sOldSelectionMode = this._getSelectionMode();

		SelectionPlugin.prototype._setSelectionMode.apply(this, arguments);

		if (this._getSelectionMode() !== sOldSelectionMode) {
			this.clearSelection();
		}

		return this;
	};

	/**
	 * @inheritDoc
	 */
	BindingSelection.prototype.onTableRowsBound = function(oBinding) {
		SelectionPlugin.prototype.onTableRowsBound.apply(this, arguments);
		attachToBinding(this, oBinding);
	};

	function attachToBinding(oPlugin, oBinding) {
		if (oBinding) {
			oBinding.attachChange(oPlugin._onBindingChange, oPlugin);
			oBinding.attachSelectionChanged(oPlugin._onSelectionChange, oPlugin);
		}
	}

	function detachFromBinding(oPlugin, oBinding) {
		if (oBinding) {
			oBinding.detachChange(oPlugin._onBindingChange, oPlugin);
			oBinding.detachSelectionChanged(oPlugin._onSelectionChange, oPlugin);
		}
	}

	/**
	 *
	 * @param {sap.ui.base.Event} oEvent
	 * @private
	 */
	BindingSelection.prototype._onBindingChange = function(oEvent) {
		var sReason = typeof (oEvent) === "object" ? oEvent.getParameter("reason") : oEvent;

		if (sReason === "sort" || sReason === "filter") {
			this.clearSelection();
		}
	};

	BindingSelection.prototype._onSelectionChange = function(oEvent) {
		var aRowIndices = oEvent.getParameter("rowIndices");
		var bSelectAll = oEvent.getParameter("selectAll");

		this.fireSelectionChange({
			rowIndices: aRowIndices,
			selectAll: bSelectAll
		});
	};

	return BindingSelection;
});