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
	"sap/ui/integration/util/AnalyticsCloudHelper"
], function (
	AnalyticsCloudContentRenderer,
	BaseContent,
	HTML,
	BindingResolver,
	IllustratedMessageType,
	Log,
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
	BaseContent.prototype.getStaticConfiguration = function () {
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
				this.invalidate();
			});
			return;
		}

		if (!sap?.sac?.api?.widget) {
			this._widgetError("Object sap.sac.api.widget not found on the page.");
			return;
		}

		const oWidget = this._getResolvedConfiguration()?.widget;
		if (!oWidget) {
			this._widgetError("Required widget configuration not found.");
			return;
		}

		const fnSuccess = () => {
			Log.info(`Widget rendered successfully: ${oWidget.widgetId}`, this);
		};

		const fnFailure = () => {
			this._widgetError(`Widget rendering failed: ${oWidget.widgetId}`);
		};

		sap.sac.api.widget.renderWidget(
			this._oWidgetContainer.getId(),
			{ proxy: oWidget["destination"] },
			oWidget["storyId"],
			oWidget["widgetId"],
			{
				...oWidget["options"],
				renderComplete: {
					onSuccess: fnSuccess,
					onFailure: fnFailure
				}
			}
		);
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

	AnalyticsCloudContent.prototype._widgetError = function (sError) {
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
