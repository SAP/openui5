/*!
 * ${copyright}
 */

// Provides default renderer for control sap.f.AvatarGroupRenderer
sap.ui.define([
	"sap/m/AvatarSize",
	"./library"], function (AvatarSize, library) {
	"use strict";

	/**
	 * <code>AvatarGroup</code> renderer.
	 * @author SAP SE
	 * @namespace
	 */
	var AvatarGroupRenderer = {
		apiVersion: 2
	};

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the Render-Output-Buffer
	 * @param {sap.f.AvatarGroup} oAvatarGroup an object representation of the control that should be rendered
	 */
	AvatarGroupRenderer.render = function (oRm, oAvatarGroup) {
		var sAvatarGroupClass = "sapFAvatarGroup",
			sGroupType = oAvatarGroup.getGroupType(),
			sAvatarDisplaySize = oAvatarGroup.getAvatarDisplaySize(),
			sAvatarCustomDisplaySize = oAvatarGroup.getAvatarCustomDisplaySize(),
			sAvatarCustomFontSize = oAvatarGroup.getAvatarCustomFontSize(),
			sAvatarGroupTypeClass = sAvatarGroupClass + sGroupType,
			aItems = oAvatarGroup.getItems(),
			bShowMoreButton = oAvatarGroup._shouldShowMoreButton(),
			bInteractive = oAvatarGroup.getProperty("_interactive"),
			sTooltip = oAvatarGroup.getTooltip_AsString();

		oRm.openStart("div", oAvatarGroup)
			.class(sAvatarGroupClass)
			.class(sAvatarGroupTypeClass)
			.class(sAvatarGroupClass + sAvatarDisplaySize);

		if (bShowMoreButton) {
			oRm.class("sapFAvatarGroupShowMore");
		}

		if (!bInteractive) {
			oRm.class("sapFAvatarGroupNonInteractive");
		}

		if (oAvatarGroup._bAutoWidth) {
			oRm.style("width", "auto");
		}

		if (sGroupType === library.AvatarGroupType.Group) {
			oRm.attr("role", "button");
		}

		if (sAvatarDisplaySize === AvatarSize.Custom) {
			oRm.style("height", sAvatarCustomDisplaySize);
			oRm.style("min-width", sAvatarCustomDisplaySize);
			oRm.style("font-size", sAvatarCustomFontSize);
			oRm.style("line-height", sAvatarCustomDisplaySize);
		}

		if (sTooltip && sGroupType === library.AvatarGroupType.Group) {
			oRm.attr("title", sTooltip);
		}

		oRm.openEnd();

		for (var i = 0; i < oAvatarGroup._iAvatarsToShow; i++) {
			oRm.renderControl(aItems[i]);
		}

		if (bShowMoreButton) {
			oRm.renderControl(oAvatarGroup._oShowMoreButton);
		}

		oRm.close("div");
	};

	return AvatarGroupRenderer;
});