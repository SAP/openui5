/*!
 * ${copyright}
 */

/**
 * @fileOverview Custom extension sample for GWSAMPLE_BASIC OData service.
 * @version @version@
 */
sap.ui.define([
	"sap/ui/core/sample/ViewTemplate/scenario/Component"
], function (BaseComponent) {
	"use strict";

	var sPackage = "sap.ui.core.sample.ViewTemplate.scenario.extension.",
		oExtendedComponent = BaseComponent.extend(
			"sap.ui.core.sample.ViewTemplate.scenario.extension.Component", {
				metadata : {
					config : {
						sample : {
							files : [
								"AnnotationPath.fragment.xml",
								"Component.js",
								"HeaderInfo.fragment.xml",
								"ReferenceFacet.fragment.xml"
							]
						}
					},
					customizing : {
						"sap.ui.viewExtensions" : {
							"sap.ui.core.sample.ViewTemplate.scenario.Detail" : {
								HeaderInfo : fragment("HeaderInfo")
							},
							"sap.ui.core.sample.ViewTemplate.scenario.FormFacet" : {
								afterTitle : fragment("ReferenceFacet")
							},
							"sap.ui.core.sample.ViewTemplate.scenario.extension.ReferenceFacet" : {
								"replace.me" : fragment("AnnotationPath")
							}
						}
					}
				}
			}
		);

	function fragment(sFileName) {
		return {
				className : "sap.ui.core.Fragment",
				fragmentName : sPackage + sFileName,
				type : "XML"
			};
	}

	return oExtendedComponent;
});
