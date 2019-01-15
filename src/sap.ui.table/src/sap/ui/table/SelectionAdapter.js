/*
 * ${copyright}
 */
sap.ui.define([
	'sap/ui/base/ManagedObject',
	'./library'
], function(
	ManagedObject,
	library
) {

	"use strict";

	var SelectionMode = library.SelectionMode;

	/**
	 * Constructs an instance of sap.ui.table.SelectionAdapter
	 *
	 * @class Implements the selection methods for a Table
	 * @extends sap.ui.base.ManagedObject
	 * @version ${version}
	 * @constructor
	 * @abstract
	 * @private
	 * @alias sap.ui.table.SelectionAdapter
	 */
	var SelectionAdapter = ManagedObject.extend("sap.ui.table.SelectionAdapter", {metadata: {
		properties: {
			/**
			 * Defines whether single or multiple items can be selected
			 */
			selectionMode: {type: "sap.ui.table.SelectionMode", defaultValue: SelectionMode.MultiToggle}
		},
		events: {
			/**
			 * Fires when the selection has been changed
			 */
			selectionChange: {
				parameters: {

					/**
					 * Array of indices whose selection has been changed (either selected or deselected)
					 */
					indices: {type: "int[]"},

					/**
					 * Indicates whether "select all" function is used to select rows
					 */
					selectAll: {type: "boolean"}
				}
			}
		}
    }});

	/**
	 * Sets up the initial values
	 */
	SelectionAdapter.prototype.init = function() {
		this._bSuspended = false;
	};

	/**
	 * Terminates the adapter
	 *
	 * @private
	 */
	SelectionAdapter.prototype.exit = function() {
		this._oBinding = null;
	};

	/**
	 * Adds the given selection interval to the selection.
	 *
	 * @param {int} iIndexFrom Index from which the selection should start
	 * @param {int} iIndexTo Index up to which to select
	 * @abstract
	 * @public
	 */
	SelectionAdapter.prototype.addSelectionInterval = function(iIndexFrom, iIndexTo) {
	};

	/**
	 * Removes the complete selection.
	 *
	 * @public
	 * @abstract
 	 */
	SelectionAdapter.prototype.clearSelection = function() {
	};

	/**
	 * Retrieves the lead selection index.
	 *
	 * @returns {int}
	 * @public
	 * @abstract
	 */
	SelectionAdapter.prototype.getSelectedIndex = function() {
		return -1;
	};

	/**
	 * Zero-based indices of selected items, wrapped in an array. An empty array means "no selection".
	 *
	 * @returns {int[]} an array containing all selected indices.
	 * @public
	 * @abstract
	 */
	SelectionAdapter.prototype.getSelectedIndices = function() {
		return [];
    };

	/**
	 * Returns the number of items that can be selected.
	 *
	 * @returns {int} The number of items that can be selected.
	 * @public
	 * @abstract
	 */
	SelectionAdapter.prototype.getSelectableCount = function() {
		return 0;
	};

	/**
	 * Returns the number items that are selected.
	 *
	 * @returns {int} The number of items that are selected.
	 * @public
	 * @abstract
	 */
	SelectionAdapter.prototype.getSelectedCount = function() {
		return 0;
	};

	/**
	 * Checks whether an index is selectable.
	 *
	 * @param {int} iIndex The index to be checked
	 * @returns {boolean} true if index is selectable, false otherwise
	 * @public
	 * @abstract
	 */
	SelectionAdapter.prototype.isIndexSelectable = function(iIndex) {
		return false;
	};

	/**
	 * Returns if the given index is selected.
	 *
	 * @param {int} iIndex The index for which the selection state should be retrieved.
	 * @returns {boolean} true if the index is selected, false otherwise.
	 * @public
	 * @abstract
	 */
	SelectionAdapter.prototype.isIndexSelected = function(iIndex) {
		return false;
	};

	/**
	 * Removes the given selection interval from the selection. In case of single selection, only <code>iIndexTo</code> is removed from the selection.
	 *
	 * @param {int} iIndexFrom Index from which the deselection should start
	 * @param {int} iIndexTo Index up to which to deselect
	 * @public
	 * @abstract
	 */
	SelectionAdapter.prototype.removeSelectionInterval = function(iIndexFrom, iIndexTo) {
	};

	/**
	 * Selects all indices.
	 *
	 * @public
	 * @abstract
	 */
	SelectionAdapter.prototype.selectAll = function() {
	};

	/**
	 * Sets the selected index
	 *
	 * @param {int} iIndex The index which will be selected (if existing)
	 * @public
	 * @abstract
	 */
	SelectionAdapter.prototype.setSelectedIndex = function(iIndex) {
	};

	/**
	 * Sets the given selection interval as selection. In case of single selection, only <code>iIndexTo</code> is selected.
	 *
	 * @param {int} iIndexFrom Index from which the selection should start
	 * @param {int} iIndexTo Index up to which to select
	 * @public
	 * @abstract
	 */
	SelectionAdapter.prototype.setSelectionInterval = function(iIndexFrom, iIndexTo) {
	};

	SelectionAdapter.prototype.fireSelectionChange = function(mArguments) {
		if (!this._isSuspended()) {
			this.fireEvent("selectionChange", mArguments);
		}
	};

	/**
	 * Gets the binding of the associated table.
	 *
	 * @returns {sap.ui.model.Binding|undefined}
	 * @private
	 */
	SelectionAdapter.prototype._getBinding = function() {
		return this._oBinding;
	};

	/**
	 * Sets the binding of the associated table.
	 *
	 * @param {sap.ui.model.Binding} oBinding
	 * @private
	 */
	SelectionAdapter.prototype._setBinding = function(oBinding) {
		this._oBinding = oBinding;
	};

	/**
	 * Suspends the selectionChange event
	 *
	 * When _bSuspended is true, the selectionChange event is not being fired.
	 *
	 * @private
	 */
	SelectionAdapter.prototype._suspend = function() {
		this._bSuspended = true;
	};

	/**
	 * Resumes the selectionChange event
	 *
	 * When _bSuspended is false, the selectionChange event is being fired
	 *
	 * @private
	 */
	SelectionAdapter.prototype._resume = function() {
		this._bSuspended = false;
	};

	/**
	 * Checks if the selectionChange event is suspended.
	 *
	 * @return {boolean}
	 * @private
	 */
	SelectionAdapter.prototype._isSuspended = function() {
		return this._bSuspended;
	};

	return SelectionAdapter;
});