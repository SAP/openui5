/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/integration/library",
	"sap/ui/integration/cards/BaseContent",
	"sap/ui/core/HTML",
	"sap/ui/integration/util/BindingResolver"
], function (library, BaseContent, HTML, BindingResolver) {
		"use strict";

		/**
		 * Actions area type enumeration
		 */
		var AreaType = library.AreaType;

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
			renderer: {}
		});

		/**
		 * Called when control is initialized.
		 */
		AnalyticsCloudContent.prototype.init = function () {
			BaseContent.prototype.init.apply(this, arguments);

			var sId = this.getId() + "-highchartContainer";
			this._oHighchartContainer = new HTML(sId, {
				content: "<div id=" + sId + " style='height:100%; width:100%'></div>"
			});
			this.setAggregation("_content", this._oHighchartContainer);

			//workaround until actions refactor
			this.fireEvent("_actionContentReady");
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

		AnalyticsCloudContent.prototype.setConfiguration = function (oConfiguration) {
			BaseContent.prototype.setConfiguration.apply(this, arguments);
			this._oActions.setAreaType(AreaType.Content);
			this._oActions.attach(oConfiguration, this);
		};

		/**
		 * After rendering hook.
		 * @private
		 */
		AnalyticsCloudContent.prototype.onAfterRendering = function () {
			this._createHighchart();
		};

		/**
		 * Creates Highcharts' chart inside the card content.
		 */
		AnalyticsCloudContent.prototype._createHighchart = function () {
			var oCard = this.getParent(),
				oConfiguration = this.getConfiguration(),
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
				this._handleError("Highcharts library is not available. Could not initialize AnalyticsCloud card content.");
				return;
			}

			if (oBindingContext) {
				sPath = oBindingContext.getPath();
			}

			oChartOptions = BindingResolver.resolveValue(oConfiguration.options, this.getModel(), sPath);

			this._oHighchart = new window.Highcharts.Chart(this._oHighchartContainer.getId(), oChartOptions);
		};

		return AnalyticsCloudContent;
	});
