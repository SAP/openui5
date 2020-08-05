/*!
 * ${copyright}
 */

 /*global Promise*/
sap.ui.define(['sap/m/InstanceManager', 'sap/m/NavContainer', 'sap/m/SplitContainer', 'sap/ui/base/Object', 'sap/ui/core/routing/History', 'sap/ui/Device', "sap/base/Log"],
	function(InstanceManager, NavContainer, SplitContainer, BaseObject, History, Device, Log) {
		"use strict";


		/**
		 * Constructor for a new <code>TargetHandler</code>.
		 *
		 * @class
		 * Used for closing dialogs and showing transitions in <code>NavContainers</code>
		 * when targets are displayed.
		 *
		 * <b>Note:</b> You should not create an own instance of this class. It is created
		 * when using <code>{@link sap.m.routing.Router}</code> or <code>{@link sap.m.routing.Targets}</code>.
		 * You may use the <code>{@link #setCloseDialogs}</code> function to specify if dialogs should be
		 * closed on displaying other views.
		 *
		 * @param {boolean} closeDialogs Closes all open dialogs before navigating, if set to <code>true</code> (default).
		 * If set to <code>false</code>, it will just navigate without closing dialogs.
		 * @public
		 * @since 1.28.1
		 * @alias sap.m.routing.TargetHandler
		 */
		var TargetHandler = BaseObject.extend("sap.m.routing.TargetHandler", {
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
		 * Sets if a navigation should close dialogs.
		 *
		 * @param {boolean} bCloseDialogs Close dialogs if <code>true</code>
		 * @public
		 * @returns {sap.m.routing.TargetHandler} For chaining
		 */
		TargetHandler.prototype.setCloseDialogs = function (bCloseDialogs) {
			this._bCloseDialogs = !!bCloseDialogs;
			return this;
		};


		/**
		 * Gets if a navigation should close dialogs.
		 *
		 * @public
		 * @returns {boolean} A flag indication if dialogs will be closed.
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
		 * In case of a navContainer or phone mode, only one transition for the container is allowed.
		 * In case of a splitContainer in desktop mode, two transitions are allowed, one for the master and one for the detail.
		 * Both transitions will be the same.
		 * @returns {array} a queue of navigations
		 * @private
		 */
		TargetHandler.prototype._createResultingNavigations = function(sNavigationIdentifier) {
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
				oCurrentContainer = oCurrentParams.targetControl;
				bIsSplitContainer = oCurrentContainer instanceof SplitContainer;
				bIsNavContainer = oCurrentContainer instanceof NavContainer;
				oView = oCurrentParams.view;
				oCurrentNavigation = {
					oContainer : oCurrentContainer,
					oParams : oCurrentParams,
					bIsMasterPage : (bIsSplitContainer && !!oCurrentContainer.getMasterPage(oView.getId()))
				};
				bPreservePageInSplitContainer = bIsSplitContainer &&
					oCurrentParams.preservePageInSplitContainer &&
					//only switch the page if the container has a page in this aggregation
					oCurrentContainer.getCurrentPage(oCurrentNavigation.bIsMasterPage)
					&& sNavigationIdentifier !== oCurrentParams.navigationIdentifier;

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
					if (bIsNavContainer || Device.system.phone) {
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

				if (oCurrentContainer instanceof SplitContainer && !Device.system.phone) {
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
		 * @returns {boolean} if a navigation occured - if the page is already displayed false is returned
		 */
		TargetHandler.prototype._applyNavigationResult = function(oParams, bBack) {
			var oTargetControl = oParams.targetControl,
				oPreviousPage,
			//Parameters for the nav Container
				oArguments = oParams.eventData,
			//Nav container does not work well if you pass undefined as transition
				sTransition = oParams.transition || "",
				oTransitionParameters = oParams.transitionParameters,
				sViewId = oParams.view.getId(),
			//this is only necessary if the target control is a Split container since the nav container only has a pages aggregation
				bNextPageIsMaster = oTargetControl instanceof SplitContainer && !!oTargetControl.getMasterPage(sViewId);

			// It's NOT needed to navigate when both of the following conditions are valid:
			// 1. The target control is already rendered
			// 2. The target control already has the target view as the current page
			//
			// This fix the problem that the route parameters can't be forwarded to the initial page's onBeforeShow event.
			// In this case, the 'to' method of target control has to be explicitly called to pass the route parameters for the
			// onBeforeShow event which is fired in the onBeforeRendering of the target control.
			//
			// TODO: when target view is loaded asyncly, it could happen that the target control is rendered with empty content and
			// the target view is added later. oTargetControl.getDomRef has to be adapted with some new method in target control.
			if (oTargetControl.getDomRef() && oTargetControl.getCurrentPage(bNextPageIsMaster).getId() === sViewId) {
				Log.info("navigation to view with id: " + sViewId + " is skipped since it already is displayed by its targetControl", "sap.m.routing.TargetHandler");
				return false;
			}

			Log.info("navigation to view with id: " + sViewId + " the targetControl is " + oTargetControl.getId() + " backwards is " + bBack);

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