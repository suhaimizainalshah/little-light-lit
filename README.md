# Booth: free photo editor and passport photo maker

One file (`index.html`), no account, no server. Photos are edited inside your browser and never uploaded anywhere.

## What it does
- **Open** by button, drag and drop, or paste (Ctrl+V).
- **Crop** freely or to Square, 4:5, 3:2, 4:3, 16:9, 9:16 or the original shape.
- **Rotate** left/right and **flip** horizontally/vertically.
- **Adjust** brightness, contrast, saturation, warmth and vignette.
- **17 filters** including Greyscale, Black & white, Monochrome, Sepia, Noir, Vintage, Duotone, Cyanotype, Retro and Pop art, with a strength slider.
- **Text** in 23 popular fonts, with colour, size, alignment, bold, italic, outline, shadow and label background. Drag to place.
- **Remove background** with AI that runs on your device, then fill with white, grey, blue, black or any colour, or keep it see-through.
- **Resize** by pixels or percentage, with proportions locked.
- **Passport and ID photos** for the US, UK, Schengen/EU, Singapore, Malaysia, India, Australia, Canada, China, Japan or a custom size, with a face guide and print sheets for 4×6 in, 5×7 in or A4 paper.
- **Compress and resize many photos at once:** drop in a whole folder, pick a size (longest side, width or percentage), format and quality, or keep every file under a limit such as 200 KB. See the saving for each photo and download them all as one ZIP. Camera and location data are removed.
- **Save** as PNG, JPG, WebP (and AVIF where the browser supports it), choose quality and size, or keep the file under a limit such as 240 KB for online applications. Copy to clipboard or share on phones.
- Undo/redo (Ctrl+Z / Ctrl+Shift+Z), hold **Compare** to see the original, **Start over** anytime.

## Visitor and save counts
Booth counts visits and saves anonymously with the free [Abacus](https://abacus.jasoncameron.dev) counter: no cookies, no names, no tracking across sites, and nothing is counted for visitors whose browser sends *Do Not Track* or *Global Privacy Control*. To see your totals, add `#stats` to your site address, for example `https://your-site.example/#stats`. Change `COUNTER.ns` near the top of the script to a name only you use, or set `COUNTER.on` to `false` to switch counting off.

Click the Booth logo at any time to go back to the start.

## Good to know
- **Background removal needs the internet the first time.** It downloads an AI model (tens of MB) from IMG.LY's servers; your browser caches it after that. The photo itself is processed on your device.
- The background-removal library (`@imgly/background-removal`) is licensed under **AGPL-3.0**. Free personal and non-commercial use is fine. If you ever turn Booth into a commercial product, review that licence or swap the library.
- Very large photos are reduced to 4096 px on the longest side for smooth editing.
- Passport rules differ by country and change. Always check the official requirements before you submit. Print sheets at 100% size, not "fit to page".
- iPhone HEIC photos open fine on iPhone/Safari. On other browsers, export them as JPG first.

## More studios
Switch between them with the tabs at the top of every page.

**Photo (`index.html`)** also has: Auto enhance; exposure, highlights, shadows, vibrance and tint; sharpen, soften and film grain; borders in any colour and rounded corners.

**Video (`video.html`):**
- Timeline with trim (drag clip ends), split (S), duplicate, reorder by dragging, undo and redo.
- Speed from 0.25× to 4×; photo slideshows with an optional slow zoom; freeze frame; snapshot of any frame.
- Transitions between clips: crossfade, fade through black or white, slide, slide up, wipe, zoom and circle, with adjustable length, on one clip or every clip.
- Per-clip colour looks (B&W, sepia, vintage, warm, cool, vivid, noir) plus brightness, contrast and saturation; zoom, reposition, rotate and mirror to reframe (for example landscape to vertical).
- Sound: per-clip volume with fade in and out; detach a clip's sound to the audio lane; several audio tracks (music, sound effects, detached sound); record a voiceover from the microphone; sound tools: remove vocals (karaoke), isolate voice, clearer speech, remove low rumble, reduce hiss, boost bass.
- Titles with five fonts and fade, pop, slide-up and typewriter animations.
- Export as video (MP4 where supported, otherwise WebM), animated GIF, audio only (M4A or WebM), or a PNG frame.

**Audio (`audio.html`):** open any audio file, or a video file to extract its sound; record from the microphone; zoomable waveform with drag-to-select; keep only the selection, delete, silence, insert silence, add a file at the end or mix one in at the playhead; fade in and out, normalise, reverse, reduce background noise, clearer speech, remove vocals, isolate voice; volume, speed, bass/middle/treble, echo, reverb and compression; loop playback of a selection; undo and redo; export MP3 (128, 192 or 320 kbps) or WAV, or send the result straight to the Video editor.

**Find music (Video and Audio studios):** links to official trend charts (TikTok Creative Center, YouTube Charts, Shazam, Spotify Charts) and free music libraries (YouTube Audio Library, Pixabay Music, Free Music Archive, Freesound, Incompetech), plus a credit-line maker. In the Video editor each audio track has a credit field, a button to show the credit at the end of the video, and "Copy music credits" in Export.

About trending sounds and copyright: naming a song in a caption or a file's details is good practice but does not give permission to use it. Trending sounds on TikTok, Instagram and YouTube Shorts are licensed for use inside those apps, so the safe route is to export from Booth without that song and add it in the app when posting. Booth does not download audio from YouTube or other sites: that breaks their terms of service and usually copyright. For your own YouTube uploads, download the file from YouTube Studio and open it in Booth.

**360° (`360.html`):** opens stitched 360 photos and videos and stitches raw dual-lens files (for example Samsung Gear 360). Level the horizon, set the starting direction, adjust brightness, contrast, saturation and warmth, add a vignette to views, and hide the tripod with a colour patch or your logo. Views: 360, little planet, tunnel and flat. Save 360 photos with Facebook/Google metadata, pictures of the current view, spin-around and spinning-planet videos from photos, 360 videos and flat videos of one view.

**3D (`3d.html`):** cubes, spheres, cylinders, cones, rings, panels and 3D text; open GLB, glTF, OBJ, STL and PLY; move, rotate and resize with handles, exact numbers or exact sizes in millimetres; snap; mirror; make copies in a row or a circle; Shift-click several objects and group them; colours, finishes, pictures on surfaces and faceted shading; realistic reflections; undo and redo; export GLB, STL (3D printing), OBJ, USDZ (AR on iPhone and iPad), a PNG picture or a turntable video.

### Honest limits
- Exports that involve video or animation record in real time: a 2-minute video takes about 2 minutes.
- "Remove vocals" cancels sound panned to the centre of a stereo mix. It works on many songs but isn't the AI stem separation paid tools use, which needs downloads of several hundred megabytes and powerful hardware.
- iPhone HEVC videos may not play in Chrome on Windows; export them as H.264 MP4 first.
- 3D text supports English letters, numbers and common symbols.

3D and 360 use three.js r169 (MIT), included in `vendor/three/`. MP3 export uses lamejs 1.2.1 (LGPL-3.0), included in `vendor/lamejs/`.

## Design (Canva-style layouts, Photoshop-style retouching)
`design.html` is a layout studio:
- **Ready sizes:** Instagram post, story, YouTube thumbnail, LinkedIn post and banner, presentation slide, A4 poster, A5 flyer, business card, X post, or a custom size. Six starter templates.
- **Layers:** text (six fonts, spacing, caps, highlight boxes), eight shapes with gradient fills, 30 icons and illustrations, characters from the Animate people builder, photos and QR codes. Drag, resize, rotate, snap to centre and edges, align, reorder, lock and hide.
- **Effects and blending:** opacity, 14 blend modes, shadow, outline and glow.
- **Photo tools:** erase and restore brushes, clone stamp (Alt- or Shift-click a source), healing brush, remove a colour by click (touching or everywhere), AI background removal (downloads its model the first time), 2× enlargement, adjustments (brightness, contrast, saturation, hue, blur, black and white, warm vintage), frames (rounded, circle, arch) and flip.
- **Resize to another format** in one click, with everything rescaled and kept inside the edges.
- **Brand kit:** your colours and heading and body fonts, saved in this browser.
- **Download** as PNG, JPG, PDF (print sizes for A4 and A5) or transparent PNG, or as a phone, laptop, tablet or framed-poster mockup. Save and open projects as a file.
- QR codes use the MIT-licensed `qrcode-generator` library in `vendor/qrcode/`, loaded only when you add a QR code.

## Lessons (interactive video lessons)
`lesson.html` turns any video into a lesson, similar to Edpuzzle, without student accounts or servers.
- **Use a video file** (the lesson works offline) **or a YouTube link** (a tiny lesson file; students need internet).
- **Add, at any moment:** multiple-choice questions (one or several correct answers, feedback for right and wrong), open questions, polls and pop-up notes with an optional link.
- **Skipping control:** choose **Allow skipping**, **Rewind only** (the default: students can go back, but not past what they have watched) or **Watch straight through** (no skipping or rewinding). When skipping is restricted, set the **fastest playback speed** (1×, 1.5×, 2× or any), so speeding up can’t be used to skip; the browser’s built-in video controls, right-click video menu and Picture-in-Picture are blocked, and students see which rule applies. Your own jumps and choices always work. **Let students move freely after they finish** can be turned off to keep the rules after the end screen. YouTube lessons follow the same rules.
- **Settings:** “watch that part again”, up to three tries, show correct answers, shuffle answer order, ask for name and class, hand-in instructions, captions (.vtt or .srt) for video-file lessons, and a pass mark for SCORM.
- **Student interface in six languages:** English, Bahasa Melayu, Chinese, Tamil, Bahasa Indonesia and Vietnamese.
- **Students can pick up where they left off:** progress is saved on their device.
- **Preview as a student** before sharing.

### Building and editing
- **Undo and redo** every change (Ctrl+Z and Ctrl+Shift+Z, or the header buttons).
- **Move questions and notes** by dragging their markers on the timeline (the video follows), with the nudge buttons (−1 s, −0.1 s, +0.1 s, +1 s), “Use current time”, or Alt + ← →. “Play from here” checks the timing. In branching stories, move an item to another clip.
- **Colour-coded markers** by type, with a legend. Unfinished questions show “!” on the timeline and ⚠ in the list, with a note on what’s missing.
- **Autosave:** the lesson is kept in the browser as you work. If the tab closes, “Carry on with…” reopens it; choose the video files again to continue.
- **Shortcuts:** Space play or pause, ← → skip 5 s, Delete removes the selected item, Esc deselects.

### For students
- After a multiple-choice answer, the feedback shows briefly and the question closes by itself, with a draining bar; a click anywhere or Enter continues sooner. Polls close after a short thank-you, and open answers close straight away with a “Saved” message.
- Notes can be closed with ✕, a click outside, Esc or “Continue”, and can close by themselves after a set time. Questions can’t be dismissed by an accidental click.
- Number keys pick answers; Enter submits or continues (Ctrl+Enter in long answers).

### Branching stories (choose your own adventure)
- **Several clips per lesson:** add as many video files as you like, name them, and reorder them.
- **Choice that jumps:** at any moment, pause the video and offer options that each jump to a clip, carry on, or end the lesson. Tick “best choice” on any option to score the decision.
- **What happens when a clip ends:** go to the next clip, end the lesson, or jump to any clip, which allows loops back and several endings. Choices appear again when a student returns to a scene.
- **Story map:** shows every path and warns about clips that no path reaches.
- **Leonardo.ai prompt helper:** describe the character, setting and visual style once, add what happens in each clip, and copy matching prompts for Leonardo’s video tool. Download the clips from Leonardo, then add them to the lesson. Check Leonardo’s terms for your plan before publishing clips.
- **Results:** each student’s path and ending are recorded, with an “Endings reached” chart and the path in the CSV. Students’ first choice counts for scoring unless retries are allowed.
- Branching works with video files in the student lesson, SCORM and SLS packages; YouTube lessons use a single video.

### Jumps, 360° video and replaying
- **Jump to a time in the same clip:** a “Choice that jumps” option can go to any time in the current clip, as well as to another clip, carry on, or end the lesson. This suits one video stitched together from several scenes.
- **Jump points:** a marker that jumps silently when the video reaches it, with no question, to a time, a clip or the end. Use them at the end of each scene so every path reaches the right place. Markers only trigger when playback passes them, never when a jump lands nearby, and choices after the landing point ask again. A warning appears if a jump point would loop onto itself.
- **360° video:** tick “is a 360° video” for any video-file clip (2:1 equirectangular, as exported by Insta360 or Ricoh Theta apps). Students drag, scroll or use the arrow keys to look around, with a Reset view button; questions and notes appear as normal cards. The viewer is built into the lesson, so no extra files are needed, and it works in student lessons, SCORM and SLS packages. When a lesson is opened directly from a file on the computer, some browsers block the full 360° view, so it switches to a panorama view you can still drag. YouTube 360° videos work as usual through YouTube’s own player.
- **After the end:** the final screen can be closed (✕ or Esc) to move freely through the video, or students can choose **Watch again** (keeps their answers and original path for marking) or **Start over** (clears everything on this device).

### Ways to share and collect answers
- **Student lesson file:** one HTML file (YouTube) or a ZIP with `lesson.html` and the video. Students hand in an answers file, an answers code, an email to the teacher’s address (opens their email app with a summary and the code), or automatically to the teacher’s own Google Sheet through the provided Apps Script, which can also email each submission.
- **SCORM 1.2 package:** for Moodle, Canvas, Blackboard, Brightspace and offline Moodle devices. Reports the student’s score, pass or fail against the pass mark, time spent and each answer as a SCORM interaction.
- **Singapore Student Learning Space (SLS) package:** for video-file lessons. A ZIP with `index.html` at the root, the video and the ADL xAPI Wrapper v1.11.0 (Apache 2.0 licence, in `vendor/xapi/`), following MOE’s published method for HTML5 content. Upload it as an Integrated Scorable Response question and set the maximum marks to the number of multiple-choice questions; the score is the number answered correctly. SLS packages must stay under 500 MB and can’t use YouTube.
- **Embed on a website:** after putting the student lesson file online, copy an embed code; YouTube lessons can also be pasted whole into Google Sites.

### Results
Add answers files or codes to see each student’s score and how much they watched, the class’s answers to every question (questions under 60% are flagged), all written answers, and a CSV download. Files changed after a student finished are flagged as possibly edited. Results stay in the browser tab.

## Animate (whiteboard and cartoon explainers)
`animate.html` makes explainer videos in two styles, which you can mix scene by scene:
- **Whiteboard drawing:** a hand sketches each item in line art, then it colours in. Text is written line by line, and photos are traced as outlines before they fade in.
- **Cartoon:** full-colour scenes with characters walking, popping or sliding in, talking mouths and waving arms.
- **People builder:** design any character with 6 skin tones, 7 hairstyles including a hijab, hair colours, tops (T-shirt, collared shirt, blazer, dress), bottoms, glasses and facial hair; then pick one of 6 poses and 6 expressions. Save characters to reuse in any scene.
- **30 props** (ideas, charts, money, devices, buildings, symbols and more) and **9 backgrounds** (whiteboard, chalkboard, paper, classroom, office, park, city, night sky).
- Scenes with lengths and transitions (cut, fade, wipe), music and voiceover tracks, three shapes (16:9, 9:16, 1:1), and export to MP4 or WebM.
- Save and open projects as a file. All art is drawn in code, so the studio stays small and works offline once loaded.

### Realistic drawing (Animate)
- **Stroke-by-stroke handwriting:** three single-line pen fonts (casual, script and print), adapted from the EMS fonts by Evil Mad Scientist Laboratories (SIL Open Font License; licence text is kept at the top of each file in `vendor/strokefonts/`). The hand writes each letter along its real strokes.
- **Shape-following drawing:** characters and props are drawn along their actual outlines in order, then the colour fades in.
- **Import SVG illustrations** (for example Open Peeps, Humaaans or unDraw, which are free to use): the hand traces every path of the drawing.
- **Hands:** marker, pen or chalk in six skin tones, your own hand photo (PNG with transparency, with adjustable pen-tip position), or no hand.
- **Full HD 1080p** export by default, or HD 720p for smaller files.

## Remove silences
- **Audio studio:** “Remove silences” finds pauses, shows them in red on the waveform, then cuts them with smooth joins. Set the quiet level (or let Booth choose it), the shortest pause to cut, and how much pause to leave.
- **Video studio:** choose a pace (Natural, Tight or Very tight), then remove silences from one clip or every clip. Clips are split around the pauses, and Undo restores everything.

## Opening files
- **Drag and drop anywhere:** drop files anywhere on any studio page, not just the empty area. A large drop target shows what will happen, and files that a studio can’t open are rejected with a short explanation.
  - Photo: drop one image to edit it, or several to compress or resize them together.
  - Video: videos and photos go on the video track; music and sounds go on the audio track.
  - Audio: drop audio, or a video to extract its sound. Hold Shift while dropping to add a file to the end.
  - 360°: drop a 360 photo or video.
  - 3D: drop GLB, glTF, OBJ, STL or PLY models, or a picture to put on the selected object.
- You can still use the Open buttons, and paste a photo with Ctrl+V in the photo editor.

## Keyboard
- **Enter confirms:** in every save or export window, Enter runs the main action (Download, Export video, Download MP3, GLB) instead of closing the window. Press Escape to close.
- Inputs that go with a button, such as “Silence to insert”, also run that button on Enter.

The new studios must be opened from a website or a local server, not by double-clicking the file, because browsers block their modules on file:// pages.

## Compact mode
The **Compact** button in the header (or Ctrl+\ on Windows, Cmd+\ on a Mac) hides the side panel so the work area gets the full width, which helps in narrow windows. The panel then slides in as a drawer: open it from the header button, the **Tools** tab on the right edge, or by choosing a tool in the left rail, and close it with Esc, ✕ or a click outside. The choice is remembered in the browser. The code is in `assets/compact.js`.

## Studio menu and header on smaller screens
The studio menu shows as many studios as fit, always whole, and moves the rest into **More ▾**, with a one-line description of each. The current studio always stays visible; on very narrow screens the menu becomes a single button named after it (for example **Photo ▾**) that lists every studio. When space runs short, header buttons switch to icons first, and on phones secondary actions move into a **⋯** menu, while undo, redo and the main save or export button stay visible. Menus work with the keyboard (arrow keys and Esc). The code is in `assets/nav.js`.

## Cropping to exact sizes (Photo)
While cropping, the current size is shown inside the crop box and in the side panel, with width, height and position fields you can type into. **Exact size** presets (1280 × 800, 1920 × 1080, 1080 × 1080, 1080 × 1350, 1200 × 630, 1584 × 396) or your own numbers lock the crop to that shape and produce a photo of exactly that size. If the selection is smaller than the target, a note warns that it will be enlarged.

## Photo booth (photo strips)
`photobooth.html` turns any camera into a photo booth, in three steps.

1. **Snap:** choose **1 to 5 photos** and a countdown (3, 5 or 10 seconds), then press the shutter or Space. A large countdown, a soft flash and an optional shutter sound take each photo, with a short pause between them. Thumbnails show every photo, and any one can be **retaken**. The camera is mirrored like a real mirror (optional), and phones can switch between front and back cameras. No camera? Use up to five existing photos instead, or drop them onto the page.
2. **Style:** the strip updates live as you choose a **look** (colour, black and white, greyscale or sepia), a **background** (colour swatches, any colour, or your own image), a **layout** (vertical strip, row or grid), the space between photos, rounded corners, and an optional **caption** (clean, handwritten or classic lettering) with today’s date. Text switches between dark and white to stay readable.
3. **Share:** on phones, **Share** opens the phone’s share sheet for Instagram, WhatsApp, email and more. On computers, download a **PNG** (best quality) or **JPG** (smaller), **copy** the image to paste into an email or chat, or use **Email it**, which downloads the strip and opens your email app.

Photos are captured at 1200 × 900 each, so a four-photo strip is about 1,200 × 3,600 pixels, sharp enough to print. Everything happens on the device: the camera is used only after you allow it, nothing is uploaded, and the camera switches off when you leave the page. Clear messages explain what to do if camera access is blocked. Your choices (number of photos, timer, look, background and layout) are remembered in the browser.

## Pick a colour to make see-through (Photo)
In **Background**, besides the on-device AI remover, choose **Pick a colour from the photo** and click a colour (or type a hex code) to make it transparent. **Touching areas only** removes just the connected area you clicked, so the same colour elsewhere (such as white text inside a logo) is kept; **Everywhere in the photo** removes every matching pixel. Adjust **how similar** colours must be and **soft edges**, click again to remove more colours, then **Apply** or **Cancel**. The preview shows a checkerboard where the photo is see-through, and Undo works as usual. Save as PNG or WebP to keep the transparency.

## What the counters record (and don’t)
- **Recorded:** anonymous totals only. Each visit (once per browser session) or action, such as a download, share, copy or export, adds 1 to a named total like “Photo booth: strips shared”. Nothing else is sent: no file names, no file contents, no text you type, no page addresses, and no identifiers.
- **Never recorded:** your files, photos, documents or answers. Lessons and flipbooks you share with others contain no counters at all, so students and readers are never counted.
- **How it’s sent:** each count is a small web request to the free Abacus counting service. Like any website, that service can see the visitor’s IP address and browser type while handling the request; the app itself stores no personal data and sets no cookies. Only `sessionStorage` is used, to avoid counting the same visit twice in one session.
- **Opting out:** nothing is counted for browsers that send *Do Not Track* or *Global Privacy Control*. The owner can also stop counting their own visits with the switch on the `#stats` page.
- **For site owners:** mention the counter in your site’s privacy notice. To keep counts entirely on infrastructure you control, replace the Abacus address with your own counter, or switch counting off with `COUNTER.on = false`.

## Resizing by file size (Photo and Many photos)
In **Resize**, use **Or by file size** to make a photo fit a limit such as “under 500 KB”: type any number, choose **KB** or **MB**, pick **JPG**, **WebP** or **PNG**, and press **Make it this size**. Booth keeps the full pixel size and the highest quality that fits; if that isn’t enough, it makes the photo slightly smaller while keeping quality at 60% or more, because a slightly smaller sharp photo looks better than a blocky full-size one. The result shows the file size, pixel size and quality, with a download button. The **Save** window and **Many photos** offer the same limits (50 KB to 5 MB, or **Custom…** in KB or MB). Sizes use 1 MB = 1,000 KB, so files fit whether a form counts in thousands or in 1,024s. JPG and WebP make much smaller files than PNG.
