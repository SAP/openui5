/*!
 * ${copyright}
 */

// Provides control sap.ui.webc.main.MultiInput.
sap.ui.define([
	"sap/ui/webc/common/WebComponent",
	"./library",
	"sap/ui/core/EnabledPropagator",
	"sap/ui/base/ManagedObjectObserver",
	"sap/ui/core/library",
	"./thirdparty/MultiInput",
	"./thirdparty/features/InputElementsFormSupport",
	"./thirdparty/features/InputSuggestions"
], function(WebComponent, library, EnabledPropagator, ManagedObjectObserver, coreLibrary) {
	"use strict";

	var ValueState = coreLibrary.ValueState;
	var InputType = library.InputType;

	/**
	 * Constructor for a new <code>MultiInput</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @extends sap.ui.webc.common.WebComponent
	 * @class
	 *
	 * <h3>Overview</h3> A <code>sap.ui.webc.main.MultiInput</code> field allows the user to enter multiple values, which are displayed as <code>sap.ui.webc.main.Token</code>.
	 *
	 * User can choose interaction for creating tokens. Fiori Guidelines say that user should create tokens when:
	 * <ul>
	 *     <li>Type a value in the input and press enter or focus out the input field (<code>change</code> event is fired)
	 *     <li>Select a value from the suggestion list</li> (<code>suggestion-item-select</code> event is fired)
	 * </ul>
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.92.0
	 * @experimental Since 1.92.0 This control is experimental and its API might change significantly.
	 * @alias sap.ui.webc.main.MultiInput
	 * @implements sap.ui.core.IFormContent, sap.ui.core.ISemanticFormContent
	 */
	var MultiInput = WebComponent.extend("sap.ui.webc.main.MultiInput", {
		metadata: {
			library: "sap.ui.webc.main",
			tag: "ui5-multi-input-ui5",
			interfaces: [
				"sap.ui.core.IFormContent",
				"sap.ui.core.ISemanticFormContent"
			],
			properties: {

				/**
				 * Defines the accessible aria name of the component.
				 */
				accessibleName: {
					type: "string"
				},

				/**
				 * Defines whether the control is enabled. A disabled control can't be interacted with, and it is not in the tab chain.
				 */
				enabled: {
					type: "boolean",
					defaultValue: true,
					mapping: {
						type: "attribute",
						to: "disabled",
						formatter: "_mapEnabled"
					}
				},

				/**
				 * Sets the maximum number of characters available in the input field. <br>
				 * <br>
				 * <b>Note:</b> This property is not compatible with the ui5-input type InputType.Number. If the ui5-input type is set to Number, the maxlength value is ignored.
				 */
				maxlength: {
					type: "int"
				},

				/**
				 * Determines the name with which the component will be submitted in an HTML form.
				 *
				 *
				 * <br>
				 * <br>
				 * <b>Note:</b> When set, a native <code>input</code> HTML element will be created inside the component so that it can be submitted as part of an HTML form. Do not use this property unless you need to submit a form.
				 */
				name: {
					type: "string",
					defaultValue: ""
				},

				/**
				 * Defines whether the value will be autcompleted to match an item
				 */
				noTypeahead: {
					type: "boolean",
					defaultValue: false
				},

				/**
				 * Defines a short hint intended to aid the user with data entry when the component has no value.
				 */
				placeholder: {
					type: "string",
					defaultValue: ""
				},

				/**
				 * Defines whether the component is read-only. <br>
				 * <br>
				 * <b>Note:</b> A read-only component is not editable, but still provides visual feedback upon user interaction.
				 */
				readonly: {
					type: "boolean",
					defaultValue: false
				},

				/**
				 * Defines whether the component is required.
				 */
				required: {
					type: "boolean",
					defaultValue: false
				},

				/**
				 * Defines whether the clear icon of the input will be shown.
				 */
				showClearIcon: {
					type: "boolean",
					defaultValue: false
				},

				/**
				 * Defines whether the component should show suggestions, if such are present. <br>
				 * <br>
				 * <b>Note:</b> You need to import the <code>InputSuggestions</code> module from <code>"@ui5/webcomponents/dist/features/InputSuggestions.js"</code> to enable this functionality.
				 */
				showSuggestions: {
					type: "boolean",
					defaultValue: false
				},

				/**
				 * Determines whether a value help icon will be visualized in the end of the input. Pressing the icon will fire <code>value-help-trigger</code> event.
				 */
				showValueHelpIcon: {
					type: "boolean",
					defaultValue: false
				},

				/**
				 * Defines the HTML type of the component. Available options are: <code>Text</code>, <code>Email</code>, <code>Number</code>, <code>Password</code>, <code>Tel</code>, and <code>URL</code>. <br>
				 * <br>
				 * <b>Notes:</b>
				 * <ul>
				 *     <li>The particular effect of this property differs depending on the browser and the current language settings, especially for type <code>Number</code>.</li>
				 *     <li>The property is mostly intended to be used with touch devices that use different soft keyboard layouts depending on the given input type.</li>
				 * </ul>
				 */
				type: {
					type: "sap.ui.webc.main.InputType",
					defaultValue: InputType.Text
				},

				/**
				 * Defines the value of the component. <br>
				 * <br>
				 * <b>Note:</b> The property is updated upon typing.
				 */
				value: {
					type: "string",
					defaultValue: ""
				},

				/**
				 * Defines the value state of the component. <br>
				 * <br>
				 * Available options are:
				 * <ul>
				 *     <li><code>None</code></li>
				 *     <li><code>Error</code></li>
				 *     <li><code>Warning</code></li>
				 *     <li><code>Success</code></li>
				 *     <li><code>Information</code></li>
				 * </ul>
				 */
				valueState: {
					type: "sap.ui.core.ValueState",
					defaultValue: ValueState.None
				},

				/**
				 * Defines the value state message that will be displayed as pop up under the contorl.
				 * <br>
				 * <br>
				 *
				 *
				 * <b>Note:</b> If not specified, a default text (in the respective language) will be displayed.
				 */
				valueStateMessage: {
					type: "string",
					defaultValue: "",
					mapping: {
						type: "slot",
						to: "div"
					}
				},

				/**
				 * Defines the width of the control
				 */
				width: {
					type: "sap.ui.core.CSSSize",
					mapping: "style"
				},

				/**
				 * The value for sap.ui.core.ISemanticFormContent interface.
				 * @private
				 */
				_semanticFormValue: {
					type: "string",
					defaultValue: "",
					visibility: "hidden"
				}
			},
			defaultAggregation: "suggestionItems",
			aggregations: {

				/**
				 * Defines the icon to be displayed in the component.
				 */
				icon: {
					type: "sap.ui.webc.main.IIcon",
					multiple: true,
					slot: "icon"
				},

				/**
				 *
				 */
				suggestionItems: {
					type: "sap.ui.webc.main.IInputSuggestionItem",
					multiple: true
				},

				/**
				 * Defines the component tokens.
				 */
				tokens: {
					type: "sap.ui.webc.main.IToken",
					multiple: true,
					slot: "tokens"
				}
			},
			associations: {

				/**
				 * Receives id(or many ids) of the controls that label this control.
				 */
				ariaLabelledBy: {
					type: "sap.ui.core.Control",
					multiple: true,
					mapping: {
						type: "property",
						to: "accessibleNameRef",
						formatter: "_getAriaLabelledByForRendering"
					}
				}
			},
			events: {

				/**
				 * Fired when the input operation has finished by pressing Enter or on focusout.
				 */
				change: {
					parameters: {}
				},

				/**
				 * Fired when the value of the component changes at each keystroke, and when a suggestion item has been selected.
				 */
				input: {
					parameters: {}
				},

				/**
				 * Fired when the user navigates to a suggestion item via the ARROW keys, as a preview, before the final selection.
				 */
				suggestionItemPreview: {
					parameters: {
						/**
						 * The previewed suggestion item.
						 */
						item: {
							type: "HTMLElement"
						},

						/**
						 * The DOM ref of the suggestion item.
						 */
						targetRef: {
							type: "HTMLElement"
						}
					}
				},

				/**
				 * Fired when a suggestion item, that is displayed in the suggestion popup, is selected.
				 */
				suggestionItemSelect: {
					parameters: {
						/**
						 * The selected item.
						 */
						item: {
							type: "HTMLElement"
						}
					}
				},

				/**
				 * Fired when a token is about to be deleted.
				 */
				tokenDelete: {
					parameters: {
						/**
						 * deleted token.
						 */
						token: {
							type: "HTMLElement"
						}
					}
				},

				/**
				 * Fired when the value help icon is pressed and F4 or ALT/OPTION + ARROW_UP/ARROW_DOWN keyboard keys are used.
				 */
				valueHelpTrigger: {
					parameters: {}
				}
			},
			methods: ["openPicker"],
			getters: ["previewItem"],
			designtime: "sap/ui/webc/main/designtime/MultiInput.designtime"
		}
	});

	/**
	 * Manually opens the suggestions popover, assuming suggestions are enabled. Items must be preloaded for it to open.
	 * @public
	 * @name sap.ui.webc.main.MultiInput#openPicker
	 * @function
	 */

	/**
	 * Returns the the suggestion item on preview.
	 * @public
	 * @name sap.ui.webc.main.MultiInput#getPreviewItem
	 * @function
	 */

	EnabledPropagator.call(MultiInput.prototype);

	/* CUSTOM CODE START */

	MultiInput.prototype.init = function() {
		/* Aggregation forwarding does not invalidate outer control, but we need to have that invalidation */
		this._oTokenizerObserver = new ManagedObjectObserver(function(oChange) {
			this.updateFormValueProperty();
		}.bind(this));

		this._oTokenizerObserver.observe(this, {
			aggregations: ["tokens"]
		});
	};

	/**
	 * Gets formatted form value.
	 *
	 * In the context of the MultiInput, this is the merged value of all the Tokens in the control.
	 * @returns {string} The semantic form value
	 * @since 1.100
	 * @experimental
	 */
	MultiInput.prototype.getFormFormattedValue = function() {
		return this.getTokens()
			.map(function(oToken) {
				return oToken.getText();
			})
			.join(", ");
	};

	/**
	 * The property which triggers form display invalidation when changed
	 *
	 * @returns {string} The property, containing the semantic form value
	 * @since 1.100
	 * @experimental
	 */
	MultiInput.prototype.getFormValueProperty = function() {
		return "_semanticFormValue";
	};

	/**
	 * ISemanticFormContent interface works only with properties. The state of MultiInput is kept as Tokens.
	 * Update _semanticFormValue property so it'd match MultiInput's state, but as a string which could be reused.
	 *
	 * @private
	 */
	MultiInput.prototype.updateFormValueProperty = function() {
		this.setProperty("_semanticFormValue", this.getFormFormattedValue(), true);
	};

	/* CUSTOM CODE END */

	return MultiInput;
});