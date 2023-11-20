/*!
 * ${copyright}
 */

sap.ui.define(["sap/m/Column"], function (mColumn) {
	"use strict";

	/**
	 * Constructor for a new Column.
	 *
	 * @param {string} [sId] ID for the new control. It is generated automatically if an ID is not provided.
	 * @param {object} [mSettings] Initial settings for the new control.
	 *
	 * @class The <code>sap.m.upload.Column</code> allows defining personalization properties for a column. This Element is built on {@link sap.m.Column sap.m.column}.<br>
	 * It is supposed to be used only with the columns aggregation of {@link sap.m.upload.UploadSetwithTable UploadSetwithTable} control.
	 * @extends sap.m.Column
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @experimental since 1.120
	 * @since 1.120
	 * @alias sap.m.upload.Column
	 */
	const Column = mColumn.extend("sap.m.upload.Column", {
		metadata: {
			library: "sap.m",
			properties: {
				/**
				 * Defines the text that is used for column inside personalization dialog.
				 */
				columnPersonalizationText: { type: "string", defaultValue: "" },
				/**
				 * Defines the model path that is used for applying personalization.
				 */
				path: { type: "string", defaultValue: "" },
				/**
				 * Defines if the column is used in sort panel.
				 */
				sortable: { type: "boolean", defaultValue: true },
				/**
				 * Defines if the column is used in a group panel.
				 */
				groupable: { type: "boolean", defaultValue: true },
				/**
				 * Defines if the column is used in filter panel.
				 */
				filterable: { type: "boolean", defaultValue: true }
			}
		}
	});

	return Column;
});
