/*!
 * ${copyright}
 */

// Provides control sap.ui.layout.form.FormElement.
sap.ui.define(['jquery.sap.global', 'sap/ui/core/Element', 'sap/ui/core/EnabledPropagator', 'sap/ui/layout/library'],
	function(jQuery, Element, EnabledPropagator, library) {
	"use strict";

	/**
	 * Constructor for a new sap.ui.layout.form.FormElement.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] initial settings for the new control
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
			visible : {type : "boolean", group : "Misc", defaultValue : true}
		},
		defaultAggregation : "fields",
		aggregations : {

			/**
			 * Label of the fields. Can either be a <code>Label</code> control or a string.
			 * If a <code>Label</code> control is used, the properties of the <code>Label</code> can be set.
			 * If no assignment between <code>Label</code> and the fields is set via (<code>labelFor</code> property of the <code>Label</code>), it will be done automatically by the
			 * <code>FormElement</code>. In this case the <code>Label</code> is assigned to the fields of the <code>FormElement</code>.
			 */
			label : {type : "sap.ui.core.Label", altTypes : ["string"], multiple : false},

			/*
			 * Internal Label if Label is provided as string.
			 */
			_label : {type : "sap.ui.core.Label", multiple : false, visibility: "hidden"},

			/**
			 * Formular controls that belong together to be displayed in one row of a <code>Form</code>.
			 *
			 * <b>Note:</b> Do not put any layout controls in here. This could destroy the visual layout,
			 * keyboard support and screen-reader support.
			 */
			fields : {type : "sap.ui.core.Control", multiple : true, singularName : "field"}
		},
		designTime : true
	}});

	FormElement.prototype.init = function(){

		this._oFieldDelegate = {oElement: this, onAfterRendering: _fieldOnAfterRendering};

	};

	FormElement.prototype.exit = function(){

		if (this._oLabel) {
			delete this._oLabel;
		}

		this._oFieldDelegate = undefined;

	};

/*
 * sets the label for the FormElement. If it's only a string an internal label is created.
 * overwrite the isRequired and the getLabelForRendering functions with Form specific ones.
 */
	FormElement.prototype.setLabel = function(vAny) {

		if (!this._oLabel) {
			var oOldLabel = this.getLabel();
			if (oOldLabel && oOldLabel.isRequired) {
				oOldLabel.isRequired = oOldLabel._sapuiIsRequired;
				oOldLabel._sapuiIsRequired = undefined;
				oOldLabel.disableRequiredChangeCheck(false);
			}
		}

		this.setAggregation("label", vAny);
		var oLabel = vAny;
		if (typeof oLabel === "string") {
			if (!this._oLabel) {
				this._oLabel = sap.ui.layout.form.FormHelper.createLabel(oLabel);
				this.setAggregation("_label", this._oLabel, true); // use Aggregation to allow model inheritance
				this._oLabel.disableRequiredChangeCheck(true);
				if (this._oLabel.isRequired) {
					this._oLabel.isRequired = _labelIsRequired;
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
		}

		_updateLabelFor(this);

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

	FormElement.prototype.addField = function(oField) {

		this.addAggregation("fields", oField);

		if (oField) {
			if (!oField.getMetadata().isInstanceOf("sap.ui.core.IFormContent")) {
				jQuery.sap.log.warning(oField + " is not valid Form content", this);
			}
			_attachDelegate.call(this, oField);
			_updateLabelFor(this);
		}

		return this;

	};

	FormElement.prototype.insertField = function(oField, iIndex) {

		this.insertAggregation("fields", oField, iIndex);

		if (oField) {
			if (!oField.getMetadata().isInstanceOf("sap.ui.core.IFormContent")) {
				jQuery.sap.log.warning(oField + " is not valid Form content", this);
			}
			_attachDelegate.call(this, oField);
			_updateLabelFor(this);
		}

		return this;

	};

	FormElement.prototype.removeField = function(oField) {

		var oRemovedField = this.removeAggregation("fields", oField);
		_detachDelegate.call(this, oRemovedField);
		_updateLabelFor(this);

		return oRemovedField;

	};

	FormElement.prototype.removeAllFields = function() {

		var aRemovedFields = this.removeAllAggregation("fields");

		for ( var i = 0; i < aRemovedFields.length; i++) {
			var oRemovedField = aRemovedFields[i];
			_detachDelegate.call(this, oRemovedField);
		}
		_updateLabelFor(this);

		return aRemovedFields;

	};

	FormElement.prototype.destroyFields = function() {

		var aFields = this.getFields();

		for ( var i = 0; i < aFields.length; i++) {
			var oField = aFields[i];
			_detachDelegate.call(this, oField);
		}

		this.destroyAggregation("fields");

		_updateLabelFor(this);

		return this;

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

		_updateLabelFor(this);

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
				if (jQuery.inArray(oLabel.getId(), aLabels) < 0) {
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

	// *** Private helper functions ***

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
	 * Update the for association of the related label
	 */
	function _updateLabelFor(oFormElement){
		var aFields = oFormElement.getFields();
		var oField = aFields.length > 0 ? aFields[0] : null;

		var oLabel = oFormElement._oLabel;
		if (oLabel) {
			oLabel.setLabelFor(oField); // as Label is internal of FormElement, we can use original labelFor
		}
		oLabel = oFormElement.getLabel();
		if (oLabel instanceof sap.ui.core.Control /*might also be a string*/) {
			oLabel.setAlternativeLabelFor(oField);
		}
	}

	function _attachDelegate(oField){

		oField.addDelegate(this._oFieldDelegate);
		if (oField.getMetadata().getProperty("required")) {
			oField.attachEvent("_change", _handleControlChange, this);
		}

	}

	function _detachDelegate(oField){

		oField.removeDelegate(this._oFieldDelegate);
		if (oField.getMetadata().getProperty("required")) {
			oField.detachEvent("_change", _handleControlChange, this);
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

	function _handleControlChange(oEvent) {

		if (oEvent.getParameter("name") == "required") {
			var oLabel = this.getLabelControl();
			if (oLabel) {
				oLabel.invalidate();
			}
		}

	}

	return FormElement;

}, /* bExport= */ true);
