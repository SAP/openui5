/*
 * ! ${copyright}
 */

// Provides class sap.ui.dt.plugin.ElementMover.
sap.ui.define([
	'sap/ui/base/ManagedObject',
	'sap/ui/dt/ElementUtil',
	'sap/ui/dt/OverlayUtil',
	'sap/ui/dt/OverlayRegistry'
], function
(	ManagedObject,
	ElementUtil,
	OverlayUtil,
	OverlayRegistry
) {
	"use strict";

	/**
	 * Constructor for a new ElementMover.
	 *
	 * @param {string}
	 *          [sId] id for the new object, generated automatically if no id is given
	 * @param {object}
	 *          [mSettings] initial settings for the new object
	 * @class The ElementMover enables movement of UI5 elements based on aggregation types, which can be used by drag and
	 *        drop or cut and paste behavior.
	 * @author SAP SE
	 * @version ${version}
	 * @constructor
	 * @private
	 * @since 1.34
	 * @alias sap.ui.dt.plugin.ElementMover
	 * @experimental Since 1.34. This class is experimental and provides only limited functionality. Also the API might be
	 *               changed in future.
	 */
	var ElementMover = ManagedObject.extend("sap.ui.dt.plugin.ElementMover", /** @lends sap.ui.dt.plugin.ElementMover.prototype */
	{
		metadata : {
			// ---- object ----

			// ---- control specific ----
			library : "sap.ui.dt",
			properties : {
				movableTypes : {
					type : "string[]",
					defaultValue : ["sap.ui.core.Element"]
				}
			},
			associations : {}
		}
	});

	/**
	 * @private
	 */
	ElementMover.prototype._getMovableTypes = function() {
		return this.getProperty("movableTypes") || [];
	};

	/**
	 * Predicate to compute movability of a type
	 * @public
	 * @return true if type is movable, false otherwise
	 */
	ElementMover.prototype.isMovableType = function(oElement) {
		var aMovableTypes = this._getMovableTypes();

		return aMovableTypes.some(function(sType) {
			return ElementUtil.isInstanceOf(oElement, sType);
		});
	};

	/**
	 * @protected
	 */
	ElementMover.prototype.checkMovable = function(oOverlay) {
		return true;
	};

	/**
	 * returns the moved overlay (only during movements)
	 *
	 * @public
	 * @return {sap.ui.dt.Overlay} overlay which is moved
	 */
	ElementMover.prototype.getMovedOverlay = function() {
		return this._oMovedOverlay;
	};

	/**
	 * set the moved overlay (only during movements)
	 *
	 * @param {sap.ui.dt.Overlay}
	 *          [oMovedOverlay] overlay which is moved
	 */
	ElementMover.prototype.setMovedOverlay = function(oMovedOverlay) {
		if (oMovedOverlay) {
			this._source = OverlayUtil.getParentInformation(oMovedOverlay);
		} else {
			delete this._source;
		}
		this._oMovedOverlay = oMovedOverlay;
	};

	ElementMover.prototype._getSource = function() {
		return this._source;
	};

	/**
	 * @private
	 */
	ElementMover.prototype.activateAllValidTargetZones = function(oDesignTime, sAdditionalStyleClass) {
		this._iterateAllAggregations(oDesignTime, this._activateValidTargetZone.bind(this), sAdditionalStyleClass);
	};

	/**
	 * @private
	 */
	ElementMover.prototype._activateValidTargetZone = function(oAggregationOverlay, sAdditionalStyleClass) {
		if (this.checkTargetZone(oAggregationOverlay)) {
			oAggregationOverlay.setTargetZone(true);
			if (sAdditionalStyleClass) {
				oAggregationOverlay.addStyleClass(sAdditionalStyleClass);
			}
		}
	};

	/**
	 * @protected
	 */
	ElementMover.prototype.checkTargetZone = function(oAggregationOverlay, oOverlay, bOverlayNotInDom) {
		var oMovedOverlay = oOverlay ? oOverlay : this.getMovedOverlay();
		var oGeometry = oAggregationOverlay.getGeometry();
		var bGeometryVisible = oGeometry && oGeometry.size.height > 0 && oGeometry.size.width > 0;

		// this function can get called on overlay registration, when there are no overlays in dom yet. In this case, $().is(":visible") is always false.
		if ((bOverlayNotInDom && !bGeometryVisible)
			|| !bOverlayNotInDom && !oAggregationOverlay.$().is(":visible")
			|| !(oAggregationOverlay.getElement().getVisible && oAggregationOverlay.getElement().getVisible())) {
			return false;
		}
		var oParentElement = oAggregationOverlay.getElement();
		// an aggregation can still have visible = true even if it has been removed from its parent
		if (!oParentElement.getParent()){
			return false;
		}
		var oMovedElement = oMovedOverlay.getElement();
		var sAggregationName = oAggregationOverlay.getAggregationName();

		if (ElementUtil.isValidForAggregation(oParentElement, sAggregationName, oMovedElement)) {
			return true;
		}
	};

	/**
	 * @private
	 */
	ElementMover.prototype._deactivateTargetZone = function(oAggregationOverlay, sAdditionalStyleClass) {
		oAggregationOverlay.setTargetZone(false);
		if (sAdditionalStyleClass) {
			oAggregationOverlay.removeStyleClass(sAdditionalStyleClass);
		}
	};

	/**
	 * @private
	 */
	ElementMover.prototype.activateTargetZonesFor = function(oOverlay, sAdditionalStyleClass) {
		this._iterateOverlayAggregations(oOverlay, this._activateValidTargetZone.bind(this), sAdditionalStyleClass);
	};

	/**
	 * @private
	 */
	ElementMover.prototype.deactivateTargetZonesFor = function(oOverlay, sAdditionalStyleClass) {
		this._iterateOverlayAggregations(oOverlay, this._deactivateTargetZone.bind(this), sAdditionalStyleClass);
	};

	/**
	 * @private
	 */
	ElementMover.prototype.deactivateAllTargetZones = function(oDesignTime, sAdditionalStyleClass) {
		this._iterateAllAggregations(oDesignTime, this._deactivateTargetZone.bind(this), sAdditionalStyleClass);
	};

	/**
	 * @private
	 */
	ElementMover.prototype._iterateAllAggregations = function(oDesignTime, fnStep, sAdditionalStyleClass) {
		var aOverlays = oDesignTime.getElementOverlays();
		aOverlays.forEach(function(oOverlay) {
			this._iterateOverlayAggregations(oOverlay, fnStep, sAdditionalStyleClass);
		}, this);
	};

	/**
	 * @private
	 */
	ElementMover.prototype._iterateOverlayAggregations = function(oOverlay, fnStep, sAdditionalStyleClass) {
		var aAggregationOverlays = oOverlay.getAggregationOverlays();
		aAggregationOverlays.forEach(function(oAggregationOverlay) {
			fnStep(oAggregationOverlay, sAdditionalStyleClass);
		});
	};

	/**
	 * Move an element inside the same container (reposition).
	 * In case of special handling required (e.g. SimpleForm), the methods "beforeMove" and "afterMove"
	 * are called before and after the reposition. They should be implemented on the control design time
	 * metadata for the relevant aggregation.
	 * @param  {sap.ui.dt.Overlay} oMovedOverlay The overlay of the element being moved
	 * @param  {sap.ui.dt.Overlay} oTargetElementOverlay The overlay of the target element for the move
	 */
	ElementMover.prototype.repositionOn = function(oMovedOverlay, oTargetElementOverlay) {
		var oMovedElement = oMovedOverlay.getElement();
		var oTargetParentInformation = OverlayUtil.getParentInformation(oTargetElementOverlay);
		var oAggregationDesignTimeMetadata;

		var oParentAggregationOverlay = oMovedOverlay.getParentAggregationOverlay();
		var oRelevantContainerElement = oMovedOverlay.getRelevantContainer();
		var oParentElementOverlay = oMovedOverlay.getParentElementOverlay();

		if (oParentAggregationOverlay && oParentElementOverlay) {
			var sAggregationName = oParentAggregationOverlay.getAggregationName();
			oAggregationDesignTimeMetadata = oParentElementOverlay.getDesignTimeMetadata().getAggregation(sAggregationName);
		}

		if (oTargetParentInformation.index !== -1) {
			if (oAggregationDesignTimeMetadata && oAggregationDesignTimeMetadata.beforeMove){
				oAggregationDesignTimeMetadata.beforeMove(oRelevantContainerElement, oMovedElement);
			}
			ElementUtil.insertAggregation(oTargetParentInformation.parent, oTargetParentInformation.aggregation,
				oMovedElement, oTargetParentInformation.index);
			if (oAggregationDesignTimeMetadata && oAggregationDesignTimeMetadata.afterMove){
				oAggregationDesignTimeMetadata.afterMove(oRelevantContainerElement, oMovedElement);
			}
		}
	};

	/**
	 * Insert an element inside another container.
	 * In case of special handling required (e.g. SimpleForm), the methods "beforeMove" and "afterMove"
	 * are called before and after the insertion. They should be implemented on the control design time
	 * metadata for the relevant aggregation.
	 * @param  {sap.ui.dt.Overlay} oMovedOverlay The overlay of the element being moved
	 * @param  {sap.ui.dt.Overlay} oTargetAggregationOverlay The overlay of the target aggregation for the move
	 */
	ElementMover.prototype.insertInto = function(oMovedOverlay, oTargetAggregationOverlay) {
		var oMovedElement = oMovedOverlay.getElement();
		var oTargetParentElement = oTargetAggregationOverlay.getElement();
		var oAggregationDesignTimeMetadata;

		var oParentAggregationOverlay = oMovedOverlay.getParentAggregationOverlay();
		var oRelevantContainerElement = oMovedOverlay.getRelevantContainer();
		var oParentElementOverlay = oMovedOverlay.getParentElementOverlay();

		if (oParentAggregationOverlay && oParentElementOverlay) {
			var sAggregationName = oParentAggregationOverlay.getAggregationName();
			oAggregationDesignTimeMetadata = oParentElementOverlay.getDesignTimeMetadata().getAggregation(sAggregationName);
		}

		var aTargetAggregationItems = ElementUtil.getAggregation(oTargetAggregationOverlay.getElement(), oTargetAggregationOverlay.getAggregationName());
		var iIndex = aTargetAggregationItems.indexOf(oMovedElement);
		// Don't do anything when the element is already in the aggregation and is the last element
		if (!(iIndex > -1 && iIndex === aTargetAggregationItems.length - 1)) {
			if (oAggregationDesignTimeMetadata && oAggregationDesignTimeMetadata.beforeMove){
				oAggregationDesignTimeMetadata.beforeMove(oRelevantContainerElement, oMovedElement);
			}
			var sTargetAggregationName = oTargetAggregationOverlay.getAggregationName();
			ElementUtil.addAggregation(oTargetParentElement, sTargetAggregationName, oMovedElement);
			if (oAggregationDesignTimeMetadata && oAggregationDesignTimeMetadata.afterMove){
				oAggregationDesignTimeMetadata.afterMove(oRelevantContainerElement, oMovedElement);
			}
		}
	};

	ElementMover.prototype._compareSourceAndTarget = function(oSource, oTarget) {
		var vProperty;
		for (vProperty in oSource) {
			switch (typeof (oSource[vProperty])) {
				case 'object':
					if (oSource[vProperty].getId() !== oTarget[vProperty].getId()) {return false;}
					break;
				default:
					if (oSource[vProperty] !== oTarget[vProperty]) {return false;}
			}
		}

		return true;
	};

	return ElementMover;
}, /* bExport= */true);
