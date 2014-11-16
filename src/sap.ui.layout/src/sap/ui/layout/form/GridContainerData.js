/*!
 * ${copyright}
 */

// Provides control sap.ui.layout.form.GridContainerData.
sap.ui.define(['jquery.sap.global', 'sap/ui/core/LayoutData', 'sap/ui/layout/library'],
	function(jQuery, LayoutData, library) {
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
	 * @extends sap.ui.core.LayoutData
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.16.0
	 * @alias sap.ui.layout.form.GridContainerData
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var GridContainerData = LayoutData.extend("sap.ui.layout.form.GridContainerData", /** @lends sap.ui.layout.form.GridContainerData.prototype */ { metadata : {
	
		library : "sap.ui.layout",
		properties : {
	
			/**
			 * If set the container takes half the width of the form (8cells), if not it's the full width (16 cells).
			 * If the GridLayout is set to be singleColumn the full width of the Grid is only 8 cells. So containers are rendered only one per row.
			 */
			halfGrid : {type : "boolean", group : "Misc", defaultValue : false}
		}
	}});
	
	///**
	// * This file defines behavior for the control, 
	// */
	//sap.ui.commons.form.GridLayoutdata.prototype.init = function(){
	//   // do something for initialization...
	//};
	

	return GridContainerData;

}, /* bExport= */ true);
