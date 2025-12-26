# JSON Astra (JSON Beautifier Pro)

A modern, fast, and secure offline-capable JSON formatting tool. Validate, beautify, and minify your JSON data instantly with a beautiful interface.

## ✨ Features

- **🎨 Beautify JSON**: Format raw JSON into a readable, indented structure with syntax highlighting.
- **📦 Minify JSON**: Compress JSON into a single line for production use.
- **🛡️ Error Handling**: Real-time validation with clear error messages for invalid JSON.
- **📋 One-Click Copy**: Instantly copy formatted or minified output to your clipboard.
- **🔒 Secure & Local**: All processing happens in your browser—your data never leaves your device.
- **💎 Modern UI**: Sleek interface with glassmorphism effects and responsive design.

## 🛠️ Technology Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Fonts**: JetBrains Mono (Code), Inter (UI)
- **Deployment**: Docker, Nginx

## 🚀 Getting Started

### Run Locally (No Docker)

Simply open the `json/index.html` file in any modern web browser.

### Run with Docker

1. **Build the image:**
   ```bash
   docker build -t json-astra ./json
   ```

2. **Run the container:**
   ```bash
   docker run -d -p 8080:80 json-astra
   ```

3. **Access the app:**
   Open [http://localhost:8080](http://localhost:8080) in your browser.

## 📁 Project Structure

```
json-beautifier/
├── json/
│   ├── index.html      # Main application structure
│   ├── style.css       # Styling and animations
│   ├── script.js       # Core logic (parsing, formatting)
│   └── Dockerfile      # Nginx configuration for containerization
└── README.md           # Documentation
```

## 📝 License

This project is open source and available under the [MIT License](LICENSE).