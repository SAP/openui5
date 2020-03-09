/*
 * ! ${copyright}
 */

// Provides control sap.m.QuickViewPage
sap.ui.define([
	'./library',
	'sap/ui/core/Control',
	'sap/ui/core/IconPool',
	'sap/ui/layout/form/SimpleForm',
	'sap/ui/layout/VerticalLayout',
	'sap/ui/layout/HorizontalLayout',
	'./Page',
	'./Button',
	'./Bar',
	'./Title',
	'./Image',
	'./Link',
	'./Text',
	'./Label',
	'./HBox',
	'sap/ui/core/Icon',
	'sap/ui/core/Title',
	'sap/ui/core/CustomData',
	'sap/ui/core/library',
	'sap/ui/layout/library',
	'sap/ui/Device',
	'sap/ui/layout/form/ResponsiveGridLayout',
	'./QuickViewPageRenderer',
	"sap/base/security/encodeURL",
	"sap/ui/dom/jquery/Focusable" // jQuery Plugin "firstFocusableDomRef"
],
	function(
		library,
		Control,
		IconPool,
		SimpleForm,
		VerticalLayout,
		HorizontalLayout,
		Page,
		Button,
		Bar,
		Title,
		Image,
		Link,
		Text,
		Label,
		HBox,
		Icon,
		CoreTitle,
		//SimpleForm is loading ResponsiveGridLayout too late, only need as a dependency
		CustomData,
		coreLibrary,
		layoutLibrary,
		Device,
		ResponsiveGridLayout,
		QuickViewPageRenderer,
		encodeURL
		) {
			"use strict";

			// shortcut for sap.m.URLHelper
			var URLHelper = library.URLHelper;

			// shortcut for sap.ui.layout.form.SimpleFormLayout
			var SimpleFormLayout = layoutLibrary.form.SimpleFormLayout;

			// shortcut for sap.ui.core.TitleLevel
			var CoreTitleLevel = coreLibrary.TitleLevel;

			// shortcut for sap.m.QuickViewGroupElementType
			var QuickViewGroupElementType = library.QuickViewGroupElementType;

			// shortcut for sap.m.ButtonType
			var ButtonType = library.ButtonType;

			/**
			* Constructor for a new QuickViewPage.
			*
			* @param {string} [sId] ID for the new control, generated automatically if no ID is given
			* @param {object} [mSettings] Initial settings for the new control
			*
			* @class QuickViewPage consists of  a page header, an object icon or image,
			* an object name with short description, and an object information divided in groups.
			* The control uses the sap.m.SimpleForm control to display information.
			*
			* @extends sap.ui.core.Control
			*
			* @author SAP SE
			* @version ${version}
			*
			* @constructor
			* @public
			* @since 1.28.11
			* @alias sap.m.QuickViewPage
			* @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
			*/
			var QuickViewPage = Control.extend("sap.m.QuickViewPage", /** @lends sap.m.QuickViewPage.prototype */ {
						metadata: {

							library: "sap.m",
							properties: {

								/**
								 * Page id
								 */
								pageId: {
									type: "string",
									group: "Misc",
									defaultValue: ""
								},

								/**
								 * Specifies the text displayed in the header of the control.
								 */
								header: {
									type: "string",
									group: "Misc",
									defaultValue: ""
								},

								/**
								 * Specifies the text displayed in the header of the content section of the control.
								 */
								title: {
									type: "string",
									group: "Misc",
									defaultValue: ""
								},

								/**
								 * Specifies the URL which opens when the title or the thumbnail is clicked.
								 */
								titleUrl: {
									type: "string",
									group: "Misc",
									defaultValue: ""
								},

								/**
								 * Specifies the application which provides target and param configuration  for cross-application navigation from the 'page header'.
								 */
								crossAppNavCallback : {
									type: "object",
									group: "Misc"
								},

								/**
								 * Specifies the text displayed under the header of the content section
								 */
								description: {
									type: "string",
									group: "Misc",
									defaultValue: ""
								},

								/**
								 * Specifies the URL of the icon displayed under the header of the page
								 */
								icon: {
									type: "string",
									group: "Misc",
									defaultValue: ""
								},

								/**
								 * Defines the fallback icon displayed in case of wrong image src or loading issues.
								 *
								 * <b>Note</b> Accepted values are only icons from the SAP icon font.
								 *
								 * @since 1.69
								 */
								fallbackIcon: {
									type: "sap.ui.core.URI",
									group: "Appearance",
									defaultValue: null
								}
							},
							defaultAggregation: "groups",
							aggregations: {

								/**
								 * QuickViewGroup consists of a title (optional) and an entity of group elements.
								 */
								groups: {
									type: "sap.m.QuickViewGroup",
									multiple: true,
									singularName: "group",
									bindable: "bindable"
								}
							}
						}
					});


			QuickViewPage.prototype.init =  function() {
				this._oResourceBundle = sap.ui.getCore().getLibraryResourceBundle('sap.m');

				//see API docu for sap.ushell.services.CrossApplicationNavigation
				var fGetService =  sap.ushell && sap.ushell.Container && sap.ushell.Container.getService;
				if (fGetService) {
					this.oCrossAppNavigator = fGetService("CrossApplicationNavigation");
				}
			};

			/**
			 * Called before the control is rendered.
			 * @private
			 */
			QuickViewPage.prototype.onBeforeRendering =  function() {
				this._destroyPageContent();
				this._createPageContent();
			};

			/**
			 * Returns page content containing the header and the form.
			 * @private
			 * @returns {Object} Object containing the header and the form
			 */
			QuickViewPage.prototype.getPageContent =  function() {
				return this._mPageContent;
			};

			/**
			 * Sets context containing navigation information.
			 * @param {Object} context Object containing specific navigation data.
			 * @private
			 */
			QuickViewPage.prototype.setNavContext = function (context) {
				this._mNavContext = context;
			};

			/**
			 * Returns context containing navigation information.
			 * @private
			 * @returns {Object} Object containing specific navigation data
			 */
			QuickViewPage.prototype.getNavContext = function () {
				return this._mNavContext;
			};

			/**
			 * Sets page title control.
			 * @param {sap.ui.core.Control} title The control that is displayed in the title of the page.
			 * @private
			 */
			QuickViewPage.prototype.setPageTitleControl = function (title) {
				this._oPageTitle = title;
			};

			/**
			 * Returns page title control.
			 * @private
			 * @returns {sap.ui.core.Control} The control displayed in the title
			 */
			QuickViewPage.prototype.getPageTitleControl = function () {
				return this._oPageTitle;
			};

			/**
			 * Helper function that creates a new {@link sap.m.Page} and adds content to it.
			 * @returns {sap.m.Page} The created page
			 * @private
			 */
			QuickViewPage.prototype._createPage = function () {

				var mPageContent = this._createPageContent();

				var mNavContext = this.getNavContext();
				var oPage;

				if (this._oPage) {
					oPage = this._oPage;
					oPage.destroyContent();
					oPage.setCustomHeader(new Bar());
				} else {
					oPage = this._oPage = new Page(mNavContext.quickViewId + '-' + this.getPageId(), {
						customHeader : new Bar()
					});

					oPage.addEventDelegate({
						onAfterRendering: this.onAfterRenderingPage
					}, this);
				}

				//When there is only a single page in QuickView and no header set the header should be removed and device is not a phone
				if (this.getHeader() === "" && mNavContext.quickView.getPages().length === 1 && !Device.system.phone) {
					oPage.setShowHeader(false);
					oPage.addStyleClass('sapMQuickViewPageWithoutHeader');
				}

				if (mPageContent.header) {
					oPage.addContent(mPageContent.header);
				}

				oPage.addContent(mPageContent.form);

				var oCustomHeader = oPage.getCustomHeader();

				oCustomHeader.addContentMiddle(
					new Title({
						text : this.getHeader()
					}).addStyleClass("sapMQuickViewTitle")
				);

				if (mNavContext.hasBackButton) {
					oCustomHeader.addContentLeft(
						new Button({
							type : ButtonType.Back,
							tooltip : this._oResourceBundle.getText("PAGE_NAVBUTTON_TEXT"),
							press : function() {
								if (mNavContext.navContainer) {
									mNavContext.quickView._setNavOrigin(null);
									mNavContext.navContainer.back();
								}
							}
						})
					);
				}

				if (mNavContext.popover && Device.system.phone) {
					oCustomHeader.addContentRight(
						new Button({
							icon : IconPool.getIconURI("decline"),
							press : function() {
								mNavContext.popover.close();
							}
						})
					);
				}

				oPage.addStyleClass('sapMQuickViewPage');

				return oPage;
			};

			QuickViewPage.prototype.onAfterRenderingPage = function () {

				var oParent = this.getParent(),
					bIsInsideQuickView = oParent instanceof Control && oParent.isA('sap.m.QuickView');

				// add tabindex=0, so the content can be scrolled with the keyboard
				// jQuery Plugin "firstFocusableDomRef"
				if (bIsInsideQuickView && !this._oPage.$().firstFocusableDomRef()) {
					this._oPage.$('cont').attr('tabindex', 0);
				}

				if (this._bItemsChanged) {
					var mNavContext = this.getNavContext();
					if (mNavContext) {
						mNavContext.quickView._restoreFocus();
					}

					this._bItemsChanged = false;
				}
			};

			/**
			 * Helper function that creates the content of a QuickViewPage and returns it as an object
			 * with form and header properties.
			 * @returns {{form: sap.ui.layout.form.SimpleForm, header: sap.ui.layout.HorizontalLayout}}
			 * @private
			 */
			QuickViewPage.prototype._createPageContent = function () {

				var oForm = this._createForm();
				var oHeader = this._getPageHeaderContent();

				// add ARIA title to the form
				var oPageTitleControl = this.getPageTitleControl();
				if (oHeader && oPageTitleControl) {
					oForm.addAriaLabelledBy(oPageTitleControl);
				}

				this._mPageContent = {
					form: oForm,
					header: oHeader
				};

				return this._mPageContent;
			};

			/**
			 * Helper function that creates a form object based on the data in the groups of the QuickViewPage
			 * @returns {sap.ui.layout.form.SimpleForm} The form created based on the groups of the QuickViewPage
			 * @private
			 */
			QuickViewPage.prototype._createForm = function () {
				var aGroups = this.getAggregation("groups"),
					oForm = new SimpleForm({
						maxContainerCols: 1,
						editable: false,
						layout: SimpleFormLayout.ResponsiveGridLayout
					});

				if (aGroups) {
					for (var j = 0; j < aGroups.length; j++) {
						if (aGroups[j].getVisible()) {
							this._renderGroup(aGroups[j], oForm);
						}
					}
				}

				return oForm;
			};

			/**
			 * Helper function that creates the header of the QuickViewPage.
			 * @returns {sap.ui.layout.HorizontalLayout} The header of the QuickViewPage
			 * @private
			 */
			QuickViewPage.prototype._getPageHeaderContent = function() {
				var oIcon,
					oFallbackIcon,
					sFallbackIcon = this.getFallbackIcon(),
					oVLayout = new VerticalLayout(),
					oHLayout = new HorizontalLayout(),
					sIcon = this.getIcon(),
					sTitle = this.getTitle(),
					sDescription = this.getDescription(),
					sTitleUrl = this.getTitleUrl();

				if (!sIcon && !sTitle && !sDescription) {
					return null;
				}

				if (sIcon) {
					if (this.getIcon().indexOf("sap-icon") == 0) {
						oIcon = this._createIcon(sIcon, !sTitleUrl, sTitle);
					} else {
						oIcon = new Image({
							src: sIcon,
							decorative: false,
							tooltip: sTitle
						}).addStyleClass("sapUiIcon sapMQuickViewPageImage");

						if (IconPool.isIconURI(sFallbackIcon)) {
							oFallbackIcon = this._createIcon(sFallbackIcon, !sTitleUrl, sTitle);
							oFallbackIcon.addStyleClass("sapMQuickViewThumbnail sapMQuickViewPageFallbackIconHidden");
							oIcon.attachError(this._onImageLoadError.bind(this));
							oHLayout.addContent(oFallbackIcon);
						}
					}

					oIcon.addStyleClass("sapMQuickViewThumbnail");

					if (sTitleUrl) {
						oIcon.attachPress(this._crossApplicationNavigation(this));

						if (oFallbackIcon) {
							oFallbackIcon.attachPress(this._crossApplicationNavigation(this));
						}
					}

					oHLayout.addContent(oIcon);
				}

				var oTitle;

				if (sTitleUrl) {
					oTitle = new Link({
						text	: sTitle,
						href	: sTitleUrl,
						target	: "_blank"
					});
				} else if (this.getCrossAppNavCallback()) {
					oTitle = new Link({
						text	: sTitle
					});
					oTitle.attachPress(this._crossApplicationNavigation(this));
				} else {
					oTitle = new Title({
						text	: sTitle,
						level	: CoreTitleLevel.H1
					});
				}

				this.setPageTitleControl(oTitle);

				var oDescription = new Text({
					text	: sDescription
				});

				oVLayout.addContent(oTitle);
				oVLayout.addContent(oDescription);
				oHLayout.addContent(oVLayout);

				return oHLayout;
			};

			/**
			 * @param {string} sIconSrc The source of the icon.
			 * @param {boolean} bDecorative Whether the icon is decorative or not.
			 * @param {string} sTooltip The tooltip of the icon.
			 *
			 * @returns {sap.ui.core.Icon} New Icon instance.
			 * @private
			 */
			QuickViewPage.prototype._createIcon = function (sIconSrc, bDecorative, sTooltip) {
				return new Icon({
					src: sIconSrc,
					decorative: bDecorative,
					useIconTooltip: false,
					tooltip: sTooltip
				});
			};

			/**
			 * Helper function that renders a QuickViewGroup in the QuickViewPage.
			 * @param {sap.m.QuickViewGroup} oGroup The group to be rendered.
			 * @param {sap.ui.layout.form.SimpleForm} oForm The form in which the group is rendered
			 * @private
			 */
			QuickViewPage.prototype._renderGroup = function(oGroup, oForm) {
				var aElements = oGroup.getAggregation("elements");

				var oCurrentGroupElement,
					oCurrentGroupElementValue,
					oLabel;

				if (oGroup.getHeading()) {
					oForm.addContent(new CoreTitle({
						text : oGroup.getHeading(),
						level : CoreTitleLevel.H2
					}));
				}

				if (!aElements) {
					return;
				}

				var mNavContext = this.getNavContext();

				for (var k = 0; k < aElements.length; k++) {
					oCurrentGroupElement = aElements[k];

					if (!oCurrentGroupElement.getVisible()) {
						continue;
					}

					oLabel = new Label({
						text: oCurrentGroupElement.getLabel()
					});

					var sQuickViewId;
					if (mNavContext) {
						sQuickViewId = mNavContext.quickViewId;
					}

					oCurrentGroupElementValue = oCurrentGroupElement._getGroupElementValue(sQuickViewId);

					oForm.addContent(oLabel);

					if (!oCurrentGroupElementValue) {
						// Add dummy text element so that the form renders the oLabel
						oForm.addContent(new Text({text : ""}));
						continue;
					}

					oLabel.setLabelFor(oCurrentGroupElementValue.getId());

					if (oCurrentGroupElement.getType() == QuickViewGroupElementType.pageLink) {
						oCurrentGroupElementValue.attachPress(this._attachPressLink(this));
					}

					if (oCurrentGroupElement.getType() == QuickViewGroupElementType.mobile &&
						!Device.system.desktop) {
						var oSmsLink = new Icon({
							src: IconPool.getIconURI("post"),
							tooltip : this._oResourceBundle.getText("QUICKVIEW_SEND_SMS"),
							decorative : false,
							customData: [new CustomData({
								key: "phoneNumber",
								value: oCurrentGroupElement.getValue()
							})],
							press: this._mobilePress
						});

						var oBox = new HBox({
							items: [oCurrentGroupElementValue, oSmsLink]
						});
						oForm.addContent(oBox);
					} else {
						oForm.addContent(oCurrentGroupElementValue);
					}
				}
			};

			/**
			 * Helper function used to navigate to another Fiori application (intent based navigation) or
			 * to an external link.
			 * This will be applicable only for the header link.
			 * @param {sap.m.QuickViewPage} that - The page from which the navigation starts
			 * @returns {Function} A function that executes the navigation
			 * @private
			 */
			QuickViewPage.prototype._crossApplicationNavigation = function (that) {
				return function () {
					if (that.getCrossAppNavCallback() && that.oCrossAppNavigator) {
						var targetConfigCallback = that.getCrossAppNavCallback();
						if (typeof targetConfigCallback == "function") {
							var targetConfig = targetConfigCallback();
							var href = that.oCrossAppNavigator.hrefForExternal(
								{
									target : {
										semanticObject : targetConfig.target.semanticObject,
										action : targetConfig.target.action
									},
									params : targetConfig.params
								}
							);

							URLHelper.redirect(href);
						}
					} else  if (that.getTitleUrl()) {
						window.open(that.getTitleUrl(), "_blank");
					}
				};
			};

			QuickViewPage.prototype._destroyPageContent = function() {
				if (!this._mPageContent) {
					return;
				}

				if (this._mPageContent.form) {
					this._mPageContent.form.destroy();
				}

				if (this._mPageContent.header) {
					this._mPageContent.header.destroy();
				}

				this._mPageContent = null;

			};

			QuickViewPage.prototype.exit = function() {
				this._oResourceBundle = null;

				if (this._oPage) {
					this._oPage.destroy();
					this._oPage = null;
				} else {
					this._destroyPageContent();
				}

				this._mNavContext = null;
			};

			/**
			 * Helper function used to attach click handler to links in the QuickViewPage
			 * that should lead to another QuickViewPage.
			 * @param {sap.m.QuickViewPage} that The page from which the navigation occurs.
			 * @returns {Function} A function executed when the link is clicked
			 * @private
			 */
			QuickViewPage.prototype._attachPressLink = function (that) {

				var mNavContext = that.getNavContext();

				return function (e) {
					e.preventDefault();
					var sPageId = this.getCustomData()[0].getValue();
					if (mNavContext.navContainer && sPageId) {
						mNavContext.quickView._setNavOrigin(this);
						mNavContext.navContainer.to(sPageId);
					}
				};
			};

			/**
			 * Function executed when the sms icon in the QuickViewPage is clicked.
			 * @private
			 */
			QuickViewPage.prototype._mobilePress = function () {
				var sms = "sms://" + encodeURL(this.getCustomData()[0].getValue());
				window.location.replace(sms);
			};

			/**
			 * Updates the contents of the page and sets the focus on the last focused element or
			 * on the first focusable element.
			 * @private
			 */
			QuickViewPage.prototype._updatePage = function () {
				var mNavContext = this.getNavContext();
				if (mNavContext && mNavContext.quickView._bRendered) {

					this._bItemsChanged = true;

					mNavContext.popover.focus();

					if (mNavContext.quickView.indexOfPage(this) == 0) {
						mNavContext.quickView._clearContainerHeight();
					}

					this._createPage();

					// in some cases the popover has display:none style here,
					// which delays the simple form re-arranging and an unwanted scrollbar might appear.
					mNavContext.popover.$().css('display', 'block');

					mNavContext.quickView._adjustContainerHeight();

					mNavContext.quickView._restoreFocus();
				}
			};

			["setModel", "bindAggregation", "setAggregation", "insertAggregation", "addAggregation",
				"removeAggregation", "removeAllAggregation", "destroyAggregation"].forEach(function (sFuncName) {
					QuickViewPage.prototype["_" + sFuncName + "Old"] = QuickViewPage.prototype[sFuncName];
					QuickViewPage.prototype[sFuncName] = function () {
						var result = QuickViewPage.prototype["_" + sFuncName + "Old"].apply(this, arguments);

						this._updatePage();

						if (["removeAggregation", "removeAllAggregation"].indexOf(sFuncName) !== -1) {
							return result;
						}

						return this;
					};
				});

			QuickViewPage.prototype.setProperty = function (sName, oValue) {

				var oQuickView = this.getQuickViewBase(),
					bSuppressInvalidate = false;

				if (oQuickView && oQuickView.isA("sap.m.QuickView")) {
					bSuppressInvalidate = true;
				}

				Control.prototype.setProperty.call(this, sName, oValue, bSuppressInvalidate);

				this._updatePage();

				return this;
			};

			QuickViewPage.prototype.getQuickViewBase = function () {
				var oParent = this.getParent();
				if (oParent && oParent.isA("sap.m.QuickViewBase")) {
					return oParent;
				}
				return null;
			};

			/**
			 * Handler for loading failures of the icon.
			 * In such cases show the fallback icon, if given.
			 *
			 * @param {jQuery.Event} oEvent The event object.
			 * @private
			 */
			QuickViewPage.prototype._onImageLoadError = function (oEvent) {
				var FALLBACK_ICON_INDEX = 0,
					oFallbackIcon = this._mPageContent.header.getContent()[FALLBACK_ICON_INDEX],
					oFailedImage = oEvent.getSource(),
					bRestoreFocus = document.activeElement === oFailedImage.getDomRef();

				oFallbackIcon.removeStyleClass("sapMQuickViewPageFallbackIconHidden");
				oFailedImage.addStyleClass("sapMQuickViewPageFailedImage");

				// if before hiding the image it was the activeElement move the focus to the fallback icon
				if (bRestoreFocus) {
					oFallbackIcon.focus();
				}
			};

			return QuickViewPage;

		});