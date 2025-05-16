/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/core/Element"
], (
	Element
) => {
	"use strict";

	/**
	 * Constructor for a new <code>ColumnSettings</code>.
	 *
	 * @param {string} [sId] Optional ID for the new object; generated automatically if no non-empty ID is given
	 * @param {object} [mSettings] Initial settings for the new object
	 *
	 * @class The table type info class for the metadata-driven table.
	 * @extends sap.ui.core.Element
	 * @version ${version}
	 * @author SAP SE
	 * @constructor
	 * @public
	 * @alias sap.ui.mdc.table.ColumnSettings
	 * @since 1.110
	 */

	const ColumnSettings = Element.extend("sap.ui.mdc.table.ColumnSettings", {
		metadata: {
			library: "sap.ui.mdc",
			"abstract": true
		}
	});

	return ColumnSettings;
});