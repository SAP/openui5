/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/base/ManagedObject",
	"sap/ui/layout/library"
], function (ManagedObject) {
	"use strict";

	/**
	 * Constructor for a new <code>sap.f.GridContainerSettings</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * Holds a set of settings that define the dimensions of <code>sap.f.GridContainer</code>
	 *
	 * Can be used to define the sizes of columns and rows for different screen sizes, by using the <code>layout</code> aggregations of <code>sap.f.GridContainer</code>.
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @extends sap.ui.base.ManagedObject
	 *
	 * @see {@link topic:32d4b9c2b981425dbc374d3e9d5d0c2e Grid Controls}
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @experimental Since 1.65 This class is experimental. The API may change.
	 * @since 1.65
	 * @public
	 * @constructor
	 * @alias sap.f.GridContainerSettings
	 * @ui5-metamodel This control/element will also be described in the UI5 (legacy) designtime metamodel
	 */
	var GridContainerSettings = ManagedObject.extend("sap.f.GridContainerSettings", {
		// TODO Allow only rem and px, because of IE
		metadata: {
			library: "sap.f",
			properties: {
				/**
				 * How many columns to have on a row.
				 *
				 * If not defined, <code>sap.f.GridContainer</code> will position as many columns as they can fit in the container.
				 */
				columns: { type: "Number" },

				/**
				 * The width of the columns.
				 */
				columnSize: { type: "sap.ui.core.CSSSize", defaultValue: "80px" },

				/**
				 * The height of the rows.
				 */
				rowSize: { type: "sap.ui.core.CSSSize", defaultValue: "80px" },

				/**
				 * The size of the gap between columns and rows.
				 */
				gap: { type: "sap.ui.core.CSSSize", defaultValue: "16px" }
			}
		}
	});

	return GridContainerSettings;
});