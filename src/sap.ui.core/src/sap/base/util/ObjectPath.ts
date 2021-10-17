export class ObjectPath {
    static create(vObjectPath: any, oRootContext: any) {
        var oObject = oRootContext || defaultRootContext;
        var aNames = getObjectPathArray(vObjectPath);
        for (var i = 0; i < aNames.length; i++) {
            var sName = aNames[i];
            if (oObject[sName] === null || (oObject[sName] !== undefined && (typeof oObject[sName] !== "object" && typeof oObject[sName] !== "function"))) {
                throw new Error("Could not set object-path for '" + aNames.join(".") + "', path segment '" + sName + "' already exists.");
            }
            oObject[sName] = oObject[sName] || {};
            oObject = oObject[sName];
        }
        return oObject;
    }
    static get(vObjectPath: any, oRootContext: any) {
        var oObject = oRootContext || defaultRootContext;
        var aNames = getObjectPathArray(vObjectPath);
        var sPropertyName = aNames.pop();
        for (var i = 0; i < aNames.length && oObject; i++) {
            oObject = oObject[aNames[i]];
        }
        return oObject ? oObject[sPropertyName] : undefined;
    }
    static set(vObjectPath: any, vValue: any, oRootContext: any) {
        oRootContext = oRootContext || defaultRootContext;
        var aNames = getObjectPathArray(vObjectPath);
        var sPropertyName = aNames.pop();
        var oObject = ObjectPath.create(aNames, oRootContext);
        oObject[sPropertyName] = vValue;
    }
}
var defaultRootContext = window;
function getObjectPathArray(vObjectPath) {
    return Array.isArray(vObjectPath) ? vObjectPath.slice() : vObjectPath.split(".");
}