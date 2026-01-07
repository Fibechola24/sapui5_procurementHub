sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History",
    "sap/m/MessageToast",
    "sap/m/MessageBox"
], function(Controller, History, MessageToast, MessageBox) {
    "use strict";

    return Controller.extend("ui5.procurementhub.controller.PRDetail", {
        
        formatter: {
            formatCurrency: function(amount) {
                if (amount === undefined || amount === null) return "$0.00";
                return "$" + parseFloat(amount).toFixed(2);
            },
            
            formatDate: function(sDate) {
                if (!sDate) return "";
                var oDate = new Date(sDate);
                return oDate.toLocaleDateString();
            }
        },

        onInit: function() {
            // Get the router and attach route matched event
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.getRoute("prDetail").attachPatternMatched(this._onRouteMatched, this);
        },

        _onRouteMatched: function(oEvent) {
            // Get the PR number from the route parameters
            var sPRNumber = oEvent.getParameter("arguments").prNumber;
            
            // Find the PR in the model
            var oModel = this.getOwnerComponent().getModel("purchaseRequests");
            var aPRs = oModel.getProperty("/purchaseRequests");
            var oPR = aPRs.find(pr => pr.prNumber === sPRNumber);
            
            if (oPR) {
                // Create a context for this specific PR
                var oContext = new sap.ui.model.Context(oModel, "/purchaseRequests/" + aPRs.indexOf(oPR));
                this.getView().setBindingContext(oContext, "purchaseRequests");
                this._currentPR = oPR;
                this._prIndex = aPRs.indexOf(oPR);
            } else {
                MessageBox.error("Purchase request not found: " + sPRNumber);
                this.onNavBack();
            }
        },

        onNavBack: function() {
            var oHistory = History.getInstance();
            var sPreviousHash = oHistory.getPreviousHash();

            if (sPreviousHash !== undefined) {
                window.history.go(-1);
            } else {
                this.getOwnerComponent().getRouter().navTo("myPRs", {}, true);
            }
        },

        onEdit: function() {
            var sPRNumber = this._currentPR.prNumber;
            MessageToast.show("Edit functionality for " + sPRNumber + " would open here");
            // In real implementation, navigate to edit view
        },

        onPrint: function() {
            MessageToast.show("Print functionality would open here");
            // In real implementation, generate PDF
        },

        onShare: function() {
            MessageToast.show("Share functionality would open here");
        },

        onDelete: function() {
            MessageBox.confirm("Are you sure you want to delete this purchase request?", {
                title: "Confirm Delete",
                onClose: function(oAction) {
                    if (oAction === MessageBox.Action.OK) {
                        var bSuccess = this.getOwnerComponent().deletePurchaseRequest(this._currentPR.id);
                        if (bSuccess) {
                            MessageToast.show("Purchase request deleted");
                            this.onNavBack();
                        } else {
                            MessageBox.error("Failed to delete purchase request");
                        }
                    }
                }.bind(this)
            });
        },

        onApprove: function() {
            MessageBox.confirm("Approve this purchase request?", {
                title: "Confirm Approval",
                onClose: function(oAction) {
                    if (oAction === MessageBox.Action.OK) {
                        var bSuccess = this.getOwnerComponent().updatePurchaseRequest(this._currentPR.id, {
                            status: "APPROVED",
                            statusText: "Approved",
                            workflowStatus: "Approved",
                            approver: "Current User",
                            approvalDate: new Date().toISOString().slice(0, 10),
                            lastUpdated: new Date().toISOString()
                        });
                        
                        if (bSuccess) {
                            MessageToast.show("Purchase request approved");
                            this.getView().getBindingContext("purchaseRequests").refresh();
                        } else {
                            MessageBox.error("Failed to approve purchase request");
                        }
                    }
                }.bind(this)
            });
        },

        onReject: function() {
            MessageBox.confirm("Reject this purchase request?", {
                title: "Confirm Rejection",
                onClose: function(oAction) {
                    if (oAction === MessageBox.Action.OK) {
                        var bSuccess = this.getOwnerComponent().updatePurchaseRequest(this._currentPR.id, {
                            status: "REJECTED",
                            statusText: "Rejected",
                            workflowStatus: "Rejected",
                            approver: "Current User",
                            approvalDate: new Date().toISOString().slice(0, 10),
                            lastUpdated: new Date().toISOString(),
                            comments: "Rejected by approver"
                        });
                        
                        if (bSuccess) {
                            MessageToast.show("Purchase request rejected");
                            this.getView().getBindingContext("purchaseRequests").refresh();
                        } else {
                            MessageBox.error("Failed to reject purchase request");
                        }
                    }
                }.bind(this)
            });
        },

        onExit: function() {
            // Clean up
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.getRoute("prDetail").detachPatternMatched(this._onRouteMatched, this);
        }
    });
});