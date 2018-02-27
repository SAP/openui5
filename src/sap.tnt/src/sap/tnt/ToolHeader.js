/*!
 * ${copyright}
 */

// Provides control sap.tnt.ToolHeader
sap.ui.define([
    'jquery.sap.global',
    './library',
    'sap/ui/core/Control',
    'sap/m/OverflowToolbar',
    'sap/m/OverflowToolbarAssociativePopover',
    "./ToolHeaderRenderer"
],
	function(
	    jQuery,
		library,
		Control,
		OverflowToolbar,
		OverflowToolbarAssociativePopover,
		ToolHeaderRenderer
	) {
		"use strict";


		/**
		 * Constructor for a new ToolHeader.
		 *
		 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
		 * @param {object} [mSettings] Initial settings for the new control
		 *
		 * @class
		 *
		 * The ToolHeader control is a horizontal container that is most
		 * commonly used to display buttons, labels, and other various input controls.
		 * <h4>Overview</h4>
		 * The ToolHeader control is based on {@link sap.m.OverflowToolbar}. It contains clearly structured menus of commands that are available across the various apps within the same tool layout.
		 * <h4>Usage</h4>
		 * <ul>
		 * <li>If an app implements side navigation in addition to the tool header menu, the menu icon must be the first item on the left-hand side of the tool header.</li>
		 * <li>The app menu and the side navigation must not have any dependencies and must work independently.</li>
		 * </ul>
		 * @extends sap.m.OverflowToolbar
		 *
		 * @author SAP SE
		 * @version ${version}
		 *
		 * @constructor
		 * @public
		 * @since 1.34
		 * @alias sap.tnt.ToolHeader
		 * @see {@link fiori:https://experience.sap.com/fiori-design-web/tool-header/ Tool Header}
		 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
		 */
		var ToolHeader = OverflowToolbar.extend("sap.tnt.ToolHeader", /** @lends sap.tnt.ToolHeader.prototype */ {
			metadata: {
				library: "sap.tnt",
				properties: {

				},
				aggregations: {
				}
			}
		});

		/**
		 * Initializes the control.
		 * @private
		 * @override
		 */
		ToolHeader.prototype.init = function() {

			OverflowToolbar.prototype.init.apply(this, arguments);

			this.addStyleClass('sapTntToolHeader sapContrast sapContrastPlus');
		};

		/**
		 * Lazy loader for the popover.
		 * @returns {sap.m.Popover}
		 * @private
		 */
		ToolHeader.prototype._getPopover = function() {
			var popover;

			if (!this.getAggregation("_popover")) {

				// Create the Popover
				popover = new OverflowToolbarAssociativePopover(this.getId() + "-popover", {
					showHeader: false,
					showArrow: sap.ui.Device.system.phone ? false : true,
					modal: false,
					horizontalScrolling: sap.ui.Device.system.phone ? false : true,
					contentWidth: sap.ui.Device.system.phone ? "100%" : "auto"
				}).addStyleClass('sapTntToolHeaderPopover sapContrast sapContrastPlus');

				popover.oControlsManager._preProcessSapMButton = this._preProcessPopoverControlsSapMButton.bind(popover.oControlsManager);

				if (sap.ui.Device.system.phone) {
					// This will trigger when the toolbar is in the header/footer, because the position is known in advance (strictly top/bottom)
					popover.attachBeforeOpen(this._shiftPopupShadow, this);

					// This will trigger when the toolbar is not in the header/footer, when the actual calculation is ready (see the overridden _calcPlacement)
					popover.attachAfterOpen(this._shiftPopupShadow, this);
				}

				// This will set the toggle button to "off"
				popover.attachAfterClose(this._popOverClosedHandler, this);

				this.setAggregation("_popover", popover, true);
			}

			return this.getAggregation("_popover");
		};

		/**
		 * Modifies sap.m.Button.
		 * @private
		 */
		ToolHeader.prototype._preProcessPopoverControlsSapMButton = function(oControl) {
			this._mControlsCache[oControl.getId()] = {
				buttonType: oControl.getType()
			};

			// Set some css classes to apply the proper paddings in cases of buttons with/without icons
			if (oControl.getIcon()) {
				oControl.addStyleClass("sapMOTAPButtonWithIcon");
			} else {
				oControl.addStyleClass("sapMOTAPButtonNoIcon");
			}

			oControl.attachEvent("_change", this._onSapMButtonUpdated, this);
		};

		/**
		 * Returns "sap.m.PlacementType.Bottom".
		 * @returns {sap.m.PlacementType}
		 * @private
		 * @override
		 */
		ToolHeader.prototype._getBestActionSheetPlacement = function() {
			return sap.m.PlacementType.Bottom;
		};

		return ToolHeader;

	}, /* bExport= */ true);
