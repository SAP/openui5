/*!
 * ${copyright}
 */

// Provides class sap.ui.core.support.plugins.ControlTree (ControlTree support plugin)
sap.ui.define([
	'sap/ui/core/support/Plugin',
	'sap/ui/core/util/serializer/ViewSerializer',
	'sap/ui/core/util/File',
	'sap/ui/thirdparty/jszip',
	'sap/ui/base/DataType',
	'sap/ui/core/Component',
	'sap/ui/core/Element',
	'sap/ui/core/ElementMetadata',
	'sap/ui/core/UIArea',
	'sap/ui/core/mvc/View',
	'sap/ui/core/mvc/XMLView',
	'sap/ui/core/tmpl/Template',
	'sap/ui/model/Binding',
	'sap/ui/model/CompositeBinding',
	'sap/base/util/each',
	'sap/base/util/isEmptyObject',
	'sap/base/util/ObjectPath',
	"sap/ui/thirdparty/jquery",
	"sap/ui/events/KeyCodes",
	'sap/ui/core/mvc/Controller' // provides sap.ui.controller
], function(
	Plugin,
	ViewSerializer,
	File,
	JSZip,
	DataType,
	Component,
	Element,
	ElementMetadata,
	UIArea,
	View,
	XMLView,
	Template,
	Binding,
	CompositeBinding,
	each,
	isEmptyObject,
	ObjectPath,
	$,
	KeyCodes
) {
	"use strict";

	/*global alert */

		/**
		 * Creates an instance of sap.ui.core.support.plugins.ControlTree.
		 * @class This class represents the ControlTree plugin for the support tool functionality of UI5. This class is internal and all its functions must not be used by an application.
		 *
		 * @extends sap.ui.core.support.Plugin
		 * @version ${version}
		 * @private
		 * @alias sap.ui.core.support.plugins.ControlTree
		 */
		var ControlTree = Plugin.extend("sap.ui.core.support.plugins.ControlTree", {
			constructor : function(oSupportStub) {
				Plugin.apply(this, [ "sapUiSupportControlTree", "Control Tree", oSupportStub]);

				this._oStub = oSupportStub;

				if (this.runsAsToolPlugin()) {

					// TOOLS SIDE!

					this._aEventIds = [
						"sapUiSupportSelectorSelect",
						this.getId() + "ReceiveControlTree",
						this.getId() + "ReceiveControlTreeExport",
						this.getId() + "ReceiveControlTreeExportError",
						this.getId() + "TriggerRequestProperties",
						this.getId() + "ReceiveProperties",
						this.getId() + "ReceiveBindingInfos",
						this.getId() + "ReceiveMethods",
						this.getId() + "ReceivePropertiesMethods"
					];

					this._breakpointId = "sapUiSupportBreakpoint";

					this._tab = {
						properties: "Properties",
						bindinginfos: "BindingInfos",
						breakpoints: "Breakpoints",
						exports: "Export"
					};

					this._currentTab = this._tab.properties;

				} else {

					// APPS SIDE!

					this._aEventIds = [
						this.getId() + "RequestControlTree",
						this.getId() + "RequestControlTreeSerialize",
						this.getId() + "RequestProperties",
						this.getId() + "RequestBindingInfos",
						this.getId() + "ChangeProperty",
						this.getId() + "RefreshBinding"
					];

					// register as core plugin
					var that = this;

					sap.ui.getCore().registerPlugin({
						startPlugin: function(oCore) {
							that.oCore = oCore;
						},
						stopPlugin: function() {
							that.oCore = undefined;
						}
					});

				}
			}
		});

		ControlTree.prototype.init = function(oSupportStub){
			Plugin.prototype.init.apply(this, arguments);

			if (this.runsAsToolPlugin()) {
				initInTools.call(this, oSupportStub);
			} else {
				initInApps.call(this, oSupportStub);
			}

		};

		function initInTools(oSupportStub) {
			$(document)
			.on("click", "li img.sapUiControlTreeIcon", this._onIconClick.bind(this))
			.on("click", "li.sapUiControlTreeElement div", this._onNodeClick.bind(this))
			.on("click", "li.sapUiControlTreeLink div", this._onControlTreeLinkClick.bind(this))
			.on("click", "#sapUiSupportControlTabProperties", this._onPropertiesTab.bind(this))
			.on("click", "#sapUiSupportControlTabBindingInfos", this._onBindingInfosTab.bind(this))
			.on("click", "#sapUiSupportControlTabBreakpoints", this._onMethodsTab.bind(this))
			.on("click", "#sapUiSupportControlTabExport", this._onExportTab.bind(this))
			.on("change", "[data-sap-ui-name]", this._onPropertyChange.bind(this))
			.on("change", "[data-sap-ui-method]", this._onPropertyBreakpointChange.bind(this))
			.on("keyup", '.sapUiSupportControlMethods input[type="text"]', this._autoComplete.bind(this))
			.on("blur", '.sapUiSupportControlMethods input[type="text"]', this._updateSelectOptions.bind(this))
			.on("change", '.sapUiSupportControlMethods select', this._selectOptionsChanged.bind(this))
			.on("click", '#sapUiSupportControlAddBreakPoint', this._onAddBreakpointClicked.bind(this))
			.on("click", '#sapUiSupportControlExportToXml', this._onExportToXmlClicked.bind(this))
			.on("click", '#sapUiSupportControlExportToHtml', this._onExportToHtmlClicked.bind(this))
			.on("click", '#sapUiSupportControlActiveBreakpoints img.remove-breakpoint', this._onRemoveBreakpointClicked.bind(this))
			.on("click", '#sapUiSupportControlPropertiesArea a.control-tree', this._onNavToControl.bind(this))
			.on("click", '#sapUiSupportControlPropertiesArea img.sapUiSupportRefreshBinding', this._onRefreshBinding.bind(this));

			this.renderContentAreas();
		}

		ControlTree.prototype.exit = function(oSupportStub) {
			Plugin.prototype.exit.apply(this, arguments);
			if (this.runsAsToolPlugin()) {
				$(document)
				.off('click', 'li img.sapUiControlTreeIcon')
				.off('click', 'li div')
				.off("click", "li.sapUiControlTreeLink")
				.off("click", "#sapUiSupportControlTabProperties")
				.off("click", "#sapUiSupportControlTabBindings")
				.off("click", "#sapUiSupportControlTabBreakpoints")
				.off("click", "#sapUiSupportControlTabExport")
				.off('change', '[data-sap-ui-name]')
				.off('change', '[data-sap-ui-method]')
				.off('keyup', '.sapUiSupportControlMethods input[type="text"]')
				.off('blur', '.sapUiSupportControlMethods select')
				.off('change', '.sapUiSupportControlMethods select')
				.off('click', '#sapUiSupportControlAddBreakPoint')
				.off('click', '#sapUiSupportControlExportToXml')
				.off('click', '#sapUiSupportControlExportToHtml')
				.off('click', '#sapUiSupportControlActiveBreakpoints img.remove-breakpoint')
				.off('click', '#sapUiSupportControlPropertiesArea a.control-tree')
				.off('click', '#sapUiSupportControlPropertiesArea img.sapUiSupportRefreshBinding');
			}
		};

		// -------------------------------
		// Rendering
		// -------------------------------

		function basename(s) {
			if ( s == null ) {
				return "";
			}
			s = String(s);
			return s.slice(1 + s.lastIndexOf('.'));
		}

		ControlTree.prototype.renderContentAreas = function() {
			var rm = sap.ui.getCore().createRenderManager();

			rm.openStart("div").class("sapUiSupportControlTreeTitle").openEnd().text("You can find a control in this tree by clicking it in the application UI while pressing the Ctrl+Alt+Shift keys.").close("div");

			rm.openStart("div", "sapUiSupportControlTreeArea").openEnd();
				rm.openStart("ul").class("sapUiSupportControlTreeList").openEnd().close("ul");
			rm.close("div");

			rm.openStart("div", "sapUiSupportControlTabs").class("sapUiSupportControlTabsHidden").openEnd();
				rm.openStart("button", "sapUiSupportControlTabProperties").class("sapUiSupportBtn").class("sapUiSupportTab").class("sapUiSupportTabLeft").openEnd().text("Properties").close("button");
				rm.openStart("button", "sapUiSupportControlTabBindingInfos").class("sapUiSupportBtn").class("sapUiSupportTab").openEnd().text("Binding Infos").close("button");
				rm.openStart("button", "sapUiSupportControlTabBreakpoints").class("sapUiSupportBtn").class("sapUiSupportTab").openEnd().text("Breakpoints").close("button");
				rm.openStart("button", "sapUiSupportControlTabExport").class("sapUiSupportBtn").class("sapUiSupportTab").class("sapUiSupportTabRight").openEnd().text("Export").close("button");
			rm.close("div");

			rm.openStart("div", "sapUiSupportControlPropertiesArea").openEnd().close("div");
			rm.flush(this.dom());
			rm.destroy();
		};

		ControlTree.prototype.renderControlTree = function(aControlTree) {

			var rm = sap.ui.getCore().createRenderManager();

			function renderNode (iIndex, mElement) {
				var bHasChildren = mElement.aggregation.length > 0 || mElement.association.length > 0;
				rm.openStart("li", "sap-debug-controltree-" + mElement.id).class("sapUiControlTreeElement").openEnd();
				var sImage = bHasChildren ? "minus" : "space";
				rm.voidStart("img").class("sapUiControlTreeIcon").attr("src", "../../debug/images/" + sImage + ".gif").voidEnd();

				if (mElement.isAssociation) {
					rm.voidStart("img").attr("title", "Association").class("sapUiControlTreeIcon").attr("src", "../../debug/images/link.gif").voidEnd();
				}

				var sClass = basename(mElement.type);

				rm.openStart("div").openEnd();

				rm.openStart("span").class("name").attr("title", mElement.type).openEnd().text(sClass + ' - ' + mElement.id).close("span");
				rm.openStart("span").class("sapUiSupportControlTreeBreakpointCount").class("sapUiSupportItemHidden").attr("title", "Number of active breakpoints / methods").openEnd().close("span");

				rm.close("div");

				if (mElement.aggregation.length > 0) {
					rm.openStart("ul").openEnd();
					each(mElement.aggregation, renderNode);
					rm.close("ul");
				}

				if (mElement.association.length > 0) {
					rm.openStart("ul").openEnd();
					each(mElement.association, function(iIndex, oValue) {

						if (oValue.isAssociationLink) {
							var sType = basename(oValue.type);
							rm.openStart("li").attr("data-sap-ui-controlid", oValue.id).class("sapUiControlTreeLink").openEnd();
							rm.voidStart("img").class("sapUiControlTreeIcon").attr("align", "middle").attr("src", "../../debug/images/space.gif").voidEnd();
							rm.voidStart("img").class("sapUiControlTreeIcon").attr("align", "middle").attr("src", "../../debug/images/link.gif").voidEnd();
							rm.openStart("div").openEnd();
								rm.openStart("span").attr("title", "Association '" + oValue.name + "' to '" + oValue.id + "' with type '" + oValue.type).openEnd();
								rm.text(sType + " - " + oValue.id + " (" + oValue.name + ")");
								rm.close("span");
							rm.close("div");
							rm.close("li");
						} else {
							renderNode(0 /* not used */, oValue);
						}

					});
					rm.close("ul");
				}
				rm.close("li");
			}

			each(aControlTree, renderNode);

			rm.flush(this.dom("#sapUiSupportControlTreeArea > ul.sapUiSupportControlTreeList"));
			rm.destroy();
		};

		ControlTree.prototype.renderPropertiesTab = function(aControlProps, sControlId) {

			var rm = sap.ui.getCore().createRenderManager();

			rm.openStart("ul").class("sapUiSupportControlTreeList").attr("data-sap-ui-controlid", sControlId).openEnd();
			each(aControlProps, function(iIndex, oValue) {

				rm.openStart("li").openEnd();

				rm.openStart("span").openEnd()
						.openStart("label").class("sapUiSupportLabel").openEnd().text("BaseType").close("label")
						.text(" ")
						.openStart("code").openEnd().text(oValue.control).close("code")
					.close("span");

				if (oValue.properties.length > 0 || oValue.aggregations.length > 0) {

					rm.openStart("div").class("get").attr("title", "Activate debugger for get-method").openEnd().text("G").close("div");
					rm.openStart("div").class("set").attr("title", "Activate debugger for set-method").openEnd().text("S").close("div");

					rm.openStart("div").class("sapUiSupportControlProperties").openEnd();
						rm.openStart("table").openEnd();
							rm.openStart("colgroup").openEnd();
								rm.voidStart("col").attr("width", "50%").voidEnd();
								rm.voidStart("col").attr("width", "50%").voidEnd();
							rm.close("colgroup");

					each(oValue.properties, function(iIndex, oProperty) {

						rm.openStart("tr").openEnd();

						rm.openStart("td").openEnd();
							rm.openStart("label").class("sapUiSupportLabel").openEnd().text(oProperty.name);
								if (oProperty.isBound) {
									rm.voidStart("img").attr("title", "Value is bound (see Binding Infos)").attr("src", "../../debug/images/link.gif").voidEnd();
								}
							rm.close("label");
						rm.close("td");

						rm.openStart("td").openEnd();

						if (oProperty.type === "boolean") {

							rm.voidStart("input").attr("type", "checkbox");
							rm.attr("data-sap-ui-name", oProperty.name);
							if (oProperty.value == true) {
								rm.attr("checked", "checked");
							}
							rm.voidEnd();

						} else if (oProperty.enumValues) {

							rm.openStart("div").openEnd();
							rm.openStart("select");
							rm.attr("data-sap-ui-name", oProperty.name).openEnd();
							each(oProperty.enumValues, function(sKey, sValue) {
								rm.openStart("option");

								if (sKey === oProperty.value) {
									rm.attr("selected", "selected");
								}

								rm.openEnd();
								rm.text(sKey);
								rm.close("option");
							});
							rm.close("select");
							rm.close("div");

						} else {

							rm.openStart("div").openEnd();
							rm.voidStart("input").attr("type", "text");
							rm.attr("data-sap-ui-name", oProperty.name);
							if (oProperty.value) {
								rm.attr("value", oProperty.value);
							}
							rm.voidEnd();
							rm.close("div");

						}

						rm.close("td");

						rm.openStart("td").openEnd();
							rm.voidStart("input")
								.attr("type", "checkbox")
								.attr("data-sap-ui-method", oProperty._sGetter)
								.attr("title", "Activate debugger for '" + oProperty._sGetter + "'");
							if (oProperty.bp_sGetter) {
								rm.attr("checked", "checked");
							}
							rm.voidEnd();
						rm.close("td");

						rm.openStart("td").openEnd();
							rm.voidStart("input")
								.attr("type", "checkbox")
								.attr("data-sap-ui-method", oProperty._sMutator)
								.attr("title", "Activate debugger for '" + oProperty._sMutator + "'");
							if (oProperty.bp_sMutator) {
								rm.attr("checked", "checked");
							}
							rm.voidEnd();
						rm.close("td");

						rm.close("tr");

					});

					each(oValue.aggregations, function(iIndex, oAggregation) {

						rm.openStart("tr").openEnd();

							rm.openStart("td").openEnd();
								rm.openStart("label").class("sapUiSupportLabel").openEnd().text(oAggregation.name).close("label");
							rm.close("td");

							rm.openStart("td").openEnd();
							rm.text(oAggregation.value);
							rm.close("td");

							rm.openStart("td").openEnd();
							rm.voidStart("input")
								.attr("type", "checkbox")
								.attr("data-sap-ui-method", oAggregation._sGetter)
								.attr("title", "Activate debugger for '" + oAggregation._sGetter + "'");
							if (oAggregation.bp_sGetter) {
								rm.attr("checked", "checked");
							}
							rm.voidEnd();
							rm.close("td");

							rm.openStart("td").openEnd();
							rm.voidStart("input")
								.attr("type", "checkbox")
								.attr("data-sap-ui-method", oAggregation._sMutator)
								.attr("title", "Activate debugger for '" + oAggregation._sMutator + "'");
							if (oAggregation.bp_sMutator) {
								rm.attr("checked", "checked");
							}
							rm.voidEnd();
							rm.close("td");

						rm.close("tr");

					});

					rm.close("table").close("div");

				}

				rm.close("li");

			});
			rm.close("ul");
			rm.flush(this.dom("#sapUiSupportControlPropertiesArea"));
			rm.destroy();

			this.dom("#sapUiSupportControlTabs").classList.remove("sapUiSupportControlTabsHidden");

			this.selectTab(this._tab.properties);
		};

		ControlTree.prototype.renderBindingsTab = function(mBindingInfos, sControlId) {

			var rm = sap.ui.getCore().createRenderManager();

			if (mBindingInfos.contexts.length > 0) {

				rm.openStart("h2").openEnd().text("Contexts").close("h2");

				rm.openStart("ul").class("sapUiSupportControlTreeList").attr("data-sap-ui-controlid", sControlId).openEnd();

				each(mBindingInfos.contexts, function(iContextIndex, oContext) {

					rm.openStart("li").openEnd();

					rm.openStart("span").openEnd();
						rm.openStart("label").class("sapUiSupportLabel").openEnd().text("Model Name: " + oContext.modelName).close("label");
					rm.close("span");

					rm.openStart("div").class("sapUiSupportControlProperties").openEnd();

					rm.openStart("table").openEnd()
						.openStart("colgroup").openEnd()
							.voidStart("col").attr("width", "15%").voidEnd()
							.voidStart("col").attr("width", "35%").voidEnd()
							.voidStart("col").attr("width", "50%").voidEnd()
						.close("colgroup");
					rm.openStart("tbody").openEnd();

					// Path
					rm.openStart("tr").openEnd();

						rm.openStart("td").attr("colspan", "2").openEnd();
							rm.openStart("label").class("sapUiSupportLabel").openEnd().text("Path").close("label");
						rm.close("td");

						rm.openStart("td").openEnd();
							rm.openStart("div").openEnd();
								rm.openStart("span");

								if (oContext.invalidPath) {
									rm.class("sapUiSupportModelPathInvalid");
								} else if (oContext.unverifiedPath) {
									rm.class("sapUiSupportModelPathUnverified");
								}

								rm.openEnd().text(oContext.path);

								if (oContext.invalidPath) {
									rm.text(" (invalid)");
								} else if (oContext.unverifiedPath) {
									rm.text(" (unverified)");
								}

								rm.close("span");
							rm.close("div");
						rm.close("td");

					rm.close("tr");

					if (oContext.location) {

						// Inherited from
						rm.openStart("tr").openEnd();

						rm.openStart("td").attr("colspan", "2").openEnd();
						rm.openStart("label").class("sapUiSupportLabel").openEnd().text("Inherited from").close("label");
						rm.close("td");

						rm.openStart("td").openEnd();
							rm.openStart("div").openEnd();
								rm.openStart("a")
									.class("control-tree")
									.class("sapUiSupportLink")
									.attr("title", oContext.location.name)
									.attr("data-sap-ui-control-id", oContext.location.id)
									.attr("href", "#")
									.openEnd()
										.text(basename(oContext.location.name))
										.text(" (" + oContext.location.id + ")")
								.close("a")
							.close("div");
						rm.close("td");

						rm.close("tr");

					}

					rm.close("tbody").close("table").close("div").close("li");

				});

				rm.close("ul");

			}

			if (mBindingInfos.bindings.length > 0) {

				rm.openStart("h2").openEnd().text("Bindings").close("h2");

				rm.openStart("ul").class("sapUiSupportControlTreeList").attr("data-sap-ui-controlid", sControlId).openEnd();

				each(mBindingInfos.bindings, function(iBindingInfoIndex, oBindingInfo) {

					rm.openStart("li").attr("data-sap-ui-binding-name", oBindingInfo.name).openEnd();

					rm.openStart("span").openEnd();
						rm.openStart("label").class("sapUiSupportLabel").openEnd().text(oBindingInfo.name).close("label");
						rm.voidStart("img").class("sapUiSupportRefreshBinding").attr("title", "Refresh Binding").attr("src", "../../debug/images/refresh.gif").voidEnd();
					rm.close("span");

					each(oBindingInfo.bindings, function(iBindingIndex, oBinding) {

						rm.openStart("div").class("sapUiSupportControlProperties").openEnd();

						rm.openStart("table").openEnd()
							.openStart("colgroup").openEnd()
								.voidStart("col").attr("width", "15%").voidEnd()
								.voidStart("col").attr("width", "35%").voidEnd()
								.voidStart("col").attr("width", "50%").voidEnd()
							.close("colgroup");
						rm.openStart("tbody").openEnd();

						// Path
						rm.openStart("tr").openEnd();

							rm.openStart("td").attr("colspan", "2").openEnd();
							rm.openStart("label").class("sapUiSupportLabel").openEnd().text("Path").close("label");
							rm.close("td");

							rm.openStart("td").openEnd();

							rm.openStart("div").openEnd().openStart("span");

							if (oBinding.invalidPath) {
								rm.class("sapUiSupportModelPathInvalid");
							} else if (oBinding.unverifiedPath) {
								rm.class("sapUiSupportModelPathUnverified");
							}

							rm.openEnd().text(oBinding.path);

							if (oBinding.invalidPath) {
								rm.text(' (invalid)');
							} else if (oBinding.unverifiedPath) {
								rm.text(' (unverified)');
							}

							rm.close("span").close("div");

							rm.close("td");
						rm.close("tr");

						// Absolute-Path
						rm.openStart("tr").openEnd();
							rm.openStart("td").attr("colspan", "2").openEnd();
							rm.openStart("label").class("sapUiSupportLabel").openEnd().text("Absolute Path").close("label");
							rm.close("td");

							rm.openStart("td").openEnd();
							if (typeof oBinding.absolutePath !== 'undefined') {
								rm.openStart("div").openEnd().text(oBinding.absolutePath).close("div");
							} else {
								rm.openStart("div").openEnd().text("No binding").close("div");
							}
							rm.close("td");
						rm.close("tr");

						// Relative
						rm.openStart("tr").openEnd();
							rm.openStart("td").attr("colspan", "2").openEnd();
							rm.openStart("label").class("sapUiSupportLabel").openEnd().text("Relative").close("label");
							rm.close("td");

							rm.openStart("td").openEnd();
							if (typeof oBinding.isRelative !== 'undefined') {
								rm.openStart("div").openEnd().text(oBinding.isRelative).close("div");
							} else {
								rm.openStart("div").openEnd().text("No binding").close("div");
							}
							rm.close("td");
						rm.close("tr");

						// Binding-Type
						rm.openStart("tr").openEnd();
							rm.openStart("td").attr("colspan", "2").openEnd();
							rm.openStart("label").class("sapUiSupportLabel").openEnd().text("Binding Type").close("label");
							rm.close("td");

							rm.openStart("td").openEnd();
							if (!oBindingInfo.type) {
								rm.openStart("div").openEnd().text("No binding").close("div");
							} else {
								rm.openStart("div").attr("title", oBindingInfo.type).openEnd().text(basename(oBindingInfo.type)).close("div");
							}
							rm.close("td");
						rm.close("tr");

						// Binding-Mode
						if (oBinding.mode) {
							rm.openStart("tr").openEnd().openStart("td").attr("colspan", "2").openEnd();

							rm.openStart("label").class("sapUiSupportLabel").openEnd().text("Binding Mode").close("label");

							rm.close("td");
							rm.openStart("td").openEnd();

							rm.openStart("div").openEnd().text(oBindingInfo.mode).close("div");

							rm.close("td").close("tr");
						}

						// Model-Name
						rm.openStart("tr").openEnd();
							rm.openStart("td").openEnd();
							rm.openStart("label").class("sapUiSupportLabel").openEnd().text("Model").close("label");
							rm.close("td");

							rm.openStart("td").openEnd();
							rm.openStart("label").class("sapUiSupportLabel").openEnd().text("Name").close("label");
							rm.close("td");

							rm.openStart("td").openEnd();
							if (oBinding.model && oBinding.model.name) {
								rm.openStart("div").openEnd().text(oBinding.model.name).close("div");
							} else {
								rm.openStart("div").openEnd().text("No binding").close("div");
							}
							rm.close("td");
						rm.close("tr");

						// Model-Type
						rm.openStart("tr").openEnd();
							rm.openStart("td").openEnd().close("td");

							rm.openStart("td").openEnd();
							rm.openStart("label").class("sapUiSupportLabel").openEnd().text("Type").close("label");
							rm.close("td");

							rm.openStart("td").openEnd();
							if (oBinding.model && oBinding.model.type) {
								rm.openStart("div").openEnd().openStart("span").attr("title", oBinding.model.type).openEnd().text(basename(oBinding.model.type)).close("span").close("div");
							} else {
								rm.openStart("div").openEnd().openStart("span").openEnd().text("No binding").close("span").close("div");
							}
							rm.close("td");
						rm.close("tr");

						// Model-DefaultBindingMode
						rm.openStart("tr").openEnd();
							rm.openStart("td").openEnd().close("td");

							rm.openStart("td").openEnd();
							rm.openStart("label").class("sapUiSupportLabel").openEnd().text("Default Binding Mode").close("label");
							rm.close("td");

							rm.openStart("td").openEnd();
							if (oBinding.model && oBinding.model.bindingMode) {
								rm.openStart("div").openEnd().openStart("span").openEnd().text(oBinding.model.bindingMode).close("span").close("div");
							} else {
								rm.openStart("div").openEnd().openStart("span").openEnd().text("No binding").close("span").close("div");
							}
							rm.close("td");
						rm.close("tr");

						// Model-Location
						rm.openStart("tr").openEnd();
							rm.openStart("td").openEnd().close("td");

							rm.openStart("td").openEnd();
							rm.openStart("label").class("sapUiSupportLabel").openEnd().text("Location").close("label");
							rm.close("td");

							rm.openStart("td").openEnd();
							if (oBinding.model && oBinding.model.location && oBinding.model.location.type) {
								if (oBinding.model.location.type === 'control') {
									rm.openStart("div").openEnd();
									rm.openStart("a")
										.class("control-tree")
										.class("sapUiSupportLink")
										.attr("title", oBinding.model.location.name)
										.attr("data-sap-ui-control-id", oBinding.model.location.id)
										.attr("href", "#").openEnd()
											.text(basename(oBinding.model.location.name))
											.text(" (" + oBinding.model.location.id + ")")
										.close("a");
									rm.close("div");
								} else {
									rm.openStart("div").openEnd().openStart("span").attr("title", "sap.ui.getCore()").openEnd().text("Core").close("span").close("div");
								}
							} else {
								rm.openStart("div").openEnd().openStart("span").openEnd().text("No binding").close("span").close("div");
							}
							rm.close("td");
						rm.close("tr");

						rm.close("tbody").close("table").close("div");

					});

					rm.close("li");
				});

				rm.close("ul");

			}

			rm.flush(this.dom("#sapUiSupportControlPropertiesArea"));
			rm.destroy();
		};

		ControlTree.prototype.renderBreakpointsTab = function(aMethods, sControlId) {

			var rm = sap.ui.getCore().createRenderManager();

			rm.openStart("div").class("sapUiSupportControlMethods").attr("data-sap-ui-controlid", sControlId).openEnd();

			rm.openStart("select", "sapUiSupportControlMethodsSelect").class("sapUiSupportAutocomplete").class("sapUiSupportSelect").openEnd();
			rm.openStart("option").openEnd().close("option");

			each(aMethods, function(iIndex, oValue) {
				if (!oValue.active) {
					rm.openStart("option").openEnd().text("oValue.name").close("option");
				}
			});

			rm.close("select");

			rm.voidStart("input").class("sapUiSupportControlBreakpointInput").class("sapUiSupportAutocomplete").attr("type", "text").voidEnd();
			rm.openStart("button", "sapUiSupportControlAddBreakPoint").class("sapUiSupportRoundedButton").openEnd().text("Add breakpoint").close("button");
			rm.voidStart("hr").class("no-border").voidEnd();
			rm.openStart("ul", "sapUiSupportControlActiveBreakpoints").class("sapUiSupportList").class("sapUiSupportBreakpointList").openEnd();

			each(aMethods, function(iIndex, oValue) {
				if (!oValue.active) {
					return;
				}

				rm.openStart("li").openEnd()
					.openStart("span").openEnd().text(oValue.name).close("span")
					.voidStart("img").class("remove-breakpoint").attr("src", "../../debug/images/delete.gif").voidEnd()
					.close("li");
			});

			rm.close("ul").close("div");

			rm.flush(this.dom("#sapUiSupportControlPropertiesArea"));
			rm.destroy();

			this.selectTab(this._tab.breakpoints);

			this.dom('.sapUiSupportControlBreakpointInput').focus();
		};

		ControlTree.prototype.renderExportTab = function() {

			var rm = sap.ui.getCore().createRenderManager();

			rm.openStart("button", "sapUiSupportControlExportToXml").class("sapUiSupportRoundedButton").class("sapUiSupportExportButton").openEnd().text("Export To XML").close("button");
			rm.voidStart("br").voidEnd();
			rm.voidStart("br").voidEnd();
			rm.openStart("button", "sapUiSupportControlExportToHtml").class("sapUiSupportRoundedButton").class("sapUiSupportExportButton").openEnd().text("Export To HTML").close("button");

			rm.flush(this.dom("#sapUiSupportControlPropertiesArea"));
			rm.destroy();

			this.selectTab(this._tab.exports);
		};

		ControlTree.prototype.requestProperties = function(sControlId) {
			this._oStub.sendEvent(this._breakpointId + "RequestInstanceMethods", {
				controlId: sControlId,
				callback: this.getId() + "ReceivePropertiesMethods"
			});
		};

		ControlTree.prototype.updateBreakpointCount = function(sControlId, mBpCount) {

			var $breakpoints = $("#sap-debug-controltree-" + sControlId + " > div span.sapUiSupportControlTreeBreakpointCount");

			if (mBpCount.active > 0) {
				$breakpoints.text(mBpCount.active + " / " + mBpCount.all).toggleClass("sapUiSupportItemHidden", false);
			} else {
				$breakpoints.text("").toggleClass("sapUiSupportItemHidden", true);
			}
		};

		// -------------------------------
		// App-Side Event Handler
		// -------------------------------

		ControlTree.prototype.onsapUiSupportControlTreeTriggerRequestProperties = function(oEvent) {
			this.requestProperties(oEvent.getParameter("controlId"));
		};

		ControlTree.prototype.onsapUiSupportControlTreeReceivePropertiesMethods = function(oEvent) {

			var sControlId = oEvent.getParameter("controlId");

			this._oStub.sendEvent(this.getId() + "RequestProperties", {
				id: sControlId,
				breakpointMethods: oEvent.getParameter("methods")
			});

			this.updateBreakpointCount(sControlId, JSON.parse(oEvent.getParameter("breakpointCount")));
		};

		ControlTree.prototype.onsapUiSupportControlTreeReceiveControlTree = function(oEvent) {
			this.renderControlTree(JSON.parse(oEvent.getParameter("controlTree")));
		};

		ControlTree.prototype.onsapUiSupportControlTreeReceiveControlTreeExportError = function(oEvent) {
			var sErrorMessage = oEvent.getParameter("errorMessage");
			this._drawAlert(sErrorMessage);
		};

		ControlTree.prototype._drawAlert = function(sErrorMessage) {
			/*eslint-disable no-alert */
			alert("ERROR: The selected element cannot not be exported.\nPlease choose an other one.\n\nReason:\n" + sErrorMessage);
			/*eslint-enable no-alert */
		};

		ControlTree.prototype.onsapUiSupportControlTreeReceiveControlTreeExport = function(oEvent) {
			var zip;
			var mViews = JSON.parse(oEvent.getParameter("serializedViews"));
			var sType = oEvent.getParameter("sType");

			if (!isEmptyObject(mViews)) {
				zip = new JSZip();
				for (var oViewName in mViews) {
					var data = mViews[oViewName];
					zip.file(oViewName.replace(/\./g, '/') + ".view." + sType.toLowerCase() , data);
				}
			}

			if (zip) {
				var oContent = zip.generate({
					type: "blob"
				});

				File.save(oContent, sType.toUpperCase() + "Export", "zip", "application/zip");
			}
		};

		ControlTree.prototype.onsapUiSupportSelectorSelect = function(oEvent) {
			this.selectControl(oEvent.getParameter("id"));
		};

		ControlTree.prototype.onsapUiSupportControlTreeReceiveProperties = function(oEvent) {
			this.renderPropertiesTab(JSON.parse(oEvent.getParameter("properties")), oEvent.getParameter("id"));
		};

		ControlTree.prototype.onsapUiSupportControlTreeReceiveBindingInfos = function(oEvent) {
			this.renderBindingsTab(JSON.parse(oEvent.getParameter("bindinginfos")), oEvent.getParameter("id"));
		};

		ControlTree.prototype.onsapUiSupportControlTreeReceiveMethods = function(oEvent) {

			var sControlId = oEvent.getParameter("controlId");

			this.renderBreakpointsTab(JSON.parse(oEvent.getParameter("methods")), sControlId);
			this.updateBreakpointCount(sControlId, JSON.parse(oEvent.getParameter("breakpointCount")));
		};

		// -------------------------------
		// DOM Event Handler
		// -------------------------------

		ControlTree.prototype._onNodeClick = function(oEvent) {
			var $span = $(oEvent.target);
			var $li = $span.closest("li");
			if ($li.hasClass("sapUiControlTreeElement")) {
				$(".sapUiControlTreeElement > div").removeClass("sapUiSupportControlTreeSelected");
				$li.children("div").addClass("sapUiSupportControlTreeSelected");
				this._oStub.sendEvent("sapUiSupportSelectorHighlight", {id: $li.attr("id").substring("sap-debug-controltree-".length)});

				var sId = $li.attr("id").substring("sap-debug-controltree-".length);

				if ($span.hasClass("sapUiSupportControlTreeBreakpointCount")) {
					this._currentTab = this._tab.breakpoints;
				}

				this.onAfterControlSelected(sId);
			}

			oEvent.stopPropagation();
		};

		ControlTree.prototype._onIconClick = function(oEvent) {
			var $source = $(oEvent.target);
			if ($source.parent().attr("data-sap-ui-collapsed")) {
				$source.attr("src", $source.attr("src").replace("plus", "minus")).parent().removeAttr("data-sap-ui-collapsed");
				$source.siblings("ul").toggleClass("sapUiSupportItemHidden", false);
			} else {
				$source.attr("src", $source.attr("src").replace("minus", "plus")).parent().attr("data-sap-ui-collapsed", "true");
				$source.siblings("ul").toggleClass("sapUiSupportItemHidden", true);
			}
			if (oEvent.stopPropagation) {
				oEvent.stopPropagation();
			}
		};

		ControlTree.prototype._onControlTreeLinkClick = function(oEvent) {
			this.selectControl($(oEvent.target).closest("li").attr("data-sap-ui-controlid"));
		};

		ControlTree.prototype._onPropertiesTab = function(oEvent) {
			if (this.selectTab(this._tab.properties)) {
				this.requestProperties(this.getSelectedControlId());
			}
		};

		ControlTree.prototype._onBindingInfosTab = function(oEvent) {
			if (this.selectTab(this._tab.bindinginfos)) {
				this._oStub.sendEvent(this.getId() + "RequestBindingInfos", {
					id: this.getSelectedControlId()
				});
			}
		};

		ControlTree.prototype._onMethodsTab = function(oEvent) {
			if (this.selectTab(this._tab.breakpoints)) {
				this._oStub.sendEvent(this._breakpointId + "RequestInstanceMethods", {
					controlId: this.getSelectedControlId(),
					callback: this.getId() + "ReceiveMethods"
				});
			}
		};

		ControlTree.prototype._onExportTab = function(oEvent) {
			if (this.selectTab(this._tab.exports)) {
				this.renderExportTab();
	//			this.renderControlTree(JSON.parse(oEvent.getParameter("controlTree")));
			}
		};

		ControlTree.prototype._autoComplete = function(oEvent) {

			if (oEvent.keyCode == KeyCodes.ENTER) {
				this._updateSelectOptions(oEvent);
				this._onAddBreakpointClicked();
			}

			if (oEvent.keyCode >= KeyCodes.ARROW_LEFT && oEvent.keyCode <= KeyCodes.ARROW_DOWN) {
				return;
			}

			var $input = $(oEvent.target),
				$select = $input.prev("select"),
				sInputVal = $input.val();

			if (sInputVal == "") {
				return;
			}

			var aOptions = $select.find("option").map(function() {
				return $(this).val();
			}).get();

			var sOption;

			for (var i = 0; i < aOptions.length; i++) {
				sOption = aOptions[i];

				if (sOption.toUpperCase().indexOf(sInputVal.toUpperCase()) == 0) {

					var iCurrentStart = $input.cursorPos();

					if (oEvent.keyCode == KeyCodes.BACKSPACE) {
						iCurrentStart--;
					}

					$input.val(sOption);
					$input.selectText(iCurrentStart, sOption.length);

					break;
				}
			}

			return;
		};

		ControlTree.prototype._updateSelectOptions = function(oEvent) {

			var oSelect = oEvent.target;

			if (oSelect.tagName == "INPUT") {
				var sValue = oSelect.value;
				oSelect = oSelect.previousSibling;
				var aOptions = oSelect.options;
				for (var i = 0;i < aOptions.length;i++) {
					var sText = aOptions[i].value || aOptions[i].text;
					if (sText.toUpperCase() == sValue.toUpperCase()) {
						oSelect.selectedIndex = i;
						break;
					}
				}
			}

			var selIndex = oSelect.selectedIndex;
			var sClassName = oSelect.options[selIndex].value || oSelect.options[selIndex].text;

			if (oSelect.nextSibling && oSelect.nextSibling.tagName == "INPUT") {
				oSelect.nextSibling.value = sClassName;
			}

		};

		ControlTree.prototype._onAddBreakpointClicked = function (oEvent) {

			var oSelect = this.dom("#sapUiSupportControlMethodsSelect");

			this._oStub.sendEvent(this._breakpointId + "ChangeInstanceBreakpoint", {
				controlId: oSelect.closest("[data-sap-ui-controlid]").dataset.sapUiControlid,
				methodName: oSelect.value,
				active: true,
				callback: this.getId() + "ReceiveMethods"
			});

		};

		ControlTree.prototype._onExportToXmlClicked = function (oEvent) {
			this._startSerializing("XML");
		};

		ControlTree.prototype._onExportToHtmlClicked = function (oEvent) {
			this._startSerializing("HTML");
		};

		ControlTree.prototype._startSerializing = function (sTypeValue) {
			var sSelectedId = this.getSelectedControlId();
			if (sSelectedId) {
				this._oStub.sendEvent(this.getId() + "RequestControlTreeSerialize", { controlID: sSelectedId, sType: sTypeValue });
			} else {
				this._drawAlert("Nothing to export. Please select an item in the control tree.");
			}
		};


		ControlTree.prototype._onRemoveBreakpointClicked = function (oEvent) {

			var $img = $(oEvent.target);

			this._oStub.sendEvent(this._breakpointId + "ChangeInstanceBreakpoint", {
				controlId: $img.closest("[data-sap-ui-controlid]").attr("data-sap-ui-controlid"),
				methodName: $img.siblings('span').text(),
				active: false,
				callback: this.getId() + "ReceiveMethods"
			});
		};

		ControlTree.prototype._selectOptionsChanged = function (oEvent) {

			var oSelect = oEvent.target;

			var oInput = oSelect.nextSibling;

			oInput.value = oSelect.options[oSelect.selectedIndex].value;
		};

		ControlTree.prototype._onPropertyChange = function(oEvent) {
			var oSource = oEvent.target;
			var $input = $(oSource);
			var sId = $input.closest("[data-sap-ui-controlid]").attr("data-sap-ui-controlid");
			var sValue = $input.val();
			if ($input.attr("type") === "checkbox") {
				sValue = "" + $input.is(":checked");
			}

			this._oStub.sendEvent(this.getId() + "ChangeProperty", {id: sId, name: $input.attr("data-sap-ui-name"), value: sValue });
		};

		ControlTree.prototype._onPropertyBreakpointChange = function(oEvent) {

			var $checkbox = $(oEvent.target);

			this._oStub.sendEvent(this._breakpointId + "ChangeInstanceBreakpoint", {
				controlId: $checkbox.closest("[data-sap-ui-controlid]").attr("data-sap-ui-controlid"),
				methodName: $checkbox.attr("data-sap-ui-method"),
				active: $checkbox.is(":checked"),
				callback: this.getId() + "TriggerRequestProperties"
			});
		};

		ControlTree.prototype._onNavToControl = function(oEvent) {
			var $link = $(oEvent.target);
			var sId = $link.attr("data-sap-ui-control-id");

			if (sId !== this.getSelectedControlId()) {
				this.selectControl(sId);
			}
		};

		ControlTree.prototype._onRefreshBinding = function(oEvent) {

			var $img = $(oEvent.target);

			var sId = $img.closest("[data-sap-ui-controlid]").attr("data-sap-ui-controlid");

			var sName = $img.closest("[data-sap-ui-binding-name]").attr("data-sap-ui-binding-name");

			this._oStub.sendEvent(this.getId() + "RefreshBinding", {
				id: sId,
				name: sName
			});
		};

		ControlTree.prototype.selectTab = function(sTab) {

			var oButton = this.dom("#sapUiSupportControlTab" + sTab);

			if (oButton.classList.contains("active")) {
				return false;
			}

			this.$().find("#sapUiSupportControlTabs button").removeClass("active");
			oButton.classList.add("active");

			this._currentTab = sTab;

			return true;
		};

		ControlTree.prototype.getSelectedControlId = function() {
			var $sret = this.$().find(".sapUiSupportControlTreeSelected");
			if ($sret.length === 0) {
				return undefined;
			} else {
				return $sret.parent().attr("id").substring("sap-debug-controltree-".length);
			}
		};

		ControlTree.prototype.selectControl = function(sControlId) {

			if (!sControlId) {
				return;
			}

			$(".sapUiControlTreeElement > div").removeClass("sapUiSupportControlTreeSelected");
			var that = this;
			$(document.getElementById("sap-debug-controltree-" + sControlId)).parents("[data-sap-ui-collapsed]").each(function(iIndex, oValue) {
				that._onIconClick({ target: $(oValue).find("img:first").get(0) });
			});
			var oPosition = $(document.getElementById("sap-debug-controltree-" + sControlId)).children("div").addClass("sapUiSupportControlTreeSelected").position();
			var iScrollTop = this.$().find("#sapUiSupportControlTreeArea").scrollTop();
			this.$().find("#sapUiSupportControlTreeArea").scrollTop(iScrollTop + oPosition.top);

			this.onAfterControlSelected(sControlId);
		};

		ControlTree.prototype.onAfterControlSelected = function(sId) {
			if (this._currentTab == this._tab.properties) {
				this.requestProperties(sId);
			} else if (this._currentTab == this._tab.breakpoints) {
				this._oStub.sendEvent(this._breakpointId + "RequestInstanceMethods", {
					controlId: sId,
					callback: this.getId() + "ReceiveMethods"
				});
			} else if (this._currentTab == this._tab.bindinginfos) {
				this._oStub.sendEvent(this.getId() + "RequestBindingInfos", {
					id: this.getSelectedControlId()
				});
			}
		};

		//=================================================================================================
		//=================================================================================================
		// APP SIDE
		//=================================================================================================
		//=================================================================================================

		function initInApps(oSupportStub) {
			this.onsapUiSupportControlTreeRequestControlTree();
		}

		ControlTree.prototype.onsapUiSupportControlTreeRequestControlTree = function(oEvent) {
			this._oStub.sendEvent(this.getId() + "ReceiveControlTree", { controlTree: JSON.stringify(this.getControlTree()) });
		};

		ControlTree.prototype.onsapUiSupportControlTreeRequestControlTreeSerialize = function(oEvent) {
			var oControl = this.oCore.byId(oEvent.getParameter("controlID"));
			var sType = oEvent.getParameter("sType");

			var oViewSerializer;
			var mViews;
			var sViewName = sType + "ViewExported";

			XMLView.create({
				definition: document
			}).then(function (oView) {
				oView.setViewName(sViewName);
				oView._controllerName = sType + "ViewController";

				try {
					if (oControl) {
						if (oControl instanceof View) {
							oViewSerializer = new ViewSerializer(oControl, window, "sap.m");
						} else {
							oView.addContent(oControl.clone());
							oViewSerializer = new ViewSerializer(oView, window, "sap.m");
						}
						// By now just XML and HTML can be serialized
						mViews = (sType && sType !== "XML") ? oViewSerializer.serializeToHTML() : oViewSerializer.serializeToXML();
					} else {
						var oUIArea = this.oCore.getUIArea(oEvent.getParameter("controlID"));
						var aContent = oUIArea.getContent();
						for ( var i = 0; i < aContent.length; i++) {
							oView.addContent(aContent[i]);
						}
						oViewSerializer = new ViewSerializer(oView, window, "sap.m");
						// By now just XML and HTML can be serialized
						mViews = (sType && sType !== "XML") ? oViewSerializer.serializeToHTML() : oViewSerializer.serializeToXML();
						for ( var i = 0; i < aContent.length; i++) {
							oUIArea.addContent(aContent[i]);
						}
					}

					if (oViewSerializer) {
						this._oStub.sendEvent(this.getId() + "ReceiveControlTreeExport", { serializedViews: JSON.stringify(mViews), sType: sType });
					}
				} catch (err) {
					this._oStub.sendEvent(this.getId() + "ReceiveControlTreeExportError", { errorMessage: err.message });
				}

			}.bind(this));
		};

		ControlTree.prototype.onsapUiSupportControlTreeRequestProperties = function(oEvent) {

			var breakpointMethods = JSON.parse(oEvent.getParameter("breakpointMethods"));
			var aControlProps = this.getControlProperties(oEvent.getParameter("id"), breakpointMethods);

			this._oStub.sendEvent(this.getId() + "ReceiveProperties", {
				id: oEvent.getParameter("id"),
				properties: JSON.stringify(aControlProps)
			});
		};

		ControlTree.prototype.onsapUiSupportControlTreeChangeProperty = function(oEvent) {

			var sId = oEvent.getParameter("id");
			var oControl = this.oCore.byId(sId);

			if (oControl) {

				var sName = oEvent.getParameter("name");
				var sValue = oEvent.getParameter("value");

				var oProperty = oControl.getMetadata().getProperty(sName);

				if (oProperty && oProperty.type) {

					var oType = DataType.getType(oProperty.type);
					if (oType instanceof DataType) {

						// DATATYPE

						var vValue = oType.parseValue(sValue);
						if (oType.isValid(vValue) && vValue !== "(null)" ) {
							oControl[oProperty._sMutator](vValue);
						}

					} else if (oType) {

						// ENUM

						if (oType[sValue]) {
							oControl[oProperty._sMutator](sValue);
						}

					}

				}

			}

		};

		ControlTree.prototype.onsapUiSupportControlTreeRequestBindingInfos = function(oEvent) {

			var sId = oEvent.getParameter("id");

			this._oStub.sendEvent(this.getId() + "ReceiveBindingInfos", {
				id: sId,
				bindinginfos: JSON.stringify(this.getControlBindingInfos(sId))
			});
		};

		ControlTree.prototype.onsapUiSupportControlTreeRefreshBinding = function(oEvent) {

			var sId = oEvent.getParameter("id");
			var sBindingName = oEvent.getParameter("name");

			this.refreshBinding(sId, sBindingName);

			this._oStub.sendEvent(this.getId() + "ReceiveBindingInfos", {
				id: sId,
				bindinginfos: JSON.stringify(this.getControlBindingInfos(sId))
			});
		};

		// -------------------------------
		// Private Methods
		// -------------------------------

		ControlTree.prototype.getControlTree = function() {

			var oCore = this.oCore,
				aControlTree = [],
				mAllElements = {};

			function serializeElement(oElement) {
				var mElement = {id: oElement.getId(), type: "", aggregation: [], association: []};
				mAllElements[mElement.id] = mElement.id;
				if (oElement instanceof UIArea) {
					mElement.library = "sap.ui.core";
					mElement.type = "sap.ui.core.UIArea";
					each(oElement.getContent(), function(iIndex, oElement) {
						var mChild = serializeElement(oElement);
						mElement.aggregation.push(mChild);
					});
				} else {
					mElement.library = oElement.getMetadata().getLibraryName();
					mElement.type = oElement.getMetadata().getName();
					if (oElement.mAggregations) {
						/*eslint-disable no-loop-func */
						for (var sAggrName in oElement.mAggregations) {
							var oAggrElement = oElement.mAggregations[sAggrName];
							if (oAggrElement) {
								var aElements = Array.isArray(oAggrElement) ? oAggrElement : [oAggrElement];
								each(aElements, function(iIndex, oValue) {
									// tooltips are also part of aggregations
									if (oValue instanceof Element) {
										var mChild = serializeElement(oValue);
										mElement.aggregation.push(mChild);
									}
								});
							}
						}
						/*eslint-enable no-loop-func */
					}
					if (oElement.mAssociations) {
						var mAssocMetadata = oElement.getMetadata().getAllAssociations();
						/*eslint-disable no-loop-func */
						for (var sAssocName in oElement.mAssociations) {
							var sAssocId = oElement.mAssociations[sAssocName];
							var sAssocType = (mAssocMetadata[sAssocName]) ? mAssocMetadata[sAssocName].type : null;
							if (sAssocId && sAssocType) {
								var aAssocIds = Array.isArray(sAssocId) ? sAssocId : [sAssocId];
								each(aAssocIds, function(iIndex, oValue) {
									mElement.association.push({ id: oValue, type: sAssocType, name: sAssocName, isAssociationLink: true });
								});
							}
						}
						/*eslint-enable no-loop-func */
					}
				}
				return mElement;
			}

			each(oCore.mUIAreas, function(iIndex, oUIArea) {
				var mElement = serializeElement(oUIArea);
				aControlTree.push(mElement);
			});

			function serializeAssociations(iIndex, mElement) {
				/*eslint-disable no-loop-func */
				for (var i = 0; i < mElement.association.length; i++) {
					var mAssoc = mElement.association[i];

					if (!mAllElements[mAssoc.id]) {

						var oType = ObjectPath.get(mAssoc.type || "");

						if (!(typeof oType === "function")) {
							continue;
						}

						var sStereotype = oType.getMetadata().getStereotype(),
							oObj = null;

						switch (sStereotype) {
						case "element":
						case "control":
							oObj = oCore.byId(mAssoc.id);
							break;
						case "component":
							oObj = Component.get(mAssoc.id);
							break;
						case "template":
							oObj = Template.byId(mAssoc.id);
							break;
						default:
							break;
						}

						if (!oObj) {
							continue;
						}

						mElement.association[i] = serializeElement(oObj);
						mElement.association[i].isAssociation = true;
						serializeAssociations(0, mElement.association[i]);
					}

				}
				/*eslint-enable no-loop-func */

				each(mElement.aggregation, serializeAssociations);
			}

			each(aControlTree, serializeAssociations);

			return aControlTree;
		};

		ControlTree.prototype.getControlProperties = function(sId, mMethods) {

			var pSimpleType = /^((boolean|string|int|float)(\[\])?)$/;

			var aControlProps = [];

			var oControl = this.oCore.byId(sId);

			if (!oControl && this.oCore.getUIArea(sId)) {

				aControlProps.push({
					control: "sap.ui.core.UIArea",
					properties: [],
					aggregations: []
				});

			} else if (oControl) {

				var oMetadata = oControl.getMetadata();

				/*eslint-disable no-loop-func */
				while (oMetadata instanceof ElementMetadata) {

					var mControlProp = {
						control: oMetadata.getName(),
						properties: [],
						aggregations: []
					};

					var mProperties = oMetadata.getProperties();
					each(mProperties, function(sKey, oProperty) {
						var mProperty = {};
						each(oProperty, function(sName, sValue) {

							if (sName.substring(0, 1) !== "_" || (sName == '_sGetter' || sName == '_sMutator')) {
								mProperty[sName] = sValue;
							}

							if (sName == '_sGetter' || sName == '_sMutator') {
								mProperty["bp" + sName] = mMethods.filter(function(o) {
									return o.name === sValue && o.active;
								}).length === 1;
							}

							var oType = DataType.getType(oProperty.type);
							if (oType && oType.isEnumType()) {
								mProperty["enumValues"] = oType.getEnumValues();
							}
						});
						mProperty.value = oControl.getProperty(sKey);

						mProperty.isBound = !!oControl.mBindingInfos[sKey];

						mControlProp.properties.push(mProperty);
					});

					var mAggregations = oMetadata.getAggregations();
					each(mAggregations, function(sKey, oAggregation) {
						if (oAggregation.altTypes && oAggregation.altTypes[0] && pSimpleType.test(oAggregation.altTypes[0]) && typeof (oControl.getAggregation(sKey)) !== 'object') {
							var mAggregation = {};
							each(oAggregation, function(sName, sValue) {

								if (sName.substring(0, 1) !== "_" || (sName == '_sGetter' || sName == '_sMutator')) {
									mAggregation[sName] = sValue;
								}

								if (sName == '_sGetter' || sName == '_sMutator') {
									mAggregation["bp" + sName] = mMethods.filter(function(o) {
										return o.name === sValue && o.active;
									}).length === 1;
								}

							});
							mAggregation.value = oControl.getAggregation(sKey);
							mControlProp.aggregations.push(mAggregation);
						}
					});

					aControlProps.push(mControlProp);

					oMetadata = oMetadata.getParent();
				}
				/*eslint-enable no-loop-func */

			}

			return aControlProps;
		};

		ControlTree.prototype.getControlBindingInfos = function(sId) {

			var mControlBindingInfos = {
				bindings: [],
				contexts: []
			};

			var oControl = this.oCore.byId(sId);

			if (!oControl) {
				return mControlBindingInfos;
			}

			var mBindingInfos = oControl.mBindingInfos;

			var that = this;

			/*eslint-disable no-loop-func */
			for (var bindingName in mBindingInfos) {
				if (mBindingInfos.hasOwnProperty(bindingName)) {

					var mBindingInfo = mBindingInfos[bindingName];
					var aBindings = [];
					var aBindingInfoBuffer, aBindingBuffer = [];

					if (Array.isArray(mBindingInfo.parts)) {
						aBindingInfoBuffer = mBindingInfo.parts;
					} else {
						aBindingInfoBuffer = [ mBindingInfo ];
					}

					if (mBindingInfo.binding instanceof CompositeBinding) {
						aBindingBuffer = mBindingInfo.binding.getBindings();
					} else if (mBindingInfo.binding instanceof Binding) {
						aBindingBuffer = [ mBindingInfo.binding ];
					}

					each(aBindingInfoBuffer, function(iIndex, oInfo) {

						var mData = {};

						mData.invalidPath = true;
						mData.path = oInfo.path;
						mData.mode = oInfo.mode;
						mData.model = {
							name: oInfo.model
						};

						if (aBindingBuffer.length > iIndex && aBindingBuffer[iIndex]) {

							var oBinding = aBindingBuffer[iIndex],
								oModel = oBinding.getModel(),
								sPath = oBinding.getPath(),
								sAbsolutePath;

							if (oModel) {
								sAbsolutePath = oModel.resolve(sPath, oBinding.getContext());

								if (oModel.isA("sap.ui.model.odata.v4.ODataModel")) { // ODataModel v4 throws an exception on getProperty()
									mData.unverifiedPath = true;
									mData.invalidPath = false; // otherwise path is shown as invalid
								} else {
									if (oModel.getProperty(sAbsolutePath) !== undefined && oModel.getProperty(sAbsolutePath) !== null) {
										mData.invalidPath = false;
									} else if (oModel.getProperty(sPath) !== undefined && oModel.getProperty(sPath) !== null) {
										mData.invalidPath = false;
										sAbsolutePath = sPath;
									}
								}
							}

							mData.absolutePath = (typeof (sAbsolutePath) === 'undefined') ? 'Unresolvable' : sAbsolutePath;
							mData.isRelative = oBinding.isRelative();
							mData.model = that.getBindingModelInfo(oBinding, oControl);
						}

						aBindings.push(mData);
					});

					mControlBindingInfos.bindings.push({
						name: bindingName,
						type: (mBindingInfo.binding) ? mBindingInfo.binding.getMetadata().getName() : undefined,
						bindings: aBindings
					});
				}
			}
			/*eslint-enable no-loop-func */

			function getContextInfos(oContext, sModelName) {
				var mContextInfos = {
					modelName: (sModelName === 'undefined') ? 'none (default)' : sModelName,
					path: oContext.getPath()
				};

				if (oContext.getModel().isA("sap.ui.model.odata.v4.ODataModel")) { // ODataModel v4 throws an exception on getObject()
					mContextInfos.unverifiedPath = true;
				} else {
					if (!oContext.getObject() == null) {
						mContextInfos.invalidPath = true;
					}
				}

				return mContextInfos;
			}

			var mContexts = oControl.oBindingContexts;

			for (var modelName in mContexts) {
				if (mContexts.hasOwnProperty(modelName)) {
					mControlBindingInfos.contexts.push(getContextInfos(mContexts[modelName], modelName));
				}
			}

			var mContexts = oControl.oPropagatedProperties.oBindingContexts;

			for (var modelName in mContexts) {
				if (mContexts.hasOwnProperty(modelName) && !oControl.oBindingContexts[modelName]) {

					var mContext = getContextInfos(mContexts[modelName], modelName);

					var oCurrentControl = oControl;

					do {
						if (oCurrentControl.oBindingContexts[modelName] == mContexts[modelName]) {
							mContext.location = {
								id: oCurrentControl.getId(),
								name: oCurrentControl.getMetadata().getName()
							};
							break;
						}
					} while ( (oCurrentControl = oCurrentControl.getParent()) );

					mControlBindingInfos.contexts.push(mContext);
				}
			}

			return mControlBindingInfos;
		};

		ControlTree.prototype.getBindingModelInfo = function(oBinding, oControl) {

			var mModelInfo = {};

			var oBindingModel = oBinding.getModel();

			function getModelName(oModels) {
				for (var sModelName in oModels) {
					if (oModels.hasOwnProperty(sModelName)) {
						if (oModels[sModelName] === oBindingModel) {
							return sModelName;
						}
					}
				}

				return null;
			}

			mModelInfo.name = getModelName(oControl.oModels) || getModelName(oControl.oPropagatedProperties.oModels);

			if (mModelInfo.name) {

				var oCurrentControl = oControl;

				// check for the model on control level (including all parents)
				do {
					if (oCurrentControl.oModels[mModelInfo.name] === oBindingModel) {
						mModelInfo.location = {
							type: 'control',
							id: oCurrentControl.getId(),
							name: oCurrentControl.getMetadata().getName()
						};
						break;
					}
				} while ( (oCurrentControl = oCurrentControl.getParent()) );

				// check for core model if no model was found
				if (!mModelInfo.location) {

					var oCoreModel = null;

					if (mModelInfo.name === 'undefined') {
						oCoreModel = this.oCore.getModel();
					} else {
						oCoreModel = this.oCore.getModel(mModelInfo.name);
					}

					if (oCoreModel) {
						mModelInfo.location = {
							type: 'core'
						};
					}
				}

			}

			// Get Model Type (JSON, XML, OData)
			mModelInfo.type = oBindingModel.getMetadata().getName();

			mModelInfo.bindingMode = oBindingModel.getDefaultBindingMode();

			// Default Model (undefined)
			mModelInfo.name = (mModelInfo.name === 'undefined') ? 'none (default)' : mModelInfo.name;

			return mModelInfo;
		};

		ControlTree.prototype.refreshBinding = function(sId, sBindingName) {

			var oControl = this.oCore.byId(sId);
			var mBindingInfo = oControl.mBindingInfos[sBindingName];

			if (!oControl || !mBindingInfo) {
				return;
			}

			var oBinding = mBindingInfo.binding;

			if (!oBinding) {
				return;
			}

			if (oBinding instanceof CompositeBinding) {

				var aBindings = oBinding.getBindings();

				for ( var i = 0; i < aBindings.length; i++) {
					aBindings[i].refresh();
				}

			} else {
				oBinding.refresh();
			}
		};




	return ControlTree;

});