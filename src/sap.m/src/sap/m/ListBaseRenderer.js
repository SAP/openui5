/*!
 * ${copyright}
 */
sap.ui.define(["sap/m/library", "sap/ui/Device", "./ListItemBaseRenderer"],
	function(library, Device, ListItemBaseRenderer) {
	"use strict";


	// shortcut for sap.m.ListGrowingDirection
	var ListGrowingDirection = library.ListGrowingDirection;

	// shortcut for sap.m.ListKeyboardMode
	var ListKeyboardMode = library.ListKeyboardMode;

	// shortcut for sap.m.ToolbarDesign
	var ToolbarDesign = library.ToolbarDesign;


	/**
	 * ListBase renderer.
	 * @namespace
	 */
	var ListBaseRenderer = {};

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
	 * @param {sap.ui.core.RenderManager}
	 *          oRenderManager the RenderManager that can be used for writing to the
	 *          Render-Output-Buffer
	 * @param {sap.ui.core.Control}
	 *          oControl an object representation of the control that should be
	 *          rendered
	 */
	ListBaseRenderer.render = function(rm, oControl) {
		// container
		rm.write("<div");
		rm.addClass("sapMList");
		rm.writeControlData(oControl);

		if (oControl.getInset()) {
			rm.addClass("sapMListInsetBG");
		}
		if (oControl.getWidth()) {
			rm.addStyle("width", oControl.getWidth());
		}

		// background
		if (oControl.getBackgroundDesign) {
			rm.addClass("sapMListBG" + oControl.getBackgroundDesign());
		}

		// tooltip
		var sTooltip = oControl.getTooltip_AsString();
		if (sTooltip) {
			rm.writeAttributeEscaped("title", sTooltip);
		}

		// run hook method
		this.renderContainerAttributes(rm, oControl);

		rm.writeStyles();
		rm.writeClasses();
		rm.write(">");

		// render header
		var sHeaderText = oControl.getHeaderText();
		var oHeaderTBar = oControl.getHeaderToolbar();
		if (oHeaderTBar) {
			oHeaderTBar.setDesign(ToolbarDesign.Transparent, true);
			oHeaderTBar.addStyleClass("sapMListHdrTBar");
			oHeaderTBar.addStyleClass("sapMTBHeader-CTX");
			rm.renderControl(oHeaderTBar);
		} else if (sHeaderText) {
			rm.write("<header class='sapMListHdr'");
			rm.writeAttribute("id", oControl.getId("header"));
			rm.write(">");
			rm.writeEscaped(sHeaderText);
			rm.write("</header>");
		}

		// render info bar
		var oInfoTBar = oControl.getInfoToolbar();
		if (oInfoTBar) {
			oInfoTBar.setDesign(ToolbarDesign.Info, true);
			oInfoTBar.addStyleClass("sapMListInfoTBar");
			rm.renderControl(oInfoTBar);
		}

		// determine items rendering
		var aItems = oControl.getItems(),
			bShowNoData = oControl.getShowNoData(),
			bRenderItems = oControl.shouldRenderItems() && aItems.length,
			iTabIndex = oControl.getKeyboardMode() == ListKeyboardMode.Edit ? -1 : 0,
			bUpwardGrowing = oControl.getGrowingDirection() == ListGrowingDirection.Upwards && oControl.getGrowing();

		// render top growing
		if (bUpwardGrowing) {
			this.renderGrowing(rm, oControl);
		}

		// dummy keyboard handling area
		if (bRenderItems || bShowNoData) {
			this.renderDummyArea(rm, oControl, "before", -1);
		}

		// run hook method to start building list
		this.renderListStartAttributes(rm, oControl);

		// write accessibility state
		rm.writeAccessibilityState(oControl, this.getAccessibilityState(oControl));

		// list attributes
		rm.addClass("sapMListUl");
		if (oControl._iItemNeedsHighlight) {
			rm.addClass("sapMListHighlight");
		}

		rm.writeAttribute("id", oControl.getId("listUl"));
		if (bRenderItems || bShowNoData) {
			rm.writeAttribute("tabindex", iTabIndex);
		}

		// separators
		rm.addClass("sapMListShowSeparators" + oControl.getShowSeparators());

		// modes
		rm.addClass("sapMListMode" + oControl.getMode());

		// inset
		oControl.getInset() && rm.addClass("sapMListInset");

		// write inserted styles and classes
		rm.writeClasses();
		rm.writeStyles();
		rm.write(">");

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
		if (!bRenderItems && bShowNoData) {
			this.renderNoData(rm, oControl);
		}

		// run hook method to finish building list
		this.renderListEndAttributes(rm, oControl);

		// dummy keyboard handling area
		if (bRenderItems || bShowNoData) {
			this.renderDummyArea(rm, oControl, "after", iTabIndex);
		}

		// render bottom growing
		if (!bUpwardGrowing) {
			this.renderGrowing(rm, oControl);
		}

		// footer
		if (oControl.getFooterText()) {
			rm.write("<footer class='sapMListFtr'");
			rm.writeAttribute("id", oControl.getId("footer"));
			rm.write(">");
			rm.writeEscaped(oControl.getFooterText());
			rm.write("</footer>");
		}

		// done
		rm.write("</div>");
	};

	/**
	 * This hook method is called to render container attributes
	 *
	 * @param {sap.ui.core.RenderManager} rm the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.core.Control} oControl an object representation of the control that should be rendered
	 */
	ListBaseRenderer.renderContainerAttributes = function(rm, oControl) {
	};

	/**
	 * This hook method is called after <ul> and before first <li>
	 *
	 * @param {sap.ui.core.RenderManager} rm the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.core.Control} oControl an object representation of the control that should be rendered
	 */
	ListBaseRenderer.renderListHeadAttributes = function(rm, oControl) {
	};

	/**
	 * This hook method is called to render list tag
	 *
	 * @param {sap.ui.core.RenderManager} rm the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.core.Control} oControl an object representation of the control that should be rendered
	 */
	ListBaseRenderer.renderListStartAttributes = function(rm, oControl) {
		rm.write("<ul");
		oControl.addNavSection(oControl.getId("listUl"));
	};

	/**
	 * Returns aria accessibility role
	 *
	 * @param {sap.ui.core.Control} oControl an object representation of the control
	 * @returns {String}
	 */
	ListBaseRenderer.getAriaRole = function(oControl) {
		return "listbox";
	};

	/**
	 * Returns the inner aria labelledby ids for the accessibility
	 *
	 * @param {sap.ui.core.Control} oControl an object representation of the control
	 * @returns {String|undefined}
	 */
	ListBaseRenderer.getAriaLabelledBy = function(oControl) {
	};

	/**
	 * Returns the inner aria describedby ids for the accessibility
	 *
	 * @param {sap.ui.core.Control} oControl an object representation of the control
	 * @returns {String|undefined}
	 */
	ListBaseRenderer.getAriaDescribedBy = function(oControl) {
		if (oControl.getFooterText()) {
			return oControl.getId("footer");
		}
	};

	/**
	 * Returns the accessibility state of the control
	 *
	 * @param {sap.ui.core.Control} oControl an object representation of the control
	 */
	ListBaseRenderer.getAccessibilityState = function(oControl) {
		return {
			role : this.getAriaRole(oControl),
			multiselectable : oControl._bSelectionMode ? oControl.getMode() == "MultiSelect" : undefined,
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
	 * @param {sap.ui.core.Control} oControl an object representation of the control that should be rendered
	 */
	ListBaseRenderer.renderListEndAttributes = function(rm, oControl) {
		rm.write("</ul>");
	};

	/**
	 * This hook method is called to render no data field
	 *
	 * @param {sap.ui.core.RenderManager} rm the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.core.Control} oControl an object representation of the control that should be rendered
	 */
	ListBaseRenderer.renderNoData = function(rm, oControl) {
		rm.write("<li");
		rm.writeAttribute("tabindex", oControl.getKeyboardMode() == ListKeyboardMode.Navigation ? -1 : 0);
		rm.writeAttribute("id", oControl.getId("nodata"));
		rm.addClass("sapMLIB sapMListNoData sapMLIBTypeInactive");
		ListItemBaseRenderer.addFocusableClasses.call(ListItemBaseRenderer, rm);
		rm.writeClasses();
		rm.write(">");

		rm.write("<div");
		rm.addClass("sapMListNoDataText");
		rm.writeAttribute("id", oControl.getId("nodata-text"));
		rm.writeClasses();
		rm.write(">");
		rm.writeEscaped(oControl.getNoDataText(true));
		rm.write("</div>");

		rm.write("</li>");
	};


	ListBaseRenderer.renderDummyArea = function(rm, oControl, sAreaId, iTabIndex) {
		rm.write("<div");
		rm.writeAttribute("id", oControl.getId(sAreaId));
		rm.writeAttribute("tabindex", iTabIndex);

		if (Device.system.desktop) {
			rm.addClass("sapMListDummyArea").writeClasses();
		}

		rm.write("></div>");
	};

	ListBaseRenderer.renderGrowing = function(rm, oControl) {
		var oGrowingDelegate = oControl._oGrowingDelegate;
		if (!oGrowingDelegate) {
			return;
		}

		oGrowingDelegate.render(rm);
	};

	return ListBaseRenderer;

}, /* bExport= */ true);
