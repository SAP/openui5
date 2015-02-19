/*!
 * ${copyright}
 */

// Provides object sap.ui.model.odata.AnnotationHelper
sap.ui.define(['jquery.sap.global', 'sap/ui/base/BindingParser'],
	function(jQuery, BindingParser) {
		'use strict';

		var AnnotationHelper,
			rBadChars = /[\\\{\}:]/, // @see sap.ui.base.BindingParser: rObject, rBindingChars
			// path to entity type ("/dataServices/schema/<i>/entityType/<j>")
			rEntityTypePath = /^(\/dataServices\/schema\/\d+\/entityType\/\d+)(?:\/|$)/,
			fnEscape = BindingParser.complexParser.escape;

		/**
		 * Handling of "14.5.3.1.1 Function odata.concat".
		 *
		 * @param {sap.ui.core.util.XMLPreprocessor.IContext|sap.ui.model.Context} oInterface
		 *   the callback interface related to the current formatter call
		 * @param {object[]} aParameters
		 *   the parameters
		 * @returns {string}
		 *   the resulting string value to write into the processed XML
		 */
		function concat(oInterface, aParameters) {
			var aParts = [],
				i, oParameter;

			for (i = 0; i < aParameters.length; i += 1) {
				oParameter = aParameters[i];
				if (oParameter) {
					switch (oParameter.Type) {
					case "Path":
						aParts.push(formatPath(oInterface, oParameter.Value, true).value);
						break;
					case "String":
						aParts.push(escapedString(oParameter.Value));
						break;
					//TODO support non-string constants
					default:
						aParts.push("[" + unsupported(oParameter) + "]");
					}
				} else {
					aParts.push("[" + unsupported(oParameter) + "]");
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
		 * Calculates a dynamic expression.
		 *
		 * @param {sap.ui.core.util.XMLPreprocessor.IContext|sap.ui.model.Context} oInterface
		 *   the callback interface related to the current formatter call
		 * @param {object} oRawValue
		 *   the raw value from the meta model
		 * @returns {object}
		 *   the evaluated expression with the following parameters:
		 *   result: "constant", "binding" or "expression"
		 *   value: the value to write into the resulting string; constant values are not escaped;
		 *     expressions are not wrapped (no "{=" and "}")
		 *   type: the EDM data type (like "Edm.String") if it could be determined
		 */
		function dynamicExpression(oInterface, oRawValue) {
			var sResult;

			if (!oRawValue) {
				return {
					result: "constant",
					value: unsupported(oRawValue, true),
					type: "Edm.String"
				};
			}

			switch (oRawValue.Type) {
			case "Path": // 14.5.12 Expression edm:Path
				return formatPath(oInterface, oRawValue.Value, false);
			case "String": // 14.4.11 Expression edm:String
				return {
					result: "constant",
					value: oRawValue.Value,
					type: "Edm.String"
				};
			case undefined:
				if (oRawValue.Path) { // 14.5.12 Expression edm:Path
					return formatPath(oInterface, oRawValue.Path, false);
				}
				break;
			// fall through to the global "unsupported"
			// no default
			}

			// 14.5.3 Expression edm:Apply
			if (oRawValue.Apply && typeof oRawValue.Apply === "object") {
				switch (oRawValue.Apply.Name) {
				case "odata.uriEncode": // 14.5.3.1.3 Function odata.uriEncode
					sResult = uriEncode(oInterface, oRawValue.Apply.Parameters);
					if (sResult) {
						return {
							result: "expression",
							value: sResult.slice(2, -1),
							type: "Edm.String"
						};
					}
					break;
				// fall through to the global "unsupported"
				// no default
				}
			}

			//TODO constants, apply functions
			return {
				result: "constant",
				value: unsupported(oRawValue, true),
				type: "Edm.String"
			};
		}

		/**
		 * Handling of "14.5.3.1.2 Function odata.fillUriTemplate".
		 *
		 * @param {sap.ui.core.util.XMLPreprocessor.IContext|sap.ui.model.Context} oInterface
		 *   the callback interface related to the current formatter call
		 * @param {object[]} aParameters
		 *   the parameters
		 * @returns {string}
		 *   an expression binding in the format "{= odata.fillUriTemplate('template',
		 *   {'param1': ${path1}, 'param2': ${path2}, ...}" or <code>undefined</code>
		 *   if the parameters could not be processed
		 */
		function fillUriTemplate(oInterface, aParameters) {
			var i,
				aParts = [],
				sPrefix,
				oParameter;

			if (!jQuery.isArray(aParameters) || !aParameters.length || !aParameters[0]
					|| aParameters[0].Type !== "String") {
				return undefined;
			}
			aParts.push('{=odata.fillUriTemplate(');
			aParts.push(stringify(aParameters[0].Value));
			aParts.push(', {');
			sPrefix = "";
			for (i = 1; i < aParameters.length; i += 1) {
				aParts.push(sPrefix);
				aParts.push(stringify(aParameters[i].Name));
				aParts.push(": ");
				oParameter = dynamicExpression(oInterface, aParameters[i].Value);
				switch (oParameter.result) {
				case "binding":
					aParts.push("$" + oParameter.value);
					break;
				case "expression":
					aParts.push(oParameter.value);
					break;
				default:
					aParts.push(stringify(oParameter.value));
				}
				sPrefix = ", ";
			}
			aParts.push("})}");
			return aParts.join("");
		}

		/**
		 * Follows the dynamic "14.5.12 Expression edm:Path" (or variant thereof) contained within
		 * the given raw value, starting the absolute path identified by the given interface, and
		 * returns the resulting absolute path as well as some other aspects about the path.
		 *
		 * @param {sap.ui.core.util.XMLPreprocessor.IContext|sap.ui.model.Context} oInterface
		 *   the callback interface related to the current formatter call; the path must be within
		 *   an entity type!
		 * @param {any} vRawValue
		 *   the raw value from the meta model, e.g. <code>{AnnotationPath :
		 *   "ToSupplier/@com.sap.vocabularies.Communication.v1.Address"}</code> or <code>
		 *   {AnnotationPath : "@com.sap.vocabularies.UI.v1.FieldGroup#Dimensions"}</code>
		 * @returns {object}
		 *   - {object} [associationSetEnd=undefined]
		 *   association set end corresponding to the last navigation property
		 *   - {boolean} [navigationAfterMultiple=false]
		 *   if the navigation path has an association end with multiplicity "*" which is not
		 *   the last one
		 *   - {boolean} [isMultiple=false]
		 *   whether the navigation path ends with an association end with multiplicity "*"
		 *   - {string[]} [navigationProperties=[]]
		 *   all navigation property names
		 *   - {string} [resolvedPath=undefined]
		 *   the resulting absolute path
		 * @see sap.ui.model.odata.AnnotationHelper.isMultiple
		 */
		function followPath(oInterface, vRawValue) {
			var oAssociationEnd,
				sContextPath,
				oEntity,
				iIndexOfAt,
				aMatches,
				oModel = oInterface.getModel(),
				aParts,
				sPath,
				oResult = {
					associationSetEnd : undefined,
					navigationAfterMultiple : false,
					isMultiple : false,
					navigationProperties : [],
					resolvedPath : undefined
				},
				sSegment;

			if (vRawValue && vRawValue.hasOwnProperty("AnnotationPath")) {
				sPath = vRawValue.AnnotationPath;
			} else if (vRawValue && vRawValue.hasOwnProperty("Path")) {
				sPath = vRawValue.Path;
			} else {
				return undefined; // some unsupported case
			}

			aMatches = rEntityTypePath.exec(oInterface.getPath());
			if (!aMatches) {
				return undefined;
			}

			// start at entity type ("/dataServices/schema/<i>/entityType/<j>")
			sContextPath = aMatches[1];
			aParts = sPath.split("/");

			while (sPath && aParts.length && sContextPath) {
				sSegment = aParts[0];
				iIndexOfAt = sSegment.indexOf("@");
				if (iIndexOfAt === 0) {
					// term cast
					sContextPath += "/" + sSegment.slice(1);
					aParts.shift();
					continue;
//				} else if (iIndexOfAt > 0) { // annotation of a navigation property
//					sSegment = sSegment.slice(0, iIndexOfAt);
				}

				oEntity = oModel.getObject(sContextPath);
				oAssociationEnd = oModel.getODataAssociationEnd(oEntity, sSegment);
				if (oAssociationEnd) {
					// navigation property
					oResult.associationSetEnd
						= oModel.getODataAssociationSetEnd(oEntity, sSegment);
					oResult.navigationProperties.push(sSegment);
					if (oResult.isMultiple) {
						oResult.navigationAfterMultiple = true;
					}
					oResult.isMultiple = oAssociationEnd.multiplicity === "*";
					sContextPath = oModel.getODataEntityType(oAssociationEnd.type, true);
					aParts.shift();
					continue;
				}

				// structural properties or some unsupported case
				sContextPath = oModel.getODataProperty(oEntity, aParts, true);
			}

			oResult.resolvedPath = sContextPath;
			return oResult;
		}

		/**
		 * Handling of "14.5.12 Expression edm:Path".
		 *
		 * @param {sap.ui.core.util.XMLPreprocessor.IContext|sap.ui.model.Context} oInterface
		 *   the callback interface related to the current formatter call
		 * @param {string} sPath
		 *   the string path value from the meta model
		 * @param {boolean} bWithType
		 *   if <code>true</code> the type is included into the binding
		 * @returns {object}
		 *   an object with the following parameters:
		 *   <code>result</code> is "binding", <code>value</code> contains the resulting string
		 *   value to write into the processed XML and <code>type</code> the property type (like
		 *   "Edm.String")
		 */
		function formatPath(oInterface, sPath, bWithType) {
			var oConstraints = {},
				oModel = oInterface.getModel(),
				sContextPath = oInterface.getPath(),
				aMatches = rEntityTypePath.exec(sContextPath),
				oEntityType,
				aParts,
				oProperty,
				oResult = {result: "binding"},
				sType;

			if (aMatches) {
				// go up to "/dataServices/schema/<i>/entityType/<j>/"
				oEntityType = oModel.getProperty(aMatches[1]);

				// determine the property given by sPath
				aParts = sPath.split('/');
				oProperty = oModel.getODataProperty(oEntityType, aParts);

				if (oProperty && !aParts.length) {
					oResult.type = oProperty.type;
					switch (oProperty.type) {
					case "Edm.Boolean":
						sType = 'sap.ui.model.odata.type.Boolean';
						break;

					case "Edm.Byte":
						sType = 'sap.ui.model.odata.type.Byte';
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

					case "Edm.Int64":
						sType = 'sap.ui.model.odata.type.Int64';
						break;

					case "Edm.SByte":
						sType = 'sap.ui.model.odata.type.SByte';
						break;

					case "Edm.Single":
					case "Edm.Float":
						sType = 'sap.ui.model.odata.type.Single';
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
			}

			// TODO warn if type could not be determined
			if (bWithType) {
				oResult.value = "{path : " + stringify(sPath) + ", type : '" + sType
					+ "', constraints : " + stringify(oConstraints) + "}";
			} else if (rBadChars.test(sPath)) {
				oResult.value = "{path : " + stringify(sPath) + "}";
			} else {
				oResult.value = "{" + sPath + "}";
			}
			return oResult;
		}

		/**
		 * Warns about an illegal value for a type and returns an appropriate string representation
		 * of the value.
		 *
		 * @param {any} vRawValue
		 *   the raw value from the meta model
		 * @param {string} sName
		 *   the name of the property which holds the illegal value
		 * @returns {string}
		 *   the resulting string value to write into the processed XML
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
		 *   the raw value from the meta model
		 * @param {boolean} [bSkipEscaping]
		 *   if <code>true</code> the result is not escaped for bindings
		 * @returns {string}
		 *   the resulting string value to write into the processed XML
		 */
		function unsupported(vRawValue, bSkipEscaping) {
			var sText;

			if (typeof vRawValue === "object") {
				// anything else: convert to string, prefer JSON
				try {
					sText = "Unsupported: " + stringify(vRawValue);
				} catch (ex) {
					// "Converting circular structure to JSON"
					sText = String(vRawValue);
				}
			} else {
				sText = String(vRawValue);
			}
			return bSkipEscaping ? sText : fnEscape(sText);
		}

		/**
		 * Handling of "14.5.3.1.3 Function odata.uriEncode".
		 *
		 * @param {sap.ui.core.util.XMLPreprocessor.IContext|sap.ui.model.Context} oInterface
		 *   the callback interface related to the current formatter call
		 * @param {object[]} aParameters
		 *   the parameters
		 * @returns {string}
		 *   an expression binding in the format "{= odata.uriEncode(${path})}" or
		 *   <code>undefined</code> if the parameters could not be processed
		 */
		function uriEncode(oInterface, aParameters) {
			var aParts = [],
				oParameter = aParameters && aParameters[0],
				oPathInfo;

			if (!oParameter) {
				return undefined;
			}
			aParts.push('{=odata.uriEncode(');
			switch (oParameter.Type) {
				case "Path":
					aParts.push('$');
					oPathInfo = formatPath(oInterface, oParameter.Value, false);
					aParts.push(oPathInfo.value);
					aParts.push(", '");
					aParts.push(oPathInfo.type);
					aParts.push("'");
					break;
				case "String":
					aParts.push(stringify(oParameter.Value));
					aParts.push(", 'Edm.String'");
					break;
				//TODO support non-string constants
				default:
					aParts.push(stringify("[Unsupported: " + stringify(oParameter) + "]"));
					aParts.push(", 'Edm.String'");
				}
			aParts.push(')}');
			return aParts.join("");
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
		 * @since 1.27.0
		 * @namespace sap.ui.model.odata.AnnotationHelper
		 */
		AnnotationHelper = /** @lends sap.ui.model.odata.AnnotationHelper */ {
			/**
			 * A formatter function to be used in a complex binding inside an XML template view
			 * in order to interpret OData v4 annotations. It knows about
			 * <ul>
			 *   <li> the constant "14.4.11 Expression edm:String", which is turned into a data
			 *   binding expression (e.g. <code>
			 *   "{/##/dataServices/schema/0/entityType/1/com.sap.vocabularies.UI.v1.FieldGroup#Dimensions/Data/0/Label/String}"
			 *   </code>);
			 *   <li> the dynamic "14.5.3 Expression edm:Apply"
			 *   <ul>
			 *     <li> "14.5.3.1.1 Function odata.concat" is turned into a data binding
			 *     expression relative to an entity;
			 *     <li> "14.5.3.1.2 Function odata.fillUriTemplate" is turned into an expression
			 *     binding to fill the template at run-time;
			 *     <li> "14.5.3.1.3 Function odata.uriEncode" is turned into an expression
			 *     binding to encode the parameter at run-time (it is possible to embed
			 *     <code>odata.uriEncode</code> into <code>odata.fillUriTemplate</code>);
			 *   </ul>
			 *   <li> the dynamic "14.5.12 Expression edm:Path", which is turned into a data
			 *   binding relative to an entity, including type information and constraints as
			 *   available from meta data, e.g. <code>"{path : 'Name',
			 *   type : 'sap.ui.model.odata.type.String', constraints : {'maxLength':'255'}}"
			 *   </code>.
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
			 * @param {sap.ui.core.util.XMLPreprocessor.IContext|sap.ui.model.Context} oInterface
			 *   the callback interface related to the current formatter call
			 * @param {any} vRawValue
			 *   the raw value from the meta model
			 * @returns {string}
			 *   the resulting string value to write into the processed XML
			 * @public
			 */
			format : function (oInterface, vRawValue) {
				var sResult;

				// 14.4.11 Expression edm:String
				if (vRawValue && vRawValue.hasOwnProperty("String")) {
					if (typeof vRawValue.String === "string") {
						sResult = "/##" + oInterface.getPath() + "/String";
						return formatPath(oInterface, sResult, false).value;
//						return fnEscape(vRawValue.String);
					}
					return illegalValue(vRawValue, "String");
				}

				// 14.5.12 Expression edm:Path
				if (vRawValue && vRawValue.hasOwnProperty("Path")) {
					if (typeof vRawValue.Path === "string") {
						return formatPath(oInterface, vRawValue.Path, true).value;
					}
					return illegalValue(vRawValue, "Path");
				}

				// 14.5.3 Expression edm:Apply
				if (vRawValue && vRawValue.Apply && typeof vRawValue.Apply === "object") {
					switch (vRawValue.Apply.Name) {
					case "odata.concat": // 14.5.3.1.1 Function odata.concat
						if (jQuery.isArray(vRawValue.Apply.Parameters)) {
							return concat(oInterface, vRawValue.Apply.Parameters);
						}
						break;
					case "odata.fillUriTemplate": // 14.5.3.1.2 Function odata.fillUriTemplate
						sResult = fillUriTemplate(oInterface, vRawValue.Apply.Parameters);
						if (sResult) {
							return sResult;
						}
						break;
					case "odata.uriEncode": // 14.5.3.1.3 Function odata.uriEncode
						sResult = uriEncode(oInterface, vRawValue.Apply.Parameters);
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
			 * A formatter function to be used in a complex binding inside an XML template view
			 * in order to interpret OData v4 annotations. It knows about the dynamic
			 * "14.5.2 Expression edm:AnnotationPath" and returns a binding expression for a
			 * navigation path in an OData model, starting at an entity.
			 * Currently supports navigation properties. Term casts and annotations of
			 * navigation properties terminate the navigation path.
			 *
			 * Examples:
			 * <pre>
			 * &lt;template:if test="{path: 'facet>Target', formatter: 'sap.ui.model.odata.AnnotationHelper.getNavigationPath'}">
			 *     &lt;form:SimpleForm binding="{path: 'facet>Target', formatter: 'sap.ui.model.odata.AnnotationHelper.getNavigationPath'}" />
			 * &lt;/template:if>
			 * </pre>
			 *
			 * @param {sap.ui.core.util.XMLPreprocessor.IContext|sap.ui.model.Context} oInterface
			 *   the callback interface related to the current formatter call
			 * @param {any} vRawValue
			 *   the raw value from the meta model, e.g. <code>{AnnotationPath :
			 *   "ToSupplier/@com.sap.vocabularies.Communication.v1.Address"}</code> or <code>
			 *   {AnnotationPath : "@com.sap.vocabularies.UI.v1.FieldGroup#Dimensions"}</code>;
			 *   embedded within an entity type
			 * @returns {string}
			 *   the resulting string value to write into the processed XML, e.g. "{ToSupplier}"
			 *   or "{}" (in case no navigation is needed); returns "" in case the navigation path
			 *   cannot be determined (this is treated as falsy in <code>template:if</code>
			 *   statements!)
			 * @public
			 */
			getNavigationPath : function (oInterface, vRawValue) {
				var oResult = followPath(oInterface, vRawValue);

				return oResult
					? "{" + oResult.navigationProperties.join("/") + "}"
					: "";
			},

			/**
			 * Helper function for a <code>template:with</code> instruction that goes to the
			 * entity set determined by the last navigation property of a dynamic
			 * "14.5.2 Expression edm:AnnotationPath".
			 *
			 * Example:
			 * <pre>
			 *   &lt;template:with path="facet>Target" helper="sap.ui.model.odata.AnnotationHelper.gotoEntitySet" var="entitySet">
			 * </pre>
			 *
			 * @param {sap.ui.model.Context} oContext
			 *   a context which must point to an annotation or annotation property of type
			 *   <code>Edm.AnnotationPath</code>, embedded within an entity type;
			 *   the context's model must be an {@link sap.ui.model.odata.ODataMetaModel}
			 * @returns {string}
			 *   the path to the entity set determined by the last navigation property,
			 *   or <code>undefined</code> if no such set is found
			 * @public
			 */
			gotoEntitySet : function (oContext) {
				var oResult = followPath(oContext, oContext.getObject());

				return oResult && oResult.associationSetEnd
					? oContext.getModel()
							.getODataEntitySet(oResult.associationSetEnd.entitySet, true)
					: undefined;
			},

			/**
			 * Helper function for a <code>template:with</code> instruction that goes to the
			 * entity type with the qualified name which <code>oContext</code> points at.
			 *
			 * Example: Assume that "entitySet" refers to an entity set within an OData meta model;
			 * the helper function is then called on the "entityType" property of that entity set
			 * (which holds the qualified name of the entity type) and in turn the path of that
			 * entity type is assigned to the variable "entityType".
			 * <pre>
			 *   &lt;template:with path="entitySet>entityType" helper="sap.ui.model.odata.AnnotationHelper.gotoEntityType" var="entityType">
			 * </pre>
			 *
			 * @param {sap.ui.model.Context} oContext
			 *   a context which must point to the qualified name of an entity type;
			 *   the context's model must be an {@link sap.ui.model.odata.ODataMetaModel}
			 * @returns {string}
			 *   the path to the entity type with the given qualified name,
			 *   or <code>undefined</code> if no such type is found
			 * @public
			 */
			gotoEntityType : function (oContext) {
				return oContext.getModel().getODataEntityType(oContext.getProperty(""), true);
			},

			/**
			 * A formatter function to be used in a complex binding inside an XML template view
			 * in order to interpret OData v4 annotations. It knows about the dynamic
			 * "14.5.2 Expression edm:AnnotationPath" and returns whether the navigation path
			 * ends with an association end with multiplicity "*". It throws an error if the
			 * navigation path has an association end with multiplicity "*" which is not the last
			 * one.
			 * Currently supports navigation properties. Term casts and annotations of
			 * navigation properties terminate the navigation path.
			 *
			 * Examples:
			 * <pre>
			 * &lt;template:if test="{path: 'facet>Target', formatter: 'sap.ui.model.odata.AnnotationHelper.isMultiple'}">
			 * </pre>
			 *
			 * @param {sap.ui.core.util.XMLPreprocessor.IContext|sap.ui.model.Context} oInterface
			 *   the callback interface related to the current formatter call
			 * @param {any} vRawValue
			 *   the raw value from the meta model, e.g. <code>{AnnotationPath :
			 *   "ToSupplier/@com.sap.vocabularies.Communication.v1.Address"}</code> or <code>
			 *   {AnnotationPath : "@com.sap.vocabularies.UI.v1.FieldGroup#Dimensions"}</code>;
			 *   embedded within an entity type
			 * @returns {string}
			 *    <code>"true"</code> if the navigation path ends with an association end with
			 *    multiplicity "*", <code>""</code> in case the navigation path cannot be
			 *    determined, <code>"false"</code> otherwise (the latter are both treated as falsy
			 *    in <code>template:if</code> statements!)
			 * @throws {Error}
			 *   if the navigation path has an association end with multiplicity "*" which is not
			 *   the last one
			 * @public
			 */
			isMultiple : function (oInterface, vRawValue) {
				var oResult = followPath(oInterface, vRawValue);

				if (oResult) {
					if (oResult.navigationAfterMultiple) {
						throw new Error(
							'Association end with multiplicity "*" is not the last one: '
							+ vRawValue.AnnotationPath);
					}
					return String(oResult.isMultiple);
				}
				return "";
			},

			/**
			 * Helper function for a <code>template:with</code> instruction that resolves a dynamic
			 * "14.5.2 Expression edm:AnnotationPath" or "14.5.12 Expression edm:Path".
			 * Currently supports navigation properties and term casts.
			 *
			 * Example:
			 * <pre>
			 *   &lt;template:with path="meta>Value" helper="sap.ui.model.odata.AnnotationHelper.resolvePath" var="target">
			 * </pre>
			 *
			 * @param {sap.ui.model.Context} oContext
			 *   a context which must point to an annotation or annotation property of type
			 *   <code>Edm.AnnotationPath</code> or <code>Edm.Path</code>, embedded within an
			 *   entity type;
			 *   the context's model must be an {@link sap.ui.model.odata.ODataMetaModel}
			 * @returns {string}
			 *   the path to the target, or <code>undefined</code> in case the path cannot be
			 *   resolved
			 * @public
			 */
			resolvePath : function (oContext) {
				var oResult = followPath(oContext, oContext.getObject());

				return oResult
					? oResult.resolvedPath
					: undefined;
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
			 * @param {sap.ui.core.util.XMLPreprocessor.IContext|sap.ui.model.Context} oInterface
			 *   the callback interface related to the current formatter call
			 * @param {any} vRawValue
			 *   the raw value from the meta model
			 * @returns {string}
			 *   the resulting string value to write into the processed XML
			 * @public
			 */
			simplePath : function (oInterface, vRawValue) {
				// 14.5.12 Expression edm:Path
				if (vRawValue && vRawValue.hasOwnProperty("Path")) {
					if (typeof vRawValue.Path === "string") {
						return formatPath(oInterface, vRawValue.Path, false).value;
					}
					return illegalValue(vRawValue, "Path");
				}

				return unsupported(vRawValue);
			}
		};

		AnnotationHelper.format.requiresIContext = true;
		AnnotationHelper.getNavigationPath.requiresIContext = true;
		AnnotationHelper.isMultiple.requiresIContext = true;
		AnnotationHelper.simplePath.requiresIContext = true;

		return AnnotationHelper;
	}, /* bExport= */ true);
