/*!
 * ${copyright}
 */

/*global Promise*/
sap.ui.define(['sap/m/InstanceManager', 'sap/f/FlexibleColumnLayout', 'sap/ui/base/Object', 'sap/ui/core/routing/History', "sap/base/Log"],
	function(InstanceManager, FlexibleColumnLayout, BaseObject, History, Log) {
		"use strict";

		/**
		 * Constructor for a new <code>TargetHandler</code>.
		 *
		 * @class
		 * Used for closing dialogs and showing transitions in <code>NavContainers</code> when
		 * targets are displayed.
		 *
		 * <b>Note:</b> You should not create an own instance of this class. It is created
		 * when using <code>{@link sap.f.routing.Router}</code> or <code>{@link sap.f.routing.Targets}</code>.
		 *
		 * <b>Note:</b> You may use the <code>{@link #setCloseDialogs}</code> function to specify if dialogs should be
		 * closed on displaying other views. The dialogs are closed when a different target is displayed than the
		 * previously displayed one, otherwise the dialogs are kept open.
		 *
		 * @param {boolean} closeDialogs Closes all open dialogs before navigating to a different target, if set to
		 *  <code>true</code> (default). If set to <code>false</code>, it will just navigate without closing dialogs.
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
		 * @returns {boolean} A flag indication if dialogs will be closed
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

			if (bCloseDialogs || bBack) {
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
					oParams : oCurrentParams,
					placeholderConfig: oCurrentParams.placeholderConfig
				};

				if (!isNavigationContainer(oCurrentContainer)) {
					continue;
				}

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
				sTransition = oParams.placeholderShown ? "show" : (oParams.transition || ""),
				oTransitionParameters = oParams.transitionParameters,
				sViewId = oParams.view.getId(),
				aColumnsCurrentPages,
				bIsFCL = oTargetControl instanceof FlexibleColumnLayout,
				bSkipNavigation = false,
				oPlaceholderConfig = oParams.placeholderConfig;

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
				if (oPlaceholderConfig.autoClose) {
					oTargetControl.hidePlaceholder(oPlaceholderConfig);
				}
				Log.info("navigation to view with id: " + sViewId + " is skipped since it already is displayed by its targetControl", "sap.f.routing.TargetHandler");
				return false;
			}

			Log.info("navigation to view with id: " + sViewId + " the targetControl is " + oTargetControl.getId() + " backwards is " + bBack);

			if (bBack) {
				oTargetControl._safeBackToPage(sViewId, sTransition, oArguments, oTransitionParameters);
			} else {
				oTargetControl.to(sViewId, sTransition, oArguments, oTransitionParameters);
			}

			if (oPlaceholderConfig.autoClose) {
				oTargetControl.hidePlaceholder(oPlaceholderConfig);
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

		function isNavigationContainer(oContainer) {
			return oContainer && oContainer.isA(["sap.m.NavContainer", "sap.m.SplitContainer", "sap.f.FlexibleColumnLayout"]);
		}

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