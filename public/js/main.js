

$(function(){
    if ($('textarea#ta').length) (
        CKEDITOR.replace('ta')
    )
})

$('a.confirmDeletion').on('click', ()=>{
    if (!confirm('comfirm delection'))
    return false;
})

// ClassicEditor
// .create( document.querySelector( '#ta' ) )
// .catch( error => {
//     console.error( error );
// } ); 

if ($("[data-fancybox]").length) {
    $("[data-fancybox]").fancybox();
}

// const fancybox = document.querySelector('.data-fancybox')
// if(fancybox.length){
//     fancybox.forEach(image =>{
//         image.addEventListener('click', e =>{
//             fancybox()
//         })
//     })
// }

// Fancybox.bind('[data-fancybox="gallery"]', {
//     compact: false,
//     idle: false,
  
//     animated: false,
//     showClass: false,
//     hideClass: false,
  
//     dragToClose: false,
//     contentClick: false,
  
//     Images: {
//       // Disable animation from/to thumbnail on start/close
//       zoom: false,
//     },
  
//     Toolbar: {
//       display: {
//         left: [],
//         middle: ['infobar'],
//         right: ['close'],
//       },
//     },
  
//     Thumbs: {
//       type: 'classic',
//     },
//   });