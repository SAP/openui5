/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/Device",
	"sap/ui/core/IconPool"
], function (Device, IconPool) {
		"use strict";

		var SidePanelRenderer = {
			apiVersion: 2
		};

		SidePanelRenderer.render = function(oRm, oControl) {
			var bActionBarExpanded = oControl.getActionBarExpanded();

			oRm.openStart("div", oControl);
			oRm.class("sapFSP");
			oControl._isSingleItem() && oRm.class("sapFSPSingleItem");
			bActionBarExpanded && oControl.getItems().length !== 1 && oRm.class("sapFSPActionBarExpanded");
			oControl._getSideContentExpanded() && oRm.class("sapFSPSideContentExpanded");
			oRm.openEnd();

			SidePanelRenderer.renderMain(oRm, oControl);
			oControl.getItems().length && SidePanelRenderer.renderSide(oRm, oControl);
			!Device.system.phone && SidePanelRenderer.renderMeasureHelpers(oRm, oControl);

			oRm.close("div");
		};

		SidePanelRenderer.renderItem = function(oRm, oControl, oItem, iIndex, bActionBarExpanded) {
			var sSelectedItemId = oControl.getSelectedItem(),
				bSingleItem = oControl._isSingleItem(),
				bPhone = Device.system.phone,
				bOverflowItem = iIndex === null,
				bItemSelected = sSelectedItemId === oItem.getId(),
				sAriaAttribute = bOverflowItem ? "aria-expanded" : "aria-selected",
				sItemText = bOverflowItem ? oControl._getOverflowItemText() : oItem.getText();

			oRm.openStart("li", oItem);
			!bActionBarExpanded && oRm.attr("title", sItemText);
			oRm.class("sapFSPItem");

			if ((!bOverflowItem && bItemSelected) || (bOverflowItem && oControl._bOverflowMenuOpened)) {
				oRm.class("sapFSPSelected");
				oRm.attr(sAriaAttribute, "true");
			} else {
				oRm.attr(sAriaAttribute, "false");
			}

			bOverflowItem && oRm.class("sapFSPOverflowItem") && oRm.attr("aria-haspopup", "menu");
			oRm.attr("role", bOverflowItem ? "button" : "option"); // listitem (as in spec) + aria-selected doesn't work
			!bOverflowItem && oRm.attr("aria-posinset", iIndex + 1);
			oRm.openEnd();

			oRm.renderControl(IconPool.createControlByURI({
				src: iIndex === 0 && bSingleItem && bPhone ? "sap-icon://navigation-up-arrow" : oItem.getIcon()
			}));

			if ((bSingleItem && bPhone)
				|| (!bSingleItem && bActionBarExpanded)) {
				oRm.openStart("span");
				oRm.class("sapFSPItemText");
				oRm.openEnd();

				oRm.text(sItemText);

				oRm.close("span");
			}

			oRm.close("li");
		};

		SidePanelRenderer.renderMain = function(oRm, oControl) {
			var aMain = oControl.getMainContent(),
				i;

			oRm.openStart("div");
			oRm.class("sapFSPMain");
			oRm.attr("data-sap-ui-fastnavgroup", "true");
			oRm.openEnd();

			for (i = 0; i < aMain.length; i++) {
				oRm.renderControl(aMain[i]);
			}

			oRm.close("div");
		};

		SidePanelRenderer.renderSide = function(oRm, oControl) {
			var bPhone = Device.system.phone,
				bRenderSplitter = oControl.getSidePanelResizable() && oControl._getSideContentExpanded() && !bPhone;

			oRm.openStart("aside");
			oRm.class("sapFSPSide");
			bRenderSplitter && oRm.class("sapFSPResizable");
			oRm.attr("data-sap-ui-fastnavgroup", "true");
			oRm.attr("role", "region");
			oRm.attr("aria-label", oControl._getAriaLabelText());
			oControl._getSideContentExpanded() && !bPhone && oRm.style("width", oControl._getSidePanelWidth());
			oRm.openEnd();

			oRm.openStart("div");
			oRm.class("sapFSPSideInner");
			oRm.openEnd();

			SidePanelRenderer.renderActionBar(oRm, oControl);
			oControl.getSelectedItem() && SidePanelRenderer.renderSideContent(oRm, oControl);
			bRenderSplitter && SidePanelRenderer.renderSplitterBar(oRm, oControl);

			oRm.close("div");
			oRm.close("aside");
		};

		SidePanelRenderer.renderSideContent = function(oRm, oControl) {
			var aSide = oControl._getSelectedItem().getContent(),
				i;

			if (oControl._getSideContentExpanded()) {
				oRm.openStart("div");
				oRm.class("sapFSPSideContent");
				oRm.attr("data-sap-ui-fastnavgroup", "true");
				oRm.attr("role", "region");
				oRm.attr("aria-label", oControl._getSideContentHeaderTitle().getText());
				oRm.openEnd();

				SidePanelRenderer.renderSideContentHeader(oRm, oControl);

				oRm.openStart("div");
				oRm.class("sapFSPSideContentInner");
				oRm.attr("aria-labelledby", oControl.getId() + "-header");
				oRm.openEnd();

				for (i = 0; i < aSide.length; i++) {
					oRm.renderControl(aSide[ i ]);
				}

				oRm.close("div");
				oRm.close("div");
			}
		};

		SidePanelRenderer.renderSideContentHeader = function(oRm, oControl) {
			oRm.openStart("div", oControl.getId() + "-header");
			oRm.class("sapFSPSideContentHeader");
			oRm.openEnd();

			oRm.renderControl(oControl._getSideContentHeaderIcon());
			oRm.renderControl(oControl._getSideContentHeaderTitle());
			oRm.renderControl(oControl._getSideContentHeaderCloseBtn());

			oRm.close("div");
		};

		SidePanelRenderer.renderActionBar = function(oRm, oControl) {
			var aItems = oControl.getItems(),
				bActionBarExpanded = oControl.getActionBarExpanded(),
				bSingleItem = aItems.length === 1,
				bPhone = Device.system.phone,
				oExpandCollapseButton = oControl.getAggregation("_arrowButton"),
				i;

			oRm.openStart("div");
			oRm.class("sapFSPActionBar");
			oRm.openEnd();

			if (!bPhone) {
				// expand/collapse button
				bSingleItem && oExpandCollapseButton.setTooltip(oControl.getItems()[0].getText());
				oRm.renderControl(oExpandCollapseButton);
			}

			// action bar
			if (aItems.length) {
				oRm.openStart("div");
				oRm.class("sapFSPActionBarListWrapper");
				bActionBarExpanded && oRm.class("sapFSPExpanded");
				oRm.attr("role", "toolbar");
				oRm.openEnd();

				oRm.openStart("ul", oControl.getId() + "-ActionBarList");
				oRm.class("sapFSPActionBarList");
				aItems.length < 4 && oRm.class("sapFSPCenteredItems");
				oRm.attr("aria-multiselectable", "false");
				oRm.attr("aria-label", "Actions");
				oRm.attr("role", "listbox");
				oRm.openEnd();

				if (bPhone || aItems.length > 1) {
					for (i = 0; i < aItems.length; i++) {
						SidePanelRenderer.renderItem(oRm, oControl, aItems[ i ], i, bActionBarExpanded);
					}

					// add overflow nav item if not phone
					if (!bPhone) {
						SidePanelRenderer.renderItem(oRm, oControl, oControl.getAggregation("_overflowItem"), null, bActionBarExpanded);
					}
				}

				oRm.close("ul");
				oRm.close("div");
			}

			oRm.close("div");
		};

		SidePanelRenderer.renderSplitterBar = function(oRm, oControl) {
			oRm.openStart("div", oControl.getId() + "-resizeSplitter");
			oRm.class("sapFSPSplitterBar");
			oRm.attr("tabindex", 0);
			oRm.attr("role", "separator");
			oRm.attr("aria-orientation", "vertical");
			oRm.attr("aria-roledescription", "splitter separator");
			oRm.attr("title", oControl._getSplitterTitle());
			oRm.openEnd();

			oRm.openStart("div");
			oRm.class("sapFSPSplitterBarDecorationBefore");
			oRm.openEnd();
			oRm.close("div");

			oRm.openStart("div");
			oRm.class("sapFSPSplitterBarGrip");
			oRm.openEnd();
			oRm.icon("sap-icon://vertical-grip", ["sapFSPSplitterBarGripIcon"]);
			oRm.close("div");

			oRm.openStart("div");
			oRm.class("sapFSPSplitterBarDecorationAfter");
			oRm.openEnd();
			oRm.close("div");

			oRm.close("div");
		};

		SidePanelRenderer.renderMeasureHelpers = function(oRm, oControl) {
			oRm.openStart("div");
			oRm.class("sapFSPMinWidth");
			oRm.style("width", oControl.getSidePanelMinWidth());
			oRm.openEnd();
			oRm.close("div");

			oRm.openStart("div");
			oRm.class("sapFSPMaxWidth");
			oRm.style("width", oControl.getSidePanelMaxWidth());
			oRm.openEnd();
			oRm.close("div");
		};

		return SidePanelRenderer;
	});