/*!
 * ${copyright}
 */

sap.ui.define([
	"./_ODataHelper",
	"sap/ui/thirdparty/odatajs-4.0.0"
], function (Helper, Olingo) {
	"use strict";
	/*global odatajs */

	var mFacets = {
			"maxLength" : "MaxLength",
			"precision" : "Precision",
			"scale" : "Scale"
		},
		OlingoDocument;

	OlingoDocument = {
		/**
		 * Finds the entity set in the Olingo metadata document.
		 *
		 * @param {object} oDocument
		 *   the Olingo metadata document
		 * @param {string} sFullName
		 *   the full name of the entity set
		 * @return {object}
		 *   the entity set or <code>undefined</code> if not found
		 * @private
		 */
		findEntitySet : function (oDocument, sFullName) {
			var oSchema = OlingoDocument.findSchemaWithEntityContainer(oDocument),
				oEntityContainer = oSchema.entityContainer,
				aParts = sFullName.split("/"),
				oResult,
				sContainerName = aParts[0],
				sSetName = aParts[1];

			if (sContainerName === oSchema.namespace + "." + oEntityContainer.name) {
				oResult = Helper.findInArray(oEntityContainer.entitySet, "name", sSetName);
				if (oResult) {
					return oResult;
				}
			}
			throw new Error("Unknown entity set: " + sFullName);
		},

		/**
		 * Finds the entity type in the Olingo metadata document.
		 *
		 * @param {object} oDocument
		 *   the Olingo metadata document
		 * @param {string} sQualifiedName
		 *   the qualified name of the entity type
		 * @return {object}
		 *   the entity type or <code>undefined</code> if not found
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
		 * Returns a Promise for the metadata document. Reads it from
		 * <code>oModel.sDocumentUrl</code> via the Olingo metadata handler with the first request.
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
		 * format.
		 *
		 * @param {object} oDocument
		 *   the Olingo metadata document
		 * @return {object}
		 *   the entity container
		 * @private
		 */
		transformEntityContainer : function (oDocument) {
			var oSchema = OlingoDocument.findSchemaWithEntityContainer(oDocument),
				oEntityContainer = oSchema.entityContainer;
			return {
				"Name" : oEntityContainer.name,
				"QualifiedName" : oSchema.namespace + "." + oEntityContainer.name
			};
		},

		/**
		 * Finds the entity set in the Olingo metadata document and transforms it to the Edmx
		 * format.
		 *
		 * @param {object} oDocument
		 *   the Olingo metadata document
		 * @param {string} sFullName
		 *   the full name of the entity set
		 * @return {object}
		 *   the entity set or <code>undefined</code> if not found
		 * @private
		 */
		transformEntitySet : function (oDocument, sFullName) {
			var oEntitySet = OlingoDocument.findEntitySet(oDocument, sFullName);

			return {
				"Name" : oEntitySet.name,
				"Fullname" : sFullName,
				"EntityType" : OlingoDocument.transformEntityType(oDocument, oEntitySet.entityType)
			};
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
				sFacet,
				i,
				oResult = {
					"Name" : oEntityType.name,
					"QualifiedName" :  sQualifiedName,
					"Abstract" : false,
					"OpenType" : false,
					"Key" : [],
					"Properties" : [],
					"NavigationProperties" : []
				},
				oSourceProperty,
				oTargetProperty;

			for (i = 0; i < oEntityType.key[0].propertyRef.length; i++) {
				oResult.Key.push({"PropertyPath" : oEntityType.key[0].propertyRef[i].name});
			}
			for (i = 0; i < oEntityType.property.length; i++) {
				oSourceProperty = oEntityType.property[i];
				oTargetProperty = {
					"Name" : oSourceProperty.name,
					"Fullname" : sQualifiedName + "/" + oSourceProperty.name,
					"Nullable" : oSourceProperty.nullable === "true",
					"Facets" : [],
					"Type" : {
						"Name" : OlingoDocument.unqualifiedName(oSourceProperty.type),
						"QualifiedName" : oSourceProperty.type
					}
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
			for (i = 0; i < oEntityType.navigationProperty.length; i++) {
				oSourceProperty = oEntityType.navigationProperty[i];
				oTargetProperty = {
					"Name" : oSourceProperty.name,
					"Fullname" : sQualifiedName + "/" + oSourceProperty.name,
					"Nullable" : oSourceProperty.nullable === "true",
					"ContainsTarget" : false,
					"IsCollection" : oSourceProperty.type.indexOf("Collection(") === 0
				};
				oResult.NavigationProperties.push(oTargetProperty);
			}

			return oResult;
		},

		/**
		 * Strips off the simple name which is separated from the qualifying part via a dot.
		 *
		 * @param {string} sQualifiedName
		 *   a qualified name
		 * @returns {string}
		 *   the unqualified name
		 */
		unqualifiedName : function (sQualifiedName) {
			var i = sQualifiedName.lastIndexOf('.');
			return i >= 0 ? sQualifiedName.substring(i + 1) : sQualifiedName;
		}
	};

	return OlingoDocument;
}, /* bExport= */ false);
