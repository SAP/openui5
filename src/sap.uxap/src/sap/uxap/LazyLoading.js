/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/thirdparty/jquery",
	"sap/ui/Device",
	"sap/ui/base/Metadata",
	"./ObjectPageSubSection",
	"./library",
	"sap/base/Log"
],
	function(jQuery, Device, Metadata, ObjectPageSubSection, library, Log) {
		"use strict";

		var LazyLoading = Metadata.createClass("sap.uxap._helpers.LazyLoading", {
			/**
			 * @private
			 * @param {*} oObjectPageLayout Object Layout instance
			 */
			constructor: function (oObjectPageLayout) {

				this._oObjectPageLayout = oObjectPageLayout;

				this._$html = jQuery("html");

				this._iPreviousScrollTop = 0;               //scroll top of the last scroll event
				this._iScrollProgress = 0;                  //progress done between the 2 last scroll events
				this._iPreviousScrollTimestamp = 0;         //Timestamp of the last scroll event
				this._sLazyLoadingTimer = null;
				this._bSuppressed = false;

				this._oPrevSubSectionsInView = {};
				this.setLazyLoadingParameters();
			}
		});


		/**
		 * Set the lazy loading tuning parameters.
		 */
		LazyLoading.prototype.setLazyLoadingParameters = function () {
			//delay before loading data for visible sub-sections
			//this delay avoid loading data for every subsections during scroll
			this.LAZY_LOADING_DELAY = 200;  //ms.

			//lazy loading fine tuning
			//An extra non visible subsection will be loaded if the top of this subsection is at
			//no more than LAZY_LOADING_EXTRA_PAGE_SIZE * page height from the bottom of the page.
			this.LAZY_LOADING_EXTRA_PAGE_SIZE = 0.5;

			// delayed lazy loading call to check if there's another extra subsection to load
			this.LAZY_LOADING_EXTRA_SUBSECTION = this.LAZY_LOADING_DELAY * 5;

			//number of subsections which should be preloaded :
			//   - FirstRendering : for first loading
			//   - ScrollToSection : default value when scrolling to a subsection
			if (this._isPhone()) {
				this.NUMBER_OF_SUBSECTIONS_TO_PRELOAD = {"FirstRendering": 1, "ScrollToSection": 1};
			} else if (this._isTablet()) {
				//on tablet scrolling may be slow.
				this.NUMBER_OF_SUBSECTIONS_TO_PRELOAD = {"FirstRendering": 2, "ScrollToSection": 1};
			} else if (this._isTabletSize()) {
				//Desktop with a "tablet" window size
				this.NUMBER_OF_SUBSECTIONS_TO_PRELOAD = {"FirstRendering": 2, "ScrollToSection": 2};
			} else {
				this.NUMBER_OF_SUBSECTIONS_TO_PRELOAD = {"FirstRendering": 3, "ScrollToSection": 3};
			}

			//Threshold beyond which we consider that user is scrolling fast and thus that lazy loading must be differed.
			//(percentage of the pageheight).
			this.LAZY_LOADING_FAST_SCROLLING_THRESHOLD = 5;
		};

		LazyLoading.prototype.suppress = function() {
			this._bSuppressed = true;
		};

		LazyLoading.prototype.resume = function() {
			this._bSuppressed = false;
		};

		/**
		 * Resets the internal information of which subsections are in view and immediately
		 * calls the layout calculation so that an event is fired for the subsections
		 * that are actually in view. Use this method after a change in bindings
		 * to the existing object, since it's layout might have changed and the app
		 * needs to react to the new subsections in view.
		 */
		LazyLoading.prototype._triggerVisibleSubSectionsEvents = function () {
			this._oPrevSubSectionsInView = {};
			// BCP: 1870326083 - force OP to recalculate immediately so Lazy Loading wont work with outdated size data
			this._oObjectPageLayout._requestAdjustLayout(true);
			this.doLazyLoading();
		};

		LazyLoading.prototype.lazyLoadDuringScroll = function (bImmediateLazyLoading, iScrollTop, timeStamp, iPageHeight) {
			var iProgressPercentage,
				iDelay,
				bFastScrolling = false;

			if (this._bSuppressed) {
				return;
			}

			if (bImmediateLazyLoading) {
				if (this._sLazyLoadingTimer) {
					clearTimeout(this._sLazyLoadingTimer);
				}
				this._sLazyLoadingTimer = null;
				this.doLazyLoading();
				return;
			}

			this._iScrollProgress = iScrollTop - this._iPreviousScrollTop;
			iProgressPercentage = Math.round(Math.abs(this._iScrollProgress) / iPageHeight * 100);
			if (iProgressPercentage >= this.LAZY_LOADING_FAST_SCROLLING_THRESHOLD) {
				bFastScrolling = true;
			}
			this._iPreviousScrollTop = iScrollTop;
			this._iPreviousScrollTimestamp = timeStamp || 0;

			iDelay = (iScrollTop === 0 ) ? 0 : this.LAZY_LOADING_DELAY;
			//if we are scrolling fast, clear the previous delayed lazy loading call if any
			//as we don't want to load intermediate subsections which are visible only
			//during a brief moment during scroll.
			if (bFastScrolling && this._sLazyLoadingTimer) {
				Log.debug("ObjectPageLayout :: lazyLoading", "delayed by " + iDelay + " ms because of fast scroll");
				clearTimeout(this._sLazyLoadingTimer);
				this._sLazyLoadingTimer = null;
			}

			//If there's no delayed lazy loading call, create a new one.
			if (!this._sLazyLoadingTimer) {
				this._sLazyLoadingTimer = setTimeout(this.doLazyLoading.bind(this), iDelay);
			}
		};

		LazyLoading.prototype.doLazyLoading = function () {
			var oHeightParams = this._oObjectPageLayout._getHeightRelatedParameters(),
				bIconTabBar = this._oObjectPageLayout.getUseIconTabBar(),
				oSelectedSection = sap.ui.getCore().byId(this._oObjectPageLayout.getSelectedSection()),
				oSectionInfo = this._oObjectPageLayout._oSectionInfo,
				iScrollTop,
				iScrollPageBottom,
				iPageHeight,
				bShouldStick = this._iPreviousScrollTop >= (oHeightParams.iHeaderContentHeight), // iHeaderContentHeight
				sExtraSubSectionId,
				iExtraSubSectionTop = -1,
				oSubSectionsToLoad = {},
				oSubSectionsInView = {},
				iTimeDifference,
				bOnGoingScroll,
				iShift;

			if (this._bSuppressed) {
				return;
			}

			//calculate the limit of visible sections to be lazy loaded
			iPageHeight = (
				oHeightParams.iScreenHeight                                            /* the total screen height */
				- (bShouldStick ? oHeightParams.iAnchorBarHeight : 0)              /* minus the part taken by the anchor bar (when sticky)*/
				- (bShouldStick ? oHeightParams.iHeaderTitleHeightStickied : 0)    /* minus the part taken by the header title (mandatory) */
			);
			iScrollTop = oHeightParams.iScrollTop;

			//we consider that the scroll is still ongoing if:
			//   - a scroll event has been received for less than half of the LAZY_LOADING_DELAY (100 ms)
			//   - progress done between the last 2 scroll event is greater than 5 pixels.
			iTimeDifference = Date.now() - this._iPreviousScrollTimestamp;
			bOnGoingScroll = (iTimeDifference < (this.LAZY_LOADING_DELAY / 2) ) && (Math.abs(this._iScrollProgress) > 5);

			// if scroll is ongoing, we shift the pages top and height to:
			//     - avoid loading subsections which will likely no more be visible at the end of scroll
			//       (Next lazyLoading calls will anyway load them if they are still visible at the end of scroll)
			//     - load in advance subsections which will likely be visible at the end of scroll
			if (bOnGoingScroll) {
				if (this._iScrollProgress >= 0) {
					iShift = Math.round(Math.min(this._iScrollProgress * 20, iPageHeight / 2));
				} else {
					iShift = -1 * Math.round(Math.min(Math.abs(this._iScrollProgress) * 20, iPageHeight / 2));
				}
				iScrollTop += iShift;
				Log.debug("ObjectPageLayout :: lazyLoading", "Visible page shifted from : " + iShift);
			}
			iScrollPageBottom = iScrollTop + iPageHeight;       //the bottom limit

			//don't load subsections which are hardly visible at the top of the page (less than 16 pixels visible)
			//to avoid having the following subsections moving downward as subsection size will likely increase during loading
			iScrollTop += 16;

			//check the visible subsections
			//only consider subsections not yet loaded
			jQuery.each(oSectionInfo, jQuery.proxy(function (sId, oInfo) {
				// on desktop/tablet, find a section, not a subsection
				if (!oInfo.isSection && oInfo.sectionReference.getParent() && oInfo.sectionReference.getParent().getVisible()) {

					if (bIconTabBar && oSelectedSection && oSelectedSection.indexOfSubSection(oInfo.sectionReference) < 0) {
						return; // ignore hidden tabs content
					}
					// 1D segment intersection between visible page and current sub section
					// C <= B and A <= D -> intersection
					//    A-----B
					//  C---D
					//       C----D
					//     C-D
					// C-----------D
					if (oInfo.positionTop <= iScrollPageBottom && iScrollTop < oInfo.positionBottom - 1) {
						oSubSectionsInView[sId] = sId;
						if (!oInfo.loaded) {
							oSubSectionsToLoad[sId] = sId;
						}
						// Lazy loading will add an extra subsection :
						//    the first (highest) subsection not yet visible (and not yet loaded)
						//    top of this subsection must be close from page bottom (less than 0.5 page : LAZY_LOADING_EXTRA_PAGE_SIZE)
					} else if (!oInfo.loaded && oInfo.positionTop > iScrollPageBottom &&
						oInfo.positionTop < iScrollPageBottom + iPageHeight * this.LAZY_LOADING_EXTRA_PAGE_SIZE &&
						(iExtraSubSectionTop == -1 || oInfo.positionTop < iExtraSubSectionTop)) {
						iExtraSubSectionTop = oInfo.positionTop;
						sExtraSubSectionId = sId;
					}
				}

			}, this));

			//add the extra subsection if:
			//      - we have found one
			//      - we have no visible subsections to load
			if (iExtraSubSectionTop != -1 &&
				jQuery.isEmptyObject(oSubSectionsToLoad)) {
				Log.debug("ObjectPageLayout :: lazyLoading", "extra section added : " + sExtraSubSectionId);
				oSubSectionsToLoad[sExtraSubSectionId] = sExtraSubSectionId;
			}

			//Load the subsections
			jQuery.each(oSubSectionsToLoad, jQuery.proxy(function (idx, sSectionId) {
				Log.debug("ObjectPageLayout :: lazyLoading", "connecting " + sSectionId);
				sap.ui.getCore().byId(sSectionId).connectToModels();
				oSectionInfo[sSectionId].loaded = true;
			}, this));

			// fire event for sections scrolled in view (for app to resume binding)
			jQuery.each(oSubSectionsInView, jQuery.proxy(function (idx, sSectionId) {
				if (!this._oPrevSubSectionsInView[idx]) {
					// newly scrolled in view
					Log.debug("ObjectPageLayout :: lazyLoading", "subSectionEnteredViewPort " + sSectionId);
					this._oObjectPageLayout.fireEvent("subSectionEnteredViewPort", {
						subSection: sap.ui.getCore().byId(sSectionId)
					});
				}
			}, this));
			this._oPrevSubSectionsInView = oSubSectionsInView;

			if (bOnGoingScroll) {
				//bOnGoingScroll is just a prediction, we can't be 100% sure as there's no end-of-scroll event
				//so we relaunch a new delayed lazy loading to ensure all visible
				//sections will actually be loaded (no shift) if scroll stops suddenly.
				this._sLazyLoadingTimer = setTimeout(this.doLazyLoading.bind(this), this.LAZY_LOADING_DELAY);
			} else {
				if (iExtraSubSectionTop) {
					//An extra subsection has been found
					//relaunch a delayed lazy loading call to check if there's another extra subsection to load
					//We use a long delay (5* LAZY_LOADING_DELAY) to wait for current loading completion.
					this._sLazyLoadingTimer = setTimeout(this.doLazyLoading.bind(this), this.LAZY_LOADING_EXTRA_SUBSECTION);
				} else {
					//reset the lazy loading timer
					this._sLazyLoadingTimer = null;
				}
			}
		};


		/**
		 * Load in advance the subsections which will likely be visible once the operation (firstRendering or scrolltoSection)
		 * will be complete.
		 * @private
		 * @param {*} aAllSections all sections
		 * @param {*} sId id of the section
		 * @returns {*} sections to preload
		 */
		LazyLoading.prototype.getSubsectionsToPreload = function (aAllSections, sId) {
			var iSubsectionsToPreLoad,
				bTargetSubsectionReached;

			//if no sId, target section is the first section (first rendering).
			if (sId) {
				iSubsectionsToPreLoad = this.NUMBER_OF_SUBSECTIONS_TO_PRELOAD.ScrollToSection;
				bTargetSubsectionReached = false;
			} else {
				iSubsectionsToPreLoad = this.NUMBER_OF_SUBSECTIONS_TO_PRELOAD.FirstRendering;
				bTargetSubsectionReached = true;
			}

			var aSectionsToPreload = [];

			aAllSections.some(function (oSection) {
				if (!bTargetSubsectionReached && sId) {
					bTargetSubsectionReached = oSection.getId() == sId;
				}
				if (bTargetSubsectionReached && oSection instanceof ObjectPageSubSection) {
					if (oSection.getVisible() && oSection._getInternalVisible()) {
						aSectionsToPreload.push(oSection);
						iSubsectionsToPreLoad--;
					}
				}
				return iSubsectionsToPreLoad <= 0;
			});

			return aSectionsToPreload;
		};

		LazyLoading.prototype.destroy = function() {
			if (this._sLazyLoadingTimer) {
				clearTimeout(this._sLazyLoadingTimer);
			}
		};


		LazyLoading.prototype._isPhone = function () {
			return library.Utilities.isPhoneScenario(this._oObjectPageLayout._getCurrentMediaContainerRange());
		};

		LazyLoading.prototype._isTablet = function () {
			return Device.system.tablet;
		};

		LazyLoading.prototype._isTabletSize = function () {
			return library.Utilities.isTabletScenario(this._oObjectPageLayout._getCurrentMediaContainerRange());
		};

		return LazyLoading;

	}, /* bExport= */ false);