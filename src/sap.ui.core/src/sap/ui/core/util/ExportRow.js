/*!
 * ${copyright}
 */

// Provides class sap.ui.core.util.ExportRow
sap.ui.define(['jquery.sap.global', 'sap/ui/base/ManagedObject', './ExportCell'],
	function(jQuery, ManagedObject, ExportCell) {
	'use strict';

	/**
	 * Constructor for a new ExportRow.
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
	 * <li>{@link #getCells cells} : sap.ui.core.util.ExportCell[]</li>
	 * </ul>
	 * </li>
	 * <li>Associations
	 * <ul></ul>
	 * </li>
	 * <li>Events
	 * <ul></ul>
	 * </li>
	 * </ul>

	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given 
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * Internally used in {@link sap.ui.core.util.Export Export}.
	 * @extends sap.ui.base.ManagedObject
	 *
	 * @author SAP SE
	 * @version ${version}
	 * @since 1.22.0
	 *
	 * @constructor
	 * @public
	 * @name sap.ui.core.util.ExportRow
	 */
	var ExportRow = ManagedObject.extend("sap.ui.core.util.ExportRow", {
		metadata: {
			aggregations: {
				cells: {
					type: "sap.ui.core.util.ExportCell",
					multiple: true
				}
			}
		}
	});

	/**
	 * Creates a new subclass of class sap.ui.core.util.ExportRow with name <code>sClassName</code> 
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
	 * @name sap.ui.core.util.ExportRow.extend
	 * @function
	 */

	/**
	 * Getter for aggregation <code>cells</code>.<br/>
	 * Cells for the Export.
	 *
	 * @return {sap.ui.core.util.ExportCell[]}
	 * @public
	 * @name sap.ui.core.util.ExportRow#getCells
	 * @function
	 */

	/**
	 * Inserts a cell into the aggregation named <code>cells</code>.
	 *
	 * @param {sap.ui.core.util.ExportCell}
	 *          oCell the cell to insert; if empty, nothing is inserted
	 * @param {int}
	 *             iIndex the <code>0</code>-based index the cell should be inserted at; for
	 *             a negative value of <code>iIndex</code>, the cell is inserted at position 0; for a value
	 *             greater than the current size of the aggregation, the cell is inserted at
	 *             the last position
	 * @return {sap.ui.core.util.ExportRow} <code>this</code> to allow method chaining
	 * @public
	 * @name sap.ui.core.util.ExportRow#insertCell
	 * @function
	 */

	/**
	 * Adds some cell <code>oCell</code> 
	 * to the aggregation named <code>cells</code>.
	 *
	 * @param {sap.ui.core.util.ExportCell}
	 *            oCell the cell to add; if empty, nothing is inserted
	 * @return {sap.ui.core.util.ExportRow} <code>this</code> to allow method chaining
	 * @public
	 * @name sap.ui.core.util.ExportRow#addCell
	 * @function
	 */

	/**
	 * Removes an cell from the aggregation named <code>cells</code>.
	 *
	 * @param {int | string | sap.ui.core.util.ExportCell} vCell the cell to remove or its index or id
	 * @return {sap.ui.core.util.ExportCell} the removed cell or null
	 * @public
	 * @name sap.ui.core.util.ExportRow#removeCell
	 * @function
	 */

	/**
	 * Removes all the controls in the aggregation named <code>cells</code>.<br/>
	 * Additionally unregisters them from the hosting UIArea.
	 * @return {sap.ui.core.util.ExportCell[]} an array of the removed elements (might be empty)
	 * @public
	 * @name sap.ui.core.util.ExportRow#removeAllCells
	 * @function
	 */

	/**
	 * Checks for the provided <code>sap.ui.core.util.ExportCell</code> in the aggregation named <code>cells</code> 
	 * and returns its index if found or -1 otherwise.
	 *
	 * @param {sap.ui.core.util.ExportCell}
	 *            oCell the cell whose index is looked for.
	 * @return {int} the index of the provided control in the aggregation if found, or -1 otherwise
	 * @public
	 * @name sap.ui.core.util.ExportRow#indexOfCell
	 * @function
	 */

	/**
	 * Destroys all the cells in the aggregation 
	 * named <code>cells</code>.
	 * @return {sap.ui.core.util.ExportRow} <code>this</code> to allow method chaining
	 * @public
	 * @name sap.ui.core.util.ExportRow#destroyCells
	 * @function
	 */

	return ExportRow;

}, /* bExport= */ true);
