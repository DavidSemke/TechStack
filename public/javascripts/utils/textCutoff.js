function filterEllipses() {
    const ellipsesElements = document.querySelectorAll(
        '.-ellipsis'
    )

    for (const el of ellipsesElements) {
        if (el.scrollHeight <= el.clientHeight) {
            el.classList.remove('-ellipsis');
        }
    }
}

export {
    filterEllipses
}