console.log("already using typescript");

/**
 * Cageify is a class that replaces all images with Nicolas Cage.
 */
class Cageify {
  private readonly CAGE_URLS: string[];

  // RI:
  // CAGE_URLS is not empty array
  // CAGE_URLS consists of non empty stings
  // CAGE_URLS strings are valid urls
  // AB: { c | CAGE_URLS[i] 0 < i < CAGE_URLS.length }

  constructor(urls: string[]) {
    this.CAGE_URLS = urls;
    this.checkRep();
  }

  getRandomCageUrl(): string {
    return this.CAGE_URLS[Math.floor(Math.random() * this.CAGE_URLS.length)];
  }

  replaceImage(img: HTMLImageElement) {
    const randomImage = this.getRandomCageUrl();
    img.src = randomImage;
  }

  checkRep() {
    console.assert(this.CAGE_URLS.length !== 0, "CAGE_URLS must not be empty");

    for (const url of this.CAGE_URLS) {
      console.assert(
        url.length !== 0,
        "CAGE_URLS must not contain empty strings"
      );
      console.assert(
        url.startsWith("https://"),
        "CAGE_URLS must contain valid urls"
      );
    }
  }
}

const cageify = new Cageify([
  "https://uproxx.com/wp-content/uploads/2022/04/con-air-nic-cage-feat.jpg?w=640",
  "https://phantom-marca.unidadeditorial.es/6b6aba2a4b0d54af863f41b668c4f8d3/resize/828/f/jpg/assets/multimedia/imagenes/2023/11/05/16991691937600.jpg",
  "https://images.fineartamerica.com/images/artworkimages/mediumlarge/3/nicolas-shrek-cage-nicholas-cage-funny-wall-art-print-nic-cage-funny-gift-fathers-day-ag-family.jpg",
  "https://static1.srcdn.com/wordpress/wp-content/uploads/2021/02/Nicolas-Cage-in-The-Family-Man.jpg",
  "https://u-mercari-images.mercdn.net/photos/m58440470289_1.jpg",
]);

Object.values(document.getElementsByTagName("img")).map((img) => {
  cageify.replaceImage(img);
});

const callback = (records: MutationRecord[]): void => {
  for (let record of records) {
    for (let node of record.addedNodes) {
      if (node.nodeName === "IMG")
        cageify.replaceImage(node as HTMLImageElement);

      if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as Element; // Cast to Element
        const nestedImages = element.querySelectorAll("img");
        // console.log(`Node ${element.nodeName} added, found ${nestedImages.length} nested images.`); // Debug
        nestedImages.forEach((img) => cageify.replaceImage(img));
      }
    }
  }
};

new MutationObserver(callback).observe(document.body, {
  childList: true,
  subtree: true,
});
