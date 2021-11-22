/*!
 * ${copyright}
 */

/*global Promise*/
sap.ui.define(['sap/m/InstanceManager', 'sap/m/NavContainer', 'sap/m/SplitContainer', 'sap/ui/base/Object', 'sap/ui/core/routing/History', 'sap/ui/Device', "sap/base/Log"],
	function(InstanceManager, NavContainer, SplitContainer, BaseObject, History, Device, Log) {
		"use strict";

		var oOnAfterShowDelegate = {
			"onAfterShow": function(oEvent) {
				// 'this' == current page / view
				// 'parent' == navContainer
				this.getParent().hidePlaceholder({});

				this.removeEventDelegate(oOnAfterShowDelegate);
			}
		};

		/**
		 * Constructor for a new <code>TargetHandler</code>.
		 *
		 * @class
		 * Used for closing dialogs and showing transitions in <code>NavContainers</code>
		 * when targets are displayed.
		 *
		 * <b>Note:</b> You should not create an own instance of this class. It is created
		 * when using <code>{@link sap.m.routing.Router}</code> or <code>{@link sap.m.routing.Targets}</code>.
		 *
		 * <b>Note:</b> You may use the <code>{@link #setCloseDialogs}</code> function to specify if dialogs should be
		 * closed on displaying other views. The dialogs are closed when a different target is displayed than the
		 * previously displayed one, otherwise the dialogs are kept open.
		 *
		 * @param {boolean} closeDialogs Closes all open dialogs before navigating to a different target, if set to
		 *  <code>true</code> (default). If set to <code>false</code>, it will just navigate without closing dialogs.
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
		 * <b>Note:</b> The dialogs are closed when a different target is displayed than the previous one,
		 * otherwise the dialogs are kept open even when <code>bCloseDialogs</code> is <code>true</code>.
		 *
		 * @param {boolean} bCloseDialogs Close dialogs if <code>true</code>
		 * @public
		 * @returns {this} For chaining
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
			var aUniqueNavigations = this._groupNavigation(),
				aResultingNavigations = this._createResultingNavigations(oDirectionInfo.navigationIdentifier, aUniqueNavigations),
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
		TargetHandler.prototype._chainNavigation = function(fnNavigation, sNavigationIdentifier) {
			var oPromiseChain = this._oNavigationOrderPromise.then(fnNavigation);

			// navigation order promise should resolve even when the inner promise rejects to allow further navigation
			// to be done. Therefore it's needed to catch the rejected inner promise
			this._oNavigationOrderPromise = oPromiseChain.catch(function(oError) {
				Log.error("The following error occurred while displaying routing target with name '" + sNavigationIdentifier + "': " + oError);
			});

			return oPromiseChain;
		};

		/**
		 * @private
		 */
		TargetHandler.prototype._getDirection = function(oDirectionInfo) {
			var iTargetLevel = oDirectionInfo.level,
				oHistory = History.getInstance(),
				bBack = false;

			if (oDirectionInfo.direction === "Backwards") {
				bBack = true;
			} else if (isNaN(iTargetLevel) || isNaN(this._iCurrentLevel) || iTargetLevel === this._iCurrentLevel) {
				if (oDirectionInfo.askHistory) {
					bBack = oHistory.getDirection() === "Backwards";
				}
			} else {
				bBack = iTargetLevel < this._iCurrentLevel;
			}

			this._iCurrentLevel = iTargetLevel;

			return bBack;
		};

		TargetHandler.prototype._groupNavigation = function() {
			var oCurrentParams,
				oCurrentContainer,
				sCurrentAggregation,
				oNavigationParams,
				aUniqueNavigations = [],
				i;

			while (this._aQueue.length) {
				oCurrentParams = this._aQueue.shift();
				oCurrentContainer = oCurrentParams.targetControl;
				sCurrentAggregation = oCurrentParams.aggregationName;

				if (!oCurrentParams.preservePageInSplitContainer) {
					for (i = 0; i < aUniqueNavigations.length; i++) {
						oNavigationParams = aUniqueNavigations[i];

						if (oCurrentContainer !== oNavigationParams.targetControl || sCurrentAggregation !== oNavigationParams.aggregationName) {
							continue;
						}

						aUniqueNavigations.splice(i, 1);
						break;
					}
				}

				aUniqueNavigations.push(oCurrentParams);
			}

			return aUniqueNavigations;
		};

		/**
		 * Goes through the queue and adds the last Transition for each container in the queue
		 * In case of a navContainer or phone mode, only one transition for the container is allowed.
		 * In case of a splitContainer in desktop mode, two transitions are allowed, one for the master and one for the detail.
		 * Both transitions will be the same.
		 * @returns {array} a queue of navigations
		 * @private
		 */
		TargetHandler.prototype._createResultingNavigations = function(sNavigationIdentifier, aUniqueNavigations) {
			var i,
				oCurrentParams,
				oCurrentContainer,
				oCurrentNavigation,
				aResults = [],
				oView,
				bIsSplitContainer,
				bPreservePageInSplitContainer,
				oResult;

			while (aUniqueNavigations.length) {
				oCurrentParams = aUniqueNavigations.shift();
				oCurrentContainer = oCurrentParams.targetControl;
				bIsSplitContainer = oCurrentContainer instanceof SplitContainer;
				oView = oCurrentParams.view;
				oCurrentNavigation = {
					oContainer : oCurrentContainer,
					oParams : oCurrentParams
				};
				if (bIsSplitContainer) {
					oCurrentNavigation.bIsMasterPage = !!oCurrentContainer.getMasterPage(oView.getId());
				}
				bPreservePageInSplitContainer = bIsSplitContainer &&
					oCurrentParams.preservePageInSplitContainer &&
					//only switch the page if the container has a page in this aggregation
					oCurrentContainer.getCurrentPage(oCurrentNavigation.bIsMasterPage)
					&& sNavigationIdentifier !== oCurrentParams.navigationIdentifier;

				for (i = 0; i < aResults.length; i++) {
					oResult = aResults[i];

					//The result targets a different container
					if (oResult.oContainer !== oCurrentContainer) {
						continue;
					}

					if (bIsSplitContainer) {
						// if its a splitContainer - in the mobile case it behaves like a nav container
						if (Device.system.phone) {
							aResults.splice(i, 1);
							break;
						} else if (oResult.bIsMasterPage === oCurrentNavigation.bIsMasterPage) {
							//The page is in the same aggregation - overwrite the previous transition
							//We have a desktop SplitContainer and need to add to transitions if necessary
							if (!bPreservePageInSplitContainer) {
								aResults.splice(i, 1);
							}
							break;
						}
					}
				}

				//A new Nav container was found
				if (!bPreservePageInSplitContainer) {
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
				sTransition = oParams.placeholderShown ? "show" : (oParams.transition || ""),
				oTransitionParameters = oParams.transitionParameters,
				sViewId = oParams.view && oParams.view.getId(),
				//this is only necessary if the target control is a Split container since the nav container only has a pages aggregation
				bNextPageIsMaster = oTargetControl instanceof SplitContainer && !!oTargetControl.getMasterPage(sViewId),
				bNavigationRelevant = (oTargetControl instanceof SplitContainer || oTargetControl instanceof NavContainer) && oParams.view,
				bPlaceholderAutoClose,
				oPlaceholderContainer;

			if (oParams.placeholderConfig) {
				bPlaceholderAutoClose = oParams.placeholderConfig.autoClose;
				oPlaceholderContainer = oParams.placeholderConfig.container;
			}

			if (!bNavigationRelevant) {
				if (oPlaceholderContainer && bPlaceholderAutoClose && oPlaceholderContainer.hidePlaceholder) {
					oPlaceholderContainer.hidePlaceholder(oParams.placeholderConfig);
				}
				return false;
			}

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
				if (bPlaceholderAutoClose && oPlaceholderContainer && oPlaceholderContainer.hidePlaceholder) {
					oPlaceholderContainer.hidePlaceholder(oParams.placeholderConfig);
				}
				Log.info("navigation to view with id: " + sViewId + " is skipped since it already is displayed by its targetControl", "sap.m.routing.TargetHandler");
				return false;
			} else if (bPlaceholderAutoClose) {
				oParams.view.addEventDelegate(oOnAfterShowDelegate, oParams.view);
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

		/**
		 * Calls the 'showPlaceholder' method of the respective target container control depending on whether
		 * a placeholder is needed or not.
		 *
		 * @param {object} mSettings Object containing the container control and the view object to display
		 * @param {sap.ui.core.Control} mSettings.container The navigation target container
		 * @param {sap.ui.core.Control|Promise} mSettings.object The component/view object
		 * @return {Promise} Promise that resolves after the placeholder is loaded
		 *
		 * @private
	 	 * @ui5-restricted sap.ui.core.routing
		 */
		TargetHandler.prototype.showPlaceholder = function(mSettings) {
			var oContainer = mSettings.container,
				bNeedsPlaceholder = true,
				oObject;

			if (mSettings.object && !(mSettings.object instanceof Promise)) {
				oObject = mSettings.object;
			}

			if (mSettings.container && typeof mSettings.container.needPlaceholder === "function") {
				bNeedsPlaceholder = mSettings.container.needPlaceholder(mSettings.aggregation, oObject);
			}

			if (bNeedsPlaceholder) {
				return oContainer.showPlaceholder(mSettings);
			} else {
				return Promise.resolve();
			}
		};

		return TargetHandler;

	});