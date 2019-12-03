/*!
 * ${copyright}
 */

// Provides control sap.m.CheckBox.
sap.ui.define([
	'./Label',
	'./library',
	'sap/ui/Device',
	'sap/ui/core/Control',
	'sap/ui/core/IconPool',
	'sap/ui/core/EnabledPropagator',
	'sap/ui/core/library',
	'./CheckBoxRenderer',
	"sap/ui/thirdparty/jquery",
	"sap/ui/events/KeyCodes",
	'sap/ui/core/LabelEnablement',
	'sap/ui/core/message/MessageMixin'
],
	function(
		Label,
		library,
		Device,
		Control,
		IconPool,
		EnabledPropagator,
		coreLibrary,
		CheckBoxRenderer,
		jQuery,
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
	 * @implements sap.ui.core.IFormContent
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @alias sap.m.CheckBox
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var CheckBox = Control.extend("sap.m.CheckBox", /** @lends sap.m.CheckBox.prototype */ { metadata : {

		interfaces : ["sap.ui.core.IFormContent"],
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
			 * Disables the Checkbox. Disabled controls are not interactive and are rendered differently according to the theme.
			 */
			enabled : {type : "boolean", group : "Behavior", defaultValue : true},

			/**
			 * The 'name' property to be used in the HTML code, for example for HTML forms that send data to the server via submit.
			 */
			name : {type : "string", group : "Misc", defaultValue : null},

			/**
			 * Defines the text displayed next to the checkbox
			 */
			text : {type : "string", group : "Appearance", defaultValue : null},

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
			wrapping: {type : "boolean", group : "Appearance", defaultValue : false}
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
	}});

	EnabledPropagator.call(CheckBox.prototype);

	// Apply the message mixin so all Messages on the CheckBox will have additionalText property set to ariaLabelledBy's text of the CheckBox
	// and have valueState property of the CheckBox set to the message type.
	MessageMixin.call(CheckBox.prototype);

	/**
	 * Lifecycle Methods
	 */
	CheckBox.prototype.init = function() {
		this.addActiveState(this);
		IconPool.insertFontFaceStyle();
		this._handleReferencingLabels();
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

	/**
	 * Add ActiveState to non-supported mobile platform
	 * @private
	 */
	CheckBox.prototype.addActiveState = function(oControl) {
		if (Device.os.blackberry) {
			oControl.addDelegate({
				ontouchstart: function(oEvent){
					jQuery(oControl.getDomRef()).addClass("sapMActive");
				},
				ontouchend: function(oEvent){
					jQuery(oControl.getDomRef()).removeClass("sapMActive");
				}
			});
		}
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
			this.$().focus(); // In IE taping on the input doesn`t focus the wrapper div.

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
			oEvent.stopPropagation();
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
	 * @returns {sap.m.CheckBox} The <code>sap.m.CheckBox</code> instance
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
	 * @return {sap.m.Label}
	 * @private
	 */
	CheckBox.prototype._getLabel = function() {
		if (!this._oLabel) {
			this._oLabel = new Label(this.getId() + "-label", {
				labelFor: this.getId()
			}).addStyleClass("sapMCbLabel");

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
		this.$().focus();
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
				sap.ui.getCore().byId(sLabelId).addEventDelegate({
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
	 * @returns {Object} The <code>sap.m.CheckBox</code> accessibility information
	 */
	CheckBox.prototype.getAccessibilityInfo = function() {
		var oBundle = sap.ui.getCore().getLibraryResourceBundle("sap.m");
		return {
			role: "checkbox",
			type: oBundle.getText("ACC_CTR_TYPE_CHECKBOX"),
			description: (this.getText() || "") + (this.getSelected() ? (" " + oBundle.getText("ACC_CTR_STATE_CHECKED")) : ""),
			focusable: this.getEnabled() && !this.getDisplayOnly(),
			enabled: this.getEnabled(),
			editable: this.getEditable()
		};
	};

	/*
	 * Checkbox without label must not be stretched in Form.
	 */
	CheckBox.prototype.getFormDoNotAdjustWidth = function() {
		return this.getText() ? false : true;
	};

	return CheckBox;

});
