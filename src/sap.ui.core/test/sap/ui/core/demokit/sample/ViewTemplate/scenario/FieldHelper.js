/*!
 * ${copyright}
 */

// Provides object sap.ui.core.sample.ViewTemplate.scenario.FieldHelper
//TODO is this a SAPUI5 module or how to provide this static formatter?
sap.ui.define(['jquery.sap.global'],
	function(jQuery) {
		'use strict';

		/**
		 * Copied from AnnotationHelper. TODO Make API.
		 */
		function getProperty(sPath, oBinding) {
			var oModel = oBinding.getModel(),
				sResolvedPath // resolved binding path (not relative anymore!)
					= oModel.resolve(oBinding.getPath(), oBinding.getContext()),
				aParts = sResolvedPath.split("/"), // parts of binding path (between slashes)
				aProperties,
				oProperty = undefined,
				sType;

			if (aParts[0] === "" && aParts[1] === "dataServices" && aParts[2] === "schema") {
				// go up to "/dataServices/schema/<i>/entityType/<j>/"
				aParts.splice(6, aParts.length - 6);
				aParts.push("property");
				aProperties = oModel.getProperty(aParts.join("/"));

				jQuery.each(aProperties, function (i, oProperty0) {
					if (oProperty0.name === sPath) {
						oProperty = oProperty0;
						return false; //break
					}
				});
			}
			return oProperty;
		}

		function getPropertyAnnotation(sPath, oBinding, sAnnotationName) {
			var oProperty = getProperty(sPath, oBinding);

			return oProperty && oProperty[sAnnotationName];
		}

		function isSemantics(oControl, vRawValue, sExpectedSemantics) {
			if (vRawValue && vRawValue.hasOwnProperty("Path")) {
				return sExpectedSemantics === getPropertyAnnotation(vRawValue.Path,
					oControl.currentBinding(), "sap:semantics");
			}
		}

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
			isEmail: function (vRawValue) {
				return vRawValue === "email";
			},
			isSemanticsTel: function (vRawValue) {
				return isSemantics(this, vRawValue, "tel");
			},
			getAnnotation: function (vRawValue, sAnnotationName) {
				if (vRawValue && vRawValue.hasOwnProperty("Path")) {
					return getPropertyAnnotation(vRawValue.Path,
						this.currentBinding(), sAnnotationName);
				}
				throw new Error("Path expected");
			},
			/*
			 * @param {sap.ui.model.Context} oContext
			 */
			resolveTargetPath: function (oContext) {
				//TODO "productize"
				var vRawValue = oContext.getObject(),
					aParts = oContext.getPath().split("/");
				if (vRawValue && vRawValue.AnnotationPath && vRawValue.AnnotationPath.charAt(0) === "@"
					&& aParts[0] === "" && aParts[1] === "dataServices" && aParts[2] === "schema") {
					// go to "/dataServices/schema/<i>/entityType/<j>/<annotation name>"
					aParts.splice(6, aParts.length - 6);
					aParts.push(vRawValue.AnnotationPath.slice(1));
					return aParts.join("/");
				}
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
