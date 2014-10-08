/*!
 * ${copyright}
 */

// Provides class sap.ui.core.util.ExportColumn
sap.ui.define(['jquery.sap.global', 'sap/ui/base/ManagedObject', './ExportCell'],
	function(jQuery, ManagedObject, ExportCell) {
	'use strict';

	/**
	 * Constructor for a new ExportCell.
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
	 * <li>{@link #getName name} : string</li></ul>
	 * </li>
	 * <li>Aggregations
	 * <ul>
	 * <li>{@link #getTemplate template} : sap.ui.core.util.ExportCell</li>
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
	 * Can have a name and a cell template.
	 * @extends sap.ui.base.ManagedObject
	 *
	 * @author SAP SE
	 * @version ${version}
	 * @since 1.22.0
	 *
	 * @constructor
	 * @public
	 * @name sap.ui.core.util.ExportColumn
	 */
	var ExportColumn = ManagedObject.extend("sap.ui.core.util.ExportColumn", {
		metadata: {
			properties: {
				name: "string"
			},
			aggregations: {
				template: {
					type: "sap.ui.core.util.ExportCell",
					multiple: false
				}
			}
		}
	});

	/**
	 * Creates a new subclass of class sap.ui.core.util.ExportColumn with name <code>sClassName</code> 
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
	 * @name sap.ui.core.util.ExportColumn.extend
	 * @function
	 */

	/**
	 * Getter for property <code>name</code>.
	 * Column name.
	 *
	 * Default value is empty/<code>undefined</code>
	 *
	 * @return {string} the value of property <code>name</code>
	 * @public
	 * @name sap.ui.core.util.ExportColumn#getName
	 * @function
	 */

	/**
	 * Setter for property <code>name</code>.
	 *
	 * Default value is empty/<code>undefined</code> 
	 *
	 * @param {string} sName  new value for property <code>content</code>
	 * @return {sap.ui.core.util.ExportColumn} <code>this</code> to allow method chaining
	 * @public
	 * @name sap.ui.core.util.ExportColumn#setName
	 * @function
	 */

	/**
	 * Getter for aggregation <code>template</code>.<br/>
	 * Cell template for column.
	 *
	 * @return {sap.ui.core.util.ExportCell}
	 * @public
	 * @name sap.ui.core.util.ExportColumn#getTemplate
	 * @function
	 */

	/**
	 * Setter for the aggregated <code>template</code>.
	 * @param {sap.ui.core.util.ExportCell} oTemplate
	 * @return {sap.ui.core.util.ExportColumn} <code>this</code> to allow method chaining
	 * @public
	 * @name sap.ui.core.util.ExportColumn#setTemplate
	 * @function
	 */

	/**
	 * Destroys the template in the aggregation 
	 * named <code>template</code>.
	 * @return {sap.ui.core.util.ExportColumn} <code>this</code> to allow method chaining
	 * @public
	 * @name sap.ui.core.util.ExportColumn#destroyTemplate
	 * @function
	 */

	return ExportColumn;

}, /* bExport= */ true);
