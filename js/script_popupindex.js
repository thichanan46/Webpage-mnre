// กดปิด
document.addEventListener("DOMContentLoaded", function () {
    const closeButton = document.querySelector(".close-button-notiindex");
    const popup = document.querySelector(".pop-up-noti");
  
    if (closeButton && popup) {
      closeButton.addEventListener("click", function () {
        popup.style.display = "none";
      });
    }
  });