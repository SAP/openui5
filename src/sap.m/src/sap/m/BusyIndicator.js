/*!
 * ${copyright}
 */

// Provides control sap.m.BusyIndicator.
sap.ui.define([
	'./library',
	'sap/ui/core/Control',
	'sap/ui/core/library',
	'sap/m/Image',
	'sap/m/Label',
	"./BusyIndicatorRenderer"
],
	function(library, Control, coreLibrary, Image, Label, BusyIndicatorRenderer) {
	"use strict";



	// shortcut for sap.ui.core.TextDirection
	var TextDirection = coreLibrary.TextDirection;



	/**
	 * Constructor for a new BusyIndicator.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * Informs the user about an ongoing operation.
	 * <h3>Overview</h3>
	 * The busy indicator implies that an action is taking place within a single control.
	 * You can set the size of the icon, the text, but also define a custom icon to be used instead.
	 * <h3>Usage</h3>
	 * <h4>When to use</h4>
	 * <ul>
	 * <li>The user needs to be able to cancel the operation.</li>
	 * <li>Only part of the application or a particular control is affected.</li>
	 * </ul>
	 * <h4>When not to use</h4>
	 * <ul>
	 * <li>The operation takes less than one second.</li>
	 * <li>You need to block the screen and prevent the user from starting another activity. In this case, use the {@link sap.m.BusyDialog busy dialog}.</li>
	 * <li>Do not change the mouse cursor to indicate the ongoing operation.</li>
	 * <li>Do not show multiple busy indicators at once</li>
	 * </ul>
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @alias sap.m.BusyIndicator
	 * @see {@link fiori:https://experience.sap.com/fiori-design-web/busy-indicator/ Busy Indicator}
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var BusyIndicator = Control.extend("sap.m.BusyIndicator", /** @lends sap.m.BusyIndicator.prototype */ { metadata : {

		library : "sap.m",
		properties : {

			/**
			 * Defines text to be displayed below the busy indicator.
			 * It can be used to inform the user of the current operation.
			 */
			text : {type : "string", group : "Data", defaultValue : ""},

			/**
			 * Options for the text direction are RTL and LTR.
			 * Alternatively, the control can inherit the text direction from its parent container.
			 */
			textDirection : {type : "sap.ui.core.TextDirection", group : "Appearance", defaultValue : TextDirection.Inherit},

			/**
			 * Icon URL if an icon is used as the busy indicator.
			 */
			customIcon : {type : "sap.ui.core.URI", group : "Misc", defaultValue : ""},

			/**
			 * Defines the rotation speed of the given image.
			 * If a .gif is used, the speed has to be set to 0.
			 * The unit is in ms.
			 * <b>Note:</b> Values are considered valid when greater than or equal to 0.
			 * If invalid value is provided the speed defaults to 0.
			 */
			customIconRotationSpeed : {type : "int", group : "Appearance", defaultValue : 1000},

			/**
			 * If this is set to false, the src image will be loaded directly without attempting
			 * to fetch the density perfect image for high density device.
			 * By default, this is set to true but then one or more requests are sent to the server,
			 * trying to get the density perfect version of the specified image.
			 * If bandwidth is the key for the application, set this value to false.
			 */
			customIconDensityAware : {type : "boolean", defaultValue : true},

			/**
			 * Width of the provided icon. By default 44px are used.
			 */
			customIconWidth : {type : "sap.ui.core.CSSSize", group : "Appearance", defaultValue : "44px"},

			/**
			 * Height of the provided icon. By default 44px are used.
			 */
			customIconHeight : {type : "sap.ui.core.CSSSize", group : "Appearance", defaultValue : "44px"},

			/**
			 * Defines the size of the busy indicator.
			 * The animation consists of three circles, each of which will be this size.
			 * Therefore the total width of the control amounts to three times the given size.
			 */
			size : {type : "sap.ui.core.CSSSize", group : "Misc", defaultValue : "1rem"},

			/**
			 * Setting this property will not have any effect on the appearance of the BusyIndicator
			 * in versions greater than or equal to 1.32.1
			 * @deprecated Since version 1.32.1
			 */
			design : {type : "string", group : "Appearance", defaultValue : "auto"}
		},
		associations: {
			/**
			 * Association to controls / ids which label this control (see WAI-ARIA attribute aria-labelledby).
			 * @since 1.27.0
			 */
			ariaLabelledBy: {type: "sap.ui.core.Control", multiple: true, singularName: "ariaLabelledBy"}
		}
	}});

	BusyIndicator.prototype.init = function () {
		this.setBusyIndicatorDelay(0);
	};

	BusyIndicator.prototype.onBeforeRendering = function () {
		if (this.getCustomIcon()) {
			this.setBusy(false);
		} else {
			this.setBusy(true, "busy-area");
		}

		if (this._busyLabel) {
			this._busyLabel.setTextDirection(this.getTextDirection());
		}

		if (this._iconImage) {
			this._iconImage.setDensityAware(this.getCustomIconDensityAware());
			this._iconImage.setSrc(this.getCustomIcon());
			this._iconImage.setWidth(this.getCustomIconWidth());
			this._iconImage.setHeight(this.getCustomIconHeight());
		} else if (!this._iconImage && this.getCustomIcon()) {
			this._createCustomIcon(this.getCustomIcon()).addStyleClass("sapMBsyIndIcon");
		}

		if (this._busyLabel) {
			this._busyLabel.setText(this.getText());
			this._busyLabel.setTextDirection(this.getTextDirection());
		} else if (!this._busyLabel && this.getText()) {
			this._createLabel(this.getText());
		}

		var sRotationSpeed = this.getCustomIconRotationSpeed();
		if (sRotationSpeed < 0) {
			this.setCustomIconRotationSpeed(0);
		}
	};

	BusyIndicator.prototype.onAfterRendering = function() {
		this._setRotationSpeed();
	};

	BusyIndicator.prototype.exit = function () {
		if (this._iconImage) {
			this._iconImage.destroy();
			this._iconImage = null;
		}

		if (this._busyLabel) {
			this._busyLabel.destroy();
			this._busyLabel = null;
		}
	};

	BusyIndicator.prototype._createCustomIcon = function(sIconURI) {
		this._iconImage = new Image(this.getId() + "-icon", {
			src: sIconURI,
			width: this.getCustomIconWidth(),
			height: this.getCustomIconHeight(),
			densityAware: this.getCustomIconDensityAware()
		});
		return this._iconImage;
	};

	BusyIndicator.prototype._createLabel = function(sText) {
		this._busyLabel = new Label(this.getId() + "-label", {
			labelFor: this.getId(),
			text: sText,
			textAlign: "Center",
			textDirection: this.getTextDirection()
		});
		return this._busyLabel;
	};

	BusyIndicator.prototype._setRotationSpeed = function () {
		if (!this._iconImage) {
			return;
		}

		var $icon = this._iconImage.$();
		var sRotationSpeed = this.getCustomIconRotationSpeed() + "ms";

		$icon.css("-webkit-animation-duration", sRotationSpeed)
			.css("animation-duration", sRotationSpeed);

		//Bug in Chrome: After changing height of image -> changing the rotationspeed will have no affect
		//chrome needs a rerendering of this element.
		$icon.css("display", "none");
		setTimeout(function() {
			$icon.css("display", "inline");
		}, 0);
	};

	return BusyIndicator;

});