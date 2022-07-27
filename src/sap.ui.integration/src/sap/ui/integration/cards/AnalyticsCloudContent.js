/*!
 * ${copyright}
 */

sap.ui.define([
	"./AnalyticsCloudContentRenderer",
	"./BaseContent",
	"sap/ui/integration/library",
	"sap/ui/core/HTML",
	"sap/ui/integration/util/BindingResolver",
	"sap/base/Log"
], function (AnalyticsCloudContentRenderer, BaseContent, library, HTML, BindingResolver, Log) {
	"use strict";

	var ActionArea = library.CardActionArea;

	/**
	 * Constructor for a new <code>AnalyticsCloudContent</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * A control that allows the creation of a card content which is based on Highcharts library and Analytics Cloud Service response.
	 *
	 * <b>Note:</b> In order to use this content, the Highcharts library must be preloaded on the page. And <code>window.Highcharts</code> must be available.
	 *
	 * @extends sap.ui.integration.cards.BaseContent
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @private
	 * @since 1.73
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

		var sId = this.getId() + "-highchartContainer";
		// Add "sapFCardAnalyticsCloudContentHCC" class to the container content for CSP compliance
		this._oHighchartContainer = new HTML(sId, {
			content: "<div id=" + sId + " class='sapFCardAnalyticsCloudContentHCC'></div>"
		});
		this.setAggregation("_content", this._oHighchartContainer);
	};

	/**
	 * Called when control is destroyed.
	 */
	AnalyticsCloudContent.prototype.exit = function () {
		BaseContent.prototype.exit.apply(this, arguments);

		if (this._oHighchart) {
			this._oHighchart.destroy();
			this._oHighchart = null;
		}

		if (this._oHighchartContainer) {
			this._oHighchartContainer.destroy();
			this._oHighchartContainer = null;
		}
	};

	/**
	 * @inheritdoc
	 */
	AnalyticsCloudContent.prototype.loadDependencies = function (oCardManifest) {
		return this._loadHighcharts();
	};

	/**
	 * @inheritdoc
	 */
	AnalyticsCloudContent.prototype.setConfiguration = function (oConfiguration) {
		BaseContent.prototype.setConfiguration.apply(this, arguments);
		oConfiguration = this.getParsedConfiguration();

		//workaround until actions refactor
		this.fireEvent("_actionContentReady");
		this._oActions.attach({
			area: ActionArea.Content,
			actions: oConfiguration.actions,
			control: this
		});
	};

	/**
	 * After rendering hook.
	 * @private
	 */
	AnalyticsCloudContent.prototype.onAfterRendering = function () {
		this._createHighchart();
	};

	/**
	 * Loads the Highchart library based on the sac destination.
	 * @returns {Promise} A Promise which is resolved when Highcharts library is loaded.
	 */
	AnalyticsCloudContent.prototype._loadHighcharts = function () {
		var oCard = this.getCardInstance(),
			sDestinationKey = AnalyticsCloudContent.SAC_DESTINATION_KEY,
			pDestination = oCard.resolveDestination(sDestinationKey);

		return pDestination
			.then(function (sUrl) {
				return AnalyticsCloudContent.loadHighcharts(sUrl);
			}, function (sReason) {
				return Promise.reject("Destination with key '" + sDestinationKey + "' is required for AnalyticsCloud card. It could not be resolved. Reason: '" + sReason + "'");
			});
	};

	/**
	 * Creates Highcharts' chart inside the card content.
	 */
	AnalyticsCloudContent.prototype._createHighchart = function () {
		if (this._bIsBeingDestroyed) {
			return;
		}

		var oCard = this.getCardInstance(),
			oConfiguration = this.getParsedConfiguration(),
			oBindingContext = this.getBindingContext(),
			sPath,
			oChartOptions;

		// is all data already loaded (either from card level or from content level)
		if (!oCard.isReady()) {
			oCard.attachEventOnce("_ready", this._createHighchart, this);
			return;
		}

		// is Highcharts library available
		if (!window.Highcharts) {
			this.handleError("There was a problem with loading Highcharts library. Could not initialize AnalyticsCloud card content.");
			return;
		}

		if (!this._oHighchartContainer) {
			Log.error("Highcharts container is not created or destroyed.");
			return;
		}

		if (oBindingContext) {
			sPath = oBindingContext.getPath();
		}

		oChartOptions = BindingResolver.resolveValue(oConfiguration.options, this, sPath);

		this._oHighchart = new window.Highcharts.Chart(this._oHighchartContainer.getId(), oChartOptions);
	};

	/** Static methods */

	/**
	 * The key which must point to the SAC destination inside the card configuration. This destination will be used to load Highcharts library.
	 * @readonly
	 * @const {string}
	 */
	AnalyticsCloudContent.SAC_DESTINATION_KEY = "sac";

	/**
	 * List of Highcharts modules to load.
	 * @readonly
	 * @const {Object}
	 */
	AnalyticsCloudContent.HIGHCHART_MODULES = {
		"highcharts/highstock": {
			amd: true,
			exports: 'Highcharts'
		},
		"highcharts/highcharts-more": {
			deps: ["highcharts/highstock"]
		},
		"highcharts/solid-gauge": {
			deps: ["highcharts/highstock", "highcharts/highcharts-more"]
		},
		"highcharts/histogram-bellcurve": {
			deps: ["highcharts/highstock"]
		},
		"highcharts/no-data-to-display": {
			deps: ["highcharts/highstock"]
		},
		"highcharts/wordcloud": {
			deps: ["highcharts/highstock"]
		},
		"highcharts/variable-pie": {
			deps: ["highcharts/highstock"]
		},
		"highcharts/heatmap": {
			deps: ["highcharts/highstock"]
		},
		"highcharts/treemap": {
			deps: ["highcharts/highstock"]
		},
		"highcharts/variwide": {
			deps: ["highcharts/highstock"]
		},
		"highcharts/pattern-fill": {
			deps: ["highcharts/highstock"]
		},
		"highcharts/highcharts-3d": {
			deps: ["highcharts/highstock"]
		},
		"highcharts/grouped-categories": {
			deps: ["highcharts/highstock"]
		}
	};

	/**
	 * Loads the Highcharts library.
	 * @param {string} sBaseUrl The base url of the sac service from which the Highcharts library can be loaded.
	 * @return {Promise} A Promise which is resolved when all Highcharts dependencies are loaded. Rejected if there is a problem.
	 */
	AnalyticsCloudContent.loadHighcharts = function (sBaseUrl) {
		var sSanitizedUrl = sBaseUrl.trim().replace(/\/$/, ""), // remove any trailing spaces and slashes
			sFireflyServiceUrl = sSanitizedUrl,
			bIsIncluded = this._isHighchartsIncluded(sFireflyServiceUrl),
			bIsIncludedByOthers = this._isHighchartsIncludedByThirdParty();

		if (bIsIncluded) {
			return this._pLoadModules;
		}

		if (bIsIncludedByOthers) {
			return Promise.resolve();
		}

		this._sIncludedFrom = sFireflyServiceUrl;
		this._pLoadModules = this._loadModules(sFireflyServiceUrl);

		return this._pLoadModules;
	};

	/**
	 * Is the Highcharts library already loaded.
	 * @param {string} sBaseUrl The base url of the sac service from which the Highcharts library can be loaded.
	 * @return {boolean} True if loaded.
	 */
	AnalyticsCloudContent._isHighchartsIncluded = function (sBaseUrl) {
		var sIncludedFrom = this._sIncludedFrom;

		if (sIncludedFrom && sIncludedFrom === sBaseUrl) {
			return true;
		}

		if (sIncludedFrom && sIncludedFrom !== sBaseUrl) {
			Log.warning(
				"Highcharts library is already included from '" + sIncludedFrom + "'. The included version will be used and will not load from '" + sBaseUrl + "'",
				"sap.ui.integration.widgets.Card#AnalyticsCloud"
			);
			return true;
		}

		return false;
	};

	/**
	 * Is the Highcharts library already loaded.
	 * @return {boolean} True if loaded.
	 */
	AnalyticsCloudContent._isHighchartsIncludedByThirdParty = function () {
		if (window.Highcharts) {
			Log.warning(
				"Highcharts library is already included on the page. The included version will be used and will not load another one.",
				"sap.ui.integration.widgets.Card#AnalyticsCloud"
			);
			return true;
		}

		return false;
	};

	/**
	 * Loads all files from the Highcharts dependencies list.
	 * @param {string} sBaseUrl The base url of the sac service from which the Highcharts library can be loaded.
	 * @return {Promise} A Promise which is resolved when all Highcharts dependencies are loaded. Rejected if there is a problem.
	 */
	AnalyticsCloudContent._loadModules = function (sBaseUrl) {
		var oShim = this.HIGHCHART_MODULES,
			aModules = Object.getOwnPropertyNames(oShim);

		sap.ui.loader.config({
			paths: {
				"highcharts": sBaseUrl + "/highcharts"
			},
			async: true,
			shim: oShim
		});

		return this._require(aModules)
			.catch(function () {
				return Promise.reject("There was a problem with loading of the Highcharts library files.");
			});
	};

	/**
	 * Require the modules.
	 * @param {array} aModules The modules to require
	 * @return {Promise} A Promise which is resolved when the modules are loaded and rejected when failed to load.
	 */
	AnalyticsCloudContent._require = function (aModules) {
		return new Promise(function (fnResolve, fnReject) {
			sap.ui.require(
				aModules,
				function () {
					fnResolve(arguments);
				},
				function (oError) {
					fnReject(oError);
				}
			);
		});
	};

	return AnalyticsCloudContent;
});
