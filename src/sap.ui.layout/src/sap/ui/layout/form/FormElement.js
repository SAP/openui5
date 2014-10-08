/*!
 * ${copyright}
 */

// Provides control sap.ui.layout.form.FormElement.
sap.ui.define(['jquery.sap.global', 'sap/ui/core/Element', 'sap/ui/core/EnabledPropagator', 'sap/ui/layout/library'],
	function(jQuery, Element, EnabledPropagator, library) {
	"use strict";


	
	/**
	 * Constructor for a new form/FormElement.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given 
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * A form element is a combination of one label and different controls associated to this label.
	 * @extends sap.ui.core.Element
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.16.0
	 * @name sap.ui.layout.form.FormElement
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var FormElement = Element.extend("sap.ui.layout.form.FormElement", /** @lends sap.ui.layout.form.FormElement.prototype */ { metadata : {
	
		library : "sap.ui.layout",
		properties : {
	
			/**
			 * Invisible FormElements are not rendered.
			 */
			visible : {type : "boolean", group : "Misc", defaultValue : true}
		},
		defaultAggregation : "fields",
		aggregations : {
	
			/**
			 * Label of the fields. Can either be a Label object, or a simple string.
			 */
			label : {type : "sap.ui.core.Label", altTypes : ["string"], multiple : false}, 
	
			/**
			 * Formular controls.
			 */
			fields : {type : "sap.ui.core.Control", multiple : true, singularName : "field"}
		}
	}});
	
	
	/**
	 * Returns the Label Control, even if the Label is entered as Text.
	 *
	 * @name sap.ui.layout.form.FormElement#getLabelControl
	 * @function
	 * @type sap.ui.core.Label
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	
	/**
	 * This file defines behavior for the control,
	 */
	
	
	// TODO deactivated until Element/Control has been clarified: sap.ui.core.EnabledPropagator.call(sap.ui.layout.form.FormElement.prototype);
	
	(function() {
	
		FormElement.prototype.init = function(){
	
			this._oFieldDelegate = {oElement: this, onAfterRendering: _fieldOnAfterRendering};
	
		};
	
		FormElement.prototype.exit = function(){
	
			if (this._oLabel) {
				this._oLabel.destroy();
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
				if (oOldLabel) {
					if (oOldLabel.isRequired) {
						oOldLabel.isRequired = oOldLabel._sapui_isRequired;
						oOldLabel._sapui_isRequired = undefined;
					}
					if (oOldLabel.getLabelForRendering) {
						oOldLabel.getLabelForRendering = oOldLabel._sapui_getLabelForRendering;
						oOldLabel._sapui_getLabelForRendering = undefined;
					}
				}
			}
	
			this.setAggregation("label", vAny);
			var oLabel = vAny;
			if (typeof oLabel === "string") {
				if (!this._oLabel) {
					this._oLabel = sap.ui.layout.form.FormHelper.createLabel(oLabel);
					this._oLabel.setParent(this);
					if (oLabel.isRequired) {
						this._oLabel.isRequired = _labelIsRequired;
					}
					this._oLabel.getLabelForRendering = _getLabelForRendering;
				} else {
					this._oLabel.setText(oLabel);
				}
			} else {
				if (this._oLabel) {
					this._oLabel.destroy();
					delete this._oLabel;
				}
				if (!oLabel) {
					return this; //set label is called with null if label is removed by ManagedObject.removeChild
				}
				if (oLabel.isRequired) {
					oLabel._sapui_isRequired = oLabel.isRequired;
					oLabel.isRequired = _labelIsRequired;
				}
				if (oLabel.getLabelForRendering) {
					oLabel._sapui_getLabelForRendering = oLabel.getLabelForRendering;
					oLabel.getLabelForRendering = _getLabelForRendering;
				}
			}
	
			return this;
	
		};
	
		FormElement.prototype.getLabelControl = function() {
	
			if (this._oLabel) {
				return this._oLabel;
			} else {
				return this.getLabel();
			}
	
		};
	
		FormElement.prototype.addField = function(oField) {
	
			this.addAggregation("fields", oField);
			oField.addDelegate(this._oFieldDelegate);
	
			return this;
	
		};
	
		FormElement.prototype.insertField = function(oField, iIndex) {
	
			this.insertAggregation("fields", oField, iIndex);
			oField.addDelegate(this._oFieldDelegate);
	
			return this;
	
		};
	
		FormElement.prototype.removeField = function(oField) {
	
			var oRemovedField = this.removeAggregation("fields", oField);
			oRemovedField.removeDelegate(this._oFieldDelegate);
	
			return oRemovedField;
	
		};
	
		FormElement.prototype.removeAllFields = function() {
	
			var aRemovedFields = this.removeAllAggregation("fields");
	
			for ( var i = 0; i < aRemovedFields.length; i++) {
				var oRemovedField = aRemovedFields[i];
				oRemovedField.removeDelegate(this._oFieldDelegate);
			}
	
			return aRemovedFields;
	
		};
	
		FormElement.prototype.destroyFields = function() {
	
			var aFields = this.getFields();
	
			for ( var i = 0; i < aFields.length; i++) {
				var oField = aFields[i];
				oField.removeDelegate(this._oFieldDelegate);
			}
	
			this.destroyAggregation("fields");
	
			return this;
	
		};
	
		FormElement.prototype.updateFields = function() {
	
			var aFields = this.getFields();
	
			for ( var i = 0; i < aFields.length; i++) {
				var oField = aFields[i];
				oField.removeDelegate(this._oFieldDelegate);
			}
	
			this.updateAggregation("fields");
	
			aFields = this.getFields();
	
			for ( var i = 0; i < aFields.length; i++) {
				var oField = aFields[i];
				oField.addDelegate(this._oFieldDelegate);
			}
	
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
				if (!mAriaProps["labelledby"]) {
					mAriaProps["labelledby"] = oLabel.getId();
				}
	
				var oContainer = this.getParent();
				var aElements = oContainer.getFormElements();
				if (this == aElements[0]) {
					// it's the first Element
					var aControls = this.getFields();
					if (oElement == aControls[0]) {
						//it's the first field
						var oTitle = oContainer.getTitle();
						if (oTitle) {
							var sId = "";
							if (typeof oTitle == "string") {
								sId = oContainer.getId() + "--title";
							} else {
								sId = oTitle.getId();
							}
							var sDescribedBy = mAriaProps["describedby"];
							if (sDescribedBy) {
								sDescribedBy = sDescribedBy + " " + sId;
							} else {
								sDescribedBy = sId;
							}
							mAriaProps["describedby"] = sDescribedBy;
						}
					}
				}
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
	
		// *** Private helper functions ***
	
		/*
		 * overwrite Labels isRequired function to check if one of the fields in the element is required,
		 * not only the one directly assigned.
		 */
		var _labelIsRequired = function(){
	
			var oFormElement = this.getParent();
			var aFields = oFormElement.getFields();
	
			for ( var i = 0; i < aFields.length; i++) {
				var oField = aFields[i];
				if (oField.getRequired && oField.getRequired() === true) {
					return true;
				}
			}
	
			return false;
	
		};
	
		/*
		 * overwrite Labels getLabelForRendering function to point always to the first field.
		 * But only if the application does not set a labelFor explicitly.
		 */
		var _getLabelForRendering = function(){
	
			if (this.getLabelFor()) {
				return this.getLabelFor();
			} else {
				var oFormElement = this.getParent();
				var aFields = oFormElement.getFields();
				if (aFields[0]) {
					return aFields[0].getId();
				}
			}
	
		};
	
		/*
		 * If onAfterRendering of a field is processed the Form (layout) might need to change it.
		 */
		var _fieldOnAfterRendering = function(oEvent){
	
			// call function of parent (if assigned)
			var oParent = this.oElement.getParent();
			if (oParent && oParent.contentOnAfterRendering) {
				oParent.contentOnAfterRendering( this.oElement, oEvent.srcControl);
			}
	
		};
	
	}());

	return FormElement;

}, /* bExport= */ true);
