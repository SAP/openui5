/*!
 * ${copyright}
 */
sap.ui.define(["./StandardListItemRenderer", "sap/ui/core/Renderer"],
	function (StandardListItemRenderer, Renderer) {
		"use strict";


		/**
		 * MessageListItem renderer.
		 * @namespace
		 */
		var MessageListItemRenderer = Renderer.extend(StandardListItemRenderer);
		MessageListItemRenderer.apiVersion = 2;

		MessageListItemRenderer.renderTitle = function (oRm, oControl) {
			if (oControl.getActiveTitle()) {
				oRm.renderControl(oControl.getLink());
				oRm.renderControl(oControl.getLinkAriaDescribedBy());
			} else {
				StandardListItemRenderer.renderTitle.apply(this, arguments);
			}
		};

		MessageListItemRenderer.renderTitleWrapper = function(rm, oLI) {

			var	sTitle = oLI.getTitle(),
				sDescription = oLI.getDescription(),
				sInfo = oLI.getInfo(),
				bWrapping = oLI.getWrapping(),
				bActiveTitle = oLI.getActiveTitle(),
				bShouldRenderInfoWithoutTitle = !sTitle && sInfo;

			rm.openStart("div");

			if (!bShouldRenderInfoWithoutTitle && sDescription) {
				rm.class("sapMSLITitle");
			} else {
				rm.class("sapMSLITitleOnly");
			}
			rm.openEnd();

			if (bWrapping && !bActiveTitle) {
				this.renderWrapping(rm, oLI, "title");
				if (sInfo && !sDescription) {
					this.renderInfo(rm, oLI);
				}
			} else {
				this.renderTitle(rm, oLI);
			}

			rm.close("div");

			if (sInfo && !sDescription && !bWrapping && !bShouldRenderInfoWithoutTitle) {
				this.renderInfo(rm, oLI);
			}
		};

		return MessageListItemRenderer;

	}, /* bExport= */ true);
