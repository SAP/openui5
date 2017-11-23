/*!
 * ${copyright}
 */
sap.ui.define(['jquery.sap.global', 'sap/ui/Device', 'sap/m/library'],
	function (jQuery, Device, library) {
		"use strict";

		// shortcut for sap.m.PlacementType
		var PlacementType = library.PlacementType;

		/**
		 * Popover renderer.
		 * @namespace
		 */
		var PopoverRenderer = {};

		/**
		 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
		 *
		 * @param {sap.ui.core.RenderManager} rm The RenderManager that can be used for writing to the Render-Output-Buffer
		 * @param {sap.ui.core.Control} oControl An object representation of the control that should be rendered
		 */
		PopoverRenderer.render = function(rm, oControl) {
			var aClassNames;

			// container
			rm.write("<div");
			rm.writeControlData(oControl);
			aClassNames = this.generateRootClasses(oControl);
			aClassNames.forEach(function(sClassName, index) {
				rm.addClass(sClassName);
			});
			rm.writeClasses();

			var sTooltip = oControl.getTooltip_AsString();

			if (sTooltip) {
				rm.writeAttributeEscaped("title", sTooltip);
			}

			rm.writeAttribute("tabindex", "-1");

			// ARIA
			rm.writeAccessibilityState(oControl, oControl._getAccessibilityOptions());

			rm.write(">");

			if (oControl.getResizable()) {
				rm.writeIcon("sap-icon://resize-corner", ["sapMPopoverResizeHandle"], { "title" : ""});
			}

			this.renderContent(rm, oControl);
			rm.write("</div>");	// container
		};

		PopoverRenderer.isButtonFooter = function(footer) {
			if (footer instanceof sap.m.Bar) {
				var aContentLeft = footer.getContentLeft(),
					aContentRight = footer.getContentRight(),
					aContentMiddle = footer.getContentMiddle(),
					bLeftEmpty = (!aContentLeft || aContentLeft.length === 0),
					bRightEmpty = (!aContentRight || aContentRight.length === 0),
					bMiddleTwoButtons = false;

				if (aContentMiddle && aContentMiddle.length === 2) {
					if ((aContentMiddle[0] instanceof sap.m.Button) && (aContentMiddle[1] instanceof sap.m.Button)) {
						bMiddleTwoButtons = true;
					}
				}

				return bLeftEmpty && bRightEmpty && bMiddleTwoButtons;
			} else {
				return false;
			}
		};

		PopoverRenderer.renderContent = function(rm, oControl) {
			var oHeader,
				sId = oControl.getId(),
				i = 0,
				contents = oControl._getAllContent(),
				oFooter = oControl.getFooter(),
				oSubHeader = oControl.getSubHeader(),
				sContentWidth = oControl.getContentWidth(),
				sContentMinWidth = oControl.getContentMinWidth(),
				sContentHeight = oControl.getContentHeight(),
				sFooterClass = "sapMPopoverFooter ";

			if (oControl.getShowHeader()) {
				oHeader = oControl._getAnyHeader();
			}

			if (Device.system.desktop) {

				// invisible element for cycling keyboard navigation
				rm.write("<span class='sapMPopoverHiddenFocusable' id='" + oControl.getId() + "-firstfe' tabindex='0'></span>");
			}

			// header
			if (oHeader) {

				rm.write("<header");
				rm.addClass("sapMPopoverHeader");
				rm.writeClasses();
				rm.write(">");

				if (oHeader._applyContextClassFor) {
					oHeader._applyContextClassFor("header");

				}
				rm.renderControl(oHeader);
				rm.write("</header>");
			}

			// sub header
			if (oSubHeader) {

				rm.write("<header");
				rm.addClass("sapMPopoverSubHeader");
				rm.writeClasses();
				rm.write(">");

				if (oSubHeader._applyContextClassFor) {
					oSubHeader._applyContextClassFor("subheader");
				}

				rm.renderControl(oSubHeader);
				rm.write("</header>");
			}

			// content container
			rm.write("<div");
			rm.writeAttribute("id", sId + "-cont");

			if (sContentWidth) {
				rm.addStyle("width", sContentWidth);
			}

			if (sContentMinWidth) {
				rm.addStyle("min-width", sContentMinWidth);
			}

			if (sContentHeight) {
				rm.addStyle("height", sContentHeight);
			}

			rm.writeStyles();
			rm.addClass("sapMPopoverCont");
			rm.writeClasses();

			if (sap.ui.getCore().getConfiguration().getAccessibility()) {
				rm.writeAttribute("role", "application");
			}

			rm.write(">");

			// scroll area
			rm.write('<div class="sapMPopoverScroll"');
			rm.writeAttribute("id", oControl.getId() + "-scroll");

			if (!oControl.getHorizontalScrolling()) {
				rm.addStyle(sap.ui.getCore().getConfiguration().getRTL() ? "margin-left" : "margin-right", jQuery.sap.scrollbarSize().width + "px");
			}

			rm.writeStyles();
			rm.write(">");

			for (i = 0; i < contents.length; i++) {
				rm.renderControl(contents[i]);
			}

			rm.write("</div>");	// scroll area
			rm.write("</div>");	// content container

			// footer
			if (oFooter) {
				if (this.isButtonFooter(oFooter)) {
					sFooterClass += "sapMPopoverSpecialFooter";
				}

				rm.write("<footer");
				rm.addClass(sFooterClass);
				rm.writeClasses();
				rm.write(">");

				if (oFooter._applyContextClassFor) {
					oFooter._applyContextClassFor("footer");
					oFooter.addStyleClass("sapMTBNoBorders");
				}

				rm.renderControl(oFooter);

				rm.write("</footer>");
			}

			// arrow
			if (oControl.getShowArrow()) {
				rm.write("<span");
				rm.writeAttribute("id", sId + "-arrow");
				rm.addClass("sapMPopoverArr");
				rm.writeClasses();
				rm.write("></span>");	// arrow tip
			}

			if (Device.system.desktop) {

				// invisible element for desktop keyboard navigation
				rm.write("<span class='sapMPopoverHiddenFocusable' id='" + oControl.getId() + "-lastfe' tabindex='0'></span>");
			}
		};

		PopoverRenderer.generateRootClasses = function(oControl) {
			var aClassNames = ["sapMPopover"],
				oSubHeader = oControl.getSubHeader(),
				oFooter = oControl.getFooter(),
				bVerScrollable = oControl.getVerticalScrolling() && !oControl._forceDisableScrolling,
				bHorScrollable = oControl.getHorizontalScrolling() && !oControl._forceDisableScrolling,
				oHeaderControl;

			if (oControl.getShowHeader()) {
				oHeaderControl = oControl._getAnyHeader();
			}

			if (oHeaderControl) {
				aClassNames.push("sapMPopoverWithBar");
			} else {
				aClassNames.push("sapMPopoverWithoutBar");
			}

			if (oSubHeader) {
				aClassNames.push("sapMPopoverWithSubHeader");
			} else {
				aClassNames.push("sapMPopoverWithoutSubHeader");
			}

			if (oControl._hasSingleNavContent()) {
				aClassNames.push("sapMPopoverNav");
			}

			if (oControl._hasSinglePageContent()) {
				aClassNames.push("sapMPopoverPage");
			}

			if (oFooter) {
				aClassNames.push("sapMPopoverWithFooter");
			} else {
				aClassNames.push("sapMPopoverWithoutFooter");
			}

			if (oControl.getPlacement() === PlacementType.Top) {
				aClassNames.push("sapMPopoverPlacedTop");
			}

			if (!bVerScrollable) {
				aClassNames.push("sapMPopoverVerScrollDisabled");
			}

			if (!bHorScrollable) {
				aClassNames.push("sapMPopoverHorScrollDisabled");
			}

			aClassNames.push("sapMPopup-CTX");

			// Adds styles for compact mode
			if (oControl._bSizeCompact) {
				aClassNames.push("sapUiSizeCompact");
			}

			// add custom classes set by the application as well
			return aClassNames.concat(oControl.aCustomStyleClasses);
		};

		PopoverRenderer.rerenderContentOnly = function(oControl) {
			var $Popover = oControl.$(),
				oPopoverDomRef = oControl.getDomRef(),
				aClassNames, oRm;

			if (!oPopoverDomRef) {

				// popover isn't rendered yet, just return
				return;
			}

			$Popover.removeClass();
			aClassNames = this.generateRootClasses(oControl);
			$Popover.addClass(aClassNames.join(" "));
			oRm = sap.ui.getCore().createRenderManager();
			this.renderContent(oRm, oControl);
			oRm.flush(oPopoverDomRef, true);
			oRm.destroy();

			// recalculate the size and position of popover
			oControl._onOrientationChange();
		};

		return PopoverRenderer;
	}, /* bExport= */ true);
