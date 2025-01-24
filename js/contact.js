function sendMail() {
  const firstName = document.getElementById("first-name").value.trim();
  const lastName = document.getElementById("last-name").value.trim();
  const email = document.getElementById("email").value.trim();
  const subject = document.getElementById("subject").value.trim();
  const message = document.getElementById("message").value.trim();

  if (!firstName || !lastName || !email || !subject || !message) {
    alert("All fields must be filled out.");
    return false;
  }

  const mailtoLink = `mailto:ntagliamonte28@gmail.com?subject=${encodeURIComponent(
    subject
  )}&body=${encodeURIComponent(`From: ${firstName} 
        ${lastName}\nEmail: ${email}\n\n${message}`)}`;
  window.location.href = mailtoLink;
  return false;
}
