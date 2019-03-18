/*!
 * ${copyright}
 */

/*global location */
sap.ui.define([
		"sap/ui/thirdparty/jquery",
		"sap/ui/documentation/sdk/controller/BaseController",
		"sap/ui/model/json/JSONModel",
		"sap/ui/documentation/sdk/controller/util/ControlsInfo",
		"sap/ui/documentation/sdk/util/ToggleFullScreenHandler",
		"sap/ui/documentation/sdk/controller/util/APIInfo",
		"sap/ui/documentation/sdk/model/formatter",
		"sap/m/Label",
		"sap/m/Link",
		"sap/m/Text",
		"sap/m/HBox",
		"sap/m/ObjectAttribute",
		"sap/m/Popover",
		"sap/m/library"
	], function (jQuery, BaseController, JSONModel, ControlsInfo, ToggleFullScreenHandler, APIInfo,
			formatter, Label, Link, Text, HBox, ObjectAttribute, Popover, library) {
		"use strict";

		// shortcut for sap.m.FlexWrap
		var FlexWrap = library.FlexWrap;

		return BaseController.extend("sap.ui.documentation.sdk.controller.SubApiDetail", {

			NOT_AVAILABLE: 'N/A',
			SECTION_MAP: {
				"properties": "controlProperties",
				"fields": "properties",
				"special settings": "specialsettings"
			},
			formatter: formatter,

			onInit: function () {
				this._objectPage = this.byId("apiDetailObjectPage");
			},

			/* =========================================================== */
			/* lifecycle methods										   */
			/* =========================================================== */

			initiate: function (oReferences) {
				var bHasSelfProps,
					bHasSelfAggr,
					bHasSelfAssoc,
					fnOverrideBorrowedFilter = function (item) {
						return !item.borrowedFrom;
					};

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

				this._allProperties = this._oModel.getProperty("/ui5-metadata/properties");
				this._allAggregations = this._oModel.getProperty("/ui5-metadata/aggregations");
				this._allAssociations = this._oModel.getProperty("/ui5-metadata/associations");

				if (this._allProperties) {
					this._selfProperties = this._allProperties.filter(fnOverrideBorrowedFilter);
					bHasSelfProps = this._selfProperties.length > 0;
					this._oModel.setProperty("/bShowBorrowedProps", !bHasSelfProps);
					this._oModel.setProperty("/bHasSelfProps", bHasSelfProps);
					this._oModel.setProperty("/bHasBorrowedProps", this._allProperties.length > this._selfProperties.length);
					this._oModel.setProperty("/ui5-metadata/properties", bHasSelfProps ? this._selfProperties : this._allProperties);
				}

				if (this._allAggregations) {
					this._selfAggregations = this._allAggregations.filter(fnOverrideBorrowedFilter);
					bHasSelfAggr = this._selfAggregations.length > 0;
					this._oModel.setProperty("/bShowBorrowedAggr", !bHasSelfAggr);
					this._oModel.setProperty("/bHasSelfAggr", bHasSelfAggr);
					this._oModel.setProperty("/bHasBorrowedAggr", this._allAggregations.length > this._selfAggregations.length);
					this._oModel.setProperty("/ui5-metadata/aggregations", bHasSelfAggr ? this._selfAggregations : this._allAggregations);
				}

				if (this._allAssociations) {
					this._selfAssociations = this._allAssociations.filter(fnOverrideBorrowedFilter);
					bHasSelfAssoc = this._selfAssociations.length > 0;
					this._oModel.setProperty("/bShowBorrowedAssoc", !bHasSelfAssoc);
					this._oModel.setProperty("/bHasSelfAssoc", bHasSelfAssoc);
					this._oModel.setProperty("/bHasBorrowedAssoc", this._allAssociations.length > this._selfAssociations.length);
					this._oModel.setProperty("/ui5-metadata/associations", bHasSelfAssoc ? this._selfAssociations : this._allAssociations);
				}

				// Attach the model to the view
				this.setModel(this._oModel);

				// Build needed resources and pre-process data
				this._oEntityData.appComponent = this._oControlData.component || this.NOT_AVAILABLE;
				this._oEntityData.hasSample = this._oControlData.hasSample;
				this._oEntityData.sample = this._oControlData.hasSample ? this._sTopicId : this.NOT_AVAILABLE;

				this._buildHeaderLayout(this._oControlData, this._oEntityData);

				setTimeout(function () {
					// Initial prettify
					this._prettify();

					// Attach prettify for un-stashed sub sections
					this._objectPage.attachEvent("subSectionEnteredViewPort", function () {
						// Clear previous calls if any
						if (this._sPrettyPrintDelayedCallID) {
							clearTimeout(this._sPrettyPrintDelayedCallID);
						}
						this._sPrettyPrintDelayedCallID = setTimeout(function () {
							// The event is called even if all the sub-sections are un-stashed so apply the class and prettyPrint only when we have un-processed targets.
							var $aNotApplied = jQuery('.sapUxAPObjectPageContainer .APIDetailMethodsSection pre:not(.prettyprint)', this._objectPage.$());
							if ($aNotApplied.length > 0) {
								$aNotApplied.addClass('prettyprint');
								window.prettyPrint();
							}
						}.bind(this), 200);
					}, this);

					// Init scrolling right after busy indicator is cleared and prettify is ready
					setTimeout(function () {

						if (this._sEntityType) {
							this._scrollToEntity(this._sEntityType, this._sEntityId);
						}

						// Add listener's with a slight delay so they don't break scroll to entity
						setTimeout(function () {
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
						}.bind(this), 500);

					}.bind(this), 1000);
				}.bind(this), 0);

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

			onBorrowedPropCheckboxClick: function (oEvent) {
				var bChecked = oEvent.getParameter("selected");

				this._oModel.setProperty("/bShowBorrowedProps", bChecked);

				this._oModel.setProperty("/ui5-metadata/properties", bChecked ? this._allProperties : this._selfProperties);
			},

			onBorrowedAggrCheckboxClick: function (oEvent) {
				var bChecked = oEvent.getParameter("selected");

				this._oModel.setProperty("/bShowBorrowedAggr", bChecked);

				this._oModel.setProperty("/ui5-metadata/aggregations", bChecked ? this._allAggregations : this._selfAggregations);
			},

			onBorrowedAssocCheckboxClick: function (oEvent) {
				var bChecked = oEvent.getParameter("selected");

				this._oModel.setProperty("/bShowBorrowedAssoc", bChecked);

				this._oModel.setProperty("/ui5-metadata/associations", bChecked ? this._allAssociations : this._selfAssociations);
			},

			onJSDocLinkClick: function (oEvent) {
				var oClassList = oEvent.target.classList,
					bJSDocLink = oClassList.contains("jsdoclink"),
					bExternalLink = oClassList.contains("sapUISDKExternalLink"),
					sLinkTarget = oEvent.target.getAttribute("data-sap-ui-target"),
					sEntityType;

				// Not a JSDocLink - we do nothing
				if (!bJSDocLink && !bExternalLink) {
					return;
				}

				if (bExternalLink) {
					this.onDisclaimerLinkPress(oEvent);
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
			/* begin: internal methods									   aa*/
			/* =========================================================== */

			_navigateRouter: function(sEntityType, sEntityId, bShouldStoreToHistory) {
				this._oRouter.stop();
				this._oRouter.navTo("apiId", {
					id: encodeURIComponent(this._sTopicId),
					entityType: sEntityType,
					entityId: encodeURIComponent(sEntityId)
				}, !bShouldStoreToHistory);
				this._oRouter.initialize(true);
			},

			_modifyURL: function(oSection, oSubSection, bShouldStoreToHistory) {
				var sSection = oSection.getTitle().toLowerCase(),
					sSubSection = (oSubSection && oSubSection.getTitle() !== 'Overview') ? oSubSection.getTitle() : '';

				// BCP: 1870269220 - We have a section with a name "constructor" which matches the native javascript
				// object constructor as a key and returns it's method instead of matched key->value pair.
				if (Object.keys(this.SECTION_MAP).indexOf(sSection) >= 0) {
					sSection = this.SECTION_MAP[sSection];
				}

				this._navigateRouter(sSection, sSubSection, bShouldStoreToHistory);
			},

			_prettify: function () {
				// Google Prettify requires this class
				jQuery('.sapUxAPObjectPageContainer pre', this._objectPage.$()).addClass('prettyprint');
				window.prettyPrint();
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
						setTimeout(function () {
							// Re-enable rooter after current operation
							this._oRouter.initialize(true);
						}.bind(this), 0);

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
							return new ObjectAttribute({
								title: sTitle,
								text: sText
							}).addStyleClass("sapUiTinyMarginBottom");
						},
						_getLink = function (oConfig) {
							return new Link(oConfig || {});
						},
						_getText = function (oConfig) {
							return new Text(oConfig || {});
						},
						_getLabel = function (oConfig) {
							return new Label(oConfig || {});
						},
						_getHBox = function (oConfig, bAddCommonStyles) {
							var oHBox = new HBox(oConfig || {});

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
						_getUXGuidelinesBlock: function (oControlData) {
							return _getHBox({
								items: [
									_getLabel({design: "Bold", text: "UX Guidelines:"}),
									_getLink({
										emphasized: true,
										text: oControlData.uxGuidelinesLinkText,
										href: oControlData.uxGuidelinesLink,
										target: "_blank"
									}),
									new sap.m.Image({
										src: "./resources/sap/ui/documentation/sdk/images/link-sap.png",
										tooltip: "Information published on SAP site",
										press: this.onDisclaimerLinkPress
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
								wrap: FlexWrap.Wrap
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
					return new Link({
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
					this._oPopover = new Popover({
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
				var FIRST_COLUMN = 0,
					SECOND_COLUMN = 1,
					THIRD_COLUMN = 2,
					ENTITIES_PER_COLUMN = 3,
					aHeaderControls = [[], [], []],
					oHeaderLayoutUtil = this._getHeaderLayoutUtil(),
					aSubClasses = oEntityData.extendedBy || oEntityData.implementedBy || [],
					aHeaderBlocksInfo = [
						{creator: "_getControlSampleBlock", exists: oControlData.isClass || oControlData.isNamespace},
						{creator: "_getDocumentationBlock", exists: oControlData.docuLink !== undefined},
						{creator: "_getUXGuidelinesBlock", exists: oControlData.uxGuidelinesLink !== undefined},
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
								if (iControlsAdded <= ENTITIES_PER_COLUMN) {
									return FIRST_COLUMN;
								} else if (iControlsAdded <= ENTITIES_PER_COLUMN * 2) {
									return SECOND_COLUMN;
								}
								return THIRD_COLUMN;
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