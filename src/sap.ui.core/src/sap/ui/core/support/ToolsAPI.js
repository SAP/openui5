/*!
 * ${copyright}
 */

sap.ui.define([
	'sap/ui/core/library',
	'sap/ui/Global',
	'sap/ui/core/Core',
	'sap/ui/core/ElementMetadata',
	"sap/base/util/LoaderExtensions",
	"sap/base/util/UriParameters",
	"jquery.sap.global"
],
	function(
		library,
		Global,
		Core,
		ElementMetadata,
		LoaderExtensions,
		UriParameters,
		jQuery
	) {
		'use strict';

		var configurationInfo = sap.ui.getCore().getConfiguration();

		// ================================================================================
		// Technical Information
		// ================================================================================

		/**
		 * Creates an object with the libraries and their version from the version info file.
		 * @returns {Object}
		 * @private
		 */
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

		/**
		 * Creates an object with the loaded libraries and their version.
		 * @returns {Object}
		 * @private
		 */
		function _getLoadedLibraries() {
			var libraries = sap.ui.getCore().getLoadedLibraries();
			var formattedLibraries = Object.create(null);

			Object.keys(sap.ui.getCore().getLoadedLibraries()).forEach(function (element, index, array) {
				formattedLibraries[element] = libraries[element].version;
			});

			return formattedLibraries;
		}

		/**
		 * Creates a simple object with all URL parameters.
		 * @returns {Object<string,string[]>} Map of parameter value arrays keyed by parameter names
		 */
		function getURLParameters() {
			var oParams = UriParameters.fromQuery(window.location.search);
			return Array.from(oParams.keys()).reduce(function(oResult, sKey) {
				oResult[sKey] = oParams.getAll(sKey);
				return oResult;
			}, {});
		}

		/**
		 * Gets all the relevant information for the framework.
		 * @returns {Object}
		 * @private
		 */
		function _getFrameworkInformation() {
			return {
				commonInformation: {
					version: Global.version,
					buildTime: Global.buildinfo.buildtime,
					lastChange: Global.buildinfo.lastchange,
					jquery: jQuery.fn.jquery,
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

				loadedModules: LoaderExtensions.getAllRequiredModules().sort(),

				URLParameters: getURLParameters()
			};
		}

		// ================================================================================
		// Control tree Information
		// ================================================================================

		/**
		 * Name space for all methods related to control trees
		 */
		var controlTree = {
			/**
			 * Creates data model of the rendered controls as a tree.
			 * @param {Element} nodeElement - HTML DOM element from which the function will star searching.
			 * @param {Array} resultArray - Array that will contains all the information.
			 * @private
			 */
			_createRenderedTreeModel: function (nodeElement, resultArray) {
				var node = nodeElement;
				var childNode = node.firstElementChild;
				var results = resultArray;
				var subResult = results;
				var control = sap.ui.getCore().byId(node.id);

				if (node.getAttribute('data-sap-ui') && control) {
					results.push({
						id: control.getId(),
						name: control.getMetadata().getName(),
						type: 'sap-ui-control',
						content: []
					});

					subResult = results[results.length - 1].content;
				} else if (node.getAttribute('data-sap-ui-area')) {
					results.push({
						id: node.id,
						name: 'sap-ui-area',
						type: 'data-sap-ui',
						content: []
					});

					subResult = results[results.length - 1].content;
				}

				while (childNode) {
					this._createRenderedTreeModel(childNode, subResult);
					childNode = childNode.nextElementSibling;
				}
			}
		};

		// ================================================================================
		// Control Information
		// ================================================================================

		/**
		 * Name space for all information relevant for UI5 control
		 */
		var controlInformation = {

			// Control Properties Info
			// ================================================================================

			/**
			 * Creates an object with the control properties that are not inherited.
			 * @param {Object} control - UI5 control.
			 * @returns {Object}
			 * @private
			 */
			_getOwnProperties: function (control) {
				var result = Object.create(null);
				var controlPropertiesFromMetadata = control.getMetadata().getProperties();

				result.meta = Object.create(null);
				result.meta.controlName = control.getMetadata().getName();

				result.properties = Object.create(null);
				Object.keys(controlPropertiesFromMetadata).forEach(function (key) {
					result.properties[key] = Object.create(null);
					result.properties[key].value = control.getProperty(key);
					result.properties[key].type = controlPropertiesFromMetadata[key].getType().getName ? controlPropertiesFromMetadata[key].getType().getName() : '';
				});

				return result;
			},

			/**
			 * Copies the inherited properties of a UI5 control from the metadata.
			 * @param {Object} control - UI5 Control.
			 * @param {Object} inheritedMetadata - UI5 control metadata.
			 * @returns {Object}
			 * @private
			 */
			_copyInheritedProperties: function (control, inheritedMetadata) {
				var inheritedMetadataProperties = inheritedMetadata.getProperties();
				var result = Object.create(null);

				result.meta = Object.create(null);
				result.meta.controlName = inheritedMetadata.getName();

				result.properties = Object.create(null);
				Object.keys(inheritedMetadataProperties).forEach(function (key) {
					result.properties[key] = Object.create(null);
					result.properties[key].value = inheritedMetadataProperties[key].get(control);
					result.properties[key].type = inheritedMetadataProperties[key].getType().getName ? inheritedMetadataProperties[key].getType().getName() : '';
				});

				return result;
			},

			/**
			 * Creates an array with the control properties that are inherited.
			 * @param {Object} control - UI5 control.
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
			 * Creates an object with all control properties.
			 * @param {string} controlId
			 * @returns {Object}
			 * @private
			 */
			_getProperties: function (controlId) {
				var control = sap.ui.getCore().byId(controlId);
				var properties = Object.create(null);

				if (control) {
					properties.own = this._getOwnProperties(control);
					properties.inherited = this._getInheritedProperties(control);
				}

				return properties;
			},

			// Binding Info
			// ================================================================================

			/**
			 * Creates an object with the context model of a UI5 control.
			 * @param {Object} control
			 * @param {string} controlProperty
			 * @returns {Object}
			 * @private
			 */
			_getModelFromContext: function (control, controlProperty) {
				var bindingContext = control.getBinding(controlProperty);
				var bindingContextModel = bindingContext.getModel();
				var bindingInfoParts = (control.getBindingInfo(controlProperty).parts) ? control.getBindingInfo(controlProperty).parts : [];
				var modelNames = [];

				for (var i = 0; i < bindingInfoParts.length; i++) {
					modelNames.push(bindingInfoParts[i].model);
				}

				var model = {
					names: modelNames,
					path: bindingContext.getPath()
				};

				if (bindingContextModel) {
					model.mode = bindingContextModel.getDefaultBindingMode();
					model.type = bindingContextModel.getMetadata().getName();
					model.data = bindingContextModel.getData ? bindingContextModel.getData('/') : undefined;
				}

				return model;
			},

			/**
			 * Creates an object with the properties bindings of a UI5 control.
			 * @param {Object} control
			 * @returns {Object}
			 * @private
			 */
			_getBindDataForProperties: function (control) {
				var properties = control.getMetadata().getAllProperties();
				var propertiesBindingData = Object.create(null);

				for (var key in properties) {
					if (properties.hasOwnProperty(key) && control.getBinding(key)) {
						propertiesBindingData[key] = Object.create(null);
						propertiesBindingData[key].path = control.getBinding(key).getPath();
						propertiesBindingData[key].value = control.getBinding(key).getValue();
						propertiesBindingData[key].type = control.getMetadata().getProperty(key).getType().getName ? control.getMetadata().getProperty(key).getType().getName() : '';
						propertiesBindingData[key].mode = control.getBinding(key).getBindingMode();
						propertiesBindingData[key].model = this._getModelFromContext(control, key);
					}
				}

				return propertiesBindingData;
			},

			/**
			 * Creates an object with the agregations bindings of a UI5 control.
			 * @param {Object} control
			 * @returns {Object}
			 * @private
			 */
			_getBindDataForAggregations: function (control) {
				var aggregations = control.getMetadata().getAllAggregations();
				var aggregationsBindingData = Object.create(null);

				for (var key in aggregations) {
					if (aggregations.hasOwnProperty(key) && control.getBinding(key)) {
						aggregationsBindingData[key] = Object.create(null);
						aggregationsBindingData[key].model = this._getModelFromContext(control, key);
					}
				}

				return aggregationsBindingData;
			}
		};

		// ================================================================================
		// Public API
		// ================================================================================

		/**
		 * Global object that provide common information for all support tools
		 * @type {{getFrameworkInformation: Function, getRenderedControlTree: Function, getControlProperties: Function, getControlBindingInformation: Function}}
		 */
		return {

			/**
			 * Common information about the framework
			 * @returns {*}
			 */
			getFrameworkInformation: _getFrameworkInformation,

			/**
			 * Array model of the rendered control as a tree.
			 * @returns {Array}
			 */
			getRenderedControlTree: function () {
				var renderedControlTreeModel = [];
				controlTree._createRenderedTreeModel(document.body, renderedControlTreeModel);

				return renderedControlTreeModel;
			},

			/**
			 * Gets all control properties.
			 * @param {string} controlId
			 * @returns {Object}
			 */
			getControlProperties: function (controlId) {
				return controlInformation._getProperties(controlId);
			},

			/**
			 * Gets control binding information.
			 * @param {string} controlId
			 * @returns {Object}
			 */
			getControlBindings: function (controlId) {
				var result = Object.create(null);
				var control = sap.ui.getCore().byId(controlId);
				var bindingContext;

				if (!control) {
					return result;
				}

				bindingContext = control.getBindingContext();

				result.meta = Object.create(null);
				result.contextPath = bindingContext ? bindingContext.getPath() : null;
				result.aggregations = controlInformation._getBindDataForAggregations(control);
				result.properties = controlInformation._getBindDataForProperties(control);

				return result;
			}
		};

	});