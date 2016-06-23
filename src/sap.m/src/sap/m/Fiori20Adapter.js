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
		sCurrentViewId;


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

		var bTitleHidden = this._adaptTitle(this._oAdaptOptions),
			bBackButtonHidden = this._adaptBackButton(this._oAdaptOptions);

		if (bCollapseHeader) {
			this._collapseHeader(bTitleHidden, bBackButtonHidden);
		}

		// let children know if adaptation was already applied
		// to avoid redundant processing
		return {
			 bTitleHidden: bTitleHidden,
			 bBackButtonHidden: bBackButtonHidden
		};
	};

	HeaderAdapter.prototype.getAdaptedContent = function() {
		return {
			oTitleInfo: this._oTitleInfo,
			oSubTitleInfo: this._oSubTitleInfo,
			oBackButton: this._oBackButton
		};
	};

	HeaderAdapter.prototype._adaptTitle = function() {

		if (!this._isStandardHeader(this._oHeader) || this._oAdaptOptions.bMoveTitle !== true) {
			return false;
		}

		this._oTitleInfo = this._detectTitle();
		this._oSubTitleInfo = this._detectSubTitle();
		var bSuccess = this._oTitleInfo || this._oSubTitleInfo;

		if (this._oTitleInfo) {
			this._oTitleInfo.oControl.addStyleClass("sapF2AdaptedTitle");
		}

		return bSuccess;
	};

	HeaderAdapter.prototype._adaptBackButton = function() {

		if (!this._isStandardHeader(this._oHeader) || this._oAdaptOptions.bHideBackButton !== true) {
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
		}
	};

	HeaderAdapter.prototype._isStandardHeader = function(oHeader) {
		return oHeader && isInstanceOf(oHeader, "sap/m/Bar");
	};

	HeaderAdapter.prototype._detectTitle = function() {
		var oTitleInfo;

		if (this._isStandardHeader(this._oHeader)) {
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

		if (this._isStandardHeader(this._oHeader)) {
			var aBeginContent = this._oHeader.getContentLeft();
			if (aBeginContent.length > 0 && isInstanceOf(aBeginContent[0], "sap/m/Button") &&
				(aBeginContent[0].getType() === "Back" || aBeginContent[0].getType() === "Up" || aBeginContent[0].getIcon() === "sap-icon://nav-back")) {
				return aBeginContent[0];
			}
		}
	};

	HeaderAdapter.prototype._collapseHeader = function(bTitleHidden, bBackButtonHidden) {

		if (this._isStandardHeader(this._oHeader)) {
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
			aAdaptedViews: {},
			aChangeListeners: {}
		};
		sCurrentViewId = null;

		this._doBFS([{
			oNode: oComponentRoot,
			oAdaptOptions: oAdaptOptions
		}]);
	};

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


		var oNodeAdaptationResult = this._processNode(oNode, oAdaptOptions);


		var aChildren = this._getNodeChildren(oNode),
			childAdaptOptions = jQuery.extend({}, oAdaptOptions, {iSearchDepth: this._updateSearchDepth(iSearchDepth, oNode)});

		if (oNodeAdaptationResult) {
			childAdaptOptions = jQuery.extend(childAdaptOptions, {
				bMoveTitle: oAdaptOptions.bMoveTitle && !oNodeAdaptationResult.bTitleHidden,
				bHideBackButton: oAdaptOptions.bHideBackButton && !oNodeAdaptationResult.bBackButtonHidden
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
	};

	Fiori20Adapter._processNode = function(oControl, oAdaptOptions) {

		// control is subject to adaptation
		if (oControl._getAdaptableContent && jQuery.isFunction(oControl._getAdaptableContent)) {

			// attach listener for changes in the adaptable content
			oControl.attachEvent("_adaptableContentChange", function(oEvent) {
				var oChangedContent = oEvent.getParameter("adaptableContent");
				this._adaptContent(oChangedContent, oControl, oAdaptOptions);
			}.bind(this));

			if (isInstanceOf(oControl, "sap/m/Page")) {
				oControl._attachModifyAggregation("content", oAdaptOptions, function(oEvent) {
					var sType = oEvent.getParameter("type"),
						oObject = oEvent.getParameter("object");

					if ((sType === "add") || (sType === "insert")) {
						this._doBFS([{ // scan [for adaptable content] the newly added subtree
							oNode: oObject,
							oAdaptOptions: oAdaptOptions
						}]);
					}
				}, this);
			}

			// attach listener for changes in the nav container current page
			if (isInstanceOf(oControl, "sap/m/NavContainer")) {
				oControl.attachNavigate(function(oEvent){
					this._adaptNavigableView(oEvent.getParameter("to"), oAdaptOptions);
				}.bind(this));
			}

			return this._adaptContent(oControl._getAdaptableContent(), oControl, oAdaptOptions);
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

	Fiori20Adapter._getNodeChildren = function(oControl) {

		if (isInstanceOf(oControl, "sap/m/NavContainer")) {
			return [oControl.getCurrentPage()];
		}

		if (isInstanceOf(oControl, "sap/m/SplitContainer")) {
			return [].concat(oControl.getAggregation("_navMaster"), oControl.getAggregation("_navDetail"));
		}

		if (isInstanceOf(oControl, "sap/m/Page")) {
			return oControl.getContent();
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

	Fiori20Adapter._skipDoneAdaptations = function(oAdaptOptions) {

		oAdaptOptions = jQuery.extend({}, oAdaptOptions);
		// skip style adaptation, if this view was adapted in a previous navigation step
		if (oAdaptationResult.aAdaptedViews[sCurrentViewId]) {
			oAdaptOptions.bStylePage = false;
		}

		// skip title adaptation, if this view was adapted in a previous navigation step
		if (oAdaptationResult.aViewTitles[sCurrentViewId]) {
			oAdaptOptions.bMoveTitle = false;
		}

		// skip back button adaptation, if this view was adapted in a previous navigation step
		if (oAdaptationResult.aViewBackButtons[sCurrentViewId]) {
			oAdaptOptions.bHideBackButton = false;
		}

		return oAdaptOptions;
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

		return oAdaptOptions;
	};

	Fiori20Adapter._adaptContent = function(oControl, oParent, oAdaptOptions) {
		if (isInstanceOf(oParent, "sap/m/Page") || isInstanceOf(oParent, "sap/uxap/ObjectPageHeader")) {
			return this._adaptHeader(oControl, oAdaptOptions);
		}
		if (isInstanceOf(oParent, "sap/m/NavContainer")) {
			return this._adaptNavigableView(oControl, oAdaptOptions);
		}
	};

	Fiori20Adapter._adaptHeader = function(oHeader, oAdaptOptions) {

		if (!oHeader || !oAdaptOptions) {
			return;
		}
		var oHeaderAdapter = new HeaderAdapter(oHeader, oAdaptOptions),
			oResult = oHeaderAdapter.adapt(), //TODO: return oAdaptedContent as result directly
			oAdaptedContent = oHeaderAdapter.getAdaptedContent();

		/* cache the identified title */
		if (oAdaptedContent.oTitleInfo) {
			oAdaptationResult.aViewTitles[sCurrentViewId] = oAdaptedContent.oTitleInfo;
			this._registerChangeListener(oAdaptationResult.aViewTitles, sCurrentViewId);
		}

		/* cache the identified subTitle */
		if (oAdaptedContent.oSubTitleInfo) {
			oAdaptationResult.aViewSubTitles[sCurrentViewId] = oAdaptedContent.oSubTitleInfo;
			this._registerChangeListener(oAdaptationResult.aViewSubTitles, sCurrentViewId);
		}

		/* cache the identified backButton */
		if (oAdaptedContent.oBackButton) {
			oAdaptationResult.aViewBackButtons[sCurrentViewId] = oAdaptedContent.oBackButton;
		}

		return oResult;
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
		oEventProvider.fireEvent("adaptedViewChange", {
			sViewId: sViewId,
			oTitleInfo: oAdaptationResult.aViewTitles[sViewId],
			oSubTitleInfo: oAdaptationResult.aViewSubTitles[sViewId],
			oBackButton: oAdaptationResult.aViewBackButtons[sViewId]
		});
	};

	Fiori20Adapter._adaptNavigableView = function(oView, oAdaptOptions) {

		if (!oView || !oAdaptOptions) {
			return;
		}

		sCurrentViewId = oView.getId();

		if (oAdaptationResult.aAdaptedViews[sCurrentViewId]) {
			oAdaptOptions = this._skipDoneAdaptations(oAdaptOptions);
		}

		oAdaptOptions = jQuery.extend({}, oAdaptOptions, {iSearchDepth: oAdaptOptions.iSearchDepth - 1});

		this._doBFS([{ // scan [for adaptable content] the newly added subtree
			oNode: oView,
			oAdaptOptions: oAdaptOptions
		}]);

		oAdaptationResult.aAdaptedViews[sCurrentViewId] = oView;

		this._fireViewChange(sCurrentViewId);
	};

	Fiori20Adapter._isAdaptationRequired = function(oAdaptOptions) {
		for (var sOption in oAdaptOptions) {
			if (oAdaptOptions.hasOwnProperty(sOption)
			&& (oAdaptOptions[sOption] === true)) {
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
