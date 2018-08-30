/*!
 * ${copyright}
 */
/**
 * Adds support rules of the sap.f library to the support infrastructure.
 */
sap.ui.define([
		"sap/ui/support/library",
		"./rules/Avatar.support"
	],
	function (SupportLib, AvatarSupport) {
		"use strict";

		return {
			name: "sap.f",
			niceName: "UI5 Fiori Library",
			ruleset: [AvatarSupport]
		};

	}, true);