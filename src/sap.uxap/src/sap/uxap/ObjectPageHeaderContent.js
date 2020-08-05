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
		 * Constructor for a new <code>ObjectPageHeaderContent</code>.
		 *
		 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
		 * @param {object} [mSettings] Initial settings for the new control
		 *
		 * @class
		 * Header content for the classic header of the {@link sap.uxap.ObjectPageLayout}.
		 *
		 * <h3>Overview</h3>
		 *
		 * The <code>ObjectPageHeaderContent</code> represents the movable part of the
		 * <code>ObjectPageLayout</code>'s classic header. It can contain any control and scrolls along with
		 * the content of the page until it disappears (collapsed header). When scrolled back to the
		 * top it becomes visible again (expanded header). It contains all the additional information of the object.
		 *
		 * Documentation links:
		 * <ul>
		 * <li>{@link topic:d2ef0099542d44dc868719d908e576d0 Object Page Headers}</li>
		 * <li>{@link topic:0fecbce45e39406aa939bd25e89823f4 Object Page Classic Header}</li>
		 * <li>{@link https://experience.sap.com/fiori-design-web/object-page/ UX Guidelines: Object Page}</li>
		 * </ul>
		 *
		 * @see {@link fiori:https://experience.sap.com/fiori-design-web/snapping-header/#header-content Object Page Header Content}
		 *
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

					_placeholder: {type: "sap.m.Avatar", multiple: false, visibility: "hidden"}
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
					text: sap.ui.getCore().getLibraryResourceBundle("sap.uxap").getText(sBtnText),
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


		ObjectPageHeaderContent.prototype.setVisible = function (bVisible) {
			this.getParent() && this.getParent().toggleStyleClass("sapUxAPObjectPageLayoutNoHeaderContent", !bVisible);
			return this.setProperty("visible", bVisible);
		};

		/**
		 * Required by the {@link sap.uxap.IHeaderContent} interface.
		 * @param aContent
		 * @param bVisible
		 * @param sContentDesign
		 * @param bPinnable
		 * @param sStableId
		 */
		ObjectPageHeaderContent.createInstance = function (aContent, bVisible, sContentDesign, bPinnable, sStableId) {
			return new ObjectPageHeaderContent({
				content: aContent,
				visible: bVisible,
				contentDesign: sContentDesign,
				id: sStableId
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