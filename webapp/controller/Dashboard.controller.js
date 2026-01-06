sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History",
    "sap/m/MessageToast",
    "sap/ui/model/json/JSONModel"
], function(Controller, History, MessageToast, JSONModel) {
    "use strict";

    return Controller.extend("ui5.procurementhub.controller.Dashboard", {
        
        onInit: function() {
            // Mock data for dashboard
            var oModel = new JSONModel({
                recentActivities: [
                    {
                        title: "PR-2023-00123",
                        description: "Laptop procurement for new hires",
                        status: "Approved",
                        infoState: "Success"
                    },
                    {
                        title: "PR-2023-00124",
                        description: "Office supplies quarterly order",
                        status: "Pending",
                        infoState: "Warning"
                    },
                    {
                        title: "PR-2023-00125",
                        description: "Software licenses renewal",
                        status: "Rejected",
                        infoState: "Error"
                    },
                    {
                        title: "PR-2023-00126",
                        description: "Marketing campaign materials",
                        status: "In Progress",
                        infoState: "Information"
                    }
                ]
            });
            
            this.getView().setModel(oModel, "dashboard");
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

        onRefresh: function() {
            MessageToast.show("Dashboard refreshed");
            // In real implementation, refresh data from backend
        },

        onFilter: function() {
            MessageToast.show("Filter dialog would open here");
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

        onSuppliers: function() {
            this.getOwnerComponent().getRouter().navTo("suppliers");
        },

        onSettings: function() {
            this.getOwnerComponent().getRouter().navTo("settings");
        },

        onActivityPress: function(oEvent) {
            var sTitle = oEvent.getSource().getTitle();
            MessageToast.show("Selected: " + sTitle);
            // In real implementation, navigate to detail view
        }
    });
});