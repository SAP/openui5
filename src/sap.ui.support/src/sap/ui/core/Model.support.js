/*!
 * ${copyright}
 */
/**
 * Defines support rules related to the model.
 */
sap.ui.define(["jquery.sap.global",
		"sap/ui/support/library",
		"sap/ui/support/supportRules/util/StringAnalyzer",
		"sap/ui/model/ListBinding",
		"sap/ui/model/json/JSONModel",
		"sap/ui/model/odata/ODataMetadata",
		"sap/ui/model/CompositeBinding",
		"sap/ui/model/PropertyBinding"],
	function(
		jQuery,
		SupportLib,
		StringAnalyzer,
		ListBinding,
		JSONModel,
		ODataMetadata,
		CompositeBinding,
		PropertyBinding) {
	"use strict";

	// shortcuts
	var Categories = SupportLib.Categories; // Accessibility, Performance, Memory, ...
	var Severity = SupportLib.Severity; // Hint, Warning, Error
	var Audiences = SupportLib.Audiences; // Control, Internal, Application

	return {
		addRulesToRuleSet: function(oRuleSet) {

			//**********************************************************
			// Rule Definitions
			//**********************************************************
			/**
			 * Checks whether there are property bindings for models where the model is undefined
			 */
			oRuleSet.addRule({
				id: "unresolvedPropertyBindings",
				audiences: [Audiences.Control, Audiences.Application],
				categories: [Categories.Bindings],
				enabled: true,
				minversion: "1.32",
				title: "Unresolved Property Bindings",
				description: "Unresolved bindings might be caused by typos in their path",
				resolution: "Check the binding path for typos",
				resolutionurls: [
					{
						href: "https://sapui5.hana.ondemand.com/#docs/api/symbols/sap.ui.model.Context.html",
						text: "Context class"
					},
					{
						href: "https://sapui5.hana.ondemand.com/#docs/guide/e5310932a71f42daa41f3a6143efca9c.html",
						text: "Data binding"
					},
					{
						href: "https://sapui5.hana.ondemand.com/#docs/guide/97830de2d7314e93b5c1ee3878a17be9.html",
						text: "Aggregation binding with templates"
					},
					{
						href: "https://sapui5.hana.ondemand.com/#docs/guide/6c7c5c266b534e7ea9a28f861dc515f5.html",
						text: "Element binding"
					}
				],
				check: function(oIssueManager, oCoreFacade, oScope) {
					var mElements = oScope.getElements();
					for (var n in mElements) {
						var oElement = mElements[n],
							mBindingInfos = oElement.mBindingInfos;
						for (var m in mBindingInfos) {
							var oBinding = mBindingInfos[m].binding;
							if (oBinding) {
								if (!(oBinding instanceof CompositeBinding) && oBinding instanceof PropertyBinding && oBinding.getModel()) {
									if (oBinding.getValue() === undefined) {
										oIssueManager.addIssue({
											severity: Severity.Low,
											details: "Element " + oElement.getId() + " has unresolved bindings.",
											context: {
												id: oElement.getId()
											}
										});
									}
								}
							}
						}
					}
				}
			});

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

			/**
			 * Checks whether there are bindings for models where the model is available but a binding has no result
			 * It checks the path structure and checks for typos
			 */
			oRuleSet.addRule({
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
						href: "https://sapui5.hana.ondemand.com/#docs/api/symbols/sap.ui.model.Context.html",
						text: "API Reference: Context"
					},
					{
						href: "https://sapui5.hana.ondemand.com/#docs/guide/e5310932a71f42daa41f3a6143efca9c.html",
						text: "Documentation: Data Binding"
					},
					{
						href: "https://sapui5.hana.ondemand.com/#docs/guide/97830de2d7314e93b5c1ee3878a17be9.html",
						text: "Data Binding Tutorial - Step 12: Aggregation Binding Using Templates"
					},
					{
						href: "https://sapui5.hana.ondemand.com/#docs/guide/6c7c5c266b534e7ea9a28f861dc515f5.html",
						text: "Data Binding Tutorial - Step 13: Element Binding"
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
											severity: Severity.High,
											details: "Element " + oElement.getId() + " " + oBinding.getPath() + " has unresolved bindings.",
											resolution: "You could try '" + sJsonModelBestMatch + "' instead",
											context: {
												id: oElement.getId()
											}
										});
									}

								} else if (oBinding.getValue && oBinding.getValue() === oBinding.getPath()) {
									oIssueManager.addIssue({
										severity: Severity.Low,
										details: "Element " + oElement.getId() + " " + oBinding.getPath() + " has the same value as the path. Potential Error.",
										context: {
											id: oElement.getId()
										}
									});
								}
							}
						});
					});
				}
			});
		}
	};

}, true);
