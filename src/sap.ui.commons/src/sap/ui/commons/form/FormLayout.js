/*!
 * ${copyright}
 */

// Provides control sap.ui.commons.form.FormLayout.
sap.ui.define([
 'sap/ui/commons/library',
 'sap/ui/layout/form/FormLayout',
 './FormLayoutRenderer'
],
	function(library, LayoutFormLayout, FormLayoutRenderer) {
	"use strict";



	/**
	 * Constructor for a new form/FormLayout.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * Base layout for Forms.
	 * Other Layouts must inherit from this one.
	 * @extends sap.ui.layout.form.FormLayout
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.9.1
	 * @deprecated Since version 1.16.0.
	 * moved to sap.ui.layout library. Please use this one.
	 * @alias sap.ui.commons.form.FormLayout
	 */
	var FormLayout = LayoutFormLayout.extend("sap.ui.commons.form.FormLayout", /** @lends sap.ui.commons.form.FormLayout.prototype */ { metadata : {

		deprecated : true,
		library : "sap.ui.commons"
	}});


	return FormLayout;

});
