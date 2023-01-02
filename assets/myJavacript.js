const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);
const cd = $(".cd");

const PLAYER_STORAGE_KEY = 'F8_PLAYER';

const heading = $('header h2');
const cdThumb = $('.cd-thumb'); //ảnh
const audio = $('#audio');
const playBtn = $('.btn-toggle-play');
const player = $('.player');
const progress = $('#progress');
const nextBtn = $('.btn-next');
const prevBtn = $('.btn-prev');
const randomBtn = $('.btn-random');
const repeatBtn = $('.btn-repeat');
const playlist = $('.playlist');

const app = {

    currentIndex: 0,
    isPlaying: false,
    isRandom: false,
    isRepeat: false,
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
    songs: [
        {
            name: 'Anh yêu vội thế',
            singer: 'LaLa Trần',
            path: './assets/music/anhyeuvoithe.mp3',
            image:'./assets/img/song1.jpg'
        },
        {
            name: 'Ai chung tình được mãi',
            singer: 'Đinh Tùng Huy, ACV',
            path: './assets/music/aichungtinhduocmai.mp3',
            image:'./assets/img/song2.jpg'
        },
        {
            name: 'Đào nương',
            singer: 'Hoàng Vương',
            path: './assets/music/daonuong.mp3',
            image:'./assets/img/song3.jpg'
        },
        {
            name: 'Lỡ yêu người đậm sâu',
            singer: 'ZIN MEDIA, Linh Hương Luz',
            path: './assets/music/loyeunguoidamsau.mp3',
            image:'./assets/img/song4.jpg'
        },
        {
            name: 'Em là con thuyền cô đơn',
            singer: 'Thái Học',
            path: './assets/music/emlaconthuyencodon.mp3',
            image:'./assets/img/song6.jpg'
        },
        {
            name: 'Xem như anh chẳng may',
            singer: 'Chu Thúy Quỳnh',
            path: './assets/music/xemnhuanhchangmay.mp3',
            image:'./assets/img/song5.jpg'
        },
    ],

    setConfig: function(key, value) {
        this.config[key] = value;
        localStorage.setItem(PLAYER_STORAGE_KEY,JSON.stringify(this.config));
    },
    

    render: function(){
        const htmls = this.songs.map(function(song, index){
            return `
            <div class="song ${index === app.currentIndex ? 'active' :''}" data-index="${index}">
                <div class="thumb" style="background-image: url('${song.image}')">
                </div>
                <div class="body">
                <h3 class="title">${song.name}</h3>
                <p class="author">${song.singer}</p>
                </div>
                <div class="option">
                <i class="fas fa-ellipsis-h"></i>
                </div>
            </div>
            `
        })
        playlist.innerHTML =htmls.join('\n');
    },

    defineProperties: function(){
        Object.defineProperty(this, 'currentSong', {
            get: function(){
                return this.songs[this.currentIndex]
            }
        });
    },


    handleEvents: function(){
        const cdWidth = cd.offsetWidth;
        const _this = this;

        // Xử lý CD quay, dừng
        const cdThumbAnimate = cdThumb.animate([
            {
                transform: 'rotate(360deg)'
            }
        ],{
            duration:10000, //quay trong 10 giây
            iterations: Infinity //lặp lại vô hạn
        })
        cdThumbAnimate.pause();

        // Phóng to thu nhỏ CD
        document.onscroll = function(){
            const scrollTop =  window.scrollY || document.documentElement.scrollTop;
            const newCdWidth = cdWidth - scrollTop;
            cd.style.width = newCdWidth > 0 ? newCdWidth + "px" : 0;
            cd.style.opacity = newCdWidth / cdWidth;
        }

        // Xử lý khi click btn Play 
        playBtn.onclick = function(){
            if(_this.isPlaying){
                audio.pause();
            }
           else{ 
                audio.play();
           }
        }

        // Khi bài hát được play
        audio.onplay = function(){
            _this.isPlaying = true;
            player.classList.add("playing");
            cdThumbAnimate.play()
        }

        // khi bài hát bị pause
        audio.onpause = function(){
            _this.isPlaying = false;
            player.classList.remove("playing");
            cdThumbAnimate.pause();
        }

        // Khi tiến độ bài hát thay đổi, duration: thời lượng bài hát
        audio.ontimeupdate = function(){
            if(audio.duration){
                const progressPercentage = Math.floor(audio.currentTime / audio.duration *100);
                progress.value = progressPercentage
            }
        }


        // Xử lý khi tour bài hát
        progress.onchange = function(e){
            const seekTime = audio.duration /100 * e.target.value;
            audio.currentTime = seekTime;
        }

        nextBtn.onclick = function(){
            if(_this.isRandom){
                _this.playRandomSong();
            }else{
                _this.nextSong();
            }
            audio.play();
            _this.render();
            _this.scrollToActiveSong()
        }

        prevBtn.onclick = function(){
            if(_this.isRandom){
                _this.playRandomSong();
            }else{
                _this.prevSong();
            }
            audio.play();
            _this.render();
            _this.scrollToActiveSong()

        }

        // bật/tắt random song
        randomBtn.onclick = function(e){
            _this.isRandom = !_this.isRandom;
            _this.setConfig('isRandom', _this.isRandom);
            randomBtn.classList.toggle('active', _this.isRandom);

        }


        // xử lý lặp lại mọt bài hát
        repeatBtn.onclick = function(e){
            _this.isRepeat = !_this.isRepeat;
            _this.setConfig('isRepeat', _this.isRepeat);
            repeatBtn.classList.toggle("active",_this.isRepeat);
        }

        // xử lý nextSong khi audio ended
        audio.onended = function(){
            if(_this.isRepeat){
                audio.play();
            }else{
                nextBtn.click();
            }
        }

        // lắng nghe click vào playlist
        playlist.onclick = function(e){
            const songNode = e.target.closest('.song:not(.active)');
            //xử lý khi click vào song
            if(songNode || e.target.closest('option')){
                if(songNode){
                    _this.currentIndex = Number(songNode.dataset.index);
                    _this.loadCurrentSong();
                    _this.render();
                    audio.play();

                }
            }
        }
    },

    scrollToActiveSong: function(){
        const songActive = $('.song.active')
        setTimeout(() => {
            songActive.scrollIntoView({
                behavior:'smooth',
                block:'nearest',
            })
        },500)
    },

    loadCurrentSong: function(){

        heading.textContent = this.currentSong.name;
        cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`
        audio.src = this.currentSong.path;

    },

    loadConfig: function(){
        app.isRandom = this.config.isRandom
        app.isRepeat= this.config.isRepeat
    },

    // chuyển bài hát
    nextSong: function(){
        this.currentIndex++;
        if(this.currentIndex >= this.songs.length){
            app.currentIndex = 0;
        }
        this.loadCurrentSong();
    },

    prevSong: function(){
        this.currentIndex--;
        if(this.currentIndex < 0){
            _this.currentIndex = this.songs.length - 1;
        }
        this.loadCurrentSong();
    },

    playRandomSong: function(){
        let newIndex;
        do{
            newIndex = Math.floor(Math.random() * this.songs.length);
        }while(newIndex === this.currentIndex)

        app.currentIndex = newIndex;
        this.loadCurrentSong();
    },


    start: function(){

        // gán cấu hình từ config vào object(app)
        this.loadConfig();
        // Định nghĩa các thuộc tính cho Object 
        this.defineProperties();

        // lắng nghe và xử lý các sự kiện
        this.handleEvents();

        // Tải thông tin bài hát đầu tiên khi chạy ứng dụng
        this.loadCurrentSong();

        // render playlist
        this.render();


        //hiển thị trạng thái ban đầu của btn repeat và random
        randomBtn.classList.toggle('active', app.isRandom);
        repeatBtn.classList.toggle('active', app.isRepeat);

    }
}
app.start()

// 57:50s