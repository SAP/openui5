/*!
 * ${copyright}
 */

// Provides class sap.ui.core.util.ExportCell
sap.ui.define(['sap/ui/core/Element'],
	function(Element) {
	'use strict';

	/**
	 * Constructor for a new ExportCell.
	 * 
	 * @param {string} [sId] id for the new control, generated automatically if no id is given 
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * Contains content that can be used to export data. Used in {@link sap.ui.core.util.ExportColumn ExportColumn} / {@link sap.ui.core.util.Export Export}.
	 * @extends sap.ui.core.Element
	 *
	 * @author SAP SE
	 * @version ${version}
	 * @since 1.22.0
	 *
	 * @constructor
	 * @public
	 * @alias sap.ui.core.util.ExportCell
	 */
	var ExportCell = Element.extend('sap.ui.core.util.ExportCell', {
		metadata: {
			library: "sap.ui.core",
			properties: {
				/**
				 * Cell content.
				 */
				content: 'string'
			}
		}
	});

	return ExportCell;

});
