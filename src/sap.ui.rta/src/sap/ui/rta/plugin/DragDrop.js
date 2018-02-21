/*!
 * ${copyright}
 */

// Provides class sap.ui.rta.plugin.DragDrop.
sap.ui.define([
	'jquery.sap.global',
	'sap/ui/dt/plugin/ControlDragDrop',
	'sap/ui/rta/plugin/RTAElementMover',
	'sap/ui/rta/plugin/Plugin',
	'sap/ui/rta/Utils',
	'sap/ui/dt/OverlayRegistry'
],
function(
	jQuery,
	ControlDragDrop,
	RTAElementMover,
	Plugin,
	Utils,
    OverlayRegistry
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
	 * @extends sap.ui.dt.ControlDragDrop
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
		metadata : {
			// ---- object ----

			// ---- control specific ----
			library : "sap.ui.rta",
			properties : {
				commandFactory : {
					type : "object",
					multiple : false
				}
			},
			events : {
				dragStarted : {},

				elementModified : {
					command : {
						type : "sap.ui.rta.command.BaseCommand"
					}
				}
			}
		}
	});

	// Extends the DragDrop Plugin with all the functions from our rta base plugin
	Utils.extendWith(DragDrop.prototype, Plugin.prototype, function(vDestinationValue, vSourceValue, sProperty, mDestination, mSource) {
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
	DragDrop.prototype.registerElementOverlay = function(oOverlay) {
		ControlDragDrop.prototype.registerElementOverlay.apply(this, arguments);
		Plugin.prototype.registerElementOverlay.apply(this, arguments);
	};

	/**
	 * Additionally to super->deregisterOverlay this method detatches the browser events
	 * @param  {sap.ui.dt.Overlay} oOverlay overlay object
	 * @override
	 */
	DragDrop.prototype.deregisterElementOverlay = function(oOverlay) {
		ControlDragDrop.prototype.deregisterElementOverlay.apply(this, arguments);
		Plugin.prototype.removeFromPluginsList.apply(this, arguments);
		this._detachMovableBrowserEvents(oOverlay);
	};

	/**
	 * @param  {sap.ui.dt.Overlay} oOverlay overlay object
	 * @private
	 */
	DragDrop.prototype._attachMovableBrowserEvents = function(oOverlay) {
		oOverlay.attachBrowserEvent("mouseover", this._onMouseOver, this);
		oOverlay.attachBrowserEvent("mouseleave", this._onMouseLeave, this);
	};

	/**
	 * @param  {sap.ui.dt.Overlay} oOverlay overlay object
	 * @private
	 */
	DragDrop.prototype._detachMovableBrowserEvents = function(oOverlay) {
		oOverlay.detachBrowserEvent("mouseover", this._onMouseOver, this);
		oOverlay.detachBrowserEvent("mouseleave", this._onMouseLeave, this);
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

		oOverlay.$().addClass("sapUiRtaOverlayPlaceholder");
	};

	/**
	 * Additionally to super->onDragEnd this method takes care about moving the element
	 * @param  {sap.ui.dt.Overlay} oOverlay overlay object
	 * @override
	 */
	DragDrop.prototype.onDragEnd = function(oOverlay) {
		this.fireElementModified({
			"command" : this.getElementMover().buildMoveCommand()
		});

		oOverlay.$().removeClass("sapUiRtaOverlayPlaceholder");
		oOverlay.setSelected(true);
		oOverlay.focus();

		ControlDragDrop.prototype.onDragEnd.apply(this, arguments);
	};

	/**
	 * If overlay is draggable attach browser events o overlay. If not remove them.
	 * @param  {sap.ui.dt.Overlay} oOverlay overlay object
	 * @override
	 */
	DragDrop.prototype.onMovableChange = function(oOverlay) {
		ControlDragDrop.prototype.onMovableChange.apply(this, arguments);
		if (oOverlay.isMovable()) {
			this._attachMovableBrowserEvents(oOverlay);
		} else {
			this._detachMovableBrowserEvents(oOverlay);
		}
	};
	/**
	 * Handle mouse over event
	 * @param  {sap.ui.base.Event} oEvent event object
	 * @private
	 */
	DragDrop.prototype._onMouseOver = function(oEvent) {
		var oOverlay = OverlayRegistry.getOverlay(oEvent.currentTarget.id);
		if (oOverlay !== this._oPreviousHoverTarget) {
			if (this._oPreviousHoverTarget) {
				this._oPreviousHoverTarget.$().removeClass("sapUiRtaOverlayHover");
			}
			this._oPreviousHoverTarget = oOverlay;
			oOverlay.$().addClass("sapUiRtaOverlayHover");
		}
		oEvent.preventDefault();
		oEvent.stopPropagation();

	};

	/**
	 * Handle mouse leave event
	 * @param  {sap.ui.base.Event} oEvent event object
	 * @private
	 */
	DragDrop.prototype._onMouseLeave = function(oEvent) {
		if (this._oPreviousHoverTarget) {
			this._oPreviousHoverTarget.$().removeClass("sapUiRtaOverlayHover");
		}
		delete this._oPreviousHoverTarget;
		oEvent.preventDefault();
		oEvent.stopPropagation();
	};

	return DragDrop;
}, /* bExport= */ true);
