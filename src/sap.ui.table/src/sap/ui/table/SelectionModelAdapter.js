/*
 * ${copyright}
 */
sap.ui.define([
	'sap/ui/model/SelectionModel',
	'./SelectionAdapter',
	'./library'
], function(
	SelectionModel,
	SelectionAdapter,
	library
) {

	"use strict";

	var SelectionMode = library.SelectionMode;

	/**
	 * Constructs an instance of sap.ui.table.SelectionModelAdapter
	 *
	 * @class Implements the selection methods for a Table
	 * @extends sap.ui.table.SelectionAdapter
	 * @version ${version}
	 * @constructor
	 * @private
	 * @alias sap.ui.table.SelectionModelAdapter
	 */
	var SelectionModelAdapter = SelectionAdapter.extend("sap.ui.table.SelectionModelAdapter");

	/**
	 * Initialization of the SelectionModelAdapter
	 * @public
	 */
	SelectionModelAdapter.prototype.init = function() {
		this.oSelectionModel = new SelectionModel(this.getSelectionMode);
		this.oSelectionModel.attachEvent("selectionChanged", this._onSelectionChange, this);

		SelectionAdapter.prototype.init.call(this);
	};

	/**
	 * @override
	 * @inheritDoc
	 */
	SelectionModelAdapter.prototype.exit = function() {
		var oBinding = this._getBinding();
		if (oBinding) {
			oBinding.detachEvent("change", this._onBindingChange);
		}
		if (this.oSelectionModel) {
			this.oSelectionModel.destroy();
			this.oSelectionModel = null;
		}
		SelectionAdapter.prototype.exit.call(this);
	};

	/**
	 * @override
	 * @inheritDoc
	 */
	SelectionModelAdapter.prototype.addSelectionInterval = function(iIndexFrom, iIndexTo) {
		if (!this.oSelectionModel || this.getSelectionMode() === SelectionMode.None) {
			return;
		}
		this.oSelectionModel.addSelectionInterval(iIndexFrom, iIndexTo);
	};

	/**
	 * @override
	 * @inheritDoc
	 */
	SelectionModelAdapter.prototype.clearSelection = function() {
		if (this.oSelectionModel) {
			this.oSelectionModel.clearSelection();
		}
	};

	/**
	 * @override
	 * @inheritDoc
	 */
	SelectionModelAdapter.prototype.getSelectedIndex = function() {
		if (this.oSelectionModel) {
			return this.oSelectionModel.getLeadSelectedIndex();
		}
		return -1;
	};

	/**
	 * @override
	 * @inheritDoc
	 */
	SelectionModelAdapter.prototype.getSelectedIndices = function() {
		if (this.oSelectionModel) {
			return this.oSelectionModel.getSelectedIndices();
		}
		return [];
	};

	/**
	 * @override
	 * @inheritDoc
	 */
	SelectionModelAdapter.prototype.getSelectableCount = function() {
		var oBinding = this._getBinding();
		return oBinding ? oBinding.getLength() : 0;
	};

	/**
	 * @override
	 * @inheritDoc
	 */
	SelectionModelAdapter.prototype.getSelectedCount = function() {
		return this.getSelectedIndices().length;
	};

	/**
	 * @override
	 * @inheritDoc
	 */
	SelectionModelAdapter.prototype.isIndexSelectable = function(iIndex) {
		var iCount = this._getLastIndex();
		return iIndex >= 0 && iIndex <= iCount;
	};

	/**
	 * @override
	 * @inheritDoc
	 */
	SelectionModelAdapter.prototype.isIndexSelected = function(iIndex) {
		return this.getSelectedIndices().indexOf(iIndex) !== -1;
	};

	/**
	 * @override
	 * @inheritDoc
	 */
	SelectionModelAdapter.prototype.removeSelectionInterval = function(iIndexFrom, iIndexTo) {
		if (this.oSelectionModel) {
			this.oSelectionModel.removeSelectionInterval(iIndexFrom, iIndexTo);
		}
	};

	/**
	 * @override
	 * @inheritDoc
	 */
	SelectionModelAdapter.prototype.selectAll = function() {
		if (!this.oSelectionModel || this.getSelectionMode() === SelectionMode.None) {
			return;
		}
		this.oSelectionModel.selectAll(this._getLastIndex());
	};

	/**
	 * @override
	 * @inheritDoc
	 */
	SelectionModelAdapter.prototype.setSelectedIndex = function(iIndex) {
		if (this.getSelectionMode() === SelectionMode.None) {
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
	SelectionModelAdapter.prototype.setSelectionInterval = function(iIndexFrom, iIndexTo) {
		if (!this.oSelectionModel || this.getSelectionMode() === SelectionMode.None) {
			return;
		}
		this.oSelectionModel.setSelectionInterval(iIndexFrom, iIndexTo);
	};

	/**
	 * Sets the selection mode. The current selection is lost.
	 *
	 * @param {string} sSelectionMode The new selection mode.
	 * @returns {sap.ui.table.SelectionModelAdapter} Reference to <code>this</code> in order to allow method chaining
	 * @public
	 */
	SelectionModelAdapter.prototype.setSelectionMode = function(sSelectionMode) {
		var sOldSelectionMode = this.getSelectionMode();

		SelectionAdapter.prototype.setSelectionMode.apply(this, arguments);

		if (this.getSelectionMode() !== sOldSelectionMode) {
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
	SelectionModelAdapter.prototype._getLastIndex = function() {
		if (!this._getBinding()) {
			return 0;
		}
		return this._getBinding().getLength() - 1;
	};

	/**
	 * Fires the selectionChange event
	 *
	 * @param {sap.ui.base.Event} oEvent
	 * @private
	 */
	SelectionModelAdapter.prototype._onSelectionChange = function(oEvent) {
		var aRowIndices = oEvent.getParameter("rowIndices");
		var bSelectAll = oEvent.getParameter("selectAll");

		this.fireSelectionChange({
			rowIndices: aRowIndices,
			selectAll: bSelectAll
		});
	};

	/**
	 * Sets the binding of the associated table.
	 *
	 * @override
	 * @param {sap.ui.model.Binding} oBinding
	 * @private
	 */
	SelectionModelAdapter.prototype._setBinding = function(oBinding) {
		var oCurrentBinding = this._getBinding();
		SelectionAdapter.prototype._setBinding.call(this, oBinding);

		if (oCurrentBinding !== oBinding) {
			this._suspend();
			this.clearSelection();
			this._resume();
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
	SelectionModelAdapter.prototype._onBindingChange = function(oEvent) {
		var sReason = typeof (oEvent) === "object" ? oEvent.getParameter("reason") : oEvent;

		if (sReason === "sort" || sReason === "filter") {
			this.clearSelection();
		}
	};

	return SelectionModelAdapter;
});