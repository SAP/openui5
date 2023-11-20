/*!
 * ${copyright}
 */
sap.ui.define(["sap/m/library", "sap/ui/core/library", "sap/ui/Device", "sap/ui/core/InvisibleText", "./ListItemBaseRenderer"],
	function(library, coreLibrary, Device, InvisibleText, ListItemBaseRenderer) {
	"use strict";


	// shortcut for sap.m.ListGrowingDirection
	var ListGrowingDirection = library.ListGrowingDirection;

	// shortcut for sap.m.ToolbarDesign
	var ToolbarDesign = library.ToolbarDesign;

	// shortcut for sap.ui.core.TitleLevel
	var TitleLevel = coreLibrary.TitleLevel;


	/**
	 * ListBase renderer.
	 * @namespace
	 */
	var ListBaseRenderer = {
		apiVersion: 2
	};

	/**
	 * Determines the order of the mode for the renderer
	 * -1 is for the beginning of the content
	 * +1 is for the end of the content
	 *  0 is to ignore this mode
	 * @static
	 */
	ListBaseRenderer.ModeOrder = {
		None : 0,
		Delete : 1,
		MultiSelect : -1,
		SingleSelect : 1,
		SingleSelectLeft : -1,
		SingleSelectMaster : 0
	};

	/**
	 * Renders the HTML for the given control, using the provided
	 * {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} rm
	 *          RenderManager that can be used to render the control's DOM
	 * @param {sap.m.ListBase} oControl
	 *          The list to be rendered
	 */
	ListBaseRenderer.render = function(rm, oControl) {
		// container
		rm.openStart("div", oControl);
		rm.class("sapMList");

		// inset
		if (oControl.getInset()) {
			rm.class("sapMListInsetBG");
		}

		// width
		rm.style("width", oControl.getWidth());

		// background
		if (oControl.getBackgroundDesign) {
			rm.class("sapMListBG" + oControl.getBackgroundDesign());
		}

		// tooltip
		var sTooltip = oControl.getTooltip_AsString();
		if (sTooltip) {
			rm.attr("title", sTooltip);
		}

		// add sticky style classes
		var iStickyValue = oControl.getStickyStyleValue();
		if (iStickyValue) {
			rm.class("sapMSticky");
			rm.class("sapMSticky" + iStickyValue);
		}

		// run hook method
		this.renderContainerAttributes(rm, oControl);

		// container
		rm.openEnd();

		// render message strip
		rm.renderControl(oControl.getAggregation("_messageStrip"));

		// render header
		var sHeaderText = oControl.getHeaderText();
		var oHeaderTBar = oControl.getHeaderToolbar();
		if (oHeaderTBar) {
			oHeaderTBar.setDesign(ToolbarDesign.Transparent, true);
			oHeaderTBar.addStyleClass("sapMListHdr");
			oHeaderTBar.addStyleClass("sapMListHdrTBar");
			oHeaderTBar.addStyleClass("sapMTBHeader-CTX");
			rm.renderControl(oHeaderTBar);
		} else if (sHeaderText) {
			rm.openStart("div", oControl.getId("header"));
			rm.attr("role", "heading");
			var sHeaderLevel = oControl.getHeaderLevel();
			if (sHeaderLevel != TitleLevel.Auto) {
				rm.attr("aria-level", sHeaderLevel[sHeaderLevel.length - 1]);
			}
			rm.class("sapMListHdr").class("sapMListHdrText").openEnd();
			rm.text(sHeaderText);
			rm.close("div");
		}

		// render info bar
		var oInfoTBar = oControl.getInfoToolbar();
		if (oInfoTBar) {
			oInfoTBar.setDesign(ToolbarDesign.Info, true);
			oInfoTBar.addStyleClass("sapMListInfoTBar");
			rm.openStart("div").class("sapMListInfoTBarContainer").openEnd();
			rm.renderControl(oInfoTBar);
			rm.close("div");
		}

		// determine items rendering
		var aItems = oControl.getItems(),
			bShowNoData = oControl.getShowNoData(),
			bRenderItems = oControl.shouldRenderItems() && aItems.length,
			bUpwardGrowing = oControl.getGrowingDirection() == ListGrowingDirection.Upwards && oControl.getGrowing();

		// render top growing
		if (bUpwardGrowing) {
			this.renderGrowing(rm, oControl);
		}

		// dummy keyboard handling area
		this.renderDummyArea(rm, oControl, "before", "-1");

		// run hook method to start building list
		this.renderListStartAttributes(rm, oControl);

		// list attributes
		rm.class("sapMListUl");
		if (oControl._iItemNeedsHighlight) {
			rm.class("sapMListHighlight");
		}

		if (bRenderItems || bShowNoData) {
			rm.attr("tabindex", "0");
		}

		// separators
		rm.class("sapMListShowSeparators" + oControl.getShowSeparators());

		// modes
		rm.class("sapMListMode" + oControl.getMode());

		// navigated indicator
		if (oControl._iItemNeedsNavigated) {
			rm.class("sapMListNavigated");
		}

		// list
		rm.openEnd();

		// run hook method to render list head attributes
		this.renderListHeadAttributes(rm, oControl);

		// render child controls
		if (bRenderItems) {
			if (bUpwardGrowing) {
				aItems.reverse();
			}

			for (var i = 0; i < aItems.length; i++) {
				rm.renderControl(aItems[i]);
			}
		}

		// render no-data if needed
		// when all the items in the List are hidden via visible="false", then show the noDataText?
		var bVisibleItems = oControl.getVisibleItems().length > 0;

		if (bShowNoData && (!bRenderItems || !bVisibleItems)) {
			this.renderNoData(rm, oControl);
		}

		// run hook method to finish building list
		this.renderListEndAttributes(rm, oControl);

		// dummy keyboard handling area
		this.renderDummyArea(rm, oControl, "after", "0");

		// render bottom growing
		if (!bUpwardGrowing) {
			this.renderGrowing(rm, oControl);
		}

		// footer
		if (oControl.getFooterText()) {
			rm.openStart("footer", oControl.getId("footer")).class("sapMListFtr").openEnd();
			rm.text(oControl.getFooterText());
			rm.close("footer");
		}

		// container
		rm.close("div");
	};

	/**
	 * This hook method is called to render container attributes
	 *
	 * @param {sap.ui.core.RenderManager} rm the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.m.ListBase} oControl an object representation of the control that should be rendered
	 */
	ListBaseRenderer.renderContainerAttributes = function(rm, oControl) {
	};

	/**
	 * This hook method is called after <ul> and before first <li>
	 *
	 * @param {sap.ui.core.RenderManager} rm the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.m.ListBase} oControl an object representation of the control that should be rendered
	 */
	ListBaseRenderer.renderListHeadAttributes = function(rm, oControl) {
	};

	/**
	 * This hook method is called to render list tag
	 *
	 * @param {sap.ui.core.RenderManager} rm the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.m.ListBase} oControl an object representation of the control that should be rendered
	 */
	ListBaseRenderer.renderListStartAttributes = function(rm, oControl) {
		rm.openStart("ul", oControl.getId("listUl"));
		rm.class("sapMListItems");
		oControl.addNavSection(oControl.getId("listUl"));

		// write accessibility state
		rm.accessibilityState(oControl, this.getAccessibilityState(oControl));
	};

	/**
	 * Returns aria accessibility role for the no data entry.
	 * @param {sap.m.ListBase} oControl the control instance
	 *
	 * @returns {string|null} the no data role attribute
	 */
	ListBaseRenderer.getNoDataAriaRole = function(oControl) {
		return null;
	};

	/**
	 * Returns the inner aria labelledby ids for the accessibility
	 *
	 * @param {sap.m.ListBase} oControl an object representation of the control
	 * @returns {string|undefined} header id
	 */
	ListBaseRenderer.getAriaLabelledBy = function(oControl) {
		var oHeaderTBar = oControl.getHeaderToolbar();
		if (oHeaderTBar) {
			var oTitle = oHeaderTBar.getTitleControl();
			if (oTitle) {
				var sTitleId = oTitle.getId();
				if (oControl.getAriaLabelledBy().indexOf(sTitleId) === -1) {
					return sTitleId;
				}
			}
		} else if (oControl.getHeaderText()) {
			return oControl.getId("header");
		}
	};

	/**
	 * Returns the inner aria describedby ids for the accessibility
	 *
	 * @param {sap.m.ListBase} oControl an object representation of the control
	 * @returns {string|undefined}
	 */
	ListBaseRenderer.getAriaDescribedBy = function(oControl) {
		if (oControl.getFooterText()) {
			return oControl.getId("footer");
		}
	};

	/**
	 * Returns the accessibility state of the control
	 *
	 * @param {sap.m.ListBase} oControl an object representation of the control
	 * @returns {object} the accessibility state object
	 */
	ListBaseRenderer.getAccessibilityState = function(oControl) {
		var sRole = oControl.getAriaRole();
		return {
			role : sRole,
			multiselectable : (sRole != "list" && oControl._bSelectionMode) ? oControl.getMode() == "MultiSelect" : undefined,
			labelledby : {
				value : this.getAriaLabelledBy(oControl),
				append : true
			},
			describedby : {
				value : this.getAriaDescribedBy(oControl),
				append : true
			}
		};
	};

	/**
	 * This hook method is called to finish list rendering
	 *
	 * @param {sap.ui.core.RenderManager} rm the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.m.ListBase} oControl an object representation of the control that should be rendered
	 */
	ListBaseRenderer.renderListEndAttributes = function(rm, oControl) {
		rm.close("ul");
	};

	/**
	 * This hook method is called to render no data field
	 *
	 * @param {sap.ui.core.RenderManager} rm the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.m.ListBase} oControl an object representation of the control that should be rendered
	 */
	ListBaseRenderer.renderNoData = function(rm, oControl) {
		rm.openStart("li", oControl.getId("nodata"));
		rm.attr("tabindex", "-1");
		var sAriaRole = this.getNoDataAriaRole(oControl);
		if (sAriaRole) {
			rm.attr("role", sAriaRole);
		}
		rm.class("sapMLIB").class("sapMListNoData").class("sapMLIBTypeInactive");
		ListItemBaseRenderer.addFocusableClasses.call(ListItemBaseRenderer, rm);
		rm.openEnd();

		rm.openStart("div", oControl.getId("nodata-text")).class("sapMListNoDataText");

		var vNoData = oControl.getNoData();
		if (vNoData && typeof vNoData !== "string") {
			rm.class("sapMListNoDataContent");
		}
		rm.openEnd();

		this.renderNoDataArea(rm, oControl);

		rm.close("div");
		rm.close("li");
	};

	ListBaseRenderer.renderNoDataArea = function (rm, oControl) {
		var vNoData = oControl.getNoData() || oControl.getNoDataText();
		if (typeof vNoData === "string") {
			rm.text(vNoData);
		} else {
			rm.renderControl(vNoData);
		}
	};

	ListBaseRenderer.renderDummyArea = function(rm, oControl, sAreaId, iTabIndex) {
		rm.openStart("div", oControl.getId(sAreaId)).attr("role", "none").attr("tabindex", iTabIndex); // role = none because focusable elements must have a role

		if (Device.system.desktop) {
			rm.class("sapMListDummyArea");
			if (sAreaId == "after") {
				rm.class("sapMListDummyAreaSticky");
			}
		}

		rm.openEnd().close("div");
	};

	ListBaseRenderer.renderGrowing = function(rm, oControl) {
		var oGrowingDelegate = oControl._oGrowingDelegate;
		if (oGrowingDelegate) {
			oGrowingDelegate.render(rm);
		}
	};

	/**
	 * Creates an invisible ARIA node for the given message bundle text
	 * in the static UIArea and returns its id for ARIA announcements.
	 *
	 * This method should be used when text is used frequently.
	 *
	 * @param {string} sBundleText bundle key of the announcement
	 * @returns {string} id of the generated invisible ARIA node
	 * @protected
	 */
	ListBaseRenderer.getAriaAnnouncement = function(sBundleText) {
		return InvisibleText.getStaticId("sap.m", sBundleText);
	};

	return ListBaseRenderer;

}, /* bExport= */ true);
