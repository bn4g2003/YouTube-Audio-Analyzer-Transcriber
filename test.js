const YouTubeAudioAnalyzer = require('./index.js');

async function testProgram() {
    try {
        const analyzer = new YouTubeAudioAnalyzer();
        
        // URL YouTube mẫu (thay bằng URL thực tế)
        const testUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
        
        console.log('Đang test chương trình...');
        console.log(`URL test: ${testUrl}`);
        
        const result = await analyzer.processYouTubeToText(testUrl);
        
        console.log('\n✅ Test thành công!');
        console.log('Kết quả:', result);
        
    } catch (error) {
        console.error('❌ Test thất bại:', error.message);
    }
}

// Uncomment dòng dưới để chạy test
// testProgram();
