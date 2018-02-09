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
		"sap/ui/documentation/sdk/controls/ObjectPageSubSection",
		"sap/ui/documentation/sdk/controller/util/APIInfo",
		"sap/ui/documentation/sdk/controls/ParamText",
		"sap/ui/layout/VerticalLayout",
		"sap/m/Label",
		"sap/m/Link",
		"sap/m/ObjectStatus",
		"sap/ui/core/HTML",
		"sap/m/Title",
		"sap/m/Panel",
		"sap/ui/documentation/sdk/controls/BorrowedList",
		"sap/ui/documentation/sdk/controls/LightTable",
		"sap/ui/documentation/sdk/controls/Row"
	], function (jQuery, BaseController, JSONModel, ControlsInfo, ToggleFullScreenHandler, ObjectPageSubSection, APIInfo,
				 ParamText, VerticalLayout, Label, Link, ObjectStatus, HTML, Title, Panel, BorrowedList, LightTable, Row) {
		"use strict";

		return BaseController.extend("sap.ui.documentation.sdk.controller.SubApiDetail", {

			NOT_AVAILABLE: 'N/A',
			NOT_FOUND: 'Not found',

			onInit: function () {
				this._objectPage = this.byId("apiDetailObjectPage");
			},

			/* =========================================================== */
			/* lifecycle methods										   */
			/* =========================================================== */

			initiate: function (oReferences) {

				// Setup
				this._sTopicId = oReferences.sTopicId;
				this._oModel = oReferences.oModel;
				this._oControlData = this._oModel.getData();
				this._aApiIndex = oReferences.aApiIndex;
				this._aAllowedMembers = oReferences.aAllowedMembers;
				this._sEntityType = oReferences.sEntityType;
				this._sEntityId = oReferences.sEntityId;
				this._oEntityData = oReferences.oEntityData;
				this._oContainerController = oReferences.oContainerController;
				this._oContainerView = oReferences.oContainerView;

				// Override instance getOwnerComponent so correct component will be used for the controller
				this.getOwnerComponent = function () {
					return oReferences.oOwnerComponent;
				};

				// Cache router instance
				this._oRouter = this.getRouter();

				// Attach the model to the view
				this.setModel(this._oModel);

				// Handle summary tables life cycle
				this._oEventsSummary && this._destroySummaryTable(this._oEventsSummary);
				this._oMethodsSummary && this._destroySummaryTable(this._oMethodsSummary);
				this._oAnnotationSummary && this._destroySummaryTable(this._oAnnotationSummary);

				// Build needed resources and pre-process data
				this._oEntityData.appComponent = this._oControlData.component || this.NOT_AVAILABLE;
				this._oEntityData.hasSample = this._oControlData.hasSample;
				this._oEntityData.sample = this._oControlData.hasSample ? this._sTopicId : this.NOT_AVAILABLE;

				this._buildHeaderLayout(this._oControlData, this._oEntityData);

				if (this._oControlData) {
					this._oControlData.hasMethods && this._createMethodsSummary();
					this._oControlData.hasEvents && this._createEventsSummary();
					this._oControlData.hasAnnotations && this._createAnnotationsSummary();
				}

				jQuery.sap.delayedCall(0, this, function () {
					// Initial prettify
					this._prettify();

					// Attach prettify for un-stashed sub sections
					this._objectPage.attachEvent("subSectionEnteredViewPort", function () {
						// Clear previous calls if any
						if (this._sPrettyPrintDelayedCallID) {
							jQuery.sap.clearDelayedCall(this._sPrettyPrintDelayedCallID);
						}
						this._sPrettyPrintDelayedCallID = jQuery.sap.delayedCall(200, this, function () {
							// The event is called even if all the sub-sections are un-stashed so apply the class and prettyPrint only when we have un-processed targets.
							var $aNotApplied = jQuery('.sapUxAPObjectPageContainer .APIDetailMethodsSection pre:not(.prettyprint)', this._objectPage.$());
							if ($aNotApplied.length > 0) {
								$aNotApplied.addClass('prettyprint');
								window.prettyPrint();
							}
						});
					}, this);

					// Init scrolling right after busy indicator is cleared and prettify is ready
					jQuery.sap.delayedCall(1000, this, function () {

						if (this._sEntityType) {
							this._scrollToEntity(this._sEntityType, this._sEntityId);
						}

						// Add listener's with a slight delay so they don't break scroll to entity
						jQuery.sap.delayedCall(500, this, function () {
							this._objectPage.attachEvent("_sectionChange", function (oEvent) {
								var oSection = oEvent.getParameter("section"),
									oSubSection = oEvent.getParameter("subSection");

								if (this._oNavigatingTo) {
									if (this._oNavigatingTo === oSubSection) {
										// Destination is reached
										this._oNavigatingTo = null;
									}

									return;
								}

								this._modifyURL(oSection, oSubSection, false);
							}, this);

							this._objectPage.attachEvent("navigate", function (oEvent) {
								var oSection = oEvent.getParameter("section"),
									oSubSection = oEvent.getParameter("subSection");

								this._oNavigatingTo = oSubSection;
								this._modifyURL(oSection, oSubSection, true);
							}, this);
						});

					});
				});

				this.searchResultsButtonVisibilitySwitch(this.byId("apiDetailBackToSearch"));
			},

			onAfterRendering: function () {
				this.getView().attachBrowserEvent("click", this.onJSDocLinkClick, this);
			},

			onExit: function () {
				this.getView().detachBrowserEvent("click", this.onJSDocLinkClick, this);
			},

			onToggleFullScreen: function (oEvent) {
				// As this is a nested sub-view we pass the container view and controller context so fullscreen will
				// work as expected.
				ToggleFullScreenHandler.updateMode(oEvent, this._oContainerView, this._oContainerController);
			},

			onJSDocLinkClick: function (oEvent) {
				var oClassList = oEvent.target.classList,
					bJSDocLink = oClassList.contains("jsdoclink"),
					sLinkTarget = oEvent.target.getAttribute("data-sap-ui-target"),
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

				this._scrollToEntity(sEntityType, sLinkTarget);
				this._navigateRouter(sEntityType, sLinkTarget, true);
			},

			/* =========================================================== */
			/* begin: internal methods									   */
			/* =========================================================== */

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

			_navigateRouter: function(sEntityType, sEntityId, bShouldStoreToHistory) {
				this._oRouter.stop();
				this._oRouter.navTo("apiId", {
					id: this._sTopicId,
					entityType: sEntityType,
					entityId: sEntityId
				}, !bShouldStoreToHistory);
				this._oRouter.initialize(true);
			},

			_modifyURL: function(oSection, oSubSection, bShouldStoreToHistory) {
				var sSection = oSection.getTitle().toLowerCase(),
					sSubSection = (oSubSection && oSubSection.getTitle() !== 'Overview') ? oSubSection.getTitle() : '';

				if (sSection === 'properties') {
					sSection = 'controlProperties';
				}
				if (sSection === 'fields') {
					sSection = 'properties';
				}

				this._navigateRouter(sSection, sSubSection, bShouldStoreToHistory);
			},

			_prettify: function () {
				// Google Prettify requires this class
				jQuery('.sapUxAPObjectPageContainer pre', this._objectPage.$()).addClass('prettyprint');
				window.prettyPrint();
			},

			_createMethodsSummary: function () {
				var oSection = this.byId("methods"),
					aSubSections = oSection.getSubSections(),
					oControlData = this._oControlData,
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
								new LightTable({
									columnTitles: ["Method", "Description"],
									columnCount: 2,
									rows: {
										path: "/methods",
										templateShareable: false,
										template: new Row({
											visible: "{= !!${path: 'name'} }",
											content: [
												new ParamText({
													text: "{name}",
													href: "#/api/{/name}/methods/{name}",
													deprecated: "{= ${deprecated} !== undefined }",
													press: this.scrollToMethod.bind(this)
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
											content: [
													new BorrowedList({
														list: "{methods}"
													})
												]
											}).addStyleClass("borrowedListPanel")
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
					oControlData = this._oControlData,
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
								new LightTable({
									visible: "{/hasOwnEvents}",
									columnTitles: ["Event", "Description"],
									columnCount: 2,
									rows: {
										path: "/events",
										templateShareable: false,
										template: new Row({
											visible: "{= !!${path: 'name'} }",
											content: [
												new ParamText({
													text: "{name}",
													href: "#/api/{/name}/events/{name}",
													press: this.scrollToEvent.bind(this),
													deprecated: "{= ${deprecated} !== undefined }"
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
											content: new BorrowedList({
												list: "{events}"
											})
										}).addStyleClass("borrowedListPanel")
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
						new LightTable({
							columnTitles: ["Annotation", "Description"],
							columnCount: 2,
							rows: {
								path: "/ui5-metadata/annotations",
								templateShareable: false,
								template: new Row({
									visible: "{= !!${annotation} }",
									content: [
										new Link({
											text: "{= ${annotation} !== 'undefined' ? ${annotation} : '(' + ${namespaceText} + ')' }",
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
						this._oRouter.stop();
						jQuery.sap.delayedCall(0, this, function () {
							// Re-enable rooter after current operation
							this._oRouter.initialize(true);
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

			_getHeaderLayoutUtil: function () {
				if (!this._oHeaderLayoutUtil) {
					var _getObjectAttributeBlock = function (sTitle, sText) {
							return new sap.m.ObjectAttribute({
								title: sTitle,
								text: sText
							}).addStyleClass("sapUiTinyMarginBottom");
						},
						_getLink = function (oConfig) {
							return new sap.m.Link(oConfig || {});
						},
						_getText = function (oConfig) {
							return new sap.m.Text(oConfig || {});
						},
						_getLabel = function (oConfig) {
							return new sap.m.Label(oConfig || {});
						},
						_getHBox = function (oConfig, bAddCommonStyles) {
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
										visible: !!oEntityData.hasSample,
										href: "#/entity/" + oControlData.name
									}),
									_getText({text: oEntityData.sample, visible: !oEntityData.hasSample})
								]
							}, true);
						},
						_getDocumentationBlock: function (oControlData, oEntityData) {
							return _getHBox({
								items: [
									_getLabel({design: "Bold", text: "Documentation:"}),
									_getLink({
										emphasized: true,
										text: oControlData.docuLinkText,
										href: "#/topic/" + oControlData.docuLink
									})
								]
							}, true);
						},
						_getExtendsBlock: function (oControlData, oEntityData) {
							return _getHBox({
								items: [
									_getLabel({text: "Extends:"}),
									_getLink({
										text: oControlData.extendsText,
										href: "#/api/" + oControlData.extendsText,
										visible: oControlData.isDerived
									}),
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
								oSubClassesLink = _getLink({
									text: oControlData.isClass ? "View subclasses" : "View implementations",
									press: this._openSubclassesImplementationsPopover.bind(this)
								});
							}

							return _getHBox({
								items: [
									_getLabel({text: oControlData.isClass ? "Known direct subclasses:" : "Known direct implementations:"}),
									oSubClassesLink
								]
							}, true);
						},
						_getImplementsBlock: function (oControlData, oEntityData) {
							var aItems = [_getLabel({text: "Implements:"})];

							oControlData.implementsParsed.forEach(function (oElement) {
								aItems.push(_getLink({text: oElement.name, href: "#/api/" + oElement.href}));
							});

							return _getHBox({
								items: aItems,
								wrap: sap.m.FlexWrap.Wrap
							}, true).addStyleClass("sapUiDocumentationCommaList");
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
					return new sap.m.Link({
						text: oElement,
						href: "#/api/" + oElement
					}).addStyleClass("sapUiTinyMarginBottom sapUiTinyMarginEnd");
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
					fnFillHeaderControlsStructure = function () {
						var iControlsAdded = 0,
							iIndexToAdd,
							fnGetIndexToAdd = function (iControlsAdded) {
								// determines the column(1st, 2nd or 3rd), the next entity data key-value should be added to.
								if (iControlsAdded <= 3) {
									return 0;
								} else if (iControlsAdded <= 6) {
									return 1;
								}
								return 2;
							};

						aHeaderBlocksInfo.forEach(function (oHeaderBlockInfo) {
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
				aHeaderControls.forEach(function (aHeaderColumn, iIndex) {
					var oVL = this.byId("headerColumn" + iIndex);
					oVL.removeAllContent();

					if (aHeaderColumn.length > 0) {
						oVL.setVisible(true);
						aHeaderColumn.forEach(oVL.addContent, oVL);
					}
				}, this);
			},

			onAnnotationsLinkPress: function () {
				this._scrollToEntity("annotations", "Summary");
			},

			backToSearch: function () {
				this.onNavBack();
			}
		});

	}
);
