/*!
 * ${copyright}
 */
sap.ui.define([
	'sap/ui/Device',
	'sap/m/library',
	"sap/ui/core/ControlBehavior",
	"sap/ui/dom/getScrollbarSize",
	"sap/ui/core/IconPool" // side effect: required when calling RenderManager#icon
], function(Device, library, ControlBehavior, getScrollbarSize) {
	"use strict";

	// shortcut for sap.m.PlacementType
	var PlacementType = library.PlacementType;

	/**
	 * Popover renderer.
	 * @namespace
	 */
	var PopoverRenderer = {
		apiVersion: 2
	};

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} rm The RenderManager that can be used for writing to the Render-Output-Buffer
	 * @param {sap.m.Popover} oControl An object representation of the control that should be rendered
	 */
	PopoverRenderer.render = function(oRm, oControl) {
		oRm.openStart("div", oControl);
		var aClassNames = this.generateRootClasses(oControl);
		aClassNames.forEach(function(sClassName) {
			oRm.class(sClassName);
		});

		if (!oControl.getHorizontalScrolling()) {
			oRm.class("sapMPopoverHorScrollDisabled");
		}

		if (!oControl.getVerticalScrolling()) {
			oRm.class("sapMPopoverVerScrollDisabled");
		}

		var sTooltip = oControl.getTooltip_AsString();
		if (sTooltip) {
			oRm.attr("title", sTooltip);
		}

		oRm.attr("tabindex", "-1")
			.accessibilityState(oControl, oControl._getAccessibilityOptions()) // ARIA
			.openEnd();

		if (oControl.getResizable()) {
			PopoverRenderer.renderResizeHandle(oRm);
		}

		this.renderContent(oRm, oControl);
		oRm.close("div");
	};

	PopoverRenderer.isButtonFooter = function(footer) {
		if (footer && footer.isA("sap.m.Bar")) {
			var aContentLeft = footer.getContentLeft(),
				aContentRight = footer.getContentRight(),
				aContentMiddle = footer.getContentMiddle(),
				bLeftEmpty = (!aContentLeft || aContentLeft.length === 0),
				bRightEmpty = (!aContentRight || aContentRight.length === 0),
				bMiddleTwoButtons = false;

			if (aContentMiddle && aContentMiddle.length === 2) {
				if ((aContentMiddle[0] && aContentMiddle[0].isA("sap.m.Button")) && (aContentMiddle[1] && aContentMiddle[1].isA("sap.m.Button"))) {
					bMiddleTwoButtons = true;
				}
			}

			return bLeftEmpty && bRightEmpty && bMiddleTwoButtons;
		} else {
			return false;
		}
	};

	PopoverRenderer.renderContent = function(oRm, oControl) {
		var oHeader = oControl._getAnyHeader(),
			sId = oControl.getId(),
			i = 0,
			contents = oControl._getAllContent(),
			oFooter = oControl.getFooter(),
			oSubHeader = oControl.getSubHeader(),
			sContentWidth = oControl.getContentWidth(),
			sContentMinWidth = oControl.getContentMinWidth(),
			sContentHeight = oControl.getContentHeight();

		if (Device.system.desktop) {
			// invisible element for cycling keyboard navigation
			oRm.openStart("span", oControl.getId() + "-firstfe")
				.class("sapMPopoverHiddenFocusable")
				.attr("tabindex", "0")
				.attr("role", "presentation")
				.openEnd()
				.close("span");
		}

		// Header
		if (oHeader) {
			oRm.openStart("header")
				.class("sapMPopoverHeader")
				.openEnd();

			if (oHeader._applyContextClassFor) {
				oHeader._applyContextClassFor("header");
			}
			oRm.renderControl(oHeader);
			oRm.close("header");
		}

		// Sub header
		if (oSubHeader) {

			oRm.openStart("header")
				.class("sapMPopoverSubHeader")
				.openEnd();

			if (oSubHeader._applyContextClassFor) {
				oSubHeader._applyContextClassFor("subheader");
			}

			oRm.renderControl(oSubHeader);
			oRm.close("header");
		}

		// content container
		oRm.openStart("div", sId + "-cont");
		if (sContentWidth) {
			oRm.style("width", sContentWidth);
		}

		if (sContentMinWidth) {
			oRm.style("min-width", sContentMinWidth);
		}

		if (sContentHeight) {
			oRm.style("height", sContentHeight);
		}

		oRm.class("sapMPopoverCont");

		// Note: If this property should become public in the future, the property will have to be set on a level
		// that will encapsulate the header and the footer of the popover as well.
		if (ControlBehavior.isAccessibilityEnabled()
			&& oControl.getProperty("ariaRoleApplication")) {
			oRm.attr("role", "application");
		}

		oRm.openEnd();

		// scroll area
		oRm.openStart("div", oControl.getId() + "-scroll")
			.class("sapMPopoverScroll");

		oRm.openEnd();

		for (i = 0; i < contents.length; i++) {
			oRm.renderControl(contents[i]);
		}

		oRm.close("div");	// scroll area
		oRm.close("div");	// content container

		// Footer
		if (oFooter) {

			oRm.openStart("footer")
				.class("sapMPopoverFooter");

			if (this.isButtonFooter(oFooter)) {
				oRm.class("sapMPopoverSpecialFooter");
			}

			oRm.openEnd();

			if (oFooter._applyContextClassFor) {
				oFooter._applyContextClassFor("footer");
				oFooter.addStyleClass("sapMTBNoBorders");
			}

			oRm.renderControl(oFooter);

			oRm.close("footer");
		}

		// Arrow
		if (oControl.getShowArrow()) {
			oRm.openStart("span", sId + "-arrow")
				.class("sapMPopoverArr")
				.openEnd()
				.close("span");	// arrow tip
		}

		if (Device.system.desktop) {
			//invisible element for desktop keyboard navigation
			oRm.openStart("span", oControl.getId() + "-middlefe")
				.class("sapMPopoverHiddenFocusable")
				.attr("tabindex", "-1")
				.openEnd()
				.close("span");

			// invisible element for desktop keyboard navigation
			oRm.openStart("span", oControl.getId() + "-lastfe")
				.class("sapMPopoverHiddenFocusable")
				.attr("tabindex", "0")
				.attr("role", "presentation")
				.openEnd()
				.close("span");
		}
	};

	PopoverRenderer.generateRootClasses = function(oControl) {
		var aClassNames = ["sapMPopover"],
			oSubHeader = oControl.getSubHeader(),
			oFooter = oControl.getFooter(),
			bVerScrollable = oControl.getVerticalScrolling() && !oControl._forceDisableScrolling,
			bHorScrollable = oControl.getHorizontalScrolling() && !oControl._forceDisableScrolling,
			oHeaderControl = oControl._getAnyHeader();

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

	PopoverRenderer.renderResizeHandle = function(oRm) {
		oRm.openStart("div")
			.class("sapMPopoverResizeHandle")
			.openEnd();

		oRm.icon("sap-icon://resize-corner", ["sapMPopoverResizeHandleIcon"], {
			"aria-hidden": true
		});

		oRm.close("div");
	};

	return PopoverRenderer;
});