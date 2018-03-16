/*!
 * ${copyright}
 */

// Provides class sap.ui.rta.plugin.RTAElementMover.
sap.ui.define([
  'sap/ui/dt/plugin/ElementMover',
	'sap/ui/dt/OverlayUtil',
	'sap/ui/dt/ElementUtil',
	'sap/ui/fl/Utils',
	'sap/ui/rta/Utils',
	'sap/ui/rta/command/CommandFactory',
	'sap/ui/rta/plugin/Plugin',
	'sap/ui/dt/OverlayRegistry',
	'sap/ui/rta/util/BindingsExtractor',
	'sap/ui/dt/MetadataPropagationUtil'
],
function(
	ElementMover,
	OverlayUtil,
	ElementUtil,
	FlexUtils,
	Utils,
	CommandFactory,
	Plugin,
	OverlayRegistry,
	BindingsExtractor,
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
			// ---- object ----

			// ---- control specific ----
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
		var bMovable = false;
		if (
			this.isMovableType(oElement)
			&& this.checkMovable(oOverlay, bOnRegistration)
			&& !OverlayUtil.isInAggregationBinding(oOverlay, oElement.sParentAggregationName)
		) {
			bMovable = true;
		}
		oOverlay.setMovable(bMovable);
		return bMovable;
	};

	/**
	 * Check if the element is editable for the move
	 * @param  {sap.ui.dt.Overlay}  oOverlay The overlay being moved or the aggregation overlay
	 * @param  {boolean} bOnRegistration if embedded, false if not
	 * @return {boolean} true if editable
	 */
	function fnIsValidForMove(oOverlay, bOnRegistration) {
		var bValid = false,
			oDesignTimeMetadata = oOverlay.getDesignTimeMetadata(),
			oParentElementOverlay = oOverlay.getParentElementOverlay();

		if (!oDesignTimeMetadata || !oParentElementOverlay) {
			return false;
		}

		var oRelevantContainer = oOverlay.getRelevantContainer();
		var oRelevantContainerOverlay = OverlayRegistry.getOverlay(oRelevantContainer);
		if (!oRelevantContainerOverlay) {
			return false;
		}

		bValid = this._isMoveAvailableOnRelevantContainer(oOverlay);

		if (bValid) {
			bValid = this.oBasePlugin.hasStableId(oOverlay) &&
			this.oBasePlugin.hasStableId(oParentElementOverlay) &&
			this.oBasePlugin.hasStableId(oRelevantContainerOverlay);
		}

		// element is only valid for move if it can be moved to somewhere else
		if (bValid) {
			var aOverlays = OverlayUtil.findAllUniqueAggregationOverlaysInContainer(oOverlay, oRelevantContainerOverlay);

			var aValidAggregationOverlays = aOverlays.filter(function(oAggregationOverlay) {
				return this.checkTargetZone(oAggregationOverlay, oOverlay, bOnRegistration);
			}.bind(this));

			if (aValidAggregationOverlays.length < 1) {
				bValid = false;
			} else if (aValidAggregationOverlays.length === 1) {
				var aVisibleOverlays = aValidAggregationOverlays[0].getChildren().filter(function(oChildOverlay) {
					var oChildElement = oChildOverlay.getElement();
					// At least one sibling has to be visible and still attached to the parent
					// In some edge cases, the child element is not available anymore (element already got destroyed)
					return (oChildElement && oChildElement.getVisible() && oChildElement.getParent());
				});
				bValid = aVisibleOverlays.length > 1;
			}
		}

		return bValid;
	}

	function fnHasMoveAction(oAggregationOverlay, oElement, oRelevantContainer) {
		var oAggregationDTMetadata = oAggregationOverlay.getDesignTimeMetadata();
		var oMoveAction = oAggregationDTMetadata.getAction("move", oElement);
		if (!oMoveAction) {
			return false;
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
		var oParentAggregationDtMetadata,
			oParentAggregationOverlay = oOverlay.getParentAggregationOverlay();
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
	ElementMover.prototype.isMovableType = function(oElement) {
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
	 * @return {boolean} true if aggregation overlay is droppable, false if not
	 * @override
	 */
	RTAElementMover.prototype.checkTargetZone = function(oAggregationOverlay, oOverlay, bOverlayNotInDom) {
		var oMovedOverlay = oOverlay ? oOverlay : this.getMovedOverlay();

		var bTargetZone = ElementMover.prototype.checkTargetZone.call(this, oAggregationOverlay, oMovedOverlay, bOverlayNotInDom);
		if (!bTargetZone) {
			return false;
		}

		var oMovedElement = oMovedOverlay.getElement();
		var oTargetOverlay = oAggregationOverlay.getParent();
		var oMovedRelevantContainer = oMovedOverlay.getRelevantContainer();
		var oTargetElement = oTargetOverlay.getElement();
		var oAggregationDtMetadata = oAggregationOverlay.getDesignTimeMetadata();

		// determine target relevantContainer
		var vTargetRelevantContainerAfterMove = MetadataPropagationUtil.getRelevantContainerForPropagation(oAggregationDtMetadata.getData(), oMovedElement);
		vTargetRelevantContainerAfterMove = vTargetRelevantContainerAfterMove ? vTargetRelevantContainerAfterMove : oTargetElement;

		// check for same relevantContainer
		if (
			!oMovedRelevantContainer
			|| !vTargetRelevantContainerAfterMove
			|| !Plugin.prototype.hasStableId(oTargetOverlay)
			|| oMovedRelevantContainer !== vTargetRelevantContainerAfterMove
		) {
			return false;
		}

		// Binding context is not relevant if the element is being moved inside its parent
		if (oMovedOverlay.getParent().getElement() !== oTargetElement) {
			// check if binding context is the same
			var aBindings = BindingsExtractor.getBindings(oMovedElement, oMovedElement.getModel());
			if (Object.keys(aBindings).length > 0 && oMovedElement.getBindingContext() && oTargetElement.getBindingContext()) {
				var sMovedElementBindingContext = Utils.getEntityTypeByPath(
					oMovedElement.getModel(),
					oMovedElement.getBindingContext().getPath()
				);
				var sTargetElementBindingContext = Utils.getEntityTypeByPath(
					oTargetElement.getModel(),
					oTargetElement.getBindingContext().getPath()
				);
				if (!(sMovedElementBindingContext === sTargetElementBindingContext)) {
					return false;
				}
			}
		}

		// check if movedOverlay is movable into the target aggregation
		return fnHasMoveAction.call(this, oAggregationOverlay, oMovedElement, vTargetRelevantContainerAfterMove);
	};

	/**
	 * Checks if move is available on relevantcontainer
	 * @param  {sap.ui.dt.Overlay} oOverlay overlay object
	 * @return {boolean} true if move available on relevantContainer
	 */
	RTAElementMover.prototype._isMoveAvailableOnRelevantContainer = function(oOverlay) {
		var oChangeHandlerRelevantElement,
			oMoveAction = this._getMoveAction(oOverlay);

		if (oMoveAction && oMoveAction.changeType) {
			// moveChangeHandler information is always located on the relevant container
			oChangeHandlerRelevantElement = oOverlay.getRelevantContainer();
			return this.oBasePlugin.hasChangeHandler(oMoveAction.changeType, oChangeHandlerRelevantElement);
		}
		return false;
	};

	/**
	 * Builds the Move command
	 * @return {any} Move command object
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
			return undefined;
		}
		delete oSource.index;
		delete oTarget.index;

		var oMoveAction = this._getMoveAction(oMovedOverlay);
		var sVariantManagementReference = this.oBasePlugin.getVariantManagementReference(oMovedOverlay, oMoveAction, true);

		var oMove = this.getCommandFactory().getCommandFor(oRelevantContainer, "Move", {
			movedElements : [{
				element : oMovedElement,
				sourceIndex : iSourceIndex,
				targetIndex : iTargetIndex
			}],
			source : oSource,
			target : oTarget
		}, oParentAggregationOverlay.getDesignTimeMetadata(), sVariantManagementReference);

		return oMove;

	};

	return RTAElementMover;
}, /* bExport= */ true);
