/*
 * ${copyright}
 */
sap.ui.define([
	'./SelectionAdapter',
	'./library'
], function(
	SelectionAdapter,
	library
) {

	"use strict";

	var SelectionMode = library.SelectionMode;

	/**
	 * Constructs an instance of sap.ui.table.BindingSelectionAdapter
	 *
	 * @class Implements the selection methods for TreeTable and AnalyticalTable
	 * @extends sap.ui.table.SelectionAdapter
	 * @version ${version}
	 * @constructor
	 * @private
	 * @alias sap.ui.table.BindingSelectionAdapter
	 */
	var BindingSelectionAdapter = SelectionAdapter.extend("sap.ui.table.BindingSelectionAdapter");

	/**
	 * @override
	 * @inheritDoc
	 */
	BindingSelectionAdapter.prototype.exit = function() {
		var oBinding = this._getBinding();
		if (oBinding) {
			oBinding.detachEvent("change", this._onBindingChange);
		}
		SelectionAdapter.prototype.exit.call(this);
	};

	/**
	 * @override
	 * @inheritDoc
	 */
	BindingSelectionAdapter.prototype.addSelectionInterval = function(iIndexFrom, iIndexTo) {
		if (this.getSelectionMode() === SelectionMode.None) {
			return;
		}

		var oBinding = this._getBinding();

		if (oBinding && oBinding.addSelectionInterval) {
			if (this.getSelectionMode() === SelectionMode.Single) {
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
	BindingSelectionAdapter.prototype.clearSelection = function() {
		var oBinding = this._getBinding();

		if (oBinding && oBinding.clearSelection) {
			oBinding.clearSelection();
		}
	};

	/**
	 * @override
	 * @inheritDoc
	 */
	BindingSelectionAdapter.prototype.getSelectedIndex = function() {
		var oBinding = this._getBinding();

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
	BindingSelectionAdapter.prototype.getSelectedIndices = function() {
		var oBinding = this._getBinding();

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
	BindingSelectionAdapter.prototype.getSelectableCount = function() {
		var oBinding = this._getBinding();

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
	BindingSelectionAdapter.prototype.getSelectedCount = function() {
		var oBinding = this._getBinding();

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
	BindingSelectionAdapter.prototype.isIndexSelectable = function(iIndex) {
		var oBinding = this._getBinding();
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
	BindingSelectionAdapter.prototype.isIndexSelected = function(iIndex) {
		var oBinding = this._getBinding();

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
	BindingSelectionAdapter.prototype.removeSelectionInterval = function(iIndexFrom, iIndexTo) {
		var oBinding = this._getBinding();

		if (oBinding && oBinding.findNode && oBinding.removeSelectionInterval) {
			oBinding.removeSelectionInterval(iIndexFrom, iIndexTo);
		}
	};

	/**
	 * @override
	 * @inheritDoc
	 */
	BindingSelectionAdapter.prototype.selectAll = function() {
		if (this.getSelectionMode() === SelectionMode.None) {
			return;
		}

		var oBinding = this._getBinding();

		if (oBinding && oBinding.selectAll) {
			oBinding.selectAll();
		}
	};

	/**
	 * @override
	 * @inheritDoc
	 */
	BindingSelectionAdapter.prototype.setSelectedIndex = function(iIndex) {
		if (this.getSelectionMode() === SelectionMode.None) {
			return;
		}

		if (iIndex === -1) {
			// Index -1 means to clear the selection. The binding doesn't know that -1 means no selection.
			this.clearSelection();
		} else {
			var oBinding = this._getBinding();

			if (oBinding && oBinding.setSelectedIndex) {
				oBinding.setSelectedIndex(iIndex);
			}
		}
	};

	/**
	 * @override
	 * @inheritDoc
	 */
	BindingSelectionAdapter.prototype.setSelectionInterval = function(iIndexFrom, iIndexTo) {
		if (this.getSelectionMode() === SelectionMode.None) {
			return;
		}

		var oBinding = this._getBinding();

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
	 * @returns {sap.ui.table.BindingSelectionAdapter} Reference to <code>this</code> in order to allow method chaining
	 * @public
	 */
	BindingSelectionAdapter.prototype.setSelectionMode = function(sSelectionMode) {
		var sOldSelectionMode = this.getSelectionMode();

		SelectionAdapter.prototype.setSelectionMode.apply(this, arguments);

		if (this.getSelectionMode() !== sOldSelectionMode) {
			this.clearSelection();
		}

		return this;
	};

	/**
	 * @override
	 * @inheritDoc
	 */
	BindingSelectionAdapter.prototype._setBinding = function(oBinding) {
		var oCurrentBinding = this._getBinding();
		SelectionAdapter.prototype._setBinding.call(this, oBinding);

		if (oCurrentBinding !== oBinding) {
			if (oBinding) {
				oBinding.attachEvent("change", this._onBindingChange, this);
			}
			if (oCurrentBinding) {
				oCurrentBinding.detachEvent("change", this._onBindingChange);
			}
		}
	};

	/**
	 *
	 * @param {sap.ui.base.Event} oEvent
	 * @private
	 */
	BindingSelectionAdapter.prototype._onBindingChange = function(oEvent) {
		var sReason = typeof (oEvent) === "object" ? oEvent.getParameter("reason") : oEvent;

		if (sReason === "sort" || sReason === "filter") {
			this.clearSelection();
		}
	};

	return BindingSelectionAdapter;
});