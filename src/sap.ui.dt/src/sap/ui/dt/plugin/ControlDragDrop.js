/*
 * ! ${copyright}
 */

// Provides class sap.ui.dt.plugin.ControlDragDrop.
sap.ui.define([
	"sap/ui/dt/plugin/DragDrop",
	"sap/ui/dt/plugin/ElementMover"
], function(
	DragDrop,
	ElementMover
) {
	"use strict";

	/**
	 * Constructor for a new ControlDragDrop.
	 *
	 * @param {string}
	 *          [sId] id for the new object, generated automatically if no id is given
	 * @param {object}
	 *          [mSettings] initial settings for the new object
	 * @class The ControlDragDrop enables D&D functionality for the overlays based on aggregation types
	 * @extends sap.ui.dt.plugin.DragDrop
	 * @author SAP SE
	 * @version ${version}
	 * @constructor
	 * @private
	 * @since 1.30
	 * @alias sap.ui.dt.plugin.ControlDragDrop
	 * @experimental Since 1.30. This class is experimental and provides only limited functionality. Also the API might be
	 *               changed in future.
	 */
	var ControlDragDrop = DragDrop.extend("sap.ui.dt.plugin.ControlDragDrop", /** @lends sap.ui.dt.plugin.ControlDragDrop.prototype */ {
		metadata : {
			// ---- control specific ----
			library : "sap.ui.dt",
			properties : {
				draggableTypes : {
					type : "string[]",
					defaultValue : ["sap.ui.core.Element"]
				},
				elementMover : {
					type : "any" // "sap.ui.dt.plugin.ElementMover"
				},
				insertAfterElement: {
					type: "boolean",
					defaultValue: false
				}
			},
			associations : {}
		}
	});

	var sDROP_ZONE_STYLE = "sapUiDtOverlayDropZone";

	ControlDragDrop.prototype.init = function() {
		DragDrop.prototype.init.apply(this, arguments);
		this.setElementMover(new ElementMover());
	};

	/**
	 * @override
	 */
	ControlDragDrop.prototype.setElementMover = function(oNewElementMover) {
		var oOldMover = this.getElementMover();
		if (oOldMover !== oNewElementMover) {
			if (oOldMover) {
				oOldMover.destroy();
			}
			this.setProperty("elementMover", oNewElementMover);
		}
	};

	/**
	 * @override
	 */
	ControlDragDrop.prototype.setDraggableTypes = function(aDraggableTypes) {
		this.getElementMover().setMovableTypes(aDraggableTypes);
		return this.setProperty("draggableTypes", aDraggableTypes);
	};

	/**
	 * @override
	 */
	ControlDragDrop.prototype.registerElementOverlay = function(oOverlay) {
		var oElement = oOverlay.getElement();
		this.getElementMover().checkMovable(oOverlay)
			.then(function(bMovable) {
				if (
					this.getElementMover().isMovableType(oElement)
					&& bMovable
				) {
					oOverlay.setMovable(true);
				}
				if (this.oDraggedElement) {
					this.getElementMover().activateTargetZonesFor(oOverlay, sDROP_ZONE_STYLE);
				}
				DragDrop.prototype.registerElementOverlay.call(this, oOverlay);
			}.bind(this));
	};

	/**
	 * @override
	 */
	ControlDragDrop.prototype.deregisterElementOverlay = function(oOverlay) {
		DragDrop.prototype.deregisterElementOverlay.apply(this, arguments);
		oOverlay.setMovable(false);

		if (this.oDraggedElement) {
			this.getElementMover().deactivateTargetZonesFor(oOverlay, sDROP_ZONE_STYLE);
		}
	};

	/**
	 * returns the dragged overlay (only during drag&drop)
	 *
	 * @public
	 * @return {sap.ui.dt.Overlay} overlays which is dragged
	 */
	ControlDragDrop.prototype.getDraggedOverlay = function() {
		return this._oDraggedOverlay;
	};

	/**
	 * @override
	 */
	ControlDragDrop.prototype.onDragStart = function(oOverlay) {
		this._oDraggedOverlay = oOverlay;
		this.getElementMover().setMovedOverlay(oOverlay);

		this.getElementMover().activateAllValidTargetZones(this.getDesignTime(), sDROP_ZONE_STYLE);
	};

	/**
	 * @override
	 */
	ControlDragDrop.prototype.onDragEnd = function() {
		delete this._oPreviousTarget;
		this.getElementMover().deactivateAllTargetZones(this.getDesignTime(), sDROP_ZONE_STYLE);
		delete this._oDraggedOverlay;
		this.getElementMover().setMovedOverlay(null);
	};

	/**
	 * @override
	 */
	ControlDragDrop.prototype.onDragEnter = function(oTargetOverlay) {
		var oDraggedOverlay = this.getDraggedOverlay();
		if (oTargetOverlay.getElement() !== oDraggedOverlay.getElement()
				&& oTargetOverlay !== this._oPreviousTarget) {
			this.getElementMover().repositionOn(oDraggedOverlay, oTargetOverlay, this.getInsertAfterElement());
		}
		this._oPreviousTarget = oTargetOverlay;
	};

	/**
	 * @override
	 */
	ControlDragDrop.prototype.onAggregationDragEnter = function(oAggregationOverlay) {
		delete this._oPreviousTarget;

		var oDraggedOverlay = this.getDraggedOverlay();
		this.getElementMover().insertInto(oDraggedOverlay, oAggregationOverlay, this.getInsertAfterElement());
	};

	return ControlDragDrop;
});
