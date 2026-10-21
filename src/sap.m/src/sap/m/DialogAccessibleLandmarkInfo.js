/*!
 * ${copyright}
 */

// Provides control sap.m.DialogAccessibleLandmarkInfo.
sap.ui.define(['sap/ui/core/Element', './library'],
	function(Element, library) {
	"use strict";


	/**
	 * Constructor for a new <code>sap.m.DialogAccessibleLandmarkInfo</code> element.
	 *
	 * @param {string} [sId] ID for the new element, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new element
	 *
	 * @class
	 * Settings for accessible landmarks which can be applied to the structural regions of a
	 * <code>sap.m.Dialog</code> control.
	 *
	 * By default the Dialog exposes its <code>Header</code>, <code>Content</code> and <code>Footer</code>
	 * as separate <code>region</code> landmarks. This element lets app developers suppress a region or
	 * provide a custom accessible name for it. It does not allow reassigning a region to a different
	 * ARIA landmark role.
	 *
	 * @example
	 * // suppress the Content region and relabel the Header region
	 * oDialog.setLandmarkInfo(new sap.m.DialogAccessibleLandmarkInfo({
	 *     showContentLandmark: false,
	 *     headerLabel: "Order details"
	 * }));
	 *
	 * @extends sap.ui.core.Element
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.155
	 * @alias sap.m.DialogAccessibleLandmarkInfo
	 */
	var DialogAccessibleLandmarkInfo = Element.extend("sap.m.DialogAccessibleLandmarkInfo", /** @lends sap.m.DialogAccessibleLandmarkInfo.prototype */ { metadata : {

		library : "sap.m",
		properties : {
			/**
			 * Defines whether the Header region of the corresponding <code>sap.m.Dialog</code> is exposed as a landmark.
			 */
			showHeaderLandmark : {type : "boolean", defaultValue : true},

			/**
			 * Defines the accessible name of the Header landmark.
			 *
			 * Only relevant when the Header landmark is exposed. If not set, a predefined text is used.
			 */
			headerLabel : {type : "string", defaultValue : null},

			/**
			 * Defines whether the Content region of the corresponding <code>sap.m.Dialog</code> is exposed as a landmark.
			 */
			showContentLandmark : {type : "boolean", defaultValue : true},

			/**
			 * Defines the accessible name of the Content landmark.
			 *
			 * Only relevant when the Content landmark is exposed. If not set, a predefined text is used.
			 */
			contentLabel : {type : "string", defaultValue : null},

			/**
			 * Defines whether the Footer region of the corresponding <code>sap.m.Dialog</code> is exposed as a landmark.
			 */
			showFooterLandmark : {type : "boolean", defaultValue : true},

			/**
			 * Defines the accessible name of the Footer landmark.
			 *
			 * Only relevant when the Footer landmark is exposed. If not set, a predefined text is used.
			 */
			footerLabel : {type : "string", defaultValue : null}
		}
	}});

	return DialogAccessibleLandmarkInfo;
});
