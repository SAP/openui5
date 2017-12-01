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
		sModuleName = "sap.ui.model.odata.v4.lib._V2MetadataConverter",

		// namespaces
		sEdmxNamespace = "http://schemas.microsoft.com/ado/2007/06/edmx",
		sMicrosoftNamespace = "http://schemas.microsoft.com/ado/2007/08/dataservices/metadata",
		sSapNamespace = "http://www.sap.com/Protocols/SAPData",

		// conversion tables
		mV2toV4 = {
			"creatable" : {
				"property" : "Insertable",
				"term" : "@Org.OData.Capabilities.V1.InsertRestrictions"
			},
			"deletable" : {
				"property" : "Deletable",
				"term" : "@Org.OData.Capabilities.V1.DeleteRestrictions"
			},
			"deletable-path" : {
				"property" : "Deletable",
				"term" : "@Org.OData.Capabilities.V1.DeleteRestrictions"
			},
			"field-control" : {
				"term" : "@com.sap.vocabularies.Common.v1.FieldControl"
			},
			"heading" : {
				"term" : "@com.sap.vocabularies.Common.v1.Heading"
			},
			"label" : {
				"term" : "@com.sap.vocabularies.Common.v1.Label"
			},
			"precision" : {
				"term" : "@Org.OData.Measures.V1.Scale"
			},
			"quickinfo" : {
				"term" : "@com.sap.vocabularies.Common.v1.QuickInfo"
			},
			"requires-filter" : {
				"property" : "RequiresFilter",
				"term" : "@Org.OData.Capabilities.V1.FilterRestrictions"
			},
			"searchable" : {
				"property" : "Searchable",
				"term" : "@Org.OData.Capabilities.V1.SearchRestrictions"
			},
			"text" : {
				"term" : "@com.sap.vocabularies.Common.v1.Text"
			},
			"topable" : {
				"term" : "@Org.OData.Capabilities.V1.TopSupported"
			},
			"updatable" : {
				"property" : "Updatable",
				"term" : "@Org.OData.Capabilities.V1.UpdateRestrictions"
			},
			"updatable-path" : {
				"property" : "Updatable",
				"term" : "@Org.OData.Capabilities.V1.UpdateRestrictions"
			}
		},
		mV2toV4ComplexSemantics = {
			"bday" : {
				TermName : "Contact"
			},
			"city" : {
				Path : "adr",
				TermName : "Contact",
				V4Attribute: "locality"
			},
			"country" : {
				Path : "adr",
				TermName : "Contact"
			},
			"email" : {
				Path : "address",
				TermName : "Contact",
				V4Attribute: "uri",
				typeMapping : {
					"home" : "home",
					"pref" : "preferred",
					"work" : "work"
				},
				v4EnumType : "com.sap.vocabularies.Communication.v1.ContactInformationType",
				v4PropertyAnnotation : "@com.sap.vocabularies.Communication.v1.IsEmailAddress"
			},
			"familyname" : {
				Path : "n",
				TermName : "Contact",
				V4Attribute: "surname"
			},
			"givenname" : {
				Path : "n",
				TermName : "Contact",
				V4Attribute: "given"
			},
			"honorific" : {
				Path : "n",
				TermName : "Contact",
				V4Attribute: "prefix"
			},
			"middlename" : {
				Path : "n",
				TermName : "Contact",
				V4Attribute: "additional"
			},
			"name" : {
				TermName : "Contact",
				V4Attribute: "fn"
			},
			"nickname" : {
				TermName : "Contact"
			},
			"note" : {
				TermName : "Contact"
			},
			"org" : {
				TermName : "Contact"
			},
			"org-role" : {
				TermName : "Contact",
				V4Attribute : "role"
			},
			"org-unit" : {
				TermName : "Contact",
				V4Attribute : "orgunit"
			},
			"photo" : {
				TermName : "Contact"
			},
			"pobox" : {
				Path : "adr",
				TermName : "Contact"
			},
			"region" : {
				Path : "adr",
				TermName : "Contact"
			},
			"street" : {
				Path : "adr",
				TermName : "Contact"
			},
			"suffix" : {
				Path : "n",
				TermName : "Contact"
			},
			"tel" : {
				Path : "tel",
				TermName : "Contact",
				V4Attribute: "uri",
				typeMapping : {
					"cell" : "cell",
					"fax" : "fax",
					"home" : "home",
					"pref" : "preferred",
					"video" : "video",
					"voice" : "voice",
					"work" : "work"
				},
				v4EnumType : "com.sap.vocabularies.Communication.v1.PhoneType",
				v4PropertyAnnotation : "@com.sap.vocabularies.Communication.v1.IsPhoneNumber"
			},
			"title" : {
				TermName : "Contact"
			},
			"zip" : {
				Path : "adr",
				TermName : "Contact",
				V4Attribute: "code"
			},
			// event annotations
			"class" : {
				TermName : "Event"
			},
			"dtend" : {
				TermName : "Event"
			},
			"dtstart" : {
				TermName : "Event"
			},
			"duration" : {
				TermName : "Event"
			},
			"fbtype" : {
				TermName : "Event"
			},
			"location" : {
				TermName : "Event"
			},
			"status" : {
				TermName : "Event"
			},
			"transp" : {
				TermName : "Event"
			},
			"wholeday" : {
				TermName : "Event"
			},
			// message annotations
			"body" : {
				TermName : "Message"
			},
			"from" : {
				TermName : "Message"
			},
			"received" : {
				TermName : "Message"
			},
			"sender" : {
				TermName : "Message"
			},
			"subject" : {
				TermName : "Message"
			},
			// task annotations
			"completed" : {
				TermName : "Task"
			},
			"due" : {
				TermName : "Task"
			},
			"percent-complete" : {
				TermName : "Task",
				V4Attribute: "percentcomplete"
			},
			"priority" : {
				TermName : "Task"
			}
		},
		mV2toV4SimpleSemantics = {
			// calendar annotations
			"fiscalyear" : "@com.sap.vocabularies.Common.v1.IsFiscalYear",
			"fiscalyearperiod" : "@com.sap.vocabularies.Common.v1.IsFiscalYearPeriod",
			"year" : "@com.sap.vocabularies.Common.v1.IsCalendarYear",
			"yearmonth" : "@com.sap.vocabularies.Common.v1.IsCalendarYearMonth",
			"yearmonthday" : "@com.sap.vocabularies.Common.v1.IsCalendarDate",
			"yearquarter" : "@com.sap.vocabularies.Common.v1.IsCalendarYearQuarter",
			"yearweek" : "@com.sap.vocabularies.Common.v1.IsCalendarYearWeek",
			// OData core annotations
			"url" : "@Org.OData.Core.V1.IsURL"
		},

		// the configurations for traverse
		oAliasConfig = {
			"Reference" : {
				__xmlns : _MetadataConverter.sEdmxNamespace,
				"Include" : {
					__processor : _MetadataConverter.processAlias
				}
			},
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
			__include : [_MetadataConverter.oReferenceInclude],
			"DataServices" : {
				__processor : processDataServices,
				"Schema" : {
					__postProcessor : postProcessSchema,
					__processor : processSchema,
					__include : [_MetadataConverter.oAnnotationsConfig],
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
						},
						"FunctionImport" : {
							__processor : processFunctionImport,
							"Parameter" : {
								__processor : processParameter
							}
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
	 * Creates an annotatable that is able to consume V2 annotations and set V4 annotations for the
	 * correct target. It ensures that the target for the annotations is only created when needed.
	 *
	 * @param {object} oAggregate The aggregate
	 * @param {string} sTarget
	 *   The target name to which the V4 annotations shall be added. The target path is constructed
	 *   from the path of the top annotatable of the stack in oAggregate (if there is one yet) and
	 *   the given name.
	 * @constructor
	 */
	function Annotatable(oAggregate, sTarget) {
		var oParent = oAggregate.annotatable;

		if (oParent) {
			sTarget = _Helper.buildPath(oParent.sPath, sTarget);
		}
		this.oAggregate = oAggregate;
		this.sPath = sTarget;
		this.oParent = oParent;
		this.mSapAttributes = oAggregate.mSapAttributes;
		this.mAnnotationsForTarget = null;
	}

	/**
	 * Adds a V4 annotation for the annotatable's target.
	 *
	 * @param {string} sTerm The term
	 * @param {any} vValue The value
	 */
	Annotatable.prototype.annotate = function (sTerm, vValue) {
		this.getTarget()[sTerm] = vValue;
	};

	/**
	 * Consumes the SAP annotation of the given name and returns its value. No warning will be
	 * logged for this name afterwards.
	 *
	 * @param {string} sName The name
	 * @returns {string} The value or <code>undefined</code>
	 */
	Annotatable.prototype.consume = function (sName) {
		return consumeSapAnnotation(this.oAggregate, sName);
	};

	/**
	 * Converts the given V2 annotation. The conversion table <code>mV2ToV4</code> defines the V4
	 * term to take the value given in <code>vValue</code>. The conversion table may also give a
	 * property; in this case the resulting term is an &lt;edm:Record> and this call adds a property
	 * to the record.
	 *
	 * Does nothing if <code>vValue</code> is <code>undefined</code> or <code>""</code>
	 *
	 * @param {string} sV2Name The name of the V2 annotation
	 * @param {any} vValue The new value
	 */
	Annotatable.prototype.convert = function (sV2Name, vValue) {
		var oAnnotation, mAnnotationInfo;

		if (vValue === undefined || vValue === "") {
			return;
		}
		mAnnotationInfo = mV2toV4[sV2Name];
		if (mAnnotationInfo.property) {
			oAnnotation = this.getOrCreateAnnotationRecord(mAnnotationInfo.term);
			oAnnotation[mAnnotationInfo.property] = vValue;
		} else {
			this.annotate(mAnnotationInfo.term, vValue);
		}
	};

	/**
	 * Returns the value of the SAP annotation for the given name.
	 *
	 * @param {string} sName The name
	 * @returns {string} The value or <code>undefined</code>
	 */
	Annotatable.prototype.peek = function (sName) {
		return this.oAggregate.mSapAnnotations[sName];
	};

	/**
	 * Gets the converted V2 annotation for the given term. Assumes an &lt;edm:Record> and ensures
	 * that there is one.
	 *
	 * @param {string} sTerm The term
	 * @returns {object} The V4 annotation value, an &lt;edm:Record>
	 */
	Annotatable.prototype.getOrCreateAnnotationRecord = function (sTerm) {
		return V2MetadataConverter.getOrCreateObject(this.getTarget(), sTerm);
	};

	/**
	 * Gets the target for the converted V2 annotations of this annotatable. Ensures that it exists.
	 *
	 * @returns {object} The target for the annotations
	 */
	Annotatable.prototype.getTarget = function () {
		if (!this.mAnnotationsForTarget) {
			this.mAnnotationsForTarget = this.oAggregate.convertedV2Annotations[this.sPath] = {};
		}
		return this.mAnnotationsForTarget;
	};

	/**
	 * Collects the element's SAP annotations in the aggregate.
	 *
	 * @param {Element} oElement The element
	 * @param {object} oAggregate The aggregate
	 */
	function collectSapAnnotations(oElement, oAggregate) {
		var oAttribute,
			oAttributeList = oElement.attributes,
			i, n;

		oAggregate.mSapAnnotations = {};
		for (i = 0, n = oAttributeList.length; i < n; i += 1) {
			oAttribute = oAttributeList.item(i);

			if (oAttribute.namespaceURI === sSapNamespace
					&& oAttribute.localName !== "content-version") {
				oAggregate.mSapAnnotations[oAttribute.localName] = oAttribute.value;
			}
		}
	}

	/**
	 * Returns the value of the SAP annotation for the given name and removes it from the map.
	 *
	 * @param {object} oAggregate The aggregate
	 * @param {string} sName The name
	 * @returns {string} The value or <code>undefined</code>
	 */
	function consumeSapAnnotation(oAggregate, sName) {
		var sValue = oAggregate.mSapAnnotations[sName];

		delete oAggregate.mSapAnnotations[sName];
		return sValue;
	}

	/**
	 * Converts the given V2 annotation of an EntitySet to corresponding V4 annotation.
	 *
	 * @param {Annotatable} oAnnotatable The annotatable
	 * @param {string} sName The name of the V2 annotation
	 */
	function convertEntitySetAnnotation(oAnnotatable, sName) {
		var sConflictingV2Annotation, sValue;

		switch (sName) {
			case "creatable":
			case "deletable":
			case "updatable":
				// do not consume it here, it might be needed for xxx-path
				if (oAnnotatable.peek(sName) === "false") {
					oAnnotatable.convert(sName, false);
				}
				break;
			case "deletable-path":
			case "updatable-path":
				sConflictingV2Annotation = sName.slice(0, 9);
				sValue = oAnnotatable.consume(sName);
				if (oAnnotatable.peek(sConflictingV2Annotation)) {
					oAnnotatable.convert(sName, false);
					jQuery.sap.log.warning(
						"Inconsistent metadata in '" + oAnnotatable.oAggregate.url + "'",
						"Use either 'sap:" + sConflictingV2Annotation + "' or 'sap:"
							+ sConflictingV2Annotation + "-path'"
							+ " at entity set '" + oAnnotatable.sPath + "'",
						sModuleName);
				} else {
					oAnnotatable.convert(sName, {
						$Path : sValue
					});
				}
				break;
			case "label":
				convertLabel(oAnnotatable);
				break;
			case "pageable":
				sValue = oAnnotatable.consume(sName);
				if (sValue === "false") {
					oAnnotatable.annotate("@Org.OData.Capabilities.V1.SkipSupported", false);
					oAnnotatable.annotate("@Org.OData.Capabilities.V1.TopSupported", false);
				}
				break;
			case "requires-filter":
				sValue = oAnnotatable.consume(sName);
				if (sValue === "true") {
					oAnnotatable.convert(sName, true);
				}
				break;
			case "topable":
				sValue = oAnnotatable.consume(sName);
				if (sValue === "false") {
					oAnnotatable.convert(sName, false);
				}
				break;
			default: //no conversion yet
		}
	}

	/**
	 * Converts the V2 annotation "label".
	 *
	 * @param {Annotatable} oAnnotatable The annotatable
	 */
	function convertLabel(oAnnotatable) {
		oAnnotatable.convert("label", oAnnotatable.consume("label"));
	}

	/**
	 * Converts the given V2 annotation of a Property to corresponding V4 annotation.
	 *
	 * @param {Annotatable} oAnnotatable The annotatable
	 * @param {string} sName The name of the V2 annotation
	 */
	function convertPropertyAnnotation(oAnnotatable, sName) {
		var sValue;

		switch (sName) {
			// simple cases
			case "heading":
			case "label":
			case "quickinfo":
				oAnnotatable.convert(sName, oAnnotatable.consume(sName));
				break;
			case "field-control":
			case "precision":
			case "text":
				oAnnotatable.convert(sName, {
					$Path : oAnnotatable.consume(sName)
				});
				break;
			// more complex cases
			case "aggregation-role":
				sValue = oAnnotatable.consume(sName);
				if (sValue === "dimension") {
					oAnnotatable.annotate("@com.sap.vocabularies.Analytics.v1.Dimension", true);
				} else if (sValue === "measure") {
					oAnnotatable.annotate("@com.sap.vocabularies.Analytics.v1.Measure", true);
				}
				break;
			case "display-format":
				sValue = oAnnotatable.consume(sName);
				if (sValue === "NonNegative") {
					oAnnotatable.annotate("@com.sap.vocabularies.Common.v1.IsDigitSequence",
						true);
				} else if (sValue === "UpperCase") {
					oAnnotatable.annotate("@com.sap.vocabularies.Common.v1.IsUpperCase", true);
				}
				break;
			case "semantics":
				convertPropertySemanticsAnnotation(oAnnotatable);
				break;
			case "unit":
				oAnnotatable.oAggregate.mProperty2Unit[oAnnotatable.sPath]
					= oAnnotatable.consume("unit");
				break;
			case "visible":
				sValue = oAnnotatable.consume(sName);
				if (sValue === "false") {
					oAnnotatable.annotate("@com.sap.vocabularies.UI.v1.Hidden", true);
					oAnnotatable.annotate("@com.sap.vocabularies.Common.v1.FieldControl", {
						$EnumMember :
							"com.sap.vocabularies.Common.v1.FieldControlType/Hidden"
					});
				}
				break;
			default:
			//no conversion supported
		}
	}

	/**
	 * Converts a sap:semantics V2 annotation of a property to the corresponding V4 annotation.
	 *
	 * @param {Annotatable} oAnnotatable The annotatable
	 */
	function convertPropertySemanticsAnnotation(oAnnotatable) {
		var oAnnotations,
			sEnum,
			oPath,
			aResult,
			oSemantics,
			aValue = oAnnotatable.peek("semantics").split(";"),
			sValue = aValue[0],
			oV2toV4ComplexSemantic = mV2toV4ComplexSemantics[sValue];

		if (sValue === "unit-of-measure" || sValue === "currency-code") {
			oAnnotatable.oAggregate.mProperty2Semantics[oAnnotatable.sPath] =
				oAnnotatable.consume("semantics");
		} else if (mV2toV4SimpleSemantics[sValue]) {
			oAnnotatable.annotate(mV2toV4SimpleSemantics[sValue], true);
			oAnnotatable.consume("semantics");
		} else if (oV2toV4ComplexSemantic) {
			oPath = {
				"$Path" : oAnnotatable.oAggregate.sPropertyName
			};
			oAnnotations = oAnnotatable.oParent.getOrCreateAnnotationRecord(
				"@com.sap.vocabularies.Communication.v1." + oV2toV4ComplexSemantic.TermName);
			if (oV2toV4ComplexSemantic.Path) {
				oSemantics = V2MetadataConverter.getOrCreateObject(oAnnotations,
					oV2toV4ComplexSemantic.Path);
				oSemantics[oV2toV4ComplexSemantic.V4Attribute || sValue] = oPath;

				if (oV2toV4ComplexSemantic.v4PropertyAnnotation) {
					oAnnotatable.annotate(oV2toV4ComplexSemantic.v4PropertyAnnotation, true);

					// Determination of space separated list of V4 annotations enumeration value for
					// given sap:semantics "tel" and "email"
					if (aValue[1]) {
						aResult = [];
						sEnum = aValue[1].split("=")[1];
						sEnum.split(",").forEach(function (sType) {
							var sTargetType = oV2toV4ComplexSemantic.typeMapping[sType];
							if (sTargetType) {
								aResult.push(oV2toV4ComplexSemantic.v4EnumType + "/" + sTargetType);
							} else {
								jQuery.sap.log.warning("Unsupported semantic type: " + sType,
									undefined, sModuleName);
							}
						});
						if (aResult.length > 0) {
							oSemantics.type = {"EnumMember" : aResult.join(" ")};
						}
					}
					oAnnotations[oV2toV4ComplexSemantic.Path] = [oSemantics];
				} else {
					oAnnotations[oV2toV4ComplexSemantic.Path] = oSemantics;
				}
			} else {
				oAnnotations[oV2toV4ComplexSemantic.V4Attribute || sValue] = oPath;
			}
			oAnnotatable.consume("semantics");
		}
	}

	/**
	 * Post-processing of an Schema element.
	 *
	 * @param {Element} oElement The element
	 * @param {any[]} aResult The results from child elements
	 * @param {object} oAggregate The aggregate
	 */
	function postProcessSchema(oElement, aResult, oAggregate) {
		var mAnnotations,
			oEntityContainer,
			sEntityContainerName,
			oEntitySet,
			sEntitySetName,
			sTarget;

		for (sEntityContainerName in oAggregate.mEntityContainersOfSchema) {
			oEntityContainer = oAggregate.mEntityContainersOfSchema[sEntityContainerName];

			for (sEntitySetName in oEntityContainer) {
				oEntitySet = oEntityContainer[sEntitySetName];
				if (oEntitySet.$kind !== "EntitySet") {
					continue;
				}
				sTarget = sEntityContainerName + "/" + sEntitySetName;
				mAnnotations = jQuery.extend(true,
					oAggregate.convertedV2Annotations[sTarget] || {},
					oAggregate.mEntityType2EntitySetAnnotation[oEntitySet.$Type]);
				if (Object.keys(mAnnotations).length) {
					oAggregate.convertedV2Annotations[sTarget] = mAnnotations;
				}
			}
		}

		if (oAggregate.schema.$Annotations) {
			V2MetadataConverter.mergeAnnotations(oAggregate.convertedV2Annotations,
				oAggregate.schema.$Annotations);
		} else if (Object.keys(oAggregate.convertedV2Annotations).length > 0) {
			oAggregate.schema.$Annotations = oAggregate.convertedV2Annotations;
		}

		oAggregate.convertedV2Annotations = {}; // reset schema annotations for next schema
		oAggregate.mEntityContainersOfSchema = {};
	}

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

		// These annotations are only relevant for V2
		consumeSapAnnotation(oAggregate, "creatable");
		consumeSapAnnotation(oAggregate, "deletable");
		consumeSapAnnotation(oAggregate, "updatable");
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
	 * Processes a DataServices element.
	 * @param {Element} oElement The element
	 * @param {object} oAggregate The aggregate
	 */
	function processDataServices(oElement, oAggregate) {
		if (oElement.getAttributeNS(sMicrosoftNamespace, "DataServiceVersion") !== "2.0") {
			throw new Error(oAggregate.url + " is not a valid OData V2 metadata document");
		}
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
	 * Collects all SAP annotations of the element, applys the processor on it and then checks that
	 * all annotations have been consumed.
	 *
	 * @param {Element} oElement The element
	 * @param {object} oAggregate The aggregate
	 * @param {function} [fnProcessor] The processor
	 */
	function processElement (oElement, oAggregate, fnProcessor) {
		collectSapAnnotations(oElement, oAggregate);
		if (fnProcessor) {
			fnProcessor(oElement, oAggregate);
		}
		warnUnsupportedSapAnnotations(oElement, oAggregate);
	}

	/**
	 * Processes an EntityContainer.
	 * @param {Element} oElement The element
	 * @param {object} oAggregate The aggregate
	 */
	function processEntityContainer(oElement, oAggregate) {
		var sQualifiedName = oAggregate.namespace + oElement.getAttribute("Name");

		oAggregate.mEntityContainersOfSchema[sQualifiedName]
			= oAggregate.result[sQualifiedName] = oAggregate.entityContainer = {
			"$kind" : "EntityContainer"
		};
		if (oElement.getAttributeNS(sMicrosoftNamespace, "IsDefaultEntityContainer") === "true") {
			oAggregate.defaultEntityContainer = sQualifiedName;
		}
		v2annotatable(oAggregate, sQualifiedName);
	}

	/**
	 * Processes an EntitySet element at the EntityContainer.
	 * @param {Element} oElement The element
	 * @param {object} oAggregate The aggregate
	 */
	function processEntitySet(oElement, oAggregate) {
		var oAnnotatable,
			sName = oElement.getAttribute("Name");

		oAggregate.entityContainer[sName] = oAggregate.entitySet = {
			$kind : "EntitySet",
			$Type :
				V2MetadataConverter.resolveAlias(oElement.getAttribute("EntityType"), oAggregate)
		};

		oAnnotatable = v2annotatable(oAggregate, sName, convertEntitySetAnnotation);
		// These annotations have to be retained until all v2 annotations have been visited
		oAnnotatable.consume("creatable");
		oAnnotatable.consume("deletable");
		oAnnotatable.consume("updatable");

		if (oAnnotatable.consume("searchable") !== "true") {
			// default for sap:searchable is false --> add v4 annotation, if value of v2 annotation
			// is not true
			oAnnotatable.convert("searchable", false);
		}
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

		convertLabel(oAggregate.annotatable);
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
	 * Processes a FunctionImport element.
	 * @param {Element} oElement The element
	 * @param {object} oAggregate The aggregate
	 */
	function processFunctionImport(oElement, oAggregate) {
		var sHttpMethod = oElement.getAttributeNS(sMicrosoftNamespace, "HttpMethod"),
			sKind = sHttpMethod === "POST" ? "Action" : "Function",
			oFunction = {
				$kind : sKind
			},
			sName = oElement.getAttribute("Name"),
			sQualifiedName = oAggregate.namespace + sName,
			oFunctionImport = {
				$kind : sKind + "Import"
			},
			sReturnType = oElement.getAttribute("ReturnType"),
			oReturnType;

		oFunctionImport["$" + sKind] = sQualifiedName;
		V2MetadataConverter.processAttributes(oElement, oFunctionImport, {
			"EntitySet" : V2MetadataConverter.setValue
		});
		if (sReturnType) {
			oFunction.$ReturnType = oReturnType = {};
			processTypedCollection(sReturnType, oReturnType, oAggregate);
		}
		if (consumeSapAnnotation(oAggregate, "action-for")) {
			jQuery.sap.log.warning("Unsupported 'sap:action-for' at FunctionImport '" + sName
				+ "', removing this FunctionImport", undefined, sModuleName);
			consumeSapAnnotation(oAggregate, "applicable-path");
		} else {
			// add Function and FunctionImport to the result
			oAggregate.entityContainer[sName] = oFunctionImport;
			oAggregate.result[sQualifiedName] = [oFunction];
		}
		// Remember the current function (even if it has not been added to the result), so that
		// processParameter adds to this. This avoids that parameters belonging to a removed
		// FunctionImport are added to the predecessor.
		oAggregate.function = oFunction;

		v2annotatable(oAggregate, sName);
		convertLabel(oAggregate.annotatable);
	}

	/**
	 * Processes a Parameter element within an Action or Function.
	 * @param {Element} oElement The element
	 * @param {object} oAggregate The aggregate
	 */
	function processParameter(oElement, oAggregate) {
		var oFunction = oAggregate.function,
			sLabel,
			oParameter = {
				$Name : oElement.getAttribute("Name")
			};

		V2MetadataConverter.processFacetAttributes(oElement, oParameter);
		processTypedCollection(oElement.getAttribute("Type"), oParameter, oAggregate);

		V2MetadataConverter.getOrCreateArray(oFunction, "$Parameter").push(oParameter);

		sLabel = consumeSapAnnotation(oAggregate, "label");
		if (sLabel) {
			oParameter[mV2toV4["label"].term] = sLabel;
		}
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
	 * Processes a Schema element.
	 * @param {Element} oElement The element
	 * @param {object} oAggregate The aggregate
	 */
	function processSchema(oElement, oAggregate) {
		var sSchemaVersion = consumeSapAnnotation(oAggregate, "schema-version");

		oAggregate.namespace = oElement.getAttribute("Namespace") + ".";
		oAggregate.result[oAggregate.namespace] = oAggregate.schema = {
			"$kind" : "Schema"
		};
		if (sSchemaVersion) {
			oAggregate.schema["@Org.Odata.Core.V1.SchemaVersion"] = sSchemaVersion;
		}
	}

	/**
	 * Processes a ComplexType or EntityType element.
	 * @param {Element} oElement The element
	 * @param {object} oAggregate The aggregate
	 * @param {object} oType The initial typed result object
	 */
	function processType(oElement, oAggregate, oType) {
		var sQualifiedName = oAggregate.namespace + oElement.getAttribute("Name");

		oAggregate.sTypeName = sQualifiedName;
		oAggregate.result[sQualifiedName] = oAggregate.type = oType;
		v2annotatable(oAggregate, sQualifiedName);
	}

	/**
	 * Processes the type in the form "Type" or "Collection(Type)" and sets the appropriate
	 * properties.
	 * @param {string} sType The type attribute from the Element
	 * @param {object} oProperty The property attribute in the JSON
	 * @param {object} oAggregate The aggregate
	 */
	function processTypedCollection(sType, oProperty, oAggregate) {
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
				oProperty.$v2Type = sType;
				if (oAggregate.mSapAnnotations["display-format"] === "Date") {
					sType = "Edm.Date";
					delete oProperty.$Precision;
				} else {
					sType = "Edm.DateTimeOffset";
				}
				break;
			case "Edm.Float":
				oProperty.$v2Type = sType;
				sType = "Edm.Single";
				break;
			case "Edm.Time":
				oProperty.$v2Type = sType;
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
		var sCreatable = consumeSapAnnotation(oAggregate, "creatable"),
			sCreatablePath = consumeSapAnnotation(oAggregate, "creatable-path"),
			sFilterable = consumeSapAnnotation(oAggregate, "filterable"),
			oFilterablePath,
			vHere,
			sName = oElement.getAttribute("Name"),
			oNavigationPropertyPath,
			oProperty = {
				$kind : "NavigationProperty"
			};

		/*
		 * Assumes that the given annotation term applies to all <EntitySet>s using the current
		 * <EntityType>. The term's value is a record that contains an array-valued property with
		 * the given name. Pushes the annotation object to that array.
		 * @param {string} sTerm The V4 annotation term starting with '@'
		 * @param {string} sProperty The name of the array-valued property
		 * @param {object} oAnnotation The V4 annotation object
		 */
		function pushPropertyPath(sTerm, sProperty, oAnnotation) {
			vHere = V2MetadataConverter.getOrCreateObject(
				oAggregate.mEntityType2EntitySetAnnotation, oAggregate.sTypeName);
			vHere = V2MetadataConverter.getOrCreateObject(vHere, sTerm);
			vHere = V2MetadataConverter.getOrCreateArray(vHere, sProperty);
			vHere.push(oAnnotation);
		}

		oAggregate.type[sName] = oProperty;
		oAggregate.navigationProperties.push({
			associationName :
				V2MetadataConverter.resolveAlias(oElement.getAttribute("Relationship"), oAggregate),
			fromRoleName : oElement.getAttribute("FromRole"),
			property : oProperty,
			propertyName : sName,
			toRoleName : oElement.getAttribute("ToRole")
		});

		v2annotatable(oAggregate, sName);

		if (sCreatable) {
			oNavigationPropertyPath = {"$NavigationPropertyPath" : sName};
			if (sCreatablePath) {
				jQuery.sap.log.warning("Inconsistent metadata in '" + oAggregate.url + "'",
					"Use either 'sap:creatable' or 'sap:creatable-path' at navigation property '"
					+ oAggregate.annotatable.sPath + "'", sModuleName);
			} else if (sCreatable === "true") {
				oNavigationPropertyPath = null;
			}
		} else if (sCreatablePath) {
			oNavigationPropertyPath = {
				"$If" : [{
					"$Not" : {"$Path" : sCreatablePath}
				}, {
					"$NavigationPropertyPath" : sName
				}]
			};
		}
		if (oNavigationPropertyPath) {
			pushPropertyPath("@Org.OData.Capabilities.V1.InsertRestrictions",
				"NonInsertableNavigationProperties", oNavigationPropertyPath);
		}
		if (sFilterable === "false") {
			oFilterablePath = {
				"NavigationProperty" : {
					"$NavigationPropertyPath" : sName
				},
				"FilterRestrictions" : {
					"Filterable" : false
				}
			};
			pushPropertyPath("@Org.OData.Capabilities.V1.NavigationRestrictions",
				"RestrictedProperties", oFilterablePath);
		}
	}

	/**
	 * For each property with a "sap:unit" annotation a corresponding V4 annotation is created.
	 * The annotation is "Org.OData.Measures.V1.Unit" if the unit has
	 * sap:semantics="unit-of-measure" or "Org.OData.Measures.V1.ISOCurrency" if the unit has
	 * sap:semantics="currency-code". The unit property can be in a different type thus the
	 * conversion can only happen in pass 3.
	 *
	 * @param {object} oAggregate The aggregate
	 */
	function processUnitConversion(oAggregate) {
		Object.keys(oAggregate.mProperty2Unit).forEach(function (sPropertyPath) {
			var vHere,
				oType,
				sTypeName = sPropertyPath.split("/")[0],
				sUnitAnnotation,
				sUnitPath = oAggregate.mProperty2Unit[sPropertyPath],
				aUnitPathSegments = sUnitPath.split("/"),
				oUnitProperty,
				sUnitSemantics,
				i,
				n = aUnitPathSegments.length;

			for (i = 0; i < n; i++) {
				oType = oAggregate.result[sTypeName];
				oUnitProperty = oType[aUnitPathSegments[i]];
				if (!oUnitProperty) {
					jQuery.sap.log.warning("Path '" + sUnitPath
						+ "' for sap:unit cannot be resolved", sPropertyPath, sModuleName);
					return;
				}
				if (i < n - 1) {
					sTypeName = oUnitProperty.$Type;
				}
			}
			sUnitSemantics = oAggregate.mProperty2Semantics[
				sTypeName + "/" + aUnitPathSegments[n - 1]];
			if (!sUnitSemantics) {
				jQuery.sap.log.warning("Unsupported sap:semantics at sap:unit='" + sUnitPath
					+ "'; expected 'currency-code' or 'unit-of-measure'", sPropertyPath,
					sModuleName);
				return;
			}

			sUnitAnnotation = sUnitSemantics === "currency-code" ? "ISOCurrency" : "Unit";
			sUnitAnnotation = "@Org.OData.Measures.V1." + sUnitAnnotation;

			vHere = V2MetadataConverter.getOrCreateObject(
				oAggregate.result[_Helper.namespace(sPropertyPath) + "."], "$Annotations");
			vHere = V2MetadataConverter.getOrCreateObject(vHere, sPropertyPath);
			if (!(sUnitAnnotation in vHere)) { // existing V4 annotations won't be overridden
				vHere[sUnitAnnotation] = {"$Path" : sUnitPath};
			}
		});
	}

	/**
	 * Processes a Property element of a structured type.
	 * @param {Element} oElement The element
	 * @param {object} oAggregate The aggregate
	 */
	function processTypeProperty(oElement, oAggregate) {
		var oAnnotatable,
			sEnumMember,
			sFilterRestriction,
			vHere,
			sName = oElement.getAttribute("Name"),
			oProperty = {
				"$kind" : "Property"
			};
		/*
		 * Assumes that the given annotation term applies to all <EntitySet>s using the current
		 * <EntityType>. The term's value is a record that contains an array-valued property with
		 * the given name. Pushes a <code>$PropertyPath</code> pointing to the current <Property>
		 * element to that array.
		 */
		function pushPropertyPath(sTerm, sProperty, sAnnotation) {
			if (oAggregate.type.$kind === "EntityType") {
				vHere = V2MetadataConverter.getOrCreateObject(
					oAggregate.mEntityType2EntitySetAnnotation, oAggregate.sTypeName);
				vHere = V2MetadataConverter.getOrCreateObject(vHere, sTerm);
				vHere = V2MetadataConverter.getOrCreateArray(vHere, sProperty);
				vHere.push({"$PropertyPath" : sName});
			} else {
				jQuery.sap.log.warning("Unsupported SAP annotation at a complex type in '"
					+ oAggregate.url + "'", "sap:" + sAnnotation + " at property '"
					+ oAggregate.annotatable.sPath + "'", sModuleName);
			}
		}

		oAggregate.sPropertyName = sName;
		oAggregate.type[sName] = oProperty;
		V2MetadataConverter.processFacetAttributes(oElement, oProperty);
		processTypedCollection(oElement.getAttribute("Type"), oProperty, oAggregate);

		oAnnotatable = v2annotatable(oAggregate, sName, convertPropertyAnnotation);
		if (oAnnotatable.consume("updatable") === "false") {
			if (oAnnotatable.consume("creatable") === "false") {
				oAnnotatable.annotate("@Org.OData.Core.V1.Computed", true);
			} else {
				oAnnotatable.annotate("@Org.OData.Core.V1.Immutable", true);
			}
		}

		if (oAnnotatable.consume("filterable") === "false") {
			pushPropertyPath("@Org.OData.Capabilities.V1.FilterRestrictions",
				"NonFilterableProperties", "filterable");
		}
		sFilterRestriction = oAnnotatable.consume("filter-restriction");
		if (sFilterRestriction) {
			switch (sFilterRestriction) {
				case "interval":
					sEnumMember = "SingleInterval";
					break;
				case "multi-value":
					sEnumMember = "MultiValue";
					break;
				case "single-value":
					sEnumMember = "SingleValue";
					break;
				default:
					jQuery.sap.log.warning("Inconsistent metadata in '" + oAggregate.url + "'",
						"Unsupported sap:filter-restriction=\"" + sFilterRestriction
						+ "\" at property '" + oAnnotatable.sPath + "'", sModuleName);
			}
			if (sEnumMember) {
				if (oAggregate.type.$kind === "EntityType") {
					vHere = V2MetadataConverter.getOrCreateObject(
						oAggregate.mEntityType2EntitySetAnnotation, oAggregate.sTypeName);
					vHere = V2MetadataConverter.getOrCreateArray(
						vHere, "@com.sap.vocabularies.Common.v1.FilterExpressionRestrictions");
					vHere.push({
						"AllowedExpressions" : {
							"EnumMember"
							: "com.sap.vocabularies.Common.v1.FilterExpressionType/" + sEnumMember
						},
						"Property" : {"$PropertyPath" : sName}
					});
				} else {
					jQuery.sap.log.warning("Unsupported SAP annotation at a complex type in '"
						+ oAggregate.url + "'", "sap:filter-restriction at property '"
						+ oAnnotatable.sPath + "'", sModuleName);
				}
			}
		}
		if (oAnnotatable.consume("required-in-filter") === "true") {
			pushPropertyPath("@Org.OData.Capabilities.V1.FilterRestrictions", "RequiredProperties",
				"required-in-filter");
		}
		if (oAnnotatable.consume("sortable") === "false") {
			pushPropertyPath("@Org.OData.Capabilities.V1.SortRestrictions",
				"NonSortableProperties", "sortable");
		}
	}

	/**
	 * Serializes the element with its attributes.
	 *
	 * BEWARE: makes no attempt at encoding, DO NOT use in a security critical manner!
	 *
	 * @param {Element} oElement any XML DOM element
	 * @returns {string} the serialization
	 */
	function serializeSingleElement(oElement) {
		var oAttribute,
			oAttributesList = oElement.attributes,
			sText = "<" + oElement.nodeName,
			i, n;

		for (i = 0, n = oAttributesList.length; i < n; i += 1) {
			oAttribute = oAttributesList.item(i);
			sText += " " + oAttribute.name + '="' + oAttribute.value + '"';
		}
		return sText + (oElement.childNodes.length ? ">" : "/>");
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

	/**
	 * This function is called by each v2 item for which V4 target annotations can be created. It
	 * defines the target path for the annotations. The V4 annotations will be placed to
	 * <code>oAggregate.convertedV2Annotations</code>. The annotatables form a stack (via 'parent'),
	 * this functions pushes a new annotatable on the stack. It will be removed automatically by
	 * traverse().
	 *
	 * @param {object} oAggregate
	 *   The aggregate
	 * @param {string} sName
	 *   The target name to which the V4 annotations shall be added. The target path is constructed
	 *   from the path of the top annotatable of the stack (if there is one yet) and the given name.
	 * @param {function} [fnProcessV2Annotatable]
	 *   An optional function which is called for each V2 annotation of the current element with the
	 *   created annotatable and the annotation name as parameters.
	 * @returns {Annotatable}
	 *   The created annotatable
	 */
	function v2annotatable(oAggregate, sName, fnProcessV2Annotatable) {
		var oAnnotatable = new Annotatable(oAggregate, sName);

		oAggregate.annotatable = oAnnotatable;
		if (fnProcessV2Annotatable) {
			Object.keys(oAggregate.mSapAnnotations).forEach(function (sName) {
				fnProcessV2Annotatable(oAnnotatable, sName);
			});
		}
		return oAnnotatable;
	}

	/**
	 * Logs a warning "Unsupported annotation" for each V2 annotation of the element that has not
	 * been consumed while processing it.
	 *
	 * @param {Element} oElement The element
	 * @param {object} oAggregate The aggregate
	 */
	function warnUnsupportedSapAnnotations(oElement, oAggregate) {
		Object.keys(oAggregate.mSapAnnotations).forEach(function (sName) {
			jQuery.sap.log.warning("Unsupported annotation 'sap:" + sName + "'",
				serializeSingleElement(oElement), sModuleName);
		});
	}

	V2MetadataConverter = jQuery.extend({}, _MetadataConverter, {
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

			jQuery.sap.measure.average("convertXMLMetadata", "", sModuleName);

			oElement = oDocument.documentElement;
			if (oElement.localName !== "Edmx" || oElement.namespaceURI !== sEdmxNamespace) {
				throw new Error(sUrl + " is not a valid OData V2 metadata document");
			}
			oAggregate = {
				"aliases" : {}, // maps alias -> namespace
				"annotatable" : null, // the current annotatable, see function annotatable
				"association" : null, // the current association
				"associations" : {}, // maps qualified name -> association
				"associationSet" : null, // the current associationSet
				"associationSets" : [], // list of associationSets
				"constraintRole" : null, // the current Principal/Dependent
				// maps annotatable path to a map of converted V2 annotations for current Schema
				"convertedV2Annotations" : {},
				"defaultEntityContainer" : null, // the name of the default EntityContainer
				"entityContainer" : null, // the current EntityContainer
				mEntityContainersOfSchema : {}, // all EntityContainers of current Schema by name
				"entitySet" : null, // the current EntitySet
				// converted V2 annotations for EntitySets, identified by EntityType's name
				mEntityType2EntitySetAnnotation : {},
				"function" : null, // the current function
				"namespace" : null, // the namespace of the current Schema
				mProperty2Semantics : {}, // maps a property's path to its sap:semantics value
				sPropertyName : null, // the name of the current property
				"navigationProperties" : [], // a list of navigation property data
				"processFacetAttributes" : V2MetadataConverter.processFacetAttributes,
				"processTypedCollection" : processTypedCollection,
				"processElement" : processElement,
				mSapAnnotations : {}, // map of the current Element's SAP annotations by name
				"schema" : null, // the current Schema
				"type" : null, // the current EntityType/ComplexType
				sTypeName : null, // the name of the current EntityType/ComplexType
				mProperty2Unit : {}, // maps a property's path to its sap:unit value
				"result" : {
					"$Version" : "4.0" // The result of the conversion is a V4 streamlined JSON
				},
				"url" : sUrl // the document URL (for error messages)
			};

			// pass 1: find aliases
			V2MetadataConverter.traverse(oElement, oAggregate, oAliasConfig);
			// pass 2: full conversion
			V2MetadataConverter.traverse(oElement, oAggregate, oFullConfig, true);
			// pass 3
			setDefaultEntityContainer(oAggregate);
			updateNavigationPropertiesAndCreateBindings(oAggregate);
			processUnitConversion(oAggregate);

			jQuery.sap.measure.end("convertXMLMetadata");
			return oAggregate.result;
		},

		/**
		 * Merges the given V2 annotations into the given V4 annotations map. If the annotation
		 * is contained in both maps the V4 one wins.
		 * @param {object} mConvertedV2Annotations
		 *   Maps annotatable path to a map of converted V2 annotations; this object is modified
		 *   during the merge
		 * @param {object} [mV4Annotations]
		 *   Maps annotatable path to a map of V4 annotations; V2 annotations are merged into this
		 *   object
		 */
		mergeAnnotations : function (mConvertedV2Annotations, mV4Annotations) {
			var sAnnotatablePath;

			for (sAnnotatablePath in mConvertedV2Annotations) {
				if (sAnnotatablePath in mV4Annotations) {
					mV4Annotations[sAnnotatablePath] = jQuery.extend(
						mConvertedV2Annotations[sAnnotatablePath],
						mV4Annotations[sAnnotatablePath]);
				} else {
					mV4Annotations[sAnnotatablePath] = mConvertedV2Annotations[sAnnotatablePath];
				}
			}
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
				"MaxLength" : function (sValue) {
					return sValue === "Max" ? undefined : V2MetadataConverter.setNumber(sValue);
				},
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
