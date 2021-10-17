import ServiceFactory from "./ServiceFactory";
import assert from "sap/base/assert";
var mServiceFactories = Object.create(null);
var ServiceFactoryRegistry = Object.create(null);
ServiceFactoryRegistry.register = function (sServiceFactoryName, oServiceFactory) {
    assert(sServiceFactoryName, "sServiceFactoryName must not be empty, null or undefined");
    assert(oServiceFactory instanceof ServiceFactory, "oServiceFactory must be an instance of sap.ui.core.service.ServiceFactory");
    mServiceFactories[sServiceFactoryName] = oServiceFactory;
    return this;
};
ServiceFactoryRegistry.unregister = function (sServiceFactoryName) {
    assert(sServiceFactoryName, "sServiceFactoryName must not be empty, null or undefined");
    delete mServiceFactories[sServiceFactoryName];
    return this;
};
ServiceFactoryRegistry.get = function (sServiceFactoryName) {
    return mServiceFactories[sServiceFactoryName];
};