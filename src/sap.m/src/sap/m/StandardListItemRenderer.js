/*!
 * ${copyright}
 */

sap.ui.define(["sap/ui/core/library", "sap/ui/core/Renderer", "./library", "./ListItemBaseRenderer"],
	function(coreLibrary, Renderer, library, ListItemBaseRenderer ) {
	"use strict";


	// shortcut for sap.ui.core.TextDirection
	var TextDirection = coreLibrary.TextDirection;

	// shortcut for sap.m.ListType
	var ListType = library.ListType;


	/**
	 * StandardListItem renderer.
	 * @namespace
	 */
	var StandardListItemRenderer = Renderer.extend(ListItemBaseRenderer);

	/**
	 * Renders the HTML for the given control, using the provided
	 * {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager}
	 *          oRenderManager the RenderManager that can be used for writing to the
	 *          Render-Output-Buffer
	 * @param {sap.ui.core.Control}
	 *          oControl an object representation of the control that should be
	 *          rendered
	 */
	StandardListItemRenderer.renderLIAttributes = function(rm, oLI) {
		rm.addClass("sapMSLI");
		if (oLI.getIcon()) {
			rm.addClass("sapMSLIIcon");
		}
		if (!oLI.getIconInset()) {
			rm.addClass("sapMSLIIconThumb");
		}
		if ((oLI.getDescription() || !oLI.getAdaptTitleSize()) && oLI.getIcon() &&  oLI.getIconInset()) {
			rm.addClass("sapMSLIDescIcon");
		}
		if ((oLI.getDescription() || !oLI.getAdaptTitleSize()) && !oLI.getIcon()) {
			rm.addClass("sapMSLIDescNoIcon");
		}
		if (!oLI.getDescription() && oLI.getIcon()) {
			rm.addClass("sapMSLINoDescIcon");
		}
		if (oLI.getType() == ListType.Detail || oLI.getType() == ListType.DetailAndActive) {
			rm.addClass("sapMSLIDetail");
		}

	};

	StandardListItemRenderer.renderLIContent = function(rm, oLI) {

		var sInfo = oLI.getInfo(),
			sInfoDir = oLI.getInfoTextDirection(),
			sTextDir = oLI.getTitleTextDirection(),
			sDescription = oLI.getTitle() && (oLI.getDescription() || !oLI.getAdaptTitleSize());

		// render image
		if (oLI.getIcon()) {
			rm.renderControl(oLI._getImage());
		}

		if (sDescription) {
			rm.write('<div class="sapMSLIDiv">');
		}

		rm.write("<div");
		if (!sDescription) {
			rm.addClass("sapMSLIDiv");
		}
		rm.addClass("sapMSLITitleDiv");
		rm.writeClasses();
		rm.write(">");

		// List item text (also written when no title for keeping the space)
		rm.write("<div");
		rm.addClass(sDescription ? "sapMSLITitle" : "sapMSLITitleOnly");
		rm.writeClasses();
		if (sTextDir !== TextDirection.Inherit) {
			rm.writeAttribute("dir", sTextDir.toLowerCase());
		}
		rm.write(">");
		rm.writeEscaped(oLI.getTitle());
		rm.write("</div>");

		//info div top when @sapUiInfoTop: true;
		if (sInfo && !sDescription) {
			rm.write("<div");
			rm.writeAttribute("id", oLI.getId() + "-info");
			rm.addClass("sapMSLIInfo");
			rm.addClass("sapMSLIInfo" + oLI.getInfoState());
			rm.writeClasses();
			if (sInfoDir !== TextDirection.Inherit) {
				rm.writeAttribute("dir", sInfoDir.toLowerCase());
			}
			rm.write(">");
			rm.writeEscaped(sInfo);
			rm.write("</div>");
		}

		rm.write("</div>");

		rm.write('<div class="sapMSLIDescriptionDiv">');

		// List item text
		if (sDescription) {
			rm.write('<div class="sapMSLIDescription">');
			if (oLI.getDescription()) {
				rm.writeEscaped(oLI.getDescription());
			} else {
				rm.write("&nbsp;");
			}
			rm.write("</div>");
		}

		if (sInfo && sDescription) {
			rm.write("<div");
			rm.writeAttribute("id", oLI.getId() + "-info");
			rm.addClass("sapMSLIInfo");
			rm.addClass("sapMSLIInfo" + oLI.getInfoState());
			rm.writeClasses();
			if (sInfoDir !== TextDirection.Inherit) {
				rm.writeAttribute("dir", sInfoDir.toLowerCase());
			}
			rm.write(">");
			rm.writeEscaped(sInfo);
			rm.write("</div>");
		}

		rm.write("</div>");

		if (sDescription) {
			rm.write("</div>");
		}

	};

	return StandardListItemRenderer;

}, /* bExport= */ true);
