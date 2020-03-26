/*!
 * ${copyright}
 */

// Provides control sap.uxap.ObjectPageSubSection.
sap.ui.define([
	"sap/ui/thirdparty/jquery",
	"sap/ui/layout/Grid",
	"sap/ui/layout/GridData",
	"./ObjectPageSectionBase",
	"./ObjectPageLazyLoader",
	"./BlockBase",
	"sap/m/Button",
	"sap/ui/Device",
	"sap/ui/core/StashedControlSupport",
	"sap/ui/base/ManagedObjectObserver",
	"sap/m/TitlePropagationSupport",
	"./library",
	"sap/m/library",
	"./ObjectPageSubSectionRenderer",
	"sap/base/Log",
	"sap/ui/base/DataType",
	"sap/ui/events/KeyCodes",
	// jQuery Plugin "firstFocusableDomRef"
	"sap/ui/dom/jquery/Focusable"
], function(
	jQuery,
	Grid,
	GridData,
	ObjectPageSectionBase,
	ObjectPageLazyLoader,
	BlockBase,
	Button,
	Device,
	StashedControlSupport,
	ManagedObjectObserver,
	TitlePropagationSupport,
	library,
	mobileLibrary,
	ObjectPageSubSectionRenderer,
	Log,
	DataType,
	KeyCodes
) {
	"use strict";

	// shortcut for sap.m.ButtonType
	var ButtonType = mobileLibrary.ButtonType;

	// shortcut for sap.uxap.ObjectPageSubSectionMode
	var ObjectPageSubSectionMode = library.ObjectPageSubSectionMode;

	// shortcut for sap.uxap.ObjectPageSubSectionLayout
	var ObjectPageSubSectionLayout = library.ObjectPageSubSectionLayout;

	/**
	 * Constructor for a new <code>ObjectPageSubSection</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * Second-level information container of an {@link sap.uxap.ObjectPageLayout}.
	 *
	 * An <code>ObjectPageSubSection</code> may only be used within sections in the
	 * <code>ObjectPageLayout</code>. Subsections are used to display primary information in
	 * the <code>blocks</code> aggregation (always visible) and not-so-important information in
	 * the <code>moreBlocks</code> aggregation. The content in the <code>moreBlocks</code>
	 * aggregation is initially hidden, but may be accessed with a "See more" (...) button.
	 *
	 * As of version 1.61, applications can enable auto-expand of the subsections to fit the sections container
	 * by adding the <code>sapUxAPObjectPageSubSectionFitContainer</code> class to the subsection. This is useful in
	 * situations where the sub-section contains a control that has “100%” height, for example,
	 * <code>sap.ui.table.Table</code> with <code>visibleRowCountMode</code> set to <code>Auto</code>.
	 *
	 * <b>Note:</b> This control is intended to be used only as part of the <code>ObjectPageLayout</code>.
	 *
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
				 * Determines whether to display the <code>SubSection</code> title or not.
				 *
				 * <b>Note:</b> If a subsection is the only one (or the only one visible) within a section, its title is
				 * displayed instead of the section title even if this property is set to <code>false</code>.
				 * To hide the title of a subsection which is the only one (or the only one visible), you need to set the
				 * <code>showTitle</code> properties to <code>false</code> for both the section and its subsection.
				 * @since 1.77
				 */
				showTitle: {type: "boolean", group: "Appearance", defaultValue: true},

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
				 *
				 * <b>Note:</b> The SAP Fiori Design guidelines require that the
				 * <code>ObjectPageHeader</code>'s content and the <code>ObjectPage</code>'s subsection content
				 * are aligned vertically. When using {@link sap.ui.layout.form.Form},
				 * {@link sap.m.Panel}, {@link sap.m.Table} and {@link sap.m.List} in the subsection
				 * content area of <code>ObjectPage</code>, if the content is not already aligned, you need to adjust their left
				 * text offset to achieve the vertical alignment.  To do this, apply the
				 * <code>sapUxAPObjectPageSubSectionAlignContent</code>
				 * CSS class to them and set their <code>width</code> property to <code>auto</code>
				 * (if not set by default).
				 *
				 * Don't use the <code>sapUxAPObjectPageSubSectionAlignContent</code> CSS class in the following cases:
				 * <ul>
				 * <li>In combination with <code>ResponsiveLayout</code>, because <code>ResponsiveLayout</code> applies custom paddings.
				 * To align items with <code>sapUxAPObjectPageSubSectionAlignContent</code>, use <code>ColumnLayout</code>.</li>
				 * <li>If there are multiple controls in the same <code>ObjectPageSubSection</code>, because the CSS class
				 * interferes with their alignment.</li>
				 * </ul>
				 * Example:
				 *
				 * <pre>
				 * <code> &lt;Panel class="sapUxAPObjectPageSubSectionAlignContent" width="auto"&gt;&lt;/Panel&gt; </code>
				 * </pre>
				 *
				 */
				blocks: {type: "sap.ui.core.Control", multiple: true, singularName: "block"},

				/**
				 * Additional controls to display when the Show more / See all / (...) button is pressed
				 */
				moreBlocks: {type: "sap.ui.core.Control", multiple: true, singularName: "moreBlock"},

				/**
				 * Actions available for this subsection.
				 *
				 * Although this aggregation accepts type <code>sap.ui.core.Control</code>,
				 * it is strongly recommended to use only simple controls, such as buttons, so that
				 * the layout of the app is preserved.
				 *
				 * <b>Note:</b> Keep in mind that the controls set in the <code>actions</code> aggregation
				 * of <code>ObjectPageSubSection</code> do NOT have overflow behavior. If the
				 * available space is not enough, the controls will be displayed on more lines.
				 */
				actions: {type: "sap.ui.core.Control", multiple: true, singularName: "action"}
			},
			designtime: "sap/uxap/designtime/ObjectPageSubSection.designtime"
		}
	});

	// Add Title Propagation Support
	TitlePropagationSupport.call(ObjectPageSubSection.prototype, "blocks", function () {
		return this._getTitleDomId();
	});


	ObjectPageSubSection.FIT_CONTAINER_CLASS = "sapUxAPObjectPageSubSectionFitContainer";

	/**
	 * Retrieves the resource bundle for the <code>sap.uxap</code> library.
	 * @static
	 * @private
	 * @returns {Object} the resource bundle object
	 */
	ObjectPageSubSection._getLibraryResourceBundle = function() {
		return sap.ui.getCore().getLibraryResourceBundle("sap.uxap");
	};

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
		this._sMoreContainerSelector = ".sapUxAPSubSectionSeeMoreContainer";

		this._oObserver = new ManagedObjectObserver(ObjectPageSubSection.prototype._observeChanges.bind(this));
		this._oObserver.observe(this, {
			aggregations: [
				"actions"
			]
		});

		//switch logic for the default mode
		this._switchSubSectionMode(this.getMode());

		// Title Propagation Support
		this._initTitlePropagationSupport();
		this._sBorrowedTitleDomId = false;
		this._height = ""; // css height property
	};

	ObjectPageSubSection.prototype._getHeight = function () {
		return this._height;
	};

	ObjectPageSubSection.prototype._setHeight = function (oValue) {

		var oType, oDom;

		if (this._height === oValue) {
			return;
		}

		oType = DataType.getType("sap.ui.core.CSSSize");

		if (!oType.isValid(oValue)) {
			throw new Error("\"" + oValue + "\" is of type " + typeof oValue + ", expected " +
				oType.getName() + " for property \"_height\" of " + this);
		}
		this._height = oValue;

		oDom = this.getDomRef();
		if (oDom) {
			oDom.style.height = oValue;
		}
	};

	/**
	 * Returns Title DOM ID of the Title of this SubSection
	 * @returns {string|boolean} DOM ID
	 * @private
	 */
	ObjectPageSubSection.prototype._getTitleDomId = function () {
		if (this._sBorrowedTitleDomId) {
			return this._sBorrowedTitleDomId;
		}
		if (!this.getTitle().trim()) {
			return false;
		}
		if (this._getInternalTitleVisible()) {
			return this.getId() + "-headerTitle";
		}
		return false;
	};

	/**
	 * Sets DOM ID of the Title borrowed from this SubSection
	 * @param {string} sId the ID of the DOM Element
	 * @private
	 * @ui5-restricted sap.uxap.ObjectPageLayout
	 */
	ObjectPageSubSection.prototype._setBorrowedTitleDomId = function (sId) {
		this._sBorrowedTitleDomId = sId;
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
				hSpacing: 1,
				vSpacing: 1,
				width: "100%",
				containerQuery: true
			}), true); // this is always called onBeforeRendering so suppress invalidate
		}

		return this.getAggregation("_grid");
	};

	ObjectPageSubSection.prototype._hasVisibleActions = function () {
		var aActions = this.getActions() || [];

		if (aActions.length === 0) {
		 return false;
		}
		return aActions.filter(function(oAction) {
		   return oAction.getVisible();
		}).length > 0;
	};

	/**
	 * Called whenever the actions aggregation is mutated.
	 * @param oChanges
	 * @private
	 */
	ObjectPageSubSection.prototype._observeChanges = function (oChanges) {
		var oObject = oChanges.object,
			sChangeName = oChanges.name,
			sMutationName = oChanges.mutation,
			oChild = oChanges.child,
			bHasTitle;

		if (oObject === this) {// changes on SubSection level

			if (sChangeName === "actions") { // change of the actions aggregation
				if (sMutationName === "insert") {
					this._observeAction(oChild);
				} else if (sMutationName === "remove") {
					this._unobserveAction(oChild);
				}
			}

		} else if (sChangeName === "visible") { // change of the actions elements` visibility
			bHasTitle = this._getInternalTitleVisible() && this.getTitle().trim() !== "";
			if (!bHasTitle) {
				this.$("header").toggleClass("sapUiHidden", !this._hasVisibleActions());
			}
		}
	};

	/**
	 * Starts observing the <code>visible</code> property.
	 * @param {sap.ui.core.Control} oControl
	 * @private
	 */
	ObjectPageSubSection.prototype._observeAction = function(oControl) {
		this._oObserver.observe(oControl, {
			properties: ["visible"]
		});
	};

	/**
	 * Stops observing the <code>visible</code> property.
	 * @param {sap.ui.core.Control} oControl
	 * @private
	 */
	ObjectPageSubSection.prototype._unobserveAction = function(oControl) {
		this._oObserver.unobserve(oControl, {
			properties: ["visible"]
		});
	};

	["addStyleClass", "toggleStyleClass", "removeStyleClass"].forEach(function(sMethodName) {
		ObjectPageSubSection.prototype[sMethodName] = function(sStyleClass, bSuppressRerendering) {
			if (sStyleClass === ObjectPageSubSection.FIT_CONTAINER_CLASS) {
				this._notifyObjectPageLayout();
			}
			return ObjectPageSectionBase.prototype[sMethodName].apply(this, arguments);
		};
	});

	ObjectPageSubSection.prototype._unStashControls = function () {
		StashedControlSupport.getStashedControls(this.getId()).forEach(function (oControl) {
			oControl.setStashed(false);
		});
	};

	ObjectPageSubSection.prototype.connectToModels = function () {
		var aBlocks = this.getBlocks() || [],
			aMoreBlocks = this.getMoreBlocks() || [],
			sCurrentMode = this.getMode();

		this._unStashControls();

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

	ObjectPageSubSection.prototype._allowPropagationToLoadedViews = function (bAllow) {
		var aBlocks = this.getBlocks() || [],
			aMoreBlocks = this.getMoreBlocks() || [];

		aBlocks.forEach(function (oBlock) {
			if (oBlock instanceof BlockBase) {
				oBlock._allowPropagationToLoadedViews(bAllow);
			}
		});

		aMoreBlocks.forEach(function (oMoreBlock) {
			if (oMoreBlock instanceof BlockBase) {
				oMoreBlock._allowPropagationToLoadedViews(bAllow);
			}
		});
	};

	ObjectPageSubSection.prototype.clone = function () {
		Object.keys(this._aAggregationProxy).forEach(function (sAggregationName){
			var oAggregation = this.mAggregations[sAggregationName];

			if (!oAggregation || oAggregation.length === 0){
				this.mAggregations[sAggregationName] = this._aAggregationProxy[sAggregationName];
			}

		}, this);
		return ObjectPageSectionBase.prototype.clone.apply(this, arguments);
	};

	ObjectPageSubSection.prototype._cleanProxiedAggregations = function () {
		var oProxiedAggregations = this._aAggregationProxy;
		Object.keys(oProxiedAggregations).forEach(function (sKey) {
			oProxiedAggregations[sKey].forEach(function (oObject) {
				oObject.destroy();
			});
		});
	};

	ObjectPageSubSection.prototype.exit = function () {
		if (this._oSeeMoreButton) {
			this._oSeeMoreButton.destroy();
			this._oSeeMoreButton = null;
		}

		if (this._oSeeLessButton) {
			this._oSeeLessButton.destroy();
			this._oSeeLessButton = null;
		}

		this._oCurrentlyVisibleSeeMoreLessButton = null;

		this._cleanProxiedAggregations();

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

		this._$spacer = jQuery(document.getElementById(oObjectPageLayout.getId() + "-spacer"));

		if (this._bShouldFocusSeeMoreLessButton) {
			this._bShouldFocusSeeMoreLessButton = false;
			this._oCurrentlyVisibleSeeMoreLessButton.focus();
		}
	};

	ObjectPageSubSection.prototype.onBeforeRendering = function () {
		var oObjectPageLayout = this._getObjectPageLayout();

		if (!oObjectPageLayout) {
			return;
		}

		if (ObjectPageSectionBase.prototype.onBeforeRendering) {
			ObjectPageSectionBase.prototype.onBeforeRendering.call(this);
		}

		this._setAggregationProxy();
		this._getGrid().removeAllContent();
		this._applyLayout(oObjectPageLayout);
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
				oGrid.addAggregation("content", oBlock, true); // this is always called onBeforeRendering so suppress invalidate
			}, this);
		} catch (sError) {
			Log.error("ObjectPageSubSection :: error while building layout " + sLayout + ": " + sError);
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
		var oSeeMoreControl = this._getSeeMoreButton(),
			oSeeLessControl = this._getSeeLessButton();

		this._bBlockHasMore = !!this.getMoreBlocks().length;
		if (!this._bBlockHasMore) {
			this._bBlockHasMore = this.getBlocks().some(function (oBlock) {
				//check if the block ask for the global see more the rule is
				//by default we don't display the see more
				//if one control is visible and ask for it then we display it
				if (oBlock instanceof BlockBase && oBlock.getVisible() && oBlock.getShowSubSectionMore()) {
					return true;
				}
			});
		}

		this.toggleStyleClass("sapUxAPObjectPageSubSectionWithSeeMore", this._bBlockHasMore);

		oSeeMoreControl.toggleStyleClass("sapUxAPSubSectionSeeMoreButtonVisible", this._bBlockHasMore);
		oSeeLessControl.toggleStyleClass("sapUxAPSubSectionSeeMoreButtonVisible", this._bBlockHasMore);

		return this._bBlockHasMore;
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
		// Prevent browser scrolling in case of SPACE key
		if (oEvent.keyCode === KeyCodes.SPACE && oEvent.srcControl.isA("sap.uxap.ObjectPageSubSection")) {
			oEvent.preventDefault();
		}

		// Filter F7 key down
		if (oEvent.keyCode === KeyCodes.F7) {
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
			oBlock.setLayoutData(new GridData(oBlock.getId() + "-layoutData", {
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
			return Math.min(iMax, parseInt(oBlock.getColumnLayout()));
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
			iLayoutCols = parseInt(oBlock.getColumnLayout());
		}

		return iLayoutCols;
	};

	ObjectPageSubSection.prototype._hasAutoLayout = function (oBlock) {
		return !(oBlock instanceof BlockBase) || oBlock.getColumnLayout() == "auto";
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
			this._setAggregation(sAggregationName, this.removeAllAggregation(sAggregationName, true), true);
		}, this));

		this._bRenderedFirstTime = true;
	};

	ObjectPageSubSection.prototype.hasProxy = function (sAggregationName) {
		return this._bRenderedFirstTime && this._aAggregationProxy.hasOwnProperty(sAggregationName);
	};

	ObjectPageSubSection.prototype._getAggregation = function (sAggregationName) {
		return this._aAggregationProxy[sAggregationName];
	};

	ObjectPageSubSection.prototype._setAggregation = function (sAggregationName, aValue, bSuppressInvalidate) {
		this._aAggregationProxy[sAggregationName] = aValue;
		if (bSuppressInvalidate !== true){
			this._notifyObjectPageLayout();
			this.invalidate();
		}
		return this._aAggregationProxy[sAggregationName];
	};

	ObjectPageSubSection.prototype.addAggregation = function (sAggregationName, oObject, bSuppressInvalidate) {
		var aAggregation;

		if (oObject instanceof ObjectPageLazyLoader) {
			oObject.getContent().forEach(function (oControl) {
				this.addAggregation(sAggregationName, oControl, true);
			}, this);

			oObject.removeAllContent();
			oObject.destroy();
			this.invalidate();
			return this;
		}

		if (this.hasProxy(sAggregationName)) {
			aAggregation = this._getAggregation(sAggregationName);
			aAggregation.push(oObject);
			this._setAggregation(sAggregationName, aAggregation, bSuppressInvalidate);

			if (oObject instanceof BlockBase || oObject instanceof ObjectPageLazyLoader) {
				oObject.setParent(this); //let the block know of its parent subsection
			}

			return this;
		}

		return ObjectPageSectionBase.prototype.addAggregation.apply(this, arguments);
	};

	/**
	* Adds an <code>sap.uxap.BlockBase</code> instance to the <code>blocks</code> aggregation.
	*
	* <b>Note:</b> The <code>insertBlock</code> method is not supported by design.
	* If used, it works as an <code>addBlock</code>,
	* adding a single block to the end of the <code>blocks</code> aggregation.
	* @param {sap.uxap.BlockBase} oObject The <code>sap.uxap.BlockBase</code> instance
	* @param {int} iIndex The insertion index
	* @returns {sap.uxap.ObjectPageSubSection} The <code>sap.uxap.ObjectPageSubSection</code> instance
	* @public
	*/
	ObjectPageSubSection.prototype.insertBlock = function (oObject, iIndex) {
		Log.warning("ObjectPageSubSection :: usage of insertBlock is not supported - addBlock is performed instead.");
		return this.addAggregation("blocks", oObject);
	};

	/**
	 * Adds an <code>sap.uxap.BlockBase</code> instance to the <code>moreBlocks</code> aggregation.
	 *
	 * <b>Note:</b> The <code>insertMoreBlock</code> method is not supported by design.
	 * If used, it works as an <code>addMoreBlock</code>,
	 * adding a single block to the end of the <code>moreBlocks</code> aggregation.
	 * @param {sap.uxap.BlockBase} oObject The <code>sap.uxap.BlockBase</code> instance
	 * @param {int} iIndex The insertion index
	 * @returns {sap.uxap.ObjectPageSubSection} The <code>sap.uxap.ObjectPageSubSection</code> instance
	 * @public
	 */
	ObjectPageSubSection.prototype.insertMoreBlock = function (oObject, iIndex) {
		Log.warning("ObjectPageSubSection :: usage of insertMoreBlock is not supported - addMoreBlock is performed instead.");
		return this.addAggregation("moreBlocks", oObject);
	};

	ObjectPageSubSection.prototype.removeAllAggregation = function (sAggregationName, bSuppressInvalidate) {
		var aInternalAggregation;

		if (this.hasProxy(sAggregationName)) {
			aInternalAggregation = this._getAggregation(sAggregationName);
			this._setAggregation(sAggregationName, [], bSuppressInvalidate);
			return aInternalAggregation.slice();
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
					this._setAggregation(sAggregationName, aInternalAggregation);
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
	 * Builds the control that is used internally for the see more / see less button
	 * @private
	 */
	ObjectPageSubSection.prototype._getSeeMoreButton = function () {
		if (!this._oSeeMoreButton) {
			this._oSeeMoreButton = new Button(this.getId() + "--seeMore", {
				type: ButtonType.Transparent,
				iconFirst: false,
				text: ObjectPageSubSection._getLibraryResourceBundle().getText("SHOW_MORE"),
				ariaLabelledBy: this.getId()
			}).addStyleClass("sapUxAPSubSectionSeeMoreButton").attachPress(this._seeMoreLessControlPressHandler, this);
		}

		return this._oSeeMoreButton;
	};

	/**
	 * Builds the control that is used internally for the see more / see less button
	 * @private
	 */
	ObjectPageSubSection.prototype._getSeeLessButton = function () {
		if (!this._oSeeLessButton) {
			this._oSeeLessButton = new Button(this.getId() + "--seeLess", {
				type: ButtonType.Transparent,
				iconFirst: false,
				text: ObjectPageSubSection._getLibraryResourceBundle().getText("SHOW_LESS"),
				ariaLabelledBy: this.getId()
			}).addStyleClass("sapUxAPSubSectionSeeMoreButton").attachPress(this._seeMoreLessControlPressHandler, this);
		}

		return this._oSeeLessButton;
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

		this._bShouldFocusSeeMoreLessButton = true;
	};

	/**
	 * switch the state for the subsection
	 * @param {sap.uxap.ObjectPageSubSectionMode} sSwitchToMode
	 * @private
	 */
	ObjectPageSubSection.prototype._switchSubSectionMode = function (sSwitchToMode) {
		sSwitchToMode = this.validateProperty("mode", sSwitchToMode);

		if (sSwitchToMode === ObjectPageSubSectionMode.Collapsed) {
			this.setProperty("mode", ObjectPageSubSectionMode.Collapsed);
			this._oCurrentlyVisibleSeeMoreLessButton = this._getSeeMoreButton().setVisible(true);
			this._getSeeLessButton().setVisible(false);
		} else {
			this.setProperty("mode", ObjectPageSubSectionMode.Expanded);
			this._getSeeMoreButton().setVisible(false);
			this._oCurrentlyVisibleSeeMoreLessButton = this._getSeeLessButton().setVisible(true);
		}
	};

	/**
	 * set the mode on a control if there is such mode property
	 * @param oBlock
	 * @param {string} sMode
	 * @private
	 */
	ObjectPageSubSection.prototype._setBlockMode = function (oBlock, sMode) {
		if (oBlock instanceof BlockBase) {
			oBlock.setMode(sMode);
		} else {
			Log.debug("ObjectPageSubSection :: cannot propagate mode " + sMode + " to " + oBlock.getMetadata().getName());
		}
	};

	ObjectPageSubSection.prototype._setToFocusable = function (bFocusable) {
		var sFocusable = '0',
			sNotFocusable = '-1',
			sTabIndex = "tabindex";

		if (bFocusable) {
			this.$().attr(sTabIndex, sFocusable);
		} else {
			this.$().attr(sTabIndex, sNotFocusable);
		}

		return this;
	};

	ObjectPageSubSection.prototype._getUseTitleOnTheLeft = function () {
		var oObjectPageLayout = this._getObjectPageLayout();

		return oObjectPageLayout && (oObjectPageLayout.getSubSectionLayout() === ObjectPageSubSectionLayout.TitleOnLeft);
	};

	/**
	 * If this is the first rendering and a layout has been defined by the subsection developer,
	 * We remove it and let the built-in mechanism decide on the layouting aspects
	 * @param aBlocks
	 * @private
	 */
	ObjectPageSubSection.prototype._resetLayoutData = function (aBlocks) {
		aBlocks.forEach(function (oBlock) {
			if (oBlock.getLayoutData()) {
				oBlock.destroyLayoutData();
			}
		}, this);
	};

	ObjectPageSubSection.prototype._updateShowHideState = function (bHide) {
		if (this._getIsHidden() === bHide) {
			return this;
		}

		this.$().children(this._sMoreContainerSelector).toggle(!bHide);

		return ObjectPageSectionBase.prototype._updateShowHideState.call(this, bHide);
	};

	ObjectPageSubSection.prototype.getVisibleBlocksCount = function () {
		var iVisibleBlocks = StashedControlSupport.getStashedControls(this.getId()).length;

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