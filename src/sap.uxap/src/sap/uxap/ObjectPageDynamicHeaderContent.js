/*!
 * ${copyright}
 */

// Provides control sap.uxap.ObjectPageDynamicHeaderContent.
sap.ui.define([
    'jquery.sap.global',
    './library',
    "./ObjectPageDynamicHeaderContentRenderer"
],
	function(jQuery, library, ObjectPageDynamicHeaderContentRenderer) {
		"use strict";

		try {
			sap.ui.getCore().loadLibrary("sap.f");
		} catch (e) {
			jQuery.sap.log.error("The control 'sap.uxap.ObjectPageDynamicHeaderContent' needs library 'sap.f'.");
			throw (e);
		}

		var DynamicPageHeader = sap.ui.requireSync("sap/f/DynamicPageHeader");

		/**
		 * Constructor for a new <code>ObjectPageDynamicHeaderContent</code>.
		 *
		 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
		 * @param {object} [mSettings] Initial settings for the new control
		 *
		 * @class
		 * Dynamic header content for the {@link sap.uxap.ObjectPageLayout ObjectPage}.
		 * @extends sap.f.DynamicPageHeader
		 * @implements sap.uxap.IHeaderContent
		 *
		 * @author SAP SE
		 * @version ${version}
		 *
		 * @constructor
		 * @public
		 * @alias sap.uxap.ObjectPageDynamicHeaderContent
		 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
		 * @since 1.52
		 */
		var ObjectPageDynamicHeaderContent = DynamicPageHeader.extend("sap.uxap.ObjectPageDynamicHeaderContent", /** @lends sap.uxap.ObjectPageDynamicHeaderContent.prototype */ { metadata : {

			interfaces : ["sap.uxap.IHeaderContent"],
			library : "sap.uxap"
		}});

		/**
		 * Required by the {@link sap.uxap.IHeaderContent} interface.
		 * @param aContent
		 * @param bVisible
		 * @param sContentDesign
		 * @param bPinnable
		 */
		ObjectPageDynamicHeaderContent.createInstance = function (aContent, bVisible, sContentDesign, bPinnable) {
			return new ObjectPageDynamicHeaderContent({
				content: aContent,
				visible: bVisible,
				pinnable: bPinnable
			});
		};

		/**
		 * Required by the {@link sap.uxap.IHeaderContent} interface.
		 * @returns {boolean}
		 */
		ObjectPageDynamicHeaderContent.prototype.supportsPinUnpin = function () {
			return true;
		};

		/**
		 * Required by the {@link sap.uxap.IHeaderContent} interface.
		 * @returns {boolean}
		 */
		ObjectPageDynamicHeaderContent.prototype.supportsChildPageDesign = function () {
			return false;
		};

		/**
		 * Required by the {@link sap.uxap.IHeaderContent} interface.
		 * @returns {boolean}
		 */
		ObjectPageDynamicHeaderContent.prototype.supportsAlwaysExpanded = function () {
			return false;
		};

		/**
		 * Required by the {@link sap.uxap.IHeaderContent} interface.
		 * @param sDesign
		 */
		ObjectPageDynamicHeaderContent.prototype.setContentDesign = function (sDesign) {
			// implementation not supported
		};

		return ObjectPageDynamicHeaderContent;

	});
