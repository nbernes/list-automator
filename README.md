# List Automator

Simple chrome extension to automate tasks on lists of items in web apps.

## Installation

1. In the root directory, run `./build.sh`.
2. **Install the extension in your browser**:
Follow the steps outlined [here](https://developer.chrome.com/docs/extensions/mv3/getstarted/development-basics/#load-unpacked) to load the unpacked extension (you must select the extension directory **./extension**) and activate it.
3. Start a development server for the web app you wish to test the automation on, on localhost:4200
4. Head to localhost:4200 and follow the steps outlined by the bot.

## Project structure

```
.
├── ...
├── bot                   # Angular app (bot UI)
├── extension             # Chrome extension
│   ├── ...
│   ├── manifest.json     # Defines the extension metadata and functionality
│   ├── src/js            # Extension logic
│   │   ├── background.js # Background script, used for message passing
│   │   └── content.js    # Content script, used for DOM manipulation
│   ├── src/css
│   │   └── content.css   # CSS used by content.js
│   └── ...
└── ...
```
