/*!
 * ${copyright}
 */

// Provides control sap.ui.demokit.HexagonButtonGroup.
sap.ui.define(['sap/ui/core/Control', './library', "./HexagonButtonGroupRenderer"],
	function(Control, library, HexagonButtonGroupRenderer) {
	"use strict";

	/**
	 * Constructor for a new HexagonButtonGroup.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * A group of HexagonButtons, aligned in a packed grid
	 * @extends sap.ui.core.Control
	 * @version ${version}
	 *
	 * @constructor
	 * @private
	 * @ui5-restricted sdk
	 * @alias sap.ui.demokit.HexagonButtonGroup
	 */
	var HexagonButtonGroup = Control.extend("sap.ui.demokit.HexagonButtonGroup", /** @lends sap.ui.demokit.HexagonButtonGroup.prototype */ { metadata : {

		library : "sap.ui.demokit",
		properties : {

			/**
			 * How many buttons might be placed in the same row of the grid
			 */
			colspan : {type : "int", group : "Misc", defaultValue : 3}
		},
		aggregations : {

			/**
			 * The buttons to layout in a grid
			 */
			buttons : {type : "sap.ui.demokit.HexagonButton", multiple : true, singularName : "button"}
		}
	}});

	return HexagonButtonGroup;

});
