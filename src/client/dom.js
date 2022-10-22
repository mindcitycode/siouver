export const createElement = (tagName, className, textContent, attributes) => {
    const $e = document.createElement(tagName)
    if (className && className.length) {
        if (Array.isArray(className)) {
            $e.classList.add(...className)
        } else {
            $e.classList.add(className)
        }
    }
    if (textContent) $e.textContent = textContent
    if (attributes) Object.entries(attributes).forEach(([k, v]) => $e.setAttribute(k, v))
    return $e
}