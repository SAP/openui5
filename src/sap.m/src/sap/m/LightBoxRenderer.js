/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/m/library"
], function (library) {
	"use strict";

	// shortcut for sap.m.LightBoxLoadingStates
	var LightBoxLoadingStates = library.LightBoxLoadingStates;

	/**
	 * LightBox renderer.
	 * @namespace
	 */
	var LightBoxRenderer = {
		apiVersion: 2
	};

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRM The RenderManager that can be used for writing to the render output buffer
	 * @param {sap.m.LightBox} oControl An object representation of the control that should be rendered
	 */
	LightBoxRenderer.render = function (oRM, oControl) {
		/** @type {sap.m.LightBoxItem} */
		var oLightBoxItem = oControl._getImageContent();

		/** @type {sap.m.LightBoxLoadingStates} */
		var oImageState = oLightBoxItem._getImageState();

		var oInvisiblePopupText = oControl.getAggregation("_invisiblePopupText");

		oRM.openStart("div", oControl)
			.class("sapMLightBox")
			.attr("tabindex", "-1")
			.accessibilityState({
				role: "dialog",
				modal: true,
				labelledby: oInvisiblePopupText && oInvisiblePopupText.getId()
			});

		if (oLightBoxItem.getSubtitle()) {
			oRM.class("sapMLightBoxTwoLines");
		}

		if (oControl._bIsLightBoxBiggerThanMinDimensions) {
			oRM.class("sapMLightBoxTopCornersRadius");
		}

		if (oImageState === LightBoxLoadingStates.TimeOutError || oImageState === LightBoxLoadingStates.Error) {
			oRM.class("sapMLightBoxError");
			oRM.style("width", "auto");
			oRM.style("height", "auto");
		} else {
			oRM.style("width", oControl._iWidth + "px");
			oRM.style("height", oControl._iHeight + "px");
		}

		oRM.openEnd();

		oRM.renderControl(oInvisiblePopupText);

		if (oImageState === LightBoxLoadingStates.Loading) {
			this.renderBusyState(oRM, oControl);
		} else if (oImageState === LightBoxLoadingStates.TimeOutError || oImageState === LightBoxLoadingStates.Error) {
			this.renderError(oRM, oControl);
		} else {
			this.renderImage(oRM, oControl);
		}

		this.renderFooter(oRM, oControl, oLightBoxItem);

		oRM.close("div");

		oControl._isRendering = false;
	};

	LightBoxRenderer.renderImage = function (oRM, oControl) {
		var oLightBoxItem = oControl._getImageContent();

		oRM.openStart("div", oLightBoxItem);

		if (oLightBoxItem.getSubtitle()) {
			oRM.class("sapMLightBoxImageContainerTwoLines");
		} else {
			oRM.class("sapMLightBoxImageContainer");
		}

		oRM.openEnd();

		oRM.renderControl(oLightBoxItem.getAggregation("_image"));

		oRM.close("div");
	};

	LightBoxRenderer.renderError = function (oRM, oControl) {
		var oLightBoxItem = oControl._getImageContent();

		oRM.openStart("div");

		if (oLightBoxItem && oLightBoxItem.getSubtitle()) {
			oRM.class("sapMLightBoxErrorContainerTwoLines");
		} else {
			oRM.class("sapMLightBoxErrorContainer");
		}

		oRM.openEnd();

		oRM.renderControl(oControl.getAggregation("_errorMessage"));

		oRM.close("div");
	};

	LightBoxRenderer.renderBusyState = function (oRM, oControl) {
		oRM.renderControl(oControl._getBusyIndicator());
	};

	LightBoxRenderer.renderFooter = function (oRM, oControl, oImageContent) {
		var oTitle = oImageContent.getAggregation("_title"),
			oSubtitle = oImageContent.getAggregation("_subtitle");

		oRM.openStart("div")
			.class("sapMLightBoxFooter")
			.class("sapContrast")
			.class("sapContrastPlus");

		if (oImageContent.getSubtitle()) {
			oRM.class("sapMLightBoxFooterTwoLines");
		}

		oRM.openEnd();

		oRM.openStart("div")
			.class("sapMLightBoxTitleSection")
			.openEnd();

		if (oTitle) {
			oRM.renderControl(oTitle.addStyleClass("sapMLightBoxTitle"));
		}

		if (oSubtitle && oSubtitle.getText()) {
			oRM.renderControl(oSubtitle.addStyleClass("sapMLightBoxSubtitle"));
		}

		oRM.close("div");

		oRM.renderControl(oControl._getCloseButton());

		oRM.close("div");
	};

	return LightBoxRenderer;
}, /* bExport= */ true);