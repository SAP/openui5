sap.ui.define([
	"sap/ui/model/json/JSONModel"
], function (JSONModel) {
	"use strict";

	return new JSONModel({
		selectedKey: 'learnGettingStarted',
		navigation: [
			{
				title: 'Card Types',
				icon: 'sap-icon://card',
				key: 'exploreCardTypes',
				items: [
					{
						title: 'Table Card',
						key: 'exploreTableCard'
					}
				]
			}
		]
	});
});