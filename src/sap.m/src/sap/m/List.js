/*!
 * ${copyright}
 */

// Provides control sap.m.List.
sap.ui.define(["./library", "./ListBase", "./ListRenderer"],
	function(library, ListBase, ListRenderer) {
	"use strict";


	// shortcut for sap.m.BackgroundDesign
	var BackgroundDesign = library.BackgroundDesign;


	/**
	 * Constructor for a new List.
	 *
	 * @param {string} [sId] Id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * The List control provides a container for all types of list items.
	 * For mobile devices, the recommended limit of list items is 100 to assure proper performance. To improve initial rendering of large lists, use the "growing" feature. Please refer to the SAPUI5 Developer Guide for more information..
	 *
	 * See section "{@link topic:1da158152f644ba1ad408a3e982fd3df Lists}"
	 * in the documentation for an introduction to <code>sap.m.List</code> control.
	 *
	 * @extends sap.m.ListBase
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @alias sap.m.List
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var List = ListBase.extend("sap.m.List", /** @lends sap.m.List.prototype */ { metadata : {

		library : "sap.m",
		properties : {

			/**
			 * Sets the background style of the list. Depending on the theme, you can change the state of the background from <code>Solid</code> to <code>Translucent</code> or to <code>Transparent</code>.
			 * @since 1.14
			 */
			backgroundDesign : {type : "sap.m.BackgroundDesign", group : "Appearance", defaultValue : BackgroundDesign.Solid}
		}
	}});

	return List;

});
