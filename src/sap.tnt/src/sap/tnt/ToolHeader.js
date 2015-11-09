/*!
 * ${copyright}
 */

// Provides control sap.tnt.ToolHeader
sap.ui.define(['jquery.sap.global', './library', 'sap/ui/core/Control',
		'sap/m/OverflowToolbar', 'sap/m/OverflowToolbarAssociativePopover'],
	function(jQuery, library, Control, OverflowToolbar, OverflowToolbarAssociativePopover) {
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
		 * commonly used to display buttons, labels, selects and various other input controls.
		 *
		 * The ToolHeader control is based on sap.m.OverflowToolbar. In addition to the OverflowToolbar,
		 * the user can specify where the overflow button is placed.
		 *
		 * @extends sap.ui.core.Control
		 *
		 * @author SAP SE
		 * @version ${version}
		 *
		 * @constructor
		 * @public
		 * @since 1.34
		 * @alias sap.tnt.ToolHeader
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

		ToolHeader.prototype.init = function() {

			OverflowToolbar.prototype.init.apply(this, arguments);

			this.addStyleClass('sapMToolHeader');
		};

		/**
		 * Lazy loader for the popover
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
				}).addStyleClass('sapMToolHeaderPopover');

				popover.oControlsManager._preProcessSapMButton = this._preProcessPopoverControlsSapMButton.bind(popover.oControlsManager);

				if (sap.ui.Device.system.phone) {
					// This will trigger when the toolbar is in the header/footer, because the the position is known in advance (strictly top/bottom)
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

		ToolHeader.prototype._getBestActionSheetPlacement = function() {
			return sap.m.PlacementType.Bottom;
		};

		return ToolHeader;

	}, /* bExport= */ true);
