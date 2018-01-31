/*!
 * ${copyright}
 */

// Provides control sap.uxap.ObjectPageHeaderContent.
sap.ui.define([
    "sap/ui/core/Control",
    "./library",
    "sap/m/Button",
    "./ObjectImageHelper",
    "./ObjectPageHeaderContentRenderer"
],
	function(
	    Control,
		library,
		Button,
		ObjectImageHelper,
		ObjectPageHeaderContentRenderer
	) {
		"use strict";

		// shortcut for sap.uxap.ObjectPageHeaderDesign
		var ObjectPageHeaderDesign = library.ObjectPageHeaderDesign;

		/**
		 * Constructor for a new ObjectPageHeaderContent.
		 *
		 * @param {string} [sId] id for the new control, generated automatically if no id is given
		 * @param {object} [mSettings] initial settings for the new control
		 *
		 * @class
		 * ObjectPageHeaderContent represents the dynamic part of an Object page header. May contain any control.
		 * Unlike the Object page header title, the Object page header content is part of the scrolling area of the Object page.
		 * This enables it to hold any amount of information and still be usable on a mobile device.
		 * @extends sap.ui.core.Control
		 * @implements sap.uxap.IHeaderContent
		 *
		 * @author SAP SE
		 *
		 * @constructor
		 * @public
		 * @since 1.30
		 * @alias sap.uxap.ObjectPageHeaderContent
		 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
		 */
		var ObjectPageHeaderContent = Control.extend("sap.uxap.ObjectPageHeaderContent", /** @lends sap.uxap.ObjectPageHeaderContent.prototype */ {
			metadata: {

				library: "sap.uxap",
				interfaces: ["sap.uxap.IHeaderContent"],
				properties: {

					/**
					 * Determines the design of the header - Light or Dark.
					 * <b>Note: </b>This property is deprecated. It will continue to work in the Blue Crystal theme,
					 * but it will not be taken into account for the Belize themes.
					 * @deprecated Since version 1.40.1
					 */
					contentDesign: {
						type: "sap.uxap.ObjectPageHeaderDesign",
						group: "Misc",
						defaultValue: ObjectPageHeaderDesign.Light
					}
				},
				aggregations: {

					/**
					 * The list of Objects of type sap.ui.core.Control.
					 */
					content: {type: "sap.ui.core.Control", multiple: true, singularName: "content"},

					/**
					 *
					 * Internal aggregation for the "Edit Header" button.
					 */
					_editHeaderButton: {type: "sap.m.Button", multiple: false, visibility: "hidden"},

					_objectImage: {type: "sap.ui.core.Control", multiple: false, visibility: "hidden"},

					_placeholder: {type: "sap.ui.core.Icon", multiple: false, visibility: "hidden"}
				}
			}
		});


		ObjectPageHeaderContent.prototype.onBeforeRendering = function () {
			var oParent = this.getParent(),
				oEditHeaderButton = this.getAggregation("_editHeaderButton");

			if (oEditHeaderButton) {
				return;
			}

			if (oParent && (oParent instanceof library.ObjectPageLayout) && oParent.getShowEditHeaderButton()) {
				oEditHeaderButton = this._getInternalBtnAggregation("_editHeaderButton", "EDIT_HEADER", "-editHeaderBtn", "Transparent");
				oEditHeaderButton.attachPress(this._handleEditHeaderButtonPress, this);
			}
		};

		ObjectPageHeaderContent.prototype.exit = function () {
			var oEditHeaderButton = this.getAggregation("_editHeaderButton");

			if (oEditHeaderButton) {
				oEditHeaderButton.detachPress(this._handleEditHeaderButtonPress, this);
			}
		};

		ObjectPageHeaderContent.prototype._handleEditHeaderButtonPress = function (oEvent) {
			this.getParent().fireEditHeaderButtonPress();
		};

		ObjectPageHeaderContent.prototype._getInternalBtnAggregation = function (sAggregationName, sBtnText, sBtnIdText, sBtnType) {
			if (!this.getAggregation(sAggregationName)) {
				var oBtn = new Button({
					text: library.i18nModel.getResourceBundle().getText(sBtnText),
					type: sBtnType,
					id: this.getId() + sBtnIdText
				});
				this.setAggregation(sAggregationName, oBtn);
			}
			return this.getAggregation(sAggregationName);
		};

		ObjectPageHeaderContent.prototype._getObjectImage = function() {
			if (!this.getAggregation("_objectImage")) {

				var oParent = this.getParent(),
					oHeader = oParent && oParent.getHeaderTitle && oParent.getHeaderTitle(),
					oObjectImage = oHeader && ObjectImageHelper.createObjectImage(oHeader);

				if (oObjectImage) {
					this.setAggregation("_objectImage", oObjectImage, true); // this is always called before rendering, so suppress invalidate
				}
			}
			return this.getAggregation("_objectImage");
		};

		ObjectPageHeaderContent.prototype._destroyObjectImage = function(bSuppressInvalidate) {
			var oOldImage = this.getAggregation("_objectImage");
			if (oOldImage) {
				oOldImage.destroy();
				this.getAggregation("_objectImage", null, bSuppressInvalidate);
			}
		};

		ObjectPageHeaderContent.prototype._getPlaceholder = function() {
			if (!this.getAggregation("_placeholder")) {

				var oParent = this.getParent(),
					oHeader = oParent && oParent.getHeaderTitle && oParent.getHeaderTitle(),
					bShowPlaceholder = oHeader.getShowPlaceholder();

				var oPlaceholder = bShowPlaceholder && ObjectImageHelper.createPlaceholder();

				if (oPlaceholder) {
					this.setAggregation("_placeholder", oPlaceholder, true); // this is always called before rendering, so suppress invalidate
				}
			}
			return this.getAggregation("_placeholder");
		};

		/**
		 * The layout data to apply to a header cluster
		 * called from the renderer
		 * @private
		 */
		ObjectPageHeaderContent.prototype._getLayoutDataForControl = function (oControl) {
			var oLayoutData = oControl.getLayoutData();

			if (!oLayoutData) {
				return;
			} else if (oLayoutData instanceof library.ObjectPageHeaderLayoutData) {
				return oLayoutData;
			} else if (oLayoutData.getMetadata().getName() == "sap.ui.core.VariantLayoutData") {
				// multiple LayoutData available - search here
				var aLayoutData = oLayoutData.getMultipleLayoutData();
				for (var i = 0; i < aLayoutData.length; i++) {
					var oLayoutData2 = aLayoutData[i];
					if (oLayoutData2 instanceof library.ObjectPageHeaderLayoutData) {
						return oLayoutData2;
					}
				}
			}
		};

		/**
		 * Required by the {@link sap.uxap.IHeaderContent} interface.
		 * @param aContent
		 * @param bVisible
		 * @param sContentDesign
		 */
		ObjectPageHeaderContent.createInstance = function (aContent, bVisible, sContentDesign) {
			return new ObjectPageHeaderContent({
				content: aContent,
				visible: bVisible,
				contentDesign: sContentDesign
			});
		};

		/**
		 * Required by the {@link sap.uxap.IHeaderContent} interface.
		 * @returns {boolean}
		 */
		ObjectPageHeaderContent.prototype.supportsPinUnpin = function () {
			return false;
		};

		/**
		 * Required by the {@link sap.uxap.IHeaderContent} interface.
		 * @returns {boolean}
		 */
		ObjectPageHeaderContent.prototype.supportsChildPageDesign = function () {
			return true;
		};

		/**
		 * Required by the {@link sap.uxap.IHeaderContent} interface.
		 * @returns {boolean}
		 */
		ObjectPageHeaderContent.prototype.supportsAlwaysExpanded = function () {
			return true;
		};

		/**
		 * Required by the {@link sap.uxap.IHeaderContent} interface.
		 * @param {boolean} bToggle
		 * @private
		 */
		ObjectPageHeaderContent.prototype._toggleCollapseButton = function (bToggle) {

		};

		/**
		 * Required by the {@link sap.uxap.IHeaderContent} interface.
		 * @param {boolean} bValue
		 * @private
		 */
		ObjectPageHeaderContent.prototype._setShowCollapseButton = function (bValue) {

		};

		/**
		 * Required by the {@link sap.uxap.IHeaderContent} interface.
		 * @private
		 */
		ObjectPageHeaderContent.prototype._focusCollapseButton = function () {

		};

		/**
		 * Required by the {@link sap.uxap.IHeaderContent} interface.
		 * @private
		 */
		ObjectPageHeaderContent.prototype._focusPinButton = function () {

		};

		return ObjectPageHeaderContent;

	});
