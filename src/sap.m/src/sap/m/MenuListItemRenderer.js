/*!
 * ${copyright}
 */

sap.ui.define(['./ListItemBaseRenderer', 'sap/ui/core/Renderer', 'sap/m/library', 'sap/ui/core/library'],
	function(ListItemBaseRenderer, Renderer, library, coreLibrary) {
		"use strict";

		// shortcut for sap.ui.core.TextDirection
		var TextDirection = coreLibrary.TextDirection;

		// shortcut for sap.m.ListType
		var ListType = library.ListType;

		/**
		 * <code>MenuListItem</code> renderer.
		 * @namespace
		 */
		var MenuListItemRenderer = Renderer.extend(ListItemBaseRenderer);

		/**
		 * Renders the HTML starting tag of the <code>MenuListItem</code>.
		 *
		 * @param {sap.ui.core.RenderManager} rm The RenderManager that can be used for writing to the Render-Output-Buffer
		 * @param {sap.ui.core.Control} oLI an object representation of the control that should be rendered
		 * @protected
		 */
		MenuListItemRenderer.openItemTag = function(rm, oLI) {
			if (oLI.getStartsSection()) {
				rm.write("<li ");
				rm.write("role=\"separator\" ");
				rm.write("class=\"sapUiMnuDiv\"><div class=\"sapUiMnuDivL\"></div><hr><div class=\"sapUiMnuDivR\"></div></li>");
			}

			ListItemBaseRenderer.openItemTag(rm, oLI);
		};

		/**
		 * Renders the HTML for the given control, using the provided
		 * {@link sap.ui.core.RenderManager}.
		 *
		 * @param {sap.ui.core.RenderManager}
		 *          rm the RenderManager that can be used for writing to the
		 *          Render-Output-Buffer
		 * @param {sap.ui.core.Control}
		 *          oLI an object representation of the control that should be
		 *          rendered
		 */
		MenuListItemRenderer.renderLIAttributes = function(rm, oLI) {
			rm.addClass("sapMSLI");
			if (oLI.getIcon()) {
				rm.addClass("sapMSLIIcon");
			}
			if (oLI.getType() == ListType.Detail || oLI.getType() == ListType.DetailAndActive) {
				rm.addClass("sapMSLIDetail");
			}

			if (oLI._hasSubItems()) {
				rm.addClass("sapMMenuLIHasChildren");
			}
		};

		MenuListItemRenderer.renderLIContent = function(rm, oLI) {
			var sTextDir = oLI.getTitleTextDirection();

			// image
			if (oLI.getIcon()) {
				rm.renderControl(oLI._getImage((oLI.getId() + "-img"), "sapMMenuLIImgThumb", oLI.getIcon(), oLI.getIconDensityAware()));
			}

			rm.write("<div");
			rm.addClass("sapMSLIDiv");
			rm.addClass("sapMSLITitleDiv");
			rm.writeClasses();
			rm.write(">");

			//noFlex: make an additional div for the contents table
			if (oLI._bNoFlex) {
				rm.write('<div class="sapMLIBNoFlex">');
			}

			// List item text (also written when no title for keeping the space)
			rm.write("<div");
			rm.addClass("sapMSLITitleOnly");
			rm.writeClasses();

			if (sTextDir !== TextDirection.Inherit) {
				rm.writeAttribute("dir", sTextDir.toLowerCase());
			}

			rm.write(">");
			rm.writeEscaped(oLI.getTitle());
			rm.write("</div>");


			//noFlex: make an additional div for the contents table
			if (oLI._bNoFlex) {
				rm.write('</div>');
			}
			rm.write("</div>");

			// arrow right if there is a sub-menu
			if (oLI._hasSubItems()) {
				rm.renderControl(oLI._getIconArrowRight());
			}
		};

		return MenuListItemRenderer;
	}, /* bExport= */ true);

