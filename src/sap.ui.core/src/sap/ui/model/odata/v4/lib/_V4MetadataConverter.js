/*!
 * ${copyright}
 */

//Provides class sap.ui.model.odata.v4.lib._V4MetadataConverter
sap.ui.define([
	"jquery.sap.global",
	"./_Helper",
	"./_MetadataConverter"
], function (jQuery, _Helper, _MetadataConverter) {
	"use strict";

	/**
	 * Creates a converter for V4 metadata.
	 *
	 * @constructor
	 */
	function V4MetadataConverter() {
		this.enumType = null; // the current EnumType
		this.enumTypeMemberCounter = 0; // the current EnumType member value counter
		this.navigationProperty = null; // the current NavigationProperty

		_MetadataConverter.call(this);
	}

	V4MetadataConverter.prototype = Object.create(_MetadataConverter.prototype);

	/**
	 * Finalizes the conversion after having traversed the XML completely.
	 *
	 * @override
	 */
	V4MetadataConverter.prototype.finalize = function () {
		if (this.result.$Version !== "4.0") {
			throw new Error(this.url + ": Unsupported OData version " + this.result.$Version);
		}
	};

	/**
	 * Processes an Action or Function element.
	 *
	 * @param {Element} oElement The element
	 */
	V4MetadataConverter.prototype.processActionOrFunction = function (oElement) {
		var sKind = oElement.localName,
			sQualifiedName = this.namespace + oElement.getAttribute("Name"),
			oAction = {
				$kind : sKind
			};

		 this.processAttributes(oElement, oAction, {
			"IsBound" : this.setIfTrue,
			"EntitySetPath" : this.setValue,
			"IsComposable" : this.setIfTrue
		});

		this.getOrCreateArray(this.result, sQualifiedName).push(oAction);
		this.oOperation = oAction;
		this.annotatable(oAction);
	};

	/**
	 * Processes a ComplexType element.
	 *
	 * @param {Element} oElement The element
	 */
	V4MetadataConverter.prototype.processComplexType = function (oElement) {
		this.processType(oElement, {"$kind" : "ComplexType"});
	};

	/**
	 * Processes the Edmx element.
	 *
	 * @param {Element} oElement The element
	 */
	V4MetadataConverter.prototype.processEdmx = function (oElement) {
		this.processAttributes(oElement, this.result, {
			"Version" : this.setValue
		});
	};

	/**
	 * Applys the processor on the element.
	 *
	 * @param {Element} oElement The element
	 * @param {function} [fnProcessor] The processor
	 *
	 * @override
	 */
	V4MetadataConverter.prototype.processElement = function (oElement, fnProcessor) {
		if (fnProcessor) {
			fnProcessor.call(this, oElement);
		}
	};

	/**
	 * Processes an EntityContainer element.
	 *
	 * @param {Element} oElement The element
	 */
	V4MetadataConverter.prototype.processEntityContainer = function (oElement) {
		var sQualifiedName = this.namespace + oElement.getAttribute("Name");

		this.result[sQualifiedName] = this.entityContainer = {
			"$kind" : "EntityContainer"
		};
		this.result.$EntityContainer = sQualifiedName;
		this.annotatable(sQualifiedName);
	};

	/**
	 * Processes an EntitySet element at the EntityContainer.
	 *
	 * @param {Element} oElement The element
	 */
	V4MetadataConverter.prototype.processEntitySet = function (oElement) {
		var sName = oElement.getAttribute("Name");

		this.entityContainer[sName] = this.entitySet = {
			$kind : "EntitySet",
			$Type :
				this.resolveAlias(oElement.getAttribute("EntityType"))
		};
		 this.processAttributes(oElement, this.entitySet, {
			"IncludeInServiceDocument" : this.setIfFalse
		});
		this.annotatable(sName);
	};

	/**
	 * Processes an EntityType element.
	 *
	 * @param {Element} oElement The element
	 */
	V4MetadataConverter.prototype.processEntityType = function (oElement) {
		this.processType(oElement, {
			$kind : "EntityType"
		});
	};

	/**
	 * Processes a PropertyRef element of the EntityType's Key.
	 *
	 * @param {Element} oElement The element
	 */
	V4MetadataConverter.prototype.processEntityTypeKeyPropertyRef = function (oElement) {
		var sAlias = oElement.getAttribute("Alias"),
			vKey,
			sName = oElement.getAttribute("Name");

		if (sAlias) {
			vKey = {};
			vKey[sAlias] = sName;
		} else {
			vKey = sName;
		}
		this.getOrCreateArray(this.type, "$Key").push(vKey);
	};

	/**
	 * Processes an EnumType element.
	 *
	 * @param {Element} oElement The element
	 */
	V4MetadataConverter.prototype.processEnumType = function (oElement) {
		var sQualifiedName = this.namespace + oElement.getAttribute("Name"),
			oEnumType = {
				"$kind" : "EnumType"
			};

		 this.processAttributes(oElement, oEnumType, {
			"IsFlags" : this.setIfTrue,
			"UnderlyingType" : function (sValue) {
				return sValue !== "Edm.Int32" ? sValue : undefined;
			}
		});

		this.result[sQualifiedName] = this.enumType = oEnumType;
		this.enumTypeMemberCounter = 0;
		this.annotatable(sQualifiedName);
	};

	/**
	 * Processes a Member element within an EnumType.
	 *
	 * @param {Element} oElement The element
	 */
	V4MetadataConverter.prototype.processEnumTypeMember = function (oElement) {
		var sName = oElement.getAttribute("Name"),
			sValue = oElement.getAttribute("Value"),
			vValue;

		if (sValue) {
			vValue = parseInt(sValue, 10);
			if (!_Helper.isSafeInteger(vValue)) {
				vValue = sValue;
			}
		} else {
			vValue = this.enumTypeMemberCounter;
			this.enumTypeMemberCounter++;
		}
		this.enumType[sName] = vValue;
		this.annotatable(sName);
	};

	/**
	 * Processes the TFacetAttributes and TPropertyFacetAttributes of the elements Property,
	 * TypeDefinition etc.
	 *
	 * @param {Element} oElement The element
	 * @param {object} oResult The result object to fill
	 */
	V4MetadataConverter.prototype.processFacetAttributes = function (oElement, oResult) {
		var that = this;

		this.processAttributes(oElement, oResult, {
			"MaxLength" : function (sValue) {
				return sValue === "max" ? undefined : that.setNumber(sValue);
			},
			"Precision" : this.setNumber,
			"Scale" : function (sValue) {
				return sValue === "variable" ? sValue : that.setNumber(sValue);
			},
			"SRID" : this.setValue,
			"Unicode" : this.setIfFalse
		});
	};

	/**
	 * Processes an ActionImport or FunctionImport element.
	 *
	 * @param {Element} oElement The element
	 */
	V4MetadataConverter.prototype.processImport = function (oElement) {
		var sKind = oElement.localName,
			oImport = {
				$kind : sKind
			},
			sName = oElement.getAttribute("Name"),
			that = this;

		sKind = sKind.replace("Import", "");
		oImport["$" + sKind]
			= this.resolveAlias(oElement.getAttribute(sKind));
		this.processAttributes(oElement, oImport, {
			"EntitySet" : function (sValue) {
				return that.resolveTargetPath(sValue);
			},
			"IncludeInServiceDocument" : this.setIfTrue
		});

		this.entityContainer[sName] = oImport;
		this.annotatable(sName);
	};

	/**
	 * Processes a NavigationPropertyBinding element within an EntitySet or Singleton.
	 *
	 * @param {Element} oElement The element
	 */
	V4MetadataConverter.prototype.processNavigationPropertyBinding = function (oElement) {
		var oNavigationPropertyBinding = this.getOrCreateObject(
				this.entitySet, "$NavigationPropertyBinding");

		oNavigationPropertyBinding[oElement.getAttribute("Path")]
			= this.resolveTargetPath(oElement.getAttribute("Target"));
	};

	/**
	 * Processes a Parameter element within an Action or Function.
	 *
	 * @param {Element} oElement The element
	 */
	V4MetadataConverter.prototype.processParameter = function (oElement) {
		var oActionOrFunction = this.oOperation,
			oParameter = {};

		this.processTypedCollection(oElement.getAttribute("Type"), oParameter);
		 this.processAttributes(oElement, oParameter, {
			"Name" : this.setValue,
			"Nullable" : this.setIfFalse
		});
		this.processFacetAttributes(oElement, oParameter);

		this.getOrCreateArray(oActionOrFunction, "$Parameter").push(oParameter);
		this.annotatable(oParameter);
	};

	/**
	 * Processes a ReturnType element within an Action or Function.
	 *
	 * @param {Element} oElement The element
	 */
	V4MetadataConverter.prototype.processReturnType = function (oElement) {
		var oActionOrFunction = this.oOperation,
			oReturnType = {};

		this.processTypedCollection(oElement.getAttribute("Type"), oReturnType);
		this.processAttributes(oElement, oReturnType, {
			"Nullable" : this.setIfFalse
		});
		this.processFacetAttributes(oElement, oReturnType);

		oActionOrFunction.$ReturnType = oReturnType;
		this.annotatable(oReturnType);
	};

	/**
	 * Processes a Schema element.
	 *
	 * @param {Element} oElement The element
	 */
	V4MetadataConverter.prototype.processSchema = function (oElement) {
		this.namespace = oElement.getAttribute("Namespace") + ".";
		this.result[this.namespace] = this.schema = {
			"$kind" : "Schema"
		};
		this.annotatable(this.schema);
	};

	/**
	 * Processes a Singleton element at the EntityContainer.
	 *
	 * @param {Element} oElement The element
	 */
	V4MetadataConverter.prototype.processSingleton = function (oElement) {
		var sName = oElement.getAttribute("Name");

		this.entityContainer[sName] = this.entitySet = {
			$kind : "Singleton",
			$Type : this.resolveAlias(oElement.getAttribute("Type"))
		};
		this.annotatable(sName);
	};

	/**
	 * Processes a Term element.
	 *
	 * @param {Element} oElement The element
	 */
	V4MetadataConverter.prototype.processTerm = function (oElement) {
		var sQualifiedName = this.namespace + oElement.getAttribute("Name"),
			oTerm = {
				$kind : "Term"
			},
			that = this;

		this.processTypedCollection(oElement.getAttribute("Type"), oTerm);
		this.processAttributes(oElement, oTerm, {
			"Nullable" : this.setIfFalse,
			"BaseTerm" : function (sValue) {
				return sValue ? that.resolveAlias(sValue) : undefined;
			}
		});
		this.processFacetAttributes(oElement, oTerm);

		this.result[sQualifiedName] = oTerm;
		this.annotatable(sQualifiedName);
	};

	/**
	 * Processes a ComplexType or EntityType element.
	 *
	 * @param {Element} oElement The element
	 * @param {object} oType The initial typed result object
	 */
	V4MetadataConverter.prototype.processType = function (oElement, oType) {
		var sQualifiedName = this.namespace + oElement.getAttribute("Name"),
			that = this;

		 this.processAttributes(oElement, oType, {
			"OpenType" : that.setIfTrue,
			"HasStream" : that.setIfTrue,
			"Abstract" : that.setIfTrue,
			"BaseType" : function (sType) {
				return sType ? that.resolveAlias(sType) : undefined;
			}
		});

		this.result[sQualifiedName] = this.type = oType;
		this.annotatable(sQualifiedName);
	};

	/**
	 * Processes the type in the form "Type" or "Collection(Type)" and sets the appropriate
	 * properties.
	 *
	 * @param {string} sType The type attribute from the Element
	 * @param {object} oProperty The property attribute in the JSON
	 */
	V4MetadataConverter.prototype.processTypedCollection = function (sType, oProperty) {
		var aMatches = this.rCollection.exec(sType);

		if (aMatches) {
			oProperty.$isCollection = true;
			sType = aMatches[1];
		}
		oProperty.$Type = this.resolveAlias(sType);
	};

	/**
	 * Processes a TypeDefinition element.
	 *
	 * @param {Element} oElement The element
	 */
	V4MetadataConverter.prototype.processTypeDefinition = function (oElement) {
		var sQualifiedName = this.namespace + oElement.getAttribute("Name"),
			oTypeDefinition = {
				"$kind" : "TypeDefinition",
				"$UnderlyingType" : oElement.getAttribute("UnderlyingType")
			};

		this.result[sQualifiedName] = oTypeDefinition;
		this.processFacetAttributes(oElement, oTypeDefinition);
		this.annotatable(sQualifiedName);
	};

	/**
	 * Processes a NavigationProperty element of a structured type.
	 *
	 * @param {Element} oElement The element
	 */
	V4MetadataConverter.prototype.processTypeNavigationProperty = function (oElement) {
		var sName = oElement.getAttribute("Name"),
			oProperty = {
				$kind : "NavigationProperty"
			};

		this.processTypedCollection(oElement.getAttribute("Type"), oProperty);
		 this.processAttributes(oElement, oProperty, {
			"Nullable" : this.setIfFalse,
			"Partner" : this.setValue,
			"ContainsTarget" : this.setIfTrue
		});

		this.type[sName] = this.navigationProperty = oProperty;
		this.annotatable(sName);
	};

	/**
	 * Processes a NavigationProperty OnDelete element.
	 *
	 * @param {Element} oElement The element
	 */
	V4MetadataConverter.prototype.processTypeNavigationPropertyOnDelete = function (oElement) {
		this.navigationProperty.$OnDelete = oElement.getAttribute("Action");
		this.annotatable(this.navigationProperty, "$OnDelete");
	};

	/**
	 * Processes a NavigationProperty OnDelete element.
	 *
	 * @param {Element} oElement The element
	 */
	V4MetadataConverter.prototype.processTypeNavigationPropertyReferentialConstraint
			= function (oElement) {
		var sProperty = oElement.getAttribute("Property"),
			oReferentialConstraint = this.getOrCreateObject(
				this.navigationProperty, "$ReferentialConstraint");

		oReferentialConstraint[sProperty] = oElement.getAttribute("ReferencedProperty");
		this.annotatable(oReferentialConstraint, sProperty);
	};

	/**
	 * Processes a Property element of a structured type.
	 *
	 * @param {Element} oElement The element
	 */
	V4MetadataConverter.prototype.processTypeProperty = function (oElement) {
		var sName = oElement.getAttribute("Name"),
			oProperty = {
				"$kind" : "Property"
			};

		this.processTypedCollection(oElement.getAttribute("Type"), oProperty);
		this.processAttributes(oElement, oProperty, {
			"Nullable" : this.setIfFalse,
			"DefaultValue" : this.setValue
		});
		this.processFacetAttributes(oElement, oProperty);

		this.type[sName] = oProperty;
		this.annotatable(sName);
	};

	/**
	 * Resolves a target path including resolve aliases.
	 *
	 * @param {string} sPath The target path
	 * @returns {string} The target path with the alias resolved (if there was one)
	 */
	V4MetadataConverter.prototype.resolveTargetPath = function (sPath) {
		var iSlash;

		if (!sPath) {
			return sPath;
		}

		sPath = this.resolveAliasInPath(sPath);
		iSlash = sPath.indexOf("/");

		if (iSlash >= 0 && sPath.indexOf("/", iSlash + 1) < 0) { // there is exactly one slash
			if (sPath.slice(0, iSlash) === this.result.$EntityContainer) {
				return sPath.slice(iSlash + 1);
			}
		}
		return sPath;
	};

	/**
	 * Build the configurations for traverse
	 *
	 * @param {object} $$ The prototype for V4MetadataConverter
	 */
	(function ($$) {
		var oActionOrFunctionConfig,
			oEntitySetConfig,
			oStructuredTypeConfig;

		$$.sRootNamespace = $$.sEdmxNamespace;

		$$.oAliasConfig = {
			__xmlns : $$.sEdmxNamespace,
			"Reference" : {
				"Include" : {__processor : $$.processAlias}
			},
			"DataServices" : {
				"Schema" : {
					__xmlns :  $$.sEdmNamespace,
					__processor : $$.processAlias
				}
			}
		};

		oStructuredTypeConfig = {
			"Property" : {
				__processor : $$.processTypeProperty,
				__include : [$$.oAnnotationConfig]
			},
			"NavigationProperty" : {
				__processor : $$.processTypeNavigationProperty,
				__include : [$$.oAnnotationConfig],
				"OnDelete" : {
					__processor : $$.processTypeNavigationPropertyOnDelete,
					__include : [$$.oAnnotationConfig]
				},
				"ReferentialConstraint" : {
					__processor : $$.processTypeNavigationPropertyReferentialConstraint,
					__include : [$$.oAnnotationConfig]
				}
			}
		};

		oEntitySetConfig = {
			"NavigationPropertyBinding" : {
				__processor : $$.processNavigationPropertyBinding
			}
		};

		oActionOrFunctionConfig = {
			"Parameter" : {
				__processor : $$.processParameter,
				__include : [$$.oAnnotationConfig]
			},
			"ReturnType" : {
				__processor : $$.processReturnType,
				__include : [$$.oAnnotationConfig]
			}
		};

		$$.oFullConfig = {
			__xmlns : $$.sEdmxNamespace,
			__processor : $$.processEdmx,
			__include : [$$.oReferenceInclude],
			"DataServices" : {
				"Schema" : {
					__xmlns :  $$.sEdmNamespace,
					__processor : $$.processSchema,
					__include : [$$.oAnnotationsConfig, $$.oAnnotationConfig],
					"Action" : {
						__processor : $$.processActionOrFunction,
						__include : [oActionOrFunctionConfig, $$.oAnnotationConfig]
					},
					"Function" : {
						__processor : $$.processActionOrFunction,
						__include : [oActionOrFunctionConfig, $$.oAnnotationConfig]
					},
					"EntityType" : {
						__processor : $$.processEntityType,
						__include : [oStructuredTypeConfig, $$.oAnnotationConfig],
						"Key" : {
							"PropertyRef" : {
								__processor : $$.processEntityTypeKeyPropertyRef
							}
						}
					},
					"ComplexType" : {
						__processor : $$.processComplexType,
						__include : [oStructuredTypeConfig, $$.oAnnotationConfig]
					},
					"EntityContainer" : {
						__processor : $$.processEntityContainer,
						__include : [$$.oAnnotationConfig],
						"ActionImport" : {
							__processor : $$.processImport,
							__include : [$$.oAnnotationConfig]
						},
						"EntitySet" : {
							__processor : $$.processEntitySet,
							__include : [oEntitySetConfig, $$.oAnnotationConfig]
						},
						"FunctionImport" : {
							__processor : $$.processImport,
							__include : [$$.oAnnotationConfig]
						},
						"Singleton" : {
							__processor : $$.processSingleton,
							__include : [oEntitySetConfig, $$.oAnnotationConfig]
						}
					},
					"EnumType" : {
						__processor : $$.processEnumType,
						__include : [$$.oAnnotationConfig],
						"Member" : {
							__processor : $$.processEnumTypeMember,
							__include : [$$.oAnnotationConfig]
						}
					},
					"Term" : {
						__processor : $$.processTerm,
						__include : [$$.oAnnotationConfig]
					},
					"TypeDefinition" : {
						__processor : $$.processTypeDefinition,
						__include : [$$.oAnnotationConfig]
					}
				}
			}
		};

	})(V4MetadataConverter.prototype);

	return V4MetadataConverter;
}, /* bExport= */false);
