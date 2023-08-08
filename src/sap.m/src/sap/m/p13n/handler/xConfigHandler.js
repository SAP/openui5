/*!
 * ${copyright}
 */

sap.ui.define([
    'sap/m/p13n/Engine',
    'sap/m/p13n/modules/xConfigAPI'
], function(Engine, xConfigAPI) {
	"use strict";

	/**
	 * @class Utility class for generic mdc xConfig handling by utilizing the
     * <code>sap.m.p13n.Engine</code> and its <code>Modificationhandler</code>.
     * This class should be used to handle property changes that should be persisted
     * as flex changes for MDC control while enabling preprocessing via customdata.
	 *
	 * @author SAP SE
	 * @private
	 * @alias sap.m.p13n.handler.xConfigHandler
	 */
    var xConfigHandler = {};

    var fnQueueChange = function(oControl, fTask) {
		var fCleanupPromiseQueue = function(pOriginalPromise) {
			if (oControl._pQueue === pOriginalPromise){
				delete oControl._pQueue;
			}
		};

		oControl._pQueue = oControl._pQueue instanceof Promise ? oControl._pQueue.then(fTask) : fTask();
		oControl._pQueue.then(fCleanupPromiseQueue.bind(null, oControl._pQueue));

		return oControl._pQueue;
	};

	function fConfigModified(oControl, oChange) {

		if (oControl.isA) {
			Engine.getInstance().trace(oControl, {
				selectorElement: oControl,
				changeSpecificData: {
					changeType: oChange.getChangeType(),
					content: oChange.getContent()
				}
			});

			if (!oControl._pPendingModification) {
				oControl._pPendingModification = Engine.getInstance().waitForChanges(oControl).then(function() {
                    Engine.getInstance().fireStateChange(oControl);
					Engine.getInstance().clearTrace(oControl);
					delete oControl._pPendingModification;
				});
			}
		}
	}

    /**
     * Creates a changehandler specific to the provided aggregation and property name,
     * to enhance the xConfig object for a given mdc control instance.
     *
     * The enhanced object can be accesed using <code>Engine#readAggregationConfig</code>.
     *
     * @param {object} mMetaConfig A map describing the metadata structure that is affected by this changehandler
     * @param {boolean} mMetaConfig.aggregationBased Defines whether the aggregation space or the property space should be used in the xConfig object
     * @param {string} mMetaConfig.property The property name (such as <code>width</code> or <code>label</code>)
     * @param {string} mMetaConfig.operation The operation to be executed by the handler (add, remove, move, set)
     *
     * @returns {object} The created changehandler object
     */
    xConfigHandler.createHandler = function(mMetaConfig) {

        if (!mMetaConfig || !mMetaConfig.hasOwnProperty("property")) {
            throw new Error("Please provide a map containing the affected aggregation and property name!");
        }

        var sAffectedProperty = mMetaConfig.property;
        var sAffectedAggregation;

        return {
            "changeHandler": {
                applyChange: function (oChange, oControl, mPropertyBag) {

                    return fnQueueChange(oControl, function(){
                        return Engine.getInstance().readXConfig(oControl, {
                            propertyBag: mPropertyBag
                        })
                        .then(function(oPriorAggregationConfig) {

                            var sOperation = oChange.getChangeType().indexOf("add") > -1 ? "add" : "remove";
                            sOperation = oChange.getChangeType().indexOf("move") === 0 ? "move" : sOperation;

                            sAffectedAggregation = oChange.getContent().targetAggregation;

                            var oRevertData = {
                                key: oChange.getContent().key
                            };
                            oRevertData.value = sOperation !== "add";

                            var aCurrentState;
                            if (sOperation === "move") {
                                aCurrentState = Engine.getInstance().getController(oControl, oChange.getChangeType()).getCurrentState();
                                var oFound = aCurrentState.find(function(oItem, iIndex){
                                    if (oItem.key === oChange.getContent().key) {
                                        return oItem;
                                    }
                                });
                                oRevertData.targetAggregation = oChange.getContent().targetAggregation;
                                oRevertData.index = aCurrentState.indexOf(oFound);
                            }

                            if (oPriorAggregationConfig
                                && oPriorAggregationConfig.aggregations
                                && oPriorAggregationConfig.aggregations[sAffectedAggregation]
                                && oPriorAggregationConfig.aggregations[sAffectedAggregation][oChange.getContent().key]
                                && oPriorAggregationConfig.aggregations[sAffectedAggregation][oChange.getContent().key][sAffectedProperty]
                                ){
                                    oRevertData.value = oPriorAggregationConfig.aggregations[sAffectedAggregation][oChange.getContent().key][sAffectedProperty];
                            }

                            oChange.setRevertData(oRevertData);

                            var oConfig = {
                                property: sAffectedProperty,
                                key: oChange.getContent().key,
                                value: oChange.getContent(),
                                operation: sOperation,
                                changeType: oChange.getChangeType(),
                                propertyBag: mPropertyBag,
                                markAsModified: true
                            };

                            if (mMetaConfig.aggregationBased) {
                                oConfig.controlMeta = {
                                    aggregation: sAffectedAggregation
                                };
                            }

                            return Engine.getInstance().enhanceXConfig(oControl, oConfig);
                        })
                        .then(function(){
                            fConfigModified(oControl, oChange);
                        });
                    });

                },
                completeChangeContent: function (oChange, mChangeSpecificInfo, mPropertyBag) {
                    // Not used, but needs to be there
                },
                revertChange: function (oChange, oControl, mPropertyBag) {

                    var sOperation = oChange.getChangeType().indexOf("add") > -1 ? "remove" : "add";
                    sOperation = oChange.getChangeType().indexOf("move") === 0 ? "move" : sOperation;

                    sAffectedAggregation = oChange.getContent().targetAggregation;

                    var oConfig = {
                        controlMeta: {
                            aggregation: sAffectedAggregation,
                            property: sAffectedProperty
                        },
                        property: sAffectedProperty,
                        operation: sOperation,
                        changeType: oChange.getChangeType(),
                        key: oChange.getRevertData().key,
                        value: oChange.getRevertData(),
                        propertyBag: mPropertyBag
                    };

                    if (mMetaConfig.aggregationBased) {
                        oConfig.controlMeta = {
                            aggregation: sAffectedAggregation
                        };
                    }

                    return Engine.getInstance().enhanceXConfig(oControl, oConfig)
                    .then(function() {
                        oChange.resetRevertData();
                        fConfigModified(oControl, oChange);
                    });
                }
            },
            "layers": {
                "USER": true
            }
        };
    };

    return xConfigHandler;

});
