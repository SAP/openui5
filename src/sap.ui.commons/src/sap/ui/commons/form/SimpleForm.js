/*!
 * ${copyright}
 */

// Provides control sap.ui.commons.form.SimpleForm.
sap.ui.define([
 'sap/ui/commons/library',
 'sap/ui/layout/library',
 'sap/ui/layout/form/SimpleForm',
 './SimpleFormRenderer'
],
	function(library, layoutLibrary, LayoutSimpleForm, SimpleFormRenderer) {
	"use strict";

	var SimpleFormLayout = layoutLibrary.form.SimpleFormLayout;

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
		library : "sap.ui.commons",
		properties : {
			/**
			 * The <code>FormLayout</code> that is used to render the <code>SimpleForm</code>.
			 *
			 * We recommend using the <code>GridLayout</code> for rendering a <code>SimpleForm</code> in <code>sap.ui.commons</code> library,
			 * as responsive layouts are not designed for this library.
			 *
			 * <b>Note</b> If possible, set the <code>layout</code> before adding content to prevent calculations for the default layout.
			 *
			 * <b>Note</b> The <code>ResponsiveLayout</code> has been deprecated and must no longer be used.
			 * @since 1.14
			 */
			layout : {type : "sap.ui.layout.form.SimpleFormLayout", group : "Misc", defaultValue : SimpleFormLayout.ResponsiveLayout} // overwrite to keep old default and @since
		}
		}});

	return SimpleForm;

});
