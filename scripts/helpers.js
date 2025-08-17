export const toggleFormButtonState = (button, isLoading, originalText) => {
    if (isLoading) {
        button.disabled = true;
        button.textContent = 'Cargando...';
    } else {
        button.disabled = false;
        button.textContent = originalText;
    }
};