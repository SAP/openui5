/*!
 * ${copyright}
 */

/*global location */
sap.ui.define([
    "sap/ui/documentation/sdk/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/CustomData",
    "sap/ui/documentation/sdk/controller/util/ControlsInfo",
    "sap/ui/documentation/sdk/util/ToggleFullScreenHandler",
    "sap/ui/documentation/sdk/controller/util/APIInfo",
    "sap/ui/documentation/sdk/model/formatter",
    "sap/ui/core/mvc/XMLView",
    "sap/ui/core/library",
    "sap/base/Log"
], function(
    BaseController,
	JSONModel,
	CustomData,
	ControlsInfo,
	ToggleFullScreenHandler,
	APIInfo,
	formatter,
	XMLView,
	CoreLibrary,
	Log
) {
		"use strict";

		return BaseController.extend("sap.ui.documentation.sdk.controller.ApiDetail", {

			NOT_AVAILABLE: 'N/A',
			NOT_FOUND: 'Not found',

			/* =========================================================== */
			/* lifecycle methods										   */
			/* =========================================================== */

			onInit: function () {
				this.getRouter().getRoute("apiSpecialRoute").attachPatternMatched(this._onTopicMatched, this);

				// BPC: 1780339157 - There are cases where we have more than 100 method entries so we need to increase
				// the default model size limit.
				this._oModel = new JSONModel();
				this._oModel.setSizeLimit(10000);

				this._oContainerPage = this.getView().byId("apiDetailPageContainer");
			},

			/**
			 * Binds the view to the object path and expands the aggregated line items.
			 * @function
			 * @param {sap.ui.base.Event} oEvent pattern match event in route 'api'
			 * @private
			 */
			_onTopicMatched: function (oEvent) {
				var oArguments,
					oComponent;

				oArguments = this.getRouter()._decodeSpecialRouteArguments(oEvent);
				oComponent = this.getOwnerComponent();

				if (this._sTopicid === oArguments.id) {
					// since we trigger <code>router.parse(new_path)</code> without checking the current path,
					// it is possible to trigger navigation to the same path more than once
					// => check if entity already displayed on controller level for now
					return;
				}

				this._sTopicid = oArguments.id;
				this._sEntityType = oArguments.entityType;
				this._sEntityId = oArguments.entityId;

				if (this._oView && !this._oView.bIsDestroyed) {
					this._oView.destroy();
					// If we had a view that means this is a navigation so we need to init the busy state
					this._oContainerPage.setBusy(true);
				}

				// API Reference lifecycle
				oComponent.loadVersionInfo()
					.then(function () {
						// Cache allowed members
						this._aAllowedMembers = this.getModel("versionData").getProperty("/allowedMembers");
					}.bind(this))
					.then(APIInfo.getIndexJsonPromise)
					.then(this._processApiIndexAndLoadApiJson.bind(this))
					.then(this._findEntityInApiJsonData.bind(this))
					.then(this._addMissingNodesToControlData.bind(this))
					.then(this._buildBorrowedModel.bind(this))
					.then(this._createModelAndSubView.bind(this))
					.then(this._initSubView.bind(this))
					.catch(function (vReason) {
						// If the symbol does not exist in the available libs we redirect to the not found page
						if (vReason === this.NOT_FOUND) {
							this._oContainerPage.setBusy(false);
							this.getRouter().myNavToWithoutHash("sap.ui.documentation.sdk.view.NotFound", "XML", false);
						} else if (typeof vReason === "string") {
							Log.error(vReason);
						} else if (vReason.name) {
							Log.error(vReason.name, vReason.message);
						} else if (vReason.message) {
							Log.error(vReason.message);
						}
					}.bind(this));
			},

			/**
			 * Init the Sub View and controller
			 * @param {sap.ui.view} oView the pre-processed sub view
			 * @private
			 */
			_initSubView: function (oView) {
				var oController = oView.getController();

				// check if the view become outdated
				// (as the view is created asynchronously, another topic may have been chosen meanwhile)
				if (oView.data("topicid") !== this._sTopicid) {
					oView.destroy();
					return;
				}

				this._oView = oView;

				// Add the sub view to the current one
				this._oContainerPage.addContent(oView);
				this._oContainerPage.setBusy(false);

				// Init the sub view and controller with the needed references.The view's are nested and work in a
				// mimic way so they need to share some references.
				oController.initiate({
					sTopicId: this._sTopicid,
					oModel: this._oModel,
					aApiIndex: this._aApiIndex,
					aAllowedMembers: this._aAllowedMembers,
					oEntityData: this._oEntityData,
					sEntityType: this._sEntityType,
					sEntityId: this._sEntityId,
					oOwnerComponent: this.getOwnerComponent(),
					oContainerView: this.getView(),
					oContainerController: this
				});
			},

			/**
			 * Create the JSON model and the Sub View. The model will be used in both lifecycle phases of the sub view
			 * by the preprocessor and by the view initiation afterwards.
			 * @param {object} oBorrowedData the data extracted by the borrowed methods promise
			 * @return {Promise} sap.ui.view.loaded promise
			 * @private
			 */
			_createModelAndSubView: function (oBorrowedData) {
				// Attach resolved borrowed data
				this._oControlData.borrowed = oBorrowedData;

				// Pre-process data and create model
				this._bindData(this._sTopicid);

				// Create the sub-view and controller
				return XMLView.create({
					height: "100%",
					customData: new CustomData({
						key: "topicid",
						value: this._sTopicid
					}),
					viewName: "sap.ui.documentation.sdk.view.SubApiDetail",
					async: true,
					preprocessors: {
						xml: {
							models: {
								data: this._oModel
							}
						}
					}
				});
			},

			/**
			 * Handles the extracted Symbol data and init`s the Borrowed methods loading
			 * @param {object} oControlData reworked symbol data loaded from api.json
			 * @returns {Promise} borrowed entities promise
			 * @private
			 */
			_buildBorrowedModel: function (oControlData) {
				// Cache ControlData
				this._oControlData = oControlData;

				// Collect borrowed data
				return this.buildBorrowedModel(oControlData);
			},

			/**
			* Adds the nodes which are present in the this._oEntityData.nodes,
			* but aren't in the this._oControlData.nodes to the this._oControlData.nodes.
			* @param {object} oControlData current symbol data loaded from api.json
			* @returns {object} reworked symbol data loaded from api.json
			* @private
			*/
			_addMissingNodesToControlData: function (oControlData) {
				var aLibNodes,
					sNodeName,
					oNewNode,
					sLibNodeName,
					aEntityDataNodes;

				if (this._oEntityData.kind === "namespace") {

					aEntityDataNodes = Array.isArray(this._oEntityData.nodes) && this._oEntityData.nodes;
					aLibNodes = Array.isArray(oControlData.nodes) && oControlData.nodes;

					if (aEntityDataNodes && aLibNodes && aEntityDataNodes.length > aLibNodes.length) {

						// Sort alphabetically by the value of the "name" key of an object
						aLibNodes.sort(this._compareStringsCaseInsensitive);

						aEntityDataNodes.forEach(function (oNode, iIndex) {
							sNodeName = oNode.name;
							sLibNodeName = aLibNodes[iIndex] && aLibNodes[iIndex].name;

							if (sNodeName !== sLibNodeName) {
								oNewNode = {};
								oNewNode.name = sNodeName;
								oNewNode.description = "";
								oNewNode.href = "api/" + sNodeName;

								if (oNode.deprecated) {
									oNewNode.deprecated = true;
								}

								aLibNodes.splice(iIndex, 0, oNewNode);
							}
						});
					}
				}

				return oControlData;
			},

			/**
			 * Compare function, which comapares two strings case insensitive.
			 * @param {string} a left operand
			 * @param {string} b right operand
			 * @returns {number} result
			 * @private
			 */
			_compareStringsCaseInsensitive: function (a, b) {
				var aLowerCaseName = a.name.toLowerCase(),
					bLowerCaseName = b.name.toLowerCase();
				if ( aLowerCaseName < bLowerCaseName ){
					return -1;
				}
				if ( aLowerCaseName > bLowerCaseName ){
					return 1;
				}
				return 0;
			},

			/**
			 * Omit nodes that are marked with visibility: restricted
			 * but only when we are in an internal version of the Demo Kit
			 * @param {array} aLibsData data from api.json
			 * @returns {array} filtered aLibsData
			 * @private
			 */
			_filterEntityByVisibilityInApiJsonData: function (aLibsData) {

				var oVersionModel = this.getModel("versionData"),
					bIsInternal = oVersionModel.getProperty("/isInternal");

				if (!bIsInternal) {
					aLibsData = (aLibsData || []).filter(function (aNode) {
						return !aNode.hasOwnProperty('visibility') || aNode.visibility !== 'restricted';
					});
				}

				return aLibsData;
			},

			/**
			 * Extract current symbol data from api.json file for the current library
			 * @param {array} aLibsData data from api.json file for the current library
			 * @returns {object} current symbol data
			 * @private
			 */
			_findEntityInApiJsonData: function (aLibsData) {
				var oLibItem,
					iLen,
					i;

				// Find entity in loaded libs data
				for (i = 0, iLen = aLibsData.length; i < iLen; i++) {
					oLibItem = aLibsData[i];
					if (oLibItem.name === this._sTopicid) {
						// Check if we are allowed to display the requested symbol
						// BCP: 1870269087 item may not have visibility info at all. In this case we show the item
						if (oLibItem.visibility === undefined || this._aAllowedMembers.indexOf(oLibItem.visibility) >= 0) {
							return oLibItem;
						} else {
							// We found the requested symbol but we are not allowed to show it.
							return Promise.reject(this.NOT_FOUND);
						}
					}
				}

				// If we are here - the object does not exist so we reject the promise.
				return Promise.reject(this.NOT_FOUND);
			},

			/**
			 * Process data from api-index file and if symbol is found load the corresponding api.json file for the
			 * symbol library. If the symbol is not resolved this method returns a rejected promise which triggers
			 * navigation to not found page.
			 * @param {array} aData data from api-index file
			 * @return {Promise} resolved or rejected promise
			 * @private
			 */
			_processApiIndexAndLoadApiJson: function (aData) {
				var oEntityData,
					oMasterController,
					sTopicId = this._sTopicid;

				// Cache api-index data
				this._aApiIndex = aData;

				// Find symbol
				function findSymbol (a) {
					return a.some(function (o) {
						var bFound = o.name === sTopicId;
						if (!bFound && o.nodes) {
							return findSymbol(o.nodes);
						} else if (bFound) {
							oEntityData = o;
							return true;
						}
						return false;
					});
				}
				findSymbol(aData);

				if (oEntityData) {
					// Cache entity data
					this._oEntityData = oEntityData;

					// If target symbol is deprecated - all deprecated records should be shown in the tree
					if (oEntityData.deprecated || oEntityData.bAllContentDeprecated) {
						oMasterController = this.getOwnerComponent().getConfigUtil().getMasterView("apiId").getController();
						oMasterController.selectDeprecatedSymbol(this._sTopicid);
					}

					oEntityData.nodes = this._filterEntityByVisibilityInApiJsonData(oEntityData.nodes);

					// Load API.json only for selected lib
					return APIInfo.getLibraryElementsJSONPromise(oEntityData.lib).then(function (aData) {
						return Promise.resolve(aData); // We have found the symbol and loaded the corresponding api.json
					});
				}

				// If we are here - the object does not exist so we reject the promise.
				return Promise.reject(this.NOT_FOUND);
			},

			_bindData: function (sTopicId) {
				var oControlData = this._oControlData,
					oModel,
					oUi5Metadata,
					fnSort = function (a, b) {
						if (a.name > b.name) {
							return 1;
						} else if (a.name < b.name) {
							return -1;
						}
						return 0;
					};

				oUi5Metadata = oControlData['ui5-metadata'];

				// Defaults
				oControlData.hasProperties = false;
				oControlData.hasOwnMethods = false;
				oControlData.hasControlProperties = false;
				oControlData.hasAssociations = false;
				oControlData.hasAggregations = false;
				oControlData.hasSpecialSettings = false;
				oControlData.hasAnnotations = false;

				var fnIsAllowedMember = function(oElement) {
					return (this._aAllowedMembers.indexOf(oElement.visibility) >= 0);
				}.bind(this);

				var fnFormatName = function(oElement) {

					oElement.name && (oElement.name = formatter.apiRefEntityName(oElement.name)); //TODO: this will be moved to the preprocessing step instead
					oElement.code && (oElement.code = formatter.apiRefEntityName(oElement.code)); //TODO: this will be moved to the preprocessing step instead

					if (oElement.name) {
						var sPlaceholderId = oElement.name.replace(/[$#/]/g, ".");
						oElement.placeholderId = sPlaceholderId + "_method";
						oElement.subPlaceholderId = sPlaceholderId + "__method";
					}

					return oElement;
				};

				if (oControlData.borrowed.properties.length) {
					oUi5Metadata.properties = (oUi5Metadata.properties || []).concat(oControlData.borrowed.properties).sort(fnSort);
				}

				if (oControlData.borrowed.aggregations.length) {
					oUi5Metadata.aggregations = (oUi5Metadata.aggregations || []).concat(oControlData.borrowed.aggregations).sort(fnSort);
				}

				if (oControlData.borrowed.associations.length) {
					oUi5Metadata.associations = (oUi5Metadata.associations || []).concat(oControlData.borrowed.associations).sort(fnSort);
				}

				// Filter and leave only visible elements
				if (oControlData.properties) {
					oControlData.properties = this.transformElements(oControlData.properties, fnIsAllowedMember, fnFormatName);

					// Are there remaining visible properties?
					oControlData.hasProperties = !!oControlData.properties.length;
				}

				if (oControlData.methods) {
					oControlData.methods = this.transformElements(oControlData.methods, fnIsAllowedMember, fnFormatName);

					// Are there remaining visible methods?
					oControlData.hasOwnMethods = !!oControlData.methods.length;
				}

				if (oUi5Metadata) {
					oControlData.dnd = oUi5Metadata.dnd;
					if (oUi5Metadata.properties) {
						oUi5Metadata.properties = this.transformElements(oUi5Metadata.properties, fnIsAllowedMember);
						oControlData.hasControlProperties = !!oUi5Metadata.properties.length;
					}

					if (oUi5Metadata.associations) {
						oUi5Metadata.associations = this.transformElements(oUi5Metadata.associations, fnIsAllowedMember);
						oControlData.hasAssociations = !!oUi5Metadata.associations.length;
					}

					if (oUi5Metadata.aggregations) {
						oUi5Metadata.aggregations = this.transformElements(oUi5Metadata.aggregations, fnIsAllowedMember);
						oControlData.hasAggregations = !!oUi5Metadata.aggregations.length;
						oControlData.hasAggregationAltTypes = oUi5Metadata.aggregations.some(function (oElement) {
							return !!oElement.altTypes;
						});
					}

					if (oUi5Metadata.specialSettings) {
						oUi5Metadata.specialSettings = this.transformElements(oUi5Metadata.specialSettings, fnIsAllowedMember);
						oControlData.hasSpecialSettings = !!oUi5Metadata.specialSettings.length;
					}

					oControlData.hasAnnotations = !!(oUi5Metadata.annotations && oUi5Metadata.annotations.length);
				}

				oControlData.hasChildren = !!oControlData.nodes;
				oControlData.hasConstructor = oControlData.hasOwnProperty("constructor") && !!oControlData.constructor;
				oControlData.hasOwnEvents = !!oControlData.events;
				oControlData.hasEvents = !!(oControlData.hasOwnEvents || (oControlData.borrowed && oControlData.borrowed.events.length > 0));
				oControlData.hasMethods = !!(oControlData.hasOwnMethods || (oControlData.borrowed && oControlData.borrowed.methods.length > 0));

				if (oControlData.implements && oControlData.implements.length) {
					oControlData.implementsParsed = oControlData.implements.map(function (item, idx, array) {
						var aDisplayNameArr = item.split("."),
							sDisplayName = aDisplayNameArr[aDisplayNameArr.length - 1];
						return {
							href: item,
							name: sDisplayName
						};
					});
					oControlData.hasImplementsData = true;
				} else {
					oControlData.hasImplementsData = false;
				}

				oControlData.isFunction = oControlData.kind === "function";
				oControlData.isClass = oControlData.kind === "class";
				oControlData.isNamespace = oControlData.kind === "namespace";
				oControlData.isDerived = !!oControlData.extends;
				oControlData.extendsText = oControlData.extends || this.NOT_AVAILABLE;
				oControlData.sinceText = oControlData.since || this.NOT_AVAILABLE;
				oControlData.module = oControlData.module || this.NOT_AVAILABLE;

				// Main model data
				this._oModel.setData(oControlData);

				if (this.extHookbindData) {
					this.extHookbindData(sTopicId, oModel);
				}
			},

			buildBorrowedModel: function (oControlData) {
				var aBaseClassMethods,
					aBaseClassEvents,
					aBaseClassProperties,
					aBaseClassAggregations,
					aBaseClassAssociations,
					sBaseClass,
					aBorrowChain,
					aMethods,
					aMethodNames,
					aProperties,
					aPropertyNames,
					aAggregations,
					aAggregationNames,
					aAssociations,
					aAssociationNames,
					aInheritanceChain,
					aRequiredLibs = [],
					oSymbol;

				if (!oControlData) {
					return Promise.resolve({
						events: [],
						methods: [],
						properties: [],
						aggregations: [],
						associations: []
					});
				}

				aBorrowChain = {
					methods: [],
					events: [],
					properties: [],
					aggregations: [],
					associations: []
				};
				sBaseClass = oControlData.extends;

				var fnVisibilityFilter = function (item) {
					return this._aAllowedMembers.indexOf(item.visibility) !== -1;
				}.bind(this);

				// Get all method names
				aMethods = oControlData.methods || [];
				aMethodNames = aMethods.map(function (oMethod) {
					return oMethod.name;
				});

				// Get all properties names
				aProperties = oControlData["ui5-metadata"] && oControlData["ui5-metadata"].properties || [];
				aPropertyNames = aProperties.map(function (oProperty) {
					return oProperty.name;
				});

				// Get all aggregations names
				aAggregations = oControlData["ui5-metadata"] && oControlData["ui5-metadata"].aggregations || [];
				aAggregationNames = aAggregations.map(function (oAggregation) {
					return oAggregation.name;
				});

				// Get all associations names
				aAssociations = oControlData["ui5-metadata"] && oControlData["ui5-metadata"].associations || [];
				aAssociationNames = aAssociations.map(function (oAssociation) {
					return oAssociation.name;
				});

				// Filter all borrowed methods and if some of them are overridden by the class
				// we should exclude them from the borrowed methods list. BCP: 1780319087
				var fnOverrideMethodFilter = function (item) {
					return aMethodNames.indexOf(item.name) === -1;
				};

				var fnOverridePropertyFilter = function (item) {
					return aPropertyNames.indexOf(item.name) === -1 && !item.borrowedFrom
						&& !aBorrowChain.properties.some(function(oProp) {
							return oProp.name === item.name;
						});
				};

				var fnOverrideAggregationFilter = function (item) {
					return aAggregationNames.indexOf(item.name) === -1 && !item.borrowedFrom;
				};

				var fnOverrideAssociationFilter = function (item) {
					return aAssociationNames.indexOf(item.name) === -1 && !item.borrowedFrom;
				};

				// Find all libs needed to resolve the inheritance chain

				// Find symbol utility method
				function findSymbol (a, sTopicId) {
					return a.some(function (o) {
						var bFound = o.name === sTopicId;
						if (!bFound && o.nodes) {
							return findSymbol(o.nodes, sTopicId);
						} else if (bFound) {
							oSymbol = o;
							return true;
						}
						return false;
					});
				}

				aInheritanceChain = [sBaseClass /* We need the first base class here also */];
				while (sBaseClass) {
					findSymbol(this._aApiIndex, sBaseClass);
					if (oSymbol) {
						sBaseClass = oSymbol.extends;
						if (sBaseClass) {
							aInheritanceChain.push(sBaseClass);
						}
						if (aRequiredLibs.indexOf(oSymbol.lib) === -1) {
							aRequiredLibs.push(oSymbol.lib);
						}
					} else {
						// There is a symbol without documentation in the inheritance chain and we can
						// not continue. BCP: 1770492427
						sBaseClass = false;
						break;
					}
				}

				// Generate promises for all required libraries
				var aPromises = aRequiredLibs.map(function (sLibName) {
					return APIInfo.getLibraryElementsJSONPromise(sLibName);
				});

				// When all required libraries
				return Promise.all(aPromises).then(function (aResult) {
					// Combine in one array
					var aAllLibraryElements = [],
						baseClassCache;
					aResult.forEach(function (aSingleLibraryElements) {
						aAllLibraryElements = aAllLibraryElements.concat(aSingleLibraryElements);
					});

					// loop chain and collect data
					aInheritanceChain.forEach(function (sBaseClass) {
						var oBaseClass,
							i = aAllLibraryElements.length;

						while (i--) {
							if (aAllLibraryElements[i].name === sBaseClass) {
								oBaseClass = aAllLibraryElements[i];
								break;
							}
						}

						var fnMethodsMapper = function (item) {
							return {
								name: item.name,
								link: "api/" + sBaseClass + "#methods/" + item.name
							};
						};

						var fnEventsMapper = function (item) {
							return {
								name: item.name,
								link: "api/" + sBaseClass + "#events/" + item.name
							};
						};

						var fnPropAggrAssocMapper = function (item) {
							return Object.assign({}, item, {
							      borrowedFrom: sBaseClass
							});
						};

						if (oBaseClass) {
							baseClassCache = oBaseClass["ui5-metadata"] || [];
							aBaseClassMethods = (oBaseClass.methods || []).filter(fnVisibilityFilter)
								.filter(fnOverrideMethodFilter).map(fnMethodsMapper);

							if (aBaseClassMethods.length) {
								aBorrowChain.methods.push({
									name: sBaseClass,
									methods: aBaseClassMethods
								});
							}

							aBaseClassEvents = (oBaseClass.events || []).filter(fnVisibilityFilter).map(fnEventsMapper);
							if (aBaseClassEvents.length) {
								aBorrowChain.events.push({
									name: sBaseClass,
									events: aBaseClassEvents
								});
							}

							aBaseClassProperties = (baseClassCache.properties || []).filter(fnVisibilityFilter)
								.filter(fnOverridePropertyFilter).map(fnPropAggrAssocMapper);
							if (aBaseClassProperties.length) {
								aBorrowChain.properties = aBorrowChain.properties.concat(aBaseClassProperties);
							}

							aBaseClassAggregations = (baseClassCache.aggregations || []).filter(fnVisibilityFilter)
								.filter(fnOverrideAggregationFilter).map(fnPropAggrAssocMapper);
							if (aBaseClassAggregations.length) {
								aBorrowChain.aggregations = aBorrowChain.aggregations.concat(aBaseClassAggregations);
							}

							aBaseClassAssociations = (baseClassCache.associations || []).filter(fnVisibilityFilter)
								.filter(fnOverrideAssociationFilter).map(fnPropAggrAssocMapper);
							if (aBaseClassAssociations.length) {
								aBorrowChain.associations = aBorrowChain.associations.concat(aBaseClassAssociations);
							}
						}
					});

					return aBorrowChain;

				});

			},

			/**
			 * Filter and format elements
			 * @param {array} aElements list of elements
			 * @param {function} fnFilter filtering function
			 * @param {function} fnFormat formatting function
			 * @returns {array} transformed elements list
			 */
			transformElements: function (aElements, fnFilter, fnFormat) {
				var i,
					iLength = aElements.length,
					aNewElements = [],
					oElement;

				for (i = 0; i < iLength; i++) {
					oElement = aElements[i];

					if (fnFilter && !fnFilter(oElement)) {
						continue;
					}
					if (fnFormat) {
						fnFormat(oElement);
					}
					aNewElements.push(oElement);
				}
				return aNewElements;
			}
		});

	}
);
