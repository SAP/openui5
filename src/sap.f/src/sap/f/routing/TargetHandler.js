/*!
 * ${copyright}
 */

 /*global Promise*/
sap.ui.define(['jquery.sap.global', 'sap/m/InstanceManager', 'sap/f/FlexibleColumnLayout', 'sap/ui/base/Object', 'sap/ui/core/routing/History'],
	function($, InstanceManager, FlexibleColumnLayout, BaseObject, History) {
		"use strict";


		/**
		 * Instantiates a TargetHandler, a class used for closing dialogs and showing transitions in NavContainers when targets are displayed.<br/>
		 * <b>You should not create an own instance of this class.</b> It will be created when using {@link sap.f.routing.Router} or {@link sap.f.routing.Targets}.
		 * You may use the {@link #setCloseDialogs} function to specify if dialogs should be closed on displaying other views.
		 *
		 * @class
		 * @param {boolean} closeDialogs - the default is true - will close all open dialogs before navigating, if set to true. If set to false it will just navigate without closing dialogs.
		 * @public
		 * @since 1.46
		 * @alias sap.f.routing.TargetHandler
		 */
		var TargetHandler = BaseObject.extend("sap.f.routing.TargetHandler", {
			constructor : function (bCloseDialogs) {
				//until we reverse the order of events fired by router we need to queue handleRouteMatched
				this._aQueue = [];

				// The Promise object here is used to make the navigations in the same order as they are triggered, only for async
				this._oNavigationOrderPromise = Promise.resolve();

				if (bCloseDialogs === undefined) {
					this._bCloseDialogs = true;
				} else {
					this._bCloseDialogs = !!bCloseDialogs;
				}
			}
		});

		/* =================================
		 * public
		 * =================================*/

		/**
		 * Sets if a navigation should close dialogs
		 *
		 * @param {boolean} bCloseDialogs close dialogs if true
		 * @public
		 * @returns {sap.f.routing.TargetHandler} for chaining
		 */
		TargetHandler.prototype.setCloseDialogs = function (bCloseDialogs) {
			this._bCloseDialogs = !!bCloseDialogs;
			return this;
		};


		/**
		 * Gets if a navigation should close dialogs
		 *
		 * @public
		 * @returns {boolean} a flag indication if dialogs will be closed
		 */
		TargetHandler.prototype.getCloseDialogs = function () {
			return this._bCloseDialogs;
		};

		TargetHandler.prototype.addNavigation = function(oParameters) {
			this._aQueue.push(oParameters);
		};

		TargetHandler.prototype.navigate = function(oDirectionInfo) {
			var aResultingNavigations = this._createResultingNavigations(oDirectionInfo.navigationIdentifier),
				bCloseDialogs = false,
				bBack = this._getDirection(oDirectionInfo),
				bNavigationOccurred;

			while (aResultingNavigations.length) {
				bNavigationOccurred = this._applyNavigationResult(aResultingNavigations.shift().oParams, bBack);
				bCloseDialogs = bCloseDialogs || bNavigationOccurred;
			}

			if (bCloseDialogs) {
				this._closeDialogs();
			}
		};

		/* =================================
		 * private
		 * =================================
		 */

		/**
		 * This method is used to chain navigations to be triggered in the correct order, only relevant for async
		 * @private
		 */
		TargetHandler.prototype._chainNavigation = function(fnNavigation) {
			this._oNavigationOrderPromise = this._oNavigationOrderPromise.then(fnNavigation);
			return this._oNavigationOrderPromise;
		};

		/**
		 * @private
		 */
		TargetHandler.prototype._getDirection = function(oDirectionInfo) {
			var iTargetViewLevel = oDirectionInfo.viewLevel,
				oHistory = History.getInstance(),
				bBack = false;

			if (oDirectionInfo.direction === "Backwards") {
				bBack = true;
			} else if (isNaN(iTargetViewLevel) || isNaN(this._iCurrentViewLevel) || iTargetViewLevel === this._iCurrentViewLevel) {
				if (oDirectionInfo.askHistory) {
					bBack = oHistory.getDirection() === "Backwards";
				}
			} else {
				bBack = iTargetViewLevel < this._iCurrentViewLevel;
			}

			this._iCurrentViewLevel = iTargetViewLevel;

			return bBack;
		};

		/**
		 * Goes through the queue and adds the last Transition for each container in the queue
		 * @returns {array} a queue of navigations
		 * @private
		 */
		TargetHandler.prototype._createResultingNavigations = function(sNavigationIdentifier) {
			var i,
				oCurrentParams,
				oCurrentContainer,
				oCurrentNavigation,
				aResults = [],
				oResult;

			while (this._aQueue.length) {
				oCurrentParams = this._aQueue.shift();
				oCurrentContainer = oCurrentParams.targetControl;
				oCurrentNavigation = {
					oContainer : oCurrentContainer,
					oParams : oCurrentParams
				};

				for (i = 0; i < aResults.length; i++) {
					oResult = aResults[i];

					//The result targets a different container
					if (oResult.oContainer !== oCurrentContainer) {
						continue;
					}
				}

				aResults.push(oCurrentNavigation);
			}

			return aResults;
		};


		/**
		 * Triggers all navigation on the correct containers with the transition direction.
		 *
		 * @param {object} oParams the navigation parameters
		 * @param {boolean} bBack forces the nav container to show a backwards transition
		 * @private
		 * @returns {boolean} if a navigation occurred - if the page is already displayed false is returned
		 */
		TargetHandler.prototype._applyNavigationResult = function(oParams, bBack) {
			var oTargetControl = oParams.targetControl,
			//Parameters for the nav Container
				oArguments = oParams.eventData,
			//Nav container does not work well if you pass undefined as transition
				sTransition = oParams.transition || "",
				oTransitionParameters = oParams.transitionParameters,
				sViewId = oParams.view.getId(),
				aColumnsCurrentPages,
				bIsFCL = oTargetControl instanceof FlexibleColumnLayout,
				bSkipNavigation = false;

			if (bIsFCL) {
				aColumnsCurrentPages = [
					oTargetControl.getCurrentBeginColumnPage(),
					oTargetControl.getCurrentMidColumnPage(),
					oTargetControl.getCurrentEndColumnPage()
				];

				bSkipNavigation = aColumnsCurrentPages.some(function(oCurrentPage) {
					return oCurrentPage && oCurrentPage.getId() === sViewId;
				});
			}

			// If the page we are going to navigate is already displayed,
			// we are skipping the navigation.
			if (bSkipNavigation) {
				$.sap.log.info("navigation to view with id: " + sViewId + " is skipped since it already is displayed by its targetControl", "sap.f.routing.TargetHandler");
				return false;
			}

			$.sap.log.info("navigation to view with id: " + sViewId + " the targetControl is " + oTargetControl.getId() + " backwards is " + bBack);

			if (bBack) {
				oTargetControl._safeBackToPage(sViewId, sTransition, oArguments, oTransitionParameters);
			} else {
				oTargetControl.to(sViewId, sTransition, oArguments, oTransitionParameters);
			}

			return true;
		};


		/**
		 * Closes all dialogs if the closeDialogs property is set to true.
		 *
		 * @private
		 */
		TargetHandler.prototype._closeDialogs = function() {
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

			// close open LightBoxes
			if (InstanceManager.hasOpenLightBox()) {
				InstanceManager.closeAllLightBoxes();
			}
		};

		return TargetHandler;

	});
