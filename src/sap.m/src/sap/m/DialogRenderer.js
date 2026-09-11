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

	// shortcut for library resource bundle
	const oResourceBundle = Library.getResourceBundleFor("sap.m");

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
			bStretched = oDialog.getStretch(),
			oValueStateText = oDialog.getAggregation("_valueState"),
			oFooter = oDialog.getFooter(),
			sContentWidth = oDialog.getContentWidth(),
			oRb = Library.getResourceBundleFor("sap.m");

		// write the HTML into the render manager
		// the initial size of the dialog have to be 0, because if there is a large dialog content the initial size can be larger than the html's height (scroller)
		// The scroller will make the initial window width smaller and in the next recalculation the maxWidth will be larger.

		oRM.openStart("div", oDialog);

		if (!bStretched) {
			oRM.style("width", sContentWidth);
		}

		oRM.class("sapMDialog")
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

		if (bStretched) {
			oRM.class("sapMDialogStretched");
		}

		if (oDialog.getResizable() && !bStretched) {
			oRM.class("sapMDialogResizable");
		}

		/**
		 * @deprecated As of version 1.11.2
		 */
		if (!bStretched && oDialog.getStretchOnPhone() && Device.system.phone) {
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
			role: sRole.toLowerCase(),
			modal: true,
			describedby: oDialog._oAriaDescribedbyText.getText() ? oDialog._oAriaDescribedbyText.getId() : undefined
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

		if (oDialog.getDraggable() && !bStretched) {
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

		if (oDialog._oAriaDescribedbyText.getText()) {
			oRM.renderControl(oDialog._oAriaDescribedbyText);
		}

		if (Device.system.desktop) {
			if (oDialog.getResizable() && !bStretched) {
				DialogRenderer.renderResizeHandle(oRM);
			}

			// Invisible element which is used to determine when desktop keyboard navigation
			// has reached the first focusable element of a Dialog and went beyond.
			// In that case, the controller will focus the last focusable element.
			oRM.openStart("span", sId + "-firstfe")
				.class("sapMDialogFirstFE")
				.class("sapUiSkipFocusFail")
				.attr("role", "none")
				.attr("tabindex", "0")
				.openEnd()
				.close("span");
		}

		if (oDialog._isDraggableOrResizable()) {
			let sLabel;
			if (oDialog.getResizable() && oDialog.getDraggable()) {
				sLabel = oRb.getText("DIALOG_DRAG_AND_RESIZE_HANDLE_ARIA_LABEL");
			} else if (oDialog.getDraggable()) {
				sLabel = oRb.getText("DIALOG_DRAG_HANDLE_ARIA_LABEL");
			} else if (oDialog.getResizable()) {
				sLabel = oRb.getText("DIALOG_RESIZE_HANDLE_ARIA_LABEL");
			}

			oRM.openStart("span", sId + "-dragAndResizeHandler")
				.class("sapMDialogDragAndResizeHandler")
				.attr("tabindex", "0")
				.attr("role", "img")
				.attr("aria-roledescription", oRb.getText("DIALOG_HANDLE_ARIA_ROLEDESCRIPTION"))
				.attr("aria-label", sLabel)
				.attr("aria-describedby", oDialog._oDescribedbyDragAndResizeHandleText.getId())
				.openEnd()
				.close("span");

			oRM.renderControl(oDialog._oDescribedbyDragAndResizeHandleText);
		}

		if (oHeader || oSubHeader) {
			oRM.openStart("div")
				.attr("role", "region")
				.attr("aria-label", oResourceBundle.getText("DIALOG_REGION_HEADER"))
				.class("sapMDialogHeader")
				.openEnd();

			if (oHeader) {
				if (oHeader._applyContextClassFor) {
					oHeader._applyContextClassFor("header");
				}
				oRM.openStart("div", sId + "-titleGroup")
					.class("sapMDialogTitleGroup");

				oRM.openEnd()
					.renderControl(oHeader)
					.close("div");
			}

			if (oSubHeader && oSubHeader.getVisible()) {
				if (oSubHeader._applyContextClassFor) {
					oSubHeader._applyContextClassFor("subheader");
				}
				oRM.openStart("div")
					.class("sapMDialogSubHeader")
					.openEnd()
					.renderControl(oSubHeader)
					.close("div");
			}
			oRM.close("div");

		}

		if (oValueStateText) {
			oRM.renderControl(oValueStateText);
		}

		oRM.openStart("div", sId + "-cont")
			.attr("role", "region")
			.attr("aria-label", oResourceBundle.getText("DIALOG_REGION_CONTENT"))
			.class("sapMDialogSection")
			.openEnd();

		oRM.openStart("div", sId + "-scroll")
			.class("sapMDialogScroll")
			.openEnd();

		oRM.openStart("div", sId + "-scrollCont")
			.class("sapMDialogScrollCont");

		if (bStretched || oDialog.getContentHeight()) {
			oRM.class("sapMDialogStretchContent");
		}

		oRM.openEnd();

		oDialog.getContent().forEach(oRM.renderControl, oRM);

		oRM.close("div")
			.close("div")
			.close("div");

		if (hasFooter) {
			oRM.openStart("div")
				.attr("role", "region")
				.attr("aria-label", oResourceBundle.getText("DIALOG_REGION_FOOTER"))
				.class("sapMDialogFooter")
				.openEnd();

			if (oFooter) {
				if (oFooter._applyContextClassFor) {
					oFooter._applyContextClassFor("footer");
				}
				oRM.renderControl(oFooter);
			} else {
				if (oDialog._oToolbar._applyContextClassFor) {
					oDialog._oToolbar._applyContextClassFor("footer");
				}
				oRM.renderControl(oDialog._oToolbar);
			}
			oRM.close("div");
		}

		if (Device.system.desktop) {
			// Invisible element which is used to determine when desktop keyboard navigation
			// has reached the last focusable element of a dialog and went beyond.
			// In that case, the controller will focus the first focusable element.
			oRM.openStart("span", sId + "-lastfe")
				.class("sapMDialogLastFE")
				.class("sapUiSkipFocusFail")
				.attr("role", "none")
				.attr("tabindex", "0")
				.openEnd()
				.close("span");
		}

		oRM.close("div");
	};

	DialogRenderer.renderResizeHandle = function(oRM) {
		var oRb = Library.getResourceBundleFor("sap.m");

		oRM.openStart("div")
			.class("sapMDialogResizeHandle")
			.openEnd();

		oRM.icon("sap-icon://resize-corner", ["sapMDialogResizeHandleIcon"], { "title": oRb.getText("DIALOG_RESIZE_HANDLE_TOOLTIP"), "aria-label": null });

		oRM.close("div");
	};

	return DialogRenderer;
}, /* bExport= */ true);
