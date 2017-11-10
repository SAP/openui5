/*!
 * ${copyright}
 */

sap.ui.define([
	"jquery.sap.global",
	"./_Helper",
	"./_MetadataConverter"
], function (jQuery, _Helper, _MetadataConverter) {
	"use strict";

	var sEdmxNamespace = "http://docs.oasis-open.org/odata/ns/edmx",
		V4MetadataConverter,
		oAnnotationConfig = _MetadataConverter.oAnnotationConfig,
		oAliasConfig = {
			"Reference" : {
				"Include" : {__processor : _MetadataConverter.processAlias}
			},
			"DataServices" : {
				"Schema" : {__processor : _MetadataConverter.processAlias}
			}
		},
		oStructuredTypeConfig = {
			"Property" : {
				__processor : processTypeProperty,
				__include : [oAnnotationConfig]
			},
			"NavigationProperty" : {
				__processor : processTypeNavigationProperty,
				__include : [oAnnotationConfig],
				"OnDelete" : {
					__processor : processTypeNavigationPropertyOnDelete,
					__include : [oAnnotationConfig]
				},
				"ReferentialConstraint" : {
					__processor : processTypeNavigationPropertyReferentialConstraint,
					__include : [oAnnotationConfig]
				}
			}
		},
		oEntitySetConfig = {
			"NavigationPropertyBinding" : {
				__processor : processNavigationPropertyBinding
			}
		},
		oActionOrFunctionConfig = {
			"Parameter" : {
				__processor : processParameter,
				__include : [oAnnotationConfig]
			},
			"ReturnType" : {
				__processor : processReturnType,
				__include : [oAnnotationConfig]
			}
		},
		oFullConfig = {
			__processor : processEdmx,
			__include : [_MetadataConverter.oReferenceInclude],
			"DataServices" : {
				"Schema" : {
					__processor : processSchema,
					__include : [_MetadataConverter.oAnnotationsConfig, oAnnotationConfig],
					"Action" : {
						__processor : processActionOrFunction,
						__include : [oActionOrFunctionConfig, oAnnotationConfig]
					},
					"Function" : {
						__processor : processActionOrFunction,
						__include : [oActionOrFunctionConfig, oAnnotationConfig]
					},
					"EntityType" : {
						__processor : processEntityType,
						__include : [oStructuredTypeConfig, oAnnotationConfig],
						"Key" : {
							"PropertyRef" : {
								__processor : processEntityTypeKeyPropertyRef
							}
						}
					},
					"ComplexType" : {
						__processor : processComplexType,
						__include : [oStructuredTypeConfig, oAnnotationConfig]
					},
					"EntityContainer" : {
						__processor : processEntityContainer,
						__include : [oAnnotationConfig],
						"ActionImport" : {
							__processor : processImport.bind(null, "Action"),
							__include : [oAnnotationConfig]
						},
						"EntitySet" : {
							__processor : processEntitySet,
							__include : [oEntitySetConfig, oAnnotationConfig]
						},
						"FunctionImport" : {
							__processor : processImport.bind(null, "Function"),
							__include : [oAnnotationConfig]
						},
						"Singleton" : {
							__processor : processSingleton,
							__include : [oEntitySetConfig, oAnnotationConfig]
						}
					},
					"EnumType" : {
						__processor : processEnumType,
						__include : [oAnnotationConfig],
						"Member" : {
							__processor : processEnumTypeMember,
							__include : [oAnnotationConfig]
						}
					},
					"Term" : {
						__processor : processTerm,
						__include : [oAnnotationConfig]
					},
					"TypeDefinition" : {
						__processor : processTypeDefinition,
						__include : [oAnnotationConfig]
					}
				}
			}
		};


	/**
	 * Processes an Action or Function element.
	 * @param {Element} oElement The element
	 * @param {object} oAggregate The aggregate
	 */
	function processActionOrFunction(oElement, oAggregate) {
		var sKind = oElement.localName,
			sQualifiedName = oAggregate.namespace + oElement.getAttribute("Name"),
			oAction = {
				$kind : sKind
			};

		 V4MetadataConverter.processAttributes(oElement, oAction, {
			"IsBound" : V4MetadataConverter.setIfTrue,
			"EntitySetPath" : V4MetadataConverter.setValue,
			"IsComposable" : V4MetadataConverter.setIfTrue
		});

		V4MetadataConverter.getOrCreateArray(oAggregate.result, sQualifiedName).push(oAction);
		oAggregate.actionOrFunction = oAction;
		V4MetadataConverter.annotatable(oAggregate, oAction);
	}

	/**
	 * Processes a ComplexType element.
	 * @param {Element} oElement The element
	 * @param {object} oAggregate The aggregate
	 */
	function processComplexType(oElement, oAggregate) {
		processType(oElement, oAggregate, {"$kind" : "ComplexType"});
	}

	/**
	 * Processes the Edmx element.
	 * @param {Element} oElement The element
	 * @param {object} oAggregate The aggregate
	 */
	function processEdmx(oElement, oAggregate) {
		V4MetadataConverter.processAttributes(oElement, oAggregate.result, {
			"Version" : V4MetadataConverter.setValue
		});
	}

	/**
	 * Processes an EntityContainer element.
	 * @param {Element} oElement The element
	 * @param {object} oAggregate The aggregate
	 */
	function processEntityContainer(oElement, oAggregate) {
		var sQualifiedName = oAggregate.namespace + oElement.getAttribute("Name");

		oAggregate.result[sQualifiedName] = oAggregate.entityContainer = {
			"$kind" : "EntityContainer"
		};
		oAggregate.result.$EntityContainer = sQualifiedName;
		V4MetadataConverter.annotatable(oAggregate, sQualifiedName);
	}

	/**
	 * Processes an EntitySet element at the EntityContainer.
	 * @param {Element} oElement The element
	 * @param {object} oAggregate The aggregate
	 */
	function processEntitySet(oElement, oAggregate) {
		var sName = oElement.getAttribute("Name");

		oAggregate.entityContainer[sName] = oAggregate.entitySet = {
			$kind : "EntitySet",
			$Type :
				V4MetadataConverter.resolveAlias(oElement.getAttribute("EntityType"), oAggregate)
		};
		 V4MetadataConverter.processAttributes(oElement, oAggregate.entitySet, {
			"IncludeInServiceDocument" : V4MetadataConverter.setIfFalse
		});
		V4MetadataConverter.annotatable(oAggregate, sName);
	}

	/**
	 * Processes an EntityType element.
	 * @param {Element} oElement The element
	 * @param {object} oAggregate The aggregate
	 */
	function processEntityType(oElement, oAggregate) {
		processType(oElement, oAggregate, {
			$kind : "EntityType"
		});
	}

	/**
	 * Processes a PropertyRef element of the EntityType's Key.
	 * @param {Element} oElement The element
	 * @param {object} oAggregate The aggregate
	 */
	function processEntityTypeKeyPropertyRef(oElement, oAggregate) {
		var sAlias = oElement.getAttribute("Alias"),
			vKey,
			sName = oElement.getAttribute("Name");

		if (sAlias) {
			vKey = {};
			vKey[sAlias] = sName;
		} else {
			vKey = sName;
		}
		V4MetadataConverter.getOrCreateArray(oAggregate.type, "$Key").push(vKey);
	}

	/**
	 * Processes an EnumType element.
	 * @param {Element} oElement The element
	 * @param {object} oAggregate The aggregate
	 */
	function processEnumType(oElement, oAggregate) {
		var sQualifiedName = oAggregate.namespace + oElement.getAttribute("Name"),
			oEnumType = {
				"$kind" : "EnumType"
			};

		 V4MetadataConverter.processAttributes(oElement, oEnumType, {
			"IsFlags" : V4MetadataConverter.setIfTrue,
			"UnderlyingType" : function (sValue) {
				return sValue !== "Edm.Int32" ? sValue : undefined;
			}
		});

		oAggregate.result[sQualifiedName] = oAggregate.enumType = oEnumType;
		oAggregate.enumTypeMemberCounter = 0;
		V4MetadataConverter.annotatable(oAggregate, sQualifiedName);
	}

	/**
	 * Processes a Member element within an EnumType.
	 * @param {Element} oElement The element
	 * @param {object} oAggregate The aggregate
	 */
	function processEnumTypeMember(oElement, oAggregate) {
		var sName = oElement.getAttribute("Name"),
			sValue = oElement.getAttribute("Value"),
			vValue;

		if (sValue) {
			vValue = parseInt(sValue, 10);
			if (!_Helper.isSafeInteger(vValue)) {
				vValue = sValue;
			}
		} else {
			vValue = oAggregate.enumTypeMemberCounter;
			oAggregate.enumTypeMemberCounter++;
		}
		oAggregate.enumType[sName] = vValue;
		V4MetadataConverter.annotatable(oAggregate, sName);
	}

	/**
	 * Processes an ActionImport or FunctionImport element.
	 * @param {string} sWhat "Action" or "Function"
	 * @param {Element} oElement The element
	 * @param {object} oAggregate The aggregate
	 */
	function processImport(sWhat, oElement, oAggregate) {
		var oImport = {
				$kind : sWhat + "Import"
			},
			sName = oElement.getAttribute("Name");

		oImport["$" + sWhat]
			= V4MetadataConverter.resolveAlias(oElement.getAttribute(sWhat), oAggregate);
		 V4MetadataConverter.processAttributes(oElement, oImport, {
			"EntitySet" : function (sValue) {
				return V4MetadataConverter.resolveTargetPath(sValue, oAggregate);
			},
			"IncludeInServiceDocument" : V4MetadataConverter.setIfTrue
		});

		oAggregate.entityContainer[sName] = oImport;
		V4MetadataConverter.annotatable(oAggregate, sName);
	}

	/**
	 * Processes a NavigationPropertyBinding element within an EntitySet or Singleton.
	 * @param {Element} oElement The element
	 * @param {object} oAggregate The aggregate
	 */
	function processNavigationPropertyBinding(oElement, oAggregate) {
		var oNavigationPropertyBinding = V4MetadataConverter.getOrCreateObject(
				oAggregate.entitySet, "$NavigationPropertyBinding");

		oNavigationPropertyBinding[oElement.getAttribute("Path")]
			= V4MetadataConverter.resolveTargetPath(oElement.getAttribute("Target"), oAggregate);
	}

	/**
	 * Processes a Parameter element within an Action or Function.
	 * @param {Element} oElement The element
	 * @param {object} oAggregate The aggregate
	 */
	function processParameter(oElement, oAggregate) {
		var oActionOrFunction = oAggregate.actionOrFunction,
			oParameter = {};

		processTypedCollection(oElement.getAttribute("Type"), oParameter, oAggregate);
		 V4MetadataConverter.processAttributes(oElement, oParameter, {
			"Name" : V4MetadataConverter.setValue,
			"Nullable" : V4MetadataConverter.setIfFalse
		});
		V4MetadataConverter.processFacetAttributes(oElement, oParameter);

		V4MetadataConverter.getOrCreateArray(oActionOrFunction, "$Parameter").push(oParameter);
		V4MetadataConverter.annotatable(oAggregate, oParameter);
	}

	/**
	 * Processes a ReturnType element within an Action or Function.
	 * @param {Element} oElement The element
	 * @param {object} oAggregate The aggregate
	 */
	function processReturnType(oElement, oAggregate) {
		var oActionOrFunction = oAggregate.actionOrFunction,
			oReturnType = {};

		processTypedCollection(oElement.getAttribute("Type"), oReturnType, oAggregate);
		 V4MetadataConverter.processAttributes(oElement, oReturnType, {
			"Nullable" : V4MetadataConverter.setIfFalse
		});
		V4MetadataConverter.processFacetAttributes(oElement, oReturnType);

		oActionOrFunction.$ReturnType = oReturnType;
		V4MetadataConverter.annotatable(oAggregate, oReturnType);
	}

	/**
	 * Processes a Schema element.
	 * @param {Element} oElement The element
	 * @param {object} oAggregate The aggregate
	 */
	function processSchema(oElement, oAggregate) {
		oAggregate.namespace = oElement.getAttribute("Namespace") + ".";
		oAggregate.result[oAggregate.namespace] = oAggregate.schema = {
			"$kind" : "Schema"
		};
		V4MetadataConverter.annotatable(oAggregate, oAggregate.schema);
	}

	/**
	 * Processes a Singleton element at the EntityContainer.
	 * @param {Element} oElement The element
	 * @param {object} oAggregate The aggregate
	 */
	function processSingleton(oElement, oAggregate) {
		var sName = oElement.getAttribute("Name");

		oAggregate.entityContainer[sName] = oAggregate.entitySet = {
			$kind : "Singleton",
			$Type : V4MetadataConverter.resolveAlias(oElement.getAttribute("Type"), oAggregate)
		};
		V4MetadataConverter.annotatable(oAggregate, sName);
	}

	/**
	 * Processes a Term element.
	 * @param {Element} oElement The element
	 * @param {object} oAggregate The aggregate
	 */
	function processTerm(oElement, oAggregate) {
		var sQualifiedName = oAggregate.namespace + oElement.getAttribute("Name"),
			oTerm = {
				$kind : "Term"
			};

		processTypedCollection(oElement.getAttribute("Type"), oTerm, oAggregate);
		 V4MetadataConverter.processAttributes(oElement, oTerm, {
			"Nullable" : V4MetadataConverter.setIfFalse,
			"BaseTerm" : function (sValue) {
				return sValue ? V4MetadataConverter.resolveAlias(sValue, oAggregate) : undefined;
			}
		});
		V4MetadataConverter.processFacetAttributes(oElement, oTerm);

		oAggregate.result[sQualifiedName] = oTerm;
		V4MetadataConverter.annotatable(oAggregate, sQualifiedName);
	}

	/**
	 * Processes a ComplexType or EntityType element.
	 * @param {Element} oElement The element
	 * @param {object} oAggregate The aggregate
	 * @param {object} oType The initial typed result object
	 */
	function processType(oElement, oAggregate, oType) {
		var sQualifiedName = oAggregate.namespace + oElement.getAttribute("Name");

		 V4MetadataConverter.processAttributes(oElement, oType, {
			"OpenType" : V4MetadataConverter.setIfTrue,
			"HasStream" : V4MetadataConverter.setIfTrue,
			"Abstract" : V4MetadataConverter.setIfTrue,
			"BaseType" : function (sType) {
				return sType ? V4MetadataConverter.resolveAlias(sType, oAggregate) : undefined;
			}
		});

		oAggregate.result[sQualifiedName] = oAggregate.type = oType;
		V4MetadataConverter.annotatable(oAggregate, sQualifiedName);
	}

	/**
	 * Processes the type in the form "Type" or "Collection(Type)" and sets the appropriate
	 * properties.
	 * @param {string} sType The type attribute from the Element
	 * @param {object} oProperty The property attribute in the JSON
	 * @param {object} oAggregate The aggregate
	 */
	function processTypedCollection(sType, oProperty, oAggregate) {
		var aMatches = V4MetadataConverter.rCollection.exec(sType);

		if (aMatches) {
			oProperty.$isCollection = true;
			sType = aMatches[1];
		}
		oProperty.$Type = V4MetadataConverter.resolveAlias(sType, oAggregate);
	}

	/**
	 * Processes a TypeDefinition element.
	 * @param {Element} oElement The element
	 * @param {object} oAggregate The aggregate
	 */
	function processTypeDefinition(oElement, oAggregate) {
		var sQualifiedName = oAggregate.namespace + oElement.getAttribute("Name"),
			oTypeDefinition = {
				"$kind" : "TypeDefinition",
				"$UnderlyingType" : oElement.getAttribute("UnderlyingType")
			};

		oAggregate.result[sQualifiedName] = oTypeDefinition;
		V4MetadataConverter.processFacetAttributes(oElement, oTypeDefinition);
		V4MetadataConverter.annotatable(oAggregate, sQualifiedName);
	}

	/**
	 * Processes a NavigationProperty element of a structured type.
	 * @param {Element} oElement The element
	 * @param {object} oAggregate The aggregate
	 */
	function processTypeNavigationProperty(oElement, oAggregate) {
		var sName = oElement.getAttribute("Name"),
			oProperty = {
				$kind : "NavigationProperty"
			};

		processTypedCollection(oElement.getAttribute("Type"), oProperty, oAggregate);
		 V4MetadataConverter.processAttributes(oElement, oProperty, {
			"Nullable" : V4MetadataConverter.setIfFalse,
			"Partner" : V4MetadataConverter.setValue,
			"ContainsTarget" : V4MetadataConverter.setIfTrue
		});

		oAggregate.type[sName] = oAggregate.navigationProperty = oProperty;
		V4MetadataConverter.annotatable(oAggregate, sName);
	}

	/**
	 * Processes a NavigationProperty OnDelete element.
	 * @param {Element} oElement The element
	 * @param {object} oAggregate The aggregate
	 */
	function processTypeNavigationPropertyOnDelete(oElement, oAggregate) {
		oAggregate.navigationProperty.$OnDelete = oElement.getAttribute("Action");
		V4MetadataConverter.annotatable(oAggregate, oAggregate.navigationProperty, "$OnDelete");
	}

	/**
	 * Processes a NavigationProperty OnDelete element.
	 * @param {Element} oElement The element
	 * @param {object} oAggregate The aggregate
	 */
	function processTypeNavigationPropertyReferentialConstraint(oElement, oAggregate) {
		var sProperty = oElement.getAttribute("Property"),
			oReferentialConstraint = V4MetadataConverter.getOrCreateObject(
				oAggregate.navigationProperty, "$ReferentialConstraint");

		oReferentialConstraint[sProperty] = oElement.getAttribute("ReferencedProperty");
		V4MetadataConverter.annotatable(oAggregate, oReferentialConstraint, sProperty);
	}

	/**
	 * Processes a Property element of a structured type.
	 * @param {Element} oElement The element
	 * @param {object} oAggregate The aggregate
	 */
	function processTypeProperty(oElement, oAggregate) {
		var sName = oElement.getAttribute("Name"),
			oProperty = {
				"$kind" : "Property"
			};

		processTypedCollection(oElement.getAttribute("Type"), oProperty, oAggregate);
		 V4MetadataConverter.processAttributes(oElement, oProperty, {
			"Nullable" : V4MetadataConverter.setIfFalse,
			"DefaultValue" : V4MetadataConverter.setValue
		});
		V4MetadataConverter.processFacetAttributes(oElement, oProperty);

		oAggregate.type[sName] = oProperty;
		V4MetadataConverter.annotatable(oAggregate, sName);
	}

	V4MetadataConverter = jQuery.extend({}, _MetadataConverter, {
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
		convertXMLMetadata : function (oDocument, sUrl) {
			var oAggregate, oElement;

			jQuery.sap.measure.average("convertXMLMetadata", "",
				"sap.ui.model.odata.v4.lib._V4MetadataConverter");

			oElement = oDocument.documentElement;
			if (oElement.localName !== "Edmx" || oElement.namespaceURI !== sEdmxNamespace) {
				throw new Error(sUrl + " is not a valid OData V4 metadata document");
			}
			oAggregate = {
				"actionOrFunction" : null, // the current action or function
				"aliases" : {}, // maps alias -> namespace
				"annotatable" : null, // the current annotatable, see function annotatable
				"entityContainer" : null, // the current EntityContainer
				"entitySet" : null, // the current EntitySet/Singleton
				"enumType" : null, // the current EnumType
				"enumTypeMemberCounter" : 0, // the current EnumType member value counter
				"namespace" : null, // the namespace of the current Schema
				"navigationProperty" : null, // the current NavigationProperty
				"processFacetAttributes" : V4MetadataConverter.processFacetAttributes,
				"processTypedCollection" : processTypedCollection,
				"reference" : null, // the current Reference
				"schema" : null, // the current Schema
				"type" : null, // the current EntityType/ComplexType
				"result" : {}
			};

			// first round: find aliases
			V4MetadataConverter.traverse(oElement, oAggregate, oAliasConfig);
			// second round, full conversion
			V4MetadataConverter.traverse(oElement, oAggregate, oFullConfig);

			if (oAggregate.result.$Version !== "4.0") {
				throw new Error(sUrl + ": Unsupported OData version " + oAggregate.result.$Version);
			}

			jQuery.sap.measure.end("convertXMLMetadata");
			return oAggregate.result;
		},

		/**
		 * Processes the TFacetAttributes and TPropertyFacetAttributes of the elements Property,
		 * TypeDefinition etc.
		 * @param {Element} oElement The element
		 * @param {object} oResult The result object to fill
		 */
		processFacetAttributes : function (oElement, oResult) {
			 V4MetadataConverter.processAttributes(oElement, oResult, {
				"MaxLength" : function (sValue) {
					return sValue === "max" ? undefined : V4MetadataConverter.setNumber(sValue);
				},
				"Precision" : V4MetadataConverter.setNumber,
				"Scale" : function (sValue) {
					return sValue === "variable" ? sValue : V4MetadataConverter.setNumber(sValue);
				},
				"SRID" : V4MetadataConverter.setValue,
				"Unicode" : V4MetadataConverter.setIfFalse
			});
		}
	});

	return V4MetadataConverter;
}, /* bExport= */false);
