/*
 * ! ${copyright}
 */

// Provides class sap.ui.dt.plugin.ElementMover.
sap.ui.define([
	'sap/ui/base/ManagedObject', 'sap/ui/dt/ElementUtil', 'sap/ui/dt/OverlayUtil', 'sap/ui/dt/OverlayRegistry'
], function(ManagedObject, ElementUtil, OverlayUtil, OverlayRegistry) {
	"use strict";

	/**
	 * Constructor for a new ElementMover.
	 *
	 * @param {string} [sId] id for the new object, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new object
	 * @class The ElementMover enables movement of UI5 elements based on aggregation types, which can be used by drag and drop or cut and paste
	 *        behavior.
	 * @author SAP SE
	 * @version ${version}
	 * @constructor
	 * @private
	 * @since 1.34
	 * @alias sap.ui.dt.plugin.ElementMover
	 * @experimental Since 1.34. This class is experimental and provides only limited functionality. Also the API might be changed in future.
	 */
	var ElementMover = ManagedObject.extend("sap.ui.dt.plugin.ElementMover", /** @lends sap.ui.dt.plugin.ElementMover.prototype */
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
				}
			},
			associations: {},
			events: {
				'elementMoved': {}
			}
		}
	});

	/**
	 * @private
	 */
	ElementMover.prototype._getMovableTypes = function() {
		return this.getProperty("movableTypes") || [];
	};

	/**
	 * @public
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
	 * @param {sap.ui.dt.Overlay} [oMovedOverlay] overlay which is moved
	 * @public
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
	ElementMover.prototype.checkTargetZone = function(oAggregationOverlay) {
		if (!oAggregationOverlay.$().is(":visible")) {
			return false;
		}
		var oParentElement = oAggregationOverlay.getElementInstance();
		var oMovedElement = this.getMovedOverlay().getElementInstance();
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
		var that = this;

		var aOverlays = oDesignTime.getElementOverlays();
		aOverlays.forEach(function(oOverlay) {
			that._iterateOverlayAggregations(oOverlay, fnStep, sAdditionalStyleClass);
		});
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
	 * @private
	 */
	ElementMover.prototype.repositionOn = function(oMovedOverlay, oTargetElementOverlay) {
		var oMovedElement = oMovedOverlay.getElementInstance();

		var oTargetParent = OverlayUtil.getParentInformation(oTargetElementOverlay);

		if (oTargetParent.index !== -1) {
			ElementUtil.insertAggregation(oTargetParent.parent, oTargetParent.aggregation, oMovedElement, oTargetParent.index);
		}
	};


	/**
	 * @private
	 */
	ElementMover.prototype.insertInto = function(oMovedOverlay, oTargetAggregationOverlay) {
		var oMovedElement = oMovedOverlay.getElementInstance();
		var oTargetParentElement = oTargetAggregationOverlay.getElementInstance();

		var oSourceAggregationOverlay = oMovedOverlay.getParent();
		if (oTargetAggregationOverlay !== oSourceAggregationOverlay) {
			var sTargetAggregationName = oTargetAggregationOverlay.getAggregationName();
			ElementUtil.addAggregation(oTargetParentElement, sTargetAggregationName, oMovedElement);
		}
	};

	ElementMover.prototype.buildMoveEvent = function() {

		var oMovedOverlay = this.getMovedOverlay();
		var oMovedElement = oMovedOverlay.getElementInstance();
		var oSource = this._getSource();
		var oTarget = OverlayUtil.getParentInformation(oMovedOverlay);

		var aActions = [];
		var oHookDescription = this._findAfterHook('afterMove', oSource, oTarget);
		if (oHookDescription) {
			var oParentElement = oHookDescription.parentOverlay.getElementInstance();
			aActions = oHookDescription.afterHook.call(oParentElement, oMovedElement, oSource, oTarget);
		} else {
			aActions.push({
					element: oMovedElement,
					source: oSource,
					target: oTarget
				});
		}

		if (aActions && aActions.length > 0) {
			ElementUtil.executeActions(aActions);
		}

		this.fireElementMoved({
			data: aActions
		});

	};

	/**
	 * @private
	 */
	ElementMover.prototype._findAfterHook = function(sHookName, oSource, oTarget) {
		try {
			var oParentOverlay = OverlayRegistry.getOverlay(oSource.parent);
			var oAggregationOverlay = oParentOverlay.getAggregationOverlay(oSource.aggregation);
			var oAggregationDesignTimeMetadata = oAggregationOverlay.getDesignTimeMetadata();
			var oData = oAggregationDesignTimeMetadata.getData();
			var oAfterHook = oData[sHookName];
			if (oAfterHook) {
				return {
					afterHook : oAfterHook,
					parentOverlay : oParentOverlay
				};
			}
		} catch (ex) {
			// Intensionally left blank
		}
		return null;
	};

	return ElementMover;
}, /* bExport= */true);
