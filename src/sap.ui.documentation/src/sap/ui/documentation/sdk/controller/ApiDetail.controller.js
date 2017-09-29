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
		"sap/uxap/ObjectPageSubSection",
		"sap/ui/documentation/sdk/controller/util/JSDocUtil"
	], function (jQuery, BaseController, JSONModel, ControlsInfo, ToggleFullScreenHandler, ObjectPageSubSection, JSDocUtil) {
		"use strict";

		return BaseController.extend("sap.ui.documentation.sdk.controller.ApiDetail", {

			METHOD: 'method',
			EVENT: 'event',
			PARAM: 'param',
			NOT_AVAILABLE: 'N/A',
			ANNOTATIONS_LINK: 'http://docs.oasis-open.org/odata/odata/v4.0/odata-v4.0-part3-csdl.html',
			ANNOTATIONS_NAMESPACE_LINK: 'http://docs.oasis-open.org/odata/odata/v4.0/errata02/os/complete/vocabularies/',
			ANNOTATION_DESCRIPTION_STRIP_REGEX: /<i>XML[\s\S].*Example/,

			/**
			 * Determines if the type can be navigated to
			 */
			_baseTypes: [
				"sap.ui.core.any",
				"sap.ui.core.object",
				"sap.ui.core.function",
				"sap.ui.core.number", // TODO discuss with Thomas, type does not exist
				"sap.ui.core.float",
				"sap.ui.core.int",
				"sap.ui.core.boolean",
				"sap.ui.core.string",
				"sap.ui.core.URI", // TODO discuss with Thomas, type is not a base type (it has documentation)
				"sap.ui.core.ID", // TODO discuss with Thomas, type is not a base type (it has documentation)
				"sap.ui.core.void",
				"sap.ui.core.CSSSize", // TODO discuss with Thomas, type is not a base type (it has documentation)
				"null",
				"any",
				"any[]",
				"array",
				"element",
				"object",
				"object[]",
				"object|object[]",
				"function",
				"float",
				"int",
				"boolean",
				"string",
				"string[]",
				"number",
				"map",
				"promise",
				"undefined"
			],

			/* =========================================================== */
			/* lifecycle methods										   */
			/* =========================================================== */

			onInit: function () {
				this._objectPage = this.byId("apiDetailObjectPage");
				this.getRouter().getRoute("apiId").attachPatternMatched(this._onTopicMatched, this);

				this.setModel(new JSONModel(), "topics");
				this.setModel(new JSONModel(), "constructorParams");
				this.setModel(new JSONModel(), 'methods');
				this.setModel(new JSONModel(), 'events');
				this.setModel(new JSONModel(), "entity");
				this.setModel(new JSONModel(), "borrowedMethods");
				this.setModel(new JSONModel(), "borrowedEvents");
			},

			onAfterRendering: function () {
				this._createMethodsSummary();
				this._createEventsSummary();
				this._createAnnotationsSummary();

				this.getView().attachBrowserEvent("click", this.onJSDocLinkClick, this);
			},

			onExit: function () {
				this.getView().detachBrowserEvent("click", this.onJSDocLinkClick, this);
			},

			onToggleFullScreen: function (oEvent) {
				ToggleFullScreenHandler.updateMode(oEvent, this.getView(), this);
			},

			onJSDocLinkClick: function (oEvent) {
				var oClassList = oEvent.target.classList,
					bJSDocLink = oClassList.contains("jsdoclink"),
					sEntityType;

				// Not a JSDocLink - we do nothing
				if (!bJSDocLink) {
					return;
				}

				if (oClassList.contains("scrollToMethod")) {
					sEntityType = "methods";
				} else if (oClassList.contains("scrollToEvent")) {
					sEntityType = "events";
				} else {
					// We do not scroll
					return;
				}

				this._scrollToEntity(sEntityType, oEvent.target.getAttribute("data-sap-ui-target"));
			},

			/* =========================================================== */
			/* begin: internal methods									 */
			/* =========================================================== */

			/**
			 * Binds the view to the object path and expands the aggregated line items.
			 * @function
			 * @param {sap.ui.base.Event} oEvent pattern match event in route 'api'
			 * @private
			 */
			_onTopicMatched: function (oEvent) {
				var oComponent = this.getOwnerComponent();

				this._objectPage.setBusy(true);

				this._sTopicid = oEvent.getParameter("arguments").id;
				this._sEntityType = oEvent.getParameter("arguments").entityType;
				this._sEntityId = oEvent.getParameter("arguments").entityId;

				oComponent.loadVersionInfo()
					.then(oComponent.fetchAPIInfoAndBindModels.bind(oComponent))
					.then(function () {
						var oLibsData = this.getModel("libsData").getData(),
							bFound = false,
							sEntity;

						// Try to discover if entity exist
						if (!oLibsData[this._sTopicid]) {
							// Not an exact match - try to resolve partial namespace
							for (sEntity in oLibsData) {
								if (oLibsData.hasOwnProperty(sEntity) && sEntity.indexOf(this._sTopicid) === 0) {
									bFound = true;
									break;
								}
							}
						} else {
							bFound = true;
						}

						// If the entity does not exist in the available libs we redirect to the not found page and
						// stop the immediate execution of this method.
						if (!bFound) {
							this._objectPage.setBusy(false);
							this.getRouter().myNavToWithoutHash("sap.ui.documentation.sdk.view.NotFound", "XML", false);
							return;
						}
						// Cache allowed members
						this._aAllowedMembers = this.getModel("versionData").getProperty("/allowedMembers");

						this._objectPage._suppressLayoutCalculations();
						this._bindData(this._sTopicid);
						this._bindEntityData(this._sTopicid);
						this._createMethodsSummary();
						this._createEventsSummary();
						this._createAnnotationsSummary();
						this._objectPage._resumeLayoutCalculations();

						if (this._sEntityType) {
							this._scrollToEntity(this._sEntityType, this._sEntityId);
						} else {
							this._scrollContentToTop();
						}

						jQuery.sap.delayedCall(0, this, function () {
							this._prettify();
							this._objectPage.setBusy(false);

							// Init scrolling right after busy indicator is cleared and prettify is ready
							jQuery.sap.delayedCall(0, this, function () {
								if (this._sEntityType) {
									this._scrollToEntity(this._sEntityType, this._sEntityId);
								}
							});
						});

						this.searchResultsButtonVisibilitySwitch(this.getView().byId("apiDetailBackToSearch"));
					}.bind(this));

			},

			_prettify: function () {
				// Google Prettify requires this class
				jQuery('pre').addClass('prettyprint');

				window.prettyPrint();
			},

			_createMethodsSummary: function () {
				var oSummaryTable = sap.ui.xmlfragment(this.getView().getId() + "-methodsSummary", "sap.ui.documentation.sdk.view.ApiDetailMethodsSummary", this);
				var oSection = this.getView().byId("methods");

				var aSubSections = oSection.getSubSections();
				if (aSubSections.length > 0 && aSubSections[0].getTitle() === "Summary") {
					return;
				}

				oSection.insertSubSection(new ObjectPageSubSection({
					title: "Summary",
					blocks: [
						oSummaryTable
					]
				}), 0);
			},

			_createEventsSummary: function () {
				var oSummaryTable = sap.ui.xmlfragment(this.getView().getId() + "-eventsSummary", "sap.ui.documentation.sdk.view.ApiDetailEventsSummary", this);
				var oSection = this.getView().byId("events");

				var aSubSections = oSection.getSubSections();
				if (aSubSections.length > 0 && aSubSections[0].getTitle() === "Summary") {
					return;
				}

				oSection.insertSubSection(new ObjectPageSubSection({
					title: "Summary",
					blocks: [
						oSummaryTable
					]
				}), 0);
			},

			_createAnnotationsSummary: function () {
				var oSummaryTable = sap.ui.xmlfragment(this.getView().getId() + "-annotationsSummary", "sap.ui.documentation.sdk.view.ApiDetailAnnotationsSummary", this);
				var oSection = this.getView().byId("annotations");

				var aSubSections = oSection.getSubSections();
				if (aSubSections.length > 0 && aSubSections[0].getTitle() === "Summary") {
					return;
				}

				oSection.insertSubSection(new ObjectPageSubSection({
					title: "Summary",
					blocks: [
						oSummaryTable
					]
				}), 0);
			},

			scrollToMethod: function (oEvent) {
				this._scrollToEntity("methods", oEvent.getSource().getText());
			},

			scrollToEvent: function (oEvent) {
				this._scrollToEntity("events", oEvent.getSource().getText());
			},

			scrollToAnnotation: function (oEvent) {
				this._scrollToEntity("annotations", oEvent.getSource().getText());
			},

			_scrollToEntity: function (sSectionId, sSubSectionTitle) {

				var aFilteredSubSections,
					aSubSections,
					oSection;

				if (!sSectionId) {
					return;
				}

				// LowerCase every input from URL
				sSectionId = sSectionId.toLowerCase();

				oSection = this.getView().byId(sSectionId);
				if (!oSection) {
					return;
				}

				// If we have a target sub-section we will scroll to it else we will scroll directly to the section
				if (sSubSectionTitle) {
					// Let's ignore case when searching for the section especially like in this case
					// where sSubSectionTitle comes from the URL
					sSubSectionTitle = sSubSectionTitle.toLowerCase();

					aSubSections = oSection.getSubSections();
					aFilteredSubSections = aSubSections.filter(function (oSubSection) {
						return oSubSection.getTitle().toLowerCase() === sSubSectionTitle;
					});

					if (aFilteredSubSections.length) {

						// Disable router as we are going to scroll only - this is only to prevent routing when a link
						// pointing to a sub-section from the same entity with a href is clicked
						this.getRouter().stop();
						jQuery.sap.delayedCall(0, this, function () {
							// Re-enable rooter after current operation
							this.getRouter().initialize(true);
						});

						// We scroll to the first sub-section found
						this.getView().byId("apiDetailObjectPage").scrollToSection(aFilteredSubSections[0].getId(), 250);
					}
				} else {
					// We scroll to section
					this.getView().byId("apiDetailObjectPage").scrollToSection(oSection.getId(), 250);
				}

			},

			_scrollContentToTop: function () {
				if (this._objectPage && this._objectPage.$().length > 0) {
					this._objectPage.getScrollDelegate().scrollTo(0, 0);
				}
			},

			/**
			 * Creates the <code>Entity</code> model,
			 * based on the <code>ControlsInfo</code> data.
			 * <b>Note:</b>
			 * The method is called in the <code>_onControlsInfoLoaded</code> callBack
			 * just once, when the <code>ControlsInfo</code> is loaded.
			 * After that, the method is called in <code>_onTopicMatched</code>,
			 * whenever a different topic has been selected.
			 */
			_bindEntityData: function (sTopicId) {

				ControlsInfo.loadData().then(function (oControlsData) {
					var oEntityData = this._getEntityData(sTopicId, oControlsData);

					this.getModel("entity").setData(oEntityData, false);
				}.bind(this));

			},

			_bindData: function (sTopicId) {
				var aLibsData = this.getOwnerComponent().getModel("libsData").getData(),
					oControlData = aLibsData[sTopicId],
					aTreeData = this.getOwnerComponent().getModel("treeData").getData(),
					aControlChildren = this._getControlChildren(aTreeData, sTopicId),
					oModel,
					oConstructorParamsModel = {parameters: []},
					oBorrowedMethodsModel,
					oMethodsModelData = {methods: []},
					oMethodsModel,
					oEventsModel = {events: []},
					oUi5Metadata,
					i;

				if (aControlChildren) {
					if (!oControlData) {
						oControlData = {};
					}
					oControlData.controlChildren = aControlChildren;
					this._addChildrenDescription(aLibsData, oControlData.controlChildren);
				}

				oUi5Metadata = oControlData['ui5-metadata'];

				if (oControlData.controlChildren) {
					oControlData.hasChildren = true;
				} else {
					oControlData.hasChildren = false;
				}

				if (oControlData.hasOwnProperty('properties') && this.hasVisibleElement(oControlData.properties)) {
					oControlData.hasProperties = true;
				} else {
					oControlData.hasProperties = false;
				}

				oControlData.hasConstructor = oControlData.hasOwnProperty('constructor');

				if (oUi5Metadata && oUi5Metadata.properties && this.hasVisibleElement(oUi5Metadata.properties)) {
					oControlData.hasControlProperties = true;
				} else {
					oControlData.hasControlProperties = false;
				}

				if (oControlData && oControlData.events) {
					oControlData.hasEvents = true;
				} else {
					oControlData.hasEvents = false;
				}

				oControlData.hasMethods = oControlData.hasOwnProperty('methods') &&
					this.hasVisibleElement(oControlData.methods);

				if (oUi5Metadata && oUi5Metadata.associations && this.hasVisibleElement(oUi5Metadata.associations)) {
					oControlData.hasAssociations = true;
				} else {
					oControlData.hasAssociations = false;
				}

				if (oUi5Metadata && oUi5Metadata.aggregations && this.hasVisibleElement(oUi5Metadata.aggregations)) {
					oControlData.hasAggregations = true;
				} else {
					oControlData.hasAggregations = false;
				}

				if (oUi5Metadata && oUi5Metadata.specialSettings && this.hasVisibleElement(oUi5Metadata.specialSettings)) {
					oControlData.hasSpecialSettings = true;
				} else {
					oControlData.hasSpecialSettings = false;
				}

				if (oUi5Metadata && oUi5Metadata.annotations && Object.keys(oUi5Metadata.annotations).length > 0) {
					if (!oControlData.hasAnnotations) {
						oUi5Metadata.annotations.unshift({});
					}
					oControlData.hasAnnotations = true;
				} else {
					oControlData.hasAnnotations = false;
				}

				if (oControlData.hasConstructor && oControlData.constructor.parameters) {
					for (i = 0; i < oControlData.constructor.parameters.length; i++) {
						this.subParamPhoneName = oControlData.constructor.parameters[i].name;
						oConstructorParamsModel.parameters =
							oConstructorParamsModel.parameters.concat(this._getParameters(oControlData.constructor.parameters[i]));
					}
					this.subParamPhoneName = '';
				}

				if (oControlData.hasMethods) {
					oMethodsModelData.methods = this.buildMethodsModel(oControlData.methods);
				}

				if (oControlData.hasEvents) {
					oEventsModel.events = this.buildEventsModel(oControlData.events);
				}

				oControlData.borrowed = this.buildBorrowedModel(sTopicId, aLibsData, oControlData.methods);

				if (oControlData.implements && oControlData.implements.length) {
					oControlData.implementsParsed = oControlData.implements.map(function (item, idx, array) {
						var aDisplayNameArr = item.split("."),
							sDisplayName = aDisplayNameArr[aDisplayNameArr.length - 1];
						return {
							href: item,
							name: sDisplayName,
							isLast: idx === array.length - 1
						};
					});
					oControlData.hasImplementsData = true;
				} else {
					oControlData.hasImplementsData = false;
				}

				oControlData.isClass = oControlData.kind === "class";
				oControlData.isDerived = !!oControlData.extends;
				oControlData.extendsText = oControlData.extends || this.NOT_AVAILABLE;
				oControlData.sinceText = oControlData.since || this.NOT_AVAILABLE;
				oControlData.module = oControlData.module || this.NOT_AVAILABLE;

				// Handle references
				this._modifyReferences(oControlData);

				oMethodsModel = this.getModel("methods");
				oBorrowedMethodsModel = this.getModel("borrowedMethods");

				// BPC: 1780339157 - There are cases where we have more than 100 method entries so we need to increase
				// the default model size limit for the methods and the borrowed methods model.
				oMethodsModel.setSizeLimit(1000);
				oBorrowedMethodsModel.setSizeLimit(1000);

				this.getModel("topics").setSizeLimit(1000);
				this.getModel("topics").setData(oControlData, false /* no merge with previous data */);
				this.getModel("constructorParams").setData(oConstructorParamsModel, false /* no merge with previous data */);
				oMethodsModel.setData(oMethodsModelData, false /* no merge with previous data */);
				oMethodsModel.setDefaultBindingMode("OneWay");
				this.getModel('events').setData(oEventsModel, false /* no merge with previous data */);
				this.getModel('events').setDefaultBindingMode("OneWay");
				oBorrowedMethodsModel.setData(oControlData.borrowed.methods, false);
				this.getModel('borrowedEvents').setData(oControlData.borrowed.events, false);

				if (this.extHookbindData) {
					this.extHookbindData(sTopicId, oModel);
				}
			},

			/**
			 * Pre-process and modify references
			 * @param {object} oControlData control data object which will be modified
			 * @private
			 */
			_modifyReferences: function (oControlData) {
				var bHeaderDocuLinkFound = false,
					aReferences = oControlData.references;

				if (aReferences && aReferences.length > 0) {
					oControlData.references = aReferences.map(function (sReference) {
						var aParts;

						// For the header we take into account only the first link that matches one of the patterns
						if (!bHeaderDocuLinkFound) {
							// Handled patterns:
							// * topic:59a0e11712e84a648bb990a1dba76bc7
							// * {@link topic:59a0e11712e84a648bb990a1dba76bc7}
							// * {@link topic:59a0e11712e84a648bb990a1dba76bc7 Link text}
							aParts = sReference.match(/^{@link\s+topic:(\w{32})(\s.+)?}$|^topic:(\w{32})$/);
							if (aParts) {
								if (aParts[3]) {
									// Link is of type topic:GUID
									oControlData.docuLink = aParts[3];
									oControlData.docuLinkText = oControlData.basename;
								} else if (aParts[1]) {
									// Link of type {@link topic:GUID} or {@link topic:GUID Link text}
									oControlData.docuLink = aParts[1];
									oControlData.docuLinkText = aParts[2] ? aParts[2] : oControlData.basename;
								}
								bHeaderDocuLinkFound = true;
							} else {
								return sReference;
							}
						} else {
							return sReference;
						}
					});
				} else {
					oControlData.references = [];
				}
			},

			_getControlChildren: function (aTreeData, sTopicId) {
				for (var i = 0; i < aTreeData.length; i++) {
					if (aTreeData[i].name === sTopicId) {
						return aTreeData[i].nodes;
					}
				}
			},

			_addChildrenDescription: function (aLibsData, aControlChildren) {
				for (var i = 0; i < aControlChildren.length; i++) {
					aControlChildren[i].description = aLibsData[aControlChildren[i].name].description;
					aControlChildren[i].link = "{@link " + aControlChildren[i].name + "}";
				}
			},

			/**
			 * Retrieves the <code>Entity</code> model data.
			 * @param {Object} oLibData
			 * @return {Object}
			 */
			_getEntityData: function (sEntityName, oControlsData) {
				var aFilteredEntities = oControlsData.entities.filter(function (entity) {
					return entity.id === sEntityName;
				});
				var oEntity = aFilteredEntities.length ? aFilteredEntities[0] : undefined;

				var sAppComponent = this._getControlComponent(sEntityName, oControlsData);

				return {
					appComponent: sAppComponent || this.NOT_AVAILABLE,
					sample: (oEntity && sEntityName) || this.NOT_AVAILABLE,
					hasSample: !!(oEntity && oEntity.sampleCount > 0)
				};
			},

			/**
			 * Adjusts methods info so that it can be easily displayed in a table
			 * @param methods - the methods array initially coming from the server
			 * @returns {Array} - the adjusted array
			 */
			buildMethodsModel: function (methods) {
				var bIsInternalVersion = this.getModel("versionData").getProperty("/isInternal");

				// No methods, do nothing
				if (!methods.length) {
					return methods;
				}

				var result = methods.filter(function (method) {/* exclude restricted methods from none-internal versions */
					return bIsInternalVersion ? true : method.visibility !== "restricted";
				}).map(function (method) {
					var subParameters = [];
					method.parameters = method.parameters || [];

					// Handle multiple values
					method.parameters = method.parameters.map(function (param) {
						var paramProperties, paramTypes;
						var types = (param.type || "").split("|");
						param.types = [];
						for (var i = 0; i < types.length; i++) {
							param.types.push({
								value: types[i],
								isLast: i === types.length - 1
							});
						}

						if (param.parameterProperties && !method.subParametersInjected) {
							paramProperties = param.parameterProperties;
							for (var prop in paramProperties) {
								paramTypes = (paramProperties[prop].type || "").split("|");
								paramProperties[prop].types = [];
								paramProperties[prop].types = paramTypes.map(function (currentType, idx, array) {
									return {
										value: currentType,
										isLast: idx === array.length - 1
									};
								});
								paramProperties[prop].isSubProperty = true;
								paramProperties[prop].phoneName = param.name + '.' + paramProperties[prop].name;
								subParameters.push(paramProperties[prop]);
							}
						}

						return param;
					});

					// Format return value
					if (method.returnValue) {
						var types = (method.returnValue.type || "").split("|");
						method.returnValue.types = [];
						for (var i = 0; i < types.length; i++) {
							method.returnValue.types.push({
								value: types[i],
								isLast: i === types.length - 1
							});
						}
					}

					if (!method.subParametersInjected) {
						method.parameters = method.parameters.concat(subParameters);
						method.subParametersInjected = true;
					}

					return method;

				});

				// Prepend an empty item so that it is replaced by the summary subsection
				result.unshift({});

				return result;
			},

			buildBorrowedModel: function (sTopicId, aLibsData, aMethods) {
				var aBaseClassMethods,
					aBaseClassEvents,
					sBaseClass,
					aBorrowChain,
					oBaseClass,
					aMethodNames;

				aBorrowChain = {
					methods: [],
					events: []
				};
				sBaseClass = aLibsData[sTopicId] ? aLibsData[sTopicId].extends : "";

				var fnVisibilityFilter = function (item) {
					return this._aAllowedMembers.indexOf(item.visibility) !== -1;
				}.bind(this);

				// Get all method names
				aMethods = aMethods || [];
				aMethodNames = aMethods.map(function (oMethod) {
					return oMethod.name;
				});

				// Filter all borrowed methods and if some of them are overridden by the class
				// we should exclude them from the borrowed methods list. BCP: 1780319087
				var fnOverrideMethodFilter = function (item) {
					return aMethodNames.indexOf(item.name) === -1;
				};

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

				while (sBaseClass) {
					oBaseClass = aLibsData[sBaseClass];
					if (!oBaseClass) {
						break;
					}

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

					sBaseClass = oBaseClass.extends;
				}

				return aBorrowChain;
			},

			/**
			 * Adjusts events info so that it can be easily displayed in a table
			 * @param events - the events array initially coming from the server
			 * @returns {Array} - the adjusted array
			 */
			buildEventsModel: function (events) {
				// No events, do nothing
				if (events.length === 0) {
					return events;
				}

				// Transform the key-value pairs of event parameters into an array
				var result = events.map(function (event) {
					if (event.parameters && !event.subParametersInjected) {
						var aParameters = [];
						event.parameters.map(function (oParam) {
							this.subParamPhoneName = oParam.name;
							aParameters = aParameters.concat(this._getParameters(oParam));
						}, this);
						this.subParamPhoneName = '';

						event.parameters = aParameters;
						event.subParametersInjected = true;
					}

					return event;
				}, this);

				// Prepend an empty item so that it is replaced by the summary subsection
				result.unshift({});

				return result;
			},

			subParamLevel: 0,
			subParamPhoneName: '',

			_getParameters: function (oParam) {
				var result = [oParam];

				var types = (oParam.type || "").split("|"),
					paramTypes;

				oParam.types = [];
				for (var i = 0; i < types.length; i++) {
					oParam.types.push({
						value: types[i],
						isLast: i === types.length - 1
					});
				}

				if (oParam.parameterProperties) {
					this.subParamLevel++;
					for (var subParam in oParam.parameterProperties) {
						var subPropertyString = 'is';

						for (var i = 0; i < this.subParamLevel; i++) {
							subPropertyString += 'Sub';
						}

						subPropertyString += 'Property';

						this.subParamPhoneName += '.' + subParam;

						oParam.parameterProperties[subParam][subPropertyString] = true;
						oParam.parameterProperties[subParam].phoneName = this.subParamPhoneName;

						paramTypes = (oParam.parameterProperties[subParam].type || "").split("|");
						oParam.parameterProperties[subParam].types = [];
						oParam.parameterProperties[subParam].types = paramTypes.map(function (currentType, idx, array) {
							return {
								value: currentType,
								isLast: idx === array.length - 1
							};
						});

						result = result.concat(this._getParameters(oParam.parameterProperties[subParam]));

						if (this.subParamPhoneName.indexOf('.') > -1) {
							this.subParamPhoneName = this.subParamPhoneName.substring(0, this.subParamPhoneName.lastIndexOf('.'));
						} else {
							this.subParamPhoneName = '';
						}
					}
					this.subParamLevel--;
				}

				return result;
			},

			/**
			 * Adds "deprecated" information if such exists to the header area
			 * @param deprecated - object containing information about deprecation
			 * @returns {string} - the deprecated text to display
			 */
			formatSubtitle: function (deprecated) {
				var result = "";

				if (deprecated) {
					result += "Deprecated in version: " + deprecated.since;
				}

				return result;
			},

			/**
			 * Formats the constructor of the class
			 * @param name
			 * @param params
			 * @returns string - The code needed to create an object of that class
			 */
			formatConstructor: function (name, params) {
				var result = '<pre class="sapUiDocumentationAPICode">new ';

				if (name) {
					result += name + '(';
				}

				if (params) {
					params.forEach(function (element, index, array) {
						result += element.name;

						if (element.optional) {
							result += '?';
						}

						if (index < array.length - 1) {
							result += ', ';
						}
					});
				}

				if (name) {
					result += ')</pre>';
				}

				return result;
			},

			_formatChildDescription: function (description) {
				if (description) {
					description = this._extractFirstSentence(description);
					description = this._wrapInSpanTag(description);
					return "<div>" + description + "<\div>";
				}
			},

			_extractFirstSentence: function (description) {
				var descriptionCopy = description.slice(), iSkipPosition;

				//Control description is not properly formatted and should be skipped.
				if (description.lastIndexOf("}") > description.lastIndexOf(".")) {
					return "";
				}

				descriptionCopy = this._sliceSpecialTags(descriptionCopy, "{", "}");
				descriptionCopy = this._sliceSpecialTags(descriptionCopy, "<code>", "</code>");
				iSkipPosition = description.length - descriptionCopy.length;
				description = description.slice(0, descriptionCopy.indexOf(".") + ".".length + iSkipPosition);
				return description;
			},

			_sliceSpecialTags: function (descriptionCopy, startSymbol, endSymbol) {
				var startIndex, endIndex;
				while (descriptionCopy.indexOf(startSymbol) !== -1 && descriptionCopy.indexOf(startSymbol) < descriptionCopy.indexOf(".")) {
					startIndex = descriptionCopy.indexOf(startSymbol);
					endIndex = descriptionCopy.indexOf(endSymbol);
					descriptionCopy = descriptionCopy.slice(0, startIndex) + descriptionCopy.slice(endIndex + endSymbol.length, descriptionCopy.length);
				}
				return descriptionCopy;
			},

			/**
			 * Formats the default value of the property as a string.
			 * @param defaultValue - the default value of the property
			 * @returns string - The default value of the property formatted as a string.
			 */
			formatDefaultValue: function (defaultValue) {
				switch (defaultValue) {
					case null:
						return '';
					case undefined:
						return '';
					case '':
						return 'empty string';
					default:
						return defaultValue;
				}
			},

			/**
			 * Formats the name of a property or a method depending on if it's static or not
			 * @param sName {string} - Name
			 * @param sClassName {string} - Name of the class
			 * @param bStatic {boolean} - If it's static
			 * @returns {string} - Formatted name
			 */
			formatEntityName: function (sName, sClassName, bStatic) {
				return (bStatic === true) ? sClassName + "." + sName : sName;
			},

			/**
			 * Formats the entity deprecation message and pre-process jsDoc link and code blocks
			 * @param {string} sSince since text
			 * @param {string} sDescription deprecation description text
			 * @param {string} sEntityType string representation of entity type
			 * @returns {string} formatted deprecation message
			 */
			formatDeprecated: function (sSince, sDescription, sEntityType) {
				var aResult;
				// Evaluate links and code blocks in the deprecation description

				if (sDescription) {
					// Handle {@link ...}, {@link ... ...}, {@link #...} and <code>...</code> patterns
					sDescription = sDescription.replace(/{@link\s+([^}\s]+)(?:\s+([^}]*))?}|<code>(\S+)<\/code>/gi,
						function (sMatch, sEntity, sName, sCodeEntity) {
							var sTarget;

							if (sCodeEntity) {
								// Handle code block pattern
								return ['<em>', sCodeEntity, '</em>'].join("");
							} else {
								// Handle link patterns

								// Build Target
								if (sEntityType) {
									// Handle hash pattern - used for methods and events on some occasions
									sEntity = sEntity[0] === "#" ? sEntity.substring(1, sEntity.length) : sEntity;
									sTarget = [this._sTopicid, "/", sEntityType, "/", sEntity].join("");
								} else {
									// Direct link to entity
									sTarget = sEntity;
								}

								// link attributes should follow the pattern {href="URL" target="entity|method|event"}
								return ['<a href="#/api/', sTarget, '">', (sName ? sName : sEntity), '</a>'].join("");
							}

						}.bind(this));
				}

				// Build deprecation message
				// Note: there may be no since or no description text available
				aResult = ["Deprecated"];
				if (sSince) {
					aResult.push(" since " + sSince);
				}
				if (sDescription) {
					aResult.push(". " + sDescription);
				}

				return aResult.join("");
			},

			/**
			 * Formats method deprecation message and pre-process jsDoc link and code blocks
			 * @param {string} sSince since text
			 * @param {string} sDescription deprecation description text
			 * @returns {string} formatted deprecation message
			 */
			formatMethodDeprecated: function (sSince, sDescription) {
				return this.formatDeprecated(sSince, sDescription, "methods");
			},

			/**
			 * Formats event deprecation message and pre-process jsDoc link and code blocks
			 * @param {string} sSince since text
			 * @param {string} sDescription deprecation description text
			 * @returns {string} formatted deprecation message
			 */
			formatEventDeprecated: function (sSince, sDescription) {
				return this.formatDeprecated(sSince, sDescription, "events");
			},

			formatExample: function (sCaption, sText) {
				return this.formatDescription(
					["<span><strong>Example: </strong>",
						sCaption,
						"<pre class='sapUiSmallMarginTop'>",
						sText,
						"</pre></span>"].join("")
				);
			},

			/**
			 * Formatter for Overview section
			 * @param {string} sDescription - Class about description
			 * @param {array} aReferences - References
			 * @returns {string} - formatted text block
			 */
			formatOverviewDescription: function (sDescription, aReferences) {
				var iLen,
					i;

				// format references
				if (aReferences && aReferences.length > 0) {
					sDescription += "<br/><br/><span>References:</span><ul>";

					iLen = aReferences.length;
					for (i = 0; i < iLen; i++) {
						// We treat references as links but as they may not be defined as such we enforce it if needed
						if (/{@link.*}/.test(aReferences[i])) {
							sDescription += "<li>" + aReferences[i] + "</li>";
						} else {
							sDescription += "<li>{@link " + aReferences[i] + "}</li>";
						}
					}

					sDescription += "</ul>";
				}

				// Calling formatDescription so it could handle further formatting
				return this.formatDescription(sDescription);
			},

			/**
			 * Formats the description of the property
			 * @param description - the description of the property
			 * @param deprecatedText - the text explaining this property is deprecated
			 * @param deprecatedSince - the version when this property was deprecated
			 * @returns string - the formatted description
			 */
			formatDescription: function (description, deprecatedText, deprecatedSince) {
				if (!description && !deprecatedText && !deprecatedSince) {
					// Note we have to always return a string wrapped in a valid html tag else parsing it with
					// sap.ui.core.HTML control will fail.
					return "<span/>";
				}

				var result = description || "";

				if (deprecatedSince || deprecatedText) {
					result += "<span class=\"sapUiDocumentationDeprecated\">";

					if (deprecatedSince) {
						result += '<br/>Deprecated since version ' + deprecatedSince + '.';
					}

					if (deprecatedText) {
						if (deprecatedSince) {
							result += ' ' + deprecatedText;
						} else {
							result += '<br/>' + deprecatedText;
						}
					}

					result += "</span>";
				}

				result = this._wrapInSpanTag(result);
				return result;
			},

			/**
			 * Formats the description of control properties
			 * @param description - the description of the property
			 * @param since - the since version information of the property
			 * @returns string - the formatted description
			 */
			formatDescriptionSince: function (description, since) {
				var result = description || "";

				if (since) {
					result += '<br/><br/><i>Since: ' + since + '.</i>';
				}

				result = this._wrapInSpanTag(result);
				return result;
			},

			/**
			 * Formats the description of annotations
			 * @param description - the description of the annotation
			 * @param since - the since version information of the annotation
			 * @returns string - the formatted description
			 */
			formatAnnotationDescription: function (description, since) {
				var result = description || "";

				result += '<br/>For more information, see ' + '<a target="_blank" href="' + this.ANNOTATIONS_LINK + '">OData v4 Annotations</a>';

				if (since) {
					result += '<br/><br/><i>Since: ' + since + '.</i>';
				}

				result = this._wrapInSpanTag(result);
				return result;
			},

			/**
			 * Formats the description of annotations in summary table
			 * @param description - the description of the annotation
			 * @returns string - the formatted description
			 */
			formatAnnotationDescriptionSummary: function (description) {
				var result = description || "";

				result = result.split(this.ANNOTATION_DESCRIPTION_STRIP_REGEX)[0];

				result = this._wrapInSpanTag(result);
				return result;
			},

			/**
			 * Formats the target and applies to texts of annotations
			 * @param target - the array of texts to be formatted
			 * @returns string - the formatted text
			 */
			formatAnnotationTarget: function (target) {
				var result = "";

				if (target) {
					target.forEach(function (element) {
						result += element + '<br/>';
					});
				}

				result = this._wrapInSpanTag(result);
				return result;
			},

			/**
			 * Formats the namespace of annotations
			 * @param namespace - the namespace to be formatted
			 * @returns string - the formatted text
			 */
			formatAnnotationNamespace: function (namespace) {
				var result,
					aNamespaceParts = namespace.split(".");

				if (aNamespaceParts[0] === "Org" && aNamespaceParts[1] === "OData") {
					result = '<a target="_blank" href="' + this.ANNOTATIONS_NAMESPACE_LINK + namespace + '.xml">' + namespace + '</a>';
				} else {
					result = namespace;
				}

				result = this._wrapInSpanTag(result);
				return result;
			},

			/**
			 * Checks if the list has elements that have public or protected visibility
			 * @param elements - a list of properties/methods/aggregations/associations etc.
			 * @returns {boolean} - true if the list has at least one public element
			 */
			hasVisibleElement: function (elements) {
				for (var i = 0; i < elements.length; i++) {
					if (this._aAllowedMembers.indexOf(elements[i].visibility) !== -1) {
						return true;
					}
				}

				return false;
			},

			/**
			 * Formats event or event parameter name
			 * @param eventInfo - object containing information about the event
			 * @returns {string} - the name of the event or if eventInfo is a event param - empty string
			 */
			formatEventsName: function (eventInfo) {

				return eventInfo ? eventInfo.name : "";

			},

			/**
			 * Helper function retrieving event parameter name
			 * @param eventInfo - object containing information about the event or the event parameter
			 * @returns {string} - Returns the name of the parameter or empty string
			 */
			formatEventsParam: function (eventInfo) {
				if (eventInfo && eventInfo.type != this.EVENT) {
					return eventInfo.name;
				} else {
					return "";
				}
			},

			formatMethodCode: function (sName, aParams, aReturnValue) {
				var result = '<pre class="sapUiDocumentationAPICode">' + sName + '(';

				if (aParams && aParams.length > 0) {
					aParams.forEach(function (element, index, array) {
						if (element.isSubProperty || element.isSubSubProperty) {
							return;
						}

						result += element.name;

						if (element.optional) {
							result += '?';
						}

						if (index < array.length - 1) {
							result += ', ';
						}
					});
				}

				result += ') : ';

				if (aReturnValue) {
					result += aReturnValue.type;
				} else {
					result += 'void';
				}

				result += "</pre>";

				return result;
			},

			/**
			 * Helper function retrieving method parameter name
			 * @param methodInfo - object containing information about the method or the method parameter
			 * @returns {string} - the name of the parameter or empty string
			 */
			formatMethodsParam: function (methodInfo) {
				if (methodInfo && methodInfo.type != this.METHOD) {
					return methodInfo.name;
				} else {
					return "";
				}
			},

			/**
			 * Helper function that checks if a link points to a base type (e.g. int, string, object etc)
			 * @param linkText - the text of the link
			 * @returns {boolean} - False if link points to a base type
			 */
			formatLinkEnabled: function (linkText) {
				return this._baseTypes.indexOf(linkText.toLowerCase()) === -1;
			},

			formatExceptionLink: function (linkText) {
				linkText = linkText || '';
				return linkText.indexOf('sap.ui.') !== -1;
			},

			formatEventClassName: function (isSubProperty, isSubSubProperty, bPhoneSize) {
				if (bPhoneSize && (isSubProperty || isSubSubProperty)) {
					return "sapUiDocumentationParamPhone";
				} else if (isSubSubProperty) {
					return "sapUiDocumentationParamSubSub";
				} else if (isSubProperty) {
					return "sapUiDocumentationParamSub";
				} else {
					return "sapUiDocumentationParamBold";
				}
			},

			formatMethodClassName: function (isSubProperty, bPhoneSize) {
				if (bPhoneSize && isSubProperty) {
					return "sapUiDocumentationParamPhone";
				} else if (isSubProperty) {
					return "sapUiDocumentationParamSub";
				} else {
					return "sapUiDocumentationParamBold";
				}
			},

			onAnnotationsLinkPress: function (oEvent) {
				this._scrollToEntity("annotations", "Summary");
			},

			backToSearch: function () {
				this.onNavBack();
			},

			/**
			 * This function wraps a text in a span tag so that it can be represented in an HTML control.
			 * @param {string} sText
			 * @returns {string}
			 * @private
			 */
			_wrapInSpanTag: function (sText) {
				var topicsData = this.getModel('topics').oData,
					topicName = topicsData.name || "",
					topicMethods = topicsData.methods || [];

				var sFormattedTextBlock = JSDocUtil.formatTextBlock(sText, {
					linkFormatter: function (target, text) {

						var iHashIndex, // indexOf('#')
							iHashDotIndex, // indexOf('#.')
							iHashEventIndex, // indexOf('#event:')
							aMatched,
							sRoute = "api",
							sTargetBase,
							sScrollHandlerClass = "scrollToMethod",
							sEntityName,
							sLink;

						text = text || target; // keep the full target in the fallback text

						// If the link has a protocol, do not modify, but open in a new window
						if (target.match("://")) {
							return '<a target="_blank" href="' + target + '">' + text + '</a>';
						}

						target = target.trim().replace(/\.prototype\./g, "#");

						iHashIndex = target.indexOf('#');
						iHashDotIndex = target.indexOf('#.');
						iHashEventIndex = target.indexOf('#event:');

						if (iHashIndex === -1) {
							var lastDotIndex = target.lastIndexOf('.'),
								entityName = sEntityName = target.substring(lastDotIndex + 1),
								targetMethod = topicMethods.filter(function (method) {
									if (method.name === entityName) {
										return method;
									}
								})[0];

							if (targetMethod) {
								if (targetMethod.static === true) {
									sEntityName = target;
									// We need to handle links to static methods in a different way if static method is
									// a child of the current or a different entity
									sTargetBase = target.replace("." + entityName, "");
									if (sTargetBase.length > 0 && sTargetBase !== topicName) {
										// Different entity
										target = sTargetBase + "/methods/" + target;
										// We will navigate to a different entity so no scroll is needed
										sScrollHandlerClass = false;
									} else {
										// Current entity
										target = topicName + '/methods/' + target;
									}
								} else {
									target = topicName + '/methods/' + entityName;
								}
							} else {
								// Handle links to documentation
								aMatched = target.match(/^topic:(\w{32})$/);
								if (aMatched) {
									target = sEntityName = aMatched[1];
									sRoute = "topic";
								}
							}
						}

						if (iHashDotIndex === 0) {
							// clear '#.' from target string
							target = target.slice(2);

							target = topicName + '/methods/' + topicName + '.' + target;
						} else if (iHashEventIndex === 0) {
							// clear '#event:' from target string
							target = target.slice('#event:'.length);
							sEntityName = target;

							target = topicName + '/events/' + target;
							sScrollHandlerClass = "scrollToEvent";
						} else if (iHashIndex === 0) {
							// clear '#' from target string
							target = target.slice(1);
							sEntityName = target;

							target = topicName + '/methods/' + target;
						}

						if (iHashIndex > 0) {
							target = target.replace('#', '/methods/');
							sEntityName = target;
						}

						sLink = '<a class="jsdoclink';
						if (sScrollHandlerClass) {
							sLink += ' ' + sScrollHandlerClass;
						}
						sLink += '" href="#/' + sRoute + '/' + target +
							'" data-sap-ui-target="' + sEntityName + '">' + text + '</a>';

						return sLink;

					}
				});

				return '<span class="sapUiDocumentationJsDoc">' + sFormattedTextBlock + '</span>';
			}
		});

	}
);
