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
		 * Handling of "14.5.3.1.1 Function odata.concat".
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
		 * Handling of "14.5.3.1.2 Function odata.fillUriTemplate".
		 *
		 * @param {object[]} aParameters
		 *    the parameters
		 * @param {sap.ui.model.Binding} oBinding
		 *    the binding related to the current formatter call
		 * @returns {string}
		 *    an expression binding in the format "{= odata.fillUriTemplate('template',
		 *    {'param1': ${path1}, 'param2': ${path2}, ...}" or <code>undefined</code>
		 *    if the parameters could not be processed
		 */
		function fillUriTemplate(aParameters, oBinding) {
			var i,
				aParts = [],
				sPrefix,
				sValue;

			if (!jQuery.isArray(aParameters) || !aParameters.length
					|| aParameters[0].Type !== "String") {
				return undefined;
			}
			aParts.push('{= odata.fillUriTemplate(');
			aParts.push(stringify(aParameters[0].Value));
			aParts.push(', {');
			sPrefix = "";
			for (i = 1; i < aParameters.length; i += 1) {
				aParts.push(sPrefix);
				aParts.push(stringify(aParameters[i].Name));
				aParts.push(": ");
				sValue = aParameters[i].Value.Value;
				// TODO support expressions, not only paths
				if (aParameters[i].Value.Type !== "Path" || rBadChars.test(sValue)) {
					aParts.push("'<Unsupported: ");
					aParts.push(stringify(aParameters[i].Value).replace(/'/g, "\\'"));
					aParts.push(">'");
				} else {
					aParts.push("${");
					aParts.push(sValue);
					aParts.push("}");
				}
				sPrefix = ", ";
			}
			aParts.push("})}");
			return aParts.join("");
		}

		/**
		 * Handling of "14.5.12 Expression edm:Path".
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

			return "{path : " + stringify(sPath) + ", type : '" + sType
				+ "', constraints : " + stringify(oConstraints) + "}";
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
		 * Stringifies the value for usage in a XML attribute value. Prefers the single quote over
		 * the double quote.
		 *
		 * @param {any} vValue the value
		 * @returns {string} the stringified value
		 * @throws {Error} if the value cannot be stringified
		 */
		function stringify(vValue) {
			var sStringified = JSON.stringify(vValue),
				bEscaped = false,
				sResult = "",
				i, c;

			for (i = 0; i < sStringified.length; i += 1) {
				switch (c = sStringified.charAt(i)) {
					case "'": // a single quote must be escaped (can only occur within a string)
						sResult += "\\'";
						break;
					case '"':
						if (bEscaped) { // a double quote needs no escaping (only within a string)
							sResult += c;
							bEscaped = false;
						} else { // string begin or end with single quotes
							sResult += "'";
						}
						break;
					case "\\":
						if (bEscaped) { // an escaped backslash
							sResult += "\\\\";
						}
						bEscaped = !bEscaped;
						break;
					default:
						if (bEscaped) {
							sResult += "\\";
							bEscaped = false;
						}
						sResult += c;
				}
			}
			return sResult;
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
					return fnEscape("Unsupported: " + stringify(vRawValue));
				} catch (ex) {
					// "Converting circular structure to JSON"
				}
			}
			return escapedString(vRawValue);
		}

		/**
		 * @classdesc
		 * A collection of methods which help to consume
		 * <a href="http://docs.oasis-open.org/odata/odata/v4.0/odata-v4.0-part3-csdl.html">
		 * OData v4 annotations</a> in XML template views.
		 *
		 * Formatter functions like {@link #.format format} and {@link #.simplePath simplePath} can
		 * be used in complex bindings to turn OData v4 annotations into texts or data bindings,
		 * e.g. <code>&lt;sfi:SmartField value="{path: 'meta>Value', formatter:
		 * 'sap.ui.model.odata.AnnotationHelper.simplePath'}"/></code>.
		 *
		 * Helper functions like {@link #.resolvePath resolvePath} can be used by template
		 * instructions in XML template views, e.g. <code>&lt;template:with path="meta>Value"
		 * helper="sap.ui.model.odata.AnnotationHelper.resolvePath" var="target"></code>.
		 *
		 * You need to {@link jQuery.sap.require} this module before use!
		 *
		 * @public
		 * @namespace sap.ui.model.odata.AnnotationHelper
		 */
		return /** @lends sap.ui.model.odata.AnnotationHelper */ {
			/**
			 * A formatter function to be used in a complex binding inside an XML template view
			 * in order to interpret OData v4 annotations. It knows about
			 * <ul>
			 *   <li> the constant "14.4.11 Expression edm:String", which is turned into a fixed
			 *   text;
			 *   <li> the dynamic "14.5.3 Expression edm:Apply"
			 *   <ul>
			 *     <li> "14.5.3.1.1 Function odata.concat" is turned into a data binding
			 *     expression relative to an entity;
			 *     <li> "14.5.3.1.2 Function odata.fillUriTemplate" is turned into an expression
			 *     binding to fill the template at run-time;
			 *   </ul>
			 *   <li> the dynamic "14.5.12 Expression edm:Path", which is turned into a data
			 *   binding relative to an entity, including type information and constraints as
			 *   available from meta data.
			 * </ul>
			 * Unsupported values are turned into a string nevertheless, but indicated as such.
			 * Illegal values are output "as is" for a human reader to make sense of them.
			 * Proper escaping is used to make sure that data binding syntax is not corrupted.
			 *
			 * Example:
			 * <pre>
			 * &lt;Text text="{path: 'meta>Value', formatter: 'sap.ui.model.odata.AnnotationHelper.format'}" />
			 * </pre>
			 *
			 * @param {any} vRawValue
			 *    the raw value from the meta model
			 * @returns {string}
			 *    the resulting string value to write into the processed XML
			 * @public
			 */
			format : function (vRawValue) {
				var sResult;

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
					case "odata.fillUriTemplate": // 14.5.3.1.2 Function odata.fillUriTemplate
						sResult = fillUriTemplate(vRawValue.Apply.Parameters,
							this.currentBinding());
						if (sResult) {
							return sResult;
						}
						break;
					// fall through to the global "unsupported"
					// no default
					}
				}

				return unsupported(vRawValue);
			},

			/**
			 * Helper function for a <code>template:with</code> instruction that resolves a dynamic
			 * "14.5.2 Expression edm:AnnotationPath". Currently supports navigation properties
			 * and term casts.
			 *
			 * Example:
			 * <pre>
			 *   &lt;template:with path="meta>Value" helper="sap.ui.model.odata.AnnotationHelper.resolvePath" var="target">
			 * </pre>
			 *
			 * @param {sap.ui.model.Context} oContext
			 *   a context which must point to an annotation or annotation property of type
			 *   <code>Edm.AnnotationPath</code>, embedded within an entity type;
			 *   the context's model must be an {@link sap.ui.model.odata.ODataMetaModel}
			 * @returns {string}
			 *   the path to the target
			 * @public
			 */
			resolvePath : function (oContext) {
				var aMatches,
					sPath,
					vRawValue = oContext.getObject();

				aMatches = /^(\/dataServices\/schema\/\d+\/entityType\/\d+)(?:\/|$)/.exec(
					oContext.getPath());
				if (aMatches) {
					// start at entity type ("/dataServices/schema/<i>/entityType/<j>")
					sPath = aMatches[1];

					if (vRawValue.AnnotationPath === "") { // empty path
						return sPath;
					}

					jQuery.each(vRawValue.AnnotationPath.split("/"), function (iUnused, sSegment) {
						var oAssociationEnd,
							oEntity,
							oModel = oContext.getModel();

						// term cast
						if (sSegment.charAt(0) === "@") {
							sPath = sPath + "/" + sSegment.slice(1);
							return true; // continue
						}

						// navigation property
						oEntity = oContext.getObject(sPath);
						oAssociationEnd = oModel.getODataAssociationEnd(oEntity, sSegment);
						if (oAssociationEnd) {
							sPath = oModel.getODataEntityType(oAssociationEnd.type, true);
							return true; // continue
						}

						sPath = undefined; // some unsupported case
						return false; // break
					});

					return sPath;
				}
			},

			/**
			 * A formatter function to be used in a complex binding inside an XML template view
			 * in order to interpret OData v4 annotations, quite like {@link #.format format} but
			 * with a simplified output aimed at design-time templating with smart controls.
			 * It only knows about the dynamic "14.5.12 Expression edm:Path", which is turned into
			 * a simple binding path, without type or constraint information (at least for those
			 * simple cases where this is possible).
			 *
			 * Example:
			 * <pre>
			 *   &lt;sfi:SmartField value="{path: 'meta>Value', formatter: 'sap.ui.model.odata.AnnotationHelper.simplePath'}"/>
			 * </pre>
			 *
			 * @param {any} vRawValue
			 *    the raw value from the meta model
			 * @returns {string}
			 *    the resulting string value to write into the processed XML
			 * @public
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
