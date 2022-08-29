/*!
 * ${copyright}
 */

// Provides control sap.f.shellBar.CoPilot.
sap.ui.define([
		"sap/ui/core/Control",
		"sap/ui/core/Configuration",
		"sap/f/shellBar/CoPilotRenderer"
	],
	function(Control, Configuration, CoPilotRenderer) {
	"use strict";

	/**
	 * Constructor for a new <code>CoPilot</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * Private control used by sap.f.ShellBar
	 *
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @private
	 * @since 1.64
	 * @alias sap.f.shellBar.CoPilot
	 */
	var CoPilot = Control.extend("sap.f.shellBar.CoPilot", /** @lends sap.f.shellBar.CoPilot.prototype */ { metadata : {
			library : "sap.f",
			events: {
				/**
				 * Fired when the user clicks or taps on the control.
				 */
				press : {}
			}
		},
		renderer: CoPilotRenderer
	});

	CoPilot.prototype.ontap = function(oEvent) {
		// mark the event for components that needs to know if the event was handled by the CoPilot
		oEvent.setMarked();

		this.firePress({/* no parameters */});
	};

	CoPilot.prototype.getAnimation = function () {
		return Configuration.getAnimationMode() !== Configuration.AnimationMode.none;
	};

	return CoPilot;
});
