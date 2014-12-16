/*!
 * ${copyright}
 */

// Provides object sap.ui.model.odata.AnnotationHelper
sap.ui.define(['jquery.sap.global', 'sap/ui/base/BindingParser'],
	function(jQuery, BindingParser) {
		'use strict';

		var fnEscape = BindingParser.complexParser.escape;

		/**
		 * Returns the given value properly turned into a string and escaped.
		 *
		 * @param {any} vValue
		 *   any value
		 * @returns {string}
		 *   the given value properly turned into a string and escaped
		 */
		function escapedString(vValue) {
			return fnEscape(String(vValue));
		}

		/**
		 * Handling of <a href="http://docs.oasis-open.org/odata/odata/v4.0/errata01/os/complete/part3-csdl/odata-v4.0-errata01-os-part3-csdl-complete.html#_Toc395268276">
		 * 14.5.12 Expression edm:Path</a>.
		 *
		 * @param {string} sPath
		 *    the string path value from the meta model
		 * @param {sap.ui.model.Binding} oBinding
		 *    the binding related to the current formatter call
		 * @returns {string}
		 *    the resulting string value to write into the processed XML
		 */
		function formatPath(sPath, oBinding) {
			var oConstraints = {},
				oModel = oBinding.getModel(),
				sResolvedPath // resolved binding path (not relative anymore!)
					= oModel.resolve(oBinding.getPath(), oBinding.getContext()),
				aParts = sResolvedPath.split("/"), // parts of binding path (between slashes)
				aProperties,
				sType;

			if (aParts[0] === "" && aParts[1] === "dataServices" && aParts[2] === "schema") {
				// go up to "/dataServices/schema/<i>/entityType/<j>/"
				aParts.splice(6, aParts.length - 6);
				aParts.push("property");
				aProperties = oModel.getProperty(aParts.join("/"));

				jQuery.each(aProperties, function (i, oProperty) {
					if (oProperty.name === sPath) {
						switch (oProperty.type) {
						case "Edm.Boolean":
							sType = 'sap.ui.model.odata.type.Boolean';
							break;

						case "Edm.DateTime":
							sType = 'sap.ui.model.odata.type.DateTime';
							oConstraints.displayFormat = oProperty["sap:display-format"];
							break;

						case "Edm.Decimal":
							sType = 'sap.ui.model.odata.type.Decimal';
							oConstraints.precision = oProperty.precision;
							oConstraints.scale = oProperty.scale;
							break;

						case "Edm.Guid":
							sType = 'sap.ui.model.odata.type.Guid';
							break;

						case "Edm.Int16":
							sType = 'sap.ui.model.odata.type.Int16';
							break;

						case "Edm.Int32":
							sType = 'sap.ui.model.odata.type.Int32';
							break;

						case "Edm.SByte":
							sType = 'sap.ui.model.odata.type.SByte';
							break;

						case "Edm.String":
							sType = 'sap.ui.model.odata.type.String';
							oConstraints.maxLength = oProperty.maxLength;
							break;

						//TODO default: what?
						}
						oConstraints.nullable = oProperty.nullable;
					}
				});
			}

			return "{path : " + JSON.stringify(sPath) + ", type : '" + sType
				+ "', constraints : " + JSON.stringify(oConstraints) + "}";
		}

		/**
		 * Warns about an illegal value for a type and returns an appropriate string representation
		 * of the value.
		 *
		 * @param {any} vRawValue
		 *    the raw value from the meta model
		 * @param {string} sName
		 *    the name of the property which holds the illegal value
		 * @returns {string}
		 *    the resulting string value to write into the processed XML
		 */
		function illegalValue(vRawValue, sName) {
			jQuery.sap.log.warning("Illegal value for " + sName + ": "
					+ vRawValue[sName], null, "sap.ui.model.odata.AnnotationHelper");
			return escapedString(vRawValue[sName]);
		}

		/**
		 * The OData helper which can act as a formatter in XML template views.
		 *
		 * @alias sap.ui.model.odata.AnnotationHelper
		 * @private
		 */
		return {
			/**
			 * A formatter helping to interpret OData v4 annotations during template processing.
			 *
			 * @param {any} vRawValue
			 *    the raw value from the meta model
			 * @returns {string}
			 *    the resulting string value to write into the processed XML
			 */
			format : function (vRawValue) {
				// 14.4.11 Expression edm:String
				if (vRawValue && vRawValue.hasOwnProperty("String")) {
					if (typeof vRawValue.String === "string") {
						return fnEscape(vRawValue.String);
					}
					return illegalValue(vRawValue, "String");
				}

				// 14.5.12 Expression edm:Path
				if (vRawValue && vRawValue.hasOwnProperty("Path")) {
					if (typeof vRawValue.Path === "string") {
						return formatPath(vRawValue.Path, this.currentBinding());
					}
					return illegalValue(vRawValue, "Path");
				}

				if (typeof vRawValue === "object") {
					// anything else: convert to string, prefer JSON
					try {
						return fnEscape("Unsupported type: " + JSON.stringify(vRawValue));
					} catch (ex) {
						// "Converting circular structure to JSON"
					}
				}
				return escapedString(vRawValue);
			}
		};
	}, /* bExport= */ true);
