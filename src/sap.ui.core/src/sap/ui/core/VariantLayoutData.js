/*!
 * ${copyright}
 */

// Provides control sap.ui.core.VariantLayoutData.
sap.ui.define(['./LayoutData', './library'],
	function(LayoutData) {
	"use strict";



	/**
	 * Constructor for a new VariantLayoutData.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * Allows to add multiple LayoutData to one control in case that an easy switch of layouts (e.g. in a Form) is needed.
	 * @extends sap.ui.core.LayoutData
	 * @version ${version}
	 *
	 * @public
	 * @since 1.9.2
	 * @alias sap.ui.core.VariantLayoutData
	 */
	var VariantLayoutData = LayoutData.extend("sap.ui.core.VariantLayoutData", /** @lends sap.ui.core.VariantLayoutData.prototype */ { metadata : {

		library : "sap.ui.core",
		aggregations : {

			/**
			 * Allows multiple LayoutData.
			 */
			multipleLayoutData : {type : "sap.ui.core.LayoutData", multiple : true, singularName : "multipleLayoutData"}
		}
	}});



	return VariantLayoutData;

});
