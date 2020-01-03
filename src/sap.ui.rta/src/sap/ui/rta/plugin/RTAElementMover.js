/*!
 * ${copyright}
 */

// Provides class sap.ui.rta.plugin.RTAElementMover.
sap.ui.define([
	"sap/ui/dt/plugin/ElementMover",
	"sap/ui/dt/OverlayUtil",
	"sap/ui/rta/Utils",
	"sap/ui/rta/command/CommandFactory",
	"sap/ui/rta/plugin/Plugin",
	"sap/ui/dt/OverlayRegistry",
	"sap/ui/dt/MetadataPropagationUtil"
],
function(
	ElementMover,
	OverlayUtil,
	Utils,
	CommandFactory,
	Plugin,
	OverlayRegistry,
	MetadataPropagationUtil
) {
	"use strict";

	/**
	 * Constructor for a new RTAElementMover.
	 *
	 * @param {string} [sId] id for the new object, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new object
	 *
	 * @class
	 * The RTAElementMover is responsible for the RTA specific adaptation of element movements.
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @private
	 * @since 1.34
	 * @alias sap.ui.rta.plugin.RTAElementMover
	 * @experimental Since 1.34. This class is experimental and provides only limited functionality. Also the API might be changed in future.
	 */
	var RTAElementMover = ElementMover.extend("sap.ui.rta.plugin.RTAElementMover", /** @lends sap.ui.rta.plugin.RTAElementMover.prototype */ {
		metadata : {
			library : "sap.ui.rta",
			properties : {
				commandFactory : {
					type : "any",
					defaultValue : CommandFactory
				},
				movableTypes : {
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

	RTAElementMover.prototype.init = function() {
		this.oBasePlugin = new Plugin({
			commandFactory : this.getCommandFactory()
		});
	};

	RTAElementMover.prototype.exit = function() {
		this.oBasePlugin.destroy();
	};

	RTAElementMover.prototype.setCommandFactory = function(oCommandFactory) {
		this.setProperty("commandFactory", oCommandFactory);
		this.oBasePlugin.setCommandFactory(oCommandFactory);
	};

	RTAElementMover.prototype.isEditable = function(oOverlay, bOnRegistration) {
		var oElement = oOverlay.getElement();
		if (!this.isMovableType(oElement)) {
			return Promise.resolve(false);
		}
		return this.checkMovable(oOverlay, bOnRegistration)
			.then(function(bMovable) {
				oOverlay.setMovable(bMovable);
				return bMovable;
			});
	};

	/**
	 * Check if the element is editable for the move
	 * @param  {sap.ui.dt.Overlay}  oOverlay The overlay being moved or the aggregation overlay
	 * @param  {boolean} bOnRegistration if embedded, false if not
	 * @return {Promise.<boolean>} promise with true value if editable
	 */
	function fnIsValidForMove(oOverlay, bOnRegistration) {
		var	oDesignTimeMetadata = oOverlay.getDesignTimeMetadata();
		var oParentElementOverlay = oOverlay.getParentElementOverlay();
		// if the overlay has 'not-adaptable' as action it should also not be movable
		var bNotAdaptable = oDesignTimeMetadata.markedAsNotAdaptable();

		if (!oDesignTimeMetadata || !oParentElementOverlay || bNotAdaptable) {
			return Promise.resolve(false);
		}

		var oRelevantContainer = oOverlay.getRelevantContainer();
		var oRelevantContainerOverlay = OverlayRegistry.getOverlay(oRelevantContainer);
		if (!oRelevantContainerOverlay) {
			return Promise.resolve(false);
		}

		return this.isMoveAvailableOnRelevantContainer(oOverlay)
			.then(function(bValid) {
				if (bValid) {
					bValid = this.oBasePlugin.hasStableId(oOverlay) &&
					this.oBasePlugin.hasStableId(oParentElementOverlay) &&
					this.oBasePlugin.hasStableId(oRelevantContainerOverlay);
				}
				return bValid;
			}.bind(this))
			.then(function(bValid) {
				// element is only valid for move if it can be moved to somewhere else
				if (bValid) {
					return fnCheckForValidTargetZones.call(this, oOverlay, oRelevantContainerOverlay, bOnRegistration);
				}
				return bValid;
			}.bind(this));
	}

	function fnCheckForValidTargetZones(oOverlay, oRelevantContainerOverlay, bOnRegistration) {
		var aOverlays = OverlayUtil.findAllUniqueAggregationOverlaysInContainer(oOverlay, oRelevantContainerOverlay);

		var aValidAggregationOverlayPromises = aOverlays.map(function(oAggregationOverlay) {
			return this.checkTargetZone(oAggregationOverlay, oOverlay, bOnRegistration)
				.then(function(bValid) {
					return bValid ? oAggregationOverlay : undefined;
				});
		}.bind(this));

		return Promise.all(aValidAggregationOverlayPromises)
			.then(function(aValidAggregationOverlays) {
				aValidAggregationOverlays = aValidAggregationOverlays.filter(function(aValidAggregationOverlay) {
					return !!aValidAggregationOverlay;
				});
				if (aValidAggregationOverlays.length < 1) {
					return false;
				} else if (aValidAggregationOverlays.length === 1) {
					var aVisibleOverlays = aValidAggregationOverlays[0].getChildren().filter(function(oChildOverlay) {
						var oChildElement = oChildOverlay.getElement();
						// At least one sibling has to be visible and still attached to the parent
						// In some edge cases, the child element is not available anymore (element already got destroyed)
						return (oChildElement && oChildElement.getVisible() && oChildElement.getParent());
					});
					return aVisibleOverlays.length > 1;
				}
				return true;
			});
	}

	function fnHasMoveAction(oAggregationOverlay, oElement, oRelevantContainer) {
		var oAggregationDTMetadata = oAggregationOverlay.getDesignTimeMetadata();
		var oMoveAction = oAggregationDTMetadata.getAction("move", oElement);
		if (!oMoveAction) {
			return Promise.resolve(false);
		}
		// moveChangeHandler information is always located on the relevant container
		return this.oBasePlugin.hasChangeHandler(oMoveAction.changeType, oRelevantContainer);
	}

	/**
	 * @param	{sap.ui.dt.Overlay} oOverlay overlay object
	 * @return {sap.ui.dt.DesignTimeMetadata} oDesignTimeMetadata
	 * @private
	 */
	ElementMover.prototype._getMoveAction = function(oOverlay) {
		var oParentAggregationDtMetadata;
		var oParentAggregationOverlay = oOverlay.getParentAggregationOverlay();
		if (oParentAggregationOverlay) {
			oParentAggregationDtMetadata = oParentAggregationOverlay.getDesignTimeMetadata();
		}
		return oParentAggregationDtMetadata ? oParentAggregationDtMetadata.getAction("move", oOverlay.getElement()) : undefined;
	};

	/**
	 * Predicate to compute movability of a type
	 * @param {any} oElement given element
	 * @public
	 * @return {boolean} true if type is movable, false otherwise
	 */
	ElementMover.prototype.isMovableType = function() {
		//real check is part of checkMovable which has the overlay
		return true;
	};

	/**
	 * @param  {sap.ui.dt.Overlay} oOverlay overlay object
	 * @return {boolean} true if embedded, false if not
	 * @override
	 */
	RTAElementMover.prototype.checkMovable = function(oOverlay, bOnRegistration) {
		return fnIsValidForMove.call(this, oOverlay, bOnRegistration);
	};

	/**
	 * Checks drop ability for aggregation overlays
	 * @param  {sap.ui.dt.Overlay} oAggregationOverlay aggregation overlay object
	 * @return {Promise.<boolean>} Promise with true value if aggregation overlay is droppable or false value if not.
	 * @override
	 */
	RTAElementMover.prototype.checkTargetZone = function(oAggregationOverlay, oOverlay, bOverlayNotInDom) {
		var oMovedOverlay = oOverlay || this.getMovedOverlay();
		return ElementMover.prototype.checkTargetZone.call(this, oAggregationOverlay, oMovedOverlay, bOverlayNotInDom)
			.then(function(bTargetZone) {
				if (!bTargetZone) {
					return false;
				}

				var oMovedElement = oMovedOverlay.getElement();
				var oTargetOverlay = oAggregationOverlay.getParent();
				var oMovedRelevantContainer = oMovedOverlay.getRelevantContainer();

				// the element or the parent overlay might be destroyed or not available
				if (!oMovedElement || !oTargetOverlay) {
					return false;
				}

				var oTargetElement = oTargetOverlay.getElement();
				var oAggregationDtMetadata = oAggregationOverlay.getDesignTimeMetadata();

				// determine target relevantContainer
				var vTargetRelevantContainerAfterMove = MetadataPropagationUtil.getRelevantContainerForPropagation(oAggregationDtMetadata.getData(), oMovedElement);
				vTargetRelevantContainerAfterMove = vTargetRelevantContainerAfterMove || oTargetElement;

				// check for same relevantContainer
				if (
					!oMovedRelevantContainer
					|| !vTargetRelevantContainerAfterMove
					|| !this.oBasePlugin.hasStableId(oTargetOverlay)
					|| oMovedRelevantContainer !== vTargetRelevantContainerAfterMove
				) {
					return false;
				}

				// Binding context is not relevant if the element is being moved inside its parent
				if (oMovedOverlay.getParent().getElement() !== oTargetElement) {
					// check if binding context is the same
					if (!Utils.checkSourceTargetBindingCompatibility(oMovedElement, oTargetElement)) {
						return false;
					}
				}

				// check if movedOverlay is movable into the target aggregation
				return fnHasMoveAction.call(this, oAggregationOverlay, oMovedElement, vTargetRelevantContainerAfterMove);
			}.bind(this));
	};

	/**
	 * Checks if move is available on relevantcontainer
	 * @param  {sap.ui.dt.Overlay} oOverlay overlay object
	 * @return {Promise.<boolean>} Promise with true value if move available on relevantContainer.
	 */
	RTAElementMover.prototype.isMoveAvailableOnRelevantContainer = function(oOverlay) {
		var oChangeHandlerRelevantElement;
		var oMoveAction = this._getMoveAction(oOverlay);

		if (oMoveAction && oMoveAction.changeType) {
			// moveChangeHandler information is always located on the relevant container
			oChangeHandlerRelevantElement = oOverlay.getRelevantContainer();
			var oRelevantOverlay = OverlayRegistry.getOverlay(oChangeHandlerRelevantElement);
			if (!this.oBasePlugin.hasStableId(oRelevantOverlay)) {
				return Promise.resolve(false);
			}
			return this.oBasePlugin.hasChangeHandler(oMoveAction.changeType, oChangeHandlerRelevantElement);
		}
		return Promise.resolve(false);
	};

	/**
	 * Checks if move is available for child overlays
	 * @param  {sap.ui.dt.ElementOverlay} oOverlay overlay object
	 * @return {Promise.<boolean>} Promise with true value if move available for at least one child overlay.
	 */
	RTAElementMover.prototype.isMoveAvailableForChildren = function(oOverlay) {
		var oDesignTimeMetadata = oOverlay.getDesignTimeMetadata();
		var aAggregationsWithMoveAction = oDesignTimeMetadata.getAggregationNamesWithAction("move");
		var aAggregationWithMoveActionPromises = [];
		aAggregationsWithMoveAction.forEach(function(oAggregationWithAction) {
			var aAggregationOverlays = oOverlay.getAggregationOverlay(oAggregationWithAction);
			if (aAggregationOverlays) {
				var aChildren = aAggregationOverlays.getChildren();
				var aChildrenMovablePromises = aChildren.map(this.checkMovable.bind(this));
				aAggregationWithMoveActionPromises = aAggregationWithMoveActionPromises.concat(aChildrenMovablePromises);
			} else {
				aAggregationWithMoveActionPromises.push(Promise.resolve(false));
			}
		}.bind(this));
		return Promise.all(aAggregationWithMoveActionPromises)
			.then(function(aMoveAvailableResults) {
				return aMoveAvailableResults.some(function(aMoveAvailable) {
					return aMoveAvailable;
				});
			});
	};

	/**
	 * Builds the Move command
	 * @return {Promise} Move command object wrapped in a promise
	 */
	RTAElementMover.prototype.buildMoveCommand = function() {
		var oMovedOverlay = this.getMovedOverlay();
		var oParentAggregationOverlay = oMovedOverlay.getParentAggregationOverlay();
		var oMovedElement = oMovedOverlay.getElement();
		var oSource = this._getSource();
		var oRelevantContainer = oMovedOverlay.getRelevantContainer();
		var oTarget = OverlayUtil.getParentInformation(oMovedOverlay);
		var iSourceIndex = oSource.index;
		var iTargetIndex = oTarget.index;

		var bSourceAndTargetAreSame = this._compareSourceAndTarget(oSource, oTarget);

		if (bSourceAndTargetAreSame) {
			return Promise.resolve();
		}
		delete oSource.index;
		delete oTarget.index;

		var sVariantManagementReference = this.oBasePlugin.getVariantManagementReference(oMovedOverlay);

		return this.getCommandFactory().getCommandFor(oRelevantContainer, "Move", {
			movedElements : [{
				element : oMovedElement,
				sourceIndex : iSourceIndex,
				targetIndex : iTargetIndex
			}],
			source : oSource,
			target : oTarget
		}, oParentAggregationOverlay.getDesignTimeMetadata(), sVariantManagementReference);
	};

	return RTAElementMover;
});
