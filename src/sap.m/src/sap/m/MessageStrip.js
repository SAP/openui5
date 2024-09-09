/*!
* ${copyright}
*/

// Provides control sap.m.MessageStrip.
sap.ui.define([
	"./library",
	"sap/ui/core/AnimationMode",
	"sap/ui/core/Control",
	"./MessageStripUtilities",
	"./Text",
	"./Link",
	"./FormattedText",
	"sap/ui/core/ControlBehavior",
	"sap/ui/core/Lib",
	"sap/ui/core/library",
	"./MessageStripRenderer",
	"sap/base/Log",
	"sap/m/Button",
	"sap/ui/core/InvisibleText"
], function(
	library,
	AnimationMode,
	Control,
	MSUtils,
	Text,
	Link,
	FormattedText,
	ControlBehavior,
	Library,
	coreLibrary,
	MessageStripRenderer,
	Log,
	Button,
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
	 * You can use a limited set of formatting tags for the message text by setting <code>enableFormattedText</code>. The allowed tags are:
	 * With version 1.50
	 * <ul>
	 * <li>&lt;a&gt;</li>
	 * <li>&lt;em&gt;</li>
	 * <li>&lt;strong&gt;</li>
	 * <li>&lt;u&gt;</li>
	 * </ul>
	 * With version 1.85
	 * <ul>
	 * <li>&lt;br&gt;</li>
	 * </ul>
	 *
	 * <h3>Dynamically generated Message Strip</h3>
	 * To meet the accessibility requirements when using dynamically generated Message Strip you must implement it alongside <code>sap.ui.core.InvisibleMessage</code>.
	 * This will allow screen readers to announce it in real time. We suggest such dynamically generated message strips to be announced as Information Bar,
	 * as shown in our “Dynamic Message Strip Generator sample.”
	 *
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
	 */
	var MessageStrip = Control.extend("sap.m.MessageStrip", /** @lends sap.m.MessageStrip.prototype */ {
		metadata: {
			library: "sap.m",
			designtime: "sap/m/designtime/MessageStrip.designtime",
			properties: {

				/**
				 * Determines the text of the message.
				 */
				text: { type: "string", group: "Data", defaultValue: "" },

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
				 * evaluated. The <code>text</code> property value is set as <code>htmlText</code> to an internal instance of {@link sap.m.FormattedText}
				 *
				 * <b>Note:</b> If this property is set to true the string passed to <code>text</code> property
				 * can evaluate the following list of limited HTML elements. All other HTML elements and their nested
				 * content will not be rendered by the control:
				 * <ul>
				 *	<li><code>a</code></li>
				 *	<li><code>br</code></li>
				 *	<li><code>em</code></li>
				 *	<li><code>strong</code></li>
				 *	<li><code>u</code></li>
				 * </ul>
				 *
				 * @since 1.50
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
				 * List of <code>sap.m.Link</code> controls that replace the placeholders in the text.
				 * Placeholders are replaced according to their indexes. The first link in the aggregation replaces the placeholder with index %%0, and so on.
				 * <b>Note:</b> Placeholders are replaced if the <code>enableFormattedText</code> property is set to true.
				 * @since 1.129
				 */
				controls: { type: "sap.m.Link", multiple: true, singularName: "control", forwarding: { idSuffix: "-formattedText", aggregation: "controls" } },

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
		},

		renderer: MessageStripRenderer
	});

	MessageStrip.prototype.init = function () {
		this.data("sap-ui-fastnavgroup", "true", true);
		this.setAggregation("_text", new Text());
		this._initCloseButton();
	};

	MessageStrip.prototype.onBeforeRendering = function () {
		this._normalizeType(this.getType());
		this._setButtonAriaLabelledBy(this.getType());
	};

	/**
	 * Setter for property text.
	 * Default value is empty/undefined
	 * @public
	 * @param {string} sText new value for property text
	 * @returns {this} this to allow method chaining
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
	 * Closes the MessageStrip.
	 * This method sets the visible property of the MessageStrip to false.
	 * The MessageStrip can be shown again by setting the visible property to true.
	 * @public
	 */
	MessageStrip.prototype.close = function () {
		var sAnimationMode = ControlBehavior.getAnimationMode(),
			bHasAnimations = sAnimationMode !== AnimationMode.none && sAnimationMode !== AnimationMode.minimal;

		var fnClosed = function () {
			this.setVisible(false);
			this.fireClose();
		}.bind(this);

		if (!bHasAnimations) {
			fnClosed();
			return;
		}

		MSUtils.closeTransitionWithCSS.call(this, fnClosed);
	};

	MessageStrip.prototype.setEnableFormattedText = function (bEnable) {
		var oFormattedText  = this.getAggregation("_formattedText");

		if (bEnable) {
			if (!oFormattedText) {
				oFormattedText = new FormattedText(this.getId() + "-formattedText");
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
			var sId = this.getId() + "-info" + " " + this.getAggregation("_text").getId(),
				aAriaDescribedBy = oControl.getAriaDescribedBy();

			if (!aAriaDescribedBy.includes(sId)) {
				oControl.addAriaDescribedBy(sId);
			}
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
			oLink = this.getLink(),
			oResourceBundle = Library.getResourceBundleFor("sap.m");


		if (!oLink) {
			mAccessibilityState.labelledby = this.getId();
		}

		mAccessibilityState.roledescription = oResourceBundle.getText("MESSAGE_STRIP_ARIA_ROLE_DESCRIPTION");
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

	MessageStrip.prototype._normalizeType = function (sType) {
		if (sType === MessageType.None) {
			Log.warning(MSUtils.MESSAGES.TYPE_NOT_SUPPORTED);
			this.setProperty("type", MessageType.Information, true);
		}
	};

	/**
	 * Initialize close button.
	 */
	MessageStrip.prototype._initCloseButton = function () {
		var oRb = Library.getResourceBundleFor("sap.m"),
			oCloseButton = this.getAggregation("_closeButton");

			if (!oCloseButton) {

				var oButton = new Button({
					type: ButtonType.Transparent,
					tooltip: oRb.getText("MESSAGE_STRIP_TITLE"),
					icon: "sap-icon://decline",
					press: this.close.bind(this)
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
			oRb = Library.getResourceBundleFor("sap.m"),
			sText = oRb.getText("MESSAGE_STRIP_" + sType.toUpperCase() + "_CLOSE_BUTTON");

		if (!this._oInvisibleText) {
			this._oInvisibleText = new InvisibleText({
				text: sText
			}).toStatic();
		} else {
			this._oInvisibleText.setText(sText);
		}

		if (oCloseButton) {
			oCloseButton.removeAllAssociation("ariaLabelledBy", true);
			oCloseButton.addAssociation("ariaLabelledBy", this._oInvisibleText.getId(), true);
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