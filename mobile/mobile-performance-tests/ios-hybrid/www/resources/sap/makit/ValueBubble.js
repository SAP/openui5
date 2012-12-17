/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 * 
 * (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

/* ----------------------------------------------------------------------------------
 * Hint: This is a derived (generated) file. Changes should be done in the underlying 
 * source files only (*.control, *.js) or they will be lost after the next generation.
 * ---------------------------------------------------------------------------------- */

// Provides control sap.makit.ValueBubble.
jQuery.sap.declare("sap.makit.ValueBubble");
jQuery.sap.require("sap.makit.library");
jQuery.sap.require("sap.ui.core.Element");

/**
 * Constructor for a new ValueBubble.
 * 
 * Accepts an object literal <code>mSettings</code> that defines initial 
 * property values, aggregated and associated objects as well as event handlers. 
 * 
 * If the name of a setting is ambiguous (e.g. a property has the same name as an event), 
 * then the framework assumes property, aggregation, association, event in that order. 
 * To override this automatic resolution, one of the prefixes "aggregation:", "association:" 
 * or "event:" can be added to the name of the setting (such a prefixed name must be
 * enclosed in single or double quotes).
 *
 * The supported settings are:
 * <ul>
 * <li>Properties
 * <ul>
 * <li>{@link #getShowCategoryText showCategoryText} : boolean (default: true)</li>
 * <li>{@link #getShowCategoryDisplayName showCategoryDisplayName} : boolean (default: true)</li>
 * <li>{@link #getShowValueDisplayName showValueDisplayName} : boolean (default: true)</li>
 * <li>{@link #getShowValueOnPieChart showValueOnPieChart} : boolean (default: false)</li>
 * <li>{@link #getShowLegendLabel showLegendLabel} : boolean (default: true)</li>
 * <li>{@link #getShowNullValue showNullValue} : boolean (default: true)</li>
 * <li>{@link #getPosition position} : sap.makit.ValueBubblePosition (default: sap.makit.ValueBubblePosition.Top)</li>
 * <li>{@link #getStyle style} : sap.makit.ValueBubbleStyle (default: sap.makit.ValueBubbleStyle.Top)</li>
 * <li>{@link #getVisible visible} : boolean (default: true)</li></ul>
 * </li>
 * <li>Aggregations
 * <ul></ul>
 * </li>
 * <li>Associations
 * <ul></ul>
 * </li>
 * <li>Events
 * <ul></ul>
 * </li>
 * </ul> 
 *
 * 
 * In addition, all settings applicable to the base type {@link sap.ui.core.Element#constructor sap.ui.core.Element}
 * can be used as well.
 *
 * @param {string} [sId] id for the new control, generated automatically if no id is given 
 * @param {object} [mSettings] initial settings for the new control
 *
 * @class
 * The properties of the Chart's Value Bubble.
 * @extends sap.ui.core.Element
 *
 * @author SAP AG 
 * @version 1.9.1-SNAPSHOT
 *
 * @constructor   
 * @public
 * @experimental Since version 1.8. 
 * API is not yet finished and might change completely
 * @name sap.makit.ValueBubble
 */
sap.ui.core.Element.extend("sap.makit.ValueBubble", { metadata : {

	// ---- object ----

	// ---- control specific ----
	library : "sap.makit",
	properties : {
		"showCategoryText" : {type : "boolean", group : "Misc", defaultValue : true},
		"showCategoryDisplayName" : {type : "boolean", group : "Misc", defaultValue : true},
		"showValueDisplayName" : {type : "boolean", group : "Misc", defaultValue : true},
		"showValueOnPieChart" : {type : "boolean", group : "Misc", defaultValue : false},
		"showLegendLabel" : {type : "boolean", group : "Misc", defaultValue : true},
		"showNullValue" : {type : "boolean", group : "Misc", defaultValue : true},
		"position" : {type : "sap.makit.ValueBubblePosition", group : "Misc", defaultValue : sap.makit.ValueBubblePosition.Top},
		"style" : {type : "sap.makit.ValueBubbleStyle", group : "Misc", defaultValue : sap.makit.ValueBubbleStyle.Top},
		"visible" : {type : "boolean", group : "Appearance", defaultValue : true}
	}
}});


/**
 * Creates a new subclass of class sap.makit.ValueBubble with name <code>sClassName</code> 
 * and enriches it with the information contained in <code>oClassInfo</code>.
 * 
 * <code>oClassInfo</code> might contain the same kind of informations as described in {@link sap.ui.core.Element.extend Element.extend}.
 *   
 * @param {string} sClassName name of the class to be created
 * @param {object} [oClassInfo] object literal with informations about the class  
 * @param {function} [FNMetaImpl] constructor function for the metadata object. If not given, it defaults to sap.ui.core.ElementMetadata.
 * @return {function} the created class / constructor function
 * @public
 * @static
 * @name sap.makit.ValueBubble.extend
 * @function
 */


/**
 * Getter for property <code>showCategoryText</code>.
 * Whether to display category's text on the Value Bubble
 *
 * Default value is <code>true</code>
 *
 * @return {boolean} the value of property <code>showCategoryText</code>
 * @public
 * @name sap.makit.ValueBubble#getShowCategoryText
 * @function
 */


/**
 * Setter for property <code>showCategoryText</code>.
 *
 * Default value is <code>true</code> 
 *
 * @param {boolean} bShowCategoryText  new value for property <code>showCategoryText</code>
 * @return {sap.makit.ValueBubble} <code>this</code> to allow method chaining
 * @public
 * @name sap.makit.ValueBubble#setShowCategoryText
 * @function
 */

/**
 * Getter for property <code>showCategoryDisplayName</code>.
 * Whether to display category's display name on the Value Bubble
 *
 * Default value is <code>true</code>
 *
 * @return {boolean} the value of property <code>showCategoryDisplayName</code>
 * @public
 * @name sap.makit.ValueBubble#getShowCategoryDisplayName
 * @function
 */


/**
 * Setter for property <code>showCategoryDisplayName</code>.
 *
 * Default value is <code>true</code> 
 *
 * @param {boolean} bShowCategoryDisplayName  new value for property <code>showCategoryDisplayName</code>
 * @return {sap.makit.ValueBubble} <code>this</code> to allow method chaining
 * @public
 * @name sap.makit.ValueBubble#setShowCategoryDisplayName
 * @function
 */

/**
 * Getter for property <code>showValueDisplayName</code>.
 * Whether to display value's display name on the Value Bubble
 *
 * Default value is <code>true</code>
 *
 * @return {boolean} the value of property <code>showValueDisplayName</code>
 * @public
 * @name sap.makit.ValueBubble#getShowValueDisplayName
 * @function
 */


/**
 * Setter for property <code>showValueDisplayName</code>.
 *
 * Default value is <code>true</code> 
 *
 * @param {boolean} bShowValueDisplayName  new value for property <code>showValueDisplayName</code>
 * @return {sap.makit.ValueBubble} <code>this</code> to allow method chaining
 * @public
 * @name sap.makit.ValueBubble#setShowValueDisplayName
 * @function
 */

/**
 * Getter for property <code>showValueOnPieChart</code>.
 * Whether to display value on Pie or Donut chart
 *
 * Default value is <code>false</code>
 *
 * @return {boolean} the value of property <code>showValueOnPieChart</code>
 * @public
 * @name sap.makit.ValueBubble#getShowValueOnPieChart
 * @function
 */


/**
 * Setter for property <code>showValueOnPieChart</code>.
 *
 * Default value is <code>false</code> 
 *
 * @param {boolean} bShowValueOnPieChart  new value for property <code>showValueOnPieChart</code>
 * @return {sap.makit.ValueBubble} <code>this</code> to allow method chaining
 * @public
 * @name sap.makit.ValueBubble#setShowValueOnPieChart
 * @function
 */

/**
 * Getter for property <code>showLegendLabel</code>.
 * Whether to display legend's label (Pie or Donut chart only)
 *
 * Default value is <code>true</code>
 *
 * @return {boolean} the value of property <code>showLegendLabel</code>
 * @public
 * @name sap.makit.ValueBubble#getShowLegendLabel
 * @function
 */


/**
 * Setter for property <code>showLegendLabel</code>.
 *
 * Default value is <code>true</code> 
 *
 * @param {boolean} bShowLegendLabel  new value for property <code>showLegendLabel</code>
 * @return {sap.makit.ValueBubble} <code>this</code> to allow method chaining
 * @public
 * @name sap.makit.ValueBubble#setShowLegendLabel
 * @function
 */

/**
 * Getter for property <code>showNullValue</code>.
 * Whether to render null item on the Value Bubble
 *
 * Default value is <code>true</code>
 *
 * @return {boolean} the value of property <code>showNullValue</code>
 * @public
 * @name sap.makit.ValueBubble#getShowNullValue
 * @function
 */


/**
 * Setter for property <code>showNullValue</code>.
 *
 * Default value is <code>true</code> 
 *
 * @param {boolean} bShowNullValue  new value for property <code>showNullValue</code>
 * @return {sap.makit.ValueBubble} <code>this</code> to allow method chaining
 * @public
 * @name sap.makit.ValueBubble#setShowNullValue
 * @function
 */

/**
 * Getter for property <code>position</code>.
 * The position of the Value Bubble (Pie or Donut chart only)
 *
 * Default value is <code>Top</code>
 *
 * @return {sap.makit.ValueBubblePosition} the value of property <code>position</code>
 * @public
 * @name sap.makit.ValueBubble#getPosition
 * @function
 */


/**
 * Setter for property <code>position</code>.
 *
 * Default value is <code>Top</code> 
 *
 * @param {sap.makit.ValueBubblePosition} oPosition  new value for property <code>position</code>
 * @return {sap.makit.ValueBubble} <code>this</code> to allow method chaining
 * @public
 * @name sap.makit.ValueBubble#setPosition
 * @function
 */

/**
 * Getter for property <code>style</code>.
 * Value Bubble positioning style (All the chart types except: Pie/Donut/HBar chart)
 *
 * Default value is <code>Top</code>
 *
 * @return {sap.makit.ValueBubbleStyle} the value of property <code>style</code>
 * @public
 * @name sap.makit.ValueBubble#getStyle
 * @function
 */


/**
 * Setter for property <code>style</code>.
 *
 * Default value is <code>Top</code> 
 *
 * @param {sap.makit.ValueBubbleStyle} oStyle  new value for property <code>style</code>
 * @return {sap.makit.ValueBubble} <code>this</code> to allow method chaining
 * @public
 * @name sap.makit.ValueBubble#setStyle
 * @function
 */

/**
 * Getter for property <code>visible</code>.
 * Whether the Value Bubble is visible
 *
 * Default value is <code>true</code>
 *
 * @return {boolean} the value of property <code>visible</code>
 * @public
 * @name sap.makit.ValueBubble#getVisible
 * @function
 */


/**
 * Setter for property <code>visible</code>.
 *
 * Default value is <code>true</code> 
 *
 * @param {boolean} bVisible  new value for property <code>visible</code>
 * @return {sap.makit.ValueBubble} <code>this</code> to allow method chaining
 * @public
 * @name sap.makit.ValueBubble#setVisible
 * @function
 */

// Start of sap\makit\ValueBubble.js
/*!
 * @copyright@
 */

sap.makit.ValueBubble.prototype.toObject = function(){
	var obj = {};
	
	obj.showCategoryText = this.getShowCategoryText();
	obj.showCategoryDisplayName = this.getShowCategoryDisplayName();
	obj.showValueDisplayName = this.getShowValueDisplayName();
	obj.showValueOnPieChart = this.getShowValueOnPieChart();
	obj.showLegendLabel = this.getShowLegendLabel();
	obj.showNullValue  = this.getShowNullValue();
	obj.style = this.getStyle().toLowerCase();
	obj.position = this.getPosition().toLowerCase();
	obj.visible = this.getVisible();
	return obj;
};