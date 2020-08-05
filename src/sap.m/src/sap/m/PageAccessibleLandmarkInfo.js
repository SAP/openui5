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
	 * @param {string} [sId] ID for the new element, generated automatically if no ID is given
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
			 * Texts that describe the landmark of the root container of the corresponding <code>sap.m.Page</code> control.
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
			 * Texts that describe the landmark of the content container of the corresponding <code>sap.m.Page</code> control.
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
			 * Texts that describe the landmark of the header container of the corresponding <code>sap.m.Page</code> control.
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
			subHeaderRole : {type : "sap.ui.core.AccessibleLandmarkRole", defaultValue : "None"},

			/**
			 * Texts that describe the landmark of the subheader container of the corresponding <code>sap.m.Page</code> control.
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
			 * Texts that describe the landmark of the footer container of the corresponding <code>sap.m.Page</code> control.
			 *
			 * If not set (and a landmark different than <code>sap.ui.core.AccessibleLandmarkRole.None</code> is defined), a predefined text
			 * is used.
			 */
			footerLabel : {type : "string", defaultValue : null}
		}
	}});

	return PageAccessibleLandmarkInfo;
});
