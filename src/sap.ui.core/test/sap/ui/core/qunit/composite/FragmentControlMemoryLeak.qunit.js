/*!
 * ${copyright}
 */
sap.ui.require([
    'jquery.sap.global', 'sap/ui/qunit/utils/MemoryLeakCheck', 'sap/ui/core/FragmentControl'
], function(jQuery, MemoryLeakCheck, FragmentControl) {

    MemoryLeakCheck.checkControl(function(){
        return new FragmentControl();
    });
});
