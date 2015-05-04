/*!
 * ${copyright}
 */

// Provides class sap.ui.dt.plugin.DragDrop.
sap.ui.define([
	'sap/ui/dt/Plugin',
	'sap/ui/dt/DOMUtil'
],
function(Plugin, DOMUtil) {
	"use strict";

	/**
	 * Constructor for a new DragDrop.
	 *
	 * @param {string} [sId] id for the new object, generated automatically if no id is given 
	 * @param {object} [mSettings] initial settings for the new object
	 *
	 * @class
	 * The DragDrop allows to create a set of Overlays above the root elements and
	 * theire public children and manage their events.
	 * @extends sap.ui.core.ManagedObject
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.30
	 * @alias sap.ui.dt.plugin.DragDrop
	 * @experimental Since 1.30. This class is experimental and provides only limited functionality. Also the API might be changed in future.
	 */
	var DragDrop = Plugin.extend("sap.ui.dt.plugin.DragDrop", /** @lends sap.ui.dt.plugin.DragDrop.prototype */ {		
		metadata : {
			"abstract" : true,
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
	 * @private
	 */
	DragDrop.prototype.init = function() {
		Plugin.prototype.init.apply(this, arguments);

		this._oOverlayDelegate = {
			"onAfterRendering" : this._checkDraggable
		};
	};

	/*
	 * @override
	 */
	// DragDrop.prototype.detachEvents = function(oDesignTime) {
	// 	Plugin.prototype.detachEvents.call(this);

	// 	// var aOverlays = this.oDesignTime
	// };

	/*
	 * @override
	 */
	DragDrop.prototype.registerOverlay = function(oOverlay) {
		oOverlay.addEventDelegate(this._oOverlayDelegate, this);

		oOverlay.attachBrowserEvent("dragstart", this._onDragStart, this);
		oOverlay.attachBrowserEvent("dragend", this._onDragEnd, this);
		oOverlay.attachBrowserEvent("drag", this._onDrag, this);
		oOverlay.attachBrowserEvent("dragover", this._onDragOver, this);
		oOverlay.attachBrowserEvent("dragenter", this._onDragEnter, this);
	};

	/*
	 * @override
	 */
	DragDrop.prototype.registerAggregationOverlay = function(oAggregationOverlay) {
		oAggregationOverlay.attachDroppableChange(this._onAggregationDroppableChange, this);
	};

	/*
	 * @override
	 */
	DragDrop.prototype.deregisterOverlay = function(oOverlay) {
	
		oOverlay.removeEventDelegate(this._oOverlayDelegate, this);

		oOverlay.detachBrowserEvent("dragstart", this._onDragStart, this);
		oOverlay.detachBrowserEvent("dragend", this._onDragEnd, this);
		oOverlay.detachBrowserEvent("drag", this._onDrag, this);
		oOverlay.detachBrowserEvent("dragenter", this._onDragEnter, this);

	};	

	/*
	 * @override
	 */
	DragDrop.prototype.deregisterAggregationOverlay = function(oAggregationOverlay) {
		oAggregationOverlay.detachDroppableChange(this._onAggregationDroppableChange, this);
	};

	/*
	 * @protected
	 */
	DragDrop.prototype.onDragStart = function(oDraggedOverlay, oEvent) { };

	/*
	 * @protected
	 */
	DragDrop.prototype.onDragEnd = function(oDraggedOverlay, oEvent) { };

	/*
	 * @protected
	 */
	DragDrop.prototype.onDrag = function(oDraggedOverlay, oEvent) { };

	/*
	 * @protected
	 */
	DragDrop.prototype.onDragEnter = function(oOverlay, oEvent) { };

	/*
	 * @protected
	 */
	DragDrop.prototype.onDragOver = function(oOverlay, oEvent) { };

	/*
	 * @protected
	 */
	DragDrop.prototype.onAggregationDragEnter = function(oAggregationOverlay, oEvent) { };

	/*
	 * @protected
	 */
	DragDrop.prototype.onAggregationDragOver = function(oAggregationOverlay, oEvent) { };

	/*
	 * @protected
	 */
	DragDrop.prototype.onAggregationDragLeave = function(oAggregationOverlay, oEvent) { };

	/*
	 * @protected
	 */
	DragDrop.prototype.onAggregationDrop = function(oAggregationOverlay, oEvent) { };

	/*
	 * @private
	 */
	DragDrop.prototype._checkDraggable = function(oEvent) {
		var oOverlay = oEvent.srcControl;
		if (oOverlay.isDraggable()) {
			DOMUtil.setDraggable(oOverlay.$(), true);
		}
	};

	/*
	 * @private
	 */
	DragDrop.prototype._onDragStart = function(oEvent) {
		var oOverlay = sap.ui.getCore().byId(oEvent.currentTarget.id);
		this.onDragStart(oOverlay, oEvent);

		oEvent.stopPropagation();
		return true;
	};

	/*
	 * @private
	 */
	DragDrop.prototype._onDragEnd = function(oEvent) {
		var oOverlay = sap.ui.getCore().byId(oEvent.currentTarget.id);
		this.onDragEnd(oOverlay, oEvent);

		oEvent.stopPropagation();
		return true;
	};

	/*
	 * @private
	 */
	DragDrop.prototype._onDrag = function(oEvent) {
		var oOverlay = sap.ui.getCore().byId(oEvent.currentTarget.id);
		this.onDrag(oOverlay, oEvent);

		oEvent.stopPropagation();
		return true;
	};

	/*
	 * @private
	 */
	DragDrop.prototype._onDragEnter = function(oEvent) {
		var oOverlay = sap.ui.getCore().byId(oEvent.currentTarget.id);
		this.onDragEnter(oOverlay, oEvent);

		oEvent.preventDefault();
		oEvent.stopPropagation();
		return false;
	};

	/*
	 * @private
	 */
	DragDrop.prototype._onDragOver = function(oEvent) {
		var oOverlay = sap.ui.getCore().byId(oEvent.currentTarget.id);
		this.onDragOver(oOverlay, oEvent);

		oEvent.preventDefault();
		oEvent.stopPropagation();
		return false;
	};
	/*
	 * @private
	 */
	DragDrop.prototype._onAggregationDroppableChange = function(oEvent) {
		var oAggregationOverlay = oEvent.getSource();
		var bDroppable = oEvent.getParameter("droppable");

		if (bDroppable) {
			this._attachAggregationOverlayEvents(oAggregationOverlay);
		} else {
			this._detachAggregationOverlayEvents(oAggregationOverlay);
		}

	};

	/*
	 * @private
	 */
	DragDrop.prototype._attachAggregationOverlayEvents = function(oAggregationOverlay) {
		oAggregationOverlay.attachBrowserEvent("dragenter", this._onAggregationDragEnter, this);
		oAggregationOverlay.attachBrowserEvent("dragover", this._onAggregationDragOver, this);
		oAggregationOverlay.attachBrowserEvent("dragleave", this._onAggregationDragLeave, this);
		oAggregationOverlay.attachBrowserEvent("drop", this._onAggregationDrop, this);
	};		

	/*
	 * @private
	 */
	DragDrop.prototype._detachAggregationOverlayEvents = function(oAggregationOverlay) {
		oAggregationOverlay.detachBrowserEvent("dragenter", this._onAggregationDragEnter, this);
		oAggregationOverlay.detachBrowserEvent("dragover", this._onAggregationDragOver, this);
		oAggregationOverlay.detachBrowserEvent("dragleave", this._onAggregationDragLeave, this);
		oAggregationOverlay.detachBrowserEvent("drop", this._onAggregationDrop, this);
	};		

	/*
	 * @private
	 */
	DragDrop.prototype._onAggregationDragEnter = function(oEvent) {
		var oAggregationOverlay = sap.ui.getCore().byId(oEvent.currentTarget.id);
		this.onAggregationDragEnter(oAggregationOverlay, oEvent);

		oEvent.preventDefault();
		oEvent.stopPropagation();
		return false;
	};

	/*
	 * @private
	 */
	DragDrop.prototype._onAggregationDragOver = function(oEvent) {
		var oAggregationOverlay = sap.ui.getCore().byId(oEvent.currentTarget.id);
		this.onAggregationDragOver(oAggregationOverlay, oEvent);

		oEvent.preventDefault();
		oEvent.stopPropagation();
		return false;
	};

	/*
	 * @private
	 */
	DragDrop.prototype._onAggregationDragLeave = function(oEvent) {
		var oAggregationOverlay = sap.ui.getCore().byId(oEvent.currentTarget.id);
		this.onAggregationDragLeave(oAggregationOverlay, oEvent);

		oEvent.preventDefault();
		oEvent.stopPropagation();
		return false;
	};

	/*
	 * @private
	 */
	DragDrop.prototype._onAggregationDrop = function(oEvent) {
		var oAggregationOverlay = sap.ui.getCore().byId(oEvent.currentTarget.id);
		this.onAggregationDrop(oAggregationOverlay, oEvent);

		oEvent.stopPropagation();
		return false;
	};

	return DragDrop;
}, /* bExport= */ true);