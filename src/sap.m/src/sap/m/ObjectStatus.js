/*!
 * ${copyright}
 */

// Provides control sap.m.ObjectStatus.
sap.ui.define([
	'./library',
	'sap/ui/core/Control',
	"sap/ui/core/Lib",
	'sap/ui/core/ValueStateSupport',
	'sap/ui/core/IndicationColorSupport',
	'sap/ui/core/library',
	'sap/ui/core/_IconRegistry',
	'sap/ui/base/DataType',
	'./ObjectStatusRenderer',
	'sap/m/ImageHelper',
	'sap/ui/core/LabelEnablement',
	"sap/ui/events/KeyCodes"
],
	function(library, Control, Library, ValueStateSupport, IndicationColorSupport, coreLibrary, _IconRegistry, DataType, ObjectStatusRenderer, ImageHelper, LabelEnablement, KeyCodes) {
	"use strict";


	// shortcut for sap.ui.core.TextDirection
	var TextDirection = coreLibrary.TextDirection;

	// shortcuts for sap.ui.core.ValueState
	var ValueState = coreLibrary.ValueState;

	// shortcut for sap.m.EmptyIndicator
	var EmptyIndicatorMode = library.EmptyIndicatorMode;

	// shortcut for sap.m.ReactiveAreaMode
	var ReactiveAreaMode = library.ReactiveAreaMode;

	/**
	 * Constructor for a new ObjectStatus.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * Status information that can be either text with a value state, or an icon.
	 *
	 *
	 * <h3>Wrapping and Truncation Behavior</h3>
	 *
	 * The <code>ObjectStatus</code> usually is a short text. However, if the text is longer it wraps (word by word). Icon and text can be separated.
	 * <b>Note:</b> It maybe handled differently depending on the individual control use case. For example in <code>sap.ui.table.Table</code> the text of the control is truncated.
	 *
	 *
	 * With 1.63, large design of the control is supported by setting <code>sapMObjectStatusLarge</code> CSS class to the <code>ObjectStatus</code>.
	 *
	 *
	 * With 1.110, Inner text wrapping could be enabled for longer texts without spaces (such as a serial number that doesn't fit on one line) by adding <code>sapMObjectStatusLongText</code> CSS class to the <code>ObjectStatus</code>. This class can be added by using оObjectStatus.addStyleClass("sapMObjectStatusLongText");
	 *
	 *
	 * With 1.130, bigger line height for texts that require it (like Thai) can be enabled by adding <code>sapUiHigherText</code> CSS class to the <code>ObjectStatus</code>. This class can be added by using оObjectStatus.addStyleClass("sapUiHigherText");
	 *
	 *
	 * @extends sap.ui.core.Control
	 * @implements sap.ui.core.IFormContent, sap.ui.core.ISemanticFormContent
	 * @version ${version}
	 *
	 * @borrows sap.ui.core.ISemanticFormContent.getFormFormattedValue as #getFormFormattedValue
	 * @borrows sap.ui.core.ISemanticFormContent.getFormValueProperty as #getFormValueProperty
	 * @borrows sap.ui.core.ISemanticFormContent.getFormObservingProperties as #getFormObservingProperties
	 * @borrows sap.ui.core.ISemanticFormContent.getFormRenderAsControl as #getFormRenderAsControl
	 *
	 * @constructor
	 * @public
	 * @alias sap.m.ObjectStatus
	 * @see {@link fiori:https://experience.sap.com/fiori-design-web/object-display-elements/#-object-status Object Status}
	 */
	var ObjectStatus = Control.extend("sap.m.ObjectStatus", /** @lends sap.m.ObjectStatus.prototype */ {
		metadata : {

			interfaces : ["sap.ui.core.IFormContent", "sap.ui.core.ISemanticFormContent"],
			library : "sap.m",
			designtime: "sap/m/designtime/ObjectStatus.designtime",
			properties : {

				/**
				 * Defines the ObjectStatus title.
				 */
				title : {type : "string", group : "Data", defaultValue : null},

				/**
				 * Defines the ObjectStatus text.
				 */
				text : {type : "string", group : "Data", defaultValue : null},

				/**
				 * Indicates if the <code>ObjectStatus</code> text and icon can be clicked/tapped by the user.
				 *
				 * <b>Note:</b> If you set this property to <code>true</code>, you have to also set the <code>text</code> or <code>icon</code> property.
				 *
				 * @since 1.54
				 */
				active : {type : "boolean", group : "Misc", defaultValue : false},

				/**
				 * Defines the size of the reactive area of the link:<ul>
				 * <li><code>ReactiveAreaMode.Inline</code> - The link is displayed as part of a sentence.</li>
				 * <li><code>ReactiveAreaMode.Overlay</code> - The link is displayed as an overlay on top of other interactive parts of the page.</li></ul>
				 *
				 * <b>Note:</b>It is designed to make links easier to activate and helps meet the WCAG 2.2 Target Size requirement. It is applicable only for the SAP Horizon themes.
				 * <b>Note:</b>The Reactive area size is sufficiently large to help users avoid accidentally selecting (clicking or tapping) on unintented UI elements.
				 * UI elements positioned over other parts of the page may need an invisible active touch area.
				 * This will ensure that no elements beneath are activated accidentally when the user tries to interact with the overlay element.
				 *
				 * @since 1.133.0
				 */
				reactiveAreaMode : {type : "sap.m.ReactiveAreaMode", group : "Appearance", defaultValue : ReactiveAreaMode.Inline},

				/**
				 * Defines the text value state. The allowed values are from the enum type
				 * <code>sap.ui.core.ValueState</code>. Since version 1.66 the <code>state</code> property also accepts
				 * values from enum type <code>sap.ui.core.IndicationColor</code>.
				 */
				state : {type : "string", group : "Misc", defaultValue : ValueState.None},

				/**
				 * Determines whether the background color reflects the set <code>state</code> instead of the control's text.
				 * @since 1.66
				 */
				inverted : {type : "boolean", group : "Misc", defaultValue : false},

				/**
				 * Icon URI. This may be either an icon font or image path.
				 */
				icon : {type : "sap.ui.core.URI", group : "Misc", defaultValue : null},

				/**
				 * By default, this is set to true but then one or more requests are sent trying to get the density perfect version of image if this version of image doesn't exist on the server.
				 *
				 * If bandwidth is key for the application, set this value to false.
				 */
				iconDensityAware : {type : "boolean", group : "Appearance", defaultValue : true},

				/**
				 * Determines the direction of the text, not including the title.
				 * Available options for the text direction are LTR (left-to-right) and RTL (right-to-left). By default the control inherits the text direction from its parent control.
				 */
				textDirection : {type : "sap.ui.core.TextDirection", group : "Appearance", defaultValue : TextDirection.Inherit},

				/**
				 * Specifies if an empty indicator should be displayed when there is no text.
				 *
				 * @since 1.89
				 */
				emptyIndicatorMode: { type: "sap.m.EmptyIndicatorMode", group: "Appearance", defaultValue: EmptyIndicatorMode.Off },

				/**
				 * Еnables overriding of the default state announcement.
				 *
				 * @since 1.110
				 */
				stateAnnouncementText : {type : "string", group : "Misc"}
			},
			associations : {

				/**
				 * Association to controls / IDs, which describe this control (see WAI-ARIA attribute aria-describedby).
				 *
				 * <b>Note:</b> The additional description will take effect only if <code>active</code> property is set to <code>true</code>.
				 */
				ariaDescribedBy : {type : "sap.ui.core.Control", multiple : true, singularName : "ariaDescribedBy"},

				/**
				 * Association to controls / ids which label this control (see WAI-ARIA attribute aria-labelledby).
				 *
				 * <b>Note:</b> The additional labelling text will take effect only if <code>active</code> property is set to <code>true</code>.
				 */
				ariaLabelledBy: {type: "sap.ui.core.Control", multiple: true, singularName: "ariaLabelledBy"}
			},
			events : {

				/**
				 * Fires when the user clicks/taps on active text.
				 * @since 1.54
				 */
				press : {}
			},
			dnd: { draggable: true, droppable: false }
		},

		renderer: ObjectStatusRenderer
	});

	/**
	 * Returns a text compliant to the sap.m.ObjectStatus control instance state
	 *
	 * @private
	 * @param {string} sState the propety state value.
	 * @returns {string} The text compliant to the control state
	 */
	ObjectStatus.prototype._getStateText = function(sState) {
		if (sState !== ValueState.None && this.isPropertyInitial("stateAnnouncementText")) {
			return ValueStateSupport.getAdditionalText(sState)
					? ValueStateSupport.getAdditionalText(sState)
					: IndicationColorSupport.getAdditionalText(sState);
		}

		return !this.isPropertyInitial("stateAnnouncementText") ? this.getStateAnnouncementText() : "";
	};

	/**
	 * Called when the control is destroyed.
	 *
	 * @private
	 */
	ObjectStatus.prototype.exit = function() {
		if (this._oImageControl) {
			this._oImageControl.destroy();
			this._oImageControl = null;
		}
	};

	/**
	 * Lazy loads feed icon image.
	 *
	 * @returns {object} The feed icon image
	 * @private
	 */
	ObjectStatus.prototype._getImageControl = function() {
		var sImgId = this.getId() + '-icon',
			bUseIconTooltip = !this.getText() && !this.getTitle() && !this.getTooltip(),
			mProperties = {
				src : this.getIcon(),
				densityAware : this.getIconDensityAware(),
				useIconTooltip : bUseIconTooltip,
				decorative: !this.getActive()
			};

		this._oImageControl = ImageHelper.getImageControl(sImgId, this._oImageControl, this, mProperties);

		return this._oImageControl;
	};

	ObjectStatus.prototype._getAriaIconTitle = function() {
		var vIconInfo;
		if (this._oImageControl.isA("sap.ui.core.Icon")) {
			vIconInfo = _IconRegistry.getIconInfo(this._oImageControl.getSrc(), undefined, "mixed");
		}

		return vIconInfo ? vIconInfo.text : Library.getResourceBundleFor("sap.m").getText("OBJECT_STATUS_ICON");
	};

	/**
	 * Sets value for the <code>state</code> property. The default value is <code>ValueState.None</code>.
	 * @public
	 * @param {string} sValue New value for property state.
	 * It should be valid value of enumeration <code>sap.ui.core.ValueState</code> or <code>sap.ui.core.IndicationColor</code>
	 * @returns {this} this to allow method chaining
	 */
	ObjectStatus.prototype.setState = function(sValue) {
		if (sValue == null) {
			sValue = ValueState.None;
		} else if (!DataType.getType("sap.ui.core.ValueState").isValid(sValue) && !DataType.getType("sap.ui.core.IndicationColor").isValid(sValue)) {
			throw new Error('"' + sValue + '" is not a value of the enums sap.ui.core.ValueState or sap.ui.core.IndicationColor for property "state" of ' + this);
		}

		return this.setProperty("state", sValue);
	};

	/**
	 * @private
	 * @param {object} oEvent The fired event
	 */
	ObjectStatus.prototype.ontap = function(oEvent) {
		if (this._isClickable(oEvent)) {
			this.firePress();
		}
	};

	/**
	 * @private
	 * @param {object} oEvent The fired event
	 */
	ObjectStatus.prototype.onsapenter = function(oEvent) {
		if (this._isActive()) {
			this.firePress();

			// mark the event that it is handled by the control
			oEvent.setMarked();
		}
	};

	/**
	 * @private
	 * @param {object} oEvent The fired event
	 */
	ObjectStatus.prototype.onkeyup = function (oEvent) {
		if (oEvent.which === KeyCodes.SPACE) {
			if (!this._bPressedEscapeOrShift) {
				this.firePress();
				// mark the event that it is handled by the control
				oEvent.setMarked();
			} else {
				this._bPressedEscapeOrShift = false;
			}
			this._bPressedSpace = false;
		}
	};

	/**
	 * Handle the key down event for SPACE
	 * SHIFT or ESCAPE on pressed SPACE cancels the action
	 *
	 * @param {jQuery.Event} oEvent The SPACE keyboard key event object
	 */
	ObjectStatus.prototype.onkeydown = function(oEvent) {
		if (oEvent.which === KeyCodes.SPACE || oEvent.which === KeyCodes.SHIFT || oEvent.which === KeyCodes.ESCAPE) {
			// set inactive state of the button and marked ESCAPE or SHIFT as pressed only if SPACE was pressed before it
			if (oEvent.which === KeyCodes.SPACE) {
				if (this._isActive()) {
					// mark the event for components that needs to know if the event was handled by the active status
					oEvent.setMarked();
					oEvent.preventDefault();
					this._bPressedSpace = true;
				}
			}

			if (this._bPressedSpace && (oEvent.which === KeyCodes.ESCAPE || oEvent.which === KeyCodes.SHIFT)) {
				this._bPressedEscapeOrShift = true;
			}
		} else {
			if (this._bPressedSpace) {
				oEvent.preventDefault();
			}
		}
	};

	/**
	 * Checks if the ObjectStatus should be set to active.
	 * @private
	 * @returns {boolean} If the ObjectStatus is active
	 */
	ObjectStatus.prototype._isActive = function() {

		return  this.getActive() && (this.getText().trim() || this.getIcon().trim());
	};

	/**
	 * Checks if the ObjectStatus is empty.
	 * @private
	 * @returns {boolean} If the ObjectStatus is empty
	 */
	ObjectStatus.prototype._isEmpty = function() {

		return !(this.getText().trim() || this.getIcon().trim() || this.getTitle().trim());
	};

	ObjectStatus.prototype._shouldRenderEmptyIndicator = function() {
		return this.getEmptyIndicatorMode() !== EmptyIndicatorMode.Off &&
			!this.getText() &&
			!this.getIcon();
	};

	/**
	 * Called when the control is touched.
	 * @param {object} oEvent The fired event
	 * @private
	 */
	ObjectStatus.prototype.ontouchstart = function(oEvent) {
		if (this._isClickable(oEvent)) {
			// mark the event that it is handled by the control
			oEvent.setMarked();
		}
	};

	/**
	 * @see sap.ui.core.Control#getAccessibilityInfo
	 *
	 * @returns {sap.ui.core.AccessibilityInfo} Current accessibility state of the control
	 * @protected
	 */
	ObjectStatus.prototype.getAccessibilityInfo = function() {
		var sState = this.isPropertyInitial("stateAnnouncementText")
				? ValueStateSupport.getAdditionalText(this.getState())
				: this.getStateAnnouncementText(),
			sText = this._shouldRenderEmptyIndicator()
				? Library.getResourceBundleFor("sap.m").getText("EMPTY_INDICATOR_TEXT")
				: this.getText(),
			sDescription;

		if (this.getState() != ValueState.None) {
			sState = (sState !== null) ? sState : IndicationColorSupport.getAdditionalText(this.getState());
		}

		sDescription = (
			(this.getTitle() || "") + " " +
			(sText || "") + " " +
			(sState !== null ? sState : "") + " " +
			(this.getTooltip() || "")
		).trim();

		sDescription = this._isActive()
			? sDescription + (sDescription ? " " + Library.getResourceBundleFor("sap.m").getText("OBJECT_STATUS_ACTIVE") : "")
			: sDescription;

		return { description: sDescription };
	};

	/**
	 * Checks whether or not the control is labelled either via labels or its <code>ariaLabelledBy</code> association.
	 * @returns {boolean}
	 * @private
	 */
	 ObjectStatus.prototype._hasExternalLabelling = function() {
		return this.getAriaLabelledBy().length > 0 || LabelEnablement.getReferencingLabels(this).length > 0;
	};

	/**
	 * Generates a string containing all internal elements' IDs, which provide information to the screen reader user.
	 * @returns {string}
	 * @private
	 */
	 ObjectStatus.prototype._generateSelfLabellingIds = function() {
		var sId = this.getId(),
			sResult = "";

		if (this.getTitle()) {
			sResult += sId + "-title ";
		}

		if (this.getText()) {
			sResult += sId + "-text ";
		}

		if (this.getIcon()) {
			sResult += sId + "-statusIcon ";
		}

		return sResult.trim();
	};

	ObjectStatus.prototype._isClickable = function(oEvent) {
		var sSourceId = oEvent.target.id || oEvent.srcControl.getId();

		//event should only be fired if the click is on the text, link or icon
		return this._isActive() && (sSourceId === this.getId() + "-link" || sSourceId === this.getId() + "-text" || sSourceId === this.getId() + "-statusIcon" || sSourceId === this.getId() + "-icon");
	};

	ObjectStatus.prototype.getFormFormattedValue = function () {
		return this.getText();
	};

	ObjectStatus.prototype.getFormValueProperty = function () {
		return "text";
	};

	ObjectStatus.prototype.getFormObservingProperties = function() {
		return ["text", "title"]; // title should not used inside Form as there is a Label
	};

	ObjectStatus.prototype.getFormRenderAsControl = function () {
		return true;
	};

	return ObjectStatus;

});
