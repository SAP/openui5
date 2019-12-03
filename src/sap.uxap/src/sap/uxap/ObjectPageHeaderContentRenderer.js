/*!
 * ${copyright}
 */

sap.ui.define([
	"./ObjectPageHeaderRenderer",
	"./ObjectImageHelper"], function (ObjectPageHeaderRenderer, ObjectImageHelper) {
	"use strict";

	/**
	 * @class HeaderContent renderer.
	 * @static
	 */
	var ObjectPageHeaderContentRenderer = {
		apiVersion: 2
	};

	ObjectPageHeaderContentRenderer.render = function (oRm, oControl) {
		var oParent = oControl.getParent(),
			bParentLayout = oParent && oParent.isA("sap.uxap.ObjectPageLayout"),
			oHeader = (oParent && bParentLayout) ? oParent.getHeaderTitle() : undefined,
			bRenderTitle = (oParent && bParentLayout) ? (oParent.isA("sap.uxap.ObjectPageLayout")
				&& oParent.getShowTitleInHeaderContent()) : false,
			bRenderEditBtn = bParentLayout && oParent.getShowEditHeaderButton() && oControl.getContent() && oControl.getContent().length > 0;

		if (bRenderEditBtn) {
			oRm.openStart("div", oControl)
				.class("sapUxAPObjectPageHeaderContentFlexBox")
				.class("sapUxAPObjectPageHeaderContentDesign-" + oControl.getContentDesign());

			if (oHeader) {
				oRm.class('sapUxAPObjectPageContentObjectImage-' + oHeader.getObjectImageShape());
			}
			oRm.openEnd();
		}

		oRm.openStart("div", bRenderEditBtn ? undefined : oControl);

		if (bRenderEditBtn) {
			oRm.class("sapUxAPObjectPageHeaderContentCellLeft");
		} else {
			oRm.class("sapUxAPObjectPageHeaderContentDesign-" + oControl.getContentDesign());
			if (oHeader) {
				oRm.class('sapUxAPObjectPageContentObjectImage-' + oHeader.getObjectImageShape());
			}
		}

		oRm.class("sapContrastPlus")
			.class("ui-helper-clearfix")
			.class("sapUxAPObjectPageHeaderContent");

		if (!oControl.getVisible()) {
			oRm.class("sapUxAPObjectPageHeaderContentHidden");
		}
		oRm.openEnd();

		if (bParentLayout && oParent.getIsChildPage()) {
			oRm.openStart("div")
				.class("sapUxAPObjectChildPage")
				.openEnd()
				.close("div");
		}

		if (bRenderTitle) {
			this._renderTitleImage(oRm, oControl, oHeader);

			if (oControl.getContent().length == 0) {
				oRm.openStart("span")
					.class("sapUxAPObjectPageHeaderContentItem")
					.openEnd();
				this._renderTitle(oRm, oHeader);
				oRm.close("span");
			}
		}

		oControl.getContent().forEach(function (oItem, iIndex) {
			this._renderHeaderContentItem(oItem, iIndex, oRm, bRenderTitle, oHeader, oControl);
		}, this);

		oRm.close("div");

		if (bRenderEditBtn) {
			this._renderEditButton(oRm, oControl);

			oRm.close("div"); // end of "sapUxAPObjectPageHeaderContentFlexBox" div
		}
	};

	/**
	 * This method is called to render the content
	 * @param {sap.ui.core.Control} oHeaderContentItem header content item
	 * @param {int} iIndex index
	 * @param {sap.ui.core.RenderManager} oRm oRm
	 * @param {boolean} bRenderTitle render title
	 * @param {sap.uxap.ObjectPageHeader} oTitle header title
	 * @param {sap.ui.core.Control} oControl control
	 */
	ObjectPageHeaderContentRenderer._renderHeaderContentItem = function (oHeaderContentItem, iIndex, oRm, bRenderTitle, oTitle, oControl) {
		var bHasSeparatorBefore = false,
			bHasSeparatorAfter = false,
			oLayoutData = oControl._getLayoutDataForControl(oHeaderContentItem),
			bIsFirstControl = iIndex === 0;

		if (oLayoutData) {
			bHasSeparatorBefore = oLayoutData.getShowSeparatorBefore();
			bHasSeparatorAfter = oLayoutData.getShowSeparatorAfter();

			oRm.openStart("span")
				.class("sapUxAPObjectPageHeaderWidthContainer")
				.class("sapUxAPObjectPageHeaderContentItem")
				.style("width", oLayoutData.getWidth());

			if (bHasSeparatorAfter || bHasSeparatorBefore) {
				oRm.class("sapUxAPObjectPageHeaderSeparatorContainer");
			}

			if (!oLayoutData.getVisibleL()) {
				oRm.class("sapUxAPObjectPageHeaderLayoutHiddenL");
			}
			if (!oLayoutData.getVisibleM()) {
				oRm.class("sapUxAPObjectPageHeaderLayoutHiddenM");
			}
			if (!oLayoutData.getVisibleS()) {
				oRm.class("sapUxAPObjectPageHeaderLayoutHiddenS");
			}

			oRm.openEnd();

			if (bHasSeparatorBefore) {
				oRm.openStart("span")
					.class("sapUxAPObjectPageHeaderSeparatorBefore")
					.openEnd()
					.close("span");
			}

			if (bIsFirstControl && bRenderTitle) { // render title inside the first contentItem
				this._renderTitle(oRm, oTitle);
			}
		} else {
			if (bIsFirstControl && bRenderTitle) { // render title inside the first contentItem
				oRm.openStart("span")
					.class("sapUxAPObjectPageHeaderContentItem")
					.openEnd();
				this._renderTitle(oRm, oTitle);
			} else {
				oHeaderContentItem.addStyleClass("sapUxAPObjectPageHeaderContentItem");
			}
		}

		oRm.renderControl(oHeaderContentItem);

		if (bHasSeparatorAfter) {
			oRm.openStart("span")
				.class("sapUxAPObjectPageHeaderSeparatorAfter")
				.openEnd()
				.close("span");
		}

		if (oLayoutData || (bIsFirstControl && bRenderTitle)) {
			oRm.close("span");
		}
	};

	/**
	 * This method is called to render title and all it's parts if the property showTitleInHeaderContent is set to true
	 *
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.core.Control} oControl an object representation of the control that should be rendered
	 * @param {sap.ui.core.Control} oHeader an object representation of the titleHeader that should be rendered
	 */
	ObjectPageHeaderContentRenderer._renderTitleImage = function (oRm, oControl, oHeader) {

		ObjectImageHelper._renderImageAndPlaceholder(oRm, {
			oHeader: oHeader,
			oObjectImage: oControl._getObjectImage(),
			oPlaceholder: oControl._getPlaceholder(),
			bIsObjectIconAlwaysVisible: false,
			bAddSubContainer: false,
			sBaseClass: 'sapUxAPObjectPageHeaderContentImageContainer'
		});
	};

	/**
	 * This method is called to render title and all it's parts if the property showTitleInHeaderContent is set to true
	 *
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.core.Control} oHeader an object representation of the control that should be rendered
	 */
	ObjectPageHeaderContentRenderer._renderTitle = function (oRm, oHeader) {
		ObjectPageHeaderRenderer._renderObjectPageTitle(oRm, oHeader, true); // force title to be visible inside the content header
	};

	/**
	 * This method is called to render the Edit button when the property showEditHeaderButton is set to true
	 *
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.core.Control} oHeader an object representation of the control that should be rendered
	 */
	ObjectPageHeaderContentRenderer._renderEditButton = function (oRm, oHeader) {
		oRm.openStart("div")
			.class("sapUxAPObjectPageHeaderContentCellRight")
			.openEnd();

		oRm.renderControl(oHeader.getAggregation("_editHeaderButton"));
		oRm.close("div");
	};

	return ObjectPageHeaderContentRenderer;

}, /* bExport= */ true);
