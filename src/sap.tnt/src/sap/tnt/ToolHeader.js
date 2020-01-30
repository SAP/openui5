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
			<div>
			<table>

			<tr>
				<th style="text-align: left;">Control name</th>
				<th style="text-align: left;">Supported</th>
				<th style="text-align: left;">Not supported</th>
			</tr>
			<tr>
				<td>sap.m.Text</td>
				<td>Single line text, text truncation</td>
				<td>Wrapping</td>
			</tr>
			<tr>
				<td>sap.m.Title</td>
				<td>Single line text, text truncation. Consider using title headings of H4, H5, H6.</td>
				<td>Wrapping</td>
			</tr>
			<tr>
				<td>sap.m.Label</td>
				<td>Single line text, text truncation</td>
				<td>Wrapping</td>
			</tr>
			<tr>
				<td>sap.m.ObjectStatus</td>
				<td>Labels, semantic colors</td>
				<td>Indication colors</td>
			</tr>
			<tr>
				<td>sap.ui.core.Icon</td>
				<td>sap.ui.core.IconColor enumeration for both icons and backgrounds.</td>
				<td>Interaction state colors</td>
			</tr>
			<tr>
				<td>sap.m.Button</td>
				<td>Buttons in their Back, Default, Transparent and Up types. All four types are over-styled to look as transparent buttons.</td>
				<td>-</td>
			</tr>
			<tr>
				<td>sap.m.MenuButton</td>
				<td>Emphasized button type. Should be used for triggering Mega menu. If there is no Mega menu, use Title (H6) instead. </br> Default (over-styled as Transparent) and Transparent types are used for standard menu representation.</td>
				<td>-</td>
			</tr>
			<tr>
				<td>sap.m.Select</td>
				<td>Default and IconOnly types. IconOnly looks like a button while Default looks is like an input.</td>
				<td>Semantic states</td>
			</tr>
			<tr>
				<td>sap.m.SearchField</td>
				<td>Support for the regular state of the control.</td>
				<td>-</td>
			</tr>
			<tr>
				<td>sap.m.IconTabHeader</td>
				<td>All background design variations (all are transparent). Text tab filters or text and count tab filters in Inline mode only.</td>
				<td>Semantic colors, icons and separators.</td>
			</tr>
			<tr>
				<td>sap.f.Avatar/sap.m.Avatar</td>
				<td>Support for default (Accent 6) color. Image avatar.</td>
				<td>-</td>
			</tr>
			<tr>
				<td>sap.m.Image</td>
				<td>Primarily used for displaying the company logo.</td>
				<td>Interaction states</td>
			</tr>
			</table>
			</div>
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