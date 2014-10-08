/*!
 * ${copyright}
 */

// Provides class sap.ui.core.util.ExportCell
sap.ui.define(['jquery.sap.global', 'sap/ui/core/Element'],
	function(jQuery, Element) {
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
	 * <li>{@link #getContent content} : string</li></ul>
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
	 * @param {string} [sId] id for the new control, generated automatically if no id is given 
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * Contains content that can be used to export data. Used in {@link sap.ui.core.util.ExportColumn ExportColumn} / {@link sap.ui.core.util.Export Export}.
	 * @extends sap.ui.core.Element
	 *
	 * @author SAP SE
	 * @version ${version}
	 * @since 1.22.0
	 *
	 * @constructor
	 * @public
	 * @name sap.ui.core.util.ExportCell
	 */
	var ExportCell = Element.extend('sap.ui.core.util.ExportCell', {
		metadata: {
			properties: {
				content: 'string'
			}
		}
	});

	/**
	 * Creates a new subclass of class sap.ui.core.util.ExportCell with name <code>sClassName</code> 
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
	 * @name sap.ui.core.util.ExportCell.extend
	 * @function
	 */

	/**
	 * Getter for property <code>content</code>.
	 * Cell content.
	 *
	 * Default value is empty/<code>undefined</code>
	 *
	 * @return {string} the value of property <code>content</code>
	 * @public
	 * @name sap.ui.core.util.ExportCell#getContent
	 * @function
	 */

	/**
	 * Setter for property <code>content</code>.
	 *
	 * Default value is empty/<code>undefined</code> 
	 *
	 * @param {string} sContent  new value for property <code>content</code>
	 * @return {sap.ui.core.util.ExportCell} <code>this</code> to allow method chaining
	 * @public
	 * @name sap.ui.core.util.ExportCell#setContent
	 * @function
	 */

	return ExportCell;

}, /* bExport= */ true);
