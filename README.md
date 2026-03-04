
# StreamElements Chat Widget Mod (Twitch)

This project is a custom modification of the native StreamElements chat widget for Twitch, designed to enhance chat display and add advanced features for stream overlays.


## Features
- **Threaded message grouping:** Consecutive messages from the same sender are visually grouped, with start/end styling and dynamic display of sender info.
- **Markdown-like formatting:** Supports headings, bold, italics, strikethrough, inline code, and custom disclaimer styling directly in chat messages.
- **Auto-hide and animation:** Messages fade out after a configurable timeout, with smooth entry/exit animations.
- **Responsive and clean UI:** Modern, customizable look for embedding in stream overlays.


## Usage

1. Add this widget as a custom browser source in your streaming software (e.g., OBS, Streamlabs) by pointing to the `src/index.html` file.
2. Configure StreamElements to use this custom widget if needed, or replace the default chat widget files with these.
3. No OAuth or manual connection is required—this widget is designed to work within the StreamElements overlay system.


## File Structure
- `src/index.html` — Widget HTML template and chat message layout
- `src/script.js` — Main logic for message grouping, markdown parsing, and event handling
- `src/style.css` — Custom styles for chat appearance, threads, and animations
- `images/` — (Optional) Images used in the project


## Customization
- Edit `style.css` to change colors, fonts, and layout.
- Extend `script.js` to add more chat features (emotes, moderation, custom rules, etc).


## License
MIT
