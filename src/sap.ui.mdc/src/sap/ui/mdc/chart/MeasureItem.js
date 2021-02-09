/*
 * !${copyright}
 */
sap.ui.define([
	"./Item", 'sap/ui/base/SyncPromise', "sap/ui/mdc/library"
], function(Item, SyncPromise, MDCLib) {
	"use strict";

	var MeasureClass;
	var _SUPPORTED_ROLE = {axis1:true,axis2:true,axis3:true};

	// Provides the Item class.
	/**
	 * Constructor for a new measure Item.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] initial settings for the new control
	 * @class The Item for the field/property metadata used within MDC controls, an instance can be created to override the default/metadata
	 *        behavior.
	 *        <h3><b>Note:</b></h3>
	 *        The control is experimental and the API/behaviour is not finalised and hence this should not be used for productive usage.
	 * @extends sap.ui.mdc.chart.Item
	 * @author SAP SE
	 * @constructor The API/behaviour is not finalised and hence this control should not be used for productive usage.
	 * @private
	 * @experimental
	 * @since 1.61
	 * @alias sap.ui.mdc.chart.MeasureItem
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var MeasureItem = Item.extend("sap.ui.mdc.chart.MeasureItem", /** @lends sap.ui.mdc.chart.MeasureItem.prototype */
		{
			metadata: {
				"abstract": true,
				library: "sap.ui.mdc",
				properties: {
					/**
					 * The property path of the chart item which may differ from the corresponsing property
					 */
					propertyPath: {
						type: "string"
					},
					/**
					 * How values of Measure will be rendered in the chart. Possible role values are {@link sap.chart.data.MeasureRoleType axis1}, {@link sap.chart.data.MeasureRoleType axis2}, {@link sap.chart.data.MeasureRoleType axis3}, and {@link sap.chart.data.MeasureRoleType axis4}.
					 * The default is {@link sap.chart.data.MeasureRoleType axis1}.
					 * They correspond to the well-known concepts of axis identifiers in the Cartesian coordinate system, e.g. a Y-axis in a bar/column/line chart, an X- and a Y-axis in a scatter chart, or two Y-axes in bar charts, and an optional third axis for the weight/size/intensity/temperature of a data point.
					 *
					 * You can create a new measure as follow:
					 * <pre>
					 * ...
					 * new sap.chart.data.Measure({name: "MEASURE1", role: sap.chart.data.MeasureRoleType.axis1})
					 * ...
					 * </pre>
					 *
					 * Detailed usage of measure role. Please refer to {@link sap.chart.data.MeasureRoleType MeasureRoleType}
					 *
					 * <b>NOTE:</b> Role definition would not work for Bullet Chart and users need to set semantics instead.
					 */
					role: {
						type: "string",
						defaultValue: "axis1"
					},
					/**
					 * The measures data point for coloring
					 *
					 * A data point is an object that defines relation between measures and criticality
					 * it is inspired by a @com.sap.vocabularies.UI.v1.DataPoint used in the odata protocol
					 *
					 * Its structure is:
					 * <ul>
					 *     <li> targetValue: the target value (path to reference measure)</li>
					 *     <li> foreCastValue: the forcast value (path to a projected measure) </li>
					 *     <li> criticality: the criticality object</li>
					 * </ul>
					 * @since 1.64
					 */
					dataPoint: {
						type: "object"
					},
					/**
					 * The aggregation method which depends on the data service.
					 *
					 * For OData based services this can be <code>min,max,sum,average</code>
					 */
					aggregationMethod: {
						type: "string",
						defaultValue: undefined
					}
				}
			}
		});

	MeasureItem.prototype.getCriticality = function() {
		var oDataPoint = this.getDataPoint();

		return oDataPoint ? oDataPoint.criticality : null;
	};

	/**
	 * Set the data point for coloring.
	 *
	 * Note the 'dataPoint' property is final
	 * @param oValue
	 *
	 * @experimental
	 * @private
	 * @ui5-restricted sap.ui.mdc
	 */
	MeasureItem.prototype.setDataPoint = function(oValue) {
		if (!this.isPropertyInitial("dataPoint")) {
			throw new Error("Data point is readonly");
		}

		return this.setProperty("dataPoint", oValue);
	};

	/**
	 * Creates a vizChart Item with given settings
	 *
	 * @param {*} mSettings settings for the item
	 *
	 * @experimental
	 * @private
	 * @ui5-restricted sap.ui.mdc
	 */
	MeasureItem.createVizChartItem = function(mSettings) {
		return new SyncPromise(function(resolve) {
			var oVizItem;
			if (MeasureClass) {
				oVizItem = new MeasureClass(mSettings);
				resolve(oVizItem);
			} else {
				sap.ui.require(["sap/chart/data/Measure"],
					function (MeasureClassLoaded) {
						MeasureClass = MeasureClassLoaded;
						oVizItem = new MeasureClass(mSettings);
						resolve(oVizItem);
					});
			}
		});
	};

	/**
	 * Translate mdc measure item settings to viz chart measure settings
	 *
	 * @param mMetadataSettings
	 * @return {{role: *, name: *, label: *}}
	 *
	 * @experimental
	 * @private
	 * @ui5-restricted sap.ui.mdc
	 */
	MeasureItem.getVizItemSettings = function(mMetadataSettings) {
		var mSettings = {
			label: mMetadataSettings.label,
			role: mMetadataSettings.role || "axis1",
			name: mMetadataSettings.key
		};

		var sAggregationMethod = mMetadataSettings.aggregationMethod;
		if (sAggregationMethod) {
			mSettings.analyticalInfo = {
				"with": sAggregationMethod,
				propertyPath: mMetadataSettings.propertyPath
			};
		}

		return mSettings;
	};

	/**
	 * Retrieve the setting for translating the measure item to a viz chart measure
	 *
	 * @param mMetadataSettings
	 * @return {*}
	 *
	 * @experimental
	 * @private
	 * @ui5-restricted sap.ui.mdc
	 */
	MeasureItem.prototype.getSettings = function(mMetadataSettings) {
		if (mMetadataSettings && mMetadataSettings.key == this.getKey()) {
			mMetadataSettings.label = this.getLabel() || mMetadataSettings.label;
			mMetadataSettings.role = this.getRole();
		} else {
			mMetadataSettings = {
				key: this.getKey(),
				label: this.getLabel(),
				role: this.getRole(),
				propertyPath: this.getPropertyPath(),
				aggregationMethod: this.getAggregationMethod(),
				dataPoint: this.getDataPoint()
			};
		}

		return MeasureItem.getVizItemSettings(mMetadataSettings);
	};

	/**
	 * Pushes updates on the item to the inner chart
	 *
	 * @param {object} oChart chart to push the update to
	 *
	 * @experimental
	 * @private
	 * @ui5-restricted sap.ui.mdc
	 */
	MeasureItem.prototype.toChart = function(oChart) {
		return new SyncPromise(function(resolve) {
			var oVizItem = oChart.getMeasureByName(this.getKey());
			if (oVizItem) {
				var sOldRole = oVizItem.getRole();
				oVizItem.setRole(this.getRole());
				if (this._observer) {
					this._observer.propertyChange(this, "role", sOldRole, this.getRole());
				}
			} else {
				this.toVizChartItem().then(function (oItem) {
					oChart.addMeasure(oItem, true);
					if (this._observer) {
						this._observer.propertyChange(this, "role", null, this.getRole());
					}
				}.bind(this));
			}
		}.bind(this));
	};

	/**
	 * Returns a promise that resolves to a Vizchart Item with given metadata
	 *
	 * @param mMetadata given metadata for the item
	 * @returns {sap.ui.base.SyncPromise} resolves to Vizchart Item
	 *
	 * @experimental
	 * @private
	 * @ui5-restricted sap.ui.mdc
	 */
	MeasureItem.prototype.toVizChartItem = function(mMetadata) {
		if (!this._pToVizItem) {
			this._pToVizItem = new SyncPromise(function (resolve) {
				mMetadata = mMetadata || {};
				MeasureItem.createVizChartItem(this.getSettings(mMetadata)).then(function(oVizItem) {
					resolve(oVizItem);
				});
			}.bind(this));
		}

		return this._pToVizItem;
	};


	/**
	 * Role of the inner chart item, see @sap.ui.mdc.ChartItemRoleType
	 * @param vRole The role of the inner chart item
	 * @return {this} reference to the <code>MeasureItem</code> for method chaining
	 *
	 * @experimental
	 * @private
	 * @ui5-restricted sap.ui.mdc
	 */
	MeasureItem.prototype.setRole = function(vRole) {
		if (!_SUPPORTED_ROLE[vRole]) {
			throw new TypeError("Invalide Measure role: " + vRole);
		}

		this.setProperty("role", vRole, true);

		var oChart = this.getParent();
		//now changing the role may affect a change of the type

		if (oChart) {
			oChart.oChartPromise.then(function(oVizChart) {
				this.toChart(oVizChart);
			}.bind(this));
		}

		return this;
	};

	/**
	 * Gets the type of the item (dimension or measure)
	 *
	 * @return {string} The type of the inner charts item which can be 'Dimension' or 'Measure'
	 *
	 * @experimental
	 * @private
	 * @ui5-restricted sap.ui.mdc
	 */
	MeasureItem.prototype.getVizItemType = function() {
		return MDCLib.ChartItemType.Measure;
	};

	/**
	 * Retrieve the additional measures from coloring for initially equiping the chart
	 * @param mItems
	 * @return {Array}
	 *
	 * @experimental
	 * @private
	 * @ui5-restricted sap.ui.mdc
	 */
	MeasureItem.prototype.getAdditionalColoringMeasures = function() {
		var aAdditional = [];

		var oCriticality = this.getCriticality();

		if (oCriticality && oCriticality.DynamicThresholds) {
			aAdditional = oCriticality.DynamicThresholds.usedMeasures;
		}

		return aAdditional;
	};

	return MeasureItem;

}, true);
