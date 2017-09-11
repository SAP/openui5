/*!
 * ${copyright}
 */

// Provides control sap.ui.unified.CalendarLegendItem.
sap.ui.define(['sap/ui/core/Element', './library'],
	function(Element, library) {
	"use strict";

	// shortcut for sap.ui.unified.CalendarDayType
	var CalendarDayType = library.CalendarDayType;

	/**
	 * Constructor for a new CalendarLegendItem.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * Item to be displayed in a CalendarLegend.
	 * @extends sap.ui.core.Element
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.24.0
	 * @alias sap.ui.unified.CalendarLegendItem
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var CalendarLegendItem = Element.extend("sap.ui.unified.CalendarLegendItem", /** @lends sap.ui.unified.CalendarLegendItem.prototype */ { metadata : {

		library : "sap.ui.unified",
		properties : {

			/**
			 * Text to be displayed for the item.
			 */
			text : {type : "string", group : "Misc", defaultValue : null},

			/**
			 * Type of the item.
			 * If not set the type is automatically determined from the order of the items in the CalendarLegend.
			 * @since 1.28.9
			 */
			type : {type : "sap.ui.unified.CalendarDayType", group : "Appearance", defaultValue : CalendarDayType.None},

			/**
			 * Overrides the color derived from the <code>type</code> property.
			 * @since 1.46.0
			 */
			color: {type : "sap.ui.core.CSSColor", group : "Appearance", defaultValue : null}
		}
	}});

	///**
	// * This file defines behavior for the control,
	// */
	//sap.ui.unified.CalendarLegendItem.prototype.init = function(){
	//   // do something for initialization...
	//};


	return CalendarLegendItem;

});
