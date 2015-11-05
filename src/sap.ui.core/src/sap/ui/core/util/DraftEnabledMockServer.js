/*
 * ${copyright}
 */
sap.ui.define(["jquery.sap.global", "sap/ui/Device", "sap/ui/core/util/MockServer"], function(jQuery, Device, MockServer) {
	"use strict";
	return {

		_oDraftMetadata: {},
		_oConstants: {
			COM_SAP_VOCABULARIES_COMMON_V1_DRAFTROOT: "com.sap.vocabularies.Common.v1.DraftRoot",
			COM_SAP_VOCABULARIES_COMMON_V1_DRAFTNODE: "com.sap.vocabularies.Common.v1.DraftNode",
			COM_SAP_VOCABULARIES_COMMON_V1_SEMANTICKEY: "com.sap.vocabularies.Common.v1.SemanticKey",
			EMPTY_GUID: "00000000-0000-0000-0000-000000000000",
			SIBLINGENTITY_NAVIGATION: "SiblingEntity",
			DRAFT_ADMINISTRATIVE_DATA: "DraftAdministrativeData",
			DRAFT_ADMINISTRATIVE_DATA_UUID: "DraftAdministrativeDataUUID",
			ACTIVATION_ACTION: "ActivationAction",
			EDIT_ACTION: "EditAction",
			VALIDATE_ACTION: "ValidationFunction",
			PREPARE_ACTION: "PreparationAction"
		},

		/**
		 * Enriches MockServer with draft capablities based on the given OData service annotations.
		 * @param {object} oAnnotations annotation object of sap.ui.model.odata.ODataModel
		 * @param {object} oMockServer
		 */
		handleDraft: function(oAnnotations, oMockServer) {
			// callback function to update draft specific properties post creation
			var fnNewDraftPost = function(oEvent) {
				var oNewEntity = oEvent.getParameter("oEntity");
				oNewEntity.IsActiveEntity = false;
				oNewEntity.HasActiveEntity = false;
				oNewEntity.HasDraftEntity = false;
			};
			// callback function to update draft specific properties pre deletion
			var fnDraftDelete = function(oEvent) {
				var oXhr = oEvent.getParameter("oXhr");
				var oEntry = jQuery.sap.sjax({
					url: oXhr.url,
					dataType: "json"
				}).data.d;
				// navigate to draft nodes and delete nodes
				for (var i = 0; i < this._oDraftMetadata.draftNodes.length; i++) {
					for (var navprop in this._mEntitySets[this._oDraftMetadata.draftRootName].navprops) {
						if (this._mEntitySets[this._oDraftMetadata.draftRootName].navprops[navprop].to.entitySet === this._oDraftMetadata.draftNodes[i]) {
							var oResponse = jQuery.sap.sjax({
								url: oEntry[navprop].__deferred.uri,
								dataType: "json"
							});
							if (oResponse.data && oResponse.data.d && oResponse.data.d.results) {
								var oNode;
								for (var j = 0; j < oResponse.data.d.results.length; j++) {
									oNode = oResponse.data.d.results[j];
									jQuery.sap.sjax({
										url: oNode.__metadata.uri,
										type: "DELETE"
									});
								}
							}
						}
					}
				}
			};
			if (oAnnotations && oAnnotations.EntityContainer) {
				var oEntitySetsAnnotations = oAnnotations.EntityContainer[Object.keys(oAnnotations.EntityContainer)[0]];
				//iterate over entitysets annotations
				for (var sEntityset in oEntitySetsAnnotations) {
					//get entity set annotations and look for DraftRoot annotation
					var oEntitySetAnnotations = oEntitySetsAnnotations[sEntityset];
					if (oEntitySetAnnotations[this._oConstants.COM_SAP_VOCABULARIES_COMMON_V1_DRAFTROOT]) {
						this._oDraftMetadata.draftRootName = sEntityset;
						this._oDraftMetadata.annotations = oAnnotations;
						this._oDraftMetadata.draftRootActivationName = oEntitySetAnnotations[this._oConstants.COM_SAP_VOCABULARIES_COMMON_V1_DRAFTROOT][this
							._oConstants.ACTIVATION_ACTION
						].String;
						if (this._oDraftMetadata.draftRootActivationName) {
							this._oDraftMetadata.draftRootActivationName = this._oDraftMetadata.draftRootActivationName.substring(this._oDraftMetadata.draftRootActivationName
								.lastIndexOf("/") + 1);
						}
						this._oDraftMetadata.draftRootEditName = oEntitySetAnnotations[this._oConstants.COM_SAP_VOCABULARIES_COMMON_V1_DRAFTROOT][this
							._oConstants.EDIT_ACTION
						].String;
						if (this._oDraftMetadata.draftRootEditName) {
							this._oDraftMetadata.draftRootEditName = this._oDraftMetadata.draftRootEditName.substring(this._oDraftMetadata.draftRootEditName
								.lastIndexOf("/") + 1);
						}
						this._oDraftMetadata.draftRootValidationName = oEntitySetAnnotations[this._oConstants.COM_SAP_VOCABULARIES_COMMON_V1_DRAFTROOT][this
							._oConstants.VALIDATE_ACTION
						].String;
						if (this._oDraftMetadata.draftRootValidationName) {
							this._oDraftMetadata.draftRootValidationName = this._oDraftMetadata.draftRootValidationName.substring(this._oDraftMetadata.draftRootValidationName
								.lastIndexOf("/") + 1);
						}
						this._oDraftMetadata.draftRootPreparationtionName = oEntitySetAnnotations[this._oConstants.COM_SAP_VOCABULARIES_COMMON_V1_DRAFTROOT]
						[this
							._oConstants.PREPARE_ACTION
						].String;
						if (this._oDraftMetadata.draftRootPreparationtionName) {
							this._oDraftMetadata.draftRootPreparationtionName = this._oDraftMetadata.draftRootPreparationtionName.substring(this._oDraftMetadata
								.draftRootPreparationtionName
								.lastIndexOf("/") + 1);
						}
						// extend the mockserver with addtional draft functionality encapsulated in this file
						jQuery.extend(oMockServer, this);
						// A new draft is created with a POST request on the entity set for the root entities.
						oMockServer.attachAfter(MockServer.HTTPMETHOD.POST, fnNewDraftPost, this._oDraftMetadata.draftRootName);
						// A new draft can be deleted with a DELETE request to the root entity of the new draft; the root entity and all dependent entities will be deleted
						oMockServer.attachBefore(MockServer.HTTPMETHOD.DELETE, fnDraftDelete, this._oDraftMetadata.draftRootName);
						// Active documents without a related draft should return null for DraftAdministrativeData
						oMockServer.attachAfter(MockServer.HTTPMETHOD.GET, this._fnDraftAdministrativeData, this._oDraftMetadata.draftRootName);
					}
				}
			}
		},

		/**
		 * Returns an array with key of the corresponding "draft-less" entity type
		 * @param {string} sEntityset name of the entityset
		 * @param {object} mEntitySets
		 * @return {object} array with key of the corresponding "draft-less" entity type
		 */
		_calcSemanticKeys: function(sEntityset, mEntitySets) {
			var aSemanticKey;
			for (var annotationsProperty in this._oDraftMetadata.annotations) {
				if (annotationsProperty.lastIndexOf(mEntitySets[sEntityset].type) > -1) {
					aSemanticKey = this._oDraftMetadata.annotations[annotationsProperty][this._oConstants.COM_SAP_VOCABULARIES_COMMON_V1_SEMANTICKEY];
					break;
				}
			}
			var aSemanticKeys = [];
			var element;
			for (var i = 0; i < aSemanticKey.length; i++) {
				element = aSemanticKey[i];
				for (var key in element) {
					aSemanticKeys.push(element[key]);
				}
			}
			return aSemanticKeys;
		},

		/**
		 * Calculates the draft key of the draft root entityset and a list of all draft nodes
		 * @param {object} mEntitySets
		 */
		_prepareDraftMetadata: function(mEntitySets) {
			var that = this;
			this._oDraftMetadata.draftNodes = [];
			this._oDraftMetadata.draftRootKey = jQuery.grep(mEntitySets[this._oDraftMetadata.draftRootName].keys, function(x) {
				return jQuery.inArray(x, that._calcSemanticKeys(that._oDraftMetadata.draftRootName, mEntitySets)) < 0;
			})[0];
			var oAnnotations = that._oDraftMetadata.annotations;
			var oEntitySetsAnnotations = oAnnotations.EntityContainer[Object.keys(oAnnotations.EntityContainer)[0]];
			//iterate over entitysets annotations
			for (var sEntityset in oEntitySetsAnnotations) {
				//get entity set
				var oEntitySetAnnotations = oEntitySetsAnnotations[sEntityset];
				//iterate over annotations of entity set annotations and look for the draft node sets
				if (oEntitySetAnnotations[that._oConstants.COM_SAP_VOCABULARIES_COMMON_V1_DRAFTNODE]) {
					this._oDraftMetadata.draftNodes.push(sEntityset);
				}
			}
			for (var j = 0; j < this._oDraftMetadata.draftNodes.length; j++) {
				this.attachAfter(MockServer.HTTPMETHOD.GET, this._fnDraftAdministrativeData, this._oDraftMetadata.draftNodes[j]);
			}
		},

		_fnDraftAdministrativeData: function(oEvent) {
			var oEntry = {};
			var aData = oEvent.getParameter("oFilteredData");
			if (!aData) {
				oEntry = oEvent.getParameter("oEntry");
				if (oEntry.IsActiveEntity && !oEntry.HasDraftEntity) {
					oEntry[this._oConstants.DRAFT_ADMINISTRATIVE_DATA] = null;
				}
			} else {
				if (aData.results) {
					aData = aData.results;
				} else {
					if (jQuery.isEmptyObject(aData)) {
						aData = null;
						return;
					}
				}
				for (var i = 0; i < aData.length; i++) {
					oEntry = aData[i];
					if (oEntry.IsActiveEntity && !oEntry.HasDraftEntity) {
						oEntry[this._oConstants.DRAFT_ADMINISTRATIVE_DATA] = null;
					}
				}
			}

		},

		/**
		 * Handles draft mock data generation
		 * @param {object} mEntitySets
		 */
		_handleDraftArtifacts: function(mEntitySets) {
			var that = this;
			var oMockdata = this._oMockdata;
			var aDraftRoot = oMockdata[this._oDraftMetadata.draftRootName];
			var fnGrep = function(aContains, aContained) {
				return jQuery.grep(aContains, function(x) {
					return jQuery.inArray(x, aContained) < 0;
				})[0];
			};
			if (aDraftRoot.length === 100) {
				for (var i = 0; i < aDraftRoot.length; i++) {
					var oEntity = aDraftRoot[i];
					// active documents without a draft (0-24)
					if (i < 25) {
						oEntity.IsActiveEntity = true; // true for active documents
						oEntity.HasActiveEntity = false; // false for new drafts and active documents
						oEntity.HasDraftEntity = false; // false for active document without a draft
						oEntity[this._oDraftMetadata.draftRootKey] = this._oConstants.EMPTY_GUID;
						if (oEntity[this._oConstants.DRAFT_ADMINISTRATIVE_DATA_UUID]) {
							oEntity[this._oConstants.DRAFT_ADMINISTRATIVE_DATA_UUID] = null;
						}
						var aDraftNodes = [];
						var aSemanticDraftNodeKeys = [];
						for (var j = 0; j < this._oDraftMetadata.draftNodes.length; j++) {
							aSemanticDraftNodeKeys = this._calcSemanticKeys(this._oDraftMetadata.draftNodes[j], mEntitySets);
							aDraftNodes = oMockdata[this._oDraftMetadata.draftNodes[j]];
							// changing the values if there is a referential constraint
							var oEntitySet = mEntitySets[this._oDraftMetadata.draftRootName];
							for (var navprop in oEntitySet.navprops) {
								var oNavProp = oEntitySet.navprops[navprop];
								if (oNavProp.to.entitySet === this._oDraftMetadata.draftNodes[j]) {
									var iPropRefLength = oNavProp.from.propRef.length;
									for (var k = 0; k < iPropRefLength; k++) {
										// copy the value from the principle to the dependant;
										aDraftNodes[i][oNavProp.to.propRef[k]] = oEntity[oNavProp.from.propRef[k]];
									}
								}
							}
							aDraftNodes[i].IsActiveEntity = true;
							aDraftNodes[i].HasActiveEntity = false;
							aDraftNodes[i].HasDraftEntity = false;
							aDraftNodes[i][this._oDraftMetadata.draftRootKey] = this._oConstants.EMPTY_GUID;
							if (aDraftNodes[i][this._oConstants.DRAFT_ADMINISTRATIVE_DATA_UUID]) {
								aDraftNodes[i][this._oConstants.DRAFT_ADMINISTRATIVE_DATA_UUID] = null;
							}
							var sDraftKey = fnGrep(mEntitySets[this._oDraftMetadata.draftNodes[j]].keys, aSemanticDraftNodeKeys);
							aDraftNodes[i][sDraftKey] = this._oConstants.EMPTY_GUID;
						}
						// new drafts without corresponding active documents (25-49)
					} else if (i < 50) {
						oEntity.IsActiveEntity = false;
						oEntity.HasActiveEntity = false;
						oEntity.HasDraftEntity = false;
						aDraftNodes = [];
						aSemanticDraftNodeKeys = [];
						for (var j = 0; j < this._oDraftMetadata.draftNodes.length; j++) {
							aSemanticDraftNodeKeys = this._calcSemanticKeys(this._oDraftMetadata.draftNodes[j], mEntitySets);
							aDraftNodes = oMockdata[this._oDraftMetadata.draftNodes[j]];
							// changing the values if there is a referential constraint
							var oEntitySet = mEntitySets[this._oDraftMetadata.draftRootName];
							for (var navprop in oEntitySet.navprops) {
								var oNavProp = oEntitySet.navprops[navprop];
								if (oNavProp.to.entitySet === this._oDraftMetadata.draftNodes[j]) {
									var iPropRefLength = oNavProp.from.propRef.length;
									for (var k = 0; k < iPropRefLength; k++) {
										// copy the value from the principle to the dependant;
										aDraftNodes[i][oNavProp.to.propRef[k]] = oEntity[oNavProp.from.propRef[k]];
									}
								}
							}
							aDraftNodes[i].IsActiveEntity = false;
							aDraftNodes[i].HasActiveEntity = false;
							aDraftNodes[i].HasDraftEntity = false;
							sDraftKey = fnGrep(mEntitySets[this._oDraftMetadata.draftNodes[j]].keys, aSemanticDraftNodeKeys);
						}
						// active documents with a corresponding draft document, a.k.a edit drafts (50-74)
					} else if (i < 75) {
						var oSiblingEntity = jQuery.extend(true, {}, oEntity);
						oEntity.IsActiveEntity = true; // true for active documents
						oEntity.HasActiveEntity = false; // false for new drafts and active documents
						oEntity.HasDraftEntity = true; // false for active document without a draft
						oEntity[this._oDraftMetadata.draftRootKey] = this._oConstants.EMPTY_GUID;
						aDraftNodes = [];
						aSemanticDraftNodeKeys = [];
						for (var j = 0; j < this._oDraftMetadata.draftNodes.length; j++) {
							aSemanticDraftNodeKeys = this._calcSemanticKeys(this._oDraftMetadata.draftNodes[j], mEntitySets);
							aDraftNodes = oMockdata[this._oDraftMetadata.draftNodes[j]];
							// changing the values if there is a referential constraint
							var oEntitySet = mEntitySets[this._oDraftMetadata.draftRootName];
							for (var navprop in oEntitySet.navprops) {
								var oNavProp = oEntitySet.navprops[navprop];
								if (oNavProp.to.entitySet === this._oDraftMetadata.draftNodes[j]) {
									var iPropRefLength = oNavProp.from.propRef.length;
									for (var k = 0; k < iPropRefLength; k++) {
										// copy the value from the principle to the dependant;
										aDraftNodes[i][oNavProp.to.propRef[k]] = oEntity[oNavProp.from.propRef[k]];
									}
								}
							}
							aDraftNodes[i].IsActiveEntity = true;
							aDraftNodes[i].HasActiveEntity = false;
							aDraftNodes[i].HasDraftEntity = true;
							sDraftKey = fnGrep(mEntitySets[this._oDraftMetadata.draftNodes[j]].keys, aSemanticDraftNodeKeys);
							aDraftNodes[i][sDraftKey] = this._oConstants.EMPTY_GUID;
						}
						oSiblingEntity.IsActiveEntity = false;
						oSiblingEntity.HasActiveEntity = true;
						oSiblingEntity.HasDraftEntity = false;
						aDraftRoot[i + 25] = oSiblingEntity;
					}
				}
			}
			var sRootUri = this._getRootUri();
			jQuery.each(mEntitySets, function(sEntitySetName, oEntitySet) {
				jQuery.each(oMockdata[sEntitySetName], function(iIndex, oEntry) {
					// add the metadata for the entry
					oEntry.__metadata = {
						uri: sRootUri + sEntitySetName + "(" + that._createKeysString(oEntitySet, oEntry) + ")",
						type: oEntitySet.schema + "." + oEntitySet.type
					};
					// add the navigation properties
					jQuery.each(oEntitySet.navprops, function(sKey) {
						oEntry[sKey] = {
							__deferred: {
								uri: sRootUri + sEntitySetName + "(" + that._createKeysString(oEntitySet, oEntry) + ")/" + sKey
							}
						};
					});
				});
			});
		},

		/**
		 * Activates a draft document
		 * @param {object} oEntry the draft document
		 */
		_activate: function(oEntry) {
			var oResponse;
			var fnGrep = function(aContains, aContained) {
				return jQuery.grep(aContains, function(x) {
					return jQuery.inArray(x, aContained) < 0;
				})[0];
			};
			// navigate to draft nodes and activate nodes
			for (var i = 0; i < this._oDraftMetadata.draftNodes.length; i++) {
				for (var navprop in this._mEntitySets[this._oDraftMetadata.draftRootName].navprops) {
					if (this._mEntitySets[this._oDraftMetadata.draftRootName].navprops[navprop].to.entitySet === this._oDraftMetadata.draftNodes[i]) {
						oResponse = jQuery.sap.sjax({
							url: oEntry[navprop].__deferred.uri,
							dataType: "json"
						});
						if (oResponse.success && oResponse.data && oResponse.data.d && oResponse.data.d.results) {
							var oNode;
							for (var j = 0; i < oResponse.data.d.results.length; j++) {
								oNode = oResponse.data.d.results[j];
								oNode.IsActiveEntity = true;
								oNode.HasActiveEntity = false;
								oNode.HasDraftEntity = false;
								oNode[this._oDraftMetadata.draftRootKey] = this._oConstants.EMPTY_GUID;
								var aSemanticDraftNodeKeys = this._calcSemanticKeys(this._oDraftMetadata.draftNodes[i], this._mEntitySets);
								var sDraftKey = fnGrep(this._mEntitySets[this._oDraftMetadata.draftNodes[i]].keys, aSemanticDraftNodeKeys);
								oNode[sDraftKey] = this._oConstants.EMPTY_GUID;
								jQuery.sap.sjax({
									url: oNode.__metadata.uri,
									type: "PATCH",
									data: JSON.stringify(oNode)
								});
							}
						}
					}
				}
			}
			oEntry.IsActiveEntity = true;
			oEntry.HasActiveEntity = false;
			oEntry.HasDraftEntity = false;
			oEntry[this._oDraftMetadata.draftRootKey] = this._oConstants.EMPTY_GUID;
			jQuery.sap.sjax({
				url: oEntry.__metadata.uri,
				type: "PATCH",
				data: JSON.stringify(oEntry)
			});
			return oEntry;
		},

		// =================================
		// overriden functions of MockServer
		// =================================

		setRequests: function(aRequests) {
			var that = this;
			aRequests.push({
				method: "POST",
				path: new RegExp(that._oDraftMetadata.draftRootActivationName),
				response: function(oXhr) {
					var oRequestBody = JSON.parse(oXhr.requestBody);
					var aFilter = [];
					for (var property in oRequestBody) {
						aFilter.push(property + " eq " + oRequestBody[property]);
					}
					var oResponse = jQuery.sap.sjax({
						url: that.getRootUri() + that._oDraftMetadata.draftRootName + "?$filter=" + aFilter.join(" and "),
						dataType: "json"
					});
					if (!oResponse.success || !oResponse.data.d.results[0]) {
						// respond negative - no entity found
						oXhr.respond(404);
					}
					var oEntry = oResponse.data.d.results[0];
					if (oEntry.IsActiveEntity) {
						// respond negative - trying to activate an already active entity
						oXhr.respond(400);
					}
					if (oEntry.HasActiveEntity) {
						// edit draft activiation --> delete active sibling
						var oSiblingEntityUri = oEntry.SiblingEntity.__deferred.uri;
						oResponse = jQuery.sap.sjax({
							url: oSiblingEntityUri,
							dataType: "json"
						});
						if (oResponse.success && oResponse.data) {
							var oSibling = oResponse.data.d;
							oResponse = jQuery.sap.sjax({
								url: oSibling.__metadata.uri,
								type: "DELETE"
							});
						}
					}

					oEntry = that._activate(oEntry);

					oXhr.respondJSON(200, {}, JSON.stringify({
						d: oEntry
					}));
					return true;
				}
			});
			aRequests.push({
				method: "POST",
				path: new RegExp(that._oDraftMetadata.draftRootEditName + "(\\?(.*))?"),
				response: function(oXhr, sUrlParams) {
					var aFilter = [];
					var oRequestBody = JSON.parse(oXhr.requestBody);
					if (oRequestBody && !jQuery.isEmptyObject(oRequestBody)) {
						for (var property in oRequestBody) {
							aFilter.push(property + " eq " + oRequestBody[property]);
						}
					} else {
						var aUrlParams = decodeURIComponent(sUrlParams).replace("?", "&").split("&");

						for (var param in aUrlParams) {
							var sParamValue = aUrlParams[param];
							var rKeyValue = new RegExp("(.*)=(.*)");
							var aRes;
							if (sParamValue) {
								aRes = rKeyValue.exec(sParamValue);
								aFilter.push(aRes[1] + " eq " + aRes[2]);
							}
						}
					}
					var oResponse = jQuery.sap.sjax({
						url: that.getRootUri() + that._oDraftMetadata.draftRootName + "?$filter=" + aFilter.join(" and "),
						dataType: "json"
					});
					if (!oResponse.success || !oResponse.data.d.results[0]) {
						// respond negative - no entity found
						oXhr.respond(404);
					}
					var oEntry = oResponse.data.d.results[0];
					if (!oEntry.IsActiveEntity || oEntry.HasDraftEntity) {
						// respond negative - edit draft is only valid for an active document. If a business document already has an edit draft,
						// the Edit action fails; there can be at most one edit draft per active business document.
						oXhr.respond(400);
					}
					//  creates a deep copy of the business document.
					var oDraftEntry = jQuery.extend(true, {}, oEntry);
					oDraftEntry.IsActiveEntity = false; // true for active documents
					oDraftEntry.HasActiveEntity = true; // false for new drafts and active documents
					oDraftEntry.HasDraftEntity = false;
					oDraftEntry[that._oDraftMetadata.draftRootKey] = that._generatePropertyValue(that._oDraftMetadata.draftRootKey, "Guid");

					// add the metadata for the entry
					var sRootUri = that._getRootUri();
					var oEntitySet = that._mEntitySets[that._oDraftMetadata.draftRootName];
					oDraftEntry.__metadata = {
						uri: sRootUri + that._oDraftMetadata.draftRootName + "(" + that._createKeysString(oEntitySet,
							oDraftEntry) + ")",
						type: oEntitySet.schema + "." + oEntitySet.type
					};
					// add the navigation properties
					jQuery.each(oEntitySet.navprops, function(sKey) {
						oDraftEntry[sKey] = {
							__deferred: {
								uri: sRootUri + that._oDraftMetadata.draftRootName + "(" + that._createKeysString(oEntitySet, oDraftEntry) + ")/" + sKey
							}
						};
					});
					that._oMockdata[that._oDraftMetadata.draftRootName].push(oDraftEntry);
					// update the active with HasDraftEntity = true
					oResponse = jQuery.sap.sjax({
						url: oEntry.__metadata.uri,
						type: "PATCH",
						data: JSON.stringify({
							HasDraftEntity: true
						})
					});
					oXhr.respondJSON(200, {}, JSON.stringify({
						d: oDraftEntry
					}));
					return true;
				}
			});
			aRequests.push({
				method: "GET",
				path: new RegExp(that._oDraftMetadata.draftRootValidationName + "(\\?(.*))?"),
				response: function(oXhr, sUrlParams) {
					var sValidation = that._oDraftMetadata.draftRootValidationName;
					//trigger the before callback funtion
					that.fireEvent(MockServer.HTTPMETHOD.GET + sValidation + ":before", {
						oXhr: oXhr,
						sUrlParams: sUrlParams
					});
					that.fireEvent(MockServer.HTTPMETHOD.GET + ":before", {
						oXhr: oXhr,
						sUrlParams: sUrlParams
					});

					var oResponse = {
						d: {}
					};
					oResponse.d[sValidation] = {
						"__metadata": {
							"type": "ValidationResult"
						},
						"IsValid": true
					};

					//trigger the after callback funtion
					that.fireEvent(MockServer.HTTPMETHOD.GET + sValidation + ":after", {
						oXhr: oXhr,
						oResult: oResponse
					});
					that.fireEvent(MockServer.HTTPMETHOD.GET + ":after", {
						oXhr: oXhr,
						oResult: oResponse
					});
					oXhr.respondJSON(200, {}, JSON.stringify(oResponse));
					return true;
				}
			});
			aRequests.push({
				method: "POST",
				path: new RegExp(that._oDraftMetadata.draftRootPreparationtionName),
				response: function(oXhr) {
					//trigger the before callback funtion
					that.fireEvent(MockServer.HTTPMETHOD.POST + that._oDraftMetadata.draftRootPreparationtionName + ":before", {
						oXhr: oXhr
					});
					that.fireEvent(MockServer.HTTPMETHOD.POST + ":before", {
						oXhr: oXhr
					});
					var oRequestBody = JSON.parse(oXhr.requestBody);
					var aFilter = [];
					for (var property in oRequestBody) {
						aFilter.push(property + " eq " + oRequestBody[property]);
					}
					var oResponse = jQuery.sap.sjax({
						url: that.getRootUri() + that._oDraftMetadata.draftRootName + "?$filter=" + aFilter.join(" and "),
						dataType: "json"
					});
					if (!oResponse.success || !oResponse.data.d.results[0]) {
						// respond negative - no entity found
						oXhr.respond(404);
					}
					var oEntry = oResponse.data.d.results[0];

					//trigger the after callback funtion
					that.fireEvent(MockServer.HTTPMETHOD.POST + that._oDraftMetadata.draftRootPreparationtionName + ":after", {
						oXhr: oXhr,
						oEntry: oEntry
					});
					that.fireEvent(MockServer.HTTPMETHOD.POST + ":after", {
						oXhr: oXhr,
						oEntry: oEntry
					});
					oXhr.respondJSON(200, {}, JSON.stringify({
						d: oEntry
					}));
					return true;
				}
			});
			MockServer.prototype.setRequests.apply(this, [aRequests]);
		},

		_generateMockdata: function(mEntitySets, sBaseUrl) {

			MockServer.prototype._generateMockdata.apply(this, [mEntitySets, sBaseUrl]);

			this._handleDraftArtifacts(mEntitySets);
		},

		_loadMockdata: function(mEntitySets, sBaseUrl) {

			MockServer.prototype._loadMockdata.apply(this, [mEntitySets, sBaseUrl]);

			this._handleDraftArtifacts(mEntitySets);
		},

		_resolveNavigation: function(sEntitySetName, oFromRecord, sNavProp, oEntry) {
			var aEntries = MockServer.prototype._resolveNavigation.apply(this, [sEntitySetName, oFromRecord, sNavProp, oEntry]);
			if (sNavProp === this._oConstants.SIBLINGENTITY_NAVIGATION) {
				if (oEntry && oEntry.IsActiveEntity) {
					aEntries.splice(0, 1);
				} else {
					aEntries.length > 1 ? aEntries.splice(1, 1) : aEntries.splice(0, 1);
				}
			} else if (sNavProp === this._oConstants.DRAFT_ADMINISTRATIVE_DATA) {
				if (oEntry) {
					if (oEntry.IsActiveEntity && !oEntry.HasDraftEntity) {
						aEntries[0] = null;
					}
				} else {
					aEntries[0] = null;
				}
			}
			return aEntries;
		},

		_findEntitySets: function(oMetadata) {
			var mEntitySets = MockServer.prototype._findEntitySets.apply(this, [oMetadata]);
			this._prepareDraftMetadata(mEntitySets);
			return mEntitySets;
		}

	};

}, /* bExport= */ true);