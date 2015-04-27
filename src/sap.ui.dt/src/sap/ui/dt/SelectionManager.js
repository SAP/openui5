/*!
 * ${copyright}
 */

// Provides class sap.ui.dt.SelectionManager.
sap.ui.define([
	'jquery.sap.global',
	'sap/ui/dt/Manager',
	'sap/ui/dt/Utils'
],
function(jQuery, Manager, Utils) {
	"use strict";

	/**
	 * Constructor for a new SelectionManager.
	 *
	 * @param {string} [sId] id for the new object, generated automatically if no id is given 
	 * @param {object} [mSettings] initial settings for the new object
	 *
	 * @class
	 * The SelectionManager allows to create a set of Overlays above the root elements and
	 * theire public children and manage their events.
	 * @extends sap.ui.core.ManagedObject
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.30
	 * @alias sap.ui.dt.SelectionManager
	 * @experimental Since 1.30. This class is experimental and provides only limited functionality. Also the API might be changed in future.
	 */

	 // TODO : split in abstract DragManager and ControlDragManager
	var SelectionManager = Manager.extend("sap.ui.dt.SelectionManager", /** @lends sap.ui.dt.SelectionManager.prototype */ {		
		metadata : {
			// ---- object ----

			// ---- control specific ----
			library : "sap.ui.dt",
			properties : {
				multipleSelection : {
					type : "boolean"
				}
			},
			associations : {
			},
			events : {
			}
		}
	});

	/*
	 * @private
	 */
	SelectionManager.prototype.init = function() {
		Manager.prototype.init();

		this._aSelectedOverlays = [];
	};

	/*
	 * @override
	 */
	SelectionManager.prototype.onOverlayCreated = function(oEvent) {
		var oOverlay = oEvent.getParameter("overlay");

		oOverlay.addEventDelegate({
			"onclick" : this._onClick
		}, oOverlay);
		oOverlay.attachEvent("selectionChange", this._onSelectionChange, this);
	};

	/*
	 * @private
	 */
	SelectionManager.prototype._onClick = function(oEvent) {
		this.setSelected(!this.getSelected());

		oEvent.preventDefault();
		oEvent.stopPropagation();
	};

	/*
	 * @private
	 */
	SelectionManager.prototype._onSelectionChange = function(oEvent) {
		var oOverlay = oEvent.getSource();
		var bSelected = oEvent.getParameter("selected");

		if (bSelected) {
			if (this._aSelectedOverlays.length && !this.getMultipleSelection()) {
				jQuery.each(this._aSelectedOverlays, function(iIndex, oOverlay) {
					oOverlay.setSelected(false);
				});
			}
			this._aSelectedOverlays.push(oOverlay);
		} else {
			if (this._aSelectedOverlays.length) {
				var iIndex = this._aSelectedOverlays.indexOf(oOverlay);
				this._aSelectedOverlays.splice(iIndex, 1);
			}
		}
	};

	/*
	 * @public
	 */
	SelectionManager.prototype.getSelection = function() {
		return this._aSelectedOverlays;
	};

	return SelectionManager;
}, /* bExport= */ true);