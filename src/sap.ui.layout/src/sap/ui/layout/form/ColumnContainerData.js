/*!
 * ${copyright}
 */

// Provides control sap.ui.layout.form.ColumnContainerData.
sap.ui.define(['sap/ui/core/LayoutData', 'sap/ui/layout/library'],
	function(LayoutData, library) {
	"use strict";

	/**
	 * Constructor for a new sap.ui.layout.form.ColumnContainerData.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * The <code>ColumnLayout</code>-specific layout data for the <code>FormContainer</code> element.
	 *
	 * Depending on its size, the <code>Form</code> control is divided into 1, 2, 3 or 4 columns
	 * by the <code>ColumnLayout</code> control.
	 * Using <code>ColumnContainerData</code>, the size of the <code>FormContainer</code> element can be influenced.
	 * @extends sap.ui.core.LayoutData
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.54.0
	 * @alias sap.ui.layout.form.ColumnContainerData
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var ColumnContainerData = LayoutData.extend("sap.ui.layout.form.ColumnContainerData", /** @lends sap.ui.layout.form.ColumnContainerData.prototype */ { metadata : {

		library : "sap.ui.layout",
		properties : {

			/**
			 * Number of columns the <code>FormContainer</code> element uses if the <code>Form</code> control has extra-large size.
			 *
			 * The number of columns for extra-large size must not be smaller than the number of columns for large size.
			 */
			columnsXL : {type : "sap.ui.layout.form.ColumnsXL", group : "Appearance", defaultValue : 2},

			/**
			 * Number of columns the <code>FormContainer</code> element uses if the <code>Form</code> control has large size.
			 *
			 * The number of columns for large size must not be smaller than the number of columns for medium size.
			 */
			columnsL : {type : "sap.ui.layout.form.ColumnsL", group : "Appearance", defaultValue : 2},

			/**
			 * Number of columns the <code>FormContainer</code> element uses if the <code>Form</code> control has medium size.
			 */
			columnsM : {type : "sap.ui.layout.form.ColumnsM", group : "Appearance", defaultValue : 1}
		}
	}});

	return ColumnContainerData;

});
