/*!
 * ${copyright}
 */

// Provides control sap.ui.commons.form.GridElementData.
sap.ui.define(['sap/ui/commons/library', 'sap/ui/layout/form/GridElementData'],
	function(library, LayoutGridElementData) {
	"use strict";



	/**
	 * Constructor for a new form/GridElementData.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * The grid specific layout data for FormElement fields.
	 * The width property of the elements is ignored since the width is defined by grid cells.
	 * @extends sap.ui.layout.form.GridElementData
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.9.1
	 * @deprecated Since version 1.16.0.
	 * moved to sap.ui.layout library. Please use this one.
	 * @alias sap.ui.commons.form.GridElementData
	 */
	var GridElementData = LayoutGridElementData.extend("sap.ui.commons.form.GridElementData", /** @lends sap.ui.commons.form.GridElementData.prototype */ { metadata : {

		deprecated : true,
		library : "sap.ui.commons"
	}});


	return GridElementData;

});
