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
	"sap/ui/core/Lib",
	"sap/base/util/deepClone",
	"sap/base/util/deepEqual",
	"sap/ui/integration/util/AnalyticsCloudHelper"
], function (
	AnalyticsCloudContentRenderer,
	BaseContent,
	HTML,
	BindingResolver,
	IllustratedMessageType,
	Log,
	Library,
	deepClone,
	deepEqual,
	AnalyticsCloudHelper
) {
	"use strict";

	const oResourceBundle = Library.getResourceBundleFor("sap.ui.integration");

	// Only public SAC render methods can be invoked through a generic descriptor.
	// Keeping the contract to one namespace and a render-prefixed method prevents
	// access to APIs such as setup/export while allowing future artifact renderers
	// without another UI5 change.
	const rRenderApi = /^(?!(?:constructor|prototype)\.)[A-Za-z][A-Za-z0-9_]*\.render[A-Z][A-Za-z0-9_]*$/;

	// Completion modes a render descriptor may request.
	// "widgetInfo" runs the sap.sac.api.widget.getWidgetInfo flow afterwards;
	// "none" completes without requesting widget metadata (e.g. for metrics).
	const WIDGET_INFO_COMPLETION = "widgetInfo";
	const NO_COMPLETION = "none";

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
	 * @override
	 */
	AnalyticsCloudContent.prototype._supportsOverflow = function () {
		return false;
	};

	/**
	 * Creates Analytics Cloud content inside the card.
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

		// Check if the configuration has changed
		// during rendering the sac widget.
		if (deepEqual(this._oLastConfig, oConfig)) {
			return;
		}

		// Normalize whatever the manifest provided (a generic "render" descriptor
		// or one of the legacy named keys) into a single generic descriptor, then
		// dispatch it. Adding a new artifact type is a manifest-only change: it just
		// supplies a different "render" descriptor and needs no change here.
		const oDescriptor = this._getRenderDescriptor(oConfig);
		if (!oDescriptor) {
			this._showError("Required configuration /sap.card/content/render, /sap.card/content/widget, or /sap.card/content/interpretation was not found or is empty.");
			return;
		}

		if (![WIDGET_INFO_COMPLETION, NO_COMPLETION].includes(oDescriptor.completion)) {
			this._showError(`Render completion '${oDescriptor.completion}' is not supported.`);
			return;
		}

		if (oDescriptor.args !== undefined && !Array.isArray(oDescriptor.args)) {
			this._showError("Render descriptor 'args' must be an array.");
			return;
		}

		const oOptions = this._getOptions(oConfig, oDescriptor);
		this._dispatchRender(oDescriptor, oConfig, sContainerId, oOptions);
	};

	/**
	 * Builds a generic render descriptor from the content configuration.
	 *
	 * Prefers an explicit generic <code>content/render</code> descriptor. For
	 * backward compatibility, the legacy <code>widget</code> and
	 * <code>interpretation</code> keys are mapped onto the same descriptor
	 * shape so existing manifests keep working unchanged.
	 *
	 * @param {Object} oConfig The resolved content config.
	 * @returns {{api: string, args: Array, completion: string}|null} The descriptor, or null if none is present.
	 */
	AnalyticsCloudContent.prototype._getRenderDescriptor = function (oConfig) {
		if (oConfig.render) {
			return oConfig.render;
		}

		// Legacy shims — equivalent descriptors for the named keys.
		if (oConfig.widget) {
			return {
				api: "widget.renderWidget",
				args: [oConfig.widget.storyId, oConfig.widget.widgetId],
				completion: WIDGET_INFO_COMPLETION
			};
		}

		if (oConfig.interpretation) {
			return {
				api: "widget.renderWidgetForJustAsk",
				args: [oConfig.interpretation],
				completion: WIDGET_INFO_COMPLETION
			};
		}

		return null;
	};

	/**
	 * Dispatches a generic render descriptor to the referenced SAC API.
	 *
	 * The descriptor's <code>api</code> must identify a public render method on
	 * <code>sap.sac.api</code>. The card supplies the container, destination, and
	 * options around the descriptor's artifact-specific <code>args</code>.
	 *
	 * @param {{api: string, args: Array, completion: string}} oDescriptor The render descriptor.
	 * @param {Object} oConfig The resolved content config.
	 * @param {string} sContainerId The widget container id.
	 * @param {Object} oOptions The merged options (including renderComplete).
	 */
	AnalyticsCloudContent.prototype._dispatchRender = function (oDescriptor, oConfig, sContainerId, oOptions) {
		const sApi = oDescriptor.api;

		if (typeof sApi !== "string" || !rRenderApi.test(sApi)) {
			this._showError(`Render API '${sApi}' is not allowed. Expected '<namespace>.render<Method>'.`);
			return;
		}

		const fnRender = this._resolveRenderApi(sApi);
		if (typeof fnRender !== "function") {
			this._showError(`Object sap.sac.api.${sApi} not found on the page.`);
			return;
		}

		const aArgs = [
			sContainerId,
			{ proxy: oConfig.sacTenantDestination },
			...(oDescriptor.args || []),
			oOptions
		];

		this._oLastConfig = oConfig;
		fnRender.apply(null, aArgs);
	};

	/**
	 * Resolves a dotted API path (e.g. "metrics.renderMetric") against sap.sac.api.
	 * Only paths matching the render API contract reach this method.
	 * @param {string} sApi The dotted API path under sap.sac.api.
	 * @returns {Function|undefined} The resolved function, or undefined.
	 */
	AnalyticsCloudContent.prototype._resolveRenderApi = function (sApi) {
		return sApi.split(".").reduce((oTarget, sKey) => {
			return oTarget == null ? oTarget : oTarget[sKey];
		}, sap?.sac?.api);
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
	 * @param {{api: string, args: Array, completion: string}} oDescriptor The render descriptor.
	 * @returns {Object} The options.
	 */
	AnalyticsCloudContent.prototype._getOptions = function (oConfig, oDescriptor) {
		const oOptions = deepClone(oConfig.options) || {};
		const oDefaultAttributes = {
			enableInteraction: false,
			enableUndoRedo: false,
			enableMenus: false,
			showHeader: false,
			showFooter: false
		};

		oOptions.attributes = Object.assign({}, oDefaultAttributes, oOptions.attributes);

		// Completion is driven by the render descriptor's "completion" mode.
		// "none" completes without requesting widget metadata; "widgetInfo"
		// runs the getWidgetInfo flow after rendering.
		oOptions.renderComplete = oDescriptor.completion === NO_COMPLETION ? {
			onSuccess: this._onRenderSuccess.bind(this),
			onFailure: this._onRenderFailure.bind(this)
		} : {
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
	 * Handles successful rendering for descriptors that complete without widget metadata.
	 */
	AnalyticsCloudContent.prototype._onRenderSuccess = function () {
		const sApi = this._getRenderDescriptor(this._getResolvedConfiguration())?.api;

		Log.info(`Analytics Cloud content rendered successfully via sap.sac.api.${sApi}.`, this);
		this._completeRendering();
	};

	/**
	 * Handles failed rendering for descriptors that complete without widget metadata.
	 * @param {Error|Object|string|null} vError The error returned by the renderer.
	 */
	AnalyticsCloudContent.prototype._onRenderFailure = function (vError) {
		const sApi = this._getRenderDescriptor(this._getResolvedConfiguration())?.api;
		let sError = `There was a failure in sap.sac.api.${sApi}.`;

		if (vError instanceof Error) {
			sError += " " + vError.toString();
			Log.error(vError.stack);
		} else if (typeof vError === "object") {
			sError += " " + JSON.stringify(vError);
		} else if (vError) {
			sError += " " + vError;
		}

		Log.error(sError, this);
		this._completeRendering();
	};

	/**
	 * Completes rendering without requesting widget metadata.
	 */
	AnalyticsCloudContent.prototype._completeRendering = function () {
		this._oLastConfig = null;
		this.getCardInstance().scheduleFireStateChanged();
	};

	/**
	 * Sets the widget info from sap.sac.api.widget.getWidgetInfo to card's model widgetInfo
	 */
	AnalyticsCloudContent.prototype._updateWidgetInfo = async function () {
		// clear the last config after the widget is rendered
		// sо that it can be re-rendered with new configuration,
		// if the configuration is changed.
		this._oLastConfig = null;

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
		Log.error(sError, this);

		this.handleError({
			illustrationType: IllustratedMessageType.UnableToLoad,
			title: oResourceBundle.getText("CARD_ERROR_ANALYTICS_CLOUD_TITLE"),
			description: oResourceBundle.getText("CARD_ERROR_ANALYTICS_CLOUD_DESCRIPTION")
		});
	};

	return AnalyticsCloudContent;
});
