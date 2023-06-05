// Function to generate business ID fields
function generateBusinessIdFields(count, container, isOutsideModal) {
  container.innerHTML = "";

  for (let i = 1; i <= count; i++) {
    const inputId = `businessLocationInput${i}`;

    const input = document.createElement("input");
    input.type = "text";
    input.id = inputId;
    input.placeholder = `Business Location ${i}`;
    input.style.margin = "5px";

    if (isOutsideModal) {
      input.className = "businessLocationOutsideModal";
    }

    container.appendChild(input);
  }
}

// Create 4 default business ID inputs
const containerOutsideModal = document.getElementById(
  "businessLocationsContainerOutsideModal"
);
generateBusinessIdFields(4, containerOutsideModal, true);

// Handle "Enter more locations" button click
document
  .getElementById("enterMoreLocationsButton")
  .addEventListener("click", function () {
    const containerInsideModal = document.getElementById(
      "businessLocationsContainerInsideModal"
    );
    generateBusinessIdFields(100, containerInsideModal, false);

    const modal = document.getElementById("businessLocationsModal");
    modal.style.display = "block";
  });

// Handle modal submit button click
document
  .getElementById("modalSubmitButton")
  .addEventListener("click", function () {
    const modal = document.getElementById("businessLocationsModal");
    modal.style.display = "none";
  });

// Close the modal when the 'X' button is clicked
document.getElementById("closeModal").addEventListener("click", function () {
  const modal = document.getElementById("businessLocationsModal");
  modal.style.display = "none";
});

// Add form submit event listener
document
  .getElementById("form")
  .addEventListener("submit", async function (event) {
    event.preventDefault(); // Prevent the default form submission behavior
    const username = document.getElementById("usernameInput").value;
    const password = document.getElementById("passwordInput").value;
    const businessLocationIds = [];

    const outsideModalInputs = document.getElementsByClassName(
      "businessLocationOutsideModal"
    );
    for (const input of outsideModalInputs) {
      if (input.value) {
        businessLocationIds.push(input.value);
      }
    }

    const insideModalInputs = document
      .getElementById("businessLocationsContainerInsideModal")
      .getElementsByTagName("input");
    for (const input of insideModalInputs) {
      if (input.value) {
        businessLocationIds.push(input.value);
      }
    }

    const response = await fetch(
      `/scrape?username=${encodeURIComponent(
        username
      )}&password=${encodeURIComponent(
        password
      )}&businessLocationIds=${encodeURIComponent(
        businessLocationIds.join(",")
      )}`
    );
    if (response.ok) {
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      saveAs(blob, `${username}.xlsx`);
      const downloadButton = document.getElementById("downloadButton");
      downloadButton.href = url;
      downloadButton.download = `${username}.xlsx`;
      downloadButton.style.display = "block";
    } else {
      const message = await response.text();
      alert(message);
    }
  });
