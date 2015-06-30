/*!
 * ${copyright}
 */

/**
 * @fileOverview Custom extension sample for GWSAMPLE_BASIC OData service.
 * @version @version@
 */
sap.ui.define([
		'sap/ui/core/sample/ViewTemplate/scenario/Component'
	], function (BaseComponent) {
	"use strict";

	var oCustomizing = {
			"sap.ui.viewExtensions" : {
				"sap.ui.core.sample.ViewTemplate.scenario.Detail" : {
					"HeaderInfo" : {
						className : "sap.ui.core.Fragment",
						fragmentName :
							"sap.ui.core.sample.ViewTemplate.scenario.extension.HeaderInfo",
						type : "XML"
					}
				},
				"sap.ui.core.sample.ViewTemplate.scenario.FormFacet" : {
					"afterTitle" : {
						className : "sap.ui.core.Fragment",
						fragmentName :
							"sap.ui.core.sample.ViewTemplate.scenario.extension.ReferenceFacet",
						type : "XML"
					}
				},
				"sap.ui.core.sample.ViewTemplate.scenario.extension.ReferenceFacet" : {
					"replace.me" : {
						className : "sap.ui.core.Fragment",
						fragmentName :
							"sap.ui.core.sample.ViewTemplate.scenario.extension.AnnotationPath",
						type : "XML"
					}
				}
			}
		};

	return BaseComponent.extend(
				"sap.ui.core.sample.ViewTemplate.scenario.extension.Component", {
					metadata : {
						customizing : oCustomizing
					}
				}
			);
});
