// 頁面加載時讀取預設圖片的EXIF數據
window.onload = function() {
    const img = document.getElementById('preview');
    
    // 確保圖片已經加載
    if (img.complete) {
        loadExifData(img);
    } else {
        img.onload = function() {
            loadExifData(img);
        }
    }
}

// 讀取EXIF數據的函數
function loadExifData(image) {
    EXIF.getData(image, function() {
        const metadata = document.getElementById('metadata');
        const exifData = EXIF.getAllTags(this);
        
        let metadataHTML = '';
        metadataHTML += `
            <div>
                <span>${exifData.Model || '未知'}</span>,
                <span>1/${1/exifData.ExposureTime || '未知'}</span>,
                <span>${exifData.ISOSpeedRatings || '未知'}</span>,
                <span>${exifData.FocalLength || '未知'}mm</span>
            </div>
        `;
        
        metadata.innerHTML = metadataHTML;
    });
}

// 文件上傳處理
document.getElementById('imageInput').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) return;

    // 顯示圖片預覽
    const preview = document.getElementById('preview');
    const reader = new FileReader();
    reader.onload = function(e) {
        preview.src = e.target.result;
        // 在圖片加載完成後讀取 EXIF 數據
        preview.onload = function() {
            loadExifData(preview);
        }
    }
    reader.readAsDataURL(file);
});

// 修改下載功能
document.getElementById('downloadBtn').addEventListener('click', function() {
    // 準備下載用的框架
    const downloadFrame = document.getElementById('downloadFrame');
    const downloadPreview = document.getElementById('downloadPreview');
    const downloadMetadata = document.getElementById('downloadMetadata');
    
    // 複製當前顯示的內容到下載框架
    downloadPreview.src = document.getElementById('preview').src;
    downloadMetadata.innerHTML = document.getElementById('metadata').innerHTML;
    
    // 等待圖片加載完成後再進行轉換
    downloadPreview.onload = function() {
        html2canvas(downloadFrame, {
            scale: 2,
            useCORS: true,
            backgroundColor: '#f7f7f7',
            width: 1080,
            height: 1350,
            imageTimeout: 0,
            logging: true,
            onclone: function(clonedDoc) {
                // 獲取克隆的元素
                const clonedFrame = clonedDoc.querySelector('#downloadFrame');
                const clonedContent = clonedDoc.querySelector('.frame-content');
                const clonedImage = clonedDoc.querySelector('#downloadPreview');
                const clonedMetadataGroup = clonedDoc.querySelector('.metadata-group');
                
                // 設置框架樣式
                if (clonedFrame) {
                    clonedFrame.style.display = 'flex';
                    clonedFrame.style.flexDirection = 'column';
                    clonedFrame.style.justifyContent = 'flex-end';
                    clonedFrame.style.padding = '20px';
                }

                // 設置內容區域樣式
                if (clonedContent) {
                    clonedContent.style.height = '1100px';
                    clonedContent.style.display = 'flex';
                    clonedContent.style.alignItems = 'center';
                    clonedContent.style.justifyContent = 'center';
                }

                // 設置圖片樣式
                if (clonedImage) {
                    clonedImage.style.height = '100%';
                    clonedImage.style.width = 'auto';
                    clonedImage.style.maxWidth = '100%';
                    clonedImage.style.objectFit = 'contain';
                    clonedImage.style.display = 'block';
                    clonedImage.style.margin = '0 auto';
                }

                // 設置元數據組樣式
                if (clonedMetadataGroup) {
                    clonedMetadataGroup.style.display = 'flex';
                    clonedMetadataGroup.style.margin = '0px 145px';
                    clonedMetadataGroup.style.fontSize = '1rem';
                    clonedMetadataGroup.style.alignItems = 'center';
                    clonedMetadataGroup.style.padding = '15px 0px';
                }

                // 設置段落樣式
                const paragraphs = clonedDoc.querySelectorAll('#downloadMetadata p');
                paragraphs.forEach(p => {
                    p.style.margin = '0';
                    p.style.lineHeight = '1.5';
                    p.style.padding = '2px 0';
                });
            }
        }).then(canvas => {
            canvas.toBlob(function(blob) {
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'photo-with-metadata.jpg';
                a.click();
                window.URL.revokeObjectURL(url);
            }, 'image/jpeg', 1.0);
        }).catch(error => {
            console.error('Error during canvas conversion:', error);
        });
    };
}); 