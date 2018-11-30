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
			return this;
		}
		var oBinding = this._getBinding();
		//TBA check
		if (oBinding && oBinding.findNode && oBinding.addSelectionInterval) {
			if (this.getSelectionMode() === SelectionMode.Single) {
				iIndexFrom = iIndexTo;
				oBinding.setSelectionInterval(iIndexFrom, iIndexTo);
			}
			oBinding.addSelectionInterval(iIndexFrom, iIndexTo);
		}
		return this;
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

		return this;
	};

	/**
	 * @override
	 * @inheritDoc
	 */
	BindingSelectionAdapter.prototype.getSelectedIndex = function() {
		//when using the treebindingadapter, check if the node is selected
		var oBinding = this._getBinding();

		if (oBinding && oBinding.findNode) {
			return oBinding.getSelectedIndex();
		}
	};

	/**
	 * @override
	 * @inheritDoc
	 */
	BindingSelectionAdapter.prototype.getSelectedIndices = function() {
		var oBinding = this._getBinding();

		if (oBinding && oBinding.findNode && oBinding.getSelectedIndices) {
			/*jQuery.sap.log.warning("When using a TreeTable on a V2 ODataModel, you can also use 'getSelectedContexts' on the underlying TreeBinding," +
					" for an optimised retrieval of the binding contexts of the all selected rows/nodes.");*/
			return oBinding.getSelectedIndices();
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
		//TBA check
		if (oBinding && oBinding.findNode && oBinding.removeSelectionInterval) {
			oBinding.removeSelectionInterval(iIndexFrom, iIndexTo);
		}
		return this;
	};

	/**
	 * @override
	 * @inheritDoc
	 */
	BindingSelectionAdapter.prototype.selectAll = function() {
		if (this.getSelectionMode() === SelectionMode.None) {
			return this;
		}
		//The OData TBA exposes a selectAll function
		var oBinding = this._getBinding();
		if (oBinding && oBinding.selectAll) {
			oBinding.selectAll();
		}

		return this;
	};

	/**
	 * @override
	 * @inheritDoc
	 */
	BindingSelectionAdapter.prototype.setSelectedIndex = function(iIndex) {
		if (this.getSelectionMode() === SelectionMode.None) {
			return this;
		}

		if (iIndex === -1) {
			//If Index eq -1 no item is selected, therefore clear selection is called
			//SelectionModel doesn't know that -1 means no selection
			this.clearSelection();
		}

		var oBinding = this._getBinding();

		if (oBinding && oBinding.findNode && oBinding.setNodeSelection) {
			// set the found node as selected
			oBinding.setSelectedIndex(iIndex);
		}
		return this;
	};

	/**
	 * @override
	 * @inheritDoc
	 */
	BindingSelectionAdapter.prototype.setSelectionInterval = function(iIndexFrom, iIndexTo) {
		if (this.getSelectionMode() === SelectionMode.None) {
			return this;
		}
		//when using the treebindingadapter, check if the node is selected
		var oBinding = this._getBinding();

		if (oBinding && oBinding.findNode && oBinding.setSelectionInterval) {
			if (this.getSelectionMode() === SelectionMode.Single) {
				iIndexFrom = iIndexTo;
			}
			oBinding.setSelectionInterval(iIndexFrom, iIndexTo);
		}

		return this;
	};

	/**
	 * Sets the selection mode. The current selection is lost
	 *
	 * @param {string} sSelectionMode
	 * @public
	 */
	BindingSelectionAdapter.prototype.setSelectionMode = function(sSelectionMode) {
		if (this.getSelectionMode() !== sSelectionMode) {
			this.clearSelection();
		}
		this.setProperty("selectionMode", sSelectionMode, true);

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