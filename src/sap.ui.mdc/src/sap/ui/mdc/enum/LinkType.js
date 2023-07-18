/*!
 * ${copyright}
 */

sap.ui.define(function() {
	"use strict";

	/**
	 * Defines the behavior of the {@link sap.ui.mdc.Link}.
	 *
	 * @enum {number}
	 * @since 1.114
	 * @alias sap.ui.mdc.enum.LinkType
	 * @private
	 * @ui5-restricted sap.fe
	 * @deprecated since 1.115.0 - please see {@link sap.ui.mdc.enums.LinkType}
	 */
	var LinkType = {
		/**
		 * {@link sap.ui.mdc.Link} is rendered as a {@link sap.m.Text}
		 * @public
		 */
		Text: 0,
		/**
		 * {@link sap.ui.mdc.Link} is rendered as a {@link sap.m.Link} that works as a direct link
		 * @public
		 */
		DirectLink: 1,
		/**
		 * {@link sap.ui.mdc.Link} is rendered as a {@link sap.m.Link} that opens a popover when pressed
		 * @public
		 */
		Popover: 2
	};

	return LinkType;

}, /* bExport= */ true);