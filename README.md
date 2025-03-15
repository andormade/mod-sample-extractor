# mod-sample-extractor

`mod-sample-extractor` is a Node.js command-line tool for extracting raw PCM sample data from ProTracker MOD files.

## Prerequisites

- **Node.js:**  
  This tool requires Node.js (version 10 or higher). If you don't have Node.js installed, please follow these steps:

  1. **Download and Install:**  
     Visit the [official Node.js website](https://nodejs.org/) and download the installer for your operating system. Follow the installation instructions provided on the website.

  2. **Verify Installation:**  
     Once installed, open a terminal or command prompt and run:
     ```bash
     node -v
     ```
     This should output the version of Node.js you installed.

## Installation

To install the tool, run:
```bash
npm install -g mod-sample-extractor
```

## Alternate Installation

In case it has been 10 years and the npm package repository ceased to exist, you can still clone this repository and run the tool manually:

1. Clone the Repository:
  ```bash
  git clone https://github.com/andormade/mod-sample-extractor.git
  cd mod-sample-extractor
  ```

2. Install 
  ```bash
  npm install -g
  ```

## Usage

Once installed, you can run the tool from anywhere:
```bash
mod-sample-extractor path/to/yourfile.mod
```
The tool reads the provided MOD file, parses the header and sample descriptors, and then extracts the PCM sample data into separate files in the current directory.

## PCM Specification

Each PCM file exported by the tool has the following characteristics:
- Format: Raw PCM data (no header or metadata)
- Bit Depth: 8-bit (signed)
- Channel: Mono
