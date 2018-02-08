/*!
 * ${copyright}
 */

// Provides control sap.uxap.ObjectPageDynamicHeaderTitle.
sap.ui.define([
    'jquery.sap.global',
    './library',
    'sap/uxap/ObjectPageDynamicHeaderContent',
    "./ObjectPageDynamicHeaderTitleRenderer"
],
	function(
	    jQuery,
		library,
		ObjectPageDynamicHeaderContent,
		ObjectPageDynamicHeaderTitleRenderer
	) {
		"use strict";

		try {
			sap.ui.getCore().loadLibrary("sap.f");
		} catch (e) {
			jQuery.sap.log.error("The control 'sap.uxap.ObjectPageDynamicHeaderTitle' needs library 'sap.f'.");
			throw (e);
		}

		var DynamicPageTitle = sap.ui.requireSync("sap/f/DynamicPageTitle");

		/**
		 * Constructor for a new <code>ObjectPageDynamicHeaderTitle</code>.
		 *
		 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
		 * @param {object} [mSettings] Initial settings for the new control
		 *
		 * @class
		 * Represents the static part (header title) of the dynamic header of the {@link sap.uxap.ObjectPageLayout}.
		 *
		 * <h3>Overview</h3>
		 *
		 * The <code>ObjectPageDynamicHeaderTitle</code> is used to represent the most important details of
		 * the displayed business object, such as the object title and actions that the user can perform.
		 *
		 *<b>Note:</b> The <code>ObjectPageDynamicHeaderTitle</code> is meant to be used inside the <code>ObjectPageLayout</code>
		 * control. Any other usage is not supported and can lead to unexpected behavior.
		 *
		 * @extends sap.f.DynamicPageTitle
		 * @implements sap.uxap.IHeaderTitle
		 *
		 * @author SAP SE
		 * @version ${version}
		 *
		 * @constructor
		 * @public
		 * @alias sap.uxap.ObjectPageDynamicHeaderTitle
		 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
		 * @since 1.52
		 * @see {@link topic:6e340c119ddd4c778b315f65a0432420 Object Page Dynamic Header}
		 * @see {@link topic:d2ef0099542d44dc868719d908e576d0 Object Page Headers}
		 * @see {@link topic:9c9d94fd28284539a9a5a57e9caf82a8 Object Page Headers Comparison}
		 */
		var ObjectPageDynamicHeaderTitle = DynamicPageTitle.extend("sap.uxap.ObjectPageDynamicHeaderTitle", /** @lends sap.uxap.ObjectPageDynamicHeaderTitle.prototype */ { metadata : {

			interfaces : ["sap.uxap.IHeaderTitle"],
			library : "sap.uxap"
		}});

		/**
		 * Required by the {@link sap.uxap.IHeaderTitle} interface.
		 * @returns {*}
		 */
		ObjectPageDynamicHeaderTitle.prototype.isDynamic = function () {
			return true;
		};

		/**
		 * Required by the {@link sap.uxap.IHeaderTitle} interface.
		 * @returns {*}
		 */
		ObjectPageDynamicHeaderTitle.prototype.getCompatibleHeaderContentClass = function () {
			return ObjectPageDynamicHeaderContent;
		};

		/**
		 * Required by the {@link sap.uxap.IHeaderTitle} interface.
		 * @returns {boolean}
		 */
		ObjectPageDynamicHeaderTitle.prototype.supportsTitleInHeaderContent = function () {
			return false;
		};

		/**
		 * Required by the {@link sap.uxap.IHeaderTitle} interface.
		 * @returns {boolean}
		 */
		ObjectPageDynamicHeaderTitle.prototype.supportsAdaptLayoutForDomElement = function () {
			return false;
		};

		ObjectPageDynamicHeaderTitle.KNOWN_HEADING_CONTROL_CLASS_NAMES = ["sap.m.Title", "sap.m.Text", "sap.m.FormattedText", "sap.m.Label"];

		/**
		 * Returns the text that represents the title of the page.
		 * Since the structure is not guaranteed, this is not universal for this header, and only covers the most common usage.
		 * Required by the {@link sap.uxap.IHeaderTitle} interface.
		 */
		ObjectPageDynamicHeaderTitle.prototype.getTitleText = function () {
			var oHeading = this.getHeading(),
				sClassName = oHeading && oHeading.getMetadata().getName();

			if (ObjectPageDynamicHeaderTitle.KNOWN_HEADING_CONTROL_CLASS_NAMES.indexOf(sClassName) > -1) {
				return oHeading.getText();
			}
		};

		/**
		 * Required by the {@link sap.uxap.IHeaderTitle} interface.
		 */
		ObjectPageDynamicHeaderTitle.prototype.getHeaderDesign = function () {
			return library.ObjectPageHeaderDesign.Light;
		};

		/**
		 * Required by the {@link sap.uxap.IHeaderTitle} interface.
		 */
		ObjectPageDynamicHeaderTitle.prototype.snap = function (bUserInteraction) {
			this._toggleState(false, bUserInteraction);
		};

		/**
		 * Required by the {@link sap.uxap.IHeaderTitle} interface.
		 */
		ObjectPageDynamicHeaderTitle.prototype.unSnap = function (bUserInteraction) {
			this._toggleState(true, bUserInteraction);
		};

		/**
		 * Required by the {@link sap.uxap.IHeaderTitle} interface.
		 * @param {object} jQuery reference to the header dom element
		 * @param {object} change event of child-element that brought the need to adapt the headerTitle layout
		 * @private
		 */
		ObjectPageDynamicHeaderTitle.prototype._adaptLayoutForDomElement = function ($headerDomRef, oEvent) {
			// not supported
		};

		return ObjectPageDynamicHeaderTitle;

	});
