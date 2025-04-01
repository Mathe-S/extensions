# Instructions: Build the "Cageify" Chrome Extension (TypeScript Version)

**Goal:** Create a simple Chrome extension that replaces all images on webpages with pictures of Nicolas Cage. This exercise uses TypeScript for improved type safety, demonstrates Content Scripts, and highlights basic state management (the list of Cage URLs) related to Reading 7 concepts (Rep Value, AF, RI).

**Prerequisites:**

- Developer Mode enabled in Chrome Extensions:
  1.  Open Chrome and navigate to `chrome://extensions`.
  2.  In the top-right corner, toggle on "Developer mode".

**Steps:**

**1. Project Setup:**

- Navigate _into_ the `cageify` folder using the `cd` command (e.g., `cd path/to/cageify`).

- **Initialize npm:** Run the following command. This creates a `package.json` file to manage project dependencies and scripts.

  ```bash
      npm init -y
  ```

- **Install Dependencies:** Run the following command to install TypeScript and the type definitions for the Chrome extension APIs as development dependencies (they are needed for building, not running the extension itself).

  ```bash
      npm install --save-dev typescript @types/chrome
  ```

- **Create Source Folder:** Create a folder named `src` inside `cageify`. Your TypeScript code (`.ts` files) will go here.

  ```bash
      mkdir src
  ```

**2. Configure TypeScript (`tsconfig.json`):**

- In the root of your `cageify` folder (the same level as `package.json` and `src`), create a new file named `tsconfig.json`.
- Paste the following configuration into `tsconfig.json`. This tells the TypeScript compiler how to build your project.

  ```json
  {
    "compilerOptions": {
      "strict": true, // Enable strong type checking
      "module": "ESNext", // Use modern JavaScript modules
      "target": "ES2017", // Output modern JavaScript syntax
      "outDir": "./dist", // Put compiled JS files in a 'dist' folder
      "rootDir": "./src", // Look for TS source files in 'src'
      "moduleResolution": "node", // Standard module resolution
      "esModuleInterop": true, // Improve compatibility between module types
      "forceConsistentCasingInFileNames": true // Avoid case sensitivity issues
    },
    "include": [
      "./src/**/*" // Compile all .ts files within the src directory
    ],
    "exclude": [
      "node_modules" // Don't try to compile dependencies
    ]
  }
  ```

**3. Create the Manifest File (`manifest.json`):**

- In the root of your `cageify` folder, create `manifest.json`.
- Copy and paste the following code. **Note the path in `content_scripts.js` points to the `dist` folder where the compiled JavaScript will be.**

  ```json
  {
    "manifest_version": 3,
    "name": "Cageify Images (TS)",
    "version": "1.0",
    "description": "Replaces all images with Nicolas Cage (TypeScript version).",
    "permissions": [],
    "content_scripts": [
      {
        "matches": ["<all_urls>"],
        "js": ["dist/content.js"],
        "run_at": "document_idle"
      }
    ]
  }
  ```

**4. Write the TypeScript Content Script (`src/content.ts`):**

- Inside the `src` folder, create a new file named `content.ts`.
- Copy and paste the following TypeScript code:

  ```typescript
  console.log("Cageify TS Content Script Loaded!");
  // --- State Representation ---
  // Representation Value (Rep Value):
  // An array of strings, holding Nic Cage image URLs. Typed as string[].
  // This array IS the "inside stuff" holding the pool of replacement images.
  const CAGE_URLS: string[] = [
    "https://uproxx.com/wp-content/uploads/2022/04/con-air-nic-cage-feat.jpg?w=640",
    "https://phantom-marca.unidadeditorial.es/6b6aba2a4b0d54af863f41b668c4f8d3/resize/828/f/jpg/assets/multimedia/imagenes/2023/11/05/16991691937600.jpg",
    "https://images.fineartamerica.com/images/artworkimages/mediumlarge/3/nicolas-shrek-cage-nicholas-cage-funny-wall-art-print-nic-cage-funny-gift-fathers-day-ag-family.jpg",
    "https://static1.srcdn.com/wordpress/wp-content/uploads/2021/02/Nicolas-Cage-in-The-Family-Man.jpg",
    "https://u-mercari-images.mercdn.net/photos/m58440470289_1.jpg",
  ];

  // --- Abstraction Function (AF) ---
  // AF(CAGE_URLS: string[]) = The abstract set of available Nic Cage image URLs
  //                 {url1, url2, ...} that can be used for replacement.
  // It maps the concrete array (Rep Value) to the conceptual pool (Abstract Value).

  // --- Rep Invariant (RI) ---
  // Rules the CAGE_URLS array (the Rep Value) must obey:
  // 1. CAGE_URLS must be an array.
  // 2. CAGE_URLS must not be empty.
  // 3. Every element in CAGE_URLS must be a non-empty string.
  // 4. Every element should ideally be a valid URL format.

  /**
   * Checks if the CAGE_URLS array satisfies the Rep Invariant.
   * Helps catch errors early if our internal state is invalid.
   * @returns {void} Throws assertion error if RI fails.
   */
  function checkRep(): void {
    console.assert(
      Array.isArray(CAGE_URLS),
      "RI Fail: CAGE_URLS is not an array."
    );
    console.assert(CAGE_URLS.length > 0, "RI Fail: CAGE_URLS is empty.");
    for (const url of CAGE_URLS) {
      console.assert(
        typeof url === "string" && url.length > 0,
        `RI Fail: Invalid URL entry: ${url}`
      );
    }
    // console.log("Cage URL Rep check passed.");
  }

  /**
   * Returns a random URL from the CAGE_URLS array.
   * Assumes checkRep() has passed.
   * @returns {string} A random Nic Cage image URL.
   */
  function getRandomCageUrl(): string {
    const randomIndex = Math.floor(Math.random() * CAGE_URLS.length);
    return CAGE_URLS[randomIndex];
  }

  /**
   * Replaces the src of a single image element with a Cage URL.
   * @param {HTMLImageElement} imgElement The image element to modify.
   */
  function cageifyImage(imgElement: HTMLImageElement): void {
    // Optional: Avoid re-processing images already set by this script?
    // Could add a data attribute: if (imgElement.dataset.cageified) return;

    const newSrc = getRandomCageUrl();
    // console.log(`Cageifying: ${imgElement.src.substring(0, 50)}... -> ${newSrc}`); // Verbose logging
    imgElement.src = newSrc;
    imgElement.srcset = ""; // Clear srcset to ensure src is used
    // imgElement.dataset.cageified = 'true'; // Mark as processed
  }

  /**
   * Processes a node to find and cageify images within it.
   * Checks if the node itself is an image, or searches its descendants.
   * @param {Node} node The node to process.
   */
  function processNode(node: Node): void {
    // 1. Check if the added node itself is an image
    if (node.nodeName === "IMG") {
      cageifyImage(node as HTMLImageElement);
    }

    // 2. Check if the added node is an element that might *contain* images
    //    (We need to check nodeType because node could be a text node)
    else if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as Element; // Cast to Element
      const nestedImages = element.querySelectorAll("img");
      // console.log(`Node ${element.nodeName} added, found ${nestedImages.length} nested images.`); // Debug
      nestedImages.forEach((img) => cageifyImage(img));
    }
  }

  // --- Main Logic ---
  try {
    // *** Check the Rep Invariant at the start ***
    // Ensures our internal state (the URL list) is valid before we use it.
    checkRep();

    // Find all image elements on the page using DOM types
    const images: HTMLCollectionOf<HTMLImageElement> =
      document.getElementsByTagName("img");
    console.log(`Cageify TS found ${images.length} images. Replacing...`);

    // Loop through each image and replace its source
    for (let i = 0; i < images.length; i++) {
      const img: HTMLImageElement = images[i]; // Get the specific image element
      const newSrc = getRandomCageUrl();
      img.src = newSrc; // Set the 'src' attribute
    }
    console.log("Cageify TS replacement complete!");

    // *** 3. Set up MutationObserver to Watch for Future Changes ***

    // Define the callback function that runs when mutations are observed
    const observerCallback: MutationCallback = (mutationsList) => {
      // console.log(`MutationObserver triggered: ${mutationsList.length} mutations.`); // Can be noisy
      for (const mutation of mutationsList) {
        // We only care about nodes being added
        if (mutation.type === "childList") {
          // Process each node that was added
          mutation.addedNodes.forEach((node) => {
            processNode(node);
          });
        }
      }
    };

    // Create an observer instance linked to the callback function
    const observer = new MutationObserver(observerCallback);

    // Configuration for the observer:
    const config: MutationObserverInit = {
      childList: true, // *** Observe additions/removals of child nodes ***
      subtree: true, // *** Observe the target node AND all its descendants ***
    };

    // Start observing the document's body for mutations matching the configuration
    // Watching document.body usually captures most dynamically added content.
    observer.observe(document.body, config);
  } catch (error: unknown) {
    // Catch errors, including assertion failures from checkRep
    if (error instanceof Error) {
      console.error("Cageify TS Error:", error.message);
    } else {
      console.error("Cageify TS encountered an unknown error:", error);
    }
  }
  ```

**5. Add a Build Script (Optional but Recommended):**

- Open your `package.json` file (in the root `cageify` folder).
- Find the `"scripts"` section (or add one if it doesn't exist).
- Add a `"build"` script like this:

  ```json
  // Inside package.json
  "scripts": {
    "build": "tsc",
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  ```

  - Save `package.json`. Now you can simply run `npm run build` in your terminal instead of `npx tsc`.

**6. Build the Extension:**

- Open your terminal in the root of the `cageify` folder.
- Run the build command:

  ```bash
      npm run build
  ```

**7. Load the Extension into Chrome:**

- Go back to the `chrome://extensions` page in your browser.
- Make sure "Developer mode" is still enabled (top-right).
- Click the "Load unpacked" button (usually top-left).
- Navigate to and select the **entire `cageify` folder** (the one containing `manifest.json`, `src`, `dist`, `node_modules`, etc.).
- The "Cageify Images (TS)" extension should appear. If there are errors loading it (e.g., manifest issues), Chrome will display them here.

**8. Test the Extension:**

- Open a new tab and navigate to a website with lots of images (e.g., Google Image Search, a news homepage).
- All images should be replaced with random Nicolas Cage pictures from placecage.com!

- Open the browser's Developer Tools on the webpage (Right-click -> Inspect -> Console tab). You should see the "Cageify TS Content Script Loaded!" message and potentially messages about the number of images replaced. You \*should not\* see any "RI Fail" errors unless you intentionally broke the `CAGE_URLS` array.

**9. Development Cycle (Making Changes):**

- If you want to modify the TypeScript code (`src/content.ts`):
  1. Make your changes and save the file.
  2. **Re-run the build:** Go to your terminal and run `npm run build`.
  3. **Refresh the extension:** Go to `chrome://extensions` and click the refresh icon (🔄) for the "Cageify Images (TS)" extension.
  4. **Reload the webpage:** Go back to the webpage you were testing on and reload it (Ctrl+R or Cmd+R).

**Troubleshooting:**

- **Build Errors:** If `npm run build` fails, read the TypeScript error messages in the terminal carefully. They often point to type errors or syntax issues in your `.ts` file.
- **Extension Load Errors:** Check for typos in `manifest.json`, especially the path `"dist/content.js"`.
- **Images not changing?** Check the browser console on the target webpage for errors. Ensure you completed steps 9.2, 9.3, and 9.4 after making code changes. Check that the `content_scripts.matches` pattern in the manifest is correct (`<all_urls>`).
- **`Cannot find module` or type errors?** Ensure `npm install` completed without errors and that your `tsconfig.json` is correct.

**Congratulations! You've built the Cageify Chrome Extension using TypeScript, leveraging type safety and clearly documenting state management concepts like Rep Value, AF, and RI!**
