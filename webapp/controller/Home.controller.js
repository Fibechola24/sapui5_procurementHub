sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast"
], function(Controller, MessageToast) {
    "use strict";

    return Controller.extend("ui5.procurementhub.controller.Home", {
        
        onInit: function() {
            // Controller initialization
        },

        onHelpPress: function() {
            MessageToast.show("Help information will be available soon!");
        },

        onNavToDashboard: function() {
            this.getOwnerComponent().getRouter().navTo("dashboard");
        }
    });
});