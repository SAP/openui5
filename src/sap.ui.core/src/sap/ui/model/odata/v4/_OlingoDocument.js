/*!
 * ${copyright}
 */

sap.ui.define([
	"./_ODataHelper",
	"sap/ui/thirdparty/odatajs-4.0.0"
], function (Helper, Olingo) {
	"use strict";
	/*global odatajs */

	var rCollection = /^Collection\((.*)\)$/,
		mFacets = {
			"maxLength" : "MaxLength",
			"precision" : "Precision",
			"scale" : "Scale"
		},
		OlingoDocument;

	OlingoDocument = {
		/**
		 * Finds the complex type in the Olingo metadata document.
		 *
		 * @param {object} oDocument
		 *   the Olingo metadata document
		 * @param {string} sQualifiedName
		 *   the qualified name of the complex type
		 * @return {object}
		 *   the complex type
		 * @throws Error if no complex type with this name could be found
		 * @private
		 */
		findComplexType: function (oDocument, sQualifiedName) {
			var i = sQualifiedName.lastIndexOf("."),
			oResult,
			sSchemaName = sQualifiedName.substring(0, i),
			oSchema = Helper.findInArray(oDocument.dataServices.schema, "namespace", sSchemaName),
			sTypeName = sQualifiedName.substring(i + 1);

			if (oSchema) {
				oResult = Helper.findInArray(oSchema.complexType, "name", sTypeName);
				if (oResult) {
					return oResult;
				}
			}
			throw new Error("Unknown complex type: " + sQualifiedName);
		},

		/**
		 * Finds the entity type in the Olingo metadata document.
		 *
		 * @param {object} oDocument
		 *   the Olingo metadata document
		 * @param {string} sQualifiedName
		 *   the qualified name of the entity type
		 * @return {object}
		 *   the entity type
		 * @throws Error if no entity type can be found
		 *
		 * @private
		 */
		findEntityType : function (oDocument, sQualifiedName) {
			var i = sQualifiedName.lastIndexOf("."),
				oResult,
				sSchemaName = sQualifiedName.substring(0, i),
				oSchema = Helper.findInArray(oDocument.dataServices.schema, "namespace",
					sSchemaName),
				sTypeName = sQualifiedName.substring(i + 1);

			if (oSchema) {
				oResult = Helper.findInArray(oSchema.entityType, "name", sTypeName);
				if (oResult) {
					return oResult;
				}
			}
			throw new Error("Unknown entity type: " + sQualifiedName);
		},

		/**
		 * Finds the schema containing the entity container in the Olingo metadata document.
		 *
		 * @param {object} oDocument
		 *   the Olingo metadata document
		 * @return {object}
		 *   the schema containing entity container
		 * @throws Error if the entity container cannot be found
		 * @private
		 */
		findSchemaWithEntityContainer : function (oDocument) {
			var oSchema, i;

			for (i = 0; i < oDocument.dataServices.schema.length; i++) {
				oSchema = oDocument.dataServices.schema[i];
				if ("entityContainer" in oSchema) {
					return oSchema;
				}
			}
			throw new Error("EntityContainer not found");
		},

		/**
		 * Determines the schema name from the qualified name.
		 *
		 * @param {string} sQualifiedName
		 *   a qualified name
		 * @returns {string}
		 *   the schema name
		 */
		getSchemaName : function (sQualifiedName) {
			var i = sQualifiedName.lastIndexOf('.');
			return i >= 0 ? sQualifiedName.slice(0, i) : "";
		},

		/**
		 * Strips off the simple name which is separated from the qualifying part via a dot.
		 *
		 * @param {string} sQualifiedName
		 *   a qualified name
		 * @returns {string}
		 *   the unqualified name
		 */
		getUnqualifiedName : function (sQualifiedName) {
			var i = sQualifiedName.lastIndexOf('.');
			return i >= 0 ? sQualifiedName.slice(i + 1) : sQualifiedName;
		},

		/**
		 * Parses a type reference in a (navigation) property.
		 * @param {string} sTypeRef
		 *   the type reference (either "Edm.String" or "Collection(Edm.String)")
		 * @returns {object}
		 *  an object with the properties {boolean} collection, {string} qualifiedName
		 */
		parseTypeRef : function (sTypeRef) {
			var aMatches = rCollection.exec(sTypeRef);

			return {
				collection: !!aMatches,
				qualifiedName: aMatches ? aMatches[1] : sTypeRef
			};
		},

		/**
		 * Returns a Promise for the metadata document. Reads it from
		 * <code>oModel.sDocumentUrl</code> via the Olingo metadata handler with the first request.
		 * Caches it and responds subsequent queries from the cache.
		 *
		 * @param {sap.ui.model.odata.v4.oDataDocumentModel} oModel
		 *   the model
		 * @returns {Promise}
		 *   a promise to be resolved with the metadata document
		 */
		requestDocument : function (oModel) {
			if (!oModel._oDocumentPromise) {
				oModel._oDocumentPromise = new Promise(function (fnResolve, fnReject) {
					odatajs.oData.request({
						requestUri: oModel.sDocumentUrl
					}, function (oDocument) {
						fnResolve(oDocument);
					}, function (oError) {
						var sMessage = Helper.handleODataError(oError, "Could not read metadata",
								"sap.ui.model.odata.v4.ODataDocumentModel");
						fnReject(new Error(sMessage));
					},  odatajs.oData.metadataHandler);
				});
			}
			return oModel._oDocumentPromise;
		},

		/**
		 * Finds the entity container in the Olingo metadata document and transforms it to the Edmx
		 * format. EntitySets and Singletons are inserted.
		 *
		 * @param {object} oDocument
		 *   the Olingo metadata document
		 * @return {object}
		 *   the entity container
		 * @private
		 */
		transformEntityContainer : function (oDocument) {
			var oSchema = OlingoDocument.findSchemaWithEntityContainer(oDocument),
				oEntityContainer = oSchema.entityContainer,
				oResult = {
					"Name" : oEntityContainer.name,
					"QualifiedName" : oSchema.namespace + "." + oEntityContainer.name,
					"EntitySets" : [],
					"Singletons" : []
				};

			if (oEntityContainer.entitySet) {
				oEntityContainer.entitySet.forEach(function(oEntitySet) {
					oResult.EntitySets.push({
						"Name" : oEntitySet.name,
						"Fullname" : oResult.QualifiedName + "/" + oEntitySet.name,
						"EntityType@odata.navigationLink" :
							"Types(QualifiedName='" + oEntitySet.entityType + "')"
					});
				});
			}
			if (oEntityContainer.singleton) {
				oEntityContainer.singleton.forEach(function(oSingleton) {
					oResult.Singletons.push({
						"Name" : oSingleton.name,
						"Fullname" : oResult.QualifiedName + "/" + oSingleton.name,
						"Type@odata.navigationLink" :
							"Types(QualifiedName='" + oSingleton.type + "')"
					});
				});
			}
			return oResult;
		},

		/**
		 * Finds the entity type in the Olingo metadata document and transforms it to the Edmx
		 * format.
		 *
		 * @param {object} oDocument
		 *   the Olingo metadata document
		 * @param {string} sQualifiedName
		 *   the qualified name of the entity type
		 * @return {object}
		 *   the entity type or <code>undefined</code> if not found
		 * @private
		 */
		transformEntityType : function (oDocument, sQualifiedName) {
			var oEntityType = OlingoDocument.findEntityType(oDocument, sQualifiedName),
				i,
				oResult = OlingoDocument.transformStructuredType(oDocument, sQualifiedName,
					oEntityType),
				oSourceProperty,
				oTargetProperty,
				oTypeRef;

			oResult.Key = [];
			oResult.NavigationProperties = [];
			for (i = 0; i < oEntityType.key[0].propertyRef.length; i++) {
				oResult.Key.push({"PropertyPath" : oEntityType.key[0].propertyRef[i].name});
			}
			for (i = 0; i < oEntityType.navigationProperty.length; i++) {
				oSourceProperty = oEntityType.navigationProperty[i];
				oTypeRef = OlingoDocument.parseTypeRef(oSourceProperty.type);
				oTargetProperty = {
					"Name" : oSourceProperty.name,
					"Fullname" : sQualifiedName + "/" + oSourceProperty.name,
					"Nullable" : oSourceProperty.nullable === "true",
					"ContainsTarget" : false,
					"IsCollection" : oTypeRef.collection,
					"Type@odata.navigationLink" :
						"Types(QualifiedName='" + oTypeRef.qualifiedName + "')"
				};
				oResult.NavigationProperties.push(oTargetProperty);
			}

			return oResult;
		},

		/**
		 * Transforms the structured type in Olingo meta data format to the Edmx format.
		 *
		 * @param {object} oDocument
		 *   the Olingo metadata document
		 * @param {string} sQualifiedName
		 *   the qualified name of the structured type
		 * @param {object} oType
		 *   the type as found in the Olingo document
		 * @return {object}
		 *   the structured type
		 * @private
		 */
		transformStructuredType: function (oDocument, sQualifiedName, oType) {
			var sFacet,
				i,
				oResult = {
					"Name" : oType.name,
					"QualifiedName" : sQualifiedName,
					"Abstract" : false,
					"OpenType" : false,
					"Properties" : []
				},
				oSourceProperty,
				oTargetProperty;

			for (i = 0; i < oType.property.length; i++) {
				oSourceProperty = oType.property[i];
				oTargetProperty = {
					"Name" : oSourceProperty.name,
					"Fullname" : sQualifiedName + "/" + oSourceProperty.name,
					"Nullable" : oSourceProperty.nullable === "true",
					"Facets" : [],
					"Type" : OlingoDocument.transformType(oDocument, oSourceProperty.type)
				};
				for (sFacet in mFacets) {
					if (sFacet in oSourceProperty) {
						oTargetProperty.Facets.push({
							"Name" : mFacets[sFacet],
							"Value" : oSourceProperty[sFacet]
						});
					}
				}
				oResult.Properties.push(oTargetProperty);
			}
			return oResult;
		},

		/**
		 * Finds the property type in the Olingo metadata and transforms it to the Edmx format.
		 *
		 * @param {object} oDocument
		 *   the Olingo metadata document
		 * @param {string} sQualifiedName
		 *   the qualified name of the property type
		 * @return {object}
		 *   the property type or <code>undefined</code> if not found
		 * @private
		 */
		transformType: function (oDocument, sQualifiedName) {
			if (OlingoDocument.getSchemaName(sQualifiedName) === "Edm") {
				return {
					"Name" : OlingoDocument.getUnqualifiedName(sQualifiedName),
					"QualifiedName" : sQualifiedName
				};
			}
			return OlingoDocument.transformStructuredType(oDocument, sQualifiedName,
				OlingoDocument.findComplexType(oDocument, sQualifiedName));
		}
	};

	return OlingoDocument;
}, /* bExport= */ false);
