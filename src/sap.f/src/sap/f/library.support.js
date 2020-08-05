/*!
 * ${copyright}
 */
/**
 * Adds support rules of the sap.f library to the support infrastructure.
 */
sap.ui.define([
		"sap/ui/support/library",
		"./rules/Avatar.support",
		"./rules/DynamicPage.support"
	],
	function (SupportLib, AvatarSupport, DynamicPageSupport) {
		"use strict";

		return {
			name: "sap.f",
			niceName: "UI5 Fiori Library",
			ruleset: [AvatarSupport, DynamicPageSupport]
		};

	}, true);