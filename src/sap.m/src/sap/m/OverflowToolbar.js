/*!
 * ${copyright}
 */

// Provides control sap.m.OverflowToolbar.
sap.ui.define(['jquery.sap.global', './library', 'sap/m/Button', 'sap/m/Label', 'sap/m/Toolbar', 'sap/m/ToolbarSpacer', 'sap/m/OverflowToolbarAssociativeActionSheet', 'sap/m/OverflowToolbarLayoutData'],
	function(jQuery, library, Button, Label, Toolbar, ToolbarSpacer, OverflowToolbarAssociativeActionSheet, OverflowToolbarLayoutData) {
		"use strict";



		/**
		 * Constructor for a new Overflow Toolbar
		 *
		 * @param {string} [sId] id for the new control, generated automatically if no id is given
		 * @param {object} [mSettings] initial settings for the new control
		 *
		 * @class
		 * The OverflowToolbar control is a container based on sap.m.Toolbar, that provides overflow when its content does not fit in the visible area.
		 *
		 * Note: Currently only controls of type sap.m.Button can move to the overflow area, but in future versions other controls will be able to as well. 
		 * For this reason it is advisable to always set layoutData with property "moveToOverflow" to "false" for all controls that are never intended to overflow, regardless of their type.
		 * @extends sap.ui.core.Toolbar
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
					_overflowButton : {type : "sap.m.Button", multiple : false, visibility: "hidden"},
					_overflowButtonLabel : {type : "sap.m.Label", multiple : false, visibility: "hidden"},
					_actionSheet : {type : "sap.m.ActionSheet", multiple : false, visibility: "hidden"}
				}
			}
		});

		/**
		 * A shorthand for calling Toolbar.prototype methods
		 * @param sFuncName - the name of the method
		 * @param aArguments - the arguments to pass in the form of array
		 * @returns {*}
		 * @private
		 */
		OverflowToolbar.prototype._callToolbarMethod = function(sFuncName, aArguments) {
			return Toolbar.prototype[sFuncName].apply(this, aArguments);
		};

		/**
		 * Initializes the control
		 * @private
		 * @override
		 */
		OverflowToolbar.prototype.init = function() {
			this._callToolbarMethod("init", arguments);

			// Used to store the previous width of the control to determine if a resize occurred
			this._iPreviousToolbarWidth = null;

			// When set to true, the overflow button will be rendered
			this._bOverflowButtonNeeded = false;

			// When set to true, changes to the controls in the toolbar will trigger a recalculation
			this._bListenForControlPropertyChanges = false;

			// When set to true, controls widths, etc... will not be recalculated, because they are already cached
			this._bControlsInfoCached = false;

			// When set to true, the recalculation algorithm will bypass an optimization to determine if anything moved from/to the action sheet
			this._bSkipOptimization = false;
		};

		/**
		 * Called after the control is rendered
		 */
		OverflowToolbar.prototype.onAfterRendering = function() {
			
			// If a control of the toolbar was focused, and we're here, then the focused control overflowed, so set the focus to the overflow button
			if (this._bControlWasFocused) {
				this._getOverflowButton().focus();
				this._bControlWasFocused = false;
			}
			
			// If before invalidation the overflow button was focused, and it's not visible any more, focus the last focusable control
			if (this._bOverflowButtonWasFocused && !this._getOverflowButtonNeeded()) {
				this.$().lastFocusableDomRef().focus();
				this._bOverflowButtonWasFocused = false;
			}
			
			this._getOverflowButtonLabel().$().attr("aria-hidden", "true");
			
			// Unlike toolbar, we don't set flexbox classes here, we rather set them on a later stage only if needed
			this._doLayout();
		};


		/*********************************************LAYOUT*******************************************************/


		/**
		 * For the OverflowToolbar, we need to register resize listeners always, regardless of Flexbox support
		 * @override
		 * @private
		 */


		OverflowToolbar.prototype._doLayout = function() {

			// Stop listening for control changes while calculating the layout to avoid an infinite loop scenario
			this._bListenForControlPropertyChanges = false;

			// Deregister the resize handler to avoid multiple instances of the same code running at the same time
			this._deregisterToolbarResize();

			// Polyfill the flexbox support, if necessary
			this._polyfillFlexboxSupport();

			// Cache controls widths and other info, if not done already
			if (!this._bControlsInfoCached) {
				this._cacheControlsInfo();
			}

			// A resize occurred (or was simulated by setting previous width to null to trigger a recalculation)
			if (this._iPreviousToolbarWidth !== this.$().width()) {
				this._iPreviousToolbarWidth = this.$().width();
				this._setControlsOverflowAndShrinking();
			}

			// Register the resize handler again after all calculations are done and it's safe to do so
			// Note: unlike toolbar, we don't call registerResize, but rather registerToolbarResize here, because we handle content change separately
			this._registerToolbarResize();

			// Start listening for property changes on the controls once again
			this._bListenForControlPropertyChanges = true;
		};

		/**
		 * If the client does not support the latest flexbox spec, run some polyfill code
		 * @private
		 */
		OverflowToolbar.prototype._polyfillFlexboxSupport = function() {
			// Modern clients have flexbox natively, do nothing
			if (Toolbar.hasNewFlexBoxSupport) {
				return;
			}

			// Old flexbox polyfill
			if (Toolbar.hasFlexBoxSupport) {
				var $This = this.$();
				var oDomRef = $This[0] || {};
				$This.removeClass("sapMTBOverflow");
				var bOverflow = oDomRef.scrollWidth > oDomRef.clientWidth;
				bOverflow && $This.addClass("sapMTBOverflow");
			// IE - run the polyfill
			} else {
				Toolbar.flexie(this.$());
			}
		};


		/**
		 * Stores the sizes and other info of controls so they don't need to be recalculated again until they change
		 * @private
		 */
		OverflowToolbar.prototype._cacheControlsInfo = function() {
			var bStayInOverflow,
				bMoveToOverflow;

			this._aMovableControls = []; // Controls that can be in the toolbar or action sheet
			this._aToolbarOnlyControls = []; // Controls that can't go to the action sheet (inputs, labels, buttons with special layout, etc...)
			this._aActionSheetOnlyControls = []; // Controls that are forced to stay in the action sheet (buttons with layout)
			this._aControlSizes = {}; // A map of control id -> control *optimal* size in pixels; the optimal size is outerWidth for most controls and min-width for spacers
			this._iContentSize = 0; // The total *optimal* size of all controls in the toolbar

			this.getContent().forEach(function (oControl) {

				var oLayoutData = oControl.getLayoutData();

				if (oLayoutData instanceof OverflowToolbarLayoutData) {
					bStayInOverflow = oLayoutData.getStayInOverflow();
					bMoveToOverflow = oLayoutData.getMoveToOverflow();
				} else {
					bStayInOverflow = false;
					bMoveToOverflow = true;
				}

				var iControlSize = OverflowToolbar._getOptimalControlWidth(oControl);
				this._aControlSizes[oControl.getId()] = iControlSize;

				if (OverflowToolbarAssociativeActionSheet._acceptsControl(oControl) && bStayInOverflow) {
					this._aActionSheetOnlyControls.push(oControl);
				} else {
					// Only add up the size of controls that can be shown in the toolbar, hence this addition is here
					this._iContentSize += iControlSize;

					if (OverflowToolbarAssociativeActionSheet._acceptsControl(oControl) && bMoveToOverflow) {
						this._aMovableControls.push(oControl);
					} else {
						this._aToolbarOnlyControls.push(oControl);
					}
				}
			}, this);

			this._bControlsInfoCached = true;
		};

		/**
		 * Moves controls from/to the action sheet
		 * Sets/removes flexbox css classes to/from controls
		 * @private
		 */
		OverflowToolbar.prototype._setControlsOverflowAndShrinking = function() {

			var iToolbarSize = this.$().width(), // toolbar width in pixels
				iContentSize = this._iContentSize,// total optimal control width in pixels, cached in _cacheControlsInfo and used until invalidated
				aButtonsToMoveToActionSheet = [], // buttons that must go to the action sheet
				sIdsHash,
				i,
				fnFlushButtonsToActionSheet = function(aButtons) { // helper: moves the buttons in the array to the action sheet
					aButtons.forEach(function(oControl) {
						this._moveButtonToActionSheet(oControl);
					}, this);
				},
				fnInvalidateIfHashChanged = function(sHash) { // helper: invalidate the toolbar if the signature of the action sheet changed (i.e. buttons moved)
					if (typeof sHash === "undefined" || this._getActionSheet()._getButtonsIdsHash() !== sHash) {
						this.invalidate();
						
						// Preserve focus info
						if (this._getControlsIds().indexOf(sap.ui.getCore().getCurrentFocusedControlId()) !== -1) {
							this._bControlWasFocused = true;
						}
						if (sap.ui.getCore().getCurrentFocusedControlId() === this._getOverflowButton().getId()) {
							this._bOverflowButtonWasFocused = true;
						}
					}
				},
				fnAddOverflowButton = function(iContentSize) { // helper: show the overflow button and increase content size accordingly, if not shown already
					if (!this._getOverflowButtonNeeded()) {
						iContentSize += this._getOverflowButtonSize();
						this._setOverflowButtonNeeded(true);
					}
					return iContentSize;
				};


			
			// If _bSkipOptimization is set to true, this means that no controls moved from/to the overflow, but they rather changed internally
			// In this case we can't rely on the action sheet hash to determine whether to skip one invalidation
			if (this._bSkipOptimization) {
				this._bSkipOptimization = false;
			} else {
				sIdsHash = this._getActionSheet()._getButtonsIdsHash(); // Hash of the buttons in the action sheet, f.e. "__button1.__button2.__button3"
			}

			// Clean up the action sheet, hide the overflow button, remove flexbox css from controls
			this._resetToolbar();

			// If there are any action sheet only controls, move them to the action sheet first
			if (this._aActionSheetOnlyControls.length) {
				for (i = this._aActionSheetOnlyControls.length - 1; i >= 0; i--) {
					aButtonsToMoveToActionSheet.unshift(this._aActionSheetOnlyControls[i]);
				}
				
				// At least one control will be in the action sheet, so the overflow button is needed
				iContentSize = fnAddOverflowButton.call(this, iContentSize);
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

				// Iterate buttons in reverse, the last one goes in first
				for (i = this._aMovableControls.length - 1; i >= 0; i--) {
					aButtonsToMoveToActionSheet.unshift(this._aMovableControls[i]);
					iContentSize -= this._aControlSizes[this._aMovableControls[i].getId()];

					if (iContentSize <= iToolbarSize) {
						break;
					}
				}
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
			this._getActionSheet()._closeWithoutAnimation(); 
			this._getActionSheet()._getAllButtons().forEach(function (oButton) {
				this._restoreButtonInToolbar(oButton);
			}, this);
			
			// 2. Hide the overflow button
			this._setOverflowButtonNeeded(false);

			// 3 Remove flex classes (reset shrinking behavior)
			this.getContent().forEach(function(oControl) {
				oControl.removeStyleClass(Toolbar.shrinkClass);
			});
		};

		/**
		 * Called for any button that overflows
		 * @param oButton
		 * @private
		 */
		OverflowToolbar.prototype._moveButtonToActionSheet = function(oButton) {
			this._getActionSheet().addAssociatedButton(oButton);
		};

		/**
		 * Called when a button can fit in the toolbar and needs to be restored there
		 * @param vButton
		 * @private
		 */
		OverflowToolbar.prototype._restoreButtonInToolbar = function(vButton) {
			if (typeof vButton === "object") {
				vButton = vButton.getId();
			}
			this._getActionSheet().removeAssociatedButton(vButton);
		};

		/**
		 * Closes the action sheet, resets the toolbar, and re-initializes variables to force a full layout recalc
		 * @param bHardReset - skip the optimization, described in _setControlsOverflowAndShrinking
		 * @private
		 */
		OverflowToolbar.prototype._resetAndInvalidateToolbar = function (bHardReset) {
			
			this._resetToolbar();
			
			this._bControlsInfoCached = false;
			this._iPreviousToolbarWidth = null;
			if (bHardReset) {
				this._bSkipOptimization = true;
			}
			
			this.invalidate();
		};



		/****************************************SUB-COMPONENTS*****************************************************/


		/**
		 * Returns all controls from the toolbar that are not in the action sheet
		 * @returns {*|Array.<T>}
		 */
		OverflowToolbar.prototype._getVisibleContent = function () {
			var aToolbarContent = this.getContent(),
				aActionSheetContent = this._getActionSheet()._getAllButtons();

			return aToolbarContent.filter(function(oControl) {
				return aActionSheetContent.indexOf(oControl) === -1;
			});
		};

		/**
		 * Lazy loader for the overflow button
		 * @returns {sap.m.Button}
		 * @private
		 */
		OverflowToolbar.prototype._getOverflowButton = function() {
			var oOverflowButton;

			if (!this.getAggregation("_overflowButton")) {

				// Create the overflow button
				oOverflowButton = new Button({
					icon: "sap-icon://overflow",
					press: this._overflowButtonPressed.bind(this),
					ariaLabelledBy: this._getOverflowButtonLabel()
				});

				this.setAggregation("_overflowButton", oOverflowButton, true);

			}

			return this.getAggregation("_overflowButton");
		};

		OverflowToolbar.prototype._getOverflowButtonLabel = function() {
			var oOverflowButtonLabel;

			if (!this.getAggregation("_overflowButtonLabel")) {

				var oResourceBundle = sap.ui.getCore().getLibraryResourceBundle("sap.m");
				oOverflowButtonLabel = new Label({
					text: oResourceBundle.getText("LOAD_MORE_DATA"),
					width: "0px"
				});
				oOverflowButtonLabel.addStyleClass("sapUiHidden");

				this.setAggregation("_overflowButtonLabel", oOverflowButtonLabel, true);

			}

			return this.getAggregation("_overflowButtonLabel");
		};

		/**
		 * Shows the action sheet
		 * @param oEvent
		 * @private
		 */
		OverflowToolbar.prototype._overflowButtonPressed = function(oEvent) {
			var oActionSheet = this._getActionSheet(),
				sBestPlacement = this._getBestActionSheetPlacement();

			if (oActionSheet.getPlacement() !== sBestPlacement) {
				oActionSheet.setPlacement(sBestPlacement);
			}

			oActionSheet.openBy(oEvent.getSource());
		};

		/**
		 * Lazy loader for the action sheet
		 * @returns {sap.m.ActionSheet}
		 * @private
		 */
		OverflowToolbar.prototype._getActionSheet = function() {
			var oActionSheet;

			if (!this.getAggregation("_actionSheet")) {

				// Create the action sheet
				oActionSheet = new OverflowToolbarAssociativeActionSheet(this.getId() + "-associativeactionsheet", {
					showCancelButton : sap.ui.Device.browser.mobile ? true : false
				});

				this.setAggregation("_actionSheet", oActionSheet, true);

			}

			return this.getAggregation("_actionSheet");
		};

		/**
		 * @returns {boolean|*}
		 * @private
		 */
		OverflowToolbar.prototype._getOverflowButtonNeeded = function() {
			return this._bOverflowButtonNeeded;
		};

		/**
		 *
		 * @param bValue
		 * @returns {OverflowToolbar}
		 * @private
		 */
		OverflowToolbar.prototype._setOverflowButtonNeeded = function(bValue) {
			if (this._bOverflowButtonNeeded !== bValue) {
				this._bOverflowButtonNeeded = bValue;
			}
			return this;
		};

		/***************************************AGGREGATIONS AND LISTENERS******************************************/


		OverflowToolbar.prototype.onLayoutDataChange = function() {
			this._resetAndInvalidateToolbar(true);
		};

		OverflowToolbar.prototype.addContent = function(oControl) {
			this._registerControlListener(oControl);
			this._resetAndInvalidateToolbar(false);
			return this._callToolbarMethod("addContent", arguments);
		};


		OverflowToolbar.prototype.insertContent = function(oControl, iIndex) {
			this._registerControlListener(oControl);
			this._resetAndInvalidateToolbar(false);
			return this._callToolbarMethod("insertContent", arguments);
		};


		OverflowToolbar.prototype.removeContent = function(oControl) {
			var vContent = this._callToolbarMethod("removeContent", arguments);
			this._resetAndInvalidateToolbar(false);
			this._deregisterControlListener(vContent);
			return vContent;
		};


		OverflowToolbar.prototype.removeAllContent = function() {
			var aContents = this._callToolbarMethod("removeAllContent", arguments);
			aContents.forEach(this._deregisterControlListener, this);
			this._resetAndInvalidateToolbar(false);
			return aContents;
		};

		OverflowToolbar.prototype.destroyContent = function() {
			this._resetAndInvalidateToolbar(false);

			var that = this;
			setTimeout(function() {
				that._resetAndInvalidateToolbar(false);
			}, 0);

			return this._callToolbarMethod("destroyContent", arguments);
		};

		/**
		 * Every time a control is inserted in the toolbar, it must be monitored for size/visibility changes
		 * @param oControl
		 * @private
		 */
		OverflowToolbar.prototype._registerControlListener = function(oControl) {
			if (oControl) {
				oControl.attachEvent("_change", this._onContentPropertyChangedOverflowToolbar, this);
			}
		};

		/**
		 * Each time a control is removed from the toolbar, detach listeners
		 * @param oControl
		 * @private
		 */
		OverflowToolbar.prototype._deregisterControlListener = function(oControl) {
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
		OverflowToolbar.prototype._onContentPropertyChangedOverflowToolbar = function(oEvent) {

			// Listening for property changes is turned off during layout recalculation to avoid infinite loops
			if (!this._bListenForControlPropertyChanges) {
				return;
			}

			// A map of properties for each control type that works with the toolbar, that will not trigger recalculation
			var aIgnoreEventsMap = {
				"sap.m.SearchField": ["value"],
				"sap.m.Select": ["selectedItemId", "selectedKey"],
				"sap.m.ComboBox": ["value", "selectedItemId", "selectedKey"],
				"sap.m.CheckBox": ["selected"],
				"sap.m.Input": ["value"],
				"sap.m.ToggleButton": ["pressed"],
				"sap.m.RadioButton": ["selected"],
				"sap.m.DateTimeInput": ["value", "dateValue"]
			};

			var sSourceControlClass = oEvent.getSource().getMetadata().getName();
			var sParameterName = oEvent.getParameter("name");

			// Do nothing if the changed property is in the blacklist above
			if (typeof aIgnoreEventsMap[sSourceControlClass] !== "undefined" &&
				aIgnoreEventsMap[sSourceControlClass].indexOf(sParameterName) !== -1) {
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
		OverflowToolbar.prototype._getOverflowButtonSize = function() {
			var iBaseFontSize = parseInt(sap.m.BaseFontSize, 10),
				fCoefficient = this.$().parents().hasClass('sapUiSizeCompact') ? 2.5 : 3;
			
			return parseInt(iBaseFontSize * fCoefficient, 10);
		};


		/**
		 * Determines the optimal placement of the action sheet depending on the position of the toolbar in the page
		 * For footer and header tags, the placement is hard-coded, for other tags - automatically detected
		 * @returns {sap.m.PlacementType}
		 * @private
		 */
		OverflowToolbar.prototype._getBestActionSheetPlacement = function() {
			var sHtmlTag = this.getHTMLTag();

			// Always open above
			if (sHtmlTag === "Footer") {
				return sap.m.PlacementType.Top;
			// Always open below
			} else if (sHtmlTag === "Header") {
				return sap.m.PlacementType.Bottom;
			}

			return sap.m.PlacementType.Auto;
		};

		/**
		 * Returns an array of the ids of all controls in the overflow toolbar
		 * @returns {*|Array}
		 * @private
		 */
		OverflowToolbar.prototype._getControlsIds = function() {
			return this.getContent().map(function(item) {
				return item.getId();
			});	
		};

		/************************************************** STATIC ***************************************************/


		/**
		 * Returns the optimal width of an element for the purpose of calculating the content width of the OverflowToolbar
		 * so that spacers f.e. don't expand too aggressively and take up the whole space
		 * @param oControl
		 * @returns {*}
		 * @private
		 */
		OverflowToolbar._getOptimalControlWidth = function(oControl) {
			var iOptimalWidth;

			// For spacers, get the min-width + margins
			if (oControl instanceof ToolbarSpacer) {
				iOptimalWidth = parseInt(oControl.$().css('min-width'), 10) || 0  + oControl.$().outerWidth(true) - oControl.$().outerWidth();
			// For other elements, get the outer width
			} else {
				iOptimalWidth = oControl.$().outerWidth(true);
			}

			return iOptimalWidth;
		};

		return OverflowToolbar;

	}, /* bExport= */ true);