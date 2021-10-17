import Button from "sap/m/Button";
function _getFragment(mFragment) {
    var sFragment = "";
    if (mFragment) {
        sFragment = "<core:Fragment ";
        if (mFragment.id) {
            sFragment += "id=\"" + mFragment.id + "\" ";
        }
        if (mFragment.name) {
            sFragment += "fragmentName=\"" + mFragment.name + "\" ";
        }
        sFragment += "type=\"JS\" />";
    }
    return sFragment;
}