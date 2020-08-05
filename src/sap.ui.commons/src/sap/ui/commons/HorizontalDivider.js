/*!
 * ${copyright}
 */

// Provides control sap.ui.commons.HorizontalDivider.
sap.ui.define([
	'./library',
	'sap/ui/core/Control',
	'./HorizontalDividerRenderer'
],
	function(library, Control, HorizontalDividerRenderer) {
	"use strict";



	// shortcut for sap.ui.commons.HorizontalDividerHeight
	var HorizontalDividerHeight = library.HorizontalDividerHeight;

	// shortcut for sap.ui.commons.HorizontalDividerType
	var HorizontalDividerType = library.HorizontalDividerType;



	/**
	 * Constructor for a new HorizontalDivider.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * Divides the screen in visual areas.
	 * @extends sap.ui.core.Control
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @deprecated Since version 1.38.
	 * @alias sap.ui.commons.HorizontalDivider
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var HorizontalDivider = Control.extend("sap.ui.commons.HorizontalDivider", /** @lends sap.ui.commons.HorizontalDivider.prototype */ { metadata : {

		library : "sap.ui.commons",
		properties : {
			/**
			 * Defines the width of the divider.
			 */
			width : {type : "sap.ui.core.CSSSize", group : "Appearance", defaultValue : '100%'},

			/**
			 * Defines the type of the divider.
			 */
			type : {type : "sap.ui.commons.HorizontalDividerType", group : "Appearance", defaultValue : HorizontalDividerType.Area},

			/**
			 * Defines the height of the divider.
			 */
			height : {type : "sap.ui.commons.HorizontalDividerHeight", group : "Appearance", defaultValue : HorizontalDividerHeight.Medium}
		}
	}});

	// No Behaviour

	return HorizontalDivider;

});