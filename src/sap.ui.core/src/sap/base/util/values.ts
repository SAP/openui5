var fnValues = function values(mObject) {
    if (typeof mObject === "undefined" || mObject === null || mObject !== mObject) {
        return [];
    }
    return Object.values(mObject);
};