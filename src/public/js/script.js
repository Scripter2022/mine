const buttonHome = document.getElementsByTagName('button');

const navItems = document.querySelectorAll('.nav-item');
navItems.forEach((item) =>
  item.addEventListener('mouseover', () => {
    document.querySelector('.active').classList.remove('active');
    item.classList.add('active');
  })
);
const body = document.getElementsByTagName('body');
function openForm() {
  document.getElementById('myForm').style.display = 'block';
  document.getElementsByTagName('body').classList.add('blure');
}
function closeForm() {
  document.getElementById('myForm').style.display = 'none';
  event.preventDefault();
}

// function gir() {
//     let nums = document.getElementById('gir').className;
//     if(nums == 'gir_1') {document.getElementById('gir').className='gir_2';}
//     if(nums == 'gir_2') {document.getElementById('gir').className='gir_3';}
//     if(nums == 'gir_3') {document.getElementById('gir').className='gir_1';}
// }
// setInterval(gir, 500);

let o = document.getElementsByTagName('tr');
console.log(o);
