/*!
 * ${copyright}
 */

sap.ui.define(function() {
	"use strict";

	/**
	 * Defines the behavior of the {@link sap.ui.mdc.Link}.
	 *
	 * @enum {number}
	 * @private
	 * @ui5-restricted sap.fe
	 * @MDC_PUBLIC_CANDIDATE
	 * @since 1.114
	 * @alias sap.ui.mdc.enum.LinkType
	 */
	var LinkType = {
		/**
		 * {@link sap.ui.mdc.Link} is rendered as a {@link sap.m.Text}
		 * @private
		 * @ui5-restricted sap.fe
		 * @MDC_PUBLIC_CANDIDATE
		 */
		Text: 0,
		/**
		 * {@link sap.ui.mdc.Link} is rendered as a {@link sap.m.Link} that works as a direct link
		 * @private
		 * @ui5-restricted sap.fe
		 * @MDC_PUBLIC_CANDIDATE
		 */
		DirectLink: 1,
		/**
		 * {@link sap.ui.mdc.Link} is rendered as a {@link sap.m.Link} that opens a popover when pressed
		 * @private
		 * @ui5-restricted sap.fe
		 * @MDC_PUBLIC_CANDIDATE
		 */
		Popover: 2
	};

	return LinkType;

}, /* bExport= */ true);