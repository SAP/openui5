import Log from "sap/base/Log";
export class CustomizingConfiguration {
    static log(...args: any) { }
    static activateForComponent(...args: any) { }
    static deactivateForComponent(...args: any) { }
    static activateForComponentInstance(...args: any) { }
    static deactivateForComponentInstance(...args: any) { }
    static getViewReplacement(...args: any) { }
    static getViewExtension(...args: any) { }
    static getControllerExtension(...args: any) { }
    static getControllerReplacement(...args: any) { }
    static getCustomProperties(...args: any) { }
    static hasCustomProperties(...args: any) { }
}
Log.error("Since UI5 version 1.95, the private module 'sap/ui/core/CustomizingConfiguration' is functionally inactive. " + "Please be aware that this module has always been a private API and any monkey patching on this module will have no further effect. " + "You must remove the dependency to this file as this module will be removed in one of the following versions of UI5.");