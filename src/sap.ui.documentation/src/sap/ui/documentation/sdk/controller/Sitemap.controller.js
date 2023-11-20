/*!
 * ${copyright}
 */

sap.ui.define([
	"./BaseController",
	"sap/ui/documentation/sdk/controller/util/APIInfo",
	"sap/ui/documentation/sdk/controller/util/DocuInfo",
	"sap/ui/model/json/JSONModel",
	"sap/ui/documentation/sdk/controller/util/ControlsInfo",
	"sap/ui/documentation/sdk/controller/util/ToolsInfo",
	'sap/ui/documentation/sdk/model/libraryData'
], function (
	BaseController,
	APIInfo,
	DocuInfo,
	JSONModel,
	ControlsInfo,
	ToolsInfo,
	libraryData
) {
	"use strict";

	var RESOURCES_TYPES = {
		API: "api",
		TOPIC: "topic",
		TOOLS: "tools",
		ENTITY: "entity",
		DEMO_APPS: "demoApps"
	};

	// Parsers are used to unify the different node structures
	var parsers = {};

	parsers[RESOURCES_TYPES.API] = {
		getData: APIInfo.getIndexJsonPromise,
		formatNode: function (oNode) {
			return {
				name: oNode.name,
				href: RESOURCES_TYPES.API + "/" + oNode.name,
				hidden: oNode.visibility !== "public"
			};
		}
	};

	parsers[RESOURCES_TYPES.TOPIC] = {
		getData: function (oConfig) {
			return DocuInfo.getDocuIndexPromise(oConfig);
		},
		formatNode: function (oNode) {
			return {
				name: oNode.text,
				href: RESOURCES_TYPES.TOPIC + "/" + oNode.key
			};
		}
	};

	parsers[RESOURCES_TYPES.ENTITY] = {
		getData: ControlsInfo.loadData,
		formatNode: function (oNode) {
			return {
				name: oNode.id,
				href: RESOURCES_TYPES.ENTITY + "/" + oNode.id
			};
		}
	};

	parsers[RESOURCES_TYPES.DEMO_APPS] = {
		getData: libraryData.getDemoAppsData,
		formatNode: function (oNode) {
			return {
				name: oNode.name,
				href: oNode.ref
			};
		}
	};

	parsers[RESOURCES_TYPES.TOOLS] = {
		getData: ToolsInfo.getToolsConfig,
		formatNode: function (oNode) {
			return {
				name: oNode.text,
				href: oNode.href,
				hidden: !oNode.href
			};
		}
	};

	/**
	 * Unifies nodes data to be easily used in view
	 * @private
	 */
	function formatNodes(aNodes, sType) {
		var newNodes = [],
			oNode,
			oFormattedNode;

		for (var index = 0; index < aNodes.length; index++) {
			oNode = aNodes[index];

			oFormattedNode = parsers[sType].formatNode(oNode);

			if (oFormattedNode.hidden !== true) {
				newNodes.push(oFormattedNode);
			}
		}

		return newNodes;
	}

	return BaseController.extend("sap.ui.documentation.sdk.controller.Sitemap", {

		onInit: function () {
			this.oPage = this.byId("sitemapPage");

			this.oModel = new JSONModel();
			this.getView().setModel(this.oModel);

			this._oData = {};
			this.getRouter().getRoute("sitemap").attachPatternMatched(this._onMatched, this);
		},

		/**
		 * Handles route matched:
		 * 1) hides the master part of SplitApp
		 * @private
		 */
		_onMatched: function () {
			this.hideMasterSide();

			this.oPage.setBusy(true);
			this._loadResources()
				.then(function () {
					this.oPage.setBusy(false);
					this.oModel.setData(this._oData);
				}.bind(this))
				.catch(function () {
					this.onRouteNotFound();
				}.bind(this));
			this.appendPageTitle(this.getModel("i18n").getProperty("SITEMAP_TITLE"));
		},

		/**
		 * Loads needed data
		 * @private
		 */
		_loadResources: function () {
			var aPromises = Object.keys(RESOURCES_TYPES).map(function (sKey) {
				var sType = RESOURCES_TYPES[sKey];
				return parsers[sType].getData(this.getConfig())
					.then(function (oData) {
						this._onDataLoaded({ data: oData, type: sType });
					}.bind(this));
			}, this);

			return Promise.all(aPromises);
		},

		/**
		 * Populates the data
		 * @private
		 */
		_onDataLoaded: function (oParams) {
			switch (oParams.type) {
				case RESOURCES_TYPES.API:
					this._onApiRefData(oParams.data);
					break;
				case RESOURCES_TYPES.TOPIC:
					this._onTopicsData(oParams.data);
					break;
				case RESOURCES_TYPES.ENTITY:
					this._onSamplesData(oParams.data);
					break;
				case RESOURCES_TYPES.DEMO_APPS:
					this._onDemoAppsData(oParams.data);
					break;
				case RESOURCES_TYPES.TOOLS:
					this._onToolsData(oParams.data);
					break;
			}
		},

		/**
		 * Provides the dev guide topics data
		 * @private
		 */
		_getDocuIndexPromise: function () {
			return DocuInfo.getDocuIndexPromise(this.getConfig());
		},


		/**
		 * Populates the API Reference data
		 * @private
		 */
		_onApiRefData: function (oResult) {
			var sType = RESOURCES_TYPES.API,
				aPublicEntities;

			// api reference entries has data which should be excluded
			aPublicEntities = oResult.reduce(function (accumulator, oEntry) {
				if (oEntry.visibility === "public" && oEntry.nodes) {
					return accumulator.concat(formatNodes(oEntry.nodes, sType));
				}
				return accumulator;
			}, []);


			this._oData[sType] = aPublicEntities;
		},

		/**
		 * Populates the Documentation data
		 * @private
		 */
		_onTopicsData: function (oResult) {
			var sType = RESOURCES_TYPES.TOPIC;

			this._oData[sType] = formatNodes(oResult, sType);
		},

		/**
		 * Populates the Samples data
		 * @private
		 */
		_onSamplesData: function (oResult) {
			var sType = RESOURCES_TYPES.ENTITY;

			this._oData[sType] = formatNodes(oResult.entities, sType);
		},

		/**
		 * Populates Demo Apps data
		 * @private
		 */
		_onDemoAppsData: function (oResult) {
			var sType = RESOURCES_TYPES.DEMO_APPS;

			this._oData[sType] = formatNodes(oResult.demoApps, sType);
		},


		/**
		 * Populates the Tools data
		 * @private
		 */
		_onToolsData: function (oResult) {
			var sType = RESOURCES_TYPES.TOOLS;

			this._oData[sType] = formatNodes(oResult, sType);
		},

		/**
		 * Handler for page navButton press event
		 * @restricted
		 */
		onNavButtonPress: function () {
			this.getRouter().myNavBack("welcome");
		}

	});
});