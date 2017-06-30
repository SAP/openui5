/*!
 * ${copyright}
 */

//Provides class sap.ui.model.odata.v4.lib._MetadataConverter
sap.ui.define([
	"./_Helper"
], function (_Helper) {
	"use strict";

	var MetadataConverter;

	MetadataConverter = {

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
