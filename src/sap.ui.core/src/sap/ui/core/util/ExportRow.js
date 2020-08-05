/*!
 * ${copyright}
 */

// Provides class sap.ui.core.util.ExportRow
sap.ui.define(['sap/ui/base/ManagedObject', './ExportCell'],
	function(ManagedObject, ExportCell) {
	'use strict';

	/**
	 * Constructor for a new ExportRow.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * Internally used in {@link sap.ui.core.util.Export Export}.
	 * @extends sap.ui.base.ManagedObject
	 *
	 * @author SAP SE
	 * @version ${version}
	 * @since 1.22.0
	 *
	 * @public
	 * @deprecated Since version 1.73
	 * @alias sap.ui.core.util.ExportRow
	 */
	var ExportRow = ManagedObject.extend("sap.ui.core.util.ExportRow", {
		metadata: {
			library: "sap.ui.core",
			aggregations: {
				/**
				 * Cells for the Export.
				 */
				cells: {
					type: "sap.ui.core.util.ExportCell",
					multiple: true
				}
			}
		}
	});

	return ExportRow;

});
