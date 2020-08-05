/*!
 * ${copyright}
 */

// Provides control sap.uxap.ObjectPageDynamicHeaderContent.
sap.ui.define([
	'./library',
	"./ObjectPageDynamicHeaderContentRenderer",
	"sap/base/Log"
],
	function(library, ObjectPageDynamicHeaderContentRenderer, Log) {
		"use strict";

		try {
			sap.ui.getCore().loadLibrary("sap.f");
		} catch (e) {
			Log.error("The control 'sap.uxap.ObjectPageDynamicHeaderContent' needs library 'sap.f'.");
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
		 * Header content for the dynamic header of the {@link sap.uxap.ObjectPageLayout}.
		 *
		 * <h3>Overview</h3>
		 *
		 * The <code>ObjectPageDynamicHeaderContent</code> represents the movable part of
		 * the <code>ObjectPageLayout</code>'s dynamic header. It can contain any control and
		 * scrolls along with the content of the page until it disappears (collapsed header).
		 * When scrolled back to the top it becomes visible again (expanded header).
		 * It contains all the additional information of the object.
		 *
		 * Documentation links:
		 * <ul>
		 * <li>{@link topic:d2ef0099542d44dc868719d908e576d0 Object Page Headers}</li>
		 * <li>{@link topic:6e340c119ddd4c778b315f65a0432420 Object Page Dynamic Header}</li>
		 * </ul>
		 *
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
		 * @param sStableId
		 */
		ObjectPageDynamicHeaderContent.createInstance = function (aContent, bVisible, sContentDesign, bPinnable, sStableId) {
			return new ObjectPageDynamicHeaderContent({
				content: aContent,
				visible: bVisible,
				pinnable: bPinnable,
				id: sStableId
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

		ObjectPageDynamicHeaderContent.prototype.setVisible = function (bVisible) {
			this.getParent() && this.getParent().toggleStyleClass("sapUxAPObjectPageLayoutNoHeaderContent", !bVisible);
			return this.setProperty("visible", bVisible);
		};

		return ObjectPageDynamicHeaderContent;

	});