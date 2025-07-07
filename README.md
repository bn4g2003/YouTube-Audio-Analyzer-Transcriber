# YouTube Audio Analyzer & Transcriber

A simple command-line tool to download audio from YouTube videos, convert it to WAV format, and use the ElevenLabs API to transcribe speech to text.

## Features

-   **Download Audio from YouTube**: Downloads the highest quality audio stream from any YouTube video.
-   **Convert to WAV**: Automatically converts the downloaded audio to WAV format (16kHz, mono) for optimal compatibility with speech recognition services.
-   **Speech-to-Text**: Integrates with the ElevenLabs API to convert speech in the audio file to text.
-   **Store Results**: Saves both the processed WAV audio file and the resulting text file to a separate `output` directory.

## System Requirements

-   [Node.js](https://nodejs.org/) (version 14.x or higher recommended)
-   `npm` (usually installed with Node.js)
-   API Key from [ElevenLabs](https://elevenlabs.io/).

## Installation Guide

1.  **Clone the repository (if applicable) or download the source code.**

2.  **Navigate to the project directory:**
    ```sh
    cd youtube-analyzer-simple
    ```

3.  **Install the necessary dependencies:**
    Open a terminal and run the following command:
    ```sh
    npm install
    ```

## Configuration

Before running the application, you need to provide your ElevenLabs API Key.

1.  **Create a `.env` file** in the root directory of the project.

2.  **Add your API Key** to the `.env` file as follows:
    ```
    ELEVENLABS_API_KEY="YOUR_ELEVENLABS_API_KEY_HERE"
    ```
    Replace `YOUR_ELEVENLABS_API_KEY_HERE` with your actual API key.

## Usage

Run the script from the terminal using the `node index.js` command, followed by the URL of the YouTube video you want to analyze.

**Syntax:**
```sh
node index.js "YOUTUBE_VIDEO_URL"
```

**Example:**
```sh
node index.js "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
```

The execution process will display the ongoing steps in the terminal, from downloading and converting to completion and file saving.

## Output

The results will be saved in the `output` directory (automatically created if it doesn't exist) in the project's root directory:

-   `result_[timestamp].wav`: The converted audio file.
-   `result_[timestamp].txt`: The text file containing the transcribed content.

`[timestamp]` is a unique numerical string generated at the time of running the script to ensure that each result is not overwritten.
