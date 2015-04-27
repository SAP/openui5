/*!
 * ${copyright}
 */

// Provides class sap.ui.dt.DragManagerNew.
sap.ui.define([
	'jquery.sap.global',
	'sap/ui/dt/Manager',
	'sap/ui/dt/Utils'
],
function(jQuery, Manager, Utils) {
	"use strict";

	/**
	 * Constructor for a new DragManagerNew.
	 *
	 * @param {string} [sId] id for the new object, generated automatically if no id is given 
	 * @param {object} [mSettings] initial settings for the new object
	 *
	 * @class
	 * The DragManagerNew allows to create a set of Overlays above the root elements and
	 * theire public children and manage their events.
	 * @extends sap.ui.core.ManagedObject
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.30
	 * @alias sap.ui.dt.DragManagerNew
	 * @experimental Since 1.30. This class is experimental and provides only limited functionality. Also the API might be changed in future.
	 */

	 // TODO : split in abstract DragManager and ControlDragManager
	var DragManagerNew = Manager.extend("sap.ui.dt.DragManagerNew", /** @lends sap.ui.dt.DragManagerNew.prototype */ {		
		metadata : {
			// ---- object ----

			// ---- control specific ----
			library : "sap.ui.dt",
			properties : {
			},
			associations : {
			},
			events : {
			}
		}
	});

	/*
	 * @override
	 */
	DragManagerNew.prototype.onOverlayCreated = function(oEvent) {
		var oOverlay = oEvent.getParameter("overlay");

		if (this.oDraggedElement) {
			this._activateDroppablesFor(oOverlay);
		}

		oOverlay.attachEvent("dragStart", this._onDragStart, this);
		oOverlay.attachEvent("dragStop", this._onDragStop, this);
		oOverlay.attachEvent("drag", this._onDrag, this);

		oOverlay.attachEvent("dragEnter", this._onDragEnter, this);

		oOverlay.attachEvent("aggregationDragEnter", this._onAggregationDragEnter, this);
		oOverlay.attachEvent("aggregationDragOver", this._onAggregationDragOver, this);
		oOverlay.attachEvent("aggregationDragLeave", this._onAggregationDragLeave, this);
		oOverlay.attachEvent("aggregationDrop", this._onAggregationDrop, this);
	};

	DragManagerNew.prototype._onDragStart = function(oEvent) {
		this._oDraggedOverlay = oEvent.getSource();

		this._activateAllDroppables();
	};

	DragManagerNew.prototype._onDragStop = function(oEvent) {
		delete this._oDraggedOverlay;

		this._deactivateAllDroppables();
	};

	DragManagerNew.prototype._onDrag = function(oEvent) {

	};

	DragManagerNew.prototype._onDragEnter = function(oEvent) {
		var oTargetOverlay = oEvent.getSource();
		if (oTargetOverlay !== this._oDraggedOverlay && oTargetOverlay.getParent().isDroppable()) {
			this._repositionOn(oTargetOverlay);
		}
	};

	DragManagerNew.prototype._onAggregationDragEnter = function(oEvent) {
		var oParentElement = oEvent.getSource().getElementInstance();
		var oDraggedElement = this._oDraggedOverlay.getElementInstance();

		if (oParentElement !== oDraggedElement.getParent()) {
			var sAggregationName = oEvent.getParameter("aggregationName");
			// TODO get mutator
			oParentElement.addAggregation(sAggregationName, oDraggedElement);
		}
	};

	DragManagerNew.prototype._onAggregationDragOver = function(oEvent) {

	};

	DragManagerNew.prototype._onAggregationDragLeave = function(oEvent) {

	};

	DragManagerNew.prototype._onAggregationDrop = function(oEvent) {

	};

	DragManagerNew.prototype._activateAllDroppables = function() {
		this._iterateAllAggregations(this._activateDroppable);
	};

	DragManagerNew.prototype._activateDroppable = function(oAggregationOverlay) {
		oAggregationOverlay.setDroppable(true);
	};

	DragManagerNew.prototype._activateDroppablesFor = function(oOverlay) {
		this._iterateOverlayAggregations(oOverlay, this._activateDroppable);
	};

	DragManagerNew.prototype._deactivateAllDroppables = function() {
		this._iterateAllAggregations(function(oAggregationOverlay) {
				oAggregationOverlay.setDroppable(false);
		});
	};
	
	DragManagerNew.prototype._iterateAllAggregations = function(fn) {	
		var that = this;

		var oDesignTime = this.getDesignTime();
		var aOverlays = oDesignTime.getOverlays();
		jQuery.each(aOverlays, function(iIndex, oOverlay) {
			that._iterateOverlayAggregations(oOverlay, fn);
		});
	};
	
	DragManagerNew.prototype._iterateOverlayAggregations = function(oOverlay, fn) {	
		var aAggregationOverlays = oOverlay.getAggregationOverlays() || [];
		jQuery.each(aAggregationOverlays, function(iIndex, oAggregationOverlay) {
			fn(oAggregationOverlay);
		});
	};

	DragManagerNew.prototype._repositionOn = function(oTargetOverlay) {
		var oDraggedElement = this._oDraggedOverlay.getElementInstance();

		var oTargetElement = oTargetOverlay.getElementInstance();
		var oPublicParent = oTargetOverlay.getPublicParent();
		var sPublicParentAggregationName = oTargetOverlay.getPublicParentAggregationName();

		// TODO : mutator
		var aChildren = oPublicParent.getAggregation(sPublicParentAggregationName) || [];
		var iIndex = aChildren.indexOf(oTargetElement);

		if (iIndex !== -1) {
			// TODO : mutator
			oPublicParent.removeAggregation(sPublicParentAggregationName, oDraggedElement);				
			oPublicParent.insertAggregation(sPublicParentAggregationName, oDraggedElement, iIndex);
		}
	};

	return DragManagerNew;
}, /* bExport= */ true);