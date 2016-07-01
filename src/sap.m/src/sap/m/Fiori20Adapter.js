/*!
 * ${copyright}
 */

/**
 * Fiori20Adapter
 *
 * @namespace
 * @name sap.m
 */

// Provides class sap.m.Fiori20Adapter
sap.ui.define(['jquery.sap.global', 'sap/ui/base/Object', 'sap/ui/base/EventProvider'],
	function(jQuery,  Object, EventProvider) {
	"use strict";

	var oEventProvider = new EventProvider(),
		oAdaptationResult,
		aCurrentViewPath;


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
	var HeaderAdapter = Object.extend("HeaderAdapter", {

		constructor : function(oHeader, oAdaptOptions) {

			if (!oHeader || !oAdaptOptions) {
				jQuery.sap.log.error("Cannot initialize: Invalid arguments.");
				return;
			}

			this._oHeader = oHeader;
			this._oStyledPage = null;
			this._oTitleInfo = null;
			this._oSubTitleInfo = null;
			this._oBackButton = null;
			this._oAdaptOptions = oAdaptOptions;
		}
	});

	HeaderAdapter.prototype.adapt = function() {

		var bStylePage = this._oAdaptOptions.bStylePage,
			bCollapseHeader = this._oAdaptOptions.bCollapseHeader;

		if (bStylePage) {
			this._adaptStyle("sapF2Adapted");
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
			oBackButton: this._oBackButton,
			oStyledPage: this._oStyledPage
		};
	};

	HeaderAdapter.prototype._adaptTitle = function() {

		if (!HeaderAdapter._isStandardHeader(this._oHeader) || this._oAdaptOptions.bMoveTitle !== true) {
			return false;
		}

		this._oTitleInfo = this._detectTitle();
		this._oSubTitleInfo = this._detectSubTitle();
		var bSuccess = !!this._oTitleInfo || !!this._oSubTitleInfo;

		if (this._oTitleInfo) {
			this._oTitleInfo.oControl.addStyleClass("sapF2AdaptedTitle");
		}

		return bSuccess;
	};

	HeaderAdapter.prototype._adaptBackButton = function() {

		if (!HeaderAdapter._isStandardHeader(this._oHeader) || this._oAdaptOptions.bHideBackButton !== true) {
			return false;
		}

		var bBackButtonHidden = false;

		this._oBackButton = this._detectBackButton();

		if (this._oBackButton) {
			this._oBackButton.addStyleClass("sapF2AdaptedNavigation");
			bBackButtonHidden = true;
		}
		return bBackButtonHidden;
	};

	HeaderAdapter.prototype._adaptStyle = function(sClass) {
		var oPage = this._oHeader.getParent();
		if (oPage) {
			oPage.addStyleClass(sClass, true);
			this._oStyledPage = oPage;
		}
	};

	HeaderAdapter._isStandardHeader = function(oHeader) {
		return oHeader && isInstanceOf(oHeader, "sap/m/Bar");
	};

	HeaderAdapter.prototype._detectTitle = function() {
		var oTitleInfo;

		if (HeaderAdapter._isStandardHeader(this._oHeader)) {
			var aMiddleContent = this._oHeader.getContentMiddle();
			if (aMiddleContent.length === 1 && isTextualControl(aMiddleContent[0])) {
				var oTitle = aMiddleContent[0];
				oTitleInfo = {
					id: oTitle.getId(),
					text: oTitle.getText(),
					oControl: oTitle,
					sChangeEventId: "_change"
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
					sChangeEventId: "_titleChange"
				};
			}
		}
	};

	HeaderAdapter.prototype._detectBackButton = function() {

		if (HeaderAdapter._isStandardHeader(this._oHeader)) {
			var aBeginContent = this._oHeader.getContentLeft();
			if (aBeginContent.length > 0 && isInstanceOf(aBeginContent[0], "sap/m/Button") &&
				(aBeginContent[0].getType() === "Back" || aBeginContent[0].getType() === "Up" || aBeginContent[0].getIcon() === "sap-icon://nav-back")) {
				return aBeginContent[0];
			}
		}
	};

	HeaderAdapter.prototype._collapseHeader = function() {

		var bTitleHidden = this._oTitleInfo,
			bBackButtonHidden = this._oBackButton;

		if (HeaderAdapter._isStandardHeader(this._oHeader)) {
			var aBeginContent = this._oHeader.getContentLeft();
			var aMiddleContent = this._oHeader.getContentMiddle();
			var aEndContent = this._oHeader.getContentRight();
			if ((aBeginContent.length === 0 || (aBeginContent.length === 1 && bBackButtonHidden)) &&
				(aMiddleContent.length === 0 || (aMiddleContent.length === 1 && bTitleHidden)) &&
				(aEndContent.length === 0)) {
				this._adaptStyle("sapF2CollapsedHeader");
			}
		}
	};


	/**
	 * Constructor for a sap.m.Fiori20Adapter.
	 *
	 * @class text
	 * @version ${version}
	 * @private
	 * @since 1.38
	 * @alias sap.m.Fiori20Adapter
	 */
	var Fiori20Adapter =  Object.extend("sap.m.Fiori20Adapter", {});

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
		oAdaptationResult = {
			aViewTitles: {},
			aViewSubTitles: {},
			aViewBackButtons: {},
			aChangeListeners: {}
		};
		aCurrentViewPath = [];

		this._doBFS([{
			oNode: oComponentRoot,
			oAdaptOptions: oAdaptOptions
		}]);
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

		if (!oNode || !this._isAdaptationRequired(oAdaptOptions) || (iSearchDepth <= 0)) {
			return;
		}

		var bIsNavigableView = oNode.getParent() && isInstanceOf(oNode.getParent(), "sap/m/NavContainer");
		if (bIsNavigableView) {
			aCurrentViewPath.push(oNode.getId());
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

		this._doBFS(aQueue);

		if (bIsNavigableView) {
			aCurrentViewPath.pop();
			if (aCurrentViewPath.length === 0) {
				this._fireViewChange(oNode.getId());
			}
		}
	};

	Fiori20Adapter._processNode = function(oControl, oAdaptOptions) {

		// attach listeners to re-trigger adaptation when content is added at a later stage
		this._attachDefferedAdaptationListeners(oControl, oAdaptOptions);

		if (HeaderAdapter._isStandardHeader(oControl)) {
			return this._adaptHeader(oControl, oAdaptOptions);
		}
		if (oControl.getParent() && isInstanceOf(oControl.getParent(), "sap/m/NavContainer")) {
			return this._getCachedAdaptationResult(oControl.getId()); //if already adapted in earlier navigation
		}
	};

	Fiori20Adapter._attachDefferedAdaptationListeners = function(oControl, oAdaptOptions) {

		this._attachAdaptableContentChange(oControl, oAdaptOptions);

		this._attachNavigablePageChange(oControl, oAdaptOptions);

		if (isInstanceOf(oControl, "sap/m/Page")) {
			this._attachModifyAggregation(oControl, "content", oAdaptOptions);
		}

		if ((oAdaptOptions.bLateAdaptation === true) && isInstanceOf(oControl, "sap/m/Bar")) {
			this._attachModifyAggregation(oControl, "contentLeft", oAdaptOptions, oControl);
			this._attachModifyAggregation(oControl, "contentMiddle", oAdaptOptions, oControl);
			this._attachModifyAggregation(oControl, "contentRight", oAdaptOptions, oControl);
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
					}
				};
				oControl.addEventDelegate(oDelegate, this);
			}
		}
	};

	Fiori20Adapter._checkHasListener = function(sKey) {
		return oAdaptationResult.aChangeListeners[sKey];
	};

	Fiori20Adapter._setHasListener = function(sKey, oValue) {
		oAdaptationResult.aChangeListeners[sKey] = oValue;
	};

	// attaches listener for changes in the adaptable content
	Fiori20Adapter._attachAdaptableContentChange = function(oControl, oAdaptOptions) {

		if (!oControl._getAdaptableContent || !jQuery.isFunction(oControl._getAdaptableContent)) {
			return;
		}

		var sKey = oControl.getId() + "_adaptableContentChange";
		if (this._checkHasListener(sKey)) {
			return;
		}

		var oOwnerViewId = this._getCurrentTopViewId();
		var fnOnAdaptableContentChange = function(oEvent) {
			var oChangedContent = oEvent.getParameter("adaptableContent");
			var bIsPostAdaptation = (this._getCurrentTopViewId() === undefined);
			if (bIsPostAdaptation) {
				aCurrentViewPath.push(oOwnerViewId);
				this._doBFS([{ // scan [for adaptable content] the newly added subtree
					oNode: oChangedContent,
					oAdaptOptions: oAdaptOptions
				}]);
				aCurrentViewPath.pop();
				this._fireViewChange(oOwnerViewId);
			}
		}.bind(this);

		oControl.attachEvent("_adaptableContentChange", fnOnAdaptableContentChange);

		this._setHasListener(sKey);
	};

	// attaches listener for changes in the nav container current page
	Fiori20Adapter._attachNavigablePageChange = function(oControl, oAdaptOptions) {

		if (!isInstanceOf(oControl, "sap/m/NavContainer")) {
			return;
		}

		var sKey = oControl.getId() + "navigate";
		if (this._checkHasListener(sKey)) {
			return;
		}

		oControl.attachNavigate(function(oEvent){
			this._doBFS([{ // scan [for adaptable content] the newly added subtree
				oNode: oEvent.getParameter("to"),
				oAdaptOptions: oAdaptOptions
			}]);
		}.bind(this));

		this._setHasListener(sKey);
	};

	Fiori20Adapter._attachModifyAggregation = function(oControl, sAggregationName, oAdaptOptions, oControlToRescan) {

		if (!oControl._attachModifyAggregation || !jQuery.isFunction(oControl._attachModifyAggregation)) {
			return;
		}

		var sKey = oControl.getId() + sAggregationName;

		if (this._checkHasListener(sKey)) {
			return;
		}

		var oOwnerViewId = this._getCurrentTopViewId();
		var fnOnModifyAggregation = function(oEvent) {
			var sType = oEvent.getParameter("type"),
				oObject = oEvent.getParameter("object");

			if ((sType === "add") || (sType === "insert")) {

				var bIsPostAdaptation = (this._getCurrentTopViewId() === undefined);
				if (bIsPostAdaptation) {
					aCurrentViewPath.push(oOwnerViewId);
					this._doBFS([{ // scan [for adaptable content] the newly added subtree
						oNode: oControlToRescan ? oControlToRescan : oObject,
						oAdaptOptions: oAdaptOptions
					}]);
					aCurrentViewPath.pop();
					this._fireViewChange(oOwnerViewId);
				}
			}
		}.bind(this);

		oControl._attachModifyAggregation(sAggregationName, oAdaptOptions, fnOnModifyAggregation);

		this._setHasListener(sKey, fnOnModifyAggregation);
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

		if (isInstanceOf(oControl, "sap/ui/core/Component")) {
			return [oControl.getAggregation("rootControl")];
		}

		return oControl.findAggregatedObjects(false);
	};

	Fiori20Adapter._updateSearchDepth = function(iSearchDepth, oControl) {

		if (isInstanceOf(oControl, "sap/ui/core/mvc/View")
				|| isInstanceOf(oControl, "sap/ui/core/Component")
				|| isInstanceOf(oControl, "sap/ui/core/ComponentContainer")) { /* Do not decrease level for views or components/componentContainers */
			return iSearchDepth;
		}
		return iSearchDepth - 1;
	};


	Fiori20Adapter._getCachedAdaptationResult = function(sViewId) {
		return {
			oTitleInfo: oAdaptationResult.aViewTitles[sViewId],
			oSubTitleInfo: oAdaptationResult.aViewSubTitles[sViewId],
			oBackButton: oAdaptationResult.aViewBackButtons[sViewId]
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

			var bIsPhone = sap.ui.Device.system.phone,
				bMoveTitle = oAdaptOptions.bMoveTitle,
				bAdaptChildBackButton;
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
			var bAdaptChildBackButton = oAdaptOptions.bHideBackButton;
			if (bAdaptChildBackButton && !sap.ui.Device.system.phone) {
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

	Fiori20Adapter._getCurrentTopViewId = function() {

		if (aCurrentViewPath && (aCurrentViewPath.length > 0)) {
			return aCurrentViewPath[0];
		}
	};

	Fiori20Adapter._adaptHeader = function(oHeader, oAdaptOptions) {

		if (!oHeader || !oAdaptOptions) {
			return;
		}
		var oHeaderAdapter = new HeaderAdapter(oHeader, oAdaptOptions),
			oAdaptedContent = oHeaderAdapter.adapt();

		var sTopViewId = this._getCurrentTopViewId();

		/* cache the identified title */
		if (oAdaptedContent.oTitleInfo) {
			oAdaptationResult.aViewTitles[sTopViewId] = oAdaptedContent.oTitleInfo;
			this._registerChangeListener(oAdaptationResult.aViewTitles, sTopViewId);
		}

		/* cache the identified subTitle */
		if (oAdaptedContent.oSubTitleInfo) {
			oAdaptationResult.aViewSubTitles[sTopViewId] = oAdaptedContent.oSubTitleInfo;
			this._registerChangeListener(oAdaptationResult.aViewSubTitles, sTopViewId);
		}

		/* cache the identified backButton */
		if (oAdaptedContent.oBackButton) {
			oAdaptationResult.aViewBackButtons[sTopViewId] = oAdaptedContent.oBackButton;
		}

		return oAdaptedContent;
	};

	Fiori20Adapter._registerChangeListener = function(aTitleInfoCache, sViewId) {

		var oTitleInfo = aTitleInfoCache[sViewId]; //get the cached titleInfo for the given view

		if (oTitleInfo && oTitleInfo.oControl && oTitleInfo.sChangeEventId && !oAdaptationResult.aChangeListeners[oTitleInfo.id]) {

			var fnChangeListener = function (oEvent) {
				var oTitleInfo = aTitleInfoCache[sViewId];
				oTitleInfo.text = oEvent.getParameter("newValue");
				this._fireViewChange(sViewId);
			}.bind(this);

			oTitleInfo.oControl.attachEvent(oTitleInfo.sChangeEventId, fnChangeListener);
			oAdaptationResult.aChangeListeners[oTitleInfo.id] = fnChangeListener;
		}
	};

	Fiori20Adapter._fireViewChange = function(sViewId) {
		var oAdaptationResult = this._getCachedAdaptationResult(sViewId);
		oAdaptationResult.sViewId = sViewId;
		oEventProvider.fireEvent("adaptedViewChange", oAdaptationResult);
	};


	Fiori20Adapter._isAdaptationRequired = function(oAdaptOptions) {
		for (var sOption in oAdaptOptions) {
			if (oAdaptOptions.hasOwnProperty(sOption)
			&& ((oAdaptOptions[sOption] === true) || (oAdaptOptions[sOption] === "initialPage"))) {
				return true;
			}
		}
		return false;
	};


	// utility function
	function isTextualControl (oControl) {
		if (!oControl) {
			return false;
		}

		return isInstanceOf(oControl, "sap/m/Label") ||
				isInstanceOf(oControl, "sap/m/Text") ||
				isInstanceOf(oControl, "sap/m/Title");
	}

	function isInstanceOf (oControl, sType) {
		var oType = sap.ui.require(sType);
		return oType && (oControl instanceof oType);
	}

	return Fiori20Adapter;

}, /* bExport= */ false);
