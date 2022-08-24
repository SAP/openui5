/*!
 * ${copyright}
 */

// Provides control sap.ui.commons.form.GridContainerData.
sap.ui.define(['sap/ui/commons/library', 'sap/ui/layout/form/GridContainerData'],
	function(library, LayoutGridContainerData) {
	"use strict";



	/**
	 * Constructor for a new form/GridContainerData.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * Grid layout specific properties for FormContainers.
	 * The width and height properties of the elements are ignored since the witdh and heights are defined by the grid cells.
	 * @extends sap.ui.layout.form.GridContainerData
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.9.1
	 * @deprecated Since version 1.16.0.
	 * moved to sap.ui.layout library. Please use this one.
	 * @alias sap.ui.commons.form.GridContainerData
	 */
	var GridContainerData = LayoutGridContainerData.extend("sap.ui.commons.form.GridContainerData", /** @lends sap.ui.commons.form.GridContainerData.prototype */ { metadata : {

		deprecated : true,
		library : "sap.ui.commons"
	}});


	return GridContainerData;

});
