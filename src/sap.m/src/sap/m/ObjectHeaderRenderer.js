/*
 * @copyright
 */
sap.ui.define(['jquery.sap.global', 'sap/ui/core/IconPool'],
	function(jQuery, IconPool) {
	"use strict";


	/**
	 * ObjectHeader renderer.
	 * @namespace
	 */
	var ObjectHeaderRenderer = {};
	
	/**
	 * Check if the object exists. In case object has _isEmpty() method then this method is called. If there is no such method then object is not empty.
	 * 
	 * @param {sap.ui.core.Control}
	 *            oObject to be checked
	 * 
	 * @returns true is the object is not empty, false - otherwise.
	 * 
	 * @private
	 */
	ObjectHeaderRenderer._isEmptyObject = function(oObject) {
	
		if (!oObject) {
			return true;
		}
	
		if ((!oObject._isEmpty || !oObject._isEmpty()) && (!oObject.getVisible || oObject.getVisible())) {
			return false;
		}
		return true;
	};
	
	/**
	 * Array is considered empty if it is null or undefined or has no controls or all the controls are empty.
	 * 
	 * @param {sap.ui.core.Control[]}
	 *            aArray array of controls to be checked
	 * 
	 * @returns true if array is empty, false - otherwise.
	 * @private
	 */
	ObjectHeaderRenderer._isEmptyArray = function(aArray) {
	
		if (aArray) {
			for ( var i = 0; i < aArray.length; i++) {
				if (!ObjectHeaderRenderer._isEmptyObject(aArray[i])) {
					return false;
				}
			}
		}
		return true;
	};
	
	/**
	 * A row is considered empty if both input parameters are empty.
	 * 
	 * @param {sap.ui.core.Control}
	 *            aLeft control to be checked
	 * 
	 * @param {sap.ui.core.Control[]}
	 *            aRight array of controls to be checked
	 * 
	 * @returns true if array is empty, false - otherwise.
	 * @private
	 */
	ObjectHeaderRenderer._isEmptyRow = function(oLeft, aRight) {
	
		return ObjectHeaderRenderer._isEmptyObject(oLeft) && ObjectHeaderRenderer._isEmptyArray(aRight);
	};
	
	/**
	 * Render an array of controls.
	 * 
	 * @param {sap.ui.core.RenderManager}
	 *            rm the RenderManager that can be used for writing to the render output buffer
	 * 
	 * @param {sap.ui.core.Control[]}
	 *            aObjects array of controls to be rendered
	 * @private
	 */
	ObjectHeaderRenderer._renderObjects = function(rm, aObjects, oOH) {
	
		for ( var i = 0; i < aObjects.length; i++) {
			if (aObjects[i] instanceof sap.ui.core.Control) {
				this._renderChildControl(rm, oOH, aObjects[i]);
			}
		}
	};
	
	/**
	 * Returns the array of icons from ObjectHeader.
	 * 
	 * @param {sap.m.ObjectHeader}
	 *            oOH the ObjectHeader that contains icons
	 * 
	 * @returns array of {sap.m.Image} controls
	 * 
	 * @private
	 */
	ObjectHeaderRenderer._getIcons = function(oOH) {
	
		var icons = [];
	
		if (oOH.getShowMarkers()) {
			oOH._oFavIcon.setVisible(oOH.getMarkFavorite());
			oOH._oFlagIcon.setVisible(oOH.getMarkFlagged());
	
			icons.push(oOH._oPlaceholderIcon);
			icons.push(oOH._oFavIcon);
			icons.push(oOH._oFlagIcon);
		}
	
		return icons;
	};
	
	
	
	
	/**
	 * Renders the HTML for Attribute.
	 * 
	 * @param {sap.ui.core.RenderManager}
	 *            rm the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.m.ObjectHeader}
	 *            oOH an object to be rendered
	 * @param {sap.m.ObjectAttribute}
	 *            oAttr an attribute to be rendered
	 * @param {boolean} bFullWidth set the attribute width to 100%
	 */
	ObjectHeaderRenderer.renderAttribute = function(rm, oOH, oAttr, bFullWidth) {
		rm.write("<div");
		rm.addClass("sapMOHAttr");
		rm.writeClasses();
		if (bFullWidth) {
			rm.addStyle("width", "100%");
			rm.writeStyles();
		}
		rm.write(">");
		this._renderChildControl(rm, oOH, oAttr);
		rm.write("</div>");
	};
	
	/**
	 * Renders the HTML for single line of Attribute and Status.
	 * 
	 * @param {sap.ui.core.RenderManager}
	 *            rm the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.m.ObjectHeader}
	 *            oOH an object to be rendered
	 * @param {sap.m.ObjectAttribute}
	 *            oLeft an attribute to be rendered
	 * @param {sap.ui.core.Control[]} aRight a status or Progress Indicator Array to be rendered
	 */
	ObjectHeaderRenderer.renderRow = function(rm, oOH, oLeft, aRight) {
	
		if (ObjectHeaderRenderer._isEmptyRow(oLeft, aRight)) {
			return; // nothing to render
		}
	
		rm.write("<div"); // Start attribute row container
		rm.addClass("sapMOHAttrRow");
		rm.writeClasses();
		rm.write(">");
	
		if (!ObjectHeaderRenderer._isEmptyObject(oLeft)) {
			this.renderAttribute(rm, oOH, oLeft, ObjectHeaderRenderer._isEmptyArray(aRight));
		} else if (ObjectHeaderRenderer._isEmptyObject(oLeft) && !ObjectHeaderRenderer._isEmptyArray(aRight)) {
			if (aRight[0] instanceof sap.m.ProgressIndicator) {
				rm.write("<div");
				rm.addClass("sapMOHAttr");
				rm.writeClasses();
				rm.write(">");
				rm.write("</div>");
			}
		}
	
		if (!ObjectHeaderRenderer._isEmptyArray(aRight)) {
			rm.write("<div");
			if (aRight[0] instanceof sap.m.ProgressIndicator) {
				rm.addClass("sapMOHStatusFixedWidth");
			}
			else if (aRight[0] instanceof sap.ui.core.Icon) {
				rm.addClass("sapMOHStatusFixedWidth");
				rm.addClass("sapMObjStatusMarker");
			} else {
				rm.addClass("sapMOHStatus");
			}
			rm.writeClasses();
			rm.write(">");
			ObjectHeaderRenderer._renderObjects(rm, aRight, oOH);
			rm.write("</div>");
		}
	
		rm.write("</div>"); // Start attribute row container
	};
	
	/**
	 * Renders the HTML for attributes and statuses, using the provided {@link sap.ui.core.RenderManager}. Validate the statuses control list to only display ObjectStatus and
	 * ProgressIndicator
	 * 
	 * @param {sap.ui.core.RenderManager}
	 *            rm the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.m.ObjectHeader}
	 *            oOH an object to be rendered
	 */
	ObjectHeaderRenderer.renderAttributesAndStatuses = function(rm, oOH) {
	
		var aAttribs = oOH.getAttributes();
		var aVisibleAttribs = [];
	
		for (var i = 0; i < aAttribs.length; i ++) {
			if (aAttribs[i].getVisible()) {
				aVisibleAttribs.push(aAttribs[i]);
			}
		}
	
		var iAttribsLength = aVisibleAttribs.length;
	
		var aIconsAndStatuses = [];
		var aIcons = ObjectHeaderRenderer._getIcons(oOH);
		// flag and favorite are not rendered here in responsive mode
		if (!oOH.getResponsive() && !ObjectHeaderRenderer._isEmptyArray(aIcons)) {
			aIconsAndStatuses.push(aIcons);
		}
	
		if (oOH.getFirstStatus()) {
			aIconsAndStatuses.push([ oOH.getFirstStatus() ]);
		}
		if (oOH.getSecondStatus()) {
			aIconsAndStatuses.push([ oOH.getSecondStatus() ]);
		}
		if (oOH.getStatuses()) {
			var aStatuses = oOH.getStatuses();
			for (var i = 0; i < aStatuses.length; i++) {
				if (!aStatuses[i].getVisible || aStatuses[i].getVisible()) {
					if (aStatuses[i] instanceof sap.m.ObjectStatus || aStatuses[i] instanceof sap.m.ProgressIndicator) {
						aIconsAndStatuses.push([aStatuses[i]]);
					} else {
						jQuery.sap.log.warning("Only sap.m.ObjectStatus or sap.m.ProgressIndicator are allowed in \"sap.m.ObjectHeader.statuses\" aggregation." + " Current object is "
								+ aStatuses[i].constructor.getMetadata().getName() + " with id \"" + aStatuses[i].getId() + "\"");
					}
				}
			}
		}
	
		var iIconsAndStatusesLength = aIconsAndStatuses.length;
	
		var iNoOfRows = iAttribsLength > iIconsAndStatusesLength ? iAttribsLength : iIconsAndStatusesLength;
	
		if (oOH.getResponsive()) {
			this.renderRowResponsive(rm, oOH, aVisibleAttribs, aIconsAndStatuses);
		} else {
			for (var i = 0; i < iNoOfRows; i++) {
				this.renderRow(rm, oOH, aVisibleAttribs[i], aIconsAndStatuses[i]);
			}
		}
		
	};
	
	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 * 
	 * @param {sap.ui.core.RenderManager}
	 *            rm the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.m.Control}
	 *            oOH an object representation of the control that should be rendered
	 */
	ObjectHeaderRenderer.renderNumber = function(rm, oOH) {
		if (oOH.getNumber()) {
			// Container for a number and a units qualifier.
			rm.write("<div"); // Start Number/units container
			rm.writeAttribute("id", oOH.getId() + "-numberdiv");
			rm.addClass("sapMOHNumberDiv");
			rm.writeClasses();
			rm.write(">");
	
			rm.write("<span");
			rm.writeAttribute("id", oOH.getId() + "-number");
			rm.addClass("sapMOHNumber");
			rm.addClass("sapMOHNumberState" + oOH.getNumberState());
	
			rm.writeClasses();
			rm.write(">");
			rm.writeEscaped(oOH.getNumber());
	
			rm.write("</span>");
	
			if (oOH.getNumberUnit()) {
				rm.write("<span");
				rm.writeAttribute("id", oOH.getId() + "-numberUnit");
				rm.addClass("sapMOHNumberUnit");
				rm.addClass("sapMOHNumberState" + oOH.getNumberState());
				
				rm.writeClasses();
				rm.write(">");
				rm.writeEscaped(oOH.getNumberUnit());
				rm.write("</span>");
			}
	
			rm.write("</div>"); // End Number/units container
		}
	};
	
	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 * 
	 * @param {sap.ui.core.RenderManager}
	 *            rm the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.m.Control}
	 *            oOH an object representation of the control that should be rendered
	 */
	ObjectHeaderRenderer.renderTitle = function(rm, oOH) {
		// Start title text and title arrow container
		oOH._oTitleArrowIcon.setVisible(oOH.getShowTitleSelector());
		if (oOH.getShowTitleSelector() && oOH._oTitleArrowIcon.getVisible()) {
			rm.write("<div");
			rm.addClass("sapMOHTitleAndArrow");
			rm.writeClasses();
			rm.write(">");
		}
	
		if (oOH.getTitle()) {
			oOH._titleText.setText(oOH.getTitle());
			rm.write("<span"); // Start Title Text container
			rm.writeAttribute("id", oOH.getId() + "-title");
			rm.addClass("sapMOHTitle");
			if (oOH.getTitleActive()) {
				rm.writeAttribute("tabindex", "0");
				rm.addClass("sapMOHTitleActive");
			}
			if (oOH.getShowTitleSelector()) {
				rm.addClass("sapMOHTitleFollowArrow");
			}
			rm.writeClasses();
			rm.write(">");
			// TODO: why is sapMOHTitle added here and to parent??? remove one
			if (!oOH.getResponsive()) {
				oOH._titleText.addStyleClass("sapMOHTitle");
			}
	
			this._renderChildControl(rm, oOH, oOH._titleText);
			rm.write("</span>"); // End Title Text container
		}
	
		if (oOH.getShowTitleSelector()) {
			rm.write("<span"); // Start title arrow container
			rm.addClass("sapMOHTitleArrow");
			rm.writeClasses();
			rm.write(">");
			this._renderChildControl(rm, oOH, oOH._oTitleArrowIcon);
			rm.write("</span>"); // end title arrow container
		}
	
		if (oOH.getShowTitleSelector() && oOH._oTitleArrowIcon.getVisible()) {
			rm.write("</div>"); // end title text and title arrow container
		}
	};
	
	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 * 
	 * @param {sap.ui.core.RenderManager}
	 *            rm the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.m.Control}
	 *            oOH an object representation of the control that should be rendered
	 */
	ObjectHeaderRenderer.renderFullTitle = function(rm, oOH) {
		if (!oOH.getNumber()) {
			rm.addClass("sapMOHTitleDivFull");
		}
	};
	
	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 * 
	 * @param {sap.ui.core.RenderManager}
	 *            rm the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.m.Control}
	 *            oOH an object representation of the control that should be rendered
	 */
	ObjectHeaderRenderer.renderFullOH = function(rm, oOH) {
		// Introductory text at the top of the item, like "On behalf of Julie..."
		if (oOH.getIntro()) {
			rm.write("<div");
			rm.addClass("sapMOHIntro");
			if (oOH.getIntroActive()) {
				rm.addClass("sapMOHIntroActive");
			}
			rm.writeClasses();
			rm.write(">");
			rm.write("<span");
			rm.writeAttribute("id", oOH.getId() + "-intro");
			if (oOH.getIntroActive()) {
				rm.writeAttribute("tabindex", "0");
			}
			rm.write(">");
			rm.writeEscaped(oOH.getIntro());
			rm.write("</span>");
			rm.write("</div>");
		}
	
		// Container for fields placed on the top half of the item, below the intro. This
		// includes title icon, title, title arrow, number, and number units.
		rm.write("<div"); // Start Top row container
		rm.addClass("sapMOHTopRow");
		rm.writeClasses();
		rm.write(">");
	
		// Title container displayed to the left of the number and number units container.
		rm.write("<div"); // Start Title container
		rm.writeAttribute("id", oOH.getId() + "-titlediv");
		rm.addClass("sapMOHTitleDiv");
		if (oOH._hasIcon()) {
			rm.addClass("sapMOHTitleIcon");
		}
		
		this.renderFullTitle(rm, oOH);
		rm.writeClasses();
		rm.write(">");
	
		// Container for icon
		if (oOH._hasIcon()) {
			rm.write("<div"); // Start icon container
			rm.addClass("sapMOHIcon");
			if (oOH.getIconActive()) {
				rm.writeAttribute("tabindex", "0");
				rm.addClass("sapMPointer");
			}
			rm.writeClasses();
			rm.write(">");
			this._renderChildControl(rm, oOH, oOH._getImageControl());
			rm.write("</div>"); // end icon container
		}
		
		this.renderTitle(rm, oOH);
		
		rm.write("</div>"); // End Title container
	
		this.renderNumber(rm, oOH);
		
		rm.write("<div class=\"sapMOHDivider\"/>");
		rm.write("</div>"); // End Top row container
	
		if (oOH._hasBottomContent()) {
			rm.write("<div"); // Start Bottom row container
			rm.addClass("sapMOHBottomRow");
			rm.writeClasses();
			rm.write(">");
	
			this.renderAttributesAndStatuses(rm, oOH);
	
			rm.write("<div class=\"sapMOHDivider\"/>");
			rm.write("</div>"); // End Bottom row container
		}
	};
	
	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 * 
	 * @param {sap.ui.core.RenderManager}
	 *            rm the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.m.Control}
	 *            oOH an object representation of the control that should be rendered
	 */
	ObjectHeaderRenderer.renderCondensedOH = function(rm, oOH) {
		// Title container displayed to the left of the number and number units container.
		rm.write("<div"); // Start Title container
		rm.writeAttribute("id", oOH.getId() + "-titlediv");
		rm.addClass("sapMOHTitleDiv");
		
		this.renderFullTitle(rm, oOH);
	
		rm.writeClasses();
		rm.write(">");
		
		this.renderTitle(rm, oOH);
	
		rm.write("</div>"); // End Title container
	
		this.renderNumber(rm, oOH);
		
		var oFirstAttr = oOH.getAttributes()[0];
	
		if (oFirstAttr && !oFirstAttr._isEmpty()) {
			this.renderAttribute(rm, oOH, oFirstAttr);
		}
	};
	
	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 * 
	 * @param {sap.ui.core.RenderManager}
	 *            rm the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.m.Control}
	 *            oOH an object representation of the control that should be rendered
	 */
	ObjectHeaderRenderer.render = function(rm, oOH) {
		
		this._computeChildControlsToBeRendered(oOH);
		
		// return immediately if control is invisible
		if (!oOH.getVisible()) {
			this._cleanupNotRenderedChildControls(rm, oOH);
			return;
		}
	
		// responsive prototype
		if (oOH.getResponsive()) {
			this.renderResponsive(rm, oOH);
			this._cleanupNotRenderedChildControls(rm, oOH);
			return;
		}
	
		// === old renderer, no changes here for downwards compatibility
	
		var bCondensed = oOH.getCondensed();
		
		rm.write("<div"); // Start Main container
		rm.writeControlData(oOH);
		rm.addClass("sapMOH");
		if (bCondensed) {
			rm.addClass("sapMOHC");
			rm.addClass("sapMOHBg" + oOH.getBackgroundDesign());
		}
		
		rm.writeClasses();
		var sTooltip = oOH.getTooltip_AsString();
		if (sTooltip) {
			rm.writeAttributeEscaped("title", sTooltip);
		}
	
		rm.write(">");
	
		if (bCondensed) {
			this.renderCondensedOH(rm, oOH);
		} else {
			this.renderFullOH(rm, oOH);
		}
		
		rm.write("<div class=\"sapMOHLastDivider\"/>");
	
		rm.write("</div>"); // End Main container\
		
		this._cleanupNotRenderedChildControls(rm, oOH);
	};
	
	/**** responsive rendering start (barely any methods from above are used in this part to not break old UIs, it replaces most parts of renderer) ****/
	
	ObjectHeaderRenderer.renderResponsive = function(oRm, oControl) {
		var bCondensed,
			bTitle = true, // TODO: determine whether title 
			bMarkers = this.hasResponsiveMarkers(oControl),
			bStates = this.hasResponsiveStates(oControl), // TODO: determine whether states need to be rendered or not
			bTabs = this.hasResponsiveTabs(oControl),
			oHeaderContainer = oControl.getHeaderContainer(),
			// this is a switch for android < 4.4 special case in CSS
			bSupportCalc = !(sap.ui.Device.os.name === "Android" && sap.ui.Device.os.version < 4.4 && sap.ui.Device.browser.name === "an" && sap.ui.Device.browser.version < 4.4);
	
		// do not render if control is invisible
		if (!oControl.getVisible()) {
			return;
		}
	
		// initialization
		bCondensed = oControl.getCondensed();
	
		// start outer div (containing ObjectHeader and IconTabBar content div)
		oRm.write('<div class="sapMOHROuter"');
		oRm.writeControlData(oControl);
		oRm.write(">");
	
		// start object wrapper div (containing the sections title, stats, tabs, markers)
		oRm.write("<div");
		oRm.addClass("sapMOH");
		oRm.addClass("sapMOHR"); // this will allow to make a distinction for responsiveness in CSS
		if (!bSupportCalc) {
			oRm.addClass("sapMOHNoCalc");
		}
	
		if (oControl.getHeaderContainer() instanceof sap.m.IconTabBar) {
			oRm.addClass("sapMOHWithITB");
		}
		oRm.addClass("sapMOHBg" + oControl.getBackgroundDesign());
		if (bCondensed) {
			oRm.addClass("sapMOHC");
		}
	
		if (oControl._iCountVisAttrStat <= 2) {
			oRm.addClass("sapMOHStatesTwoOrLess");
		} else if (oControl._iCountVisAttrStat <= 4) {
			oRm.addClass("sapMOHStatesThreeOrFour");
		} else {
			oRm.addClass("sapMOHStatesFiveOrMore");
		}
	
		if (!bMarkers) {
			oRm.addClass("sapMOHNoMarkers");
		}
		if (!bTabs) {
			oRm.addClass("sapMOHNoTabs");
		}
		if (oControl._iCountVisTabs > 7) {
			oRm.addClass("sapMOHTabsMoreThanSeven");
		}
	
		oRm.writeClasses();
	
		// write tooltip
		var sTooltip = oControl.getTooltip_AsString();
		if (sTooltip) {
			oRm.writeAttributeEscaped("title", sTooltip);
		}
		oRm.write(">");
	
		if (bMarkers) {
			this.renderResponsiveMarkers(oRm, oControl, bTitle, bMarkers, bStates, bTabs);
		}
		this.renderResponsiveTitle(oRm, oControl, bTitle, bMarkers, bStates, bTabs);
		if (bStates) {
			this.renderResponsiveStates(oRm, oControl, bTitle, bMarkers, bStates, bTabs);
		}
		if (bTabs) {
			this.renderResponsiveTabs(oRm, oControl, bTitle, bMarkers, bStates, bTabs);
		}
	
		// end wrapper div
		oRm.write("</div>");
	
		// render the IconTabBar content section after the object header div
		if (oHeaderContainer && oHeaderContainer instanceof sap.m.IconTabBar) {
			this._renderChildControl(oRm, oControl, oHeaderContainer);
		}
	
		// end outer div
		oRm.write("</div>");
	};
	
	// first building block for the responsive header, it contains
	// - intro
	// - image
	// - title
	// - number and unit
	ObjectHeaderRenderer.renderResponsiveTitle = function(oRm, oControl, bTitle, bMarkers, bStates, bTabs) {
		// Title container displayed to the left of the number and number units container.
		oRm.write("<div"); // Start Title container
		oRm.writeAttribute("id", oControl.getId() + "-titlediv");
		oRm.addClass("sapMOHTitleDiv");
		if (!bTabs) {
			oRm.addClass("sapMOHTitleDivNoTabs");
		}
		if (!bStates) {
			oRm.addClass("sapMOHTitleDivNoStates");
		}
		if (oControl._hasIcon()) {
			oRm.addClass("sapMOHTitleIcon");
		}
		if (!oControl.getNumber()) {
			oRm.addClass("sapMOHTitleDivFull");
		}
		oRm.writeClasses();
		oRm.write(">");
	
		if (!oControl.getNumber()) {
			oRm.addClass("sapMOHTitleDivFull");
		}
	
		// TODO: put this in behaviour
		oControl._titleText.setMaxLines(2);
	
		this.renderTitleResponsive(oRm, oControl);
	
		// render the title icon in a separate container
		if (oControl._hasIcon()) {
			oRm.write("<div");
			oRm.addClass("sapMOHIcon");
			if (oControl.getIconActive()) {
				oRm.addClass("sapMPointer");
			}
			oRm.writeClasses();
			oRm.write(">");
			this._renderChildControl(oRm, oControl, oControl._getImageControl());
			oRm.write("</div>"); // end icon container
		}
	
		this.renderResponsiveNumber(oRm, oControl);
	
		oRm.write("</div>"); // End Title container
	};
	
	// helper function to determine wheter markers need to be rendered or not
	// TODO: put this in control
	ObjectHeaderRenderer.hasResponsiveMarkers = function (oControl) {
		return (oControl.getShowMarkers() && (oControl.getMarkFavorite() || oControl.getMarkFlagged()));
	};
		
	// render flag and favorite icon with float right (in wrapper div)
	ObjectHeaderRenderer.renderResponsiveMarkers = function(oRm, oControl) {
		var aIcons = [],
			i = 0;
	
		// load icons based on control state
		if (oControl.getShowMarkers()) {
			oControl._oFavIcon.setVisible(oControl.getMarkFavorite());
			oControl._oFlagIcon.setVisible(oControl.getMarkFlagged());
			// TODO: check if placeholder can be safely removed now (see comment in behaviour) 
			//aIcons.push(oControl._oPlaceholderIcon);
			aIcons.push(oControl._oFavIcon);
			aIcons.push(oControl._oFlagIcon);
	
			// render icons
			oRm.write("<div class=\"sapMObjStatusMarker\">");
			for (; i < aIcons.length; i++) {
				this._renderChildControl(oRm, oControl, aIcons[i]);
			}
			oRm.write("</div>");
		}
	};
	
	ObjectHeaderRenderer.renderResponsiveNumber = function(oRm, oControl) {
		var oObjectNumber = oControl.getAggregation("_objectNumber");
		if (oObjectNumber && oObjectNumber.getNumber()) {
			oObjectNumber.toggleStyleClass("sapMObjectNumberFull", !oControl.getTitle());
			this._renderChildControl(oRm, oControl, oObjectNumber);
		}
	};
	
	//helper function to determine wheter states need to be rendered or not
	//TODO: put this in control and make it nicer (it is too conplex, copied logic from above)
	ObjectHeaderRenderer.hasResponsiveStates = function (oControl) {
		var aAttribs = oControl.getAttributes();
		var aVisibleAttribs = [];
	
		if (!(oControl._hasAttributes() || oControl._hasStatus())) {
			oControl._iCountVisAttrStat = 0;
			return false;
		}
	
		for ( var i = 0; i < aAttribs.length; i ++) {
			if (aAttribs[i].getVisible()) {
				aVisibleAttribs.push(aAttribs[i]);
			}
		}
	
		var aIconsAndStatuses = [];
		var aIcons = ObjectHeaderRenderer._getIcons(oControl);
		// flag and favorite are not rendered here in responsive mode
		if (!oControl.getResponsive() && !ObjectHeaderRenderer._isEmptyArray(aIcons)) {
			aIconsAndStatuses.push(aIcons);
		}
	
		if (oControl.getFirstStatus() && oControl.getFirstStatus().getVisible()) {
			aIconsAndStatuses.push([ oControl.getFirstStatus() ]);
		}
		if (oControl.getSecondStatus() && oControl.getSecondStatus().getVisible()) {
			aIconsAndStatuses.push([ oControl.getSecondStatus() ]);
		}
		var aStatuses = oControl.getStatuses();
		for (var i = 0; i < aStatuses.length; i++) {
			if (!aStatuses[i].getVisible || aStatuses[i].getVisible()) {
				if (aStatuses[i] instanceof sap.m.ObjectStatus || aStatuses[i] instanceof sap.m.ProgressIndicator) {
					aIconsAndStatuses.push([ aStatuses[i] ]);
				} else {
					jQuery.sap.log.warning("Only sap.m.ObjectStatus or sap.m.ProgressIndicator are allowed in \"sap.m.ObjectHeader.statuses\" aggregation." + " Current object is "
							+ aStatuses[i].constructor.getMetadata().getName() + " with id \"" + aStatuses[i].getId() + "\"");
				}
			}
		}
	
		//this value needs to be adapted when an attribute or status is set to visible(false) after rendering
		oControl._iCountVisAttrStat = aVisibleAttribs.length + aIconsAndStatuses.length;
	
		return !!(aVisibleAttribs.length + aIconsAndStatuses.length);
	};
	
	ObjectHeaderRenderer.renderResponsiveStates = function(oRm, oControl, bTitle, bMarkers, bStates, bTabs) {
		oRm.write("<div");
		oRm.addClass("sapMOHStates");
	//	if (oControl._iCountVisAttrStat <= 2) {
	//		oRm.addClass("sapMOHStatesTwoOrLess");
	//	} else if (oControl._iCountVisAttrStat <= 4) {
	//		oRm.addClass("sapMOHStatesThreeOrFour");
	//	} else {
	//		oRm.addClass("sapMOHStatesFiveOrMore");
	//	}
		if (!bTabs) {
			oRm.addClass("sapMOHStatesNoTabs");
		}
		oRm.writeClasses();
		oRm.write("\">");
	
		//oRm.write("<div class=\"sapMOHStates" + (oControl._iCountVisAttrStat <= 2 ? " sapMOHStatesTwoOrLess" : " sapMOHStatesThreeOrMore") + (!bTabs ? " sapMOHStatesNoTabs" : "") + "\">");
		this.renderAttributesAndStatuses(oRm, oControl);
		oRm.write("</div>");
	};
	
	// helper function to determine whether tabs need to be rendered or not
	// TODO: put this in control
	ObjectHeaderRenderer.hasResponsiveTabs = function (oControl) {
		var oHeaderContainer = oControl.getHeaderContainer(),
			oIconTabHeader;
	
		if (oHeaderContainer) {
			if (oHeaderContainer instanceof sap.m.IconTabBar) {
				oIconTabHeader = oHeaderContainer._getIconTabHeader();
				if (oIconTabHeader.getVisible()) {
					oControl._iCountVisTabs = oIconTabHeader.getItems().length;
					return !!oIconTabHeader.getItems().length;
				}
			} else if (sap.suite && sap.suite.ui && sap.suite.ui.commons && oHeaderContainer instanceof sap.suite.ui.commons.HeaderContainer) {
				return !!oHeaderContainer.getItems().length;
			}
		}
		return false;
	};
	
	ObjectHeaderRenderer.renderResponsiveTabs = function(oRm, oControl, bTitle, bMarkers, bStates, bTabs) {
		var oHeaderContainer = oControl.getHeaderContainer(),
			oIconTabHeader;
	
		oRm.write("<div class=\"sapMOHTabs" + (oHeaderContainer instanceof sap.m.IconTabBar ? " sapmMOHTabsITB" : "") + (!bStates ? " sapMOHTabsNoStates" : "") + "\">");
		if (oHeaderContainer) {
			if (oHeaderContainer instanceof sap.m.IconTabBar) {
				// TODO: use a public function
				oIconTabHeader = oHeaderContainer._getIconTabHeader();
				this._renderChildControl(oRm, oControl, oIconTabHeader);
				// tell iconTabBar to not render the header
				oHeaderContainer._bHideHeader = true;
			} else if (sap.suite && sap.suite.ui && sap.suite.ui.commons && oHeaderContainer instanceof sap.suite.ui.commons.HeaderContainer) {
				// render the header container
				this._renderChildControl(oRm, oControl, oHeaderContainer);
			} else {
				jQuery.sap.log.warning("The control " + oHeaderContainer + " is not supported for aggregation \"headerContainer\"");
			}
		}
		oRm.write("</div>");
	};
	
	ObjectHeaderRenderer.renderRowResponsive = function(rm, oOH, aVisibleAttribs, aIconsAndStatuses) {
		var aVisibleAttrAndStat = aVisibleAttribs.concat(aIconsAndStatuses),
			iCountVisibleAttr = aVisibleAttribs.length,
			iCountAttrAndStat = aVisibleAttrAndStat.length;
	
		if (iCountAttrAndStat === 0) {
			return; //nothing to render
		}
	
		rm.write("<div"); // Start first container
		rm.addClass("sapMOHStatesFirstCont");
		rm.writeClasses();
		rm.write(">");
	
		//render first attr
		if (iCountVisibleAttr >= 1) {
			this.renderAttribute(rm, oOH, aVisibleAttrAndStat[0]);
		} else {
			this.renderStatus(rm, oOH, aVisibleAttrAndStat[0]);
		}
	
		if (iCountAttrAndStat >= 2) {
			//render second attr
			if (iCountVisibleAttr >= 2) {
				this.renderAttribute(rm, oOH, aVisibleAttrAndStat[1]);
			} else {
				this.renderStatus(rm, oOH, aVisibleAttrAndStat[1]);
			}
		}
		var i = 2;
		if (iCountAttrAndStat > 4) {
			for (; i < iCountAttrAndStat / 2; i++) {
				if (iCountVisibleAttr > i) {
					this.renderAttribute(rm, oOH, aVisibleAttrAndStat[i]);
				} else {
					this.renderStatus(rm, oOH, aVisibleAttrAndStat[i]);
				}
			}
		}
	
		rm.write("</div>"); //close first container
		
		if (iCountAttrAndStat === 2) {
			//no more attr and stat to render
			//add class sapMOHStates das nur zwei Attribute vorhanden
			return;
		}
	
		rm.write("<div"); // Start second container
		rm.addClass("sapMOHStatesSecondCont");
		rm.writeClasses();
		rm.write(">");
	
		//render all remaining attr
		for (; i < iCountAttrAndStat; i++) {
			//render attr[i]
			if (iCountVisibleAttr > i) {
				this.renderAttribute(rm, oOH, aVisibleAttrAndStat[i]);
			} else {
				this.renderStatus(rm, oOH, aVisibleAttrAndStat[i]);
			}
		}
	
		rm.write("</div>"); //close second container
	};
	
	ObjectHeaderRenderer.renderStatus = function(rm, oOH, oStatus, bFullWidth) {
		rm.write("<div");
		rm.addClass("sapMOHStatus");
		rm.writeClasses();
		if (bFullWidth) {
			rm.addStyle("width", "100%");
			rm.writeStyles();
		}
		rm.write(">");
		this._renderChildControl(rm, oOH, oStatus[0]);
		rm.write("</div>");
	};
	
	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 * 
	 * @param {sap.ui.core.RenderManager}
	 *            rm the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.m.Control}
	 *            oOH an object representation of the control that should be rendered
	 */
	ObjectHeaderRenderer.renderTitleResponsive = function(oRm, oOH) {
		// Start title text and title arrow container
		oOH._oTitleArrowIcon.setVisible(oOH.getShowTitleSelector());
		if (oOH.getShowTitleSelector() && oOH._oTitleArrowIcon.getVisible()) {
			oRm.write("<div");
			oRm.addClass("sapMOHTitleAndArrow");
			oRm.writeClasses();
			oRm.write(">");
		}
	
		if (oOH.getTitle()) {
			oOH._titleText.setText(oOH.getTitle());
			oRm.write("<div"); // Start Title Text container
			oRm.writeAttribute("id", oOH.getId() + "-title");
			oRm.addClass("sapMOHTitle");
			// CSN# 1385618/2014: title should not break: remove when a better solution is found
			oRm.addClass("sapMOHRTitleNoWordBreak");
	
			if (oOH.getTitleActive()) {
				oRm.addClass("sapMOHTitleActive");
			}
			if (oOH.getShowTitleSelector()) {
				oRm.addClass("sapMOHTitleFollowArrow");
			}
			oRm.writeClasses();
			oRm.write(">");
			// TODO: why is sapMOHTitle added here and to parent??? remove one
			if (!oOH.getResponsive()) {
				oOH._titleText.addStyleClass("sapMOHTitle");
			}
	
			this._renderChildControl(oRm, oOH, oOH._titleText);
	
			if (oOH.getShowTitleSelector()) {
				oRm.write("<span"); // Start title arrow container
				oRm.addClass("sapMOHTitleArrow");
				oRm.writeClasses();
				oRm.write(">");
				this._renderChildControl(oRm, oOH, oOH._oTitleArrowIcon);
				oRm.write("</span>"); // end title arrow container
			}
	
			// Introductory text at the top of the item, like "On behalf of Julie..."
			if (oOH.getIntro()) {
				oRm.write("<div");
				oRm.addClass("sapMOHIntro");
				if (oOH.getIntroActive()) {
					oRm.addClass("sapMOHIntroActive");
				}
				oRm.writeClasses();
				oRm.write(">");
				oRm.write("<span");
				oRm.writeAttribute("id", oOH.getId() + "-intro");
				oRm.write(">");
				oRm.writeEscaped(oOH.getIntro());
				oRm.write("</span>");
				oRm.write("</div>");
			}
	
			oRm.write("</div>"); // End Title Text container
		}
	
		if (oOH.getShowTitleSelector() && oOH._oTitleArrowIcon.getVisible()) {
			oRm.write("</div>"); // end title text and title arrow container
		}
	};
	
	/**** responsive rendering end ****/
	
	ObjectHeaderRenderer._computeChildControlsToBeRendered = function(oOH){
		oOH.__controlsToBeRendered = {};
		var aChildren = oOH.getAttributes();
		for (var i = 0; i < aChildren.length; i++) {
			oOH.__controlsToBeRendered[aChildren[i].getId()] = aChildren[i];
		}
		aChildren = oOH.getStatuses();
		for (var i = 0; i < aChildren.length; i++) {
			oOH.__controlsToBeRendered[aChildren[i].getId()] = aChildren[i];
		}
		var oChild = oOH.getFirstStatus();
		if (oChild) {
			oOH.__controlsToBeRendered[oChild.getId()] = oChild;
		}
		oChild = oOH.getSecondStatus();
		if (oChild) {
			oOH.__controlsToBeRendered[oChild.getId()] = oChild;
		}
		oChild = oOH.getAggregation("_objectNumber");
		if (oChild) {
			oOH.__controlsToBeRendered[oChild.getId()] = oChild;
		}
	};
	
	ObjectHeaderRenderer._renderChildControl = function(rm, oOH, oControl){
		rm.renderControl(oControl);
		if (oControl) {
			delete oOH.__controlsToBeRendered[oControl.getId()];
		}
	};
	
	ObjectHeaderRenderer._cleanupNotRenderedChildControls = function(rm, oOH){
		for (var id in oOH.__controlsToBeRendered) {
			rm.cleanupControlWithoutRendering(oOH.__controlsToBeRendered[id]);
		}
		delete oOH.__controlsToBeRendered;
	};
	

	return ObjectHeaderRenderer;

}, /* bExport= */ true);
