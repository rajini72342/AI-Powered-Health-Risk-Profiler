To run this application locally in Visual Studio Code, follow these steps:
1. Open the Project
Open VS Code and use File > Open Folder... to select the directory containing your index.html, index.tsx, and other files.
2. Use the "Live Server" Extension (Recommended)
Since the app uses ES modules and an importmap, it needs to be served over http:// or https:// rather than just opening the file directly (which uses file:// and causes CORS issues).
Go to the Extensions view in VS Code (Ctrl+Shift+X).
Search for and install "Live Server" (by Ritwick Dey).
Open index.html in your editor.
Click the "Go Live" button in the bottom right corner of the VS Code status bar.
Your browser will automatically open the application at http://127.0.0.1:5500.
3. Alternative: Using a Terminal
If you prefer the command line, you can use any static file server. Open the VS Code integrated terminal (`Ctrl + ``) and run one of the following:
Node.js (npx):
code
Bash
npx serve .
Python 3:
code
Bash
python -m http.server 8000
Then, open your browser and navigate to the address provided (e.g., http://localhost:3000 or http://localhost:8000).
Important Notes:
API Key: The application expects the Gemini API key to be available in the environment. If you are running locally outside of a specific environment that injects process.env.API_KEY, you may need to temporarily replace process.env.API_KEY in services/geminiService.ts with your actual key string for testing (but never commit it to a public repository).
Camera Access: If you use the "Scan Document" feature, ensure you are accessing the site via localhost or https, as browsers block camera access on non-secure http origins.
