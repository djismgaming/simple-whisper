# Simple-Whisper (vibe-coded)

This is a simple, [vibe-coded](session-ses_4946.md), webUI for a whisper.cpp server. It allows users to upload a video/audio file and get the output text from the server.

The inference is done using the whisper.cpp server running on `localhost:8080/v1/audio/transcriptions`.

## Running in Windows

Have a [whisper-server](https://github.com/ggml-org/whisper.cpp) run with a similar config to this one. Change the `PORT` variable to match the port you want to use.

Model files can be downloaded from [Hugging Face](https://huggingface.co/ggerganov/whisper.cpp).

```pwsh
$env:RESPONSE_FORMAT = "TXT"
C:\Users\<user>\apps\whispercpp\whisper-server.exe `
      --host 127.0.0.1 `
      --port ${PORT} `
      -m C:\Users\<user>\apps\whispercpp\models\ggml-small.bin `
      --request-path /v1/audio/transcriptions `
      --inference-path "" `
      --convert `
      -l auto `
      -pp `
      -pr `
```
