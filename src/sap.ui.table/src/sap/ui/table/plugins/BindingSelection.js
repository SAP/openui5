/*
 * ${copyright}
 */
sap.ui.define([
	"./SelectionPlugin",
	"../utils/TableUtils",
	"../library"
], function(
	SelectionPlugin,
	TableUtils,
	library
) {
	"use strict";

	const SelectionMode = library.SelectionMode;

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
	const BindingSelection = SelectionPlugin.extend("sap.ui.table.plugins.BindingSelection", {
		metadata: {
			library: "sap.ui.table",
			properties: {
				selectionMode: {type: "sap.ui.table.SelectionMode", group: "Behavior", defaultValue: SelectionMode.MultiToggle}
			},
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

	BindingSelection.prototype.setSelected = function(oRow, bSelected, mConfig) {
		if (!this.isIndexSelectable(oRow.getIndex())) {
			return;
		}

		if (mConfig && mConfig.range) {
			const iLastSelectedIndex = this.getSelectedIndex();

			if (iLastSelectedIndex >= 0) {
				this.addSelectionInterval(iLastSelectedIndex, oRow.getIndex());
			}
		} else if (bSelected) {
			this.addSelectionInterval(oRow.getIndex(), oRow.getIndex());
		} else {
			this.removeSelectionInterval(oRow.getIndex(), oRow.getIndex());
		}
	};

	BindingSelection.prototype.isSelected = function(oRow) {
		return this.isIndexSelected(oRow.getIndex());
	};

	/**
	 * @inheritDoc
	 */
	BindingSelection.prototype.getRenderConfig = function() {
		return {
			headerSelector: {
				type: "toggle",
				visible: TableUtils.hasSelectAll(this.getTable()),
				selected: this.getSelectableCount() > 0 && this.getSelectableCount() === this.getSelectedCount()
			}
		};
	};

	function toggleSelectAll(oPlugin) {
		const oTable = oPlugin.getTable();
		let bSelectAll;

		if (oPlugin.getSelectionMode() !== SelectionMode.MultiToggle) {
			return false;
		}

		// in order to fire the rowSelectionChanged event, the SourceRowIndex mus be set to -1
		// to indicate that the selection was changed by user interaction
		if (oPlugin.getSelectableCount() > oPlugin.getSelectedCount()) {
			oTable._iSourceRowIndex = 0;
			oPlugin.selectAll();
			bSelectAll = true;
		} else {
			oTable._iSourceRowIndex = -1;
			oPlugin.clearSelection();
			bSelectAll = false;
		}

		oTable._iSourceRowIndex = undefined;
		return bSelectAll;
	}

	/**
	 * This hook is called by the table when the header selector is pressed.
	 *
	 * @private
	 */
	BindingSelection.prototype.onHeaderSelectorPress = function() {
		if (this.getRenderConfig().headerSelector.visible) {
			toggleSelectAll(this);
		}
	};

	/**
	 * This hook is called by the table when the "select all" keyboard shortcut is pressed.
	 *
	 * @param {string} sType Type of the keyboard shortcut.
	 * @param {sap.ui.base.Event} oEvent The emitted event.
	 * @private
	 */
	BindingSelection.prototype.onKeyboardShortcut = function(sType, oEvent) {
		if (sType === "toggle" && toggleSelectAll(this) === false) {
			oEvent?.setMarked("sapUiTableClearAll");
		} else if (sType === "clear") {
			this.clearSelection();
			oEvent?.setMarked("sapUiTableClearAll");
		}
	};

	/**
	 * @override
	 * @inheritDoc
	 */
	BindingSelection.prototype.addSelectionInterval = function(iIndexFrom, iIndexTo) {
		if (this.getSelectionMode() === SelectionMode.None) {
			return;
		}

		const oBinding = this.getTableBinding();

		if (oBinding && oBinding.addSelectionInterval) {
			if (this.getSelectionMode() === SelectionMode.Single) {
				iIndexFrom = iIndexTo;
				this.setSelectionInterval(iIndexFrom, iIndexTo);
			} else {
				oBinding.addSelectionInterval(iIndexFrom, iIndexTo);
			}
		}
	};

	/**
	 * @override
	 * @inheritDoc
	 */
	BindingSelection.prototype.clearSelection = function() {
		const oBinding = this.getTableBinding();

		if (oBinding && oBinding.clearSelection) {
			oBinding.clearSelection();
		}
	};

	/**
	 * @override
	 * @inheritDoc
	 */
	BindingSelection.prototype.getSelectedIndex = function() {
		const oBinding = this.getTableBinding();

		if (oBinding && oBinding.getSelectedIndex) {
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
		const oBinding = this.getTableBinding();

		if (this.getSelectionMode() === SelectionMode.Single) {
			const iSelectedIndex = this.getSelectedIndex();

			if (iSelectedIndex === -1) {
				return [];
			}

			return [iSelectedIndex];
		}

		if (oBinding && oBinding.getSelectedIndices) {
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
		const oBinding = this.getTableBinding();

		if (!oBinding) {
			return 0;
		} else if (oBinding.isA("sap.ui.model.analytics.AnalyticalBinding")) {
			const oRootNode = oBinding.getGrandTotalContextInfo();
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
		const oBinding = this.getTableBinding();

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
		const oBinding = this.getTableBinding();

		if (oBinding && oBinding.isIndexSelectable) {
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
		const oBinding = this.getTableBinding();

		if (this.getSelectionMode() === SelectionMode.Single) {
			if (iIndex < 0) {
				return false;
			}

			return iIndex === this.getSelectedIndex();
		}

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
		const oBinding = this.getTableBinding();

		if (oBinding && oBinding.removeSelectionInterval) {
			oBinding.removeSelectionInterval(iIndexFrom, iIndexTo);
		}
	};

	/**
	 * @override
	 * @inheritDoc
	 */
	BindingSelection.prototype.selectAll = function() {
		if (this.getSelectionMode() !== SelectionMode.MultiToggle) {
			return;
		}

		const oBinding = this.getTableBinding();

		if (oBinding && oBinding.selectAll) {
			oBinding.selectAll();
		}
	};

	/**
	 * @override
	 * @inheritDoc
	 */
	BindingSelection.prototype.setSelectedIndex = function(iIndex) {
		if (this.getSelectionMode() === SelectionMode.None) {
			return;
		}

		if (iIndex === -1) {
			// Index -1 means to clear the selection. The binding doesn't know that -1 means no selection.
			this.clearSelection();
		} else {
			const oBinding = this.getTableBinding();

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
		if (this.getSelectionMode() === SelectionMode.None) {
			return;
		}

		const oBinding = this.getTableBinding();

		if (oBinding && oBinding.setSelectionInterval) {
			if (this.getSelectionMode() === SelectionMode.Single) {
				iIndexFrom = iIndexTo;
			}
			oBinding.setSelectionInterval(iIndexFrom, iIndexTo);
		}
	};

	/**
	 * Sets the selection mode. The current selection is lost
	 *
	 * @param {string} sSelectionMode The new selection mode.
	 * @returns {this} Reference to <code>this</code> in order to allow method chaining
	 * @public
	 */
	BindingSelection.prototype.setSelectionMode = function(sSelectionMode) {
		const sOldSelectionMode = this.getSelectionMode();

		this.setProperty("selectionMode", sSelectionMode);

		if (this.getSelectionMode() !== sOldSelectionMode) {
			this.clearSelection();
		}

		return this;
	};

	/**
	 * Returns the highest index that can be selected. Returns -1 if there is nothing to select.
	 *
	 * @returns {int} The highest index that can be selected.
	 * @private
	 */
	BindingSelection.prototype._getHighestSelectableIndex = function() {
		const oBinding = this.getTableBinding();

		if (!oBinding) {
			return -1;
		} else if (oBinding.isA("sap.ui.model.analytics.AnalyticalBinding")) {
			const bHasGrandTotal = oBinding.providesGrandTotal() && oBinding.hasTotaledMeasures();
			return oBinding.getLength() - (bHasGrandTotal ? 2 : 1);
		} else {
			return oBinding.getLength() - 1;
		}
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
			if (oBinding.attachSelectionChanged) {
				oBinding.attachSelectionChanged(oPlugin._onSelectionChange, oPlugin);
			}
		}
	}

	function detachFromBinding(oPlugin, oBinding) {
		if (oBinding) {
			oBinding.detachChange(oPlugin._onBindingChange, oPlugin);
			if (oBinding.detachSelectionChanged) {
				oBinding.detachSelectionChanged(oPlugin._onSelectionChange, oPlugin);
			}
		}
	}

	/**
	 *
	 * @param {sap.ui.base.Event} oEvent
	 * @private
	 */
	BindingSelection.prototype._onBindingChange = function(oEvent) {
		const sReason = typeof (oEvent) === "object" ? oEvent.getParameter("reason") : oEvent;

		if (sReason === "sort" || sReason === "filter") {
			this.clearSelection();
		}
	};

	BindingSelection.prototype._onSelectionChange = function(oEvent) {
		const aRowIndices = oEvent.getParameter("rowIndices");
		const bSelectAll = oEvent.getParameter("selectAll");

		this.fireSelectionChange({
			rowIndices: aRowIndices,
			selectAll: bSelectAll
		});
	};

	return BindingSelection;
});