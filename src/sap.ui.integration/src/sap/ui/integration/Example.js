/*!
 * ${copyright}
 */

// Provides control sap.ui.integration.Example.
sap.ui.define(['jquery.sap.global', './library', 'sap/ui/core/Control', './ExampleRenderer'],
	function(jQuery, library, Control) {
	"use strict";

	/**
	 * Constructor for a new Example control.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * Some class description goes here.
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @public
	 * @alias sap.ui.integration.Example
	 */
	var Example = Control.extend("sap.ui.integration.Example", /** @lends sap.ui.integration.Example.prototype */ { metadata : {

		library : "sap.ui.integration",
		properties : {

			/**
			 * text property
			 */
			text : {type : "string", group : "Data", defaultValue : null},

			/**
			 * title property
			 */
			title : {type : "string", group : "Misc", defaultValue : null}

		},
		events : {

			/**
			 * Event is fired when the user presses on the control.
			 */
			press : {}

		}

	}});

	return Example;

});
