/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/m/library",
	"sap/ui/Device",
	"sap/ui/core/library",
	"sap/ui/core/Lib",
	"sap/ui/core/IconPool" // side effect: required when calling RenderManager#icon
], function (library, Device, coreLibrary, Library) {
	"use strict";

	// shortcut for sap.m.DialogType
	var DialogType = library.DialogType;

	// shortcut for sap.m.DialogRoleType
	var DialogRoleType = library.DialogRoleType;

	// shortcut for sap.ui.core.ValueState
	var ValueState = coreLibrary.ValueState;

	/**
	 * Dialog renderer.
	 *
	 * @namespace
	 */
	var DialogRenderer = {
		apiVersion: 2
	};

	// Mapping of ValueState to style class
	DialogRenderer._mStateClasses = {};
	DialogRenderer._mStateClasses[ValueState.None] = "";
	DialogRenderer._mStateClasses[ValueState.Success] = "sapMDialogSuccess";
	DialogRenderer._mStateClasses[ValueState.Warning] = "sapMDialogWarning";
	DialogRenderer._mStateClasses[ValueState.Error] = "sapMDialogError";
	DialogRenderer._mStateClasses[ValueState.Information] = "sapMDialogInformation";

	/**
	 * Renders the HTML for the Dialog control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRM The RenderManager that can be used for writing to the render output buffer.
	 * @param {sap.m.Dialog} oDialog An object representation of the control that should be rendered.
	 */
	DialogRenderer.render = function (oRM, oDialog) {
		var sId = oDialog.getId(),
			oHeader = oDialog._getAnyHeader(),
			oSubHeader = oDialog.getSubHeader(),
			oBeginButton = oDialog.getBeginButton(),
			oEndButton = oDialog.getEndButton(),
			sState = oDialog.getState(),
			bStretch = oDialog.getStretch(),
			oValueStateText = oDialog.getAggregation("_valueState"),
			oFooter = oDialog.getFooter();

		// write the HTML into the render manager
		// the initial size of the dialog have to be 0, because if there is a large dialog content the initial size can be larger than the html's height (scroller)
		// The scroller will make the initial window width smaller and in the next recalculation the maxWidth will be larger.

		oRM.openStart("div", oDialog)
			.style("width", oDialog.getContentWidth())
			.style("height", oDialog.getContentHeight())
			.class("sapMDialog")
			.class("sapMDialog-CTX")
			.class("sapMPopup-CTX");

		if (oDialog.isOpen()) {
			oRM.class("sapMDialogOpen");
		}

		if (window.devicePixelRatio > 1) {
			oRM.class("sapMDialogHighPixelDensity");
		}

		if (oDialog._bDisableRepositioning) {
			oRM.class("sapMDialogTouched");
		}

		if (bStretch) {
			oRM.class("sapMDialogStretched");
		}

		oRM.class(DialogRenderer._mStateClasses[sState]);

		// No Footer
		var bNoToolbarAndNoButtons = !oDialog._oToolbar && !oBeginButton && !oEndButton;
		var bEmptyToolbarAndNoButtons = oDialog._oToolbar && oDialog._isToolbarEmpty() && !oBeginButton && !oEndButton;
		var bHiddenFooter = oDialog._oToolbar && !oDialog._oToolbar.getVisible();
		var hasFooter = !bNoToolbarAndNoButtons && !bEmptyToolbarAndNoButtons && !bHiddenFooter || oFooter;
		if (!hasFooter) {
			oRM.class("sapMDialog-NoFooter");
		}

		if (!oHeader) {
			oRM.class("sapMDialog-NoHeader");
		}

		// ARIA
		var sRole = oDialog.getProperty("role");

		if (sState === ValueState.Error || sState === ValueState.Warning) {
			sRole = DialogRoleType.AlertDialog;
		}

		oRM.accessibilityState(oDialog, {
			role: sRole,
			modal: true
		});

		if (oSubHeader && oSubHeader.getVisible()) {
			oRM.class("sapMDialogWithSubHeader");
			if (oSubHeader.getDesign() == library.ToolbarDesign.Info) {
				oRM.class("sapMDialogSubHeaderInfoBar");
			}
		}

		if (oDialog.getType() === DialogType.Message) {
			oRM.class("sapMMessageDialog");
		}

		if (!oDialog.getVerticalScrolling()) {
			oRM.class("sapMDialogVerScrollDisabled");
		}

		if (!oDialog.getHorizontalScrolling()) {
			oRM.class("sapMDialogHorScrollDisabled");
		}

		if (Device.system.phone) {
			oRM.class("sapMDialogPhone");
		}

		if (oDialog.getDraggable() && !bStretch) {
			oRM.class("sapMDialogDraggable");
		}

		// test dialog with sap-ui-xx-formfactor=compact
		if (library._bSizeCompact) {
			oRM.class("sapUiSizeCompact");
		}

		var sTooltip = oDialog.getTooltip_AsString();

		if (sTooltip) {
			oRM.attr("title", sTooltip);
		}

		oRM.attr("tabindex", "-1");

		oRM.openEnd();

		if (Device.system.desktop) {
			if (oDialog.getResizable() && !bStretch) {
				DialogRenderer.renderResizeHandle(oRM);
			}

			// Invisible element which is used to determine when desktop keyboard navigation
			// has reached the first focusable element of a Dialog and went beyond.
			// In that case, the controller will focus the last focusable element.
			oRM.openStart("span", sId + "-firstfe")
				.class("sapMDialogFirstFE")
				.attr("role", "none")
				.attr("tabindex", "0")
				.openEnd()
				.close("span");
		}

		if (oHeader || oSubHeader) {
			oRM.openStart("header")
				.openEnd();
			if (oHeader) {
				oHeader._applyContextClassFor("header");
				oRM.openStart("div")
					.class("sapMDialogTitleGroup");

				if (oDialog._isDraggableOrResizable()) {
					oRM.attr("tabindex", 0)
						.accessibilityState(oHeader, {
							role: "group",
							roledescription: Library.getResourceBundleFor("sap.m").getText("DIALOG_HEADER_ARIA_ROLE_DESCRIPTION"),
							describedby: { value: oDialog.getId() + "-ariaDescribedbyText", append: true }
						});
				}

				oRM.openEnd()
					.renderControl(oHeader)
					.renderControl(oDialog._oAriaDescribedbyText)
					.close("div");
			}

			if (oSubHeader && oSubHeader.getVisible()) {
				oSubHeader._applyContextClassFor("subheader");
				oRM.openStart("div")
					.class("sapMDialogSubHeader")
					.openEnd()
					.renderControl(oSubHeader)
					.close("div");
			}
			oRM.close("header");

		}

		if (oValueStateText) {
			oRM.renderControl(oValueStateText);
		}

		oRM.openStart("section", sId + "-cont")
			.class("sapMDialogSection")
			.openEnd();

		oRM.openStart("div", sId + "-scroll")
			.class("sapMDialogScroll")
			.openEnd();

		oRM.openStart("div", sId + "-scrollCont")
			.class("sapMDialogScrollCont");

		if (oDialog.getStretch() || oDialog.getContentHeight()) {
			oRM.class("sapMDialogStretchContent");
		}

		oRM.openEnd();

		oDialog.getContent().forEach(oRM.renderControl, oRM);

		oRM.close("div")
			.close("div")
			.close("section");

		if (hasFooter) {
			oRM.openStart("footer")
				.class("sapMDialogFooter")
				.openEnd();
			if (oFooter) {
				oFooter._applyContextClassFor("footer");
				oRM.renderControl(oFooter);
			} else {
				oDialog._oToolbar._applyContextClassFor("footer");
				oRM.renderControl(oDialog._oToolbar);
			}
			oRM.close("footer");
		}

		if (Device.system.desktop) {
			// Invisible element which is used to determine when desktop keyboard navigation
			// has reached the last focusable element of a dialog and went beyond.
			// In that case, the controller will focus the first focusable element.
			oRM.openStart("span", sId + "-lastfe")
				.class("sapMDialogLastFE")
				.attr("role", "none")
				.attr("tabindex", "0")
				.openEnd()
				.close("span");
		}

		oRM.close("div");
	};

	DialogRenderer.renderResizeHandle = function(oRM) {
		oRM.openStart("div")
			.class("sapMDialogResizeHandle")
			.openEnd();

		oRM.icon("sap-icon://resize-corner", ["sapMDialogResizeHandleIcon"], { "title": null, "aria-label": null });

		oRM.close("div");
	};

	return DialogRenderer;
});