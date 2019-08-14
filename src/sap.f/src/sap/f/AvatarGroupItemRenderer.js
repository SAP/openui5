/*!
 * ${copyright}
 */

// Provides default renderer for control sap.f.AvatarGroupItemRenderer
sap.ui.define(["sap/f/library"],
	function (library) {
		"use strict";

		/**
		 * <code>AvatarGroupItem</code> renderer.
		 * @author SAP SE
		 * @namespace
		 */
		var AvatarGroupItemRenderer = {
			apiVersion: 2
		};

		/**
		 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
		 *
		 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the Render-Output-Buffer
		 * @param {sap.ui.core.Control} oAvatarGroupItem an object representation of the control that should be rendered
		 */
		AvatarGroupItemRenderer.render = function (oRm, oAvatarGroupItem) {
			oRm.openStart("div", oAvatarGroupItem)
				.class("sapFAvatarGroupItem")
				.class("sapFAvatarGroupItem" + oAvatarGroupItem._sAvatarDisplaySize);

			if (oAvatarGroupItem._getGroupType() === "Individual") {
				oRm.attr("tabindex", 0);
			}

			oRm.openEnd();
			oRm.renderControl(oAvatarGroupItem._getAvatar());
			oRm.close("div");
		};

		return AvatarGroupItemRenderer;
	}, /* bExport= */ true);