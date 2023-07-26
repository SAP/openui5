/*!
 * ${copyright}
 */

// Provides control sap.ui.layout.form.FormElement.
sap.ui.define([
	'./FormElement',
	'sap/ui/layout/library'
	], function(
		FormElement,
		library
	) {
	"use strict";

	/**
	 * Constructor for a new sap.ui.layout.form.SemanticFormElement.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * A <code>SemanticFormElement</code> element is a special <code>FormElement</code> that contains semantically connected
	 * fields. These field controls are divided by delimiter controls. In display mode, they are rendered as one condensed string,
	 * in edit mode as separate fields.
	 *
	 * <b>Note:</b> Please use the <code>ColumnLayout</code> as <code>layout</code> of the <code>Form</code>. For other layouts, the
	 * field arrangement might not be suitable in every case.
	 * @extends sap.ui.layout.form.FormElement
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @experimental As of version 1.86
	 * @since 1.86.0
	 * @alias sap.ui.layout.form.SemanticFormElement
	 */
	var SemanticFormElement = FormElement.extend("sap.ui.layout.form.SemanticFormElement", /** @lends sap.ui.layout.form.SemanticFormElement.prototype */ { metadata : {

		library : "sap.ui.layout",
		properties : {

			/**
			 * Delimiter symbol to separate the fields.
			 */
			delimiter : {type : "string", group : "Data", defaultValue : "/"}

		},
		aggregations : {

			/**
			 * Labels of the individual fields. Can either be a <code>Label</code> control or a string.
			 *
			 * If a <code>Label</code> control is used, the properties of the <code>Label</code> can be set.
			 *
			 * These labels are not rendered directly. If the <code>Label</code> property of <code>SemanticFormElement</code> is not set,
			 * the texts of the labels are concatenated into the <code>Label</code> property of <code>SemanticFormElement</code>. Otherwise the set
			 * <code>Label</code> is shown.
			 *
			 * <b>Note:</b> If this aggregation is used, a label is assigned to every single field of <code>SemanticFormElement</code>.
			 * The order of the labels and the fields must be the same.
			 */
			fieldLabels : {type : "sap.ui.core.Label"/*, altTypes : ["string"]*/, multiple : true},

			/*
			 * Internal delimiter controls
			 */
			_delimiters : {type : "sap.ui.core.Control", multiple : true, visibility: "hidden"},

			/*
			 * Internal control for display mode
			 */
			_displayField : {type : "sap.ui.core.Control", multiple : false, visibility: "hidden"}
		}
	}});

	SemanticFormElement.prototype.init = function(){

		FormElement.prototype.init.apply(this, arguments);

		this._oObserver.observe(this, {
			properties: ["_editable", "delimiter"],
			aggregations: ["fieldLabels"],
			parent: true
		});

	};

	SemanticFormElement.prototype.exit = function(){

		FormElement.prototype.exit.apply(this, arguments);

	};

	/*
	 * Do not enhance accessibility state of delimiters
	 */
	SemanticFormElement.prototype.enhanceAccessibilityState = function(oElement, mAriaProps) {

		var aDelimiters = this.getAggregation("delimiters", []);
		if (aDelimiters.indexOf(oElement) < 0) {
			if (!_renderAsText.call(this)) {
				// assign label texts in in edit mode
				var iIndex = this.indexOfField(oElement);
				if (iIndex >= 0) {
					var aFieldLabels = this.getFieldLabels();
					var oLabel = aFieldLabels[iIndex];
					if (oLabel) {
						var sText;
						if (typeof oLabel === "string") {
							sText = oLabel;
						} else {
							sText = oLabel.getText();
						}

						var sLabel = mAriaProps["label"];
						if (!sLabel) {
							sLabel = sText;
						} else {
							sLabel = sLabel + " " + sText;
						}
						mAriaProps["label"] = sLabel;

						// remove pointer to FormElements label
						var sLabelledBy = mAriaProps["labelledby"];
						if (sLabelledBy) {
							oLabel = this.getLabelControl();
							var aLabels = sLabelledBy.split(" ");
							iIndex = aLabels.indexOf(oLabel.getId());
							if (iIndex >= 0) {
								aLabels.splice(iIndex, 1);
								sLabelledBy = aLabels.join(" ");
							}
							mAriaProps["labelledby"] = sLabelledBy;
						}

						return mAriaProps;
					}
				}
			}
		}

		FormElement.prototype.enhanceAccessibilityState.apply(this, arguments);

	};

	/*
	 * If LayoutData changed on control this may need changes on the layout. So bubble to the form
	 */
	SemanticFormElement.prototype.onLayoutDataChange = function(oEvent){

		// if changes from outside - recalculate own LayoutData
		var oField = oEvent.srcControl;
		var oLayoutData = oField.getLayoutData();
		if (!oLayoutData || !oLayoutData._bSetBySemanticFormElement) {
			_updateLayoutData.call(this);
		}

		FormElement.prototype.onLayoutDataChange.apply(this, arguments);

	};

	/**
	 * Determines which fields are rendered.
	 *
	 * In edit mode, the field controls are rendered separated by the delimiters.
	 * In display mode, one text is rendered.
	 *
	 * @returns {sap.ui.core.Control[]} Array of fields to be rendered
	 * @private
	 * @ui5-restricted sap.ui.layout.form.Form
	 */
	SemanticFormElement.prototype.getFieldsForRendering = function(){

		var aFieldsForRendering = [];

		if (!this._bLayoutDataCreated) { // TODO: handle Layout change
			_updateLayoutData.call(this); // as Layout might be set after Fields, so LayoutData can only be determined now
		}

		if (!_renderAsText.call(this)) {
			if (this.getAggregation("_displayField")) {
				// switch to control mode missing, this could happen if something unexpected chaged on field what leads to update of getFormRenderAsControl
				// (happens if the change is not observed because of missing property in getFormObservingProperties or some internal change)
				// -> update now, even if it is somehow late and could lead to re-rendering
				this.destroyAggregation("_displayField");
				_updateControlsForEdit.call(this);
			}

			var aFields = this.getFields();
			var aDelemiters = this.getAggregation("_delimiters", []);
			for (var i = 0; i < aFields.length; i++) {
				var oField = aFields[i];
				if (oField.getVisible()) {
					if (aFieldsForRendering.length > 0 && aDelemiters[i - 1]) {
						aFieldsForRendering.push(aDelemiters[i - 1]);
					}
					aFieldsForRendering.push(oField);
				}
			}
		} else {
			if (!this.getAggregation("_displayField")) {
				// switch to display mode missing, this could happen if something unexpected chaged on field what leads to update of getFormRenderAsControl
				// (happens if the change is not observed because of missing property in getFormObservingProperties or some internal change)
				// -> update now, even if it is somehow late and could lead to re-rendering
				this.destroyAggregation("_delimiters");
				this._bLayoutDataCreated = false;
				_updateControlsForDisplay.call(this);
			}

			var oDisplay = this.getAggregation("_displayField");
			if (oDisplay) {
				aFieldsForRendering.push(oDisplay);
			}
		}

		return aFieldsForRendering;

	};

	/*
	 * handles change of FormElement itself and content controls
	 * @private
	 */
	SemanticFormElement.prototype._observeChanges = function(oChanges){

		FormElement.prototype._observeChanges.apply(this, arguments);

		if (oChanges.object === this) {
			// it's the FormElement
			if (oChanges.type === "parent") {
				_parentChanged.call(this, oChanges.mutation, oChanges.parent);
			} else if (oChanges.name === "fields") {
				_fieldChanged.call(this, oChanges.child, oChanges.mutation);
			} else if (oChanges.name === "_editable") {
				_editableChanged.call(this, oChanges.current);
			} else if (oChanges.name === "delimiter") {
				_delimiterChanged.call(this, oChanges.current);
			} else if (oChanges.name === "fieldLabels") {
				_fieldLabelsChanged.call(this, oChanges.mutation, oChanges.child);
			}
		} else {
			// it's some content control or parent
			if (oChanges.type === "parent") {
				_parentChanged.call(this, oChanges.mutation, oChanges.parent);
			} else if (oChanges.name === "layout") {
				_layoutChanged.call(this, oChanges.child, oChanges.mutation);
			} else if (oChanges.object.isA("sap.ui.core.Label")) {
				_fieldLabelChanged.call(this, oChanges);
			} else {
				_controlChanged.call(this, oChanges);
			}
		}

	};

	// *** Private helper functions ***

	function _editableChanged(bEditable) {

		if (bEditable) {
			this.destroyAggregation("_displayField");
			_updateControlsForEdit.call(this);
		} else if (_renderAsText.call(this)) {
			this.destroyAggregation("_delimiters");
			this._bLayoutDataCreated = false;
			_updateControlsForDisplay.call(this);
		} else { // switched to display mode but render controls -> update delemitters with spacing
			_updateControlsForEdit.call(this);
		}

	}

	function _fieldChanged(oField, sMutation) {

		if (sMutation === "insert") {
			if (!oField.isA("sap.ui.core.IFormContent") || !oField.isA("sap.ui.core.ISemanticFormContent")) {
				throw new Error(oField + " is not valid Form content. " + this); // only support allowed Fields
			}
			var aProperties = ["visible"];
			if (oField.getFormObservingProperties) {
				aProperties = aProperties.concat(oField.getFormObservingProperties());
			}
			if (oField.getFormValueProperty) {
				if (aProperties.indexOf(oField.getFormValueProperty()) === -1) {
					aProperties.push(oField.getFormValueProperty());
				}
			} else if (oField.getMetadata().getProperty("value")) {
				aProperties.push("value");
			} else if (oField.getMetadata().getProperty("text")) {
				aProperties.push("text");
			}
			this._oObserver.observe(oField, {
				properties: aProperties
			});
		} else {
			// unobserve is done in FormElement
			var oLayoutData = oField.getLayoutData();
			if (oLayoutData && oLayoutData._bSetBySemanticFormElement) {
				// remove LayoutData set by FormElement
				oLayoutData.destroy();
			}
		}

		if (!_renderAsText.call(this)) {
			_updateControlsForEdit.call(this);
		} else {
			_updateControlsForDisplay.call(this, true);
		}

		_updateLabelText.call(this); // to hide labels of invisible Field

	}

	function _delimiterChanged(sDelimiter) {

		if (!_renderAsText.call(this)) {
			_updateControlsForEdit.call(this);
		} else {
			_updateDisplayText.call(this, false);
		}
		_updateLabelText.call(this);

	}

	function _fieldLabelsChanged(sMutation, oLabel) {

		if (typeof oLabel !== "string") {
			// if control - observe text change (might come late via binding)
			if (sMutation === "insert") {
				this._oObserver.observe(oLabel, {
					properties: ["text"]
				});
			} else {
				this._oObserver.unobserve(oLabel);
			}
		}

		// update text only if rendered?
		_updateLabelText.call(this);

	}

	function _controlChanged(oChanges) {

		var sProperyName = oChanges.object.getFormValueProperty ? oChanges.object.getFormValueProperty() : null;
		var aObservingProperties = oChanges.object.getFormObservingProperties ? oChanges.object.getFormObservingProperties() : [];
		if (oChanges.name === sProperyName || oChanges.name === "value" || oChanges.name === "text") {
			// update display control
			if (_renderAsText.call(this)) {
				_updateDisplayText.call(this, false);
			}
		} else if (oChanges.name === "visible" || aObservingProperties.indexOf(oChanges.name) >= 0) {
			if (!_renderAsText.call(this)) {
				_updateControlsForEdit.call(this);
			} else {
				_updateControlsForDisplay.call(this, true);
			}
			_updateLabelText.call(this); // to hide labels of invisible Field
			this.invalidate(); // to force rerendering
		}

	}

	function _fieldLabelChanged(oChanges) {

		_updateLabelText.call(this);

	}


	function _updateControlsForEdit() {

		if (this._oInitPromise) {
			// module needs to be loaded -> create Delemiters async
			this._oInitPromise.then(function () {
				delete this._oInitPromise; // not longer needed as resolved
				if (!_renderAsText.call(this)) { // as edit mode might have changed
					_updateControlsForEdit.call(this);
				}
			}.bind(this));
			return;
		}

		var aFields = this.getFields();
		var aDelimiters = this.getAggregation("_delimiters", []);
		var sDelimiter = this.getDelimiter();
		var sId = this.getId() + "-delimiter-";
		var i = 0;

		if (!this._getEditable()) {
			sDelimiter = " " + sDelimiter + " "; // use Space to align spacing with concatenated texts
		}

		for (i = 0; i < aFields.length; i++) {
			if (i < aFields.length - 1) {
				if (aDelimiters.length > i) {
					library.form.FormHelper.updateDelimiter(aDelimiters[i], sDelimiter);
				} else {
					var oDelimiter = library.form.FormHelper.createDelimiter(sDelimiter, sId + i);
					oDelimiter.addStyleClass("sapUiFormDelimiter");
					this.addAggregation("_delimiters", oDelimiter);
				}
			}
		}

		// remove unused delimiters
		if (aDelimiters.length > 0 && aDelimiters.length > aFields.length - 1) {
			for (i = aFields.length - 1; i < aDelimiters.length; i++) {
				aDelimiters[i].destroy();
			}
		}

		_updateLayoutData.call(this);

	}

	var oRenderingDelegate = {
			onBeforeRendering: function() {
				_updateDisplayText.call(this, true);
			}
	};

	function _updateControlsForDisplay(bSetTextAsync) {

		if (this._oInitPromise) {
			// module needs to be loaded -> create Delemiters async
			this._oInitPromise.then(function () {
				delete this._oInitPromise; // not longer needed as resolved
				if (_renderAsText.call(this)) { // as edit mode might have changed
					_updateControlsForDisplay.call(this);
				}
			}.bind(this));
			return;
		}

		var oDisplay = this.getAggregation("_displayField");

		if (oDisplay) {
			_updateDisplayText.call(this, false); // if already rendered update text
		} else {
			var sId = this.getId() + "-display";
			oDisplay = library.form.FormHelper.createSemanticDisplayControl("", sId);
			oDisplay.addDelegate(oRenderingDelegate, true, this);
			this.setAggregation("_displayField", oDisplay);
		}

	}

	// As display text might need some logic to be determined -> determine only if really rendered and not for every update
	function _updateDisplayText(bForce) {

		var oDisplay = this.getAggregation("_displayField");

		if (oDisplay && (oDisplay.getDomRef() || bForce)) { // update only if rendered (or forced on before rendering)
			if (bForce && oDisplay._bNoForceUpdate) { // re-rendering triggered by update of text itself -> do not do twice
				oDisplay._bNoForceUpdate = false;
				return;
			}

			var aFields = this.getFields();
			var aTexts = [];
			var bAsync = false;

			for (var i = 0; i < aFields.length; i++) {
				var oField = aFields[i];
				if (oField.getVisible()) {
					var sProperyName = oField.getFormValueProperty ? oField.getFormValueProperty() : null;
					var vText;
					if (oField.getFormFormattedValue) {
						vText = oField.getFormFormattedValue();
						if (vText instanceof Promise) {
							bAsync = true;
						}
					} else if (sProperyName) {
						vText = oField.getProperty(sProperyName);
					} else if (oField.getMetadata().getProperty("value")) {
						vText = oField.getValue();
					} else if (oField.getMetadata().getProperty("text")) {
						vText = oField.getText();
					}
					aTexts.push(vText);
				}
			}

			oDisplay._bNoForceUpdate = true; // prevent double update, as setText might trigger re-rendering
			if (bAsync) {
				Promise.all(aTexts).then(function(aTexts) {
					var oDisplay = this.getAggregation("_displayField");
					var sText = _concatenateTexts.call(this, aTexts);
					oDisplay._bNoForceUpdate = true; // prevent double update, as setText might trigger re-rendering (again as a re-rendeing could happen until promise resolved)
					library.form.FormHelper.updateSemanticDisplayControl(oDisplay, sText);
				}.bind(this));
			} else {
				var sText = _concatenateTexts.call(this, aTexts);
				library.form.FormHelper.updateSemanticDisplayControl(oDisplay, sText);
			}
		} else if (oDisplay && oDisplay._bNoForceUpdate) { // execute update on next rendering
			oDisplay._bNoForceUpdate = false;
		}

	}

	function _concatenateTexts(aTexts) {
		var sDelimiter = this.getDelimiter();
		var sText = "";

		for (var i = 0; i < aTexts.length; i++) {
			sText = sText + aTexts[i];
			if (i < aTexts.length - 1) {
				sText = sText + " " + sDelimiter + " ";
			}
		}

		return sText;
	}

	function _updateLabelText() {

		if (!this.getLabel()) {
			// only use if no Label is set on FormElement level
			if (this._oInitPromise) {
				// module needs to be loaded -> create Label async
				this._oInitPromise.then(function () {
					delete this._oInitPromise; // not longer needed as resolved
					_updateLabelText.call(this);
				}.bind(this));
				return;
			}

			var aFieldLabels = this.getFieldLabels();
			var aFields = this.getFields();
			var aTexts = [];
			for (var i = 0; i < aFieldLabels.length; i++) {
				if (aFields[i] && aFields[i].getVisible()) { // if Field not already assigned update if assigned
					var oFieldLabel = aFieldLabels[i];
					if (typeof oFieldLabel === "string") {
						aTexts.push(oFieldLabel);
					} else {
						aTexts.push(oFieldLabel.getText());
					}
				}
			}

			var sText = _concatenateTexts.call(this, aTexts);
			this._setInternalLabel(sText);
		}

	}

	// as on adding the Fields the FormElement must not be already assigned to the Form,
	// the used Layout can be unknown. But latest on rendering it is known, so there the LayoutData can be set latest.
	function _updateLayoutData() {

		var aFields = this.getFields().filter(function(oField) {
			return oField.getVisible();
		});
		var aDelemiters = this.getAggregation("_delimiters", []);
		var oFormContainer = this.getParent();
		var oForm = oFormContainer && oFormContainer.getParent();
		var oLayout = oForm && oForm.getLayout();
		var oLayoutData;
		var i = 0;

		if (!oLayout || !oLayout.getLayoutDataForDelimiter) {
			return;
		}

		if (this._getEditable()) {
			// delimiters
			for (i = 0; i < aDelemiters.length; i++) {
				var oDelimiter = aDelemiters[i];
				if (!oDelimiter.getLayoutData()) {
					// TODO: handle change of FormLayout
					oLayoutData = oLayout.getLayoutDataForDelimiter();
					if (oLayoutData) {
						if (oLayoutData instanceof Promise) {
							oLayoutData.then(function(oLayoutData) {
								oLayoutData._bSetBySemanticFormElement = true;
								this.setLayoutData(oLayoutData);
							}.bind(oDelimiter));
						} else if (oLayoutData.isA("sap.ui.core.LayoutData")) {
							oLayoutData._bSetBySemanticFormElement = true;
							oDelimiter.setLayoutData(oLayoutData);
						}
					}
				}
			}

			// fields (only if have no own LayoutData)
			if (aFields.length > 1) {
				// only if there are delimiters
				for (i = 0; i < aFields.length; i++) {
					var oField = aFields[i];
					oLayoutData = oField.getLayoutData();
					if (!oLayoutData || oLayoutData._bSetBySemanticFormElement) {
						oLayoutData = oLayout.getLayoutDataForSemanticField(aFields.length, i + 1, oLayoutData);
						if (oLayoutData) {
							if (oLayoutData instanceof Promise) {
								oLayoutData.then(function(oLayoutData) {
									oLayoutData._bSetBySemanticFormElement = true;
									this.setLayoutData(oLayoutData);
								}.bind(oField));
							} else if (oLayoutData.isA("sap.ui.core.LayoutData") && !oLayoutData._bSetBySemanticFormElement) { // if already set (just updated), don't need to set again
								oLayoutData._bSetBySemanticFormElement = true;
								oField.setLayoutData(oLayoutData);
							}
						}
					}
				}
			}

			this._bLayoutDataCreated = true; // to not check it on every getFieldsForRendering call
		}

	}

	function _renderAsText() {

		if (this._getEditable()) {
			return false;
		} else {
			var aFields = this.getFields();
			var bRenderAsControl = true;

			for (var i = 0; i < aFields.length; i++) {
				if (!aFields[i].getFormRenderAsControl || !aFields[i].getFormRenderAsControl()) {
					bRenderAsControl = false;
					break;
				}
			}

			var oFormContainer = this.getParent();
			var oForm = oFormContainer && oFormContainer.getParent();
			var oLayout = oForm && oForm.getLayout();
			var bRenderControls = oLayout ? oLayout.renderControlsForSemanticElement() : true; // if no layout assigned right now render as controls per default
			return !(bRenderAsControl && bRenderControls);
		}

	}

	function _parentChanged(sMutation, oParent) {

		var oLayout;
		if (sMutation === "set") {
			var oForm;
			if (oParent.isA("sap.ui.layout.form.FormContainer")) {
				this._oObserver.observe(oParent, {
					parent: true
				});
				oForm = oParent.getParent();
			} else if (oParent.isA("sap.ui.layout.form.Form")) {
				this._oObserver.observe(oParent, {
					aggregations: ["layout"]
				});
				oForm = oParent;
			}
			oLayout = oForm && oForm.getLayout();
		} else if (oParent.isA("sap.ui.layout.form.FormContainer") || oParent.isA("sap.ui.layout.form.Form")) {
			this._oObserver.unobserve(oParent);
		}

		if (oLayout) { // as long as we have no layout no update needed
			_layoutChanged.call(this, oLayout);
		}

	}

	function _layoutChanged(oLayout, sMutation) {

		// as layout change could lead to change of rendering mode (layout might not support to render controls) mode needs to be checked
		_editableChanged.call(this, this._getEditable());
		_updateLayoutData.call(this);

	}

	return SemanticFormElement;

});