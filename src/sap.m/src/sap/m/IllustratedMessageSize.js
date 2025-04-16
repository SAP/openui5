/*!
 * ${copyright}
 */

sap.ui.define(["sap/ui/base/DataType"], function(DataType) {
	"use strict";

	/**
	 * Available <code>Illustration</code> sizes for the {@link sap.m.IllustratedMessage} control.
	 *
	 * @enum {string}
	 * @public
	 * @alias sap.m.IllustratedMessageSize
	 * @since 1.98
	 */
	var IllustratedMessageSize = {
	 /**
	  * Automatically decides the <code>Illustration</code> size (<code>Base</code>, <code>Spot</code>,
	  * <code>Dialog</code>, or <code>Scene</code>) depending on the <code>IllustratedMessage</code> container width.
	  *
	  * <b>Note:</b> <code>Auto</code> is the only option where the illustration size is changed according to
	  * the available container width. If any other <code>IllustratedMessageSize</code> is chosen, it remains
	  * until changed by the app developer.
	  *
	  * @public
	  */
	 Auto : "Auto",

	 /**
	  * Base <code>Illustration</code> size. Suitable for cards (two columns).
	  *
	  * <b>Note:</b> When <code>Base</code> is in use, no illustration is displayed.
	  *
	  * @public
	  */
	 Base : "Base",

	 /**
	  * Large <code>Illustration</code> size.
	  * Alias for <code>Scene</code> size (L breakpoint). Suitable for a <code>Page</code> or a table.
	  * @public
	  * @since 1.136
	  */
	 Large : "Large",

	 /**
	  * Medium <code>Illustration</code> size.
	  * Alias for <code>Dialog</code> size (M breakpoint). Suitable for dialogs.
	  * @public
	  * @since 1.136
	  */
	 Medium : "Medium",

	 /**
	  * Small <code>Illustration</code> size.
	  * Alias for <code>Spot</code> size (S breakpoint). Suitable for cards (four columns).
	  * @public
	  * @since 1.136
	  */
	 Small : "Small",

	 /**
	  * Extra Small <code>Illustration</code> size.
	  * Alias for <code>Dot</code> size (XS breakpoint). Suitable for spaces with little vertical space.
	  * @public
	  * @since 1.136
	  */
	 ExtraSmall : "ExtraSmall"
	};

	DataType.registerEnum("sap.m.IllustratedMessageSize", IllustratedMessageSize);

	return IllustratedMessageSize;
});


