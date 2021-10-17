import AnalyticalBinding from "./AnalyticalBinding";
import AnalyticalTreeBindingAdapter from "./AnalyticalTreeBindingAdapter";
import odata4analytics from "./odata4analytics";
import AnalyticalVersionInfo from "./AnalyticalVersionInfo";
import Log from "sap/base/Log";
var ODataModelAdapter = function () {
    var iModelVersion = AnalyticalVersionInfo.getVersion(this);
    if (iModelVersion === AnalyticalVersionInfo.NONE || this.getAnalyticalExtensions) {
        return;
    }
    this._mPreadapterFunctions = {
        bindList: this.bindList,
        bindTree: this.bindTree
    };
    for (var fn in ODataModelAdapter.prototype) {
        if (ODataModelAdapter.prototype.hasOwnProperty(fn)) {
            this[fn] = ODataModelAdapter.prototype[fn];
        }
    }
    if (iModelVersion === AnalyticalVersionInfo.V1 && this.isCountSupported()) {
        Log.info("ODataModelAdapter: switched ODataModel to use inlinecount (mandatory for the AnalyticalBinding)");
        this.setCountSupported(false);
    }
};
ODataModelAdapter.prototype.bindList = function (sPath, oContext, aSorters, aFilters, mParameters) {
    if (mParameters && mParameters.analyticalInfo) {
        var oBinding = new AnalyticalBinding(this, sPath, oContext, aSorters, aFilters, mParameters);
        AnalyticalTreeBindingAdapter.apply(oBinding);
        return oBinding;
    }
    else {
        return this._mPreadapterFunctions.bindList.apply(this, arguments);
    }
};
ODataModelAdapter.prototype.bindTree = function (sPath, oContext, aFilters, mParameters) {
    if (mParameters && mParameters.analyticalInfo) {
        var oBinding = new AnalyticalBinding(this, sPath, oContext, [], aFilters, mParameters);
        return oBinding;
    }
    else {
        return this._mPreadapterFunctions.bindTree.apply(this, arguments);
    }
};
ODataModelAdapter.prototype.getAnalyticalExtensions = function () {
    if (this.oOData4SAPAnalyticsModel != undefined && this.oOData4SAPAnalyticsModel != null) {
        return this.oOData4SAPAnalyticsModel;
    }
    var iModelVersion = AnalyticalVersionInfo.getVersion(this);
    if (iModelVersion === AnalyticalVersionInfo.V2 && !(this.oMetadata && this.oMetadata.isLoaded())) {
        throw "Failed to get the analytical extensions. The metadata have not been loaded by the model yet." + "Register for the 'metadataLoaded' event of the ODataModel(v2) to know when the analytical extensions can be retrieved.";
    }
    var sAnnotationDoc = null;
    if (arguments.length == 1) {
        var sAnnotationDocURI = arguments[0];
        var oResult = jQuery.sap.syncGetText(sAnnotationDocURI);
        if (oResult.success) {
            sAnnotationDoc = oResult.data;
        }
    }
    try {
        this.oOData4SAPAnalyticsModel = new odata4analytics.Model(new odata4analytics.Model.ReferenceByModel(this), { sAnnotationJSONDoc: sAnnotationDoc });
    }
    catch (exception) {
        throw "Failed to instantiate analytical extensions for given OData model: " + exception.message;
    }
    return this.oOData4SAPAnalyticsModel;
};
ODataModelAdapter.prototype.setAnalyticalExtensions = function (oOData4SAPAnalyticsModel) {
    this.oOData4SAPAnalyticsModel = oOData4SAPAnalyticsModel;
};