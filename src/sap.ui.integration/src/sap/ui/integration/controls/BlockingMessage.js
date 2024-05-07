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
	"sap/ui/core/Control",
	"sap/ui/core/Lib",
	"sap/ui/core/library",
	"sap/ui/core/Supportability"
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
	Control,
	Library,
	coreLibrary,
	Supportability
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
				},
				imageSrc: {
					type: "string",
					defaultValue: ""
				}
			},
			aggregations: {
				additionalContent: {
					type: "sap.m.Button",
					multiple: true,
					forwarding: {
						getter: "_getIllustratedMessage",
						aggregation: "additionalContent"
					}
				},
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
	 * @param {string} [mSettings.imageSrc] Source of the custom image
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
			httpResponse: mSettings.httpResponse,
			details: sDetails,
			additionalContent: BlockingMessage._createButtons(mSettings.additionalContent)
		});

		if (mSettings.imageSrc) {
			oBlockingMessage.setImageSrc(oCard.getRuntimeUrl(mSettings.imageSrc));
		}

		if (sDetails && Supportability.isDebugModeEnabled()) {
			oBlockingMessage.addAdditionalContent(BlockingMessage._createDetailsButton(sDetails));

			Log.error(sDetails); // @todo logging should happen at different place
		}

		return oBlockingMessage;
	};

	/**
	 * Static method which creates all the buttons from the additionalContent settings.
	 * @param {array} aAdditionalContentSettings The additionalContent settings.
	 * @returns {sap.m.Button[]} An array of buttons.
	 */
	BlockingMessage._createButtons = function (aAdditionalContentSettings) {
		const aButtons = aAdditionalContentSettings || [];

		return aButtons.map((mButtonSettings) => {
			return new Button({
				text: mButtonSettings.text,
				icon: mButtonSettings.icon,
				tooltip: mButtonSettings.tooltip,
				type: mButtonSettings.buttonType,
				ariaHasPopup: mButtonSettings.ariaHasPopup,
				press: mButtonSettings.press
			});
		});
	};

	/**
	 * Static method which creates the button to show additional details in a dialog.
	 * @param {string} sDetails The details.
	 * @returns {sap.m.Button} The button.
	 */
	BlockingMessage._createDetailsButton = function (sDetails) {
		var oRb = Library.getResourceBundleFor("sap.ui.integration");

		return new Button({
			text: oRb.getText("CARD_BUTTON_SHOW_MORE"),
			press: function () {
				var oText = new Text({
					renderWhitespace: true,
					text: sDetails
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
			}
		});
	};

	BlockingMessage.prototype.onBeforeRendering = function () {
		var oIllustratedMessage = this._getIllustratedMessage();

		oIllustratedMessage
			.setIllustrationType(this.getIllustrationType())
			.setIllustrationSize(this.getIllustrationSize())
			.setTitle(this.getTitle())
			.setDescription(this.getDescription());
	};

	/**
	 * Creates lazily the illustrated message which is shown.
	 * @returns {sap.m.IllustratedMessage} The illustrated message.
	 */
	BlockingMessage.prototype._getIllustratedMessage = function () {
		let oIllustratedMessage = this.getAggregation("_illustratedMessage");

		if (!oIllustratedMessage) {
			oIllustratedMessage = new IllustratedMessage({
				enableDefaultTitleAndDescription: false,
				enableVerticalResponsiveness: true
			});

			oIllustratedMessage.addEventDelegate({
				onAfterRendering: this._illustrationAfterRendering.bind(this)
			});

			this.setAggregation("_illustratedMessage", oIllustratedMessage);
		}

		return oIllustratedMessage;
	};

	BlockingMessage.prototype._illustrationAfterRendering = function () {
		const sCustomImageSrc = this.getImageSrc();

		if (!sCustomImageSrc ) {
			return;
		}

		const oIllustration = this.getAggregation("_illustratedMessage").getDomRef().getElementsByClassName("sapMIllustratedMessageMainContent")[0];
		const oIllustrationSvg = oIllustration.getElementsByTagName("svg")[0];
		const oSvgRect = oIllustrationSvg.getBoundingClientRect();
		const oCustomImageContainer = document.createElement("div");

		oCustomImageContainer.classList.add("sapUiIntCardCustomImage");
		oIllustration.append(oCustomImageContainer);

		oCustomImageContainer.style.backgroundImage = "url(" + sCustomImageSrc + ")";
		oCustomImageContainer.style.width = oSvgRect.width + "px";
		oCustomImageContainer.style.height = oSvgRect.height + "px";
	};

	/**
	 * @private
	 * @ui5-restricted sap.ui.integration
	 * @returns {Object} The static configuration for the blocking message
	 */
	BlockingMessage.prototype.getStaticConfiguration = function () {
		return {
			type: this.getType() === CardBlockingMessageType.NoData ? "noData" : "error",
			illustrationType: this.getIllustrationType(),
			illustrationSize: this.getIllustrationSize(),
			title: this.getTitle(),
			description: this.getDescription() ? this.getDescription() : undefined,
			details: this.getDetails() ? this.getDetails() : undefined
		};
	};

	return BlockingMessage;
});