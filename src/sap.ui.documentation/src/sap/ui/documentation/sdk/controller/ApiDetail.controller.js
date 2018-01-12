/*!
 * ${copyright}
 */

/*global location */
sap.ui.define([
		"jquery.sap.global",
		"sap/ui/Device",
		"sap/ui/documentation/sdk/controller/BaseController",
		"sap/ui/model/json/JSONModel",
		"sap/ui/documentation/sdk/controller/util/ControlsInfo",
		"sap/ui/documentation/sdk/util/ToggleFullScreenHandler",
		"sap/uxap/ObjectPageSubSection",
		"sap/ui/documentation/sdk/controller/util/JSDocUtil"
	], function (jQuery, Device, BaseController, JSONModel, ControlsInfo, ToggleFullScreenHandler, ObjectPageSubSection, JSDocUtil) {
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
				"object",
				"object[]",
				"object|object[]",
				"function",
				"float",
				"int",
				"boolean",
				"string",
				"string[]",
				"number"
			],

			/* =========================================================== */
			/* lifecycle methods										   */
			/* =========================================================== */

			onInit: function () {
				this._objectPage = this.byId("apiDetailObjectPage");
				this.getRouter().getRoute("apiId").attachPatternMatched(this._onTopicMatched, this);

				// click handler for @link tags in JSdoc fragments
				this.getView().attachBrowserEvent("click", this.onJSDocLinkClick, this);

				this.setModel(new JSONModel(), "topics");
				this.setModel(new JSONModel(), "constructorParams");
				this.setModel(new JSONModel(), 'methods');
				this.setModel(new JSONModel(), 'events');
				this.setModel(new JSONModel(), "entity");
				this.setModel(new JSONModel(), "borrowedMethods");
				this.setModel(new JSONModel(), "borrowedEvents");

				this.getView().byId("apiDetailObjectPage").attachEvent("onAfterRenderingDOMReady", function () {
					jQuery.sap.delayedCall(250, this, function () {
						this._scrollToEntity(this._sEntityType, this._sEntityId);
					});
				}, this);
			},

			onAfterRendering: function () {
				this._createMethodsSummary();
				this._createEventsSummary();
				this._createAnnotationsSummary();
			},

			onExit: function () {
				this.getView().detachBrowserEvent("click", this.onJSDocLinkClick, this);
			},

			onSampleLinkPress: function (oEvent) {
				// Navigate to Control Sample section
				var sEntityName = oEvent.getSource().data("name");
				this.getRouter().navTo("entity", {id: sEntityName, part: "samples"}, true);
			},

			onToggleFullScreen: function (oEvent) {
				ToggleFullScreenHandler.updateMode(oEvent, this.getView(), this);
			},

			onJSDocLinkClick: function (oEvent) {
				var sRoute = "apiId",
					oComponent = this.getOwnerComponent(),
					aLibsData = oComponent.getModel("libsData").getData(),
					sTarget = oEvent.target.getAttribute("data-sap-ui-target"),
					sMethodName = "",
					aNavInfo;

				if (!sTarget) {
					return;
				}

				if (sTarget.indexOf('/') >= 0) {
					// link refers to a method or event data-sap-ui-target="<class name>/methods/<method name>" OR
					// data-sap-ui-target="<class name>/events/<event name>
					aNavInfo = sTarget.split('/');

					if (aNavInfo[0] === this._sTopicid && aNavInfo[1] === this._sEntityType && aNavInfo[2] === this._sEntityId) {
						this._scrollToEntity(aNavInfo[1], aNavInfo[2]);
					} else {
						oComponent.getRouter().navTo(sRoute, {
							id: aNavInfo[0],
							entityType: aNavInfo[1],
							entityId: aNavInfo[2]
						}, false);
					}
				} else if (!aLibsData[sTarget]) {
					// link refers to a method
					sMethodName = sTarget.slice(sTarget.lastIndexOf('.') + 1);
					sTarget = sTarget.slice(0, sTarget.lastIndexOf("."));

					oComponent.getRouter().navTo(sRoute, {
						id: sTarget,
						entityType: "methods",
						entityId: sMethodName
					}, false);
				} else {
					oComponent.getRouter().navTo(sRoute, {id: sTarget}, false);
				}

				oEvent.preventDefault();
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
				this._sTopicid = oEvent.getParameter("arguments").id;
				this._sEntityType = oEvent.getParameter("arguments").entityType;
				this._sEntityId = oEvent.getParameter("arguments").entityId;

				this.getOwnerComponent().fetchAPIInfoAndBindModels().then(function () {

					this._bindData(this._sTopicid);
					this._bindEntityData(this._sTopicid);
					this._createMethodsSummary();
					this._createEventsSummary();
					this._createAnnotationsSummary();

					if (this._sEntityType) {
						this._scrollToEntity(this._sEntityType, this._sEntityId);
					} else {
						this._scrollContentToTop();
					}

					setTimeout(this._prettify, 0);

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
				var oLink = oEvent.getSource();
				this._scrollToEntity("methods", oLink.getText());
			},

			scrollToEvent: function (oEvent) {
				var oLink = oEvent.getSource();
				this._scrollToEntity("events", oLink.getText());
			},

			scrollToAnnotation: function (oEvent) {
				var oLink = oEvent.getSource();
				this._scrollToEntity("annotations", oLink.getText());
			},

			_scrollToEntity: function (sSectionId, sSubSectionTitle) {

				var oSection = this.getView().byId(sSectionId);
				if (!oSection) {
					return;
				}

				var aSubSections = oSection.getSubSections();
				var aFilteredSubSections = aSubSections.filter(function (oSubSection) {
					return oSubSection.getTitle() === sSubSectionTitle;
				});

				if (aFilteredSubSections.length) {
					this.getView().byId("apiDetailObjectPage").scrollToSection(aFilteredSubSections[0].getId(), 250);
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
					oUi5Metadata;


				if (aControlChildren) {
					if (!oControlData) {
						oControlData = {};
					}
					oControlData.controlChildren = aControlChildren;
					this._addChildrenDescription(aLibsData, oControlData.controlChildren);
				}

				oUi5Metadata = oControlData['ui5-metadata'];

				this.getView().byId('apiDetailPage').setBusy(false);
				this.getView().byId('apiDetailObjectPage').setVisible(true);

				if (oControlData.controlChildren) {
					oControlData.hasChildren = true;
				} else {
					oControlData.hasChildren = false;
				}

				if (oControlData.hasOwnProperty('properties') && this.hasPublicElement(oControlData.properties)) {
					oControlData.hasProperties = true;
				} else {
					oControlData.hasProperties = false;
				}

				oControlData.hasConstructor = oControlData.hasOwnProperty('constructor');

				if (oUi5Metadata && oUi5Metadata.properties && this.hasPublicElement(oUi5Metadata.properties)) {
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
					this.hasPublicElement(oControlData.methods);

				if (oUi5Metadata && oUi5Metadata.associations && this.hasPublicElement(oUi5Metadata.associations)) {
					oControlData.hasAssociations = true;
				} else {
					oControlData.hasAssociations = false;
				}

				if (oUi5Metadata && oUi5Metadata.aggregations && this.hasPublicElement(oUi5Metadata.aggregations)) {
					oControlData.hasAggregations = true;
				} else {
					oControlData.hasAggregations = false;
				}

				if (oUi5Metadata && oUi5Metadata.specialSettings && this.hasPublicElement(oUi5Metadata.specialSettings)) {
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
					for (var i = 0; i < oControlData.constructor.parameters.length; i++) {
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

				oControlData.borrowed = this.buildBorrowedModel(sTopicId, aLibsData);

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

				// TODO: This is a temporary solution
				// It's executed here where we have all instances of the CodeEditor created
				this.getView().findAggregatedObjects(true, function (oElement) {
					if (oElement instanceof sap.ui.codeeditor.CodeEditor) {
						// We are replacing the "focus" on the editor instance method as it is
						// triggering the unwanted scroll
						oElement._getEditorInstance().focus = function () {
						};
					}
				});
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
				var bIsInternalVersion = this.getOwnerComponent().isInternalVersion();

				// No methods, do nothing
				if (!methods.length) {
					return methods;
				}

				var result = methods.filter(function (method) {
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

			buildBorrowedModel: function (sTopicId, aLibsData) {
				var aBaseClassMethods,
					aBaseClassEvents,
					sBaseClass,
					aBorrowChain,
					oBaseClass;

				aBorrowChain = {
					methods: [],
					events: []
				};
				sBaseClass = aLibsData[sTopicId] ? aLibsData[sTopicId].extends : "";

				var fnVisibilityFilter = function (item) {
					return item.visibility === "public";
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

					aBaseClassMethods = (oBaseClass.methods || []).filter(fnVisibilityFilter).map(fnMethodsMapper);
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
				var result = 'new ';

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
					result += ')';
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
			 * Formats the description of the property
			 * @param description - the description of the property
			 * @param deprecatedText - the text explaining this property is deprecated
			 * @param deprecatedSince - the verstion when this property was deprecated
			 * @returns string - the formatted description
			 */
			formatDescription: function (description, deprecatedText, deprecatedSince) {
				if (!description && !deprecatedText && !deprecatedSince) {
					return "";
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
			 * Checks if the list has elements that have public visibility
			 * @param elements - a list of properties/methods/aggregations/associations etc.
			 * @returns {boolean} - true if the list has at least one public element
			 */
			hasPublicElement: function (elements) {
				for (var i = 0; i < elements.length; i++) {
					if (elements[i].visibility === 'public') {
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
				var result = sName + '(';

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
				return this._baseTypes.indexOf(linkText) === -1;
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

			/**
			 * Event handler when a link pointing to a non-base type is pressed
			 * @param e
			 */
			onTypeLinkPress: function (e) {
				var type = e.getSource().getText();
				type = type.replace('[]', ''); // remove array brackets before navigation
				this.getRouter().navTo("apiId", {id: type}, true);
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
							iHashEventIndex; // indexOf('#event:')

						// If the link has a protocol, do not modify, but open in a new window
						if (target.match("://")) {
							return '<a target="_blank" href="' + target + '">' + (text || target) + '</a>';
						}

						target = target.trim().replace(/\.prototype\./g, "#");

						iHashIndex = target.indexOf('#');
						iHashDotIndex = target.indexOf('#.');
						iHashEventIndex = target.indexOf('#event:');

						if (iHashIndex === -1) {
							var lastDotIndex = target.lastIndexOf('.'),
								entityName = target.substring(lastDotIndex + 1),
								targetMethod = topicMethods.filter(function (method) {
									if (method.name === entityName) {
										return method;
									}
								})[0];

							if (targetMethod) {
								text = text || target;

								if (targetMethod.static === true) {
									target = topicName + '/methods/' + target;
								} else {
									target = topicName + '/methods/' + entityName;
								}
							}
						}

						if (iHashDotIndex === 0) {
							// clear '#.' from target string
							target = target.slice(2);

							// if no text is defined for the link, display the method name only
							text = text || target;

							target = topicName + '/methods/' + topicName + '.' + target;
						} else if (iHashEventIndex === 0) {
							// clear '#event:' from target string
							target = target.slice('#event:'.length);

							// if no text is defined for the link, display the method name only
							text = text || target;

							target = topicName + '/events/' + target;
						} else if (iHashIndex === 0) {
							// clear '#' from target string
							target = target.slice(1);

							// if no text is defined for the link, display the method name only
							text = text || target;

							target = topicName + '/methods/' + target;
						}

						if (iHashIndex > 0) {
							text = text || target; // keep the full target in the fallback text
							target = target.slice(0, iHashIndex);
						}

						return "<a class=\"jsdoclink\" href=\"javascript:void(0);\" data-sap-ui-target=\"" + target + "\">" + (text || target) + "</a>";

					}
				});

				return '<span class="sapUiDocumentationJsDoc">' + sFormattedTextBlock + '</span>';
			}
		});

	}
);
