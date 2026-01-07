sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/ui/core/routing/History"
], function(Controller, MessageToast, History) {
    "use strict";

    return Controller.extend("ui5.procurementhub.controller.Home", {
        
        onInit: function() {
            // Controller initialization
            // We can load any initial data here if needed
        },

        onHelpPress: function() {
            MessageToast.show("Need assistance? Visit our documentation or contact support.");
        },

        onRefresh: function() {
            MessageToast.show("Home page refreshed");
            // In real implementation, refresh data from backend
        },

        onGetStarted: function() {
            // Navigate to dashboard for first-time users
            this.onDashboard();
        },

        onDashboard: function() {
            // Navigate to the full dashboard view
            this.getOwnerComponent().getRouter().navTo("dashboard");
            MessageToast.show("Opening full dashboard...");
        },

        onCreatePR: function() {
            this.getOwnerComponent().getRouter().navTo("createPR");
        },

        onMyPRs: function() {
            this.getOwnerComponent().getRouter().navTo("myPRs");
        },

        onApprovals: function() {
            this.getOwnerComponent().getRouter().navTo("approvals");
        },

        onAnalytics: function() {
            this.getOwnerComponent().getRouter().navTo("analytics");
        },

        onSettings: function() {
            this.getOwnerComponent().getRouter().navTo("settings");
        },

        onActivityPress: function(oEvent) {
            var sTitle = oEvent.getSource().getTitle();
            MessageToast.show("Opening: " + sTitle);
            
            // Navigate to PR detail if it's a PR
            if (sTitle.startsWith("PR-")) {
                this.getOwnerComponent().getRouter().navTo("prDetail", {
                    prNumber: sTitle
                });
            }
        },

        onNavBack: function() {
            var oHistory = History.getInstance();
            var sPreviousHash = oHistory.getPreviousHash();

            if (sPreviousHash !== undefined) {
                window.history.go(-1);
            } else {
                // Already at home, do nothing
                MessageToast.show("You're already on the home page");
            }
        }
    });
});