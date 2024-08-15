/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/base/ManagedObject",
	"sap/ui/dt/OverlayRegistry",
	"sap/ui/dt/Util",
	"sap/ui/dt/SelectionMode",
	"sap/ui/dt/ElementOverlay"
],
function(
	ManagedObject,
	OverlayRegistry,
	Util,
	SelectionMode,
	ElementOverlay
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
	 */
	var SelectionManager = ManagedObject.extend("sap.ui.dt.SelectionManager", {
		metadata: {
			events: {
				change: {
					parameters: {
						selection: {
							type: "sap.ui.dt.ElementOverlay[]"
						}
					}
				}
			},
			properties: {
				connectedElements: {
					type: "object",
					defaultValue: {}
				}
			}
		}
	});

	function getOverlays(vObjects) {
		return Util.castArray(vObjects)
		// Get overlays
		.map(function(oObject) {
			if (oObject instanceof ElementOverlay) {
				return oObject;
			}

			var oElementOverlay = OverlayRegistry.getOverlay(oObject);
			if (oElementOverlay) {
				return oElementOverlay;
			}
		})
		// Filter out not found overlays & duplicates
		.filter(function(oElementOverlay, iIndex, aSource) {
			return oElementOverlay && aSource.indexOf(oElementOverlay) === iIndex;
		});
	}

	function selectableValidator(aElementOverlays) {
		return aElementOverlays.every(function(oElementOverlay) {
			return oElementOverlay.isSelectable();
		});
	}

	function highlightConnectedOverlay(oElementOverlay, bAdd) {
		var sConnectedElementId = this.getConnectedElements()[oElementOverlay.getAssociation("element")];
		var oConnectedOverlay = OverlayRegistry.getOverlay(sConnectedElementId);
		if (oConnectedOverlay) {
			var sFunctionName = bAdd ? "addStyleClass" : "removeStyleClass";
			oConnectedOverlay[sFunctionName]("sapUiDtOverlaySelected");
		}
	}

	SelectionManager.prototype.init = function() {
		/**
		 * List of selected overlays
		 * @type {sap.ui.dt.ElementOverlay[]}
		 */
		this._aSelection = [];

		/**
		 * List of registered validators
		 * @type {function[]}
		 */
		this._aValidators = [];

		// Standard validator to check whether overlay is selectable
		this.addValidator(selectableValidator);
	};

	SelectionManager.prototype.exit = function() {
		delete this._aSelection;
		delete this._aValidators;
	};

	SelectionManager.prototype.getSelectionMode = function() {
		return this._aSelection.length > 1 ? SelectionMode.Multi : SelectionMode.Single;
	};

	/**
	 * Gets list of currently selected overlays.
	 * @return {sap.ui.dt.ElementOverlay[]} Selected overlays
	 * @public
	 */
	SelectionManager.prototype.get = function() {
		return this._aSelection.slice();
	};

	/**
	 * Replaces current selection with specified list of overlays/controls.
	 * @param {sap.ui.dt.ElementOverlay|sap.ui.dt.ElementOverlay[]|sap.ui.core.Control|sap.ui.core.Control[]|String|String[]} vObjects
	 *     Objects which should be selected can be:
	 *         - a single overlay
	 *         - an array of overlays
	 *         - an element which has an overlay
	 *         - an array of elements
	 *         - a single control ID or Overlay ID
	 *         - an array of control IDs or overlay IDs
	 * @return {boolean} true if selection has changed
	 * @public
	 */
	SelectionManager.prototype.set = function(vObjects) {
		var aElementOverlays = getOverlays(vObjects);
		var bResult = false;

		if (this._validate(aElementOverlays)) {
			var aElementOverlaysToRemove = this.get().filter(function(oElementOverlay) {
				return !aElementOverlays.includes(oElementOverlay);
			});

			bResult = this._remove(aElementOverlaysToRemove) || bResult;
			bResult = this._add(aElementOverlays) || bResult;

			if (bResult) {
				this.fireChange({
					selection: this.get()
				});
			}
		}

		return bResult;
	};

	SelectionManager.prototype._validate = function(aElementOverlays) {
		return this.getValidators().every(function(fnValidator) {
			return fnValidator(aElementOverlays);
		});
	};

	SelectionManager.prototype._add = function(aElementOverlays) {
		var aCurrentSelection = this.get();

		// Filter out already selected overlays
		aElementOverlays = aElementOverlays.filter(function(oElementOverlay) {
			return !aCurrentSelection.includes(oElementOverlay);
		});

		if (aElementOverlays.length) {
			var aNextSelection = aCurrentSelection.concat(aElementOverlays);

			if (this._validate(aNextSelection)) {
				this._aSelection = aNextSelection;

				aElementOverlays.forEach(function(oElementOverlay) {
					oElementOverlay.setSelected(true);
					highlightConnectedOverlay.call(this, oElementOverlay, true);
				}.bind(this));

				return true;
			}
		}

		return false;
	};

	/**
	 * Adds specified overlays/controls to the current selection.
	 * @param {sap.ui.dt.ElementOverlay|sap.ui.dt.ElementOverlay[]|sap.ui.core.Control|sap.ui.core.Control[]|String|String[]} vObjects
	 *     Objects which should be added can be:
	 *         - a single overlay
	 *         - an array of overlays
	 *         - an element which has an overlay
	 *         - an array of elements
	 *         - a single control ID or Overlay ID
	 *         - an array of control IDs or overlay IDs
	 * @return {boolean} true if selection has changed
	 * @public
	 */
	SelectionManager.prototype.add = function(vObjects) {
		if (this._add(getOverlays(vObjects))) {
			this.fireChange({
				selection: this.get()
			});
			return true;
		}
		return false;
	};

	SelectionManager.prototype._remove = function(aElementOverlays) {
		var aCurrentSelection = this.get();

		var aNextSelection = aCurrentSelection.filter(function(oElementOverlay) {
			return !aElementOverlays.includes(oElementOverlay);
		});

		if (aNextSelection.length !== aCurrentSelection.length) {
			this._aSelection = aNextSelection;

			aElementOverlays.forEach(function(oElementOverlay) {
				oElementOverlay.setSelected(false);
				highlightConnectedOverlay.call(this, oElementOverlay, false);
			}.bind(this));

			return true;
		}

		return false;
	};

	/**
	 * Removes specified overlays/controls of the current selection.
	 * @param {sap.ui.dt.ElementOverlay|sap.ui.dt.ElementOverlay[]|sap.ui.core.Control|sap.ui.core.Control[]|String|String[]} vObjects
	 *     Objects which should be added can be:
	 *         - a single overlay
	 *         - an array of overlays
	 *         - an element which has an overlay
	 *         - an array of elements
	 *         - a single control ID or Overlay ID
	 *         - an array of control IDs or overlay IDs
	 * @return {boolean} true if selection has changed
	 * @public
	 */
	SelectionManager.prototype.remove = function(vObjects) {
		if (this._remove(getOverlays(vObjects))) {
			this.fireChange({
				selection: this.get()
			});
			return true;
		}
		return false;
	};

	/**
	 * Resets the current selection.
	 * @returns {boolean} true if completed successfully (if nothing to reset, then FALSE is returned)
	 */
	SelectionManager.prototype.reset = function() {
		return this.remove(this.get());
	};

	/**
	 * Adds a new validator.
	 * @param {function} fnValidator - Validator function which will be invoked during add/set calls
	 */
	SelectionManager.prototype.addValidator = function(fnValidator) {
		if (
			typeof fnValidator === "function"
			&& !this._aValidators.includes(fnValidator)
		) {
			this._aValidators = this._aValidators.concat(fnValidator);
		}
	};

	/**
	 * Removes a specified validator.
	 * @param {function} fnValidator - Validator function to remove
	 */
	SelectionManager.prototype.removeValidator = function(fnValidator) {
		this._aValidators = this._aValidators.filter(function(fnCurrent) {
			return fnValidator !== fnCurrent;
		});
	};

	/**
	 * Gets all registered validators.
	 * @returns {function[]} List of validator functions
	 */
	SelectionManager.prototype.getValidators = function() {
		return this._aValidators.slice();
	};

	/**
	 * Adds hover effect to the specified overlays.
	 * @param {sap.ui.dt.ElementOverlay|sap.ui.dt.ElementOverlay[]|sap.ui.core.Control|sap.ui.core.Control[]|String|String[]} vObjects
	 *     Objects can be:
	 *         - a single overlay
	 *         - an array of overlays
	 *         - an element which has an overlay
	 *         - an array of elements
	 *         - a single control ID or Overlay ID
	 *         - an array of control IDs or overlay IDs
	 */
	SelectionManager.prototype.addHover = function(vObjects) {
		getOverlays(vObjects).forEach(function(oElementOverlay) {
			oElementOverlay.addStyleClass("sapUiDtOverlayHover");
		});
	};

	/**
	 * Removes hover effect from the specified overlays.
	 * @param {sap.ui.dt.ElementOverlay|sap.ui.dt.ElementOverlay[]|sap.ui.core.Control|sap.ui.core.Control[]|String|String[]} vObjects
	 *     Objects can be:
	 *         - a single overlay
	 *         - an array of overlays
	 *         - an element which has an overlay
	 *         - an array of elements
	 *         - a single control ID or Overlay ID
	 *         - an array of control IDs or overlay IDs
	 */
	SelectionManager.prototype.removeHover = function(vObjects) {
		getOverlays(vObjects).forEach(function(oElementOverlay) {
			oElementOverlay.removeStyleClass("sapUiDtOverlayHover");
		});
	};

	return SelectionManager;
});