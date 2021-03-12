/*
 * ! ${copyright}
 */
sap.ui.define([
	"sap/m/library"
], function(
	mLibrary
) {
	"use strict";

	var EmptyIndicatorMode = mLibrary.EmptyIndicatorMode;

	/**
	 * Object-based definition of the default content type that is used in the {@link sap.ui.mdc.field.content.ContentFactory}.
	 * Default content can be overwritten to create new content types.
	 * This defines which controls to load and create for a given {@link sap.ui.mdc.enum.ContentMode}.
	 * @author SAP SE
	 * @private
	 * @ui5-restricted sap.ui.mdc
	 * @experimental As of version 1.87
	 * @since 1.87
	 * @alias sap.ui.mdc.field.content.DefaultContent
	 * @MDC_PUBLIC_CANDIDATE
	 */
	var DefaultContent = {
		getDisplay: function() {
			return ["sap/m/Text"];
		},
		getEdit: function() {
			return ["sap/ui/mdc/field/FieldInput"];
		},
		getEditMulti: function() {
			return ["sap/ui/mdc/field/FieldMultiInput", "sap/m/Token"];
		},
		getEditMultiLine: function() {
			return ["sap/m/TextArea"];
		},
		getEditOperator: function() {
			return [null];
		},
		getUseDefaultEnterHandler: function() {
			return true;
		},
		getUseDefaultFieldHelp: function() {
			return { name: "defineConditions", oneOperatorSingle: false, oneOperatorMulti: false };
		},
		/**
		 * Determines which controls to return for a given {@link sap.ui.mdc.enum.ContentMode}.
		 * @param {sap.ui.mdc.enum.ContentMode} sContentMode The given content mode
		 * @param {String} sOperator Name of the operator if the <code>EditOperator</code> content mode is used
		 * @returns {String[]} aControlNames Names of the determined controls
		 */
		getControlNames: function(sContentMode, sOperator) {
			var aControlNames;
			switch (sContentMode) {
				case "Display":
					aControlNames = this.getDisplay();
					break;
				case "EditMulti":
					aControlNames = this.getEditMulti();
					break;
				case "EditMultiLine":
					aControlNames = this.getEditMultiLine();
					break;
				case "EditOperator":
					if (this.getEditOperator()) {
						aControlNames = this.getEditOperator()[sOperator] ? this.getEditOperator()[sOperator].name : [null];
					} else {
						aControlNames = [null];
					}
					break;
				default:
					aControlNames = this.getEdit();
			}
			if (aControlNames) {
				return Array.isArray(aControlNames) ? aControlNames : [aControlNames];
			}
			throw new Error("No control defined for content mode " + sContentMode);
		},
		/**
		 * Creates the suitable controls for the given content mode and returns the control instances.
		 * @param {sap.ui.mdc.field.content.ContentFactory} oContentFactory The content factory that calls this function
		 * @param {sap.ui.mdc.enum.ContentMode} sContentMode a given content mode
		 * @param {String} sOperator Name of the operator if the <code>EditOperator</code> content mode is used
		 * @param {Object[]} aControls Array containing the control classes that are to be created
		 * @param {String} sId ID of the {@link sap.ui.mdc.field.FieldBase}
		 * @returns {sap.ui.core.Control[]} Array containing the created controls
		 */
		create: function(oContentFactory, sContentMode, sOperator, aControls, sId) {
			switch (sContentMode) {
				case "Display":
					return this.createDisplay(oContentFactory, aControls, sId);
				case "EditMulti":
					return this.createEditMulti(oContentFactory, aControls, sId);
				case "EditMultiLine":
					return this.createEditMultiLine(oContentFactory, aControls, sId);
				case "EditOperator":
					if (this.getEditOperator()) {
						return this.getEditOperator()[sOperator] ? this.getEditOperator()[sOperator].create.call(this, oContentFactory, aControls, sId) : [null];
					}
					return [null];
				default:
					return this.createEdit(oContentFactory, aControls, sId);
			}
		},
		/**
		 * Creates the suitable controls for content mode "Edit".
		 * @param {sap.ui.mdc.field.content.ContentFactory} oContentFactory The content factory that calls the create function
		 * @param {Object[]} aControlClasses Array containing the control classes which are to be created
		 * @param {String} sId ID of the field control
		 * @returns {sap.ui.core.Control[]} Array containing the created controls
		 */
		createEdit: function(oContentFactory, aControlClasses, sId) {
			var Input = aControlClasses[0];
			var oConditionsType = oContentFactory.getConditionsType();
			var oInput = new Input(sId, {
				value: { path: "$field>/conditions", type: oConditionsType },
				placeholder: "{$field>/placeholder}",
				textAlign: "{$field>/textAlign}",
				textDirection: "{$field>/textDirection}",
				required: "{$field>/required}",
				editable: { path: "$field>/editMode", formatter: oContentFactory.getMetadata()._oClass._getEditable },
				enabled: { path: "$field>/editMode", formatter: oContentFactory.getMetadata()._oClass._getEnabled },
				valueState: "{$field>/valueState}",
				valueStateText: "{$field>/valueStateText}",
				valueHelpIconSrc: oContentFactory.getFieldHelpIcon(),
				showValueHelp: "{$field>/_fieldHelpEnabled}",
				ariaAttributes: "{$field>/_ariaAttributes}",
				width: "100%",
				tooltip: "{$field>/tooltip}",
				autocomplete: false,
				change: oContentFactory.getHandleContentChange(),
				liveChange: oContentFactory.getHandleContentLiveChange(),
				valueHelpRequest: oContentFactory.getHandleValueHelpRequest()
			});

			oInput._setPreferUserInteraction(true);
			oContentFactory.setBoundProperty("value");
			oContentFactory.setAriaLabelledBy(oInput);

			return [oInput];
		},
		/**
		 * Creates the suitable controls for content mode "EditMulti".
		 * @param {sap.ui.mdc.field.content.ContentFactory} oContentFactory The content factory that calls the create function
		 * @param {Object[]} aControlClasses Array containing the control classes which are to be created
		 * @param {String} sId ID of the field control
		 * @returns {sap.ui.core.Control[]} Array containing the created controls
		 */
		createEditMulti: function(oContentFactory, aControlClasses, sId) {
			var Input = aControlClasses[0];
			var Token = aControlClasses[1];
			var oConditionType = oContentFactory.getConditionType();
			var oToken = new Token(sId + "-token", {
				text: {
					path: '$field>',
					type: oConditionType
				}
			});

			var oMultiInput = new Input(sId, {
				placeholder: "{$field>/placeholder}",
				textAlign: "{$field>/textAlign}",
				textDirection: "{$field>/textDirection}",
				required: "{$field>/required}",
				editable: { path: "$field>/editMode", formatter: oContentFactory.getMetadata()._oClass._getEditable },
				enabled: { path: "$field>/editMode", formatter: oContentFactory.getMetadata()._oClass._getEnabled },
				valueState: "{$field>/valueState}",
				valueStateText: "{$field>/valueStateText}",
				showValueHelp: "{$field>/_fieldHelpEnabled}",
				valueHelpIconSrc: oContentFactory.getFieldHelpIcon(),
				ariaAttributes: "{$field>/_ariaAttributes}",
				width: "100%",
				tooltip: "{$field>/tooltip}",
				tokens: { path: "$field>/conditions", template: oToken },
				dependents: [oToken], // to destroy it if MultiInput is destroyed
				autocomplete: false,
				change: oContentFactory.getHandleContentChange(),
				liveChange: oContentFactory.getHandleContentLiveChange(),
				tokenUpdate: oContentFactory.getHandleTokenUpdate(),
				valueHelpRequest: oContentFactory.getHandleValueHelpRequest()
			});

			oMultiInput._setPreferUserInteraction(true);
			oContentFactory.setAriaLabelledBy(oMultiInput);

			return [oMultiInput];
		},
		/**
		 * Creates the suitable controls for content mode "EditMultiLine".
		 * @param {sap.ui.mdc.field.content.ContentFactory} oContentFactory The content factory that calls the create function
		 * @param {Object[]} aControlClasses Array containing the control classes which are to be created
		 * @param {String} sId ID of the field control
		 * @returns {sap.ui.core.Control[]} Array containing the created controls
		 */
		createEditMultiLine: function(oContentFactory, aControlClasses, sId) {
			var TextArea = aControlClasses[0];
			var oConditionsType = oContentFactory.getConditionsType();
			var oTextArea = new TextArea(sId, {
				value: { path: "$field>/conditions", type: oConditionsType },
				placeholder: "{$field>/placeholder}",
				textAlign: "{$field>/textAlign}",
				textDirection: "{$field>/textDirection}",
				required: "{$field>/required}",
				editable: { path: "$field>/editMode", formatter: oContentFactory.getMetadata()._oClass._getEditable },
				enabled: { path: "$field>/editMode", formatter: oContentFactory.getMetadata()._oClass._getEnabled },
				valueState: "{$field>/valueState}",
				valueStateText: "{$field>/valueStateText}",
				width: "100%",
				rows: 4,
				tooltip: "{$field>/tooltip}",
				change: oContentFactory.getHandleContentChange(),
				liveChange: oContentFactory.getHandleContentLiveChange()
			});

			oTextArea._setPreferUserInteraction(true);
			oContentFactory.setBoundProperty("value");
			oContentFactory.setAriaLabelledBy(oTextArea);

			return [oTextArea];
		},
		/**
		 * Creates the suitable controls for content mode "Display".
		 * @param {sap.ui.mdc.field.content.ContentFactory} oContentFactory The content factory that calls the create function
		 * @param {Object[]} aControlClasses Array containing the control classes which are to be created
		 * @param {String} sId ID of the field control
		 * @returns {sap.ui.core.Control[]} Array containing the created controls
		 */
		createDisplay: function(oContentFactory, aControlClasses, sId) {
			var Text = aControlClasses[0];
			var oConditionsType = oContentFactory.getConditionsType();
			var oText = new Text(sId, {
				text: { path: "$field>/conditions", type: oConditionsType },
				textAlign: "{$field>/textAlign}",
				textDirection: "{$field>/textDirection}",
				wrapping: "{$field>/multipleLines}",
				width: "100%",
				tooltip: "{$field>/tooltip}",
				emptyIndicatorMode: EmptyIndicatorMode.Auto
			});
			oContentFactory.setBoundProperty("text");

			return [oText];
		}
	};

	return DefaultContent;
});
