/*!
 * ${copyright}
 */

// Provides control sap.ui.commons.form.FormElement.
sap.ui.define(['sap/ui/commons/library', 'sap/ui/layout/form/FormElement'],
	function(library, LayoutFormElement) {
	"use strict";



	/**
	 * Constructor for a new form/FormElement.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * A form element is a combination of one label and different controls associated to this label.
	 * @extends sap.ui.layout.form.FormElement
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.9.1
	 * @deprecated Since version 1.16.0.
	 * moved to sap.ui.layout library. Please use this one.
	 * @alias sap.ui.commons.form.FormElement
	 */
	var FormElement = LayoutFormElement.extend("sap.ui.commons.form.FormElement", /** @lends sap.ui.commons.form.FormElement.prototype */ { metadata : {

		deprecated : true,
		library : "sap.ui.commons"
	}});

	/* Overwrite to have right "since" in there */

	/**
	* Getter for property <code>visible</code>.
	* Invisible FormElements are not rendered.
	*
	* Default value is <code>true</code>
	*
	* @return {boolean} the value of property <code>visible</code>
	* @public
	* @since 1.12.0
	* @name sap.ui.commons.form.FormElement#getVisible
	* @function
	*/
	/**
	* Setter for property <code>visible</code>.
	*
	* Default value is <code>true</code>
	*
	* @param {boolean} bVisible new value for property <code>visible</code>
	* @return {this} <code>this</code> to allow method chaining
	* @public
	* @since 1.12.0
	* @name sap.ui.commons.form.FormElement#setVisible
	* @function
	*/

	return FormElement;

});