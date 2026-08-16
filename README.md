# Smart Dental Imaging and Cavity Detection

An AI-assisted web application for analyzing dental images and generating cavity detection reports.

## Overview

Smart Dental Imaging and Cavity Detection is a final-year Computer Engineering project designed to assist in the preliminary identification of suspected dental caries from intraoral dental images.

The system provides a web-based interface where users can upload dental images, perform AI-assisted image analysis, view the analysis results, and generate a diagnostic report.

## Key Features

* Dental image upload
* AI-assisted image analysis
* Image preprocessing
* Cavity region identification
* Confidence-based analysis
* Result visualization
* Diagnostic report generation
* User-friendly web interface

## Proposed AI Pipeline

```text
Dental Image
     ↓
Image Preprocessing
     ↓
CNN-based Feature Extraction
     ↓
YOLOv8 Object Detection
     ↓
Cavity Localization
     ↓
Confidence / Analysis Results
     ↓
Diagnostic Report
```

## Technology Stack

### Frontend

* React.js
* TypeScript
* Vite
* HTML/CSS

### Backend / Image Processing Reference
* Python
* FastAPI
* OpenCV
* NumPy

### Database

* MySQL

### AI

* AI-assisted image analysis
* Proposed CNN-based feature extraction
* Proposed YOLOv8-based object detection

## Project Structure

```text
dental-cavity-ai/
├── components/
├── pages/
├── services/
├── App.tsx
├── index.tsx
├── backend_reference.py
├── package.json
├── package-lock.json
├── requirements.txt
├── schema.sql
├── types.ts
├── vite.config.ts
└── README.md
```

## Installation

### Prerequisites

* Node.js
* npm
* Python 3.10+
* Git

### Frontend

Clone the repository:

```bash
git clone YOUR_REPOSITORY_URL
cd smart-dental-imaging-cavity-detection
```

Install dependencies:

```bash
npm install
```

Create a `.env` file based on `.env.example` and add your Gemini API key.

Start the development server:

```bash
npm run dev
```

## Environment Variables

Create a `.env` file:

```env
GEMINI_API_KEY=your_api_key_here
```

Never commit your `.env` file or expose API keys publicly.

## Project Status

This repository contains the working prototype developed for the final-year project.

The proposed system architecture includes CNN-based feature extraction and YOLOv8-based object detection. The current prototype demonstrates the end-to-end application workflow and AI-assisted image analysis.

## Future Scope

* Training and validation of a dedicated YOLOv8 model using a sufficiently large annotated dental dataset
* Improved cavity localization
* More reliable severity classification
* Larger and more diverse dental image datasets
* Clinical validation with dental professionals
* Improved deployment and scalability

