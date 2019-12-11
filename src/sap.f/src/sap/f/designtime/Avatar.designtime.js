/*!
 * ${copyright}
 */

// Provides the Design Time Metadata for the sap.f.Avatar control
sap.ui.define([
	"sap/ui/thirdparty/jquery",
	"sap/m/designtime/Avatar.designtime"],
	function (jQuery, mAvatarDesignTime) {
		"use strict";

		return jQuery.extend(mAvatarDesignTime, {
			templates: {
				create: "sap/f/designtime/Avatar.create.fragment.xml"
			}
		});
	}, /* bExport= */ false);