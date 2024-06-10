window.addEventListener("DOMContentLoaded", event => {
    document.querySelectorAll('svg').forEach(svg => {
        svg.setAttribute('aria-hidden', 'true');
    });
    const getCurrentTheme = () => document.querySelector('html').dataset['theme'] == 'light' ? '当前是浅色' : '当前是深色';
    document.querySelectorAll('#theme-switcher').forEach(a => {
        a.setAttribute('aria-label', '切换主题');
        a.setAttribute('aria-description', getCurrentTheme());
        a.addEventListener('click', function(e) {
            this.setAttribute('aria-description', getCurrentTheme());
        }, null);
    });
    document.querySelectorAll('#back-to-top a').forEach(a => {
        a.setAttribute('aria-label', '返回顶部');
    });
}, {once: true});
