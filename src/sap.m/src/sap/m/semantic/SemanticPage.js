/*!
 * ${copyright}
 */

sap.ui.define([
	'jquery.sap.global',
	'sap/m/semantic/SegmentedContainer',
	'sap/m/semantic/SemanticConfiguration',
	'sap/m/Button',
	'sap/m/Title',
	'sap/m/Page',
	'sap/m/OverflowToolbar',
	'sap/m/ToolbarSpacer',
	'sap/m/Bar',
	'sap/ui/core/CustomData',
	'sap/ui/base/ManagedObject',
	'sap/m/PageAccessibleLandmarkInfo',
	'sap/ui/base/ManagedObjectObserver',
	'sap/ui/core/Control',
	'sap/ui/core/library',
	'sap/m/library',
	"./SemanticPageRenderer"
],
function(
    jQuery,
	SegmentedContainer,
	SemanticConfiguration,
	Button,
	Title,
	Page,
	OverflowToolbar,
	ToolbarSpacer,
	Bar,
	CustomData,
	ManagedObject,
	PageAccessibleLandmarkInfo,
	ManagedObjectObserver,
	Control,
	coreLibrary,
	library,
	SemanticPageRenderer
) {
	"use strict";

	// shortcut for sap.m.ButtonType
	var ButtonType = library.ButtonType;

	// shortcut for sap.m.PageBackgroundDesign
	var PageBackgroundDesign = library.PageBackgroundDesign;

	// shortcut for sap.m.semantic.SemanticRuleSetType
	var SemanticRuleSetType = library.semantic.SemanticRuleSetType;

	// shortcut for sap.ui.core.TitleLevel
	var TitleLevel = coreLibrary.TitleLevel;

	/**
	 * Constructor for a new <code>SemanticPage</code>.
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * An enhanced {@link sap.m.Page}, that can contain controls with semantic meaning,
	 * see {@link sap.m.semantic.SemanticControl}.
	 *
	 * <b>Note:</b> This control implements the SAP Fiori 1.0 design guidelines.
	 * For SAP Fiori 2.0, see the {@link sap.f.semantic.SemanticPage}.
	 *
	 * <h3>Overview</h3>
	 *
	 * The main functionality of the <code>SemanticPage</code> is to predefine the placement,
	 * behavior and styles of the page elements.
	 *
	 * Content specified in the semantic aggregations will be automatically positioned in
	 * dedicated sections of the footer or the header of the page.
	 *
	 * <h3>Structure</h3>
	 *
	 * The semantics of the content are the following:
	 * <ul>
	 * <li>Visual properties (for example, <code>AddAction</code> will be styled as an icon button)</li>
	 * <li>Position in the page (UX guidelines specify that some buttons should be in the header only,
	 *  while others are in the footer or the "share" menu, so we do the correct positioning)</li>
	 * <li>Sequence order (UX guidelines define a specific sequence order of semantic controls with
	 * respect to each other)</li>
	 * <li>Default localized tooltip for icon-only buttons</li>
	 * <li>Overflow behavior (UX guidelines define which buttons are allowed to go to the overflow of
	 * the toolbar when the screen gets narrower). For icon buttons, we ensure that the text label of
	 * the button appears when the button is in overflow, as specified by UX.</li>
	 * <li>Screen reader support (invisible text for reading the semantic type)</li>
	 * </ul>
	 *
	 * In addition to the predefined semantic controls, the <code>SemanticPage</code> can host also
	 * custom app controls. It preserves most of the API of the {@link sap.m.Page} for specifying page content.
	 *
	 * <h3>Usage</h3>
	 *
	 * The app developer only has to specify the action type, and the required styling and
	 * positioning are automatically added.
	 *
	 * @see {@link topic:4a97a07ec8f5441d901994d82eaab1f5 Semantic Page}
	 * @see {@link topic:84f3d52f492648d5b594e4f45dca7727 Semantic Pages}
	 *
	 * @extends sap.ui.core.Control
	 * @abstract
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.30.0
	 * @alias sap.m.semantic.SemanticPage
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var SemanticPage = Control.extend("sap.m.semantic.SemanticPage", /** @lends sap.m.semantic.SemanticPage.prototype */ {
		metadata: {

			library: "sap.m",

			properties: {

				/**
				 * See {@link sap.m.Page#title}
				 */
				title: {
					type: "string",
					group: "Misc",
					defaultValue: null
				},

				/**
				 * See {@link sap.m.Page#titleLevel}
				 */
				titleLevel: {
					type: "sap.ui.core.TitleLevel",
					group: "Appearance",
					defaultValue: TitleLevel.Auto
				},

				/**
				 * See {@link sap.m.Page#showNavButton}
				 */
				showNavButton: {
					type: "boolean",
					group: "Appearance",
					defaultValue: false
				},

				/**
				 * See {@link sap.m.Page#showSubHeader}
				 */
				showSubHeader: {
					type: "boolean",
					group: "Appearance",
					defaultValue: true
				},

				/**
				 * See {@link sap.m.Page#enableScrolling}
				 */
				enableScrolling: {
					type: "boolean",
					group: "Behavior",
					defaultValue: true
				},

				/**
				 * Hides or shows the page footer
				 */
				showFooter: {
					type: "boolean",
					group: "Appearance",
					defaultValue: true
				},

				/**
				 * Determines whether the floating footer behavior is enabled.
				 * If set to <code>true</code>, the content is visible when it's underneath the footer.
				 * @since 1.40.1
				 */
				floatingFooter: {
					type: "boolean",
					group:"Appearance",
					defaultValue: false
				},

				/**
				 * Declares the type of semantic ruleset that will govern the styling and positioning of semantic content.
				 * @since 1.44
				 */
				semanticRuleSet: {
					type: "sap.m.semantic.SemanticRuleSetType",
					group: "Misc",
					defaultValue: SemanticRuleSetType.Classic
				},

				/**
				 * Determines the backgound color of the page. For more
				 * information, see {@link sap.m.Page#backgroundDesign}.
				 * @since 1.52
				 */
				backgroundDesign: {
					type: "sap.m.PageBackgroundDesign",
					group: "Appearance",
					defaultValue: PageBackgroundDesign.Standard
				}
			},
			defaultAggregation: "content",
			aggregations: {
				/**
				 * See {@link sap.m.Page#subHeader}
				 */
				subHeader: {
					type: "sap.m.IBar",
					multiple: false
				},

				/**
				 * See {@link sap.m.Page#content}
				 */
				content: {
					type: "sap.ui.core.Control",
					multiple: true,
					singularName: "content",
					forwarding: {
						getter: "_getPage",
						aggregation: "content"
					}
				},

				/**
				 * Custom header buttons
				 */
				customHeaderContent: {
					type: "sap.m.Button",
					multiple: true,
					singularName: "customHeaderContent"
				},

				/**
				 * Custom footer buttons
				 */
				customFooterContent: {
					type: "sap.m.Button",
					multiple: true,
					singularName: "customFooterContent"
				},

				/**
				 * Accessible landmark settings to be applied to the containers of the <code>sap.m.Page</code> control.
				 *
				 * If not set, no landmarks will be written.
				 */
				landmarkInfo : {type : "sap.m.PageAccessibleLandmarkInfo", multiple : false, forwarding: {getter: "_getPage", aggregation: "landmarkInfo"}},

				/**
				 * Wrapped instance of {@link sap.m.Page}
				 */
				_page: {
					type: "sap.m.Page",
					multiple: false,
					visibility: "hidden"
				}

			},
			events: {

				/**
				 * See {@link sap.m.Page#navButtonPress}
				 */
				navButtonPress: {}
			},
			designtime: "sap/m/designtime/semantic/SemanticPage.designtime"
		}
	});

	SemanticPage.prototype.init = function () {
		this._oHeaderObserver = new ManagedObjectObserver(SemanticPage.prototype._updateHeaderVisibility.bind(this));

		this._currentMode = SemanticConfiguration._PageMode.display;
		this._getPage().setCustomHeader(this._getInternalHeader());
		this._getPage().setFooter(new OverflowToolbar(this.getId() + "-footer"));
		this.setLandmarkInfo(new PageAccessibleLandmarkInfo());
		this._getPage().setShowHeader(false);
	};


	/**
	 * Function is called when exiting the control.
	 *
	 * @private
	 */
	SemanticPage.prototype.exit = function () {

		if (this._oInternalHeader) {
			this._oInternalHeader.destroy();
			this._oInternalHeader = null;
		}

		if (this._oWrappedFooter) {
			this._oWrappedFooter.destroy();
			this._oWrappedFooter = null;
		}

		if (this._oTitle) {
			this._oTitle.destroy();
			this._oTitle = null;
		}

		if (this._oNavButton) {
			this._oNavButton.destroy();
			this._oNavButton = null;
		}

		if ( this._oHeaderObserver ) {
			this._oHeaderObserver.disconnect();
			this._oHeaderObserver = null;
		}

		this._oPositionsMap = null;
	};

	SemanticPage.prototype.setSubHeader = function (oSubHeader, bSuppressInvalidate) {
		this._getPage().setSubHeader(oSubHeader, bSuppressInvalidate);
		return this;
	};

	SemanticPage.prototype.getSubHeader = function () {
		return this._getPage().getSubHeader();
	};

	SemanticPage.prototype.destroySubHeader = function (bSuppressInvalidate) {
		this._getPage().destroySubHeader(bSuppressInvalidate);
		return this;
	};

	SemanticPage.prototype.getShowSubHeader = function () {
		return this._getPage().getShowSubHeader();
	};

	SemanticPage.prototype.setShowSubHeader = function (bShowSubHeader, bSuppressInvalidate) {
		this._getPage().setShowSubHeader(bShowSubHeader, bSuppressInvalidate);
		this.setProperty("showSubHeader", bShowSubHeader, true);
		return this;
	};

	SemanticPage.prototype.getShowFooter = function () {
		return this._getPage().getShowFooter();
	};

	SemanticPage.prototype.setShowFooter = function (bShowFooter, bSuppressInvalidate) {
		this._getPage().setShowFooter(bShowFooter, bSuppressInvalidate);
		this.setProperty("showFooter", bShowFooter, true);
		return this;
	};

	SemanticPage.prototype.setFloatingFooter = function (bFloatingFooter, bSuppressInvalidate) {
		this._getPage().setFloatingFooter(bFloatingFooter, bSuppressInvalidate);
		this.setProperty("floatingFooter", bFloatingFooter, true);
		return this;
	};

	SemanticPage.prototype.setTitle = function (sTitle) {
		var oTitle = this._getTitle();

		if (oTitle) {
			oTitle.setText(sTitle);
			if (!oTitle.getParent()) {
				this._getInternalHeader().addContentMiddle(oTitle);
			}
		}

		this.setProperty("title", sTitle, true);
		return this;
	};

	SemanticPage.prototype.setTitleLevel = function (sTitleLevel) {
		this.setProperty("titleLevel", sTitleLevel, true);
		this._getTitle().setLevel(sTitleLevel);
		return this;
	};

	SemanticPage.prototype.setShowNavButton = function (bShow) {
		var oButton = this._getNavButton();
		if (oButton) {
			oButton.setVisible(bShow);

			if (!oButton.getParent()) {
				this._getInternalHeader().addContentLeft(oButton);
			}
		}

		this.setProperty("showNavButton", bShow, true);
		return this;
	};

	SemanticPage.prototype.setEnableScrolling = function (bEnable) {
		this._getPage().setEnableScrolling(bEnable);
		this.setProperty("enableScrolling", bEnable, true);
		return this;
	};

	SemanticPage.prototype.setBackgroundDesign = function (sBgDesign) {
		this.setProperty("backgroundDesign", sBgDesign, true);
		this._getPage().setBackgroundDesign(sBgDesign);
		return this;
	};

	/*

	 FOOTER RIGHT (CUSTOM CONTENT)
	 */

	SemanticPage.prototype.getCustomFooterContent = function () {
		return this._getSegmentedFooter().getSection("customRight").getContent();
	};

	SemanticPage.prototype.addCustomFooterContent = function (oControl, bSuppressInvalidate) {
		this._getSegmentedFooter().getSection("customRight").addContent(oControl, bSuppressInvalidate);
		return this;
	};

	SemanticPage.prototype.indexOfCustomFooterContent = function (oControl) {
		return this._getSegmentedFooter().getSection("customRight").indexOfContent(oControl);
	};

	SemanticPage.prototype.insertCustomFooterContent = function (oControl, iIndex, bSuppressInvalidate) {
		this._getSegmentedFooter().getSection("customRight").insertContent(oControl, iIndex, bSuppressInvalidate);
		return this;
	};

	SemanticPage.prototype.removeCustomFooterContent = function (oControl, bSuppressInvalidate) {
		return this._getSegmentedFooter().getSection("customRight").removeContent(oControl, bSuppressInvalidate);
	};

	SemanticPage.prototype.removeAllCustomFooterContent = function (bSuppressInvalidate) {
		return this._getSegmentedFooter().getSection("customRight").removeAllContent(bSuppressInvalidate);
	};

	SemanticPage.prototype.destroyCustomFooterContent = function (bSuppressInvalidate) {

		var aChildren = this.getCustomFooterContent();

		if (!aChildren) {
			return this;
		}

		// set suppress invalidate flag
		if (bSuppressInvalidate) {
			this.iSuppressInvalidate++;
		}

		this._getSegmentedFooter().getSection("customRight").destroy(bSuppressInvalidate);

		if (!this.isInvalidateSuppressed()) {
			this.invalidate();
		}

		// reset suppress invalidate flag
		if (bSuppressInvalidate) {
			this.iSuppressInvalidate--;
		}

		return this;
	};

	/*

	 HEADER RIGHT (CUSTOM CONTENT)
	 */

	SemanticPage.prototype.getCustomHeaderContent = function () {
		return this._getSegmentedHeader().getSection("customRight").getContent();
	};

	SemanticPage.prototype.addCustomHeaderContent = function (oControl, bSuppressInvalidate) {
		this._getSegmentedHeader().getSection("customRight").addContent(oControl, bSuppressInvalidate);
		return this;
	};

	SemanticPage.prototype.indexOfCustomHeaderContent = function (oControl) {
		return this._getSegmentedHeader().getSection("customRight").indexOfContent(oControl);
	};

	SemanticPage.prototype.insertCustomHeaderContent = function (oControl, iIndex, bSuppressInvalidate) {
		this._getSegmentedHeader().getSection("customRight").insertContent(oControl, iIndex, bSuppressInvalidate);
		return this;
	};

	SemanticPage.prototype.removeCustomHeaderContent = function (oControl, bSuppressInvalidate) {
		return this._getSegmentedHeader().getSection("customRight").removeContent(oControl, bSuppressInvalidate);
	};

	SemanticPage.prototype.removeAllCustomHeaderContent = function (bSuppressInvalidate) {
		return this._getSegmentedHeader().getSection("customRight").removeAllContent(bSuppressInvalidate);
	};

	SemanticPage.prototype.destroyCustomHeaderContent = function (bSuppressInvalidate) {

		var aChildren = this.getCustomHeaderContent();

		if (!aChildren) {
			return this;
		}

		// set suppress invalidate flag
		if (bSuppressInvalidate) {
			this.iSuppressInvalidate++;
		}

		this._getSegmentedHeader().getSection("customRight").destroy(bSuppressInvalidate);

		if (!this.isInvalidateSuppressed()) {
			this.invalidate();
		}

		// reset suppress invalidate flag
		if (bSuppressInvalidate) {
			this.iSuppressInvalidate--;
		}

		return this;
	};

	SemanticPage.prototype.setAggregation = function(sAggregationName, oObject, bSuppressInvalidate) {

		var oOldChild = this.mAggregations[sAggregationName];
		if (oOldChild === oObject) {
			return this;
		} // no change
		oObject = this.validateAggregation(sAggregationName, oObject, /* multiple */ false);

		var sType = this.getMetadata().getManagedAggregation(sAggregationName).type;

		if (SemanticConfiguration.isKnownSemanticType(sType)) {

			if (oOldChild) {
				this._stopMonitor(oOldChild);
				this._removeFromInnerAggregation(oOldChild._getControl(), SemanticConfiguration.getPositionInPage(sType), bSuppressInvalidate);
			}

			if (oObject) {
				this._initMonitor(oObject);
				this._addToInnerAggregation(oObject._getControl(),
						SemanticConfiguration.getPositionInPage(sType),
						SemanticConfiguration.getSequenceOrderIndex(sType),
						bSuppressInvalidate);
			}
			return ManagedObject.prototype.setAggregation.call(this, sAggregationName, oObject, true);// no need to invalidate entire page since the change only affects custom footer/header of page
		}

		return ManagedObject.prototype.setAggregation.call(this, sAggregationName, oObject, bSuppressInvalidate);
	};

	SemanticPage.prototype.destroyAggregation = function(sAggregationName, bSuppressInvalidate) {

		var oAggregationInfo = this.getMetadata().getAggregations()[sAggregationName];
		if (oAggregationInfo && SemanticConfiguration.isKnownSemanticType(oAggregationInfo.type)) {

			var oObject = ManagedObject.prototype.getAggregation.call(this, sAggregationName);
			if (oObject) {
				this._stopMonitor(oObject);
				if (!oObject._getControl().bIsDestroyed) {
					this._removeFromInnerAggregation(oObject._getControl(), SemanticConfiguration.getPositionInPage(oAggregationInfo.type), bSuppressInvalidate);
				}
			}
		}

		return ManagedObject.prototype.destroyAggregation.call(this, sAggregationName, oObject, bSuppressInvalidate);
	};

	SemanticPage.prototype._updateHeaderVisibility = function () {
		var oHeader = this._getInternalHeader();
		var bEmpty = (oHeader.getContentLeft().length === 0)
			&& (oHeader.getContentMiddle().length === 0)
			&& (oHeader.getContentRight().length === 0);
		this._getPage().setShowHeader(!bEmpty);
	};

	SemanticPage.prototype._getTitle = function () {
		if (!this._oTitle) {
			this._oTitle = new Title(this.getId() + "-title", {text: this.getTitle()});
		}
		return this._oTitle;
	};

	SemanticPage.prototype._getNavButton = function () {
		if (!this._oNavButton) {
			this._oNavButton = new Button(this.getId() + "-navButton", {
				type: ButtonType.Up,
				tooltip: sap.ui.getCore().getLibraryResourceBundle("sap.m").getText("PAGE_NAVBUTTON_TEXT"),
				press: jQuery.proxy(this.fireNavButtonPress, this)
			});
		}
		return this._oNavButton;
	};

	SemanticPage.prototype._initMonitor = function (oSemanticControl) {

		var oConfig = oSemanticControl._getConfiguration();

		if (oConfig.triggers) { // control is defined to trigger a PageMode upon press
			oSemanticControl.attachEvent("press", this._updateCurrentMode, this);
		}

		var oStates = oConfig.states,
				that = this;
		if (oStates) {
			jQuery.each(SemanticConfiguration._PageMode, function (key, value) {
				if (oStates[key]) {
					that.attachEvent(key, oSemanticControl._onPageStateChanged, oSemanticControl);
				}
			});
		}
	};

	SemanticPage.prototype._stopMonitor = function (oSemanticControl) {

		oSemanticControl.detachEvent("press", this._updateCurrentMode, this);

		var oConfig = oSemanticControl._getConfiguration();
		var oStates = oConfig.states,
				that = this;
		if (oStates) {
			jQuery.each(SemanticConfiguration._PageMode, function (key, value) {
				if (oStates[key]) {
					that.detachEvent(key, oSemanticControl._onPageStateChanged, oSemanticControl);
				}
			});
		}
	};

	SemanticPage.prototype._updateCurrentMode = function (oEvent) {

		var oConfig = oEvent.oSource._getConfiguration();
		// update global state
		if (typeof oConfig.triggers === 'string') {
			this._currentMode = oConfig.triggers;
		} else {
			var iLength = oConfig.triggers.length; // control triggers more than one global state,
			// depending on current state (e.g. if toggle button)
			if (iLength && iLength > 0) {
				for (var iIndex = 0; iIndex < iLength; iIndex++) {

					var oTriggerConfig = oConfig.triggers[iIndex];
					if (oTriggerConfig && (oTriggerConfig.inState === this._currentMode)) {
						this._currentMode = oTriggerConfig.triggers;
						break;
					}
				}
			}
		}

		this.fireEvent(this._currentMode);
	};

	SemanticPage.prototype._removeFromInnerAggregation = function (oControl, sPosition, bSuppressInvalidate) {

		var oPositionInPage = this._getSemanticPositionsMap()[sPosition];
		if (oPositionInPage && oPositionInPage.oContainer && oPositionInPage.sAggregation) {
			oPositionInPage.oContainer["remove" + fnCapitalize(oPositionInPage.sAggregation)](oControl, bSuppressInvalidate);
		}
	};

	SemanticPage.prototype._addToInnerAggregation = function (oControl, sPosition, iOrder, bSuppressInvalidate) {

		if (!oControl || !sPosition) {
			return;
		}

		var oPositionInPage = this._getSemanticPositionsMap()[sPosition];

		if (!oPositionInPage || !oPositionInPage.oContainer || !oPositionInPage.sAggregation) {
			return;
		}

		if (typeof iOrder !== 'undefined') {
			oControl.addCustomData(new CustomData({key: "sortIndex", value: iOrder}));
		}

		return oPositionInPage.oContainer["add" + fnCapitalize(oPositionInPage.sAggregation)](oControl, bSuppressInvalidate);
	};

	SemanticPage.prototype._getSemanticPositionsMap = function (oControl, oConfig) {

		if (!this._oPositionsMap) {

			this._oPositionsMap = {};

			this._oPositionsMap[SemanticConfiguration.prototype._PositionInPage.headerLeft] = {
				oContainer: this._getInternalHeader(),
				sAggregation: "contentLeft"
			};

			this._oPositionsMap[SemanticConfiguration.prototype._PositionInPage.headerRight] = {
				oContainer: this._getSegmentedHeader().getSection("semanticRight"),
				sAggregation: "content"
			};

			this._oPositionsMap[SemanticConfiguration.prototype._PositionInPage.headerMiddle] = {
				oContainer: this._getInternalHeader(),
				sAggregation: "contentMiddle"
			};

			this._oPositionsMap[SemanticConfiguration.prototype._PositionInPage.footerLeft] = {
				oContainer: this._getSegmentedFooter().getSection("semanticLeft"),
				sAggregation: "content"
			};

			this._oPositionsMap[SemanticConfiguration.prototype._PositionInPage.footerRight_IconOnly] = {
				oContainer: this._getSegmentedFooter().getSection("semanticRight_IconOnly"),
				sAggregation: "content"
			};

			this._oPositionsMap[SemanticConfiguration.prototype._PositionInPage.footerRight_TextOnly] = {
				oContainer: this._getSegmentedFooter().getSection("semanticRight_TextOnly"),
				sAggregation: "content"
			};
		}

		return this._oPositionsMap;
	};


	/**
	 * Create internal page
	 * @returns {sap.m.Page}
	 * @private
	 */
	SemanticPage.prototype._getPage = function () {

		var oPage = this.getAggregation("_page");
		if (!oPage) {
			this.setAggregation("_page", new Page(this.getId() + "-page"));
			oPage = this.getAggregation("_page");
		}

		return oPage;
	};

	/**
	 * Create internal header
	 * @returns {sap.m.IBar}
	 * @private
	 */
	SemanticPage.prototype._getInternalHeader = function () {

		if (!this._oInternalHeader) {
			this._oInternalHeader = new Bar(this.getId() + "-intHeader");

			if (this._oHeaderObserver) {
				this._oHeaderObserver.observe(this._oInternalHeader, {
					aggregations: [
						"contentLeft", "contentMiddle", "contentRight"
					]
				});
			}
		}

		return this._oInternalHeader;
	};

	/**
	 * Returns the custom or internal header
	 * @private
	 * @returns {sap.m.IBar}
	 */
	SemanticPage.prototype._getAnyHeader = function () {
		return this._getInternalHeader();
	};


	/**
	 * Returns the internal footer
	 * @private
	 * @returns {sap.m.semantic.SegmentedContainer}
	 */
	SemanticPage.prototype._getSegmentedHeader = function() {

		if (!this._oWrappedHeader) {

			var oHeader = this._getInternalHeader();
			if (!oHeader) {
				jQuery.sap.log.error("missing page header", this);
				return null;
			}

			this._oWrappedHeader = new SegmentedContainer(oHeader, "contentRight");

			this._oWrappedHeader.addSection({sTag: "customRight"});
			this._oWrappedHeader.addSection({sTag: "semanticRight"});

		}

		return this._oWrappedHeader;

	};

	/**
	 * Returns the internal footer
	 * @private
	 * @returns {sap.m.semantic.SegmentedContainer}
	 */
	SemanticPage.prototype._getSegmentedFooter = function() {

		if (!this._oWrappedFooter) {

			var oFooter = this._getPage().getFooter();
			if (!oFooter) {
				jQuery.sap.log.error("missing page footer", this);
				return null;
			}

			this._oWrappedFooter = new SegmentedContainer(oFooter);

			//add section for SEMANTIC content that should go on the left
			this._oWrappedFooter.addSection({sTag: "semanticLeft"});

			//add spacer to separate left from right
			this._oWrappedFooter.addSection({
				sTag: "spacer",
				aContent: [new ToolbarSpacer()]
			});

			//add section for SEMANTIC content that should go on the right;
			// REQUIREMENT: only TEXT-BUTTONS allowed in this section
			this._oWrappedFooter.addSection({
				sTag: "semanticRight_TextOnly",
				fnSortFunction: fnSortSemanticContent
			});

			//add section for CUSTOM content that should go on the right;
			this._oWrappedFooter.addSection({sTag: "customRight"});

			//add section for SEMANTIC content that should go on the right;
			// REQUIREMENT: only ICON-BUTTONS/ICON-SELECT allowed in this section
			this._oWrappedFooter.addSection({
				sTag: "semanticRight_IconOnly",
				fnSortFunction: fnSortSemanticContent
			});
		}

		return this._oWrappedFooter;

	};

	/*
	 helper functions
	 */
	function fnCapitalize(sName) {
		return sName.substring(0, 1).toUpperCase() + sName.substring(1);
	}

	function fnSortSemanticContent(oControl1, oControl2) {

		var iSortIndex1 = oControl1.data("sortIndex");
		var iSortIndex2 = oControl2.data("sortIndex");

		if ((typeof iSortIndex1 === 'undefined') ||
				(typeof iSortIndex2 === 'undefined')) {
			jQuery.sap.log.warning("sortIndex missing", this);
			return null;
		}

		return (iSortIndex1 - iSortIndex2);
	}

	return SemanticPage;
});
