const menu = document.querySelector(".menu-icon");
const menuList = document.querySelector(".menu-list");
menu.addEventListener('click', function(event){
    menuList.classList.toggle("active");
    event.stopPropagation();
})
window.addEventListener('click', ()=>{
    menuList.classList.remove('active');
})

const options = {
  root: null,

  threshold: 1.0
};
const images = document.querySelectorAll(".slide")
function handleImageScroll(){
    for(i=0; i<images.length; i++){
        var position = images[i].getBoundingClientRect();
        var isVisible = position.top < window.innerHeight - 100;
        if(isVisible){
            images[i].classList.add('slide-active');
        }else{
            images[i].classList.remove('slide-active');
        }
    }
}
window.addEventListener('scroll', handleImageScroll);

window.addEventListener("DOMContentLoaded", () => {
const video = document.querySelector(".hero video");
if (video) {
    const playPromise = video.play();
    if (playPromise !== undefined) {
    playPromise.catch(error => {
        console.warn("Autoplay might be blocked on iOS:", error);
    });
    }
}
});
  window.addEventListener("DOMContentLoaded", () => {
    const video = document.getElementById("bg-video");
    if (video) {
      video.play().catch(error => {
        console.warn("iOS autoplay fallback error:", error);
      });
    }
  });
