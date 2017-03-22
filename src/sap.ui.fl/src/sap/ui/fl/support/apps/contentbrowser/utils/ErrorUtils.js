/*!
 * ${copyright}
 */

sap.ui.define("sap/ui/fl/support/apps/contentbrowser/utils/ErrorUtils",[
	"sap/m/MessagePopoverItem",
	"sap/m/MessagePopover"],
	function (MessagePopoverItem, MessagePopover) {
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
		ErrorUtils._emptyModel = new sap.ui.model.json.JSONModel([]);

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
		 * @param {String} sType - message type
		 * @param {String} sTitle - message title
		 * @param {String} sDescription - message description
		 * @public
		 */
		ErrorUtils.displayError = function (sType, sTitle, sDescription) {
			if (ErrorUtils._messagesModel) {
				var sMessages = ErrorUtils._messagesModel.getData();
				sMessages.push({
					"type": sType || "Information",
					"title": sTitle || "",
					"description": sDescription || ""
				});
				ErrorUtils._messagesModel.setData(sMessages);
				// force update bindings
				ErrorUtils._masterComponent.setModel(ErrorUtils._emptyModel, "messages");
				ErrorUtils._masterComponent.setModel(ErrorUtils._messagesModel, "messages");
			}
		};

		return ErrorUtils;
});
