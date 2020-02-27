sap.ui.define([
	"sap/ui/rta/plugin/RTAElementMover",
	"sap/ui/dt/OverlayUtil",
	"sap/ui/rta/command/CommandFactory",
	"sap/ui/fl/registry/ChangeRegistry",
	"sap/ui/fl/Layer",
	"sap/base/util/LoaderExtensions",
	"sap/ui/util/XMLHelper",
	"sap/ui/fl/write/api/ChangesWriteAPI",
	"sap/ui/fl/write/api/PersistenceWriteAPI"
],
function(
	RTAElementMover,
	OverlayUtil,
	CommandFactory,
	ChangeRegistry,
	Layer,
	LoaderExtensions,
	XMLHelper,
	ChangesWriteAPI,
	PersistenceWriteAPI
) {
	"use strict";

	var OutsideElementMover = RTAElementMover.extend("sap.ui.rta.dttool.plugins.OutsideElementMover", {
		metadata : {
			library : "sap.ui.rta",
			properties : {
				commandFactory : {
					type : "any",
					defaultValue : CommandFactory
				},
				movableTypes : {
					type : "string[]",
					defaultValue : ["sap.ui.core.Element"]
				}
			},
			associations : {},
			events : {}
		}
	});

	OutsideElementMover.prototype.setMovedOverlay = function(oMovedOverlay) {
		oMovedOverlay = oMovedOverlay || this.getMovedOverlay();
		if (oMovedOverlay.isRoot()) {
			this._fromOutside = true;
		}
		RTAElementMover.prototype.setMovedOverlay.apply(this, arguments);
	};

	OutsideElementMover.prototype.isMovingFromOutside = function() {
		return !!this._fromOutside;
	};

	OutsideElementMover.prototype.resetFromOutside = function() {
		delete this._fromOutside;
	};

	OutsideElementMover.prototype.checkTargetZone = function() {
		if (this.isMovingFromOutside()) {
			return Promise.resolve(true);
		}
		return RTAElementMover.prototype.checkTargetZone.apply(this, arguments);
	};

	OutsideElementMover.prototype.buildAddXMLCommand = function () {
		var oPromise = Promise.resolve();
		var oMovedOverlay = this.getMovedOverlay();
		var oParentInfo = OverlayUtil.getParentInformation(oMovedOverlay);
		var sFragmentPath = oMovedOverlay.getDesignTimeMetadata().getData().templates.create;
		var sTargetElementType = oParentInfo.parent.getMetadata().getName();

		if (!ChangeRegistry.getInstance().hasChangeHandlerForControlAndChange(sTargetElementType, "addXML")) {
			var mRegistryItems = {};
			mRegistryItems[sTargetElementType] = {
				AddXML: "default"
			};
			oPromise = ChangeRegistry.getInstance().registerControlsForChanges(mRegistryItems);
		}

		//The fragment is loaded here because the AddXML command currently doesn't support the moduleName property and needs the fragment
		//TODO: Should be removed once the command was adapted to the new change handler logic
		return oPromise
		.then(function() {
			return LoaderExtensions.loadResource(sFragmentPath, {async: true});
		})
		.then(function(oDocument) {
			if (oDocument) {
				var oChangeContent = {
					fragment: XMLHelper.serialize(oDocument),
					fragmentPath: sFragmentPath,
					targetAggregation: oParentInfo.aggregation,
					index: oParentInfo.index,
					changeType: "addXML"
				};

				return this.getCommandFactory().getCommandFor(oParentInfo.parent, "AddXML", oChangeContent);
			}
		}.bind(this));
	};

	//TODO: Legacy code which properly executes all changes on app reload
	//Should be removed once the AddXML command works properly
	OutsideElementMover.prototype.buildAddXMLChange = function () {
		var oPromise = Promise.resolve();
		var oMovedOverlay = this.getMovedOverlay();
		var oParentInfo = OverlayUtil.getParentInformation(oMovedOverlay);
		var sFragmentPath = oMovedOverlay.getDesignTimeMetadata().getData().templates.create;
		var sTargetElementType = oParentInfo.parent.getMetadata().getName();

		if (!ChangeRegistry.getInstance().hasChangeHandlerForControlAndChange(sTargetElementType, "addXML")) {
			var mRegistryItems = {};
			mRegistryItems[sTargetElementType] = {
				AddXML: "default"
			};
			oPromise = ChangeRegistry.getInstance().registerControlsForChanges(mRegistryItems);
		}

		return oPromise
		.then(function() {
			var oChangeContent = {
				moduleName: sFragmentPath,
				fragmentPath: sFragmentPath,
				targetAggregation: oParentInfo.aggregation,
				index: oParentInfo.index,
				changeType: "addXML",
				layer: Layer.VENDOR
			};

			var oChange = ChangesWriteAPI.create({changeSpecificData: oChangeContent, selector: oParentInfo.parent});
			PersistenceWriteAPI.add({change: oChange, selector: oParentInfo.parent});
			PersistenceWriteAPI.save({selector: oParentInfo.parent, skipUpdateCache: false});
			return oChange;
		});
	};

	return OutsideElementMover;
});
