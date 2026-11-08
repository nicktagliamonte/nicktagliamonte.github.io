const root = document.body;
const toggle = document.querySelector(".theme-toggle");
const storedTheme = localStorage.getItem("theme");
const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
if (storedTheme === "dark" || (!storedTheme && prefersDark)) root.classList.add("dark", "dark-mode");
toggle?.addEventListener("click", () => {
  root.classList.toggle("dark");
  root.classList.toggle("dark-mode", root.classList.contains("dark"));
  localStorage.setItem("theme", root.classList.contains("dark") ? "dark" : "light");
});
const year = document.querySelector("#year");
if (year) year.textContent = new Date().getFullYear();
