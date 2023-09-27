/*!
 * ${copyright}
 */

sap.ui.define(["sap/ui/base/DataType"], function(DataType) {
	"use strict";

	/**
	 * Defines the behavior of the {@link sap.ui.mdc.Link}.
	 *
	 * @enum {number}
	 * @public
	 * @since 1.115
	 * @alias sap.ui.mdc.enums.LinkType
	 */
	const LinkType = {
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

	DataType.registerEnum("sap.ui.mdc.enums.LinkType", LinkType);

	return LinkType;

}, /* bExport= */ true);