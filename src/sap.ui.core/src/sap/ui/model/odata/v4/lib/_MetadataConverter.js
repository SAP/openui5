/*!
 * ${copyright}
 */

sap.ui.define([
	"./_Helper"
], function (_Helper) {
	"use strict";

	/**
	 * Creates the base class for the metadata converters.
	 *
	 * @constructor
	 */
	function MetadataConverter() {
		this.aliases = {}; // maps alias -> namespace
		this.oAnnotatable = null; // the current annotatable, see function annotatable
		this.entityContainer = null; // the current EntityContainer
		this.entitySet = null; // the current EntitySet/Singleton
		this.namespace = null; // the namespace of the current Schema
		this.oOperation = null; // the current operation (action or function)
		this.reference = null; // the current Reference
		this.schema = null; // the current Schema
		this.type = null; // the current EntityType/ComplexType
		this.result = null; // the result of the conversion
		this.url = null; // the document URL (for error messages)
		this.xmlns = null; // the expected XML namespace
	}

	/**
	 * A pattern for "Collection(QualifiedType)"
	 */
	MetadataConverter.prototype.rCollection = /^Collection\((.*)\)$/;

	// namespaces
	MetadataConverter.prototype.sEdmNamespace = "http://docs.oasis-open.org/odata/ns/edm";
	MetadataConverter.prototype.sEdmxNamespace = "http://docs.oasis-open.org/odata/ns/edmx";

	/**
	 * This function is called by each annotatable entity to define a place for the
	 * annotations.
	 *
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
	MetadataConverter.prototype.annotatable = function (vTarget, sPrefix, sQualifier) {
		var oAnnotatable,
			oAnnotations,
			sPath;

		if (typeof vTarget === "string") {
			oAnnotatable = this.oAnnotatable;
			if (oAnnotatable) {
				vTarget = _Helper.buildPath(oAnnotatable.path, vTarget);
			}
			sPath = vTarget;
			// try to find the target (otherwise processAnnotation will recreate it)
			oAnnotations = this.schema.$Annotations;
			if (oAnnotations && oAnnotations[vTarget]) {
				vTarget = oAnnotations[vTarget];
			}
		}
		this.oAnnotatable = {
			parent : this.oAnnotatable, // The parent annotatable (note that <Annotation>
		                                // is also annotatable, so in postProcessAnnotation
		                                // the annotatable to modify is the parent)
			path : sPath, // the annotation path if externalized
			prefix : sPrefix || "", // the prefix to put before the "@" and the term (used e.g.
		                            // for annotated annotations)
			qualifiedName : undefined, // the qualified name of the annotation
			qualifier : sQualifier, // the annotation qualifier
			target : vTarget // the target to add the annotation to or its name
			// qualifiedName and target (object) are determined in processAnnotation
		};
	};

	/**
	 * Converts the metadata from XML format to a JSON object.
	 *
	 * @param {Document} oDocument
	 *   The XML DOM document
	 * @param {string} sUrl
	 *   The URL by which this document has been loaded (for error messages)
	 * @returns {object}
	 *   The metadata JSON
	 */
	MetadataConverter.prototype.convertXMLMetadata = function (oDocument, sUrl) {
		var oElement;

		jQuery.sap.measure.average("convertXMLMetadata", "",
			"sap.ui.model.odata.v4.lib._V4MetadataConverter");

		oElement = oDocument.documentElement;
		if (oElement.localName !== "Edmx" || oElement.namespaceURI !== this.sRootNamespace) {
			throw new Error(sUrl + ": expected <Edmx> in namespace '" + this.sRootNamespace + "'");
		}

		this.result = {};
		this.url = sUrl; // the document URL (for error messages)

		// pass 1: find aliases
		this.traverse(oElement, this.oAliasConfig);
		// pass 2: full conversion
		this.traverse(oElement, this.oFullConfig, true);

		this.finalize();

		jQuery.sap.measure.end("convertXMLMetadata");
		return this.result;
	};

	/**
	 * Finalizes the conversion after having traversed the XML completely.
	 *
	 * @abstract
	 * @name MetadataConverter#finalize
	 */

	/**
	 * Determines the value for an annotation of the given type.
	 *
	 * @param {string} sType
	 *   The annotation type (either from the attribute name in the Annotation element or from
	 *   the element name itself)
	 * @param {string} sValue
	 *   The value in the XML (either the attribute value or the element's text value)
	 * @returns {any}
	 *   The value for the JSON
	 */
	MetadataConverter.prototype.getAnnotationValue = function (sType, sValue) {
		var i, vValue, aValues;

		switch (sType) {
			case "AnnotationPath":
			case "NavigationPropertyPath":
			case "Path":
			case "PropertyPath":
				sValue = this.resolveAliasInPath(sValue);
			// falls through
			case "Binary":
			case "Date":
			case "DateTimeOffset":
			case "Decimal":
			case "Duration":
			case "Guid":
			case "TimeOfDay":
			case "UrlRef":
				vValue = {};
				vValue["$" + sType] = sValue;
				return vValue;
			case "Bool":
				return sValue === "true";
			case "EnumMember":
				aValues = sValue.trim().replace(/ +/g, " ").split(" ");
				for (i = 0; i < aValues.length; i++) {
					aValues[i] = this.resolveAliasInPath(aValues[i]);
				}
				return {$EnumMember : aValues.join(" ")};
			case "Float":
				if (sValue === "NaN" || sValue === "INF" || sValue === "-INF") {
					return {$Float : sValue};
				}
				return parseFloat(sValue);
			case "Int":
				vValue = parseInt(sValue, 10);
				return _Helper.isSafeInteger(vValue) ? vValue : {$Int : sValue};
			case "String":
				return sValue;
			default:
				return undefined;
		}
	};

	/**
	 * Determines the value for an inline annotation in the element.
	 *
	 * @param {Element} oElement The element
	 * @returns {any}
	 *   The value for the JSON
	 */
	MetadataConverter.prototype.getInlineAnnotationValue = function (oElement) {
		var oAttribute,
			oAttributeList = oElement.attributes,
			i,
			vValue;

		// check the last attribute first, this is typically the one with the annotation value
		for (i = oAttributeList.length - 1; i >= 0; i--) {
			oAttribute = oAttributeList.item(i);
			vValue = this.getAnnotationValue(oAttribute.name, oAttribute.value);
			if (vValue !== undefined) {
				return vValue;
			}
		}
		return true;
	};

	/**
	 * Fetches the array at the given property. Ensures that there is at least an empty array.
	 *
	 * @param {object} oParent The parent object
	 * @param {string} sProperty The property name
	 * @returns {any[]} The array at the given property
	 */
	MetadataConverter.prototype.getOrCreateArray = function (oParent, sProperty) {
		var oResult = oParent[sProperty];

		if (!oResult) {
			oResult = oParent[sProperty] = [];
		}
		return oResult;
	};

	/**
	 * Fetches the object at the given property. Ensures that there is at least an empty object.
	 *
	 * @param {object} oParent The parent object
	 * @param {string} sProperty The property name
	 * @returns {object} The object at the given property
	 */
	MetadataConverter.prototype.getOrCreateObject = function (oParent, sProperty) {
		var oResult = oParent[sProperty];

		if (!oResult) {
			oResult = oParent[sProperty] = {};
		}
		return oResult;
	};

	/**
	 * Post-processing of an Annotation element. Sets the result of the single child element at
	 * the annotation if there was a child.
	 *
	 * @param {Element} oElement The element
	 * @param {any[]} aResult The results from child elements
	 */
	MetadataConverter.prototype.postProcessAnnotation = function (oElement, aResult) {
		// this.oAnnotatable is the Annotation itself currently.
		var oAnnotatable = this.oAnnotatable.parent;

		oAnnotatable.target[oAnnotatable.qualifiedName] =
			aResult.length ? aResult[0] : this.getInlineAnnotationValue(oElement);
	};

	/**
	 * Post-processing of an Apply element.
	 *
	 * @param {Element} oElement The element
	 * @param {any[]} aResult The results from child elements
	 * @returns {object} The value for the JSON
	 */
	MetadataConverter.prototype.postProcessApply = function (oElement, aResult) {
		var oResult = this.oAnnotatable.target;

		oResult.$Apply = aResult;
		oResult.$Function = this.resolveAlias(oElement.getAttribute("Function"));
		return oResult;
	};

	/**
	 * Post-processing of a Cast or IsOf element.
	 *
	 * @param {Element} oElement The element
	 * @param {any[]} aResult The results from child elements
	 * @returns {object} The value for the JSON
	 */
	MetadataConverter.prototype.postProcessCastOrIsOf = function (oElement, aResult) {
		var sName = oElement.localName,
			oResult = this.oAnnotatable.target;

		oResult["$" + sName] = aResult[0];
		this.processTypedCollection(oElement.getAttribute("Type"), oResult);
		this.processFacetAttributes(oElement, oResult);
		return oResult;
	};

	/**
	 * Post-processing of a Collection element.
	 *
	 * @param {Element} oElement The element
	 * @param {any[]} aResult The results from child elements
	 * @returns {object} The value for the JSON
	 */
	MetadataConverter.prototype.postProcessCollection = function (oElement, aResult) {
		return aResult;
	};

	/**
	 * Post-processing of a LabeledElement element within an Annotation element.
	 *
	 * @param {Element} oElement The element
	 * @param {any[]} aResult The results from child elements
	 * @returns {any} The value for the JSON
	 */
	MetadataConverter.prototype.postProcessLabeledElement = function (oElement, aResult) {
		var oResult = this.oAnnotatable.target;

		oResult.$LabeledElement = aResult.length ? aResult[0] :
			this.getInlineAnnotationValue(oElement);
		oResult.$Name = oElement.getAttribute("Name");
		return oResult;
	};

	/**
	 * Post-processing of a LabeledElementReference element within an Annotation element.
	 *
	 * @param {Element} oElement The element
	 * @param {any[]} aResult The results from child elements
	 * @returns {any} The value for the JSON
	 */
	MetadataConverter.prototype.postProcessLabeledElementReference = function (oElement, aResult) {
		return {
			"$LabeledElementReference" : this.resolveAlias(oElement.textContent)
		};
	};

	/**
	 * Post-processing of a leaf element within an Annotation element.
	 *
	 * @param {Element} oElement The element
	 * @param {any[]} aResult The results from child elements
	 * @returns {any} The constant value for the JSON
	 */
	MetadataConverter.prototype.postProcessLeaf = function (oElement, aResult) {
		return this.getAnnotationValue(oElement.localName, oElement.textContent);
	};

	/**
	 * Post-processing of a Not element within an Annotation element.
	 *
	 * @param {Element} oElement The element
	 * @param {any[]} aResult The results from child elements
	 * @returns {object} The value for the JSON
	 */
	MetadataConverter.prototype.postProcessNot = function (oElement, aResult) {
		var oResult = this.oAnnotatable.target;

		oResult.$Not = aResult[0];
		return oResult;
	};

	/**
	 * Post-processing of a Null element within an Annotation element.
	 *
	 * @param {Element} oElement The element
	 * @param {any[]} aResult The results from child elements
	 * @returns {object} The value for the JSON
	 */
	MetadataConverter.prototype.postProcessNull = function (oElement, aResult) {
		var oAnnotatable = this.oAnnotatable,
			vResult = null;

		if (oAnnotatable.qualifiedName) {
			vResult = oAnnotatable.target;
			vResult.$Null = null;
		}
		return vResult;
	};

	/**
	 * Post-processing of an operation element (And, Or, Eq etc) within an Annotation element.
	 *
	 * @param {Element} oElement The element
	 * @param {any[]} aResult The results from child elements
	 * @returns {object} The value for the JSON
	 */
	MetadataConverter.prototype.postProcessOperation = function (oElement, aResult) {
		var oResult = this.oAnnotatable.target;

		oResult["$" + oElement.localName] = aResult;
		return oResult;
	};

	/**
	 * Post-processing of a PropertyValue element within a Record element.
	 *
	 * @param {Element} oElement The element
	 * @param {any[]} aResult The results from child elements
	 * @returns {any} The value for the JSON
	 */
	MetadataConverter.prototype.postProcessPropertyValue = function (oElement, aResult) {
		return {
			property : oElement.getAttribute("Property"),
			value : aResult.length ? aResult[0] : this.getInlineAnnotationValue(oElement)
		};
	};

	/**
	 * Post-processing of a Record element within an Annotation element.
	 *
	 * @param {Element} oElement The element
	 * @param {any[]} aResult The results from child elements
	 * @returns {object} The value for the JSON
	 */
	MetadataConverter.prototype.postProcessRecord = function (oElement, aResult) {
		var i,
			oPropertyValue,
			oResult = this.oAnnotatable.target,
			oType = oElement.getAttribute("Type");

		if (oType) {
			oResult.$Type = this.resolveAlias(oType);
		}
		for (i = 0; i < aResult.length; i++) {
			oPropertyValue = aResult[i];
			oResult[oPropertyValue.property] = oPropertyValue.value;
		}
		return oResult;
	};

	/**
	 * Post-processing of a UrlRef element within an Annotation element.
	 *
	 * @param {Element} oElement The element
	 * @param {any[]} aResult The results from child elements
	 * @returns {object} The constant value for the JSON
	 */
	MetadataConverter.prototype.postProcessUrlRef = function (oElement, aResult) {
		return {$UrlRef : aResult[0]};
	};

	/**
	 * Extracts the Aliases from the Include and Schema elements.
	 *
	 * @param {Element} oElement The element
	 */
	MetadataConverter.prototype.processAlias = function (oElement) {
		var sAlias = oElement.getAttribute("Alias");

		if (sAlias) {
			this.aliases[sAlias] = oElement.getAttribute("Namespace") + ".";
		}
	};

	/**
	 * Processes an element of an annotatable expression.
	 *
	 * @param {Element} oElement The element
	 */
	MetadataConverter.prototype.processAnnotatableExpression = function (oElement) {
		this.annotatable({});
	};

	/**
	 * Processes an Annotation element within Annotations.
	 *
	 * @param {Element} oElement The element
	 */
	MetadataConverter.prototype.processAnnotation = function (oElement) {
		var oAnnotatable = this.oAnnotatable,
			oAnnotations,
			sQualifiedName = oAnnotatable.prefix + "@"
				+ this.resolveAlias(oElement.getAttribute("Term")),
			// oAnnotatable.qualifier can only come from <Annotations>. If such a qualifier is
			// set, <Annotation> itself MUST NOT supply a qualifier. (see spec Part 3, 14.3.2)
			sQualifier = oAnnotatable.qualifier || oElement.getAttribute("Qualifier");

		if (sQualifier) {
			sQualifiedName += "#" + sQualifier;
		}

		if (typeof oAnnotatable.target === "string") {
			oAnnotations = this.getOrCreateObject(this.schema, "$Annotations");
			oAnnotatable.target = oAnnotations[oAnnotatable.target] = {};
		}

		oAnnotatable.qualifiedName = sQualifiedName;
		// do not calculate a value yet, this is done in postProcessAnnotation
		oAnnotatable.target[sQualifiedName] = true;
		this.annotatable(oAnnotatable.target, sQualifiedName);
	};

	/**
	 * Processes an Annotations element.
	 *
	 * @param {Element} oElement The element
	 */
	MetadataConverter.prototype.processAnnotations = function (oElement) {
		this.annotatable(this.resolveAliasInPath(oElement.getAttribute("Target")),
			undefined, // no prefix
			oElement.getAttribute("Qualifier"));
	};

	/**
	 * Copies all attributes from oAttributes to oTarget according to oConfig. Iterates over all
	 * described attributes of <code>oElement</code> and converts each using the given conversion
	 * function. Sets the result at the property "$" + attribute name of <code>oTarget</code> unless
	 * it is <code>undefined</code> or <code>null</code>.
	 *
	 * @param {Element} oElement The element
	 * @param {object} oTarget The target object
	 * @param {object} oConfig
	 *   The configuration: a map from attribute name to a function to convert it
	 */
	MetadataConverter.prototype.processAttributes = function (oElement, oTarget, oConfig) {
		var sProperty;

		for (sProperty in oConfig) {
			var sValue = oConfig[sProperty](oElement.getAttribute(sProperty));

			if (sValue !== undefined && sValue !== null) {
				oTarget["$" + sProperty] = sValue;
			}
		}
	};

	/**
	 * Hook function called for each element in pass 2 running over the full configuration. The
	 * function is expected to call the processor (if it exists) on the element.
	 *
	 * @param {Element} oElement The element
	 * @param {function} [fnProcessor] The processor
	 *
	 * @abstract
	 * @name MetadataConverter#processElement
	 */

	/**
	 * Processes an Include element within a Reference.
	 *
	 * @param {Element} oElement The element
	 */
	MetadataConverter.prototype.processInclude = function (oElement) {
		var oInclude = this.getOrCreateArray(this.reference, "$Include");

		oInclude.push(oElement.getAttribute("Namespace") + ".");
	};

	/**
	 * Processes an IncludeAnnotations element within a Reference.
	 *
	 * @param {Element} oElement The element
	 */
	MetadataConverter.prototype.processIncludeAnnotations = function (oElement) {
		var oReference = this.reference,
			oIncludeAnnotation = {
				"$TermNamespace" : oElement.getAttribute("TermNamespace") + "."
			},
			aIncludeAnnotations = this.getOrCreateArray(oReference, "$IncludeAnnotations");

		this.processAttributes(oElement, oIncludeAnnotation, {
			"TargetNamespace" : function setValue(sValue) {
				return sValue ? sValue + "." : sValue;
			},
			"Qualifier" : this.setValue
		});

		aIncludeAnnotations.push(oIncludeAnnotation);
	};

	/**
	 * Processes a PropertyValue element within a Record.
	 *
	 * @param {Element} oElement The element
	 */
	MetadataConverter.prototype.processPropertyValue = function (oElement) {
		this.annotatable(this.oAnnotatable.target, oElement.getAttribute("Property"));
	};

	/**
	 * Processes a Reference element.
	 *
	 * @param {Element} oElement The element
	 */
	MetadataConverter.prototype.processReference = function (oElement) {
		var oReference = this.getOrCreateObject(this.result, "$Reference");

		this.reference = oReference[oElement.getAttribute("Uri")] = {};
		this.annotatable(this.reference);
	};

	/**
	 * Resolves an alias in the given qualified name or full name.
	 *
	 * @param {string} sName The name
	 * @returns {string} The name with the alias resolved (if there was one)
	 */
	MetadataConverter.prototype.resolveAlias = function (sName) {
		var iDot = sName.indexOf("."),
			sNamespace;

		if (iDot >= 0 && sName.indexOf(".", iDot + 1) < 0) { // if there is exactly one dot
			sNamespace = this.aliases[sName.slice(0, iDot)];
			if (sNamespace) {
				return sNamespace + sName.slice(iDot + 1);
			}
		}
		return sName;
	};

	/**
	 * Resolves all aliases in the given path.
	 *
	 * @param {string} sPath The path
	 * @returns {string} The path with the alias resolved (if there was one)
	 */
	MetadataConverter.prototype.resolveAliasInPath = function (sPath) {
		var iAt, i, aSegments, sTerm = "";

		if (sPath.indexOf(".") < 0) {
			return sPath; // no dot -> nothing to do
		}
		iAt = sPath.indexOf("@");
		if (iAt >= 0) {
			sTerm = "@" + this.resolveAlias(sPath.slice(iAt + 1));
			sPath = sPath.slice(0, iAt);
		}
		aSegments = sPath.split("/");
		for (i = 0; i < aSegments.length; i++) {
			aSegments[i] = this.resolveAlias(aSegments[i]);
		}
		return aSegments.join("/") + sTerm;
	};

	/**
	 * Helper for processAttributes, returns false if sValue is "false", returns undefined
	 * otherwise.
	 *
	 * @param {string} sValue The attribute value in the element
	 * @returns {boolean} false or undefined
	 */
	MetadataConverter.prototype.setIfFalse = function (sValue) {
		return sValue === "false" ? false : undefined;
	};

	/**
	 * Helper for processAttributes, returns true if sValue is "true", returns undefined
	 * otherwise.
	 *
	 * @param {string} sValue The attribute value in the element
	 * @returns {boolean} true or undefined
	 */
	MetadataConverter.prototype.setIfTrue = function (sValue) {
		return sValue === "true" ? true : undefined;
	};

	/**
	 * Helper for processAttributes, returns sValue converted to a number.
	 *
	 * @param {string} sValue The attribute value in the element
	 * @returns {number} The value as number or undefined
	 */
	MetadataConverter.prototype.setNumber = function (sValue) {
		return sValue ? parseInt(sValue, 10) : undefined;
	};

	/**
	 * Helper for processAttributes, returns sValue.
	 *
	 * @param {string} sValue The attribute value in the element
	 * @returns {string} sValue
	 */
	MetadataConverter.prototype.setValue = function (sValue) {
		return sValue;
	};

	/**
	 * Recursively traverses the subtree of a given XML element controlled by the given
	 * (recursive) configuration.
	 *
	 * @param {Element} oElement
	 *   An XML DOM element
	 * @param {object} oConfig
	 *   The configuration for this element with the following properties:
	 *   * __processor is an optional function called with this element as parameter before
	 *     visiting the children.
	 *   * __postProcessor is an optional function called after visiting the children. It gets
	 *     the element, an array with all return values of the children's __postProcessor
	 *     functions (which is empty if there were no children) as parameters.
	 *   * __include is an optional array of configuration objects that are also searched for
	 *     known children.
	 *   * All other properties are known child elements, the value is the configuration for
	 *     that child element.
	 * @param {boolean} [bUseProcessElementHook=false]
	 *   If true, the hook processElement at the aggregate is used, otherwise the processor is
	 *   called directly
	 * @returns {any}
	 *   The return value from __postProcessor or undefined if there is none
	 */
	MetadataConverter.prototype.traverse = function (oElement, oConfig, bUseProcessElementHook) {
		var oAnnotatable = this.oAnnotatable, // "push" oAnnotatable to the recursion stack
			oChildConfig,
			oChildList = oElement.childNodes,
			oChildNode,
			vChildResult,
			i,
			aIncludes,
			j,
			sName,
			sPreviousNamespace = this.xmlns,
			vResult,
			aResult = [],
			sXmlNamespace = oConfig.__xmlns || this.xmlns;

		if (sXmlNamespace && sXmlNamespace !== oElement.namespaceURI) {
			// Ignore this element because the namespace is not as expected
			return undefined;
		}

		this.xmlns = sXmlNamespace;
		if (bUseProcessElementHook) {
			this.processElement(oElement, oConfig.__processor);
		} else if (oConfig.__processor) {
			oConfig.__processor.call(this, oElement);
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
						this.traverse(oChildNode, oChildConfig, bUseProcessElementHook);
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
			vResult = oConfig.__postProcessor.call(this, oElement, aResult);
		}
		this.oAnnotatable = oAnnotatable; // "pop" annotatable from the recursion stack
		this.xmlns = sPreviousNamespace;
		return vResult;
	};

	/**
	 * Build the configurations for <Annotations>, <Annotation> and <Reference>
	 *
	 * @param {object} $$ The prototype for MetadataConverter
	 */
	(function ($$) {
		var aAnnotatableExpressionInclude,
			oAnnotationExpressionConfig,
			oAnnotationLeafConfig,
			aExpressionInclude,
			oOperatorConfig;

		// All Annotations elements that don't have expressions as child (leaf, non-recursive)
		oAnnotationLeafConfig = {
			"AnnotationPath" : {__postProcessor : $$.postProcessLeaf},
			"Binary" : {__postProcessor : $$.postProcessLeaf},
			"Bool" : {__postProcessor : $$.postProcessLeaf},
			"Date" : {__postProcessor : $$.postProcessLeaf},
			"DateTimeOffset" : {__postProcessor : $$.postProcessLeaf},
			"Decimal" : {__postProcessor : $$.postProcessLeaf},
			"Duration" : {__postProcessor : $$.postProcessLeaf},
			"EnumMember" : {__postProcessor : $$.postProcessLeaf},
			"Float" : {__postProcessor : $$.postProcessLeaf},
			"Guid" : {__postProcessor : $$.postProcessLeaf},
			"Int" : {__postProcessor : $$.postProcessLeaf},
			"LabeledElementReference" : {__postProcessor : $$.postProcessLabeledElementReference},
			"NavigationPropertyPath" : {__postProcessor : $$.postProcessLeaf},
			"Path" : {__postProcessor : $$.postProcessLeaf},
			"PropertyPath" : {__postProcessor : $$.postProcessLeaf},
			"String" : {__postProcessor : $$.postProcessLeaf},
			"TimeOfDay" : {__postProcessor : $$.postProcessLeaf}
		};

		// When oAnnotationExpressionConfig is defined, it is added to this array for the recursion
		aExpressionInclude = [oAnnotationLeafConfig];

		// The configuration for an <Annotation> element to be included into other configurations
		$$.oAnnotationConfig = {
			"Annotation" : {
				__xmlns : $$.sEdmNamespace,
				__processor : $$.processAnnotation,
				__postProcessor : $$.postProcessAnnotation,
				__include : aExpressionInclude
			}
		};

		aAnnotatableExpressionInclude = [oAnnotationLeafConfig, $$.oAnnotationConfig];
		oOperatorConfig = {
			__processor : $$.processAnnotatableExpression,
			__postProcessor : $$.postProcessOperation,
			__include : aAnnotatableExpressionInclude
		};
		oAnnotationExpressionConfig = {
			"And" : oOperatorConfig,
			"Apply" : {
				__processor : $$.processAnnotatableExpression,
				__postProcessor : $$.postProcessApply,
				__include : aAnnotatableExpressionInclude
			},
			"Cast" : {
				__processor : $$.processAnnotatableExpression,
				__postProcessor : $$.postProcessCastOrIsOf,
				__include : aAnnotatableExpressionInclude
			},
			"Collection" : {
				__postProcessor : $$.postProcessCollection,
				__include : aExpressionInclude
			},
			"Eq" : oOperatorConfig,
			"Ge" : oOperatorConfig,
			"Gt" : oOperatorConfig,
			"If" : oOperatorConfig,
			"IsOf" : {
				__processor : $$.processAnnotatableExpression,
				__postProcessor : $$.postProcessCastOrIsOf,
				__include : aAnnotatableExpressionInclude
			},
			"LabeledElement" : {
				__processor : $$.processAnnotatableExpression,
				__postProcessor : $$.postProcessLabeledElement,
				__include : aAnnotatableExpressionInclude
			},
			"Le" : oOperatorConfig,
			"Lt" : oOperatorConfig,
			"Ne" : oOperatorConfig,
			"Null" : {
				__processor : $$.processAnnotatableExpression,
				__postProcessor : $$.postProcessNull,
				__include : [$$.oAnnotationConfig]
			},
			"Not" : {
				__processor : $$.processAnnotatableExpression,
				__postProcessor : $$.postProcessNot,
				__include : aAnnotatableExpressionInclude
			},
			"Or" : oOperatorConfig,
			"Record" : {
				__processor : $$.processAnnotatableExpression,
				__postProcessor : $$.postProcessRecord,
				__include : [$$.oAnnotationConfig],
				"PropertyValue" : {
					__processor : $$.processPropertyValue,
					__postProcessor : $$.postProcessPropertyValue,
					__include : aAnnotatableExpressionInclude
				}
			},
			"UrlRef" : {
				__postProcessor : $$.postProcessUrlRef,
				__include : aExpressionInclude
			}
		};

		// The configuration for an <Annotations> element to be included into other configurations
		$$.oAnnotationsConfig = {
			"Annotations" : {
				__processor : $$.processAnnotations,
				__include : [$$.oAnnotationConfig]
			}
		};

		// enable the recursion
		aExpressionInclude.push(oAnnotationExpressionConfig);
		aAnnotatableExpressionInclude.push(oAnnotationExpressionConfig);
		// yet another recursion: annotated Annotation
		$$.oAnnotationConfig.Annotation.Annotation = $$.oAnnotationConfig.Annotation;

		/**
		 * The configuration for a <Reference> element to be included into other configurations
		 */
		$$.oReferenceInclude = {
			"Reference" : {
				__xmlns : $$.sEdmxNamespace,
				__processor : $$.processReference,
				__include : [$$.oAnnotationConfig],
				"Include" : {
					__processor : $$.processInclude
				},
				"IncludeAnnotations" : {
					__processor : $$.processIncludeAnnotations
				}
			}
		};

	})(MetadataConverter.prototype);

	return MetadataConverter;
}, /* bExport= */false);
