/*!
 * ${copyright}
 */
sap.ui.define([
	'sap/ui/core/Control',
	'sap/ui/core/library',
	'sap/m/library',
	'sap/ui/Device',
	"sap/base/Log",
	'sap/m/Link',
	'sap/m/Text',
	"sap/ui/thirdparty/jquery"
],
	function(Control, coreLibrary, library, Device, Log, Link, Text, jQuery) {
	"use strict";


	// shortcut for sap.ui.core.TextDirection
	var TextDirection = coreLibrary.TextDirection;

	// shortcut for sap.m.BackgroundDesign
	var BackgroundDesign = library.BackgroundDesign;

	// shortcut for sap.ui.core.TitleLevel
	var TitleLevel = coreLibrary.TitleLevel;


	/**
	 * ObjectHeader renderer.
	 * @namespace
	 */
	var ObjectHeaderRenderer = {};

	/**
	 * Check if the object exists. In case object has _isEmpty() method then this method is called. If there is no such method then object is not empty.
	 *
	 * @param {sap.ui.core.Control} oObject to be checked
	 *
	 * @returns {boolean} true is the object is not empty, false - otherwise
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
	 * @param {sap.ui.core.Control[]} aArray array of controls to be checked
	 *
	 * @returns {boolean} true if array is empty, false - otherwise
	 * @private
	 */
	ObjectHeaderRenderer._isEmptyArray = function(aArray) {

		if (aArray) {
			for (var i = 0; i < aArray.length; i++) {
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
	 * @param {sap.ui.core.Control} oLeft control to be checked
	 *
	 * @param {sap.ui.core.Control[]} aRight array of controls to be checked
	 *
	 * @returns {boolean} true if array is empty, false - otherwise
	 * @private
	 */
	ObjectHeaderRenderer._isEmptyRow = function(oLeft, aRight) {

		return ObjectHeaderRenderer._isEmptyObject(oLeft) && ObjectHeaderRenderer._isEmptyArray(aRight);
	};

	/**
	 * Render an array of controls.
	 *
	 * @param {sap.ui.core.RenderManager} oRM the RenderManager that can be used for writing to the render output buffer
	 *
	 * @param {sap.ui.core.Control[]} aObjects array of controls to be renderer
	 *
	 * @param {sap.m.ObjectHeader} oOH the ObjectHeader
	 * @private
	 */
	ObjectHeaderRenderer._renderObjects = function(oRM, aObjects, oOH) {

		for (var i = 0; i < aObjects.length; i++) {
			if (aObjects[i] instanceof Control) {
				this._renderChildControl(oRM, oOH, aObjects[i]);
			}
		}
	};

	/**
	 * Gather all controls that should be rendered inside Object Header.
	 *
	 * @param {sap.m.ObjectHeader} oOH the ObjectHeader
	 * @private
	 */
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

	/**
	 * Delete all controls that were empty and were not rendered inside Object Header.
	 *
	 * @param {sap.ui.core.RenderManager} oRM the RenderManager that can be used for writing to the render output buffer
	 *
	 * @param {sap.m.ObjectHeader} oOH the ObjectHeader
	 * @private
	 */
	ObjectHeaderRenderer._cleanupNotRenderedChildControls = function(oRM, oOH){
		for (var id in oOH.__controlsToBeRendered) {
			oRM.cleanupControlWithoutRendering(oOH.__controlsToBeRendered[id]);
		}
		delete oOH.__controlsToBeRendered;
	};


	/**
	 * Returns the array of markers from ObjectHeader.
	 *
	 * @param {sap.m.ObjectHeader} oOH the ObjectHeader that contains markers
	 *
	 * @returns {Array} array of {sap.m.ObjectMarker} controls
	 *
	 * @private
	 */
	ObjectHeaderRenderer._getMarkers = function(oOH) {
		return oOH._getVisibleMarkers();
	};

	/**
	 * Render intro as sap.m.Text or sap.m.Link depending if it's active or not.
	 * used in both ObjectHeader and ObjectHeaderResponsive
	 *
	 * @param {sap.ui.core.RenderManager} oRM the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.m.ObjectHeader} oOH the ObjectHeader that contains icons
	 * @param {string} sIntroClass the css class of the intro container
	 * @param {string} sIntroActiveClass the css class of the intro container if the intro is active
	 * @private
	 */
	ObjectHeaderRenderer._renderIntro = function(oRM, oOH, sIntroClass, sIntroActiveClass) {
		if (oOH.getIntroActive()) {
			oOH._introText = new Link(oOH.getId() + "-intro");
			oOH._introText.setText(oOH.getIntro());
			oOH._introText.setHref(oOH.getIntroHref());
			oOH._introText.setTarget(oOH.getIntroTarget());
			oOH._introText.press = oOH.introPress;
		} else {
			oOH._introText = new Text(oOH.getId() + "-intro");
			oOH._introText.setText(oOH.getIntro());
			oOH._introText.setMaxLines(3);
		}
		// set text direction of the intro
		oOH._introText.setTextDirection(oOH.getIntroTextDirection());
		oRM.write("<div");
		oRM.addClass(sIntroClass);
		if (oOH.getIntroActive()) {
			oRM.addClass(sIntroActiveClass);
		}
		oRM.writeClasses();
		oRM.write(">");
		this._renderChildControl(oRM, oOH, oOH._introText);
		oRM.write("</div>");
	};

	/**
	 * Renders the HTML for Attribute.
	 *
	 * @param {sap.ui.core.RenderManager}
	 *            oRM the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.m.ObjectHeader}
	 *            oOH an object to be rendered
	 * @param {sap.m.ObjectAttribute}
	 *            oAttr an attribute to be rendered
	 * @param {boolean} bFullWidth set the attribute width to 100%
	 * @private
	 */
	ObjectHeaderRenderer._renderAttribute = function(oRM, oOH, oAttr, bFullWidth) {
		oRM.write("<div");
		oRM.addClass("sapMOHAttr");
		oRM.writeClasses();
		if (bFullWidth) {
			oRM.addStyle("width", "100%");
			oRM.writeStyles();
		}
		oRM.write(">");
		this._renderChildControl(oRM, oOH, oAttr);
		oRM.write("</div>");
	};

	/**
	 * Validate the statuses control list to only display sap.m.ObjectStatus and
	 * sap.m.ProgressIndicator and returns only the visible once that should be rendered
	 *
	 * @param {sap.m.ObjectHeader} oOH an object to be rendered
	 * @returns {array} The visible statuses
	 * @private
	 */
	ObjectHeaderRenderer._getVisibleStatuses = function(oOH) {
		var aVisibleStatuses = [];

		if (oOH.getFirstStatus() && oOH.getFirstStatus().getVisible()) {
			aVisibleStatuses.push([oOH.getFirstStatus()]);
		}
		if (oOH.getSecondStatus() && oOH.getSecondStatus().getVisible()) {
			aVisibleStatuses.push([oOH.getSecondStatus()]);
		}

		if (oOH.getStatuses()) {
			var aStatuses = oOH.getStatuses();
			for (var i = 0; i < aStatuses.length; i++) {
				if (!aStatuses[i].getVisible || aStatuses[i].getVisible()) {
					if ((aStatuses[i] instanceof sap.m.ObjectStatus && !aStatuses[i]._isEmpty()) || aStatuses[i] instanceof sap.m.ProgressIndicator) {
						aVisibleStatuses.push([aStatuses[i]]);
					} else {
						Log.warning("Only sap.m.ObjectStatus or sap.m.ProgressIndicator are allowed in \"sap.m.ObjectHeader.statuses\" aggregation." + " Current object is "
								+ aStatuses[i].constructor.getMetadata().getName() + " with id \"" + aStatuses[i].getId() + "\"");
					}
				}
			}
		}

		return aVisibleStatuses;
	};

	/**
	 * Returns only the visible statuses and attributes that should be rendered
	 *
	 * @param {sap.m.ObjectHeader} oOH an object representation of the control that should be rendered
	 * @returns {array} The visible statuses and attributes
	 * @private
	 */
	ObjectHeaderRenderer._getVisibleAttribsAndStatuses = function(oOH) {
		var aResult = [],
			aAttribs = oOH.getAttributes(),
			aVisibleAttribs = [];

		for (var j = 0; j < aAttribs.length; j++) {
			if (aAttribs[j].getVisible() && !aAttribs[j]._isEmpty()) {
				aVisibleAttribs.push(aAttribs[j]);
			}
		}

		var aVisibleStatuses = this._getVisibleStatuses(oOH);

		aResult[0] = aVisibleAttribs;
		aResult[1] = aVisibleStatuses;

		return aResult;
	};

	/**
	 * Renders the HTML for single line of Attribute and Status.
	 *
	 * @param {sap.ui.core.RenderManager}
	 *            oRM the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.m.ObjectHeader}
	 *            oOH an object to be rendered
	 * @param {sap.m.ObjectAttribute}
	 *            oLeft an attribute to be rendered
	 * @param {sap.ui.core.Control[]}
	 * aRight a status or Progress Indicator Array to be rendered
	 * @private
	 */
	ObjectHeaderRenderer._renderRow = function(oRM, oOH, oLeft, aRight) {

		if (ObjectHeaderRenderer._isEmptyRow(oLeft, aRight)) {
			return; // nothing to render
		}

		oRM.write("<div"); // Start attribute row container
		oRM.addClass("sapMOHAttrRow");
		oRM.writeClasses();
		oRM.write(">");

		if (!ObjectHeaderRenderer._isEmptyObject(oLeft)) { // if the object with the attributes is not empty then render the attributes
			this._renderAttribute(oRM, oOH, oLeft, ObjectHeaderRenderer._isEmptyArray(aRight));
		} else if (ObjectHeaderRenderer._isEmptyObject(oLeft) && !ObjectHeaderRenderer._isEmptyArray(aRight)) {
			// if there are no attributes at all and the array containing statuses and progress indicators isn't empty
			if (aRight[0] instanceof sap.m.ProgressIndicator) { // check if the first element in the array is progress indicator, and if it's so then place an empty "attribute" div before the progress indicator
				oRM.write("<div");
				oRM.addClass("sapMOHAttr");
				oRM.writeClasses();
				oRM.write(">");
				oRM.write("</div>");
			}
		}

		if (!ObjectHeaderRenderer._isEmptyArray(aRight)) { // check do we have statuses, icons or progress indicators and render them accordingly
			oRM.write("<div");
			if (aRight[0] instanceof sap.m.ProgressIndicator) {
				oRM.addClass("sapMOHStatusFixedWidth");
			} else if (aRight[0] instanceof sap.m.ObjectMarker) {
				oRM.addClass("sapMOHStatusFixedWidth");
				oRM.addClass("sapMObjStatusMarker");
			} else {
				oRM.addClass("sapMOHStatus");
			}
			oRM.writeClasses();
			oRM.write(">");
			ObjectHeaderRenderer._renderObjects(oRM, aRight, oOH);
			oRM.write("</div>");
		}

		oRM.write("</div>"); // end attribute row container
	};

	/**
	 * Renders the HTML for attributes and statuses, using the provided {@link sap.ui.core.RenderManager}. Validate the statuses control list to only display ObjectStatus and
	 * ProgressIndicator
	 *
	 * @param {sap.ui.core.RenderManager}
	 *            oRM the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.m.ObjectHeader}
	 *            oOH an object to be rendered
	 * @private
	 */
	ObjectHeaderRenderer._renderAttributesAndStatuses = function(oRM, oOH) {
		var aAttribs = oOH.getAttributes();
		var aVisibleAttribs = [];

		for (var j = 0; j < aAttribs.length; j++) {
			if (aAttribs[j].getVisible()) {
				aVisibleAttribs.push(aAttribs[j]);
			}
		}

		var iAttribsLength = aVisibleAttribs.length;

		var aMarkersAndStatuses = [];
		var aMarkers = ObjectHeaderRenderer._getMarkers(oOH);
		// flag and favorite are not rendered here in responsive mode
		if (!oOH.getResponsive() && !ObjectHeaderRenderer._isEmptyArray(aMarkers)) {
			aMarkersAndStatuses.push(aMarkers);
		}

		var aVisibleStatuses = this._getVisibleStatuses(oOH);

		aMarkersAndStatuses = aMarkersAndStatuses.concat(aVisibleStatuses);

		var iMarkersAndStatusesLength = aMarkersAndStatuses.length;

		var iNoOfRows = iAttribsLength > iMarkersAndStatusesLength ? iAttribsLength : iMarkersAndStatusesLength;

		if (!oOH.getResponsive()) {
			for (var iCount = 0; iCount < iNoOfRows; iCount++) {
				this._renderRow(oRM, oOH, aVisibleAttribs[iCount], aMarkersAndStatuses[iCount]);
			}
		}

	};

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager}
	 *            oRM the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.m.ObjectHeader}
	 *            oOH an object representation of the control that should be rendered
	 * @private
	 */
	ObjectHeaderRenderer._renderNumber = function(oRM, oOH) {
		var numbers = oOH.getAdditionalNumbers();

		if (!oOH.getNumber() && (numbers && !numbers.length)) {
			return;
		}

		// Container for a number and a units qualifier.
		oRM.write("<div"); // Start Number/units container
		oRM.writeAttribute("id", oOH.getId() + "-numberdiv");
		oRM.addClass("sapMOHNumberDiv");
		oRM.writeClasses();
		oRM.write(">");

		var oObjectNumber = oOH.getAggregation("_objectNumber");

		if (oObjectNumber && oObjectNumber.getNumber()) {
			oObjectNumber.setTextDirection(oOH.getNumberTextDirection());
			this._renderChildControl(oRM, oOH, oObjectNumber);
		}
		oRM.write("</div>"); // End Number/units container

		if (!oOH.getCondensed()) {
			this._renderAdditionalNumbers(oRM, oOH);
		}
	};

	/**
	 * Renders the HTML for the provided in aggregation additionalNumbers {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager}
	 *            oRM the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.m.ObjectHeader}
	 *            oOH an object representation of the ObjectHeader
	 * @private
	 */
	ObjectHeaderRenderer._renderAdditionalNumbers = function(oRM, oOH) {
		var numbers = oOH.getAdditionalNumbers();
		if (numbers && !numbers.length) {
			return;
		}

		if (numbers.length === 1) {
			oRM.write("<div");
			oRM.addClass("additionalOHNumberSeparatorDiv");
			oRM.writeClasses();
			oRM.write("></div>");
		}

		for (var i = 0; i < numbers.length; i++) {
			oRM.write("<div");
			oRM.writeAttribute("id", oOH.getId() + "-additionalNumber" + i);
			oRM.addClass("sapMOHNumberDiv additionalOHNumberDiv");
			if (numbers.length === 1) {
				oRM.addClass("sapMOHOnlyANumber");
			}
			oRM.writeClasses();
			oRM.write(">");
			numbers[i].setTextDirection(oOH.getNumberTextDirection());
			this._renderChildControl(oRM, oOH, numbers[i]);

			oRM.write("</div>"); // End container
		}
	};

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager}
	 *            oRM the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.m.ObjectHeader}
	 *            oOH an object representation of the control that should be rendered
	 * @private
	 */
	ObjectHeaderRenderer._renderTitle = function(oRM, oOH) {

		// Start title text and title arrow container
		oOH._oTitleArrowIcon.setVisible(oOH.getShowTitleSelector());
		if (oOH.getShowTitleSelector() && oOH._oTitleArrowIcon.getVisible()) {
			oRM.write("<div");
			oRM.addClass("sapMOHTitleAndArrow");
			oRM.writeClasses();
			oRM.write(">");
		}

		if (oOH.getTitle()) {
			var sTitleLevel = (oOH.getTitleLevel() === TitleLevel.Auto) ? TitleLevel.H1 : oOH.getTitleLevel();

			oOH._titleText.setText(oOH.getTitle());
			// set text direction of the title
			oOH._titleText.setTextDirection(oOH.getTitleTextDirection());

			if (oOH.getTitleActive()) {
				oRM.write("<a"); // Start Title Text container
				if (oOH.getTitleHref()) { // if title is link write it
					oRM.writeAttributeEscaped("href", oOH.getTitleHref());
					if (oOH.getTitleTarget()) {
						oRM.writeAttributeEscaped("target", oOH.getTitleTarget());
					}
				}

				//ARIA attributes
				oRM.writeAccessibilityState({
					role: "link",
					haspopup: !oOH.getTitleHref()
				});
			} else {
				oRM.write("<div"); // Start Title Text container
			}

			oRM.writeAttribute("id", oOH.getId() + "-title");
			oRM.addClass("sapMOHTitle");
			if (oOH.getTitleActive()) {
				oRM.writeAttribute("tabindex", "0");
				oRM.addClass("sapMOHTitleActive");
			}
			if (oOH.getShowTitleSelector()) {
				oRM.addClass("sapMOHTitleFollowArrow");
			}
			oRM.writeClasses();
			oRM.write(">");
			oRM.write("<" + sTitleLevel + ">");
			this._renderChildControl(oRM, oOH, oOH._titleText);
			oRM.write("</" + sTitleLevel + ">");

			if (oOH.getTitleActive()) {
				oRM.write("</a>"); // End Title Text container
			} else {
				oRM.write("</div>"); // End Title Text container
			}
		}

		if (oOH.getShowTitleSelector()) {
			oRM.write("<span"); // Start title arrow container
			oRM.addClass("sapMOHTitleArrow");
			oRM.writeClasses();
			oRM.write(">");
			this._renderChildControl(oRM, oOH, oOH._oTitleArrowIcon);
			oRM.write("</span>"); // end title arrow container
		}

		if (oOH.getShowTitleSelector() && oOH._oTitleArrowIcon.getVisible()) {
			oRM.write("</div>"); // end title text and title arrow container
		}
	};

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager}
	 *            oRM the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.m.ObjectHeader}
	 *            oOH an object representation of the control that should be rendered
	 * @private
	 */
	ObjectHeaderRenderer._renderFullTitle = function(oRM, oOH) {
		var numbers = oOH.getAdditionalNumbers();

		if (!oOH.getNumber() && (numbers && !numbers.length)) {
			oRM.addClass("sapMOHTitleDivFull");
		}
	};

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager}
	 *            oRM the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.m.ObjectHeader}
	 *            oOH an object representation of the control that should be rendered
	 * @private
	 */
	ObjectHeaderRenderer._renderFullOH = function(oRM, oOH) {
		// Introductory text at the top of the item, like "On behalf of Julie..."
		if (oOH.getIntro()) {
			this._renderIntro(oRM, oOH, "sapMOHIntro", "sapMOHIntroActive");
		}

		// Container for fields placed on the top half of the item, below the intro. This
		// includes title icon, title, title arrow, number, and number units.
		oRM.write("<div"); // Start Top row container
		oRM.addClass("sapMOHTopRow");
		oRM.writeClasses();
		oRM.write(">");

		// Title container displayed to the left of the number and number units container.
		oRM.write("<div"); // Start Title container
		oRM.writeAttribute("id", oOH.getId() + "-titlediv");
		oRM.addClass("sapMOHTitleDiv");
		if (oOH._hasIcon()) {
			oRM.addClass("sapMOHTitleIcon");
		}

		this._renderFullTitle(oRM, oOH);
		oRM.writeClasses();
		oRM.write(">");

		// Container for icon
		if (oOH._hasIcon()) {
			oRM.write("<div"); // Start icon container
			oRM.addClass("sapMOHIcon");
			oRM.addClass('sapMOHIcon' + oOH.getImageShape());
			if (oOH.getIconActive()) {
				oRM.addClass("sapMPointer");
			}
			oRM.writeClasses();
			oRM.write(">");
			this._renderChildControl(oRM, oOH, oOH._getImageControl());
			oRM.write("</div>"); // end icon container
		}

		this._renderTitle(oRM, oOH);

		oRM.write("</div>"); // End Title container

		this._renderNumber(oRM, oOH);

		oRM.write("<div class=\"sapMOHDivider\"></div>");
		oRM.write("</div>"); // End Top row container

		if (oOH._hasBottomContent()) {
			oRM.write("<div"); // Start Bottom row container
			oRM.addClass("sapMOHBottomRow");
			oRM.writeClasses();
			oRM.write(">");

			this._renderAttributesAndStatuses(oRM, oOH);

			oRM.write("<div class=\"sapMOHDivider\"></div>");
			oRM.write("</div>"); // End Bottom row container
		}
	};

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager}
	 *            oRM the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.m.ObjectHeader}
	 *            oOH an object representation of the control that should be rendered
	 * @private
	 */
	ObjectHeaderRenderer._renderCondensedOH = function(oRM, oOH) {
		// Title container displayed to the left of the number and number units container.
		oRM.write("<div"); // Start Title container
		oRM.writeAttribute("id", oOH.getId() + "-titlediv");
		oRM.addClass("sapMOHTitleDiv");

		this._renderFullTitle(oRM, oOH);

		oRM.writeClasses();
		oRM.write(">");

		this._renderTitle(oRM, oOH);

		oRM.write("</div>"); // End Title container

		this._renderNumber(oRM, oOH);

		var oFirstAttr = oOH.getAttributes()[0];

		if (oFirstAttr && !oFirstAttr._isEmpty()) {
			this._renderAttribute(oRM, oOH, oFirstAttr);
		}
	};

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager}
	 *            oRM the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.m.ObjectHeader}
	 *            oOH an object representation of the control that should be rendered
	 */
	ObjectHeaderRenderer.render = function(oRM, oOH) {

		// render responsive OH
		if (oOH.getResponsive()) {
			this._renderResponsive(oRM, oOH);
			return;
		}

		// === old renderer, no changes here for downwards compatibility

		this._computeChildControlsToBeRendered(oOH);

		var bCondensed = oOH.getCondensed();

		oRM.write("<div");
		oRM.writeControlData(oOH);
		oRM.write(">");

		oRM.write("<div"); // Start Main container
		oRM.addClass("sapMOH");

		// set contrast container, only when the background is not transparent
		if (oOH._getBackground() !== BackgroundDesign.Transparent) {
			oRM.addClass("sapContrastPlus");
		}

		if (bCondensed) {
			oRM.addClass("sapMOHC");
		}

		oRM.addClass("sapMOHBg" + oOH._getBackground());

		oRM.writeClasses();
		var sTooltip = oOH.getTooltip_AsString();
		if (sTooltip) {
			oRM.writeAttributeEscaped("title", sTooltip);
		}
		// ARIA attributes
		oRM.writeAccessibilityState({
			role : "region",
			labelledby: {
				value: oOH.getId() + "-titleText-inner",
				append: true
			}
		});

		oRM.write(">");

		if (bCondensed) {
			this._renderCondensedOH(oRM, oOH);
		} else {
			this._renderFullOH(oRM, oOH);
		}

		oRM.write("<div class=\"sapMOHLastDivider\"></div>");
		oRM.write("</div>");
		oRM.write("</div>"); // End Main container\

		this._cleanupNotRenderedChildControls(oRM, oOH);

	};

	/**
	 * Renders the child control contained in the OH
	 *
	 * @param {sap.ui.core.RenderManager}
	 *            oRM the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.m.ObjectHeader}
	 *            oOH an object representation of the control that should be rendered
	 * @param {sap.ui.core.Control}
	 *            oControl an object representation of the child control that should be rendered
	 * @private
	 **/
	ObjectHeaderRenderer._renderChildControl = function(oRM, oOH, oControl){
		oRM.renderControl(oControl);
		if (!oOH.getResponsive() && oOH.__controlsToBeRendered) { // if control is rendered remove it from the array
			oOH.__controlsToBeRendered[oControl.getId()] = undefined;
		}
	};

	/**
	 * Responsive rendering start
	 *
	 * @param {sap.ui.core.RenderManager}
	 *            oRM the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.m.ObjectHeader}
	 *            oOH an object representation of the control that should be rendered
	 * @private
	 **/
	ObjectHeaderRenderer._renderResponsive = function(oRM, oOH) {
		var bStates = this._hasResponsiveStates(oOH),
			bTabs = this._hasResponsiveTabs(oOH),
			oHeaderContainer = oOH.getHeaderContainer();

		// start outer div (containing ObjectHeader and IconTabBar content div)
		oRM.write("<div");
		oRM.addClass("sapMOHROuter");
		oRM.writeClasses();

		var sTooltip = oOH.getTooltip_AsString();
		if (sTooltip) {
			oRM.writeAttributeEscaped("title", sTooltip);
		}

		//ARIA attributes
		oRM.writeAccessibilityState({
			role : "region",
			labelledby: {
				value: oOH.getId() + "-txt",
				append: true
			}
		});
		oRM.writeControlData(oOH);
		oRM.write(">");

		oRM.write("<div");
		oRM.addClass("sapMOHR");
		// set contrast container, only when the background is not transparent
		if (oOH._getBackground() !== BackgroundDesign.Transparent) {
			oRM.addClass("sapContrastPlus");
		}

		if (bTabs) {
			oRM.addClass("sapMOHRNoBorder");
		}

		oRM.addClass("sapMOHRBg" + oOH._getBackground());
		oRM.writeClasses();
		oRM.write(">");
		oRM.write("<div");

		if (Device.system.desktop && oOH._isMediaSize("Desktop") && oOH.getFullScreenOptimized() && oOH._iCountVisAttrStat >= 1 && oOH._iCountVisAttrStat <= 3) {
			oRM.addClass("sapMOHRStatesOneOrThree");
		}

		oRM.writeClasses();
		oRM.write(">");

		this._renderResponsiveTitleBlock(oRM, oOH);

		if (bStates) {
			this._renderResponsiveStates(oRM, oOH);
		}

		oRM.write("</div>"); // end wrapper div

		if (bTabs) {
			this._renderResponsiveTabs(oRM, oOH);
		}

		oRM.write("</div>");

		if (oHeaderContainer && oHeaderContainer instanceof sap.m.IconTabBar) {
			this._renderChildControl(oRM, oOH, oHeaderContainer);
		}

		oRM.write("</div>"); // end outer div

		if (!oOH.getTitle()) {
			 //if value is set through data binding, there is time delay and fake warning will be logged, so set warning only if not data binding
			if (!oOH.getBinding("title")) {
				Log.warning("The title shouldn't be empty!");
			}
		}
	};

	/**
	 * first building block for the responsive object header, it contains
	 * - intro
	 * - image
	 * - title
	 * - number and unit
	 *
	 * @param {sap.ui.core.RenderManager}
	 *            oRM the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.m.ObjectHeader}
	 *            oControl an object representation of the control that should be rendered
	 * @private
	 **/
	ObjectHeaderRenderer._renderResponsiveTitleBlock = function(oRM, oControl) {
		// Title container displayed to the left of the number and number units container.
		oRM.write("<div"); // Start Title and Number container (block1 and block2)
		oRM.writeAttribute("id", oControl.getId() + "-titlenumdiv");
		oRM.addClass("sapMOHRTitleNumberDiv"); // first block class
		oRM.writeClasses();
		oRM.write(">");

		oRM.write("<div"); // Start Title container
		oRM.writeAttribute("id", oControl.getId() + "-titlediv");
		oRM.addClass("sapMOHRTitleDiv");

		if (oControl._hasIcon()) {
			if (Device.system.phone || oControl._isMediaSize("Phone")) {
				if (Device.orientation.landscape || (oControl._isMediaSize("Phone") && !Device.system.phone)) {
					oRM.addClass("sapMOHRTitleIcon");
				}
			} else {
				oRM.addClass("sapMOHRTitleIcon");
			}
		}

		if (!oControl.getNumber()) {
			oRM.addClass("sapMOHRTitleDivFull");
		}
		oRM.writeClasses();
		oRM.write(">");

		this._renderResponsiveTitle(oRM, oControl);

		// render the title icon in a separate container
		if (oControl._hasIcon()) {
			oRM.write("<div");
			oRM.writeAttribute("id", oControl.getId() + "-titleIcon");
			oRM.addClass("sapMOHRIcon");
			oRM.addClass('sapMOHRIcon' + oControl.getImageShape());
			if ((Device.system.phone && Device.orientation.portrait)) {
				oRM.addClass("sapMOHRHideIcon");
			}
			if (oControl.getIconActive()) {
				oRM.addClass("sapMPointer");
			}
			oRM.writeClasses();
			oRM.write(">");
			this._renderChildControl(oRM, oControl, oControl._getImageControl());
			oRM.write("</div>"); // end icon container
		}
		oRM.write("</div>"); // End Title container

		this._renderResponsiveNumber(oRM, oControl);

		oRM.write("</div>"); // End Title and Number container
	};


	/**
	 * Renders the HTML for attributes and statuses, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager}
	 *            oRM the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.m.ObjectHeader}
	 *            oControl an object to be rendered
	 * @private
	 */
	ObjectHeaderRenderer._renderResponsiveStates = function(oRM, oControl) {
		oRM.write("<div");
		oRM.writeAttribute("id", oControl.getId() + "-states");
		oRM.addClass("sapMOHRStates");
		oRM.writeClasses();
		oRM.write(">");
		this._renderResponsiveRow(oRM, oControl);
		oRM.write("</div>");
	};

	/**
	 * Renders the HTML for the row which contains columns in which attributes and statuses are displayed.
	 *
	 * @param {sap.ui.core.RenderManager}
	 *            oRM the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.m.ObjectHeader}
	 *            oOH an object representation of the control that should be rendered
	 * @private
	 */
	ObjectHeaderRenderer._renderResponsiveRow = function(oRM, oOH) {
		var aVisAtribsStatuses = [];
		aVisAtribsStatuses = this._getVisibleAttribsAndStatuses(oOH);

		var aVisibleAttrAndStat = aVisAtribsStatuses[0].concat(aVisAtribsStatuses[1]),
			iCountVisibleAttr = aVisAtribsStatuses[0].length,
			iCountAttrAndStat = aVisibleAttrAndStat.length,
			iRenderCols = 1,
			sClassColCount = '';

		if (iCountAttrAndStat === 0) {
			return; //nothing to render
		}

		if (Device.system.desktop) {
			if (!oOH.getFullScreenOptimized()) { // if master detail
				if (iCountAttrAndStat >= 1 && iCountAttrAndStat <= 4) {
					iRenderCols = 2; // render two columns
					sClassColCount = 'sapMOHRTwoCols';
				}
				if (iCountAttrAndStat >= 5) {
					iRenderCols = 3; // render three columns
					sClassColCount = 'sapMOHRThreeCols';
				}
			} else { // if full screen
				if (iCountAttrAndStat >= 1 && iCountAttrAndStat <= 3) {
					iRenderCols = 1; // render one column
					sClassColCount = 'sapMOHROneCols';
				}
				if (iCountAttrAndStat >= 4) {
					iRenderCols = 4; // render four columns
					sClassColCount = 'sapMOHRFourCols';
				}
			}
		}

		if ((Device.system.tablet && !Device.system.desktop) || (Device.system.desktop && oOH._isMediaSize("Tablet"))) {
			if (!oOH.getFullScreenOptimized() || (Device.orientation.portrait && oOH.getFullScreenOptimized())) { // full screen portrait or master detail
				iRenderCols = 2; //render two columns
				sClassColCount = 'sapMOHRTwoCols';
			} else {
				if (oOH.getFullScreenOptimized() && ( Device.orientation.landscape || (Device.system.desktop && oOH._isMediaSize("Tablet")))) { //full screen landscape
					if (iCountAttrAndStat >= 1 && iCountAttrAndStat <= 2) {
						iRenderCols = 2; // render two columns
						sClassColCount = 'sapMOHRTwoCols';
					}

					if (iCountAttrAndStat >= 3) {
						iRenderCols = 3; // render three columns
						sClassColCount = 'sapMOHRThreeCols';
					}
				}
			}
		}

		if (Device.system.phone || (Device.system.desktop && oOH._isMediaSize("Phone"))) {
			iRenderCols = 1; // render one column
			sClassColCount = 'sapMOHROneCols';
		}

		this._renderResponsiveStatesColumn(oRM, oOH, iRenderCols, aVisibleAttrAndStat, iCountVisibleAttr, sClassColCount);
	};

	/**
	 * Renders the HTML for the columns containing the states.
	 *
	 * @param {sap.ui.core.RenderManager} oRM The RenderManager that can be used for writing to the render output buffer
	 * @param {sap.m.ObjectHeader} oOH An object representation of the control that should be rendered
	 * @param {int} iRenderCols The number of columns that should be rendered
	 * @param {array} aVisibleAttrAndStat The array of attributes and statuses that should be rendered
	 * @param {int} iCountVisibleAttr The number of attributes that should be rendered, since they should be rendered before the states
	 * @param {string} sClassColCount The name of the appropriate css class that should be set
	 * @private
	 */
	ObjectHeaderRenderer._renderResponsiveStatesColumn = function(oRM, oOH, iRenderCols, aVisibleAttrAndStat, iCountVisibleAttr, sClassColCount) {
		var iCountInCols = Math.floor( aVisibleAttrAndStat.length / iRenderCols ); // number of attributes and states in each column
		var iCountInBigCols = aVisibleAttrAndStat.length % iRenderCols;
		var iCurrentCountInCol = 0; // contains current number of attributes and statuses in the column (will be reset to zero when it becames equal to iCountInCols)
		var iContNum = 1; // container number (start from the first one)
		for (var i = 0; i < aVisibleAttrAndStat.length; i++) {
			if (iCurrentCountInCol == 0) {
				oRM.write("<div"); // Start container
				oRM.addClass("sapMOHRStatesCont" + iContNum);
				oRM.addClass(sClassColCount);
				oRM.writeClasses();
				oRM.write(">");
			}

			if (i < iCountVisibleAttr) {
				this._renderResponsiveAttribute(oRM, oOH, aVisibleAttrAndStat[i]);
			} else {
				this._renderResponsiveStatus(oRM, oOH, aVisibleAttrAndStat[i]);
			}
			iCurrentCountInCol++;
			if ((iCurrentCountInCol == iCountInCols && iContNum > iCountInBigCols) || (iCurrentCountInCol == (iCountInCols + 1) && iContNum <= iCountInBigCols) || i == aVisibleAttrAndStat.length - 1) {
				oRM.write("</div>"); // end container
				iCurrentCountInCol = 0;
				iContNum++;
			}
		}
	};

	/**
	 * Renders the HTML for Attribute.
	 *
	 * @param {sap.ui.core.RenderManager} oRM The RenderManager that can be used for writing to the render output buffer
	 * @param {sap.m.ObjectHeader} oOH An object representation of the control that should be rendered
	 * @param {sap.m.ObjectAttribute} oAttr An object representation of the sap.m.ObjectAtribute that should be rendered
	 * @private
	 */
	ObjectHeaderRenderer._renderResponsiveAttribute = function(oRM, oOH, oAttr) {
		oRM.write("<div");
		oRM.addClass("sapMOHRAttr");
		oRM.writeClasses();
		oRM.write(">");
		this._renderChildControl(oRM, oOH, oAttr);
		oRM.write("</div>");
	};

	/**
	 * Renders the HTML for Status.
	 *
	 * @param {sap.ui.core.RenderManager} oRM the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.m.ObjectHeader} oOH an object representation of the control that should be rendered
	 * @param {sap.m.ObjectStatus} oStatus an object representation of the sap.m.ObjectStatus that should be rendered
	 * @private
	 */
	ObjectHeaderRenderer._renderResponsiveStatus = function(oRM, oOH, oStatus) {
		oRM.write("<div");
		oRM.addClass("sapMOHRStatus");
		oRM.writeClasses();
		oRM.write(">");
		this._renderChildControl(oRM, oOH, oStatus[0]);
		oRM.write("</div>");
	};

	/**
	 * Renders flag and favorite icon
	 *
	* @param {sap.ui.core.RenderManager}
	 *            oRM the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.m.ObjectHeader}
	 *            oControl an object representation of the control that should be rendered
	 * @private
	 */
	ObjectHeaderRenderer._renderResponsiveMarkers = function(oRM, oControl) {
		var aMarkers = [],
			sTextDir = oControl.getTitleTextDirection(),
			bPageRTL = sap.ui.getCore().getConfiguration().getRTL();

		// load markers based on control state
		aMarkers = oControl._getVisibleMarkers();

		// render markers
		oRM.write("<span");
		oRM.addClass("sapMObjStatusMarker");

		if ((sTextDir === TextDirection.LTR && bPageRTL) || (sTextDir === TextDirection.RTL && !bPageRTL)) {
			oRM.addClass("sapMObjStatusMarkerOpposite");
		}
		oRM.writeClasses();
		oRM.writeAttribute("id", oControl.getId() + "-markers");

		oRM.write(">");
		for (var i = 0; i < aMarkers.length; i++) {
			this._renderChildControl(oRM, oControl, aMarkers[i]);
		}
		oRM.write("</span>");
	};

	/**
	 * Renders the ObjectNumber, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager}
	 *            oRM the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.m.ObjectHeader}
	 *            oControl an object representation of the control that should be rendered
	 * @private
	 */
	ObjectHeaderRenderer._renderResponsiveNumber = function(oRM, oControl) {
		var oObjectNumber = oControl.getAggregation("_objectNumber");

		if (oObjectNumber && oObjectNumber.getNumber()) {
			oObjectNumber.setTextDirection(oControl.getNumberTextDirection());
			this._renderChildControl(oRM, oControl, oObjectNumber);
		}
	};

	/**
	 * Helper function to determine whether states need to be rendered or not
	 *
	 * @param {sap.m.ObjectHeader} oControl The sap.m.ObjectHeader
	 * @returns {boolean} If there is need for rerendering
	 * @private
	 */
	ObjectHeaderRenderer._hasResponsiveStates = function (oControl) {
		var aAttribs = oControl.getAttributes(),
			aVisibleAttribs = [];

		if (!(oControl._hasAttributes() || oControl._hasStatus())) {
			oControl._iCountVisAttrStat = 0;
			return false;
		}

		for (var j = 0; j < aAttribs.length; j++) {
			if (aAttribs[j].getVisible()) {
				aVisibleAttribs.push(aAttribs[j]);
			}
		}

		var aVisibleStatuses = this._getVisibleStatuses(oControl);

		//this value needs to be adapted when an attribute or status is set to visible(false) after rendering
		oControl._iCountVisAttrStat = aVisibleAttribs.length + aVisibleStatuses.length;

		return !!(aVisibleAttribs.length + aVisibleStatuses.length);
	};

	/**
	 * helper function to determine whether tabs need to be rendered or not
	 * @param {sap.m.ObjectHeader} oControl The sap.m.ObjectHeader
	 * @returns {boolean} If there is need for rerendering
	 *
	 * @private
	 */
	ObjectHeaderRenderer._hasResponsiveTabs = function (oControl) {
		var oHeaderContainer = oControl.getHeaderContainer(),
			oIconTabHeader;

		if (oHeaderContainer) {
			if (oHeaderContainer instanceof sap.m.IconTabBar) {
				oIconTabHeader = oHeaderContainer._getIconTabHeader();
				if (oIconTabHeader.getVisible()) {
					oControl._iCountVisTabs = oIconTabHeader.getItems().length;
					return !!oIconTabHeader.getItems().length;
				}
			} else if (oHeaderContainer.getMetadata().getName() === "sap.m.HeaderContainer") {
				return !!oHeaderContainer.getContent().length;
			} else if (oHeaderContainer.getMetadata().getName() === "sap.suite.ui.commons.HeaderContainer") {
				return !!oHeaderContainer.getItems().length;
			}
		}
		return false;
	};


	/**
	 * Renders the ITB, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager}
	 *            oRM the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.m.ObjectHeader}
	 *            oControl an object representation of the control that should be rendered
	 * @private
	 */
	ObjectHeaderRenderer._renderResponsiveTabs = function(oRM, oControl) {
		var oHeaderContainer = oControl.getHeaderContainer(),
			oIconTabHeader;

		oRM.write("<div class=\"sapMOHRTabs" + (oHeaderContainer instanceof sap.m.IconTabBar ? " sapMOHRTabsITB" : "") + "\">");
		if (oHeaderContainer) {
			if (oHeaderContainer instanceof sap.m.IconTabBar) {
				oIconTabHeader = oHeaderContainer._getIconTabHeader();
				this._renderChildControl(oRM, oControl, oIconTabHeader);
				// tell iconTabBar to not render the header
				oHeaderContainer._bHideHeader = true;
			} else if (oHeaderContainer.getMetadata().getName() === "sap.m.HeaderContainer" || oHeaderContainer.getMetadata().getName() === "sap.suite.ui.commons.HeaderContainer") {
				// render the header container
				this._renderChildControl(oRM, oControl, oHeaderContainer);
			} else {
				Log.warning("The control " + oHeaderContainer + " is not supported for aggregation \"headerContainer\"");
			}
		}
		oRM.write("</div>");
	};


	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager}
	 *            oRM the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.m.ObjectHeader}
	 *            oOH an object representation of the control that should be rendered
	 * @private
	 */
	ObjectHeaderRenderer._renderResponsiveTitle = function(oRM, oOH) {
		var nCutLen;

		// Start title text and title arrow container
		oOH._oTitleArrowIcon.setVisible(oOH.getShowTitleSelector());

		oRM.write("<div"); // Start Title Text container

		oRM.writeAttribute("id", oOH.getId() + "-title");
		oRM.addClass("sapMOHRTitle");

		if (oOH.getTitle().length && oOH.getTitleActive()) {
			oRM.addClass("sapMOHRTitleActive");
		}
		if (oOH.getShowTitleSelector()) {
			oRM.addClass("sapMOHRTitleFollowArrow");
		}
		oRM.writeClasses();
		oRM.write(">");

		// Cut the title to 50 or 80 chars according to the design specification
		if ((Device.system.phone && Device.orientation.portrait)) {
			nCutLen = 50;
		} else {
			nCutLen = 80;
		}

		oRM.write("<div"); // Start TitleArrow container
		oRM.writeAttribute("id", oOH.getId() + "-title-arrow");
		oRM.addStyle("display", "inline-block");
		oRM.writeStyles();
		oRM.write(">");
		this._renderResponsiveTitleAndArrow(oRM, oOH, nCutLen);
		oRM.write("</div>");

		// Introductory text at the top of the item, like "On behalf of Julie..."
		if (oOH.getIntro()) {
			this._renderIntro(oRM, oOH, "sapMOHRIntro", "sapMOHRIntroActive");
		}

		oRM.write("</div>"); // End Title Text container
	};

	/**
	 * Rerenders the HTML for the title of the Object Header, also called on rerender Title.
	 *
	 * @param {sap.ui.core.RenderManager} oRM the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.m.ObjectHeader} oOH an object representation of the control that should be rendered
	 * @param {int} nCutLen number of chars to which the title should be cut
	 * @private
	 */
	ObjectHeaderRenderer._rerenderTitle = function(oRM, oOH, nCutLen) {
		var sId = oOH.getId();

		this._renderResponsiveTitleAndArrow(oRM, oOH, nCutLen);
		oRM.flush(jQuery(document.getElementById(sId + "-title-arrow")));
	};

	/**
	 * Renders the HTML for the title and arrow.
	 *
	 * @param {sap.ui.core.RenderManager} oRM the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.m.ObjectHeader} oOH an object representation of the control that should be rendered
	 * @param {int} nCutLen number of chars to which the title should be cut
	 * @private
	 */
	ObjectHeaderRenderer._renderResponsiveTitleAndArrow = function(oRM, oOH, nCutLen) {
		var sOHTitle, sEllipsis = '', sTextDir = oOH.getTitleTextDirection();
		var bMarkers = !!oOH._getVisibleMarkers().length;
		var sTitleLevel = (oOH.getTitleLevel() === TitleLevel.Auto) ? TitleLevel.H1 : oOH.getTitleLevel();

		oRM.write("<" + sTitleLevel + ">");
		oRM.write("<span");
		oRM.addClass("sapMOHRTitleTextContainer");
		oRM.writeClasses();
		// set title text direction, it will be inherit from the "flags" also
		if (sTextDir != TextDirection.Inherit) {
			oRM.writeAttribute("dir", sTextDir.toLowerCase());
		}
		oRM.write(">");
		if (oOH.getTitle().length && oOH.getTitleActive()) {
			oRM.write("<a");
			if (oOH.getTitleHref()) { // if title is link write it
				oRM.writeAttributeEscaped("href", oOH.getTitleHref());
				if (oOH.getTitleTarget()) {
					oRM.writeAttributeEscaped("target", oOH.getTitleTarget());
				}
			}

			oRM.writeAttribute("tabindex", "0");
			//ARIA attributes
			oRM.writeAccessibilityState({
				role: "link",
				haspopup: !oOH.getTitleHref()
			});
		} else {
			oRM.write("<span");
		}
		oRM.writeAttribute("id", oOH.getId() + "-txt");
		oRM.addClass("sapMOHRTitleText");
		oRM.writeClasses();

		oRM.write(">");

		oRM.write("<span");
		oRM.writeAttribute("id", oOH.getId() + "-titletxtwrap");
		oRM.addClass("sapMOHRTitleTextWrappable");
		oRM.writeClasses();
		oRM.write(">");

		if (oOH.getTitle().length > nCutLen) {
			sOHTitle = oOH.getTitle().substr(0, nCutLen).trim();
			sEllipsis = '...';
		} else {
			sOHTitle = oOH.getTitle();
		}

		if (bMarkers) {
			var sOHTitleEnd = sOHTitle.substr(sOHTitle.lastIndexOf(" ") + 1);
			var sOHTitleStart = sOHTitle.substr(0, sOHTitle.lastIndexOf(" ") + 1);

			if (sOHTitleEnd.length === 1) {
				sOHTitleEnd = sOHTitle;
				sOHTitleStart = '';
			}

			oRM.writeEscaped(sOHTitleStart);
			oRM.write("</span>");

			oRM.writeEscaped(sOHTitleEnd);
			oRM.write(sEllipsis);
			if (oOH.getTitleActive()) {
				oRM.write("</a>");
			} else {
				oRM.write("</span>");
			}
			this._renderResponsiveMarkers(oRM, oOH);
			oRM.write("</span>");
		} else {
			if (!sEllipsis){
				oRM.writeEscaped(sOHTitle);
			} else {
				oRM.writeEscaped(sOHTitle + sEllipsis);
			}
			if (oOH.getTitleActive()) {
				oRM.write("</span></a></span>");
			} else {
				oRM.write("</span></span></span>");
			}
		}

		if (oOH.getShowTitleSelector()) {
			oRM.write("<span"); // Start title arrow container
			oRM.addClass("sapMOHRTitleArrow");
			oRM.writeClasses();
			oRM.write(">");
			this._renderChildControl(oRM, oOH, oOH._oTitleArrowIcon);
			oRM.write("</span>"); // end title arrow container
		}
		oRM.write("</" + sTitleLevel + ">");

	};

	/**
	 * Rerenders the HTML for the states of the responsive Object Header.
	 *
	 * @param {sap.ui.core.RenderManager}
	 *            oRM the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.m.ObjectHeader}
	 *            oOH an object representation of the control that should be rendered
	 * @private
	 */
	ObjectHeaderRenderer._rerenderResponsiveStates = function(oRM, oOH) {
		var sId = oOH.getId(),
			aVisAtribsStatuses = this._getVisibleAttribsAndStatuses(oOH),
			aVisibleAttrAndStat = aVisAtribsStatuses[0].concat(aVisAtribsStatuses[1]),
			iCountVisibleAttr = aVisAtribsStatuses[0].length,
			iCountAttrAndStat = aVisibleAttrAndStat.length,
			iRenderCols = 1,
			sClassColCount = '';

		if (iCountAttrAndStat === 0) {
			return; //nothing to render
		}

		// tablet case
		if (Device.orientation.portrait) { // full screen portrait or master detail
			iRenderCols = 2; //render two columns
			sClassColCount = 'sapMOHRTwoCols';
		} else {
			if (iCountAttrAndStat >= 1 && iCountAttrAndStat <= 2) {
				iRenderCols = 2; // render two columns
				sClassColCount = 'sapMOHRTwoCols';
			}
			if (iCountAttrAndStat >= 3) {
				iRenderCols = 3; // render three columns
				sClassColCount = 'sapMOHRThreeCols';
			}
		}

		this._renderResponsiveStatesColumn(oRM, oOH, iRenderCols, aVisibleAttrAndStat, iCountVisibleAttr, sClassColCount);

		oRM.flush(jQuery(document.getElementById(sId + "-states"))[0]);
	};

	/**** responsive rendering end ****/

	return ObjectHeaderRenderer;

}, /* bExport= */ true);