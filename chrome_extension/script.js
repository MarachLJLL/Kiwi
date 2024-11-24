//document.querySelector('button').onclick = function (e) {
//    alert("Hello World!");
//}

const inputBox = document.getElementById('dietary-restrictions');
const saveButton = document.getElementById('save-button');

saveButton.addEventListener('click', function () {
    // if the button is clicked, update the button text
    saveButton.textContent = 'Saved';
    saveButton.classList.add('saved');
});

inputBox.addEventListener('input', function () {
    // remove "saved" if the input has been changed
    saveButton.textContent = 'Save';
    saveButton.classList.remove('saved');
});

document.getElementById('toggle-switch').addEventListener('change', function () {
    const toggleLabels = document.querySelectorAll('.toggle-label');
    toggleLabels[0].style.color = this.checked ? '#ccc' : '#36440f';
    toggleLabels[1].style.color = this.checked ? '#36440f' : '#ccc';
  });