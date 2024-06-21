/*!
 * ${copyright}
 */

sap.ui.define([
	"./AnalyticsCloudContentRenderer",
	"./BaseContent",
	"sap/ui/core/HTML",
	"sap/ui/integration/util/BindingResolver",
	"sap/m/IllustratedMessageType",
	"sap/base/Log",
	"sap/base/util/deepClone",
	"sap/ui/integration/util/AnalyticsCloudHelper"
], function (
	AnalyticsCloudContentRenderer,
	BaseContent,
	HTML,
	BindingResolver,
	IllustratedMessageType,
	Log,
	deepClone,
	AnalyticsCloudHelper
) {
	"use strict";

	/**
	 * Constructor for a new <code>AnalyticsCloudContent</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * A control that allows the creation of a card content which is based on Analytics Cloud Widgets library and Analytics Cloud Service response.
	 *
	 * @extends sap.ui.integration.cards.BaseContent
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @private
	 * @since 1.125
	 * @alias sap.ui.integration.cards.AnalyticsCloudContent
	 */
	var AnalyticsCloudContent = BaseContent.extend("sap.ui.integration.cards.AnalyticsCloudContent", {
		metadata: {
			library: "sap.ui.integration"
		},
		renderer: AnalyticsCloudContentRenderer
	});

	/**
	 * Called when control is initialized.
	 */
	AnalyticsCloudContent.prototype.init = function () {
		BaseContent.prototype.init.apply(this, arguments);

		var sId = this.getId() + "-widgetContainer";
		this._oWidgetContainer = new HTML(sId, {
			content: "<div id=" + sId + " class='sapUiIntAnalyticsCloudContentContainer'></div>"
		});
		this.setAggregation("_content", this._oWidgetContainer);
	};

	/**
	 * Called when control is destroyed.
	 */
	AnalyticsCloudContent.prototype.exit = function () {
		BaseContent.prototype.exit.apply(this, arguments);

		if (this._oWidgetContainer) {
			this._oWidgetContainer.destroy();
			this._oWidgetContainer = null;
		}
	};

	/**
	 * @override
	 */
	AnalyticsCloudContent.prototype.loadDependencies = function (oCardManifest) {
		return AnalyticsCloudHelper.loadWidget(this.getCardInstance()?.getHostInstance());
	};

	/**
	 * @override
	 */
	AnalyticsCloudContent.prototype.applyConfiguration = function () {
		//workaround until actions refactor
		this.fireEvent("_actionContentReady");
	};

	/**
	 * @override
	 */
	AnalyticsCloudContent.prototype.getStaticConfiguration = function () {
		return this._getResolvedConfiguration();
	};

	/**
	 * After rendering hook.
	 * @private
	 */
	AnalyticsCloudContent.prototype.onAfterRendering = function () {
		if (this.getAggregation("_blockingMessage")) {
			return;
		}

		this._renderWidget();
	};

	/**
	 * Creates Widgets' chart inside the card content.
	 */
	AnalyticsCloudContent.prototype._renderWidget = function () {
		if (this._bIsBeingDestroyed) {
			return;
		}

		const oCard = this.getCardInstance();
		if (!oCard.isReady()) {
			oCard.attachEventOnce("_ready", () => {
				// Makes sure that it goes through onAfterRendering when card is ready
				this.invalidate();
			});
			return;
		}

		if (!sap?.sac?.api?.widget) {
			this._showError("Object sap.sac.api.widget not found on the page.");
			return;
		}

		const oConfig = this._getResolvedConfiguration();
		if (!oConfig.sacTenantDestination) {
			this._showError("Required configuration /sap.card/content/sacTenantDestination was not found or is empty.");
			return;
		}

		const sContainerId = this._oWidgetContainer.getId();
		const oWidget = oConfig?.widget;
		const vInterpretation = oConfig?.interpretation;
		const oOptions = this._getOptions(oConfig);

		if (oWidget) {
			sap.sac.api.widget.renderWidget(
				sContainerId,
				{ proxy: oConfig.sacTenantDestination },
				oWidget.storyId,
				oWidget.widgetId,
				oOptions
			);
		} else if (vInterpretation) {
			sap.sac.api.widget.renderWidgetForJustAsk(
				sContainerId,
				{ proxy: oConfig.sacTenantDestination },
				vInterpretation,
				oOptions
			);
		} else {
			this._showError("Required configuration /sap.card/content/widget or /sap.card/content/interpretation was not found or is empty.");
		}
	};

	/**
	 * Gets the content configuration, with resolved binding.
	 * @returns {Object} The resolved configuration.
	 */
	AnalyticsCloudContent.prototype._getResolvedConfiguration = function () {
		return BindingResolver.resolveValue(
			this.getParsedConfiguration(),
			this,
			this.getBindingContext()?.getPath() || "/"
		);
	};

	/**
	 * Gets the options from manifest merged with default options.
	 * @param {Object} oConfig The content config.
	 * @returns {Object} The options.
	 */
	AnalyticsCloudContent.prototype._getOptions = function (oConfig) {
		const oOptions = deepClone(oConfig.options) || {};
		const oDefaultAttributes = {
			enableInteraction: false,
			enableUndoRedo: false,
			enableMenus: false,
			showHeader: false,
			showFooter: false
		};

		oOptions.attributes = Object.assign({}, oDefaultAttributes, oOptions.attributes);

		oOptions.renderComplete = {
			onSuccess: this._onWidgetSuccess.bind(this),
			onFailure: this._onWidgetFailure.bind(this)
		};

		return oOptions;
	};

	/**
	 * Handles the case where widget rendering was successful.
	 */
	AnalyticsCloudContent.prototype._onWidgetSuccess = function () {
		const sWidgetId = this._getResolvedConfiguration()?.widget?.widgetId || "interpretation";

		Log.info(`Widget rendered successfully: ${sWidgetId}`, this);
		this._updateWidgetInfo();
	};

	/**
	 * Handles the case where widget rendering was failure.
	 * @param {Error|Object|string|null} vError The error returned by the widget.
	 */
	AnalyticsCloudContent.prototype._onWidgetFailure = function (vError) {
		const oWidget = this._getResolvedConfiguration()?.widget;
		const sStoryId = oWidget?.storyId || "interpretation";
		const sWidgetId = oWidget?.widgetId || "interpretation";

		let sError = `There was a failure in sap.sac.api.widget.renderWidget with storyId ${sStoryId} and widgetId ${sWidgetId}.`;

		if (vError instanceof Error) {
			sError += " " + vError.toString();
			Log.error(vError.stack);
		} else if (typeof vError === "object") {
			sError += " " + JSON.stringify(vError);
		} else if (vError) {
			sError += " " + vError;
		}

		Log.error(sError, this);

		this._updateWidgetInfo();
	};

	/**
	 * Sets the widget info from sap.sac.api.widget.getWidgetInfo to card's model widgetInfo
	 */
	AnalyticsCloudContent.prototype._updateWidgetInfo = async function () {
		const oCard = this.getCardInstance();
		const sContainerId = this._oWidgetContainer.getId();

		let oWidgetInfo = {};
		try {
			oWidgetInfo = await sap.sac.api.widget.getWidgetInfo(sContainerId);
		} catch (oError) {
			Log.error("Call to sap.sac.api.widget.getWidgetInfo failed.", this);
		}

		oCard.getModel("widgetInfo").setData(oWidgetInfo);

		oCard.scheduleFireStateChanged();
	};

	/**
	 * Displays widget initialization error to the end user and logs error message.
	 * @param {string} sError The error message to log.
	 */
	AnalyticsCloudContent.prototype._showError = function (sError) {
		const oCard = this.getCardInstance();

		Log.error(sError, this);

		this.handleError({
			illustrationType: IllustratedMessageType.ErrorScreen,
			title: oCard.getTranslatedText("CARD_ERROR_ANALYTICS_CLOUD_TITLE"),
			description: oCard.getTranslatedText("CARD_ERROR_ANALYTICS_CLOUD_DESCRIPTION")
		});
	};

	return AnalyticsCloudContent;
});
