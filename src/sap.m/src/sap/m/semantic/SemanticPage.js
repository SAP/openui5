/*!
 * ${copyright}
 */

sap.ui.define(['jquery.sap.global', 'sap/m/semantic/SemanticPageSegmentedContainer', 'sap/m/Button', 'sap/m/Title', 'sap/m/ActionSheet', 'sap/m/Page', 'sap/m/OverflowToolbar', 'sap/m/OverflowToolbarButton', 'sap/m/OverflowToolbarLayoutData', 'sap/m/ToolbarSpacer', 'sap/m/Bar', 'sap/ui/core/CustomData'],
function (jQuery, SegmentedContainer, Button, Title, ActionSheet, Page, OverflowToolbar, OverflowToolbarButton, OverflowToolbarLayoutData, ToolbarSpacer, Bar, CustomData) {
	"use strict";

	/**
	 * Constructor for a new SemanticPage
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * A semantic page is an enhanced {@link sap.m.Page}, that can contain controls with semantic meaning @see sap.m.semantic.SemanticControl.<br>
	 *
	 * Content specified to the {@link sap.m.semantic.SemanticPage#semanticControls} aggregation will be automatically positioned in dedicated sections of the footer or the header of the page, depending on the control's {@link sap.m.semantic.SemanticType}.<br>
	 * For example, a semantic button of type {@link sap.m.SemanticType.Approve} will be positioned in the right side of the footer, and in logically correct sequence order with respect to any other included semantic controls.<br>
	 *
	 * In addition to the predefined semantic controls, the SemanticPage can host also custom controls. It preserves most of the API of {@link sap.m.Page} for specifying page content.<br>
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
	var SemanticPage = sap.ui.core.Control.extend("sap.m.semantic.SemanticPage", /** @lends sap.m.semantic.SemanticPage.prototype */ {
		metadata: {

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
					defaultValue: sap.ui.core.TitleLevel.Auto
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
				 * Semantic controls
				 */
				semanticControls: {
					type: "sap.m.semantic.SemanticControl",
					multiple: true,
					singularName: "semanticControl"
				},

				/**
				 * See {@link sap.m.Page#content}
				 */
				content: {
					type: "sap.ui.core.Control",
					multiple: true,
					singularName: "content"
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
			}
		}
	});

	/*
	 static members
	 */
	SemanticPage.prototype._PositionInPage = {

		headerLeft: "headerLeft",
		headerRight: "headerRight",
		headerMiddle: "headerMiddle",
		footerLeft: "footerLeft",
		footerRight_IconOnly: "footerRight_IconOnly",
		footerRight_TextOnly: "footerRight_TextOnly"
	};

	SemanticPage._PageMode = {

		display: "display",
		edit: "edit",
		multimode: "multimode"
	};

	SemanticPage.prototype.init = function () {

		this._currentMode = SemanticPage._PageMode.display;
		this._getPage().setCustomHeader(this._getInternalHeader());
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
		return this;
	};

	/*

	 INNER CONTENT
	 */

	SemanticPage.prototype.getContent = function () {
		return this._getPage().getContent();
	};

	SemanticPage.prototype.addContent = function (oControl, bSuppressInvalidate) {
		this._getPage().addContent(oControl, bSuppressInvalidate);
		return this;
	};

	SemanticPage.prototype.indexOfContent = function (oControl) {
		return this._getPage().indexOfContent(oControl);
	};

	SemanticPage.prototype.insertContent = function (oControl, iIndex, bSuppressInvalidate) {
		this._getPage().insertContent(oControl, iIndex, bSuppressInvalidate);
		return this;
	};

	SemanticPage.prototype.removeContent = function (oControl, bSuppressInvalidate) {
		return this._getPage().removeContent(oControl, bSuppressInvalidate);
	};

	SemanticPage.prototype.removeAllContent = function (bSuppressInvalidate) {
		return this._getPage().removeAllContent(bSuppressInvalidate);
	};

	SemanticPage.prototype.destroyContent = function (bSuppressInvalidate) {
		this._getPage().destroyContent(bSuppressInvalidate);
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

	 SEMANTIC CONTENT
	 */

	SemanticPage.prototype.addSemanticControl = function (oSemanticControl, bSuppressInvalidate) {
		if (!oSemanticControl.getType) {
			jQuery.sap.log.warning("skipping invalid entry", this);
			return this;
		}

		var oSemanticType = oSemanticControl.getType();

		if (!oSemanticType && oSemanticControl.getBindingInfo("type")) {
			oSemanticControl.attachEvent("_change:type", this._updateContentPosition, this);
			this.addAggregation("semanticControls", oSemanticControl, bSuppressInvalidate);
			return this;
		}

		var bKnownType = (jQuery.inArray(oSemanticType, this.aAllowedTypes) > -1);

		if (!bKnownType) {
			jQuery.sap.log.error("skipping unknown semantic type " + oSemanticType, this);
			return this;
		}

		if (this._findBySemanticType(this.getAggregation("semanticControls"), oSemanticType)) { //already there
			jQuery.sap.log.warning("skipping already added entry", this);
			return this;
		}

		this._initMonitor(oSemanticControl);
		this._addToInnerAggregation(oSemanticControl._getControl(), oSemanticControl._getConfiguration(), bSuppressInvalidate);
		this.addAggregation("semanticControls", oSemanticControl, bSuppressInvalidate);

		return this;
	};

	SemanticPage.prototype.insertSemanticControl = function (oSemanticControl, iIndex, bSuppressInvalidate) {
		if (!oSemanticControl.getType) {
			jQuery.sap.log.warning("skipping invalid entry", this);
			return this;
		}

		var oSemanticType = oSemanticControl.getType();

		if (!oSemanticType && oSemanticControl.getBindingInfo("type")) {
			oSemanticControl.attachEvent("_change:type", this._updateContentPosition, this);
			this.addAggregation("semanticControls", oSemanticControl, bSuppressInvalidate);
			return this;
		}

		var bKnownType = (jQuery.inArray(oSemanticType, this.aAllowedTypes) > -1);

		if (!bKnownType) {
			jQuery.sap.log.error("skipping unknown semantic type " + oSemanticType, this);
			return this;
		}

		var oConfig = oSemanticControl._getConfiguration();

		if (this._findBySemanticType(this.getSemanticControls(), oSemanticType)) {//already there
			jQuery.sap.log.warning("skipping already added entry", this);
			return this;
		}

		this._initMonitor(oSemanticControl);

		this._addToInnerAggregation(oSemanticControl._getControl(), oConfig, bSuppressInvalidate);
		this.insertAggregation("semanticControls", oSemanticControl, iIndex, bSuppressInvalidate);

		return this;
	};

	SemanticPage.prototype.removeSemanticControl = function (oSemanticControl, bSuppressInvalidate) {

		if (!oSemanticControl.getType) {
			jQuery.sap.log.warning("skipping invalid entry", this);
			return this;
		}

		var oSemanticType = oSemanticControl.getType();

		if (!oSemanticType) {
			oSemanticControl.detachEvent("_change:type", this._updateContentPosition, this);
			return this.removeAggregation("semanticControls", oSemanticControl, bSuppressInvalidate);
		}

		var bKnownType = (jQuery.inArray(oSemanticType, this.aAllowedTypes) > -1);

		if (!bKnownType) {
			jQuery.sap.log.error("skipping unknown semantic type " + oSemanticType, this);
			return this;
		}

		this._stopMonitor(oSemanticControl);

		//remove from respective innerAggregation
		var oPositionInPage = this._getSemanticPositionsMap()[oSemanticControl._getConfiguration().position];
		if (oPositionInPage && oPositionInPage.oContainer && oPositionInPage.sAggregation) {
			oPositionInPage.oContainer["remove" + fnCapitalize(oPositionInPage.sAggregation)](oSemanticControl._getControl(), bSuppressInvalidate);
		}
		return this.removeAggregation("semanticControls", oSemanticControl, bSuppressInvalidate);
	};

	SemanticPage.prototype.removeAllSemanticControls = function (bSuppressInvalidate) {

		//remove from innerAggregations
		this._PositionInPage.forEach(function (key, position) {
			var oPositionInPage = this._getSemanticPositionsMap()[position];
			if (oPositionInPage && oPositionInPage.oContainer) {
				oPositionInPage.oContainer["removeAll" + fnCapitalize(oPositionInPage.sAggregation)](bSuppressInvalidate);
			}
		}, this);

		var aRemoved = this.removeAllAggregation("semanticControls", bSuppressInvalidate);

		aRemoved.forEach(function (iIndex, oSemanticControl) {
			this._stopMonitor(oSemanticControl);
		}, this);

		return aRemoved;
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
				type: sap.m.ButtonType.Up,
				press: jQuery.proxy(this.fireNavButtonPress, this)
			});
		}
		return this._oNavButton;
	};

	SemanticPage.prototype._findBySemanticType = function (aContent, sType) {

		if (aContent && sType) {
			for (var i = 0; i < aContent.length; i++) {
				var oContent = aContent[i];
				if (oContent && (oContent.getType() === sType)) {
					return oContent;
				}
			}
		}
	};

	SemanticPage.prototype._initMonitor = function (oSemanticControl) {

		var oConfig = oSemanticControl._getConfiguration();

		if (oConfig.triggers) { // control is defined to trigger a PageMode upon press
			oSemanticControl.attachEvent("press", this._updateCurrentMode, this);
		}
		oSemanticControl.attachEvent("_change:type", this._updateContentPosition, this);

		var oStates = oConfig.states,
				that = this;
		if (oStates) {
			jQuery.each(SemanticPage._PageMode, function (key, value) {
				if (oStates[key]) {
					that.attachEvent(key, oSemanticControl._onPageStateChanged, oSemanticControl);
				}
			});
		}
	};

	SemanticPage.prototype._stopMonitor = function (oSemanticControl) {

		oSemanticControl.detachEvent("press", this._updateCurrentMode, this);
		oSemanticControl.detachEvent("_change:type", this._updateContentPosition, this);

		var oConfig = oSemanticControl._getConfiguration();
		var oStates = oConfig.states,
				that = this;
		if (oStates) {
			jQuery.each(SemanticPage._PageMode, function (key, value) {
				if (oStates[key]) {
					that.detachEvent(key, oSemanticControl._onPageStateChanged, oSemanticControl);
				}
			});
		}
	};

	SemanticPage.prototype._updateContentPosition = function (oEvent) {
		var oSemanticControl = oEvent.oSource;
		this.removeSemanticControl(oSemanticControl);
		this.addSemanticControl(oSemanticControl);
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

	SemanticPage.prototype._addToInnerAggregation = function (oControl, oConfig, bSuppressInvalidate) {

		if (!oControl || !oConfig || !oConfig.position) {
			return;
		}

		var oPositionInPage = this._getSemanticPositionsMap()[oConfig.position];

		if (!oPositionInPage || !oPositionInPage.oContainer || !oPositionInPage.sAggregation) {
			return;
		}

		if (typeof oConfig.order !== 'undefined') {
			oControl.addCustomData(new CustomData({key: "sortIndex", value: oConfig.order}));
		}

		return oPositionInPage.oContainer["add" + fnCapitalize(oPositionInPage.sAggregation)](oControl, bSuppressInvalidate);
	};

	SemanticPage.prototype._getSemanticPositionsMap = function (oControl, oConfig) {

		if (!this._oPositionsMap) {

			this._oPositionsMap = {};

			this._oPositionsMap[SemanticPage.prototype._PositionInPage.headerLeft] = {
				oContainer: this._getInternalHeader(),
				sAggregation: "contentLeft"
			};

			this._oPositionsMap[SemanticPage.prototype._PositionInPage.headerRight] = {
				oContainer: this._getInternalHeader(),
				sAggregation: "contentRight"
			};

			this._oPositionsMap[SemanticPage.prototype._PositionInPage.headerMiddle] = {
				oContainer: this._getInternalHeader(),
				sAggregation: "contentMiddle"
			};

			this._oPositionsMap[SemanticPage.prototype._PositionInPage.footerLeft] = {
				oContainer: this._getSegmentedFooter().getSection("semanticLeft"),
				sAggregation: "content"
			};

			this._oPositionsMap[SemanticPage.prototype._PositionInPage.footerRight_IconOnly] = {
				oContainer: this._getSegmentedFooter().getSection("semanticRight_IconOnly"),
				sAggregation: "content"
			};

			this._oPositionsMap[SemanticPage.prototype._PositionInPage.footerRight_TextOnly] = {
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
	 * @returns {sap.m.semantic.SemanticPageSegmentedContainer}
	 */
	SemanticPage.prototype._getSegmentedFooter = function() {

		if (!this._oWrappedFooter) {

			var oFooter = new OverflowToolbar();
			this._getPage().setFooter(oFooter);

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
}, /* bExport= */ false);
