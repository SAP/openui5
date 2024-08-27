/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/integration/library",
	"sap/ui/core/Renderer",
	"sap/ui/core/IconPool",
	"sap/m/ListItemBaseRenderer"
], function(
	library,
	Renderer,
	IconPool,
	ListItemBaseRenderer
) {
	"use strict";

	/**
	 * ListContentItemRenderer renderer.
	 * @namespace
	 */
	var ListContentItemRenderer = Renderer.extend(ListItemBaseRenderer);
	ListContentItemRenderer.apiVersion = 2;

	var AttributesLayoutType = library.AttributesLayoutType;

	/**
	 * ListItemBaseRenderer hook
	 * @override
	 */
	ListContentItemRenderer.renderLIAttributes = function(rm, oLI) {
		rm.class("sapUiIntLCI");

		var iLines = oLI.getLinesCount(),
			sIcon = oLI.getIcon(),
			vActionsStrip = oLI.getActionsStrip();

		if (iLines === 1) {
			rm.class("sapUiIntLCIOneLine");

			if (sIcon && sIcon.trim() && !IconPool.isIconURI(sIcon)) {
				rm.class("sapUiIntLCIThumbnail");
			}
		} else if (iLines === 2) {
			rm.class("sapUiIntLCITwoLines");
		} else {
			rm.class("sapUiIntLCIMultipleLines");
		}

		if (vActionsStrip && vActionsStrip.hasVisibleItems()) {
			rm.class("sapUiIntLCIWithActionsStrip");
		}
	};

	/**
	 * ListItemBaseRenderer hook
	 * @override
	 */
	ListContentItemRenderer.renderLIContent = function (rm, oLI) {
		var oMicrochart = oLI.getMicrochart();
		var oActionsStrip = oLI.getActionsStrip();

		rm.openStart("div")
			.class("sapUiIntLCIContent")
			.openEnd();

		rm.openStart("div")
			.class("sapUiIntLCIIconAndLines")
			.openEnd();

		if (!oLI.isPropertyInitial("icon") || !oLI.isPropertyInitial("iconInitials")) {
			rm.renderControl(oLI._getAvatar());
		}

		rm.openStart("div")
			.class("sapUiIntLCILines")
			.openEnd();

		this.renderTitle(rm, oLI);

		if (oLI.getDescription() && oLI.getDescriptionVisible()) {
			this.renderDescription(rm, oLI);
		}

		this.renderItemAttributes(rm, oLI);

		if (oMicrochart) {
			rm.renderControl(oMicrochart);
		}

		rm.close("div");
		rm.close("div");

		if (oActionsStrip && oActionsStrip.hasVisibleItems()) {
			rm.renderControl(oActionsStrip);
		}

		rm.close("div");
	};

	ListContentItemRenderer.renderTitle = function(rm, oLI) {
		var sTitle = oLI.getTitle(),
			bHasInfo = oLI.getHasInfo();

		rm.openStart("div")
			.class("sapUiIntLCITitleWrapper")
			.openEnd();

		rm.openStart("div")
			.class("sapUiIntLCITitle")
			.openEnd()
			.text(sTitle)
			.close("div");

		if (bHasInfo && !oLI.getDescription() && oLI.getInfoVisible()) {
			this.renderInfo(rm, oLI);
		}

		rm.close("div");
	};

	ListContentItemRenderer.renderDescription = function(rm, oLI) {
		var sDescription = oLI.getDescription(),
			bHasInfo = oLI.getHasInfo();

		rm.openStart("div")
			.class("sapUiIntLCIDescriptionWrapper")
			.openEnd();

		rm.openStart("div")
			.class("sapUiIntLCIDescription")
			.openEnd()
			.text(sDescription)
			.close("div");

		if (bHasInfo && oLI.getInfoVisible()) {
			this.renderInfo(rm, oLI);
		}

		rm.close("div");
	};

	ListContentItemRenderer.renderInfo = function (rm, oLI) {
		var oObjectStatus = oLI._getObjectStatus();

		rm.openStart("div")
			.class("sapUiIntLCIInfo")
			.openEnd();

		if (oObjectStatus) {
			rm.renderControl(oObjectStatus);
		}

		rm.close("div");
	};

	ListContentItemRenderer.renderItemAttributes = function(rm, oLI) {
		var aAttrs = oLI._getVisibleAttributes(),
			sLayoutType = oLI.getAttributesLayoutType(),
			iLength = aAttrs.length,
			i;

		if (!iLength) {
			return;
		}

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
	};

	return ListContentItemRenderer;
});
