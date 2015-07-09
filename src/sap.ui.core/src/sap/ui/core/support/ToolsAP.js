/*!
 * ${copyright}
 */

sap.ui.define(['jquery.sap.global', 'sap/ui/core/library', 'sap/ui/Global', 'sap/ui/core/Core', 'sap/ui/core/ElementMetadata'],
	function (jQuery, library, Global, Core, ElementMetadata) {
		"use strict";

		var configurationInfo = sap.ui.getCore().getConfiguration();

		//================================================================================
		// Technical Information
		//================================================================================

		function _getFrameworkName() {
			var versionInfo;

			try {
				versionInfo = sap.ui.getVersionInfo();
			} catch (e) {
				versionInfo = undefined;
			}

			if (versionInfo && versionInfo.gav) {
				return versionInfo.gav.indexOf('openui5') !== -1 ? 'OpenUI5' : 'SAPUI5';
			} else {
				return '';
			}
		}

		function _getLibraries() {
			var libraries = Global.versioninfo ? Global.versioninfo.libraries : undefined;
			var formattedLibraries = Object.create(null);

			if (libraries !== undefined) {
				libraries.forEach(function (element, index, array) {
					formattedLibraries[element.name] = element.version;
				});
			}

			return formattedLibraries;
		}

		function _getLoadedLibraries() {
			var libraries = sap.ui.getCore().getLoadedLibraries();
			var formattedLibraries = Object.create(null);

			Object.keys(sap.ui.getCore().getLoadedLibraries()).forEach(function (element, index, array) {
				formattedLibraries[element] = libraries[element].version;
			});

			return formattedLibraries;
		}

		// Name space for all technical information about the framework
		var frameworkInformation = {

			commonInformation: {
				frameWorkName: _getFrameworkName(),
				version: Global.version,
				buildTime: Global.buildinfo.buildtime,
				lastChange: Global.buildinfo.lastchange,
				userAgent: navigator.userAgent,
				applicationHREF: window.location.href,
				documentTitle: document.title,
				documentMode: document.documentMode || '',
				debugMode: jQuery.sap.debug(),
				statistics: jQuery.sap.statistics()
			},

			configurationBootstrap: window['sap-ui-config'] || Object.create(null),

			configurationComputed: {
				theme: configurationInfo.getTheme(),
				language: configurationInfo.getLanguage(),
				formatLocale: configurationInfo.getFormatLocale(),
				accessibility: configurationInfo.getAccessibility(),
				animation: configurationInfo.getAnimation(),
				rtl: configurationInfo.getRTL(),
				debug: configurationInfo.getDebug(),
				inspect: configurationInfo.getInspect(),
				originInfo: configurationInfo.getOriginInfo(),
				noDuplicateIds: configurationInfo.getNoDuplicateIds()
			},

			libraries: _getLibraries(),

			loadedLibraries: _getLoadedLibraries(),

			loadedModules: jQuery.sap.getAllDeclaredModules().sort(),

			URLParameters: jQuery.sap.getUriParameters().mParams
		};

		//================================================================================
		// Control tree Information
		//================================================================================

		/**
		 * Name space for all methods related to control trees
		 * @type {{_createRenderedTreeModel: Function}}
		 */
		var controlTree = {

			/**
			 * Create data model of the rendered controls as a tree
			 * @param (Element) nodeElement - HTML DOM element from which the function will star searching
			 * @param {array} resultArray - Array that will contains all the information
			 */
			_createRenderedTreeModel: function (nodeElement, resultArray) {
				var node = nodeElement,
					childNode = node.firstElementChild,
					results = resultArray,
					subResult;

				if (node.getAttribute('data-sap-ui') && sap.ui.getCore().byId(node.id)) {
					results.push({
						id: node.id,
						name: sap.ui.getCore().byId(node.id).getMetadata().getName(),
						type: 'data-sap-ui',
						content: []
					});

					subResult = results[results.length - 1].content;
				} else {
					subResult = results;
				}

				while (childNode) {
					this._createRenderedTreeModel(childNode, subResult);
					childNode = childNode.nextElementSibling;
				}
			}
		};

		//================================================================================
		// Control Information
		//================================================================================

		/**
		 * Name space for all information relevant for UI5 control
		 * @type {{_getOwnProperties: Function, _copyInheritedProperties: Function, _getInheritedProperties: Function, _getProperties: Function}}
		 */
		var controlInformation = {

			// Control Properties Info
			//================================================================================

			/**
			 *
			 * @param control
			 * @returns {null}
			 * @private
			 */
			_getOwnProperties: function (control) {
				var result = Object.create(null);
				var controlPropertiesFromMetadata = control.getMetadata().getProperties();

				Object.keys(controlPropertiesFromMetadata).forEach(function (key) {
					result[key] = Object.create(null);
					result[key].value = control.getProperty(key);
					result[key].type = controlPropertiesFromMetadata[key].type;
				});

				return result;
			},

			/**
			 *
			 * @param control
			 * @param inheritedMetadata
			 * @returns {null}
			 * @private
			 */
			_copyInheritedProperties: function (control, inheritedMetadata) {
				var inheritedMetadataProperties = inheritedMetadata.getProperties();

				var result = Object.create(null);
				result.controlName = inheritedMetadata.getName();
				result.controlProperties = Object.create(null);

				Object.keys(inheritedMetadataProperties).forEach(function (key) {
					result.controlProperties[key] = Object.create(null);
					result.controlProperties[key].value = inheritedMetadataProperties[key].get(control);
					result.controlProperties[key].type = inheritedMetadataProperties[key].type;
				});

				return result;
			},

			/**
			 *
			 * @param control
			 * @returns {Array}
			 * @private
			 */
			_getInheritedProperties: function (control) {
				var result = [];
				var inheritedMetadata = control.getMetadata().getParent();

				while (inheritedMetadata instanceof ElementMetadata) {
					result.push(this._copyInheritedProperties(control, inheritedMetadata));
					inheritedMetadata = inheritedMetadata.getParent();
				}

				return result;
			},

			/**
			 *
			 * @param controlId
			 * @returns {null}
			 * @private
			 */
			_getProperties: function (controlId) {
				var control =  sap.ui.getCore().byId(controlId);

				var properties = Object.create(null);
				properties.own = this._getOwnProperties(control);
				properties.inherited = this._getInheritedProperties(control);

				return properties;
			},

			// Binding Info
			//================================================================================

			/**
			 * @param {Object} bindingContext
			 * @returns {{name: string, path: *}}
			 * @private
			 */
			_getModelFromContext: function (bindingContext) {
				var model = {
					name: (!bindingContext.sModelName) ? 'default' : bindingContext.sModelName,
					path: bindingContext.getPath()
				};

				if (bindingContext.oModel) {
					model.mode = bindingContext.oModel.sDefaultBindingMode;
					model.type = bindingContext.oModel.getMetadata()._sClassName;
					model.data = bindingContext.oModel.oData;
				}

				return model;
			},

			/**
			 *
			 * @param {Object} control
			 * @returns {Object}
			 * @private
			 */
			_getBindDataForProperties: function (control) {
				// TODO need some default value if there is no available data

				var properties = control.getMetadata().getAllProperties();
				var propertiesBindingData = Object.create(null);

				for (var key in properties) {
					if (properties.hasOwnProperty(key)) {
						if (control.getBinding(key)) {
							propertiesBindingData[key] = Object.create(null);
							propertiesBindingData[key].path = control.getBinding(key).sPath;
							propertiesBindingData[key].value = control.getBinding(key).oValue;
							propertiesBindingData[key].type = control.getBinding(key).sInternalType;
							propertiesBindingData[key].mode = control.getBinding(key).sMode;
							propertiesBindingData[key].model = this._getModelFromContext(control.getBinding(key));
						}
					}
				}

				return propertiesBindingData;
			},

			/**
			 *
			 * @param {Object} control
			 * @returns {Object}
			 * @private
			 */
			_getBindDataForAggregations: function (control) {
				// TODO need some default value if there is no available data

				var aggregations = control.getMetadata().getAllAggregations();
				var aggregationsBindingData = Object.create(null);

				for (var key in aggregations) {
					if (aggregations.hasOwnProperty(key)) {
						if (control.getBinding(key)) {
							aggregationsBindingData[key] = Object.create(null);
							aggregationsBindingData[key].model = this._getModelFromContext(control.getBinding(key));
						}
					}
				}

				return aggregationsBindingData;
			}
		};

		//================================================================================
		// Public API
		//================================================================================

		/**
		 * Global object that provide common information for all support tools
		 * @type {{getFrameworkInformation: Function, getRenderedControlTree: Function, getControlProperties: Function, getControlBindingInformation: Function}}
		 */
		return {

			/**
			 * Common information about the framework
			 * @returns {*}
			 */
			getFrameworkInformation: function () {
				return frameworkInformation;
			},

			/**
			 * Array model of the rendered control as a tree
			 * @returns {Array}
			 */
			getRenderedControlTree: function () {
				var renderedControlTreeModel = [];
				controlTree._createRenderedTreeModel(document.body, renderedControlTreeModel);

				return renderedControlTreeModel;
			},

			/**
			 *
			 * @param {string} controlId
			 * @returns {Object}
			 */
			getControlProperties: function (controlId) {
				return controlInformation._getProperties(controlId);
			},

			/**
			 *
			 * @param control
			 * @returns {*}
			 */
			getControlBindingData: function (controlId) {
				var control =  sap.ui.getCore().byId(controlId);

				if (!control) {
					return Object.create(null);
				}

				var bindingData = Object.create(null);
				var bindingContext = control.getBindingContext();

				// TODO need some default value if there is no available data
				if (bindingContext) {
					bindingData.contextPath = bindingContext.sPath;
				}

				bindingData.aggregations = controlInformation._getBindDataForAggregations(control);
				bindingData.properties = controlInformation._getBindDataForProperties(control);

				return bindingData;
			}
		};


	});
