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
 * Initialization Code and shared classes of library sap.ui.core (1.9.0-SNAPSHOT)
 */
jQuery.sap.declare("sap.ui.core.library");
jQuery.sap.require("sap.ui.core.Core");
/**
 * The SAPUI5 Core Runtime. 
 *   
 *   Contains the UI5 jQuery plugin (jQuery.sap.*), the Core and all its components, 
 *   base classes for Controls and the Model View Controller components.
 *
 * @namespace
 * @name sap.ui.core
 * @public
 */


// delegate further initialization of this library to the Core
sap.ui.getCore().initLibrary({
  name : "sap.ui.core",
  types: [
    "sap.ui.core.AccessibleRole",
    "sap.ui.core.BarColor",
    "sap.ui.core.CSSSize",
    "sap.ui.core.Collision",
    "sap.ui.core.Design",
    "sap.ui.core.Dock",
    "sap.ui.core.HorizontalAlign",
    "sap.ui.core.ID",
    "sap.ui.core.ImeMode",
    "sap.ui.core.MessageType",
    "sap.ui.core.OpenState",
    "sap.ui.core.ScrollBarAction",
    "sap.ui.core.Scrolling",
    "sap.ui.core.TextAlign",
    "sap.ui.core.TextDirection",
    "sap.ui.core.URI",
    "sap.ui.core.ValueState",
    "sap.ui.core.VerticalAlign",
    "sap.ui.core.Wrapping",
    "any",
    "boolean",
    "float",
    "int",
    "sap.ui.core.mvc.ViewType",
    "object",
    "string",
    "void"
  ],
  interfaces: [],
  controls: [
    "sap.ui.core.Control",
    "sap.ui.core.HTML",
    "sap.ui.core.ScrollBar",
    "sap.ui.core.TooltipBase",
    "sap.ui.core.mvc.JSONView",
    "sap.ui.core.mvc.JSView",
    "sap.ui.core.mvc.View",
    "sap.ui.core.mvc.XMLView"
  ],
  elements: [
    "sap.ui.core.CustomData",
    "sap.ui.core.Element",
    "sap.ui.core.Item",
    "sap.ui.core.LayoutData",
    "sap.ui.core.ListItem",
    "sap.ui.core.Message",
    "sap.ui.core.SeparatorItem",
    "sap.ui.core.search.OpenSearchProvider",
    "sap.ui.core.search.SearchProvider"
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

// Provides enumeration sap.ui.core.AccessibleRole.
jQuery.sap.declare("sap.ui.core.AccessibleRole");

/**
 * @class Defines the accessible roles for ARIA support. This enumeration is used with the AccessibleRole control property.
 * For more information, goto "Roles for Accessible Rich Internet Applications (WAI-ARIA Roles)" at the www.w3.org homepage.
 * 
 *
 * @version 1.9.0-SNAPSHOT
 * @static
 * @public
 */
sap.ui.core.AccessibleRole = {
  
    /**
     * No explicit role is applicable. An AccessibleName should be specified for the control.
     *  
     * @public
     */
    None : "None",

    /**
     * A message with an alert or error information.
     *  
     * @public
     */
    Alert : "Alert",

    /**
     * A separate window with an alert or error information.
     *  
     * @public
     */
    AlertDialog : "AlertDialog",

    /**
     * A software unit executing a set of tasks for the user. 
     * @public
     */
    Application : "Application",

    /**
     * Usually defined as the advertisement at the top of a web page.
     * The banner content typically contains the site or company logo, or other key advertisements.
     *  
     * @public
     */
    Banner : "Banner",

    /**
     * Allows user-triggered actions.
     *  
     * @public
     */
    Button : "Button",

    /**
     * A control that has three possible values: true, false, mixed. 
     * @public
     */
    Checkbox : "Checkbox",

    /**
     * A table cell containing header information for a column. 
     * @public
     */
    ColumnHeader : "ColumnHeader",

    /**
     * Allows selecting an item from a list, or to enter data directly in the input field. 
     * @public
     */
    Combobox : "Combobox",

    /**
     * Information about the content on the page. Examples are footnotes, copyrights, or links to privacy statements.
     *  
     * @public
     */
    ContentInfo : "ContentInfo",

    /**
     * The content of the associated element represents a definition.
     * If there is a definition element within the content, this one represents the term being defined.
     *  
     * @public
     */
    Definition : "Definition",

    /**
     * Descriptive content for a page element. 
     * @public
     */
    Description : "Description",

    /**
     * A small window that is designed to interrupt the current application processing
     * in order to inform the user and to get some response. 
     * @public
     */
    Dialog : "Dialog",

    /**
     * A list of references to members of a single group.
     *  
     * @public
     */
    Directory : "Directory",

    /**
     * Content that contains related information, such as a book. 
     * @public
     */
    Document : "Document",

    /**
     * Contains cells of tabular data arranged in rows and columns, for example in a table. 
     * @public
     */
    Grid : "Grid",

    /**
     * A table cell in a grid where the cells can be active, editable, and selectable.
     * Cells may have functional relationships to controls, for example. 
     * @public
     */
    GridCell : "GridCell",

    /**
     * A section of user interface objects. 
     * @public
     */
    Group : "Group",

    /**
     * A heading for a section of the page. 
     * @public
     */
    Heading : "Heading",

    /**
     * A container for a collection of elements that form an image. 
     * @public
     */
    Img : "Img",

    /**
     * An interactive reference to a resource. 
     * @public
     */
    Link : "Link",

    /**
     * A container for non-interactive list items which are the children of the list. 
     * @public
     */
    List : "List",

    /**
     * A widget that allows the user to select one or more items from a list.
     * The items within the list are static and can contain images. 
     * @public
     */
    Listbox : "Listbox",

    /**
     * A single item in a list. 
     * @public
     */
    ListItem : "ListItem",

    /**
     * An area where new information is added, or old information disappears.
     * Information types are chat logs, messaging, or error logs, for example.
     * The log contains a sequence: New information is always added to the end of the log. 
     * @public
     */
    Log : "Log",

    /**
     * Defines the main content of a document.
     *  
     * @public
     */
    Main : "Main",

    /**
     * Is used to scroll text across the page.
     *  
     * @public
     */
    Marquee : "Marquee",

    /**
     * Offers a list of choices to the user.
     *  
     * @public
     */
    Menu : "Menu",

    /**
     * A container for menu items where each item may activate a submenu.
     *  
     * @public
     */
    Menubar : "Menubar",

    /**
     * A child in a menu. 
     * @public
     */
    MenuItem : "MenuItem",

    /**
     * A checkable menu item (tri-state). 
     * @public
     */
    MenuItemCheckbox : "MenuItemCheckbox",

    /**
     * A menu item which is part of a group of menuitemradio roles. 
     * @public
     */
    MenuItemRadio : "MenuItemRadio",

    /**
     * A collection of links suitable for use when navigating the document or related documents. 
     * @public
     */
    Navigation : "Navigation",

    /**
     * The content is parenthetic or ancillary to the main content of the resource. 
     * @public
     */
    Note : "Note",

    /**
     * A selectable item in a list represented by a select.
     *  
     * @public
     */
    Option : "Option",

    /**
     * An element whose role is presentational does not need to be mapped to the accessibility API. 
     * @public
     */
    Presentation : "Presentation",

    /**
     * Shows the execution progress in applications providing functions that take a long time. 
     * @public
     */
    ProgressBar : "ProgressBar",

    /**
     * An option in single-select list. Only one radio control in a radiogroup can be selected at the same time.
     *  
     * @public
     */
    Radio : "Radio",

    /**
     * A group of radio controls. 
     * @public
     */
    RadioGroup : "RadioGroup",

    /**
     * A large section on the web page. 
     * @public
     */
    Region : "Region",

    /**
     * A row of table cells. 
     * @public
     */
    Row : "Row",

    /**
     * A table cell containing header information for a row. 
     * @public
     */
    RowHeader : "RowHeader",

    /**
     * A search section of a web document. In many cases, this is a form used to submit search requests about the site,
     * or a more general Internet wide search service. 
     * @public
     */
    Search : "Search",

    /**
     * A unique section of the document. In the case of a portal, this may include time display, weather forecast,
     * or stock price. 
     * @public
     */
    Secondary : "Secondary",

    /**
     * Indicates that the element contains content that is related to the main content of the page. 
     * @public
     */
    SeeAlso : "SeeAlso",

    /**
     * A line or bar that separates sections of content. 
     * @public
     */
    Separator : "Separator",

    /**
     * A user input where the user selects an input in a given range. This form of range expects an analogous keyboard
     * interface. 
     * @public
     */
    Slider : "Slider",

    /**
     * Allows users to select a value from a list of given entries where exactly one value is displayed at runtime, and
     * the other ones can be displayed by scrolling using the arrow up and arrow down key.
     *  
     * @public
     */
    SpinButton : "SpinButton",

    /**
     * A container for processing advisory information. 
     * @public
     */
    Status : "Status",

    /**
     * A header for a tab panel. 
     * @public
     */
    Tab : "Tab",

    /**
     * A list of tabs which are references to tab panels.
     *  
     * @public
     */
    Tablist : "Tablist",

    /**
     * A container for the resources associated with a tab. 
     * @public
     */
    Tabpanel : "Tabpanel",

    /**
     * Inputs that allow free-form text as their value. 
     * @public
     */
    Textbox : "Textbox",

    /**
     * A numerical counter which indicates an amount of elapsed time from a start point,
     * or of the time remaining until a certain end point. 
     * @public
     */
    Timer : "Timer",

    /**
     * A collection of commonly used functions represented in compact visual form. 
     * @public
     */
    Toolbar : "Toolbar",

    /**
     * A popup that displays a description for an element when the user passes over or rests on that element.
     * Supplement to the normal tooltip processing of the user agent.
     *  
     * @public
     */
    Tooltip : "Tooltip",

    /**
     * A form of a list (tree) having groups (subtrees) inside groups (subtrees), where the sub trees can be collapsed and expanded.
     *  
     * @public
     */
    Tree : "Tree",

    /**
     * A grid whose rows are expandable and collapsable in the same manner as the ones of trees. 
     * @public
     */
    TreeGrid : "TreeGrid",

    /**
     * A tree node 
     * @public
     */
    TreeItem : "TreeItem"

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

// Provides enumeration sap.ui.core.BarColor.
jQuery.sap.declare("sap.ui.core.BarColor");

/**
 * @class Configuration options for the colors of a progress bar
 *
 * @version 1.9.0-SNAPSHOT
 * @static
 * @public
 */
sap.ui.core.BarColor = {
  
    /**
     * Color: blue (#b8d0e8) 
     * @public
     */
    NEUTRAL : "NEUTRAL",

    /**
     * Color: green (#b5e7a8) 
     * @public
     */
    POSITIVE : "POSITIVE",

    /**
     * Color: yellow (#faf2b0) 
     * @public
     */
    CRITICAL : "CRITICAL",

    /**
     * Color: red (#ff9a90) 
     * @public
     */
    NEGATIVE : "NEGATIVE"

  };
  
/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 * 
 * (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

/* -----------------------------------------------------------------------------------
 * Hint: This is a derived (generated) file. Changes should be done in the underlying
 * source files only (*.type, *.js) or they will be lost after the next generation.
 * ----------------------------------------------------------------------------------- */

// Provides data type sap.ui.core.CSSSize
jQuery.sap.declare('sap.ui.core.CSSSize');
jQuery.sap.require('sap.ui.base.DataType');

/**
 * @class A string type that represents CSS size values.
 *
 * @static
 * @public
 */
sap.ui.core.CSSSize = sap.ui.base.DataType.createType('sap.ui.core.CSSSize', {
    isValid : function(vValue) {
      return /^(auto|[-+]?(0*|([0-9]+|[0-9]*\.[0-9]+)([eE][mM]|[eE][xX]|[pP][xX]|[cC][mM]|[mM][mM]|[iI][nN]|[pP][tT]|[pP][cC]|%)))$/.test(vValue);
    }

  },
  sap.ui.base.DataType.getType('string')
);

/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 * 
 * (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

/* -----------------------------------------------------------------------------------
 * Hint: This is a derived (generated) file. Changes should be done in the underlying
 * source files only (*.type, *.js) or they will be lost after the next generation.
 * ----------------------------------------------------------------------------------- */

// Provides data type sap.ui.core.Collision
jQuery.sap.declare('sap.ui.core.Collision');
jQuery.sap.require('sap.ui.base.DataType');

/**
 * @class Collision behavior: horizontal/vertical.
 * Defines how the position of an element should be adjusted in case it overflows the window in some direction. For both
 * directions this can be "flip", "fit" or "none". If only one behavior is provided it is applied to both directions.
 * Examples: "flip", "fit none".
 *
 * @static
 * @public
 */
sap.ui.core.Collision = sap.ui.base.DataType.createType('sap.ui.core.Collision', {
    isValid : function(vValue) {
      return /^((flip|fit|none)( (flip|fit|none))?)$/.test(vValue);
    }

  },
  sap.ui.base.DataType.getType('string')
);

/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 * 
 * (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

/* ----------------------------------------------------------------------------------
 * Hint: This is a derived (generated) file. Changes should be done in the underlying 
 * source files only (*.type, *.js) or they will be lost after the next generation.
 * ---------------------------------------------------------------------------------- */

// Provides enumeration sap.ui.core.Design.
jQuery.sap.declare("sap.ui.core.Design");

/**
 * @class Font design for texts
 *
 * @version 1.9.0-SNAPSHOT
 * @static
 * @public
 */
sap.ui.core.Design = {
  
    /**
     * Standard font 
     * @public
     */
    Standard : "Standard",

    /**
     * Mono space font 
     * @public
     */
    Monospace : "Monospace"

  };
  
/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 * 
 * (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

/* -----------------------------------------------------------------------------------
 * Hint: This is a derived (generated) file. Changes should be done in the underlying
 * source files only (*.type, *.js) or they will be lost after the next generation.
 * ----------------------------------------------------------------------------------- */

// Provides data type sap.ui.core.Dock
jQuery.sap.declare('sap.ui.core.Dock');
jQuery.sap.require('sap.ui.base.DataType');

/**
 * @class Docking position: horizontal/vertical.
 * Defines a position on the element which is used for aligned positioning of another element (e.g. the left top 
 * corner of a popup is positioned at the left bottom corner of the input field). For the horizontal position possible values 
 * are "begin", "left", "center", "right" and "end", where left/right always are left and right, or begin/end which are 
 * dependent on the text direction. For the vertical position possible values are "top", "center" and "bottom".
 * Examples: "left top", "end bottom", "center center".
 *
 * @static
 * @public
 */
sap.ui.core.Dock = sap.ui.base.DataType.createType('sap.ui.core.Dock', {
    isValid : function(vValue) {
      return /^((begin|left|center|right|end) (top|center|bottom))$/.test(vValue);
    }

  },
  sap.ui.base.DataType.getType('string')
);

/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 * 
 * (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

/* ----------------------------------------------------------------------------------
 * Hint: This is a derived (generated) file. Changes should be done in the underlying 
 * source files only (*.type, *.js) or they will be lost after the next generation.
 * ---------------------------------------------------------------------------------- */

// Provides enumeration sap.ui.core.HorizontalAlign.
jQuery.sap.declare("sap.ui.core.HorizontalAlign");

/**
 * @class Configuration options for horizontal alignments of controls
 *
 * @version 1.9.0-SNAPSHOT
 * @static
 * @public
 */
sap.ui.core.HorizontalAlign = {
  
    /**
     * Locale-specific positioning at the beginning of the line 
     * @public
     */
    Begin : "Begin",

    /**
     * Locale-specific positioning at the end of the line 
     * @public
     */
    End : "End",

    /**
     * Hard option for left alignment 
     * @public
     */
    Left : "Left",

    /**
     * Hard option for right alignment 
     * @public
     */
    Right : "Right",

    /**
     * Centered alignment of text 
     * @public
     */
    Center : "Center"

  };
  
/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 * 
 * (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

/* -----------------------------------------------------------------------------------
 * Hint: This is a derived (generated) file. Changes should be done in the underlying
 * source files only (*.type, *.js) or they will be lost after the next generation.
 * ----------------------------------------------------------------------------------- */

// Provides data type sap.ui.core.ID
jQuery.sap.declare('sap.ui.core.ID');
jQuery.sap.require('sap.ui.base.DataType');

/**
 * @class A string type representing an Id or a name.
 *
 * @static
 * @public
 */
sap.ui.core.ID = sap.ui.base.DataType.createType('sap.ui.core.ID', {
    isValid : function(vValue) {
      return /^([A-Za-z_][-A-Za-z0-9_.:]*)$/.test(vValue);
    }

  },
  sap.ui.base.DataType.getType('string')
);

/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 * 
 * (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

/* ----------------------------------------------------------------------------------
 * Hint: This is a derived (generated) file. Changes should be done in the underlying 
 * source files only (*.type, *.js) or they will be lost after the next generation.
 * ---------------------------------------------------------------------------------- */

// Provides enumeration sap.ui.core.ImeMode.
jQuery.sap.declare("sap.ui.core.ImeMode");

/**
 * @class State of the Input Method Editor (IME) for the control. Depending on its value, it allows users to enter and edit for example Chinese characters.
 *
 * @version 1.9.0-SNAPSHOT
 * @static
 * @public
 */
sap.ui.core.ImeMode = {
  
    /**
     * The value is automatically computed by the user agent. 
     * @public
     */
    Auto : "Auto",

    /**
     * IME is used for entering characters. 
     * @public
     */
    Active : "Active",

    /**
     * IME is not used for entering characters. 
     * @public
     */
    Inactive : "Inactive",

    /**
     * IME is disabled. 
     * @public
     */
    Disabled : "Disabled"

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

// Provides enumeration sap.ui.core.MessageType.
jQuery.sap.declare("sap.ui.core.MessageType");

/**
 * @class Defines the different message types of a message
 *
 * @version 1.9.0-SNAPSHOT
 * @static
 * @public
 */
sap.ui.core.MessageType = {
  
    /**
     * Message should be just an information 
     * @public
     */
    Information : "Information",

    /**
     * Message is a warning 
     * @public
     */
    Warning : "Warning",

    /**
     * Message is an error 
     * @public
     */
    Error : "Error",

    /**
     * Message has no specific level 
     * @public
     */
    None : "None",

    /**
     * Message is an success message 
     * @public
     */
    Success : "Success"

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

// Provides enumeration sap.ui.core.OpenState.
jQuery.sap.declare("sap.ui.core.OpenState");

/**
 * @class Defines the different possible states of an element that can be open or closed and does not only toggle between these states, but also spends some time in between (e.g. because of an animation).
 *
 * @version 1.9.0-SNAPSHOT
 * @static
 * @public
 */
sap.ui.core.OpenState = {
  
    /**
     * Open and currently not changing states. 
     * @public
     */
    OPEN : "OPEN",

    /**
     * Closed and currently not changing states. 
     * @public
     */
    CLOSED : "CLOSED",

    /**
     * Already left the CLOSED state, is not OPEN yet, but in the process of getting OPEN. 
     * @public
     */
    OPENING : "OPENING",

    /**
     * Still open, but in the process of going to the CLOSED state. 
     * @public
     */
    CLOSING : "CLOSING"

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

// Provides enumeration sap.ui.core.ScrollBarAction.
jQuery.sap.declare("sap.ui.core.ScrollBarAction");

/**
 * @class Actions are: Click on track, button, drag of thumb, or mouse wheel click
 *
 * @version 1.9.0-SNAPSHOT
 * @static
 * @public
 */
sap.ui.core.ScrollBarAction = {
  
    /**
     * Single step scrolling caused by clicking an arrow button or arrow key. 
     * @public
     */
    Step : "Step",

    /**
     * Range scrolling caused by clicking track area or using page up or page down key. 
     * @public
     */
    Page : "Page",

    /**
     * Scrolling done by mouse wheel 
     * @public
     */
    MouseWheel : "MouseWheel",

    /**
     * Scrolling done by dragging the scroll bar's paint thumb 
     * @public
     */
    Drag : "Drag"

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

// Provides enumeration sap.ui.core.Scrolling.
jQuery.sap.declare("sap.ui.core.Scrolling");

/**
 * @class Defines the possible values for horizontal and vertical scrolling behavior.
 *
 * @version 1.9.0-SNAPSHOT
 * @static
 * @public
 */
sap.ui.core.Scrolling = {
  
    /**
     * No scroll bar provided even if the content is larger than the available space. 
     * @public
     */
    None : "None",

    /**
     * A scroll bar is shown if the content requires more space than the given space (rectangle) provides. 
     * @public
     */
    Auto : "Auto",

    /**
     * A scroll bar is always shown even if the space is large enough for the current content. 
     * @public
     */
    Scroll : "Scroll",

    /**
     * No scroll bar is shown, and the content stays in the given rectangle. 
     * @public
     */
    Hidden : "Hidden"

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

// Provides enumeration sap.ui.core.TextAlign.
jQuery.sap.declare("sap.ui.core.TextAlign");

/**
 * @class Configuration options for text alignments.
 *
 * @version 1.9.0-SNAPSHOT
 * @static
 * @public
 */
sap.ui.core.TextAlign = {
  
    /**
     * Locale-specific positioning at the beginning of the line. 
     * @public
     */
    Begin : "Begin",

    /**
     * Locale-specific positioning at the end of the line. 
     * @public
     */
    End : "End",

    /**
     * Hard option for left alignment. 
     * @public
     */
    Left : "Left",

    /**
     * Hard option for right alignment. 
     * @public
     */
    Right : "Right",

    /**
     * Centered text alignment. 
     * @public
     */
    Center : "Center"

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

// Provides enumeration sap.ui.core.TextDirection.
jQuery.sap.declare("sap.ui.core.TextDirection");

/**
 * @class Configuration options for the direction of texts.
 *
 * @version 1.9.0-SNAPSHOT
 * @static
 * @public
 */
sap.ui.core.TextDirection = {
  
    /**
     * Specifies left-to-right text direction. 
     * @public
     */
    LTR : "LTR",

    /**
     * Specifies right-to-left text direction. 
     * @public
     */
    RTL : "RTL",

    /**
     * Inherits the direction from its parent control/container. 
     * @public
     */
    Inherit : "Inherit"

  };
  
/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 * 
 * (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

/* -----------------------------------------------------------------------------------
 * Hint: This is a derived (generated) file. Changes should be done in the underlying
 * source files only (*.type, *.js) or they will be lost after the next generation.
 * ----------------------------------------------------------------------------------- */

// Provides data type sap.ui.core.URI
jQuery.sap.declare('sap.ui.core.URI');
jQuery.sap.require('sap.ui.base.DataType');

/**
 * @class A string type that represents an RFC 3986 conformant URI.
 *
 * @static
 * @public
 */
sap.ui.core.URI = sap.ui.base.DataType.createType('sap.ui.core.URI', {
    isValid : function(vValue) {
      return /^((([^:\/?#]+):)?(\/\/([^\/?#]*))?([^?#]*)(\?([^#]*))?(#(.*))?)$/.test(vValue);
    }

  },
  sap.ui.base.DataType.getType('string')
);

/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 * 
 * (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

/* ----------------------------------------------------------------------------------
 * Hint: This is a derived (generated) file. Changes should be done in the underlying 
 * source files only (*.type, *.js) or they will be lost after the next generation.
 * ---------------------------------------------------------------------------------- */

// Provides enumeration sap.ui.core.ValueState.
jQuery.sap.declare("sap.ui.core.ValueState");

/**
 * @class Marker for the correctness of the current value.
 *
 * @version 1.9.0-SNAPSHOT
 * @static
 * @public
 */
sap.ui.core.ValueState = {
  
    /**
     * State is not valid. 
     * @public
     */
    Error : "Error",

    /**
     * State is valid but with a warning. 
     * @public
     */
    Warning : "Warning",

    /**
     * State is valid. 
     * @public
     */
    Success : "Success",

    /**
     * State is not specified. 
     * @public
     */
    None : "None"

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

// Provides enumeration sap.ui.core.VerticalAlign.
jQuery.sap.declare("sap.ui.core.VerticalAlign");

/**
 * @class
 * Configuration options for vertical alignments, for example of a layout cell content within the borders.
 * 
 *
 * @version 1.9.0-SNAPSHOT
 * @static
 * @public
 */
sap.ui.core.VerticalAlign = {
  
    /**
     * 
     * Content is aligned at the bottom.
     *  
     * @public
     */
    Bottom : "Bottom",

    /**
     * 
     * Content is centered vertically .
     *  
     * @public
     */
    Middle : "Middle",

    /**
     * 
     * Content is aligned at the top.
     *  
     * @public
     */
    Top : "Top"

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

// Provides enumeration sap.ui.core.Wrapping.
jQuery.sap.declare("sap.ui.core.Wrapping");

/**
 * @class Configuration options for text wrapping.
 *
 * @version 1.9.0-SNAPSHOT
 * @static
 * @public
 */
sap.ui.core.Wrapping = {
  
    /**
     * The standard browser behavior is considered for wrapping. 
     * @public
     */
    None : "None",

    /**
     * The text is actually on the same line but displayed within several lines. 
     * @public
     */
    Soft : "Soft",

    /**
     * Inserts actual line breaks in the text at the wrap point. 
     * @public
     */
    Hard : "Hard",

    /**
     * Wrapping shall not be allowed. 
     * @public
     */
    Off : "Off"

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

// Provides enumeration sap.ui.core.mvc.ViewType.
jQuery.sap.declare("sap.ui.core.mvc.ViewType");

/**
 * @class Specifies possible view types
 *
 * @version 1.9.0-SNAPSHOT
 * @static
 * @public
 */
sap.ui.core.mvc.ViewType = {
  
    /**
     * JSON View 
     * @public
     */
    JSON : "JSON",

    /**
     * XML view 
     * @public
     */
    XML : "XML",

    /**
     * JS View 
     * @public
     */
    JS : "JS"

  };
  

// -----------------------------------------------------------------------------
// Begin of Library Initialization coding, copied from shared.js
// -----------------------------------------------------------------------------

// lazy imports for BusyIndicator
sap.ui.lazyRequire("sap.ui.core.BusyIndicator", "show hide attachOpen detachOpen attachClose detachClose");

// lazy imports for optional model stuff and model implementations
sap.ui.lazyRequire("sap.ui.model.Filter");
sap.ui.lazyRequire("sap.ui.model.Sorter");
sap.ui.lazyRequire("sap.ui.model.json.JSONModel");
sap.ui.lazyRequire("sap.ui.model.resource.ResourceModel");
sap.ui.lazyRequire("sap.ui.model.odata.ODataModel");
sap.ui.lazyRequire("sap.ui.model.xml.XMLModel");

//lazy imports for types
sap.ui.lazyRequire("sap.ui.model.type.Boolean");
sap.ui.lazyRequire("sap.ui.model.type.Integer");
sap.ui.lazyRequire("sap.ui.model.type.Float");
sap.ui.lazyRequire("sap.ui.model.type.String");
sap.ui.lazyRequire("sap.ui.model.type.Date");
sap.ui.lazyRequire("sap.ui.model.type.Time");
sap.ui.lazyRequire("sap.ui.model.type.DateTime");

//lazy imports for locale
sap.ui.lazyRequire("sap.ui.core.Locale");
sap.ui.lazyRequire("sap.ui.core.LocaleData");

// lazy imports for MVC
sap.ui.lazyRequire("sap.ui.core.mvc.Controller");
sap.ui.lazyRequire("sap.ui", "controller", "sap.ui.core.mvc.Controller");
sap.ui.lazyRequire("sap.ui", "view", "sap.ui.core.mvc.View");
sap.ui.lazyRequire("sap.ui", "jsview", "sap.ui.core.mvc.JSView");
sap.ui.lazyRequire("sap.ui", "jsonview", "sap.ui.core.mvc.JSONView");
sap.ui.lazyRequire("sap.ui", "xmlview", "sap.ui.core.mvc.XMLView");
