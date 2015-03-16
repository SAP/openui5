/*!
 * ${copyright}
 */

sap.ui.define(['jquery.sap.global', 'sap/m/semantic/SemanticPageSegmentedContainer', 'sap/m/Button', 'sap/m/Title', 'sap/m/ActionSheet', 'sap/m/Page', 'sap/m/OverflowToolbar', 'sap/m/OverflowToolbarButton', 'sap/m/OverflowToolbarLayoutData', 'sap/m/ToolbarSpacer', 'sap/m/Bar'],
function (jQuery, SegmentedContainer, Button, Title, ActionSheet, Page, OverflowToolbar, OverflowToolbarButton, OverflowToolbarLayoutData, ToolbarSpacer, Bar) {
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
	SemanticPage._PositionInPage = {

		headerLeft: "headerLeft",
		headerRight: "headerRight",
		headerMiddle: "headerMiddle",
		footerLeft: "footerLeft",
		footerRight: "footerRight"
	};

	SemanticPage._PageMode = {

		display: "display",
		edit: "edit",
		multimode: "multimode"
	};

	SemanticPage.prototype.init = function () {

		this._getPage().setCustomHeader(this._getInternalHeader());

		if (!this._oFooter) {
			this._oFooter = new OverflowToolbar();
		}
		this._getPage().setFooter(this._oFooter);

		/*
		 wrapped footer
		 */
		if (!this._oWrappedFooter) {
			this._oWrappedFooter = new SegmentedContainer(this._oFooter);

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
				sTag: "semanticRight",
				fIsValidEntry: fnIsTextButton
			});

			//add section for CUSTOM content that should go on the right;
			this._oWrappedFooter.addSection({sTag: "customRight"});

			//add section for SEMANTIC content that should go on the right;
			// REQUIREMENT: only ICON-BUTTONS/ICON-SELECT allowed in this section
			this._oWrappedFooter.addSection({
				sTag: "semanticRight",
				fIsValidEntry: fnIsIconControl
			});

		}

		if (!this._oPositionsMap) {
			this._oPositionsMap = this._initSemanticPositionsMap();
		}
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

		if (this._oFooter) {
			this._oFooter.destroy();
			this._oFooter = null;
			this._oWrappedFooter = null;
		}

		this._oPositionsMap = null;
	};

	SemanticPage.prototype.setSubHeader = function (oSubHeader, bSupressInvalidate) {
		this._getPage().setSubHeader(oSubHeader, bSupressInvalidate);
		return this;
	};

	SemanticPage.prototype.getSubHeader = function () {
		return this._getPage().getSubHeader();
	};

	SemanticPage.prototype.destroySubHeader = function (bSupressInvalidate) {
		this._getPage().destroySubHeader(bSupressInvalidate);
		return this;
	};

	SemanticPage.prototype.getShowSubHeader = function () {
		return this._getPage().getShowSubHeader();
	};

	SemanticPage.prototype.setShowSubHeader = function (bShowSubHeader, bSupressInvalidate) {
		this._getPage().setShowSubHeader(bShowSubHeader, bSupressInvalidate);
		return this;
	};

	/*

	 INNER CONTENT
	 */

	SemanticPage.prototype.getContent = function () {
		return this._getPage().getContent();
	};

	SemanticPage.prototype.addContent = function (oControl, bSupressInvalidate) {
		this._getPage().addContent(oControl, bSupressInvalidate);
		return this;
	};

	SemanticPage.prototype.indexOfContent = function (oControl) {
		return this._getPage().indexOfContent(oControl);
	};

	SemanticPage.prototype.insertContent = function (oControl, iIndex, bSupressInvalidate) {
		this._getPage().insertContent(oControl, iIndex, bSupressInvalidate);
		return this;
	};

	SemanticPage.prototype.removeContent = function (oControl, bSupressInvalidate) {
		return this._getPage().removeContent(oControl, bSupressInvalidate);
	};

	SemanticPage.prototype.removeAllContent = function (bSupressInvalidate) {
		return this._getPage().removeAllContent(bSupressInvalidate);
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
		return this._oWrappedFooter.getSectionComposite("customRight").getContent();
	};

	SemanticPage.prototype.addCustomFooterContent = function (oControl, bSupressInvalidate) {
		this._oWrappedFooter.getSectionComposite("customRight").addContent(oControl, bSupressInvalidate);
		return this;
	};

	SemanticPage.prototype.indexOfCustomFooterContent = function (oControl) {
		return this._oWrappedFooter.getSectionComposite("customRight").indexOfContent(oControl);
	};

	SemanticPage.prototype.insertCustomFooterContent = function (oControl, iIndex, bSupressInvalidate) {
		this._oWrappedFooter.getSectionComposite("customRight").insertContent(oControl, iIndex, bSupressInvalidate);
		return this;
	};

	SemanticPage.prototype.removeCustomFooterContent = function (oControl, bSupressInvalidate) {
		return this._oWrappedFooter.getSectionComposite("customRight").removeContent(oControl, bSupressInvalidate);
	};

	SemanticPage.prototype.removeAllCustomFooterContent = function (bSupressInvalidate) {
		return this._oWrappedFooter.getSectionComposite("customRight").removeAllContent(bSupressInvalidate);
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

		this._oWrappedFooter.getSectionComposite("customRight").destroy(bSuppressInvalidate);

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

	SemanticPage.prototype.addSemanticControl = function (oWrapper, bSupressInvalidate) {
		if (!oWrapper.getType) {
			jQuery.sap.log.warning("skipping invalid entry", this);
			return this;
		}

		var oSemanticType = oWrapper.getType();

		if (!oSemanticType && oWrapper.getBindingInfo("type")) {
			oWrapper.attachEvent("_change:type", this._updateContentPosition, this);
			this.addAggregation("semanticControls", oWrapper, bSupressInvalidate);
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

		this._initMonitor(oWrapper);
		this._addToInnerAggregation(oWrapper._getControl(), oWrapper._getConfiguration(), bSupressInvalidate);
		this.addAggregation("semanticControls", oWrapper, bSupressInvalidate);

		return this;
	};

	SemanticPage.prototype.insertSemanticControl = function (oWrapper, iIndex, bSupressInvalidate) {
		if (!oWrapper.getType) {
			jQuery.sap.log.warning("skipping invalid entry", this);
			return this;
		}

		var oSemanticType = oWrapper.getType();

		if (!oSemanticType && oWrapper.getBindingInfo("type")) {
			oWrapper.attachEvent("_change:type", this._updateContentPosition, this);
			this.addAggregation("semanticControls", oWrapper, bSupressInvalidate);
			return this;
		}

		var bKnownType = (jQuery.inArray(oSemanticType, this.aAllowedTypes) > -1);

		if (!bKnownType) {
			jQuery.sap.log.error("skipping unknown semantic type " + oSemanticType, this);
			return this;
		}

		var oConfig = oWrapper._getConfiguration();

		if (this._findBySemanticType(this.getSemanticControls(), oSemanticType)) {//already there
			jQuery.sap.log.warning("skipping already added entry", this);
			return this;
		}

		this._initMonitor(oWrapper);

		this._addToInnerAggregation(oWrapper._getControl(), oConfig, bSupressInvalidate);
		this.insertAggregation("semanticControls", oWrapper, iIndex, bSupressInvalidate);

		return this;
	};

	SemanticPage.prototype.removeSemanticControl = function (oWrapper, bSupressInvalidate) {

		if (!oWrapper.getType) {
			jQuery.sap.log.warning("skipping invalid entry", this);
			return this;
		}

		var oSemanticType = oWrapper.getType();

		if (!oSemanticType) {
			oWrapper.detachEvent("_change:type", this._updateContentPosition, this);
			return this.removeAggregation("semanticControls", oWrapper, bSupressInvalidate);
		}

		var bKnownType = (jQuery.inArray(oSemanticType, this.aAllowedTypes) > -1);

		if (!bKnownType) {
			jQuery.sap.log.error("skipping unknown semantic type " + oSemanticType, this);
			return this;
		}

		this._stopMonitor(oWrapper);

		//remove from respective innerAggregation
		var oPositionInPage = this._oPositionsMap[oWrapper._getConfiguration().position];
		if (oPositionInPage && oPositionInPage.oContainer && oPositionInPage.sAggregation) {
			oPositionInPage.oContainer["remove" + capitalize(oPositionInPage.sAggregation)](oWrapper._getControl(), bSupressInvalidate);
		}
		return this.removeAggregation("semanticControls", oWrapper, bSupressInvalidate);
	};

	SemanticPage.prototype.removeAllSemanticControls = function (bSupressInvalidate) {

		//remove from innerAggregations
		var that = this;
		jQuery.each(SemanticPage._PositionInPage, function (key, position) {
			var oPositionInPage = that._oPositionsMap[position];
			if (oPositionInPage && oPositionInPage.oContainer) {
				oPositionInPage.oContainer["removeAll" + capitalize(oPositionInPage.sAggregation)](bSupressInvalidate);
			}
		});

		var aRemoved = this.removeAllAggregation("semanticControls", bSupressInvalidate);

		jQuery.each(aRemoved, function (iIndex, oWrapper) {
			that._stopMonitor(oWrapper);
		});

		return aRemoved;
	};

	SemanticPage.prototype._getTitle = function () {
		if (!this._oTitle) {
			this._oTitle = new Title({text: this.getTitle()});
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

	SemanticPage._currentMode = SemanticPage._PageMode.display;

	SemanticPage.prototype._initMonitor = function (oWrapper) {

		var oConfig = oWrapper._getConfiguration();

		if (oConfig.triggers) { // control is defined to trigger a PageMode upon press
			oWrapper.attachEvent("press", this._updateCurrentMode, this);
		}
		oWrapper.attachEvent("_change:type", this._updateContentPosition, this);

		var oStates = oConfig.states,
				that = this;
		if (oStates) {
			jQuery.each(SemanticPage._PageMode, function (key, value) {
				if (oStates[key]) {
					that.attachEvent(key, oWrapper._onPageStateChanged, oWrapper);
				}
			});
		}
	};

	SemanticPage.prototype._stopMonitor = function (oWrapper) {

		oWrapper.detachEvent("press", this._updateCurrentMode, this);
		oWrapper.detachEvent("_change:type", this._updateContentPosition, this);

		var oConfig = oWrapper._getConfiguration();
		var oStates = oConfig.states,
				that = this;
		if (oStates) {
			jQuery.each(SemanticPage._PageMode, function (key, value) {
				if (oStates[key]) {
					that.detachEvent(key, oWrapper._onPageStateChanged, oWrapper);
				}
			});
		}
	};

	SemanticPage.prototype._updateContentPosition = function (oEvent) {
		var oWrapper = oEvent.oSource;
		this.removeSemanticControl(oWrapper);
		this.addSemanticControl(oWrapper);
	};

	SemanticPage.prototype._updateCurrentMode = function (oEvent) {

		var oConfig = oEvent.oSource._getConfiguration();
		// update global state
		if (typeof oConfig.triggers === 'string') {
			SemanticPage._currentMode = oConfig.triggers;
		} else {
			var iLength = oConfig.triggers.length; // control triggers more than one global state,
			// depending on current state (e.g. if toggle button)
			if (iLength && iLength > 0) {
				for (var iIndex = 0; iIndex < iLength; iIndex++) {

					var oTriggerConfig = oConfig.triggers[iIndex];
					if (oTriggerConfig && (oTriggerConfig.inState === SemanticPage._currentMode)) {
						SemanticPage._currentMode = oTriggerConfig.triggers;
						break;
					}
				}
			}
		}

		this.fireEvent(SemanticPage._currentMode);
	};

	SemanticPage.prototype._addToInnerAggregation = function (oControl, oConfig, bSupressInvalidate) {

		if (!oControl || !oConfig || !oConfig.position) {
			return;
		}

		var oPositionInPage = this._oPositionsMap[oConfig.position];

		if (!oPositionInPage || !oPositionInPage.oContainer || !oPositionInPage.sAggregation) {
			return;
		}

		var oSequenceOrderInfo;

		if (oConfig.group) {
			oSequenceOrderInfo = {
				sGroup: oConfig.group,
				iSequenceIndexInGroup: oConfig.order
			};
		}

		return oPositionInPage.oContainer["add" + capitalize(oPositionInPage.sAggregation)](oControl, oSequenceOrderInfo, bSupressInvalidate);
	};

	SemanticPage.prototype._initSemanticPositionsMap = function (oControl, oConfig) {

		var oMap = {};

		oMap[SemanticPage._PositionInPage.headerLeft] = {
			oContainer: this._getInternalHeader(),
			sAggregation: "contentLeft"
		};

		oMap[SemanticPage._PositionInPage.headerRight] = {
			oContainer: this._getInternalHeader(),
			sAggregation: "contentRight"
		};

		oMap[SemanticPage._PositionInPage.headerMiddle] = {
			oContainer: this._getInternalHeader(),
			sAggregation: "contentMiddle"
		};

		oMap[SemanticPage._PositionInPage.footerLeft] = {
			oContainer: this._oWrappedFooter.getSectionComposite("semanticLeft"),
			sAggregation: "content"
		};

		oMap[SemanticPage._PositionInPage.footerRight] = {
			oContainer: this._oWrappedFooter.getSectionComposite("semanticRight"),
			sAggregation: "content"
		};

		return oMap;
	};


	/**
	 * Create internal page
	 * @returns {sap.m.Page}
	 * @private
	 */
	SemanticPage.prototype._getPage = function () {

		var oPage = this.getAggregation("_page");
		if (!oPage) {
			this.setAggregation("_page", new Page());
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


	/*
	 helper functions
	 */
	function capitalize(sName) {
		return sName.substring(0, 1).toUpperCase() + sName.substring(1);
	}

	function fnIsIconControl(oControl) {

		return (typeof oControl.getIcon === "function") && (oControl.getIcon().length > 0);
	}

	function fnIsTextButton(oControl) {

		return (oControl instanceof Button) && !(oControl instanceof OverflowToolbarButton) && (typeof oControl.getText === "function") && (oControl.getText().length > 0);
	}

	return SemanticPage;
}, /* bExport= */ false);
