/*!
 * ${copyright}
 */

// Provides control sap.tnt.ToolHeader
sap.ui.define([
	'./library',
	'sap/ui/core/Control',
	'sap/m/OverflowToolbar',
	'sap/m/OverflowToolbarAssociativePopover',
	"./ToolHeaderRenderer",
	"sap/ui/Device",
	"sap/m/library"
],
	function(
		library,
		Control,
		OverflowToolbar,
		OverflowToolbarAssociativePopover,
		ToolHeaderRenderer,
		Device,
		mobileLibrary
	) {
		"use strict";


		// shortcut for sap.m.PlacementType
		var PlacementType = mobileLibrary.PlacementType;


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
		 * <h3>Overview</h3>
		 * The ToolHeader control is based on {@link sap.m.OverflowToolbar}. It contains clearly structured menus of commands that are available across the various apps within the same tool layout.
		 * <h3>Usage</h3>
		 * <ul>
		 * <li>If an app implements side navigation in addition to the tool header menu, the menu icon must be the first item on the left-hand side of the tool header.</li>
		 * <li>The app menu and the side navigation must not have any dependencies and must work independently.</li>
		 * </ul>
		 * <h4>Fiori 3 theme specifics</h4>
		 * In Fiori 3 Default theme the ToolHeader is with dark design unlike most of the other controls. This defines the usage of limited controls inside it, which will result in good design combination.<br/>
		 * The ToolHeader stylizes the contained controls with the Shell color parameters, to match the dark design requirement. However, that's not a dark theme.<br/><br/>
		 * Only the following controls are supported:
		 * <ul>
		 * <li>sap.m.Text</li>
		 * <li>sap.m.Title</li>
		 * <li>sap.m.ObjectStatus</li>
		 * <li>sap.ui.core.Icon</li>
		 * <li>sap.m.Button</li>
		 * <li>sap.m.MenuButton</li>
		 * <li>sap.m.Select</li>
		 * <li>sap.m.SearchField</li>
		 * <li>sap.m.IconTabHeader</li>
		 * </ul>
		 *
		 * @extends sap.m.OverflowToolbar
		 * @implements sap.tnt.IToolHeader
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
				interfaces: ["sap.tnt.IToolHeader"],
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
					showArrow: Device.system.phone ? false : true,
					modal: false,
					horizontalScrolling: Device.system.phone ? false : true,
					contentWidth: Device.system.phone ? "100%" : "auto"
				}).addStyleClass('sapTntToolHeaderPopover sapContrast sapContrastPlus');

				if (Device.system.phone) {
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
		 * Returns "sap.m.PlacementType.Bottom".
		 * @returns {sap.m.PlacementType}
		 * @private
		 * @override
		 */
		ToolHeader.prototype._getBestActionSheetPlacement = function() {
			return PlacementType.Bottom;
		};

		return ToolHeader;

	});