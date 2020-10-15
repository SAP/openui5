/*!
 * ${copyright}
 */
/*
 * IMPORTANT: This is a private module, its API must not be used and is subject to change.
 * Code other than the OpenUI5 libraries must not introduce dependencies to this module.
 */
sap.ui.define([], function () {
	"use strict";

	/**
	 * Scrolls an item into the visual viewport.
	 *
	 * @param {sap.m.ListItemBase} oItem The list item
	 * @param {sap.m.Popover | sap.m.Dialog} oPicker The picker control
	 * @public
	 */
	var scrollToItem = function(oItem, oPicker) {
		var oItemDomRef = oItem && oItem.getDomRef && oItem.getDomRef(),
			oPickerContentDomRef = oPicker && oPicker.getDomRef && oPicker.getDomRef('cont');

		if (!oPickerContentDomRef || !oItemDomRef) {
			return;
		}

		var iPickerScrollTop = oPickerContentDomRef.scrollTop,
			iItemOffsetTop = oItemDomRef.offsetTop,
			iPickerHeight = oPickerContentDomRef.clientHeight,
			iItemHeight = oItemDomRef.offsetHeight;

		if (iPickerScrollTop > iItemOffsetTop) {

			// scroll up
			oPickerContentDomRef.scrollTop = iItemOffsetTop;

			// bottom edge of item > bottom edge of viewport
		} else if ((iItemOffsetTop + iItemHeight) > (iPickerScrollTop + iPickerHeight)) {

			// scroll down, the item is partly below the viewport of the list
			oPickerContentDomRef.scrollTop = Math.ceil(iItemOffsetTop + iItemHeight - iPickerHeight);
		}
	};

	return scrollToItem;
});