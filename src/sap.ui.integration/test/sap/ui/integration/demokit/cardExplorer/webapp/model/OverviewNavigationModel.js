sap.ui.define([
	"sap/ui/model/json/JSONModel"
], function (JSONModel) {
	"use strict";

	return new JSONModel({
		selectedKey: "overview",
		navigation: [
			{
				title: "Introduction",
				topicTitle: "Integration Card Introduction",
				icon: "sap-icon://home",
				target: "overview",
				key: "introduction"
			},
			{
				title: "Card Types",
				topicTitle: "Integration Card Types",
				icon: "sap-icon://initiative",
				target: "overview",
				key: "cardTypes"
			},
			{
				title: "Developing Cards",
				topicTitle: "Developing Integration Cards",
				icon: "sap-icon://header",
				target: "overview",
				key: "developingCards"
			}
		]
	});
});
