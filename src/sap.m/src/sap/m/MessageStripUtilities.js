/*!
* ${copyright}
*/

sap.ui.define([
	'sap/ui/core/IconPool'
], function (
	IconPool
) {
	"use strict";

	/**
	 * MessageStrip utilities.
	 * @namespace
	 */
	var MessageStripUtilities = {};

	MessageStripUtilities.MESSAGES = {
		TYPE_NOT_SUPPORTED: "Value 'sap.ui.core.MessageType.None' for property 'type' is not supported. " +
		"Defaulting to 'sap.ui.core.MessageType.Information'"
	};

	MessageStripUtilities.CLASSES = {
		ROOT: "sapMMsgStrip",
		ICON: "sapMMsgStripIcon",
		MESSAGE: "sapMMsgStripMessage",
		CLOSE_BUTTON: "sapMMsgStripCloseButton",
		CLOSING_TRANSITION: "sapMMsgStripClosing"
	};

	MessageStripUtilities.ATTRIBUTES = {
		CLOSABLE: "data-sap-ui-ms-closable"
	};

	MessageStripUtilities.RESOURCE_BUNDLE = sap.ui.getCore().getLibraryResourceBundle("sap.m");

	/**
	 * Calculate the icon uri that should be set to the control property.
	 * Custom icons are allowed for all message types.
	 * If no custom icon is specified a default one is used.
	 * is defined by the control type.
	 * @private
	 * @returns {string} the icon uri that should be set to the control property
	 */
	MessageStripUtilities.getIconURI = function () {
		var sType = this.getType(),
			sCustomIconURI = this.getCustomIcon(),
			sIconURI;

		var oIconsMapping = {
			"Error": "error",
			"Warning": "alert",
			"Success": "sys-enter-2",
			"Information": "information"
		};

		sIconURI = IconPool.getIconURI(oIconsMapping[sType]);

		return sCustomIconURI || sIconURI;
	};

	MessageStripUtilities.getAriaTypeText = function () {
		var sBundleKey = "MESSAGE_STRIP_" + this.getType().toUpperCase(),
			sAriaText = MessageStripUtilities.RESOURCE_BUNDLE.getText(sBundleKey);

		if (this.getShowCloseButton()) {
			sAriaText += " " + MessageStripUtilities.RESOURCE_BUNDLE.getText("MESSAGE_STRIP_CLOSABLE");
		}

		return sAriaText;
	};

	MessageStripUtilities.isMSCloseButtonPressed = function (oTarget) {
		return oTarget.className.indexOf(MessageStripUtilities.CLASSES.CLOSE_BUTTON) !== -1 ||
			oTarget.parentNode.className.indexOf(MessageStripUtilities.CLASSES.CLOSE_BUTTON) !== -1;
	};

	MessageStripUtilities.closeTransitionWithCSS = function (fnCallback) {
		this.$().addClass(MessageStripUtilities.CLASSES.CLOSING_TRANSITION)
				.one("webkitTransitionEnd transitionend", fnCallback);
	};

	MessageStripUtilities.getAccessibilityState = function () {
		return {
			role: "note"
		};
	};

	return MessageStripUtilities;
});
