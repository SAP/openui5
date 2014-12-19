/*!
 * ${copyright}
 */

// Provides object sap.ui.model.odata.AnnotationHelper
sap.ui.define(['jquery.sap.global', 'sap/ui/base/BindingParser'],
	function(jQuery, BindingParser) {
		'use strict';

		var rBadChars = /[\\\{\}:]/, // @see sap.ui.base.BindingParser: rObject, rBindingChars
			fnEscape = BindingParser.complexParser.escape;

		/**
		 * Handling of <a href="http://docs.oasis-open.org/odata/odata/v4.0/errata01/os/complete/part3-csdl/odata-v4.0-errata01-os-part3-csdl-complete.html#_Toc395268262">
		 * 14.5.3.1.1 Function odata.concat</a>.
		 *
		 * @param {object[]} aParameters
		 *    the parameters
		 * @param {sap.ui.model.Binding} oBinding
		 *    the binding related to the current formatter call
		 * @returns {string}
		 *    the resulting string value to write into the processed XML
		 */
		function concat(aParameters, oBinding) {
			var aParts = [],
				i, oParameter;

			for (i = 0; i < aParameters.length; i += 1) {
				oParameter = aParameters[i];
				if (oParameter) {
					switch (oParameter.Type) {
					case "Path":
						aParts.push(formatPath(oParameter.Value, oBinding));
						break;
					case "String":
						aParts.push(escapedString(oParameter.Value));
						break;
					//TODO support non-string constants
					default:
						aParts.push("<" + unsupported(oParameter) + ">");
					}
				} else {
					aParts.push("<" + unsupported(oParameter) + ">");
				}
			}
			return aParts.join("");
		}

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

						case "Edm.DateTimeOffset":
							sType = 'sap.ui.model.odata.type.DateTimeOffset';
							break;

						case "Edm.Decimal":
							sType = 'sap.ui.model.odata.type.Decimal';
							oConstraints.precision = oProperty.precision;
							oConstraints.scale = oProperty.scale;
							break;

						case "Edm.Double":
							sType = 'sap.ui.model.odata.type.Double';
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

						case "Edm.Time":
							sType = 'sap.ui.model.odata.type.Time';
							break;

						default:
							// type remains undefined, no mapping is known
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
		 * Handles unsupported cases.
		 *
		 * @param {any} vRawValue
		 *    the raw value from the meta model
		 * @returns {string}
		 *    the resulting string value to write into the processed XML
		 */
		function unsupported(vRawValue) {
			if (typeof vRawValue === "object") {
				// anything else: convert to string, prefer JSON
				try {
					return fnEscape("Unsupported: " + JSON.stringify(vRawValue));
				} catch (ex) {
					// "Converting circular structure to JSON"
				}
			}
			return escapedString(vRawValue);
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

				// 14.5.3 Expression edm:Apply
				if (vRawValue && vRawValue.Apply && typeof vRawValue.Apply === "object") {
					switch (vRawValue.Apply.Name) {
					case "odata.concat": // 14.5.3.1.1 Function odata.concat
						if (jQuery.isArray(vRawValue.Apply.Parameters)) {
							return concat(vRawValue.Apply.Parameters, this.currentBinding());
						}
						break;
					// fall through to the global "unsupported"
					// no default
					}
				}

				return unsupported(vRawValue);
			},

			/**
			 * A formatter helping to interpret OData v4 annotations during template processing.
			 * Returns only a simple path for bindings, without type or constraint information
			 * (at least for those simple cases where this is possible).
			 *
			 * @param {any} vRawValue
			 *    the raw value from the meta model
			 * @returns {string}
			 *    the resulting string value to write into the processed XML
			 */
			simplePath : function (vRawValue) {
				// 14.5.12 Expression edm:Path
				if (vRawValue && vRawValue.hasOwnProperty("Path")) {
					if (typeof vRawValue.Path === "string") {
						return rBadChars.test(vRawValue.Path)
							? formatPath(vRawValue.Path, this.currentBinding())
							: "{" + vRawValue.Path + "}";
					}
					return illegalValue(vRawValue, "Path");
				}

				return unsupported(vRawValue);
			}
		};
	}, /* bExport= */ true);
