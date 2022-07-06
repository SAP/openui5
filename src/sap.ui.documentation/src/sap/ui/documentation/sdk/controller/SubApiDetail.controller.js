/*!
 * ${copyright}
 */

sap.ui.define([
		"sap/ui/thirdparty/jquery",
		"sap/ui/core/Fragment",
		"sap/ui/documentation/sdk/controller/BaseController",
		"sap/ui/documentation/sdk/util/ToggleFullScreenHandler",
		"sap/ui/documentation/sdk/model/formatter",
		"sap/m/Image",
		"sap/m/Label",
		"sap/m/Link",
		"sap/m/Text",
		"sap/m/HBox",
		"sap/m/ObjectAttribute",
		"sap/m/ObjectStatus",
		"sap/m/Popover",
		"sap/m/library",
		"sap/ui/core/library",
		"sap/m/CustomListItem",
		"sap/m/List",
		"sap/ui/dom/includeStylesheet",
		"sap/ui/dom/includeScript"
	], function (jQuery, Fragment, BaseController, ToggleFullScreenHandler,
			formatter, Image, Label, Link, Text, HBox, ObjectAttribute, ObjectStatus, Popover,
			library, coreLibrary, CustomListItem, List, includeStylesheet, includeScript) {
		"use strict";

		// shortcut for sap.m.FlexWrap
		var FlexWrap = library.FlexWrap;
		var ObjectStatusState =  coreLibrary.ValueState;

		return BaseController.extend("sap.ui.documentation.sdk.controller.SubApiDetail", {

			NOT_AVAILABLE: 'N/A',
			PUBLIC_GITHUB_FRAMEWORK_DOMAIN: 'https://github.com/SAP/openui5/blob/master/src/',
			SECTION_MAP: {
				"properties": "controlProperties",
				"fields": "properties",
				"special settings": "specialsettings"
			},
			formatter: formatter,

			onInit: function () {
				this._objectPage = this.byId("apiDetailObjectPage");

				if ( !window.hljs ) {
					//solarized-light
					includeStylesheet("resources/sap/ui/documentation/sdk/thirdparty/highlight.js/styles.css");
					includeScript({ url: "resources/sap/ui/documentation/sdk/thirdparty/highlight.js/highlight.js" });
				}
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
				this._sEntityId = oReferences.sEntityId !== "undefined" ? oReferences.sEntityId : undefined;
				this._oEntityData = oReferences.oEntityData;
				this._oContainerController = oReferences.oContainerController;
				this._oContainerView = oReferences.oContainerView;
				this._oToggleFullScreenBtn = this.byId("toggleFullScreenBtn");

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

				if (this._oModel.getProperty("/hasFAQ")) {
					var sLibName = this._oEntityData.lib,
						sLibPath = sLibName.replace(/\./g, '/'),
						sFile = this._oEntityData.name.replace(sLibName, "").replace(/^[.]/, "").replace(/\./g, '/') + ".html";
					jQuery.ajax({
						type: "GET",
						url: './docs/api/' + sLibPath +
						'/demokit/faq/' + sFile,
						success: function (data) {
							this._oModel.setProperty("/faqContent", data);
						}.bind(this)
					});
				}

				// Attach the model to the view
				this.setModel(this._oModel);

				// Build needed resources and pre-process data
				this._oEntityData.appComponent = this._oControlData.component || this.NOT_AVAILABLE;
				this._oEntityData.hasSample = this._oControlData.hasSample;
				this._oEntityData.sample = this._oControlData.hasSample ? this._sTopicId : this.NOT_AVAILABLE;

				this._buildHeaderLayout(this._oControlData, this._oEntityData);

				setTimeout(function () {
					// Initial hljs
					this._hljs();

					// Attach hljs for un-stashed sub sections
					this._objectPage.attachEvent("subSectionEnteredViewPort", function () {
						// Clear previous calls if any
						if (this._sHljsDelayedCallID) {
							clearTimeout(this._sHljsDelayedCallID);
						}
						this._sHljsDelayedCallID = setTimeout(function () {
							//The event is called even if all the sub-sections are un-stashed so apply the class and highlights only when we have un-processed targets.
							var $aNotApplied = this._objectPage.$().find("pre:not(.hljs)");
							if ($aNotApplied.length > 0 && window.hljs) {
								$aNotApplied.addClass('hljs');
								document.querySelectorAll('pre').forEach(function(block) {
									window.hljs.highlightBlock(block);
								});
							}
						}.bind(this), 200);
					}, this);

					// Init scrolling right after busy indicator is cleared
					setTimeout(function () {

						if (this._sEntityType) {
							this.scrollToEntity(this._sEntityType, this._sEntityId);
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
				this.appendPageTitle(this._oModel.getProperty("/displayName"));
			},

			onAfterRendering: function () {
				this.getView().attachBrowserEvent("click", this.onJSDocLinkClick, this);
				ToggleFullScreenHandler.updateControl(this._oToggleFullScreenBtn, this._oContainerView, this._oContainerController);
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
					bExternalLink = oClassList.contains("sapUISDKExternalLink");

				if (bExternalLink) {
					this.onDisclaimerLinkPress(oEvent);
					return;
				}
			},

			onVisibilityInformationClick: function (oEvent) {
				var oIcon = oEvent.getSource(),
					oView = this.getView();

				if (!this._oPopover) {
					this._oPopover = Fragment.load({
						name: "sap.ui.documentation.sdk.view.VisibilityInformation",
						controller: this
					}).then(function(oPopover) {
						oView.addDependent(oPopover);
						return oPopover;
					});
				}
				this._oPopover.then(function(oPopover) {
					oPopover.openBy(oIcon);
				});
			},

			/* =========================================================== */
			/* begin: internal methods									   aa*/
			/* =========================================================== */

			_modifyURL: function(oSection, oSubSection, bShouldStoreToHistory) {
				var sSection = oSection.getTitle().toLowerCase(),
					sSubSection = (oSubSection && oSubSection.getTitle() !== 'Overview') ? oSubSection.getTitle() : '';

				// BCP: 1870269220 - We have a section with a name "constructor" which matches the native javascript
				// object constructor as a key and returns it's method instead of matched key->value pair.
				if (Object.keys(this.SECTION_MAP).indexOf(sSection) >= 0) {
					sSection = this.SECTION_MAP[sSection];
				}

				this._oRouter.navToChangeUrlOnly({
					id: this._sTopicId,
					entityType: sSection,
					entityId: sSubSection
				}, bShouldStoreToHistory);

			},

			_hljs: function () {
				if (window.hljs) {
					document.querySelectorAll('pre').forEach(function(block) {
						window.hljs.highlightBlock(block);
					});
				}
			},

			scrollToEntity: function (sSectionId, sSubSectionTitle) {

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
					var _getObjectAttributeBlock = function (sTitle, sText, oCustomContent) {
							var oObjectAttribute = new ObjectAttribute({
								title: sTitle,
								text: sText
							}).addStyleClass("sapUiTinyMarginBottom");
							if (oCustomContent) {
								oObjectAttribute.setCustomContent(oCustomContent);
							}

							return oObjectAttribute;
						},
						_getVisibilityObjectStatusBlock = function (sText, allowedFor) {
							return new ObjectStatus({
								title: "Visibility",
								text: formatter.formatVisibility(sText, allowedFor),
								state: ObjectStatusState.Warning
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
										href: "entity/" + oControlData.name
									}),
									_getText({text: oEntityData.sample, visible: !oEntityData.hasSample})
								]
							}, true);
						},
						_getControlGithub: function (oControlData, oEntityData) {
							return _getHBox({
								items: [
									_getLabel({design: "Bold", text: "GitHub:"}),
									_getLink({
										emphasized: true,
										text: oControlData.resource,
										visible: true,
										href: this.PUBLIC_GITHUB_FRAMEWORK_DOMAIN + oEntityData.lib + '/src/' + oControlData.resource
									})
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
										href: "topic/" + oControlData.docuLink
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
									new Image({
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
										href: "api/" + oControlData.extendsText,
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
								oSubClassesLink = _getLink({text: aSubClasses[0], href: "api/" + aSubClasses[0]});
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
								aItems.push(_getLink({text: oElement.name, href: "api/" + oElement.href}));
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
							var sVisibility = oControlData.visibility,
								aAllowedFor = oEntityData.allowedFor;
							if ( sVisibility === "restricted" && aAllowedFor) {
								return aAllowedFor.length > 1 ?
									_getObjectAttributeBlock("Visibility", sVisibility,
									_getLink({
										text: "restricted to",
										press: this._openVisibilityPopover.bind(this, aAllowedFor)
								})) :
								_getVisibilityObjectStatusBlock(sVisibility, aAllowedFor);

							} else {
								return _getObjectAttributeBlock("Visibility", sVisibility);
							}

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
					return new CustomListItem({
						content: [
							new Link({
								text: oElement,
								href: "api/" + oElement
							}).addStyleClass("sapUiTinyMargin")
						]
					});
				}), oPopover = this._addPopoverContent(aPopoverContent);

				oPopover.openBy(oEvent.getSource());
			},

			/**
			 * Opens the Popover, which displays the visibility of the restricted entities.
			 */
			_openVisibilityPopover: function (aAllowedForItems, oEvent) {
				var aPopoverContent = aAllowedForItems.map(function (sElement) {
					return new CustomListItem({
						content: [
							new Text({
								text: sElement
							}).addStyleClass("sapUiTinyMargin")
						]
					});
				}), oPopover = this._addPopoverContent(aPopoverContent);

				oPopover.openBy(oEvent.getSource());
			},

			_addPopoverContent: function (aContent) {
				var oPopover = this._getPopover();

				if (oPopover.getContent().length > 0) {
					oPopover.destroyContent(); // destroy the old content, before adding the new one
				}

				if (aContent && aContent.length > 0) {
					var oList = new List({
						items: aContent || []
					});

					oPopover.addContent(oList);
				}

				return oPopover;
			},

			_getPopover: function () {
				if (!this._oPopover) {
					this._oPopover = new Popover({
						placement: "Bottom",
						showHeader: false
					});
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
					bIsOpenUI5 = this.getModel("versionData").getProperty("/isOpenUI5"),
					aHeaderBlocksInfo = [
						{creator: "_getControlSampleBlock", exists: oControlData.isClass || oControlData.isNamespace},
						{creator: "_getDocumentationBlock", exists: oControlData.docuLink !== undefined},
						{creator: "_getControlGithub", exists: bIsOpenUI5 && oControlData.resource && oEntityData.lib},
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
				this.scrollToEntity("annotations", "Summary");
			},

			backToSearch: function () {
				this.onNavBack();
			}
		});
	}
);