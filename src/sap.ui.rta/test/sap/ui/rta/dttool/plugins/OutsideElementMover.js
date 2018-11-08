sap.ui.define([
	'sap/ui/rta/plugin/RTAElementMover',
	'sap/ui/dt/OverlayUtil',
	'sap/ui/rta/command/CommandFactory',
	'sap/ui/fl/FlexControllerFactory',
	'sap/ui/fl/registry/ChangeRegistry',
	'sap/base/util/LoaderExtensions',
	'sap/ui/fl/Utils',
	'sap/ui/util/XMLHelper',
	'sap/base/util/uid'
],
function(
	RTAElementMover,
	OverlayUtil,
	CommandFactory,
	FlexControllerFactory,
	ChangeRegistry,
	LoaderExtensions,
	FlexUtils,
	XMLHelper,
	uid
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

	OutsideElementMover.prototype.isMovingFromOutside = function(oMovedOverlay) {
		return !!this._fromOutside;
	};

	OutsideElementMover.prototype.resetFromOutside = function() {
		delete this._fromOutside;
	};

	OutsideElementMover.prototype.checkTargetZone = function(oAggregationOverlay, oOverlay, bOverlayNotInDom){
		if (this.isMovingFromOutside()) {
			return true;
		}
		return RTAElementMover.prototype.checkTargetZone.apply(this, arguments);
	};

	OutsideElementMover.prototype.buildAddXMLCommand = function () {
		var oMovedOverlay = this.getMovedOverlay();
		var oParentInfo = OverlayUtil.getParentInformation(oMovedOverlay);
		var sFragmentPath = oMovedOverlay.getDesignTimeMetadata().getData().templates.create;
		var sTargetElementType = oParentInfo.parent.getMetadata().getName();

		if (!ChangeRegistry.getInstance().hasChangeHandlerForControlAndChange(sTargetElementType, "addXML")) {
			var mRegistryItems = {};
			mRegistryItems[sTargetElementType] = {
				"AddXML": "default"
			};
			ChangeRegistry.getInstance().registerControlsForChanges(mRegistryItems);
		}

		//The fragment is loaded here because the AddXML command currently doesn't support the moduleName property and needs the fragment
		//TODO: Should be removed once the command was adapted to the new change handler logic
		return LoaderExtensions.loadResource(sFragmentPath, {async: true})
		.then( function(oDocument) {
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
		var oMovedOverlay = this.getMovedOverlay();
		var oParentInfo = OverlayUtil.getParentInformation(oMovedOverlay);
		var sFragmentPath = oMovedOverlay.getDesignTimeMetadata().getData().templates.create;
		var sTargetElementType = oParentInfo.parent.getMetadata().getName();

		if (!ChangeRegistry.getInstance().hasChangeHandlerForControlAndChange(sTargetElementType, "addXML")) {
			var mRegistryItems = {};
			mRegistryItems[sTargetElementType] = {
				"AddXML": "default"
			};
			ChangeRegistry.getInstance().registerControlsForChanges(mRegistryItems);
		}

		var oChangeContent = {
			moduleName: sFragmentPath,
			fragmentPath: sFragmentPath,
			targetAggregation: oParentInfo.aggregation,
			index: oParentInfo.index,
			changeType: "addXML",
			layer: "VENDOR"
		};

		var oFlexController = FlexControllerFactory.createForControl(oParentInfo.parent);
		var oChange = oFlexController.createChange(oChangeContent, oParentInfo.parent);
		oFlexController._oChangePersistence.addDirtyChange(oChange);
		oFlexController._oChangePersistence.saveDirtyChanges();
		return oChange;
	};

	return OutsideElementMover;
  }, /* bExport= */ true);
