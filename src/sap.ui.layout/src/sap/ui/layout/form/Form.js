/*!
 * ${copyright}
 */

// Provides control sap.ui.layout.form.Form.
sap.ui.define(['jquery.sap.global', 'sap/ui/core/Control', 'sap/ui/layout/library'],
	function(jQuery, Control, library) {
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
	 * A Form supports VariantLayoutData for it's content to allow a simple switching of Layouts.
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.16.0
	 * @alias sap.ui.layout.form.Form
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var Form = Control.extend("sap.ui.layout.form.Form", /** @lends sap.ui.layout.form.Form.prototype */ { metadata : {

		library : "sap.ui.layout",
		properties : {

			/**
			 * Width of the form.
			 */
			width : {type : "sap.ui.core.CSSSize", group : "Dimension", defaultValue : null},

			/**
			 * Applies a device and theme specific line-height to the form elements if the form has editable content.
			 * In this case all (not only the editable) rows of the form will get the line height.
			 * The accessibility aria-readonly attribute is set according to this property.
			 * The setting of the property has no influence on the editable functionality of the form content.
			 * @since 1.20.0
			 */
			editable : {type : "boolean", group : "Misc", defaultValue : null}
		},
		defaultAggregation : "formContainers",
		aggregations : {

			/**
			 * FormContainers with the content of the form.
			 */
			formContainers : {type : "sap.ui.layout.form.FormContainer", multiple : true, singularName : "formContainer"}, 

			/**
			 * Title element of the Form. Can either be a Label object, or a simple string.
			 */
			title : {type : "sap.ui.core.Title", altTypes : ["string"], multiple : false}, 

			/**
			 * Layout of the form.
			 */
			layout : {type : "sap.ui.layout.form.FormLayout", multiple : false}
		},
		associations: {

			/**
			 * Association to controls / ids which label this control (see WAI-ARIA attribute aria-labelledby).
			 * @since 1.28.0
			 */
			ariaLabelledBy: { type: "sap.ui.core.Control", multiple: true, singularName: "ariaLabelledBy" }
		},
		designTime : true
	}});

	/**
	 * This file defines behavior for the control,
	 */

	(function() {

	//	sap.ui.commons.Form.prototype.init = function(){
	//	// do something for initialization...
	//	};

		Form.prototype.toggleContainerExpanded = function(oContainer){

			var oLayout = this.getLayout();
			if (oLayout) {
				oLayout.toggleContainerExpanded(oContainer);
			}

		};

		/*
		 * If onAfterRendering of a field is processed the layout might need to change it.
		 */
		Form.prototype.contentOnAfterRendering = function(oFormElement, oControl){

			// call function of the layout
			var oLayout = this.getLayout();
			if (oLayout && oLayout.contentOnAfterRendering) {
				oLayout.contentOnAfterRendering( oFormElement, oControl);
			}

		};

		/*
		 * If LayoutData changed on control this may need changes on the layout. So bubble to the Layout
		 */
		Form.prototype.onLayoutDataChange = function(oEvent){

			// call function of the layout
			var oLayout = this.getLayout();
			if (oLayout && oLayout.onLayoutDataChange) {
				oLayout.onLayoutDataChange(oEvent);
			}

		};

		Form.prototype.onBeforeFastNavigationFocus = function(oEvent){
			var oLayout = this.getLayout();
			if (oLayout && oLayout.onBeforeFastNavigationFocus) {
				oLayout.onBeforeFastNavigationFocus(oEvent);
			}
		};

		Form.prototype.setEditable = function(bEditable) {

			var bOldEditable = this.getEditable();
			this.setProperty("editable", bEditable, true);

			if (bEditable != bOldEditable && this.getDomRef()) {
				if (bEditable) {
					this.$().addClass("sapUiFormEdit").addClass("sapUiFormEdit-CTX");
					this.$().removeAttr("aria-readonly");
				} else {
					this.$().removeClass("sapUiFormEdit").removeClass("sapUiFormEdit-CTX");
					this.$().attr("aria-readonly", "true");
				}
			}

			return this;

		};

		/*
		 * Overwrite of INVALIDATE
		 * do not invalidate Form during rendering. Because there the Layout may update the content
		 * otherwise the Form will render twice
		*/
		Form.prototype.invalidate = function(oOrigin) {

			if (!this._bNoInvalidate) {
				Control.prototype.invalidate.apply(this, arguments);
			}

		};

		/**
		 * As Elements must not have an DOM reference it is not sure if one exists
		 * If the FormContainer has a DOM representation this function returns it,
		 * independent from the ID of this DOM element
		 * @param {sap.ui.layout.form.FormConatiner} oContainer FormContainer
		 * @return {Element} The Element's DOM representation or null
		 * @private
		 */
		Form.prototype.getContainerRenderedDomRef = function(oContainer) {

			var oLayout = this.getLayout();
			if (oLayout && oLayout.getContainerRenderedDomRef) {
				return oLayout.getContainerRenderedDomRef(oContainer);
			}else {
				return null;
			}

		};

		/**
		 * As Elements must not have an DOM reference it is not sure if one exists
		 * If the FormElement has a DOM representation this function returns it,
		 * independent from the ID of this DOM element
		 * @param {sap.ui.layout.form.FormElement} oElement FormElement
		 * @return {Element} The Element's DOM representation or null
		 * @private
		 */
		Form.prototype.getElementRenderedDomRef = function(oElement) {

			var oLayout = this.getLayout();
			if (oLayout && oLayout.getElementRenderedDomRef) {
				return oLayout.getElementRenderedDomRef(oElement);
			}else {
				return null;
			}

		};

	}());

	return Form;

}, /* bExport= */ true);
