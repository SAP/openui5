/*!
 * ${copyright}
 */

sap.ui.define(["./library", "sap/ui/core/Core", "sap/ui/Device", "sap/ui/core/InvisibleText", "sap/ui/core/InvisibleRenderer"],
	function(library, Core, Device, InvisibleText, InvisibleRenderer) {
	"use strict";


	// shortcut for sap.m.ListType
	var ListItemType = library.ListType;

	// shortcut for sap.m.ListMode
	var ListMode = library.ListMode;


	/**
	 * ListitemBase renderer.
	 *
	 * @namespace
	 */
	var ListItemBaseRenderer = {
		apiVersion: 2
	};

	ListItemBaseRenderer.renderInvisible = function(rm, oLI) {
		InvisibleRenderer.render(rm, oLI, oLI.TagName);
	};

	/**
	 * Renders the highlight state.
	 *
	 * @param {sap.ui.core.RenderManager} rm The RenderManager that can be used for writing to the Render-Output-Buffer.
	 * @param {sap.ui.core.Control} oLI An object representation of the control that is rendered.
	 * @protected
	 */
	ListItemBaseRenderer.renderHighlight = function(rm, oLI) {
		var sHighlight = oLI.getHighlight();
		if (sHighlight == "None") {
			return;
		}

		rm.openStart("div");
		rm.class("sapMLIBHighlight");
		rm.class("sapMLIBHighlight" + sHighlight);
		rm.openEnd();
		rm.close("div");
	};

	ListItemBaseRenderer.isModeMatched = function(sMode, iOrder) {
		var mOrderConfig = (sap.ui.require("sap/m/ListBaseRenderer") || {}).ModeOrder || {};
		return mOrderConfig[sMode] == iOrder;
	};

	/**
	 * Renders the mode when item mode is in correct order
	 *
	 * @param {sap.ui.core.RenderManager} rm The RenderManager that can be used for writing to the Render-Output-Buffer.
	 * @param {sap.ui.core.Control} oLI an object representation of the control that should be rendered.
	 * @param {int} [iOrder] expected order for the rendering
	 * @protected
	 */
	ListItemBaseRenderer.renderMode = function(rm, oLI, iOrder) {
		var sMode = oLI.getMode();
		if (!this.isModeMatched(sMode, iOrder)) {
			return;
		}

		var oModeControl = oLI.getModeControl(true);
		if (oModeControl) {
			this.renderModeContent(rm, oLI, oModeControl);
		}
	};

	ListItemBaseRenderer.renderModeContent = function(rm, oLI, oModeControl) {
		this.decorateMode(oModeControl, oLI);
		rm.renderControl(oModeControl);
	};

	ListItemBaseRenderer.decorateMode = function(oModeControl, oLI) {

		// remove animation classes to avoid unexpected re-rendering behavior
		oModeControl.removeStyleClass("sapMLIBSelectAnimation sapMLIBUnselectAnimation");

		// determine whether animation is necessary or not
		if (!Core.getConfiguration().getAnimation() || !oLI.getListProperty("modeAnimationOn")) {
			return;
		}

		var sMode = oLI.getMode(),
			sLastListMode = oLI.getListProperty("lastMode");

		// determine whether list mode is changed or not
		if (!sLastListMode || sLastListMode == sMode) {
			return;
		}

		if (sMode == ListMode.None) {
			oModeControl.addStyleClass("sapMLIBUnselectAnimation");
		} else {
			oModeControl.addStyleClass("sapMLIBSelectAnimation");
		}
	};

	/**
	 * Renders counter if it is not empty
	 *
	 * @param {sap.ui.core.RenderManager} rm The RenderManager that can be used for writing to the Render-Output-Buffer.
	 * @param {sap.ui.core.Control} oLI An object representation of the control that is rendered.
	 * @protected
	 */
	ListItemBaseRenderer.renderCounter = function(rm, oLI) {
		var iCounter = oLI.getCounter();
		if (iCounter) {
			this.renderCounterContent(rm, oLI, iCounter);
		}
	};

	ListItemBaseRenderer.renderCounterContent = function(rm, oLI, iCounter) {
		rm.openStart("div", oLI.getId() + "-counter");
		rm.attr("aria-label", Core.getLibraryResourceBundle("sap.m").getText("LIST_ITEM_COUNTER", iCounter));
		rm.class("sapMLIBCounter");
		rm.openEnd();
		rm.text(iCounter);
		rm.close("div");
	};

	/**
	 * Renders type for the list item
	 *
	 * @param {sap.ui.core.RenderManager} rm The RenderManager that can be used for writing to the Render-Output-Buffer.
	 * @param {sap.ui.core.Control} oLI an object representation of the control that should be rendered.
	 * @protected
	 */
	ListItemBaseRenderer.renderType = function(rm, oLI) {
		var oTypeControl = oLI.getTypeControl(true);
		if (oTypeControl) {
			rm.renderControl(oTypeControl);
		}
	};

	/**
	 * Renders list item HTML starting tag
	 *
	 * @param {sap.ui.core.RenderManager} rm The RenderManager that can be used for writing to the Render-Output-Buffer.
	 * @param {sap.ui.core.Control} oLI an object representation of the control that should be rendered.
	 * @protected
	 */
	ListItemBaseRenderer.openItemTag = function(rm, oLI) {
		rm.openStart(oLI.TagName, oLI);
	};

	/**
	 * Renders list item HTML closing tag
	 *
	 * @param {sap.ui.core.RenderManager} rm The RenderManager that can be used for writing to the Render-Output-Buffer.
	 * @param {sap.ui.core.Control} oLI an object representation of the control that should be rendered.
	 * @protected
	 */
	ListItemBaseRenderer.closeItemTag = function(rm, oLI) {
		rm.close(oLI.TagName);
	};

	ListItemBaseRenderer.renderTabIndex = function(rm, oLI) {
		rm.attr("tabindex", "-1");
	};

	ListItemBaseRenderer.renderTooltip = function(rm, oLI) {
		var sTooltip = oLI.getTooltip_AsString();
		if (sTooltip) {
			rm.attr("title", sTooltip);
		}
	};

	/**
	 * Adds the classes needed to recognize the element as focusable.
	 *
	 * @param {sap.ui.core.RenderManager} rm The RenderManager that can be used for writing to the Render-Output-Buffer
	 * @param {sap.ui.core.Control} [oLI] an object representation of the control that should be rendered
	 * @protected
	 */
	ListItemBaseRenderer.addFocusableClasses = function(rm, oLI) {
		if (Device.system.desktop) {
			rm.class("sapMLIBFocusable");
			this.addLegacyOutlineClass(rm, oLI);
		}
	};

	/**
	 * Adds the classes for legacy browsers, which do not support normal outlines.
	 *
	 * @param {sap.ui.core.RenderManager} rm The RenderManager that can be used for writing to the Render-Output-Buffer
	 * @param {sap.ui.core.Control} [oLI] an object representation of the control that should be rendered
	 * @protected
	 */
	ListItemBaseRenderer.addLegacyOutlineClass = function(rm, oLI) {
		if (Device.browser.msie || Device.browser.edge) {
			rm.class("sapMLIBLegacyOutline");
		}
	};

	/**
	 * Creates an invisible aria node for the given message bundle text
	 * in the static UIArea and returns its id for ARIA announcements
	 *
	 * This method should be used when text is reached frequently.
	 *
	 * @param {String} sKey key of the announcement
	 * @param {String} [sBundleText] key of the announcement
	 * @returns {String} id of the generated invisible aria node
	 * @protected
	 */
	ListItemBaseRenderer.getAriaAnnouncement = function(sKey, sBundleText) {
		return InvisibleText.getStaticId("sap.m", sBundleText || "LIST_ITEM_" + sKey.toUpperCase());
	};


	/**
	 * Returns aria accessibility role
	 *
	 * @param {sap.ui.core.Control} oLI an object representation of the control
	 * @returns {String}
	 * @protected
	 */
	ListItemBaseRenderer.getAriaRole = function(oLI) {
		return "option";
	};

	/**
	 * Returns the inner aria labelledby ids for the accessibility
	 *
	 * @param {sap.ui.core.Control} oLI an object representation of the control
	 * @returns {String|undefined}
	 * @protected
	 */
	ListItemBaseRenderer.getAriaLabelledBy = function(oLI) {
		if (!oLI.getContentAnnouncement && oLI.getAriaLabelledBy().length) {
			return oLI.getId();
		}
	};

	/**
	 * Returns the inner aria describedby ids for the accessibility
	 *
	 * @param {sap.ui.core.Control} oLI an object representation of the control
	 * @returns {String|undefined}
	 * @protected
	 */
	ListItemBaseRenderer.getAriaDescribedBy = function(oLI) {
		if (oLI.getContentAnnouncement) {
			return "";
		}

		var aDescribedBy = [],
			sType = oLI.getType();

		if (oLI.getListProperty("showUnread") && oLI.getUnread()) {
			aDescribedBy.push(this.getAriaAnnouncement("unread"));
		}

		if (oLI.getMode() == ListMode.Delete) {
			aDescribedBy.push(this.getAriaAnnouncement("delete"));
		}

		if (sType == ListItemType.Navigation) {
			aDescribedBy.push(this.getAriaAnnouncement("navigation"));
		} else {
			if (sType == ListItemType.Detail || sType == ListItemType.DetailAndActive) {
				aDescribedBy.push(this.getAriaAnnouncement("detail"));
			}
			if (sType == ListItemType.Active || sType == ListItemType.DetailAndActive) {
				aDescribedBy.push(this.getAriaAnnouncement("active"));
			}
		}

		return aDescribedBy.join(" ");
	};

	/**
	 * Returns the accessibility state of the control
	 *
	 * @param {sap.ui.core.Control} oLI an object representation of the control
	 * @protected
	 */
	ListItemBaseRenderer.getAccessibilityState = function(oLI) {
		var sAriaLabelledBy = this.getAriaLabelledBy(oLI),
			sAriaDescribedBy = this.getAriaDescribedBy(oLI),
			mAccessibilityState = {
				role: this.getAriaRole(oLI)
			};

		if (oLI.isSelectable()) {
			mAccessibilityState.selected = oLI.getProperty("selected");
		}

		if (sAriaLabelledBy) {
			mAccessibilityState.labelledby = {
				value: sAriaLabelledBy.trim(),
				append: true
			};
		}

		if (sAriaDescribedBy) {
			mAccessibilityState.describedby = {
				value: sAriaDescribedBy.trim(),
				append: true
			};
		}

		return mAccessibilityState;
	};

	/**
	 * Hook for rendering list item contents
	 *
	 * @param {sap.ui.core.RenderManager} rm The RenderManager that can be used for writing to the Render-Output-Buffer.
	 * @param {sap.ui.core.Control} oLI an object representation of the control that should be rendered.
	 * @protected
	 */
	ListItemBaseRenderer.renderLIContent = function(rm, oLI) {
	};

	/**
	 * Hook for changing list item attributes
	 *
	 * @param {sap.ui.core.RenderManager} rm The RenderManager that can be used for writing to the Render-Output-Buffer.
	 * @param {sap.ui.core.Control} oLI an object representation of the control that should be rendered.
	 * @protected
	 */
	ListItemBaseRenderer.renderLIAttributes = function(rm, oLI) {
	};

	/**
	 * Renders the former part of the item.
	 *
	 * @param {sap.ui.core.RenderManager} rm The RenderManager that can be used for writing to the Render-Output-Buffer.
	 * @param {sap.ui.core.Control} oLI An object representation of the control that is rendered.
	 * @protected
	 */
	ListItemBaseRenderer.renderContentFormer = function(rm, oLI) {
		this.renderHighlight(rm, oLI);
		this.renderMode(rm, oLI, -1);
	};

	/**
	 * Renders the latter part of the item.
	 *
	 * @param {sap.ui.core.RenderManager} rm The RenderManager that can be used for writing to the Render-Output-Buffer.
	 * @param {sap.ui.core.Control} oLI An object representation of the control that is rendered.
	 * @protected
	 */
	ListItemBaseRenderer.renderContentLatter = function(rm, oLI) {
		this.renderCounter(rm, oLI);
		this.renderType(rm, oLI);
		this.renderMode(rm, oLI, 1);
		this.renderNavigated(rm, oLI);
	};

	ListItemBaseRenderer.renderLIContentWrapper = function(rm, oLI) {
		rm.openStart("div", oLI.getId() + "-content").class("sapMLIBContent").openEnd();
		this.renderLIContent(rm, oLI);
		rm.close("div");
	};

	ListItemBaseRenderer.renderNavigated = function(rm, oLI) {
		if (!oLI.getNavigated()) {
			return;
		}

		rm.openStart("div");
		rm.class("sapMLIBNavigated");
		rm.openEnd();
		rm.close("div");
	};

	/**
	 * Renders the HTML for the given control, using the provided.
	 *
	 * {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} rm The RenderManager that can be used for writing to the Render-Output-Buffer.
	 * @param {sap.ui.core.Control} oLI an object representation of the control that should be rendered.
	 * @public
	 */
	ListItemBaseRenderer.render = function(rm, oLI) {
		// render invisible placeholder
		if (!oLI.getVisible()) {
			this.renderInvisible(rm, oLI);
			return false;
		}

		// start
		this.openItemTag(rm, oLI);

		// classes
		rm.class("sapMLIB");
		rm.class("sapMLIB-CTX");
		rm.class("sapMLIBShowSeparator");
		rm.class("sapMLIBType" + oLI.getType());

		if (Device.system.desktop && oLI.isActionable()) {
			rm.class("sapMLIBActionable");
			rm.class("sapMLIBHoverable");
		}

		if (oLI.getSelected()) {
			rm.class("sapMLIBSelected");
		}

		if (oLI.getListProperty("showUnread") && oLI.getUnread()) {
			rm.class("sapMLIBUnread");
		}

		this.addFocusableClasses(rm, oLI);

		// attributes
		this.renderTooltip(rm, oLI);
		this.renderTabIndex(rm, oLI);

		// handle accessibility states
		if (Core.getConfiguration().getAccessibility()) {
			rm.accessibilityState(oLI, this.getAccessibilityState(oLI));
		}

		// item attributes hook
		this.renderLIAttributes(rm, oLI);

		rm.openEnd();

		this.renderContentFormer(rm, oLI);
		this.renderLIContentWrapper(rm, oLI);
		this.renderContentLatter(rm, oLI);

		this.closeItemTag(rm, oLI);
	};

	return ListItemBaseRenderer;

}, /* bExport= */ true);
