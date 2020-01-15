/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/m/library",
	"sap/ui/Device",
	"sap/ui/core/library"
], function (library, Device, coreLibrary) {
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
	 * @param {sap.ui.core.Control} oDialog An object representation of the control that should be rendered.
	 */
	DialogRenderer.render = function (oRM, oDialog) {
		var sId = oDialog.getId(),
			oHeader = oDialog._getAnyHeader(),
			oSubHeader = oDialog.getSubHeader(),
			oBeginButton = oDialog.getBeginButton(),
			oEndButton = oDialog.getEndButton(),
			sState = oDialog.getState(),
			bStretch = oDialog.getStretch(),
			bStretchOnPhone = oDialog.getStretchOnPhone() && Device.system.phone,
			oValueStateText = oDialog.getAggregation("_valueState");

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

		if (bStretch || bStretchOnPhone) {
			oRM.class("sapMDialogStretched");
		}

		oRM.class(DialogRenderer._mStateClasses[sState]);

		// No Footer
		var bNoToolbarAndNoButtons = !oDialog._oToolbar && !oBeginButton && !oEndButton;
		var bEmptyToolbarAndNoButtons = oDialog._oToolbar && oDialog._isToolbarEmpty() && !oBeginButton && !oEndButton;
		if (bNoToolbarAndNoButtons || bEmptyToolbarAndNoButtons) {
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

		if (oDialog._forceDisableScrolling) {
			oRM.class("sapMDialogWithScrollCont");
		}

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
				oRM.icon("sap-icon://resize-corner", ["sapMDialogResizeHandler"], { "title": "" });
			}

			// Invisible element which is used to determine when desktop keyboard navigation
			// has reached the first focusable element of a Dialog and went beyond.
			// In that case, the controller will focus the last focusable element.
			oRM.openStart("span", sId + "-firstfe")
				.class("sapMDialogFirstFE")
				.attr("tabindex", "0")
				.openEnd()
				.close("span");
		}

		if (oHeader) {
			oHeader._applyContextClassFor("header");
			oRM.openStart("header")
				.class("sapMDialogTitle")
				.openEnd()
				.renderControl(oHeader)
				.close("header");
		}

		if (oSubHeader) {
			oSubHeader._applyContextClassFor("subheader");
			oRM.openStart("header")
				.class("sapMDialogSubHeader")
				.openEnd()
				.renderControl(oSubHeader)
				.close("header");
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

		if (!(bNoToolbarAndNoButtons || bEmptyToolbarAndNoButtons)) {
			oDialog._oToolbar._applyContextClassFor("footer");
			oRM.openStart("footer")
				.class("sapMDialogFooter")
				.openEnd()
				.renderControl(oDialog._oToolbar)
				.close("footer");
		}

		if (Device.system.desktop) {
			// Invisible element which is used to determine when desktop keyboard navigation
			// has reached the last focusable element of a dialog and went beyond.
			// In that case, the controller will focus the first focusable element.
			oRM.openStart("span", sId + "-lastfe")
				.class("sapMDialogLastFE")
				.attr("tabindex", "0")
				.openEnd()
				.close("span");
		}

		oRM.close("div");
	};

	return DialogRenderer;

}, /* bExport= */ true);