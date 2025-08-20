// Fetch and load the navbar HTML dynamically
document.addEventListener("DOMContentLoaded", function () {
  fetch('navbar.html') // Fetch the navbar HTML
      .then(response => response.text())
      .then(data => {
          // Insert the navbar HTML into the page
          document.body.insertAdjacentHTML('beforebegin', data);

          // Update navbar links with email and highlight active page
          updateNavLinksWithEmail();
          highlightActivePage();
          updateAuthLink();
      })
      .catch(error => console.error('Error loading the navbar:', error));
});

// Function to get the email from the URL query parameter
function getEmailFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get('email'); // Returns the 'email' query parameter
}

// Function to update all navbar links with the email query parameter
function updateNavLinksWithEmail() {
  const email = getEmailFromUrl();
  if (email) {
      // Select all navbar links
      const navLinks = document.querySelectorAll('#navbar ul li a');
      navLinks.forEach(link => {
          const url = new URL(link.href, window.location.origin);
          url.searchParams.set('email', email); // Append or update the email parameter
          link.href = url.toString(); // Update the href attribute
      });
      console.log('Updated navbar links with email:', email); // Debugging: Ensure links are updated
  } else {
      console.log('No email found in the URL'); // Debugging: Handle cases where email is missing
  }
}

// // Function to highlight the active page in the navbar
// function highlightActivePage() {
//   const currentPage = window.location.pathname.split('/').pop(); // Get the current page name
//   const navLinks = document.querySelectorAll('#navbar ul li a'); // Select all navbar links

//   // Reset all links to remove the 'active' class
//   navLinks.forEach((link) => {
//       link.classList.remove('active'); // Remove 'active' from all links first
//   });

//   // Add 'active' class to the matching link
//   navLinks.forEach((link) => {
//       const linkPage = new URL(link.href, window.location.origin).pathname.split('/').pop(); // Extract the link's page name

//       if (linkPage === currentPage) {
//           link.classList.add('active'); // Add 'active' only to the matching link
//       }
//   });
// }

// Function to highlight the active page in the navbar
function highlightActivePage() {
    const currentPage = window.location.pathname.split('/').pop(); // Get the current page name
    const navLinks = document.querySelectorAll('#navbar ul li a'); // Select all navbar links

    // Define groups of related pages
    const relatedPages = {
        'registerdiet': ['registerdiet.html', 'index2.html'], // All pages under "Diet Plan" section
        // Add more groups as needed, e.g., 'otherSection': ['page1.html', 'page2.html']
    };

    // Reset all links to remove the 'active' class
    navLinks.forEach((link) => {
        link.classList.remove('active'); // Remove 'active' from all links first
    });

    // Add 'active' class to the matching link
    navLinks.forEach((link) => {
        const linkPage = new URL(link.href, window.location.origin).pathname.split('/').pop(); // Extract the link's page name

        // Check if the current page belongs to a related group
        for (const [section, pages] of Object.entries(relatedPages)) {
            if (pages.includes(currentPage) && pages.includes(linkPage)) {
                link.classList.add('active'); // Add 'active' to the related group link
                return;
            }
        }

        // Fallback: Match by exact page name
        if (linkPage === currentPage) {
            link.classList.add('active'); // Add 'active' only to the matching link
        }
    });
}


// Function to update the auth link (e.g., Register/Logout)
function updateAuthLink() {
  const email = getEmailFromUrl();
  const authLink = document.getElementById('auth-link');

  if (authLink) {
      if (email) {
          // Change "Register" to "Logout" if email exists
          authLink.textContent = "Logout";
          authLink.href = "#"; // Prevent default navigation
          authLink.addEventListener('click', function (event) {
              event.preventDefault(); // Prevent default action
              handleLogout(); // Call logout function
          });
      } else {
          // Reset to "Register" if no email is found
          authLink.textContent = "Register";
          authLink.href = "index5.html"; // Link to the registration page
      }
  }
}

// Logout function to clear email and redirect
function handleLogout() {
  const url = new URL(window.location.href);
  url.searchParams.delete('email'); // Remove the 'email' query parameter
  alert("You have been logged out."); // Optional: Show logout confirmation
  window.location.href = url.origin + '/index0.html'; // Redirect to the home page
}
