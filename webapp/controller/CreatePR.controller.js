sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/model/json/JSONModel"
], function(Controller, History, MessageToast, MessageBox, JSONModel) {
    "use strict";

    return Controller.extend("ui5.procurementhub.controller.CreatePR", {
        
        onInit: function() {
            // Initialize form model
            var oModel = new JSONModel({
                requestType: "GOODS",
                priority: "MEDIUM",
                department: "",
                costCenter: "",
                requiredDate: new Date().toISOString().slice(0, 10),
                justification: "",
                createdBy: this._getCurrentUser(),
                creationDate: new Date().toLocaleDateString(),
                totalAmount: 0,
                items: [],
                attachments: [],
                requestTypes: [
                    {key: "GOODS", text: "Goods"},
                    {key: "SERVICES", text: "Services"},
                    {key: "CAPEX", text: "Capital Expenditure"},
                    {key: "OPEX", text: "Operational Expenditure"}
                ],
                priorities: [
                    {key: "LOW", text: "Low"},
                    {key: "MEDIUM", text: "Medium"},
                    {key: "HIGH", text: "High"},
                    {key: "URGENT", text: "Urgent"}
                ]
            });
            
            this.getView().setModel(oModel);
            this._updateItemsCount();
        },

        _getCurrentUser: function() {
            // In a real app, get from authentication
            // For now, return a mock user
            return "John Doe";
        },

        onSubmit: function() {
            var oModel = this.getView().getModel();
            var formData = oModel.getData();
            var aItems = formData.items;
            
            // Validation
            if (aItems.length === 0) {
                MessageBox.error("Please add at least one item before submitting");
                return;
            }
            
            if (!formData.department) {
                MessageBox.error("Please select a department");
                return;
            }
            
            if (!formData.costCenter) {
                MessageBox.error("Please enter a cost center");
                return;
            }
            
            if (!formData.justification) {
                MessageBox.error("Please provide a justification");
                return;
            }
            
            // Show confirmation dialog
            MessageBox.confirm("Submit this purchase request for approval?", {
                title: "Confirm Submission",
                onClose: function(oAction) {
                    if (oAction === MessageBox.Action.OK) {
                        this._submitPurchaseRequest(formData);
                    }
                }.bind(this)
            });
        },

        _submitPurchaseRequest: function(formData) {
            // Get component and add PR
            var oComponent = this.getOwnerComponent();
            var newPR = oComponent.addPurchaseRequest({
                requestType: formData.requestType,
                priority: formData.priority,
                department: formData.department,
                costCenter: formData.costCenter,
                requiredDate: formData.requiredDate,
                justification: formData.justification,
                totalAmount: parseFloat(formData.totalAmount) || 0,
                items: formData.items.map(item => ({
                    itemCode: item.itemCode || "ITEM-001",
                    description: item.description || "",
                    quantity: parseInt(item.quantity) || 1,
                    unitPrice: parseFloat(item.unitPrice) || 0,
                    total: (parseInt(item.quantity) || 1) * (parseFloat(item.unitPrice) || 0)
                })),
                attachments: formData.attachments,
                createdBy: formData.createdBy
            });
            
            if (newPR) {
                // Show success message with PR number
                MessageBox.success("Purchase Request submitted successfully!\n\nPR Number: " + newPR.prNumber, {
                    onClose: function() {
                        // Navigate to My Purchase Requests
                        this.getOwnerComponent().getRouter().navTo("myPRs");
                        
                        // Optional: Clear form for next entry
                        this.onClear();
                    }.bind(this)
                });
            } else {
                MessageBox.error("Failed to submit purchase request. Please try again.");
            }
        },

        onSaveDraft: function() {
            var oModel = this.getView().getModel();
            var formData = oModel.getData();
            var aItems = formData.items;
            
            if (aItems.length === 0) {
                MessageBox.warning("No items added. Draft not saved.");
                return;
            }
            
            // Get component and add PR as draft
            var oComponent = this.getOwnerComponent();
            var newPR = oComponent.addPurchaseRequest({
                requestType: formData.requestType,
                priority: formData.priority,
                department: formData.department,
                costCenter: formData.costCenter,
                requiredDate: formData.requiredDate,
                justification: formData.justification,
                totalAmount: parseFloat(formData.totalAmount) || 0,
                items: formData.items,
                attachments: formData.attachments,
                createdBy: formData.createdBy
            });
            
            if (newPR) {
                // Update status to DRAFT
                oComponent.updatePurchaseRequest(newPR.id, {
                    status: "DRAFT",
                    statusText: "Draft",
                    workflowStatus: "Draft Saved"
                });
                
                MessageBox.success("Draft saved successfully!\n\nPR Number: " + newPR.prNumber, {
                    onClose: function() {
                        // Navigate to My Purchase Requests
                        this.getOwnerComponent().getRouter().navTo("myPRs");
                    }.bind(this)
                });
            }
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

        onAddItem: function() {
            var oModel = this.getView().getModel();
            var aItems = oModel.getProperty("/items");
            
            aItems.push({
                itemCode: "ITEM-" + (aItems.length + 1).toString().padStart(3, '0'),
                description: "",
                quantity: 1,
                unitPrice: 0
            });
            
            oModel.setProperty("/items", aItems);
            this._updateItemsCount();
            this._updateTotalAmount();
            MessageToast.show("Item added");
        },

        onDeleteItem: function(oEvent) {
            var oItem = oEvent.getParameter("listItem");
            var sPath = oItem.getBindingContext().getPath();
            var oModel = this.getView().getModel();
            
            MessageBox.confirm("Are you sure you want to delete this item?", {
                title: "Confirm Delete",
                onClose: function(oAction) {
                    if (oAction === MessageBox.Action.OK) {
                        var aItems = oModel.getProperty("/items");
                        var iIndex = parseInt(sPath.split("/").pop());
                        aItems.splice(iIndex, 1);
                        oModel.setProperty("/items", aItems);
                        this._updateItemsCount();
                        this._updateTotalAmount();
                        MessageToast.show("Item deleted");
                    }
                }.bind(this)
            });
        },

        onEditItem: function(oEvent) {
            var oButton = oEvent.getSource();
            var oRow = oButton.getParent().getParent();
            MessageToast.show("Edit item functionality would open dialog");
            // In real implementation, open dialog to edit item
        },

        onDuplicateItem: function(oEvent) {
            var oModel = this.getView().getModel();
            var aItems = oModel.getProperty("/items");
            var oButton = oEvent.getSource();
            var oRow = oButton.getParent().getParent();
            var iIndex = oRow.getIndex();
            
            var oOriginalItem = aItems[iIndex];
            var oDuplicate = JSON.parse(JSON.stringify(oOriginalItem));
            oDuplicate.itemCode = oDuplicate.itemCode + "-COPY";
            
            aItems.splice(iIndex + 1, 0, oDuplicate);
            oModel.setProperty("/items", aItems);
            this._updateItemsCount();
            this._updateTotalAmount();
            MessageToast.show("Item duplicated");
        },

        onSearchItems: function(oEvent) {
            var sQuery = oEvent.getParameter("query");
            MessageToast.show("Searching for: " + sQuery);
            // In real implementation, filter table items
        },

        onAddAttachment: function() {
            MessageToast.show("File upload dialog would open");
            // In real implementation, trigger file upload
        },

        onAttachmentChange: function(oEvent) {
            // Handle attachment change
        },

        onSubmit: function() {
            var oModel = this.getView().getModel();
            var aItems = oModel.getProperty("/items");
            
            if (aItems.length === 0) {
                MessageBox.error("Please add at least one item before submitting");
                return;
            }
            
            MessageBox.success("Purchase request submitted successfully!", {
                onClose: function() {
                    this.getOwnerComponent().getRouter().navTo("myPRs");
                }.bind(this)
            });
        },

        onSaveDraft: function() {
            MessageToast.show("Draft saved successfully");
            // In real implementation, save to backend
        },

        onClear: function() {
            MessageBox.confirm("Are you sure you want to clear all data?", {
                title: "Confirm Clear",
                onClose: function(oAction) {
                    if (oAction === MessageBox.Action.OK) {
                        var oModel = this.getView().getModel();
                        oModel.setProperty("/items", []);
                        oModel.setProperty("/attachments", []);
                        oModel.setProperty("/justification", "");
                        this._updateItemsCount();
                        this._updateTotalAmount();
                        MessageToast.show("Form cleared");
                    }
                }.bind(this)
            });
        },

        onCancel: function() {
            this.onNavBack();
        },

        _updateItemsCount: function() {
            var oModel = this.getView().getModel();
            var aItems = oModel.getProperty("/items");
            var oTitle = this.byId("itemsCountTitle");
            
            if (oTitle) {
                oTitle.setText("Items (" + aItems.length + ")");
            }
        },
        _updateTotalAmount: function() {
            var oModel = this.getView().getModel();
            var aItems = oModel.getProperty("/items");
            var fTotal = 0;
            
            aItems.forEach(function(oItem) {
                fTotal += (oItem.quantity || 0) * (oItem.unitPrice || 0);
            });
            
            oModel.setProperty("/totalAmount", fTotal.toFixed(2));
        }
    });
});