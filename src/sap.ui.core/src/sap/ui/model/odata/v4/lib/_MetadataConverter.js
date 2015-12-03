/*!
 * ${copyright}
 */

//Provides class sap.ui.model.odata.v4.lib._MetadataConverter
sap.ui.define([], function () {
	"use strict";

	var MetadataConverter,
		oAliasConfig = {
			"Reference" : {
				"Include" : {__processor : processAlias}
			},
			"DataServices" : {
				"Schema" : {__processor : processAlias}
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
					"EntityType" : {
						__processor : processEntityType,
						"Key" : {
							"PropertyRef" : {
								__processor : processEntityTypeKeyPropertyRef
							}
						},
						"Property" : {
							__processor : processTypeProperty
						},
						"NavigationProperty" : {
							__processor : processTypeNavigationProperty
						}
					},
					"ComplexType" : {
						__processor : processComplexType,
						"Property" : {
							__processor : processTypeProperty
						},
						"NavigationProperty" : {
							__processor : processTypeNavigationProperty
						}
					},
					"EntityContainer" : {
						__processor : processEntityContainer,
						"EntitySet" : {
							__processor : processEntitySet,
							"NavigationPropertyBinding" : {
								__processor : processNavigationPropertyBinding
							}
						},
						"Singleton" : {
							__processor : processSingleton,
							"NavigationPropertyBinding" : {
								__processor : processNavigationPropertyBinding
							}
						}
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
		oAggregate.result.$Schema[sQualifiedName] = oAggregate.entityContainer = {
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
		processType(oElement, oAggregate, {$Key : []});
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
	 * Processes an Include element within a Reference.
	 * @param {Element} oElement the element
	 * @param {object} oAggregate the aggregate
	 */
	function processInclude(oElement, oAggregate) {
		oAggregate.result.$Schema[oElement.getAttribute("Namespace")] = {
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
		var oAttributes = getAttributes(oElement);

		oAggregate.entitySet[oAttributes.Path]
			= MetadataConverter.resolveAlias(oAttributes.Target, oAggregate);
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
	 * Processes a ComplexType or EntityType element.
	 * @param {Element} oElement the element
	 * @param {object} oAggregate the aggregate
	 * @param {object} oType the initial typed result object
	 */
	function processType(oElement, oAggregate, oType) {
		var oAttributes = getAttributes(oElement),
			sQualifiedName = oAggregate.namespace + "." + oAttributes.Name;

		if (oAttributes.OpenType === "true") {
			oType.$OpenType = true;
		}
		if (oAttributes.HasStream === "true") {
			oType.$HasStream = true;
		}
		if (oAttributes.Abstract === "true") {
			oType.$Abstract = true;
		}
		if (oAttributes.BaseType) {
			oType.$BaseType = oAttributes.BaseType;
		}

		oAggregate.result.$Schema[sQualifiedName] = oAggregate.type = oType;
	}

	/**
	 * Processes a NavigationProperty element of a structured type.
	 * @param {Element} oElement the element
	 * @param {object} oAggregate the aggregate
	 */
	function processTypeNavigationProperty(oElement, oAggregate) {
		var oAttributes = getAttributes(oElement),
			oProperty = {
				$kind : "navigation",
				$Type : MetadataConverter.resolveAlias(oAttributes.Type, oAggregate)
			};

		if (oAttributes.Nullable === "false") {
			oProperty.$Nullable = false;
		}
		if (oAttributes.Partner) {
			oProperty.$Partner = oAttributes.Partner;
		}
		if (oAttributes.ContainsTarget === "true") {
			oProperty.$ContainsTarget = true;
		}

		oAggregate.type[oAttributes.Name] = oProperty;
	}

	/**
	 * Processes a Property element of a structured type.
	 * @param {Element} oElement the element
	 * @param {object} oAggregate the aggregate
	 */
	function processTypeProperty(oElement, oAggregate) {
		var oAttributes = getAttributes(oElement),
		oProperty = {
			$Type : MetadataConverter.resolveAlias(oAttributes.Type, oAggregate)
		};

		if (oAttributes.Nullable === "false") {
			oProperty.$Nullable = false;
		}
		if (oAttributes.MaxLength) {
			oProperty.$MaxLength = parseInt(oAttributes.MaxLength, 10);
		}
		if (oAttributes.Precision) {
			oProperty.$Precision = parseInt(oAttributes.Precision, 10);
		}
		if (oAttributes.Scale) {
			if (oAttributes.Scale === "variable") {
				oProperty.$Scale = oAttributes.Scale;
			} else {
				oProperty.$Scale = parseInt(oAttributes.Scale, 10);
			}
		}
		if (oAttributes.Unicode === "false") {
			oProperty.$Unicode = false;
		}
		if (oAttributes.SRID) {
			oProperty.$SRID = oAttributes.SRID;
		}
		if (oAttributes.DefaultValue) {
			oProperty.$DefaultValue = oAttributes.DefaultValue;
		}
		oAggregate.type[oAttributes.Name] = oProperty;
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
					aliases : {}, // maps alias -> namespace
					entityContainer : null, // the current EntityContainer
					entitySet : null, // the current EntitySet/Singleton
					namespace : null, // the namespace of the current Schema
					referenceUri : null, // the URI of the current Reference
					type : null, // the current EntityType/ComplexType
					result : {
						$Schema : {}
					}
				},
				oElement = oDocument.documentElement;

			// first round: find aliases
			MetadataConverter.traverse(oElement, oAggregate, oAliasConfig);
			// second round, full conversion
			MetadataConverter.traverse(oElement, oAggregate, oFullConfig);
			return oAggregate.result;
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

			if (sName.indexOf(".", iDot + 1) < 0) { // if there is no second dot
				sNamespace = oAggregate.aliases[sName.slice(0, iDot)];
				if (sNamespace) {
					return sNamespace + "." + sName.slice(iDot + 1);
				}
			}
			return sName;
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
					if (oNodeInfo) {
						MetadataConverter.traverse(oChildNode, oAggregate, oNodeInfo);
					}
				}
			}
		}
	};

	return MetadataConverter;
}, /* bExport= */false);
