/*!
 * ${copyright}
 */

// Provides control sap.f.FlexibleColumnLayoutAccessibleLandmarkInfo.
sap.ui.define(['sap/ui/core/Element', './library'],
	function(Element, library) {
	"use strict";


	/**
	 * Constructor for a new <code>sap.f.FlexibleColumnLayoutAccessibleLandmarkInfo</code> element.
	 *
	 * @param {string} [sId] ID for the new element, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new element
	 *
	 * @class
	 * Settings for accessible landmarks which can be applied to the container elements of a <code>sap.f.FlexibleColumnLayout</code> control.
	 * For example, these landmarks are used by assistive technologies (such as screen readers) to provide a meaningful columns overview.
	 * @extends sap.ui.core.Element
	 *
	 * @author SAP SE
	 * @version ${version}
	 * @since 1.95
	 *
	 * @constructor
	 * @public
	 * @alias sap.f.FlexibleColumnLayoutAccessibleLandmarkInfo
	 */
	var FlexibleColumnLayoutAccessibleLandmarkInfo = Element.extend("sap.f.FlexibleColumnLayoutAccessibleLandmarkInfo", /** @lends sap.f.FlexibleColumnLayoutAccessibleLandmarkInfo.prototype */ { metadata : {

		library : "sap.f",
		properties : {
			/**
			 * Text that describes the landmark of the first column of the corresponding <code>sap.f.FlexibleColumnLayout</code> control.
			 *
			 * If not set, a predefined text is used.
			 */
			firstColumnLabel : {type : "string", defaultValue : null},

			/**
			 * Text that describes the landmark of the middle column of the corresponding <code>sap.f.FlexibleColumnLayout</code> control.
			 *
			 * If not set, a predefined text is used.
			 */
			middleColumnLabel : {type : "string", defaultValue : null},

			/**
			 * Text that describes the landmark of the last column of the corresponding <code>sap.f.FlexibleColumnLayout</code> control.
			 *
			 * If not set, a predefined text is used.
			 */
			lastColumnLabel : {type : "string", defaultValue : null},

			/**
			 * Text that describes the landmark of the back arrow of the first column in the corresponding <code>sap.f.FlexibleColumnLayout</code> control.
			 *
			 * If not set, a predefined text is used.
			 */
			firstColumnBackArrowLabel : {type : "string", defaultValue : null},

			/**
			 * Text that describes the landmark of forward arrow of the middle column in the corresponding <code>sap.f.FlexibleColumnLayout</code> control.
			 *
			 * If not set, a predefined text is used.
			 */
			middleColumnForwardArrowLabel : {type : "string", defaultValue : null},

			/**
			 * Text that describes the landmark of back arrow of the middle column in the corresponding <code>sap.f.FlexibleColumnLayout</code> control.
			 *
			 * If not set, a predefined text is used.
			 */
			middleColumnBackArrowLabel : {type : "string", defaultValue : null},

			/**
			 * Text that describes the landmark of forward arrow of the last column in the corresponding <code>sap.f.FlexibleColumnLayout</code> control.
			 *
			 * If not set, a predefined text is used.
			 */
			lastColumnForwardArrowLabel : {type : "string", defaultValue : null}
		}
	}});

	return FlexibleColumnLayoutAccessibleLandmarkInfo;
});
