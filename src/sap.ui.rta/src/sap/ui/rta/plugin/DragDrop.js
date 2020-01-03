/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/dt/plugin/ControlDragDrop",
	"sap/ui/dt/Util",
	"sap/ui/rta/plugin/RTAElementMover",
	"sap/ui/rta/plugin/Plugin",
	"sap/ui/rta/Utils"
],
function(
	ControlDragDrop,
	DtUtil,
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
		metadata : {
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

		oOverlay.$().addClass("sapUiRtaOverlayPlaceholder");
	};

	/**
	 * Additionally to super->onDragEnd this method takes care about moving the element
	 * @param  {sap.ui.dt.Overlay} oOverlay overlay object
	 * @override
	 */
	DragDrop.prototype.onDragEnd = function(oOverlay) {
		this.getElementMover().buildMoveCommand()

		.then(function(oCommand) {
			this.fireElementModified({
				command : oCommand
			});

			oOverlay.$().removeClass("sapUiRtaOverlayPlaceholder");
			oOverlay.setSelected(true);
			oOverlay.focus();

			ControlDragDrop.prototype.onDragEnd.apply(this, arguments);
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

	return DragDrop;
});