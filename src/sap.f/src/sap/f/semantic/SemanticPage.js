/*!
 * ${copyright}
 */
sap.ui.define([
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
    "./SemanticConfiguration",
    "./SemanticPageRenderer"
], function(
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
	SemanticConfiguration,
	SemanticPageRenderer
) {
	"use strict";

	// shortcut for sap.f.DynamicPageTitleArea
	var DynamicPageTitleArea = library.DynamicPageTitleArea;

	/**
	* Constructor for a new <code>SemanticPage</code>.
	*
	* @param {string} [sId] ID for the new control, generated automatically if no ID is given
	* @param {object} [mSettings] Initial settings for the new control
	*
	* @class
	* An enhanced {@link sap.f.DynamicPage}, that contains controls with semantic-specific meaning.
	*
	* <h3>Overview</h3>
	*
	* Content specified in the <code>sap.f.semantic.SemanticPage</code> aggregations is automatically
	* positioned in dedicated sections of the title or the footer of the page, depending on
	* the control's semantics.
	*
	* The actions in the <code>SemanticPage</code> title are grouped to text actions or icon actions.
	* When an aggregation is set, the actions appear in the following predefined order (from left to right):
	*
	* <ul>Text actions:
	* <li>The main semantic text action - <code>titleMainAction</code></li>
	* <li>Any custom text actions - <code>titleCustomTextActions</code></li>
	* <li>The semantic text actions - <code>editAction</code>, <code>deleteAction</code>, <code>copyAction</code> and <code>addAction</code></li></ul>
	*
	* <ul>Icon actions:
	* <li>Any custom icon actions - <code>titleCustomIconActions</code></li>
	* <li>The simple semantic icon actions - <code>favoriteAction</code> and <code>flagAction</code></li>
	* <li>The share menu semantic icon actions as a drop-down list with the following order:
	* 	<ul><li><code>sendEmailAction</code></li>
	* 	<li><code>discussInJamAction</code></li>
	* 	<li><code>shareInJamAction</code></li>
	* 	<li><code>sendMessageAction</code></li>
	* 	<li><code>printAction</code></li>
	* 	<li>Any <code>customShareActions</code></li></ul></li>
	* <li>The navigation semantic actions - <code>fullScreenAction</code>, <code>exitFullScreenAction</code>,
	* and <code>closeAction</li></code></ul>
	*
	* The actions in the <code>SemanticPage</code> footer are positioned either on its left or right area and have the following predefined order:
	*
	* <ul>Footer left area:
	* <li>The semantic text action - <code>messagesIndicator</code></li>
	* <li>The semantic label - <code>draftIndicator</code></li></ul>
	*
	* <ul>Footer right area:
	* <li>The main semantic text action - <code>footerMainAction</code></li>
	* <li>The semantic text actions - <code>positiveAction</code> and <code>negativeAction</code></li>
	* <li>Any custom text actions - <code>footerCustomActions</code></li></ul>
	*
	* <h3>Usage</h3>
	*
	* Using the <code>SemanticPage</code> facilitates the implementation of the SAP Fiori 2.0 design guidelines.
	*
	* <h3>Responsive behavior</h3>
	*
	* The responsive behavior of the <code>SemanticPage</code> depends on the behavior of the content that is displayed.
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
	* @see {@link topic:47dc86847f7a426a8e557167cf523bda Semantic Page}
	* @see {@link topic:84f3d52f492648d5b594e4f45dca7727 Semantic Pages}
	* @see {@link topic:4a97a07ec8f5441d901994d82eaab1f5 Semantic Page (sap.m)}
	* @see {@link fiori:https://experience.sap.com/fiori-design-web/semantic-page/ Semantic Page}
	* @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	*/
	var SemanticPage = Control.extend("sap.f.semantic.SemanticPage", /** @lends sap.f.semantic.SemanticPage.prototype */ {
		metadata: {
			library: "sap.f",
			properties: {

				/**
				* Determines whether the header is expanded.
				*
				* The header can be also expanded/collapsed by user interaction,
				* which requires the property to be internally mutated by the control to reflect the changed state.
				*
				* <b>Note:</b> Please be aware, that initially collapsed header state is not supported,
				* so <code>headerExpanded</code> should not be set to <code>false</code> when initializing the control.
				*/
				headerExpanded: {type: "boolean", group: "Behavior", defaultValue: true},

				/**
				* Determines whether the header is pinnable.
				*/
				headerPinnable: {type: "boolean", group: "Behavior", defaultValue: true},

				/**
				* Preserves the current header state when scrolling.
				*
				* For example, if the user expands the header by clicking on the title
				* and then scrolls down the page, the header will remain expanded.
				*
				* <b>Note:</b> Based on internal rules, the value of the property is not always taken into account - for example,
				* when the control is rendered on tablet or mobile and the title and the header
				* are with height larger than a given threshold.
				*/
				preserveHeaderStateOnScroll: {type: "boolean", group: "Behavior", defaultValue: false},

				/**
				* Determines whether the user can switch between the expanded/collapsed states of the
				* header by clicking on the title.
				*
				* If set to <code>false</code>, the title is not clickable and the application
				* must provide other means for expanding/collapsing the header, if necessary.
				*/
				toggleHeaderOnTitleClick: {type: "boolean", group: "Behavior", defaultValue: true},

				/**
				* Determines whether the footer is visible.
				*/
				showFooter: {type: "boolean", group: "Behavior", defaultValue: false},

				/**
				 * Determines which of the title areas (Begin, Middle) is primary.
				 *
				 * <b>Note:</b> The primary area is shrinking at a lower rate, remaining visible as long as it can.
				 *
				 * @since 1.52
				 */
				titlePrimaryArea : {type: "sap.f.DynamicPageTitleArea", group: "Appearance", defaultValue: DynamicPageTitleArea.Begin}

			},
			defaultAggregation : "content",
			aggregations: {

				/**
				* The <code>SemanticPage</code> heading.
				*
				* A typical usage is the <code>sap.m.Title</code> or any other UI5 control,
				* that serves as a heading for an object.
				*
				* <b>Note:</b> The control will be placed in the title`s leftmost area.
				*/
				titleHeading: {type: "sap.ui.core.Control", multiple: false, defaultValue: null, forwarding: {getter: "_getTitle", aggregation: "heading"}},

				/**
				 * The <code>SemanticPage</code> breadcrumbs.
				 *
				 * A typical usage is the <code>sap.m.Breadcrumbs</code> control or any other UI5 control,
				 * that implements the <code>sap.m.IBreadcrumbs</code> interface.
				 *
				 * <b>Note:</b> The control will be placed in the title`s top-left area.
				 * @since 1.52
				 */
				titleBreadcrumbs: {type: "sap.m.IBreadcrumbs", multiple: false, defaultValue: null, forwarding: {getter: "_getTitle", aggregation: "breadcrumbs"}},

				/**
				* The content, displayed in the title, when the header is in collapsed state.
				*
				* <b>Note:</b> The controls will be placed in the title`s left area,
				* under the <code>titleHeading</code> aggregation.
				*/
				titleSnappedContent: {type: "sap.ui.core.Control", multiple: true, forwarding: {getter: "_getTitle", aggregation: "snappedContent"}},

				/**
				* The content,displayed in the title, when the header is in expanded state.
				*
				* <b>Note:</b> The controls will be placed in the title`s left area,
				* under the <code>titleHeading</code> aggregation.
				*/
				titleExpandedContent: {type: "sap.ui.core.Control", multiple: true, forwarding: {getter: "_getTitle", aggregation: "expandedContent"}},

				/**
				 * The content, displayed in the title.
				 *
				 * <b>Note:</b> The controls will be placed in the middle area.
				 * @since 1.52
				 */
				titleContent: {type: "sap.ui.core.Control", multiple: true, forwarding: {getter: "_getTitle", aggregation: "content"}},

				/**
				* A semantic-specific button which is placed in the <code>SemanticPage</code> title as first action.
				*/
				titleMainAction: {type: "sap.f.semantic.TitleMainAction", multiple: false},

				/**
				 * A semantic-specific button which is placed in the <code>TextActions</code> area of the <code>SemanticPage</code> title.
				 * @since 1.50
				 */
				editAction: {type: "sap.f.semantic.EditAction", multiple: false},

				/**
				* A semantic-specific button which is placed in the <code>TextActions</code> area of the <code>SemanticPage</code> title.
				*/
				deleteAction: {type: "sap.f.semantic.DeleteAction", multiple: false},

				/**
				* A semantic-specific button which is placed in the <code>TextActions</code> area of the <code>SemanticPage</code> title.
				*/
				copyAction: {type: "sap.f.semantic.CopyAction", multiple: false},

				/**
				 * A semantic-specific button which is placed in the <code>TextActions</code> area of the <code>SemanticPage</code> title.
				 */
				addAction: {type: "sap.f.semantic.AddAction", multiple: false},

				/**
				* A semantic-specific button which is placed in the <code>IconActions</code> area of the <code>SemanticPage</code> title.
				*/
				flagAction: {type: "sap.f.semantic.FlagAction", multiple: false},

				/**
				* A semantic-specific button which is placed in the <code>IconActions</code> area of the <code>SemanticPage</code> title.
				*/
				favoriteAction: {type: "sap.f.semantic.FavoriteAction", multiple: false},

				/**
				* A semantic-specific button which is placed in the <code>IconActions</code> area of the <code>SemanticPage</code> title.
				*/
				fullScreenAction: {type: "sap.f.semantic.FullScreenAction", multiple: false},

				/**
				* A semantic-specific button which is placed in the <code>IconActions</code> area of the <code>SemanticPage</code> title.
				*/
				exitFullScreenAction: {type: "sap.f.semantic.ExitFullScreenAction", multiple: false},

				/**
				* A semantic-specific button which is placed in the <code>IconActions</code> area of the <code>SemanticPage</code> title.
				*/
				closeAction: {type: "sap.f.semantic.CloseAction", multiple: false},

				/**
				* The <code>titleCustomTextActions</code> are placed in the <code>TextActions</code> area of the
				* <code>SemanticPage</code> title, right before the semantic text action.
				*/
				titleCustomTextActions: {type: "sap.m.Button", multiple: true},

				/**
				* The <code>titleCustomIconActions</code> are placed in the <code>IconActions</code> area of the
				* <code>SemanticPage</code> title, right before the semantic icon action.
				*/
				titleCustomIconActions: {type: "sap.m.OverflowToolbarButton", multiple: true},

				/**
				* The header content.
				*/
				headerContent: {type: "sap.ui.core.Control", multiple: true, forwarding: {getter: "_getHeader", aggregation: "content"}},

				/**
				* The <code>SemanticPage</code> content.
				*/
				content: {type: "sap.ui.core.Control", multiple: false},

				/**
				* A semantic-specific button which is placed in the <code>FooterRight</code> area of the <code>SemanticPage</code>
				* footer with default text value set to <code>Save</code>.
				*/
				footerMainAction: {type: "sap.f.semantic.FooterMainAction", multiple: false},

				/**
				* A semantic-specific button which is placed in the <code>FooterLeft</code> area of the <code>SemanticPage</code>
				* footer as a first action.
				*/
				messagesIndicator: {type: "sap.f.semantic.MessagesIndicator", multiple: false},

				/**
				* A semantic-specific button which is placed in the <code>FooterLeft</code> area of the <code>SemanticPage</code>
				* footer as a second action.
				*/
				draftIndicator: {type: "sap.m.DraftIndicator", multiple: false},

				/**
				* A semantic-specific button which is placed in the <code>FooterRight</code> area of the <code>SemanticPage</code>
				* footer with default text value set to <code>Accept</code>.
				*/
				positiveAction: {type: "sap.f.semantic.PositiveAction", multiple: false},

				/**
				* A semantic-specific button which is placed in the <code>FooterRight</code> area of the <code>SemanticPage</code>
				* footer with default text value set to <code>Reject</code>.
				*/
				negativeAction: {type: "sap.f.semantic.NegativeAction", multiple: false},

				/**
				* The <code>footerCustomActions</code> are placed in the <code>FooterRight</code> area of the
				* <code>SemanticPage</code> footer, right after the semantic footer actions.
				*/
				footerCustomActions: {type: "sap.m.Button", multiple: true},

				/**
				* A semantic-specific button which is placed in the <code>ShareMenu</code> area of the <code>SemanticPage</code> title.
				*/
				discussInJamAction: {type: "sap.f.semantic.DiscussInJamAction", multiple: false},

				/**
				* A button which is placed in the <code>ShareMenu</code> area of the <code>SemanticPage</code> title.
				*/
				saveAsTileAction: {type: "sap.m.Button", multiple: false},

				/**
				* A semantic-specific button which is placed in the <code>ShareMenu</code> area of the <code>SemanticPage</code> title.
				*/
				shareInJamAction: {type: "sap.f.semantic.ShareInJamAction", multiple: false},

				/**
				* A semantic-specific button which is placed in the <code>ShareMenu</code> area of the <code>SemanticPage</code> title.
				*/
				sendMessageAction: {type: "sap.f.semantic.SendMessageAction", multiple: false},

				/**
				* A semantic-specific button which is placed in the <code>ShareMenu</code> area of the <code>SemanticPage</code> title.
				*/
				sendEmailAction: {type: "sap.f.semantic.SendEmailAction", multiple: false},

				/**
				* A semantic-specific button which is placed in the <code>ShareMenu</code> area of the <code>SemanticPage</code> title.
				*/
				printAction: {type: "sap.f.semantic.PrintAction", multiple: false},

				/**
				* The <code>customShareActions</code> are placed in the <code>ShareMenu</code> area of the
				* <code>SemanticPage</code> title, right after the semantic actions.
				*/
				customShareActions: {type: "sap.m.Button", multiple: true},

				/**
				* The aggregation holds <code>DynamicPage</code>, used internally.
				*/
				_dynamicPage: {type: "sap.f.DynamicPage", multiple: false, visibility: "hidden"}
			},
			designtime : "sap/f/designtime/SemanticPage.designtime"
		}
	});

	/*
	* STATIC MEMBERS
	*/
	SemanticPage._EVENTS = {
		SHARE_MENU_CONTENT_CHANGED : "_shareMenuContentChanged"
	};

	SemanticPage._SAVE_AS_TILE_ACTION = "saveAsTileAction";

	/*
	* LIFECYCLE METHODS
	*/
	SemanticPage.prototype.init = function () {
		this._bSPBeingDestroyed = false;
		this._initDynamicPage();
		this._attachShareMenuButtonChange();
		this._fnActionSubstituteParentFunction = function () {
			return this;
		}.bind(this);
	};

	SemanticPage.prototype.exit = function () {
		this._bSPBeingDestroyed = true;
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

	SemanticPage.prototype.setTitlePrimaryArea = function (oPrimaryArea) {
		var oDynamicPageTitle = this._getTitle();

		oDynamicPageTitle.setPrimaryArea(oPrimaryArea);
		return this.setProperty("titlePrimaryArea", oDynamicPageTitle.getPrimaryArea(), true);
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

		if (sAggregationName === SemanticPage._SAVE_AS_TILE_ACTION) {
			sType = SemanticPage._SAVE_AS_TILE_ACTION;
		} else {
			sType = this.getMetadata().getManagedAggregation(sAggregationName).type;
		}

		if (SemanticConfiguration.isKnownSemanticType(sType)) {
			sPlacement = SemanticConfiguration.getPlacement(sType);

			if (oOldChild) {
				this._onRemoveAggregation(oOldChild, sType);
				this._getSemanticContainer(sPlacement).removeContent(oOldChild, sPlacement);
			}

			if (oObject) {
				oObject._getType = function() {
					return sType;
				};
				this._getSemanticContainer(sPlacement).addContent(oObject, sPlacement);
				this._onAddAggregation(oObject, sType);
			}

			return ManagedObject.prototype.setAggregation.call(this, sAggregationName, oObject, true);
		}

		return ManagedObject.prototype.setAggregation.call(this, sAggregationName, oObject, bSuppressInvalidate);
	};

	SemanticPage.prototype.destroyAggregation = function (sAggregationName, bSuppressInvalidate) {
		var oAggregationInfo = this.getMetadata().getAggregations()[sAggregationName], oObject, sPlacement, sType;

		if (sAggregationName === SemanticPage._SAVE_AS_TILE_ACTION) {
			sType = SemanticPage._SAVE_AS_TILE_ACTION;
		} else {
			sType = oAggregationInfo && oAggregationInfo.type;
		}

		if (sType && SemanticConfiguration.isKnownSemanticType(sType)) {
			oObject = ManagedObject.prototype.getAggregation.call(this, sAggregationName);

			if (oObject) {
				sPlacement = SemanticConfiguration.getPlacement(sType);
				this._onRemoveAggregation(oObject, sType);
				!this._bSPBeingDestroyed && this._getSemanticContainer(sPlacement).removeContent(oObject, sPlacement);
			}
		}

		return ManagedObject.prototype.destroyAggregation.call(this, sAggregationName, bSuppressInvalidate);
	};


	/**
	* Proxies the <code>sap.f.semantic.SemanticPage</code> <code>content</code>
	* aggregation methods to the <code>sap.f.DynamicPage</code> <code>content</code> aggregation.
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
	* aggregation methods to the internal <code>sap.f.DynamicPageTitle</code>,
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
	* aggregation methods to the internal <code>sap.f.DynamicPageTitle</code>,
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
	* Proxies the<code>sap.f.semantic.SemanticPage</code> <code>footerCustomActions</code> aggregation methods
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
	* Proxies the <code>sap.f.semantic.SemanticPage</code> <code>customShareActions</code> aggregation methods.
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

	/**
	* Process the given control,
	* before setting it to one of the <code>sap.f.semantic.SemanticPage</code> aggregations.
	* @param {sap.ui.core.Control} oControl
	* @param {String} sType
	* @private
	*/
	SemanticPage.prototype._onAddAggregation = function (oControl, sType) {
		if (sType === SemanticPage._SAVE_AS_TILE_ACTION) {
			this._replaceParent(oControl);
		}
	};

	/**
	* Process the given control,
	* after removing it from one of the <code>sap.f.semantic.SemanticPage</code> aggregations.
	* @param {sap.ui.core.Control} oControl
	* @param {String} sType
	* @private
	*/
	SemanticPage.prototype._onRemoveAggregation = function (oControl, sType) {
		if (sType === SemanticPage._SAVE_AS_TILE_ACTION) {
			 this._restoreParent(oControl);
		}

		if (oControl._getType) {
			delete oControl._getType;
		}
	};

	/**
	* Replaces the <code>getParent</code> function of the given control,
	* so the control would return the <code>SemanticPage</code> as its parent, rather than its real parent.
	* @param {sap.ui.core.Control} oControl
	* @private
	*/
	SemanticPage.prototype._replaceParent = function (oControl) {
		if (oControl._fnOriginalGetParent) {
			return;
		}

		oControl._fnOriginalGetParent = oControl.getParent;
		oControl.getParent = this._fnActionSubstituteParentFunction;
	};

	/**
	 * Restores the original <code>getParent</code> function of the given control.
	 * @param oControl
	 * @private
	 */
	SemanticPage.prototype._restoreParent = function (oControl) {
		if (oControl && oControl._fnOriginalGetParent) {
			oControl.getParent = oControl._fnOriginalGetParent;
		}
	};

	/*
	* Attaches a handler to the <code>ShareMenu</code> base button change.
	* When the <code>ShareMenu</code> base button changes,
	* the old base button should be replaced by the new one.
	*
	* @private
	*/
	SemanticPage.prototype._attachShareMenuButtonChange = function () {
		this.attachEvent(SemanticPage._EVENTS.SHARE_MENU_CONTENT_CHANGED, this._onShareMenuContentChanged, this);
	};

	/*
	* Handles the <code>SHARE_MENU_CONTENT_CHANGED</code> event.
	*
	* @private
	*/
	SemanticPage.prototype._onShareMenuContentChanged = function (oEvent) {
		var bShareMenuEmpty = oEvent.getParameter("bEmpty"),
			oSemanticTitle = this._getSemanticTitle(),
			oSemanticShareMenu = this._getShareMenu(),
			oShareMenuButton = oSemanticShareMenu._getShareMenuButton();

		if (!oShareMenuButton.getParent()) {
			oSemanticTitle.addContent(oShareMenuButton, "shareIcon");
			return;
		}

		oShareMenuButton.setVisible(!bShareMenuEmpty);
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
	* Initializes the internal <code>sap.f.DynamicPage</code> aggregation.
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
	* used for the <code>title</code> aggregation of the <sap.f.DynamicPage</code>.
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
	* used for the <code>header</code> aggregation of the <sap.f.DynamicPage</code>.
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
	* used for the <code>footer</code> aggregation of the <sap.f.DynamicPage</code>.
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
	* Retrieves a <code>sap.f.SemanticTitle</code> instance.
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
	* Retrieves a <code>sap.f.SemanticShareMenu</code> instance.
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
	* Retrieves a <code>sap.m.ActionSheet</code> instance.
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
	* Retrieves a <code>sap.f.SemanticFooter</code> instance.
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
	* used for <code>footer</code> aggregation of the <code>sap.f.DynamicPage</code>.
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
	* Cleans references of the used objects and destroys them.
	*
	* @private
	*/
	SemanticPage.prototype._cleanMemory = function() {
		if (this._oShareMenu) {
			this._oShareMenu.destroy();
			this._oShareMenu = null;
		}

		if (this._oActionSheet) {
			this._oActionSheet.destroy();
			this._oActionSheet = null;
		}

		if (this._oSemanticTitle) {
			this._oSemanticTitle.destroy();
			this._oSemanticTitle = null;
		}

		if (this._oDynamicPageTitle) {
			this._oDynamicPageTitle.destroy();
			this._oDynamicPageTitle = null;
		}

		if (this._oDynamicPageHeader) {
			this._oDynamicPageHeader.destroy();
			this._oDynamicPageHeader = null;
		}

		if (this._oSemanticFooter) {
			this._oSemanticFooter.destroy();
			this._oSemanticFooter = null;
		}

		if (this._oDynamicPageFooter) {
			this._oDynamicPageFooter.destroy();
			this._oDynamicPageFooter = null;
		}

		if (this._oOverflowToolbar) {
			this._oOverflowToolbar.destroy();
			this._oOverflowToolbar = null;
		}
	};

	return SemanticPage;

});