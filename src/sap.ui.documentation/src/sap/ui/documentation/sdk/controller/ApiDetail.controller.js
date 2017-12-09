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
		"sap/ui/documentation/sdk/controller/util/APIInfo",
		"sap/ui/layout/VerticalLayout",
		"sap/m/Table",
		"sap/m/Column",
		"sap/m/Label",
		"sap/m/ColumnListItem",
		"sap/m/Link",
		"sap/m/ObjectStatus",
		"sap/ui/core/HTML",
		"sap/m/Title",
		"sap/m/Panel"
	], function (jQuery, BaseController, JSONModel, ControlsInfo, ToggleFullScreenHandler, ObjectPageSubSection, APIInfo,
	VerticalLayout, Table, Column, Label, ColumnListItem, Link, ObjectStatus, HTML, Title, Panel) {
		"use strict";

		return BaseController.extend("sap.ui.documentation.sdk.controller.ApiDetail", {

			NOT_AVAILABLE: 'N/A',
			NOT_FOUND: 'Not found',

			/* =========================================================== */
			/* lifecycle methods										   */
			/* =========================================================== */

			onInit: function () {
				this._objectPage = this.byId("apiDetailObjectPage");
				this.getRouter().getRoute("apiId").attachPatternMatched(this._onTopicMatched, this);

				this._oModel = new JSONModel();

				// BPC: 1780339157 - There are cases where we have more than 100 method entries so we need to increase
				// the default model size limit.
				this._oModel.setSizeLimit(10000);

				this.setModel(this._oModel);

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
			/* begin: internal methods									   */
			/* =========================================================== */

			/* jQuery.find and setBusy Override BEGIN */
			_oldJQueryFind: jQuery.fn.find,
			_overrideJQueryFind: function () {
				var oldFind = jQuery.fn.find;
				jQuery.fn.find = function (selector, context, ret, extra) {
					if (selector === ":sapTabbable") {
						return oldFind.call(this, "", context, ret, extra);
					}
					return oldFind.call(this, selector, context, ret, extra);
				};
			},
			_restoreJQueryFind: function () {
				jQuery.fn.find = this._oldJQueryFind;
			},
			_setBusy: function (bBusy) {
				this._overrideJQueryFind();
				this._objectPage.setBusy(bBusy);
				this._restoreJQueryFind();
			},
			/* jQuery.find and setBusy Override END */

			/**
			 * Binds the view to the object path and expands the aggregated line items.
			 * @function
			 * @param {sap.ui.base.Event} oEvent pattern match event in route 'api'
			 * @private
			 */
			_onTopicMatched: function (oEvent) {
				var oComponent = this.getOwnerComponent();

				this._setBusy(true);

				this._sTopicid = oEvent.getParameter("arguments").id;
				this._sEntityType = oEvent.getParameter("arguments").entityType;
				this._sEntityId = oEvent.getParameter("arguments").entityId;

				// Handle summary tables life cycle
				this._oEventsSummary && this._destroySummaryTable(this._oEventsSummary);
				this._oMethodsSummary && this._destroySummaryTable(this._oMethodsSummary);
				this._oAnnotationSummary && this._destroySummaryTable(this._oAnnotationSummary);

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
								if (oControlData) {
									oControlData.borrowed = oData;
								}
							})
							.then(function () {

								this._bindData(this._sTopicid);
								this._bindEntityData(this._sTopicid);

								if (oControlData) {
									oControlData.hasMethods && this._createMethodsSummary();
									oControlData.hasEvents && this._createEventsSummary();
									oControlData.hasAnnotations && this._createAnnotationsSummary();
								}

								if (this._sEntityType) {
									this._scrollToEntity(this._sEntityType, this._sEntityId);
								} else {
									this._scrollContentToTop();
								}

								jQuery.sap.delayedCall(0, this, function () {
									this._prettify();
									this._setBusy(false);

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
							this._setBusy(false);
							this.getRouter().myNavToWithoutHash("sap.ui.documentation.sdk.view.NotFound", "XML", false);
						}
					}.bind(this));

			},

			/**
			 * Summary tables have a complex life cycle and they have to be removed from the list and destroyed before
			 * the new binding context is applied as they are a different type of item than others in the list
			 * and can't be reused.
			 *
			 * @param {object} oSummaryTableReference Reference to the summary table
			 * @private
			 */
			_destroySummaryTable: function (oSummaryTableReference) {
				var oParent = oSummaryTableReference.getParent();

				oParent && oParent.removeAggregation("subSection", oSummaryTableReference, true);
				oSummaryTableReference.destroy();
			},

			_prettify: function () {
				// Google Prettify requires this class
				jQuery('.sapUxAPObjectPageContainer pre', this._objectPage.$()).addClass('prettyprint');
				window.prettyPrint();
			},

			_createMethodsSummary: function () {
				var oSection = this.byId("methods"),
					aSubSections = oSection.getSubSections(),
					oControlData = this._oModel.getData(),
					bBorrowedOnly = oControlData.hasMethods && !oControlData.hasOwnMethods;

				if (aSubSections.length > 0 && (aSubSections[0].getTitle() === "Summary" || aSubSections[0].getTitle() === "Methods" || bBorrowedOnly)) {
					aSubSections[0].setTitle(bBorrowedOnly ? "Methods" : "Summary");
					return;
				}

				this._oMethodsSummary = new ObjectPageSubSection({
					title: bBorrowedOnly ? "Methods" : "Summary",
					blocks: [
						// Creating this segment here is better than having a fragment we have to fetch on every navigation
						new VerticalLayout({
							width: "100%",
							content: [
								new Table({
									columns: [
										new Column({
											vAlign: "Top",
											width: "25%",
											header: new Label({text: "Method"})
										}),
										new Column({
											vAlign: "Top",
											width: "75%",
											minScreenWidth: "Desktop",
											demandPopin: true,
											popinDisplay: "WithoutHeader",
											header: new Label({text: "Description"})
										})
									],
									items: {
										path: "/methods",
										templateShareable: false,
										template: new ColumnListItem({
											visible: "{= !!${path: 'name'} }",
											cells: [
												new VerticalLayout({
													content: [
														new Link({
															text: "{name}",
															href: "#/api/{/name}/methods/{name}",
															press: this.scrollToMethod.bind(this),
															wrapping: false
														}),
														new ObjectStatus({
															icon: "sap-icon://message-error",
															state: "Error",
															text: "Deprecated",
															visible: "{= ${deprecated} !== undefined }"
														})
													]
												}),
												new HTML({content: "{description}"})
											]
										})
									}
								}),
								new Title({
									visible: "{= ${/borrowed/methods/}.length > 0 }",
									text: "Borrowed from:"
								}).addStyleClass("sapUiSmallMarginTop").addStyleClass("sapUiDocumentationBorrowedTitle"),
								new VerticalLayout({
									visible: "{= ${/borrowed/methods/}.length > 0 }",
									width: "100%",
									content: {
										path: "/borrowed/methods/",
										templateShareable: false,
										template: new Panel({
											expandable: true,
											expanded: true,
											headerText: "{name}",
											width: "100%",
											content: {
												path: "methods",
												templateShareable: false,
												template: new Link({
													text: "{name}",
													href: "{link}"
												}).addStyleClass("sapUiTinyMargin")
											}
										}).addStyleClass("borrowedMethodsPanel")
									}
								})
							]
						})
					]
				});

				oSection.insertSubSection(this._oMethodsSummary, 0);

			},

			_createEventsSummary: function () {
				var oSection = this.byId("events"),
					aSubSections = oSection.getSubSections(),
					oControlData = this._oModel.getData(),
					bBorrowedOnly = oControlData.hasEvents && !oControlData.hasOwnEvents;

				if (aSubSections.length > 0 && (aSubSections[0].getTitle() === "Summary" || aSubSections[0].getTitle() === "Events" || bBorrowedOnly)) {
					aSubSections[0].setTitle(bBorrowedOnly ? "Events" : "Summary");

					return;
				}

				this._oEventsSummary = new ObjectPageSubSection({
					title: bBorrowedOnly ? "Events" : "Summary",
					blocks: [
						// Creating this segment here is better than having a fragment we have to fetch on every navigation
						new VerticalLayout({
							width: "100%",
							content: [
								new Table({
									visible: "{/hasOwnEvents}",
									columns: [
										new Column({
											vAlign: "Top",
											header: new Label({text: "Event"})
										}),
										new Column({
											vAlign: "Top",
											minScreenWidth: "Tablet",
											demandPopin: true,
											popinDisplay: "WithoutHeader",
											header: new Label({text: "Description"})
										})
									],
									items: {
										path: "/events",
										templateShareable: false,
										template: new ColumnListItem({
											visible: "{= !!${path: 'name'} }",
											cells: [
												new VerticalLayout({
													content: [
														new Link({
															text: "{name}",
															href: "#/api/{/name}/events/{name}",
															press: this.scrollToEvent.bind(this),
															wrapping: false
														}),
														new ObjectStatus({
															icon: "sap-icon://message-error",
															state: "Error",
															text: "Deprecated",
															visible: "{= ${deprecated} !== undefined }"
														})
													]
												}),
												new HTML({content: "{description}"})
											]
										})
									}
								}),
								new Title({
									visible: "{= ${/borrowed/events/}.length > 0 }",
									text: "Borrowed from:"
								}).addStyleClass("sapUiSmallMarginTop").addStyleClass("sapUiDocumentationBorrowedTitle"),
								new VerticalLayout({
									visible: "{= ${/borrowed/events/}.length > 0 }",
									width: "100%",
									content: {
										path: "/borrowed/events/",
										templateShareable: false,
										template: new Panel({
											expandable: true,
											expanded: true,
											headerText: "{name}",
											width: "100%",
											content: {
												path: "events",
												templateShareable: false,
												template: new Link({
													text: "{name}",
													href: "{link}"
												}).addStyleClass("sapUiTinyMargin")
											}
										})
									}
								})
							]
						})
					]
				});

				oSection.insertSubSection(this._oEventsSummary, 0);

			},

			_createAnnotationsSummary: function () {
				var oSection = this.byId("annotations");

				var aSubSections = oSection.getSubSections();
				if (aSubSections.length > 0 && aSubSections[0].getTitle() === "Summary") {
					return;
				}

				this._oAnnotationSummary = new ObjectPageSubSection({
					title: "Summary",
					blocks: [
						new Table({
							columns: [
								new Column({
									vAlign: "Top",
									width: "25%",
									header: new Label({text: "Annotation"})
								}),
								new Column({
									vAlign: "Top",
									width: "75%",
									minScreenWidth: "Desktop",
									demandPopin: true,
									popinDisplay: "WithoutHeader",
									header: new Label({text: "Description"})
								})
							],
							items: {
								path: "/ui5-metadata/annotations",
								templateShareable: false,
								template: new ColumnListItem({
									visible: "{= !!${annotation} }",
									cells: [
										new Link({
											text: "{= ${annotation} !== 'undefined' ? ${annotation} : '(' + ${namespace} + ')' }",
											press: this.scrollToAnnotation.bind(this),
											wrapping: false
										}),
										new HTML({content: "{description}"})
									]
								})
							}
						})
					]
				});

				oSection.insertSubSection(this._oAnnotationSummary, 0);

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
						this._objectPage.scrollToSection(aFilteredSubSections[0].getId(), 250);
					}
				} else {
					// We scroll to section
					this._objectPage.scrollToSection(oSection.getId(), 250);
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

					// Builds the header layout, when all the needed data is ready
					this._buildHeaderLayout(this._oModel.getData(), oEntityData);
				}.bind(this));

			},

			_bindData: function (sTopicId) {
				var aLibsData = this._aLibsData,
					oControlData,
					aTreeData = this.getOwnerComponent().getModel("treeData").getData(),
					aControlChildren = this._getControlChildren(aTreeData, sTopicId),
					oModel,
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

				oControlData.hasChildren = !!oControlData.controlChildren;
				oControlData.hasProperties = !!(oControlData.hasOwnProperty('properties') && this.hasVisibleElement(oControlData.properties));
				oControlData.hasConstructor = oControlData.hasOwnProperty('constructor');
				oControlData.hasControlProperties = !!(oUi5Metadata && oUi5Metadata.properties && this.hasVisibleElement(oUi5Metadata.properties));
				oControlData.hasOwnEvents = !!oControlData.events;
				oControlData.hasOwnMethods = !!(oControlData.hasOwnProperty('methods') && this.hasVisibleElement(oControlData.methods));
				oControlData.hasEvents = !!(oControlData.hasOwnEvents || (oControlData.borrowed && oControlData.borrowed.events.length > 0));
				oControlData.hasMethods = !!(oControlData.hasOwnMethods || (oControlData.borrowed && oControlData.borrowed.methods.length > 0));
				oControlData.hasAssociations = !!(oUi5Metadata && oUi5Metadata.associations && this.hasVisibleElement(oUi5Metadata.associations));
				oControlData.hasAggregations = !!(oUi5Metadata && oUi5Metadata.aggregations && this.hasVisibleElement(oUi5Metadata.aggregations));
				oControlData.hasSpecialSettings = !!(oUi5Metadata && oUi5Metadata.specialSettings && this.hasVisibleElement(oUi5Metadata.specialSettings));
				oControlData.hasAnnotations = !!(oUi5Metadata && oUi5Metadata.annotations &&
					Object.keys(oUi5Metadata.annotations).length > 0);

				if (oControlData.hasConstructor && oControlData.constructor.parameters) {
					for (i = 0; i < oControlData.constructor.parameters.length; i++) {
						this.subParamPhoneName = oControlData.constructor.parameters[i].name;
					}
					this.subParamPhoneName = '';
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

				// Main model data
				this._oModel.setData(oControlData);

				if (this.extHookbindData) {
					this.extHookbindData(sTopicId, oModel);
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

			subParamPhoneName: '',

			_formatChildDescription: function (description) {
				if (description) {
					description = this._extractFirstSentence(description);
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
			}
		});

	}
);
