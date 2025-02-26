document.addEventListener("DOMContentLoaded", () => {
  const booksContainer = document.getElementById("books-container");

  const imageFilenames = [
    "1q84.jpg",
    "Acceptance.jpg",
    "Anathem.jpg",
    "Annihilation.jpg",
    "Antimemetics.jpg",
    "Authority.jpg",
    "Axiomatic.jpg",
    "BBoD.jpg",
    "Diaspora.jpg",
    "Disquiet.jpg",
    "Infinite Jest.jpg",
    "Kafka.jpg",
    "Nausea.jpg",
    "Notes From Underground.jpg",
    "Permutation City.jpg",
    "Prime Intellect.jpg",
    "Quarantine.jpg",
    "Schilds Ladder.jpg",
    "Strange Code.jpg",
    "The Man Who Folded Himself.jpg",
    "The Stranger.jpg",
    "Three Stigmata.jpg",
    "Ubik.jpg",
  ];

  const links = [
    "https://www.goodreads.com/book/show/10357575-1q84?from_search=true&from_srp=true&qid=idWQGZw47V&rank=1",
    "https://www.jeffvandermeer.com/book/acceptance",
    "https://www.goodreads.com/book/show/2845024-anathem",
    "https://www.jeffvandermeer.com/book/annihilation",
    "https://www.goodreads.com/book/show/54870256-there-is-no-antimemetics-division?from_search=true&from_srp=true&qid=RMJvWA2zc3&rank=1",
    "https://www.jeffvandermeer.com/book/authority",
    "https://www.gregegan.net/",
    "https://www.goodreads.com/book/show/203578812-i-m-starting-to-worry-about-this-black-box-of-doom?ref=nav_sb_ss_1_14",
    "https://www.gregegan.net/",
    "https://www.goodreads.com/book/show/45974.The_Book_of_Disquiet?from_search=true&from_srp=true&qid=Nzki8zbVB7&rank=1",
    "https://www.goodreads.com/search?q=infinite+jest&ref=nav_sb_noss_l_13",
    "https://www.goodreads.com/book/show/4929.Kafka_on_the_Shore?from_search=true&from_srp=true&qid=VKb1dkkRNl&rank=1",
    "https://www.goodreads.com/book/show/298275.Nausea?from_search=true&from_srp=true&qid=kZJtnF96KG&rank=1",
    "https://www.goodreads.com/book/show/49455.Notes_from_Underground?ref=nav_sb_ss_1_16",
    "https://www.gregegan.net/",
    "https://www.goodreads.com/book/show/64341.The_Metamorphosis_of_Prime_Intellect?from_search=true&from_srp=true&qid=tfnf0oUjkF&rank=1",
    "https://www.gregegan.net/",
    "https://www.gregegan.net/",
    "https://www.goodreads.com/book/show/60704817-strange-code?from_search=true&from_srp=true&qid=GWND1c1FsF&rank=1",
    "https://www.goodreads.com/book/show/624122.The_Man_Who_Folded_Himself?from_search=true&from_srp=true&qid=3KMZFqJnIq&rank=1",
    "https://www.goodreads.com/book/show/49552.The_Stranger?ref=nav_sb_ss_1_12",
    "https://www.goodreads.com/book/show/14185.The_Three_Stigmata_of_Palmer_Eldritch?ref=nav_sb_ss_1_10",
    "https://www.goodreads.com/book/show/22590.Ubik?ref=nav_sb_ss_1_4",
  ];

  // Loop through filenames, creating img elements for each
  imageFilenames.forEach((filename, index) => {
    const a = document.createElement("a"); // Create an anchor element
    a.href = links[index]; // Set the href to the corresponding link
    a.target = "_blank"; // Open the link in a new tab

    const img = document.createElement("img");
    img.src = `books/${filename}`; // Path to each image
    img.alt = filename; // Optional: improves accessibility
    img.classList.add("book-thumbnail"); // Add a class for styling
    img.style.cursor = "crosshair"; // Change cursor to pointer on hover

    a.appendChild(img); // Append the image to the anchor
    booksContainer.appendChild(a); // Append the anchor to the books container

    // Observe the image for visibility
    const options = {
      root: null, // Use the viewport as the root
      rootMargin: "0px",
      threshold: 0.9, // Trigger when 90% of the card is visible
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible"); // Show the card
          observer.unobserve(entry.target); // Stop observing once visible
        }
      });
    }, options);

    observer.observe(img); // Observe the current image
  });
});
