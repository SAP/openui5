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

		return MessageListItemRenderer;

	}, /* bExport= */ true);
