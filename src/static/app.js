document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";

      // Populate activities list
        Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;

        // Create participants list HTML
        let participantsHTML = '';
        if (details.participants.length > 0) {
          participantsHTML = `
            <div class="participants-section">
              <strong>Participants:</strong>
              <ul class="participants-list">
                ${details.participants.map(p => `<li>${p}</li>`).join('')}
              </ul>
            </div>
          `;
        } else {
          participantsHTML = `<div class="participants-section"><em>No participants yet.</em></div>`;
        }

        activityCard.innerHTML = `
          <h4>${name}</h4>
          <p>${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <p><strong>Availability:</strong> ${spotsLeft} spots left</p>
          ${participantsHTML}
        `;

          // Participants section
          const participantsSection = document.createElement("div");
          participantsSection.className = "participants-section";

          const participantsTitle = document.createElement("strong");
          participantsTitle.textContent = "Participants:";
          participantsSection.appendChild(participantsTitle);

          const participantsList = document.createElement("ul");
          participantsList.className = "participants-list";

          if (details.participants && details.participants.length > 0) {
            details.participants.forEach((participant) => {
              const li = document.createElement("li");
              li.className = "participant-item";
              // Email text
              const emailSpan = document.createElement("span");
              emailSpan.textContent = participant;
              li.appendChild(emailSpan);
              // Delete icon
              const deleteBtn = document.createElement("button");
              deleteBtn.className = "delete-participant-btn";
              deleteBtn.title = "Remove participant";
              deleteBtn.innerHTML = "&#128465;"; // Trash can emoji
              deleteBtn.addEventListener("click", async (e) => {
                e.stopPropagation();
                await unregisterParticipant(name, participant);
              });
              li.appendChild(deleteBtn);
              participantsList.appendChild(li);
            });
          } else {
            const li = document.createElement("li");
            li.textContent = "No participants yet.";
            li.className = "no-participants";
            participantsList.appendChild(li);
          }
          participantsSection.appendChild(participantsList);
          activityCard.appendChild(participantsSection);

        activitiesList.appendChild(activityCard);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

    // Unregister participant function
    async function unregisterParticipant(activity, email) {
      if (!confirm(`Remove ${email} from ${activity}?`)) return;
      try {
        const response = await fetch(
          `/activities/${encodeURIComponent(activity)}/unregister?email=${encodeURIComponent(email)}`,
          { method: "POST" }
        );
        if (response.ok) {
          fetchActivities();
        } else {
          alert("Failed to remove participant.");
        }
      } catch (error) {
        alert("Error removing participant.");
      }
    }
  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Initialize app
  fetchActivities();
});
