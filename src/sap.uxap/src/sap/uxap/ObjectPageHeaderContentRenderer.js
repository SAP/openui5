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
	var ObjectPageHeaderContentRenderer = {};

	ObjectPageHeaderContentRenderer.render = function (oRm, oControl) {
		var oParent = oControl.getParent(),
			bParentLayout = oParent && oParent.isA("sap.uxap.ObjectPageLayout"),
			oHeader = (oParent && bParentLayout) ? oParent.getHeaderTitle() : undefined,
			bRenderTitle = (oParent && bParentLayout) ? (oParent.isA("sap.uxap.ObjectPageLayout")
				&& oParent.getShowTitleInHeaderContent()) : false,
			bRenderEditBtn = bParentLayout && oParent.getShowEditHeaderButton() && oControl.getContent() && oControl.getContent().length > 0;

		if (bRenderEditBtn) {
			oRm.write("<div ");
			oRm.writeControlData(oControl);
			oRm.addClass("sapUxAPObjectPageHeaderContentFlexBox");
			oRm.addClass("sapUxAPObjectPageHeaderContentDesign-" + oControl.getContentDesign());
			if (oHeader) {
				oRm.addClass('sapUxAPObjectPageContentObjectImage-' + oHeader.getObjectImageShape());
			}
			oRm.writeClasses();
			oRm.write(">");
		}
		oRm.write("<div ");
		if (bRenderEditBtn) {
			oRm.addClass("sapUxAPObjectPageHeaderContentCellLeft");
		} else {
			oRm.writeControlData(oControl);
			oRm.addClass("sapUxAPObjectPageHeaderContentDesign-" + oControl.getContentDesign());
			if (oHeader) {
				oRm.addClass('sapUxAPObjectPageContentObjectImage-' + oHeader.getObjectImageShape());
			}
		}
		oRm.addClass("sapContrastPlus");
		oRm.addClass("ui-helper-clearfix");
		oRm.addClass("sapUxAPObjectPageHeaderContent");

		if (!oControl.getVisible()) {
			oRm.addClass("sapUxAPObjectPageHeaderContentHidden");
		}
		oRm.writeClasses();
		oRm.write(">");

		if (bParentLayout && oParent.getIsChildPage()) {
			oRm.write("<div");
			oRm.addClass('sapUxAPObjectChildPage');
			oRm.writeClasses();
			oRm.write("></div>");
		}

		if (bRenderTitle) {
			this._renderTitleImage(oRm, oControl, oHeader);

			if (oControl.getContent().length == 0) {
				oRm.write("<span class=\"sapUxAPObjectPageHeaderContentItem\">");
				this._renderTitle(oRm, oHeader);
				oRm.write("</span>");
			}
		}

		oControl.getContent().forEach(function (oItem, iIndex) {
			this._renderHeaderContentItem(oItem, iIndex, oRm, bRenderTitle, oHeader, oControl);
		}, this);

		oRm.write("</div>");

		if (bRenderEditBtn) {
			this._renderEditButton(oRm, oControl);

			oRm.write("</div>"); // end of "sapUxAPObjectPageHeaderContentFlexBox" div
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

			oRm.write("<span ");
			oRm.addClass("sapUxAPObjectPageHeaderWidthContainer");
			oRm.addClass("sapUxAPObjectPageHeaderContentItem");
			oRm.addStyle("width", oLayoutData.getWidth());
			oRm.writeStyles();

			if (bHasSeparatorAfter || bHasSeparatorBefore) {
				oRm.addClass("sapUxAPObjectPageHeaderSeparatorContainer");
			}

			if (!oLayoutData.getVisibleL()) {
				oRm.addClass("sapUxAPObjectPageHeaderLayoutHiddenL");
			}
			if (!oLayoutData.getVisibleM()) {
				oRm.addClass("sapUxAPObjectPageHeaderLayoutHiddenM");
			}
			if (!oLayoutData.getVisibleS()) {
				oRm.addClass("sapUxAPObjectPageHeaderLayoutHiddenS");
			}

			oRm.writeClasses();
			oRm.write(">");

			if (bHasSeparatorBefore) {
				oRm.write("<span class=\"sapUxAPObjectPageHeaderSeparatorBefore\"/>");
			}

			if (bIsFirstControl && bRenderTitle) { // render title inside the first contentItem
				this._renderTitle(oRm, oTitle);
			}
		} else {
			if (bIsFirstControl && bRenderTitle) { // render title inside the first contentItem
				oRm.write("<span class=\"sapUxAPObjectPageHeaderContentItem\">");
				this._renderTitle(oRm, oTitle);
			} else {
				oHeaderContentItem.addStyleClass("sapUxAPObjectPageHeaderContentItem");
			}
		}

		oRm.renderControl(oHeaderContentItem);

		if (bHasSeparatorAfter) {
			oRm.write("<span class=\"sapUxAPObjectPageHeaderSeparatorAfter\"/>");
		}

		if (oLayoutData || (bIsFirstControl && bRenderTitle)) {
			oRm.write("</span>");
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
		oRm.write("<div class=\"sapUxAPObjectPageHeaderContentCellRight\">");
		oRm.renderControl(oHeader.getAggregation("_editHeaderButton"));
		oRm.write("</div>");
	};

	return ObjectPageHeaderContentRenderer;

}, /* bExport= */ true);
