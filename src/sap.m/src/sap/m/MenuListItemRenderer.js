/*!
 * ${copyright}
 */

sap.ui.define(['./ListItemBaseRenderer', 'sap/ui/core/Renderer', 'sap/m/library', 'sap/ui/core/library'], function(ListItemBaseRenderer, Renderer, library, coreLibrary) {
	"use strict";

	// shortcut for sap.ui.core.TextDirection
	var TextDirection = coreLibrary.TextDirection;

	// shortcut for sap.m.ListType
	var ListType = library.ListType;

	// shortcut for sap.ui.core.ItemSelectionMode
	var ItemSelectionMode = coreLibrary.ItemSelectionMode;

	/**
	 * <code>MenuListItem</code> renderer.
	 * @namespace
	 */
	var MenuListItemRenderer = Renderer.extend(ListItemBaseRenderer);

	MenuListItemRenderer.apiVersion = 2;

	/**
	 * Renders separator between two items.
	 * @param {sap.ui.core.RenderManager} rm the RenderManager that can be used for writing to the Render-Output-Buffer
	 */
	MenuListItemRenderer.renderSeparator = function(rm, oLI) {

		rm.openStart("li");
		rm.attr("role", "separator");
		rm.class("sapUiMnuDiv");
		rm.openEnd();
		rm.openStart("div");
		rm.class("sapUiMnuDivL");
		rm.openEnd();
		rm.close("div");
		rm.voidStart("hr").voidEnd();
		rm.openStart("div");
		rm.class("sapUiMnuDivR");
		rm.openEnd();
		rm.close("div");
		rm.close("li");
	};

	/**
	 * Renders the HTML for the given control, using the provided
	 * {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager}
	 *          rm the RenderManager that can be used for writing to the
	 *          Render-Output-Buffer
	 * @param {sap.m.MenuListItem}
	 *          oLI an object representation of the control that should be
	 *          rendered
	 */
	MenuListItemRenderer.renderLIAttributes = function(rm, oLI) {
		rm.class("sapMSLI");
		if (oLI.getIcon()) {
			rm.class("sapMSLIIcon");
		}

		if (oLI.getType() == ListType.Detail || oLI.getType() == ListType.DetailAndActive) {
			rm.class("sapMSLIDetail");
		}

		if (oLI._hasSubItems()) {
			rm.class("sapMMenuLIHasChildren");
		}

		if (!oLI.getEnabled()) {
			rm.class("sapMMLIDisabled");
		}
	};

	MenuListItemRenderer.renderLIContent = function(rm, oLI) {
		var sTextDir = oLI.getTitleTextDirection();

		if (oLI.getStartsSection() || oLI._hasGroupSeparator()) {
			MenuListItemRenderer.renderSeparator(rm, oLI);
		}

		// image
		rm.openStart("div");
		rm.class("sapMMenuLIImgThumbWrapper");
		rm.openEnd();

		if (oLI.getIcon()) {
			rm.renderControl(oLI._getImage((oLI.getId() + "-img"), "sapMMenuLIImgThumb", oLI.getIcon(), oLI.getIconDensityAware()));
		}
		rm.close("div");

		rm.openStart("div");
		rm.class("sapMSLIDiv");
		rm.class("sapMSLITitleDiv");
		rm.openEnd();

		//noFlex: make an additional div for the contents table
		if (oLI._bNoFlex) {
			rm.openStart("div");
			rm.class("sapMLIBNoFlex");
			rm.openEnd();
		}

		// List item text (also written when no title for keeping the space)
		rm.openStart("div");
		rm.class("sapMSLITitleOnly");

		if (sTextDir !== TextDirection.Inherit) {
			rm.attr("dir", sTextDir.toLowerCase());
		}

		rm.openEnd();
		rm.text(oLI.getTitle());
		rm.close("div");


		//noFlex: make an additional div for the contents table
		if (oLI._bNoFlex) {
			rm.close('div');
		}
		rm.close("div");

		// arrow right if there is a sub-menu
		if (oLI._hasSubItems()) {
			rm.renderControl(oLI._getIconArrowRight());
		} else if (oLI._getItemSelectionMode() !== ItemSelectionMode.None && oLI.getProperty("selected")) {
			rm.openStart("div", oLI.getId() + "-sel");
			rm.class("sapMMenuLISel");
			rm.openEnd();
			rm.close("div");
		}

	};

	MenuListItemRenderer.getAccessibilityState = function(oLI) {
		var mAccessibilityState = ListItemBaseRenderer.getAccessibilityState(oLI),
			sRole;

		if (oLI._getItemSelectionMode() !== ItemSelectionMode.None && oLI.getProperty("selected")) {
			mAccessibilityState.checked = true;
			mAccessibilityState.selected = null;
		}

		switch (oLI._getItemSelectionMode()) {
			case ItemSelectionMode.SingleSelect:
				sRole = "menuitemradio";
				break;
			case ItemSelectionMode.MultiSelect:
				sRole = "menuitemcheckbox";
				break;
			default:
				sRole = "menuitem";
		}

		mAccessibilityState.role = sRole;

		return mAccessibilityState;
	};

	MenuListItemRenderer.getAriaRole = function(oLI) {
	};


	return MenuListItemRenderer;
});

