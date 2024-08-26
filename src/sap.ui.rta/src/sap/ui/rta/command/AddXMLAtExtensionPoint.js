/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/rta/command/FlexCommand",
	"sap/ui/core/util/reflection/JsControlTreeModifier",
	"sap/ui/fl/apply/api/ExtensionPointRegistryAPI",
	"sap/ui/fl/write/api/ChangesWriteAPI",
	"sap/ui/fl/Utils"
], function(
	FlexCommand,
	JsControlTreeModifier,
	ExtensionPointRegistryAPI,
	ChangesWriteAPI,
	Utils
) {
	"use strict";

	/**
	 * Add a control from a XML fragment
	 *
	 * @class
	 * @extends sap.ui.rta.command.FlexCommand
	 * @author SAP SE
	 * @version ${version}
	 * @constructor
	 * @private
	 * @since 1.76
	 * @alias sap.ui.rta.command.AddXMLAtExtensionPoint
	 */
	var AddXMLAtExtensionPoint = FlexCommand.extend("sap.ui.rta.command.AddXMLAtExtensionPoint", {
		metadata: {
			library: "sap.ui.rta",
			properties: {
				fragment: {
					type: "string",
					group: "content"
				},
				fragmentPath: {
					type: "string",
					group: "content"
				},
				changeType: {
					type: "string",
					defaultValue: "addXMLAtExtensionPoint"
				}
			},
			associations: {},
			events: {}
		}
	});

	/**
	 * Overridden to suppress the {} being recognized as binding strings.
	 * @override
	 */
	AddXMLAtExtensionPoint.prototype.bindProperty = function(...aArgs) {
		const [sName, oBindingInfo] = aArgs;
		if (sName === "fragment") {
			return this.setFragment(oBindingInfo.bindingString);
		}
		return FlexCommand.prototype.bindProperty.apply(this, aArgs);
	};

	AddXMLAtExtensionPoint.prototype.getAppComponent = function() {
		var oView = this.getSelector().view;
		return Utils.getAppComponentForControl(oView);
	};

	/**
	 * Normally when the changes are loaded, the backend preloads the fragment as a module,
	 * When first applying a change we need to do the same.
	 * @override
	 */
	AddXMLAtExtensionPoint.prototype._applyChange = function(vChange) {
		// preload the module to be applicable in this session
		var mModulePreloads = {};
		mModulePreloads[vChange.getFlexObjectMetadata().moduleName] = this.getFragment();
		sap.ui.require.preload(mModulePreloads);

		var oChange = vChange.change || vChange;
		var oAppComponent = this.getAppComponent();
		var oSelector = oChange.getSelector();
		var oView = JsControlTreeModifier.bySelector(oSelector.viewSelector, oAppComponent);
		var oExtensionPointInfo = ExtensionPointRegistryAPI.getExtensionPointInfo({
			name: oSelector.name,
			view: oView
		});
		var oSelectorElement = oExtensionPointInfo.targetControl;
		oChange.setExtensionPointInfo(oExtensionPointInfo);

		var mPropertyBag = {
			modifier: JsControlTreeModifier,
			appComponent: oAppComponent,
			view: oView
		};
		return ChangesWriteAPI.apply({ change: oChange, element: oSelectorElement, ...mPropertyBag })
		.then(function(oResult) {
			if (!oResult.success) {
				return Promise.reject(oResult.error);
			}
			return undefined;
		});
	};

	return AddXMLAtExtensionPoint;
}, /* bExport= */true);
