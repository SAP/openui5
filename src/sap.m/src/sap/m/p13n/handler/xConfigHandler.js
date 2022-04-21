/*
 * ! ${copyright}
 */

sap.ui.define([
    'sap/m/p13n/Engine'
], function(Engine) {
	"use strict";

	/**
	 * @class Utility class for generic mdc xConfig handling by utilizing the
     * <code>sap.m.p13n.Engine</code> and its <code>Modificationhandler</code>.
     * This class should be used to handle property changes that should be persisted
     * as flex changes for MDC control while enabling preprocessing via customdata.
	 *
	 * @author SAP SE
	 * @private
	 * @alias sap.m.flexibility.xConfigHandler
	 */
    var xConfigHandler = {};

    var fConfigModified = function(oControl) {
        if (!oControl._bWaitForModificationChanges && oControl.isA) {
            oControl._bWaitForModificationChanges = true;
            sap.m.p13n.Engine.getInstance().waitForChanges(oControl).then(function() {
                delete oControl._bWaitForModificationChanges;
                sap.m.p13n.Engine.getInstance().fireStateChange(oControl);
            });
        }
	};

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
                        return sap.m.p13n.Engine.getInstance().readXConfig(oControl, {
                            propertyBag: mPropertyBag
                        })
                        .then(function(oPriorAggregationConfig) {

                            var sOperation = oChange.getChangeType().indexOf("add") > -1 ? "add" : "remove";
                            sOperation = oChange.getChangeType().indexOf("move") === 0 ? "move" : sOperation;

                            sAffectedAggregation = oChange.getContent().targetAggregation;

                            var sOldValue = sOperation !== "add";

                            if (oPriorAggregationConfig
                                && oPriorAggregationConfig.aggregations
                                && oPriorAggregationConfig.aggregations[sAffectedAggregation]
                                && oPriorAggregationConfig.aggregations[sAffectedAggregation][oChange.getContent().key]
                                && oPriorAggregationConfig.aggregations[sAffectedAggregation][oChange.getContent().key][sAffectedProperty]
                                ){
                                    sOldValue = oPriorAggregationConfig.aggregations[sAffectedAggregation][oChange.getContent().key][sAffectedProperty];
                            }

                            oChange.setRevertData({
                                key: oChange.getContent().key,
                                value: sOldValue
                            });

                            var oConfig = {
                                property: sAffectedProperty,
                                key: oChange.getContent().key,
                                value: oChange.getContent(),
                                operation: sOperation,
                                propertyBag: mPropertyBag
                            };

                            if (mMetaConfig.aggregationBased) {
                                oConfig.controlMeta = {
                                    aggregation: sAffectedAggregation
                                };
                            }

                            return sap.m.p13n.Engine.getInstance().enhanceXConfig(oControl, oConfig);
                        })
                        .then(function() {
                            fConfigModified(oControl);
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
                        key: oChange.getRevertData().key,
                        value: oChange.getRevertData(),
                        propertyBag: mPropertyBag
                    };

                    if (mMetaConfig.aggregationBased) {
                        oConfig.controlMeta = {
                            aggregation: sAffectedAggregation
                        };
                    }

                    return sap.m.p13n.Engine.getInstance().enhanceXConfig(oControl, oConfig)
                    .then(function() {
                        oChange.resetRevertData();
                        fConfigModified(oControl);
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
