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
	'sap/ui/rta/util/BindingsExtractor'
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
	BindingsExtractor
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

	/**
	 * Check if the element is editable for the move
	 * @param  {sap.ui.dt.Overlay}  oOverlay The overlay being moved or the aggregation overlay
	 * @param  {[type]}  oMovedElement The element being moved if the aggregation overlay is present
	 * @return {Boolean} true if editable
	 */
	function fnIsValidForMove(oOverlay) {
		var bValid = false,
			oDesignTimeMetadata = oOverlay.getDesignTimeMetadata(),
			oParentElementOverlay = oOverlay.getParentElementOverlay(),
			oChangeHandlerRelevantElement;

		if (!oDesignTimeMetadata || !oParentElementOverlay) {
			return false;
		}

		var oRelevantContainer = oOverlay.getRelevantContainer();
		var oRelevantContainerOverlay = sap.ui.dt.OverlayRegistry.getOverlay(oRelevantContainer);
		if (!Utils.getRelevantContainerDesigntimeMetadata(oOverlay)) {
			return false;
		}

		var oMoveAction = this._getMoveAction(oOverlay);
		if (oMoveAction && oMoveAction.changeType) {
			// moveChangeHandler information is always located on the relevant container
			oChangeHandlerRelevantElement = oOverlay.getRelevantContainer();
			bValid = this.oBasePlugin.hasChangeHandler(oMoveAction.changeType, oChangeHandlerRelevantElement);
		}

		if (bValid) {
			bValid = this.oBasePlugin.hasStableId(oOverlay) &&
			this.oBasePlugin.hasStableId(oParentElementOverlay) &&
			this.oBasePlugin.hasStableId(oRelevantContainerOverlay);
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
		return oParentAggregationDtMetadata ? oParentAggregationDtMetadata.getAction("move", oOverlay.getElementInstance()) : undefined;
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
	RTAElementMover.prototype.checkMovable = function(oOverlay) {
		return fnIsValidForMove.call(this, oOverlay);
	};

	/**
	 * Checks drop ability for aggregation overlays
	 * @param  {sap.ui.dt.Overlay} oAggregationOverlay aggregation overlay object
	 * @return {boolean} true if aggregation overlay is droppable, false if not
	 * @override
	 */
	RTAElementMover.prototype.checkTargetZone = function(oAggregationOverlay) {
		var bTargetZone = ElementMover.prototype.checkTargetZone.call(this, oAggregationOverlay);
		if (!bTargetZone) {
			return false;
		}

		var oMovedOverlay = this.getMovedOverlay();
		var oMovedElement = oMovedOverlay.getElementInstance();
		var oTargetOverlay = oAggregationOverlay.getParent();
		var oMovedRelevantContainer = oMovedOverlay.getRelevantContainer();
		var oTargetElement = oTargetOverlay.getElementInstance();

		// determine target relevantContainer
		var vTargetRelevantContainerAfterMove = oAggregationOverlay.getDesignTimeMetadata().getRelevantContainerForPropagation(oMovedElement);
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
		if (oMovedOverlay.getParent().getElementInstance() !== oTargetElement) {
			// check if binding context is the same
			var aBindings = BindingsExtractor.getBindings(oMovedElement, oMovedElement.getModel());
			if (Object.keys(aBindings).length > 0 && oTargetElement.getBindingContext()) {
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
	 * Builds the Move command
	 * @return {any} Move command object
	 */
	RTAElementMover.prototype.buildMoveCommand = function() {

		var oMovedOverlay = this.getMovedOverlay();
		var oParentAggregationOverlay = oMovedOverlay.getParentAggregationOverlay();
		var oMovedElement = oMovedOverlay.getElementInstance();
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

		var oMove = this.getCommandFactory().getCommandFor(oRelevantContainer, "Move", {
			movedElements : [{
				element : oMovedElement,
				sourceIndex : iSourceIndex,
				targetIndex : iTargetIndex
			}],
			source : oSource,
			target : oTarget
		}, oParentAggregationOverlay.getDesignTimeMetadata());

		return oMove;

	};

	return RTAElementMover;
}, /* bExport= */ true);
