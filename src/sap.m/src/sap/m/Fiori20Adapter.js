/*!
 * ${copyright}
 */

// Provides class sap.m.Fiori20Adapter
sap.ui.define([
	'sap/ui/base/Object',
	'sap/ui/base/EventProvider',
	'sap/ui/base/ManagedObjectObserver',
	'sap/ui/Device',
	"sap/base/Log",
	"sap/ui/thirdparty/jquery"
],
	function(BaseObject, EventProvider, ManagedObjectObserver, Device, Log, jQuery) {
	"use strict";

	var oEventProvider = new EventProvider(),
		oInfoToMerge,
		oChangeListeners,
		sCurrentlyAdaptedTopNavigableViewId;


	/**
	 * Static class that contains all the logic for adapting a page header
	 *
	 *
	 * @class text
	 * @version ${version}
	 * @private
	 * @since 1.38
	 * @alias HeaderAdapter
	 */
	var HeaderAdapter = BaseObject.extend("HeaderAdapter", {

		constructor : function(oHeader, oAdaptOptions) {

			if (!oHeader || !oAdaptOptions) {
				Log.error("Cannot initialize: Invalid arguments.");
				return;
			}

			this._oHeader = oHeader;
			this._oStyledPage = null;
			this._oTitleInfo = null;
			this._oSubTitleInfo = null;
			this._oBackButtonInfo = null;
			this._oAdaptOptions = oAdaptOptions;
		}
	});

	HeaderAdapter.prototype.adapt = function() {

		var bStylePage = this._oAdaptOptions.bStylePage,
			bCollapseHeader = this._oAdaptOptions.bCollapseHeader;

		if (bStylePage) {
			this._toggleStyle("sapF2Adapted", true, true /* suppress invalidate */);
		}

		this._adaptTitle();
		this._adaptBackButton();

		if (bCollapseHeader) {
			this._collapseHeader();
		}

		// let children know if adaptation was already applied
		// to avoid redundant processing
		return this.getAdaptedContent();
	};

	HeaderAdapter.prototype.getAdaptedContent = function() {
		return {
			oTitleInfo: this._oTitleInfo,
			oSubTitleInfo: this._oSubTitleInfo,
			oBackButtonInfo: this._oBackButtonInfo,
			oStyledPage: this._oStyledPage
		};
	};

	HeaderAdapter.prototype._adaptTitle = function() {

		if (!HeaderAdapter._isAdaptableHeader(this._oHeader) || this._oAdaptOptions.bMoveTitle !== true) {
			return false;
		}

		this._oTitleInfo = this._detectTitle();
		this._oSubTitleInfo = this._detectSubTitle();
		var bSuccess = !!this._oTitleInfo || !!this._oSubTitleInfo;

		if (this._oTitleInfo) {
			this._oTitleInfo.oControl.toggleStyleClass("sapF2AdaptedTitle", true);
		}

		return bSuccess;
	};

	HeaderAdapter.prototype._adaptBackButton = function() {

		if (!HeaderAdapter._isAdaptableHeader(this._oHeader) || this._oAdaptOptions.bHideBackButton !== true) {
			return false;
		}

		var bHideBackButton, bBackButtonHidden = false;

		this._oBackButtonInfo = this._detectBackButton();

		if (this._oBackButtonInfo) {
			bHideBackButton = this._oBackButtonInfo.oControl.getVisible();
			this._oBackButtonInfo.oControl.toggleStyleClass("sapF2AdaptedNavigation", bHideBackButton);
			bBackButtonHidden = true;
		}
		return bBackButtonHidden;
	};

	HeaderAdapter.prototype._toggleStyle = function(sStyleClass, bAdd, bSuppressInvalidate) {
		var oPage = this._oHeader.getParent();
		if (!oPage) {
			return;
		}
		this._oStyledPage = oPage;

		if (bAdd === true) {
			oPage.addStyleClass(sStyleClass, bSuppressInvalidate);
		} else if (bAdd === false) {
			oPage.removeStyleClass(sStyleClass, bSuppressInvalidate);
		} else if (bAdd === undefined) {
			oPage.hasStyleClass(sStyleClass) ? oPage.removeStyleClass(sStyleClass, bSuppressInvalidate) : oPage.addStyleClass(sStyleClass, bSuppressInvalidate);
		}
	};

	HeaderAdapter._isAdaptableHeader = function(oHeader) {
		if (!oHeader || !isInstanceOf(oHeader, "sap/m/Bar")) {
			return false;
		}
		var oParent = oHeader.getParent();
		return oParent && (isInstanceOf(oParent, "sap/m/Page") || isInstanceOf(oParent, "sap/m/MessagePage") || isInstanceOf(oParent, "sap/uxap/ObjectPageHeader"));
	};

	HeaderAdapter.prototype._detectTitle = function() {
		var oTitleInfo;

		if (HeaderAdapter._isAdaptableHeader(this._oHeader)) {
			var aMiddleContent = this._oHeader.getContentMiddle();
			if (aMiddleContent.length === 1 && isTextualControl(aMiddleContent[0])) {
				var oTitle = aMiddleContent[0];
				oTitleInfo = {
					id: oTitle.getId(),
					text: oTitle.getText(),
					oControl: oTitle,
					sChangeEventId: "_change",
					sPropertyName: "text"
				};
			}
		}

		return oTitleInfo;
	};

	HeaderAdapter.prototype._detectSubTitle = function(oPage) {

		if (isInstanceOf(oPage, "sap/uxap/ObjectPageHeader")) {
			var oHeaderTitle = oPage.getHeaderTitle();
			if (oHeaderTitle){
				return {
					id: oHeaderTitle.getId(),
					text: oHeaderTitle.getObjectTitle(),
					oControl: oHeaderTitle,
					sChangeEventId: "_titleChange",
					sPropertyName: "objectTitle"
				};
			}
		}
	};

	HeaderAdapter.prototype._detectBackButton = function() {
		var aBeginContent, oBackButton;

		if (HeaderAdapter._isAdaptableHeader(this._oHeader)) {
			aBeginContent = this._oHeader.getContentLeft();
			if (aBeginContent.length > 0 && isInstanceOf(aBeginContent[0], "sap/m/Button") &&
				(aBeginContent[0].getType() === "Back" || aBeginContent[0].getType() === "Up" || aBeginContent[0].getIcon() === "sap-icon://nav-back")) {
				oBackButton = aBeginContent[0];
				return {
					id: oBackButton.getId(),
					oControl: oBackButton,
					sChangeEventId: "_change",
					sPropertyName: "visible"
				};
			}
		}
	};

	HeaderAdapter.prototype._collapseHeader = function() {

		var bTitleHidden = this._oTitleInfo,
			bBackButtonHidden = this._oBackButtonInfo,
			aBeginContent,
			aMiddleContent,
			aEndContent,
			bBeginContentHidden,
			bMiddleContentHidden,
			bEndContentHidden,
			bAllContentHidden;

		if (HeaderAdapter._isAdaptableHeader(this._oHeader)) {
			aBeginContent = this._oHeader.getContentLeft();
			aMiddleContent = this._oHeader.getContentMiddle();
			aEndContent = this._oHeader.getContentRight();

			bBeginContentHidden = (aBeginContent.length === 1) && (isHiddenFromAPI(aBeginContent[0]) || bBackButtonHidden);
			bMiddleContentHidden = (aMiddleContent.length === 1) && (isHiddenFromAPI(aMiddleContent[0]) || bTitleHidden);
			bEndContentHidden = (aEndContent.length === 1) && isHiddenFromAPI(aEndContent[0]);

			bAllContentHidden = (aBeginContent.length === 0 || bBeginContentHidden) &&
				(aMiddleContent.length === 0 || bMiddleContentHidden) &&
				((aEndContent.length === 0) || bEndContentHidden);

			this._toggleStyle("sapF2CollapsedHeader", bAllContentHidden, true);
		}
	};


	/**
	 * Constructor for an sap.m.Fiori20Adapter.
	 *
	 * @class text
	 * @version ${version}
	 * @private
	 * @since 1.38
	 * @alias sap.m.Fiori20Adapter
	 */
	var Fiori20Adapter =  BaseObject.extend("sap.m.Fiori20Adapter", {});

	Fiori20Adapter.attachViewChange = function(fnListener, oListener) {
		oEventProvider.attachEvent("adaptedViewChange", fnListener, oListener);
	};

	Fiori20Adapter.detachViewChange = function(fnListener, oListener) {
		oEventProvider.detachEvent("adaptedViewChange", fnListener, oListener);
	};

	Fiori20Adapter.traverse = function(oComponentRoot, oAdaptOptions) {

		/* cache of intermediate adaptation results
		 of the current component
		 used in case user re-visits an already adapted view */
		oInfoToMerge = {
			aViewTitles: {},
			aViewSubTitles: {},
			aViewBackButtons: {}
		};

		oChangeListeners = {};
		sCurrentlyAdaptedTopNavigableViewId = null;

		this._doBFS([{
			oNode: oComponentRoot,
			oAdaptOptions: oAdaptOptions
		}]);

		if (this._getCurrentlyAdaptedTopViewId()) {
			this._fireViewChange(this._getCurrentlyAdaptedTopViewId(), oAdaptOptions);
		}
	};

	/**
	 * Does breath-first search of the control tree
	 */
	Fiori20Adapter._doBFS = function(aQueue) {

		var oNext = aQueue.shift();
		if (!oNext) {
			return;
		}

		var oNode = oNext.oNode,
			oAdaptOptions = oNext.oAdaptOptions,
			iSearchDepth = oAdaptOptions.iSearchDepth;

		oAdaptOptions = this._applyRules(oAdaptOptions, oNode); //apply semantic rules specific to controls

		if (!this._isAdaptationRequired(oNode, oAdaptOptions) || (iSearchDepth <= 0)) {
			return;
		}

		var bIsTopNavigableView = this._isTopNavigableView(oNode);
		if (bIsTopNavigableView) {
			this._setAsCurrentlyAdaptedTopViewId(oNode.getId());
		}

		var oNodeAdaptationResult = this._processNode(oNode, oAdaptOptions);

		var aChildren = this._getNodeChildren(oNode),
			childAdaptOptions = jQuery.extend({}, oAdaptOptions, {iSearchDepth: this._updateSearchDepth(iSearchDepth, oNode)});

		if (oNodeAdaptationResult) {
			var bTitleHidden = !!oNodeAdaptationResult.oTitleInfo,
			bBackButtonHidden = !!oNodeAdaptationResult.oBackButton,
			bPageStyled = !!oNodeAdaptationResult.oStyledPage;

			childAdaptOptions = jQuery.extend(childAdaptOptions, {
				bMoveTitle: oAdaptOptions.bMoveTitle && !bTitleHidden,
				bHideBackButton: oAdaptOptions.bHideBackButton && !bBackButtonHidden,
				bStylePage: oAdaptOptions.bStylePage && !bPageStyled
			});
		}

		aChildren.forEach(function(oChild) {
			if (oChild) {
				aQueue.push({
					oNode: oChild,
					oAdaptOptions: childAdaptOptions
				});
			}
		});

		this._doBFS(aQueue); // synchronous
	};

	Fiori20Adapter._processNode = function(oControl, oAdaptOptions) {

		// attach listeners to re-trigger adaptation when content is added at a later stage
		this._attachDefferedAdaptationListeners(oControl, oAdaptOptions);

		if (HeaderAdapter._isAdaptableHeader(oControl)) {
			return this._adaptHeader(oControl, oAdaptOptions);
		}
		if (oControl.getParent() && isInstanceOf(oControl.getParent(), "sap/m/NavContainer")) {
			return this._getCachedViewInfoToMerge(oControl.getId()); //if already adapted in earlier navigation
		}
	};

	Fiori20Adapter._attachDefferedAdaptationListeners = function(oControl, oAdaptOptions) {

		this._attachAdaptableContentChange(oControl, oAdaptOptions);

		this._attachNavigablePageChange(oControl, oAdaptOptions);

		if (isInstanceOf(oControl, "sap/m/Page") || isInstanceOf(oControl, "sap/ui/core/mvc/XMLView")) {
			this._observeAddAggregation(oControl, "content", oAdaptOptions);
		}

		if (isInstanceOf(oControl, "sap/m/NavContainer")) {
			this._observeRemoveAggregation(oControl, "pages", oAdaptOptions);
		}

		if ((oAdaptOptions.bLateAdaptation === true) && isInstanceOf(oControl, "sap/m/Bar")) {
			this._observeAddAggregation(oControl, "contentLeft", oAdaptOptions, oControl);
			this._observeAddAggregation(oControl, "contentMiddle", oAdaptOptions, oControl);
			this._observeAddAggregation(oControl, "contentRight", oAdaptOptions, oControl);
		}

		// special case
		if (isInstanceOf(oControl, "sap/ui/core/ComponentContainer")) {
			var oComp = oControl.getComponentInstance();
			if (!oComp && oControl.getName() && !oControl.getDomRef()) {
				//Component not yet initialized -> try again later
				var that = this;
				var oDelegate = {
					onBeforeRendering: function() {
						oControl.removeEventDelegate(oDelegate);
						that._doBFS([{ // scan [for adaptable content] the newly added subtree
							oNode: oControl.getComponentInstance(),
							oAdaptOptions: oAdaptOptions
						}]);
						if (that._getCurrentlyAdaptedTopViewId()) {
							that._fireViewChange(that._getCurrentlyAdaptedTopViewId(), oAdaptOptions);
						}
					}
				};
				oControl.addEventDelegate(oDelegate, this);
			}
		}
	};

	Fiori20Adapter._checkHasListener = function(oControl, sEventType) {
		var oControlListeners = oChangeListeners[oControl.getId()];
		return oControlListeners && oControlListeners[sEventType];
	};

	Fiori20Adapter._setHasListener = function(oControl, sEventType, fnListener) {
		var oControlListeners = oChangeListeners[oControl.getId()];
		if (!oControlListeners) {
			oControlListeners = {};
			oChangeListeners[oControl.getId()] = oControlListeners;
		}
		oControlListeners[sEventType] = fnListener;
	};

	// attaches listener for changes in the adaptable content
	Fiori20Adapter._attachAdaptableContentChange = function(oControl, oAdaptOptions) {

		if (!oControl._getAdaptableContent || !jQuery.isFunction(oControl._getAdaptableContent)) {
			return;
		}

		if (this._checkHasListener(oControl, "_adaptableContentChange")) { // already attached
			return;
		}

		var oOwnerViewId = this._getCurrentlyAdaptedTopViewId();
		var fnOnAdaptableContentChange = function(oEvent) {
			var oChangedContent = oEvent.getParameter("adaptableContent");
			this._setAsCurrentlyAdaptedTopViewId(oOwnerViewId); // restore the view context (so that any findings are saved as belonging to that view)
			this._doBFS([{ // scan [for adaptable content] the newly added subtree
				oNode: oChangedContent,
				oAdaptOptions: oAdaptOptions
			}]);
			if (this._getCurrentlyAdaptedTopViewId()) {
				this._fireViewChange(this._getCurrentlyAdaptedTopViewId(), oAdaptOptions);
			}
		}.bind(this);

		oControl.attachEvent("_adaptableContentChange", fnOnAdaptableContentChange);

		this._setHasListener(oControl, "_adaptableContentChange", fnOnAdaptableContentChange);
	};

	// attaches listener for changes in the nav container current page
	Fiori20Adapter._attachNavigablePageChange = function(oControl, oAdaptOptions) {

		if (!isInstanceOf(oControl, "sap/m/NavContainer")) {
			return;
		}

		if (this._checkHasListener(oControl, "navigate")) {
			return;
		}

		var fnOnNavigate = function(oEvent){
			var oNode = oEvent.getParameter("to");
			oAdaptOptions = this._applyRules(oAdaptOptions, oNode); //update the context-specific options

			this._doBFS([{ // scan [for adaptable content] the newly added subtree
				oNode: oNode,
				oAdaptOptions: oAdaptOptions
			}]);
			if (this._getCurrentlyAdaptedTopViewId()) {
				this._fireViewChange(this._getCurrentlyAdaptedTopViewId(), oAdaptOptions);
			}
		}.bind(this);

		oControl.attachNavigate(fnOnNavigate);

		this._setHasListener(oControl, "navigate", fnOnNavigate);
	};

	Fiori20Adapter._observeAddAggregation = function(oControl, sAggregationName, oAdaptOptions, oControlToRescan) {

		if (this._checkHasListener(oControl, sAggregationName)) {
			return;
		}

		var oOwnerViewId = this._getCurrentlyAdaptedTopViewId(),
			fnOnModifyAggregation = function(oChanges) {
				var sMutation = oChanges.mutation,
					oChild = oChanges.object;

				if ((sMutation === "add") || (sMutation === "insert")) {

						this._setAsCurrentlyAdaptedTopViewId(oOwnerViewId); // restore the view context (so that any findings are saved as belonging to that view)
						this._doBFS([{ // scan [for adaptable content] the newly added subtree
							oNode: oControlToRescan ? oControlToRescan : oChild,
							oAdaptOptions: oAdaptOptions
						}]);
						if (this._getCurrentlyAdaptedTopViewId()) {
							this._fireViewChange(this._getCurrentlyAdaptedTopViewId(), oAdaptOptions);
						}
				}
			}.bind(this),
			oObserver = new ManagedObjectObserver(fnOnModifyAggregation);

		oObserver.observe(oControl, {
			aggregations: [sAggregationName]
		});

		this._setHasListener(oControl, sAggregationName, oObserver);
	};

	Fiori20Adapter._observeRemoveAggregation = function(oControl, sAggregationName, oAdaptOptions) {

		if (this._checkHasListener(oControl, sAggregationName)) {
			return;
		}

		var oObserver = new ManagedObjectObserver(this._onRemoveAggregation.bind(this));

		oObserver.observe(oControl, {
			aggregations: [sAggregationName]
		});

		this._setHasListener(oControl, sAggregationName, oObserver);
	};

	Fiori20Adapter._removeFromMergeInfo = function(oMergeInfo, oControl) {
		Object.keys(oMergeInfo).forEach(function(sKey) {
			var oControlInfo = oMergeInfo[sKey];
			if ((oControlInfo.oControl === oControl)
				|| isChildOf(oControlInfo.oControl, oControl)) {
				this._detachAllListeners(oControlInfo.oControl);
				delete oMergeInfo[sKey];
			}
		}, this);
	};

	Fiori20Adapter._detachAllListeners = function(oControl) {
		var oControlListeners = oChangeListeners[oControl.getId()];
		if (!oControlListeners) {
			return;
		}
		Object.keys(oControlListeners).forEach(function(sEventType) {
			var fnListener = oControlListeners[sEventType];
			if (fnListener instanceof  ManagedObjectObserver) {
				fnListener.disconnect();
			} else {
				oControl.detachEvent(sEventType, fnListener);
			}
			delete oControlListeners[sEventType];
		});
	};

	Fiori20Adapter._onRemoveAggregation = function(oChanges) {
		var sMutation = oChanges.mutation,
			oRemovedControl;

		if (sMutation === "remove") {
			oRemovedControl = oChanges.child;

			this._detachAllListeners(oRemovedControl);
			this._removeFromMergeInfo(oInfoToMerge.aViewTitles, oRemovedControl);
			this._removeFromMergeInfo(oInfoToMerge.aViewSubTitles, oRemovedControl);
			this._removeFromMergeInfo(oInfoToMerge.aViewBackButtons, oRemovedControl);
		}
	};

	Fiori20Adapter._getNodeChildren = function(oControl) {

		if (oControl._getAdaptableContent && jQuery.isFunction(oControl._getAdaptableContent)) {
			var aChildren = [oControl._getAdaptableContent()];
			if (isInstanceOf(oControl, "sap/m/Page")) {
				aChildren = aChildren.concat(oControl.getContent()); //page content can contain other pages that are subject to adaptation
			}
			return aChildren;
		}

		if (isInstanceOf(oControl, "sap/m/SplitContainer")) {
			return [].concat(oControl.getAggregation("_navMaster"), oControl.getAggregation("_navDetail"));
		}

		if (isInstanceOf(oControl, "sap/uxap/ObjectPageLayout")) {
			return [oControl.getHeaderTitle()];
		}

		if (isInstanceOf(oControl, "sap/ui/core/ComponentContainer")) {
			return [oControl.getComponentInstance()];
		}

		if (isInstanceOf(oControl, "sap/ui/core/UIComponent")) {
			return [oControl.getAggregation("rootControl")];
		}

		return oControl.findAggregatedObjects(false, isNonDependentObject); /* skip objects added via Element.prototype.addDependent e.g. dialogs, since this is not nested content */
	};

	Fiori20Adapter._updateSearchDepth = function(iSearchDepth, oControl) {

		if (isInstanceOf(oControl, "sap/ui/core/mvc/View")
				|| isInstanceOf(oControl, "sap/ui/core/Component")
				|| isInstanceOf(oControl, "sap/ui/core/ComponentContainer")) { /* Do not decrease level for views or components/componentContainers */
			return iSearchDepth;
		}
		return iSearchDepth - 1;
	};

	Fiori20Adapter._getTotalCachedInfoToMerge = function(sViewId) {
		var oView = sap.ui.getCore().byId(sViewId),
			oCachedViewInfo = this._getCachedViewInfoToMerge(sViewId),
			isMasterView,
			isDetailView,
			sSiblingView,
			sSiblingViewId,
			oSplitContainer,
			oParentNavContainer,
			oCachedSiblingViewInfo;

		// if this view is part of top-level split-view => merge with info for the sibling view
		if (!Device.system.phone && this._isTopSplitContainerSubView(oView)) {
			oParentNavContainer = oView.getParent();
			oSplitContainer = oParentNavContainer && oParentNavContainer.getParent();

			if (oSplitContainer) {
				// find which part (master or detail) the view belongs to:
				// => check if its a child of the master or detail navContainer
				// (we cannot determine it by checking if it is part of the <code>masterPages</code> or <code>detailPages</code> aggregations of the <code>splitContainer</code>,
				// because at this [early] stage the view may not be internally registered there yet, but only in its immediate parent aggregation)
				isMasterView = oSplitContainer._oMasterNav && (oSplitContainer._oMasterNav.getId() === oParentNavContainer.getId());
				isDetailView = oSplitContainer._oDetailNav && (oSplitContainer._oDetailNav.getId() === oParentNavContainer.getId());
			}
		}

		if (isMasterView) { // merge with detail-part info
			sSiblingView = oSplitContainer.getCurrentDetailPage();
			sSiblingViewId = sSiblingView && sSiblingView.getId();
			oCachedSiblingViewInfo = this._getCachedViewInfoToMerge(sSiblingViewId);
			oCachedViewInfo = this._mergeSplitViewInfos(oCachedViewInfo, oCachedSiblingViewInfo);
		}
		if (isDetailView) { // merge with master-part info
			sSiblingView = oSplitContainer.getCurrentMasterPage();
			sSiblingViewId = sSiblingView && sSiblingView.getId();
			oCachedSiblingViewInfo = this._getCachedViewInfoToMerge(sSiblingViewId);
			oCachedViewInfo = this._mergeSplitViewInfos(oCachedSiblingViewInfo, oCachedViewInfo);
		}

		oCachedViewInfo.sViewId = (isMasterView || isDetailView) ? oSplitContainer.getId() : sViewId;

		return oCachedViewInfo;
	};

	Fiori20Adapter._isTopSplitContainerSubView = function(oControl) {
		var oParent = oControl && oControl.getParent();

		return this._isTopmostNavContainer(oParent) && isInstanceOf(oParent.getParent(), "sap/m/SplitContainer");
	};

	Fiori20Adapter._mergeSplitViewInfos = function(oMasterViewInfo, oDetailViewInfo) {
		jQuery.each(oMasterViewInfo, function(sKey, sValue) {
			oMasterViewInfo[sKey] = sValue || oDetailViewInfo[sKey]; // detail info complements master info where master info is absent
		});
		return oMasterViewInfo;
	};

	Fiori20Adapter._getCachedViewInfoToMerge = function(sViewId) {

		var oBackButton = (oInfoToMerge.aViewBackButtons[sViewId]) //skip currently invisible buttons as the app has currently excluded them from the app logic
			? oInfoToMerge.aViewBackButtons[sViewId].oControl
			: undefined;
		return {
			oTitleInfo: oInfoToMerge.aViewTitles[sViewId],
			oSubTitleInfo: oInfoToMerge.aViewSubTitles[sViewId],
			oBackButton: oBackButton
		};
	};

	/**
	 * Apply adaptation rules that are context-specific
	 */
	Fiori20Adapter._applyRules = function(oAdaptOptions, oControl) {

		var oParent = oControl.getParent();
		/**
		 * Adaptation rules for children of the SplitContainer
		 */
		if (isInstanceOf(oParent, "sap/m/SplitContainer")) {

			var bIsPhone = Device.system.phone,
				bMoveTitle = oAdaptOptions.bMoveTitle,
				bAdaptChildBackButton = oAdaptOptions.bHideBackButton;
			/**
			 * Rule1: In split-screen, adapt title only on phone
			 */
			if (bMoveTitle) {
				bMoveTitle = bIsPhone;
			}
			/**
			 * Rule2: In split-screen, adapt back button only in the following cases:
			 * 2.1. - on phone
			 * 2.2. - on the desktop initial page of either master/detail part
			 */
			if (bAdaptChildBackButton && !Device.system.phone) {
				bAdaptChildBackButton = 'initialPage';
			}

			return jQuery.extend({}, oAdaptOptions, {
				bMoveTitle: bMoveTitle,
				bHideBackButton: bAdaptChildBackButton});
		}

		/**
		 * Adaptation rules for children of the NavContainer
		 */
		if (isInstanceOf(oParent, "sap/m/NavContainer")) {

			// this is Rule2.2 from above (desktop scenario)
			if (oAdaptOptions.bHideBackButton === 'initialPage') {
				var bIsInitialPage = oParent._getActualInitialPage() && (oParent._getActualInitialPage().getId() === oControl.getId());

				return jQuery.extend({}, oAdaptOptions, {
					bHideBackButton: bIsInitialPage});
			}
		}

		if ((oAdaptOptions.bMoveTitle === false) || (oAdaptOptions.bHideBackButton === false)) {
			return jQuery.extend({}, oAdaptOptions, {
				bCollapseHeader: false});
		}

		return oAdaptOptions;
	};

	Fiori20Adapter._getCurrentlyAdaptedTopViewId = function() {
		return sCurrentlyAdaptedTopNavigableViewId;
	};

	Fiori20Adapter._setAsCurrentlyAdaptedTopViewId = function(sViewId) {
		sCurrentlyAdaptedTopNavigableViewId = sViewId;
	};

	Fiori20Adapter._isTopNavigableView = function(oNode) {
		var oParent = oNode.getParent();
		return oParent && this._isTopmostNavContainer(oParent);
	};

	Fiori20Adapter._isTopmostNavContainer = function(oControl) {

		var oCurrentTopNavContainer,
			oNext = oControl;

		while (oNext) {
			if (isInstanceOf(oNext, "sap/m/NavContainer")) {
				oCurrentTopNavContainer = oNext;
			}
			oNext = oNext.getParent();
		}

		return oCurrentTopNavContainer && (oCurrentTopNavContainer.getId() === oControl.getId());
	};

	Fiori20Adapter._adaptHeader = function(oHeader, oAdaptOptions) {

		if (!oHeader || !oAdaptOptions) {
			return;
		}
		var oHeaderAdapter = new HeaderAdapter(oHeader, oAdaptOptions),
			oAdaptedContent = oHeaderAdapter.adapt();

		var sTopViewId = this._getCurrentlyAdaptedTopViewId();

		/* cache the identified title */
		if (oAdaptedContent.oTitleInfo) {
			oInfoToMerge.aViewTitles[sTopViewId] = oAdaptedContent.oTitleInfo;
			this._registerTextChangeListener(oInfoToMerge.aViewTitles, sTopViewId, oAdaptOptions);
		}

		/* cache the identified subTitle */
		if (oAdaptedContent.oSubTitleInfo) {
			oInfoToMerge.aViewSubTitles[sTopViewId] = oAdaptedContent.oSubTitleInfo;
			this._registerTextChangeListener(oInfoToMerge.aViewSubTitles, sTopViewId, oAdaptOptions);
		}

		/* cache the identified backButton */
		if (oAdaptedContent.oBackButtonInfo) {
			if (oAdaptedContent.oBackButtonInfo.oControl.getVisible()) {
				oInfoToMerge.aViewBackButtons[sTopViewId] = oAdaptedContent.oBackButtonInfo;
			}
			this._registerVisibilityChangeListener(oAdaptedContent.oBackButtonInfo, oInfoToMerge.aViewBackButtons, sTopViewId, oAdaptOptions);
		}

		return oAdaptedContent;
	};

	Fiori20Adapter._registerTextChangeListener = function(aTitleInfoCache, sViewId, oAdaptOptions) {

		var oTitleInfo = aTitleInfoCache[sViewId]; //get the cached titleInfo for the given view

		if (oTitleInfo && oTitleInfo.oControl && oTitleInfo.sChangeEventId) {

			if (this._checkHasListener(oTitleInfo.oControl, oTitleInfo.sChangeEventId)) {
				return;
			}
			var fnChangeListener = function (oEvent) {
				var oTitleInfo = aTitleInfoCache[sViewId];
				if (oEvent.getParameter("name") !== oTitleInfo.sPropertyName) {
					return; // different property changed
				}
				oTitleInfo.text = oEvent.getParameter("newValue");
				this._fireViewChange(sViewId, oAdaptOptions);
			}.bind(this);

			oTitleInfo.oControl.attachEvent(oTitleInfo.sChangeEventId, fnChangeListener);
			this._setHasListener(oTitleInfo.oControl, oTitleInfo.sChangeEventId, fnChangeListener);
		}
	};

	Fiori20Adapter._registerVisibilityChangeListener = function(oControlInfo, aControlInfoCache, sViewId, oAdaptOptions) {

		var bVisible;

		if (oControlInfo && oControlInfo.oControl && oControlInfo.sChangeEventId) {

			if (this._checkHasListener(oControlInfo.oControl, oControlInfo.sChangeEventId)) {
				return;
			}

			var fnChangeListener = function (oEvent) {
				if (oEvent.getParameter("name") !== oControlInfo.sPropertyName) {
					return; // different property changed
				}
				bVisible = oEvent.getParameter("newValue"); //actualize the value
				if (!bVisible) {
					jQuery.each(aControlInfoCache, function(iIndex, oCachedControlInfo) {
						if (oCachedControlInfo.oControl.getId() === oControlInfo.oControl.getId()) {
							delete aControlInfoCache[iIndex];
						}
					});
				}

				var oParentControl = oControlInfo.oControl.getParent();
				if (HeaderAdapter._isAdaptableHeader(oParentControl)) { // the parent is still an adaptable header
					Fiori20Adapter._adaptHeader(oParentControl, oAdaptOptions); // re-adapt as visibility of inner content changed
					this._fireViewChange(sViewId, oAdaptOptions);
				}
			}.bind(this);

			oControlInfo.oControl.attachEvent(oControlInfo.sChangeEventId, fnChangeListener);
			this._setHasListener(oControlInfo.oControl, oControlInfo.sChangeEventId, fnChangeListener);
		}
	};

	Fiori20Adapter._fireViewChange = function(sViewId, oAdaptOptions) {
		var oToMerge = this._getTotalCachedInfoToMerge(sViewId);
		oToMerge.oAdaptOptions = oAdaptOptions;
		oEventProvider.fireEvent("adaptedViewChange", oToMerge);
	};


	Fiori20Adapter._isAdaptationRequired = function(oNode, oAdaptOptions) {
		if (!oNode || this._isNonAdaptableControl(oNode)) {
			return false;
		}

		for (var sOption in oAdaptOptions) {
			if (oAdaptOptions.hasOwnProperty(sOption)
			&& ((oAdaptOptions[sOption] === true) || (oAdaptOptions[sOption] === "initialPage"))) {
				return true;
			}
		}
		return false;
	};

	Fiori20Adapter._isNonAdaptableControl = function(oControl) {
		return isListBasedControl(oControl);
	};

	// utility function
	function isTextualControl (oControl) {
		return isInstanceOfGroup(oControl, ["sap/m/Label", "sap/m/Text", "sap/m/Title"]);
	}

	function isListBasedControl (oControl) {
		return isInstanceOfGroup(oControl, ["sap/m/List", "sap/m/Table", "sap/ui/table/Table", "sap/ui/table/TreeTable"]);
	}

	function isInstanceOfGroup(oControl, aTypes) {
		if (!oControl || !aTypes) {
			return;
		}

		return aTypes.some(function(sType) {
			return isInstanceOf(oControl, sType);
		});
	}

	function isInstanceOf (oControl, sType) {
		var oType = sap.ui.require(sType);
		return oType && (oControl instanceof oType);
	}

	function isNonDependentObject(oObject) {
		return oObject && (oObject.sParentAggregationName !== "dependents");
	}

	function isHiddenFromAPI(oObject) {
		return oObject && (typeof oObject.getVisible === "function") && (oObject.getVisible() === false);
	}

	function isChildOf(oControl, oRoot) {
		var oParent = oControl && oControl.getParent();
		while (oParent) {
			if (oParent === oRoot) {
				return true;
			}
			oParent = oParent.getParent();
		}
		return false;
	}
	return Fiori20Adapter;

});