/*!
 * ${copyright}
 */

sap.ui.define(["./library","sap/base/security/encodeCSS"],
	function(library,encodeCSS) {
	"use strict";

	var LoadState = library.LoadState;

	/**
	 * ToDo Card renderer.
	 * @namespace
	 */
	var ToDoCardRenderer = {
		apiVersion: 2    // enable in-place DOM patching
	};

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the Render-Output-Buffer
	 * @param {sap.m.ActionTile} oControl the control to be rendered
	 */
	ToDoCardRenderer.render = function(oRm, oControl) {
		var sState = oControl.getState();
		var sAriaRoleDescription = oControl.getAriaRoleDescription();
		var sAriaRole = oControl.getAriaRole();
		var bHasPress = oControl.hasListeners("press");
		var sStateClass = encodeCSS("sapMATState" + sState);

		oRm.openStart("div",oControl);
		oRm.class("sapMToDoCard");
		oRm.class(sStateClass);
		if (sState !== LoadState.Disabled) {
			if (!oControl.isInActionRemoveScope() && oControl.getPressEnabled()) {
				oRm.class("sapMPointer");
			}
			if (!oControl.getPressEnabled()) {
				oRm.class("sapMATAutoPointer");
			}
			oRm.attr("tabindex", "0");
		}
		if (sAriaRoleDescription) {
			oRm.attr("aria-roledescription", sAriaRoleDescription );
		}
		if (sAriaRole) {
			oRm.attr("role", sAriaRole);
		} else {
			oRm.attr("role", bHasPress ? "button" : "presentation");
		}
		if (oControl.getWidth()) {
			oRm.style("width", oControl.getWidth());
		}
		oRm.openEnd();
		if (sState === LoadState.Loading) {
			this._renderLoadingShimmers(oRm,oControl);
		} else {
			this._renderHeader(oRm, oControl);
			this._renderContent(oRm, oControl);
			this._renderButton(oRm,oControl);
		}
		if (sState !== LoadState.Disabled) {
			this._renderFocusDiv(oRm, oControl);
		}
		oRm.close("div");
	};

	/**
	 * Renders the header.
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer
	 * @param {sap.m.ActionTile} oControl The control that is rendered
	 * @private
	 */
	ToDoCardRenderer._renderHeader = function(oRm, oControl) {
		oRm.openStart("div", oControl.getId() + "-hdr-text");
		oRm.class("sapMGTHdrContent");
		oRm.openEnd();
		oRm.renderControl(oControl._oTitle);
		oRm.close("div");
	};

	/**
	 * Renders the content inside the ActionTile.
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer
	 * @param {sap.m.ActionTile} oControl The control that is rendered
	 * @private
	 */
	ToDoCardRenderer._renderContent = function(oRm, oControl) {
		oControl.getTileContent().forEach(function(oContent){
			oRm.renderControl(oContent);
		});
	};

	/**
	 * Renders the focus div for the ActionTile.
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer
	 * @param {sap.m.ActionTile} oControl The control that is rendered
	 * @private
	 */

	ToDoCardRenderer._renderFocusDiv = function(oRm, oControl) {
		oRm.openStart("div", oControl.getId() + "-focus");
		oRm.class("sapMATFocusDiv");
		oRm.openEnd();
		oRm.close("div");
	};

	/**
	 *Renders the buttons inside the ActionTile
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer
	 * @param {sap.m.ActionTile} oControl The control that is rendered
	 * @private
	 */

	ToDoCardRenderer._renderButton = function(oRm, oControl) {
		oRm.openStart("div", oControl.getId() + "-actionButtons");
			oRm.class("sapMATActionModeContainer");
			oRm.openEnd();
			oControl.getActionButtons().forEach(function (oActionButton) {
				oRm.renderControl(oActionButton);
			});
		oRm.close("div");
	};

	/**
	 * Renders the loading state shimmers on the ActionTile
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer
	 * @param {sap.m.ActionTile} oControl The control that is rendered
	 * @private
	 */
	ToDoCardRenderer._renderLoadingShimmers = function(oRm, oControl) {
		oRm.openStart("div").class("sapMGTContentShimmerPlaceholderItem");
		oRm.class("sapMGTContentShimmerPlaceholderWithDescription");
		oRm.openEnd();
		for (var i = 0; i < 5; i++) {
			this._renderShimmer(oRm,oControl);
		}
		oRm.close("div");
	};

	/**
	 * Renders the individual shimmer on the ActionTile in the loading state
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer
	 * @param {sap.m.ActionTile} oControl The control that is rendered
	 * @private
	 */
	ToDoCardRenderer._renderShimmer = function(oRm, oControl) {
		oRm.openStart("div")
		.class("sapMGTContentShimmerPlaceholderRows")
		.openEnd();
		oRm.openStart("div")
		.class("sapMGTContentShimmerPlaceholderItemHeader")
		.class("sapMGTLoadingShimmer")
		.openEnd()
		.close("div");
		oRm.openStart("div")
		.class("sapMGTContentShimmerPlaceholderItemText")
		.class("sapMGTLoadingShimmer")
		.openEnd()
		.close("div");
		oRm.close("div");
	};


	return ToDoCardRenderer;

}, /* bExport= */true);
