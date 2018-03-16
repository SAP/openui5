/* eslint-disable no-undef */
SemanticUtil = (function (
/* eslint-enable no-undef */
	SemanticPage,
	DynamicPageTitle,
	OverflowToolbar,
	ActionSheet,
	MessageStrip,
	Button,
	Title,
	Breadcrumbs,
	Link) {
	"use strict";

	jQuery.sap.require("sap.f.semantic.SemanticConfiguration");
	jQuery.sap.require("sap.f.semantic.SemanticTitle");
	jQuery.sap.require("sap.f.semantic.SemanticFooter");
	jQuery.sap.require("sap.f.semantic.SemanticShareMenu");
	jQuery.sap.require("sap.f.semantic.SemanticConfiguration");

	var oCore = sap.ui.getCore(),
		TESTS_DOM_CONTAINER = "qunit-fixture",
		aSemanticActionsMetadata = [
			{
				"constructor" : sap.f.semantic.AddAction,
				"className" : "AddAction"
			},
			{
				"constructor" : sap.f.semantic.CloseAction,
				"className" : "CloseAction"
			},
			{
				"constructor" : sap.f.semantic.CopyAction,
				"className" : "CopyAction"
			},
			{
				"constructor" : sap.f.semantic.DeleteAction,
				"className" : "DeleteAction"
			},
			{
				"constructor" : sap.f.semantic.EditAction,
				"className" : "EditAction"
			},
			{
				"constructor" : sap.f.semantic.DiscussInJamAction,
				"className" : "DiscussInJamAction"
			},
			{
				"constructor" : sap.m.DraftIndicator,
				"className" : "DraftIndicator"
			},
			{
				"constructor" : sap.f.semantic.ExitFullScreenAction,
				"className" : "ExitFullScreenAction"
			},
			{
				"constructor" : sap.f.semantic.FavoriteAction,
				"className" : "FavoriteAction"
			},
			{
				"constructor" : sap.f.semantic.FlagAction,
				"className" : "FlagAction"
			},
			{
				"constructor" : sap.f.semantic.FooterMainAction,
				"className" : "FooterMainAction"
			},
			{
				"constructor" : sap.f.semantic.FullScreenAction,
				"className" : "FullScreenAction"
			},
			{
				"constructor" : sap.f.semantic.MessagesIndicator,
				"className" : "MessagesIndicator"
			},
			{
				"constructor" : sap.f.semantic.NegativeAction,
				"className" : "NegativeAction"
			},
			{
				"constructor" : sap.f.semantic.PositiveAction,
				"className" : "PositiveAction"
			},
			{
				"constructor" : sap.f.semantic.PrintAction,
				"className" : "PrintAction"
			},
			{
				"constructor" : sap.f.semantic.SendEmailAction,
				"className" : "SendEmailAction"
			},
			{
				"constructor" : sap.f.semantic.SendMessageAction,
				"className" : "SendMessageAction"
			},
			{
				"constructor" : sap.f.semantic.ShareInJamAction,
				"className" : "ShareInJamAction"
			},
			{
				"constructor" : sap.f.semantic.TitleMainAction,
				"className" : "TitleMainAction"
			}
		],
		oFactory = {
			getSemanticPage: function (oConfiguration) {
				return new SemanticPage(oConfiguration || {});
			},
			getSemanticTitle : function(oContainer) {
				return new sap.f.semantic.SemanticTitle(oContainer, null);
			},
			getSemanticFooter : function(oContainer) {
				return new sap.f.semantic.SemanticFooter(oContainer, null);
			},
			getSemanticShareMenu : function (oContainer) {
				return new sap.f.semantic.SemanticShareMenu(oContainer, this.getSemanticPage());
			},
			getDynamicPageTitle : function() {
				return new DynamicPageTitle();
			},
			getOverflowToolbar : function() {
				return new OverflowToolbar();
			},
			getActionSheet : function() {
				return new ActionSheet();
			},
			getAction: function () {
				return new Button({
					text: "Action"
				});
			},
			getMessageStrip: function (iNumber) {
				return new MessageStrip({
					text: "Content " + ++iNumber
				});
			},
			getMessageStrips: function (iNumber) {
				var aMessageStrips = [];

				for (var i = 0; i < iNumber; i++) {
					aMessageStrips.push(this.getMessageStrip(i));
				}
				return aMessageStrips;
			},
			getTitle: function (sText) {
				return new Title({
					text: sText || "Default Title"
				});
			},
			getBreadcrumbs: function () {
				return new Breadcrumbs({
					links: [
						this.getLink({text: "Link"}),
						this.getLink({text: "Link"}),
						this.getLink({text: "Link"}),
						this.getLink({text: "Link"}),
						this.getLink({text: "Link"})
					]
				});
			},
			getLink: function(oConfig) {
				return new Link(oConfig || {});
			},
			getSemanticConfiguration : function() {
				return sap.f.semantic.SemanticConfiguration;
			},
			getSemanticActionsMetadata : function() {
				return aSemanticActionsMetadata;
			}
		};

		aSemanticActionsMetadata.forEach(function (oSemanticActionMetadata) {
			var sClassName = oSemanticActionMetadata.className,
				oClass = oSemanticActionMetadata.constructor;

			oFactory["get" + sClassName] = function() {
				/*eslint-disable new-cap*/
				return new oClass();
				/*eslint-enable new-cap*/
			};
		});

		return {
			oFactory : oFactory,
			oUtil : {
				renderObject: function (oObject) {
					oObject.placeAt(TESTS_DOM_CONTAINER);
					oCore.applyChanges();
					return oObject;
				}
			}
		};
})(sap.f.semantic.SemanticPage, sap.f.DynamicPageTitle, sap.m.OverflowToolbar, sap.m.ActionSheet, sap.m.MessageStrip, sap.m.Button, sap.m.Title, sap.m.Breadcrumbs, sap.m.Link);