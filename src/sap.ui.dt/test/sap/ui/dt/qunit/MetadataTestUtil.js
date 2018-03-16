sap.ui.define(["sap/ui/dt/AggregationDesignTimeMetadata"],
	function(AggregationDesignTimeMetadata){
		"use strict";
		var Util = {
			buildMetadataObject : function(vContent, vTestAggr) {
				var mData = {
					data: {
						aggregations: {
							content: vContent
						}
					}
				};
				if (vTestAggr) {
					mData.data.aggregations.testAggregation = vTestAggr;
				}
				return mData;
			},

			createPropagateMetadataObject : function(sInstanceOf, sTestValue, vActions) {
				return {
					propagateMetadata : function (oElement, oRelevantContainer) {
						if (oElement.getMetadata().getName() === sInstanceOf){
							var mData = {
								aggregations : {
									content: {
										testProp : sTestValue || "testValue"
									}
								},
								metadataContainer: oRelevantContainer
							};
							if (vActions !== undefined) {
								mData.actions = vActions;
							}
							return mData;
						}
					}
				};
			},

			createNewAggregationDtMetadataInstance : function(oData) {
				return new AggregationDesignTimeMetadata({
					data: oData || {}
				});
			},

			createPropagationInfoObject : function(vPropagateFunction, oRelevantContainerElement, vMetadataFunction) {
				var mObj = {};
				if (vPropagateFunction) {
					mObj.relevantContainerFunction = vPropagateFunction;
				}
				if (oRelevantContainerElement) {
					mObj.relevantContainerElement = oRelevantContainerElement;
				}
				if (vMetadataFunction) {
					mObj.metadataFunction = vMetadataFunction;
				}
				return mObj;
			},

			createPropagateRelevantContainerObject : function(sInstanceOf) {
				return {
					propagateRelevantContainer: function (oElement) {
						var sType = oElement.getMetadata().getName();
						if (sType === sInstanceOf) {
							return true;
						}
						return false;
					}
				};
			}
		};

		return Util;
	},
true);