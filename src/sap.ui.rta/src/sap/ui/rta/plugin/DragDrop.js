/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/dt/plugin/ControlDragDrop",
	"sap/ui/dt/Util",
	"sap/ui/dt/OverlayRegistry",
	"sap/ui/rta/plugin/RTAElementMover",
	"sap/ui/rta/plugin/Plugin",
	"sap/ui/rta/Utils"
],
function(
	ControlDragDrop,
	DtUtil,
	OverlayRegistry,
	RTAElementMover,
	Plugin,
	Utils
) {
	"use strict";

	/**
	 * Constructor for a new DragDrop plugin.
	 *
	 * @param {string} [sId] id for the new object, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new object
	 *
	 * @class
	 * The DragDrop plugin adds functionality/styling required for RTA.
	 * @extends sap.ui.dt.plugin.ControlDragDrop
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @private
	 * @since 1.30
	 * @alias sap.ui.rta.plugin.DragDrop
	 * @experimental Since 1.30. This class is experimental and provides only limited functionality. Also the API might be changed in future.
	 */
	var DragDrop = ControlDragDrop.extend("sap.ui.rta.plugin.DragDrop", /** @lends sap.ui.rta.plugin.DragDrop.prototype */ {
		metadata: {
			library: "sap.ui.rta",
			properties: {
				commandFactory: {
					type: "object",
					multiple: false
				}
			},
			events: {
				dragStarted: {},

				elementModified: {
					command: {
						type: "sap.ui.rta.command.BaseCommand"
					}
				}
			}
		}
	});

	// Extends the DragDrop Plugin with all the functions from our rta base plugin
	Utils.extendWith(DragDrop.prototype, Plugin.prototype, function(vDestinationValue, vSourceValue, sProperty) {
		return sProperty !== "getMetadata";
	});

	/**
	 * @override
	 */
	DragDrop.prototype.init = function() {
		ControlDragDrop.prototype.init.apply(this, arguments);
		this.setElementMover(new RTAElementMover({commandFactory: this.getCommandFactory()}));
	};

	DragDrop.prototype.setCommandFactory = function(oCommandFactory) {
		this.setProperty("commandFactory", oCommandFactory);
		this.getElementMover().setCommandFactory(oCommandFactory);
	};

	/**
	 * @override
	 */
	DragDrop.prototype._isEditable = function(oOverlay, mPropertyBag) {
		return this.getElementMover().isEditable(oOverlay, mPropertyBag.onRegistration);
	};

	/**
	 * Register an overlay
	 * @param  {sap.ui.dt.Overlay} oOverlay overlay object
	 * @override
	 */
	DragDrop.prototype.registerElementOverlay = function() {
		ControlDragDrop.prototype.registerElementOverlay.apply(this, arguments);
		Plugin.prototype.registerElementOverlay.apply(this, arguments);
	};

	/**
	 * Additionally to super->deregisterOverlay this method detatches the browser events
	 * @param  {sap.ui.dt.Overlay} oOverlay overlay object
	 * @override
	 */
	DragDrop.prototype.deregisterElementOverlay = function() {
		ControlDragDrop.prototype.deregisterElementOverlay.apply(this, arguments);
		Plugin.prototype.removeFromPluginsList.apply(this, arguments);
	};

	/**
	 * Additionally to super->onDragStart this method stores the parent's id in an instance variable
	 * @param  {sap.ui.dt.Overlay} oOverlay overlay object
	 * @override
	 */
	DragDrop.prototype.onDragStart = function(oOverlay) {
		this.fireDragStarted();

		ControlDragDrop.prototype.onDragStart.apply(this, arguments);

		this.getSelectedOverlays().forEach(function(oOverlay) {
			oOverlay.setSelected(false);
		});

		oOverlay.getDomRef().classList.add("sapUiRtaOverlayPlaceholder");
	};

	/**
	 * Additionally to super->onDragEnd this method takes care of moving the element
	 * and updating the relevant overlays on the source and target aggregations.
	 * @param  {sap.ui.dt.Overlay} oOverlay overlay object
	 * @override
	 */
	DragDrop.prototype.onDragEnd = function(oOverlay) {
		this.getElementMover().buildMoveCommand()

		.then(function(oCommand) {
			this.fireElementModified({
				command: oCommand
			});

			oOverlay.getDomRef().classList.remove("sapUiRtaOverlayPlaceholder");
			oOverlay.setSelected(true);
			oOverlay.focus();

			ControlDragDrop.prototype.onDragEnd.apply(this, arguments);

			this._updateRelevantOverlays();
		}.bind(this))

		.catch(function(vError) {
			throw DtUtil.propagateError(
				vError,
				"DragDrop#onDragEnd",
				"Error accured during onDragEnd execution",
				"sap.ui.rta.plugin");
		});
	};

	/**
	 * If overlay is draggable attach browser events o overlay. If not remove them.
	 * @param  {sap.ui.dt.Overlay} oOverlay overlay object
	 * @override
	 */
	DragDrop.prototype.onMovableChange = function() {
		ControlDragDrop.prototype.onMovableChange.apply(this, arguments);
	};

	/**
	 * Triggers evaluateEditable on the relevant overlays from the source and target
	 * container of the last move, to ensure that they are up-to-date.
	 * For example: if one element is removed from an aggregation and there is a single
	 * element left on the this aggregation, that element should no longer be movable.
	 */
	DragDrop.prototype._updateRelevantOverlays = function() {
		var mParentInformation = this.getElementMover().getSourceAndTargetParentInformation();
		var oSourceParent = mParentInformation.sourceParentInformation.parent;
		var oTargetParent = mParentInformation.targetParentInformation.parent;
		var sSourceAggregation = mParentInformation.sourceParentInformation.aggregation;
		var sTargetAggregation = mParentInformation.targetParentInformation.aggregation;
		var aSourceChildren = oSourceParent && oSourceParent.getAggregation(sSourceAggregation);
		var aRelevantOverlays = [];
		if (aSourceChildren && aSourceChildren.length > 0) {
			var oSourceChildOverlay = OverlayRegistry.getOverlay(aSourceChildren[0]);
			aRelevantOverlays = this._getRelevantOverlays(oSourceChildOverlay, sSourceAggregation);
		}
		if (
			oTargetParent &&
			(
				oTargetParent !== oSourceParent ||
				((oTargetParent === oSourceParent) && (sSourceAggregation !== sTargetAggregation))
			)
		) {
			var aTargetChildren = oTargetParent && oTargetParent.getAggregation(sTargetAggregation);
			if (aTargetChildren && aTargetChildren.length > 1) {
				var iTargetIndex = mParentInformation.targetParentInformation.index;
				// We can't pass the moved overlay to _getRelevantOverlays as it returns the siblings before the move
				// we need a previously existing element from the target aggregation - before or after the insert index
				var oTargetChild = aTargetChildren[iTargetIndex + 1] || aTargetChildren[iTargetIndex - 1];
				var oTargetChildOverlay = OverlayRegistry.getOverlay(oTargetChild);
				var aTargetRelevantOverlays = this._getRelevantOverlays(oTargetChildOverlay, sTargetAggregation);
				aRelevantOverlays = aRelevantOverlays.concat(aTargetRelevantOverlays);
			}
		}
		if (aRelevantOverlays.length > 0) {
			//Remove duplicates (e.g. when the parent is the same)
			aRelevantOverlays = aRelevantOverlays.filter(function(oRelevantOverlay, iIndex, aSource) {
				return iIndex === aSource.indexOf(oRelevantOverlay);
			});
			this.evaluateEditable(aRelevantOverlays, {onRegistration: false});
		}
	};

	return DragDrop;
});