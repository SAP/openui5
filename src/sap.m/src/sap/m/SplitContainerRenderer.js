/*!
 * ${copyright}
 */

sap.ui.define([
	"./library",
	"sap/ui/Device"
], function(library, Device) {
	"use strict";

	// shortcut for sap.m.SplitAppMode
	var SplitAppMode = library.SplitAppMode;

	/**
	 * SplitContainer renderer.
	 * @namespace
	 */
	var SplitContainerRenderer = {
		apiVersion: 2
	};

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.m.SplitContainer} oSplitContainer an object representation of the control that should be rendered
	 */
	SplitContainerRenderer.render = function(oRm, oSplitContainer){
		var sMode = oSplitContainer.getMode(),
			sTooltip = oSplitContainer.getTooltip_AsString();

		oRm.openStart("div", oSplitContainer)
			.class("sapMSplitContainer");

		if (this.renderAttributes) {
			this.renderAttributes(oRm, oSplitContainer); // may be used by inheriting renderers, but DO NOT write class or style attributes! Instead, call addClass/addStyle.
		}

		if (!Device.system.phone) {
			if (Device.orientation.portrait) {
				oRm.class("sapMSplitContainerPortrait");
			}

			switch (sMode) {
				case SplitAppMode.ShowHideMode:
					oRm.class("sapMSplitContainerShowHide");
					break;
				case SplitAppMode.StretchCompressMode:
					oRm.class("sapMSplitContainerStretchCompress");
					break;
				case SplitAppMode.PopoverMode:
					oRm.class("sapMSplitContainerPopover");
					break;
				case SplitAppMode.HideMode:
					oRm.class("sapMSplitContainerHideMode");
					break;
				default:
					break;
			}
		}

		if (sTooltip) {
			oRm.attr("title", sTooltip);
		}
		oRm.openEnd(); // div

		if (this.renderBeforeContent) {
			this.renderBeforeContent(oRm, oSplitContainer);
		}

		this.renderMasterAndDetail(oRm, oSplitContainer, sMode);

		oRm.close("div");
	};

	SplitContainerRenderer.renderMasterAndDetail = function (oRm, oSplitContainer, sMode) {
		if (Device.system.phone) {
			oSplitContainer._oMasterNav.addStyleClass("sapMSplitContainerMobile");
			oRm.renderControl(oSplitContainer._oMasterNav);
			return;
		}

		oSplitContainer._bMasterisOpen = false;

		if ((Device.orientation.landscape && (sMode !== SplitAppMode.HideMode)) || Device.orientation.portrait && (sMode === SplitAppMode.StretchCompress)) {
			oSplitContainer._oMasterNav.addStyleClass("sapMSplitContainerMasterVisible")
										.removeStyleClass("sapMSplitContainerMasterHidden")
										.removeStyleClass("sapMSplitContainerNoTransition");
			oSplitContainer._bMasterisOpen = true;
		} else {
			oSplitContainer._oMasterNav.addStyleClass("sapMSplitContainerMasterHidden")
										.addStyleClass("sapMSplitContainerNoTransition") // "sapMSplitContainerNoTransition" class is added to prevent initial flickering
										.removeStyleClass("sapMSplitContainerMasterVisible");
		}

		if (sMode === SplitAppMode.PopoverMode && Device.orientation.portrait) {
			oSplitContainer._oDetailNav.addStyleClass("sapMSplitContainerDetail");
			oRm.renderControl(oSplitContainer._oDetailNav);
			//add master to popover if it's not yet added
			if (oSplitContainer._oPopOver.getContent().length === 0) {
				oSplitContainer._oPopOver.addAggregation("content", oSplitContainer._oMasterNav, true);
			}
		} else {
			oSplitContainer._oMasterNav.addStyleClass("sapMSplitContainerMaster");
			oRm.renderControl(oSplitContainer._oMasterNav);

			oSplitContainer._oDetailNav.addStyleClass("sapMSplitContainerDetail");
			oRm.renderControl(oSplitContainer._oDetailNav);
		}
	};

	return SplitContainerRenderer;
}, /* bExport= */ true);
