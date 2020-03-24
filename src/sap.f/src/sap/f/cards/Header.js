/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/m/library",
	"sap/f/library",
	"sap/ui/core/Control",
	"sap/m/Text",
	"sap/f/Avatar",
	"sap/ui/Device",
	'sap/ui/model/json/JSONModel',
	"sap/f/cards/HeaderRenderer",
	"sap/f/cards/IconFormatter",
	"sap/ui/core/Core",
	"sap/f/cards/loading/LoadingProvider"
], function (
	mLibrary,
	library,
	Control,
	Text,
	Avatar,
	Device,
	JSONModel,
	HeaderRenderer,
	IconFormatter,
	Core,
	LoadingProvider
) {
	"use strict";

	var AvatarShape = mLibrary.AvatarShape;

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
				iconDisplayShape: { type: "sap.m.AvatarShape", defaultValue: AvatarShape.Circle },

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
				 * Defines the toolbar.
				 * @experimental Since 1.75
				 * @since 1.75
				 */
				toolbar: { type: "sap.ui.core.Control", multiple: false },

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
		this._oRb = Core.getLibraryResourceBundle("sap.f");
		this._aReadyPromises = [];
		this._bReady = false;

		// So far the ready event will be fired when the data is ready. But this can change in the future.
		this._awaitEvent("_dataReady");
		this._awaitEvent("_actionHeaderReady");

		Promise.all(this._aReadyPromises).then(function () {
			this._bReady = true;
			this.fireEvent("_ready");
		}.bind(this));

		this._oLoadingProvider = new LoadingProvider();

		this.data("sap-ui-fastnavgroup", "true", true); // Define group for F6 handling
	};

	Header.prototype.exit = function () {
		this._oServiceManager = null;
		this._oDataProviderFactory = null;
		this._oRb = null;

		if (this._oDataProvider) {
			this._oDataProvider.destroy();
			this._oDataProvider = null;
		}

		if (this._oActions) {
			this._oActions.destroy();
			this._oActions = null;
		}

		if (this._oLoadingProvider) {
			this._oLoadingProvider.destroy();
			this._oLoadingProvider = null;
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
		this._getAvatar().setSrc(this.getIconSrc());
		this._getAvatar().setInitials(this.getIconInitials());

		this._setAccessibilityAttributes();
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
			sStatusTextId = this.getStatusText() ? this.getId() + "-status" : "",
			sAvatarId = this._getAvatar() ? this._getAvatar().getId() : "";

		return sTitleId + " " + sSubtitleId + " " + sStatusTextId + " " + sAvatarId;
	};

	/**
	 * Called after the control is rendered.
	 */
	Header.prototype.onAfterRendering = function() {
		//TODO performance will be affected, but text should clamp on IE also - TBD
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
	Header.prototype.ontap = function (oEvent) {
		var srcControl = oEvent.srcControl;
		if (srcControl && srcControl.getId().indexOf('overflowButton') > -1) { // better way?
			return;
		}

		this.firePress();
	};

	/**
	 * Fires the <code>sap.f.cards.Header</code> press event.
	 */
	Header.prototype.onsapselect = function () {
		this.firePress();
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

		this._oLoadingProvider.createLoadingState(this._oDataProvider);

		if (this._oDataProvider) {
			// If a data provider is created use an own model. Otherwise bind to the one propagated from the card.
			this.setModel(new JSONModel());

			//TODO Designers to decide if we have to keep loading status when an error occured during loading
			this._oDataProvider.attachDataChanged(function (oEvent) {
				this._updateModel(oEvent.getParameter("data"));
			}.bind(this));

			this._oDataProvider.attachError(function (oEvent) {
				this._handleError(oEvent.getParameter("message"));
			}.bind(this));

			this._oDataProvider.triggerDataUpdate().then(function () {
				this.fireEvent("_dataReady");
				this._oLoadingProvider.setLoading(false);
				this._oLoadingProvider.removeHeaderPlaceholder(this);
			}.bind(this));
		} else {
			this.fireEvent("_dataReady");
		}
	};

	/**
	 * Sets accessibility to the header to the header.
	 *
	 * @private
	 */
	Header.prototype._setAccessibilityAttributes = function () {
		if (this.hasListeners("press")) {
			this._sAriaRole = 'button';
			this._sAriaHeadingLevel = undefined;
			this._sAriaRoleDescritoion = this._oRb.getText("ARIA_ROLEDESCRIPTION_INTERACTIVE_CARD_HEADER");
		} else {
			this._sAriaRole = 'heading';
			this._sAriaHeadingLevel = '3';
			this._sAriaRoleDescritoion = this._oRb.getText("ARIA_ROLEDESCRIPTION_CARD_HEADER");
		}
	};

	Header.prototype._updateModel = function (oData) {
		this.getModel().setData(oData);
	};

	Header.prototype._handleError = function (sLogMessage) {
		this.fireEvent("_error", { logMessage: sLogMessage });
	};

	Header.prototype.isLoading = function () {
		var oLoadingProvider = this._oLoadingProvider,
            oCard = this.getParent(),
			cardLoading = oCard.getMetadata()._sClassName === 'sap.ui.integration.widgets.Card' ? oCard.isLoading() : false;

		return !oLoadingProvider.getDataProviderJSON() && (oLoadingProvider.getLoadingState() || cardLoading);
	};

	Header.prototype.attachPress = function () {
		var aMyArgs = Array.prototype.slice.apply(arguments);
		aMyArgs.unshift("press");

		Control.prototype.attachEvent.apply(this, aMyArgs);

		this.invalidate();

		return this;
	};

	Header.prototype.detachPress = function() {
		var aMyArgs = Array.prototype.slice.apply(arguments);
		aMyArgs.unshift("press");

		Control.prototype.detachEvent.apply(this, aMyArgs);

		this.invalidate();

		return this;
	};

	return Header;
});
