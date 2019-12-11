/*!
 * ${copyright}
 */

// Provides control sap.ui.layout.form.Form.
sap.ui.define([
	'sap/ui/core/Control',
	'sap/ui/base/ManagedObjectObserver',
	'sap/ui/layout/library',
	'./FormRenderer'
	], function(Control, ManagedObjectObserver, library, FormRenderer) {
	"use strict";

	/**
	 * Constructor for a new sap.ui.layout.form.Form.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * A <code>Form</code> control arranges labels and fields (like input fields) into groups and rows.
	 * There are different ways to visualize forms for different screen sizes.
	 *
	 * A <code>Form</code> is structured into <code>FormContainers</code>. Each <code>FormContainer</code> consists of <code>FormElements</code>.
	 * The <code>FormElements</code> consists of a label and the form fields.
	 * A <code>Form</code> doesn't render its content by itself. The rendering is done by the assigned <code>FormLayout</code>.
	 * This is so that the rendering can be adopted to new UI requirements without changing the <code>Form</code> itself.
	 *
	 * For the content of a <code>Form</code>, <code>VariantLayoutData</code> are supported to allow simple switching of the <code>FormLayout</code>.
	 * <code>LayoutData</code> on the content can be used to overwrite the default layout of the <code>Form</code>.
	 *
	 * The <code>Form</code> (and its sub-controls) automatically add label and field assignment to enable screen reader support.
	 * It also adds keyboard support to navigate between the fields and groups inside the form.
	 *
	 * <b>Warning:</b> Do not put any layout or other container controls into the <code>FormElement</code>.
	 * Views are also not supported. This could damage the visual layout, keyboard support and screen-reader support.
	 *
	 * If editable controls are used as content, the <code>editable</code> property must be set to <code>true</code>,
	 * otherwise to <code>false</code>. If the <code>editable</code> property is set incorrectly, there will be visual issues
	 * like wrong label alignment or wrong spacing between the controls.
	 *
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
			 * Width of the <code>Form</code>.
			 */
			width : {type : "sap.ui.core.CSSSize", group : "Dimension", defaultValue : null},

			/**
			 * Applies a device-specific and theme-specific line height and label alignment to the form rows if the form has editable content.
			 * If set, all (not only the editable) rows of the form will get the line height of editable fields.
			 *
			 * The labels inside the form will be rendered by default in the according mode.
			 *
			 * <b>Note:</b> The setting of this property does not change the content of the form.
			 * For example, <code>Input</code> controls in a form with <code>editable</code> set to false are still editable.
			 *
			 * <b>Warning:</b> If this property is wrongly set, this might lead to visual issues.
			 * The labels and fields might be misaligned, the labels might be rendered in the wrong mode,
			 * and the spacing between the single controls might be wrong.
			 * Also, controls that do not fit the mode might be rendered incorrectly.
			 * @since 1.20.0
			 */
			editable : {type : "boolean", group : "Misc", defaultValue : false}
		},
		defaultAggregation : "formContainers",
		aggregations : {

			/**
			 * Containers with the content of the form. A <code>FormContainer</code> represents a group inside the <code>Form</code>.
			 */
			formContainers : {type : "sap.ui.layout.form.FormContainer", multiple : true, singularName : "formContainer"},

			/**
			 * Title of the <code>Form</code>. Can either be a <code>Title</code> element or a string.
			 * If a <code>Title</code> element it used, the style of the title can be set.
			 *
			 * <b>Note:</b> If a <code>Toolbar</code> is used, the <code>Title</code> is ignored.
			 */
			title : {type : "sap.ui.core.Title", altTypes : ["string"], multiple : false},

			/**
			 * Toolbar of the <code>Form</code>.
			 *
			 * <b>Note:</b> If a <code>Toolbar</code> is used, the <code>Title</code> is ignored.
			 * If a title is needed inside the <code>Toolbar</code> it must be added at content to the <code>Toolbar</code>.
			 * In this case add the <code>Title</code> to the <code>ariaLabelledBy</code> association.
			 * @since 1.36.0
			 */
			toolbar : {type : "sap.ui.core.Toolbar", multiple : false},

			/**
			 * Layout of the <code>Form</code>. The assigned <code>Layout</code> renders the <code>Form</code>.
			 * We recommend using the <code>ResponsiveGridLayout</code> for rendering a <code>Form</code>,
			 * as its responsiveness allows the available space to be used in the best way possible.
			 */
			layout : {type : "sap.ui.layout.form.FormLayout", multiple : false}
		},
		associations: {

			/**
			 * Association to controls / IDs that label this control (see WAI-ARIA attribute <code>aria-labelledby</code>).
			 * @since 1.28.0
			 */
			ariaLabelledBy: { type: "sap.ui.core.Control", multiple: true, singularName: "ariaLabelledBy" }
		},
		designtime: "sap/ui/layout/designtime/form/Form.designtime"
	}});

	Form.prototype.init = function(){

		this._oObserver = new ManagedObjectObserver(_observeChanges.bind(this));

		this._oObserver.observe(this, {
			properties: ["editable"],
			aggregations: ["formContainers"]
		});

	};

	Form.prototype.exit = function(){

		this._oObserver.disconnect();
		this._oObserver = undefined;

	};

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

		this.setProperty("editable", bEditable, true);

		return this;

	};

	function _setEditable(bEditable, bOldEditable) {

		if (bEditable != bOldEditable && this.getDomRef()) {
			if (bEditable) {
				this.$().addClass("sapUiFormEdit").addClass("sapUiFormEdit-CTX");
				this.$().removeAttr("aria-readonly");
			} else {
				this.$().removeClass("sapUiFormEdit").removeClass("sapUiFormEdit-CTX");
				this.$().attr("aria-readonly", "true");
			}

			// invalidate Labels
			var aFormContainers = this.getFormContainers();
			for (var i = 0; i < aFormContainers.length; i++) {
				var oFormContainer = aFormContainers[i];
				oFormContainer._setEditable(bEditable);
			}

		}

	}

	Form.prototype.setToolbar = function(oToolbar) { // don't use observer as library function needs to be called before aggregation update

		// for sap.m.Toolbar Auto-design must be set to transparent
		oToolbar = library.form.FormHelper.setToolbar.call(this, oToolbar);

		this.setAggregation("toolbar", oToolbar);

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
	 * As Elements must not have a DOM reference it is not sure if one exists
	 * If the <code>FormContainer</code> has a DOM representation this function returns it,
	 * independent from the ID of this DOM element
	 * @param {sap.ui.layout.form.FormContainer} oContainer <code>FormContainer</code>
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
	 * As Elements must not have a DOM reference it is not sure if one exists
	 * If the <code>FormElement</code> has a DOM representation this function returns it,
	 * independent from the ID of this DOM element
	 * @param {sap.ui.layout.form.FormElement} oElement <code>FormElement</code>
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

	/**
	 * Provides an array of all visible <code>FormContainer</code> elements
	 * that are assigned to the <code>Form</code>
	 * @return {sap.ui.layout.form.FormContainer[]} Array of visible <code>FormContainer</code>
	 * @private
	 */
	Form.prototype.getVisibleFormContainers = function() {

		var aContainers = this.getFormContainers();
		var aVisibleContainers = [];
		for ( var i = 0; i < aContainers.length; i++) {
			var oContainer = aContainers[i];
			if (oContainer.isVisible()) {
				aVisibleContainers.push(oContainer);
			}
		}

		return aVisibleContainers;

	};

	/**
	 * Method used to propagate the <code>Title</code> control ID of a container control
	 * (like a <code>Dialog</code> control) to use it as aria-label in the <code>Form</code>.
	 * So the <code>Form</code> must not have an own title.
	 * @param {string} sTitleID <code>Title</code> control ID
	 * @private
	 * @return {sap.ui.layout.form.Form} Reference to <code>this</code> to allow method chaining
	 */
	Form.prototype._suggestTitleId = function (sTitleID) {

		this._sSuggestedTitleId = sTitleID;
		if (this.getDomRef()) {
			this.invalidate();
		}

		return this;

	};

	function _observeChanges(oChanges){

		if (oChanges.name === "editable") {
			_setEditable.call(this, oChanges.current, oChanges.old);
		} else if (oChanges.name === "formContainers") {
			_formContainerChanged.call(this, oChanges.mutation, oChanges.child);
		}

	}

	function _formContainerChanged(sMutation, oFormContainer) {

		if (sMutation === "insert") {
			oFormContainer._setEditable(this.getEditable());
		}

	}

	return Form;

});
