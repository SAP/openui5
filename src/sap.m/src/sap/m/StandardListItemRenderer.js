/*!
 * ${copyright}
 */

sap.ui.define(["sap/ui/core/library", "sap/ui/core/Renderer", "sap/ui/core/IconPool", "sap/ui/Device", "./library", "./ListItemBaseRenderer"],
	function(coreLibrary, Renderer, IconPool, Device, library, ListItemBaseRenderer ) {
	"use strict";


	// shortcut for sap.ui.core.TextDirection
	var TextDirection = coreLibrary.TextDirection;


	/**
	 * StandardListItem renderer.
	 * @namespace
	 */
	var StandardListItemRenderer = Renderer.extend(ListItemBaseRenderer);

	/**
	 * Renders the HTML for the given control, using the provided
	 * {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} rm The <code>RenderManager</code> that can be used for writing to the render output buffer
	 * @param {sap.ui.core.Control} oLI An object representation of the control that is rendered
	 */
	StandardListItemRenderer.renderLIAttributes = function(rm, oLI) {
		var sIconURI = oLI.getIcon(),
			sTitle = oLI.getTitle();

		rm.addClass("sapMSLI");

		if (sIconURI && !IconPool.isIconURI(sIconURI)) {
			rm.addClass("sapMSLIThumbnail");
		}

		if (!oLI.getIconInset()) {
			rm.addClass("sapMSLINoIconInset");
		}

		if (sTitle && oLI.getDescription()) {
			rm.addClass("sapMSLIWithDescription");
		}

		if (sTitle && !oLI.getAdaptTitleSize()) {
			rm.addClass("sapMSLINoTitleAdapt");
		}

		if (sTitle && oLI.getWrapping()) {
			rm.addClass("sapMSLIWrapping");
		}
	};

	/**
	 * Renders the list item content element.
	 * @param {sap.ui.core.RenderManager} rm The <code>RenderManager</code> that can be used for writing to the render output buffer
	 * @param {sap.ui.core.Control} oLI An object representation of the control that is rendered
	 * @protected
	 */
	StandardListItemRenderer.renderLIContent = function(rm, oLI) {
		var sInfo = oLI.getInfo(),
			sTitle = oLI.getTitle(),
			sDescription = oLI.getDescription(),
			bAdaptTitleSize = oLI.getAdaptTitleSize(),
			bShouldRenderInfoWithoutTitle = !sTitle && sInfo;

		// render image
		if (oLI.getIcon()) {
			rm.renderControl(oLI._getImage());
		}

		rm.write("<div");
		rm.addClass("sapMSLIDiv");

		// if bShouldRenderInfoWithoutTitle=ture then adapt the style class according to have flex-direction: row
		if ((!sDescription && bAdaptTitleSize && sInfo) || bShouldRenderInfoWithoutTitle) {
			rm.addClass("sapMSLIInfoMiddle");
		}
		rm.writeClasses();
		rm.write(">");

		this.renderTitleWrapper(rm, oLI);

		if (sTitle && sDescription) {
			this.renderDescription(rm, oLI);
		}

		if (bShouldRenderInfoWithoutTitle && !oLI.getWrapping()) {
			this.renderInfo(rm, oLI);
		}

		rm.write("</div>");

	};

	/**
	 * Renders the title wrapper.
	 * @param {sap.ui.core.RenderManager} rm The <code>RenderManager</code> that can be used for writing to the render output buffer
	 * @param {sap.ui.core.Control} oLI An object representation of the control that is rendered
	 * @protected
	 */
	StandardListItemRenderer.renderTitleWrapper = function(rm, oLI) {
		var sTextDir = oLI.getTitleTextDirection(),
			sTitle = oLI.getTitle(),
			sDescription = oLI.getDescription(),
			sInfo = oLI.getInfo(),
			bWrapping = oLI.getWrapping(),
			bShouldRenderInfoWithoutTitle = !sTitle && sInfo;

		rm.write("<div");

		if (!bShouldRenderInfoWithoutTitle && sDescription) {
			rm.addClass("sapMSLITitle");
		} else {
			rm.addClass("sapMSLITitleOnly");
		}

		rm.writeClasses();

		if (sTextDir !== TextDirection.Inherit) {
			rm.writeAttribute("dir", sTextDir.toLowerCase());
		}

		rm.write(">");

		if (bWrapping) {
			this.renderWrapping(rm, oLI, "title");

			if (sTitle && sInfo && !sDescription) {
				this.renderInfo(rm, oLI);
			}
		} else {
			this.renderTitle(rm, oLI);
		}

		rm.write("</div>");

		if (sInfo && !sDescription && !bWrapping && !bShouldRenderInfoWithoutTitle) {
			this.renderInfo(rm, oLI);
		}
	};

	/**
	 * Renders the title text.
	 * @param {sap.ui.core.RenderManager} rm The <code>RenderManager</code> that can be used for writing to the render output buffer
	 * @param {sap.ui.core.Control} oLI An object representation of the control that is rendered
	 * @protected
	 */
	StandardListItemRenderer.renderTitle = function(rm, oLI) {
		rm.writeEscaped(oLI.getTitle());
	};

	/**
	 * Renders the description text.
	 * @param {sap.ui.core.RenderManager} rm The <code>RenderManager</code> that can be used for writing to the render output buffer
	 * @param {sap.ui.core.Control} oLI An object representation of the control that is rendered
	 * @protected
	 */
	StandardListItemRenderer.renderDescription = function (rm, oLI) {
		var bWrapping = oLI.getWrapping(),
			sDescription = oLI.getDescription(),
			sInfo = oLI.getInfo();

		rm.write("<div");
		rm.addClass("sapMSLIDescription");

		if (sInfo) {
			rm.addClass("sapMSLIDescriptionAndInfo");
		}

		rm.writeClasses();
		rm.write(">");

		// render info text within the description div to apply the relevant flex layout
		if (sInfo) {
			rm.write("<div");
			rm.addClass("sapMSLIDescriptionText");
			rm.writeClasses();
			rm.write(">");

			if (bWrapping) {
				this.renderWrapping(rm, oLI, "description");
				this.renderInfo(rm, oLI);
			} else {
				rm.writeEscaped(sDescription);
			}

			rm.write("</div>");

			if (!bWrapping) {
				this.renderInfo(rm, oLI);
			}
		} else if (bWrapping) {
			this.renderWrapping(rm, oLI, "description");
		} else {
			rm.writeEscaped(sDescription);
		}

		rm.write("</div>");
	};

	/**
	 * Renders the info text.
	 * @param {sap.ui.core.RenderManager} rm The <code>RenderManager</code> that can be used for writing to the render output buffer
	 * @param {sap.ui.core.Control} oLI An object representation of the control that is rendered
	 * @protected
	 */
	StandardListItemRenderer.renderInfo = function (rm, oLI) {
		var sInfoDir = oLI.getInfoTextDirection();

		rm.write("<div");
		rm.writeAttribute("id", oLI.getId() + "-info");

		if (sInfoDir !== TextDirection.Inherit) {
			rm.writeAttribute("dir", sInfoDir.toLowerCase());
		}

		rm.addClass("sapMSLIInfo");
		rm.addClass("sapMSLIInfo" + oLI.getInfoState());
		rm.writeClasses();
		rm.write(">");
		rm.writeEscaped(oLI.getInfo());
		rm.write("</div>");
	};

	/**
	 * Renders the expand/collapse text.
	 * @param {sap.ui.core.RenderManager} rm The <code>RenderManager</code> that can be used for writing to the render output buffer
	 * @param {sap.ui.core.Control} oLI An object representation of the control that is rendered
	 * @param {string} sWrapArea Defines the wrapping text area
	 * @protected
	 */
	StandardListItemRenderer.renderExpandCollapse = function (rm, oLI, sWrapArea) {
		var sId = oLI.getId(),
			bTitle = sWrapArea === "title" ? true : false,
			bTextExpanded = bTitle ? oLI._bTitleTextExpanded : oLI._bDescriptionTextExpanded,
			oRb = sap.ui.getCore().getLibraryResourceBundle("sap.m");

		rm.write("<span");
		rm.writeAttribute("id", sId + "-" + sWrapArea + "ThreeDots");
		rm.write(">");

		if (!bTextExpanded) {
			rm.write(" ... ");
		} else {
			rm.write(" ");
		}

		rm.write("</span>");

		rm.write("<span");
		rm.writeAttribute("id", bTitle ? sId + "-titleButton" : sId + "-descriptionButton");
		rm.addClass("sapMSLIExpandCollapse");
		rm.writeClasses();
		rm.writeAttribute("tabindex", "0");
		rm.writeAttribute("role", "button");
		rm.writeAttribute("aria-live", "polite");
		rm.write(">");

		if (!bTextExpanded) {
			rm.writeEscaped(oRb.getText("TEXT_SHOW_MORE"));
		} else {
			rm.writeEscaped(oRb.getText("TEXT_SHOW_LESS"));
		}

		rm.write("</span>");
	};

	/**
	 * Renders the wrapping behavior of the text.
	 * @param {sap.ui.core.RenderManager} rm The <code>RenderManager</code> that can be used for writing to the render output buffer
	 * @param {sap.ui.core.Control} oLI An object representation of the control that is rendered
	 * @param {string} sWrapArea Defines the wrapping text area
	 * @protected
	 */
	StandardListItemRenderer.renderWrapping = function(rm, oLI, sWrapArea) {
		var sId = oLI.getId(),
			bTitle = sWrapArea === "title" ? true : false,
			sText = bTitle ? oLI.getTitle() : oLI.getDescription(),
			bTextExpanded = bTitle ? oLI._bTitleTextExpanded : oLI._bDescriptionTextExpanded,
			iMaxCharacters = Device.system.phone ? 100 : 300;

		rm.write("<span");
		rm.writeAttribute("id", sId + "-" + sWrapArea + "Text");
		rm.writeAttribute("aria-live", "polite");
		rm.write(">");

		if (!bTextExpanded) {
			var sCollapsedText = oLI._getCollapsedText(sText);
			rm.writeEscaped(sCollapsedText);
		} else if (bTitle) {
			this.renderTitle(rm, oLI);
		} else {
			rm.writeEscaped(oLI.getDescription());
		}

		rm.write("</span>");

		if (sText.length > iMaxCharacters) {
			this.renderExpandCollapse(rm, oLI, sWrapArea);
		}
	};

	return StandardListItemRenderer;

}, /* bExport= */ true);
