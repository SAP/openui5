/*!
 * ${copyright}
 */

// Provides control sap.uxap.ObjectPageSubSection.
sap.ui.define([
	"sap/ui/core/CustomData",
	"sap/ui/layout/Grid",
	"./ObjectPageSectionBase",
	"./ObjectPageSubSectionLayout",
	"./ObjectPageSubSectionMode",
	"./BlockBase",
	"sap/ui/layout/GridData",
	"sap/ui/core/ResizeHandler",
	"sap/m/Button",
	"./library"
], function (CustomData, Grid, ObjectPageSectionBase, ObjectPageSubSectionLayout,
			 ObjectPageSubSectionMode, BlockBase, GridData, ResizeHandler, Button, library) {
	"use strict";

	/**
	 * Constructor for a new ObjectPageSubSection.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 *
	 * An ObjectPageSubSection is the second-level information container of an Object page and may only be used within an Object page section.
	 * Subsections may display primary information in the so called blocks aggregation (always visible)
	 * and not-so-important information in the moreBlocks aggregation, whose content is initially hidden, but may be accessed via a See more (...) button.
	 * Disclaimer: This control is intended to be used only as part of the Object page layout
	 * @extends sap.uxap.ObjectPageSectionBase
	 *
	 * @constructor
	 * @public
	 * @alias sap.uxap.ObjectPageSubSection
	 * @since 1.26
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var ObjectPageSubSection = ObjectPageSectionBase.extend("sap.uxap.ObjectPageSubSection", /** @lends sap.uxap.ObjectPageSubSection.prototype */ {
		metadata: {

			library: "sap.uxap",
			properties: {

				/**
				 * A mode property that will be passed to the controls in the blocks and moreBlocks aggregations. Only relevant if these aggregations use Object page blocks.
				 */
				mode: {
					type: "sap.uxap.ObjectPageSubSectionMode",
					group: "Appearance",
					defaultValue: ObjectPageSubSectionMode.Collapsed
				},

				/**
				 * Determines whether the Subsection title is displayed in upper case.
				 */
				titleUppercase: {type: "boolean", group: "Appearance", defaultValue: false}
			},
			defaultAggregation: "blocks",
			aggregations: {

				/**
				 * Internal grid aggregation
				 */
				_grid: {type: "sap.ui.core.Control", multiple: false, visibility: "hidden"},

				/**
				 * Controls to be displayed in the subsection
				 */
				blocks: {type: "sap.ui.core.Control", multiple: true, singularName: "block"},

				/**
				 * Additional controls to display when the Show more / See all / (...) button is pressed
				 */
				moreBlocks: {type: "sap.ui.core.Control", multiple: true, singularName: "moreBlock"},

				/**
				 * Actions available for this Subsection
				 */
				actions: {type: "sap.ui.core.Control", multiple: true, singularName: "action"}
			}
		}
	});


	/**
	 * @private
	 */
	ObjectPageSubSection.prototype.init = function () {
		ObjectPageSectionBase.prototype.init.call(this);

		//proxy public aggregations
		this._bRenderedFirstTime = false;
		this._aAggregationProxy = {blocks: [], moreBlocks: []};

		//dom reference
		this._$spacer = [];
		this._sContainerSelector = ".sapUxAPBlockContainer";

		//switch logic for the default mode
		this._switchSubSectionMode(this.getMode());
	};

	ObjectPageSubSection.prototype._expandSection = function () {
		ObjectPageSectionBase.prototype._expandSection.call(this);
		var oParent = this.getParent();
		oParent && typeof oParent._expandSection === "function" && oParent._expandSection();
		return this;
	};

	ObjectPageSubSection.prototype._getGrid = function () {
		if (!this.getAggregation("_grid")) {
			this.setAggregation("_grid", new Grid({
				id: this.getId() + "-innerGrid",
				defaultSpan: "XL12 L12 M12 S12",
				hSpacing: 0,
				vSpacing: 1,
				width: "100%",
				containerQuery: true
			}));
		}

		return this.getAggregation("_grid");
	};

	ObjectPageSubSection.prototype.connectToModels = function () {
		var aBlocks = this.getBlocks() || [],
			aMoreBlocks = this.getMoreBlocks() || [],
			sCurrentMode = this.getMode();

		aBlocks.forEach(function (oBlock) {
			if (oBlock instanceof BlockBase) {
				if (!oBlock.getMode()) {
					oBlock.setMode(sCurrentMode);
				}
				oBlock.connectToModels();
			}
		});

		if (aMoreBlocks.length > 0 && sCurrentMode === ObjectPageSubSectionMode.Expanded) {
			aMoreBlocks.forEach(function (oMoreBlock) {
				if (oMoreBlock instanceof BlockBase) {
					if (!oMoreBlock.getMode()) {
						oMoreBlock.setMode(sCurrentMode);
					}
					oMoreBlock.connectToModels();
				}
			});
		}
	};

	ObjectPageSubSection.prototype.exit = function () {
		if (this._oSeeMoreButton) {
			this._oSeeMoreButton.destroy();
			this._oSeeMoreButton = null;
		}

		if (this._iResizeId) {
			ResizeHandler.deregister(this._iResizeId);
		}

		if (ObjectPageSectionBase.prototype.exit) {
			ObjectPageSectionBase.prototype.exit.call(this);
		}
	};

	ObjectPageSubSection.prototype.onAfterRendering = function () {
		var oObjectPageLayout = this._getObjectPageLayout();

		if (ObjectPageSectionBase.prototype.onAfterRendering) {
			ObjectPageSectionBase.prototype.onAfterRendering.call(this);
		}

		if (!oObjectPageLayout) {
			return;
		}

		if (oObjectPageLayout.getSubSectionLayout() === ObjectPageSubSectionLayout.TitleOnLeft) {
			this._afterRenderingTitleOnLeftLayout();
		}

		this._$spacer = jQuery.sap.byId(oObjectPageLayout.getId() + "-spacer");
	};

	ObjectPageSubSection.prototype.onBeforeRendering = function () {
		if (ObjectPageSectionBase.prototype.onBeforeRendering) {
			ObjectPageSectionBase.prototype.onBeforeRendering.call(this);
		}

		this._setAggregationProxy();
		this._getGrid().removeAllContent();
		this._applyLayout(this._getObjectPageLayout());
		this.refreshSeeMoreVisibility();
	};

	ObjectPageSubSection.prototype._applyLayout = function (oLayoutProvider) {
		var aVisibleBlocks,
			oGrid = this._getGrid(),
			sCurrentMode = this.getMode(),
			sLayout = oLayoutProvider.getSubSectionLayout(),
			oLayoutConfig = this._calculateLayoutConfiguration(sLayout, oLayoutProvider),
			aBlocks = this.getBlocks(),
			aAllBlocks = aBlocks.concat(this.getMoreBlocks());

		this._oLayoutConfig = oLayoutConfig;
		this._resetLayoutData(aAllBlocks);

		//also add the more blocks defined for being visible in expanded mode only
		if (sCurrentMode === ObjectPageSubSectionMode.Expanded) {
			aVisibleBlocks = aAllBlocks;
		} else {
			aVisibleBlocks = aBlocks;
		}

		this._calcBlockColumnLayout(aVisibleBlocks, this._oLayoutConfig);

		try {
			aVisibleBlocks.forEach(function (oBlock) {
				this._setBlockMode(oBlock, sCurrentMode);
				oGrid.addContent(oBlock);
			}, this);
		} catch (sError) {
			jQuery.sap.log.error("ObjectPageSubSection :: error while building layout " + sLayout + ": " + sError);
		}

		return this;
	};

	ObjectPageSubSection.prototype._calculateLayoutConfiguration = function (sLayout, oLayoutProvider) {
		var oLayoutConfig = {M: 2, L: 3, XL: 4},
			iLargeScreenColumns = oLayoutConfig.L,
			iExtraLargeScreenColumns = oLayoutConfig.XL,
			bTitleOnTheLeft = (sLayout === ObjectPageSubSectionLayout.TitleOnLeft),
			bUseTwoColumnsOnLargeScreen = oLayoutProvider.getUseTwoColumnsForLargeScreen();

		if (bTitleOnTheLeft) {
			iLargeScreenColumns -= 1;
			iExtraLargeScreenColumns -= 1;
		}

		if (bUseTwoColumnsOnLargeScreen) {
			iLargeScreenColumns -= 1;
		}

		oLayoutConfig.L = iLargeScreenColumns;
		oLayoutConfig.XL = iExtraLargeScreenColumns;

		return oLayoutConfig;
	};

	ObjectPageSubSection.prototype.refreshSeeMoreVisibility = function () {
		var bBlockHasMore = !!this.getMoreBlocks().length,
			oSeeMoreControl = this._getSeeMoreButton(),
			$seeMoreControl = oSeeMoreControl.$(),
			$this = this.$();

		if (!bBlockHasMore) {
			bBlockHasMore = this.getBlocks().some(function (oBlock) {
				//check if the block ask for the global see more the rule is
				//by default we don't display the see more
				//if one control is visible and ask for it then we display it
				if (oBlock instanceof BlockBase && oBlock.getVisible() && oBlock.getShowSubSectionMore()) {
					return true;
				}
			});
		}

		//if the subsection is already rendered, don't rerender it all for showing a more button
		if ($this.length) {
			$this.toggleClass("sapUxAPObjectPageSubSectionWithSeeMore", bBlockHasMore);
		}

		this.toggleStyleClass("sapUxAPObjectPageSubSectionWithSeeMore", bBlockHasMore);

		if ($seeMoreControl.length) {
			$seeMoreControl.toggleClass("sapUxAPSubSectionSeeMoreButtonVisible", bBlockHasMore);
		}

		oSeeMoreControl.toggleStyleClass("sapUxAPSubSectionSeeMoreButtonVisible", bBlockHasMore);

		return bBlockHasMore;
	};

	ObjectPageSubSection.prototype.setMode = function (sMode) {
		if (this.getMode() !== sMode) {
			this._switchSubSectionMode(sMode);

			if (this._bRenderedFirstTime) {
				this.rerender();
			}
		}
		return this;
	};

	/*******************************************************************************
	 * Keyboard navigation
	 ******************************************************************************/

	/**
	 * Handler for key down - handle
	 * @param oEvent - The event object
	 */

	ObjectPageSubSection.prototype.onkeydown = function (oEvent) {
		// Filter F7 key down
		if (oEvent.keyCode === jQuery.sap.KeyCodes.F7) {
			oEvent.stopPropagation();
			var oTarget = sap.ui.getCore().byId(oEvent.target.id);

			//define if F7 is pressed from SubSection itself or active element inside SubSection
			if (oTarget instanceof ObjectPageSubSection) {
				this._handleSubSectionF7();
			} else {
				this._handleInteractiveElF7();
				this._oLastFocusedControlF7 = oTarget;
			}
		}
	};

	// It's used when F7 key is pressed and the focus is on interactive element
	ObjectPageSubSection.prototype._handleInteractiveElF7 = function () {
		//If there are more sub sections focus current subsection otherwise focus the parent section
		if (this.getParent().getSubSections().length > 1) {
			this.$().focus();
		} else {
			this.getParent().$().focus();
		}
	};

	//It's used when F7 key is pressed and the focus is on SubSection
	ObjectPageSubSection.prototype._handleSubSectionF7 = function (oEvent) {
		if (this._oLastFocusedControlF7) {
			this._oLastFocusedControlF7.$().focus();
		} else {
			this.$().firstFocusableDomRef().focus();
		}
	};

	/*************************************************************************************
	 * generic block layout calculation
	 ************************************************************************************/

	/**
	 * calculate the layout data to use for subsection blocks
	 * Aligned with PUX specifications as of Oct 14, 2014
	 */
	ObjectPageSubSection.prototype._calcBlockColumnLayout = function (aBlocks, oColumnConfig) {
		var iGridSize = 12,
			aVisibleBlocks,
			M, L, XL,
			aDisplaySizes;

		M = {
			iRemaining: oColumnConfig.M,
			iColumnConfig: oColumnConfig.M
		};

		L = {
			iRemaining: oColumnConfig.L,
			iColumnConfig: oColumnConfig.L
		};

		XL = {
			iRemaining: oColumnConfig.XL,
			iColumnConfig: oColumnConfig.XL
		};

		aDisplaySizes = [XL, L, M];

		//step 1: get only visible blocks into consideration
		aVisibleBlocks = aBlocks.filter(function (oBlock) {
			return oBlock.getVisible && oBlock.getVisible();
		});

		//step 2: set layout for each blocks based on their columnLayout configuration
		//As of Oct 14, 2014, the default behavior is:
		//on phone, blocks take always the full line
		//on tablet, desktop:
		//1 block on the line: takes 3/3 columns
		//2 blocks on the line: takes 1/3 columns then 2/3 columns
		//3 blocks on the line: takes 1/3 columns then 1/3 columns and last 1/3 columns

		aVisibleBlocks.forEach(function (oBlock, iIndex) {

			aDisplaySizes.forEach(function (oConfig) {
				oConfig.iCalculatedSize = this._calculateBlockSize(oBlock, oConfig.iRemaining,
					aVisibleBlocks, iIndex, oConfig.iColumnConfig);
			}, this);

			//set block layout based on resolution and break to a new line if necessary
			oBlock.setLayoutData(new GridData({
				spanS: iGridSize,
				spanM: M.iCalculatedSize * (iGridSize / M.iColumnConfig),
				spanL: L.iCalculatedSize * (iGridSize / L.iColumnConfig),
				spanXL: XL.iCalculatedSize * (iGridSize / XL.iColumnConfig),
				linebreakM: (iIndex > 0 && M.iRemaining === M.iColumnConfig),
				linebreakL: (iIndex > 0 && L.iRemaining === L.iColumnConfig),
				linebreakXL: (iIndex > 0 && XL.iRemaining === XL.iColumnConfig)
			}));

			aDisplaySizes.forEach(function (oConfig) {
				oConfig.iRemaining -= oConfig.iCalculatedSize;
				if (oConfig.iRemaining < 1) {
					oConfig.iRemaining = oConfig.iColumnConfig;
				}
			});

		}, this);

		return aVisibleBlocks;
	};

	ObjectPageSubSection.prototype._calculateBlockSize = function (oBlock, iRemaining, aVisibleBlocks, iCurrentIndex, iMax) {
		var iCalc, iForewordBlocksToCheck = iMax, indexOffset;

		if (!this._hasAutoLayout(oBlock)) {
			return Math.min(iMax, parseInt(oBlock.getColumnLayout(), 10));
		}

		for (indexOffset = 1; indexOffset <= iForewordBlocksToCheck; indexOffset++) {
			iCalc = this._calcLayout(aVisibleBlocks[iCurrentIndex + indexOffset]);
			if (iCalc < iRemaining) {
				iRemaining -= iCalc;
			} else {
				break;
			}
		}

		return iRemaining;
	};

	ObjectPageSubSection.prototype._calcLayout = function (oBlock) {
		var iLayoutCols = 1;

		if (!oBlock) {
			iLayoutCols = 0;
		} else if (oBlock instanceof BlockBase && oBlock.getColumnLayout() != "auto") {
			iLayoutCols = parseInt(oBlock.getColumnLayout(), 10);
		}

		return iLayoutCols;
	};

	ObjectPageSubSection.prototype._hasAutoLayout = function (oBlock) {
		return !(oBlock instanceof BlockBase) || oBlock.getColumnLayout() == "auto";
	};


	/*************************************************************************************
	 * TitleOnLeft layout
	 ************************************************************************************/

	/**
	 * on after rendering actions for the titleOnLeft Layout
	 * @private
	 */
	ObjectPageSubSection.prototype._afterRenderingTitleOnLeftLayout = function () {
		this._$standardHeader = jQuery.sap.byId(this.getId() + "-header");
		this._$grid = this._getGrid().$();

		if (!this._iResizeId) {
			this._iResizeId = ResizeHandler.register(this, this._titleOnLeftSynchronizeLayouts.bind(this));
		}

		this._titleOnLeftSynchronizeLayouts();
	};

	ObjectPageSubSection.prototype._titleOnLeftSynchronizeLayouts = function () {
		jQuery.sap.delayedCall(50 /* dom painting */, this, function () {

			var oRootNode = jQuery("html"),
				bUseTitleOnTheLeftLayout = oRootNode.hasClass("sapUiMedia-Std-Desktop")
					|| oRootNode.hasClass("sapUiMedia-Std-LargeDesktop");
			this._$standardHeader.toggleClass("titleOnLeftLayout", bUseTitleOnTheLeftLayout);
		});
	};


	/*************************************************************************************
	 *  blocks & moreBlocks aggregation proxy
	 *  getter and setters works with _aAggregationProxy instead of the blocks aggregation
	 ************************************************************************************/

	ObjectPageSubSection.prototype._setAggregationProxy = function () {
		if (this._bRenderedFirstTime) {
			return;
		}

		//empty real aggregations and feed internal ones at first rendering only
		jQuery.each(this._aAggregationProxy, jQuery.proxy(function (sAggregationName, aValue) {
			this._setAggregation(sAggregationName, this.removeAllAggregation(sAggregationName));
		}, this));

		this._bRenderedFirstTime = true;
	};

	ObjectPageSubSection.prototype.hasProxy = function (sAggregationName) {
		return this._bRenderedFirstTime && this._aAggregationProxy.hasOwnProperty(sAggregationName);
	};

	ObjectPageSubSection.prototype._getAggregation = function (sAggregationName) {
		return this._aAggregationProxy[sAggregationName];
	};

	ObjectPageSubSection.prototype._setAggregation = function (sAggregationName, aValue) {
		this._aAggregationProxy[sAggregationName] = aValue;
		this._notifyObjectPageLayout();
		this.invalidate();
		return this._aAggregationProxy[sAggregationName];
	};

	ObjectPageSubSection.prototype.addAggregation = function (sAggregationName, oObject) {
		var aAggregation;

		if (this.hasProxy(sAggregationName)) {
			aAggregation = this._getAggregation(sAggregationName);
			aAggregation.push(oObject);
			this._setAggregation(aAggregation);

			if (oObject instanceof BlockBase) {
				oObject.setParent(this); //let the block know of its parent subsection
			}

			return this;
		}

		return ObjectPageSectionBase.prototype.addAggregation.apply(this, arguments);
	};

	ObjectPageSubSection.prototype.insertAggregation = function (sAggregationName, oObject, iIndex) {
		if (this.hasProxy(sAggregationName)) {
			jQuery.sap.log.warning("ObjectPageSubSection :: used of insertAggregation for " + sAggregationName + " is not supported, will use addAggregation instead");
			return this.addAggregation(sAggregationName, oObject);
		}

		return ObjectPageSectionBase.prototype.insertAggregation.apply(this, arguments);
	};

	ObjectPageSubSection.prototype.removeAllAggregation = function (sAggregationName) {
		var aInternalAggregation, aItems;

		if (this.hasProxy(sAggregationName)) {
			aInternalAggregation = this._getAggregation(sAggregationName);
			aItems = aInternalAggregation.slice(0, aInternalAggregation.length - 1);
			this._setAggregation(sAggregationName, []);
			return aItems;
		}

		return ObjectPageSectionBase.prototype.removeAllAggregation.apply(this, arguments);
	};

	ObjectPageSubSection.prototype.removeAggregation = function (sAggregationName, oObject) {
		var bRemoved = false, aInternalAggregation;

		if (this.hasProxy(sAggregationName)) {
			aInternalAggregation = this._getAggregation(sAggregationName);
			aInternalAggregation.forEach(function (oObjectCandidate, iIndex) {
				if (oObjectCandidate.getId() === oObject.getId()) {
					aInternalAggregation.splice(iIndex, 1);
					this._setAggregation(aInternalAggregation);
					bRemoved = true;
				}
				return !bRemoved;
			}, this);

			return (bRemoved ? oObject : null);
		}

		return ObjectPageSectionBase.prototype.removeAggregation.apply(this, arguments);
	};

	ObjectPageSubSection.prototype.indexOfAggregation = function (sAggregationName, oObject) {
		var iIndexFound = -1;

		if (this.hasProxy(sAggregationName)) {
			this._getAggregation(sAggregationName).some(function (oObjectCandidate, iIndex) {
				if (oObjectCandidate.getId() === oObject.getId()) {
					iIndexFound = iIndex;
					return true;
				}
			}, this);

			return iIndexFound;
		}

		return ObjectPageSectionBase.prototype.indexOfAggregation.apply(this, arguments);
	};

	ObjectPageSubSection.prototype.getAggregation = function (sAggregationName) {
		if (this.hasProxy(sAggregationName)) {
			return this._getAggregation(sAggregationName);
		}

		return ObjectPageSectionBase.prototype.getAggregation.apply(this, arguments);
	};

	ObjectPageSubSection.prototype.destroyAggregation = function (sAggregationName) {
		if (this.hasProxy(sAggregationName)) {
			this._getAggregation(sAggregationName).forEach(function (object) {
				object.destroy();
			});

			this._setAggregation(sAggregationName, []);

			return this;
		}

		return ObjectPageSectionBase.prototype.destroyAggregation.apply(this, arguments);
	};

	/*************************************************************************************
	 *  Private section : should overridden with care
	 ************************************************************************************/

	/**
	 * build the control that will used internally for the see more / see less
	 * @private
	 */
	ObjectPageSubSection.prototype._getSeeMoreButton = function () {
		if (!this._oSeeMoreButton) {
			this._oSeeMoreButton = new Button(this.getId() + "--seeMore", {
				type: sap.m.ButtonType.Transparent,
				iconFirst: false
			}).addStyleClass("sapUxAPSubSectionSeeMoreButton").attachPress(this._seeMoreLessControlPressHandler, this);
		}

		return this._oSeeMoreButton;
	};

	/**
	 * called when a user clicks on the see more or see all button
	 * @param oEvent
	 * @private
	 */
	ObjectPageSubSection.prototype._seeMoreLessControlPressHandler = function (oEvent) {
		var sCurrentMode = this.getMode(),
			sTargetMode,
			aMoreBlocks = this.getMoreBlocks() || [];

		//we just switch the layoutMode for the underlying blocks
		if (sCurrentMode === ObjectPageSubSectionMode.Expanded) {
			sTargetMode = ObjectPageSubSectionMode.Collapsed;
		} else {/* we are in Collapsed */
			sTargetMode = ObjectPageSubSectionMode.Expanded;

			aMoreBlocks.forEach(function (oBlock) {
				if (oBlock instanceof BlockBase) {
					oBlock.setMode(sCurrentMode);
					oBlock.connectToModels();
				}
			}, this);
		}
		this._switchSubSectionMode(sTargetMode);

		//in case of the last subsection of an objectpage we need to compensate its height change while rerendering)
		if (this._$spacer.length > 0) {
			this._$spacer.height(this._$spacer.height() + this.$().height());
		}

		//need to re-render the subsection in order to render all the blocks with the appropriate mode & layout
		//0000811842 2014
		this.rerender();
	};

	/**
	 * switch the state for the subsection
	 * @param sSwitchToMode
	 * @private
	 */
	ObjectPageSubSection.prototype._switchSubSectionMode = function (sSwitchToMode) {
		sSwitchToMode = this.validateProperty("mode", sSwitchToMode);

		if (sSwitchToMode === ObjectPageSubSectionMode.Collapsed) {
			this.setProperty("mode", ObjectPageSubSectionMode.Collapsed, true);
			this._getSeeMoreButton().setText(library.i18nModel.getResourceBundle().getText("SEE_MORE"));
		} else {
			this.setProperty("mode", ObjectPageSubSectionMode.Expanded, true);
			this._getSeeMoreButton().setText(library.i18nModel.getResourceBundle().getText("SEE_LESS"));
		}
	};

	/**
	 * set the mode on a control if there is such mode property
	 * @param oBlock
	 * @param sMode
	 * @private
	 */
	ObjectPageSubSection.prototype._setBlockMode = function (oBlock, sMode) {
		if (oBlock instanceof BlockBase) {
			oBlock.setMode(sMode);
		} else {
			jQuery.sap.log.debug("ObjectPageSubSection :: cannot propagate mode " + sMode + " to " + oBlock.getMetadata().getName());
		}
	};

	ObjectPageSubSection.prototype._setToFocusable = function (bFocusable) {
		var sFocusable = '0',
			sNotFocusable = '-1',
			sTabIndex = "tabIndex";

		if (bFocusable) {
			this.$().attr(sTabIndex, sFocusable);
		} else {
			this.$().attr(sTabIndex, sNotFocusable);
		}

		return this;
	};

	/**
	 * If this is the first rendering and a layout has been defined by the subsection developer,
	 * We remove it and let the built-in mechanism decide on the layouting aspects
	 * @param aBlocks
	 * @private
	 */
	ObjectPageSubSection.prototype._resetLayoutData = function (aBlocks) {
		aBlocks.forEach(function (oBlock) {
			if (!this._bRenderedFirstTime && oBlock.getLayoutData()) {
				oBlock.destroyLayoutData();
				jQuery.sap.log.warning("ObjectPageSubSection :: forbidden use of layoutData for block " +
					oBlock.getMetadata().getName(), "layout will be set by subSection");
			}
		}, this);
	};

	ObjectPageSubSection.prototype.getVisibleBlocksCount = function () {
		var iVisibleBlocks = 0;

		(this.getBlocks() || []).forEach(function (oBlock) {
			if (oBlock.getVisible && !oBlock.getVisible()) {
				return true;
			}

			iVisibleBlocks++;
		});

		(this.getMoreBlocks() || []).forEach(function (oMoreBlock) {
			if (oMoreBlock.getVisible && !oMoreBlock.getVisible()) {
				return true;
			}

			iVisibleBlocks++;
		});

		return iVisibleBlocks;
	};

	return ObjectPageSubSection;
});
