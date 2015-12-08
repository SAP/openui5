/*!
 * ${copyright}
 */

//Provides class sap.ui.model.odata.v4.lib._MetadataConverter
sap.ui.define(["./_Helper"], function (Helper) {
	"use strict";

	var MetadataConverter,
		rCollection = /^Collection\((.*)\)$/,
		oAliasConfig = {
			"Reference" : {
				"Include" : {__processor : processAlias}
			},
			"DataServices" : {
				"Schema" : {__processor : processAlias}
			}
		},
		oStructuredTypeConfig = {
			"Property" : {
				__processor : processTypeProperty
			},
			"NavigationProperty" : {
				__processor : processTypeNavigationProperty,
				"OnDelete" : {
					__processor : processTypeNavigationPropertyOnDelete
				},
				"ReferentialConstraint" : {
					__processor : processTypeNavigationPropertyReferentialConstraint
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
				__processor : processParameter
			},
			"ReturnType" : {
				__processor : processReturnType
			}
		},
		oFullConfig = {
			"Reference" : {
				__processor : processReference,
				"Include" : {
					__processor: processInclude
				}
			},
			"DataServices" : {
				"Schema" : {
					__processor : processSchema,
					"Action" : {
						__processor : processActionOrFunction,
						__include : oActionOrFunctionConfig
					},
					"Annotations" : {
						__processor : processAnnotations,
						"Annotation" : {
							__processor : processAnnotation
						}
					},
					"Function" : {
						__processor : processActionOrFunction,
						__include : oActionOrFunctionConfig
					},
					"EntityType" : {
						__processor : processEntityType,
						__include : oStructuredTypeConfig,
						"Key" : {
							"PropertyRef" : {
								__processor : processEntityTypeKeyPropertyRef
							}
						}
					},
					"ComplexType" : {
						__processor : processComplexType,
						__include : oStructuredTypeConfig
					},
					"EntityContainer" : {
						__processor : processEntityContainer,
						"ActionImport" : {
							__processor : processImport.bind(null, "Action")
						},
						"EntitySet" : {
							__processor : processEntitySet,
							__include : oEntitySetConfig
						},
						"FunctionImport" : {
							__processor : processImport.bind(null, "Function")
						},
						"Singleton" : {
							__processor : processSingleton,
							__include : oEntitySetConfig
						}
					},
					"EnumType" : {
						__processor : processEnumType,
						"Member" : {
							__processor : processEnumTypeMember
						}
					},
					"Term" : {
						__processor : processTerm
					},
					"TypeDefinition" : {
						__processor : processTypeDefinition
					}
				}
			}
		};

	/**
	 * Returns the attributes of the DOM Element as map.
	 *
	 * @param {Element}
	 *            oElement the element
	 * @returns {object} the attributes
	 */
	function getAttributes(oElement) {
		var oAttribute, oAttributeList = oElement.attributes, i, oResult = {};

		for (i = 0; i < oAttributeList.length; i++) {
			oAttribute = oAttributeList.item(i);
			oResult[oAttribute.name] = oAttribute.value;
		}
		return oResult;
	}

	/**
	 * Processes an Action or Function element.
	 * @param {Element} oElement the element
	 * @param {object} oAggregate the aggregate
	 */
	function processActionOrFunction(oElement, oAggregate) {
		var sKind = oElement.localName,
			oAttributes = getAttributes(oElement),
			sQualifiedName = oAggregate.namespace + "." + oAttributes.Name,
			aActions = oAggregate.result[sQualifiedName] || [],
			oAction = {
				$kind: sKind,
				$Parameter: []
			};

		processAttributes(oAttributes, oAction, {
			"IsBound" : setIfTrue,
			"EntitySetPath" : setValue,
			"IsComposable" : setIfTrue
		});

		oAggregate.result[sQualifiedName] = aActions.concat(oAction);
		oAggregate.actionOrFunction = oAction;
	}

	/**
	 * Extracts the Aliases from the Include and Schema elements.
	 * @param {Element} oElement the element
	 * @param {object} oAggregate the aggregate
	 */
	function processAlias(oElement, oAggregate) {
		var oAttributes = getAttributes(oElement);

		if (oAttributes.Alias) {
			oAggregate.aliases[oAttributes.Alias] = oAttributes.Namespace;
		}
	}

	/**
	 * Processes an Annotations element.
	 * @param {Element} oElement the element
	 * @param {object} oAggregate the aggregate
	 */
	function processAnnotations(oElement, oAggregate) {
		var oAttributes = getAttributes(oElement),
			sTargetName = MetadataConverter.resolveAliasInPath(oAttributes.Target, oAggregate),
			oTarget = {};

		if (!oAggregate.result.$Annotations) {
			oAggregate.result.$Annotations = {};
		}
		oAggregate.result.$Annotations[sTargetName] = oTarget;
		oAggregate.annotations =  {
			target: oTarget,
			qualifier: oAttributes.Qualifier
		};
	}

	/**
	 * Processes an Annotation element within Annotations.
	 * @param {Element} oElement the element
	 * @param {object} oAggregate the aggregate
	 */
	function processAnnotation(oElement, oAggregate) {
		var oAttributes = getAttributes(oElement),
			sTerm = MetadataConverter.resolveAlias(oAttributes.Term, oAggregate),
			sQualifiedName = "@" + sTerm,
			sQualifier = oAggregate.annotations.qualifier || oAttributes.Qualifier,
			vValue = true;

		if (sQualifier) {
			sQualifiedName += "#" + sQualifier;
		}

		if (oAttributes.Binary) {
			vValue = {$Binary: oAttributes.Binary};
		} else if (oAttributes.Bool) {
			vValue = oAttributes.Bool === "true";
		} else if (oAttributes.Date) {
			vValue = {$Date: oAttributes.Date};
		} else if (oAttributes.DateTimeOffset) {
			vValue = {$DateTimeOffset: oAttributes.DateTimeOffset};
		} else if (oAttributes.Decimal) {
			vValue = {$Decimal: oAttributes.Decimal};
		} else if (oAttributes.Duration) {
			vValue = {$Duration: oAttributes.Duration};
		} else if (oAttributes.EnumMember) {
			vValue = parseInt(oAttributes.EnumMember, 10);
			if (!Helper.isSafeInteger(vValue)) {
				vValue = oAttributes.EnumMember;
			}
			vValue = {$EnumMember: vValue};
		} else if (oAttributes.Float) {
			if (oAttributes.Float === "NaN") {
				vValue = {$Float: "NaN"};
			} else if (oAttributes.Float === "INF") {
				vValue = {$Float: "Infinity"};
			} else if (oAttributes.Float === "-INF") {
				vValue = {$Float: "-Infinity"};
			} else {
				vValue = parseFloat(oAttributes.Float);
			}
		} else if (oAttributes.Guid) {
			vValue = {$Guid: oAttributes.Guid};
		} else if (oAttributes.Int) {
			vValue = parseInt(oAttributes.Int, 10);
			vValue = Helper.isSafeInteger(vValue) ? vValue : {$Int: oAttributes.Int};
		}  else if (oAttributes.String) {
			vValue = oAttributes.String;
		} else if (oAttributes.TimeOfDay) {
			vValue = {$TimeOfDay: oAttributes.TimeOfDay};
		} else if (oAttributes.AnnotationPath) {
			vValue = {$AnnotationPath: MetadataConverter.resolveAliasInPath(
					oAttributes.AnnotationPath, oAggregate)};
		} else if (oAttributes.NavigationPropertyPath) {
			vValue = {$NavigationPropertyPath: MetadataConverter.resolveAliasInPath(
					oAttributes.NavigationPropertyPath, oAggregate)};
		} else if (oAttributes.Path) {
			vValue = {$Path: MetadataConverter.resolveAliasInPath(
					oAttributes.Path, oAggregate)};
		} else if (oAttributes.PropertyPath) {
			vValue = {$PropertyPath: MetadataConverter.resolveAliasInPath(
					oAttributes.PropertyPath, oAggregate)};
		} else if (oAttributes.UrlRef) {
			vValue = {$UrlRef: oAttributes.UrlRef};
		}

		oAggregate.annotations.target[sQualifiedName] = vValue;
	}

	/**
	 * Copies all attributes from oAttributes to oTarget according to oConfig.
	 * @param {object} oAttributes the attribute of an Element as returned by getAttributes
	 * @param {object} oTarget the target object
	 * @param {object} oConfig
	 *   the configuration: each property describes a property of oAttributes to copy; the value is
	 *   a conversion function, if this function returns undefined, the property is not set
	 */
	function processAttributes(oAttributes, oTarget, oConfig) {
		Object.keys(oConfig).forEach(function (sProperty) {
			var sValue = oConfig[sProperty](oAttributes[sProperty]);
			if (sValue !== undefined) {
				oTarget["$" + sProperty] = sValue;
			}
		});
	}

	/**
	 * Processes a ComplexType element.
	 * @param {Element} oElement the element
	 * @param {object} oAggregate the aggregate
	 */
	function processComplexType(oElement, oAggregate) {
		processType(oElement, oAggregate, {"$kind" : "ComplexType"});
	}

	/**
	 * Processes an EntityContainer element.
	 * @param {Element} oElement the element
	 * @param {object} oAggregate the aggregate
	 */
	function processEntityContainer(oElement, oAggregate) {
		var sQualifiedName = oAggregate.namespace + "." + oElement.getAttribute("Name");
		oAggregate.result[sQualifiedName] = oAggregate.entityContainer = {
			"$kind" : "EntityContainer"
		};
		oAggregate.result.$EntityContainer = sQualifiedName;
	}

	/**
	 * Processes an EntitySet element at the EntityContainer.
	 * @param {Element} oElement the element
	 * @param {object} oAggregate the aggregate
	 */
	function processEntitySet(oElement, oAggregate) {
		var oAttributes = getAttributes(oElement);
		oAggregate.entityContainer[oAttributes.Name] = oAggregate.entitySet = {
			$kind : "EntitySet",
			$Type : MetadataConverter.resolveAlias(oAttributes.EntityType, oAggregate)
		};
		if (oAttributes.IncludeInServiceDocument === "false") {
			oAggregate.entitySet.$IncludeInServiceDocument = false;
		}
	}

	/**
	 * Processes an EntityType element.
	 * @param {Element} oElement the element
	 * @param {object} oAggregate the aggregate
	 */
	function processEntityType(oElement, oAggregate) {
		processType(oElement, oAggregate, {
			$kind: "EntityType",
			$Key : []
		});
	}

	/**
	 * Processes a PropertyRef element of the EntityType's Key.
	 * @param {Element} oElement the element
	 * @param {object} oAggregate the aggregate
	 */
	function processEntityTypeKeyPropertyRef(oElement, oAggregate) {
		var oAttributes = getAttributes(oElement),
			vKey;

		if (oAttributes.Alias) {
			vKey = {};
			vKey[oAttributes.Alias] = oAttributes.Name;
		} else {
			vKey = oAttributes.Name;
		}
		oAggregate.type.$Key = oAggregate.type.$Key.concat(vKey);
	}

	/**
	 * Processes an EnumType element.
	 * @param {Element} oElement the element
	 * @param {object} oAggregate the aggregate
	 */
	function processEnumType(oElement, oAggregate) {
		var oAttributes = getAttributes(oElement),
			sQualifiedName = oAggregate.namespace + "." + oAttributes.Name,
			oEnumType = {
				"$kind": "EnumType"
			};

		processAttributes(oAttributes, oEnumType, {
			"IsFlags" : setIfTrue,
			"UnderlyingType" : function (sValue) {
				return sValue !== "Edm.Int32" ? sValue : undefined;
			}
		});

		oAggregate.result[sQualifiedName] = oAggregate.enumType = oEnumType;
		oAggregate.enumTypeMemberCounter = 0;
	}

	/**
	 * Processes an Member element within a EnumType.
	 * @param {Element} oElement the element
	 * @param {object} oAggregate the aggregate
	 */
	function processEnumTypeMember(oElement, oAggregate) {
		var oAttributes = getAttributes(oElement),
			vValue = oAttributes.Value;

		if (vValue) {
			vValue = parseInt(vValue, 10);
			if (!Helper.isSafeInteger(vValue)) {
				vValue = oAttributes.Value;
			}
		} else {
			vValue = oAggregate.enumTypeMemberCounter;
			oAggregate.enumTypeMemberCounter++;
		}
		oAggregate.enumType[oAttributes.Name] = vValue;
	}

	/**
	 * Processes an ActionImport or FunctionImport element.
	 * @param {string} sWhat "Action" or "Function"
	 * @param {Element} oElement the element
	 * @param {object} oAggregate the aggregate
	 */
	function processImport(sWhat, oElement, oAggregate) {
		var oAttributes = getAttributes(oElement),
			oImport = {
				$kind: sWhat + "Import"
			};

		oImport["$" + sWhat] = MetadataConverter.resolveAlias(oAttributes[sWhat], oAggregate);
		processAttributes(oAttributes, oImport, {
			"EntitySet" : function (sValue) {
				return resolveTargetPath(sValue, oAggregate);
			},
			"IncludeInServiceDocument" : setIfFalse
		});

		oAggregate.entityContainer[oAttributes.Name] = oImport;
	}

	/**
	 * Processes an Include element within a Reference.
	 * @param {Element} oElement the element
	 * @param {object} oAggregate the aggregate
	 */
	function processInclude(oElement, oAggregate) {
		oAggregate.result[oElement.getAttribute("Namespace")] = {
			"$kind" : "Reference",
			"$ref" : oAggregate.referenceUri
		};
	}

	/**
	 * Processes a NavigationPropertyBinding element within an EntitySet or Singleton.
	 * @param {Element} oElement the element
	 * @param {object} oAggregate the aggregate
	 */
	function processNavigationPropertyBinding(oElement, oAggregate) {
		var oAttributes = getAttributes(oElement),
			oNavigationPropertyBinding = oAggregate.entitySet.$NavigationPropertyBinding;

		if (!oNavigationPropertyBinding) {
			oAggregate.entitySet.$NavigationPropertyBinding = oNavigationPropertyBinding = {};
		}
		oNavigationPropertyBinding[oAttributes.Path]
			= resolveTargetPath(oAttributes.Target, oAggregate);
	}

	/**
	 * Processes a Parameter element within an Action or Function.
	 * @param {Element} oElement the element
	 * @param {object} oAggregate the aggregate
	 */
	function processParameter(oElement, oAggregate) {
		var oAttributes = getAttributes(oElement),
			oActionOrFunction = oAggregate.actionOrFunction,
			oParameter = {
				$kind: "Parameter"
			};

		processTypedCollection(oAttributes.Type, oParameter, oAggregate);
		processAttributes(oAttributes, oParameter, {
			"Name" : setValue,
			"Nullable" : setIfFalse
		});
		MetadataConverter.processFacetAttributes(oAttributes, oParameter);

		oActionOrFunction.$Parameter.push(oParameter);
	}

	/**
	 * Processes a Reference element.
	 * @param {Element} oElement the element
	 * @param {object} oAggregate the aggregate
	 */
	function processReference(oElement, oAggregate) {
		oAggregate.referenceUri = oElement.getAttribute("Uri");
	}

	/**
	 * Processes a ReturnType element within an Action or Function.
	 * @param {Element} oElement the element
	 * @param {object} oAggregate the aggregate
	 */
	function processReturnType(oElement, oAggregate) {
		var oAttributes = getAttributes(oElement),
			oActionOrFunction = oAggregate.actionOrFunction,
			oReturnType = {};

		processTypedCollection(oAttributes.Type, oReturnType, oAggregate);
		processAttributes(oAttributes, oReturnType, {
			"Nullable" : setIfFalse
		});
		MetadataConverter.processFacetAttributes(oAttributes, oReturnType);

		oActionOrFunction.$ReturnType = oReturnType;
	}

	/**
	 * Processes a Schema element.
	 * @param {Element} oElement the element
	 * @param {object} oAggregate the aggregate
	 */
	function processSchema(oElement, oAggregate) {
		oAggregate.namespace = oElement.getAttribute("Namespace");
	}

	/**
	 * Processes a Singleton element at the EntityContainer.
	 * @param {Element} oElement the element
	 * @param {object} oAggregate the aggregate
	 */
	function processSingleton(oElement, oAggregate) {
		var oAttributes = getAttributes(oElement);
		oAggregate.entityContainer[oAttributes.Name] = oAggregate.entitySet = {
			$kind : "Singleton",
			$Type : MetadataConverter.resolveAlias(oAttributes.Type, oAggregate)
		};
	}

	/**
	 * Processes a Term element.
	 * @param {Element} oElement the element
	 * @param {object} oAggregate the aggregate
	 */
	function processTerm(oElement, oAggregate) {
		var oAttributes = getAttributes(oElement),
			sQualifiedName = oAggregate.namespace + "." + oAttributes.Name,
			oTerm = {
				$kind: "Term"
			};

		processTypedCollection(oAttributes.Type, oTerm, oAggregate);
		processAttributes(oAttributes, oTerm, {
			"Nullable" : setIfFalse,
			"BaseTerm" : function (sValue) {
				return sValue ? MetadataConverter.resolveAlias(sValue, oAggregate) : undefined;
			}
		});
		MetadataConverter.processFacetAttributes(oAttributes, oTerm);

		oAggregate.result[sQualifiedName] = oTerm;
	}

	/**
	 * Processes a ComplexType or EntityType element.
	 * @param {Element} oElement the element
	 * @param {object} oAggregate the aggregate
	 * @param {object} oType the initial typed result object
	 */
	function processType(oElement, oAggregate, oType) {
		var oAttributes = getAttributes(oElement),
			sQualifiedName = oAggregate.namespace + "." + oAttributes.Name;

		processAttributes(oAttributes, oType, {
			"OpenType" : setIfTrue,
			"HasStream" : setIfTrue,
			"Abstract" : setIfTrue,
			"BaseType" : setValue
		});

		oAggregate.result[sQualifiedName] = oAggregate.type = oType;
	}

	/**
	 * Processes the type in the form "Type" or "Collection(Type)" and sets the appropriate
	 * properties.
	 * @param {string} sType the type attribute from the Element
	 * @param {object} oProperty the property attribute in the JSON
	 * @param {object} oAggregate the aggregate
	 */
	function processTypedCollection(sType, oProperty, oAggregate) {
		var aMatches = rCollection.exec(sType);

		if (aMatches) {
			oProperty.$isCollection = true;
			sType = aMatches[1];
		}
		oProperty.$Type = MetadataConverter.resolveAlias(sType, oAggregate);
	}

	/**
	 * Processes an TypeDefinition element.
	 * @param {Element} oElement the element
	 * @param {object} oAggregate the aggregate
	 */
	function processTypeDefinition(oElement, oAggregate) {
		var oAttributes = getAttributes(oElement),
			sQualifiedName = oAggregate.namespace + "." + oAttributes.Name,
			oTypeDefinition = {
				"$kind" : "TypeDefinition",
				"$UnderlyingType" : oAttributes.UnderlyingType
			};

		oAggregate.result[sQualifiedName] = oTypeDefinition;
		MetadataConverter.processFacetAttributes(oAttributes, oTypeDefinition);
	}

	/**
	 * Processes a NavigationProperty element of a structured type.
	 * @param {Element} oElement the element
	 * @param {object} oAggregate the aggregate
	 */
	function processTypeNavigationProperty(oElement, oAggregate) {
		var oAttributes = getAttributes(oElement),
			oProperty = {
				$kind : "NavigationProperty"
			};

		processTypedCollection(oAttributes.Type, oProperty, oAggregate);
		processAttributes(oAttributes, oProperty, {
			"Nullable" : setIfFalse,
			"Partner" : setValue,
			"ContainsTarget" : setIfTrue
		});

		oAggregate.type[oAttributes.Name] = oAggregate.navigationProperty = oProperty;
	}

	/**
	 * Processes a NavigationProperty OnDelete element.
	 * @param {Element} oElement the element
	 * @param {object} oAggregate the aggregate
	 */
	function processTypeNavigationPropertyOnDelete(oElement, oAggregate) {
		oAggregate.navigationProperty.$OnDelete = oElement.getAttribute("Action");
	}

	/**
	 * Processes a NavigationProperty OnDelete element.
	 * @param {Element} oElement the element
	 * @param {object} oAggregate the aggregate
	 */
	function processTypeNavigationPropertyReferentialConstraint(oElement, oAggregate) {
		var oAttributes = getAttributes(oElement),
			oReferentialConstraint = oAggregate.navigationProperty.$ReferentialConstraint;

		if (!oReferentialConstraint) {
			oAggregate.navigationProperty.$ReferentialConstraint = oReferentialConstraint = {};
		}

		oReferentialConstraint[oAttributes.Property] = oAttributes.ReferencedProperty;
	}

	/**
	 * Processes a Property element of a structured type.
	 * @param {Element} oElement the element
	 * @param {object} oAggregate the aggregate
	 */
	function processTypeProperty(oElement, oAggregate) {
		var oAttributes = getAttributes(oElement),
			oProperty = {
				"$kind" : "Property"
			};

		processTypedCollection(oAttributes.Type, oProperty, oAggregate);
		processAttributes(oAttributes, oProperty, {
			"Nullable" : setIfFalse
		});
		MetadataConverter.processFacetAttributes(oAttributes, oProperty);

		oAggregate.type[oAttributes.Name] = oProperty;
	}

	/**
	 * Resolves a target path including resolve aliases.
	 * @param {string} sPath the target path
	 * @param {object} oAggregate the aggregate containing the aliases
	 * @returns {string} the target path with the alias resolved (if there was one)
	 */
	function resolveTargetPath(sPath, oAggregate) {
		var iSlash;

		if (!sPath) {
			return sPath;
		}

		sPath =  MetadataConverter.resolveAliasInPath(sPath, oAggregate);
		iSlash = sPath.indexOf("/");

		if (iSlash >= 0 && sPath.indexOf("/", iSlash + 1) < 0) { // if there is exactly one slash
			if (sPath.slice(0, iSlash) === oAggregate.result.$EntityContainer) {
				return sPath.slice(iSlash + 1);
			}
		}
		return sPath;
	}

	/**
	 * Helper for processAttributes, returns false if sValue is "false", returns undefined
	 * otherwise.
	 * @param {string} sValue the attribute value in the element
	 * @returns {boolean} false or undefined
	 */
	function setIfFalse(sValue) {
		return sValue === "false" ? false : undefined;
	}

	/**
	 * Helper for processAttributes, returns true if sValue is "true", returns undefined
	 * otherwise.
	 * @param {string} sValue the attribute value in the element
	 * @returns {boolean} true or undefined
	 */
	function setIfTrue(sValue) {
		return sValue === "true" ? true : undefined;
	}

	/**
	 * Helper for processAttributes, returns sValue converted to a number.
	 * @param {string} sValue the attribute value in the element
	 * @returns {number} the value as number or undefined
	 */
	function setNumber(sValue) {
		return sValue ? parseInt(sValue, 10) : undefined;
	}

	/**
	 * Helper for processAttributes, returns sValue.
	 * @param {string} sValue the attribute value in the element
	 * @returns {string} sValue
	 */
	function setValue(sValue) {
		return sValue;
	}

	MetadataConverter = {
		/**
		 * Converts the metadata from XML format to a JSON object.
		 *
		 * @param {Document} oDocument
		 *   the XML DOM document
		 * @returns {object}
		 *   the metadata JSON
		 */
		convertXMLMetadata : function (oDocument) {
			var oAggregate = {
					"actionOrFunction" : null, // the current action or function
					"aliases" : {}, // maps alias -> namespace
					"annotations" : {}, // target: the object to put annotations to
										// qualifier: the current Annotations element's qualifier
					"entityContainer" : null, // the current EntityContainer
					"entitySet" : null, // the current EntitySet/Singleton
					"enumType" : null, // the current EnumType
					"enumTypeMemberCounter" : 0, // the current EnumType member value counter
					"namespace" : null, // the namespace of the current Schema
					"navigationProperty" : null, // the current NavigationProperty
					"referenceUri" : null, // the URI of the current Reference
					"type" : null, // the current EntityType/ComplexType
					"result" : {}
				},
				oElement = oDocument.documentElement;

			// first round: find aliases
			MetadataConverter.traverse(oElement, oAggregate, oAliasConfig);
			// second round, full conversion
			MetadataConverter.traverse(oElement, oAggregate, oFullConfig);
			return oAggregate.result;
		},

		/**
		 * Processes the TFacetAttributes and TPropertyFacetAttributes of the elements Property,
		 * TypeDefinition etc.
		 * @param {object} oAttributes the element attributes
		 * @param {object} oResult the result object to fill
		 */
		processFacetAttributes : function (oAttributes, oResult) {
			processAttributes(oAttributes, oResult, {
				"MaxLength" : setNumber,
				"Precision" : setNumber,
				"Scale" : function (sValue) {
					return sValue === "variable" ? sValue : setNumber(sValue);
				},
				"SRID" : setValue,
				"Unicode" : setIfFalse
			});
		},

		/**
		 * Resolves an alias in the given qualified name or full name.
		 * @param {string} sName the name
		 * @param {object} oAggregate the aggregate containing the aliases
		 * @returns {string} the name with the alias resolved (if there was one)
		 */
		resolveAlias : function (sName, oAggregate) {
			var iDot = sName.indexOf("."),
				sNamespace;

			if (iDot >= 0 && sName.indexOf(".", iDot + 1) < 0) { // if there is exactly one dot
				sNamespace = oAggregate.aliases[sName.slice(0, iDot)];
				if (sNamespace) {
					return sNamespace + "." + sName.slice(iDot + 1);
				}
			}
			return sName;
		},

		/**
		 * Resolves all aliases in the given path.
		 * @param {string} sPath the path
		 * @param {object} oAggregate the aggregate containing the aliases
		 * @returns {string} the path with the alias resolved (if there was one)
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
		 * Recursively traverses the subtree of a given xml element controlled by the given
		 * schema config.
		 *
		 * @param {Element} oElement
		 *   an XML DOM element
		 * @param {object} oAggregate
		 *   an aggregate object that is passed to every processor function
		 * @param {object} oSchemaConfig
		 *   the configuration for this element. The property __processor is a function called
		 *   with this element and oAggregate as parameters; all other properties are known
		 *   child elements, the value is the configuration for that child element
		 */
		traverse : function (oElement, oAggregate, oSchemaConfig) {
			var oChildList = oElement.childNodes,
				oChildNode, i, oNodeInfo;

			if (oSchemaConfig.__processor) {
				oSchemaConfig.__processor(oElement, oAggregate);
			}
			for (i = 0; i < oChildList.length; i++) {
				oChildNode = oChildList.item(i);
				if (oChildNode.nodeType === 1) { // Node.ELEMENT_NODE
					oNodeInfo = oSchemaConfig[oChildNode.localName];
					if (!oNodeInfo && oSchemaConfig.__include) {
						oNodeInfo = oSchemaConfig.__include[oChildNode.localName];
					}
					if (oNodeInfo) {
						MetadataConverter.traverse(oChildNode, oAggregate, oNodeInfo);
					}
				}
			}
		}
	};

	return MetadataConverter;
}, /* bExport= */false);
