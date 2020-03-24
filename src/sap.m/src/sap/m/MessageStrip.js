/*!
* ${copyright}
*/

// Provides control sap.m.MessageStrip.
sap.ui.define([
	"./library",
	"sap/ui/core/Control",
	"./MessageStripUtilities",
	"./Text",
	"./Link",
	"./FormattedText",
	"sap/ui/core/library",
	"./MessageStripRenderer",
	"sap/base/Log",
	"sap/m/Button",
	"sap/ui/core/Core",
	"sap/ui/core/InvisibleText"
], function(
	library,
	Control,
	MSUtils,
	Text,
	Link,
	FormattedText,
	coreLibrary,
	MessageStripRenderer,
	Log,
	Button,
	Core,
	InvisibleText
) {
	"use strict";

	// shortcut for sap.ui.core.MessageType
	var MessageType = coreLibrary.MessageType;

	// shortcut for sap.m.ButtonType
	var ButtonType = library.ButtonType;

	/**
	 * Constructor for a new MessageStrip.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * MessageStrip is a control that enables the embedding of application-related messages in the application.
	 * <h3>Overview</h3>
	 * The message strip displays 4 types of messages, each with a corresponding semantic color and icon: Information, Success, Warning and Error.
	 *
	 * Each message can have a close button, so that it can be removed from the UI if needed.
	 *
	 * With version 1.50 you can use a limited set of formatting tags for the message text by setting <code>enableFormattedText</code>. The allowed tags are:
	 * <ul>
	 * <li>&lt;a&gt;</li>
	 * <li>&lt;em&gt;</li>
	 * <li>&lt;strong&gt;</li>
	 * <li>&lt;u&gt;</li>
	 * </ul>
	 * <h3>Usage</h3>
	 * <h4>When to use</h4>
	 * <ul>
	 * <li>You want to provide information or status update within the detail area of an object</li>
	 * </ul>
	 * <h4>When not to use</h4>
	 * <ul>
	 * <li>You want to display information within the object page header, within a control, in the master list, or above the page header.</li>
	 * </ul>
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.30
	 * @alias sap.m.MessageStrip
	 * @see {@link fiori:https://experience.sap.com/fiori-design-web/message-strip/ Message Strip}
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var MessageStrip = Control.extend("sap.m.MessageStrip", /** @lends sap.m.MessageStrip.prototype */ {
		metadata: {
			library: "sap.m",
			designtime: "sap/m/designtime/MessageStrip.designtime",
			properties: {

				/**
				 * Determines the text of the message.
				 */
				text: { type: "string", group: "Appearance", defaultValue: "" },

				/**
				 * Determines the type of messages that are displayed in the MessageStrip.
				 * Possible values are: Information (default), Success, Warning, Error.
				 * If None is passed, the value is set to Information and a warning is displayed in the console.
				 */
				type: { type: "sap.ui.core.MessageType", group: "Appearance", defaultValue: MessageType.Information },

				/**
				 * Determines a custom icon which is displayed.
				 * If none is set, the default icon for this message type is used.
				 */
				customIcon: { type: "sap.ui.core.URI", group: "Appearance", defaultValue: "" },

				/**
				 * Determines if an icon is displayed for the message.
				 */
				showIcon: { type: "boolean", group: "Appearance", defaultValue: false },

				/**
				 * Determines if the message has a close button in the upper right corner.
				 */
				showCloseButton: { type: "boolean", group: "Appearance", defaultValue: false },

				/**
				 * Determines the limited collection of HTML elements passed to the <code>text</code> property should be
				 * evaluated.
				 *
				 * <b>Note:</b> If this property is set to true the string passed to <code>text</code> property
				 * can evaluate the following list of limited HTML elements. All other HTML elements and their nested
				 * content will not be rendered by the control:
				 * <ul>
				 *	<li><code>a</code></li>
				 *	<li><code>em</code></li>
				 *	<li><code>strong</code></li>
				 *	<li><code>u</code></li>
				 * </ul>
				 */
				enableFormattedText: { type: "boolean", group: "Appearance", defaultValue: false }
			},
			defaultAggregation: "link",
			aggregations: {

				/**
				 * Adds an sap.m.Link control which will be displayed at the end of the message.
				 */
				link: { type: "sap.m.Link", multiple: false, singularName: "link" },

				/**
				 * Hidden aggregation which is used to transform the string message into sap.m.Text control.
				 * @private
				 */
				_formattedText: { type: "sap.m.FormattedText", multiple: false, visibility: "hidden" },

				/**
				 * Hidden aggregation which is used to transform the string message into sap.m.Text control.
				 */
				_text: { type: "sap.m.Text", multiple: false, visibility: "hidden" },

				/**
				 * Hidden aggregation which is used to create the close button with sap.m.Button control.
				 */
				_closeButton: { type: "sap.m.Button", multiple: false, visibility: "hidden" }
			},
			events: {

				/**
				 * This event will be fired after the container is closed.
				 */
				close: {}
			},
			dnd: { draggable: true, droppable: false }
		}
	});

	MessageStrip.prototype.init = function () {
		this.data("sap-ui-fastnavgroup", "true", true);
		this.setAggregation("_text", new Text());
		this._initCloseButton();
	};

	/**
	 * Setter for property text.
	 * Default value is empty/undefined
	 * @public
	 * @param {string} sText new value for property text
	 * @returns {sap.m.MessageStrip} this to allow method chaining
	 */
	MessageStrip.prototype.setText = function (sText) {
		// Update the internal FormattedText control if needed
		var oFormattedText = this.getAggregation("_formattedText");
		if (oFormattedText) {
			oFormattedText.setHtmlText(sText);
		}

		// Update the internal text control
		this.getAggregation("_text").setText(sText);

		return this.setProperty("text", sText);
	};

	/**
	 * Setter for property type.
	 * Default value is sap.ui.core.MessageType.Information
	 * @public
	 * @param {sap.ui.core.MessageType} sType The Message type
	 * @returns {sap.m.MessageStrip} this to allow method chaining
	 */
	MessageStrip.prototype.setType = function (sType) {
		if (sType === MessageType.None) {
			Log.warning(MSUtils.MESSAGES.TYPE_NOT_SUPPORTED);
			sType = MessageType.Information;
		}

		this.getType() !== sType && this._setButtonAriaLabelledBy(sType);

		return this.setProperty("type", sType);
	};

	MessageStrip.prototype.setEnableFormattedText = function (bEnable) {
		var oFormattedText  = this.getAggregation("_formattedText");

		if (bEnable) {
			if (!oFormattedText) {
				oFormattedText = new FormattedText();
				oFormattedText._setUseLimitedRenderingRules(true);
				this.setAggregation("_formattedText", oFormattedText);
			}
			// Aways call setHtmlText - do not use a constructor property to avoid unwanted warnings for HTML elements
			oFormattedText.setHtmlText(this.getText());
		}

		return this.setProperty("enableFormattedText", bEnable);
	};

	MessageStrip.prototype.setAggregation = function (sName, oControl, bSupressInvalidate) {
		if (sName === "link" && oControl instanceof Link) {
			oControl.addAriaLabelledBy(this.getId());
		}

		Control.prototype.setAggregation.call(this, sName, oControl, bSupressInvalidate);
		return this;
	};

	/**
	 * Retrieves the accessibility state of the control.
	 *
	 * @returns {object} The accessibility state of the control
	 */
	MessageStripRenderer.getAccessibilityState = function () {
		var mAccessibilityState = MSUtils.getAccessibilityState.call(this),
			oLink = this.getLink();

		if (!oLink) {
			mAccessibilityState.labelledby = this.getId();
		}
		return mAccessibilityState;
	};

	/**
	 * Handles mobile touch events
	 * @param {jQuery.Event} oEvent The event object
	 * @private
	 */
	MessageStrip.prototype.ontouchmove = function (oEvent) {
		// mark the event for components that needs to know if the event was handled
		oEvent.setMarked();
	};

	/**
	 * Initialize close button.
	 */
	MessageStrip.prototype._initCloseButton = function () {
		var oRb = Core.getLibraryResourceBundle("sap.m"),
			bHasAnimation = Core.getConfiguration().getAnimation(),
			oCloseButton = this.getAggregation("_closeButton"),
			fnClosed;

			if (!oCloseButton) {
				fnClosed = function () {
					this.fireClose();
					this.setVisible(false);
				}.bind(this);

				var oButton = new Button({
					type: ButtonType.Transparent,
					tooltip: oRb.getText("MESSAGE_STRIP_TITLE"),
					icon: "sap-icon://decline",
					press: function() {
						if (!bHasAnimation) {
							fnClosed();
							return;
						}

						MSUtils.closeTransitionWithCSS.call(this, fnClosed);
					}.bind(this)
				}).addStyleClass(MSUtils.CLASSES.CLOSE_BUTTON).addStyleClass("sapUiSizeCompact");

				this.setAggregation("_closeButton", oButton);
				this._setButtonAriaLabelledBy(this.getType());
		}
	};

	/**
	 * Set Arialabelledby to the close button.
	 * @param {sap.ui.core.MessageType} sType The Message type
	 */
	MessageStrip.prototype._setButtonAriaLabelledBy = function (sType) {
		var oCloseButton = this.getAggregation("_closeButton"),
			oRb = Core.getLibraryResourceBundle("sap.m"),
			sText = oRb.getText("MESSAGE_STRIP_" + sType.toUpperCase() + "_CLOSE_BUTTON");

		if (!this._oInvisibleText) {
			this._oInvisibleText = new InvisibleText({
				text: sText
			});
		} else {
			this._oInvisibleText.setText(sText);
		}

		if (oCloseButton) {
			oCloseButton.removeAllAriaLabelledBy();
			oCloseButton.addAriaLabelledBy(this._oInvisibleText.toStatic().getId());
		}
	};

	MessageStrip.prototype.exit = function () {
		if (this._oInvisibleText) {
			this._oInvisibleText.destroy();
			this._oInvisibleText = null;
		}
	};



	return MessageStrip;

});