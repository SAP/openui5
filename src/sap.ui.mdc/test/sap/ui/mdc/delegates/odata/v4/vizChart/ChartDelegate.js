/*!
 * ${copyright}
 */

// ---------------------------------------------------------------------------------------
// Helper class used to help create content in the chart and fill relevant metadata
// ---------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------
sap.ui.define([
	"delegates/odata/v4/FilterBarDelegate",
	"sap/ui/mdc/odata/v4/vizChart/ChartDelegate",
	"delegates/odata/v4/ODataMetaModelUtil",
	"sap/ui/mdc/enums/ChartItemRoleType"
], function (
	FilterBarDelegate,
	VizChartDelegate,
	ODataMetaModelUtil,
	ChartItemRoleType
) {
	"use strict";

	var ChartDelegate = Object.assign({}, VizChartDelegate);

	ChartDelegate.getFilterDelegate = function() {
		return FilterBarDelegate;
	};

	ChartDelegate.fetchProperties = function (oChart) {

		var oModel = this._getModel(oChart);
		var pCreatePropertyInfos;

		if (!oModel) {
			pCreatePropertyInfos = new Promise(function (resolve) {
				oChart.attachModelContextChange({
					resolver: resolve
				}, onModelContextChange, this);
			}.bind(this)).then(function (oModel) {
				return this._createPropertyInfos(oChart, oModel);
			}.bind(this));
		} else {
			pCreatePropertyInfos = this._createPropertyInfos(oChart, oModel);
		}

		return pCreatePropertyInfos;
	};

	ChartDelegate.fetchConfigurationForVizchart = function(oChart, sPropertyInfoKey, sPropertyName) {
		if (!sPropertyInfoKey || !sPropertyName) {
			return null;
		}

		const oDelegatePayload = oChart?.getDelegate().payload;
		const aConfigurationForVizchartFromPayload = oDelegatePayload?.configurationForVizchart;
		if (aConfigurationForVizchartFromPayload) {
			const aConfiguration = aConfigurationForVizchartFromPayload.filter((oConfig) => { return oConfig.key === sPropertyInfoKey; });
			const sResult = aConfiguration && aConfiguration[0] && aConfiguration[0][sPropertyName];
			if (sResult) {
				return sResult;
			}
		}

		const oState = this._getState(oChart);
		const aConfigurationForVizchart = oState.configForVizchart;
		if (aConfigurationForVizchart) {
			const aConfiguration = aConfigurationForVizchart.filter((oConfig) => { return oConfig.key === sPropertyInfoKey; });
			return aConfiguration && aConfiguration[0][sPropertyName];
		}

		return null;
	};

	function onModelContextChange(oEvent, oData) {
		var oChart = oEvent.getSource();
		var oModel = this._getModel(oChart);

		if (oModel) {
			oChart.detachModelContextChange(onModelContextChange);
			oData.resolver(oModel);
		}
	}

	ChartDelegate._createPropertyInfos = function (oChart, oModel) {
		const oDelegatePayload = oChart.getDelegate().payload;
		let aProperties = [];
		const sEntitySetPath = "/" + oDelegatePayload.collectionName;
		const oMetaModel = oModel.getMetaModel();

		return Promise.all([
			oMetaModel.requestObject(sEntitySetPath + "/"), oMetaModel.requestObject(sEntitySetPath + "@")
		]).then(function (aResults) {
			const oEntityType = aResults[0], mEntitySetAnnotations = aResults[1];
			const oSortRestrictions = mEntitySetAnnotations["@Org.OData.Capabilities.V1.SortRestrictions"] || {};
			const oSortRestrictionsInfo = ODataMetaModelUtil.getSortRestrictionsInfo(oSortRestrictions);
			const oFilterRestrictions = mEntitySetAnnotations["@Org.OData.Capabilities.V1.FilterRestrictions"];
			const oFilterRestrictionsInfo = ODataMetaModelUtil.getFilterRestrictionsInfo(oFilterRestrictions);

			let oState = this._getState(oChart);
			if (!oState) {
				oState = {};
			}
			const aConfigurationForVizchart = oState.configForVizchart;
			if (!aConfigurationForVizchart || aConfigurationForVizchart.length === 0) {
				oState.configForVizchart = [];
				this._setState(oChart, oState);
			}

			for (const sKey in oEntityType) {
				const oObj = oEntityType[sKey];

				if (oObj && oObj.$kind === "Property") {
					// ignore (as for now) all complex properties
					// not clear if they might be nesting (complex in complex)
					// not clear how they are represented in non-filterable annotation
					// etc.
					if (oObj.$isCollection) {
						//Log.warning("Complex property with type " + oObj.$Type + " has been ignored");
						continue;
					}

					const oPropertyAnnotations = oMetaModel.getObject(sEntitySetPath + "/" + sKey + "@");

					//TODO: Check what we want to do with properties neither aggregatable nor groupable
					//Right now: skip them, since we can't create a chart from it
					if (!oPropertyAnnotations["@Org.OData.Aggregation.V1.Aggregatable"] && !oPropertyAnnotations["@Org.OData.Aggregation.V1.Groupable"]) {
						continue;
					}

					if (oPropertyAnnotations["@Org.OData.Aggregation.V1.Aggregatable"]){
						aProperties = aProperties.concat(this._createPropertyInfosForAggregatable(oChart, sKey, oPropertyAnnotations, oObj, oFilterRestrictionsInfo, oSortRestrictionsInfo));
					}

					if (oPropertyAnnotations["@Org.OData.Aggregation.V1.Groupable"]) {

						aProperties.push({
							key: sKey,
							label: oPropertyAnnotations["@com.sap.vocabularies.Common.v1.Label"] || sKey,
							sortable: oSortRestrictionsInfo[sKey] ? oSortRestrictionsInfo[sKey].sortable : true,
							filterable: oFilterRestrictionsInfo[sKey] ? oFilterRestrictionsInfo[sKey].filterable : true,
							groupable: true,
							aggregatable: false,
							maxConditions: ODataMetaModelUtil.isMultiValueFilterExpression(oFilterRestrictionsInfo[sKey]?.allowedExpressions) ? -1 : 1,
							dataType: oObj.$Type,
							//formatOptions: null,
							//constraints: {},
							role: ChartItemRoleType.category //standard, normally this should be interpreted from UI.Chart annotation
						});

						const oState = this._getState(oChart);
						const aConfigurationForVizchart = oState.configForVizchart;

						aConfigurationForVizchart.push({
							key: sKey,
							aggregationMethod : null,
							criticality: null,
							textProperty: oPropertyAnnotations["@com.sap.vocabularies.Common.v1.Text"]?.$Path || null, //To be implemented by FE
							textFormatter: oPropertyAnnotations["@com.sap.vocabularies.Common.v1.Text@com.sap.vocabularies.UI.v1.TextArrangement"] || null
						});

					}
				}
			}

			return aProperties;
		}.bind(this));
	};

	ChartDelegate._createPropertyInfosForAggregatable = function(oChart, sKey, oPropertyAnnotations, oObj, oFilterRestrictionsInfo, oSortRestrictionsInfo) {
		var aProperties = [];

		if (oPropertyAnnotations["@Org.OData.Aggregation.V1.SupportedAggregationMethods"]){
			oPropertyAnnotations["@Org.OData.Aggregation.V1.SupportedAggregationMethods"].forEach(function(sAggregationMethod){
				if (sAggregationMethod.hasOwnProperty("$Path")) {
					sAggregationMethod = sAggregationMethod["$Path"];
				}

				aProperties.push({
					key: sAggregationMethod + sKey,
					label: oPropertyAnnotations["@com.sap.vocabularies.Common.v1.Label"] + " (" + sAggregationMethod + ")" || sKey + " (" + sAggregationMethod + ")" ,
					sortable: oSortRestrictionsInfo[sKey] ? oSortRestrictionsInfo[sKey].sortable : true,
					filterable: oFilterRestrictionsInfo[sKey] ? oFilterRestrictionsInfo[sKey].filterable : true,
					groupable: false,
					aggregatable: oPropertyAnnotations["@Org.OData.Aggregation.V1.Aggregatable"],
					path: sKey,
					maxConditions: ODataMetaModelUtil.isMultiValueFilterExpression(oFilterRestrictionsInfo[sKey]?.allowedExpressions) ? -1 : 1,
					dataType: oObj.$Type,
					role: "axis1"
				});

				const oState = this._getState(oChart);
				const aConfigurationForVizchart = oState.configForVizchart;
				aConfigurationForVizchart.push({
					key: sAggregationMethod + sKey,
					aggregationMethod : sAggregationMethod,
					datapoint: null, //To be implemented by FE
					unitPath: (sAggregationMethod + sKey) === "minprice" ? "currency_code" : ""
				});

			}.bind(this));
		}

		return aProperties;
	};

	ChartDelegate.addItem = function (oChart, sPropertyName, mPropertyBag, sRole) {
		if (oChart.getModel) {
			return Promise.resolve(this._createMDCChartItem(sPropertyName, oChart, sRole));
		}
	};

	ChartDelegate._setChart = function(oChart, oInnerChart) {
		VizChartDelegate._setChart(oChart, oInnerChart);

		oInnerChart.setVizProperties({
			plotArea: {
				scrollbar: { forceToShowInMobile: true },
				dataLabel: {
					formatString: sap.viz.ui5.format.ChartFormatter.DefaultPattern.SHORTFLOAT_MFD2,
					visible: true,
					hideWhenOverlap: true
				}
			},
			tooltip: {
				formatString: sap.viz.ui5.format.ChartFormatter.DefaultPattern.SHORTFLOAT_MFD2,
				unitFormatType: "FinancialUnits"
			},
			valueAxis: {
				label: {
					formatString: sap.viz.ui5.format.ChartFormatter.DefaultPattern.SHORTFLOAT_MFD2,
					unitFormatType: "FinancialUnits"
				},
				title: {
					visible: true
				}
			}
		});
	};

	ChartDelegate.setChartTooltipVisibility = function(oChart, bFlag) {
		VizChartDelegate.setChartTooltipVisibility(oChart, bFlag);

		const oState = this._getState(oChart);
		oState?.vizTooltip.setFormatString(sap.viz.ui5.format.ChartFormatter.DefaultPattern.SHORTFLOAT_MFD2);
		// oState.vizTooltip.setUnitFormatType("FinancialUnits");

	};

	return ChartDelegate;
});