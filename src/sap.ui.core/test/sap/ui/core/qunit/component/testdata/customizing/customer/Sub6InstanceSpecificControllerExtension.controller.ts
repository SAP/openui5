sap.ui.controller("testdata.customizing.customer.Sub6InstanceSpecificControllerExtension", {
    onInit: function () {
        oLifecycleSpy("Sub6InstanceSpecificControllerExtension Controller onInit()");
    },
    onExit: function () {
        oLifecycleSpy("Sub6InstanceSpecificControllerExtension Controller onExit()");
    },
    onBeforeRendering: function () {
        oLifecycleSpy("Sub6InstanceSpecificControllerExtension Controller onBeforeRendering()");
    },
    onAfterRendering: function () {
        oLifecycleSpy("Sub6InstanceSpecificControllerExtension Controller onAfterRendering()");
    },
    mySpecificAction: function () {
    }
});