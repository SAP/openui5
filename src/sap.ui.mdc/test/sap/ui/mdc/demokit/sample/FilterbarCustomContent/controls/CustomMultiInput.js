/*!
 * ${copyright}
 */
sap.ui.define([
	'sap/ui/core/Control',
	'sap/ui/core/library',
	'sap/ui/core/message/MessageMixin',
	'sap/ui/model/base/ManagedObjectModel',
	'sap/m/MultiInput',
	'sap/m/Token',
	'sap/m/Button'
], function(
	Control,
	coreLibrary,
	MessageMixin,
	ManagedObjectModel,
	MultiInput,
	Token,
	Button
) {
	"use strict";

	const ValueState = coreLibrary.ValueState;
	const TextDirection = coreLibrary.TextDirection;
	const TextAlign = coreLibrary.TextAlign;

	const CustomMultiInput = Control.extend("mdc.sample.controls.CustomMultiInput", {
		metadata: {
			interfaces: ["sap.ui.core.IFormContent"],
			library: "sap.ui.mdc",

			properties: {
				/**
				 * Defines the value of the control.
				 */
				value: { type: "string", group: "Data", defaultValue: null, bindable: "bindable" },

				/**
				 * Indicates whether the user can interact with the control or not.
				 * <b>Note:</b> Disabled controls cannot be focused and they are out of the tab-chain.
				 */
				enabled: { type: "boolean", group: "Behavior", defaultValue: true },

				/**
				 * Defines whether the control can be modified by the user or not.
				 * <b>Note:</b> A user can tab to non-editable control, highlight it, and copy the text from it.
				 */
				editable: { type: "boolean", group: "Behavior", defaultValue: true },

				 /**
				  * Visualizes the validation state of the control, e.g. <code>Error</code>, <code>Warning</code>, <code>Success</code>.
				  */
				valueState: { type: "sap.ui.core.ValueState", group: "Appearance", defaultValue: ValueState.None },
				/**
				 * Defines the text that appears in the value state message pop-up. If this is not specified, a default text is shown from the resource bundle.
				 */
				valueStateText: { type: "string", group: "Misc", defaultValue: null },

				/**
				 * Defines a short hint intended to aid the user with data entry when the control has no value.
				 */
				placeholder: { type: "string", group: "Misc", defaultValue: null },

				/**
				 * Defines the horizontal alignment of the text that is shown inside the input field.
				 */
				textAlign: { type: "sap.ui.core.TextAlign", group: "Appearance", defaultValue: TextAlign.Initial },

				/**
				  * Defines the text directionality of the input field, e.g. <code>RTL</code>, <code>LTR</code>
				  */
				textDirection: { type: "sap.ui.core.TextDirection", group: "Appearance", defaultValue: TextDirection.Inherit },

				/**
				 * Whether the field is required.
				 */
				required: { type: "boolean", group: "Data", defaultValue: false },

				/**
				 * If set to true, a value help indicator will be displayed inside the control. When clicked the event "valueHelpRequest" will be fired.
				 */
				showValueHelp : {type : "boolean", group : "Behavior", defaultValue : false},

				/**
				 * Set custom value help icon.
				 */
				valueHelpIconSrc : {type : "sap.ui.core.URI", group : "Behavior", defaultValue : "sap-icon://value-help"}
			 },

			aggregations: {
				/**
				 * The currently displayed tokens
				 */
				tokens: {type: "sap.m.Token", multiple: true, singularName: "token"},
				_multiInput: {
					type: "sap.m.MultiInput",
					multiple: false,
					visibility: "hidden"
				},
				_button: {
					type: "sap.m.Button",
					multiple: false,
					visibility: "hidden"
				}
			},

			events: {
				/**
				 * This event is fired when the value property of the field is changed
				 *
				 * <b>Note</b> This event is only triggered if the used content control has a change event
				 */
				change: {
					parameters: {
						/**
						 * The selected <code>value</code>.
						 */
						value: { type: "string" },

						/**
						 * Flag indecates if the entered <code>value</code> is valid.
						 */
						valid: { type: "boolean" }
					}
				},
				/**
				 * This event is fired when the value of the field is changed - e.g. at each keypress
				 *
				 * <b>Note</b> This event is only triggered if the used content control has a liveChange event
				 */
				liveChange : {
					parameters : {
						/**
						 * The new value of the input.
						 */
						value : {type : "string"},

						/**
						 * Indicate that ESC key triggered the event.
						 */
						escPressed : {type : "boolean"},

						/**
						 * The value of the input before pressing ESC key.
						 */
						previousValue : {type : "string"}
					}
				},
				/**
				 * Fired when the tokens aggregation changed due to a user interaction (add / remove token)
				 */
				tokenUpdate: {
					allowPreventDefault : true,
					parameters: {
						/**
						 * Type of tokenChange event.
						 * There are two TokenUpdate types: "added", "removed"
						 * Use sap.m.Tokenizer.TokenUpdateType.Added for "added" and sap.m.Tokenizer.TokenUpdateType.Removed for "removed".
						 */
						type: {type: "string"},

						/**
						 * The array of tokens that are added.
						 * This parameter is used when tokenUpdate type is "added".
						 */
						addedTokens: {type: "sap.m.Token[]"},

						/**
						 * The array of tokens that are removed.
						 * This parameter is used when tokenUpdate type is "removed".
						 */
						removedTokens: {type: "sap.m.Token[]"}
					}
				},
				/**
				 * When the value help indicator is clicked, this event will be fired.
				 */
				 valueHelpRequest : {
				}
			},

			defaultProperty: "value",
			defaultAggregation: "tokens"
		},
		renderer : {
			apiVersion: 2,
			render: function(oRm, oControl) {

				const oMultiInput = oControl.getAggregation("_multiInput");
				const oButton = oControl.getAggregation("_button");
				oRm.openStart("div", oControl);
				oRm.style("width", "100%");
				oRm.openEnd();

				oRm.renderControl(oMultiInput);
				if (oControl.getShowValueHelp()) {
					oRm.renderControl(oButton);
				}

				oRm.close("div");
			}
		}
	});

	// apply the message mixin so all message on the input will get the associated label-texts injected
	MessageMixin.call(CustomMultiInput.prototype);

	CustomMultiInput.prototype.init = function() {

		this._oManagedObjectModel = new ManagedObjectModel(this);

		const oToken = new Token(this.getId() + "-token", {
			text: {
				path: '$this>text'
			}
		});

		const oMultiInput = new MultiInput(this.getId() + "-MI", {
			value: {path: "$this>/value"},
			placeholder: {path: "$this>/placeholder"},
			textAlign: {path: "$this>/textAlign"},
			textDirection: {path: "$this>/textDirection"},
			required: {path: "$this>/required"},
			editable: {path: "$this>/editable"},
			enabled: {path: "$this>/enabled"},
			valueState: {path: "$this>/valueState"},
			valueStateText: {path: "$this>/valueStateText"},
			showValueHelp: false,
			width: "80%",
			tooltip: {path: "$this>/tooltip"},
			tokens: {path: "$this>/tokens", template: oToken},
			autocomplete: false,
			change: _handleChange.bind(this),
			liveChange: _handleLiveChange.bind(this),
			tokenUpdate: _handleTokenUpdate.bind(this)
		});

		oMultiInput.setPreferUserInteraction(true);
		oMultiInput.setModel(this._oManagedObjectModel, "$this");
		this.setAggregation("_multiInput", oMultiInput);

		const oButton = new Button(this.getId() + "-B", {
			icon: {path: "$this>/valueHelpIconSrc"},
			enabled: {parts: [{path: "$this>/enabled"}, {path: "$this>/editable"}], formatter: _determineButtonEnabled},
			width: "20%",
			press: _handlePress.bind(this)
		});

		oButton.setModel(this._oManagedObjectModel, "$this");
		this.setAggregation("_button", oButton);

	};

	CustomMultiInput.prototype.exit = function() {

		if (this._oManagedObjectModel) {
			this._oManagedObjectModel.destroy();
			delete this._oManagedObjectModel;
		}

	};

	CustomMultiInput.prototype.getDOMValue = function() {

		const oMultiInput = this.getAggregation("_multiInput");
		return oMultiInput.getDOMValue();

	};

	CustomMultiInput.prototype.setDOMValue = function(sValue) {

		const oMultiInput = this.getAggregation("_multiInput");
		return oMultiInput.setDOMValue(sValue);

	};

	CustomMultiInput.prototype.getFocusDomRef = function() {

		const oMultiInput = this.getAggregation("_multiInput");
		return oMultiInput.getFocusDomRef();

	};

	CustomMultiInput.prototype.getIdForLabel = function() {

		const oMultiInput = this.getAggregation("_multiInput");
		return oMultiInput.getIdForLabel();

	};

	CustomMultiInput.prototype.getAccessibilityInfo = function() {

		const oMultiInput = this.getAggregation("_multiInput");
		return oMultiInput.getAccessibilityInfo();

	};

	CustomMultiInput.prototype._doSelect = function(iStart, iEnd) {

		const oMultiInput = this.getAggregation("_multiInput");
		return oMultiInput._doSelect(iStart, iEnd);

	};

	function _handleChange(oEvent) {

		this.fireChange({value: oEvent.getParameter("value")});

	}

	function _handleLiveChange(oEvent) {

		this.fireLiveChange({value: oEvent.getParameter("value"), escPressed: oEvent.getParameter("escPressed"), previousValue: oEvent.getParameter("previousValue")});

	}

	function _handleTokenUpdate(oEvent) {

		if (oEvent.getParameter("type") === "removed") {
			const aRemovedTokens = oEvent.getParameter("removedTokens");
			const aTokens = this.getTokens();
			const aNewRemovedTokens = [];
			let i;

			for (i = 0; i < aRemovedTokens.length; i++) {
				const oRemovedToken = aRemovedTokens[i];
				const sPath = oRemovedToken.getBindingContext("$this").sPath;
				const iIndex = parseInt(sPath.slice(sPath.lastIndexOf("/") + 1));
				aNewRemovedTokens.push(aTokens[iIndex]);
			}

			oEvent.preventDefault(true);
			this.fireTokenUpdate({type: oEvent.getParameter("type"), addedTokens: [], removedTokens: aNewRemovedTokens});
		}

	}

	function _handlePress(oEvent) {

		this.fireValueHelpRequest();

	}

	function _determineButtonEnabled(bEnabled, bEditable) {

		if (bEnabled && bEditable) {
			return true;
		} else {
			return false;
		}

	}

	return CustomMultiInput;

});
