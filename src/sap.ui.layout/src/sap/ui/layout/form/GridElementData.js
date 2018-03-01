/*!
 * ${copyright}
 */

// Provides control sap.ui.layout.form.GridElementData.
sap.ui.define(['sap/ui/core/LayoutData', 'sap/ui/layout/library'],
	function(LayoutData, library) {
	"use strict";

	/**
	 * Constructor for a new sap.ui.layout.form.GridElementData.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * The <code>GridLayout</code>-specific layout data for <code>FormElement</code> fields.
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
			 *
			 * If set to <code>auto</code>, the size is determined by the number of fields and the available cells. For labels the auto size is 3 cells.
			 *
			 * If set to <code>full</code>, only one field is allowed within the <code>FormElement</code>. It gets the full width of the row and the label is displayed above.
			 *
			 * <b>Note:</b> For labels, the full size setting has no effect.
			 */
			hCells : {type : "sap.ui.layout.form.GridElementCells", group : "Appearance", defaultValue : 'auto'},

			/**
			 * Number of cells in vertical direction.
			 *
			 * <b>Note:</b> This property has no effect on labels.
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

});
