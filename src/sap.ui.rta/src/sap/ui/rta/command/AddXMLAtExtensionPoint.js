/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/rta/command/FlexCommand",
	"sap/ui/core/util/reflection/JsControlTreeModifier",
	"sap/ui/fl/write/api/ChangesWriteAPI",
	"sap/ui/fl/Utils"
], function(
	FlexCommand,
	JsControlTreeModifier,
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
	 * @experimental Since 1.76. This class is experimental and provides only limited functionality. Also the API might be
	 *               changed in future.
	 */
	var AddXMLAtExtensionPoint = FlexCommand.extend("sap.ui.rta.command.AddXMLAtExtensionPoint", {
		metadata : {
			library : "sap.ui.rta",
			properties : {
				fragment : {
					type : "string",
					group: "content"
				},
				fragmentPath : {
					type : "string",
					group: "content"
				},
				changeType : {
					type : "string",
					defaultValue : "addXMLAtExtensionPoint"
				}
			},
			associations : {},
			events : {}
		}
	});

	/**
	 * @override to suppress the {} being recognized as binding strings
	 */
	AddXMLAtExtensionPoint.prototype.bindProperty = function(sName, oBindingInfo) {
		if (sName === "fragment") {
			return this.setFragment(oBindingInfo.bindingString);
		}
		return FlexCommand.prototype.bindProperty.apply(this, arguments);
	};

	AddXMLAtExtensionPoint.prototype.getAppComponent = function () {
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
		mModulePreloads[vChange.getModuleName()] = this.getFragment();
		sap.ui.require.preload(mModulePreloads);

		var oChange = vChange.change || vChange;
		var oAppComponent = this.getAppComponent();
		var oSelector = oChange.getSelector();
		var oView = JsControlTreeModifier.bySelector(oSelector.viewSelector, oAppComponent);
		var oSelectorElement = JsControlTreeModifier.getExtensionPointInfo(oSelector.name, oView).parent;

		var mPropertyBag = {
			modifier: JsControlTreeModifier,
			appComponent: oAppComponent,
			view: oView
		};
		return ChangesWriteAPI.apply(Object.assign({change: oChange, element: oSelectorElement}, mPropertyBag))
			.then(function(oResult) {
				if (!oResult.success) {
					return Promise.reject(oResult.error);
				}
			});
	};

	return AddXMLAtExtensionPoint;
}, /* bExport= */true);
