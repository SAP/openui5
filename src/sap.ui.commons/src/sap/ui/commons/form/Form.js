/*!
 * ${copyright}
 */

// Provides control sap.ui.commons.form.Form.
sap.ui.define([
 'sap/ui/commons/library',
 'sap/ui/layout/form/Form',
 './FormRenderer'
],
	function(library, LayoutForm, FormRenderer) {
	"use strict";



	/**
	 * Constructor for a new form/Form.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * Form control.
	 * Holder for form control to be rendered in a specific form layout.
	 * A Form supports VariantLayoutData for it's conent to allow a simple switching of Layouts.
	 * @extends sap.ui.layout.form.Form
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.9.1
	 * @deprecated Since version 1.16.0.
	 * moved to sap.ui.layout library. Please use this one.
	 * @alias sap.ui.commons.form.Form
	 */
	var Form = LayoutForm.extend("sap.ui.commons.form.Form", /** @lends sap.ui.commons.form.Form.prototype */ { metadata : {

		deprecated : true,
		library : "sap.ui.commons"
	}});

	/* Overwrite to have right "since" in there */

	/**
	* Getter for property <code>visible</code>.
	* Invisible Forms are not rendered.
	*
	* Default value is <code>true</code>
	*
	* @return {boolean} the value of property <code>visible</code>
	* @public
	* @since 1.12.0
	* @name sap.ui.commons.form.Form#getVisible
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
	* @name sap.ui.commons.form.Form#setVisible
	* @function
	*/

	return Form;

});
