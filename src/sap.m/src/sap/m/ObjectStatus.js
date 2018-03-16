/*!
 * ${copyright}
 */

// Provides control sap.m.ObjectStatus.
sap.ui.define([
	'./library',
	'sap/ui/core/Control',
	'sap/ui/core/ValueStateSupport',
	'sap/ui/core/library',
	'./ObjectStatusRenderer'
],
	function(library, Control, ValueStateSupport, coreLibrary, ObjectStatusRenderer) {
	"use strict";



	// shortcut for sap.m.ImageHelper
	var ImageHelper = library.ImageHelper;

	// shortcut for sap.ui.core.TextDirection
	var TextDirection = coreLibrary.TextDirection;

	// shortcut for sap.ui.core.ValueState
	var ValueState = coreLibrary.ValueState;



	/**
	 * Constructor for a new ObjectStatus.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * Status information that can be either text with a value state, or an icon.
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
			state : {type : "sap.ui.core.ValueState", group : "Misc", defaultValue : ValueState.None},

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
		}
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
		var sImgId = this.getId() + '-icon';
		var mProperties = {
			src : this.getIcon(),
			densityAware : this.getIconDensityAware(),
			useIconTooltip : false
		};

		this._oImageControl = ImageHelper.getImageControl(sImgId, this._oImageControl, this, mProperties);

		return this._oImageControl;
	};

	/**
	 * Sets the title.
	 * The default value is empty/undefined.
	 * @public
	 * @param {string} sTitle New value for property title
	 * @returns {sap.m.ObjectStatus} this to allow method chaining
	 */
	ObjectStatus.prototype.setTitle = function (sTitle) {
		var $Title = this.$().children(".sapMObjStatusTitle"),
			bShouldSuppressInvalidate = !!$Title.length && !!this.validateProperty("title", sTitle).trim();

		this.setProperty("title", sTitle, bShouldSuppressInvalidate);

		if (bShouldSuppressInvalidate) {
			$Title.text(this.getTitle() + ":");
		}

		return this;
	};

	/**
	 * Sets the text.
	 * The default value is empty/undefined.
	 * @public
	 * @param {string} sText New value for property text
	 * @returns {sap.m.ObjectStatus} this to allow method chaining
	 */
	ObjectStatus.prototype.setText = function (sText) {
		var $Text = this.$().children(".sapMObjStatusText"),
			bShouldSuppressInvalidate = !!$Text.length && !!this.validateProperty("text", sText).trim();

		this.setProperty("text", sText, bShouldSuppressInvalidate);

		if (bShouldSuppressInvalidate) {
			$Text.text(this.getText());
		}

		return this;
	};

	/**
	 * @private
	 * @param {object} oEvent The fired event
	 */
	ObjectStatus.prototype.ontap = function(oEvent) {
		var sSourceId = oEvent.target.id;

		//event should only be fired if the click is on the text
		if (this._isActive() && (sSourceId === this.getId() + "-link" || sSourceId === this.getId() + "-text" || sSourceId === this.getId() + "-icon")) {

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
	 * @see sap.ui.core.Control#getAccessibilityInfo
	 *
	 * @returns {Object} Current accessibility state of the control
	 * @protected
	 */
	ObjectStatus.prototype.getAccessibilityInfo = function() {
		var sState = this.getState() != ValueState.None ? ValueStateSupport.getAdditionalText(this.getState()) : "";

		return {
			description: ((this.getTitle() || "") + " " + (this.getText() || "") + " " + sState + " " + (this.getTooltip() || "")).trim()
		};
	};

	return ObjectStatus;

});
