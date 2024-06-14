function initializeTinyMCE(selector) {
    const tinyMCEElement = document.querySelector(selector)

    if (!tinyMCEElement) {
        return
    }

    // Variable backendData is data provided by backend for rendering
    // See root.pug for the script that defines it
    let initialContent = backendData.blogPost.content || ''
    
    tinymce.init({
        selector: selector,
        resize: false,
        license_key: 'gpl',
        plugins: 'lists link image table code help wordcount codesample',
        menubar: 'file edit view insert table tools help',
        toolbar: 'undo redo | styles | bold italic | alignleft aligncenter alignright alignjustify | numlist bullist | codesample',
        promotion: false,
        skin: 'oxide-dark',
        content_css: 'dark',
        image_file_types: 'jpeg,jpg,png,webp,gif',
        style_formats: [
            { title: 'Headings', items: [
              { title: 'Heading 2', format: 'h2' },
              { title: 'Heading 3', format: 'h3' },
              { title: 'Heading 4', format: 'h4' },
              { title: 'Heading 5', format: 'h5' },
              { title: 'Heading 6', format: 'h6' }
            ]},
            { title: 'Inline', items: [
              { title: 'Bold', format: 'bold' },
              { title: 'Italic', format: 'italic' },
              { title: 'Underline', format: 'underline' },
              { title: 'Strikethrough', format: 'strikethrough' },
              { title: 'Superscript', format: 'superscript' },
              { title: 'Subscript', format: 'subscript' },
              { title: 'Code', format: 'code' }
            ]},
            { title: 'Blocks', items: [
              { title: 'Paragraph', format: 'p' },
              { title: 'Blockquote', format: 'blockquote' },
              { title: 'Div', format: 'div' },
              { title: 'Pre', format: 'pre' }
            ]},
            { title: 'Align', items: [
              { title: 'Left', format: 'alignleft' },
              { title: 'Center', format: 'aligncenter' },
              { title: 'Right', format: 'alignright' },
              { title: 'Justify', format: 'alignjustify' }
            ]}
        ],
        setup: (editor) => {
            editor.on('init', () => {
                editor.setContent(initialContent)
                const preview = document.querySelector('.blog-post-fragment__content')
                preview.innerHTML = editor.getContent()
            })
    
            editor.on('change', () => {
                editor.save()
                const preview = document.querySelector('.blog-post-fragment__content')
                preview.innerHTML = editor.getContent()
            })

            editor.on('submit', () => {
                const wordCountInput = document.getElementById('word-count')
                wordCountInput.value = editor.plugins.wordcount.getCount()
            })
        }
    });
}

export {
    initializeTinyMCE
}