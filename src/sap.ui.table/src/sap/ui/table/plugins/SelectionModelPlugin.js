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
	 * Constructs an instance of sap.ui.table.plugins.SelectionModelPlugin
	 *
	 * @class Implements the selection methods for a Table
	 * @extends sap.ui.table.plugins.SelectionPlugin
	 * @version ${version}
	 * @constructor
	 * @private
	 * @alias sap.ui.table.plugins.SelectionModelPlugin
	 */
	var SelectionModelPlugin = SelectionPlugin.extend("sap.ui.table.plugins.SelectionModelPlugin", {
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
	SelectionModelPlugin.prototype.init = function() {
		SelectionPlugin.prototype.init.apply(this, arguments);
		this.oSelectionModel = new SelectionModel(this._getSelectionMode);
	};

	/**
	 * @inheritDoc
	 */
	SelectionModelPlugin.prototype.exit = function() {
		SelectionPlugin.prototype.exit.apply(this, arguments);

		if (this.oSelectionModel) {
			this.oSelectionModel.destroy();
			this.oSelectionModel = null;
		}
	};

	/**
	 * @inheritDoc
	 */
	SelectionModelPlugin.prototype.onActivate = function() {
		SelectionPlugin.prototype.onActivate.apply(this, arguments);
		this.oSelectionModel.attachSelectionChanged(this._onSelectionChange, this);
	};

	/**
	 * @inheritDoc
	 */
	SelectionModelPlugin.prototype.onDeactivate = function() {
		SelectionPlugin.prototype.onDeactivate.apply(this, arguments);
		this.oSelectionModel.detachSelectionChanged(this._onSelectionChange, this);
		this.oSelectionModel.clearSelection();
		detachFromBinding(this, this.getTableBinding());
	};

	/**
	 * @inheritDoc
	 */
	SelectionModelPlugin.prototype.getRenderConfig = function() {
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
	SelectionModelPlugin.prototype.onHeaderSelectorPress = function() {
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
	SelectionModelPlugin.prototype.onKeyboardShortcut = function(sType) {
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
	SelectionModelPlugin.prototype.addSelectionInterval = function(iIndexFrom, iIndexTo) {
		if (!this.oSelectionModel || this._getSelectionMode() === SelectionMode.None) {
			return;
		}
		this.oSelectionModel.addSelectionInterval(iIndexFrom, iIndexTo);
	};

	/**
	 * @override
	 * @inheritDoc
	 */
	SelectionModelPlugin.prototype.clearSelection = function() {
		if (this.oSelectionModel) {
			this.oSelectionModel.clearSelection();
		}
	};

	/**
	 * @override
	 * @inheritDoc
	 */
	SelectionModelPlugin.prototype.getSelectedIndex = function() {
		if (this.oSelectionModel) {
			return this.oSelectionModel.getLeadSelectedIndex();
		}
		return -1;
	};

	/**
	 * @override
	 * @inheritDoc
	 */
	SelectionModelPlugin.prototype.getSelectedIndices = function() {
		if (this.oSelectionModel) {
			return this.oSelectionModel.getSelectedIndices();
		}
		return [];
	};

	/**
	 * @override
	 * @inheritDoc
	 */
	SelectionModelPlugin.prototype.getSelectableCount = function() {
		var oBinding = this.getTableBinding();
		return oBinding ? oBinding.getLength() : 0;
	};

	/**
	 * @override
	 * @inheritDoc
	 */
	SelectionModelPlugin.prototype.getSelectedCount = function() {
		return this.getSelectedIndices().length;
	};

	/**
	 * @override
	 * @inheritDoc
	 */
	SelectionModelPlugin.prototype.isIndexSelectable = function(iIndex) {
		var iCount = this._getLastIndex();
		return iIndex >= 0 && iIndex <= iCount;
	};

	/**
	 * @override
	 * @inheritDoc
	 */
	SelectionModelPlugin.prototype.isIndexSelected = function(iIndex) {
		return this.getSelectedIndices().indexOf(iIndex) !== -1;
	};

	/**
	 * @override
	 * @inheritDoc
	 */
	SelectionModelPlugin.prototype.removeSelectionInterval = function(iIndexFrom, iIndexTo) {
		if (this.oSelectionModel) {
			this.oSelectionModel.removeSelectionInterval(iIndexFrom, iIndexTo);
		}
	};

	/**
	 * @override
	 * @inheritDoc
	 */
	SelectionModelPlugin.prototype.selectAll = function() {
		if (!this.oSelectionModel || this._getSelectionMode() === SelectionMode.None) {
			return;
		}
		this.oSelectionModel.selectAll(this._getLastIndex());
	};

	/**
	 * @override
	 * @inheritDoc
	 */
	SelectionModelPlugin.prototype.setSelectedIndex = function(iIndex) {
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
	SelectionModelPlugin.prototype.setSelectionInterval = function(iIndexFrom, iIndexTo) {
		if (!this.oSelectionModel || this._getSelectionMode() === SelectionMode.None) {
			return;
		}
		this.oSelectionModel.setSelectionInterval(iIndexFrom, iIndexTo);
	};

	/**
	 * Sets the selection mode. The current selection is lost.
	 *
	 * @param {string} sSelectionMode The new selection mode.
	 * @returns {sap.ui.table.plugins.SelectionModelPlugin} Reference to <code>this</code> in order to allow method chaining
	 * @public
	 */
	SelectionModelPlugin.prototype.setSelectionMode = function(sSelectionMode) {
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
	 * Returns the last existing index of the binding
	 *
	 * @return {int} the last index of the binding
	 * @private
	 */
	SelectionModelPlugin.prototype._getLastIndex = function() {
		if (!this.getTableBinding()) {
			return 0;
		}
		return this.getTableBinding().getLength() - 1;
	};

	/**
	 * Fires the selectionChange event
	 *
	 * @param {sap.ui.base.Event} oEvent
	 * @private
	 */
	SelectionModelPlugin.prototype._onSelectionChange = function(oEvent) {
		var aRowIndices = oEvent.getParameter("rowIndices");
		var bSelectAll = oEvent.getParameter("selectAll");

		this.fireSelectionChange({
			rowIndices: aRowIndices,
			selectAll: bSelectAll
		});
	};

	/**
	 * @inheritDoc
	 */
	SelectionModelPlugin.prototype.onTableRowsBound = function(oBinding) {
		SelectionPlugin.prototype.onTableRowsBound.apply(this, arguments);
		attachToBinding(this, oBinding);
	};

	/**
	 * @inheritDoc
	 */
	SelectionModelPlugin.prototype.onTableUnbindRows = function() {
		SelectionPlugin.prototype.onTableUnbindRows.apply(this, arguments);
		this._suspend();
		this.clearSelection();
		this._resume();
	};

	function attachToBinding(oPlugin, oBinding) {
		if (oBinding) {
			oBinding.attachChange(oPlugin._onBindingChange, oPlugin);
		}
	}

	function detachFromBinding(oPlugin, oBinding) {
		if (oBinding) {
			oBinding.detachChange(oPlugin._onBindingChange, oPlugin);
		}
	}

	/**
	 *
	 * @param {sap.ui.base.Event} oEvent
	 * @private
	 */
	SelectionModelPlugin.prototype._onBindingChange = function(oEvent) {
		var sReason = typeof (oEvent) === "object" ? oEvent.getParameter("reason") : oEvent;

		if (sReason === "sort" || sReason === "filter") {
			this.clearSelection();
		}
	};

	return SelectionModelPlugin;
});