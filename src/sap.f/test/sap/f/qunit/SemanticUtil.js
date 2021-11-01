sap.ui.define([
	"sap/ui/core/Core",
	"sap/f/semantic/AddAction",
	"sap/f/semantic/CloseAction",
	"sap/f/semantic/CopyAction",
	"sap/f/semantic/DeleteAction",
	"sap/f/semantic/EditAction",
	"sap/f/semantic/DiscussInJamAction",
	"sap/f/semantic/ExitFullScreenAction",
	"sap/f/semantic/FavoriteAction",
	"sap/f/semantic/FlagAction",
	"sap/f/semantic/FooterMainAction",
	"sap/f/semantic/FullScreenAction",
	"sap/f/semantic/MessagesIndicator",
	"sap/f/semantic/NegativeAction",
	"sap/f/semantic/PositiveAction",
	"sap/f/semantic/PrintAction",
	"sap/f/semantic/SendEmailAction",
	"sap/f/semantic/SendMessageAction",
	"sap/f/semantic/ShareInJamAction",
	"sap/f/semantic/TitleMainAction",
	"sap/f/semantic/SemanticConfiguration",
	"sap/f/semantic/SemanticFooter",
	"sap/f/semantic/SemanticPage",
	"sap/f/semantic/SemanticShareMenu",
	"sap/f/semantic/SemanticTitle",
	"sap/m/DraftIndicator",
	"sap/f/DynamicPageTitle",
	"sap/m/OverflowToolbar",
	"sap/m/ActionSheet",
	"sap/m/MessageStrip",
	"sap/m/Button",
	"sap/m/Title",
	"sap/m/Breadcrumbs",
	"sap/m/Link"
],
function (
	oCore,
	AddAction,
	CloseAction,
	CopyAction,
	DeleteAction,
	EditAction,
	DiscussInJamAction,
	ExitFullScreenAction,
	FavoriteAction,
	FlagAction,
	FooterMainAction,
	FullScreenAction,
	MessagesIndicator,
	NegativeAction,
	PositiveAction,
	PrintAction,
	SendEmailAction,
	SendMessageAction,
	ShareInJamAction,
	TitleMainAction,
	SemanticConfiguration,
	SemanticFooter,
	SemanticPage,
	SemanticShareMenu,
	SemanticTitle,
	DraftIndicator,
	DynamicPageTitle,
	OverflowToolbar,
	ActionSheet,
	MessageStrip,
	Button,
	Title,
	Breadcrumbs,
	Link
) {
	"use strict";

	var TESTS_DOM_CONTAINER = "qunit-fixture",
		aSemanticActionsMetadata = [
			{
				"constructor" : AddAction,
				"className" : "AddAction"
			},
			{
				"constructor" : CloseAction,
				"className" : "CloseAction"
			},
			{
				"constructor" : CopyAction,
				"className" : "CopyAction"
			},
			{
				"constructor" : DeleteAction,
				"className" : "DeleteAction"
			},
			{
				"constructor" : EditAction,
				"className" : "EditAction"
			},
			{
				"constructor" : DiscussInJamAction,
				"className" : "DiscussInJamAction"
			},
			{
				"constructor" : DraftIndicator,
				"className" : "DraftIndicator"
			},
			{
				"constructor" : ExitFullScreenAction,
				"className" : "ExitFullScreenAction"
			},
			{
				"constructor" : FavoriteAction,
				"className" : "FavoriteAction"
			},
			{
				"constructor" : FlagAction,
				"className" : "FlagAction"
			},
			{
				"constructor" : FooterMainAction,
				"className" : "FooterMainAction"
			},
			{
				"constructor" : FullScreenAction,
				"className" : "FullScreenAction"
			},
			{
				"constructor" : MessagesIndicator,
				"className" : "MessagesIndicator"
			},
			{
				"constructor" : NegativeAction,
				"className" : "NegativeAction"
			},
			{
				"constructor" : PositiveAction,
				"className" : "PositiveAction"
			},
			{
				"constructor" : PrintAction,
				"className" : "PrintAction"
			},
			{
				"constructor" : SendEmailAction,
				"className" : "SendEmailAction"
			},
			{
				"constructor" : SendMessageAction,
				"className" : "SendMessageAction"
			},
			{
				"constructor" : ShareInJamAction,
				"className" : "ShareInJamAction"
			},
			{
				"constructor" : TitleMainAction,
				"className" : "TitleMainAction"
			}
		],
		oFactory = {
			getSemanticPage: function (oConfiguration) {
				return new SemanticPage(oConfiguration || {});
			},
			getSemanticTitle : function(oContainer) {
				return new SemanticTitle(oContainer, null);
			},
			getSemanticFooter : function(oContainer) {
				return new SemanticFooter(oContainer, null);
			},
			getSemanticShareMenu : function (oContainer) {
				return new SemanticShareMenu(oContainer, this.getSemanticPage());
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
				return SemanticConfiguration;
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
});