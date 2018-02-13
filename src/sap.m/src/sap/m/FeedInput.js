/*!
 * ${copyright}
 */

sap.ui.define([
	"jquery.sap.global",
	"./library",
	"sap/ui/core/Control",
	"sap/ui/core/IconPool",
	"sap/m/TextArea",
	"sap/m/Button",
	"./FeedInputRenderer"
],
	function(jQuery, library, Control, IconPool, TextArea, Button, FeedInputRenderer) {
	"use strict";

	// shortcut for sap.m.ButtonType
	var ButtonType = library.ButtonType;

	/**
	 * Constructor for a new FeedInput.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * The Feed Input allows the user to enter text for a new feed entry and then post it.
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.22
	 * @alias sap.m.FeedInput
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var FeedInput = Control.extend("sap.m.FeedInput", /** @lends sap.m.FeedInput.prototype */ { metadata : {

		library : "sap.m",
		designtime: "sap/m/designtime/FeedInput.designtime",
		properties : {

			/**
			 * Set this flag to "false" to disable both text input and post button.
			 */
			enabled : {type : "boolean", group : "Behavior", defaultValue : true},

			/**
			 * The maximum length (the maximum number of characters) for the feed input's value. By default this is not limited.
			 */
			maxLength : {type : "int", group : "Behavior", defaultValue : 0},

			/**
			 * The placeholder text shown in the input area as long as the user has not entered any text value.
			 */
			placeholder : {type : "string", group : "Appearance", defaultValue : "Post something here"},

			/**
			 * The text value of the feed input. As long as the user has not entered any text the post button is disabled
			 */
			value : {type : "string", group : "Data", defaultValue : null},

			/**
			 * Icon to be displayed as a graphical element within the feed input. This can be an image or an icon from the icon font.
			 */
			icon : {type : "sap.ui.core.URI", group : "Data", defaultValue : null},

			/**
			 * If set to "true" (default), icons will be displayed. In case no icon is provided the standard placeholder will be displayed. if set to "false" icons are hidden
			 */
			showIcon : {type : "boolean", group : "Behavior", defaultValue : true},

			/**
			 * Some mobile devices support higher resolution images while others do not. Therefore, you should provide image resources for all relevant densities.
			 * If the property is set to "true", one or more requests are sent to the server to try and get the perfect density version of an image. If an image of a certain density is not available, the image control falls back to the default image, which should be provided.
			 *
			 * If you do not have higher resolution images, you should set the property to "false" to avoid unnecessary round-trips.
			 *
			 * Please be aware that this property is relevant only for images and not for icons.
			 */
			iconDensityAware : {type : "boolean", group : "Appearance", defaultValue : true},

			/**
			 * Sets a new tooltip for Submit button. The tooltip can either be a simple string (which in most cases will be rendered as the title attribute of this element)
			 * or an instance of sap.ui.core.TooltipBase.
			 * If a new tooltip is set, any previously set tooltip is deactivated.
			 * The default value is set language dependent.
			 * @since 1.28
			 */
			buttonTooltip : {type : "sap.ui.core.TooltipBase", group : "Accessibility", defaultValue : "Submit"},

			/**
			 * Text for Picture which will be read by screenreader.
			 * If a new ariaLabelForPicture is set, any previously set ariaLabelForPicture is deactivated.
			 * @since 1.30
			 */
			ariaLabelForPicture : {type : "string", group : "Accessibility", defaultValue : null}
		},

		events : {

			/**
			 * The Post event is triggered when the user has entered a value and pressed the post button. After firing this event, the value is reset.
			 */
			post : {
				parameters : {
					/**
					 * The value of the feed input before reseting it.
					 */
					value : {type : "string"}
				}
			}
		}
	}});



	/////////////////////////////////// Lifecycle /////////////////////////////////////////////////////////

	/**
	 * Overrides sap.ui.core.Element.init
	 */
	FeedInput.prototype.init = function () {
		// override text defaults
		var oBundle = sap.ui.getCore().getLibraryResourceBundle("sap.m");
		this.setProperty("placeholder", oBundle.getText("FEEDINPUT_PLACEHOLDER"), true);
		this.setProperty("buttonTooltip", oBundle.getText("FEEDINPUT_SUBMIT"), true);
	};

	/**
	 * Overrides sap.ui.core.Element.exit
	 */
	FeedInput.prototype.exit = function () {
		if (this._oTextArea) {
			this._oTextArea.destroy();
		}
		if (this._oButton) {
			this._oButton.destroy();
		}
		if (this._oImageControl) {
			this._oImageControl.destroy();
		}
	};

	/////////////////////////////////// Properties /////////////////////////////////////////////////////////

	FeedInput.prototype.setIconDensityAware = function (iIconDensityAware) {
		this.setProperty("iconDensityAware", iIconDensityAware, true);
		var fnClass = sap.ui.require("sap/m/Image");
		if (this._getImageControl() instanceof fnClass) {
			this._getImageControl().setDensityAware(iIconDensityAware);
		}
		return this;
	};

	FeedInput.prototype.setMaxLength = function (iMaxLength) {
		this.setProperty("maxLength", iMaxLength, true);
		this._getTextArea().setMaxLength(iMaxLength);
		return this;
	};

	FeedInput.prototype.setValue = function (sValue) {
		this.setProperty("value", sValue, true);
		this._getTextArea().setValue(sValue);
		this._enablePostButton();
		return this;
	};

	FeedInput.prototype.setPlaceholder = function (sValue) {
		this.setProperty("placeholder", sValue, true);
		this._getTextArea().setPlaceholder(sValue);
		return this;
	};

	FeedInput.prototype.setEnabled = function (bEnabled) {
		this.setProperty("enabled", bEnabled, true);
		this._getTextArea().setEnabled(bEnabled);
		this._enablePostButton();
		return this;
	};

	FeedInput.prototype.setButtonTooltip = function (vButtonTooltip) {
		this.setProperty("buttonTooltip", vButtonTooltip, true);
		this._getPostButton().setTooltip(vButtonTooltip);
		return this;
	};

	/////////////////////////////////// Private /////////////////////////////////////////////////////////

	/**
	 * Access and initialization for the text area
	 * @returns {sap.m.TextArea} The text area
	 */
	FeedInput.prototype._getTextArea = function () {
		if (!this._oTextArea) {
			this._oTextArea = new TextArea(this.getId() + "-textArea", {
				rows : 3,
				value : null,
				maxLength : this.getMaxLength(),
				placeholder : this.getPlaceholder(),
				height: "100%",
				liveChange : jQuery.proxy(function (oEvt) {
					var sValue = oEvt.getParameter("value");
					this.setProperty("value", sValue, true); // update myself without re-rendering
					this._enablePostButton();
				}, this)
			});
			this._oTextArea.setParent(this);
		}
		return this._oTextArea;
	};

	/**
	 * Access and initialization for the button
	 * @returns {sap.m.Button} The button
	 */
	FeedInput.prototype._getPostButton = function () {
		if (!this._oButton) {
			this._oButton = new Button(this.getId() + "-button", {
				enabled : false,
				type : ButtonType.Default,
				icon : "sap-icon://feeder-arrow",
				tooltip : this.getButtonTooltip(),
				press : jQuery.proxy(function () {
					this._oTextArea.focus();
					this.firePost({
						value : this.getValue()
					});
					this.setValue(null);
				}, this)
			});
			this._oButton.setParent(this);
		}
		return this._oButton;
	};

	/**
	 * Enable post button depending on the current value
	 */
	FeedInput.prototype._enablePostButton = function () {
		var bPostButtonEnabled = this._isControlEnabled();
		var oButton = this._getPostButton();
		oButton.setEnabled(bPostButtonEnabled);
	};

	/**
	 * Verifies if the control is enabled or not
	 * @returns {boolean} True if control is enabled
	 */
	FeedInput.prototype._isControlEnabled = function() {
		var sValue = this.getValue();
		return this.getEnabled() && jQuery.type(sValue) === "string" && sValue.trim().length > 0;
	};

	/**
	 * Lazy load feed icon image.
	 *
	 * @private
	 * @returns {sap.m.Image} The image control
	 */
	FeedInput.prototype._getImageControl = function() {

		var sIconSrc = this.getIcon() || IconPool.getIconURI("person-placeholder"),
			sImgId = this.getId() + '-icon',
			mProperties = {
				src : sIconSrc,
				alt : this.getAriaLabelForPicture(),
				densityAware : this.getIconDensityAware(),
				decorative : false,
				useIconTooltip: false
			},
			aCssClasses = ['sapMFeedInImage'];

		this._oImageControl = library.ImageHelper.getImageControl(sImgId, this._oImageControl, this, mProperties, aCssClasses);

		return this._oImageControl;
	};

	return FeedInput;

});
