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
			typeName : V2MetadataConverter.resolveAlias(oElement.getAttribute("Type"), oAggregate),
			multiplicity : oElement.getAttribute("Multiplicity")
		};
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
		var sDisplayFormat,
			aMatches = V2MetadataConverter.rCollection.exec(sType);

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
				sDisplayFormat = oElement.getAttributeNS(sSapNamespace, "display-format");
				sType = sDisplayFormat === "Date" ? "Edm.Date" : "Edm.DateTimeOffset";
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
			property : oProperty,
			associationName :
				V2MetadataConverter.resolveAlias(oElement.getAttribute("Relationship"), oAggregate),
			fromRoleName : oElement.getAttribute("FromRole"),
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

		processTypedCollection(oElement.getAttribute("Type"), oProperty, oAggregate, oElement);
		V2MetadataConverter.processFacetAttributes(oElement, oProperty);

		oAggregate.type[sName] = oProperty;
		V2MetadataConverter.annotatable(oAggregate, sName);
	}

	/**
	 * Iterates over the aggregated navigation properties list and updates the corresponding
	 * navigation properties from the associations.
	 *
	 * @param {object} oAggregate The aggregate
	 */
	function updateNavigationProperties(oAggregate) {
		oAggregate.navigationProperties.forEach(function (oNavigationPropertyData) {
			var oAssociation = oAggregate.associations[oNavigationPropertyData.associationName],
				oConstraint = oAssociation.referentialConstraint,
				oNavigationProperty = oNavigationPropertyData.property,
				oToRole = oAssociation.roles[oNavigationPropertyData.toRoleName];

			oNavigationProperty.$Type = oToRole.typeName;
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
				"association" : null, // the current association
				"associations" : {}, // maps qualified name -> association
				"associationSets" : [], // list of associationSets
				"constraintRole" : null, // the current Principal/Dependent
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
			updateNavigationProperties(oAggregate);

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
