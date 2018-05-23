/*!
 * ${copyright}
 */

// Provides class sap.ui.dt.SelectionManager.
sap.ui.define([
	'sap/ui/base/ManagedObject',
	'sap/ui/dt/OverlayRegistry',
	'sap/ui/dt/Util',
	'sap/ui/base/Object',
	'./library'
],
function(
	ManagedObject,
	OverlayRegistry,
	Util,
	BaseObject
) {
	"use strict";

	/**
	 * Constructor for a new SelectionManager.
	 *
	 * @param {string} [sId] id for the new object, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new object
	 *
	 * @class
	 * The Selection Manager is used to manage the selection of overlays. Overlays and Elements
	 * with overlays can be added to / removed from the current selection.
	 * @extends sap.ui.base.ManagedObject
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @private
	 * @since 1.54
	 * @alias sap.ui.dt.SelectionManager
	 * @experimental Since 1.54. This class is experimental and provides only limited functionality. Also the API might be changed in future.
	 */
	var SelectionManager = ManagedObject.extend("sap.ui.dt.SelectionManager", /** @lends sap.ui.dt.SelectionManager.prototype */ {
		metadata : {
			// ---- object ----

			// ---- control specific ----
			library : "sap.ui.dt",
			aggregations : {},
			events : {
				"change" : {
					parameters : {
						selection : { type : "sap.ui.dt.Overlay[]" }
					}
				}
			}
		}
	});

	/**
	 * @override
	 */
	SelectionManager.prototype.init = function() {
		this._aSelection = [];
	};

	/**
	 * @override
	 */
	SelectionManager.prototype.exit = function() {
		delete this._aSelection;
	};

	/**
	 * @public
	 * @return {sap.ui.dt.Overlay[]} selected overlays
	 */
	SelectionManager.prototype.get = function() {
		return this._aSelection.slice();
	};

	/**
	 * Selects one or more Overlays/Elements
	 * Clears the current selection before selecting new objects
	 * @param	{object}	vSelection	Objects, which should be selected
	 * can be a single overlay (sap.ui.dt.Overlay)
	 * or an array of overlays
	 * or an element, which has an overlay
	 * or an array of elements
	 * @return {boolean} Return true if selection has changed
	 * @public
	 */
	SelectionManager.prototype.set = function(vSelection) {
		var bSelectionChanged = false;
		var bAddedSelection = false;

		// nothing selected, no parameter => nothing to do
		if (this._aSelection.length == 0 && !vSelection){
			return bSelectionChanged;
		}

		// first delete current selection
		this._aSelection.forEach(function(oOverlay) {
			oOverlay.setSelected(false, true);
			bSelectionChanged = true;
		}, this);
		this._aSelection = [];

		// add selection if parameter provided
		if (vSelection){
			bAddedSelection = this.add(Util.castArray(vSelection));
		}

		// return if sometning added to avoid firing event twice
		if (bAddedSelection){
			return bAddedSelection;
		} else if (bSelectionChanged){
			// Selection has changed, fire event
			this.fireChange({
				selection : this.get()
			});
		}
		return bSelectionChanged;
	};

	/**
	 * Adds one or more Overlays/Elements to the current selection
	 * @param	{object}	vSelection	Objects, which should be added;
	 * can be a single overlay (sap.ui.dt.Overlay)
	 * or an array of overlays
	 * or an element, which has an overlay
	 * or an array of elements
	 * @return {boolean} Return true if selection has changed
	 * @public
	 */
	SelectionManager.prototype.add = function(vSelection) {
		var bSelectionChanged = false;

		// do nothing if no parameter provided
		if (!vSelection){
			return bSelectionChanged;
		}

		var aSelection = Util.castArray(vSelection);

		// add the overlay(s) to the current selection
		aSelection.forEach(function(oSelection){
			var oOverlay = null;
			oOverlay = OverlayRegistry.getOverlay(oSelection);
			// check if already selected
			if (oOverlay && (this._aSelection.indexOf(oOverlay) === -1)) {
				if (oOverlay.setSelected(true, true).getSelected()){
					this._aSelection.push(oOverlay);
					bSelectionChanged = true;
				}
			}
		}, this);
		// fire event if selection changed
		if (bSelectionChanged){
			this.fireChange({
				selection : this.get()
			});
		}
		return bSelectionChanged;
	};

	/**
	 * Removes one or more Overlays/Elements from the current selection
	 * @param	{object}	vSelection	Objects, which should be removed
	 * can be a single overlay (sap.ui.dt.Overlay)
	 * or an array of overlays
	 * or an element, which has an overlay
	 * or an array of elements
	 * @return {boolean} Return true if selection has changed
	 * @public
	 */
	SelectionManager.prototype.remove = function(vSelection) {
		var bSelectionChanged = false;

		// do nothing if no parameter provided
		if (!vSelection){
			return bSelectionChanged;
		}

		var aSelection = Util.castArray(vSelection);

		// remove the overlay(s) from the current selection
		aSelection.forEach(function(oRemovedItem){
			this._aSelection = this._aSelection.filter(function(oSelectedOverlay){
				var bRemoved = false;
				// Existing Overlay or Element
				var oOverlay = OverlayRegistry.getOverlay(oRemovedItem);
				if (!oOverlay){
					// Destroyed Overlay
					var oOverlay = BaseObject.isA(oRemovedItem, 'sap.ui.dt.ElementOverlay') ? oRemovedItem : undefined;
					if (!oOverlay){
						// Destroyed Element
						bRemoved = oRemovedItem === oSelectedOverlay.getElement().getId();
					}
				}
				if (!bRemoved){
					bRemoved = oOverlay === oSelectedOverlay;
				}
				if (bRemoved){
					oSelectedOverlay.setSelected(false, true);
					bSelectionChanged = true;
				}
				return !bRemoved;
			});
		}, this);
		// fire event if selection changed
		if (bSelectionChanged){
			this.fireChange({
				selection : this.get()
			});
		}
		return bSelectionChanged;
	};

	return SelectionManager;
}, /* bExport= */ true);