/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/m/library", "sap/ui/mdc/enums/ContentMode"
], (
	mLibrary,
	ContentMode
) => {
	"use strict";

	const { EmptyIndicatorMode } = mLibrary;
	const { TokenizerRenderMode } = mLibrary;

	/**
	 * Object-based definition of the default content type that is used in the {@link sap.ui.mdc.field.content.ContentFactory}.
	 * Default content can be overwritten to create new content types.
	 * This defines which controls to load and create for a given {@link sap.ui.mdc.enums.ContentMode}.
	 * @namespace
	 * @author SAP SE
	 * @private
	 * @ui5-restricted sap.ui.mdc
	 * @since 1.87
	 * @alias sap.ui.mdc.field.content.DefaultContent
	 */
	const DefaultContent = {
		getDisplay: function() {
			return ["sap/m/Text"];
		},
		getDisplayMultiValue: function() {
			return ["sap/ui/mdc/field/TokenizerDisplay", "sap/ui/mdc/field/TokenDisplay"];
		},
		getDisplayMultiLine: function() {
			return ["sap/m/ExpandableText"];
		},
		getEdit: function() {
			return ["sap/ui/mdc/field/FieldInput"];
		},
		getEditMultiValue: function() {
			return ["sap/ui/mdc/field/FieldMultiInput", "sap/m/Token"];
		},
		getEditMultiLine: function() {
			return ["sap/m/TextArea"];
		},
		getEditOperator: function() {
			return [null];
		},
		getEditForHelp: function() {
			return this.getEdit();
		},
		getUseDefaultEnterHandler: function() {
			return true;
		},
		getUseDefaultValueHelp: function() {
			return { name: "defineConditions", oneOperatorSingle: false, oneOperatorMulti: false, single: true, multi: true };
		},
		getSupportedModes: function() {
			return []; // empty array means all (to support additional modes in future)
		},
		/**
		 * Determines which controls to return for a given {@link sap.ui.mdc.enums.ContentMode}.
		 * @param {sap.ui.mdc.enums.ContentMode} sContentMode The given content mode
		 * @param {string} sOperator Name of the operator if the <code>EditOperator</code> content mode is used
		 * @returns {string[]} aControlNames Names of the determined controls
		 */
		getControlNames: function(sContentMode, sOperator) {
			let aControlNames;
			switch (sContentMode) {
				case ContentMode.Display:
					aControlNames = this.getDisplay();
					break;
				case ContentMode.DisplayMultiValue:
					aControlNames = this.getDisplayMultiValue();
					break;
				case ContentMode.DisplayMultiLine:
					aControlNames = this.getDisplayMultiLine();
					break;
				case ContentMode.EditMultiValue:
					aControlNames = this.getEditMultiValue();
					break;
				case ContentMode.EditMultiLine:
					aControlNames = this.getEditMultiLine();
					break;
				case ContentMode.EditOperator:
					if (this.getEditOperator()) {
						aControlNames = this.getEditOperator()[sOperator] ? this.getEditOperator()[sOperator].name : [null];
					} else {
						aControlNames = [null];
					}
					break;
				case ContentMode.EditForHelp:
					aControlNames = this.getEditForHelp();
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
		 * Determines if formatting of all conditions to a single value is supported for a {@link sap.ui.mdc.enums.ContentMode}.
		 * @param {sap.ui.mdc.enums.ContentMode} sContentMode The given content mode
		 * @returns {boolean} If set, the conditions will not be formatted (MultiInput value-property case)
		 */
		getNoFormatting: function(sContentMode) {
			if (sContentMode === ContentMode.EditMultiValue) {
				return true;
			} else {
				return false;
			}
		},
		/**
		 * Creates the suitable controls for the given content mode and returns the control instances.
		 * @param {sap.ui.mdc.field.content.ContentFactory} oContentFactory The content factory that calls this function
		 * @param {sap.ui.mdc.enums.ContentMode} sContentMode a given content mode
		 * @param {string} sOperator Name of the operator if the <code>EditOperator</code> content mode is used
		 * @param {Object[]} aControls Array containing the control classes that are to be created
		 * @param {string} sId ID of the {@link sap.ui.mdc.field.FieldBase}
		 * @returns {sap.ui.core.Control[]} Array containing the created controls
		 */
		create: function(oContentFactory, sContentMode, sOperator, aControls, sId) {
			switch (sContentMode) {
				case ContentMode.Display:
					return this.createDisplay(oContentFactory, aControls, sId);
				case ContentMode.DisplayMultiValue:
					return this.createDisplayMultiValue(oContentFactory, aControls, sId);
				case ContentMode.DisplayMultiLine:
					return this.createDisplayMultiLine(oContentFactory, aControls, sId);
				case ContentMode.EditMultiValue:
					return this.createEditMultiValue(oContentFactory, aControls, sId);
				case ContentMode.EditMultiLine:
					return this.createEditMultiLine(oContentFactory, aControls, sId);
				case ContentMode.EditOperator:
					if (this.getEditOperator()) {
						return this.getEditOperator()[sOperator] ? this.getEditOperator()[sOperator].create.call(this, oContentFactory, aControls, sId) : [null];
					}
					return [null];
				case ContentMode.EditForHelp:
					return this.createEditForHelp(oContentFactory, aControls, sId);
				default:
					return this.createEdit(oContentFactory, aControls, sId);
			}
		},
		/**
		 * Creates the suitable controls for content mode <code>Edit</code>.
		 * @param {sap.ui.mdc.field.content.ContentFactory} oContentFactory The content factory that calls the create function
		 * @param {Object[]} aControlClasses Array containing the control classes which are to be created
		 * @param {string} sId ID of the field control
		 * @returns {sap.ui.core.Control[]} Array containing the created controls
		 */
		createEdit: function(oContentFactory, aControlClasses, sId) {
			const Input = aControlClasses[0];
			const oConditionsType = oContentFactory.getConditionsType();
			const oInput = new Input(sId, {
				value: { path: "$field>/conditions", type: oConditionsType },
				placeholder: "{$field>/placeholder}",
				textAlign: "{$field>/textAlign}",
				textDirection: "{$field>/textDirection}",
				required: "{$field>/required}",
				editable: { path: "$field>/editMode", formatter: oContentFactory.getMetadata()._oClass._getEditable },
				enabled: { path: "$field>/editMode", formatter: oContentFactory.getMetadata()._oClass._getEnabled },
				valueState: "{$field>/valueState}",
				valueStateText: "{$field>/valueStateText}",
				valueHelpIconSrc: oContentFactory.getValueHelpIcon(),
				showValueHelp: "{$field>/_valueHelpEnabled}",
				ariaAttributes: "{$field>/_ariaAttributes}",
				width: "100%",
				// fieldGroupIds: are taken from parent if not automatically set (see Element.prototype._getFieldGroupIds) -> so no binding needed
				tooltip: "{$field>/tooltip}",
				autocomplete: false,
				change: oContentFactory.getHandleContentChange(),
				liveChange: oContentFactory.getHandleContentLiveChange(),
				valueHelpRequest: oContentFactory.getHandleValueHelpRequest()
			});

			oInput.setPreferUserInteraction(true);
			oContentFactory.setAriaLabelledBy(oInput);

			return [oInput];
		},
		/**
		 * Creates the suitable controls for content mode <code>EditMultiValue</code>.
		 * @param {sap.ui.mdc.field.content.ContentFactory} oContentFactory The content factory that calls the create function
		 * @param {Object[]} aControlClasses Array containing the control classes which are to be created
		 * @param {string} sId ID of the field control
		 * @returns {sap.ui.core.Control[]} Array containing the created controls
		 */
		createEditMultiValue: function(oContentFactory, aControlClasses, sId) {
			const Input = aControlClasses[0];
			const Token = aControlClasses[1];
			const oConditionType = oContentFactory.getConditionType();
			const oConditionsType = oContentFactory.getConditionsType();
			const oToken = new Token(sId + "-token", {
				text: {
					path: '$field>',
					type: oConditionType
				}
			});

			const oMultiInput = new Input(sId, {
				value: { path: "$field>/conditions", type: oConditionsType }, // only for parsing
				placeholder: "{$field>/placeholder}",
				textAlign: "{$field>/textAlign}",
				textDirection: "{$field>/textDirection}",
				required: "{$field>/required}",
				editable: { path: "$field>/editMode", formatter: oContentFactory.getMetadata()._oClass._getEditable },
				enabled: { path: "$field>/editMode", formatter: oContentFactory.getMetadata()._oClass._getEnabled },
				valueState: "{$field>/valueState}",
				valueStateText: "{$field>/valueStateText}",
				showValueHelp: "{$field>/_valueHelpEnabled}",
				valueHelpIconSrc: oContentFactory.getValueHelpIcon(),
				ariaAttributes: "{$field>/_ariaAttributes}",
				width: "100%",
				// fieldGroupIds: are taken from parent if not automatically set (see Element.prototype._getFieldGroupIds) -> so no binding needed
				tooltip: "{$field>/tooltip}",
				tokens: { path: "$field>/conditions", template: oToken, length: 10, startIndex: -10 },
				dependents: [oToken], // to destroy it if MultiInput is destroyed
				autocomplete: false,
				showSuggestion: false, // as true by default
				change: oContentFactory.getHandleContentChange(),
				liveChange: oContentFactory.getHandleContentLiveChange(),
				tokenUpdate: oContentFactory.getHandleTokenUpdate(),
				valueHelpRequest: oContentFactory.getHandleValueHelpRequest()
			});

			oMultiInput.setPreferUserInteraction(true);
			oContentFactory.setAriaLabelledBy(oMultiInput);

			return [oMultiInput];
		},
		/**
		 * Creates the suitable controls for content mode <code>EditMultiLine</code>.
		 * @param {sap.ui.mdc.field.content.ContentFactory} oContentFactory The content factory that calls the create function
		 * @param {Object[]} aControlClasses Array containing the control classes which are to be created
		 * @param {string} sId ID of the field control
		 * @returns {sap.ui.core.Control[]} Array containing the created controls
		 */
		createEditMultiLine: function(oContentFactory, aControlClasses, sId) {
			const TextArea = aControlClasses[0];
			const oConditionsType = oContentFactory.getConditionsType();
			const oTextArea = new TextArea(sId, {
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
				// fieldGroupIds: are taken from parent if not automatically set (see Element.prototype._getFieldGroupIds) -> so no binding needed
				tooltip: "{$field>/tooltip}",
				change: oContentFactory.getHandleContentChange(),
				liveChange: oContentFactory.getHandleContentLiveChange()
			});

			oTextArea.setPreferUserInteraction(true);
			oContentFactory.setAriaLabelledBy(oTextArea);

			return [oTextArea];
		},
		/**
		 * Creates the suitable controls for content mode <code>Display</code>.
		 * @param {sap.ui.mdc.field.content.ContentFactory} oContentFactory The content factory that calls the create function
		 * @param {Object[]} aControlClasses Array containing the control classes which are to be created
		 * @param {string} sId ID of the field control
		 * @returns {sap.ui.core.Control[]} Array containing the created controls
		 */
		createDisplay: function(oContentFactory, aControlClasses, sId) {
			const Text = aControlClasses[0];
			const oConditionsType = oContentFactory.getConditionsType();
			const oText = new Text(sId, {
				text: { path: "$field>/conditions", type: oConditionsType },
				textAlign: "{$field>/textAlign}",
				textDirection: "{$field>/textDirection}",
				wrapping: "{$field>/multipleLines}",
				width: "100%",
				// fieldGroupIds: are taken from parent if not automatically set (see Element.prototype._getFieldGroupIds) -> so no binding needed
				tooltip: "{$field>/tooltip}",
				emptyIndicatorMode: EmptyIndicatorMode.Auto
			});

			return [oText];
		},
		/**
		 * Creates the suitable controls for content mode <code>DisplayMultiLine</code>.
		 * @param {sap.ui.mdc.field.content.ContentFactory} oContentFactory The content factory that calls the create function
		 * @param {Object[]} aControlClasses Array containing the control classes which are to be created
		 * @param {string} sId ID of the field control
		 * @returns {sap.ui.core.Control[]} Array containing the created controls
		 * @since 1.91
		 */
		createDisplayMultiLine: function(oContentFactory, aControlClasses, sId) {
			const ExpandableText = aControlClasses[0];
			const oConditionsType = oContentFactory.getConditionsType();
			const oExpandableText = new ExpandableText(sId, {
				text: { path: "$field>/conditions", type: oConditionsType },
				textAlign: "{$field>/textAlign}",
				textDirection: "{$field>/textDirection}",
				// fieldGroupIds: are taken from parent if not automatically set (see Element.prototype._getFieldGroupIds) -> so no binding needed
				tooltip: "{$field>/tooltip}",
				emptyIndicatorMode: EmptyIndicatorMode.Auto
			});

			return [oExpandableText];
		},
		/**
		 * Creates the suitable controls for content mode <code>DisplayMultiValue</code>.
		 * @param {sap.ui.mdc.field.content.ContentFactory} oContentFactory The content factory that calls the create function
		 * @param {Object[]} aControlClasses Array containing the control classes which are to be created
		 * @param {string} sId ID of the field control
		 * @returns {sap.ui.core.Control[]} Array containing the created controls
		 * @since 1.96
		 */
		createDisplayMultiValue: function(oContentFactory, aControlClasses, sId) {
			const Tokenizer = aControlClasses[0];
			const Token = aControlClasses[1];
			const oConditionType = oContentFactory.getConditionType();
			const oToken = new Token(sId + "-token", {
				text: {
					path: '$field>',
					type: oConditionType
				}
			});

			const oTokenizer = new Tokenizer(sId, {
				editable: false,
				// textAlign: "{$field>/textAlign}",
				emptyIndicatorMode: EmptyIndicatorMode.Auto,
				renderMode: TokenizerRenderMode.Narrow,
				width: "100%",
				// fieldGroupIds: are taken from parent if not automatically set (see Element.prototype._getFieldGroupIds) -> so no binding needed
				tooltip: "{$field>/tooltip}",
				tokens: { path: "$field>/conditions", template: oToken },
				dependents: [oToken] // to destroy it if Control is destroyed
			});

			return [oTokenizer];
		},
		/**
		 * Creates the suitable controls for content mode <code>EditForHelp</code>.
		 * @param {sap.ui.mdc.field.content.ContentFactory} oContentFactory The content factory that calls the create function
		 * @param {Object[]} aControlClasses Array containing the control classes which are to be created
		 * @param {string} sId ID of the field control
		 * @returns {sap.ui.core.Control[]} Array containing the created controls
		 * @since 1.96
		 */
		createEditForHelp: function(oContentFactory, aControlClasses, sId) {
			if (oContentFactory.getDataType() && oContentFactory.getDataType().isA("sap.ui.model.CompositeType")) {
				oContentFactory.setIsMeasure(true); // handle only Number or Unit (in single Field)
			}
			return this.createEdit(oContentFactory, aControlClasses, sId); // In normal cases there is no difference between EditForHelp and Edit.
		}
	};

	return DefaultContent;
});