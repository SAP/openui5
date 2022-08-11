/*!
 * ${copyright}
 */

// Provides control sap.ui.commons.form.SimpleForm.
sap.ui.define([
 'sap/ui/commons/library',
 'sap/ui/layout/form/SimpleForm',
 './SimpleFormRenderer'
],
	function(library, LayoutSimpleForm, SimpleFormRenderer) {
	"use strict";



	/**
	 * Constructor for a new form/SimpleForm.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * Use the SimpleForm to create a form based on title, label and fields that are stacked in the content aggregation. Add Title to start a new FormContainer(Group). Add Label to start a new row in the container. Add Input/Display controls as needed. Use LayoutData to influence the layout for special cases in the Input/Display controls.
	 * @extends sap.ui.layout.form.SimpleForm
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.12
	 * @deprecated Since version 1.16.0.
	 * moved to sap.ui.layout library. Please use this one.
	 * @alias sap.ui.commons.form.SimpleForm
	 */
	var SimpleForm = LayoutSimpleForm.extend("sap.ui.commons.form.SimpleForm", /** @lends sap.ui.commons.form.SimpleForm.prototype */ { metadata : {

		deprecated : true,
		library : "sap.ui.commons"
	}});

	/* Overwrite to have right "since" in there */

	/**
	* Getter for property <code>layout</code>.
	* The FormLayout that is used to render the SimpleForm
	*
	* Default value is <code>ResponsiveLayout</code>
	*
	* @return {sap.ui.commons.form.SimpleFormLayout} the value of property <code>layout</code>
	* @public
	* @since 1.14
	* @name sap.ui.commons.form.SimpleForm#getLayout
	* @function
	*/
	/**
	* Setter for property <code>layout</code>.
	*
	* Default value is <code>ResponsiveLayout</code>
	*
	* @param {sap.ui.commons.form.SimpleFormLayout} oLayout new value for property <code>layout</code>
	* @return {this} <code>this</code> to allow method chaining
	* @public
	* @since 1.14
	* @name sap.ui.commons.form.SimpleForm#setLayout
	* @function
	*/

	return SimpleForm;

});
