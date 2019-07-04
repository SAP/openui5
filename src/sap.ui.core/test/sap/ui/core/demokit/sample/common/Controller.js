/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/m/Button",
	"sap/m/Link",
	"sap/m/library",
	"sap/m/MessageItem",
	"sap/m/MessagePopover",
	"sap/m/ResponsivePopover",
	"sap/m/TextArea",
	"sap/ui/core/mvc/Controller",
	"sap/ui/util/XMLHelper"
], function (Button, Link, library, MessageItem, MessagePopover, ResponsivePopover, TextArea,
		Controller, XMLHelper) {
	"use strict";

	// shortcut for sap.m.PlacementType
	var PlacementType = library.PlacementType;

	return Controller.extend("sap.ui.core.sample.common.Controller", {
	/**
		 * Function is called by <code>onSourceCode</code> to modify source code before it is pretty
		 * printed.
		 *
		 * @param {string} sSourceCode The source code
		 * @returns {string} The modified source code
		 */
		beforePrettyPrinting : function (sSourceCode) {
			return sSourceCode;
		},

		/**
		 * Creates a new sap.m.MessagePopover within the controller which is bound to the global
		 * sap.ui.model.message.MessageModel. The MessagePopover listens to MessageModel changes
		 * and will be automatically opened for new error messages.
		 *
		 * @param {string} sOpenButtonId
		 *   The ID of the Button where the MessagePopover has to be opened
		 *
		 */
		initMessagePopover : function (sOpenButtonId) {
			this.messagePopover = new MessagePopover({
				items : {
					path :"messages>/",
					template : new MessageItem({
						// Note: We need the details page in order to show a technical details link.
						// The message popover only shows the details page if at least description
						// or longtextUrl exists. Hence we here set description to ' '.
						description : " ",
						longtextUrl : "{messages>descriptionUrl}",
						title : "{messages>message}",
						type : "{messages>type}",
						link : new Link({
							customData : {
								Type : "sap.ui.core.CustomData",
								key : "technicalDetails",
								value : "{messages>technicalDetails}" // bind custom data
							},
							id : "technicalDetailsLink",
							press : function (oEvent) {
								var oButton = new Button({
										icon : "sap-icon://decline",
										text : "Close",
										tooltip : "Close Technical Details"
									}),
									oLink = oEvent.getSource(),
									oPopover = new ResponsivePopover({
										endButton : oButton,
										modal : true,
										placement : PlacementType.Auto,
										title: "Technical Details"
									}),
									oTechnicalDetails = oLink.data("technicalDetails"),
									oText = new TextArea({
										editable : false,
										growing : true,
										width : "100%"
									});

								oButton.attachPress(function() {
									oPopover.close();
								});
								oText.setValue(JSON.stringify(oTechnicalDetails, null, "\t"));
								oPopover.addContent(oText);
								oPopover.openBy(oLink);
							},
							text : "Technical Details",
							visible : "{= !!${messages>technicalDetails} }"
						})
					}),
					templateShareable : false
				}
			});
			this.messagePopoverButtonId = sOpenButtonId;

			/*
			 * Listens to all changes in the message model, decides whether to open the message
			 * popover and updates <code>iMessages</code> within the UI model.
			 *
			 * @param {object} oEvent
			 *   The change event
			 *
			 */
			function handleMessagesChange(oEvent) {
				var aMessageContexts = oEvent.getSource().getCurrentContexts(),
					oView = this.getView();

				function isWorthy(aMessageContexts) {
					return aMessageContexts.some(function (oContext) {
						return oContext.getObject().technical === true;
					});
				}

				if (!this.messagePopover.isOpen() && isWorthy(aMessageContexts)) {
					this.messagePopover.openBy(this.byId(this.messagePopoverButtonId));
				}
				if (oView.getModel("ui")
					&& oView.getModel("ui").getProperty("/iMessages") !== undefined) {
					oView.getModel("ui").setProperty("/iMessages", aMessageContexts.length);
				}
			}

			this.messagePopover.setModel(sap.ui.getCore().getMessageManager().getMessageModel(),
				"messages");
			this.messagePopover.getBinding("items").attachChange(handleMessagesChange, this);
			this.messagePopover.attachAfterClose(function (oEvent) {
				var oMessageManager = sap.ui.getCore().getMessageManager(),
					aMessages;

				// remove all bound messages which have to be handled by the application
				aMessages = oMessageManager.getMessageModel().getData().filter(function (oMessage) {
					return oMessage.persistent;
				});
				oMessageManager.removeMessages(aMessages);
			});
		},

		/**
		 * Destroys the MessagePopover when the controller is destroyed.
		 */
		onExit : function () {
			if (this.messagePopover) {
				this.messagePopover.destroy();
			}
		},

		/**
		 * Sets "ui>/bCodeVisible" based on the event source's pressed state and if it is pressed,
		 * gets the source code of the view after templating, pretty prints it and puts the result
		 * into "ui>/sCode".
		 *
		 * @param {object} oEvent
		 *   The event object with a <code>sap.m.ToggleButton</code> as source. If no event is
		 *   given, "ui>/bCodeVisible" keeps unchanged.
		 */
		onSourceCode : function (oEvent) {
			var oView = this.getView(),
				oUIModel = oView.getModel("ui"),
				bVisible = oEvent && oEvent.getSource().getPressed(),
				sSource;

			if (bVisible === undefined) {
				bVisible = oUIModel.getProperty("/bCodeVisible");
			} else {
				oUIModel.setProperty("/bCodeVisible", bVisible);
			}
			if (bVisible) {
				sSource = this.beforePrettyPrinting(XMLHelper.serialize(oView._xContent))
					.replace(/<!--(.|\s)*?-->/g, "") // remove comments
					.replace(/\{\s*/g, "{") // remove unnecessary whitespaces in complex binding
					.replace(/,\s*/g, ", ") // remove unnecessary whitespaces in complex binding
					.replace(/&gt;/g, ">") // decode >
					.replace(/&quot;/g, "'") // decode '
					.replace(/\t/g, "  ") // indent by just 2 spaces
					.replace(/\n\s*\n/g, "\n"); // remove empty lines

				oView.getModel("ui").setProperty("/sCode", sSource);
			}
		},

		/**
		 * Opens or closes the MessagePopover on demand if it was initializied via
		 * initMessagePopover.
		 */
		onToggleMessagePopover: function () {
			this.messagePopover.toggle(this.byId(this.messagePopoverButtonId));
		}
	});

});