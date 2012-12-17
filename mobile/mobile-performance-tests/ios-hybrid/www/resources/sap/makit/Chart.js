/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 * 
 * (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

/* ----------------------------------------------------------------------------------
 * Hint: This is a derived (generated) file. Changes should be done in the underlying 
 * source files only (*.control, *.js) or they will be lost after the next generation.
 * ---------------------------------------------------------------------------------- */

// Provides control sap.makit.Chart.
jQuery.sap.declare("sap.makit.Chart");
jQuery.sap.require("sap.makit.library");
jQuery.sap.require("sap.ui.core.Control");

/**
 * Constructor for a new Chart.
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
 * <li>{@link #getWidth width} : sap.ui.core.CSSSize (default: '100%')</li>
 * <li>{@link #getHeight height} : sap.ui.core.CSSSize (default: '100%')</li>
 * <li>{@link #getType type} : sap.makit.ChartType (default: sap.makit.ChartType.Column)</li>
 * <li>{@link #getCategoryAxis categoryAxis} : object</li>
 * <li>{@link #getValueAxis valueAxis} : object</li>
 * <li>{@link #getValueBubble valueBubble} : object</li>
 * <li>{@link #getShowRangeSelector showRangeSelector} : boolean (default: true)</li>
 * <li>{@link #getShowTableView showTableView} : boolean (default: false)</li>
 * <li>{@link #getLegendPosition legendPosition} : sap.makit.LegendPosition (default: sap.makit.LegendPosition.Left)</li></ul>
 * </li>
 * <li>Aggregations
 * <ul>
 * <li>{@link #getRows rows} : sap.makit.Row[]</li>
 * <li>{@link #getColumns columns} : sap.makit.Column[]</li>
 * <li>{@link #getSeries series} : sap.makit.Series</li>
 * <li>{@link #getValues values} : sap.makit.Value[]</li>
 * <li>{@link #getCategory category} : sap.makit.Category</li></ul>
 * </li>
 * <li>Associations
 * <ul></ul>
 * </li>
 * <li>Events
 * <ul>
 * <li>{@link sap.makit.Chart#event:doubletap doubletap} : fnListenerFunction or [fnListenerFunction, oListenerObject] or [oData, fnListenerFunction, oListenerObject]</li>
 * <li>{@link sap.makit.Chart#event:tap tap} : fnListenerFunction or [fnListenerFunction, oListenerObject] or [oData, fnListenerFunction, oListenerObject]</li></ul>
 * </li>
 * </ul> 

 *
 * @param {string} [sId] id for the new control, generated automatically if no id is given 
 * @param {object} [mSettings] initial settings for the new control
 *
 * @class
 * The Chart control.
 * @extends sap.ui.core.Control
 *
 * @author SAP AG 
 * @version 1.9.1-SNAPSHOT
 *
 * @constructor   
 * @public
 * @experimental Since version 1.8. 
 * API is not yet finished and might change completely
 * @name sap.makit.Chart
 */
sap.ui.core.Control.extend("sap.makit.Chart", { metadata : {

	// ---- object ----
	publicMethods : [
		// methods
		"getSelectedCategory", "getSelectedSeries", "getNumberOfCategories"
	],

	// ---- control specific ----
	library : "sap.makit",
	properties : {
		"width" : {type : "sap.ui.core.CSSSize", group : "Dimension", defaultValue : '100%'},
		"height" : {type : "sap.ui.core.CSSSize", group : "Dimension", defaultValue : '100%'},
		"type" : {type : "sap.makit.ChartType", group : "Appearance", defaultValue : sap.makit.ChartType.Column},
		"categoryAxis" : {type : "object", group : "Misc", defaultValue : null},
		"valueAxis" : {type : "object", group : "Misc", defaultValue : null},
		"valueBubble" : {type : "object", group : "Misc", defaultValue : null},
		"showRangeSelector" : {type : "boolean", group : "Appearance", defaultValue : true},
		"showTableView" : {type : "boolean", group : "Misc", defaultValue : false},
		"legendPosition" : {type : "sap.makit.LegendPosition", group : "Misc", defaultValue : sap.makit.LegendPosition.Left}
	},
	aggregations : {
    	"rows" : {type : "sap.makit.Row", multiple : true, singularName : "row", bindable : "bindable"}, 
    	"columns" : {type : "sap.makit.Column", multiple : true, singularName : "column", bindable : "bindable"}, 
    	"series" : {type : "sap.makit.Series", multiple : false}, 
    	"values" : {type : "sap.makit.Value", multiple : true, singularName : "value"}, 
    	"category" : {type : "sap.makit.Category", multiple : false}
	},
	events : {
		"doubletap" : {}, 
		"tap" : {}
	}
}});


/**
 * Creates a new subclass of class sap.makit.Chart with name <code>sClassName</code> 
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
 * @name sap.makit.Chart.extend
 * @function
 */

sap.makit.Chart.M_EVENTS = {'doubletap':'doubletap','tap':'tap'};


/**
 * Getter for property <code>width</code>.
 * The width of the Chart
 *
 * Default value is <code>100%</code>
 *
 * @return {sap.ui.core.CSSSize} the value of property <code>width</code>
 * @public
 * @name sap.makit.Chart#getWidth
 * @function
 */


/**
 * Setter for property <code>width</code>.
 *
 * Default value is <code>100%</code> 
 *
 * @param {sap.ui.core.CSSSize} sWidth  new value for property <code>width</code>
 * @return {sap.makit.Chart} <code>this</code> to allow method chaining
 * @public
 * @name sap.makit.Chart#setWidth
 * @function
 */

/**
 * Getter for property <code>height</code>.
 * The height of the Chart
 *
 * Default value is <code>100%</code>
 *
 * @return {sap.ui.core.CSSSize} the value of property <code>height</code>
 * @public
 * @name sap.makit.Chart#getHeight
 * @function
 */


/**
 * Setter for property <code>height</code>.
 *
 * Default value is <code>100%</code> 
 *
 * @param {sap.ui.core.CSSSize} sHeight  new value for property <code>height</code>
 * @return {sap.makit.Chart} <code>this</code> to allow method chaining
 * @public
 * @name sap.makit.Chart#setHeight
 * @function
 */

/**
 * Getter for property <code>type</code>.
 * Chart type
 *
 * Default value is <code>Column</code>
 *
 * @return {sap.makit.ChartType} the value of property <code>type</code>
 * @public
 * @name sap.makit.Chart#getType
 * @function
 */


/**
 * Setter for property <code>type</code>.
 *
 * Default value is <code>Column</code> 
 *
 * @param {sap.makit.ChartType} oType  new value for property <code>type</code>
 * @return {sap.makit.Chart} <code>this</code> to allow method chaining
 * @public
 * @name sap.makit.Chart#setType
 * @function
 */

/**
 * Getter for property <code>categoryAxis</code>.
 * Category Axis property of the Chart. Accepts only an instance of CategoryAxis element.
 *
 * Default value is empty/<code>undefined</code>
 *
 * @return {object} the value of property <code>categoryAxis</code>
 * @public
 * @name sap.makit.Chart#getCategoryAxis
 * @function
 */


/**
 * Setter for property <code>categoryAxis</code>.
 *
 * Default value is empty/<code>undefined</code> 
 *
 * @param {object} oCategoryAxis  new value for property <code>categoryAxis</code>
 * @return {sap.makit.Chart} <code>this</code> to allow method chaining
 * @public
 * @name sap.makit.Chart#setCategoryAxis
 * @function
 */

/**
 * Getter for property <code>valueAxis</code>.
 * Value Axis property of the Chart. Accept only an instance of ValueAxis element.
 *
 * Default value is empty/<code>undefined</code>
 *
 * @return {object} the value of property <code>valueAxis</code>
 * @public
 * @name sap.makit.Chart#getValueAxis
 * @function
 */


/**
 * Setter for property <code>valueAxis</code>.
 *
 * Default value is empty/<code>undefined</code> 
 *
 * @param {object} oValueAxis  new value for property <code>valueAxis</code>
 * @return {sap.makit.Chart} <code>this</code> to allow method chaining
 * @public
 * @name sap.makit.Chart#setValueAxis
 * @function
 */

/**
 * Getter for property <code>valueBubble</code>.
 * Value Bubble property of the Chart. Accept only an instance of ValueBubble element.
 *
 * Default value is empty/<code>undefined</code>
 *
 * @return {object} the value of property <code>valueBubble</code>
 * @public
 * @name sap.makit.Chart#getValueBubble
 * @function
 */


/**
 * Setter for property <code>valueBubble</code>.
 *
 * Default value is empty/<code>undefined</code> 
 *
 * @param {object} oValueBubble  new value for property <code>valueBubble</code>
 * @return {sap.makit.Chart} <code>this</code> to allow method chaining
 * @public
 * @name sap.makit.Chart#setValueBubble
 * @function
 */

/**
 * Getter for property <code>showRangeSelector</code>.
 * Specify whether the range selector should be visible.
 *
 * Default value is <code>true</code>
 *
 * @return {boolean} the value of property <code>showRangeSelector</code>
 * @public
 * @name sap.makit.Chart#getShowRangeSelector
 * @function
 */


/**
 * Setter for property <code>showRangeSelector</code>.
 *
 * Default value is <code>true</code> 
 *
 * @param {boolean} bShowRangeSelector  new value for property <code>showRangeSelector</code>
 * @return {sap.makit.Chart} <code>this</code> to allow method chaining
 * @public
 * @name sap.makit.Chart#setShowRangeSelector
 * @function
 */

/**
 * Getter for property <code>showTableView</code>.
 * Toggle to display table view
 *
 * Default value is <code>false</code>
 *
 * @return {boolean} the value of property <code>showTableView</code>
 * @public
 * @name sap.makit.Chart#getShowTableView
 * @function
 */


/**
 * Setter for property <code>showTableView</code>.
 *
 * Default value is <code>false</code> 
 *
 * @param {boolean} bShowTableView  new value for property <code>showTableView</code>
 * @return {sap.makit.Chart} <code>this</code> to allow method chaining
 * @public
 * @name sap.makit.Chart#setShowTableView
 * @function
 */

/**
 * Getter for property <code>legendPosition</code>.
 * Legend position for Pie /Donut chart only.
 *
 * Default value is <code>Left</code>
 *
 * @return {sap.makit.LegendPosition} the value of property <code>legendPosition</code>
 * @public
 * @name sap.makit.Chart#getLegendPosition
 * @function
 */


/**
 * Setter for property <code>legendPosition</code>.
 *
 * Default value is <code>Left</code> 
 *
 * @param {sap.makit.LegendPosition} oLegendPosition  new value for property <code>legendPosition</code>
 * @return {sap.makit.Chart} <code>this</code> to allow method chaining
 * @public
 * @name sap.makit.Chart#setLegendPosition
 * @function
 */
	
/**
 * Getter for aggregation <code>rows</code>.<br/>
 * The data rows of the chart. User should bind these to their data source
 * 
 * @return {sap.makit.Row[]}
 * @public
 * @name sap.makit.Chart#getRows
 * @function
 */

/**
 * Inserts a row into the aggregation named <code>rows</code>.
 *
 * @param {sap.makit.Row}
 *          oRow the row to insert; if empty, nothing is inserted
 * @param {int}
 *             iIndex the <code>0</code>-based index the row should be inserted at; for 
 *             a negative value of <code>iIndex</code>, the row is inserted at position 0; for a value 
 *             greater than the current size of the aggregation, the row is inserted at 
 *             the last position        
 * @return {sap.makit.Chart} <code>this</code> to allow method chaining
 * @public
 * @name sap.makit.Chart#insertRow
 * @function
 */


/**
 * Adds some row <code>oRow</code> 
 * to the aggregation named <code>rows</code>.
 *
 * @param {sap.makit.Row}
 *            oRow the row to add; if empty, nothing is inserted
 * @return {sap.makit.Chart} <code>this</code> to allow method chaining
 * @public
 * @name sap.makit.Chart#addRow
 * @function
 */


/**
 * Removes an row from the aggregation named <code>rows</code>.
 *
 * @param {int | string | sap.makit.Row} vRow the row to remove or its index or id
 * @return {sap.makit.Row} the removed row or null
 * @public
 * @name sap.makit.Chart#removeRow
 * @function
 */


/**
 * Removes all the controls in the aggregation named <code>rows</code>.<br/>
 * Additionally unregisters them from the hosting UIArea.
 * @return {sap.makit.Row[]} an array of the removed elements (might be empty)
 * @public
 * @name sap.makit.Chart#removeAllRows
 * @function
 */


/**
 * Checks for the provided <code>sap.makit.Row</code> in the aggregation named <code>rows</code> 
 * and returns its index if found or -1 otherwise.
 *
 * @param {sap.makit.Row}
 *            oRow the row whose index is looked for.
 * @return {int} the index of the provided control in the aggregation if found, or -1 otherwise
 * @public
 * @name sap.makit.Chart#indexOfRow
 * @function
 */


/**
 * Destroys all the rows in the aggregation 
 * named <code>rows</code>.
 * @return {sap.makit.Chart} <code>this</code> to allow method chaining
 * @public
 * @name sap.makit.Chart#destroyRows
 * @function
 */

/**
 * Binder for aggregation <code>rows</code>.
 *
 * @param {string} sPath path to a list in the model 
 * @param {sap.ui.core.Element} oTemplate the control template for this aggregation
 * @param {sap.ui.model.Sorter} oSorter the initial sort order (optional)
 * @param {array} aFilters the predefined filters for this aggregation (optional)
 * @return {sap.makit.Chart} <code>this</code> to allow method chaining
 * @public
 * @name sap.makit.Chart#bindRows
 * @function
 */


/**
 * Unbinder for aggregation <code>rows</code>.
 *
 * @return {sap.makit.Chart} <code>this</code> to allow method chaining
 * @public
 * @name sap.makit.Chart#unbindRows
 * @function
 */
	
/**
 * Getter for aggregation <code>columns</code>.<br/>
 * The data column map of the chart.
 * 
 * @return {sap.makit.Column[]}
 * @public
 * @name sap.makit.Chart#getColumns
 * @function
 */

/**
 * Inserts a column into the aggregation named <code>columns</code>.
 *
 * @param {sap.makit.Column}
 *          oColumn the column to insert; if empty, nothing is inserted
 * @param {int}
 *             iIndex the <code>0</code>-based index the column should be inserted at; for 
 *             a negative value of <code>iIndex</code>, the column is inserted at position 0; for a value 
 *             greater than the current size of the aggregation, the column is inserted at 
 *             the last position        
 * @return {sap.makit.Chart} <code>this</code> to allow method chaining
 * @public
 * @name sap.makit.Chart#insertColumn
 * @function
 */


/**
 * Adds some column <code>oColumn</code> 
 * to the aggregation named <code>columns</code>.
 *
 * @param {sap.makit.Column}
 *            oColumn the column to add; if empty, nothing is inserted
 * @return {sap.makit.Chart} <code>this</code> to allow method chaining
 * @public
 * @name sap.makit.Chart#addColumn
 * @function
 */


/**
 * Removes an column from the aggregation named <code>columns</code>.
 *
 * @param {int | string | sap.makit.Column} vColumn the column to remove or its index or id
 * @return {sap.makit.Column} the removed column or null
 * @public
 * @name sap.makit.Chart#removeColumn
 * @function
 */


/**
 * Removes all the controls in the aggregation named <code>columns</code>.<br/>
 * Additionally unregisters them from the hosting UIArea.
 * @return {sap.makit.Column[]} an array of the removed elements (might be empty)
 * @public
 * @name sap.makit.Chart#removeAllColumns
 * @function
 */


/**
 * Checks for the provided <code>sap.makit.Column</code> in the aggregation named <code>columns</code> 
 * and returns its index if found or -1 otherwise.
 *
 * @param {sap.makit.Column}
 *            oColumn the column whose index is looked for.
 * @return {int} the index of the provided control in the aggregation if found, or -1 otherwise
 * @public
 * @name sap.makit.Chart#indexOfColumn
 * @function
 */


/**
 * Destroys all the columns in the aggregation 
 * named <code>columns</code>.
 * @return {sap.makit.Chart} <code>this</code> to allow method chaining
 * @public
 * @name sap.makit.Chart#destroyColumns
 * @function
 */

/**
 * Binder for aggregation <code>columns</code>.
 *
 * @param {string} sPath path to a list in the model 
 * @param {sap.ui.core.Element} oTemplate the control template for this aggregation
 * @param {sap.ui.model.Sorter} oSorter the initial sort order (optional)
 * @param {array} aFilters the predefined filters for this aggregation (optional)
 * @return {sap.makit.Chart} <code>this</code> to allow method chaining
 * @public
 * @name sap.makit.Chart#bindColumns
 * @function
 */


/**
 * Unbinder for aggregation <code>columns</code>.
 *
 * @return {sap.makit.Chart} <code>this</code> to allow method chaining
 * @public
 * @name sap.makit.Chart#unbindColumns
 * @function
 */
	
/**
 * Getter for aggregation <code>series</code>.<br/>
 * Data region property of the chart's Series
 * 
 * @return {sap.makit.Series}
 * @public
 * @name sap.makit.Chart#getSeries
 * @function
 */

/**
 * Setter for the aggregated <code>series</code>.
 * @param oSeries {sap.makit.Series}
 * @return {sap.makit.Chart} <code>this</code> to allow method chaining
 * @public
 * @name sap.makit.Chart#setSery
 * @function
 */


/**
 * Destroys the sery in the aggregation 
 * named <code>series</code>.
 * @return {sap.makit.Chart} <code>this</code> to allow method chaining
 * @public
 * @name sap.makit.Chart#destroySeries
 * @function
 */
	
/**
 * Getter for aggregation <code>values</code>.<br/>
 * Data region property of the chart's Values
 * 
 * @return {sap.makit.Value[]}
 * @public
 * @name sap.makit.Chart#getValues
 * @function
 */

/**
 * Inserts a value into the aggregation named <code>values</code>.
 *
 * @param {sap.makit.Value}
 *          oValue the value to insert; if empty, nothing is inserted
 * @param {int}
 *             iIndex the <code>0</code>-based index the value should be inserted at; for 
 *             a negative value of <code>iIndex</code>, the value is inserted at position 0; for a value 
 *             greater than the current size of the aggregation, the value is inserted at 
 *             the last position        
 * @return {sap.makit.Chart} <code>this</code> to allow method chaining
 * @public
 * @name sap.makit.Chart#insertValue
 * @function
 */


/**
 * Adds some value <code>oValue</code> 
 * to the aggregation named <code>values</code>.
 *
 * @param {sap.makit.Value}
 *            oValue the value to add; if empty, nothing is inserted
 * @return {sap.makit.Chart} <code>this</code> to allow method chaining
 * @public
 * @name sap.makit.Chart#addValue
 * @function
 */


/**
 * Removes an value from the aggregation named <code>values</code>.
 *
 * @param {int | string | sap.makit.Value} vValue the value to remove or its index or id
 * @return {sap.makit.Value} the removed value or null
 * @public
 * @name sap.makit.Chart#removeValue
 * @function
 */


/**
 * Removes all the controls in the aggregation named <code>values</code>.<br/>
 * Additionally unregisters them from the hosting UIArea.
 * @return {sap.makit.Value[]} an array of the removed elements (might be empty)
 * @public
 * @name sap.makit.Chart#removeAllValues
 * @function
 */


/**
 * Checks for the provided <code>sap.makit.Value</code> in the aggregation named <code>values</code> 
 * and returns its index if found or -1 otherwise.
 *
 * @param {sap.makit.Value}
 *            oValue the value whose index is looked for.
 * @return {int} the index of the provided control in the aggregation if found, or -1 otherwise
 * @public
 * @name sap.makit.Chart#indexOfValue
 * @function
 */


/**
 * Destroys all the values in the aggregation 
 * named <code>values</code>.
 * @return {sap.makit.Chart} <code>this</code> to allow method chaining
 * @public
 * @name sap.makit.Chart#destroyValues
 * @function
 */
	
/**
 * Getter for aggregation <code>category</code>.<br/>
 * Data region property of the chart's Category
 * 
 * @return {sap.makit.Category}
 * @public
 * @name sap.makit.Chart#getCategory
 * @function
 */

/**
 * Setter for the aggregated <code>category</code>.
 * @param oCategory {sap.makit.Category}
 * @return {sap.makit.Chart} <code>this</code> to allow method chaining
 * @public
 * @name sap.makit.Chart#setCategory
 * @function
 */


/**
 * Destroys the category in the aggregation 
 * named <code>category</code>.
 * @return {sap.makit.Chart} <code>this</code> to allow method chaining
 * @public
 * @name sap.makit.Chart#destroyCategory
 * @function
 */

/**
 * Double tap event on chart 
 *
 * @name sap.makit.Chart#doubletap
 * @event
 * @param {sap.ui.base.Event} oControlEvent
 * @param {sap.ui.base.EventProvider} oControlEvent.getSource
 * @param {object} oControlEvent.getParameters

 * @public
 */
 
/**
 * Attach event handler <code>fnFunction</code> to the 'doubletap' event of this <code>sap.makit.Chart</code>.<br/>.
 * When called, the context of the event handler (its <code>this</code>) will be bound to <code>oListener<code> if specified
 * otherwise to this <code>sap.makit.Chart</code>.<br/> itself. 
 *  
 * Double tap event on chart 
 *
 * @param {object}
 *            [oData] An application specific payload object, that will be passed to the event handler along with the event object when firing the event.
 * @param {function}
 *            fnFunction The function to call, when the event occurs.  
 * @param {object}
 *            [oListener=this] Context object to call the event handler with. Defaults to this <code>sap.makit.Chart</code>.<br/> itself.
 *
 * @return {sap.makit.Chart} <code>this</code> to allow method chaining
 * @public
 * @name sap.makit.Chart#attachDoubletap
 * @function
 */


/**
 * Detach event handler <code>fnFunction</code> from the 'doubletap' event of this <code>sap.makit.Chart</code>.<br/>
 *
 * The passed function and listener object must match the ones used for event registration.
 *
 * @param {function}
 *            fnFunction The function to call, when the event occurs.
 * @param {object}
 *            oListener Context object on which the given function had to be called.
 * @return {sap.makit.Chart} <code>this</code> to allow method chaining
 * @public
 * @name sap.makit.Chart#detachDoubletap
 * @function
 */


/**
 * Fire event doubletap to attached listeners.

 * @param {Map} [mArguments] the arguments to pass along with the event.
 * @return {sap.makit.Chart} <code>this</code> to allow method chaining
 * @protected
 * @name sap.makit.Chart#fireDoubletap
 * @function
 */

/**
 * Single tap event on the chart 
 *
 * @name sap.makit.Chart#tap
 * @event
 * @param {sap.ui.base.Event} oControlEvent
 * @param {sap.ui.base.EventProvider} oControlEvent.getSource
 * @param {object} oControlEvent.getParameters

 * @public
 */
 
/**
 * Attach event handler <code>fnFunction</code> to the 'tap' event of this <code>sap.makit.Chart</code>.<br/>.
 * When called, the context of the event handler (its <code>this</code>) will be bound to <code>oListener<code> if specified
 * otherwise to this <code>sap.makit.Chart</code>.<br/> itself. 
 *  
 * Single tap event on the chart 
 *
 * @param {object}
 *            [oData] An application specific payload object, that will be passed to the event handler along with the event object when firing the event.
 * @param {function}
 *            fnFunction The function to call, when the event occurs.  
 * @param {object}
 *            [oListener=this] Context object to call the event handler with. Defaults to this <code>sap.makit.Chart</code>.<br/> itself.
 *
 * @return {sap.makit.Chart} <code>this</code> to allow method chaining
 * @public
 * @name sap.makit.Chart#attachTap
 * @function
 */


/**
 * Detach event handler <code>fnFunction</code> from the 'tap' event of this <code>sap.makit.Chart</code>.<br/>
 *
 * The passed function and listener object must match the ones used for event registration.
 *
 * @param {function}
 *            fnFunction The function to call, when the event occurs.
 * @param {object}
 *            oListener Context object on which the given function had to be called.
 * @return {sap.makit.Chart} <code>this</code> to allow method chaining
 * @public
 * @name sap.makit.Chart#detachTap
 * @function
 */


/**
 * Fire event tap to attached listeners.

 * @param {Map} [mArguments] the arguments to pass along with the event.
 * @return {sap.makit.Chart} <code>this</code> to allow method chaining
 * @protected
 * @name sap.makit.Chart#fireTap
 * @function
 */

/**
 * Get the value of the currently highlighted category
 *
 * @name sap.makit.Chart.prototype.getSelectedCategory
 * @function

 * @type string
 * @public
 */


/**
 * Get the value of the currently highlighted series
 *
 * @name sap.makit.Chart.prototype.getSelectedSeries
 * @function

 * @type string
 * @public
 */


/**
 * Get the number of distinct category values
 *
 * @name sap.makit.Chart.prototype.getNumberOfCategories
 * @function

 * @type int
 * @public
 */


// Start of sap\makit\Chart.js
/*!
 * @copyright@
 */

jQuery.sap.require("sap.makit.js.SybaseMA");
jQuery.sap.declare("sap.makit.js.SybaseMA");

/*
 * Static function to handle theme change event.
 * We only need to do getStyles once because it is applied globally
 * 
 * @private
 * */
sap.makit.Chart._onThemeChanged = function (oEvent){
	window.$MA.Chart.getStyles();
};

//Static init function to prepare the Makit library
// Immediately executed when this library is loaded
sap.makit.Chart._libraryInit = function () {
	//Set the images folder
	var imgName = "popup_tt_left.png"; // Use one the image's filename from chart range selector
	var path = sap.ui.resource("sap.makit", "themes/base/images/"+imgName); //Get the correct resource path
	path = path.substring(0, path.length - imgName.length); //We don't need the filename.
	window.$MA.setImagesFolder(path);
	sap.ui.getCore().attachThemeChanged(sap.makit.Chart._onThemeChanged);
	window.$MA.Chart.getStyles(); //Ideally we should call this function whenever styles has changed 
}();

/**
 * @override
 */
sap.makit.Chart.prototype.init = function() {
	//Private variable
	this._makitChart = null;
	
	this._datarows = []; //This is the placeholder for the Chart's data row it's a 1-to-1 mapping to rows aggregation.
	this._styleClasses = []; //workaround for custom classes

	this.setCategoryAxis(new sap.makit.CategoryAxis());
	this.setValueAxis(new sap.makit.ValueAxis());
	this.setValueBubble(new sap.makit.ValueBubble());
	
	this.attachEvent("_change", this._onPropertyChanged);
	sap.ui.getCore().attachThemeChanged(this._applyCSS, this);
};

/**
 * Attempt to preserve the chart's DOM reference before re-rendering it
 * @override
 */
sap.makit.Chart.prototype.onBeforeRendering = function(oEvent) {
	if(this.getDomRef() && !sap.ui.core.RenderManager.isPreservedContent(this.getDomRef())){
		sap.ui.core.RenderManager.preserveContent(this.getDomRef(), /* bPreserveRoot */ true, /* bPreserveNodesWithId */ false);
	}
};

/**
 * Once the place holder is rendered, we will create the MAKit chart object or 
 * retrieve the preserved chart DOM reference if exists.
 * @override
 */
sap.makit.Chart.prototype.onAfterRendering = function(oEvent) {
	var $placeholder = jQuery(jQuery.sap.domById("sap-ui-dummy-" + this.getId()));
	var $oldContent = sap.ui.core.RenderManager.findPreservedContent(this.getId());
	var $newContent = null;
	
	if ($oldContent.size() == 0) {
		this._createChartObject();
		$newContent = new jQuery(this.getDomRef());
		$placeholder.replaceWith($newContent);
		var parent = this.getParent();
		var parentId = parent.getId();
		var parentDom = jQuery.sap.domById(parentId);
		sap.ui.core.ResizeHandler.register(parentDom, jQuery.proxy(this._onResize, this));
	} else if ( $oldContent.size() > 0 ) {
		// replace dummy with old content
		$placeholder.replaceWith($oldContent);
	} else {
		$placeholder.remove();
	}
	
	this._setDataTable();
	if($newContent) {
		this._makitChart.showRangeSelectorView(this.getShowRangeSelector());
		this._makitChart.showTableView(this.getShowTableView());
	}
};


/** 
 * WORKAROUND: MAKit chart current behavior overwrite the div's css class when it's created
 *				So we need to intercept addition of custom style classes before
 *				this._makitChart is created.
 * @override
 */
sap.makit.Chart.prototype.addStyleClass = function(sStyleClass, bSuppressRerendering) {
	 //If it's already in the control, then it is in the _styleClasses array
	if (this._styleClasses.indexOf(sStyleClass) === -1) {
		this._styleClasses.push(sStyleClass);
	}

	if(this._makitChart) {
		sap.ui.core.Control.prototype.addStyleClass.call(this, sStyleClass, bSuppressRerendering);
	}
	return this;
};

/**
 * @override
 */
sap.makit.Chart.prototype.removeStyleClass = function(sStyleClass, bSuppressRerendering) {
	var idx = this._styleClasses.indexOf(sStyleClass);
	if (idx > -1) {
		this._styleClasses.splice(idx, 1);
	}

	if(this._makitChart) {
		sap.ui.core.Control.prototype.removeStyleClass.call(this, sStyleClass, bSuppressRerendering);
	}
	return this;
};

/**
 * @override
 */
sap.makit.Chart.prototype.bindAggregation = function(sName, oBindingInfo) {
	// special handling for the rows aggregation
	if (sName === "rows") {
		// old API compatibility (sName, sPath, oTemplate, oSorter, aFilters)
		if (typeof oBindingInfo == "string") {
			oBindingInfo = {
				path: arguments[1],
				template: arguments[2],
				sorter: arguments[3], 
				filters: arguments[4]
			};
		}
		// the rows aggregation has neither a template nor a factory function!
		oBindingInfo.template = undefined;
		oBindingInfo.factory = function() {};
		// call the real bindAggregation method
		return sap.ui.core.Element.prototype.bindAggregation.call(this, sName, oBindingInfo); 
	}
	// call the real bindAggregation method
	return sap.ui.core.Element.prototype.bindAggregation.apply(this, arguments);
};

/** 
 * User should not use these API programmatically.
 * @override
 */
sap.makit.Chart.prototype.addRow = function(oRow){
	jQuery.sap.log.error("The control manages the rows aggregation. The method \"addRow\" cannot be used programmatically!");
};

/**
 * @override
 */
sap.makit.Chart.prototype.insertRow = function(oRow, iIndex){
	jQuery.sap.log.error("The control manages the rows aggregation. The method \"insertRow\" cannot be used programmatically!");
};

/**
 * @override
 */
sap.makit.Chart.prototype.removeRow = function(vRow){
	jQuery.sap.log.error("The control manages the rows aggregation. The method \"removeRow\" cannot be used programmatically!");
};

/**
 * @override
 */
sap.makit.Chart.prototype.removeAllRows = function(){
	jQuery.sap.log.error("The control manages the rows aggregation. The method \"removeAllRows\" cannot be used programmatically!");
};

/**
 * @override
 */
sap.makit.Chart.prototype.destroyRows = function(vRow){
	jQuery.sap.log.error("The control manages the rows aggregation. The method \"destroyRows\" cannot be used programmatically!");
};

/**
 * @override
 */
sap.makit.Chart.prototype.updateRows = function(){
	this._createRows();
	if (this._makitChart) {
		this._setDataTable();
	}
};

/**
 * @override
 */
sap.makit.Chart.prototype.setValueBubble = function(oValueBubble){
	if (oValueBubble instanceof sap.makit.ValueBubble) {
		sap.ui.core.Element.prototype.setProperty.call(this, "valueBubble", oValueBubble, false);
		oValueBubble.attachEvent("_change", this._onValueBubbleChanged, this);
		if (this._makitChart) {
			var valueBubbleObj = oValueBubble.toObject();
			this._makitChart.setValueBubbleStyle(valueBubbleObj);
			if (this._makitChart.isValueBubbleVisible() != valueBubbleObj.visible) {
				this._makitChart.showValueBubble(valueBubbleObj.visible);
			}
		}
	}
	else {
		throw new Error("valueBubble property must be of type sap.makit.ValueBubble");
	}
	return this;
};

/**
 * @override
 */
sap.makit.Chart.prototype.setCategory = function(oCategory){
	sap.ui.core.Element.prototype.setAggregation.call(this, "category", oCategory, false);
	oCategory.attachEvent("_change", {type: "category"}, this._onDataRegionPropChanged, this);
	return this;
};

/**
 * @override
 */
sap.makit.Chart.prototype.addValue= function(oValue){
	sap.ui.core.Element.prototype.addAggregation.call(this, "values", oValue, false);
	oValue.attachEvent("_change", {type: "values"}, this._onDataRegionPropChanged, this);
	return this;
};

/**
 * @override
 */
sap.makit.Chart.prototype.setSeries = function(oSeries){
	sap.ui.core.Element.prototype.setAggregation.call(this, "series", oSeries, false);
	oSeries.attachEvent("_change", {type: "series"}, this._onDataRegionPropChanged, this);
	return this;
};

/**
 * @override
 */
sap.makit.Chart.prototype.setValueAxis = function (oValueAxis){
	if (oValueAxis instanceof sap.makit.ValueAxis) {
		sap.ui.core.Element.prototype.setProperty.call(this, "valueAxis", oValueAxis, false);
		oValueAxis.attachEvent("_change", { axis:"values" }, this._onAxisPropChanged, this);
	}
	else {
		throw new Error("valueAxis property must be of type sap.makit.ValueAxis");
	}
	return this;
};

/**
 * @override
 */
sap.makit.Chart.prototype.setCategoryAxis = function (oCategoryAxis){
	if (oCategoryAxis instanceof sap.makit.CategoryAxis) {
		sap.ui.core.Element.prototype.setProperty.call(this, "categoryAxis", oCategoryAxis, false);
		oCategoryAxis.attachEvent("_change", { axis:"category" }, this._onAxisPropChanged, this);
	}
	else {
		throw new Error("categoryAxis property must be of type sap.makit.CategoryAxis");
	}
	return this;
};

/*=================================================================================
 *== PRIVATE METHODS
 *=================================================================================
 **/

/**
 * Set the Chart's height. Canvas does not support % height, 
 * so it need to have an absolute height
 * 
 * @return true, if the height is using % value, false otherwise
 * 
 * @private
 * 
 * */
sap.makit.Chart.prototype._setRealHeight = function(height){
	var elem = this.getDomRef();
	if(height.indexOf("%") > -1) {
		var intHeight = parseInt(height, 10);
		var parent = this.getParent();
		var parentId = parent.getId();
		var parentDom = jQuery.sap.domById(parentId);
		var realHeight = Math.ceil(parentDom.offsetHeight * (intHeight / 100));
		elem.style.height = realHeight + "px";
		return true;
	}
	else {
		elem.style.height = height;
	}
	return false;
};

/**
 * We will construct the row aggregation in this function
 * 
 * @private
 * 
 * */
sap.makit.Chart.prototype._createRows = function() {
	var oTemplate = new sap.makit.Row(this.getId() + "-dummyrows");
	var aCols = this.getColumns();
	for (var i = 0, l = aCols.length; i < l; i++) {
		var oColTemplate = aCols[i];
		if (oColTemplate) {
			var name = aCols[i].getName();
			var oClone = oColTemplate.clone("col" + i);
			oClone.data("sap-ui-colindex", i);
			oTemplate.addAggregation("cells",oClone);
		}
	}

	this.destroyAggregation("rows");
	var aContexts = undefined;
	var oBinding = this.getBinding("rows");
	if (oBinding) {
		aContexts = oBinding.getContexts();
	}
	var totalRows = oBinding.getLength();
	this._datarows = [];
	for (var i = 0; i < totalRows; i++) {
		if (aContexts && aContexts[i]) {
			var oClone = oTemplate.clone("row" + i);
			oClone.setBindingContext(aContexts[i]);
			this.addAggregation("rows", oClone);
			this._datarows.push(oClone._datarow);
		}
	}

	// destroy the template
	oTemplate.destroy();
};

/**
 * Create and initialize the MAKit $MA.Chart object
 * 
 * @private
 * 
 * */
sap.makit.Chart.prototype._createChartObject = function (){
	var elem = this.getDomRef();
	jQuery.sap.assert(elem, "Chart's DomRef is not ready");
	
	elem.style.width = this.getWidth();
	this._setRealHeight(this.getHeight());

	this._makitChart = new window.$MA.Chart(this.getId(), true);
	var that = this;

	var syntax = this._getChartSyntax();
	console.log(syntax);

	this._makitChart.create(syntax);
	this._makitChart.showToolBar(false);
	this._setMakitChartProperties();

	this._makitChart.bind("tap", function() {
		that.fireTap({/* no parameters */});
	});
	this._makitChart.bind("doubletap", function() {
		that.fireEvent("doubletap", that);
	});

	//workaround for overwritten classes
	var len = this._styleClasses.length;
	for (var i = 0; i < len; i++ ){
		this.addStyleClass(this._styleClasses[i]);
	}
	
	this._applyCSS();
	
};

/**
 * This function is used to apply the Makit properties that will be reset when changing chart type. 
 * 
 * @private
 * 
 * */
sap.makit.Chart.prototype._setMakitChartProperties = function() {
	if (!this._makitChart) {
		return;
	}
	if(this.getType() === sap.makit.ChartType.Pie || this.getType() === sap.makit.ChartType.Donut) {
		this._makitChart.setLegend(this.getLegendPosition().toLowerCase());
	}
	// We should only apply this if the chart's data has been initialised at least once
	if(this._dataInitialized){
		this._makitChart.showTableView(this.getShowTableView());
		this._makitChart.showRangeSelectorView(this.getShowRangeSelector());
	}

	var valueBubble = this.getValueBubble();
	if (valueBubble) {
		var valueBubbleObj = valueBubble.toObject();
		this._makitChart.setValueBubbleStyle(valueBubbleObj);
		if (this._makitChart.isValueBubbleVisible() != valueBubbleObj.visible) {
			this._makitChart.showValueBubble(valueBubbleObj.visible);
		}
	}
};

/**
 * Generate the MAKit chart metadata syntax based on the sap.makit.Chart properties.
 * To be used to create the MAKit chart.
 * 
 * @private
 * 
 * */
sap.makit.Chart.prototype._getChartSyntax = function() {
	var categoryAxisObj = this.getCategoryAxis();
	var categoryObj = this.getCategory();
	if (categoryObj){
		var categorySyntax = '<Category column="' + categoryObj.getColumn() + '"';
		if (categoryObj.getFormat()) {
				categorySyntax += ' format="' + categoryObj.getFormat() + '"';
		}
		if (categoryObj.getDisplayName()) {
			categorySyntax += ' displayname="' + categoryObj.getDisplayName() + '"';
		}
		if(categoryAxisObj) {
			categorySyntax += ' showprimaryline="'+ categoryAxisObj.getShowPrimaryLine() +'"';
			categorySyntax += ' showgrid="'+ categoryAxisObj.getShowGrid() +'"';
			categorySyntax += ' showlabel="'+ categoryAxisObj.getShowLabel() +'"';
			categorySyntax += ' thickness="'+ categoryAxisObj.getThickness() +'"';
			categorySyntax += ' color="'+ categoryAxisObj.getColor() +'"';
			categorySyntax += ' sortorder="'+ categoryAxisObj.getSortOrder().toLowerCase() +'"';
			categorySyntax += ' displaylastlabel="'+ categoryAxisObj.getDisplayLastLabel() +'"';
		}
		categorySyntax += ' />';
	}
	else {
		throw new Error("Chart '"+ this.getId() +"' needs at least one Category data region");
	}

	var seriesObj = this.getSeries();
	var seriesSyntax = '';
	if (seriesObj) {
		seriesSyntax = '<Series Column="' + seriesObj.getColumn() + '"';
		if (seriesObj.getFormat()) {
			seriesSyntax += ' format="' + seriesObj.getFormat() + '"';
		}
		if (seriesObj.getDisplayName()) {
			seriesSyntax += ' displayname="' + seriesObj.getDisplayName() + '"';
		}
		seriesSyntax += '/>';
	}

	var valueAxisObj = this.getValueAxis();
	var valuesSyntax = '<Values>';
	if(valueAxisObj) {
		valuesSyntax = '<Values';
		valuesSyntax += ' showprimaryline="'+ valueAxisObj.getShowPrimaryLine() +'"';
		valuesSyntax += ' showgrid="'+ valueAxisObj.getShowGrid() +'"';
		valuesSyntax += ' showlabel="'+ valueAxisObj.getShowLabel() +'"';
		valuesSyntax += ' thickness="'+ valueAxisObj.getThickness() +'"';
		valuesSyntax += ' color="'+ valueAxisObj.getColor() +'"';
		if(valueAxisObj.getMin() !== "") {
			valuesSyntax += ' min="'+ valueAxisObj.getMin() +'"';
		}
		if(valueAxisObj.getMax() !== "") {
			valuesSyntax += ' max="'+ valueAxisObj.getMax() +'"';
		}
		valuesSyntax += '>';
	}

	var valuesObj = this.getValues();
	var length = valuesObj.length;
	if (length == 0) {
		throw new Error("Chart '"+ this.getId() +"' needs at least one Value data region");
	}
	var valueObj;
	for (var i = 0; i < length; i++) {
		valueObj = valuesObj[i];
		valuesSyntax += '<Value Expression="' + valueObj.getExpression() + '"';
		if (valueObj.getFormat()) {
			valuesSyntax += ' format="' + valueObj.getFormat() + '"';
		}
		if (valueObj.getDisplayName()) {
			valuesSyntax += ' displayname="' + valueObj.getDisplayName() + '"';
		}
		valuesSyntax += '/>';
	}
	valuesSyntax += '</Values>';

	var type = this.getType().toLowerCase();
	var pieStyle = null;
	if (type === "donut" || type === "pie"){
		pieStyle = type; // it's the pieStyle that can be pie or donut
		type = "pie"; // in MAKit the chart's type is always pie for Pie/Donut chart
	}
	var chartSyntax = '<Chart ChartType="' + type + '"';
	if(pieStyle !== null) {
		chartSyntax += ' PieStyle="' + pieStyle + '"';
	}
	chartSyntax += ' >';

	chartSyntax += categorySyntax;
	if (seriesObj) {
		chartSyntax += seriesSyntax;
	}
	chartSyntax += valuesSyntax;
	chartSyntax += '</Chart>';

	return chartSyntax;
};

/**
 * Update the data table of MAKit chart. 
 * 
 * @private
 * 
 * */
sap.makit.Chart.prototype._setDataTable = function() {
	//Use delayed call to prevent setDataTable to be called too fast and too many times in a short period.
	this._setDataTableTimer = this._setDataTableTimer || jQuery.sap.delayedCall(150, this, function(){
		jQuery.sap.assert(this._makitChart, "_makitChart is not initialized");
		if(this._datarows && this._datarows.length > 0){
			var data = this._datarows;
			var dataTable = new window.$MA.DataTable();
			var columns = this.getColumns();
			var colLen = columns.length;
			if (colLen == 0) {
				columns = this.getRows()[0].getCells();
				colLen = columns.length;
			}
			for (var i = 0; i < colLen; i++){
				dataTable.addColumn(columns[i].getName(), columns[i].getType());
			}

			dataTable.addRows(data);
			this._makitChart.setDataTable(dataTable);
			this._dataInitialized = true;
		}
		this._setDataTableTimer = undefined;
	});
};


/** 
 * Read and parse the css classes in the document and apply those style to the MAKit Chart 
 * 
 * @private
 */
sap.makit.Chart.prototype._applyCSS = function(oEvent) {
	if (this._makitChart){
		this._makitChart.applyCSS();
	}
};


/*===================================================================================
 *=	PRIVATE EVENT HANDLERS
 *===================================================================================
 **/

/**
 * Handler for onresize event. 
 * 
 * @private
 * 
 * */
sap.makit.Chart.prototype._onResize = function(oEvent) {
	var needRefresh = this._setRealHeight(this.getHeight());
	if (needRefresh && this._makitChart != null){
		this._setMakitChartProperties();
		this._setDataTable();
		//this._makitChart.refresh();
	}
};

/**
 * Handler for Chart's direct properties change. 
 * 
 * @private
 * 
 * */
sap.makit.Chart.prototype._onPropertyChanged = function(oEvent){
	if (!this._makitChart) {
		return;
	}
	var name = oEvent.mParameters["name"];
	var newVal = oEvent.mParameters["newValue"];
	if(this._makitChart){
		if (name === "type") {
			var type = newVal.toLowerCase();
			var pieStyle = null;
			if (type === "donut" || type === "pie"){
				pieStyle = type; // it's the pieStyle that can be pie or donut
				type = "pie"; // in MAKit the chart's type is always pie for Pie/Donut chart
				this._makitChart.setProperty("PieStyle", pieStyle); //Must make sure this is called before set ChartType
			}
			this._makitChart.setProperty("ChartType", type);
			this._makitChart.showToolBar(false);
			this._setMakitChartProperties();
		} else if (name === "showRangeSelector") {
			this._makitChart.showRangeSelectorView(newVal);
		}
		else if (name === "showTableView") {
			this._makitChart.showTableView(newVal);
		}
		else if (name === "legendPosition") {
			if(this.getType() === sap.makit.ChartType.Pie || this.getType() === sap.makit.ChartType.Donut) {
				this._makitChart.setLegend(newVal.toLowerCase());
			}
		}
		else if(name === "width") {
			this.getDomRef().style.width = this.getWidth();
		}
		else if(name === "height") {
			this._setRealHeight(newVal);
		}
	}
}

/**
 * Handler for Category, Value and Series data region property change 
 * 
 * @private
 * 
 * */
sap.makit.Chart.prototype._onDataRegionPropChanged = function(oEvent, oData){
	jQuery.sap.assert(oData, "oData is expected to be set in _onDataRegionPropChanged");
	if (!this._makitChart) {
		return;
	}
	var oParams = oEvent.mParameters;
	if (oData["type"] == "values") {
		var valObj = oEvent.oSource;
		var idx = this.indexOfValue(valObj);
		if(idx > -1){
			this._makitChart.setProperty(oData["type"] + "["+idx+"]." + oParams["name"], oParams["newValue"]);
		}
	}
	else {
		this._makitChart.setProperty(oData["type"] + "." + oParams["name"], oParams["newValue"]);
	}
};

/**
 * Handler for CategoryAxis and ValueAxis change 
 * 
 * @private
 * 
 * */
sap.makit.Chart.prototype._onAxisPropChanged = function(oEvent, oData){
	jQuery.sap.assert(oData, "oData is expected to be set in _onAxisPropChanged");
	if (!this._makitChart) {
		return;
	}
	var oParams = oEvent.mParameters;
	var sName =  oParams["name"].toLowerCase();
	var value =  oParams["newValue"];
	// Sortorder in makit only accepts lowercase value 
	if (sName === "sortorder") {
		value = value.toLowerCase();
	}
	this._makitChart.setProperty(oData["axis"] + "." + sName, value);
	if (sName === "sortorder") {
		this._setDataTable();
	}
	
};

/**
 * Handler for ValueBubble properties change 
 * 
 * @private
 * 
 * */
sap.makit.Chart.prototype._onValueBubbleChanged = function (oEvent){
	if (!this._makitChart) {
		return;
	}
	var valueBubbleObj = this.getValueBubble().toObject();
	this._makitChart.setValueBubbleStyle(valueBubbleObj);
	if (this._makitChart.isValueBubbleVisible() != valueBubbleObj.visible) {
		this._makitChart.showValueBubble(valueBubbleObj.visible);
	}
	this._makitChart.refresh();
};

/*=================================================================================
 *== PUBLIC METHODS
 *=================================================================================
 **/

/**
 * See the generated JSDoc for the documentation of this public function
 * 
 * @public
 * */
sap.makit.Chart.prototype.getSelectedCategory = function() {
	var selectedCategory = undefined;
	if (this._makitChart){
		selectedCategory = this._makitChart.getSelectedCategory();
	}
	return selectedCategory;
};

/**
 * See the generated JSDoc for the documentation of this public function
 * 
 * @public
 * */
sap.makit.Chart.prototype.getSelectedSeries = function() {
	var selectedSeries = undefined;
	if (this._makitChart){
		selectedSeries = this._makitChart.getSelectedSeries();
	}
	return selectedSeries;
};

/**
 * See the generated JSDoc for the documentation of this public function
 * 
 * @public
 * */
sap.makit.Chart.prototype.getNumberOfCategories = function() {
	var numOfCat = undefined;
	if (this._makitChart){
		numOfCat = this._makitChart.getNumberOfCategories();
	}
	return numOfCat;
};

