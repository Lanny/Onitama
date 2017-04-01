;(function() {
  function wrap() {
    const LOAD_TIMEOUT = 10,
      sounds = [
        'move_01',
        'move_02',
        'move_03',
        'move_04',
        'move_05'
      ];

    function AudioManager() {
      this._sounds = {};
      this.load();
    }

    AudioManager.prototype = {
      getSoundUrl(soundName) {
        return `/static/mp3/${soundName}.mp3`;
      },
      load() {
        return new Promise((resolve, reject) => {
          var numLoaded = 0;

          for (let i=0; i<sounds.length; i++) {
            let soundName = sounds[i],
              audioElement = new Audio(this.getSoundUrl(sounds[i]));

            audioElement.addEventListener('canplaythrough', () => {
              this._sounds[soundName] = audioElement;

              if (++numLoaded === sounds.length) {
                resolve(this);
              }
            });
          }

          setTimeout(() => {
            console.warn(`Only ${numLoaded} of ${sounds.length} audio files loaded after timeout out ${LOAD_TIMEOUT} seconds. AudioManager loading failed.`);
            reject(this);
          }, LOAD_TIMEOUT * 1000);
        });
      },
      playSound(soundName) {
        var sound = this._sounds[soundName];

        if (!sound) {
          console.log(this._sounds);
          throw new Error(`Sound ${soundName} not loaded!`);
        }

        sound.play();
        return sound;
      },
      playMoveSound() {
        var num = ~~(Math.random() * 5 + 1);
        return this.playSound('move_0' + num);
      }
    };

    return AudioManager;
  };

  define([], wrap);
})();
