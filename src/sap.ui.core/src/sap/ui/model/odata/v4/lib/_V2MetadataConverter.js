/*!
 * ${copyright}
 */

sap.ui.define([
	"jquery.sap.global",
	"./_Helper",
	"./_MetadataConverter"
], function (jQuery, _Helper, _MetadataConverter) {
	"use strict";

	var V2MetadataConverter,
		sMicrosoftNamespace = "http://schemas.microsoft.com/ado/2007/08/dataservices/metadata",
		sSapNamespace = "http://www.sap.com/Protocols/SAPData",
		// the configurations for traverse
		oAliasConfig = {
			"DataServices" : {
				"Schema" : {
					__processor : _MetadataConverter.processAlias
				}
			}
		},
		oStructuredTypeConfig = {
			"NavigationProperty" : {
				__processor : processTypeNavigationProperty
			},
			"Property" : {
				__processor : processTypeProperty
			}
		},
		oFullConfig = {
			"DataServices" : {
				"Schema" : {
					__processor : _MetadataConverter.processSchema,
					"Association" : {
						__processor : processAssociation,
						"End" : {
							__processor : processAssociationEnd
						},
						"ReferentialConstraint" : {
							__processor : processReferentialConstraint,
							"Dependent" : {
								__processor : processDependent,
								"PropertyRef" : {
									__processor : processReferentialConstraintPropertyRef
								}
							},
							"Principal" : {
								__processor : processPrincipal,
								"PropertyRef" : {
									__processor : processReferentialConstraintPropertyRef
								}
							}
						}
					},
					"ComplexType" : {
						__processor : processComplexType,
						__include : [oStructuredTypeConfig]
					},
					"EntityContainer" : {
						__processor : processEntityContainer,
						"AssociationSet" : {
							__processor : processAssociationSet,
							"End" : {
								__processor : processAssociationSetEnd
							}
						},
						"EntitySet" : {
							__processor : processEntitySet
						}
					},
					"EntityType" : {
						__processor : processEntityType,
						__include : [oStructuredTypeConfig],
						"Key" : {
							"PropertyRef" : {
								__processor : processEntityTypeKeyPropertyRef
							}
						}
					}
				}
			}
		};

	/**
	 * Processes an Association element.
	 * @param {Element} oElement The element
	 * @param {object} oAggregate The aggregate
	 */
	function processAssociation(oElement, oAggregate) {
		var sName = oAggregate.namespace + oElement.getAttribute("Name");

		oAggregate.associations[sName] = oAggregate.association = {
			referentialConstraint : null,
			roles : {} // maps role name -> AssocationEnd
		};
	}

	/**
	 * Processes an End element below an Association element.
	 * @param {Element} oElement The element
	 * @param {object} oAggregate The aggregate
	 */
	function processAssociationEnd(oElement, oAggregate) {
		var sName = oElement.getAttribute("Role");

		oAggregate.association.roles[sName] = {
			multiplicity : oElement.getAttribute("Multiplicity"),
			propertyName : undefined, // will poss. be set in updateNavigationProperties...
			typeName : V2MetadataConverter.resolveAlias(oElement.getAttribute("Type"), oAggregate)
		};
	}

	/**
	 * Processes an AssociationSet element.
	 * @param {Element} oElement The element
	 * @param {object} oAggregate The aggregate
	 */
	function processAssociationSet(oElement, oAggregate) {
		var oAssociationSet = {
				associationName : V2MetadataConverter.resolveAlias(
					oElement.getAttribute("Association"), oAggregate),
				ends : []
			};

		oAggregate.associationSet = oAssociationSet;
		oAggregate.associationSets.push(oAssociationSet);
	}

	/**
	 * Processes an End element below an Association or AssociationSet element.
	 * @param {Element} oElement The element
	 * @param {object} oAggregate The aggregate
	 */
	function processAssociationSetEnd(oElement, oAggregate) {
		oAggregate.associationSet.ends.push({
			entitySetName : oElement.getAttribute("EntitySet"),
			roleName : oElement.getAttribute("Role")
		});
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
	 * Processes a Dependent element below a ReferentialConstraint element.
	 * @param {Element} oElement The element
	 * @param {object} oAggregate The aggregate
	 */
	function processDependent(oElement, oAggregate) {
		var oConstraint = oAggregate.association.referentialConstraint;

		oAggregate.constraintRole = oConstraint.dependent = {
			roleName : oElement.getAttribute("Role")
		};
	}

	/**
	 * Processes an EntityContainer.
	 * @param {Element} oElement The element
	 * @param {object} oAggregate The aggregate
	 */
	function processEntityContainer(oElement, oAggregate) {
		var sQualifiedName = oAggregate.namespace + oElement.getAttribute("Name");

		oAggregate.result[sQualifiedName] = oAggregate.entityContainer = {
			"$kind" : "EntityContainer"
		};
		if (oElement.getAttributeNS(sMicrosoftNamespace, "IsDefaultEntityContainer") === "true") {
			oAggregate.defaultEntityContainer = sQualifiedName;
		}
		V2MetadataConverter.annotatable(oAggregate, sQualifiedName);
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
				V2MetadataConverter.resolveAlias(oElement.getAttribute("EntityType"), oAggregate)
		};
		V2MetadataConverter.annotatable(oAggregate, sName);
	}

	/**
	 * Processes an EntityType element.
	 * @param {Element} oElement The element
	 * @param {object} oAggregate The aggregate
	 */
	function processEntityType(oElement, oAggregate) {
		var oType = {
			$kind : "EntityType"
		};

		processType(oElement, oAggregate, oType);
		V2MetadataConverter.processAttributes(oElement, oType, {
			"Abstract" : V2MetadataConverter.setIfTrue,
			"BaseType" : function (sType) {
				return sType ? V2MetadataConverter.resolveAlias(sType, oAggregate) : undefined;
			}
		});
	}

	/**
	 * Processes a PropertyRef element of the EntityType's Key.
	 * @param {Element} oElement The element
	 * @param {object} oAggregate The aggregate
	 */
	function processEntityTypeKeyPropertyRef(oElement, oAggregate) {
		var sName = oElement.getAttribute("Name");

		V2MetadataConverter.getOrCreateArray(oAggregate.type, "$Key").push(sName);
	}

	/**
	 * Processes a Principal element below a ReferentialConstraint element.
	 * @param {Element} oElement The element
	 * @param {object} oAggregate The aggregate
	 */
	function processPrincipal(oElement, oAggregate) {
		var oConstraint = oAggregate.association.referentialConstraint;

		oAggregate.constraintRole = oConstraint.principal = {
			roleName : oElement.getAttribute("Role")
		};
	}

	/**
	 * Processes an End element below an Association element.
	 * @param {Element} oElement The element
	 * @param {object} oAggregate The aggregate
	 */
	function processReferentialConstraint(oElement, oAggregate) {
		oAggregate.association.referentialConstraint = {};
	}

	/**
	 * Processes an End element below an Association element.
	 * @param {Element} oElement The element
	 * @param {object} oAggregate The aggregate
	 */
	function processReferentialConstraintPropertyRef(oElement, oAggregate) {
		oAggregate.constraintRole.propertyRef = oElement.getAttribute("Name");
	}

	/**
	 * Processes a ComplexType or EntityType element.
	 * @param {Element} oElement The element
	 * @param {object} oAggregate The aggregate
	 * @param {object} oType The initial typed result object
	 */
	function processType(oElement, oAggregate, oType) {
		var sQualifiedName = oAggregate.namespace + oElement.getAttribute("Name");

		oAggregate.result[sQualifiedName] = oAggregate.type = oType;
		V2MetadataConverter.annotatable(oAggregate, sQualifiedName);
	}

	/**
	 * Processes the type in the form "Type" or "Collection(Type)" and sets the appropriate
	 * properties.
	 * @param {string} sType The type attribute from the Element
	 * @param {object} oProperty The property attribute in the JSON
	 * @param {object} oAggregate The aggregate
	 * @param {Element} oElement The element using the type
	 */
	function processTypedCollection(sType, oProperty, oAggregate, oElement) {
		var aMatches = V2MetadataConverter.rCollection.exec(sType);

		if (aMatches) {
			oProperty.$isCollection = true;
			sType = aMatches[1];
		}
		// according to the XSD simple types do not (necessarily) have the namespace "Edm."
		if (sType.indexOf(".") < 0) {
			sType = "Edm." + sType;
		}
		switch (sType) {
			case "Edm.DateTime":
				if (oElement.getAttributeNS(sSapNamespace, "display-format") === "Date") {
					sType = "Edm.Date";
					delete oProperty.$Precision;
				} else {
					sType = "Edm.DateTimeOffset";
				}
				break;
			case "Edm.Float":
				sType = "Edm.Single";
				break;
			case "Edm.Time":
				sType = "Edm.TimeOfDay";
				break;
			default:
				sType = V2MetadataConverter.resolveAlias(sType, oAggregate);
		}
		oProperty.$Type = sType;
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

		oAggregate.type[sName] = oProperty;
		oAggregate.navigationProperties.push({
			associationName :
				V2MetadataConverter.resolveAlias(oElement.getAttribute("Relationship"), oAggregate),
			fromRoleName : oElement.getAttribute("FromRole"),
			property : oProperty,
			propertyName : sName,
			toRoleName : oElement.getAttribute("ToRole")
		});
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

		V2MetadataConverter.processFacetAttributes(oElement, oProperty);
		processTypedCollection(oElement.getAttribute("Type"), oProperty, oAggregate, oElement);

		oAggregate.type[sName] = oProperty;
		V2MetadataConverter.annotatable(oAggregate, sName);
	}

	/**
	 * Sets $EntityContainer to the default entity container (or the only one).
	 * @param {object} oAggregate The aggregate
	 */
	function setDefaultEntityContainer(oAggregate) {
		var sDefaultEntityContainer = oAggregate.defaultEntityContainer,
			aEntityContainers;

		if (sDefaultEntityContainer) {
			oAggregate.result.$EntityContainer = sDefaultEntityContainer;
		} else {
			aEntityContainers = Object.keys(oAggregate.result).filter(function (sQualifiedName) {
				return oAggregate.result[sQualifiedName].$kind === "EntityContainer";
			});
			if (aEntityContainers.length === 1) {
				oAggregate.result.$EntityContainer = aEntityContainers[0];
			}
		}
	}

	/**
	 * Updates navigation properties and creates navigation property bindings. Iterates over the
	 * aggregated navigation properties list and updates the corresponding navigation properties
	 * from the associations. Iterates over the aggregated association set and tries to create
	 * navigation property bindings for both directions.
	 *
	 * @param {object} oAggregate The aggregate
	 */
	function updateNavigationPropertiesAndCreateBindings(oAggregate) {

		oAggregate.navigationProperties.forEach(function (oNavigationPropertyData) {
			var oAssociation = oAggregate.associations[oNavigationPropertyData.associationName],
				oConstraint = oAssociation.referentialConstraint,
				oNavigationProperty = oNavigationPropertyData.property,
				oToRole = oAssociation.roles[oNavigationPropertyData.toRoleName];

			oNavigationProperty.$Type = oToRole.typeName;
			oToRole.propertyName = oNavigationPropertyData.propertyName;
			if (oToRole.multiplicity === "1") {
				oNavigationProperty.$Nullable = false;
			}
			if (oToRole.multiplicity === "*") {
				oNavigationProperty.$isCollection = true;
			}
			if (oConstraint
					&& oConstraint.principal.roleName === oNavigationPropertyData.toRoleName) {
				oNavigationProperty.$ReferentialConstraint = {};
				oNavigationProperty.$ReferentialConstraint[oConstraint.dependent.propertyRef]
					= oConstraint.principal.propertyRef;
			}
		});

		oAggregate.associationSets.forEach(function (oAssociationSet) {
			var oAssociation = oAggregate.associations[oAssociationSet.associationName],
				oEntityContainer = oAggregate.entityContainer;

			/*
			 * Creates a navigation property binding for the navigation property of the "from" set's
			 * type that has the "to" type as target, using the sets pointing to these types.
			 */
			function createNavigationPropertyBinding(oAssociationSetFrom, oAssociationSetTo) {
				var oEntitySet = oEntityContainer[oAssociationSetFrom.entitySetName],
					oToRole = oAssociation.roles[oAssociationSetTo.roleName];

				if (oToRole.propertyName) {
					oEntitySet.$NavigationPropertyBinding
						= oEntitySet.$NavigationPropertyBinding || {};
					oEntitySet.$NavigationPropertyBinding[oToRole.propertyName]
						= oAssociationSetTo.entitySetName;
				}
			}

			// Try to create navigation property bindings for the two directions
			createNavigationPropertyBinding(oAssociationSet.ends[0], oAssociationSet.ends[1]);
			createNavigationPropertyBinding(oAssociationSet.ends[1], oAssociationSet.ends[0]);
		});
	}

	V2MetadataConverter = jQuery.extend({}, _MetadataConverter, {
		/**
		 * Converts the metadata from XML format to a JSON object.
		 *
		 * @param {Document} oDocument
		 *   The XML DOM document
		 * @returns {object}
		 *   The metadata JSON
		 */
		convertXMLMetadata : function (oDocument) {
			var oAggregate, oElement;

			jQuery.sap.measure.average("convertXMLMetadata", "",
				"sap.ui.model.odata.v4.lib._V2MetadataConverter");
			oAggregate = {
				"aliases" : {}, // maps alias -> namespace
				"annotatable" : null, // the current annotatable, see function annotatable
				"association" : null, // the current association
				"associations" : {}, // maps qualified name -> association
				"associationSet" : null, // the current associationSet
				"associationSets" : [], // list of associationSets
				"constraintRole" : null, // the current Principal/Dependent
				"defaultEntityContainer" : null, // the name of the default EntityContainer
				"entityContainer" : null, // the current EntityContainer
				"entitySet" : null, // the current EntitySet
				"namespace" : null, // the namespace of the current Schema
				"navigationProperties" : [], // a list of navigation property data
				"schema" : null, // the current Schema
				"type" : null, // the current EntityType/ComplexType
				"result" : {
					"$Version" : "4.0" // The result of the conversion is a V4 streamlined JSON
				}
			};
			oElement = oDocument.documentElement;

			// pass 1: find aliases
			V2MetadataConverter.traverse(oElement, oAggregate, oAliasConfig);
			// pass 2: full conversion
			V2MetadataConverter.traverse(oElement, oAggregate, oFullConfig);
			// pass 3
			setDefaultEntityContainer(oAggregate);
			updateNavigationPropertiesAndCreateBindings(oAggregate);

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
			V2MetadataConverter.processAttributes(oElement, oResult, {
				"DefaultValue" : V2MetadataConverter.setValue,
				"MaxLength" : V2MetadataConverter.setNumber,
				"Nullable" : V2MetadataConverter.setIfFalse,
				"Precision" : V2MetadataConverter.setNumber,
				"Scale" :  V2MetadataConverter.setNumber,
				"Unicode" : V2MetadataConverter.setIfFalse
			});
			if (oElement.getAttribute("FixedLength") === "false") {
				oResult.$Scale = "variable";
			}
		}
	});

	return V2MetadataConverter;
}, /* bExport= */false);
