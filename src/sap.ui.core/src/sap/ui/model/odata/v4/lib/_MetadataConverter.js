/*!
 * ${copyright}
 */

sap.ui.define([
	"./_Helper"
], function (_Helper) {
	"use strict";

	var MetadataConverter,

		// The configuation for <Annotations> and <Annotation>
		// All Annotations elements that don't have expressions as child (leaf, non-recursive)
		oAnnotationLeafConfig = {
			"AnnotationPath" : {__postProcessor : postProcessLeaf},
			"Binary" : {__postProcessor : postProcessLeaf},
			"Bool" : {__postProcessor : postProcessLeaf},
			"Date" : {__postProcessor : postProcessLeaf},
			"DateTimeOffset" : {__postProcessor : postProcessLeaf},
			"Decimal" : {__postProcessor : postProcessLeaf},
			"Duration" : {__postProcessor : postProcessLeaf},
			"EnumMember" : {__postProcessor : postProcessLeaf},
			"Float" : {__postProcessor : postProcessLeaf},
			"Guid" : {__postProcessor : postProcessLeaf},
			"Int" : {__postProcessor : postProcessLeaf},
			"LabeledElementReference" : {__postProcessor : postProcessLabeledElementReference},
			"NavigationPropertyPath" : {__postProcessor : postProcessLeaf},
			"Path" : {__postProcessor : postProcessLeaf},
			"PropertyPath" : {__postProcessor : postProcessLeaf},
			"String" : {__postProcessor : postProcessLeaf},
			"TimeOfDay" : {__postProcessor : postProcessLeaf}
		},
		// When oAnnotationExpressionConfig is defined, it is added to this array for the recursion
		aExpressionInclude = [oAnnotationLeafConfig],
		// The configuration for an <Annotation> element to be included into other configurations
		oAnnotationConfig = {
			"Annotation" : {
				__processor : processAnnotation,
				__postProcessor : postProcessAnnotation,
				__include : aExpressionInclude
			}
		},
		aAnnotatableExpressionInclude = [oAnnotationLeafConfig, oAnnotationConfig],
		oOperatorConfig = {
			__processor : processAnnotatableExpression,
			__postProcessor : postProcessOperation,
			__include : aAnnotatableExpressionInclude
		},
		oAnnotationExpressionConfig = {
			"And" : oOperatorConfig,
			"Apply" : {
				__processor : processAnnotatableExpression,
				__postProcessor : postProcessApply,
				__include : aAnnotatableExpressionInclude
			},
			"Cast" : {
				__processor : processAnnotatableExpression,
				__postProcessor : postProcessCastOrIsOf,
				__include : aAnnotatableExpressionInclude
			},
			"Collection" : {
				__postProcessor : postProcessCollection,
				__include : aExpressionInclude
			},
			"Eq" : oOperatorConfig,
			"Ge" : oOperatorConfig,
			"Gt" : oOperatorConfig,
			"If" : oOperatorConfig,
			"IsOf" : {
				__processor : processAnnotatableExpression,
				__postProcessor : postProcessCastOrIsOf,
				__include : aAnnotatableExpressionInclude
			},
			"LabeledElement" : {
				__processor : processAnnotatableExpression,
				__postProcessor : postProcessLabeledElement,
				__include : aAnnotatableExpressionInclude
			},
			"Le" : oOperatorConfig,
			"Lt" : oOperatorConfig,
			"Ne" : oOperatorConfig,
			"Null" : {
				__processor : processAnnotatableExpression,
				__postProcessor : postProcessNull,
				__include : [oAnnotationConfig]
			},
			"Not" : {
				__processor : processAnnotatableExpression,
				__postProcessor : postProcessNot,
				__include : aAnnotatableExpressionInclude
			},
			"Or" : oOperatorConfig,
			"Record" : {
				__processor : processAnnotatableExpression,
				__postProcessor : postProcessRecord,
				__include : [oAnnotationConfig],
				"PropertyValue" : {
					__processor : processPropertyValue,
					__postProcessor : postProcessPropertyValue,
					__include : aAnnotatableExpressionInclude
				}
			},
			"UrlRef" : {
				__postProcessor : postProcessUrlRef,
				__include : aExpressionInclude
			}
		},
		// The configuration for an <Annotations> element to be included into other configurations
		oAnnotationsConfig = {
			"Annotations" : {
				__processor : processAnnotations,
				__include : [oAnnotationConfig]
			}
		};

	// enable the recursion
	aExpressionInclude.push(oAnnotationExpressionConfig);
	aAnnotatableExpressionInclude.push(oAnnotationExpressionConfig);
	// yet another recursion: annotated Annotation
	oAnnotationConfig.Annotation.Annotation = oAnnotationConfig.Annotation;

	/**
	 * Determines the value for an annotation of the given type.
	 * @param {string} sType
	 *   The annotation type (either from the attribute name in the Annotation element or from
	 *   the element name itself)
	 * @param {string} sValue
	 *   The value in the XML (either the attribute value or the element's text value)
	 * @param {object} oAggregate
	 *   The aggregate
	 * @returns {any}
	 *   The value for the JSON
	 */
	function getAnnotationValue(sType, sValue, oAggregate) {
		var i, vValue, aValues;

		switch (sType) {
			case "AnnotationPath":
			case "NavigationPropertyPath":
			case "Path":
			case "PropertyPath":
				sValue = MetadataConverter.resolveAliasInPath(sValue, oAggregate);
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
					aValues[i] = MetadataConverter.resolveAliasInPath(aValues[i], oAggregate);
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
	}

	/**
	 * Determines the value for an inline annotation in the element.
	 *
	 * @param {Element} oElement The element
	 * @param {object} oAggregate
	 *   The aggregate
	 * @returns {any}
	 *   The value for the JSON
	 */
	function getInlineAnnotationValue(oElement, oAggregate) {
		var oAttribute,
			oAttributeList = oElement.attributes,
			i,
			vValue;

		// check the last attribute first, this is typically the one with the annotation value
		for (i = oAttributeList.length - 1; i >= 0; i--) {
			oAttribute = oAttributeList.item(i);
			vValue = getAnnotationValue(oAttribute.name, oAttribute.value, oAggregate);
			if (vValue !== undefined) {
				return vValue;
			}
		}
		return true;
	}

	/**
	 * Processes an Include element within a Reference.
	 * @param {Element} oElement The element
	 * @param {object} oAggregate The aggregate
	 */
	function processInclude(oElement, oAggregate) {
		var oInclude = MetadataConverter.getOrCreateArray(oAggregate.reference, "$Include");

		oInclude.push(oElement.getAttribute("Namespace") + ".");
	}

	/**
	 * Processes an IncludeAnnotations element within a Reference.
	 * @param {Element} oElement The element
	 * @param {object} oAggregate The aggregate
	 */
	function processIncludeAnnotations(oElement, oAggregate) {
		var oReference = oAggregate.reference,
			oIncludeAnnotation = {
				"$TermNamespace" : oElement.getAttribute("TermNamespace") + "."
			},
			aIncludeAnnotations =
				MetadataConverter.getOrCreateArray(oReference, "$IncludeAnnotations");

		MetadataConverter.processAttributes(oElement, oIncludeAnnotation, {
			"TargetNamespace" : function setValue(sValue) {
				return sValue ? sValue + "." : sValue;
			},
			"Qualifier" : MetadataConverter.setValue
		});

		aIncludeAnnotations.push(oIncludeAnnotation);
	}

	/**
	 * Processes a Reference element.
	 * @param {Element} oElement The element
	 * @param {object} oAggregate The aggregate
	 */
	function processReference(oElement, oAggregate) {
		var oReference = MetadataConverter.getOrCreateObject(oAggregate.result, "$Reference");

		oAggregate.reference = oReference[oElement.getAttribute("Uri")] = {};
		MetadataConverter.annotatable(oAggregate, oAggregate.reference);
	}

	/**
	 * Post-processing of an Annotation element. Sets the result of the single child element at
	 * the annotation if there was a child.
	 *
	 * @param {Element} oElement The element
	 * @param {any[]} aResult The results from child elements
	 * @param {object} oAggregate The aggregate
	 */
	function postProcessAnnotation(oElement, aResult, oAggregate) {
		// oAggregate.annotatable is the Annotation itself currently.
		var oAnnotatable = oAggregate.annotatable.parent;

		oAnnotatable.target[oAnnotatable.qualifiedName] =
			aResult.length ? aResult[0] : getInlineAnnotationValue(oElement, oAggregate);
	}

	/**
	 * Post-processing of an Apply element.
	 *
	 * @param {Element} oElement The element
	 * @param {any[]} aResult The results from child elements
	 * @param {object} oAggregate The aggregate
	 * @returns {object} The value for the JSON
	 */
	function postProcessApply(oElement, aResult, oAggregate) {
		var oResult = oAggregate.annotatable.target;

		oResult.$Apply = aResult;
		oResult.$Function =
			MetadataConverter.resolveAlias(oElement.getAttribute("Function"), oAggregate);
		return oResult;
	}

	/**
	 * Post-processing of a Cast or IsOf element.
	 *
	 * @param {Element} oElement The element
	 * @param {any[]} aResult The results from child elements
	 * @param {object} oAggregate The aggregate
	 * @returns {object} The value for the JSON
	 */
	function postProcessCastOrIsOf(oElement, aResult, oAggregate) {
		var sName = oElement.localName,
			oResult = oAggregate.annotatable.target;

		oResult["$" + sName] = aResult[0];
		oAggregate.processTypedCollection(oElement.getAttribute("Type"), oResult, oAggregate);
		oAggregate.processFacetAttributes(oElement, oResult);
		return oResult;
	}

	/**
	 * Post-processing of a Collection element.
	 *
	 * @param {Element} oElement The element
	 * @param {any[]} aResult The results from child elements
	 * @param {object} oAggregate The aggregate
	 * @returns {object} The value for the JSON
	 */
	function postProcessCollection(oElement, aResult, oAggregate) {
		return aResult;
	}

	/**
	 * Post-processing of a LabeledElement element within an Annotation element.
	 *
	 * @param {Element} oElement The element
	 * @param {any[]} aResult The results from child elements
	 * @param {object} oAggregate The aggregate
	 * @returns {any} The value for the JSON
	 */
	function postProcessLabeledElement(oElement, aResult, oAggregate) {
		var oResult = oAggregate.annotatable.target;

		oResult.$LabeledElement = aResult.length ? aResult[0] :
			getInlineAnnotationValue(oElement, oAggregate);
		oResult.$Name = oElement.getAttribute("Name");
		return oResult;
	}

	/**
	 * Post-processing of a LabeledElementReference element within an Annotation element.
	 *
	 * @param {Element} oElement The element
	 * @param {any[]} aResult The results from child elements
	 * @param {object} oAggregate The aggregate
	 * @returns {any} The value for the JSON
	 */
	function postProcessLabeledElementReference(oElement, aResult, oAggregate) {
		return {
			"$LabeledElementReference" :
				MetadataConverter.resolveAlias(oElement.textContent, oAggregate)
		};
	}

	/**
	 * Post-processing of a leaf element within an Annotation element.
	 *
	 * @param {Element} oElement The element
	 * @param {any[]} aResult The results from child elements
	 * @param {object} oAggregate The aggregate
	 * @returns {any} The constant value for the JSON
	 */
	function postProcessLeaf(oElement, aResult, oAggregate) {
		return getAnnotationValue(oElement.localName, oElement.textContent, oAggregate);
	}

	/**
	 * Post-processing of a Not element within an Annotation element.
	 *
	 * @param {Element} oElement The element
	 * @param {any[]} aResult The results from child elements
	 * @param {object} oAggregate The aggregate
	 * @returns {object} The value for the JSON
	 */
	function postProcessNot(oElement, aResult, oAggregate) {
		var oResult = oAggregate.annotatable.target;

		oResult.$Not = aResult[0];
		return oResult;
	}

	/**
	 * Post-processing of a Null element within an Annotation element.
	 *
	 * @param {Element} oElement The element
	 * @param {any[]} aResult The results from child elements
	 * @param {object} oAggregate The aggregate
	 * @returns {object} The value for the JSON
	 */
	function postProcessNull(oElement, aResult, oAggregate) {
		var oAnnotatable = oAggregate.annotatable,
			vResult = null;

		if (oAnnotatable.qualifiedName) {
			vResult = oAnnotatable.target;
			vResult.$Null = null;
		}
		return vResult;
	}

	/**
	 * Post-processing of a PropertyValue element within a Record element.
	 *
	 * @param {Element} oElement The element
	 * @param {any[]} aResult The results from child elements
	 * @param {object} oAggregate The aggregate
	 * @returns {any} The value for the JSON
	 */
	function postProcessPropertyValue(oElement, aResult, oAggregate) {
		return {
			property : oElement.getAttribute("Property"),
			value : aResult.length ? aResult[0] :
				getInlineAnnotationValue(oElement, oAggregate)
		};
	}

	/**
	 * Post-processing of a Record element within an Annotation element.
	 *
	 * @param {Element} oElement The element
	 * @param {any[]} aResult The results from child elements
	 * @param {object} oAggregate The aggregate
	 * @returns {object} The value for the JSON
	 */
	function postProcessRecord(oElement, aResult, oAggregate) {
		var i,
			oPropertyValue,
			oResult = oAggregate.annotatable.target,
			oType = oElement.getAttribute("Type");

		if (oType) {
			oResult.$Type = MetadataConverter.resolveAlias(oType, oAggregate);
		}
		for (i = 0; i < aResult.length; i++) {
			oPropertyValue = aResult[i];
			oResult[oPropertyValue.property] = oPropertyValue.value;
		}
		return oResult;
	}

	/**
	 * Post-processing of an operation element (And, Or, Eq etc) within an Annotation element.
	 *
	 * @param {Element} oElement The element
	 * @param {any[]} aResult The results from child elements
	 * @param {object} oAggregate The aggregate
	 * @returns {object} The value for the JSON
	 */
	function postProcessOperation(oElement, aResult, oAggregate) {
		var oResult = oAggregate.annotatable.target;

		oResult["$" + oElement.localName] = aResult;
		return oResult;
	}

	/**
	 * Post-processing of a UrlRef element within an Annotation element.
	 *
	 * @param {Element} oElement The element
	 * @param {any[]} aResult The results from child elements
	 * @returns {object} The constant value for the JSON
	 */
	function postProcessUrlRef(oElement, aResult) {
		return {$UrlRef : aResult[0]};
	}

	/**
	 * Processes an element of an annotatable expression.
	 * @param {Element} oElement The element
	 * @param {object} oAggregate The aggregate
	 */
	function processAnnotatableExpression(oElement, oAggregate) {
		MetadataConverter.annotatable(oAggregate, {});
	}

	/**
	 * Processes an Annotation element within Annotations.
	 * @param {Element} oElement The element
	 * @param {object} oAggregate The aggregate
	 */
	function processAnnotation(oElement, oAggregate) {
		var oAnnotatable = oAggregate.annotatable,
			oAnnotations,
			sQualifiedName = oAnnotatable.prefix + "@"
				+ MetadataConverter.resolveAlias(oElement.getAttribute("Term"), oAggregate),
			// oAnnotatable.qualifier can only come from <Annotations>. If such a qualifier is
			// set, <Annotation> itself MUST NOT supply a qualifier. (see spec Part 3, 14.3.2)
			sQualifier = oAnnotatable.qualifier || oElement.getAttribute("Qualifier");

		if (sQualifier) {
			sQualifiedName += "#" + sQualifier;
		}

		if (typeof oAnnotatable.target === "string") {
			oAnnotations = MetadataConverter.getOrCreateObject(oAggregate.schema, "$Annotations");
			oAnnotatable.target = oAnnotations[oAnnotatable.target] = {};
		}

		oAnnotatable.qualifiedName = sQualifiedName;
		// do not calculate a value yet, this is done in postProcessAnnotation
		oAnnotatable.target[sQualifiedName] = true;
		MetadataConverter.annotatable(oAggregate, oAnnotatable.target, sQualifiedName);
	}

	/**
	 * Processes an Annotations element.
	 * @param {Element} oElement The element
	 * @param {object} oAggregate The aggregate
	 */
	function processAnnotations(oElement, oAggregate) {
		MetadataConverter.annotatable(oAggregate,
			MetadataConverter.resolveAliasInPath(oElement.getAttribute("Target"), oAggregate),
			undefined, // no prefix
			oElement.getAttribute("Qualifier"));
	}

	/**
	 * Processes a PropertyValue element within a Record.
	 * @param {Element} oElement The element
	 * @param {object} oAggregate The aggregate
	 */
	function processPropertyValue(oElement, oAggregate) {
		MetadataConverter.annotatable(oAggregate, oAggregate.annotatable.target,
			oElement.getAttribute("Property"));
	}

	MetadataConverter = {
		/**
		 * The configuration for an <Annotation> element to be included into other configurations
		 */
		oAnnotationConfig : oAnnotationConfig,

		/**
		 * The configuration for an <Annotations> element to be included into other configurations
		 */
		oAnnotationsConfig : oAnnotationsConfig,
		/**
		 * The configuration for a <Reference> element to be included into other configurations
 		 */
		oReferenceInclude : {
			"Reference" : {
				__processor : processReference,
				__include : [oAnnotationConfig],
				"Include" : {
					__processor : processInclude
				},
				"IncludeAnnotations" : {
					__processor : processIncludeAnnotations
				}
			}
		},

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
				parent : oAggregate.annotatable, // The parent annotatable (note that <Annotation>
												 // is also annotatable, so in postProcessAnnotation
												 // the annotatable to modify is the parent)
				path : sPath, // the annotation path if externalized
				prefix : sPrefix || "",	// the prefix to put before the "@" and the term (used e.g.
										// for annotated annotations)
				qualifiedName : undefined, // the qualified name of the annotation
				qualifier : sQualifier, // the annotation qualifier
				target : vTarget // the target to add the annotation to or its name
				// qualifiedName and target (object) are determined in processAnnotation
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
		 * Resolves a target path including resolve aliases.
		 * @param {string} sPath The target path
		 * @param {object} oAggregate The aggregate containing the aliases
		 * @returns {string} The target path with the alias resolved (if there was one)
		 */
		resolveTargetPath : function (sPath, oAggregate) {
			var iSlash;

			if (!sPath) {
				return sPath;
			}

			sPath = MetadataConverter.resolveAliasInPath(sPath, oAggregate);
			iSlash = sPath.indexOf("/");

			if (iSlash >= 0 && sPath.indexOf("/", iSlash + 1) < 0) { // there is exactly one slash
				if (sPath.slice(0, iSlash) === oAggregate.result.$EntityContainer) {
					return sPath.slice(iSlash + 1);
				}
			}
			return sPath;
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
		 * @param {boolean} [bUseProcessElementHook=false]
		 *   If true, the hook processElement at the aggregate is used, otherwise the processor is
		 *   called directly
		 * @returns {any}
		 *   The return value from __postProcessor or undefined if there is none
		 */
		traverse : function (oElement, oAggregate, oConfig, bUseProcessElementHook) {
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

			if (bUseProcessElementHook) {
				oAggregate.processElement(oElement, oAggregate, oConfig.__processor);
			} else if (oConfig.__processor) {
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
							MetadataConverter.traverse(oChildNode, oAggregate, oChildConfig,
								bUseProcessElementHook);
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
