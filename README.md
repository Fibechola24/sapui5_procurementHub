# Procurement Hub - SAP UI5 Fiori Application

## Overview
A modern procurement management application built with SAP UI5 following Fiori design principles.

## Features
- Dashboard with KPI cards and quick actions
- Create Purchase Request with items table
- My Purchase Requests list with search/filter
- Settings page with user preferences
- Responsive design with SAP Horizon theme

## Project Structure
ui5.procurementhub/
├── webapp/ # UI5 application source
│ ├── controller/ # JavaScript controllers
│ ├── view/ # XML views
│ ├── model/ # Data models
│ └── i18n/ # Internationalization
├── package.json # Node.js dependencies
└── ui5.yaml # UI5 build configuration

## Setup & Installation
1. Clone the repository
2. Install dependencies: `npm install`
3. Start development server: `npm start`
4. Open browser: `http://localhost:8080`

## Build for Production
```bash
npm run build

Deployment
The built application can be deployed to:

SAP BTP (Business Technology Platform)

Any web server supporting static content

Development Notes
Follows SAP Fiori Design Guidelines

Uses SAP UI5 1.108.0

Built with UI5 Tooling

Responsive across desktop, tablet, and mobile

