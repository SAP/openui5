/*!
 * ${copyright}
 */
sap.ui.define([
	"./BaseFactory",
	"sap/base/Log",
	"sap/base/util/isEmptyObject",
	"sap/ui/core/Lib",
	"sap/ui/integration/cards/actions/CardActions",
	"sap/ui/integration/cards/actions/NavigationAction",
	"sap/ui/integration/library",
	"sap/m/library",
	"sap/ui/integration/cards/NumericHeader",
	"sap/ui/integration/cards/Header",
	"sap/ui/integration/util/Utils",
	"sap/m/Button"
], function (
	BaseFactory,
	Log,
	isEmptyObject,
	Library,
	CardActions,
	NavigationAction,
	library,
	mLibrary,
	NumericHeader,
	Header,
	Utils,
	Button
) {
	"use strict";

	var ActionArea = library.CardActionArea;

	var ActionType = library.CardActionType;

	var ButtonType = mLibrary.ButtonType;

	var CardDisplayVariant = library.CardDisplayVariant;

	var oResourceBundle = Library.getResourceBundleFor("sap.ui.integration");

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
			oToolbar = this._createCloseButton(mConfiguration);
		}

		if (oCard.isCompactHeader()) {
			mConfiguration.type = "";
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
			this._setTileDisplayDefaults(oHeader, mConfiguration);
		} else if (oCard.isHeaderDisplayVariant()) {
			this._setHeaderDisplayDefaults(oHeader, mConfiguration);
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
			//if card is in a dialog - aria-level of the header should be 1
			oHeader.setProperty("headingLevel", "1");
		}

		return oHeader;
	};

	HeaderFactory.prototype._createCloseButton = function (mConfiguration) {
		var bVisible = true;
		if (mConfiguration.closeButton && "visible" in mConfiguration.closeButton) {
			bVisible = mConfiguration.closeButton.visible;
		}

		var oButton = new Button({
			type: ButtonType.Transparent,
			tooltip: oResourceBundle.getText("CARD_DIALOG_CLOSE_BUTTON"),
			visible: bVisible,
			icon: "sap-icon://decline",
			press: function () {
				this._oCard.hide();
			}.bind(this)
		});

		return oButton;
	};

	HeaderFactory.prototype._setTileDisplayDefaults = function (oHeader, mConfiguration) {
		oHeader.setProperty("useTileLayout", true);
		oHeader.setProperty("useTooltips", true);

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

		if (oHeader.isA("sap.f.cards.NumericHeader")) {
			oHeader.getSideIndicators().forEach((oSideIndicator) => {
				oSideIndicator.setProperty("useTooltips", true);
			});
		}

		const vAction = mConfiguration.actions && mConfiguration.actions[0];
		const vHref = vAction?.parameters?.url;
		const vTarget = vAction?.parameters?.target;

		if (vAction?.type === ActionType.Navigation && vHref) {
			oHeader.applySettings({
				href: vHref,
				target: vTarget || NavigationAction.DEFAULT_TARGET,
				interactive: true
			});
		}
	};

	HeaderFactory.prototype._setHeaderDisplayDefaults = function (oHeader, mConfiguration) {
		const oCard = this._oCard;
		oHeader.setProperty("useTooltips", true);

		if (oCard.isCompactHeader()) {
			oHeader.setProperty("useTooltips", true);
			oHeader.setIconSize("XS");
			oHeader.setTitleMaxLines(1);
			oHeader.setSubtitleMaxLines(1);
			oHeader.setStatusVisible(false);
			return;
		}

		const bIsSmall = oCard.isSmallHeader();

		if (!mConfiguration.titleMaxLines) {
			oHeader.setTitleMaxLines(bIsSmall ? 1 : 2);
		}

		if (bIsSmall) {
			if (oHeader.isA("sap.f.cards.NumericHeader")) {
				oHeader.setIconSize("XS");
				oHeader.setNumberSize("S");
			}

			if (!mConfiguration.subtitleMaxLines) {
				oHeader.setSubtitleMaxLines(1);
			}
		}

		if (oHeader.isA("sap.f.cards.NumericHeader")) {
			oHeader.getSideIndicators().forEach((oSideIndicator) => {
				oSideIndicator.setProperty("useTooltips", true);
			});
		}
	};

	return HeaderFactory;
});