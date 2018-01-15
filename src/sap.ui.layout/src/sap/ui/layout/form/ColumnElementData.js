/*!
 * ${copyright}
 */

// Provides control sap.ui.layout.form.ColumnElementData.
sap.ui.define(['sap/ui/core/LayoutData', 'sap/ui/layout/library'],
	function(LayoutData, library) {
	"use strict";

	/**
	 * Constructor for a new sap.ui.layout.form.ColumnElementData.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * The <code>ColumnLayout</code>-specific layout data for the <code>FormElement</code> content fields.
	 *
	 * One <code>FormElement</code> element contains 12 cells and has two sizes, small and large.
	 * Using <code>ColumnElementData</code>, the default calculation of the cells used for a field or label
	 * can be overwritten.
	 * @extends sap.ui.core.LayoutData
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.54.0
	 * @alias sap.ui.layout.form.ColumnElementData
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var ColumnElementData = LayoutData.extend("sap.ui.layout.form.ColumnElementData", /** @lends sap.ui.layout.form.ColumnElementData.prototype */ { metadata : {

		library : "sap.ui.layout",
		properties : {

			/**
			 * Number of cells used by a field if the <code>FormElement</code> element is large.
			 * The label is then beside the fields per default.
			 *
			 * If set to <code>12</code>, the full size of the <code>FormElement</code> element is used.
			 */
			cellsLarge : {type : "sap.ui.layout.form.ColumnCells", group : "Appearance", defaultValue : 8},

			/**
			 * Number of cells used by a field if the <code>FormElement</code> element is small.
			 * The label is then above the fields per default.
			 *
			 * If set to <code>12</code>, the full size of the <code>FormElement</code> is used.
			 */
			cellsSmall : {type : "sap.ui.layout.form.ColumnCells", group : "Appearance", defaultValue : 12}
		}
	}});

	return ColumnElementData;

});
