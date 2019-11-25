/*!
 * ${copyright}
 */

// Provides control sap.m.ObjectStatus.
sap.ui.define([
	'./library',
	'sap/ui/core/Control',
	'sap/ui/core/ValueStateSupport',
	'sap/ui/core/IndicationColorSupport',
	'sap/ui/core/library',
	'sap/ui/base/DataType',
	'./ObjectStatusRenderer'
],
	function(library, Control, ValueStateSupport, IndicationColorSupport, coreLibrary, DataType, ObjectStatusRenderer) {
	"use strict";



	// shortcut for sap.m.ImageHelper
	var ImageHelper = library.ImageHelper;

	// shortcut for sap.ui.core.TextDirection
	var TextDirection = coreLibrary.TextDirection;

	// shortcuts for sap.ui.core.ValueState
	var ValueState = coreLibrary.ValueState;


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
	 * With 1.63, large design of the control is supported by setting <code>sapMObjectStatusLarge</code> CSS class to the <code>ObjectStatus</code>.
	 *
	 * @extends sap.ui.core.Control
	 * @implements sap.ui.core.IFormContent
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @alias sap.m.ObjectStatus
	 * @see {@link fiori:https://experience.sap.com/fiori-design-web/object-display-elements/#-object-status Object Status}
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var ObjectStatus = Control.extend("sap.m.ObjectStatus", /** @lends sap.m.ObjectStatus.prototype */ { metadata : {

		interfaces : ["sap.ui.core.IFormContent"],
		library : "sap.m",
		designtime: "sap/m/designtime/ObjectStatus.designtime",
		properties : {

			/**
			 * Defines the ObjectStatus title.
			 */
			title : {type : "string", group : "Misc", defaultValue : null},

			/**
			 * Defines the ObjectStatus text.
			 */
			text : {type : "string", group : "Misc", defaultValue : null},

			/**
			 * Indicates if the <code>ObjectStatus</code> text and icon can be clicked/tapped by the user.
			 *
			 * <b>Note:</b> If you set this property to <code>true</code>, you have to also set the <code>text</code> or <code>icon</code> property.
			 *
			 * @since 1.54
			 */
			active : {type : "boolean", group : "Misc", defaultValue : false},

			/**
			 * Defines the text value state.
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
			textDirection : {type : "sap.ui.core.TextDirection", group : "Appearance", defaultValue : TextDirection.Inherit}
		},
		associations : {

			/**
			 * Association to controls / IDs, which describe this control (see WAI-ARIA attribute aria-describedby).
			 */
			ariaDescribedBy : {type : "sap.ui.core.Control", multiple : true, singularName : "ariaDescribedBy"}
		},
		events : {

			/**
			 * Fires when the user clicks/taps on active text.
			 * @since 1.54
			 */
			press : {}
		},
		dnd: { draggable: true, droppable: false }
	}});

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
			bIsIconOnly = !this.getText() && !this.getTitle(),
			mProperties = {
				src : this.getIcon(),
				densityAware : this.getIconDensityAware(),
				useIconTooltip : false
			};

		if (bIsIconOnly) {
			mProperties.decorative = false;
			mProperties.alt = sap.ui.getCore().getLibraryResourceBundle("sap.m").getText("OBJECT_STATUS_ICON");
		}

		this._oImageControl = ImageHelper.getImageControl(sImgId, this._oImageControl, this, mProperties);

		return this._oImageControl;
	};

	/**
	 * Sets value for the <code>state</code> property. The default value is <code>ValueState.None</code>.
	 * @public
	 * @param {string} sValue New value for property state.
	 * It should be valid value of enumeration <code>sap.ui.core.ValueState</code> or <code>sap.ui.core.IndicationColor</code>
	 * @returns {sap.m.ObjectStatus} this to allow method chaining
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
	ObjectStatus.prototype.onsapspace = function(oEvent) {
		this.onsapenter(oEvent);
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
	 * @returns {Object} Current accessibility state of the control
	 * @protected
	 */
	ObjectStatus.prototype.getAccessibilityInfo = function() {
		var sState = ValueStateSupport.getAdditionalText(this.getState());

		if (this.getState() != ValueState.None) {
			sState = (sState !== null) ? sState : IndicationColorSupport.getAdditionalText(this.getState());
		}

		return {
			description: (
				(this.getTitle() || "") + " " +
				(this.getText() || "") + " " +
				(sState !== null ? sState : "") + " " +
				(this.getTooltip() || "") + " " +
				sap.ui.getCore().getLibraryResourceBundle("sap.m").getText("OBJECT_STATUS")
			).trim()
		};
	};

	ObjectStatus.prototype._isClickable = function(oEvent) {
		var sSourceId = oEvent.target.id;

		//event should only be fired if the click is on the text, link or icon
		return this._isActive() && (sSourceId === this.getId() + "-link" || sSourceId === this.getId() + "-text" || sSourceId === this.getId() + "-statusIcon" || sSourceId === this.getId() + "-icon");
	};

	return ObjectStatus;

});
