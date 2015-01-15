/*!
 * ${copyright}
 */

// Provides object sap.ui.core.sample.ViewTemplate.scenario.FieldHelper
//TODO is this a SAPUI5 module or how to provide this static formatter?
sap.ui.define(['jquery.sap.global'],
	function(jQuery) {
		'use strict';

		/**
		 * The Field helper which can act as a formatter in XML template views.
		 *
		 * @alias sap.ui.core.sample.ViewTemplate.scenario.FieldHelper
		 * @private
		 */
		return {
			/*
			 * Returns the
			 */
			getTargetAsNavigationProperty: function (vRawValue) {
				//TODO "productize"
				var aParts = vRawValue.AnnotationPath.split("/");
				// Note: if no / is contained, return binding to empty path!
				return "{" + (aParts.length > 1 ? aParts[0] : "") + "}";
			},
			/*
			 * @param {sap.ui.model.Context} oContext
			 */
			resolveTargetPath: function (oContext) {
				//TODO "productize"
				var vRawValue = oContext.getObject(),
					aParts = oContext.getPath().split("/");
				if (vRawValue && vRawValue.Path
					&& aParts[0] === "" && aParts[1] === "dataServices" && aParts[2] === "schema") {
					// go to "/dataServices/schema/<i>/entityType/<j>/property/<k>"
					aParts.splice(6, aParts.length - 6);
					aParts.push("property");
					jQuery.each(oContext.getProperty(aParts.join("/")), function (k, oProperty) {
						if (oProperty.name === vRawValue.Path) {
							aParts.push(k);
							return false; //break
						}
					});
					return aParts.join("/");
				}
			}
		};
	}, /* bExport= */ true);
