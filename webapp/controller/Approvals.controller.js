sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/Sorter"
], function(Controller, History, MessageToast, MessageBox, JSONModel, Filter, FilterOperator, Sorter) {
    "use strict";

    return Controller.extend("ui5.procurementhub.controller.Approvals", {
        
        formatter: {
            priorityState: function(sPriority) {
                switch (sPriority) {
                    case "URGENT": return "Error";
                    case "HIGH": return "Error";
                    case "MEDIUM": return "Warning";
                    case "LOW": return "Success";
                    default: return "None";
                }
            },
            
            priorityIcon: function(sPriority) {
                switch (sPriority) {
                    case "URGENT": return "sap-icon://alert";
                    case "HIGH": return "sap-icon://high-priority";
                    case "MEDIUM": return "sap-icon://medium-priority";
                    case "LOW": return "sap-icon://low-priority";
                    default: return "";
                }
            },
            
            priorityHighlight: function(sPriority) {
                switch (sPriority) {
                    case "URGENT": return "Error";
                    case "HIGH": return "Error";
                    case "MEDIUM": return "Warning";
                    case "LOW": return "Success";
                    default: return "None";
                }
            },
            
            dueStatusState: function(sDueStatus) {
                switch (sDueStatus) {
                    case "OVERDUE": return "Error";
                    case "DUE_SOON": return "Warning";
                    case "ON_TIME": return "Success";
                    default: return "None";
                }
            },
            
            dueDateColor: function(sDueStatus) {
                switch (sDueStatus) {
                    case "OVERDUE": return "#bb0000";
                    case "DUE_SOON": return "#e78c07";
                    case "ON_TIME": return "#107e3e";
                    default: return "#6a6d70";
                }
            },
            
            formatDate: function(sDate) {
                if (!sDate) return "";
                var oDate = new Date(sDate);
                return oDate.toLocaleDateString();
            }
        },

        onInit: function() {
            // Initialize approvals model with sample data
            var oModel = new JSONModel(this._generateApprovalsData());
            this.getView().setModel(oModel, "approvals");
            
            // Initialize selected items array for multi-select
            this._aSelectedItems = [];
            
            // Get table reference
            this._oTable = this.byId("approvalsTable");
        },

        _generateApprovalsData: function() {
            // Generate sample approvals data
            return {
                pendingApprovals: this._generatePendingApprovals(25),
                recentHistory: this._generateRecentHistory(10),
                selectedCount: 0
            };
        },

        _generatePendingApprovals: function(count) {
            var aPriorities = ["URGENT", "HIGH", "MEDIUM", "LOW"];
            var aDepartments = ["IT", "Marketing", "HR", "Finance", "Operations", "Sales", "R&D"];
            var aRequestors = ["John Smith", "Emma Johnson", "Michael Brown", "Sarah Davis", "Robert Wilson"];
            var aTitles = ["Manager", "Director", "Senior Analyst", "Team Lead", "Specialist"];
            
            var aData = [];
            var dToday = new Date();
            
            for (var i = 1; i <= count; i++) {
                var iDaysAgo = Math.floor(Math.random() * 7);
                var iDaysDue = Math.floor(Math.random() * 14) - 2; // -2 to 11 days
                var dSubmitted = new Date(dToday);
                dSubmitted.setDate(dSubmitted.getDate() - iDaysAgo);
                
                var dDue = new Date(dToday);
                dDue.setDate(dDue.getDate() + iDaysDue);
                
                var fAmount = (Math.random() * 10000 + 1000).toFixed(2);
                var sPriority = aPriorities[Math.floor(Math.random() * aPriorities.length)];
                var sDueStatus = iDaysDue < 0 ? "OVERDUE" : (iDaysDue < 3 ? "DUE_SOON" : "ON_TIME");
                
                aData.push({
                    id: "apr_" + Date.now() + "_" + i,
                    prNumber: "PR-2023-" + (1200 + i).toString().padStart(5, '0'),
                    description: "Purchase request for " + aDepartments[Math.floor(Math.random() * aDepartments.length)] + " requirements",
                    priority: sPriority,
                    amount: fAmount,
                    department: aDepartments[Math.floor(Math.random() * aDepartments.length)],
                    requestor: aRequestors[Math.floor(Math.random() * aRequestors.length)],
                    requestorTitle: aTitles[Math.floor(Math.random() * aTitles.length)],
                    submittedDate: dSubmitted.toISOString().slice(0, 10),
                    dueDate: dDue.toISOString().slice(0, 10),
                    daysLeft: iDaysDue < 0 ? "Overdue " + Math.abs(iDaysDue) + " days" : (iDaysDue + 1) + " days",
                    dueStatus: sDueStatus,
                    attachments: Math.floor(Math.random() * 5),
                    canApprove: Math.random() > 0.2, // 80% can be approved
                    workflowStep: "Manager Approval",
                    totalItems: Math.floor(Math.random() * 10) + 1,
                    comments: Math.random() > 0.7 ? "Budget review required" : ""
                });
            }
            
            return aData;
        },

        _generateRecentHistory: function(count) {
            var aActions = ["APPROVED", "REJECTED", "DELEGATED"];
            var aApprovers = ["David Miller", "Lisa Anderson", "James Taylor", "Maria Garcia"];
            
            var aData = [];
            var dToday = new Date();
            
            for (var i = 1; i <= count; i++) {
                var iDaysAgo = Math.floor(Math.random() * 30);
                var dActionDate = new Date(dToday);
                dActionDate.setDate(dActionDate.getDate() - iDaysAgo);
                
                var sAction = aActions[Math.floor(Math.random() * aActions.length)];
                var sComment = "";
                
                switch (sAction) {
                    case "APPROVED":
                        sComment = "Approved per budget allocation";
                        break;
                    case "REJECTED":
                        sComment = "Insufficient justification provided";
                        break;
                    case "DELEGATED":
                        sComment = "Delegated to department head for review";
                        break;
                }
                
                aData.push({
                    id: "hist_" + i,
                    prNumber: "PR-2023-" + (1100 + i).toString().padStart(5, '0'),
                    action: sAction,
                    approver: aApprovers[Math.floor(Math.random() * aApprovers.length)],
                    approvalDate: dActionDate.toISOString().slice(0, 10),
                    comment: sComment,
                    timestamp: dActionDate.toISOString()
                });
            }
            
            // Sort by date descending
            aData.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
            
            return aData;
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
            MessageToast.show("Refreshing approvals...");
            // In real implementation, fetch from backend
            var oModel = this.getView().getModel("approvals");
            oModel.refresh(true);
        },

        onToggleMultiSelect: function() {
            var oTable = this.byId("approvalsTable");
            var oBulkPanel = this.byId("bulkActionsPanel");
            var oToggleBtn = this.byId("multiSelectToggle");
            
            if (oTable.getMode() === "SingleSelectMaster") {
                oTable.setMode("MultiSelect");
                oBulkPanel.setVisible(true);
                oToggleBtn.setText("Single-Select Mode");
                MessageToast.show("Multi-select mode enabled");
            } else {
                oTable.setMode("SingleSelectMaster");
                oBulkPanel.setVisible(false);
                oToggleBtn.setText("Multi-Select Mode");
                this._aSelectedItems = [];
                this._updateSelectedCount();
                MessageToast.show("Single-select mode enabled");
            }
        },

        onOpenFilter: function() {
            MessageBox.information("Filter dialog would open here with options to filter by department, amount, priority, etc.");
        },

        onApprovalSettings: function() {
            this.getOwnerComponent().getRouter().navTo("settings");
        },

        onSearch: function(oEvent) {
            var sQuery = oEvent.getParameter("query");
            var oTable = this.byId("approvalsTable");
            var oBinding = oTable.getBinding("items");
            
            if (oBinding) {
                if (sQuery) {
                    var aFilters = [
                        new Filter([
                            new Filter("prNumber", FilterOperator.Contains, sQuery),
                            new Filter("description", FilterOperator.Contains, sQuery),
                            new Filter("requestor", FilterOperator.Contains, sQuery),
                            new Filter("department", FilterOperator.Contains, sQuery)
                        ], false)
                    ];
                    oBinding.filter(aFilters);
                } else {
                    oBinding.filter([]);
                }
            }
        },

        onLiveSearch: function(oEvent) {
            // Optional: Implement live search if needed
        },

        onOpenSort: function() {
            var oTable = this.byId("approvalsTable");
            var oBinding = oTable.getBinding("items");
            
            if (oBinding) {
                var aSorters = [
                    new Sorter("priority", false),
                    new Sorter("dueDate", true)
                ];
                oBinding.sort(aSorters);
                MessageToast.show("Sorted by priority and due date");
            }
        },

        onGroupBy: function() {
            MessageBox.information("Group by dialog would open here (group by department, priority, etc.)");
        },

        onSelectionChange: function(oEvent) {
            if (this._oTable.getMode() === "MultiSelect") {
                var aSelectedItems = oEvent.getParameter("listItems");
                this._aSelectedItems = aSelectedItems;
                this._updateSelectedCount();
            }
        },

        _updateSelectedCount: function() {
            var oSelectedCount = this.byId("selectedCount");
            if (oSelectedCount) {
                oSelectedCount.setText(this._aSelectedItems.length.toString());
                oSelectedCount.setState(this._aSelectedItems.length > 0 ? "Success" : "Information");
            }
        },

        onItemPress: function(oEvent) {
            var oItem = oEvent.getSource();
            var oContext = oItem.getBindingContext("approvals");
            
            if (oContext) {
                var sPRNumber = oContext.getProperty("prNumber");
                var sDescription = oContext.getProperty("description");
                
                // Open approval dialog
                this._openApprovalDialog(sPRNumber, sDescription);
            }
        },

        _openApprovalDialog: function(prNumber, description) {
            MessageBox.show("Review purchase request: " + prNumber + "\n\n" + description, {
                icon: MessageBox.Icon.QUESTION,
                title: "Approve or Reject",
                actions: [MessageBox.Action.APPROVE, MessageBox.Action.REJECT, MessageBox.Action.CANCEL],
                emphasizedAction: MessageBox.Action.APPROVE,
                onClose: function(oAction) {
                    if (oAction === MessageBox.Action.APPROVE) {
                        this._approvePR(prNumber);
                    } else if (oAction === MessageBox.Action.REJECT) {
                        this._rejectPR(prNumber);
                    }
                }.bind(this)
            });
        },

        onApprove: function(oEvent) {
            oEvent.stopPropagation();
            var oButton = oEvent.getSource();
            var oRow = oButton.getParent().getParent();
            var oContext = oRow.getBindingContext("approvals");
            
            if (oContext) {
                var sPRNumber = oContext.getProperty("prNumber");
                this._approvePR(sPRNumber);
            }
        },

        onReject: function(oEvent) {
            oEvent.stopPropagation();
            var oButton = oEvent.getSource();
            var oRow = oButton.getParent().getParent();
            var oContext = oRow.getBindingContext("approvals");
            
            if (oContext) {
                var sPRNumber = oContext.getProperty("prNumber");
                this._rejectPR(sPRNumber);
            }
        },

        onAddComment: function(oEvent) {
            oEvent.stopPropagation();
            MessageBox.prompt("Add comment for this approval:", {
                title: "Add Comment",
                defaultValue: "",
                onClose: function(oAction, sComment) {
                    if (oAction === MessageBox.Action.OK && sComment) {
                        MessageToast.show("Comment added: " + sComment);
                    }
                }
            });
        },

        _approvePR: function(prNumber) {
            MessageBox.confirm("Approve purchase request " + prNumber + "?", {
                title: "Confirm Approval",
                onClose: function(oAction) {
                    if (oAction === MessageBox.Action.OK) {
                        // In real implementation, update backend
                        this._removeFromPending(prNumber);
                        MessageToast.show("Purchase request " + prNumber + " approved successfully");
                    }
                }.bind(this)
            });
        },

        _rejectPR: function(prNumber) {
            MessageBox.confirm("Reject purchase request " + prNumber + "?", {
                title: "Confirm Rejection",
                onClose: function(oAction) {
                    if (oAction === MessageBox.Action.OK) {
                        // In real implementation, update backend
                        this._removeFromPending(prNumber);
                        MessageToast.show("Purchase request " + prNumber + " rejected");
                    }
                }.bind(this)
            });
        },

        _removeFromPending: function(prNumber) {
            var oModel = this.getView().getModel("approvals");
            var aPending = oModel.getProperty("/pendingApprovals");
            var iIndex = aPending.findIndex(item => item.prNumber === prNumber);
            
            if (iIndex !== -1) {
                aPending.splice(iIndex, 1);
                oModel.setProperty("/pendingApprovals", aPending);
            }
        },

        onViewUrgent: function() {
            this._filterByPriority("URGENT");
        },

        onViewAll: function() {
            var oTable = this.byId("approvalsTable");
            var oBinding = oTable.getBinding("items");
            oBinding.filter([]);
            MessageToast.show("Showing all pending approvals");
        },

        onViewOverdue: function() {
            this._filterByDueStatus("OVERDUE");
        },

        onViewDelegated: function() {
            MessageBox.information("View delegated approvals would show items assigned to other approvers");
        },

        _filterByPriority: function(sPriority) {
            var oTable = this.byId("approvalsTable");
            var oBinding = oTable.getBinding("items");
            
            if (oBinding) {
                var oFilter = new Filter("priority", FilterOperator.EQ, sPriority);
                oBinding.filter([oFilter]);
                MessageToast.show("Showing " + sPriority.toLowerCase() + " priority items");
            }
        },

        _filterByDueStatus: function(sDueStatus) {
            var oTable = this.byId("approvalsTable");
            var oBinding = oTable.getBinding("items");
            
            if (oBinding) {
                var oFilter = new Filter("dueStatus", FilterOperator.EQ, sDueStatus);
                oBinding.filter([oFilter]);
                MessageToast.show("Showing " + sDueStatus.toLowerCase() + " items");
            }
        },

        onBulkApprove: function() {
            if (this._aSelectedItems.length === 0) {
                MessageBox.warning("Please select items to approve");
                return;
            }
            
            var iCount = this._aSelectedItems.length;
            MessageBox.confirm("Approve " + iCount + " selected purchase requests?", {
                title: "Bulk Approval",
                onClose: function(oAction) {
                    if (oAction === MessageBox.Action.OK) {
                        // In real implementation, process all selected items
                        MessageToast.show(iCount + " purchase requests approved");
                        this._aSelectedItems = [];
                        this._updateSelectedCount();
                    }
                }.bind(this)
            });
        },

        onBulkReject: function() {
            if (this._aSelectedItems.length === 0) {
                MessageBox.warning("Please select items to reject");
                return;
            }
            
            var iCount = this._aSelectedItems.length;
            MessageBox.confirm("Reject " + iCount + " selected purchase requests?", {
                title: "Bulk Rejection",
                onClose: function(oAction) {
                    if (oAction === MessageBox.Action.OK) {
                        // In real implementation, process all selected items
                        MessageToast.show(iCount + " purchase requests rejected");
                        this._aSelectedItems = [];
                        this._updateSelectedCount();
                    }
                }.bind(this)
            });
        },

        onBulkDelegate: function() {
            MessageBox.information("Delegate dialog would open to assign selected items to another approver");
        },

        onDelegateAll: function() {
            MessageBox.confirm("Delegate all pending approvals to another approver?", {
                title: "Delegate All",
                onClose: function(oAction) {
                    if (oAction === MessageBox.Action.OK) {
                        MessageBox.prompt("Enter approver name:", {
                            title: "Select Approver",
                            onClose: function(oAction2, sApprover) {
                                if (oAction2 === MessageBox.Action.OK && sApprover) {
                                    MessageToast.show("All approvals delegated to " + sApprover);
                                }
                            }
                        });
                    }
                }
            });
        },

        onRejectAll: function() {
            MessageBox.confirm("Reject all pending approvals? This action cannot be undone.", {
                title: "Reject All",
                onClose: function(oAction) {
                    if (oAction === MessageBox.Action.OK) {
                        // In real implementation, reject all items
                        MessageToast.show("All pending approvals rejected");
                    }
                }
            });
        },

        onApproveAll: function() {
            MessageBox.confirm("Approve all pending approvals?", {
                title: "Approve All",
                onClose: function(oAction) {
                    if (oAction === MessageBox.Action.OK) {
                        // In real implementation, approve all items
                        MessageToast.show("All pending approvals approved");
                    }
                }
            });
        },

        onViewHistoryDetails: function(oEvent) {
            var oButton = oEvent.getSource();
            var oItem = oButton.getParent().getParent();
            var oContext = oItem.getBindingContext("approvals");
            
            if (oContext) {
                var sPRNumber = oContext.getProperty("prNumber");
                MessageToast.show("Viewing details for " + sPRNumber);
                // Navigate to PR detail view
                this.getOwnerComponent().getRouter().navTo("prDetail", {
                    prNumber: sPRNumber
                });
            }
        },

        onUpdateFinished: function(oEvent) {
            var iTotalItems = oEvent.getParameter("total");
            var oTableHeader = this.byId("approvalsTable").getHeaderToolbar();
            var oTitle = oTableHeader && oTableHeader.getContent()[0];
            
            if (oTitle && oTitle.getText) {
                oTitle.setText("Approval Requests (" + iTotalItems + ")");
            }
        },

        onExit: function() {
            // Clean up
            this._aSelectedItems = null;
            this._oTable = null;
        }
    });
});