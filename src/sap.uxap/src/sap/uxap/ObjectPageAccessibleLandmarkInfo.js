/*!
 * ${copyright}
 */

// Provides control sap.uxap.ObjectPageAccessibleLandmarkInfo.
sap.ui.define(['sap/ui/core/Element', './library'],
	function(Element, library) {
	"use strict";


	/**
	 * Constructor for a new <code>sap.uxap.ObjectPageAccessibleLandmarkInfo</code> element.
	 *
	 * @param {string} [sId] ID for the new element, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new element
	 *
	 * @class
	 * Settings for accessible landmarks which can be applied to the container elements of a <code>sap.uxap.ObjectPageLayout</code> control.
	 * These landmarks are used by assistive technologies (such as screenreaders) to provide a meaningful page overview.
	 * @extends sap.ui.core.Element
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @alias sap.uxap.ObjectPageAccessibleLandmarkInfo
	 * @since 1.61
	 */
	var ObjectPageAccessibleLandmarkInfo = Element.extend("sap.uxap.ObjectPageAccessibleLandmarkInfo", /** @lends sap.uxap.ObjectPageAccessibleLandmarkInfo.prototype */ { metadata : {

		library : "sap.uxap",
		properties : {
			/**
			 * Landmark role of the root container of the corresponding <code>sap.uxap.ObjectPageLayout</code> control.
			 *
			 * If set to <code>sap.ui.core.AccessibleLandmarkRole.None</code>, no landmark will be added to the container.
			 */
			rootRole : {type : "sap.ui.core.AccessibleLandmarkRole", defaultValue : "Main"},

			/**
			 * Texts which describe the landmark of the root container of the corresponding <code>sap.uxap.ObjectPageLayout</code> control.
			 *
			 * If not set (and a landmark different than <code>sap.ui.core.AccessibleLandmarkRole.None</code> is defined), no label is set.
			 */
			rootLabel : {type : "string", defaultValue : null},

			/**
			 * Landmark role of the content container of the corresponding <code>sap.uxap.ObjectPageLayout</code> control.
			 *
			 * If set to <code>sap.ui.core.AccessibleLandmarkRole.None</code>, no landmark will be added to the container.
			 */
			contentRole : {type : "sap.ui.core.AccessibleLandmarkRole", defaultValue : "None"},

			/**
			 * Texts which describe the landmark of the content container of the corresponding <code>sap.uxap.ObjectPageLayout</code> control.
			 *
			 * If not set (and a landmark different than <code>sap.ui.core.AccessibleLandmarkRole.None</code> is defined), no label is set.
			 */
			contentLabel : {type : "string", defaultValue : null},

			/**
			 * Landmark role of the navigation container of the corresponding <code>sap.uxap.ObjectPageLayout</code> control.
			 *
			 * If set to <code>sap.ui.core.AccessibleLandmarkRole.None</code>, no landmark will be added to the container.
			 */
			navigationRole : {type : "sap.ui.core.AccessibleLandmarkRole", defaultValue : "Navigation"},

			/**
			 * Texts which describe the landmark of the navigation container of the corresponding <code>sap.uxap.ObjectPageLayout</code> control.
			 *
			 * If not set (and a landmark different than <code>sap.ui.core.AccessibleLandmarkRole.None</code> is defined), no label is set.
			 */
			navigationLabel : {type : "string", defaultValue : null},

			/**
			 * Landmark role of the header container of the corresponding <code>sap.uxap.ObjectPageLayout</code> control.
			 *
			 * If set to <code>sap.ui.core.AccessibleLandmarkRole.None</code>, no landmark will be added to the container.
			 */
			headerRole : {type : "sap.ui.core.AccessibleLandmarkRole", defaultValue : "Banner"},

			/**
			 * Texts which describe the landmark of the header container of the corresponding <code>sap.uxap.ObjectPageLayout</code> control.
			 *
			 * If not set (and a landmark different than <code>sap.ui.core.AccessibleLandmarkRole.None</code> is defined), no label is set.
			 */
			headerLabel : {type : "string", defaultValue : null},

			/**
			 * Landmark role of the footer container of the corresponding <code>sap.uxap.ObjectPageLayout</code> control.
			 *
			 * If set to <code>sap.ui.core.AccessibleLandmarkRole.None</code>, no landmark will be added to the container.
			 */
			footerRole : {type : "sap.ui.core.AccessibleLandmarkRole", defaultValue : "Region"},

			/**
			 * Texts which describe the landmark of the header container of the corresponding <code>sap.uxap.ObjectPageLayout</code> control.
			 *
			 * If not set (and a landmark different than <code>sap.ui.core.AccessibleLandmarkRole.None</code> is defined), no label is set.
			 */
			footerLabel : {type : "string", defaultValue : null},

			/**
			 * Texts which describe the landmark of the section inside the header container of the corresponding <code>sap.uxap.ObjectPageLayout</code> control.
			 *
			 * If not set, default "Expanded header" aria-label is set.
			 * @public
			 * @since 1.127.0
			 */

			headerContentLabel: {type : "string", defaultValue : null}
		}
	}});

	return ObjectPageAccessibleLandmarkInfo;
});
