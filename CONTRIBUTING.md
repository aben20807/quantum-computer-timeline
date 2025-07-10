# Contributing to the Quantum Computer Timeline Project

Thank you for your interest in contributing to the Quantum Computer Timeline project! This document provides guidelines and instructions for contributing to both the application code and the quantum computer dataset.

## Code of Conduct

- Be respectful and inclusive in communications
- Provide constructive feedback
- Focus on the project goals and quality

## Ways to Contribute

### Data Corrections and Additions

The accuracy of quantum computing data is essential to this project. We welcome contributions that improve data quality:

- Submit a pull request with changes to the `public/data/qpu_timeline.csv` file
- Include references or sources for any data corrections
- Follow the established CSV format for new entries
- Provide context for your changes in the pull request description

The CSV data structure is as follows:

| Field | Description |
|-------|-------------|
| name | Name of the quantum computer |
| organization | Research institution or company that developed the QPU |
| releaseDate | Date when the QPU was announced or published |
| qubitCount | Number of qubits in the quantum processor |
| externalLink | JSON array of research papers with title and URL |
| description | Brief description of the quantum computer's significance |

Example of a valid entry:

```csv
Sycamore,Google,2019-10-23,53,"[{""title"":""Nature Paper"",""url"":""https://www.nature.com/articles/s41586-019-1666-5""}]","First quantum supremacy claim"
```

### Bug Reports and Feature Requests

We use GitHub Issues to track bugs and feature requests:

- Use the Issues section on GitHub to report bugs or suggest enhancements
- Provide detailed descriptions of problems or proposed features
- Include screenshots, browser information, or error messages when applicable
- Use clear and descriptive titles for issues
- Check if a similar issue already exists before creating a new one

### Code Contributions

We welcome improvements to the application itself:

- Fork the repository and create a feature branch for your changes
- Follow the existing code style and patterns
- Submit a pull request with a clear description of the changes and benefits
- Include any necessary updates to documentation
- Ensure your code works across different browsers and screen sizes
- Test your changes thoroughly before submitting

## Development Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/qpu-timeline.git
   cd qpu-timeline
   ```

2. Install dependencies:

   ```bash
   npm install
   # or
   yarn
   ```

3. Start the development server:

   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. Open your browser and navigate to `http://localhost:5173`

## Pull Request Process

1. Update the README.md or relevant documentation with details of changes if appropriate
2. Your pull request will be reviewed by maintainers
3. Address any requested changes from the code review
4. Once approved, your pull request will be merged

## Questions?

If you have questions about contributing, feel free to open an issue labeled "question" in the GitHub repository.

Thank you for helping improve the Quantum Computer Timeline project!
