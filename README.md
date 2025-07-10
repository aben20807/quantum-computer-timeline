# Quantum Computer Timeline Visualization

![Quantum Computer Timeline](public/qpu-social-cover.svg)

An interactive visualization tool that tracks the evolution of quantum processing units (QPUs) over time. This application provides a visual timeline of quantum computers developed by various research organizations, with details on qubit count, release dates, and associated research papers.

## Features

- **Interactive Timeline Chart**: Visualize the progression of quantum computers with an intuitive scatter plot
- **Organization-based Color Coding**: Each research organization is represented with a unique color and symbol
- **Detailed Information**: Hover over data points to see detailed information about each QPU
- **Paper References**: Direct links to research papers and publications for each quantum computer
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **PWA Support**: Can be installed as a Progressive Web App

## Tech Stack

- **Vue 3**: Frontend framework with Composition API
- **Vite**: Fast, modern build tool
- **Tailwind CSS v4**: Utility-first CSS framework
- **ECharts**: Powerful charting library for data visualization
- **PapaParse**: CSV parsing library for data processing

## Data Structure

The application uses a CSV file with the following structure:

| Field | Description |
|-------|-------------|
| name | Name of the quantum computer |
| organization | Research institution or company that developed the QPU |
| releaseDate | Date when the QPU was announced or published |
| qubitCount | Number of qubits in the quantum processor |
| externalLink | JSON array of research papers with title and URL |
| description | Brief description of the quantum computer's significance |

## Disclaimer

The quantum computing field is rapidly evolving, and despite our best efforts to maintain accurate information, some data in this visualization may become outdated or contain inaccuracies. Details about quantum processors, qubit counts, release dates, and organizational attributions are compiled from publicly available sources which themselves may contain varying degrees of precision or marketing claims.

**We welcome contributions to improve data accuracy:**

- If you find any errors or have more accurate/updated information, please submit an issue or pull request on GitHub
- For substantial additions or corrections to the dataset, please include references to verifiable sources
- Organizations working on quantum computing are encouraged to submit their own QPU data for inclusion

This project aims to provide an educational visualization of quantum computing progress rather than an authoritative technical reference. All information should be verified with original sources when used for research, academic, or business purposes.

## Project Structure

```plaintext
QPU/
├── public/
│   ├── data/
│   │   └── qpu_timeline.csv     # Main data source
│   ├── enhanced-qpu-favicon.svg # Website favicon
│   └── qpu-social-cover.svg     # Social media preview image
├── src/
│   ├── components/
│   │   ├── AboutSection.vue     # Project information section
│   │   ├── QPUDetailTooltip.vue # Tooltip showing QPU details
│   │   ├── QPULegend.vue        # Legend showing organizations
│   │   └── TimelineChart.vue    # Main visualization component
│   ├── App.vue                  # Main application component
│   ├── main.js                  # Application entry point
│   └── style.css                # Global styles
└── index.html                   # HTML entry point
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

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

### Building for Production

```bash
npm run build
# or
yarn build
```

The built files will be in the `dist` directory, ready to be deployed to any static hosting service.

## Adding/Editing Quantum Computer Data

To add or update quantum computer information:

1. Edit the CSV file at `public/data/qpu_timeline.csv`
2. Follow the existing format for consistency
3. For paper links, use the JSON array format: `[{"title":"Paper Title","url":"https://example.com"}]`
4. The application will automatically update with the new data

## Contributing

We welcome contributions to improve both the application and the dataset. Please see the [CONTRIBUTING.md](CONTRIBUTING.md) file for detailed guidelines on:

- Data corrections and additions
- Bug reports and feature requests
- Code contributions
- Development setup
- Pull request process

## Customizing the Visualization

The color scheme and symbols for different organizations can be customized in the `getOrganizationStyles` function in `App.vue`. The palette array contains color-symbol pairs that are assigned to each organization.

## Progressive Web App

This application supports installation as a Progressive Web App (PWA). When visiting the website on a compatible browser, you can install it on your device for offline access.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- Data compiled from public research papers and announcements
- Built with Vue 3 and modern web technologies
- Visualization powered by Apache ECharts
