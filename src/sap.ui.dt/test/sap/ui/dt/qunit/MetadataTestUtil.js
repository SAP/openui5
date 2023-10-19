sap.ui.define([
	"sap/ui/dt/AggregationDesignTimeMetadata"
], function(AggregationDesignTimeMetadata) {
	"use strict";

	var Util = {
		buildMetadataObject(vContent, vTestAggr) {
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

		createPropagateMetadataObject(sInstanceOf, sTestValue, vActions, sCustomProperty) {
			return {
				propagateMetadata(oElement, oRelevantContainer) {
					if (oElement.getMetadata().getName() === sInstanceOf) {
						var mData = {
							aggregations: {
								content: {
									testProp: sTestValue || "testValue"
								}
							},
							metadataContainer: oRelevantContainer
						};
						if (vActions !== undefined) {
							mData.actions = vActions;
						}
						if (sCustomProperty) {
							mData.aggregations.content[sCustomProperty] = sCustomProperty;
						}
						return mData;
					}
				}
			};
		},

		createNewAggregationDtMetadataInstance(oData) {
			return new AggregationDesignTimeMetadata({
				data: oData || {}
			});
		},

		createPropagationInfoObject(vPropagateFunction, oRelevantContainerElement, vMetadataFunction) {
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

		createPropagateRelevantContainerObject(sInstanceOf) {
			return {
				propagateRelevantContainer(oElement) {
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
}, true);