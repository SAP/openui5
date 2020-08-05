/*!
 * ${copyright}
 */

//Provides class sap.ui.model.odata.v4.lib._V2MetadataConverter
sap.ui.define([
	"./_Helper",
	"./_MetadataConverter",
	"sap/base/Log"
], function (_Helper, _MetadataConverter, Log) {
	"use strict";

	var sClassName = "sap.ui.model.odata.v4.lib._V2MetadataConverter",
		rHttpMethods = /^(?:DELETE|GET|MERGE|PATCH|POST|PUT)$/,

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
				V4Attribute : "locality"
			},
			"country" : {
				Path : "adr",
				TermName : "Contact"
			},
			"email" : {
				Path : "address",
				TermName : "Contact",
				V4Attribute : "uri",
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
				V4Attribute : "surname"
			},
			"givenname" : {
				Path : "n",
				TermName : "Contact",
				V4Attribute : "given"
			},
			"honorific" : {
				Path : "n",
				TermName : "Contact",
				V4Attribute : "prefix"
			},
			"middlename" : {
				Path : "n",
				TermName : "Contact",
				V4Attribute : "additional"
			},
			"name" : {
				TermName : "Contact",
				V4Attribute : "fn"
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
				V4Attribute : "uri",
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
				V4Attribute : "code"
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
				V4Attribute : "percentcomplete"
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
		};

	//*********************************************************************************************
	// Annotatable
	//*********************************************************************************************

	/**
	 * Creates an annotatable that is able to consume V2 annotations and set V4 annotations for the
	 * correct target. It ensures that the target for the annotations is only created when needed.
	 *
	 * @param {V2MetadataConverter} oConverter The converter
	 * @param {string} sTarget
	 *   The target name to which the V4 annotations shall be added. The target path is constructed
	 *   from the path of the top annotatable of the stack in oConverter (if there is one yet) and
	 *   the given name.
	 * @constructor
	 */
	function Annotatable(oConverter, sTarget) {
		var oParent = oConverter.oAnnotatable;

		if (oParent) {
			sTarget = _Helper.buildPath(oParent.sPath, sTarget);
		}
		this.oConverter = oConverter;
		this.sPath = sTarget;
		this.oParent = oParent;
		this.mSapAttributes = oConverter.mSapAttributes;
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
		return this.oConverter.consumeSapAnnotation(sName);
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
	 * Gets the converted V2 annotation for the given term. Assumes an &lt;edm:Record> and ensures
	 * that there is one.
	 *
	 * @param {string} sTerm The term
	 * @returns {object} The V4 annotation value, an &lt;edm:Record>
	 */
	Annotatable.prototype.getOrCreateAnnotationRecord = function (sTerm) {
		return this.oConverter.getOrCreateObject(this.getTarget(), sTerm);
	};

	/**
	 * Gets the target for the converted V2 annotations of this annotatable. Ensures that it exists.
	 *
	 * @returns {object} The target for the annotations
	 */
	Annotatable.prototype.getTarget = function () {
		if (!this.mAnnotationsForTarget) {
			this.mAnnotationsForTarget = this.oConverter.convertedV2Annotations[this.sPath] = {};
		}
		return this.mAnnotationsForTarget;
	};

	/**
	 * Returns the value of the SAP annotation for the given name.
	 *
	 * @param {string} sName The name
	 * @returns {string} The value or <code>undefined</code>
	 */
	Annotatable.prototype.peek = function (sName) {
		return this.oConverter.mSapAnnotations[sName];
	};

	//*********************************************************************************************
	// V2MetadataConverter
	//*********************************************************************************************

	/**
	 * Creates a converter for V2 metadata.
	 *
	 * @constructor
	 */
	function V2MetadataConverter() {
		this.association = null; // the current association
		this.associations = {}; // maps qualified name -> association
		this.associationSet = null; // the current associationSet
		this.associationSets = []; // list of associationSets
		this.aBoundOperations = []; // list of bound operations
		this.constraintRole = null; // the current Principal/Dependent
		// maps annotatable path to a map of converted V2 annotations for current Schema
		this.convertedV2Annotations = {};
		this.defaultEntityContainer = null; // the name of the default EntityContainer
		this.mEntityContainersOfSchema = {}; // all EntityContainers of current Schema by name
		// converted V2 annotations for EntitySets, identified by EntityType's name
		this.mEntityType2EntitySetAnnotation = {};
		this.mProperty2Semantics = {}; // maps a property's path to its sap:semantics value
		this.sPropertyName = null; // the name of the current property
		this.navigationProperties = []; // a list of navigation property data
		this.mSapAnnotations = {}; // map of the current Element's SAP annotations by name
		this.sTypeName = null; // the name of the current EntityType/ComplexType
		this.mProperty2Unit = {}; // maps a property's path to its sap:unit value

		_MetadataConverter.call(this);
	}

	V2MetadataConverter.prototype = Object.create(_MetadataConverter.prototype);

	/**
	 * Collects the element's SAP annotations in the aggregate.
	 *
	 * @param {Element} oElement The element
	 */
	V2MetadataConverter.prototype.collectSapAnnotations = function (oElement) {
		var oAttribute,
			oAttributeList = oElement.attributes,
			i, n;

		this.mSapAnnotations = {};
		for (i = 0, n = oAttributeList.length; i < n; i += 1) {
			oAttribute = oAttributeList.item(i);

			if (oAttribute.namespaceURI === sSapNamespace
					&& oAttribute.localName !== "content-version") {
				this.mSapAnnotations[oAttribute.localName] = oAttribute.value;
			}
		}
	};

	/**
	 * Returns the value of the SAP annotation for the given name and removes it from the map.
	 *
	 * @param {string} sName The name
	 * @returns {string} The value or <code>undefined</code>
	 */
	V2MetadataConverter.prototype.consumeSapAnnotation = function (sName) {
		var sValue = this.mSapAnnotations[sName];

		delete this.mSapAnnotations[sName];
		return sValue;
	};

	/**
	 * Converts the given V2 annotation of an EntitySet to corresponding V4 annotation.
	 *
	 * @param {Annotatable} oAnnotatable The annotatable
	 * @param {string} sName The name of the V2 annotation
	 */
	V2MetadataConverter.prototype.convertEntitySetAnnotation = function (oAnnotatable, sName) {
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
					Log.warning("Inconsistent metadata in '" + this.url + "'",
						"Use either 'sap:" + sConflictingV2Annotation + "' or 'sap:"
							+ sConflictingV2Annotation + "-path'"
							+ " at entity set '" + oAnnotatable.sPath + "'",
						sClassName);
				} else {
					oAnnotatable.convert(sName, {
						$Path : sValue
					});
				}
				break;
			case "label":
				this.convertLabel(oAnnotatable);
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
	};

	/**
	 * Converts the V2 annotation "label".
	 *
	 * @param {Annotatable} oAnnotatable The annotatable
	 */
	V2MetadataConverter.prototype.convertLabel = function (oAnnotatable) {
		oAnnotatable.convert("label", oAnnotatable.consume("label"));
	};

	/**
	 * Converts the given V2 annotation of a Property to corresponding V4 annotation.
	 *
	 * @param {Annotatable} oAnnotatable The annotatable
	 * @param {string} sName The name of the V2 annotation
	 */
	V2MetadataConverter.prototype.convertPropertyAnnotation = function (oAnnotatable, sName) {
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
				this.convertPropertySemanticsAnnotation(oAnnotatable);
				break;
			case "unit":
				this.mProperty2Unit[oAnnotatable.sPath] = oAnnotatable.consume("unit");
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
	};

	/**
	 * Converts a sap:semantics V2 annotation of a property to the corresponding V4 annotation.
	 *
	 * @param {Annotatable} oAnnotatable The annotatable
	 */
	V2MetadataConverter.prototype.convertPropertySemanticsAnnotation = function (oAnnotatable) {
		var oAnnotations,
			sEnum,
			oPath,
			aResult,
			oSemantics,
			aValue = oAnnotatable.peek("semantics").split(";"),
			sValue = aValue[0],
			oV2toV4ComplexSemantic = mV2toV4ComplexSemantics[sValue];

		if (sValue === "unit-of-measure" || sValue === "currency-code") {
			this.mProperty2Semantics[oAnnotatable.sPath] = oAnnotatable.consume("semantics");
		} else if (mV2toV4SimpleSemantics[sValue]) {
			oAnnotatable.annotate(mV2toV4SimpleSemantics[sValue], true);
			oAnnotatable.consume("semantics");
		} else if (oV2toV4ComplexSemantic) {
			oPath = {
				"$Path" : this.sPropertyName
			};
			oAnnotations = oAnnotatable.oParent.getOrCreateAnnotationRecord(
				"@com.sap.vocabularies.Communication.v1." + oV2toV4ComplexSemantic.TermName);
			if (oV2toV4ComplexSemantic.Path) {
				oSemantics = this.getOrCreateObject(oAnnotations, oV2toV4ComplexSemantic.Path);
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
								Log.warning("Unsupported semantic type: " + sType, undefined,
									sClassName);
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
	};

	/**
	 * Finalizes the conversion after having traversed the XML completely.
	 *
	 * @override
	 */
	V2MetadataConverter.prototype.finalize = function () {
		this.result.$Version = "4.0"; // The result of the conversion is a V4 streamlined JSON

		this.setDefaultEntityContainer();
		this.updateNavigationPropertiesAndCreateBindings();
		this.processBoundOperations();
		this.processUnitConversion();
	};

	/**
	 * Merges the given V2 annotations into the given V4 annotations map. If the annotation
	 * is contained in both maps the V4 one wins.
	 *
	 * @param {object} mConvertedV2Annotations
	 *   Maps annotatable path to a map of converted V2 annotations; this object is modified
	 *   during the merge
	 * @param {object} [mV4Annotations]
	 *   Maps annotatable path to a map of V4 annotations; V2 annotations are merged into this
	 *   object
	 */
	V2MetadataConverter.prototype.mergeAnnotations = function (mConvertedV2Annotations,
			mV4Annotations) {
		var sAnnotatablePath;

		for (sAnnotatablePath in mConvertedV2Annotations) {
			if (sAnnotatablePath in mV4Annotations) {
				mV4Annotations[sAnnotatablePath] = Object.assign(
					mConvertedV2Annotations[sAnnotatablePath],
					mV4Annotations[sAnnotatablePath]);
			} else {
				mV4Annotations[sAnnotatablePath] = mConvertedV2Annotations[sAnnotatablePath];
			}
		}
	};

	/**
	 * Post-processing of an Schema element.
	 *
	 * @param {Element} oElement The element
	 * @param {any[]} aResult The results from child elements
	 */
	V2MetadataConverter.prototype.postProcessSchema = function (oElement, aResult) {
		var mAnnotations,
			oEntityContainer,
			sEntityContainerName,
			oEntitySet,
			sEntitySetName,
			sTarget;

		for (sEntityContainerName in this.mEntityContainersOfSchema) {
			oEntityContainer = this.mEntityContainersOfSchema[sEntityContainerName];

			for (sEntitySetName in oEntityContainer) {
				oEntitySet = oEntityContainer[sEntitySetName];
				if (oEntitySet.$kind !== "EntitySet") {
					continue;
				}
				sTarget = sEntityContainerName + "/" + sEntitySetName;
				mAnnotations = _Helper.merge(this.convertedV2Annotations[sTarget] || {},
					this.mEntityType2EntitySetAnnotation[oEntitySet.$Type]);
				if (Object.keys(mAnnotations).length) {
					this.convertedV2Annotations[sTarget] = mAnnotations;
				}
			}
		}

		if (this.schema.$Annotations) {
			this.mergeAnnotations(this.convertedV2Annotations, this.schema.$Annotations);
		} else if (Object.keys(this.convertedV2Annotations).length > 0) {
			this.schema.$Annotations = this.convertedV2Annotations;
		}
		this.convertedV2Annotations = {}; // reset schema annotations for next schema
		this.mEntityContainersOfSchema = {};
	};

	/**
	 * Processes an Association element.
	 *
	 * @param {Element} oElement The element
	 */
	V2MetadataConverter.prototype.processAssociation = function (oElement) {
		var sName = this.namespace + oElement.getAttribute("Name");

		this.associations[sName] = this.association = {
			referentialConstraint : null,
			roles : {} // maps role name -> AssocationEnd
		};
	};

	/**
	 * Processes an End element below an Association element.
	 *
	 * @param {Element} oElement The element
	 */
	V2MetadataConverter.prototype.processAssociationEnd = function (oElement) {
		var sName = oElement.getAttribute("Role");

		this.association.roles[sName] = {
			multiplicity : oElement.getAttribute("Multiplicity"),
			propertyName : undefined, // will poss. be set in updateNavigationProperties...
			typeName : this.resolveAlias(oElement.getAttribute("Type"))
		};
	};

	/**
	 * Processes an AssociationSet element.
	 *
	 * @param {Element} oElement The element
	 */
	V2MetadataConverter.prototype.processAssociationSet = function (oElement) {
		var oAssociationSet = {
				associationName : this.resolveAlias(oElement.getAttribute("Association")),
				ends : [],
				entityContainer : this.entityContainer
			};

		this.associationSet = oAssociationSet;
		this.associationSets.push(oAssociationSet);

		this.consumeSapAnnotation("creatable");
		this.consumeSapAnnotation("deletable");
		this.consumeSapAnnotation("updatable");
	};

	/**
	 * Processes an End element below an Association or AssociationSet element.
	 *
	 * @param {Element} oElement The element
	 */
	V2MetadataConverter.prototype.processAssociationSetEnd = function (oElement) {
		this.associationSet.ends.push({
			entitySetName : oElement.getAttribute("EntitySet"),
			roleName : oElement.getAttribute("Role")
		});
	};

	/**
	 * Processes a ComplexType element.
	 *
	 * @param {Element} oElement The element
	 */
	V2MetadataConverter.prototype.processComplexType = function (oElement) {
		this.processType(oElement, {"$kind" : "ComplexType"});
	};

	/**
	 * Processes a DataServices element.
	 *
	 * @param {Element} oElement The element
	 */
	V2MetadataConverter.prototype.processDataServices = function (oElement) {
		if (oElement.getAttributeNS(sMicrosoftNamespace, "DataServiceVersion") !== "2.0") {
			throw new Error(this.url + ": expected DataServiceVersion=\"2.0\": "
				+ serializeSingleElement(oElement));
		}
	};

	/**
	 * Processes a Dependent element below a ReferentialConstraint element.
	 *
	 * @param {Element} oElement The element
	 */
	V2MetadataConverter.prototype.processDependent = function (oElement) {
		var oConstraint = this.association.referentialConstraint;

		this.constraintRole = oConstraint.dependent = {
			roleName : oElement.getAttribute("Role")
		};
	};

	/**
	 * Collects all SAP annotations of the element, applys the processor on it and then checks that
	 * all annotations have been consumed.
	 *
	 * @param {Element} oElement The element
	 * @param {function} [fnProcessor] The processor
	 */
	V2MetadataConverter.prototype.processElement = function (oElement, fnProcessor) {
		this.collectSapAnnotations(oElement);
		if (fnProcessor) {
			fnProcessor.call(this, oElement);
		}
		this.warnUnsupportedSapAnnotations(oElement);
	};

	/**
	 * Processes an EntityContainer.
	 *
	 * @param {Element} oElement The element
	 */
	V2MetadataConverter.prototype.processEntityContainer = function (oElement) {
		var sQualifiedName = this.namespace + oElement.getAttribute("Name");

		this.mEntityContainersOfSchema[sQualifiedName]
			= this.entityContainer = {"$kind" : "EntityContainer"};
		this.addToResult(sQualifiedName, this.entityContainer);
		if (oElement.getAttributeNS(sMicrosoftNamespace, "IsDefaultEntityContainer") === "true") {
			this.defaultEntityContainer = sQualifiedName;
		}
		this.v2annotatable(sQualifiedName);
	};

	/**
	 * Processes an EntitySet element at the EntityContainer.
	 *
	 * @param {Element} oElement The element
	 */
	V2MetadataConverter.prototype.processEntitySet = function (oElement) {
		var oAnnotatable,
			sName = oElement.getAttribute("Name");

		this.entityContainer[sName] = this.entitySet = {
			$kind : "EntitySet",
			$Type : this.resolveAlias(oElement.getAttribute("EntityType"))
		};

		oAnnotatable = this.v2annotatable(sName, this.convertEntitySetAnnotation);
		// These annotations have to be retained until all V2 annotations have been visited
		oAnnotatable.consume("creatable");
		oAnnotatable.consume("deletable");
		oAnnotatable.consume("updatable");

		if (oAnnotatable.consume("searchable") !== "true") {
			// default for sap:searchable is false --> add V4 annotation, if value of V2 annotation
			// is not true
			oAnnotatable.convert("searchable", false);
		}
	};

	/**
	 * Processes an EntityType element.
	 *
	 * @param {Element} oElement The element
	 */
	V2MetadataConverter.prototype.processEntityType = function (oElement) {
		var oType = {
				$kind : "EntityType"
			},
			that = this;

		this.processType(oElement, oType);
		this.processAttributes(oElement, oType, {
			"Abstract" : this.setIfTrue,
			"BaseType" : function (sType) {
				return sType ? that.resolveAlias(sType) : undefined;
			}
		});

		this.convertLabel(this.oAnnotatable);
	};

	/**
	 * Processes a PropertyRef element of the EntityType's Key.
	 *
	 * @param {Element} oElement The element
	 */
	V2MetadataConverter.prototype.processEntityTypeKeyPropertyRef = function (oElement) {
		var sName = oElement.getAttribute("Name");

		this.getOrCreateArray(this.type, "$Key").push(sName);
	};

	/**
	 * Processes the TFacetAttributes and TPropertyFacetAttributes of the elements Property,
	 * TypeDefinition etc.
	 *
	 * @param {Element} oElement The element
	 * @param {object} oResult The result object to fill
	 */
	V2MetadataConverter.prototype.processFacetAttributes = function (oElement, oResult) {
		var that = this;

		this.processAttributes(oElement, oResult, {
			"DefaultValue" : this.setValue,
			"MaxLength" :  function (sValue) {
				return sValue === "Max" ? undefined : that.setNumber(sValue);
			},
			"Nullable" : this.setIfFalse,
			"Precision" : this.setNumber,
			"Scale" :  this.setNumber,
			"Unicode" : this.setIfFalse
		});
		if (oElement.getAttribute("FixedLength") === "false") {
			oResult.$Scale = "variable";
		}
	};

	/**
	 * Processes a FunctionImport element.
	 *
	 * @param {Element} oElement The element
	 */
	V2MetadataConverter.prototype.processFunctionImport = function (oElement) {
		var sAnnotationActionFor,
			sHttpMethod = oElement.getAttributeNS(sMicrosoftNamespace, "HttpMethod"),
			sKind = sHttpMethod !== "GET" ? "Action" : "Function",
			sLabel,
			sName = oElement.getAttribute("Name"),
			oOperation = {
				$kind : sKind
			},
			oOperationImport = {
				$kind : sKind + "Import"
			},
			sQualifiedName = this.namespace + sName,
			sReturnType = oElement.getAttribute("ReturnType"),
			oReturnType;

		oOperationImport["$" + sKind] = sQualifiedName;
		this.processAttributes(oElement, oOperationImport, {
			"EntitySet" : this.setValue
		});
		if (sReturnType) {
			oOperation.$ReturnType = oReturnType = {};
			this.processTypedCollection(sReturnType, oReturnType);
		}
		if (!rHttpMethods.test(sHttpMethod)) {
			Log.warning("Unsupported HttpMethod at FunctionImport '" + sName
				+ "', removing this FunctionImport", undefined, sClassName);
			this.consumeSapAnnotation("action-for");
			this.consumeSapAnnotation("applicable-path");
		} else {
			if (sHttpMethod !== "GET" && sHttpMethod !== "POST") {
				// remember V2 HttpMethod only if needed
				oOperation.$v2HttpMethod = sHttpMethod;
			}

			// add operation to the result
			this.addToResult(sQualifiedName, [oOperation]);

			sAnnotationActionFor = this.consumeSapAnnotation("action-for");
			if (sAnnotationActionFor) {
				oOperation.$IsBound = true;
				oOperation.$Parameter = [{
					"$Name" : null,
					"$Nullable" : false,
					"$Type" : this.resolveAlias(sAnnotationActionFor)
				}];
				this.aBoundOperations.push(oOperation);
				this.consumeSapAnnotation("applicable-path");

				sLabel = this.consumeSapAnnotation("label");
				if (sLabel) {
					oOperation[mV2toV4["label"].term] = sLabel;
				}
			} else {
				// add operation import to the result
				this.entityContainer[sName] = oOperationImport;

				this.v2annotatable(sName);
				this.convertLabel(this.oAnnotatable);
			}
		}
		// Remember the current operation (even if it has not been added to the result), so that
		// processParameter adds to this. This avoids that parameters belonging to a removed
		// FunctionImport are added to the predecessor.
		this.oOperation = oOperation;
	};

	/**
	 * Processes a Parameter element within an Action or Function.
	 *
	 * @param {Element} oElement The element
	 */
	V2MetadataConverter.prototype.processParameter = function (oElement) {
		var sLabel,
			oOperation = this.oOperation,
			oParameter = {
				$Name : oElement.getAttribute("Name")
			};

		this.processFacetAttributes(oElement, oParameter);
		this.processTypedCollection(oElement.getAttribute("Type"), oParameter);

		this.getOrCreateArray(oOperation, "$Parameter").push(oParameter);

		sLabel = this.consumeSapAnnotation("label");
		if (sLabel) {
			oParameter[mV2toV4["label"].term] = sLabel;
		}
	};

	/**
	 * Processes a Principal element below a ReferentialConstraint element.
	 *
	 * @param {Element} oElement The element
	 */
	V2MetadataConverter.prototype.processPrincipal = function (oElement) {
		var oConstraint = this.association.referentialConstraint;

		this.constraintRole = oConstraint.principal = {
			roleName : oElement.getAttribute("Role")
		};
	};

	/**
	 * Processes an End element below an Association element.
	 *
	 * @param {Element} oElement The element
	 */
	V2MetadataConverter.prototype.processReferentialConstraint = function (oElement) {
		this.association.referentialConstraint = {};
	};

	/**
	 * Processes an End element below an Association element.
	 *
	 * @param {Element} oElement The element
	 */
	V2MetadataConverter.prototype.processReferentialConstraintPropertyRef = function (oElement) {
		this.constraintRole.propertyRef = oElement.getAttribute("Name");
	};

	/**
	 * Processes a Schema element.
	 *
	 * @param {Element} oElement The element
	 */
	V2MetadataConverter.prototype.processSchema = function (oElement) {
		var sSchemaVersion = this.consumeSapAnnotation("schema-version");

		this.namespace = oElement.getAttribute("Namespace") + ".";
		this.schema = {"$kind" : "Schema"};
		this.addToResult(this.namespace, this.schema);
		if (sSchemaVersion) {
			this.schema["@Org.Odata.Core.V1.SchemaVersion"] = sSchemaVersion;
		}
	};

	/**
	 * Processes a ComplexType or EntityType element.
	 *
	 * @param {Element} oElement The element
	 * @param {object} oType The initial typed result object
	 */
	V2MetadataConverter.prototype.processType = function (oElement, oType) {
		var sQualifiedName = this.namespace + oElement.getAttribute("Name");

		this.sTypeName = sQualifiedName;
		this.type = oType;
		this.addToResult(sQualifiedName, oType);
		this.v2annotatable(sQualifiedName);
	};

	/**
	 * Processes the type in the form "Type" or "Collection(Type)" and sets the appropriate
	 * properties.
	 *
	 * @param {string} sType The type attribute from the Element
	 * @param {object} oProperty The property attribute in the JSON
	 */
	V2MetadataConverter.prototype.processTypedCollection = function (sType, oProperty) {
		var aMatches = this.rCollection.exec(sType);

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
				if (this.mSapAnnotations["display-format"] === "Date") {
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
				sType = this.resolveAlias(sType);
		}
		oProperty.$Type = sType;
	};

	/**
	 * Processes a NavigationProperty element of a structured type.
	 *
	 * @param {Element} oElement The element
	 */
	V2MetadataConverter.prototype.processTypeNavigationProperty = function (oElement) {
		var sCreatable = this.consumeSapAnnotation("creatable"),
			sCreatablePath = this.consumeSapAnnotation("creatable-path"),
			sFilterable = this.consumeSapAnnotation("filterable"),
			oFilterablePath,
			vHere,
			sName = oElement.getAttribute("Name"),
			oNavigationPropertyPath,
			oProperty = {
				$kind : "NavigationProperty"
			},
			that = this;

		/*
		 * Assumes that the given annotation term applies to all <EntitySet>s using the current
		 * <EntityType>. The term's value is a record that contains an array-valued property with
		 * the given name. Pushes the annotation object to that array.
		 * @param {string} sTerm The V4 annotation term starting with '@'
		 * @param {string} sProperty The name of the array-valued property
		 * @param {object} oAnnotation The V4 annotation object
		 */
		function pushPropertyPath(sTerm, sProperty, oAnnotation) {
			vHere = that.getOrCreateObject(that.mEntityType2EntitySetAnnotation, that.sTypeName);
			vHere = that.getOrCreateObject(vHere, sTerm);
			vHere = that.getOrCreateArray(vHere, sProperty);
			vHere.push(oAnnotation);
		}

		this.type[sName] = oProperty;
		this.navigationProperties.push({
			associationName : this.resolveAlias(oElement.getAttribute("Relationship")),
			fromRoleName : oElement.getAttribute("FromRole"),
			property : oProperty,
			propertyName : sName,
			toRoleName : oElement.getAttribute("ToRole")
		});

		this.v2annotatable(sName);

		if (sCreatable) {
			oNavigationPropertyPath = {"$NavigationPropertyPath" : sName};
			if (sCreatablePath) {
				Log.warning("Inconsistent metadata in '" + this.url + "'",
					"Use either 'sap:creatable' or 'sap:creatable-path' at navigation property '"
					+ this.oAnnotatable.sPath + "'", sClassName);
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
	};

	/**
	 * Processes a Property element of a structured type.
	 *
	 * @param {Element} oElement The element
	 */
	V2MetadataConverter.prototype.processTypeProperty = function (oElement) {
		var oAnnotatable,
			sEnumMember,
			sFilterRestriction,
			vHere,
			sName = oElement.getAttribute("Name"),
			oProperty = {
				"$kind" : "Property"
			},
			that = this;

		/*
		 * Assumes that the given annotation term applies to all <EntitySet>s using the current
		 * <EntityType>. The term's value is a record that contains an array-valued property with
		 * the given name. Pushes a <code>$PropertyPath</code> pointing to the current <Property>
		 * element to that array.
		 */
		function pushPropertyPath(sTerm, sProperty, sAnnotation) {
			if (that.type.$kind === "EntityType") {
				vHere = that.getOrCreateObject(
					that.mEntityType2EntitySetAnnotation, that.sTypeName);
				vHere = that.getOrCreateObject(vHere, sTerm);
				vHere = that.getOrCreateArray(vHere, sProperty);
				vHere.push({"$PropertyPath" : sName});
			} else {
				Log.warning("Unsupported SAP annotation at a complex type in '"
					+ that.url + "'", "sap:" + sAnnotation + " at property '" + oAnnotatable.sPath
					+ "'", sClassName);
			}
		}

		this.sPropertyName = sName;
		this.type[sName] = oProperty;
		this.processFacetAttributes(oElement, oProperty);
		this.processTypedCollection(oElement.getAttribute("Type"), oProperty);

		oAnnotatable = this.v2annotatable(sName, this.convertPropertyAnnotation);
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
					Log.warning("Inconsistent metadata in '" + this.url + "'",
						"Unsupported sap:filter-restriction=\"" + sFilterRestriction
						+ "\" at property '" + oAnnotatable.sPath + "'", sClassName);
			}
			if (sEnumMember) {
				if (this.type.$kind === "EntityType") {
					vHere = this.getOrCreateObject(
						this.mEntityType2EntitySetAnnotation, this.sTypeName);
					vHere = this.getOrCreateArray(
						vHere, "@com.sap.vocabularies.Common.v1.FilterExpressionRestrictions");
					vHere.push({
						"AllowedExpressions" : {
							"EnumMember" : "com.sap.vocabularies.Common.v1.FilterExpressionType/"
								+ sEnumMember
						},
						"Property" : {"$PropertyPath" : sName}
					});
				} else {
					Log.warning("Unsupported SAP annotation at a complex type in '"
						+ this.url + "'", "sap:filter-restriction at property '"
						+ oAnnotatable.sPath + "'", sClassName);
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
	};

	/**
	 * Post-processing of all bound operations: key properties are removed from parameters.
	 */
	V2MetadataConverter.prototype.processBoundOperations = function () {
		var that = this;

		this.aBoundOperations.forEach(function (oOperation) {
			var oEntityType = that.result[oOperation.$Parameter[0].$Type];

			oEntityType.$Key.forEach(function (sKeyName) {
				oOperation.$Parameter.some(function (oParameter, i) {
					if (oParameter.$Name === sKeyName) {
						oOperation.$Parameter.splice(i, 1);
						return true;
					}
				});
			});
		});
	};

	/**
	 * For each property with a "sap:unit" annotation a corresponding V4 annotation is created.
	 * The annotation is "Org.OData.Measures.V1.Unit" if the unit has
	 * sap:semantics="unit-of-measure" or "Org.OData.Measures.V1.ISOCurrency" if the unit has
	 * sap:semantics="currency-code". The unit property can be in a different type thus the
	 * conversion can only happen in pass 3.
	 */
	V2MetadataConverter.prototype.processUnitConversion = function () {
		var that = this;

		Object.keys(this.mProperty2Unit).forEach(function (sPropertyPath) {
			var vHere,
				oType,
				sTypeName = sPropertyPath.split("/")[0],
				sUnitAnnotation,
				sUnitPath = that.mProperty2Unit[sPropertyPath],
				aUnitPathSegments = sUnitPath.split("/"),
				oUnitProperty,
				sUnitSemantics,
				i,
				n = aUnitPathSegments.length;

			for (i = 0; i < n; i += 1) {
				oType = that.result[sTypeName];
				oUnitProperty = oType[aUnitPathSegments[i]];
				if (!oUnitProperty) {
					Log.warning("Path '" + sUnitPath + "' for sap:unit cannot be resolved",
						sPropertyPath, sClassName);
					return;
				}
				if (i < n - 1) {
					sTypeName = oUnitProperty.$Type;
				}
			}
			sUnitSemantics = that.mProperty2Semantics[
				sTypeName + "/" + aUnitPathSegments[n - 1]];
			if (!sUnitSemantics) {
				Log.warning("Unsupported sap:semantics at sap:unit='" + sUnitPath
					+ "'; expected 'currency-code' or 'unit-of-measure'", sPropertyPath,
					sClassName);
				return;
			}

			sUnitAnnotation = sUnitSemantics === "currency-code" ? "ISOCurrency" : "Unit";
			sUnitAnnotation = "@Org.OData.Measures.V1." + sUnitAnnotation;

			vHere = that.getOrCreateObject(
				that.result[_Helper.namespace(sPropertyPath) + "."], "$Annotations");
			vHere = that.getOrCreateObject(vHere, sPropertyPath);
			if (!(sUnitAnnotation in vHere)) { // existing V4 annotations won't be overridden
				vHere[sUnitAnnotation] = {"$Path" : sUnitPath};
			}
		});
	};

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
	 */
	V2MetadataConverter.prototype.setDefaultEntityContainer = function () {
		var sDefaultEntityContainer = this.defaultEntityContainer,
			aEntityContainers,
			oResult = this.result;

		if (sDefaultEntityContainer) {
			oResult.$EntityContainer = sDefaultEntityContainer;
		} else {
			aEntityContainers = Object.keys(oResult).filter(function (sQualifiedName) {
				return oResult[sQualifiedName].$kind === "EntityContainer";
			});
			if (aEntityContainers.length === 1) {
				oResult.$EntityContainer = aEntityContainers[0];
			}
		}
	};

	/**
	 * Updates navigation properties and creates navigation property bindings. Iterates over the
	 * aggregated navigation properties list and updates the corresponding navigation properties
	 * from the associations. Iterates over the aggregated association set and tries to create
	 * navigation property bindings for both directions.
	 */
	V2MetadataConverter.prototype.updateNavigationPropertiesAndCreateBindings = function () {
		var that = this;

		this.navigationProperties.forEach(function (oNavigationPropertyData) {
			var oAssociation = that.associations[oNavigationPropertyData.associationName],
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

		this.associationSets.forEach(function (oAssociationSet) {
			var oAssociation = that.associations[oAssociationSet.associationName],
				oEntityContainer = oAssociationSet.entityContainer;

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
	};

	/**
	 * This function is called by each V2 item for which V4 target annotations can be created. It
	 * defines the target path for the annotations. The V4 annotations will be placed to
	 * <code>convertedV2Annotations</code>. The annotatables form a stack (via 'parent'),
	 * this functions pushes a new annotatable on the stack. It will be removed automatically by
	 * traverse().
	 *
	 * @param {string} sName
	 *   The target name to which the V4 annotations shall be added. The target path is constructed
	 *   from the path of the top annotatable of the stack (if there is one yet) and the given name.
	 * @param {function} [fnProcessV2Annotatable]
	 *   An optional function which is called for each V2 annotation of the current element with the
	 *   created annotatable and the annotation name as parameters.
	 * @returns {Annotatable}
	 *   The created annotatable
	 */
	V2MetadataConverter.prototype.v2annotatable = function (sName, fnProcessV2Annotatable) {
		var oAnnotatable = new Annotatable(this, sName);

		this.oAnnotatable = oAnnotatable;
		if (fnProcessV2Annotatable) {
			fnProcessV2Annotatable = fnProcessV2Annotatable.bind(this);
			Object.keys(this.mSapAnnotations).forEach(function (sName) {
				fnProcessV2Annotatable(oAnnotatable, sName);
			});
		}
		return oAnnotatable;
	};

	/**
	 * Logs a warning "Unsupported annotation" for each V2 annotation of the element that has not
	 * been consumed while processing it.
	 *
	 * @param {Element} oElement The element
	 */
	V2MetadataConverter.prototype.warnUnsupportedSapAnnotations = function (oElement) {
		Object.keys(this.mSapAnnotations).forEach(function (sName) {
			Log.warning("Unsupported annotation 'sap:" + sName + "'",
				serializeSingleElement(oElement), sClassName);
		});
	};

	/**
	 * Build the configurations for traverse
	 *
	 * @param {object} $$ The prototype for V4MetadataConverter
	 */
	(function ($$) {
		// Note: this function is executed at load time only!
		var oStructuredTypeConfig;

		$$.sRootNamespace = sEdmxNamespace;

		$$.oAliasConfig = {
			"Reference" : {
				__xmlns : _MetadataConverter.sEdmxNamespace,
				"Include" : {
					__processor : $$.processAlias
				}
			},
			"DataServices" : {
				"Schema" : {
					__processor : $$.processAlias
				}
			}
		};

		oStructuredTypeConfig = {
			"NavigationProperty" : {
				__processor : $$.processTypeNavigationProperty
			},
			"Property" : {
				__processor : $$.processTypeProperty
			}
		};

		$$.oFullConfig = {
			__include : [$$.oReferenceInclude],
			"DataServices" : {
				__processor : $$.processDataServices,
				"Schema" : {
					__postProcessor : $$.postProcessSchema,
					__processor : $$.processSchema,
					__include : [$$.oAnnotationsConfig],
					"Association" : {
						__processor : $$.processAssociation,
						"End" : {
							__processor : $$.processAssociationEnd
						},
						"ReferentialConstraint" : {
							__processor : $$.processReferentialConstraint,
							"Dependent" : {
								__processor : $$.processDependent,
								"PropertyRef" : {
									__processor : $$.processReferentialConstraintPropertyRef
								}
							},
							"Principal" : {
								__processor : $$.processPrincipal,
								"PropertyRef" : {
									__processor : $$.processReferentialConstraintPropertyRef
								}
							}
						}
					},
					"ComplexType" : {
						__processor : $$.processComplexType,
						__include : [oStructuredTypeConfig]
					},
					"EntityContainer" : {
						__processor : $$.processEntityContainer,
						"AssociationSet" : {
							__processor : $$.processAssociationSet,
							"End" : {
								__processor : $$.processAssociationSetEnd
							}
						},
						"EntitySet" : {
							__processor : $$.processEntitySet
						},
						"FunctionImport" : {
							__processor : $$.processFunctionImport,
							"Parameter" : {
								__processor : $$.processParameter
							}
						}
					},
					"EntityType" : {
						__processor : $$.processEntityType,
						__include : [oStructuredTypeConfig],
						"Key" : {
							"PropertyRef" : {
								__processor : $$.processEntityTypeKeyPropertyRef
							}
						}
					}
				}
			}
		};

	})(V2MetadataConverter.prototype);

	return V2MetadataConverter;
}, /* bExport= */false);