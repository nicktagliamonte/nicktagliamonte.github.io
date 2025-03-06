const articlesData = [
  {
    projectName: "nicktagliamonte.github.io",
    description:
      "This first project was completed months before I had the idea to do these further information sections, " + 
      "so this is a somewhat distant retrospective on the process and won’t hold as much information as, for " + 
      "example, the game development project (which is a years-long underta...",
    link: "website.html",
  },
  {
    projectName: "School Study Tool",
    description:
      "Note that this is a tiny program that serves a single tiny function adequately, and was written over the " + 
      "course of like 2 hours. This project was not originally planned, and kind of came up organically " + 
      "while I was working on the final which it pertains to - I ju...",
    link: "studyTool.html",
  },
  {
    projectName: "Game Engine",
    description:
    "This is by far the largest project I've ever attempted. It's at a semi-functional state, undergoing testing and " + 
    "expansion as an active process, so this page will be somewhat regularly updated as I optimize and bugfix the game " + 
    "engine (using some test data I've layered on top of the eng...",
    link: "gameEngine.html",
  },{
    projectName: "Markdown Note Taking App",
    description:
    "The process here was simple: I wanted a web app which would just record notes that I wrote, have the option to view " + 
    "those notes formatted in markdown, and give me the option for multiple tabs. Basically the Windows 11 notes app but " + 
    "online and with a markdo...",
    link: "markdownNotes.html",
  },{
    projectName: "In the City",
    description:
    "I'll offer a brief overview of the story, but I don't want to go into exhaustive detail because there is quite a bit " + 
    "of content. Players begin in the northeast, around St. Jeromes (where I went to elementary school. Most of the game " + 
    "occurs across locations fami...",
    link: "game.html",
  },{
    projectName: "Data Structure Library",
    description:
    "A library implementing common (and some uncommon but interesting) data structures in java. The idea here is largely " + 
    "to drill data structures in a way that will hopefully improve performance in technical interviews, in addition to " + 
    "testing with JUnit, which is a prac...",
    link: "library.html",
  },{
    projectName: "Calculator",
    description:
    "A locally runnable GUI application which replicates as closely as possible the TI-30X IIS. Initial thoughts " + 
    "include \"wow, I have no idea what most of these menus do. What on earth is STATVAR?\" and \"wow, " + 
    "python was an awful choice for a language to make this loca...",
    link: "calculator.html",
  }
];

let currentPage = 1;
let articlesPerPage = 5; // Default to 5 articles per page

// Add event listener to update articles per page when dropdown is changed
document.getElementById("articlesPerPage").addEventListener("change", function () {
  articlesPerPage = parseInt(this.value);
  currentPage = 1; // Reset to first page when articles per page change
  renderArticles(articlesData, currentPage, articlesPerPage);
});

function paginateArticles(data, currentPage, articlesPerPage) {
  const startIndex = (currentPage - 1) * articlesPerPage;
  const endIndex = startIndex + articlesPerPage;
  return data.slice(startIndex, endIndex);
}

function renderArticles(data, currentPage, articlesPerPage) {
  const articlesSection = document.getElementById("articles");

  // Clear existing content
  articlesSection.innerHTML = "";

  // Get the current page's articles
  const pageArticles = paginateArticles(data, currentPage, articlesPerPage);

  // Loop through the articles and generate HTML
  pageArticles.forEach((item) => {
    const article = document.createElement("article");

    const header = document.createElement("h2");
    header.innerHTML = `<a href="${item.link}" target="_blank" rel="noopener noreferrer">${item.projectName}</a>`; // Link added

    const description = document.createElement("p");
    description.textContent = item.description;

    const line = document.createElement("hr");

    // Append header and description to the article
    article.appendChild(header);
    article.appendChild(description);
    article.appendChild(line);

    // Append the article to the articles section
    articlesSection.appendChild(article);
  });

  // Render pagination buttons
  renderPagination(data, currentPage, articlesPerPage);
}

function renderPagination(data, currentPage, articlesPerPage) {
  const totalArticles = data.length;
  const totalPages = Math.ceil(totalArticles / articlesPerPage);

  // Get the pagination container
  let pagination = document.getElementById("pagination");
  if (!pagination) {
    pagination = document.createElement("div");
    pagination.id = "pagination";
    document.body.appendChild(pagination);
  }

  pagination.innerHTML = ""; // Clear existing pagination

  if (totalPages <= 1) return; // No pagination if only 1 page

  // Previous Button
  const prevButton = document.createElement("button");
  prevButton.id = "previous";
  prevButton.textContent = "Previous";
  prevButton.disabled = currentPage === 1;
  prevButton.addEventListener("click", function () {
    if (currentPage > 1) {
      currentPage--;
      renderArticles(data, currentPage, articlesPerPage);
    }
  });
  pagination.appendChild(prevButton);

  // Page Numbers
  for (let i = 1; i <= totalPages; i++) {
    const pageButton = document.createElement("button");
    pageButton.id = "pageButton";
    pageButton.textContent = i;
    pageButton.disabled = i === currentPage;
    pageButton.addEventListener("click", function () {
      currentPage = i;
      renderArticles(data, currentPage, articlesPerPage);
    });
    pagination.appendChild(pageButton);
  }

  // Next Button
  const nextButton = document.createElement("button");
  nextButton.id = "next";
  nextButton.textContent = "Next";
  nextButton.disabled = currentPage === totalPages;
  nextButton.addEventListener("click", function () {
    if (currentPage < totalPages) {
      currentPage++;
      renderArticles(data, currentPage, articlesPerPage);
    }
  });
  pagination.appendChild(nextButton);
}

// Populate the Quick Select Dropdown
function populateQuickSelect(data) {
  const quickSelect = document.getElementById("quickSelect");
  quickSelect.innerHTML = '<option value="" disabled selected>Select a project</option>'; // Reset dropdown

  data.forEach((item) => {
    const option = document.createElement("option");
    option.value = item.link; // Use the link as the value
    option.textContent = item.projectName; // Display the project name
    quickSelect.appendChild(option);
  });
}

// Handle Quick Select Logic
document.getElementById("quickSelect").addEventListener("change", function () {
  const selectedLink = this.value;
  if (selectedLink) {
    window.open(selectedLink, "_blank", "noopener,noreferrer"); // Open the link in a new tab
  }
});

// Initialize the Quick Select Dropdown and Render Articles
populateQuickSelect(articlesData);
renderArticles(articlesData, currentPage, articlesPerPage);
