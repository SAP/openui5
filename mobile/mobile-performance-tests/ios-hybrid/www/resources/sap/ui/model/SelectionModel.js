/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 * 
 * (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

// Provides class sap.ui.model.SelectionModel
jQuery.sap.declare("sap.ui.model.SelectionModel");

jQuery.sap.require("sap.ui.base.EventProvider");


/**
 * Constructs an instance of a sap.ui.model.SelectionModel.
 *
 * @class sap.ui.model.SelectionModel
 * @extends sap.ui.base.Object
 *
 * @author SAP AG
 * @version 1.9.1-SNAPSHOT
 *
 * @param {int} iSelectionMode <code>sap.ui.model.SelectionModel.SINGLE_SELECTION</code> or <code>sap.ui.model.SelectionModel.MULTI_SELECTION</code>
 *
 * @constructor
 * @public
 * @name sap.ui.model.SelectionModel
 */
sap.ui.base.EventProvider.extend("sap.ui.model.SelectionModel", /** @lends sap.ui.model.SelectionModel */ {
	
	constructor : function(iSelectionMode) {
		sap.ui.base.EventProvider.apply(this);
	
		this.iSelectionMode = iSelectionMode || sap.ui.model.SelectionModel.SINGLE_SELECTION;
	
		this.aSelectedIndices = [];
		this.iLeadIndex = -1;
		
		this.fnSort = function(a, b) { return a - b; };
		this.fnSortReverse = function(a, b) { return b - a; };
		
	}

});

/**
 * SelectionMode: Single Selection
 * @public
 */
sap.ui.model.SelectionModel.SINGLE_SELECTION = 0;

/**
 * SelectionMode: Multi Selection
 * @public
 */
sap.ui.model.SelectionModel.MULTI_SELECTION = 1;


/**
 * Returns the current selection mode.
 * @return {int} the current selection mode
 * @public
 */
sap.ui.model.SelectionModel.prototype.getSelectionMode = function() {
	return this.iSelectionMode;
};

/**
 * Sets the selection mode. The following list describes the accepted
 * selection modes:
 * <ul>
 * <li><code>sap.ui.model.SelectionModel.SINGLE_SELECTION</code> -
 *   Only one list index can be selected at a time. In this mode,
 *   <code>setSelectionInterval</code> and <code>addSelectionInterval</code> are
 *   equivalent, both replacing the current selection with the index
 *   represented by the second argument (the "lead").
 * <li><code>sap.ui.model.SelectionModel.MULTI_SELECTION</code> -
 *   In this mode, there's no restriction on what can be selected.
 * </ul>
 *
 * @param iSelectionMode {int} selection mode
 * @public
 */
sap.ui.model.SelectionModel.prototype.setSelectionMode = function(iSelectionMode) {
	this.iSelectionMode = iSelectionMode || sap.ui.model.SelectionModel.SINGLE_SELECTION;
};

/**
 * Returns true if the specified index is selected.
 * @return {boolean} true if the specified index is selected.
 * @public
 */
sap.ui.model.SelectionModel.prototype.isSelectedIndex = function(iIndex) {
	return jQuery.inArray(iIndex, this.aSelectedIndices) !== -1;
};

/**
 * Return the second index argument from the most recent call to
 * setSelectionInterval(), addSelectionInterval() or removeSelectionInterval().
 * @return {int} lead selected index
 * @public
 */
sap.ui.model.SelectionModel.prototype.getLeadSelectedIndex = function() {
	return this.iLeadIndex;
};

/**
 * Set the lead selection index.
 * @param {int} iLeadIndex sets the lead selected index
 * @return {sap.ui.model.SelectionModel} <code>this</code> to allow method chaining
 * @private
 */
sap.ui.model.SelectionModel.prototype.setLeadSelectedIndex = function(iLeadIndex) {
	jQuery.sap.assert(typeof iLeadIndex === "number", "iLeadIndex must be an integer");
	// TODO: do we want to have a specific behavior for the lead selection so
	//       that it could be handled in another way? if yes we should consider
	//       also to rework the dataset which is using this method
	//this.iLeadIndex = iLeadIndex;  
	this.setSelectionInterval(iLeadIndex, iLeadIndex);
	return this;
};


/**
 * Returns the first selected index or -1 if the selection is empty.
 * @return {int} first selected index or -1
 * @private
 */
sap.ui.model.SelectionModel.prototype.getMinSelectionIndex = function() {
	if (this.aSelectedIndices.length > 0) {
		var aIndices = this.aSelectedIndices.sort(this.fnSort);
		return aIndices[0];
	} else {
		return -1;
	}
};

/**
 * Returns the last selected index or -1 if the selection is empty.
 * @return {int} last selected index or -1
 * @private
 */
sap.ui.model.SelectionModel.prototype.getMaxSelectionIndex = function() {
	if (this.aSelectedIndices.length > 0) {
		var aIndices = this.aSelectedIndices.sort(this.fnSortReverse);
		return aIndices[0];
	} else {
		return -1;
	}
};


/**
 * Returns the selected indices as array
 * @return array of selected indices
 * @public
 */
sap.ui.model.SelectionModel.prototype.getSelectedIndices = function() {
	var aIndices = this.aSelectedIndices.sort(this.fnSort);
	return aIndices;
};


/**
 * Changes the selection to be equal to the range <code>iFromIndex</code> and <code>iToIndex</code>
 * inclusive. If <code>iFromIndex</code> is smaller than <code>iToIndex</code>, both parameters are swapped.
 * 
 * In <code>SINGLE_SELECTION</code> selection mode, only <code>iToindex</iToIndex> is used.
 * 
 * If this call results in a change to the current selection, then a  
 * <code>SelectionChanged</code> event is fired.
 *
 * @param {int} iFromIndex one end of the interval.
 * @param {int} iToIndex other end of the interval
 * @return {sap.ui.model.SelectionModel} <code>this</code> to allow method chaining
 * @public
 */
sap.ui.model.SelectionModel.prototype.setSelectionInterval = function(iFromIndex, iToIndex) {
	jQuery.sap.assert(typeof iFromIndex === "number", "iFromIndex must be an integer");
	jQuery.sap.assert(typeof iToIndex === "number", "iToIndex must be an integer");
	
	if (this.iSelectionMode === sap.ui.model.SelectionModel.SINGLE_SELECTION) {
		iFromIndex = iToIndex;
	}
	
	var iFrom = Math.min(iFromIndex, iToIndex);
	var iTo = Math.max(iFromIndex, iToIndex);

	// set new selection range, determine set of changed indices
	var aChangedRowIndices = this.aSelectedIndices.slice();
	var aSelectedIndices = [];
	for (var iIndex = iFrom; iIndex <= iTo; iIndex++) {
		aSelectedIndices.push(iIndex);
		var pos = jQuery.inArray(iIndex, aChangedRowIndices);
		if ( pos === -1 ) {
			aChangedRowIndices.push(iIndex);
		} else {
			aChangedRowIndices.splice(pos, 1);
		}
	}
	this._update(aSelectedIndices, iTo, aChangedRowIndices);
	return this;
};

/**
 * Changes the selection to be the union of the current selection
 * and the range between <code>iFromIndex</code> and <code>iToIndex</code> inclusive.
 * If <code>iFromIndex</code> is smaller than <code>iToIndex</code>, both parameters are swapped.
 * 
 * In <code>SINGLE_SELECTION</code> selection mode, this is equivalent
 * to calling <code>setSelectionInterval</code>, and only the second index
 * is used.
 *
 * If this call results in a change to the current selection or lead selection, then a  
 * <code>SelectionChanged</code> event is fired.
 *
 * @param {int} iFromIndex one end of the interval.
 * @param {int} iToIndex other end of the interval
 * @return {sap.ui.model.SelectionModel} <code>this</code> to allow method chaining
 * @public
 */
sap.ui.model.SelectionModel.prototype.addSelectionInterval = function(iFromIndex, iToIndex) {
	jQuery.sap.assert(typeof iFromIndex === "number", "iFromIndex must be an integer");
	jQuery.sap.assert(typeof iToIndex === "number", "iToIndex must be an integer");
	
	if (this.iSelectionMode === sap.ui.model.SelectionModel.SINGLE_SELECTION) {
		return this.setSelectionInterval(iFromIndex, iToIndex);
	}

	var iFrom = Math.min(iFromIndex, iToIndex);
	var iTo = Math.max(iFromIndex, iToIndex);
	
	var aChangedRowIndices = [];
	var aSelectedIndices = this.aSelectedIndices;

	for (var iIndex = iFrom; iIndex <= iTo; iIndex++) {
		if (jQuery.inArray(iIndex, aSelectedIndices) === -1) {
			aSelectedIndices.push(iIndex);
			aChangedRowIndices.push(iIndex);
		}
	}
	this._update(aSelectedIndices, iTo, aChangedRowIndices);
	return this;
};

/**
 * Changes the selection to be the set difference of the current selection
 * and the indices between <code>iFromIndex</code> and <code>iToIndex</code> inclusive.
 * If <code>iFromIndex</code> is smaller than <code>iToIndex</code>, both parameters are swapped.
 *
 * If the range of removed selection indices includes the current lead selection,
 * then the lead selection will be unset (set to -1).
 *   
 * If this call results in a change to the current selection or lead selection, then a  
 * <code>SelectionChanged</code> event is fired.
 *
 * @param {int} iFromIndex one end of the interval.
 * @param {int} iToIndex other end of the interval
 * @return {sap.ui.model.SelectionModel} <code>this</code> to allow method chaining
 * @public
 */
sap.ui.model.SelectionModel.prototype.removeSelectionInterval = function(iFromIndex, iToIndex) {
	jQuery.sap.assert(typeof iFromIndex === "number", "iFromIndex must be an integer");
	jQuery.sap.assert(typeof iToIndex === "number", "iToIndex must be an integer");
	
	if (this.iSelectionMode === sap.ui.model.SelectionModel.SINGLE_SELECTION) {
		iFromIndex = iToIndex;
	}
	
	var iFrom = Math.min(iFromIndex, iToIndex);
	var iTo = Math.max(iFromIndex, iToIndex);
	
	var aChangedRowIndices = [];
	var aSelectedIndices = this.aSelectedIndices;
	var iLeadIndex = this.iLeadIndex;
	for (var iIndex = iFrom; iIndex <= iTo; iIndex++) {
		var iIndexToRemove = jQuery.inArray(iIndex, aSelectedIndices);
		if (iIndexToRemove > -1) {
			aSelectedIndices.splice(iIndexToRemove, 1);
			aChangedRowIndices.push(iIndex);
		}
		if (iIndex === this.iLeadIndex) {
			iLeadIndex = -1;
		}
	}
	this._update(aSelectedIndices, iLeadIndex, aChangedRowIndices);
	return this;
};


/**
 * Change the selection to the empty set and clears the lead selection.
 * 
 * If this call results in a change to the current selection or lead selection, then a  
 * <code>SelectionChanged</code> event is fired.
 *
 * @return {sap.ui.model.SelectionModel} <code>this</code> to allow method chaining
 * @public
 */
sap.ui.model.SelectionModel.prototype.clearSelection = function() {
	if (this.aSelectedIndices.length > 0 || this.iLeadIndex !== -1 ) {
		this._update([], -1, this.aSelectedIndices.slice());
	}
	return this;
};


/**
 * Attach event-handler <code>fnFunction</code> to the 'selectionChanged' event of this <code>sap.ui.model.SelectionModel</code>.<br/>
 *
 * @param {object}
 *            [oData] The object, that should be passed along with the event-object when firing the event.
 * @param {function}
 *            fnFunction The function to call, when the event occurs. This function will be called on the
 *            oListener-instance (if present) or in a 'static way'.
 * @param {object}
 *            [oListener] Object on which to call the given function. If empty, this Model is used.
 *
 * @return {sap.ui.model.SelectionModel} <code>this</code> to allow method chaining
 * @public
 */
sap.ui.model.SelectionModel.prototype.attachSelectionChanged = function(oData, fnFunction, oListener) {
	this.attachEvent("selectionChanged", oData, fnFunction, oListener);
	return this;
};

/**
 * Detach event-handler <code>fnFunction</code> from the 'selectionChanged' event of this <code>sap.ui.model.SelectionModel</code>.<br/>
 *
 * The passed function and listener object must match the ones previously used for event registration.
 *
 * @param {function}
 *            fnFunction The function to call, when the event occurs.
 * @param {object}
 *            oListener Object on which the given function had to be called.
 * @return {sap.ui.model.SelectionModel} <code>this</code> to allow method chaining
 * @public
 */
sap.ui.model.SelectionModel.prototype.detachSelectionChanged = function(fnFunction, oListener) {
	this.detachEvent("selectionChanged", fnFunction, oListener);
	return this;
};

/**
 * Fire event 'selectionChanged' to attached listeners.
 *
 * Expects following event parameters:
 * <ul>
 * <li>'leadIndex' of type <code>int</code> Lead selection index.</li>
 * <li>'rowIndices' of type <code>int[]</code> Other selected indices (if available)</li>
 * </ul>
 *
 * @param {Map} [mArguments] the arguments to pass along with the event.
 * @return {sap.ui.model.SelectionModel} <code>this</code> to allow method chaining
 * @protected
 */
sap.ui.model.SelectionModel.prototype.fireSelectionChanged = function(mArguments) {
	this.fireEvent("selectionChanged", mArguments);
	return this;
};

/**
 * Updates the selection models selected indices and the lead selection. Finally
 * it notifies the listeners with an array of changed row indices which can 
 * either be removed or added to the selection model.
 * @param {array} selected row indices
 * @param {int} lead selection index
 * @param {array} changed row indices
 * @private
 */
sap.ui.model.SelectionModel.prototype._update = function(aSelectedIndices, iLeadSelection, aChangedRowIndices) {
	
	// create the event parameters with the changed row indices (sorted!)
	var mParams = {
		rowIndices: aChangedRowIndices && aChangedRowIndices.sort(this.fnSort)
	}

	// update the selected indices
	this.aSelectedIndices = aSelectedIndices; // TODO: sorting here could avoid additional sorts in min/max and get 
	
	// update lead selection (in case of removing the lead selection it is -1) 
	if (this.iLeadIndex !== iLeadSelection) {
		this.iLeadIndex = iLeadSelection;
		mParams.leadIndex = iLeadSelection; // or use old selection?
	}
	
	// fire change event 
  if ( aChangedRowIndices.length > 0 || typeof mParams.leadIndex !== "undefined" ) {
		this.fireSelectionChanged( mParams );
	}
	
};
