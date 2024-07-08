/*!
 * ${copyright}
 */

// Provides control sap.m.CheckBox.
sap.ui.define([
	'./Label',
	'./library',
	'sap/ui/core/Control',
	'sap/ui/core/Element',
	'sap/ui/core/EnabledPropagator',
	'sap/ui/core/AccessKeysEnablement',
	'sap/ui/core/library',
	'sap/ui/core/Lib',
	'./CheckBoxRenderer',
	'sap/ui/events/KeyCodes',
	'sap/ui/core/LabelEnablement',
	'sap/ui/core/message/MessageMixin'
],
	function(
		Label,
		library,
		Control,
		Element,
		EnabledPropagator,
		AccessKeysEnablement,
		coreLibrary,
		Library,
		CheckBoxRenderer,
		KeyCodes,
		LabelEnablement,
		MessageMixin
	) {
	"use strict";

	// shortcut for sap.ui.core.ValueState
	var ValueState = coreLibrary.ValueState;

	// shortcut for sap.ui.core.TextAlign
	var TextAlign = coreLibrary.TextAlign;

	// shortcut for sap.ui.core.TextDirection
	var TextDirection = coreLibrary.TextDirection;

	/**
	 * Constructor for a new <code>CheckBox</code>.
	 *
	 * @param {string} [sId] The ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] The Initial settings for the new control
	 *
	 * @class
	 * Allows the user to set a binary value, such as true/false or yes/no for an item.
	 *
	 * <h3>Overview</h3>
	 *
	 * The <code>CheckBox</code> control consists of a box and a label that describes its purpose.
	 * If it's checked, an indicator is displayed inside the box.
	 *
	 * To select/deselect the <code>CheckBox</code>, the user has to click or tap the square box or its label.
	 * Clicking or tapping toggles the <code>CheckBox</code> between checked and unchecked state.
	 * The <code>CheckBox</code> control only has 3 states - checked, unchecked and partially selected.
	 *
	 * <h3>Usage</h3>
	 *
	 * You can set the width of the element containing the box and the label manually with the use
	 * of the <code>width</code> property. If the text exceeds the available width, it is truncated.
	 *
	 * <b>Note:</b> When <code>useEntireWidth</code> property is set to <code>true</code>, the value of the
	 * <code>width</code> property is applied to the control as a whole (box and label). If
	 * <code>useEntireWidth</code> is set to <code>false</code>, the <code>width</code> is applied to the label only.
	 *
	 * The touchable area for toggling the <code>CheckBox</code> ends where the text ends.
	 *
	 * If the width allows more space than the text requires, white space is added.
	 * The text can be positioned manually in this space using the <code>textAlign</code> property.
	 *
	 * <b>Note:</b> Keep in mind that setting the <code>textAlign</code> property to <code>Right</code>
	 * can result in a large amount of white space between the box and the text.
	 *
	 * You can disable the <code>CheckBox</code> by setting the <code>enabled</code> property to <code>false</code>,
	 * or use the <code>CheckBox</code> in read-only mode by setting the <code>editable</code> property to false.
	 *
	 * <b>Note:</b> Disabled and read-only states shouldn't be used together.
	 *
	 * @see {@link fiori:https://experience.sap.com/fiori-design-web/checkbox/ Check Box}
	 *
	 * @extends sap.ui.core.Control
	 * @implements sap.ui.core.IFormContent, sap.ui.core.ISemanticFormContent, sap.ui.core.IAccessKeySupport
	 *
	 * @borrows sap.ui.core.ISemanticFormContent.getFormFormattedValue as #getFormFormattedValue
	 * @borrows sap.ui.core.ISemanticFormContent.getFormValueProperty as #getFormValueProperty
	 * @borrows sap.ui.core.ISemanticFormContent.getFormObservingProperties as #getFormObservingProperties
	 * @borrows sap.ui.core.ISemanticFormContent.getFormRenderAsControl as #getFormRenderAsControl
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @alias sap.m.CheckBox
	 */
	var CheckBox = Control.extend("sap.m.CheckBox", /** @lends sap.m.CheckBox.prototype */ {
		metadata : {

			interfaces : [
				"sap.m.IToolbarInteractiveControl",
				"sap.ui.core.IFormContent",
				"sap.ui.core.ISemanticFormContent",
				"sap.ui.core.IAccessKeySupport"
			],
			library : "sap.m",
			properties : {

				/**
				 * Determines whether the <code>CheckBox</code> is selected (checked).
				 *
				 * When this property is set to <code>true</code>, the control is displayed as selected,
				 * unless the value of the <code>partiallySelected</code> property is also set to <code>true</code>.
				 * In this case, the control is displayed as partially selected.
				 */
				selected : {type : "boolean", group : "Data", defaultValue : false},

				/**
				 * Determines whether the <code>CheckBox</code> is displayed as partially selected.
				 *
				 * <b>Note:</b> This property leads only to visual change of the checkbox and the
				 * state cannot be achieved by user interaction. The visual state depends on
				 * the value of the <code>selected</code> property:
				 * <ul>
				 * <li>If <code>selected</code> = <code>true</code> and <code>partiallySelected</code>
				 * = <code>true</code>, the control is displayed as partially selected</li>
				 * <li>If <code>selected</code> = <code>true</code> and <code>partiallySelected</code>
				 * = <code>false</code>, the control is displayed as selected</li>
				 * <li>If <code>selected</code> = <code>false</code>, the control is displayed as not
				 * selected regardless of what is set for <code>partiallySelected</code></li>
				 * </ul>
				 *
				 * @since 1.58
				 */
				partiallySelected : {type : "boolean", group : "Data", defaultValue : false},

				/**
				 * Whether the <code>CheckBox</code> is enabled.
				 *
				 * <b>Note:</b> Disabled <code>CheckBox</code> is not interactive and is rendered differently according to the theme.
				 */
				enabled : {type : "boolean", group : "Behavior", defaultValue : true},

				/**
				 * Sets the <code>required</code> state of the <code>CheckBox</code>.
				 *
				 * <b>Note:</b> Use this property only when a single relationship between this field and a Label cannot be established.
				 * For example, with the assistance of the <code>labelFor</code> property of <code>sap.m.Label</code>.
				 *
				 * <b>Note:</b> This property won't work as expected without setting a value to the <code>text</code> property of the <code>CheckBox</code>.
 				 * The <code>text</code> property acts as a label for the <code>CheckBox</code> and is crucial for assistive technologies,
 				 * like screen readers, to provide a meaningful context.
				 *
				 * @since 1.121
				 */
				required: {type: "boolean", group: "Misc", defaultValue: false},

				/**
				 * The 'name' property to be used in the HTML code, for example for HTML forms that send data to the server via submit.
				 */
				name : {type : "string", group : "Misc", defaultValue : null},

				/**
				 * Defines the text displayed next to the checkbox
				 */
				text : {type : "string", group : "Data", defaultValue : null},

				/**
				 * Options for the text direction are RTL and LTR. Alternatively, the control can inherit the text direction from its parent container.
				 */
				textDirection : {type : "sap.ui.core.TextDirection", group : "Appearance", defaultValue : TextDirection.Inherit},

				/**
				 * Aligns the text of the checkbox. Available alignment settings are "Begin", "Center", "End", "Left", and "Right".
				 */
				textAlign : {type : "sap.ui.core.TextAlign", group : "Appearance", defaultValue : TextAlign.Begin},

				/**
				 * Determines the total width of the control or the width of its label only, depending on the value of <code>useEntireWidth</code>.
				 *
				 * <b>Note:</b> When <code>useEntireWidth</code> is set to <code>true</code>, <code>width</code> is applied to the control as a whole (checkbox and label). Otherwise, <code>width</code> is applied to the label only.
				 */
				width : {type : "sap.ui.core.CSSSize", group : "Dimension", defaultValue : ''},

				/**
				 * Indicates if the given width will be applied to the control as a whole or to its label only.
				 *
				 * <b>Note:</b> by default the width is set to the label
				 * @since 1.52
				 */
				useEntireWidth : {type : "boolean", group: "Appearance", defaultValue : false },

				/**
				 * Flag to switch on activeHandling, when it is switched off, there will be no visual changes on active state. Default value is 'true'
				 */
				activeHandling : {type : "boolean", group : "Misc", defaultValue : true},

				/**
				 * Specifies whether the user shall be allowed to edit the state of the checkbox
				 * @since 1.25
				 */
				editable : {type : "boolean", group : "Behavior", defaultValue : true},

				/**
				 * Accepts the core enumeration ValueState.type that supports 'None', 'Error', 'Warning', 'Success' and 'Information'.
				 * @since 1.38
				 */
				valueState : {type : "sap.ui.core.ValueState", group : "Data", defaultValue : ValueState.None},

				/**
				 * Defines the text that appears in the tooltip of the <code>CheckBox</code>. If this is not specified, a default text is shown from the resource bundle.
				 * @since 1.74
				 * @private
				 */
				valueStateText: { type: "string", group: "Misc", defaultValue: null, visibility: "hidden" },

				/**
				 * Determines whether the <code>CheckBox</code> is in display only state.
				 *
				 * When set to <code>true</code>, the <code>CheckBox</code> is not interactive, not editable, not focusable
				 * and not in the tab chain. This setting is used for forms in review mode.
				 *
				 * <Note:> When the property <code>enabled</code> is set to <code>false</code> this property has no effect.
				 * @since 1.54
				 */
				displayOnly : {type : "boolean", group : "Behavior", defaultValue : false},

				/**
				 * Determines whether the label's text is wrapped.
				 *
				 * When set to <code>false</code> (default), the label's text
				 * is truncated with ellipsis at the end.
				 *
				 * @since 1.54
				 */
				wrapping: {type : "boolean", group : "Appearance", defaultValue : false},

				/**
				 * Indicates whether the access keys ref of the control should be highlighted.
				 * NOTE: this property is used only when access keys feature is turned on.
				 *
				 * @private
				 */
				highlightAccKeysRef: { type: "boolean", defaultValue: false, visibility: "hidden" },

				/**
				 * Indicates which keyboard key should be pressed to focus the access key ref
				 * NOTE: this property is used only when access keys feature is turned on.
				 *
				 * @private
				 */
				accesskey: { type: "string", defaultValue: "", visibility: "hidden" }
			},
			aggregations: {
				/**
				 * The label that represents the text of the checkbox control
				 */
				_label: {type: "sap.m.Label", group: "Behavior", multiple: false, visibility: "hidden"}
			},
			associations : {

				/**
				 * Association to controls / IDs which describe this control (see WAI-ARIA attribute aria-describedby).
				 */
				ariaDescribedBy: {type: "sap.ui.core.Control", multiple: true, singularName: "ariaDescribedBy"},

				/**
				 * Association to controls / IDs which label this control (see WAI-ARIA attribute aria-labelledby).
				 */
				ariaLabelledBy: {type: "sap.ui.core.Control", multiple: true, singularName: "ariaLabelledBy"}
			},
			events : {

				/**
				 * Event is triggered when the control status is changed by the user by selecting or deselecting the checkbox.
				 */
				select : {
					parameters : {

						/**
						 * Checks whether the CheckBox is marked or not .
						 */
						selected : {type : "boolean"}
					}
				}
			},
			dnd: { draggable: true, droppable: false },
			designtime: "sap/m/designtime/CheckBox.designtime"
		},

		renderer: CheckBoxRenderer
	});

	EnabledPropagator.call(CheckBox.prototype);

	// Apply the message mixin so all Messages on the CheckBox will have additionalText property set to ariaLabelledBy's text of the CheckBox
	// and have valueState property of the CheckBox set to the message type.
	MessageMixin.call(CheckBox.prototype);

	/**
	 * Lifecycle Methods
	 */
	CheckBox.prototype.init = function() {
		this._handleReferencingLabels();

		AccessKeysEnablement.registerControl(this);
	};

	CheckBox.prototype.onAccKeysHighlightStart = function () {
		this._getLabel().setProperty("highlightAccKeysRef", true);
	};

	CheckBox.prototype.onAccKeysHighlightEnd = function () {
		this._getLabel().setProperty("highlightAccKeysRef", false);
	};

	CheckBox.prototype.onBeforeRendering = function () {
		if (this.getText()) {
			this.setProperty("accesskey", this.getText()[0].toLowerCase());
		}
	};

	CheckBox.prototype.exit = function() {
		this._oLabel = null;
		delete this._iTabIndex;
	};

	// Public Methods

	CheckBox.prototype.setText = function(sText) {
		var oLabel = this._getLabel();

		this.setProperty("text", sText);
		oLabel.setText(sText);

		return this;
	};

	CheckBox.prototype.setWidth = function (sWidth) {
		this.setProperty("width", sWidth, true);
		this._setWidth();

		return this;
	};

	CheckBox.prototype.setUseEntireWidth = function (bUseEntireWidth) {
		this.setProperty("useEntireWidth", bUseEntireWidth, true);
		this._setWidth();

		return this;
	};

	CheckBox.prototype.setTextDirection = function(sDirection) {
		var oLabel = this._getLabel();

		this.setProperty("textDirection", sDirection);
		oLabel.setTextDirection(sDirection);

		return this;
	};

	CheckBox.prototype.setTextAlign = function(sAlign) {
		var oLabel = this._getLabel();

		this.setProperty("textAlign", sAlign);
		oLabel.setTextAlign(sAlign);

		return this;
	};

	CheckBox.prototype.setValueStateText = function(sText) {
		return this.setProperty("valueStateText", sText);
	};

	CheckBox.prototype.setWrapping = function(bWrap) {
		var oLabel = this._getLabel();

		this.setProperty("wrapping", bWrap);
		oLabel.setWrapping(bWrap);

		return this;
	};

	CheckBox.prototype.getFormattedState = function() {
		var oBundle = Library.getResourceBundleFor("sap.m");

		return this.getSelected() ? oBundle.getText("ACC_CTR_STATE_CHECKED") : oBundle.getText("ACC_CTR_STATE_NOT_CHECKED");
	};

	CheckBox.prototype.getFormFormattedValue = function() {
		return this.getFormattedState();
	};

	CheckBox.prototype.getFormValueProperty = function () {
		return "selected";
	};

	CheckBox.prototype.getFormObservingProperties = function() {
		return ["selected", "displayOnly"]; // as displayOnly changes the rendering mode
	};

	CheckBox.prototype.getFormRenderAsControl = function () {
		return this.getDisplayOnly(); // for displayOnly CheckBox, show the control
	};

	/**
	 * Event handler called when the CheckBox is touched.
	 *
	 * @param {jQuery.Event} oEvent The <code>touchstart</code> event object
	 */
	CheckBox.prototype.ontouchstart = function(oEvent) {
		//for control who need to know if they should handle events from the CheckBox control
		oEvent.originalEvent._sapui_handledByControl = true;
	};

	/**
	 * Event handler called when the CheckBox is tapped.
	 *
	 * @param {jQuery.Event} oEvent The <code>tap</code> event object
	 */
	CheckBox.prototype.ontap = function(oEvent) {
		var bSelected;

		if (this.getEnabled() && this.getEditable() && !this.getDisplayOnly()) {
			this.$().trigger("focus"); // In IE taping on the input doesn`t focus the wrapper div.

			bSelected = this._getSelectedState();
			this.setSelected(bSelected);
			this.setPartiallySelected(false);

			this.fireSelect({selected:bSelected});

			// mark the event that it is handled by the control
			oEvent && oEvent.setMarked();
		}
	};

	/**
	 * Handles the keyup event for SPACE.
	 *
	 * @param {jQuery.Event} oEvent The event object
	 */
	CheckBox.prototype.onkeyup = function(oEvent) {
		if (oEvent && oEvent.which === KeyCodes.SPACE && !oEvent.shiftKey) {
			this.ontap(oEvent);
			// stop browsers default behavior
			oEvent.preventDefault();
		}
	};

	/**
	 * Handles the keydown event for SPACE on which we have to prevent the browser scrolling.
	 *
	 * @param {jQuery.Event} oEvent The event object.
	 * @private
	 */
	CheckBox.prototype.onsapspace = function(oEvent) {
		oEvent.preventDefault();
	};

	/**
	 * Event handler called when the enter key is pressed onto the Checkbox.
	 *
	 * @param {jQuery.Event} oEvent The ENTER keyboard key event object
	 */
	CheckBox.prototype.onsapenter = function(oEvent) {
		this.ontap(oEvent);
	};

	/**
	 * Sets the tab index of the control
	 *
	 * @param {int} iTabIndex The tab index should be greater than or equal -1
	 * @returns {this} The <code>sap.m.CheckBox</code> instance
	 * @since 1.16
	 * @protected
	 */
	CheckBox.prototype.setTabIndex = function(iTabIndex) {
		this._iTabIndex = iTabIndex;
		this.$("CbBg").attr("tabindex", iTabIndex);
		return this;
	};

	/**
	 * Returns the CheckBox`s tab index.
	 *
	 * @return {int} iTabIndex for Checkbox
	 * @since 1.22
	 * @protected
	 */
	CheckBox.prototype.getTabIndex = function() {
		if ( this.hasOwnProperty("_iTabIndex") ) {
			return this._iTabIndex;
		}
		return (this.getEnabled() && !this.getDisplayOnly()) ? 0 : -1;
	};

	/**
	 * Lazy loads the CheckBox`s label
	 *
	 * @return {sap.m.Label} The label control
	 * @private
	 */
	CheckBox.prototype._getLabel = function() {
		if (!this._oLabel) {
			this._oLabel = new Label(this.getId() + "-label").addStyleClass("sapMCbLabel");

			this._oLabel.getAccessKeysFocusTarget = function () {
				return this.getFocusDomRef();
			}.bind(this);

			this.setAggregation("_label", this._oLabel, true);
		}

		return this.getAggregation("_label");
	};

	/**
	 * Sets the width of the CheckBox control or its label, based on the <code>useEntireWidth</code> property.
	 * @param {string} sWidth - CSS size to be set as width
	 * @private
	 */
	CheckBox.prototype._setWidth = function() {
		var oLabel = this._getLabel(),
			$oCheckBox = this.$(),
			sWidth = this.getWidth();

		if (this.getUseEntireWidth()) {
			oLabel.setWidth("");
			$oCheckBox.outerWidth(sWidth);
		} else {
			$oCheckBox.outerWidth("");
			oLabel.setWidth(sWidth);
		}
	};

	/**
	 * Determines whether the <code>selected</code> property should be set to true or false,
	 * according the current state of the <code>selected</code> and <code>partiallySelected</code> properties.
	 * @private
	 */
	CheckBox.prototype._getSelectedState =  function() {
		var bSelected = this.getSelected(),
			bPartiallySelected = this.getPartiallySelected();

		return (bSelected === bPartiallySelected) || (!bSelected && bPartiallySelected);
	};

	/**
	 * Returns <code>aria-checked</code> attribute value, according values of <code>selected</code> and <code>partiallySelected</code> properties.
	 * @private
	 */
	CheckBox.prototype._getAriaChecked =  function() {
		var bSelected = this.getSelected();

		if (this.getPartiallySelected() && bSelected) {
			return "mixed";
		}

		return bSelected;
	};

	/**
	 * Called when a referencing label is tapped.
	 * @private
	 */
	CheckBox.prototype._fnLabelTapHandler = function () {
		this.$().trigger("focus");
	};

	/**
	 * Ensures clicking on external referencing labels will put the focus on the CheckBox container.
	 * @private
	 */
	CheckBox.prototype._handleReferencingLabels = function () {
		var aLabelIds = LabelEnablement.getReferencingLabels(this),
			that = this;

		if (aLabelIds.length > 0) {
			aLabelIds.forEach(function (sLabelId) {
				Element.getElementById(sLabelId).addEventDelegate({
					ontap: function () {
						that._fnLabelTapHandler();
					}
				});
			});
		}
	};

	/**
	 * @see sap.ui.core.Control#getAccessibilityInfo
	 * @protected
	 * @returns {sap.ui.core.AccessibilityInfo}
	 * The object contains the accessibility information of <code>sap.m.CheckBox</code>
	 */
	CheckBox.prototype.getAccessibilityInfo = function() {
		var oBundle = Library.getResourceBundleFor("sap.m"),
			sText = this.getText();
		return {
			role: "checkbox",
			type: oBundle.getText("ACC_CTR_TYPE_CHECKBOX"),
			description: (sText ? sText + " " : "") + this.getFormattedState(),
			focusable: this.getEnabled() && !this.getDisplayOnly(),
			enabled: this.getEnabled(),
			editable: this.getEditable(),
			required: this._isRequired()
		};
	};

	/**
	 * Required by the {@link sap.m.IToolbarInteractiveControl} interface.
	 * Determines if the Control is interactive.
	 *
	 * @returns {boolean} If it is an interactive Control
	 *
	 * @private
	 * @ui5-restricted sap.m.OverflowToolBar, sap.m.Toolbar
	 */
	CheckBox.prototype._getToolbarInteractive = function () {
		return true;
	};

	/**
	 * Checkbox without label must not be stretched in Form.
	 * @returns {boolean} If the width of the control should not be adjusted
	 */
	CheckBox.prototype.getFormDoNotAdjustWidth = function() {
		return this.getText() ? false : true;
	};

	/**
	 * Determines if the CheckBox is required.
	 * A CheckBox is considered required if it has been explicitly set as required,
	 * or if it is required by LabelEnablement.
	 *
	 * @returns {boolean} True if the CheckBox is required, false otherwise.
	 * @private
	 */
	CheckBox.prototype._isRequired = function () {
		return this.getRequired() || LabelEnablement.isRequired(this);
	};

	return CheckBox;

});
