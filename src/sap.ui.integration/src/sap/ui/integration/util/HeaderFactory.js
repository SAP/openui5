/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/Core",
	"./BaseFactory",
	"sap/ui/integration/cards/actions/CardActions",
	"sap/ui/integration/library",
	"sap/m/library",
	"sap/ui/integration/cards/NumericHeader",
	"sap/ui/integration/cards/Header",
	"sap/base/strings/formatMessage",
	"sap/m/Button"
], function (
	Core,
	BaseFactory,
	CardActions,
	library,
	mLibrary,
	NumericHeader,
	Header,
	formatMessage,
	Button
) {
	"use strict";

	var ActionArea = library.CardActionArea;

	var ButtonType = mLibrary.ButtonType;

	var oResourceBundle = Core.getLibraryResourceBundle("sap.ui.integration");

	/**
	 * Binds the statusText of a header to the provided format configuration.
	 *
	 * @private
	 * @param {Object} mFormat The formatting configuration.
	 * @param {sap.f.cards.IHeader} oHeader The header instance.
	 */
	function bindStatusText(mFormat, oHeader) {

		if (mFormat.parts && mFormat.translationKey && mFormat.parts.length === 2) {
			var oBindingInfo = {
				parts: [
					mFormat.translationKey,
					mFormat.parts[0].toString(),
					mFormat.parts[1].toString()
				],
				formatter: function (sText, vParam1, vParam2) {
					var sParam1 = vParam1 || mFormat.parts[0];
					var sParam2 = vParam2 || mFormat.parts[1];

					if (Array.isArray(vParam1)) {
						sParam1 = vParam1.length;
					}
					if (Array.isArray(vParam2)) {
						sParam2 = vParam2.length;
					}

					var iParam1 = parseFloat(sParam1) || 0;
					var iParam2 = parseFloat(sParam2) || 0;

					return formatMessage(sText, [iParam1, iParam2]);
				}
			};

			oHeader.bindProperty("statusText", oBindingInfo);
		}
	}

	/**
	 * Constructor for a new <code>HeaderFactory</code>.
	 *
	 * @class
	 *
	 * @extends sap.ui.integration.util.BaseFactory
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @private
	 * @alias sap.ui.integration.util.HeaderFactory
	 */
	var HeaderFactory = BaseFactory.extend("sap.ui.integration.util.HeaderFactory");

	HeaderFactory.prototype.create = function (mConfiguration, oToolbar) {
		var oCard = this._oCard,
			bIsInDialog = oCard.getOpener(),
			oHeader;

		mConfiguration = this.createBindingInfos(mConfiguration, oCard.getBindingNamespaces());

		if (bIsInDialog) {
			oToolbar = this._createCloseButton();
		}

		switch (mConfiguration.type) {
			case "Numeric":
				oHeader = new NumericHeader(mConfiguration, oToolbar);
				break;
			default:
				oHeader = new Header(mConfiguration, oToolbar, oCard._oIconFormatter);
				break;
		}

		oHeader.setCard(oCard);

		if (mConfiguration.status &&
			mConfiguration.status.text &&
			mConfiguration.status.text.format) {
			bindStatusText(mConfiguration.status.text.format, oHeader);
		}

		oHeader.setServiceManager(oCard._oServiceManager);
		oHeader.setDataProviderFactory(oCard._oDataProviderFactory);
		oHeader._setDataConfiguration(mConfiguration.data);

		var oActions = new CardActions({
			card: oCard
		});

		oActions.attach({
			area: ActionArea.Header,
			actions: mConfiguration.actions,
			control: oHeader
		});
		oHeader._oActions = oActions;

		if (oHeader._bIsEmpty) {
			oHeader.setVisible(oToolbar.getVisible());
		}

		if (bIsInDialog) {
			// if card is in dialog - header shouldn't be focusable
			oHeader.setProperty("focusable", false);
		}

		return oHeader;
	};

	HeaderFactory.prototype._createCloseButton = function () {
		var oButton = new Button({
			type: ButtonType.Transparent,
			tooltip: oResourceBundle.getText("CARD_DIALOG_CLOSE_BUTTON"),
			icon: "sap-icon://decline",
			press: function () {
				this._oCard.hide();
			}.bind(this)
		});

		oButton
			.addStyleClass("sapUiIntCardCloseButton");

		return oButton;
	};

	return HeaderFactory;
});