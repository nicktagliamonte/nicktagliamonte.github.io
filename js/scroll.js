document.querySelectorAll('.projects-header a').forEach(link => {
    link.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        const targetSection = document.querySelector(targetId);
        const navHeight = document.querySelector('.navigation').offsetHeight;
        const projHeight = document.querySelector('.projects-header').offsetHeight;
        const targetPosition = targetSection.getBoundingClientRect().top + window.scrollY - navHeight - projHeight;

        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });
    });
});