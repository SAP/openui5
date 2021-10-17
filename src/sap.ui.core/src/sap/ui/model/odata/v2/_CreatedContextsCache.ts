function _CreatedContextsCache() {
    this.mCache = {};
}
_CreatedContextsCache.prototype.addContext = function (oCreatedContext, sPath, sListID) {
    var aContexts, mListIDToContexts;
    mListIDToContexts = this.mCache[sPath];
    if (!mListIDToContexts) {
        mListIDToContexts = this.mCache[sPath] = {};
    }
    aContexts = mListIDToContexts[sListID];
    if (!aContexts) {
        aContexts = mListIDToContexts[sListID] = [];
    }
    aContexts.unshift(oCreatedContext);
};
_CreatedContextsCache.prototype.getContexts = function (sPath, sListID) {
    var mListIDToContexts = this.mCache[sPath], aContexts = mListIDToContexts && mListIDToContexts[sListID];
    return aContexts ? aContexts.slice() : [];
};
_CreatedContextsCache.prototype.removeContext = function (oCreatedContext, sPath, sListID) {
    var mListIDToContexts = this.mCache[sPath], aContexts = mListIDToContexts[sListID];
    aContexts.splice(aContexts.indexOf(oCreatedContext), 1);
    if (!aContexts.length) {
        delete mListIDToContexts[sListID];
        if (!Object.keys(mListIDToContexts).length) {
            delete this.mCache[sPath];
        }
    }
};