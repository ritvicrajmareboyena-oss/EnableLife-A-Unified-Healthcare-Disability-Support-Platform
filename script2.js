function playVideo(videoURL) {
  const videoSection = document.getElementById("video-section");
  const videoPlayer = document.getElementById("exerciseVideo");

  // Set the iframe src to the embed URL
  videoPlayer.src = videoURL;

  // Show video section
  videoSection.classList.remove("hidden");
  videoSection.scrollIntoView({ behavior: "smooth" });
}

function toggleMenu() {
  document.getElementById("navLinks").classList.toggle("show");
}

