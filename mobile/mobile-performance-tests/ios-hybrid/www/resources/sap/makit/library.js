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
 * Initialization Code and shared classes of library sap.makit (1.9.1-SNAPSHOT)
 */
jQuery.sap.declare("sap.makit.library");
jQuery.sap.require("sap.ui.core.Core");
/**
 * SAPUI5 library contains the makit charts.
 *
 * @namespace
 * @name sap.makit
 * @public
 */


// library dependencies
jQuery.sap.require("sap.ui.core.library");

// delegate further initialization of this library to the Core
sap.ui.getCore().initLibrary({
  name : "sap.makit",
  dependencies : ["sap.ui.core"],
  types: [
    "sap.makit.ChartType",
    "sap.makit.LegendPosition",
    "sap.makit.SortOrder",
    "sap.makit.ValueBubblePosition",
    "sap.makit.ValueBubbleStyle"
  ],
  interfaces: [],
  controls: [
    "sap.makit.Chart"
  ],
  elements: [
    "sap.makit.Axis",
    "sap.makit.Category",
    "sap.makit.CategoryAxis",
    "sap.makit.Column",
    "sap.makit.Row",
    "sap.makit.Series",
    "sap.makit.Value",
    "sap.makit.ValueAxis",
    "sap.makit.ValueBubble"
  ],
  version: "1.9.1-SNAPSHOT"});

/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 * 
 * (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

/* ----------------------------------------------------------------------------------
 * Hint: This is a derived (generated) file. Changes should be done in the underlying 
 * source files only (*.type, *.js) or they will be lost after the next generation.
 * ---------------------------------------------------------------------------------- */

// Provides enumeration sap.makit.ChartType.
jQuery.sap.declare("sap.makit.ChartType");

/**
 * @class Enumeration for chart type
 *
 * @version 1.9.1-SNAPSHOT
 * @static
 * @public
 * @experimental Since version 1.8. 
 * API is not yet finished and might change completely
 */
sap.makit.ChartType = {
  
    /**
     * Column chart 
     * @public
     */
    Column : "Column",

    /**
     * Line chart 
     * @public
     */
    Line : "Line",

    /**
     * Bubble chart 
     * @public
     */
    Bubble : "Bubble",

    /**
     * Horizontal table bar chart 
     * @public
     */
    Bar : "Bar",

    /**
     * Pie chart 
     * @public
     */
    Pie : "Pie",

    /**
     * Donut chart 
     * @public
     */
    Donut : "Donut",

    /**
     * Stacked column chart 
     * @public
     */
    StackedColumn : "StackedColumn",

    /**
     * 100% stacked column chart 
     * @public
     */
    HundredPercentStackedColumn : "HundredPercentStackedColumn"

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

// Provides enumeration sap.makit.LegendPosition.
jQuery.sap.declare("sap.makit.LegendPosition");

/**
 * @class Enumeration for legend position.
 *
 * @version 1.9.1-SNAPSHOT
 * @static
 * @public
 * @experimental Since version 1.8. 
 * API is not yet finished and might change completely
 */
sap.makit.LegendPosition = {
  
    /**
     * Legend location is on the top of the chart 
     * @public
     */
    Top : "Top",

    /**
     * Legend location is on the left of the chart 
     * @public
     */
    Left : "Left",

    /**
     * Legend location is on the bottom of the chart 
     * @public
     */
    Bottom : "Bottom",

    /**
     * Legend location is on the right of the chart 
     * @public
     */
    Right : "Right",

    /**
     * Hide the legend 
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

// Provides enumeration sap.makit.SortOrder.
jQuery.sap.declare("sap.makit.SortOrder");

/**
 * @class Enumeration for sort order
 *
 * @version 1.9.1-SNAPSHOT
 * @static
 * @public
 * @experimental Since version 1.8. 
 * API is not yet finished and might change completely
 */
sap.makit.SortOrder = {
  
    /**
     * Ascending sort 
     * @public
     */
    Ascending : "Ascending",

    /**
     * Descending sort 
     * @public
     */
    Descending : "Descending",

    /**
     * Partially sort 
     * @public
     */
    Partial : "Partial",

    /**
     * No sorting 
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

// Provides enumeration sap.makit.ValueBubblePosition.
jQuery.sap.declare("sap.makit.ValueBubblePosition");

/**
 * @class Position for Value Bubble only applies to Pie/Donut Chart.
 *
 * @version 1.9.1-SNAPSHOT
 * @static
 * @public
 * @experimental Since version 1.8. 
 * API is not yet finished and might change completely
 */
sap.makit.ValueBubblePosition = {
  
    /**
     * Value Bubble position set to above the chart 
     * @public
     */
    Top : "Top",

    /**
     * Value Bubble position set to beside the chart 
     * @public
     */
    Side : "Side"

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

// Provides enumeration sap.makit.ValueBubbleStyle.
jQuery.sap.declare("sap.makit.ValueBubbleStyle");

/**
 * @class Enumeration for Value Bubble's positioning style. This applies all chart types except Pie/Donut/HBar chart.
 *
 * @version 1.9.1-SNAPSHOT
 * @static
 * @public
 * @experimental Since version 1.8. 
 * API is not yet finished and might change completely
 */
sap.makit.ValueBubbleStyle = {
  
    /**
     * The Value Bubble snaps above of the chart, the chart height will adjust accordingly. 
     * @public
     */
    Top : "Top",

    /**
     * The Value Bubble floats on the touch point, chart's size will not change. 
     * @public
     */
    Float : "Float",

    /**
     * The Value Bubble floats and snaps above of the chart, chart's size will not change. 
     * @public
     */
    FloatTop : "FloatTop"

  };
  
