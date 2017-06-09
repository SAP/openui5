/*!
 * ${copyright}
 */

// Provides class sap.ui.rta.plugin.CutPaste.
sap.ui.define([
	'jquery.sap.global',
	'sap/ui/dt/plugin/CutPaste',
	'sap/ui/dt/OverlayUtil',
	'sap/ui/rta/plugin/Plugin',
	'sap/ui/rta/plugin/RTAElementMover'
],
function(jQuery,
		ControlCutPaste,
		OverlayUtil,
		Plugin,
		RTAElementMover) {
	"use strict";

	/**
	 * Constructor for a new CutPaste plugin.
	 *
	 * @param {string} [sId] id for the new object, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new object
	 *
	 * @class
	 * The CutPaste plugin adds functionality/styling required for RTA.
	 * @extends sap.ui.dt.plugin.CutPaste
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @private
	 * @since 1.30
	 * @alias sap.ui.rta.plugin.CutPaste
	 * @experimental Since 1.30. This class is experimental and provides only limited functionality. Also the API might be changed in future.
	 */
	var CutPaste = ControlCutPaste.extend("sap.ui.rta.plugin.CutPaste", /** @lends sap.ui.rta.plugin.CutPaste.prototype */ {
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

	/**
	 * @override
	 */
	CutPaste.prototype.init = function() {
		ControlCutPaste.prototype.init.apply(this, arguments);
		this.setElementMover(new RTAElementMover({commandFactory: this.getCommandFactory()}));
	};

	/**
	 * Register an overlay
	 * @param  {sap.ui.dt.Overlay} oOverlay overlay object
	 * @override
	 */
	CutPaste.prototype.registerElementOverlay = function(oOverlay) {
		ControlCutPaste.prototype.registerElementOverlay.apply(this, arguments);

		if (oOverlay.isMovable()) {
			Plugin.prototype.addToPluginsList.apply(this, arguments);
		}
	};

	/**
	 * Additionally to super->deregisterOverlay this method detatches the browser events
	 * @param  {sap.ui.dt.Overlay} oOverlay overlay object
	 * @override
	 */
	CutPaste.prototype.deregisterElementOverlay = function(oOverlay) {
		ControlCutPaste.prototype.deregisterElementOverlay.apply(this, arguments);
		Plugin.prototype.removeFromPluginsList.apply(this, arguments);
	};

	/**
	 * @override
	 */
	CutPaste.prototype.paste = function(oTargetOverlay) {

		this._executePaste(oTargetOverlay);

		this.fireElementModified({
			"command" : this.getElementMover().buildMoveCommand()
		});

		this.stopCutAndPaste();
	};

	return CutPaste;
}, /* bExport= */ true);
