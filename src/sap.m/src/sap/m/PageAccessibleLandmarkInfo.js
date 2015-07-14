/*!
 * ${copyright}
 */

// Provides control sap.m.PageAccessibleLandmarkInfo.
sap.ui.define(['sap/ui/core/Element', './library'],
	function(Element, library) {
	"use strict";


	/**
	 * Constructor for a new <code>sap.m.PageAccessibleLandmarkInfo</code> element.
	 *
	 * @param {string} [sId] Id for the new element, generated automatically if no id is given
	 * @param {object} [mSettings] Initial settings for the new element
	 *
	 * @class
	 * Settings for accessible landmarks which can be applied to the container elements of a <code>sap.m.Page</code> control.
	 * These landmarks are e.g. used by assistive technologies (like screenreaders) to provide a meaningful page overview.
	 * @extends sap.ui.core.Element
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @alias sap.m.PageAccessibleLandmarkInfo
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var PageAccessibleLandmarkInfo = Element.extend("sap.m.PageAccessibleLandmarkInfo", /** @lends sap.m.PageAccessibleLandmarkInfo.prototype */ { metadata : {

		library : "sap.m",
		properties : {
			/**
			 * Landmark role of the root container of the corresponding <code>sap.m.Page</code> control.
			 *
			 * If set to <code>sap.ui.core.AccessibleLandmarkRole.None</code>, no landmark will be added to the container.
			 */
			rootRole : {type : "sap.ui.core.AccessibleLandmarkRole", defaultValue : "Region"},

			/**
			 * Texts which describes the landmark of the root container of the corresponding <code>sap.m.Page</code> control.
			 *
			 * If not set (and a landmark different than <code>sap.ui.core.AccessibleLandmarkRole.None</code> is defined), a predefined text
			 * is used.
			 */
			rootLabel : {type : "string", defaultValue : null},

			/**
			 * Landmark role of the content container of the corresponding <code>sap.m.Page</code> control.
			 *
			 * If set to <code>sap.ui.core.AccessibleLandmarkRole.None</code>, no landmark will be added to the container.
			 */
			contentRole : {type : "sap.ui.core.AccessibleLandmarkRole", defaultValue : "Main"},

			/**
			 * Texts which describes the landmark of the content container of the corresponding <code>sap.m.Page</code> control.
			 *
			 * If not set (and a landmark different than <code>sap.ui.core.AccessibleLandmarkRole.None</code> is defined), a predefined text
			 * is used.
			 */
			contentLabel : {type : "string", defaultValue : null},

			/**
			 * Landmark role of the header container of the corresponding <code>sap.m.Page</code> control.
			 *
			 * If set to <code>sap.ui.core.AccessibleLandmarkRole.None</code>, no landmark will be added to the container.
			 */
			headerRole : {type : "sap.ui.core.AccessibleLandmarkRole", defaultValue : "Region"},

			/**
			 * Texts which describes the landmark of the header container of the corresponding <code>sap.m.Page</code> control.
			 *
			 * If not set (and a landmark different than <code>sap.ui.core.AccessibleLandmarkRole.None</code> is defined), a predefined text
			 * is used.
			 */
			headerLabel : {type : "string", defaultValue : null},

			/**
			 * Landmark role of the subheader container of the corresponding <code>sap.m.Page</code> control.
			 *
			 * If set to <code>sap.ui.core.AccessibleLandmarkRole.None</code>, no landmark will be added to the container.
			 */
			subHeaderRole : {type : "sap.ui.core.AccessibleLandmarkRole", defaultValue : null},

			/**
			 * Texts which describes the landmark of the subheader container of the corresponding <code>sap.m.Page</code> control.
			 *
			 * If not set (and a landmark different than <code>sap.ui.core.AccessibleLandmarkRole.None</code> is defined), a predefined text
			 * is used.
			 */
			subHeaderLabel : {type : "string", defaultValue : null},

			/**
			 * Landmark role of the footer container of the corresponding <code>sap.m.Page</code> control.
			 *
			 * If set to <code>sap.ui.core.AccessibleLandmarkRole.None</code>, no landmark will be added to the container.
			 */
			footerRole : {type : "sap.ui.core.AccessibleLandmarkRole", defaultValue : "Region"},

			/**
			 * Texts which describes the landmark of the header container of the corresponding <code>sap.m.Page</code> control.
			 *
			 * If not set (and a landmark different than <code>sap.ui.core.AccessibleLandmarkRole.None</code> is defined), a predefined text
			 * is used.
			 */
			footerLabel : {type : "string", defaultValue : null}
		}
	}});

	/**
	 * Returns the landmark information of the given <code>sap.m.PageAccessibleLandmarkInfo</code> instance
	 * of the given area (e.g. <code>"root"</code>).
	 *
	 * Must only be used with the <code>sap.m.Page</code> control!
	 *
	 * @private
	 */
	PageAccessibleLandmarkInfo._getLandmarkInfo = function(oInstance, sArea) {
		if (!oInstance) {
			return null;
		}

		var sRole = null;
		var sText = null;

		var oPropertyInfo = oInstance.getMetadata().getProperty(sArea + "Role");
		if (oPropertyInfo) {
			sRole = oInstance[oPropertyInfo._sGetter]();
		}

		if (!sRole) {
			return null;
		}

		oPropertyInfo = oInstance.getMetadata().getProperty(sArea + "Label");
		if (oPropertyInfo) {
			sText = oInstance[oPropertyInfo._sGetter]();
		}

		return [sRole.toLowerCase(), sText];
	};

	/**
	 * Writes the landmark information of the given page and area (e.g. <code>"root"</code>).
	 *
	 * Must only be used with the <code>sap.m.Page</code> control!
	 *
	 * @private
	 */
	PageAccessibleLandmarkInfo._writeLandmarkInfo = function(oRm, oPage, sArea) {
		if (!sap.ui.getCore().getConfiguration().getAccessibility()) {
			return;
		}
		var oInfo = PageAccessibleLandmarkInfo._getLandmarkInfo(oPage.getLandmarkInfo(), sArea);
		if (!oInfo) {
			return;
		}

		var oLandMarks = {
			role: oInfo[0]
		};

		if (oInfo[1]) {
			oLandMarks["label"] =  oInfo[1];
		}

		oRm.writeAccessibilityState(oPage, oLandMarks);
	};

	return PageAccessibleLandmarkInfo;
});
