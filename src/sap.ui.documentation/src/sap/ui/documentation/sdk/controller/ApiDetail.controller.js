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
		"sap/ui/documentation/sdk/controller/util/JSDocUtil",
	"sap/ui/documentation/sdk/controller/util/APIInfo"
	], function (jQuery, BaseController, JSONModel, ControlsInfo, ToggleFullScreenHandler, ObjectPageSubSection,
				 JSDocUtil, APIInfo) {
		"use strict";

		return BaseController.extend("sap.ui.documentation.sdk.controller.ApiDetail", {

			METHOD: 'method',
			EVENT: 'event',
			PARAM: 'param',
			NOT_AVAILABLE: 'N/A',
			NOT_FOUND: 'Not found',
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

				this._oLibsModel = new JSONModel();
				this._oLibsModel.setSizeLimit(1000000);

				this.setModel(new JSONModel(), "topics");
				this.setModel(new JSONModel(), "constructorParams");
				this.setModel(new JSONModel(), 'methods');
				this.setModel(new JSONModel(), 'events');
				this.setModel(new JSONModel(), "entity");
				this.setModel(new JSONModel(), "borrowedMethods");
				this.setModel(new JSONModel(), "borrowedEvents");

				this._objectPage.attachEvent("_sectionChange", function (oEvent) {
					var sSection = oEvent.getParameter("section").getTitle().toLowerCase(),
						sSubSection = (oEvent.getParameter("subsection") && oEvent.getParameter("subsection").getTitle() !== 'Overview') ? oEvent.getParameter("subsection").getTitle() : '';
					if (sSection === 'properties') {
						sSection = 'controlProperties';
					}
					if (sSection === 'fields') {
						sSection = 'properties';
					}
					this.getRouter().stop();
					this.getRouter().navTo("apiId", {
						id: this._sTopicid,
						entityType: sSection,
						entityId: sSubSection
					}, true);
					this.getRouter().initialize(true);
				}, this);
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

				oComponent.loadVersionInfo().then(oComponent.fetchAPIIndex.bind(oComponent))
					.then(function (oData) {
						var oEntityData,
							bFound = false,
							iLen,
							i;

						// Cache api-index data
						this._aApiIndex = oData;

						// Find entity in api-index
						for (i = 0, iLen = oData.length; i < iLen; i++) {
							if (oData[i].name === this._sTopicid || oData[i].name.indexOf(this._sTopicid) === 0) {
								oEntityData = oData[i];
								this._oEntityData = oEntityData;
								bFound = true;
								break;
							}
						}

						if (bFound) {
							// Load API.json only for selected lib
							return APIInfo.getLibraryElementsJSONPromise(oEntityData.lib).then(function (oData) {
								this._aLibsData = oData; // Cache received data
								return Promise.resolve(); // We have found the symbol and loaded the corresponding api.json
							}.bind(this));
						}

						// If we are here - the object does not exist so we reject the promise.
						return Promise.reject(this.NOT_FOUND);
					}.bind(this))
					.then(function () {
						var aLibsData = this._aLibsData,
						oControlData,
						iLen,
						i;

						// Find entity in loaded libs data
						for (i = 0, iLen = aLibsData.length; i < iLen; i++) {
							if (aLibsData[i].name === this._sTopicid) {
								oControlData = aLibsData[i];
								break;
							}
						}

						// Cache allowed members
						this._aAllowedMembers = this.getModel("versionData").getProperty("/allowedMembers");

						this.buildBorrowedModel(oControlData)
						.then(function (oData) {
							this.getModel('borrowedMethods').setData(oData.methods, false);
							this.getModel('borrowedEvents').setData(oData.events, false);
						}.bind(this))
						.then(function () {
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

							this.searchResultsButtonVisibilitySwitch(this.byId("apiDetailBackToSearch"));
						}.bind(this));
					}.bind(this))
					.catch(function (sReason) {
						// If the object does not exist in the available libs we redirect to the not found page and
						if (sReason === this.NOT_FOUND) {
							this._objectPage.setBusy(false);
							this.getRouter().myNavToWithoutHash("sap.ui.documentation.sdk.view.NotFound", "XML", false);
						}
					}.bind(this));

			},

			_prettify: function () {
				// Google Prettify requires this class
				jQuery('pre').addClass('prettyprint');

				window.prettyPrint();
			},

			_createMethodsSummary: function () {
				var oSummaryTable = sap.ui.xmlfragment(this.getView().getId() + "-methodsSummary", "sap.ui.documentation.sdk.view.ApiDetailMethodsSummary", this),
					oSection = this.byId("methods"),
					aSubSections = oSection.getSubSections(),
					oControlData = this.getModel("topics").getData(),
					bBorrowedOnly = oControlData.hasMethods && !oControlData.hasOwnMethods;

				if (aSubSections.length > 0 && (aSubSections[0].getTitle() === "Summary" || aSubSections[0].getTitle() === "Methods" || bBorrowedOnly)) {
					aSubSections[0].setTitle(bBorrowedOnly ? "Methods" : "Summary");

					return;
				}

				oSection.insertSubSection(new ObjectPageSubSection({
					title: bBorrowedOnly ? "Methods" : "Summary",
					blocks: [
						oSummaryTable
					]
				}), 0);
			},

			_createEventsSummary: function () {
				var oSummaryTable = sap.ui.xmlfragment(this.getView().getId() + "-eventsSummary", "sap.ui.documentation.sdk.view.ApiDetailEventsSummary", this),
					oSection = this.byId("events"),
					aSubSections = oSection.getSubSections(),
					oControlData = this.getModel("topics").getData(),
					bBorrowedOnly = oControlData.hasEvents && !oControlData.hasOwnEvents;

				if (aSubSections.length > 0 && (aSubSections[0].getTitle() === "Summary" || aSubSections[0].getTitle() === "Events" || bBorrowedOnly)) {
					aSubSections[0].setTitle(bBorrowedOnly ? "Events" : "Summary");

					return;
				}

				oSection.insertSubSection(new ObjectPageSubSection({
					title: bBorrowedOnly ? "Events" : "Summary",
					blocks: [
						oSummaryTable
					]
				}), 0);
			},

			_createAnnotationsSummary: function () {
				var oSummaryTable = sap.ui.xmlfragment(this.getView().getId() + "-annotationsSummary", "sap.ui.documentation.sdk.view.ApiDetailAnnotationsSummary", this);
				var oSection = this.byId("annotations");

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

				oSection = this.byId(sSectionId);
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
						this.byId("apiDetailObjectPage").scrollToSection(aFilteredSubSections[0].getId(), 250);
					}
				} else {
					// We scroll to section
					this.byId("apiDetailObjectPage").scrollToSection(oSection.getId(), 250);
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
					var oEntityData,
						oEntitySampleData = this._getEntitySampleData(sTopicId, oControlsData);

					oEntityData =  jQuery.extend({}, this._oEntityData, oEntitySampleData);

					this.getModel("entity").setData(oEntityData, false);

					// Builds the header layout, when all the needed data is ready
					this._buildHeaderLayout(this.getModel("topics").getData(), oEntityData);
				}.bind(this));

			},

			_bindData: function (sTopicId) {
				var aLibsData = this._aLibsData,
					oControlData,
					aTreeData = this.getOwnerComponent().getModel("treeData").getData(),
					aControlChildren = this._getControlChildren(aTreeData, sTopicId),
					oModel,
					oConstructorParamsModel = {parameters: []},
					oBorrowedMethodsModel,
					oMethodsModelData = {methods: []},
					oMethodsModel,
					oEventsModel = {events: []},
					oUi5Metadata,
					iLen,
					i;

				// Find entity in loaded libs data
				for (i = 0, iLen = aLibsData.length; i < iLen; i++) {
					if (aLibsData[i].name === this._sTopicid) {
						oControlData = aLibsData[i];
						break;
					}
				}

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
					oControlData.properties = oControlData.properties.filter(function (property) {/* exclude restricted fields from none-internal versions */
						return this._aAllowedMembers.indexOf(property.visibility) !== -1;
					}.bind(this));
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
					oControlData.hasOwnEvents = true;
				} else {
					oControlData.hasOwnEvents = false;
				}

				oControlData.hasOwnMethods = oControlData.hasOwnProperty('methods') &&
					this.hasVisibleElement(oControlData.methods);

				oControlData.hasEvents = oControlData.hasOwnEvents || this.getModel("borrowedEvents").getData().length > 0;
				oControlData.hasMethods = oControlData.hasOwnMethods || this.getModel("borrowedMethods").getData().length > 0;

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

				if (oControlData.hasOwnMethods) {
					oMethodsModelData.methods = this.buildMethodsModel(oControlData.methods);
				}

				if (oControlData.hasOwnEvents) {
					oEventsModel.events = this.buildEventsModel(oControlData.events);
				}

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
					aReferences = oControlData.constructor.references,
					sReference,
					aParts,
					iLen,
					i;

				oControlData.references = [];

				if (aReferences) {

					for (i = 0, iLen = aReferences.length; i < iLen; i++) {
						sReference = aReferences[i];

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
								oControlData.references.push(sReference);
							}
						} else {
							oControlData.references.push(sReference);
						}
					}

				}
			},

			_getHeaderLayoutUtil: function () {
				if (!this._oHeaderLayoutUtil) {
					var _getObjectAttributeBlock = function (sTitle, sText) {
						return new sap.m.ObjectAttribute({
							title: sTitle,
							text: sText
						}).addStyleClass("sapUiTinyMarginBottom");
					},
					_getLink = function(oConfig) {
						return new sap.m.Link(oConfig || {});
					},
					_getText = function(oConfig) {
						return new sap.m.Text(oConfig || {});
					},
					_getLabel = function(oConfig) {
						return new sap.m.Label(oConfig || {});
					},
					_getHBox = function(oConfig, bAddCommonStyles) {
						var oHBox = new sap.m.HBox(oConfig || {});

						if (bAddCommonStyles) {
							oHBox.addStyleClass("sapUiDocumentationHeaderNavLinks sapUiTinyMarginBottom");
						}

						return oHBox;
					};

					this._oHeaderLayoutUtil = {

						_getControlSampleBlock: function (oControlData, oEntityData) {
							return _getHBox({
								items: [
									_getLabel({design: "Bold", text: "Control Sample:"}),
									_getLink({
										emphasized: true,
										text: oEntityData.sample,
										visible: oEntityData.hasSample,
										href: "#/entity/" + oControlData.name
									}),
									_getText({text: oEntityData.sample, visible: !oEntityData.hasSample})
								]
							}, true);
						},
						_getDocumentationBlock: function (oControlData, oEntityData) {
							return _getHBox({
								items: [
									_getLabel({design: "Bold", text:"Documentation:"}),
									_getLink({emphasized: true, text: oControlData.docuLinkText, href: "#/topic/" + oControlData.docuLink})
								]
							}, true);
						},
						_getExtendsBlock: function (oControlData, oEntityData) {
							return _getHBox({
								items: [
									_getLabel({text: "Extends:"}),
									_getLink({text: oControlData.extendsText, href: "#/api/" + oControlData.extendsText, visible: oControlData.isDerived}),
									_getText({text: oControlData.extendsText, visible: !oControlData.isDerived})
								]
							}, true);
						},
						_getSubclassesBlock: function (oControlData, oEntityData) {
							var aSubClasses = oEntityData.extendedBy || oEntityData.implementedBy,
								oSubClassesLink;

							this._aSubClasses = aSubClasses;

							if (aSubClasses.length === 1) {
								oSubClassesLink = _getLink({text: aSubClasses[0], href: "#/api/" + aSubClasses[0]});
							} else {
								oSubClassesLink = _getLink({text: oControlData.isClass ? "View subclasses" : "View implementations", press: this._openSubclassesImplementationsPopover.bind(this)});
							}

							return _getHBox({
								items: [
									_getLabel({text: oControlData.isClass ? "Known direct subclasses:" : "Known direct implementations:"}),
									oSubClassesLink
								]
							}, true);
						},
						_getImplementsBlock: function (oControlData, oEntityData) {
							var aItems = [];

							oControlData.implementsParsed.forEach(function (oElement) {
								aItems.push(_getHBox({
									items: [
										_getLink({text: oElement.name, href: "#/api/" + oElement.href}),
										_getText({text: ",", visible: !oElement.isLast})
									]
								}));
							});

							return _getHBox({
								items: [
									_getLabel({text: "Implements:"}),
									new sap.m.HBox({items: aItems})
								]
							}, true);
						},
						_getModuleBlock: function (oControlData, oEntityData) {
							return _getObjectAttributeBlock("Module", oControlData.module);
						},
						_getLibraryBlock: function (oControlData, oEntityData) {
							return _getObjectAttributeBlock("Library", oEntityData.lib);
						},
						_getVisibilityBlock: function (oControlData, oEntityData) {
							return _getObjectAttributeBlock("Visibility", oControlData.visibility);
						},
						_getAvailableSinceBlock: function (oControlData, oEntityData) {
							return _getObjectAttributeBlock("Available since", oControlData.sinceText);
						},
						_getApplicationComponentBlock: function (oControlData, oEntityData) {
							return _getObjectAttributeBlock("Application Component", oEntityData.appComponent);
						}
					};
				}

				return this._oHeaderLayoutUtil;
			},

			/**
			 * Opens the Popover, which displays the entity subclasses, if the entity is a class.
			 * Or, it displays the direct implementations, if the entity is interface.
			 */
			_openSubclassesImplementationsPopover: function (oEvent) {
				var aPopoverContent = this._aSubClasses.map(function (oElement) {
						return new sap.m.Link({text: oElement, href: "#/api/" + oElement}).addStyleClass("sapUiTinyMarginBottom sapUiTinyMarginEnd");
				}), oPopover = this._getSubClassesAndImplementationsPopover(aPopoverContent);

				oPopover.openBy(oEvent.getSource());
			},

			_getSubClassesAndImplementationsPopover: function (aContent) {
				var oPopover = this._getPopover();

				if (oPopover.getContent().length > 0) {
					oPopover.destroyContent(); // destroy the old content, before adding the new one
				}

				(aContent || []).forEach(oPopover.addContent, oPopover);

				return oPopover;
			},

			_getPopover: function () {
				if (!this._oPopover) {
					this._oPopover = new sap.m.Popover({
						placement: "Bottom",
						showHeader: false
					}).addStyleClass("sapUiDocumentationSubclassesPopover");
				}

				return this._oPopover;
			},

			/**
			 * Builds the header layout structure.
			 * The header displays the entity data in 3 columns
			 * and each column can consist of 3 key-value pairs at most.
			 * @param {object} oControlData main control data object source
			 * @param {object} oEntityData additional data object source
			 */
				_buildHeaderLayout: function (oControlData, oEntityData) {
				var aHeaderControls = [[], [], []],
					oHeaderLayoutUtil = this._getHeaderLayoutUtil(),
					aSubClasses = oEntityData.extendedBy || oEntityData.implementedBy || [],
					aHeaderBlocksInfo = [
						{creator: "_getControlSampleBlock", exists: oControlData.isClass},
						{creator: "_getDocumentationBlock", exists: oControlData.docuLink !== undefined},
						{creator: "_getExtendsBlock", exists: oControlData.isClass},
						{creator: "_getSubclassesBlock", exists: aSubClasses.length > 0},
						{creator: "_getImplementsBlock", exists: oControlData.hasImplementsData},
						{creator: "_getModuleBlock", exists: true},
						{creator: "_getLibraryBlock", exists: oControlData.kind === "namespace" && oEntityData.lib},
						{creator: "_getVisibilityBlock", exists: oControlData.visibility},
						{creator: "_getAvailableSinceBlock", exists: true},
						{creator: "_getApplicationComponentBlock", exists: true}
					],
					fnFillHeaderControlsStructure = function() {
						var iControlsAdded = 0,
							iIndexToAdd,
							fnGetIndexToAdd = function(iControlsAdded) {
								// determines the column(1st, 2nd or 3rd), the next entity data key-value should be added to.
								if (iControlsAdded <= 3) {
									return 0;
								} else if (iControlsAdded <= 6) {
									return 1;
								}
								return 2;
							};

						aHeaderBlocksInfo.forEach(function(oHeaderBlockInfo) {
							var oControlBlock;
							if (oHeaderBlockInfo.exists) {
								oControlBlock = oHeaderLayoutUtil[oHeaderBlockInfo.creator].call(this, oControlData, oEntityData);
								iIndexToAdd = fnGetIndexToAdd(++iControlsAdded);
								aHeaderControls[iIndexToAdd].push(oControlBlock);
							}
						}, this);
					}.bind(this);

				// Creates the entity key-value controls
				// based on the existing entity key-value data,
				fnFillHeaderControlsStructure();

				// Wraps each column in a <code>sap.ui.layout.VerticalLayout</code>.
				aHeaderControls.forEach(function(aHeaderColumn, iIndex) {
					var oVL = this.byId("headerColumn" + iIndex);
					oVL.removeAllContent();

					if (aHeaderColumn.length > 0) {
						oVL.setVisible(true);
						aHeaderColumn.forEach(oVL.addContent, oVL);
					}
				}, this);
			},

			_getControlChildren: function (aTreeData, sTopicId) {
				for (var i = 0; i < aTreeData.length; i++) {
					if (aTreeData[i].name === sTopicId) {
						return aTreeData[i].nodes;
					}
				}
			},

			_addChildrenDescription: function (aLibsData, aControlChildren) {
				function getDataByName (sName) {
					var iLen,
						i;

					for (i = 0, iLen = aLibsData.length; i < iLen; i++) {
						if (aLibsData[i].name === sName) {
							return aLibsData[i];
						}
					}
					return false;
				}
				for (var i = 0; i < aControlChildren.length; i++) {
					aControlChildren[i].description = getDataByName(aControlChildren[i].name).description;
					aControlChildren[i].link = "{@link " + aControlChildren[i].name + "}";
				}
			},

			/**
			 * Retrieves the <code>Entity</code> sample and component data.
			 * @param {Object} sEntityName
			 * @param {Object} oControlsData
			 * @return {Object}
			 */
			_getEntitySampleData: function (sEntityName, oControlsData) {
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

				// Build deprecation message
				// Note: there may be no since or no description text available
				aResult = ["Deprecated"];
				if (sSince) {
					aResult.push(" since " + sSince);
				}
				if (sDescription) {
					// Evaluate links and code blocks in the deprecation description
					aResult.push(". " + this._preProcessLinksInTextBlock(sDescription));
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
					sDescription += "<br/><br/><span>Documentation links:</span><ul>";

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
			 * Pre-process links in text block
			 * @param {string} sText text block
			 * @returns {string} processed text block
			 * @private
			 */
			_preProcessLinksInTextBlock: function (sText) {
				var topicsData = this.getModel('topics').oData,
					topicName = topicsData.name || "",
					topicMethods = topicsData.methods || [];

				return JSDocUtil.formatTextBlock(sText, {
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
						sLink += '" target="_self" href="#/' + sRoute + '/' + target +
							'" data-sap-ui-target="' + sEntityName + '">' + text + '</a>';

						return sLink;

					}
				});
			},

			/**
			 * This function wraps a text in a span tag so that it can be represented in an HTML control.
			 * @param {string} sText
			 * @returns {string}
			 * @private
			 */
			_wrapInSpanTag: function (sText) {
				return '<span class="sapUiDocumentationJsDoc">' + this._preProcessLinksInTextBlock(sText) + '</span>';
			}
		});

	}
);
