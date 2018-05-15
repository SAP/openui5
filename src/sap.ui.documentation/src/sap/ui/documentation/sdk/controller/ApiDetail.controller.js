/*!
 * ${copyright}
 */

/*global location */
sap.ui.define([
		"jquery.sap.global",
		"sap/ui/documentation/sdk/controller/BaseController",
		"sap/ui/model/json/JSONModel",
		"sap/ui/documentation/sdk/controller/util/ControlsInfo",
		"sap/ui/documentation/sdk/util/ToggleFullScreenHandler",
		"sap/ui/documentation/sdk/controller/util/APIInfo",
		"sap/ui/core/library",
		"sap/base/Log"
	], function (jQuery, BaseController, JSONModel, ControlsInfo, ToggleFullScreenHandler, APIInfo, CoreLibrary, Log) {
		"use strict";

		var ViewType = CoreLibrary.mvc.ViewType;

		return BaseController.extend("sap.ui.documentation.sdk.controller.ApiDetail", {

			NOT_AVAILABLE: 'N/A',
			NOT_FOUND: 'Not found',

			/* =========================================================== */
			/* lifecycle methods										   */
			/* =========================================================== */

			onInit: function () {
				this.getRouter().getRoute("apiId").attachPatternMatched(this._onTopicMatched, this);

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
				if (this._oView) {
					this._oView.destroy();
					// If we had a view that means this is a navigation so we need to init the busy state
					this._oContainerPage.setBusy(true);
				}

				var oComponent = this.getOwnerComponent();

				// Cache allowed members
				this._aAllowedMembers = this.getModel("versionData").getProperty("/allowedMembers");

				this._sTopicid = oEvent.getParameter("arguments").id;
				this._sEntityType = oEvent.getParameter("arguments").entityType;
				this._sEntityId = oEvent.getParameter("arguments").entityId;

				// API Reference lifecycle
				oComponent.loadVersionInfo()
					.then(oComponent.fetchAPIIndex.bind(oComponent))
					.then(this._processApiIndexAndLoadApiJson.bind(this))
					.then(this._findEntityInApiJsonData.bind(this))
					.then(this._buildBorrowedModel.bind(this))
					.then(this._createModelAndSubView.bind(this))
					.then(this._initSubView.bind(this))
					.catch(function (vReason) {
						// If the symbol does not exist in the available libs we redirect to the not found page
						if (vReason === this.NOT_FOUND) {
							this._oContainerPage.setBusy(false);
							this.getRouter().myNavToWithoutHash("sap.ui.documentation.sdk.view.NotFound", "XML", false);
						} else {
							// Handle named errors
							if (vReason.name) {
								Log.error(vReason.name, function () {
									// Return error object for Support Info
									return vReason;
								});
							}
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
			 * @return {promise} sap.ui.view.loaded promise
			 * @private
			 */
			_createModelAndSubView: function (oBorrowedData) {
				// Attach resolved borrowed data
				this._oControlData.borrowed = oBorrowedData;

				// Pre-process data and create model
				this._bindData(this._sTopicid);

				// Create the sub-view and controller
				this._oView = sap.ui.view({
					height: "100%",
					viewName: "sap.ui.documentation.sdk.view.SubApiDetail",
					type: ViewType.XML,
					async: true,
					preprocessors: {
						xml: {
							models: {
								data: this._oModel
							}
						}
					}
				});

				// Return view loaded promise
				return this._oView.loaded();
			},

			/**
			 * Handles the extracted Symbol data and init`s the Borrowed methods loading
			 * @param {object} oControlData current symbol data loaded from api.json
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
			 * @return {promise} resolved or rejected promise
			 * @private
			 */
			_processApiIndexAndLoadApiJson: function (aData) {
				var oEntityData,
					bFound = false,
					iLen,
					i;

				// Cache api-index data
				this._aApiIndex = aData;

				// Find entity in api-index
				for (i = 0, iLen = aData.length; i < iLen; i++) {
					if (aData[i].name === this._sTopicid || aData[i].name.indexOf(this._sTopicid) === 0) {
						oEntityData = aData[i];
						this._oEntityData = oEntityData;
						bFound = true;
						break;
					}
				}

				if (bFound) {
					// Load API.json only for selected lib
					return APIInfo.getLibraryElementsJSONPromise(oEntityData.lib).then(function (aData) {
						this._aLibsData = aData; // Cache received data
						return Promise.resolve(aData); // We have found the symbol and loaded the corresponding api.json
					}.bind(this));
				}

				// If we are here - the object does not exist so we reject the promise.
				return Promise.reject(this.NOT_FOUND);
			},

			_bindData: function (sTopicId) {
				var oControlData = this._oControlData,
					oModel,
					oUi5Metadata;

				oUi5Metadata = oControlData['ui5-metadata'];

				// Defaults
				oControlData.hasProperties = false;
				oControlData.hasOwnMethods = false;
				oControlData.hasControlProperties = false;
				oControlData.hasAssociations = false;
				oControlData.hasAggregations = false;
				oControlData.hasSpecialSettings = false;
				oControlData.hasAnnotations = false;

				// Filter and leave only visible elements
				if (oControlData.properties) {
					oControlData.properties = this.filterElements(oControlData.properties);

					// Are there remaining visible properties?
					oControlData.hasProperties = !!oControlData.properties.length;
				}

				if (oControlData.methods) {
					oControlData.methods = this.filterElements(oControlData.methods);

					// Are there remaining visible methods?
					oControlData.hasOwnMethods = !!oControlData.methods.length;
				}

				if (oUi5Metadata) {
					if (oUi5Metadata.properties) {
						oUi5Metadata.properties = this.filterElements(oUi5Metadata.properties);
						oControlData.hasControlProperties = !!oUi5Metadata.properties.length;
					}

					if (oUi5Metadata.associations) {
						oUi5Metadata.associations = this.filterElements(oUi5Metadata.associations);
						oControlData.hasAssociations = !!oUi5Metadata.associations.length;
					}

					if (oUi5Metadata.aggregations) {
						oUi5Metadata.aggregations = this.filterElements(oUi5Metadata.aggregations);
						oControlData.hasAggregations = !!oUi5Metadata.aggregations.length;
					}

					if (oUi5Metadata.specialSettings) {
						oUi5Metadata.specialSettings = this.filterElements(oUi5Metadata.specialSettings);
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
					sBaseClass,
					aBorrowChain,
					aMethods,
					aMethodNames,
					aInheritanceChain,
					aRequiredLibs = [],
					oItem,
					i;

				if (!oControlData) {
					return Promise.resolve({events: [], methods: []});
				}

				aBorrowChain = {
					methods: [],
					events: []
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

				// Filter all borrowed methods and if some of them are overridden by the class
				// we should exclude them from the borrowed methods list. BCP: 1780319087
				var fnOverrideMethodFilter = function (item) {
					return aMethodNames.indexOf(item.name) === -1;
				};

				// Find all libs needed to resolve the inheritance chain
				aInheritanceChain = [sBaseClass /* We need the first base class here also */];
				while (sBaseClass) {
					i = this._aApiIndex.length;
					while (i--) {
						oItem = this._aApiIndex[i];
						if (oItem.name === sBaseClass) {
							sBaseClass = oItem.extends;
							if (sBaseClass) {
								aInheritanceChain.push(sBaseClass);
							}
							if (aRequiredLibs.indexOf(oItem.lib) === -1) {
								aRequiredLibs.push(oItem.lib);
							}
							break;
						}
					}
					if (i === -1) {
						// There is a symbol without documentation in the inheritance chain and we can
						// not continue. BCP: 1770492427
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
					var aAllLibraryElements = [];
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
								link: "#/api/" + sBaseClass + "/methods/" + item.name
							};
						};

						var fnEventsMapper = function (item) {
							return {
								name: item.name,
								link: "#/api/" + sBaseClass + "/events/" + item.name
							};
						};

						if (oBaseClass) {

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
						}
					});

					return aBorrowChain;

				});

			},

			/**
			 * Remove not allowed elements from list
			 * @param {array} aElements list of elements
			 * @returns {array} filtered elements list
			 */
			filterElements: function (aElements) {
				var i,
					iLength = aElements.length,
					aNewElements = [],
					oElement;

				for (i = 0; i < iLength; i++) {
					oElement = aElements[i];
					if (this._aAllowedMembers.indexOf(oElement.visibility) >= 0) {
						aNewElements.push(oElement);
					}
				}
				return aNewElements;
			}
		});

	}
);
