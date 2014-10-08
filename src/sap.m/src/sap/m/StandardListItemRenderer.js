/*!
 * ${copyright}
 */

sap.ui.define(['jquery.sap.global', './ListItemBaseRenderer', 'sap/ui/core/Renderer'],
	function(jQuery, ListItemBaseRenderer, Renderer) {
	"use strict";


	/**
	 * @class StandardListItem renderer.
	 * @static
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
		if (oLI._showSeparators  == sap.m.ListSeparators.None && !oLI.getIconInset()) {
			rm.addClass("sapMSLIShowSeparatorNone");
		}
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
		if (oLI.getType() == sap.m.ListType.Detail || oLI.getType() == sap.m.ListType.DetailAndActive) {
			rm.addClass("sapMSLIDetail");
		}
	
	};
	
	StandardListItemRenderer.renderLIContent = function(rm, oLI) {
	
		// image
		if (oLI.getIcon()) {
			if (oLI.getIconInset()) {
				var oList = sap.ui.getCore().byId(oLI._listId);
				if (oList && oList.getMode() == sap.m.ListMode.None & ! oList.getShowUnread()) {
					rm.renderControl(oLI._getImage((oLI.getId() + "-img"), "sapMSLIImgFirst", oLI.getIcon(), oLI.getIconDensityAware()));
				} else {
					rm.renderControl(oLI._getImage((oLI.getId() + "-img"), "sapMSLIImg", oLI.getIcon(), oLI.getIconDensityAware()));
				}
			} else {
				rm.renderControl(oLI._getImage((oLI.getId() + "-img"), "sapMSLIImgThumb", oLI.getIcon(), oLI.getIconDensityAware()));
			}
		}
	
		var isDescription = oLI.getTitle() && (oLI.getDescription() || !oLI.getAdaptTitleSize())  || (oLI._showSeparators  == sap.m.ListSeparators.None && !oLI.getIconInset());
		var isInfo = oLI.getInfo();
	
		if (isDescription) {
			rm.write("<div");
			rm.addClass("sapMSLIDiv");
			rm.writeClasses();
			rm.write(">");
		}
	
		rm.write("<div");
		if (!isDescription) {
			rm.addClass("sapMSLIDiv");
		}
		rm.addClass("sapMSLITitleDiv");
		rm.writeClasses();
		rm.write(">");
	
		//noFlex: make an additional div for the contents table
		if (!isDescription && oLI._bNoFlex) {
			rm.write('<div class="sapMLIBNoFlex">');
		}
		// List item text (also written when no title for keeping the space)
		rm.write("<div");
		if (isDescription) {
			rm.addClass("sapMSLITitle");
		} else {
			rm.addClass("sapMSLITitleOnly");
		}
		rm.writeClasses();
		rm.write(">");
		rm.writeEscaped(oLI.getTitle());
		rm.write("</div>");
	
		//info div top when @sapUiInfoTop: true;
		if (isInfo && (sap.ui.core.theming.Parameters.get("sapUiInfoTop") == "true" || !isDescription)) {
			rm.write("<div");
			rm.writeAttribute("id", oLI.getId() + "-info");
			rm.addClass("sapMSLIInfo");
			rm.addClass("sapMSLIInfo" + oLI.getInfoState());
			rm.writeClasses();
			rm.write(">");
			rm.writeEscaped(isInfo);
			rm.write("</div>");
		}
	
		//noFlex: make an additional div for the contents table
		if (!isDescription && oLI._bNoFlex) {
			rm.write('</div>');
		}
		rm.write("</div>");
	
		rm.write("<div");
		rm.addClass("sapMSLIDescriptionDiv");
		rm.writeClasses();
		rm.write(">");
	
		// List item text
		if (isDescription) {
			rm.write("<div");
			rm.addClass("sapMSLIDescription");
			rm.writeClasses();
			rm.write(">");
			if (oLI.getDescription()) {
				rm.writeEscaped(oLI.getDescription());
			} else {
				rm.write("&nbsp;");
			}
			rm.write("</div>");
		}
	
		if (isInfo && sap.ui.core.theming.Parameters.get("sapUiInfoTop") == "false" && isDescription) {
			rm.write("<div");
			rm.writeAttribute("id", oLI.getId() + "-info");
			rm.addClass("sapMSLIInfo");
			if (oLI._showSeparators == sap.m.ListSeparators.None && oLI.getInfoState() == sap.ui.core.ValueState.None) {
				rm.addClass("sapMSLIInfo" + oLI.getInfoState() + "ShowSeparatorNone");
			} else {
				rm.addClass("sapMSLIInfo" + oLI.getInfoState());
			}
			rm.writeClasses();
			rm.write(">");
			rm.writeEscaped(isInfo);
			rm.write("</div>");
		}
		rm.write("</div>");
	
		if (isDescription) {
			rm.write("</div>");
		}
	
	};
	

	return StandardListItemRenderer;

}, /* bExport= */ true);
