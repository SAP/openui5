/*!
 * ${copyright}
 */
sap.ui.define(['jquery.sap.global', 'sap/m/InstanceManager', 'sap/m/NavContainer', 'sap/m/SplitContainer', 'sap/ui/base/Object', 'sap/ui/core/routing/History', 'sap/ui/core/routing/Router'],
	function(jQuery, InstanceManager, NavContainer, SplitContainer, BaseObject, History, Router) {
	"use strict";


	/**
	 * Instantiates a RouteMatchedHandler.
	 * 
	 * @class
	 * This class will attach to the Events of a provided router and add the views created by it to a  {@link sap.m.SplitContainer} or a {@link sap.m.NavContainer} Control, if this is the target control of the route.</br>
	 * If the targetControl is no {@link sap.m.SplitContainer} or a {@link sap.m.NavContainer}, It will only close the dialogs, according to the property value.</br>
	 * </br>
	 * When a navigation is triggered, this class will try to determine the transition of the pages based on the history.</br>
	 * Eg: if a user presses browser back, it will show a backwards animation.</br>
	 * </br>
	 * The navigation on the container takes place in the RoutePatternMatched event of the Router. If you register on the RouteMatched event of the Router, the visual navigation did not take place yet.</br>
	 * </br>
	 * Since it is hard to detect if a user has pressed browser back, this transitions will not be reliable, for example if someone bookmarked a detail page, and wants to navigate to a masterPage.</br>
	 * If you want this case to always show a backwards transition, you should specify a "viewLevel" property on your Route.</br>
	 * The viewLevel has to be an integer. The Master should have a lower number than the detail.</br>
	 * These levels should represent the user process of your application and they do not have to match the container structure of your Routes.</br>
	 * If the user navigates between views with the same viewLevel, the history is asked for the direction.</br>
	 * </br>
	 * You can specify a property "transition" in a route to define which transition will be applied when navigating. If it is not defined, the nav container will take its default transition.
	 * </br>
	 * You can also specify "transitionParameters" on a Route, to give the transition parameters.</br>
	 * </br>
	 * If you want to preserve the current view when navigating, but you want to navigate to it when nothing is displayed in the navContainer, you can set preservePageInSplitContainer = true</br>
	 * When the route that has this flag directly matches the pattern, the view will still be switched by the splitContainer.
	 * </br>
	 * @see sap.m.NavContainer
	 * 
	 * @param {sap.ui.core.routing.Router} router - A router that creates views</br>
	 * @param {boolean} closeDialogs - the default is true - will close all open dialogs before navigating, if set to true. If set to false it will just navigate without closing dialogs.
	 * @public
	 * @alias sap.m.routing.RouteMatchedHandler
	 */
	var RouteMatchedHandler = BaseObject.extend("sap.m.routing.RouteMatchedHandler", {
		constructor : function (oRouter, bCloseDialogs) {
			//until we reverse the order of events fired by router we need to queue handleRouteMatched
			this._aQueue = [];
	
			if (bCloseDialogs === undefined) {
				this._bCloseDialogs = true;
			} else {
				this._bCloseDialogs = !!bCloseDialogs;
			}
	
			// Route matched is thrown for each container in the route hierarchy
			oRouter.attachRouteMatched(this._onHandleRouteMatched, this);
			// Route Pattern Matched is thrown only once for the end point of the current navigation
			oRouter.attachRoutePatternMatched(this._handleRoutePatternMatched, this);
	
			this._oRouter = oRouter;
		}
	});
	
	/* =================================
	 * public
	 * =================================*/
	
	/**
	 * Removes the routeMatchedHandler from the Router
	 *
	 * @public
	 * @returns {sap.m.routing.RouteMatchedHandler} for chaining
	 */
	RouteMatchedHandler.prototype.destroy = function () {
		this._oRouter.detachRouteMatched(this._onHandleRouteMatched, this);
		this._oRouter.detachRoutePatternMatched(this._handleRoutePatternMatched, this);
	
		this._oRouter = null;
	
		return this;
	};
	
	/**
	 * Sets if a navigation should close dialogs
	 *
	 * @param {boolean} bCloseDialogs close dialogs if true
	 * @public
	 * @returns {sap.m.routing.RouteMatchedHandler} for chaining
	 */
	RouteMatchedHandler.prototype.setCloseDialogs = function (bCloseDialogs) {
		this._bCloseDialogs = !!bCloseDialogs;
		return this;
	};
	
	
	/**
	 * Gets if a navigation should close dialogs
	 *
	 * @public
	 * @returns {boolean} a flag indication if dialogs will be closed
	 */
	RouteMatchedHandler.prototype.getCloseDialogs = function () {
		return this._bCloseDialogs;
	};
	
	
	/* =================================
	 * private
	 * =================================
	*/
	
	/**
	 * Handling of navigation event:
	 * Order of navigation events is first all RouteMatched events then the single RoutePatternMatched event.
	 * We collect all RouteMatched events in a queue (one for each container) as soon as the RoutePatternMatched
	 * is reached the direction of the navigation is derived by _handleRoutePatternMatched. This direction is
	 * forwarded to the route's view container (done in _handleRouteMatched)
	 * @param {object} oEvent The routePatternMatched event
	 * @private
	 */
	RouteMatchedHandler.prototype._handleRoutePatternMatched = function(oEvent) {
		var iTargetViewLevel = +oEvent.getParameter("config").viewLevel,
			oHistory = History.getInstance(),
			bBack,
			//Only one navigation per NavContainer in the queue, it has to be the last one for the container
			aResultingNavigations = this._createResultingNavigations(oEvent.getParameter("name"));
	
		this._closeDialogs();
	
		if (isNaN(iTargetViewLevel) || isNaN(this._iCurrentViewLevel) || iTargetViewLevel === this._iCurrentViewLevel) {
			bBack = oHistory.getDirection() === "Backwards";
		} else {
			bBack = iTargetViewLevel < this._iCurrentViewLevel;
		}
	
		while (aResultingNavigations.length) {
			this._handleRouteMatched(aResultingNavigations.shift().oParams, bBack);
		}
	
		this._iCurrentViewLevel = iTargetViewLevel;
	};
	
	/**
	 * queues up calls
	 * @param {object} oEvent The routeMatched event
	 * @private
	 */
	RouteMatchedHandler.prototype._onHandleRouteMatched = function(oEvent) {
		this._aQueue.push({
			oTargetControl : oEvent.getParameter("targetControl"),
			oArguments : oEvent.getParameter("arguments"),
			oConfig : oEvent.getParameter("config"),
			oView : oEvent.getParameter("view"),
			sRouteName : oEvent.getParameter("name")
		});
	};
	
	/**
	 * Goes through the queue and adds the last Transition for each container in the queue
	 * In case of a navContainer or phone mode, only one transition for the container is allowed.
	 * In case of a splitContainer in desktop mode, two transitions are allowed, one for the master and one for the detail.
	 * Both transitions will be the same. 
	 * @returns {array} a queue of navigations
	 * @private
	 */
	RouteMatchedHandler.prototype._createResultingNavigations = function(sRouteName) {
		var i,
			bFoundTheCurrentNavigation,
			oCurrentParams,
			oCurrentContainer,
			oCurrentNavigation,
			aResults = [],
			oView,
			bIsSplitContainer,
			bIsNavContainer,
			bPreservePageInSplitContainer,
			oResult;
	
		while (this._aQueue.length) {
			bFoundTheCurrentNavigation = false;
			oCurrentParams = this._aQueue.shift();
			oCurrentContainer = oCurrentParams.oTargetControl;
			bIsSplitContainer = oCurrentContainer instanceof SplitContainer;
			bIsNavContainer = oCurrentContainer instanceof NavContainer;
			oView = oCurrentParams.oView;
			oCurrentNavigation = {
						oContainer : oCurrentContainer,
						oParams : oCurrentParams,
						bIsMasterPage : (bIsSplitContainer && !!oCurrentContainer.getMasterPage(oView.getId()))
					};
			bPreservePageInSplitContainer = bIsSplitContainer &&
											oCurrentParams.oConfig.preservePageInSplitContainer &&
											//only switch the page if the container has a page in this aggregation
											oCurrentContainer.getCurrentPage(oCurrentNavigation.bIsMasterPage)
											&& sRouteName !== oCurrentParams.sRouteName;
	
			//Skip no nav container controls
			if (!(bIsNavContainer || bIsSplitContainer) || !oView) {
				continue;
			}
	
			for (i = 0; i < aResults.length; i++) {
				oResult = aResults[i];
				
				//The result targets a different container
				if (oResult.oContainer !== oCurrentContainer) {
					continue;
				}
	
				//Always override the navigation when its a navContainer, and if its a splitContainer - in the mobile case it behaves like a nav container
				if (bIsNavContainer || sap.ui.Device.system.phone) {
					aResults.splice(i, 1);
					aResults.push(oCurrentNavigation);
					bFoundTheCurrentNavigation = true;
					break;
				}
	
				//We have a desktop SplitContainer and need to add to transitions if necessary
				//The page is in the same aggregation - overwrite the previous transition
				if (oResult.bIsMasterPage === oCurrentNavigation.bIsMasterPage) {
					if (bPreservePageInSplitContainer) {
						//the view should be preserved, check the next navigation
						break;
					}
	
					aResults.splice(i, 1);
					aResults.push(oCurrentNavigation);
					bFoundTheCurrentNavigation = true;
					break;
				}
			}
	
			if (oCurrentContainer instanceof SplitContainer && !sap.ui.Device.system.phone) {
				//We have a desktop SplitContainer and need to add to transitions if necessary
				oCurrentNavigation.bIsMasterPage = !!oCurrentContainer.getMasterPage(oView.getId());
			}
	
			//A new Nav container was found
			if (!bFoundTheCurrentNavigation) {
				if (!!oCurrentContainer.getCurrentPage(oCurrentNavigation.bIsMasterPage) && bPreservePageInSplitContainer) {
					//the view should be preserved, check the next navigation
					continue;
				}
				aResults.push(oCurrentNavigation);
			}
		}
	
		return aResults;
	};
	
	
	/**
	 * Triggers all navigation on the correct containers with the transition direction.
	 *
	 * @param {object} oParams the navigation parameters
	 * @param {boolean} bBack forces the nav container to show a backwards transition
	 * @private
	 */
	RouteMatchedHandler.prototype._handleRouteMatched = function(oParams, bBack) {
		var oTargetControl = oParams.oTargetControl,
			oPreviousPage,
			//Parameters for the nav Container
			oArguments = oParams.oArguments,
			//Nav container does not work well if you pass undefined as transition
			sTransition = oParams.oConfig.transition || "",
			oTransitionParameters = oParams.oConfig.transitionParameters,
			sViewId = oParams.oView.getId(),
			//this is only necessary if the target control is a Split container since the nav container only has a pages aggregation
			bNextPageIsMaster = oTargetControl instanceof SplitContainer && !!oTargetControl.getMasterPage(sViewId);
	
		//It is already the current page, no need to navigate
		if (oTargetControl.getCurrentPage(bNextPageIsMaster).getId() === sViewId) {
			jQuery.sap.log.info("navigation to view with id: " + sViewId + " is skipped since it already is displayed by its targetControl");
			return;
		}
	
		jQuery.sap.log.info("navigation to view with id: " + sViewId + " the targetControl is " + oTargetControl.getId() + " backwards is " + bBack);
	
		if (bBack) {
			// insert previous page if not in nav container yet
			oPreviousPage = oTargetControl.getPreviousPage(bNextPageIsMaster);
	
			if (!oPreviousPage || oPreviousPage.getId() !== sViewId) {
				oTargetControl.insertPreviousPage(sViewId, sTransition , oArguments);
			}
	
			oTargetControl.backToPage(sViewId, oArguments, oTransitionParameters);
	
		} else {
			oTargetControl.to(sViewId, sTransition, oArguments, oTransitionParameters);
		}
	
	};
	
	
	/**
	 * Closes all dialogs if the closeDialogs property is set to true.
	 *
	 * @private
	 */
	RouteMatchedHandler.prototype._closeDialogs = function() {
		if (!this._bCloseDialogs) {
			return;
		}
	
		// close open popovers
		if (InstanceManager.hasOpenPopover()) {
			InstanceManager.closeAllPopovers();
		}
	
		// close open dialogs
		if (InstanceManager.hasOpenDialog()) {
			InstanceManager.closeAllDialogs();
		}
	};
	
	

	return RouteMatchedHandler;

}, /* bExport= */ true);
