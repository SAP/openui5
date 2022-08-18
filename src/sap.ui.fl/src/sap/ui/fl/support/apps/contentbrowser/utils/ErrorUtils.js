/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/m/MessagePopoverItem",
	"sap/m/MessagePopover",
	"sap/ui/model/json/JSONModel"],
function (MessagePopoverItem, MessagePopover, JSONModel) {
	"use strict";

	/**
		 * Provides utility for error handling in Content Browser.
		 *
		 * @constructor
		 * @alias sap.ui.fl.support.apps.contentbrowser.utils.ErrorUtils
		 * @author SAP SE
		 * @version ${version}
		 * @experimental Since 1.45
		 */
	var ErrorUtils = {};

	ErrorUtils._masterComponent = undefined;
	ErrorUtils._messagesModel = undefined;
	ErrorUtils._emptyModel = new JSONModel([]);

	ErrorUtils._messageTemplate = new MessagePopoverItem({
		type: "{messages>type}",
		title: "{messages>title}",
		description: "{messages>description}"
	});

	ErrorUtils._messagePopover = new MessagePopover({
		items: {
			path: "messages>/",
			template: ErrorUtils._messageTemplate
		}
	});

	/**
		 * Sets the message model.
		 * @param {Object} oComponent - input component
		 * @param {Object} oModel - input model
		 * @public
		 */
	ErrorUtils.setMessagesModel = function (oComponent, oModel) {
		ErrorUtils._masterComponent = oComponent;
		ErrorUtils._messagesModel = oModel;
		ErrorUtils._messagePopover.setModel(ErrorUtils._messagesModel, "messages");
	};

	/**
		 * Handles the press action on the message button.
		 * @param {Object} oSource - input source
		 * @public
		 */
	ErrorUtils.handleMessagePopoverPress = function (oSource) {
		ErrorUtils._messagePopover.openBy(oSource);
	};

	/**
		 * Displays error message.
		 * @param {string} sType - message type
		 * @param {string} sTitle - message title
		 * @param {string} sDescription - message description
		 * @public
		 */
	ErrorUtils.displayError = function (sType, sTitle, sDescription) {
		if (ErrorUtils._messagesModel) {
			var sMessages = ErrorUtils._messagesModel.getData();
			sMessages.push({
				type: sType || "Information",
				title: sTitle || "",
				description: sDescription || ""
			});
			ErrorUtils._messagesModel.setData(sMessages);
			// force update bindings
			ErrorUtils._masterComponent.setModel(ErrorUtils._emptyModel, "messages");
			ErrorUtils._masterComponent.setModel(ErrorUtils._messagesModel, "messages");
		}
	};

	return ErrorUtils;
});
