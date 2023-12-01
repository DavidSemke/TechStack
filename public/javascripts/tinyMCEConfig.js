function initializeTinyMCE(selector) {
    const tinyMCEElement = document.querySelector(selector)

    if (!tinyMCEElement) {
        return
    }
    
    tinymce.init({
        selector: selector,
        plugins: 'lists link image table code help wordcount',
        menubar: 'file edit view insert table tools help',
        toolbar: 'undo redo | styles | bold italic | alignleft aligncenter alignright alignjustify | numlist bullist',
        promotion: false,
        setup: (editor) => {
            editor.on('init', () => {
                
                
                // if updating, import html to be updated and setcontent
    
                const preview = document.querySelector('.blog-preview__content')
                preview.innerHTML = editor.getContent()
            })
    
    
            editor.on('change', () => {
                const preview = document.querySelector('.blog-preview__content')
                preview.innerHTML = editor.getContent()
            })
        }
    });
}

export {
    initializeTinyMCE
}