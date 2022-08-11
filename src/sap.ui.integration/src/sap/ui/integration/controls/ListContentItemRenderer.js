/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/integration/library",
	"sap/ui/core/Renderer",
	"sap/ui/core/Core",
	"sap/ui/Device",
	"sap/m/StandardListItemRenderer"
], function(library,
			Renderer,
			Core,
			Device,
			StandardListItemRenderer) {
	"use strict";

	/**
	 * ListContentItemRenderer renderer.
	 * @namespace
	 */
	var ListContentItemRenderer = Renderer.extend(StandardListItemRenderer);
	ListContentItemRenderer.apiVersion = 2;

	var AttributesLayoutType = library.AttributesLayoutType;

	/**
	 * @override
	 */
	ListContentItemRenderer.renderLIAttributes = function(rm, oLI) {
		StandardListItemRenderer.renderLIAttributes.apply(this, arguments);

		rm.class("sapUiIntLCI");

		if (oLI.getIcon()) {
			rm.class("sapUiIntLCIIconSize" + oLI.getIconSize());
		}

		if (oLI.getMicrochart()) {
			rm.class("sapUiIntLCIWithChart");
		}

		if (oLI.getActionsStrip()) {
			rm.class("sapUiIntLCIWithActionsStrip");
		}

		if (oLI._getVisibleAttributes().length) {
			rm.class("sapUiIntLCIWithAttributes");
		}
	};

	/**
	 * @override
	 */
	ListContentItemRenderer.renderLIContent = function (rm, oLI) {
		var sInfo = oLI.getInfo(),
			sTitle = oLI.getTitle(),
			sDescription = oLI.getDescription(),
			bAdaptTitleSize = oLI.getAdaptTitleSize(),
			bShouldRenderInfoWithoutTitle = !sTitle && sInfo;

		// render image
		// ListContentItem specific
		if (oLI.getIcon() || oLI.getIconInitials()) {
			rm.renderControl(oLI._getAvatar());
		}

		rm.openStart("div")
			.class("sapMSLIDiv");

		// if bShouldRenderInfoWithoutTitle=true then adapt the style class to have flex-direction: row
		if ((!sDescription && bAdaptTitleSize && sInfo) || bShouldRenderInfoWithoutTitle) {
			rm.class("sapMSLIInfoMiddle");
		}

		rm.openEnd();

		this.renderTitleWrapper(rm, oLI);

		if (sTitle && sDescription) {
			this.renderDescription(rm, oLI);
		}

		if (bShouldRenderInfoWithoutTitle && !oLI.getWrapping()) {
			this.renderInfo(rm, oLI);
		}

		rm.close("div");
	};

	/**
	 * Renders the HTML for the given control, using the provided.
	 *
	 * {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} rm The RenderManager that can be used for writing to the Render-Output-Buffer.
	 * @param {sap.ui.integration.controls.ListContentitem} oLI an object representation of the control that should be rendered.
	 * @public
	 */
	ListContentItemRenderer.render = function(rm, oLI) {
		// render invisible placeholder
		if (!oLI.getVisible()) {
			this.renderInvisible(rm, oLI);
			return;
		}

		// start
		this.openItemTag(rm, oLI);

		// classes
		rm.class("sapMLIB");
		rm.class("sapMLIB-CTX");
		rm.class("sapMLIBShowSeparator");
		rm.class("sapMLIBType" + oLI.getType());
		rm.class("sapMLIB");

		if (Device.system.desktop && oLI.isActionable()) {
			rm.class("sapMLIBActionable");
			rm.class("sapMLIBHoverable");
		}

		if (oLI.getSelected()) {
			rm.class("sapMLIBSelected");
		}

		if (oLI.getListProperty("showUnread") && oLI.getUnread()) {
			rm.class("sapMLIBUnread");
		}

		this.addFocusableClasses(rm, oLI);

		// attributes
		this.renderTooltip(rm, oLI);
		this.renderTabIndex(rm, oLI);

		// handle accessibility states
		if (Core.getConfiguration().getAccessibility()) {
			rm.accessibilityState(oLI, this.getAccessibilityState(oLI));
		}

		// item attributes hook
		this.renderLIAttributes(rm, oLI);

		rm.openEnd();

		this.renderContentFormer(rm, oLI);
		this.renderLIContentWrapper(rm, oLI);
		this.renderContentLatter(rm, oLI);

		this.renderItemAttributes(rm, oLI);

		this.renderFooter(rm, oLI);

		this.closeItemTag(rm, oLI);
	};

	ListContentItemRenderer.renderItemAttributes = function(rm, oLI) {
		var aAttrs = oLI._getVisibleAttributes(),
			sLayoutType = oLI.getAttributesLayoutType(),
			iLength = aAttrs.length,
			i;

		if (!iLength) {
			return;
		}

		rm.openStart("div")
			.class("sapUiIntLCIAttrs")
			.openEnd();

		for (i = 0; i < iLength; i++) {
			rm.openStart("div")
				.class("sapUiIntLCIAttrRow")
				.openEnd();

			rm.openStart("span")
				.class("sapUiIntLCIAttrCell")
				.openEnd();

			rm.renderControl(aAttrs[i]);

			rm.close("span");

			if (sLayoutType === AttributesLayoutType.TwoColumns) {
				i++;

				if (aAttrs[i]) {
					rm.openStart("span")
						.class("sapUiIntLCIAttrCell")
						.class("sapUiIntLCIAttrSecondCell")
						.openEnd();

					rm.renderControl(aAttrs[i]);

					rm.close("span");
				}
			}

			rm.close("div");
		}

		rm.close("div");
	};

	ListContentItemRenderer.renderFooter = function(rm, oLI) {

		var oMicrochart = oLI.getMicrochart(),
			oActionsStrip = oLI.getActionsStrip();

		if (!oMicrochart && !oActionsStrip) {
			return;
		}

		rm.openStart("div")
			.class("sapUiIntLCIFooter")
			.openEnd();

		if (oMicrochart) {
			rm.renderControl(oMicrochart);
		}

		if (oActionsStrip) {
			rm.renderControl(oActionsStrip);
		}

		rm.close("div");
	};


	return ListContentItemRenderer;

}, /* bExport= */ true);
