var iIdCounter = 0;
var fnUid = function uid() {
    return "id-" + new Date().valueOf() + "-" + iIdCounter++;
};