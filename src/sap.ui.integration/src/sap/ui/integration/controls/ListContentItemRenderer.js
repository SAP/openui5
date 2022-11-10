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
			sIcon = oLI.getIcon();

		if (iLines === 1) {
			rm.class("sapUiIntLCIOneLine");

			if (sIcon && !IconPool.isIconURI(sIcon)) {
				rm.class("sapUiIntLCIThumbnail");
			}
		} else if (iLines === 2) {
			rm.class("sapUiIntLCITwoLines");
		} else {
			rm.class("sapUiIntLCIMultipleLines");
		}

		if (oLI.getActionsStrip()) {
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

		if (oLI.getDescription()) {
			this.renderDescription(rm, oLI);
		}

		this.renderItemAttributes(rm, oLI);

		if (oMicrochart) {
			rm.renderControl(oMicrochart);
		}

		rm.close("div");
		rm.close("div");

		if (oActionsStrip) {
			rm.renderControl(oActionsStrip);
		}

		rm.close("div");
	};

	ListContentItemRenderer.renderTitle = function(rm, oLI) {
		var sTitle = oLI.getTitle(),
			sInfo = oLI.getInfo();

		rm.openStart("div")
			.class("sapUiIntLCITitleWrapper")
			.openEnd();

		rm.openStart("div")
			.class("sapUiIntLCITitle")
			.openEnd()
			.text(sTitle)
			.close("div");

		if (sInfo && !oLI.getDescription()) {
			this.renderInfo(rm, oLI);
		}

		rm.close("div");
	};

	ListContentItemRenderer.renderDescription = function(rm, oLI) {
		var sDescription = oLI.getDescription(),
			sInfo = oLI.getInfo();

		rm.openStart("div")
			.class("sapUiIntLCIDescriptionWrapper")
			.openEnd();

		rm.openStart("div")
			.class("sapUiIntLCIDescription")
			.openEnd()
			.text(sDescription)
			.close("div");

		if (sInfo) {
			this.renderInfo(rm, oLI);
		}

		rm.close("div");
	};

	ListContentItemRenderer.renderInfo = function (rm, oLI) {
		rm.openStart("div")
			.class("sapUiIntLCIInfo")
			.class("sapUiIntLCIInfo" + oLI.getInfoState())
			.openEnd();

		rm.text(oLI.getInfo());

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
}, /* bExport= */ true);
