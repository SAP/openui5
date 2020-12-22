/*!
 * ${copyright}
 */
sap.ui.define([
	"./BaseFactory",
	"./CardActions",
	"sap/ui/integration/library",
	"sap/ui/integration/cards/NumericHeader",
	"sap/ui/integration/cards/Header",
	"sap/base/strings/formatMessage"
], function (
	BaseFactory,
	CardActions,
	library,
	NumericHeader,
	Header,
	formatMessage
) {
	"use strict";

	var ActionArea = library.CardActionArea;

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
		var oHeader,
			oCard = this._oCard,
			oActions = new CardActions({
				card: oCard
			});

		mConfiguration = this.createBindingInfos(mConfiguration, oCard.getBindingNamespaces());

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
			if (mConfiguration.status.text.format.translationKey) {
				oCard._loadDefaultTranslations();
			}

			bindStatusText(mConfiguration.status.text.format, oHeader);
		}

		oHeader.setServiceManager(oCard._oServiceManager);
		oHeader.setDataProviderFactory(oCard._oDataProviderFactory);
		oHeader._setDataConfiguration(mConfiguration.data);

		oActions.attach({
			area: ActionArea.Header,
			actions: mConfiguration.actions,
			control: oHeader
		});
		oHeader._oActions = oActions;

		if (oHeader._bIsEmpty) {
			oHeader.setVisible(oToolbar.getVisible());
		}

		return oHeader;
	};

	return HeaderFactory;
});
