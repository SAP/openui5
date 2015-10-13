/*
 * ! ${copyright}
 */

// Provides class sap.ui.dt.plugin.CutPaste.
sap.ui.define([
	'sap/ui/dt/Plugin', 'sap/ui/dt/plugin/ElementMover', 'sap/ui/dt/OverlayUtil'
], function(Plugin, ElementMover, OverlayUtil) {
	"use strict";

	/**
	 * Constructor for a new CutPaste.
	 * 
	 * @param {string} [sId] id for the new object, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new object
	 * @class The CutPaste enables Cut & Paste functionality for the overlays based on aggregation types
	 * @extends sap.ui.dt.Plugin"
	 * @author SAP SE
	 * @version ${version}
	 * @constructor
	 * @private
	 * @since 1.34
	 * @alias sap.ui.dt.plugin.CutPaste
	 * @experimental Since 1.34. This class is experimental and provides only limited functionality. Also the API might be changed in future.
	 */
	var CutPaste = Plugin.extend("sap.ui.dt.plugin.CutPaste", /** @lends sap.ui.dt.plugin.CutPaste.prototype */
	{
		metadata: {
			// ---- object ----

			// ---- control specific ----
			library: "sap.ui.dt",
			properties: {
				movableTypes: {
					type: "string[]",
					defaultValue: [
						"sap.ui.core.Element"
					]
				},
				elementMover: {
					type: "sap.ui.dt.plugin.ElementMover"
				}
			},
			associations: {},
			events: {
				elementMoved: {}
			}
		}
	});

	CutPaste.prototype.init = function() {
		this.setElementMover(new ElementMover());
	};

	/**
	 * @override
	 */
	CutPaste.prototype.registerElementOverlay = function(oOverlay) {
		var oElement = oOverlay.getElementInstance();
		oOverlay.attachBrowserEvent("keydown", this._onKeyDown, this);
		if (this.getElementMover().isMovableType(oElement) && this.getElementMover().checkMovable(oOverlay)) {
			oOverlay.setMovable(true);
		}

		if (this.getElementMover().getMovedOverlay()) {
			this.getElementMover().activateTargetZonesFor(this.getElementMover().getMovedOverlay());
		}
	};

	/**
	 * @override
	 */
	CutPaste.prototype.deregisterElementOverlay = function(oOverlay) {
		oOverlay.setMovable(false);
		oOverlay.detachBrowserEvent("keydown", this._onKeyDown, this);

		if (this.getElementMover().getMovedOverlay()) {
			this.getElementMover().deactivateTargetZonesFor(this.getElementMover().getMovedOverlay());
		}
	};

	CutPaste.prototype.setMovableTypes = function(aMovableTypes) {
		this.getElementMover().setMovableTypes(aMovableTypes);
		return this.setProperty("movableTypes", aMovableTypes);
	};

	CutPaste.prototype.setElementMover = function(oElementMover) {
		oElementMover.setMovableTypes(this.getMovableTypes());
		return this.setProperty("elementMover", oElementMover);
	};

	CutPaste.prototype.getCuttedOverlay = function() {
		return this.getElementMover().getMovedOverlay();
	};

	CutPaste.prototype._onKeyDown = function(oEvent) {
		var oOverlay = sap.ui.getCore().byId(oEvent.currentTarget.id);

		if ((oEvent.keyCode === jQuery.sap.KeyCodes.X) && (oEvent.shiftKey === false) && (oEvent.altKey === false) && (oEvent.ctrlKey === true)) {
			// CTRL+X
			this._onCut(oOverlay);
			oEvent.stopPropagation();
		} else if ((oEvent.keyCode === jQuery.sap.KeyCodes.V) && (oEvent.shiftKey === false) && (oEvent.altKey === false) && (oEvent.ctrlKey === true)) {
			// CTRL+V
			this._onPaste(oOverlay);
			oEvent.stopPropagation();
		} else if (oEvent.keyCode === jQuery.sap.KeyCodes.ESCAPE) {
			// ESC
			this._stopCutAndPaste();
			oEvent.stopPropagation();
		}
	};

	CutPaste.prototype._onCut = function(oOverlay) {
		this._stopCutAndPaste();

		var bMovable = this.getElementMover().isMovableType(oOverlay.getElementInstance());
		if (bMovable) {
			this.getElementMover().setMovedOverlay(oOverlay);
			oOverlay.addStyleClass("sapUiDtOverlayCutted");

			this.getElementMover().activateAllValidTargetZones(this.getDesignTime());
		}
	};

	CutPaste.prototype._onPaste = function(oTargetOverlay) {
		var oCutOverlay = this.getElementMover().getMovedOverlay();
		if (!oCutOverlay) {
			return;
		}
		if (!this._isForSameElement(oCutOverlay, oTargetOverlay)) {

			var oTargetZoneAggregation = this._getTargetZoneAggregation(oTargetOverlay);
			if (oTargetZoneAggregation) {
				this.getElementMover().insertInto(oCutOverlay, oTargetZoneAggregation);
			} else {
				if (OverlayUtil.isInTargetZoneAggregation(oTargetOverlay)) {
					this.getElementMover().repositionOn(oCutOverlay, oTargetOverlay);
				} else {
					return;
				}
			}

			var oMoveEvent = this.getElementMover().buildMoveEvent();
			this.fireElementMoved({
				data: oMoveEvent
			});
			oCutOverlay.focus();
			this._stopCutAndPaste();
		}
	};

	CutPaste.prototype._stopCutAndPaste = function() {
		var oCutOverlay = this.getElementMover().getMovedOverlay();
		if (oCutOverlay) {
			oCutOverlay.removeStyleClass("sapUiDtOverlayCutted");
			this.getElementMover().setMovedOverlay(null);
			this.getElementMover().deactivateAllTargetZones(this.getDesignTime());
		}
	};

	CutPaste.prototype._isForSameElement = function(oCutOverlay, oTargetOverlay) {
		return oTargetOverlay.getElementInstance() === oCutOverlay.getElementInstance();
	};

	CutPaste.prototype._getTargetZoneAggregation = function(oTargetOverlay) {
		var aAggregationOverlays = oTargetOverlay.getAggregationOverlays();
		var aPossibleTargetZones = aAggregationOverlays.filter(function(oAggregationOverlay) {
			return oAggregationOverlay.isTargetZone();
		});
		if (aPossibleTargetZones.length > 0) {
			return aPossibleTargetZones[0];
		} else {
			return null;
		}
	};

	return CutPaste;
}, /* bExport= */true);
