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

	function fragment(sFileName) {
		return {
				className : "sap.ui.core.Fragment",
				fragmentName : sPackage + sFileName,
				type : "XML"
			};
	}

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
								"ReferenceFacet.fragment.xml",
								// TODO remove the line below if file list handling is fixed
								// List of files inherited from parent component; overwrite list
								// entries to avoid links to files that cannot be accessed
								" ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "
							]
						}
					},
					customizing : {
						"sap.ui.viewExtensions" : {
							"sap.ui.core.sample.ViewTemplate.scenario.Detail" : {
								"HeaderInfo" : fragment("HeaderInfo")
							},
							"sap.ui.core.sample.ViewTemplate.scenario.FormFacet" : {
								"afterTitle" : fragment("ReferenceFacet")
							},
							"sap.ui.core.sample.ViewTemplate.scenario.extension.ReferenceFacet" : {
								"replace.me" : fragment("AnnotationPath")
							}
						}
					}
				}
			}
		);

		return oExtendedComponent;
});
