/*!
 * ${copyright}
 */

// Provides control sap.ui.layout.form.FormElement.
sap.ui.define([
	'sap/ui/core/Element',
	'sap/ui/core/Control',
	'sap/ui/base/ManagedObjectObserver',
	'sap/ui/layout/library',
	"sap/base/Log"
	], function(Element, Control, ManagedObjectObserver, library, Log) {
	"use strict";

	/**
	 * Constructor for a new sap.ui.layout.form.FormElement.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * A <code>FormElement</code> represents a row in a <code>FormContainer</code>.
	 * A <code>FormElement</code> is a combination of one label and different controls associated to this label.
	 * @extends sap.ui.core.Element
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.16.0
	 * @alias sap.ui.layout.form.FormElement
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var FormElement = Element.extend("sap.ui.layout.form.FormElement", /** @lends sap.ui.layout.form.FormElement.prototype */ { metadata : {

		library : "sap.ui.layout",
		properties : {

			/**
			 * If set to <code>false</code>, the <code>FormElement</code> is not rendered.
			 */
			visible : {type : "boolean", group : "Misc", defaultValue : true},

			/**
			 * Internal property for the <code>editable</code> state of the internal <code>FormElement</code>.
			 */
			_editable: {
				type: "boolean",
				group: "Misc",
				defaultValue: false,
				visibility: "hidden"
			}
		},
		defaultAggregation : "fields",
		aggregations : {

			/**
			 * Label of the fields. Can either be a <code>Label</code> control or a string.
			 * If a <code>Label</code> control is used, the properties of the <code>Label</code> can be set.
			 * If no assignment between <code>Label</code> and the fields is set via (<code>labelFor</code> property of the <code>Label</code>),
			 * it will be done automatically by the <code>FormElement</code>.
			 * In this case the <code>Label</code> is assigned to the fields of the <code>FormElement</code>.
			 */
			label : {type : "sap.ui.core.Label", altTypes : ["string"], multiple : false},

			/*
			 * Internal Label if Label is provided as string.
			 */
			_label : {type : "sap.ui.core.Label", multiple : false, visibility: "hidden"},

			/**
			 * Form controls that belong together to be displayed in one row of a <code>Form</code>.
			 *
			 * <b>Warning:</b> Do not put any layout or other container controls in here.
			 * This could damage the visual layout, keyboard support and screen-reader support.
			 * Only form controls are allowed. Views are also not supported.
			 * Allowed controls implement the interface <code>sap.ui.core.IFormContent</code>.
			 */
			fields : {type : "sap.ui.core.Control", multiple : true, singularName : "field"}
		},
		designtime: "sap/ui/layout/designtime/form/FormElement.designtime"
	}});

	FormElement.prototype.init = function(){

		this._oFieldDelegate = {oElement: this, onAfterRendering: _fieldOnAfterRendering};

		this._oObserver = new ManagedObjectObserver(this._observeChanges.bind(this));

		this._oObserver.observe(this, {
			aggregations: ["fields"]
		});

	};

	FormElement.prototype.exit = function(){

		if (this._oLabel) {
			delete this._oLabel;
		}

		this._oFieldDelegate = undefined;

		this._oObserver.disconnect();
		this._oObserver = undefined;

	};

/*
 * sets the label for the FormElement. If it's only a string an internal label is created.
 * overwrite the isRequired and the getLabelForRendering functions with Form specific ones.
 */
	FormElement.prototype.setLabel = function(vAny) {

		if (!this._oLabel) {
			var oOldLabel = this.getLabel();
			if (oOldLabel) {
				if (oOldLabel.setAlternativeLabelFor) {
					oOldLabel.setAlternativeLabelFor(null);
				}
				if (oOldLabel.isRequired) {
					oOldLabel.isRequired = oOldLabel._sapuiIsRequired;
					oOldLabel._sapuiIsRequired = undefined;
					oOldLabel.disableRequiredChangeCheck(false);
				}
				if (oOldLabel.isDisplayOnly) {
					oOldLabel.isDisplayOnly = oOldLabel._sapuiIsDisplayOnly;
					oOldLabel._sapuiIsDisplayOnly = undefined;
				}
				if (oOldLabel.isWrapping) {
					oOldLabel.isWrapping = oOldLabel._sapuiIsWrapping;
					oOldLabel._sapuiIsWrapping = undefined;
				}
			}
		}

		this.setAggregation("label", vAny);
		var oLabel = vAny;
		if (typeof oLabel === "string") {
			if (!this._oLabel) {
				this._oLabel = library.form.FormHelper.createLabel(oLabel, this.getId() + "-label");
				this.setAggregation("_label", this._oLabel, true); // use Aggregation to allow model inheritance
				this._oLabel.disableRequiredChangeCheck(true);
				if (this._oLabel.isRequired) {
					this._oLabel.isRequired = _labelIsRequired;
				}
				if (this._oLabel.isDisplayOnly) {
					this._oLabel.isDisplayOnly = _labelIsDisplayOnly;
				}
				if (this._oLabel.setWrapping) {
					this._oLabel.setWrapping(true);
				}
			} else {
				this._oLabel.setText(oLabel);
			}
		} else {
			if (this._oLabel) {
				this._oLabel.destroy();
				delete this._oLabel;
			}
			if (oLabel && oLabel.isRequired) {
				oLabel._sapuiIsRequired = oLabel.isRequired;
				oLabel.isRequired = _labelIsRequired;
				oLabel.disableRequiredChangeCheck(true);
			}
			if (oLabel && oLabel.isDisplayOnly) {
				oLabel._sapuiIsDisplayOnly = oLabel.isDisplayOnly;
				oLabel.isDisplayOnly = _labelIsDisplayOnly;
			}
			if (oLabel && oLabel.isWrapping) {
				oLabel._sapuiIsWrapping = oLabel.isWrapping;
				oLabel.isWrapping = _labelIsWrapping;
			}
		}

		_updateLabelFor.call(this);

		return this;

	};

	FormElement.prototype.destroyLabel = function() {

		this.destroyAggregation("label");

		if (this._oLabel) {
			this._oLabel.destroy();
			delete this._oLabel;
		}

		return this;

	};

	/**
	 * Returns the <code>Label</code> of the <code>FormElement</code>, even if the <code>Label</code> is assigned as string.
	 * The <code>FormLayout</code> needs the information of the label to render the <code>Form</code>.
	 *
	 * @returns {sap.ui.core.Label} <code>Label</code> control used to render the label
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	FormElement.prototype.getLabelControl = function() {

		if (this._oLabel) {
			return this._oLabel;
		} else {
			return this.getLabel();
		}

	};

	FormElement.prototype.updateFields = function() {

		var aFields = this.getFields();
		var oField;
		var i = 0;

		for (i = 0; i < aFields.length; i++) {
			oField = aFields[i];
			_detachDelegate.call(this, oField);
		}

		this.updateAggregation("fields");

		aFields = this.getFields();

		for (i = 0; i < aFields.length; i++) {
			oField = aFields[i];
			_attachDelegate.call(this, oField);
		}

		_updateLabelFor.call(this);

		return this;

	};

	/*
	 * Enhance Aria properties of fields to set aria-labelledby to FormElements label if not set otherwise
	 * Set aria-describedby to the title of the container, but only for the first field in the container
	 * This function is called during rendering.
	 */
	FormElement.prototype.enhanceAccessibilityState = function(oElement, mAriaProps) {

		var oLabel = this.getLabelControl();
		if (oLabel && oLabel != oElement) {

			var sLabelledBy = mAriaProps["labelledby"];
			if (!sLabelledBy) {
				sLabelledBy = oLabel.getId();
			} else {
				var aLabels = sLabelledBy.split(" ");
				if (aLabels.indexOf(oLabel.getId()) < 0) {
					aLabels.splice(0, 0, oLabel.getId());
					sLabelledBy = aLabels.join(" ");
				}
			}
			mAriaProps["labelledby"] = sLabelledBy;

		}

		return mAriaProps;

	};

	/*
	 * If LayoutData changed on control this may need changes on the layout. So bubble to the form
	 */
	FormElement.prototype.onLayoutDataChange = function(oEvent){

		// call function of parent (if assigned)
		var oParent = this.getParent();
		if (oParent && oParent.onLayoutDataChange) {
			oParent.onLayoutDataChange(oEvent);
		}

	};

	/**
	 * As Elements must not have a DOM reference it is not sure if one exists
	 * If the FormElement has a DOM representation this function returns it,
	 * independent from the ID of this DOM element
	 * @return {Element} The Element's DOM representation or null
	 * @private
	 */
	FormElement.prototype.getRenderedDomRef = function(){

		var that = this;
		var oContainer = this.getParent();

		if (oContainer && oContainer.getElementRenderedDomRef) {
			return oContainer.getElementRenderedDomRef(that);
		}else {
			return null;
		}

	};

	/**
	 * Sets the editable state of the <code>FormElement</code>.
	 *
	 * This must only be called from the <code>Form</code> and it's <code>FormContainers</code>.
	 *
	 * Labels inside of a <code>Form</code> must be invalidated if <code>editable</code> changed on <code>Form</code>.
	 *
	 * @param {boolean} bEditable Editable state of the <code>Form</code>
	 * @protected
	 * @restricted sap.ui.layout.form.FormContainer
	 * @since 1.74.0
	 */
	FormElement.prototype._setEditable = function(bEditable) {

		this.setProperty("_editable", bEditable, true); // do not invalidate whole FormElement

		this.invalidateLabel();

	};

	/**
	 * Labels inside of a Form must be invalidated if "editable" changed on Form
	 * @protected
	 */
	FormElement.prototype.invalidateLabel = function(){ // is overwritten in sap.ui.comp.smartform.GroupElement

		var oLabel = this.getLabelControl();

		if (oLabel) {
			oLabel.invalidate();
		}

	};

	/**
	 * Determines if the <code>FormElement</code> is visible or not. Per default it
	 * just returns the value of the <code>visible</code> property.
	 * But this might be overwritten by inherited elements.
	 *
	 * For rendering by <code>FormLayouts</code> this function has to be used instead of
	 * <code>getVisible</code>.
	 *
	 * @returns {boolean} If true, the <code>FormElement</code> is visible, otherwise not
	 * @public
	 */
	FormElement.prototype.isVisible = function(){

		return this.getVisible();

	};

	/**
	 * Determines what fields must be rendered.
	 *
	 * @returns {sap.ui.core.Control[]} Array of fields to be rendered
	 * @public
	 * @restricted sap.ui.layout.form.Form
	 * @since 1.74.0
	 */
	FormElement.prototype.getFieldsForRendering = function(){

		return this.getFields();

	};

	/*
	 * handles change of FormElement itself and content controls
	 * @private
	 */
	FormElement.prototype._observeChanges = function(oChanges){

		if (oChanges.object == this) {
			// it's the FormElement
			if (oChanges.name == "fields") {
				_fieldChanged.call(this, oChanges.child, oChanges.mutation);
			}
		} else {
			// it's some content control
			_controlChanged.call(this, oChanges);
		}

	};

	// *** Private helper functions ***

	function _fieldChanged(oField, sMutation) {

		if (sMutation == "insert") {
			if (!oField.isA("sap.ui.core.IFormContent")) {
				Log.warning(oField + " is not valid Form content", this);
			}
			_attachDelegate.call(this, oField);
		} else {
			_detachDelegate.call(this, oField);
		}

		_updateLabelFor.call(this);

	}

	function _controlChanged(oChanges) {

		if (oChanges.name == "required") {
			this.invalidateLabel();
		}

	}

	/*
	 * overwrite Labels isRequired function to check if one of the fields in the element is required,
	 * not only the one directly assigned.
	 */
	function _labelIsRequired(){

		if (this.getRequired && this.getRequired()) {
			return true;
		}

		var oFormElement = this.getParent();
		var aFields = oFormElement.getFields();

		for ( var i = 0; i < aFields.length; i++) {
			var oField = aFields[i];
			if (oField.getRequired && oField.getRequired() === true &&
					(!oField.getEditable || oField.getEditable())) {
				return true;
			}
		}

		return false;

	}

	/*
	 * overwrite Labels isDisplayOnly function to use the editable property of the Form
	 * to determine the mode.
	 *
	 * If DisplayOnly is set explicitly on the Label, this is used.
	 */
	function _labelIsDisplayOnly(){

		if (this.getDisplayOnly) {
			if (!this.isPropertyInitial("displayOnly")) {
				return this.getDisplayOnly();
			}

			var oFormElement = this.getParent();
			var oFormContainer = oFormElement.getParent();

			if (oFormContainer) {
				var oForm = oFormContainer.getParent();

				if (oForm) {
					return !oForm.getEditable();
				}
			}
		}

		return false;

	}

	/*
	 * overwrite Labels isWrapping function to set wrapping as default.
	 *
	 * If Wrapping is set explicitly on the Label, this is used.
	 */
	function _labelIsWrapping(){

		if (this.getWrapping && !this.isPropertyInitial("wrapping")) {
			return this.getWrapping();
		}

		return true;

	}

	/*
	 * Update the for association of the related label
	 */
	function _updateLabelFor(){
		var aFields = this.getFields();
		var oField = aFields.length > 0 ? aFields[0] : null;

		var oLabel = this._oLabel;
		if (oLabel) {
			oLabel.setLabelFor(oField); // as Label is internal of FormElement, we can use original labelFor
		} else {
			oLabel = this.getLabel();
			if (oLabel instanceof Control /*might also be a string*/) {
				oLabel.setAlternativeLabelFor(oField);
			}
		}
	}

	function _attachDelegate(oField){

		oField.addDelegate(this._oFieldDelegate);

		if (!this._bNoObserverChange && oField.getMetadata().getProperty("required")) {
			this._oObserver.observe(oField, {
				properties: ["required"]
			});
		}

	}

	function _detachDelegate(oField){

		oField.removeDelegate(this._oFieldDelegate);

		if (!this._bNoObserverChange) {
			// unobserve in any case and everything; this._bNoObserverChange set in SmartForm
			this._oObserver.unobserve(oField);
		}

	}

	/*
	 * If onAfterRendering of a field is processed the Form (layout) might need to change it.
	 */
	function _fieldOnAfterRendering(oEvent){

		// call function of parent (if assigned)
		var oParent = this.oElement.getParent();
		if (oParent && oParent.contentOnAfterRendering) {
			oParent.contentOnAfterRendering( this.oElement, oEvent.srcControl);
		}

	}

	return FormElement;

});