/*!
* ${copyright}
*/

// Provides object sap.ui.fl.apply._internal.extensionPoint.Processor
sap.ui.define([
	"sap/base/Log",
	"sap/ui/fl/ChangePersistenceFactory",
	"sap/ui/fl/apply/_internal/changes/Applier",
	"sap/ui/fl/Utils",
	"sap/ui/fl/registry/ExtensionPointRegistry",
	"sap/ui/core/util/reflection/JsControlTreeModifier"
],
function(
	Log,
	ChangePersistenceFactory,
	Applier,
	Utils,
	ExtensionPointRegistry,
	JsControlTreeModifier
) {
	'use strict';

	/**
	 * Implements the <code>Extension Points</code> provider by SAPUI5 flexibility that can be hooked in the <code>sap.ui.core.ExtensionPoint</code> life cycle.
	 *
	 * @name sap.ui.fl.apply._internal.extensionPoint.Processor
	 * @class
	 * @constructor
	 * @author SAP SE
	 * @version ${version}
	 */
	var Processor = {
		applyExtensionPoint: function(oExtensionPoint) {
			var oAppComponent = Utils.getAppComponentForControl(oExtensionPoint.targetControl);
			var oChangePersistence = ChangePersistenceFactory.getChangePersistenceForControl(oExtensionPoint.targetControl);
			var mPropertyBag = {};
			mPropertyBag.appComponent = Utils.getAppComponentForControl(oExtensionPoint.targetControl);
			mPropertyBag.modifier = JsControlTreeModifier;
			mPropertyBag.viewId = oExtensionPoint.view.getId();
			mPropertyBag.name = oExtensionPoint.name;

			var oExtensionPointRegistry = ExtensionPointRegistry.getInstance();
			oExtensionPointRegistry.registerExtensionPoints(oExtensionPoint);

			return oChangePersistence.getChangesForExtensionPoint(mPropertyBag).then(function (aChanges) {
				if (aChanges.length === 0) {
					//default content
					oExtensionPoint.createDefault().then(function (aControls) {
						aControls.forEach(function(oNewControl, iIterator) {
							JsControlTreeModifier.insertAggregation(oExtensionPoint.targetControl, oExtensionPoint.aggregationName, oNewControl, oExtensionPoint.index + iIterator, oExtensionPoint.view);
						});
						oExtensionPoint.ready(aControls);
					});
				} else {
					aChanges.forEach(function (oChange) {
						//Only continue process if the change has not been applied, such as in case of XMLPreprocessing of an async view
						if (oChange.isInInitialState()) {
							oChange.setExtensionPointInfo(oExtensionPoint);

							//Set correct selector from targetControl's ID
							var oSelector = oChange.getSelector();
							oSelector.id = oExtensionPoint.targetControl.getId();
							oSelector.idIsLocal = false;
							oChange.setSelector(oSelector);

							//If the component creation is async, the changesMap already created without changes on EP --> it need to be updated
							//Otherwise, update the selector of changes is enough, change map will be created later correctly
							if (oChangePersistence.isChangeMapCreated()) {
								oChangePersistence._addChangeAndUpdateDependencies(oAppComponent, oChange);
							}
						}
					});
				}
			});
		}
	};

	return Processor;
});