const $ = document.querySelector.bind(document)
const $$ = document.querySelectorAll.bind(document)

const PLAYER_STORAGE_KEY = 'QuocNG'

const player = $('.player')
const playlist = $('.playlist')
const cd = $('.cd')
const heading = $('header h2')
const cdThumb = $('.cd-thumb')
const audio = $('#audio')
const playBtn = $('.btn-toggle-play')
const progress = $('#progress')
const nextBtn = $('.btn-next')
const prevBtn = $('.btn-prev')
const randomBtn = $('.btn-random')
const repeatBtn = $('.btn-repeat')


const app = {
    currentIndex : 0,
    isPlaying: false,
    isRandom: false,
    isRepeat: false,
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
    songs: [
        {
            name: 'At My Worst',
            singer: 'Pink Sweat$',
            path: './songs/song1.mp3',
            img: './images/img1.jpg'
        },

        {
            name: 'Someone Like You',
            singer: 'Adele',
            path: './songs/song2.mp3',
            img: './images/img2.jpg'
        },

        {
            name: 'Save Your Tears',
            singer: 'The Weeknd, Ariana Grande',
            path: './songs/song3.mp3',
            img: './images/img3.jpg'
        },

        {
            name: 'We Don\'t Talk Anymore',
            singer: 'Charlie Puth, Selena Gomez',
            path: './songs/song4.mp3',
            img: './images/img4.jpg'
        },

        {
            name: 'Unstoppable',
            singer: 'Sia',
            path: './songs/song5.mp3',
            img: './images/img5.png'
        },

        {
            name: 'Counting Stars',
            singer: 'One Republic',
            path: './songs/song6.mp3',
            img: './images/img6.png'
        },

        {
            name: 'Somebody That I Used To Know',
            singer: 'Gotye, Kimbra',
            path: './songs/song7.mp3',
            img: './images/img7.jpg'
        },

        {
            name: 'Bad Habits',
            singer: 'Ed Sheeran',
            path: './songs/song8.mp3',
            img: './images/img8.jpg'
        },
    ],
    setConfig: function (key, value) {
        this.config[key] = value;
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config))
    },

    render: function () {
        const htmls = this.songs.map((song, index) => {
            return `
            <div class="song ${index === this.currentIndex ? 'active' : ''}" data-index = ${index}>
                <div class="thumb" style="background-image: url('${song.img}')">
                </div>
                
                <div class="body">
                    <h3 class="title">${song.name}</h3>
                    <p class="singer">${song.singer}</p>
                </div>

                <div class="like">
                    <i class="fa-solid fa-heart icon-full"></i>
                    <i class="fa-regular fa-heart"></i>
                    4.5k
                </div>
            </div>
            `
        })
        playlist.innerHTML = htmls.join('');
    },

    //Object.defineProperty() defines a new property directly on an object, or modifies an existing property on an object, and returns the object.
    defineProperties: function () {
        Object.defineProperty(this, 'currentSong', {
            get: function () {
                return this.songs[this.currentIndex]
            }
        })
    },

    // All events will be written in this function
    handleEvent: function () {
        const _this = this
        const cdWidth = cd.offsetWidth

        //CD rotate and stop
        const cdThumbAnimate = cdThumb.animate([
            {transform: 'rotate(360deg)'}
        ], {
            duration: 10000,
            iterations: Infinity
        })

        cdThumbAnimate.pause()

        //When sroll list song cd will zoom out
        document.onscroll = function () {
            const scrollTop = window.scrollY || document.documentElement.scrollTop
            const newCdWidth =  cdWidth - scrollTop

            cd.style.width = newCdWidth > 0 ? newCdWidth  + 'px' : 0
            cd.style.opacity = newCdWidth / cdWidth
        }

        //Handle when clicked play
        playBtn.onclick = function () {
            if(_this.isPlaying) {
                audio.pause()
            } else {
                audio.play()
            }
        }

        //When song is played
        audio.onplay = function () {
            _this.isPlaying = true
            player.classList.add('playing')
            cdThumbAnimate.play()
        }

        //When song is paused
        audio.onpause = function () {
            _this.isPlaying = false
            player.classList.remove('playing')
            cdThumbAnimate.pause()
        }

        //When playback position has changed
        audio.ontimeupdate = function () {
            if(audio.duration) {
                const progressPercent = Math.floor(audio.currentTime / audio.duration * 100)
                progress.value = progressPercent
            }
        }

        //When change slider-thumb
        // FIXED: when change thumb position slowly, the position may be not change immediately
        progress.onchange = function (e) {
            const seekTime = e.target.value * audio.duration / 100
            audio.currentTime = seekTime
        }
        
        // When forward-step song
        nextBtn.onclick = function () {
            if(_this.isRandom) {
                _this.playRandomSong()
            } else {
                _this.nextSong()
            }
            audio.play()
            _this.render()
            _this.srollToActiveSong()

            // FIXED: when forward-step song, can't add 'active' for class song so temporary solution is render song when next, if it's big project shouldn't do it
        }

        // When backward-step song
        prevBtn.onclick = function () {
            if(_this.isRandom) {
                _this.playRandomSong()
            } else {
                _this.prevSong()
            }
            audio.play()
            _this.render()
            _this.srollToActiveSong()

        }

        //When clicked random
        randomBtn.onclick = function (e) {
            _this.isRandom = !_this.isRandom
            _this.setConfig('isRandom', _this.isRandom)
            randomBtn.classList.toggle('active', _this.isRandom)
        }

        //When repeat song
        repeatBtn.onclick = function (e) {
            _this.isRepeat = !_this.isRepeat
            _this.setConfig('isRepeat', _this.isRepeat)
            repeatBtn.classList.toggle('active', _this.isRepeat)

        }

        // Next song when song ended
        audio.onended = function () {
            if(_this.isRepeat) {
                audio.play()
            } else {
                nextBtn.click()
            }
        }

        playlist.onclick = function (e) {
            const songNode = e.target.closest('.song:not(.active)')
            if( songNode || e.target.closest('.like') )  {
                if(songNode) {
                    _this.currentIndex = Number(songNode.dataset.index)
                    _this.loadCurrentSong()
                    _this.render()
                    audio.play()
                }

                if(e.target.closest('.like')) {

                }
            }
        }

    },

    srollToActiveSong: function () {
        setTimeout(() => {
            $('.song.active').scrollIntoView({
                    behavior: "smooth",
                    block: "nearest"
                }
            )
        }, 300)

    // FIXED: when transition current song because dashboard set postion :fixed so it's hidden from view
    },

    loadCurrentSong: function () {
        heading.textContent = this.currentSong.name
        cdThumb.style.backgroundImage = `url('${this.currentSong.img}')`
        audio.src = this.currentSong.path
    },

    loadConfig: function () {
        this.isRandom = this.config.isRandom
        this.isRepeat = this.config.isRepeat
    },

    nextSong: function () {
        this.currentIndex++
        if(this.currentIndex >= this.songs.length) {
            this.currentIndex = 0;
        }
        this.loadCurrentSong()
    },

    prevSong: function () {
        this.currentIndex--
        if(this.currentIndex < 0) {
            this.currentIndex = this.songs.length - 1;
        }
        this.loadCurrentSong()
    },

    playRandomSong: function () {
        let newIndex
        do {
            newIndex = Math.floor((Math.random() * app.songs.length))
        } while (newIndex === this.currentIndex)

        this.currentIndex = newIndex
        this.loadCurrentSong()
        // FIXED: The song's re-appearance rate is still very high
    },
    
    

    start: function () {
        // Assign configuration from local stogare to app
        this.loadConfig()

        // defines properties for obj
        this.defineProperties();

        // Listen and handle  DOM events
        this.handleEvent();

        // Load first song in list song when run app
        this.loadCurrentSong();

        // Render playlist
        this.render();

        // Show status of repeat button and random button
        randomBtn.classList.toggle('active', this.isRandom)
        repeatBtn.classList.toggle('active', this.isRepeat)

    }
}

app.start();