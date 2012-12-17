/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 * 
 * (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

/* ----------------------------------------------------------------------------------
 * Hint: This is a derived (generated) file. Changes should be done in the underlying 
 * source files only (*.control, *.js) or they will be lost after the next generation.
 * ---------------------------------------------------------------------------------- */

// Provides control sap.makit.Row.
jQuery.sap.declare("sap.makit.Row");
jQuery.sap.require("sap.makit.library");
jQuery.sap.require("sap.ui.core.Element");

/**
 * Constructor for a new Row.
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
 * <ul></ul>
 * </li>
 * <li>Aggregations
 * <ul>
 * <li>{@link #getCells cells} : sap.makit.Column[]</li></ul>
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
 * The data row of the Chart's data table
 * @extends sap.ui.core.Element
 *
 * @author SAP AG 
 * @version 1.9.1-SNAPSHOT
 *
 * @constructor   
 * @public
 * @experimental Since version 1.8. 
 * API is not yet finished and might change completely
 * @name sap.makit.Row
 */
sap.ui.core.Element.extend("sap.makit.Row", { metadata : {

	// ---- object ----

	// ---- control specific ----
	library : "sap.makit",
	aggregations : {
    	"cells" : {type : "sap.makit.Column", multiple : true, singularName : "cell"}
	}
}});


/**
 * Creates a new subclass of class sap.makit.Row with name <code>sClassName</code> 
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
 * @name sap.makit.Row.extend
 * @function
 */

	
/**
 * Getter for aggregation <code>cells</code>.<br/>
 * Representing the cells of the row. User should not add individual cells. The cells will be added automatically via Column mapping.
 * 
 * @return {sap.makit.Column[]}
 * @public
 * @name sap.makit.Row#getCells
 * @function
 */

/**
 * Inserts a cell into the aggregation named <code>cells</code>.
 *
 * @param {sap.makit.Column}
 *          oCell the cell to insert; if empty, nothing is inserted
 * @param {int}
 *             iIndex the <code>0</code>-based index the cell should be inserted at; for 
 *             a negative value of <code>iIndex</code>, the cell is inserted at position 0; for a value 
 *             greater than the current size of the aggregation, the cell is inserted at 
 *             the last position        
 * @return {sap.makit.Row} <code>this</code> to allow method chaining
 * @public
 * @name sap.makit.Row#insertCell
 * @function
 */


/**
 * Adds some cell <code>oCell</code> 
 * to the aggregation named <code>cells</code>.
 *
 * @param {sap.makit.Column}
 *            oCell the cell to add; if empty, nothing is inserted
 * @return {sap.makit.Row} <code>this</code> to allow method chaining
 * @public
 * @name sap.makit.Row#addCell
 * @function
 */


/**
 * Removes an cell from the aggregation named <code>cells</code>.
 *
 * @param {int | string | sap.makit.Column} vCell the cell to remove or its index or id
 * @return {sap.makit.Column} the removed cell or null
 * @public
 * @name sap.makit.Row#removeCell
 * @function
 */


/**
 * Removes all the controls in the aggregation named <code>cells</code>.<br/>
 * Additionally unregisters them from the hosting UIArea.
 * @return {sap.makit.Column[]} an array of the removed elements (might be empty)
 * @public
 * @name sap.makit.Row#removeAllCells
 * @function
 */


/**
 * Checks for the provided <code>sap.makit.Column</code> in the aggregation named <code>cells</code> 
 * and returns its index if found or -1 otherwise.
 *
 * @param {sap.makit.Column}
 *            oCell the cell whose index is looked for.
 * @return {int} the index of the provided control in the aggregation if found, or -1 otherwise
 * @public
 * @name sap.makit.Row#indexOfCell
 * @function
 */


/**
 * Destroys all the cells in the aggregation 
 * named <code>cells</code>.
 * @return {sap.makit.Row} <code>this</code> to allow method chaining
 * @public
 * @name sap.makit.Row#destroyCells
 * @function
 */

// Start of sap\makit\Row.js
/*!
 * @copyright@
 */

sap.makit.Row.prototype.init = function(){
	this._datarow = {};
};

sap.makit.Row.prototype.addCell = function(oCell){
	sap.ui.core.Element.prototype.addAggregation.call(this, "cells", oCell, false);
	var sId = this.getId();
	//We only want to attach event on real rows not on template rows.
	if (!jQuery.sap.endsWith(sId, "dummyrows")){	
		this._datarow[oCell.getName()] = oCell.getValue();
		oCell.attachEvent("_change", this.onCellChanged, this);
	}
};

sap.makit.Row.prototype.onCellChanged = function(oEvent){
	if (oEvent.mParameters['name'] === "name"){
		var oldName = oEvent.mParameters['oldValue'];
		var newName = oEvent.mParameters['newValue'];
		this._datarow[newName] = undefined;
		if(oldName && oldName !== ""){
			this._datarow[newName] = this._datarow[oldName];
			this._datarow[oldName] = null;
			this._datarow[oldName] = undefined;
			delete this._datarow[oldName];
		}
	}
	else if(oEvent.mParameters['name'] === "value"){
		var cellName = oEvent.oSource.getName();
		this._datarow[cellName] = oEvent.mParameters['newValue'];
	}
};
