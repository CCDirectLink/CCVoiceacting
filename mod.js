if(!cc)
    throw "No modloder found";

var voiceActing = new function VoiceActing(){
    var modPath;
    var soundsPath = "sounds/";
    
    this.lines = {};

    this.initialize = function(){
        modPath = simplify.getMod('voiceacting').getBaseDirectory();
        soundsPath = modPath.substring(7) + soundsPath; // Removing 'assets/' from soundpath

        this.loadTracks();

        _interceptShowMSG(_handleMessage.bind(this));
    }

    this.loadTracks = function(){
        simplify.resources.loadJSON(modPath + 'fileTable.json', function(files) {
            for(var map in files){
                var tracks = files[map].tracks;
                
                for(var i = 0; i < tracks.length; i++) {
                    var track = tracks[i];
                    if(track.path.indexOf('./') === 0) {
                        track.path = soundsPath + track.path.substring(2);
                    }
                    track.track = _prepareTrack(track.path, track.pauses, _onPause, _onEnd);
                }
            }
            this.lines = files;
        }.bind(this));
    }

    function _handleMessage(message){
        var map = cc.ig.getMapName();
        var id = message.data.langUid;

        if(!this.lines[map])
            return console.warn('Map not found in script: ', map);

        var trackId = this.lines[map].lines[id];

        if(trackId === undefined) //trackId may be 0
            return console.warn('Line not found in script: ', map, id);
        
        if(trackId === -1)
            return;

        var track = this.lines[map].tracks[trackId].track;
        track.play();
    }

    function _onPause(track){
        console.log("pause", track)
    }
    function _onEnd() {
        console.log("end");
    }

    function _interceptShowMSG(callback){
        var original = cc.ig.events.SHOW_MSG.prototype.start;
        cc.ig.events.SHOW_MSG.prototype.start = function(){
            callback.call(voiceActing, this.message);
            return original.apply(this, arguments);
        }
    }

    function _prepareTrack(path, pauses, onPause, onEnd){
        var breaks = pauses || [0];
        var nextBreak = 0;
        var track = new cc.ig.Track(path, breaks[nextBreak++] || 0);
        track.loop = false;
        track[cc.ig.bgm.varNames.endCallback] = function() {
            track.pause();

            var next = breaks[nextBreak++];
            if(next){
                track.pause();
                track[cc.ig.bgm.varNames.loopEnd] = next;
                onPause(track);
            } else if(onEnd){
                track.reset();
                onEnd();
            }
        }
        return track;
    }

    document.body.addEventListener('modsLoaded', this.initialize.bind(this));
}();