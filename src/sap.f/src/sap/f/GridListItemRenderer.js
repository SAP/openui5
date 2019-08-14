/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/m/ListItemBaseRenderer",
	"sap/ui/core/Renderer",
	"sap/m/library"
], function(
	ListItemBaseRenderer,
	Renderer,
	mLibrary
) {
	"use strict";

	// shortcut for sap.m.ListType
	var ListItemType = mLibrary.ListType;

	// shortcut for sap.m.ListMode
	var ListMode = mLibrary.ListMode;

	// sap.m.ListBaseRenderer.ModeOrder - render 'mode' before
	var MODE_ORDER_BEFORE = -1;

	/**
	 * GridListItem renderer.
	 * @namespace
	 */
	var GridListItemRenderer = Renderer.extend(ListItemBaseRenderer);
	GridListItemRenderer.apiVersion = 2;

	/**
	 * Hook for changing list item attributes
	 *
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
	 * @param {sap.ui.core.Control} oLI An object representation of the control that should be rendered.
	 * @override
	 */
	GridListItemRenderer.renderLIAttributes = function (oRm, oLI) {
		oRm.class("sapFGLI");
	};

	/**
	 * Renders the former part of the item.
	 *
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
	 * @param {sap.ui.core.Control} oLI An object representation of the control that is rendered.
	 * @override
	 */
	GridListItemRenderer.renderContentFormer =  function (oRm, oLI) {
		this.renderHighlight(oRm, oLI);
	};

	/**
	 * Renders a wrapper where the header and the content will be put.
	 *
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
	 * @param {sap.ui.core.Control} oLI An object representation of the control that is rendered.
	 * @override
	 */
	GridListItemRenderer.renderLIContentWrapper = function (oRm, oLI) {

		oRm.openStart("div").class("sapFGLIWrapper").openEnd();
			this.renderToolbar(oRm, oLI);
			ListItemBaseRenderer.renderLIContentWrapper.apply(this, arguments);
		oRm.close("div");
	};

	/**
	 * Renders the latter part of the item.
	 *
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
	 * @param {sap.ui.core.Control} oLI An object representation of the control that is rendered.
	 * @override
	 */
	GridListItemRenderer.renderContentLatter = function (oRm, oLI) { };

	/**
	 * Renders the header toolbar of the item.
	 *
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
	 * @param {sap.ui.core.Control} oLI An object representation of the control that is rendered.
	 */
	GridListItemRenderer.renderToolbar = function (oRm, oLI) {

		var sMode = oLI.getMode(),
			bIsModeDelete = sMode === ListMode.Delete,
			sType = oLI.getType();

		if (!oLI.getCounter() && // no counter
			(sMode === "" || sMode === ListMode.None || sMode === ListMode.SingleSelectMaster) && // no mode
			(sType === ListItemType.Inactive || sType === ListItemType.Active)) { // and no type
			return;
		}

		oRm.openStart("div", oLI.getId() + "-gridListItemToolbar");
		oRm.class("sapFGLIToolbar");
		oRm.openEnd();

		if (!bIsModeDelete) {
			this.renderMode(oRm, oLI, MODE_ORDER_BEFORE);
		}

		this.renderToolbarSpacer(oRm);

		// delegate order of the Latter to the ListItemBaseRenderer
		ListItemBaseRenderer.renderContentLatter.apply(this, arguments);

		oRm.close("div");
	};

	/**
	 * Renders the content of the item.
	 *
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
	 * @param {sap.ui.core.Control} oLI An object representation of the control that is rendered.
	 * @override
	 */
	GridListItemRenderer.renderLIContent = function (oRm, oLI) {
		oLI.getContent().forEach(oRm.renderControl, oRm);
	};

	/**
	 * Renders a div inside the header toolbar, which serves as a spacer.
	 *
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
	 * @param {sap.ui.core.Control} oLI An object representation of the control that is rendered.
	 */
	GridListItemRenderer.renderToolbarSpacer = function (oRm) {
		oRm.openStart("div").class("sapFGLIToolbarSpacer").openEnd().close("div");
	};

	return GridListItemRenderer;
});
