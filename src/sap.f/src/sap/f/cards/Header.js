/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/f/library",
	"sap/ui/core/Control",
	"sap/m/Text",
	"sap/f/Avatar",
	"sap/ui/Device",
	'sap/f/cards/DataProviderFactory',
	'sap/ui/model/json/JSONModel',
	"sap/f/cards/HeaderRenderer",
	"sap/f/cards/IconFormatter",
	"sap/f/cards/CardActions",
	"sap/base/strings/formatMessage"
], function (
	library,
	Control,
	Text,
	Avatar,
	Device,
	DataProviderFactory,
	JSONModel,
	HeaderRenderer,
	IconFormatter,
	CardActions,
	formatMessage
) {
	"use strict";

	var AvatarShape = library.AvatarShape;

	var AreaType = library.cards.AreaType;

	/**
	 * Constructor for a new <code>Header</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * Displays general information in the header of the {@link sap.f.Card}.
	 *
	 * You can configure the title, subtitle, status text and icon, using the provided properties.
	 *
	 * <b>Notes:</b>
	 * <ul>
	 * <li>You should always set a title.</li>
	 * <li>To show a KPI or any numeric information, use {@link sap.f.cards.NumericHeader} instead.</li>
	 * <ul>
	 *
	 * @extends sap.ui.core.Control
	 * @implements sap.f.cards.IHeader
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.64
	 * @alias sap.f.cards.Header
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var Header = Control.extend("sap.f.cards.Header", {
		metadata: {
			library: "sap.f",
			interfaces: ["sap.f.cards.IHeader"],
			properties: {

				/**
				 * Defines the title.
				 */
				title: { type: "string", defaultValue: "" },

				/**
				 * Defines the subtitle.
				 */
				subtitle: { type: "string", defaultValue: "" },

				/**
				 * Defines the status text.
				 */
				statusText: { type: "string", defaultValue: "" },

				/**
				 * Defines the shape of the icon.
				 */
				iconDisplayShape: { type: "sap.f.AvatarShape", defaultValue: AvatarShape.Circle },

				/**
				 * Defines the icon source.
				 */
				iconSrc: { type: "sap.ui.core.URI", defaultValue: "" },

				/**
				 * Defines the initials of the icon.
				 */
				iconInitials: { type: "string", defaultValue: "" }
			},
			aggregations: {

				/**
				 * Defines the inner title control.
				 */
				_title: { type: "sap.m.Text", multiple: false, visibility: "hidden" },

				/**
				 * Defines the inner subtitle control.
				 */
				_subtitle: { type: "sap.m.Text", multiple: false, visibility: "hidden" },

				/**
				 * Defines the inner avatar control.
				 */
				_avatar: { type: "sap.f.Avatar", multiple: false, visibility: "hidden" }
			},
			events: {

				/**
				 * Fires when the user presses the control.
				 */
				press: {}
			}
		}
	});

	/**
	 * Initialization hook.
	 * @private
	 */
	Header.prototype.init = function () {
		this._aReadyPromises = [];
		this._bReady = false;

		// So far the ready event will be fired when the data is ready. But this can change in the future.
		this._awaitEvent("_dataReady");
		this._awaitEvent("_actionHeaderReady");

		Promise.all(this._aReadyPromises).then(function () {
			this._bReady = true;
			this.fireEvent("_ready");
		}.bind(this));

		this.setBusyIndicatorDelay(0);
	};

	Header.prototype.exit = function () {
		this._oServiceManager = null;
		this._oDataProviderFactory = null;

		if (this._oDataProvider) {
			this._oDataProvider.destroy();
			this._oDataProvider = null;
		}

		if (this._oActions) {
			this._oActions.destroy();
			this._oActions = null;
		}
	};

	/**
	 * Await for an event which controls the overall "ready" state of the header.
	 *
	 * @private
	 * @param {string} sEvent The name of the event
	 */
	Header.prototype._awaitEvent = function (sEvent) {
		this._aReadyPromises.push(new Promise(function (resolve) {
			this.attachEventOnce(sEvent, function () {
				resolve();
			});
		}.bind(this)));
	};

	/**
	 * @public
	 * @returns {boolean} If the header is ready or not.
	 */
	Header.prototype.isReady = function () {
		return this._bReady;
	};

	/**
	 * Lazily creates a title and returns it.
	 * @private
	 * @returns {sap.m.Text} The inner title aggregation
	 */
	Header.prototype._getTitle = function () {
		var oTitle = this.getAggregation("_title");
		if (!oTitle) {
			oTitle = new Text({
				maxLines: 3
			}).addStyleClass("sapFCardTitle");
			this.setAggregation("_title", oTitle);
		}
		return oTitle;
	};

	/**
	 * Lazily creates a subtitle and returns it.
	 * @private
	 * @returns {sap.m.Text} The inner subtitle aggregation
	 */
	Header.prototype._getSubtitle = function () {
		var oSubtitle = this.getAggregation("_subtitle");
		if (!oSubtitle) {
			oSubtitle = new Text({
				maxLines: 2
			}).addStyleClass("sapFCardSubtitle");
			this.setAggregation("_subtitle", oSubtitle);
		}
		return oSubtitle;
	};

	/**
	 * Lazily creates an avatar control and returns it.
	 * @private
	 * @returns {sap.f.Avatar} The inner avatar aggregation
	 */
	Header.prototype._getAvatar = function () {
		var oAvatar = this.getAggregation("_avatar");
		if (!oAvatar) {
			oAvatar = new Avatar().addStyleClass("sapFCardIcon");
			this.setAggregation("_avatar", oAvatar);
		}
		return oAvatar;
	};

	/**
	 * Called before the control is rendered.
	 * @private
	 */
	Header.prototype.onBeforeRendering = function () {
		this._getTitle().setText(this.getTitle());
		this._getSubtitle().setText(this.getSubtitle());
		this._getAvatar().setDisplayShape(this.getIconDisplayShape());

		// Format the relative icon src for the integration card only.
		if (this.isInsideIntegrationCard() && this.getIconSrc()) {
			var oSrcBindingInfo = this.getBindingInfo("iconSrc");

			if (oSrcBindingInfo) {
				if (!oSrcBindingInfo.formatter) {
					oSrcBindingInfo.formatter = function (sValue) {
						return IconFormatter.formatSrc(sValue, this._sAppId);
					}.bind(this);
				}
				this._getAvatar().bindProperty("src", oSrcBindingInfo);
			} else {
				this._getAvatar().setSrc(IconFormatter.formatSrc(this.getIconSrc(), this._sAppId));
			}
		} else {
			this._getAvatar().setSrc(this.getIconSrc());
		}

		this._getAvatar().setInitials(this.getIconInitials());
	};

	/**
	 * Helper function used to create aria-labelledby attribute.
	 *
	 * @private
	 * @returns {string} IDs of controls
	 */
	Header.prototype._getHeaderAccessibility = function () {
		var sTitleId = this._getTitle() ? this._getTitle().getId() : "",
			sSubtitleId = this._getSubtitle() ? this._getSubtitle().getId() : "",
			sAvatarId = this._getAvatar() ? this._getAvatar().getId() : "";

		return sTitleId + " " + sSubtitleId + " " + sAvatarId;
	};

	/**
	 * Called after the control is rendered.
	 */
	Header.prototype.onAfterRendering = function() {
		//TODO performance will be afected, but text should clamp on IE also - TBD
		if (Device.browser.msie) {
			if (this.getTitle()) {
				this._getTitle().clampText();
			}
			if (this.getSubtitle()) {
				this._getSubtitle().clampText();
			}
		}
	};

	/**
	 * Fires the <code>sap.f.cards.Header</code> press event.
	 */
	Header.prototype.ontap = function () {
		this.firePress();
	};

	/**
	 * Fires the <code>sap.f.cards.Header</code> press event.
	 */
	Header.prototype.onsapselect = function () {
		this.firePress();
	};

	/**
	 * @returns {boolean} Wether or not the parent of the header is an integration card.
	 */
	Header.prototype.isInsideIntegrationCard = function () {
		var oParent = this.getParent();
		if (oParent && oParent.isA("sap.ui.integration.widgets.Card")) {
			return true;
		}
		return false;
	};

	/**
	 * Creates an instance of Header with the given options.
	 *
	 * @private
	 * @static
	 * @param {Object} mConfiguration A map containing the header configuration options.
	 * @param {Object} oServiceManager A service manager instance to handle services.
	 * @param {Object} oDataProviderFactory A DataProviderFactory instance.
	 * @param {string} sAppId The sap.app/id from the manifest.
	 * @return {sap.f.cards.Header} The created Header.
	 */
	Header.create = function(mConfiguration, oServiceManager, oDataProviderFactory, sAppId) {
		var mSettings = {
			title: mConfiguration.title,
			subtitle: mConfiguration.subTitle
		};

		if (mConfiguration.icon) {
			mSettings.iconSrc = mConfiguration.icon.src;
			mSettings.iconDisplayShape = mConfiguration.icon.shape;
			mSettings.iconInitials = mConfiguration.icon.text;
		}

		if (mConfiguration.status && typeof mConfiguration.status.text === "string") {
			mSettings.statusText = mConfiguration.status.text;
		}

		var oHeader = new Header(mSettings);
		oHeader._sAppId = sAppId;
		if (mConfiguration.status && mConfiguration.status.text && mConfiguration.status.text.format) {
			Header._bindStatusText(mConfiguration.status.text.format, oHeader);
		}
		oHeader.setServiceManager(oServiceManager);
		oHeader.setDataProviderFactory(oDataProviderFactory);
		oHeader._setData(mConfiguration.data);

		var oActions = new CardActions({
			areaType: AreaType.Header
		});

		oActions.attach(mConfiguration, oHeader);
		oHeader._oActions = oActions;

		return oHeader;
	};

	/**
	 * Binds the statusText of a header to the provided format configuration.
	 *
	 * @private
	 * @static
	 * @param {Object} mFormat The formatting configuration.
	 * @param {sap.f.cards.Header} oHeader The header instance.
	 */
	Header._bindStatusText = function (mFormat, oHeader) {

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
	};

	Header.prototype.setServiceManager = function (oServiceManager) {
		this._oServiceManager = oServiceManager;
		return this;
	};

	Header.prototype.setDataProviderFactory = function (oDataProviderFactory) {
		this._oDataProviderFactory = oDataProviderFactory;
		return this;
	};

	/**
	 * Sets a data provider to the header.
	 *
	 * @private
	 * @param {object} oDataSettings The data settings
	 */
	Header.prototype._setData = function (oDataSettings) {
		var sPath = "/";
		if (oDataSettings && oDataSettings.path) {
			sPath = oDataSettings.path;
		}

		this.bindObject(sPath);

		if (this._oDataProvider) {
			this._oDataProvider.destroy();
		}

		this._oDataProvider = this._oDataProviderFactory.create(oDataSettings, this._oServiceManager);

		if (this._oDataProvider) {
			this.setBusy(true);

			// If a data provider is created use an own model. Otherwise bind to the one propagated from the card.
			this.setModel(new JSONModel());

			this._oDataProvider.attachDataChanged(function (oEvent) {
				this._updateModel(oEvent.getParameter("data"));
				this.setBusy(false);
			}.bind(this));

			this._oDataProvider.attachError(function (oEvent) {
				this._handleError(oEvent.getParameter("message"));
				this.setBusy(false);
			}.bind(this));

			this._oDataProvider.triggerDataUpdate().then(function () {
				this.fireEvent("_dataReady");
			}.bind(this));
		} else {
			this.fireEvent("_dataReady");
		}
	};

	Header.prototype._updateModel = function (oData) {
		this.getModel().setData(oData);
	};

	Header.prototype._handleError = function (sLogMessage) {
		this.fireEvent("_error", { logMessage: sLogMessage });
	};

	return Header;
});