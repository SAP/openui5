sap.ui.define([
		"sap/m/Link",
		"sap/m/Text",
		"sap/m/Table",
		"sap/m/Page",
		"sap/ui/layout/form/Form",
		"sap/ui/layout/form/FormContainer",
		"sap/ui/layout/form/FormElement",
		"sap/ui/layout/form/SemanticFormElement",
		"sap/ui/layout/form/ColumnLayout",
		"sap/ui/model/json/JSONModel",
		"sap/m/Column",
		"sap/m/ColumnListItem",
		"sap/m/App",
		"sap/m/Button"
	], function(
		Link,
		Text,
		Table,
		Page,
		Form,
		FormContainer,
		FormElement,
		SemanticFormElement,
		ColumnLayout,
		JSONModel,
		Column,
		ColumnListItem,
		App,
		Button
	) {
		"use strict";

			var data = {
				tableData: [
					{column1: "column 1 value", column2: "column 2 with very long link that should truncate"},
					{column1: "column 1 value 2", column2: "column 2 with very long link that should truncate2"}
				]
			};

			// create a Model with this data
			var model = new JSONModel();
				model.setData(data);
			var table = new Table({
				columns: [
					new Column({header: new Text({text: "sap.m.Text"})}),
					new Column({header: new Text({text: "sap.m.Link"})})
				]
			}).setWidth("300px");

			// bind the Table items to the data collection
			table.bindItems({
				path : "/tableData",
				template : new ColumnListItem({
					cells: [
						new Text({text: "{column1}"}),
						new Link({text: "{column2}"})
					]
				})
			});
			table.setModel(model);

			var container = new FormContainer({
				title: "Contact",
				formElements: [
					new FormElement({
						label: "Mail",
						fields: [
							new Link({
								text: "max@mustermann.de",
								href: "mailto:max@mustermann.de"
							})
						]
					}),
					new SemanticFormElement({
						label: "Web",
						fields: [
							new Link({
								text: "http://www.mustermann.de",
								href: "http://www.mustermann.de"
							}),
							new Link({
								text: "http://www.mustermann.com",
								href: "http://www.mustermann.com"}
							)
						]
					})
				]
			});

			var app = new App("myApp", {initialPage:"page1"});

			var page1 = new Page("page1", {
				title:"Page 1",
				content : [
					new Link({
						id: "link_focusable",
						text : "To Page 2"
					}).addStyleClass("sapUiSmallMargin"),

					new Link({
						id: "link_disabled",
						text : "Disabled Link",
						enabled : false
					}).addStyleClass("sapUiSmallMargin"),

					new Link({
						id: "link_subtle",
						text : "Subtle Link",
						subtle : true,
						press : function() {
							app.to("page2");
						}
					}).addStyleClass("sapUiSmallMargin"),

					new Link({
						id: "link_emphasized",
						text : "Emphasized Link",
						emphasized : true,
						press : function() {
							app.to("page2");
						}
					}).addStyleClass("sapUiSmallMargin"),

					new Link({
						id: "link_disabled_subtle",
						text : "Disabled & Subtle Link",
						subtle : true,
						enabled : false,
						press : function() {
							app.to("page2");
						}
					}).addStyleClass("sapUiSmallMargin"),

					new Link({
						id: "link_disabled_emphasized",
						text : "Disabled & Emphasized Link",
						emphasized : true,
						enabled : false,
						press : function() {
							app.to("page2");
						}
					}).addStyleClass("sapUiSmallMargin"),

					new Link({
						id: "link_empty_content",
						text : "",
						emptyIndicatorMode: "On"
					}).addStyleClass("sapUiSmallMargin"),

					new Link({
						id: "link_icon1",
						text : "link with icon",
						icon: "sap-icon://globe",
					}).addStyleClass("sapUiSmallMargin"),

					new Link({
						id: "link_icon2",
						text : "link with end icon",
						endIcon: "sap-icon://inspect",
					}).addStyleClass("sapUiSmallMargin"),

					new Link({
						id: "link_icon3",
						text : "link with two icons",
						icon: "sap-icon://cart",
						endIcon: "sap-icon://begin",
					}).addStyleClass("sapUiSmallMargin"),

					table,

					new Form({
						layout: new ColumnLayout(),
						formContainers: [container]
					})
				]
			});

			var page2 = new Page("page2", {
				title:"Page 2",
				showNavButton: true,
				navButtonPress: function(){ app.back(); },
				content : [ new Button({
					text : "Nothing to see, back to Page 1",
					press : function() {
						app.back();
					}
				})]
			});
			app.addPage(page1).addPage(page2);

			app.placeAt("body");
	});