/*!
 * ${copyright}
 */
sap.ui.define([
	"jquery.sap.global",
	"sap/ui/core/Control",
	"sap/ui/base/ManagedObject",
	"sap/f/library",
	"sap/f/DynamicPage",
	"sap/f/DynamicPageTitle",
	"sap/f/DynamicPageHeader",
	"sap/m/OverflowToolbar",
	"sap/m/ActionSheet",
	"./SemanticTitle",
	"./SemanticFooter",
	"./SemanticShareMenu",
	"./SemanticConfiguration"
], function (jQuery,
			Control,
			ManagedObject,
			library,
			DynamicPage,
			DynamicPageTitle,
			DynamicPageHeader,
			OverflowToolbar,
			ActionSheet,
			SemanticTitle,
			SemanticFooter,
			SemanticShareMenu,
			SemanticConfiguration) {
	"use strict";

	/**
	* Constructor for a new <code>SemanticPage</code>.
	*
	* @param {string} [sId] ID for the new control, generated automatically if no ID is given
	* @param {object} [mSettings] Initial settings for the new control
	*
	* @class
	* <strong><i>Overview</i></strong>
	* <br><br>
	*
	* <strong>Notes:</strong>
	*
	* <strong><i>Structure</i></strong>
	* <br><br>
	*
	* <strong><i>Usage</i></strong>
	* <br><br>
	*
	* <br><br>
	* <strong><i>Responsive Behavior</i></strong>
	* <br><br>
	* The responsive behavior of the {@link sap.f.SemanticPage SemanticPage} depends on the
	* behavior of the content that is displayed.
	*
	* @extends sap.ui.core.Control
	*
	* @author SAP SE
	* @version ${version}
	*
	* @constructor
	* @public
	* @since 1.46.0
	* @alias sap.f.semantic.SemanticPage
	* @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	*/
	var SemanticPage = Control.extend("sap.f.semantic.SemanticPage", /** @lends sap.f.semantic.SemanticPage.prototype */ {
		metadata: {
			library: "sap.f",
			properties: {

				/**
				* Determines whether the header is expanded.
				*
				* The <code>Header</code> can be also expanded/collapsed by user interaction,
				* which requires the property to be internally mutated by the control to reflect the changed state.
				*
				* <b>Note:</b> Please be aware that initially collapsed header state is not supported,
				* so <code>headerExpanded</code> should not be set to <code>false</code> when initializing the control.
				*/
				headerExpanded: {type: "boolean", group: "Behavior", defaultValue: true},

				/**
				* Determines whether the <code>Header</code> is pinnable.
				*/
				headerPinnable: {type: "boolean", group: "Behavior", defaultValue: true},

				/**
				* Preserves the current <code>Header</code> state when scrolling.
				* For example, if the user expands the <code>Header</code> by clicking on the <code>Title</code>
				* and then scrolls down the page, the <code>Header</code> will remain expanded.
				* <br><b>Note:</b> Based on internal rules, the value of the property is not always taken into account - for example,
				* when the control is rendered on tablet or mobile and the <code>Title</code> and <code>Header</code>
				* are with height larger than a given threshold.
				*/
				preserveHeaderStateOnScroll: {type: "boolean", group: "Behavior", defaultValue: false},

				/**
				* Determines whether the the user can switch between the expanded/collapsed states of the
				* <code>Header</code> by clicking on the <code>Title</code>.
				*
				* If set to <code>false</code>, the Title is not clickable and the application
				* must provide other means for expanding/collapsing the <code>Header</code>, if necessary.
				*/
				toggleHeaderOnTitleClick: {type: "boolean", group: "Behavior", defaultValue: true},

				/**
				* Determines whether the <code>Footer</code> is visible.
				*/
				showFooter: {type: "boolean", group: "Behavior", defaultValue: false}
			},
			defaultAggregation : "content",
			aggregations: {

				/**
				* The <code>SemanticPage</code> <code>heading</code>.
				* A typical usage is the <code>sap.m.Title</code> or any other UI5 control,
				* that serves as a heading for an object.
				*
				* <b>Note:</b> The <code>control</code> will be placed in the <code>Title</code>
				* left most area.
				*/
				titleHeading: {type: "sap.ui.core.Control", multiple: false, defaultValue: null},

				/**
				* The content, displayed in the <code>Title</code>,
				* when the <code>Header</code> is in collapsed state.
				*
				* <b>Note:</b> The <code>controls</code> will be placed in the <code>Title</code>
				* middle area
				*/
				titleSnappedContent: {type: "sap.ui.core.Control", multiple: true},

				/**
				* The content,displayed in the <code>Title</code>,
				* when the <code>Header</code> is in expanded state.
				*
				* <b>Note:</b> The <code>controls</code> will be placed in the <code>Title</code>
				* middle area
				*/
				titleExpandedContent: {type: "sap.ui.core.Control", multiple: true},

				/**
				* The <code>aggregation</code> accepts a <code>TitleMainAction</code>.
				* The <code>TitleMainAction</code> has default semantic-specific properties
				* and it`s placed in the <code>SemanticPage</code> <code>Title</code> as first action.
				*/
				titleMainAction: {type: "sap.f.semantic.TitleMainAction", multiple: false},

				/**
				* The <code>aggregation</code> accepts a <code>AddAction</code>.
				* A <code>AddAction</code> has default semantic-specific properties
				* and it`s placed in the <code>SemanticPage</code> <code>Title</code> - the "TextActions" area.
				*/
				addAction: {type: "sap.f.semantic.AddAction", multiple: false},

				/**
				* The <code>aggregation</code> accepts a <code>DeleteAction</code>.
				* A <code>DeleteAction</code> has default semantic-specific properties
				* and it`s placed in the <code>SemanticPage</code> <code>Title</code> - the "TextActions" area.
				*/
				deleteAction: {type: "sap.f.semantic.DeleteAction", multiple: false},

				/**
				* The <code>aggregation</code> accepts a <code>CopyAction</code>.
				* A <code>CopyAction</code> has default semantic-specific properties
				* and it`s placed in the <code>SemanticPage</code> <code>Title</code> - the "TextActions" area.
				*/
				copyAction: {type: "sap.f.semantic.CopyAction", multiple: false},

				/**
				* The <code>aggregation</code> accepts a <code>FlagAction</code>.
				* A <code>FlagAction</code> has default semantic-specific properties
				* and it`s placed in the <code>SemanticPage</code> <code>Title</code> - the "IconActions" area.
				*/
				flagAction: {type: "sap.f.semantic.FlagAction", multiple: false},

				/**
				* The <code>aggregation</code> accepts a <code>FavoriteAction</code>.
				* A <code>FavoriteAction</code> has default semantic-specific properties
				* and it`s placed in the <code>SemanticPage</code> <code>Title</code> - the "IconActions" area.
				*/
				favoriteAction: {type: "sap.f.semantic.FavoriteAction", multiple: false},

				/**
				* The <code>aggregation</code> accepts a <code>FullScreenAction</code>.
				* A <code>FullScreenAction</code> has default semantic-specific properties
				* and it`s placed in the <code>SemanticPage</code> <code>Title</code> - the "IconActions" area.
				*/
				fullScreenAction: {type: "sap.f.semantic.FullScreenAction", multiple: false},

				/**
				* The <code>aggregation</code> accepts a <code>ExitFullScreenAction</code>.
				* A <code>FavoriteAction</code> has default semantic-specific properties
				* and it`s placed in the <code>SemanticPage</code> <code>Title</code> - the "IconActions" area.
				*/
				exitFullScreenAction: {type: "sap.f.semantic.ExitFullScreenAction", multiple: false},

				/**
				* The <code>aggregation</code> accepts a <code>CloseAction</code>.
				* A <code>CloseAction</code> has default semantic-specific properties
				* and it`s placed in the <code>SemanticPage</code> <code>Title</code> - the "IconActions" area.
				*/
				closeAction: {type: "sap.f.semantic.CloseAction", multiple: false},


				/**
				* The <code>titleCustomTextActions</code> are placed in the <code>SemanticPage</code> <code>Title</code>
				* - the "TextActions" area, right before the semantic text action.
				*/
				titleCustomTextActions: {type: "sap.m.Button", multiple: true},

				/**
				* The <code>titleCustomIconActions</code> are placed in the <code>SemanticPage</code> <code>Title</code>
				* - the "IconActions" area, right before the semantic icon action.
				*/
				titleCustomIconActions: {type: "sap.m.OverflowToolbarButton", multiple: true},

				/**
				* <code>Header</code> content
				*/
				headerContent: {type: "sap.ui.core.Control", multiple: true},

				/**
				* <code>SemanticPage</code> content
				*/
				content: {type: "sap.ui.core.Control", multiple: false},

				/**
				* The <code>aggregation</code> accepts a <code>FooterMainAction</code>.
				* The <code>FooterMainAction</code> has default semantic-specific properties
				* and it`s placed in the <code>SemanticPage</code> <code>Footer</code> - the "FooterRight" area
				* as first action.
				* It has default text value - "Save".
				*/
				footerMainAction: {type: "sap.f.semantic.FooterMainAction", multiple: false},

				/**
				* The <code>aggregation</code> accepts a <code>MessagesIndicator</code>.
				* The <code>MessagesIndicator</code> has default semantic-specific properties
				* and it`s placed in the <code>SemanticPage</code> <code>Footer</code> - the "FooterLeft" area
				* as first action.
				*/
				messagesIndicator: {type: "sap.f.semantic.MessagesIndicator", multiple: false},

				/**
				* The <code>aggregation</code> accepts a <code>DraftIndicator</code>.
				* The <code>DraftIndicator</code> has default semantic-specific properties
				* and it`s placed in the <code>SemanticPage</code> <code>Footer</code> - the "FooterLeft" area
				* as second action.
				*/
				draftIndicator: {type: "sap.m.DraftIndicator", multiple: false},

				/**
				* The <code>aggregation</code> accepts a <code>PositiveAction</code>.
				* The <code>PositiveAction</code> has default semantic-specific properties
				* and it`s placed in the <code>SemanticPage</code> <code>Footer</code> - the "FooterRight" area.
				* It has default text value - "Accept".
				*/
				positiveAction: {type: "sap.f.semantic.PositiveAction", multiple: false},

				/**
				* The <code>aggregation</code> accepts a <code>NegativeAction</code>.
				* The <code>NegativeAction</code> has default semantic-specific properties
				* and it`s placed in the <code>SemanticPage</code> <code>Footer</code> - the "FooterRight" area.
				* It has default text value - "Reject".
				*/
				negativeAction: {type: "sap.f.semantic.NegativeAction", multiple: false},

				/**
				* The <code>footerCustomActions</code> are placed in the <code>SemanticPage</code> <code>Footer</code>
				* "FooterRight" area, right after all the semantic footer actions.
				*/
				footerCustomActions: {type: "sap.m.Button", multiple: true},

				/**
				* The <code>aggregation</code> accepts a <code>DiscussInJamAction</code>.
				* The <code>DiscussInJamAction</code> has default semantic-specific properties
				* and it`s placed in the <code>SemanticPage</code> <code>Title</code> - the "ShareMenu" area.
				*/
				discussInJamAction: {type: "sap.f.semantic.DiscussInJamAction", multiple: false},

				/**
				* The <code>aggregation</code> accepts a <code>ShareInJamAction</code>.
				* The <code>ShareInJamAction</code> has default semantic-specific properties
				* and it`s placed in the <code>SemanticPage</code> <code>Title</code> - the "ShareMenu" area.
				*/
				shareInJamAction: {type: "sap.f.semantic.ShareInJamAction", multiple: false},


				/**
				* The <code>aggregation</code> accepts a <code>SendMessageAction</code>.
				* The <code>SendMessageAction</code> has default semantic-specific properties
				* and it`s placed in the <code>SemanticPage</code> <code>Title</code> - the "ShareMenu" area.
				*/
				sendMessageAction: {type: "sap.f.semantic.SendMessageAction", multiple: false},

				/**
				* The <code>aggregation</code> accepts a <code>SendEmailAction</code>.
				* The <code>SendEmailAction</code> has default semantic-specific properties
				* and it`s placed in the <code>SemanticPage</code> <code>Title</code> - the "ShareMenu" area.
				*/
				sendEmailAction: {type: "sap.f.semantic.SendEmailAction", multiple: false},

				/**
				* The <code>aggregation</code> accepts a <code>PrintAction</code>.
				* The <code>PrintAction</code> has default semantic-specific properties
				* and it`s placed in the <code>SemanticPage</code> <code>Title</code> - the "ShareMenu" area.
				*/
				printAction: {type: "sap.f.semantic.PrintAction", multiple: false},

				/**
				* The <code>customShareActions</code> are placed in the <code>SemanticPage</code> <code>Footer</code>
				* - the "ShareMenu" area, right after all the semantic actions.
				*/
				customShareActions: {type: "sap.m.Button", multiple: true},

				/**
				* The <code>aggregation</code> holds <code>DynamicPage</code>, used internally.
				*/
				_dynamicPage: {type: "sap.f.DynamicPage", multiple: false, visibility: "hidden"}
			}
		}
	});

	/*
	* STATIC MEMBERS
	*/
	SemanticPage._EVENTS = {
		SHARE_MENU_BTN_CHANGED : "_shareMenuBtnChanged"
	};

	/*
	* LIFECYCLE METHODS
	*/
	SemanticPage.prototype.init = function () {
		this._initDynamicPage();
		this._attachShareMenuButtonChange();
	};

	SemanticPage.prototype.exit = function () {
		this._cleanMemory();
	};

	/*
	* =================================================
	* PROPERTY PROXY METHODS
	* =================================================
	*/

	SemanticPage.prototype.setHeaderExpanded = function (bHeaderExpanded) {
		this._getPage().setHeaderExpanded(bHeaderExpanded);
		return this;
	};

	SemanticPage.prototype.getHeaderExpanded = function () {
		// We must override the getter,
		// because <code>DynamicPage</code> mutates the <code>headerExpanded</code> internally.
		return this._getPage().getHeaderExpanded();
	};

	SemanticPage.prototype.setHeaderPinnable = function (bHeaderPinnable) {
		var oDynamicPage = this._getPage(),
			oDynamicPageHeader = oDynamicPage.getHeader();

		oDynamicPageHeader.setPinnable(bHeaderPinnable);

		return this.setProperty("headerPinnable", oDynamicPageHeader.getPinnable(), true);
	};

	SemanticPage.prototype.setPreserveHeaderStateOnScroll = function (bPreserveHeaderStateOnScroll) {
		var oDynamicPage = this._getPage();

		oDynamicPage.setPreserveHeaderStateOnScroll(bPreserveHeaderStateOnScroll);

		return this.setProperty("preserveHeaderStateOnScroll", oDynamicPage.getPreserveHeaderStateOnScroll(), true);
	};

	SemanticPage.prototype.setToggleHeaderOnTitleClick = function (bToggleHeaderOnTitleClick) {
		this._getPage().setToggleHeaderOnTitleClick(bToggleHeaderOnTitleClick);
		return this.setProperty("toggleHeaderOnTitleClick", bToggleHeaderOnTitleClick, true);
	};

	SemanticPage.prototype.setShowFooter = function (bShowFooter) {
		this._getPage().setShowFooter(bShowFooter);
		return this.setProperty("showFooter", bShowFooter, true);
	};


	/*
	 * =================================================
	 * AGGREGATION METHODS
	 * =================================================
	 */

	SemanticPage.prototype.setAggregation = function (sAggregationName, oObject, bSuppressInvalidate) {
		var oOldChild = this.mAggregations[sAggregationName], sType, sPlacement;

		if (oOldChild === oObject) {
			return this;
		}

		oObject = this.validateAggregation(sAggregationName, oObject, false);
		sType = this.getMetadata().getManagedAggregation(sAggregationName).type;

		if (SemanticConfiguration.isKnownSemanticType(sType)) {
			sPlacement = SemanticConfiguration.getPlacement(sType);

			if (oOldChild) {
				this._getSemanticContainer(sPlacement).removeContent(oOldChild, sPlacement);
			}

			if (oObject) {
				this._getSemanticContainer(sPlacement).addContent(oObject, sPlacement);
			}

			return ManagedObject.prototype.setAggregation.call(this, sAggregationName, oObject, true);
		}

		return ManagedObject.prototype.setAggregation.call(this, sAggregationName, oObject, bSuppressInvalidate);
	};

	SemanticPage.prototype.destroyAggregation = function (sAggregationName, bSuppressInvalidate) {
		var oAggregationInfo = this.getMetadata().getAggregations()[sAggregationName], oObject, sPlacement;

		if (oAggregationInfo && SemanticConfiguration.isKnownSemanticType(oAggregationInfo.type)) {
			oObject = ManagedObject.prototype.getAggregation.call(this, sAggregationName);

			if (oObject) {
				sPlacement = SemanticConfiguration.getPlacement(oAggregationInfo.type);
				this._getSemanticContainer(sPlacement).removeContent(oObject, sPlacement);
			}
		}

		return ManagedObject.prototype.destroyAggregation.call(this, sAggregationName, bSuppressInvalidate);
	};

	/**
	* Proxies the <code>sap.f.semantic.SemanticPage</code> <code>titleHeading</code> aggregation's methods
	* to the <code>sap.f.DynamicPageTitle</code><code>heading</code>.
	*
	* @override
	*/
	["getTitleHeading", "setTitleHeading", "destroyTitleHeading"]
		.forEach(function (sMethod) {
			SemanticPage.prototype[sMethod] = function (oControl) {
				var oDynamicPageTitle = this._getTitle(),
					sTitleMethod = sMethod.replace(/TitleHeading?/, "Heading");

				return oDynamicPageTitle[sTitleMethod].apply(oDynamicPageTitle, arguments);
			};
		}, this);

	/**
	* Proxies the <code>sap.f.semantic.SemanticPage</code> <code>titleExpandedContent</code>
	* <code>aggregation</code> methods to <code>sap.f.DynamicPageTitle</code> <code>expandedContent</code>.
	*
	* @override
	*/
	[
		"addTitleExpandedContent",
		"insertTitleExpandedContent",
		"removeTitleExpandedContent",
		"indexOfTitleExpandedContent",
		"removeAllTitleExpandedContent",
		"destroyTitleExpandedContent",
		"getTitleExpandedContent"
	].forEach(function (sMethod) {
		SemanticPage.prototype[sMethod] = function (oControl) {
			var oDynamicPageTitle = this._getTitle(),
				sTitleMethod = sMethod.replace(/TitleExpandedContent?/, "ExpandedContent");

			return oDynamicPageTitle[sTitleMethod].apply(oDynamicPageTitle, arguments);
		};
	});

	/**
	* Proxies the <code>sap.f.semantic.SemanticPage</code> <code>titleExpandedContent</code>
	* <code>aggregation</code> methods to <code>sap.f.DynamicPageTitle</code> <code>snappedContent</code>.
	*
	* @override
	*/
	[
		"addTitleSnappedContent",
		"insertTitleSnappedContent",
		"removeTitleSnappedContent",
		"indexOfTitleSnappedContent",
		"removeAllTitleSnappedContent",
		"destroyTitleSnappedContent",
		"getTitleSnappedContent"
	].forEach(function (sMethod) {
		SemanticPage.prototype[sMethod] = function (oControl) {
			var oDynamicPageTitle = this._getTitle(),
				sTitleMethod = sMethod.replace(/TitleSnappedContent?/, "SnappedContent");

			return oDynamicPageTitle[sTitleMethod].apply(oDynamicPageTitle, arguments);
		};
	});

	/**
	* Proxies the <code>sap.f.semantic.SemanticPage</code> <code>headerContent</code>
	* <code>aggregation</code> methods to <code>sap.f.DynamicPageHeader</code> <code>content</code>.
	*
	* @override
	*/
	[
		"addHeaderContent",
		"insertHeaderContent",
		"removeHeaderContent",
		"indexOfHeaderContent",
		"removeAllHeaderContent",
		"destroyHeaderContent",
		"getHeaderContent"
	].forEach(function (sMethod) {
		SemanticPage.prototype[sMethod] = function (oControl) {
			var oDynamicPageHeader = this._getHeader(),
				sHeaderMethod = sMethod.replace(/HeaderContent?/, "Content");

			return oDynamicPageHeader[sHeaderMethod].apply(oDynamicPageHeader, arguments);
		};
	});

	/**
	* Proxies the <code>sap.f.semantic.SemanticPage</code> <code>content</code>
	* <code>aggregation</code> methods to the <code>sap.f.DynamicPage</code> content aggregation.
	*
	* @override
	*/
	["getContent", "setContent", "destroyContent"]
		.forEach(function (sMethod) {
			SemanticPage.prototype[sMethod] = function (oControl) {
				var oDynamicPage = this._getPage();
				return oDynamicPage[sMethod].apply(oDynamicPage, arguments);
			};
		}, this);

	/**
	* Proxies the <code>sap.f.semantic.SemanticPage</code> <code>titleCustomTextActions</code>
	* <code>aggregation</code> methods to the internal <code>sap.f.DynamicPageTitle</code>,
	* using the <code>sap.f.semantic.SemanticTitle</code> wrapper class.
	*
	* @override
	*/
	[
		"addTitleCustomTextAction",
		"insertTitleCustomTextAction",
		"indexOfTitleCustomTextAction",
		"removeTitleCustomTextAction",
		"removeAllTitleCustomTextActions",
		"destroyTitleCustomTextActions",
		"getTitleCustomTextActions"
	].forEach(function (sMethod) {
		SemanticPage.prototype[sMethod] = function () {
			var oSemanticTitle = this._getSemanticTitle(),
				sSemanticTitleMethod = sMethod.replace(/TitleCustomTextAction?/, "CustomTextAction");

			return oSemanticTitle[sSemanticTitleMethod].apply(oSemanticTitle, arguments);
		};
	}, this);


	/**
	* Proxies the <code>sap.f.semantic.SemanticPage</code> <code>titleCustomIconActions</code>
	* <code>aggregation</code> methods to the internal <code>sap.f.DynamicPageTitle</code>,
	* using the <code>sap.f.semantic.SemanticTitle</code> wrapper class.
	*
	* @override
	*/
	[
		"addTitleCustomIconAction",
		"insertTitleCustomIconAction",
		"indexOfTitleCustomIconAction",
		"removeTitleCustomIconAction",
		"removeAllTitleCustomIconActions",
		"destroyTitleCustomIconActions",
		"getTitleCustomIconActions"
	].forEach(function (sMethod) {
		SemanticPage.prototype[sMethod] = function () {
			var oSemanticTitle = this._getSemanticTitle(),
				sSemanticTitleMethod = sMethod.replace(/TitleCustomIconAction?/, "CustomIconAction");

			return oSemanticTitle[sSemanticTitleMethod].apply(oSemanticTitle, arguments);
		};
	}, this);


	/**
	* Proxies the<code>sap.f.semantic.SemanticPage</code> <code>footerCustomActions</code> aggregation's methods
	* to <code>OverflowToolbar</code>, using the <code>sap.f.semantic.SemanticFooter</code> wrapper class.
	*
	* @override
	*/
	[
		"addFooterCustomAction",
		"insertFooterCustomAction",
		"indexOfFooterCustomAction",
		"removeFooterCustomAction",
		"removeAllFooterCustomActions",
		"destroyFooterCustomActions",
		"getFooterCustomActions"
	].forEach(function (sMethod) {
		SemanticPage.prototype[sMethod] = function () {
			var oSemanticFooter = this._getSemanticFooter(),
				sSemanticFooterMethod = sMethod.replace(/FooterCustomAction?/, "CustomAction");

			return oSemanticFooter[sSemanticFooterMethod].apply(oSemanticFooter, arguments);
		};
	}, this);


	/**
	* Proxies the <code>sap.f.semantic.SemanticPage</code> <code>customShareActions</code> aggregation's methods.
	*
	* @override
	*/
	[
		"addCustomShareAction",
		"insertCustomShareAction",
		"indexOfCustomShareAction",
		"removeCustomShareAction",
		"removeAllCustomShareActions",
		"destroyCustomShareActions",
		"getCustomShareActions"
	].forEach(function (sMethod) {
		SemanticPage.prototype[sMethod] = function () {
			var oSemanticShareMenu = this._getShareMenu(),
				sSemanticShareMenuMethod = sMethod.replace(/CustomShareAction?/, "CustomAction");

			return oSemanticShareMenu[sSemanticShareMenuMethod].apply(oSemanticShareMenu, arguments);
		};
	}, this);


	/*
	* Attaches a handler to the <code>ShareMenu</code> base button change.
	* When the ShareMenu base button changes,
	* the old base button should be replaced by the new one.
	*
	* @private
	*/
	SemanticPage.prototype._attachShareMenuButtonChange = function () {
		this.attachEvent(SemanticPage._EVENTS.SHARE_MENU_BTN_CHANGED, this._onShareMenuBtnChanged, this);
	};

	/*
	* Handles the SHARE_MENU_BTN_CHANGED event.
	*
	* @private
	*/
	SemanticPage.prototype._onShareMenuBtnChanged = function (oEvent) {
		var oNewButton = oEvent.getParameter("oNewButton"),
			oOldButton = oEvent.getParameter("oOldButton");

		this._getSemanticTitle().removeContent(oOldButton, "shareIcon");
		this._getSemanticTitle().addContent(oNewButton, "shareIcon");
	};

	/*
	* =================================================
	* CREATION METHODS of:
	* <code>sap.f.DynamicPage</code>,
	* <code>sap.f.DynamicPageTitle</code>,
	* <code>sap.f.DynamicPageHeader</code>,
	* <code>sap.f.semantic.SemanticTitle</code>,
	* <code>sap.f.semantic.SemanticFooter</code> and
	* <code>sap.f.semantic.SemanticShareMenu</code>.
	* =================================================
	*/

	/**
	* Retrieves the internal <code>DynamicPage</code> aggregation.
	*
	* @returns {sap.f.DynamicPage}
	* @private
	*/
	SemanticPage.prototype._getPage = function () {
		if (!this.getAggregation("_dynamicPage")) {
			this._initDynamicPage();
		}

		return this.getAggregation("_dynamicPage");
	};

	/**
	* Initializes the internal <code>sap.f.DynamicPage</code> <code>aggregation</code>.
	*
	* @returns {sap.f.semantic.SemanticPage}
	* @private
	*/
	SemanticPage.prototype._initDynamicPage = function () {
		this.setAggregation("_dynamicPage", new DynamicPage(this.getId() + "-page", {
			title : this._getTitle(),
			header : this._getHeader(),
			footer: this._getFooter()
		}), true);
	};

	/**
	* Retrieves a <code>sap.f.DynamicPageTitle</code> instance,
	* used for the <code>title</code> <code>aggregation</code> of the <sap.f.DynamicPage</code>.
	*
	* @returns {sap.f.DynamicPageTitle}
	* @private
	*/
	SemanticPage.prototype._getTitle = function () {
		if (!this._oDynamicPageTitle) {
			this._oDynamicPageTitle = this._getSemanticTitle()._getContainer();
		}

		return this._oDynamicPageTitle;
	};

	/**
	* Retrieves a <code>sap.f.DynamicPageHeader</code> instance,
	* used for the <code>header</code> <code>aggregation</code> of the <sap.f.DynamicPage</code>.
	*
	* @returns {sap.f.DynamicPageHeader}
	* @private
	*/
	SemanticPage.prototype._getHeader = function () {
		if (!this._oDynamicPageHeader) {
			this._oDynamicPageHeader =  new DynamicPageHeader(this.getId() + "-pageHeader");
		}
		return this._oDynamicPageHeader;
	};

	/**
	* Retrieves a <code>sap.m.OverflowToolbar</code> instance,
	* used for the <code>footer</code> <code>aggregation</code> of the <sap.f.DynamicPage</code>.
	*
	* @returns {sap.m.OverflowToolbar}
	* @private
	*/
	SemanticPage.prototype._getFooter = function () {
		if (!this._oDynamicPageFooter) {
			this._oDynamicPageFooter = this._getSemanticFooter()._getContainer();
		}

		return this._oDynamicPageFooter;
	};

	/**
	* Retrieves a <code>sap.f.SemanticTitle</code> instance,
	*
	* @returns {sap.f.SemanticTitle}
	* @private
	*/
	SemanticPage.prototype._getSemanticTitle = function() {
		if (!this._oSemanticTitle) {
			this._oSemanticTitle = new SemanticTitle(new DynamicPageTitle(this.getId() + "-pageTitle"), this);
		}
		return this._oSemanticTitle;
	};

	/**
	* Retrieves a <code>sap.f.SemanticShareMenu</code> instance,
	*
	* @returns {sap.f.SemanticShareMenu}
	* @private
	*/
	SemanticPage.prototype._getShareMenu = function() {
		if (!this._oShareMenu) {
			this._oShareMenu = new SemanticShareMenu(this._getActionSheet(), this);
		}
		return this._oShareMenu;
	};

	/**
	* Retrieves a <code>sap.m.ActionSheet</code> instance,
	*
	* @returns {sap.m.ActionSheet}
	* @private
	*/
	SemanticPage.prototype._getActionSheet = function() {
		if (!this._oActionSheet) {
			this._oActionSheet = new ActionSheet(this.getId() + "-shareMenu");
		}
		return this._oActionSheet;
	};

	/**
	* Retrieves a <code>sap.f.SemanticFooter</code> instance,
	*
	* @returns {sap.f.SemanticFooter}
	* @private
	*/
	SemanticPage.prototype._getSemanticFooter = function() {
		if (!this._oSemanticFooter) {
			this._oSemanticFooter = new SemanticFooter(this._getOverflowToolbar(), this);
		}
		return this._oSemanticFooter;
	};

	/**
	* Retrieves a <code>sap.m.OverflowToolbar</code> instance,
	* used for <code>footer</code> <code>aggregation</code> of the <code>sap.f.DynamicPage</code>.
	*
	* @returns {sap.m.OverflowToolbar}
	* @private
	*/
	SemanticPage.prototype._getOverflowToolbar = function() {
		if (!this._oOverflowToolbar) {
			this._oOverflowToolbar = new OverflowToolbar(this.getId() + "-pageFooter");
		}
		return this._oOverflowToolbar;
	};

	/**
	* Retrieves a <code>sap.f.semantic.SemanticContainer</code> instance
	* for the given placement - TITLE_TEXT, TITLE_ICON, FOOTER_LEFT, FOOTER_RIGHT or SHARE_MENU.
	*
	* @param {String} sPlacement
	* @returns {sap.f.semantic.SemanticContainer | null}
	* @private
	*/
	SemanticPage.prototype._getSemanticContainer = function(sPlacement) {
		var oPlacement = SemanticConfiguration._Placement;

		if (sPlacement === oPlacement.titleText || sPlacement === oPlacement.titleIcon) {
			return this._getSemanticTitle();
		} else if (sPlacement === oPlacement.footerLeft || sPlacement === oPlacement.footerRight) {
			return this._getSemanticFooter();
		} else if (sPlacement === oPlacement.shareMenu) {
			return this._getShareMenu();
		}

		return null;
	};

	/**
	* Cleans references of the used objects
	* and destroys them.
	*
	* @private
	*/
	SemanticPage.prototype._cleanMemory = function() {
		if (this._oDynamicPageTitle) {
			this._oDynamicPageTitle.destroy();
			this._oDynamicPageTitle = null;
		}

		if (this._oDynamicPageHeader) {
			this._oDynamicPageHeader.destroy();
			this._oDynamicPageHeader = null;
		}

		if (this._oDynamicPageFooter) {
			this._oDynamicPageFooter.destroy();
			this._oDynamicPageFooter = null;
		}

		if (this._oOverflowToolbar) {
			this._oOverflowToolbar.destroy();
			this._oOverflowToolbar = null;
		}

		if (this._oActionSheet) {
			this._oActionSheet.destroy();
			this._oActionSheet = null;
		}

		if (this._oShareMenu) {
			this._oShareMenu.destroy();
			this._oShareMenu = null;
		}

		if (this._oSemanticTitle) {
			this._oSemanticTitle.destroy();
			this._oSemanticTitle = null;
		}

		if (this._oSemanticFooter) {
			this._oSemanticFooter.destroy();
			this._oSemanticFooter = null;
		}
	};

	return SemanticPage;

}, /* bExport= */ true);