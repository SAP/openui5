/*!
 * ${copyright}
 */

// Provides control sap.ui.commons.RowRepeaterSorter.
sap.ui.define(['./library', 'sap/ui/core/Element'],
	function(library, Element) {
	"use strict";



	/**
	 * Constructor for a new RowRepeaterSorter.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * This element is used by the RowRepeater and allows to define a sorter in this context along with the related data such as a text and an icon.
	 * @extends sap.ui.core.Element
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @deprecated Since version 1.38. Instead, use the <code>sap.ui.table.Table</code> control.
	 * @alias sap.ui.commons.RowRepeaterSorter
	 */
	var RowRepeaterSorter = Element.extend("sap.ui.commons.RowRepeaterSorter", /** @lends sap.ui.commons.RowRepeaterSorter.prototype */ { metadata : {

		library : "sap.ui.commons",
		deprecated: true,
		properties : {

			/**
			 * The sorter title if needed for display.
			 */
			text : {type : "string", group : "Appearance", defaultValue : null},

			/**
			 * The sorter icon if needed for display.
			 */
			icon : {type : "string", group : "Appearance", defaultValue : null},

			/**
			 * The sorter object.
			 */
			sorter : {type : "object", group : "Data", defaultValue : null}
		}
	}});


	return RowRepeaterSorter;

});
