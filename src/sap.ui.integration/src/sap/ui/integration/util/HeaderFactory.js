/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/thirdparty/jquery",
	"sap/ui/integration/library",
	"sap/ui/base/Object",
	"sap/ui/integration/cards/BindingHelper",
	"sap/f/cards/NumericHeader",
	"sap/f/cards/Header",
	"sap/f/cards/NumericSideIndicator",
	"sap/f/cards/IconFormatter",
	"sap/base/strings/formatMessage",
	"sap/ui/integration/controls/ActionsToolbar",
	"./CardActions"
], function (
	jQuery,
	library,
	BaseObject,
	BindingHelper,
	NumericHeader,
	Header,
	NumericSideIndicator,
	IconFormatter,
	formatMessage,
	ActionsToolbar,
	CardActions
) {
	"use strict";

	var AreaType = library.AreaType;

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
	 * @extends sap.ui.base.Object
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @private
	 * @alias sap.ui.integration.util.HeaderFactory
	 */
	var HeaderFactory = BaseObject.extend("sap.ui.integration.util.HeaderFactory", {
		metadata: {
			library: "sap.ui.integration"
		},
		constructor: function (oCard) {
			BaseObject.call(this);

			this._oCard = oCard;
		}
	});

	HeaderFactory.prototype.create = function (mConfiguration) {

		if (!mConfiguration) {
			return null;
		}

		var oHeader,
			oCard = this._oCard,
			oServiceManager = oCard._oServiceManager,
			oDataProviderFactory = oCard._oDataProviderFactory,
			sAppId = oCard._sAppId,
			oActions = new CardActions({
				card: oCard,
				areaType: AreaType.Header
			}),
			mSettings = {
				title: mConfiguration.title,
				subtitle: mConfiguration.subTitle
			},
			oActionsToolbar;

		if (mConfiguration.status && typeof mConfiguration.status.text === "string") {
			mSettings.statusText = mConfiguration.status.text;
		}

		switch (mConfiguration.type) {
			case "Numeric":

				jQuery.extend(mSettings, {
					unitOfMeasurement: mConfiguration.unitOfMeasurement,
					details: mConfiguration.details,
					sideIndicators: mConfiguration.sideIndicators
				});

				if (mConfiguration.mainIndicator) {
					mSettings.number = mConfiguration.mainIndicator.number;
					mSettings.scale = mConfiguration.mainIndicator.unit;
					mSettings.trend = mConfiguration.mainIndicator.trend;
					mSettings.state = mConfiguration.mainIndicator.state; // TODO convert ValueState to ValueColor
				}

				mSettings = BindingHelper.createBindingInfos(mSettings);

				if (mConfiguration.sideIndicators) {
					mSettings.sideIndicators = mSettings.sideIndicators.map(function (mIndicator) { // TODO validate that it is an array and with no more than 2 elements
						return new NumericSideIndicator(mIndicator);
					});
				}

				oHeader = new NumericHeader(mSettings);
				break;
			default:
				if (mConfiguration.icon) {
					mSettings.iconSrc = mConfiguration.icon.src;
					mSettings.iconDisplayShape = mConfiguration.icon.shape;
					mSettings.iconInitials = mConfiguration.icon.text;
				}

				mSettings = BindingHelper.createBindingInfos(mSettings);

				if (mSettings.iconSrc) {
					mSettings.iconSrc = BindingHelper.formattedProperty(mSettings.iconSrc, function (sValue) {
						return IconFormatter.formatSrc(sValue, sAppId);
					});
				}

				oHeader = new Header(mSettings);
				break;
		}

		if (mConfiguration.status && mConfiguration.status.text && mConfiguration.status.text.format) {
			if (mConfiguration.status.text.format.translationKey) {
				oCard._loadDefaultTranslations();
			}

			bindStatusText(mConfiguration.status.text.format, oHeader);
		}

		oHeader._sAppId = sAppId;
		oHeader.setServiceManager(oServiceManager);
		oHeader.setDataProviderFactory(oDataProviderFactory);
		oHeader._setData(mConfiguration.data);

		oActions.attach(mConfiguration, oHeader);
		oHeader._oActions = oActions;

		oActionsToolbar = this._createActionsToolbar();
		if (oActionsToolbar) {
			oHeader.setToolbar(oActionsToolbar);
		}

		return oHeader;
	};

	HeaderFactory.prototype._createActionsToolbar = function () {
		var oCard = this._oCard,
			oHost = oCard.getHostInstance(),
			oActionsToolbar,
			bHasActions;

		if (!oHost) {
			return null;
		}

		oActionsToolbar = new ActionsToolbar();
		bHasActions = oActionsToolbar.initializeContent(oHost, oCard);

		if (bHasActions) {
			return oActionsToolbar;
		}

		return null;
	};

	return HeaderFactory;
});
