/*!
 * ${copyright}
 */

// Provides class sap.ui.dt.plugin.ControlDragDrop.
sap.ui.define([
	'sap/ui/dt/plugin/DragDrop',
	'sap/ui/dt/ElementUtil'
],
function(DragDrop, ElementUtil) {
	"use strict";

	/**
	 * Constructor for a new ControlDragDrop.
	 *
	 * @param {string} [sId] id for the new object, generated automatically if no id is given 
	 * @param {object} [mSettings] initial settings for the new object
	 *
	 * @class
	 * The ControlDragDrop allows to create a set of Overlays above the root elements and
	 * theire public children and manage their events.
	 * @extends sap.ui.core.ManagedObject
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.30
	 * @alias sap.ui.dt.plugin.ControlDragDrop
	 * @experimental Since 1.30. This class is experimental and provides only limited functionality. Also the API might be changed in future.
	 */
	var ControlDragDrop = DragDrop.extend("sap.ui.dt.plugin.ControlDragDrop", /** @lends sap.ui.dt.plugin.ControlDragDrop.prototype */ {		
		metadata : {
			// ---- object ----

			// ---- control specific ----
			library : "sap.ui.dt",
			properties : {
				draggableTypes : {
					type : "string[]",
					defaultValue : ["sap.ui.core.Element"]
				}
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
	ControlDragDrop.prototype.registerOverlay = function(oOverlay) {
		DragDrop.prototype.registerOverlay.apply(this, arguments);
		if (this._isOfDraggableType(oOverlay.getElementInstance())) {
			oOverlay.setDraggable(true);
		}

		if (this.oDraggedElement) {
			this._activateValidDroppablesFor(oOverlay);
		}
	};

	ControlDragDrop.getDraggableTypes = function() {
		return this.getProperty("draggableTypes") || [];
	};

	ControlDragDrop.prototype._isOfDraggableType = function(oElement) {
		var aDraggableTypes = this.getDraggableTypes();

		return aDraggableTypes.some(function(sType) {
			return  ElementUtil.isInstance(oElement, sType);
		});
	};

	/*
	 * @override
	 */
	ControlDragDrop.prototype.deregisterOverlay = function(oOverlay) {
		DragDrop.prototype.deregisterOverlay.apply(this, arguments);
		oOverlay.setDraggable(false);

		if (this.oDraggedElement) {
			this._deactivateDroppablesFor(oOverlay);
		}
	};

	/*
	 * @override
	 */
	ControlDragDrop.prototype.onDragStart = function(oOverlay) {
		this._oDraggedOverlay = oOverlay;

		this._activateAllValidDroppables();
	};

	/*
	 * @override
	 */
	ControlDragDrop.prototype.onDragEnd = function(oOverlay) {
		delete this._oDraggedOverlay;
	};


	/*
	 * @override
	 */
	ControlDragDrop.prototype.onDragEnter = function(oTargetOverlay, oEvent) {
		if (oTargetOverlay.getElementInstance() !== this._oDraggedOverlay.getElementInstance() ) {
			this._repositionOn(oTargetOverlay);
		}
	};

	/*
	 * @override
	 */
	ControlDragDrop.prototype.onAggregationDragEnter = function(oAggregationOverlay) {
		var oParentElement = oAggregationOverlay.getElementInstance();

		var oDraggedElement = this._oDraggedOverlay.getElementInstance();
		var oParentOverlay = this._oDraggedOverlay.getParentOverlay();

		if (oParentElement !== oParentOverlay.getElementInstance()) {
			var sAggregationName = oAggregationOverlay.getAggregationName();
			ElementUtil.addAggregation(oParentElement, sAggregationName, oDraggedElement);
		}
	};

	/*
	 * @override
	 */
	ControlDragDrop.prototype.onAggregationDrop = function(oAggregationOverlay) {
		this._deactivateAllDroppables();
	};
	/*
	 * @private
	 */
	ControlDragDrop.prototype._activateAllValidDroppables = function() {
		this._iterateAllAggregations(this._activateValidDroppable.bind(this));
	};

	/*
	 * @private
	 */
	ControlDragDrop.prototype._activateValidDroppable = function(oAggregationOverlay) {
		var oparentElement = oAggregationOverlay.getElementInstance();
		var oDraggedElement = this._oDraggedOverlay.getElementInstance();
		var sAggregationName = oAggregationOverlay.getAggregationName();

		if (ElementUtil.isValidForAggregation(oparentElement, sAggregationName, oDraggedElement)) {
			oAggregationOverlay.setDroppable(true);
		}
	};

	/*
	 * @private
	 */
	ControlDragDrop.prototype._deactivateDroppable = function(oAggregationOverlay) {
		oAggregationOverlay.setDroppable(false);
	};

	/*
	 * @private
	 */
	ControlDragDrop.prototype._deactivateDroppablesFor = function(oOverlay) {
		this._iterateOverlayAggregations(oOverlay, this._deactivateDroppable.bind(this));
	};

	/*
	 * @private
	 */
	ControlDragDrop.prototype._deactivateAllDroppables = function() {
		this._iterateAllAggregations(function(oAggregationOverlay) {
				oAggregationOverlay.setDroppable(false);
		});
	};
	
	/*
	 * @private
	 */
	ControlDragDrop.prototype._iterateAllAggregations = function(fnStep) {	
		var that = this;

		var oDesignTime = ElementUtil.getElementInstance(this.getDesignTime());
		var aOverlays = oDesignTime.getOverlays();
		aOverlays.forEach(function(oOverlay) {
			that._iterateOverlayAggregations(oOverlay, fnStep);
		});
	};
	
	/*
	 * @private
	 */
	ControlDragDrop.prototype._iterateOverlayAggregations = function(oOverlay, fnStep) {	
		var aAggregationOverlays = oOverlay.getAggregationOverlays();
		aAggregationOverlays.forEach(function(oAggregationOverlay) {
			fnStep(oAggregationOverlay);
		});
	};

	/*
	 * @private
	 */
	ControlDragDrop.prototype._repositionOn = function(oTargetOverlay) {
		var oDraggedElement = this._oDraggedOverlay.getElementInstance();

		var oTargetElement = oTargetOverlay.getElementInstance();
		var oPublicParent = oTargetOverlay.getParentOverlay().getElementInstance();
		var sPublicParentAggregationName = oTargetOverlay.getParentAggregationOverlay().getAggregationName();

		var aChildren = ElementUtil.getAggregation(oPublicParent, sPublicParentAggregationName);
		var iIndex = aChildren.indexOf(oTargetElement);

		if (iIndex !== -1) {
			ElementUtil.insertAggregation(oPublicParent, sPublicParentAggregationName, oDraggedElement, iIndex);
		}
	};

	return ControlDragDrop;
}, /* bExport= */ true);