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
