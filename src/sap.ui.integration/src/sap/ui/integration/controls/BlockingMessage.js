/*!
* ${copyright}
*/

sap.ui.define([
	"../library",
	"sap/base/Log",
	"sap/m/Bar",
	"sap/m/Button",
	"sap/m/Dialog",
	"sap/m/IllustratedMessage",
	"sap/m/IllustratedMessageType",
	"sap/m/IllustratedMessageSize",
	"sap/m/Title",
	"sap/m/Text",
	"sap/ui/Device",
	"sap/ui/core/Core",
	"sap/ui/core/Configuration",
	"sap/ui/core/Control",
	"sap/ui/core/library"
], function (
	library,
	Log,
	Bar,
	Button,
	Dialog,
	IllustratedMessage,
	IllustratedMessageType,
	IllustratedMessageSize,
	Title,
	Text,
	Device,
	Core,
	Configuration,
	Control,
	coreLibrary
) {
	"use strict";

	var TitleLevel = coreLibrary.TitleLevel;
	var CardBlockingMessageType = library.CardBlockingMessageType;

	/**
	 * Constructor for a new BlockingMessage.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 *
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @private
	 * @since 1.114
	 * @alias sap.ui.integration.controls.BlockingMessage
	 */
	var BlockingMessage = Control.extend("sap.ui.integration.controls.BlockingMessage", {
		metadata: {
			library: "sap.ui.integration",
			properties: {
				type: {
					type: "sap.ui.integration.CardBlockingMessageType",
					defaultValue: CardBlockingMessageType.Information
				},
				height: {
					type: "sap.ui.core.CSSSize",
					defaultValue: ""
				},
				illustrationType: {
					type: "string",
					defaultValue: "ErrorScreen"
				},
				illustrationSize: {
					type: "sap.m.IllustratedMessageSize",
					defaultValue: IllustratedMessageSize.Auto
				},
				title: {
					type: "string",
					defaultValue: ""
				},
				description: {
					type: "string",
					defaultValue: ""
				},
				details: {
					type: "string",
					defaultValue: ""
				},
				httpResponse: {
					type: "object",
					defaultValue: null
				}
			},
			aggregations: {
				_illustratedMessage: {
					type: "sap.m.IllustratedMessage",
					multiple: false
				}
			},
			associations : {
				/**
				 * The card.
				 */
				card: {
					type : "sap.ui.integration.widgets.Card",
					multiple: false
				}
			}
		},
		renderer: {
			apiVersion: 2,
			render: function (oRm, oControl) {
				oRm.openStart("div", oControl)
					.class("sapUiIntBlockingMsg");

				if (oControl.getHeight()) {
					oRm.style("height", oControl.getHeight());
				}

				oRm.openEnd();

				oRm.renderControl(oControl.getAggregation("_illustratedMessage"));

				oRm.close("div");
			}
		}
	});

	/**
	 * @param {object} mSettings Message settings
	 * @param {sap.ui.integration.CardBlockingMessageType} mSettings.type The type of the message
	 * @param {string} [mSettings.illustrationType] Illustration type
	 * @param {sap.m.IllustratedMessageSize} [mSettings.illustrationSize] Illustration size
	 * @param {string} [mSettings.title] Message title
	 * @param {string} [mSettings.description] Message description
	 * @param {string} [mSettings.details] Message details
	 * @param {Response} [mSettings.httpResponse] Response object
	 * @param {sap.ui.integration.widgets.Card} oCard The card for which the message is created
	 * @returns {sap.ui.integration.controls.BlockingMessage} The message
	 */
	BlockingMessage.create = function (mSettings, oCard) {
		var sIllustratedMessageType = mSettings.illustrationType,
			sIllustratedMessageSize = mSettings.illustrationSize || IllustratedMessageSize.Auto,
			sBoxHeight = "100%",
			sTitle = mSettings.title,
			sDescription =  mSettings.description,
			sDetails = mSettings.details;

		if (mSettings.type === CardBlockingMessageType.Error) {
			sIllustratedMessageType = sIllustratedMessageType || IllustratedMessageType.ErrorScreen;
		} else if (mSettings.type === CardBlockingMessageType.NoData) {
			sIllustratedMessageType = sIllustratedMessageType || IllustratedMessageType.NoData;
		}

		oCard._oContentMessage = {
			type: mSettings.type === CardBlockingMessageType.NoData ? "noData" : "error",
			illustrationType: sIllustratedMessageType,
			illustrationSize: sIllustratedMessageSize,
			title: sTitle,
			description: sDescription,
			details: sDetails
		};

		if (oCard.getCardContent() && oCard.getCardContent().getDomRef()) {
			sBoxHeight = oCard.getCardContent().getDomRef().offsetHeight + "px";
		}

		var oBlockingMessage = new BlockingMessage({
			type: mSettings.type,
			height: sBoxHeight,
			illustrationType: sIllustratedMessageType,
			illustrationSize: sIllustratedMessageSize,
			title: sTitle,
			description: sDescription,
			httpResponse: mSettings.httpResponse
		});

		if (sDetails && Configuration.getDebug()) {
			oBlockingMessage.setDetails(sDetails);
		} else if (sDetails) {
			Log.error(sDetails);
		}

		return oBlockingMessage;
	};

	BlockingMessage.prototype.init = function () {
		this.setAggregation("_illustratedMessage", new IllustratedMessage({
			enableDefaultTitleAndDescription: false,
			enableVerticalResponsiveness: true
		}));
	};

	BlockingMessage.prototype.onBeforeRendering = function () {
		var oIllustratedMessage = this.getAggregation("_illustratedMessage");

		oIllustratedMessage
			.setIllustrationType(this.getIllustrationType())
			.setIllustrationSize(this.getIllustrationSize())
			.setTitle(this.getTitle())
			.setDescription(this.getDescription())
			.destroyAdditionalContent();

		if (this.getDetails()) {
			oIllustratedMessage.addAdditionalContent(this._getAdditionalContent());
		}
	};

	BlockingMessage.prototype._getAdditionalContent = function () {
		var oRb = Core.getLibraryResourceBundle("sap.ui.integration");

		return new Button({
			text: oRb.getText("CARD_BUTTON_SHOW_MORE"),
			press: function () {
				var oText = new Text({
					renderWhitespace: true,
					text: this.getDetails()
				}).addStyleClass("sapUiSmallMargin");

				var oDialog = new Dialog({
					stretch: Device.system.phone,
					customHeader: new Bar({
						contentMiddle: new Title({
							text: oRb.getText("CARD_ERROR_DIALOG_TITLE"),
							level: TitleLevel.H1
						}),
						contentRight: new Button({
							icon: "sap-icon://copy",
							tooltip: oRb.getText("CARD_TEXT_COPY"),
							press: function () {
								var oRange = document.createRange(),
									oTextDomRef = oText.getDomRef();

								oRange.selectNode(oTextDomRef);
								window.getSelection().removeAllRanges(); // clear current selection
								window.getSelection().addRange(oRange); // to select text
								window.navigator.clipboard.writeText(oTextDomRef.textContent);
							}
						})
					}),
					content: [oText],
					buttons: [
						new Button({
							text: oRb.getText("CARD_DIALOG_CLOSE_BUTTON"),
							press: function () {
								oDialog.close();
							}
						})
					],
					afterClose: function () {
						oDialog.destroy();
					}
				});

				oDialog.open();
			}.bind(this)
		});
	};

	return BlockingMessage;
});