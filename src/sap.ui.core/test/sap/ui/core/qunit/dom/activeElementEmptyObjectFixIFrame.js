var input = document.querySelector('input');
input.focus();
input.parentNode.removeChild(input);
window.inputRemoved = true;
window.savedActiveElement = document.activeElement;