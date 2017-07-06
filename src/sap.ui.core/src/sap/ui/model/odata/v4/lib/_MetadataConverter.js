/*!
 * ${copyright}
 */

sap.ui.define([
	"./_Helper"
], function (_Helper) {
	"use strict";

	var MetadataConverter;

	MetadataConverter = {
		/**
		 * A pattern for "Collection(QualifiedType)"
		 */
		rCollection : /^Collection\((.*)\)$/,

		/**
		 * This function is called by each annotatable entity to define a place for the
		 * annotations.
		 * @param {object} oAggregate
		 *   The aggregate
		 * @param {object|string} vTarget
		 *   The target to which the annotations shall be added, may be directly an object or a
		 *   target name to place it into $Annotations of the current Schema. The path in
		 *   $Annotations is constructed from the given name and the current annotatable's path (if
		 *   there is one and it has a path)
		 * @param {string} [sPrefix=""]
		 *   The prefix to put before the "@" and the term
		 * @param {string} [sQualifier]
		 *   The qualifier for all annotations
		 */
		annotatable : function (oAggregate, vTarget, sPrefix, sQualifier) {
			var oAnnotatable,
				oAnnotations,
				sPath;

			if (typeof vTarget === "string") {
				oAnnotatable = oAggregate.annotatable;
				vTarget = _Helper.buildPath(oAnnotatable.path, vTarget);
				sPath = vTarget;
				// try to find the target (otherwise processAnnotation will recreate it)
				oAnnotations = oAggregate.schema.$Annotations;
				if (oAnnotations && oAnnotations[vTarget]) {
					vTarget = oAnnotations[vTarget];
				}
			}
			oAggregate.annotatable = {
				parent : oAggregate.annotatable,
				path : sPath,
				prefix : sPrefix || "",
				qualifier : sQualifier,
				target : vTarget
			};
		},

		/**
		 * Fetches the array at the given property. Ensures that there is at least an empty array.
		 * @param {object} oParent The parent object
		 * @param {string} sProperty The property name
		 * @returns {any[]} The array at the given property
		 */
		getOrCreateArray : function (oParent, sProperty) {
			var oResult = oParent[sProperty];

			if (!oResult) {
				oResult = oParent[sProperty] = [];
			}
			return oResult;
		},

		/**
		 * Fetches the object at the given property. Ensures that there is at least an empty object.
		 * @param {object} oParent The parent object
		 * @param {string} sProperty The property name
		 * @returns {object} The object at the given property
		 */
		getOrCreateObject : function (oParent, sProperty) {
			var oResult = oParent[sProperty];

			if (!oResult) {
				oResult = oParent[sProperty] = {};
			}
			return oResult;
		},

		/**
		 * Extracts the Aliases from the Include and Schema elements.
		 * @param {Element} oElement The element
		 * @param {object} oAggregate The aggregate
		 */
		processAlias : function (oElement, oAggregate) {
			var sAlias = oElement.getAttribute("Alias");

			if (sAlias) {
				oAggregate.aliases[sAlias] = oElement.getAttribute("Namespace") + ".";
			}
		},

		/**
		 * Copies all attributes from oAttributes to oTarget according to oConfig.
		 * @param {Element} oElement The element
		 * @param {object} oTarget The target object
		 * @param {object} oConfig
		 *   The configuration: each property describes a property of oAttributes to copy; the
		 *   value is a conversion function, if this function returns undefined, the property is
		 *   not set
		 */
		processAttributes : function (oElement, oTarget, oConfig) {
			var sProperty;

			for (sProperty in oConfig) {
				var sValue = oConfig[sProperty](oElement.getAttribute(sProperty));

				if (sValue !== undefined && sValue !== null) {
					oTarget["$" + sProperty] = sValue;
				}
			}
		},

		/**
		 * Processes a Schema element.
		 * @param {Element} oElement The element
		 * @param {object} oAggregate The aggregate
		 */
		processSchema : function (oElement, oAggregate) {
			oAggregate.namespace = oElement.getAttribute("Namespace") + ".";
			oAggregate.result[oAggregate.namespace] = oAggregate.schema = {
				"$kind" : "Schema"
			};
			MetadataConverter.annotatable(oAggregate, oAggregate.schema);
		},

		/**
		 * Resolves an alias in the given qualified name or full name.
		 * @param {string} sName The name
		 * @param {object} oAggregate The aggregate containing the aliases
		 * @returns {string} The name with the alias resolved (if there was one)
		 */
		resolveAlias : function (sName, oAggregate) {
			var iDot = sName.indexOf("."),
				sNamespace;

			if (iDot >= 0 && sName.indexOf(".", iDot + 1) < 0) { // if there is exactly one dot
				sNamespace = oAggregate.aliases[sName.slice(0, iDot)];
				if (sNamespace) {
					return sNamespace + sName.slice(iDot + 1);
				}
			}
			return sName;
		},

		/**
		 * Resolves all aliases in the given path.
		 * @param {string} sPath The path
		 * @param {object} oAggregate The aggregate containing the aliases
		 * @returns {string} The path with the alias resolved (if there was one)
		 */
		resolveAliasInPath : function (sPath, oAggregate) {
			var iAt, i, aSegments, sTerm = "";

			if (sPath.indexOf(".") < 0) {
				return sPath; // no dot -> nothing to do
			}
			iAt = sPath.indexOf("@");
			if (iAt >= 0) {
				sTerm = "@" + MetadataConverter.resolveAlias(sPath.slice(iAt + 1), oAggregate);
				sPath = sPath.slice(0, iAt);
			}
			aSegments = sPath.split("/");
			for (i = 0; i < aSegments.length; i++) {
				aSegments[i] = MetadataConverter.resolveAlias(aSegments[i], oAggregate);
			}
			return aSegments.join("/") + sTerm;
		},

		/**
		 * Helper for processAttributes, returns false if sValue is "false", returns undefined
		 * otherwise.
		 * @param {string} sValue The attribute value in the element
		 * @returns {boolean} false or undefined
		 */
		setIfFalse : function (sValue) {
			return sValue === "false" ? false : undefined;
		},

		/**
		 * Helper for processAttributes, returns true if sValue is "true", returns undefined
		 * otherwise.
		 * @param {string} sValue The attribute value in the element
		 * @returns {boolean} true or undefined
		 */
		setIfTrue : function (sValue) {
			return sValue === "true" ? true : undefined;
		},

		/**
		 * Helper for processAttributes, returns sValue converted to a number.
		 * @param {string} sValue The attribute value in the element
		 * @returns {number} The value as number or undefined
		 */
		setNumber : function (sValue) {
			return sValue ? parseInt(sValue, 10) : undefined;
		},

		/**
		 * Helper for processAttributes, returns sValue.
		 * @param {string} sValue The attribute value in the element
		 * @returns {string} sValue
		 */
		setValue : function (sValue) {
			return sValue;
		},

		/**
		 * Recursively traverses the subtree of a given XML element controlled by the given
		 * (recursive) configuration.
		 *
		 * @param {Element} oElement
		 *   An XML DOM element
		 * @param {object} oAggregate
		 *   An aggregate object that is passed to every processor function
		 * @param {object} oConfig
		 *   The configuration for this element with the following properties:
		 *   * __processor is an optional function called with this element and oAggregate as
		 *     parameters before visiting the children.
		 *   * __postProcessor is an optional function called after visiting the children. It gets
		 *     the element, an array with all return values of the children's __postProcessor
		 *     functions (which is empty if there were no children) and oAggregate as parameters.
		 *   * __include is an optional array of configuration objects that are also searched for
		 *     known children.
		 *   * All other properties are known child elements, the value is the configuration for
		 *     that child element.
		 * @returns {any}
		 *   The return value from __postProcessor or undefined if there is none
		 */
		traverse : function (oElement, oAggregate, oConfig) {
			var oAnnotatable = oAggregate.annotatable, // "push" oAnnotatable to the recursion stack
				oChildConfig,
				oChildList = oElement.childNodes,
				oChildNode,
				vChildResult,
				i,
				aIncludes,
				j,
				sName,
				vResult,
				aResult = [];

			if (oConfig.__processor) {
				oConfig.__processor(oElement, oAggregate);
			}
			for (i = 0; i < oChildList.length; i++) {
				oChildNode = oChildList.item(i);
				if (oChildNode.nodeType === 1) { // Node.ELEMENT_NODE
					sName = oChildNode.localName;
					oChildConfig = oConfig[sName];
					if (!oChildConfig && oConfig.__include) {
						aIncludes = oConfig.__include;
						for (j = 0; j < aIncludes.length; j++) {
							oChildConfig = aIncludes[j][sName];
							if (oChildConfig) {
								break;
							}
						}
					}
					if (oChildConfig) {
						vChildResult =
							MetadataConverter.traverse(oChildNode, oAggregate, oChildConfig);
						if (vChildResult !== undefined && oConfig.__postProcessor) {
							// only push if the element is interested in the results and if the
							// child element returns anything (it might be another Annotation which
							// returns undefined)
							aResult.push(vChildResult);
						}
					}
				}
			}
			if (oConfig.__postProcessor) {
				vResult = oConfig.__postProcessor(oElement, aResult, oAggregate);
			}
			oAggregate.annotatable = oAnnotatable; // "pop" annotatable from the recursion stack
			return vResult;
		}
	};

	return MetadataConverter;
}, /* bExport= */false);
