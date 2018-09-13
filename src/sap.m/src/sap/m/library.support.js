/*!
 * ${copyright}
 */
/**
 * Adds support rules of the sap.m library to the support infrastructure.
 */
sap.ui.define([
	"sap/ui/support/library",
	"./rules/Breadcrumbs.support",
	"./rules/Button.support",
	"./rules/CheckBox.support",
	"./rules/Dialog.support",
	"./rules/IconTabBar.support",
	"./rules/Image.support",
	"./rules/Input.support",
	"./rules/Link.support",
	"./rules/MessagePage.support",
	"./rules/ObjectHeader.support",
	"./rules/ObjectListItem.support",
	"./rules/ObjectMarker.support",
	"./rules/ObjectStatus.support",
	"./rules/Panel.support",
	"./rules/Select.support",
	"./rules/SelectDialog.support",
	"./rules/Table.support",
	"./rules/Title.support",
	"./rules/Tokenizer.support"
],
	function(
		SupportLib,
		BreadcrumbsSupport,
		ButtonSupport,
		CheckBoxSupport,
		DialogSupport,
		IconTabBarSupport,
		ImageSupport,
		InputSupport,
		LinkSupport,
		MessagePageSupport,
		ObjectHeaderSupport,
		ObjectListItemSupport,
		ObjectMarkerSupport,
		ObjectStatusSupport,
		PanelSupport,
		SelectSupport,
		SelectDialogSupport,
		TableSupport,
		TitleSupport,
		TokenizerSupport
	) {
	"use strict";

	return {
		name: "sap.m",
		niceName: "UI5 Main Library",
		ruleset: [
			BreadcrumbsSupport,
			ButtonSupport,
			CheckBoxSupport,
			DialogSupport,
			IconTabBarSupport,
			ImageSupport,
			InputSupport,
			LinkSupport,
			MessagePageSupport,
			ObjectHeaderSupport,
			ObjectListItemSupport,
			ObjectMarkerSupport,
			ObjectStatusSupport,
			PanelSupport,
			SelectSupport,
			SelectDialogSupport,
			TableSupport,
			TitleSupport,
			TokenizerSupport
		]
	};

}, true);