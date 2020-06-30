module.exports = {
    port: 3000,
    debug: true,
    host: 'localhost',
    domain: '',
    rtmp_server: {
        rtmp: {
            port: 1935,
            chunk_size: 60000,
            gop_cache: true,
            ping: 60,
            ping_timeout: 30
        },
        http: {
            port: 8888,
            mediaroot: './media',
            allow_origin: '*'
        },
        trans: {
            ffmpeg: 'E:/SSDSofts/ffmpeg/bin/ffmpeg.exe',
            tasks: [{
                    app: 'live',
                    hls: true,
                    hlsFlags: '[hls_time=2:hls_list_size=2:hls_flags=delete_segments]',
                    dash: false,
                    dashFlags: '[f=dash:window_size=3:extra_window_size=5]'
            }]
        }
    },
};