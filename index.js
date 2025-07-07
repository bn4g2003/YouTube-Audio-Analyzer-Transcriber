const ytdl = require('@distube/ytdl-core');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');
require('dotenv').config();

// Cấu hình ffmpeg
ffmpeg.setFfmpegPath(ffmpegPath);

class YouTubeAudioAnalyzer {
    constructor() {
        this.apiKey = process.env.ELEVENLABS_API_KEY;
        if (!this.apiKey) {
            throw new Error('Cần có ELEVENLABS_API_KEY trong file .env');
        }
    }

    /**
     * Tải và chuyển đổi audio từ YouTube sang WAV trong một bước
     * @param {string} url - YouTube URL
     * @param {string} outputPath - Đường dẫn file WAV output
     * @returns {Promise<string>} - Đường dẫn file WAV
     */
    async processYouTubeToWav(url, outputPath) {
        return new Promise((resolve, reject) => {
            console.log('Đang tải và chuyển đổi audio sang WAV...');

            const stream = ytdl(url, {
                filter: 'audioonly',
                quality: 'highestaudio',
            });

            ffmpeg(stream)
                .audioChannels(1) // Mono
                .audioFrequency(16000) // 16kHz
                .toFormat('wav')
                .on('end', () => {
                    console.log(`✅ Đã chuyển đổi thành công sang WAV: ${outputPath}`);
                    resolve(outputPath);
                })
                .on('error', (err) => {
                    console.error('Lỗi trong quá trình xử lý ffmpeg:', err.message);
                    reject(err);
                })
                .save(outputPath);
        });
    }

    /**
     * Gửi file audio đến ElevenLabs API để chuyển thành văn bản
     * @param {string} audioFilePath - Đường dẫn file audio WAV
     * @returns {Promise<string>} - Văn bản đã chuyển đổi
     */
    async speechToText(audioFilePath) {
        try {
            console.log('Đang gửi audio đến ElevenLabs API...');
            const stats = fs.statSync(audioFilePath);
            if (stats.size === 0) {
                throw new Error('File audio rỗng');
            }

            const formData = new FormData();
            formData.append('file', fs.createReadStream(audioFilePath));
            formData.append('model_id', 'scribe_v1');

            const response = await axios.post(
                'https://api.elevenlabs.io/v1/speech-to-text',
                formData,
                {
                    headers: {
                        'Accept': 'application/json',
                        'xi-api-key': this.apiKey,
                        ...formData.getHeaders()
                    },
                    timeout: 120000,
                }
            );

            if (response.data && response.data.text) {
                console.log('✅ Đã chuyển đổi thành công với ElevenLabs');
                return response.data.text;
            } else {
                throw new Error('Không nhận được văn bản từ API ElevenLabs');
            }
        } catch (error) {
            if (error.response) {
                const errorMessage = error.response.data?.detail?.message || JSON.stringify(error.response.data);
                throw new Error(`Lỗi API ElevenLabs: ${error.response.status} - ${errorMessage}`);
            }
            throw error;
        }
    }

    /**
     * Xử lý hoàn chỉnh: Tải YouTube -> WAV -> Văn bản và lưu kết quả
     * @param {string} youtubeUrl - YouTube URL
     * @returns {Promise<{wavPath: string, txtPath: string}>} - Đường dẫn đến các file kết quả
     */
    async processAndSaveAll(youtubeUrl) {
        const outputDir = path.join(__dirname, 'output');
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        const baseName = `result_${Date.now()}`;
        const wavAudioPath = path.join(outputDir, `${baseName}.wav`);
        const txtOutputPath = path.join(outputDir, `${baseName}.txt`);

        try {
            await this.processYouTubeToWav(youtubeUrl, wavAudioPath);
            const text = await this.speechToText(wavAudioPath);
            fs.writeFileSync(txtOutputPath, text, 'utf8');
            console.log(`✅ Đã lưu văn bản vào: ${txtOutputPath}`);
            return { wavPath: wavAudioPath, txtPath: txtOutputPath };
        } catch (error) {
            if (fs.existsSync(wavAudioPath)) {
                fs.unlinkSync(wavAudioPath);
            }
            throw error;
        }
    }
}

// Hàm main để chạy chương trình
async function main() {
    try {
        const analyzer = new YouTubeAudioAnalyzer();
        const youtubeUrl = process.argv[2]; // Lấy URL từ tham số dòng lệnh

        if (!youtubeUrl) {
            console.error('Lỗi: Vui lòng cung cấp YouTube URL.');
            console.error('Ví dụ: node index.js "YOUR_YOUTUBE_URL"');
            process.exit(1); // Thoát nếu không có URL
        }

        console.log(`Bắt đầu xử lý YouTube URL: ${youtubeUrl}`);
        console.log('='.repeat(50));
        
        const results = await analyzer.processAndSaveAll(youtubeUrl);
        
        console.log('='.repeat(50));
        console.log('🎉 XỬ LÝ HOÀN TẤT! 🎉');
        console.log(`File âm thanh đã được lưu tại: ${results.wavPath}`);
        console.log(`File văn bản đã được lưu tại: ${results.txtPath}`);
        console.log('='.repeat(50));
        
    } catch (error) {
        console.error('\n❌ LỖI TỔNG THỂ:', error.message);
        // ### SỬA LỖI Ở ĐÂY ###
        // Đảm bảo chỉ có một 'process'
        process.exit(1); 
    }
}

main();