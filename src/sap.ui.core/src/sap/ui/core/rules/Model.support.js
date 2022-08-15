/*!
 * ${copyright}
 */
/**
 * Defines support rules related to the model.
 */
sap.ui.define([
	"sap/ui/support/library",
	"sap/ui/support/supportRules/util/StringAnalyzer",
	"sap/ui/model/CompositeBinding",
	"sap/ui/model/ListBinding",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/odata/ODataMetadata"
],
	function(
		SupportLib,
		StringAnalyzer,
		CompositeBinding,
		ListBinding,
		JSONModel,
		ODataMetadata
	) {
	"use strict";
	/*eslint max-nested-callbacks: 0 */

	// shortcuts
	var Categories = SupportLib.Categories; // Accessibility, Performance, Memory, ...
	var Severity = SupportLib.Severity; // Hint, Warning, Error
	var Audiences = SupportLib.Audiences; // Control, Internal, Application

	function _fnFindBestMatch(aValues, sBindingPath) {
		var iJsonModelMin = -1;
		var sJsonModelBestMatch = false;
		aValues.forEach(function(sKey) {
			var iCurrDest = StringAnalyzer.calculateLevenshteinDistance(sBindingPath, sKey);
			if (iJsonModelMin === -1 || iCurrDest < iJsonModelMin) {
				iJsonModelMin = iCurrDest;
				sJsonModelBestMatch = sKey;
			}
		});
		return sJsonModelBestMatch;
	}

	//**********************************************************
	// Check Functions
	//**********************************************************

	var fnCheckSelect = function (oIssueManager, oCoreFacade, oScope) {
		oScope.getElements().forEach(function (oElement) {
			var mBindingInfos = {};

			Object.assign(mBindingInfos, oElement.mBindingInfos, oElement.mObjectBindingInfos);

			Object.keys(mBindingInfos).forEach(function (sName) {
				var oBinding = mBindingInfos[sName].binding,
					sDetails;

				if (!oBinding || oBinding.getModel().bAutoExpandSelect) {
					return;
				}

				if (oBinding.isA("sap.ui.model.odata.v2.ODataListBinding") &&
						(!oBinding.mParameters || !oBinding.mParameters.select)) {
					sDetails = "The aggregation '" + sName + "' of element " + oElement.getId()
						+ " with binding path '" + oBinding.getPath() + "' is bound against a "
						+ "collection, yet no binding parameter 'select' is used. Using 'select' "
						+ "may improve performance.";
				} else if (oBinding.isA("sap.ui.model.odata.v4.ODataListBinding")
						&& (!oBinding.mParameters || !oBinding.mParameters.$select)) {
					sDetails = "The aggregation '" + sName + "' of element "
						+ oElement.getId() + " with binding path '" + oBinding.getPath() + "' is "
						+ "bound against a collection, yet no OData query option '$select' is used."
						+ " Using '$select' may improve performance. Alternatively, enable the "
						+ "automatic generation of '$select' and '$expand' in the model using the "
						+ "'autoExpandSelect' parameter.";
				} else if (oBinding.isA("sap.ui.model.odata.v2.ODataContextBinding")
						&& (!oBinding.mParameters || !oBinding.mParameters.select)) {
					sDetails = "The element " + oElement.getId() + " with binding path '"
						+ oBinding.getPath() + "' is bound against an entity, yet no binding "
						+ "parameter 'select' is used. Using 'select' may improve performance.";
				} else if (oBinding.isA("sap.ui.model.odata.v4.ODataContextBinding")
						&& (!oBinding.mParameters || !oBinding.mParameters.$select)) {
					sDetails = "The element " + oElement.getId() + " with binding path '"
						+ oBinding.getPath() + "' is bound against an entity, yet no OData query"
						+ " option '$select' is used. Using '$select' may improve performance. "
						+ "Alternatively, enable the automatic generation of '$select' and "
						+ "'$expand' in the model using the 'autoExpandSelect' parameter.";
				}

				if (sDetails) {
					oIssueManager.addIssue({
						context : {
							id : oElement.getId()
						},
						details : sDetails,
						severity : Severity.Low
					});
				}
			});
		});
	};

	//**********************************************************
	// Rule Definitions
	//**********************************************************
	/**
	 * Checks whether there are bindings for models where the model is available but a binding has no result.
	 * It checks the path structure and checks for typos.
	 */
	var oBindingPathSyntaxValidation = {
		id: "bindingPathSyntaxValidation",
		audiences: [Audiences.Control, Audiences.Application],
		categories: [Categories.Bindings],
		enabled: true,
		minversion: "1.32",
		title: "Model: Unresolved binding path",
		description: "The binding path used in the model could not be resolved",
		resolution: "Check the binding path for typos",
		resolutionurls: [
			{
				href: "https://sdk.openui5.org/api/sap.ui.model.Context",
				text: "API Reference: Context"
			},
			{
				href: "https://sdk.openui5.org/topic/e5310932a71f42daa41f3a6143efca9c",
				text: "Documentation: Data Binding Tutorial"
			},
			{
				href: "https://sdk.openui5.org/topic/97830de2d7314e93b5c1ee3878a17be9",
				text: "Documentation: Data Binding Tutorial - Step 12: Aggregation Binding Using Templates"
			},
			{
				href: "https://sdk.openui5.org/topic/6c7c5c266b534e7ea9a28f861dc515f5",
				text: "Documentation: Data Binding Tutorial - Step 13: Element Binding"
			}
		],
		check: function(oIssueManager, oCoreFacade, oScope) {
			var mElements = oScope.getElements();
			Object.keys(mElements).forEach(function(sElement) {

				var oElement = mElements[sElement],
					mBindingInfos = oElement.mBindingInfos;

				Object.keys(mBindingInfos).forEach(function(sBindingInfo) {

					var oBinding = mBindingInfos[sBindingInfo].binding;
					if (oBinding && !(oBinding instanceof CompositeBinding) && oBinding.getModel && oBinding.getModel()) {
						var oModel = oBinding.getModel();

						//find elements with unresolved PropertyBindings
						if ((oBinding.getValue && oBinding.getValue() === undefined)
							|| (oBinding instanceof ListBinding && oBinding.getLength() === 0)) {
							var sJsonModelBestMatch = false;

							if (oModel instanceof JSONModel) {
								var oJsonModelResult = oModel.getObject(oBinding.getPath());
								if (!oJsonModelResult) {
									var oData = oModel.getData();
									sJsonModelBestMatch = _fnFindBestMatch(Object.keys(oData), oBinding.getPath());
								}
							} else if (oModel.oMetadata && oModel.oMetadata instanceof ODataMetadata) {
								//try to look it up
								var result = oModel.oMetadata._getEntityTypeByPath(oBinding.getPath());
								if (!result) {
									var aValues = [];
									oModel.oMetadata.getServiceMetadata().dataServices.schema.forEach(function(mShema) {

										if (mShema.entityContainer) {
											mShema.entityContainer.forEach(function(mContainer) {
												if (mContainer.entitySet) {
													mContainer.entitySet.forEach(function(mEntitySet) {
														if (mEntitySet.name) {
															aValues.push(mEntitySet.name);
														}
													});
												}
											});
										}

									});
									sJsonModelBestMatch = _fnFindBestMatch(aValues, oBinding.getPath());
								}
							}

							if (sJsonModelBestMatch) {
								oIssueManager.addIssue({
									severity: Severity.Medium,
									details: "Element " + oElement.getId() + " with binding path '" + oBinding.getPath() + "' has unresolved bindings." +
									" You could try '" + sJsonModelBestMatch + "' instead",
									context: {
										id: oElement.getId()
									}
								});
							}

						} else if (oBinding.getValue && oBinding.getValue() === oBinding.getPath()) {
							oIssueManager.addIssue({
								severity: Severity.Low,
								details: "Element " + oElement.getId() + " with binding path '" + oBinding.getPath() + "' has the same value as the path. Potential Error.",
								context: {
									id: oElement.getId()
								}
							});
						}
					}
				});
			});
		}
	};

	/**
	 * Checks whether the select(v2)/$select(v4) parameter is used when binding against an
	 * aggregation.
	 */
	var oSelectUsedInAggregation = {
			audiences : [Audiences.Application],
			categories : [Categories.Bindings, Categories.Performance],
			description : "Using $select allows the back end to send only necessary properties",
			enabled : true,
			id : "selectUsedInBoundAggregation",
			minversion : "1.38",
			resolution : "Use the '$select' binding parameter when binding an aggregation against "
				+ "an OData V4 model, or 'select' in case of an OData V2 model",
			resolutionurls : [{
				href : "https://sdk.openui5.org/topic/408b40efed3c416681e1bd8cdd8910d4#section_useSelectQuery",
				text : "Documentation: Performance: Speed Up Your App"
			}, {
				href : "https://sdk.openui5.org/topic/10ca58b701414f7f93cd97156f898f80",
				text : "OData V4 only: Automatic determination of $expand and $select"
			}, {
				href : "https://sdk.openui5.org/api/sap.ui.model.odata.v4.ODataModel/methods/bindList",
				text : "Documentation: v4.ODataModel#bindList"
			}, {
				href : "https://sdk.openui5.org/api/sap.ui.model.odata.v2.ODataModel/methods/bindList",
				text : "Documentation: v2.ODataModel#bindList"
			}],
			title : "Model: Use the $select/select binding parameter when binding aggregations to "
				+ "improve performance",
			check : fnCheckSelect
		};

	return [oBindingPathSyntaxValidation, oSelectUsedInAggregation];
}, true);