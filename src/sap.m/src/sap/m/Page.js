/*!
 * ${copyright}
 */

// Provides control sap.m.Page.
sap.ui.define([
	"./library",
	"sap/ui/core/Control",
	"sap/ui/core/delegate/ScrollEnablement",
	"sap/m/Title",
	"sap/m/Button",
	"sap/m/Bar",
	'sap/m/TitleAlignmentMixin',
	"sap/ui/core/ContextMenuSupport",
	"sap/ui/core/util/ResponsivePaddingsEnablement",
	"sap/ui/core/library",
	"sap/ui/Device",
	"sap/ui/core/Element",
	"./TitlePropagationSupport",
	"./PageRenderer",
	"sap/ui/thirdparty/jquery"
],
function(
	library,
	Control,
	ScrollEnablement,
	Title,
	Button,
	Bar,
	TitleAlignmentMixin,
	ContextMenuSupport,
	ResponsivePaddingsEnablement,
	coreLibrary,
	Device,
	Element,
	TitlePropagationSupport,
	PageRenderer,
	jQuery
) {
		"use strict";


		// shortcut for sap.ui.core.AccessibleLandmarkRole
		var AccessibleLandmarkRole = coreLibrary.AccessibleLandmarkRole;

		// shortcut for sap.m.ButtonType
		var ButtonType = library.ButtonType;

		// shortcut for sap.m.PageBackgroundDesign
		var PageBackgroundDesign = library.PageBackgroundDesign;

		// shortcut for sap.ui.core.TitleLevel
		var TitleLevel = coreLibrary.TitleLevel;

		// shortcut for sap.m.TitleAlignment
		var TitleAlignment = library.TitleAlignment;

		var DIV = "div";
		var HEADER = "header";
		var FOOTER = "footer";


		/**
		 * Constructor for a new Page.
		 *
		 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
		 * @param {object} [mSettings] Initial settings for the new control
		 *
		 * @class
		 * A container control that holds one whole screen of an application.
		 *
		 * <h3>Overview</h3>
		 * The sap.m.Page is a container control that holds one whole screen of an application.
		 * The page has three distinct areas that can hold content - a header, content area and a footer.
		 * <h3>Structure</h3>
		 * <h4>Header</h4>
		 * The top most area of the page is occupied by the header. The standard header includes a navigation button and a title.
		 * Alternatively, you can create your own custom header, which is defined in the <code>customHeader</code> aggregation.
		 * <h4>Content</h4>
		 * The content occupies the main part of the page. Only the content area is scrollable by default.
		 * This can be prevented by setting  <code>enableScrolling</code> to <code>false</code>.
		 * <h4>Footer</h4>
		 * The footer is optional and occupies the fixed bottom part of the page. Alternatively, the footer can be floating above the bottom part of the content.
		 * This is enabled with the <code>floatingFooter</code> property.
		 *
		 * <b>Note:</b> All accessibility information for the different areas and their corresponding ARIA roles is set in the aggregation <code>landmarkInfo</code> of type {@link sap.m.PageAccessibleLandmarkInfo}
		 * <h3>Responsive Behavior</h3>
		 * When using the sap.m.Page in SAP Quartz theme, the breakpoints and layout paddings could be determined by the container's width.
		 * To enable this concept and add responsive paddings to an element of the Page control, you may add the following classes depending on your use case:
		 * <code>sapUiResponsivePadding--header</code>, <code>sapUiResponsivePadding--subHeader</code>, <code>sapUiResponsivePadding--content</code>, <code>sapUiResponsivePadding--footer</code>, <code>sapUiResponsivePadding--floatingFooter</code>.
		 * @extends sap.ui.core.Control
		 * @mixes sap.ui.core.ContextMenuSupport
		 * @author SAP SE
		 * @version ${version}
		 *
		 * @public
		 * @alias sap.m.Page
		 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
		 */
		var Page = Control.extend("sap.m.Page", /** @lends sap.m.Page.prototype */ {
			metadata: {

				library: "sap.m",
				properties: {

					/**
					 * The title text appearing in the page header bar.
					 */
					title: {type: "string", group: "Data", defaultValue: null},

					/**
					 * Defines the semantic level of the title. Using "Auto" no explicit level information is written.
					 * Used for accessibility purposes only.
					 */
					titleLevel: {
						type: "sap.ui.core.TitleLevel",
						group: "Appearance",
						defaultValue: TitleLevel.Auto
					},

					/**
					 * A nav button will be rendered on the left area of header bar if this property is set to true.
					 */
					showNavButton: {type: "boolean", group: "Appearance", defaultValue: false},

					/**
					 * Whether this page shall have a header.
					 * If set to true, either the control under the "customHeader" aggregation is used, or if there is no such control, a Header control is constructed from the properties "title", "showNavButton", "navButtonText" and "icon" depending on the platform.
					 */
					showHeader: {type: "boolean", group: "Appearance", defaultValue: true},

					/**
					 * Whether this page shall show the subheader.
					 * @since 1.28
					 */
					showSubHeader: {type: "boolean", group: "Appearance", defaultValue: true},

					/**
					 * The text of the nav button when running in iOS (if shown) in case it deviates from the default, which is "Back". This property is mvi-theme-dependent and will not have any effect in other themes.
					 * @deprecated Since version 1.20.
					 * Deprecated since the MVI theme is removed now. This property only affected the NavButton in that theme.
					 */
					navButtonText: {type: "string", group: "Misc", defaultValue: null, deprecated: true},

					/**
					 * The tooltip of the nav button
					 *
					 * Since version 1.34
					 */
					navButtonTooltip: {type: "string", group: "Misc", defaultValue: null},

					/**
					 * Enable vertical scrolling of page contents. Page headers and footers are fixed and do not scroll.
					 * If set to false, there will be no vertical scrolling at all.
					 *
					 * The Page only allows vertical scrolling because horizontal scrolling is discouraged in general for full-page content. If it still needs to be achieved, disable the Page scrolling and use a ScrollContainer as full-page content of the Page. This allows you to freely configure scrolling. It can also be used to create horizontally-scrolling sub-areas of (vertically-scrolling) Pages.
					 */
					enableScrolling: {type: "boolean", group: "Behavior", defaultValue: true},

					/**
					 * the icon that is rendered in the page header bar in non-iOS phone/tablet platforms. This property is theme-dependent and only has an effect in the MVI theme.
					 * @deprecated Since version 1.20.
					 * Deprecated since the MVI theme is removed now. This property only affected the NavButton in that theme.
					 */
					icon: {type: "sap.ui.core.URI", group: "Appearance", defaultValue: null, deprecated: true},

					/**
					 * This property is used to set the background color of a page. When a list is placed inside a page, the value "List" should be used to display a gray background. "Standard", with the default background color, is used if not specified.
					 */
					backgroundDesign: {
						type: "sap.m.PageBackgroundDesign",
						group: "Appearance",
						defaultValue: PageBackgroundDesign.Standard
					},

					/**
					 * This property is used to set the appearance of the NavButton. By default when showNavButton is set to true, a back button will be shown in iOS and an up button in other platforms. In case you want to show a normal button in the left header area, you can set the value to "Default".
					 * @since 1.12
					 * @deprecated Since version 1.20.
					 * Deprecated since the MVI theme is removed now. This property is only usable with a Button text in that theme.
					 */
					navButtonType: {
						type: "sap.m.ButtonType",
						group: "Appearance",
						defaultValue: ButtonType.Back,
						deprecated: true
					},

					/**
					 * Whether this page shall have a footer
					 * @since 1.13.1
					 */
					showFooter: {type: "boolean", group: "Appearance", defaultValue: true},

					/**
					 * Decides which area is covered by the local BusyIndicator when <code>page.setBusy()</code> is called. By default the entire page is covered, including headers and footer. When this property is set to "true", only the content area is covered (not header/sub header and footer), which is useful e.g. when there is a SearchField in the sub header and live search continuously updates the content area while the user is still able to type.
					 * @since 1.29.0
					 */
					contentOnlyBusy: {type: "boolean", group: "Appearance", defaultValue: false},

					/**
					 * Decides whether the footer can float.
					 * When set to true, the footer is not fixed below the content area anymore, but rather floats over it with a slight offset from the bottom.
					 */
					floatingFooter: {type: "boolean", group:"Appearance", defaultValue: false },

					/**
					 * Specifies the Title alignment (theme specific).
					 * If set to <code>TitleAlignment.Auto</code>, the Title will be aligned as it is set in the theme (if not set, the default value is <code>center</code>);
					 * Other possible values are <code>TitleAlignment.Start</code> (left or right depending on LTR/RTL), and <code>TitleAlignment.Center</code> (centered)
					 * @since 1.72
					 * @public
					 */
					titleAlignment : {type : "sap.m.TitleAlignment", group : "Misc", defaultValue : TitleAlignment.Auto}
				},
				defaultAggregation: "content",
				aggregations: {
					/**
					 * The content of this page
					 */
					content: {type: "sap.ui.core.Control", multiple: true, singularName: "content"},

					/**
					 * The (optional) custom header of this page.
					 * Use this aggregation only when a custom header is constructed where the default header consisting of title text + nav button is not sufficient.
					 * If this aggregation is set, the simple properties "title", "showNavButton", "NavButtonText" and "icon" are not used.
					 */
					customHeader: {type: "sap.m.IBar", multiple: false},

					/**
					 * The (optional) footer of this page. It is always located at the bottom of the page
					 */
					footer: {type: "sap.m.IBar", multiple: false},

					/**
					 * a subHeader will be rendered directly under the header
					 */
					subHeader: {type: "sap.m.IBar", multiple: false},

					/**
					 * Controls to be added to the right side of the page header. Usually an application would use Button controls and limit the number to one when the application needs to run on smartphones. There is no automatic overflow handling when the space is insufficient.
					 * When a customHeader is used, this aggregation will be ignored.
					 */
					headerContent: {type: "sap.ui.core.Control", multiple: true, singularName: "headerContent", forwarding: {getter: "_getInternalHeader", aggregation: "contentRight"}},

					/**
					 * Accessible landmark settings to be applied on the containers of the <code>sap.m.Page</code> control.
					 *
					 * If not set, no landmarks will be written.
					 */
					landmarkInfo : {type : "sap.m.PageAccessibleLandmarkInfo", multiple : false},

					/**
					 * A header bar which is managed internally by the Page control
					 */
					_internalHeader: {type: "sap.m.IBar", multiple: false, visibility: "hidden"}
				},
				events: {

					/**
					 * this event is fired when Nav Button is tapped
					 * @deprecated Since version 1.12.2.
					 * the navButtonPress event is replacing this event
					 */
					navButtonTap: {deprecated: true},

					/**
					 * this event is fired when Nav Button is pressed
					 * @since 1.12.2
					 */
					navButtonPress: {}
				},
				dnd: { draggable: false, droppable: true },
				designtime: "sap/m/designtime/Page.designtime"
			}
		});

		ContextMenuSupport.apply(Page.prototype);

		ResponsivePaddingsEnablement.call(Page.prototype, {
			header: {suffix: "intHeader"},
			subHeader: {selector: ".sapMPageSubHeader .sapMIBar"},
			content: {suffix: "cont"},
			footer: {selector: ".sapMPageFooter:not(.sapMPageFloatingFooter) .sapMIBar"},
			floatingFooter: {selector: ".sapMPageFloatingFooter.sapMPageFooter"}
		});

		// Add title propagation support
		TitlePropagationSupport.call(Page.prototype, "content", function () {
			return this._headerTitle ? this._headerTitle.getId() : false;
		});

		Page.FOOTER_ANIMATION_DURATION = 350;

		Page.prototype.init = function () {
			this._initTitlePropagationSupport();
			this._initResponsivePaddingsEnablement();
		};

		// Return true if scrolling is allowed
		Page.prototype._hasScrolling = function () {
			return this.getEnableScrolling();
		};

		Page.prototype.onBeforeRendering = function () {
			if (this._oScroller && !this._hasScrolling()) {
				this._oScroller.destroy();
				this._oScroller = null;
			} else if (this._hasScrolling() && !this._oScroller) {
				this._oScroller = new ScrollEnablement(this, null, {
					scrollContainerId: this.getId() + "-cont",
					horizontal: false,
					vertical: true
				});
			}

			if (this._headerTitle) {
				this._headerTitle.setLevel(this.getTitleLevel());
			}

			this._ensureNavButton(); // creates this._navBtn, if required
		};

		Page.prototype.onAfterRendering = function () {
			setTimeout(this._adjustFooterWidth.bind(this), 10);
			this.$().toggleClass("sapMPageBusyCoversAll", !this.getContentOnlyBusy());

			// If contentOnlyBusy property is set, then the busy indicator should cover only the content area
			// Otherwise all clicks in the footer, header and subheader might be suppressed
			this._sBusySection = this.getContentOnlyBusy() ? 'cont' : null;
		};

		/**
		 * Called when the control is destroyed.
		 *
		 * @private
		 */
		Page.prototype.exit = function () {
			if (this._oScroller) {
				this._oScroller.destroy();
				this._oScroller = null;
			}
			if (this._headerTitle) {
				this._headerTitle.destroy();
				this._headerTitle = null;
			}
			if (this._navBtn) {
				this._navBtn.destroy();
				this._navBtn = null;
			}
			if (this._appIcon) {
				this._appIcon.destroy();
				this._appIcon = null;
			}
		};

		Page.prototype.setBackgroundDesign = function (sBgDesign) {
			var sBgDesignOld = this.getBackgroundDesign();

			this.setProperty("backgroundDesign", sBgDesign, true);
			this.$().removeClass("sapMPageBg" + sBgDesignOld).addClass("sapMPageBg" + this.getBackgroundDesign());
			return this;
		};

		Page.prototype.setTitle = function (sTitle) {
			var bWasNull = !this._headerTitle;

			this._headerTitle = this._headerTitle || new Title(this.getId() + "-title", {
					level: this.getTitleLevel()
				});
			this._headerTitle.setText(sTitle);

			if (bWasNull) {
				this._updateHeaderContent(this._headerTitle, "middle", 0);
			}

			this.setProperty("title", sTitle, true);
			return this;
		};

		Page.prototype._ensureNavButton = function () {
			var sBackText = this.getNavButtonTooltip() || sap.ui.getCore().getLibraryResourceBundle("sap.m").getText("PAGE_NAVBUTTON_TEXT"); // any other types than "Back" do not make sense anymore in Blue Crystal

			if (!this._navBtn) {
				this._navBtn = new Button(this.getId() + "-navButton", {
					press: jQuery.proxy(function () {
						this.fireNavButtonPress();
						this.fireNavButtonTap();
					}, this)
				});

				if (!Device.os.ios && this.getNavButtonType() == ButtonType.Back) {
					// internal conversion from Back to Up for non-iOS platform
					this._navBtn.setType(ButtonType.Up);
				} else {
					this._navBtn.setType(this.getNavButtonType());
				}
			}

			this._navBtn.setTooltip(sBackText);
		};

		Page.prototype.setShowNavButton = function (bShowNavBtn) {
			var bOldValue = !!this.getShowNavButton();
			if (bShowNavBtn === bOldValue) {
				return this;
			}

			this.setProperty("showNavButton", bShowNavBtn, true);

			if (bShowNavBtn) {
				this._ensureNavButton(); // creates this._navBtn, if required
				if (this._appIcon) {
					this._updateHeaderContent(this._appIcon, "left", -1);
				}

				this._updateHeaderContent(this._navBtn, "left", 0);
			} else if (this._navBtn) {
				// remove back button from header bar
				this._updateHeaderContent(this._navBtn, "left", -1);
			}
			return this;
		};

		Page.prototype.setShowFooter = function (bShowFooter) {
			if (this.getDomRef()) {
				(bShowFooter) ? this.$().addClass("sapMPageWithFooter") : this.$().removeClass("sapMPageWithFooter");
			}

			var $footer = jQuery(this.getDomRef()).find(".sapMPageFooter").last(),
				useAnimation = sap.ui.getCore().getConfiguration().getAnimation();

			if (!this.getFloatingFooter()) {
				this.setProperty("showFooter", bShowFooter);
				return this;
			}

			this.setProperty("showFooter", bShowFooter, true);

			$footer.removeClass("sapUiHidden");
			$footer.toggleClass("sapMPageFooterControlShow", bShowFooter);
			$footer.toggleClass("sapMPageFooterControlHide", !bShowFooter);

			if (bShowFooter) {
				return this;
			}

			if (useAnimation) {
				setTimeout(function () {
					$footer.toggleClass("sapUiHidden", !bShowFooter);
				}, Page.FOOTER_ANIMATION_DURATION);
			} else {
				$footer.toggleClass("sapUiHidden", !bShowFooter);
			}

			return this;
		};

		Page.prototype._adjustFooterWidth = function () {
			var bDirection  = sap.ui.getCore().getConfiguration().getRTL() ? "left" : "right";
			if (!this.getShowFooter() || !this.getFloatingFooter() || !this.getFooter()) {
				return;
			}

			var $footer = jQuery(this.getDomRef()).find(".sapMPageFooter").last();

			if (this._contentHasScroll()) {
				$footer.css(bDirection, jQuery.position.scrollbarWidth() + "px");
				$footer.css("width", "initial");
			} else {
				$footer.css(bDirection, 0);
				$footer.css("width", "");
			}
		};

		Page.prototype._contentHasScroll = function () {
			var $section = jQuery(document.getElementById(this.getId() + "-cont"));
			return $section[0].scrollHeight > $section.innerHeight();
		};

		/**
		 * Update content of internal header
		 * @param {sap.ui.core.Control} oContent control to be added
		 * @param {string} sContentPosition position where the control should be located, possible values left/middle/right
		 * @param {number} iContentIndex the order of the control to be placed. If set to -1, the control will be removed from the header
		 * @private
		 */
		Page.prototype._updateHeaderContent = function (oContent, sContentPosition, iContentIndex) {
			var oInternalHeader = this._getInternalHeader();

			if (oInternalHeader) {
				switch (sContentPosition) {
					case "left":
						if (iContentIndex == -1) {
							if (oInternalHeader.getContentLeft()) {
								oInternalHeader.removeContentLeft(oContent);
							}
						} else {
							if (oInternalHeader.indexOfContentLeft(oContent) != iContentIndex) {
								oInternalHeader.insertContentLeft(oContent, iContentIndex);
								oInternalHeader.invalidate(); // workaround for bOutput problem
							}
						}
						break;
					case "middle":
						if (iContentIndex == -1) {
							if (oInternalHeader.getContentMiddle()) {
								oInternalHeader.removeContentMiddle(oContent);
							}
						} else {
							if (oInternalHeader.indexOfContentMiddle(oContent) != iContentIndex) {
								oInternalHeader.insertContentMiddle(oContent, iContentIndex);
								oInternalHeader.invalidate();
							}
						}
						break;
					case "right":
						if (iContentIndex == -1) {
							if (oInternalHeader.getContentRight()) {
								oInternalHeader.removeContentRight(oContent);
							}
						} else {
							if (oInternalHeader.indexOfContentRight(oContent) != iContentIndex) {
								oInternalHeader.insertContentRight(oContent, iContentIndex);
								oInternalHeader.invalidate();
							}
						}
						break;
					default:
						break;
				}
			}
		};

		/**
		 * Create internal header
		 * @returns {sap.m.IBar} The header instance
		 * @private
		 */

		Page.prototype._getInternalHeader = function () {
			var oInternalHeader = this.getAggregation("_internalHeader");
			if (!oInternalHeader) {
				this.setAggregation("_internalHeader", new Bar(this.getId() + "-intHeader"), true); // don"t invalidate - this is only called before/during rendering, where invalidation would lead to double rendering,  or when invalidation anyway happens
				oInternalHeader = this.getAggregation("_internalHeader");

				// call the method that registers this Bar for alignment
				this._setupBarTitleAlignment(oInternalHeader, this.getId() + "_internalHeader");

				if (this.getShowNavButton() && this._navBtn) {
					this._updateHeaderContent(this._navBtn, "left", 0);
				}
				if (this.getTitle() && this._headerTitle) {
					this._updateHeaderContent(this._headerTitle, "middle", 0);
				}
			}
			return oInternalHeader;
		};

		/**
		 * Returns the custom or internal header
		 * @returns {sap.m.IBar} The header instance
		 * @private
		 */
		Page.prototype._getAnyHeader = function () {
			var oCustomHeader = this.getCustomHeader();

			if (oCustomHeader) {
				// return aggregated header, if it exists
				return oCustomHeader.addStyleClass("sapMPageHeader");
			}

			return this._getInternalHeader().addStyleClass("sapMPageHeader");
		};

		/**
		 * Returns the sap.ui.core.ScrollEnablement delegate which is used with this control.
		 * @returns {sap.ui.core.ScrollEnablement} The scroll enablement delegate
		 * @private
		 */
		Page.prototype.getScrollDelegate = function () {
			return this._oScroller;
		};

		/**
		 * Formats <code>PageAccessibleLandmarkInfo</code> role and label of the provided <code>Page</code> part.
		 *
		 * @param {sap.m.PageAccessibleLandmarkInfo} oLandmarkInfo Page LandmarkInfo
		 * @param {string} sPartName part of the page
		 * @returns {sap.m.PageAccessibleLandmarkInfo} The formatted landmark info
		 * @private
		 */
		Page.prototype._formatLandmarkInfo = function (oLandmarkInfo, sPartName) {
			if (oLandmarkInfo) {
				var sRole = oLandmarkInfo["get" + sPartName + "Role"]() || "",
					sLabel = oLandmarkInfo["get" + sPartName + "Label"]() || "";

				if (sRole === AccessibleLandmarkRole.None) {
					sRole = '';
				}

				return {
					role: sRole.toLowerCase(),
					label: sLabel
				};
			}

			return {};
		};

		/**
		 * Returns HTML tag of the page header.
		 *
		 * @param {sap.m.PageAccessibleLandmarkInfo} oLandmarkInfo Page LandmarkInfo
		 * @returns {string} The HTMLtag of the page header.
		 * @private
		 */
		Page.prototype._getHeaderTag = function (oLandmarkInfo) {
			if (oLandmarkInfo && oLandmarkInfo.getHeaderRole() !== AccessibleLandmarkRole.None) {
				return DIV;
			}

			return HEADER;
		};

		/**
		 * Returns HTML tag of the page sub-header.
		 *
		 * @param {sap.m.PageAccessibleLandmarkInfo} oLandmarkInfo Page LandmarkInfo
		 * @returns {string} The HTML tag of the page sub-header.
		 * @private
		 */
		Page.prototype._getSubHeaderTag = function (oLandmarkInfo) {
			if (oLandmarkInfo && oLandmarkInfo.getSubHeaderRole() !== AccessibleLandmarkRole.None) {
				return DIV;
			}

			return HEADER;
		};

		/**
		 * Returns HTML tag of the page footer.
		 *
		 * @param {sap.m.PageAccessibleLandmarkInfo} oLandmarkInfo Page LandmarkInfo
		 * @returns {string} The HTML tag of the page footer.
		 * @private
		 */
		Page.prototype._getFooterTag = function (oLandmarkInfo) {
			if (oLandmarkInfo && oLandmarkInfo.getFooterRole() !== AccessibleLandmarkRole.None) {
				return DIV;
			}

			return FOOTER;
		};

		//*** API Methods ***


		/**
		 * Scrolls to the given position. Only available if enableScrolling is set to "true".
		 *
		 * @param {int} y The vertical pixel position to scroll to. Scrolling down happens with positive values.
		 * @param {int} time The duration of animated scrolling. To scroll immediately without animation, give 0 as value. 0 is also the default value, when this optional parameter is omitted.
		 * @returns {sap.m.Page} <code>this</code> to facilitate method chaining.
		 * @public
		 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
		 */
		Page.prototype.scrollTo = function (y, time) {
			if (this._oScroller) {
				this._oScroller.scrollTo(0, y, time);
			}
			return this;
		};

		/**
		 * Scrolls to an element (DOM or sap.ui.core.Element) within the page if the element is rendered.
		 * @param {HTMLElement | sap.ui.core.Element} oElement The element to which should be scrolled.
		 * @param {int} [iTime=0]
		 *           The duration of animated scrolling in milliseconds. To scroll immediately without animation,
		 *           give 0 as value.
		 * @param {int[]} [aOffset=[0,0]]
		 *           Specifies an additional left and top offset of the target scroll position, relative to
		 *           the upper left corner of the DOM element
		 * @returns {sap.m.Page} <code>this</code> to facilitate method chaining.
		 * @since 1.30
		 * @public
		 */
		Page.prototype.scrollToElement = function (oElement, iTime, aOffset) {
			if (oElement instanceof Element) {
				oElement = oElement.getDomRef();
			}

			if (this._oScroller) {
				this._oScroller.scrollToElement(oElement, iTime, aOffset);
			}
			return this;
		};

		Page.prototype.setCustomHeader = function(oHeader) {

			this.setAggregation("customHeader", oHeader);

			this.toggleStyleClass("sapFShellBar-CTX", oHeader && oHeader.isA("sap.f.ShellBar"));

			/*
			 * Runs Fiori 2.0 adaptation for the header
			 */
			if (oHeader && this.mEventRegistry["_adaptableContentChange"] ) {
				this.fireEvent("_adaptableContentChange", {
					"parent": this,
					"adaptableContent": oHeader
				});
			}

			return this;
		};

		Page.prototype._getAdaptableContent = function () {
			return this._getAnyHeader();
		};

		// enrich the control functionality with TitleAlignmentMixin
		TitleAlignmentMixin.mixInto(Page.prototype);

		return Page;
	});