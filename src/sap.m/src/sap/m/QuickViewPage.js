/*!
 * ${copyright}
 */

// Provides control sap.m.QuickViewPage
sap.ui.define([
	"./library",
	"sap/ui/core/Control",
	"sap/ui/core/IconPool",
	"sap/ui/core/Lib",
	"sap/ui/layout/form/SimpleForm",
	"sap/ui/layout/VerticalLayout",
	"sap/ui/layout/HorizontalLayout",
	"sap/m/Page",
	"sap/m/Button",
	"sap/m/Bar",
	"sap/m/Title",
	"sap/m/Link",
	"sap/m/Text",
	"sap/m/Label",
	"sap/m/HBox",
	"sap/ui/core/Icon",
	"sap/ui/core/Title",
	"sap/ui/core/CustomData",
	"sap/ui/core/library",
	"sap/ui/layout/library",
	"sap/ui/Device",
	"sap/ui/layout/form/ResponsiveGridLayout",
	"./QuickViewPageRenderer",
	"sap/base/Log",
	"sap/base/security/encodeURL",
	// jQuery Plugin "firstFocusableDomRef"
	"sap/ui/dom/jquery/Focusable"
], function(
	library,
	Control,
	IconPool,
	Library,
	SimpleForm,
	VerticalLayout,
	HorizontalLayout,
	Page,
	Button,
	Bar,
	Title,
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
	Log,
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

	// shortcut for sap.m.EmptyIndicator
	var EmptyIndicatorMode = library.EmptyIndicatorMode;

	var oRB = Library.getResourceBundleFor('sap.m');

	// shortcut for sap.m.PageBackgroundDesign
	var PageBackgroundDesign = library.PageBackgroundDesign;

	/**
	 * Constructor for a new QuickViewPage.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class QuickViewPage consists of a page header, an avatar,
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
	 */
	var QuickViewPage = Control.extend("sap.m.QuickViewPage", /** @lends sap.m.QuickViewPage.prototype */ {
		metadata: {

			library: "sap.m",
			properties: {
				/**
				 * Page id
				 */
				pageId: { type: "string", group: "Misc", defaultValue: "" },

				/**
				 * Specifies the text displayed in the header of the control.
				 */
				header: { type: "string", group: "Misc", defaultValue: "" },

				/**
				 * Specifies the text displayed in the header of the content section of the control.
				 */
				title: { type: "string", group: "Misc", defaultValue: "" },

				/**
				 * Specifies the URL which opens when the title or the avatar is clicked.
				 * <b>Note:</b> If the avatar has <code>press</code> listeners this URL is not opened automatically.
				 */
				titleUrl: { type: "string", group: "Misc", defaultValue: "" },

				/**
				 * Specifies the text displayed under the header of the content section.
				 */
				description: { type: "string", group: "Misc", defaultValue: "" }
			},
			defaultAggregation: "groups",
			aggregations: {

				/**
				 * QuickViewGroup consists of a title (optional) and an entity of group elements.
				 */
				groups: { type: "sap.m.QuickViewGroup", multiple: true, singularName: "group", bindable: "bindable" },

				/**
				 * Specifies the avatar displayed under the header of the page.
				 * <b>Note:</b> To achieve the recommended design and behavior don't use the
				 * <code>displaySize</code>, <code>customDisplaySize</code>, <code>customFontSize</code> properties
				 * and <code>detailBox</code> aggregation of <code>sap.m.Avatar</code>.
				 * @since 1.92
				 */
				avatar: { type: "sap.m.Avatar", multiple: false, bindable: "bindable" }
			}
		},
		renderer: QuickViewPageRenderer
	});

	QuickViewPage.prototype.init =  function() {};

	QuickViewPage.prototype.exit = function() {
		if (this._oPage) {
			this._oPage.destroy();
			this._oPage = null;
		} else {
			this._destroyPageContent();
		}

		this._mNavContext = null;
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
				customHeader : new Bar(),
				backgroundDesign: PageBackgroundDesign.Transparent
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
					tooltip : oRB.getText("PAGE_NAVBUTTON_TEXT"),
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
	 * @returns {sap.ui.layout.HorizontalLayout|null} The header of the QuickViewPage
	 * @private
	 */
	QuickViewPage.prototype._getPageHeaderContent = function() {
		var oAvatar = this._getAvatar(),
			oVLayout = new VerticalLayout(),
			oHLayout = new HorizontalLayout(),
			sTitle = this.getTitle(),
			sDescription = this.getDescription(),
			sTitleUrl = this.getTitleUrl(),
			oTitle,
			oDescription;

		if (oAvatar && oAvatar.getVisible()) {
			oHLayout.addContent(oAvatar);
		}

		if (sTitleUrl && sTitle) {
			oTitle = new Link({
				text: sTitle,
				href: sTitleUrl,
				target: "_blank"
			});
		} else if (sTitle) {
			oTitle = new Title({
				text: sTitle,
				level: CoreTitleLevel.H3
			});
		}

		this.setPageTitleControl(oTitle);

		if (sDescription) {
			oDescription = new Text({
				text: sDescription,
				maxLines: 2
			});
		}

		if (oTitle) {
			oVLayout.addContent(oTitle);
		}
		if (oDescription) {
			oVLayout.addContent(oDescription);
		}

		if (oVLayout.getContent().length) {
			oHLayout.addContent(oVLayout);
		} else {
			oVLayout.destroy();
		}

		if (oHLayout.getContent().length) {
			return oHLayout;
		}

		oHLayout.destroy();

		return null;
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
				text: oGroup.getHeading(),
				level: CoreTitleLevel.H4
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
				oForm.addContent(new Text({text : "", emptyIndicatorMode: EmptyIndicatorMode.On}));
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
					tooltip : oRB.getText("QUICKVIEW_SEND_SMS"),
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
	 * @private
	 */
	QuickViewPage.prototype._crossApplicationNavigation = function () {
		if (this.getTitleUrl()) {
			URLHelper.redirect(this.getTitleUrl(), true);
		}
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

	/**
	 * Helper function used to attach click handler to links in the QuickViewPage
	 * that should lead to another QuickViewPage.
	 * @param {sap.m.QuickViewPage} that The page from which the navigation occurs.
	 * @returns {Function} A function executed when the link is clicked
	 * @private
	 */
	QuickViewPage.prototype._attachPressLink = function (that) {
		var mNavContext = that.getNavContext();

		return function (oEvent) {
			oEvent.preventDefault();
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
			QuickViewPage.prototype[sFuncName] = function () {
				var result = Control.prototype[sFuncName].apply(this, arguments);

				this._updatePage();

				if (["removeAggregation", "removeAllAggregation"].indexOf(sFuncName) !== -1) {
					return result;
				}

				return this;
			};
		});

	QuickViewPage.prototype.setProperty = function () {
		Control.prototype.setProperty.apply(this, arguments);

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

	QuickViewPage.prototype._getAvatar = function () {
		var oAvatar = null;

		if (this.getAvatar()) {
			// Copy the values of properties directly, don't clone bindings,
			// as this avatar and the whole NavContainer are not aggregated by the real QuickViewPage
			oAvatar = this.getAvatar().clone(null, null, { cloneBindings: false, cloneChildren: true });
			this._checkAvatarProperties(oAvatar);
		}

		if (oAvatar) {
			if (this.getTitleUrl() && !oAvatar.hasListeners("press")) {
				oAvatar.attachPress(this._crossApplicationNavigation.bind(this));
			}

			oAvatar.addStyleClass("sapMQuickViewThumbnail");
		}

		return oAvatar;
	};

	QuickViewPage.prototype._checkAvatarProperties = function (oAvatar) {
		var mDefaults = oAvatar.getMetadata().getPropertyDefaults();

		if (oAvatar.getDisplaySize() !== mDefaults["displaySize"]) {
			Log.warning("'displaySize' property of avatar shouldn't be used in sap.m.QuickViewPage");
		}

		if (oAvatar.getCustomDisplaySize() !== mDefaults["customDisplaySize"]) {
			Log.warning("'customDisplaySize' property of avatar shouldn't be used in sap.m.QuickViewPage");
		}

		if (oAvatar.getCustomFontSize() !== mDefaults["customFontSize"]) {
			Log.warning("'customFontSize' property of avatar shouldn't be used in sap.m.QuickViewPage");
		}

		if (oAvatar.getDetailBox()) {
			Log.warning("'detailBox' aggregation of avatar shouldn't be used in sap.m.QuickViewPage");
		}
	};

	return QuickViewPage;
});