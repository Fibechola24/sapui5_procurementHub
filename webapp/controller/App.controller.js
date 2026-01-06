sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History",
    "sap/m/MessageToast"
], function(Controller, History, MessageToast) {
    "use strict";

    return Controller.extend("ui5.procurementhub.controller.App", {
        
        onInit: function() {
            this.getOwnerComponent().getRouter().attachRouteMatched(this.onRouteMatched, this);
            this.getOwnerComponent().getRouter().attachBeforeRouteMatched(this.onBeforeRouteMatched, this);
        },

        onRouteMatched: function(oEvent) {
            var sRouteName = oEvent.getParameter("name");
            MessageToast.show("Navigated to: " + sRouteName);
        },

        onBeforeRouteMatched: function(oEvent) {
            // Pre-route logic can be added here
        },

        onNavBack: function() {
            var oHistory = History.getInstance();
            var sPreviousHash = oHistory.getPreviousHash();

            if (sPreviousHash !== undefined) {
                window.history.go(-1);
            } else {
                this.getOwnerComponent().getRouter().navTo("home", {}, true);
            }
        },

        onExit: function() {
            this.getOwnerComponent().getRouter().detachRouteMatched(this.onRouteMatched, this);
            this.getOwnerComponent().getRouter().detachBeforeRouteMatched(this.onBeforeRouteMatched, this);
        }
    });
});