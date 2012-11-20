/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 * 
 * (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

/* -----------------------------------------------------------------------------------
 * Hint: This is a derived (generated) file. Changes should be done in the underlying
 * source files only (*.type, *.js) or they will be lost after the next generation.
 * ----------------------------------------------------------------------------------- */

/**
 * Initialization Code and shared classes of library sap.m (1.9.0-SNAPSHOT)
 */
jQuery.sap.declare("sap.m.library");
jQuery.sap.require("sap.ui.core.Core");
/**
 * SAPUI5 library with controls specialized for mobile devices.
 *
 * @namespace
 * @name sap.m
 * @public
 */


// library dependencies
jQuery.sap.require("sap.ui.core.library");

// delegate further initialization of this library to the Core
sap.ui.getCore().initLibrary({
  name : "sap.m",
  dependencies : ["sap.ui.core"],
  types: [
    "sap.m.ButtonType",
    "sap.m.FlexAlignContent",
    "sap.m.FlexAlignItems",
    "sap.m.FlexAlignSelf",
    "sap.m.FlexDirection",
    "sap.m.FlexJustifyContent",
    "sap.m.FlexRendertype",
    "sap.m.FlexWrap",
    "sap.m.InputType",
    "sap.m.LabelDesign",
    "sap.m.ListMode",
    "sap.m.ListType",
    "sap.m.PageBackgroundDesign",
    "sap.m.PlacementType"
  ],
  interfaces: [],
  controls: [
    "sap.m.App",
    "sap.m.Bar",
    "sap.m.BusyDialog",
    "sap.m.BusyIndicator",
    "sap.m.Button",
    "sap.m.Carousel",
    "sap.m.CheckBox",
    "sap.m.CustomListItem",
    "sap.m.Dialog",
    "sap.m.DisplayListItem",
    "sap.m.FlexBox",
    "sap.m.HBox",
    "sap.m.Image",
    "sap.m.Input",
    "sap.m.InputListItem",
    "sap.m.Label",
    "sap.m.List",
    "sap.m.ListItemBase",
    "sap.m.NavContainer",
    "sap.m.Page",
    "sap.m.Popover",
    "sap.m.RadioButton",
    "sap.m.ScrollContainer",
    "sap.m.SearchField",
    "sap.m.SegmentedButton",
    "sap.m.Select",
    "sap.m.Slider",
    "sap.m.SplitView",
    "sap.m.StandardListItem",
    "sap.m.Switch",
    "sap.m.Text",
    "sap.m.VBox"
  ],
  elements: [
    "sap.m.FlexItemData"
  ],
  version: "1.9.0-SNAPSHOT"});

/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 * 
 * (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

/* ----------------------------------------------------------------------------------
 * Hint: This is a derived (generated) file. Changes should be done in the underlying 
 * source files only (*.type, *.js) or they will be lost after the next generation.
 * ---------------------------------------------------------------------------------- */

// Provides enumeration sap.m.ButtonType.
jQuery.sap.declare("sap.m.ButtonType");

/**
 * @class Different types for a button (predefined types)
 *
 * @version 1.9.0-SNAPSHOT
 * @static
 * @public
 */
sap.m.ButtonType = {
  
    /**
     * default type (no special styling) 
     * @public
     */
    Default : "Default",

    /**
     * back type (back navigation button for header) 
     * @public
     */
    Back : "Back",

    /**
     * accept type (blue button) 
     * @public
     */
    Accept : "Accept",

    /**
     * reject style (red button) 
     * @public
     */
    Reject : "Reject",

    /**
     * transparent type 
     * @public
     */
    Transparent : "Transparent",

    /**
     * up type (up navigation button for header) 
     * @public
     */
    Up : "Up",

    /**
     * Unstyled type (no styling) 
     * @public
     */
    Unstyled : "Unstyled"

  };
  
/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 * 
 * (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

/* ----------------------------------------------------------------------------------
 * Hint: This is a derived (generated) file. Changes should be done in the underlying 
 * source files only (*.type, *.js) or they will be lost after the next generation.
 * ---------------------------------------------------------------------------------- */

// Provides enumeration sap.m.FlexAlignContent.
jQuery.sap.declare("sap.m.FlexAlignContent");

/**
 * @class Available options for the layout of elements along the cross axis for multi-line flexbox layouts.
 *
 * @version 1.9.0-SNAPSHOT
 * @static
 * @public
 */
sap.m.FlexAlignContent = {
  
    /**
     * Lines are packed toward the start of the flex box. 
     * @public
     */
    Start : "Start",

    /**
     * Lines are packed toward the end of the flex box. 
     * @public
     */
    End : "End",

    /**
     * Lines are packed toward the center of the flex box. 
     * @public
     */
    Center : "Center",

    /**
     * Lines are evenly distributed in the flex box. 
     * @public
     */
    SpaceBetween : "SpaceBetween",

    /**
     * Lines are evenly distributed in the flex box, with half-size spaces on either end. 
     * @public
     */
    SpaceAround : "SpaceAround",

    /**
     * Lines stretch to take up the remaining space. 
     * @public
     */
    Stretch : "Stretch",

    /**
     * Inherits the value from its parent. 
     * @public
     */
    Inherit : "Inherit"

  };
  
/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 * 
 * (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

/* ----------------------------------------------------------------------------------
 * Hint: This is a derived (generated) file. Changes should be done in the underlying 
 * source files only (*.type, *.js) or they will be lost after the next generation.
 * ---------------------------------------------------------------------------------- */

// Provides enumeration sap.m.FlexAlignItems.
jQuery.sap.declare("sap.m.FlexAlignItems");

/**
 * @class Available options for the layout of all elements along the cross axis of the flexbox layout.
 *
 * @version 1.9.0-SNAPSHOT
 * @static
 * @public
 */
sap.m.FlexAlignItems = {
  
    /**
     * The cross-start margin edges of the box items are placed flush with the cross-start edge of the line. 
     * @public
     */
    Start : "Start",

    /**
     * The cross-start margin edges of the box items are placed flush with the cross-end edge of the line. 
     * @public
     */
    End : "End",

    /**
     * The box items' margin boxes are centered in the cross axis within the line. 
     * @public
     */
    Center : "Center",

    /**
     * If the box items' inline axes are the same as the cross axis, this value is identical to ?start?. Otherwise, it participates in baseline alignment: all participating box items on the line are aligned such that their baselines align, and the item with the largest distance between its baseline and its cross-start margin edge is placed flush against the cross-start edge of the line. 
     * @public
     */
    Baseline : "Baseline",

    /**
     * Make the cross size of the items' margin boxes as close to the same size as the line as possible. 
     * @public
     */
    Stretch : "Stretch",

    /**
     * Inherits the value from its parent. 
     * @public
     */
    Inherit : "Inherit"

  };
  
/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 * 
 * (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

/* ----------------------------------------------------------------------------------
 * Hint: This is a derived (generated) file. Changes should be done in the underlying 
 * source files only (*.type, *.js) or they will be lost after the next generation.
 * ---------------------------------------------------------------------------------- */

// Provides enumeration sap.m.FlexAlignSelf.
jQuery.sap.declare("sap.m.FlexAlignSelf");

/**
 * @class Available options for the layout of individual elements along the cross axis of the flexbox layout overriding the default alignment.
 *
 * @version 1.9.0-SNAPSHOT
 * @static
 * @public
 */
sap.m.FlexAlignSelf = {
  
    /**
     * Takes up the value of alignItems from the parent FlexBox 
     * @public
     */
    Auto : "Auto",

    /**
     * The cross-start margin edges of the box item is placed flush with the cross-start edge of the line. 
     * @public
     */
    Start : "Start",

    /**
     * The cross-start margin edges of the box item is placed flush with the cross-end edge of the line. 
     * @public
     */
    End : "End",

    /**
     * The box item's margin box is centered in the cross axis within the line. 
     * @public
     */
    Center : "Center",

    /**
     * If the box item's inline axis is the same as the cross axis, this value is identical to ?start?. Otherwise, it participates in baseline alignment: all participating box items on the line are aligned such that their baselines align, and the item with the largest distance between its baseline and its cross-start margin edge is placed flush against the cross-start edge of the line. 
     * @public
     */
    Baseline : "Baseline",

    /**
     * Make the cross size of the item's margin box as close to the same size as the line as possible. 
     * @public
     */
    Stretch : "Stretch",

    /**
     * Inherits the value from its parent. 
     * @public
     */
    Inherit : "Inherit"

  };
  
/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 * 
 * (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

/* ----------------------------------------------------------------------------------
 * Hint: This is a derived (generated) file. Changes should be done in the underlying 
 * source files only (*.type, *.js) or they will be lost after the next generation.
 * ---------------------------------------------------------------------------------- */

// Provides enumeration sap.m.FlexDirection.
jQuery.sap.declare("sap.m.FlexDirection");

/**
 * @class Available directions for flex layouts.
 *
 * @version 1.9.0-SNAPSHOT
 * @static
 * @public
 */
sap.m.FlexDirection = {
  
    /**
     * Elements are layed out along the direction of the inline axis (text direction). 
     * @public
     */
    Row : "Row",

    /**
     * Elements are layed out along the direction of the block axis (usually top to bottom). 
     * @public
     */
    Column : "Column",

    /**
     * Elements are layed out along the reverse direction of the inline axis (against the text direction). 
     * @public
     */
    RowReverse : "RowReverse",

    /**
     * Elements are layed out along the reverse direction of the block axis (usually bottom to top). 
     * @public
     */
    ColumnReverse : "ColumnReverse",

    /**
     * Inherits the value from its parent. 
     * @public
     */
    Inherit : "Inherit"

  };
  
/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 * 
 * (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

/* ----------------------------------------------------------------------------------
 * Hint: This is a derived (generated) file. Changes should be done in the underlying 
 * source files only (*.type, *.js) or they will be lost after the next generation.
 * ---------------------------------------------------------------------------------- */

// Provides enumeration sap.m.FlexJustifyContent.
jQuery.sap.declare("sap.m.FlexJustifyContent");

/**
 * @class Available options for the layout of elements along the main axis of the flexbox layout.
 *
 * @version 1.9.0-SNAPSHOT
 * @static
 * @public
 */
sap.m.FlexJustifyContent = {
  
    /**
     * Box items are packed toward the start of the line. 
     * @public
     */
    Start : "Start",

    /**
     * Box items are packed toward the end of the line. 
     * @public
     */
    End : "End",

    /**
     * Box items are packed toward the center of the line. 
     * @public
     */
    Center : "Center",

    /**
     * Box items are evenly distributed in the line. 
     * @public
     */
    SpaceBetween : "SpaceBetween",

    /**
     * Box items are evenly distributed in the line, with half-size spaces on either end. 
     * @public
     */
    SpaceAround : "SpaceAround",

    /**
     * Inherits the value from its parent. 
     * @public
     */
    Inherit : "Inherit"

  };
  
/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 * 
 * (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

/* ----------------------------------------------------------------------------------
 * Hint: This is a derived (generated) file. Changes should be done in the underlying 
 * source files only (*.type, *.js) or they will be lost after the next generation.
 * ---------------------------------------------------------------------------------- */

// Provides enumeration sap.m.FlexRendertype.
jQuery.sap.declare("sap.m.FlexRendertype");

/**
 * @class Determines the type of HTML elements used for rendering controls.
 *
 * @version 1.9.0-SNAPSHOT
 * @static
 * @public
 */
sap.m.FlexRendertype = {
  
    /**
     * DIV elements are used for rendering 
     * @public
     */
    Div : "Div",

    /**
     * Unordered lists are used for rendering. 
     * @public
     */
    List : "List"

  };
  
/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 * 
 * (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

/* ----------------------------------------------------------------------------------
 * Hint: This is a derived (generated) file. Changes should be done in the underlying 
 * source files only (*.type, *.js) or they will be lost after the next generation.
 * ---------------------------------------------------------------------------------- */

// Provides enumeration sap.m.FlexWrap.
jQuery.sap.declare("sap.m.FlexWrap");

/**
 * @class Available wrap options for flexbox layouts
 *
 * @version 1.9.0-SNAPSHOT
 * @static
 * @public
 */
sap.m.FlexWrap = {
  
    /**
     * Items wrap in the direction of the cross-axis when space along the main axis is insufficient. Makes the flexbox container multi-line. 
     * @public
     */
    Wrap : "Wrap",

    /**
     * Items do not wrap even when space along the main axis is insufficient. Makes the flexbox container single-line. 
     * @public
     */
    Nowrap : "Nowrap",

    /**
     * Items wrap in the reverse direction of the cross-axis when space along the main axis is insufficient. Makes the flexbox container multi-line. 
     * @public
     */
    WrapReverse : "WrapReverse",

    /**
     * Inherits the value from its parent. 
     * @public
     */
    Inherit : "Inherit"

  };
  
/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 * 
 * (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

/* ----------------------------------------------------------------------------------
 * Hint: This is a derived (generated) file. Changes should be done in the underlying 
 * source files only (*.type, *.js) or they will be lost after the next generation.
 * ---------------------------------------------------------------------------------- */

// Provides enumeration sap.m.InputType.
jQuery.sap.declare("sap.m.InputType");

/**
 * @class A subset of input types that fit to a simple API returning one string.
 * Not available on purpose: button, checkbox, hidden, image, password, radio, range, reset, search, submit.
 *
 * @version 1.9.0-SNAPSHOT
 * @static
 * @public
 */
sap.m.InputType = {
  
    /**
     * default (text) 
     * @public
     */
    Text : "Text",

    /**
     * An input control for specifying a date value. The user can select a month, day of the month, and year. 
     * @public
     */
    Date : "Date",

    /**
     * An input control for specifying a date and time value. The user can select a month, day of the month, year, and time of day. 
     * @public
     */
    Datetime : "Datetime",

    /**
     * An input control for specifying a date and time value where the format depends on the locale. 
     * @public
     */
    DatetimeLocal : "DatetimeLocal",

    /**
     * A text field for specifying an email address. Brings up a keyboard optimized for email address entry. 
     * @public
     */
    Email : "Email",

    /**
     * An input control for selecting a month. 
     * @public
     */
    Month : "Month",

    /**
     * A text field for specifying a number. Brings up a number pad keyboard. Specifying an input type of \d* or [0-9]* is equivalent to using this type. 
     * @public
     */
    Number : "Number",

    /**
     * A text field for specifying a phone number. Brings up a phone pad keyboard. 
     * @public
     */
    Tel : "Tel",

    /**
     * An input control for specifying a time value. The user can select the hour, minute, and optionally AM or PM. 
     * @public
     */
    Time : "Time",

    /**
     * A text field for specifying a URL. Brings up a keyboard optimized for URL entry. 
     * @public
     */
    Url : "Url",

    /**
     * An input control for selecting a week. 
     * @public
     */
    Week : "Week",

    /**
     * Password input where the user entry cannot be seen. 
     * @public
     */
    Password : "Password"

  };
  
/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 * 
 * (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

/* ----------------------------------------------------------------------------------
 * Hint: This is a derived (generated) file. Changes should be done in the underlying 
 * source files only (*.type, *.js) or they will be lost after the next generation.
 * ---------------------------------------------------------------------------------- */

// Provides enumeration sap.m.LabelDesign.
jQuery.sap.declare("sap.m.LabelDesign");

/**
 * @class Available label display modes.
 *
 * @version 1.9.0-SNAPSHOT
 * @static
 * @public
 */
sap.m.LabelDesign = {
  
    /**
     * Displays the label in bold. 
     * @public
     */
    Bold : "Bold",

    /**
     * Displays the label in normal mode. 
     * @public
     */
    Standard : "Standard"

  };
  
/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 * 
 * (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

/* ----------------------------------------------------------------------------------
 * Hint: This is a derived (generated) file. Changes should be done in the underlying 
 * source files only (*.type, *.js) or they will be lost after the next generation.
 * ---------------------------------------------------------------------------------- */

// Provides enumeration sap.m.ListMode.
jQuery.sap.declare("sap.m.ListMode");

/**
 * @class Different modes for the list selection (predefined modes)
 *
 * @version 1.9.0-SNAPSHOT
 * @static
 * @public
 */
sap.m.ListMode = {
  
    /**
     * default mode (no selection) 
     * @public
     */
    None : "None",

    /**
     * single selection mode (only one list item can be selected) 
     * @public
     */
    SingleSelect : "SingleSelect",

    /**
     * multi selection mode (whole list item including checkbox will be selected) 
     * @public
     */
    MultiSelect : "MultiSelect",

    /**
     * delete mode (only one list item can be deleted) 
     * @public
     */
    Delete : "Delete"

  };
  
/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 * 
 * (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

/* ----------------------------------------------------------------------------------
 * Hint: This is a derived (generated) file. Changes should be done in the underlying 
 * source files only (*.type, *.js) or they will be lost after the next generation.
 * ---------------------------------------------------------------------------------- */

// Provides enumeration sap.m.ListType.
jQuery.sap.declare("sap.m.ListType");

/**
 * @class List types
 *
 * @version 1.9.0-SNAPSHOT
 * @static
 * @public
 */
sap.m.ListType = {
  
    /**
     * Inactive 
     * @public
     */
    Inactive : "Inactive",

    /**
     * Detail 
     * @public
     */
    Detail : "Detail",

    /**
     * Navigation 
     * @public
     */
    Navigation : "Navigation",

    /**
     * Active 
     * @public
     */
    Active : "Active",

    /**
     * DetailAndActive 
     * @public
     */
    DetailAndActive : "DetailAndActive"

  };
  
/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 * 
 * (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

/* ----------------------------------------------------------------------------------
 * Hint: This is a derived (generated) file. Changes should be done in the underlying 
 * source files only (*.type, *.js) or they will be lost after the next generation.
 * ---------------------------------------------------------------------------------- */

// Provides enumeration sap.m.PageBackgroundDesign.
jQuery.sap.declare("sap.m.PageBackgroundDesign");

/**
 * @class Available Page Background Design.
 *
 * @version 1.9.0-SNAPSHOT
 * @static
 * @public
 */
sap.m.PageBackgroundDesign = {
  
    /**
     * Standard Page background color. 
     * @public
     */
    Standard : "Standard",

    /**
     * Page background color when a List is set as the Page content. 
     * @public
     */
    List : "List"

  };
  
/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 * 
 * (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

/* ----------------------------------------------------------------------------------
 * Hint: This is a derived (generated) file. Changes should be done in the underlying 
 * source files only (*.type, *.js) or they will be lost after the next generation.
 * ---------------------------------------------------------------------------------- */

// Provides enumeration sap.m.PlacementType.
jQuery.sap.declare("sap.m.PlacementType");

/**
 * @class Types for the placement of popover control.
 *
 * @version 1.9.0-SNAPSHOT
 * @static
 * @public
 */
sap.m.PlacementType = {
  
    /**
     * Popover will be placed at the left side of the reference control. 
     * @public
     */
    Left : "Left",

    /**
     * Popover will be placed at the right side of the reference control. 
     * @public
     */
    Right : "Right",

    /**
     * Popover will be placed at the top of the reference control. 
     * @public
     */
    Top : "Top",

    /**
     * Popover will be placed at the bottom of the reference control. 
     * @public
     */
    Bottom : "Bottom"

  };
  

// -----------------------------------------------------------------------------
// Begin of Library Initialization coding, copied from shared.js
// -----------------------------------------------------------------------------

/*global Element: true */

/*!
 * @copyright@
 */

jQuery.sap.require("jquery.sap.mobile"); // In case the Core decides to throw it out... This module shall always be available when using the mobile lib.

// central mobile functionality that should not go into the UI5 Core can go here

jQuery.sap._touchToMouseEvent = false;

/**
 * Touch helper.
 *
 * @namespace
 * @name sap.m.touch
 * @protected
 **/

if (sap.m && !sap.m.touch) {
	sap.m.touch = {};
}

/**
 * Given a list of touch objects, find the touch that matches the given one.
 *
 * @param {TouchList} oTouchList The list of touch objects to search. Info https://developer.mozilla.org/en-US/docs/DOM/TouchList
 * @param {Touch|number} oTouch A touch object to find or a Touch.identifier that uniquely identifies the current finger in the touch session.
 * @return {object|undefined} The touch matching if any.
 * @protected
*/
sap.m.touch.find = function(oTouchList, oTouch) {
	var i;

	if (!(oTouchList instanceof Object)) {
		jQuery.sap.assert(false, 'sap.m.touch.find(): oTouchList must be a touch list object');
		return;
	}

	if (oTouch instanceof Object && typeof oTouch.identifier !== "undefined") {
		oTouch = oTouch.identifier;
	} else if (typeof oTouch !== "number") {
		jQuery.sap.assert(false, 'sap.m.touch.find(): oTouch must be a touch object or a number');
		return;
	}

	// A TouchList is an object not an array, so we shouldn't use
	// Array.prototype.forEach, etc.
	for (i = 0; i < oTouchList.length; i++) {
		if (oTouchList[i].identifier === oTouch) {
			return oTouchList[i];
		}
	}

	// if the given touch object or touch identifier is not found in the touches list, then return undefined
};

/**
 * Given a list of touches, count the number of touches related with the given element.
 *
 * @param {TouchList} oTouchList The list of touch objects to search.
 * @param {jQuery|Element|string} vElement A jQuery element or an element reference or an element id.
 * @return {number} The number of touches related with the given element.
 * @protected
*/
sap.m.touch.countContained = function(oTouchList, vElement) {
	var i,
		iTouchCount = 0,
		iElementChildrenL,
		$TouchTarget;

	if (!(oTouchList instanceof Object)) {
		jQuery.sap.assert(false, 'sap.m.touch.countContained(): oTouchList must be a TouchList object');
		return;
	}

	if (vElement instanceof Element) {
		vElement = jQuery(vElement);
	} else if (typeof vElement === "string") {
		vElement = jQuery.sap.byId(vElement);
	} else if (!(vElement instanceof jQuery)) {
		jQuery.sap.assert(false, 'sap.m.touch.countContained(): vElement must be a jQuery object or Element reference or a string');
		return;
	}

	iElementChildrenL = vElement.children().length;

	// A TouchList is an object not an array, so we shouldn't use
	// Array.prototype.forEach, etc.
	for (i = 0; i < oTouchList.length; i++) {
		$TouchTarget = jQuery(oTouchList[i].target);

		//	If the current target have only one HTML element or
		//	have a HTML element antecessor that match with the given element id.
		if ((iElementChildrenL === 0  && $TouchTarget.is(vElement)) ||
			($TouchTarget.closest(vElement).length === 1)) {

			iTouchCount++;
		}
	}

	return iTouchCount;
};