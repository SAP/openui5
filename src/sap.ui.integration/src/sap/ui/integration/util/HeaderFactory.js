/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/Core",
	"./BaseFactory",
	"sap/base/Log",
	"sap/base/util/isEmptyObject",
	"sap/ui/integration/cards/actions/CardActions",
	"sap/ui/integration/library",
	"sap/m/library",
	"sap/ui/integration/cards/NumericHeader",
	"sap/ui/integration/cards/Header",
	"sap/ui/integration/util/Utils",
	"sap/m/Button"
], function (
	Core,
	BaseFactory,
	Log,
	isEmptyObject,
	CardActions,
	library,
	mLibrary,
	NumericHeader,
	Header,
	Utils,
	Button
) {
	"use strict";

	var ActionArea = library.CardActionArea;

	var ButtonType = mLibrary.ButtonType;

	var CardDisplayVariant = library.CardDisplayVariant;

	var oResourceBundle = Core.getLibraryResourceBundle("sap.ui.integration");

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
		if (isEmptyObject(mConfiguration)) {
			Log.warning("Card sap.card/header entry in the manifest is mandatory", "sap.ui.integration.widgets.Card");
			return null;
		}

		var oCard = this._oCard,
			sId = oCard.getId() + "-header",
			bIsInDialog = oCard.getOpener(),
			oBindingInfo,
			oHeader;

		mConfiguration = this.createBindingInfos(mConfiguration, oCard.getBindingNamespaces());

		if (bIsInDialog) {
			oToolbar = this._createCloseButton();
		}

		switch (mConfiguration.type) {
			case "Numeric":
				oHeader = new NumericHeader(sId, mConfiguration, oToolbar, oCard._oIconFormatter);
				break;
			default:
				oHeader = new Header(sId, mConfiguration, oToolbar, oCard._oIconFormatter);
				break;
		}

		oHeader.setCard(oCard);

		if (mConfiguration.status &&
			mConfiguration.status.text &&
			mConfiguration.status.text.format) {

			oBindingInfo = Utils.getStatusTextBindingInfo(mConfiguration.status.text.format, oHeader);
			if (oBindingInfo) {
				oHeader.bindProperty("statusText", oBindingInfo);
			}
		}

		oHeader.setServiceManager(oCard._oServiceManager);
		oHeader.setDataProviderFactory(oCard._oDataProviderFactory);
		oHeader._setDataConfiguration(mConfiguration.data);

		if (oCard.isTileDisplayVariant()) {
			this._setTileDefaults(oHeader, mConfiguration);
		}

		var oActions = new CardActions({
			card: oCard
		});

		oActions.attach({
			area: ActionArea.Header,
			enabledPropertyName: "interactive",
			actions: mConfiguration.actions,
			control: oHeader
		});
		oHeader._oActions = oActions;

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

		return oButton;
	};

	HeaderFactory.prototype._setTileDefaults = function (oHeader, mConfiguration) {
		oHeader.setProperty("useTileLayout", true);

		const oCard = this._oCard;
		const bIsFlatTile = [CardDisplayVariant.TileFlat, CardDisplayVariant.TileFlatWide].indexOf(oCard.getDisplayVariant()) > -1;

		if (!mConfiguration.titleMaxLines) {
			oHeader.setTitleMaxLines(bIsFlatTile ? 1 : 2);
		}

		if (bIsFlatTile) {
			oHeader.setIconSize("XS");

			if (oHeader.isA("sap.f.cards.NumericHeader")) {
				oHeader.setNumberSize("S");
			}

			if (!mConfiguration.subtitleMaxLines) {
				oHeader.setSubtitleMaxLines(1);
			}
		}
	};

	return HeaderFactory;
});