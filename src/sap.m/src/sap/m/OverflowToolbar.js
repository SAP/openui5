/*!
 * ${copyright}
 */

// Provides control sap.m.OverflowToolbar.
sap.ui.define([
	"jquery.sap.global",
	"./library",
	"sap/m/ToggleButton",
	"sap/ui/core/InvisibleText",
	"sap/m/Toolbar",
	"sap/m/ToolbarSpacer",
	"sap/m/OverflowToolbarLayoutData",
	"sap/m/OverflowToolbarAssociativePopover",
	"sap/m/OverflowToolbarAssociativePopoverControls",
	"sap/ui/core/IconPool",
	"sap/ui/Device",
	"./OverflowToolbarRenderer"
], function(
	jQuery,
	library,
	ToggleButton,
	InvisibleText,
	Toolbar,
	ToolbarSpacer,
	OverflowToolbarLayoutData,
	OverflowToolbarAssociativePopover,
	OverflowToolbarAssociativePopoverControls,
	IconPool,
	Device,
	OverflowToolbarRenderer
) {
	"use strict";

	// shortcut for sap.m.PlacementType
	var PlacementType = library.PlacementType;

	// shortcut for sap.m.ButtonType
	var ButtonType = library.ButtonType;


	// shortcut for sap.m.OverflowToolbarPriority
	var OverflowToolbarPriority = library.OverflowToolbarPriority;


	/**
	 * Constructor for a new <code>OverflowToolbar</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * A container control based on {@link sap.m.Toolbar}, that provides overflow when
	 * its content does not fit in the visible area.
	 *
	 * <h3>Overview</h3>
	 *
	 * The content of the <code>OverflowToolbar</code> moves into the overflow area from
	 * right to left when the available space is not enough in the visible area of
	 * the container. It can be accessed by the user through the overflow button that
	 * opens it in a popover.
	 *
	 * <b>Note:</b> It is recommended that you use <code>OverflowToolbar</code> over
	 * {@link sap.m.Toolbar}, unless you want to avoid overflow in favor of shrinking.
	 *
	 * <h3>Usage</h3>
	 *
	 * Different behavior and priorities can be set for each control inside the
	 * <code>OverflowToolbar</code>, such as certain controls to appear only in the
	 * overflow area or to never move there. For more information, see
	 * {@link sap.m.OverflowToolbarLayoutData} and {@link sap.m.OverflowToolbarPriority}.
	 *
	 * <h3>Overflow Behavior</h3>
	 * By default, only the following controls can move to the overflow area:
	 *
	 * <ul><li>{@link sap.m.Button}</li>
	 * <li>{@link sap.m.CheckBox}</li>
	 * <li>{@link sap.m.ComboBox}</li>
	 * <li>{@link sap.m.DatePicker}</li>
	 * <li>{@link sap.m.DateTimeInput}</li>
	 * <li>{@link sap.m.DateTimePicker}</li>
	 * <li>{@link sap.m.Input}</li>
	 * <li>{@link sap.m.Label}</li>
	 * <li>{@link sap.m.MenuButton}</li>
	 * <li>{@link sap.m.OverflowToolbarButton}</li>
	 * <li>{@link sap.m.OverflowToolbarToggleButton}</li>
	 * <li>{@link sap.m.SearchField}</li>
	 * <li>{@link sap.m.SegmentedButton}</li>
	 * <li>{@link sap.m.Select}</li>
	 * <li>{@link sap.m.TimePicker}</li>
	 * <li>{@link sap.m.ToggleButton}</li>
	 * <li>{@link sap.ui.comp.smartfield.SmartField}</li>
	 * <li>{@link sap.ui.comp.smartfield.SmartLabel}</li></ul>
	 *
	 * Additionally, any control that implements the {@link sap.m.IOverflowToolbarContent} interface may define
	 * its behavior (most importantly overflow behavior) when placed inside <code>OverflowToolbar</code>.
	 *
	 * <b>Note:</b> The <code>OverflowToolbar</code> is an adaptive container that checks the available
	 * width and hides the part of its content that doesn't fit. It is intended that simple controls,
	 * such as {@link sap.m.Button} and {@link sap.m.Label} are used as content. Embedding other
	 * adaptive container controls, such as {@link sap.m.Breadcrumbs}, results in competition for the available
	 * space - both controls calculate the available space based on the other one's size and both change their
	 * width at the same time, leading to incorrectly distributed space.
	 *
	 * <h3>Responsive behavior</h3>
	 *
	 * The height of the toolbar changes on desktop, tablet, and smartphones.
	 *
	 * @see {@link fiori:https://experience.sap.com/fiori-design-web/toolbar-overview/#overflow-generic Overflow Toolbar}
	 *
	 * @extends sap.m.Toolbar
	 * @implements sap.ui.core.Toolbar,sap.m.IBar
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.28
	 * @alias sap.m.OverflowToolbar
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 *
	 */
	var OverflowToolbar = Toolbar.extend("sap.m.OverflowToolbar", {
		metadata: {
			aggregations: {
				_overflowButton: {type: "sap.m.ToggleButton", multiple: false, visibility: "hidden"},
				_popover: {type: "sap.m.Popover", multiple: false, visibility: "hidden"}
			},
			designtime: "sap/m/designtime/OverflowToolbar.designtime"
		}
	});

	/**
	 * A shorthand for calling Toolbar.prototype methods
	 * @param {string} sFuncName - the name of the method
	 * @param aArguments - the arguments to pass in the form of array
	 * @returns {*}
	 * @private
	 */
	OverflowToolbar.prototype._callToolbarMethod = function (sFuncName, aArguments) {
		return Toolbar.prototype[sFuncName].apply(this, aArguments);
	};

	/**
	 * Initializes the control
	 * @private
	 * @override
	 */
	OverflowToolbar.prototype.init = function () {
		this._callToolbarMethod("init", arguments);

		// Used to store the previous width of the control to determine if a resize occurred
		this._iPreviousToolbarWidth = null;

		// When set to true, the overflow button will be rendered
		this._bOverflowButtonNeeded = false;

		// When set to true, means that the overflow toolbar is in a popup
		this._bNestedInAPopover = null;

		// When set to true, changes to the controls in the toolbar will trigger a recalculation
		this._bListenForControlPropertyChanges = false;

		// When set to true, controls widths, etc... will not be recalculated, because they are already cached
		this._bControlsInfoCached = false;

		// When set to true, the recalculation algorithm will bypass an optimization to determine if anything moved from/to the action sheet
		this._bSkipOptimization = false;

		this._aControlSizes = {}; // A map of control id -> control *optimal* size in pixels; the optimal size is outerWidth for most controls and min-width for spacers
	};

	OverflowToolbar.prototype.exit = function () {
		var oPopover = this.getAggregation("_popover");
		if (oPopover) {
			oPopover.destroy();
		}
	};

	/**
	 * Called after the control is rendered
	 */
	OverflowToolbar.prototype.onAfterRendering = function () {
		// TODO: refactor with addEventDelegate for onAfterRendering for both overflow button and its label
		this._getOverflowButton().$().attr("aria-haspopup", "true");

		// Unlike toolbar, we don't set flexbox classes here, we rather set them on a later stage only if needed
		this._doLayout();
		this._applyFocus();
	};

	/*********************************************LAYOUT*******************************************************/


	/**
	 * For the OverflowToolbar, we need to register resize listeners always, regardless of Flexbox support
	 * @override
	 * @private
	 */


	OverflowToolbar.prototype._doLayout = function () {
		var oCore = sap.ui.getCore();

		// If the theme is not applied, control widths should not be measured and cached
		if (!oCore.isThemeApplied()) {
			jQuery.sap.log.debug("OverflowToolbar: theme not applied yet, skipping calculations", this);
			return;
		}

		var iWidth = this.$().width();

		// Stop listening for control changes while calculating the layout to avoid an infinite loop scenario
		this._bListenForControlPropertyChanges = false;

		// Deregister the resize handler to avoid multiple instances of the same code running at the same time
		this._deregisterToolbarResize();

		// Polyfill the flexbox support, if necessary
		this._polyfillFlexboxSupport();

		if (iWidth > 0) {

			// Cache controls widths and other info, if not done already
			if (!this._isControlsInfoCached()) {
				this._cacheControlsInfo();
			}

			// A resize occurred (or was simulated by setting previous width to null to trigger a recalculation)
			if (this._iPreviousToolbarWidth !== iWidth) {
				this._iPreviousToolbarWidth = iWidth;
				this._setControlsOverflowAndShrinking(iWidth);
				this.fireEvent("_controlWidthChanged");
			}

		}

		// Register the resize handler again after all calculations are done and it's safe to do so
		// Note: unlike toolbar, we don't call registerResize, but rather registerToolbarResize here, because we handle content change separately
		this._registerToolbarResize();

		// Start listening for property changes on the controls once again
		this._bListenForControlPropertyChanges = true;
	};

	OverflowToolbar.prototype._applyFocus = function () {
		var oFocusedChildControl = sap.ui.getCore().byId(this.sFocusedChildControlId),
			$FocusedChildControl,
			$LastFocusableChildControl = this.$().lastFocusableDomRef();

		if (oFocusedChildControl) {
			$FocusedChildControl = oFocusedChildControl.$();
		}

		if ($FocusedChildControl && $FocusedChildControl.length){
			$FocusedChildControl.focus();

		} else if (this._bControlWasFocused) {
			// If a control of the toolbar was focused, and we're here, then the focused control overflowed, so set the focus to the overflow button
			this._getOverflowButton().focus();
			this._bControlWasFocused = false;
			this._bOverflowButtonWasFocused = true;

		} else if (this._bOverflowButtonWasFocused && !this._getOverflowButtonNeeded()) {
			// If before invalidation the overflow button was focused, and it's not visible any more, focus the last focusable control
			$LastFocusableChildControl && $LastFocusableChildControl.focus();
			this._bOverflowButtonWasFocused = false;
		}
	};

	/**
	 * Preserves info to retain focus on child controls upon invalidation.
	 * @private
	 */
	OverflowToolbar.prototype._preserveChildControlFocusInfo = function () {
		// Preserve focus info
		var sActiveElementId = sap.ui.getCore().getCurrentFocusedControlId();

		if (this._getControlsIds().indexOf(sActiveElementId) !== -1) {
			this._bControlWasFocused = true;
			this.sFocusedChildControlId = sActiveElementId;
		} else if (sActiveElementId === this._getOverflowButton().getId()) {
			this._bOverflowButtonWasFocused = true;
			this.sFocusedChildControlId = null;
		}
	};

	/**
	 * If the client does not support the latest flexbox spec, run some polyfill code
	 * @private
	 */
	OverflowToolbar.prototype._polyfillFlexboxSupport = function () {
		// Modern clients have flexbox natively, do nothing
		if (OverflowToolbarRenderer.hasNewFlexBoxSupport) {
			return;
		}

		var $This = this.$();
		var oDomRef = $This[0] || {};
		$This.removeClass("sapMTBOverflow");
		var bOverflow = oDomRef.scrollWidth > oDomRef.clientWidth;
		bOverflow && $This.addClass("sapMTBOverflow");
	};

	/**
	 * Stores the sizes and other info of controls so they don't need to be recalculated again until they change
	 * @private
	 */
	OverflowToolbar.prototype._cacheControlsInfo = function () {
		var sPriority,
			bCanMoveToOverflow,
			bAlwaysStaysInOverflow;

		this._aMovableControls = []; // Controls that can be in the toolbar or action sheet
		this._aToolbarOnlyControls = []; // Controls that can't go to the action sheet (inputs, labels, buttons with special layout, etc...)
		this._aActionSheetOnlyControls = []; // Controls that are forced to stay in the action sheet (buttons with layout)
		this._iOldContentSize = this._iContentSize;
		this._iContentSize = 0; // The total *optimal* size of all controls in the toolbar

		this.getContent().forEach(function (oControl) {

			sPriority = OverflowToolbar._getControlPriority(oControl);

			bCanMoveToOverflow = sPriority !== OverflowToolbarPriority.NeverOverflow;
			bAlwaysStaysInOverflow = sPriority === OverflowToolbarPriority.AlwaysOverflow;

			var iControlSize = OverflowToolbar._getOptimalControlWidth(oControl, this._aControlSizes[oControl.getId()]);
			this._aControlSizes[oControl.getId()] = iControlSize;

			if (OverflowToolbarAssociativePopoverControls.supportsControl(oControl) && bAlwaysStaysInOverflow) {
				this._aActionSheetOnlyControls.push(oControl);
			} else {
				// Only add up the size of controls that can be shown in the toolbar, hence this addition is here
				this._iContentSize += iControlSize;

				if (OverflowToolbarAssociativePopoverControls.supportsControl(oControl) && bCanMoveToOverflow && oControl.getVisible()) {
					this._aMovableControls.push(oControl);
				} else {
					this._aToolbarOnlyControls.push(oControl);
				}
			}
		}, this);

		// If the system is a phone sometimes due to specificity in the flex the content can be rendered 1px larger that it should be.
		// This causes an overflow of the last element/button
		if (Device.system.phone) {
			this._iContentSize -= 1;
		}

		if (this._aActionSheetOnlyControls.length) {

			var aVisibleActionSheetOnlyControls = this._aActionSheetOnlyControls.filter(function(oControl) {
				return oControl.getVisible();
			}),
				bHasVisibleActionSheetOnlyControls = (aVisibleActionSheetOnlyControls.length > 0);

			if (bHasVisibleActionSheetOnlyControls) {
				// At least one control will be in the action sheet, so the overflow button is required within content
				this._iContentSize += this._getOverflowButtonSize();
			}
		}

		this._bControlsInfoCached = true;

		// If the total width of all overflow-enabled children changed, fire a private event to notify interested parties
		if (this._iOldContentSize !== this._iContentSize) {
			this.fireEvent("_contentSizeChange", {contentSize: this._iContentSize});
		}
	};

	/**
	 * Getter for the _bControlsInfoCached - its purpose it to be able to override it for edge cases to disable control caching
	 * @returns {boolean|*}
	 * @private
	 */
	OverflowToolbar.prototype._isControlsInfoCached = function () {
		return this._bControlsInfoCached;
	};

	/**
	 * Moves controls from/to the action sheet
	 * Sets/removes flexbox css classes to/from controls
	 * @private
	 */
	OverflowToolbar.prototype._setControlsOverflowAndShrinking = function (iToolbarSize) {
		var iContentSize = this._iContentSize,// total optimal control width in pixels, cached in _cacheControlsInfo and used until invalidated
			aButtonsToMoveToActionSheet = [], // buttons that must go to the action sheet
			sIdsHash,
			i,
			aAggregatedMovableControls,
			fnFlushButtonsToActionSheet = function (aButtons) { // helper: moves the buttons in the array to the action sheet
				aButtons.forEach(function (oControl) {
					this._moveButtonToActionSheet(oControl);
				}, this);
			},
			fnInvalidateIfHashChanged = function (sHash) { // helper: invalidate the toolbar if the signature of the action sheet changed (i.e. buttons moved)
				if (typeof sHash === "undefined" || this._getPopover()._getContentIdsHash() !== sHash) {
					// Preserve focus info
					this._preserveChildControlFocusInfo();
					this.invalidate();
				}
			},
			fnAddOverflowButton = function (iContentSize) { // helper: show the overflow button and increase content size accordingly, if not shown already
				if (!this._getOverflowButtonNeeded()) {
					iContentSize += this._getOverflowButtonSize();
					this._setOverflowButtonNeeded(true);
				}
				return iContentSize;
			},
		// Aggregate the controls from this array of elements [el1, el2, el3] to an array of arrays and elements [el1, [el2, el3]].
		// This is needed because groups of elements and single elements share same overflow logic
		// In order to sort elements and group arrays there are _index and _priority property to group array.
			fnAggregateMovableControls = function (aMovableControls) {
				var oGroups = {},
					aAggregatedControls = [];

				aMovableControls.forEach(function (oControl) {
					var iControlGroup = OverflowToolbar._getControlGroup(oControl),
						oPriorityOrder = OverflowToolbar._oPriorityOrder,
						sControlPriority, iControlIndex, aGroup;

					if (iControlGroup) {
						sControlPriority = OverflowToolbar._getControlPriority(oControl);
						iControlIndex = this._getControlIndex(oControl);

						oGroups[iControlGroup] = oGroups[iControlGroup] || [];
						aGroup = oGroups[iControlGroup];
						aGroup.unshift(oControl);

						// The overall group priority is the max priority of its elements
						if (!aGroup._priority || oPriorityOrder[aGroup._priority] < oPriorityOrder[sControlPriority]) {
							aGroup._priority = sControlPriority;
						}
						// The overall group index is the max index of its elements
						if (!aGroup._index || aGroup._index < iControlIndex) {
							aGroup._index = iControlIndex;
						}
					} else {
						aAggregatedControls.push(oControl);
					}
				}, this);

				// combine not grouped elements with group arrays
				Object.keys(oGroups).forEach(function (key) {
					aAggregatedControls.push(oGroups[key]);
				});

				return aAggregatedControls;
			},
			fnExtractControlsToMoveToOverflow = function (vMovableControl) {
				// when vMovableControl is group array
				if (vMovableControl.length) {
					vMovableControl.forEach(fnAddToActionSheetArrAndUpdateContentSize, this);
				} else { // when vMovableControl is a single element
					fnAddToActionSheetArrAndUpdateContentSize.call(this, vMovableControl);
				}

				if (iContentSize <= iToolbarSize) {
					return true;
				}
			},
		// vControlA or vControlB can be control or group array(array of controls) they share same sorting logic
			fnSortByPriorityAndIndex = function (vControlA, vControlB) {
				var oPriorityOrder = OverflowToolbar._oPriorityOrder,
					sControlAPriority = OverflowToolbar._getControlPriority(vControlA),
					sControlBPriority = OverflowToolbar._getControlPriority(vControlB),
					iPriorityCompare = oPriorityOrder[sControlAPriority] - oPriorityOrder[sControlBPriority];

				if (iPriorityCompare !== 0) {
					return iPriorityCompare;
				} else {
					return this._getControlIndex(vControlB) - this._getControlIndex(vControlA);
				}
			},
			fnAddToActionSheetArrAndUpdateContentSize = function (oControl) {
				aButtonsToMoveToActionSheet.unshift(oControl);
				iContentSize -= this._aControlSizes[oControl.getId()];
			};

		// If _bSkipOptimization is set to true, this means that no controls moved from/to the overflow, but they rather changed internally
		// In this case we can't rely on the action sheet hash to determine whether to skip one invalidation
		if (this._bSkipOptimization) {
			this._bSkipOptimization = false;
		} else {
			sIdsHash = this._getPopover()._getContentIdsHash(); // Hash of the buttons in the action sheet, f.e. "__button1.__button2.__button3"
		}

		// Clean up the action sheet, hide the overflow button, remove flexbox css from controls
		this._resetToolbar();

		// If there are any action sheet only controls and they are visible, move them to the action sheet first
		if (this._aActionSheetOnlyControls.length) {
			for (i = this._aActionSheetOnlyControls.length - 1; i >= 0; i--) {
				if (this._aActionSheetOnlyControls[i].getVisible()) {
					aButtonsToMoveToActionSheet.unshift(this._aActionSheetOnlyControls[i]);
				}
			}

			if (aButtonsToMoveToActionSheet.length > 0) {
				// At least one control will be in the action sheet, so the overflow button is needed
				this._setOverflowButtonNeeded(true);
			}
		}

		// If all content fits - put the buttons from the previous step (if any) in the action sheet and stop here
		if (iContentSize <= iToolbarSize) {
			fnFlushButtonsToActionSheet.call(this, aButtonsToMoveToActionSheet);
			fnInvalidateIfHashChanged.call(this, sIdsHash);
			return;
		}

		// Not all content fits
		// If there are buttons that can be moved, start moving them to the action sheet until there is no more overflow left
		if (this._aMovableControls.length) {

			// There is at least one button that will go to the action sheet - add the overflow button, but only if it wasn't added already
			iContentSize = fnAddOverflowButton.call(this, iContentSize);
			aAggregatedMovableControls = fnAggregateMovableControls.call(this, this._aMovableControls);

			// Define the overflow order, depending on items` priority and index.
			aAggregatedMovableControls.sort(fnSortByPriorityAndIndex.bind(this));

			// Hide controls or groups while iContentSize <= iToolbarSize/
			aAggregatedMovableControls.some(fnExtractControlsToMoveToOverflow, this);
		}

		// At this point all that could be moved to the action sheet, was moved (action sheet only buttons, some/all movable buttons)
		fnFlushButtonsToActionSheet.call(this, aButtonsToMoveToActionSheet);

		// If content still doesn't fit despite moving all movable items to the action sheet, set the flexbox classes
		if (iContentSize > iToolbarSize) {
			this._checkContents(); // This function sets the css classes to make flexbox work, despite its name
		}

		fnInvalidateIfHashChanged.call(this, sIdsHash);
	};

	/**
	 * Resets the toolbar by removing all special behavior from controls, returning it to its default natural state:
	 * - all buttons removed from the action sheet and put back to the toolbar
	 * - the overflow button is removed
	 * - all flexbox classes are removed from items
	 * @private
	 */
	OverflowToolbar.prototype._resetToolbar = function () {

		// 1. Close the action sheet and remove everything from it (reset overflow behavior)
		// Note: when the action sheet is closed because of toolbar invalidation, we don't want the animation in order to avoid flickering
		this._getPopover().close();
		this._getPopover()._getAllContent().forEach(function (oButton) {
			this._restoreButtonInToolbar(oButton);
		}, this);

		// 2. Hide the overflow button
		this._setOverflowButtonNeeded(false);

		// 3 Remove flex classes (reset shrinking behavior)
		this.getContent().forEach(function (oControl) {
			oControl.removeStyleClass(Toolbar.shrinkClass);
		});
	};

	/**
	 * Called for any button that overflows
	 * @param oButton
	 * @private
	 */
	OverflowToolbar.prototype._moveButtonToActionSheet = function (oButton) {
		this._getPopover().addAssociatedContent(oButton);
	};

	/**
	 * Called when a button can fit in the toolbar and needs to be restored there
	 * @param vButton
	 * @private
	 */
	OverflowToolbar.prototype._restoreButtonInToolbar = function (vButton) {
		if (typeof vButton === "object") {
			vButton = vButton.getId();
		}
		this._getPopover().removeAssociatedContent(vButton);
	};

	/**
	 * Closes the action sheet, resets the toolbar, and re-initializes variables to force a full layout recalc
	 * @param {boolean} bHardReset - skip the optimization, described in _setControlsOverflowAndShrinking
	 * @private
	 */
	OverflowToolbar.prototype._resetAndInvalidateToolbar = function (bHardReset) {
		if (this._bIsBeingDestroyed) {
			return;
		}

		this._resetToolbar();

		for (var iControlSize in this._aControlSizes) {
			if (this._aControlSizes.hasOwnProperty(iControlSize)) {
				this._aControlSizes[iControlSize] = 0; // reset saved control sizes
			}
		}

		this._bControlsInfoCached = false;
		this._bNestedInAPopover = null;
		this._iPreviousToolbarWidth = null;
		if (bHardReset) {
			this._bSkipOptimization = true;
		}

		if (this.$().length) {
			this._preserveChildControlFocusInfo();
			this.invalidate();
		}
	};


	/****************************************SUB-COMPONENTS*****************************************************/


	/**
	 * Returns all controls from the toolbar that are not in the action sheet
	 * @returns {*|Array.<T>}
	 */
	OverflowToolbar.prototype._getVisibleContent = function () {
		var aToolbarContent = this.getContent(),
			aActionSheetContent = this._getPopover()._getAllContent();

		return aToolbarContent.filter(function (oControl) {
			return aActionSheetContent.indexOf(oControl) === -1;
		});
	};

	/**
	* Returns all the controls from the <code>sap.m.OverflowToolbar</code>,
	* that are not in the overflow area and their <code>visible</code> property is <code>true</code>.
	* @private
	* @sap-restricted
	* @returns {*|Array.<T>}
	*/
	OverflowToolbar.prototype._getVisibleAndNonOverflowContent = function () {
		return this._getVisibleContent().filter(function (oControl) {
			return oControl.getVisible();
		});
	};

	/**
	 * Lazy loader for the overflow button
	 * @returns {sap.m.Button}
	 * @private
	 */
	OverflowToolbar.prototype._getOverflowButton = function () {
		var oOverflowButton;

		if (!this.getAggregation("_overflowButton")) {

			// Create the overflow button
			// A tooltip will be used automatically by the button
			// using to the icon-name provided
			oOverflowButton = new ToggleButton({
				id: this.getId() + "-overflowButton",
				icon: IconPool.getIconURI("overflow"),
				press: this._overflowButtonPressed.bind(this),
				ariaLabelledBy: InvisibleText.getStaticId("sap.ui.core", "Icon.overflow"),
				type: ButtonType.Transparent
			});

			this.setAggregation("_overflowButton", oOverflowButton, true);

		}

		return this.getAggregation("_overflowButton");
	};

	/**
	 * Shows the action sheet
	 * @param oEvent
	 * @private
	 */
	OverflowToolbar.prototype._overflowButtonPressed = function (oEvent) {
		var oPopover = this._getPopover(),
			sBestPlacement = this._getBestActionSheetPlacement();

		if (oPopover.getPlacement() !== sBestPlacement) {
			oPopover.setPlacement(sBestPlacement);
		}

		if (oPopover.isOpen()) {
			oPopover.close();
		} else {
			oPopover.openBy(oEvent.getSource());
		}
	};

	/**
	 * Lazy loader for the popover
	 * @returns {sap.m.Popover}
	 * @private
	 */
	OverflowToolbar.prototype._getPopover = function () {
		var oPopover;

		if (!this.getAggregation("_popover")) {

			// Create the Popover
			oPopover = new OverflowToolbarAssociativePopover(this.getId() + "-popover", {
				showHeader: false,
				showArrow: false,
				modal: false,
				horizontalScrolling: Device.system.phone ? false : true,
				contentWidth: Device.system.phone ? "100%" : "auto",
				offsetY: this._detireminePopoverVerticalOffset(),
				ariaLabelledBy: InvisibleText.getStaticId("sap.m", "INPUT_AVALIABLE_VALUES")
			});

			// Override popover positioning mechanism
			oPopover._adaptPositionParams = function () {
				OverflowToolbarAssociativePopover.prototype._adaptPositionParams.call(this);
				this._myPositions = ["end top", "begin center", "end bottom", "end center"];
				this._atPositions = ["end bottom", "end center", "end top", "begin center"];
			};

			if (Device.system.phone) {
				oPopover.attachBeforeOpen(this._shiftPopupShadow, this);
			}

			// This will set the toggle button to "off"
			oPopover.attachAfterClose(this._popOverClosedHandler, this);

			this.setAggregation("_popover", oPopover, true);
		}

		return this.getAggregation("_popover");
	};

	/**
	 * On mobile, remove the shadow from the top/bottom, depending on how the popover was opened
	 * If the popup is placed on the bottom, remove the top shadow
	 * If the popup is placed on the top, remove the bottom shadow
	 * @private
	 */
	OverflowToolbar.prototype._shiftPopupShadow = function () {
		var oPopover = this._getPopover(),
			sPos = oPopover.getCurrentPosition();

		if (sPos === PlacementType.Bottom) {
			oPopover.addStyleClass("sapMOTAPopoverNoShadowTop");
			oPopover.removeStyleClass("sapMOTAPopoverNoShadowBottom");
		} else if (sPos === PlacementType.Top) {
			oPopover.addStyleClass("sapMOTAPopoverNoShadowBottom");
			oPopover.removeStyleClass("sapMOTAPopoverNoShadowTop");
		}
	};

	/**
	 * Ensures that the overflowButton is no longer pressed when its popOver closes
	 * @private
	 */
	OverflowToolbar.prototype._popOverClosedHandler = function () {
		var bWindowsPhone = Device.os.windows_phone || Device.browser.edge && Device.browser.mobile;

		this._getOverflowButton().setPressed(false); // Turn off the toggle button
		this._getOverflowButton().$().focus(); // Focus the toggle button so that keyboard handling will work

		if (this._isNestedInsideAPopup() || bWindowsPhone) {
			return;
		}

		// On IE/sometimes other browsers, if you click the toggle button again to close the popover, onAfterClose is triggered first, which closes the popup, and then the click event on the toggle button reopens it
		// To prevent this behaviour, disable the overflow button till the end of the current javascript engine's "tick"
		this._getOverflowButton().setEnabled(false);
		jQuery.sap.delayedCall(0, this, function () {
			this._getOverflowButton().setEnabled(true);

			// In order to restore focus, we must wait another tick here to let the renderer enable it first
			jQuery.sap.delayedCall(0, this, function () {
				this._getOverflowButton().$().focus();
			});
		});
	};

	/**
	 * Checks if the overflowToolbar is nested in a popup
	 * @returns {boolean}
	 * @private
	 */
	OverflowToolbar.prototype._isNestedInsideAPopup = function () {
		var fnScanForPopup;

		if (this._bNestedInAPopover !== null) {
			return this._bNestedInAPopover;
		}

		fnScanForPopup = function (oControl) {
			if (!oControl) {
				return false;
			}

			if (oControl.getMetadata().isInstanceOf("sap.ui.core.PopupInterface")) {
				return true;
			}

			return fnScanForPopup(oControl.getParent());
		};

		this._bNestedInAPopover = fnScanForPopup(this);

		return this._bNestedInAPopover;
	};

	/**
	 * @returns {boolean|*}
	 * @private
	 */
	OverflowToolbar.prototype._getOverflowButtonNeeded = function () {
		return this._bOverflowButtonNeeded;
	};

	/**
	 *
	 * @param {boolean} bValue
	 * @returns {OverflowToolbar}
	 * @private
	 */
	OverflowToolbar.prototype._setOverflowButtonNeeded = function (bValue) {
		if (this._bOverflowButtonNeeded !== bValue) {
			this._bOverflowButtonNeeded = bValue;
		}
		return this;
	};

	/***************************************AGGREGATIONS AND LISTENERS******************************************/


	OverflowToolbar.prototype.onLayoutDataChange = function () {
		this._resetAndInvalidateToolbar(true);
	};

	OverflowToolbar.prototype.addContent = function (oControl) {
		this._registerControlListener(oControl);
		this._resetAndInvalidateToolbar(false);
		return this._callToolbarMethod("addContent", arguments);
	};


	OverflowToolbar.prototype.insertContent = function (oControl, iIndex) {
		this._registerControlListener(oControl);
		this._resetAndInvalidateToolbar(false);
		return this._callToolbarMethod("insertContent", arguments);
	};


	OverflowToolbar.prototype.removeContent = function (oControl) {
		var vContent = this._callToolbarMethod("removeContent", arguments);
		if (vContent) {
			this._getPopover().removeAssociatedContent(vContent.getId());
		}
		this._resetAndInvalidateToolbar(false);

		this._deregisterControlListener(vContent);

		return vContent;
	};


	OverflowToolbar.prototype.removeAllContent = function () {
		var aContents = this._callToolbarMethod("removeAllContent", arguments);

		aContents.forEach(function (oControl) {
			this._deregisterControlListener(oControl);
		}, this);
		this._resetAndInvalidateToolbar(false);

		return aContents;
	};

	OverflowToolbar.prototype.destroyContent = function () {
		this._resetAndInvalidateToolbar(false);

		jQuery.sap.delayedCall(0, this, function () {
			this._resetAndInvalidateToolbar(false);
		});

		return this._callToolbarMethod("destroyContent", arguments);
	};

	/**
	 * Every time a control is inserted in the toolbar, it must be monitored for size/visibility changes
	 * @param oControl
	 * @private
	 */
	OverflowToolbar.prototype._registerControlListener = function (oControl) {
		if (oControl) {
			oControl.attachEvent("_change", this._onContentPropertyChangedOverflowToolbar, this);
		}
	};

	/**
	 * Each time a control is removed from the toolbar, detach listeners
	 * @param oControl
	 * @private
	 */
	OverflowToolbar.prototype._deregisterControlListener = function (oControl) {
		if (oControl) {
			oControl.detachEvent("_change", this._onContentPropertyChangedOverflowToolbar, this);
		}
	};

	/**
	 * Changing a property that affects toolbar content width should trigger a recalculation
	 * This function is triggered on any property change, but will ignore some properties that are known to not affect width/visibility
	 * @param oEvent
	 * @private
	 */
	OverflowToolbar.prototype._onContentPropertyChangedOverflowToolbar = function (oEvent) {

		// Listening for property changes is turned off during layout recalculation to avoid infinite loops
		if (!this._bListenForControlPropertyChanges) {
			return;
		}

		var oSourceControl = oEvent.getSource();
		var oControlConfig = OverflowToolbarAssociativePopoverControls.getControlConfig(oSourceControl);
		var sParameterName = oEvent.getParameter("name");

		// Do nothing if the changed property is in the blacklist above
		if (typeof oControlConfig !== "undefined" &&
			oControlConfig.noInvalidationProps.indexOf(sParameterName) !== -1) {
			return;
		}

		// Trigger a recalculation
		this._resetAndInvalidateToolbar(true);
	};


	/**
	 * Returns the size of the overflow button - hardcoded, because it cannot be determined before rendering it
	 * @returns {number}
	 * @private
	 */
	OverflowToolbar.prototype._getOverflowButtonSize = function () {
		var iBaseFontSize = parseInt(library.BaseFontSize, 10),
			fCoefficient = this.$().parents().hasClass('sapUiSizeCompact') ? 2.5 : 3;

		return parseInt(iBaseFontSize * fCoefficient, 10);
	};


	/**
	 * Determines the optimal placement of the action sheet depending on the position of the toolbar in the page
	 * For footer and header tags, the placement is hard-coded, for other tags - automatically detected
	 * @returns {sap.m.PlacementType}
	 * @private
	 */
	OverflowToolbar.prototype._getBestActionSheetPlacement = function () {
		var sHtmlTag = this.getHTMLTag();

		// Always open above
		if (sHtmlTag === "Footer") {
			return PlacementType.Top;
			// Always open below
		} else if (sHtmlTag === "Header") {
			return PlacementType.Bottom;
		}

		return PlacementType.Vertical;
	};

	/**
	 * Returns an array of the ids of all controls in the overflow toolbar
	 * @returns {*|Array}
	 * @private
	 */
	OverflowToolbar.prototype._getControlsIds = function () {
		return this.getContent().map(function (item) {
			return item.getId();
		});
	};

	/**
	 * Returns the control index in the OverflowToolbar content aggregation or the index of a group, which is defined by the rightmost item in the group.
	 * @param vControl array of controls or single control
	 * @private
	 */
	OverflowToolbar.prototype._getControlIndex = function (vControl) {
		return vControl.length ? vControl._index : this.indexOfContent(vControl);
	};

	/************************************************** STATIC ***************************************************/

	/**
	 * Returns the optimal width of an element for the purpose of calculating the content width of the OverflowToolbar
	 * so that spacers f.e. don't expand too aggressively and take up the whole space
	 * @param oControl
	 * @returns {*}
	 * @private
	 */
	OverflowToolbar._getOptimalControlWidth = function (oControl, iOldSize) {
		var iOptimalWidth;

		// For spacers, get the min-width + margins
		if (oControl instanceof ToolbarSpacer) {
			iOptimalWidth = parseInt(oControl.$().css('min-width'), 10) || 0 + oControl.$().outerWidth(true) - oControl.$().outerWidth();
			// For other elements, get the outer width
		} else {
			iOptimalWidth = oControl.getVisible() ? oControl.$().outerWidth(true) : 0;
		}

		if (iOptimalWidth === null) {
			iOptimalWidth = typeof iOldSize !== "undefined" ? iOldSize : 0;
		}

		return iOptimalWidth;
	};

	/**
	 * Returns the control priority based on the layout data (old values are converted) or the priority of the group, which is defined by the max priority of its items.
	 * @static
	 * @param vControl array of controls or single control
	 * @private
	 */
	OverflowToolbar._getControlPriority = function (vControl) {
		// 1. Check if it is a group of controls (treated as a single entity in terms of overflow), rather a single control
		if (vControl.length) {
			return vControl._priority;
		}

		// 2. Check if the control has custom priority given by implementing sap.m.IOverflowToolbarContent
		var bImplementsIOTBContent = vControl.getMetadata().getInterfaces().indexOf("sap.m.IOverflowToolbarContent") > -1,
			fnGetCustomImportance = bImplementsIOTBContent && vControl.getOverflowToolbarConfig().getCustomImportance;
		if (bImplementsIOTBContent && typeof fnGetCustomImportance === "function") {
			return fnGetCustomImportance();
		}

		// 3. Check for priority given by layout data (standard use case)
		var oLayoutData = vControl.getLayoutData && vControl.getLayoutData();
		if (oLayoutData && oLayoutData instanceof OverflowToolbarLayoutData) {

			if (oLayoutData.getMoveToOverflow() === false) {
				return OverflowToolbarPriority.NeverOverflow;
			}

			if (oLayoutData.getStayInOverflow() === true) {
				return OverflowToolbarPriority.AlwaysOverflow;
			}

			var sPriority = oLayoutData.getPriority();

			if (sPriority === OverflowToolbarPriority.Never) {
				return OverflowToolbarPriority.NeverOverflow;
			}

			if (sPriority === OverflowToolbarPriority.Always) {
				return OverflowToolbarPriority.AlwaysOverflow;
			}

			return sPriority;
		}

		// 4. Default priority (High) as a fallback if nothing else was supplied
		return OverflowToolbarPriority.High;
	};

	/**
	 * Returns the control group based on the layout data
	 * @static
	 * @param oControl
	 * @private
	 */
	OverflowToolbar._getControlGroup = function (oControl) {
		var oLayoutData = oControl.getLayoutData();

		if (oLayoutData instanceof OverflowToolbarLayoutData) {
			return oLayoutData.getGroup();
		}
	};

	/**
	 * Object that holds the numeric representation of priorities
	 * @static
	 * @private
	 */
	OverflowToolbar._oPriorityOrder = (function () {
		var oPriorityOrder = {};

		oPriorityOrder[OverflowToolbarPriority.Disappear] = 1;
		oPriorityOrder[OverflowToolbarPriority.Low] = 2;
		// If a control sets custom priority (by implementing sap.m.IOverflowToolbarContent), the string "Medium" is
		// also accepted along with the standard priority values, such as High, Low, NeverOverflow, etc... therefore "Medium" should also be mapped
		oPriorityOrder["Medium"] = 3;
		oPriorityOrder[OverflowToolbarPriority.High] = 4;

		return oPriorityOrder;
	})();

	OverflowToolbar.prototype._detireminePopoverVerticalOffset = function () {
		return this.$().parents().hasClass('sapUiSizeCompact') ? 2 : 3;
	};

	OverflowToolbar.prototype.onThemeChanged = function () {
		this._resetAndInvalidateToolbar();
	};

	/**
	 * Closes the overflow area.
	 * Useful to manually close the overflow after having suppressed automatic closing with "closeOverflowOnInteraction=false".
	 *
	 * @public
	 * @since 1.40
	 */
	OverflowToolbar.prototype.closeOverflow = function () {
		this._getPopover().close();
	};

	return OverflowToolbar;

});
