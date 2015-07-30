/*!
 * ${copyright}
 */

// Provides control sap.ui.layout.form.GridElementData.
sap.ui.define(['jquery.sap.global', 'sap/ui/core/LayoutData', 'sap/ui/layout/library'],
	function(jQuery, LayoutData, library) {
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
	 * @extends sap.ui.core.LayoutData
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.16.0
	 * @alias sap.ui.layout.form.GridElementData
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var GridElementData = LayoutData.extend("sap.ui.layout.form.GridElementData", /** @lends sap.ui.layout.form.GridElementData.prototype */ { metadata : {
	
		library : "sap.ui.layout",
		properties : {
	
			/**
			 * Number of cells in horizontal direction.
			 * If "auto" the size is determined by the number of fields and the available cells. For Labels the auto size is 3 cells.
			 * If "full" only one field is allowed within the element. It gets the full width of the row and the label is displayed above. For Labels Full size has no effect.
			 */
			hCells : {type : "sap.ui.layout.form.GridElementCells", group : "Appearance", defaultValue : 'auto'},
	
			/**
			 * Number of cells in vertical direction.
			 * This property has no effect for labels.
			 */
			vCells : {type : "int", group : "Appearance", defaultValue : 1}
		}
	}});
	
	///**
	// * This file defines behavior for the control, 
	// */
	//sap.ui.commons.form.GridElementData.prototype.init = function(){
	//   // do something for initialization...
	//};
	

	return GridElementData;

}, /* bExport= */ true);
